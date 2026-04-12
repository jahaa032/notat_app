const express = require("express"); 
// Express is the framework that lets us build the server and define API routes easily.

const cors = require("cors"); 
// CORS allows your frontend (browser) to safely communicate with this backend.

const sqlite3 = require("sqlite3").verbose(); 
// SQLite database driver. ".verbose()" gives more detailed error messages for debugging.

const path = require("path"); 
// Helps us safely work with file and folder paths across different operating systems.

const app = express();
const PORT = 3000;

// ----------------------
// MIDDLEWARE
// ----------------------

app.use(cors());
// Enables cross-origin requests (frontend can talk to backend even if ports differ).

app.use(express.json());
// Allows the server to read JSON data sent in request bodies (important for POST/PUT).

app.use(express.static(path.join(__dirname, "public")));
// Serves static frontend files (HTML, CSS, JS) from the "public" folder.

// ----------------------
// DATABASE SETUP
// ----------------------

const db = new sqlite3.Database("./notes.db", (err) => {
  // Opens (or creates) the SQLite database file.

  if (err) {
    console.error("DB connection error:", err);
    // Logs database connection issues if something goes wrong.
  } else {
    console.log("Connected to SQLite database");
    // Confirms successful connection.
  }
});

// Create the Notes table if it doesn't already exist
db.run(`
    CREATE TABLE IF NOT EXISTS Notes (
        Id INTEGER PRIMARY KEY AUTOINCREMENT, 
        -- Unique ID for each note, automatically increases

        Tittel TEXT,
        -- Title of the note

        Body TEXT,
        -- Main content of the note

        Done INTEGER DEFAULT 0,
        -- Used for future todo feature (0 = not done, 1 = done)

        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        -- Automatically stores when the note was created
    )
`);

// ----------------------
// ROUTES (API ENDPOINTS)
// ----------------------

// GET all notes
app.get("/notes", (req, res) => {
  // Fetches all notes from the database

  db.all(
    "SELECT Id as id, Tittel, Body, CreatedAt FROM Notes ORDER BY CreatedAt DESC",
    [],
    (err, rows) => {

      if (err) {
        return res.status(500).json({ error: err.message });
        // Sends server error if database query fails
      }

      res.json(rows);
      // Sends notes data to the frontend as JSON
    }
  );
});

// CREATE a new note
app.post("/notes", (req, res) => {
  console.log("POST /notes received:", req.body);
  // Logs incoming data for debugging

  const { Tittel, Body } = req.body;

  if (!Tittel || !Body) {
    return res.status(400).json({ error: "Missing fields" });
    // Prevents saving empty notes
  }

  db.run(
    "INSERT INTO Notes (Tittel, Body) VALUES (?, ?)",
    [Tittel, Body],
    function (err) {

      if (err) {
        return res.status(500).json({ error: err.message });
        // Handles database insert errors
      }

      res.json({
        id: this.lastID,
        // ID of newly created note

        Tittel,
        Body,
      });
    }
  );
});

// DELETE a note
app.delete("/notes/:id", (req, res) => {
  const id = req.params.id;
  // Gets the note ID from the URL

  db.run("DELETE FROM Notes WHERE Id = ?", [id], function (err) {

    if (err) {
      return res.status(500).json({ error: err.message });
      // Handles delete errors
    }

    res.json({ message: "Note deleted" });
    // Confirms successful deletion
  });
});

// UPDATE a note
app.put("/notes/:id", (req, res) => {
  const id = req.params.id;
  const { Tittel, Body } = req.body;
  // New updated values sent from frontend

  db.run(
    "UPDATE Notes SET Tittel = ?, Body = ? WHERE Id = ?",
    [Tittel, Body, id],
    function (err) {

      if (err) {
        return res.status(500).json({ error: err.message });
        // Handles update errors
      }

      res.json({ message: "Note updated" });
      // Confirms update success
    }
  );
});

app.get("/todos", (req, res) => {
  // Fetches all notes from the database

  db.all(
    "SELECT Id as id, Text, Done, CreatedAt FROM Notes ORDER BY CreatedAt DESC",
    [],
    (err, rows) => {

      if (err) {
        return res.status(500).json({ error: err.message });
        // Sends server error if database query fails
      }

      res.json(rows);
      // Sends notes data to the frontend as JSON
    }
  );
});

// CREATE a new note
app.post("/todos", (req, res) => {
  console.log("POST /todos received:", req.body);
  // Logs incoming data for debugging

  const { Text, Done } = req.body;

  if (!Text || !Done) {
    return res.status(400).json({ error: "Missing fields" });
    // Prevents saving empty notes
  }

  db.run(
    "INSERT INTO Todos (Text, Done) VALUES (?, ?)",
    [Text, Done],
    function (err) {

      if (err) {
        return res.status(500).json({ error: err.message });
        // Handles database insert errors
      }

      res.json({
        id: this.lastID,
        // ID of newly created note

        Text,
        Done,
      });
    }
  );
});

// DELETE a note
app.delete("/todos/:id", (req, res) => {
  const id = req.params.id;
  // Gets the note ID from the URL

  db.run("DELETE FROM Todos WHERE Id = ?", [id], function (err) {

    if (err) {
      return res.status(500).json({ error: err.message });
      // Handles delete errors
    }

    res.json({ message: "Todo Note deleted" });
    // Confirms successful deletion
  });
});

// UPDATE a Todo Note
app.put("/todos/:id/toggle", (req, res) => {
  const id = req.params.id;

  db.run(
    "UPDATE Todos SET Done = NOT Done WHERE Id = ?",
    [id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Toggled" });
    }
  );
});
// ----------------------
// START SERVER
// ----------------------

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  // Starts backend server so frontend can connect to it
});