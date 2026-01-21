import sqlite3

ruta_db = r'c:\ALURA - ONE\1. CIENCIA DE DATOS\HACKATHON\sentiment-api-G68\PROYECTOS_MIPYME\FASE_1_LIMPIEZA\negocio_mipyme.db'

conn = sqlite3.connect(ruta_db)
cursor = conn.cursor()

query = '''
SELECT 
    c.nombre as cliente, 
    SUM(v.total) as total_gastado,
    COUNT(v.id) as num_compras
FROM ventas v
JOIN clientes c ON v.cliente_id = c.id
GROUP BY c.nombre
ORDER BY total_gastado DESC;
'''

print("📊 REPORTE DE VENTAS POR CLIENTE")
print("-" * 40)
cursor.execute(query)
for fila in cursor.fetchall():
    print(f"Cliente: {fila[0]:<20} | Total: ${fila[1]:>10.2f} | Compras: {fila[2]}")

conn.close()
