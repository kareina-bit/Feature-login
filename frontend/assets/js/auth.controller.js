import {
  loginUser,
  registerUser,
  sendOtp,
  verifyOtp,
  resetPassword
} from "./auth.service.js";

export function initAuth() {
  initLogin();
  initRegister();
  initResetPassword();
  initResetLinks();
}

/* ================= LOGIN ================= */

function initLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    form.classList.add("submitted");

    const msg = document.getElementById("loginMessage");
    clearMessage(msg);

    if (!form.checkValidity()) {
      showMessage(msg, "Vui lòng nhập đầy đủ thông tin", "error");
      form.querySelector(":invalid").focus();
      return;
    }

    const phone = document.getElementById("loginPhone").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Đang xử lý...";
    submitBtn.disabled = true;

    try {
      const response = await loginUser(phone, password);
      showMessage(msg, response.message || "Đăng nhập thành công", "success");
      
      // Redirect based on role
      setTimeout(() => {
        const user = response.user;
        if (user.role === 'admin') {
          window.location.href = "/admin/dashboard.html";
        } else if (user.role === 'driver') {
          window.location.href = "/driver/dashboard.html";
        } else {
          window.location.href = "/user/dashboard.html";
        }
      }, 1000);
    } catch (err) {
      showMessage(msg, err, "error");
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

/* ================= REGISTER ================= */

function initRegister() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const phone = document.getElementById("regPhone");
  const otpInput = document.getElementById("regOtpInput");
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const otpSection = document.getElementById("otpSection");
  const msg = document.getElementById("registerMessage");

  let otpSent = false;

  sendOtpBtn.addEventListener("click", async () => {
    clearMessage(msg);

    if (!phone.value.trim()) {
      showMessage(msg, "Vui lòng nhập số điện thoại", "error");
      phone.focus();
      return;
    }

    // Show loading
    const originalText = sendOtpBtn.textContent;
    sendOtpBtn.textContent = "Đang gửi...";
    sendOtpBtn.disabled = true;

    try {
      await sendOtp(phone.value.trim(), { purpose: 'register' });
      otpSent = true;
      phone.disabled = true;
      otpSection.classList.remove("hidden");
      sendOtpBtn.textContent = "Gửi lại mã";
      sendOtpBtn.disabled = false;
      showMessage(msg, "OTP đã được gửi", "success");
    } catch (err) {
      showMessage(msg, err, "error");
      sendOtpBtn.textContent = originalText;
      sendOtpBtn.disabled = false;
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    form.classList.add("submitted");
    clearMessage(msg);

    if (!otpSent) {
      showMessage(msg, "Vui lòng gửi OTP trước", "error");
      return;
    }

    if (!form.checkValidity()) {
      showMessage(msg, "Vui lòng điền đầy đủ thông tin", "error");
      form.querySelector(":invalid").focus();
      return;
    }

    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Đang xử lý...";
    submitBtn.disabled = true;

    try {
      // Get role from UI
      const role = document.querySelector('input[name="role"]:checked')?.value || "user";

      const response = await registerUser({
        phone: phone.value.trim(),
        name: document.getElementById("fullName").value.trim(),
        password: document.getElementById("regPassword").value.trim(),
        otp: otpInput.value.trim(),
        role
      });

      showMessage(msg, response.message || "Đăng ký thành công", "success");
      setTimeout(() => {
        if (typeof window.showLogin === "function") {
          window.showLogin();
        }
      }, 1500);
    } catch (err) {
      showMessage(msg, err, "error");
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

/* ================= RESET PASSWORD (TWO VIEWS) ================= */

function initResetPassword() {
  const phoneForm = document.getElementById("resetForm");
  const otpForm = document.getElementById("resetOtpForm");
  if (!phoneForm && !otpForm) return;

  const phoneInput = document.getElementById("resetPhone");
  const phoneMsg = document.getElementById("resetPhoneMessage");
  const otpInput = document.getElementById("resetOtpInput");
  const newPassword = document.getElementById("resetNewPassword");
  const confirmPassword = document.getElementById("resetConfirmPassword");
  const otpMsg = document.getElementById("resetOtpMessage");

  let phoneValue = "";

  if (phoneForm) {
    phoneForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      phoneForm.classList.add("submitted");
      clearMessage(phoneMsg);

      if (!phoneInput.value.trim()) {
        showMessage(phoneMsg, "Nhập số điện thoại", "error");
        phoneInput.focus();
        return;
      }

      // Show loading
      const submitBtn = phoneForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Đang gửi...";
      submitBtn.disabled = true;

      try {
        await sendOtp(phoneInput.value.trim(), { requireUser: true });
        phoneValue = phoneInput.value.trim();
        showMessage(phoneMsg, "Đã gửi mã OTP. Vui lòng kiểm tra tin nhắn.", "success");
        setTimeout(() => {
          showResetOtpView();
        }, 1000);
      } catch (err) {
        showMessage(phoneMsg, err, "error");
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  if (otpForm) {
    otpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      otpForm.classList.add("submitted");
      clearMessage(otpMsg);

      if (!phoneValue) {
        showMessage(otpMsg, "Vui lòng nhập số điện thoại trước", "error");
        showResetView();
        return;
      }

      if (!otpInput.value.trim() || !newPassword.value.trim() || !confirmPassword.value.trim()) {
        showMessage(otpMsg, "Vui lòng nhập đầy đủ thông tin", "error");
        return;
      }

      if (newPassword.value.trim() !== confirmPassword.value.trim()) {
        showMessage(otpMsg, "Mật khẩu xác nhận không khớp", "error");
        return;
      }

      // Show loading
      const submitBtn = otpForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Đang xử lý...";
      submitBtn.disabled = true;

      try {
        const response = await resetPassword(phoneValue, otpInput.value.trim(), newPassword.value.trim());
        showMessage(otpMsg, response.message || "Đặt lại mật khẩu thành công", "success");
        setTimeout(() => {
          if (typeof window.showLogin === "function") {
            window.showLogin();
          }
        }, 1500);
      } catch (err) {
        showMessage(otpMsg, err, "error");
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

/* ================= RESET LINKS ================= */

function initResetLinks() {
  const forgotLink = document.getElementById("forgotLink");
  const resetBackLink = document.getElementById("resetBackLink");
  const resetOtpBackLink = document.getElementById("resetOtpBackLink");

  if (forgotLink) {
    forgotLink.addEventListener("click", e => {
      e.preventDefault();
      showResetView();
    });
  }

  if (resetBackLink) {
    resetBackLink.addEventListener("click", e => {
      e.preventDefault();
      if (typeof window.showLogin === "function") {
        window.showLogin();
      }
    });
  }

  if (resetOtpBackLink) {
    resetOtpBackLink.addEventListener("click", e => {
      e.preventDefault();
      showResetView();
    });
  }
}

function showResetView() {
  document.getElementById("loginView").classList.add("hidden");
  document.getElementById("registerView").classList.add("hidden");
  document.getElementById("resetView").classList.remove("hidden");
  document.getElementById("resetOtpView").classList.add("hidden");
  document.getElementById("headerDesc").innerText = "Đặt lại mật khẩu";

  const phoneInput = document.getElementById("resetPhone");
  const phoneMsg = document.getElementById("resetPhoneMessage");
  const otpInput = document.getElementById("resetOtpInput");
  const newPassword = document.getElementById("resetNewPassword");
  const confirmPassword = document.getElementById("resetConfirmPassword");
  const otpMsg = document.getElementById("resetOtpMessage");

  if (phoneInput) phoneInput.value = "";
  if (otpInput) otpInput.value = "";
  if (newPassword) newPassword.value = "";
  if (confirmPassword) confirmPassword.value = "";
  if (phoneMsg) clearMessage(phoneMsg);
  if (otpMsg) clearMessage(otpMsg);
}

function showResetOtpView() {
  document.getElementById("resetView").classList.add("hidden");
  document.getElementById("resetOtpView").classList.remove("hidden");
  document.getElementById("headerDesc").innerText = "Nhập OTP và đặt mật khẩu mới";
}

/* ================= HELPERS ================= */

function showMessage(el, text, type) {
  el.textContent = text;
  el.className = `form-message ${type}`;
}

function clearMessage(el) {
  el.textContent = "";
  el.className = "form-message";
}

function error(id, text) {
  showMessage(document.getElementById(id), text, "error");
}
initAuth();

