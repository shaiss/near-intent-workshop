import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get the directory name in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Custom plugin to handle directory listing for dynamic content loading
function directoryListingPlugin() {
  return {
    name: "directory-listing",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Only handle GET requests for the content directory
        if (!req.url.startsWith("/src/content") || req.method !== "GET") {
          return next();
        }

        // Extract the path relative to the project root
        const urlPath = req.url.split("?")[0];
        const relativePath = urlPath.replace("/src/", "");
        const absolutePath = path.resolve(__dirname, "src", relativePath);

        try {
          // Check if the path exists
          if (!fs.existsSync(absolutePath)) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "Path not found" }));
            return;
          }

          const stats = fs.statSync(absolutePath);

          // If it's a file, let Vite handle it
          if (stats.isFile()) {
            return next();
          }

          // If it's a directory, return its contents
          if (stats.isDirectory()) {
            const contents = fs.readdirSync(absolutePath);
            const result = {
              path: urlPath,
              files: [],
              folders: []
            };

            // Categorize entries as files or folders
            for (const entry of contents) {
              const entryPath = path.join(absolutePath, entry);
              const entryStats = fs.statSync(entryPath);
              
              if (entryStats.isDirectory()) {
                result.folders.push(entry);
              } else {
                result.files.push(entry);
              }
            }

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
            return;
          }
        } catch (error) {
          console.error("Error processing directory listing:", error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Server error" }));
          return;
        }

        next();
      });
    }
  };
}

// Custom plugin to specifically watch workshop.yaml and force module reloads
function workshopYamlWatcherPlugin() {
  return {
    name: 'workshop-yaml-watcher',
    configureServer(server) {
      // Get the absolute path to workshop.yaml
      const workshopYamlPath = path.resolve(__dirname, 'src/content/workshop.yaml');
      
      // Make sure the file exists before setting up the watcher
      if (!fs.existsSync(workshopYamlPath)) {
        console.warn(`⚠️ Could not find workshop.yaml at ${workshopYamlPath}`);
        return;
      }
      
      console.log(`👀 Setting up watcher for workshop.yaml at ${workshopYamlPath}`);
      
      // Add watcher for workshop.yaml using Vite's watcher API which is more reliable
      server.watcher.add(workshopYamlPath);
      
      // Listen for change events on the workshop.yaml file
      server.watcher.on('change', (changedPath) => {
        if (changedPath === workshopYamlPath) {
          console.log('🔄 workshop.yaml changed, forcing page reload...');
          
          // Force clients to reload
          server.ws.send({
            type: 'full-reload'
          });
          
          // Clear any module cache that might be using the yaml data
          // This ensures getWorkshopMetadata() gets fresh data on next call
          server.moduleGraph.invalidateAll();
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    directoryListingPlugin(),
    workshopYamlWatcherPlugin(),
  ],
  // Add a timestamp to filenames to prevent caching issues
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${new Date().getTime()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${new Date().getTime()}.js`,
        assetFileNames: `assets/[name]-[hash]-${new Date().getTime()}.[ext]`,
        manualChunks: {
          mermaid: ['mermaid']
        }
      },
    },
  },
  server: {
    allowedHosts: [
      "52839a0c-803c-4ec0-ac8a-60ad39c69f64-00-1g2qs1o5dqiy.kirk.replit.dev",
      "host.docker.internal",
      "endless-squirrel-47.rshare.io",
      "*.rshare.io"
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
      interval: 300,
      include: ["src/**/*.md", "src/**/*.js", "src/**/*.jsx", "src/**/*.yaml", "src/**/*.yml"],
    },
    hmr: {
      // Improve hot module replacement
      overlay: true,
      timeout: 5000,
    },
  },
  preview: {
    allowedHosts: [
      "52839a0c-803c-4ec0-ac8a-60ad39c69f64-00-1g2qs1o5dqiy.kirk.replit.dev",
      "host.docker.internal",
      "endless-squirrel-47.rshare.io",
      "*.rshare.io"
    ],
    host: "0.0.0.0",
    port: 5173
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
  assetsInclude: ["**/*.md", "**/*.yaml", "**/*.yml"],
});
