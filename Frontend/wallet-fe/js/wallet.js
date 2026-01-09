// Wallet functionality for displaying account balance

let currentBalance = 0;

// Initialize wallet
export function initWallet() {
  console.log('Initializing wallet...');
  loadWalletBalance();
  
  // Set up periodic balance refresh
  setInterval(loadWalletBalance, 30000); // Refresh every 30 seconds
}

// Load wallet balance from localStorage
async function loadWalletBalance() {
  try {
    // Get balance from localStorage, default to 0 if not set
    const storedBalance = localStorage.getItem('walletBalance') || '0';
    const balance = parseFloat(storedBalance);
    updateBalanceDisplay(balance);
  } catch (error) {
    console.error('Error loading wallet balance:', error);
    showError('Không thể tải số dư. Vui lòng thử lại.');
  }
}

// Get mock balance (for MVP demonstration)
function getMockBalance() {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // Generate random balance between 0 and 5,000,000 VND
      const randomBalance = Math.floor(Math.random() * 5000000);
      resolve(randomBalance);
    }, 500);
  });
}

// Update balance display
function updateBalanceDisplay(balance) {
  currentBalance = balance;
  
  // Update main balance display
  const balanceElement = document.getElementById('walletBalance');
  if (balanceElement) {
    const formattedBalance = formatCurrency(balance);
    balanceElement.textContent = formattedBalance;
    
    // Add animation effect
    balanceElement.style.transform = 'scale(1.1)';
    setTimeout(() => {
      balanceElement.style.transform = 'scale(1)';
    }, 200);
  }
  
  // Update payment method balance display
  const balanceDisplayElement = document.getElementById('walletBalanceDisplay');
  if (balanceDisplayElement) {
    const formattedBalance = formatCurrency(balance);
    balanceDisplayElement.textContent = formattedBalance;
  }
  
  // Save to localStorage
  localStorage.setItem('walletBalance', balance.toString());
}

// Format currency to Vietnamese Dong
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Show error message
function showError(message) {
  const balanceElement = document.getElementById('walletBalance');
  if (balanceElement) {
    balanceElement.textContent = 'Lỗi';
    balanceElement.style.color = '#f44336';
    
    // Show tooltip or alert for debugging
    console.error(message);
    
    // Reset after 3 seconds
    setTimeout(() => {
      loadWalletBalance();
    }, 3000);
  }
}

// Get current balance (can be used by other modules)
export function getCurrentBalance() {
  return currentBalance;
}

// Refresh balance manually
export function refreshBalance() {
  loadWalletBalance();
}

// Add balance after successful top-up
export function addBalance(amount) {
  currentBalance += amount;
  updateBalanceDisplay(currentBalance);
  
  // Show success notification
  showSuccessNotification(`Nạp tiền thành công: ${formatCurrency(amount)}`);
}

// Deduct balance after successful payment
export function deductBalance(amount) {
  if (currentBalance >= amount) {
    currentBalance -= amount;
    updateBalanceDisplay(currentBalance);
    return true;
  }
  return false;
}

// Show success notification
function showSuccessNotification(message) {
  // Create a simple notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 1001;
    font-weight: 600;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Export for global access
window.walletUtils = {
  getCurrentBalance,
  refreshBalance,
  addBalance,
  deductBalance,
  formatCurrency
};
