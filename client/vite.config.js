import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  // Enable JSX in .js files
  esbuild: {
    loader: 'jsx',
    include: /src.*\.[tj]sx?$/,
    exclude: [],
  },
  
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  
  plugins: [
    react(),
    svgr({
      // svgr options: https://react-svgr.com/docs/options/
      svgrOptions: {
        exportType: "default",
        ref: true,
        svgo: false,
        titleProp: true
      },
      include: "**/*.svg",
    }),
  ],
  
  // Development server configuration
  server: {
    port: 8080,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/images': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/assets': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Chunking strategy for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux', 'redux', 'redux-thunk'],
          ui: ['bootstrap', 'react-hot-toast', 'rodal'],
        }
      }
    }
  },
  
  // CSS configuration
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true, // Suppress deprecation warnings from dependencies
      }
    }
  },
  
  // Asset handling
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
})
