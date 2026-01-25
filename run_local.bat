@echo off
TITLE Sentimental IA - Local Launch (Diego/Florentino Integrated)
color 0e

echo.
echo ==============================================
echo    INICIANDO MODO LOCAL (SIN DOCKER)
echo ==============================================
echo.

:: 1. Limpieza
echo [1/4] Limpiando procesos previos...
taskkill /F /IM java.exe /T >nul 2>&1
taskkill /F /IM python.exe /T >nul 2>&1

:: 2. Start ML (Python)
echo [2/4] Iniciando Servicio ML (Python)...
start "Backend IA (Python)" cmd /k "cd /d %~dp0 && cd ml-python\src\app && python main.py"

:: 3. Start Backend (Java)
echo [3/4] Iniciando Backend API (Java)...
start "Backend Java (Spring)" cmd /k "cd /d %~dp0backend-java\api && mvnw.cmd clean spring-boot:run"

:: 4. Start Frontend
echo [4/4] Abriendo Frontend (Final Version)...
timeout /t 5 >nul
start "" "%~dp0frontend\index.html"

echo.
echo ==========================================
echo    SISTEMA INTEGRADO (LOCAL)
echo ==========================================
pause
