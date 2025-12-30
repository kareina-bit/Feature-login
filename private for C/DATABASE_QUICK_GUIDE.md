# 🗄️ Database Quick Guide

## 📊 2 Collections

```
MongoDB: shipway_driver
│
├── users        → Lưu thông tin người dùng (vĩnh viễn)
└── otps         → Lưu mã OTP (tự xóa sau 5 phút)
```

---

## 👤 Collection: USERS

**Lưu gì?**
- Số điện thoại (unique)
- Password (hashed)
- Thông tin cá nhân
- Trạng thái tài khoản

**Sample:**
```json
{
  "_id": "...",
  "phoneNumber": "+84912345678",
  "password": "$2a$10$...hashed...",
  "fullName": "Nguyễn Văn A",
  "role": "driver",
  "status": "active",
  "phoneNumberVerified": true,
  "lastLogin": "2025-12-30T10:00:00Z",
  "createdAt": "2025-12-25T08:00:00Z"
}
```

---

## 🔑 Collection: OTPS

**Lưu gì?**
- Mã OTP tạm thời
- Số điện thoại nhận OTP
- Mục đích (register/login/reset_password)
- Thời gian hết hạn

**Sample:**
```json
{
  "_id": "...",
  "phoneNumber": "+84912345678",
  "code": "123456",
  "purpose": "register",
  "expiresAt": "2025-12-30T10:35:00Z",
  "verified": false,
  "attempts": 0
}
```

**⏰ Tự động xóa:** Sau 5 phút (TTL index)

---

## 🔄 Flow 1: ĐĂNG KÝ

```
1. Client gửi phone → Backend
   ↓
2. Backend check: db.users.findOne({ phone })
   ❌ Exists → Error "Đã đăng ký"
   ✅ Not exists → Continue
   ↓
3. Tạo OTP: db.otps.insertOne({ phone, code, purpose: "register" })
   ↓
4. Gửi SMS
   ↓
5. Client gửi OTP + info
   ↓
6. Backend verify OTP: db.otps.findOne({ phone, code, verified: false })
   ↓
7. Tạo user: db.users.insertOne({ phone, password, ... })
   ↓
8. Return JWT tokens
```

**Database thay đổi:**
- ✅ Thêm 1 document vào `users`
- ✅ Update OTP: `verified: true`
- ⏰ OTP tự xóa sau 5 phút

---

## 🔄 Flow 2: ĐĂNG NHẬP

```
1. Client gửi phone + password
   ↓
2. Backend find user: db.users.findOne({ phone }).select('+password')
   ❌ Not found → Error "Chưa đăng ký"
   ↓
3. Verify password: bcrypt.compare(input, user.password)
   ❌ Wrong → Error "Sai mật khẩu"
   ↓
4. Update: db.users.updateOne({ _id }, { lastLogin: now })
   ↓
5. Return JWT tokens
```

**Database thay đổi:**
- ✅ Update `lastLogin` trong user document
- ✅ Update `updatedAt`

---

## 🔄 Flow 3: QUÊN MẬT KHẨU

### Bước 1: Request OTP

```
1. Client gửi phone + purpose: "reset_password"
   ↓
2. Backend check: db.users.findOne({ phone })
   ❌ Not found → Error "SĐT chưa đăng ký" ← KEY CHECK
   ✅ Found → Continue
   ↓
3. Tạo OTP: db.otps.insertOne({ phone, code, purpose: "reset_password" })
   ↓
4. Gửi SMS
```

**Database thay đổi:**
- ✅ Thêm 1 OTP document

### Bước 2: Reset Password

```
1. Client gửi phone + OTP + newPassword
   ↓
2. Backend verify OTP
   ↓
3. Update: db.users.updateOne({ phone }, { password: hashed })
   ↓
4. Return success
```

**Database thay đổi:**
- ✅ Update `password` field (hashed)
- ✅ Update `updatedAt`

---

## 🔍 Check Database

### View Users
```bash
mongosh "mongodb://localhost:27017/shipway_driver"

# List all users
db.users.find().pretty()

# Count users
db.users.countDocuments()

# Find specific user
db.users.findOne({ phoneNumber: "+84912345678" })
```

### View OTPs
```bash
# List all OTPs
db.otps.find().pretty()

# Find OTP for phone
db.otps.find({ phoneNumber: "+84912345678" })

# Find valid OTPs
db.otps.find({ 
  verified: false, 
  expiresAt: { $gt: new Date() } 
})
```

---

## 🔐 Security

### Password
- ✅ Auto-hashed với bcrypt (10 salt rounds)
- ✅ Không return trong queries (select: false)
- ✅ Chỉ compare, không show plain text

### OTP
- ✅ Tự động xóa sau 5 phút
- ✅ Max 5 attempts
- ✅ Purpose-specific (register/login/reset)

### Phone
- ✅ Unique constraint
- ✅ Format validation
- ✅ Auto convert to E.164: +84xxxxxxxxx

---

## 📊 Database Stats

```javascript
// Via mongosh
db.users.stats()
db.otps.stats()

// Total documents
db.users.countDocuments()  // Số user đã đăng ký
db.otps.countDocuments()   // Số OTP đang active

// Recent activity
db.users.find().sort({ lastLogin: -1 }).limit(5)
```

---

## 🛠️ Quick Commands

### Add test user manually
```javascript
db.users.insertOne({
  phoneNumber: "+84912345678",
  phoneNumberVerified: true,
  password: "$2a$10$abcdef...",  // Use bcrypt to hash first
  fullName: "Test User",
  role: "driver",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Clear all OTPs
```javascript
db.otps.deleteMany({})
```

### Reset user password
```javascript
// Note: Password phải hash trước
const bcrypt = require('bcryptjs');
const hashed = await bcrypt.hash('newpassword', 10);

db.users.updateOne(
  { phoneNumber: "+84912345678" },
  { $set: { password: hashed } }
)
```

---

## 📈 Monitoring

### Active users
```javascript
db.users.find({ status: "active" }).count()
```

### Recent OTPs
```javascript
db.otps.find().sort({ createdAt: -1 }).limit(10)
```

### Users by role
```javascript
db.users.aggregate([
  { $group: { _id: "$role", count: { $sum: 1 } } }
])
```

---

## ✅ Summary

| Action | Users Collection | OTPs Collection |
|--------|-----------------|-----------------|
| Register | INSERT (new user) | INSERT (OTP) → Auto-delete |
| Login | UPDATE (lastLogin) | - |
| Reset Password | UPDATE (password) | INSERT (OTP) → Auto-delete |

**Key Points:**
- Users: Persistent data
- OTPs: Temporary (5 minutes)
- Auto-cleanup via TTL index
- Password always hashed
- Phone numbers unique

---

**For detailed flow: See `DATABASE_WORKFLOW.md`**

