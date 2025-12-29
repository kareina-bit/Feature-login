// Simple front-end auth + OTP simulation using localStorage/sessionStorage
(function () {
  function showToast(message, type = "info", timeout = 3000) {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("visible");
    }, 10);
    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => toast.remove(), 300);
    }, timeout);
  }

  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  function sendOtpForPhone(fullPhone) {
    const otp = generateOTP();
    const record = { code: otp, ts: Date.now() };
    sessionStorage.setItem("otp_" + fullPhone, JSON.stringify(record));
    console.log("[auth] OTP for", fullPhone, otp);
    // For demo purposes we show the OTP in a toast (remove in production)
    showToast(`Mã OTP đã gửi: ${otp}`, "info", 6000);
    return otp;
  }

  function verifyOtp(fullPhone, code, expireMs = 5 * 60 * 1000) {
    const raw = sessionStorage.getItem("otp_" + fullPhone);
    if (!raw) return false;
    try {
      const record = JSON.parse(raw);
      if (Date.now() - record.ts > expireMs) return false;
      return record.code === String(code).trim();
    } catch (e) {
      return false;
    }
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem("shipway_users") || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem("shipway_users", JSON.stringify(users));
  }

  function findUserByPhone(fullPhone) {
    return getUsers().find((u) => u.phone === fullPhone);
  }

  function formatPhone(country, phone) {
    return (country || "") + (phone || "");
  }

  document.addEventListener("DOMContentLoaded", function () {
    // --- Register flow ---
    const regForm = document.getElementById("registerForm");
    if (regForm) {
      const country = regForm.querySelector(".country-select") || { value: "+84" };
      const phoneInput = document.getElementById("regPhone");
      const nameInput = document.getElementById("fullName");
      const passInput = document.getElementById("regPassword");
      const otpSection = document.getElementById("otpSection");
      const regOtpInput = document.getElementById("regOtpInput");
      const verifyOtpBtn = document.getElementById("verifyOtpBtn");
      const resendOtpBtn = document.getElementById("resendOtpBtn");

      let pendingReg = null; // {phone, country, name, password}

      regForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const phone = phoneInput.value.trim();
        const fullPhone = formatPhone(country.value, phone);
        const name = nameInput.value.trim();
        const password = passInput.value;

        if (!phone || !name || !password) {
          showToast("Vui lòng điền đầy đủ thông tin", "error");
          return;
        }

        if (findUserByPhone(fullPhone)) {
          showToast("Tài khoản đã tồn tại với số điện thoại này", "error");
          return;
        }

        // start OTP flow
        pendingReg = { phone: phone, country: country.value, name, password };
        sendOtpForPhone(fullPhone);
        otpSection.style.display = "block";
        showToast("Đã gửi mã OTP. Vui lòng kiểm tra tin nhắn.", "info");
      });

      verifyOtpBtn.addEventListener("click", function () {
        if (!pendingReg) return showToast("Không có yêu cầu OTP đang chờ", "error");
        const fullPhone = formatPhone(pendingReg.country, pendingReg.phone);
        const code = regOtpInput.value.trim();
        if (!code) return showToast("Vui lòng nhập mã OTP", "error");
        if (verifyOtp(fullPhone, code)) {
          const users = getUsers();
          users.push({ phone: fullPhone, name: pendingReg.name, password: pendingReg.password });
          saveUsers(users);
          sessionStorage.removeItem("otp_" + fullPhone);
          showToast("Đăng ký thành công — chuyển về đăng nhập", "success");
          setTimeout(() => {
            window.location.href = "login.html";
          }, 1500);
        } else {
          showToast("Mã OTP không hợp lệ hoặc đã hết hạn", "error");
        }
      });

      resendOtpBtn.addEventListener("click", function () {
        if (!pendingReg) return showToast("Không có yêu cầu gửi lại", "error");
        const fullPhone = formatPhone(pendingReg.country, pendingReg.phone);
        sendOtpForPhone(fullPhone);
        showToast("Gửi lại mã OTP", "info");
      });
    }

    // --- Login flow ---
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      const country = document.getElementById("loginCountry") || { value: "+84" };
      const phoneInput = document.getElementById("loginPhone");
      const passInput = document.getElementById("loginPassword");

      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const phone = phoneInput.value.trim();
        const fullPhone = formatPhone(country.value, phone);
        const password = passInput.value;
        if (!phone || !password) return showToast("Vui lòng nhập số điện thoại và mật khẩu", "error");
        const user = findUserByPhone(fullPhone);
        if (!user) {
          showToast("Tài khoản không tồn tại", "error");
          return;
        }
        if (user.password !== password) {
          showToast("Sai mật khẩu", "error");
          return;
        }
        showToast("Đăng nhập thành công", "success");
        // proceed: in real app redirect or set session; here we just show success
      });

      // Forgot password flow
      const forgotLink = document.getElementById("forgotLink");
      if (forgotLink) {
        forgotLink.addEventListener("click", function (e) {
          e.preventDefault();
          // show a simple prompt flow using dynamic elements
          const modal = document.createElement("div");
          modal.className = "otp-modal";
          modal.innerHTML = `
            <div class="otp-modal-card">
              <h3>Khôi phục mật khẩu</h3>
              <p>Nhập số điện thoại để nhận mã OTP</p>
              <input id="fpPhone" placeholder="Số điện thoại" />
              <div style="margin-top:10px; display:flex; gap:8px;">
                <button id="fpSend" class="btn-primary">Gửi mã</button>
                <button id="fpClose" class="btn-primary" style="background:#fff;color:#0068ff;border:1px solid #d0e9ff">Đóng</button>
              </div>
              <div id="fpStep2" style="display:none; margin-top:12px;">
                <input id="fpOtp" placeholder="Mã OTP" />
                <input id="fpNewPass" type="password" placeholder="Mật khẩu mới" style="margin-top:8px;" />
                <div style="margin-top:8px; display:flex; gap:8px;">
                  <button id="fpVerify" class="btn-primary">Xác nhận</button>
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(modal);

          const fpClose = modal.querySelector('#fpClose');
          const fpSend = modal.querySelector('#fpSend');
          const fpPhone = modal.querySelector('#fpPhone');
          const fpStep2 = modal.querySelector('#fpStep2');
          const fpOtp = modal.querySelector('#fpOtp');
          const fpNewPass = modal.querySelector('#fpNewPass');
          const fpVerify = modal.querySelector('#fpVerify');

          fpClose.addEventListener('click', () => modal.remove());

          fpSend.addEventListener('click', () => {
            const phone = fpPhone.value.trim();
            if (!phone) return showToast('Vui lòng nhập số điện thoại', 'error');
            const fullPhone = formatPhone(country.value, phone);
            const user = findUserByPhone(fullPhone);
            if (!user) return showToast('Tài khoản không tồn tại', 'error');
            sendOtpForPhone(fullPhone);
            showToast('Đã gửi mã OTP', 'info');
            fpStep2.style.display = 'block';
          });

          fpVerify.addEventListener('click', () => {
            const phone = fpPhone.value.trim();
            const fullPhone = formatPhone(country.value, phone);
            const code = fpOtp.value.trim();
            const newPass = fpNewPass.value;
            if (!verifyOtp(fullPhone, code)) return showToast('Mã OTP không hợp lệ', 'error');
            if (!newPass) return showToast('Nhập mật khẩu mới', 'error');
            const users = getUsers().map(u => u.phone === fullPhone ? Object.assign({}, u, { password: newPass }) : u);
            saveUsers(users);
            sessionStorage.removeItem('otp_' + fullPhone);
            showToast('Mật khẩu đã được cập nhật', 'success');
            setTimeout(() => modal.remove(), 800);
          });
        });
      }
    }

    // insert toast container styles if not present (no-op if CSS has them)
  });
})();
