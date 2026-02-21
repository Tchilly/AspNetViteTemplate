import { defineConfig } from 'vite'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  appType: 'custom',
  root: resolve(__dirname, 'resources'),
  publicDir: resolve(__dirname, 'resources/public'),
  base: command === 'serve' ? '/' : '/build/',

  build: {
    outDir: resolve(__dirname, 'wwwroot/build'),
    manifest: 'manifest.json',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'resources/js/app.tsx'),
      },
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (name && /\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(name)) return 'img/[name]-[hash][extname]'
          if (name && /\.css$/i.test(name)) return 'css/[name]-[hash][extname]'
          if (name && /\.(woff2?|eot|ttf|otf)$/i.test(name)) return 'fonts/[name]-[hash][extname]'
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },

  server: {
    strictPort: true,
    port: 5173,
    watch: {
      usePolling: true,
      interval: 120,
    },
    hmr: {
      host: 'localhost',
      port: 5173,
    },
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'resources/js'),
      '~': resolve(__dirname, 'resources'),
    },
  },

  plugins: [react(), tailwindcss()],
}))
