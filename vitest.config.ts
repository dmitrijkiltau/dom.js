import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TARGET = process.env.TEST_TARGET || process.env.VITEST_TARGET || 'dist'

const plugins: any[] = []
if (TARGET === 'src') {
  // Map ../dist/<name>.js to absolute src/<name>.ts so tests can run without building.
  plugins.push({
    name: 'alias-dist-to-src',
    enforce: 'pre',
    resolveId(source: string) {
      const m = source.match(/^\.\.\/dist\/(.*)\.js$/)
      if (m) {
        return path.resolve(__dirname, 'src', m[1] + '.ts')
      }
      return null
    },
  })
}

export default defineConfig({
  test: {
    // Use jsdom globally to simplify DOM tests
    environment: 'jsdom',
    // alias handled by plugin above when TARGET=src
    include: [
      'tests/**/*.test.*',
      'tests/*.test.*',
    ],
    exclude: [
      ...(TARGET === 'src' ? ['tests/modular-imports.test.mjs'] : []),
      'tests/types/**',
    ],
    reporters: ['default'],
    watchExclude: [
      'dist/**',
    ],
  },
  plugins: plugins,
})
