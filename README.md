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
  - 📦 *Reserviert:* Abholbereite Bücher mit 1-Klick-Ausleihe.
  - 📚 *Verfügbare Bücher:* Eigene Bestandsseite mit Live-Suche, Anlegen, Bearbeiten und Löschen von Büchern.
  - � *Mahnwesen:* Eigene Seite für das Eintreiben offener Gebühren – mit Unter-Reitern für überfällige Bücher und Kunden mit offenem Saldo (siehe unten).
  - ⏳ *Verlängerungen:* Eingehende Anfragen von Kunden auf Fristverlängerung annehmen oder ablehnen.
  - �👥 *Kunden & Details:* Eigene Seite für Kundenauswahl, Detailprofil und Bearbeitung von Kundendaten.
- **Buch-Detailansicht (Dialog):** Kunden und Mitarbeiter können Bücher anklicken, um Klappentext, Inhaltsangabe, ISBN, Erscheinungsjahr und Status in einem modalen Dialog einzusehen. Kunden können verfügbare Bücher direkt im Dialog reservieren.
- **Bestandsverwaltung (CRUD):** Mitarbeiter können neue Bücher anlegen, vorhandene Bestandsdaten bearbeiten oder Bücher löschen (solange diese nicht verliehen/reserviert sind).
- **Kundendaten-Verwaltung:** Mitarbeiter können Kontaktdaten (Name, E-Mail, Telefon, Adresse) direkt über einen Dialog bearbeiten.
- **Rücknahmesperre bei offenen Gebühren:** Mitarbeiter können Bücher mit offenen Mahngebühren erst zurücknehmen, nachdem die Gebühr im Mahnwesen beglichen wurde.
- **Sortierung "Meine Bücher" (Kunde):** Kunden können ihre ausgeliehenen Bücher nach Status (überfällig zuerst), Rückgabedatum, Ausleihdatum oder Buchtitel sortieren.
- **Mahnwesen statt Teilzahlung (Mitarbeiter):** Offene Gebühren werden ausschließlich in einer einzigen Transaktion beglichen – entweder pro Buch einzeln oder gesammelt für den gesamten offenen Saldo eines Kunden. Dafür gibt es die eigene Mahnwesen-Seite mit zwei Unter-Reitern:
  - ⚠️ *Überfällige Bücher:* Liste aller überfälligen Ausleihen; im Detaildialog kann die Gebühr für genau dieses Buch beglichen werden.
  - 👥 *Kunden mit offenen Gebühren:* Liste aller Kunden mit offenem Saldo; im Detaildialog sieht man alle überfälligen Bücher des Kunden und kann je Buch oder den gesamten Saldo auf einmal begleichen.
- **Fristverlängerung (Kunde ↔ Mitarbeiter):** Kunden können pro Ausleihe einmalig eine Verlängerung um 14 oder 28 Tage beantragen. Mitarbeiter sehen die Anfrage im Reiter "Verlängerungen" und können sie annehmen (verschiebt `dueDate` in `borrowedBooks.json` und setzt `hasExtended: true`) oder ablehnen.
- **Bücherkatalog für Kunden:** Kunden sehen von Anfang an den gesamten Buchbestand – auch aktuell verliehene oder reservierte Bücher, klar als "nicht verfügbar" markiert. Für nicht verfügbare Bücher kann eine Vormerkung (Warteliste) angefragt werden; sobald das Buch zurückgegeben wird, rückt automatisch die nächste Person in der Warteliste nach.
- **Konsistente Button-Farben:** Der "Reservieren"-Button ist in der Buchliste/-katalog orange (Akzentfarbe), im Buch-Detaildialog dagegen blau (Primärfarbe), um Listen-Aktionen optisch von Dialog-Aktionen zu unterscheiden.
- **Responsive Layout:** Optimiert für Desktop, Tablet und Smartphones.
- **Schnell-Login:** Für Kundin (Anna) & Mitarbeiterin (Clara) für komfortable Tests & Demos. Ebenso kann der Datenbestand mit dem "Daten zurücksetzen" Button zurückgesetzt werden.

## EXCERSICE 1 - DATA STRUCTURE
Customers:
- id
- name
- email
- phone
- address

Employees:
- id
- name
- email
- phone
- address

Books:
- id
- title
- author
- isbn
- publicationDate
- language
- image
- description

BorrowedBooks:
- id
- customerId
- bookId
- borrowDate
- originalDueDate
- dueDate
- returnedAt
- extensions
- fine

## Algorithmen
### Berechnung der Gebühr
- Wenn das Buch nicht fristgerecht returniert wurde, startet die Gebühr bei 2€ (erste Woche). Jede darauffolgende Woche erhöht sich die Gebühr um 20% (2€ -> 2.40€ -> 2.88€ -> ...).
- Input ist die borrowedBooks.json Datei.
- Output ist die berechnete Gebühr für jedes Buch.


## Setup

Die App ist ein reines HTML/CSS/JS-Projekt und lädt die JSON-Daten über `fetch`. Browser blockieren `fetch` bei direkter Datei-Öffnung (`file://`), daher einen lokalen Server verwenden:

```bash
python3 -m http.server 8000
```

Anschließend im Browser `http://localhost:8000` öffnen.

Alternativ z.B. die VS Code-Erweiterung **Live Server** verwenden.
