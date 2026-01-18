# 🧠 Modelo Integral para el Análisis de Sentimientos

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E?logo=scikitlearn)](https://scikit-learn.org/)

## 🌟 Propuesta de Valor
A diferencia de los motores de análisis genéricos, el **Modelo G68** ha sido diseñado bajo una arquitectura de **Doble Capa**. Combina la potencia del Machine Learning estadístico (*Calibrated LinearSVC*) con una capa propietaria de **Inteligencia Semántica** que garantiza la seguridad del negocio ante casos críticos (ironía, crisis de marca y quejas de seguridad).

---

## 🏎️ Rendimiento Validado (Benchmark G68)
El motor ha sido sometido a pruebas de estrés locales para asegurar una integración fluida con el ecosistema Backend/Frontend:

| Métrica | Resultado | Valor de Negocio |
| :--- | :--- | :--- |
| **Latencia Real** | **4.15 ms** 🚀 | Respuesta instantánea en la interfaz. |
| **Uso de RAM** | **77.89 MB** 📦 | Optimizado para microservicios ligeros. |
| **Throughput** | **+220 req/s** | Capacidad de análisis masivo en tiempo real. |
| **Precisión** | **85.0%** | Alta fiabilidad en clasificaciones ternarias. |

---

## 🔬 Pilares Tecnológicos del Motor
Nuestra lógica de "Vanguardia Semántica" se basa en 3 pilares clave:

1. **Veto Crítico**: Identificación inmediata de términos de alto impacto para la seguridad y reputación del negocio.
2. **Vinculador de Contexto**: Análisis de frases compuestas para capturar la intención real del feedback.
3. **Detector de Sarcasmo e Ironía**: Capacidad de neutralizar falsos positivos mediante análisis de conectores de contraste.

---

## 📁 Ecosistema de Entrega
```text
ml-python/
├── data/              # Datasets y modelos (.pkl)
├── src/
│   ├── app/           # API FastAPI y lógica híbrida
│   └── engine/        # Motor de IA (SentimentEngine)
├── scripts/           # Entrenamiento y Benchmarks
├── tests/             # Pruebas automatizadas
└── requirements.txt   # Dependencias de Data Science
```

## 🛠️ Instalación y Ejecución
1. **Instalar dependencias:** `pip install -r requirements.txt`
2. **Ejecutar la API:** 
   ```bash
   cd src/app
   uvicorn main:app --host 0.0.0.0 --port 8080
   ```

## 📊 Documentación y Swagger
- **Notebook**: `/ml-python/notebooks/Reporte_Modelado_Sentimiento.ipynb`
- **Contrato Técnico (Swagger)**: [http://localhost:8080/docs](http://localhost:8080/docs)

---
> **Nota de Equipo:** Este proyecto representa la unión entre Data Science y una visión de negocio orientada a la toma de decisiones basada en datos.

---
