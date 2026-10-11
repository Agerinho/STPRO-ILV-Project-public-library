# AI Promts
## 1.) 23.09
## SWE-1.7 Lightning Medium (Cognition)
help me setting up a simple (really simple, only for a small group project) for the project description described in Readme

## 2.) 23.09
## SWE-1.7 Lightning Medium (Cognition)
use json files for simplification. do not use a backend. use html, css, js

## 3.) 23.09
## SWE-1.7 Lightning Medium (Cognition)
change logic to not save overdue books, instead use an extra table for borrowed books

## 4.) 23.09
## SWE-1.7 Lightning Medium (Cognition)
implement a simple login feature for a customer and one employee

## 5.) 23.09
## SWE-1.7 Lightning Medium (Cognition)
change it to a email/password login. based on user email, show customer or employee view

## 6.) 30.09
## SWE-1.7 Lightning Medium (Cognition)
ändere die logik für die berechnung der mahngebühren wie in der readme.md beschrieben. errechne die gebühren beim öffnen der seite

## 7.) 30.09
## SWE-1.7 Lightning Medium (Cognition)
entferne die preise der bücher, da diese zum ausleihen kostenlos sein sollen. kosten fallen erst an, wenn die rückgabefrist überschritten wurde

## 8.) 30.09
## SWE-1.7 Lightning Medium (Cognition)
folgende todos:
entferne das kunden select in der kundenansicht,
erstelle eine eigene seite für die auflistung von verfügbaren Büchern für die Kunden,
kunden können ein verfügbares buch reservieren können,
wenn ein buch reserviert ist muss der kunde zur bilbiothek und das buch abholen,
wenn das buch abgeholt wurde erscheint das buch in seiner auflistung der ausgeliehenen bücher
ein mitarbeiter kann ein neues buch hinzufügen (button, der ein dialog öffnet und mit hilfe eines forms das buch in die books.json file schreibt),

## 9.) 30.09
## SWE-1.7 Lightning Medium (Cognition)
füge bilder zu den büchern hinzu, speicher den link zu den büchern in der books.json,
liste auch die verfügbaren bücher für die mitarbeiter auf,
entferne wieder die funktion dass ein mitarbeiter ein buch hinzufügen kann,
der mitarbeiter soll das buch auf "abgeholt" stellen können, nicht der Kunde

## 10.) 30.09
## SWE-1.7 Lightning Medium (Cognition)
der mitarbeiter kann ein buch wieder auf verfügbar stellen, wenn der kunde es zurückgibt,
der mitarbeiter kann in ein kundenkonto einsehen (zusammengezählt alle gebühren und eine auflistung er einzelnen gebühren pro buch), falls der Kunde vorort gezahlt hat, begleiche das konto (wenn vollständig gezahlt) oder ziehe den entsprechenden betrag vom gesamtkonto ab

## 11.) 30.09
## SWE-1.7 Lightning Medium (Cognition)
speichere die daten in den localstorage, damit die daten (halbwegs) persistiert werden können

## 12.) 06.10
## Gemini 3.8 Flash
help me improving the design of this project. there is no CI/CD available, so find a friendly colorset which applies to the users. the project is described in the readme.md

## 13.) 07.10
## Gemini 3.8 Flash
die ansicht für die mitarbeiter ist ziemlich lang. teile die einzelnen sections (ausgeliehene bücher, usw) besser auf. eventuell in reiter?,
erstelle auch für mitarbeiter und kunden eine eigene seite für verfügbare bücher,
ebenfalls sollen mitarbeiter nicht bücher zurücknehmen können die noch eine offene gebühr haben,

## 14.) 07.10
## Gemini 3.8 Flash
füge/bearbeite folgende features hinzu:
mitarbeiter sollten kundendaten bearbeiten können (in einem dialog),
mitarbeiter sollten bücher bearbeiten, löschen und neue hinzufügen können,
kunden sollen eine detailansicht von büchern sehen können (dialog). dort sollen sie mehrere details über das buch erhalten (kurzfassung, usw),
in der mitarbeiteransicht sind nun 2 menüs für das durchnavigieren verfügbar, lösche daher das obere menü,
behalte das Nordisch & Ozean theme, entferne die anderen themes und das select im header

## 15.) 10.10
## Clode Sonnet 5 Medium
add/update following features:
- add a sort functionality for customers in the "Meine Bücher" view where they can sort their books by book status (is in duedate, is over duedate), when they borrowed the book, name of the book
- refactor the dunning process for customers: employees should not able anymore to book partial bookings. instead the customer has to settle open payments individually for each book (in 1 transaction) OR for all together in one transaction. therefore employees should have an own page for the dunning (Mahnwesen). on this page there should be a list of all overdue borrowed books. in the details (dialog) of a book the employee can settle the payment. also there should be a second tab to switch to a view where all customers are listed which have open payments. employees can view the customer in a dialog and see which books are overdue from the selected customer.
- There also should be an option to extend the overdue date for the customer. customer can request an extend for the book (+ 14 days or 28 days). the employee has to accept the request but can also decline. borrowedBooks.json dueDate should be updated and a new attribute "hasExtended" has a bool value
- customer should initially see all books (even if they are currently borrowed by another user, but hide own booked books). of course with a mark if the booked is currently not available). A customer can request a reservation for the currently not available book.
- keep styles consistent (reserve button for users in available books is orange while the same button in the dialog is blue

## 16.) 11.10
## Clode Sonnet 5 Medium
- if book has the status for a customer "⏳ Auf Warteliste – wird frei, sobald das Buch zurückgegeben wurde". this book does not show in employees "Reserviert" List. which is confusing, because the count display includes this book but is not listed. also the list is for "abholbereite" books only. maybe add a new list to this section to display all reserved books but are currently not available for pick up (because it is borrowed by someone else).
- fix status badges in book details dialog as they are misleading and not showing correct data (remove the "Von Ihnen")
- check button styles. they should be consistent in the list and in the dialog elements.
- add a section for the customers to inspect their open payments as they need to have a better overview for the dunning.

## 17.) 11.10
## Clode Sonnet 5 Medium
Loan, fine and extension logic (summarized; this session came before the prompts in 16.):
- refactor borrowedBooks: replace `hasExtended` with an extension history. new structure: `borrowDate`, `originalDueDate` (immutable), `dueDate` (current), `returnedAt` (null while borrowed), `extensions` (list of `{date, days}`), `fine` (null while borrowed, final value after return). no stored `status`, it is derived via `getLoanStatus(loan)`
- add central `config.json` (`loanPeriodDays: 14`, `fine: {initialAmount: 2, weeklyIncrease: 0.2, maximumAmount: 20}`), no hardcoded values elsewhere
- fine = min(2 * 1.2^(week - 1), 20), only for overdue books, central function `calculateFine(dueDate, date)`. the current fine of active loans is calculated dynamically and never stored in localStorage; on return `returnedAt` is set and the final fine is stored in `fine`
- extensions are documented in `extensions`; only `dueDate` changes, `originalDueDate` stays. customers cannot extend overdue loans, employees can (courtesy extension). already incurred fines must not get lost on a courtesy extension. central functions e.g. `canExtendLoan`, `extendLoan`, `returnBook`
- migrate old localStorage data (with `hasExtended`) without crashing; adapt UI for customers (due date, status, current fine, extension info) and employees (create loan, return, extend, courtesy extend), show returned loans with return date and final fine
- finally summarize changed/new files, data structures, functions, fine calculation, extension and overdue handling, migration

Follow-ups:
- update the data structure section in the README
- refactor the json files to the new data structures if not already done; add a button to the demo section on the login page that resets localStorage and starts again with the dataset from the json files
- no status badges in the footer of the book detail dialog, only buttons

## 18.) 11.10
## Clode Sonnet 5 Medium
update the workflow for employees for reservated books. if a book got reserved by a customer, check first if the book is available and not currently booked by another customer. because, right now the employee can mark a reserved book as picked up, but the book is currently loaned by another user
