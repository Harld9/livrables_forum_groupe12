const db = require('../database/connexiondb.js')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.inscrireClient = async (req, res) => {
    const { pseudo, email, motDePasse } = req.body;

    if (!pseudo || !email || !motDePasse) {
        return res.status(400).json({ message: "Veuillez remplir tous les champs." });
    }

    try {
        const [existant] = await db.query('SELECT idUtilisateur FROM Utilisateur WHERE email = ? OR pseudo = ?', [email, pseudo]);

        if (existant.length > 0) {
            return res.status(409).json({ message: "Ce pseudo ou cet email est déjà utilisé." });
        }

        const motDePasseHache = await bcrypt.hash(motDePasse, 10);

        const sql = `INSERT INTO Utilisateur (pseudo, email, motDePasse) VALUES (?, ?, ?)`;
        await db.query(sql, [pseudo, email, motDePasseHache]);

        return res.status(201).json({ message: "Inscription réussie !" });

    } catch (erreur) {
        console.error(erreur);
        return res.status(500).json({ message: "Erreur lors de l'inscription." });
    }
};

exports.connecterClient = async (req, res) => {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
        return res.status(400).json({ message: "Veuillez renseigner votre identifiant et mot de passe." });
    }

    try {
        const sql = `SELECT * FROM Utilisateur WHERE email = ? OR pseudo = ?`;
        const [utilisateurs] = await db.query(sql, [email, email]);

        if (utilisateurs.length === 0) {
            return res.status(401).json({ message: "Identifiant ou mot de passe incorrect." });
        }

        const utilisateur = utilisateurs[0];

        if (!utilisateur.motDePasse) {
            return res.status(500).json({ message: "Erreur interne du serveur." });
        }

        const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);

        if (!motDePasseValide) {
            return res.status(401).json({ message: "Identifiant ou mot de passe incorrect." });
        }

        const token = jwt.sign(
            { id: utilisateur.idUtilisateur },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            message: "Connexion réussie !",
            token: token,
            pseudo: utilisateur.pseudo
        });

    } catch (erreur) {
        console.error(erreur);
        return res.status(500).json({ message: "Erreur lors de la connexion." });
    }
};

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