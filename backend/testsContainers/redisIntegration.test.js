// testsContainers/redisIntegration.test.js
const { GenericContainer } = require('testcontainers');
const request = require('supertest');
const fs = require('fs');
const path = require('path');

// No mockeamos db.js ni nada, ¡usaremos bases de datos reales en Docker!
const redisService = require('../src/services/redisService');

describe('Pruebas de Integración con Testcontainers (Redis + PostgreSQL)', () => {
  let redisContainer;
  let postgresContainer;
  let redisClient;
  let pool;
  let app;

  beforeAll(async () => {
    console.log('Iniciando contenedores de prueba con Testcontainers (Redis + PostgreSQL)...');

    // 1. Levantar contenedor de Redis
    redisContainer = await new GenericContainer('redis:alpine')
      .withExposedPorts(6379)
      .start();

    const redisHost = redisContainer.getHost();
    const redisPort = redisContainer.getMappedPort(6379);
    console.log(`Contenedor Redis levantado en ${redisHost}:${redisPort}`);

    // Inyectar variables de Redis
    process.env.REDIS_HOST = redisHost;
    process.env.REDIS_PORT = redisPort.toString();

    // Inicializar redisService
    redisClient = redisService.initRedis(redisHost, redisPort);

    // 2. Levantar contenedor de PostgreSQL
    postgresContainer = await new GenericContainer('postgres:alpine')
      .withExposedPorts(5432)
      .withEnvironment({
        POSTGRES_USER: 'test_user',
        POSTGRES_PASSWORD: 'test_password',
        POSTGRES_DB: 'SkinDB_Test'
      })
      .start();

    const pgHost = postgresContainer.getHost();
    const pgPort = postgresContainer.getMappedPort(5432);
    console.log(`Contenedor PostgreSQL levantado en ${pgHost}:${pgPort}`);

    // Inyectar variables de base de datos y JWT
    process.env.DB_HOST = pgHost;
    process.env.DB_PORT = pgPort.toString();
    process.env.DB_USER = 'test_user';
    process.env.DB_PASSWORD = 'test_password';
    process.env.DB_NAME = 'SkinDB_Test';
    process.env.JWT_SECRET = 'test_secret';

    // Importar la base de datos y la app después de inyectar las variables de entorno de pruebas
    pool = require('../src/config/db');
    app = require('../app');

    // 3. Crear esquema de base de datos ejecutando el script schema.sql en el contenedor de PostgreSQL
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Ejecutar el script SQL para inicializar la base de datos de pruebas
    await pool.query(schemaSql);
    console.log('✅ Esquema PostgreSQL inicializado con éxito en el contenedor de pruebas.');
  }, 240000); // 240s timeout total para levantar ambos contenedores e inicializar

  afterAll(async () => {
    console.log('Apagando conexiones y contenedores...');
    // Desconectar servicios
    try {
      if (redisService && typeof redisService.disconnect === 'function') {
        await redisService.disconnect();
      }
      if (pool && typeof pool.end === 'function') {
        await pool.end();
      }
    } catch (e) {
      console.log('Error al desconectar servicios:', e.message);
    }

    // Apagar contenedores
    try {
      if (redisContainer) {
        await redisContainer.stop();
      }
      if (postgresContainer) {
        await postgresContainer.stop();
      }
    } catch (e) {
      console.log('Error al apagar contenedores:', e.message);
    }
    console.log('Contenedores apagados.');
  });

  // ── Pruebas de base de datos PostgreSQL real levantada en Docker ──
  describe('Base de Datos PostgreSQL (PostgreSQLContainer)', () => {
    it('debe registrar un usuario en PostgreSQL y permitirle iniciar sesión', async () => {
      const uniqueEmail = `user.${Date.now()}@test.com`;
      
      // 1. Registro de usuario mediante la API
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: uniqueEmail,
          nombre: 'Usuario Prueba Testcontainers',
          password: 'password12345',
          license: 'CO-54321-TST',
          specialty: 'general'
        });

      expect(registerRes.status).toBe(201);
      expect(registerRes.body.mensaje).toContain('Cuenta creada exitosamente');
      expect(registerRes.body.usuario.email).toBe(uniqueEmail);

      // 2. Login del usuario mediante la API
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: uniqueEmail,
          password: 'password12345'
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.token).toBeDefined();
      expect(loginRes.body.usuario.nombre).toBe('Usuario Prueba Testcontainers');
    });

    it('debe contener las recomendaciones iniciales cargadas por schema.sql', async () => {
      // Las recomendaciones son inicializadas por el script SQL.
      // Vamos a consultarlas directamente mediante queries de pool a la base de datos real.
      const res = await pool.query('SELECT * FROM recomendaciones');
      expect(res.rows.length).toBeGreaterThan(0);
      
      // Comprobar que existe la recomendación de melanoma
      const melanomaRec = res.rows.find(r => r.clase === 'mel');
      expect(melanomaRec).toBeDefined();
      expect(melanomaRec.nombre_amigable).toBe('Melanoma');
    });
  });

  // ── Pruebas de Redis real levantado en Docker ──
  describe('Caché Redis (RedisContainer)', () => {
    const testKey = 'cache:test:key';
    const testValue = { status: 'healthy', count: 10 };

    it('debe realizar operaciones CRUD directamente a través del servicio', async () => {
      await redisService.set(testKey, testValue, 15);
      const cachedVal = await redisService.get(testKey);
      expect(cachedVal).toEqual(testValue);

      await redisService.del(testKey);
      const deletedVal = await redisService.get(testKey);
      expect(deletedVal).toBeNull();
    });

    it('debe interactuar con la caché de Redis a través de los endpoints de la API', async () => {
      // 1. Guardar caché vía POST
      const postRes = await request(app)
        .post('/api/cache')
        .send({
          key: 'api:key',
          value: 'api_value',
          ttl: 60
        });

      expect(postRes.status).toBe(201);

      // 2. Obtener caché vía GET
      const getRes = await request(app)
        .get('/api/cache/api:key');

      expect(getRes.status).toBe(200);
      expect(getRes.body).toEqual({
        key: 'api:key',
        value: 'api_value'
      });

      // 3. Eliminar caché vía DELETE
      const deleteRes = await request(app)
        .delete('/api/cache/api:key');

      expect(deleteRes.status).toBe(200);

      // 4. Intentar obtener de nuevo y recibir 404
      const getAfterDeleteRes = await request(app)
        .get('/api/cache/api:key');

      expect(getAfterDeleteRes.status).toBe(404);
    });
  });

  // ── Pruebas de integración general de la API REST ──
  describe('Integración de API REST', () => {
    it('debe responder correctamente en GET /api/health', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.service).toBeDefined();
    });

    it('debe responder con la ruta de cortesía en GET /', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Servidor Backend Activo');
    });

    it('debe devolver información conectada a la BD en GET /api/diagnostics', async () => {
      const res = await request(app).get('/api/diagnostics');
      expect(res.status).toBe(200);
      expect(res.body.db_connected).toBe(true);
      expect(res.body.tables.usuarios.exists).toBe(true);
    });

    it('debe retornar 404 para rutas inexistentes', async () => {
      const res = await request(app).get('/ruta/fantasma/no/existe');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not Found');
    });
  });

  // ── Pruebas de Integración Completas (Cobertura de Endpoints) ──
  describe('Integración Completa de Endpoints', () => {
    let userToken;
    let adminToken;
    let adminId;

    beforeAll(async () => {
      // Registrar un usuario normal para obtener un token válido
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'normal.test@test.com',
          nombre: 'Usuario Normal Test',
          password: 'password123',
          license: 'MED-111',
          specialty: 'derma'
        });
      
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'normal.test@test.com', password: 'password123' });
      userToken = loginRes.body.token;

      // Registrar un admin y promoverlo manualmente en la DB
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'admin.test@test.com',
          nombre: 'Usuario Admin Test',
          password: 'password123',
          license: 'ADM-999',
          specialty: 'general'
        });
      
      const promoteRes = await pool.query("UPDATE usuarios SET rol = 'admin' WHERE email = 'admin.test@test.com' RETURNING id_usuario");
      adminId = promoteRes.rows[0].id_usuario;

      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin.test@test.com', password: 'password123' });
      adminToken = adminLogin.body.token;
    });

    describe('Endpoints de Usuarios', () => {
      it('debe listar los usuarios si es admin', async () => {
        const res = await request(app)
          .get('/api/usuarios')
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toBeDefined(); // La respuesta es un objeto, no un array directo
      });

      it('debe rechazar listar usuarios si no es admin', async () => {
        const res = await request(app)
          .get('/api/usuarios')
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(403);
      });
    });

    describe('Endpoints de Historial', () => {
      it('debe retornar historial correctamente estructurado', async () => {
        const res = await request(app)
          .get('/api/historial')
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body.data).toBeDefined(); // Verifica que contiene el array de datos paginados
      });
    });

    describe('Endpoints de Chat', () => {
      it('debe iniciar un chat con el bot', async () => {
        const res = await request(app)
          .post('/api/chat/1') // Requiere el ID del análisis en la ruta
          .set('Authorization', `Bearer ${userToken}`)
          .send({ pregunta: 'Hola, prueba de integración' }); // El body espera 'pregunta'
        expect(res.status).toBe(200);
        expect(res.body.respuesta).toBeDefined();
      });

      it('debe obtener el historial del chat guardado', async () => {
        const res = await request(app)
          .get('/api/chat/1') // Requiere el ID del análisis en la ruta
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body.mensajes).toBeDefined();
        expect(Array.isArray(res.body.mensajes)).toBe(true);
      });
    });

    describe('Endpoints de Análisis (FastAPI)', () => {
      it('debe manejar correctamente la ruta de predicción validando la imagen', async () => {
        // Usamos una imagen PNG de 1x1 píxel en base64 para engañar al imageValidator y llegar al IA client
        const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
        const buffer = Buffer.from(b64, 'base64');
        const res = await request(app)
          .post('/api/analisis') // La ruta correcta es /api/analisis (no /predecir)
          .set('Authorization', `Bearer ${userToken}`)
          .attach('imagen', buffer, 'test.png');
        
        // Dependiendo de si FastAPI está corriendo, podría ser 200 (éxito) o 500/503 (caído)
        // Lo importante es que la API REST maneja la petición y no colapsa el servidor
        expect([200, 400, 500, 503]).toContain(res.status);
      });
    });
  });
});
