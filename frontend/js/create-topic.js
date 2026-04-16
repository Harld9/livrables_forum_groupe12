/* ============================================================
   create-topic.js — Page create-topic.html uniquement
   Gère : validation, preview image, compteurs, soumission
   ============================================================ */

// ─── CONSTANTES ─────────────────────────────────────────────
const MAX_TITLE   = 120;   // caractères max pour le titre
const MAX_CONTENT = 5000;  // caractères max pour le contenu
const ALLOWED_TAGS = ['Série', 'Film', 'Review', 'Discussion', 'Animes', 'Guide'];

// ─── COMPTEURS DE CARACTÈRES ─────────────────────────────────

/**
 * Ajoute un compteur "X / MAX" sous un champ texte.
 * @param {HTMLElement} input  L'input ou textarea à surveiller
 * @param {number}      max    Limite en caractères
 */
function addCharCounter(input, max) {
  const counter = document.createElement('span');
  counter.className   = 'form-hint char-counter';
  counter.style.float = 'right';
  counter.textContent = `0 / ${max}`;
  input.parentElement.appendChild(counter);

  input.addEventListener('input', () => {
    const len = input.value.length;
    counter.textContent = `${len} / ${max}`;
    counter.style.color = len > max ? '#ef4444' : 'var(--gray-400)';
  });
}

// ─── PREVIEW IMAGE ───────────────────────────────────────────

/**
 * Active le preview de l'image sélectionnée dans le champ file.
 * Injecte une balise <img> dans la zone de preview.
 */
function bindImagePreview() {
  const fileInput   = document.getElementById('imageUpload');
  const previewZone = document.querySelector('.reply-notice div');
  if (!fileInput || !previewZone) return;

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];

    if (!file) {
      previewZone.innerHTML = '<em style="color:var(--gray-400);">Aucune image sélectionnée</em>';
      return;
    }

    // Vérifie le type de fichier côté client
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      showToast('Format non supporté. Utilise PNG, JPG ou WEBP.', 'error');
      fileInput.value = '';
      return;
    }

    // Vérifie la taille (5 Mo max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image trop lourde (5 Mo maximum).', 'error');
      fileInput.value = '';
      return;
    }

    // Lit le fichier et affiche l'aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      previewZone.innerHTML = `
        <img
          src="${e.target.result}"
          alt="Aperçu"
          style="max-width:100%; max-height:300px; border-radius:10px; object-fit:cover;"
        >
        <div style="margin-top:8px; font-size:13px; color:var(--gray-400);">
          ${escapeHtml(file.name)} — ${(file.size / 1024).toFixed(1)} Ko
        </div>`;
    };
    reader.readAsDataURL(file);
  });
}

// ─── SÉLECTION DES TAGS ──────────────────────────────────────

/** Retourne la liste des tags cochés. */
function getSelectedTags() {
  return [...document.querySelectorAll('.tag-checkbox input:checked')]
    .map(cb => cb.closest('.tag-checkbox').querySelector('.tag').textContent.trim());
}

/**
 * Active un style visuel sur les tags cochés.
 */
function bindTagCheckboxes() {
  document.querySelectorAll('.tag-checkbox').forEach(label => {
    const checkbox = label.querySelector('input[type="checkbox"]');
    const tagSpan  = label.querySelector('.tag');

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        tagSpan.classList.add('tag-active');
      } else {
        tagSpan.classList.remove('tag-active');
      }
    });
  });
}

// ─── VALIDATION ──────────────────────────────────────────────

/**
 * Valide le formulaire et retourne un objet { valid, errors }.
 */
function validateForm() {
  const titleInput   = document.querySelector('.topic-form input[type="text"]');
  const contentInput = document.querySelector('.topic-form textarea');
  const errors       = [];

  if (!titleInput.value.trim()) {
    errors.push('Le titre est obligatoire.');
  } else if (titleInput.value.length > MAX_TITLE) {
    errors.push(`Le titre dépasse ${MAX_TITLE} caractères.`);
  }

  if (!contentInput.value.trim()) {
    errors.push('Le contenu est obligatoire.');
  } else if (contentInput.value.length > MAX_CONTENT) {
    errors.push(`Le contenu dépasse ${MAX_CONTENT} caractères.`);
  }

  return { valid: errors.length === 0, errors };
}

// ─── SOUMISSION ──────────────────────────────────────────────

function handleSubmit() {
  const { valid, errors } = validateForm();

  if (!valid) {
    errors.forEach(e => showToast(e, 'error'));
    return;
  }

  const user    = getSession();
  const title   = document.querySelector('.topic-form input[type="text"]').value.trim();
  const content = document.querySelector('.topic-form textarea').value.trim();
  const tags    = getSelectedTags();

  const newTopic = {
    id:      Date.now(),
    title,
    content,
    tag:     tags[0] || 'Discussion',   // premier tag coché, ou "Discussion" par défaut
    author:  user ? user.username : 'Anonyme',
    date:    new Date().toISOString().split('T')[0],
    replies: 0,
    pinned:  false,
    status:  'open',
  };

  // Sauvegarde via topics.js
  addTopic(newTopic);

  showToast('Topic publié avec succès !', 'success');

  setTimeout(() => {
    window.location.href = 'topics.html';
  }, 900);
}

// ─── INIT ────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Protection : seuls les connectés peuvent créer un topic
  requireAuth();

  // Compteurs de caractères
  const titleInput   = document.querySelector('.topic-form input[type="text"]');
  const contentInput = document.querySelector('.topic-form textarea');
  if (titleInput)   addCharCounter(titleInput,   MAX_TITLE);
  if (contentInput) addCharCounter(contentInput, MAX_CONTENT);

  // Preview image
  bindImagePreview();

  // Tags visuels
  bindTagCheckboxes();

  // Bouton publier
  const submitBtn = document.querySelector('.btn-primary[type="button"]');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleSubmit);
  }

  // Bouton annuler (déjà géré par le href dans le HTML)
});
