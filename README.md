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


