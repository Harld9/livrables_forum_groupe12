const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Forum API running');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const path = require('path');

app.use(express.static(path.join(__dirname, 'frontend')));