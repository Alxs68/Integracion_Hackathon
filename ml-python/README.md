# 🧠 Motor Híbrido G68 SUPREME (Arquitectura de Vanguardia)

A diferencia de un análisis de sentimientos genérico, el modelo **G68** utiliza una arquitectura de doble capa que combina **Machine Learning Pro (Calibrated LinearSVC)** con una capa de **Inteligencia Semántica** propietaria:

### 🛡️ Auditoría de Performance (Benchmark G68)
Basado en auditorías masivas de estrés y benchmarks de 100/200 muestras:
- **Latencia Media**: **< 4.0 ms** / req (Ultra-rápido).
- **RAM Máxima**: **~160 MB** (Ligero para despliegue).
- **Throughput**: **> 300 req/s** (Alta escalabilidad).
- **Precisión (Accuracy)**: **85.0%** en casos de alta complejidad (Sarcasmo, Veto, Contexto).

### 🔬 Compilado de Reglas Semánticas (Explicabilidad Avanzada)
El motor argumenta sus predicciones basándose en sus pilares lógicos:

1.  **Veto Crítico (Veto Soberano)**: Si se detecta un término de alto riesgo (ej. *estafa, robo, chinches*), el modelo prioriza la alerta y fuerza **Negativo**. Seguridad ante todo.
2.  **Vinculador de Contexto (N-Gram Bonding)**: El motor analiza frases compuestas (N-Gramas) para capturar la esencia de la queja más allá de palabras sueltas.
3.  **Boost Semántico (1.5x)**: Los intensificadores (ej. *muy, sumamente*) multiplican el peso del sentimiento detectado.
4.  **Mapeo 1-a-1 de Áreas**: Cada palabra clave se vincula a uno de los **5 Departamentos Críticos**: **Marketing, Operaciones, Higiene, Atencion, Admin**.
5.  **Lógica de Contraste ("Reset Emocional")**: Detectamos conectores críticos (*pero, aunque*). El sistema identifica el contraste para castigar elogios falsos en contextos de queja.
6.  **Detector de Sarcasmo Estructural**: Identifica patrones irónicos (*"Qué maravilla..."* + *"estafa"*) forzando la clasificación correcta.
7.  **Inversión Semántica (Lookback de 3 niveles)**: Maneja negaciones y dobles negaciones complejas mediante un análisis de ventana hacia atrás.

### 📊 Datos y Entrenamiento de Élite
- **Dataset**: Procesado con limpieza de ruido y normalización de caracteres españoles (ñ/acentos).
- **Modelo**: LinearSVC calibrado para entrega de probabilidades reales de confianza.
- **Rendimiento**: Optimizado para un **Recall Negativo** superior al 90%, garantizando que ninguna crisis reputacional pase desapercibida.

## 📁 Estructura del Proyecto
```text
ml-python/
├── data/
│   └── models/        # Modelos entrenados (.pkl)
├── notebooks/         # Reporte técnico interactivo (G68 Playground)
├── src/
│   ├── app/           # Punto de entrada de la API y Motor Híbrido
│   └── engine/        # Motor de IA (SentimentEngine)
└── requirements.txt   # Dependencias de Data Science
```

## 🛠️ Instalación y Ejecución
1. **Instalar dependencias:** `pip install -r requirements.txt`
2. **Ejecutar la API:** `python src/app/main.py` (Puerto 8080)

## 📊 Documentación y Swagger
- **Notebook**: `/ml-python/notebooks/Reporte_Modelado_Sentimiento.ipynb`
- **Swagger UI**: [http://localhost:8080/docs](http://localhost:8080/docs)
- **Root**: [http://localhost:8080](http://localhost:8080)