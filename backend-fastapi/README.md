# Shipway FastAPI Backend

Backend API cho hệ thống quản lý vận chuyển Shipway, được xây dựng với FastAPI và Python.

## 🚀 Tech Stack

- **Framework**: FastAPI 0.109.0
- **Database**: MongoDB Atlas (Motor - Async Driver)
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)
- **Validation**: Pydantic v2
- **OTP/SMS**: Twilio
- **Server**: Uvicorn (ASGI)

## 📁 Project Structure

```
backend-fastapi/
├── main.py                 # Application entry point
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (create from .env.example)
├── .gitignore
├── README.md
└── app/
    ├── __init__.py
    ├── api/                # API routes
    │   ├── __init__.py
    │   ├── dependencies.py # Auth dependencies
    │   └── routes/
    │       ├── auth.py     # Authentication endpoints
    │       ├── user.py     # User management endpoints
    │       └── health.py   # Health check endpoint
    ├── core/               # Core functionality
    │   ├── config.py       # Configuration settings
    │   ├── database.py     # MongoDB connection
    │   ├── security.py     # JWT & password hashing
    │   └── exceptions.py   # Custom exceptions
    ├── models/             # Database models
    │   ├── user.py         # User model
    │   └── otp.py          # OTP model
    ├── schemas/            # Pydantic schemas
    │   ├── user.py         # User schemas
    │   ├── auth.py         # Auth schemas
    │   └── response.py     # Response schemas
    ├── services/           # Business logic
    │   ├── auth_service.py
    │   ├── user_service.py
    │   ├── otp_service.py
    │   └── sms_service.py
    ├── utils/              # Utilities
    │   ├── validators.py
    │   └── helpers.py
    └── middleware/         # Middleware
        ├── cors.py
        └── error_handler.py
```

## 🛠️ Setup Instructions

### 1. Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- MongoDB Atlas account
- (Optional) Twilio account for SMS OTP

### 2. Installation

```bash
# Navigate to backend-fastapi directory
cd backend-fastapi

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration

Create a `.env` file in the `backend-fastapi` directory:

```bash
# Application Settings
APP_NAME=Shipway API
VERSION=1.0.0
ENVIRONMENT=development
PORT=8000

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DATABASE_NAME=shipway

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-here-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080

# OTP Configuration
OTP_EXPIRE_MINUTES=5

# Twilio Configuration (Optional - for SMS OTP)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:5500,http://127.0.0.1:5500

# Admin Default Credentials
ADMIN_PHONE=+84391912441
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=Shipway Administrator
```

**⚠️ IMPORTANT**: 
- Replace `MONGODB_URI` with your MongoDB Atlas connection string
- Change `JWT_SECRET_KEY` to a secure random string in production
- Configure Twilio credentials if you want real SMS OTP

### 4. MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to `.env`

The application will automatically:
- Connect to the database
- Create required indexes
- Create a default admin user

## 🚀 Running the Application

### Development Mode (with auto-reload)

```bash
# Make sure virtual environment is activated
uvicorn main:app --reload --port 8000
```

Or using Python directly:

```bash
python main.py
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The server will start on: `http://localhost:8000`

## 📚 API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔐 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Verify OTP code |
| POST | `/api/auth/reset-password` | Reset password |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/me` | Get current user | Yes |
| PUT | `/api/users/me` | Update current user | Yes |
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/{id}` | Get user by ID | Admin |
| DELETE | `/api/users/{id}` | Delete user | Admin |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/` | API info |

## 🔑 Default Admin Account

- **Phone**: +84391912441
- **Password**: Admin@123456

⚠️ **Change these credentials in production!**

## 🧪 Testing the API

### Using curl

```bash
# Health check
curl http://localhost:8000/api/health

# Send OTP
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+84397912441", "type": "registration"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+84391912441", "password": "Admin@123456"}'
```

### Using the Frontend

1. Start the backend server (port 8000)
2. Update frontend config to use `http://localhost:8000/api`
3. Open `frontend/index.html` with Live Server
4. Test login/register functionality

## 🗄️ Database Schema

### Users Collection

```javascript
{
  "_id": ObjectId,
  "name": String,
  "email": String (unique),
  "phone": String (unique, E.164 format),
  "password": String (hashed),
  "role": String (enum: "admin", "user", "driver"),
  "isVerified": Boolean,
  "createdAt": Date,
  "updatedAt": Date
}
```

### OTPs Collection

```javascript
{
  "_id": ObjectId,
  "phone": String (E.164 format),
  "code": String (6 digits),
  "type": String (enum: "registration", "reset-password"),
  "isVerified": Boolean,
  "createdAt": Date,
  "expiresAt": Date (TTL index)
}
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control (RBAC)
- ✅ OTP verification for registration and password reset
- ✅ Request validation with Pydantic
- ✅ CORS protection
- ✅ Environment variable configuration

## 🐛 Troubleshooting

### Port already in use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

### MongoDB connection error
- Check your connection string in `.env`
- Verify your IP is whitelisted in MongoDB Atlas
- Ensure database user has correct permissions

### Import errors
```bash
# Make sure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

## 📝 Notes

### Differences from Node.js Backend

1. **Port**: FastAPI uses port `8000` (Node.js used `5000`)
2. **Async**: Fully async with `async/await` syntax
3. **Validation**: Automatic with Pydantic (no express-validator needed)
4. **Documentation**: Auto-generated Swagger UI
5. **Type Safety**: Python type hints throughout

### Migration from Node.js

- ✅ Same MongoDB database (`shipway`)
- ✅ Same collections (`users`, `otps`)
- ✅ Same API endpoints
- ✅ Same authentication flow
- ⚠️ Update frontend API URL to port `8000`

## 📞 Support

For issues or questions:
- Check API documentation at `/docs`
- Review error logs in console
- Verify `.env` configuration

---

**Built with ❤️ using FastAPI**
