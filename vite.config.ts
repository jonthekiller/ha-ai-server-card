import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  define: {
    '__CARD_VERSION__': JSON.stringify(new Date().toISOString().replace('T', '-').split('.')[0]),
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/llm-server-card.ts'),
      formats: ['es'],
      fileName: (format) => `ha-ai-server-card.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: '[name].js',
      },
    },
    minify: 'terser',
    sourcemap: false,
    target: 'es2021',
  },
  server: {
    strictPort: true,
    port: 3000,
  },
});