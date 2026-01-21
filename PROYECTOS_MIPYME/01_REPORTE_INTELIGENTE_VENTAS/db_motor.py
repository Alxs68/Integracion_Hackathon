import sqlite3
import pandas as pd
import os

# Rutas
ruta_csv = 'ventas_limpias.csv'
ruta_db = 'negocio_mipyme.db'

# 1. Cargar datos limpios
df = pd.read_csv(ruta_csv)

# 2. Reiniciar base de datos para el laboratorio
if os.path.exists(ruta_db):
    os.remove(ruta_db)

conn = sqlite3.connect(ruta_db)
cursor = conn.cursor()

# 3. Crear tablas con SQL puro (para practicar diseño)
cursor.execute('''
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha DATE NOT NULL,
    cliente_id INTEGER,
    producto_id INTEGER,
    cantidad INTEGER,
    precio_venta REAL,
    total REAL,
    FOREIGN KEY (cliente_id) REFERENCES clientes (id),
    FOREIGN KEY (producto_id) REFERENCES productos (id)
)
''')

# 4. Migración de Datos (Lógica de Negocio)

# Insertar Clientes Únicos
clientes_unicos = df['cliente'].unique()
for cliente in clientes_unicos:
    cursor.execute('INSERT OR IGNORE INTO clientes (nombre) VALUES (?)', (cliente,))

# Insertar Productos Únicos
productos_unicos = df['producto'].unique()
for producto in productos_unicos:
    cursor.execute('INSERT OR IGNORE INTO productos (nombre) VALUES (?)', (producto,))

# Guardar cambios de las dimensiones
conn.commit()

# Mapear nombres a IDs para la tabla de ventas
cursor.execute('SELECT id, nombre FROM clientes')
dict_clientes = {nombre: id for id, nombre in cursor.fetchall()}

cursor.execute('SELECT id, nombre FROM productos')
dict_productos = {nombre: id for id, nombre in cursor.fetchall()}

# Insertar Ventas (Hecho de negocio)
for _, fila in df.iterrows():
    # Convertir moneda "10.000,00" -> 10000.0 (float para DB)
    def a_float(val):
        return float(val.replace('.', '').replace(',', '.'))

    cursor.execute('''
    INSERT INTO ventas (fecha, cliente_id, producto_id, cantidad, precio_venta, total)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        fila['fecha'],
        dict_clientes[fila['cliente']],
        dict_productos[fila['producto']],
        int(fila['cantidad']) if pd.notna(fila['cantidad']) else 0,
        a_float(fila['precio_unitario']),
        a_float(fila['total'])
    ))

# 5. Finalizar
conn.commit()
conn.close()
print(f"¡Base de datos relacional creada con éxito en: {ruta_db}!")
