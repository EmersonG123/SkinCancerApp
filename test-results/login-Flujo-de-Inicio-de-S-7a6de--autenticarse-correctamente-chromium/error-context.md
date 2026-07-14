# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.js >> Flujo de Inicio de Sesión >> debe cargar el formulario de login y autenticarse correctamente
- Location: frontend-tests\login.spec.js:4:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Acceso de Operador')
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Acceso de Operador')

```

```yaml
- navigation:
  - text: SkinCancer IA Detección Temprana
  - link "Características":
    - /url: "#features"
  - link "¿Cómo funciona?":
    - /url: "#how-it-works"
  - link "FAQ":
    - /url: "#faq"
  - link "Contacto":
    - /url: "#contact"
  - button "Iniciar Sesión"
- text: Precisión Diagnóstica Asistida por IA
- heading "Detecta lesiones cutáneas con el apoyo de Inteligencia Artificial" [level=1]
- paragraph: Obtén un análisis rápido y preciso de imágenes dermatoscópicas para apoyar la detección temprana del cáncer de piel. Una plataforma segura, diseñada exclusivamente para profesionales de la salud.
- button "Comenzar Ahora"
- link "Conocer más":
  - /url: "#features"
- heading "Beneficios de la Plataforma" [level=2]
- paragraph: Nuestra red neuronal procesa imágenes clínicas al instante, entregando métricas de confianza vitales para su decisión médica.
- heading "Análisis Seguro" [level=3]
- paragraph: Clasificador DenseNet201 con más de 90% de exactitud diagnóstica en 7 clases.
- heading "Resultados Inmediatos" [level=3]
- paragraph: Latencia menor a 2 segundos desde la subida de la imagen hasta el reporte.
- heading "Historial Clínico" [level=3]
- paragraph: Registro inmutable de todos sus análisis previos asociados a su cuenta.
- heading "Reportes Automáticos" [level=3]
- paragraph: Sugerencias de manejo clínico y diagnósticos diferenciales integrados.
- heading "¿Cómo funciona?" [level=2]
- paragraph: Un flujo de trabajo optimizado que respeta el valioso tiempo de la consulta médica.
- text: "01"
- heading "Inicie Sesión" [level=4]
- paragraph: Acceda a su entorno privado y seguro con sus credenciales médicas.
- text: "02"
- heading "Suba una Imagen" [level=4]
- paragraph: Cargue una imagen dermatoscópica de la lesión sospechosa del paciente.
- text: "03"
- heading "Procesamiento IA" [level=4]
- paragraph: Nuestro modelo PyTorch extrae las características visuales en tiempo real.
- text: "04"
- heading "Visualice Resultados" [level=4]
- paragraph: Obtenga el nivel de riesgo, la clase predicha y guías de derivación clínica.
- paragraph: Analizando matriz de píxeles...
- heading "Preguntas Frecuentes" [level=2]
- button "¿La Inteligencia Artificial reemplaza al dermatólogo?"
- paragraph: En absoluto. SkinCancer IA es una herramienta de soporte a la decisión diagnóstica (CDSS) diseñada para médicos de atención primaria. Todo resultado requiere confirmación y biopsia por un dermatólogo especialista.
- button "¿Qué tipo de imágenes puedo analizar?"
- paragraph: El sistema está optimizado para imágenes dermatoscópicas claras (iluminación uniforme y aumento adecuado). Acepta formatos JPG, PNG, WEBP y BMP.
- button "¿Mis datos y los de mis pacientes están protegidos?"
- paragraph: Sí. Las imágenes subidas se anonimizan y procesan en servidores seguros. No conservamos metadatos identificativos (EXIF) de los pacientes y la base de datos de historiales cuenta con estrictas políticas de privacidad.
- heading "¿Desea implementar SkinCancer IA en su clínica?" [level=2]
- paragraph: Póngase en contacto con nuestro equipo técnico para licencias empresariales.
- text: Nombre Completo
- textbox "Dr. Juan Pérez"
- text: Correo Electrónico
- textbox "doctor@clinica.com"
- text: Mensaje
- textbox "¿Cómo podemos ayudarle?"
- button "Enviar Mensaje"
- contentinfo:
  - text: SkinCancer IA
  - paragraph: Llevando la precisión de la inteligencia artificial al consultorio dermatológico moderno.
  - link "Acerca del Proyecto":
    - /url: "#"
  - link "Documentación Clínica":
    - /url: "#"
  - link "Política de Privacidad":
    - /url: "#"
  - link "Términos y Condiciones":
    - /url: "#"
  - link "Contacto Técnico":
    - /url: "#"
  - text: © 2026 SkinCancer IA Corp. Todos los derechos reservados.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Flujo de Inicio de Sesión', () => {
  4  |   test('debe cargar el formulario de login y autenticarse correctamente', async ({ page }) => {
  5  |     // 1. Navegar a la página principal
  6  |     await page.goto('/');
  7  | 
  8  |     // 2. Verificar que el formulario de acceso está visible
> 9  |     await expect(page.locator('text=Acceso de Operador')).toBeVisible();
     |                                                           ^ Error: expect(locator).toBeVisible() failed
  10 | 
  11 |     // 3. Llenar credenciales (usando valores por defecto o simulados)
  12 |     await page.fill('#email-input', 'emerson@gmail.com');
  13 |     await page.fill('#password-input', 'eng947750');
  14 | 
  15 |     // 4. Hacer clic en iniciar sesión (Montar Interfaz)
  16 |     await page.click('button[type="submit"]');
  17 | 
  18 |     // 5. Verificar que entra a la plataforma y muestra "Análisis Clínico" o "MedAI Assistant"
  19 |     // Dependiendo del rol, puede ir a Admin o Análisis. Si entra al sistema, veremos el botón de Cerrar Sesión.
  20 |     await expect(page.locator('button[title="Cerrar Sesión"]')).toBeVisible({ timeout: 10000 });
  21 |   });
  22 | });
  23 | 
```