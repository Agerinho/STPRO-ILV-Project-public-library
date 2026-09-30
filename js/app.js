let customers = [];
let books = [];
let employees = [];
let borrowedBooks = [];
let reservedBooks = [];
let customerPayments = {};
let currentRole = null;
let currentUser = null;

function loadFromStorage() {
  const saved = localStorage.getItem('library_data');
  if (!saved) return false;
  const data = JSON.parse(saved);
  customers = data.customers || [];
  books = data.books || [];
  employees = data.employees || [];
  borrowedBooks = data.borrowedBooks || [];
  reservedBooks = data.reservedBooks || [];
  customerPayments = data.customerPayments || {};
  return true;
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

function findBook(id) {
  return books.find(b => b.id === id);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('de-AT');
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
  return book.image ? `<img src="${book.image}" alt="${book.title}" loading="lazy" class="book-cover">` : '';
}

function getCustomerPaid(customerId) {
  return customerPayments[customerId] || 0;
}

function renderCustomerInfo() {
  const customer = currentUser;
  document.getElementById('customer-info').innerHTML = `<p>${customer.name}<br>${customer.email}<br>${customer.phone}<br>${customer.address}</p>`;
}

function renderCustomerBorrowed() {
  const list = document.getElementById('customer-borrowed');
  list.innerHTML = '';
  borrowedBooks
    .filter(bb => bb.customerId == currentUser.id)
    .forEach(bb => {
      const book = findBook(bb.bookId);
      const li = document.createElement('li');
      const overdueClass = isOverdue(bb) ? 'overdue' : '';
      li.innerHTML = `${bookImage(book)}<span class="${overdueClass}"><strong>${book.title}</strong> von ${book.author}<br>Rückgabe bis: ${formatDate(bb.dueDate)}<br>Offene Kosten: € ${(bb.fine || 0).toFixed(2)}</span>`;
      list.appendChild(li);
    });
}

function renderCustomerReserved() {
  const list = document.getElementById('customer-reserved');
  list.innerHTML = '';
  reservedBooks
    .filter(rb => rb.customerId == currentUser.id)
    .forEach(rb => {
      const book = findBook(rb.bookId);
      const li = document.createElement('li');
      li.innerHTML = `${bookImage(book)}<strong>${book.title}</strong> von ${book.author}<br>Reserviert – bitte in der Bibliothek abholen`;
      list.appendChild(li);
    });
}

function renderCustomerAvailable() {
  const list = document.getElementById('customer-available');
  list.innerHTML = '';
  availableBooks().forEach(b => {
    const li = document.createElement('li');
    li.innerHTML = `${bookImage(b)}<strong>${b.title}</strong> von ${b.author}<br><button class="btn-reserve" data-bookid="${b.id}">Reservieren</button>`;
    list.appendChild(li);
  });
}

function renderCustomer() {
  renderCustomerInfo();
  renderCustomerBorrowed();
  renderCustomerReserved();
  renderCustomerAvailable();
}

function renderEmployeeBorrowed() {
  const list = document.getElementById('employee-borrowed');
  list.innerHTML = '';
  borrowedBooks.forEach(bb => {
    const customer = customers.find(c => c.id == bb.customerId);
    const book = findBook(bb.bookId);
    const li = document.createElement('li');
    li.innerHTML = `${bookImage(book)}<strong>${book.title}</strong> — Kunde: ${customer.name}<br>Rückgabe bis: ${formatDate(bb.dueDate)}<br><button class="btn-return" data-bookid="${book.id}">Zurückgegeben</button>`;
    list.appendChild(li);
  });
}

function renderEmployeeOverdue() {
  const list = document.getElementById('employee-overdue');
  list.innerHTML = '';
  borrowedBooks.forEach(bb => {
    if (!isOverdue(bb)) return;
    const customer = customers.find(c => c.id == bb.customerId);
    const book = findBook(bb.bookId);
    const li = document.createElement('li');
    const fine = bb.fine || 0;
    li.innerHTML = `${bookImage(book)}<strong>${book.title}</strong> — Kunde: ${customer.name}<br>Rückgabe war: ${formatDate(bb.dueDate)}<br>Mahngebühr: € ${fine.toFixed(2)}`;
    list.appendChild(li);
  });
}

function renderEmployeeAvailable() {
  const list = document.getElementById('employee-available');
  list.innerHTML = '';
  availableBooks().forEach(b => {
    const li = document.createElement('li');
    li.innerHTML = `${bookImage(b)}<strong>${b.title}</strong> von ${b.author}`;
    list.appendChild(li);
  });
}

function renderEmployeeReserved() {
  const list = document.getElementById('employee-reserved');
  list.innerHTML = '';
  reservedBooks.forEach(rb => {
    const book = findBook(rb.bookId);
    const customer = customers.find(c => c.id == rb.customerId);
    const li = document.createElement('li');
    li.innerHTML = `${bookImage(book)}<strong>${book.title}</strong> von ${book.author}<br>Reserviert von: ${customer.name}<br><button class="btn-pickup" data-bookid="${book.id}">Abgeholt</button>`;
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
  const customerBorrows = borrowedBooks.filter(bb => bb.customerId == customerId);
  const totalFees = customerBorrows.reduce((sum, bb) => sum + (bb.fine || 0), 0);
  const paid = getCustomerPaid(customerId);
  const open = Math.max(totalFees - paid, 0);

  let html = `<div class="account-summary">`;
  html += `<p><strong>${customer.name}</strong></p>`;
  html += `<p>Gesamte Mahngebühren: € ${totalFees.toFixed(2)}</p>`;
  html += `<p>Bereits gezahlt: € ${paid.toFixed(2)}</p>`;
  html += `<p>Offener Betrag: € ${open.toFixed(2)}</p>`;
  html += `</div>`;

  html += `<h4>Einzelgebühren</h4><ul>`;
  if (customerBorrows.length === 0) {
    html += `<li>Keine ausgeliehenen Bücher.</li>`;
  }
  customerBorrows.forEach(bb => {
    const book = findBook(bb.bookId);
    const fine = bb.fine || 0;
    const overdueClass = isOverdue(bb) ? 'overdue' : '';
    html += `<li>${bookImage(book)}<span class="${overdueClass}"><strong>${book.title}</strong> von ${book.author}<br>Rückgabe bis: ${formatDate(bb.dueDate)}<br>Mahngebühr: € ${fine.toFixed(2)}</span></li>`;
  });
  html += `</ul>`;

  if (open > 0) {
    html += `<p><label>Zahlung (€): <input type="number" id="payment-amount" min="0" step="0.01" value="${open.toFixed(2)}"></label></p>`;
    html += `<p><button id="btn-pay-full">Vollständig begleichen</button> <button id="btn-pay-partial">Betrag einbuchen</button></p>`;
  } else {
    html += `<p><strong>Konto ist beglichen.</strong></p>`;
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

function init() {
  document.getElementById('btn-login').addEventListener('click', doLogin);
  document.getElementById('btn-logout').addEventListener('click', logout);

  document.getElementById('btn-customer-borrowed').addEventListener('click', () => showCustomerPanel('borrowed'));
  document.getElementById('btn-customer-available').addEventListener('click', () => showCustomerPanel('available'));

  const empSel = document.getElementById('employee-customer-select');
  customers.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    empSel.appendChild(opt);
  });
  empSel.addEventListener('change', () => renderCustomerAccount(empSel.value));

  document.getElementById('customer-available').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-reserve')) {
      reserveBook(parseInt(e.target.dataset.bookid));
    }
  });
  document.getElementById('employee-reserved').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-pickup')) {
      employeePickupBook(parseInt(e.target.dataset.bookid));
    }
  });
  document.getElementById('employee-borrowed').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-return')) {
      employeeReturnBook(parseInt(e.target.dataset.bookid));
    }
  });
}

loadData().catch(() => {
  document.body.innerHTML = '<p style="color:#b00000;padding:1rem">Fehler beim Laden der Daten. Bitte öffne die Seite über einen lokalen Server, z.B. <code>python3 -m http.server 8000</code>.</p>';
});
