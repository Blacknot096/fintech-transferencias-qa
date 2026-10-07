// Factores y valores de la funcionalidad "Transferencia de fondos".
// El rango de monto es una clase de equivalencia; el valor concreto se elige al diseñar el caso.
const FACTORES_TRANSFERENCIA = Object.freeze({
  tipoCuenta: ['AHORRO', 'MONETARIA', 'EMPRESARIAL'],
  moneda: ['GTQ', 'USD'],
  canal: ['WEB', 'MOVIL', 'API'],
  rangoMonto: ['BAJO', 'MEDIO', 'ALTO'],
  tipoDestino: ['MISMO_BANCO', 'INTERBANCARIA', 'INTERNACIONAL'],
  autenticacion: ['CONTRASENA_OTP', 'BIOMETRIA'],
});

module.exports = { FACTORES_TRANSFERENCIA };
