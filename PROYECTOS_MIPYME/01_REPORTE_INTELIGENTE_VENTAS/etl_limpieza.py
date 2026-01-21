import pandas as pd
import re
import os

def limpiar_texto(texto):
    if pd.isna(texto):
        return ""
    # Convertir a minúscula
    texto = str(texto).lower()
    # Eliminar caracteres que no sean del alfabeto español o espacios
    texto = re.sub(r'[^a-zñáéíóú\s]', '', texto)
    # Eliminar espacios adicionales
    texto = ' '.join(texto.split())
    return texto

def limpiar_moneda(valor):
    if pd.isna(valor) or valor == "":
        return "0,00"
    # Eliminar todo lo que no sea número, punto o coma
    valor_limpio = re.sub(r'[^0-9,.]', '', str(valor))
    # En Ciencia de Datos usamos '.' internamente, pero el usuario pidió ',' para el reporte final
    # Primero normalizamos a flotante para asegurar que es un número
    try:
        # Quitamos puntos de miles si existen y reemplazamos coma por punto para el cálculo
        temp = valor_limpio.replace('.', '').replace(',', '.')
        numero = float(temp)
        # Retornamos formato con coma decimal como pidió el usuario
        return "{:,.2f}".format(numero).replace(',', 'X').replace('.', ',').replace('X', '.')
    except:
        return "0,00"

# 1. Cargar los datos
ruta_input = 'datos_origen.csv'
ruta_output = 'ventas_limpias.csv'

if os.path.exists(ruta_input):
    df = pd.read_csv(ruta_input)

    # 2. Eliminar filas completamente vacías
    df = df.dropna(how='all')

    # 3. Estandarizar Fecha
    # Usamos format='mixed' (en versiones nuevas de pandas) o dejamos que infiera
    df['fecha'] = pd.to_datetime(df['fecha'], errors='coerce').dt.strftime('%Y-%m-%d')
    
    # Eliminar filas donde la fecha es vital y no existe
    df = df.dropna(subset=['fecha'])

    # 4. Estandarizar Producto y Cliente
    df['producto'] = df['producto'].apply(limpiar_texto)
    df['cliente'] = df['cliente'].apply(limpiar_texto)
    
    # Si el cliente está vacío, poner 'cliente anonimo'
    df['cliente'] = df['cliente'].replace('', 'cliente anonimo')

    # 5. Limpiar Precios y Totales
    df['precio_unitario'] = df['precio_unitario'].apply(limpiar_moneda)
    df['total'] = df['total'].apply(limpiar_moneda)

    # 6. Guardar el resultado prolijo
    df.to_csv(ruta_output, index=False)
    print(f"¡Proceso completado! Archivo guardado en: {ruta_output}")
else:
    print("No se encontró el archivo de ventas_sucias.csv")
