import os
import sys
from fastapi import FastAPI
from pydantic import BaseModel

# --- CONFIGURACIÓN DE RUTAS ---
current_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.dirname(current_dir)
if src_dir not in sys.path:
    sys.path.append(src_dir)

from engine.sentiment_engine import SentimentEngine
from motor_hibrido import enriquecer_respuesta

app = FastAPI(
    title="G68 Sentiment API",
    description="Motor de Análisis de Sentimiento - NoCountry Hackathon"
)

# Inicializamos el motor de IA
ai_engine = SentimentEngine()

class SentimentRequest(BaseModel):
    text: str

@app.get("/")
def home():
    return {"status": "G68 Online", "model_loaded": ai_engine.model is not None}

@app.post("/predict/sentiment")
@app.post("/sentiment")
async def predict(request: SentimentRequest):
    """
    Endpoint para análisis de sentimiento.
    Cumple estrictamente con el contrato: {'prevision': str, 'probabilidad': float}
    """
    # 1. Validación básica
    if not request.text or len(request.text.strip()) < 3:
        return {"prevision": "Neutro", "probabilidad": 0.5, "note": "Texto muy corto"}

    # 2. Predicción Base IA
    pred_ia, prob_ia = ai_engine.predict_raw(request.text)
    
    # 3. Refinamiento con Motor Híbrido (Interno)
    res_hibrido = enriquecer_respuesta(request.text, pred_ia, prob_ia)
    
    # 4. Formateo de salida estricto con los dos campos oficiales
    # Limpiamos prefijos si existen
    label = res_hibrido["previsión"].replace("[+] ", "").replace("[-] ", "")
    
    return {
        "prevision": label,
        "probabilidad": float(res_hibrido["probabilidad"])
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
