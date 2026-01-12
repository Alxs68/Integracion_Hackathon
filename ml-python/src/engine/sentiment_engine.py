import numpy as np
import re
import json
import os
import math
from nltk.stem import SnowballStemmer

# 1. Configuración del Motor
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LEXICON_PATH = os.path.join(BASE_DIR, "data", "raw", "lexicon_final_optimizado.json")
stemmer = SnowballStemmer('spanish')

def load_and_stem_lexicon(path):
    if not os.path.exists(path): return {}
    try:
        with open(path, 'r', encoding='utf-8-sig') as f:
            data = json.load(f)
            return {stemmer.stem(k): v for k, v in data.items()}
    except: return {}

LEXICON_G68 = load_and_stem_lexicon(LEXICON_PATH)

def analizar_sentimiento_hibrido(texto, modelo, vectorizador):
    """
    Motor G68 SUPREME-ULTIMATE: Verificado y Blindado.
    """
    # --- 1. LIMPIEZA ---
    if not isinstance(texto, str): texto = ""
    texto_limpio = re.sub(r'[^a-zñáéíóúü\s]', ' ', texto.lower())
    tokens = [t.strip() for t in texto_limpio.split() if t.strip()]
    
    if len(tokens) < 2:
        return "Neutro", 0.5, {"explicabilidad": {"triggers": ["Texto muy corto"], "areas": []}}

    # --- 2. CAPA BASE (ML) ---
    vector = vectorizador.transform([texto_limpio])
    probs = modelo.predict_proba(vector)[0]
    conf_pos_ml = probs[2]

    # --- 3. DICCIONARIOS DE APOYO ---
    negations = {'no', 'sin', 'nunca', 'jamas', 'tampoco', 'ni', 'nada', 'ningun', 'ninguna'}
    intensifiers = {'muy', 'super', 'bastante', 'extremadamente', 'totalmente', 'increiblemente', 'realmente'}
    contrastes = {'pero', 'aunque', 'sin embargo', 'pena', 'malo', 'lastima', 'fallo', 'problema', 'pésimo', 'horror'}
    fillers = {'hay', 'esta', 'está', 'es', 'son', 'estan', 'están', 'tiene', 'tienen', 'existe', 'existen', 'parece', 'seria', 'era'}
    neg_actions = {'funcion', 'limpi', 'hay', 'cumpl', 'serv', 'exist', 'respond', 'atend', 'ayud', 'pued', 'tien'}
    entities = {'habitación', 'habitacion', 'hotel', 'cama', 'personal', 'recepción', 'wifi', 'baño', 'bano', 'comida', 'desayuno', 'atención', 'precio', 'ubicación', 'aire', 'ruido', 'limpieza', 'piscina', 'instalaciones', 'servicio'}

    ELITE_LEX = {
        'rompedor': 0.8, 'exquisit': 0.9, 'soberbi': 0.8, 'impecabl': 0.9,
        'bunker': -0.7, 'moho': -0.8, 'sangre': -0.9, 'cucaracha': -0.9,
        'estaf': -0.9, 'rob': -0.9, 'inundacion': -0.9, 'venen': -0.8,
        'ignor': -0.9, 'despreci': -0.8, 'indiferent': -0.7, 'lent': -0.6,
        'pobr': -0.7, 'viej': -0.6, 'sucio': -0.8, 'asco': -0.8, 'manch': -0.7, 
        'caos': -0.8, 'ruid': -0.6, 'fri': -0.5, 'mediocr': -0.8, 'carisim': -0.8,
        'terror': -1.0, 'horror': -1.0
    }

    LISTA_NEGRA = {'suci', 'asc', 'cucarach', 'chinch', 'sangr', 'moh', 'rob', 'estaf', 'pelos', 'humed', 'rancio', 'maltrat'}

    # --- 4. ESCANEO INVERSO ---
    ajuste_semantico = 0.0
    palabras_detectadas = []
    current_multiplier = 1.0
    anclaje_negativo = False
    es_veto_critico_global = False

    for i in reversed(range(len(tokens))):
        word = tokens[i]
        
        # Manejo de conectores y saltos (Sintaxis Corregida)
        if word in negations or word == "pero" or word in intensifiers:
            if word == "pero" or word in contrastes:
                current_multiplier = 0.5 
            continue

        root = stemmer.stem(word)
        es_esta_palabra_veto = False
        pfx_temp = ""
        found_modifier = False
        
        # Modificadores (Lookahead en reverso)
        if i > 0 and (tokens[i-1] in negations or tokens[i-1] in intensifiers):
            pfx_temp = f"{tokens[i-1]} "
            found_modifier = True
        elif i > 1 and (tokens[i-2] in negations or tokens[i-2] in intensifiers) and tokens[i-1] in fillers:
            pfx_temp = f"{tokens[i-2]} "
            found_modifier = True

        # Puntuación Semántica
        if root in ELITE_LEX: base_score = ELITE_LEX[root]
        elif root in LEXICON_G68: base_score = float(LEXICON_G68[root][0])
        else: continue

        modifier = 1.0
        if i > 0 and tokens[i-1] in negations: modifier = -1.6
        elif i > 0 and tokens[i-1] in intensifiers: modifier = 2.0

        word_score = (base_score * modifier) * current_multiplier
        
        if (base_score * modifier) < -0.30:
            anclaje_negativo = True
            if root in LISTA_NEGRA:
                es_veto_critico_global = True
                es_esta_palabra_veto = True

        ajuste_semantico += word_score

        # --- 5. VINCULADOR DE FRASES (Lógica Limpia) ---
        phrase = word
        phrase_detected = False
        entity_near = ""
        
        # Búsqueda de entidad cercana
        for offset in [-1, 1, -2, 2]:
            idx = i + offset
            if 0 <= idx < len(tokens) and tokens[idx] in entities:
                entity_near = tokens[idx]
                break
        
        if entity_near:
            clean_pfx = pfx_temp if (pfx_temp and pfx_temp.strip() not in intensifiers) else ""
            if tokens.index(entity_near) < i:
                phrase = f"{entity_near} {clean_pfx}{word}".replace("  ", " ").strip()
            else:
                phrase = f"{clean_pfx}{word} {entity_near}".replace("  ", " ").strip()
            phrase_detected = True
        elif pfx_temp:
            phrase = word if pfx_temp.strip() in intensifiers else f"{pfx_temp}{word}"

        # Guardar para explicabilidad
        tag = "VETO" if es_esta_palabra_veto else ""
        label = f"{tag}({phrase})" if tag else f"{phrase}({word_score:.1f})"
        palabras_detectadas.append(label)

    # --- 6. FUSIÓN Y DECISIÓN ---
    impacto = 0.8 if es_veto_critico_global else 0.4
    p_final = max(0.0, min(1.0, conf_pos_ml + (ajuste_semantico * impacto)))
    if es_veto_critico_global: p_final = 0.10

    # Sarcasmo
    fake_pos = {'gracias', 'lujo', 'genial', 'excelente'}
    if tokens and tokens[0] in fake_pos and ajuste_semantico < 0:
        p_final = 0.15

    if p_final < 0.36: prevision = "Negativo"
    elif p_final > 0.60: prevision = "Positivo"
    else: prevision = "Neutro"

    # --- 7. METADATA FINAL ---
    triggers_clean = []
    areas_clean = set()
    for item in palabras_detectadas:
        clean_w = item.split('(')[1].replace(')', '') if '(' in item else item
        if any(stop in clean_w for stop in {'un', 'el', 'la', 'muy', 'tan'}):
            clean_w = " ".join([w for w in clean_w.split() if w not in intensifiers])
        
        if clean_w not in triggers_clean:
            triggers_clean.append(clean_w)
            for part in clean_w.split():
                st = stemmer.stem(part)
                if st in LEXICON_G68 and len(LEXICON_G68[st]) > 1:
                    areas_clean.add(LEXICON_G68[st][1])

    return prevision, round(p_final, 4), {
        "explicabilidad": {"triggers": triggers_clean[:3], "areas": list(areas_clean)}
    }