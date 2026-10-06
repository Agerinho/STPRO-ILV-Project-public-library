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

## Corporate Identity & Design (CI/CD)
Da von der Bücherei keine feste CI vorgegeben war, wurde ein barrierefreies, freundliches und modernes Farb- und UI-System gestaltet:

### 1. Farbkonzept ("Salbei & Honig" – Standard / Empfohlen)
- **Primärfarbe (Bibliotheks-Petrol / Salbei – `#1b5e5a`):** Vermittelt Ruhe, Verlässlichkeit und Bildung.
- **Akzentfarbe (Warmes Bernstein / Honig – `#d97706`):** Warme Leseatmosphäre, Holzregale, animiert zum Entdecken & Reservieren.
- **Seitenhintergrund (Sanftes Papyrus – `#f8faf9`):** Reduziert Augenermüdung gegenüber grellem Weiß.
- **Karten & Flächen (`#ffffff`):** Strukturierte Buchkarten mit subtilen Schatten und weichen Ecken (`10px`).
- **Status-System (WCAG-konform):**
  - *Verfügbar / Beglichen:* Smaragdgrün (`#059669` auf `#ecfdf5`)
  - *Reserviert:* Bernstein/Ocker (`#b45309` auf `#fffbeb`)
  - *Überfällig / Mahnung:* Sanftes Korallrot (`#dc2626` auf `#fef2f2`)

### 2. Farbvarianten (Live umschaltbar im Header)
- **Salbei & Honig:** Freundlich, organisch, beruhigend.
- **Terracotta & Tintenblau:** Klassische Lesestube, warm & behaglich.
- **Nordisch Ozean & Gold:** Frisches, klares städtisches Portal.

### 3. Usability & Mobile Optimierung
- Responsive Layout mit optimierten Touch-Zielen (mind. 44px) für Smartphones.
- Schnell-Login für Kundin (Anna) & Mitarbeiterin (Clara) für komfortable Tests & Demos.
- Fallback-Buchcover mit Buchrücken-Icon, falls externe Bilder nicht geladen werden.
- Live-Filter im Katalog zum Durchsuchen von Titeln und Autoren.

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

## Algorithmen
### Berechnung der Gebühr
- Wenn das Buch nicht returniert wurde, startet die Gebühr bei 2€. Jede Woche erhöht sich die Gebühr um 20%.
- Input ist die borrowedBooks.json Datei.
- Output ist die berechnete Gebühr für jedes Buch.


## Setup

Die App ist ein reines HTML/CSS/JS-Projekt und lädt die JSON-Daten über `fetch`. Browser blockieren `fetch` bei direkter Datei-Öffnung (`file://`), daher einen lokalen Server verwenden:

```bash
python3 -m http.server 8000
```

Anschließend im Browser `http://localhost:8000` öffnen.

Alternativ z.B. die VS Code-Erweiterung **Live Server** verwenden.
