import { defineConfig } from 'vitest/config';
import rawPlugin from 'vite-raw-plugin';

export default defineConfig({
  plugins: [
    rawPlugin({
      fileRegex: /\.wgsl$/,
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});