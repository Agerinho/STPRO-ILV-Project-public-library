# STPRO-ILV-Project-public-library

## Project Description
Wir brauchen eine Plattform für unsere öffentliche Bücherei. Kunden sollen online
sehen können welche Bücher sie derzeit ausgeliehen haben, wie lange die
Rückgabefrist noch gilt, ob sie offene Kosten haben und welche Bücher verfügbar sind
zum Ausleihen.
Die Mitarbeiter soll sehen welche User welche Bücher ausgelieben haben und welche
Bücher über der Rückgabefrist sind.
Es soll einfach zu bedienen sein und auch am Handy funktionieren. Die CI von der
Bücherei soll berücksichtigt werden.

## EXCERSICE 1 - DATA STRUCTURE
Customers:
- ID
- Name
- Email
- Phone
- Address

Employees:
- ID
- Name
- Email
- Phone
- Address

Books:
- ID
- Title
- Author
- ISBN
- Publication Date
- Language
- Price

BorrowedBooks:
- ID
- CustomerID
- BookID
- DueDate
- Fine

## Setup

Die App ist ein reines HTML/CSS/JS-Projekt und lädt die JSON-Daten über `fetch`. Browser blockieren `fetch` bei direkter Datei-Öffnung (`file://`), daher einen lokalen Server verwenden:

```bash
python3 -m http.server 8000
```

Anschließend im Browser `http://localhost:8000` öffnen.

Alternativ z.B. die VS Code-Erweiterung **Live Server** verwenden.
