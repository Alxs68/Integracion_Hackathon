# 🎮 Control de Auditoría G68

El sistema usa la variable de entorno `G68_AUDIT` para decidir si muestra los logs detallados (`🔍 [G68 AUDIT]`) o solo la salida estándar.

### ✅ ACTIVAR Auditoría (Modo Demo/Debug)
Ejecuta esto antes de arrancar el servidor para ver **todo** el detalle interno:

```powershell
$env:G68_AUDIT="1"
cd ml-python/src/app
python -u -m uvicorn main:app --host 0.0.0.0 --port 8080
```

---

### ❌ DESACTIVAR Auditoría (Modo Silencioso/Producción)
Ejecuta esto para ver **solo** las peticiones HTTP (`INFO: 200 OK`), sin detalles internos:

```powershell
$env:G68_AUDIT="0"
cd ml-python/src/app
python -u -m uvicorn main:app --host 0.0.0.0 --port 8080
```

> **Nota:** La bandera `-u` en python es necesaria en Windows para evitar que los logs se retrasen, independientemente del modo.
