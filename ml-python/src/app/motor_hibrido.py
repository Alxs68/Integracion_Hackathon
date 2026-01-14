import re
import os
import sys
from nltk.stem import SnowballStemmer

# Blindaje de rutas
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from config_g68 import DICCIONARIO_PESOS, KEYWORDS_DEPT
except ImportError:
    from .config_g68 import DICCIONARIO_PESOS, KEYWORDS_DEPT

stemmer = SnowballStemmer('spanish')

# --- OPTIMIZACIÓN: Pre-procesamos el diccionario UNA SOLA VEZ ---
DICCIONARIO_STEMMED = {
    " ".join([stemmer.stem(k) for k in key.split()]): val 
    for key, val in DICCIONARIO_PESOS.items()
}

def enriquecer_respuesta(texto, pred_ia, prob_ia):
    txt_lower = (texto or "").lower()
    # Eliminamos puntuación para el análisis de tokens pero mantenemos espacios
    tokens = [t.strip() for t in re.sub(r'[^a-zñáéíóúü\s]', ' ', txt_lower).split() if t.strip()]
    
    negations = {'no', 'sin', 'ni', 'nunca', 'jamás', 'jamas', 'tampoco'}
    intensifiers = {'muy', 'sumamente', 'totalmente', 'completamente', 'bastante', 'extremadamente', 'demasiado', 'realmente'}
    contrast_markers = {'pero', 'aunque', 'mientras', 'excepto', 'lástima', 'lastima', 'sin embargo'}
    
    ajuste_semantico = 0.0
    hallazgos, deptos = set(), set()
    hallazgo_critico = False
    hits = []
    
    # --- DETECCIÓN TEMPRANA DE PATRONES NEUTRALES IDIOMÁTICOS ---
    texto_normalizado = " ".join(tokens)
    patrones_neutrales = ["ni buen ni mal", "ni mal ni buen", "normal"]
    es_neutral_forzado = any(patron in texto_normalizado for patron in patrones_neutrales)
    
    n = len(tokens)
    i = n - 1
    
    while i >= 0:
        encontrado_ngram = False
        # Probamos n-gramas de 4, 3, 2 y 1 palabras (prioridad a los más largos)
        for size in [4, 3, 2, 1]:
            if i - size + 1 >= 0:
                ngram_tokens = tokens[i - size + 1 : i + 1]
                ngram_stemmed = " ".join([stemmer.stem(t) for t in ngram_tokens])
                peso = DICCIONARIO_STEMMED.get(ngram_stemmed, 0)
                
                if peso != 0:
                    mult = 1.0
                    # Intensificador antes del n-grama
                    if i - size >= 0 and tokens[i - size] in intensifiers:
                        mult = 1.3
                    
                    # Negación antes del n-grama (ventana de 3 tokens)
                    negado = False
                    for j in range(1, 4):
                        if i - size + 1 - j >= 0 and tokens[i - size + 1 - j] in negations:
                            negado = True
                            break
                    
                    if negado:
                        if peso > 0:
                            mult = -1.2 # "no bueno" -> negativo fuerte
                        else:
                            mult = 0.0 # "no malo" -> neutralizar (no lo hacemos positivo para ser conservadores)
                    
                    peso_adj = peso * mult
                    hits.append({'peso': peso_adj, 'pos': i, 'word': " ".join(ngram_tokens), 'original_peso': peso})
                    
                    if peso_adj <= -0.8: hallazgo_critico = True
                    
                    # Mapeo de Departamentos
                    encontrado_depto = False
                    for depto, mapeo in KEYWORDS_DEPT.items():
                        for k_map, v_map in mapeo.items():
                            if " ".join([stemmer.stem(x) for x in k_map.split()]) == ngram_stemmed:
                                hallazgos.add(f"{v_map} ({' '.join(ngram_tokens)})")
                                deptos.add(depto)
                                encontrado_depto = True
                    
                    if not encontrado_depto and abs(peso_adj) > 0.2:
                        hallazgos.add(f"Contexto: {' '.join(ngram_tokens)}")
                        deptos.add("General")
                    
                    i -= size
                    encontrado_ngram = True
                    break
        if not encontrado_ngram:
            i -= 1

    # --- PROTECCIÓN CONTRA SARCASMO Y CONTRASTES ---
    # Si hay hallazgos muy negativos o marcadores de contraste, bajamos el peso de lo positivo
    tiene_señal_negativa_fuerte = any(h['peso'] < -0.4 for h in hits)
    contiene_contraste = any(t in contrast_markers for t in tokens)
    
    for h in hits:
        p_final = h['peso']
        # Penalizar palabras positivas en contextos de queja (Sarcasmo)
        if p_final > 0 and (tiene_señal_negativa_fuerte or contiene_contraste):
            p_final *= 0.2 # Reducción agresiva para "Excelente... pero sucio"
        ajuste_semantico += p_final

    # --- LÓGICA DE DECISIÓN G68 SUPREME ---
    prob_ia_val = float(prob_ia)
    
    if es_neutral_forzado:
        final_pred = "Neutro"
        prob_final = 0.5000
        motivo_prob = "Expresión Neutra Idiomática"
    elif hallazgo_critico:
        final_pred = "Negativo"
        prob_final = 0.99
        motivo_prob = "Veto Crítico (G68)"
    elif ajuste_semantico <= -0.4:
        final_pred = "Negativo"
        prob_final = 0.95 if pred_ia == "Negativo" else 0.85
        motivo_prob = "Ajuste Semántico Negativo"
    elif ajuste_semantico >= 0.4:
        final_pred = "Positivo"
        prob_final = 0.95 if pred_ia == "Positivo" else 0.85
        motivo_prob = "Ajuste Semántico Positivo"
    elif abs(ajuste_semantico) < 0.25:
        final_pred = "Neutro"
        prob_final = 0.5000
        motivo_prob = "Neutralidad Detectada"
    else:
        final_pred = pred_ia
        prob_final = prob_ia_val
        motivo_prob = "IA Base + Refinamiento"

    # --- AUDITORÍA INTERNA ---
    print(f"\n🔍 [G68 AUDIT] Texto: '{texto[:60]}...'")
    print(f"   ├─ IA Sugiere: {pred_ia} ({prob_ia_val:.4f})")
    print(f"   ├─ Ajuste Semántico: {ajuste_semantico:.2f}")
    if hits:
        print(f"   ├─ Señales: {[h['word'] for h in hits]}")
    print(f"   ├─ Áreas: {list(deptos) if deptos else ['General']}")
    print(f"   └─ VEREDICTO: {final_pred} ({prob_final:.4f})")

    prioridad = "CRÍTICA" if hallazgo_critico else "Normal"
    color = "#D32F2F" if final_pred == "Negativo" else ("#2E7D32" if final_pred == "Positivo" else "#757575")
    prefijo = "[+] " if final_pred == "Positivo" else ("[-] " if final_pred == "Negativo" else "")

    return {
        "previsión": f"{prefijo}{final_pred}",
        "probabilidad": round(prob_final, 4),
        "explicabilidad": {
            "hallazgos": sorted(list(hallazgos)) if hallazgos else ["Análisis contextual"],
            "departamentos": sorted(list(deptos)) if deptos else ["General"],
            "visualizacion_frontend": {"prioridad": prioridad, "color_alerta": color}
        }
    }
