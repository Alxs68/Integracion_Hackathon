import json
import os

path = r'c:\ALURA - ONE\1. CIENCIA DE DATOS\HACKATHON\sentiment-api-G68\ml-python\notebooks\Reporte_Modelado_Sentimiento.ipynb'
if not os.path.exists(path):
    print(f"File not found: {path}")
    exit(1)

with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# The problematic cell is the one with python code
for cell in data['cells']:
    if cell['cell_type'] == 'code' and 'enriquecer_respuesta' in "".join(cell['source']):
        source = cell['source']
        new_source = []
        for line in source:
            # Fix the KeyError by restoring the correct contract key
            line = line.replace("res['top_deptos']", "res['top_features']")
            # Fix any other accidental key renames
            line = line.replace("res['features']", "res['top_features']")
            # Ensure internal evidence link uses the correct internal key 'deptos' (which we generalized earlier)
            if 'Evidencia del Motor' in line:
                 line = line.replace(".get('features'", ".get('deptos'")
            new_source.append(line)
        cell['source'] = new_source
        break

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=1)

print("✅ Notebook KeyError fixed and display logic restored.")
