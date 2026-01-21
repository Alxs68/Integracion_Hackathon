# Guía de Integración y Despliegue G68 Supreme

Este documento detalla los pasos para levantar el ecosistema completo del proyecto de Sentiment Analysis.

## 1. Capa de Data Science (Motor IA)
**Prerrequisitos:** Python 3.12, dependencias de `requirements.txt`.

1. Entrar a la carpeta: `cd ml-python`.
2. Activar entorno virtual.
3. Ejecutar: `python src/app/main.py`.
4. **Verificación:** El servicio debe estar en `http://localhost:8080/predict/sentiment`.
   * *Nota:* No usar `/sentiment`, el contrato oficial exige el prefijo `/predict`.

## 2. Capa de Backend (Java)
**Prerrequisitos:** JDK 21+, Maven.

1. Entrar a la carpeta: `cd backend-java/api`.
2. Verificar `src/main/resources/application.properties`:
   ```properties
   ml.base-url=http://localhost:8080
   ml.predict-path=/predict/sentiment
   ```
3. Ejecutar: `mvn spring-boot:run` o `.\mvnw.cmd spring-boot:run`.
4. **Verificación:** La API debe estar disponible en `http://localhost:8000/sentiment`.

## 3. Capa de Frontend (Web App)
**Prerrequisitos:** Navegador moderno.

1. Para desarrollo local, abrir `frontend/index.html`.
2. **Importante:** Para que el flujo sea integrado (FE -> BE -> DS), el archivo `frontend/app.js` debe apuntar al puerto **8000** (Java):
   ```javascript
   const API_ENDPOINTS = {
     DEV_BACKEND: "http://localhost:8000/sentiment"
   };
   ```

## ⚠️ Checklist de Troubleshooting
* **CORS:** El Backend Java debe tener habilitado `@CrossOrigin` para permitir peticiones del Frontend.
* **Versión Java:** El proyecto BE NO correrá en Java 8. Asegurar JDK 21.
* **Campos:** El motor G68 Supreme devuelve un campo extra `top_features`. BE debe mapearlo para mostrar los "triggers" en la interfaz.
