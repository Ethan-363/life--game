import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Fix for Google GenAI SDK potentially using process.env
    'process.env': process.env
  }
});