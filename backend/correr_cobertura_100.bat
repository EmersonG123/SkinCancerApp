@echo off
echo ========================================================
echo CORRIENDO TODAS LAS PRUEBAS (UNITARIAS + INTEGRACION)
echo ========================================================
npx vitest run --coverage
pause
