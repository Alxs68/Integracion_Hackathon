import json
import os

files_to_fix = [
    r'c:\ALURA - ONE\1. CIENCIA DE DATOS\HACKATHON\sentiment-api-G68\ml-python\notebooks\Reporte_Modelado_Sentimiento.ipynb',
    r'c:\ALURA - ONE\1. CIENCIA DE DATOS\HACKATHON\sentiment-api-G68\ml-python\notebooks\03_test_inferencia.ipynb'
]

def fix_notebook_ui(path):
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for cell in data['cells']:
        if cell['cell_type'] == 'code' and 'enriquecer_respuesta' in "".join(cell['source']):
            new_source = []
            for line in cell['source']:
                # Remove the entire Evidence line that shows departments/deptos
                if 'Evidencia del Motor' in line or '🏢' in line:
                    continue
                # Also ensure we are using the correct contract key for the main Hallazgos line
                if 'Hallazgos (Top Features):' in line:
                    line = line.replace('feats', "res['top_features']")
                new_source.append(line)
            cell['source'] = new_source
            
        # Clean up Markdown text for "Pro" or "Hotelero" mentions
        if cell['cell_type'] == 'markdown':
            new_src = []
            for line in cell['source']:
                line = line.replace("Data Science Pro", "Data Science")
                line = line.replace("Hospitality Intelligence", "Feedback Intelligence")
                line = line.replace("sector hotelero", "sector empresarial")
                new_src.append(line)
            cell['source'] = new_src

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=1)

for path in files_to_fix:
    fix_notebook_ui(path)

print("✅ Final Notebook UI cleanup completed (Departments removed).")
