
// Import de crypto natif à node.js pour hacher les mots de passe
const crypto = require('crypto')

//createHash créé une instance de hachage, .update injecte le mot de passe
//.digest verrouille le calcul en le convertissant en hexadécimal
console.log(crypto.createHash('sha512').update("password").digest('hex'))


