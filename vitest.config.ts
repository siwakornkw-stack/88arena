import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  css: { postcss: { plugins: [] } },
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/unit/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules', '.next', 'tests/e2e/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
