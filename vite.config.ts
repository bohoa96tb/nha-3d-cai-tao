/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// GitHub Pages: site được phục vụ tại https://bohoa96tb.github.io/nha-3d-cai-tao/
export default defineConfig({
  base: '/nha-3d-cai-tao/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
