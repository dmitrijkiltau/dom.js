import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Keep Node environment so existing tests can manage jsdom when needed
    environment: 'node',
    include: [
      'tests/**/*.test.*',
      'tests/*.test.*',
    ],
    exclude: [
      'tests/types/**',
    ],
    reporters: ['default'],
    watchExclude: [
      'dist/**',
    ],
  },
})
