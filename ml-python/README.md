# 🧠 Modelo Integral para el Análisis de Sentimientos (G68 SUPREME)

A diferencia de un análisis de sentimientos genérico, el modelo **G68** utiliza una arquitectura de doble capa que combina **Machine Learning Pro (Calibrated LinearSVC)** con una capa de **Inteligencia Semántica** propietaria:

### 🛡️ Auditoría de Performance (G68 Native Benchmark)
Métricas reales validadas mediante stress tests locales (Lote de 100 peticiones):
- **Latencia de Procesamiento**: **~4.4 ms** 🚀 (Tiempo neto de inferencia).
- **Consumo de Memoria (RAM)**: **~78 MB** 📦 (Ultra-ligero, óptimo para Edge Computing).
- **Throughput (Capacidad)**: **~224 req/s** (Procesamiento masivo concurrente).
- **Precisión (Accuracy)**: **85.0%** en casos complejos (Auditado con lógica de veto).

### 🔬 Compilado de Reglas Semánticas (Explicabilidad Avanzada)
Durante la ejecución, el motor proporciona una auditoría detallada en consola basada en sus pilares lógicos:

1.  **Veto Crítico (Veto Soberano)**: Si se detecta un término de alto riesgo (ej. *estafa, robo, chinches*), el modelo prioriza la alerta y fuerza **Negativo (Certidumbre: 0.99)**.
2.  **Vinculador de Contexto (N-Gram Bonding)**: Análisis de frases compuestas para capturar la esencia de la queja.
3.  **Boost Semántico (1.5x)**: Los intensificadores multiplican el peso del sentimiento detectado.
4.  **Mapeo 1-a-1 de Áreas**: Clasificación automática entre 5 Departamentos Críticos: **Marketing, Operaciones, Higiene, Atencion, Admin**.
5.  **Lógica de Contraste ("Reset Emocional")**: Identificación de conectores (*pero, aunque*) para detectar ironía.
6.  **Inversión Semántica**: Manejo experto de negaciones mediante ventana de lookback.

## 📁 Estructura del Proyecto
```text
ml-python/
├── data/
│   ├── models/        # Modelos entrenados (.pkl)
│   └── raw/           # Master Dataset y Benchmarks
├── notebooks/         # Reporte técnico interactivo (G68 Playground)
├── src/
│   ├── app/           # Punto de entrada de la API y Motor Híbrido
│   └── engine/        # Motor de IA (SentimentEngine)
├── utils/             # Scripts de limpieza y consolidación
└── requirements.txt   # Dependencias de Data Science
```

## 🛠️ Instalación y Ejecución
1. **Instalar dependencias:** `pip install -r requirements.txt`
2. **Ejecutar la API:** `python src/app/main.py` (Puerto 8080)

## 📊 Documentación y Swagger
- **Notebook**: `/ml-python/notebooks/Reporte_Modelado_Sentimiento.ipynb`
- **Swagger UI**: [http://localhost:8080/docs](http://localhost:8080/docs)
