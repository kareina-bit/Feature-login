# 🔗 Hướng dẫn kết nối Frontend & Backend - Shipway

## 📋 Tổng quan

Dự án đã được tích hợp hoàn chỉnh giữa Frontend (HTML/JS) và Backend (Node.js/Express/MongoDB).

---

## 🏗️ Kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                              │
│  Feature-login-main/                                     │
│  ├── login.html          (Trang đăng nhập)              │
│  ├── register.html       (Trang đăng ký)                │
│  ├── dashboard.html      (Dashboard sau khi login)      │
│  └── assets/                                             │
│      ├── api-config.js   (API endpoints & helpers)      │
│      ├── auth-backend.js (Authentication logic)         │
│      └── style.css       (Styles)                       │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
                     │ Fetch API
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND                               │
│  src/                                                    │
│  ├── server.ts           (Express app)                  │
│  ├── routes/             (API routes)                   │
│  ├── controllers/        (Business logic)               │
│  ├── models/             (MongoDB models)               │
│  └── middleware/         (Auth, validation, etc.)       │
│                                                          │
│  API Endpoints:                                          │
│  POST /api/v1/auth/otp/request                          │
│  POST /api/v1/auth/register                             │
│  POST /api/v1/auth/login                                │
│  GET  /api/v1/auth/profile                              │
│  POST /api/v1/auth/refresh                              │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Cài đặt và chạy

### Bước 1: Cài đặt Backend

```bash
# Cài đặt dependencies
npm install

# Tạo file .env (copy từ .env.example)
# Cấu hình các biến môi trường cần thiết
```

### Bước 2: Cấu hình file .env

Tạo file `.env` trong thư mục root với nội dung:

```env
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/shipway_driver

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRE=30d

# Twilio (Optional - để trống sẽ log OTP ra console)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# OTP
OTP_EXPIRE_MINUTES=5
OTP_LENGTH=6

# CORS
CORS_ORIGIN=*
```

### Bước 3: Chạy Backend

```bash
# Development mode (với auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

Backend sẽ chạy tại: `http://localhost:3000`

### Bước 4: Mở Frontend

Frontend là static files HTML/JS, có 2 cách chạy:

#### Option A: Dùng Live Server (VSCode Extension)
1. Cài đặt extension "Live Server" trong VSCode
2. Right-click vào `Feature-login-main/login.html`
3. Chọn "Open with Live Server"

#### Option B: Dùng Python HTTP Server
```bash
cd Feature-login-main
python -m http.server 8000
# hoặc
python3 -m http.server 8000
```

Frontend sẽ chạy tại: `http://localhost:8000` (hoặc port khác nếu bạn chọn)

#### Option C: Mở trực tiếp file
- Double-click vào `Feature-login-main/login.html`
- Tuy nhiên cách này có thể gặp CORS issues

---

## 📱 Luồng hoạt động

### 1. Đăng ký (Register Flow)

```
User ───┐
        │ 1. Nhập: phone, name, password
        ▼
   register.html
        │ 2. Click "Đăng ký"
        ▼
   auth-backend.js
        │ 3. Call API: POST /api/v1/auth/otp/request
        ▼
   Backend Server
        │ 4. Generate OTP, Save DB, Send SMS (or log)
        ▼
   User nhận OTP (qua SMS hoặc console log)
        │ 5. Nhập OTP
        ▼
   auth-backend.js
        │ 6. Call API: POST /api/v1/auth/register
        ▼
   Backend Server
        │ 7. Verify OTP, Create User, Return tokens
        ▼
   LocalStorage
        │ 8. Lưu accessToken, refreshToken, user info
        ▼
   Redirect to login.html (hoặc dashboard.html)
```

### 2. Đăng nhập (Login Flow)

```
User ───┐
        │ 1. Nhập: phone, password
        ▼
   login.html
        │ 2. Click "Đăng nhập"
        ▼
   auth-backend.js
        │ 3. Call API: POST /api/v1/auth/login
        ▼
   Backend Server
        │ 4. Verify credentials, Return tokens
        ▼
   LocalStorage
        │ 5. Lưu accessToken, refreshToken, user info
        ▼
   Redirect to dashboard.html
```

### 3. Dashboard

```
dashboard.html
        │ 1. Check token in localStorage
        ▼
   auth-backend.js
        │ 2. Call API: GET /api/v1/auth/profile
        │    Headers: Authorization: Bearer {token}
        ▼
   Backend Server
        │ 3. Verify JWT, Return user data
        ▼
   Display user info
```

---

## 🔧 API Endpoints chi tiết

### 1. Request OTP

**Endpoint:** `POST /api/v1/auth/otp/request`

**Request:**
```json
{
  "phoneNumber": "0912345678",
  "purpose": "register"  // or "login"
}
```

**Response (Success):**
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

### 2. Register

**Endpoint:** `POST /api/v1/auth/register`

**Request:**
```json
{
  "phoneNumber": "0912345678",
  "otpCode": "123456",
  "password": "password123",
  "fullName": "Nguyen Van A"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "phoneNumber": "+84912345678",
      "fullName": "Nguyen Van A",
      "role": "driver",
      "phoneNumberVerified": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 3. Login

**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```json
{
  "phoneNumber": "0912345678",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "phoneNumber": "+84912345678",
      "fullName": "Nguyen Van A",
      "role": "driver",
      "phoneNumberVerified": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 4. Get Profile

**Endpoint:** `GET /api/v1/auth/profile`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "phoneNumber": "+84912345678",
      "fullName": "Nguyen Van A",
      "email": null,
      "avatar": null,
      "role": "driver",
      "status": "active",
      "phoneNumberVerified": true,
      "lastLogin": "2025-12-29T10:30:00.000Z",
      "createdAt": "2025-12-29T10:00:00.000Z",
      "updatedAt": "2025-12-29T10:30:00.000Z"
    }
  }
}
```

---

## 🧪 Testing Flow

### Test 1: Đăng ký tài khoản mới

1. Mở backend: `npm run dev`
2. Mở frontend: `http://localhost:8000/register.html`
3. Nhập thông tin:
   - Phone: `0912345678`
   - Full Name: `Test User`
   - Password: `password123`
4. Click "Đăng ký"
5. **Check console log backend** để lấy OTP (nếu không config Twilio)
6. Nhập OTP vào form
7. Click "Xác thực OTP"
8. Nếu thành công → redirect to `login.html`

### Test 2: Đăng nhập

1. Mở `http://localhost:8000/login.html`
2. Nhập:
   - Phone: `0912345678`
   - Password: `password123`
3. Click "Đăng nhập"
4. Nếu thành công → redirect to `dashboard.html`

### Test 3: Dashboard

1. Sau khi đăng nhập thành công
2. Xem thông tin user được load từ API
3. Click "Đăng xuất" để logout

---

## 🔍 Debugging

### Kiểm tra Backend

```bash
# Health check
curl http://localhost:3000/health

# Expected response:
# {"status":"OK","message":"Shipway Driver API is running","timestamp":"..."}
```

### Kiểm tra Frontend

1. Mở Developer Tools (F12)
2. Tab **Console**: Xem logs và errors
3. Tab **Network**: Xem API calls
4. Tab **Application > Local Storage**: Xem tokens được lưu

### Common Issues

#### 1. CORS Error
```
Access to fetch at 'http://localhost:3000/api/v1/auth/login' 
from origin 'http://localhost:8000' has been blocked by CORS policy
```

**Giải pháp:**
- Đảm bảo backend có `CORS_ORIGIN=*` trong `.env`
- Hoặc set specific origin: `CORS_ORIGIN=http://localhost:8000`

#### 2. Cannot connect to backend
```
Failed to fetch
```

**Giải pháp:**
- Kiểm tra backend đang chạy: `curl http://localhost:3000/health`
- Kiểm tra PORT trong `api-config.js` có đúng không

#### 3. MongoDB connection error
```
❌ Database connection error
```

**Giải pháp:**
- Đảm bảo MongoDB đang chạy
- Kiểm tra `MONGODB_URI` trong `.env`

#### 4. OTP không nhận được
**Development mode:**
- Check console log của backend để xem OTP

**Production mode:**
- Cần config Twilio credentials trong `.env`

---

## 📊 Files đã tích hợp

### Frontend Files

| File | Mô tả |
|------|-------|
| `Feature-login-main/login.html` | Trang đăng nhập |
| `Feature-login-main/register.html` | Trang đăng ký |
| `Feature-login-main/dashboard.html` | Dashboard (mới tạo) |
| `Feature-login-main/assets/api-config.js` | **MỚI**: API configuration & helpers |
| `Feature-login-main/assets/auth-backend.js` | **MỚI**: Backend integration logic |
| `Feature-login-main/assets/auth.js` | File cũ (mock data) - đã thay thế |

### Backend Files

| File | Mô tả |
|------|-------|
| `src/server.ts` | Express server với CORS config |
| `src/routes/auth.routes.ts` | Auth API routes |
| `src/controllers/auth.controller.ts` | Auth business logic |
| `src/models/User.model.ts` | User schema |
| `src/models/OTP.model.ts` | OTP schema |

---

## ✅ Checklist tích hợp

- [x] Tạo `api-config.js` với API endpoints
- [x] Tạo `auth-backend.js` với real API calls
- [x] Update `login.html` để load scripts mới
- [x] Update `register.html` để load scripts mới
- [x] Tạo `dashboard.html` cho sau khi login
- [x] CORS configuration ở backend
- [x] Token management (localStorage)
- [x] Toast notifications
- [x] Loading states
- [x] Error handling

---

## 🎯 Kết quả

**Frontend & Backend đã được tích hợp hoàn chỉnh!**

✅ Đăng ký với OTP verification  
✅ Đăng nhập với password  
✅ JWT token management  
✅ Protected routes (dashboard)  
✅ User profile loading  
✅ Logout functionality  

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, check các file log:
- Backend: Console output của `npm run dev`
- Frontend: Browser DevTools Console
- MongoDB: MongoDB logs

---

**Phiên bản:** 1.0.0  
**Ngày cập nhật:** 29/12/2025  
**Tích hợp bởi:** Shipway Development Team

