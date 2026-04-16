/* ============================================================
   admin.js — Page admin.html uniquement
   Gère : onglets, tableau utilisateurs, sanctions, archives, annonces
   ============================================================ */

// ─── PROTECTION ──────────────────────────────────────────────
// Sera exécuté au DOMContentLoaded, avant tout rendu sensible.

// ─── ONGLETS (remplace le script inline de admin.html) ───────

function bindAdminTabs() {
  const tabs   = document.querySelectorAll('.admin-tab');
  const panels = document.querySelectorAll('.admin-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t   => t.classList.remove('tag-active'));
      tab.classList.add('tag-active');

      const target = tab.dataset.tab;
      panels.forEach(p => {
        p.style.display = p.id === target ? 'block' : 'none';
      });
    });
  });
}

// ─── TABLEAU UTILISATEURS ────────────────────────────────────

/** Injecte les utilisateurs dans le tbody du tableau de gestion. */
function renderUsersTable(filter = '') {
  const tbody = document.querySelector('#users .admin-table:first-of-type tbody');
  if (!tbody) return;

  let users = getAllUsers();   // fonction de main.js / auth.js

  if (filter) {
    const q = filter.toLowerCase();
    users = users.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }

  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:var(--gray-400); padding:20px;">
          Aucun utilisateur trouvé.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.id}</td>
      <td><strong>${escapeHtml(user.username)}</strong></td>
      <td>${escapeHtml(user.email)}</td>
      <td>
        <span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-open'}">
          ${user.role}
        </span>
      </td>
      <td>
        <button
          class="btn btn-ghost btn-sm"
          onclick="toggleRole(${user.id})"
          title="Changer le rôle"
        >
          ${user.role === 'admin' ? '↓ Rétrograder' : '↑ Promouvoir'}
        </button>
        <button
          class="btn btn-ghost btn-sm"
          style="color:#ef4444;"
          onclick="deleteUser(${user.id})"
          title="Supprimer le compte"
        >
          ✕ Supprimer
        </button>
      </td>
    </tr>`).join('');
}

/** Change le rôle d'un utilisateur (admin ↔ member). */
function toggleRole(userId) {
  const users = getAllUsers();
  const user  = users.find(u => u.id === userId);
  if (!user) return;

  // Empêche de rétrograder son propre compte admin
  const me = getSession();
  if (me && me.id === userId) {
    showToast('Vous ne pouvez pas modifier votre propre rôle.', 'error');
    return;
  }

  user.role = user.role === 'admin' ? 'member' : 'admin';
  saveUsers(users);
  showToast(`${user.username} est maintenant ${user.role}.`, 'success');
  renderUsersTable();
}

/** Supprime un utilisateur. */
function deleteUser(userId) {
  const me = getSession();
  if (me && me.id === userId) {
    showToast('Vous ne pouvez pas supprimer votre propre compte ici.', 'error');
    return;
  }

  if (!confirm('Supprimer cet utilisateur ? Cette action est irréversible.')) return;

  let users = getAllUsers();
  users = users.filter(u => u.id !== userId);
  saveUsers(users);
  showToast('Utilisateur supprimé.', 'success');
  renderUsersTable();
}

// ─── TABLEAU SANCTIONS ───────────────────────────────────────

/** Données des sanctions (stockées en localStorage). */
const BANS_KEY = 'lounge_bans';

function getBans() {
  try { return JSON.parse(localStorage.getItem(BANS_KEY)) || []; }
  catch { return []; }
}
function saveBans(bans) {
  localStorage.setItem(BANS_KEY, JSON.stringify(bans));
}

function renderBansTable() {
  const tbody = document.querySelectorAll('#users .admin-table')[1]?.querySelector('tbody');
  if (!tbody) return;

  const bans = getBans();

  if (bans.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:var(--gray-400); padding:20px;">
          Aucune sanction active.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = bans.map((ban, i) => `
    <tr>
      <td>${escapeHtml(ban.username)}</td>
      <td><span class="badge badge-closed">${escapeHtml(ban.type)}</span></td>
      <td>${escapeHtml(ban.reason)}</td>
      <td>${escapeHtml(ban.duration)}</td>
      <td>
        <button class="btn btn-ghost btn-sm" style="color:#ef4444;" onclick="liftBan(${i})">
          Lever
        </button>
      </td>
    </tr>`).join('');
}

function liftBan(index) {
  const bans = getBans();
  const ban  = bans[index];
  if (!ban) return;
  bans.splice(index, 1);
  saveBans(bans);
  showToast(`Sanction levée pour ${ban.username}.`, 'success');
  renderBansTable();
}

// ─── ARCHIVES ────────────────────────────────────────────────

function renderArchives() {
  const tbody = document.querySelector('#archives .admin-table tbody');
  if (!tbody) return;

  // On filtre les topics archivés depuis localStorage
  const topics = loadTopics().filter(t => t.status === 'archived');

  if (topics.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; color:var(--gray-400); padding:20px;">
          Aucun topic archivé.
        </td>
      </tr>`;
  } else {
    tbody.innerHTML = topics.map(t => `
      <tr>
        <td>${escapeHtml(t.title)}</td>
        <td>${escapeHtml(t.author)}</td>
        <td>${t.date}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="restoreTopic(${t.id})">
            Restaurer
          </button>
        </td>
      </tr>`).join('');
  }
}

function restoreTopic(id) {
  const topics = loadTopics();
  const t = topics.find(x => x.id === id);
  if (t) {
    t.status = 'open';
    saveTopics(topics);
    showToast('Topic restauré.', 'success');
    renderArchives();
  }
}

// ─── ANNONCES ────────────────────────────────────────────────

function bindAnnouncementForm() {
  const publishBtn = document.querySelector('#announcement .btn-primary');
  if (!publishBtn) return;

  publishBtn.addEventListener('click', () => {
    const titleEl   = document.querySelector('#announcement input[type="text"]');
    const contentEl = document.querySelector('#announcement textarea');
    const prioEl    = document.querySelector('#announcement select');

    if (!titleEl.value.trim() || !contentEl.value.trim()) {
      showToast('Remplis le titre et le contenu.', 'error');
      return;
    }

    // En prod → POST /api/announcements
    showToast(`Annonce "${titleEl.value}" publiée (${prioEl.value}) !`, 'success');
    titleEl.value   = '';
    contentEl.value = '';
  });
}

// ─── RECHERCHE DANS LES TABLEAUX ─────────────────────────────

function bindAdminSearch() {
  // Recherche utilisateurs
  const [userSearchInput] = document.querySelectorAll('#users .search-input');
  const [userSearchBtn]   = document.querySelectorAll('#users .btn-primary');

  userSearchBtn?.addEventListener('click', () => {
    renderUsersTable(userSearchInput.value.trim());
  });
  userSearchInput?.addEventListener('input', () => {
    renderUsersTable(userSearchInput.value.trim());
  });
}

// ─── INIT ────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  requireAdmin();   // redirige si pas admin

  bindAdminTabs();
  renderUsersTable();
  renderBansTable();
  renderArchives();
  bindAnnouncementForm();
  bindAdminSearch();

  showToast(`Bienvenue dans l'administration, ${getSession()?.username} !`, 'info');
});
