# Forum — Films / Séries / Animes

Forum de discussion autour des films, séries et animes.

## Stack

- Node.js — backend sans framework
- HTML / CSS / JS vanilla — frontend sans framework
- MySQL
- SHA-512 + salt/pepper — hashage des mots de passe
- JWT — authentification

## Prérequis

- Node.js v18+
- MySQL (WAMP / XAMPP / MAMP ou natif)

## Installation

```bash
git clone https://github.com/<utilisateur>/<repo>.git
cd <repo>
npm install
```

Créer un `.env` à la racine :

```env
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
SESSION_SECRET=
PORT=
CLEJWT=
PEPPER=
```

Importer la base de données dans cet ordre :

```bash
app/backend/database/createdb.sql
app/backend/database/insertions.sql
```

Lancer :

```bash
node index.js
```

→ `http://localhost:3000`

## Routes

### Vues

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Liste des topics |
| GET | `/connexion` | Connexion |
| GET | `/inscription` | Inscription |
| GET | `/create-topic` | Création de topic |
| GET | `/topics/:id` | Topic + messages |
| GET | `/admin` | Dashboard admin |
| GET | `/guide` | Guide |
| GET | `/help` | Aide |

### API

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/inscription` | — | Créer un compte |
| POST | `/api/connexion` | — | Se connecter |
| POST | `/api/deconnexion` | ✓ | Se déconnecter |
| GET | `/api/topics` | — | Lister les topics (`?tri=likes&tag=action`) |
| POST | `/api/topics` | ✓ | Créer un topic |
| PUT | `/api/topics/:id` | ✓ | Modifier un topic |
| DELETE | `/api/topics/:id` | ✓ | Supprimer un topic |
| GET | `/api/topics/:id/messages` | — | Messages d'un topic |
| POST | `/api/topics/:id/messages` | ✓ | Poster un message |
| DELETE | `/api/topics/:id/messages/:msgId` | ✓ | Supprimer un message |
| POST | `/api/messages/:id/vote` | ✓ | Like / dislike |
| GET | `/api/tags` | — | Tags disponibles |
| PUT | `/api/admin/topics/:id/etat` | Admin | Changer l'état d'un topic |
| DELETE | `/api/admin/topics/:id` | Admin | Supprimer un topic |
| DELETE | `/api/admin/messages/:id` | Admin | Supprimer un message |
| PUT | `/api/admin/utilisateurs/:id/bannir` | Admin | Bannir un utilisateur |

## Structure

```
.
├── app/
│   ├── backend/
│   │   ├── controller/
│   │   ├── database/
│   │   ├── middleware/
│   │   └── router/
│   └── frontend/
│       ├── assets/
│       ├── controller/
│       ├── css/
│       ├── pages/
│       └── script/
├── .env
├── index.js
└── package.json
```

## Équipe

| Nom | Rôle |
|-----|------|
| Harold | Backend — controllers, routes, BDD |
| Abdelmalek | Frontend - HTML/CSS, Design du site |
