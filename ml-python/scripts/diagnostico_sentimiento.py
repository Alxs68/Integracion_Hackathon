import requests
import json

URL = "http://localhost:8080/predict/sentiment"
TEXT = "Prometen una 'experiencia gastronómica de autor' y el menú es el mismo que el de cualquier cafetería de estación, pero tres veces más caro. Es un engaño publicitario basado en términos pretenciosos."

def test_sentiment():
    try:
        response = requests.post(URL, json={"text": TEXT}, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("--- DIAGNÓSTICO DE SENTIMIENTO ---")
            print(f"Texto: {TEXT}")
            print(f"Previsión: {data.get('prevision')}")
            print(f"Probabilidad: {data.get('probabilidad')}")
            print(f"Top Features: {data.get('top_features')}")
            print("----------------------------------")
        else:
            print(f"Error HTTP {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Error de conexión: {e}")

if __name__ == "__main__":
    test_sentiment()
