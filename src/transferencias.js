const { calcularComision, TARIFAS } = require('./comisiones');

// Límite por transacción según el tipo de cuenta, en centavos.
const LIMITES = Object.freeze({
  AHORRO: 1_000_000,
  MONETARIA: 5_000_000,
  EMPRESARIAL: 50_000_000,
});

const MONEDAS = Object.freeze(['GTQ', 'USD']);
const CANALES = Object.freeze(['WEB', 'MOVIL', 'API']);
const AUTENTICACIONES = Object.freeze(['CONTRASENA_OTP', 'BIOMETRIA']);

// A partir de este monto (exclusivo) se exige autenticación reforzada.
const UMBRAL_MONTO_ALTO = 1_000_000;

const esEnteroPositivo = (valor) => Number.isInteger(valor) && valor > 0;

function catalogosValidos(s) {
  return (
    Object.hasOwn(LIMITES, s.tipoCuenta) &&
    Object.hasOwn(TARIFAS, s.tipoDestino) &&
    MONEDAS.includes(s.moneda) &&
    CANALES.includes(s.canal) &&
    AUTENTICACIONES.includes(s.autenticacion) &&
    Number.isInteger(s.saldo) &&
    s.saldo >= 0
  );
}

// Reglas de rechazo, en orden de evaluación. La primera que se cumple define el motivo.
const REGLAS_DE_RECHAZO = [
  { motivo: 'DATOS_INVALIDOS', aplica: (s) => !catalogosValidos(s) },
  { motivo: 'MONTO_INVALIDO', aplica: (s) => !esEnteroPositivo(s.monto) },
  {
    motivo: 'CANAL_NO_PERMITIDO',
    aplica: (s) => s.canal === 'API' && s.tipoCuenta !== 'EMPRESARIAL',
  },
  {
    motivo: 'MONEDA_NO_PERMITIDA',
    aplica: (s) => s.tipoDestino === 'INTERNACIONAL' && s.moneda !== 'USD',
  },
  { motivo: 'LIMITE_EXCEDIDO', aplica: (s) => s.monto > LIMITES[s.tipoCuenta] },
  {
    motivo: 'SALDO_INSUFICIENTE',
    aplica: (s) => s.monto + calcularComision(s.monto, s.tipoDestino) > s.saldo,
  },
];

const resultado = (estado, motivo, comision = 0, totalDebitado = 0) => ({
  estado,
  motivo,
  comision,
  totalDebitado,
});

/**
 * Evalúa una solicitud de transferencia y decide si se aprueba, se rechaza
 * o requiere una verificación adicional. Los montos van en centavos.
 * @param {object} solicitud tipoCuenta, moneda, canal, monto, tipoDestino, autenticacion y saldo.
 * @returns {{estado: string, motivo: string|null, comision: number, totalDebitado: number}}
 */
function evaluarTransferencia(solicitud) {
  if (solicitud === null || typeof solicitud !== 'object') {
    return resultado('RECHAZADA', 'DATOS_INVALIDOS');
  }

  const rechazo = REGLAS_DE_RECHAZO.find((regla) => regla.aplica(solicitud));
  if (rechazo) {
    return resultado('RECHAZADA', rechazo.motivo);
  }

  const { monto, tipoDestino, autenticacion } = solicitud;
  if (monto > UMBRAL_MONTO_ALTO && autenticacion !== 'BIOMETRIA') {
    return resultado('REQUIERE_VERIFICACION', 'AUTENTICACION_REFORZADA');
  }

  const comision = calcularComision(monto, tipoDestino);
  return resultado('APROBADA', null, comision, monto + comision);
}

module.exports = { evaluarTransferencia, LIMITES, UMBRAL_MONTO_ALTO };
