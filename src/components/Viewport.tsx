import { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Grid, OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useStore, type GocNhin } from '../store/useStore'
import HouseModel from './HouseModel'

const VI_TRI_CAMERA: Record<GocNhin, [number, number, number]> = {
  'mac-dinh': [11, 8, 13],
  'tren-xuong': [0, 20, 0.01],
  'mat-dung': [0, 2.2, 17],
}

/** Di chuyển camera thật khi người dùng bấm nút góc nhìn. */
function CameraRig() {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | undefined
  const gocNhin = useStore((s) => s.gocNhin)
  const lanDatGoc = useStore((s) => s.lanDatGoc)

  useEffect(() => {
    if (lanDatGoc === 0) return
    const [x, y, z] = VI_TRI_CAMERA[gocNhin]
    camera.position.set(x, y, z)
    if (controls) {
      controls.target.set(0, 1.4, 0)
      controls.update()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lanDatGoc])

  return null
}

export default function Viewport() {
  const chon = useStore((s) => s.chon)

  return (
    <Canvas
      shadows
      camera={{ position: VI_TRI_CAMERA['mac-dinh'], fov: 45, near: 0.1, far: 200 }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true
      }}
      onPointerMissed={() => chon(null)}
    >
      <color attach="background" args={['#dfe9ee']} />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[9, 15, 7]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <HouseModel />
      <Grid
        position={[0, -0.4, 0]}
        args={[10, 10]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#9db4bd"
        sectionSize={5}
        sectionThickness={1.1}
        sectionColor="#5b7d8c"
        fadeDistance={45}
        infiniteGrid
      />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} maxPolarAngle={Math.PI / 2.02} minDistance={3} maxDistance={45} />
      <CameraRig />
    </Canvas>
  )
}
