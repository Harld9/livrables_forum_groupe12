const db = require('../database/connexiondb');

// --- STATS ET UTILISATEURS ---

exports.getStats = async (req, res) => {
    try {
        const [[users]] = await db.query('SELECT COUNT(*) as count FROM Utilisateur');
        const [[topics]] = await db.query('SELECT COUNT(*) as count FROM Topic');
        const [[bans]] = await db.query('SELECT COUNT(*) as count FROM Utilisateur WHERE typeCompte = "banni"');
        res.json({ users: users.count, topics: topics.count, bans: bans.count });
    } catch (e) { res.status(500).json(e); }
};

exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT idUtilisateur, pseudo, email, typeCompte FROM Utilisateur');
        res.json(users);
    } catch (e) { res.status(500).json(e); }
};

exports.deleteUser = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM Evaluer WHERE idUtilisateur = ?', [id]);
        await db.query('DELETE FROM Message WHERE idUtilisateur = ?', [id]);
        await db.query('DELETE FROM Topic WHERE idUtilisateur = ?', [id]);
        await db.query('DELETE FROM Utilisateur WHERE idUtilisateur = ?', [id]);
        res.status(200).json({ message: "Utilisateur supprimé" });
    } catch (e) {
        console.error("Erreur suppression :", e);
        res.status(500).json(e);
    }
};

exports.banUser = async (req, res) => {
    try {
        await db.query('UPDATE Utilisateur SET typeCompte = "banni" WHERE idUtilisateur = ?', [req.params.id]);
        res.json({ message: "Utilisateur banni" });
    } catch (e) { res.status(500).json(e); }
};

exports.unbanUser = async (req, res) => {
    try {
        await db.query('UPDATE Utilisateur SET typeCompte = "Utilisateur" WHERE idUtilisateur = ?', [req.params.id]);
        res.json({ message: "Utilisateur débanni" });
    } catch (e) { res.status(500).json(e); }
};

// --- TOPICS ---

exports.getAllTopics = async (req, res) => {
    try {
        const [topics] = await db.query(`
            SELECT Topic.idTopic, Topic.titre, Topic.dateDeCreation, Utilisateur.pseudo
            FROM Topic
            LEFT JOIN Utilisateur ON Topic.idUtilisateur = Utilisateur.idUtilisateur
            ORDER BY Topic.dateDeCreation DESC
        `);
        res.json(topics);
    } catch (e) { res.status(500).json(e); }
};

exports.deleteTopic = async (req, res) => {
    try {
        await db.query('DELETE FROM Topic WHERE idTopic = ?', [req.params.id]);
        res.json({ message: "Topic supprimé" });
    } catch (e) { res.status(500).json(e); }
};

// --- MESSAGES ---

exports.getAllMessages = async (req, res) => {
    try {
        const [messages] = await db.query(`
            SELECT Message.idMessage, Message.contenu, Message.dateDeCreation, Utilisateur.pseudo, Topic.titre AS topicTitre
            FROM Message
            LEFT JOIN Utilisateur ON Message.idUtilisateur = Utilisateur.idUtilisateur
            LEFT JOIN Topic ON Message.idTopic = Topic.idTopic
            ORDER BY Message.dateDeCreation DESC
        `);
        res.json(messages);
    } catch (e) { res.status(500).json(e); }
};

exports.deleteMessage = async (req, res) => {
    try {
        await db.query('DELETE FROM Message WHERE idMessage = ?', [req.params.id]);
        res.json({ message: "Message supprimé" });
    } catch (e) { res.status(500).json(e); }
};