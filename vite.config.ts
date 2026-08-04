import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    ViteImageOptimizer({
      png: { quality: 80, compressionLevel: 8 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 80 },
      avif: { quality: 70 },
    })
  ],
  build: {
    target: 'esnext',
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') && !id.includes('react-router') && !id.includes('react-hook-form')) return 'vendor-react';
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('zod') || id.includes('react-hook-form')) return 'vendor-forms';
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('zustand')) return 'vendor-zustand';
            if (id.includes('@dnd-kit')) return 'vendor-dnd';
            return 'vendor';
          }
        }
      }
    }
  }
})
