import json
import os

path = r'c:\ALURA - ONE\1. CIENCIA DE DATOS\HACKATHON\sentiment-api-G68\ml-python\notebooks\Reporte_Modelado_Sentimiento.ipynb'
if not os.path.exists(path):
    print(f"File not found: {path}")
    exit(1)

with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for cell in data['cells']:
    if cell['cell_type'] == 'code' and 'analizar_visual' in "".join(cell['source']):
        source = cell['source']
        new_source = []
        for line in source:
            # Fix duplicated output by ensuring wait=True or correct clear call
            if 'clear_output()' in line:
                line = line.replace('clear_output()', 'clear_output(wait=True)')
            new_source.append(line)
        cell['source'] = new_source
        break

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=1)

print("✅ Notebook duplicated output bug fixed.")
