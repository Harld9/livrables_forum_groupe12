CREATE DATABASE IF NOT EXISTS LoungeDB;
USE LoungeDB;

-- ===== TABLE UTILISATEUR =====
CREATE TABLE
   Utilisateur (
      idUtilisateur INT AUTO_INCREMENT,
      pseudo VARCHAR(50) UNIQUE,
      motDePasse VARCHAR(255),
      dateDeCreation DATETIME DEFAULT CURRENT_TIMESTAMP,
      email VARCHAR(255) UNIQUE,
      typeCompte VARCHAR(50) DEFAULT "Utilisateur",
      photoDeProfil VARCHAR(255),
      Biographie TEXT,
      derniereConnexion DATETIME,
      PRIMARY KEY (idUtilisateur)
   );

-- ===== TABLE TOPIC =====
CREATE TABLE
   Topic (
      idTopic INT AUTO_INCREMENT,
      dateDeCreation DATETIME DEFAULT CURRENT_TIMESTAMP,
      titre VARCHAR(50),
      contenu TEXT,
      etat VARCHAR(50) DEFAULT 'OUVERT',
      idUtilisateur INT NOT NULL,
      PRIMARY KEY (idTopic),
      FOREIGN KEY (idUtilisateur) REFERENCES Utilisateur (idUtilisateur)
   );

-- ===== TABLE TAG =====
CREATE TABLE Tag (
    idTag INT AUTO_INCREMENT,
    nom VARCHAR(50),
    PRIMARY KEY (idTag)
);

-- ===== TABLE MESSAGE =====
CREATE TABLE
   Message (
      idMessage INT AUTO_INCREMENT,
      contenu TEXT,
      dateDeCreation DATETIME DEFAULT CURRENT_TIMESTAMP,
      image VARCHAR(255),
      idUtilisateur INT NOT NULL,
      idTopic INT NOT NULL,
      PRIMARY KEY (idMessage),
      FOREIGN KEY (idUtilisateur) REFERENCES Utilisateur (idUtilisateur),
      FOREIGN KEY (idTopic) REFERENCES Topic (idTopic) ON DELETE CASCADE
   );

-- ===== TABLE APPARTENIR =====
CREATE TABLE Appartenir (
    idTopic INT,
    idTag INT,
    PRIMARY KEY (idTopic, idTag),
    FOREIGN KEY (idTopic)
        REFERENCES Topic(idTopic)
        ON DELETE CASCADE,
    FOREIGN KEY (idTag)
        REFERENCES Tag(idTag)
);

-- ===== TABLE EVALUER =====
CREATE TABLE Evaluer (
    idUtilisateur INT,
    idTopic INT,
    vote SMALLINT,
    PRIMARY KEY (idUtilisateur, idTopic),
    FOREIGN KEY (idUtilisateur) 
        REFERENCES Utilisateur(idUtilisateur),
    FOREIGN KEY (idTopic) 
        REFERENCES Topic(idTopic) 
        ON DELETE CASCADE
);