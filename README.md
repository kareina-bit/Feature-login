# 🚚 Shipway - Hệ thống Quản lý Vận chuyển

Hệ thống quản lý vận chuyển toàn diện cho Công ty Cổ phần Shipway, bao gồm chức năng đăng nhập, đăng ký, quên mật khẩu với xác thực OTP và phân quyền người dùng.

## 📋 Tổng quan

Shipway là nền tảng kết nối đối tác vận chuyển với tài xế, cung cấp giải pháp logistics hiệu quả cho các doanh nghiệp.

### Tính năng chính

- ✅ **Authentication System**
  - Đăng ký tài khoản với OTP verification
  - Đăng nhập với số điện thoại
  - Quên mật khẩu với OTP reset
  
- ✅ **Role-based Access Control**
  - **Admin**: Quản trị viên hệ thống
  - **User**: Đối tác sử dụng dịch vụ vận chuyển
  - **Driver**: Tài xế đăng ký

- ✅ **OTP System**
  - SMS OTP qua Twilio
  - Hạn chế số lần thử
  - Auto-expire sau 5 phút

## 🏗️ Kiến trúc

```
Shipwayyyy/
├── backend/              # Node.js + Express + MongoDB (PORT 5000)
│   ├── src/
│   │   ├── models/      # Mongoose models
│   │   ├── controllers/ # Route controllers
│   │   ├── services/    # Business logic
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Express middlewares
│   │   ├── config/      # Configuration
│   │   └── utils/       # Utilities
│   ├── server.js        # Entry point
│   └── package.json
│
├── frontend/            # Vanilla JS (HTML/CSS/JS)
│   ├── assets/
│   │   ├── css/
│   │   └── js/
│   ├── config/
│   ├── img/
│   └── index.html
│
└── docs/                # Documentation
    ├── BACKEND_DOCUMENTATION.md
    └── DATABASE_SCHEMA.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- npm
- MongoDB Atlas account
- Twilio account (optional for SMS OTP)

### Backend Setup

```bash
# 1. Cài đặt dependencies
cd backend
npm install

# 2. Cấu hình môi trường
cp .env.example .env
# Chỉnh sửa .env với thông tin của bạn

# 3. Chạy server
npm run dev
# Server chạy tại http://localhost:5000
```

### Frontend Setup

```bash
# Chạy với Live Server
cd frontend
# Mở index.html với VS Code Live Server (port 5500)
# hoặc:
python -m http.server 5500

# Frontend chạy tại http://localhost:5500
```

## 📚 Documentation

### Tài liệu chi tiết

- [Backend Documentation](docs/BACKEND_DOCUMENTATION.md) - Chi tiết về API, Database, Security
- [Backend README](backend/README.md) - Hướng dẫn setup backend
- [Frontend README](frontend/README.md) - Hướng dẫn setup frontend
- [Database Schema](docs/DATABASE_SCHEMA.md) - Thiết kế database chi tiết

### API Endpoints

**Authentication:**

```
POST   /api/auth/send-otp          # Gửi OTP
POST   /api/auth/verify-otp        # Xác thực OTP
POST   /api/auth/register          # Đăng ký
POST   /api/auth/login             # Đăng nhập
POST   /api/auth/reset-password    # Đặt lại mật khẩu
GET    /api/auth/me                # Lấy thông tin user (Protected)
```

**User Management:**

```
GET    /api/users/profile          # Lấy profile (Protected)
PUT    /api/users/profile          # Cập nhật profile (Protected)
GET    /api/users                  # Lấy danh sách users (Admin)
GET    /api/users/:userId          # Lấy user by ID (Admin)
PUT    /api/users/:userId/status   # Cập nhật status (Admin)
DELETE /api/users/:userId          # Xóa user (Admin)
```

## 🔐 Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shipway

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=7d

# OTP
OTP_EXPIRE_MINUTES=5

# Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Admin Default
ADMIN_PHONE=+84987654321
ADMIN_PASSWORD=Admin@123456
```

### Frontend (config/env.js)

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  // ...
};
```

## 🗄️ Database Schema

### Users Collection

```javascript
{
  phone: String (unique),         // +84987654321
  name: String,                   // Nguyễn Văn A
  password: String (hashed),      // bcrypt hash
  role: String,                   // 'admin' | 'user' | 'driver'
  isActive: Boolean,
  isPhoneVerified: Boolean,
  
  // Driver specific
  driverInfo: {
    licenseNumber: String,
    vehicleType: String,
    vehiclePlate: String,
    isVerified: Boolean,
    rating: Number,
    totalTrips: Number
  },
  
  // User/Partner specific
  companyInfo: {
    companyName: String,
    taxCode: String,
    address: String
  },
  
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### OTPs Collection

```javascript
{
  phone: String,
  otp: String,                    // 6-digit code
  purpose: String,                // 'register' | 'reset-password'
  attempts: Number,               // Max: 5
  isUsed: Boolean,
  expiresAt: Date,                // TTL index - auto delete
  createdAt: Date
}
```

## 🧪 Testing

### Tài khoản test

Sau khi chạy `npm run seed`, sử dụng:

```
Phone: +84987654321
Password: Admin@123456
Role: admin
```

### Test API với cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+84987654321", "password": "Admin@123456"}'

# Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+84123456789", "purpose": "register"}'
```

## 🚢 Deployment

### Backend (VPS/Cloud)

```bash
# 1. Clone repository
git clone <repo-url>
cd Shipwayyyy/backend

# 2. Install dependencies
npm install --production

# 3. Setup .env với production values

# 4. Start với PM2
npm install -g pm2
pm2 start server.js --name shipway-api
pm2 startup
pm2 save
```

### Frontend (Netlify/Vercel)

```bash
# Deploy với Netlify
cd frontend
netlify deploy --prod
```

## 📊 Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x | Runtime |
| Express | 4.18.2 | Web framework |
| MongoDB | Cloud | Database |
| Mongoose | 8.0.3 | ODM |
| JWT | 9.0.2 | Authentication |
| Bcrypt | 2.4.3 | Password hashing |
| Twilio | 4.19.0 | SMS OTP |

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript (ES6 Modules)

## 🔒 Security

- ✅ Password hashing với Bcrypt (10 salt rounds)
- ✅ JWT token authentication
- ✅ OTP rate limiting (5 attempts max)
- ✅ Input validation với express-validator
- ✅ CORS protection
- ✅ Environment variables cho sensitive data
- ✅ MongoDB injection prevention

## 📈 Roadmap

### Phase 2

- [ ] Refresh token mechanism
- [ ] Rate limiting
- [ ] Email OTP alternative
- [ ] Social login (Google, Facebook)
- [ ] File upload (Cloudinary)

### Phase 3

- [ ] Order management system
- [ ] Real-time tracking (Socket.io)
- [ ] Payment integration (VNPay, Momo)
- [ ] Review system
- [ ] Route optimization (Google Maps API)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

- **Email**: support@shipway.vn
- **Documentation**: Xem thư mục `docs/`
- **Issues**: Tạo issue trên GitHub

## 📄 License

Copyright © 2025 Công ty Cổ phần Shipway. All rights reserved.

---

**Phiên bản**: 1.0.0  
**Cập nhật**: 04/01/2025  
**Team**: Shipway Development Team
