const mysql = require('mysql2/promise');// permet à node de comprendre le SQL
const path = require('node:path')
const fs = require('node:fs')

// Charge le .env de app, indépendamment du dossier de lancement de Node.
const dotenv = require('dotenv')
const envCandidates = [
    path.join(__dirname, '..', '..', '.env'),
    path.join(process.cwd(), '.env')
]
const envPath = envCandidates.find((candidate) => fs.existsSync(candidate))
dotenv.config(envPath ? { path: envPath } : {})

// on initialise les credentials via dotenv
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

module.exports = db; // on exporte l'objet de connexion pour que app.js puisse l'utiliser