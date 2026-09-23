let customers = [];
let books = [];
let employees = [];
let borrowedBooks = [];
let currentRole = null;
let currentUser = null;

async function loadData() {
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

function borrowedBookIds() {
  return new Set(borrowedBooks.map(bb => bb.bookId));
}

function renderCustomerSelect() {
  const sel = document.getElementById('customer-select');
  sel.innerHTML = '<option value="">-- wählen --</option>';
  customers.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => renderCustomer(sel.value));
}

function renderCustomer(customerId) {
  const info = document.getElementById('customer-info');
  const borrowedList = document.getElementById('customer-borrowed');
  const availableList = document.getElementById('customer-available');
  info.innerHTML = '';
  borrowedList.innerHTML = '';
  availableList.innerHTML = '';
  if (!customerId) return;
  const customer = customers.find(c => c.id == customerId);
  info.innerHTML = `<p>${customer.name}<br>${customer.email}<br>${customer.phone}<br>${customer.address}</p>`;
  borrowedBooks
    .filter(bb => bb.customerId == customerId)
    .forEach(bb => {
      const book = findBook(bb.bookId);
      const li = document.createElement('li');
      const overdueClass = isOverdue(bb) ? 'overdue' : '';
      li.innerHTML = `<span class="${overdueClass}"><strong>${book.title}</strong> von ${book.author}<br>Rückgabe bis: ${formatDate(bb.dueDate)}<br>Offene Kosten: € ${(bb.fine || 0).toFixed(2)}</span>`;
      borrowedList.appendChild(li);
    });
  const borrowedIds = borrowedBookIds();
  books.filter(b => !borrowedIds.has(b.id)).forEach(b => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${b.title}</strong> von ${b.author} — € ${b.price.toFixed(2)}`;
    availableList.appendChild(li);
  });
}

function renderEmployee() {
  const borrowedList = document.getElementById('employee-borrowed');
  const overdueList = document.getElementById('employee-overdue');
  borrowedList.innerHTML = '';
  overdueList.innerHTML = '';
  borrowedBooks.forEach(bb => {
    const customer = customers.find(c => c.id == bb.customerId);
    const book = findBook(bb.bookId);
    const li = document.createElement('li');
    li.innerHTML = `<strong>${book.title}</strong> — Kunde: ${customer.name}<br>Rückgabe bis: ${formatDate(bb.dueDate)}`;
    borrowedList.appendChild(li);
    if (isOverdue(bb)) {
      const oLi = document.createElement('li');
      const fine = bb.fine || 0;
      oLi.innerHTML = `<strong>${book.title}</strong> — Kunde: ${customer.name}<br>Rückgabe war: ${formatDate(bb.dueDate)}<br>Mahngebühr: € ${fine.toFixed(2)}`;
      overdueList.appendChild(oLi);
    }
  });
}

function login() {
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('user-bar').classList.remove('hidden');
  document.getElementById('login-error').classList.add('hidden');
  document.getElementById('user-name').textContent = `${currentUser.name} (${currentRole === 'customer' ? 'Kunde' : 'Mitarbeiter'})`;
  if (currentRole === 'customer') {
    const sel = document.getElementById('customer-select');
    sel.value = currentUser.id;
    sel.disabled = true;
    renderCustomer(currentUser.id);
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
  document.getElementById('customer-select').disabled = false;
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

function show(id) {
  document.getElementById('customer-view').classList.toggle('hidden', id !== 'customer-view');
  document.getElementById('employee-view').classList.toggle('hidden', id !== 'employee-view');
}

function init() {
  renderCustomerSelect();
  document.getElementById('btn-login').addEventListener('click', doLogin);
  document.getElementById('btn-logout').addEventListener('click', logout);
}

loadData().catch(() => {
  document.body.innerHTML = '<p style="color:#b00000;padding:1rem">Fehler beim Laden der Daten. Bitte öffne die Seite über einen lokalen Server, z.B. <code>python3 -m http.server 8000</code>.</p>';
});
