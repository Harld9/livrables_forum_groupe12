-- 1. Insertions de données fictives dans la table utilisateur
INSERT INTO
    utilisateur (pseudo, motDePasse, email)
VALUES
    ('Michelee', 'root', 'Michelee@gmail.com'),
    ('Rita', 'root', 'rita@gmail.com'),
    ('Tetrap', 'root', 'Tetrap@gmail.com'),
    ('Kabine', 'root', 'Kabinette@gmail.com'),
    ('MOLP', 'root', 'MOLP@gmail.com'),
    ('mollll', 'root', 'Mollll@gmail.com');

-- 2. Insertions de tags dans la table tag (Attention aux ID : 1=film, 2=série, 3=anime, 4=question)
INSERT INTO
    tag (nom)
VALUES
    ('film'),
    ('série'),
    ('anime'),
    ('question');

-- 3. Insertions de topics fictifs dans la table Topic
INSERT INTO
    Topic (titre, contenu, idUtilisateur, dateDeCreation)
VALUES
    (
        'Vous en pensez quoi d''Interstellar ?',
        'Bonjour, j''écris ce post pour avoir votre avis sur le film Interstellar',
        1,
        CURDATE ()
    ),
    (
        'Vous en pensez quoi d''Inception ?',
        'Bonjour, j''écris ce post pour avoir votre avis sur le film Inception',
        2,
        CURDATE ()
    ),
    (
        'Vos avis sur l''Amour Ouf ?',
        'Bonjour, j''écris ce post pour avoir votre avis sur le film L''Amour Ouf',
        3,
        CURDATE ()
    ),
    (
        'La fin de Breaking Bad...',
        'On est d''accord que c''est la meilleure série de tous les temps ?',
        4,
        CURDATE ()
    ),
    (
        'Quel est le meilleur Anime de sport ?',
        'Haikyuu ou Kuroko no Basket ?',
        5,
        CURDATE ()
    ),
    (
        'Comment on centre une div ?',
        'Question sérieuse, je galère en CSS.',
        6,
        CURDATE ()
    );

-- 4. LA PIÈCE MANQUANTE : Insertions des liens entre Topics et Tags (table Appartenir)
-- On relie chaque ID de topic à son ID de tag correspondant
INSERT INTO
    Appartenir (idTopic, idTag)
VALUES
    (1, 1), -- Interstellar (Topic 1) est un Film (Tag 1)
    (2, 1), -- Inception (Topic 2) est un Film (Tag 1)
    (3, 1), -- L'Amour Ouf (Topic 3) est un Film (Tag 1)
    (4, 2), -- Breaking Bad (Topic 4) est une Série (Tag 2)
    (5, 3), -- Haikyuu (Topic 5) est un Anime (Tag 3)