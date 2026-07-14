import { test, expect } from '@playwright/test';

test.describe('Flujo de Análisis de Imagen', () => {
  test('debe permitir cargar una imagen y ver el veredicto', async ({ page }) => {
    // 1. Navegar e iniciar sesión
    await page.goto('/');
    await page.fill('#email-input', 'emerson@gmail.com');
    await page.fill('#password-input', 'eng947750');
    await page.click('button[type="submit"]');
    
    // Esperar a que cargue la interfaz principal
    await expect(page.locator('button[title="Cerrar Sesión"]')).toBeVisible();

    // Ir a la pestaña de análisis por si no estamos ahí
    await page.click('text=Análisis Clínico');

    // 2. Encontrar el input de archivo (está oculto, pero Playwright puede interactuar con él)
    // Subiremos una imagen de prueba. Si no existe, creamos un buffer temporal.
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    
    await page.setInputFiles('input[type="file"]', {
      name: 'lesion_test.png',
      mimeType: 'image/png',
      buffer: buffer,
    });

    // 3. Esperar que aparezca el cargador y luego el resultado
    await expect(page.locator('text=PROCESANDO RED NEURONAL')).toBeVisible({ timeout: 5000 });
    
    // Esperar que termine de cargar
    await expect(page.locator('text=PROCESANDO RED NEURONAL')).toBeHidden({ timeout: 15000 });

    // 4. Validar que aparece el veredicto (Veredicto Neuronal)
    await expect(page.locator('text=Veredicto Neuronal')).toBeVisible();
    await expect(page.locator('text=Factor Confianza')).toBeVisible();
  });
});
