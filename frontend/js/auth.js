/* ============================================================
   auth.js — Page auth.html uniquement
   Gère : toggle connexion/inscription, validation, session
   ============================================================ */

// ─── BASE DE DONNÉES FICTIVE (simule le backend) ─────────────
// En prod, ces données viendraient de l'API Express / SQL.
// On stocke les comptes créés dans localStorage.

const USERS_KEY = 'lounge_users';

/** Retourne la liste de tous les comptes enregistrés. */
function getAllUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

/** Sauvegarde la liste des comptes. */
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** Cherche un utilisateur par pseudo OU email. */
function findUser(identifier) {
  return getAllUsers().find(
    u => u.username === identifier || u.email === identifier
  );
}

// Compte admin par défaut (toujours présent)
function ensureDefaultAdmin() {
  const users = getAllUsers();
  if (!users.find(u => u.username === 'admin')) {
    users.push({
      id:       1,
      username: 'admin',
      email:    'admin@lounge.fr',
      password: 'admin1234',   // ⚠️ jamais en clair en prod !
      role:     'admin',
    });
    saveUsers(users);
  }
}

// ─── TOGGLE LOGIN / REGISTER ─────────────────────────────────

let currentMode = 'login';   // 'login' | 'register'

/**
 * Reconstruit dynamiquement le formulaire selon le mode.
 * On remplace l'inner HTML de .auth-card pour garder le HTML propre.
 */
function renderAuthForm() {
  const card = document.querySelector('.auth-card');
  if (!card) return;

  if (currentMode === 'login') {
    card.querySelector('.auth-form').innerHTML = `
      <div class="form-group">
        <label>Nom d'utilisateur ou email</label>
        <input id="loginIdentifier" type="text" placeholder="Pseudo ou email">
        <span class="form-hint form-error" id="errIdentifier" style="display:none;color:#ef4444;"></span>
      </div>
      <div class="form-group">
        <label>Mot de passe</label>
        <input id="loginPassword" type="password" placeholder="••••••••">
        <span class="form-hint form-error" id="errPassword" style="display:none;color:#ef4444;"></span>
      </div>
      <button class="btn btn-primary btn-full" id="submitBtn" type="button">Se connecter</button>
    `;
    card.querySelector('.auth-footer').innerHTML =
      `Pas de compte ? <a href="#" id="toggleMode">S'inscrire</a>`;

  } else {
    card.querySelector('.auth-form').innerHTML = `
      <div class="form-group">
        <label>Pseudo <span class="required">*</span></label>
        <input id="regUsername" type="text" placeholder="MonPseudo">
        <span class="form-hint form-error" id="errUsername" style="display:none;color:#ef4444;"></span>
      </div>
      <div class="form-group">
        <label>Email <span class="required">*</span></label>
        <input id="regEmail" type="email" placeholder="moi@example.com">
        <span class="form-hint form-error" id="errEmail" style="display:none;color:#ef4444;"></span>
      </div>
      <div class="form-group">
        <label>Mot de passe <span class="required">*</span></label>
        <input id="regPassword" type="password" placeholder="Au moins 6 caractères">
        <span class="form-hint form-error" id="errRegPassword" style="display:none;color:#ef4444;"></span>
      </div>
      <div class="form-group">
        <label>Confirmer le mot de passe <span class="required">*</span></label>
        <input id="regConfirm" type="password" placeholder="••••••••">
        <span class="form-hint form-error" id="errConfirm" style="display:none;color:#ef4444;"></span>
      </div>
      <button class="btn btn-primary btn-full" id="submitBtn" type="button">Créer mon compte</button>
    `;
    card.querySelector('.auth-footer').innerHTML =
      `Déjà un compte ? <a href="#" id="toggleMode">Se connecter</a>`;
  }

  // Écouter le bouton switcher
  document.getElementById('toggleMode').addEventListener('click', (e) => {
    e.preventDefault();
    currentMode = currentMode === 'login' ? 'register' : 'login';
    renderAuthForm();
  });

  // Écouter le bouton submit
  document.getElementById('submitBtn').addEventListener('click', () => {
    currentMode === 'login' ? handleLogin() : handleRegister();
  });

  // Submit avec la touche Entrée
  card.querySelectorAll('input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        currentMode === 'login' ? handleLogin() : handleRegister();
      }
    });
  });
}

// ─── HELPERS D'ERREUR ────────────────────────────────────────

function showError(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.style.display = 'block';
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => {
    el.style.display = 'none';
    el.textContent   = '';
  });
}

// ─── CONNEXION ───────────────────────────────────────────────

function handleLogin() {
  clearErrors();
  const identifier = document.getElementById('loginIdentifier')?.value.trim();
  const password   = document.getElementById('loginPassword')?.value;

  let valid = true;

  if (!identifier) {
    showError('errIdentifier', 'Ce champ est requis.');
    valid = false;
  }
  if (!password) {
    showError('errPassword', 'Ce champ est requis.');
    valid = false;
  }
  if (!valid) return;

  const user = findUser(identifier);

  if (!user || user.password !== password) {
    showError('errPassword', 'Identifiants incorrects.');
    return;
  }

  // Crée la session (sans stocker le mot de passe)
  setSession({ id: user.id, username: user.username, email: user.email, role: user.role });
  showToast(`Bienvenue, ${user.username} !`, 'success');

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 800);
}

// ─── INSCRIPTION ─────────────────────────────────────────────

function handleRegister() {
  clearErrors();

  const username = document.getElementById('regUsername')?.value.trim();
  const email    = document.getElementById('regEmail')?.value.trim();
  const password = document.getElementById('regPassword')?.value;
  const confirm  = document.getElementById('regConfirm')?.value;

  let valid = true;

  if (!username || username.length < 3) {
    showError('errUsername', 'Pseudo trop court (3 caractères minimum).');
    valid = false;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('errEmail', 'Adresse email invalide.');
    valid = false;
  }
  if (!password || password.length < 6) {
    showError('errRegPassword', 'Mot de passe trop court (6 caractères minimum).');
    valid = false;
  }
  if (password !== confirm) {
    showError('errConfirm', 'Les mots de passe ne correspondent pas.');
    valid = false;
  }
  if (!valid) return;

  const users = getAllUsers();

  if (users.find(u => u.username === username)) {
    showError('errUsername', 'Ce pseudo est déjà pris.');
    return;
  }
  if (users.find(u => u.email === email)) {
    showError('errEmail', 'Cet email est déjà utilisé.');
    return;
  }

  // Création du compte
  const newUser = {
    id:       Date.now(),
    username,
    email,
    password,      // ⚠️ en prod → hasher côté serveur (bcrypt)
    role:     'member',
  };

  users.push(newUser);
  saveUsers(users);

  // Connexion automatique
  setSession({ id: newUser.id, username, email, role: 'member' });
  showToast('Compte créé avec succès !', 'success');

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 800);
}

// ─── INIT ────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  ensureDefaultAdmin();

  // Si déjà connecté → redirige vers l'accueil
  if (isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  renderAuthForm();
});
