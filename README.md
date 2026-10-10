# 🇻🇳 VIETMIX – Nền Tảng Phối Đồ Việt Phục Tương Tác & Khám Phá Văn Hóa

> **Bản thử nghiệm văn hóa & phong cách Việt**  
> *Số hóa di sản trang phục truyền thống, kết nối giới trẻ cùng vẻ đẹp ngàn năm qua trải nghiệm thời trang tương tác trực quan.*

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.8-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-33%20Suites%20%7C%20211%20Tests%20Passed-green?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel%20Production-black?style=flat-square&logo=vercel)](https://vietmix.vercel.app)

---

## 🌐 Trải Nghiệm Trực Tuyến

* 🚀 **Trang chủ chính thức:** [https://vietmix.vercel.app](https://vietmix.vercel.app)
* 👗 **Phòng thử đồ tương tác:** [https://vietmix.vercel.app/dress-up](https://vietmix.vercel.app/dress-up)
* 📖 **Album Lookbook cá nhân:** [https://vietmix.vercel.app/lookbook](https://vietmix.vercel.app/lookbook)
* 📦 **Mã nguồn GitHub:** [https://github.com/lionels-kayden/vietmix.git](https://github.com/lionels-kayden/vietmix.git)

---

## 💡 Giới Thiệu Dự Án

Cổ phục Việt Nam (Áo ngũ thân, Áo giao lĩnh, Áo nhật bình, Áo tấc...) đang trở thành niềm tự hào lớn của thế hệ trẻ. Tuy nhiên, rào cản về phom dáng, cách phối phụ kiện và bối cảnh lịch sử khiến nhiều bạn trẻ còn e ngại khi muốn thử nghiệm và ứng dụng vào đời sống.

**Vietmix** ra đời như một giải pháp số hóa thời trang văn hóa tương tác dành cho học sinh, sinh viên và người sáng tạo nội dung:
1. **Khám phá trực quan:** Cho phép ướm thử trang phục lên mô hình nhân vật 2D chuẩn tỷ lệ, đổi bối cảnh không gian chỉ sau vài thao tác chạm.
2. **Hiểu sâu di sản:** Tích hợp Thẻ tri thức văn hóa (Story Cards) lật 3D cung cấp nguồn gốc, thời kỳ lịch sử và ý nghĩa hoa văn cho từng món đồ.
3. **Sáng tạo có định hướng:** Cung cấp Thước đo phong cách (Remix Slider) đo lường độ giao thoa giữa cổ phục và thời trang hiện đại (quần ống rộng, sneaker) cùng hệ thống kiểm tra quy tắc lễ nghi (Rule Engine).

---

## ✨ Các Tính Năng Nổi Bật

### 1. 👘 Phòng Phối Đồ Trực Quan & Phân Lớp Thông Minh (Smart Layering)
- **Tùy chọn nhân vật:** Hỗ trợ mô hình Nam và Nữ với góc đứng phẳng chuẩn tỷ lệ.
- **Tủ đồ 4 danh mục:** Áo, Quần/Váy, Giày dép, Phụ kiện (Trâm cài, Nón lá...).
- **Cơ chế phân tầng tự động (Conditional Layering):** Tự động nhận diện xung đột trang phục — ví dụ: khi kết hợp Áo Giao Lĩnh cổ phong cùng Quần ống rộng hoặc Váy cạp cao hiện đại, hệ thống tự động đổi sang biến thể đồ họa sơ vin (`F_B_TOP_ao_giao_linh_in_skirt`), đảm bảo độ khớp 100% về mặt thị giác.

### 2. 🏮 Bối Cảnh Văn Hóa & Thước Đo Phong Cách (Remix Engine)
- **4 không gian bối cảnh đặc sắc:**
  - *Tết Hoàng Cung* (Trang nghiêm, cổ điển)
  - *Kỷ Yếu Sân Trường* (Thanh xuân, duyên dáng)
  - *Lễ Hội Dân Gian* (Rực rỡ, hội hè)
  - *Dạo Phố Hội An* (Trầm mặc, thơ mộng)
- **Thước đo Remix 3 cấp độ:**
  - `Mốc 0 - Cổ điển`: 100% thuần cổ phục, giữ trọn quy chuẩn truyền thống.
  - `Mốc 1 - Giao thoa`: Kết hợp hài hòa nét xưa và nay.
  - `Mốc 2 - Đương đại`: Phối đồ phá cách, trẻ trung, năng động.
- **Huy hiệu tương thích (SceneCapBadge):** Tự động đánh giá sự phù hợp giữa phong cách trang phục và bối cảnh.

### 3. 📜 Thẻ Tri Thức Văn Hóa Lật 3D (Cultural Story Cards)
- Mỗi món đồ đi liền với một thẻ thông tin tương tác với hiệu ứng xoay lật 3D.
- Mặt sau cung cấp ngắn gọn: Niên đại/Thời kỳ, Nguồn gốc, Dịp mặc phù hợp, Gợi ý phối đồ và Nguồn tư liệu tham khảo.

### 4. ⚖️ Kiểm Tra Quy Tắc & Màn Hình Kết Quả (Rule Engine & ResultView)
- Hệ thống kiểm tra quy tắc (`lib/rules.ts`): Cảnh báo nếu có sự xung đột trang phục trước khi chốt bộ.
- Màn hình kết quả tổng thể với lời bình văn hóa tự động tổng hợp từ trang phục và bối cảnh đã chọn.

### 5. 📸 Xuất Thẻ Ảnh Thời Trang 1080×1350 & Chia Sẻ
- Render trực tiếp thẻ thời trang tỷ lệ vàng 4:5 (1080 × 1350 px) bằng HTML5 Canvas trên trình duyệt.
- Tích hợp khung viền thẩm mỹ, mã QR truy xuất nguồn gốc và lời bình văn hóa.
- Tải ngay file ảnh PNG chất lượng cao về máy (chạy ổn định 100% trên cả Desktop và Mobile).
- Hỗ trợ sao chép Caption & Hashtag sẵn sàng chia sẻ lên Facebook, Threads, Instagram, TikTok.

### 6. 📚 Album Lookbook Lưu Trữ Ngoại Tuyến (IndexedDB Storage)
- Lưu giữ các bộ trang phục tâm đắc trực tiếp vào cơ sở dữ liệu **IndexedDB** trên trình duyệt của người dùng.
- Hiển thị danh sách thẻ kèm ảnh thu nhỏ (thumbnail), hỗ trợ tải lại ảnh, xóa hoặc **"Mặc lại để chỉnh sửa" (Re-wear)**.
- Hoàn toàn bảo mật quyền riêng tư, không yêu cầu đăng nhập tài khoản đám mây rườm rà.

### 7. 🎵 Âm Nhạc Truyền Thống Đương Đại (BgmPlayer)
- Tích hợp trình phát nhạc nền dân tộc du dương nhẹ nhàng.
- Bộ điều khiển âm lượng đa nấc ở góc phải màn hình, mặc định 10%–15% không gây chói tai hay lấn giọng nói khi quay video/livestream.

---

## 🤖 Quy Trình Phát Triển & Ứng Dụng Đa Mô Hình AI (Multi-Model AI Workflow)

Dự án Vietmix áp dụng chiến lược phối hợp các mô hình AI chuyên biệt để tối ưu hóa hiệu năng ở từng giai đoạn:

```
[ Ý tưởng kiến trúc ] ────────► Claude (Xây dựng kế hoạch tổng thể - High-Level Architecture)
                                   │
                                   ▼
[ Phân rã kỹ thuật ] ────────► Codex (Lập kế hoạch chi tiết từng bước - Implementation Plan)
                                   │
                                   ▼
[ Thực thi & QA ]   ────────► Antigravity IDE (Agentic Coding, Tự động hóa kiểm thử & Refactor)
                                   │
                                   ▼
[ Thị giác & Đồ họa ] ────────► Google Gemini (Multimodal Vision & Prompt Engineering theo "Luật v3")
                                   │
                                   ▼
[ Sinh Asset Đồ họa ] ────────► Banana Model (Render sprite sheet trang phục đơn lớp nền trong suốt)
```

* **Google Gemini (Vision & Prompting Master):** Đảm nhiệm khâu cốt lõi về thị giác và văn hóa. Gemini tiếp nhận đồng thời ảnh nhân vật nền và ảnh tư liệu cổ phục thực tế, áp dụng bộ quy chuẩn **"Luật Sinh Ảnh Tách Lớp v3"** (với 7 RULE khắt khe về từ vựng, thứ tự mô tả, góc nhìn, buông tay 10 độ và triệt tiêu lỗi hallucination) để sinh ra bộ prompt tạo ảnh chuẩn xác cho mô hình Banana.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Thành phần | Công nghệ / Thư viện | Vai trò |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.8 (App Router) | Khung ứng dụng chính, Static Site Generation (SSG) |
| **Thư viện UI** | React 19, Tailwind CSS | Xây dựng giao diện Responsive, hiệu năng cao |
| **Ngôn ngữ** | TypeScript 5 | Định kiểu tĩnh nghiêm ngặt cho toàn bộ hệ thống dữ liệu |
| **Đồ họa** | HTML5 Canvas 2D API | Xử lý phân tầng hiển thị và kết xuất ảnh thẻ 1080x1350 |
| **Lưu trữ Client** | IndexedDB API + LocalStorage fallback | Lưu trữ Album Lookbook cục bộ trên thiết bị |
| **Biểu tượng** | Lucide React | Hệ thống icon tối giản, hiện đại |
| **Kiểm thử** | Vitest + React Testing Library | 33 test suites với 211 bài kiểm thử tự động |
| **Triển khai** | Vercel Edge Network | Mạng phân phối toàn cầu, độ trễ thấp |

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
vietmix/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Trang chủ Vietmix (Landing page)
│   ├── dress-up/page.tsx       # Phòng phối đồ tương tác chính
│   ├── lookbook/page.tsx       # Trang Album Lookbook độc lập
│   ├── fit/page.tsx            # Công cụ căn chỉnh fit nội bộ (Security-gated)
│   └── components/             # Các thành phần giao diện
│       ├── CharacterCanvas.tsx # Bộ dựng hình phân tầng Canvas 2D
│       ├── Wardrobe.tsx        # Tủ đồ 4 tab danh mục trang phục
│       ├── SceneSelector.tsx   # Bộ chọn 4 không gian bối cảnh
│       ├── RemixSlider.tsx     # Thước đo phong cách Cổ điển - Đương đại
│       ├── StoryCard.tsx       # Thẻ tri thức văn hóa xoay lật 3D
│       ├── ResultView.tsx      # Màn hình kết quả & xuất ảnh thẻ PNG
│       ├── LookbookModal.tsx   # Hộp thoại Album Lookbook trong phòng thử đồ
│       ├── ShareModal.tsx      # Hộp thoại chia sẻ đa nền tảng
│       └── BgmPlayer.tsx       # Trình phát nhạc nền dân tộc đương đại
├── data/                       # Dữ liệu văn hóa & cấu hình trang phục
│   ├── items.json              # Danh mục trang phục (Áo, quần, giày, phụ kiện)
│   ├── scenes.json             # Danh mục bối cảnh văn hóa
│   ├── stories.json            # Dữ liệu tri thức lịch sử & nguồn gốc
│   ├── presets.json            # Các bộ phối mẫu chuẩn mực
│   └── fit.json                # Tọa độ và tỷ lệ căn chỉnh từng món đồ
├── lib/                        # Thư viện xử lý logic & thuật toán
│   ├── outfit.ts               # Logic trang bị, tháo bỏ trang phục
│   ├── rules.ts                # Bộ quy tắc kiểm tra tính hòa hợp văn hóa
│   ├── remix.ts                # Thuật toán tính điểm Thước đo Remix
│   ├── exportCanvas.ts         # Thuật toán dựng ảnh thẻ Canvas 1080x1350 & QR
│   ├── lookbook.ts             # Cơ sở dữ liệu IndexedDB cho Album Lookbook
│   └── share.ts                # Bộ điều phối Web Share API & Copy Caption
├── scripts/                    # Scripts tự động hóa
│   └── sync_assets.mjs         # Đồng bộ tài nguyên ảnh/âm thanh sang public/
├── DEMO_SCRIPT.md              # Kịch bản quay video demo sản phẩm (3 phút)
├── DEMO_CHECKLIST.md           # Hướng dẫn kỹ thuật và danh sách kiểm tra trước khi quay
└── README.md                   # Tài liệu giới thiệu dự án
```

---

## 💻 Cài Đặt & Chạy Cục Bộ (Local Development)

### Yêu cầu môi trường:
- Node.js version 18 trở lên (Khuyến nghị Node.js 20+).
- Trình quản lý gói `npm`.

### Các bước khởi chạy:
```bash
# 1. Clone kho mã nguồn về máy
git clone https://github.com/lionels-kayden/vietmix.git
cd vietmix

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Chạy môi trường phát triển (Development Server)
npm run dev
```

Mở trình duyệt và truy cập: `http://localhost:3000`

---

## 🧪 Kiểm Thử Tự Động (Automated Testing)

Toàn bộ hệ thống được bảo vệ bởi bộ kiểm thử tự động toàn diện:

```bash
# Chạy toàn bộ 211 test cases với Vitest
npm test

# Chạy kiểm tra kết hợp cả Build và Test
npm run check
```

---

## 📜 Tài Liệu Phục Vụ Trình Diễn & Báo Cáo

- 🎬 [DEMO_SCRIPT.md](DEMO_SCRIPT.md): Kịch bản quay video demo sản phẩm chi tiết theo từng giây (~3 phút, tiếng Việt).
- ✅ [DEMO_CHECKLIST.md](DEMO_CHECKLIST.md): Danh mục kiểm tra thiết lập màn hình, âm thanh BGM, dữ liệu mẫu và thứ tự thao tác bấm nút.

---

## 🏛️ Bản Quyền & Tuyên Bố Văn Hóa

* **Sứ mệnh văn hóa:** Vietmix được phát triển với tinh thần tôn vinh và lan tỏa di sản văn hóa truyền thống Việt Nam đến thế hệ trẻ.
* **Tư liệu lịch sử:** Các dữ liệu trang phục và niên đại lịch sử được tổng hợp từ nguồn khảo cứu văn hóa cổ truyền. Các chi tiết sáng tạo cách tân đương đại được phân định rõ ràng trên Thước đo Remix để người dùng phân biệt giữa cổ phục nguyên bản và trang phục cách tân.

---
*© 2026 Vietmix Team. Phát triển với tình yêu dành cho Cổ phục Việt Nam.*
