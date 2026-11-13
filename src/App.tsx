import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from './store/useStore'
import { luuDuAn, taiDuAn } from './lib/storage'
import type { DuAnDaLuu } from './types'
import Toolbar from './components/Toolbar'
import ThanhDieuKhien from './components/ThanhDieuKhien'
import Viewport from './components/Viewport'
import PropertyPanel from './components/PropertyPanel'
import PartsList from './components/PartsList'

function gioHienTai(): string {
  return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function App() {
  const tenDuAn = useStore((s) => s.tenDuAn)
  const anHien = useStore((s) => s.anHien)
  const lopBat = useStore((s) => s.lopBat)
  const dangChon = useStore((s) => s.dangChon)
  const daTaiXong = useStore((s) => s.daTaiXong)
  const napDuAn = useStore((s) => s.napDuAn)

  const [trangThaiLuu, setTrangThaiLuu] = useState('Chưa lưu thay đổi nào')
  const boQuaTuLuuDau = useRef(true)

  // Tải lại dự án đã lưu trong IndexedDB khi mở ứng dụng.
  useEffect(() => {
    let conSong = true
    taiDuAn().then((duAn) => {
      if (!conSong) return
      if (duAn) {
        napDuAn(duAn)
        setTrangThaiLuu(`Đã tải dự án đã lưu lúc ${new Date(duAn.luuLuc).toLocaleString('vi-VN')}`)
      } else {
        useStore.setState({ daTaiXong: true })
      }
    })
    return () => {
      conSong = false
    }
  }, [napDuAn])

  const taoBanLuu = useCallback((): DuAnDaLuu => {
    const s = useStore.getState()
    return {
      tenDuAn: s.tenDuAn,
      anHien: { ...s.anHien },
      lopBat: { ...s.lopBat },
      dangChon: s.dangChon,
      luuLuc: new Date().toISOString(),
    }
  }, [])

  // Tự động lưu sau mỗi thay đổi (trì hoãn 500 ms), chỉ sau khi đã tải xong dữ liệu cũ.
  useEffect(() => {
    if (!daTaiXong) return
    if (boQuaTuLuuDau.current) {
      boQuaTuLuuDau.current = false
      return
    }
    setTrangThaiLuu('Đang chờ tự động lưu…')
    const hen = setTimeout(() => {
      luuDuAn(taoBanLuu())
        .then(() => setTrangThaiLuu(`Đã tự động lưu lúc ${gioHienTai()}`))
        .catch(() => setTrangThaiLuu('Không lưu được — vui lòng thử nút Lưu dự án'))
    }, 500)
    return () => clearTimeout(hen)
  }, [tenDuAn, anHien, lopBat, dangChon, daTaiXong, taoBanLuu])

  const luuNgay = useCallback(() => {
    luuDuAn(taoBanLuu())
      .then(() => setTrangThaiLuu(`Đã lưu lúc ${gioHienTai()}`))
      .catch(() => setTrangThaiLuu('Không lưu được — vui lòng thử lại'))
  }, [taoBanLuu])

  return (
    <div className="ung-dung">
      <Toolbar onLuu={luuNgay} trangThaiLuu={trangThaiLuu} />
      <ThanhDieuKhien />
      <main className="noi-dung">
        <section className="khung-3d" aria-label="Khung mô hình 3D">
          <Viewport />
        </section>
        <aside className="bang-ben">
          <PropertyPanel />
          <PartsList />
        </aside>
      </main>
      <footer className="chan-trang">
        <p>
          NHÀ 3D – CẢI TẠO NHÀ · Phiên bản V1: khung nhà 3D và điều khiển. Đơn vị đo: mét (m). Ứng dụng không tự động
          phá bỏ hay thay đổi kết cấu chịu lực.
        </p>
      </footer>
    </div>
  )
}
