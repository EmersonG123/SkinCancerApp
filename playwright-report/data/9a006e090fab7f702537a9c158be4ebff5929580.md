# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: historial.spec.js >> Flujo de Historial >> debe permitir visualizar la base histórica de diagnósticos
- Location: frontend-tests\historial.spec.js:4:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#email-input')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e7] [cursor=pointer]:
        - img [ref=e9]
        - generic [ref=e12]:
          - generic [ref=e13]: SkinCancer IA
          - generic [ref=e14]: Detección Temprana
      - generic [ref=e15]:
        - link "Características" [ref=e16] [cursor=pointer]:
          - /url: "#features"
        - link "¿Cómo funciona?" [ref=e17] [cursor=pointer]:
          - /url: "#how-it-works"
        - link "FAQ" [ref=e18] [cursor=pointer]:
          - /url: "#faq"
        - link "Contacto" [ref=e19] [cursor=pointer]:
          - /url: "#contact"
        - button "Iniciar Sesión" [ref=e20]:
          - text: Iniciar Sesión
          - img [ref=e21]
  - generic [ref=e24]:
    - generic [ref=e25]:
      - img [ref=e26]
      - text: Precisión Diagnóstica Asistida por IA
    - heading "Detecta lesiones cutáneas con el apoyo de Inteligencia Artificial" [level=1] [ref=e28]:
      - text: Detecta lesiones cutáneas
      - text: con el apoyo de Inteligencia Artificial
    - paragraph [ref=e29]: Obtén un análisis rápido y preciso de imágenes dermatoscópicas para apoyar la detección temprana del cáncer de piel. Una plataforma segura, diseñada exclusivamente para profesionales de la salud.
    - generic [ref=e30]:
      - button "Comenzar Ahora" [ref=e31]:
        - text: Comenzar Ahora
        - img [ref=e32]
      - link "Conocer más" [ref=e34] [cursor=pointer]:
        - /url: "#features"
  - generic [ref=e36]:
    - generic [ref=e37]:
      - heading "Beneficios de la Plataforma" [level=2] [ref=e38]
      - paragraph [ref=e39]: Nuestra red neuronal procesa imágenes clínicas al instante, entregando métricas de confianza vitales para su decisión médica.
    - generic [ref=e40]:
      - generic [ref=e41]:
        - img [ref=e43]
        - heading "Análisis Seguro" [level=3] [ref=e45]
        - paragraph [ref=e46]: Clasificador DenseNet201 con más de 90% de exactitud diagnóstica en 7 clases.
      - generic [ref=e47]:
        - img [ref=e49]
        - heading "Resultados Inmediatos" [level=3] [ref=e52]
        - paragraph [ref=e53]: Latencia menor a 2 segundos desde la subida de la imagen hasta el reporte.
      - generic [ref=e54]:
        - img [ref=e56]
        - heading "Historial Clínico" [level=3] [ref=e60]
        - paragraph [ref=e61]: Registro inmutable de todos sus análisis previos asociados a su cuenta.
      - generic [ref=e62]:
        - img [ref=e64]
        - heading "Reportes Automáticos" [level=3] [ref=e67]
        - paragraph [ref=e68]: Sugerencias de manejo clínico y diagnósticos diferenciales integrados.
  - generic [ref=e71]:
    - generic [ref=e72]:
      - heading "¿Cómo funciona?" [level=2] [ref=e73]
      - paragraph [ref=e74]: Un flujo de trabajo optimizado que respeta el valioso tiempo de la consulta médica.
      - generic [ref=e75]:
        - generic [ref=e76]:
          - generic [ref=e77]: "01"
          - generic [ref=e78]:
            - heading "Inicie Sesión" [level=4] [ref=e79]
            - paragraph [ref=e80]: Acceda a su entorno privado y seguro con sus credenciales médicas.
        - generic [ref=e81]:
          - generic [ref=e82]: "02"
          - generic [ref=e83]:
            - heading "Suba una Imagen" [level=4] [ref=e84]
            - paragraph [ref=e85]: Cargue una imagen dermatoscópica de la lesión sospechosa del paciente.
        - generic [ref=e86]:
          - generic [ref=e87]: "03"
          - generic [ref=e88]:
            - heading "Procesamiento IA" [level=4] [ref=e89]
            - paragraph [ref=e90]: Nuestro modelo PyTorch extrae las características visuales en tiempo real.
        - generic [ref=e91]:
          - generic [ref=e92]: "04"
          - generic [ref=e93]:
            - heading "Visualice Resultados" [level=4] [ref=e94]
            - paragraph [ref=e95]: Obtenga el nivel de riesgo, la clase predicha y guías de derivación clínica.
    - generic [ref=e104]:
      - img [ref=e105]
      - paragraph [ref=e111]: Analizando matriz de píxeles...
  - generic [ref=e113]:
    - heading "Preguntas Frecuentes" [level=2] [ref=e115]
    - generic [ref=e116]:
      - generic [ref=e117]:
        - button "¿La Inteligencia Artificial reemplaza al dermatólogo?" [ref=e118]:
          - text: ¿La Inteligencia Artificial reemplaza al dermatólogo?
          - img [ref=e119]
        - paragraph [ref=e121]: En absoluto. SkinCancer IA es una herramienta de soporte a la decisión diagnóstica (CDSS) diseñada para médicos de atención primaria. Todo resultado requiere confirmación y biopsia por un dermatólogo especialista.
      - generic [ref=e122]:
        - button "¿Qué tipo de imágenes puedo analizar?" [ref=e123]:
          - text: ¿Qué tipo de imágenes puedo analizar?
          - img [ref=e124]
        - paragraph [ref=e126]: El sistema está optimizado para imágenes dermatoscópicas claras (iluminación uniforme y aumento adecuado). Acepta formatos JPG, PNG, WEBP y BMP.
      - generic [ref=e127]:
        - button "¿Mis datos y los de mis pacientes están protegidos?" [ref=e128]:
          - text: ¿Mis datos y los de mis pacientes están protegidos?
          - img [ref=e129]
        - paragraph [ref=e131]: Sí. Las imágenes subidas se anonimizan y procesan en servidores seguros. No conservamos metadatos identificativos (EXIF) de los pacientes y la base de datos de historiales cuenta con estrictas políticas de privacidad.
  - generic [ref=e134]:
    - generic [ref=e135]:
      - heading "¿Desea implementar SkinCancer IA en su clínica?" [level=2] [ref=e136]
      - paragraph [ref=e137]: Póngase en contacto con nuestro equipo técnico para licencias empresariales.
    - generic [ref=e138]:
      - generic [ref=e139]:
        - generic [ref=e140]:
          - generic [ref=e141]: Nombre Completo
          - textbox "Dr. Juan Pérez" [ref=e142]
        - generic [ref=e143]:
          - generic [ref=e144]: Correo Electrónico
          - textbox "doctor@clinica.com" [ref=e145]
      - generic [ref=e146]:
        - generic [ref=e147]: Mensaje
        - textbox "¿Cómo podemos ayudarle?" [ref=e148]
      - button "Enviar Mensaje" [ref=e149]:
        - text: Enviar Mensaje
        - img [ref=e150]
  - contentinfo [ref=e153]:
    - generic [ref=e154]:
      - generic [ref=e155]:
        - generic [ref=e156]:
          - generic [ref=e157]:
            - img [ref=e158]
            - generic [ref=e161]: SkinCancer IA
          - paragraph [ref=e162]: Llevando la precisión de la inteligencia artificial al consultorio dermatológico moderno.
        - generic [ref=e163]:
          - link "Acerca del Proyecto" [ref=e164] [cursor=pointer]:
            - /url: "#"
          - link "Documentación Clínica" [ref=e165] [cursor=pointer]:
            - /url: "#"
        - generic [ref=e166]:
          - link "Política de Privacidad" [ref=e167] [cursor=pointer]:
            - /url: "#"
          - link "Términos y Condiciones" [ref=e168] [cursor=pointer]:
            - /url: "#"
          - link "Contacto Técnico" [ref=e169] [cursor=pointer]:
            - /url: "#"
      - generic [ref=e170]: © 2026 SkinCancer IA Corp. Todos los derechos reservados.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Flujo de Historial', () => {
  4  |   test('debe permitir visualizar la base histórica de diagnósticos', async ({ page }) => {
  5  |     // 1. Navegar e iniciar sesión
  6  |     await page.goto('/');
> 7  |     await page.fill('#email-input', 'emerson@gmail.com');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  8  |     await page.fill('#password-input', 'eng947750');
  9  |     await page.click('button[type="submit"]');
  10 |     
  11 |     await expect(page.locator('button[title="Cerrar Sesión"]')).toBeVisible();
  12 | 
  13 |     // 2. Navegar a Base Histórica
  14 |     await page.click('text=Base Histórica');
  15 | 
  16 |     // 3. Verificar que la vista cargue correctamente
  17 |     await expect(page.locator('text=Mostrando')).toBeVisible();
  18 |     await expect(page.locator('input[placeholder*="Buscar por hallazgo"]')).toBeVisible();
  19 | 
  20 |     // 4. Si hay registros, validamos que se muestre alguno
  21 |     // Puede que esté vacío ("EXPEDIENTES AUSENTES") o que tenga tarjetas ("Cargar Ficha")
  22 |     const emptyState = page.locator('text=EXPEDIENTES AUSENTES');
  23 |     const records = page.locator('text=Cargar Ficha').first();
  24 | 
  25 |     // Esperamos a que uno de los dos estados se renderice
  26 |     await Promise.any([
  27 |       expect(emptyState).toBeVisible({ timeout: 5000 }),
  28 |       expect(records).toBeVisible({ timeout: 5000 })
  29 |     ]);
  30 |   });
  31 | });
  32 | 
```