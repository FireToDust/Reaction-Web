import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Reaction',
      fileName: 'reaction',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['@webgpu/types'],
      output: {
        globals: {
          '@webgpu/types': 'WebGPUTypes'
        }
      }
    },
    target: 'es2022',
    minify: false,
    sourcemap: true
  }
});