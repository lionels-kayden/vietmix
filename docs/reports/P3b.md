PHASE: 3b Hidden /fit Page
STATUS: PASS
TASKS:
- T1 Internal Route & Security Gate: ok, vitest run app/fit/page.test.tsx, passed (5 tests)
- T2 Alignment UI & Real-Time Canvas Controls: ok, vitest run app/fit/page.test.tsx, passed (4 tests)
- T3 Fit Data Export & Import Handoff: ok, vitest run app/fit/page.test.tsx, passed (3 tests)
- T4 Integration Tests & Build Verification: ok, npm run check (build + 115 tests), passed (16 files / 115 tests)

FILES CHANGED:
- [app/fit/page.tsx](file:///e:/1.%20vietmix/app/fit/page.tsx)
- [app/fit/FitClient.tsx](file:///e:/1.%20vietmix/app/fit/FitClient.tsx)
- [app/fit/page.test.tsx](file:///e:/1.%20vietmix/app/fit/page.test.tsx)

HOW TO RUN:
```bash
# Bật công cụ căn chỉnh ở môi trường local dev:
$env:ENABLE_FIT="1"; npm run dev

# Mở trình duyệt:
http://localhost:3000/fit

# Kiểm tra toàn bộ dự án:
npm run check
```

HOW TO TEST BY HAND:
1. Chạy `$env:ENABLE_FIT="1"; npm run dev` và truy cập `http://localhost:3000/fit`.
2. Kiểm tra giao diện hiển thị badge "Nội bộ (ENABLE_FIT=1)", nhân vật Nam, và danh sách các món đồ.
3. Nhấp chọn một món đồ (ví dụ Áo ngũ thân), điều chỉnh slider Trục X, Trục Y, Scale và quan sát nhân vật trên Canvas cập nhật vị trí trực quan theo thời gian thực.
4. Bấm nút "📐 Bật/Ẩn đường gióng" để kiểm tra các đường tham chiếu trục giữa, cổ áo, vòng eo và gấu chân.
5. Thử nút "📋 Sao chép JSON" và "💾 Xuất fit.json" để kiểm tra chức năng xuất dữ liệu. Thử bấm "📥 Nạp fit.json" để dán chuỗi JSON kiểm tra tính năng nạp dữ liệu.
6. Tắt biến môi trường bằng cách mở tab terminal mới chạy `npm run dev` (không gán ENABLE_FIT) và truy cập `http://localhost:3000/fit` -> Xác nhận trả về trang 404 Not Found, không lộ công cụ ra ngoài.

KNOWN ISSUES:
- none (Tất cả 115 unit/integration tests pass 100%, `next build` hoàn tất tối ưu static prerender không có lỗi).

LAST COMMIT:
4e44f3c p3b: implement hidden /fit alignment tool, gating, and tests
