// On importe la connexion à la base de données
const db = require('../database/connexiondb.js')
const jwt = require('jsonwebtoken');

// Import de crypto natif à node.js pour hacher les mots de passe
const crypto = require('crypto')

// ===== Inscription =====
exports.inscrireClient = async (req, res) => {

    const pepper = process.env.PEPPER

    // On récupère les données envoyées par le formulaire d'inscription
    // Les noms correspondent aux id des inputs dans inscription.html
    const pseudo = req.body.pseudo
    const email = req.body.email
    const motDePasse = req.body.motDePasse

    const mdpRegex = /^(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
    const pseudoRegex = /^[a-zA-Z0-9_-]{3,12}$/

    if (!pseudo || !email || !motDePasse) {
        return res.status(400).json({ message: 'Champs requis manquants.' })
    }

    if (!mdpRegex.test(motDePasse)) {
        return res.status(400).json({ message: 'Le mot de passe doit contenir au minimum 8 caractères, 1 majuscule, 1 chiffre et un caractère spécial' })
    }

    if (!pseudoRegex.test(pseudo)) {
        return res.status(400).json({ message: 'Le pseudo ne peut contenir que des caractères latins et avoir entre 3 et 12 caractères' })
    }

    try {
        // On vérifie si un compte existe déjà avec cet email
        // pour éviter les doublons en base de données
        const [existant] = await db.query(
            'SELECT idUtilisateur FROM Utilisateur WHERE email = ?', [email]
        )

        // Si on trouve un résultat, on refuse l'inscription avec un code 409 (conflit)
        if (existant.length > 0) {
            return res.status(409).json({ message: 'Cet email est déjà utilisé.' })
        }

        const sel = crypto.randomBytes(16).toString('hex');

        // On hache le mot de passe avant de le stocker
        //.digest verrouille le calcul en le convertissant en hexadécimal
        const hash = crypto.createHmac('sha512', sel).update(motDePasse + pepper).digest('hex')


        const motDePasseHache = sel + ':' + hash;

        // On prépare la requête d'insertion
        // On utilise des ? pour éviter les injections SQL
        const sql = `
            INSERT INTO Utilisateur (pseudo, email, motDePasse, dateDeCreation)
            VALUES (?, ?, ?, CURDATE())
        `

        // On envoie la requête à la base de données avec les valeurs dans le bon ordre
        await db.query(sql, [pseudo, email, motDePasseHache])

        // On confirme que l'inscription s'est bien passée avec un code 201 (créé)
        res.status(201).json({ message: 'Inscription réussie !' })

    } catch (erreur) {
        // On affiche l'erreur dans le terminal pour déboguer
        console.error(erreur)
        // On informe le client qu'une erreur s'est produite côté serveur
        res.status(500).json({ message: "Erreur lors de l'inscription." })
    }
}

// ===== Connexion =====
exports.connecterClient = async (req, res) => {
    const motDePasse = req.body.mdp
    const identifiant = req.body.identifiant
    const pepper = process.env.PEPPER

    if (!identifiant || !motDePasse) {
        return res.status(400).json({ message: 'Email et mot de passe requis.' })
    }

    try {
        const [resultat] = await db.query(
            'SELECT idUtilisateur, pseudo, motDePasse FROM Utilisateur WHERE email = ? OR pseudo = ?',
            [identifiant, identifiant]
        )

        if (resultat.length === 0) {
            return res.status(401).json({ message: 'Identifiants invalides.' })
        }

        const utilisateur = resultat[0]
        const sel = utilisateur.motDePasse.split(':')[0]
        const motDePasseHache = utilisateur.motDePasse.split(':')[1]
        const motDePasseRehache = crypto.createHmac('sha512', sel).update(motDePasse + pepper).digest('hex')

        if (motDePasseHache !== motDePasseRehache) {
            return res.status(401).json({ message: 'Identifiants invalides.' })
        }

        // On crée un jeton JWT signé avec les infos de l'utilisateur
        // Ce jeton sera stocké côté client pour identifier l'utilisateur sur les prochaines requêtes.
        const jeton = jwt.sign(
            { id: utilisateur.idUtilisateur, pseudo: utilisateur.pseudo }, // on embarque l'id et le prénom
            process.env.CLEJWT,  // on utilise la clé secrète du .env — jamais en dur dans le code
            { expiresIn: '24h' } // on expire le jeton après 24h pour la sécurité
        )

        return res.status(200).json({
            message: 'Connexion réussie.',
            idUtilisateur: utilisateur.idUtilisateur,
            pseudo: utilisateur.pseudo,
            token: jeton
        })

    } catch (erreur) {
        console.error(erreur)
        return res.status(500).json({ message: 'Erreur lors de la connexion.' })
    }
}

// ===== Récupération utilisateur =====
exports.getUtilisateurById = async (req, res) => {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: 'ID utilisateur invalide.' })
    }

    try {
        const [resultat] = await db.query(
            'SELECT idUtilisateur, pseudo, email, dateDeCreation, typeCompte, photoDeProfil, Biographie, derniereConnexion FROM Utilisateur WHERE idUtilisateur = ?',
            [id]
        )

        if (resultat.length === 0) {
            return res.status(404).json({ message: 'Utilisateur introuvable.' })
        }

        return res.status(200).json(resultat[0])
    } catch (erreur) {
        console.error(erreur)
        return res.status(500).json({ message: 'Erreur lors de la récupération utilisateur.' })
    }
}