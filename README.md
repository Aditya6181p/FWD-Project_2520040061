# 🏆 Titan Manager - Tournament Management Suite

Titan Manager is a full-stack tournament management application designed to automate match scheduling, bracket progression, and real-time score tracking for various sports disciplines.

## 🚀 Features
- **Dynamic Bracketing:** Automatically generates knockout brackets (2, 4, or 8 teams).
- **Sport-Specific Hubs:** Dedicated interfaces for Basketball, Football, Table Tennis, and Badminton.
- **Secure Authentication:** Complete user signup and login system.
- **Persistent Storage:** Integrated MySQL database for reliable data management.

---

## 🛠 Prerequisites

Before running this project, you **must** have the following installed on your machine:

1. **Node.js** (v16.x or higher) -> [Download here](https://nodejs.org/)
2. **MySQL Server** (v8.0 or higher) -> [Download here](https://dev.mysql.com/downloads/installer/)

---

## 🏗 Setup & Installation

### 1. Database Configuration
Open your MySQL Workbench or Command Line and execute the following scripts to initialize the database:

```sql
-- Create the Database
CREATE DATABASE titanmanagerdb;
USE titanmanagerdb;

-- Create Users Table
CREATE TABLE users (
    email VARCHAR(255) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (email)
);

-- Create Events Table
CREATE TABLE event (
    id INT AUTO_INCREMENT PRIMARY KEY,
    eventId VARCHAR(20),
    matchNumber INT,
    teamA VARCHAR(255),
    teamB VARCHAR(255),
    matchDateTime DATETIME,
    sport VARCHAR(100)
);

-- Apply Schema Updates
ALTER TABLE event 
ADD COLUMN scoreA INT DEFAULT 0,
ADD COLUMN scoreB INT DEFAULT 0,
ADD COLUMN winner VARCHAR(255) DEFAULT NULL,
ADD COLUMN status VARCHAR(20) DEFAULT 'Upcoming',
ADD COLUMN matchLevel INT DEFAULT 1; -- 1: Finals, 2: Semis, 4: Quarters;
