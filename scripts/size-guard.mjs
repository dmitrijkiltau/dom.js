#!/usr/bin/env node
// Size guard + docs sync for @dk/dom-js
// Usage:
//   node scripts/size-guard.mjs --check           # fail if ceilings exceeded
//   node scripts/size-guard.mjs --check-docs      # fail if docs not in sync
//   node scripts/size-guard.mjs --write-docs      # update README/ARCHITECTURE tables

import fs from 'node:fs'
import path from 'node:path'

const distDir = path.resolve('dist')
const limitsPath = path.resolve('scripts/size-limits.json')

function getKB(filepath) {
  try {
    const st = fs.statSync(filepath)
    return +(st.size / 1024).toFixed(2)
  } catch {
    return 0
  }
}

function readLimits() {
  const raw = fs.readFileSync(limitsPath, 'utf8')
  return JSON.parse(raw)
}

function collectSizes() {
  const files = fs.readdirSync(distDir).filter(f => (f.endsWith('.js') || f.endsWith('.cjs')) && !f.includes('.map'))
  // ESM
  const esmTargets = ['index.js','core.js','http.js','template.js','forms.js','motion.js']
  const cjsTargets = ['index.cjs','core.cjs','http.cjs','template.cjs','forms.cjs','motion.cjs']
  const esm = Object.fromEntries(esmTargets.map(f => [f, getKB(path.join(distDir, f))]))
  const cjs = Object.fromEntries(cjsTargets.map(f => [f, getKB(path.join(distDir, f))]))
  return { esm, cjs }
}

function formatTable({ esm, cjs }) {
  const rows = [
    ['Module','ESM (KB)','CJS (KB)'],
    ['Full', esm['index.js'].toFixed(2), cjs['index.cjs'].toFixed(2)],
    ['Core', esm['core.js'].toFixed(2), cjs['core.cjs'].toFixed(2)],
    ['HTTP', esm['http.js'].toFixed(2), cjs['http.cjs'].toFixed(2)],
    ['Templates', esm['template.js'].toFixed(2), cjs['template.cjs'].toFixed(2)],
    ['Forms', esm['forms.js'].toFixed(2), cjs['forms.cjs'].toFixed(2)],
    ['Motion', esm['motion.js'].toFixed(2), cjs['motion.cjs'].toFixed(2)],
  ]
  const md = []
  md.push('| ' + rows[0].join(' | ') + ' |')
  md.push('| ' + rows[0].map(()=>'---').join(' | ') + ' |')
  for (let i=1;i<rows.length;i++) md.push('| ' + rows[i].join(' | ') + ' |')
  md.push('')
  md.push('_Note: raw minified dist file sizes (not gzip)._')
  return md.join('\n')
}

function replaceBlock(file, startMarker, endMarker, content) {
  const txt = fs.readFileSync(file, 'utf8')
  const start = txt.indexOf(startMarker)
  const end = txt.indexOf(endMarker)
  if (start === -1 || end === -1 || end <= start) {
    // Append block at end
    const add = `\n\n${startMarker}\n${content}\n${endMarker}\n`
    fs.writeFileSync(file, txt + add)
    return true
  }
  const before = txt.slice(0, start + startMarker.length)
  const after = txt.slice(end)
  const next = `${before}\n${content}${after}`
  fs.writeFileSync(file, next)
  return true
}

function blockMatches(file, startMarker, endMarker, content) {
  const txt = fs.readFileSync(file, 'utf8')
  const start = txt.indexOf(startMarker)
  const end = txt.indexOf(endMarker)
  if (start === -1 || end === -1 || end <= start) return false
  const between = txt.slice(start + startMarker.length, end).replace(/^\n|\n$/g,'')
  return between.trim() === content.trim()
}

function fail(msg) {
  console.error(`\n❌ ${msg}`)
  process.exit(1)
}

// Modes
const args = process.argv.slice(2)
const DO_CHECK = args.includes('--check')
const DO_WRITE_DOCS = args.includes('--write-docs')
const DO_CHECK_DOCS = args.includes('--check-docs')

const sizes = collectSizes()

if (DO_CHECK) {
  const limits = readLimits()
  const problems = []
  for (const [file, maxKB] of Object.entries(limits.esm)) {
    const v = sizes.esm[file] ?? 0
    if (v > maxKB) problems.push(`ESM ${file} = ${v.toFixed(2)}KB > ${maxKB}KB`)
  }
  for (const [file, maxKB] of Object.entries(limits.cjs)) {
    const v = sizes.cjs[file] ?? 0
    if (v > maxKB) problems.push(`CJS ${file} = ${v.toFixed(2)}KB > ${maxKB}KB`)
  }
  if (problems.length) fail('Bundle size ceilings exceeded:\n - ' + problems.join('\n - '))
  console.log('✅ Bundle sizes within ceilings')
}

const table = formatTable(sizes)

const README = path.resolve('README.md')
const ARCH = path.resolve('ARCHITECTURE.md')
const R_START = '<!-- AUTO-GENERATED: BUNDLE_SIZES_START -->'
const R_END = '<!-- AUTO-GENERATED: BUNDLE_SIZES_END -->'

if (DO_WRITE_DOCS) {
  replaceBlock(README, R_START, R_END, table)
  replaceBlock(ARCH, R_START, R_END, table)
  console.log('✅ Updated README.md and ARCHITECTURE.md bundle size tables')
}

if (DO_CHECK_DOCS) {
  const ok1 = blockMatches(README, R_START, R_END, table)
  const ok2 = blockMatches(ARCH, R_START, R_END, table)
  if (!ok1 || !ok2) fail('Bundle size tables out of date. Run: npm run size:docs:write')
  console.log('✅ Docs bundle size tables are in sync')
}

if (!DO_CHECK && !DO_WRITE_DOCS && !DO_CHECK_DOCS) {
  // Default behavior: print markdown table to stdout
  console.log(table)
}

