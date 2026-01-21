# Proyecto de Análisis de Sentimiento - Equipo G68 🚀

Bienvenido al sistema de análisis de opiniones desarrollado por el equipo G68. Este proyecto conecta un modelo de Inteligencia Artificial con una interfaz web amigable para visualizar los resultados en tiempo real.

## 🏗️ ¿Cómo está organizado?

Dividimos el proyecto en tres partes principales para mantener el orden:

1.  **Interfaz Web (Frontend)**: Es la página que ve el usuario. Muestra los gráficos y permite escribir textos para analizar.
2.  **Servidor Principal (Java)**: Es el "cerebro" que conecta todo. Recibe los datos de la web y los guarda.
3.  **Motor de IA (Python)**: Es el experto. Recibe el texto y nos dice si el sentimiento es Positivo, Negativo o Neutral.

## 🚀 Guía de Inicio Rápido

Para poner todo en marcha, sigue estos pasos:

### 1. Encender la Inteligencia Artificial
```bash
cd ml-python
pip install -r requirements.txt
python -m uvicorn src.app.main:app --port 8080
```

### 2. Iniciar el Servidor
```bash
cd backend-java/api
./mvnw spring-boot:run
```

### 3. Abrir la Web
Entra en tu navegador a: `http://localhost:8000`

## 📂 Carpetas del Proyecto

- `/backend-java`: Código del servidor en Java.
- `/ml-python`: Modelos de IA y scripts de Python.
- `/frontend`: Archivos de la página web (HTML, CSS, JS).
- `/scripts`: Herramientas útiles.
- `/docs`: Documentación y manuales.

## ✨ Lo que hace nuestro sistema

- **Análisis Inteligente**: Entiende si un comentario es bueno o malo.
- **Gráficos en Vivo**: Muestra estadísticas al instante.
- **Detector de Confianza**: Nos dice qué tan seguro está el modelo de su respuesta (ahora con gráfico de caja).
- **Historial**: Guarda todo lo que analizamos para revisarlo después.