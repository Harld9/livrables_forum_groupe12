// On importe la connexion à la base de données
const db = require('../database/connexiondb.js')

exports.listerTopics = async (req, res) => {
    const tri = req.query.tri;
    const tag = req.query.tag;

    try {
        // Toutes les tables ont été passées en minuscules : topic, utilisateur, evaluer, tag, appartenir
        let sql = `
            SELECT t.idTopic, t.titre, t.contenu, t.dateDeCreation, t.etat, u.pseudo,
                   (SELECT IFNULL(SUM(vote), 0) FROM evaluer WHERE idTopic = t.idTopic) AS score,
                   (SELECT tg.nom FROM tag tg JOIN appartenir a2 ON tg.idTag = a2.idTag WHERE a2.idTopic = t.idTopic LIMIT 1) AS nomTag
            FROM topic t
            LEFT JOIN utilisateur u ON t.idUtilisateur = u.idUtilisateur
        `;

        const parametres = [];

        if (tag) {
            sql += ` JOIN appartenir a ON t.idTopic = a.idTopic WHERE a.idTag = ? `;
            parametres.push(tag);
        }

        if (tri === 'likes') {
            sql += ` ORDER BY score DESC, t.dateDeCreation DESC `;
        } else {
            sql += ` ORDER BY t.dateDeCreation DESC `;
        }

        const [resultat] = await db.query(sql, parametres);
        return res.status(200).json(resultat);

    } catch (erreur) {
        console.error(erreur);
        return res.status(500).json({ message: 'Erreur lors du chargement des topics.' });
    }
}

exports.creerTopic = async (req, res) => {
    const titre = req.body.titre;
    const contenu = req.body.contenu;
    const idUtilisateur = req.auth.id
    const tags = req.body.tags

    if (!titre || !contenu) {
        return res.status(400).json({ message: 'Champs requis manquants.' })
    }

    try {
        // On vérifie si un topic avec un titre identique existe
        // pour éviter les doublons en base de données
        const [existant] = await db.query(
            'SELECT idTopic FROM topic WHERE titre = ?', [titre]
        )

        // Si on trouve un résultat, on refuse la création du topic
        if (existant.length > 0) {
            return res.status(409).json({ message: 'Un topic avec ce titre, existe déjà.' })
        }

        // On prépare la requête d'insertion
        // On utilise des ? pour éviter les injections SQL
        const sql = `
            INSERT INTO topic (titre, contenu, idUtilisateur)
            VALUES (?, ?, ?)
        `

        const sqlAppartenir = `
            INSERT INTO appartenir (idTopic, idTag)
            VALUES (?, ?)
        `

        // On envoie la requête à la base de données avec les valeurs dans le bon ordre
        const [resultat] = await db.query(sql, [titre, contenu, idUtilisateur])

        // On envoie la requête à la base de données avec les valeurs dans le bon ordre
        const [resultatAppatenir] = await db.query(sqlAppartenir, [resultat.insertId, tags])

        // On confirme que l'inscription s'est bien passée avec un code 201 (créé) et on retourne l'id du topic
        res.status(201).json({ message: 'Publication du topic réussie !', id: resultat.insertId })



    } catch (erreur) {
        // On affiche l'erreur dans le terminal pour déboguer
        console.error(erreur)
        // On informe le client qu'une erreur s'est produite côté serveur
        res.status(500).json({ message: "Erreur lors de la publication du topic." })
    }
}


exports.afficherTopic = async (req, res) => {
    const idTopic = req.params.idTopic;

    try {
        // Correction de la casse ici aussi pour la page du topic seul
        const sqlTopic = `
            SELECT t.*, u.pseudo,
                   (SELECT IFNULL(SUM(vote), 0) FROM evaluer WHERE idTopic = t.idTopic) AS score,
                   (SELECT tg.nom FROM tag tg JOIN appartenir a2 ON tg.idTag = a2.idTag WHERE a2.idTopic = t.idTopic LIMIT 1) AS nomTag
            FROM topic t 
            JOIN utilisateur u ON t.idUtilisateur = u.idUtilisateur 
            WHERE t.idTopic = ?
        `;
        const [lignesTopic] = await db.query(sqlTopic, [idTopic]);

        if (lignesTopic.length === 0) {
            return res.status(404).json({ message: "Topic introuvable." });
        }

        const topicTrouve = lignesTopic[0];

        const ordreTri = req.query.tri === 'asc' ? 'ASC' : 'DESC';
        const sqlMessages = `
            SELECT m.*, u.pseudo 
            FROM message m 
            JOIN utilisateur u ON m.idUtilisateur = u.idUtilisateur 
            WHERE m.idTopic = ?
            ORDER BY m.dateDeCreation ${ordreTri}
        `;
        const [messages] = await db.query(sqlMessages, [idTopic]);

        res.status(200).json({
            topic: topicTrouve,
            messages: messages
        });

    } catch (erreur) {
        console.error("Erreur dans afficherTopic:", erreur);
        res.status(500).json({ message: "Erreur serveur lors de la récupération du topic." });
    }
};

exports.creerMessage = async (req, res) => {

    const idTopic = req.body.idTopic
    const contenu = req.body.message
    const idUtilisateur = req.auth.id

    if (!contenu) {
        return res.status(400).json({ message: 'Champs requis manquants.' })
    }

    try {
        // On prépare la requête d'insertion
        // On utilise des ? pour éviter les injections SQL
        const sql = `
            INSERT INTO message (contenu, idUtilisateur, idTopic)
            VALUES (?, ?, ?)
        `

        // On envoie la requête à la base de données avec les valeurs dans le bon ordre
        const [resultat] = await db.query(sql, [contenu, idUtilisateur, idTopic])


        // On confirme que l'inscription s'est bien passée avec un code 201 (créé) et on retourne l'id du topic
        res.status(201).json({ message: 'Publication du message réussie !', id: resultat.insertId })



    } catch (erreur) {
        // On affiche l'erreur dans le terminal pour déboguer
        console.error(erreur)
        // On informe le client qu'une erreur s'est produite côté serveur
        res.status(500).json({ message: "Erreur lors de la publication du message." })
    }
}

exports.rechercheTopics = async (req, res) => {
    const recherche = req.query.recherche

    if (!recherche) {
        return res.status(400).json({
            message: "Veuillez saisir un terme de recherche."
        })
    }

    try {
        const rechercheMinuscule = recherche.toLowerCase()

        const sql = `
            SELECT t.idTopic, t.titre, t.contenu, t.dateDeCreation, t.etat, u.pseudo
            FROM topic t
            LEFT JOIN Utilisateur u ON t.idUtilisateur = u.idUtilisateur
            WHERE LOWER(t.titre) LIKE ? OR LOWER(t.contenu) LIKE ?
            ORDER BY t.dateDeCreation DESC
        `

        const [resultat] = await db.query(sql, [
            `%${rechercheMinuscule}%`,
            `%${rechercheMinuscule}%`
        ])

        res.status(200).json(resultat)

    } catch (erreur) {
        console.error(erreur)
        res.status(500).json({
            message: "Erreur lors de la recherche."
        })
    }
}


exports.supprimerMessage = async (req, res) => {
    const idMessage = req.params.idMessage;
    const idUtilisateurConnecte = req.auth.id;

    try {
        const [resultat] = await db.query('SELECT idUtilisateur FROM Message WHERE idMessage = ?', [idMessage]);

        if (resultat.length === 0) {
            return res.status(404).json({ message: 'Message introuvable.' });
        }

        if (resultat[0].idUtilisateur !== idUtilisateurConnecte) {
            return res.status(403).json({ message: 'Action non autorisée : vous n\'êtes pas le propriétaire de ce message.' });
        }
        await db.query('DELETE FROM Message WHERE idMessage = ?', [idMessage]);
        res.status(200).json({ message: 'Message supprimé avec succès.' });

    } catch (erreur) {
        console.error(erreur)
        res.status(500).json({
            message: "Erreur lors de la recherche."
        })
    }
}

exports.supprimerTopic = async (req, res) => {
    const idTopic = req.params.idTopic;
    const idUtilisateurConnecte = req.auth.id;

    try {
        const [resultat] = await db.query('SELECT idUtilisateur FROM topic WHERE idTopic = ?', [idTopic]);

        if (resultat.length === 0) {
            return res.status(404).json({ message: 'Topic introuvable.' });
        }

        if (resultat[0].idUtilisateur !== idUtilisateurConnecte) {
            return res.status(403).json({ message: 'Action non autorisée : vous n\'êtes pas le propriétaire de ce topîc.' });
        }
        await db.query('DELETE FROM topic WHERE idTopic = ?', [idTopic]);
        res.status(200).json({ message: 'Topic supprimé avec succès.' });

    } catch (erreur) {
        console.error(erreur)
        res.status(500).json({
            message: "Erreur lors de la recherche."
        })
    }
}

exports.likerTopic = async (req, res) => {
    // 1. On récupère les infos
    const idTopic = req.params.idTopic;
    const vote = req.body.vote;

    // ATTENTION : selon comment tu as codé ton middleware, c'est soit req.auth.id, soit req.auth.userId
    const idUtilisateurConnecte = req.auth.userId || req.auth.id;

    // 2. Sécurité : on vérifie que la donnée est bien +1 ou -1
    if (vote !== 1 && vote !== -1) {
        return res.status(400).json({ message: "Le vote doit être +1 ou -1." });
    }

    try {
        // 3. La requête d'insertion / mise à jour
        const sql = `
            INSERT INTO Evaluer (idUtilisateur, idTopic, vote)
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE vote = ?
        `;

        await db.query(sql, [idUtilisateurConnecte, idTopic, vote, vote]);

        // 4. On renvoie un succès simple (pas besoin de topicTrouve ici !)
        res.status(200).json({ message: "Vote enregistré avec succès !" });

    } catch (erreur) {
        console.error("Erreur lors de l'évaluation :", erreur);
        res.status(500).json({ message: "Erreur serveur lors de l'enregistrement du vote." });
    }
}

