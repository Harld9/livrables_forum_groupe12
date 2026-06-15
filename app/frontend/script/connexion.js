const formulaire = document.getElementById('formConnexion')

formulaire.addEventListener('submit', async (event) => {
    event.preventDefault()

    const identifiant = document.getElementById('identifiant').value
    const mdp = document.getElementById('mdp').value

    try {
        const reponse = await fetch('/api/connexion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: identifiant, motDePasse: mdp })
        })

        const donnees = await reponse.json()

        if (reponse.ok) {
            sessionStorage.setItem('token', donnees.token)
            sessionStorage.setItem('pseudo', donnees.pseudo)
            sessionStorage.setItem('typeCompte', donnees.typeCompte);
            window.location.href = '/'
        } else {
            afficherErreur(donnees.message)
        }

    } catch (erreur) {
        console.error('Erreur de connexion :', erreur)
        afficherErreur('Erreur réseau, veuillez réessayer.')
    }
})

function afficherErreur(message) {
    const boite = document.getElementById('boiteMessage')
    if (boite) {
        boite.classList.add('message-erreur')
        boite.style.display = 'block'
        boite.textContent = message
    } else {
        console.error("Erreur :", message)
    }
}