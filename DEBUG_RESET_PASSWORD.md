# 🐛 Debug - Quên Mật Khẩu không hoạt động

## Vấn đề
Nhấn "Gửi mã OTP" trong mục quên mật khẩu nhưng không có gì xảy ra.

## Debug Steps

### 1. Kiểm tra Console (QUAN TRỌNG!)

```
1. Nhấn F12 để mở Developer Tools
2. Chọn tab "Console"
3. Click vào link "Quên mật khẩu"
4. Nhập số điện thoại: 0912345678
5. Click "Gửi mã OTP"
6. Xem có lỗi gì trong console không?
```

**Lỗi có thể gặp:**
- ❌ CORS error → Backend chưa chạy hoặc CORS chưa config
- ❌ Module import error → Path không đúng
- ❌ Fetch error → Backend offline
- ❌ undefined variable → Code lỗi

### 2. Kiểm tra Network Tab

```
1. F12 → Tab "Network"
2. Click "Gửi mã OTP"
3. Xem có request nào được gửi đi không?
```

**Nếu KHÔNG có request:**
- Event listener không được attach
- Form submit bị block
- JavaScript lỗi

**Nếu CÓ request nhưng fail:**
- Check status code (200 OK? 400/500 Error?)
- Check response message
- Check request payload

### 3. Kiểm tra Backend

```bash
# Terminal output phải có:
✅ MongoDB Connected: ...
🚀 Server is running on port 3000
📝 Environment: development
🔗 Health check: http://localhost:3000/health

# Test backend:
curl http://localhost:3000/health
```

**Nếu backend KHÔNG chạy:**
```bash
cd D:\Coding\Shipway
npm run dev
```

### 4. Test với Browser Console

Mở console và chạy:

```javascript
// Test 1: Check API object
console.log(API);

// Test 2: Try request OTP directly
API.requestOTP('0912345678', 'reset_password')
  .then(res => console.log('Success:', res))
  .catch(err => console.error('Error:', err));
```

### 5. Kiểm tra file đang mở

**Đảm bảo bạn đang mở:**
```
✅ Feature-login\index.html
❌ KHÔNG PHẢI Feature-login-main\login.html
```

**Live Server phải chạy từ:**
```
http://localhost:5500/Feature-login/index.html
hoặc
http://localhost:5500/index.html (nếu mở từ folder Feature-login)
```

---

## 🎯 Quick Fix

### Option 1: Test với folder mới (Đã update đầy đủ)

```bash
# 1. Mở file mới
File: Feature-login-main\login.html

# 2. Right-click → Open with Live Server
# 3. Click "Quên mật khẩu"
# 4. Test lại
```

### Option 2: Debug folder hiện tại

```javascript
// Paste vào Console để test:

// 1. Check form exists
console.log('Reset form:', document.getElementById('resetForm'));

// 2. Check button exists  
console.log('Reset btn:', document.getElementById('resetBtn'));

// 3. Manual test
document.getElementById('resetBtn').addEventListener('click', function() {
  console.log('Button clicked!');
  alert('Button works!');
});
```

---

## 📋 Checklist

- [ ] Backend đang chạy (port 3000)
- [ ] MongoDB connected
- [ ] Console không có lỗi
- [ ] Network tab có request OTP
- [ ] Request OTP trả về status 200
- [ ] File path đúng (`Feature-login\index.html`)
- [ ] Live Server đang chạy

---

## 🚨 Common Issues

### Issue 1: Console shows "Uncaught SyntaxError: Cannot use import statement outside a module"

**Fix:** Đảm bảo script tag có `type="module"`
```html
<script type="module" src="assets/js/auth.controller.js"></script>
```

### Issue 2: "Failed to fetch" or "CORS error"

**Fix:** Backend chưa chạy
```bash
cd D:\Coding\Shipway
npm run dev
```

### Issue 3: Console shows nothing, button không phản hồi

**Fix:** Event listener chưa được attach
- Kiểm tra file `auth.controller.js` có được load không
- Check console có log `initAuth()` không

### Issue 4: "Cannot read properties of null"

**Fix:** Element ID không đúng hoặc HTML structure sai

---

## 🔧 Manual Test

Paste code này vào Console để test manual:

```javascript
// Test send OTP
async function testResetPassword() {
  const phone = '0912345678';
  
  try {
    // Step 1: Request OTP
    console.log('Step 1: Requesting OTP...');
    const otpRes = await fetch('http://localhost:3000/api/v1/auth/otp/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phoneNumber: phone, 
        purpose: 'reset_password' 
      })
    });
    
    const otpData = await otpRes.json();
    console.log('OTP Response:', otpData);
    
    if (otpData.success) {
      alert('OTP sent! Check backend console for code');
    } else {
      alert('Error: ' + otpData.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Backend not running or CORS issue');
  }
}

testResetPassword();
```

---

## ✅ Khi hoạt động đúng

**Console log sẽ hiển thị:**
```
[Backend] OTP sent for 0912345678
```

**Backend terminal sẽ hiển thị:**
```
📱 OTP for +84912345678: 123456
⚠️ Twilio not configured. OTP logged to console.
POST /api/v1/auth/otp/request 200 45.123 ms - 156
```

**UI sẽ:**
- Hiển thị message "Mã OTP đã được gửi"
- Disable số điện thoại
- Hiển thị input OTP
- Button đổi text thành "Xác nhận OTP"

---

## 📞 Next Steps

Sau khi debug:
1. Screenshot console errors (nếu có)
2. Screenshot network tab
3. Copy error message
4. Báo lại để được hỗ trợ chi tiết hơn

---

**Date:** 30/12/2025
**File:** DEBUG_RESET_PASSWORD.md

