import { test, expect } from '@playwright/test';

test.describe('Flujo de Inicio de Sesión', () => {
  test('debe cargar el formulario de login y autenticarse correctamente', async ({ page }) => {
    // 1. Navegar a la página principal
    await page.goto('/');

    // 2. Verificar que el formulario de acceso está visible
    await expect(page.locator('text=Acceso de Operador')).toBeVisible();

    // 3. Llenar credenciales (usando valores por defecto o simulados)
    await page.fill('#email-input', 'emerson@gmail.com');
    await page.fill('#password-input', 'eng947750');

    // 4. Hacer clic en iniciar sesión (Montar Interfaz)
    await page.click('button[type="submit"]');

    // 5. Verificar que entra a la plataforma y muestra "Análisis Clínico" o "MedAI Assistant"
    // Dependiendo del rol, puede ir a Admin o Análisis. Si entra al sistema, veremos el botón de Cerrar Sesión.
    await expect(page.locator('button[title="Cerrar Sesión"]')).toBeVisible({ timeout: 10000 });
  });
});
