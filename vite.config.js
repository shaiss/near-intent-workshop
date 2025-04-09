import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true
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
  server: {
    fs: {
      // Allow serving files from one level up the project root
      allow: ['..']
    },
    watch: {
      // Force server to rebuild when content changes
      usePolling: true,
      interval: 1000
    }
  }
}) 