# 🔐 Flow Hoạt Động - Quên Mật Khẩu

## ✅ Flow Đầy Đủ

```
┌─────────────────────────────────────────────────────────┐
│  User: Click "Quên mật khẩu"                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 1: Nhập số điện thoại                             │
│  - Input: 0912345678                                    │
│  - Click: "Gửi mã OTP"                                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Frontend: Gửi request đến Backend                      │
│  POST /api/v1/auth/otp/request                          │
│  {                                                       │
│    "phoneNumber": "0912345678",                         │
│    "purpose": "reset_password"                          │
│  }                                                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Backend: Kiểm tra số điện thoại                        │
│  1. Validate format (VN phone)                          │
│  2. Format: 0912345678 → +84912345678                   │
│  3. Check database: User.findOne({ phoneNumber })       │
└────────────────┬────────────────────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
         ▼                ▼
    ❌ CHƯA ĐĂNG KÝ    ✅ ĐÃ ĐĂNG KÝ
         │                │
         │                │
         ▼                ▼
┌──────────────────┐  ┌──────────────────────────────┐
│  Error Response  │  │  Success: Gửi OTP            │
│  Status: 404     │  │  1. Generate OTP: 123456     │
│  Message:        │  │  2. Save to database         │
│  "Số điện thoại  │  │  3. Send SMS (or log)        │
│  chưa được       │  │  Status: 200                 │
│  đăng ký"        │  │  Message: "Mã OTP đã gửi"    │
└────────┬─────────┘  └────────┬─────────────────────┘
         │                     │
         ▼                     ▼
┌──────────────────┐  ┌──────────────────────────────┐
│  Frontend:       │  │  Frontend:                   │
│  Hiển thị lỗi    │  │  1. Hiển thị message success │
│  "Số điện thoại  │  │  2. Disable phone input      │
│  không hợp lệ    │  │  3. Show OTP input (Step 2)  │
│  hoặc chưa được  │  │  4. Change button: "Xác OTP" │
│  đăng ký"        │  │                              │
└──────────────────┘  └────────┬─────────────────────┘
                               │
                               ▼
                      ┌────────────────────────────┐
                      │  STEP 2: Nhập OTP          │
                      │  - User nhập: 123456       │
                      │  - Click: "Xác nhận OTP"   │
                      └────────┬───────────────────┘
                               │
                               ▼
                      ┌────────────────────────────┐
                      │  Frontend: Validate OTP    │
                      │  - Check 6 digits          │
                      │  - Show Step 3             │
                      └────────┬───────────────────┘
                               │
                               ▼
                      ┌────────────────────────────┐
                      │  STEP 3: Nhập mật khẩu mới │
                      │  - Password: newpass123    │
                      │  - Confirm: newpass123     │
                      │  - Click: "Đặt lại MK"     │
                      └────────┬───────────────────┘
                               │
                               ▼
                      ┌────────────────────────────┐
                      │  Frontend: Gửi request     │
                      │  POST /password/reset      │
                      │  {                         │
                      │    phone, otp, newPassword │
                      │  }                         │
                      └────────┬───────────────────┘
                               │
                               ▼
                      ┌────────────────────────────┐
                      │  Backend:                  │
                      │  1. Verify OTP             │
                      │  2. Update password        │
                      │  3. Return success         │
                      └────────┬───────────────────┘
                               │
                               ▼
                      ┌────────────────────────────┐
                      │  SUCCESS!                  │
                      │  - Message: "Đặt lại MK    │
                      │    thành công!"            │
                      │  - Redirect: login.html    │
                      │  - User login với MK mới   │
                      └────────────────────────────┘
```

---

## 📋 Chi tiết Backend Logic

### Request OTP - `POST /api/v1/auth/otp/request`

**Input:**
```json
{
  "phoneNumber": "0912345678",
  "purpose": "reset_password"
}
```

**Backend Processing:**

1. **Validate Purpose**
```typescript
if (!['register', 'login', 'reset_password'].includes(purpose)) {
  throw Error('Mục đích không hợp lệ');
}
```

2. **Validate Phone Format**
```typescript
const formattedPhone = validateVietnamesePhone(phoneNumber);
// "0912345678" → "+84912345678"
if (!formattedPhone) {
  throw Error('Số điện thoại không hợp lệ');
}
```

3. **Check User Exists (for reset_password)**
```typescript
if (purpose === 'reset_password') {
  const user = await User.findOne({ phoneNumber: formattedPhone });
  if (!user) {
    throw Error('Số điện thoại chưa được đăng ký'); // ← KEY POINT
  }
}
```

4. **Generate & Send OTP**
```typescript
const otp = generateOTP(); // "123456"
const otpRecord = new OTP({
  phoneNumber: formattedPhone,
  code: otp,
  purpose: 'reset_password',
  expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
});
await otpRecord.save();
await sendOTPSMS(formattedPhone, otp);
```

**Success Response:**
```json
{
  "success": true,
  "message": "Mã OTP đã được gửi đến số điện thoại +84912345678",
  "data": {
    "phoneNumber": "+84912345678",
    "expiresIn": 300
  }
}
```

**Error Response (User not found):**
```json
{
  "success": false,
  "message": "Số điện thoại chưa được đăng ký"
}
```

---

## 🧪 Test Cases

### Test 1: Số điện thoại CHƯA được đăng ký ❌

```bash
# Request
curl -X POST http://localhost:3000/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"0999999999","purpose":"reset_password"}'

# Response
{
  "success": false,
  "message": "Số điện thoại chưa được đăng ký"
}

# Frontend hiển thị
"Số điện thoại không hợp lệ hoặc chưa được đăng ký"
```

### Test 2: Số điện thoại ĐÃ được đăng ký ✅

```bash
# Request
curl -X POST http://localhost:3000/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"0912345678","purpose":"reset_password"}'

# Response
{
  "success": true,
  "message": "Mã OTP đã được gửi đến số điện thoại +84912345678",
  "data": {
    "phoneNumber": "+84912345678",
    "expiresIn": 300
  }
}

# Backend Console
📱 OTP for +84912345678: 123456

# Frontend
- Hiển thị: "Mã OTP đã được gửi"
- Show Step 2 (OTP input)
```

---

## 🎯 User Experience

### Kịch bản 1: User chưa đăng ký

```
1. User: Nhập 0999999999
2. User: Click "Gửi mã OTP"
3. System: Check database → Không tìm thấy
4. UI: Hiển thị message đỏ
   "Số điện thoại không hợp lệ hoặc chưa được đăng ký"
5. UI: Không chuyển sang Step 2
6. User: Phải nhập lại số khác hoặc đăng ký
```

### Kịch bản 2: User đã đăng ký

```
1. User: Nhập 0912345678
2. User: Click "Gửi mã OTP"
3. System: Check database → Tìm thấy user ✓
4. System: Generate OTP → 123456
5. System: Send SMS (or log console)
6. UI: Hiển thị message xanh "Mã OTP đã được gửi"
7. UI: Disable phone input
8. UI: Show Step 2 (OTP input)
9. UI: Button text → "Xác nhận OTP"
10. User: Nhập OTP và tiếp tục
```

---

## 📊 Database Queries

### Check User Exists
```javascript
const user = await User.findOne({ 
  phoneNumber: "+84912345678" 
});

if (!user) {
  // Số điện thoại chưa được đăng ký
  throw Error 404
}
```

### Create OTP Record
```javascript
const otpRecord = new OTP({
  phoneNumber: "+84912345678",
  code: "123456",
  purpose: "reset_password",
  expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  verified: false,
  attempts: 0
});
await otpRecord.save();
```

---

## 🔒 Security Features

1. **User Validation**: Chỉ gửi OTP cho số đã đăng ký
2. **Rate Limiting**: 1 OTP request/minute
3. **OTP Expiration**: 5 minutes
4. **Max Attempts**: 5 attempts per OTP
5. **Purpose Segregation**: register/login/reset_password riêng biệt

---

## ✅ Code Changes Summary

### File: `src/controllers/auth.controller.ts`

**Before:**
```typescript
if (!['register', 'login'].includes(purpose)) { ... }
// Không check user cho reset_password
```

**After:**
```typescript
if (!['register', 'login', 'reset_password'].includes(purpose)) { ... }

// Thêm check user cho reset_password
if (purpose === 'reset_password') {
  const user = await User.findOne({ phoneNumber: formattedPhone });
  if (!user) {
    throw createError('Số điện thoại chưa được đăng ký', 404);
  }
}
```

---

## 🚀 Test ngay

```bash
# 1. Start Backend
npm run dev

# 2. Test với số CHƯA đăng ký
curl -X POST http://localhost:3000/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"0999999999","purpose":"reset_password"}'

# Expected: 404 "Số điện thoại chưa được đăng ký"

# 3. Test với số ĐÃ đăng ký
curl -X POST http://localhost:3000/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"0912345678","purpose":"reset_password"}'

# Expected: 200 "Mã OTP đã được gửi"
```

---

**Version**: 2.0.0  
**Date**: 30/12/2025  
**Status**: ✅ HOÀN CHỈNH với validation đầy đủ

