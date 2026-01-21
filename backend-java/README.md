# Servidor Principal - Java Spring Boot

Aquí vive la lógica central de nuestra aplicación G68. Este módulo se encarga de recibir las peticiones, hablar con el motor de IA y guardar los resultados.

## 🛠️ ¿Qué usamos aquí?

- **Java 21**: Nuestro lenguaje base.
- **Spring Boot 3.2**: Para crear la web API de forma fácil.
- **Base de Datos H2**: Una base de datos ligera que vive en memoria (ideal para demos).
- **OpenFeign**: Para conectarnos con el servicio de Python sin complicarnos.

## ⚙️ Configuración

Si necesitas cambiar el puerto o la dirección del modelo de IA, mira el archivo:
`api/src/main/resources/application.properties`

Por defecto está en el puerto `8000`.

## ▶️ ¿Cómo lo inicio?

Abre una terminal en esta carpeta y ejecuta:
```bash
cd api
./mvnw spring-boot:run
```

## 🔌 Puntos de Conexión (Endpoints)

- `POST /sentiment`: Para enviar un texto y analizarlo.
- `GET /api/stats`: Para ver las estadísticas del dashboard.
- `GET /api/history`: Para ver el historial de análisis.
