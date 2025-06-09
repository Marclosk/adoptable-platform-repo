@echo off
REM ————————————————
REM   format.bat: Ordena imports y formatea todo el código
REM ————————————————

REM 1) Isort para ordenar imports
echo ================================================
echo [1/2] Ordenando imports con Isort...
poetry run isort .
if %ERRORLEVEL% neq 0 (
  echo.
  echo Ha ocurrido un error al ordenar imports con Isort.
  exit /b 1
)

REM 2) Black para formatear
echo ================================================
echo [2/2] Formateando código con Black...
poetry run black .
if %ERRORLEVEL% neq 0 (
  echo.
  echo Ha ocurrido un error al formatear con Black.
  exit /b 1
)

echo ================================================
echo Imports ordenados y código formateado correctamente.
exit /b 0
