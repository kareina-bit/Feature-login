import {
  loginUser,
  registerUser,
  sendOtp,
  verifyOtp,
  resetPassword
} from "./auth.service.js";
import { saveRole } from "./auth.state.js";

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

  form.addEventListener("submit", e => {
    e.preventDefault();
    form.classList.add("submitted");

    const msg = document.getElementById("loginMessage");
    clearMessage(msg);

    if (!form.checkValidity()) {
      showMessage(msg, "Vui lòng nhập đầy đủ thông tin", "error");
      form.querySelector(":invalid").focus();
      return;
    }

    try {
      loginUser(
        document.getElementById("loginPhone").value.trim(),
        document.getElementById("loginPassword").value.trim()
      );
      showMessage(msg, "Đăng nhập thành công", "success");
      setTimeout(() => location.href = "/dashboard", 1000);
    } catch (err) {
      showMessage(msg, err, "error");
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

  sendOtpBtn.addEventListener("click", () => {
    clearMessage(msg);

    if (!phone.value.trim()) {
      showMessage(msg, "Vui lòng nhập số điện thoại", "error");
      phone.focus();
      return;
    }

    try {
      sendOtp(phone.value.trim());
      otpSent = true;
      phone.disabled = true;
      otpSection.classList.remove("hidden");
      sendOtpBtn.textContent = "Gửi lại mã";
      showMessage(msg, "OTP đã được gửi", "success");
    } catch (err) {
      showMessage(msg, err, "error");
    }
  });

  form.addEventListener("submit", e => {
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

    try {
      verifyOtp(phone.value.trim(), otpInput.value.trim());
    } catch (err) {
      showMessage(msg, "OTP không hợp lệ", "error");
      return;
    }

    try {
      // Lấy role từ UI (mặc định "user" nếu không tìm thấy)
      const role = document.querySelector('input[name="role"]:checked')?.value || "user";

      registerUser({
        phone: phone.value.trim(),
        name: document.getElementById("fullName").value.trim(),
        password: document.getElementById("regPassword").value.trim(),
        role
      });

      // Lưu role tạm thời vào session để dùng sau (redirect, v.v.)
      try { saveRole(phone.value.trim(), role); } catch (e) {}

      showMessage(msg, "Đăng ký thành công", "success");
      setTimeout(showLogin, 1000);
    } catch (err) {
      showMessage(msg, err, "error");
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
    phoneForm.addEventListener("submit", e => {
      e.preventDefault();
      phoneForm.classList.add("submitted");
      clearMessage(phoneMsg);

      if (!phoneInput.value.trim()) {
        showMessage(phoneMsg, "Nhập số điện thoại", "error");
        phoneInput.focus();
        return;
      }

      try {
        sendOtp(phoneInput.value.trim(), { requireUser: true });
        phoneValue = phoneInput.value.trim();
        showMessage(phoneMsg, "Đã gửi mã OTP. Vui lòng kiểm tra tin nhắn.", "success");
        showResetOtpView();
      } catch (err) {
        showMessage(phoneMsg, err, "error");
      }
    });
  }

  if (otpForm) {
    otpForm.addEventListener("submit", e => {
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

      try {
        verifyOtp(phoneValue, otpInput.value.trim());
        resetPassword(phoneValue, otpInput.value.trim(), newPassword.value.trim());
        showMessage(otpMsg, "Đặt lại mật khẩu thành công", "success");
        setTimeout(() => {
          if (typeof window.showLogin === "function") {
            window.showLogin();
          }
        }, 1500);
      } catch (err) {
        showMessage(otpMsg, err, "error");
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
