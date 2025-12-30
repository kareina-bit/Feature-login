# 📊 TÓM TẮT KỸ THUẬT TRỰC QUAN

## 🎯 1. API ENDPOINTS (6 endpoints)

```
http://localhost:3000/api/v1/auth/
│
├── POST /otp/request        → Request OTP (register/login/reset_password)
├── POST /register           → Đăng ký user mới
├── POST /login              → Đăng nhập (password hoặc OTP)
├── GET  /profile            → Lấy thông tin user (cần token)
├── POST /refresh            → Refresh access token
└── POST /password/reset     → Reset mật khẩu (với OTP)
```

---

## 📦 2. DỮ LIỆU ACCOUNT (12 trường)

```typescript
User {
  // IDs
  _id: "65a1b2c3..."              // MongoDB ID
  
  // Authentication
  phoneNumber: "+84912345678"     // ✅ UNIQUE, REQUIRED
  password: "$2a$10$..."          // ✅ Hashed, Hidden
  phoneNumberVerified: true       // Boolean
  
  // Personal Info
  fullName: "Nguyễn Văn A"        // Optional
  email: "user@example.com"       // Optional
  avatar: "https://..."           // Optional (URL)
  
  // Role & Status
  role: "driver"                  // driver | admin
  status: "active"                // active | inactive | suspended
  
  // Timestamps
  lastLogin: "2025-12-30T10:30Z"  // Date
  createdAt: "2025-12-25T08:00Z"  // Auto
  updatedAt: "2025-12-30T10:30Z"  // Auto
}
```

---

## 🗄️ 3. CƠ SỞ DỮ LIỆU

### Vị trí Database

```
┌─────────────────────────────────────────────┐
│  DEVELOPMENT (Local)                        │
│  ├── Server: localhost                      │
│  ├── Port: 27017                            │
│  ├── Database: shipway_driver               │
│  └── URI: mongodb://localhost:27017/...    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  PRODUCTION (Cloud)                         │
│  ├── Server: MongoDB Atlas                  │
│  ├── Cluster: ac-0urlpta-...mongodb.net    │
│  ├── Database: shipway_driver               │
│  └── URI: mongodb+srv://user:pass@...      │
└─────────────────────────────────────────────┘
```

### Collections (2 bảng)

```
shipway_driver/
│
├── users (Permanent)
│   ├── Documents: User accounts
│   ├── Index: phoneNumber (unique)
│   └── Size: ~500 bytes/document
│
└── otps (Temporary - auto delete after 5 min)
    ├── Documents: OTP codes
    ├── TTL Index: expiresAt
    └── Size: ~200 bytes/document
```

---

## 🔄 4. FLOW ĐĂNG KÝ (6 bước)

```
┌─────────────────────────────────────────────────────┐
│ 1. CLIENT → API                                     │
│    POST /auth/otp/request                           │
│    { phone: "0912345678", purpose: "register" }     │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 2. BACKEND → DATABASE                               │
│    Query: db.users.findOne({ phone })               │
│    Result: null (chưa tồn tại) ✅                   │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 3. BACKEND → DATABASE                               │
│    Insert: db.otps.insertOne({                      │
│      phone, code: "123456", purpose: "register"     │
│    })                                                │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 4. CLIENT → API (với OTP)                           │
│    POST /auth/register                              │
│    { phone, otp: "123456", password, name }         │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 5. BACKEND → DATABASE                               │
│    Query: db.otps.findOne({ phone, code, ... })     │
│    Result: OTP valid ✅                             │
│    Update: db.otps.updateOne({ verified: true })    │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 6. BACKEND → DATABASE                               │
│    Insert: db.users.insertOne({                     │
│      phone, password: "hashed", name, ...           │
│    })                                                │
│    Result: New user created ✅                      │
└─────────────────────────────────────────────────────┘
```

**Database Changes:**
- ✅ `users` collection: +1 document
- ✅ `otps` collection: verified = true (tự xóa sau 5 phút)

---

## 🔑 5. FLOW ĐĂNG NHẬP (4 bước)

```
┌─────────────────────────────────────────────────────┐
│ 1. CLIENT → API                                     │
│    POST /auth/login                                 │
│    { phone: "0912345678", password: "password123" } │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 2. BACKEND → DATABASE                               │
│    Query: db.users.findOne({ phone })               │
│            .select('+password')                     │
│    Result: User found ✅                            │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 3. BACKEND (Memory)                                 │
│    bcrypt.compare(input_password, stored_password)  │
│    Result: true ✅                                  │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 4. BACKEND → DATABASE                               │
│    Update: db.users.updateOne(                      │
│      { _id },                                        │
│      { lastLogin: now, updatedAt: now }             │
│    )                                                 │
│    Result: JWT tokens returned ✅                   │
└─────────────────────────────────────────────────────┘
```

**Database Changes:**
- ✅ `users` collection: lastLogin updated, updatedAt updated

---

## 🔐 6. FLOW QUÊN MẬT KHẨU (7 bước)

```
┌─────────────────────────────────────────────────────┐
│ 1. CLIENT → API                                     │
│    POST /auth/otp/request                           │
│    { phone: "0912345678", purpose: "reset_password" }
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 2. BACKEND → DATABASE (KEY CHECK!)                  │
│    Query: db.users.findOne({ phone })               │
│    Result: User found ✅ (nếu null → Error 404)     │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 3. BACKEND → DATABASE                               │
│    Insert: db.otps.insertOne({                      │
│      phone, code: "789012", purpose: "reset_password"
│    })                                                │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 4. CLIENT → API (với OTP + mật khẩu mới)            │
│    POST /auth/password/reset                        │
│    { phone, otp: "789012", newPassword: "new123" }  │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 5. BACKEND → DATABASE                               │
│    Query: db.users.findOne({ phone })               │
│    Result: User found ✅                            │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 6. BACKEND → DATABASE                               │
│    Query: db.otps.findOne({ phone, code, ... })     │
│    Result: OTP valid ✅                             │
│    Update: db.otps.updateOne({ verified: true })    │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 7. BACKEND → DATABASE                               │
│    Update: db.users.updateOne(                      │
│      { _id },                                        │
│      { password: "new_hashed", updatedAt: now }     │
│    )                                                 │
│    Result: Password updated ✅                      │
└─────────────────────────────────────────────────────┘
```

**Database Changes:**
- ✅ `users` collection: password updated (hashed)
- ✅ `otps` collection: verified = true (tự xóa sau 5 phút)

---

## 📊 DATABASE QUERIES SUMMARY

### Đăng ký (3 queries)
```javascript
1. db.users.findOne({ phoneNumber })          // Check exists
2. db.otps.insertOne({ phone, code, ... })    // Create OTP
3. db.users.insertOne({ phone, password, ... }) // Create user
```

### Đăng nhập (2 queries)
```javascript
1. db.users.findOne({ phoneNumber })    // Find user
2. db.users.updateOne({ lastLogin })    // Update login time
```

### Quên mật khẩu (4 queries)
```javascript
1. db.users.findOne({ phoneNumber })       // Check user exists ← KEY!
2. db.otps.insertOne({ phone, code, ... }) // Create OTP
3. db.otps.findOne({ phone, code, ... })   // Verify OTP
4. db.users.updateOne({ password })        // Update password
```

---

## 🔍 KIỂM TRA DATABASE

### Via mongosh
```bash
# Connect
mongosh "mongodb://localhost:27017/shipway_driver"

# View users
db.users.find().pretty()

# Count documents
db.users.countDocuments()  # → Số user
db.otps.countDocuments()   # → Số OTP active

# Find specific user
db.users.findOne({ phoneNumber: "+84912345678" })

# View all phone numbers
db.users.find({}, { phoneNumber: 1, fullName: 1 })
```

### Via Code
```javascript
// Count active users
const count = await User.countDocuments({ status: 'active' });

// Find user
const user = await User.findOne({ phoneNumber: '+84912345678' });

// Check if phone exists
const exists = await User.exists({ phoneNumber: '+84912345678' });
```

---

## 🎯 QUICK REFERENCE

| Operation | Endpoint | DB Query | Response |
|-----------|----------|----------|----------|
| Request OTP | POST /otp/request | findOne (check) → insertOne (OTP) | Success/Error |
| Register | POST /register | findOne (verify OTP) → insertOne (user) | User + Tokens |
| Login | POST /login | findOne (user) → updateOne (lastLogin) | User + Tokens |
| Get Profile | GET /profile | findOne (by token) | User data |
| Reset Password | POST /password/reset | findOne (check) → updateOne (password) | Success |

---

## 📈 STORAGE INFO

**User Document Size:** ~500 bytes
```
- phoneNumber: 15 bytes
- password (hashed): 60 bytes
- fullName: 30-50 bytes
- Other fields: ~200 bytes
- Indexes: ~200 bytes
```

**OTP Document Size:** ~200 bytes
```
- phoneNumber: 15 bytes
- code: 6 bytes
- purpose: 15 bytes
- Timestamps: ~50 bytes
- Indexes: ~100 bytes
```

**Database Growth Estimate:**
- 1,000 users = ~500 KB
- 10,000 users = ~5 MB
- 100,000 users = ~50 MB

---

## ⚡ PERFORMANCE

**Indexes Created:**
```javascript
// users collection
{ phoneNumber: 1 } UNIQUE     // O(1) lookup
{ email: 1 } SPARSE           // O(1) lookup
{ status: 1, role: 1 }        // O(log n) range queries

// otps collection
{ phoneNumber: 1, purpose: 1, verified: 1 }  // Compound index
{ expiresAt: 1 } TTL                         // Auto-cleanup
```

**Query Performance:**
- Find by phoneNumber: **O(1)** - Instant (unique index)
- Find by email: **O(1)** - Instant (sparse index)
- Count documents: **O(1)** - Metadata lookup
- Full scan: **O(n)** - Avoid in production

---

## 🔐 SECURITY HIGHLIGHTS

✅ **Password**: Always hashed với bcrypt (10 rounds)  
✅ **OTP**: Tự động xóa sau 5 phút (TTL index)  
✅ **Phone**: Unique constraint prevents duplicates  
✅ **JWT**: Separate secrets cho access & refresh tokens  
✅ **Rate Limiting**: Protect against brute force  

---

**Xem chi tiết đầy đủ: `COMPLETE_TECHNICAL_GUIDE.md`**

