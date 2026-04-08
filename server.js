const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// Database setup
const db = new sqlite3.Database("./notes.db", (err) => {
  if (err) {
    console.error("DB connection error:", err);
  } else {
    console.log("Connected to SQLite database");
  }
});
// Create table
db.run(`
    CREATE TABLE IF NOT EXISTS Notes (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Tittel TEXT,
        Body TEXT,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);
// Routes
app.get("/notes", (req, res) => {
  db.all(
    "SELECT Id as id, Tittel, Body, CreatedAt FROM Notes ORDER BY CreatedAt DESC",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    },
  );
});

app.post("/notes", (req, res) => {
  console.log("POST /notes received:", req.body);
  const { Tittel, Body } = req.body;

  if (!Tittel || !Body) {
    return res.status(400).json({ error: "Missing fields" });
  }
  
  db.run(
    "INSERT INTO Notes (Tittel, Body) VALUES (?, ?)",
    [Tittel, Body],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        id: this.lastID,
        Tittel,
        Body,
      });
    },
  );
});

app.delete("/notes/:id", (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM Notes WHERE Id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: "Note deleted" });
  });
});

app.put("/notes/:id", (req, res) => {
  const id = req.params.id;
  const { Tittel, Body } = req.body;

  db.run("UPDATE Notes SET Tittel = ?, Body = ? WHERE Id = ?", [Tittel, Body, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json({ message: "Note updated"});
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
