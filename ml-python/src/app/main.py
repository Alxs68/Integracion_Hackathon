from fastapi import FastAPI
from pydantic import BaseModel
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from src.engine.sentiment_engine import SentimentEngine

app = FastAPI()
engine = SentimentEngine()

class SentimentRequest(BaseModel):
    text: str

@app.post("/predict/sentiment")
async def predict_sentiment(request: SentimentRequest):
    # IMPORTANTE: Llamamos a predict y retornamos el resultado directamente
    resultado = engine.predict(request.text)
    return resultado