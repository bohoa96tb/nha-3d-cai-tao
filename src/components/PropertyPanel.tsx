import { timBoPhan } from '../data/house'
import { NHAN_LOAI, NHAN_LOP } from '../types'
import { useStore, dangHienThi } from '../store/useStore'

const f2 = (n: number) => n.toFixed(2)

export default function PropertyPanel() {
  const dangChon = useStore((s) => s.dangChon)
  const anHien = useStore((s) => s.anHien)
  const lopBat = useStore((s) => s.lopBat)
  const batTatHien = useStore((s) => s.batTatHien)

  const phan = timBoPhan(dangChon)

  return (
    <section className="bang bang-thuoc-tinh" aria-label="Thuộc tính đối tượng đang chọn">
      <h2>Thuộc tính</h2>
      {!phan ? (
        <p className="chua-chon">
          Chưa chọn bộ phận nào. Hãy chạm vào một bộ phận trên mô hình 3D, hoặc chọn trong danh sách bên dưới.
        </p>
      ) : (
        <div>
          <h3 className="ten-bo-phan">{phan.ten}</h3>
          <dl className="danh-sach-thuoc-tinh">
            <div>
              <dt>Loại</dt>
              <dd>{NHAN_LOAI[phan.loai]}</dd>
            </div>
            <div>
              <dt>Lớp</dt>
              <dd>{NHAN_LOP[phan.lop]}</dd>
            </div>
            <div>
              <dt>Dài</dt>
              <dd>{f2(phan.kichThuoc.dai)} m</dd>
            </div>
            <div>
              <dt>Rộng / dày</dt>
              <dd>{f2(phan.kichThuoc.rong)} m</dd>
            </div>
            <div>
              <dt>Cao</dt>
              <dd>{f2(phan.kichThuoc.cao)} m</dd>
            </div>
            <div>
              <dt>Vị trí (x, y, z)</dt>
              <dd>
                {f2(phan.viTri[0])} m, {f2(phan.viTri[1])} m, {f2(phan.viTri[2])} m
              </dd>
            </div>
            <div>
              <dt>Trạng thái</dt>
              <dd>{dangHienThi(anHien, lopBat, phan.id, phan.lop) ? 'Đang hiện' : 'Đang ẩn'}</dd>
            </div>
          </dl>
          <p className="mo-ta">{phan.moTa}</p>
          <button type="button" className="nut" onClick={() => batTatHien(phan.id)}>
            {(anHien[phan.id] ?? true) ? '🙈 Ẩn bộ phận này' : '👁 Hiện bộ phận này'}
          </button>
        </div>
      )}
    </section>
  )
}
