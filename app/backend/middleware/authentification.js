const jwt = require('jsonwebtoken');

exports.verifierToken = (req, res, next) => {
    try {
        // Si l'autorisation présente dans le header de la requête
        if (req.headers.authorization) {
            // Alors on extrait le token
            let jetonDecode = jwt.verify((req.headers.authorization).split(' ')[1], process.env.CLEJWT)
            //Permet de stocker jetonDecode dans req pour dire au controller qui fait l'action
            req.auth = jetonDecode
            // Donne le feu vert à Express de passer la requête au controller
            next()
        }
        //Sinon
        else {
            //On renvoit uj message d'erreur
            return res.status(401).json({ message: 'Le jeton est manquant' })
        }
    }
    //Si jwt.verify() déclenche une erreur
    catch {
        return res.status(401).json({ message: 'Nous n\'avons pas réussi à vous connecter ! ' })
    }
}