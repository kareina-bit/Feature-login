// ===============================
// Transaction History (Demo Only)
// ===============================

// In-memory transaction list (reset when reload)
let transactions = [];
let currentPage = 1;
const transactionsPerPage = 10;

// Load transaction history (always empty at first load)
export function loadTransactionHistory() {
  transactions = [];
  currentPage = 1;
  showEmptyState();
}

// Add new transaction (called after topup / payment)
export function addTransaction(transaction) {
  transactions.unshift({
    id: transaction.id || Date.now(),
    title: transaction.title,
    amount: transaction.amount,
    type: transaction.type, // 'credit' | 'debit'
    date: transaction.date || new Date(),
    status: transaction.status || 'completed'
  });

  displayTransactions(transactions.slice(0, transactionsPerPage));
}

// Display transactions
function displayTransactions(list) {
  const el = document.getElementById('transactionList');
  if (!el) return;

  if (list.length === 0) {
    showEmptyState();
    return;
  }

  el.innerHTML = list.map(tx => `
    <div class="transaction-item">
      <div class="transaction-info">
        <div class="transaction-title">${tx.title}</div>
        <div class="transaction-date">${formatDate(tx.date)}</div>
      </div>
      <div class="transaction-amount ${tx.type}">
        ${tx.type === 'credit' ? '+' : '-'}${formatCurrency(tx.amount)}
      </div>
    </div>
  `).join('');
}

// Empty state
function showEmptyState() {
  const el = document.getElementById('transactionList');
  if (!el) return;

  el.innerHTML = `
    <div class="empty-state">
      <p>Chưa có giao dịch nào</p>
      <p style="font-size:12px;margin-top:6px;">
        Nạp tiền hoặc thanh toán để xem lịch sử
      </p>
    </div>
  `;
}

// Load more (pagination demo)
export function loadMoreTransactions() {
  currentPage++;
  const start = (currentPage - 1) * transactionsPerPage;
  const end = start + transactionsPerPage;

  const more = transactions.slice(start, end);
  if (more.length === 0) return;

  const el = document.getElementById('transactionList');
  if (!el) return;

  el.innerHTML += more.map(tx => `
    <div class="transaction-item">
      <div class="transaction-info">
        <div class="transaction-title">${tx.title}</div>
        <div class="transaction-date">${formatDate(tx.date)}</div>
      </div>
      <div class="transaction-amount ${tx.type}">
        ${tx.type === 'credit' ? '+' : '-'}${formatCurrency(tx.amount)}
      </div>
    </div>
  `).join('');
}

// Format date (real time)
function formatDate(date) {
  const d = new Date(date);
  const now = new Date();

  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);

  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;

  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) + ' ' +
  d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
}

// Expose to window for other pages
window.transactionHistory = {
  loadTransactionHistory,
  addTransaction,
  loadMoreTransactions
};

window.loadMore = loadMoreTransactions;
