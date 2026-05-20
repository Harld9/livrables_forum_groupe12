const express = require('express')
const router = express.Router()
const auth = require('../middleware/authentification')
const topic = require('../controller/topic')

// On branche POST /api/topics → Poster un topic
router.post('/topics', auth.verifierToken, topic.creerTopic)

module.exports = router