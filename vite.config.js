import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      '~': resolve(__dirname),
      // eslint-disable-next-line no-undef
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 8000,
    host: 'local.ucloudadmin.com'
  }
});
