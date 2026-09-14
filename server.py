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

# Ensure UTF-8 output on Windows terminal
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

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
        try:
            sys.stderr.write(f"[{self.log_date_time_string()}] {args[0]} - {args[1]}\n")
        except Exception:
            pass

def main():
    local_ip = get_local_ip()
    print("=" * 64)
    print("  * LUMINA STUDIO PRO - LIGHT STUDIO PRECISION V2.4 *")
    print("=" * 64)
    print(f"\n  > May tinh hien tai (Localhost):")
    print(f"      http://localhost:{PORT}")
    print(f"\n  > Mang noi bo Wi-Fi (Dien thoai, iPad, Laptop):")
    print(f"      http://{local_ip}:{PORT}")
    print(f"\n  > Truy cap tu Internet (GitHub Pages):")
    print(f"      https://ddtam2604work.github.io/convert_image/")
    print("\n" + "-" * 64)
    print("  Nhan Ctrl+C de dung may chu.\n")

    # Allow address reuse
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("0.0.0.0", PORT), CustomHandler) as httpd:
            try:
                webbrowser.open(f"http://localhost:{PORT}")
            except Exception:
                pass
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\nDa dung may chu.")
    except Exception as e:
        print(f"Loi khoi dong server: {e}")

if __name__ == "__main__":
    main()
