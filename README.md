# Việt phục Remix

Ứng dụng web 2D phối đồ Việt phục dành cho học sinh, sinh viên và giới trẻ Việt Nam để khám phá, tìm hiểu và thử nghiệm kết hợp giữa trang phục truyền thống (Áo ngũ thân, Áo giao lĩnh, Áo nhật bình, Áo tấc) với các món đồ hiện đại (Quần âu, Giày sneaker), đi kèm thẻ tư liệu văn hóa lật 3D và lời bình đánh giá độ hòa hợp văn hóa.

---

## 🌟 Tính Năng Chính

1. **Phòng Phối Đồ Trực Quan (2D Character Canvas)**:
   - Hai nhân vật Nam và Nữ với tư thế chuẩn 1080x1920.
   - Hệ thống layer chuẩn mực: Thân -> Giày -> Quần/Váy -> Áo -> Phụ kiện cổ -> Mũ/Phụ kiện đầu.
   - Tự động căn chỉnh trang phục với dữ liệu `fit.json` và quy chuẩn 85% character scale.

2. **Bối Cảnh Văn Hóa & Thanh Trượt Remix (Scenes & Remix Slider)**:
   - 4 không gian văn hóa đặc sắc: *Tết Hoàng Cung*, *Lễ hội dân gian*, *Kỷ yếu học đường*, *Dạo phố Hội An*.
   - Thanh trượt 3 cấp độ: Cổ điển (0 món), Cách tân nhẹ (1 món), Đột phá (2+ món).
   - Nhãn giới hạn bối cảnh (Scene Cap Badge) gợi ý hòa hợp văn hóa nhẹ nhàng, không ép buộc.

3. **Thẻ Tư Liệu Văn Hóa Lật 3D (Cultural Story Cards)**:
   - 12 danh mục trang phục, 10 bộ phối sẵn với tư liệu lịch sử, nguồn gốc và ý nghĩa.
   - Nhãn "Tư liệu đang đối chiếu" minh bạch cho những nội dung chưa được kiểm chứng học thuật.

4. **Chốt Bộ & Đánh Giá Văn Hóa Toàn Diện (Confirm Outfit & Result View)**:
   - Bộ quy tắc toàn diện (`lib/rules.ts`): Cảnh báo xung đột, chặn kết hợp sai quy chuẩn (ví dụ: vòng cổ với áo cổ đứng).
   - Lời bình văn hóa tự động tổng hợp từ từng chi tiết trang phục và bối cảnh.

5. **Xuất Ảnh 1080x1350 & Tủ Đồ Lookbook (Export & Lookbook)**:
   - Vẽ và xuất file ảnh PNG chất lượng cao 1080x1350 trực tiếp bằng HTML5 Canvas trên trình duyệt.
   - Tủ đồ cá nhân (Lookbook) lưu trữ hoàn toàn trong `localStorage` với cơ chế chống tràn bộ nhớ và khôi phục lỗi.

6. **Chia Sẻ Đa Nền Tảng (Full Sharing)**:
   - Web Share API hỗ trợ gửi trực tiếp file ảnh PNG trên thiết bị di động.
   - Nút chia sẻ trực tiếp tới Facebook, Threads, Zalo.
   - Tính năng sao chép lời bình & link bài đăng kèm gợi ý cho Instagram, TikTok.

---

## 🚀 Hướng Dẫn Triển Khai Lên Vercel

Dự án được thiết kế chuẩn tĩnh (Zero-Server-Write), hoàn toàn tương thích với kiến trúc Serverless / Edge của Vercel:

1. **Kết Nối Kho Mã Nguồn**:
   - Đẩy dự án lên GitHub.
   - Đăng nhập Vercel -> Chọn **Add New Project** -> Import repository GitHub này.

2. **Cấu Hình Dự Án Trên Vercel**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./`
   - **Install Command**: `npm ci`
   - **Build Command**: `npm run build` (lệnh `prebuild` tự động đồng bộ tài nguyên PNG vào `public/assets`).
   - **Output Directory**: Mặc định của Next.js (`.next`).

3. **Biến Môi Trường (Environment Variables)**:
   - `NEXT_PUBLIC_SITE_URL`: Địa chỉ tên miền chính thức của bạn (ví dụ: `https://vietmix.vercel.app`). Nếu không đặt, hệ thống sẽ tự động dùng `VERCEL_URL`.
   - `ENABLE_FIT`: Giữ trống hoặc đặt `0` trên môi trường Production để vô hiệu hóa công cụ nội bộ `/fit` (trả về lỗi 404).

---

## 💻 Lệnh Phát Triển & Kiểm Tra

- `npm run dev`: Khởi chạy Next.js development server
- `npm run build`: Tạo bản build tối ưu cho production
- `npm test`: Chạy toàn bộ 29+ test suite kiểm thử với Vitest
- `npm run check`: Kiểm tra toàn diện cả build và test (`npm run build && npm test`)

