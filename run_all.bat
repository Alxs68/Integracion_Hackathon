@echo off
TITLE Sentimental IA - Advanced Restoration Launch
color 0b

echo.
echo ==========================================
echo    INICIANDO VERSION SUPREMA RESTAURADA
echo ==========================================
echo.

:: 1. Limpieza de procesos colgados
echo [1/4] Limpiando puertos 8000 (Java) y 8080 (Python)...
taskkill /F /IM java.exe /T >nul 2>&1
taskkill /F /IM python.exe /T >nul 2>&1

:: 2. Iniciar IA (Python) en una nueva ventana
echo [2/4] Iniciando Servidor de IA (FastAPI)...
start "Backend IA (Python)" cmd /k "cd /d %~dp0 && cd ml-python\src\app && python main.py"

:: 3. Iniciar Backend (Java) en una nueva ventana
echo [3/4] Iniciando Backend de Integracion (Java)...
start "Backend Java (Spring)" cmd /k "cd /d %~dp0backend-java\api && mvnw.cmd clean spring-boot:run"

:: 4. Abrir el Frontend
echo [4/4] Abriendo Frontend (Final Version) en el navegador...
timeout /t 5 >nul
start "" "%~dp0frontend\index.html"

echo.
echo ==========================================
echo    SISTEMA RESTAURADO - VERIFICA AHORA
echo ==========================================
pause
