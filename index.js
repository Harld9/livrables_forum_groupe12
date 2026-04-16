/*
 * On configure ici le serveur Express principal.
 * On définit les middlewares, les routes HTML et les routes API.
 * On lance le serveur sur le port défini.
 */

const express = require('express');
const path = require('node:path')
const app = express();

// On importe cors pour autoriser les requêtes depuis d'autres origines
const cors = require('cors')

// On autorise toutes les origines — à restreindre en production
app.use(cors({ origin: '*' }))

// Middlewares
app.use(express.json());

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, 'app', 'frontend')));

// Routes API
// On sert la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/frontend/pages/index.html'))
});

// On sert la page de connexion
app.get('/connexion', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/frontend/pages/connexion.html'))
});

// On sert la page d'inscri^tion
app.get('/inscription', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/frontend/pages/inscription.html'))
});

// On importe et branche le router des utilisateurs sur /api
// Toutes les routes de utilisateurRouter seront préfixées par /api
const utilisateurRouter = require('./app/backend/router/utilisateur')
app.use('/api', utilisateurRouter)

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
