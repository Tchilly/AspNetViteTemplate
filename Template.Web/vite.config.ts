import { defineConfig, type UserConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ command }) => {
  const isProduction = command === 'build'

  const config: UserConfig = {
    appType: 'custom',

    // Set the root directory for Vite to your 'resources' folder
    root: resolve(__dirname, 'resources'),

    // Define where Vite should look for public assets (e.g., images, fonts)
    // These will be copied to the build output directory as-is.
    // If you don't have a public directory inside 'resources', you can omit this or adjust.
    publicDir: resolve(__dirname, 'resources/public'),

    build: {
      // Output directory relative to the 'root' option.
      // This will place assets in 'wwwroot/build'
      outDir: resolve(__dirname, 'wwwroot/build'),

      // Generate a manifest file for server-side integration (e.g., with .NET)
      manifest: "manifest.json",

      // Empty the output directory before building
      emptyOutDir: true,

      rollupOptions: {
        // Define your entry points. Adjust these paths as necessary.
        // For example, if your main TypeScript file is 'resources/js/main.ts'
        // and your main CSS file is 'resources/css/app.css'
        input: {
          main: resolve(__dirname, 'resources/js/app.ts'),
          // You can add more entry points if needed, e.g., for CSS:
          // styles: resolve(__dirname, 'resources/css/app.css'),
        },
        output: {
          // Configure how assets are named
          // This helps with cache busting and organization
          entryFileNames: isProduction ? 'js/[name]-[hash].js' : 'js/[name].js',
          chunkFileNames: isProduction ? 'js/[name]-[hash].js' : 'js/[name].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name) {
              const extType = assetInfo.name.split('.').pop();
              if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
                return isProduction ? 'img/[name]-[hash][extname]' : 'img/[name][extname]';
              }
              if (/css/i.test(extType || '')) {
                return isProduction ? 'css/[name]-[hash][extname]' : 'css/[name][extname]';
              }
              if (/woff2?|eot|ttf|otf/i.test(extType || '')) {
                return isProduction ? 'fonts/[name]-[hash][extname]' : 'fonts/[name][extname]';
              }
            }
            return isProduction ? 'assets/[name]-[hash][extname]' : 'assets/[name][extname]';
          },
        }
      },
    },

    // Configure the base path for assets during development and production
    // This should match the path where your assets will be served from.
    // If your assets are served from 'wwwroot/build', then the base is '/build/'
    base: command === 'serve' ? '/' : '/build/',

    server: {
      // Configure the development server if needed
      // For .NET integration, you might be running Kestrel and proxying to Vite,
      // or using Vite's dev server directly.
      // If proxying from .NET, ensure HMR (Hot Module Replacement) works.
      // Example for HMR with ASP.NET Core:
      // origin: 'https://localhost:7123', // Your .NET app's URL
      // hmr: {
      //   protocol: 'ws', // or 'wss' if using https
      //   host: 'localhost',
      //   port: 5173, // Vite's default HMR port
      // },
      strictPort: true, // Ensures Vite uses the specified port
      port: 5173, // Default Vite dev server port
    },

    resolve: {
      alias: {
        // Example alias, adjust as needed
        '@': resolve(__dirname, 'resources/js'),
        '~': resolve(__dirname, 'resources'),
      },
    },

    // Add plugins if you are using them (e.g., for Vue, React, Tailwind CSS)
    // plugins: [
    //   // Example: tailwindcss(),
    // ],
  }

  return config;
})
