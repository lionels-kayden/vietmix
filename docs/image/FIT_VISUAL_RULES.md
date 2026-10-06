# Quy tắc fit từ mẫu nam A

Ngày 2026-10-06. Đây là tiêu chí mỹ thuật cho bộ nam A, không phải quy chuẩn lịch sử
hay tỷ lệ giải phẫu cố định. Mẫu: reports/p3a-review/references/approved-style.png.
Người dùng thấy cổ bản single-A ổn, nhưng chưa duyệt bàn tay và tỷ lệ quần/giày.

## 1. Cửa tay phải ôm đúng cổ tay

- Mẫu có trục cẳng tay đi xuyên qua cửa tay rồi nối tự nhiên sang bàn tay; độ rộng
  cửa tay chỉ có khoảng dư vải hợp lý quanh cổ tay. Không lấy điểm thấp nhất ống tay
  làm mốc và không chỉ kiểm tra bàn tay có xuất hiện hay không.
- Bản hiện tại có mảng đỏ hình bầu dục rộng, đọc như miệng ống rỗng đặt trên bàn tay;
  thiếu cảm giác cổ tay đi vào trong tay áo. Đây là lỗi quan hệ cửa tay/cổ tay và chiều
  sâu, không đủ bằng việc đưa cả bàn tay lên lớp trên.
- Đánh dấu riêng hai mép cổ tay, trục cẳng tay, mép sau và mép trước cửa tay trên ảnh
  thật. Đưa cổ tay vào lòng cửa tay; mép trước che nhẹ phần tiếp giáp, mép sau nằm sau
  cổ tay. Mảng tối/đỏ bên trong chỉ còn phần thực sự nhìn thấy quanh cổ tay.
- Giữ nguyên bàn tay gốc, hướng ngón và chiều dài tay. Chỉnh đoạn cuối ống tay/mask,
  không kéo cả áo làm lệch cổ đã ổn. Nếu ảnh không có mép cửa tay phù hợp thì sửa nét
  vải cục bộ; không dùng mask để giả tạo một lỗ xuyên qua vải kín.
- Nếu cần: thân người → áo/mép sau → phần cổ tay/bàn tay lộ ra → mép trước cửa tay.
  Mask phải gắn với đúng áo và nhân vật, tháo áo thì tháo luôn các mask đi kèm.

## 2. Quần phải có thể tích và điểm tựa tại giày

- Mẫu có ống quần rủ xuống theo từng chân, hơi thu về cổ chân và có nếp chùng nhẹ
  khi gặp mu giày. Bản hiện tại có hai ống rộng với đường gấu gần thẳng, trông cứng
  và tách rời giày. Không thể giải quyết chỉ bằng hạ cả quần xuống.
- Căn từng trục ống với chân gốc; giữ khoảng cách chân của nhân vật. Kiểm bề rộng
  đùi, gối, cổ chân riêng; không bóp toàn bộ quần để chữa gấu rộng.
- Với bộ này, dựng nếp gấu có điểm chạm mu giày và chồng nhẹ lên cổ giày. Giữ phần
  mũi giày đủ lộ; tránh gấu thẳng cắt ngang cả hai giày như một tấm rèm.
- Nếp chùng là hình vẽ và sắc độ vải, cần chỉnh artwork khi nguồn thiếu; phép co kéo
  không tự tạo được nếp vải. Không áp dụng yêu cầu nếp chùng cho mọi loại quần/váy.

## 3. Giày phải theo bàn chân và phối cảnh

- Mẫu lộ rõ mu, mũi và cạnh đế; hướng hai giày theo hướng hai bàn chân. Bản hiện tại
  đọc thành hai đầu giày tròn, phần mu bị gấu che nhiều nên tỷ lệ nhìn nặng và ngắn.
- Đo riêng chiều dài, bề rộng và hướng từng bàn chân gốc. Đặt gót/cổ giày theo cổ chân,
  rồi kiểm mũi/đế; không tăng đều kích thước giày chỉ để che hết pixel chân.
- Chọn/sửa phối cảnh giày phù hợp chân. Xoay/co ảnh chỉ dùng khi nét vẽ vẫn hợp lý;
  không ép cùng một ảnh chính diện vào hai chân có hướng khác mà bỏ qua chiều sâu.
- Kiểm giày trước khi mặc quần, rồi kiểm lại phần bị gấu che: không hở da, không nổi
  lơ lửng, đế có chung mặt sàn, mũi không quá bè hoặc bị che cụt. Không đổi bàn chân
  gốc chỉ để khớp một ảnh giày chưa phù hợp.

## 4. Đo và nghiệm thu

- So sánh mẫu và candidate sau khi chuẩn hóa chiều cao nhân vật, không so số pixel
  giữa hai ảnh khác kích thước. Ghi tỷ lệ cửa tay/cổ tay, gấu/mu giày và phần giày lộ
  ra làm chỉ báo; đo trên nguồn thật, không dùng tỷ lệ ước lượng làm hằng số chung.
- Mọi điểm đánh dấu thủ công phải ghi rõ và gắn với kích thước/hash nguồn. Không gọi
  chúng là landmark tự phát hiện. Bảo toàn cổ và nhân vật gốc bằng so sánh pixel.
- Duyệt lần lượt: hai cổ tay ở cận cảnh → quần/giày ở cận cảnh → toàn thân cỡ điện
  thoại → phóng lớn trên nền sáng/tối → tắt/bật từng lớp. Không nhân tổ hợp trước đó.
- Test kỹ thuật kiểm nguồn không đổi, mask đúng phạm vi và thứ tự lớp. Test tay lộ
  ở hai pixel hoặc số pixel da được che không chứng minh fit đẹp. Nghiệm thu mỹ thuật
  của người dùng là bước riêng; bản single-A hiện tại CHƯA ĐẠT theo phản hồi mới.
