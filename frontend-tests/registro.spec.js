import { test, expect } from '@playwright/test';

test.describe('Flujo de Registro de Usuario', () => {
  test('debe permitir crear una cuenta médica nueva', async ({ page }) => {
    // Generar correo dinámico para evitar colisiones
    const uniqueEmail = `dr.test.${Date.now()}@hospital.com`;

    // 1. Navegar a la página principal
    await page.goto('/');

    // 2. Cambiar a la vista de Registro
    await page.click('text=Regístrate aquí');
    await expect(page.locator('text=Crear Cuenta Clínica')).toBeVisible();

    // 3. Seleccionar rol Médico
    await page.click('text=Médico / Profesional');

    // 4. Llenar formulario
    await page.fill('#reg-name', 'Dr. Playwright Test');
    await page.fill('#reg-license', 'MED-777-TEST');
    await page.selectOption('#reg-specialty', 'dermatology');
    await page.fill('#reg-email', uniqueEmail);
    await page.fill('#reg-password', 'password123');
    await page.fill('#reg-confirm-password', 'password123');

    // 5. Aceptar términos
    await page.check('#reg-terms');

    // 6. Enviar formulario
    await page.click('button[type="submit"]');

    // 7. Esperar a que inicie sesión y muestre la interfaz de usuario logueado
    await expect(page.locator('button[title="Cerrar Sesión"]')).toBeVisible({ timeout: 15000 });
  });
});
