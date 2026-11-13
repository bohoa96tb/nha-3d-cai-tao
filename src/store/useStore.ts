import { create } from 'zustand'
import type { DuAnDaLuu, LopNha } from '../types'
import { NHA_MAU } from '../data/house'

export type GocNhin = 'mac-dinh' | 'tren-xuong' | 'mat-dung'

/** Ảnh chụp trạng thái có thể hoàn tác: ẩn/hiện, lớp đang bật, đối tượng đang chọn, tên dự án. */
export interface AnhChup {
  tenDuAn: string
  anHien: Record<string, boolean>
  lopBat: Record<LopNha, boolean>
  dangChon: string | null
}

interface TrangThaiNha3D extends AnhChup {
  // Điều khiển xem 3D (không đưa vào lịch sử hoàn tác)
  gocNhin: GocNhin
  /** Tăng mỗi lần bấm nút góc nhìn để CameraRig áp lại vị trí camera. */
  lanDatGoc: number
  cheDoMatCat: boolean
  cheDoXuyenTuong: boolean
  daTaiXong: boolean

  // Lịch sử hoàn tác / làm lại (snapshot)
  quaKhu: AnhChup[]
  tuongLai: AnhChup[]

  chon: (id: string | null) => void
  batTatHien: (id: string) => void
  datHien: (id: string, hien: boolean) => void
  batTatLop: (lop: LopNha) => void
  xemTruocCaiTao: () => void
  xemSauCaiTao: () => void
  datTenDuAn: (ten: string) => void
  datGocNhin: (goc: GocNhin) => void
  batTatMatCat: () => void
  batTatXuyenTuong: () => void
  hoanTac: () => void
  lamLai: () => void
  napDuAn: (duAn: DuAnDaLuu) => void
}

function anHienMacDinh(): Record<string, boolean> {
  const kq: Record<string, boolean> = {}
  for (const p of NHA_MAU) kq[p.id] = true
  return kq
}

const LOP_MAC_DINH: Record<LopNha, boolean> = { 'hien-trang': true, 'cai-tao': true }

function chup(s: AnhChup): AnhChup {
  return {
    tenDuAn: s.tenDuAn,
    anHien: { ...s.anHien },
    lopBat: { ...s.lopBat },
    dangChon: s.dangChon,
  }
}

/** Đẩy trạng thái hiện tại vào ngăn xếp quá khứ trước mỗi thay đổi có thể hoàn tác. */
function dayLichSu(s: TrangThaiNha3D): Pick<TrangThaiNha3D, 'quaKhu' | 'tuongLai'> {
  return { quaKhu: [...s.quaKhu.slice(-99), chup(s)], tuongLai: [] }
}

export const useStore = create<TrangThaiNha3D>((set) => ({
  tenDuAn: 'Phương án cải tạo 1',
  anHien: anHienMacDinh(),
  lopBat: { ...LOP_MAC_DINH },
  dangChon: null,

  gocNhin: 'mac-dinh',
  lanDatGoc: 0,
  cheDoMatCat: false,
  cheDoXuyenTuong: false,
  daTaiXong: false,

  quaKhu: [],
  tuongLai: [],

  chon: (id) =>
    set((s) => (s.dangChon === id ? s : { ...dayLichSu(s), dangChon: id })),

  batTatHien: (id) =>
    set((s) => ({
      ...dayLichSu(s),
      anHien: { ...s.anHien, [id]: !(s.anHien[id] ?? true) },
    })),

  datHien: (id, hien) =>
    set((s) =>
      (s.anHien[id] ?? true) === hien
        ? s
        : { ...dayLichSu(s), anHien: { ...s.anHien, [id]: hien } },
    ),

  batTatLop: (lop) =>
    set((s) => ({
      ...dayLichSu(s),
      lopBat: { ...s.lopBat, [lop]: !s.lopBat[lop] },
    })),

  xemTruocCaiTao: () =>
    set((s) => ({
      ...dayLichSu(s),
      lopBat: { 'hien-trang': true, 'cai-tao': false },
    })),

  xemSauCaiTao: () =>
    set((s) => ({
      ...dayLichSu(s),
      lopBat: { 'hien-trang': true, 'cai-tao': true },
    })),

  // Đổi tên không đẩy lịch sử (tránh hoàn tác từng ký tự); tên vẫn nằm trong snapshot của các thao tác khác.
  datTenDuAn: (ten) => set((s) => (s.tenDuAn === ten ? s : { tenDuAn: ten })),

  datGocNhin: (goc) => set((s) => ({ gocNhin: goc, lanDatGoc: s.lanDatGoc + 1 })),

  batTatMatCat: () => set((s) => ({ cheDoMatCat: !s.cheDoMatCat })),
  batTatXuyenTuong: () => set((s) => ({ cheDoXuyenTuong: !s.cheDoXuyenTuong })),

  hoanTac: () =>
    set((s) => {
      const truoc = s.quaKhu[s.quaKhu.length - 1]
      if (!truoc) return s
      return {
        ...truoc,
        anHien: { ...truoc.anHien },
        lopBat: { ...truoc.lopBat },
        quaKhu: s.quaKhu.slice(0, -1),
        tuongLai: [chup(s), ...s.tuongLai],
      }
    }),

  lamLai: () =>
    set((s) => {
      const sau = s.tuongLai[0]
      if (!sau) return s
      return {
        ...sau,
        anHien: { ...sau.anHien },
        lopBat: { ...sau.lopBat },
        quaKhu: [...s.quaKhu, chup(s)],
        tuongLai: s.tuongLai.slice(1),
      }
    }),

  napDuAn: (duAn) =>
    set(() => ({
      tenDuAn: duAn.tenDuAn,
      anHien: { ...anHienMacDinh(), ...duAn.anHien },
      lopBat: { ...LOP_MAC_DINH, ...duAn.lopBat },
      dangChon: duAn.dangChon,
      quaKhu: [],
      tuongLai: [],
      daTaiXong: true,
    })),
}))

/** Bộ phận có đang hiển thị không: phải bật theo từng bộ phận VÀ theo lớp của nó. */
export function dangHienThi(
  anHien: Record<string, boolean>,
  lopBat: Record<LopNha, boolean>,
  id: string,
  lop: LopNha,
): boolean {
  return (anHien[id] ?? true) && lopBat[lop]
}
