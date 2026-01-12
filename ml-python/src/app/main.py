from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib, os, sys

# 1. Rutas y Carga
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.join(BASE_DIR, "src"))
from engine.sentiment_engine import analizar_sentimiento_hibrido

app = FastAPI(title="G68 SUPREME - VERSIÓN FINAL UNIFICADA")

# Carga segura de modelos
try:
    model = joblib.load(os.path.join(BASE_DIR, "data", "models", "sentiment_model.pkl"))
    vectorizer = joblib.load(os.path.join(BASE_DIR, "data", "models", "tfidf_vectorizer.pkl"))
except:
    model, vectorizer = None, None

class TextIn(BaseModel):
    text: str

@app.post("/predict/sentiment")
async def predict_sentiment(request: TextIn):
    # LLAMADA AL MOTOR HÍBRIDO
    resultado, prob, meta = analizar_sentimiento_hibrido(request.text, model, vectorizer)
    
    texto = request.text.lower()
    hallazgos, areas = [], set()

    # 2. DICCIONARIO MAESTRO G68 - VERSIÓN FINAL INTEGRAL (BLINDADA)
    conceptos = [
        # --- HIGIENE (Limpieza y Salud) ---
        ("Higiene", ["sucio", "suciedad", "mugre", "puerco", "cochinada", "asco"], "Deficiencia Grave de Limpieza"),
        ("Higiene", ["habitacion", "habitación", "sucia", "polvo", "pelos", "sabana", "sábana"], "Falta de aseo en cuarto/lencería"),
        ("Higiene", ["moho", "humedad", "hongo", "mancha"], "Problemas Sanitarios/Humedad"),
        ("Higiene", ["olia", "olía", "pestazo", "apestaba", "cigarrillo", "humo", "tabaco"], "Malos Olores/Tabaco detectado"),
        ("Higiene", ["cucaracha", "insecto", "bicho", "plaga", "chinche", "hormiga"], "Alerta de Control de Plagas"),
        ("Higiene", ["impecable", "limpísimo", "pulcro", "brillante", "limpieza"], "Excelencia en Higiene"),

        # --- ADMINISTRACIÓN / SEGURIDAD (Legal y Ético) ---
        ("Administración", ["estafa", "engaño", "fraude", "robo", "robaron", "hurto", "seguridad"], "Alerta de Seguridad/Legal"),
        ("Administración", ["cobro", "tarjeta", "duplicado", "precio", "caro", "excesivo", "cobraron"], "Incidencia Financiera/Cobros"),
        ("Administración", ["reembolso", "devolución", "dinero", "paguen", "exijo", "deuelvan"], "Reclamo Económico/Devolución"),
        ("Administración", ["publicidad", "falsa", "mentira", "fotos", "engañoso"], "Inconformidad por Publicidad Engañosa"),

        # --- INFRAESTRUCTURA (Mantenimiento y Confort) ---
        ("Infraestructura", ["aire", "calor", "no enfria", "no enfriaba", "no servia", "no servía", "clima"], "Falla en Climatización"),
        ("Infraestructura", ["wifi", "internet", "señal", "lento", "conectividad"], "Falla en Conectividad"),
        ("Infraestructura", ["ruido", "pared", "escucha", "vecinos", "obras", "insoportable", "bullis"], "Contaminación Auditiva"),
        ("Infraestructura", ["cama", "colchon", "colchón", "duro", "viejo", "roto", "almohada"], "Mobiliario Deficiente"),
        ("Infraestructura", ["agua", "caliente", "baño", "ducha", "tapa", "cañeria", "cañería", "fuga"], "Incidencia en Plomería/Servicios"),
        ("Infraestructura", ["luz", "lampara", "foco", "oscuro", "enchufe"], "Falla Eléctrica/Iluminación"),

        # --- SERVICIO (Capital Humano y Experiencia) ---
        ("Servicio", ["personal", "amable", "gentil", "atento", "cordial", "sonrisa", "amor"], "Trato Humano Destacado"),
        ("Servicio", ["recepcion", "recepción", "atencion", "atención", "check-in", "espera"], "Gestión de Servicio/Recepción"),
        ("Servicio", ["grosero", "despota", "dépota", "ignoro", "lento", "mala cara"], "Mala Atención del Personal"),
        ("Servicio", ["desayuno", "comida", "fria", "quemada", "sabor", "rico", "delicioso"], "Inconformidad/Excelencia Gastronómica"),
        ("Servicio", ["pesimo", "pésimo", "terrible", "horror", "malo", "mal", "desastre"], "Experiencia Crítica de Servicio"),
        ("Servicio", ["normal", "adecuado", "estándar", "ok", "bien", "aceptable"], "Servicio Estándar/Aceptable"),
        ("Servicio", ["gracias", "volveré", "recomiendo", "maravilla", "increíble"], "Fidelización de Cliente"),
        ("Servicio", ["arruinar", "vacaciones", "infierno", "peor"], "Impacto Crítico en la Experiencia")
    ]

    for area, req, desc in conceptos:
        if any(p in texto for p in req):
            areas.add(area)
            hallazgos.append(desc)

    # 3. LÓGICA DE LIMPIEZA DE TRIGGERS (Adiós a los números 0.8)
    # Tomamos los triggers del meta y los limpiamos de ruidos numéricos
    raw_triggers = meta.get("explicabilidad", {}).get("triggers", [])
    triggers_limpios = []
    for t in raw_triggers:
        # Si es un string con paréntesis tipo "robo(-0.9)", lo cortamos
        t_clean = str(t).split('(')[0].strip()
        # Solo lo agregamos si no es un número puro (evita los 0.7, 0.1, etc.)
        if not t_clean.replace('.', '', 1).replace('-', '', 1).isdigit():
            triggers_limpios.append(t_clean)

    # Si el texto es "normal" y el modelo se equivoca poniéndolo negativo, corregimos aquí:
    if "normal" in texto or "adecuado" in texto:
        if float(prob) < 0.3: # Si el modelo lo ve muy negativo pero es "normal"
            resultado = "Neutral"
            prob = 0.5

    return {
        "prevision": resultado,
        "probabilidad": round(float(prob), 4),
        "analisis": {
            "hallazgos": list(dict.fromkeys(hallazgos)) if hallazgos else ["Análisis General"],
            "departamentos": list(areas) if areas else ["General"],
            "explicabilidad_limpia": triggers_limpios if triggers_limpios else ["Modelo Base"]
        }
    }