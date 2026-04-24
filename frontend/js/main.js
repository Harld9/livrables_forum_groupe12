/* ============================================================
   main.js — Chargé sur TOUTES les pages
   Gère : état de session, nav active, header dynamique
   ============================================================ */

// ─── CONSTANTES ─────────────────────────────────────────────
const SESSION_KEY = 'lounge_user';   // clé localStorage
const ADMIN_ROLE  = 'admin';

// ─── UTILITAIRES DE SESSION ──────────────────────────────────

/**
 * Retourne l'objet utilisateur connecté, ou null si déconnecté.
 * L'objet a la forme : { id, username, email, role }
 */
function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

/**
 * Enregistre un utilisateur en session.
 * @param {Object} user  { id, username, email, role }
 */
function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

/** Supprime la session (déconnexion). */
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/** Retourne true si quelqu'un est connecté. */
function isLoggedIn() {
  return getSession() !== null;
}

/** Retourne true si l'utilisateur connecté est admin. */
function isAdmin() {
  const s = getSession();
  return s && s.role === ADMIN_ROLE;
}

// ─── HEADER DYNAMIQUE ────────────────────────────────────────

/**
 * Met à jour le bouton de connexion dans la nav :
 *  - Connecté  → affiche "Pseudo ▾" + menu déroulant
 *  - Déconnecté → affiche "Se connecter / S'inscrire"
 */
function updateHeader() {
  const nav = document.querySelector('.main-nav');
  if (!nav) return;

  const user = getSession();
  const cta = nav.querySelector('.nav-cta');

  if (!cta) return;

  if (user) {
    // On garde le lien mais on le transforme
    cta.textContent = user.username + " ▾";
    cta.href = "#";

    cta.classList.add("nav-user");
  } else {
    cta.textContent = "Se connecter / S'inscrire";
    cta.href = "auth.html";
    cta.classList.remove("nav-user");
  }
}

// ─── NAV ACTIVE ──────────────────────────────────────────────

/**
 * Ajoute la classe "nav-active" au lien correspondant à la page courante.
 */
function setActiveNav() {
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkFile = link.getAttribute('href').split('/').pop();
    if (linkFile === currentFile) {
      link.classList.add('nav-active');
    }
  });
}

// ─── PROTECTION DE PAGE ──────────────────────────────────────

/**
 * Redirige vers auth.html si l'utilisateur n'est pas connecté.
 * À appeler en haut des pages protégées (create-topic, admin…).
 */
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'auth.html';
  }
}

/**
 * Redirige vers index.html si l'utilisateur n'est pas admin.
 */
function requireAdmin() {
  requireAuth();
  if (!isAdmin()) {
    window.location.href = 'index.html';
  }
}

// ─── HELPER : ÉCHAPPER LE HTML ───────────────────────────────

/**
 * Empêche les injections XSS en encodant les caractères spéciaux.
 */
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── TOAST / NOTIFICATION ────────────────────────────────────

/**
 * Affiche une notification temporaire en bas de l'écran.
 * @param {string} message  Texte à afficher
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'info') {
  // Crée le conteneur si inexistant
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed; bottom: 24px; right: 24px;
      display: flex; flex-direction: column; gap: 10px; z-index: 9999;
    `;
    document.body.appendChild(container);
  }

  const colors = {
    success: '#22c55e',
    error:   '#ef4444',
    info:    '#6366f1',
  };

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: ${colors[type] ?? colors.info};
    color: #fff;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    opacity: 0;
    transform: translateY(10px);
    transition: opacity .3s, transform .3s;
    max-width: 300px;
  `;
  toast.textContent = message;
  container.appendChild(toast);

  // Animation entrée
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // Suppression après 3s
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ─── INIT ────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  updateHeader();
});

// Vérification du js chargé 
console.log("main.js chargé");