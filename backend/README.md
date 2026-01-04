# Shipway Backend API

Backend API cho hệ thống quản lý vận chuyển Shipway.

## Công nghệ sử dụng

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (MongoDB Atlas)
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Twilio** - SMS OTP (optional)

## Cài đặt

### 1. Clone repository và cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` từ file `.env.template`:

```bash
cp .env.template .env
```

Cập nhật các biến môi trường trong file `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shipway
JWT_SECRET=your_secret_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

### 3. Tạo tài khoản Admin mặc định

```bash
npm run seed
```

### 4. Chạy server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server sẽ chạy tại `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/send-otp` - Gửi OTP
- `POST /api/auth/verify-otp` - Xác thực OTP
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/reset-password` - Đặt lại mật khẩu
- `GET /api/auth/me` - Lấy thông tin user hiện tại (Protected)

### Users

- `GET /api/users/profile` - Lấy profile (Protected)
- `PUT /api/users/profile` - Cập nhật profile (Protected)
- `GET /api/users` - Lấy danh sách users (Admin)
- `GET /api/users/:userId` - Lấy thông tin user (Admin)
- `PUT /api/users/:userId/status` - Cập nhật trạng thái user (Admin)
- `DELETE /api/users/:userId` - Xóa user (Admin)
- `PUT /api/users/driver/info` - Cập nhật thông tin tài xế (Driver)
- `GET /api/users/drivers` - Lấy danh sách tài xế (Admin)

## Phân quyền

- **admin** - Quản trị viên (toàn quyền)
- **user** - Đối tác sử dụng dịch vụ vận chuyển
- **driver** - Tài xế

## Tài liệu chi tiết

Xem file `BACKEND_DOCUMENTATION.md` để biết thêm chi tiết về:
- Kiến trúc hệ thống
- Thiết kế database
- API specifications
- Security
- Deployment

## License

Copyright © 2025 Shipway Transportation Company

