//récupère l'url de la page actuelle
const url = window.location.search

//récupère les paramètres de la page actuelle
const params = new URLSearchParams(url);

//récupère l'id contenu dans l'url et transforme l'id en int via parseint
const idUrl = parseInt(params.get("idTopic"));


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

        if (reponse.ok) {
            console.log('Réussite d\'affichage de la page')
            const titreTopic = document.getElementById('topic-title')
            const contenuTopic = document.getElementById('topic-body')
            titreTopic.textContent = donnees.topic.titre
            contenuTopic.textContent = donnees.topic.contenu

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
if (document.getElementById('topic-title')) {
    afficherTopic()

    if (document.getElementById('boutonPublier')) {
        const boutonPublier = document.getElementById('boutonPublier')
        boutonPublier.addEventListener("click", publierMessage)
    }
}

