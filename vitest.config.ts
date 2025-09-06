import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Use jsdom globally to simplify DOM tests
    environment: 'jsdom',
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
