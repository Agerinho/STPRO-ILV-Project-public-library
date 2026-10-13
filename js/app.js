let customers = [];
let books = [];
let employees = [];
let borrowedBooks = [];

// Zentrale Konfiguration (Ausleihfrist & Mahngebühren). Wird beim Start aus
// data/config.json geladen; die hier hinterlegten Werte dienen nur als
// Rückfallebene, falls die Datei nicht geladen werden kann.
let appConfig = {
  loanPeriodDays: 14,
  fine: { initialAmount: 2, weeklyIncrease: 0.2, maximumAmount: 20 }
};
let reservedBooks = [];
let customerPayments = {};
let extensionRequests = [];
let currentRole = null;
let currentUser = null;
let customerSearchQuery = '';

let currentEmployeeTab = 'borrowed';
let employeeSearchBorrowedQuery = '';
let employeeSearchAvailableQuery = '';
let employeeCustomerSearchQuery = '';
let customerCatalogSearchQuery = '';
let customerBorrowedSortKey = 'status';

let currentMahnwesenTab = 'overdue';
let extendRequestContext = null; // { borrowId } while the extend-request dialog is open

// ============================================================================
// THEME & PERSISTENZ (Nordischer Ozean & Gold)
// ============================================================================

function initTheme() {
  document.documentElement.setAttribute('data-theme', 'nordic-blue');
}

const defaultBookDescriptions = {
  1: "Die zeitlose philosophische Erzählung über den andalusischen Hirtenjungen Santiago, der sich auf eine Reise nach Ägypten begibt, um seinen persönlichen Lebensplan zu verwirklichen.",
  2: "George Orwells beklemmende Dystopie über einen totalitären Überwachungsstaat, den Großen Bruder und den mutigen Kampf des Einzelnen um Wahrheit und Gedankenfreiheit.",
  3: "Eine mitreißende Reise durch die Geschichte der Menschheit – von den ersten Jägern und Sammlern bis hin zu den Revolutionen der Landwirtschaft, Wissenschaft und modernen Technologie.",
  4: "Ein poetisches Märchen über Freundschaft, Liebe, Menschlichkeit und den Blick für das Wesentliche, das man nur mit dem Herzen gut sieht.",
  5: "Das monumentale Fantasy-Epos um den Einen Ring, Hobbits, Elben, Zwerge und den epischen Kampf um das Schicksal von Mittelerde.",
  6: "Der Beginn der magischen Saga um den Waisenjungen Harry Potter, der an seinem elften Geburtstag erfährt, dass er ein Zauberer ist und nach Hogwarts eingeladen wird.",
  7: "Franz Kafkas meisterhafte Erzählung über Gregor Samsa, der eines Morgens als ungeheures Ungeziefer erwacht und mit der Entfremdung seiner Familie konfrontiert wird.",
  8: "Leo Tolstois monumentales Meisterwerk über das Schicksal mehrerer russischer Adelsfamilien zur Zeit der Napoleonischen Kriege.",
  9: "Das fesselnde Porträt der Goldenen Zwanziger Jahre in New York über den mysteriösen Millionär Jay Gatsby und seine unglückliche Liebe zu Daisy Buchanan.",
  10: "Jane Austens geistreiche Gesellschaftskomödie über die scharfzüngige Elizabeth Bennet und den stolzen Mr. Darcy im ländlichen England des 19. Jahrhunderts.",
  11: "Herman Melvilles packendes Seefahrer-Epos über Kapitän Ahabs obsessive Jagd nach dem sagenumwobenen weißen Wal Moby Dick.",
  12: "Oscar Wildes düster-ästhetischer Roman über ewige Jugend, Verführung und ein Gemälde, das statt des Menschen altert und die Spuren seiner Sünden trägt.",
  13: "Friedrich Dürrenmatts geniale Tragikomödie über drei Physiker in einem Sanatorium und die ethische Verantwortung der Wissenschaft im Atomzeitalter.",
  14: "Goethes epochales Werk über den Gelehrten Heinrich Faust, der einen Pakt mit dem Teufel Mephisto schließt, um den Sinn des Lebens und vollkommenes Wissen zu erlangen.",
  15: "Günter Grass virtuoser Schelmenroman über Oskar Matzerath, der mit drei Jahren beschließt, nicht mehr zu wachsen und mit seiner Trommel gegen den Wahnsinn des 20. Jahrhunderts protestiert.",
  16: "Kafkas beklemmender Roman über Josef K., der ohne ersichtlichen Grund verhaftet wird und in die labyrinthartigen Mühlen einer unbegreiflichen Bürokratie gerät.",
  17: "Aldous Huxleys visionäre Dystopie über eine scheinbar perfekte, technokratische Zukunftsgesellschaft ohne Schmerz, aber auch ohne echte Gefühle und Freiheit.",
  18: "J.D. Salingers Kultroman über den jugendlichen Rebell Holden Caulfield und seine Orientierungssuche in den Straßen von New York.",
  19: "Patrick Süskinds faszinierende und schaurige Geschichte über Jean-Baptiste Grenouille, einen genialen Geruchskünstler im Frankreich des 18. Jahrhunderts.",
  20: "Umberto Ecos brillanter historischer Kriminalroman über den Franziskanermönch William von Baskerville, der in einer abgelegenen Benediktinerabtei mysteriöse Morde aufklärt.",
  21: "Michael Endes fantasievolles Meisterwerk über Bastian Balthasar Bux und das vom Nichts bedrohte Land Phantásien.",
  22: "Noah Gordons fesselnder historischer Roman über den jungen Engländer Rob Cole, der im 11. Jahrhundert nach Persien reist, um bei dem berühmten Arzt Avicenna Medizin zu lernen.",
  23: "Erich Maria Remarques weltberühmter Antikriegsroman über das erschütternde Schicksal junger Soldaten an der Front des Ersten Weltkriegs.",
  24: "Carlos Ruiz Zafóns atmosphärischer Bestseller über den Friedhof der Vergessenen Bücher im Barcelona des Jahres 1945 und ein geheimnisvolles Werk, das das Leben eines Jungen verändert.",
  25: "Donna Woolfolk Cross spannender historischer Roman über Johanna von Ingelheim, die sich im 9. Jahrhundert als Mann verkleidet und bis auf den Papstthron aufsteigt.",
  26: "Sabine Eberts packender historischer Roman über die junge Hebamme Marthe und die Besiedlung des Erzgebirges im Mittelalter.",
  27: "Markus Zusaks berührender Roman, erzählt vom Tod, über das Mädchen Liesel Meminger, das während des Zweiten Weltkriegs in Deutschland die rettende Kraft von Büchern entdeckt.",
  28: "Suzanne Collins weltbekannte Trilogie über Katniss Everdeen und ihren Überlebenskampf in den grausamen jährlichen Hungerspielen des Kapitols.",
  29: "J.R.R. Tolkiens bezaubernde Vorgeschichte zu Der Herr der Ringe über den gemütlichen Hobbit Bilbo Beutlin, der mit dreizehn Zwergen zum Einsamen Berg aufbricht.",
  30: "Ray Bradburys dystopischer Klassiker über eine Zukunft, in der Bücher verboten sind und Feuerwehrleute Brände legen, um Literatur zu vernichten."
};

function ensureBookDescriptions() {
  books.forEach(b => {
    if (!b.description) {
      b.description = defaultBookDescriptions[b.id] || "Ein herausragendes Werk aus dem Bestand unserer öffentlichen Bücherei.";
    }
  });
}

/**
 * Lädt die zentrale Konfiguration (Ausleihfrist & Mahngebührenstaffel) aus
 * data/config.json. Schlägt das fehl, wird mit den Standardwerten in
 * appConfig weitergearbeitet, damit die Anwendung nicht abstürzt.
 */
async function loadConfig() {
  try {
    const res = await fetch('data/config.json');
    appConfig = await res.json();
  } catch (e) {
    console.error('Konnte data/config.json nicht laden, verwende Standardwerte.', e);
  }
}

/**
 * Stellt sicher, dass ältere (bereits im localStorage gespeicherte) Datensätze
 * um neue Felder ergänzt werden, damit neuere Programmversionen nicht abstürzen.
 *
 * Migriert insbesondere die alte borrowedBooks-Struktur (mit `hasExtended`)
 * auf die neue Struktur mit `originalDueDate`, `extensions`, `returnedAt`
 * und `fine`. Die Funktion ist idempotent: Datensätze, die bereits im neuen
 * Format vorliegen, werden unverändert gelassen.
 */
function ensureDataDefaults() {
  borrowedBooks.forEach(bb => {
    if (!bb.borrowDate) bb.borrowDate = bb.dueDate;
    // Die ursprüngliche Frist ist bei alten Datensätzen nicht mehr bekannt.
    // Als bestmögliche, nachvollziehbare Annäherung wird die aktuell
    // gespeicherte dueDate als originalDueDate übernommen.
    if (!bb.originalDueDate) bb.originalDueDate = bb.dueDate;
    if (!Array.isArray(bb.extensions)) bb.extensions = [];
    if (!('returnedAt' in bb)) bb.returnedAt = null;
    if (!('fine' in bb)) bb.fine = null;
    // Zusätzliches, internes Feld: siehe extendLoan()/getCurrentFine() –
    // hält bereits entstandene Mahngebühren bei Kulanzverlängerungen fest.
    if (typeof bb.accruedFine !== 'number') bb.accruedFine = 0;
    delete bb.hasExtended;
  });
  let nextReservedId = Math.max(0, ...reservedBooks.map(rb => rb.id || 0)) + 1;
  reservedBooks.forEach(rb => {
    if (!rb.id) rb.id = nextReservedId++;
    if (!rb.status) rb.status = 'ready';
  });
  extensionRequests = extensionRequests || [];
}

function loadFromStorage() {
  const saved = localStorage.getItem('library_data');
  if (!saved) return false;
  try {
    const data = JSON.parse(saved);
    customers = data.customers || [];
    books = data.books || [];
    employees = data.employees || [];
    borrowedBooks = data.borrowedBooks || [];
    reservedBooks = data.reservedBooks || [];
    customerPayments = data.customerPayments || {};
    extensionRequests = data.extensionRequests || [];
    ensureBookDescriptions();
    ensureDataDefaults();
    return true;
  } catch (e) {
    console.error('Fehler beim Laden aus localStorage:', e);
    return false;
  }
}

function saveData() {
  localStorage.setItem('library_data', JSON.stringify({
    customers,
    books,
    employees,
    borrowedBooks,
    reservedBooks,
    customerPayments,
    extensionRequests
  }));
}

async function loadData() {
  await loadConfig();
  if (loadFromStorage()) {
    init();
    return;
  }
  const [cRes, bRes, eRes, bbRes] = await Promise.all([
    fetch('data/customers.json'),
    fetch('data/books.json'),
    fetch('data/employees.json'),
    fetch('data/borrowedBooks.json')
  ]);
  customers = await cRes.json();
  books = await bRes.json();
  employees = await eRes.json();
  borrowedBooks = await bbRes.json();
  reservedBooks = [];
  customerPayments = {};
  extensionRequests = [];
  ensureBookDescriptions();
  ensureDataDefaults();
  saveData();
  init();
}

// ============================================================================
// HILFSFUNKTIONEN & ALGORITHMEN
// ============================================================================

function findBook(id) {
  return books.find(b => b.id === id);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('de-AT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Nur Ausleihen, die aktuell noch nicht zurückgegeben wurden. Zurückgegebene
 * Ausleihen bleiben als historischer Datensatz in `borrowedBooks` erhalten,
 * zählen aber nirgends mehr als "aktuell ausgeliehen".
 */
function activeLoans() {
  return borrowedBooks.filter(bb => !bb.returnedAt);
}

/**
 * Zentrale Funktion zur Ermittlung des Ausleihstatus einer Ausleihe.
 * Der Status wird nie gespeichert, sondern stets aus den vorhandenen
 * Daten (returnedAt, dueDate) berechnet.
 */
function getLoanStatus(loan) {
  if (loan.returnedAt) return 'returned';
  return new Date() > new Date(loan.dueDate) ? 'overdue' : 'active';
}

function isOverdue(record) {
  return getLoanStatus(record) === 'overdue';
}

/**
 * Zentrale Mahngebühren-Berechnung. Erhält die (aktuell gültige) Rückgabefrist
 * sowie das Datum, bis zu dem die Gebühr berechnet werden soll (z.B. "heute"
 * für eine laufende Ausleihe oder das Rückgabedatum bei einer Rücknahme).
 * Gebühr = min(initialAmount * (1 + weeklyIncrease)^(Woche - 1), maximumAmount)
 */
function calculateFine(dueDate, date) {
  const due = new Date(dueDate);
  const ref = new Date(date);
  if (ref <= due) return 0;
  const diffDays = Math.floor((ref - due) / (1000 * 60 * 60 * 24));
  const week = Math.floor(diffDays / 7) + 1;
  const { initialAmount, weeklyIncrease, maximumAmount } = appConfig.fine;
  const amount = initialAmount * Math.pow(1 + weeklyIncrease, week - 1);
  return round2(Math.min(amount, maximumAmount));
}

/**
 * Aktuell gültige Mahngebühr einer Ausleihe – für aktive Ausleihen wird sie
 * jedes Mal dynamisch berechnet (und nie dauerhaft gespeichert), für bereits
 * zurückgegebene Ausleihen wird der bei der Rückgabe festgeschriebene,
 * endgültige Wert zurückgegeben. `accruedFine` enthält Mahngebühren, die vor
 * einer Kulanzverlängerung bereits entstanden sind (siehe extendLoan()).
 */
function getCurrentFine(loan) {
  if (loan.returnedAt) return loan.fine || 0;
  return round2((loan.accruedFine || 0) + calculateFine(loan.dueDate, new Date()));
}

/**
 * Darf eine Ausleihe verlängert werden? Kunden dürfen eine bereits überfällige
 * Ausleihe nicht selbst verlängern, Mitarbeiter hingegen schon (Kulanz).
 */
function canExtendLoan(loan, role) {
  if (loan.returnedAt) return false;
  if (role === 'employee') return true;
  return getLoanStatus(loan) === 'active';
}

/**
 * Verlängert eine Ausleihe um die angegebene Anzahl an Tagen und dokumentiert
 * die Verlängerung in `extensions`. `originalDueDate` bleibt dabei immer
 * unverändert. Bei einer Kulanzverlängerung (courtesy) einer bereits
 * überfälligen Ausleihe wird die bis dahin entstandene Mahngebühr in
 * `accruedFine` festgeschrieben, damit sie durch das Verschieben der
 * `dueDate` nicht verloren geht – künftige Mahngebühren werden danach wieder
 * ab der neuen `dueDate` berechnet.
 */
function extendLoan(loan, days, { courtesy = false } = {}) {
  if (courtesy) {
    loan.accruedFine = round2((loan.accruedFine || 0) + calculateFine(loan.dueDate, new Date()));
  }
  loan.dueDate = addDays(loan.dueDate, days);
  loan.extensions.push({ date: todayStr(), days });
}

/**
 * Schließt eine Ausleihe durch Rückgabe ab: Setzt `returnedAt` und schreibt
 * die endgültige Mahngebühr (inkl. evtl. bereits festgeschriebener
 * `accruedFine` aus Kulanzverlängerungen) in `fine`. Danach verändert sich
 * `fine` nicht mehr.
 */
function returnBook(loan, returnDateStr = todayStr()) {
  loan.returnedAt = returnDateStr;
  loan.fine = round2((loan.accruedFine || 0) + calculateFine(loan.dueDate, new Date(returnDateStr)));
}

function borrowedBookIds() {
  return new Set(activeLoans().map(bb => bb.bookId));
}

function reservedBookIds() {
  return new Set(reservedBooks.map(rb => rb.bookId));
}

function availableBooks() {
  const borrowed = borrowedBookIds();
  const reserved = reservedBookIds();
  return books.filter(b => !borrowed.has(b.id) && !reserved.has(b.id));
}

/**
 * Ermittelt den aktuellen Verfügbarkeitsstatus eines Buches: frei, ausgeliehen
 * oder zur Abholung reserviert – inklusive etwaiger Warteliste (Vormerkungen).
 */
function getBookAvailability(bookId) {
  const borrowRecord = activeLoans().find(bb => bb.bookId === bookId) || null;
  const readyReservation = reservedBooks.find(rb => rb.bookId === bookId && rb.status === 'ready') || null;
  const waitingReservations = reservedBooks
    .filter(rb => rb.bookId === bookId && rb.status === 'waiting')
    .sort((a, b) => a.id - b.id);
  const isFree = !borrowRecord && !readyReservation;
  return { borrowRecord, readyReservation, waitingReservations, isFree };
}

function nextReservedBookId() {
  return Math.max(0, ...reservedBooks.map(rb => rb.id || 0)) + 1;
}

/**
 * Wird aufgerufen, sobald ein Buch wieder frei wird (Rücknahme). Rückt die
 * nächste Person von der Warteliste (falls vorhanden) in den Status "ready" vor.
 */
function promoteWaitlist(bookId) {
  const waiting = reservedBooks
    .filter(rb => rb.bookId === bookId && rb.status === 'waiting')
    .sort((a, b) => a.id - b.id);
  if (waiting.length === 0) return;
  waiting[0].status = 'ready';
}

function bookImage(book) {
  if (!book) {
    return `<div class="book-cover-wrap"><div class="book-cover-placeholder"><span>📖</span></div></div>`;
  }
  if (!book.image) {
    return `<div class="book-cover-wrap"><div class="book-cover-placeholder"><span>📖</span></div></div>`;
  }
  return `
    <div class="book-cover-wrap">
      <img src="${book.image}" alt="${book.title}" loading="lazy" class="book-cover" onerror="this.onerror=null; this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">
      <div class="book-cover-placeholder" style="display:none;"><span>📖</span></div>
    </div>`;
}

function getCustomerPaid(customerId) {
  return customerPayments[customerId] || 0;
}

/**
 * Ermittelt, wie viel offene Mahngebühr für eine konkrete Ausleihe besteht.
 * Berücksichtigt Zahlungen des Kunden sequentiell auf dessen überfällige Bücher.
 */
function getBookOpenFine(bb) {
  if (!bb) return 0;
  const currentFine = getCurrentFine(bb);
  if (currentFine <= 0) return 0;
  const customerId = bb.customerId;
  const customerBorrows = borrowedBooks
    .filter(b => b.customerId == customerId)
    .map(b => ({ b, fine: getCurrentFine(b) }))
    .filter(entry => entry.fine > 0);
  const totalFines = customerBorrows.reduce((sum, entry) => sum + entry.fine, 0);
  const totalPaid = getCustomerPaid(customerId);
  if (totalPaid >= totalFines) return 0;

  // Zahlungen sequentiell anrechnen
  let remainingPaid = totalPaid;
  for (const entry of customerBorrows) {
    const covered = Math.min(entry.fine, remainingPaid);
    remainingPaid -= covered;
    if (entry.b.id === bb.id) {
      return Math.max(0, entry.fine - covered);
    }
  }
  return currentFine;
}

/**
 * Summe aller Mahngebühren (aktiv & bereits zurückgegeben) eines Kunden.
 */
function getCustomerTotalFines(customerId) {
  return borrowedBooks
    .filter(bb => bb.customerId == customerId)
    .reduce((sum, bb) => sum + getCurrentFine(bb), 0);
}

/**
 * Offener Gesamtsaldo (Mahngebühren) eines Kunden über alle Ausleihen hinweg.
 */
function getCustomerOpenBalance(customerId) {
  const totalFines = getCustomerTotalFines(customerId);
  const paid = getCustomerPaid(customerId);
  return Math.max(0, totalFines - paid);
}

/**
 * Liste aller Kunden mit offenem Saldo (für das Mahnwesen).
 */
function getCustomersWithOpenFines() {
  return customers
    .map(c => ({
      customer: c,
      overdueBooks: borrowedBooks.filter(bb => bb.customerId == c.id && isOverdue(bb)),
      open: getCustomerOpenBalance(c.id)
    }))
    .filter(entry => entry.open > 0);
}

/**
 * Begleicht die Mahngebühr für genau eine Ausleihe in einer einzigen Transaktion.
 */
function payBookFine(bb) {
  const openFine = getBookOpenFine(bb);
  if (openFine <= 0) return;
  const totalFines = getCustomerTotalFines(bb.customerId);
  const currentPaid = getCustomerPaid(bb.customerId);
  customerPayments[bb.customerId] = Math.min(currentPaid + openFine, totalFines);
  saveData();
}

/**
 * Begleicht den gesamten offenen Saldo eines Kunden in einer einzigen Transaktion.
 */
function payAllForCustomer(customerId) {
  customerPayments[customerId] = getCustomerTotalFines(customerId);
  saveData();
}

function updateBadge(id, count) {
  const badge = document.getElementById(id);
  if (badge) badge.textContent = count;
}

// ============================================================================
// BUCH-DETAIL DIALOG (FÜR KUNDEN & MITARBEITER)
// ============================================================================

function openBookDetailDialog(bookId) {
  const book = findBook(bookId);
  if (!book) return;

  const dialog = document.getElementById('book-detail-dialog');
  const body = document.getElementById('book-detail-body');
  const actionSlot = document.getElementById('book-detail-reserve-slot');

  const availability = getBookAvailability(book.id);
  const { borrowRecord, readyReservation, waitingReservations, isFree } = availability;

  let statusBadge = '';
  if (borrowRecord) {
    const overdue = isOverdue(borrowRecord);
    statusBadge += overdue
      ? `<span class="badge badge-danger">⚠️ Ausgeliehen – Rückgabe war fällig am ${formatDate(borrowRecord.dueDate)} (überfällig)</span>`
      : `<span class="badge badge-info">📅 Ausgeliehen – Rückgabe bis ${formatDate(borrowRecord.dueDate)}</span>`;
  }
  if (readyReservation) {
    statusBadge += ` <span class="badge badge-warning">${borrowRecord ? '🔖 Reserviert – wartet auf Rückgabe' : '📦 Reserviert zur Abholung'}</span>`;
  }
  if (!borrowRecord && !readyReservation) {
    statusBadge = '<span class="badge badge-success">✓ Im Bestand verfügbar</span>';
  }
  if (waitingReservations.length > 0) {
    statusBadge += ` <span class="badge badge-warning">⏳ ${waitingReservations.length} Vormerkung${waitingReservations.length === 1 ? '' : 'en'} auf der Warteliste</span>`;
  }

  body.innerHTML = `
    <div class="book-detail-cover-wrap">
      ${book.image ? `
        <img src="${book.image}" alt="${book.title}" class="book-detail-cover" onerror="this.onerror=null; this.src=''; this.parentElement.innerHTML='<div class=\\'book-cover-placeholder\\'><span>📖</span></div>';">
      ` : '<div class="book-cover-placeholder"><span>📖</span></div>'}
    </div>
    <div class="book-detail-info">
      <h4>${book.title}</h4>
      <div class="book-detail-author">von ${book.author}</div>
      <div class="book-badges">
        ${statusBadge}
      </div>
      <div class="book-detail-metadata-grid">
        <span class="book-detail-meta-label">ISBN:</span>
        <span class="book-detail-meta-val">${book.isbn || 'Keine Angabe'}</span>
        <span class="book-detail-meta-label">Erscheinungsjahr:</span>
        <span class="book-detail-meta-val">${book.publicationDate || 'Keine Angabe'}</span>
        <span class="book-detail-meta-label">Sprache:</span>
        <span class="book-detail-meta-val">${book.language || 'Deutsch'}</span>
        <span class="book-detail-meta-label">Buch-ID:</span>
        <span class="book-detail-meta-val">#${book.id}</span>
      </div>
      <div class="book-detail-desc-box">
        <div class="book-detail-desc-title">Kurzfassung & Inhaltsangabe</div>
        <p class="book-detail-desc">${book.description || defaultBookDescriptions[book.id] || 'Zu diesem Werk liegt aktuell noch keine redaktionelle Kurzfassung vor.'}</p>
      </div>
    </div>
  `;

  if (actionSlot) {
    if (currentRole === 'customer') {
      const myReservation = reservedBooks.find(rb => rb.bookId === book.id && rb.customerId == currentUser.id);
      if (isFree) {
        actionSlot.innerHTML = `<button class="btn-reserve btn-modal-reserve" data-bookid="${book.id}">📖 Jetzt reservieren</button>`;
      } else if ((borrowRecord && borrowRecord.customerId == currentUser.id) || myReservation) {
        actionSlot.innerHTML = '';
      } else {
        actionSlot.innerHTML = `<button class="btn-reserve btn-waitlist btn-modal-waitlist" data-bookid="${book.id}">⏳ Vormerken (Warteliste)</button>`;
      }
    } else if (currentRole === 'employee') {
      actionSlot.innerHTML = `<button class="btn-secondary btn-edit-book-from-dialog" data-bookid="${book.id}">✏️ Buch bearbeiten</button>`;
    } else {
      actionSlot.innerHTML = '';
    }
  }

  dialog.showModal();
}

// ============================================================================
// KUNDENDATEN BEARBEITEN (DIALOG FÜR MITARBEITER)
// ============================================================================

function openCustomerEditDialog(customerId) {
  const customer = customers.find(c => c.id == customerId);
  if (!customer) return;

  const dialog = document.getElementById('customer-dialog');
  document.getElementById('cust-edit-id').value = customer.id;
  document.getElementById('cust-edit-name').value = customer.name || '';
  document.getElementById('cust-edit-email').value = customer.email || '';
  document.getElementById('cust-edit-phone').value = customer.phone || '';
  document.getElementById('cust-edit-address').value = customer.address || '';
  document.getElementById('customer-dialog-subtitle').textContent = `Bibliotheksausweis #${customer.id}`;

  dialog.showModal();
}

function handleCustomerEditSubmit(e) {
  e.preventDefault();
  const id = parseInt(document.getElementById('cust-edit-id').value);
  const customer = customers.find(c => c.id == id);
  if (!customer) return;

  customer.name = document.getElementById('cust-edit-name').value.trim();
  customer.email = document.getElementById('cust-edit-email').value.trim();
  customer.phone = document.getElementById('cust-edit-phone').value.trim();
  customer.address = document.getElementById('cust-edit-address').value.trim();

  // Falls der gerade eingeloggte Benutzer diese Person ist
  if (currentUser && currentUser.id == customer.id) {
    currentUser = customer;
    document.getElementById('user-name').textContent = `${currentUser.name} (${currentRole === 'customer' ? 'Kunde' : 'Mitarbeiter'})`;
    renderCustomerInfo();
  }

  saveData();

  // Dropdown-Texte und Ansichten aktualisieren
  const empSel = document.getElementById('employee-customer-select');
  if (empSel) {
    const opt = empSel.querySelector(`option[value="${id}"]`);
    if (opt) {
      opt.textContent = `${customer.name} (Ausweis #${customer.id} • ${customer.email})`;
    }
  }

  if (currentRole === 'employee') {
    renderEmployee();
  }

  document.getElementById('customer-dialog').close();
}

// ============================================================================
// BÜCHER VERWALTEN (ANLEGEN, BEARBEITEN, LÖSCHEN DURCH MITARBEITER)
// ============================================================================

function openBookFormDialog(bookId = null) {
  const dialog = document.getElementById('book-form-dialog');
  const titleEl = document.getElementById('book-form-dialog-title');
  const form = document.getElementById('book-edit-form');
  form.reset();

  if (bookId) {
    const book = findBook(bookId);
    if (!book) return;
    titleEl.textContent = 'Buch bearbeiten';
    document.getElementById('book-form-id').value = book.id;
    document.getElementById('book-form-title').value = book.title || '';
    document.getElementById('book-form-author').value = book.author || '';
    document.getElementById('book-form-isbn').value = book.isbn || '';
    document.getElementById('book-form-pubdate').value = book.publicationDate || '';
    document.getElementById('book-form-language').value = book.language || 'Deutsch';
    document.getElementById('book-form-image').value = book.image || '';
    document.getElementById('book-form-desc').value = book.description || '';
  } else {
    titleEl.textContent = 'Neues Buch anlegen';
    document.getElementById('book-form-id').value = '';
    document.getElementById('book-form-language').value = 'Deutsch';
    document.getElementById('book-form-image').value = `https://picsum.photos/seed/book${Date.now() % 1000}/150/220`;
  }

  dialog.showModal();
}

function handleBookFormSubmit(e) {
  e.preventDefault();
  const idStr = document.getElementById('book-form-id').value;
  const title = document.getElementById('book-form-title').value.trim();
  const author = document.getElementById('book-form-author').value.trim();
  const isbn = document.getElementById('book-form-isbn').value.trim();
  const pubdate = document.getElementById('book-form-pubdate').value.trim();
  const language = document.getElementById('book-form-language').value.trim() || 'Deutsch';
  const image = document.getElementById('book-form-image').value.trim() || 'https://picsum.photos/seed/book/150/220';
  const description = document.getElementById('book-form-desc').value.trim();

  if (idStr) {
    // Bearbeiten
    const id = parseInt(idStr);
    const book = findBook(id);
    if (book) {
      book.title = title;
      book.author = author;
      book.isbn = isbn;
      book.publicationDate = pubdate;
      book.language = language;
      book.image = image;
      book.description = description;
    }
  } else {
    // Neues Buch anlegen
    const newId = Math.max(...books.map(b => b.id), 0) + 1;
    books.push({
      id: newId,
      title,
      author,
      isbn,
      publicationDate: pubdate,
      language,
      image,
      description
    });
  }

  saveData();
  renderEmployee();
  if (currentRole === 'customer') {
    renderCustomer();
  }
  document.getElementById('book-form-dialog').close();
}

function deleteBook(bookId) {
  const book = findBook(bookId);
  if (!book) return;

  // Prüfen, ob Buch gerade ausgeliehen oder reserviert ist
  if (activeLoans().some(bb => bb.bookId == bookId)) {
    alert(`Das Buch "${book.title}" ist aktuell verliehen und kann nicht gelöscht werden.`);
    return;
  }
  if (reservedBooks.some(rb => rb.bookId == bookId)) {
    alert(`Das Buch "${book.title}" ist aktuell reserviert und kann nicht gelöscht werden.`);
    return;
  }

  if (!confirm(`Möchten Sie das Buch "${book.title}" von ${book.author} wirklich unwiderruflich aus dem Bestand löschen?`)) {
    return;
  }

  const idx = books.findIndex(b => b.id == bookId);
  if (idx !== -1) {
    books.splice(idx, 1);
  }

  const detailDialog = document.getElementById('book-detail-dialog');
  if (detailDialog && detailDialog.open) {
    detailDialog.close();
  }

  saveData();
  renderEmployee();
  if (currentRole === 'customer') {
    renderCustomer();
  }
}

// ============================================================================
// KUNDENANSICHT RENDERN
// ============================================================================

function renderCustomerInfo() {
  const customer = currentUser;
  const myBorrows = activeLoans().filter(bb => bb.customerId == customer.id);
  const myReserved = reservedBooks.filter(rb => rb.customerId == customer.id);
  const openBalance = getCustomerOpenBalance(customer.id);

  document.getElementById('customer-info').innerHTML = `
    <div class="member-card">
      <div class="member-card-header">
        <div class="member-avatar" aria-hidden="true">📖</div>
        <div class="member-details">
          <span class="member-tag">Bibliotheksausweis</span>
          <h3 class="member-name">${customer.name}</h3>
          <div class="member-meta">
            <span>✉️ ${customer.email}</span>
            <span>📞 ${customer.phone}</span>
            <span>📍 ${customer.address}</span>
          </div>
        </div>
      </div>
      <div class="member-stats">
        <div class="stat-pill">
          <span class="stat-value">${myBorrows.length}</span>
          <span class="stat-label">Ausgeliehen</span>
        </div>
        <div class="stat-pill">
          <span class="stat-value">${myReserved.length}</span>
          <span class="stat-label">Reserviert</span>
        </div>
        <div class="stat-pill ${openBalance > 0 ? 'stat-warning' : 'stat-ok'}">
          <span class="stat-value">€ ${openBalance.toFixed(2)}</span>
          <span class="stat-label">${openBalance > 0 ? 'Offene Mahngebühren' : 'Keine offenen Gebühren'}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Sortiert die Liste der ausgeliehenen Bücher eines Kunden nach dem gewählten Kriterium.
 */
function sortCustomerBorrowed(entries, key) {
  const sorted = [...entries];
  switch (key) {
    case 'dueDate':
      sorted.sort((a, b) => new Date(a.bb.dueDate) - new Date(b.bb.dueDate));
      break;
    case 'borrowDate':
      sorted.sort((a, b) => new Date(a.bb.borrowDate) - new Date(b.bb.borrowDate));
      break;
    case 'title':
      sorted.sort((a, b) => a.book.title.localeCompare(b.book.title, 'de'));
      break;
    case 'status':
    default:
      sorted.sort((a, b) => {
        const aOverdue = isOverdue(a.bb) ? 1 : 0;
        const bOverdue = isOverdue(b.bb) ? 1 : 0;
        if (aOverdue !== bOverdue) return bOverdue - aOverdue;
        return new Date(a.bb.dueDate) - new Date(b.bb.dueDate);
      });
      break;
  }
  return sorted;
}

function renderCustomerBorrowed() {
  const list = document.getElementById('customer-borrowed');
  list.innerHTML = '';
  let myBorrows = activeLoans()
    .filter(bb => bb.customerId == currentUser.id)
    .map(bb => ({ bb, book: findBook(bb.bookId) }))
    .filter(entry => !!entry.book);
  updateBadge('badge-cust-borrowed', myBorrows.length);

  const sortSelect = document.getElementById('customer-borrowed-sort');
  if (sortSelect) sortSelect.value = customerBorrowedSortKey;

  if (myBorrows.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <span class="empty-icon" aria-hidden="true">📚</span>
        <p>Aktuell haben Sie keine Bücher ausgeliehen.</p>
      </li>`;
    return;
  }

  myBorrows = sortCustomerBorrowed(myBorrows, customerBorrowedSortKey);

  myBorrows.forEach(({ bb, book }) => {
    const li = document.createElement('li');
    li.className = 'book-card-item';
    const status = getLoanStatus(bb);
    const overdue = status === 'overdue';
    const fine = getCurrentFine(bb);
    const openFine = getBookOpenFine(bb);
    const pendingExtension = extensionRequests.find(r => r.borrowId === bb.id && r.status === 'pending');

    let extensionBadge = '';
    let extensionButton = '';
    if (bb.extensions.length > 0) {
      extensionBadge = `<span class="badge badge-info">✓ ${bb.extensions.length}x verlängert</span>`;
    } else if (pendingExtension) {
      extensionBadge = `<span class="badge badge-warning">⏳ Verlängerung beantragt (wartet auf Bestätigung)</span>`;
    } else if (canExtendLoan(bb, 'customer')) {
      extensionButton = `<button class="btn-secondary btn-sm btn-request-extension" data-borrowid="${bb.id}">⏳ Frist verlängern beantragen</button>`;
    }

    li.innerHTML = `
      <div class="book-card ${overdue ? 'card-overdue' : ''}">
        ${bookImage(book)}
        <div class="book-details">
          <div class="book-header">
            <h4 class="book-title">${book.title}</h4>
            <div class="book-author">von ${book.author}</div>
            <div class="book-meta-sub">
              <span>ISBN: ${book.isbn || '—'}</span>
              <span>Jahr: ${book.publicationDate || '—'}</span>
              <span>Ausgeliehen am: ${formatDate(bb.borrowDate)}</span>
            </div>
          </div>
          <div class="book-badges">
            <span class="badge ${overdue ? 'badge-danger' : 'badge-info'}">
              📅 Rückgabe bis: ${formatDate(bb.dueDate)} ${overdue ? '(Überfällig!)' : ''}
            </span>
            ${openFine > 0 
              ? `<span class="badge badge-danger">⚠️ Offene Kosten: € ${openFine.toFixed(2)}</span>` 
              : fine > 0
                ? `<span class="badge badge-success">✓ Gebühr beglichen (€ ${fine.toFixed(2)})</span>`
                : `<span class="badge badge-success">✓ Fristgerecht</span>`}
            ${extensionBadge}
          </div>
          <div class="book-footer">
            <button class="btn-secondary btn-sm btn-book-details" data-bookid="${book.id}">ℹ️ Details anzeigen</button>
            ${extensionButton}
          </div>
        </div>
      </div>`;
    list.appendChild(li);
  });
}

/**
 * Zeigt die bereits abgeschlossenen (zurückgegebenen) Ausleihen eines Kunden
 * an – inkl. Rückgabedatum und der dabei endgültig festgeschriebenen
 * Mahngebühr (siehe returnBook()).
 */
function renderCustomerHistory() {
  const list = document.getElementById('customer-history');
  if (!list) return;
  list.innerHTML = '';
  const myHistory = borrowedBooks
    .filter(bb => bb.customerId == currentUser.id && bb.returnedAt)
    .map(bb => ({ bb, book: findBook(bb.bookId) }))
    .filter(entry => !!entry.book)
    .sort((a, b) => new Date(b.bb.returnedAt) - new Date(a.bb.returnedAt));
  updateBadge('badge-cust-history', myHistory.length);

  if (myHistory.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <span class="empty-icon" aria-hidden="true">🗂️</span>
        <p>Noch keine abgeschlossenen Ausleihen vorhanden.</p>
      </li>`;
    return;
  }

  myHistory.forEach(({ bb, book }) => {
    const li = document.createElement('li');
    li.className = 'book-card-item';
    const fine = bb.fine || 0;
    li.innerHTML = `
      <div class="book-card">
        ${bookImage(book)}
        <div class="book-details">
          <div class="book-header">
            <h4 class="book-title">${book.title}</h4>
            <div class="book-author">von ${book.author}</div>
          </div>
          <div class="book-badges">
            <span class="badge badge-info">📅 Ausgeliehen am: ${formatDate(bb.borrowDate)}</span>
            <span class="badge badge-success">↩️ Zurückgegeben am: ${formatDate(bb.returnedAt)}</span>
            ${fine > 0
              ? `<span class="badge badge-danger">💶 Endgültige Mahngebühr: € ${fine.toFixed(2)}</span>`
              : `<span class="badge badge-success">✓ Keine Mahngebühr</span>`}
          </div>
          <div class="book-footer">
            <button class="btn-secondary btn-sm btn-book-details" data-bookid="${book.id}">ℹ️ Details anzeigen</button>
          </div>
        </div>
      </div>`;
    list.appendChild(li);
  });
}

/**
 * Übersicht aller Mahngebühren eines Kunden (laufende und bereits
 * abgeschlossene Ausleihen) inkl. Gesamtsumme, bereits bezahltem Betrag und
 * offenem Saldo. Alle Werte stammen aus getCurrentFine() bzw. den
 * Zahlungsfunktionen und werden nur berechnet, nicht gespeichert.
 */
function renderCustomerFees() {
  const list = document.getElementById('customer-fees');
  const summary = document.getElementById('customer-fees-summary');
  if (!list || !summary) return;
  list.innerHTML = '';
  const entries = borrowedBooks
    .filter(bb => bb.customerId == currentUser.id && getCurrentFine(bb) > 0)
    .map(bb => ({ bb, book: findBook(bb.bookId) }))
    .filter(entry => !!entry.book)
    .sort((a, b) => new Date(b.bb.dueDate) - new Date(a.bb.dueDate));
  const total = getCustomerTotalFines(currentUser.id);
  const paid = Math.min(getCustomerPaid(currentUser.id), total);
  const open = getCustomerOpenBalance(currentUser.id);
  const { initialAmount, weeklyIncrease, maximumAmount } = appConfig.fine;
  updateBadge('badge-cust-fees', entries.length);
  updateBadge('badge-tab-cust-fees', entries.filter(e => getBookOpenFine(e.bb) > 0).length);

  summary.innerHTML = `
    <div class="info-banner">
      <span>ℹ️ Für überfällige Bücher fallen Mahngebühren an: ${initialAmount.toFixed(2)} € in der ersten überfälligen Woche, danach steigt der Betrag je angefangener Woche um ${Math.round(weeklyIncrease * 100)} % (maximal ${maximumAmount.toFixed(2)} €). Die Gebühr wird bei der Rückgabe des Buches vor Ort beglichen.</span>
    </div>
    <div class="account-kpis">
      <div class="stat-pill">
        <span class="stat-label">Gesamt angefallen</span>
        <span class="stat-value">€ ${total.toFixed(2)}</span>
      </div>
      <div class="stat-pill stat-ok">
        <span class="stat-label">Bereits bezahlt</span>
        <span class="stat-value">€ ${paid.toFixed(2)}</span>
      </div>
      <div class="stat-pill ${open > 0 ? 'stat-warning' : 'stat-ok'}">
        <span class="stat-label">Offener Betrag</span>
        <span class="stat-value">€ ${open.toFixed(2)}</span>
      </div>
    </div>`;

  if (entries.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <span class="empty-icon" aria-hidden="true">✅</span>
        <p>Es sind keine Mahngebühren angefallen.</p>
      </li>`;
    return;
  }

  entries.forEach(({ bb, book }) => {
    const status = getLoanStatus(bb);
    const fine = getCurrentFine(bb);
    const openFine = getBookOpenFine(bb);
    const li = document.createElement('li');
    li.className = 'book-card-item';
    li.innerHTML = `
      <div class="book-card ${status === 'overdue' ? 'card-overdue' : ''}">
        ${bookImage(book)}
        <div class="book-details">
          <div class="book-header">
            <h4 class="book-title">${book.title}</h4>
            <div class="book-author">von ${book.author}</div>
            <div class="book-meta-sub">
              <span>Ausgeliehen am: ${formatDate(bb.borrowDate)}</span>
              <span>Frist: ${formatDate(bb.dueDate)}</span>
              ${bb.returnedAt ? `<span>Zurückgegeben am: ${formatDate(bb.returnedAt)}</span>` : ''}
            </div>
          </div>
          <div class="book-badges">
            ${status === 'overdue'
              ? `<span class="badge badge-danger">⚠️ Überfällig – Gebühr steigt wöchentlich</span>`
              : status === 'returned'
                ? `<span class="badge badge-info">↩️ Zurückgegeben – endgültige Gebühr</span>`
                : `<span class="badge badge-warning">⏳ Bereits angefallene Gebühr (Kulanzverlängerung)</span>`}
            <span class="badge badge-danger">💶 Gebühr: € ${fine.toFixed(2)}</span>
            ${openFine > 0
              ? `<span class="badge badge-danger">Offen: € ${openFine.toFixed(2)}</span>`
              : `<span class="badge badge-success">✓ Bezahlt</span>`}
          </div>
        </div>
      </div>`;
    list.appendChild(li);
  });
}

function renderCustomerReserved() {
  const list = document.getElementById('customer-reserved');
  list.innerHTML = '';
  const myReserved = reservedBooks.filter(rb => rb.customerId == currentUser.id);
  updateBadge('badge-cust-reserved', myReserved.length);

  if (myReserved.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <span class="empty-icon" aria-hidden="true">🔖</span>
        <p>Keine offenen Reservierungen vorhanden.</p>
      </li>`;
    return;
  }

  myReserved.forEach(rb => {
    const book = findBook(rb.bookId);
    if (!book) return;
    const li = document.createElement('li');
    li.className = 'book-card-item';
    const isReady = rb.status === 'ready';
    li.innerHTML = `
      <div class="book-card card-reserved">
        ${bookImage(book)}
        <div class="book-details">
          <div class="book-header">
            <h4 class="book-title">${book.title}</h4>
            <div class="book-author">von ${book.author}</div>
          </div>
          <div class="book-badges">
            ${isReady
              ? `<span class="badge badge-warning">🔖 Reserviert – bitte vor Ort in der Bibliothek abholen</span>`
              : `<span class="badge badge-warning">⏳ Auf Warteliste – wird frei, sobald das Buch zurückgegeben wurde</span>`}
          </div>
          <div class="book-footer">
            <button class="btn-secondary btn-sm btn-book-details" data-bookid="${book.id}">ℹ️ Details anzeigen</button>
          </div>
        </div>
      </div>`;
    list.appendChild(li);
  });
}

/**
 * Zeigt den vollständigen Bücherkatalog für Kunden an – inklusive aktuell
 * nicht verfügbarer Bücher, die wahlweise auf die Warteliste vorgemerkt
 * werden können.
 */
function renderCustomerCatalog() {
  const list = document.getElementById('customer-available');
  list.innerHTML = '';
  // Bücher, die der Kunde bereits selbst ausgeliehen hat, werden im Katalog
  // nicht noch einmal angezeigt (siehe stattdessen "Meine Bücher").
  let catalog = books.filter(b => {
    const borrowRecord = activeLoans().find(bb => bb.bookId === b.id);
    return !(borrowRecord && borrowRecord.customerId == currentUser.id);
  });
  updateBadge('badge-cust-available', catalog.length);

  if (customerCatalogSearchQuery) {
    const q = customerCatalogSearchQuery.toLowerCase();
    catalog = catalog.filter(b =>
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q)) ||
      (b.isbn && b.isbn.toLowerCase().includes(q))
    );
  }

  if (catalog.length === 0) {
    list.innerHTML = `
      <li class="empty-state" style="grid-column: 1 / -1;">
        <span class="empty-icon" aria-hidden="true">🔍</span>
        <p>Keine Treffer für Ihre Suche.</p>
      </li>`;
    return;
  }

  catalog.forEach(b => {
    const li = document.createElement('li');
    li.className = 'book-card-item';
    const { borrowRecord, readyReservation, isFree } = getBookAvailability(b.id);
    const myReservation = reservedBooks.find(rb => rb.bookId === b.id && rb.customerId == currentUser.id);

    let statusBadge;
    let actionHtml;
    if (isFree) {
      statusBadge = `<span class="badge badge-success">✓ Verfügbar</span>`;
      actionHtml = `<button class="btn-reserve btn-sm" data-bookid="${b.id}">📖 Reservieren</button>`;
    } else if (myReservation && myReservation.status === 'ready') {
      statusBadge = `<span class="badge badge-warning">📦 Für Sie bereit zur Abholung</span>`;
      actionHtml = '';
    } else if (myReservation && myReservation.status === 'waiting') {
      statusBadge = `<span class="badge badge-warning">⏳ Sie stehen auf der Warteliste</span>`;
      actionHtml = '';
    } else if (borrowRecord) {
      statusBadge = `<span class="badge badge-danger">📅 Nicht verfügbar – ausgeliehen bis ${formatDate(borrowRecord.dueDate)}</span>`;
      actionHtml = `<button class="btn-reserve btn-sm btn-waitlist" data-bookid="${b.id}">⏳ Vormerken</button>`;
    } else {
      statusBadge = `<span class="badge badge-danger">📦 Nicht verfügbar – bereits reserviert</span>`;
      actionHtml = `<button class="btn-reserve btn-sm btn-waitlist" data-bookid="${b.id}">⏳ Vormerken</button>`;
    }

    li.innerHTML = `
      <div class="book-card book-grid-card">
        <div class="book-card-top">
          ${bookImage(b)}
          <div class="book-details">
            <div class="book-header">
              <h4 class="book-title">${b.title}</h4>
              <div class="book-author">von ${b.author}</div>
              <div class="book-meta-sub">
                <span>ISBN: ${b.isbn || '—'}</span>
              </div>
            </div>
            <div class="book-badges">${statusBadge}</div>
          </div>
        </div>
        <div class="book-footer book-actions-customer">
          <button class="btn-secondary btn-sm btn-book-details" data-bookid="${b.id}">ℹ️ Details</button>
          ${actionHtml}
        </div>
      </div>`;
    list.appendChild(li);
  });
}

function renderCustomer() {
  renderCustomerInfo();
  renderCustomerBorrowed();
  renderCustomerReserved();
  renderCustomerHistory();
  renderCustomerFees();
  renderCustomerCatalog();
}

// ============================================================================
// MITARBEITERANSICHT RENDERN & REITER-LOGIK
// ============================================================================

function showEmployeeTab(tab) {
  currentEmployeeTab = tab;
  const tabs = ['borrowed', 'reserved', 'available', 'mahnwesen', 'extensions', 'customers'];
  tabs.forEach(t => {
    const panel = document.getElementById(`emp-panel-${t}`);
    const btn = document.getElementById(`btn-emp-tab-${t}`);
    if (panel) panel.classList.toggle('hidden', t !== tab);
    if (btn) {
      btn.classList.toggle('active', t === tab);
      btn.setAttribute('aria-selected', t === tab ? 'true' : 'false');
    }
  });
}

function selectCustomerAndSwitchTab(customerId) {
  showEmployeeTab('customers');
  const empSel = document.getElementById('employee-customer-select');
  if (empSel) {
    empSel.value = customerId;
    renderCustomerAccount(customerId);
  }
}

/**
 * Wechselt für einen Mitarbeiter direkt in das Mahnwesen und öffnet dort den
 * Kundendialog mit den offenen Gebühren des gewählten Kunden.
 */
function openMahnwesenForCustomer(customerId) {
  showEmployeeTab('mahnwesen');
  showMahnwesenTab('customers');
  renderMahnwesen();
  openMahnwesenCustomerDialog(customerId);
}

function updateEmployeeBadges() {
  const availableCount = availableBooks().length;
  const borrowedCount = activeLoans().length;
  const reservedCount = reservedBooks.length;
  const customerCount = customers.length;
  const openCustomersCount = getCustomersWithOpenFines().length;
  const pendingExtensionsCount = extensionRequests.filter(r => r.status === 'pending').length;

  // Nav tab badges
  updateBadge('badge-tab-emp-borrowed', borrowedCount);
  updateBadge('badge-tab-emp-reserved', reservedCount);
  updateBadge('badge-tab-emp-available', availableCount);
  updateBadge('badge-tab-emp-mahnwesen', openCustomersCount);
  updateBadge('badge-tab-emp-extensions', pendingExtensionsCount);
  updateBadge('badge-tab-emp-customers', customerCount);

  // Section title badges
  updateBadge('badge-emp-borrowed', borrowedCount);
  updateBadge('badge-emp-available', availableCount);
  updateBadge('badge-emp-mahnwesen-overdue', borrowedBooks.filter(bb => isOverdue(bb)).length);
  updateBadge('badge-emp-mahnwesen-customers', openCustomersCount);
  updateBadge('badge-emp-extensions', pendingExtensionsCount);
  updateBadge('badge-emp-customers', customerCount);
}

function renderEmployeeBorrowed() {
  const list = document.getElementById('employee-borrowed');
  list.innerHTML = '';
  let borrows = activeLoans();

  if (employeeSearchBorrowedQuery) {
    const q = employeeSearchBorrowedQuery.toLowerCase();
    borrows = borrows.filter(bb => {
      const book = findBook(bb.bookId);
      const customer = customers.find(c => c.id == bb.customerId);
      const bTitle = book && book.title ? book.title.toLowerCase() : '';
      const bAuthor = book && book.author ? book.author.toLowerCase() : '';
      const cName = customer && customer.name ? customer.name.toLowerCase() : '';
      const cEmail = customer && customer.email ? customer.email.toLowerCase() : '';
      return bTitle.includes(q) || bAuthor.includes(q) || cName.includes(q) || cEmail.includes(q);
    });
  }

  if (borrows.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <span class="empty-icon" aria-hidden="true">📚</span>
        <p>${employeeSearchBorrowedQuery ? 'Keine Treffer für Ihre Suche bei den ausgeliehenen Büchern.' : 'Aktuell sind keine Bücher ausgeliehen.'}</p>
      </li>`;
    return;
  }

  borrows.forEach(bb => {
    const customer = customers.find(c => c.id == bb.customerId);
    const book = findBook(bb.bookId);
    if (!book || !customer) return;
    const li = document.createElement('li');
    li.className = 'book-card-item';
    const status = getLoanStatus(bb);
    const overdue = status === 'overdue';
    const openFine = getBookOpenFine(bb);
    const hasBlockedFee = openFine > 0;
    const currentFine = getCurrentFine(bb);
    const extensionInfo = bb.extensions.length > 0
      ? `<span class="badge badge-info">🔁 ${bb.extensions.length}x verlängert</span>`
      : '';

    li.innerHTML = `
      <div class="book-card ${overdue ? 'card-overdue' : ''}">
        ${bookImage(book)}
        <div class="book-details">
          <div class="book-header">
            <h4 class="book-title">${book.title}</h4>
            <div class="book-author">Entlehnt von: <strong>${customer.name}</strong> (${customer.email})</div>
            <div class="book-meta-sub">
              <span>ISBN: ${book.isbn || '—'}</span>
              <span>Kunden-ID: #${customer.id}</span>
              <span>Ausgeliehen am: ${formatDate(bb.borrowDate)}</span>
            </div>
          </div>
          <div class="book-badges">
            <span class="badge ${overdue ? 'badge-danger' : 'badge-info'}">
              📅 Rückgabe bis: ${formatDate(bb.dueDate)} ${overdue ? '(Überfällig)' : ''}
            </span>
            ${hasBlockedFee ? `
              <span class="badge badge-danger">⚠️ Offene Mahngebühr: € ${openFine.toFixed(2)}</span>
              <span class="badge badge-danger" title="Rücknahme erst nach Bezahlung der Mahngebühr möglich">🚫 Rücknahme gesperrt</span>
            ` : (currentFine > 0 ? `
              <span class="badge badge-success">✓ Mahngebühr beglichen</span>
            ` : `
              <span class="badge badge-success">✓ Keine offenen Gebühren</span>
            `)}
            ${extensionInfo}
          </div>
          <div class="book-footer">
            <button class="btn-secondary btn-sm btn-book-details" data-bookid="${book.id}">ℹ️ Details</button>
            <button class="btn-secondary btn-sm btn-employee-extend" data-borrowid="${bb.id}">
              ⏳ ${overdue ? 'Kulanzverlängerung' : 'Verlängern'}
            </button>
            ${hasBlockedFee ? `
              <button class="btn-return btn-disabled" disabled title="Rücknahme nicht möglich: Für dieses Buch besteht noch eine offene Mahngebühr von € ${openFine.toFixed(2)}. Bitte begleichen Sie zuerst die Gebühr im Kundenkonto.">
                🚫 Rücknahme blockiert
              </button>
              <button class="btn-secondary btn-goto-mahnwesen" data-customerid="${customer.id}" title="Zum Mahnwesen wechseln und Gebühr begleichen">
                💳 Gebühr im Mahnwesen begleichen →
              </button>
            ` : `
              <button class="btn-return" data-bookid="${book.id}">↩️ Zurücknehmen</button>
            `}
          </div>
        </div>
      </div>`;
    list.appendChild(li);
  });
}

// ============================================================================
// MAHNWESEN (ÜBERFÄLLIGE BÜCHER & ZAHLUNGEN) – MITARBEITERANSICHT
// ============================================================================

function showMahnwesenTab(tab) {
  currentMahnwesenTab = tab;
  ['overdue', 'customers'].forEach(t => {
    const panel = document.getElementById(`mahnwesen-panel-${t}`);
    const btn = document.getElementById(`btn-mahnwesen-tab-${t}`);
    if (panel) panel.classList.toggle('hidden', t !== tab);
    if (btn) {
      btn.classList.toggle('active', t === tab);
      btn.setAttribute('aria-selected', t === tab ? 'true' : 'false');
    }
  });
}

function renderMahnwesen() {
  renderMahnwesenOverdue();
  renderMahnwesenCustomers();
}

function renderMahnwesenOverdue() {
  const list = document.getElementById('mahnwesen-overdue');
  if (!list) return;
  list.innerHTML = '';
  const overdueList = borrowedBooks.filter(bb => isOverdue(bb));

  if (overdueList.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <span class="empty-icon" aria-hidden="true">🎉</span>
        <p>Keine überfälligen Bücher! Alle Fristen sind eingehalten.</p>
      </li>`;
    return;
  }

  overdueList.forEach(bb => {
    const customer = customers.find(c => c.id == bb.customerId);
    const book = findBook(bb.bookId);
    if (!book || !customer) return;
    const li = document.createElement('li');
    li.className = 'book-card-item';
    const totalFine = getCurrentFine(bb);
    const openFine = getBookOpenFine(bb);
    const hasBlockedFee = openFine > 0;

    li.innerHTML = `
      <div class="book-card card-overdue">
        ${bookImage(book)}
        <div class="book-details">
          <div class="book-header">
            <h4 class="book-title">${book.title}</h4>
            <div class="book-author">Kunde: <strong>${customer.name}</strong> (${customer.email}) • Tel: ${customer.phone || '—'}</div>
          </div>
          <div class="book-badges">
            <span class="badge badge-danger">⚠️ Rückgabe war: ${formatDate(bb.dueDate)}</span>
            <span class="badge badge-danger">💶 Mahngebühr: € ${totalFine.toFixed(2)}</span>
            ${hasBlockedFee ? `
              <span class="badge badge-danger">Noch offen: € ${openFine.toFixed(2)}</span>
            ` : `
              <span class="badge badge-success">✓ Bereits bezahlt</span>
            `}
          </div>
          <div class="book-footer">
            <button class="btn-secondary btn-sm btn-mahnwesen-book-details" data-bookid="${book.id}">💳 Details & Zahlung</button>
          </div>
        </div>
      </div>`;
    list.appendChild(li);
  });
}

function renderMahnwesenCustomers() {
  const list = document.getElementById('mahnwesen-customers');
  if (!list) return;
  list.innerHTML = '';
  const entries = getCustomersWithOpenFines();

  if (entries.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <span class="empty-icon" aria-hidden="true">🎉</span>
        <p>Aktuell hat kein Kunde offene Mahngebühren.</p>
      </li>`;
    return;
  }

  entries.forEach(({ customer, overdueBooks, open }) => {
    const li = document.createElement('li');
    li.className = 'book-card-item';
    li.innerHTML = `
      <div class="customer-card">
        <div class="customer-card-header">
          <div class="customer-card-avatar" aria-hidden="true">👤</div>
          <div>
            <h5 class="customer-card-name">${customer.name}</h5>
            <span class="customer-card-id">Ausweis-Nr. #${customer.id}</span>
          </div>
        </div>
        <div class="customer-card-body">
          <div>✉️ ${customer.email}</div>
          <div>📞 ${customer.phone || '—'}</div>
        </div>
        <div class="customer-card-stats">
          <span class="badge badge-danger">⚠️ ${overdueBooks.length} überfällig</span>
          <span class="badge badge-danger">💶 € ${open.toFixed(2)} offen</span>
        </div>
        <button class="btn-primary btn-mahnwesen-customer-details" data-customerid="${customer.id}" style="margin-top:0.5rem;">
          💳 Details & Zahlung
        </button>
      </div>`;
    list.appendChild(li);
  });
}

function openMahnwesenBookDialog(bookId) {
  const bb = activeLoans().find(b => b.bookId == bookId);
  const book = findBook(bookId);
  if (!bb || !book) return;
  const customer = customers.find(c => c.id == bb.customerId);
  const dialog = document.getElementById('mahnwesen-book-dialog');
  const body = document.getElementById('mahnwesen-book-dialog-body');
  const openFine = getBookOpenFine(bb);

  body.innerHTML = `
    <div class="book-detail-cover-wrap">${bookImage(book)}</div>
    <div class="book-detail-info">
      <h4>${book.title}</h4>
      <div class="book-detail-author">von ${book.author}</div>
      <div class="book-badges">
        <span class="badge badge-danger">⚠️ Rückgabe war: ${formatDate(bb.dueDate)}</span>
      </div>
      <p>Kunde: <strong>${customer ? customer.name : '—'}</strong> (${customer ? customer.email : '—'})</p>
      ${openFine > 0 ? `
        <div class="payment-action-box">
          <h4>💶 Offene Mahngebühr: € ${openFine.toFixed(2)}</h4>
          <p style="font-size:0.85rem; color:var(--text-muted);">Die Gebühr muss in einer einzigen Transaktion für dieses Buch begleichen werden. Teilzahlungen sind nicht möglich.</p>
          <button type="button" class="btn-primary btn-settle-book-fine" data-bookid="${book.id}">✓ Vollständig begleichen (€ ${openFine.toFixed(2)})</button>
        </div>
      ` : `<div class="alert-success">✓ Für dieses Buch bestehen keine offenen Gebühren.</div>`}
    </div>
  `;
  dialog.showModal();
}

function openMahnwesenCustomerDialog(customerId) {
  const customer = customers.find(c => c.id == customerId);
  if (!customer) return;
  const dialog = document.getElementById('mahnwesen-customer-dialog');
  const body = document.getElementById('mahnwesen-customer-dialog-body');
  const overdueBooks = borrowedBooks.filter(bb => bb.customerId == customerId && isOverdue(bb));
  const open = getCustomerOpenBalance(customerId);

  let html = `
    <h4 class="book-detail-author" style="font-size:1.1rem; color:var(--text-main);">${customer.name} (Ausweis #${customer.id})</h4>
    <p>✉️ ${customer.email} • 📞 ${customer.phone || '—'}</p>
  `;

  if (open <= 0) {
    html += `<div class="alert-success">✓ Dieser Kunde hat keine offenen Mahngebühren.</div>`;
  } else {
    html += `<ul class="account-book-list">`;
    overdueBooks.forEach(bb => {
      const book = findBook(bb.bookId);
      if (!book) return;
      const openFine = getBookOpenFine(bb);
      html += `
        <li class="book-card-item">
          <div class="book-card card-overdue">
            ${bookImage(book)}
            <div class="book-details">
              <div class="book-header">
                <h4 class="book-title">${book.title}</h4>
                <div class="book-author">von ${book.author}</div>
              </div>
              <div class="book-badges">
                <span class="badge badge-danger">⚠️ Rückgabe war: ${formatDate(bb.dueDate)}</span>
                ${openFine > 0
                  ? `<span class="badge badge-danger">💶 Offen: € ${openFine.toFixed(2)}</span>`
                  : `<span class="badge badge-success">✓ Beglichen</span>`}
              </div>
              ${openFine > 0 ? `
                <div class="book-footer">
                  <button type="button" class="btn-primary btn-sm btn-settle-book-fine" data-bookid="${book.id}">
                    ✓ Nur dieses Buch begleichen (€ ${openFine.toFixed(2)})
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        </li>`;
    });
    html += `</ul>`;
    html += `
      <div class="payment-action-box">
        <h4>💶 Gesamter offener Saldo: € ${open.toFixed(2)}</h4>
        <p style="font-size:0.85rem; color:var(--text-muted);">Alternativ kann der komplette offene Saldo des Kunden in einer einzigen Transaktion begleichen werden.</p>
        <button type="button" class="btn-primary btn-settle-all-customer" data-customerid="${customer.id}">
          ✓ Alle zusammen begleichen (€ ${open.toFixed(2)})
        </button>
      </div>`;
  }

  body.innerHTML = html;
  dialog.showModal();
}

// ============================================================================
// FRISTVERLÄNGERUNGEN – MITARBEITERANSICHT
// ============================================================================

function renderExtensionRequests() {
  const list = document.getElementById('employee-extensions');
  if (!list) return;
  list.innerHTML = '';
  const pending = extensionRequests.filter(r => r.status === 'pending');

  if (pending.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <span class="empty-icon" aria-hidden="true">✅</span>
        <p>Aktuell liegen keine Anfragen auf Fristverlängerung vor.</p>
      </li>`;
    return;
  }

  pending.forEach(req => {
    const book = findBook(req.bookId);
    const customer = customers.find(c => c.id == req.customerId);
    const bb = borrowedBooks.find(b => b.id === req.borrowId);
    if (!book || !customer || !bb) return;
    const li = document.createElement('li');
    li.className = 'book-card-item';
    li.innerHTML = `
      <div class="book-card">
        ${bookImage(book)}
        <div class="book-details">
          <div class="book-header">
            <h4 class="book-title">${book.title}</h4>
            <div class="book-author">Kunde: <strong>${customer.name}</strong> (${customer.email})</div>
          </div>
          <div class="book-badges">
            <span class="badge badge-info">📅 Aktuelle Rückgabe: ${formatDate(bb.dueDate)}</span>
            <span class="badge badge-warning">⏳ Gewünschte Verlängerung: +${req.days} Tage</span>
          </div>
          <div class="book-footer">
            <button class="btn-secondary btn-sm btn-book-details" data-bookid="${book.id}">ℹ️ Details</button>
            <button class="btn-primary btn-sm btn-accept-extension" data-requestid="${req.id}">✓ Annehmen</button>
            <button class="btn-secondary btn-sm btn-decline-extension" data-requestid="${req.id}">✕ Ablehnen</button>
          </div>
        </div>
      </div>`;
    list.appendChild(li);
  });
}

function renderEmployeeAvailable() {
  const list = document.getElementById('employee-available');
  list.innerHTML = '';
  let available = availableBooks();

  if (employeeSearchAvailableQuery) {
    const q = employeeSearchAvailableQuery.toLowerCase();
    available = available.filter(b =>
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q)) ||
      (b.isbn && b.isbn.toLowerCase().includes(q))
    );
  }

  if (available.length === 0) {
    list.innerHTML = `
      <li class="empty-state" style="grid-column: 1 / -1;">
        <span class="empty-icon" aria-hidden="true">📚</span>
        <p>${employeeSearchAvailableQuery ? 'Keine Treffer für Ihre Suche im Bibliotheksbestand.' : 'Aktuell sind alle Bücher verliehen oder reserviert.'}</p>
      </li>`;
    return;
  }

  available.forEach(b => {
    const li = document.createElement('li');
    li.className = 'book-card-item';
    li.innerHTML = `
      <div class="book-card book-grid-card">
        <div class="book-card-top">
          ${bookImage(b)}
          <div class="book-details">
            <div class="book-header">
              <h4 class="book-title">${b.title}</h4>
              <div class="book-author">von ${b.author}</div>
              <div class="book-meta-sub">
                <span>ISBN: ${b.isbn || '—'}</span>
                <span>Sprache: ${b.language || 'DE'}</span>
                <span>Jahr: ${b.publicationDate || '—'}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="book-footer book-actions-employee">
          <button class="btn-secondary btn-sm btn-book-details" data-bookid="${b.id}">ℹ️ Details anzeigen</button>
          <div class="book-actions-group">
            <button class="btn-secondary btn-sm btn-edit-book" data-bookid="${b.id}">✏️ Bearbeiten</button>
            <button class="btn-secondary btn-sm btn-danger-action btn-delete-book" data-bookid="${b.id}">🗑️ Löschen</button>
          </div>
        </div>
      </div>`;
    list.appendChild(li);
  });
}

/**
 * Zeigt alle Vormerkungen (Status "waiting") an, die noch nicht abholbereit
 * sind, weil das Buch aktuell an eine andere Person verliehen ist.
 */
function renderEmployeeWaitlist() {
  const list = document.getElementById('employee-waitlist');
  if (!list) return;
  list.innerHTML = '';
  const waiting = reservedBooks
    .filter(rb => rb.status === 'waiting')
    .sort((a, b) => a.bookId - b.bookId || a.id - b.id);
  updateBadge('badge-emp-waitlist', waiting.length);

  if (waiting.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <span class="empty-icon" aria-hidden="true">⏳</span>
        <p>Keine Vormerkungen auf der Warteliste.</p>
      </li>`;
    return;
  }

  waiting.forEach(rb => {
    const book = findBook(rb.bookId);
    const customer = customers.find(c => c.id == rb.customerId);
    if (!book || !customer) return;
    const activeBorrow = activeLoans().find(bb => bb.bookId == rb.bookId);
    const borrower = activeBorrow && customers.find(c => c.id == activeBorrow.customerId);
    const position = reservedBooks
      .filter(r => r.bookId === rb.bookId && r.status === 'waiting')
      .sort((a, b) => a.id - b.id)
      .findIndex(r => r.id === rb.id) + 1;
    const li = document.createElement('li');
    li.className = 'book-card-item';
    li.innerHTML = `
      <div class="book-card card-reserved">
        ${bookImage(book)}
        <div class="book-details">
          <div class="book-header">
            <h4 class="book-title">${book.title}</h4>
            <div class="book-author">Vorgemerkt von: <strong>${customer.name}</strong> (${customer.email})</div>
            <div class="book-meta-sub">
              <span>Tel: ${customer.phone || '—'}</span>
              <span>Warteliste-Position: ${position}</span>
            </div>
          </div>
          <div class="book-badges">
            <span class="badge badge-warning">⏳ Wartet auf Rückgabe</span>
            ${activeBorrow
              ? `<span class="badge badge-info">📅 Ausgeliehen${borrower ? ` von ${borrower.name}` : ''} bis ${formatDate(activeBorrow.dueDate)}${isOverdue(activeBorrow) ? ' (Überfällig)' : ''}</span>`
              : ''}
          </div>
          <div class="book-footer">
            <button class="btn-secondary btn-sm btn-book-details" data-bookid="${book.id}">ℹ️ Details</button>
          </div>
        </div>
      </div>`;
    list.appendChild(li);
  });
}

function renderEmployeeReserved() {
  renderEmployeeWaitlist();
  const list = document.getElementById('employee-reserved');
  list.innerHTML = '';
  const readyReservations = reservedBooks.filter(rb => rb.status === 'ready');
  updateBadge('badge-emp-reserved', readyReservations.length);

  if (readyReservations.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <span class="empty-icon" aria-hidden="true">📦</span>
        <p>Keine abholbereiten Reservierungen vorhanden.</p>
      </li>`;
    return;
  }

  readyReservations.forEach(rb => {
    const book = findBook(rb.bookId);
    const customer = customers.find(c => c.id == rb.customerId);
    if (!book || !customer) return;
    const li = document.createElement('li');
    li.className = 'book-card-item';

    // Sicherheitsprüfung: Ist das Buch aktuell (noch) an eine andere Person
    // ausgeliehen, darf die Ausgabe nicht erfolgen – die Reservierung bleibt
    // bestehen, bis das Buch tatsächlich zurückgegeben wurde.
    const activeBorrow = activeLoans().find(bb => bb.bookId == rb.bookId);
    const isBlocked = !!activeBorrow && activeBorrow.customerId != rb.customerId;

    li.innerHTML = `
      <div class="book-card card-reserved">
        ${bookImage(book)}
        <div class="book-details">
          <div class="book-header">
            <h4 class="book-title">${book.title}</h4>
            <div class="book-author">Reserviert von: <strong>${customer.name}</strong> (${customer.email})</div>
            <div class="book-meta-sub">
              <span>Tel: ${customer.phone || '—'}</span>
            </div>
          </div>
          <div class="book-badges">
            ${isBlocked
              ? `<span class="badge badge-danger">⚠️ Noch ausgeliehen bis ${formatDate(activeBorrow.dueDate)} – Ausgabe derzeit nicht möglich</span>`
              : `<span class="badge badge-warning">📦 Liegt zur Abholung an der Theke</span>`}
          </div>
          <div class="book-footer">
            <button class="btn-secondary btn-sm btn-book-details" data-bookid="${book.id}">ℹ️ Details</button>
            ${isBlocked
              ? `<button class="btn-pickup btn-disabled" disabled title="Dieses Buch ist noch an einen anderen Kunden ausgeliehen.">🚫 Ausgabe blockiert</button>`
              : `<button class="btn-pickup" data-bookid="${book.id}">✓ Als abgeholt markieren (${appConfig.loanPeriodDays} Tage Frist)</button>`}
          </div>
        </div>
      </div>`;
    list.appendChild(li);
  });
}

function renderCustomerAccount(customerId) {
  const accountDiv = document.getElementById('employee-customer-account');
  if (!accountDiv) return;

  // Wenn kein Kunde ausgewählt ist, zeige die Kundenübersicht / Directory
  if (!customerId) {
    let customerList = [...customers];
    if (employeeCustomerSearchQuery) {
      const q = employeeCustomerSearchQuery.toLowerCase();
      customerList = customerList.filter(c =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        c.id.toString().includes(q)
      );
    }

    let dirHtml = `
      <div class="customer-directory-header">
        <h4>Registrierte Kunden (${customerList.length})</h4>
        <p class="customer-directory-sub">Wählen Sie ein Kundenkonto aus, um alle Ausleihen, Reservierungen, Kontaktdaten und Gebühren einzusehen oder zu bearbeiten.</p>
      </div>
      <div class="customer-directory-grid">
    `;

    if (customerList.length === 0) {
      dirHtml += `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <span class="empty-icon" aria-hidden="true">🔍</span>
          <p>Keine Kunden für diesen Suchbegriff gefunden.</p>
        </div>
      `;
    } else {
      customerList.forEach(c => {
        const borrows = activeLoans().filter(bb => bb.customerId == c.id);
        const overdues = borrows.filter(bb => isOverdue(bb));
        const open = getCustomerOpenBalance(c.id);

        dirHtml += `
          <div class="customer-card">
            <div class="customer-card-header">
              <div class="customer-card-avatar" aria-hidden="true">👤</div>
              <div>
                <h5 class="customer-card-name">${c.name}</h5>
                <span class="customer-card-id">Ausweis-Nr. #${c.id}</span>
              </div>
            </div>
            <div class="customer-card-body">
              <div>✉️ ${c.email}</div>
              <div>📞 ${c.phone}</div>
              <div>📍 ${c.address}</div>
            </div>
            <div class="customer-card-stats">
              <span class="badge ${borrows.length > 0 ? 'badge-info' : ''}">📚 ${borrows.length} Ausgeliehen</span>
              ${overdues.length > 0 ? `<span class="badge badge-danger">⚠️ ${overdues.length} Überfällig</span>` : ''}
              ${open > 0 ? `<span class="badge badge-danger">💶 € ${open.toFixed(2)} Offen</span>` : `<span class="badge badge-success">✓ Ausgeglichen</span>`}
            </div>
            <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
              <button class="btn-primary btn-select-customer" data-customerid="${c.id}" style="flex:1;">
                👤 Details anzeigen
              </button>
              <button class="btn-secondary btn-edit-customer" data-customerid="${c.id}" title="Kundendaten bearbeiten">
                ✏️
              </button>
            </div>
          </div>
        `;
      });
    }

    dirHtml += `</div>`;
    accountDiv.innerHTML = dirHtml;
    return;
  }

  // Ein Kunde ist ausgewählt: Zeige vollständige Details
  const customer = customers.find(c => c.id == customerId);
  if (!customer) {
    accountDiv.innerHTML = '';
    return;
  }

  const customerBorrows = activeLoans().filter(bb => bb.customerId == customerId);
  const customerHistory = borrowedBooks
    .filter(bb => bb.customerId == customerId && bb.returnedAt)
    .sort((a, b) => new Date(b.returnedAt) - new Date(a.returnedAt));
  const customerReserved = reservedBooks.filter(rb => rb.customerId == customerId);
  const overdueBorrows = customerBorrows.filter(bb => isOverdue(bb));
  const open = getCustomerOpenBalance(customerId);

  let html = `
    <div class="account-card">
      <div class="account-header-actions" style="display:flex; justify-content:space-between; align-items:center;">
        <button class="btn-secondary btn-clear-customer">← Zurück zur Kundenliste</button>
        <button class="btn-secondary btn-edit-customer" data-customerid="${customer.id}">✏️ Kundendaten bearbeiten</button>
      </div>
      <div class="account-summary-header">
        <div>
          <span class="member-tag">Bibliothekskonto • Ausweis #${customer.id}</span>
          <h4 class="account-customer-name">${customer.name}</h4>
          <div class="account-customer-meta">✉️ ${customer.email} • 📞 ${customer.phone} • 📍 ${customer.address}</div>
        </div>
        <div class="balance-badge ${open > 0 ? 'balance-due' : 'balance-cleared'}">
          ${open > 0 ? `⚠️ Offener Saldo: € ${open.toFixed(2)}` : '✓ Konto ausgeglichen'}
        </div>
      </div>
      <div class="account-kpis">
        <div class="stat-pill">
          <span class="stat-label">Ausgeliehen</span>
          <span class="stat-value">${customerBorrows.length}</span>
        </div>
        <div class="stat-pill ${overdueBorrows.length > 0 ? 'stat-warning' : ''}">
          <span class="stat-label">Überfällig</span>
          <span class="stat-value">${overdueBorrows.length}</span>
        </div>
        <div class="stat-pill">
          <span class="stat-label">Reserviert</span>
          <span class="stat-value">${customerReserved.length}</span>
        </div>
        <div class="stat-pill ${open > 0 ? 'stat-warning' : 'stat-ok'}">
          <span class="stat-label">Offene Gebühren</span>
          <span class="stat-value">€ ${open.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;

  // 1. Ausgeliehene Bücher dieses Kunden
  html += `<h4 class="section-subtitle">📚 Aktuell ausgeliehene Bücher (${customerBorrows.length})</h4><ul class="account-book-list">`;
  if (customerBorrows.length === 0) {
    html += `<li class="empty-state-simple">Aktuell hat dieser Kunde keine Bücher ausgeliehen.</li>`;
  }
  customerBorrows.forEach(bb => {
    const book = findBook(bb.bookId);
    if (!book) return;
    const fine = getCurrentFine(bb);
    const overdue = isOverdue(bb);
    const openFine = getBookOpenFine(bb);
    const hasBlockedFee = openFine > 0;
    const extensionInfo = bb.extensions.length > 0
      ? `<span class="badge badge-info">🔁 ${bb.extensions.length}x verlängert</span>`
      : '';

    html += `
      <li class="book-card-item">
        <div class="book-card ${overdue ? 'card-overdue' : ''}">
          ${bookImage(book)}
          <div class="book-details">
            <div class="book-header">
              <h4 class="book-title">${book.title}</h4>
              <div class="book-author">von ${book.author}</div>
            </div>
            <div class="book-badges">
              <span class="badge ${overdue ? 'badge-danger' : 'badge-info'}">📅 Rückgabe bis: ${formatDate(bb.dueDate)} ${overdue ? '(Überfällig)' : ''}</span>
              ${hasBlockedFee ? `
                <span class="badge badge-danger">⚠️ Offene Gebühr: € ${openFine.toFixed(2)} (Rücknahme gesperrt)</span>
              ` : (fine > 0 ? `
                <span class="badge badge-success">✓ Mahngebühr beglichen</span>
              ` : `
                <span class="badge badge-success">✓ Keine Mahngebühr</span>
              `)}
              ${extensionInfo}
            </div>
            <div class="book-footer">
              <button class="btn-secondary btn-sm btn-book-details" data-bookid="${book.id}">ℹ️ Details</button>
              <button class="btn-secondary btn-sm btn-employee-extend" data-borrowid="${bb.id}">
                ⏳ ${overdue ? 'Kulanzverlängerung' : 'Verlängern'}
              </button>
              ${hasBlockedFee ? `
                <button class="btn-return btn-disabled" disabled title="Rücknahme nicht möglich: Offene Mahngebühr muss zuerst beglichen werden.">
                  🚫 Rücknahme gesperrt
                </button>
                <button class="btn-secondary btn-goto-mahnwesen" data-customerid="${customer.id}">
                  💳 Im Mahnwesen begleichen →
                </button>
              ` : `
                <button class="btn-return" data-bookid="${book.id}">↩️ Zurücknehmen</button>
              `}
            </div>
          </div>
        </div>
      </li>`;
  });
  html += `</ul>`;

  // 2. Reservierte Bücher dieses Kunden
  html += `<h4 class="section-subtitle">📦 Vorbestellungen & Abholung (${customerReserved.length})</h4><ul class="account-book-list">`;
  if (customerReserved.length === 0) {
    html += `<li class="empty-state-simple">Keine offenen Reservierungen für diesen Kunden.</li>`;
  }
  customerReserved.forEach(rb => {
    const book = findBook(rb.bookId);
    if (!book) return;
    const isWaiting = rb.status === 'waiting';
    // Sicherheitsprüfung: Ausgabe nur möglich, wenn das Buch nicht aktuell an
    // eine andere Person ausgeliehen ist.
    const activeBorrow = activeLoans().find(bb => bb.bookId == rb.bookId);
    const isBlocked = !!activeBorrow && activeBorrow.customerId != rb.customerId;

    let statusBadge;
    let footerAction;
    if (isWaiting) {
      statusBadge = `<span class="badge badge-warning">⏳ Auf Warteliste – wird frei, sobald das Buch zurückgegeben wurde</span>`;
      footerAction = '';
    } else if (isBlocked) {
      statusBadge = `<span class="badge badge-danger">⚠️ Noch ausgeliehen bis ${formatDate(activeBorrow.dueDate)} – Ausgabe derzeit nicht möglich</span>`;
      footerAction = `<button class="btn-pickup btn-disabled" disabled title="Dieses Buch ist noch an einen anderen Kunden ausgeliehen.">🚫 Ausgabe blockiert</button>`;
    } else {
      statusBadge = `<span class="badge badge-warning">📦 Abholbereit an der Theke</span>`;
      footerAction = `<button class="btn-pickup" data-bookid="${book.id}">✓ Als abgeholt markieren (${appConfig.loanPeriodDays} Tage Frist)</button>`;
    }

    html += `
      <li class="book-card-item">
        <div class="book-card card-reserved">
          ${bookImage(book)}
          <div class="book-details">
            <div class="book-header">
              <h4 class="book-title">${book.title}</h4>
              <div class="book-author">von ${book.author}</div>
            </div>
            <div class="book-badges">
              ${statusBadge}
            </div>
            <div class="book-footer">
              <button class="btn-secondary btn-sm btn-book-details" data-bookid="${book.id}">ℹ️ Details</button>
              ${footerAction}
            </div>
          </div>
        </div>
      </li>`;
  });
  html += `</ul>`;

  // 3. Abgeschlossene Ausleihen (Rückgabehistorie) dieses Kunden
  html += `<h4 class="section-subtitle">📜 Abgeschlossene Ausleihen (${customerHistory.length})</h4><ul class="account-book-list">`;
  if (customerHistory.length === 0) {
    html += `<li class="empty-state-simple">Für diesen Kunden liegen noch keine abgeschlossenen Ausleihen vor.</li>`;
  }
  customerHistory.forEach(bb => {
    const book = findBook(bb.bookId);
    if (!book) return;
    const fine = bb.fine || 0;
    html += `
      <li class="book-card-item">
        <div class="book-card">
          ${bookImage(book)}
          <div class="book-details">
            <div class="book-header">
              <h4 class="book-title">${book.title}</h4>
              <div class="book-author">von ${book.author}</div>
            </div>
            <div class="book-badges">
              <span class="badge badge-info">📅 Ausgeliehen am: ${formatDate(bb.borrowDate)}</span>
              <span class="badge badge-success">↩️ Zurückgegeben am: ${formatDate(bb.returnedAt)}</span>
              ${fine > 0
                ? `<span class="badge badge-danger">💶 Endgültige Mahngebühr: € ${fine.toFixed(2)}</span>`
                : `<span class="badge badge-success">✓ Keine Mahngebühr</span>`}
            </div>
          </div>
        </div>
      </li>`;
  });
  html += `</ul>`;

  // 4. Mahnwesen-Hinweis (Zahlungen werden ausschließlich im Mahnwesen verbucht)
  if (open > 0) {
    html += `
      <div class="payment-action-box">
        <h4>💳 Offene Mahngebühren: € ${open.toFixed(2)}</h4>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.75rem;">
          Zahlungen werden im Mahnwesen verbucht – wahlweise einzeln pro Buch oder gesammelt für alle offenen Posten dieses Kunden.
        </p>
        <button type="button" class="btn-primary btn-goto-mahnwesen" data-customerid="${customer.id}">
          💳 Zum Mahnwesen wechseln
        </button>
      </div>`;
  } else {
    html += `<div class="alert-success">✓ Das Kundenkonto ist ausgeglichen. Keine offenen Gebühren vorhanden.</div>`;
  }

  accountDiv.innerHTML = html;
}

function renderEmployee() {
  updateEmployeeBadges();
  renderEmployeeBorrowed();
  renderEmployeeAvailable();
  renderEmployeeReserved();
  renderMahnwesen();
  renderExtensionRequests();
  const empSel = document.getElementById('employee-customer-select');
  if (empSel) {
    renderCustomerAccount(empSel.value);
  }
}

// ============================================================================
// AUTHENTIFIZIERUNG & NAVIGATION
// ============================================================================

function login() {
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('user-bar').classList.remove('hidden');
  document.getElementById('login-error').classList.add('hidden');
  document.getElementById('user-name').textContent = `${currentUser.name} (${currentRole === 'customer' ? 'Kunde' : 'Mitarbeiter'})`;
  if (currentRole === 'customer') {
    showCustomerPanel('borrowed');
    renderCustomer();
    document.getElementById('customer-view').classList.remove('hidden');
  } else if (currentRole === 'employee') {
    showEmployeeTab('borrowed');
    renderEmployee();
    document.getElementById('employee-view').classList.remove('hidden');
  }
}

function logout() {
  currentRole = null;
  currentUser = null;
  document.getElementById('login-view').classList.remove('hidden');
  document.getElementById('user-bar').classList.add('hidden');
  document.getElementById('customer-view').classList.add('hidden');
  document.getElementById('employee-view').classList.add('hidden');
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
}

function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const customer = customers.find(c => c.email === email && c.password === password);
  const employee = employees.find(e => e.email === email && e.password === password);
  if (customer) {
    currentRole = 'customer';
    currentUser = customer;
    login();
  } else if (employee) {
    currentRole = 'employee';
    currentUser = employee;
    login();
  } else {
    document.getElementById('login-error').classList.remove('hidden');
  }
}

function showCustomerPanel(panel) {
  document.getElementById('customer-borrowed-panel').classList.toggle('hidden', panel !== 'borrowed');
  document.getElementById('customer-available-panel').classList.toggle('hidden', panel !== 'available');
  document.getElementById('btn-customer-borrowed').classList.toggle('active', panel === 'borrowed');
  document.getElementById('btn-customer-available').classList.toggle('active', panel === 'available');
  document.getElementById('customer-fees-panel').classList.toggle('hidden', panel !== 'fees');
  document.getElementById('btn-customer-fees').classList.toggle('active', panel === 'fees');
}

// ============================================================================
// GESCHÄFTSLOGIK-AKTIONEN
// ============================================================================

function reserveBook(bookId) {
  // Sicherheitsprüfung: Nur tatsächlich freie Bücher dürfen direkt (status "ready")
  // reserviert werden. Ist das Buch inzwischen ausgeliehen oder bereits für
  // jemand anderen reserviert, landet die Anfrage stattdessen auf der Warteliste.
  if (!getBookAvailability(bookId).isFree) {
    requestWaitlistReservation(bookId);
    return;
  }
  reservedBooks.push({ id: nextReservedBookId(), customerId: currentUser.id, bookId, status: 'ready' });
  renderCustomer();
  saveData();
  const detailDialog = document.getElementById('book-detail-dialog');
  if (detailDialog && detailDialog.open) {
    openBookDetailDialog(bookId);
  }
}

/**
 * Trägt den Kunden für ein aktuell nicht verfügbares Buch in die Warteliste
 * ein. Sobald das Buch zurückgegeben wird, rückt er automatisch nach vorne
 * (siehe promoteWaitlist) – eine Freigabe durch Mitarbeiter ist nicht nötig.
 */
function requestWaitlistReservation(bookId) {
  const alreadyRequested = reservedBooks.some(rb => rb.bookId === bookId && rb.customerId == currentUser.id);
  if (alreadyRequested) return;
  reservedBooks.push({ id: nextReservedBookId(), customerId: currentUser.id, bookId, status: 'waiting' });
  renderCustomer();
  saveData();
  const detailDialog = document.getElementById('book-detail-dialog');
  if (detailDialog && detailDialog.open) {
    openBookDetailDialog(bookId);
  }
}

function employeePickupBook(bookId) {
  const idx = reservedBooks.findIndex(rb => rb.bookId == bookId && rb.status === 'ready');
  if (idx === -1) return;
  const rb = reservedBooks[idx];

  // Sicherheitsprüfung: Das Buch darf nur ausgegeben werden, wenn es aktuell
  // nicht bereits von einem anderen Kunden ausgeliehen ist. Dieser Fall kann
  // theoretisch entstehen, wenn Datensätze inkonsistent wurden – die Ausgabe
  // wird dann blockiert, statt eine Doppelausleihe zu erzeugen.
  const activeBorrow = activeLoans().find(bb => bb.bookId == bookId);
  if (activeBorrow && activeBorrow.customerId != rb.customerId) {
    const borrower = customers.find(c => c.id == activeBorrow.customerId);
    alert(`Ausgabe nicht möglich: Dieses Buch ist aktuell noch an ${borrower ? borrower.name : 'einen anderen Kunden'} ausgeliehen (Rückgabe bis ${formatDate(activeBorrow.dueDate)}). Bitte zuerst die Rückgabe abwarten.`);
    return;
  }

  reservedBooks.splice(idx, 1);
  const borrowDate = todayStr();
  const dueDate = addDays(borrowDate, appConfig.loanPeriodDays);
  borrowedBooks.push({
    id: Math.max(0, ...borrowedBooks.map(bb => bb.id)) + 1,
    customerId: rb.customerId,
    bookId: rb.bookId,
    borrowDate,
    originalDueDate: dueDate,
    dueDate,
    returnedAt: null,
    extensions: [],
    fine: null,
    accruedFine: 0
  });
  renderEmployee();
  saveData();
}

function employeeReturnBook(bookId) {
  const bb = activeLoans().find(b => b.bookId == bookId);
  if (!bb) return;
  const openFine = getBookOpenFine(bb);
  if (openFine > 0) {
    alert(`Rücknahme nicht möglich: Für dieses Buch besteht noch eine offene Mahngebühr von € ${openFine.toFixed(2)}. Bitte begleichen Sie zuerst die Gebühr im Kundenkonto.`);
    return;
  }

  returnBook(bb);
  // Eine evtl. bestehende Warteliste für dieses Buch nachrücken lassen
  promoteWaitlist(bookId);
  // Offene Verlängerungsanfragen für diese Ausleihe sind damit obsolet
  extensionRequests = extensionRequests.filter(r => r.borrowId !== bb.id);
  renderEmployee();
  saveData();
}

/**
 * Öffnet den Dialog, in dem ein Kunde zwischen +14 und +28 Tagen Verlängerung
 * wählen und die Anfrage an die Mitarbeiter senden kann.
 */
function openExtendRequestDialog(borrowId) {
  const dialog = document.getElementById('extend-request-dialog');
  if (!dialog) return;
  document.getElementById('extend-request-borrowid').value = borrowId;
  document.getElementById('extend-request-mode').value = 'request';
  document.getElementById('extend-request-title').textContent = 'Fristverlängerung beantragen';
  document.getElementById('extend-request-subtitle').textContent = 'Die Mitarbeiter müssen Ihre Anfrage noch bestätigen';
  const radio14 = dialog.querySelector('input[name="extend-days"][value="14"]');
  if (radio14) radio14.checked = true;
  dialog.showModal();
}

/**
 * Öffnet denselben Dialog für eine direkte Verlängerung durch einen
 * Mitarbeiter – inklusive Kulanzverlängerung bei bereits überfälligen
 * Ausleihen (siehe canExtendLoan() / extendLoan()).
 */
function openEmployeeExtendDialog(borrowId) {
  const bb = borrowedBooks.find(b => b.id === borrowId);
  const dialog = document.getElementById('extend-request-dialog');
  if (!dialog || !bb || !canExtendLoan(bb, 'employee')) return;
  const overdue = getLoanStatus(bb) === 'overdue';
  document.getElementById('extend-request-borrowid').value = borrowId;
  document.getElementById('extend-request-mode').value = 'employee';
  document.getElementById('extend-request-title').textContent = overdue
    ? 'Kulanzverlängerung (überfällig)'
    : 'Rückgabefrist verlängern';
  document.getElementById('extend-request-subtitle').textContent = overdue
    ? 'Bereits entstandene Mahngebühren bleiben bestehen – zukünftige Gebühren werden ab der neuen Frist berechnet.'
    : 'Die neue Frist wird sofort wirksam.';
  const radio14 = dialog.querySelector('input[name="extend-days"][value="14"]');
  if (radio14) radio14.checked = true;
  dialog.showModal();
}

/**
 * Direkte Verlängerung einer Ausleihe durch einen Mitarbeiter (ohne
 * vorherige Kundenanfrage). Bei einer bereits überfälligen Ausleihe wird
 * automatisch eine Kulanzverlängerung durchgeführt.
 */
function employeeExtendLoan(borrowId, days) {
  const bb = borrowedBooks.find(b => b.id === borrowId);
  if (!bb || !canExtendLoan(bb, 'employee')) return;
  const courtesy = getLoanStatus(bb) === 'overdue';
  extendLoan(bb, days, { courtesy });
  saveData();
  renderEmployee();
}

/**
 * Stellt eine Anfrage auf Fristverlängerung (+14 oder +28 Tage) für eine
 * laufende Ausleihe. Pro Ausleihe ist höchstens eine Verlängerung möglich.
 */
function requestExtension(borrowId, days) {
  const bb = borrowedBooks.find(b => b.id === borrowId);
  if (!bb || !canExtendLoan(bb, 'customer') || bb.extensions.length > 0) return;
  const alreadyPending = extensionRequests.some(r => r.borrowId === borrowId && r.status === 'pending');
  if (alreadyPending) return;
  extensionRequests.push({
    id: Math.max(0, ...extensionRequests.map(r => r.id || 0)) + 1,
    borrowId,
    customerId: bb.customerId,
    bookId: bb.bookId,
    days,
    status: 'pending',
    requestDate: new Date().toISOString().split('T')[0]
  });
  saveData();
  renderCustomer();
  if (currentRole === 'employee') renderEmployee();
}

function acceptExtensionRequest(requestId) {
  const request = extensionRequests.find(r => r.id === requestId);
  if (!request) return;
  const bb = borrowedBooks.find(b => b.id === request.borrowId);
  if (bb) {
    const courtesy = getLoanStatus(bb) === 'overdue';
    extendLoan(bb, request.days, { courtesy });
  }
  extensionRequests = extensionRequests.filter(r => r.id !== requestId);
  saveData();
  renderEmployee();
}

function declineExtensionRequest(requestId) {
  extensionRequests = extensionRequests.filter(r => r.id !== requestId);
  saveData();
  renderEmployee();
}

// ============================================================================
// INITIALISIERUNG
// ============================================================================

function init() {
  initTheme();

  document.getElementById('btn-login').addEventListener('click', doLogin);
  document.getElementById('btn-logout').addEventListener('click', logout);

  // Enter-Taste im Login-Formular unterstützen
  ['login-email', 'login-password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doLogin();
      });
    }
  });

  // Demo Login Schnellzugriff
  document.querySelectorAll('.btn-demo[data-email]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('login-email').value = btn.dataset.email;
      document.getElementById('login-password').value = btn.dataset.pass;
      doLogin();
    });
  });

  // Demo: LocalStorage zurücksetzen und mit den JSON-Dateien neu starten
  const btnResetData = document.getElementById('btn-reset-data');
  if (btnResetData) {
    btnResetData.addEventListener('click', () => {
      if (!confirm('Alle lokal gespeicherten Änderungen verwerfen und mit dem Datensatz aus den JSON-Dateien neu starten?')) return;
      localStorage.removeItem('library_data');
      location.reload();
    });
  }

  // Kundenreiter
  document.getElementById('btn-customer-borrowed').addEventListener('click', () => showCustomerPanel('borrowed'));
  document.getElementById('btn-customer-available').addEventListener('click', () => showCustomerPanel('available'));
  document.getElementById('btn-customer-fees').addEventListener('click', () => showCustomerPanel('fees'));

  // Schnellsuche für Kunden im Katalog
  const searchInput = document.getElementById('customer-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      customerCatalogSearchQuery = e.target.value.trim();
      renderCustomerCatalog();
    });
  }

  // Sortierung für "Meine Bücher" (ausgeliehene Bücher)
  const borrowedSortSelect = document.getElementById('customer-borrowed-sort');
  if (borrowedSortSelect) {
    borrowedSortSelect.addEventListener('change', (e) => {
      customerBorrowedSortKey = e.target.value;
      renderCustomerBorrowed();
    });
  }

  // Reiter für Mitarbeiteransicht
  ['borrowed', 'reserved', 'available', 'mahnwesen', 'extensions', 'customers'].forEach(tab => {
    const btn = document.getElementById(`btn-emp-tab-${tab}`);
    if (btn) {
      btn.addEventListener('click', () => showEmployeeTab(tab));
    }
  });

  // Unter-Reiter innerhalb des Mahnwesens
  ['overdue', 'customers'].forEach(tab => {
    const btn = document.getElementById(`btn-mahnwesen-tab-${tab}`);
    if (btn) {
      btn.addEventListener('click', () => showMahnwesenTab(tab));
    }
  });

  // Schnellsuche für Mitarbeiter bei ausgeliehenen Büchern
  const empBorrowSearch = document.getElementById('employee-search-borrowed');
  if (empBorrowSearch) {
    empBorrowSearch.addEventListener('input', (e) => {
      employeeSearchBorrowedQuery = e.target.value.trim();
      renderEmployeeBorrowed();
    });
  }

  // Schnellsuche für Mitarbeiter bei verfügbaren Büchern
  const empAvailSearch = document.getElementById('employee-search-available');
  if (empAvailSearch) {
    empAvailSearch.addEventListener('input', (e) => {
      employeeSearchAvailableQuery = e.target.value.trim();
      renderEmployeeAvailable();
    });
  }

  // Kundenauswahl-Dropdown für Mitarbeiter
  const empSel = document.getElementById('employee-customer-select');
  if (empSel) {
    empSel.innerHTML = '<option value="">-- Alle Kunden (Übersicht) --</option>';
    customers.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name} (Ausweis #${c.id} • ${c.email})`;
      empSel.appendChild(opt);
    });
    empSel.addEventListener('change', () => renderCustomerAccount(empSel.value));
  }

  // Kundensuche im Kunden-Reiter
  const empCustSearch = document.getElementById('employee-customer-search');
  if (empCustSearch) {
    empCustSearch.addEventListener('input', (e) => {
      employeeCustomerSearchQuery = e.target.value.trim();
      if (!empSel || !empSel.value) {
        renderCustomerAccount('');
      }
    });
  }

  // Button: Neues Buch hinzufügen (Mitarbeiter)
  const btnAddBook = document.getElementById('btn-add-book');
  if (btnAddBook) {
    btnAddBook.addEventListener('click', () => openBookFormDialog(null));
  }

  // Dialog-Formulare abfangen
  const custEditForm = document.getElementById('customer-edit-form');
  if (custEditForm) {
    custEditForm.addEventListener('submit', handleCustomerEditSubmit);
  }

  const bookEditForm = document.getElementById('book-edit-form');
  if (bookEditForm) {
    bookEditForm.addEventListener('submit', handleBookFormSubmit);
  }

  // Schließen-Buttons aller Dialoge
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dialogId = btn.dataset.close;
      const d = document.getElementById(dialogId);
      if (d) d.close();
    });
  });

  // Klick auf Backdrop schließt Dialog
  ['customer-dialog', 'book-form-dialog', 'book-detail-dialog', 'mahnwesen-book-dialog', 'mahnwesen-customer-dialog', 'extend-request-dialog'].forEach(id => {
    const d = document.getElementById(id);
    if (d) {
      d.addEventListener('click', (e) => {
        if (e.target === d) d.close();
      });
    }
  });

  // Globale Event-Delegation
  document.body.addEventListener('click', (e) => {
    // 1. Buchdetails anzeigen (Dialog)
    const btnBookDetails = e.target.closest('.btn-book-details');
    if (btnBookDetails) {
      const bookId = parseInt(btnBookDetails.dataset.bookid);
      if (bookId) openBookDetailDialog(bookId);
      return;
    }

    // 2. Buch reservieren aus dem Detail-Dialog
    const btnModalReserve = e.target.closest('.btn-modal-reserve');
    if (btnModalReserve && currentRole === 'customer') {
      const bookId = parseInt(btnModalReserve.dataset.bookid);
      if (bookId) reserveBook(bookId);
      return;
    }

    // 3. Buch bearbeiten (Mitarbeiter)
    const btnEditBook = e.target.closest('.btn-edit-book, .btn-edit-book-from-dialog');
    if (btnEditBook) {
      const bookId = parseInt(btnEditBook.dataset.bookid);
      const detailDialog = document.getElementById('book-detail-dialog');
      if (detailDialog && detailDialog.open) {
        detailDialog.close();
      }
      if (bookId) openBookFormDialog(bookId);
      return;
    }

    // 4. Buch löschen (Mitarbeiter)
    const btnDeleteBook = e.target.closest('.btn-delete-book');
    if (btnDeleteBook) {
      const bookId = parseInt(btnDeleteBook.dataset.bookid);
      if (bookId) deleteBook(bookId);
      return;
    }

    // 5. Kundendaten bearbeiten (Mitarbeiter)
    const btnEditCust = e.target.closest('.btn-edit-customer');
    if (btnEditCust) {
      const custId = btnEditCust.dataset.customerid;
      if (custId) openCustomerEditDialog(custId);
      return;
    }

    // 6. Ausgeliehenes / Überfälliges Buch: Zum Kundenkonto springen
    const btnGoto = e.target.closest('.btn-goto-customer');
    if (btnGoto) {
      const custId = btnGoto.dataset.customerid;
      if (custId) selectCustomerAndSwitchTab(custId);
      return;
    }

    // 7. Kunde aus Übersichtskarte auswählen
    const btnSelect = e.target.closest('.btn-select-customer');
    if (btnSelect) {
      const custId = btnSelect.dataset.customerid;
      if (custId) selectCustomerAndSwitchTab(custId);
      return;
    }

    // 8. Auswahl aufheben (Zurück zur Kundenliste)
    const btnClear = e.target.closest('.btn-clear-customer');
    if (btnClear) {
      if (empSel) empSel.value = '';
      renderCustomerAccount('');
      return;
    }

    // 9. Buch vormerken (Warteliste) aus der Katalog-Liste
    const btnWaitlist = e.target.closest('.btn-waitlist');
    if (btnWaitlist && currentRole === 'customer') {
      requestWaitlistReservation(parseInt(btnWaitlist.dataset.bookid));
      return;
    }

    // 10. Buch reservieren (Kunde in Liste) – alle anderen .btn-reserve ohne Sonderrolle
    const btnReserve = e.target.closest('.btn-reserve:not(.btn-modal-reserve):not(.btn-waitlist)');
    if (btnReserve && currentRole === 'customer') {
      reserveBook(parseInt(btnReserve.dataset.bookid));
      return;
    }

    // 11. Buch vormerken (Warteliste) aus dem Detail-Dialog
    const btnModalWaitlist = e.target.closest('.btn-modal-waitlist');
    if (btnModalWaitlist && currentRole === 'customer') {
      requestWaitlistReservation(parseInt(btnModalWaitlist.dataset.bookid));
      return;
    }

    // 12. Buch als abgeholt markieren (Mitarbeiter)
    const btnPickup = e.target.closest('.btn-pickup');
    if (btnPickup && currentRole === 'employee') {
      employeePickupBook(parseInt(btnPickup.dataset.bookid));
      return;
    }

    // 13. Buch zurücknehmen (Mitarbeiter) - nur wenn nicht gesperrt
    const btnReturn = e.target.closest('.btn-return:not(.btn-disabled)');
    if (btnReturn && currentRole === 'employee') {
      employeeReturnBook(parseInt(btnReturn.dataset.bookid));
      return;
    }

    // 14. Fristverlängerung beantragen (Kunde)
    const btnRequestExtension = e.target.closest('.btn-request-extension');
    if (btnRequestExtension && currentRole === 'customer') {
      openExtendRequestDialog(parseInt(btnRequestExtension.dataset.borrowid));
      return;
    }

    // 15. Fristverlängerung bestätigen (im Dialog) – je nach Modus entweder
    // eine Kundenanfrage oder eine direkte Verlängerung durch Mitarbeiter
    const btnConfirmExtension = e.target.closest('.btn-confirm-extension');
    if (btnConfirmExtension) {
      const borrowId = parseInt(document.getElementById('extend-request-borrowid').value);
      const mode = document.getElementById('extend-request-mode').value;
      const daysInput = document.querySelector('input[name="extend-days"]:checked');
      const days = daysInput ? parseInt(daysInput.value) : appConfig.loanPeriodDays;
      if (borrowId) {
        if (mode === 'employee' && currentRole === 'employee') {
          employeeExtendLoan(borrowId, days);
        } else {
          requestExtension(borrowId, days);
        }
      }
      document.getElementById('extend-request-dialog').close();
      return;
    }

    // 15b. Fristverlängerung direkt durch Mitarbeiter anstoßen
    const btnEmployeeExtend = e.target.closest('.btn-employee-extend');
    if (btnEmployeeExtend && currentRole === 'employee') {
      openEmployeeExtendDialog(parseInt(btnEmployeeExtend.dataset.borrowid));
      return;
    }

    // 16. Fristverlängerung annehmen (Mitarbeiter)
    const btnAcceptExtension = e.target.closest('.btn-accept-extension');
    if (btnAcceptExtension && currentRole === 'employee') {
      acceptExtensionRequest(parseInt(btnAcceptExtension.dataset.requestid));
      return;
    }

    // 17. Fristverlängerung ablehnen (Mitarbeiter)
    const btnDeclineExtension = e.target.closest('.btn-decline-extension');
    if (btnDeclineExtension && currentRole === 'employee') {
      declineExtensionRequest(parseInt(btnDeclineExtension.dataset.requestid));
      return;
    }

    // 18. Zum Mahnwesen wechseln (Mitarbeiter)
    const btnGotoMahnwesen = e.target.closest('.btn-goto-mahnwesen');
    if (btnGotoMahnwesen && currentRole === 'employee') {
      const custId = parseInt(btnGotoMahnwesen.dataset.customerid);
      if (custId) openMahnwesenForCustomer(custId);
      return;
    }

    // 19. Mahnwesen: Details & Zahlung zu einem überfälligen Buch öffnen
    const btnMahnBookDetails = e.target.closest('.btn-mahnwesen-book-details');
    if (btnMahnBookDetails && currentRole === 'employee') {
      openMahnwesenBookDialog(parseInt(btnMahnBookDetails.dataset.bookid));
      return;
    }

    // 20. Mahnwesen: Details & Zahlung zu einem Kunden öffnen
    const btnMahnCustomerDetails = e.target.closest('.btn-mahnwesen-customer-details');
    if (btnMahnCustomerDetails && currentRole === 'employee') {
      openMahnwesenCustomerDialog(parseInt(btnMahnCustomerDetails.dataset.customerid));
      return;
    }

    // 21. Mahnwesen: Gebühr für genau ein Buch begleichen (in einer Transaktion)
    const btnSettleBookFine = e.target.closest('.btn-settle-book-fine');
    if (btnSettleBookFine && currentRole === 'employee') {
      const bookId = parseInt(btnSettleBookFine.dataset.bookid);
      const bb = activeLoans().find(b => b.bookId == bookId);
      if (bb) {
        const customerId = bb.customerId;
        payBookFine(bb);
        renderEmployee();
        const bookDialog = document.getElementById('mahnwesen-book-dialog');
        const customerDialog = document.getElementById('mahnwesen-customer-dialog');
        if (bookDialog && bookDialog.open) openMahnwesenBookDialog(bookId);
        if (customerDialog && customerDialog.open) openMahnwesenCustomerDialog(customerId);
      }
      return;
    }

    // 22. Mahnwesen: gesamten offenen Saldo eines Kunden in einer Transaktion begleichen
    const btnSettleAllCustomer = e.target.closest('.btn-settle-all-customer');
    if (btnSettleAllCustomer && currentRole === 'employee') {
      const customerId = parseInt(btnSettleAllCustomer.dataset.customerid);
      payAllForCustomer(customerId);
      renderEmployee();
      const customerDialog = document.getElementById('mahnwesen-customer-dialog');
      if (customerDialog && customerDialog.open) openMahnwesenCustomerDialog(customerId);
      return;
    }
  });
}

loadData().catch((err) => {
  console.error('Fehler beim Laden der Daten:', err);
  document.body.innerHTML = `
    <div style="padding:2rem; max-width:600px; margin:2rem auto; background:#fff; border-radius:12px; border:1px solid #e2e8f0; font-family:sans-serif;">
      <h2 style="color:#dc2626; margin-top:0;">⚠️ Fehler beim Laden der Daten</h2>
      <p style="color:#475569; line-height:1.5;">Browser blockieren das Laden von JSON-Dateien über <code>file://</code> aus Sicherheitsgründen (CORS). Bitte starten Sie einen lokalen Webserver:</p>
      <pre style="background:#f1f5f9; padding:0.75rem; border-radius:6px; font-weight:600;">python3 -m http.server 8000</pre>
      <p style="color:#475569;">Öffnen Sie anschließend <a href="http://localhost:8000" style="color:#0f5973;">http://localhost:8000</a> im Browser.</p>
    </div>`;
});
