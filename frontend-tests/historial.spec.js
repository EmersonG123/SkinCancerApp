import { test, expect } from '@playwright/test';

test.describe('Flujo de Historial', () => {
  test('debe permitir visualizar la base histórica de diagnósticos', async ({ page }) => {
    // 1. Navegar e iniciar sesión
    await page.goto('/');
    await page.fill('#email-input', 'emerson@gmail.com');
    await page.fill('#password-input', 'eng947750');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('button[title="Cerrar Sesión"]')).toBeVisible();

    // 2. Navegar a Base Histórica
    await page.click('text=Base Histórica');

    // 3. Verificar que la vista cargue correctamente
    await expect(page.locator('text=Mostrando')).toBeVisible();
    await expect(page.locator('input[placeholder*="Buscar por hallazgo"]')).toBeVisible();

    // 4. Si hay registros, validamos que se muestre alguno
    // Puede que esté vacío ("EXPEDIENTES AUSENTES") o que tenga tarjetas ("Cargar Ficha")
    const emptyState = page.locator('text=EXPEDIENTES AUSENTES');
    const records = page.locator('text=Cargar Ficha').first();

    // Esperamos a que uno de los dos estados se renderice
    await Promise.any([
      expect(emptyState).toBeVisible({ timeout: 5000 }),
      expect(records).toBeVisible({ timeout: 5000 })
    ]);
  });
});
