-- Insertions dans la table Utilisateur (Mots de passe hachés pour "hello")
INSERT INTO
    Utilisateur (pseudo, motDePasse, email, typeCompte)
VALUES
    (
        'AdminLounge',
        '$2b$10$Lyj9kHYZtiyfxh2G60TEfeqs7xkkGiEFFDi3iJGc50ZG/XJ1sxIFi',
        'admin@lounge.fr',
        'admin'
    ),
    (
        'Harold',
        '$2b$10$Lyj9kHYZtiyfxh2G60TEfeqs7xkkGiEFFDi3iJGc50ZG/XJ1sxIFi',
        'harold@gmail.com',
        'Utilisateur'
    ),
    (
        'MicheleDrucker',
        '$2b$10$Lyj9kHYZtiyfxh2G60TEfeqs7xkkGiEFFDi3iJGc50ZG/XJ1sxIFi',
        'matteo@gmail.com',
        'Utilisateur'
    ),
    (
        'Thomas5',
        '$2b$10$Lyj9kHYZtiyfxh2G60TEfeqs7xkkGiEFFDi3iJGc50ZG/XJ1sxIFi',
        'emrick@gmail.com',
        'Utilisateur'
    ),
    (
        'FlofloLaMouette',
        '$2b$10$Lyj9kHYZtiyfxh2G60TEfeqs7xkkGiEFFDi3iJGc50ZG/XJ1sxIFi',
        'florian@gmail.com',
        'Utilisateur'
    ),
    (
        'Denisss',
        '$2b$10$Lyj9kHYZtiyfxh2G60TEfeqs7xkkGiEFFDi3iJGc50ZG/XJ1sxIFi',
        'julie@gmail.com',
        'Utilisateur'
    );

-- Insertions dans la table Tag
INSERT INTO
    Tag (idTag, nom)
VALUES
    (1, 'film'),
    (2, 'série'),
    (3, 'anime'),
    (4, 'question');

-- Insertions dans la table Topic
INSERT INTO
    Topic (
        idTopic,
        titre,
        contenu,
        idUtilisateur,
        dateDeCreation
    )
VALUES
    (
        1,
        'Tuto pour configurer Nextcloud avec Active Directory ?',
        'Je galère avec mon infra sous Debian, quelqu''un a une idée ?',
        2,
        CURDATE () - INTERVAL 1 DAY
    ),
    (
        2,
        'Cherche mate pour duoQ League of Legends',
        'Dispo ce soir pour monter en classé.',
        3,
        CURDATE () - INTERVAL 2 DAY
    ),
    (
        3,
        'Meilleur exo pour cibler la largeur du dos ?',
        'Je cherche à modifier ma séance sans faire une refonte complète. Des avis ?',
        2,
        CURDATE () - INTERVAL 3 DAY
    ),
    (
        4,
        'La fin d''Interstellar en IMAX',
        'Une vraie dinguerie visuelle et sonore.',
        6,
        CURDATE () - INTERVAL 4 DAY
    ),
    (
        5,
        'Ouvrir un PEA étudiant, bonne idée ?',
        'Je veux investir un peu à côté des cours (ETF etc).',
        5,
        CURDATE () - INTERVAL 5 DAY
    ),
    (
        6,
        'Problème d''image sur ma télé Philips 55PUS8600',
        'L''écran scintille un peu sur les bords, un réglage à conseiller ?',
        2,
        CURDATE () - INTERVAL 6 DAY
    ),
    (
        7,
        'Architecture MVC en JS pour un jeu type Clicker',
        'Je bloque sur la séparation de mes classes pour gérer les assets.',
        4,
        CURDATE () - INTERVAL 7 DAY
    ),
    (
        8,
        'Le dernier arc de Demon Slayer',
        'L''animation est incroyable, vous en pensez quoi ?',
        3,
        CURDATE () - INTERVAL 8 DAY
    ),
    (
        9,
        'The Last of Us : la série vs le jeu',
        'Ils ont vraiment respecté l''histoire d''origine.',
        4,
        CURDATE () - INTERVAL 9 DAY
    ),
    (
        10,
        'Avis sur L''Amour Ouf ?',
        'J''ai pris ma place de ciné, c''est vraiment bien ?',
        6,
        CURDATE () - INTERVAL 10 DAY
    ),
    (
        11,
        'Sortir du Elo Hell sur Valorant',
        'Je suis bloqué, comment je peux optimiser mes games ?',
        3,
        CURDATE () - INTERVAL 11 DAY
    ),
    (
        12,
        'Quel anime de sport regarder après Haikyuu ?',
        'J''ai adoré la vibe, je cherche un truc similaire.',
        5,
        CURDATE () - INTERVAL 12 DAY
    ),
    (
        13,
        'Débat : Inception, rêve ou réalité ?',
        'La toupie tombe à la fin ou pas ?',
        4,
        CURDATE () - INTERVAL 13 DAY
    ),
    (
        14,
        'Besoin d''aide sur du SQL (LIMIT OFFSET)',
        'Je dois paginer des résultats par 10.',
        2,
        CURDATE () - INTERVAL 14 DAY
    ),
    (
        15,
        'Breaking Bad reste le GOAT',
        'Rien n''a dépassé cette série depuis sa sortie.',
        5,
        CURDATE () - INTERVAL 15 DAY
    );

-- Insertions dans la table Appartenir
INSERT INTO
    Appartenir (idTopic, idTag)
VALUES
    (1, 4),
    (2, 4),
    (3, 4),
    (4, 1),
    (5, 4),
    (6, 4),
    (7, 4),
    (8, 3),
    (9, 2),
    (10, 1),
    (11, 4),
    (12, 3),
    (13, 1),
    (14, 4),
    (15, 2);

-- Insertions dans la table Message
INSERT INTO
    Message (contenu, idUtilisateur, idTopic, dateDeCreation)
VALUES
    (
        'Essaye de voir du côté du module LDAP pour Nextcloud.',
        4,
        1,
        CURDATE ()
    ),
    (
        'Je suis chaud pour du LoL ce soir !',
        5,
        2,
        CURDATE ()
    ),
    (
        'Tractions lestées et tirage bûcheron, le classique.',
        3,
        3,
        CURDATE ()
    ),
    (
        'Vérifie la nappe de ton écran pour la Philips.',
        6,
        6,
        CURDATE ()
    ),
    (
        'La toupie tremble à la toute fin, donc elle tombe !',
        2,
        13,
        CURDATE ()
    ),
    (
        'Kuroko no Basket sans hésiter !',
        3,
        12,
        CURDATE ()
    );

-- Insertions dans la table Evaluer
INSERT INTO
    Evaluer (idUtilisateur, idTopic, vote)
VALUES
    (2, 4, 1),
    (3, 4, 1),
    (4, 4, 1),
    (5, 15, 1),
    (6, 15, 1),
    (3, 11, -1);