const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const STORAGE_KEY = "uvs_saved_topics_v1";

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSaved(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function normalize(s) {
  return (s || "")
    .toString()
    .trim()
    .toLowerCase();
}

function cardId(card) {
  // тогтвортой id: title + tags
  const t = card.dataset.title || card.querySelector("h3")?.textContent || "untitled";
  const tags = card.dataset.tags || "";
  return normalize(t) + "|" + normalize(tags);
}

function renderSavedList(savedIds, cards) {
  const savedList = $("#savedList");
  const savedCount = $("#savedCount");

  savedCount.textContent = `Хадгалсан: ${savedIds.length}`;

  if (!savedIds.length) {
    savedList.innerHTML = `<li class="muted">Одоогоор хадгалсан зүйл алга.</li>`;
    return;
  }

  const items = savedIds
    .map(id => cards.find(c => cardId(c) === id))
    .filter(Boolean)
    .map(card => {
      const title = card.querySelector("h3")?.textContent?.trim() || "Сэдэв";
      const anchor = `t-${hashCode(id)}`;
      card.id = anchor;
      return `
        <li class="saved-item">
          <a href="#${anchor}">${escapeHtml(title)}</a>
          <button class="btn btn-ghost js-unsave" data-id="${escapeHtml(id)}" type="button">Устгах</button>
        </li>
      `;
    })
    .join("");

  savedList.innerHTML = items;
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(16);
}

function escapeHtml(s) {
  return (s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setMatchCount(visible, total) {
  const el = $("#matchCount");
  el.textContent = `Харагдаж буй сэдэв: ${visible}/${total}`;
}

function filterCards(q, cards) {
  const query = normalize(q);
  let visible = 0;

  cards.forEach(card => {
    const title = normalize(card.dataset.title || card.querySelector("h3")?.textContent);
    const tags = normalize(card.dataset.tags || "");
    const hit = !query || title.includes(query) || tags.includes(query);

    card.style.display = hit ? "" : "none";
    if (hit) visible++;
  });

  setMatchCount(visible, cards.length);
  return visible;
}

function wireCardToggles(cards) {
  cards.forEach(card => {
    const btn = $(".js-toggle", card);
    const body = $(".card-body", card);

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!isOpen));
      body.hidden = isOpen;
      btn.textContent = isOpen ? "Дэлгэрэнгүй" : "Хаах";
    });
  });
}

function wireSaving(cards) {
  let saved = loadSaved();

  const updateAllSaveButtons = () => {
    cards.forEach(card => {
      const id = cardId(card);
      const saveBtn = $(".js-save", card);
      const isSaved = saved.includes(id);
      saveBtn.textContent = isSaved ? "Хадгалсан" : "Хадгалах";
    });
  };

  const rerender = () => {
    renderSavedList(saved, cards);
    updateAllSaveButtons();
  };

  // single save buttons
  cards.forEach(card => {
    const saveBtn = $(".js-save", card);
    saveBtn.addEventListener("click", () => {
      const id = cardId(card);
      if (!saved.includes(id)) {
        saved.push(id);
      } else {
        saved = saved.filter(x => x !== id);
      }
      saveSaved(saved);
      rerender();
    });
  });

  // bulk save visible
  $("#saveAllBtn").addEventListener("click", () => {
    const visibleCards = cards.filter(c => c.style.display !== "none");
    const ids = visibleCards.map(cardId);
    let changed = false;

    ids.forEach(id => {
      if (!saved.includes(id)) {
        saved.push(id);
        changed = true;
      }
    });

    if (changed) {
      saveSaved(saved);
      rerender();
    }
  });

  // clear saved
  $("#clearSavedBtn").addEventListener("click", () => {
    saved = [];
    saveSaved(saved);
    rerender();
  });

  // unsave from list (event delegation)
  $("#savedList").addEventListener("click", (e) => {
    const btn = e.target.closest(".js-unsave");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    saved = saved.filter(x => x !== id);
    saveSaved(saved);
    rerender();
  });

  rerender();
}

function initSearch(cards) {
  const q = $("#q");
  const clearBtn = $("#clearBtn");

  const run = () => filterCards(q.value, cards);

  q.addEventListener("input", run);
  clearBtn.addEventListener("click", () => {
    q.value = "";
    q.focus();
    run();
  });

  // initial
  run();
}

function init() {
  $("#year").textContent = new Date().getFullYear();

  const cards = $$("#cards .card");
  wireCardToggles(cards);
  initSearch(cards);
  wireSaving(cards);
}

document.addEventListener("DOMContentLoaded", init);
