const express = require('express');
const path = require('node:path');
const app = express();
const auth = require('./app/backend/middleware/authentification');
const cors = require('cors');

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'app', 'frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/frontend/pages/index.html'));
});

app.get('/connexion', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/frontend/pages/connexion.html'));
});

app.get('/inscription', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/frontend/pages/inscription.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/frontend/pages/admin.html'));
});

app.get('/create-topic', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/frontend/pages/create-topic.html'));
});

app.get('/topicTemplate', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/frontend/pages/topicTemplate.html'));
});

app.get('/guide', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/frontend/pages/guide.html'));
});

app.get('/help', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/frontend/pages/help.html'));
});

const utilisateurRouter = require('./app/backend/router/utilisateur');
app.use('/api', utilisateurRouter);

const topicRouter = require('./app/backend/router/topic');
app.use('/api', topicRouter);


app.use((err, req, res, next) => {
  console.error(err.stack);

  if (req.originalUrl.startsWith('/api/')) {
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }

  res.status(500).sendFile(path.join(__dirname, 'app/frontend/pages', 'erreur.html'));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});