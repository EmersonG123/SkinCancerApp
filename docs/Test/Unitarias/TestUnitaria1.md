## 4. Estructura del proyecto de pruebas

Se creará una carpeta independiente llamada `tests/` para organizar las pruebas del backend.

Estructura propuesta:

```
backend/
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── analisisController.js
│   │   ├── historialController.js
│   │   └── chatController.js
│   │
│   ├── models/
│   │   ├── Usuario.js
│   │   ├── ImagenLesion.js
│   │   ├── AnalisisIA.js
│   │   ├── Recomendacion.js
│   │   └── ChatHistorial.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── errorHandler.js
│   │
│   ├── services/
│   │   └── iaClient.js
│   │
│   └── routes/
│
├── tests/
│   ├── controllers/
│   │   ├── authController.test.js
│   │   ├── analisisController.test.js
│   │   ├── historialController.test.js
│   │   └── chatController.test.js
│   │
│   ├── models/
│   │   ├── Usuario.test.js
│   │   ├── ImagenLesion.test.js
│   │   ├── AnalisisIA.test.js
│   │   ├── Recomendacion.test.js
│   │   └── ChatHistorial.test.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.test.js
│   │   ├── uploadMiddleware.test.js
│   │   └── errorHandler.test.js
│   │
│   ├── services/
│   │   └── iaClient.test.js
│   │
│   └── integration/
│       ├── authRoutes.test.js
│       ├── analisisRoutes.test.js
│       ├── historialRoutes.test.js
│       └── chatRoutes.test.js
│
├── coverage/
├── vitest.config.js
├── package.json
└── server.js
```

---

## 5. Configuración de Vitest

### package.json

Agregar scripts:

```json
{
  "scripts": {
    "test": "vitest",
    "coverage": "vitest run --coverage"
  }
}
```

### vitest.config.js

```jsx
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage'
    }
  }
});
```

---

## 6. Patrón AAA (Arrange – Act – Assert)

Todas las pruebas deberán seguir el patrón AAA.

### 6.1 Arrange

Preparar el escenario de prueba.

Se configuran:

- datos de prueba
- mocks
- objetos request/response
- dependencias simuladas

Ejemplo:

```jsx
const req = {
  body: {
    email: 'test@gmail.com',
    password: '123456'
  }
};

const res = {
  status: vi.fn().mockReturnThis(),
  json: vi.fn()
};
```

---

### 6.2 Act

Ejecutar el método bajo prueba.

Ejemplo:

```jsx
await login(req, res);
```

---

### 6.3 Assert

Validar resultados esperados.

Ejemplo:

```jsx
expect(res.status)
  .toHaveBeenCalledWith(200);
```

---

## 7. Mocking (equivalente a Moq en .NET)

Las pruebas unitarias no deben utilizar PostgreSQL real.

Se emplearán mocks mediante:

```
vi.mock()
vi.fn()
```

Equivalencia conceptual:

```
Moq (.NET)
↓
vi.mock() / vi.fn() (Vitest)
```

Ejemplo:

### Incorrecto

Uso de BD real:

```sql
SELECT * FROM usuarios
```

### Correcto

Simular datos:

```jsx
Usuario.findByEmail =
  vi.fn().mockResolvedValue({
    id_usuario: 1,
    email: 'test@gmail.com'
  });
```

---

## 8. Datos de prueba (Mock Data)

Se utilizarán datos simulados.

Ejemplo:

```jsx
const fakeUser = {
  id_usuario: 1,
  nombre: 'Emerson',
  email: 'emerson@gmail.com',
  password_hash: 'hash'
};
```

Ventajas:

- pruebas rápidas
- independencia de PostgreSQL
- repetibilidad
- aislamiento

---

## 9. Assertions (Validaciones)

Se utilizará `expect()`.

Equivalencias con .NET:

| MSTest (.NET) | Vitest |
| --- | --- |
| Assert.AreEqual() | expect().toBe() |
| Assert.IsTrue() | expect().toBe(true) |
| Assert.IsFalse() | expect().toBe(false) |
| Assert.IsNull() | expect().toBeNull() |
| Assert.IsNotNull() | expect().not.toBeNull() |
| Assert.AreNotEqual() | expect().not.toBe() |
| Assert.ThrowsException() | expect().toThrow() |

Ejemplos:

```jsx
expect(response.status)
  .toBe(201);

expect(usuario)
  .not.toBeNull();

expect(esValido)
  .toBe(true);
```

---

## 10. Estrategia de pruebas

### 10.1 Pruebas Unitarias

Objetivo:

Validar lógica aislada del sistema.

No usar:

- PostgreSQL real
- JWT real
- bcrypt real
- microservicio IA real

Se usarán mocks.

Cobertura:

- Controllers
- Models
- Middlewares
- Services

---

### authController

Archivo:

```
tests/controllers/authController.test.js
```

Casos:

- registro exitoso
- usuario duplicado
- login correcto
- contraseña inválida
- usuario inexistente

---

### analisisController

Archivo:

```
tests/controllers/analisisController.test.js
```

Casos:

- imagen válida
- error del microservicio IA
- melanoma → riesgo alto
- lesión benigna → riesgo bajo

---

### authMiddleware

Archivo:

```
tests/middlewares/authMiddleware.test.js
```

Casos:

- JWT válido
- JWT inválido
- token inexistente

---

### iaClient

Archivo:

```
tests/services/iaClient.test.js
```

Casos:

- respuesta correcta del microservicio
- timeout
- error HTTP

---

## 11. Pruebas de integración

Objetivo:

Verificar endpoints reales.

Herramienta:

```
supertest
```

Ejemplo:

```
POST /api/auth/register
POST /api/auth/login
POST /api/analisis
GET /api/historial
DELETE /api/historial/:id
```

Estas pruebas podrán utilizar una base de datos de pruebas.

---

## 12. Cobertura de código

Ejecutar:

```bash
npm run coverage
```

Métricas:

- % Statements
- % Branches
- % Functions
- % Lines

Meta mínima:

```
≥ 80%
```

Reporte HTML:

```
coverage/index.html
```

El reporte permitirá identificar:

- líneas cubiertas
- líneas sin ejecutar
- condiciones no probadas

---

## 13. Convención de nombres

Formato obligatorio:

```
archivo.test.js
```

Ejemplos:

```
authController.test.js
Usuario.test.js
analisisController.test.js
authMiddleware.test.js
```

---

## 14. Prioridad de implementación

Orden recomendado:

1. authController
2. authMiddleware
3. Usuario model
4. analisisController
5. historialController
6. iaClient
7. integración con Supertest

---

## 15. Resultado esperado

Al finalizar se deberá contar con:

- backend probado
- cobertura ≥ 80%
- pruebas unitarias aisladas
- pruebas de integración funcionales
- reporte HTML de cobertura
- estructura organizada en carpeta `tests/`