// Generador de casos de prueba por pares (pairwise / all-pairs).
// Garantiza que cada par de valores de dos factores distintos aparezca en al menos un caso.

const clave = (f1, v1, f2, v2) => `${f1}=${v1}|${f2}=${v2}`;

function totalCombinaciones(factores) {
  return Object.values(factores).reduce((total, valores) => total * valores.length, 1);
}

// Lista todos los pares {factorA: valor, factorB: valor} que deben cubrirse.
function todosLosPares(factores) {
  const nombres = Object.keys(factores);
  return nombres.flatMap((f1, i) =>
    nombres
      .slice(i + 1)
      .flatMap((f2) =>
        factores[f1].flatMap((v1) => factores[f2].map((v2) => ({ [f1]: v1, [f2]: v2 }))),
      ),
  );
}

const claveDePar = (par) => {
  const [[f1, v1], [f2, v2]] = Object.entries(par);
  return clave(f1, v1, f2, v2);
};

const cubre = (caso, par) => Object.entries(par).every(([factor, valor]) => caso[factor] === valor);

function paresSinCubrir(factores, casos) {
  return todosLosPares(factores).filter((par) => !casos.some((caso) => cubre(caso, par)));
}

// Cuenta cuántos pares pendientes cubriría asignar `valor` a `factor` en el caso parcial.
function ganancia(parcial, factor, valor, pendientes) {
  return Object.entries(parcial).filter(
    ([otro, valorOtro]) =>
      pendientes.has(clave(otro, valorOtro, factor, valor)) ||
      pendientes.has(clave(factor, valor, otro, valorOtro)),
  ).length;
}

// Elige el valor que cubre más pares pendientes (ante un empate gana el primero).
function mejorValor(parcial, factor, valores, pendientes) {
  let mejor = valores[0];
  let mejorGanancia = -1;
  for (const valor of valores) {
    const g = ganancia(parcial, factor, valor, pendientes);
    if (g > mejorGanancia) {
      mejor = valor;
      mejorGanancia = g;
    }
  }
  return mejor;
}

// Completa un caso a partir de un par semilla, factor por factor.
function construirCaso(factores, semilla, pendientes) {
  const parcial = { ...semilla };
  for (const [factor, valores] of Object.entries(factores)) {
    if (!(factor in parcial)) {
      parcial[factor] = mejorValor(parcial, factor, valores, pendientes);
    }
  }
  // Se devuelve con los factores en el orden original
  return Object.fromEntries(Object.keys(factores).map((factor) => [factor, parcial[factor]]));
}

/**
 * Genera un conjunto reducido de casos que cubre todos los pares de valores.
 * @param {Record<string, string[]>} factores Valores posibles de cada factor.
 * @returns {Array<Record<string, string>>} Casos de prueba.
 */
function generarCasos(factores) {
  if (Object.keys(factores).length < 2) {
    throw new Error('Se requieren al menos dos factores');
  }

  const pares = todosLosPares(factores);
  const pendientes = new Set(pares.map(claveDePar));
  const casos = [];

  for (const par of pares) {
    if (pendientes.has(claveDePar(par))) {
      const caso = construirCaso(factores, par, pendientes);
      casos.push(caso);
      for (const cubierto of pares.filter((p) => cubre(caso, p))) {
        pendientes.delete(claveDePar(cubierto));
      }
    }
  }
  return casos;
}

module.exports = { generarCasos, paresSinCubrir, totalCombinaciones, todosLosPares };
