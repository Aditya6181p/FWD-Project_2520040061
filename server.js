const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 1. Setup MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Your MySQL username
  password: "zaqwsx", // Your MySQL password
  database: "TitanManagerDB",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL Database!");
});

// 2. Handle the Signup POST request
app.post("/signup", (req, res) => {
  const { firstName, lastName, mobile, email, password } = req.body;

  const sql =
    "INSERT INTO Login (firstName, lastName, mobile, email, password) VALUES (?, ?, ?, ?, ?)";

  db.query(
    sql,
    [firstName, lastName, mobile, email, password],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Database error");
      }
      res.status(200).send("User registered");
    },
  );
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

// Add this below your /signup route in server.js

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Search for a user with the matching email AND password
  const sql = "SELECT * FROM Login WHERE email = ? AND password = ?";

  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      // User found!
      res.status(200).json({
        message: "Login Successful",
        user: results[0],
      });
    } else {
      // No match found
      res.status(401).json({ message: "Invalid email or password" });
    }
  });
});
app.post("/save-tournament", (req, res) => {
  const { eventId, sport, matches } = req.body;

  // Check if data is arriving correctly
  console.log("Saving data for Event ID:", eventId);

  // Prepare the values array for bulk insert
  const values = matches.map((m) => [
    eventId,
    m.matchNum,
    m.teamA,
    m.teamB,
    m.date,
    sport,
  ]);

  const sql =
    "INSERT INTO event (eventId, matchNumber, teamA, teamB, matchDateTime, sport) VALUES ?";

  db.query(sql, [values], (err, result) => {
    if (err) {
      // THIS WILL TELL YOU THE REAL ERROR IN YOUR TERMINAL
      console.error("MYSQL ERROR:", err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log("Tournament Saved!");
    res.status(200).json({ message: "Success" });
  });
});

app.get("/get-events", (req, res) => {
  // Ordering by date so the schedule makes sense
  const sql = "SELECT * FROM event ORDER BY matchDateTime ASC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database fetch failed" });
    }
    res.json(results);
  });
});

// Fetch only Table Tennis matches
app.get("/get-tt-events", (req, res) => {
  const sql =
    "SELECT * FROM event WHERE sport = 'TableTennis' ORDER BY matchDateTime ASC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Update score and status
app.post("/update-tt-match", (req, res) => {
  const { id, scoreA, scoreB, winner, status } = req.body;
  const sql =
    "UPDATE event SET scoreA = ?, scoreB = ?, winner = ?, status = ? WHERE id = ?";
  db.query(sql, [scoreA, scoreB, winner, status, id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: "Update successful" });
  });
});

// Fetch only Basketball matches
app.get("/get-basketball-events", (req, res) => {
  const sql =
    "SELECT * FROM event WHERE sport = 'Basketball' ORDER BY matchDateTime ASC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Fetch only Football matches
app.get("/get-football-events", (req, res) => {
  const sql =
    "SELECT * FROM event WHERE sport = 'Football' ORDER BY matchDateTime ASC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Fetch only Badminton matches
app.get("/get-badminton-events", (req, res) => {
  const sql =
    "SELECT * FROM event WHERE sport = 'Badminton' ORDER BY matchDateTime ASC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post("/update-match-complex", (req, res) => {
  const { id, scoreA, scoreB, winner, status, matchDateTime } = req.body;

  // 1. Update the current match
  const updateSql =
    "UPDATE event SET scoreA=?, scoreB=?, winner=?, status=?, matchDateTime=? WHERE id=?";
  db.query(
    updateSql,
    [scoreA, scoreB, winner, status, matchDateTime, id],
    (err, result) => {
      if (err) return res.status(500).send(err);

      // 2. Tournament Progression Logic
      db.query(
        "SELECT eventId, matchLevel, winner FROM event WHERE id = ?",
        [id],
        (err, rows) => {
          const currentMatch = rows[0];

          // If it was a Semi-Final (Level 2), check if we can create a Final (Level 1)
          if (currentMatch.matchLevel > 1 && status === "Completed") {
            const checkSql =
              "SELECT winner FROM event WHERE eventId = ? AND matchLevel = ? AND status = 'Completed'";
            db.query(
              checkSql,
              [currentMatch.eventId, currentMatch.matchLevel],
              (err, finishedMatches) => {
                // If we have 2 winners from Semis, create the Final match
                if (finishedMatches.length === 2) {
                  const nextLevel = currentMatch.matchLevel / 2;
                  const createFinalSql =
                    "INSERT INTO event (eventId, teamA, teamB, sport, matchLevel, status) VALUES (?, ?, ?, (SELECT sport FROM event WHERE id=?), ?, 'Upcoming')";
                  db.query(createFinalSql, [
                    currentMatch.eventId,
                    finishedMatches[0].winner,
                    finishedMatches[1].winner,
                    id,
                    nextLevel,
                  ]);
                }
              },
            );
          }
          res.send({ message: "Updated and Progression Checked" });
        },
      );
    },
  );
});

// --- DYNAMIC FETCH ROUTE ---
// Instead of 4 separate routes, use a parameter to fetch any sport
app.get("/get-events/:sport", (req, res) => {
  const sportName = req.params.sport; // e.g., 'Football'
  const sql =
    "SELECT * FROM event WHERE sport = ? ORDER BY matchLevel DESC, matchDateTime ASC";

  db.query(sql, [sportName], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// --- UNIFIED TOURNAMENT PROGRESSION LOGIC ---
app.post("/update-match-complex", (req, res) => {
  const { id, scoreA, scoreB, winner, status, matchDateTime } = req.body;

  // 1. Update the current match results and schedule
  const updateSql =
    "UPDATE event SET scoreA=?, scoreB=?, winner=?, status=?, matchDateTime=? WHERE id=?";
  db.query(
    updateSql,
    [scoreA, scoreB, winner, status, matchDateTime, id],
    (err, result) => {
      if (err) return res.status(500).send(err);

      // 2. Fetch details of the current match to determine sport and tournament group
      db.query(
        "SELECT eventId, matchLevel, sport FROM event WHERE id = ?",
        [id],
        (err, rows) => {
          if (err || rows.length === 0) return res.send({ message: "Updated" });
          const currentMatch = rows[0];

          // 3. Progression Logic: If level > 1 (not final) and match is completed
          if (currentMatch.matchLevel > 1 && status === "Completed") {
            // Check for other completed matches at the SAME level for the SAME eventId and SAME sport
            const checkSql =
              "SELECT winner FROM event WHERE eventId = ? AND matchLevel = ? AND sport = ? AND status = 'Completed'";

            db.query(
              checkSql,
              [
                currentMatch.eventId,
                currentMatch.matchLevel,
                currentMatch.sport,
              ],
              (err, finishedMatches) => {
                if (err) return console.error(err);

                // If a pair is ready (e.g., both semi-finalists are decided)
                if (finishedMatches.length === 2) {
                  const nextLevel = currentMatch.matchLevel / 2; // Level 2 -> 1, Level 4 -> 2

                  // 4. Create the next match in the bracket
                  // We pass the sport through to ensure it stays in the same hub
                  const createNextSql = `
                            INSERT INTO event (eventId, teamA, teamB, sport, matchLevel, status)
                            VALUES (?, ?, ?, ?, ?, 'Upcoming')
                        `;

                  db.query(
                    createNextSql,
                    [
                      currentMatch.eventId,
                      finishedMatches[0].winner,
                      finishedMatches[1].winner,
                      currentMatch.sport,
                      nextLevel,
                    ],
                    (err) => {
                      if (err) console.error("Error creating next round:", err);
                    },
                  );
                }
              },
            );
          }
          res.send({
            message: "Updated and Progression Checked",
            sport: currentMatch.sport,
          });
        },
      );
    },
  );
});
