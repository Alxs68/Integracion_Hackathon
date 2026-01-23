# 📜 Guía de Migración y Reconstrucción Histórica G68

Este documento detalla el procedimiento para migrar el proyecto a un nuevo repositorio (o reconstruirlo en el repositorio de Diego), preservando la trazabilidad de cada integrante mediante la aplicación secuencial de parches.

## 📦 Inventario de Parches (Orden de Ejecución)

Los siguientes archivos `.patch` se han generado en la raíz del proyecto. Cada uno representa una etapa lógica de desarrollo.

1.  **`BE-Edwing-1-Infra.patch`**: *La Fundación*. Infraestructura Backend Java (Legacy Sneyky).
2.  **`DS-Diego-1-Tests.patch`**: *Calidad*. Scripts de prueba y validación (QA).
3.  **`DS-Alexis-1-Engine.patch`**: *El Cerebro*. Motor de sentimientos unificado (Supreme Integral) y léxicos.
4.  **`DS-Diego-2-API.patch`**: *La Voz*. Servidor FastAPI y conexión.
5.  **`DS-Fernando-1-Docs.patch`**: *El Conocimiento*. Documentación y Notebooks de investigación.
6.  **`BE-Lorena-1-Logic.patch`**: *El Puente*. Lógica Java para conectar Backend con IA.
7.  **`FE-Florentino-1-UI.patch`**: *La Cara*. Estructura HTML y Estilos CSS.
7.  **`FE-Florentino-1-UI.patch`**: *La Cara*. Estructura HTML y Estilos CSS (Base MVP).
8.  **`BE-Edwing-2-Integration.patch`**: *La Conexión*. Configuración de puertos y enlace Backend-Frontend-API (MVP Essential).
9.  **`FE-Florentino-2-Interactions.patch`**: *La Vida*. Lógica JS, Dashboard y Micrófono.
10. **`DS-Alexis-3-MultiDomain.patch`**: *La Expansión (v2.5)*. Soporte para Tecnología, Negocios y Procesador Batch Universal.

> [!NOTE]
> **Estrategia de Ejecución Distribuida (G68)**
> Diego actúa como **Dueño del Repositorio** (hace los merges y supervisa).
>
> **Quién aplica los parches:**
> *   **Alexis (DS):** Aplica parches de Engine y API (asegurando usar `--author` correcto para Diego).
> *   **Fernando:** Aplica parche de Documentación.
> *   **Florentino (Fullstack):** Aplica sus parches de FE, Y TAMBIÉN los de BE y Infra (asegurando usar `--author` para Lorena y Edwing respectivamente).
>
> ⚠️ **CRÍTICO:** Quien aplique el parche de otro (ej: Alexis aplicando el de Diego) **DEBE** copiar el comando `git commit` exactamente como está escrito abajo, incluyendo la parte `--author="..."`, para que el historial registre al creador original y no a quien ejecuta el comando.

---

## 🛠️ Procedimiento de Reconstrucción

## 🛠️ Procedimiento de Reconstrucción (En el Repo Existente)

Para integrar este trabajo en `github.com/dzapatasal/-sentiment-api-G68-v2` sin borrar lo que ya existe, usaremos una **Rama Huérfana**.
Esto es ideal porque:
1.  Mantiene el repo y la historia antigua intacta (por si acaso).
2.  Crea una línea de tiempo nueva y limpia donde aplicaremos los parches con la autoría correcta.

### Paso 1: Preparación del Terreno
1.  **Clonar el repo** (si no lo tienes):
    ```bash
    git clone https://github.com/dzapatasal/-sentiment-api-G68-v2.git
    cd -sentiment-api-G68-v2
    ```
2.  **Copiar Parches**: Pega las carpetas `fase_1_mvp` y `fase_2_mejoras` (que están en `entregables_migracion`) en la raíz del repo.

3.  **Crear Rama Limpia (Orphan Branch)**:
    ```bash
    # Esto crea una rama totalmente vacía, desconectada de la historia anterior
    git checkout --orphan sentiment-api-G68-V3
    git rm -rf .  # ¡IMPORTANTE! Esto limpia los archivos viejos de la zona de preparación (staging)
    ```
    *Ahora tu carpeta debería verse vacía (excepto por `.git` y los parches que acabas de copiar).*

### Paso 2: Ejecución de Parches (Paso a Paso)

Ahora reconstruiremos el "Castillo" en dos fases: MVP (Funcionalidad Base) y Mejoras (v2.5).

### 🚀 FASE 1: MVP Funcional (Previsión y Probabilidad)

Ejecuta estos parches para levantar el sistema base que teníamos en DEV:

#### 01. Motor IA (Alexis)
```bash
git apply --reject --whitespace=fix fase_1_mvp/01_DS_Alexis_Engine.patch
git add .
git commit -m "feat(ml): Unified Sentiment Engine (Supreme Integral)" --author="Alxs68 <alexis@g68.com>"
```

#### 02. API Python (Diego)
```bash
git apply --reject --whitespace=fix fase_1_mvp/02_DS_Diego_API.patch
git add .
git commit -m "feat(api): FastAPI server exposure" --author="Diego Zapata <diego@g68.com>"
```

#### 03. Tests (Diego)
> *Nota: Ahora que existe el Motor y la API, podemos agregar los tests.*
```bash
git apply --reject --whitespace=fix fase_1_mvp/03_DS_Diego_Tests.patch
git add .
git commit -m "test(qa): Validation scripts and stress tests" --author="Diego Zapata <diego@g68.com>"
```

#### 04. Infraestructura (Edwing)
```bash
git apply --reject --whitespace=fix fase_1_mvp/04_BE_Edwing_Infra.patch
git add .
git commit -m "feat(infra): Base architecture setup (Legacy Sneyky)" --author="Edwing Herrera <sneyky@g68.com>"
```

#### 05. Lógica Java (Lorena)
```bash
git apply --reject --whitespace=fix fase_1_mvp/05_BE_Lorena_Logic.patch
git add .
git commit -m "feat(backend): Java controller logic" --author="Lorena <lorena@g68.com>"
```

> [!TIP]
> **✨ ¿Qué implementó Lorena aquí?**
> Al aplicar este parche, se restauran componentes críticos que estaban en su rama original:
> 1.  **Base de Datos (H2)**: Las entidades `SentimentAnalysis.java` y repositorios para guardar historial.
> 2.  **Conexión con IA**: La clase `MlClient` que conecta Java con Python.
> 3.  **Lógica de Negocio**: `SentimentService` que orquesta todo.
>
> **Cómo verificarlo después de integrar:**
> -   Entra a la consola H2 (`/h2-console`) y busca la tabla `SENTIMENT_ANALYSIS`.
> -   Prueba el botón "Auditoría" en el Frontend; si carga datos, la persistencia de Lorena funciona.

#### 05-b. Lógica Java (Comentarios Humanos)
```bash
git apply --reject --whitespace=fix fase_1_mvp/05_b_BE_Lorena_Logic_Comments.patch
git add .
git commit -m "docs(backend): Humanized comments in Spanish" --author="Lorena <lorena@g68.com>"
```

#### 06. Conexión MVP (Edwing)
```bash
git apply --reject --whitespace=fix fase_1_mvp/06_BE_Edwing_Integration.patch
git add .
git commit -m "config(infra): API connectivity and port setup for MVP" --author="Edwing Herrera <sneyky@g68.com>"
```

#### 07. Interfaz Gráfica (Florentino)
```bash
git apply --reject --whitespace=fix fase_1_mvp/07_FE_Florentino_UI.patch
git add .
git commit -m "feat(ui): HTML structure and CSS styles" --author="Florentino <florentino@g68.com>"
```

#### 08. Interacciones MVP (Florentino)
```bash
git apply --reject --whitespace=fix fase_1_mvp/08_FE_Florentino_Interactions.patch
git add .
git commit -m "feat(js): Dashboard logic and interactions" --author="Florentino <florentino@g68.com>"
```

---

### 🌟 FASE 2: Mejoras y Expansión (v2.5)

Una vez probado el MVP, aplicamos las mejoras:

#### 01-a. Multi-Dominio Lógica (Alexis)
```bash
git apply --reject --whitespace=fix fase_2_mejoras/01_a_DS_Alexis_MultiDomain_Logic.patch
git add .
git commit -m "feat(ml): Multi-domain logic expansion" --author="Alxs68 <alexis@g68.com>"
```

#### 01-b. Batch Tool Universal (Alexis)
```bash
git apply --reject --whitespace=fix fase_2_mejoras/01_b_DS_Alexis_BatchTool.patch
git add .
git commit -m "feat(tools): Universal CSV Batch Processor" --author="Alxs68 <alexis@g68.com>"
```

#### 02. Documentación (Fernando)
```bash
git apply --reject --whitespace=fix fase_2_mejoras/02_DS_Fernando_Docs.patch
git add .
git commit -m "docs: Research notebooks and project traceability" --author="Fernando <fernando@g68.com>"
```

#### 03-a. Backend Seguridad (Lorena)
```bash
git apply --reject --whitespace=fix fase_2_mejoras/03_a_BE_Lorena_Security.patch
git add .
git commit -m "chore(backend): Security configurations" --author="Lorena <lorena@g68.com>"
```

#### 03-b. Backend Performance (Lorena)
```bash
git apply --reject --whitespace=fix fase_2_mejoras/03_b_BE_Lorena_Performance.patch
git add .
git commit -m "perf(backend): Tuning for high throughput" --author="Lorena <lorena@g68.com>"
```

#### 04-a. Frontend Visuals (Florentino)
```bash
git apply --reject --whitespace=fix fase_2_mejoras/04_a_FE_Florentino_Visuals.patch
git add .
git commit -m "style(ui): Polished visual assets" --author="Florentino <florentino@g68.com>"
```

#### 04-b. Frontend Animaciones (Florentino)
```bash
git apply --reject --whitespace=fix fase_2_mejoras/04_b_FE_Florentino_Animations.patch
git add .
git commit -m "style(ui): Advanced animations v2" --author="Florentino <florentino@g68.com>"
```

---

### Paso 3: Consolidación Final
Una vez reconstruida la historia en la rama `reconstruction/history-v1`:

1.  Sube la rama al repositorio remoto:
    ```bash
    git push origin reconstruction/history-v1
    ```
2.  En GitHub/GitLab, abre un **Pull Request** de `reconstruction/history-v1` hacia `main`.
3.  Al aceptar el PR, la historia del proyecto mostrará la evolución paso a paso, respetando la autoría de cada integrante.

> **Tip Importante**: Si `git apply` falla con conflictos (archivos `.rej`), significa que la carpeta no estaba totalmente limpia. Asegúrate de usar `git rm -rf .` al inicio (Opción B del Paso 1).
