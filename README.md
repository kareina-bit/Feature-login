# Shipway – Frontend Micro-Frontend Architecture

## 1. Giới thiệu

Shipway Frontend được xây dựng theo mô hình **Micro-Frontend**, sử dụng **HTML, CSS, JavaScript thuần** (không framework).

Mỗi chức năng nghiệp vụ được tách thành **frontend service độc lập**, giúp:
- Dễ phát triển song song
- Dễ bảo trì
- Dễ mở rộng về sau

---

## 2. Công nghệ sử dụng

- HTML5
- CSS3
- JavaScript (ES6+)
- Không sử dụng framework (React, Vue, Angular)
- Giao tiếp bằng `CustomEvent`
- Routing thủ công bằng `hash (#)`

---

## 3. Nguyên tắc kiến trúc

- ❌ Không dùng SPA framework
- ✅ Mỗi service **độc lập**
- ✅ Shell App chỉ làm **điều phối**
- ✅ Service **không import trực tiếp service khác**
- ✅ Giao tiếp thông qua Event
- ✅ Mỗi service có HTML / CSS / JS riêng

---

## 4. Cấu trúc thư mục tổng thể

```text
/frontend
│
├─ /shell-app
│   ├─ index.html
│   ├─ shell.js
│   └─ router.js
│
├─ /auth-service
│   ├─ index.html
│   ├─ auth.js
│   └─ auth.css
│
├─ /profile-service
│   ├─ index.html
│   ├─ profile.js
│   └─ profile.css
│
├─ /kyc-service
│   ├─ index.html
│   ├─ kyc.js
│   └─ kyc.css
│
└─ /shared
    ├─ api.js
    ├─ event-bus.js
    └─ auth-store.js
