import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // This should match Vercel's expected output directory
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
});