// Transaction history functionality

let transactions = [];
let currentPage = 1;
const transactionsPerPage = 10;

// Load transaction history
export async function loadTransactionHistory() {
  try {
    console.log('Loading transaction history...');
    
    // For MVP, use mock data
    const mockTransactions = await getMockTransactions();
    transactions = mockTransactions;
    
    displayTransactions(transactions.slice(0, transactionsPerPage));
  } catch (error) {
    console.error('Error loading transaction history:', error);
    showEmptyState();
  }
}

// Get mock transactions (for MVP demonstration)
function getMockTransactions() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = [
        {
          id: 1,
          title: 'Nạp tiền qua QR',
          amount: 500000,
          type: 'credit',
          date: new Date('2024-01-15T10:30:00'),
          status: 'completed'
        },
        {
          id: 2,
          title: 'Thanh toán đơn hàng #12345',
          amount: 25000,
          type: 'debit',
          date: new Date('2024-01-14T15:45:00'),
          status: 'completed'
        },
        {
          id: 3,
          title: 'Nạp tiền qua QR',
          amount: 200000,
          type: 'credit',
          date: new Date('2024-01-13T09:15:00'),
          status: 'completed'
        },
        {
          id: 4,
          title: 'Hoàn tiền đơn hàng #12340',
          amount: 15000,
          type: 'credit',
          date: new Date('2024-01-12T14:20:00'),
          status: 'completed'
        },
        {
          id: 5,
          title: 'Thanh toán đơn hàng #12338',
          amount: 45000,
          type: 'debit',
          date: new Date('2024-01-11T11:30:00'),
          status: 'completed'
        },
        {
          id: 6,
          title: 'Nạp tiền qua QR',
          amount: 1000000,
          type: 'credit',
          date: new Date('2024-01-10T16:00:00'),
          status: 'completed'
        },
        {
          id: 7,
          title: 'Thanh toán đơn hàng #12335',
          amount: 35000,
          type: 'debit',
          date: new Date('2024-01-09T13:45:00'),
          status: 'completed'
        },
        {
          id: 8,
          title: 'Nạp tiền qua QR',
          amount: 300000,
          type: 'credit',
          date: new Date('2024-01-08T10:15:00'),
          status: 'completed'
        }
      ];
      
      resolve(mockData);
    }, 300);
  });
}

// Display transactions in the list
function displayTransactions(transactionList) {
  const transactionListElement = document.getElementById('transactionList');
  
  if (!transactionListElement) return;
  
  if (transactionList.length === 0) {
    showEmptyState();
    return;
  }
  
  transactionListElement.innerHTML = transactionList.map(transaction => `
    <div class="transaction-item">
      <div class="transaction-info">
        <div class="transaction-title">${transaction.title}</div>
        <div class="transaction-date">${formatDate(transaction.date)}</div>
      </div>
      <div class="transaction-amount ${transaction.type}">
        ${transaction.type === 'credit' ? '+' : '-'}${formatCurrency(transaction.amount)}
      </div>
    </div>
  `).join('');
}

// Show empty state when no transactions
function showEmptyState() {
  const transactionListElement = document.getElementById('transactionList');
  
  if (transactionListElement) {
    transactionListElement.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
        <p>Chưa có giao dịch nào</p>
        <p style="font-size: 12px; margin-top: 8px;">Nạp tiền để bắt đầu sử dụng dịch vụ</p>
      </div>
    `;
  }
}

// Format date for display
function formatDate(date) {
  const now = new Date();
  const transactionDate = new Date(date);
  const diffTime = Math.abs(now - transactionDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Today - show time
    return `Hôm nay, ${transactionDate.getHours().toString().padStart(2, '0')}:${transactionDate.getMinutes().toString().padStart(2, '0')}`;
  } else if (diffDays === 1) {
    // Yesterday
    return 'Hôm qua';
  } else if (diffDays < 7) {
    // This week
    return `${diffDays} ngày trước`;
  } else {
    // Show full date
    return transactionDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Load more transactions (pagination)
export function loadMoreTransactions() {
  currentPage++;
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  
  const moreTransactions = transactions.slice(startIndex, endIndex);
  
  if (moreTransactions.length === 0) {
    // No more transactions
    const loadMoreBtn = document.querySelector('.btn-outline');
    if (loadMoreBtn) {
      loadMoreBtn.textContent = 'Đã hết giao dịch';
      loadMoreBtn.disabled = true;
    }
    return;
  }
  
  // Append more transactions to the list
  const transactionListElement = document.getElementById('transactionList');
  if (transactionListElement) {
    const moreTransactionsHtml = moreTransactions.map(transaction => `
      <div class="transaction-item">
        <div class="transaction-info">
          <div class="transaction-title">${transaction.title}</div>
          <div class="transaction-date">${formatDate(transaction.date)}</div>
        </div>
        <div class="transaction-amount ${transaction.type}">
          ${transaction.type === 'credit' ? '+' : '-'}${formatCurrency(transaction.amount)}
        </div>
      </div>
    `).join('');
    
    transactionListElement.innerHTML += moreTransactionsHtml;
  }
}

// Add new transaction to the list (for real-time updates)
export function addTransaction(transaction) {
  transactions.unshift(transaction);
  
  // Refresh the display
  const transactionListElement = document.getElementById('transactionList');
  if (transactionListElement && !transactionListElement.querySelector('.empty-state')) {
    displayTransactions(transactions.slice(0, transactionsPerPage));
  }
}

// Export for global access
window.loadMore = loadMoreTransactions;
window.transactionHistory = {
  loadTransactionHistory,
  addTransaction,
  loadMoreTransactions
};
