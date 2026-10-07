let customers = [];
let books = [];
let employees = [];
let borrowedBooks = [];
let reservedBooks = [];
let customerPayments = {};
let currentRole = null;
let currentUser = null;
let customerSearchQuery = '';

let currentEmployeeTab = 'borrowed';
let employeeSearchBorrowedQuery = '';
let employeeSearchAvailableQuery = '';
let employeeCustomerSearchQuery = '';

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
    ensureBookDescriptions();
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
    customerPayments
  }));
}

async function loadData() {
  if (loadFromStorage()) {
    calculateFines();
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
  ensureBookDescriptions();
  saveData();
  calculateFines();
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

function isOverdue(record) {
  return new Date(record.dueDate) < new Date();
}

function weeksOverdue(record) {
  const due = new Date(record.dueDate);
  const now = new Date();
  if (due >= now) return 0;
  const diffDays = Math.floor((now - due) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

function calculateFine(record) {
  const weeks = weeksOverdue(record);
  if (weeks <= 0) return 0;
  return 2 * Math.pow(1.2, weeks);
}

function calculateFines() {
  borrowedBooks.forEach(bb => {
    bb.fine = calculateFine(bb);
  });
}

function borrowedBookIds() {
  return new Set(borrowedBooks.map(bb => bb.bookId));
}

function reservedBookIds() {
  return new Set(reservedBooks.map(rb => rb.bookId));
}

function availableBooks() {
  const borrowed = borrowedBookIds();
  const reserved = reservedBookIds();
  return books.filter(b => !borrowed.has(b.id) && !reserved.has(b.id));
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
  if (!bb || !bb.fine || bb.fine <= 0) return 0;
  const customerId = bb.customerId;
  const customerBorrows = borrowedBooks.filter(b => b.customerId == customerId && (b.fine || 0) > 0);
  const totalFines = customerBorrows.reduce((sum, b) => sum + (b.fine || 0), 0);
  const totalPaid = getCustomerPaid(customerId);
  if (totalPaid >= totalFines) return 0;

  // Zahlungen sequentiell anrechnen
  let remainingPaid = totalPaid;
  for (const b of customerBorrows) {
    const fine = b.fine || 0;
    const covered = Math.min(fine, remainingPaid);
    remainingPaid -= covered;
    if (b.id === bb.id || (b.bookId === bb.bookId && b.customerId === bb.customerId)) {
      return Math.max(0, fine - covered);
    }
  }
  return bb.fine;
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

  const isBorrowed = borrowedBooks.some(bb => bb.bookId === book.id);
  const isReserved = reservedBooks.some(rb => rb.bookId === book.id);
  const isAvailable = !isBorrowed && !isReserved;

  let statusBadge = '<span class="badge badge-success">✓ Im Bestand verfügbar</span>';
  if (isBorrowed) {
    const borrowRecord = borrowedBooks.find(bb => bb.bookId === book.id);
    const isMyBorrow = currentUser && borrowRecord && borrowRecord.customerId == currentUser.id;
    statusBadge = `<span class="badge badge-info">📅 Ausgeliehen (Rückgabe bis: ${formatDate(borrowRecord ? borrowRecord.dueDate : '')})${isMyBorrow ? ' • Von Ihnen' : ''}</span>`;
  } else if (isReserved) {
    const reserveRecord = reservedBooks.find(rb => rb.bookId === book.id);
    const isMyReserve = currentUser && reserveRecord && reserveRecord.customerId == currentUser.id;
    statusBadge = `<span class="badge badge-warning">📦 Reserviert zur Abholung${isMyReserve ? ' • Von Ihnen' : ''}</span>`;
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
    if (currentRole === 'customer' && isAvailable) {
      actionSlot.innerHTML = `<button class="btn-primary btn-modal-reserve" data-bookid="${book.id}">📖 Jetzt reservieren</button>`;
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
  if (borrowedBooks.some(bb => bb.bookId == bookId)) {
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
  const myBorrows = borrowedBooks.filter(bb => bb.customerId == customer.id);
  const myReserved = reservedBooks.filter(rb => rb.customerId == customer.id);
  const totalFine = myBorrows.reduce((sum, bb) => sum + (bb.fine || 0), 0);
  const paid = getCustomerPaid(customer.id);
  const openBalance = Math.max(totalFine - paid, 0);

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

function renderCustomerBorrowed() {
  const list = document.getElementById('customer-borrowed');
  list.innerHTML = '';
  const myBorrows = borrowedBooks.filter(bb => bb.customerId == currentUser.id);
  updateBadge('badge-cust-borrowed', myBorrows.length);

  if (myBorrows.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <span class="empty-icon" aria-hidden="true">📚</span>
        <p>Aktuell haben Sie keine Bücher ausgeliehen.</p>
      </li>`;
    return;
  }

  myBorrows.forEach(bb => {
    const book = findBook(bb.bookId);
    if (!book) return;
    const li = document.createElement('li');
    li.className = 'book-card-item';
    const overdue = isOverdue(bb);
    const overdueClass = overdue ? 'overdue' : '';
    const fine = bb.fine || 0;

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
            </div>
          </div>
          <div class="book-badges">
            <span class="badge ${overdue ? 'badge-danger ' + overdueClass : 'badge-info'}">
              📅 Rückgabe bis: ${formatDate(bb.dueDate)} ${overdue ? '(Überfällig!)' : ''}
            </span>
            ${fine > 0 
              ? `<span class="badge badge-danger">⚠️ Offene Kosten: € ${fine.toFixed(2)}</span>` 
              : `<span class="badge badge-success">✓ Fristgerecht</span>`}
          </div>
          <div class="book-footer">
            <button class="btn-secondary btn-sm btn-book-details" data-bookid="${book.id}">ℹ️ Details anzeigen</button>
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
    li.innerHTML = `
      <div class="book-card card-reserved">
        ${bookImage(book)}
        <div class="book-details">
          <div class="book-header">
            <h4 class="book-title">${book.title}</h4>
            <div class="book-author">von ${book.author}</div>
          </div>
          <div class="book-badges">
            <span class="badge badge-warning">🔖 Reserviert – bitte vor Ort in der Bibliothek abholen</span>
          </div>
          <div class="book-footer">
            <button class="btn-secondary btn-sm btn-book-details" data-bookid="${book.id}">ℹ️ Details anzeigen</button>
          </div>
        </div>
      </div>`;
    list.appendChild(li);
  });
}

function renderCustomerAvailable() {
  const list = document.getElementById('customer-available');
  list.innerHTML = '';
  let available = availableBooks();
  updateBadge('badge-cust-available', available.length);

  if (customerSearchQuery) {
    const q = customerSearchQuery.toLowerCase();
    available = available.filter(b => 
      (b.title && b.title.toLowerCase().includes(q)) || 
      (b.author && b.author.toLowerCase().includes(q)) ||
      (b.isbn && b.isbn.toLowerCase().includes(q))
    );
  }

  if (available.length === 0) {
    list.innerHTML = `
      <li class="empty-state" style="grid-column: 1 / -1;">
        <span class="empty-icon" aria-hidden="true">🔍</span>
        <p>${customerSearchQuery ? 'Keine Treffer für Ihre Suche.' : 'Derzeit sind alle Bücher ausgeliehen oder reserviert.'}</p>
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
              </div>
            </div>
          </div>
        </div>
        <div class="book-footer book-actions-customer">
          <button class="btn-secondary btn-sm btn-book-details" data-bookid="${b.id}">ℹ️ Details</button>
          <button class="btn-reserve btn-sm" data-bookid="${b.id}">📖 Reservieren</button>
        </div>
      </div>`;
    list.appendChild(li);
  });
}

function renderCustomer() {
  renderCustomerInfo();
  renderCustomerBorrowed();
  renderCustomerReserved();
  renderCustomerAvailable();
}

// ============================================================================
// MITARBEITERANSICHT RENDERN & REITER-LOGIK
// ============================================================================

function showEmployeeTab(tab) {
  currentEmployeeTab = tab;
  const tabs = ['borrowed', 'overdue', 'reserved', 'available', 'customers'];
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

function updateEmployeeBadges() {
  const overdueCount = borrowedBooks.filter(bb => isOverdue(bb)).length;
  const availableCount = availableBooks().length;
  const borrowedCount = borrowedBooks.length;
  const reservedCount = reservedBooks.length;
  const customerCount = customers.length;

  // Nav tab badges
  updateBadge('badge-tab-emp-borrowed', borrowedCount);
  updateBadge('badge-tab-emp-overdue', overdueCount);
  updateBadge('badge-tab-emp-reserved', reservedCount);
  updateBadge('badge-tab-emp-available', availableCount);
  updateBadge('badge-tab-emp-customers', customerCount);

  // Section title badges
  updateBadge('badge-emp-borrowed', borrowedCount);
  updateBadge('badge-emp-overdue', overdueCount);
  updateBadge('badge-emp-reserved', reservedCount);
  updateBadge('badge-emp-available', availableCount);
  updateBadge('badge-emp-customers', customerCount);
}

function renderEmployeeBorrowed() {
  const list = document.getElementById('employee-borrowed');
  list.innerHTML = '';
  let borrows = [...borrowedBooks];

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
    const overdue = isOverdue(bb);
    const openFine = getBookOpenFine(bb);
    const hasBlockedFee = openFine > 0;

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
            </div>
          </div>
          <div class="book-badges">
            <span class="badge ${overdue ? 'badge-danger' : 'badge-info'}">
              📅 Rückgabe bis: ${formatDate(bb.dueDate)} ${overdue ? '(Überfällig)' : ''}
            </span>
            ${hasBlockedFee ? `
              <span class="badge badge-danger">⚠️ Offene Mahngebühr: € ${openFine.toFixed(2)}</span>
              <span class="badge badge-danger" title="Rücknahme erst nach Bezahlung der Mahngebühr möglich">🚫 Rücknahme gesperrt</span>
            ` : (bb.fine > 0 ? `
              <span class="badge badge-success">✓ Mahngebühr beglichen</span>
            ` : `
              <span class="badge badge-success">✓ Keine offenen Gebühren</span>
            `)}
          </div>
          <div class="book-footer">
            <button class="btn-secondary btn-sm btn-book-details" data-bookid="${book.id}">ℹ️ Details</button>
            ${hasBlockedFee ? `
              <button class="btn-return btn-disabled" disabled title="Rücknahme nicht möglich: Für dieses Buch besteht noch eine offene Mahngebühr von € ${openFine.toFixed(2)}. Bitte begleichen Sie zuerst die Gebühr im Kundenkonto.">
                🚫 Rücknahme blockiert
              </button>
              <button class="btn-secondary btn-goto-customer" data-customerid="${customer.id}" title="Zum Kundenkonto wechseln und Gebühr begleichen">
                💳 Gebühr im Kundenkonto begleichen →
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

function renderEmployeeOverdue() {
  const list = document.getElementById('employee-overdue');
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
    const totalFine = bb.fine || 0;
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
            <button class="btn-secondary btn-sm btn-book-details" data-bookid="${book.id}">ℹ️ Details</button>
            ${hasBlockedFee ? `
              <button class="btn-secondary btn-goto-customer" data-customerid="${customer.id}">
                💳 Gebühr im Kundenkonto einsehen & begleichen →
              </button>
            ` : `
              <button class="btn-return" data-bookid="${book.id}">
                ↩️ Zurücknehmen (Gebühr beglichen)
              </button>
            `}
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

function renderEmployeeReserved() {
  const list = document.getElementById('employee-reserved');
  list.innerHTML = '';

  if (reservedBooks.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <span class="empty-icon" aria-hidden="true">📦</span>
        <p>Keine offenen Reservierungen zur Abholung vorhanden.</p>
      </li>`;
    return;
  }

  reservedBooks.forEach(rb => {
    const book = findBook(rb.bookId);
    const customer = customers.find(c => c.id == rb.customerId);
    if (!book || !customer) return;
    const li = document.createElement('li');
    li.className = 'book-card-item';
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
            <span class="badge badge-warning">📦 Liegt zur Abholung an der Theke</span>
          </div>
          <div class="book-footer">
            <button class="btn-secondary btn-sm btn-book-details" data-bookid="${book.id}">ℹ️ Details</button>
            <button class="btn-pickup" data-bookid="${book.id}">✓ Als abgeholt markieren (14 Tage Frist)</button>
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
        const borrows = borrowedBooks.filter(bb => bb.customerId == c.id);
        const overdues = borrows.filter(bb => isOverdue(bb));
        const totalFees = borrows.reduce((sum, bb) => sum + (bb.fine || 0), 0);
        const paid = getCustomerPaid(c.id);
        const open = Math.max(totalFees - paid, 0);

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

  const customerBorrows = borrowedBooks.filter(bb => bb.customerId == customerId);
  const customerReserved = reservedBooks.filter(rb => rb.customerId == customerId);
  const overdueBorrows = customerBorrows.filter(bb => isOverdue(bb));
  const totalFees = customerBorrows.reduce((sum, bb) => sum + (bb.fine || 0), 0);
  const paid = getCustomerPaid(customerId);
  const open = Math.max(totalFees - paid, 0);

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
    const fine = bb.fine || 0;
    const overdue = isOverdue(bb);
    const openFine = getBookOpenFine(bb);
    const hasBlockedFee = openFine > 0;

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
            </div>
            <div class="book-footer">
              <button class="btn-secondary btn-sm btn-book-details" data-bookid="${book.id}">ℹ️ Details</button>
              ${hasBlockedFee ? `
                <button class="btn-return btn-disabled" disabled title="Rücknahme nicht möglich: Offene Mahngebühr muss zuerst beglichen werden.">
                  🚫 Rücknahme gesperrt
                </button>
                <button class="btn-secondary btn-pay-book-fine" data-bookid="${book.id}" data-customerid="${customer.id}" data-amount="${openFine}">
                  💶 Gebühr für dieses Buch begleichen (€ ${openFine.toFixed(2)})
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
              <span class="badge badge-warning">📦 Abholbereit an der Theke</span>
            </div>
            <div class="book-footer">
              <button class="btn-secondary btn-sm btn-book-details" data-bookid="${book.id}">ℹ️ Details</button>
              <button class="btn-pickup" data-bookid="${book.id}">✓ Als abgeholt markieren (14 Tage Frist)</button>
            </div>
          </div>
        </div>
      </li>`;
  });
  html += `</ul>`;

  // 3. Mahnwesen & Vor-Ort-Zahlung
  if (open > 0) {
    html += `
      <div class="payment-action-box">
        <h4>💳 Mahnwesen & Vor-Ort-Zahlung verbuchen</h4>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.75rem;">
          Sobald die Gebühren beglichen sind, können überfällige Bücher zurückgenommen werden.
        </p>
        <div class="payment-form-row">
          <label class="payment-label">
            Betrag (€):
            <input type="number" id="payment-amount" min="0" max="${open.toFixed(2)}" step="0.01" value="${open.toFixed(2)}" class="input-field">
          </label>
          <div class="payment-buttons">
            <button id="btn-pay-full" class="btn-primary">✓ Vollständig begleichen (€ ${open.toFixed(2)})</button>
            <button id="btn-pay-partial" class="btn-secondary">Teilbetrag verbuchen</button>
          </div>
        </div>
      </div>`;
  } else {
    html += `<div class="alert-success">✓ Das Kundenkonto ist ausgeglichen. Keine offenen Gebühren vorhanden.</div>`;
  }

  accountDiv.innerHTML = html;

  if (open > 0) {
    const btnPayFull = document.getElementById('btn-pay-full');
    if (btnPayFull) {
      btnPayFull.addEventListener('click', () => {
        customerPayments[customerId] = totalFees;
        saveData();
        renderEmployee();
        renderCustomerAccount(customerId);
      });
    }

    const btnPayPartial = document.getElementById('btn-pay-partial');
    if (btnPayPartial) {
      btnPayPartial.addEventListener('click', () => {
        const amount = parseFloat(document.getElementById('payment-amount').value);
        if (isNaN(amount) || amount <= 0) return;
        const currentPaid = getCustomerPaid(customerId);
        customerPayments[customerId] = Math.min(currentPaid + amount, totalFees);
        saveData();
        renderEmployee();
        renderCustomerAccount(customerId);
      });
    }
  }
}

function renderEmployee() {
  updateEmployeeBadges();
  renderEmployeeBorrowed();
  renderEmployeeOverdue();
  renderEmployeeAvailable();
  renderEmployeeReserved();
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
}

// ============================================================================
// GESCHÄFTSLOGIK-AKTIONEN
// ============================================================================

function reserveBook(bookId) {
  reservedBooks.push({ customerId: currentUser.id, bookId });
  renderCustomer();
  saveData();
  const detailDialog = document.getElementById('book-detail-dialog');
  if (detailDialog && detailDialog.open) {
    openBookDetailDialog(bookId);
  }
}

function employeePickupBook(bookId) {
  const idx = reservedBooks.findIndex(rb => rb.bookId == bookId);
  if (idx === -1) return;
  const rb = reservedBooks[idx];
  reservedBooks.splice(idx, 1);
  const due = new Date();
  due.setDate(due.getDate() + 14);
  borrowedBooks.push({
    id: Math.max(...borrowedBooks.map(bb => bb.id), 0) + 1,
    customerId: rb.customerId,
    bookId: rb.bookId,
    dueDate: due.toISOString().split('T')[0]
  });
  calculateFines();
  renderEmployee();
  saveData();
}

function employeeReturnBook(bookId) {
  const bb = borrowedBooks.find(b => b.bookId == bookId);
  if (!bb) return;
  const openFine = getBookOpenFine(bb);
  if (openFine > 0) {
    alert(`Rücknahme nicht möglich: Für dieses Buch besteht noch eine offene Mahngebühr von € ${openFine.toFixed(2)}. Bitte begleichen Sie zuerst die Gebühr im Kundenkonto.`);
    return;
  }

  // Mahngebühr-Verrechnung bei erfolgreicher Rücknahme
  const customerId = bb.customerId;
  const bookFine = bb.fine || 0;
  if (bookFine > 0 && customerPayments[customerId]) {
    customerPayments[customerId] = Math.max(0, customerPayments[customerId] - bookFine);
  }

  const idx = borrowedBooks.findIndex(b => b.bookId == bookId);
  if (idx !== -1) {
    borrowedBooks.splice(idx, 1);
  }
  calculateFines();
  renderEmployee();
  saveData();
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
  document.querySelectorAll('.btn-demo').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('login-email').value = btn.dataset.email;
      document.getElementById('login-password').value = btn.dataset.pass;
      doLogin();
    });
  });

  // Kundenreiter
  document.getElementById('btn-customer-borrowed').addEventListener('click', () => showCustomerPanel('borrowed'));
  document.getElementById('btn-customer-available').addEventListener('click', () => showCustomerPanel('available'));

  // Schnellsuche für Kunden im Katalog
  const searchInput = document.getElementById('customer-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      customerSearchQuery = e.target.value.trim();
      renderCustomerAvailable();
    });
  }

  // Reiter für Mitarbeiteransicht
  ['borrowed', 'overdue', 'reserved', 'available', 'customers'].forEach(tab => {
    const btn = document.getElementById(`btn-emp-tab-${tab}`);
    if (btn) {
      btn.addEventListener('click', () => showEmployeeTab(tab));
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
  ['customer-dialog', 'book-form-dialog', 'book-detail-dialog'].forEach(id => {
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

    // 9. Einzelgebühr für ein Buch direkt begleichen
    const btnPayBookFine = e.target.closest('.btn-pay-book-fine');
    if (btnPayBookFine) {
      const customerId = btnPayBookFine.dataset.customerid;
      const amount = parseFloat(btnPayBookFine.dataset.amount);
      if (customerId && !isNaN(amount) && amount > 0) {
        const customerBorrows = borrowedBooks.filter(bb => bb.customerId == customerId);
        const totalFees = customerBorrows.reduce((sum, bb) => sum + (bb.fine || 0), 0);
        const currentPaid = getCustomerPaid(customerId);
        customerPayments[customerId] = Math.min(currentPaid + amount, totalFees);
        saveData();
        renderEmployee();
        renderCustomerAccount(customerId);
      }
      return;
    }

    // 10. Buch reservieren (Kunde in Liste)
    const btnReserve = e.target.closest('.btn-reserve:not(.btn-modal-reserve)');
    if (btnReserve && currentRole === 'customer') {
      reserveBook(parseInt(btnReserve.dataset.bookid));
      return;
    }

    // 11. Buch als abgeholt markieren (Mitarbeiter)
    const btnPickup = e.target.closest('.btn-pickup');
    if (btnPickup && currentRole === 'employee') {
      employeePickupBook(parseInt(btnPickup.dataset.bookid));
      return;
    }

    // 12. Buch zurücknehmen (Mitarbeiter) - nur wenn nicht gesperrt
    const btnReturn = e.target.closest('.btn-return:not(.btn-disabled)');
    if (btnReturn && currentRole === 'employee') {
      employeeReturnBook(parseInt(btnReturn.dataset.bookid));
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
