# Hướng dẫn chạy ứng dụng

## Vấn đề
Khi mở file `index.html` trực tiếp từ file system, trình duyệt sẽ **không tải được** các file JavaScript dạng ES6 modules do chính sách CORS.

## Giải pháp: Chạy qua HTTP Server

### Cách 1: Dùng Python (Khuyến nghị)

1. **Mở PowerShell hoặc Command Prompt**
2. **Di chuyển vào thư mục Feature-login:**
   ```bash
   cd Feature-login
   ```

3. **Chạy server:**
   ```bash
   python server.py
   ```
   Hoặc double-click vào file `server.bat`

4. **Mở trình duyệt** và truy cập:
   ```
   http://localhost:8000
   ```

### Cách 2: Dùng Node.js (nếu đã cài)

```bash
cd Feature-login
npx http-server -p 8000
```

### Cách 3: Dùng VS Code Live Server Extension

1. Cài đặt extension "Live Server" trong VS Code
2. Click chuột phải vào file `index.html`
3. Chọn "Open with Live Server"

## Lưu ý

- ⚠️ **Không thể** mở trực tiếp file `index.html` bằng cách double-click
- ✅ **Phải** chạy qua HTTP server
- 🔧 Nếu cổng 8000 bị chiếm, sửa `PORT = 8000` trong `server.py` thành số khác

---

## 🧪 TÀI KHOẢN TEST

Hệ thống sẽ tự động tạo một tài khoản test khi lần đầu chạy:

### Tài khoản đã có sẵn:
- **📱 Số điện thoại:** `0123456789`
- **🔑 Mật khẩu:** `test123`
- **👤 Tên:** Nguyễn Văn Test

### Các trường hợp test:

#### ✅ 1. Đăng nhập thành công
- Số điện thoại: `0123456789`
- Mật khẩu: `test123`
- **Kết quả:** Hiển thị "Đăng nhập thành công" (sẽ redirect sau 1 giây)

#### ❌ 2. Đăng nhập với số điện thoại sai
- Số điện thoại: `0999999999` (hoặc bất kỳ số nào khác)
- Mật khẩu: `test123`
- **Kết quả:** Hiển thị "Tài khoản không tồn tại"

#### ❌ 3. Đăng nhập với mật khẩu sai
- Số điện thoại: `0123456789`
- Mật khẩu: `sai123`
- **Kết quả:** Hiển thị "Sai mật khẩu"

#### ✅ 4. Đăng ký thành công
1. Nhập số điện thoại mới (ví dụ: `0987654321`)
2. Click "Gửi mã OTP"
3. **Kiểm tra Console (F12)** hoặc popup để xem mã OTP
4. Nhập mã OTP, tên và mật khẩu
5. Click "Đăng ký"
- **Kết quả:** Hiển thị "Đăng ký thành công"

#### ❌ 5. Đăng ký với số điện thoại đã tồn tại
- Số điện thoại: `0123456789` (đã có sẵn)
- **Kết quả:** Hiển thị "Tài khoản đã tồn tại"

#### ❌ 6. Nhập sai OTP khi đăng ký
1. Gửi OTP cho số điện thoại mới
2. Nhập OTP sai (ví dụ: `000000`)
- **Kết quả:** Hiển thị "OTP không hợp lệ"

#### ✅ 7. Quên mật khẩu - Nhập đúng số điện thoại
1. Click "Quên mật khẩu"
2. Nhập số điện thoại: `0123456789`
3. Click "Gửi mã OTP"
4. **Kiểm tra Console (F12)** hoặc popup để xem mã OTP
5. Nhập OTP đúng, mật khẩu mới và xác nhận mật khẩu
6. Click "Đặt lại mật khẩu"
- **Kết quả:** Hiển thị "Đặt lại mật khẩu thành công"

#### ❌ 8. Quên mật khẩu - Nhập sai số điện thoại
- Số điện thoại: `0999999999` (không tồn tại)
- **Kết quả:** Hiển thị "Tài khoản không tồn tại"

#### ❌ 9. Quên mật khẩu - Nhập sai OTP
1. Nhập số điện thoại đúng: `0123456789`
2. Gửi OTP
3. Nhập OTP sai
- **Kết quả:** Hiển thị "Mã OTP không đúng"

#### ❌ 10. Quên mật khẩu - Mật khẩu xác nhận không khớp
1. Nhập OTP đúng
2. Mật khẩu mới: `newpass123`
3. Xác nhận mật khẩu: `newpass456` (khác)
- **Kết quả:** Hiển thị "Mật khẩu xác nhận không khớp"

## 📝 Lưu ý khi test:

1. **Mã OTP sẽ hiển thị:**
   - Trong Console của trình duyệt (F12 → Console)
   - Trong popup thông báo trên màn hình (nếu có)

2. **Dữ liệu được lưu trong:**
   - `localStorage` (tài khoản người dùng)
   - `sessionStorage` (mã OTP - sẽ mất khi đóng tab)

3. **Để reset dữ liệu test:**
   - Mở Console (F12)
   - Chạy: `localStorage.clear()` và `sessionStorage.clear()`
   - Refresh trang để tạo lại tài khoản test



