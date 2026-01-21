import requests
import json

# Casos de sarcasmo que fallaron en la prueba anterior
sarcasm_tests = [
    {"ID": 20, "text": "Bravo, han logrado que unas vacaciones de relax sean un estrés constante.", "expected": "Negativo"},
    {"ID": 48, "text": "Qué alivio que el recepcionista prefiera chatear que atenderme.", "expected": "Negativo"},
    {"ID": 60, "text": "Increíble que en 2026 el wifi solo funcione cerca del lobby.", "expected": "Negativo"},
    {"ID": 64, "text": "Si esto es un hotel de 4 estrellas, yo soy el Rey de España.", "expected": "Negativo"},
    {"ID": 78, "text": "Me encanta que la ventana no cierre bien y entre todo el frío.", "expected": "Negativo"},
    {"ID": 87, "text": "Gracias por cobrarme el agua del grifo a precio de champán.", "expected": "Negativo"},
    {"ID": 1, "text": "¡Qué maravilla! El aire acondicionado hace tanto ruido que parece una pista de aterrizaje.", "expected": "Negativo"},
    {"ID": 27, "text": "Gracias por hacerme esperar una hora en el lobby, me encanta perder el tiempo.", "expected": "Negativo"},
    {"ID": 38, "text": "Vender este hostal como 'Luxury Resort' es tener mucha imaginación.", "expected": "Negativo"},
]

API_URL = "http://localhost:8000/sentiment"

print("🎭 Prueba de Mejora de Sarcasmo")
print("=" * 80)

correct = 0
total = len(sarcasm_tests)

for test in sarcasm_tests:
    try:
        response = requests.post(API_URL, json={"text": test['text']}, timeout=10)
        if response.status_code == 200:
            data = response.json()
            pred = data.get('prevision', 'N/A')
            prob = data.get('probabilidad', 0)
            triggers = data.get('top_features', 'N/A')
            
            is_correct = pred == test['expected']
            if is_correct:
                correct += 1
            
            status = "✓" if is_correct else "✗"
            print(f"{status} ID {test['ID']:2} | Esperado: {test['expected']:10} | Obtenido: {pred:10} ({prob:.2f})")
            print(f"   Triggers: {triggers}")
            print(f"   Texto: {test['text'][:70]}...")
            print()
    except Exception as e:
        print(f"✗ Error en ID {test['ID']}: {str(e)}")

print("=" * 80)
print(f"📊 Resultado: {correct}/{total} correctos ({correct/total*100:.1f}%)")
print(f"   Mejora: {correct/total*100 - 33:.1f}% (antes: 33%)")
