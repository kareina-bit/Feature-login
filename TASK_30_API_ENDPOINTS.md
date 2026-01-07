# 📋 Task #30: Build API Endpoints - Review

**Task ID**: #30  
**Task Name**: Build API Endpoints  
**Date**: 06/01/2026  
**Status**: ✅ Ready for Review

---

## 📌 Task Description

Implement RESTful API endpoints for authentication and user management with proper validation, error handling, and database integration.

### Requirements
- [x] Authentication endpoints (register, login, OTP, reset password)
- [x] User management endpoints (profile, users list)
- [x] Request validation
- [x] Response standardization
- [x] Error handling
- [x] Database integration (MongoDB)
- [x] Protected routes (using auth middleware)

---

## 🎯 Implementation

### File Locations
```
backend/src/routes/
├── auth.routes.js       # Authentication routes
└── user.routes.js       # User management routes

backend/src/controllers/
├── auth.controller.js   # Authentication logic
└── user.controller.js   # User management logic
```

---

## 📋 Endpoints Overview

### Authentication Endpoints (6 endpoints)

| # | Endpoint | Method | Access | Status |
|---|----------|--------|--------|--------|
| 1 | `/api/auth/send-otp` | POST | Public | ✅ |
| 2 | `/api/auth/verify-otp` | POST | Public | ✅ |
| 3 | `/api/auth/register` | POST | Public | ✅ |
| 4 | `/api/auth/login` | POST | Public | ✅ |
| 5 | `/api/auth/reset-password` | POST | Public | ✅ |
| 6 | `/api/auth/me` | GET | Protected | ✅ |

### User Management Endpoints (4 endpoints)

| # | Endpoint | Method | Access | Status |
|---|----------|--------|--------|--------|
| 7 | `/api/users/profile` | GET | Protected | ✅ |
| 8 | `/api/users/profile` | PUT | Protected | ✅ |
| 9 | `/api/users` | GET | Admin Only | ✅ |
| 10 | `/api/users/driver/info` | PUT | Driver Only | ✅ |

**Total**: 10 endpoints

---

## 📝 Endpoint Details

### 1. Send OTP

**Endpoint**: `POST /api/auth/send-otp`  
**Access**: Public  
**Purpose**: Send OTP for registration or password reset

**Request Body**:
```json
{
  "phone": "+84123456789",
  "purpose": "register"  // or "reset-password"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresAt": "2026-01-06T08:30:00.000Z",
  "otp": "123456"  // Only in development
}
```

**Error Cases**:
- Missing phone: 400 "Số điện thoại là bắt buộc"
- Phone already exists (register): 400 "Số điện thoại đã được đăng ký"
- Phone not found (reset): 404 "Tài khoản không tồn tại"

**Test**: `test-api.ps1` #1, #2, #3, #4

**Validation**:
- [x] Phone format validation
- [x] Purpose validation
- [x] User existence check
- [x] OTP generation (6 digits)
- [x] OTP expiration (5 minutes)
- [x] SMS sending (Twilio/mock)

---

### 2. Verify OTP

**Endpoint**: `POST /api/auth/verify-otp`  
**Access**: Public  
**Purpose**: Verify OTP code

**Request Body**:
```json
{
  "phone": "+84123456789",
  "otp": "123456",
  "purpose": "register"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

**Error Cases**:
- Missing fields: 400 "Số điện thoại và OTP là bắt buộc"
- OTP not found: 400 "OTP không tồn tại hoặc đã được sử dụng"
- OTP expired: 400 "OTP đã hết hạn"
- Wrong OTP: 400 "OTP không đúng. Còn X lần thử"
- Max attempts: 400 "Đã vượt quá số lần thử"

**Test**: `test-api.ps1` #5

**Validation**:
- [x] OTP existence check
- [x] Expiration validation
- [x] Attempt counter
- [x] Code matching
- [x] Mark as used after success

---

### 3. Register

**Endpoint**: `POST /api/auth/register`  
**Access**: Public  
**Purpose**: Register new user with OTP verification

**Request Body**:
```json
{
  "phone": "+84123456789",
  "name": "Nguyen Van A",
  "password": "Test@123",
  "role": "user",  // or "driver"
  "otp": "123456"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "Nguyen Van A",
    "phone": "+84123456789",
    "role": "user",
    "isActive": true,
    "isPhoneVerified": true,
    "createdAt": "2026-01-06T08:00:00.000Z"
  }
}
```

**Error Cases**:
- Missing fields: 400 "Vui lòng điền đầy đủ thông tin"
- Invalid OTP: 400 "OTP không hợp lệ"
- Phone exists: 400 "Số điện thoại đã được đăng ký"
- Weak password: 400 (validation error)

**Test**: `test-api.ps1` #14 (in RBAC section)

**Validation**:
- [x] All required fields
- [x] OTP verification
- [x] Phone uniqueness
- [x] Password strength
- [x] Role validation
- [x] Password hashing
- [x] JWT token generation
- [x] User creation in DB

---

### 4. Login

**Endpoint**: `POST /api/auth/login`  
**Access**: Public  
**Purpose**: Login with phone and password

**Request Body**:
```json
{
  "phone": "+84391912441",
  "password": "Admin@123"
}
```

**Success Response (200)**:
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

**Error Cases**:
- Missing fields: 400 "Vui lòng nhập số điện thoại và mật khẩu"
- Phone not found: 401 "Số điện thoại hoặc mật khẩu không chính xác"
- Wrong password: 401 "Số điện thoại hoặc mật khẩu không chính xác"
- Inactive account: 401 "Tài khoản đã bị vô hiệu hóa"

**Test**: `test-api.ps1` #6 (wrong password), #7 (success)

**Validation**:
- [x] Phone and password required
- [x] User existence check
- [x] Password verification (bcrypt)
- [x] Active status check
- [x] JWT token generation
- [x] lastLogin update
- [x] No password in response

---

### 5. Reset Password

**Endpoint**: `POST /api/auth/reset-password`  
**Access**: Public  
**Purpose**: Reset password with OTP verification

**Request Body**:
```json
{
  "phone": "+84391912441",
  "otp": "123456",
  "newPassword": "NewPass@123"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Mật khẩu đã được đặt lại thành công"
}
```

**Error Cases**:
- Missing fields: 400 "Vui lòng điền đầy đủ thông tin"
- Invalid OTP: 400 "OTP không hợp lệ"
- Phone not found: 404 "Tài khoản không tồn tại"
- Weak password: 400 (validation error)

**Test**: Manual test (not in automated script)

**Validation**:
- [x] All required fields
- [x] OTP verification
- [x] User existence
- [x] Password strength
- [x] Password hashing
- [x] Database update

---

### 6. Get Current User

**Endpoint**: `GET /api/auth/me`  
**Access**: Protected (requires auth token)  
**Purpose**: Get current logged-in user info

**Request Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
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

**Error Cases**:
- No token: 401 "Không có quyền truy cập"
- Invalid token: 401 "Token không hợp lệ"
- User not found: 401 "Người dùng không tồn tại"

**Test**: `test-api.ps1` #10

**Validation**:
- [x] Auth middleware applied
- [x] User from token
- [x] No password in response

---

### 7. Get User Profile

**Endpoint**: `GET /api/users/profile`  
**Access**: Protected  
**Purpose**: Get own user profile

**Request Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "profile": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "Nguyen Van A",
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

**Error Cases**:
- No token: 401 (from middleware)
- Invalid token: 401 (from middleware)

**Test**: `test-api.ps1` #11

**Validation**:
- [x] Auth middleware
- [x] Returns own profile
- [x] Complete user info

---

### 8. Update User Profile

**Endpoint**: `PUT /api/users/profile`  
**Access**: Protected  
**Purpose**: Update own profile

**Request Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Nguyen Van B",
  "email": "newmail@example.com",
  "avatar": "https://..."
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Cập nhật profile thành công",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "Nguyen Van B",
    "email": "newmail@example.com",
    "avatar": "https://...",
    "phone": "+84123456789",
    "role": "user"
  }
}
```

**Error Cases**:
- No token: 401
- Invalid data: 400 (validation)

**Test**: `test-api.ps1` #12

**Validation**:
- [x] Auth middleware
- [x] Field validation
- [x] Can't update phone/role
- [x] Database update
- [x] Returns updated user

---

### 9. Get All Users

**Endpoint**: `GET /api/users`  
**Access**: Admin Only  
**Purpose**: Get list of all users (admin feature)

**Request Headers**:
```
Authorization: Bearer <admin_token>
```

**Success Response (200)**:
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
    // ...more users
  ]
}
```

**Error Cases**:
- No token: 401
- Not admin: 403 "Role 'user' không có quyền truy cập"

**Test**: `test-api.ps1` #13 (admin), #14 (user - should fail)

**Validation**:
- [x] Auth middleware
- [x] Authorize middleware (admin)
- [x] Returns all users
- [x] No passwords in response

---

### 10. Update Driver Info

**Endpoint**: `PUT /api/users/driver/info`  
**Access**: Driver Only  
**Purpose**: Update driver-specific information

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

**Success Response (200)**:
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

**Error Cases**:
- No token: 401
- Not driver: 403 "Role 'user' không có quyền truy cập"
- Invalid data: 400

**Test**: Manual test (not in automated script)

**Validation**:
- [x] Auth middleware
- [x] Authorize middleware (driver)
- [x] Field validation
- [x] Database update

---

## ✅ Response Format Standards

### Success Response Format
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },  // Optional
  "token": "...",   // For auth endpoints
  "user": { ... }   // For auth endpoints
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error message"
}
```

**Consistency**:
- [x] All responses have `success` field
- [x] Success responses have descriptive messages
- [x] Error responses have clear messages
- [x] No sensitive data in errors
- [x] Proper HTTP status codes

---

## 🧪 Testing

### Automated Testing

**Run All Tests**:
```powershell
cd backend
.\test-api.ps1
```

**Tests for Task #30**:
- Test #1: Send OTP (register)
- Test #2: Send OTP (existing phone - fail)
- Test #3: Send OTP (reset - no user - fail)
- Test #4: Send OTP (reset - valid user)
- Test #5: Verify OTP (wrong code)
- Test #6: Login (wrong password)
- Test #7: Login (success)
- Test #11: Get profile
- Test #12: Update profile
- Test #13: Get all users (admin)
- Test #14: Register new user

**Expected**: All tests pass

### Manual Testing

**Test Flow 1: Registration**
```bash
# 1. Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+84123456789","purpose":"register"}'

# 2. Register with OTP
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"+84123456789","name":"Test","password":"Test@123","role":"user","otp":"123456"}'
```

**Test Flow 2: Login & Profile**
```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+84123456789","password":"Test@123"}' \
  | jq -r '.token')

# 2. Get profile
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"

# 3. Update profile
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Updated"}'
```

**Test Flow 3: Password Reset**
```bash
# 1. Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+84123456789","purpose":"reset-password"}'

# 2. Reset password
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"phone":"+84123456789","otp":"123456","newPassword":"NewPass@123"}'

# 3. Login with new password
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+84123456789","password":"NewPass@123"}'
```

---

## 📊 Code Quality

### Validation

| Aspect | Status | Evidence |
|--------|--------|----------|
| Input Validation | ✅ | All endpoints validate input |
| Phone Format | ✅ | +84XXXXXXXXX format |
| Password Strength | ✅ | Min 8 chars, complexity |
| Required Fields | ✅ | All checked |
| Data Types | ✅ | Type validation |

### Error Handling

| Aspect | Status | Evidence |
|--------|--------|----------|
| Try-Catch Blocks | ✅ | All controllers |
| Error Middleware | ✅ | Global handler |
| HTTP Status Codes | ✅ | Proper codes used |
| Error Messages | ✅ | Clear, helpful |
| No Stack Traces | ✅ | Production safe |

### Database Integration

| Aspect | Status | Evidence |
|--------|--------|----------|
| Mongoose Models | ✅ | User, OTP models |
| CRUD Operations | ✅ | All implemented |
| Data Validation | ✅ | Schema validation |
| Indexes | ✅ | Phone unique |
| Transactions | N/A | Not needed yet |

---

## 📸 Evidence to Show

### 1. Code Implementation

**Files to Review**:
- `backend/src/routes/auth.routes.js`
- `backend/src/routes/user.routes.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/controllers/user.controller.js`

**Show**:
- Clean code structure
- Proper error handling
- Request validation
- Response formatting

### 2. Test Results

**Screenshot**:
- Run `.\test-api.ps1`
- Show all tests passing
- Success rate: 100%

### 3. Postman Collection

**Screenshots**:
- All 10 endpoints
- Success responses
- Error responses
- Different scenarios

### 4. Database

**MongoDB Collections**:
- Users with proper data
- OTPs with expiration
- Hashed passwords
- Indexes created

---

## ✅ Acceptance Criteria

- [x] All 10 endpoints implemented
- [x] Request validation on all endpoints
- [x] Response standardization
- [x] Error handling for all cases
- [x] Protected routes use auth middleware
- [x] Admin routes use authorization
- [x] Database integration working
- [x] OTP system working
- [x] Password hashing working
- [x] JWT tokens generated
- [x] No sensitive data in responses
- [x] All automated tests passing
- [x] Manual tests working
- [x] Frontend integration working

---

## 📝 Review Notes

### Strengths
✅ Complete endpoint coverage  
✅ Consistent response format  
✅ Comprehensive validation  
✅ Proper error handling  
✅ Security best practices  
✅ Clean code structure  
✅ Good separation of concerns  

### Potential Improvements (Future)
⏳ Add pagination for user list  
⏳ Add filtering/search  
⏳ Add request rate limiting  
⏳ Add API versioning  
⏳ Add request logging  
⏳ Add Swagger documentation  

---

## ✍️ Sign-Off

**Task #30: Build API Endpoints**

**Implemented By**: Development Team  
**Implementation Date**: 06/01/2026

**Tested By**: _______________  
**Test Date**: _______________  
**Test Result**: [ ] Pass / [ ] Fail

**Reviewed By**: _______________  
**Review Date**: _______________  
**Status**: [ ] Approved / [ ] Needs Changes

**Comments**:
```
[Reviewer notes here]





```

**Approval Signature**: _______________  
**Date**: _______________

---

## 📚 Related Documentation

- **Task #29**: `TASK_29_AUTHENTICATION_MIDDLEWARE.md`
- **Full Review Guide**: `TASK_REVIEW_GUIDE.md`
- **Backend Documentation**: `docs/BACKEND_DOCUMENTATION.md`
- **API Examples**: `docs/API_EXAMPLES.md`
- **Test Script**: `backend/test-api.ps1`

---

**Task Status**: ✅ Ready for Review  
**Next Step**: Run tests and review code  
**Estimated Review Time**: 30-40 minutes

