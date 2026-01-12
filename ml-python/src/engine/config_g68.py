# 🧠 DICCIONARIO MAESTRO G68 - PESOS AJUSTADOS
DICCIONARIO_PESOS = {
    # --- POSITIVOS (Fuerzan el signo +) ---
    "excelente": 0.4, "impecable": 0.4, "profesional": 0.3, "amable": 0.3,
    "increible": 0.4, "maravilloso": 0.4, "perfecto": 0.4, "gracias": 0.2,
    "limpio": 0.3, "rapido": 0.2, "cordial": 0.3, "amor": 0.4, "recomendado": 0.3,
    "volveré": 0.4, "volvere": 0.4, "genial": 0.3, "agradable": 0.2,
    "bueno": 0.2, "sabor": 0.2, "desayuno": 0.1, "comida": 0.1, "atencion": 0.2,

    # --- NEGATIVOS (Fuerzan el signo - y hunden probabilidad) ---
    "sucio": -0.6, "pésimo": -0.7, "pesimo": -0.7, "mal": -0.4, "grosero": -0.5,
    "chinches": -1.0, "cucarachas": -0.9, "plaga": -0.9, "hongo": -0.7,
    "robo": -1.0, "estafa": -1.0, "engaño": -0.8, "cobro": -0.4, "caro": -0.3,
    "decepcionado": -0.6, "horrible": -0.6, "basura": -0.5, "mancha": -0.4,
    "olor": -0.5, "ruido": -0.4, "viejo": -0.3, "roto": -0.5, "dañado": -0.5,
    "frio": -0.3, "frío": -0.3, "espera": -0.3, "lento": -0.4, "inseguro": -0.8,
    "desastre": -0.6, "problema": -0.4, "incómodo": -0.4, "incomodo": -0.4,
    "ninguno": -0.2, "malo": -0.4, "peor": -0.5
}

# 🎯 MAPEO DE DEPARTAMENTOS
KEYWORDS_DEPT = {
    "Higiene y Salud": {
        "sucio": "Deficiencia de Limpieza General", "baño": "Estado Sanitario de Baños",
        "chinches": "Presencia de Plagas (Crítico)", "cucarachas": "Presencia de Plagas (Crítico)",
        "hongo": "Moho o Humedad en Instalaciones", "limpio": "Mantenimiento de Higiene",
        "impecable": "Excelencia en Limpieza", "olor": "Problema de Salubridad/Olores",
        "mancha": "Falta de Aseo en Lencería/Textiles", "basura": "Gestión de Residuos Inadecuada"
    },
    "Servicio y Atención": {
        "recepcionista": "Atención en Front Desk", "personal": "Gestión del Capital Humano",
        "mesero": "Servicio de Alimentos y Bebidas", "amable": "Cordialidad y Trato",
        "grosero": "Mala Conducta de Personal", "gerente": "Resolución Directiva",
        "atencion": "Gestión de Servicio", "profesional": "Ética y Profesionalismo",
        "espera": "Demora en la Atención", "lento": "Baja Eficiencia de Servicio"
    },
    "Infraestructura y Confort": {
        "habitacion": "Estado de la Unidad/Cuarto", "cama": "Confort de Mobiliario",
        "aire": "Sistema de Climatización", "wifi": "Conectividad y Red",
        "ruido": "Aislamiento Acústico", "roto": "Mobiliario o Equipo Dañado",
        "ducha": "Funcionamiento de Plomería", "tv": "Equipamiento Tecnológico",
        "viejo": "Necesidad de Remodelación"
    },
    "Administración y Seguridad": {
        "estafa": "Veto Soberano - Integridad Comercial", "robo": "Incidente de Seguridad Grave",
        "precio": "Relación Calidad-Precio", "pago": "Transacción Económica",
        "cobro": "Incidencia en Facturación", "check-in": "Gestión de Ingreso",
        "check-out": "Gestión de Salida", "inseguro": "Falla en Protocolos de Seguridad",
        "decepcionado": "Incumplimiento de Expectativa de Marca"
    },
    "Alimentos y Bebidas": {
        "comida": "Calidad Gastronómica", "desayuno": "Servicio de Primera Mañana",
        "frio": "Temperatura de Alimentos", "frío": "Temperatura de Alimentos",
        "sabor": "Experiencia Sensorial/Sabor"
    }
}
