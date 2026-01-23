# 🚀 Estrategia de Despliegue Final - Equipo G68

**Objetivo:** Integrar la solución final en el repositorio de Diego (`-sentiment-api-G68-v2`) respetando la historia y autoría de cada miembro.

## 🚨 Contexto de la Migración (El "Por qué")
Debido a la ausencia de Edwing (Repo Owner Original), el proyecto quedó estancado sin merges en su repositorio.
**Estrategia de Rescate:**
1.  Hemos "congelado" el estado de la rama `dev` (donde todos trabajaron) en forma de **Parches**.
2.  Vamos a inyectar estos parches en un **Nuevo Repositorio Limpio** (el de Diego) para desbloquear al equipo y continuar la evolución hacia la versión 2.5.
3.  El comando `git clone` descarga la "nueva casa" (Diego), no el código viejo. El código viejo lo traemos nosotros en el ZIP.

## 🛠️ Roles y Responsabilidades

*   **Diego (Integrador del Repositorio):**
    *   👑 Prepara el repositorio (Rama Huérfana `sentiment-api-G68-V3`).
    *   🤝 Coordina el merge de los parches.
    *   🛡️ Valida que el MVP levante antes de pasar a Fase 2.

*   **Alexis (Data Science Lead):**
    *   ⚙️ Aplica parches de **Motor IA** y **Herramientas Batch**.
    *   🎭 **En nombre de Diego:** Como Diego estará ocupado integrando, tú le ayudas aplicando sus parches de **API** y **Tests**, pero usando un comando especial para que el crédito sea de él.

*   **Florentino (Fullstack Exec):**
    *   🎨 Aplica sus parches de **Frontend** (Autor: Florentino).
    *   ☕ **En nombre de Lorena:** Aplica los parches de **Backend** usand el flag `--author="Lorena..."` para mantener su autoría.
    *   🏗️ **En nombre de Edwing:** Aplica los parches de **Infra** usand el flag `--author="Edwing..."`.

*   **Lorena (Backend Lead - Remoto):**
    *   (Su trabajo será aplicado por Florentino, pero el crédito en Git será 100% de ella).

*   **Fernando (Docs Lead):**
    *   📚 Aplica parches de **Documentación y Notebooks**.

---

## ⛓️ Dependencias y Flujo de Trabajo (¿Quién bloquea a quién?)

¡Buena noticia! Las 3 áreas (DS, Backend, Frontend) trabajan en carpetas separadas, por lo que **PUEDEN TRABAJAR EN PARALELO** en sus propias ramas. 

### 🚦 El Semáforo de Dependencias:
*   **🔵 Data Science (Alexis):** Trabaja en `ml-python/`. **No depende de nadie.** Puedes arrancar YA.
*   **🟠 Backend (Lorena):** Trabaja en `backend-java/`. **No depende de nadie** para escribir código. (Solo necesita que DS termine para probar la conexión final).
*   **🟢 Frontend (Florentino):** Trabaja en `frontend/`. **No depende de nadie** para escribir código. (Solo necesita que Backend termine para probar la integración).

### 🔄 Flujo Recomendado (Git):
1.  **Diego** crea el repo vacío.
2.  **Alexis** crea rama `rama-ds` -> Aplica todos sus parches (01, 02...) -> Push.
3.  **Lorena** crea rama `rama-be` -> Aplica todos sus parches (04, 05...) -> Push.
4.  **Florentino** crea rama `rama-fe` -> Aplica todos sus parches (07, 08...) -> Push.
5.  **Diego** hace el **Merge** de las 3 ramas en `main`.

¡Al final, todo encajará mágicamente! ✨

---

## 📅 Plan de Ejecución (Secuencial por Área)

### 🏁 FASE 1: El MVP (Funcionalidad Base)
*Cada líder ejecuta SU bloque en su propia rama.*

1.  **Alexis:**  `01_DS_Alexis_Engine` (El Cerebro)
2.  **Alexis:**  `02_DS_Diego_API` (La Voz - *Crédito a Diego*)
3.  **Alexis:**  `03_DS_Diego_Tests` (Validación - *Crédito a Diego*)
4.  **Florentino:**  `04_BE_Edwing_Infra` (Cimientos - *Crédito a Edwing*)
5.  **Florentino:**  `05_BE_Lorena_Logic` + `05_b` (Lógica - *Crédito a Lorena*)
6.  **Florentino:**  `06_BE_Edwing_Integration` (Conexión - *Crédito a Edwing*)
7.  **Florentino:** `07_FE_Florentino_UI` (Cara Principal)
8.  **Florentino:** `08_FE_Florentino_Interactions` (Interacción Base)

### 🚀 FASE 2: Mejoras Granulares (Nivel "Hackathon Winner")
*Objetivo: Pulir, optimizar y expandir.*

1.  **Alexis:**  `01_a_MultiDomain_Logic` + `01_b_BatchTool`
2.  **Fernando:** `02_Docs`
3.  **Florentino:**  `03_a_Security` + `03_b_Performance` (*Crédito a Lorena*)
4.  **Florentino:** `04_a_Visuals` + `04_b_Animations`

---

## 📦 Contenido del Kit (`Entregables_Hackathon_G68_Final.zip`)

El archivo ZIP contiene:
1.  📁 `fase_1_mvp/`: Los parches para levantar el MVP.
2.  📁 `fase_2_mejoras/`: Los parches para llevarlo a nivel PRO.
3.  📄 `INSTRUCCIONES_MIGRACION.md`: Guía técnica comando a comando.
4.  📄 `MENSAJE_PARA_DIEGO.md`: Instrucciones para el Integrador.

¡Éxito equipo! A romperla en el Hackathon. 🏆
