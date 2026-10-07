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

### 1. Farbkonzept ("Nordisch Ozean & Gold")
- **Primärfarbe (Frisches Nordsee-Blau – `#0f5973`):** Klar, maritim, professionell und modern als festes Bibliotheks-Design.
- **Akzentfarbe (Sonniges Goldgelb – `#e69500`):** Hochwertiger Kontrast für Aktionen, Reservierungen und Hervorhebungen.
- **Seitenhintergrund (Helles Alabaster – `#f4f7f9`):** Frischer, augenschonender Hintergrund.
- **Karten & Flächen (`#ffffff`):** Strukturierte Buchkarten mit subtilen Schatten und weichen Ecken (`10px`).
- **Status-System (WCAG-konform):**
  - *Verfügbar / Beglichen:* Smaragdgrün (`#065f46` auf `#ecfdf5`)
  - *Reserviert:* Sonniges Gold / Bernstein (`#92400e` auf `#fffbeb`)
  - *Überfällig / Mahnung:* Sanftes Signalrot (`#991b1b` auf `#fef2f2`)

### 2. Usability, Struktur & Geschäftsregeln
- **Reiter-Navigation für Mitarbeiter (konsolidiert):**
  - 📖 *Ausgeliehen:* Alle aktiven Ausleihen mit Suchfilter und blockierter Rücknahme bei offenen Gebühren.
  - ⚠️ *Überfällig:* Direkte Übersicht überfälliger Fristen und Mahnstufen.
  - 📦 *Reserviert:* Abholbereite Bücher mit 1-Klick-Ausleihe.
  - 📚 *Verfügbare Bücher:* Eigene Bestandsseite mit Live-Suche, Anlegen, Bearbeiten und Löschen von Büchern.
  - 👥 *Kunden & Details:* Eigene Seite für Kundenauswahl, Detailprofil, Bearbeitung von Kundendaten und Vor-Ort-Zahlungsverbuchung.
- **Buch-Detailansicht (Dialog):** Kunden und Mitarbeiter können Bücher anklicken, um Klappentext, Inhaltsangabe, ISBN, Erscheinungsjahr und Status in einem modalen Dialog einzusehen. Kunden können verfügbare Bücher direkt im Dialog reservieren.
- **Bestandsverwaltung (CRUD):** Mitarbeiter können neue Bücher anlegen, vorhandene Bestandsdaten bearbeiten oder Bücher löschen (solange diese nicht verliehen/reserviert sind).
- **Kundendaten-Verwaltung:** Mitarbeiter können Kontaktdaten (Name, E-Mail, Telefon, Adresse) direkt über einen Dialog bearbeiten.
- **Rücknahmesperre bei offenen Gebühren:** Mitarbeiter können Bücher mit offenen Mahngebühren erst zurücknehmen, nachdem die Gebühr im Kundenkonto beglichen wurde.
- **Responsive Layout:** Optimiert für Desktop, Tablet und Smartphones.
- **Schnell-Login:** Für Kundin (Anna) & Mitarbeiterin (Clara) für komfortable Tests & Demos.

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
