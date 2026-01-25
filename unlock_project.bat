@echo off
color 4f
echo =======================================================
echo    G68 - HERRAMIENTA DE DESBLOQUEO DE EMERGENCIA
echo =======================================================
echo.
echo [1/3] Buscando procesos Zombies...
taskkill /F /IM java.exe /T
taskkill /F /IM python.exe /T
echo.
echo [2/3] Liberando archivos de Base de Datos...
echo Si aparecio "CORRECTO" o "Exito" arriba, ya esta libre.
echo.
echo [3/3] LISTO. Ahora puede ejecutar "run_all.bat".
echo.
pause
