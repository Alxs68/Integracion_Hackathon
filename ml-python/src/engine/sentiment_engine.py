import joblib, os
from .config_g68 import DICCIONARIO_PESOS, KEYWORDS_DEPT 

class SentimentEngine:
    def __init__(self):
        self.model, self.vectorizer = None, None
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        rutas = [
            os.path.join(current_dir, '..', '..', '..', 'models'), 
            os.path.join(current_dir, '..', '..', 'models'),
            os.path.join(os.getcwd(), 'models')
        ]

        for r in rutas:
            m_p = os.path.join(r, 'sentiment_model.pkl')
            v_p = os.path.join(r, 'tfidf_vectorizer.pkl')
            if os.path.exists(m_p):
                try:
                    self.model = joblib.load(m_p)
                    self.vectorizer = joblib.load(v_p)
                    break
                except: continue

    def predict(self, text: str):
        try:
            txt_limpio = text.lower().strip()
            
            # 1. ML
            prob_ml = 0.5
            if self.model and self.vectorizer:
                vec = self.vectorizer.transform([txt_limpio])
                prob_ml = self.model.predict_proba(vec)[0][1]
            
            # 2. Ajuste
            aj_pos = sum(w for k, w in DICCIONARIO_PESOS.items() if k in txt_limpio and w > 0)
            aj_neg = sum(w for k, w in DICCIONARIO_PESOS.items() if k in txt_limpio and w < 0)
            final_p = max(0.0, min(1.0, prob_ml + aj_pos + (aj_neg * 1.5)))
            
            # 3. Previsibilidad
            if final_p > 0.6: prev = "Positivo"
            elif final_p < 0.4: prev = "Negativo"
            else: prev = "Neutral"

            # 4. Hallazgos
            hall_fin = []
            depts = set()
            queja_g = any(DICCIONARIO_PESOS.get(w, 0) < 0 for w in txt_limpio.split())

            for d, kws in KEYWORDS_DEPT.items():
                for k, desc in kws.items():
                    if k in txt_limpio:
                        depts.add(d)
                        peso = DICCIONARIO_PESOS.get(k, 0)
                        if peso < 0 or (queja_g and k in ["comida", "desayuno", "baño", "cama", "aire"]):
                            hall_fin.append(f"(-) {desc}")
                        elif peso > 0:
                            hall_fin.append(f"(+) {desc}")
                        else:
                            hall_fin.append(desc)

            return {
                "previsibilidad": prev,
                "probabilidad": round(float(final_p), 4),
                "explicabilidad": {
                    "texto_limpio": txt_limpio,
                    "hallazgos": list(set(hall_fin)) if hall_fin else ["Sin hallazgos"],
                    "departamentos": list(depts) if depts else ["General"],
                    "metodo": "G68 Híbrido"
                }
            }
        except Exception as e:
            return {"error": str(e)}