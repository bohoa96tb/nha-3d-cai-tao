import type { BoPhanNha } from '../types'

/**
 * Dữ liệu nhà mẫu V1 — mọi kích thước tính bằng MÉT.
 * Mặt bằng: rộng 8 m (trục X) × sâu 10 m (trục Z). Tường cao 3,2 m, dày 0,2 m.
 * Mặt trước ở phía +Z. Cửa đi chính 0,9 × 2,1 m trên tường trước.
 */
export const NHA_MAU: BoPhanNha[] = [
  {
    id: 'nen-mong',
    ten: 'Nền móng',
    loai: 'nen-mong',
    lop: 'hien-trang',
    kichThuoc: { dai: 8.6, rong: 10.6, cao: 0.4 },
    viTri: [0, -0.2, 0],
    moTa: 'Nền móng bè 8,6 × 10,6 m, dày 0,4 m, chôn dưới mặt sàn.',
  },
  {
    id: 'san-nha',
    ten: 'Sàn nhà',
    loai: 'san',
    lop: 'hien-trang',
    kichThuoc: { dai: 8, rong: 10, cao: 0.15 },
    viTri: [0, 0.075, 0],
    moTa: 'Sàn nhà 8 × 10 m, dày 0,15 m.',
  },
  {
    id: 'tuong-truoc',
    ten: 'Tường bao trước',
    loai: 'tuong',
    lop: 'hien-trang',
    kichThuoc: { dai: 8, rong: 0.2, cao: 3.2 },
    viTri: [0, 1.75, 5],
    moTa: 'Tường mặt tiền, xây theo đoạn chừa ô cửa đi 0,9 × 2,1 m và ô cửa sổ 1,5 × 1,4 m.',
  },
  {
    id: 'tuong-sau',
    ten: 'Tường bao sau',
    loai: 'tuong',
    lop: 'hien-trang',
    kichThuoc: { dai: 8, rong: 0.2, cao: 3.2 },
    viTri: [0, 1.75, -5],
    moTa: 'Tường bao phía sau nhà, kín hoàn toàn.',
  },
  {
    id: 'tuong-trai',
    ten: 'Tường bao trái',
    loai: 'tuong',
    lop: 'hien-trang',
    kichThuoc: { dai: 10, rong: 0.2, cao: 3.2 },
    viTri: [-4, 1.75, 0],
    moTa: 'Tường bao phía trái (hướng Tây), dài 10 m.',
  },
  {
    id: 'tuong-phai',
    ten: 'Tường bao phải',
    loai: 'tuong',
    lop: 'hien-trang',
    kichThuoc: { dai: 10, rong: 0.2, cao: 3.2 },
    viTri: [4, 1.75, 0],
    moTa: 'Tường bao phía phải (hướng Đông), có ô cửa sổ phụ 1,2 × 1,2 m.',
  },
  {
    id: 'tuong-ngan',
    ten: 'Tường ngăn phòng khách – bếp',
    loai: 'tuong',
    lop: 'hien-trang',
    kichThuoc: { dai: 5, rong: 0.15, cao: 3.2 },
    viTri: [-1.5, 1.75, 0.5],
    moTa: 'Tường ngăn trong nhà dày 0,15 m, chừa lối đi 3 m ở phía phải.',
  },
  {
    id: 'cua-di-chinh',
    ten: 'Cửa đi chính',
    loai: 'cua-di',
    lop: 'hien-trang',
    kichThuoc: { dai: 0.9, rong: 0.06, cao: 2.1 },
    viTri: [-2.4, 1.2, 5],
    moTa: 'Cửa đi chính 0,9 × 2,1 m đặt đúng ô trống trên tường trước.',
  },
  {
    id: 'cua-so-truoc',
    ten: 'Cửa sổ mặt tiền',
    loai: 'cua-so',
    lop: 'hien-trang',
    kichThuoc: { dai: 1.5, rong: 0.06, cao: 1.4 },
    viTri: [2, 1.95, 5],
    moTa: 'Cửa sổ mặt tiền 1,5 × 1,4 m, bệ cửa cao 0,9 m.',
  },
  {
    id: 'cua-so-ben',
    ten: 'Cửa sổ bên phải',
    loai: 'cua-so',
    lop: 'hien-trang',
    kichThuoc: { dai: 1.2, rong: 0.06, cao: 1.2 },
    viTri: [4, 1.85, 1.5],
    moTa: 'Cửa sổ phụ 1,2 × 1,2 m trên tường phải, bệ cửa cao 1,1 m.',
  },
  {
    id: 'cau-thang',
    ten: 'Cầu thang thẳng',
    loai: 'cau-thang',
    lop: 'hien-trang',
    kichThuoc: { dai: 1, rong: 2.7, cao: 3.2 },
    viTri: [3.2, 1.75, -2.5],
    moTa: 'Cầu thang thẳng 10 bậc, mỗi bậc cao 0,32 m, mặt bậc sâu 0,3 m, lên sàn mái thấp qua tum.',
  },
  {
    id: 'mai-chinh',
    ten: 'Mái nhà chính',
    loai: 'mai',
    lop: 'hien-trang',
    kichThuoc: { dai: 8.8, rong: 10.8, cao: 2.2 },
    viTri: [0, 4.45, 0],
    moTa: 'Mái dốc hai phía (hình lăng trụ), đỉnh mái cao 5,55 m, nhô ra 0,4 m mỗi phía.',
  },
  {
    id: 'mai-ton',
    ten: 'Mái tôn phía sau',
    loai: 'mai',
    lop: 'cai-tao',
    kichThuoc: { dai: 8, rong: 3.4, cao: 0.08 },
    viTri: [0, 3.3, -6.9],
    moTa: 'Mái tôn che sân sau (phần cải tạo), dốc khoảng 10° về phía sau, đỡ bằng khung thép.',
  },
  {
    id: 'khung-thep-mai-ton',
    ten: 'Khung thép mái tôn',
    loai: 'khung-thep',
    lop: 'cai-tao',
    kichThuoc: { dai: 8, rong: 3.2, cao: 2.9 },
    viTri: [0, 1.6, -6.9],
    moTa: 'Khung thép gồm 4 kèo ngang và 5 xà gồ dọc bằng thép hộp mảnh (phần cải tạo).',
  },
  {
    id: 'tum-cau-thang',
    ten: 'Tum cầu thang',
    loai: 'tum',
    lop: 'cai-tao',
    kichThuoc: { dai: 2.2, rong: 2.6, cao: 2.4 },
    viTri: [2.6, 5.6, -2.5],
    moTa: 'Tum cầu thang trên mái (phần cải tạo): khối hộp 2,2 × 2,6 m, cao 2,4 m, có mái tum nhỏ bên trên.',
  },
]

export function timBoPhan(id: string | null): BoPhanNha | undefined {
  if (!id) return undefined
  return NHA_MAU.find((p) => p.id === id)
}
