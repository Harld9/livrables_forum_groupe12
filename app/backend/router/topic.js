const express = require('express')
const router = express.Router()
const auth = require('../middleware/authentification')
const topic = require('../controller/topic')

// On branche POST /api/creerTopic → Poster un topic
router.post('/creerTopic', auth.verifierToken, topic.creerTopic)

// On branche GET /api/topics → Liste tous les topics
router.get('/topics', topic.listerTopics)

// On branche GET /api/afficherTopic → Afficher un topic | :id permet de mettre dynamiquement l'id dans l'url de la route
router.get('/afficherTopic/:idTopic', topic.afficherTopic)

// On branche post /api/creerMessage → Creer un message
router.post('/creerMessage', auth.verifierToken, topic.creerMessage)

router.get('/rechercheTopic', topic.rechercheTopics)

// On branche DELETE /api/supprimerMessage → Supprimer un message
router.delete('/supprimerMessage/:idMessage', auth.verifierToken, topic.supprimerMessage)

// On branche DELETE /api/supprimerMessage → Supprimer un message
router.delete('/supprimerTopic/:idTopic', auth.verifierToken, topic.supprimerTopic)

module.exports = router