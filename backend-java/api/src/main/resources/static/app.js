// =====================
// Configuración de Conexiones
// =====================

// Aquí definimos a dónde tiene que llamar la página web
const API_ENDPOINTS = {
  DEV_BACKEND: "/sentiment",
  MODEL_LINEAR: "http://159.112.150.158:8080/predict",
  MODEL_BILSTM: "http://149.130.183.97:8080/predict"
};

// Por defecto usamos el backend de desarrollo
let ACTIVE_API = API_ENDPOINTS.DEV_BACKEND;

let hasFirstMessageSent = false;

// Variables globales para instancias de Chart.js
let posGlobalChartInstance = null;
let negGlobalChartInstance = null;
let critGlobalChartInstance = null;
let posAuditChartInstance = null;
let negAuditChartInstance = null;
let criticalChartInstance = null;
let boxPlotChartInstance = null;
let confidenceChartInstance = null;
let featuresChartInstance = null;
let currentHistoryPage = 0;

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

  // Botón me gusta (corazón ♥)
  const likeBtn = document.createElement("button");
  likeBtn.type = "button";
  likeBtn.className = "action-btn";
  likeBtn.innerHTML = `
    <span class="action-icon-circle">
      <span class="icon-heart-like">♥</span>
    </span>
  `;
  likeBtn.addEventListener("click", () => {
    alert("feedback positivo registrado (en desarrollo).");
  });

  // Botón no me gusta (corazón ♥ rayado con CSS)
  const dislikeBtn = document.createElement("button");
  dislikeBtn.type = "button";
  dislikeBtn.className = "action-btn";
  dislikeBtn.innerHTML = `
    <span class="action-icon-circle">
      <span class="icon-heart-dislike">♥</span>
    </span>
  `;
  dislikeBtn.addEventListener("click", () => {
    alert("feedback negativo registrado (en desarrollo).");
  });

  actionsDiv.appendChild(moreBtn);
  actionsDiv.appendChild(shareBtn);
  actionsDiv.appendChild(likeBtn);
  actionsDiv.appendChild(dislikeBtn);

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
      const targetId = link.getAttribute("href").substring(1);

      // No prevenir default para que el hash cambie, pero manejar visibilidad
      // e.preventDefault(); 

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
      }
      if (targetId === "estadisticas") {
        currentHistoryPage = 0;
        fetchHistory(0);
        fetchStats(); // Cargar estadísticas globales para los gráficos
      }
      if (targetId === "distribucion") {
        fetchStats();
      }
    });
  });
}


/**
 * Obtiene y renderiza las estadísticas del backend
 */
async function fetchStats() {
  try {
    let url = "/api/stats";

    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al obtener stats");
    const data = await response.json();

    // Actualizar contadores
    document.getElementById("stat-total").textContent = data.totalAnalisis;
    document.getElementById("stat-pos").textContent = data.conteoPorSentimiento["Positivo"] || 0;
    document.getElementById("stat-neu").textContent = data.conteoPorSentimiento["Neutral"] || 0;
    document.getElementById("stat-neg").textContent = data.conteoPorSentimiento["Negativo"] || 0;

    // Renderizar gráfico de dona
    renderDonutChart(data.conteoPorSentimiento, data.totalAnalisis);

    // Renderizar Histogramas Globales (Confidence Bins)
    const histData = data.confidenceBinsBySentiment || data.confidenceBins;
    if (histData) {
      renderConfidenceHistogram(histData);
    }

    // Renderizar Mapas de Frases y Casos Críticos (Lógica Local desde /api/history o similar)
    // En este enfoque, usaremos lo que ya hay en Estadísticas

    // Renderizar Histogramas Globales (Confidence Bins)
    if (data.confidenceBins) {
      renderConfidenceHistogram(data.confidenceBins);
    }

    // Renderizar Mapa de Features Global (Keywords Genéricas)
    if (data.topPalabrasClave) {
      renderFeaturesMap(data.topPalabrasClave);
    }

    // Renderizar Top 10 Features GLOBALES (Dashboard)
    if (data.topPositiveFeatures) {
      const formattedPos = data.topPositiveFeatures.map(f => [f.phrase, f.count]);
      renderNgramsChart('posGlobalChart', formattedPos, '#3b82f6', 'Frases Positivas (Global)', 'pos_global');
    }
    if (data.topNegativeFeatures) {
      const formattedNeg = data.topNegativeFeatures.map(f => [f.phrase, f.count]);
      renderNgramsChart('negGlobalChart', formattedNeg, '#f97316', 'Frases Negativas (Global)', 'neg_global');
    }
    if (data.topGlobalCriticalFeatures) {
      const formattedCrit = data.topGlobalCriticalFeatures.map(f => [f.phrase, f.count]);
      renderNgramsChart('critGlobalChart', formattedCrit, '#ef4444', 'Impacto Crítico (Frecuencia)', 'crit_global');
    }

    // Renderizar BoxPlot de Probabilidades
    if (data.positiveBoxPlot && data.negativeBoxPlot) {
      renderBoxPlot(data.positiveBoxPlot, data.negativeBoxPlot);
    }

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
async function fetchHistory(page = 0) {
  try {
    const response = await fetch(`/api/history?page=${page}`);
    if (!response.ok) throw new Error("Error al obtener historial");
    const entries = await response.json();

    // Actualizar controles de UI
    currentHistoryPage = page;
    const label = document.getElementById("currentPageLabel");
    if (label) label.textContent = `Página ${page + 1}`;

    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");
    if (prevBtn) prevBtn.disabled = (page === 0);
    // Para simplificar, deshabilitamos next si vienen menos de 5
    if (nextBtn) nextBtn.disabled = (entries.length < 20);

    const tableBody = document.getElementById("history-table-body");
    tableBody.innerHTML = "";

    entries.forEach(entry => {
      const date = new Date(entry.fecha).toLocaleDateString(); // Removido .toLocaleString()
      tableBody.innerHTML += `
        <tr>
          <td>${date}</td>
          <td title="${entry.text}">${entry.text.substring(0, 50)}${entry.text.length > 50 ? "..." : ""}</td>
          <td><span class="sentiment-badge ${entry.prevision.toLowerCase()}">${entry.prevision}</span></td>
          <td>${(entry.probabilidad * 100).toFixed(1)}%</td>
        </tr>
      `;
    });

    // Procesar visualizaciones avanzadas (N-grams y Alertas)
    processAdvancedVisuals(entries);

  } catch (error) {
    console.error("[Historial] Error:", error);
  }
}


/**
 * Procesa los datos del historial para generar las nuevas visualizaciones (N-grams y Alertas)
 */
function processAdvancedVisuals(entries) {
  if (!entries || entries.length === 0) return;

  // 1. Ranking de Casos Críticos (Top 5 Negativos por Confianza) - LOCAL
  const criticalCases = entries
    .filter(e => e.prevision.toLowerCase() === "negativo")
    .sort((a, b) => b.probabilidad - a.probabilidad)
    .slice(0, 5);

  renderCriticalCasesChart(criticalCases);

  // 2. Extración de N-grams local (Audit) - LOCAL TOP 5
  const posNgramCounts = {};
  const negNgramCounts = {};

  entries.forEach(entry => {
    const rawFeatures = entry.topFeatures || entry.top_features || "";
    if (rawFeatures && rawFeatures !== "N/A" && rawFeatures !== "null") {
      const list = rawFeatures.split(/[|]+/).map(s => s.trim().toLowerCase());
      list.forEach(feat => {
        if (feat.length >= 3) {
          const sentiment = entry.prevision.toLowerCase();
          if (sentiment === "positivo") {
            posNgramCounts[feat] = (posNgramCounts[feat] || 0) + 1;
          } else if (sentiment === "negativo") {
            negNgramCounts[feat] = (negNgramCounts[feat] || 0) + 1;
          }
        }
      });
    }
  });

  const topPos = Object.entries(posNgramCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topNeg = Object.entries(negNgramCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  renderNgramsChart('posAuditChart', topPos, '#3b82f6', 'Frases Positivas (Audit)', 'pos_audit');
  renderNgramsChart('negAuditChart', topNeg, '#f97316', 'Frases Negativas (Audit)', 'neg_audit');
}

/**
 * Renderiza gráficos de barras horizontales para N-grams
 */
function renderNgramsChart(canvasId, data, color, label, type) {
  const ctx = document.getElementById(canvasId);
  if (!ctx || !data) return;

  if (type === 'pos_global' && posGlobalChartInstance) posGlobalChartInstance.destroy();
  if (type === 'neg_global' && negGlobalChartInstance) negGlobalChartInstance.destroy();
  if (type === 'crit_global' && critGlobalChartInstance) critGlobalChartInstance.destroy();
  if (type === 'pos_audit' && posAuditChartInstance) posAuditChartInstance.destroy();
  if (type === 'neg_audit' && negAuditChartInstance) negAuditChartInstance.destroy();

  const labels = data.map(d => d[0]);
  const values = data.map(d => d[1]);

  const isLight = document.body.classList.contains('theme-light');
  const textColor = isLight ? '#475569' : '#94a3b8';

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: values,
        backgroundColor: color,
        borderRadius: 4,
        barThickness: 4,
        maxBarThickness: 6,
        categoryPercentage: 0.8,
        barPercentage: 0.9
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        x: { beginAtZero: true, grid: { display: false }, ticks: { color: textColor, precision: 0 } },
        y: { ticks: { color: textColor, font: { size: 9 } }, grid: { display: false } }
      },
      animation: {
        onComplete: function () {
          const chartInstance = this;
          const ctx = chartInstance.ctx;
          ctx.font = Chart.helpers.fontString(9, 'normal', 'Inter');
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = textColor;

          chartInstance.data.datasets.forEach(function (dataset, i) {
            const meta = chartInstance.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              const data = dataset.data[index];
              ctx.fillText(data, bar.x + 5, bar.y);
            });
          });
        }
      }
    }
  });

  if (type === 'pos_global') posGlobalChartInstance = chart;
  if (type === 'neg_global') negGlobalChartInstance = chart;
  if (type === 'crit_global') critGlobalChartInstance = chart;
  if (type === 'pos_audit') posAuditChartInstance = chart;
  if (type === 'neg_audit') negAuditChartInstance = chart;
}

/**
 * Renderiza el gráfico de Alertas Críticas (Top Negativos)
 */
function renderCriticalCasesChart(cases) {
  const ctx = document.getElementById('criticalCasesChart');
  if (!ctx) return;

  if (criticalChartInstance) criticalChartInstance.destroy();

  const labels = cases.map(c => c.text.substring(0, 35) + "...");
  const values = cases.map(c => c.probabilidad * 100);

  const isLight = document.body.classList.contains('theme-light');
  const textColor = isLight ? '#475569' : '#94a3b8';

  criticalChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Confianza (%)',
        data: values,
        backgroundColor: 'rgba(244, 63, 94, 0.7)',
        borderColor: '#f43f5e',
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 4,
        maxBarThickness: 6,
        categoryPercentage: 0.8,
        barPercentage: 0.9
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: (ctx) => `Gravedad: ${ctx.raw.toFixed(1)}%` }
        }
      },
      scales: {
        x: { min: 0, max: 100, ticks: { color: textColor, callback: value => value + '%' } },
        y: { ticks: { color: textColor, font: { size: 9 } }, grid: { display: false } }
      },
      animation: {
        onComplete: function () {
          const chartInstance = this;
          const ctx = chartInstance.ctx;
          ctx.font = Chart.helpers.fontString(9, 'normal', 'Inter');
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = textColor;

          chartInstance.data.datasets.forEach(function (dataset, i) {
            const meta = chartInstance.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              const val = Math.round(dataset.data[index]) + '%';
              ctx.fillText(val, bar.x + 5, bar.y);
            });
          });
        }
      }
    }
  });
}

/**
 * Renderiza un gráfico BoxPlot simulado (Floating Bars)
 */
function renderBoxPlot(posStats, negStats) {
  const ctx = document.getElementById('probabilityBoxPlot');
  if (!ctx || !posStats || !negStats) return;

  if (boxPlotChartInstance) boxPlotChartInstance.destroy();

  const isLight = document.body.classList.contains('theme-light');
  const textColor = isLight ? '#475569' : '#94a3b8';
  const gridColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

  const labels = ['Positivo', 'Negativo'];

  // Datos para los 3 componentes del boxplot
  // 1. Rango (Bigotes) -> Barra muy fina
  const rangeData = [
    [posStats.min, posStats.max],
    [negStats.min, negStats.max]
  ];

  // 2. Caja (Intercuartil) -> Barra normal
  const boxData = [
    [posStats.q1, posStats.q3],
    [negStats.q1, negStats.q3]
  ];

  // 3. Mediana -> Barra muy fina simulando linea
  const medianData = [
    [posStats.median - 0.003, posStats.median + 0.003],
    [negStats.median - 0.003, negStats.median + 0.003]
  ];

  boxPlotChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Rango (Min - Max)',
          data: rangeData,
          backgroundColor: isLight ? 'rgba(75, 85, 99, 0.5)' : 'rgba(148, 163, 184, 0.5)',
          barThickness: 2, // Whisker line
          grouped: false,
          order: 3
        },
        {
          label: 'Caja (Q1 - Q3)',
          data: boxData,
          backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(249, 115, 22, 0.7)'],
          borderColor: ['#3b82f6', '#f97316'],
          borderWidth: 1,
          barThickness: 50,
          grouped: false,
          order: 2
        },
        {
          label: 'Mediana',
          data: medianData,
          backgroundColor: isLight ? '#ffffff' : '#000000',
          barThickness: 50, // Match box width
          grouped: false,
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor },
          display: false // Auto-legend might be confusing with mapped colors
        },
        title: {
          display: false,
          text: 'Distribución de Probabilidades',
          color: textColor
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const raw = context.raw;
              if (!Array.isArray(raw)) return '';
              const diff = raw[1] - raw[0];
              const val1 = (raw[0] * 100).toFixed(1);
              const val2 = (raw[1] * 100).toFixed(1);

              if (diff < 0.01) return `Mediana: ${(context.raw[0] * 100).toFixed(1)}%`;
              if (context.dataset.order === 3) return `Rango: ${val1}% - ${val2}%`;
              return `Q1 - Q3: ${val1}% - ${val2}%`;
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 1.05,
          ticks: { color: textColor, callback: (v) => (v * 100).toFixed(0) + '%' },
          grid: { color: gridColor },
          title: { display: true, text: 'Probabilidad asignada por el modelo', color: textColor }
        },
        x: {
          ticks: { color: textColor, font: { weight: 'bold' } },
          grid: { display: false }
        }
      }
    }
  });
}

/**
 * Renderiza el Histograma de Confianza usando Chart.js
 */
function renderConfidenceHistogram(bins) {
  const ctx = document.getElementById('confidenceHistogram');
  if (!ctx) return;

  if (confidenceChartInstance) {
    confidenceChartInstance.destroy();
  }

  const labels = ['0-10%', '11-20%', '21-30%', '31-40%', '41-50%', '51-60%', '61-70%', '71-80%', '81-90%', '91-100%'];

  const isLight = document.body.classList.contains('theme-light');
  const textColor = isLight ? '#4b5563' : '#94a3b8';
  const gridColor = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)';

  confidenceChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Frecuencia',
        data: bins,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'nearest',
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.9)',
          titleColor: isLight ? '#111827' : '#fff',
          bodyColor: isLight ? '#475569' : '#cbd5e1',
          borderColor: isLight ? '#e2e8f0' : 'transparent',
          borderWidth: 1,
          padding: 10,
          displayColors: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: { color: textColor }
        },
        x: {
          grid: { display: false },
          ticks: {
            color: textColor,
            maxRotation: 45,
            minRotation: 45,
            font: { size: 10 }
          }
        }
      }
    }
  });
}

/**
 * Renderiza el Mapa de Features (Bar Chart Horizontal Grouped) usando Chart.js
 */
function renderFeaturesMap(keywords) {
  const ctx = document.getElementById('featuresChart');
  if (!ctx) return;

  if (featuresChartInstance) {
    featuresChartInstance.destroy();
  }

  const labels = keywords.map(kw => kw.word);
  const posData = keywords.map(kw => kw.positive);
  const negData = keywords.map(kw => kw.negative);
  const neuData = keywords.map(kw => kw.neutral);

  const isLight = document.body.classList.contains('theme-light');
  const textColor = isLight ? '#4b5563' : '#94a3b8';
  const gridColor = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)';

  featuresChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Positivo',
          data: posData,
          backgroundColor: '#3b82f6',
          borderRadius: 4
        },
        {
          label: 'Negativo',
          data: negData,
          backgroundColor: '#f97316',
          borderRadius: 4
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
        axis: 'y'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: textColor, font: { size: 10 }, boxWidth: 12 }
        },
        tooltip: {
          backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.9)',
          titleColor: isLight ? '#111827' : '#fff',
          bodyColor: isLight ? '#475569' : '#cbd5e1',
          borderColor: isLight ? '#e2e8f0' : 'transparent',
          borderWidth: 1,
          padding: 10,
          displayColors: true
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: { color: textColor, font: { size: 10 } }
        },
        y: {
          grid: { display: false },
          ticks: { color: textColor, font: { size: 10 } }
        }
      }
    }
  });
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
      // Buscar columna "Reseña" o similar
      let colIndex = header.findIndex(h => /reseña|text|review/i.test(h.trim().replace(/"/g, "")));
      if (colIndex === -1) colIndex = header.length - 1; // Fallback a la última columna

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
      alert(`Se procesaron ${processed} reseñas exitosamente.`);
      fetchStats();
      input.value = "";
    };
    reader.readAsText(file);
  });
}

function setupPagination() {
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentHistoryPage > 0) {
        fetchHistory(currentHistoryPage - 1);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      fetchHistory(currentHistoryPage + 1);
    });
  }
}

// Inicializar cuando el DOM está listo
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setupInputInteractions();
  setupApiSelector();
  setupNavigation();
  setupBatchProcessing();
  setupPagination();

  // Limpieza por si hubiera algún input secundario viejo
  const legacySecondary = document.querySelector(
    ".secondary-input, #secondaryInputWrapper, #secondTextInput"
  );
  if (legacySecondary) {
    legacySecondary.style.display = "none";
  }
});