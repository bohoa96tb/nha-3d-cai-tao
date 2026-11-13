import { NHAN_LOP } from '../types'
import { useStore, dangHienThi } from '../store/useStore'

export default function PartsList() {
  const dangChon = useStore((s) => s.dangChon)
  const boPhan = useStore((s) => s.boPhan)
  const anHien = useStore((s) => s.anHien)
  const lopBat = useStore((s) => s.lopBat)
  const chon = useStore((s) => s.chon)
  const batTatHien = useStore((s) => s.batTatHien)

  return (
    <section className="bang bang-danh-sach" aria-label="Danh sách các bộ phận của ngôi nhà">
      <h2>Các bộ phận ({boPhan.length})</h2>
      <ul className="danh-sach-bo-phan">
        {boPhan.map((p) => {
          const hien = dangHienThi(anHien, lopBat, p.id, p.lop)
          const dangChonDay = dangChon === p.id
          return (
            <li key={p.id} className={dangChonDay ? 'muc dang-chon' : 'muc'}>
              <button
                type="button"
                className="nut-chon-muc"
                onClick={() => chon(p.id)}
                aria-pressed={dangChonDay}
              >
                <span className="ten-muc">{p.ten}</span>
                <span className={p.lop === 'cai-tao' ? 'the-lop the-cai-tao' : 'the-lop'}>
                  {NHAN_LOP[p.lop]}
                </span>
                {p.loai === 'tuong' && p.ducBo && <span className="the-duc-bo">Dự kiến đục bỏ</span>}
                <span className="kich-thuoc-muc">
                  {p.kichThuoc.dai.toFixed(2)} × {p.kichThuoc.rong.toFixed(2)} × {p.kichThuoc.cao.toFixed(2)} m
                </span>
              </button>
              <button
                type="button"
                className="nut-mat"
                onClick={() => batTatHien(p.id)}
                aria-label={(anHien[p.id] ?? true) ? `Ẩn ${p.ten}` : `Hiện ${p.ten}`}
                title={(anHien[p.id] ?? true) ? 'Ẩn bộ phận' : 'Hiện bộ phận'}
              >
                {hien ? '👁' : '🙈'}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
