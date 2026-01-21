import requests
import json
import csv
from io import StringIO

# Datos de prueba (100 frases)
test_data = """ID,Categoria,Tipo,Reseña
1,Operativo,Sarcasmo,"¡Qué maravilla! El aire acondicionado hace tanto ruido que parece una pista de aterrizaje."
2,Higiene,Crítico,"Las sábanas tenían manchas amarillas y el suelo del baño estaba pegajoso."
3,Cobros,Crítico,"Me cargaron 50 euros por un servicio que nunca pedí y no me dan factura."
4,Atención,Doble Negación,"No puedo decir que la comida no estuviera buena, pero el camarero fue muy rudo."
5,Operativo,Neutro,"El hotel ofrece servicio de traslado al aeropuerto cada 30 minutos."
6,Atención,Negativo,"El recepcionista nos ignoró por estar hablando por su teléfono personal."
7,Operativo,Positivo,"La rapidez del check-in fue asombrosa, tardamos menos de dos minutos."
8,Operativo,Ironía,"Gracias por el 'upgrade' a una habitación con vistas a un muro de ladrillos."
9,Atención,Grocero,"Es una puta vergüenza que traten así a los clientes antiguos."
10,Operativo,Negativo,"El wifi es tan lento que no pude ni abrir el correo del trabajo."
11,Administrativo,Negativo,"El proceso de cancelación es un laberinto diseñado para que no te vayas."
12,Higiene,Crítico,"Había una cucaracha en el buffet de ensaladas, salimos corriendo."
13,Atención,Mixto,"Me pidieron disculpas, pero el problema técnico sigue sin resolverse."
14,Cobros,Crítico,"Me duplicaron el cobro en la tarjeta y dicen que tardan 15 días en devolverlo."
15,Marketing,Engañoso,"La foto de la web muestra una playa privada que en realidad es pública y sucia."
16,Operativo,Positivo,"El colchón era tan cómodo que por fin pude descansar del viaje."
17,Atención,Doble Negación,"No es que no me guste el hotel, pero le falta mucho mantenimiento."
18,Administrativo,Urgencia,"¡Ayuda! Mi reserva desapareció del sistema y estoy en la puerta del hotel."
19,Operativo,Neutro,"La habitación cuenta con minibar, caja fuerte y secador de pelo."
20,Marketing,Sarcasmo,"Bravo, han logrado que unas vacaciones de relax sean un estrés constante."
21,Higiene,Negativo,"El olor a tabaco en la habitación de no fumadores era insoportable."
22,Atención,Positivo,"El botones nos ayudó con las maletas y fue extremadamente educado."
23,Cobros,Dificil,"Me dicen que el desayuno está incluido pero luego me cobran el café aparte."
24,Marketing,Positivo,"La campaña de redes sociales me convenció y el hotel cumplió todo."
25,Administrativo,Neutro,"Para solicitar la factura es necesario enviar el RUT por correo electrónico."
26,Operativo,Negativo,"El agua de la ducha sale templada, nunca llega a calentar del todo."
27,Atención,Sarcasmo,"Gracias por hacerme esperar una hora en el lobby, me encanta perder el tiempo."
28,Higiene,Crítico,"Encontramos moho en la junta de la ducha, falta mucha limpieza profunda."
29,Cobros,Negativo,"Intentaron cobrarme un extra por limpieza que no estaba en el contrato."
30,Operativo,Positivo,"La insonorización es excelente, no se oye nada de la calle."
31,Marketing,Neutro,"Vi el anuncio en Instagram y decidí reservar por la ubicación."
32,Atención,Grocero,"El guardia de seguridad es un imbécil que no sabe tratar a la gente."
33,Administrativo,Doble Negación,"No es imposible conseguir el reembolso, pero te lo ponen muy difícil."
34,Operativo,Negativo,"El ascensor se quedó trabado entre pisos, pasamos mucho miedo."
35,Higiene,Positivo,"Todo el hotel huele a limpio, se nota que cuidan los detalles."
36,Atención,Neutro,"Pregunté por la clave del wifi y me la dieron en un papelito."
37,Cobros,Crítico,"Me hicieron un cargo de 200 dólares que no sé de qué es."
38,Marketing,Sarcasmo,"Vender este hostal como 'Luxury Resort' es tener mucha imaginación."
39,Operativo,Negativo,"La luz de la habitación parpadea y el técnico nunca vino a verla."
40,Atención,Positivo,"La chica de recepción, Marta, es lo mejor que tiene este hotel."
41,Higiene,Negativo,"Había pelos en el desagüe cuando entramos a la habitación."
42,Administrativo,Positivo,"Me enviaron la factura al minuto de pedírsela, muy eficientes."
43,Operativo,Neutro,"El parking está en el sótano y es gratuito para clientes."
44,Atención,Urgencia,"Llamo y llamo a recepción y nadie contesta, necesito una manta."
45,Cobros,Mixto,"El precio es bueno, pero las comisiones por pago con tarjeta son altas."
46,Marketing,Negativo,"El 'kit de bienvenida' eran dos caramelos y una botella de agua pequeña."
47,Operativo,Positivo,"La Smart TV funciona genial y tiene Netflix configurado."
48,Atención,Sarcasmo,"Qué alivio que el recepcionista prefiera chatear que atenderme."
49,Higiene,Crítico,"Había hormigas en la mesa de noche, no vuelvo jamás."
50,Administrativo,Doble Negación,"No puedo negar que el check-out fue rápido, al menos eso."
51,Operativo,Positivo,"El gimnasio está muy completo y las máquinas son nuevas."
52,Marketing,Neutro,"El folleto informativo está disponible en cinco idiomas."
53,Atención,Negativo,"Me hablaron de forma muy condescendiente por no entender el sistema."
54,Cobros,Crítico,"Me retuvieron el depósito de garantía y ya pasaron 20 días."
55,Higiene,Negativo,"La piscina tiene demasiada arena en el fondo, parece descuidada."
56,Operativo,Positivo,"El balcón tiene unas vistas preciosas a la montaña."
57,Marketing,Positivo,"La oferta de reserva anticipada nos ahorró mucho dinero."
58,Atención,Neutro,"El personal lleva uniforme y es fácil de identificar."
59,Administrativo,Negativo,"Me piden un código de confirmación que nunca me llegó al móvil."
60,Operativo,Sarcasmo,"Increíble que en 2026 el wifi solo funcione cerca del lobby."
61,Higiene,Crítico,"El vaso del cepillo de dientes tenía restos de pasta dental vieja."
62,Cobros,Positivo,"Se dieron cuenta del error en el cobro y me llamaron para devolverlo."
63,Atención,Negativo,"El servicio de habitaciones se olvidó de mi cena dos veces."
64,Marketing,Sarcasmo,"Si esto es un hotel de 4 estrellas, yo soy el Rey de España."
65,Operativo,Neutro,"Las llaves son magnéticas y funcionan por aproximación."
66,Atención,Positivo,"Nos recomendaron un tour privado que fue un acierto total."
67,Higiene,Negativo,"La alfombra del pasillo tiene manchas que parecen muy antiguas."
68,Administrativo,Crítico,"Cambiaron los términos del servicio sin avisar a los suscriptores."
69,Operativo,Negativo,"El minibar hace un ruido eléctrico constante y no deja dormir."
70,Marketing,Positivo,"Me encanta el nuevo logo y la estética moderna del hotel."
71,Atención,Doble Negación,"No es que me hayan tratado mal, pero les falta calidez."
72,Cobros,Negativo,"Me cobraron el parking cuando en la reserva decía que era gratis."
73,Higiene,Positivo,"La desinfección de las zonas comunes es constante, da seguridad."
74,Operativo,Neutro,"La presión del agua en el tercer piso es normal."
75,Atención,Grocero,"El botones me pidió propina de forma muy agresiva y maleducada."
76,Marketing,Negativo,"El hotel se ve mucho más viejo y desgastado que en las fotos."
77,Administrativo,Positivo,"El proceso de reserva por la app fue fluido y sin errores."
78,Operativo,Sarcasmo,"Me encanta que la ventana no cierre bien y entre todo el frío."
79,Atención,Negativo,"Me dijeron que me llamarían para confirmar y sigo esperando."
80,Cobros,Crítico,"Me cobraron una tarifa de cancelación por un error de su web."
81,Higiene,Negativo,"Había una mancha extraña en el sofá de la habitación."
82,Operativo,Positivo,"Tienen cargadores para coches eléctricos, un gran punto a favor."
83,Marketing,Neutro,"Recibí el boletín de ofertas en mi correo este lunes."
84,Atención,Positivo,"El personal de limpieza es súper discreto y eficiente."
85,Administrativo,Doble Negación,"No es poco frecuente que el sistema de facturación falle."
86,Operativo,Negativo,"El sensor de luz del pasillo tarda mucho en encenderse, está oscuro."
87,Cobros,Sarcasmo,"Gracias por cobrarme el agua del grifo a precio de champán."
88,Higiene,Crítico,"El inodoro no estaba bien anclado y perdía agua, un asco."
89,Atención,Positivo,"Gestionaron mi cambio de habitación sin ninguna objeción."
90,Marketing,Negativo,"Prometen 'desayuno continental' y solo hay tostadas y café malo."
91,Operativo,Neutro,"El hotel tiene dos plantas y no dispone de jardín."
92,Administrativo,Negativo,"Es frustrante que no contesten a los correos administrativos."
93,Cobros,Positivo,"El desglose de la factura es clarísimo, nada de cargos ocultos."
94,Atención,Sarcasmo,"Bravo por el camarero que me trajo la cuenta antes de pedir el postre."
95,Higiene,Negativo,"Había polvo acumulado en las aspas del ventilador del techo."
96,Operativo,Positivo,"El sistema de domótica de la habitación es muy intuitivo."
97,Atención,Dificil,"El personal es amable pero se nota que están desbordados de trabajo."
98,Administrativo,Urgencia,"¡Cancelen mi reserva ya! Mi vuelo se canceló y no quiero cargos."
99,Marketing,Positivo,"La decoración navideña del hotel es preciosa y muy elegante."
100,Operativo,Mixto,"Llegó el pedido de room service rápido, pero la comida estaba fría."
"""

# Parsear CSV
reader = csv.DictReader(StringIO(test_data))
tests = list(reader)

# Endpoint
API_URL = "http://localhost:8000/sentiment"

# Resultados
results = []
print(f"🧪 Iniciando prueba masiva de {len(tests)} frases...")
print("=" * 80)

for i, test in enumerate(tests, 1):
    try:
        response = requests.post(API_URL, json={"text": test['Reseña']}, timeout=10)
        if response.status_code == 200:
            data = response.json()
            result = {
                "ID": test['ID'],
                "Categoria": test['Categoria'],
                "Tipo_Esperado": test['Tipo'],
                "Reseña": test['Reseña'][:60] + "...",
                "Prediccion": data.get('prevision', 'N/A'),
                "Probabilidad": data.get('probabilidad', 0),
                "Triggers": data.get('top_features', 'N/A')
            }
            results.append(result)
            
            # Mostrar progreso cada 10
            if i % 10 == 0:
                print(f"✓ Procesadas {i}/{len(tests)} frases...")
        else:
            print(f"✗ Error en frase {i}: HTTP {response.status_code}")
    except Exception as e:
        print(f"✗ Error en frase {i}: {str(e)}")

print("=" * 80)
print(f"\n📊 Prueba completada: {len(results)}/{len(tests)} frases procesadas\n")

# Mostrar casos críticos y sarcasmo
print("🔍 CASOS CRÍTICOS Y SARCASMO:")
print("-" * 80)
for r in results:
    if 'Crítico' in r['Tipo_Esperado'] or 'Sarcasmo' in r['Tipo_Esperado'] or 'Ironía' in r['Tipo_Esperado']:
        print(f"ID {r['ID']:3} | {r['Tipo_Esperado']:15} | {r['Prediccion']:10} ({r['Probabilidad']:.2f}) | {r['Triggers']}")

# Guardar resultados
output_file = "batch_test_results_100.json"
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\n💾 Resultados guardados en: {output_file}")
