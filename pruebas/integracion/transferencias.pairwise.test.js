const { evaluarTransferencia } = require('../../src/transferencias');
const { generarCasos, paresSinCubrir } = require('../../herramientas/pairwise');
const { FACTORES_TRANSFERENCIA } = require('../../herramientas/factores');
const { CASOS_PAIRWISE, MONTO_POR_RANGO } = require('./casos-pairwise');

const SALDO_SUFICIENTE = 100_000_000;

const aSolicitud = ({ rangoMonto, ...resto }) => ({
  ...resto,
  monto: MONTO_POR_RANGO[rangoMonto],
  saldo: SALDO_SUFICIENTE,
});

describe('transferencias: casos pairwise', () => {
  test('la tabla de casos cubre todos los pares de valores de los factores', () => {
    const combinaciones = CASOS_PAIRWISE.map((c) => c.factores);

    expect(paresSinCubrir(FACTORES_TRANSFERENCIA, combinaciones)).toEqual([]);
  });

  test('la tabla de casos coincide con la salida del generador', () => {
    expect(CASOS_PAIRWISE.map((c) => c.factores)).toEqual(generarCasos(FACTORES_TRANSFERENCIA));
  });

  test.each(CASOS_PAIRWISE)('$id produce el resultado esperado', ({ factores, esperado }) => {
    expect(evaluarTransferencia(aSolicitud(factores))).toEqual(esperado);
  });
});
