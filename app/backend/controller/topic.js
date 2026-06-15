const db = require('../database/connexiondb.js');

exports.listerTopics = async (req, res, next) => {
    const tagSelectionne = req.query.tag;
    const page = parseInt(req.query.page) || 1;
    const tri = req.query.tri || 'recents';
    const limite = 10;
    const offset = (page - 1) * limite;

    try {
        let sql = `
            SELECT 
                Topic.idTopic, 
                Topic.titre, 
                Topic.contenu, 
                Topic.dateDeCreation, 
                Topic.etat, 
                Utilisateur.pseudo,
                Tag.nom AS nomTag,
                COALESCE(SUM(Evaluer.vote), 0) AS scoreTotal
            FROM Topic
            LEFT JOIN Utilisateur ON Topic.idUtilisateur = Utilisateur.idUtilisateur
            LEFT JOIN Appartenir ON Topic.idTopic = Appartenir.idTopic
            LEFT JOIN Tag ON Appartenir.idTag = Tag.idTag
            LEFT JOIN Evaluer ON Topic.idTopic = Evaluer.idTopic
        `;
        const parametresSQL = [];

        if (tagSelectionne && tagSelectionne !== '') {
            sql += ` WHERE Appartenir.idTag = ? `;
            parametresSQL.push(tagSelectionne);
        }

        sql += ` GROUP BY Topic.idTopic, Utilisateur.pseudo, Tag.nom `;

        // Gestion du tri (Récents ou Populaires)
        if (tri === 'populaires') {
            sql += ` ORDER BY scoreTotal DESC, Topic.dateDeCreation DESC `;
        } else {
            sql += ` ORDER BY Topic.dateDeCreation DESC `;
        }

        sql += ` LIMIT ? OFFSET ?`;
        parametresSQL.push(limite, offset);

        const [resultat] = await db.query(sql, parametresSQL);
        return res.status(200).json(resultat);
    } catch (erreur) {
        next(erreur);
    }
};

exports.creerTopic = async (req, res, next) => {
    const titre = req.body.titre;
    const contenu = req.body.contenu;
    const idUtilisateur = req.auth.id;
    const tags = req.body.tags;

    if (!titre || !contenu) {
        return res.status(400).json({ message: 'Champs requis manquants.' });
    }

    try {
        const [existant] = await db.query('SELECT idTopic FROM Topic WHERE titre = ?', [titre]);
        if (existant.length > 0) {
            return res.status(409).json({ message: 'Un topic avec ce titre existe déjà.' });
        }

        const sql = `INSERT INTO Topic (titre, contenu, idUtilisateur, dateDeCreation) VALUES (?, ?, ?, NOW())`;
        const sqlAppartenir = `INSERT INTO Appartenir (idTopic, idTag) VALUES (?, ?)`;

        const [resultat] = await db.query(sql, [titre, contenu, idUtilisateur]);
        await db.query(sqlAppartenir, [resultat.insertId, tags]);

        res.status(201).json({ message: 'Publication du topic réussie !', id: resultat.insertId });
    } catch (erreur) {
        next(erreur);
    }
};

exports.afficherTopic = async (req, res, next) => {
    const idTopic = req.params.idTopic;
    try {
        // On récupère le topic AVEC son tag
        const sqlTopic = `
            SELECT Topic.*, Utilisateur.pseudo, Tag.nom AS nomTag
            FROM Topic
            LEFT JOIN Utilisateur ON Topic.idUtilisateur = Utilisateur.idUtilisateur
            LEFT JOIN Appartenir ON Topic.idTopic = Appartenir.idTopic
            LEFT JOIN Tag ON Appartenir.idTag = Tag.idTag
            WHERE Topic.idTopic = ?
        `;
        const [topics] = await db.query(sqlTopic, [idTopic]);

        if (topics.length === 0) {
            return res.status(404).json({ message: "Topic introuvable." });
        }

        // On récupère les messages liés
        const sqlMessages = `
            SELECT Message.*, Utilisateur.pseudo 
            FROM Message 
            LEFT JOIN Utilisateur ON Message.idUtilisateur = Utilisateur.idUtilisateur
            WHERE idTopic = ? 
            ORDER BY dateDeCreation ASC
        `;
        const [messages] = await db.query(sqlMessages, [idTopic]);

        res.status(200).json({ topic: topics[0], messages: messages });
    } catch (erreur) {
        next(erreur);
    }
};

exports.creerMessage = async (req, res, next) => {
    const idTopic = req.body.idTopic;
    const contenu = req.body.message;
    const idUtilisateur = req.auth.id;

    if (!contenu) {
        return res.status(400).json({ message: 'Champs requis manquants.' });
    }

    try {
        const sql = `INSERT INTO Message (contenu, idUtilisateur, idTopic, dateDeCreation) VALUES (?, ?, ?, NOW())`;
        const [resultat] = await db.query(sql, [contenu, idUtilisateur, idTopic]);
        res.status(201).json({ message: 'Publication du message réussie !', id: resultat.insertId });
    } catch (erreur) {
        next(erreur);
    }
};

exports.rechercheTopics = async (req, res, next) => {
    const recherche = req.query.recherche;

    if (!recherche) {
        return res.status(400).json({ message: "Veuillez saisir un terme de recherche." });
    }

    try {
        const rechercheMinuscule = recherche.toLowerCase();
        const sql = `
            SELECT Topic.idTopic, Topic.titre, Topic.contenu, Topic.dateDeCreation, Topic.etat, Utilisateur.pseudo
            FROM Topic
            LEFT JOIN Utilisateur ON Topic.idUtilisateur = Utilisateur.idUtilisateur
            WHERE LOWER(Topic.titre) LIKE ? OR LOWER(Topic.contenu) LIKE ?
            ORDER BY Topic.dateDeCreation DESC
        `;
        const [resultat] = await db.query(sql, [`%${rechercheMinuscule}%`, `%${rechercheMinuscule}%`]);
        res.status(200).json(resultat);
    } catch (erreur) {
        next(erreur);
    }
};

exports.supprimerMessage = async (req, res, next) => {
    const idMessage = req.params.idMessage;
    const idUtilisateurConnecte = req.auth.id;

    try {
        const [resultat] = await db.query('SELECT idUtilisateur FROM Message WHERE idMessage = ?', [idMessage]);
        if (resultat.length === 0) return res.status(404).json({ message: 'Message introuvable.' });

        const [utilisateur] = await db.query('SELECT typeCompte FROM Utilisateur WHERE idUtilisateur = ?', [idUtilisateurConnecte]);
        const estAdmin = utilisateur[0].typeCompte === 'admin';
        const estProprietaire = resultat[0].idUtilisateur === idUtilisateurConnecte;

        if (!estProprietaire && !estAdmin) {
            return res.status(403).json({ message: "Action non autorisée." });
        }

        await db.query('DELETE FROM Message WHERE idMessage = ?', [idMessage]);
        res.status(200).json({ message: 'Message supprimé avec succès.' });
    } catch (erreur) {
        next(erreur);
    }
};

exports.supprimerTopic = async (req, res, next) => {
    const idTopic = req.params.idTopic;
    const idUtilisateurConnecte = req.auth.id;

    try {
        const [resultat] = await db.query('SELECT idUtilisateur FROM Topic WHERE idTopic = ?', [idTopic]);
        if (resultat.length === 0) return res.status(404).json({ message: 'Topic introuvable.' });

        const [utilisateur] = await db.query('SELECT typeCompte FROM Utilisateur WHERE idUtilisateur = ?', [idUtilisateurConnecte]);
        const estAdmin = utilisateur[0].typeCompte === 'admin';
        const estProprietaire = resultat[0].idUtilisateur === idUtilisateurConnecte;

        if (!estProprietaire && !estAdmin) {
            return res.status(403).json({ message: "Action non autorisée." });
        }

        await db.query('DELETE FROM Topic WHERE idTopic = ?', [idTopic]);
        res.status(200).json({ message: 'Topic supprimé avec succès.' });
    } catch (erreur) {
        next(erreur);
    }
};

exports.likerTopic = async (req, res, next) => {
    const idTopic = req.params.idTopic;
    const vote = req.body.vote;
    const idUtilisateurConnecte = req.auth.userId || req.auth.id;

    if (vote !== 1 && vote !== -1) {
        return res.status(400).json({ message: "Le vote doit être +1 ou -1." });
    }

    try {
        const sql = `
            INSERT INTO Evaluer (idUtilisateur, idTopic, vote)
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE vote = ?
        `;
        await db.query(sql, [idUtilisateurConnecte, idTopic, vote, vote]);
        res.status(200).json({ message: "Vote enregistré avec succès !" });
    } catch (erreur) {
        next(erreur);
    }
};

exports.modifierTopic = async (req, res) => {
    const idTopic = req.params.idTopic;
    const { titre, contenu } = req.body;

    if (!titre || !contenu) {
        return res.status(400).json({ message: "Le titre et le contenu sont obligatoires." });
    }

    try {
        await db.query(
            'UPDATE Topic SET titre = ?, contenu = ? WHERE idTopic = ?',
            [titre, contenu, idTopic]
        );

        return res.status(200).json({ message: "Topic modifié avec succès." });
    } catch (erreur) {
        console.error("Erreur lors de la modification :", erreur);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
};