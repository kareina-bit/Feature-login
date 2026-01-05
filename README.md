# Shipway Frontend - Micro-Frontend Architecture

## 📋 Giới thiệu

Shipway Frontend được xây dựng theo mô hình **Micro-Frontend Architecture** sử dụng HTML5, CSS3, và JavaScript thuần (không framework). Mỗi tính năng nghiệp vụ được tách thành một **service độc lập**, giúp:

- ✅ Dễ phát triển song song
- ✅ Dễ bảo trì
- ✅ Dễ mở rộng về sau
- ✅ Không phụ thuộc framework
- ✅ Giao tiếp thông qua Event Bus

## 🏗️ Cấu trúc tổng thể

```
frontend/
│
├─ /shell-app                    # Shell Application (routing, layout)
│   ├─ index.html
│   ├─ shell.js
│   ├─ router.js
│   └─ shell.css
│
├─ /auth-service                 # Auth Service (Login, Register, OTP)
│   ├─ index.html
│   ├─ auth.js                   # Business logic
│   ├─ auth.controller.js        # UI logic
│   ├─ auth.css
│   └─ README.md
│
├─ /profile-service              # Profile Service (User profile management)
│   ├─ index.html
│   ├─ profile.js
│   ├─ profile.controller.js
│   ├─ profile.css
│   └─ README.md
│
├─ /kyc-service                  # KYC Service (Know Your Customer)
│   ├─ index.html
│   ├─ kyc.js
│   ├─ kyc.controller.js
│   ├─ kyc.css
│   └─ README.md
│
├─ /shared                       # Shared modules (API, Store, Event Bus)
│   ├─ api.js                    # API communication
│   ├─ auth-store.js             # Auth state management
│   ├─ event-bus.js              # Event communication system
│   └─ README.md
│
└─ /img                          # Images & assets
    ├─ Dcm.png
    ├─ Screenshot_1.jpeg
    └─ ...
```

## 🎯 Nguyên tắc kiến trúc

### ❌ Không dùng SPA Framework
```
❌ Không dùng React
❌ Không dùng Vue
❌ Không dùng Angular
❌ Không dùng Svelte
```

### ✅ Mỗi Service độc lập
- Mỗi service có HTML / CSS / JS riêng
- Không import trực tiếp service khác
- Có thể phát triển, test, deploy độc lập

### ✅ Shell App chỉ làm điều phối
- Quản lý routing
- Quản lý layout
- Không chứa business logic
- Điều phối các service

### ✅ Giao tiếp thông qua Event
- Services không import service khác
- Giao tiếp qua CustomEvent
- Thông qua Event Bus
- Slack coupling giữa services

### ✅ State Management tập trung
- Sử dụng `auth-store.js` cho auth state
- Có thể mở rộng với profile-store, kyc-store, v.v.
- Dữ liệu lưu trong localStorage

## 📱 Các Services

### 1. **Auth Service** ✅ (Đã xây dựng)

**Mục đích**: Quản lý xác thực người dùng

**Chức năng**:
- Đăng nhập
- Đăng ký
- Gửi/Xác minh OTP
- Đặt lại mật khẩu

**Files**:
- `auth-service/index.html` - HTML markup (3 views: login, register, reset)
- `auth-service/auth.js` - Business logic
- `auth-service/auth.controller.js` - UI logic & event handling
- `auth-service/auth.css` - Styles
- `auth-service/README.md` - Documentation

**Events phát hành**:
```
auth:login:success       { user, token }
auth:login:failed        { error }
auth:register:success    { user, token }
auth:register:failed     { error }
auth:logout              {}
auth:token:expired       {}
auth:user:updated        { user }
```

### 2. **Profile Service** (Tương tự như Auth Service)

**Mục đích**: Quản lý profile người dùng

**Chức năng**:
- Xem thông tin profile
- Cập nhật profile
- Thay đổi avatar
- Thay đổi mật khẩu

### 3. **KYC Service** (Tương tự như Auth Service)

**Mục đích**: Xác minh danh tính người dùng

**Chức năng**:
- Upload tài liệu
- Xác minh CCCD
- Xác minh tài khoản ngân hàng

### 4. **Shell App**

**Mục đích**: Ứng dụng shell - điều phối các service

**Chức năng**:
- Routing (hash-based)
- Layout & navigation
- Quản lý state chung
- Hiển thị notificaion/toast

## 🔄 Data Flow

### Ví dụ: Login Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. User nhập phone/password & submit form               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ auth.controller.js    │ (UI Layer)
         │ - Validate form       │
         │ - Show loading        │
         └────────────┬──────────┘
                      │
                      ▼
         ┌───────────────────────┐
         │ auth.js               │ (Business Logic)
         │ loginUser()           │
         └────────────┬──────────┘
                      │
                      ▼
         ┌───────────────────────┐
         │ shared/api.js         │ (API Layer)
         │ login(phone, pwd)     │
         └────────────┬──────────┘
                      │
                      ▼
         ┌───────────────────────┐
         │ Backend API           │
         │ POST /auth/login      │
         └────────────┬──────────┘
                      │
        ┌─────────────┴──────────┐
        │                        │
       ✅                        ❌
    Success                    Failed
        │                        │
        ▼                        ▼
    ┌──────────┐          ┌──────────────┐
    │ Response │          │ Error        │
    │{token,   │          │ message      │
    │ user}    │          └──────┬───────┘
    └────┬─────┘                 │
         │                       │
         ▼                       ▼
    ┌────────────────┐   ┌──────────────────┐
    │ authStore.js   │   │ eventBus.emit()  │
    │ - setToken()   │   │ LOGIN_FAILED     │
    │ - setUser()    │   └──────┬───────────┘
    └────┬───────────┘          │
         │                      │
         ▼                      ▼
    ┌─────────────────┐  ┌──────────────┐
    │ eventBus.emit() │  │ Show error   │
    │ LOGIN_SUCCESS   │  │ to user      │
    └────┬────────────┘  └──────────────┘
         │
         ▼
    ┌─────────────────────────────┐
    │ Other services listen:      │
    │ - Shell App: Update nav     │
    │ - Profile: Load profile     │
    │ - KYC: Check status         │
    └──────┬──────────────────────┘
           │
           ▼
    ┌──────────────────┐
    │ Redirect to      │
    │ dashboard        │
    └──────────────────┘
```

## 🔌 Giao tiếp Services

### Pattern: Service A gửi event, Service B lắng nghe

```javascript
// Service A (auth-service/auth.js)
import { eventBus, AUTH_EVENTS } from '../shared/event-bus.js';

export const loginUser = async (phone, password) => {
  // ... login logic ...
  eventBus.emit(AUTH_EVENTS.LOGIN_SUCCESS, { user });
};

// Service B (profile-service/profile.js)
import { eventBus, AUTH_EVENTS } from '../shared/event-bus.js';

export function initProfileService() {
  eventBus.on(AUTH_EVENTS.LOGIN_SUCCESS, (data) => {
    loadUserProfile(data.user.id);
  });
}

// Shell App (shell-app/shell.js)
import { eventBus, AUTH_EVENTS } from './auth-service/shared/event-bus.js';

eventBus.on(AUTH_EVENTS.LOGIN_SUCCESS, (data) => {
  updateNavigation(data.user);
  showNotification(`Welcome ${data.user.name}`);
});
```

## 💾 State Management

### Auth Store (Singleton Pattern)
```javascript
import { authStore } from './shared/auth-store.js';

// Set after login
authStore.setToken(response.token);
authStore.setUser(response.user);

// Get anywhere in any service
const isAuth = authStore.isAuth();
const user = authStore.getUser();

// Clear on logout
authStore.clear();
```

### localStorage Structure
```
Key: 'auth:token'         → JWT token string
Key: 'auth:user'          → User object JSON string
Key: 'auth:isAuthenticated' → Boolean
```

## 📡 API Communication

### Centralized API Service
```javascript
import * as api from './shared/api.js';

// Auth APIs
await api.login(phone, password);
await api.register(userData);
await api.sendOTP(phone, purpose);
await api.verifyOTP(phone, otp, purpose);
await api.resetPassword(phone, otp, newPassword);

// Features:
// ✅ Automatic token injection
// ✅ JSON handling
// ✅ Error handling
// ✅ Status checking
```

## 🎯 Routing (Hash-based)

```javascript
// URLs
/                    → Login page (auth-service)
/#/register          → Register page (auth-service)
/#/reset-password    → Reset password (auth-service)
/#/profile           → Profile page (profile-service)
/#/kyc               → KYC page (kyc-service)
/#/dashboard         → Dashboard (shell-app)

// Implementation in shell-app/router.js
function onHashChange() {
  const hash = window.location.hash.slice(1);
  renderService(hash);
}
```

## 🚀 Development Workflow

### 1. Develop Auth Service
```
$ cd frontend/auth-service
$ Make changes to auth.js, auth.controller.js, auth.css
$ Test in browser: open index.html
```

### 2. Develop Profile Service (later)
```
$ cd frontend/profile-service
$ Create profile.js, profile.controller.js, profile.css
$ Listen to AUTH_EVENTS.LOGIN_SUCCESS
$ Test by logging in first
```

### 3. Build Shell App (final step)
```
$ cd frontend/shell-app
$ Create shell.js router & layout
$ Import all services
$ Listen to events from all services
$ Deploy
```

## 📚 Documentation

- [Auth Service Documentation](./auth-service/README.md)
- [Shared Modules Documentation](./shared/README.md)

## 🔐 Security Checklist

- ✅ OTP-based registration
- ✅ Password hashing (backend)
- ✅ JWT token authentication
- ✅ Bearer token in requests
- ✅ Token expiry handling
- ✅ Role-based access control
- ✅ localStorage for token/user
- ✅ HTTPS in production

## 📊 Dependency Graph

```
Shell App
  │
  ├── listens to: AUTH_EVENTS
  │
  └── imports: eventBus, authStore
       │
       └── Auth Service (imports: eventBus, authStore, api)
       │
       └── Profile Service (imports: eventBus, authStore, api)
       │
       └── KYC Service (imports: eventBus, authStore, api)

shared/api.js
  └── imports: authStore (for token)

shared/event-bus.js
  └── Pure JavaScript (no imports)

shared/auth-store.js
  └── Pure JavaScript (no imports)
```

## ✅ Checklist - Cấu trúc hoàn chỉnh

- [x] `auth-service/index.html` - HTML with 3 views
- [x] `auth-service/auth.js` - Service layer
- [x] `auth-service/auth.controller.js` - Controller layer
- [x] `auth-service/auth.css` - Styles
- [x] `shared/api.js` - API communication
- [x] `shared/auth-store.js` - State management
- [x] `shared/event-bus.js` - Event communication
- [ ] `shell-app/index.html` - Shell app (next step)
- [ ] `shell-app/shell.js` - Shell logic (next step)
- [ ] `shell-app/router.js` - Routing (next step)
- [ ] `shell-app/shell.css` - Shell styles (next step)

---

**Created**: January 5, 2026
**Architecture**: Micro-Frontend (No Framework)
**Team**: Shipway Development
