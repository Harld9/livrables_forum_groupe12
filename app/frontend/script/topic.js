//récupère l'url de la page actuelle
const url = window.location.search

//récupère les paramètres de la page actuelle
const params = new URLSearchParams(url);

//récupère l'id contenu dans l'url et transforme l'id en int via parseint
const idUrl = parseInt(params.get("idTopic"));

async function afficherTopic() {
    try {
        // On demande les données à l'API en GET au format JSON
        const reponse = await fetch(`/api/afficherTopic/${idUrl}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })

        const donnees = await reponse.json()

        if (reponse.ok) {
            console.log('Réussite d\'affichage de la page')
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