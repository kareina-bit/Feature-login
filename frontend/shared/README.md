# Shared Modules - Micro-Frontend Architecture

## 📋 Giới thiệu

Shared modules chứa các utility, service, và event bus được sử dụng bởi tất cả các micro-frontend services. Các module này được thiết kế để có thể reuse và không dependency vào bất kỳ service nào khác.

## 🏗️ Cấu trúc

```
shared/
├── api.js           # API communication service
├── auth-store.js    # Auth state management
├── event-bus.js     # Event communication system
└── README.md        # Documentation
```

## 📁 File Details

### 1. `event-bus.js` - Event Communication System

Event Bus cung cấp cơ chế giao tiếp giữa các micro-frontend services mà không cần import trực tiếp.

#### API:

```javascript
import { eventBus, AUTH_EVENTS } from '../shared/event-bus.js';

// Subscribe to an event
const unsubscribe = eventBus.on('event:name', (data) => {
  console.log('Event received:', data);
});

// Unsubscribe
unsubscribe();

// Emit an event
eventBus.emit('event:name', { /* data */ });

// Subscribe once
eventBus.once('event:name', (data) => {
  console.log('Received once:', data);
});

// Unsubscribe specific event
eventBus.off('event:name', callback);
```

#### Pre-defined Auth Events:

```javascript
AUTH_EVENTS = {
  LOGIN_SUCCESS: 'auth:login:success',      // { user, token }
  LOGIN_FAILED: 'auth:login:failed',        // { error }
  REGISTER_SUCCESS: 'auth:register:success',// { user, token }
  REGISTER_FAILED: 'auth:register:failed',  // { error }
  LOGOUT: 'auth:logout',                    // {}
  TOKEN_EXPIRED: 'auth:token:expired',      // {}
  USER_UPDATED: 'auth:user:updated'         // { user }
}
```

#### Examples:

```javascript
// Example 1: Listen to login success
eventBus.on(AUTH_EVENTS.LOGIN_SUCCESS, (data) => {
  console.log('User logged in:', data.user);
  // Update UI in other services
});

// Example 2: Emit custom event
eventBus.emit('profile:updated', { 
  userId: 123, 
  newName: 'John Doe' 
});

// Example 3: Subscribe once
eventBus.once(AUTH_EVENTS.LOGOUT, () => {
  console.log('Logged out once');
});
```

### 2. `auth-store.js` - Auth State Management

Auth Store quản lý trạng thái authentication tập trung. Tất cả auth data được lưu trong localStorage.

#### API:

```javascript
import { authStore } from '../shared/auth-store.js';

// Set & Get Token
authStore.setToken(token);
const token = authStore.getToken();

// Set & Get User
authStore.setUser(user);
const user = authStore.getUser();

// Check authentication
const isAuth = authStore.isAuth();

// Get user role
const role = authStore.getUserRole();
const isDriver = authStore.hasRole('driver');

// Clear auth (logout)
authStore.clear();
```

#### Properties:

| Property | Type | Description |
|----------|------|-------------|
| `token` | string \| null | JWT token |
| `user` | object \| null | User object: `{ id, name, phone, role }` |
| `isAuthenticated` | boolean | Authentication status |

#### Methods:

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `setToken()` | token | void | Set JWT token |
| `getToken()` | - | string \| null | Get JWT token |
| `setUser()` | user | void | Set user data |
| `getUser()` | - | object \| null | Get user data |
| `clear()` | - | void | Clear all auth data |
| `isAuth()` | - | boolean | Check if authenticated |
| `getUserRole()` | - | string \| null | Get user role |
| `hasRole()` | role | boolean | Check if user has role |

#### Examples:

```javascript
// Example 1: Save user after login
authStore.setToken(response.token);
authStore.setUser(response.user);

// Example 2: Check authentication status
if (authStore.isAuth()) {
  const user = authStore.getUser();
  console.log(`Welcome ${user.name}`);
}

// Example 3: Check user role
if (authStore.hasRole('driver')) {
  // Show driver-specific features
}

// Example 4: Logout
authStore.clear();
```

### 3. `api.js` - API Communication Service

API Service cung cấp các method giao tiếp với backend API.

#### API Configuration:

```javascript
API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      SEND_OTP: '/auth/send-otp',
      VERIFY_OTP: '/auth/verify-otp',
      RESET_PASSWORD: '/auth/reset-password'
    }
  }
}
```

#### Methods:

```javascript
import * as api from '../shared/api.js';

// Generic API request
const data = await api.apiRequest(endpoint, options);

// Auth methods
const loginResponse = await api.login(phone, password);
const registerResponse = await api.register(userData);
const otpResponse = await api.sendOTP(phone, purpose);
const verifyResponse = await api.verifyOTP(phone, otp, purpose);
const resetResponse = await api.resetPassword(phone, otp, newPassword);
```

#### Features:

- ✅ Automatic Bearer token injection
- ✅ JSON content-type handling
- ✅ Error handling with meaningful messages
- ✅ Status code checking
- ✅ Supports custom headers

#### Examples:

```javascript
// Example 1: Login
try {
  const response = await api.login('+84987654321', 'password123');
  console.log('Token:', response.token);
  console.log('User:', response.user);
} catch (error) {
  console.error('Login failed:', error.message);
}

// Example 2: Send OTP
try {
  const response = await api.sendOTP('+84987654321', 'register');
  console.log('OTP sent successfully');
} catch (error) {
  console.error('Failed to send OTP:', error.message);
}

// Example 3: Custom API request with headers
const response = await api.apiRequest('/user/profile', {
  method: 'GET',
  headers: {
    'X-Custom-Header': 'value'
  }
});

// Example 4: POST request with body
const response = await api.apiRequest('/user/update', {
  method: 'POST',
  body: {
    name: 'John Doe',
    email: 'john@example.com'
  }
});
```

## 🔄 Integration Pattern

### Pattern 1: Service using Event Bus and Store

```javascript
// In auth.js (Service layer)
import { eventBus, AUTH_EVENTS } from '../shared/event-bus.js';
import { authStore } from '../shared/auth-store.js';
import * as api from '../shared/api.js';

export const loginUser = async (phone, password) => {
  try {
    const response = await api.login(phone, password);
    
    // Update store
    authStore.setToken(response.token);
    authStore.setUser(response.user);
    
    // Emit event for other services
    eventBus.emit(AUTH_EVENTS.LOGIN_SUCCESS, {
      user: response.user
    });
    
    return response;
  } catch (error) {
    // Emit failure event
    eventBus.emit(AUTH_EVENTS.LOGIN_FAILED, {
      error: error.message
    });
    throw error;
  }
};
```

### Pattern 2: Service listening to events from other services

```javascript
// In profile-service/profile.js (hypothetical)
import { eventBus, AUTH_EVENTS } from '../shared/event-bus.js';
import { authStore } from '../shared/auth-store.js';

// Initialize service
export function initProfileService() {
  // Listen to auth events
  eventBus.on(AUTH_EVENTS.LOGIN_SUCCESS, (data) => {
    console.log('User logged in, load profile for:', data.user.id);
    loadUserProfile(data.user.id);
  });
  
  eventBus.on(AUTH_EVENTS.LOGOUT, () => {
    console.log('User logged out, clear profile');
    clearProfile();
  });
}
```

### Pattern 3: Checking auth state in any service

```javascript
// In any service
import { authStore } from '../shared/auth-store.js';

export function checkAccess() {
  if (!authStore.isAuth()) {
    throw new Error('User not authenticated');
  }
  
  const user = authStore.getUser();
  if (!authStore.hasRole('driver')) {
    throw new Error('User is not a driver');
  }
  
  return user;
}
```

## 🔐 Security Considerations

1. **Token Management**
   - Token được lưu trong localStorage
   - Tự động thêm vào authorization header
   - Service sẽ kiểm tra token expiry (cần implement)

2. **API Communication**
   - Sử dụng HTTPS trong production
   - Bearer token authentication
   - Proper CORS handling

3. **Event Security**
   - Events không chứa sensitive data trực tiếp
   - Sensitive data được lưu trong store
   - Service có thể kiểm tra authentication state từ store

## 🚀 Best Practices

1. **Không share sensitive data qua events**
   ```javascript
   // ❌ WRONG - đang gửi password qua event
   eventBus.emit('auth:login', { phone, password });
   
   // ✅ RIGHT - chỉ gửi user info
   eventBus.emit(AUTH_EVENTS.LOGIN_SUCCESS, { user });
   ```

2. **Luôn cleanup subscriptions**
   ```javascript
   // Good - lưu unsubscribe function
   const unsubscribe = eventBus.on('event', handler);
   
   // Cleanup khi component unmount hoặc service stop
   unsubscribe();
   ```

3. **Kiểm tra auth state trước khi call API**
   ```javascript
   import { authStore } from '../shared/auth-store.js';
   
   if (!authStore.isAuth()) {
     throw new Error('Must login first');
   }
   ```

4. **Handle token expiry gracefully**
   ```javascript
   eventBus.on(AUTH_EVENTS.TOKEN_EXPIRED, () => {
     // Redirect to login
     // Show notification
     // Clear app state
   });
   ```

## 📚 References

- [Auth Service Documentation](../auth-service/README.md)
- [Main Architecture](../README.md)
