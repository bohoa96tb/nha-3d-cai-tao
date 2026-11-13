import { get, set } from 'idb-keyval'
import type { DuAnDaLuu } from '../types'

const KHOA_DU_AN = 'nha-3d-du-an-hien-tai'

/** Lưu dự án vào IndexedDB (không dùng localStorage cho dữ liệu mô hình). */
export async function luuDuAn(duAn: DuAnDaLuu): Promise<void> {
  await set(KHOA_DU_AN, duAn)
}

/** Tải dự án đã lưu; trả undefined nếu chưa từng lưu hoặc dữ liệu không hợp lệ. */
export async function taiDuAn(): Promise<DuAnDaLuu | undefined> {
  try {
    const v = await get<DuAnDaLuu>(KHOA_DU_AN)
    if (!v || typeof v !== 'object') return undefined
    if (typeof v.tenDuAn !== 'string' || typeof v.anHien !== 'object' || typeof v.lopBat !== 'object') {
      return undefined
    }
    return v
  } catch {
    return undefined
  }
}
