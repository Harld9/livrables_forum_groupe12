const url = window.location.search;
const params = new URLSearchParams(url);
const idUrl = parseInt(params.get("idTopic"));

const boutonRecherche = document.getElementById('btn-rechercher');
const inputRecherche = document.getElementById('search-input');
const topicsList = document.getElementById('topics-list');
const formulaireRecherche = inputRecherche ? inputRecherche.closest('form') : null;

let tagActuel = '';
let pageActuelle = 1;

if (formulaireRecherche) {
    formulaireRecherche.addEventListener('submit', rechercherTopic);
} else if (boutonRecherche) {
    boutonRecherche.addEventListener('click', rechercherTopic);
}

if (inputRecherche) {
    inputRecherche.addEventListener('input', rechercherTopic);
}

const token = sessionStorage.getItem('token');
const formulaireReponse = document.getElementById('new-reply-form');

if (!token && formulaireReponse) {
    formulaireReponse.style.display = 'none';
}

async function afficherTopic() {
    if (isNaN(idUrl)) {
        window.location.href = '/topics';
        return;
    }

    try {
        const triActuel = params.get("tri") || 'asc';
        const reponse = await fetch(`/api/afficherTopic/${idUrl}?tri=${triActuel}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const donnees = await reponse.json();

        if (reponse.ok) {
            const titreTopic = document.getElementById('topic-title');
            const contenuTopic = document.getElementById('topic-body');
            titreTopic.textContent = donnees.topic.titre;
            contenuTopic.textContent = donnees.topic.contenu;

            const affichageScore = document.getElementById('topic-score');
            if (affichageScore) {
                affichageScore.textContent = donnees.topic.score;
            }

            const actionsFooter = document.querySelector('.topic-actions');

            if (sessionStorage.getItem('pseudo') === donnees.topic.pseudo || sessionStorage.getItem('typeCompte') === 'admin') {
                const boutonSupprimerTopic = document.createElement('button');
                boutonSupprimerTopic.textContent = 'Supprimer le topic';
                boutonSupprimerTopic.className = 'btn btn-ghost btn-danger';
                boutonSupprimerTopic.onclick = () => supprimerTopic(idUrl);
                if (actionsFooter) {
                    actionsFooter.appendChild(boutonSupprimerTopic);
                }
            }

            const listeCommentaire = document.getElementById('comments-list');

            donnees.messages.forEach(msg => {
                const divMessage = document.createElement("div");
                divMessage.className = "comment-card";
                divMessage.innerHTML = `
                    <div class="comment-body">${msg.contenu}</div>
                    <div class="comment-meta">Par <strong>${msg.pseudo}</strong></div>
                `;

                const pseudoConnecte = sessionStorage.getItem('pseudo');
                if (pseudoConnecte === msg.pseudo || sessionStorage.getItem('typeCompte') === 'admin') {
                    const boutonSupprimer = document.createElement("button");
                    boutonSupprimer.textContent = "Supprimer";
                    boutonSupprimer.className = "btn btn-ghost btn-danger";
                    boutonSupprimer.onclick = () => supprimerMessage(msg.idMessage);
                    divMessage.appendChild(boutonSupprimer);
                }

                listeCommentaire.appendChild(divMessage);
            });
        } else {
            afficherErreur(donnees.message);
            window.location.href = '/topics';
        }
    } catch (erreur) {
        console.error(erreur);
        afficherErreur('Erreur réseau, veuillez réessayer.');
    }
}

async function publierMessage(e) {
    e.preventDefault();
    const message = document.getElementById('reply-text');
    const contenuMessage = message.value;
    const jeton = sessionStorage.getItem('token');
    try {
        const reponse = await fetch('/api/creerMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jeton },
            body: JSON.stringify({ message: contenuMessage, idTopic: idUrl })
        });
        if (reponse.ok) {
            window.location.reload();
        } else {
            const donnees = await reponse.json();
            afficherErreur(donnees.message);
        }
    } catch (erreur) {
        console.error(erreur);
        afficherErreur('Erreur réseau, veuillez réessayer.');
    }
}

let titre = null;
let contenu = null;

if (document.getElementById('titreTopic')) {
    titre = document.getElementById('titreTopic');
    contenu = document.getElementById('contenuTopic');
    const boutonPublier = document.getElementById('boutonPublier');
    if (boutonPublier) {
        boutonPublier.addEventListener("click", publier);
    }
}

async function publier() {
    const contenuTitre = titre.value;
    const contenuTopic = contenu.value;
    const jeton = sessionStorage.getItem('token');
    let idTag = 0;
    if (document.querySelector('input[name="idTag"]:checked')) {
        idTag = document.querySelector('input[name="idTag"]:checked').value;
    }

    try {
        const reponse = await fetch('/api/creerTopic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jeton },
            body: JSON.stringify({ titre: contenuTitre, contenu: contenuTopic, tags: idTag })
        });
        const donnees = await reponse.json();
        if (reponse.ok) {
            window.location.href = '/topicTemplate?idTopic=' + donnees.id;
        } else {
            afficherErreur(donnees.message);
        }
    } catch (erreur) {
        console.error(erreur);
        afficherErreur('Erreur réseau, veuillez réessayer.');
    }
}

function afficherErreur(message) {
    const boite = document.getElementById('boiteMessage');
    if (boite) {
        boite.classList.add('message-erreur');
        boite.style.display = 'block';
        boite.textContent = message;
    }
}

function formaterDate(dateString) {
    if (!dateString) return 'Aujourd\'hui';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

function creerCarteTopic(topic, index) {
    const topicCard = document.createElement('a');
    topicCard.className = 'topic-card';
    topicCard.href = '/topicTemplate?idTopic=' + (topic.idTopic || topic.id);
    topicCard.style.textDecoration = 'none';
    topicCard.style.color = 'inherit';
    topicCard.style.display = 'flex';

    const numero = document.createElement('div');
    numero.className = 'topic-card-num';
    numero.textContent = '#' + (((pageActuelle - 1) * 10) + index + 1);

    const cardBody = document.createElement('div');
    cardBody.className = 'topic-card-body';

    const meta = document.createElement('div');
    meta.className = 'topic-card-meta';

    // Affichage du score uniquement
    const badgeScore = document.createElement('span');
    badgeScore.className = 'badge';
    badgeScore.style.backgroundColor = '#444';
    badgeScore.style.color = 'white';
    badgeScore.textContent = '⭐ Score : ' + (topic.scoreTotal || 0);

    meta.appendChild(badgeScore);

    const info = document.createElement('div');
    info.className = 'topic-card-info';
    info.innerHTML = `${topic.pseudo || 'Anonyme'} <span class="sep">•</span> ${formaterDate(topic.dateDeCreation)}`;

    const titleBlock = document.createElement('div');
    titleBlock.className = 'topic-card-title';
    titleBlock.textContent = topic.titre || 'Topic sans titre';

    cardBody.appendChild(meta);
    cardBody.appendChild(titleBlock);
    cardBody.appendChild(info);

    const arrow = document.createElement('div');
    arrow.className = 'topic-card-arrow';
    arrow.textContent = '→';

    topicCard.appendChild(numero);
    topicCard.appendChild(cardBody);
    topicCard.appendChild(arrow);

    return topicCard;
}

async function afficherTopics() {
    const liste = document.getElementById('topics-list');
    if (!liste) return;

    try {
        const adresseAPI = tagActuel ? `/api/topics?tag=${tagActuel}&page=${pageActuelle}` : `/api/topics?page=${pageActuelle}`;
        const reponse = await fetch(adresseAPI);
        const topics = await reponse.json();

        liste.innerHTML = '';

        const btnPrecedent = document.getElementById('btn-precedent');
        const btnSuivant = document.getElementById('btn-suivant');
        const spanPage = document.getElementById('numero-page');

        if (topics.length === 0) {
            liste.innerHTML = '<p style="color:white; padding:20px;">Aucun topic disponible.</p>';
            if (btnPrecedent) btnPrecedent.style.visibility = pageActuelle > 1 ? 'visible' : 'hidden';
            if (btnSuivant) btnSuivant.style.visibility = 'hidden';
            if (spanPage) spanPage.textContent = `Page ${pageActuelle}`;
            return;
        }

        topics.forEach((topic, index) => {
            liste.appendChild(creerCarteTopic(topic, index));
        });

        if (spanPage) spanPage.textContent = `Page ${pageActuelle}`;

        if (btnPrecedent) {
            btnPrecedent.style.visibility = pageActuelle === 1 ? 'hidden' : 'visible';
        }
        if (btnSuivant) {
            btnSuivant.style.visibility = topics.length < 10 ? 'hidden' : 'visible';
        }

    } catch (erreur) {
        console.error(erreur);
        liste.innerHTML = '<p class="message-erreur">Impossible de charger les topics.</p>';
    }
}

function filtrerParTag(idTag, boutonClique) {
    tagActuel = idTag;
    pageActuelle = 1;

    document.querySelectorAll('.btn.tag, .tag').forEach(btn => {
        btn.style.background = 'transparent';
        btn.style.borderColor = '#444';
    });

    if (boutonClique) {
        boutonClique.style.background = '#ff4d4d';
        boutonClique.style.borderColor = '#ff4d4d';
    } else {
        const boutonActif = Array.from(document.querySelectorAll('.btn.tag, .tag')).find(btn => {
            const onclick = btn.getAttribute('onclick');
            return onclick && onclick.includes(`'${idTag}'`);
        });
        if (boutonActif) {
            boutonActif.style.background = '#ff4d4d';
            boutonActif.style.borderColor = '#ff4d4d';
        }
    }

    afficherTopics();
}

function pageSuivante() {
    pageActuelle++;
    afficherTopics();
    window.scrollTo(0, 0);
}

function pagePrecedente() {
    if (pageActuelle > 1) {
        pageActuelle--;
        afficherTopics();
        window.scrollTo(0, 0);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const boutonsTags = document.querySelectorAll('.btn.tag, .tag');

    boutonsTags.forEach(bouton => {
        bouton.addEventListener('click', (e) => {
            e.preventDefault();
            const texte = bouton.textContent.trim().toLowerCase();
            let idDuTag = '';

            if (texte === 'film') idDuTag = '1';
            else if (texte === 'série') idDuTag = '2';
            else if (texte === 'anime') idDuTag = '3';
            else if (texte === 'question') idDuTag = '4';

            filtrerParTag(idDuTag, bouton);
        });
    });

    if (document.getElementById('topics-list')) {
        afficherTopics();
    }

    if (document.getElementById('topic-title')) {
        afficherTopic();
        const btnPublier = document.getElementById('boutonPublier');
        if (btnPublier) {
            btnPublier.addEventListener("click", publierMessage);
        }
    }

    const selectTri = document.getElementById('tri-messages');
    const paramTri = new URLSearchParams(window.location.search).get("tri");
    if (selectTri && paramTri) {
        selectTri.value = paramTri;
    }

    setTimeout(() => {
        const boutonTous = document.querySelector('.btn.tag');
        if (boutonTous && !tagActuel) {
            boutonTous.style.background = '#ff4d4d';
            boutonTous.style.borderColor = '#ff4d4d';
        }
    }, 100);
});

async function rechercherTopic(e) {
    if (e) e.preventDefault();
    const liste = document.getElementById('topics-list');
    if (!inputRecherche || !liste) return;
    const recherche = inputRecherche.value.trim();

    if (!recherche) {
        afficherTopics();
        return;
    }

    try {
        const reponse = await fetch(`/api/rechercheTopic?recherche=${encodeURIComponent(recherche)}`);
        const topics = await reponse.json();
        liste.innerHTML = '';

        if (!reponse.ok) {
            afficherErreur(topics.message || 'Erreur lors de la recherche.');
            return;
        }

        if (topics.length === 0) {
            liste.innerHTML = '<p style="color:white; padding:20px;">Aucun résultat trouvé.</p>';
            return;
        }

        topics.forEach((topic, index) => {
            liste.appendChild(creerCarteTopic(topic, index));
        });
    } catch (erreur) {
        console.error(erreur);
    }
}

async function supprimerMessage(idMessage) {
    if (!confirm("Voulez-vous vraiment supprimer ce message ?")) return;
    try {
        const reponse = await fetch(`/api/supprimerMessage/${idMessage}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            }
        });
        if (reponse.ok) {
            window.location.reload();
        } else {
            const donnees = await reponse.json();
            alert("Erreur : " + donnees.message);
        }
    } catch (erreur) {
        console.error(erreur);
    }
}

async function supprimerTopic(idTopic) {
    if (!confirm("Voulez-vous vraiment supprimer TOUT ce topic et ses messages ?")) return;
    try {
        const reponse = await fetch(`/api/supprimerTopic/${idTopic}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            }
        });
        if (reponse.ok) {
            window.location.href = '/topics';
        } else {
            const donnees = await reponse.json();
            alert("Erreur : " + donnees.message);
        }
    } catch (erreur) {
        console.error(erreur);
    }
}

async function envoyerVote(valeurVote) {
    const jeton = sessionStorage.getItem('token');
    if (!jeton) {
        alert("Vous devez être connecté pour évaluer un topic.");
        return;
    }
    try {
        const reponse = await fetch(`/api/likerTopic/${idUrl}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jeton
            },
            body: JSON.stringify({ vote: valeurVote })
        });
        if (reponse.ok) {
            window.location.reload();
        } else {
            const donnees = await reponse.json();
            alert("Erreur : " + donnees.message);
        }
    } catch (erreur) {
        console.error(erreur);
    }
}

function changerTri(valeurTri) {
    const params = new URLSearchParams(window.location.search);
    const idTopic = params.get("idTopic");
    window.location.href = `/topicTemplate?idTopic=${idTopic}&tri=${valeurTri}`;
}

function changerTriTopics(valeurTri) {
    console.log(valeurTri);
}