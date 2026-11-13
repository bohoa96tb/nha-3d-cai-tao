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
  /** Góc xoay quanh trục Y, đơn vị độ (0–359). Vắng mặt = 0. (V2) */
  xoayY?: number
  /**
   * Chỉ với tường: đánh dấu "dự kiến đục bỏ" để lập phương án.
   * CHỈ là đánh dấu hiển thị — không xóa hình học, không thay đổi kết cấu. (V2)
   */
  ducBo?: boolean
  /**
   * Chỉ với tường trơn (không có ô cửa sẵn): ô cửa mở mới do người dùng tạo.
   * `viTri` = khoảng cách từ đầu tường tới mép bắt đầu ô cửa, đơn vị mét. (V2)
   */
  loCuaMoi?: { viTri: number }
  /** Chỉ với cầu thang: số bậc (8–14). Vắng mặt = 10. (V2) */
  soBac?: number
  /** Chỉ với cửa mở mới: id của tường đã tạo ra nó, để xóa cửa kèm tường. (V2) */
  tuongNguon?: string
}

/**
 * Trạng thái dự án được lưu vào IndexedDB (không lưu hình học 3D lớn).
 * V1 lưu không có `phienBan`/`boPhan`; V2 lưu `phienBan: 2` kèm mảng `boPhan`
 * (chỉ số liệu nhỏ: tên, kích thước, vị trí — không lưu hình học thô).
 */
export interface DuAnDaLuu {
  phienBan?: number
  tenDuAn: string
  boPhan?: BoPhanNha[]
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
