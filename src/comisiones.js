const PUNTOS_BASE = 10_000;

// Tarifas por tipo de destino. La tasa va en puntos base (1 pb = 0.01 %) y el mínimo en centavos.
const TARIFAS = Object.freeze({
  MISMO_BANCO: { tasaPb: 0, minimo: 0 },
  INTERBANCARIA: { tasaPb: 50, minimo: 500 },
  INTERNACIONAL: { tasaPb: 150, minimo: 5_000 },
});

/**
 * Calcula la comisión de una transferencia.
 * @param {number} monto Monto a transferir, en centavos.
 * @param {string} tipoDestino MISMO_BANCO, INTERBANCARIA o INTERNACIONAL.
 * @returns {number} Comisión en centavos.
 */
function calcularComision(monto, tipoDestino) {
  if (!Number.isInteger(monto) || monto <= 0) {
    throw new Error('El monto debe ser un entero positivo de centavos');
  }

  const tarifa = TARIFAS[tipoDestino];
  if (!tarifa) {
    throw new Error(`Tipo de destino no soportado: ${tipoDestino}`);
  }

  const proporcional = Math.round((monto * tarifa.tasaPb) / PUNTOS_BASE);
  return Math.max(proporcional, tarifa.minimo);
}

module.exports = { calcularComision, TARIFAS };
