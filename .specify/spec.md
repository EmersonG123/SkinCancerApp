# Specification

## Descripción general
El sistema permite a médicos y pacientes registrar y analizar imágenes de lesiones de piel utilizando un modelo de Inteligencia Artificial preentrenado. Retorna una clasificación de la lesión con un porcentaje de confianza y permite guardar este análisis en un historial para trazabilidad y auditoría. También incluye módulos de chat y recomendaciones médicas automáticas o generadas por IA.

## Actores
- **Médico/Operador**: Profesional de la salud colegiado que realiza y revisa los análisis, accede al historial completo y recibe soporte diagnóstico.
- **Paciente**: Usuario final que puede consultar su propio historial o resultados analizados.
- **Administrador (Admin)**: Usuario encargado de gestionar cuentas, roles, el acceso a la plataforma y revisar el estado global del sistema.

## Requisitos funcionales

### RF-001: Autenticación de Usuarios
**Historia de usuario:**
Como usuario
quiero iniciar sesión en el sistema
para acceder a mis análisis e historial médico de forma segura

**Criterios de aceptación:**
- Dado que el usuario ingresa credenciales válidas
- Cuando hace clic en "Ingresar"
- Entonces el sistema genera un token de sesión y redirige a la vista correspondiente según su rol.

### RF-002: Análisis de Lesión Cutánea
**Historia de usuario:**
Como Médico/Operador
quiero subir una imagen de una lesión de piel
para obtener una predicción asistida por IA sobre la condición médica

**Criterios de aceptación:**
- Dado que el usuario está en la pestaña de análisis
- Cuando sube una imagen válida y solicita el análisis
- Entonces el sistema retorna la clase predicha, el nivel de riesgo y la confianza del modelo.

### RF-003: Consulta de Historial
**Historia de usuario:**
Como usuario
quiero visualizar el historial de mis análisis
para llevar un control de mi evolución clínica

**Criterios de aceptación:**
- Dado que el usuario está autenticado
- Cuando navega a la pestaña de "Historial"
- Entonces el sistema lista todos los análisis previos guardados de manera ordenada.

### RF-004: Gestión de Usuarios
**Historia de usuario:**
Como Administrador
quiero ver y administrar los usuarios registrados
para mantener el control de acceso y seguridad de la plataforma

**Criterios de aceptación:**
- Dado que el administrador accede al Panel Admin
- Cuando solicita la lista de usuarios
- Entonces el sistema muestra los datos de los usuarios y permite realizar acciones de gestión.

## Requisitos no funcionales
- **Seguridad**: Los endpoints privados deben estar protegidos por tokens temporales. Las contraseñas no deben guardarse en texto plano.
- **Rendimiento**: El tiempo de inferencia de la Inteligencia Artificial no debe superar un umbral aceptable (ej: < 3 segundos) en condiciones normales.
- **Disponibilidad**: El sistema debe manejar excepciones sin provocar el colapso general, permitiendo a los usuarios navegar por el historial incluso si el servicio de análisis temporalmente falla.
- **Usabilidad**: Interfaz moderna, "glassmorphism", responsive, adaptada a uso clínico rápido y lectura sin fatiga visual.
- **Escalabilidad**: El sistema debe soportar un crecimiento en la cantidad de registros e imágenes sin afectar considerablemente el tiempo de carga del historial.
