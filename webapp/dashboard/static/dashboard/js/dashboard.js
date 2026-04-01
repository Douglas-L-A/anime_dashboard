/* ============================================================
   AniVision — Dashboard JavaScript
   Handles: Filters, API calls, Rendering, State
   ============================================================ */

"use strict";

// ── STATE ────────────────────────────────────────────────────
let currentPage  = 1;
let isLoading    = false;

// Genre list (popular, can be extended)
const GENRES = [
  "Action", "Adventure", "Avant Garde", "Award Winning",
  "Boys Love", "Comedy", "Drama", "Ecchi", "Erotica",
  "Fantasy", "Girls Love", "Gourmet", "Harem",
  "Horror", "Mystery", "Romance", "Sci-Fi",
  "Slice of Life", "Sports", "Supernatural", "Suspense",
];

const GENRE_COLORS = [
  "genre-tag-purple", "genre-tag-pink", "genre-tag-cyan", "genre-tag-orange"
];

const selectedGenres = new Set();

// ── DOM REFS ─────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

const els = {
  stateMsg:       $("state-message"),
  stateText:      $("state-text"),
  animeCard:      $("anime-card"),
  emptyState:     $("empty-state"),
  animeImage:     $("anime-image"),
  animeTitle:     $("anime-title"),
  animeTitleEn:   $("anime-title-en"),
  animeGenresRow: $("anime-genres-row"),
  animeMetaRow:   $("anime-meta-row"),
  metaType:       $("meta-type"),
  metaYear:       $("meta-year"),
  metaSeason:     $("meta-season"),
  metaEpisodes:   $("meta-episodes"),
  metaStatus:     $("meta-status"),
  animeSynopsis:  $("anime-synopsis"),
  themesRow:      $("themes-row"),
  totalAnimes:    $("total-animes"),
  avgScore:       $("avg-score"),
  yearRange:      $("year-range"),
  pageInfoMetric: $("page-info-metric"),
  pageInfo:       $("page-info"),
  prevBtn:        $("prev-btn"),
  nextBtn:        $("next-btn"),
  applyBtn:       $("applyFilters"),
  resetBtn:       $("resetFilters"),
  scoreBadge:     $("badge-score-val"),
  rankBadge:      $("badge-rank-val"),
  statusText:     $("status-text"),
  statusPill:     $("status-pill"),
  // Slider
  scoreSlider:    $("scoreSlider"),
  scoreValBadge:  $("scoreValBadge"),
  // Hidden inputs
  genreFilter:    $("genreFilter"),
  typeFilter:     $("typeFilter"),
  seasonFilter:   $("seasonFilter"),
  scoreMin:       $("scoreMin"),
  orderDir:       $("orderDir"),
  // Sidebar
  sidebarToggle:  $("sidebarToggle"),
  sidebar:        document.querySelector(".sidebar"),
  // Tag inputs
  genreSearch:    $("genreSearch"),
  genreTagList:   $("genreTagList"),
};

// ── GENRE TAG SELECTOR ───────────────────────────────────────
function buildGenreTags(filter = "") {
  const list = els.genreTagList;
  list.innerHTML = "";
  const filtered = GENRES.filter(g =>
    g.toLowerCase().includes(filter.toLowerCase())
  );
  filtered.forEach(genre => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tag-btn" + (selectedGenres.has(genre) ? " active" : "");
    btn.textContent = genre;
    btn.setAttribute("data-genre", genre);
    btn.addEventListener("click", () => toggleGenre(genre, btn));
    list.appendChild(btn);
  });
}

function toggleGenre(genre, btn) {
  if (selectedGenres.has(genre)) {
    selectedGenres.delete(genre);
    btn.classList.remove("active");
  } else {
    selectedGenres.add(genre);
    btn.classList.add("active");
  }
  els.genreFilter.value = [...selectedGenres].join(",");
}

els.genreSearch.addEventListener("input", (e) => {
  buildGenreTags(e.target.value);
});

// ── CHIP GROUPS ──────────────────────────────────────────────
function initChipGroup(groupId, hiddenId) {
  const group = $(groupId);
  const hidden = $(hiddenId);
  group.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      group.querySelectorAll(".chip").forEach(c => c.classList.remove("chip-active"));
      chip.classList.add("chip-active");
      hidden.value = chip.dataset.value;
    });
  });
}

// Order direction chips
function initOrderDirChips() {
  const group = $("orderDirChips");
  group.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      group.querySelectorAll(".chip").forEach(c => c.classList.remove("chip-active"));
      chip.classList.add("chip-active");
      els.orderDir.value = chip.dataset.value;
    });
  });
}

// ── SCORE SLIDER ─────────────────────────────────────────────
function updateSlider() {
  const val = parseFloat(els.scoreSlider.value);
  const pct = (val / 10) * 100;
  els.scoreSlider.style.setProperty("--fill", pct + "%");
  els.scoreValBadge.textContent = val === 0 ? "Qualquer" : val.toFixed(1) + "+";
  els.scoreMin.value = val > 0 ? val : "";
}

els.scoreSlider.addEventListener("input", updateSlider);

// ── SIDEBAR TOGGLE ───────────────────────────────────────────
els.sidebarToggle.addEventListener("click", () => {
  els.sidebar.classList.toggle("collapsed");
});

// ── BUILD QUERY ──────────────────────────────────────────────
function buildQuery(page) {
  const params = new URLSearchParams();

  const genres = [...selectedGenres];
  if (genres.length > 0) params.append("genres", genres.join(","));

  const type = els.typeFilter.value;
  if (type) params.append("types", type);

  const season = els.seasonFilter.value;
  if (season) params.append("season", season);

  const yearMin = $("yearMin").value;
  if (yearMin) params.append("year_min", yearMin);

  const yearMax = $("yearMax").value;
  if (yearMax) params.append("year_max", yearMax);

  const scoreMin = els.scoreMin.value;
  if (scoreMin && parseFloat(scoreMin) > 0) params.append("score_min", scoreMin);

  const orderBy = $("orderBy").value;
  params.append("order_by", orderBy);

  const orderDir = els.orderDir.value;
  params.append("order_dir", orderDir);

  params.append("page", page);
  return params.toString();
}

// ── STATE UI ─────────────────────────────────────────────────
function showLoading() {
  isLoading = true;
  els.stateMsg.innerHTML = `
    <div class="loader-ring"></div>
    <span>Carregando…</span>
  `;
  els.stateMsg.classList.remove("hidden");
  els.animeCard.classList.add("hidden");
  els.emptyState.classList.add("hidden");

  setStatus("Carregando…", "loading");
}

function hideLoading() {
  isLoading = false;
  els.stateMsg.classList.add("hidden");
}

function setStatus(text, type = "ok") {
  els.statusText.textContent = text;
  const dot = els.statusPill.querySelector(".status-dot");
  if (type === "loading") {
    dot.style.background = "#fbbf24";
    els.statusPill.style.borderColor = "rgba(251,191,36,0.3)";
    els.statusPill.style.background  = "rgba(251,191,36,0.07)";
    els.statusPill.style.color       = "#fbbf24";
  } else if (type === "error") {
    dot.style.background = "#f87171";
    els.statusPill.style.borderColor = "rgba(248,113,113,0.3)";
    els.statusPill.style.background  = "rgba(248,113,113,0.07)";
    els.statusPill.style.color       = "#f87171";
  } else {
    dot.style.background = "#4ade80";
    els.statusPill.style.borderColor = "rgba(74,222,128,0.2)";
    els.statusPill.style.background  = "rgba(74,222,128,0.08)";
    els.statusPill.style.color       = "#4ade80";
  }
}

// ── GENRE TAG COLORS ─────────────────────────────────────────
function genreColor(i) {
  return GENRE_COLORS[i % GENRE_COLORS.length];
}

// ── RENDER ANIME ─────────────────────────────────────────────
function renderAnime(anime) {
  if (!anime) {
    els.animeCard.classList.add("hidden");
    els.emptyState.classList.remove("hidden");
    return;
  }

  els.emptyState.classList.add("hidden");

  // Poster
  els.animeImage.src = anime.image || "";
  els.animeImage.alt = anime.title || "Anime cover";

  // Score badge
  els.scoreBadge.textContent = anime.score != null
    ? parseFloat(anime.score).toFixed(2)
    : "N/A";

  // Rank badge
  els.rankBadge.innerHTML =
    `<span class="rank-label">#</span>${anime.rank ?? "—"}`;

  // Title
  els.animeTitle.textContent  = anime.title || "—";
  els.animeTitleEn.textContent = anime.title_english && anime.title_english !== anime.title
    ? anime.title_english
    : "";

  // Genres
  const genres = Array.isArray(anime.genres)
    ? anime.genres
    : (typeof anime.genres === "string" ? anime.genres.split(",").map(g => g.trim()) : []);

  els.animeGenresRow.innerHTML = genres
    .filter(Boolean)
    .slice(0, 5)
    .map((g, i) => `<span class="genre-tag ${genreColor(i)}">${g}</span>`)
    .join("");

  // Meta chips
  els.metaType.textContent     = anime.type || "";
  els.metaYear.textContent     = anime.year ? `📅 ${anime.year}` : "";
  els.metaSeason.textContent   = anime.season ? seasonEmoji(anime.season) + " " + capitalize(anime.season) : "";
  els.metaEpisodes.textContent = anime.episodes ? `${anime.episodes} ep.` : "";
  els.metaStatus.textContent   = anime.status || "";

  // Synopsis
  els.animeSynopsis.textContent = anime.synopsis || "Sinopse não disponível.";

  // Themes
  const themes = Array.isArray(anime.themes)
    ? anime.themes
    : (typeof anime.themes === "string" ? anime.themes.split(",").map(t => t.trim()) : []);

  els.themesRow.innerHTML = themes
    .filter(Boolean)
    .slice(0, 8)
    .map(t => `<span class="theme-chip">${t}</span>`)
    .join("");

  // Show card with animation
  els.animeCard.classList.remove("hidden");
  els.animeCard.style.animation = "none";
  void els.animeCard.offsetHeight; // reflow
  els.animeCard.style.animation = "";
}

function seasonEmoji(season) {
  const map = { winter: "❄️", spring: "🌸", summer: "☀️", fall: "🍂" };
  return map[season?.toLowerCase()] || "";
}

function capitalize(str) {
  return str ? str[0].toUpperCase() + str.slice(1).toLowerCase() : "";
}

// ── RENDER METRICS ───────────────────────────────────────────
function renderMetrics(metrics, pagination) {
  animateNumber(els.totalAnimes, metrics.total_animes ?? 0);

  const score = metrics.avg_score;
  els.avgScore.textContent = score != null
    ? parseFloat(score).toFixed(2)
    : "N/A";

  const yr = (metrics.min_year && metrics.max_year)
    ? `${metrics.min_year} – ${metrics.max_year}`
    : "—";
  els.yearRange.textContent = yr;

  const pageStr = `${pagination.page} / ${pagination.total}`;
  els.pageInfo.textContent        = pageStr;
  els.pageInfoMetric.textContent  = pageStr;

  els.prevBtn.disabled = !pagination.has_prev;
  els.nextBtn.disabled = !pagination.has_next;
}

// ── ANIMATED NUMBER ──────────────────────────────────────────
function animateNumber(el, target) {
  const start    = parseInt(el.textContent) || 0;
  const duration = 600;
  const step     = (timestamp) => {
    if (!step.startTime) step.startTime = timestamp;
    const progress = Math.min((timestamp - step.startTime) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * eased).toLocaleString("pt-BR");
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ── LOAD DATA ────────────────────────────────────────────────
async function loadData(page = 1) {
  if (isLoading) return;
  showLoading();

  try {
    const qs  = buildQuery(page);
    const res = await fetch(`/api/animes/?${qs}`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error);
    }

    renderMetrics(data.metrics, data.pagination);
    renderAnime(data.anime);

    currentPage = page;
    setStatus("Conectado");

  } catch (err) {
    console.error("[AniVision] Erro:", err);
    els.stateMsg.innerHTML = `
      <div style="font-size:2.5rem">⚠️</div>
      <span style="color:#f87171">Erro ao carregar dados: ${err.message}</span>
    `;
    els.stateMsg.classList.remove("hidden");
    els.animeCard.classList.add("hidden");
    setStatus("Erro", "error");
  } finally {
    hideLoading();
    isLoading = false;
  }
}

// ── RESET FILTERS ────────────────────────────────────────────
function resetFilters() {
  // Clear genres
  selectedGenres.clear();
  els.genreFilter.value = "";
  buildGenreTags();

  // Reset chip groups
  document.querySelectorAll(".chip-group").forEach(group => {
    const chips = group.querySelectorAll(".chip");
    chips.forEach(c => c.classList.remove("chip-active"));
    if (chips[0]) chips[0].classList.add("chip-active");
  });
  els.typeFilter.value   = "";
  els.seasonFilter.value = "";
  els.orderDir.value     = "asc";

  // Reset inputs
  $("yearMin").value  = "";
  $("yearMax").value  = "";
  $("orderBy").value  = "rank";

  // Reset slider
  els.scoreSlider.value = 0;
  els.scoreMin.value    = "";
  updateSlider();

  // Reload
  currentPage = 1;
  loadData(1);
}

// ── EVENTS ───────────────────────────────────────────────────
els.prevBtn.addEventListener("click", () => {
  if (currentPage > 1) loadData(currentPage - 1);
});

els.nextBtn.addEventListener("click", () => {
  loadData(currentPage + 1);
});

els.applyBtn.addEventListener("click", () => {
  currentPage = 1;
  loadData(1);
});

els.resetBtn.addEventListener("click", resetFilters);

// Keyboard shortcut: Enter on inputs
document.querySelectorAll(".range-input, .score-slider").forEach(el => {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      currentPage = 1;
      loadData(1);
    }
  });
});

// ── INIT ─────────────────────────────────────────────────────
function init() {
  buildGenreTags();
  initChipGroup("typeChips", "typeFilter");
  initChipGroup("seasonChips", "seasonFilter");
  initOrderDirChips();
  updateSlider();
  loadData(1);
}

init();
