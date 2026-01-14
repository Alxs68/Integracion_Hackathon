import joblib
import os
import sys
import re
from nltk.stem import SnowballStemmer

# 1. Configuración de Rutas (Para encontrar config_g68)
current_dir = os.path.dirname(os.path.abspath(__file__)) # src/engine
src_dir = os.path.dirname(current_dir)                   # src
app_dir = os.path.join(src_dir, 'app')

if app_dir not in sys.path:
    sys.path.append(app_dir)

# Importamos el diccionario
try:
    from config_g68 import DICCIONARIO_PESOS, KEYWORDS_DEPT
except ImportError:
    # Intento de respaldo si está en la misma carpeta o ruta de src
    try:
        from .config_g68 import DICCIONARIO_PESOS, KEYWORDS_DEPT
    except:
        pass

class SentimentEngine:
    def __init__(self):
        self.model, self.vectorizer = None, None
        self.stemmer = SnowballStemmer('spanish')
        
        # 2. Búsqueda inteligente de modelos
        base_project = os.path.dirname(src_dir) 
        
        rutas_posibles = [
            os.path.join(base_project, 'data', 'models'),
            os.path.join(os.getcwd(), 'data', 'models'),
            os.path.join(current_dir, '..', '..', 'data', 'models')
        ]

        for path in rutas_posibles:
            m_path = os.path.join(path, 'sentiment_model.pkl')
            v_path = os.path.join(path, 'tfidf_vectorizer.pkl')
            
            if os.path.exists(m_path):
                try:
                    self.model = joblib.load(m_path)
                    self.vectorizer = joblib.load(v_path)
                    print(f"✅ Modelos ML cargados exitosamente desde: {path}")
                    break
                except Exception as e:
                    print(f"❌ Error al cargar .pkl en {path}: {e}")
        
        if not self.model:
            print("⚠️ Advertencia: No se encontraron los archivos .pkl. La IA usará valores Neutrales por defecto.")

    def predict_raw(self, text: str):
        """Predicción técnica con lógica de IA cruda."""
        if not self.model or not self.vectorizer:
            return "Neutral", 0.5
            
        txt_limpio = re.sub(r'[^a-zñáéíóúü\s]', ' ', text.lower())
        vec = self.vectorizer.transform([txt_limpio])
        
        # Mapa: 0: Negativo, 1: Neutro, 2: Positivo
        probs = self.model.predict_proba(vec)[0]
        
        idx_max = probs.argmax()
        pred = self.model.classes_[idx_max]
        
        # Usamos la probabilidad de 'Positivo' (índice 2) como base para el ajuste del motor híbrido
        prob_positiva = float(probs[2])
        
        return pred, prob_positiva
