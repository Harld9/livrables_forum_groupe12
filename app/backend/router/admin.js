const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin');

// Vérifie bien que le chemin vers ton middleware est le bon :
const { verifierToken } = require('../middleware/authentification');

// Stats
router.get('/stats', verifierToken, adminController.getStats);

// Utilisateurs
router.get('/users', verifierToken, adminController.getUsers);
router.delete('/users/:id', verifierToken, adminController.deleteUser);
router.put('/users/:id/ban', verifierToken, adminController.banUser);
router.put('/users/:id/unban', verifierToken, adminController.unbanUser);

// Topics
router.get('/topics', verifierToken, adminController.getAllTopics);
router.delete('/topics/:id', verifierToken, adminController.deleteTopic);

// Messages
router.get('/messages', verifierToken, adminController.getAllMessages);
router.delete('/messages/:id', verifierToken, adminController.deleteMessage);

module.exports = router;