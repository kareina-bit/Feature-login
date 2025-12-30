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
      registerUser({
        phone: phone.value.trim(),
        name: document.getElementById("fullName").value.trim(),
        password: document.getElementById("regPassword").value.trim()
      });

      showMessage(msg, "Đăng ký thành công", "success");
      setTimeout(showLogin, 1000);
    } catch (err) {
      showMessage(msg, err, "error");
    }
  });
}

/* ================= RESET PASSWORD ================= */

function initResetPassword() {
  const form = document.getElementById("resetForm");
  if (!form) return;

  const phone = document.getElementById("resetPhone");
  const otp = document.getElementById("resetOtpInput");
  const password = document.getElementById("resetNewPassword");
  const btn = document.getElementById("resetBtn");

  let step = 1;
  let phoneValue = "";
  let otpValue = "";

  form.addEventListener("submit", e => {
    e.preventDefault();
    form.classList.add("submitted");

    if (step === 1) {
      if (!phone.value.trim()) return error("resetPhoneMessage", "Nhập số điện thoại");
      try {
        sendOtp(phone.value.trim(), { requireUser: true });
        phoneValue = phone.value.trim();
        switchStep(2);
      } catch (err) {
        error("resetPhoneMessage", err);
      }
    }

    else if (step === 2) {
      if (!otp.value.trim()) return error("resetOtpMessage", "Nhập mã OTP");
      try {
        verifyOtp(phoneValue, otp.value.trim());
        otpValue = otp.value.trim();
        switchStep(3);
      } catch (err) {
        error("resetOtpMessage", err);
      }
    }

    else {
      if (!password.value.trim()) return error("resetPasswordMessage", "Nhập mật khẩu mới");
      try {
        resetPassword(phoneValue, otpValue, password.value.trim());
        showMessage(document.getElementById("resetPasswordMessage"), "Đặt lại mật khẩu thành công", "success");
        setTimeout(() => {
          if (typeof window.showLogin === "function") {
            window.showLogin();
          }
        }, 1500);
      } catch (err) {
        error("resetPasswordMessage", err);
      }
    }
  });

  function switchStep(n) {
    step = n;
    document.getElementById("resetPhoneStep").classList.toggle("hidden", n !== 1);
    document.getElementById("resetOtpStep").classList.toggle("hidden", n !== 2);
    document.getElementById("resetPasswordStep").classList.toggle("hidden", n !== 3);
    btn.textContent = n === 3 ? "Đặt lại mật khẩu" : "Tiếp tục";
    
    // Clear messages when switching steps
    if (n === 2) clearMessage(document.getElementById("resetPhoneMessage"));
    if (n === 3) clearMessage(document.getElementById("resetOtpMessage"));
  }
}

/* ================= RESET LINKS ================= */

function initResetLinks() {
  const forgotLink = document.getElementById("forgotLink");
  const resetBackLink = document.getElementById("resetBackLink");

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
}

function showResetView() {
  document.getElementById("loginView").classList.add("hidden");
  document.getElementById("registerView").classList.add("hidden");
  document.getElementById("resetView").classList.remove("hidden");
  document.getElementById("headerDesc").innerText = "Đặt lại mật khẩu";
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
