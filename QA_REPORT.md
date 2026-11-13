# QA_REPORT — V1 (kiểm thử đã thực chạy ở local, 2026-11-13)

## Kết quả lệnh đã chạy

| Kiểm tra | Lệnh / cách làm | Kết quả |
| --- | --- | --- |
| Cài thư viện | `npm install` | ✅ Thành công — 165 gói, không lỗi |
| Kiểm thử đơn vị | `npm test` (vitest run) | ✅ **13/13 test pass** (2 file) |
| Build production | `npm run build` (`tsc -b && vite build`) | ✅ Pass — TypeScript không lỗi; dist gồm index.html 0,64 kB, CSS 4,23 kB, JS 1.170,06 kB (gzip 327,58 kB) |
| Xem thử bản build | `npm run preview` (cổng 4173) + `curl` | ✅ HTTP 200 tại `/nha-3d-cai-tao/`; HTML chứa `<title>NHÀ 3D – Cải tạo nhà</title>`; file JS chính trả HTTP 200 |
| Quét mã nguồn | `grep` tìm `localStorage`, `TODO`, `alert(` trong `src/` | ✅ Không dùng localStorage (chỉ xuất hiện trong comment giải thích); không có TODO/nút giả |

## Nội dung test đơn vị (13 test)

- `src/__tests__/house.test.ts` (5 test): id duy nhất; mọi bộ phận có tên/mô tả/kích thước > 0; đủ các loại bộ phận bắt buộc (≥ 5 tường, ≥ 2 cửa sổ); kích thước chuẩn (sàn 8 × 10 × 0,15 m; tường 3,2 m cao, 0,2 m dày; cửa đi 0,9 × 2,1 m); có đủ bộ phận lớp cải tạo (mái tôn, khung thép, tum).
- `src/__tests__/store.test.ts` (8 test): chọn/bỏ chọn; ẩn/hiện từng bộ phận; bật/tắt lớp + Trước/Sau cải tạo; hoàn tác/làm lại cho ẩn/hiện, cho chọn và cho lớp; hoàn tác khi lịch sử rỗng an toàn; nạp dự án đã lưu khôi phục đúng trạng thái; hàm xác định hiển thị kết hợp ẩn theo bộ phận và theo lớp.

## Cảnh báo ghi nhận

- Vite cảnh báo chunk JS > 500 kB (đặc thù Three.js). Chưa tách chunk trong V1; đưa vào danh sách hoàn thiện ở V5.

## Chưa kiểm chứng được (không bịa kết quả)

- **WebGL / hiển thị 3D thật**: curl chỉ kiểm tra được HTTP và HTML, **không** chạy được WebGL. Việc mô hình hiển thị đúng, thao tác xoay/chạm mượt, chọn đối tượng bằng chạm trên màn hình thật — **chưa được kiểm tra bằng trình duyệt/thiết bị thật trong vòng này**.
- **Điện thoại Android**: chưa kiểm tra — cần mở bản build trên thiết bị Android thật (sau khi có hosting hoặc chạy dev server trong cùng mạng).
- **GitHub Pages sau triển khai**: **chưa kiểm tra — chờ repo**. Repository `bohoa96tb/nha-3d-cai-tao` chưa tồn tại nên chưa push, chưa chạy được GitHub Actions, chưa có website Pages để kiểm tra. Workflow đã viết sẵn tại `.github/workflows/deploy.yml`.
- **Lưu/mở lại trong trình duyệt thật**: logic lưu IndexedDB đã có mã nguồn + test store ở mức đơn vị; việc đóng/mở lại trình duyệt thật để tải lại dự án chưa được kiểm chứng trên trình duyệt thật trong vòng này.

## Kết luận V1

Đạt ở mức mã nguồn + build + test đơn vị + kiểm tra HTTP của bản preview. Chưa kết luận "hoàn thành toàn diện" cho đến khi QA độc lập kiểm tra trên trình duyệt/Android thật và trên GitHub Pages sau khi repo được tạo.
