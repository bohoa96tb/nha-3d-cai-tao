import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { Edges, TransformControls } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import type { BoPhanNha } from '../types'
import { NHA_MAU, RONG_O_CUA, CAO_O_CUA, SAU_BAC } from '../data/house'
import { useStore, dangHienThi, GOC_GOC_TUONG } from '../store/useStore'

type Vec3 = [number, number, number]

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
  ducBo: '#d43a2a',
}

/** Cao độ mặt cắt ngang của chế độ "Mặt cắt": 1,6 m trên mặt sàn (sàn ở y = 0,15). */
export const CAO_DO_MAT_CAT = 1.75

interface HopProps {
  viTri: Vec3
  kichThuoc: Vec3
  mau: string
  duocChon: boolean
  planes: THREE.Plane[] | undefined
  xuyenTuong?: boolean
  ducBo?: boolean
  xoayX?: number
  xoayZ?: number
  kimLoai?: number
  doNham?: number
}

/**
 * Một khối hộp trong mô hình (tọa độ cục bộ theo bộ phận cha).
 * Khi được chọn: phát sáng emissive + viền cam.
 * Khi tường bị đánh dấu dự kiến đục bỏ: đỏ bán trong suốt + viền đỏ (chỉ đánh dấu).
 */
function Hop({
  viTri,
  kichThuoc,
  mau,
  duocChon,
  planes,
  xuyenTuong,
  ducBo,
  xoayX = 0,
  xoayZ = 0,
  kimLoai = 0,
  doNham = 0.85,
}: HopProps) {
  const mo = ducBo ? 0.55 : xuyenTuong ? 0.25 : 1
  return (
    <mesh position={viTri} rotation={[xoayX, 0, xoayZ]} castShadow receiveShadow>
      <boxGeometry args={kichThuoc} />
      <meshStandardMaterial
        color={ducBo ? MAU.ducBo : mau}
        metalness={kimLoai}
        roughness={doNham}
        emissive={duocChon ? '#ff8c1a' : '#000000'}
        emissiveIntensity={duocChon ? 0.45 : 0}
        transparent={!!xuyenTuong || !!ducBo}
        opacity={mo}
        clippingPlanes={planes}
        clipShadows
      />
      {duocChon && <Edges scale={1.03} color="#ff8c1a" />}
      {!duocChon && ducBo && <Edges scale={1.02} color={MAU.ducBo} />}
    </mesh>
  )
}

/* ---------- Tường: dựng từ các đoạn hộp quanh ô trống ---------- */

interface OTrong {
  /** Tâm ô trống tính từ tâm tường, theo trục dọc tường (m). */
  u: number
  rong: number
  /** Chiều cao bệ dưới ô (0 với cửa đi). */
  be: number
  /** Chiều cao ô trống. */
  caoO: number
}

/** Ô trống có sẵn trong nhà mẫu (tọa độ cục bộ của tường, sàn ở y = −cao/2). */
const O_SAN: Record<string, OTrong[]> = {
  'tuong-truoc': [
    { u: -2.4, rong: 0.9, be: 0, caoO: 2.1 },
    { u: 2, rong: 1.5, be: 0.9, caoO: 1.4 },
  ],
  'tuong-phai': [{ u: 1.5, rong: 1.2, be: 1.1, caoO: 1.2 }],
}

interface DoanHop {
  c: Vec3
  s: Vec3
}

/**
 * Dựng tường thành các đoạn hộp: dải đặc giữa các ô trống + bệ dưới ô + đà trên ô.
 * Đổi chiều cao/độ dày/dài của tường → gọi lại hàm này là hình học thay đổi thật.
 */
function cacDoanTuong(p: BoPhanNha): DoanHop[] {
  const L = p.kichThuoc.dai
  const H = p.kichThuoc.cao
  const T = p.kichThuoc.rong
  const cac0: OTrong[] = [...(O_SAN[p.id] ?? [])]
  if (p.loCuaMoi) {
    cac0.push({
      u: -L / 2 + p.loCuaMoi.viTri + RONG_O_CUA / 2,
      rong: RONG_O_CUA,
      be: 0,
      caoO: CAO_O_CUA,
    })
  }
  cac0.sort((a, b) => a.u - b.u)

  const doan: DoanHop[] = []
  const yDay = -H / 2
  const dayDai = (tu: number, den: number) => {
    if (den - tu <= 0.001) return
    doan.push({ c: [(tu + den) / 2, 0, 0], s: [den - tu, H, T] })
  }
  let conTro = -L / 2
  for (const o of cac0) {
    const trai = o.u - o.rong / 2
    const phai = o.u + o.rong / 2
    dayDai(conTro, trai)
    if (o.be > 0.001) {
      doan.push({ c: [o.u, yDay + o.be / 2, 0], s: [o.rong, o.be, T] })
    }
    const dinhO = yDay + o.be + o.caoO
    if (H / 2 - dinhO > 0.001) {
      doan.push({ c: [o.u, (dinhO + H / 2) / 2, 0], s: [o.rong, H / 2 - dinhO, T] })
    }
    conTro = phai
  }
  dayDai(conTro, L / 2)
  return doan
}

/* ---------- Cầu thang: dựng bậc theo số bậc + chiều rộng ---------- */

function cacBacThang(p: BoPhanNha): DoanHop[] {
  const soBac = Math.round(p.soBac ?? 10)
  const bacCao = p.kichThuoc.cao / soBac
  const doan: DoanHop[] = []
  for (let i = 0; i < soBac; i++) {
    const h = (i + 1) * bacCao
    doan.push({
      c: [0, -p.kichThuoc.cao / 2 + h / 2, 1.3 - i * SAU_BAC],
      s: [p.kichThuoc.dai, h, SAU_BAC],
    })
  }
  return doan
}

/* ---------- Nhóm của một bộ phận ---------- */

interface NhomProps {
  phan: BoPhanNha
  refCb: (id: string, node: THREE.Group | null) => void
  children: ReactNode
}

/**
 * Nhóm của một bộ phận: vị trí + góc xoay lấy từ store (V2), chạm/click để chọn.
 * Một số bộ phận trong nhà mẫu vốn nằm dọc trục Z (tường hai bên, cửa sổ bên)
 * có góc gốc −90° cộng thêm vào góc xoay người dùng đặt.
 */
function NhomBoPhan({ phan, refCb, children }: NhomProps) {
  const anHien = useStore((s) => s.anHien)
  const lopBat = useStore((s) => s.lopBat)
  const chon = useStore((s) => s.chon)
  const hien = dangHienThi(anHien, lopBat, phan.id, phan.lop)
  const goc = ((GOC_GOC_TUONG.get(phan.id) ?? 0) + (phan.xoayY ?? 0)) * (Math.PI / 180)
  return (
    <group
      ref={(node: THREE.Group | null) => refCb(phan.id, node)}
      position={phan.viTri}
      rotation={[0, goc, 0]}
      visible={hien}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        chon(phan.id)
      }}
    >
      {children}
    </group>
  )
}

export default function HouseModel() {
  const boPhan = useStore((s) => s.boPhan)
  const dangChon = useStore((s) => s.dangChon)
  const cheDoMatCat = useStore((s) => s.cheDoMatCat)
  const cheDoXuyenTuong = useStore((s) => s.cheDoXuyenTuong)
  const cheDoGizmo = useStore((s) => s.cheDoGizmo)
  const capNhatBoPhan = useStore((s) => s.capNhatBoPhan)
  const anHien = useStore((s) => s.anHien)
  const lopBat = useStore((s) => s.lopBat)

  const planes = useMemo<THREE.Plane[] | undefined>(() => {
    if (!cheDoMatCat) return undefined
    return [new THREE.Plane(new THREE.Vector3(0, -1, 0), CAO_DO_MAT_CAT)]
  }, [cheDoMatCat])

  // Mái chính: hình lăng trụ đùn từ kích thước hiện tại (dài × cao, sâu = rộng).
  const maiChinh = boPhan.find((p) => p.id === 'mai-chinh')
  const maiChinhGeo = useMemo(() => {
    const kt = maiChinh?.kichThuoc ?? { dai: 8.8, rong: 10.8, cao: 2.2 }
    const shape = new THREE.Shape()
    shape.moveTo(-kt.dai / 2, -kt.cao / 2)
    shape.lineTo(kt.dai / 2, -kt.cao / 2)
    shape.lineTo(0, kt.cao / 2)
    shape.closePath()
    const geo = new THREE.ExtrudeGeometry(shape, { depth: kt.rong, bevelEnabled: false })
    geo.translate(0, 0, -kt.rong / 2)
    return geo
  }, [maiChinh?.kichThuoc.dai, maiChinh?.kichThuoc.rong, maiChinh?.kichThuoc.cao])

  /* Gizmo kéo trực tiếp (V2) */
  const cacRef = useRef(new Map<string, THREE.Group | null>())
  const [doiTuongChon, setDoiTuongChon] = useState<THREE.Object3D | null>(null)
  useEffect(() => {
    setDoiTuongChon(dangChon ? (cacRef.current.get(dangChon) ?? null) : null)
  }, [dangChon, boPhan])

  const phanChon = boPhan.find((p) => p.id === dangChon)
  const gizmoHien =
    cheDoGizmo !== 'tat' &&
    !!phanChon &&
    !!doiTuongChon &&
    dangHienThi(anHien, lopBat, phanChon.id, phanChon.lop)

  /** Kéo xong mới ghi vào store qua MỘT lần capNhatBoPhan (một mục lịch sử). */
  const xuLyKeoXong = () => {
    if (!phanChon || !doiTuongChon) return
    const id = phanChon.id
    if (cheDoGizmo === 'di-chuyen') {
      // Khóa trục Y: giữ nguyên cao độ gốc của bộ phận.
      capNhatBoPhan(id, {
        viTri: [doiTuongChon.position.x, phanChon.viTri[1], doiTuongChon.position.z],
      })
    } else if (cheDoGizmo === 'xoay') {
      const doGoc =
        THREE.MathUtils.radToDeg(doiTuongChon.rotation.y) - (GOC_GOC_TUONG.get(id) ?? 0)
      capNhatBoPhan(id, { xoayY: doGoc })
    } else if (cheDoGizmo === 'kich-thuoc') {
      const f = doiTuongChon.scale
      capNhatBoPhan(id, {
        kichThuoc: {
          dai: phanChon.kichThuoc.dai * f.x,
          cao: phanChon.kichThuoc.cao * f.y,
          rong: phanChon.kichThuoc.rong * f.z,
        },
      })
      // Hình học render theo kích thước trong store (scale = 1), không theo scale của three.
      doiTuongChon.scale.set(1, 1, 1)
    }
  }

  const chon = (id: string) => dangChon === id
  const hopChung = (p: BoPhanNha) => ({
    duocChon: chon(p.id),
    planes,
    xuyenTuong: cheDoXuyenTuong && p.loai === 'tuong',
    ducBo: p.loai === 'tuong' && !!p.ducBo,
  })

  const veBoPhan = (p: BoPhanNha): ReactNode => {
    const kt = p.kichThuoc
    switch (p.loai) {
      case 'nen-mong':
        return <Hop viTri={[0, 0, 0]} kichThuoc={[kt.dai, kt.cao, kt.rong]} mau={MAU.nen} {...hopChung(p)} />
      case 'san':
        return <Hop viTri={[0, 0, 0]} kichThuoc={[kt.dai, kt.cao, kt.rong]} mau={MAU.san} {...hopChung(p)} />
      case 'tuong':
        return cacDoanTuong(p).map((d, i) => (
          <Hop
            key={i}
            viTri={d.c}
            kichThuoc={d.s}
            mau={p.id === 'tuong-ngan' ? MAU.tuongNgan : MAU.tuong}
            {...hopChung(p)}
          />
        ))
      case 'cua-di':
        return (
          <>
            <Hop viTri={[0, 0, 0]} kichThuoc={[kt.dai + 0.08, kt.cao + 0.08, kt.rong + 0.04]} mau={MAU.khungCua} {...hopChung(p)} />
            <Hop viTri={[0, 0, 0]} kichThuoc={[kt.dai, kt.cao, kt.rong]} mau={MAU.cuaGo} {...hopChung(p)} />
            <Hop viTri={[kt.dai / 2 - 0.1, 0, -(kt.rong / 2 + 0.03)]} kichThuoc={[0.05, 0.05, 0.08]} mau={MAU.thep} {...hopChung(p)} kimLoai={0.7} doNham={0.35} />
          </>
        )
      case 'cua-so':
        return (
          <>
            <Hop viTri={[0, 0, 0]} kichThuoc={[kt.dai + 0.08, kt.cao + 0.08, 0.09]} mau={MAU.khungCua} {...hopChung(p)} />
            <Hop viTri={[0, 0, 0]} kichThuoc={[kt.dai, kt.cao, 0.06]} mau={MAU.kinh} {...hopChung(p)} doNham={0.15} />
            {kt.dai >= 1.4 && (
              <Hop viTri={[0, 0, 0]} kichThuoc={[0.05, kt.cao, 0.08]} mau={MAU.khungCua} {...hopChung(p)} />
            )}
          </>
        )
      case 'cau-thang':
        return cacBacThang(p).map((d, i) => (
          <Hop key={i} viTri={d.c} kichThuoc={d.s} mau={MAU.thang} {...hopChung(p)} />
        ))
      case 'mai':
        if (p.id === 'mai-chinh') {
          return (
            <mesh geometry={maiChinhGeo} castShadow receiveShadow>
              <meshStandardMaterial
                color={MAU.maiChinh}
                roughness={0.8}
                emissive={chon(p.id) ? '#ff8c1a' : '#000000'}
                emissiveIntensity={chon(p.id) ? 0.45 : 0}
                clippingPlanes={planes}
                clipShadows
              />
              {chon(p.id) && <Edges scale={1.01} color="#ff8c1a" />}
            </mesh>
          )
        }
        // Mái tôn: một tấm dốc 10° về phía sau.
        return (
          <Hop viTri={[0, 0, 0]} kichThuoc={[kt.dai, kt.cao, kt.rong]} mau={MAU.maiTon} {...hopChung(p)} xoayX={-0.175} kimLoai={0.55} doNham={0.45} />
        )
      case 'khung-thep': {
        // Hình học cục bộ theo bản V1; đổi kích thước → co giãn theo tỉ lệ so với nhà mẫu.
        const goc = NHA_MAU.find((x) => x.id === p.id)?.kichThuoc ?? kt
        const tyLe: Vec3 = [kt.dai / goc.dai, kt.cao / goc.cao, kt.rong / goc.rong]
        const xaGoZ = [1.2, 0.6, 0, -0.6, -1.2]
        return (
          <group scale={tyLe}>
            {[-3.6, 0, 3.6].map((x) => (
              <Hop key={`cot-${x}`} viTri={[x, -0.25, -1.5]} kichThuoc={[0.08, 2.7, 0.08]} mau={MAU.thep} {...hopChung(p)} kimLoai={0.6} doNham={0.4} />
            ))}
            {[-3.6, -1.2, 1.2, 3.6].map((x) => (
              <Hop key={`keo-${x}`} viTri={[x, 1.42, 0.15]} kichThuoc={[0.08, 0.12, 3.35]} mau={MAU.thep} {...hopChung(p)} xoayX={-0.175} kimLoai={0.6} doNham={0.4} />
            ))}
            {xaGoZ.map((z) => (
              <Hop
                key={`xago-${z}`}
                viTri={[0, 1.6 - z * Math.tan(0.175), z]}
                kichThuoc={[7.6, 0.06, 0.06]}
                mau={MAU.thep}
                {...hopChung(p)}
                kimLoai={0.6}
                doNham={0.4}
              />
            ))}
          </group>
        )
      }
      case 'tum': {
        const goc = NHA_MAU.find((x) => x.id === p.id)?.kichThuoc ?? kt
        const tyLe: Vec3 = [kt.dai / goc.dai, kt.cao / goc.cao, kt.rong / goc.rong]
        return (
          <group scale={tyLe}>
            <Hop viTri={[0, 0, 0]} kichThuoc={[2.2, 2.4, 2.6]} mau={MAU.tuong} duocChon={chon(p.id)} planes={planes} />
            <Hop viTri={[0, 1.35, 0]} kichThuoc={[2.6, 0.1, 3]} mau={MAU.maiTum} duocChon={chon(p.id)} planes={planes} xoayX={-0.15} />
            <Hop viTri={[0, -0.4, 1.32]} kichThuoc={[0.8, 1.8, 0.06]} mau={MAU.cuaGo} duocChon={chon(p.id)} planes={planes} />
          </group>
        )
      }
      default:
        return null
    }
  }

  return (
    <group>
      {boPhan.map((p) => (
        <NhomBoPhan
          key={p.id}
          phan={p}
          refCb={(id, node) => {
            cacRef.current.set(id, node)
          }}
        >
          {veBoPhan(p)}
        </NhomBoPhan>
      ))}
      {gizmoHien && doiTuongChon && phanChon && (
        <TransformControls
          object={doiTuongChon}
          mode={
            cheDoGizmo === 'di-chuyen'
              ? 'translate'
              : cheDoGizmo === 'xoay'
                ? 'rotate'
                : 'scale'
          }
          showY={cheDoGizmo !== 'di-chuyen'}
          showX={cheDoGizmo !== 'xoay'}
          showZ={cheDoGizmo !== 'xoay'}
          translationSnap={0.1}
          rotationSnap={Math.PI / 12}
          size={0.85}
          onMouseUp={xuLyKeoXong}
        />
      )}
    </group>
  )
}
