exports.creerTopic = async (req, res) => {
    const titre = req.body.titre;
    const contenu = req.body.contenu;
    const auteur = req.body.auteur;
    const idUtilisateur = req.auth.idUtilisateur
}