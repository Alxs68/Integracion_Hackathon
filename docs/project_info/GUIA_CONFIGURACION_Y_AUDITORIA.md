# Guía Técnica de Configuración y Auditoría - G68

Este documento detalla los parámetros de configuración necesarios para asegurar la operatividad de los servicios de Backend, Data Science y Frontend, junto con una auditoría de inconsistencias detectadas en las ramas actuales.

---

## 1. Configuraciones y Correcciones Requeridas

### ☕ Backend (Java / Spring Boot)
*   **JDK:** Requiere versión **21**.
*   **Ejecución:** Utilizar el wrapper `./mvnw spring-boot:run` para garantizar la consistencia del entorno.
*   **Persistencia (H2):** Cambiar configuración a archivo local para evitar pérdida de datos:
    `spring.datasource.url=jdbc:h2:file:./data/sentiment_db;DB_CLOSE_ON_EXIT=FALSE`
*   **CORS:** Habilitar `@CrossOrigin("*")` en los controladores de la API.
*   **Mapeo:** Asegurar la presencia del campo `top_features` en los DTOs de respuesta.

### 🧠 Data Science (Python / FastAPI)
*   **Módulos:** Incluir archivo `__init__.py` en el directorio `src/app`.
*   **Rutas:** Las importaciones en `main.py` deben referenciar al paquete completo (ej. `from app.motor_hibrido ...`).
*   **Puerto:** Servicio estandarizado en el puerto **8080**.

### 🎨 Frontend (HTML / JavaScript)
*   **Endpoint:** Configurar `app.js` para realizar peticiones al puerto **8000** del Backend.
*   **Localización:** Archivos deben estar contenidos en el directorio `/frontend`.

---

## 2. Auditoría: Estado en GitHub vs. Configuración Requerida

| Componente | Estado en Rama GitHub | Configuración Requerida | Efecto del Estado Actual |
| :--- | :--- | :--- | :--- |
| **Persistencia** | En memoria (`:mem:`) | Archivo local (`file:./data/`) | Pérdida de historial tras reinicio servidor. |
| **Seguridad** | Sin `@CrossOrigin` | Habilitar `@CrossOrigin` | Bloqueo Navegador (Peticiones FE ↔ BE). |
| **Estructura DS** | Sin `__init__.py` | Añadir `__init__.py` | Fallo de ejecución (`ModuleNotFoundError`). |
| **Imports ML** | Rutas parciales | Rutas completas (`from app...`) | Error de resolución de módulos internos. |
| **Frontend** | Archivos en raíz | Carpeta `/frontend` | Errores en Docker y rutas de archivos. |

---

## 🛠️ Pruebas Rápidas de Verificación (Smoke Test)

Antes de probar el flujo completo, verificar cada componente individualmente:

1.  **Verificar ML (Python):** 
    *   Abrir: `http://localhost:8080/health` (Debe responder `{"status": "online"}`).
2.  **Verificar Backend (Java):** 
    *   Abrir: `http://localhost:8000/h2-console`.
    *   User: `sa`, Pass: `contrasenia`, JDBC URL: `jdbc:h2:file:./data/sentiment_db`.
3.  **Verificar Integración (CORS):**
    *   Si el Frontend muestra errores de conexión, revisar la anotación `@CrossOrigin` en Java.

---

**Estado Requerido:** ✅ 100% Operativo.
**G68 Technical Team.**
