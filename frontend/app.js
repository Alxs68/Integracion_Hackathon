// =====================
// Configuración de APIs
// =====================

// URL de la API en entorno remoto / dev
/**
 * Sentimental IA - Frontend Logic
 * Autores Originales:
 * - Frontend Architecture: Florentino (G68)
 * - Database Integration: Lorena (G68)
 * - Refactor Supreme: Antigravity Agent
 */

// URL de la API en entorno remoto / dev
const API_ENDPOINTS = {
  DEV_BACKEND: "http://localhost:8000/api/sentiment/analyze",
  MODEL_LINEAR: "http://159.112.150.158:8080/predict",
  MODEL_BILSTM: "http://149.130.183.97:8080/predict"
};

// Endpoint por defecto (DEV)
let ACTIVE_API = API_ENDPOINTS.DEV_BACKEND;

let hasFirstMessageSent = false;

/**
 * Ajusta dinámicamente la altura del textarea según el contenido
 */
function autoResize(textarea) {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = Math.min(textarea.scrollHeight, 260) + "px";
}

/**
 * Actualiza visibilidad de iconos (X y ↑) según el contenido del textarea
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

  // Configurar listener del botón toggle
  const toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleTheme);
  }
}

/**
 * Activa el “modo chat” solo la primera vez:
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
 * Mostrar de nuevo área de input + selector de modelo
 * (se usa desde el botón "Nuevo sentimiento")
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
 * Función principal: analiza el sentimiento llamando al backend
 * y muestra solo el ÚLTIMO comentario + resultado (sin historial visible).
 */
function analyze() {
  const textarea = document.getElementById("textInput");
  const text = textarea.value.trim();
  const btnSend = document.getElementById("sendButton");
  const history = document.getElementById("history");

  // Validación de longitud
  if (text.length < 3) {
    alert("el texto debe tener al menos 3 caracteres.");
    return;
  }
  if (text.length > 2000) {
    alert("el texto no puede superar los 2000 caracteres.");
    return;
  }

  // Entrar en modo chat (input fijo abajo) después del primer envío válido
  enterChatModeOnce();

  // 1) Limpiar historial visible (sin línea divisoria)
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

  // Contenedor de acciones (… , compartir, like, dislike)
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "result-actions";

  // Botón "más detalles..." (solo icono •••)
  const moreBtn = document.createElement("button");
  moreBtn.type = "button";
  moreBtn.className = "action-btn more-details";
  moreBtn.innerHTML = `
    <span class="action-icon-circle"><span>•••</span></span>
  `;
  moreBtn.addEventListener("click", () => {
    alert("más detalles del modelo (en desarrollo).");
  });

  // Botón compartir (flecha)
  const shareBtn = document.createElement("button");
  shareBtn.type = "button";
  shareBtn.className = "action-btn";
  shareBtn.innerHTML = `
    <span class="action-icon-circle"><span>⤴</span></span>
  `;
  shareBtn.addEventListener("click", () => {
    alert("funcionalidad de compartir (en desarrollo).");
  });

  // ID para feedback (si existe)
  const analysisId = data.id;

  // Botón me gusta (corazón ♥)
  const likeBtn = document.createElement("button");
  likeBtn.type = "button";
  likeBtn.className = "action-btn";
  likeBtn.innerHTML = `
    <span class="action-icon-circle">
      <span class="icon-heart-like">👍</span>
    </span>
  `;
  likeBtn.addEventListener("click", () => {
    if (!analysisId) {
      alert("No se puede guardar feedback de esta versión antigua.");
      return;
    }
    fetch("http://localhost:8000/api/sentiment/feedback/" + analysisId + "?type=LIKE", { method: "POST" })
      .then(() => alert("Gracias por tu feedback!"))
      .catch(e => console.error(e));
  });

  // Botón no me gusta (corazón ♥ rayado con CSS)
  const dislikeBtn = document.createElement("button");
  dislikeBtn.type = "button";
  dislikeBtn.className = "action-btn";
  dislikeBtn.innerHTML = `
    <span class="action-icon-circle">
      <span class="icon-heart-dislike">👎</span>
    </span>
  `;
  dislikeBtn.addEventListener("click", () => {
    if (!analysisId) {
      alert("No se puede guardar feedback de esta versión antigua.");
      return;
    }
    fetch("http://localhost:8000/api/sentiment/feedback/" + analysisId + "?type=DISLIKE", { method: "POST" })
      .then(() => alert("Feedback negativo registrado."))
      .catch(e => console.error(e));
  });

  // -- MOVED TO INSIDE .then() to have access to ID -- 
  // Placeholder container
  actionsDiv.appendChild(moreBtn);
  actionsDiv.appendChild(shareBtn);
  // Like/Dislike appended later upon success
  const pendingLike = document.createElement("span");
  actionsDiv.appendChild(pendingLike);


  // === Botón "nuevo sentimiento" alineado a la derecha ===
  const newCommentBtn = document.createElement("button");
  newCommentBtn.type = "button";
  newCommentBtn.className = "action-btn new-comment-btn";
  newCommentBtn.title = "Nuevo sentimiento";
  newCommentBtn.innerHTML = `
    <span class="action-icon-circle">
      <span class="icon-new-comment">⟳</span>
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

    // Scroll de la página para que el último mensaje quede visible
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
  // Alerta temporal para depuración visual en el laboratorio del usuario
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

      // Inject Like/Dislike logic now that we have data
      const id = data.id;
      if (id) {
        const btnLike = document.createElement("button");
        btnLike.className = "action-btn";
        btnLike.innerHTML = '<span class="action-icon-circle">👍</span>';
        btnLike.onclick = () => fetch(`http://localhost:8000/api/sentiment/feedback/${id}?type=LIKE`, { method: "POST" }).then(() => alert("Gracias!"));

        const btnDislike = document.createElement("button");
        btnDislike.className = "action-btn";
        btnDislike.innerHTML = '<span class="action-icon-circle">👎</span>';
        btnDislike.onclick = () => fetch(`http://localhost:8000/api/sentiment/feedback/${id}?type=DISLIKE`, { method: "POST" }).then(() => alert("Gracias por el feedback"));

        // Find specific container or append to result actions??
        // Ideally we selected the actionsDiv reference from outer scope
        const actionsRowVar = document.querySelector(".result-actions-row:last-child .result-actions");
        // This selector is risky. Better to use the 'actionsDiv' variable from closure since this is all inside one function 'analyze'.
        // 'actionsDiv' is available here!
        actionsDiv.appendChild(btnLike);
        actionsDiv.appendChild(btnDislike);
      }
    })
    .catch((error) => {
      console.error("[SentimentalIA] error en fetch:", error);

      let mensajeUsuario = "ocurrió un error al comunicarse con el backend.";

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
      const fullName = val === "pt" ? "português" : "español";
      langSelect.title = fullName;
    };
    langSelect.addEventListener("change", updateLangTitle);
    updateLangTitle();
  }
}

/**
 * Maneja la navegación entre secciones (SPA simple)
 */
function setupNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".content-section, .conversation, .hero");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent hash change
      const targetId = link.getAttribute("data-target");

      // Actualizar links activos
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      // Ocultar todas las secciones principales
      sections.forEach(s => s.classList.add("hidden"));

      // Mostrar la sección destino
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.remove("hidden");

        // Si es inicio, mostrar también hero si no se ha enviado nada
        if (targetId === "inicio") {
          document.querySelector(".conversation").classList.remove("hidden");
          if (!hasFirstMessageSent) {
            document.querySelector(".hero").classList.remove("hidden");
          }
        }
      }

      // Cargar datos si es dashboard o estadísticas
      if (targetId === "dashboard") {
        fetchStats();
        setupDashboardEventHandlers();
      }
      if (targetId === "estadisticas") fetchHistory();
    });
  });
}

/**
 * Configura manejadores específicos del dashboard (filtros)
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
 * Obtiene y renderiza las estadísticas del backend
 */
async function fetchStats(start = null, end = null) {
  try {
    let url = "http://localhost:8000/api/sentiment/stats";
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

    // KPIs G68 Supreme
    document.getElementById("stat-crit").textContent = (data.criticidad || 0).toFixed(1) + "%";
    document.getElementById("stat-health").textContent = (data.salud || 0).toFixed(1);
    document.getElementById("stat-ambassadors").textContent = (data.embajadores || 0).toFixed(1) + "%";

    // Renderizar gráfico de dona
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
 * Renderiza gráfico circular tipo dona usando CSS Conic Gradient
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

  // Generar gradiente cónico para la dona
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
 * Obtiene y renderiza el historial de análisis
 */
/**
 * Obtiene y renderiza el historial de análisis (Paginado)
 */
async function fetchHistory(page = 0) {
  try {
    currentPage = page;
    // Ensure PAGE_SIZE is defined or use literal
    const size = 15;
    const response = await fetch(`http://localhost:8000/api/sentiment/history?page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Error al obtener historial");

    const data = await response.json();
    // Spring Page: { content: [], number: 0, totalPages: 1, first: true, last: true ... }

    const entries = data.content;
    const tableBody = document.getElementById("history-table-body");
    tableBody.innerHTML = "";

    entries.forEach(entry => {
      const date = new Date(entry.fecha).toLocaleString();

      // Determinar riesgo visual
      const riesgoInfo = entry.riesgo ? `<span title="${entry.riesgo}" style="color: #ef4444;">⚠️</span>` : "";

      tableBody.innerHTML += `
      <tr>
        <td>${date}</td>
        <td title="${entry.text}" style="max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${entry.text.substring(0, 60)}...
          <button class="action-btn copy-btn" data-text="${entry.text}" title="Copiar">⧉</button>
        </td>
        <td><span class="sentiment-badge ${entry.prevision.toLowerCase()}">${entry.prevision}</span></td>
        <td>${entry.etiqueta || "-"}</td>
        <td>${riesgoInfo}</td>
        <td>${(entry.probabilidad * 100).toFixed(1)}%</td>
        <td>
          ${entry.feedback === 'LIKE' ? '👍' : ''}
          ${entry.feedback === 'DISLIKE' ? '👎' : ''}
        </td>
      </tr>
    `;
    });

    // Update controllers
    const pageInfo = document.getElementById("page-info");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");

    if (pageInfo) pageInfo.textContent = `Página ${data.number + 1} de ${data.totalPages}`;
    if (btnPrev) btnPrev.disabled = data.first;
    if (btnNext) btnNext.disabled = data.last;

    // Bind copy buttons within table
    document.querySelectorAll(".copy-btn").forEach(b => {
      b.onclick = (e) => {
        const txt = e.target.getAttribute("data-text");
        navigator.clipboard.writeText(txt);
        alert("Texto copiado");
      };
    });

  } catch (error) {
    console.error("[Historial] Error:", error);
  }
}

// Setup Pagination Listeners
function setupPaginationListeners() {
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");

  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      if (currentPage > 0) fetchHistory(currentPage - 1);
    });
  }
  if (btnNext) {
    btnNext.addEventListener("click", () => {
      fetchHistory(currentPage + 1);
    });
  }
}

/**
 * Configura la funcionalidad de carga masiva por CSV
 */
function setupBatchProcessing() {
  const btn = document.getElementById("batchButton");
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
      const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        alert("El archivo CSV parece vacío o no tiene encabezados.");
        return;
      }

      // 1. Detect delimiter (comma or semicolon)
      const firstLine = lines[0];
      const semicolonCount = (firstLine.match(/;/g) || []).length;
      const commaCount = (firstLine.match(/,/g) || []).length;
      const separator = semicolonCount > commaCount ? ";" : ",";

      // 2. Parse Headers
      // Simple split for headers, stripping quotes
      const header = firstLine.split(separator).map(h => h.trim().replace(/^"|"$/g, ''));

      // 3. Find target column
      // Priorities: 'reseña', 'text', 'review', 'comentario', 'content'
      let colIndex = header.findIndex(h => /reseña|text|review|comentario|content/i.test(h));

      // Fallback: If no match, use the first column that looks long enough or just index 0
      if (colIndex === -1) colIndex = 0;

      console.log(`[Batch] Delimiter: '${separator}', Target Column Index: ${colIndex} (${header[colIndex]})`);

      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Procesando...`;

      // Redirigir al dashboard para ver el progreso real
      const dashLink = document.querySelector('a[data-target="dashboard"]');
      if (dashLink) dashLink.click();

      let processed = 0;
      // Regex for splitting while respecting quotes for the specific separator
      // Note: This regex is tricky for dynamic separators. We will use a simpler approach for stability:
      // If it's semicolon, we split by semicolon (assuming no semicolons in text or simple replacement).
      // For a Hackathon/Demo, simple split is often safer unless complex CSVs are used.

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];

        let text = "";

        if (separator === ";") {
          const parts = line.split(";");
          text = parts[colIndex] || "";
        } else {
          // Comma logic with quote handling
          const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          text = parts[colIndex] || "";
        }

        // Clean quotes
        text = text.replace(/^"|"$/g, '').trim();

        if (text.length >= 3) {
          try {
            await fetch(ACTIVE_API, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: text })
            });
            processed++;

            // Visual feedback every 1 row for "speed" feel in demo
            if (processed % 1 === 0) {
              btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> (${processed})...`;
              // Updating stats every row might be too heavy, maybe every 3
              if (processed % 3 === 0) fetchStats();
            }
          } catch (err) {
            console.error("Error en batch row:", err);
          }
        }
      }

      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-file-csv"></i> Procesar Lote CSV`;
      alert(`Se procesaron ${processed} reseñas exitosamente.`);
      fetchStats();
      input.value = "";
    };
    reader.readAsText(file);
  });
}

/**
 * Configura la grabación de voz (Web Speech API)
 */
function setupVoiceInput() {
  const micBtn = document.getElementById("micButton");
  const textarea = document.getElementById("textInput");

  if (!micBtn || !textarea) return;

  // Verificar soporte
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    micBtn.style.display = "none";
    console.warn("Web Speech API no soportada en este navegador.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "es-ES";
  recognition.interimResults = false;
  recognition.continuous = false; // Ensure it stops after one sentence
  recognition.maxAlternatives = 1;

  let isRecording = false;

  micBtn.addEventListener("click", () => {
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });

  recognition.onstart = () => {
    isRecording = true;
    micBtn.classList.add("recording");
    micBtn.innerHTML = "🔴";
  };

  recognition.onend = () => {
    isRecording = false;
    micBtn.classList.remove("recording");
    micBtn.innerHTML = "🎤";
  };

  recognition.onresult = (event) => {
    // Prevent duplication by checking isFinal if available, though interim=false should handle it.
    // Some browsers might be tricky, so we rely on the first absolute result.
    const result = event.results[0];
    if (result.isFinal) {
      const transcript = result[0].transcript;
      const current = textarea.value ? textarea.value + " " : "";
      textarea.value = current + transcript;
      autoResize(textarea);
      updateInputIcons();
    }
  };

  recognition.onerror = (event) => {
    console.error("Error SpeechRecognition:", event.error);
    isRecording = false;
    micBtn.classList.remove("recording");
    micBtn.innerHTML = "🎤";
  };
}

// Inicializar cuando el DOM está listo
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setupInputInteractions();
  setupApiSelector();
  setupNavigation();
  setupBatchProcessing();
  setupVoiceInput();
  setupPaginationListeners();
  setupPaginationListeners();

  // Limpieza por si hubiera algún input secundario viejo
  const legacySecondary = document.querySelector(
    ".secondary-input, #secondaryInputWrapper, #secondTextInput"
  );
  if (legacySecondary) {
    legacySecondary.style.display = "none";
  }
});