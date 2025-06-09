
import { defineConfig, loadEnv } from 'vite'
import path from 'path';
import { Buffer } from 'buffer/';

export default defineConfig(({ mode })=>{
    // Загружаем все переменные из .env файлов
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      // Прокидываем все переменные как process.env.*
      ...Object.keys(env).reduce((prev, key) => {
        prev[`process.env.${key}`] = JSON.stringify(env[key]);
        return prev;
      }, {}),
    },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets')
    }
  },
  css: {
    postcss: './postcss.config.cjs',
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "sass:math";
          @use "@styles/variables" as *;
          @use "@styles/mixins" as *;
        `,
      },
    },
    devSourcemap: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true
  },
  assetsInclude: ['**/*.otf', '**/*.ttf', '**/*.woff', '**/*.woff2'],
  base: '/',
  publicDir: 'public'
}})

// export default defineConfig({
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, './src'),
//       '@components': path.resolve(__dirname, './src/components'),
//       '@styles': path.resolve(__dirname, './src/styles'),
//       '@assets': path.resolve(__dirname, './src/assets')
//     }
//   },
//   css: {
//     postcss: './postcss.config.cjs',
//     preprocessorOptions: {
//       scss: {
//         additionalData: `
//           @use "sass:math";
//           @use "@styles/variables" as *;
//           @use "@styles/mixins" as *;
//         `,
//       },
//     },
//     devSourcemap: true,
//   },
//   build: {
//     outDir: 'dist',
//     assetsDir: 'assets',
//     emptyOutDir: true,
//     sourcemap: true
//   },
//   assetsInclude: ['**/*.otf', '**/*.ttf', '**/*.woff', '**/*.woff2'],
//   base: '/',
//   publicDir: 'public'
// })

