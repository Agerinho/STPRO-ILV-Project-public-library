let customers = [];
let books = [];
let employees = [];
let borrowedBooks = [];
let reservedBooks = [];
let customerPayments = {};
let currentRole = null;
let currentUser = null;
let customerSearchQuery = '';

// ============================================================================
// THEME & PERSISTENZ
// ============================================================================

function initTheme() {
  const savedTheme = localStorage.getItem('library_theme') || 'warm-sage';
  document.documentElement.setAttribute('data-theme', savedTheme);
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.value = savedTheme;
    themeSelect.addEventListener('change', (e) => {
      const newTheme = e.target.value;
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('library_theme', newTheme);
    });
  }
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

function updateBadge(id, count) {
  const badge = document.getElementById(id);
  if (badge) badge.textContent = count;
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
      (b.author && b.author.toLowerCase().includes(q))
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
      <div class="book-card">
        ${bookImage(b)}
        <div class="book-details">
          <div class="book-header">
            <h4 class="book-title">${b.title}</h4>
            <div class="book-author">von ${b.author}</div>
            <div class="book-meta-sub">
              <span>ISBN: ${b.isbn || '—'}</span>
            </div>
          </div>
          <div class="book-footer">
            <span class="badge badge-success">✓ Verfügbar</span>
            <button class="btn-reserve" data-bookid="${b.id}">📖 Reservieren</button>
          </div>
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
// MITARBEITERANSICHT RENDERN
// ============================================================================

function renderEmployeeBorrowed() {
  const list = document.getElementById('employee-borrowed');
  list.innerHTML = '';
  updateBadge('badge-emp-borrowed', borrowedBooks.length);
  updateBadge('emp-stat-borrowed', borrowedBooks.length);

  if (borrowedBooks.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <span class="empty-icon" aria-hidden="true">📚</span>
        <p>Aktuell sind keine Bücher ausgeliehen.</p>
      </li>`;
    return;
  }

  borrowedBooks.forEach(bb => {
    const customer = customers.find(c => c.id == bb.customerId);
    const book = findBook(bb.bookId);
    if (!book || !customer) return;
    const li = document.createElement('li');
    li.className = 'book-card-item';
    const overdue = isOverdue(bb);

    li.innerHTML = `
      <div class="book-card ${overdue ? 'card-overdue' : ''}">
        ${bookImage(book)}
        <div class="book-details">
          <div class="book-header">
            <h4 class="book-title">${book.title}</h4>
            <div class="book-author">Entlehnt von: <strong>${customer.name}</strong></div>
          </div>
          <div class="book-badges">
            <span class="badge ${overdue ? 'badge-danger' : 'badge-info'}">
              📅 Rückgabe bis: ${formatDate(bb.dueDate)} ${overdue ? '(Überfällig)' : ''}
            </span>
          </div>
          <div class="book-footer">
            <button class="btn-return" data-bookid="${book.id}">↩️ Zurückgegeben</button>
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
  updateBadge('badge-emp-overdue', overdueList.length);
  updateBadge('emp-stat-overdue', overdueList.length);

  if (overdueList.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <span class="empty-icon" aria-hidden="true">🎉</span>
        <p>Keine überfälligen Bücher! Alles im Plan.</p>
      </li>`;
    return;
  }

  overdueList.forEach(bb => {
    const customer = customers.find(c => c.id == bb.customerId);
    const book = findBook(bb.bookId);
    if (!book || !customer) return;
    const li = document.createElement('li');
    li.className = 'book-card-item';
    const fine = bb.fine || 0;

    li.innerHTML = `
      <div class="book-card card-overdue">
        ${bookImage(book)}
        <div class="book-details">
          <div class="book-header">
            <h4 class="book-title">${book.title}</h4>
            <div class="book-author">Kunde: <strong>${customer.name}</strong> (${customer.email})</div>
          </div>
          <div class="book-badges">
            <span class="badge badge-danger">⚠️ Rückgabe war: ${formatDate(bb.dueDate)}</span>
            <span class="badge badge-danger">💶 Mahngebühr: € ${fine.toFixed(2)}</span>
          </div>
        </div>
      </div>`;
    list.appendChild(li);
  });
}

function renderEmployeeAvailable() {
  const list = document.getElementById('employee-available');
  list.innerHTML = '';
  const available = availableBooks();
  updateBadge('badge-emp-available', available.length);

  if (available.length === 0) {
    list.innerHTML = `
      <li class="empty-state" style="grid-column: 1 / -1;">
        <span class="empty-icon" aria-hidden="true">📚</span>
        <p>Keine Bücher im Bestand verfügbar.</p>
      </li>`;
    return;
  }

  available.forEach(b => {
    const li = document.createElement('li');
    li.className = 'book-card-item';
    li.innerHTML = `
      <div class="book-card">
        ${bookImage(b)}
        <div class="book-details">
          <div class="book-header">
            <h4 class="book-title">${b.title}</h4>
            <div class="book-author">von ${b.author}</div>
            <div class="book-meta-sub">
              <span>ISBN: ${b.isbn || '—'}</span>
            </div>
          </div>
          <div class="book-footer">
            <span class="badge badge-success">✓ Im Regal verfügbar</span>
          </div>
        </div>
      </div>`;
    list.appendChild(li);
  });
}

function renderEmployeeReserved() {
  const list = document.getElementById('employee-reserved');
  list.innerHTML = '';
  updateBadge('badge-emp-reserved', reservedBooks.length);
  updateBadge('emp-stat-reserved', reservedBooks.length);

  if (reservedBooks.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <span class="empty-icon" aria-hidden="true">📦</span>
        <p>Keine offenen Reservierungen zur Abholung.</p>
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
            <div class="book-author">Reserviert von: <strong>${customer.name}</strong></div>
          </div>
          <div class="book-badges">
            <span class="badge badge-warning">📦 Liegt zur Abholung bereit</span>
          </div>
          <div class="book-footer">
            <button class="btn-pickup" data-bookid="${book.id}">✓ Als abgeholt markieren</button>
          </div>
        </div>
      </div>`;
    list.appendChild(li);
  });
}

function renderCustomerAccount(customerId) {
  const accountDiv = document.getElementById('employee-customer-account');
  if (!customerId) {
    accountDiv.innerHTML = '';
    return;
  }
  const customer = customers.find(c => c.id == customerId);
  if (!customer) {
    accountDiv.innerHTML = '';
    return;
  }
  const customerBorrows = borrowedBooks.filter(bb => bb.customerId == customerId);
  const totalFees = customerBorrows.reduce((sum, bb) => sum + (bb.fine || 0), 0);
  const paid = getCustomerPaid(customerId);
  const open = Math.max(totalFees - paid, 0);

  let html = `
    <div class="account-card">
      <div class="account-summary-header">
        <div>
          <span class="member-tag">Kundenkonto</span>
          <h4 class="account-customer-name">${customer.name}</h4>
          <div class="account-customer-meta">✉️ ${customer.email} • 📞 ${customer.phone} • 📍 ${customer.address}</div>
        </div>
        <div class="balance-badge ${open > 0 ? 'balance-due' : 'balance-cleared'}">
          ${open > 0 ? `Offener Betrag: € ${open.toFixed(2)}` : 'Konto ausgeglichen ✓'}
        </div>
      </div>
      <div class="account-kpis">
        <div class="stat-pill">
          <span class="stat-label">Gesamte Mahngebühren</span>
          <span class="stat-value">€ ${totalFees.toFixed(2)}</span>
        </div>
        <div class="stat-pill">
          <span class="stat-label">Bereits bezahlt</span>
          <span class="stat-value">€ ${paid.toFixed(2)}</span>
        </div>
        <div class="stat-pill ${open > 0 ? 'stat-warning' : 'stat-ok'}">
          <span class="stat-label">Noch zu zahlen</span>
          <span class="stat-value">€ ${open.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;

  html += `<h4 class="section-subtitle">Einzelgebühren für ausgeliehene Bücher</h4><ul class="account-book-list">`;
  if (customerBorrows.length === 0) {
    html += `<li class="empty-state-simple">Keine aktuell ausgeliehenen Bücher bei diesem Kunden.</li>`;
  }
  customerBorrows.forEach(bb => {
    const book = findBook(bb.bookId);
    if (!book) return;
    const fine = bb.fine || 0;
    const overdue = isOverdue(bb);
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
              <span class="badge ${overdue ? 'badge-danger' : 'badge-info'}">📅 Rückgabe bis: ${formatDate(bb.dueDate)}</span>
              <span class="badge ${fine > 0 ? 'badge-danger' : 'badge-success'}">${fine > 0 ? `⚠️ Mahngebühr: € ${fine.toFixed(2)}` : 'Keine Mahngebühr'}</span>
            </div>
          </div>
        </div>
      </li>`;
  });
  html += `</ul>`;

  if (open > 0) {
    html += `
      <div class="payment-action-box">
        <h4>Vor-Ort-Zahlung verbuchen</h4>
        <div class="payment-form-row">
          <label class="payment-label">
            Betrag (€):
            <input type="number" id="payment-amount" min="0" step="0.01" value="${open.toFixed(2)}" class="input-field">
          </label>
          <div class="payment-buttons">
            <button id="btn-pay-full" class="btn-primary">✓ Vollständig begleichen</button>
            <button id="btn-pay-partial" class="btn-secondary">Betrag einbuchen</button>
          </div>
        </div>
      </div>`;
  } else {
    html += `<div class="alert-success">✓ Das Kundenkonto ist ausgeglichen. Keine offenen Gebühren vorhanden.</div>`;
  }
  accountDiv.innerHTML = html;

  if (open > 0) {
    document.getElementById('btn-pay-full').addEventListener('click', () => {
      customerPayments[customerId] = totalFees;
      saveData();
      renderCustomerAccount(customerId);
    });
    document.getElementById('btn-pay-partial').addEventListener('click', () => {
      const amount = parseFloat(document.getElementById('payment-amount').value);
      if (isNaN(amount) || amount <= 0) return;
      const currentPaid = getCustomerPaid(customerId);
      customerPayments[customerId] = Math.min(currentPaid + amount, totalFees);
      saveData();
      renderCustomerAccount(customerId);
    });
  }
}

function renderEmployee() {
  renderEmployeeBorrowed();
  renderEmployeeOverdue();
  renderEmployeeAvailable();
  renderEmployeeReserved();
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
  const sel = document.getElementById('employee-customer-select');
  if (sel.value) renderCustomerAccount(sel.value);
  saveData();
}

function employeeReturnBook(bookId) {
  const idx = borrowedBooks.findIndex(bb => bb.bookId == bookId);
  if (idx === -1) return;
  borrowedBooks.splice(idx, 1);
  calculateFines();
  renderEmployee();
  const sel = document.getElementById('employee-customer-select');
  if (sel.value) renderCustomerAccount(sel.value);
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

  const empSel = document.getElementById('employee-customer-select');
  customers.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name} (${c.email})`;
    empSel.appendChild(opt);
  });
  empSel.addEventListener('change', () => renderCustomerAccount(empSel.value));

  // Delegation für Reservieren, Abholen, Zurückgeben
  document.getElementById('customer-available').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-reserve');
    if (btn) {
      reserveBook(parseInt(btn.dataset.bookid));
    }
  });

  document.getElementById('employee-reserved').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-pickup');
    if (btn) {
      employeePickupBook(parseInt(btn.dataset.bookid));
    }
  });

  document.getElementById('employee-borrowed').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-return');
    if (btn) {
      employeeReturnBook(parseInt(btn.dataset.bookid));
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
      <p style="color:#475569;">Öffnen Sie anschließend <a href="http://localhost:8000" style="color:#1b5e5a;">http://localhost:8000</a> im Browser.</p>
    </div>`;
});
