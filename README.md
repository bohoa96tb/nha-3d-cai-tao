# NHÀ 3D – CẢI TẠO NHÀ

Website 3D giúp xem và lập kế hoạch cải tạo nhà trên điện thoại Android và máy tính, giao diện tiếng Việt, ưu tiên điện thoại (mobile-first).

**Trạng thái: V1 — Khung nhà 3D và điều khiển (đã xong ở local, chờ đưa lên GitHub).**

## Chạy thử ở máy local

```bash
npm install
npm run dev       # mở địa chỉ Vite in ra (thêm đường dẫn /nha-3d-cai-tao/)
npm test          # chạy kiểm thử đơn vị (vitest)
npm run build     # kiểm tra TypeScript + dựng bản production vào thư mục dist/
npm run preview   # xem thử bản production
```

## V1 có gì

- Mô hình nhà mẫu 3D (đơn vị mét): nền móng, sàn 8 × 10 m, 4 tường bao + 1 tường ngăn, cửa đi chính 0,9 × 2,1 m, 2 cửa sổ, cầu thang thẳng 10 bậc, mái chính dốc hai phía, mái tôn + khung thép phía sau, tum cầu thang — tổng 15 bộ phận độc lập, mỗi bộ phận có tên, kích thước, vị trí, lớp (hiện trạng / cải tạo).
- Chạm/click để chọn bộ phận (đổi màu phát sáng + viền cam); bảng thuộc tính hiện kích thước theo mét; danh sách bộ phận có nút mắt ẩn/hiện từng cái.
- Điều khiển: xoay 360°, phóng to/thu nhỏ, nút góc nhìn "Mặc định / Từ trên xuống / Mặt đứng", chế độ "Mặt cắt" ở cao độ 1,6 m, chế độ "Xuyên tường", bật/tắt lớp hiện trạng – cải tạo, nút "Trước cải tạo / Sau cải tạo".
- Hoàn tác / Làm lại cho các thay đổi ẩn/hiện, lớp và lựa chọn.
- Tự động lưu vào IndexedDB sau mỗi thay đổi (không dùng localStorage) và tải lại khi mở lại trang; nút "Lưu dự án" lưu ngay.

## Công nghệ

Vite + React + TypeScript, Three.js + React Three Fiber + Drei, zustand (kèm lịch sử hoàn tác bằng snapshot tự cài), idb-keyval (IndexedDB), CSS thuần. Triển khai bằng GitHub Pages qua workflow trong `.github/workflows/deploy.yml` (base path `/nha-3d-cai-tao/`).

Xem thêm: [CHECKPOINT.md](CHECKPOINT.md) (kế hoạch V1–V5) và [QA_REPORT.md](QA_REPORT.md) (kết quả kiểm thử).
