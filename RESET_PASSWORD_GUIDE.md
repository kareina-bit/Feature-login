# 🔑 TÍNH NĂNG QUÊN MẬT KHẨU - HOÀN THIỆN

## ✅ ĐÃ HOÀN THÀNH

### Backend:
- ✅ Controller: `resetPassword()` trong `auth.controller.ts`
- ✅ Route: `POST /api/v1/auth/password/reset`
- ✅ Validation: phoneNumber, otpCode, newPassword
- ✅ OTP verification với purpose: `reset_password`

### Frontend:
- ✅ API endpoint: `RESET_PASSWORD` trong `env.js`
- ✅ API function: `API.resetPassword()`
- ✅ Service: `resetPassword()` trong `auth.service.js`
- ✅ Controller: Reset flow đã có trong `auth.controller.js`
- ✅ UI: Form reset password trong `index.html`

---

## 🔄 FLOW HOẠT ĐỘNG

```
User click "Quên mật khẩu"
    ↓
Nhập số điện thoại
    ↓
Click "Gửi mã OTP"
    ↓
Backend gửi OTP (SMS hoặc console)
    ↓
Nhập OTP (6 chữ số)
    ↓
Click "Xác nhận OTP"
    ↓
Nhập mật khẩu mới
    ↓
Click "Đặt lại mật khẩu"
    ↓
Backend verify OTP + update password
    ↓
Success → Quay về login
```

---

## 🧪 CÁCH TEST

### Bước 1: Start Backend

```bash
npm run dev
# Backend chạy tại: http://localhost:3000
```

### Bước 2: Start Frontend

```bash
# Live Server hoặc
cd Feature-login
python -m http.server 8000
# Frontend: http://localhost:8000/index.html
```

### Bước 3: Test Reset Password

#### **3.1. Đăng ký user trước (nếu chưa có)**

```
1. Mở: http://localhost:8000/index.html
2. Click "Đăng ký"
3. Phone: 0912345678
4. Click "Gửi mã OTP"
5. Check backend console lấy OTP
6. Nhập OTP + thông tin
7. Đăng ký thành công
```

#### **3.2. Test Quên Mật Khẩu**

```
1. Ở trang login, click "Quên mật khẩu"

2. STEP 1: Nhập số điện thoại
   - Phone: 0912345678
   - Click "Gửi mã OTP"

3. Check Backend Console:
   📱 OTP for +84912345678: 123456

4. STEP 2: Nhập OTP
   - OTP: 123456
   - Click "Xác nhận OTP"

5. STEP 3: Nhập mật khẩu mới
   - New Password: newpassword123
   - Click "Đặt lại mật khẩu"

6. Success Message:
   "Đặt lại mật khẩu thành công!"
   → Auto redirect về login sau 1.5s

7. Test Login với password mới:
   - Phone: 0912345678
   - Password: newpassword123
   - Click "Đăng nhập"
   - Should login successfully!
```

---

## 📡 API ENDPOINT

### POST `/api/v1/auth/password/reset`

**Request:**
```json
{
  "phoneNumber": "0912345678",
  "otpCode": "123456",
  "newPassword": "newpassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Mã OTP không hợp lệ hoặc đã hết hạn"
}
```

---

## 🔍 DEBUGGING

### Backend Logs

```bash
# Check OTP sent
📱 OTP for +84912345678: 123456

# Check reset password request
POST /api/v1/auth/password/reset 200
✅ Password reset successful for: +84912345678
```

### Frontend Console

```javascript
// Check API calls
[Backend] OTP sent for 0912345678
[Backend] Password reset successful for 0912345678
```

### Network Tab

1. `POST /api/v1/auth/otp/request`
   - Body: `{ phoneNumber: "0912345678", purpose: "reset_password" }`
   - Response: `{ success: true, message: "OTP sent..." }`

2. `POST /api/v1/auth/password/reset`
   - Body: `{ phoneNumber: "0912345678", otpCode: "123456", newPassword: "..." }`
   - Response: `{ success: true, message: "Password reset successful" }`

---

## ⚠️ VALIDATION RULES

### Phone Number:
- ✅ Required
- ✅ Valid Vietnamese phone (0xxx hoặc +84xxx)
- ✅ User must exist in database

### OTP Code:
- ✅ Required
- ✅ Exactly 6 digits
- ✅ Numeric only
- ✅ Must be valid and not expired
- ✅ Purpose must be `reset_password`

### New Password:
- ✅ Required
- ✅ Minimum 6 characters
- ✅ Will be hashed automatically by bcrypt

---

## 🔐 SECURITY FEATURES

1. **OTP Verification:** Bắt buộc verify OTP trước khi reset
2. **Rate Limiting:** authLimiter (5 requests/15 min)
3. **Password Hashing:** Auto hash với bcrypt
4. **User Validation:** Check user exists
5. **OTP Purpose:** Phân biệt reset_password vs register/login
6. **OTP Expiration:** 5 minutes
7. **Max Attempts:** 5 attempts per OTP

---

## 📋 CHECKLIST

- [x] Backend controller: `resetPassword()`
- [x] Backend route: `POST /password/reset`
- [x] Frontend API: `API.resetPassword()`
- [x] Frontend service: `resetPassword()`
- [x] Frontend controller: Reset flow logic
- [x] UI: Reset password form
- [x] Validation: All fields
- [x] OTP verification: With backend
- [x] Password hashing: Automatic
- [x] Success message: Display & redirect
- [x] Error handling: User-friendly messages

---

## 🎯 TEST SCENARIOS

### ✅ Scenario 1: Happy Path
```
1. User exists: ✅
2. OTP sent: ✅
3. OTP valid: ✅
4. New password valid: ✅
→ Result: Password reset successfully
```

### ❌ Scenario 2: User Not Found
```
1. Phone: 0999999999 (không tồn tại)
2. Click "Gửi mã OTP"
→ Error: "Số điện thoại chưa được đăng ký"
```

### ❌ Scenario 3: Wrong OTP
```
1. Phone: 0912345678
2. OTP: 999999 (sai)
3. Click "Xác nhận OTP"
→ Error: "Mã OTP không đúng"
```

### ❌ Scenario 4: Expired OTP
```
1. Phone: 0912345678
2. Đợi > 5 phút
3. Nhập OTP (đã hết hạn)
→ Error: "Mã OTP không hợp lệ hoặc đã hết hạn"
```

### ❌ Scenario 5: Weak Password
```
1. Phone: 0912345678
2. OTP: 123456 (correct)
3. New Password: "123" (< 6 chars)
→ Error: "Mật khẩu phải có ít nhất 6 ký tự"
```

---

## 🚀 NEXT STEPS

Tính năng Reset Password đã hoàn chỉnh! Bạn có thể:

1. ✅ **Test ngay** với localhost
2. 📱 **Test với SMS thật** (nếu đã setup Twilio)
3. 🚀 **Deploy** lên production
4. 📧 **Thêm Email** (nếu muốn reset qua email)

---

## 📞 CURL TEST

Nếu muốn test trực tiếp API:

```bash
# 1. Request OTP
curl -X POST http://localhost:3000/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0912345678", "purpose": "reset_password"}'

# 2. Reset Password
curl -X POST http://localhost:3000/api/v1/auth/password/reset \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0912345678",
    "otpCode": "123456",
    "newPassword": "newpassword123"
  }'
```

---

**Version:** 1.0.0  
**Date:** 29/12/2025  
**Status:** ✅ Fully Implemented & Ready for Testing

