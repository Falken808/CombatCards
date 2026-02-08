const CARD_FILES = [
    "barco_azul.png",
    "espada_roja.png",
    "espiral_azul.png",
    "interrogacion.png",
    "luna_purpura.png",
    "martillo.png",
    "mascara_verde.png",
    "reverso_purp.png",
    "skull_purpura.png",
    "skull_putref.png",
    "skull_verde.png",
    "toro_rojo.png"
];

const ASSET_BASE = "../Game/assets/cards/";
const STORAGE_KEY = "combat_cards_reviews_v2";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function buildGallery(list) {
    const grid = $("#gallery-grid");
    grid.innerHTML = "";
    list.forEach((file) => {
        const item = document.createElement("div");
        item.className = "card-item";

        const frame = document.createElement("div");
        frame.className = "card-frame";
        const img = document.createElement("img");
        img.src = `${ASSET_BASE}${file}`;
        img.alt = file.replace(/_|.png/g, " ");
        img.loading = "lazy";
        frame.appendChild(img);

        const title = document.createElement("div");
        title.className = "card-title";
        title.textContent = file.replace(".png", "");

        item.appendChild(frame);
        item.appendChild(title);
        item.addEventListener("click", () => openLightbox(img.src));
        grid.appendChild(item);
    });
}

function openLightbox(src) {
    const lb = $("#lightbox");
    const img = $("#lightbox-img");
    img.src = src;
    lb.style.display = "flex";
    lb.setAttribute("aria-hidden", "false");
}

function closeLightbox() {
    const lb = $("#lightbox");
    lb.style.display = "none";
    lb.setAttribute("aria-hidden", "true");
}

function loadReviews() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (err) {
        return [];
    }
}

function saveReviews(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function renderReviews() {
    const container = $("#reviews-list");
    const reviews = loadReviews().sort((a, b) => b.ts - a.ts);
    container.innerHTML = "";
    if (reviews.length === 0) {
        container.innerHTML = `<div class="muted">No hay reseñas aún. ¡Sé el primero!</div>`;
        return;
    }

    reviews.forEach((r) => {
        const card = document.createElement("div");
        card.className = "review-card";

        const head = document.createElement("div");
        head.className = "review-card-head";

        const name = document.createElement("div");
        name.textContent = r.name || "Anónimo";
        name.style.fontWeight = "600";

        const meta = document.createElement("div");
        meta.className = "muted";
        meta.textContent = `${r.type} · ${new Date(r.ts).toLocaleString()}`;

        head.appendChild(name);
        head.appendChild(meta);

        const stars = document.createElement("div");
        stars.className = "review-stars";
        stars.textContent = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);

        const text = document.createElement("div");
        text.textContent = r.text || "";

        card.appendChild(head);
        card.appendChild(stars);
        card.appendChild(text);
        container.appendChild(card);
    });
}

function setStars(value) {
    $("#review-rating").value = String(value);
    $$("#star-picker button").forEach((btn) => {
        const n = Number(btn.dataset.star);
        btn.textContent = n <= value ? "★" : "☆";
    });
}

function setupStars() {
    $("#star-picker").addEventListener("click", (e) => {
        const target = e.target.closest("[data-star]");
        if (!target) return;
        setStars(Number(target.dataset.star));
    });
}

function setupReviewsForm() {
    $("#review-submit").addEventListener("click", () => {
        const name = $("#review-name").value.trim();
        const rating = Math.max(1, Math.min(5, Number($("#review-rating").value) || 5));
        const text = $("#review-text").value.trim();
        const type = $("#review-type").value;
        const list = loadReviews();
        list.push({ id: Date.now() + Math.random(), name, rating, text, type, ts: Date.now() });
        saveReviews(list);
        renderReviews();
        $("#review-form").reset();
        setStars(5);
    });

    $("#export-reviews").addEventListener("click", () => {
        const data = loadReviews();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "combat_cards_reviews.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    });

    $("#import-input").addEventListener("change", async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            if (!Array.isArray(parsed)) throw new Error("Formato inválido");
            const current = loadReviews();
            const ids = new Set(current.map((r) => r.id));
            parsed.forEach((r) => {
                if (!ids.has(r.id)) current.push(r);
            });
            saveReviews(current);
            renderReviews();
            alert("Importación completada.");
        } catch (err) {
            alert(`Error importando: ${err.message}`);
        }
        e.target.value = "";
    });
}

function setupGalleryControls() {
    $("#shuffle-cards").addEventListener("click", () => buildGallery(shuffle(CARD_FILES)));

    $("#toggle-borders").addEventListener("click", () => {
        const frames = $$(".card-frame");
        frames.forEach((frame) => frame.classList.toggle("no-border"));
    });
}

function setupDownloadTools() {
    const copy = $("#copy-link");
    if (!copy) return;
    copy.addEventListener("click", async () => {
        try {
            const url = new URL("combat_cards.exe", window.location.href);
            await navigator.clipboard.writeText(url.href);
            copy.textContent = "Enlace copiado";
            setTimeout(() => {
                copy.textContent = "Copiar enlace";
            }, 1600);
        } catch (err) {
            alert("No se pudo copiar el enlace.");
        }
    });
}

function setupLightbox() {
    $("#lb-close").addEventListener("click", closeLightbox);
    $("#lightbox").addEventListener("click", (e) => {
        if (e.target.id === "lightbox") closeLightbox();
    });
}

function setupReveal() {
    const revealEls = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
        revealEls.forEach((el) => el.classList.add("visible"));
        return;
    }
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.2 }
    );
    revealEls.forEach((el) => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
    buildGallery(CARD_FILES);
    renderReviews();
    setupStars();
    setupReviewsForm();
    setupGalleryControls();
    setupDownloadTools();
    setupLightbox();
    setupReveal();
});
