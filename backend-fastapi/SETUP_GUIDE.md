# FastAPI Backend - Setup Guide

## Quick Start (5 phút)

### 1. Cài đặt Python Dependencies

```bash
cd backend-fastapi
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 2. Tạo file .env

Tạo file `.env` trong thư mục `backend-fastapi` với nội dung:

```env
# Application
APP_NAME=Shipway API
VERSION=1.0.0
ENVIRONMENT=development
PORT=8000

# MongoDB - THAY ĐỔI DÒNG NÀY
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/
DATABASE_NAME=shipway

# JWT - THAY ĐỔI SECRET KEY
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080

# OTP
OTP_EXPIRE_MINUTES=5

# Twilio (Để trống = OTP hiển thị trong console)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# CORS
CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500

# Admin
ADMIN_PHONE=+84391912441
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=Shipway Administrator
```

### 3. Chạy Server

```bash
uvicorn main:app --reload --port 8000
```

Hoặc:

```bash
python main.py
```

### 4. Test API

Mở trình duyệt: http://localhost:8000/docs

## Chi tiết Setup

### Yêu cầu hệ thống

- Python 3.10+
- pip
- MongoDB Atlas account

### Cài đặt Python

**Windows:**
1. Download Python từ https://www.python.org/downloads/
2. Chạy installer, **tick** "Add Python to PATH"
3. Verify: `python --version`

**macOS:**
```bash
brew install python@3.10
```

**Linux:**
```bash
sudo apt update
sudo apt install python3.10 python3-pip python3-venv
```

### Tạo Virtual Environment

**Windows:**
```bash
cd backend-fastapi
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
cd backend-fastapi
python3 -m venv venv
source venv/bin/activate
```

Bạn sẽ thấy `(venv)` xuất hiện trong terminal.

### Cài đặt Dependencies

```bash
pip install -r requirements.txt
```

Nếu gặp lỗi:
```bash
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir
```

### MongoDB Atlas Setup

1. **Tạo account** tại https://www.mongodb.com/cloud/atlas
2. **Tạo cluster** (chọn Free Tier - M0)
3. **Tạo Database User:**
   - Database Access → Add New Database User
   - Username: `shipway_user`
   - Password: tạo password mạnh
   - Database User Privileges: "Read and write to any database"

4. **Whitelist IP:**
   - Network Access → Add IP Address
   - Chọn "Allow Access from Anywhere" (0.0.0.0/0) cho development
   - Production: chỉ whitelist IP của server

5. **Get Connection String:**
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Thay `<username>`, `<password>`, và database name

Example:
```
mongodb+srv://shipway_user:MyPassword123@cluster0.abc123.mongodb.net/shipway?retryWrites=true&w=majority
```

### Cấu hình .env

Tạo file `.env` (KHÔNG commit file này lên Git):

```env
MONGODB_URI=mongodb+srv://shipway_user:MyPassword123@cluster0.abc123.mongodb.net/
DATABASE_NAME=shipway
JWT_SECRET_KEY=8f4a9d6c3b1e7f2a5d8c9b4e6f1a3d7c2b5e8a1f4d7c0b3e6a9f2d5c8b1e4a7
```

**Generate JWT Secret Key:**
```python
import secrets
print(secrets.token_hex(32))
```

### Chạy Server

**Development (auto-reload):**
```bash
uvicorn main:app --reload --port 8000
```

**Production:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Background (Windows):**
```bash
start /B uvicorn main:app --port 8000
```

**Background (Linux/macOS):**
```bash
nohup uvicorn main:app --port 8000 &
```

### Verify Server Running

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Expected response:
{
  "status": "healthy",
  "app": "Shipway API",
  "version": "1.0.0",
  "environment": "development",
  "database": "connected"
}
```

### Truy cập API Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Kiểm tra Frontend Integration

### 1. Update Frontend Config

File: `frontend/config/env.js`

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',  // Change từ 5000 → 8000
  // ...
};
```

### 2. Start Frontend

```bash
# Trong thư mục frontend, mở index.html với Live Server
# Hoặc dùng Python:
cd frontend
python -m http.server 5500
```

### 3. Test Login

1. Mở http://localhost:5500
2. Login với admin account:
   - Phone: +84391912441
   - Password: Admin@123456

## Troubleshooting

### Lỗi: ModuleNotFoundError

```bash
# Kiểm tra virtual environment đã activate chưa
# Nên thấy (venv) trong terminal

# Reinstall dependencies
pip install -r requirements.txt
```

### Lỗi: Port already in use

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:8000 | xargs kill -9
```

### Lỗi: MongoDB connection failed

- Kiểm tra `MONGODB_URI` trong `.env`
- Verify IP đã được whitelist
- Kiểm tra username/password
- Test connection string trong MongoDB Compass

### Lỗi: CORS error

- Kiểm tra `CORS_ORIGINS` trong `.env`
- Đảm bảo frontend URL có trong danh sách
- Clear browser cache

### Import Error: pydantic_settings

```bash
pip install pydantic-settings
```

### Twilio SMS không gửi

- **Development:** Bỏ trống Twilio credentials, OTP sẽ hiển thị trong console
- **Production:** Cần config Twilio account

## Development Workflow

### 1. Activate Virtual Environment

```bash
cd backend-fastapi
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
```

### 2. Start Development Server

```bash
uvicorn main:app --reload --port 8000
```

### 3. Make Changes

- Code changes auto-reload
- Check console for errors
- Test in Swagger UI: http://localhost:8000/docs

### 4. Deactivate Virtual Environment

```bash
deactivate
```

## Production Deployment

### 1. Update .env

```env
ENVIRONMENT=production
JWT_SECRET_KEY=<strong-random-key>
MONGODB_URI=<production-mongodb-uri>
CORS_ORIGINS=https://yourdomain.com
```

### 2. Run with Gunicorn (Linux)

```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 3. Use Process Manager

```bash
# PM2 (Node.js ecosystem)
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name shipway-api

# Supervisor (Linux)
# Create /etc/supervisor/conf.d/shipway-api.conf
```

### 4. Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Performance Tips

1. **Use uvicorn workers:**
   ```bash
   uvicorn main:app --workers 4 --host 0.0.0.0 --port 8000
   ```

2. **Enable MongoDB indexes** (auto-created on startup)

3. **Use connection pooling** (Motor handles this)

4. **Cache responses** (Redis for production)

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret key
- [ ] Enable HTTPS in production
- [ ] Restrict CORS origins
- [ ] Whitelist MongoDB IPs
- [ ] Enable rate limiting
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Regular security updates

---

**Hỗ trợ:** Check documentation tại http://localhost:8000/docs

