const http = require('node:http');
const { evaluarTransferencia } = require('./transferencias');

const PUERTO_POR_DEFECTO = 3000;
const TAMANO_MAXIMO_CUERPO = 10_000;

const CODIGO_HTTP = Object.freeze({
  APROBADA: 200,
  REQUIERE_VERIFICACION: 202,
  RECHAZADA: 422,
});

function responder(res, codigo, cuerpo) {
  res.writeHead(codigo, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(cuerpo));
}

function leerCuerpo(req) {
  return new Promise((resolve, reject) => {
    let datos = '';
    req.on('data', (fragmento) => {
      datos += fragmento;
      if (datos.length > TAMANO_MAXIMO_CUERPO) {
        reject(new Error('CUERPO_DEMASIADO_GRANDE'));
      }
    });
    req.on('end', () => resolve(datos));
    req.on('error', reject);
  });
}

async function atenderTransferencia(req, res) {
  let solicitud;
  try {
    solicitud = JSON.parse(await leerCuerpo(req));
  } catch {
    responder(res, 400, { error: 'JSON_INVALIDO' });
    return;
  }
  const resultado = evaluarTransferencia(solicitud);
  responder(res, CODIGO_HTTP[resultado.estado], resultado);
}

function crearServidor() {
  return http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/transferencias') {
      atenderTransferencia(req, res);
    } else if (req.method === 'GET' && req.url === '/salud') {
      responder(res, 200, { estado: 'OK' });
    } else {
      responder(res, 404, { error: 'RUTA_NO_ENCONTRADA' });
    }
  });
}

/* istanbul ignore next -- arranque manual del servidor, fuera del alcance de las pruebas */
if (require.main === module) {
  const puerto = Number(process.env.PORT) || PUERTO_POR_DEFECTO;
  crearServidor().listen(puerto, () => {
    process.stdout.write(`API de transferencias escuchando en http://localhost:${puerto}\n`);
  });
}

module.exports = { crearServidor };
