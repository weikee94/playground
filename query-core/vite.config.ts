import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'demo',
  build: {
    outDir: '../demo-dist',
  },
  resolve: {
    alias: {
      '@weikee/query-core': path.resolve(__dirname, 'src/index.ts'),
    },
  },
});
