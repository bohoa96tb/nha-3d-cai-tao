# CHECKPOINT — NHÀ 3D – CẢI TẠO NHÀ

Cập nhật: 2026-11-13 · Quy tắc chung: mỗi mốc chỉ bắt đầu khi mốc trước được QA xác nhận; không nút bấm giả; không tự động phá bỏ/thay đổi kết cấu chịu lực.

## Kế hoạch các mốc

| Mốc | Nội dung | Trạng thái |
| --- | --- | --- |
| V1 | Khung nhà 3D và điều khiển | 🔄 Đã làm xong ở local, QA độc lập đã chạy lại — đang đẩy lên GitHub + kiểm tra Pages thực tế |
| V2 | Chỉnh sửa tường, cửa và cầu thang (di chuyển/xoay/đổi kích thước, đục tường, tạo cửa mở mới…) | ⏳ Chưa làm (theo kế hoạch) |
| V3 | Mái tôn, khung thép và tum cầu thang (chỉnh độ dốc/hướng mái, kích thước tum…) | ⏳ Chưa làm (theo kế hoạch) |
| V4 | So sánh phương án, lưu trữ nhiều phương án, xuất/nhập GLB | ⏳ Chưa làm (theo kế hoạch) |
| V5 | Kiểm thử toàn diện và hoàn thiện | ⏳ Chưa làm (theo kế hoạch) |

## V1 — Việc đã làm

- [x] Dựng dự án Vite + React + TypeScript, `base: '/nha-3d-cai-tao/'` cho GitHub Pages.
- [x] Giao diện tiếng Việt mobile-first: thanh công cụ (tên dự án, Lưu, Hoàn tác/Làm lại, trạng thái lưu), khung 3D lớn, bảng thuộc tính, danh sách bộ phận.
- [x] Nhà mẫu 15 bộ phận độc lập (id, tên, loại, kích thước mét, vị trí, lớp):
  nền móng; sàn 8 × 10 m dày 0,15 m; 4 tường bao cao 3,2 m dày 0,2 m (tường trước xây theo đoạn chừa ô cửa đi 0,9 × 2,1 m và ô cửa sổ; tường phải chừa ô cửa sổ phụ); 1 tường ngăn; cửa đi chính; 2 cửa sổ; cầu thang thẳng 10 bậc; mái chính lăng trụ dốc hai phía; mái tôn phía sau; khung thép mái tôn (cột + kèo + xà gồ riêng); tum cầu thang + mái tum.
- [x] Lớp "hiện trạng" cho nhà gốc; lớp "cải tạo" cho mái tôn, khung thép, tum.
- [x] Điều khiển: OrbitControls (xoay 360°, zoom, pan, cảm ứng); nút góc nhìn Mặc định / Từ trên xuống / Mặt đứng đặt camera thật; chế độ Mặt cắt bằng clipping plane ngang ở 1,6 m trên sàn; chế độ Xuyên tường (tường bao mờ 0,25); công tắc lớp; nút Trước/Sau cải tạo.
- [x] Chọn bằng chạm/click (dừng lan truyền), bộ phận được chọn phát sáng + viền cam; bảng thuộc tính hiện tên, loại, lớp, kích thước (2 số lẻ, mét), vị trí, trạng thái ẩn/hiện.
- [x] Hoàn tác/Làm lại bằng snapshot history trong zustand store (ẩn/hiện, lớp, chọn).
- [x] Lưu IndexedDB qua idb-keyval: tự động lưu (debounce 500 ms) sau mỗi thay đổi, tải lại khi mở app, nút "Lưu dự án" + xác nhận "Đã lưu lúc…". Không dùng localStorage.
- [x] Workflow `.github/workflows/deploy.yml`: checkout → Node 20 → npm ci → npm test → build → upload-pages-artifact (dist) → deploy-pages.
- [x] Kiểm thử đơn vị vitest: 13 test (dữ liệu nhà mẫu + store) — pass.
- [x] `npm run build` (tsc -b + vite build) — pass; `npm run preview` + curl — HTTP 200, tiêu đề "NHÀ 3D" có trong HTML.

## Việc chưa làm (thuộc V2–V5, không làm trong V1)

- Di chuyển / xoay / thay đổi kích thước đối tượng bằng gizmo; sửa chiều cao, độ dày tường (V2).
- Đánh dấu tường dự kiến đục bỏ; tạo cửa mở mới (V2).
- Chỉnh độ dốc/hướng mái tôn; chỉnh chiều cao/chiều rộng tum (V3).
- Nhiều phương án đặt tên và so sánh trước/sau dạng chia màn hình (V4) — V1 mới lưu 1 dự án hiện tại + tên dự án.
- Xuất/nhập mô hình GLB (V4).
- Kiểm thử trên điện thoại Android thật và website GitHub Pages thực tế (V5 / chờ repo).

## Lưu ý chờ xử lý

- Repository `bohoa96tb/nha-3d-cai-tao` đã được chủ dự án tạo ngày 2026-11-13 (lúc bắt đầu làm V1 thì chưa có; Muse không có quyền tạo repo qua kết nối GitHub — lỗi 403). Repo được xác minh là **rỗng và truy cập được** qua kết nối GitHub; lần đẩy đầu tiên sẽ khởi tạo repo. Workflow đã bật `enablement: true` để tự kích hoạt GitHub Pages (nguồn: GitHub Actions) ở lần chạy đầu.
- Bundle JS production ~1,17 MB (gzip ~328 kB) do Three.js — chấp nhận được cho V1; có thể tách chunk ở mốc hoàn thiện (V5).
