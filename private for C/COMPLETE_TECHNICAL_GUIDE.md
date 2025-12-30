# 📘 HƯỚNG DẪN KỸ THUẬT TOÀN DIỆN - Shipway

## 📑 MỤC LỤC

1. [API Endpoints](#1-api-endpoints)
2. [Cấu trúc Dữ liệu Account](#2-cấu-trúc-dữ-liệu-account)
3. [Cơ sở Dữ liệu](#3-cơ-sở-dữ-liệu)
4. [Flow Đăng Ký](#4-flow-đăng-ký)
5. [Flow Đăng Nhập](#5-flow-đăng-nhập)
6. [Flow Quên Mật Khẩu](#6-flow-quên-mật-khẩu)
7. [Code Examples](#7-code-examples)

---

## 1. API ENDPOINTS

### Base URL
```
http://localhost:3000/api/v1
```

### 1.1. Request OTP
```http
POST /auth/otp/request
Content-Type: application/json

Body:
{
  "phoneNumber": "0912345678",
  "purpose": "register" | "login" | "reset_password"
}

Response Success (200):
{
  "success": true,
  "message": "Mã OTP đã được gửi đến số điện thoại +84912345678",
  "data": {
    "phoneNumber": "+84912345678",
    "expiresIn": 300
  }
}

Response Error (404 - for reset_password):
{
  "success": false,
  "message": "Số điện thoại chưa được đăng ký"
}
```

**Sử dụng trong:**
- Đăng ký: `purpose: "register"`
- Đăng nhập OTP: `purpose: "login"`
- Quên mật khẩu: `purpose: "reset_password"`

### 1.2. Register (Đăng ký)
```http
POST /auth/register
Content-Type: application/json

Body:
{
  "phoneNumber": "0912345678",
  "otpCode": "123456",
  "password": "password123",
  "fullName": "Nguyễn Văn A"
}

Response Success (201):
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

### 1.3. Login (Đăng nhập)
```http
POST /auth/login
Content-Type: application/json

Body (với password):
{
  "phoneNumber": "0912345678",
  "password": "password123"
}

Body (với OTP):
{
  "phoneNumber": "0912345678",
  "otpCode": "123456"
}

Response Success (200):
{
  "success": true,
  "message": "Đăng nhập thành công",
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

### 1.4. Get Profile (Lấy thông tin user)
```http
GET /auth/profile
Authorization: Bearer {accessToken}

Response Success (200):
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
      "lastLogin": "2025-12-30T10:30:00.000Z",
      "createdAt": "2025-12-25T08:00:00.000Z",
      "updatedAt": "2025-12-30T10:30:00.000Z"
    }
  }
}
```

### 1.5. Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

Body:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response Success (200):
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.6. Reset Password (Quên mật khẩu)
```http
POST /auth/password/reset
Content-Type: application/json

Body:
{
  "phoneNumber": "0912345678",
  "otpCode": "123456",
  "newPassword": "newpassword123"
}

Response Success (200):
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công"
}
```

---

## 2. CẤU TRÚC DỮ LIỆU ACCOUNT

### 2.1. User Schema (Collection: users)

```typescript
interface IUser {
  // === REQUIRED FIELDS ===
  _id: ObjectId;              // MongoDB auto-generated ID
  phoneNumber: string;        // "+84912345678" (E.164 format, UNIQUE)
  role: string;               // "driver" | "admin"
  status: string;             // "active" | "inactive" | "suspended"
  
  // === BOOLEAN FLAGS ===
  phoneNumberVerified: boolean; // true nếu đã verify OTP
  
  // === OPTIONAL FIELDS ===
  password?: string;          // Hashed với bcrypt, select: false
  fullName?: string;          // "Nguyễn Văn A"
  email?: string;             // "user@example.com"
  avatar?: string;            // URL to avatar image
  
  // === TIMESTAMPS ===
  lastLogin?: Date;           // Timestamp lần login cuối
  createdAt: Date;            // Auto-generated
  updatedAt: Date;            // Auto-updated
}
```

### 2.2. Chi tiết từng Field

| Field | Type | Required | Unique | Default | Mô tả |
|-------|------|----------|--------|---------|-------|
| **_id** | ObjectId | ✅ | ✅ | Auto | MongoDB ID |
| **phoneNumber** | String | ✅ | ✅ | - | Số điện thoại (E.164: +84...) |
| **phoneNumberVerified** | Boolean | ❌ | ❌ | false | Đã verify OTP? |
| **password** | String | ❌ | ❌ | - | Mật khẩu (hashed, hidden) |
| **fullName** | String | ❌ | ❌ | - | Họ và tên |
| **email** | String | ❌ | ❌ | - | Email (sparse index) |
| **avatar** | String | ❌ | ❌ | - | URL ảnh đại diện |
| **role** | Enum | ✅ | ❌ | "driver" | Vai trò: driver/admin |
| **status** | Enum | ✅ | ❌ | "active" | Trạng thái: active/inactive/suspended |
| **lastLogin** | Date | ❌ | ❌ | - | Thời gian login cuối |
| **createdAt** | Date | ✅ | ❌ | now | Ngày tạo tài khoản |
| **updatedAt** | Date | ✅ | ❌ | now | Ngày cập nhật cuối |

### 2.3. Sample User Document

```json
{
  "_id": ObjectId("65a1b2c3d4e5f6g7h8i9j0k1"),
  "phoneNumber": "+84912345678",
  "phoneNumberVerified": true,
  "password": "$2a$10$abcdefghijklmnopqrstuvwxyz123456789",
  "fullName": "Nguyễn Văn A",
  "email": "user@example.com",
  "avatar": "https://example.com/avatar.jpg",
  "role": "driver",
  "status": "active",
  "lastLogin": ISODate("2025-12-30T10:30:00.000Z"),
  "createdAt": ISODate("2025-12-25T08:00:00.000Z"),
  "updatedAt": ISODate("2025-12-30T10:30:00.000Z")
}
```

### 2.4. Các giá trị Enum

**Role:**
- `"driver"` - Tài xế (mặc định)
- `"admin"` - Quản trị viên

**Status:**
- `"active"` - Hoạt động (mặc định)
- `"inactive"` - Không hoạt động
- `"suspended"` - Bị khóa

---

## 3. CƠ SỞ DỮ LIỆU

### 3.1. Thông tin Database

```
Loại Database: MongoDB (NoSQL)
ODM: Mongoose
Database Name: shipway_driver
Connection String: mongodb://localhost:27017/shipway_driver
(hoặc MongoDB Atlas cho production)
```

### 3.2. Vị trí Database

**Development (Local):**
```
Server: localhost
Port: 27017
Database: shipway_driver
Full URI: mongodb://localhost:27017/shipway_driver
```

**Production (MongoDB Atlas):**
```
Server: MongoDB Atlas Cloud
Cluster: ac-0urlpta-shard-00-xx.sce3cel.mongodb.net
Database: shipway_driver
Full URI: mongodb+srv://username:password@cluster.mongodb.net/shipway_driver
```

### 3.3. Cấu hình trong Code

**File: `.env`**
```env
MONGODB_URI=mongodb://localhost:27017/shipway_driver
# hoặc
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/shipway_driver
```

**File: `src/config/database.ts`**
```typescript
import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI || 
                   'mongodb://localhost:27017/shipway_driver';
  
  await mongoose.connect(mongoUri);
  console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
};
```

### 3.4. Collections (Bảng)

Database có **2 collections**:

**1. users** (Lưu trữ vĩnh viễn)
- Lưu thông tin tài khoản người dùng
- Index: phoneNumber (unique)
- Index: email (sparse)

**2. otps** (Lưu trữ tạm thời)
- Lưu mã OTP
- TTL Index: Tự động xóa sau 5 phút
- Index: phoneNumber, purpose, verified

---

## 4. FLOW ĐĂNG KÝ

### 4.1. Tổng quan Flow

```
Client → Request OTP → Backend kiểm tra → Database → Gửi OTP →
Client nhập OTP → Backend verify → Database tạo user → Return tokens
```

### 4.2. Chi tiết từng bước

#### **Bước 1: Client Request OTP**

**Frontend:**
```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/otp/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '0912345678',
    purpose: 'register'
  })
});
```

#### **Bước 2: Backend xử lý**

**File: `src/controllers/auth.controller.ts`**
```typescript
export const requestOTP = async (req, res, next) => {
  const { phoneNumber, purpose } = req.body;
  
  // 1. Validate và format phone
  const formattedPhone = validateVietnamesePhone(phoneNumber);
  // "0912345678" → "+84912345678"
  
  // 2. GỌI DATABASE: Check user exists
  if (purpose === 'register') {
    const existingUser = await User.findOne({ 
      phoneNumber: formattedPhone 
    });
    
    if (existingUser) {
      throw createError('Số điện thoại đã được đăng ký', 409);
    }
  }
  
  // 3. GỌI DATABASE: Tạo OTP
  const result = await createAndSendOTP(formattedPhone, purpose);
  
  res.status(200).json({ success: true, message: result.message });
};
```

#### **Bước 3: Database Operations**

**Query 1: Check user exists**
```javascript
// File: src/controllers/auth.controller.ts
const existingUser = await User.findOne({ 
  phoneNumber: "+84912345678" 
});

// MongoDB query tương đương:
db.users.findOne({ phoneNumber: "+84912345678" })

// Result: null (chưa tồn tại) hoặc user document
```

**Query 2: Create OTP**
```javascript
// File: src/services/otp.service.ts
const code = generateOTP(); // "123456"
const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

const otpRecord = new OTP({
  phoneNumber: "+84912345678",
  code: "123456",
  purpose: "register",
  expiresAt: expiresAt,
  verified: false,
  attempts: 0
});

await otpRecord.save();

// MongoDB query tương đương:
db.otps.insertOne({
  phoneNumber: "+84912345678",
  code: "123456",
  purpose: "register",
  expiresAt: ISODate("2025-12-30T10:35:00Z"),
  verified: false,
  attempts: 0,
  createdAt: ISODate("2025-12-30T10:30:00Z")
})
```

#### **Bước 4: Client gửi OTP để đăng ký**

**Frontend:**
```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '0912345678',
    otpCode: '123456',
    password: 'password123',
    fullName: 'Nguyễn Văn A'
  })
});
```

#### **Bước 5: Backend verify OTP và tạo user**

**File: `src/controllers/auth.controller.ts`**
```typescript
export const register = async (req, res, next) => {
  const { phoneNumber, otpCode, password, fullName } = req.body;
  
  const formattedPhone = validateVietnamesePhone(phoneNumber);
  
  // 1. GỌI DATABASE: Verify OTP
  const otpResult = await verifyOTP(formattedPhone, otpCode, 'register');
  
  if (!otpResult.success) {
    throw createError(otpResult.message, 400);
  }
  
  // 2. GỌI DATABASE: Create user
  const user = new User({
    phoneNumber: formattedPhone,
    phoneNumberVerified: true,
    password: password, // Will be auto-hashed
    fullName: fullName,
    role: 'driver',
    status: 'active'
  });
  
  await user.save();
  
  // 3. Generate JWT tokens
  const tokens = generateTokenPair({
    userId: user._id.toString(),
    phoneNumber: user.phoneNumber,
    role: user.role
  });
  
  // 4. GỌI DATABASE: Update lastLogin
  user.lastLogin = new Date();
  await user.save();
  
  res.status(201).json({
    success: true,
    message: 'Đăng ký thành công',
    data: { user, tokens }
  });
};
```

#### **Bước 6: Database Operations**

**Query 3: Verify OTP**
```javascript
// File: src/services/otp.service.ts
const otpRecord = await OTP.findOne({
  phoneNumber: "+84912345678",
  code: "123456",
  purpose: "register",
  verified: false,
  expiresAt: { $gt: new Date() }
}).sort({ createdAt: -1 });

// MongoDB query:
db.otps.findOne({
  phoneNumber: "+84912345678",
  code: "123456",
  purpose: "register",
  verified: false,
  expiresAt: { $gt: ISODate("2025-12-30T10:30:00Z") }
}).sort({ createdAt: -1 })

// Update OTP to verified
otpRecord.verified = true;
await otpRecord.save();

// MongoDB query:
db.otps.updateOne(
  { _id: otpRecord._id },
  { $set: { verified: true } }
)
```

**Query 4: Create User**
```javascript
// File: src/controllers/auth.controller.ts
const user = new User({
  phoneNumber: "+84912345678",
  phoneNumberVerified: true,
  password: "password123", // Will be hashed by pre-save hook
  fullName: "Nguyễn Văn A",
  role: "driver",
  status: "active"
});

await user.save();

// MongoDB query sau khi hash password:
db.users.insertOne({
  phoneNumber: "+84912345678",
  phoneNumberVerified: true,
  password: "$2a$10$abcdef...", // Hashed
  fullName: "Nguyễn Văn A",
  role: "driver",
  status: "active",
  lastLogin: ISODate("2025-12-30T10:30:00Z"),
  createdAt: ISODate("2025-12-30T10:30:00Z"),
  updatedAt: ISODate("2025-12-30T10:30:00Z")
})
```

---

## 5. FLOW ĐĂNG NHẬP

### 5.1. Tổng quan Flow

```
Client gửi phone + password → Backend tìm user → 
Database verify password → Update lastLogin → Return tokens
```

### 5.2. Chi tiết từng bước

#### **Bước 1: Client gửi request**

**Frontend:**
```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '0912345678',
    password: 'password123'
  })
});
```

#### **Bước 2: Backend xử lý**

**File: `src/controllers/auth.controller.ts`**
```typescript
export const login = async (req, res, next) => {
  const { phoneNumber, password } = req.body;
  
  const formattedPhone = validateVietnamesePhone(phoneNumber);
  
  // 1. GỌI DATABASE: Find user (include password)
  const user = await User.findOne({ 
    phoneNumber: formattedPhone 
  }).select('+password');
  
  if (!user) {
    throw createError('Số điện thoại chưa được đăng ký', 404);
  }
  
  // 2. Check user status
  if (user.status !== 'active') {
    throw createError('Tài khoản đã bị khóa', 403);
  }
  
  // 3. Verify password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    throw createError('Mật khẩu không đúng', 401);
  }
  
  // 4. Generate tokens
  const tokens = generateTokenPair({
    userId: user._id.toString(),
    phoneNumber: user.phoneNumber,
    role: user.role
  });
  
  // 5. GỌI DATABASE: Update lastLogin
  user.lastLogin = new Date();
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Đăng nhập thành công',
    data: { user, tokens }
  });
};
```

#### **Bước 3: Database Operations**

**Query 1: Find user**
```javascript
// Mongoose
const user = await User.findOne({ 
  phoneNumber: "+84912345678" 
}).select('+password');

// MongoDB query:
db.users.findOne({ 
  phoneNumber: "+84912345678" 
})

// Result: User document với password field
{
  _id: ObjectId("..."),
  phoneNumber: "+84912345678",
  password: "$2a$10$abcdef...",
  fullName: "Nguyễn Văn A",
  role: "driver",
  status: "active",
  // ...
}
```

**Query 2: Verify password**
```javascript
// File: src/models/User.model.ts
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Usage:
const isValid = await user.comparePassword("password123");
// Returns: true or false
```

**Query 3: Update lastLogin**
```javascript
// Mongoose
user.lastLogin = new Date();
await user.save();

// MongoDB query:
db.users.updateOne(
  { _id: ObjectId("...") },
  { 
    $set: { 
      lastLogin: ISODate("2025-12-30T11:00:00Z"),
      updatedAt: ISODate("2025-12-30T11:00:00Z")
    }
  }
)
```

---

## 6. FLOW QUÊN MẬT KHẨU

### 6.1. Tổng quan Flow

```
Client gửi phone → Backend CHECK user tồn tại → 
Database tạo OTP → Client gửi OTP + new password → 
Backend verify OTP → Database update password
```

### 6.2. Chi tiết từng bước

#### **Bước 1: Request OTP**

**Frontend:**
```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/otp/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '0912345678',
    purpose: 'reset_password'
  })
});
```

#### **Bước 2: Backend kiểm tra**

**File: `src/controllers/auth.controller.ts`**
```typescript
export const requestOTP = async (req, res, next) => {
  const { phoneNumber, purpose } = req.body;
  
  const formattedPhone = validateVietnamesePhone(phoneNumber);
  
  // GỌI DATABASE: Check user exists (QUAN TRỌNG!)
  if (purpose === 'reset_password') {
    const user = await User.findOne({ 
      phoneNumber: formattedPhone 
    });
    
    if (!user) {
      // Số điện thoại chưa đăng ký
      throw createError('Số điện thoại chưa được đăng ký', 404);
    }
  }
  
  // Tạo OTP
  const result = await createAndSendOTP(formattedPhone, purpose);
  
  res.status(200).json({ success: true, message: result.message });
};
```

#### **Bước 3: Database Operations - Check User**

```javascript
// Mongoose
const user = await User.findOne({ 
  phoneNumber: "+84912345678" 
});

// MongoDB query:
db.users.findOne({ 
  phoneNumber: "+84912345678" 
})

// Result:
// - null → Error 404 "Số điện thoại chưa được đăng ký"
// - User document → Continue to create OTP
```

#### **Bước 4: Client reset password**

**Frontend:**
```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/password/reset', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '0912345678',
    otpCode: '123456',
    newPassword: 'newpassword123'
  })
});
```

#### **Bước 5: Backend verify và update**

**File: `src/controllers/auth.controller.ts`**
```typescript
export const resetPassword = async (req, res, next) => {
  const { phoneNumber, otpCode, newPassword } = req.body;
  
  const formattedPhone = validateVietnamesePhone(phoneNumber);
  
  // 1. GỌI DATABASE: Find user
  const user = await User.findOne({ 
    phoneNumber: formattedPhone 
  }).select('+password');
  
  if (!user) {
    throw createError('Số điện thoại chưa được đăng ký', 404);
  }
  
  // 2. GỌI DATABASE: Verify OTP
  const otpResult = await verifyOTP(
    formattedPhone, 
    otpCode, 
    'reset_password'
  );
  
  if (!otpResult.success) {
    throw createError(otpResult.message, 400);
  }
  
  // 3. Validate new password
  if (newPassword.length < 6) {
    throw createError('Mật khẩu mới phải có ít nhất 6 ký tự', 400);
  }
  
  // 4. GỌI DATABASE: Update password
  user.password = newPassword; // Will be auto-hashed
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Đặt lại mật khẩu thành công'
  });
};
```

#### **Bước 6: Database Operations**

**Query 1: Find user**
```javascript
// Mongoose
const user = await User.findOne({ 
  phoneNumber: "+84912345678" 
}).select('+password');

// MongoDB query:
db.users.findOne({ phoneNumber: "+84912345678" })
```

**Query 2: Verify OTP**
```javascript
// File: src/services/otp.service.ts
const otpRecord = await OTP.findOne({
  phoneNumber: "+84912345678",
  code: "123456",
  purpose: "reset_password",
  verified: false,
  expiresAt: { $gt: new Date() }
});

// MongoDB query:
db.otps.findOne({
  phoneNumber: "+84912345678",
  code: "123456",
  purpose: "reset_password",
  verified: false,
  expiresAt: { $gt: ISODate() }
})
```

**Query 3: Update password**
```javascript
// Mongoose (với pre-save hook tự động hash)
user.password = "newpassword123";
await user.save();

// MongoDB query (sau khi hash):
db.users.updateOne(
  { _id: ObjectId("...") },
  { 
    $set: { 
      password: "$2a$10$NEW_HASHED_PASSWORD...",
      updatedAt: ISODate("2025-12-30T11:30:00Z")
    }
  }
)
```

---

## 7. CODE EXAMPLES

### 7.1. Mongoose Model Definitions

**File: `src/models/User.model.ts`**
```typescript
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumberVerified: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    select: false, // Không return mặc định
    minlength: 6
  },
  fullName: String,
  email: String,
  avatar: String,
  role: {
    type: String,
    enum: ['driver', 'admin'],
    default: 'driver'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: Date
}, {
  timestamps: true // Auto create createdAt, updatedAt
});

// Pre-save hook: Hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method: Compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', UserSchema);
```

### 7.2. Database Connection

**File: `src/config/database.ts`**
```typescript
import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 
                     'mongodb://localhost:27017/shipway_driver';
    
    const conn = await mongoose.connect(mongoUri);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
};
```

### 7.3. Direct MongoDB Queries

```javascript
// Connect to MongoDB via mongosh
mongosh "mongodb://localhost:27017/shipway_driver"

// 1. Find user by phone
db.users.findOne({ phoneNumber: "+84912345678" })

// 2. Find all active users
db.users.find({ status: "active" })

// 3. Count users
db.users.countDocuments()

// 4. Find user with specific fields only
db.users.findOne(
  { phoneNumber: "+84912345678" },
  { phoneNumber: 1, fullName: 1, role: 1 }
)

// 5. Update user status
db.users.updateOne(
  { phoneNumber: "+84912345678" },
  { $set: { status: "suspended" } }
)

// 6. Find valid OTPs
db.otps.find({
  verified: false,
  expiresAt: { $gt: new Date() }
})

// 7. Delete expired OTPs
db.otps.deleteMany({
  expiresAt: { $lt: new Date() }
})

// 8. Aggregate users by role
db.users.aggregate([
  { $group: { _id: "$role", count: { $sum: 1 } } }
])
```

---

## 📊 TÓM TẮT

### API Endpoints
- `/auth/otp/request` - Request OTP
- `/auth/register` - Đăng ký
- `/auth/login` - Đăng nhập
- `/auth/profile` - Lấy thông tin
- `/auth/refresh` - Refresh token
- `/auth/password/reset` - Reset mật khẩu

### Database Collections
- `users` - Lưu trữ vĩnh viễn
- `otps` - Tự động xóa sau 5 phút

### Database Location
- Development: `mongodb://localhost:27017/shipway_driver`
- Production: MongoDB Atlas

### Các Database Operations
1. **Đăng ký**: `findOne` (check) → `insertOne` (OTP) → `insertOne` (user)
2. **Đăng nhập**: `findOne` (user) → `updateOne` (lastLogin)
3. **Quên MK**: `findOne` (check user) → `insertOne` (OTP) → `updateOne` (password)

---

**Version:** 1.0.0  
**Date:** 30/12/2025  
**Complete Technical Documentation**

