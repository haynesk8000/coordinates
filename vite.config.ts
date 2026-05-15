import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
  },
});