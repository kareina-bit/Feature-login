// QR Code payment functionality

// Simple QR code generator for MVP (using a basic approach)
// In production, you would use a proper QR code library

export function initQrPayment() {
  console.log('Initializing QR payment...');
  
  // Set up amount input validation
  const amountInput = document.getElementById('topupAmount');
  if (amountInput) {
    amountInput.addEventListener('input', validateAmount);
    amountInput.addEventListener('change', generateQrCode);
  }
}

// Validate amount input
function validateAmount(event) {
  const input = event.target;
  const value = parseInt(input.value);
  
  if (value < 10000) {
    input.setCustomValidity('Số tiền tối thiểu là 10,000 ₫');
  } else if (value > 10000000) {
    input.setCustomValidity('Số tiền tối đa là 10,000,000 ₫');
  } else {
    input.setCustomValidity('');
  }
}

// Generate QR code (simplified for MVP)
export function generateQR(amount) {
  const qrCodeElement = document.getElementById('qrCode');
  
  if (!qrCodeElement) return;
  
  // Validate amount
  const amountNum = parseInt(amount);
  if (isNaN(amountNum) || amountNum < 10000 || amountNum > 10000000) {
    showError('Số tiền không hợp lệ. Vui lòng nhập số tiền từ 10,000 ₫ đến 10,000,000 ₫');
    return;
  }
  
  // For MVP, create a simple visual representation
  // In production, this would generate a real QR code with payment information
  createMockQRCode(qrCodeElement, amountNum);
  
  // Simulate payment processing
  simulatePaymentProcessing(amountNum);
}

// Create mock QR code visual
function createMockQRCode(container, amount) {
  // Clear existing content
  container.innerHTML = '';
  
  // Create a simple QR-like pattern
  const qrSize = 200;
  const moduleSize = 8;
  const modules = qrSize / moduleSize;
  
  const canvas = document.createElement('canvas');
  canvas.width = qrSize;
  canvas.height = qrSize;
  const ctx = canvas.getContext('2d');
  
  // Generate random pattern (this is just for visual demonstration)
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      // Create some pattern that looks like QR code
      const isFilled = Math.random() > 0.4;
      
      if (isFilled) {
        ctx.fillStyle = '#000';
        ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
      }
    }
  }
  
  // Add some distinctive patterns to make it look more like a QR code
  // Corner squares
  drawCornerSquare(ctx, 0, 0, moduleSize);
  drawCornerSquare(ctx, modules - 7, 0, moduleSize);
  drawCornerSquare(ctx, 0, modules - 7, moduleSize);
  
  // Add amount text in the center
  ctx.fillStyle = '#fff';
  ctx.fillRect(modules * moduleSize / 2 - 40, modules * moduleSize / 2 - 15, 80, 30);
  ctx.fillStyle = '#000';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(formatCurrency(amount), modules * moduleSize / 2, modules * moduleSize / 2 + 5);
  
  container.appendChild(canvas);
}

// Draw corner square pattern (like real QR codes)
function drawCornerSquare(ctx, x, y, moduleSize) {
  // Outer square
  ctx.fillStyle = '#000';
  ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize);
  
  // White square
  ctx.fillStyle = '#fff';
  ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
  
  // Inner square
  ctx.fillStyle = '#000';
  ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
}

// Simulate payment processing
function simulatePaymentProcessing(amount) {
  console.log(`Simulating payment processing for ${formatCurrency(amount)}`);
  
  // Show processing message
  const qrContainer = document.querySelector('.qr-container');
  if (qrContainer) {
    const existingMessage = qrContainer.querySelector('.processing-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    const message = document.createElement('div');
    message.className = 'processing-message';
    message.innerHTML = `
      <div style="text-align: center; margin-top: 16px; color: #666; font-size: 14px;">
        <div class="loading"></div>
        <p>Đang chờ thanh toán...</p>
        <p style="font-size: 12px; margin-top: 8px;">Đây là bản demo. Thanh toán sẽ được mô phỏng sau 5 giây.</p>
      </div>
    `;
    qrContainer.appendChild(message);
  }
  
  // Simulate successful payment after 5 seconds
  setTimeout(() => {
    completePayment(amount);
  }, 5000);
}

// Complete payment simulation
function completePayment(amount) {
  console.log(`Payment completed: ${formatCurrency(amount)}`);
  
  // Remove processing message
  const processingMessage = document.querySelector('.processing-message');
  if (processingMessage) {
    processingMessage.remove();
  }
  
  // Add transaction to history
  const transaction = {
    id: Date.now(),
    title: 'Nạp tiền qua QR',
    amount: amount,
    type: 'credit',
    date: new Date(),
    status: 'completed'
  };
  
  // Add to transaction history
  if (window.transactionHistory && window.transactionHistory.addTransaction) {
    window.transactionHistory.addTransaction(transaction);
  }
  
  // Update wallet balance
  if (window.walletUtils && window.walletUtils.addBalance) {
    window.walletUtils.addBalance(amount);
  }
  
  // Close modal and show success
  setTimeout(() => {
    closeQrPaymentModal();
    showSuccessMessage(`Nạp tiền thành công: ${formatCurrency(amount)}`);
  }, 1000);
}

// Close QR payment modal
function closeQrPaymentModal() {
  const modal = document.getElementById('qrPaymentModal');
  if (modal) {
    modal.classList.add('hidden');
  }
  
  // Reset amount input
  const amountInput = document.getElementById('topupAmount');
  if (amountInput) {
    amountInput.value = '50000';
  }
}

// Show success message
function showSuccessMessage(message) {
  // Create success notification
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
    z-index: 1002;
    font-weight: 600;
    max-width: 300px;
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

// Show error message
function showError(message) {
  const qrContainer = document.querySelector('.qr-container');
  if (qrContainer) {
    const existingError = qrContainer.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <div style="color: #f44336; font-size: 14px; text-align: center; margin-top: 16px;">
        ${message}
      </div>
    `;
    qrContainer.appendChild(errorDiv);
    
    // Remove error after 3 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 3000);
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

// Export for global access
window.generateQR = generateQR;
window.qrPayment = {
  initQrPayment,
  generateQR
};
