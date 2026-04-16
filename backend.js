const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

// lets frontend talk to backend
app.use(cors());

// lets server read JSON data from frontend
app.use(express.json());

// serves your HTML, CSS, JS files
app.use(express.static(path.join(__dirname, "public")));

// connect to sqlite database file
const db = new sqlite3.Database("./notes.db");

// create tables if they don’t exist yet
db.serialize(() => {
  // Notes table
  db.run(`
    CREATE TABLE IF NOT EXISTS Notes (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Tittel TEXT,
      Body TEXT,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Folder table for grouping todos
  db.run(`
    CREATE TABLE IF NOT EXISTS TodoFolders (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL UNIQUE,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Todos table (optional link to folder)
  db.run(`
    CREATE TABLE IF NOT EXISTS Todos (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Text TEXT,
      Done INTEGER DEFAULT 0,
      FolderId INTEGER,
      FOREIGN KEY (FolderId) REFERENCES TodoFolders(Id) ON DELETE SET NULL
    )
  `);

  // Migration: add FolderId if this is an older database
  db.all("PRAGMA table_info(Todos)", [], (err, columns) => {
    if (err) return;

    const hasFolderId = columns.some((column) => column.name === "FolderId");

    if (!hasFolderId) {
      db.run("ALTER TABLE Todos ADD COLUMN FolderId INTEGER", () => {});
    }
  });
});


// ---------------- NOTES ----------------

// get all notes
app.get("/notes", (req, res) => {
  db.all("SELECT * FROM Notes ORDER BY Id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// create note
app.post("/notes", (req, res) => {
  const { Tittel, Body } = req.body;

  if (!Tittel || !Body) {
    return res.status(400).json({ error: "Missing fields" });
  }

  db.run(
    "INSERT INTO Notes (Tittel, Body) VALUES (?, ?)",
    [Tittel, Body],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ id: this.lastID, Tittel, Body });
    }
  );
});

// delete note
app.delete("/notes/:id", (req, res) => {
  db.run("DELETE FROM Notes WHERE Id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Note deleted" });
  });
});

// update note
app.put("/notes/:id", (req, res) => {
  const { Tittel, Body } = req.body;

  db.run(
    "UPDATE Notes SET Tittel = ?, Body = ? WHERE Id = ?",
    [Tittel, Body, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Note updated" });
    }
  );
});


// ---------------- TODOS ----------------

// get folders (A-Z)
app.get("/folders", (req, res) => {
  db.all("SELECT * FROM TodoFolders ORDER BY Name ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// create folder
app.post("/folders", (req, res) => {
  const folderName = req.body.Name?.trim();

  if (!folderName) {
    return res.status(400).json({ error: "Missing folder name" });
  }

  db.run(
    "INSERT INTO TodoFolders (Name) VALUES (?)",
    [folderName],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({ error: "Folder already exists" });
        }

        return res.status(500).json({ error: err.message });
      }

      res.json({ id: this.lastID, Name: folderName });
    }
  );
});

// delete folder and all todos in that folder
app.delete("/folders/:id", (req, res) => {
  const folderId = req.params.id;

  db.run("DELETE FROM Todos WHERE FolderId = ?", [folderId], (todosErr) => {
    if (todosErr) return res.status(500).json({ error: todosErr.message });

    db.run("DELETE FROM TodoFolders WHERE Id = ?", [folderId], function (deleteErr) {
      if (deleteErr) return res.status(500).json({ error: deleteErr.message });

      if (this.changes === 0) {
        return res.status(404).json({ error: "Folder not found" });
      }

      res.json({ message: "Folder deleted" });
    });
  });
});

// get todos with folder name
app.get("/todos", (req, res) => {
  db.all(
    `
    SELECT
      Todos.*,
      TodoFolders.Name AS FolderName
    FROM Todos
    LEFT JOIN TodoFolders ON TodoFolders.Id = Todos.FolderId
    ORDER BY Todos.Id DESC
    `,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});


// create todo (inside folder or unsorted)
app.post("/todos", (req, res) => {
  const text = req.body.Text?.trim();
  const folderId = req.body.FolderId || null;

  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  db.run(
    "INSERT INTO Todos (Text, FolderId) VALUES (?, ?)",
    [text, folderId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ id: this.lastID, Text: text, Done: 0, FolderId: folderId });
    }
  );
});

// move todo to another folder
app.put("/todos/:id/folder", (req, res) => {
  const folderId = req.body.FolderId || null;

  db.run(
    "UPDATE Todos SET FolderId = ? WHERE Id = ?",
    [folderId, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Todo folder updated" });
    }
  );
});

// delete todo
app.delete("/todos/:id", (req, res) => {
  db.run("DELETE FROM Todos WHERE Id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Todo deleted" });
  });
});

// toggle done(button)
app.put("/todos/:id/toggle", (req, res) => {
  db.run(
    "UPDATE Todos SET Done = NOT Done WHERE Id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Toggled" });
    }
  );
});

// start server
app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});