import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.4/index.js';
import encoding from 'k6/encoding';

// Selecciona el escenario basado en la variable de entorno SCENARIO
// Ejemplos de uso:
// k6 run -e SCENARIO=base load.js
// k6 run -e SCENARIO=medium load.js
// k6 run -e SCENARIO=peak load.js
const scenario = __ENV.SCENARIO || 'base';

let targetVUs = 39;
if (scenario === 'medium') targetVUs = 193;
if (scenario === 'peak') targetVUs = 385;

export const options = {
  stages: [
    { duration: '2m', target: targetVUs }, // Rampa de subida
    { duration: '5m', target: targetVUs }, // Ejecución mantenida
    { duration: '30s', target: 0 },        // Rampa de bajada
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // Latencia p95 < 3000 ms
    http_req_failed: ['rate<0.05'],    // Tasa de error < 5%
  },
};

// IMPORTANTE: Debes colocar una imagen de prueba válida llamada "test_image.jpg" en la misma carpeta "backend/testLoad/"
let img;
try {
  img = open('./test_image.jpg', 'b');
} catch (e) {
  console.log("⚠️ No se encontró 'test_image.jpg'. Usando imagen 1x1 en memoria por defecto.");
  const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  try {
    img = encoding.b64decode(b64, 'std', 'b'); // k6 moderno
  } catch (e2) {
    img = encoding.b64decode(b64, 'std', 's'); // fallback
  }
}

export default function () {
  const url = 'http://localhost:8001/predict';

  const data = {
    // El nombre del campo 'file' debe coincidir con lo que espera FastAPI
    file: http.file(img, 'test_image.jpg', 'image/jpeg'),
  };

  const res = http.post(url, data);

  check(res, {
    'es status 200': (r) => r.status === 200,
  });

  // Pausa entre peticiones de cada usuario virtual
  sleep(1);
}

export function handleSummary(data) {
  console.log(`Guardando reporte en: backend/reports/load-test-${scenario}-report.html`);

  return {
    // Genera el reporte HTML en la carpeta reports
    [`reports/load-test-${scenario}-report.html`]: htmlReport(data),
    // Imprime el resumen por consola
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}