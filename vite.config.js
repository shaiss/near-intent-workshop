import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add a timestamp to filenames to prevent caching issues
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${new Date().getTime()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${new Date().getTime()}.js`,
        assetFileNames: `assets/[name]-[hash]-${new Date().getTime()}.[ext]`,
      },
    },
  },
  server: {
    allowedHosts: [
      "52839a0c-803c-4ec0-ac8a-60ad39c69f64-00-1g2qs1o5dqiy.kirk.replit.dev",
    ],
    host: "0.0.0.0",
    port: 5173,
    fs: {
      // Allow serving files from one level up the project root
      allow: ["..", "./src/content"],
    },
    watch: {
      // Force server to rebuild when content changes
      usePolling: true,
      interval: 500,
      include: ["src/**/*.md", "src/**/*.js", "src/**/*.jsx"],
    },
    hmr: {
      // Improve hot module replacement
      overlay: true,
      timeout: 5000,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx", ".json"],
  },
  optimizeDeps: {
    // Disable dependency optimization caching for development
    force: true,
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  assetsInclude: ["**/*.md"],
});
