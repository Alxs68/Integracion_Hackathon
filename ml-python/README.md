# G68 Sentiment Engine - Fine Tuning Alexis

Esta rama contiene la evolución del motor de análisis de sentimiento hacia un modelo híbrido.

## 🚀 Mejoras Implementadas
- **Motor Híbrido:** Combinación de ML (Scikit-Learn) con un Diccionario Maestro de pesos calibrados para el sector hotelero.
- **Identificación Quirúrgica (+/-):** Los hallazgos ahora se marcan dinámicamente con signos de positividad o negatividad según el contexto de la reseña.
- **Normalización de Datos:** Inclusión del campo `texto_limpio` en la respuesta para auditoría de procesamiento.

## 📊 Estructura de Salida (JSON)
El API responde con los siguientes campos normalizados:
- `previsibilidad`: Calificación categórica (Positivo, Negativo, Neutral).
- `probabilidad`: Valor numérico (0.0 a 1.0) con ajuste de pesos.
- `explicabilidad`: Detalle de hallazgos por departamento y método utilizado.