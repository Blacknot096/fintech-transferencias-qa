const { calcularComision } = require('../../src/comisiones');

// Todos los montos se expresan en centavos (enteros) para evitar errores de punto flotante.
describe('calcularComision', () => {
  test('una transferencia al mismo banco no cobra comisión', () => {
    expect(calcularComision(150_000, 'MISMO_BANCO')).toBe(0);
  });

  test('una transferencia interbancaria cobra el 0.5 % del monto', () => {
    expect(calcularComision(500_000, 'INTERBANCARIA')).toBe(2_500);
  });

  test('una transferencia interbancaria cobra como mínimo Q5.00', () => {
    expect(calcularComision(10_000, 'INTERBANCARIA')).toBe(500);
  });

  test('una transferencia internacional cobra el 1.5 % del monto', () => {
    expect(calcularComision(1_000_000, 'INTERNACIONAL')).toBe(15_000);
  });

  test('una transferencia internacional cobra como mínimo Q50.00', () => {
    expect(calcularComision(100_000, 'INTERNACIONAL')).toBe(5_000);
  });

  test('la comisión se redondea al centavo más cercano', () => {
    // 0.5 % de Q1,234.57 = Q6.17285 -> Q6.17
    expect(calcularComision(123_457, 'INTERBANCARIA')).toBe(617);
  });

  test('rechaza un tipo de destino desconocido', () => {
    expect(() => calcularComision(10_000, 'CRIPTO')).toThrow('Tipo de destino no soportado: CRIPTO');
  });

  test.each([0, -100, 10.5, Number.NaN, '100'])('rechaza el monto inválido %p', (monto) => {
    expect(() => calcularComision(monto, 'MISMO_BANCO')).toThrow(
      'El monto debe ser un entero positivo de centavos',
    );
  });
});
