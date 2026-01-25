@echo off
echo [G68] Deteniendo servicios...

taskkill /F /IM java.exe /T >nul 2>&1
if %errorlevel% equ 0 (
    echo [G68] Backend Java detenido.
) else (
    echo [G68] No se encontro proceso Java o ya estaba detenido.
)

taskkill /F /IM python.exe /T >nul 2>&1
if %errorlevel% equ 0 (
    echo [G68] Motor Python detenido.
) else (
    echo [G68] No se encontro proceso Python o ya estaba detenido.
)

echo [G68] Todo detenido.
pause
