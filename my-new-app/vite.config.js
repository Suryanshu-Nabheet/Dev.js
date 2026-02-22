
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: 'devjs',
    }),
  ],
  resolve: {
    alias: {
      'react': 'devjs',
      'react-dom': 'devjs-dom'
    }
  }
})
