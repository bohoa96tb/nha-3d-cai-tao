import { useStore, type GocNhin } from '../store/useStore'

const CAC_GOC: { id: GocNhin; nhan: string }[] = [
  { id: 'mac-dinh', nhan: '🧭 Mặc định' },
  { id: 'tren-xuong', nhan: '⬇ Từ trên xuống' },
  { id: 'mat-dung', nhan: '🏛 Mặt đứng' },
]

export default function ThanhDieuKhien() {
  const gocNhin = useStore((s) => s.gocNhin)
  const datGocNhin = useStore((s) => s.datGocNhin)
  const cheDoMatCat = useStore((s) => s.cheDoMatCat)
  const batTatMatCat = useStore((s) => s.batTatMatCat)
  const cheDoXuyenTuong = useStore((s) => s.cheDoXuyenTuong)
  const batTatXuyenTuong = useStore((s) => s.batTatXuyenTuong)
  const lopBat = useStore((s) => s.lopBat)
  const batTatLop = useStore((s) => s.batTatLop)
  const xemTruocCaiTao = useStore((s) => s.xemTruocCaiTao)
  const xemSauCaiTao = useStore((s) => s.xemSauCaiTao)

  return (
    <section className="thanh-dieu-khien" aria-label="Điều khiển xem 3D">
      <div className="nhom-nut" role="group" aria-label="Góc nhìn">
        {CAC_GOC.map((g) => (
          <button
            key={g.id}
            type="button"
            className={gocNhin === g.id ? 'nut nut-dang-bat' : 'nut'}
            onClick={() => datGocNhin(g.id)}
          >
            {g.nhan}
          </button>
        ))}
      </div>

      <div className="nhom-nut" role="group" aria-label="Chế độ xem">
        <button
          type="button"
          className={cheDoMatCat ? 'nut nut-dang-bat' : 'nut'}
          aria-pressed={cheDoMatCat}
          onClick={batTatMatCat}
        >
          ✂ Mặt cắt (1,6 m)
        </button>
        <button
          type="button"
          className={cheDoXuyenTuong ? 'nut nut-dang-bat' : 'nut'}
          aria-pressed={cheDoXuyenTuong}
          onClick={batTatXuyenTuong}
        >
          👻 Xuyên tường
        </button>
      </div>

      <div className="nhom-nut" role="group" aria-label="Lớp hiện trạng và cải tạo">
        <label className="o-lop">
          <input type="checkbox" checked={lopBat['hien-trang']} onChange={() => batTatLop('hien-trang')} />
          Lớp hiện trạng
        </label>
        <label className="o-lop">
          <input type="checkbox" checked={lopBat['cai-tao']} onChange={() => batTatLop('cai-tao')} />
          Lớp cải tạo
        </label>
        <button type="button" className="nut" onClick={xemTruocCaiTao}>
          ⏮ Trước cải tạo
        </button>
        <button type="button" className="nut" onClick={xemSauCaiTao}>
          ⏭ Sau cải tạo
        </button>
      </div>

      <p className="goi-y-thao-tac">Kéo để xoay 360°, cuộn/chụm để phóng to – thu nhỏ, chạm vào một bộ phận để chọn.</p>
    </section>
  )
}
