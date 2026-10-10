# CHECKLIST CHUẨN BỊ TRƯỚC KHI QUAY VIDEO DEMO VIETMIX
**Mục tiêu:** Đảm bảo video quay mượt mà, chuyên nghiệp, không vấp nút bấm, không dính lỗi kỹ thuật và không có yếu tố gây phân tâm.

---

## 1. THIẾT LẬP MÔI TRƯỜNG & THIẾT BỊ (PRE-FLIGHT)

- [ ] **Kích thước cửa sổ & Tỷ lệ hiển thị:**
  - Độ phân giải khuyến nghị: **1920 × 1080 (Full HD, 16:9)**.
  - Mức Zoom trình duyệt: Để đúng **100%** (Ctrl + 0).
  - Ẩn thanh Bookmark (Ctrl + Shift + B trên Chrome/Edge).
  - Khuyến nghị dùng chế độ toàn màn hình (F11) hoặc crop khung hình gọn gàng trong OBS / phần mềm quay màn hình.

- [ ] **Tắt thông báo & Làm sạch màn hình:**
  - Bật chế độ **Focus Assist** (Windows) / **Do Not Disturb** để chặn toàn bộ thông báo hệ thống.
  - Tắt hoặc ẩn các ứng dụng chat nền: Zalo, Telegram, Messenger, Skype, Outlook, Email.
  - Tắt các extension trình duyệt hiển thị pop-up hoặc icon lạ ở thanh công cụ.

- [ ] **Cân bằng âm thanh (Audio Balance):**
  - **Microphone:** Thử thu âm thử 10 giây để kiểm tra độ rõ của giọng nói, khoảng cách mic vừa phải, tránh thở vào mic hoặc tạp âm quạt gió.
  - **Nhạc nền BGM trên web:**
    - Trình duyệt chặn tự động phát nhạc khi vừa load trang (Autoplay policy). **Hãy click chuột 1 lần vào trang hoặc bấm icon Loa ở góc trên bên phải để kích hoạt nhạc nền trước khi bấm quay.**
    - Bấm vào icon Loa, kéo thanh trượt âm lượng về mức **10% – 15%** để tiếng nhạc du dương êm dịu làm nền, tuyệt đối không lấn át lời thuyết minh.
    - *(Lựa chọn khác)*: Nếu dự định lồng nhạc nền ở khâu hậu kỳ video, hãy bấm tắt âm thanh trên web (Mute).

- [ ] **Preload bộ nhớ đệm (Cache ảnh):**
  - Mở web và click lướt qua các bối cảnh (Tết, Kỷ yếu, Hội An) và các tab Tủ đồ (Áo, Quần/Váy, Giày, Phụ kiện) 1 lần để trình duyệt tải sẵn toàn bộ hình ảnh vào bộ nhớ đệm. Khi quay chính thức, hình ảnh sẽ hiển thị ngay lập tức không có độ trễ.

---

## 2. CHUẨN BỊ DỮ LIỆU MẪU CHO LOOKBOOK

Để phân cảnh mở Album Lookbook có sẵn các tác phẩm mẫu đẹp mắt, 3 bộ trang phục đã được cấu hình sẵn trong mã nguồn:

### Danh mục 3 bộ mẫu chuẩn:
1. **Bộ Cổ điển:** *"Tết Hoàng Cung • Ngũ Thân Đoan Trang"*
   - Trang phục: Nữ • Áo ngũ thân + Quần lụa trắng + Giày vải đen + Trâm cài bạc.
   - Bối cảnh: Tết truyền thống (Mốc 0 Cổ điển).
2. **Bộ Remix Đương đại:** *"Dạo Phố Hội An • Giao Lĩnh Cách Tân"*
   - Trang phục: Nữ • Áo giao lĩnh + Quần ống rộng be hiện đại + Sneaker trắng.
   - Bối cảnh: Đời thường / Hội An (Mốc 2 Đương đại).
3. **Bộ Bối cảnh đặc biệt:** *"Kỷ Yếu Sân Trường • Nhật Bình Thanh Xuân"*
   - Trang phục: Nữ • Áo nhật bình + Váy dài đen + Giày vải đen + Nón lá.
   - Bối cảnh: Kỷ yếu sân trường (Mốc 0 Cổ điển).

### Cách nạp dữ liệu mẫu vào máy (Chỉ cần làm 1 lần trước khi quay):
- **Cách 1 (Nhanh nhất - Khuyên dùng):**  
  Mở trình duyệt và truy cập vào đường link có gắn tham số `?demo=1`:
  - Bản Online: `https://vietmix.vercel.app/lookbook?demo=1`
  - Hoặc Bản Local: `http://localhost:3000/lookbook?demo=1`  
  *(Hệ thống sẽ tự động nạp 3 bộ mẫu vào IndexedDB của trình duyệt mà KHÔNG xóa hoặc ghi đè bất kỳ dữ liệu cá nhân nào trước đó).*
- **Cách 2 (Qua Console):**  
  Nhấn F12 mở DevTools $\rightarrow$ chọn tab Console $\rightarrow$ gõ lệnh:
  ```javascript
  window.seedVietmixDemo()
  ```
  Nhấn Enter $\rightarrow$ Làm mới trang là 3 bộ mẫu đã sẵn sàng trong Lookbook.

---

## 3. CÁCH ĐƯA ỨNG DỤNG VỀ TRẠNG THÁI ĐẦU ĐỂ BẮT ĐẦU QUAY

Mỗi khi muốn quay lại từ đầu (Take mới):
1. Mở lại đường dẫn trang chủ: `https://vietmix.vercel.app/` (hoặc `http://localhost:3000/`).
2. Click chuột 1 điểm vào trang chủ để nhạc BGM bắt đầu phát ở mức âm lượng 10% – 15%.
3. Không cần xóa IndexedDB hay reset dữ liệu, để các bộ mẫu trong Lookbook được giữ nguyên cho phần sau của video.
4. Bắt đầu bấm nút ghi hình trên OBS / phần mềm quay màn hình.

---

## 4. BẢNG THAO TÁC BẤM CHUẨN XÁC KHI QUAY (CHEAT-SHEET)

Người quay chỉ cần làm đúng thứ tự các cú click dưới đây để không phải tìm nút:

| Bước | Vị trí màn hình | Thao tác cần click | Kết quả hiển thị |
| :---: | :--- | :--- | :--- |
| **1** | Trang chủ (`/`) | Click nút lớn **"BẮT ĐẦU PHỐI ĐỒ"** | Chuyển ngay vào phòng thử đồ `/dress-up`. |
| **2** | Góc trên phòng thử đồ | Click chọn nút **"Nữ"** (nếu đang ở Nam) | Canvas đổi sang hình nhân vật nữ cơ bản. |
| **3** | Dưới chân Canvas | Click thẻ bối cảnh **"Đời thường"** (Hội An) | Bối cảnh chuyển sang phố cổ lồng đèn. |
| **4** | Tủ đồ bên phải | **Tab Áo** $\rightarrow$ Click **"Áo Giao Lĩnh"** | Áo Giao Lĩnh khoác lên nhân vật. |
| **5** | Tủ đồ bên phải | **Tab Quần/Váy** $\rightarrow$ Click **"Quần Ống Rộng Be"** | Quần cạp cao hiện đại hiển thị; vạt áo sơ vin gọn gàng. |
| **6** | Tủ đồ bên phải | **Tab Giày** $\rightarrow$ Click **"Sneaker Trắng"** | Đôi sneaker trắng xuất hiện; thanh Remix nhảy lên Mốc 2. |
| **7** | Dưới tủ đồ | Click vào thẻ **"Áo Giao Lĩnh"** trong hàng Thẻ văn hóa | Thẻ xoay lật 3D sang mặt sau hiện thông tin lịch sử. |
| **8** | Cột trái | Click nút lớn **"CHỐT BỘ TRANG PHỤC"** | Mở màn hình kết quả `ResultView`. |
| **9** | Màn hình kết quả | Click nút **"TẢI ẢNH THẺ (PNG)"** | Trình duyệt tải file `viet-phuc-remix-female-....png` về máy; hiện toast xanh. |
| **10** | Màn hình kết quả | Click nút **"Chia sẻ"** $\rightarrow$ Click **"Sao chép Caption & Hashtag"** | Sao chép thành công nội dung bài viết. Đóng modal chia sẻ. |
| **11** | Màn hình kết quả | Click nút **"Album Lookbook"** (hoặc "Lưu vào Lookbook") | Mở Album Lookbook hiển thị 3 bộ mẫu có ảnh thumbnail sắc nét. |
| **12** | Modal Lookbook | Di chuột qua 3 thẻ mẫu, click nút **"Mặc lại"** trên bộ Kỷ Yếu hoặc Giao Lĩnh | Trang phục được nạp lại tức thì vào phòng thử đồ để người dùng sáng tạo tiếp. |

---

## 5. DANH SÁCH LỖI TIỀM ẨN CẦN TRÁNH KHI QUAY

| Rủi ro kỹ thuật | Nguyên nhân | Phương án xử lý chuẩn trong video |
| :--- | :--- | :--- |
| **Hộp thoại chia sẻ Web Share API không hiện trên Desktop** | Web Share API của trình duyệt máy tính bàn thường không hỗ trợ chia sẻ trực tiếp file ảnh như điện thoại. | **Phương án chuẩn:** Kịch bản đã định hướng rõ: Bấm **"Tải ảnh thẻ (PNG)"** và bấm **"Sao chép Caption & Hashtag"**. Đây là luồng thực tế hoạt động 100% trên mọi nền tảng, không phụ thuộc hệ điều hành. |
| **Nhạc nền không kêu khi vừa vào web** | Chính sách bảo mật của trình duyệt chặn autoplay âm thanh trước khi có tương tác người dùng. | Nhấp chuột vào trang 1 lần hoặc nhấp nút Loa trước khi bấm nút Record video. |
| **Lật thẻ văn hóa hoặc đổi áo bị chậm khung hình** | Do máy tính quay màn hình ở độ phân giải quá cao hoặc chạy nhiều ứng dụng nặng ngầm. | Tắt các ứng dụng đồ họa nặng (Photoshop, Premiere, Docker) trước khi quay; thao tác dứt khoát và dừng lại 1-2 giây ở mỗi thao tác để khung hình video bắt kịp. |
| **Lookbook ban đầu bị trống trơn** | Chưa nạp dữ liệu mẫu trước khi quay. | Luôn vào link `?demo=1` trước để nạp sẵn 3 bộ mẫu đẹp vào Lookbook trước khi bắt đầu bấm máy. |
