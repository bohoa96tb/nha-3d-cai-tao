import { describe, it, expect, beforeEach } from 'vitest'
import { useStore, dangHienThi } from '../store/useStore'
import { NHA_MAU } from '../data/house'

function datLai() {
  const anHien: Record<string, boolean> = {}
  for (const p of NHA_MAU) anHien[p.id] = true
  useStore.setState({
    tenDuAn: 'Phương án cải tạo 1',
    anHien,
    lopBat: { 'hien-trang': true, 'cai-tao': true },
    dangChon: null,
    quaKhu: [],
    tuongLai: [],
  })
}

describe('Store dự án', () => {
  beforeEach(datLai)

  it('chọn đối tượng và bỏ chọn', () => {
    useStore.getState().chon('tuong-truoc')
    expect(useStore.getState().dangChon).toBe('tuong-truoc')
    useStore.getState().chon(null)
    expect(useStore.getState().dangChon).toBeNull()
  })

  it('ẩn/hiện từng bộ phận', () => {
    useStore.getState().batTatHien('mai-chinh')
    expect(useStore.getState().anHien['mai-chinh']).toBe(false)
    useStore.getState().batTatHien('mai-chinh')
    expect(useStore.getState().anHien['mai-chinh']).toBe(true)
  })

  it('bật/tắt lớp và xem trước/sau cải tạo', () => {
    useStore.getState().xemTruocCaiTao()
    expect(useStore.getState().lopBat['cai-tao']).toBe(false)
    expect(useStore.getState().lopBat['hien-trang']).toBe(true)
    useStore.getState().xemSauCaiTao()
    expect(useStore.getState().lopBat['cai-tao']).toBe(true)
    useStore.getState().batTatLop('hien-trang')
    expect(useStore.getState().lopBat['hien-trang']).toBe(false)
  })

  it('hoàn tác và làm lại với ẩn/hiện', () => {
    useStore.getState().batTatHien('cua-di-chinh')
    expect(useStore.getState().anHien['cua-di-chinh']).toBe(false)
    useStore.getState().hoanTac()
    expect(useStore.getState().anHien['cua-di-chinh']).toBe(true)
    useStore.getState().lamLai()
    expect(useStore.getState().anHien['cua-di-chinh']).toBe(false)
  })

  it('hoàn tác việc chọn và việc tắt lớp', () => {
    useStore.getState().chon('tum-cau-thang')
    useStore.getState().batTatLop('cai-tao')
    expect(useStore.getState().lopBat['cai-tao']).toBe(false)
    useStore.getState().hoanTac()
    expect(useStore.getState().lopBat['cai-tao']).toBe(true)
    expect(useStore.getState().dangChon).toBe('tum-cau-thang')
    useStore.getState().hoanTac()
    expect(useStore.getState().dangChon).toBeNull()
    useStore.getState().lamLai()
    expect(useStore.getState().dangChon).toBe('tum-cau-thang')
  })

  it('hoàn tác khi lịch sử rỗng không làm hỏng trạng thái', () => {
    useStore.getState().hoanTac()
    expect(useStore.getState().dangChon).toBeNull()
    useStore.getState().lamLai()
    expect(useStore.getState().quaKhu).toHaveLength(0)
  })

  it('nạp dự án đã lưu khôi phục trạng thái và xóa lịch sử', () => {
    useStore.getState().napDuAn({
      tenDuAn: 'Phương án 2',
      anHien: { 'mai-ton': false },
      lopBat: { 'hien-trang': true, 'cai-tao': false },
      dangChon: 'mai-ton',
      luuLuc: new Date().toISOString(),
    })
    const s = useStore.getState()
    expect(s.tenDuAn).toBe('Phương án 2')
    expect(s.anHien['mai-ton']).toBe(false)
    expect(s.anHien['san-nha']).toBe(true)
    expect(s.lopBat['cai-tao']).toBe(false)
    expect(s.dangChon).toBe('mai-ton')
    expect(s.quaKhu).toHaveLength(0)
    expect(s.daTaiXong).toBe(true)
  })

  it('dangHienThi kết hợp ẩn theo bộ phận và theo lớp', () => {
    const lopBat = { 'hien-trang': true, 'cai-tao': false } as const
    expect(dangHienThi({ a: true }, { ...lopBat }, 'a', 'hien-trang')).toBe(true)
    expect(dangHienThi({ a: true }, { ...lopBat }, 'a', 'cai-tao')).toBe(false)
    expect(dangHienThi({ a: false }, { 'hien-trang': true, 'cai-tao': true }, 'a', 'hien-trang')).toBe(false)
    expect(dangHienThi({}, { 'hien-trang': true, 'cai-tao': true }, 'chua-co', 'hien-trang')).toBe(true)
  })
})
