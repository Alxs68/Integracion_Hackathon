# Motor de Inteligencia Artificial - Python

Esta es la parte "inteligente" del proyecto. Aquí procesamos los textos para entender qué sienten los usuarios (Positivo, Negativo o Neutral). Usamos una mezcla de aprendizaje automático y reglas lógicas.

## 🧠 Nuestros Modelos

Guardamos los archivos importantes en `data/models/`:
- `modelo_bilstm.pkl`: Nuestro modelo principal (Deep Learning).
- `vectorizer.pkl`: La herramienta que transforma texto en números.

## 📦 Lo que necesitas instalar

Para que esto funcione, instala las librerías necesarias:

```bash
pip install -r requirements.txt
```

## ▶️ ¿Cómo lo inicio?

Desde la carpeta `ml-python`, corre este comando:

```bash
python -m uvicorn src.app.main:app --port 8080
```
Esto encenderá el servicio en el puerto 8080.

## 🔍 ¿Qué hay aquí dentro?

- `src/app`: El código que recibe las peticiones (`main.py`).
- `src/engine`: La lógica que hace la predicción (`sentiment_engine.py`).
- `scripts/`: Herramientas para probar o entrenar.
- `tests/`: Pruebas para asegurarnos de que no rompimos nada.
