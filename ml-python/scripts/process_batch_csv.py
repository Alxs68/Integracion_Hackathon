import pandas as pd
import requests
import time
import sys
import os

def process_csv(file_path):
    print(f"🚀 Iniciando procesamiento por lotes: {file_path}")
    
    if not os.path.exists(file_path):
        print(f"❌ Error: El archivo {file_path} no existe.")
        return

    # Intentar leer el CSV
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        print(f"❌ Error al leer CSV: {e}")
        return

    # Detectar columna de texto (Reseña o text)
    col_name = None
    for col in ["Reseña", "reseña", "text", "Text", "Review", "review"]:
        if col in df.columns:
            col_name = col
            break
    
    if not col_name:
        print(f"❌ Error: No se encontró una columna de contenido ('Reseña' o 'text'). Columnas: {list(df.columns)}")
        return

    print(f"✅ Columna detectada: {col_name}")
    print(f"📊 Total de registros: {len(df)}")
    print("-" * 50)

    url = "http://localhost:8000/sentiment"
    terminados = 0
    errores = 0

    for index, row in df.iterrows():
        text = str(row[col_name]).strip()
        if len(text) < 3:
            continue

        try:
            response = requests.post(url, json={"text": text}, timeout=10)
            if response.status_code == 200:
                terminados += 1
                data = response.json()
                print(f"[{terminados + errores}] ✅ Procesado: {text[:50]}... -> {data['prevision']}")
            else:
                errores += 1
                print(f"[{terminados + errores}] ❌ Error HTTP {response.status_code}: {text[:50]}")
        except Exception as e:
            errores += 1
            print(f"[{terminados + errores}] 🔴 Error de conexión: {e}")
        
        # Pequeño delay para no saturar si es muy grande
        if (terminados + errores) % 10 == 0:
            time.sleep(0.1)

    print("-" * 50)
    print(f"🏁 Finalizado.")
    print(f"✅ Exitosos: {terminados}")
    print(f"❌ Errores:   {errores}")
    print(f"📈 Total:     {terminados + errores}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        process_csv(sys.argv[1])
    else:
        # Por defecto procesar el de los 102 casos si existe
        default_path = "ml-python/data/test_phrases_complete.csv"
        process_csv(default_path)
