const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./notes.db", (err) => {
  if (err) {
    console.error("DB connection error:", err);
  } else {
    console.log("Connected to SQLite database");
  }
});

db.run(`
    CREATE TABLE IF NOT EXISTS Notes (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Tittel TEXT,
        Body TEXT,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
