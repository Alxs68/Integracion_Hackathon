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
    tokens = [t.strip() for t in re.sub(r'[^a-zñáéíóúü\s]', ' ', txt_lower).split() if t.strip()]
    
    negations = {'no', 'sin', 'ni', 'nunca', 'jamás', 'jamas'}
    intensifiers = {'muy', 'sumamente', 'totalmente', 'completamente', 'bastante', 'extremadamente', 'demasiado'}
    contrast_markers = {'pero', 'aunque', 'mientras', 'excepto', 'lástima', 'lastima', 'si', 'cuando'}
    
    ajuste_semantico = 0.0
    hallazgos, deptos = set(), set()
    hallazgo_critico = False
    hits = []
    
    n = len(tokens)
    i = n - 1
    
    while i >= 0:
        encontrado_ngram = False
        for size in [3, 2, 1]:
            if i - size + 1 >= 0:
                ngram_tokens = tokens[i - size + 1 : i + 1]
                ngram_stemmed = " ".join([stemmer.stem(t) for t in ngram_tokens])
                peso = DICCIONARIO_STEMMED.get(ngram_stemmed, 0)
                if peso != 0:
                    mult = 1.0
                    if i - size >= 0 and tokens[i - size] in intensifiers: mult = 1.5
                    for j in range(1, 4):
                        if i - size + 1 - j >= 0 and tokens[i - size + 1 - j] in negations:
                            mult *= -2.0
                            break
                    
                    peso_adj = peso * mult
                    hits.append({'peso': peso_adj, 'pos': i, 'word': " ".join(ngram_tokens)})
                    if peso_adj <= -0.8: hallazgo_critico = True
                    
                    # Deptos y Hallazgos
                    encontrado_depto = False
                    for depto, mapeo in KEYWORDS_DEPT.items():
                        for k_map, v_map in mapeo.items():
                            if " ".join([stemmer.stem(x) for x in k_map.split()]) == ngram_stemmed:
                                hallazgos.add(f"{v_map} ({' '.join(ngram_tokens)})")
                                deptos.add(depto)
                                encontrado_depto = True
                    if not encontrado_depto:
                        hallazgos.add(f"Contexto: {' '.join(ngram_tokens)}")
                        deptos.add("General")
                    
                    i -= size
                    encontrado_ngram = True
                    break
        if not encontrado_ngram: i -= 1

    # --- PROTECCIÓN CONTRA SARCASMO ---
    has_neg = any(h['peso'] < 0 for h in hits)
    contains_contrast = any(t in contrast_markers for t in tokens)
    
    for h in hits:
        peso_final = h['peso']
        if peso_final > 0 and (has_neg or contains_contrast):
            peso_final *= 0.3 
        ajuste_semantico += peso_final

    # --- LÓGICA DE CERTIDUMBRE G68 ---
    prob_ia_val = float(prob_ia)
    
    if hallazgo_critico:
        final_pred = "Negativo"
        prob_final = 0.9999
        motivo_prob = "Veto Crítico (G68)"
    elif ajuste_semantico <= -0.4:
        final_pred = "Negativo"
        prob_final = 0.95 if pred_ia == "Negativo" else 0.85
        motivo_prob = "Ajuste Semántico Negativo"
    elif ajuste_semantico >= 0.5:
        final_pred = "Positivo"
        prob_final = 0.95 if pred_ia == "Positivo" else 0.85
        motivo_prob = "Ajuste Semántico Positivo"
    elif abs(ajuste_semantico) < 0.2 and prob_ia_val < 0.6:
        final_pred = "Neutro"
        prob_final = 0.5000
        motivo_prob = "Incertidumbre / Neutralidad"
    else:
        final_pred = pred_ia
        prob_final = prob_ia_val
        motivo_prob = "IA Base + Estabilidad Semántica"

    # --- LOG DE AUDITORÍA (Solo Consola) ---
    print(f"\n🔍 [G68 AUDIT] Texto: '{texto[:60]}...'")
    print(f"   ├─ IA Sugiere: {pred_ia} ({prob_ia_val:.4f})")
    print(f"   ├─ Ajuste Semántico: {ajuste_semantico:.2f}")
    if hits:
        print(f"   ├─ Señales detectadas: {[h['word'] for h in hits]}")
    print(f"   ├─ Áreas afectadas: {list(deptos) if deptos else ['General']}")
    print(f"   ├─ Motivo Probabilidad: {motivo_prob}")
    print(f"   └─ VEREDICTO FINAL: {final_pred} ({prob_final:.4f})")

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
