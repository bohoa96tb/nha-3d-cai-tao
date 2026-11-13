import { create } from 'zustand'
import type { BoPhanNha, DuAnDaLuu, LopNha } from '../types'
import {
  NHA_MAU,
  saoChepNhaMau,
  kepSo,
  kepViTriLoCua,
  idCuaMoi,
  tuongTron,
  RONG_O_CUA,
  CAO_O_CUA,
  SAU_BAC,
  MAT_SAN,
} from '../data/house'

export type GocNhin = 'mac-dinh' | 'tren-xuong' | 'mat-dung'

/** Chế độ kéo trực tiếp trên mô hình (gizmo). 'tat' = chạm chỉ để chọn như V1. */
export type CheDoGizmo = 'tat' | 'di-chuyen' | 'xoay' | 'kich-thuoc'

/** Ảnh chụp trạng thái có thể hoàn tác: tên, mảng bộ phận, ẩn/hiện, lớp đang bật, đối tượng đang chọn. */
export interface AnhChup {
  tenDuAn: string
  boPhan: BoPhanNha[]
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
  cheDoGizmo: CheDoGizmo
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
  datCheDoGizmo: (cheDo: CheDoGizmo) => void
  capNhatBoPhan: (id: string, patch: Partial<BoPhanNha>) => void
  taoCuaMoi: (tuongId: string, viTriTuDau: number) => void
  xoaCuaMoi: (tuongId: string) => void
  datViTriLoCua: (tuongId: string, viTriTuDau: number) => void
  khoiPhucNhaMau: () => void
  hoanTac: () => void
  lamLai: () => void
  napDuAn: (duAn: DuAnDaLuu) => void
}

function anHienMacDinh(ds: BoPhanNha[] = NHA_MAU): Record<string, boolean> {
  const kq: Record<string, boolean> = {}
  for (const p of ds) kq[p.id] = true
  return kq
}

const LOP_MAC_DINH: Record<LopNha, boolean> = { 'hien-trang': true, 'cai-tao': true }

function saoBoPhan(ds: BoPhanNha[]): BoPhanNha[] {
  return ds.map((p) => ({
    ...p,
    kichThuoc: { ...p.kichThuoc },
    viTri: [...p.viTri] as [number, number, number],
    loCuaMoi: p.loCuaMoi ? { ...p.loCuaMoi } : undefined,
  }))
}

function chup(s: AnhChup): AnhChup {
  return {
    tenDuAn: s.tenDuAn,
    boPhan: saoBoPhan(s.boPhan),
    anHien: { ...s.anHien },
    lopBat: { ...s.lopBat },
    dangChon: s.dangChon,
  }
}

/** Đẩy trạng thái hiện tại vào ngăn xếp quá khứ trước mỗi thay đổi có thể hoàn tác. */
function dayLichSu(s: TrangThaiNha3D): Pick<TrangThaiNha3D, 'quaKhu' | 'tuongLai'> {
  return { quaKhu: [...s.quaKhu.slice(-99), chup(s)], tuongLai: [] }
}

/** Làm tròn 3 chữ số thập phân để số liệu lưu trữ gọn và ổn định. */
const tron3 = (v: number) => Math.round(v * 1000) / 1000

/**
 * Chuẩn hóa một patch sửa bộ phận theo loại (kẹp giới hạn V2):
 * - Mọi kích thước kẹp trong [0,05; 30] m.
 * - Tường: chiều cao [1,5; 5] m, độ dày [0,05; 0,5] m; khi đổi chiều cao, neo chân tường
 *   trên mặt sàn (viTri.y = mặt sàn + cao/2); vị trí ô cửa mới luôn bị kẹp theo chiều dài mới.
 * - Cầu thang: số bậc nguyên [8; 14] và dài chạy (rong) tự đồng bộ = số bậc × 0,3 m;
 *   chiều rộng (dai) kẹp [0,7; 1,6] m; đổi chiều cao cũng neo chân trên mặt sàn.
 * Trả về bộ phận mới (không sửa bộ phận gốc).
 */
function apPatch(phan: BoPhanNha, patch: Partial<BoPhanNha>): BoPhanNha {
  const kt = { ...phan.kichThuoc, ...(patch.kichThuoc ?? {}) }
  kt.dai = kepSo(kt.dai, 0.05, 30)
  kt.rong = kepSo(kt.rong, 0.05, 30)
  kt.cao = kepSo(kt.cao, 0.05, 30)
  let viTri: [number, number, number] = patch.viTri
    ? [tron3(patch.viTri[0]), tron3(patch.viTri[1]), tron3(patch.viTri[2])]
    : [...phan.viTri]
  let soBac = patch.soBac !== undefined ? patch.soBac : phan.soBac
  let loCuaMoi = patch.loCuaMoi !== undefined ? patch.loCuaMoi : phan.loCuaMoi

  if (phan.loai === 'tuong') {
    kt.cao = kepSo(kt.cao, 1.5, 5)
    kt.rong = kepSo(kt.rong, 0.05, 0.5)
    if (patch.kichThuoc?.cao !== undefined && patch.viTri === undefined) {
      viTri = [viTri[0], tron3(MAT_SAN + kt.cao / 2), viTri[2]]
    }
    if (loCuaMoi) {
      loCuaMoi = { viTri: tron3(kepViTriLoCua(kt.dai, loCuaMoi.viTri)) }
    }
  }

  if (phan.loai === 'cau-thang') {
    if (patch.kichThuoc?.dai !== undefined) kt.dai = kepSo(kt.dai, 0.7, 1.6)
    if (soBac !== undefined) {
      soBac = Math.round(kepSo(soBac, 8, 14))
      kt.rong = tron3(soBac * SAU_BAC)
    }
    if (patch.kichThuoc?.cao !== undefined && patch.viTri === undefined) {
      viTri = [viTri[0], tron3(MAT_SAN + kt.cao / 2), viTri[2]]
    }
  }

  return {
    ...phan,
    ...patch,
    kichThuoc: kt,
    viTri,
    soBac,
    loCuaMoi,
    xoayY:
      patch.xoayY !== undefined
        ? tron3(((patch.xoayY % 360) + 360) % 360)
        : phan.xoayY,
  }
}

/**
 * Tính vị trí + góc xoay thế giới của cửa mở mới đặt trong ô trống của một tường.
 * Trục dọc tường (local +X) sau khi quay (góc gốc của tường + xoayY) trỏ theo
 * (cos θ, 0, −sin θ) trong thế giới; tâm ô cửa lệch khỏi tâm tường một đoạn
 * u = −dai/2 + vị trí từ đầu tường + nửa chiều rộng ô.
 */
function viTriCuaCuaMoi(tuong: BoPhanNha): { viTri: [number, number, number]; xoayY: number } {
  const gocGoc = GOC_GOC_TUONG.get(tuong.id) ?? 0
  const tong = gocGoc + (tuong.xoayY ?? 0)
  const rad = (tong * Math.PI) / 180
  const u = -tuong.kichThuoc.dai / 2 + (tuong.loCuaMoi?.viTri ?? 0) + RONG_O_CUA / 2
  return {
    viTri: [
      tron3(tuong.viTri[0] + Math.cos(rad) * u),
      tron3(MAT_SAN + CAO_O_CUA / 2),
      tron3(tuong.viTri[2] - Math.sin(rad) * u),
    ],
    xoayY: ((tong % 360) + 360) % 360,
  }
}

/** Góc quay gốc (độ) của các bộ phận vốn nằm dọc trục Z trong nhà mẫu (tường hai bên, cửa sổ bên). */
export const GOC_GOC_TUONG: ReadonlyMap<string, number> = new Map([
  ['tuong-trai', -90],
  ['tuong-phai', -90],
  ['cua-so-ben', -90],
])

export const useStore = create<TrangThaiNha3D>((set) => ({
  tenDuAn: 'Phương án cải tạo 1',
  boPhan: saoChepNhaMau(),
  anHien: anHienMacDinh(),
  lopBat: { ...LOP_MAC_DINH },
  dangChon: null,

  gocNhin: 'mac-dinh',
  lanDatGoc: 0,
  cheDoMatCat: false,
  cheDoXuyenTuong: false,
  cheDoGizmo: 'tat',
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
  datCheDoGizmo: (cheDo) => set((s) => (s.cheDoGizmo === cheDo ? s : { cheDoGizmo: cheDo })),

  capNhatBoPhan: (id, patch) =>
    set((s) => {
      const phan = s.boPhan.find((p) => p.id === id)
      if (!phan) return s
      const moi = apPatch(phan, patch)
      return {
        ...dayLichSu(s),
        boPhan: s.boPhan.map((p) => (p.id === id ? moi : p)),
      }
    }),

  taoCuaMoi: (tuongId, viTriTuDau) =>
    set((s) => {
      const tuong = s.boPhan.find((p) => p.id === tuongId)
      if (!tuong || !tuongTron(tuong) || tuong.loCuaMoi) return s
      const tuongMoi: BoPhanNha = {
        ...tuong,
        loCuaMoi: { viTri: tron3(kepViTriLoCua(tuong.kichThuoc.dai, viTriTuDau)) },
      }
      const { viTri, xoayY } = viTriCuaCuaMoi(tuongMoi)
      const cuaMoi: BoPhanNha = {
        id: idCuaMoi(tuongId),
        ten: `Cửa mở mới — ${tuong.ten}`,
        loai: 'cua-di',
        lop: 'cai-tao',
        kichThuoc: { dai: RONG_O_CUA, rong: 0.06, cao: CAO_O_CUA },
        viTri,
        xoayY,
        tuongNguon: tuongId,
        moTa: `Cửa đi mở mới trên ${tuong.ten.toLowerCase()} (phần cải tạo), ô trống ${RONG_O_CUA} × ${CAO_O_CUA} m.`,
      }
      return {
        ...dayLichSu(s),
        boPhan: [...s.boPhan.map((p) => (p.id === tuongId ? tuongMoi : p)), cuaMoi],
        anHien: { ...s.anHien, [cuaMoi.id]: true },
        dangChon: cuaMoi.id,
      }
    }),

  xoaCuaMoi: (tuongId) =>
    set((s) => {
      const tuong = s.boPhan.find((p) => p.id === tuongId)
      if (!tuong || !tuong.loCuaMoi) return s
      const cuaId = idCuaMoi(tuongId)
      const anHien = { ...s.anHien }
      delete anHien[cuaId]
      return {
        ...dayLichSu(s),
        boPhan: s.boPhan
          .filter((p) => p.id !== cuaId)
          .map((p) => (p.id === tuongId ? { ...p, loCuaMoi: undefined } : p)),
        anHien,
        dangChon: s.dangChon === cuaId ? tuongId : s.dangChon,
      }
    }),

  datViTriLoCua: (tuongId, viTriTuDau) =>
    set((s) => {
      const tuong = s.boPhan.find((p) => p.id === tuongId)
      if (!tuong || !tuong.loCuaMoi) return s
      const tuongMoi: BoPhanNha = {
        ...tuong,
        loCuaMoi: { viTri: tron3(kepViTriLoCua(tuong.kichThuoc.dai, viTriTuDau)) },
      }
      const { viTri, xoayY } = viTriCuaCuaMoi(tuongMoi)
      const cuaId = idCuaMoi(tuongId)
      return {
        ...dayLichSu(s),
        boPhan: s.boPhan.map((p) => {
          if (p.id === tuongId) return tuongMoi
          if (p.id === cuaId) return { ...p, viTri, xoayY }
          return p
        }),
      }
    }),

  khoiPhucNhaMau: () =>
    set((s) => ({
      ...dayLichSu(s),
      boPhan: saoChepNhaMau(),
      anHien: anHienMacDinh(),
      dangChon: null,
    })),

  hoanTac: () =>
    set((s) => {
      const truoc = s.quaKhu[s.quaKhu.length - 1]
      if (!truoc) return s
      return {
        ...truoc,
        boPhan: saoBoPhan(truoc.boPhan),
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
        boPhan: saoBoPhan(sau.boPhan),
        anHien: { ...sau.anHien },
        lopBat: { ...sau.lopBat },
        quaKhu: [...s.quaKhu, chup(s)],
        tuongLai: s.tuongLai.slice(1),
      }
    }),

  napDuAn: (duAn) =>
    set(() => {
      // V2: dùng mảng bộ phận đã lưu. V1 (không có boPhan): migration — nạp nhà mẫu
      // mặc định rồi áp ẩn/hiện + lớp + lựa chọn cũ lên trên.
      const boPhan =
        Array.isArray(duAn.boPhan) && duAn.boPhan.length > 0 ? saoBoPhan(duAn.boPhan) : saoChepNhaMau()
      const dangChon =
        duAn.dangChon && boPhan.some((p) => p.id === duAn.dangChon) ? duAn.dangChon : null
      return {
        tenDuAn: duAn.tenDuAn,
        boPhan,
        anHien: { ...anHienMacDinh(boPhan), ...duAn.anHien },
        lopBat: { ...LOP_MAC_DINH, ...duAn.lopBat },
        dangChon,
        quaKhu: [],
        tuongLai: [],
        daTaiXong: true,
      }
    }),
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
