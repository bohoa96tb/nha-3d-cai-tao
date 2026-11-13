import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../store/useStore'
import { saoChepNhaMau, khoangViTriLoCua } from '../data/house'
import type { BoPhanNha } from '../types'

function datLai() {
  const boPhan = saoChepNhaMau()
  const anHien: Record<string, boolean> = {}
  for (const p of boPhan) anHien[p.id] = true
  useStore.setState({
    tenDuAn: 'Phương án cải tạo 1',
    boPhan,
    anHien,
    lopBat: { 'hien-trang': true, 'cai-tao': true },
    dangChon: null,
    cheDoGizmo: 'tat',
    quaKhu: [],
    tuongLai: [],
  })
}

const tim = (id: string): BoPhanNha => {
  const p = useStore.getState().boPhan.find((x) => x.id === id)
  if (!p) throw new Error(`Không thấy bộ phận ${id}`)
  return p
}

describe('V2 — capNhatBoPhan và hoàn tác', () => {
  beforeEach(datLai)

  it('sửa kích thước qua capNhatBoPhan và hoàn tác/làm lại được', () => {
    useStore.getState().capNhatBoPhan('mai-ton', { kichThuoc: { dai: 9, rong: 3.4, cao: 0.08 } })
    expect(tim('mai-ton').kichThuoc.dai).toBe(9)
    expect(useStore.getState().quaKhu).toHaveLength(1)
    useStore.getState().hoanTac()
    expect(tim('mai-ton').kichThuoc.dai).toBe(8)
    useStore.getState().lamLai()
    expect(tim('mai-ton').kichThuoc.dai).toBe(9)
  })

  it('sửa vị trí và góc xoay, gộp patch một phần', () => {
    const y = tim('san-nha').viTri[1]
    useStore.getState().capNhatBoPhan('san-nha', { viTri: [1.5, y, -2], xoayY: 450 })
    const san = tim('san-nha')
    expect(san.viTri[0]).toBe(1.5)
    expect(san.viTri[2]).toBe(-2)
    expect(san.xoayY).toBe(90) // 450 chuẩn hóa về 0–359
    useStore.getState().hoanTac()
    expect(tim('san-nha').xoayY).toBeUndefined()
  })

  it('capNhatBoPhan với id không tồn tại không đẩy lịch sử', () => {
    useStore.getState().capNhatBoPhan('khong-co', { xoayY: 10 })
    expect(useStore.getState().quaKhu).toHaveLength(0)
  })
})

describe('V2 — tường: chiều cao, độ dày, neo chân tường', () => {
  beforeEach(datLai)

  it('đổi chiều cao/độ dày cập nhật đúng số liệu và viTri.y neo trên mặt sàn', () => {
    useStore.getState().capNhatBoPhan('tuong-sau', { kichThuoc: { dai: 8, rong: 0.3, cao: 4 } })
    const t = tim('tuong-sau')
    expect(t.kichThuoc.cao).toBe(4)
    expect(t.kichThuoc.rong).toBe(0.3)
    expect(t.kichThuoc.dai).toBe(8)
    expect(t.viTri[1]).toBeCloseTo(0.15 + 4 / 2) // mặt sàn + cao/2
  })

  it('kẹp giới hạn tường: cao tối đa 5 m, dày trong [0,05; 0,5] m', () => {
    useStore.getState().capNhatBoPhan('tuong-sau', { kichThuoc: { dai: 8, rong: 0.01, cao: 99 } })
    const t = tim('tuong-sau')
    expect(t.kichThuoc.cao).toBe(5)
    expect(t.kichThuoc.rong).toBe(0.05)
    useStore.getState().capNhatBoPhan('tuong-sau', { kichThuoc: { dai: 8, rong: 2, cao: 1 } })
    expect(tim('tuong-sau').kichThuoc.rong).toBe(0.5)
    expect(tim('tuong-sau').kichThuoc.cao).toBe(1.5)
  })

  it('đánh dấu dự kiến đục bỏ bật/tắt và hoàn tác được — không xóa bộ phận', () => {
    const soLuong = useStore.getState().boPhan.length
    useStore.getState().capNhatBoPhan('tuong-ngan', { ducBo: true })
    expect(tim('tuong-ngan').ducBo).toBe(true)
    expect(useStore.getState().boPhan).toHaveLength(soLuong) // chỉ đánh dấu, hình học còn nguyên
    useStore.getState().hoanTac()
    expect(tim('tuong-ngan').ducBo).toBeFalsy()
    useStore.getState().lamLai()
    expect(tim('tuong-ngan').ducBo).toBe(true)
    useStore.getState().capNhatBoPhan('tuong-ngan', { ducBo: false })
    expect(tim('tuong-ngan').ducBo).toBe(false)
  })
})

describe('V2 — tạo / xóa cửa mở mới', () => {
  beforeEach(datLai)

  it('tạo cửa: tường có loCuaMoi, thêm đúng 1 cửa đi lớp cải tạo đặt đúng ô', () => {
    useStore.getState().taoCuaMoi('tuong-sau', 3)
    const s = useStore.getState()
    expect(s.boPhan).toHaveLength(16)
    expect(tim('tuong-sau').loCuaMoi).toEqual({ viTri: 3 })
    const cua = tim('cua-mo-moi-tuong-sau')
    expect(cua.loai).toBe('cua-di')
    expect(cua.lop).toBe('cai-tao')
    expect(cua.ten).toBe('Cửa mở mới — Tường bao sau')
    expect(cua.kichThuoc.dai).toBe(0.9)
    expect(cua.kichThuoc.cao).toBe(2.1)
    expect(cua.tuongNguon).toBe('tuong-sau')
    // Tường sau ở z = −5, tâm x = 0, dài 8: tâm ô = −4 + 3 + 0,45 = −0,55
    expect(cua.viTri[0]).toBeCloseTo(-0.55)
    expect(cua.viTri[1]).toBeCloseTo(1.2)
    expect(cua.viTri[2]).toBeCloseTo(-5)
    expect(s.dangChon).toBe('cua-mo-moi-tuong-sau')
    expect(s.anHien['cua-mo-moi-tuong-sau']).toBe(true)
  })

  it('vị trí ô cửa bị kẹp trong khoảng hợp lệ theo chiều dài tường', () => {
    const khoang = khoangViTriLoCua(5)
    expect(khoang).toEqual({ min: 0.2, max: 3.9 })
    useStore.getState().taoCuaMoi('tuong-ngan', 99)
    expect(tim('tuong-ngan').loCuaMoi?.viTri).toBe(3.9)
    useStore.getState().xoaCuaMoi('tuong-ngan')
    useStore.getState().taoCuaMoi('tuong-ngan', -5)
    expect(tim('tuong-ngan').loCuaMoi?.viTri).toBe(0.2)
  })

  it('không tạo được ô mới trên tường có ô sẵn hoặc khi đã có 1 ô', () => {
    useStore.getState().taoCuaMoi('tuong-truoc', 1)
    expect(useStore.getState().boPhan).toHaveLength(15)
    expect(useStore.getState().quaKhu).toHaveLength(0)
    useStore.getState().taoCuaMoi('tuong-sau', 1)
    useStore.getState().taoCuaMoi('tuong-sau', 2)
    expect(useStore.getState().boPhan).toHaveLength(16)
    expect(tim('tuong-sau').loCuaMoi?.viTri).toBe(1)
  })

  it('hoàn tác tạo cửa: tường đặc lại và cửa biến mất trong MỘT bước', () => {
    useStore.getState().taoCuaMoi('tuong-sau', 3)
    expect(useStore.getState().quaKhu).toHaveLength(1)
    useStore.getState().hoanTac()
    expect(useStore.getState().boPhan).toHaveLength(15)
    expect(tim('tuong-sau').loCuaMoi).toBeUndefined()
    useStore.getState().lamLai()
    expect(useStore.getState().boPhan).toHaveLength(16)
    expect(tim('tuong-sau').loCuaMoi).toEqual({ viTri: 3 })
  })

  it('xóa cửa mở mới khôi phục tường đặc, bỏ bộ phận cửa, hoàn tác được', () => {
    useStore.getState().taoCuaMoi('tuong-trai', 4)
    useStore.getState().xoaCuaMoi('tuong-trai')
    const s = useStore.getState()
    expect(s.boPhan).toHaveLength(15)
    expect(tim('tuong-trai').loCuaMoi).toBeUndefined()
    expect(s.boPhan.some((p) => p.id === 'cua-mo-moi-tuong-trai')).toBe(false)
    expect(s.anHien['cua-mo-moi-tuong-trai']).toBeUndefined()
    useStore.getState().hoanTac()
    expect(useStore.getState().boPhan).toHaveLength(16)
    expect(tim('tuong-trai').loCuaMoi).toEqual({ viTri: 4 })
  })

  it('đặt lại vị trí ô cửa di chuyển cả cửa đi theo', () => {
    useStore.getState().taoCuaMoi('tuong-sau', 1)
    useStore.getState().datViTriLoCua('tuong-sau', 5)
    expect(tim('tuong-sau').loCuaMoi?.viTri).toBe(5)
    // tâm ô = −4 + 5 + 0,45 = 1,45
    expect(tim('cua-mo-moi-tuong-sau').viTri[0]).toBeCloseTo(1.45)
  })

  it('rút ngắn tường thì vị trí ô cửa tự bị kẹp lại trong khoảng hợp lệ', () => {
    useStore.getState().taoCuaMoi('tuong-ngan', 3.9)
    useStore.getState().capNhatBoPhan('tuong-ngan', { kichThuoc: { dai: 3, rong: 0.15, cao: 3.2 } })
    expect(tim('tuong-ngan').loCuaMoi?.viTri).toBeCloseTo(3 - 0.9 - 0.2)
  })
})

describe('V2 — cầu thang', () => {
  beforeEach(datLai)

  it('đổi số bậc: soBac cập nhật và dài chạy (rong) đồng bộ = số bậc × 0,3', () => {
    useStore.getState().capNhatBoPhan('cau-thang', { soBac: 12 })
    const t = tim('cau-thang')
    expect(t.soBac).toBe(12)
    expect(t.kichThuoc.rong).toBeCloseTo(3.6)
    expect(t.kichThuoc.cao).toBe(3.2) // tổng cao giữ nguyên khi đổi số bậc
  })

  it('số bậc bị kẹp [8; 14] và làm tròn nguyên', () => {
    useStore.getState().capNhatBoPhan('cau-thang', { soBac: 99 })
    expect(tim('cau-thang').soBac).toBe(14)
    useStore.getState().capNhatBoPhan('cau-thang', { soBac: 3 })
    expect(tim('cau-thang').soBac).toBe(8)
  })

  it('chiều rộng cầu thang sửa được và bị kẹp [0,7; 1,6]', () => {
    useStore.getState().capNhatBoPhan('cau-thang', { kichThuoc: { dai: 1.4, rong: 3, cao: 3.2 } })
    expect(tim('cau-thang').kichThuoc.dai).toBe(1.4)
    useStore.getState().capNhatBoPhan('cau-thang', { kichThuoc: { dai: 3, rong: 3, cao: 3.2 } })
    expect(tim('cau-thang').kichThuoc.dai).toBe(1.6)
  })
})

describe('V2 — lưu / nạp và khôi phục', () => {
  beforeEach(datLai)

  it('payload phienBan 2 giữ nguyên mọi sửa đổi sau khi nạp lại', () => {
    const s0 = useStore.getState()
    s0.capNhatBoPhan('tuong-sau', { kichThuoc: { dai: 8, rong: 0.25, cao: 3.6 }, ducBo: true })
    s0.taoCuaMoi('tuong-ngan', 2)
    s0.capNhatBoPhan('cau-thang', { soBac: 11 })
    const s = useStore.getState()
    const payload = {
      phienBan: 2,
      tenDuAn: s.tenDuAn,
      boPhan: s.boPhan,
      anHien: s.anHien,
      lopBat: s.lopBat,
      dangChon: s.dangChon,
      luuLuc: new Date().toISOString(),
    }
    datLai()
    useStore.getState().napDuAn(payload)
    expect(tim('tuong-sau').kichThuoc.cao).toBe(3.6)
    expect(tim('tuong-sau').ducBo).toBe(true)
    expect(tim('tuong-ngan').loCuaMoi).toEqual({ viTri: 2 })
    expect(tim('cau-thang').soBac).toBe(11)
    expect(useStore.getState().boPhan).toHaveLength(16)
  })

  it('migration payload V1 (không có boPhan): nạp nhà mẫu mặc định, áp ẩn/hiện cũ, không lỗi', () => {
    useStore.getState().napDuAn({
      tenDuAn: 'Bản lưu V1',
      anHien: { 'mai-ton': false },
      lopBat: { 'hien-trang': true, 'cai-tao': false },
      dangChon: 'mai-ton',
      luuLuc: new Date().toISOString(),
    })
    const s = useStore.getState()
    expect(s.boPhan).toHaveLength(15)
    expect(s.boPhan).toEqual(saoChepNhaMau())
    expect(s.anHien['mai-ton']).toBe(false)
    expect(s.dangChon).toBe('mai-ton')
    expect(s.daTaiXong).toBe(true)
  })

  it('khôi phục nhà mẫu đưa mọi sửa đổi về mặc định và hoàn tác được', () => {
    useStore.getState().capNhatBoPhan('tuong-sau', { kichThuoc: { dai: 8, rong: 0.2, cao: 4.5 } })
    useStore.getState().taoCuaMoi('tuong-sau', 2)
    useStore.getState().khoiPhucNhaMau()
    expect(useStore.getState().boPhan).toEqual(saoChepNhaMau())
    useStore.getState().hoanTac()
    expect(tim('tuong-sau').kichThuoc.cao).toBe(4.5)
    expect(useStore.getState().boPhan).toHaveLength(16)
  })
})
