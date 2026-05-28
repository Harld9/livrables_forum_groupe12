// On importe la connexion à la base de données
const db = require('../database/connexiondb.js')

//
exports.creerTopic = async (req, res) => {
    const titre = req.body.titre;
    const contenu = req.body.contenu;
    const idUtilisateur = req.auth.id


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
        const sql = `
             SELECT dateDeCreation, titre, contenu,etat , idUtilisateur FROM topic WHERE idTopic = ?
        `

        // On envoie la requête à la base de données avec les valeurs dans le bon ordre
        const [resultat] = await db.query(sql, [idTopic])


        // On confirme que l'inscription s'est bien passée avec un code 201 (créé) et on retourne l'id du topic
        res.status(200).json(resultat[0])



    } catch (erreur) {
        // On affiche l'erreur dans le terminal pour déboguer
        console.error(erreur)
        // On informe le client qu'une erreur s'est produite côté serveur
        res.status(500).json({ message: "Erreur lors de la demande du topic." })
    }
}