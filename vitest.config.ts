import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'dist-electron/',
        'src/test/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        'electron/',
        'vitest.config.ts',
      ],
      // 覆盖率目标
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    // 包含的测试文件模式
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    // 排除的测试文件模式
    exclude: ['node_modules', 'dist', 'dist-electron', 'electron'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
