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

## V2 — Kiểm thử đã thực chạy ở local (2026-11-13)

| Kiểm tra | Lệnh / cách làm | Kết quả |
| --- | --- | --- |
| Kiểm thử đơn vị | `npm test` (vitest run) | ✅ **32/32 test pass** (3 file): 13 test V1 giữ nguyên không sửa + 19 test V2 mới trong `src/__tests__/v2.test.ts` |
| Build production | `npm run build` (`tsc -b && vite build`) | ✅ Pass — TypeScript không lỗi; JS ~1.210 kB (gzip ~338 kB), CSS 5,30 kB |
| Xem thử bản build | `npm run preview` + `curl` | ✅ HTTP 200 tại `/nha-3d-cai-tao/`; tiêu đề "NHÀ 3D – Cải tạo nhà"; file JS chính HTTP 200 |
| Quét mã nguồn | `grep` tìm `TODO`/`FIXME`/`localStorage` trong `src/` | ✅ Không TODO; không dùng localStorage cho dữ liệu mô hình |

### Nội dung test V2 (19 test)

- `capNhatBoPhan` + hoàn tác/làm lại cho sửa kích thước; gộp patch một phần (vị trí + xoay, chuẩn hóa góc 450° → 90°); id không tồn tại không đẩy lịch sử.
- Tường: đổi chiều cao/độ dày cập nhật đúng số liệu; viTri.y neo trên mặt sàn (0,15 + cao/2); kẹp cao [1,5; 5], dày [0,05; 0,5].
- Đánh dấu đục bỏ: bật/tắt + hoàn tác/làm lại; số bộ phận không đổi (chỉ đánh dấu, không xóa hình học).
- Cửa mở mới: tạo → tường có `loCuaMoi`, thêm đúng 1 cửa đi lớp cải tạo (0,9 × 2,1 m, tên "Cửa mở mới — …", đặt đúng tâm ô tính tay −0,55/1,2/−5 cho tường sau ở vị trí 3 m); vị trí bị kẹp theo chiều dài tường (tường 5 m → [0,2; 3,9]); không tạo trên tường có ô sẵn, không tạo ô thứ hai; hoàn tác tạo cửa = 1 bước (tường đặc lại + cửa biến mất); xóa cửa khôi phục + hoàn tác được; đặt lại vị trí ô thì cửa đi di chuyển theo; rút ngắn tường thì vị trí ô tự kẹp lại.
- Cầu thang: đổi số bậc → `soBac` + dài chạy đồng bộ (12 bậc → 3,6 m), tổng cao giữ 3,2 m; số bậc kẹp [8; 14] nguyên; chiều rộng kẹp [0,7; 1,6].
- Lưu/nạp: payload `phienBan: 2` giữ nguyên mọi sửa đổi (cao tường, đục bỏ, ô cửa, số bậc, 16 bộ phận) sau khi nạp lại; migration payload V1 (không có `boPhan`) nạp nhà mẫu mặc định + áp ẩn/hiện cũ, không lỗi; khôi phục nhà mẫu về mặc định và hoàn tác được.

### Quyết định kỹ thuật đáng chú ý (V2)

- **Gizmo scale**: kéo scale chỉ đọc hệ số tại thời điểm thả chuột (onMouseUp), nhân vào kích thước gốc trong store rồi render lại theo kích thước (scale three đặt lại = 1) — không lưu scale three. Áp cho mọi bộ phận trừ tường (nhiều đoạn quanh ô trống) và cầu thang (có cơ chế số bậc riêng) — hai loại này nút "Kích thước" bị khóa kèm chú thích, sửa bằng ô số (đúng phương án dự phòng trong đặc tả V2).
- **Dựng lại tường**: một bộ dựng tham số duy nhất (dải đặc + bệ + đà theo danh sách ô trống) dùng cho cả ô có sẵn và ô cửa mới; nhờ vậy đổi chiều cao/độ dày/dài là dựng lại thật. Lưu ý: bộ dựng này lấp luôn 2 khe hở hẹp vô ý trong cách xếp hộp thủ công của V1 ở tường trước (đoạn −1,95…−0,75 và 2,75…3,25 trước đây trống) — hình học tường trước từ V2 liên tục đúng nghĩa.
- **Bộ phận phức hợp** (khung thép, tum): hình học cục bộ giữ nguyên như V1, đổi kích thước bằng co giãn theo tỉ lệ so với kích thước nhà mẫu; cửa đi/cửa sổ/mái/nền/sàn dựng tham số trực tiếp từ kích thước.
- **Neo chân**: đổi chiều cao tường/cầu thang tự chỉnh viTri.y = mặt sàn + cao/2 để chân luôn đứng trên sàn; tổng cao cầu thang mặc định giữ 3,2 m khi đổi số bậc (cao bậc = tổng cao ÷ số bậc).
- **Cầu thang — thay đổi dữ liệu có chủ đích**: `kichThuoc.rong` của cầu thang trong nhà mẫu đổi 2,7 → 3,0 m cho khớp hình học thật (10 bậc × 0,3 m); không test V1 nào kiểm tra giá trị này (13 test V1 pass nguyên vẹn, không sửa test V1 nào).

### Chưa kiểm chứng được (V2, không bịa kết quả)

- **Kéo gizmo bằng cảm ứng trên Android thật và thao tác kéo trên trình duyệt thật**: môi trường local không chạy được WebGL/tương tác kéo — mới kiểm chứng ở mức mã nguồn (drei TransformControls tự tắt OrbitControls mặc định khi kéo qua sự kiện `dragging-changed`, đã đọc mã nguồn drei xác nhận) + test đơn vị cho logic ghi store. Cần QA trên website trực tiếp sau khi đẩy V2 lên GitHub.
- **Hiển thị 3D sau sửa trên trình duyệt thật** (tường dựng lại, ô cửa mới, cầu thang đổi bậc): chưa kiểm chứng trực quan — chờ triển khai V2 lên Pages rồi QA như V1.
- **GitHub Pages cho V2**: chưa đẩy lên tại thời điểm viết (làm ở local theo quy trình bàn giao bundle).

## Kết luận V1 (cập nhật 2026-11-13 sau triển khai)

✅ **V1 ĐẠT**: mã nguồn + 13/13 test đơn vị + build production + GitHub Actions xanh + GitHub Pages phục vụ bản build thật + QA độc lập trên website trực tiếp (hiển thị 3D, đổi góc nhìn, chọn bộ phận, bảng thuộc tính, tự động lưu IndexedDB đều hoạt động). Còn lại duy nhất: kiểm tra cảm ứng trên điện thoại Android thật của chủ dự án (site đã live để mở kiểm tra) và kiểm thử toàn diện ở V5. V2 chỉ bắt đầu khi chủ dự án xác nhận V1.
