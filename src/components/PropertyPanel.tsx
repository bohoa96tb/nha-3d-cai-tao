import { useEffect, useState } from 'react'
import { NHAN_LOAI, NHAN_LOP } from '../types'
import { useStore, dangHienThi, type CheDoGizmo } from '../store/useStore'
import { khoangViTriLoCua, tuongCoOSan, tuongTron, RONG_O_CUA, CAO_O_CUA } from '../data/house'

const f2 = (n: number) => n.toFixed(2)

interface OSoProps {
  nhan: string
  giaTri: number
  buoc?: number
  min?: number
  max?: number
  soLe?: number
  voHieuHoa?: boolean
  onCommit: (v: number) => void
}

/**
 * Ô nhập số: gõ tự do, chỉ ghi vào store khi Enter hoặc rời ô (blur),
 * nên mỗi lần sửa = đúng một mục lịch sử hoàn tác.
 */
function OSo({ nhan, giaTri, buoc = 0.1, min, max, soLe = 2, voHieuHoa, onCommit }: OSoProps) {
  const [chu, setChu] = useState(giaTri.toFixed(soLe))
  useEffect(() => {
    setChu(giaTri.toFixed(soLe))
  }, [giaTri, soLe])

  const ghi = () => {
    const v = Number.parseFloat(chu.replace(',', '.'))
    if (Number.isNaN(v)) {
      setChu(giaTri.toFixed(soLe))
      return
    }
    let kq = v
    if (min !== undefined) kq = Math.max(min, kq)
    if (max !== undefined) kq = Math.min(max, kq)
    if (kq !== giaTri) onCommit(kq)
    setChu(kq.toFixed(soLe))
  }

  return (
    <label className="o-so">
      <span>{nhan}</span>
      <input
        type="number"
        inputMode="decimal"
        step={buoc}
        min={min}
        max={max}
        value={chu}
        disabled={voHieuHoa}
        onChange={(e) => setChu(e.target.value)}
        onBlur={ghi}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        }}
      />
    </label>
  )
}

const CAC_CHE_DO_GIZMO: { id: Exclude<CheDoGizmo, 'tat'>; nhan: string }[] = [
  { id: 'di-chuyen', nhan: '↔ Di chuyển' },
  { id: 'xoay', nhan: '⟳ Xoay' },
  { id: 'kich-thuoc', nhan: '⤢ Kích thước' },
]

export default function PropertyPanel() {
  const dangChon = useStore((s) => s.dangChon)
  const boPhan = useStore((s) => s.boPhan)
  const anHien = useStore((s) => s.anHien)
  const lopBat = useStore((s) => s.lopBat)
  const batTatHien = useStore((s) => s.batTatHien)
  const capNhatBoPhan = useStore((s) => s.capNhatBoPhan)
  const taoCuaMoi = useStore((s) => s.taoCuaMoi)
  const xoaCuaMoi = useStore((s) => s.xoaCuaMoi)
  const datViTriLoCua = useStore((s) => s.datViTriLoCua)
  const cheDoGizmo = useStore((s) => s.cheDoGizmo)
  const datCheDoGizmo = useStore((s) => s.datCheDoGizmo)

  const phan = boPhan.find((p) => p.id === dangChon)

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
              <dt>Góc xoay Y</dt>
              <dd>{f2(phan.xoayY ?? 0)}°</dd>
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

          {/* ---------- V2: khu vực chỉnh sửa ---------- */}
          <div className="khu-chinh-sua">
            <h3>Chỉnh sửa</h3>

            <div className="nhom-gizmo" role="group" aria-label="Chế độ kéo trực tiếp trên mô hình">
              <button
                type="button"
                className={cheDoGizmo !== 'tat' ? 'nut nut-dang-bat' : 'nut'}
                aria-pressed={cheDoGizmo !== 'tat'}
                onClick={() => datCheDoGizmo(cheDoGizmo === 'tat' ? 'di-chuyen' : 'tat')}
              >
                🖐 Kéo trực tiếp trên mô hình: {cheDoGizmo === 'tat' ? 'Đang tắt' : 'Đang bật'}
              </button>
              {cheDoGizmo !== 'tat' && (
                <div className="nhom-nut">
                  {CAC_CHE_DO_GIZMO.map((c) => {
                    const khoaKichThuoc =
                      c.id === 'kich-thuoc' && (phan.loai === 'tuong' || phan.loai === 'cau-thang')
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={cheDoGizmo === c.id ? 'nut nut-dang-bat' : 'nut'}
                        aria-pressed={cheDoGizmo === c.id}
                        disabled={khoaKichThuoc}
                        title={khoaKichThuoc ? 'Tường và cầu thang sửa kích thước bằng ô số bên dưới' : undefined}
                        onClick={() => datCheDoGizmo(c.id)}
                      >
                        {c.nhan}
                      </button>
                    )
                  })}
                </div>
              )}
              {cheDoGizmo !== 'tat' && (
                <p className="ghi-chu">
                  {(phan.loai === 'tuong' || phan.loai === 'cau-thang') &&
                    'Tường và cầu thang không kéo đổi kích thước bằng tay — hãy dùng ô số bên dưới. '}
                  Kéo các mũi tên/vòng trên mô hình để sửa; thả ra là ghi lại (hoàn tác được).
                </p>
              )}
            </div>

            <div className="luoi-o-so">
              <OSo
                nhan="Vị trí X (m)"
                giaTri={phan.viTri[0]}
                onCommit={(v) => capNhatBoPhan(phan.id, { viTri: [v, phan.viTri[1], phan.viTri[2]] })}
              />
              <OSo
                nhan="Vị trí Z (m)"
                giaTri={phan.viTri[2]}
                onCommit={(v) => capNhatBoPhan(phan.id, { viTri: [phan.viTri[0], phan.viTri[1], v] })}
              />
              <OSo
                nhan="Góc xoay Y (°)"
                giaTri={phan.xoayY ?? 0}
                buoc={5}
                min={0}
                max={359}
                soLe={0}
                onCommit={(v) => capNhatBoPhan(phan.id, { xoayY: v })}
              />
            </div>

            {phan.loai === 'tuong' ? (
              <>
                <div className="luoi-o-so">
                  <OSo
                    nhan="Chiều dài (m)"
                    giaTri={phan.kichThuoc.dai}
                    voHieuHoa={tuongCoOSan(phan)}
                    onCommit={(v) =>
                      capNhatBoPhan(phan.id, {
                        kichThuoc: { ...phan.kichThuoc, dai: v },
                      })
                    }
                  />
                  <OSo
                    nhan="Độ dày (m)"
                    giaTri={phan.kichThuoc.rong}
                    buoc={0.05}
                    min={0.05}
                    max={0.5}
                    onCommit={(v) =>
                      capNhatBoPhan(phan.id, {
                        kichThuoc: { ...phan.kichThuoc, rong: v },
                      })
                    }
                  />
                  <OSo
                    nhan="Chiều cao (m)"
                    giaTri={phan.kichThuoc.cao}
                    min={1.5}
                    max={5}
                    onCommit={(v) =>
                      capNhatBoPhan(phan.id, {
                        kichThuoc: { ...phan.kichThuoc, cao: v },
                      })
                    }
                  />
                </div>
                {tuongCoOSan(phan) && (
                  <p className="ghi-chu">Tường có ô cửa: không sửa chiều dài trong V2 (vẫn sửa được chiều cao và độ dày).</p>
                )}

                <div className="khu-duc-bo">
                  <label className="o-lop">
                    <input
                      type="checkbox"
                      checked={!!phan.ducBo}
                      onChange={(e) => capNhatBoPhan(phan.id, { ducBo: e.target.checked })}
                    />
                    Đánh dấu dự kiến đục bỏ
                  </label>
                  <p className="canh-bao">
                    ⚠ Chỉ đánh dấu để lập phương án — không tự phá kết cấu chịu lực. Tường được đánh dấu sẽ hiện màu đỏ
                    mờ trên mô hình.
                  </p>
                </div>

                {tuongTron(phan) &&
                  (phan.loCuaMoi ? (
                    <div className="khu-cua-moi">
                      <p className="ghi-chu">
                        Tường này đã có ô cửa mở mới {RONG_O_CUA} × {CAO_O_CUA} m và một cửa đi thuộc lớp Cải tạo.
                      </p>
                      <OSo
                        nhan="Vị trí ô cửa (m từ đầu tường)"
                        giaTri={phan.loCuaMoi.viTri}
                        min={khoangViTriLoCua(phan.kichThuoc.dai).min}
                        max={khoangViTriLoCua(phan.kichThuoc.dai).max}
                        onCommit={(v) => datViTriLoCua(phan.id, v)}
                      />
                      <button type="button" className="nut" onClick={() => xoaCuaMoi(phan.id)}>
                        ✖ Xóa cửa mở mới
                      </button>
                    </div>
                  ) : (
                    <KhuTaoCua
                      daiTuong={phan.kichThuoc.dai}
                      onTao={(v) => taoCuaMoi(phan.id, v)}
                    />
                  ))}
              </>
            ) : phan.loai === 'cau-thang' ? (
              <>
                <div className="luoi-o-so">
                  <OSo
                    nhan="Chiều rộng (m)"
                    giaTri={phan.kichThuoc.dai}
                    min={0.7}
                    max={1.6}
                    onCommit={(v) =>
                      capNhatBoPhan(phan.id, {
                        kichThuoc: { ...phan.kichThuoc, dai: v },
                      })
                    }
                  />
                  <OSo
                    nhan="Số bậc"
                    giaTri={phan.soBac ?? 10}
                    buoc={1}
                    min={8}
                    max={14}
                    soLe={0}
                    onCommit={(v) => capNhatBoPhan(phan.id, { soBac: Math.round(v) })}
                  />
                  <OSo
                    nhan="Chiều cao tổng (m)"
                    giaTri={phan.kichThuoc.cao}
                    onCommit={(v) =>
                      capNhatBoPhan(phan.id, {
                        kichThuoc: { ...phan.kichThuoc, cao: v },
                      })
                    }
                  />
                </div>
                <p className="ghi-chu">
                  Số bậc thay đổi thì chiều cao mỗi bậc = chiều cao tổng ÷ số bậc; dài chạy bậc tự tính lại theo số bậc.
                </p>
              </>
            ) : (
              <div className="luoi-o-so">
                <OSo
                  nhan="Dài (m)"
                  giaTri={phan.kichThuoc.dai}
                  onCommit={(v) =>
                    capNhatBoPhan(phan.id, { kichThuoc: { ...phan.kichThuoc, dai: v } })
                  }
                />
                <OSo
                  nhan="Rộng (m)"
                  giaTri={phan.kichThuoc.rong}
                  onCommit={(v) =>
                    capNhatBoPhan(phan.id, { kichThuoc: { ...phan.kichThuoc, rong: v } })
                  }
                />
                <OSo
                  nhan="Cao (m)"
                  giaTri={phan.kichThuoc.cao}
                  onCommit={(v) =>
                    capNhatBoPhan(phan.id, { kichThuoc: { ...phan.kichThuoc, cao: v } })
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

/** Khu tạo cửa mở mới: ô nhập vị trí ô cửa + nút tạo. */
function KhuTaoCua({ daiTuong, onTao }: { daiTuong: number; onTao: (v: number) => void }) {
  const khoang = khoangViTriLoCua(daiTuong)
  const [viTri, setViTri] = useState(() => (khoang.min + khoang.max) / 2)
  useEffect(() => {
    setViTri((khoang.min + khoang.max) / 2)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daiTuong])
  return (
    <div className="khu-cua-moi">
      <OSo nhan="Vị trí ô cửa (m từ đầu tường)" giaTri={viTri} min={khoang.min} max={khoang.max} onCommit={setViTri} />
      <button type="button" className="nut nut-chinh" onClick={() => onTao(viTri)}>
        ➕ Tạo cửa mở mới ({RONG_O_CUA} × {CAO_O_CUA} m)
      </button>
      <p className="ghi-chu">
        Tường sẽ được dựng lại với một ô trống và thêm một cửa đi mới thuộc lớp Cải tạo. Mỗi tường tối đa 1 ô mới trong
        V2.
      </p>
    </div>
  )
}
