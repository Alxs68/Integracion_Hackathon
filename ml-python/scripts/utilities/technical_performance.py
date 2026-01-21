import requests
import time
import json
import statistics
import os

API_URL = "http://127.0.0.1:8080/sentiment"
CASES = [
    "Excelente servicio, muy recomendados",
    "El hotel estaba sucio y olia mal",
    "Normal, nada del otro mundo",
    "Me cobraron de mas y no me gusta",
    "Increible la atencion del personal"
]

def measure_performance(iterations=100):
    print(f"🚀 Iniciando prueba de performance técnica ({iterations} peticiones)...")
    latencies = []
    
    # Warmup
    requests.post(API_URL, json={"text": "warmup"})
    
    start_total = time.time()
    for i in range(iterations):
        text = CASES[i % len(CASES)]
        t0 = time.time()
        try:
            requests.post(API_URL, json={"text": text})
            t1 = time.time()
            latencies.append((t1 - t0) * 1000) # ms
        except Exception as e:
            print(f"Error en peticion {i}: {e}")
            
    end_total = time.time()
    total_time = end_total - start_total
    
    avg_latency = statistics.mean(latencies)
    p95_latency = statistics.quantiles(latencies, n=20)[18] # P95
    throughput = iterations / total_time
    
    print("\n" + "="*40)
    print("📊 RESULTADOS DE PERFORMANCE G68")
    print("="*40)
    print(f"⏱️ Latencia Promedio: {avg_latency:.2f} ms")
    print(f"⚡ Latencia P95:      {p95_latency:.2f} ms")
    print(f"🔄 Throughput:        {throughput:.2f} req/s")
    print(f"📦 Total procesado:   {iterations} textos")
    print("="*40)

if __name__ == "__main__":
    measure_performance(200)
