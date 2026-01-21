import requests
import time
import statistics
import json

URL = "http://localhost:8000/sentiment"
PAYLOAD = {"text": "El servicio fue excelente y la comida deliciosa, aunque el lugar estaba un poco sucio."}
ITERATIONS = 50

def run_benchmark():
    latencies = []
    print(f"🚀 Starting Benchmark: {ITERATIONS} requests to {URL}...")
    
    success_count = 0
    error_count = 0
    
    start_global = time.time()
    
    for i in range(ITERATIONS):
        try:
            start_req = time.time()
            response = requests.post(URL, json=PAYLOAD)
            end_req = time.time()
            
            if response.status_code == 200:
                success_count += 1
                latencies.append((end_req - start_req) * 1000) # ms
            else:
                error_count += 1
                print(f"Request {i} failed: {response.status_code}")
                
        except Exception as e:
            error_count += 1
            print(f"Request {i} error: {e}")
            
    end_global = time.time()
    total_time = end_global - start_global
    
    if latencies:
        avg_latency = statistics.mean(latencies)
        median_latency = statistics.median(latencies)
        max_latency = max(latencies)
        min_latency = min(latencies)
        
        print("\n📊 Benchmark Results:")
        print(f"✅ Successful: {success_count}/{ITERATIONS}")
        print(f"❌ Failed: {error_count}/{ITERATIONS}")
        print(f"⏱️ Total Time: {total_time:.2f}s")
        print(f"📉 Avg Latency: {avg_latency:.2f} ms")
        print(f"➖ Median Latency: {median_latency:.2f} ms")
        print(f"🐢 Max Latency: {max_latency:.2f} ms")
        print(f"🐇 Min Latency: {min_latency:.2f} ms")
        
        # Save to file for later comparison
        with open("benchmark_baseline.json", "w") as f:
            json.dump({
                "avg": avg_latency,
                "median": median_latency,
                "min": min_latency,
                "max": max_latency,
                "total_time": total_time
            }, f)
    else:
        print("⚠️ No successful requests to calculate stats.")

if __name__ == "__main__":
    run_benchmark()
