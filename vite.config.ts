
import { defineConfig } from 'vite'
import path from 'path';
import { Buffer } from 'buffer/';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@styles': path.resolve(__dirname, './src/styles')
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
  }
})

