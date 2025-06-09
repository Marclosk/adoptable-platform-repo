@echo off
REM ————————————————
REM   lint.bat: Ejecuta Flake8, Isort y Black en modo “check”
REM ————————————————

REM 1) Flake8
echo ================================================
echo [1/3] Ejecutando Flake8...
cd backend
poetry run flake8 --config .flake8 .
if %ERRORLEVEL% neq 0 (
  echo.
  echo Flake8 encontró errores de estilo o sintaxis. Corrígelos antes de continuar.
  exit /b 1
)
cd ..

REM 2) Isort (modo “check-only”)
echo ================================================
echo [2/3] Comprobando orden de imports con Isort...
cd backend
poetry run isort --check-only .
if %ERRORLEVEL% neq 0 (
  echo.
  echo Isort detectó imports sin ordenar. Ejecuta “format.bat” para arreglarlos.
  exit /b 1
)
cd ..

REM 3) Black (modo “check”)
echo ================================================
echo [3/3] Comprobando formateo con Black...
cd backend
poetry run black --check .
if %ERRORLEVEL% neq 0 (
  echo.
  echo Black encontró archivos sin formatear. Ejecuta “format.bat” para formatearlos.
  exit /b 1
)
cd ..

echo ================================================
echo ¡Todo limpio! Flake8, Isort y Black pasan sin errores.
exit /b 0
