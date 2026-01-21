# 🚀 Guía de Lanzamiento - Sistema Híbrido G68

Este proyecto utiliza **Java 21 (LTS)** y **Python 3.10+**. Para que el sistema funcione correctamente en sus equipos tras bajar la rama, sigan estos pasos:

## 1. Requisitos Previos
*   **JDK 21:** Es obligatorio (Recomendado: Microsoft OpenJDK 21).
*   **Python:** Con el entorno virtual activado y dependencias instaladas.

## 2. Configuración de Java (Terminal PowerShell)
Si el comando `.\mvnw` arroja un error de versión o de `JAVA_HOME`, ejecuten este bloque antes de lanzar (ajusten la ruta si es necesario):

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.5.11-hotspot"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path
```

## 3. Comandos de Ejecución
Sigan este orden en terminales separadas:

### A. Servicio ML (Python)
```powershell
python ml-python/src/app/main.py
```

### B. Backend API (Java 21)
```powershell
cd backend-java/api
.\mvnw spring-boot:run
```

## 4. Visualización
Accedan a la interfaz avanzada en:
👉 [http://localhost:8000/index.html](http://localhost:8000/index.html)

---
*G68 - Calidad y Sentimiento en Tiempo Real* 🚀
