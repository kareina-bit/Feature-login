# 🚀 START HERE - FastAPI Backend

## TL;DR (5 phút setup)

```bash
# 1. Di chuyển vào thư mục
cd backend-fastapi

# 2. Tạo virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# 3. Cài đặt dependencies
pip install -r requirements.txt

# 4. Tạo file .env (copy từ .env.example và điền MongoDB URI)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# 5. Chạy server
uvicorn main:app --reload --port 8000

# 6. Truy cập API Docs
# http://localhost:8000/docs
```

## ✅ Checklist

- [ ] Python 3.10+ đã cài đặt
- [ ] Đã tạo virtual environment
- [ ] Đã cài đặt dependencies từ requirements.txt
- [ ] Đã tạo file .env với MongoDB connection string
- [ ] Server đang chạy tại port 8000
- [ ] Đã test API tại http://localhost:8000/docs
- [ ] Frontend đã update BASE_URL sang port 8000

## 🎯 Test nhanh

### 1. Health Check
Mở browser: http://localhost:8000/api/health

Expect:
```json
{
  "status": "healthy",
  "app": "Shipway API",
  "version": "1.0.0",
  "environment": "development",
  "database": "connected"
}
```

### 2. Login Admin
Trong Swagger UI (http://localhost:8000/docs):
1. Tìm endpoint `POST /api/auth/login`
2. Click "Try it out"
3. Điền:
```json
{
  "phone": "+84391912441",
  "password": "Admin@123456"
}
```
4. Execute
5. Copy token từ response

### 3. Test Authenticated Endpoint
1. Click "Authorize" button (top right)
2. Paste: `Bearer <your_token>`
3. Try `GET /api/users/me`

## 🔧 Troubleshooting

### Python not found
```bash
python --version  # Check version
# Install Python 3.10+ from python.org
```

### MongoDB connection error
```
❌ Error connecting to MongoDB
```
**Fix**: Check `.env` file, verify MONGODB_URI is correct

### Port already in use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Import errors
```bash
pip install -r requirements.txt --force-reinstall
```

## 📚 Next Steps

1. ✅ Backend chạy thành công
2. Update frontend config (frontend/config/env.js)
3. Test đầy đủ từ frontend UI
4. Đọc docs: [SETUP_GUIDE.md](SETUP_GUIDE.md)
5. Xem API examples: [API_EXAMPLES.md](API_EXAMPLES.md)

## 🆘 Need Help?

- **API Docs**: http://localhost:8000/docs
- **Setup Guide**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **README**: [README.md](README.md)
- **Backend Comparison**: [../BACKEND_COMPARISON.md](../BACKEND_COMPARISON.md)

---

**Chúc mừng! 🎉 FastAPI backend đã sẵn sàng!**

