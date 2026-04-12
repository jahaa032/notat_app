# Notat App

En enkel og praktisk notatapplikasjon med todo-liste.

Frontend er laget i HTML/CSS/JavaScript, backend kjører på Node.js + Express, og data lagres i SQLite.

---

## Funksjoner

- Opprette notater (`Tittel` + `Body`)
- Oppdatere og slette notater
- Opprette todo-oppgaver
- Markere todo som fullført / ikke fullført
- Laste inn data via REST API

---

## Teknologi

- Node.js
- Express
- SQLite (`sqlite3`)
- HTML, CSS, JavaScript
- Fetch API

---

## Mappestruktur

```text
notat_app/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── index.js
│   └── index.html
├── server.js
├── package.json
├── database.sql
└── README.md
```

---

## Kom i gang

### 1) Installer avhengigheter

```bash
npm install
```

### 2) Start server

Utvikling (automatisk restart):

```bash
npm run dev
```

Vanlig oppstart:

```bash
npm run start-server
```

Serveren kjører på `http://localhost:3000`.

---

## API-endepunkter

### Notes

- `GET /notes` - hent alle notater
- `POST /notes` - opprett notat
- `PUT /notes/:id` - oppdater notat
- `DELETE /notes/:id` - slett notat

Eksempel `POST /notes` body:

```json
{
  "Tittel": "Hei",
  "Body": "Dette er et notat"
}
```

### Todos

- `GET /todos` - hent alle todos
- `POST /todos` - opprett todo
- `PUT /todos/:id/toggle` - bytt fullført/ikke fullført
- `DELETE /todos/:id` - slett todo

Eksempel `POST /todos` body:

```json
{
  "Text": "Gjør lekser"
}
```

---

## Database

Databasen opprettes automatisk som en lokal fil (`notes.db`) når serveren starter.

Tabeller som opprettes:

- `Notes` (Id, Tittel, Body, CreatedAt)
- `Todos` (Id, Text, Done)

---

## Videre forbedringer

- Validering av input på frontend
- Søk/filter for notater
- Enhetstester for API
- Deploy (for eksempel Render eller Railway)