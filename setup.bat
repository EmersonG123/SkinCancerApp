@echo off
echo ============================================================
echo   SkinCancerApp - Script de Configuracion
echo ============================================================
echo.

:: ── 1. Crear base de datos ────────────────────────────────────
echo [1/3] Creando base de datos SkinDB y tablas...
echo NOTA: Si pide contrasena, ingrese: eng947750
echo.
psql -U postgres -c "CREATE DATABASE \"SkinDB\";" 2>nul
IF %ERRORLEVEL% EQU 0 (
    echo    Base de datos 'SkinDB' creada.
) ELSE (
    echo    La base de datos 'SkinDB' ya existe o ya fue creada.
)

psql -U postgres -d SkinDB -f database\schema.sql
IF %ERRORLEVEL% EQU 0 (
    echo    Tablas y datos iniciales creados exitosamente.
) ELSE (
    echo    [ERROR] No se pudo ejecutar el schema SQL. Verifique que PostgreSQL este corriendo.
    pause
    exit /b 1
)

:: ── 2. Instalar dependencias del backend ──────────────────────
echo.
echo [2/3] Instalando dependencias Node.js del backend...
cd backend
npm install
IF %ERRORLEVEL% NEQ 0 (
    echo    [ERROR] Fallo npm install. Verifique que Node.js este instalado.
    pause
    exit /b 1
)
echo    Dependencias instaladas correctamente.
cd ..

:: ── 3. Verificar microservicio Python ─────────────────────────
echo.
echo [3/3] Instrucciones para el microservicio Python:
echo.
echo    cd ia_service
echo    pip install -r requirements.txt
echo    python main.py
echo.

echo ============================================================
echo   Configuracion completada!
echo ============================================================
echo.
echo Para iniciar la aplicacion (Frontend + Backend en puerto 3000):
echo    npm run dev
echo.
echo Para iniciar el microservicio IA (en otra terminal):
echo    cd ia_service ^&^& python main.py
echo.
echo URLs:
echo    Aplicacion Completa: http://localhost:3000
echo    IA (Inferencia):     http://localhost:8001
echo    Health API:          http://localhost:3000/api/health
echo.
pause
