const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'noteuser',
    password: 'Skole123',
    database: 'NotesDB'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MariaDB!');

    db.query('SELECT * FROM Notes', (err, results) => {
        if (err) throw err;
        console.log('Notes', results);

        db.query(
            'INSERT INTO Notes(Tittel, Body) VALUES (?, ?)',
            ['Test Note', 'This is a small example'],
            (err, results) => {
                if (err) throw err;
                console.log('Insertet note into ID:', results.insertId);
                db.end();
            }
        );
    });
});