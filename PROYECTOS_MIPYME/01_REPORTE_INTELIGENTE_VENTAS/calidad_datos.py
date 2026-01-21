import sqlite3
from difflib import SequenceMatcher

def similitud(a, b):
    return SequenceMatcher(None, a, b).ratio()

ruta_db = 'negocio_mipyme.db'

conn = sqlite3.connect(ruta_db)
cursor = conn.cursor()

# 1. Obtener todos los clientes actuales
cursor.execute('SELECT id, nombre FROM clientes')
clientes = cursor.fetchall()

print("🔍 BUSCANDO DUPLICADOS POR SIMILITUD...")
print("-" * 50)

mapeo_correcciones = {} # {id_duplicado: id_maestro}
ya_procesados = set()

for i, (id1, nombre1) in enumerate(clientes):
    if id1 in ya_procesados: continue
    
    for j, (id2, nombre2) in enumerate(clientes):
        if i == j or id2 in ya_procesados: continue
        
        # Calcular similitud (0.0 a 1.0)
        score = similitud(nombre1, nombre2)
        
        if score > 0.60: # Umbral bajado al 60% para capturar maria g / maria garcia
            # El nombre más largo suele ser el más completo (ej: 'maria garcia' vs 'maria g')
            if len(nombre1) >= len(nombre2):
                maestro_id, maestro_nombre = id1, nombre1
                duplicado_id, duplicado_nombre = id2, nombre2
            else:
                maestro_id, maestro_nombre = id2, nombre2
                duplicado_id, duplicado_nombre = id1, nombre1
            
            print(f"¡Posible Duplicado detectado!")
            print(f"  > Maestro: '{maestro_nombre}'")
            print(f"  > Duplicado: '{duplicado_nombre}' (Similitud: {score:.2f})")
            
            mapeo_correcciones[duplicado_id] = maestro_id
            ya_procesados.add(duplicado_id)

# 2. Aplicar correcciones en la tabla de VENTAS
if mapeo_correcciones:
    print(f"\n✅ Corrigiendo {len(mapeo_correcciones)} registros de ventas...")
    for dup_id, mae_id in mapeo_correcciones.items():
        cursor.execute('UPDATE ventas SET cliente_id = ? WHERE cliente_id = ?', (mae_id, dup_id))
        # Opcional: Borrar el cliente duplicado de la tabla clientes
        cursor.execute('DELETE FROM clientes WHERE id = ?', (dup_id,))
    
    conn.commit()
    print("✨ ¡Base de datos prolija y unificada!")
else:
    print("\nNo se encontraron duplicados evidentes.")

conn.close()
