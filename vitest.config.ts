import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

const testMode = process.env.VITEST_MODE ?? 'all'
const isIntegration = testMode === 'integration'
const isUnit = testMode === 'unit'

const integrationPatterns = ['src/**/__tests__/integration/**/*.test.ts?(x)']
const unitPatterns = ['src/**/*.{test,spec}.{ts,tsx}']

const includePatterns = isIntegration
  ? integrationPatterns
  : isUnit
    ? unitPatterns
    : [...unitPatterns, ...integrationPatterns]

const excludePatterns = [
  'node_modules',
  '.next',
  'dist',
  'build'
]

if (isUnit) {
  excludePatterns.push('src/**/__tests__/integration/**')
}

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: includePatterns,
    exclude: excludePatterns,
    testTimeout: isIntegration ? 20000 : 8000,
    hookTimeout: isIntegration ? 10000 : 4000,
    threads: isIntegration || testMode === 'all' ? false : undefined,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        '.next/',
        'coverage/',
        '**/*.test.*',
        '**/*.spec.*'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/contexts': path.resolve(__dirname, './src/contexts')
    }
  }
})
