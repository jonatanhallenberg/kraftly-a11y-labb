import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const apiProxy = { '/api': 'http://localhost:4000' } // /api → mock-API:t, samma jobb som nginx gör i containern

export default defineConfig({
  plugins: [vue()],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
  test: {
    globals: true, // krävs för att Testing Library ska städa DOM:en mellan tester
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: ['src/**/*.test.js'] // Playwright-filerna i e2e/ ska inte köras av Vitest
  }
})
