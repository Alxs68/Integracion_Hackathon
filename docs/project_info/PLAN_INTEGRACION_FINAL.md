# Plan de Integración de Extremo a Extremo G68 Supreme

Este plan detalla los pasos finales para habilitar la comunicación completa: **Interfaz Web (FE) → Backend (Java) → Motor de Sentimiento (Python)**.

## 📋 Estado Actual
- **Data Science (Python):** Funcional en puerto 8080. Endpoint `/predict/sentiment` habilitado y CORS configurado.
- **Frontend (Web):** Servido en puerto 3000. Actualmente apunta directamente a la IA (bypass).
- **Backend (Java):** JDK 21 instalado. Código sincronizado desde ramas de integración. Pendiente de arranque.

---

## 🚀 Pasos de Ejecución

### Fase 1: Ajuste de Conexión en Frontend (Ruta BE real)
Para que el flujo sea real, el Frontend debe hablar con el Backend Java (puerto 8000).
- **Archivo:** `frontend/app.js`
- **Cambio:** `DEV_BACKEND: "http://localhost:8000/sentiment"`

### Fase 2: Configuración del Backend Java (Ajustes de Contrato)
Para que BE transmita la explicabilidad (`top_features`) y conecte localmente:
1. **DTOs Internos:** Agregar campo `String top_features` en:
   - `com.sentiment.api.integration.client.dto.MlSentimentResponse`
   - `com.sentiment.api.dto.SentimentResponse`
2. **Mapeo:** Actualizar `SentimentService.java` para pasar el campo de la respuesta de ML al cliente final.
3. **Seguridad:** Agregar `@CrossOrigin("*")` en `SentimentController.java` para permitir al Frontend conectar.
4. **Propiedades:** En `application.properties`, cambiar:
   - `ml.base-url=http://localhost:8080`

### Fase 3: Arranque de Ecosistema
1. **Reiniciar Motor IA (Python):** `python ml-python/src/app/main.py`.
2. **Lanzar Backend (Java):** `.\mvnw.cmd clean spring-boot:run` desde la carpeta `api`.
3. **Servir Frontend:** `npx http-server frontend -p 3000`.

---

## 🛡️ Verificaciones de Calidad
1. **Health Check DS:** `GET http://localhost:8080/health` -> Status 200 OK.
2. **Health Check BE:** `GET http://localhost:8000/health` (si el equipo lo implementó).
3. **Prueba de Fuego:** Enviar comentario desde `localhost:3000` y verificar que el resultado incluya los "triggers" de la IA.

---
**Nota:** El Backend Java puede tardar ~1-2 minutos en la primera compilación.
