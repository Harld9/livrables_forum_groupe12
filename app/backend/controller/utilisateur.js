// Import de crypto natif à node.js pour hacher les mots de passe
const crypto = require('crypto')

// ===== Inscription =====
exports.inscrireClient = async (req, res) => {

    // On récupère les données envoyées par le formulaire d'inscription
    // Les noms correspondent aux id des inputs dans inscription.html
    const pseudo = req.body.pseudo
    const email = req.body.email
    const motDePasse = req.body.mdp

    try {
        // On vérifie si un compte existe déjà avec cet email
        // pour éviter les doublons en base de données
        const [existant] = await db.query(
            'SELECT IdClient FROM Client WHERE Mail = ?', [email]
        )

        // Si on trouve un résultat, on refuse l'inscription avec un code 409 (conflit)
        if (existant.length > 0) {
            return res.status(409).json({ message: 'Cet email est déjà utilisé.' })
        }

        // On hache le mot de passe avant de le stocker
        //createHash créé une instance de hachage, .update injecte le mot de passe
        //.digest verrouille le calcul en le convertissant en hexadécimal
        crypto.createHash('sha512').update(motDePasse).digest('hex')

        // On prépare la requête d'insertion
        // On utilise des ? pour éviter les injections SQL
        const sql = `
            INSERT INTO Client (pseudo, email, motDePasse)
            VALUES (?, ?, ?)
        `

        // On envoie la requête à la base de données avec les valeurs dans le bon ordre
        await db.query(sql, [pseudo, , email, motDePasseHache])

        // On confirme que l'inscription s'est bien passée avec un code 201 (créé)
        res.status(201).json({ message: 'Inscription réussie !' })

    } catch (erreur) {
        // On affiche l'erreur dans le terminal pour déboguer
        console.error(erreur)
        // On informe le client qu'une erreur s'est produite côté serveur
        res.status(500).json({ message: "Erreur lors de l'inscription." })
    }
}