TITAN MANAGER - INSTALLATION & SETUP GUIDE
==========================================

PROJECT OVERVIEW:
Titan Manager is a streamlined platform to manage sports logistics,
brackets, and live scoring.

SYSTEM REQUIREMENTS:
1. Install Node.js from https://nodejs.org/
2. Install MySQL Server from https://dev.mysql.com/downloads/

--------------------------------------------------
STEP 1: DATABASE SETUP (MySQL)
--------------------------------------------------
Log in to your MySQL terminal and run the following code:

DATABASE NAME: titanmanagerdb

CODE:
CREATE DATABASE titanmanagerdb;
USE titanmanagerdb;

CREATE TABLE users (
    email VARCHAR(255) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (email)
);

CREATE TABLE event (
    id INT AUTO_INCREMENT PRIMARY KEY,
    eventId VARCHAR(20),
    matchNumber INT,
    teamA VARCHAR(255),
    teamB VARCHAR(255),
    matchDateTime DATETIME,
    sport VARCHAR(100)
);

ALTER TABLE event 
ADD COLUMN scoreA INT DEFAULT 0,
ADD COLUMN scoreB INT DEFAULT 0,
ADD COLUMN winner VARCHAR(255) DEFAULT NULL,
ADD COLUMN status VARCHAR(20) DEFAULT 'Upcoming',
ADD COLUMN matchLevel INT DEFAULT 1;

--------------------------------------------------
STEP 2: INSTALL NODE.JS DEPENDENCIES
--------------------------------------------------
Open your terminal/command prompt in the project folder and run:

npm install express mysql2 body-parser cors

--------------------------------------------------
STEP 3: RUNNING THE APPLICATION
--------------------------------------------------
1. Ensure your MySQL server is running.
2. In the terminal, type: node server.js
3. Open "Signup.html" in your web browser to create an account.

--------------------------------------------------
CONTACT / DEVELOPER:
Aditya Putta
Titan Manager Project Team
==========================================