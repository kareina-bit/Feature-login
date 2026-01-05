# Auth Service - Micro-Frontend Architecture

## 📋 Giới thiệu

Auth Service là một Micro-Frontend độc lập được xây dựng theo kiến trúc Micro-Frontend của Shipway. Dịch vụ này quản lý toàn bộ quy trình xác thực người dùng:

- ✅ Đăng nhập
- ✅ Đăng ký
- ✅ Gửi/Xác minh OTP
- ✅ Đặt lại mật khẩu

## 🏗️ Cấu trúc thư mục

```
auth-service/
├── index.html          # HTML markup
├── auth.js             # Business logic (Service layer)
├── auth.controller.js  # UI logic & Event handling
├── auth.css            # Styles
└── README.md           # Documentation
```

## 🎯 Nguyên tắc kiến trúc

### 1. **Không dùng SPA Framework**
- Sử dụng HTML5, CSS3, JavaScript thuần (ES6+)
- Không phụ thuộc vào React, Vue, Angular, v.v.

### 2. **Độc lập Service**
- Auth Service là một module độc lập
- Có HTML, CSS, JS riêng
- Không import trực tiếp service khác

### 3. **Giao tiếp thông qua Event**
- Services giao tiếp bằng CustomEvent
- Thông qua Event Bus (`event-bus.js`)
- Khớp khối hợp với các service khác

### 4. **State Management tập trung**
- Sử dụng `auth-store.js` để quản lý state
- localStorage được sử dụng để lưu trữ token và user data
- Các service có thể truy cập state thông qua store

### 5. **API Communication**
- Sử dụng `api.js` để giao tiếp với backend
- Xử lý authentication headers
- Tập trung quản lý endpoint

## 📁 Cấu trúc File

### `index.html`
- Chứa HTML markup cho 3 view: Login, Register, Reset Password
- Import `auth.controller.js` module
- Định nghĩa các element cần thiết cho auth service

### `auth.js` (Service Layer)
- Hàm xử lý business logic
- Gọi API từ `shared/api.js`
- Lưu data vào `auth-store.js`
- Phát sự kiện thông qua `event-bus.js`

```javascript
- loginUser(phone, password)
- registerUser({ phone, name, password, role, otp })
- sendOtp(phone, opts)
- verifyOtp(phone, otp, purpose)
- resetPassword(phone, otp, newPassword)
- logout()
- getCurrentUser()
- isAuthenticated()
```

### `auth.controller.js` (UI Layer)
- Xử lý DOM events
- Form validation
- UI updates
- Gọi các hàm từ `auth.js`

```javascript
- initAuthService()           // Initialize tất cả handlers
- initLogin()                 // Setup login form
- initRegister()              // Setup register form
- initResetPassword()         // Setup reset password form
```

### `auth.css`
- Styles cho tất cả 3 views (Login, Register, Reset Password)
- Responsive design
- Animation & transitions

### Shared Modules

#### `shared/api.js`
```javascript
// API endpoints
apiRequest(endpoint, options)
login(phone, password)
register(data)
sendOTP(phone, purpose)
verifyOTP(phone, otp, purpose)
resetPassword(phone, otp, newPassword)
```

#### `shared/auth-store.js`
```javascript
// State management
authStore.setToken(token)
authStore.getToken()
authStore.setUser(user)
authStore.getUser()
authStore.clear()
authStore.isAuth()
authStore.getUserRole()
authStore.hasRole(role)
```

#### `shared/event-bus.js`
```javascript
// Event communication
eventBus.on(eventName, callback)
eventBus.off(eventName, callback)
eventBus.emit(eventName, data)
eventBus.once(eventName, callback)

// Auth Events
AUTH_EVENTS.LOGIN_SUCCESS
AUTH_EVENTS.LOGIN_FAILED
AUTH_EVENTS.REGISTER_SUCCESS
AUTH_EVENTS.REGISTER_FAILED
AUTH_EVENTS.LOGOUT
AUTH_EVENTS.TOKEN_EXPIRED
AUTH_EVENTS.USER_UPDATED
```

## 🔄 Data Flow

### Login Flow
```
1. User submits login form
   ↓
2. auth.controller.js validates form
   ↓
3. Calls loginUser() from auth.js
   ↓
4. auth.js calls api.login() from shared/api.js
   ↓
5. API returns token & user data
   ↓
6. authStore saves token & user data
   ↓
7. eventBus emits AUTH_EVENTS.LOGIN_SUCCESS
   ↓
8. Other services listen & react to event
   ↓
9. Redirect to dashboard
```

### Register Flow
```
1. User enters phone number
   ↓
2. Clicks "Gửi mã OTP"
   ↓
3. Calls sendOtp() → API sends OTP
   ↓
4. User enters OTP, name, password
   ↓
5. Clicks "Đăng ký"
   ↓
6. Calls registerUser() → API registers
   ↓
7. authStore saves token & user data
   ↓
8. eventBus emits AUTH_EVENTS.REGISTER_SUCCESS
   ↓
9. Redirect to dashboard
```

## 🎯 Events mà Auth Service phát hành

| Event | Data | Mô tả |
|-------|------|-------|
| `auth:login:success` | `{ user, token }` | Đăng nhập thành công |
| `auth:login:failed` | `{ error }` | Đăng nhập thất bại |
| `auth:register:success` | `{ user, token }` | Đăng ký thành công |
| `auth:register:failed` | `{ error }` | Đăng ký thất bại |
| `auth:logout` | `{}` | Người dùng đăng xuất |
| `auth:token:expired` | `{}` | Token hết hạn |
| `auth:user:updated` | `{ user }` | Thông tin người dùng cập nhật |

## 📱 Tích hợp với Shell App

Để sử dụng Auth Service trong Shell App:

```javascript
// shell.js
import { eventBus, AUTH_EVENTS } from './auth-service/shared/event-bus.js';

// Listen to auth events
eventBus.on(AUTH_EVENTS.LOGIN_SUCCESS, (data) => {
  console.log('User logged in:', data.user);
  // Update Shell App UI
});

eventBus.on(AUTH_EVENTS.LOGOUT, () => {
  console.log('User logged out');
  // Clear Shell App UI
});
```

## 🔐 Security Features

- ✅ OTP-based verification
- ✅ Password hashing (backend)
- ✅ JWT token authentication
- ✅ Secure localStorage usage
- ✅ Authorization headers with Bearer token
- ✅ Role-based access control

## 📝 Usage Examples

### Example 1: Check if user is authenticated
```javascript
import { authStore } from '../shared/auth-store.js';

if (authStore.isAuth()) {
  const user = authStore.getUser();
  console.log('Logged in as:', user.name);
}
```

### Example 2: Listen to auth events
```javascript
import { eventBus, AUTH_EVENTS } from '../shared/event-bus.js';

eventBus.on(AUTH_EVENTS.LOGIN_SUCCESS, (data) => {
  console.log('User logged in:', data.user);
});
```

### Example 3: Make authenticated API calls
```javascript
import { apiRequest } from '../shared/api.js';

const response = await apiRequest('/user/profile', {
  method: 'GET'
});
```

## 🐛 Troubleshooting

### OTP không được gửi
- Kiểm tra backend API endpoint `/api/auth/send-otp`
- Xem console để xem error message
- Kiểm tra số điện thoại format

### Đăng nhập thất bại
- Kiểm tra credentials
- Xem Network tab để xem API response
- Kiểm tra backend configuration

### Token hết hạn
- Service sẽ tự emit `AUTH_EVENTS.TOKEN_EXPIRED`
- Shell App nên handle event này và redirect to login

## 📚 API Endpoints

Tất cả endpoints base URL: `http://localhost:3000/api`

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/auth/login` | `{ phone, password }` | `{ token, user, message }` |
| POST | `/auth/register` | `{ phone, name, password, otp, role }` | `{ token, user, message }` |
| POST | `/auth/send-otp` | `{ phone, purpose }` | `{ message, otp (dev) }` |
| POST | `/auth/verify-otp` | `{ phone, otp, purpose }` | `{ message, valid }` |
| POST | `/auth/reset-password` | `{ phone, otp, newPassword }` | `{ message, token, user }` |

## 🔗 Liên kết

- [Shared Modules](../shared/README.md)
- [Main Architecture](../README.md)
