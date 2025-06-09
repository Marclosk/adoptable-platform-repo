@echo off
REM ====================================================
REM start.bat – Construye y levanta todos los contenedores
REM ====================================================

echo Construyendo y levantando contenedores...
docker-compose up --build -d

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Hubo un problema al levantar los contenedores.
    exit /b 1
)

echo.
echo ================================
echo  Servicios levantados:
echo    • Frontend:   http://localhost:5173
echo    • Backend:    http://localhost:8001
echo    • MinIO API:  http://localhost:9002   
echo    • MinIO Web:  http://localhost:9001
echo    • Postgres:   puerto 5432
echo ================================
exit /b 0
