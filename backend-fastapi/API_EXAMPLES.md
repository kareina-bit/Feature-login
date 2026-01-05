# FastAPI Backend - API Examples

Các ví dụ thực tế về cách sử dụng API endpoints.

## Base URL

```
http://localhost:8000/api
```

## Authentication

Tất cả các protected endpoints cần JWT token trong header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Flow

### 1.1. Đăng ký người dùng mới

**Step 1: Gửi OTP**

```bash
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+84397912441",
    "type": "registration"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Mã OTP đã được gửi",
  "data": {
    "phone": "+84397912441",
    "type": "registration",
    "expiresAt": "2024-01-06T10:15:00Z"
  }
}
```

**Console Output (Development):**
```
⚠️  Twilio not configured. OTP: 123456
📱 OTP created for +84397912441 (registration): 123456
```

**Step 2: Đăng ký với OTP**

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": "+84397912441",
    "password": "SecurePass123!",
    "role": "user",
    "otp": "123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "user": {
    "id": "65a1b2c3d4e5f6789012345",
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": "+84397912441",
    "role": "user",
    "isVerified": true,
    "createdAt": "2024-01-06T10:10:00Z",
    "updatedAt": "2024-01-06T10:10:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 1.2. Đăng nhập

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+84391912441",
    "password": "Admin@123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "user": {
    "id": "65a1b2c3d4e5f6789012345",
    "name": "Shipway Administrator",
    "email": "admin@shipway.vn",
    "phone": "+84391912441",
    "role": "admin",
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWExYjJjM2Q0ZTVmNjc4OTAxMjM0NSIsInBob25lIjoiKzg0MzkxOTEyNDQxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzA0NTUyMDAwfQ.abc123..."
}
```

### 1.3. Quên mật khẩu

**Step 1: Gửi OTP**

```bash
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+84397912441",
    "type": "reset-password"
  }'
```

**Step 2: Đặt lại mật khẩu**

```bash
curl -X POST http://localhost:8000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+84397912441",
    "newPassword": "NewSecurePass123!",
    "otp": "123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công",
  "data": {
    "id": "65a1b2c3d4e5f6789012345",
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": "+84397912441",
    "role": "user",
    "isVerified": true,
    "createdAt": "2024-01-06T10:10:00Z",
    "updatedAt": "2024-01-06T11:30:00Z"
  }
}
```

---

## 2. User Management

### 2.1. Lấy thông tin user hiện tại

```bash
curl -X GET http://localhost:8000/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "65a1b2c3d4e5f6789012345",
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": "+84397912441",
    "role": "user",
    "isVerified": true,
    "createdAt": "2024-01-06T10:10:00Z",
    "updatedAt": "2024-01-06T10:10:00Z"
  }
}
```

### 2.2. Cập nhật thông tin user

```bash
curl -X PUT http://localhost:8000/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn B",
    "email": "nguyenvanb@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "65a1b2c3d4e5f6789012345",
    "name": "Nguyễn Văn B",
    "email": "nguyenvanb@example.com",
    "phone": "+84397912441",
    "role": "user",
    "isVerified": true,
    "createdAt": "2024-01-06T10:10:00Z",
    "updatedAt": "2024-01-06T11:45:00Z"
  }
}
```

### 2.3. Lấy danh sách users (Admin only)

```bash
curl -X GET "http://localhost:8000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer <admin_token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "65a1b2c3d4e5f6789012345",
      "name": "Shipway Administrator",
      "email": "admin@shipway.vn",
      "phone": "+84391912441",
      "role": "admin",
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "65a1b2c3d4e5f6789012346",
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "phone": "+84397912441",
      "role": "user",
      "isVerified": true,
      "createdAt": "2024-01-06T10:10:00Z",
      "updatedAt": "2024-01-06T10:10:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

### 2.4. Lấy user theo ID (Admin only)

```bash
curl -X GET http://localhost:8000/api/users/65a1b2c3d4e5f6789012345 \
  -H "Authorization: Bearer <admin_token>"
```

### 2.5. Xóa user (Admin only)

```bash
curl -X DELETE http://localhost:8000/api/users/65a1b2c3d4e5f6789012345 \
  -H "Authorization: Bearer <admin_token>"
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

---

## 3. Health Check

```bash
curl -X GET http://localhost:8000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "app": "Shipway API",
  "version": "1.0.0",
  "environment": "development",
  "database": "connected"
}
```

---

## 4. Error Responses

### 4.1. Validation Error (422)

```json
{
  "success": false,
  "message": "Validation error",
  "error": "body.password: Password must contain at least one uppercase letter"
}
```

### 4.2. Unauthorized (401)

```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Số điện thoại hoặc mật khẩu không chính xác"
}
```

### 4.3. Not Found (404)

```json
{
  "success": false,
  "message": "Not found",
  "error": "Người dùng không tồn tại"
}
```

### 4.4. Conflict (409)

```json
{
  "success": false,
  "message": "Conflict",
  "error": "Số điện thoại hoặc email đã được sử dụng"
}
```

### 4.5. Internal Server Error (500)

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

---

## 5. JavaScript/Frontend Examples

### 5.1. Đăng ký

```javascript
const API_BASE = 'http://localhost:8000/api';

async function register() {
  // Step 1: Send OTP
  const otpResponse = await fetch(`${API_BASE}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '+84397912441',
      type: 'registration'
    })
  });
  
  const otpData = await otpResponse.json();
  console.log('OTP sent:', otpData);
  
  // User enters OTP...
  const otp = prompt('Enter OTP:');
  
  // Step 2: Register with OTP
  const registerResponse = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '+84397912441',
      password: 'SecurePass123!',
      role: 'user',
      otp: otp
    })
  });
  
  const data = await registerResponse.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    console.log('Registration successful!');
  }
}
```

### 5.2. Đăng nhập

```javascript
async function login(phone, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  } else {
    throw new Error(data.message);
  }
}
```

### 5.3. Lấy thông tin user (với authentication)

```javascript
async function getCurrentUser() {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.data;
}
```

---

## 6. Postman Collection

Import collection này vào Postman:

```json
{
  "info": {
    "name": "Shipway API - FastAPI",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Send OTP",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"phone\": \"+84397912441\",\n  \"type\": \"registration\"\n}",
              "options": { "raw": { "language": "json" } }
            },
            "url": "{{base_url}}/auth/send-otp"
          }
        },
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Nguyễn Văn A\",\n  \"email\": \"nguyenvana@example.com\",\n  \"phone\": \"+84397912441\",\n  \"password\": \"SecurePass123!\",\n  \"role\": \"user\",\n  \"otp\": \"123456\"\n}",
              "options": { "raw": { "language": "json" } }
            },
            "url": "{{base_url}}/auth/register"
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"phone\": \"+84391912441\",\n  \"password\": \"Admin@123456\"\n}",
              "options": { "raw": { "language": "json" } }
            },
            "url": "{{base_url}}/auth/login"
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

## 7. Testing với Python

```python
import requests

BASE_URL = "http://localhost:8000/api"

# Login
response = requests.post(f"{BASE_URL}/auth/login", json={
    "phone": "+84391912441",
    "password": "Admin@123456"
})

data = response.json()
token = data["token"]

# Get current user
response = requests.get(
    f"{BASE_URL}/users/me",
    headers={"Authorization": f"Bearer {token}"}
)

user = response.json()
print(user)
```

---

**Swagger UI**: http://localhost:8000/docs để test interactive!

