const express = require('express')
const router = express.Router()
const auth = require('../middleware/authentification')
const topicCtrl = require('topicCtrl')

// On branche POST /api/topics → Poster un topic
router.post('/topics', auth.verifierToken, topicCtrl.creerTopic)

module.exports = router