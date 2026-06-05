// On importe la connexion à la base de données
const db = require('../database/connexiondb.js')

//
exports.listerTopics = async (req, res) => {
    try {
        const sql = `
            SELECT t.idTopic, t.titre, t.contenu, t.dateDeCreation, t.etat, u.pseudo
            FROM topic t
            LEFT JOIN Utilisateur u ON t.idUtilisateur = u.idUtilisateur
            ORDER BY t.dateDeCreation DESC
        `

        const [resultat] = await db.query(sql)
        return res.status(200).json(resultat)
    } catch (erreur) {
        console.error(erreur)
        return res.status(500).json({ message: 'Erreur lors du chargement des topics.' })
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
            INSERT INTO topic (titre, contenu, idUtilisateur, dateDeCreation)
            VALUES (?, ?, ?, CURDATE())
        `

        // On envoie la requête à la base de données avec les valeurs dans le bon ordre
        const [resultat] = await db.query(sql, [titre, contenu, idUtilisateur])


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
        // On prépare la requête d'insertion
        // On utilise des ? pour éviter les injections SQL
        const sql1 = `
             SELECT dateDeCreation, titre, contenu,etat , idUtilisateur FROM topic WHERE idTopic = ?
        `

        const sql2 = `
            SELECT message.contenu, message.dateDeCreation, utilisateur.pseudo
            FROM message
            INNER JOIN utilisateur ON message.idUtilisateur = utilisateur.idUtilisateur
            WHERE message.idTopic = ?
            ORDER BY message.dateDeCreation ASC
        `

        // On envoie la requête à la base de données avec les valeurs dans le bon ordre
        const [resultatTopic] = await db.query(sql1, [idTopic])
        const [resultatMessage] = await db.query(sql2, [idTopic])

        // On confirme que l'inscription s'est bien passée avec un code 200 et on retourne le topic avec ses messages
        res.status(200).json({ topic: resultatTopic[0], messages: resultatMessage })



    } catch (erreur) {
        // On affiche l'erreur dans le terminal pour déboguer
        console.error(erreur)
        // On informe le client qu'une erreur s'est produite côté serveur
        res.status(500).json({ message: "Erreur lors de la demande du topic." })
    }
}

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
            INSERT INTO message (contenu, idUtilisateur, idTopic, dateDeCreation)
            VALUES (?, ?, ?, CURDATE())
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
