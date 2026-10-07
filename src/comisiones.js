function calcularComision(monto, tipoDestino) {
  if (!Number.isInteger(monto) || monto <= 0) {
    throw new Error('El monto debe ser un entero positivo de centavos');
  }
  var comision;
  if (tipoDestino == 'MISMO_BANCO') {
    return 0;
  } else if (tipoDestino == 'INTERBANCARIA') {
    comision = Math.round((monto * 50) / 10000);
    if (comision < 500) comision = 500;
    return comision;
  } else if (tipoDestino == 'INTERNACIONAL') {
    comision = Math.round((monto * 150) / 10000);
    if (comision < 5000) comision = 5000;
    return comision;
  } else {
    throw new Error('Tipo de destino no soportado: ' + tipoDestino);
  }
}

module.exports = { calcularComision };
