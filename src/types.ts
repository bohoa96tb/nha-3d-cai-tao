/** Lớp của một bộ phận nhà: hiện trạng (đang có) hoặc cải tạo (dự kiến thêm/sửa). */
export type LopNha = 'hien-trang' | 'cai-tao'

/** Loại bộ phận — dùng để hiển thị và nhóm trong danh sách. */
export type LoaiBoPhan =
  | 'nen-mong'
  | 'san'
  | 'tuong'
  | 'cua-di'
  | 'cua-so'
  | 'cau-thang'
  | 'mai'
  | 'khung-thep'
  | 'tum'

/** Kích thước theo mét: dài (trục X), rộng/sâu (trục Z), cao (trục Y).
 *  Với tường, "rong" chính là độ dày tường. */
export interface KichThuoc {
  dai: number
  rong: number
  cao: number
}

export interface BoPhanNha {
  id: string
  ten: string
  loai: LoaiBoPhan
  lop: LopNha
  kichThuoc: KichThuoc
  /** Vị trí tâm của bộ phận trong mô hình, đơn vị mét [x, y, z]. */
  viTri: [number, number, number]
  moTa: string
}

/** Trạng thái dự án được lưu vào IndexedDB (không lưu hình học 3D lớn). */
export interface DuAnDaLuu {
  tenDuAn: string
  anHien: Record<string, boolean>
  lopBat: Record<LopNha, boolean>
  dangChon: string | null
  luuLuc: string
}

export const NHAN_LOAI: Record<LoaiBoPhan, string> = {
  'nen-mong': 'Nền móng',
  san: 'Sàn',
  tuong: 'Tường',
  'cua-di': 'Cửa đi',
  'cua-so': 'Cửa sổ',
  'cau-thang': 'Cầu thang',
  mai: 'Mái',
  'khung-thep': 'Khung thép',
  tum: 'Tum cầu thang',
}

export const NHAN_LOP: Record<LopNha, string> = {
  'hien-trang': 'Hiện trạng',
  'cai-tao': 'Cải tạo',
}
