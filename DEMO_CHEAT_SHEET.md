# 🚀 G68 Presentation Cheat Sheet

## 1. Preparar Entorno (Terminal)
Siempre ejecuta esto primero para ubicarte en la carpeta correcta:

```powershell
cd "ml-python\src\app"
```

## 2. Controlar Auditoría (Logs)
Elige uno antes de arrancar:

*   **✅ ACTIVAR (Modo Demo - Recomendado):**
    ```powershell
    $env:G68_AUDIT="1"
    ```

*   **❌ DESACTIVAR (Modo Silencio):**
    ```powershell
    $env:G68_AUDIT="0"
    ```

## 3. Arrancar el Servidor
Copia y pega este bloque completo:

```powershell
python -u -m uvicorn main:app --host 0.0.0.0 --port 8080
```
*(Recuerda: `Ctrl + C` para detenerlo)*

## 4. Probar en Navegador
*   **Swagger UI:** [http://localhost:8080/docs](http://localhost:8080/docs)

---

## 💾 Guardar Cambios Críticos (Git)
Si necesitas guardar los arreglos de última hora (`prevision` y logs):

```powershell
git add .
git commit -m "Fix final: Typos en contrato y logs en terminal"
git push origin feature/final-entrega
```
