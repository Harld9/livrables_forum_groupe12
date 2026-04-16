/* ============================================================
   topics.js — Pages index.html ET topics.html
   Gère : données mock, rendu des topics, recherche, tags, pagination
   ============================================================ */

// ─── DONNÉES MOCK ────────────────────────────────────────────
// En prod ces données viennent de l'API Express (GET /api/topics).

const TOPICS_KEY = 'lounge_topics';

const DEFAULT_TOPICS = [

  {
  id: 1,
  title: "Guide du forum – Bien commencer sur Le Lounge",
  content: "...",
  tag: "Guide",
  author: "Administration",
  date: "2026-01-01",
  replies: 0,
  pinned: true,
  status: "open",
  page: "guide.html",
},
  {
    id:        2,
    title:     'Meilleur film 2026 selon vous ?',
    content:   'Avec toutes les sorties de ce début d\'année, j\'aimerais avoir vos avis…',
    tag:       'Films',
    author:    'Alex',
    date:      '2026-04-15',
    replies:   12,
    pinned:    false,
    status:    'open',
  },
  {
    id:        2,
    title:     'Vos animes préférés du moment ?',
    content:   'Perso je suis en train de regarder Frieren, c\'est incroyable.',
    tag:       'Animes',
    author:    'Sakura99',
    date:      '2026-04-10',
    replies:   34,
    pinned:    false,
    status:    'open',
  },
  {
    id:        3,
    title:     'Review : Dune Partie 3 – Décryptage complet',
    content:   'Après deux visionnages, voici mon analyse détaillée…',
    tag:       'Films',
    author:    'CinéPhile',
    date:      '2026-04-08',
    replies:   7,
    pinned:    false,
    status:    'open',
  },];

/** Charge les topics (localStorage > valeurs par défaut). */
function loadTopics() {
  try {
    const stored = JSON.parse(localStorage.getItem(TOPICS_KEY));
    return stored && stored.length ? stored : DEFAULT_TOPICS;
  } catch {
    return DEFAULT_TOPICS;
  }
}

/** Sauvegarde les topics dans localStorage. */
function saveTopics(topics) {
  localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
}

/** Ajoute un nouveau topic (appelé depuis create-topic.js). */
function addTopic(topic) {
  const topics = loadTopics();
  topics.unshift(topic);   // plus récent en premier
  saveTopics(topics);
}

// ─── ÉTAT DE LA PAGE ─────────────────────────────────────────

const PAGE_SIZE = 5;       // topics par page

let state = {
  query:      '',          // texte recherché
  activeTag:  'Tous',     // tag sélectionné
  page:       1,           // page courante
};

// ─── RENDU ───────────────────────────────────────────────────

/** Formate une date ISO en "Il y a X jours" ou date courte. */
function formatDate(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (diff === 0) return 'Aujourd\'hui';
  if (diff === 1) return 'Hier';
  if (diff < 7)  return `Il y a ${diff} jours`;
  return new Date(iso).toLocaleDateString('fr-FR', { day:'numeric', month:'short' });
}

/** Génère le HTML d'une carte topic. */
function renderTopicCard(topic, index) {
  const badgeClass = topic.pinned
    ? 'badge-admin'
    : topic.status === 'open' ? 'badge-open' : 'badge-closed';

  const badgeLabel = topic.pinned
    ? 'Épinglé'
    : topic.status === 'open' ? 'Ouvert' : 'Fermé';

  const num = topic.pinned ? '📌' : `#${index + 1}`;

  return `
    <div class="topic-card" data-id="${topic.id}">
      <div class="topic-card-num">${num}</div>
      <div class="topic-card-body">
        <div class="topic-card-meta">
          <span class="badge ${badgeClass}">${badgeLabel}</span>
          <span class="tag tag-sm">${escapeHtml(topic.tag)}</span>
        </div>
        <div class="topic-card-title">
          <a href="topics/${topic.id}.html">${escapeHtml(topic.title)}</a>
        </div>
        <div class="topic-card-info">
          <span>par ${escapeHtml(topic.author)}</span>
          <span class="sep">•</span>
          <span>${formatDate(topic.date)}</span>
          <span class="sep">•</span>
          <span>${topic.replies} réponse${topic.replies !== 1 ? 's' : ''}</span>
        </div>
      </div>
      <div class="topic-card-arrow">→</div>
    </div>`;
}

/** Filtre + pagine les topics selon l'état courant. */
function getFilteredTopics() {
  let topics = loadTopics();

  // Toujours mettre les épinglés en premier
  topics.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  // Filtre par tag
  if (state.activeTag !== 'Tous') {
    topics = topics.filter(t => t.tag === state.activeTag);
  }

  // Filtre par recherche
  if (state.query) {
    const q = state.query.toLowerCase();
    topics = topics.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.content.toLowerCase().includes(q) ||
      t.author.toLowerCase().includes(q)
    );
  }

  return topics;
}

/** Affiche les topics dans la liste, avec pagination. */
function renderTopics() {
  const list = document.querySelector('.topics-list');
  if (!list) return;

  const allFiltered = getFilteredTopics();
  const totalPages  = Math.max(1, Math.ceil(allFiltered.length / PAGE_SIZE));

  // Clamp la page
  state.page = Math.min(state.page, totalPages);

  const start   = (state.page - 1) * PAGE_SIZE;
  const visible = allFiltered.slice(start, start + PAGE_SIZE);

  if (visible.length === 0) {
    list.innerHTML = `
      <div class="topic-card" style="justify-content:center; color:var(--gray-400);">
        Aucun topic trouvé.
      </div>`;
  } else {
    list.innerHTML = visible
      .map((t, i) => renderTopicCard(t, start + i))
      .join('');
  }

  // Pagination
  const info = document.querySelector('.pagination-info');
  if (info) info.textContent = `Page ${state.page} / ${totalPages}`;

  const prevBtn = document.querySelector('.pagination .btn-sm:first-child');
  const nextBtn = document.querySelector('.pagination .btn-sm:last-child');

  if (prevBtn) prevBtn.disabled = state.page <= 1;
  if (nextBtn) nextBtn.disabled = state.page >= totalPages;
}

// ─── ÉVÉNEMENTS ──────────────────────────────────────────────

function bindTagFilters() {
  document.querySelectorAll('.tag-filter .tag').forEach(tag => {
    // Ignore le label texte
    if (tag.classList.contains('tag-filter-label')) return;

    tag.addEventListener('click', () => {
      document.querySelectorAll('.tag-filter .tag').forEach(t => t.classList.remove('tag-active'));
      tag.classList.add('tag-active');
      state.activeTag = tag.textContent.trim();
      state.page = 1;
      renderTopics();
    });
  });
}

function bindSearch() {
  const input  = document.querySelector('.search-input');
  const button = document.querySelector('.search-form .btn-primary');

  if (!input) return;

  const doSearch = () => {
    state.query = input.value.trim();
    state.page  = 1;
    renderTopics();
  };

  button?.addEventListener('click', doSearch);

  // Recherche en temps réel (debounce 300ms)
  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(doSearch, 300);
  });
}

function bindPagination() {
  const [prevBtn, nextBtn] = document.querySelectorAll('.pagination .btn-sm');

  prevBtn?.addEventListener('click', () => {
    if (state.page > 1) { state.page--; renderTopics(); }
  });

  nextBtn?.addEventListener('click', () => {
    state.page++;
    renderTopics();
  });
}

// ─── INIT ────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Ce fichier est chargé sur index.html ET topics.html
  if (!document.querySelector('.topics-list')) return;

  bindTagFilters();
  bindSearch();
  bindPagination();
  renderTopics();
});
