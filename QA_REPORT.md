# QA_REPORT — V1 (kiểm thử đã thực chạy ở local, 2026-11-13)

## Kết quả lệnh đã chạy

| Kiểm tra | Lệnh / cách làm | Kết quả |
| --- | --- | --- |
| Cài thư viện | `npm install` | ✅ Thành công — 165 gói, không lỗi |
| QA độc lập chạy lại (PM/QA, 2026-11-13) | `npm test` + `npm run build` + quét `localStorage`/`TODO` trên bản local | ✅ 13/13 test pass; build pass (chỉ cảnh báo chunk > 500 kB); không dùng localStorage ngoài comment; không TODO/nút giả |
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

- **WebGL / hiển thị 3D thật**: ✅ ĐÃ KIỂM CHỨNG trên website trực tiếp ngày 2026-11-13 bằng trình duyệt thật (QA độc lập): canvas WebGL vẽ đúng mô hình nhà (mái lăng trụ đỏ, tường kem, cửa nâu, cầu thang trong nhà, tum + mái tum, mái tôn xanh xám + khung thép phía sau); bấm "Từ trên xuống" đổi góc nhìn thật; bấm mục "Mái nhà chính" trong danh sách → bảng thuộc tính hiện đúng loại/lớp/kích thước 8,80 × 10,80 × 2,20 m/vị trí và bộ phận được tô sáng trong khung 3D; dòng trạng thái hiện "Đã tự động lưu" (IndexedDB hoạt động trên trình duyệt thật); không có lỗi hiển thị.
- **Điện thoại Android**: chưa kiểm tra trên thiết bị Android thật của chủ dự án — website đã live tại https://bohoa96tb.github.io/nha-3d-cai-tao/ để chủ dự án mở kiểm tra cảm ứng trực tiếp; kiểm thử thiết bị toàn diện thuộc V5.
- **Điểm nhỏ đã sửa sau QA live**: nút "Mặc định" trước đây đặt camera cùng vị trí nhưng tâm nhìn khác khung hình ban đầu (mục tiêu y = 1,4 m so với 0), khiến khung hình trông sát mái hơn lúc mới tải. Đã thống nhất tâm nhìn ban đầu = (0; 1,4; 0) và nới camera mặc định ra [12,5; 9; 14,5] — kèm trong commit chốt V1, test 13/13 + build pass trước khi bàn giao.
- **GitHub Pages sau triển khai**: ✅ ĐÃ KIỂM CHỨNG ở mức HTTP ngày 2026-11-13. Repo do chủ dự án tạo; code V1 được đẩy bằng git bundle từ Termux (HEAD remote `5686432`). Lần chạy workflow đầu thất bại ở bước tự kích hoạt Pages (403 — token không tạo được Pages site trên repo cá nhân); chủ dự án bật Pages thủ công, chọn Source = GitHub Actions (trước đó chọn nhầm "Deploy from a branch" nên site từng phục vụ mã nguồn thô), rồi chạy tay workflow — **thành công**. Kiểm tra bằng curl: trang chủ trả HTTP 200 với HTML của bản build (trỏ tới `/nha-3d-cai-tao/assets/index-*.js` và `*.css`), file JS chính trả HTTP 200 (1.170.064 byte, khớp kích thước bản build local). Hiển thị WebGL trên trình duyệt thật: xem mục kết luận cập nhật kèm theo.
- **Lưu/mở lại trong trình duyệt thật**: logic lưu IndexedDB đã có mã nguồn + test store ở mức đơn vị; việc đóng/mở lại trình duyệt thật để tải lại dự án chưa được kiểm chứng trên trình duyệt thật trong vòng này.

## Kết luận V1 (cập nhật 2026-11-13 sau triển khai)

✅ **V1 ĐẠT**: mã nguồn + 13/13 test đơn vị + build production + GitHub Actions xanh + GitHub Pages phục vụ bản build thật + QA độc lập trên website trực tiếp (hiển thị 3D, đổi góc nhìn, chọn bộ phận, bảng thuộc tính, tự động lưu IndexedDB đều hoạt động). Còn lại duy nhất: kiểm tra cảm ứng trên điện thoại Android thật của chủ dự án (site đã live để mở kiểm tra) và kiểm thử toàn diện ở V5. V2 chỉ bắt đầu khi chủ dự án xác nhận V1.
