# API Examples - Shipway Driver Backend

## 📝 Hướng dẫn test API

### 1. Yêu cầu OTP cho đăng ký

```bash
curl -X POST http://localhost:3000/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0912345678",
    "purpose": "register"
  }'
```

**Response:**
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

### 2. Đăng ký tài khoản mới

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0912345678",
    "otpCode": "123456",
    "password": "password123",
    "fullName": "Nguyễn Văn A"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "phoneNumber": "+84912345678",
      "fullName": "Nguyễn Văn A",
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

### 3. Yêu cầu OTP cho đăng nhập

```bash
curl -X POST http://localhost:3000/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0912345678",
    "purpose": "login"
  }'
```

### 4. Đăng nhập bằng OTP

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0912345678",
    "otpCode": "123456"
  }'
```

### 5. Đăng nhập bằng mật khẩu

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0912345678",
    "password": "password123"
  }'
```

### 6. Lấy thông tin profile (cần token)

```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "phoneNumber": "+84912345678",
      "fullName": "Nguyễn Văn A",
      "email": null,
      "avatar": null,
      "role": "driver",
      "status": "active",
      "phoneNumberVerified": true,
      "lastLogin": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 7. Refresh Access Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 🔍 Health Check

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Shipway Driver API is running",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

## 📱 Các định dạng số điện thoại được hỗ trợ

Hệ thống tự động chuyển đổi các định dạng sau:
- `0912345678` → `+84912345678`
- `+84912345678` → `+84912345678`
- `84912345678` → `+84912345678`

## ⚠️ Lưu ý

1. **Development Mode**: Nếu không cấu hình Twilio, mã OTP sẽ được log ra console
2. **Rate Limiting**: 
   - OTP requests: 1 request/phút
   - Auth endpoints: 5 requests/15 phút
   - General API: 100 requests/15 phút
3. **Token Expiry**:
   - Access Token: 7 ngày
   - Refresh Token: 30 ngày

## 🧪 Test Flow hoàn chỉnh

1. Request OTP cho register → Lấy mã OTP từ console/logs
2. Register với OTP → Nhận accessToken và refreshToken
3. Sử dụng accessToken để gọi API profile
4. Khi accessToken hết hạn, dùng refreshToken để lấy token mới
5. Login bằng password hoặc OTP

