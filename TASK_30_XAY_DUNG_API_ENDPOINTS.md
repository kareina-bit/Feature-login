# 📋 Task #30: Xây Dựng API Endpoints - Đánh Giá

**ID Task**: #30  
**Tên Task**: Xây dựng API Endpoints  
**Ngày**: 06/01/2026  
**Trạng thái**: ✅ Sẵn sàng để đánh giá

---

## 📌 Mô Tả Task

Triển khai các RESTful API endpoints cho xác thực và quản lý người dùng với xác thực dữ liệu, xử lý lỗi và tích hợp cơ sở dữ liệu phù hợp.

### Yêu Cầu
- [x] Các endpoints xác thực (đăng ký, đăng nhập, OTP, đặt lại mật khẩu)
- [x] Các endpoints quản lý người dùng (profile, danh sách users)
- [x] Xác thực request
- [x] Chuẩn hóa response
- [x] Xử lý lỗi
- [x] Tích hợp cơ sở dữ liệu (MongoDB)
- [x] Routes được bảo vệ (sử dụng auth middleware)

---

## 🎯 Triển Khai

### Vị Trí Files
```
backend/src/routes/
├── auth.routes.js       # Routes xác thực
└── user.routes.js       # Routes quản lý người dùng

backend/src/controllers/
├── auth.controller.js   # Logic xác thực
└── user.controller.js   # Logic quản lý người dùng
```

---

## 📋 Tổng Quan Endpoints

### Endpoints Xác Thực (6 endpoints)

| # | Endpoint | Method | Quyền truy cập | Trạng thái |
|---|----------|--------|----------------|--------|
| 1 | `/api/auth/send-otp` | POST | Public | ✅ |
| 2 | `/api/auth/verify-otp` | POST | Public | ✅ |
| 3 | `/api/auth/register` | POST | Public | ✅ |
| 4 | `/api/auth/login` | POST | Public | ✅ |
| 5 | `/api/auth/reset-password` | POST | Public | ✅ |
| 6 | `/api/auth/me` | GET | Protected | ✅ |

### Endpoints Quản Lý Người Dùng (4 endpoints)

| # | Endpoint | Method | Quyền truy cập | Trạng thái |
|---|----------|--------|----------------|--------|
| 7 | `/api/users/profile` | GET | Protected | ✅ |
| 8 | `/api/users/profile` | PUT | Protected | ✅ |
| 9 | `/api/users` | GET | Chỉ Admin | ✅ |
| 10 | `/api/users/driver/info` | PUT | Chỉ Driver | ✅ |

**Tổng cộng**: 10 endpoints

---

## 📝 Chi Tiết Endpoints

### 1. Gửi OTP

**Endpoint**: `POST /api/auth/send-otp`  
**Quyền truy cập**: Public  
**Mục đích**: Gửi OTP cho đăng ký hoặc đặt lại mật khẩu

**Request Body**:
```json
{
  "phone": "+84123456789",
  "purpose": "register"  // hoặc "reset-password"
}
```

**Response thành công (200)**:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresAt": "2026-01-06T08:30:00.000Z",
  "otp": "123456"  // Chỉ trong môi trường development
}
```

**Các trường hợp lỗi**:
- Thiếu số điện thoại: 400 "Số điện thoại là bắt buộc"
- Số điện thoại đã tồn tại (đăng ký): 400 "Số điện thoại đã được đăng ký"
- Không tìm thấy số điện thoại (reset): 404 "Tài khoản không tồn tại"

**Test**: `test-api.ps1` #1, #2, #3, #4

**Xác thực**:
- [x] Xác thực định dạng số điện thoại
- [x] Xác thực mục đích (purpose)
- [x] Kiểm tra người dùng tồn tại
- [x] Tạo OTP (6 chữ số)
- [x] Thời gian hết hạn OTP (5 phút)
- [x] Gửi SMS (Twilio/mock)

---

### 2. Xác Minh OTP

**Endpoint**: `POST /api/auth/verify-otp`  
**Quyền truy cập**: Public  
**Mục đích**: Xác minh mã OTP

**Request Body**:
```json
{
  "phone": "+84123456789",
  "otp": "123456",
  "purpose": "register"
}
```

**Response thành công (200)**:
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

**Các trường hợp lỗi**:
- Thiếu trường: 400 "Số điện thoại và OTP là bắt buộc"
- Không tìm thấy OTP: 400 "OTP không tồn tại hoặc đã được sử dụng"
- OTP đã hết hạn: 400 "OTP đã hết hạn"
- OTP sai: 400 "OTP không đúng. Còn X lần thử"
- Vượt quá số lần thử: 400 "Đã vượt quá số lần thử"

**Test**: `test-api.ps1` #5

**Xác thực**:
- [x] Kiểm tra OTP tồn tại
- [x] Xác thực thời gian hết hạn
- [x] Đếm số lần thử
- [x] So khớp mã
- [x] Đánh dấu đã sử dụng sau khi thành công

---

### 3. Đăng Ký

**Endpoint**: `POST /api/auth/register`  
**Quyền truy cập**: Public  
**Mục đích**: Đăng ký người dùng mới với xác minh OTP

**Request Body**:
```json
{
  "phone": "+84123456789",
  "name": "Nguyễn Văn A",
  "password": "Test@123",
  "role": "user",  // hoặc "driver"
  "otp": "123456"
}
```

**Response thành công (201)**:
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "Nguyễn Văn A",
    "phone": "+84123456789",
    "role": "user",
    "isActive": true,
    "isPhoneVerified": true,
    "createdAt": "2026-01-06T08:00:00.000Z"
  }
}
```

**Các trường hợp lỗi**:
- Thiếu trường: 400 "Vui lòng điền đầy đủ thông tin"
- OTP không hợp lệ: 400 "OTP không hợp lệ"
- Số điện thoại đã tồn tại: 400 "Số điện thoại đã được đăng ký"
- Mật khẩu yếu: 400 (lỗi xác thực)

**Test**: `test-api.ps1` #14 (trong phần RBAC)

**Xác thực**:
- [x] Tất cả trường bắt buộc
- [x] Xác minh OTP
- [x] Tính duy nhất của số điện thoại
- [x] Độ mạnh mật khẩu
- [x] Xác thực vai trò
- [x] Hash mật khẩu
- [x] Tạo JWT token
- [x] Tạo người dùng trong DB

---

### 4. Đăng Nhập

**Endpoint**: `POST /api/auth/login`  
**Quyền truy cập**: Public  
**Mục đích**: Đăng nhập bằng số điện thoại và mật khẩu

**Request Body**:
```json
{
  "phone": "+84391912441",
  "password": "Admin@123"
}
```

**Response thành công (200)**:
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "Admin",
    "phone": "+84391912441",
    "role": "admin",
    "isActive": true,
    "isPhoneVerified": true
  }
}
```

**Các trường hợp lỗi**:
- Thiếu trường: 400 "Vui lòng nhập số điện thoại và mật khẩu"
- Không tìm thấy số điện thoại: 401 "Số điện thoại hoặc mật khẩu không chính xác"
- Mật khẩu sai: 401 "Số điện thoại hoặc mật khẩu không chính xác"
- Tài khoản bị vô hiệu hóa: 401 "Tài khoản đã bị vô hiệu hóa"

**Test**: `test-api.ps1` #6 (mật khẩu sai), #7 (thành công)

**Xác thực**:
- [x] Số điện thoại và mật khẩu bắt buộc
- [x] Kiểm tra người dùng tồn tại
- [x] Xác minh mật khẩu (bcrypt)
- [x] Kiểm tra trạng thái hoạt động
- [x] Tạo JWT token
- [x] Cập nhật lastLogin
- [x] Không có mật khẩu trong response

---

### 5. Đặt Lại Mật Khẩu

**Endpoint**: `POST /api/auth/reset-password`  
**Quyền truy cập**: Public  
**Mục đích**: Đặt lại mật khẩu với xác minh OTP

**Request Body**:
```json
{
  "phone": "+84391912441",
  "otp": "123456",
  "newPassword": "NewPass@123"
}
```

**Response thành công (200)**:
```json
{
  "success": true,
  "message": "Mật khẩu đã được đặt lại thành công"
}
```

**Các trường hợp lỗi**:
- Thiếu trường: 400 "Vui lòng điền đầy đủ thông tin"
- OTP không hợp lệ: 400 "OTP không hợp lệ"
- Không tìm thấy số điện thoại: 404 "Tài khoản không tồn tại"
- Mật khẩu yếu: 400 (lỗi xác thực)

**Test**: Kiểm thử thủ công (không có trong script tự động)

**Xác thực**:
- [x] Tất cả trường bắt buộc
- [x] Xác minh OTP
- [x] Người dùng tồn tại
- [x] Độ mạnh mật khẩu
- [x] Hash mật khẩu
- [x] Cập nhật database

---

### 6. Lấy Thông Tin Người Dùng Hiện Tại

**Endpoint**: `GET /api/auth/me`  
**Quyền truy cập**: Protected (yêu cầu auth token)  
**Mục đích**: Lấy thông tin người dùng đang đăng nhập

**Request Headers**:
```
Authorization: Bearer <token>
```

**Response thành công (200)**:
```json
{
  "success": true,
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "Admin",
    "phone": "+84391912441",
    "role": "admin",
    "email": "admin@example.com",
    "isActive": true,
    "isPhoneVerified": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-06T08:00:00.000Z"
  }
}
```

**Các trường hợp lỗi**:
- Không có token: 401 "Không có quyền truy cập"
- Token không hợp lệ: 401 "Token không hợp lệ"
- Không tìm thấy người dùng: 401 "Người dùng không tồn tại"

**Test**: `test-api.ps1` #10

**Xác thực**:
- [x] Đã áp dụng Auth middleware
- [x] Người dùng từ token
- [x] Không có mật khẩu trong response

---

### 7. Lấy Profile Người Dùng

**Endpoint**: `GET /api/users/profile`  
**Quyền truy cập**: Protected  
**Mục đích**: Lấy profile của chính người dùng

**Request Headers**:
```
Authorization: Bearer <token>
```

**Response thành công (200)**:
```json
{
  "success": true,
  "profile": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "Nguyễn Văn A",
    "phone": "+84123456789",
    "email": "user@example.com",
    "role": "user",
    "avatar": "https://...",
    "isActive": true,
    "isPhoneVerified": true,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

**Các trường hợp lỗi**:
- Không có token: 401 (từ middleware)
- Token không hợp lệ: 401 (từ middleware)

**Test**: `test-api.ps1` #11

**Xác thực**:
- [x] Auth middleware
- [x] Trả về profile riêng
- [x] Thông tin người dùng đầy đủ

---

### 8. Cập Nhật Profile Người Dùng

**Endpoint**: `PUT /api/users/profile`  
**Quyền truy cập**: Protected  
**Mục đích**: Cập nhật profile của chính mình

**Request Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Nguyễn Văn B",
  "email": "newmail@example.com",
  "avatar": "https://..."
}
```

**Response thành công (200)**:
```json
{
  "success": true,
  "message": "Cập nhật profile thành công",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "Nguyễn Văn B",
    "email": "newmail@example.com",
    "avatar": "https://...",
    "phone": "+84123456789",
    "role": "user"
  }
}
```

**Các trường hợp lỗi**:
- Không có token: 401
- Dữ liệu không hợp lệ: 400 (xác thực)

**Test**: `test-api.ps1` #12

**Xác thực**:
- [x] Auth middleware
- [x] Xác thực trường
- [x] Không thể cập nhật phone/role
- [x] Cập nhật database
- [x] Trả về người dùng đã cập nhật

---

### 9. Lấy Tất Cả Người Dùng

**Endpoint**: `GET /api/users`  
**Quyền truy cập**: Chỉ Admin  
**Mục đích**: Lấy danh sách tất cả người dùng (tính năng admin)

**Request Headers**:
```
Authorization: Bearer <admin_token>
```

**Response thành công (200)**:
```json
{
  "success": true,
  "count": 10,
  "users": [
    {
      "id": "...",
      "name": "User 1",
      "phone": "+84...",
      "role": "user",
      "isActive": true,
      "createdAt": "..."
    },
    // ...thêm người dùng
  ]
}
```

**Các trường hợp lỗi**:
- Không có token: 401
- Không phải admin: 403 "Role 'user' không có quyền truy cập"

**Test**: `test-api.ps1` #13 (admin), #14 (user - sẽ fail)

**Xác thực**:
- [x] Auth middleware
- [x] Authorize middleware (admin)
- [x] Trả về tất cả người dùng
- [x] Không có mật khẩu trong response

---

### 10. Cập Nhật Thông Tin Tài Xế

**Endpoint**: `PUT /api/users/driver/info`  
**Quyền truy cập**: Chỉ Driver  
**Mục đích**: Cập nhật thông tin đặc biệt của tài xế

**Request Headers**:
```
Authorization: Bearer <driver_token>
```

**Request Body**:
```json
{
  "licenseNumber": "ABC123456",
  "vehicleType": "Truck",
  "vehiclePlate": "29A-12345",
  "isAvailable": true
}
```

**Response thành công (200)**:
```json
{
  "success": true,
  "message": "Cập nhật thông tin tài xế thành công",
  "driverInfo": {
    "licenseNumber": "ABC123456",
    "vehicleType": "Truck",
    "vehiclePlate": "29A-12345",
    "isAvailable": true
  }
}
```

**Các trường hợp lỗi**:
- Không có token: 401
- Không phải driver: 403 "Role 'user' không có quyền truy cập"
- Dữ liệu không hợp lệ: 400

**Test**: Kiểm thử thủ công (không có trong script tự động)

**Xác thực**:
- [x] Auth middleware
- [x] Authorize middleware (driver)
- [x] Xác thực trường
- [x] Cập nhật database

---

## ✅ Tiêu Chuẩn Định Dạng Response

### Định Dạng Response Thành Công
```json
{
  "success": true,
  "message": "Thông báo thành công",
  "data": { ... },  // Tùy chọn
  "token": "...",   // Cho endpoints xác thực
  "user": { ... }   // Cho endpoints xác thực
}
```

### Định Dạng Response Lỗi
```json
{
  "success": false,
  "message": "Thông báo lỗi"
}
```

**Tính nhất quán**:
- [x] Tất cả responses đều có trường `success`
- [x] Responses thành công có thông báo mô tả
- [x] Responses lỗi có thông báo rõ ràng
- [x] Không có dữ liệu nhạy cảm trong lỗi
- [x] Mã trạng thái HTTP phù hợp

---

## 🧪 Kiểm Thử

### Kiểm Thử Tự Động

**Chạy tất cả Tests**:
```powershell
cd backend
.\test-api.ps1
```

**Tests cho Task #30**:
- Test #1: Gửi OTP (đăng ký)
- Test #2: Gửi OTP (số đã tồn tại - fail)
- Test #3: Gửi OTP (reset - không có user - fail)
- Test #4: Gửi OTP (reset - user hợp lệ)
- Test #5: Xác minh OTP (mã sai)
- Test #6: Đăng nhập (mật khẩu sai)
- Test #7: Đăng nhập (thành công)
- Test #11: Lấy profile
- Test #12: Cập nhật profile
- Test #13: Lấy tất cả người dùng (admin)
- Test #14: Đăng ký người dùng mới

**Mong đợi**: Tất cả tests đều pass

### Kiểm Thử Thủ Công

**Quy trình test 1: Đăng ký**
```bash
# 1. Gửi OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+84123456789","purpose":"register"}'

# 2. Đăng ký với OTP
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"+84123456789","name":"Test","password":"Test@123","role":"user","otp":"123456"}'
```

**Quy trình test 2: Đăng nhập & Profile**
```bash
# 1. Đăng nhập
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+84123456789","password":"Test@123"}' \
  | jq -r '.token')

# 2. Lấy profile
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"

# 3. Cập nhật profile
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Updated"}'
```

**Quy trình test 3: Đặt lại mật khẩu**
```bash
# 1. Gửi OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+84123456789","purpose":"reset-password"}'

# 2. Đặt lại mật khẩu
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"phone":"+84123456789","otp":"123456","newPassword":"NewPass@123"}'

# 3. Đăng nhập với mật khẩu mới
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+84123456789","password":"NewPass@123"}'
```

---

## 📊 Chất Lượng Code

### Xác Thực

| Khía cạnh | Trạng thái | Bằng chứng |
|--------|--------|----------|
| Xác thực Input | ✅ | Tất cả endpoints xác thực input |
| Định dạng số điện thoại | ✅ | Định dạng +84XXXXXXXXX |
| Độ mạnh mật khẩu | ✅ | Tối thiểu 8 ký tự, độ phức tạp |
| Trường bắt buộc | ✅ | Tất cả đều được kiểm tra |
| Kiểu dữ liệu | ✅ | Xác thực kiểu |

### Xử Lý Lỗi

| Khía cạnh | Trạng thái | Bằng chứng |
|--------|--------|----------|
| Khối Try-Catch | ✅ | Tất cả controllers |
| Middleware xử lý lỗi | ✅ | Handler toàn cục |
| Mã trạng thái HTTP | ✅ | Mã phù hợp được sử dụng |
| Thông báo lỗi | ✅ | Rõ ràng, hữu ích |
| Không có Stack Traces | ✅ | An toàn cho production |

### Tích Hợp Database

| Khía cạnh | Trạng thái | Bằng chứng |
|--------|--------|----------|
| Mongoose Models | ✅ | User, OTP models |
| Thao tác CRUD | ✅ | Tất cả đã triển khai |
| Xác thực dữ liệu | ✅ | Xác thực schema |
| Indexes | ✅ | Phone unique |
| Transactions | N/A | Chưa cần thiết |

---

## 📸 Bằng Chứng Cần Hiển Thị

### 1. Triển Khai Code

**Files cần đánh giá**:
- `backend/src/routes/auth.routes.js`
- `backend/src/routes/user.routes.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/controllers/user.controller.js`

**Hiển thị**:
- Cấu trúc code sạch
- Xử lý lỗi phù hợp
- Xác thực request
- Định dạng response

### 2. Kết Quả Test

**Screenshot**:
- Chạy `.\test-api.ps1`
- Hiển thị tất cả tests pass
- Tỷ lệ thành công: 100%

### 3. Postman Collection

**Screenshots**:
- Tất cả 10 endpoints
- Responses thành công
- Responses lỗi
- Các kịch bản khác nhau

### 4. Database

**MongoDB Collections**:
- Users với dữ liệu phù hợp
- OTPs với thời gian hết hạn
- Mật khẩu đã hash
- Indexes đã tạo

---

## ✅ Tiêu Chí Chấp Nhận

- [x] Tất cả 10 endpoints đã triển khai
- [x] Xác thực request trên tất cả endpoints
- [x] Chuẩn hóa response
- [x] Xử lý lỗi cho tất cả các trường hợp
- [x] Routes được bảo vệ sử dụng auth middleware
- [x] Routes admin sử dụng authorization
- [x] Tích hợp database hoạt động
- [x] Hệ thống OTP hoạt động
- [x] Hash mật khẩu hoạt động
- [x] Tạo JWT tokens
- [x] Không có dữ liệu nhạy cảm trong responses
- [x] Tất cả tests tự động pass
- [x] Tests thủ công hoạt động
- [x] Tích hợp frontend hoạt động

---

## 📝 Ghi Chú Đánh Giá

### Điểm Mạnh
✅ Bao phủ endpoint đầy đủ  
✅ Định dạng response nhất quán  
✅ Xác thực toàn diện  
✅ Xử lý lỗi phù hợp  
✅ Áp dụng best practices bảo mật  
✅ Cấu trúc code sạch  
✅ Tách biệt các mối quan tâm tốt  

### Cải Thiện Tiềm Năng (Tương Lai)
⏳ Thêm phân trang cho danh sách người dùng  
⏳ Thêm lọc/tìm kiếm  
⏳ Thêm rate limiting cho request  
⏳ Thêm API versioning  
⏳ Thêm logging request  
⏳ Thêm tài liệu Swagger  

---

## ✍️ Xác Nhận

**Task #30: Xây Dựng API Endpoints**

**Người triển khai**: Đội phát triển  
**Ngày triển khai**: 06/01/2026

**Người kiểm thử**: _______________  
**Ngày kiểm thử**: _______________  
**Kết quả kiểm thử**: [ ] Pass / [ ] Fail

**Người đánh giá**: _______________  
**Ngày đánh giá**: _______________  
**Trạng thái**: [ ] Phê duyệt / [ ] Cần sửa đổi

**Nhận xét**:
```
[Ghi chú của người đánh giá ở đây]





```

**Chữ ký phê duyệt**: _______________  
**Ngày**: _______________

---

## 📚 Tài Liệu Liên Quan

- **Task #29**: `TASK_29_XAC_THUC_MIDDLEWARE.md`
- **Hướng dẫn đánh giá đầy đủ**: `TASK_REVIEW_GUIDE.md`
- **Tài liệu Backend**: `docs/BACKEND_DOCUMENTATION.md`
- **Ví dụ API**: `docs/API_EXAMPLES.md`
- **Script kiểm thử**: `backend/test-api.ps1`

---

**Trạng thái Task**: ✅ Sẵn sàng để đánh giá  
**Bước tiếp theo**: Chạy tests và đánh giá code  
**Thời gian đánh giá ước tính**: 30-40 phút

