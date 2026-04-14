CREATE DATABASE IF NOT EXISTS LoungeDB;
USE LoungeDB;

-- ===== TABLE UTILISATEUR =====
CREATE TABLE Utilisateur(
   idUtilisateur INT AUTO_INCREMENT,
   pseudo VARCHAR(50),
   motDePasse VARCHAR(128),
   dateDeCreation DATE,
   email VARCHAR(255),
   typeCompte VARCHAR(50),
   photoDeProfil VARCHAR(255),
   Biographie TEXT,
   derniereConnexion DATETIME,
   PRIMARY KEY(idUtilisateur)
);

-- ===== TABLE TOPIC =====
CREATE TABLE Topic(
   idTopic INT AUTO_INCREMENT,
   dateDeCreation DATETIME,
   titre VARCHAR(50),
   contenu TEXT,
   etat VARCHAR(50),
   idUtilisateur INT NOT NULL,
   PRIMARY KEY(idTopic),
   FOREIGN KEY(idUtilisateur) REFERENCES Utilisateur(idUtilisateur)
);

-- ===== TABLE TAG =====
CREATE TABLE Tag(
   idTag INT AUTO_INCREMENT,
   nom VARCHAR(50),
   PRIMARY KEY(idTag)
);

-- ===== TABLE MESSAGE =====
CREATE TABLE Message(
   idMessage INT AUTO_INCREMENT,
   contenu TEXT,
   dateEnvoi DATETIME,
   image VARCHAR(255),
   idUtilisateur INT NOT NULL,
   idTopic INT NOT NULL,
   PRIMARY KEY(idMessage),
   FOREIGN KEY(idUtilisateur) REFERENCES Utilisateur(idUtilisateur),
   FOREIGN KEY(idTopic) REFERENCES Topic(idTopic) ON DELETE CASCADE
);

-- ===== TABLE APPARTENIR =====
CREATE TABLE Appartenir(
   idTopic INT,
   idTag INT,
   PRIMARY KEY(idTopic, idTag),
   FOREIGN KEY(idTopic) REFERENCES Topic(idTopic) ON DELETE CASCADE,
   FOREIGN KEY(idTag) REFERENCES Tag(idTag)
);

-- ===== TABLE EVALUER =====
CREATE TABLE Evaluer(
   idUtilisateur INT,
   idMessage INT,
   vote SMALLINT,
   PRIMARY KEY(idUtilisateur, idMessage),
   FOREIGN KEY(idUtilisateur) REFERENCES Utilisateur(idUtilisateur),
   FOREIGN KEY(idMessage) REFERENCES Message(idMessage) ON DELETE CASCADE
);
