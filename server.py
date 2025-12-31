#!/usr/bin/env python3
"""
Simple HTTP server để chạy ứng dụng web
Chạy: python server.py
Sau đó mở trình duyệt tại: http://localhost:8000
"""

import http.server
import socketserver
import os
import sys

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Thêm CORS headers để hỗ trợ modules
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

if __name__ == "__main__":
    # Chuyển đến thư mục chứa index.html
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    Handler = MyHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"🚀 Server đang chạy tại: http://localhost:{PORT}")
            print(f"📁 Thư mục: {os.getcwd()}")
            print("💡 Mở trình duyệt và truy cập: http://localhost:8000")
            print("⚠️  Nhấn Ctrl+C để dừng server\n")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n✅ Server đã dừng")
        sys.exit(0)
    except OSError as e:
        if e.errno == 10048:  # Windows: Address already in use
            print(f"❌ Cổng {PORT} đã được sử dụng. Vui lòng chọn cổng khác.")
        else:
            print(f"❌ Lỗi: {e}")
        sys.exit(1)



