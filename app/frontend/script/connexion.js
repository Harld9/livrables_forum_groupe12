/*
 * On gère ici toute la logique du formulaire de connexion côté front.
 * On récupère les identifiants saisis, on les envoie à l'API et on stocke le token JWT.
 * On redirige vers l'accueil si la connexion réussit.
 */

// On récupère le formulaire de connexion
const formulaire = document.getElementById('formConnexion')

// On attend que le formulaire soit soumis
formulaire.addEventListener('submit', async (event) => {

    // On empêche le rechargement de la page — comportement par défaut du formulaire HTML
    event.preventDefault()

    // On récupère les valeurs saisies dans les inputs
    const email = document.getElementById('email').value
    const mdp = document.getElementById('mdp').value
    //const rememberMe = document.getElementById('rememberMe').checked // Pour plus tard

    try {
        // On envoie les identifiants à l'API en POST au format JSON
        // On utilise une URL relative — fonctionne quel que soit le port ou l'environnement
        const reponse = await fetch('/api/connexion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // On convertit l'objet JS en JSON
            // Les clés correspondent exactement à req.body.email et req.body.mdp dans le controller
            body: JSON.stringify({ email, mdp })
        })

        // On convertit la réponse HTTP brute en objet JS
        const donnees = await reponse.json()

        if (reponse.ok) {
            // On redirige vers l'accueil après connexion réussie*/
            window.location.href = '/'
        }

        else {
            // On affiche le message d'erreur renvoyé par le serveur
            afficherErreur(donnees.message)
        }

    } catch (erreur) {
        // On affiche une erreur générique si le fetch échoue (réseau, serveur down...)
        console.error('Erreur de connexion :', erreur)
        afficherErreur('Erreur réseau, veuillez réessayer.')
    }
})

// ===== Fonction utilitaire =====
// On affiche un message d'erreur dans la boite prévue à cet effet dans le HTML
function afficherErreur(message) {

    // On récupère la boite de message déjà présente dans le HTML
    // const boite = document.getElementById('boiteMessage')

    // On ajoute la classe d'erreur pour le style
    // boite.classList.add('message-erreur')

    // On affiche la boite — elle est cachée par défaut via .boitemessagecache
    //boite.style.display = 'block'

    // On utilise textContent — jamais innerHTML avec des données externes
    // boite.textContent = message
}