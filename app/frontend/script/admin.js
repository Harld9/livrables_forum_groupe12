document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('token');

    const statsRes = await fetch('/api/admin/stats', { headers: { 'Authorization': 'Bearer ' + token } });
    const stats = await statsRes.json();
    document.getElementById('stat-users').textContent = stats.users;
    document.getElementById('stat-topics').textContent = stats.topics;
    document.getElementById('stat-ban').textContent = stats.bans;

    const usersRes = await fetch('/api/admin/users', { headers: { 'Authorization': 'Bearer ' + token } });
    const users = await usersRes.json();

    // Fix : cible le bon tbody (il y en a deux dans la page)
    const tbody = document.querySelector('#users tbody');
    tbody.innerHTML = '';

    users.forEach(u => {
        const banBtn = u.typeCompte === 'banni'
            ? `<button onclick="unbanUser(${u.idUtilisateur})" class="btn">Débannir</button>`
            : `<button onclick="banUser(${u.idUtilisateur})" class="btn">Bannir</button>`;

        tbody.innerHTML += `
            <tr>
                <td>${u.idUtilisateur}</td>
                <td>${u.pseudo}</td>
                <td>${u.email}</td>
                <td>${u.typeCompte}</td>
                <td>
                    ${banBtn}
                    <button onclick="supprimerUser(${u.idUtilisateur})" class="btn btn-danger">Suppr</button>
                </td>
            </tr>`;
    });
});

async function supprimerUser(id) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
    });
    location.reload();
}

async function banUser(id) {
    if (!confirm("Bannir cet utilisateur ?")) return;
    await fetch(`/api/admin/users/${id}/ban`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
    });
    location.reload();
}

async function unbanUser(id) {
    if (!confirm("Débannir cet utilisateur ?")) return;
    await fetch(`/api/admin/users/${id}/unban`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
    });
    location.reload();
}


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