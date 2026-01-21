import pandas as pd
import random
from datetime import datetime, timedelta

def generar_datos_mipyme_masivos(n=100):
    productos = [
        "Café Orgánico 500g", "Taza Artesanal", "Prensa Francesa", 
        "Granola Casera", "Miel de Abeja 1kg", "Galletas de Avena"
    ]
    precios = [15.50, 12.00, 45.00, 8.50, 20.00, 5.00]
    
    clientes_base = [
        "Maria Garcia", "Juan Perez", "Carlos Lopez", "Ana Martinez", 
        "Roberto Gomez", "Lucia Fernandez", "Elena Rodriguez", "Pedro Ruiz"
    ]
    
    data = []
    
    for _ in range(n):
        # 1. Fecha con variaciones de formato
        fecha_base = datetime(2023, 1, 1) + timedelta(days=random.randint(0, 365))
        fmt = random.choice(['%Y-%m-%d', '%d/%m/%Y', '%m-%d-%Y', 'mixed'])
        fecha_str = fecha_base.strftime(fmt) if fmt != 'mixed' else f"{fecha_base.day}-{fecha_base.month}-{fecha_base.year}"
        
        # 2. Cliente con "suciedad" y duplicados intencionales
        cliente = random.choice(clientes_base)
        modificador = random.choice(['', ' ', '...', '!!!', ' inc', ' s.a.'])
        if random.random() > 0.7: # 30% de probabilidad de nombre "sucio" o corto para fuzzy matching
            if cliente == "Maria Garcia": cliente = random.choice(["Maria G.", "maria garcia", "M. Garcia"])
            if cliente == "Juan Perez": cliente = random.choice(["Juan P.", "juan perez", "J. Perez"])
        
        cliente_final = f"{cliente}{modificador}"
        
        # 3. Producto y Precios
        idx_prod = random.randint(0, len(productos)-1)
        prod = productos[idx_prod]
        precio = precios[idx_prod]
        cant = random.randint(1, 5)
        total = precio * cant
        
        # 4. Formato de moneda sucio
        precio_str = f"${precio:,.2f}".replace('.', 'X').replace(',', '.').replace('X', ',') # Estilo europeo
        total_str = f"{total:,.2f} USD".replace('.', 'X').replace(',', '.').replace('X', ',')
        
        data.append([fecha_str, prod, cliente_final, cant, precio_str, total_str])
    
    # Añadir algunas filas vacías o con errores fatales
    for _ in range(5):
        data.append([None, "ERROR", "", 0, "$0", "0"])

    df = pd.DataFrame(data, columns=['fecha', 'producto', 'cliente', 'cantidad', 'precio_unitario', 'total'])
    
    ruta_guardado = r'c:\ALURA - ONE\1. CIENCIA DE DATOS\HACKATHON\sentiment-api-G68\PROYECTOS_MIPYME\01_REPORTE_INTELIGENTE_VENTAS\datos_origen.csv'
    df.to_csv(ruta_guardado, index=False)
    print(f"✅ ¡Dataset ampliado generado con {len(df)} registros!")
    print(f"📍 Ubicación: {ruta_guardado}")

if __name__ == "__main__":
    generar_datos_mipyme_masivos(1000) # Generamos 1000 filas para impacto total
