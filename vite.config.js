import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' 讓 build 後的相對路徑能直接在任何子目錄 / 靜態主機運作
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true, // 讓同網段的手機也能連進 dev server 測試
    port: 5173,
  },
})
