let currentPage = 1;

const stateMessage = document.getElementById("state-message");

function showState(msg) {
    stateMessage.innerText = msg;
    stateMessage.classList.remove("hidden");
}

function clearState() {
    stateMessage.classList.add("hidden");
}

function buildQuery(page) {
    const params = new URLSearchParams();

    const genres = [...document.getElementById("genreFilter").selectedOptions]
        .map(o => o.value);
    if (genres.length > 0) {
        params.append("genres", genres.join(","));
    }

    const type = document.getElementById("typeFilter").value;
    if (type) params.append("types", type);

    const season = document.getElementById("seasonFilter").value;
    if (season) params.append("season", season);

    const yearMin = document.getElementById("yearMin").value;
    if (yearMin) params.append("year_min", yearMin);

    const yearMax = document.getElementById("yearMax").value;
    if (yearMax) params.append("year_max", yearMax);

    const scoreMin = document.getElementById("scoreMin").value;
    if (scoreMin) params.append("score_min", scoreMin);

    params.append("page", page);

    return params.toString();
}

async function loadData(page = 1) {
    showState("Loading...");

    try {
        const response = await fetch(`/api/animes/?${buildQuery(page)}`);
        const data = await response.json();

        // Métricas
        document.getElementById("total-animes").innerText = data.metrics.total_animes;
        document.getElementById("avg-score").innerText =
            data.metrics.avg_score ?? "-";
        document.getElementById("year-range").innerText =
            `${data.metrics.min_year} - ${data.metrics.max_year}`;

        // Paginação
        document.getElementById("page-info").innerText =
            `Página ${data.pagination.page} / ${data.pagination.total}`;

        document.getElementById("prev-btn").disabled = !data.pagination.has_prev;
        document.getElementById("next-btn").disabled = !data.pagination.has_next;

        // Anime
        if (!data.anime) {
            document.getElementById("anime-card").innerHTML =
                "<p>Nenhum anime encontrado.</p>";
            clearState();
            return;
        }

        document.getElementById("anime-image").src = data.anime.image;
        document.getElementById("anime-title").innerText = data.anime.title;
        document.getElementById("anime-score").innerText =
            `Score: ${data.anime.score ?? "N/A"}`;

        document.getElementById("anime-meta").innerText =
            `${data.anime.type ?? ""} | ${data.anime.year ?? ""} | ${data.anime.season ?? ""}`;

        document.getElementById("anime-synopsis").innerText =
            data.anime.synopsis || "No synopsis available.";

        clearState();
        currentPage = page;

    } catch (err) {
        showState("Erro ao carregar dados.");
    }
}

// Eventos
document.getElementById("prev-btn").onclick = () => {
    if (currentPage > 1) loadData(currentPage - 1);
};

document.getElementById("next-btn").onclick = () => {
    loadData(currentPage + 1);
};

document.getElementById("applyFilters").onclick = () => {
    currentPage = 1;
    loadData(1);
};

// Inicial
loadData();
