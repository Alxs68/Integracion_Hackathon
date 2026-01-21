# ✅ Checklist de Despliegue (G68 Supreme)

Compañeros, para que la nueva versión "Supreme" les funcione a la primera en sus equipos, asegúrense de cumplir estos requisitos ANTES de correr nada.

## 1. Java (Backend)
- [ ] **Versión:** Deben tener **Java SDK 21**. Confírmalo en terminal: `java -version`.
- [ ] **Variable de Entorno:** Asegura que `JAVA_HOME` apunte a la carpeta del JDK 21.
- [ ] **Prueba:** Entra a `backend-java/api` y corre `./mvnw --version`. Si no sale error, estás listo.

## 2. Python (ML Engine)
- [ ] **Versión:** Recomendado Python 3.10 o superior.
- [ ] **Entorno Virtual:** Es mejor crear uno nuevo para evitar conflictos con librerías viejas.
    ```bash
    cd ml-python
    python -m venv .venv
    # Windows:
    .\.venv\Scripts\activate
    ```
- [ ] **Instalación Limpia:**
    ```bash
    pip install -r requirements.txt
    ```

## 3. Ejecución (El orden importa)
1.  Enciende el cerebro (Python): `python -m uvicorn src.app.main:app --port 8080`
2.  Enciende el cuerpo (Java): `backend-java/api > ./mvnw spring-boot:run`
3.  Abre los ojos (Web): `http://localhost:8000`

## 4. Solución de Problemas Comunes
*   *Error "Port 8080 already in use":* Tienes otro proceso de Python corriendo. Mátalo.
*   *Error "Connection refused":* Olvidaste prender el Python antes que el Java.
*   *Error de base de datos:* Borra la carpeta o archivo `backend-java/api/data` y reinicia el Java.
