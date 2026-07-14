@echo off
echo ========================================================
echo INSTALANDO PLAYWRIGHT Y DEPENDENCIAS DE PRUEBA E2E
echo ========================================================
cd /d "%~dp0"
call npm install
call npx playwright install --with-deps chromium
echo ========================================================
echo INSTALACION COMPLETADA
echo AHORA EJECUTANDO LAS PRUEBAS
echo ========================================================
call npx playwright test --headed
pause
