// Shipway Authentication with Real Backend Integration
(function () {
  // Toast notification helper
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

  // Loading state helper
  function setLoading(button, loading) {
    if (loading) {
      button.disabled = true;
      button.dataset.originalText = button.textContent;
      button.textContent = 'Đang xử lý...';
    } else {
      button.disabled = false;
      button.textContent = button.dataset.originalText || button.textContent;
    }
  }

  // Format phone number helper
  function formatPhone(country, phone) {
    // Remove leading 0 if present
    const cleanPhone = phone.replace(/^0/, '');
    // If country is +84, just return the phone without leading 0
    if (country === '+84') {
      return '0' + cleanPhone;
    }
    return country + cleanPhone;
  }

  document.addEventListener("DOMContentLoaded", function () {
    
    // ============================================
    // REGISTER FLOW
    // ============================================
    const regForm = document.getElementById("registerForm");
    if (regForm) {
      const countrySelect = regForm.querySelector(".country-select") || { value: "+84" };
      const phoneInput = document.getElementById("regPhone");
      const nameInput = document.getElementById("fullName");
      const passInput = document.getElementById("regPassword");
      const otpSection = document.getElementById("otpSection");
      const regOtpInput = document.getElementById("regOtpInput");
      const verifyOtpBtn = document.getElementById("verifyOtpBtn");
      const resendOtpBtn = document.getElementById("resendOtpBtn");
      const registerBtn = document.getElementById("registerBtn");

      let pendingReg = null; // Store registration data

      // Step 1: Request OTP
      regForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        
        const phone = phoneInput.value.trim();
        const name = nameInput.value.trim();
        const password = passInput.value;
        const fullPhone = formatPhone(countrySelect.value, phone);

        if (!phone || !name || !password) {
          showToast("Vui lòng điền đầy đủ thông tin", "error");
          return;
        }

        if (password.length < 6) {
          showToast("Mật khẩu phải có ít nhất 6 ký tự", "error");
          return;
        }

        setLoading(registerBtn, true);

        try {
          // Request OTP from backend
          const response = await API.requestOTP(fullPhone, 'register');
          
          showToast(response.message || "Mã OTP đã được gửi đến số điện thoại của bạn", "success", 5000);
          
          // Store pending registration data
          pendingReg = {
            phoneNumber: fullPhone,
            fullName: name,
            password: password
          };

          // Show OTP section
          otpSection.style.display = "block";
          registerBtn.style.display = "none";
          
        } catch (error) {
          showToast(error.message || "Không thể gửi OTP. Vui lòng thử lại.", "error");
        } finally {
          setLoading(registerBtn, false);
        }
      });

      // Step 2: Verify OTP and Complete Registration
      verifyOtpBtn.addEventListener("click", async function () {
        if (!pendingReg) {
          showToast("Vui lòng nhập thông tin và yêu cầu OTP trước", "error");
          return;
        }

        const otpCode = regOtpInput.value.trim();
        if (!otpCode || otpCode.length !== 6) {
          showToast("Vui lòng nhập mã OTP 6 chữ số", "error");
          return;
        }

        setLoading(verifyOtpBtn, true);

        try {
          // Complete registration with backend
          const response = await API.register(
            pendingReg.phoneNumber,
            otpCode,
            pendingReg.password,
            pendingReg.fullName
          );

          showToast("Đăng ký thành công! Đang chuyển đến trang đăng nhập...", "success");
          
          // Store tokens
          if (response.data && response.data.tokens) {
            TokenManager.setTokens(
              response.data.tokens.accessToken,
              response.data.tokens.refreshToken
            );
            UserManager.setUser(response.data.user);
          }

          // Redirect to login or dashboard
          setTimeout(() => {
            window.location.href = "login.html";
          }, 1500);

        } catch (error) {
          showToast(error.message || "Mã OTP không hợp lệ hoặc đã hết hạn", "error");
        } finally {
          setLoading(verifyOtpBtn, false);
        }
      });

      // Resend OTP
      resendOtpBtn.addEventListener("click", async function () {
        if (!pendingReg) {
          showToast("Vui lòng nhập thông tin trước", "error");
          return;
        }

        setLoading(resendOtpBtn, true);

        try {
          await API.requestOTP(pendingReg.phoneNumber, 'register');
          showToast("Mã OTP mới đã được gửi", "success");
        } catch (error) {
          showToast(error.message || "Không thể gửi lại OTP", "error");
        } finally {
          setLoading(resendOtpBtn, false);
        }
      });
    }

    // ============================================
    // LOGIN FLOW
    // ============================================
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      const countrySelect = document.getElementById("loginCountry") || { value: "+84" };
      const phoneInput = document.getElementById("loginPhone");
      const passInput = document.getElementById("loginPassword");
      const loginBtn = loginForm.querySelector('button[type="submit"]');

      loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        
        const phone = phoneInput.value.trim();
        const password = passInput.value;
        const fullPhone = formatPhone(countrySelect.value, phone);

        if (!phone || !password) {
          showToast("Vui lòng nhập số điện thoại và mật khẩu", "error");
          return;
        }

        setLoading(loginBtn, true);

        try {
          // Login with backend
          const response = await API.login(fullPhone, password);
          
          showToast("Đăng nhập thành công!", "success");

          // Store tokens and user data
          if (response.data && response.data.tokens) {
            TokenManager.setTokens(
              response.data.tokens.accessToken,
              response.data.tokens.refreshToken
            );
            UserManager.setUser(response.data.user);
          }

          // Redirect to dashboard or home
          setTimeout(() => {
            window.location.href = "dashboard.html"; // Create this page later
          }, 1000);

        } catch (error) {
          showToast(error.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.", "error");
        } finally {
          setLoading(loginBtn, false);
        }
      });

      // ============================================
      // FORGOT PASSWORD FLOW
      // ============================================
      const forgotLink = document.getElementById("forgotLink");
      if (forgotLink) {
        forgotLink.addEventListener("click", function (e) {
          e.preventDefault();
          
          // Create modal for forgot password
          const modal = document.createElement("div");
          modal.className = "otp-modal";
          modal.innerHTML = `
            <div class="otp-modal-card">
              <button id="fpCloseBtn" class="modal-close-btn">&times;</button>
              <h3>Khôi phục mật khẩu</h3>
              
              <!-- STEP 1: Nhập số điện thoại -->
              <div id="fpStep1" class="fp-step">
                <p style="font-size: 14px; color: #666; margin-bottom: 16px;">
                  Nhập số điện thoại để nhận mã OTP
                </p>
                <div class="input-group">
                  <input id="fpPhone" type="tel" placeholder="Số điện thoại" required>
                </div>
                <button id="fpRequestOTP" class="btn-primary">Gửi mã OTP</button>
              </div>
              
              <!-- STEP 2: Nhập OTP -->
              <div id="fpStep2" class="fp-step" style="display:none;">
                <p style="font-size: 14px; color: #666; margin-bottom: 16px;">
                  Nhập mã OTP đã gửi tới số điện thoại của bạn
                </p>
                <div class="input-group">
                  <input id="fpOTP" type="text" placeholder="Mã OTP (6 chữ số)" maxlength="6" required>
                </div>
                <button id="fpVerifyOTP" class="btn-primary">Xác nhận OTP</button>
                <button id="fpResendOTP" class="btn-secondary">Gửi lại mã</button>
              </div>
              
              <!-- STEP 3: Nhập mật khẩu mới -->
              <div id="fpStep3" class="fp-step" style="display:none;">
                <p style="font-size: 14px; color: #666; margin-bottom: 16px;">
                  Nhập mật khẩu mới của bạn
                </p>
                <div class="input-group">
                  <input id="fpNewPassword" type="password" placeholder="Mật khẩu mới (ít nhất 6 ký tự)" required>
                </div>
                <div class="input-group">
                  <input id="fpConfirmPassword" type="password" placeholder="Xác nhận mật khẩu" required>
                </div>
                <button id="fpResetPassword" class="btn-primary">Đặt lại mật khẩu</button>
              </div>
            </div>
          `;
          document.body.appendChild(modal);

          // Variables for forgot password flow
          let fpPhoneNumber = '';
          let fpOtpCode = '';

          // Close modal
          const closeModal = () => modal.remove();
          modal.querySelector('#fpCloseBtn').addEventListener('click', closeModal);
          modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
          });

          // STEP 1: Request OTP
          document.getElementById('fpRequestOTP').addEventListener('click', async function() {
            const phone = document.getElementById('fpPhone').value.trim();
            
            if (!phone) {
              showToast("Vui lòng nhập số điện thoại", "error");
              return;
            }

            const fullPhone = formatPhone(countrySelect.value, phone);
            setLoading(this, true);

            try {
              await API.requestOTP(fullPhone, 'reset_password');
              fpPhoneNumber = fullPhone;
              
              showToast("Mã OTP đã được gửi đến số điện thoại của bạn", "success");
              
              // Show step 2
              document.getElementById('fpStep1').style.display = 'none';
              document.getElementById('fpStep2').style.display = 'block';
              
            } catch (error) {
              showToast(error.message || "Không thể gửi OTP", "error");
            } finally {
              setLoading(this, false);
            }
          });

          // STEP 2: Verify OTP
          document.getElementById('fpVerifyOTP').addEventListener('click', function() {
            const otp = document.getElementById('fpOTP').value.trim();
            
            if (!otp || otp.length !== 6) {
              showToast("Vui lòng nhập mã OTP 6 chữ số", "error");
              return;
            }

            fpOtpCode = otp;
            
            // Show step 3
            document.getElementById('fpStep2').style.display = 'none';
            document.getElementById('fpStep3').style.display = 'block';
            showToast("OTP hợp lệ! Vui lòng nhập mật khẩu mới", "success");
          });

          // Resend OTP
          document.getElementById('fpResendOTP').addEventListener('click', async function() {
            if (!fpPhoneNumber) {
              showToast("Vui lòng nhập số điện thoại trước", "error");
              return;
            }

            setLoading(this, true);

            try {
              await API.requestOTP(fpPhoneNumber, 'reset_password');
              showToast("Mã OTP mới đã được gửi", "success");
            } catch (error) {
              showToast(error.message || "Không thể gửi lại OTP", "error");
            } finally {
              setLoading(this, false);
            }
          });

          // STEP 3: Reset Password
          document.getElementById('fpResetPassword').addEventListener('click', async function() {
            const newPassword = document.getElementById('fpNewPassword').value;
            const confirmPassword = document.getElementById('fpConfirmPassword').value;
            
            if (!newPassword || !confirmPassword) {
              showToast("Vui lòng điền đầy đủ thông tin", "error");
              return;
            }

            if (newPassword.length < 6) {
              showToast("Mật khẩu phải có ít nhất 6 ký tự", "error");
              return;
            }

            if (newPassword !== confirmPassword) {
              showToast("Mật khẩu xác nhận không khớp", "error");
              return;
            }

            setLoading(this, true);

            try {
              await API.resetPassword(fpPhoneNumber, fpOtpCode, newPassword);
              
              showToast("Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...", "success");
              
              setTimeout(() => {
                closeModal();
                // Reload page or clear form
                window.location.reload();
              }, 1500);
              
            } catch (error) {
              showToast(error.message || "Không thể đặt lại mật khẩu", "error");
            } finally {
              setLoading(this, false);
            }
          });
        });
      }
    }

    // ============================================
    // CHECK AUTHENTICATION ON PAGE LOAD
    // ============================================
    // If user is already logged in and tries to access login/register pages
    if (TokenManager.isAuthenticated() && (window.location.pathname.includes('login') || window.location.pathname.includes('register'))) {
      const user = UserManager.getUser();
      if (user) {
        showToast(`Xin chào ${user.fullName || 'bạn'}! Bạn đã đăng nhập.`, "info");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      }
    }
  });
})();

