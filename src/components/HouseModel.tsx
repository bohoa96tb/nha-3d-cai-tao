import { useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import { Edges } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { NHA_MAU } from '../data/house'
import { useStore, dangHienThi } from '../store/useStore'

type Vec3 = [number, number, number]

interface HopProps {
  viTri: Vec3
  kichThuoc: Vec3
  mau: string
  duocChon: boolean
  planes: THREE.Plane[] | undefined
  xuyenTuong?: boolean
  xoayX?: number
  xoayZ?: number
  kimLoai?: number
  doNham?: number
}

/** Một khối hộp trong mô hình. Khi được chọn: phát sáng emissive + viền cam. */
function Hop({ viTri, kichThuoc, mau, duocChon, planes, xuyenTuong, xoayX = 0, xoayZ = 0, kimLoai = 0, doNham = 0.85 }: HopProps) {
  return (
    <mesh position={viTri} rotation={[xoayX, 0, xoayZ]} castShadow receiveShadow>
      <boxGeometry args={kichThuoc} />
      <meshStandardMaterial
        color={mau}
        metalness={kimLoai}
        roughness={doNham}
        emissive={duocChon ? '#ff8c1a' : '#000000'}
        emissiveIntensity={duocChon ? 0.45 : 0}
        transparent={!!xuyenTuong}
        opacity={xuyenTuong ? 0.25 : 1}
        clippingPlanes={planes}
        clipShadows
      />
      {duocChon && <Edges scale={1.03} color="#ff8c1a" />}
    </mesh>
  )
}

interface NhomProps {
  id: string
  children: ReactNode
}

/** Nhóm của một bộ phận: chạm/click để chọn, dừng lan truyền để không chọn nhầm bộ phận phía sau. */
function NhomBoPhan({ id, children }: NhomProps) {
  const anHien = useStore((s) => s.anHien)
  const lopBat = useStore((s) => s.lopBat)
  const chon = useStore((s) => s.chon)
  const phan = NHA_MAU.find((p) => p.id === id)
  if (!phan) return null
  const hien = dangHienThi(anHien, lopBat, id, phan.lop)
  return (
    <group
      visible={hien}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        chon(id)
      }}
    >
      {children}
    </group>
  )
}

const MAU = {
  nen: '#9a8f85',
  san: '#cbb59a',
  tuong: '#e9e1cf',
  tuongNgan: '#ddd1b8',
  cuaGo: '#7a4a21',
  khungCua: '#4c4238',
  kinh: '#a8d8ea',
  thang: '#b3a893',
  maiChinh: '#b3543f',
  maiTon: '#7fa6b8',
  thep: '#565d66',
  maiTum: '#8a4a3a',
}

/** Cao độ mặt cắt ngang của chế độ "Mặt cắt": 1,6 m trên mặt sàn (sàn ở y = 0,15). */
export const CAO_DO_MAT_CAT = 1.75

export default function HouseModel() {
  const dangChon = useStore((s) => s.dangChon)
  const cheDoMatCat = useStore((s) => s.cheDoMatCat)
  const cheDoXuyenTuong = useStore((s) => s.cheDoXuyenTuong)

  const planes = useMemo<THREE.Plane[] | undefined>(() => {
    if (!cheDoMatCat) return undefined
    return [new THREE.Plane(new THREE.Vector3(0, -1, 0), CAO_DO_MAT_CAT)]
  }, [cheDoMatCat])

  // Hình lăng trụ cho mái chính: tam giác (rộng 8,8 m, cao 2,2 m) đùn dọc 10,8 m.
  const maiChinhGeo = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-4.4, 3.35)
    shape.lineTo(4.4, 3.35)
    shape.lineTo(0, 5.55)
    shape.closePath()
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 10.8, bevelEnabled: false })
    geo.translate(0, 0, -5.4)
    return geo
  }, [])

  const chon = (id: string) => dangChon === id
  const xt = (id: string) => cheDoXuyenTuong && chonXuyenTuong(id)
  function chonXuyenTuong(id: string) {
    const p = NHA_MAU.find((x) => x.id === id)
    return p?.loai === 'tuong'
  }

  // Cầu thang: 10 bậc, mỗi bậc cao 0,32 m, sâu 0,3 m, rộng 1 m; chạy dọc tường phải về phía sau.
  const cacBac = Array.from({ length: 10 }, (_, i) => ({
    cao: (i + 1) * 0.32,
    y: 0.15 + ((i + 1) * 0.32) / 2,
    z: -1.2 - i * 0.3,
  }))

  // Xà gồ khung thép: 5 thanh dọc nằm dưới mái tôn, cao độ giảm dần theo độ dốc 10°.
  const xaGo = [-5.7, -6.3, -6.9, -7.5, -8.1].map((z) => ({
    z,
    y: 3.3 + (-(z + 6.9)) * Math.tan(0.175) - 0.1,
  }))

  return (
    <group>
      {/* Nền móng */}
      <NhomBoPhan id="nen-mong">
        <Hop viTri={[0, -0.2, 0]} kichThuoc={[8.6, 0.4, 10.6]} mau={MAU.nen} duocChon={chon('nen-mong')} planes={planes} />
      </NhomBoPhan>

      {/* Sàn nhà */}
      <NhomBoPhan id="san-nha">
        <Hop viTri={[0, 0.075, 0]} kichThuoc={[8, 0.15, 10]} mau={MAU.san} duocChon={chon('san-nha')} planes={planes} />
      </NhomBoPhan>

      {/* Tường trước: xây theo đoạn, chừa ô cửa đi (x -2,85..-1,95) và ô cửa sổ (x 1,25..2,75, bệ 0,9 m) */}
      <NhomBoPhan id="tuong-truoc">
        <Hop viTri={[-3.425, 1.75, 5]} kichThuoc={[1.15, 3.2, 0.2]} mau={MAU.tuong} duocChon={chon('tuong-truoc')} planes={planes} xuyenTuong={xt('tuong-truoc')} />
        <Hop viTri={[0.15, 1.75, 5]} kichThuoc={[1.8, 3.2, 0.2]} mau={MAU.tuong} duocChon={chon('tuong-truoc')} planes={planes} xuyenTuong={xt('tuong-truoc')} />
        <Hop viTri={[3.625, 1.75, 5]} kichThuoc={[0.75, 3.2, 0.2]} mau={MAU.tuong} duocChon={chon('tuong-truoc')} planes={planes} xuyenTuong={xt('tuong-truoc')} />
        <Hop viTri={[-2.4, 2.8, 5]} kichThuoc={[0.9, 1.1, 0.2]} mau={MAU.tuong} duocChon={chon('tuong-truoc')} planes={planes} xuyenTuong={xt('tuong-truoc')} />
        <Hop viTri={[2, 0.6, 5]} kichThuoc={[1.5, 0.9, 0.2]} mau={MAU.tuong} duocChon={chon('tuong-truoc')} planes={planes} xuyenTuong={xt('tuong-truoc')} />
        <Hop viTri={[2, 2.9, 5]} kichThuoc={[1.5, 0.9, 0.2]} mau={MAU.tuong} duocChon={chon('tuong-truoc')} planes={planes} xuyenTuong={xt('tuong-truoc')} />
        <Hop viTri={[-3.7, 1.75, 5]} kichThuoc={[0.6, 3.2, 0.2]} mau={MAU.tuong} duocChon={chon('tuong-truoc')} planes={planes} xuyenTuong={xt('tuong-truoc')} />
      </NhomBoPhan>

      {/* Tường sau */}
      <NhomBoPhan id="tuong-sau">
        <Hop viTri={[0, 1.75, -5]} kichThuoc={[8, 3.2, 0.2]} mau={MAU.tuong} duocChon={chon('tuong-sau')} planes={planes} xuyenTuong={xt('tuong-sau')} />
      </NhomBoPhan>

      {/* Tường trái */}
      <NhomBoPhan id="tuong-trai">
        <Hop viTri={[-4, 1.75, 0]} kichThuoc={[0.2, 3.2, 10]} mau={MAU.tuong} duocChon={chon('tuong-trai')} planes={planes} xuyenTuong={xt('tuong-trai')} />
      </NhomBoPhan>

      {/* Tường phải: xây theo đoạn, chừa ô cửa sổ phụ (z 0,9..2,1, bệ 1,1 m) */}
      <NhomBoPhan id="tuong-phai">
        <Hop viTri={[4, 1.75, -2.05]} kichThuoc={[0.2, 3.2, 5.9]} mau={MAU.tuong} duocChon={chon('tuong-phai')} planes={planes} xuyenTuong={xt('tuong-phai')} />
        <Hop viTri={[4, 1.75, 3.55]} kichThuoc={[0.2, 3.2, 2.9]} mau={MAU.tuong} duocChon={chon('tuong-phai')} planes={planes} xuyenTuong={xt('tuong-phai')} />
        <Hop viTri={[4, 0.7, 1.5]} kichThuoc={[0.2, 1.1, 1.2]} mau={MAU.tuong} duocChon={chon('tuong-phai')} planes={planes} xuyenTuong={xt('tuong-phai')} />
        <Hop viTri={[4, 2.9, 1.5]} kichThuoc={[0.2, 0.9, 1.2]} mau={MAU.tuong} duocChon={chon('tuong-phai')} planes={planes} xuyenTuong={xt('tuong-phai')} />
      </NhomBoPhan>

      {/* Tường ngăn trong nhà */}
      <NhomBoPhan id="tuong-ngan">
        <Hop viTri={[-1.5, 1.75, 0.5]} kichThuoc={[5, 3.2, 0.15]} mau={MAU.tuongNgan} duocChon={chon('tuong-ngan')} planes={planes} xuyenTuong={xt('tuong-ngan')} />
      </NhomBoPhan>

      {/* Cửa đi chính đặt đúng ô trống tường trước */}
      <NhomBoPhan id="cua-di-chinh">
        <Hop viTri={[-2.4, 1.2, 5]} kichThuoc={[0.98, 2.18, 0.1]} mau={MAU.khungCua} duocChon={chon('cua-di-chinh')} planes={planes} />
        <Hop viTri={[-2.4, 1.2, 5]} kichThuoc={[0.9, 2.1, 0.06]} mau={MAU.cuaGo} duocChon={chon('cua-di-chinh')} planes={planes} />
        <Hop viTri={[-2.05, 1.2, 4.95]} kichThuoc={[0.05, 0.05, 0.08]} mau={MAU.thep} duocChon={chon('cua-di-chinh')} planes={planes} kimLoai={0.7} doNham={0.35} />
      </NhomBoPhan>

      {/* Cửa sổ mặt tiền */}
      <NhomBoPhan id="cua-so-truoc">
        <Hop viTri={[2, 1.95, 5]} kichThuoc={[1.58, 1.48, 0.09]} mau={MAU.khungCua} duocChon={chon('cua-so-truoc')} planes={planes} />
        <Hop viTri={[2, 1.95, 5]} kichThuoc={[1.5, 1.4, 0.06]} mau={MAU.kinh} duocChon={chon('cua-so-truoc')} planes={planes} doNham={0.15} />
        <Hop viTri={[2, 1.95, 5]} kichThuoc={[0.05, 1.4, 0.08]} mau={MAU.khungCua} duocChon={chon('cua-so-truoc')} planes={planes} />
      </NhomBoPhan>

      {/* Cửa sổ bên phải */}
      <NhomBoPhan id="cua-so-ben">
        <Hop viTri={[4, 1.85, 1.5]} kichThuoc={[0.09, 1.28, 1.28]} mau={MAU.khungCua} duocChon={chon('cua-so-ben')} planes={planes} />
        <Hop viTri={[4, 1.85, 1.5]} kichThuoc={[0.06, 1.2, 1.2]} mau={MAU.kinh} duocChon={chon('cua-so-ben')} planes={planes} doNham={0.15} />
      </NhomBoPhan>

      {/* Cầu thang thẳng 10 bậc */}
      <NhomBoPhan id="cau-thang">
        {cacBac.map((b, i) => (
          <Hop
            key={i}
            viTri={[3.2, b.y, b.z]}
            kichThuoc={[1, b.cao, 0.3]}
            mau={MAU.thang}
            duocChon={chon('cau-thang')}
            planes={planes}
          />
        ))}
      </NhomBoPhan>

      {/* Mái nhà chính — hình lăng trụ */}
      <NhomBoPhan id="mai-chinh">
        <mesh geometry={maiChinhGeo} castShadow receiveShadow>
          <meshStandardMaterial
            color={MAU.maiChinh}
            roughness={0.8}
            emissive={chon('mai-chinh') ? '#ff8c1a' : '#000000'}
            emissiveIntensity={chon('mai-chinh') ? 0.45 : 0}
            clippingPlanes={planes}
            clipShadows
          />
          {chon('mai-chinh') && <Edges scale={1.01} color="#ff8c1a" />}
        </mesh>
      </NhomBoPhan>

      {/* Mái tôn phía sau — dốc 10° (xoay X = -0,175 rad) về phía sau */}
      <NhomBoPhan id="mai-ton">
        <Hop viTri={[0, 3.3, -6.9]} kichThuoc={[8, 0.08, 3.4]} mau={MAU.maiTon} duocChon={chon('mai-ton')} planes={planes} xoayX={-0.175} kimLoai={0.55} doNham={0.45} />
      </NhomBoPhan>

      {/* Khung thép mái tôn: 3 cột + 4 kèo + 5 xà gồ, đều là thép hộp mảnh */}
      <NhomBoPhan id="khung-thep-mai-ton">
        {[-3.6, 0, 3.6].map((x) => (
          <Hop key={`cot-${x}`} viTri={[x, 1.35, -8.4]} kichThuoc={[0.08, 2.7, 0.08]} mau={MAU.thep} duocChon={chon('khung-thep-mai-ton')} planes={planes} kimLoai={0.6} doNham={0.4} />
        ))}
        {[-3.6, -1.2, 1.2, 3.6].map((x) => (
          <Hop key={`keo-${x}`} viTri={[x, 3.02, -6.75]} kichThuoc={[0.08, 0.12, 3.35]} mau={MAU.thep} duocChon={chon('khung-thep-mai-ton')} planes={planes} xoayX={-0.175} kimLoai={0.6} doNham={0.4} />
        ))}
        {xaGo.map((g) => (
          <Hop key={`xago-${g.z}`} viTri={[0, g.y, g.z]} kichThuoc={[7.6, 0.06, 0.06]} mau={MAU.thep} duocChon={chon('khung-thep-mai-ton')} planes={planes} kimLoai={0.6} doNham={0.4} />
        ))}
      </NhomBoPhan>

      {/* Tum cầu thang: khối hộp trên mái + mái tum nhỏ */}
      <NhomBoPhan id="tum-cau-thang">
        <Hop viTri={[2.6, 5.6, -2.5]} kichThuoc={[2.2, 2.4, 2.6]} mau={MAU.tuong} duocChon={chon('tum-cau-thang')} planes={planes} xuyenTuong={xt('tum-cau-thang')} />
        <Hop viTri={[2.6, 6.95, -2.5]} kichThuoc={[2.6, 0.1, 3]} mau={MAU.maiTum} duocChon={chon('tum-cau-thang')} planes={planes} xoayX={-0.15} />
        <Hop viTri={[2.6, 5.2, -1.18]} kichThuoc={[0.8, 1.8, 0.06]} mau={MAU.cuaGo} duocChon={chon('tum-cau-thang')} planes={planes} />
      </NhomBoPhan>
    </group>
  )
}
