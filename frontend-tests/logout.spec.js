import { test, expect } from '@playwright/test';

test.describe('Flujo de Cierre de Sesión', () => {
  test('debe cerrar la sesión y regresar a la pantalla de inicio', async ({ page }) => {
    // 1. Navegar e iniciar sesión
    await page.goto('/');
    await page.fill('#email-input', 'emerson@gmail.com');
    await page.fill('#password-input', 'eng947750');
    await page.click('button[type="submit"]');
    
    // 2. Esperar a estar dentro de la app
    const btnLogout = page.locator('button[title="Cerrar Sesión"]');
    await expect(btnLogout).toBeVisible();

    // 3. Hacer clic en Cerrar Sesión
    await btnLogout.click();

    // 4. Verificar que se regresó a la pantalla de Acceso de Operador (o Landing)
    // El sistema redirige al landing (Volver al inicio) o directo al login
    // Como estamos deslogueados, busquemos el título del landing o el botón de Login
    // En App.tsx, al cerrar sesión va a "inicio" (Landing Page)
    await expect(page.locator('text=Acceso de Operador').or(page.locator('text=Iniciar Acceso Neural'))).toBeVisible({ timeout: 5000 });
  });
});
