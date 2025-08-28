import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
// Avoid Node-specific imports to keep TS lint happy in config

// https://vite.dev/config/
// Using relative entry; no need for __dirname

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: 'src/lib/index.ts',
      name: 'WiseTable',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    outDir: 'dist',
    sourcemap: true,
    cssCodeSplit: true,
    rollupOptions: {
      // Do not bundle peer deps; they must be provided by the consumer app
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@tanstack/react-query',
        'react-hook-form',
        'zod',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          '@tanstack/react-query': 'ReactQuery',
          'react-hook-form': 'ReactHookForm',
          zod: 'Zod',
        },
      },
    },
    emptyOutDir: true,
  },
})
