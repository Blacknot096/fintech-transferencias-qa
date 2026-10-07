// Uso: npm run pairwise
// Imprime los casos pairwise de la funcionalidad de transferencias y verifica su cobertura.
const { generarCasos, paresSinCubrir, totalCombinaciones, todosLosPares } = require('./pairwise');
const { FACTORES_TRANSFERENCIA } = require('./factores');

const casos = generarCasos(FACTORES_TRANSFERENCIA);
const pares = todosLosPares(FACTORES_TRANSFERENCIA).length;
const faltantes = paresSinCubrir(FACTORES_TRANSFERENCIA, casos).length;

console.table(casos.map((caso, i) => ({ id: `PW-${String(i + 1).padStart(2, '0')}`, ...caso })));
console.log(`Combinaciones exhaustivas: ${totalCombinaciones(FACTORES_TRANSFERENCIA)}`);
console.log(`Casos pairwise generados:  ${casos.length}`);
console.log(`Pares cubiertos:           ${pares - faltantes} de ${pares}`);
