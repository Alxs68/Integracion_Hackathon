// =====================
// Configuraci├│n de APIs
// =====================

// URL de la API en entorno remoto / dev
const API_ENDPOINTS = {
  DEV_BACKEND: "http://localhost:8000/sentiment",
  MODEL_LINEAR: "http://159.112.150.158:8080/predict",
  MODEL_BILSTM: "http://149.130.183.97:8080/predict"
};

// Endpoint por defecto (DEV)
let ACTIVE_API = API_ENDPOINTS.DEV_BACKEND;

let hasFirstMessageSent = false;

/**
 * Ajusta din├ímicamente la altura del textarea seg├║n el contenido
 */
function autoResize(textarea) {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = Math.min(textarea.scrollHeight, 260) + "px";
}

/**
 * Actualiza visibilidad de iconos (X y Ôåæ) seg├║n el contenido del textarea
 */
function updateInputIcons() {
  const textarea = document.getElementById("textInput");
  const clearBtn = document.getElementById("clearButton");
  const sendBtn = document.getElementById("sendButton");

  if (!textarea) return;

  const hasText = textarea.value.trim().length > 0;
  const isValidLength = textarea.value.trim().length >= 3;

  if (clearBtn) {
    clearBtn.classList.toggle("hidden", !hasText);
  }

  if (sendBtn) {
    sendBtn.classList.toggle("hidden", !hasText);
    sendBtn.disabled = !isValidLength;
  }
}

/**
 * Alterna el tema manualmente y guarda la preferencia en localStorage
 */
function toggleTheme() {
  const body = document.body;
  const isLight = body.classList.contains("theme-light");

  body.classList.remove("theme-light", "theme-dark");

  if (isLight) {
    body.classList.add("theme-dark");
    localStorage.setItem("g68-theme", "dark");
    console.log("[SentimentalIA] tema manual: oscuro");
  } else {
    body.classList.add("theme-light");
    localStorage.setItem("g68-theme", "light");
    console.log("[SentimentalIA] tema manual: claro");
  }
}

/**
 * Inicializa el tema buscando en localStorage o, si no hay nada, en el sistema operativo
 */
function initTheme() {
  const savedTheme = localStorage.getItem("g68-theme");
  const mq = window.matchMedia("(prefers-color-scheme: dark)");

  if (savedTheme) {
    document.body.classList.add(savedTheme === "dark" ? "theme-dark" : "theme-light");
    console.log("[SentimentalIA] tema cargado (localStorage):", savedTheme);
  } else {
    document.body.classList.add(mq.matches ? "theme-dark" : "theme-light");
    console.log("[SentimentalIA] tema cargado (OS):", mq.matches ? "oscuro" : "claro");
  }

  // Escuchar cambios de tema del sistema (solo si no hay preferencia manual guardada)
  mq.addEventListener("change", (event) => {
    if (!localStorage.getItem("g68-theme")) {
      document.body.classList.remove("theme-light", "theme-dark");
      document.body.classList.add(event.matches ? "theme-dark" : "theme-light");
    }
  });

  // Configurar listener del bot├│n toggle
  const toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleTheme);
  }
}

/**
 * Activa el ÔÇ£modo chatÔÇØ solo la primera vez:
 * - oculta hero
 * - ancla el input abajo con body.chat-mode
 */
function enterChatModeOnce() {
  if (hasFirstMessageSent) return;

  hasFirstMessageSent = true;

  const hero = document.querySelector(".hero");
  if (hero && !hero.classList.contains("hidden")) {
    hero.classList.add("hidden");
  }

  document.body.classList.add("chat-mode");
}

/**
 * Mostrar de nuevo ├írea de input + selector de modelo
 * (se usa desde el bot├│n "Nuevo sentimiento")
 */
function showInputAndModel() {
  const inputArea = document.querySelector(".input-area");
  const apiSelector = document.querySelector(".api-selector");

  if (inputArea) inputArea.classList.remove("hidden");
  if (apiSelector) apiSelector.classList.remove("hidden");

  const mainTextarea = document.getElementById("textInput");
  if (mainTextarea) {
    mainTextarea.value = "";
    autoResize(mainTextarea);
    updateInputIcons();
    mainTextarea.focus();

    // Scroll suave para que el textInput quede visible
    const rect = mainTextarea.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top - 120;
    window.scrollTo({
      top: absoluteTop,
      behavior: "smooth"
    });
  }
}

/**
 * Funci├│n principal: analiza el sentimiento llamando al backend
 * y muestra solo el ├ÜLTIMO comentario + resultado (sin historial visible).
 */
function analyze() {
  const textarea = document.getElementById("textInput");
  const text = textarea.value.trim();
  const btnSend = document.getElementById("sendButton");
  const history = document.getElementById("history");

  // Validaci├│n de longitud
  if (text.length < 3) {
    alert("el texto debe tener al menos 3 caracteres.");
    return;
  }
  if (text.length > 2000) {
    alert("el texto no puede superar los 2000 caracteres.");
    return;
  }

  // Entrar en modo chat (input fijo abajo) despu├®s del primer env├¡o v├ílido
  enterChatModeOnce();

  // 1) Limpiar historial visible (sin l├¡nea divisoria)
  if (history) {
    history.innerHTML = "";
  }

  // 2) Crear item (comentario + resultado)
  const item = document.createElement("div");
  item.className = "history-item";

  // Comentario del usuario (derecha)
  const userBlock = document.createElement("div");
  userBlock.className = "history-user";

  const userBubble = document.createElement("div");
  userBubble.className = "history-user-bubble";
  userBubble.textContent = text;

  userBlock.appendChild(userBubble);

  // Contenedor de respuesta (izquierda)
  const responseWrapper = document.createElement("div");
  responseWrapper.className = "history-response";

  const resultDiv = document.createElement("div");
  resultDiv.className = "result loading";
  resultDiv.innerHTML = `
    <div class="skeleton-line"></div>
    <div class="skeleton-line"></div>
  `;

  // Contenedor de acciones (ÔÇª , compartir, like, dislike)
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "result-actions";

  // Bot├│n "m├ís detalles..." (solo icono ÔÇóÔÇóÔÇó)
  const moreBtn = document.createElement("button");
  moreBtn.type = "button";
  moreBtn.className = "action-btn more-details";
  moreBtn.innerHTML = `
    <span class="action-icon-circle"><span>ÔÇóÔÇóÔÇó</span></span>
  `;
  moreBtn.addEventListener("click", () => {
    alert("m├ís detalles del modelo (en desarrollo).");
  });

  // Bot├│n compartir (flecha)
  const shareBtn = document.createElement("button");
  shareBtn.type = "button";
  shareBtn.className = "action-btn";
  shareBtn.innerHTML = `
    <span class="action-icon-circle"><span>Ôñ┤</span></span>
  `;
  shareBtn.addEventListener("click", () => {
    alert("funcionalidad de compartir (en desarrollo).");
  });

  // Bot├│n me gusta (coraz├│n ÔÖÑ)
  const likeBtn = document.createElement("button");
  likeBtn.type = "button";
  likeBtn.className = "action-btn";
  likeBtn.innerHTML = `
    <span class="action-icon-circle">
      <span class="icon-heart-like">ÔÖÑ</span>
    </span>
  `;
  likeBtn.addEventListener("click", () => {
    alert("feedback positivo registrado (en desarrollo).");
  });

  // Bot├│n no me gusta (coraz├│n ÔÖÑ rayado con CSS)
  const dislikeBtn = document.createElement("button");
  dislikeBtn.type = "button";
  dislikeBtn.className = "action-btn";
  dislikeBtn.innerHTML = `
    <span class="action-icon-circle">
      <span class="icon-heart-dislike">ÔÖÑ</span>
    </span>
  `;
  dislikeBtn.addEventListener("click", () => {
    alert("feedback negativo registrado (en desarrollo).");
  });

  actionsDiv.appendChild(moreBtn);
  actionsDiv.appendChild(shareBtn);
  actionsDiv.appendChild(likeBtn);
  actionsDiv.appendChild(dislikeBtn);

  // === Bot├│n "nuevo sentimiento" alineado a la derecha ===
  const newCommentBtn = document.createElement("button");
  newCommentBtn.type = "button";
  newCommentBtn.className = "action-btn new-comment-btn";
  newCommentBtn.title = "Nuevo sentimiento";
  newCommentBtn.innerHTML = `
    <span class="action-icon-circle">
      <span class="icon-new-comment">Ôƒ│</span>
    </span>
  `;

  newCommentBtn.addEventListener("click", () => {
    showInputAndModel();
  });

  // Contenedor fila: iconos a la izquierda, "nuevo" a la derecha
  const actionsRow = document.createElement("div");
  actionsRow.className = "result-actions-row";
  actionsRow.appendChild(actionsDiv);
  actionsRow.appendChild(newCommentBtn);

  responseWrapper.appendChild(resultDiv);
  responseWrapper.appendChild(actionsRow);

  item.appendChild(userBlock);
  item.appendChild(responseWrapper);

  if (history) {
    history.appendChild(item);

    // Scroll de la p├ígina para que el ├║ltimo mensaje quede visible
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth"
    });
  }

  // Limpiar textarea, ajustar altura e iconos (por consistencia interna)
  textarea.value = "";
  autoResize(textarea);
  updateInputIcons();

  if (btnSend) {
    btnSend.disabled = true;
    btnSend.classList.add("loading");
  }

  // === NO ocultar input y modelo activo tras enviar, para que el resultado se vea debajo ===
  // const inputArea = document.querySelector(".input-area");
  // const apiSelector = document.querySelector(".api-selector");
  // if (inputArea) inputArea.classList.add("hidden");
  // if (apiSelector) apiSelector.classList.add("hidden");

  // 3) Llamar a la API activa (con logging detallado)
  console.log("[SentimentalIA] llamando a endpoint:", ACTIVE_API);
  // Alerta temporal para depuraci├│n visual en el laboratorio del usuario
  // alert("Llamando a: " + ACTIVE_API); 

  fetch(ACTIVE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: text })
  })
    .then(async (response) => {
      console.log("[SentimentalIA] status HTTP:", response.status);

      if (!response.ok) {
        let errorText = "";
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = "<no se pudo leer el cuerpo de error>";
        }

        console.error(
          "[SentimentalIA] respuesta NO OK del backend:",
          response.status,
          errorText
        );
        const err = new Error("http " + response.status);
        err.httpStatus = response.status;
        err.backendBody = errorText;
        throw err;
      }

      const data = await response.json();
      console.log("[SentimentalIA] respuesta JSON:", data);
      return data;
    })
    .then((data) => {
      resultDiv.classList.remove("loading", "positive", "negative", "neutral");

      const prevision = data.prevision || "Neutro";
      const prob =
        typeof data.probabilidad === "number" ? data.probabilidad : 0.5;

      if (prevision === "Positivo") {
        resultDiv.classList.add("positive");
      } else if (prevision === "Negativo") {
        resultDiv.classList.add("negative");
      } else {
        resultDiv.classList.add("neutral");
      }

      // Fallback para el campo de explicabilidad
      const topFeatures = data.top_features || data.topFeatures || "";
      console.log("[SentimentalIA] explicabilidad detectada:", topFeatures);

      resultDiv.innerHTML = `
        <div class="result-main">
          <span class="sentiment-label">sentimiento:</span>
          <span class="sentiment-value">${prevision.toLowerCase()}</span>
        </div>
        <div class="probability">
          probabilidad: ${prob.toFixed(2)}
        </div>
        ${topFeatures
          ? `<div class="top-features" style="margin-top: 0.8rem; font-size: 0.95rem; color: var(--text-secondary); border-top: 1px solid var(--border); padding-top: 0.6rem; opacity: 0.9;">
                <strong style="color: var(--text-primary); font-weight: 600;">Palabras Clave:</strong> 
                <span class="features-list">${topFeatures}</span>
               </div>`
          : ""
        }
      `;
    })
    .catch((error) => {
      console.error("[SentimentalIA] error en fetch:", error);

      let mensajeUsuario = "ocurri├│ un error al comunicarse con el backend.";

      if (error.httpStatus) {
        mensajeUsuario += ` (http ${error.httpStatus})`;
      } else if (error instanceof TypeError) {
        mensajeUsuario +=
          " posible problema de cors o el endpoint no es accesible desde el navegador.";
      }

      resultDiv.className = "result neutral";
      resultDiv.textContent = mensajeUsuario;
    })
    .finally(() => {
      if (btnSend) {
        btnSend.disabled = false;
        btnSend.classList.remove("loading");
      }
    });
}

/**
 * Configura el selector de API (si existe en el HTML)
 */
function setupApiSelector() {
  const apiSelect = document.getElementById("apiSelect");
  if (!apiSelect) return;

  // Valor inicial alineado con ACTIVE_API
  apiSelect.value = "DEV_BACKEND";

  apiSelect.addEventListener("change", (e) => {
    const key = e.target.value;
    if (API_ENDPOINTS[key]) {
      ACTIVE_API = API_ENDPOINTS[key];
      console.log("[SentimentalIA] endpoint activo:", key, ACTIVE_API);
    }
  });
}

/**
 * Configura interacciones del input: auto-resize, enter/shift+enter, iconos, etc.
 */
function setupInputInteractions() {
  const textarea = document.getElementById("textInput");
  const clearBtn = document.getElementById("clearButton");
  const sendBtn = document.getElementById("sendButton");
  const langSelect = document.getElementById("langSelect");

  if (!textarea) return;

  textarea.addEventListener("input", () => {
    autoResize(textarea);
    updateInputIcons();
  });

  autoResize(textarea);
  updateInputIcons();

  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      if (event.shiftKey) {
        return;
      } else {
        event.preventDefault();
        analyze();
      }
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      textarea.value = "";
      autoResize(textarea);
      textarea.focus();
      updateInputIcons();
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener("click", () => {
      analyze();
    });
  }

  if (langSelect) {
    const updateLangTitle = () => {
      const val = langSelect.value;
      const fullName = val === "pt" ? "portugu├¬s" : "espa├▒ol";
      langSelect.title = fullName;
    };
    langSelect.addEventListener("change", updateLangTitle);
    updateLangTitle();
  }
}

/**
 * Maneja la navegaci├│n entre secciones (SPA simple)
 */
function setupNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".content-section, .conversation, .hero");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href").substring(1);

      // No prevenir default para que el hash cambie, pero manejar visibilidad
      // e.preventDefault(); 

      // Actualizar links activos
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      // Ocultar todas las secciones principales
      sections.forEach(s => s.classList.add("hidden"));

      // Mostrar la secci├│n destino
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.remove("hidden");

        // Si es inicio, mostrar tambi├®n hero si no se ha enviado nada
        if (targetId === "inicio") {
          document.querySelector(".conversation").classList.remove("hidden");
          if (!hasFirstMessageSent) {
            document.querySelector(".hero").classList.remove("hidden");
          }
        }
      }

      // Cargar datos si es dashboard o estad├¡sticas
      if (targetId === "dashboard") {
        fetchStats();
        setupDashboardEventHandlers();
      }
      if (targetId === "estadisticas") fetchHistory();
    });
  });
}

/**
 * Configura manejadores espec├¡ficos del dashboard (filtros)
 */
function setupDashboardEventHandlers() {
  const btnApply = document.getElementById("btn-apply-filters");
  if (btnApply && !btnApply.getAttribute("data-set")) {
    btnApply.setAttribute("data-set", "true");
    btnApply.addEventListener("click", () => {
      const start = document.getElementById("filter-start").value;
      const end = document.getElementById("filter-end").value;
      fetchStats(start, end);
    });
  }
}

/**
 * Obtiene y renderiza las estad├¡sticas del backend
 */
async function fetchStats(start = null, end = null) {
  try {
    let url = "http://localhost:8000/api/stats";
    const params = new URLSearchParams();
    if (start) params.append("start", start);
    if (end) params.append("end", end);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al obtener stats");
    const data = await response.json();

    // Actualizar contadores
    document.getElementById("stat-total").textContent = data.totalAnalisis;
    document.getElementById("stat-pos").textContent = data.conteoPorSentimiento["Positivo"] || 0;
    document.getElementById("stat-neu").textContent = data.conteoPorSentimiento["Neutral"] || 0;
    document.getElementById("stat-neg").textContent = data.conteoPorSentimiento["Negativo"] || 0;

    // Renderizar gr├ífico de dona
    renderDonutChart(data.conteoPorSentimiento, data.totalAnalisis);

    // Renderizar Keywords con desglose de sentimientos
    const keywordsList = document.getElementById("top-keywords-list");
    keywordsList.innerHTML = "";

    // data.topPalabrasClave es ahora una lista de objetos KeywordStats
    data.topPalabrasClave.forEach(item => {
      const posPct = item.count > 0 ? (item.positive / item.count * 100) : 0;
      const neuPct = item.count > 0 ? (item.neutral / item.count * 100) : 0;
      const negPct = item.count > 0 ? (item.negative / item.count * 100) : 0;

      keywordsList.innerHTML += `
        <li class="kw-analytics-item">
          <div class="kw-header">
            <span class="kw-name">${item.word}</span>
            <span class="kw-total">${item.count} menciones</span>
          </div>
          <div class="kw-bar-group">
            <div class="kw-seg pos" style="width: ${posPct}%" title="Positivas: ${item.positive}"></div>
            <div class="kw-seg neu" style="width: ${neuPct}%" title="Neutras: ${item.neutral}"></div>
            <div class="kw-seg neg" style="width: ${negPct}%" title="Negativas: ${item.negative}"></div>
          </div>
        </li>
      `;
    });

  } catch (error) {
    console.error("[Dashboard] Error:", error);
  }
}

/**
 * Renderiza gr├ífico circular tipo dona usando CSS Conic Gradient
 */
function renderDonutChart(counts, total) {
  const donut = document.getElementById("sentiment-donut");
  const legend = document.getElementById("donut-legend");
  if (!donut || !legend) return;

  if (total === 0) {
    donut.style.background = "#334155";
    legend.innerHTML = "<div class='legend-item'>Sin datos para graficar</div>";
    return;
  }

  const pos = counts["Positivo"] || 0;
  const neu = counts["Neutral"] || 0;
  const neg = counts["Negativo"] || 0;

  const posPct = (pos / total) * 100;
  const neuPct = (neu / total) * 100;
  const negPct = (neg / total) * 100;

  // Paleta Incluyente (Blues / Oranges)
  const colorPos = "#3b82f6"; // Azul Profesional
  const colorNeu = "#94a3b8"; // Slate
  const colorNeg = "#f97316"; // Naranja Accesible

  // Generar gradiente c├│nico para la dona
  const p1 = posPct;
  const p2 = posPct + neuPct;

  donut.style.background = `conic-gradient(
    ${colorPos} 0% ${p1}%,
    ${colorNeu} ${p1}% ${p2}%,
    ${colorNeg} ${p2}% 100%
  )`;

  // Leyenda detallada
  legend.innerHTML = `
    <div class="legend-item"><span class="legend-dot" style="background:${colorPos}"></span> Positivos: ${posPct.toFixed(1)}%</div>
    <div class="legend-item"><span class="legend-dot" style="background:${colorNeu}"></span> Neutros: ${neuPct.toFixed(1)}%</div>
    <div class="legend-item"><span class="legend-dot" style="background:${colorNeg}"></span> Negativos: ${negPct.toFixed(1)}%</div>
  `;
}

/**
 * Obtiene y renderiza el historial de an├ílisis
 */
async function fetchHistory() {
  try {
    const response = await fetch("http://localhost:8000/api/history");
    if (!response.ok) throw new Error("Error al obtener historial");
    const entries = await response.json();

    const tableBody = document.getElementById("history-table-body");
    tableBody.innerHTML = "";

    entries.forEach(entry => {
      const date = new Date(entry.fecha).toLocaleString();
      tableBody.innerHTML += `
        <tr>
          <td>${date}</td>
          <td title="${entry.text}">${entry.text.substring(0, 50)}${entry.text.length > 50 ? "..." : ""}</td>
          <td><span class="sentiment-badge ${entry.prevision.toLowerCase()}">${entry.prevision}</span></td>
          <td>${(entry.probabilidad * 100).toFixed(1)}%</td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("[Historial] Error:", error);
  }
}

/**
 * Configura la funcionalidad de carga masiva por CSV
 */
function setupBatchProcessing() {
  const btn = document.getElementById("btnImportCSV");
  const input = document.getElementById("csvFileInput");

  if (!btn || !input) return;

  btn.addEventListener("click", () => {
    input.click();
  });

  input.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target.result;
      const lines = csvText.split(/\r?\n/);
      if (lines.length < 2) return;

      const header = lines[0].split(",");
      // Buscar columna "Rese├▒a" o similar
      let colIndex = header.findIndex(h => /rese├▒a|text|review/i.test(h.trim().replace(/"/g, "")));
      if (colIndex === -1) colIndex = header.length - 1; // Fallback a la ├║ltima columna

      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Procesando...`;

      // Redirigir al dashboard para ver el progreso real
      const dashLink = document.querySelector('a[href="#dashboard"]');
      if (dashLink) dashLink.click();

      let processed = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const text = (parts[colIndex] || "").replace(/"/g, "").trim();

        if (text.length >= 3) {
          try {
            await fetch(ACTIVE_API, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: text })
            });
            processed++;
            if (processed % 5 === 0) {
              btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> (${processed})...`;
              fetchStats();
            }
          } catch (err) {
            console.error("Error en batch:", err);
          }
        }
      }

      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-file-csv"></i> Procesar Lote CSV`;
      alert(`Se procesaron ${processed} rese├▒as exitosamente.`);
      fetchStats();
      input.value = "";
    };
    reader.readAsText(file);
  });
}

// Inicializar cuando el DOM est├í listo
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setupInputInteractions();
  setupApiSelector();
  setupNavigation();
  setupBatchProcessing();

  // Limpieza por si hubiera alg├║n input secundario viejo
  const legacySecondary = document.querySelector(
    ".secondary-input, #secondaryInputWrapper, #secondTextInput"
  );
  if (legacySecondary) {
    legacySecondary.style.display = "none";
  }
});
++ b/frontend/index.html
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <title>Sentimental IA ÔÇô Demo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="style.css" />
</head>

<body>
  <header class="topbar">
    <div class="topbar-left">
      H12-25-L-Equipo 68
    </div>

    <nav class="topbar-center">
      <ul class="nav-links">
        <li><a href="#inicio" class="nav-link active">Inicio</a></li>
        <li><a href="#dashboard" class="nav-link">Dashboard</a></li>
        <li><a href="#estadisticas" class="nav-link">Estad├¡sticas</a></li>
        <li><a href="#docs" class="nav-link">Docs</a></li>
        <li><a href="#recursos" class="nav-link">Recursos</a></li>
      </ul>
    </nav>

    <div class="topbar-right">
      <button id="theme-toggle" class="btn-theme-toggle" aria-label="Cambiar tema">
        <span class="icon-sun">ÔÿÇ´©Å</span>
        <span class="icon-moon">­ƒîÖ</span>
      </button>
      <button type="button" class="btn-login">Iniciar sesi├│n</button>
    </div>
  </header>

  <main class="page">
    <!-- Hero inicial (se oculta despu├®s del primer env├¡o v├ílido) -->
    <section class="hero">
      <h1 class="branding-title">Sentimental IA</h1>
      <h2 class="branding-subtitle">An├ílisis inteligente de comentarios</h2>
    </section>

    <section class="conversation" id="inicio">
      <!-- Selector de modelo / endpoint activo -->
      <div class="api-selector">
        <label for="apiSelect">Modelo activo:</label>
        <select id="apiSelect">
          <option value="DEV_BACKEND">Sistema H├¡brido G68 (Local)</option>
          <option value="MODEL_LINEAR">Modelo Linear (Temporal)</option>
          <option value="MODEL_BILSTM">Modelo Bi-LSTM OCI</option>
        </select>
      </div>

      <!-- ├ürea de entrada principal (├║nico textInput) -->
      <section class="input-area">
        <div class="input-wrapper">
          <textarea id="textInput" class="search-input" placeholder="Haz tu comentario..." rows="3" spellcheck="true"
            autocomplete="off"></textarea>

          <!-- Icono (+) adjuntar -->
          <button type="button" id="attachButton" class="input-action input-attach" aria-label="Adjuntar archivo">
            +
          </button>

          <!-- Selector de idioma ES/PT -->
          <select id="langSelect" class="input-action input-lang" aria-label="Seleccionar idioma">
            <option value="es">ES</option>
            <option value="pt">PT</option>
          </select>

          <!-- Bot├│n limpiar (X) -->
          <button type="button" id="clearButton" class="input-action input-clear hidden" aria-label="Limpiar texto">
            ├ù
          </button>

          <!-- Bot├│n enviar (flecha Ôåæ) -->
          <button type="button" id="sendButton" class="input-action input-send hidden"
            aria-label="Analizar sentimiento">
            Ôåæ
          </button>
        </div>

        <div class="batch-action-container">
          <button id="btnImportCSV" class="btn-import-batch">
            <i class="fas fa-file-csv"></i> Procesar Lote CSV
          </button>
          <input type="file" id="csvFileInput" accept=".csv" style="display: none;">
        </div>
      </section>

      <!-- Resultados aparecen DEBAJO del input -->
      <div id="history" class="history"></div>
    </section>

    <!-- Secci├│n Dashboard: Resumen y Estad├¡sticas r├ípidas -->
    <section id="dashboard" class="content-section hidden">
      <div class="section-header-row">
        <h2 class="section-title">Panel de Auditor├¡a de Sentimiento</h2>
        <div class="date-filters disabled-feature" title="Pr├│ximamente: Filtrado por Rango de Fechas">
          <input type="date" id="filter-start" class="date-input" disabled title="Pr├│ximamente">
          <span class="date-sep">ÔåÆ</span>
          <input type="date" id="filter-end" class="date-input" disabled title="Pr├│ximamente">
          <button id="btn-apply-filters" class="btn-apply" disabled
            style="opacity: 0.5; cursor: not-allowed;">Filtrar</button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value" id="stat-total">0</span>
          <span class="stat-label">Total An├ílisis</span>
        </div>
        <div class="stat-card positive">
          <span class="stat-value" id="stat-pos">0</span>
          <span class="stat-label">Positivos</span>
        </div>
        <div class="stat-card neutral">
          <span class="stat-value" id="stat-neu">0</span>
          <span class="stat-label">Neutros</span>
        </div>
        <div class="stat-card negative">
          <span class="stat-value" id="stat-neg">0</span>
          <span class="stat-label">Negativos</span>
        </div>
      </div>

      <div class="dashboard-charts">
        <div class="chart-container">
          <h3>Distribuci├│n General</h3>
          <div class="donut-display">
            <div id="sentiment-donut" class="donut-chart"></div>
            <div id="donut-legend" class="donut-legend"></div>
          </div>
        </div>
        <div class="chart-container">
          <h3>Palabras Clave Cr├¡ticas</h3>
          <ul id="top-keywords-list" class="keywords-analytics">
            <!-- Se llenar├í v├¡a JS -->
          </ul>
        </div>
      </div>
    </section>

    <section id="estadisticas" class="content-section hidden">
      <h2 class="section-title">Miner├¡a e Historial de Auditor├¡a</h2>
      <div class="table-container history-scroll" style="max-height: 500px; overflow-y: auto;">
        <table class="history-table">
          <thead>
            <tr>
              <th style="position: sticky; top: 0; z-index: 10;">­ƒòÆ Fecha</th>
              <th style="position: sticky; top: 0; z-index: 10;">­ƒÆ¼ Comentario</th>
              <th style="position: sticky; top: 0; z-index: 10;">­ƒôè Sentimiento</th>
              <th style="position: sticky; top: 0; z-index: 10;">­ƒÄ» Confianza</th>
            </tr>
          </thead>
          <tbody id="history-table-body">
            <!-- Se llenar├í v├¡a JS (Top 50 registros) -->
          </tbody>
        </table>
      </div>
    </section>

    <section id="docs" class="content-section hidden">
      <h2 class="section-title">Documentaci├│n T├®cnica e Interoperabilidad</h2>
      <div class="dashboard-charts">
        <div class="chart-container">
          <h3>Frontend Ôåö Backend (Java)</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Comunicaci├│n v├¡a REST con Spring Boot. Manejo de
            estados de carga y persistencia en H2.</p>
          <pre
            style="background: rgba(0,0,0,0.2); padding: 0.8rem; border-radius: 8px; font-size: 0.75rem; overflow-x: auto;">
GET /api/stats?start=ISO&end=ISO
POST /sentiment { "text": "..." }</pre>
        </div>
        <div class="chart-container">
          <h3>Backend (Java) Ôåö ML (Python)</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Integraci├│n s├¡ncrona mediante Feign/RestTemplate.
            El motor Python procesa la l├│gica h├¡brida.</p>
          <pre
            style="background: rgba(0,0,0,0.2); padding: 0.8rem; border-radius: 8px; font-size: 0.75rem; overflow-x: auto;">
POST /predict/sentiment
Respuesta: { "prevision", "probabilidad", "top_features" }</pre>
        </div>
      </div>
    </section>

    <section id="recursos" class="content-section hidden">
      <h2 class="section-title">Artefactos del Proyecto</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value" style="font-size: 1.2rem;">Datsets</span>
          <span class="stat-label">Corpus G68</span>
        </div>
        <div class="stat-card">
          <span class="stat-value" style="font-size: 1.2rem;">Modelos</span>
          <span class="stat-label">Bi-LSTM / Linear</span>
        </div>
        <div class="stat-card">
          <span class="stat-value" style="font-size: 1.2rem;">Notebooks</span>
          <span class="stat-label">Jupyter Lab</span>
        </div>
      </div>
    </section>
  </main>

  <script src="app.js?v=4"></script>
</body>

</html>
++ b/frontend/style.css
:root {
  /* Tema oscuro (por defecto) */
  --bg-body: #0b1120;
  --bg-surface: #020617;
  --bg-surface-alt: #030712;
  --border-subtle: rgba(148, 163, 184, 0.25);
  --border-strong: rgba(148, 163, 184, 0.35);
  --text-primary: #e5e7eb;
  --text-secondary: #9ca3af;
  --accent: #6366f1;
  --accent-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  --success: #06b6d4;
  --success-gradient: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  --danger: #f43f5e;
  --danger-gradient: linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%);
  --neutral-gradient: linear-gradient(135deg, #94a3b8 0%, #475569 100%);
  --bg-card: rgba(30, 41, 59, 0.7);
  --border-glass: rgba(255, 255, 255, 0.1);
}

/* Tema claro: se activa con body.theme-light */
body.theme-light {
  --bg-body: #f9fafb;
  --bg-surface: #ffffff;
  --bg-surface-alt: #f3f4f6;
  --border-subtle: rgba(148, 163, 184, 0.5);
  --border-strong: rgba(148, 163, 184, 0.8);
  --text-primary: #111827;
  --text-secondary: #4b5563;
  --accent: #2563eb;
  --accent-soft: rgba(37, 99, 235, 0.12);
  --danger: #ea580c;
  --danger-soft: rgba(234, 88, 12, 0.1);
  --success: #2563eb;
  --success-soft: rgba(37, 99, 235, 0.12);
  --neutral-soft: rgba(148, 163, 184, 0.3);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "Segoe UI", sans-serif;
  background: radial-gradient(circle at top, #1e293b 0, #020617 55%);
  color: var(--text-primary);
  transition: background 0.4s ease, color 0.4s ease;
}

/* Fondo alterno para tema claro */
body.theme-light {
  background: radial-gradient(circle at top, #e5e7eb 0, #f9fafb 55%);
}

.hidden {
  display: none !important;
}

/* Topbar */

.topbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 1.3rem 2rem;
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(2, 6, 23, 0.92);
  backdrop-filter: blur(14px);
  position: sticky;
  top: 0;
  z-index: 10;
}

body.theme-light .topbar {
  background: rgba(249, 250, 251, 0.9);
}

.topbar-left {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.topbar-center {
  display: flex;
  justify-content: center;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 1rem;
  padding: 0;
  margin: 0;
}

.nav-link {
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  color: var(--text-secondary);
  position: relative;
  overflow: hidden;
  transition: color 0.15s ease-out, background 0.15s ease-out;
}

.nav-link::after {
  content: "";
  position: absolute;
  left: 10%;
  right: 90%;
  bottom: 0.15rem;
  height: 2px;
  background: linear-gradient(to right, #38bdf8, #6366f1, #a855f7);
  opacity: 0;
  transition: opacity 0.15s ease-out, right 0.18s ease-out;
}

.nav-link:hover::after,
.nav-link.active::after {
  opacity: 1;
  right: 10%;
}

.nav-link:hover {
  background: rgba(15, 23, 42, 0.8);
  color: #e5e7eb;
}

body.theme-light .nav-link:hover {
  background: rgba(229, 231, 235, 0.9);
  color: var(--text-primary);
}

.nav-link.active {
  background: rgba(30, 64, 175, 0.25);
  color: #e5e7eb;
}

body.theme-light .nav-link.active {
  background: rgba(37, 99, 235, 0.15);
  color: var(--text-primary);
}

/* Theme Toggle Button */
.btn-theme-toggle {
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.8rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1.1rem;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.btn-theme-toggle:hover {
  transform: scale(1.08) rotate(5deg);
  border-color: var(--accent);
  background: var(--accent-soft);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.btn-theme-toggle:active {
  transform: scale(0.95);
}

/* Toggle icon display logic */
body.theme-light .icon-sun {
  display: none;
}

body:not(.theme-light) .icon-moon {
  display: none;
}

.topbar-right {
  display: flex;
  justify-content: flex-end;
}

.btn-login {
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.5);
  background: radial-gradient(circle at top left, #1d4ed8 0, #020617 60%);
  color: #e5e7eb;
  font-size: 0.82rem;
  cursor: pointer;
  transition: transform 0.1s ease-out, box-shadow 0.12s ease-out,
    border-color 0.15s ease-out;
}

body.theme-light .btn-login {
  background: radial-gradient(circle at top left, #3b82f6 0, #ffffff 55%);
  color: #111827;
}

.btn-login:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 25px rgba(15, 23, 42, 0.7);
  border-color: rgba(129, 140, 248, 0.85);
}

/* Layout principal */

.page {
  max-width: 1040px;
  margin: 3rem auto 2.5rem;
  padding: 0 1rem 2rem;
}

/* Hero */

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 26vh;
  padding-top: 1.2rem;
  padding-bottom: 0.6rem;
  text-align: center;
  gap: 0.15rem;
}

.branding-title {
  font-size: 2.7rem;
  font-weight: 700;
  letter-spacing: 0.015em;
  line-height: 1.05;
  margin-bottom: 0.35rem;
}

.branding-subtitle {
  font-size: 1.2rem;
  font-weight: 500;
  opacity: 0.95;
  letter-spacing: 0.01em;
  margin-bottom: 0.35rem;
  margin-top: 0.5rem;
}

/* Conversaci├│n + input */

.conversation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  margin-top: 1.5rem;
  width: 100%;
}

/* Historial */

.history {
  width: 100%;
  max-width: 760px;
  margin: 0 auto 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  max-height: none;
  overflow-y: visible;
  padding-right: 0;
}

.history-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Comentario usuario: alineado a la derecha con burbuja */

.history-user {
  text-align: right;
}

.history-user-bubble {
  display: inline-block;
  max-width: 80%;
  padding: 0.55rem 0.8rem;
  border-radius: 14px 14px 4px 14px;
  background: rgba(37, 99, 235, 0.16);
  color: var(--text-primary);
  line-height: 1.4;
  text-align: left;
  white-space: pre-wrap;
  font-size: 1.05rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.65);
  letter-spacing: 0.01em;
  text-transform: lowercase;
  margin-bottom: 0.25rem;
}

body.theme-light .history-user-bubble {
  background: rgba(37, 99, 235, 0.08);
  box-shadow: 0 10px 20px rgba(148, 163, 184, 0.4);
}

/* Respuesta alineada a la izquierda */

.history-response {
  text-align: left;
}

.history-response .result {
  display: block;
  text-align: left;
}

/* Resultados (texto ÔÇ£normalÔÇØ) */

.result {
  font-size: 1.12rem;
  line-height: 1.55;
  margin-bottom: 2.5rem;
  padding: 0;
  border-radius: 0;
  background: transparent;
  border: none;
}

.sentiment-label {
  font-weight: 500;
  margin-right: 0.25rem;
}

.sentiment-value {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.result.positive .sentiment-value {
  color: var(--success);
}

.result.negative .sentiment-value {
  color: var(--danger);
}

.result.neutral .sentiment-value {
  color: var(--text-secondary);
}

.probability {
  font-size: 0.98rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

/* Skeleton carga */

.result.loading {
  border: none;
  background: transparent;
}

body.theme-light .result.loading {
  background: transparent;
}

.skeleton-line {
  height: 0.55rem;
  border-radius: 999px;
  margin-bottom: 0.35rem;
  background: linear-gradient(90deg,
      rgba(148, 163, 184, 0.12),
      rgba(148, 163, 184, 0.3),
      rgba(148, 163, 184, 0.12));
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.1s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* =============================
   Fila de acciones + nuevo btn
   ============================= */

.result-actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* iconos a la izq, nuevo btn a la der */
  margin-top: 0.85rem;
  gap: 0.75rem;
}

/* Fila de acciones debajo de cada resultado (iconos existentes) */

.result-actions {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* Bot├│n gen├®rico de acci├│n (icono redondo) */

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  font-size: 0.78rem;
}

/* C├¡rculo del icono */

.action-icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface-alt);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition:
    background 0.15s ease-out,
    border-color 0.15s ease-out,
    transform 0.1s ease-out,
    box-shadow 0.15s ease-out,
    color 0.15s ease-out;
}

/* Iconos dentro del c├¡rculo */
.action-icon-circle span,
.icon-heart-like,
.icon-heart-dislike {
  font-size: 18px;
  color: inherit;
}

/* En tema claro, cambiamos a color oscuro para todos los iconos */
body.theme-light .action-icon-circle,
body.theme-light .action-icon-circle span,
body.theme-light .icon-heart-like,
body.theme-light .icon-heart-dislike {
  color: #111827;
}

/* Corazones: me gusta / no me gusta */

.icon-heart-like,
.icon-heart-dislike {
  font-size: 0.9rem;
  line-height: 1;
  display: inline-block;
  color: inherit;
}

/* Coraz├│n "tachado" para NO me gusta */
.icon-heart-dislike {
  position: relative;
}

.icon-heart-dislike::after {
  content: "";
  position: absolute;
  left: -0.15rem;
  right: -0.15rem;
  top: 50%;
  height: 1px;
  background: currentColor;
  transform: rotate(-28deg);
}

/* Efecto hover en TODOS los iconos: solo c├¡rculo/sombra/contraste */
.action-btn:hover .action-icon-circle {
  background: var(--accent-soft);
  border-color: var(--accent);
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.35);
}

/* Sin texto visible (labels) debajo de los iconos */
.action-label {
  display: none;
}

/* ====== Bot├│n "nuevo sentimiento" ====== */

.new-comment-btn .action-icon-circle {
  width: 40px;
  height: 40px;
}

/* icono Ôƒ│ un poco m├ís fuerte */
.icon-new-comment {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  display: inline-block;
}

/* Que el hover del nuevo sentimiento sea un poquito m├ís marcado */
.new-comment-btn:hover .action-icon-circle {
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.55);
  color: #f9fafb;
}

/* Selector de modelo (api-selector) */

.api-selector {
  width: 100%;
  max-width: 760px;
  margin: 0.25rem auto 0.75rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.api-selector label {
  opacity: 0.9;
}

.api-selector select {
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface-alt);
  color: var(--text-primary);
  font-size: 0.82rem;
  cursor: pointer;
}

body.theme-light .api-selector select {
  background: #ffffff;
}

/* Input area */

.input-area {
  width: 100%;
  display: flex;
  justify-content: center;
}

.input-wrapper {
  position: relative;
  width: 100%;
  max-width: 760px;
  border-radius: 1.25rem;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: radial-gradient(circle at top left,
      rgba(37, 99, 235, 0.12),
      transparent 55%),
    radial-gradient(circle at bottom right,
      rgba(236, 72, 153, 0.12),
      transparent 55%),
    rgba(15, 23, 42, 0.98);
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.95),
    0 0 0 1px rgba(15, 23, 42, 0.8);
  padding: 0.65rem 0.75rem 0.7rem;
}

body.theme-light .input-wrapper {
  background: radial-gradient(circle at top left,
      rgba(37, 99, 235, 0.08),
      transparent 55%),
    radial-gradient(circle at bottom right,
      rgba(236, 72, 153, 0.08),
      transparent 55%),
    #ffffff;
  box-shadow:
    0 18px 45px rgba(148, 163, 184, 0.35),
    0 0 0 1px rgba(209, 213, 219, 0.7);
}

/* Textarea */

.search-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.98rem;
  line-height: 1.45;
  resize: none;
  padding: 0.25rem 2.6rem 2rem 2.6rem;
  min-height: 90px;
  max-height: 260px;
}

/* Acciones alrededor del textarea */

.input-action {
  position: absolute;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface-alt);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease-out, border-color 0.15s ease-out,
    color 0.15s ease-out, transform 0.1s ease-out, box-shadow 0.12s ease-out;
  font-size: 0.9rem;
}

/* Bot├│n (+) */

.input-attach {
  position: absolute;
  left: 0.9rem;
  bottom: 0.8rem;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: var(--bg-surface-alt);
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 700;
}

.input-attach:hover {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--text-primary);
  transform: translateY(-1px);
}

/* Selector de idioma (ES/PT) al lado del + */

.input-lang {
  position: absolute;
  left: calc(0.9rem + 1.9rem + 0.45rem);
  bottom: 0.8rem;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-align: center;
  line-height: 1.9rem;
  padding: 0;
  margin: 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

body.theme-light .input-lang {
  background: linear-gradient(135deg, #e5e7eb, #ffffff);
}

/* Bot├│n limpiar (X) arriba derecha del textInput */

.input-clear {
  position: absolute;
  top: 0.8rem;
  right: 0.9rem;
  width: 2rem;
  height: 2rem;
  font-size: 1.1rem;
}

/* Bot├│n enviar (Ôåæ) abajo derecha del textInput */

.input-send {
  position: absolute;
  right: 0.9rem;
  bottom: 0.8rem;
  width: 2rem;
  height: 2rem;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #f9fafb;
  border-color: transparent;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.35);
}

.input-send:hover:not(.loading) {
  transform: translateY(-1px);
  box-shadow: 0 16px 36px rgba(37, 99, 235, 0.5);
}

.input-send.loading {
  opacity: 0.65;
  cursor: wait;
}

/* Responsivo */

@media (max-width: 768px) {
  .topbar {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    row-gap: 0.35rem;
  }

  .topbar-center {
    grid-column: 1 / -1;
    justify-content: center;
  }

  .page {
    margin-top: 1rem;
  }

  .hero {
    min-height: 22vh;
    padding-top: 1.2rem;
    padding-bottom: 0.05rem;
  }

  .branding-title {
    font-size: 2.2rem;
  }

  .branding-subtitle {
    font-size: 1.05rem;
    margin-top: 0.15rem;
  }

  .history {
    max-height: none;
  }

  .result-actions-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .api-selector {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 780px) {
  .branding-title {
    font-size: 2.3rem;
  }

  .branding-subtitle {
    font-size: 1.05rem;
  }
}

/* =====================
   DASHBOARD & STATS 
   ===================== */
.content-section {
  padding: 1rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.2rem;
  color: var(--text-primary);
  border-left: 4px solid var(--accent);
  padding-left: 0.8rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--bg-card);
  padding: 1rem 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--border-glass);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent-gradient);
}

.stat-card:hover {
  transform: translateY(-4px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.5);
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 800;
  display: inline-block;
  background: #ffffff;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
}

.stat-card.positive::before {
  background: var(--success-gradient);
}

.stat-card.positive .stat-value {
  background: var(--success-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-card.negative::before {
  background: var(--danger-gradient);
}

.stat-card.negative .stat-value {
  background: var(--danger-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-card.neutral::before {
  background: var(--neutral-gradient);
}

.stat-card.neutral .stat-value {
  background: var(--neutral-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Nuevo contenedor para carga por lotes */
.batch-action-container {
  margin-top: 1.2rem;
  width: 100%;
  max-width: 760px;
  display: flex;
  justify-content: flex-end;
}

.btn-import-batch {
  background: var(--bg-surface-alt);
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-import-batch:hover {
  background: var(--accent);
  color: white;
  box-shadow: 0 4px 12px var(--accent-soft);
}

/* Dashboard Layout */
.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.date-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-surface-alt);
  padding: 0.4rem 0.8rem;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
}

.date-filters.disabled-feature {
  opacity: 0.6;
  filter: grayscale(0.2);
  cursor: help;
  position: relative;
}

.date-input {
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
}

.date-sep {
  color: var(--text-secondary);
  font-weight: bold;
}

.btn-apply {
  background: var(--accent);
  color: white;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-left: 0.5rem;
}

.dashboard-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

.chart-container {
  background: var(--bg-surface-alt);
  padding: 1.2rem;
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.chart-container h3 {
  font-size: 1rem;
  margin-top: 0;
  margin-bottom: 1.2rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Donut Chart CSS */
.donut-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.donut-chart {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  position: relative;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
}

.donut-chart::after {
  content: "";
  position: absolute;
  top: 22%;
  left: 22%;
  width: 56%;
  height: 56%;
  background: var(--bg-surface-alt);
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-primary);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

/* Keyword Analytics Detail */
.keywords-analytics {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 5px;
}

/* Custom Scrollbar for keywords */
.keywords-analytics::-webkit-scrollbar {
  width: 4px;
}

.keywords-analytics::-webkit-scrollbar-track {
  background: transparent;
}

.keywords-analytics::-webkit-scrollbar-thumb {
  background: var(--border-subtle);
  border-radius: 10px;
}

.kw-analytics-item {
  margin-bottom: 0.8rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--border-subtle);
}

.kw-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.kw-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.kw-total {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.kw-bar-group {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: var(--border-subtle);
}

.kw-seg {
  height: 100%;
}

.kw-seg.pos {
  background: var(--success-gradient);
}

.kw-seg.neu {
  background: var(--neutral-gradient);
}

.kw-seg.neg {
  background: var(--danger-gradient);
}

.keyword-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--border-subtle);
}

.keyword-name {
  font-size: 0.95rem;
  color: var(--text-primary);
}

.keyword-badge {
  background: var(--accent-soft);
  color: var(--accent);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
}

/* Tablas */
.table-container {
  overflow-x: auto;
  background: var(--bg-card);
  border-radius: 16px;
  border: 1px solid var(--border-glass);
  margin-top: 1rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}

.history-table th,
.history-table td {
  padding: 1.1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-subtle);
}

.history-table th {
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(5px);
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
}

.history-scroll {
  scrollbar-width: thin;
  scrollbar-color: var(--accent) transparent;
}

.history-scroll::-webkit-scrollbar {
  width: 6px;
}

.history-scroll::-webkit-scrollbar-thumb {
  background: var(--accent-gradient);
  border-radius: 10px;
}

.sentiment-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
}

.sentiment-badge.positivo {
  background: var(--success-gradient);
}

.sentiment-badge.negativo {
  background: var(--danger-gradient);
}

.sentiment-badge.neutro {
  background: var(--neutral-gradient);
}

body.theme-dark .history-table th {
  background: rgba(255, 255, 255, 0.03);
}

.hidden {
  display: none !important;
}
