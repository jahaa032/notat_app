const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());            // allows requests from your HTML
app.use(express.json());    // parses JSON POST requests

// Connect to MariaDB
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'noteuser',
    password: 'Skole123',
    database: 'NotesDB'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MariaDB!');
});

// GET all notes
app.get('/notes', (req, res) => {
    db.query('SELECT * FROM Notes ORDER BY CreatedAt DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// POST a new note
app.post('/notes', (req, res) => {
    const { Tittel, Body } = req.body;
    if (!Tittel || !Body) return res.status(400).json({ error: 'Missing Tittel or Body' });

    db.query(
        'INSERT INTO Notes(Tittel, Body) VALUES (?, ?)',
        [Tittel, Body],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ id: results.insertId, Tittel, Body });
        }
    );
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));