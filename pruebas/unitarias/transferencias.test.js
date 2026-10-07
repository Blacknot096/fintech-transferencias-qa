const { evaluarTransferencia } = require('../../src/transferencias');

// Solicitud válida de referencia: cada prueba modifica únicamente el dato que le interesa.
const solicitud = (cambios = {}) => ({
  tipoCuenta: 'MONETARIA',
  moneda: 'GTQ',
  canal: 'WEB',
  monto: 100_000,
  tipoDestino: 'MISMO_BANCO',
  autenticacion: 'CONTRASENA_OTP',
  saldo: 10_000_000,
  ...cambios,
});

describe('evaluarTransferencia', () => {
  describe('aprobación', () => {
    test('aprueba una transferencia válida al mismo banco sin comisión', () => {
      expect(evaluarTransferencia(solicitud())).toEqual({
        estado: 'APROBADA',
        motivo: null,
        comision: 0,
        totalDebitado: 100_000,
      });
    });

    test('suma la comisión al total debitado en una transferencia interbancaria', () => {
      const resultado = evaluarTransferencia(solicitud({ tipoDestino: 'INTERBANCARIA' }));

      expect(resultado).toEqual({
        estado: 'APROBADA',
        motivo: null,
        comision: 500,
        totalDebitado: 100_500,
      });
    });

    test('aprueba cuando el saldo cubre exactamente el monto más la comisión', () => {
      const resultado = evaluarTransferencia(
        solicitud({ tipoDestino: 'INTERBANCARIA', saldo: 100_500 }),
      );

      expect(resultado.estado).toBe('APROBADA');
    });
  });

  describe('validación de datos', () => {
    test.each([0, -1, 99.5, '100', null])('rechaza el monto inválido %p', (monto) => {
      expect(evaluarTransferencia(solicitud({ monto }))).toMatchObject({
        estado: 'RECHAZADA',
        motivo: 'MONTO_INVALIDO',
      });
    });

    test.each([
      ['tipoCuenta', 'PLAZO_FIJO'],
      ['moneda', 'EUR'],
      ['canal', 'CAJERO'],
      ['tipoDestino', 'CRIPTO'],
      ['autenticacion', 'NINGUNA'],
      ['saldo', -1],
    ])('rechaza un valor no soportado en %s', (campo, valor) => {
      expect(evaluarTransferencia(solicitud({ [campo]: valor }))).toMatchObject({
        estado: 'RECHAZADA',
        motivo: 'DATOS_INVALIDOS',
      });
    });

    test('rechaza una solicitud que no es un objeto', () => {
      expect(evaluarTransferencia(undefined)).toMatchObject({
        estado: 'RECHAZADA',
        motivo: 'DATOS_INVALIDOS',
      });
    });

    test('una solicitud rechazada no debita ni cobra comisión', () => {
      expect(evaluarTransferencia(solicitud({ monto: 0 }))).toMatchObject({
        comision: 0,
        totalDebitado: 0,
      });
    });
  });

  describe('reglas de negocio', () => {
    test('el canal API solo está permitido para cuentas empresariales', () => {
      expect(evaluarTransferencia(solicitud({ canal: 'API' }))).toMatchObject({
        estado: 'RECHAZADA',
        motivo: 'CANAL_NO_PERMITIDO',
      });
      expect(
        evaluarTransferencia(solicitud({ canal: 'API', tipoCuenta: 'EMPRESARIAL' })).estado,
      ).toBe('APROBADA');
    });

    test('las transferencias internacionales solo se permiten en USD', () => {
      expect(evaluarTransferencia(solicitud({ tipoDestino: 'INTERNACIONAL' }))).toMatchObject({
        estado: 'RECHAZADA',
        motivo: 'MONEDA_NO_PERMITIDA',
      });
      expect(
        evaluarTransferencia(solicitud({ tipoDestino: 'INTERNACIONAL', moneda: 'USD' })),
      ).toMatchObject({ estado: 'APROBADA', comision: 5_000 });
    });

    test.each([
      ['AHORRO', 1_000_000],
      ['MONETARIA', 5_000_000],
      ['EMPRESARIAL', 50_000_000],
    ])('la cuenta %s acepta hasta su límite y rechaza un centavo más', (tipoCuenta, limite) => {
      const base = { tipoCuenta, autenticacion: 'BIOMETRIA', saldo: 100_000_000 };

      expect(evaluarTransferencia(solicitud({ ...base, monto: limite })).estado).toBe('APROBADA');
      expect(evaluarTransferencia(solicitud({ ...base, monto: limite + 1 }))).toMatchObject({
        estado: 'RECHAZADA',
        motivo: 'LIMITE_EXCEDIDO',
      });
    });

    test('rechaza cuando el saldo no cubre el monto más la comisión', () => {
      const resultado = evaluarTransferencia(
        solicitud({ tipoDestino: 'INTERBANCARIA', saldo: 100_499 }),
      );

      expect(resultado).toMatchObject({ estado: 'RECHAZADA', motivo: 'SALDO_INSUFICIENTE' });
    });

    test('un monto mayor a Q10,000.00 con contraseña y OTP requiere verificación adicional', () => {
      const resultado = evaluarTransferencia(solicitud({ monto: 1_000_001 }));

      expect(resultado).toEqual({
        estado: 'REQUIERE_VERIFICACION',
        motivo: 'AUTENTICACION_REFORZADA',
        comision: 0,
        totalDebitado: 0,
      });
    });

    test('un monto mayor a Q10,000.00 con biometría se aprueba directamente', () => {
      const resultado = evaluarTransferencia(
        solicitud({ monto: 1_000_001, autenticacion: 'BIOMETRIA' }),
      );

      expect(resultado.estado).toBe('APROBADA');
    });

    test('un monto de exactamente Q10,000.00 no requiere verificación adicional', () => {
      expect(evaluarTransferencia(solicitud({ monto: 1_000_000 })).estado).toBe('APROBADA');
    });
  });
});
