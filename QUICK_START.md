# ⚡ Quick Start - Frontend & Backend Integration

## 🚀 Chạy Backend

```bash
# 1. Cài đặt dependencies (lần đầu tiên)
npm install

# 2. Tạo file .env (nếu chưa có)
# Copy nội dung từ README.md hoặc tạo file với nội dung tối thiểu:
```

**File `.env` tối thiểu:**
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/shipway_driver
JWT_SECRET=your-secret-key-min-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters-long
CORS_ORIGIN=*
```

```bash
# 3. Chạy server (đảm bảo MongoDB đang chạy)
npm run dev

# Server sẽ chạy tại: http://localhost:3000
```

---

## 🌐 Chạy Frontend

### Cách 1: VSCode Live Server (Khuyến nghị)
1. Cài extension "Live Server" trong VSCode
2. Right-click `Feature-login-main/login.html`
3. Chọn "Open with Live Server"
4. Browser tự động mở tại: `http://localhost:5500` (hoặc port khác)

### Cách 2: Python HTTP Server
```bash
cd Feature-login-main
python -m http.server 8000
# Browser: http://localhost:8000/login.html
```

---

## 🧪 Test Flow

### ✅ Test 1: Đăng ký

1. **Mở:** `http://localhost:5500/register.html`
2. **Nhập:**
   - Số điện thoại: `0912345678`
   - Họ tên: `Test User`
   - Mật khẩu: `password123`
3. **Click:** "Đăng ký"
4. **Lấy OTP:** Check console log của backend (terminal đang chạy `npm run dev`)
   ```
   📱 OTP for +84912345678: 123456
   ```
5. **Nhập OTP:** `123456` vào form
6. **Click:** "Xác thực OTP"
7. **Kết quả:** Redirect to login.html

### ✅ Test 2: Đăng nhập

1. **Mở:** `http://localhost:5500/login.html`
2. **Nhập:**
   - Số điện thoại: `0912345678`
   - Mật khẩu: `password123`
3. **Click:** "Đăng nhập"
4. **Kết quả:** Redirect to dashboard.html

### ✅ Test 3: Dashboard

1. **Tự động:** Sau khi login thành công
2. **Xem:** Thông tin user được load từ API
3. **Test:** Click "Đăng xuất"

---

## 🔍 Debugging

### Backend Health Check
```bash
curl http://localhost:3000/health
```

Expected:
```json
{"status":"OK","message":"Shipway Driver API is running","timestamp":"..."}
```

### Frontend Developer Tools
- **Console Tab:** Xem logs và errors
- **Network Tab:** Xem API requests/responses
- **Application Tab > Local Storage:** Xem tokens

---

## ❌ Common Errors

### Error: "Cannot connect to MongoDB"
**Fix:** Đảm bảo MongoDB đang chạy
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### Error: "CORS policy blocked"
**Fix:** Đảm bảo `.env` có `CORS_ORIGIN=*`

### Error: "OTP không nhận được"
**Fix:** Trong development mode, OTP sẽ log ra console của backend (không gửi SMS thật)

---

## 📁 Files Structure

```
Shipway/
├── Feature-login-main/          # FRONTEND
│   ├── login.html              ← Trang đăng nhập
│   ├── register.html           ← Trang đăng ký
│   ├── dashboard.html          ← Dashboard
│   └── assets/
│       ├── api-config.js       ← API endpoints (NEW)
│       ├── auth-backend.js     ← Backend integration (NEW)
│       └── style.css
├── src/                         # BACKEND
│   ├── server.ts
│   ├── routes/
│   ├── controllers/
│   └── ...
├── SETUP_FRONTEND_BACKEND.md    ← Hướng dẫn chi tiết
└── QUICK_START.md               ← File này
```

---

## ✅ Checklist

- [ ] Backend chạy: `npm run dev` ✓ OK
- [ ] MongoDB chạy ✓ OK
- [ ] Frontend mở được: `http://localhost:5500/login.html` ✓ OK
- [ ] Test đăng ký → Nhận OTP (check backend console) ✓ OK
- [ ] Test đăng nhập → Vào dashboard ✓ OK

---

## 📚 Xem thêm

- **Chi tiết tích hợp:** `SETUP_FRONTEND_BACKEND.md`
- **API Documentation:** `API_EXAMPLES.md`
- **Project Report:** `PROJECT_REPORT.md`
- **Backend README:** `README.md`

---

**🎉 Bây giờ bạn có thể test đăng ký và đăng nhập với backend thật!**

