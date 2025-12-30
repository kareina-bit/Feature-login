import { loginUser, registerUser, sendOtp, verifyOtp, resetPassword } from "./auth.service.js";

export function initAuth() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const forgotLink = document.getElementById("forgotLink");
  const resetForm = document.getElementById("resetForm");
  const resetBackLink = document.getElementById("resetBackLink");
  
  // Forgot Password - Show reset view
  if (forgotLink) {
    forgotLink.addEventListener("click", e => {
      e.preventDefault();
      showResetView();
    });
  }

  // Reset Password Back Link
  if (resetBackLink) {
    resetBackLink.addEventListener("click", e => {
      e.preventDefault();
      resetResetForm();
      showLogin();
    });
  }

  // Login Form
  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const messageEl = document.getElementById("loginMessage");
      clearMessage(messageEl);
      
      const phone = document.getElementById("loginPhone").value;
      const password = document.getElementById("loginPassword").value;
      // Custom validation (replace browser native messages)
      if (!phone || !phone.trim()) {
        showMessage(messageEl, "Vui lòng nhập số điện thoại", "error");
        document.getElementById("loginPhone").focus();
        return;
      }

      if (!password || !password.trim()) {
        showMessage(messageEl, "Vui lòng nhập mật khẩu", "error");
        document.getElementById("loginPassword").focus();
        return;
      }

      try {
        loginUser(phone, password);
        showMessage(messageEl, "Đăng nhập thành công", "success");
        setTimeout(() => window.location.href = "/dashboard", 1000);
      } catch (err) {
        showMessage(messageEl, err, "error");
      }
    });
  }

  // Register Form
  if (registerForm) {
    const sendOtpBtn = document.getElementById("sendOtpBtn");
    const regPhone = document.getElementById("regPhone");
    const regOtpInput = document.getElementById("regOtpInput");
    const fullName = document.getElementById("fullName");
    const regPassword = document.getElementById("regPassword");
    const registerBtn = document.getElementById("registerBtn");
    
    // OTP will be verified during form submission
    
    // Show send OTP button when phone is filled
    regPhone.addEventListener("input", () => {
      sendOtpBtn.style.display = regPhone.value.trim() ? "block" : "none";
    });
    
    // Send or resend OTP (single button)
    sendOtpBtn.addEventListener("click", () => {
      const messageEl = document.getElementById("regPhoneMessage");
      clearMessage(messageEl);
      const phone = regPhone.value.trim();
      
      if (!phone) {
        showMessage(messageEl, "Vui lòng nhập số điện thoại", "error");
        return;
      }
      
      try {
        sendOtp(phone);
        showMessage(messageEl, "Mã OTP đã được gửi", "success");
        regPhone.disabled = true;
        sendOtpBtn.style.display = "none";
        document.getElementById("otpSection").classList.remove("hidden");
      } catch (err) {
        showMessage(messageEl, err, "error");
      }
    });
    
    
    
    // Resend OTP
    resendOtpBtn.addEventListener("click", () => {
      const messageEl = document.getElementById("otpMessage");
      clearMessage(messageEl);
      const phone = regPhone.value.trim();
      
      try {
        sendOtp(phone);
        showMessage(messageEl, "Mã OTP mới đã được gửi", "success");
        regOtpInput.value = "";
      } catch (err) {
        showMessage(messageEl, err, "error");
      }
    });
    
    // Register form submit: verify OTP then register
    registerForm.addEventListener("submit", async e => {
      e.preventDefault();
      const messageEl = document.getElementById("registerMessage");
      clearMessage(messageEl);

      const phone = regPhone.value.trim();
      const name = fullName.value.trim();
      const password = regPassword.value.trim();
      const birthYearEl = document.getElementById("regBirthYear");
      const birthYear = birthYearEl ? birthYearEl.value.trim() : "";
      const otp = regOtpInput.value.trim();

      // Validate required fields
      if (!phone) {
        showMessage(messageEl, "Vui lòng nhập số điện thoại", "error");
        return;
      }

      try {
        sendOtp(phone);
        showMessage(messageEl, "Mã OTP đã được gửi", "success");
        regPhone.disabled = true;
        // OTP will be verified during form submission

        // Show send OTP button when phone is filled
        regPhone.addEventListener("input", () => {
          sendOtpBtn.style.display = regPhone.value.trim() ? "block" : "none";
          sendOtpBtn.textContent = "Gửi mã OTP";
        });

        // Send or resend OTP (single button)
        sendOtpBtn.addEventListener("click", () => {
          const messageEl = document.getElementById("regPhoneMessage");
          clearMessage(messageEl);
          const phone = regPhone.value.trim();

          if (!phone) {
            showMessage(messageEl, "Vui lòng nhập số điện thoại", "error");
            return;
          }

          try {
            sendOtp(phone);
            showMessage(messageEl, "Mã OTP đã được gửi", "success");
            regPhone.disabled = true;
            sendOtpBtn.textContent = "Gửi lại mã";
            document.getElementById("otpSection").classList.remove("hidden");
          } catch (err) {
            showMessage(messageEl, err, "error");
          }
        });

        // Register form submit: verify OTP then register
        registerForm.addEventListener("submit", e => {
          e.preventDefault();
          const messageEl = document.getElementById("registerMessage");
          clearMessage(messageEl);

          const phone = regPhone.value.trim();
          const name = fullName.value.trim();
          const password = regPassword.value.trim();
          const birthDayEl = document.getElementById("regBirthDay");
          const birthMonthEl = document.getElementById("regBirthMonth");
          const birthYearEl = document.getElementById("regBirthYear");
          const birthDay = birthDayEl ? birthDayEl.value.trim() : "";
          const birthMonth = birthMonthEl ? birthMonthEl.value.trim() : "";
          const birthYear = birthYearEl ? birthYearEl.value.trim() : "";
          const otp = regOtpInput.value.trim();

          // Validate required fields
          if (!phone) {
            showMessage(messageEl, "Vui lòng nhập số điện thoại", "error");
            return;
          }

          if (!otp) {
            showMessage(messageEl, "Vui lòng nhập mã OTP", "error");
            return;
          }

          if (!name) {
            showMessage(messageEl, "Vui lòng nhập họ và tên", "error");
            return;
          }

          if (!password) {
            showMessage(messageEl, "Vui lòng nhập mật khẩu", "error");
            return;
          }

          // Validate full birth date: day, month, year
          if (!birthDay || !birthMonth || !birthYear) {
            showMessage(messageEl, "Vui lòng nhập ngày/tháng/năm sinh đầy đủ", "error");
            return;
          }
          const d = parseInt(birthDay, 10);
          const m = parseInt(birthMonth, 10);
          const y = parseInt(birthYear, 10);
          if ([d, m, y].some(v => Number.isNaN(v))) {
            showMessage(messageEl, "Ngày/tháng/năm sinh không hợp lệ", "error");
            return;
          }
          const date = new Date(y, m - 1, d);
          if (date.getFullYear() !== y || date.getMonth() !== (m - 1) || date.getDate() !== d) {
            showMessage(messageEl, "Ngày/tháng/năm sinh không hợp lệ", "error");
            return;
          }
          if (y < 1900 || y > 2025) {
            showMessage(messageEl, "Năm sinh không hợp lệ", "error");
            return;
          }
          const birthDateIso = date.toISOString().slice(0, 10);

          // Verify OTP first
          try {
            verifyOtp(phone, otp);
          } catch (err) {
            showMessage(messageEl, `OTP không hợp lệ: ${err}`, "error");
            return;
          }

          try {
            registerUser({ phone, name, password, birthDate: birthDateIso });
            showMessage(messageEl, "Đăng ký thành công", "success");
            setTimeout(() => {
              registerForm.reset();
              regPhone.disabled = false;
              sendOtpBtn.textContent = "Gửi mã OTP";
              document.getElementById("otpSection").classList.add("hidden");
              showLogin();
            }, 1000);
          } catch (err) {
            showMessage(messageEl, err, "error");
          }
        });
        document.getElementById("resetOtpStep").classList.add("hidden");
        document.getElementById("resetPasswordStep").classList.remove("hidden");
        resetBtn.textContent = "Đặt lại mật khẩu";
        resetStep = 3;
      } catch (err) {
        showMessage(messageEl, err, "error");
      }
    });
    
    function handleResetStep3() {
      const messageEl = document.getElementById("resetPasswordMessage");
      clearMessage(messageEl);
      const newPassword = resetNewPassword.value.trim();
      
      if (!newPassword) {
        showMessage(messageEl, "Vui lòng nhập mật khẩu mới", "error");
        return;
      }
      
      try {
        resetPassword(resetPhoneValue, resetOtpValue, newPassword);
        showMessage(messageEl, "Đặt lại mật khẩu thành công", "success");
        
        setTimeout(() => {
          resetResetForm();
          showLogin();
        }, 1500);
      } catch (err) {
        showMessage(messageEl, err, "error");
      }
    }
  }
}

function showMessage(element, text, type) {
  element.textContent = text;
  element.className = `form-message ${type}`;
}

function clearMessage(element) {
  element.textContent = "";
  element.className = "form-message";
}

function showResetView() {
  document.getElementById("loginView").classList.add("hidden");
  document.getElementById("registerView").classList.add("hidden");
  document.getElementById("resetView").classList.remove("hidden");
  document.getElementById("headerDesc").innerText = "Đặt lại mật khẩu";
}

function resetResetForm() {
  const resetForm = document.getElementById("resetForm");
  const resetPhone = document.getElementById("resetPhone");
  const resetOtpInput = document.getElementById("resetOtpInput");
  const resetBtn = document.getElementById("resetBtn");
  
  // Reset form
  resetForm.reset();
  resetPhone.disabled = false;
  resetOtpInput.disabled = false;
  
  // Reset steps
  document.getElementById("resetPhoneStep").classList.remove("hidden");
  document.getElementById("resetOtpStep").classList.add("hidden");
  document.getElementById("resetPasswordStep").classList.add("hidden");
  
  // Clear messages
  clearMessage(document.getElementById("resetPhoneMessage"));
  clearMessage(document.getElementById("resetOtpMessage"));
  clearMessage(document.getElementById("resetPasswordMessage"));
  
  // Reset button
  resetBtn.textContent = "Gửi mã OTP";
}
initAuth();