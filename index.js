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

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

// On sert la page d'accueil
