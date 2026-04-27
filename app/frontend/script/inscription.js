/*
 * On gère ici toute la logique du formulaire d'inscription côté front.
 * On récupère les données saisies, on les valide, puis on les envoie à l'API.
 * On redirige vers la page de connexion si l'inscription réussit.
 */

// On attend que le formulaire soit soumis
document.getElementById('formInscription').addEventListener('submit', async (e) => {

    // On empêche le rechargement de la page — comportement par défaut du formulaire HTML
    e.preventDefault()

    // On récupère les valeurs saisies dans chaque input
    const email = document.getElementById('email').value
    const pseudo = document.getElementById('pseudo').value
    const mdp = document.getElementById('mdp').value
    const mdpVerif = document.getElementById('mdpVerif').value

    // On vérifie que les deux mots de passe correspondent avant d'envoyer quoi que ce soit
    if (mdp !== mdpVerif) {
        afficherErreur('Les mots de passe ne correspondent pas.')
        return // on arrête l'exécution ici
    }

    try {
        // On envoie les données à l'API en POST au format JSON
        const reponse = await fetch('/api/inscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // On convertit l'objet JS en JSON pour l'envoyer
            body: JSON.stringify({ pseudo, email, mdp })
        })

        // On convertit la réponse HTTP en objet JS
        const data = await reponse.json()

        if (reponse.ok) {
            // On redirige vers la connexion si l'inscription a réussi
            window.location.href = '/connexion'
        } else {
            // On affiche le message d'erreur renvoyé par le serveur
            afficherErreur(data.message)
        }

    } catch (erreur) {
        // On affiche une erreur générique si le fetch échoue (pas de réseau, serveur down...)
        console.error(erreur)
        afficherErreur('Erreur réseau, veuillez réessayer.')
    }
})

// ===== Fonction utilitaire =====
// On crée ou met à jour le message d'erreur affiché dans le formulaire
function afficherErreur(message) {

    // On vérifie si un message d'erreur existe déjà pour ne pas en créer un deuxième
    let erreur = document.getElementById('erreur-inscription')

    if (!erreur) {
        // On crée l'élément s'il n'existe pas encore
        erreur = document.createElement('p')
        erreur.id = 'erreur-inscription'
        erreur.classList.add('message-erreur')

        // On insère le message juste avant les boutons du formulaire
        const boutons = document.querySelector('#formInscription button')
        boutons.parentNode.insertBefore(erreur, boutons)
    }

    // On utilise textContent — jamais innerHTML avec des données externes
    erreur.textContent = message
}