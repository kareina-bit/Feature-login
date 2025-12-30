# ⚡ Quick Reference - Quên Mật Khẩu

## 🚀 Start Testing (2 bước)

### 1. Backend
```bash
npm run dev
# → http://localhost:3000
```

### 2. Frontend
```bash
# VSCode: Right-click login.html → Open with Live Server
# hoặc:
cd Feature-login-main
python -m http.server 8000
# → http://localhost:8000/login.html
```

---

## ✅ Test Flow (30 giây)

```
1. Mở: http://localhost:5500/login.html
2. Click "Quên mật khẩu"
3. Nhập: 0912345678 → Click "Gửi mã OTP"
4. Check backend console → Copy OTP (vd: 123456)
5. Nhập OTP → Click "Xác nhận OTP"
6. Nhập password mới 2 lần → Click "Đặt lại mật khẩu"
7. ✅ Thành công! Auto redirect về login
```

---

## 🎯 3 Steps

```
STEP 1: Phone → Request OTP
   ↓
STEP 2: OTP → Verify
   ↓
STEP 3: New Password → Reset
   ↓
SUCCESS → Login
```

---

## 🔑 Features

✅ Modal 3-step UI  
✅ OTP verification  
✅ Password validation (min 6 chars)  
✅ Confirm password match  
✅ Auto password hashing  
✅ Rate limiting protection  
✅ Toast notifications  
✅ Auto redirect after success  
✅ Resend OTP option  
✅ Click outside to close  

---

## 📁 Files Changed

```
Feature-login-main/
├── assets/
│   ├── api-config.js        +25 lines (resetPassword API)
│   ├── auth-backend.js      +110 lines (UI + Logic)
│   └── style.css            +80 lines (Modal styles)
└── FORGOT_PASSWORD.md       Documentation
```

---

## 🐛 Quick Debug

**Backend không chạy?**
```bash
cd d:\Coding\Shipway
npm run dev
```

**Frontend không hiển thị?**
- Check Live Server đang chạy
- Mở F12 → Console để xem lỗi

**OTP không nhận được?**
- Development mode: Check backend console
- Production: Setup Twilio trong `.env`

---

## 📡 API

```bash
# Request OTP
POST /api/v1/auth/otp/request
Body: { phoneNumber, purpose: "reset_password" }

# Reset Password
POST /api/v1/auth/password/reset
Body: { phoneNumber, otpCode, newPassword }
```

---

**✅ READY TO TEST!**

