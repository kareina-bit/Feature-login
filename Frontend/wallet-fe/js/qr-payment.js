(function(window, document) {
  const MIN_AMOUNT = 10000;
  const MAX_AMOUNT = 10000000;
  const PROCESSING_CLASS = 'processing-message';
  const ERROR_CLASS = 'error-message';

  function init() {
    const amountInput = document.getElementById('topupAmount');
    if (!amountInput) {
      return;
    }

    amountInput.addEventListener('input', handleAmountInput);
    amountInput.addEventListener('change', handleAmountInput);

    handleAmountInput({ target: amountInput });
  }

  function handleAmountInput(event) {
    const input = event.target;
    const value = parseInt(input.value, 10);

    if (!validateAmount(value, input)) {
      clearCanvas();
      showError(`Số tiền hợp lệ từ ${formatCurrency(MIN_AMOUNT)} đến ${formatCurrency(MAX_AMOUNT)}.`);
      return;
    }

    clearError();
    generate(value);
  }

  function validateAmount(amount, inputEl) {
    const valid = Number.isFinite(amount) && amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;

    if (inputEl) {
      inputEl.setCustomValidity(
        valid
          ? ''
          : `Vui lòng nhập số tiền từ ${MIN_AMOUNT.toLocaleString()} ₫ đến ${MAX_AMOUNT.toLocaleString()} ₫`
      );
    }

    return valid;
  }

  function generate(amount) {
    const container = document.getElementById('qrCode');
    if (!container) {
      return;
    }

    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    const qrSize = 200;
    const moduleSize = 8;
    const modules = qrSize / moduleSize;

    canvas.width = qrSize;
    canvas.height = qrSize;

    const ctx = canvas.getContext('2d');

    for (let row = 0; row < modules; row += 1) {
      for (let col = 0; col < modules; col += 1) {
        const isFilled = Math.random() > 0.4;
        ctx.fillStyle = isFilled ? '#000' : '#fff';
        ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
      }
    }

    drawCornerSquare(ctx, 0, 0, moduleSize);
    drawCornerSquare(ctx, modules - 7, 0, moduleSize);
    drawCornerSquare(ctx, 0, modules - 7, moduleSize);

    ctx.fillStyle = '#fff';
    ctx.fillRect(qrSize / 2 - 45, qrSize / 2 - 18, 90, 36);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 12px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(formatCurrency(Math.abs(amount)), qrSize / 2, qrSize / 2 + 4);

    container.appendChild(canvas);
  }

  function drawCornerSquare(ctx, x, y, moduleSize) {
    ctx.fillStyle = '#000';
    ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize);

    ctx.fillStyle = '#fff';
    ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);

    ctx.fillStyle = '#000';
    ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
  }

  function showProcessingMessage() {
    const container = document.querySelector('.qr-container');
    if (!container) {
      return;
    }

    clearProcessingMessage();

    const wrapper = document.createElement('div');
    wrapper.className = PROCESSING_CLASS;
    wrapper.innerHTML = `
      <div class="qr-processing">
        <div class="loading-spinner"></div>
        <p>Đang chờ thanh toán...</p>
        <p class="qr-processing-note">Đây là bản mô phỏng. Giao dịch sẽ hoàn tất sau vài giây.</p>
      </div>
    `;

    container.appendChild(wrapper);
  }

  function clearProcessingMessage() {
    const existing = document.querySelector(`.${PROCESSING_CLASS}`);
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
  }

  function clearCanvas() {
    const container = document.getElementById('qrCode');
    if (container) {
      container.innerHTML = '';
    }
  }

  function showError(message) {
    const container = document.querySelector('.qr-container');
    if (!container) {
      return;
    }

    clearError();

    const errorDiv = document.createElement('div');
    errorDiv.className = ERROR_CLASS;
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
  }

  function clearError() {
    const existing = document.querySelector(`.${ERROR_CLASS}`);
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

})(window, document);
