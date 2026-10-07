const { generarCasos, paresSinCubrir, totalCombinaciones } = require('../../herramientas/pairwise');

const FACTORES = {
  navegador: ['Chrome', 'Firefox', 'Safari'],
  sistema: ['Windows', 'macOS'],
  idioma: ['es', 'en'],
};

describe('pairwise', () => {
  test('totalCombinaciones calcula el producto cartesiano', () => {
    expect(totalCombinaciones(FACTORES)).toBe(12);
  });

  test('los casos generados cubren todos los pares de valores', () => {
    const casos = generarCasos(FACTORES);

    expect(paresSinCubrir(FACTORES, casos)).toEqual([]);
  });

  test('genera menos casos que el producto cartesiano', () => {
    const casos = generarCasos(FACTORES);

    expect(casos.length).toBeLessThan(totalCombinaciones(FACTORES));
    expect(casos.length).toBeGreaterThanOrEqual(6);
  });

  test('cada caso asigna un valor válido a cada factor', () => {
    for (const caso of generarCasos(FACTORES)) {
      expect(Object.keys(caso)).toEqual(Object.keys(FACTORES));
      for (const [factor, valor] of Object.entries(caso)) {
        expect(FACTORES[factor]).toContain(valor);
      }
    }
  });

  test('la generación es determinista', () => {
    expect(generarCasos(FACTORES)).toEqual(generarCasos(FACTORES));
  });

  test('paresSinCubrir detecta los pares que faltan', () => {
    const casos = [{ navegador: 'Chrome', sistema: 'Windows', idioma: 'es' }];

    const faltantes = paresSinCubrir(FACTORES, casos);

    expect(faltantes).toContainEqual({ navegador: 'Firefox', sistema: 'macOS' });
    expect(faltantes).not.toContainEqual({ navegador: 'Chrome', sistema: 'Windows' });
  });

  test('exige al menos dos factores', () => {
    expect(() => generarCasos({ unico: ['a', 'b'] })).toThrow('Se requieren al menos dos factores');
  });
});
