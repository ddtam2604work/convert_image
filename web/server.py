"""
OmniImage Studio — Local Web Application Server
Serves the web application on http://localhost:8080
"""

import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8080
WEB_DIR = os.path.dirname(os.path.abspath(__file__))

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

def main():
    print(f"Starting OmniImage Studio Web App at: http://localhost:{PORT}")
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print("Server running. Press Ctrl+C to stop.")
        try:
            webbrowser.open(f"http://localhost:{PORT}")
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == "__main__":
    main()
