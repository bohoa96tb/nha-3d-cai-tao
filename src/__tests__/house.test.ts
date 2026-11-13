import { describe, it, expect } from 'vitest'
import { NHA_MAU, timBoPhan } from '../data/house'

describe('Dữ liệu nhà mẫu', () => {
  it('mọi bộ phận có id duy nhất', () => {
    const ids = NHA_MAU.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('mọi bộ phận có tên tiếng Việt, mô tả và kích thước > 0', () => {
    for (const p of NHA_MAU) {
      expect(p.ten.trim().length).toBeGreaterThan(0)
      expect(p.moTa.trim().length).toBeGreaterThan(0)
      expect(p.kichThuoc.dai).toBeGreaterThan(0)
      expect(p.kichThuoc.rong).toBeGreaterThan(0)
      expect(p.kichThuoc.cao).toBeGreaterThan(0)
      expect(p.viTri).toHaveLength(3)
      expect(['hien-trang', 'cai-tao']).toContain(p.lop)
    }
  })

  it('có đủ các bộ phận bắt buộc của V1', () => {
    const cacLoai = new Set(NHA_MAU.map((p) => p.loai))
    for (const loai of ['nen-mong', 'san', 'tuong', 'cua-di', 'cua-so', 'cau-thang', 'mai', 'khung-thep', 'tum'] as const) {
      expect(cacLoai.has(loai)).toBe(true)
    }
    expect(NHA_MAU.filter((p) => p.loai === 'tuong').length).toBeGreaterThanOrEqual(5)
    expect(NHA_MAU.filter((p) => p.loai === 'cua-so').length).toBeGreaterThanOrEqual(2)
  })

  it('kích thước chuẩn: sàn 8×10 m dày 0,15 m; tường cao 3,2 m dày 0,2 m; cửa đi 0,9×2,1 m', () => {
    const san = timBoPhan('san-nha')
    expect(san?.kichThuoc.dai).toBe(8)
    expect(san?.kichThuoc.rong).toBe(10)
    expect(san?.kichThuoc.cao).toBe(0.15)

    const tuongTruoc = timBoPhan('tuong-truoc')
    expect(tuongTruoc?.kichThuoc.cao).toBe(3.2)
    expect(tuongTruoc?.kichThuoc.rong).toBe(0.2)

    const cua = timBoPhan('cua-di-chinh')
    expect(cua?.kichThuoc.dai).toBe(0.9)
    expect(cua?.kichThuoc.cao).toBe(2.1)
  })

  it('có bộ phận thuộc lớp cải tạo (mái tôn, khung thép, tum) để xem trước/sau có ý nghĩa', () => {
    const caiTao = NHA_MAU.filter((p) => p.lop === 'cai-tao').map((p) => p.id)
    expect(caiTao).toContain('mai-ton')
    expect(caiTao).toContain('khung-thep-mai-ton')
    expect(caiTao).toContain('tum-cau-thang')
    expect(NHA_MAU.some((p) => p.lop === 'hien-trang')).toBe(true)
  })
})
