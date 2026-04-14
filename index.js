const express = require('express');
const path = require('path');
const app = express();

// Middlewares
app.use(express.json());

// Routes API
app.get('/', (req, res) => {
  res.send('Forum API running');
});

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, 'src', 'frontend')));

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});