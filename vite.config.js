import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    watch: { ignored: ['**/evidence/**', '**/.data/**'] },
    fs: { deny: ['**/.data/**', '**/evidence/**', '**/.env*', '**/server.mjs'] },
  },
  build: { target: 'es2022', sourcemap: true },
});
