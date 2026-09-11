"""
OmniImage Studio — Web Application Server
Serves the web application on localhost and across your local network (Wi-Fi).
Accessible from any device: PC, Mac, iPhone, iPad, Android.
"""

import http.server
import socketserver
import socket
import os
import sys
import webbrowser

PORT = 8080
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def log_message(self, format, *args):
        # Clean logging
        sys.stderr.write(f"[{self.log_date_time_string()}] {args[0]} - {args[1]}\n")

def main():
    local_ip = get_local_ip()
    print("=" * 60)
    print("  ✦ OMNIIMAGE STUDIO — CANVA CUTOUT WEB APPLICATION ✦")
    print("=" * 60)
    print(f"\n  ► Máy tính hiện tại (Localhost):")
    print(f"      http://localhost:{PORT}")
    print(f"\n  ► Mọi thiết bị khác trong mạng Wi-Fi (Điện thoại, iPad, Laptop khác):")
    print(f"      http://{local_ip}:{PORT}")
    print(f"\n  ► Truy cập từ mọi nơi trên Internet (GitHub Pages):")
    print(f"      https://ddtam2604work.github.io/convert_image/")
    print("\n" + "-" * 60)
    print("  Nhấn Ctrl+C để dừng máy chủ.\n")

    # Allow address reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", PORT), CustomHandler) as httpd:
        try:
            webbrowser.open(f"http://localhost:{PORT}")
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nĐã dừng máy chủ.")

if __name__ == "__main__":
    main()
