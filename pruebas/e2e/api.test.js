const { crearServidor } = require('../../src/servidor');

// Pruebas de extremo a extremo: levantan el servidor HTTP real y lo consumen con fetch.
describe('API de transferencias (E2E)', () => {
  let servidor;
  let url;

  beforeAll(async () => {
    servidor = crearServidor();
    await new Promise((resolve) => {
      servidor.listen(0, '127.0.0.1', resolve);
    });
    url = `http://127.0.0.1:${servidor.address().port}`;
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      servidor.close(resolve);
    });
  });

  const enviar = (cuerpo) =>
    fetch(`${url}/api/transferencias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo),
    });

  const solicitudValida = {
    tipoCuenta: 'MONETARIA',
    moneda: 'GTQ',
    canal: 'MOVIL',
    monto: 250_000,
    tipoDestino: 'INTERBANCARIA',
    autenticacion: 'BIOMETRIA',
    saldo: 1_000_000,
  };

  test('una transferencia válida responde 200 con la comisión y el total debitado', async () => {
    const respuesta = await enviar(solicitudValida);

    expect(respuesta.status).toBe(200);
    expect(await respuesta.json()).toEqual({
      estado: 'APROBADA',
      motivo: null,
      comision: 1_250,
      totalDebitado: 251_250,
    });
  });

  test('una transferencia rechazada responde 422 con el motivo', async () => {
    const respuesta = await enviar({ ...solicitudValida, saldo: 1_000 });

    expect(respuesta.status).toBe(422);
    expect(await respuesta.json()).toMatchObject({
      estado: 'RECHAZADA',
      motivo: 'SALDO_INSUFICIENTE',
    });
  });

  test('una transferencia que requiere verificación responde 202', async () => {
    const respuesta = await enviar({
      ...solicitudValida,
      monto: 2_000_000,
      saldo: 5_000_000,
      autenticacion: 'CONTRASENA_OTP',
    });

    expect(respuesta.status).toBe(202);
    expect((await respuesta.json()).estado).toBe('REQUIERE_VERIFICACION');
  });

  test('un cuerpo que no es JSON responde 400', async () => {
    const respuesta = await enviar('{esto no es json');

    expect(respuesta.status).toBe(400);
    expect(await respuesta.json()).toEqual({ error: 'JSON_INVALIDO' });
  });

  test('una ruta desconocida responde 404', async () => {
    const respuesta = await fetch(`${url}/api/desconocida`);

    expect(respuesta.status).toBe(404);
  });

  test('GET /salud responde 200', async () => {
    const respuesta = await fetch(`${url}/salud`);

    expect(respuesta.status).toBe(200);
    expect(await respuesta.json()).toEqual({ estado: 'OK' });
  });
});
