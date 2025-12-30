# Shipway Driver Backend API

Backend API cho ứng dụng web tài xế của Shipway - EPIC 1: User Account & Identity Management

## 📋 Tính năng

- ✅ Đăng ký tài khoản bằng số điện thoại với xác thực OTP
- ✅ Đăng nhập bằng số điện thoại (OTP hoặc mật khẩu)
- ✅ Xác thực số điện thoại Việt Nam
- ✅ JWT Authentication với Access Token và Refresh Token
- ✅ Quản lý phiên đăng nhập
- ✅ Rate limiting để bảo vệ API
- ✅ Bảo mật với bcrypt cho mật khẩu

## 🛠️ Công nghệ sử dụng

- **Node.js** với **TypeScript**
- **Express.js** - Web framework
- **MongoDB** với **Mongoose** - Database
- **JWT** - Authentication tokens
- **Twilio** - SMS service cho OTP (có thể thay thế)
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **libphonenumber-js** - Phone number validation

## 📦 Cài đặt

### Yêu cầu

- Node.js >= 18.x
- MongoDB >= 5.x (hoặc MongoDB Atlas)
- npm hoặc yarn

### Các bước cài đặt

1. **Clone repository và cài đặt dependencies:**

```bash
npm install
```

2. **Tạo file `.env` từ `.env.example`:**

```bash
cp .env.example .env
```

3. **Cấu hình các biến môi trường trong `.env`:**

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/shipway_driver
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRE=30d

# Twilio SMS (tùy chọn - nếu không có sẽ log OTP ra console)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

OTP_EXPIRE_MINUTES=5
OTP_LENGTH=6
```

4. **Chạy ứng dụng:**

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## 📡 API Endpoints

### 1. Yêu cầu OTP

**POST** `/api/v1/auth/otp/request`

Gửi mã OTP đến số điện thoại.

**Request Body:**
```json
{
  "phoneNumber": "0912345678",
  "purpose": "register" // hoặc "login"
}
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

### 2. Đăng ký

**POST** `/api/v1/auth/register`

Đăng ký tài khoản mới với OTP verification.

**Request Body:**
```json
{
  "phoneNumber": "0912345678",
  "otpCode": "123456",
  "password": "password123", // tùy chọn
  "fullName": "Nguyễn Văn A" // tùy chọn
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": "user_id",
      "phoneNumber": "+84912345678",
      "fullName": "Nguyễn Văn A",
      "role": "driver",
      "phoneNumberVerified": true
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

### 3. Đăng nhập

**POST** `/api/v1/auth/login`

Đăng nhập bằng số điện thoại với OTP hoặc mật khẩu.

**Request Body (với OTP):**
```json
{
  "phoneNumber": "0912345678",
  "otpCode": "123456"
}
```

**Request Body (với mật khẩu):**
```json
{
  "phoneNumber": "0912345678",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": "user_id",
      "phoneNumber": "+84912345678",
      "fullName": "Nguyễn Văn A",
      "role": "driver",
      "phoneNumberVerified": true
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

### 4. Lấy thông tin profile

**GET** `/api/v1/auth/profile`

Lấy thông tin người dùng hiện tại.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "phoneNumber": "+84912345678",
      "fullName": "Nguyễn Văn A",
      "email": null,
      "avatar": null,
      "role": "driver",
      "status": "active",
      "phoneNumberVerified": true,
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 5. Refresh Token

**POST** `/api/v1/auth/refresh`

Làm mới access token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token"
  }
}
```

## 🔒 Bảo mật

- **Rate Limiting**: Giới hạn số lượng request để chống spam và brute force
- **JWT Tokens**: Access token (7 ngày) và Refresh token (30 ngày)
- **Password Hashing**: Sử dụng bcrypt với salt rounds = 10
- **Input Validation**: Validate tất cả input với express-validator
- **Helmet**: Bảo vệ HTTP headers
- **CORS**: Cấu hình CORS cho phép truy cập từ frontend

## 📱 Xác thực số điện thoại Việt Nam

Hệ thống tự động:
- Chuyển đổi số điện thoại Việt Nam sang định dạng E.164
- Hỗ trợ các định dạng: `0912345678`, `+84912345678`, `84912345678`
- Validate số điện thoại hợp lệ của Việt Nam

## 🧪 Testing

```bash
# Chạy tests
npm test
```

## 📝 Scripts

- `npm run dev` - Chạy development server với hot reload
- `npm run build` - Build TypeScript sang JavaScript
- `npm start` - Chạy production server
- `npm test` - Chạy tests
- `npm run lint` - Kiểm tra code style
- `npm run format` - Format code với Prettier

## 🗂️ Cấu trúc thư mục

```
src/
├── config/          # Cấu hình (database, etc.)
├── controllers/     # Business logic
├── middleware/      # Express middleware
├── models/          # MongoDB models
├── routes/          # API routes
├── services/        # Services (OTP, etc.)
├── utils/           # Utility functions
└── server.ts        # Entry point
```

## 🔧 Cấu hình OTP/SMS

### Sử dụng Twilio (Production)

1. Đăng ký tài khoản Twilio
2. Lấy Account SID và Auth Token
3. Cấu hình trong `.env`

### Development Mode

Nếu không cấu hình Twilio, hệ thống sẽ tự động log OTP ra console để dễ dàng test.

## 📄 License

ISC

## 👥 Team

Shipway Development Team

---

**Lưu ý**: Đây là phiên bản đầu tiên của EPIC 1. Các tính năng bổ sung sẽ được thêm vào trong các phiên bản tiếp theo.

