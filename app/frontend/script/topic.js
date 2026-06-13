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


async function afficherTopic() {

    if (isNaN(idUrl)) {
        window.location.href = '/topics'
        return
    }

    try {
        // On demande les données à l'API en GET au format JSON
        const reponse = await fetch(`/api/afficherTopic/${idUrl}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })

        const donnees = await reponse.json()
        console.log(donnees)
        if (reponse.ok) {
            console.log('Réussite d\'affichage de la page')
            const titreTopic = document.getElementById('topic-title')
            const contenuTopic = document.getElementById('topic-body')
            titreTopic.textContent = donnees.topic.titre
            contenuTopic.textContent = donnees.topic.contenu
            listeCommentaire = document.getElementById('comments-list')
            donnees.messages.forEach(reponse => {
                const divMessage = document.createElement("div")
                divMessage.textContent = reponse.contenu + " - " + reponse.pseudo
                listeCommentaire.appendChild(divMessage)
            });

        } else {
            afficherErreur(donnees.message)
            // On redirige vers la page générale des topics*/
            window.location.href = '/topics'
        }

    }

    catch (erreur) {
        // On affiche une erreur générique si le fetch échoue (réseau, serveur down...)
        console.error('Erreur de connexion :', erreur)
        afficherErreur('Erreur réseau, veuillez réessayer.')
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
    try {
        // On envoie les données à l'API en POST au format JSON
        const reponse = await fetch('/api/creerTopic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jeton },
            // On convertit l'objet JS en JSON pour l'envoyer
            body: JSON.stringify({ titre: contenuTitre, contenu: contenuTopic })
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
    const topicCard = document.createElement('div')
    topicCard.className = 'topic-card'

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

    const titleBlock = document.createElement('div')
    titleBlock.className = 'topic-card-title'

    const titleLink = document.createElement('a')
    titleLink.href = '/topicTemplate?idTopic=' + topic.idTopic
    titleLink.textContent = topic.titre || 'Topic sans titre'

    titleBlock.appendChild(titleLink)

    const info = document.createElement('div')
    info.className = 'topic-card-info'
    info.innerHTML = `${topic.pseudo || 'Anonyme'} <span class="sep">•</span> ${formaterDate(topic.dateDeCreation)}`

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
