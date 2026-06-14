//récupère l'url de la page actuelle
const url = window.location.search

//récupère les paramètres de la page actuelle
const params = new URLSearchParams(url);

//récupère l'id contenu dans l'url et transforme l'id en int via parseint
const idUrl = parseInt(params.get("idTopic"));

const boutonRecherche = document.getElementById('btn-rechercher')
const inputRecherche = document.getElementById('search-input')
const topicsList = document.getElementById('topics-list')
const formulaireRecherche = inputRecherche ? inputRecherche.closest('form') : null

if (formulaireRecherche) {
    formulaireRecherche.addEventListener('submit', rechercherTopic)
} else if (boutonRecherche) {
    boutonRecherche.addEventListener('click', rechercherTopic)
}

if (inputRecherche) {
    inputRecherche.addEventListener('input', rechercherTopic)
}


const token = sessionStorage.getItem('token');


const formulaireReponse = document.getElementById('new-reply-form');


if (!token) {

    if (formulaireReponse) {
        formulaireReponse.style.display = 'none';
    }
}
async function afficherTopic() {
    // 1. On récupère le paramètre de tri dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const tri = urlParams.get('tri') || 'desc';

    if (isNaN(idUrl)) {
        window.location.href = '/topics';
        return;
    }

    try {
        // 2. UN SEUL FETCH qui inclut le paramètre ?tri=
        const reponse = await fetch(`/api/afficherTopic/${idUrl}?tri=${tri}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const donnees = await reponse.json();
        console.log(donnees);

        if (reponse.ok) {
            console.log('Réussite d\'affichage de la page');

            const titreTopic = document.getElementById('topic-title');
            const contenuTopic = document.getElementById('topic-body');
            titreTopic.textContent = donnees.topic.titre;
            contenuTopic.textContent = donnees.topic.contenu;

            // Affichage du score
            const affichageScore = document.getElementById('topic-score');
            if (affichageScore) {
                affichageScore.textContent = donnees.topic.score;
            }

            // Gestion de la suppression du topic
            const actionsFooter = document.querySelector('.topic-actions');
            if (sessionStorage.getItem('pseudo') === donnees.topic.pseudo) {
                const boutonSupprimerTopic = document.createElement('button');
                boutonSupprimerTopic.textContent = 'Supprimer le topic';
                boutonSupprimerTopic.className = 'btn btn-ghost btn-danger';
                boutonSupprimerTopic.onclick = () => supprimerTopic(idUrl);

                if (actionsFooter) {
                    actionsFooter.appendChild(boutonSupprimerTopic);
                }
            }

            // Affichage des commentaires
            const listeCommentaire = document.getElementById('comments-list');

            donnees.messages.forEach(msg => {
                const divMessage = document.createElement("div");
                divMessage.className = "comment-card";
                const dateObj = new Date(msg.dateDeCreation);
                const dateLisible = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                const heureLisible = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');

                divMessage.innerHTML = `
    <div class="comment-body">${msg.contenu}</div>
    <div class="comment-meta" style="display: flex; align-items: center; gap: 8px;">
        Par <strong>${msg.pseudo}</strong> 
        <span style="color: var(--text-dim, #888); font-size: 0.9em;">• le ${dateLisible} à ${heureLisible}</span>
    </div>
`;

                const pseudoConnecte = sessionStorage.getItem('pseudo');
                if (pseudoConnecte === msg.pseudo) {
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
        console.error('Erreur de connexion :', erreur);
        afficherErreur('Erreur réseau, veuillez réessayer.');
    }
}

async function publierMessage(e) {
    e.preventDefault()
    const message = document.getElementById('reply-text')
    const contenuMessage = message.value
    const jeton = sessionStorage.getItem('token')
    try {
        // On envoie les données à l'API en POST au format JSON
        const reponse = await fetch('/api/creerMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jeton },
            // On convertit l'objet JS en JSON pour l'envoyer
            body: JSON.stringify({ message: contenuMessage, idTopic: idUrl })
        })

        const donnees = await reponse.json()

        if (reponse.ok) {
            // On actualise la page pour voir le nouveau message 
            window.location.reload()
        } else {
            // On affiche le message d'erreur renvoyé par le serveur
            afficherErreur(donnees.message)
        }
    } catch (erreur) {
        // On affiche une erreur générique si le fetch échoue (réseau, serveur down...)
        console.error('Erreur de connexion :', erreur)
        afficherErreur('Erreur réseau, veuillez réessayer.')
    }

}

// Fonction pour créer un nouveau topic (utilisée sur create-topic.html)
// On initialise les variables seulement si on est sur la page create-topic
let titre = null
let contenu = null

if (document.getElementById('titreTopic')) {
    titre = document.getElementById('titreTopic')
    contenu = document.getElementById('contenuTopic')
    const boutonPublier = document.getElementById('boutonPublier')

    if (boutonPublier) {
        boutonPublier.addEventListener("click", publier);
    }
}

async function publier() {
    const contenuTitre = titre.value
    const contenuTopic = contenu.value
    const jeton = sessionStorage.getItem('token')
    let idTag = 0
    if (document.querySelector('input[name="idTag"]:checked')) {
        idTag = document.querySelector('input[name="idTag"]:checked').value
    }

    try {
        // On envoie les données à l'API en POST au format JSON
        const reponse = await fetch('/api/creerTopic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jeton },
            // On convertit l'objet JS en JSON pour l'envoyer
            body: JSON.stringify({ titre: contenuTitre, contenu: contenuTopic, tags: idTag })
        })

        const donnees = await reponse.json()

        if (reponse.ok) {
            // On redirige vers la page du topic qui vient d'être créé
            window.location.href = '/topicTemplate?idTopic=' + donnees.id
        } else {
            // On affiche le message d'erreur renvoyé par le serveur
            afficherErreur(donnees.message)
        }
    } catch (erreur) {
        // On affiche une erreur générique si le fetch échoue (réseau, serveur down...)
        console.error('Erreur de connexion :', erreur)
        afficherErreur('Erreur réseau, veuillez réessayer.')
    }
}

// Fonction utilitaire pour afficher les messages d'erreur
function afficherErreur(message) {
    // On récupère la boite de message déjà présente dans le HTML
    const boite = document.getElementById('boiteMessage')

    if (boite) {
        // On ajoute la classe d'erreur pour le style
        boite.classList.add('message-erreur')
        // On affiche la boite — elle est cachée par défaut
        boite.style.display = 'block'
        // On utilise textContent — jamais innerHTML avec des données externes
        boite.textContent = message
    } else {
        // Fallback en cas d'absence de la boîte
        console.error('Message d\'erreur:', message)
    }
}

function formaterDate(dateString) {
    if (!dateString) {
        return 'Aujourd\'hui'
    }

    const date = new Date(dateString)
    const options = { day: 'numeric', month: 'long' }
    return date.toLocaleDateString('fr-FR', options)
}

function creerCarteTopic(topic, index) {
    const topicCard = document.createElement('a')
    topicCard.className = 'topic-card'

    topicCard.href = '/topicTemplate?idTopic=' + (topic.idTopic || topic.id)

    topicCard.style.textDecoration = 'none'
    topicCard.style.color = 'inherit'
    topicCard.style.display = 'flex'

    const numero = document.createElement('div')
    numero.className = 'topic-card-num'
    numero.textContent = '#' + (index + 1)

    const cardBody = document.createElement('div')
    cardBody.className = 'topic-card-body'

    const meta = document.createElement('div')
    meta.className = 'topic-card-meta'

    const badge = document.createElement('span')
    badge.className = 'badge badge-open'
    badge.textContent = 'Ouvert'

    const tag = document.createElement('span')
    tag.className = 'tag tag-sm'
    tag.textContent = 'Forum'

    meta.appendChild(badge)
    meta.appendChild(tag)

    const info = document.createElement('div')
    info.className = 'topic-card-info'
    info.innerHTML = `${topic.pseudo || 'Anonyme'} <span class="sep">•</span> ${formaterDate(topic.dateDeCreation)}`

    const titleBlock = document.createElement('div')
    titleBlock.className = 'topic-card-title'
    titleBlock.textContent = topic.titre || 'Topic sans titre'

    cardBody.appendChild(meta)
    cardBody.appendChild(titleBlock)
    cardBody.appendChild(info)

    const arrow = document.createElement('div')
    arrow.className = 'topic-card-arrow'
    arrow.textContent = '→'

    topicCard.appendChild(numero)
    topicCard.appendChild(cardBody)
    topicCard.appendChild(arrow)




    return topicCard
}

async function afficherTopics() {
    if (!topicsList) {
        return
    }

    try {
        const reponse = await fetch('/api/topics', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })

        const topics = await reponse.json()

        if (!reponse.ok) {
            afficherErreur(topics.message || 'Impossible de charger les topics.')
            return
        }

        topicsList.innerHTML = ''

        if (topics.length === 0) {
            topicsList.innerHTML = '<p class="empty-state">Aucun topic disponible pour le moment.</p>'
            return
        }

        topics.forEach((topic, index) => {
            topicsList.appendChild(creerCarteTopic(topic, index))
        })
    } catch (erreur) {
        console.error('Erreur de chargement des topics :', erreur)
        topicsList.innerHTML = '<p class="message-erreur">Impossible de charger les topics.</p>'
    }
}

if (document.getElementById('topics-list')) {
    afficherTopics()
}

if (document.getElementById('topic-title')) {
    afficherTopic()

    if (document.getElementById('boutonPublier')) {
        const boutonPublier = document.getElementById('boutonPublier')
        boutonPublier.addEventListener("click", publierMessage)
    }
}


async function rechercherTopic(e) {
    if (e) {
        e.preventDefault()
    }

    if (!inputRecherche || !topicsList) {
        return
    }

    const recherche = inputRecherche.value.trim()
    console.log("Recherche :", recherche)

    if (!recherche) {
        afficherTopics()
        return
    }

    try {
        const reponse = await fetch(
            `/api/rechercheTopic?recherche=${encodeURIComponent(recherche)}`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        )


        const topics = await reponse.json()


        topicsList.innerHTML = ''

        if (!reponse.ok) {
            afficherErreur(topics.message || 'Erreur lors de la recherche.')
            return
        }

        if (topics.length === 0) {
            topicsList.innerHTML =
                '<p class="empty-state">Aucun résultat trouvé.</p>'
            return
        }

        topics.forEach((topic, index) => {
            topicsList.appendChild(creerCarteTopic(topic, index))
        })

    } catch (erreur) {
        console.error(erreur)
        afficherErreur('Erreur lors de la recherche.')
    }
}


async function triTopic() { }

async function supprimerMessage(idMessage) {
    if (!confirm("Voulez-vous vraiment supprimer ce message ?")) {
        return;
    }

    try {
        const reponse = await fetch(`/api/supprimerMessage/${idMessage}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',

                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            }
        });

        const donnees = await reponse.json();

        if (reponse.ok) {
            window.location.reload();
        } else {
            alert("Erreur : " + donnees.message);
        }
    } catch (erreur) {
        console.error("Erreur lors de la suppression :", erreur);
        alert("Une erreur réseau est survenue.");
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
        console.error("Erreur :", erreur);
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

        const donnees = await reponse.json();

        if (reponse.ok) {

            window.location.reload();
        } else {

            alert("Erreur : " + donnees.message);
        }

    } catch (erreur) {
        console.error("Erreur d'envoi du vote :", erreur);
        alert("Erreur réseau lors de l'envoi du vote.");
    }
}

function changerTri(valeur) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('tri', valeur);
    window.location.search = urlParams.toString();
}

document.addEventListener('DOMContentLoaded', () => {
    const selectTri = document.getElementById('tri-messages');
    if (selectTri) {
        selectTri.value = new URLSearchParams(window.location.search).get('tri') || 'desc';
    }
})