import sqlite3
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Rutas
ruta_db = 'negocio_mipyme.db'
ruta_imagen = 'REPORTE_FINAL.png'

# 1. Conectar y extraer datos
conn = sqlite3.connect(ruta_db)
query = 'SELECT c.nombre, SUM(v.total) as total_ventas FROM ventas v JOIN clientes c ON v.cliente_id = c.id GROUP BY c.nombre ORDER BY total_ventas DESC'
df = pd.read_sql_query(query, conn)
conn.close()

# 2. Configurar estética DARK MODE
plt.figure(figsize=(10, 6))
fig, ax = plt.subplots(figsize=(12, 7))
fig.patch.set_facecolor('#0d1117') # Fondo exterior oscuro
ax.set_facecolor('#0d1117')      # Fondo interior oscuro

# Crear paleta vibrante para modo oscuro (High Contrast)
paleta_vibrante = sns.color_palette("magma", n_colors=len(df))

# Gráfico de barras con borde sutil para que "brillen"
ax = sns.barplot(x='total_ventas', y='nombre', data=df, 
                 palette=paleta_vibrante, hue='nombre', legend=False,
                 edgecolor='#30363d', linewidth=0.8)

# 3. Diseño Minimalista y Ejecutivo Dark
# Usamos suptitle con y=0.92 para que el título baje y no se pegue al borde superior
fig.suptitle('V E N T A S   P O R   C L I E N T E', fontsize=14, fontweight='bold', color='#f0f6fc', y=0.90)
plt.title('', pad=30) # Espacio extra para que el gráfico no se pegue al título

plt.xlabel('') 
plt.ylabel('') 

# Limpieza total
ax.set_xticks([]) 
ax.set_yticklabels([]) 
ax.tick_params(axis='both', which='both', length=0) 
sns.despine(left=True, bottom=True)

# Parámetros de posición (con espacio de respeto garantizado)
max_v = df['total_ventas'].max()
DISTANCIA_NOMBRE = - (max_v * 0.05) # Un 5% del valor máximo como "aire" constante
MARGEN_SEGURIDAD_IZQ = - (max_v * 0.60) # Espacio para los nombres a la izquierda

# Etiquetas en Blanco/Gris Claro para contraste
for i, p in enumerate(ax.patches):
    width = p.get_width()
    nombre = df.iloc[i]['nombre'].upper()
    y_center = p.get_y() + p.get_height() / 2
    
    if width > 0:
        # NOMBRE: ha='right' garantiza que el final del nombre siempre esté a la misma distancia de la barra
        ax.text(DISTANCIA_NOMBRE, y_center, nombre,
                va='center', ha='right', 
                fontsize=9, color='#f0f6fc', fontweight='bold')
        
        # VALOR: A la derecha de la barra
        ax.text(width + (max_v * 0.02), y_center, f'${width:,.0f}',
                va='center', ha='left',
                fontsize=10, color='#f0f6fc', fontweight='bold')

# Mantener grosor robusto
for bar in ax.patches:
    bar.set_height(0.6)

# Aplicar márgenes generosos
plt.xlim(MARGEN_SEGURIDAD_IZQ, max_v * 1.35)
plt.tight_layout(rect=[0, 0, 1, 0.85]) # Deja un 15% de espacio arriba (el título bajará)

# 4. Guardar
plt.savefig(ruta_imagen, dpi=300, facecolor=fig.get_facecolor(), bbox_inches='tight')
print(f"✅ ¡Gráfico DARK MODE generado!")
print(f"📍 Ubicación: {ruta_imagen}")
