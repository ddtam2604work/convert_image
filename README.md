# ✦ OmniImage Studio — Canva Magic Cutout & Image Processing Toolkit

> **Design with Empathy — Crafting Digital Visual Experiences That People Love**

Bộ công cụ xử lý, chuyển đổi định dạng và tách nền ảnh chuyên nghiệp với phong cách thẩm mỹ **Warm Editorial Cream & Mocha**, hỗ trợ cả phiên bản **Desktop App (Native Windows EXE)** và **Web Application (Interactive Canvas)**.

---

## 🌟 Các Tính Năng Nổi Bật

### 1. 🎨 Canva Magic Background Studio (Tách Nền Chuẩn Canva)
- **Tách nền thông minh 1-chạm**: Tự động nhận diện chủ thể và loại bỏ phông nền với đường viền mượt mà (smooth edge alpha matting).
- **Thay đổi phông nền linh hoạt**:
  - **Trong suốt**: Xuất ảnh PNG/WEBP không nền.
  - **Màu trơn thời thượng**: Bảng màu sẵn có (Trắng tinh khôi, Đen than, Kem Be ấm `#F8F5F0`, Nâu Mocha `#8C6849`, Xanh Sage `#5B7A58`, Be cát `#E2D7C8`) hoặc hộp thoại Color Picker chọn bất kỳ mã màu hex nào.
  - **Làm mờ hậu cảnh (Bokeh Blur)**: Giữ chủ thể nét căng, làm mờ phông nền phía sau giống chụp ảnh chân dung studio.
- **Hiệu ứng đồ họa độc quyền của Canva**:
  - **Đổ bóng mềm (Drop Shadow)**: Thêm bóng đổ tự nhiên dưới chân hoặc viền vật thể với tùy chỉnh độ lệch, độ mờ (blur radius) và độ trong suốt (opacity).
  - **Viền sáng / Nét bao quanh (Glow & Stroke Outline)**: Rất phổ biến cho thumbnail YouTube, nhãn dán sticker và sản phẩm thương mại điện tử.
- **Cọ vẽ tinh chỉnh thủ công**:
  - **Cọ Xóa (Erase)**: Xóa bớt các chi tiết thừa.
  - **Cọ Khôi Phục (Restore)**: Tô lại phần bị cắt nhầm trực tiếp trên canvas.
  - Hỗ trợ hoàn tác (Undo) và thanh trượt kích thước cọ vẽ.

### 2. 🔄 Chuyển Đổi Định Dạng & Nén Đa Năng
- Hỗ trợ chuyển đổi nhanh hàng loạt giữa các định dạng phổ biến: **WEBP, PNG, JPG, ICO, PDF, BMP, GIF, TIFF**.
- Tùy chỉnh chất lượng nén (10% - 100%) tối ưu dung lượng web.

### 3. 📐 Thay Đổi Kích Thước & Khung Hình (Presets)
- Cung cấp sẵn kích thước chuẩn cho mạng xã hội: Facebook Cover, Post, Instagram Vuông 1:1, Story 9:16, Twitter/X, YouTube Thumbnail/Banner, TikTok...
- Hỗ trợ khóa tỉ lệ khung hình (Lock Aspect Ratio) và 3 chế độ fit: *Kéo dãn (stretch)*, *Vừa khung (contain)*, *Lấp đầy (cover)*.

### 4. 🛡 Thủy Vân Bản Quyền & Xóa Logo (LSB Steganography)
- Nhúng logo ẩn bảo vệ bản quyền không làm biến dạng hình ảnh (chống xóa, trích xuất chính xác 100%).
- Bộ lọc quét và soi logo ẩn trong ảnh.
- Xóa logo hiện bằng thuật toán OpenCV inpainting.

---

## 💻 Hướng Dẫn Sử Dụng

### A. Chạy Ứng Dụng Desktop (Windows)
1. **Chạy trực tiếp file thực thi**:
   - Nhấp đúp vào `OmniImageStudio.exe` để mở ứng dụng ngay lập tức mà không cần cài đặt Python.
2. **Chạy từ mã nguồn**:
   ```bash
   python src/main_gui.py
   ```

### B. Chạy Ứng Dụng Trên Trình Duyệt (Web App)
1. **Mở trực tiếp**: Mở tệp `web/index.html` hoặc `index.html` trong bất kỳ trình duyệt nào (Chrome, Edge, Safari, Firefox).
2. **Khởi chạy Local Server**:
   ```bash
   python web/server.py
   ```
   Trình duyệt sẽ tự động mở địa chỉ: `http://localhost:8080`.

---

## 📁 Cấu Trúc Thư Mục

```text
convert_image/
├── OmniImageStudio.exe      # File thực thi Windows độc lập
├── index.html              # Trang chuyển hướng Web App cho GitHub Pages
├── web/                    # Ứng dụng Web Canva Cutout Studio
│   ├── index.html          # Giao diện Web phong cách Warm Editorial
│   ├── style.css           # Hệ thống CSS Neomorphic & Phone Mockup
│   ├── app.js              # Engine xử lý Canvas client-side
│   └── server.py           # Local HTTP Server
├── src/
│   ├── core_engine.py      # Bộ xử lý ảnh nền tảng (Pillow, OpenCV, GrabCut)
│   └── main_gui.py         # Giao diện Desktop CustomTkinter Warm Cream & Mocha
└── samples/                # Ảnh mẫu thử nghiệm (flower.png, cityscape.jpg)
```

---

*Thiết kế và phát triển bởi [ddtam2604work](https://github.com/ddtam2604work).*
