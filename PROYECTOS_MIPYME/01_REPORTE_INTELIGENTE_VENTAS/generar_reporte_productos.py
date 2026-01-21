import sqlite3
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Configuración de Rutas
ruta_db = 'negocio_mipyme.db'
ruta_productos = 'PRODUCTOS_ESTRELLA.png'

# 1. Extraer Datos de Productos
conn = sqlite3.connect(ruta_db)
query = """
SELECT p.nombre, SUM(v.cantidad) as total_unidades, SUM(v.total) as total_venta
FROM ventas v
JOIN productos p ON v.producto_id = p.id
GROUP BY p.nombre
ORDER BY total_unidades DESC
"""
df = pd.read_sql_query(query, conn)
conn.close()

# 2. Configurar Estética Dark Mode (Mismo Estilo)
plt.style.use('dark_background')
fig, ax = plt.subplots(figsize=(12, 7))
fig.patch.set_facecolor('#0d1117')
ax.set_facecolor('#0d1117')

# Paleta vibrante 'plasma' para variar
paleta = sns.color_palette("plasma", n_colors=len(df))

# Gráfico de Barras Verticales
ax = sns.barplot(x='nombre', y='total_unidades', data=df, 
                 palette=paleta, hue='nombre', legend=False,
                 edgecolor='#30363d', linewidth=1)

# 3. Diseño y Títulos
fig.suptitle('P R O D U C T O S   E S T R E L L A', fontsize=16, fontweight='bold', color='#f0f6fc', y=0.92)
plt.title('Análisis por Unidades Vendidas', fontsize=10, color='#8b949e', pad=20)

plt.xlabel('')
plt.ylabel('')

# Limpieza de Ejes
ax.set_yticks([]) 
ax.tick_params(axis='x', rotation=15, labelsize=9, color='#c9d1d9')
sns.despine(left=True, bottom=True)

# 4. Etiquetas de Valor sobre las columnas
for p in ax.patches:
    ax.annotate(f'{int(p.get_height())} u.', 
                (p.get_x() + p.get_width() / 2., p.get_height()), 
                ha = 'center', va = 'center', 
                xytext = (0, 15), 
                textcoords = 'offset points',
                fontsize=10, color='#f0f6fc', fontweight='bold')

plt.tight_layout(rect=[0, 0, 1, 0.88])

# 5. Guardar
plt.savefig(ruta_productos, dpi=300, facecolor=fig.get_facecolor(), bbox_inches='tight')
print(f"✅ ¡Reporte de Productos Estrella generado!")
print(f"📍 Ubicación: {ruta_productos}")
