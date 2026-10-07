// Casos pairwise de la transferencia de fondos (ver `npm run pairwise`).
// El resultado esperado de cada caso se derivó manualmente de las reglas de negocio.

// Valor representativo de cada clase de equivalencia de monto, en centavos.
const MONTO_POR_RANGO = Object.freeze({
  BAJO: 50_000, // Q500.00
  MEDIO: 500_000, // Q5,000.00
  ALTO: 2_500_000, // Q25,000.00
});

const aprobada = (comision, totalDebitado) => ({
  estado: 'APROBADA',
  motivo: null,
  comision,
  totalDebitado,
});
const rechazada = (motivo) => ({ estado: 'RECHAZADA', motivo, comision: 0, totalDebitado: 0 });
const verificacion = () => ({
  estado: 'REQUIERE_VERIFICACION',
  motivo: 'AUTENTICACION_REFORZADA',
  comision: 0,
  totalDebitado: 0,
});

const caso = (id, valores, esperado) => {
  const [tipoCuenta, moneda, canal, rangoMonto, tipoDestino, autenticacion] = valores;
  return {
    id,
    factores: { tipoCuenta, moneda, canal, rangoMonto, tipoDestino, autenticacion },
    esperado,
  };
};

const OTP = 'CONTRASENA_OTP';
const BIO = 'BIOMETRIA';

const CASOS_PAIRWISE = [
  caso('PW-01', ['AHORRO', 'GTQ', 'WEB', 'BAJO', 'MISMO_BANCO', OTP], aprobada(0, 50_000)),
  caso(
    'PW-02',
    ['AHORRO', 'USD', 'MOVIL', 'MEDIO', 'INTERBANCARIA', BIO],
    aprobada(2_500, 502_500),
  ),
  caso(
    'PW-03',
    ['MONETARIA', 'GTQ', 'MOVIL', 'ALTO', 'INTERNACIONAL', OTP],
    rechazada('MONEDA_NO_PERMITIDA'),
  ),
  caso('PW-04', ['MONETARIA', 'USD', 'WEB', 'BAJO', 'INTERBANCARIA', BIO], aprobada(500, 50_500)),
  caso('PW-05', ['EMPRESARIAL', 'GTQ', 'API', 'MEDIO', 'MISMO_BANCO', BIO], aprobada(0, 500_000)),
  caso('PW-06', ['EMPRESARIAL', 'USD', 'WEB', 'ALTO', 'INTERNACIONAL', OTP], verificacion()),
  caso(
    'PW-07',
    ['AHORRO', 'USD', 'API', 'ALTO', 'MISMO_BANCO', OTP],
    rechazada('CANAL_NO_PERMITIDO'),
  ),
  caso(
    'PW-08',
    ['MONETARIA', 'GTQ', 'API', 'BAJO', 'INTERBANCARIA', OTP],
    rechazada('CANAL_NO_PERMITIDO'),
  ),
  caso('PW-09', ['EMPRESARIAL', 'GTQ', 'MOVIL', 'BAJO', 'MISMO_BANCO', OTP], aprobada(0, 50_000)),
  caso('PW-10', ['MONETARIA', 'GTQ', 'WEB', 'MEDIO', 'MISMO_BANCO', OTP], aprobada(0, 500_000)),
  caso(
    'PW-11',
    ['AHORRO', 'GTQ', 'API', 'BAJO', 'INTERNACIONAL', BIO],
    rechazada('CANAL_NO_PERMITIDO'),
  ),
  caso(
    'PW-12',
    ['EMPRESARIAL', 'GTQ', 'WEB', 'ALTO', 'INTERBANCARIA', BIO],
    aprobada(12_500, 2_512_500),
  ),
  caso(
    'PW-13',
    ['AHORRO', 'GTQ', 'WEB', 'MEDIO', 'INTERNACIONAL', OTP],
    rechazada('MONEDA_NO_PERMITIDA'),
  ),
];

module.exports = { CASOS_PAIRWISE, MONTO_POR_RANGO };
