import { useStore } from '../store/useStore'

interface Props {
  onLuu: () => void
  trangThaiLuu: string
}

export default function Toolbar({ onLuu, trangThaiLuu }: Props) {
  const tenDuAn = useStore((s) => s.tenDuAn)
  const datTenDuAn = useStore((s) => s.datTenDuAn)
  const hoanTac = useStore((s) => s.hoanTac)
  const lamLai = useStore((s) => s.lamLai)
  const khoiPhucNhaMau = useStore((s) => s.khoiPhucNhaMau)
  const coHoanTac = useStore((s) => s.quaKhu.length > 0)
  const coLamLai = useStore((s) => s.tuongLai.length > 0)

  return (
    <header className="thanh-cong-cu">
      <div className="hang-tieu-de">
        <h1>🏠 NHÀ 3D – CẢI TẠO NHÀ</h1>
      </div>
      <div className="hang-luu">
        <label className="nhan-ten" htmlFor="ten-du-an">
          Tên dự án
        </label>
        <input
          id="ten-du-an"
          className="o-ten-du-an"
          value={tenDuAn}
          onChange={(e) => datTenDuAn(e.target.value)}
          placeholder="Ví dụ: Phương án cải tạo 1"
        />
        <button type="button" className="nut nut-chinh" onClick={onLuu}>
          💾 Lưu dự án
        </button>
      </div>
      <div className="hang-hoan-tac">
        <button type="button" className="nut" onClick={hoanTac} disabled={!coHoanTac}>
          ↩ Hoàn tác
        </button>
        <button type="button" className="nut" onClick={lamLai} disabled={!coLamLai}>
          ↪ Làm lại
        </button>
        <button
          type="button"
          className="nut"
          onClick={khoiPhucNhaMau}
          title="Đặt lại mọi bộ phận về nhà mẫu ban đầu (vẫn hoàn tác được)"
        >
          🏠 Khôi phục nhà mẫu
        </button>
        <span className="trang-thai-luu" role="status">
          {trangThaiLuu}
        </span>
      </div>
    </header>
  )
}
