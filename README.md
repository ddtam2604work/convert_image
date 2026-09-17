# ✦ OmniImage Studio — Canva Magic Cutout & Image Processing Toolkit

> **Design with Empathy — Crafting Digital Visual Experiences That People Love**

Bộ công cụ xử lý, chuyển đổi định dạng và tách nền ảnh chuyên nghiệp với phong cách thẩm mỹ **Modern Creative Studio (Slate & Indigo)**, hỗ trợ cả phiên bản **Desktop App (Native Windows EXE)** và **Web Application (Interactive Canvas)**.

---

## 🌟 Các Tính Năng Nổi Bật

### 1. 🎨 Canva Magic Background Studio (Tách Nền Chuẩn Canva)
- **Tách nền thông minh 1-chạm**: Tự động nhận diện chủ thể và loại bỏ phông nền với đường viền mượt mà (smooth edge alpha matting).
- **Thay đổi phông nền linh hoạt**:
  - **Trong suốt**: Xuất ảnh PNG/WEBP không nền.
  - **Màu trơn thời thượng**: Bảng màu sẵn có (Trắng tinh khôi `#FFFFFF`, Xám nhạt `#F1F5F9`, Đen Slate `#0F172A`, Indigo `#4F46E5`, Emerald `#059669`, Blue `#3B82F6`) hoặc hộp thoại Color Picker chọn bất kỳ mã màu hex nào.
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

### 4. 🛡 Thủy Vân Bản Quyền & Xóa Logo Hiện (LSB Steganography & AI Inpainting)
- **Xóa & Cắt Logo Hiện (Visible Watermark Eraser & Edge Cropper)**:
  - **3 Chế độ xử lý linh hoạt**:
    - **✂️ Cắt bỏ viền chứa logo (Crop Out Edge)**: Tự động phát hiện và cắt xén dải viền/mép ảnh chứa watermark (dải đáy phụ đề, góc dưới TikTok/CapCut...), loại bỏ logo triệt để 100% và bảo toàn độ nét nguyên bản cho phần hình ảnh còn lại.
    - **⚡ Xóa sạch & Lấp đầy nền (Clean Fill)**: Lấy mẫu dải viền nền bên ngoài vùng chọn để xóa sạch chữ và lấp đầy nền tự nhiên, loại bỏ hoàn toàn hiện tượng nhòe hay bóng mờ chữ đen của phương pháp inpaint thông thường.
    - **🔲 Xóa thành trong suốt (Transparent)**: Xóa trực tiếp vùng logo thành trong suốt (Alpha = 0) cho ảnh PNG/WEBP.
  - Tích hợp presets chọn nhanh 4 góc phổ biến: **Góc dưới phải** (TikTok, CapCut), **Góc dưới trái** (dấu camera smartphone "Shot on..."), **Góc trên phải** (logo truyền hình), **Góc trên trái** (app logo), **Dải chữ nhật đáy** (phụ đề / banner).
  - Hỗ trợ **áp dụng cho toàn bộ danh sách ảnh hàng loạt (Batch Watermark Removal)**.
  - Bảo toàn 100% độ phân giải gốc của ảnh (High-Res Native Processing) — chỉ xử lý vùng chọn, giữ nguyên độ nét từng pixel ở các vùng khác.
- **Thủy vân ẩn bảo vệ bản quyền (LSB Steganography)**:
  - Nhúng logo ẩn bảo vệ bản quyền không làm biến dạng hình ảnh (chống xóa, trích xuất chính xác 100%).
  - Bộ lọc quét, soi và trích xuất logo ẩn trong ảnh.
  - Làm sạch / tẩy triệt để các watermark LSB ẩn.

---

## 💻 Hướng Dẫn Sử Dụng

### A. Chạy Ứng Dụng Desktop (Windows)
1. **Chạy trực tiếp file thực thi**:
   - Nhấp đúp vào `OmniImageStudio.exe` để mở ứng dụng ngay lập tức mà không cần cài đặt Python.
2. **Chạy từ mã nguồn**:
   ```bash
   python src/main_gui.py
   ```

### B. Chạy Ứng Dụng Trên Web (Truy Cập Ở Bất Cứ Đâu)

#### 1. 🌐 Truy cập Online miễn phí 24/7 (GitHub Pages):
Ứng dụng đã sẵn sàng chạy trực tiếp trên web mà không cần cài đặt gì:
👉 **[https://ddtam2604work.github.io/convert_image/](https://ddtam2604work.github.io/convert_image/)**

*(Để kích hoạt nếu chưa bật: Vào repo **Settings** ➔ **Pages** ➔ **Build and deployment** ➔ Chọn **Deploy from a branch** (nhánh `main`, thư mục `/root`) hoặc chọn **GitHub Actions**).*

#### 2. 📱 Truy cập từ điện thoại / iPad trong cùng mạng Wi-Fi:
Khởi chạy máy chủ nội bộ:
```bash
python server.py
```
Màn hình console sẽ hiển thị địa chỉ IP cục bộ, ví dụ:
- Máy tính: `http://localhost:8080`
- Điện thoại / iPad trong cùng Wi-Fi: `http://192.168.40.123:8080`

#### 3. 📲 Cài đặt thành App trên điện thoại (PWA):
Ứng dụng đã tích hợp **Progressive Web App (PWA)**:
- Mở link trên Safari (iOS) hoặc Chrome (Android).
- Chọn **"Thêm vào Màn hình chính"** (*Add to Home Screen*).
- Ứng dụng sẽ hoạt động mượt mà như một app độc lập trên điện thoại ngay cả khi mất mạng.

#### 4. 🚀 Triển khai 1-click lên Vercel / Netlify:
Đã tích hợp sẵn file cấu hình `vercel.json` và `netlify.toml`:
- Kết nối kho lưu trữ với [Vercel](https://vercel.com) hoặc [Netlify](https://netlify.com) để có tên miền riêng và CDN toàn cầu.

---

## 📁 Cấu Trúc Thư Mục

```text
convert_image/
├── OmniImageStudio.exe      # File thực thi Windows độc lập (75 MB)
├── index.html              # Web App chính (chạy trực tiếp trên GitHub Pages)
├── style.css               # Phong cách Modern Creative Studio & Responsive Layout
├── app.js                  # Engine xử lý Canvas client-side
├── manifest.json           # Cấu hình PWA (cài app trên điện thoại)
├── sw.js                   # Service Worker hỗ trợ offline & tải nhanh
├── server.py               # Máy chủ HTTP hỗ trợ chia sẻ qua mạng Wi-Fi
├── vercel.json             # Cấu hình triển khai Vercel
├── netlify.toml            # Cấu hình triển khai Netlify
├── .github/workflows/      # Tự động hóa triển khai GitHub Pages (deploy.yml)
├── web/                    # Thư mục web độc lập
├── src/
│   ├── core_engine.py      # Bộ xử lý ảnh nền tảng (Pillow, OpenCV, GrabCut)
│   └── main_gui.py         # Giao diện Desktop CustomTkinter Modern Creative Studio
└── samples/                # Ảnh mẫu thử nghiệm
```

---

*Thiết kế và phát triển bởi [ddtam2604work](https://github.com/ddtam2604work).*

