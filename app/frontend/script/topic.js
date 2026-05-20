const boutonconnexion = document.getElementById('boutonconnexion')
const pseudo = sessionStorage.getItem('pseudo')
const titre = document.getElementById('titreTopic')
const contenu = document.getElementById('contenuTopic')
const boutonPublier = document.getElementById('boutonPublier')

boutonPublier.addEventListener("click", publier);

async function publier() {
    const contenuTitre = titre.value
    const contenuTopic = contenu.value
    const jeton = sessionStorage.getItem('token')


    try {
        // On envoie les données à l'API en POST au format JSON
        const reponse = await fetch('/api/topics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jeton },
            // On convertit l'objet JS en JSON pour l'envoyer
            body: JSON.stringify({ titre: contenuTitre, contenu: contenuTopic })
        })


        const donnees = await reponse.json()

        if (reponse.ok) {

            // On redirige vers la page du topic qui vient d'être créé*/
            window.location.href = '/topic?id=' + donnees.id

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