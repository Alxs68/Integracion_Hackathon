# config_g68.py - VERSIÓN INTEGRAL FINAL BLINDADA - G68 SUPREME
DICCIONARIO_PESOS = {
    # --- NIVEL CRÍTICO: VETOS Y RIESGO REPUTACIONAL ---
    "estafa": -1.0, "robo": -1.0, "engaño": -0.9, "fraude": -1.0,
    "peligro": -0.9, "asco": -0.8, "chinches": -1.0, "cucaracha": -0.9,
    "sangre": -0.9, "moho": -0.8, "veneno": -0.8, "terror": -1.0, "horror": -1.0,
    "maltrato": -0.9, "inundacion": -0.9, "ignoro": -0.9, "desprecio": -0.8,
    "poco honesto": -0.9, "nada honesto": -1.0, "engañoso": -0.8, "grosero": -0.9,
    "cloaca": -0.9, "suciedad": -0.8, "mugre": -0.8, "ratas": -0.9, "insectos": -0.8,
    
    # --- NEGATIVOS UNIVERSALES Y DE SERVICIO ---
    "pésimo": -0.8, "horrible": -0.8, "malo": -0.4, "lento": -0.4,
    "caro": -0.5, "decepción": -0.7, "nunca": -0.4, "jamás": -0.4,
    "error": -0.5, "problema": -0.5, "espera": -0.3, "caos": -0.7, 
    "fallo": -0.6, "mediocre": -0.7, "carisimo": -0.8, "sucio": -0.7, 
    "mancha": -0.6, "ruido": -0.5, "frio": -0.4, "olor": -0.5, 
    "humedad": -0.6, "viejo": -0.5, "pobre": -0.6, "aburrido": -0.4,
    "roto": -0.6, "imposible": -0.5, "frustrante": -0.7,
    "pisapapeles": -0.8, "basura": -0.9, "inútil": -0.8,
    
    # --- POSITIVOS DE ÉLITE (AJUSTADOS PARA SARCASMO) ---
    "excelente": 0.8, "recomendado": 0.8, "bueno": 0.5, "rápido": 0.5,
    "perfecto": 0.7, "genial": 0.6, "increíble": 0.7, "brillante": 0.6,
    "amable": 0.6, "mejor": 0.6, "éxito": 0.7, "maravilla": 0.9,
    "exquisito": 0.9, "impecable": 0.9, "soberbio": 0.8, "lujo": 0.8,
    "agradezco": 0.8, "encanta": 0.7, "limpio": 0.7, "nube": 0.5,
    "sonrisa": 0.6, "alivio": 0.8, "gracias": 0.6, "resolvieron": 0.8,
    
    # --- PROTECCIÓN DE N-GRAMAS (Prioridad Máxima) ---
    "no hay": -0.4, "no funciona": -0.7, "no sirve": -0.7,
    "sin problemas": 0.8, "lo esperado": 0.3, "valio la pena": 0.8,
    "atencion de mierda": -1.0, "ni buen ni mal": 0.0, "normal": 0.0,
    "cama dura": -0.4, "cama incomoda": -0.6, "cama comoda": 0.6,
    "aire acondicionado": 0.1, "agua caliente": 0.2, "no hay agua": -0.8,
    "olor a cloaca": -1.0, "oliendo a cloaca": -1.0
}

KEYWORDS_DEPT = {
    "Marketing": {
        "estafa": "Reputación/Fraude", "robo": "Reputación/Seguridad", "fraude": "Reputación/Legal",
        "peligro": "Seguridad/Marca", "caro": "Precios/Percepción", "carisimo": "Precios/Crítico",
        "lujo": "Marca/Posicionamiento", "identificado": "Marca/Identidad", "marca": "Marca/Identidad"
    },
    "Operaciones": {
        "lento": "Tiempos/Espera", "tarda": "Tiempos/Espera", "ruido": "Infraestructura/Confort",
        "frio": "Infraestructura/Confort", "humedad": "Infraestructura/Confort", "viejo": "Infraestructura/Mantenimiento",
        "roto": "Producto/Hardware", "falla": "Producto/Fallo", "wifi": "Producto/Conectividad",
        "aire acondicionado": "Servicios/AA", "agua caliente": "Servicios/Agua"
    },
    "Higiene": {
        "suciedad": "Higiene/Estado", "sucio": "Higiene/Estado", "mancha": "Higiene/Estado",
        "limpio": "Higiene/Estado", "asco": "Higiene/Percepción", "chinches": "Higiene/Crítico",
        "cucaracha": "Higiene/Crítico", "cloaca": "Higiene/Crítico", "olor a cloaca": "Higiene/Crítico"
    },
    "Atencion": {
        "amable": "Trato/Personal", "grosero": "Trato/Inaceptable", "atención": "Servicio/Calidad",
        "soporte": "Servicio/Calidad", "resolvieron": "Satisfacción/Resolución", "gracias": "Satisfacción/Gratitud"
    },
    "Admin": {
        "facturación": "Procesos/Facturación", "reembolso": "Procesos/Finanzas", "cobro": "Procesos/Finanzas"
    }
}