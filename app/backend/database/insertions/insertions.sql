-- Insertions de données fictives dans la table utilisateur
INSERT INTO
    utilisateur (pseudo, motDePasse, email)
VALUES
    ('Michelee', 'root', 'Michelee@gmail.com'),
    ('Rita', 'root', 'rita@gmail.com'),
    ('Tetrap', 'root', 'Tetrap@gmail.com'),
    ('Kabine', 'root', 'Kabinette@gmail.com'),
    ('MOLP', 'root', 'MOLP@gmail.com'),
    ('mollll', 'root', 'Mollll@gmail.com');
    ('Kabine', 'root', 'Kabinette@gmail.com'),
    ('MOLP', 'root', 'MOLP@gmail.com'),
    ('mollll', 'root', 'Mollll@gmail.com');

-- Insertions de topics fictifs dans la table Topic

INSERT INTO Topic (titre, contenu, idUtilisateur)
VALUES
(
    'Vous en pensez quoi d''Interstellar ?',
    'Bonjour, j''écris ce post pour avoir votre avis sur le film Interstellar',
    1
),
(
    'Vous en pensez quoi d''Inception ?',
    'Bonjour, j''écris ce post pour avoir votre avis sur le film Inception',
    2
),
(
    'Vos avis sur l''Amour Ouf ?',
    'Bonjour, j''écris ce post pour avoir votre avis sur le film L''Amour Ouf',
    3
);

-- Insertions de tags  dans la table tag
INSERT INTO
    tag (nom)
VALUES
    ("film"),
    ("série"),
    ("débat"),
    ("question")