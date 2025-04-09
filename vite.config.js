import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['52839a0c-803c-4ec0-ac8a-60ad39c69f64-00-1g2qs1o5dqiy.kirk.replit.dev'],
    fs: {
      // Allow serving files from one level up the project root
      allow: ['..']
    },
    watch: {
      // Force server to rebuild when content changes
      usePolling: true,
      interval: 1000
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  assetsInclude: ['**/*.md'],
})