import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Repassa /api pro backend local — assim o navegador (inclusive de outro dispositivo na
    // rede) só precisa falar com a porta do Vite, que já está liberada no firewall.
    proxy: {
      '/api': { target: 'http://localhost:5192', changeOrigin: true },
    },
  },
})
