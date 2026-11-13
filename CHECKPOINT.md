# CHECKPOINT — NHÀ 3D – CẢI TẠO NHÀ

Cập nhật: 2026-11-13 · Quy tắc chung: mỗi mốc chỉ bắt đầu khi mốc trước được QA xác nhận; không nút bấm giả; không tự động phá bỏ/thay đổi kết cấu chịu lực.

## Kế hoạch các mốc

| Mốc | Nội dung | Trạng thái |
| --- | --- | --- |
| V1 | Khung nhà 3D và điều khiển | ✅ HOÀN THÀNH 2026-11-13 — code trên GitHub, workflow xanh, Pages live bản build thật, QA độc lập trên website trực tiếp đạt (xem QA_REPORT.md). Chờ chủ dự án xác nhận trước khi sang V2 |
| V2 | Chỉnh sửa tường, cửa và cầu thang (di chuyển/xoay/đổi kích thước, đục tường, tạo cửa mở mới…) | ✅ Đã làm xong ở local 2026-11-13 — chờ QA độc lập + đẩy lên GitHub (xem mục V2) |
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

## V2 — Việc đã làm (local, 2026-11-13)

- [x] Dữ liệu bộ phận chuyển hẳn vào store: store giữ mảng `boPhan` (bản sao sửa được của nhà mẫu), HouseModel render từ store; snapshot hoàn tác bao phủ cả `boPhan` — mọi thao tác sửa đều hoàn tác/làm lại được.
- [x] Lưu trữ phiên bản 2: payload IndexedDB `{ phienBan: 2, tenDuAn, boPhan, anHien, lopBat, dangChon }` (chỉ số liệu nhỏ); migration bản lưu V1 (không có `boPhan`) → nạp nhà mẫu rồi áp ẩn/hiện cũ. Nút "Khôi phục nhà mẫu" trên thanh công cụ (có qua lịch sử hoàn tác).
- [x] Gizmo kéo trực tiếp (TransformControls của drei) gắn vào bộ phận đang chọn, mặc định TẮT: Di chuyển (khóa trục Y, snap 0,1 m), Xoay (chỉ trục Y, snap 15°), Kích thước (không áp cho tường + cầu thang — hai loại này sửa bằng ô số). Thả chuột mới ghi 1 lần vào store qua `capNhatBoPhan`. OrbitControls tự tắt khi kéo gizmo (pattern makeDefault của drei, đã kiểm chứng trong mã nguồn drei).
- [x] Ô nhập số chính xác trong mục "Chỉnh sửa" của bảng thuộc tính (ghi khi Enter/blur): vị trí X, Z; góc xoay Y; kích thước theo loại.
- [x] Tường: sửa chiều cao (1,5–5 m) + độ dày (0,05–0,5 m) → dựng lại hình học thật bằng bộ dựng đoạn hộp quanh ô trống (bệ + đà trên ô tự tính lại); đổi chiều cao neo chân tường trên mặt sàn. Tường có ô cửa sẵn (trước, phải) khóa ô chiều dài kèm chú thích; tường trơn sửa được cả dài.
- [x] Đánh dấu "dự kiến đục bỏ" cho tường: cờ `ducBo`, render đỏ bán trong suốt (0,55) + viền đỏ, nhãn trong danh sách, dòng cảnh báo "chỉ đánh dấu — không tự phá kết cấu chịu lực". Chỉ đánh dấu, không xóa hình học.
- [x] Tạo cửa mở mới trên tường trơn (sau, trái, ngăn): ô trống 0,9 × 2,1 m tại vị trí người dùng đặt (m từ đầu tường, kẹp [0,2; dài − 1,1]), tự thêm cửa đi lớp cải tạo đặt đúng ô; sửa vị trí ô / xóa cửa khôi phục tường đặc; tối đa 1 ô/tường; qua hoàn tác đúng từng bước.
- [x] Cầu thang: sửa chiều rộng (0,7–1,6 m) + số bậc (8–14, nguyên) → dựng lại bậc thật; chiều cao mỗi bậc = tổng cao ÷ số bậc; dài chạy tự đồng bộ = số bậc × 0,3 m.
- [x] Kiểm thử: 32/32 test pass (13 test V1 giữ nguyên + 19 test V2 mới); build pass; preview + curl 200.

## Việc chưa làm (thuộc V3–V5, không làm trong V2)

- Chỉnh độ dốc/hướng mái tôn; chỉnh chiều cao/chiều rộng tum (V3).
- Nhiều phương án đặt tên và so sánh trước/sau dạng chia màn hình (V4) — V1 mới lưu 1 dự án hiện tại + tên dự án.
- Xuất/nhập mô hình GLB (V4).
- Kiểm thử trên điện thoại Android thật và website GitHub Pages thực tế (V5 / chờ repo).

## Lưu ý chờ xử lý

- Repository `bohoa96tb/nha-3d-cai-tao` đã được chủ dự án tạo ngày 2026-11-13 (lúc bắt đầu làm V1 thì chưa có; Muse không có quyền tạo repo qua kết nối GitHub — lỗi 403). Đẩy trực tiếp qua kết nối GitHub cũng bị chặn (403 khi tạo cây file — ứng dụng GitHub chưa có quyền ghi nội dung cho repo này), nhưng lần thử đó đã khởi tạo repo với 1 commit chứa README.md rỗng (commit `e1c9642`). Vì vậy V1 được bàn giao bằng **git bundle**; chủ dự án đã đẩy lên từ Termux ngày 2026-11-13 (HEAD remote `5686432`, gồm bước gộp commit khởi tạo).
- GitHub Pages: token của workflow không tự tạo được Pages site trên repo cá nhân (403), nên chủ dự án đã bật Pages thủ công một lần trong Settings và chọn Source = **GitHub Actions** (lúc đầu chọn nhầm "Deploy from a branch" khiến site phục vụ mã nguồn thô). Sau đó workflow "Triển khai lên GitHub Pages" được chạy tay (Run workflow) và **thành công**: site https://bohoa96tb.github.io/nha-3d-cai-tao/ đang phục vụ bản build thật (HTML trỏ tới `assets/index-*.js`, file JS trả HTTP 200, ~1,17 MB — đã kiểm chứng bằng curl ngày 2026-11-13). Từ các mốc sau, mỗi lần đẩy lên `main` sẽ tự triển khai, không cần thao tác tay nữa.
- Bundle JS production ~1,17 MB (gzip ~328 kB) do Three.js — chấp nhận được cho V1; có thể tách chunk ở mốc hoàn thiện (V5).
