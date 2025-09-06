#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('📊 dom.js Bundle Analysis\n');

const distDir = 'dist';

// Get file size in KB
function getSize(filepath) {
  try {
    const stats = fs.statSync(filepath);
    return (stats.size / 1024).toFixed(2);
  } catch (error) {
    return '0.00';
  }
}

// Get all bundle files
const files = fs.readdirSync(distDir)
  .filter(file => file.endsWith('.js') || file.endsWith('.cjs'))
  .filter(file => !file.includes('.map'))
  .sort();

console.log('┌─────────────────────┬─────────┬─────────┐');
console.log('│ Module              │ ESM     │ CJS     │');
console.log('├─────────────────────┼─────────┼─────────┤');

const modules = ['index', 'core', 'http', 'template', 'forms', 'motion'];

modules.forEach(module => {
  const esmFile = `${module}.js`;
  const cjsFile = `${module}.cjs`;
  
  const esmSize = getSize(path.join(distDir, esmFile));
  const cjsSize = getSize(path.join(distDir, cjsFile));
  
  const moduleDisplay = module === 'index' ? 'Full Bundle' : 
                        module.charAt(0).toUpperCase() + module.slice(1);
  
  console.log(`│ ${moduleDisplay.padEnd(19)} │ ${esmSize.padStart(5)}KB │ ${cjsSize.padStart(5)}KB │`);
});

console.log('└─────────────────────┴─────────┴─────────┘');

// Calculate chunks (shared code)
console.log('\n📦 Shared Chunks (ESM):');
const chunks = files
  .filter(file => file.startsWith('chunk-') && file.endsWith('.js'))
  .map(chunk => ({
    name: chunk,
    size: getSize(path.join(distDir, chunk))
  }));

if (chunks.length > 0) {
  chunks.forEach(chunk => {
    console.log(`   ${chunk.name}: ${chunk.size}KB`);
  });
  
  const totalChunkSize = chunks.reduce((sum, chunk) => sum + parseFloat(chunk.size), 0);
  console.log(`   Total chunk size: ${totalChunkSize.toFixed(2)}KB`);
} else {
  console.log('   No shared chunks (all code inlined)');
}

// Size comparison
console.log('\n📈 Size Analysis:');
const fullSize = parseFloat(getSize(path.join(distDir, 'index.js')));
const coreSize = parseFloat(getSize(path.join(distDir, 'core.js')));

console.log(`   Full Bundle: ${fullSize.toFixed(2)}KB`);
console.log(`   Core Only: ${coreSize.toFixed(2)}KB`);
console.log(`   Savings: ${(fullSize - coreSize).toFixed(2)}KB (${((fullSize - coreSize) / fullSize * 100).toFixed(1)}%)`);

// TypeScript definitions
console.log('\n📝 TypeScript Definitions:');
const dtsFiles = fs.readdirSync(distDir)
  .filter(file => file.endsWith('.d.ts'))
  .filter(file => !file.includes('-')); // Exclude chunk definitions

dtsFiles.forEach(file => {
  const size = getSize(path.join(distDir, file));
  const module = file.replace('.d.ts', '');
  const moduleDisplay = module === 'index' ? 'Full' : module.charAt(0).toUpperCase() + module.slice(1);
  console.log(`   ${moduleDisplay}: ${size}KB`);
});

console.log('\n✨ Recommendations:');
console.log('   • Use core module for basic DOM manipulation (~7KB total)');
console.log('   • Add HTTP module only if making API calls (+2KB)');
console.log('   • Full bundle recommended for jQuery replacement (~13KB total)');
console.log('   • Individual modules provide maximum tree-shaking benefits');

// ——— Docs sync helpers ———
function collectSizes() {
  const esmTargets = ['index.js','core.js','http.js','template.js','forms.js','motion.js'];
  const cjsTargets = ['index.cjs','core.cjs','http.cjs','template.cjs','forms.cjs','motion.cjs'];
  const esm = Object.fromEntries(esmTargets.map(f => [f, parseFloat(getSize(path.join(distDir, f)))]));
  const cjs = Object.fromEntries(esmTargets.map(f => [f.replace('.js','.cjs'), parseFloat(getSize(path.join(distDir, f.replace('.js','.cjs'))))]));
  return { esm, cjs };
}

function formatTable(sizes) {
  const { esm, cjs } = sizes;
  const rows = [
    ['Module','ESM (KB)','CJS (KB)'],
    ['Full', (esm['index.js']||0).toFixed(2), (cjs['index.cjs']||0).toFixed(2)],
    ['Core', (esm['core.js']||0).toFixed(2), (cjs['core.cjs']||0).toFixed(2)],
    ['HTTP', (esm['http.js']||0).toFixed(2), (cjs['http.cjs']||0).toFixed(2)],
    ['Templates', (esm['template.js']||0).toFixed(2), (cjs['template.cjs']||0).toFixed(2)],
    ['Forms', (esm['forms.js']||0).toFixed(2), (cjs['forms.cjs']||0).toFixed(2)],
    ['Motion', (esm['motion.js']||0).toFixed(2), (cjs['motion.cjs']||0).toFixed(2)],
  ];
  const md = [];
  md.push('| ' + rows[0].join(' | ') + ' |');
  md.push('| ' + rows[0].map(()=>'---').join(' | ') + ' |');
  for (let i=1;i<rows.length;i++) md.push('| ' + rows[i].join(' | ') + ' |');
  md.push('');
  md.push('_Note: raw minified dist file sizes (not gzip)._');
  return md.join('\n');
}

function replaceBlock(file, startMarker, endMarker, content) {
  const txt = fs.readFileSync(file, 'utf8');
  const start = txt.indexOf(startMarker);
  const end = txt.indexOf(endMarker);
  if (start === -1 || end === -1 || end <= start) {
    const add = `\n\n${startMarker}\n${content}\n${endMarker}\n`;
    fs.writeFileSync(file, txt + add);
    return true;
  }
  const before = txt.slice(0, start + startMarker.length);
  const after = txt.slice(end);
  const next = `${before}\n${content}${after}`;
  fs.writeFileSync(file, next);
  return true;
}

function blockMatches(file, startMarker, endMarker, content) {
  const txt = fs.readFileSync(file, 'utf8');
  const start = txt.indexOf(startMarker);
  const end = txt.indexOf(endMarker);
  if (start === -1 || end === -1 || end <= start) return false;
  const between = txt.slice(start + startMarker.length, end).replace(/^\n|\n$/g,'');
  return between.trim() === content.trim();
}

// Flags: allow writing/checking docs from this script
const args = process.argv.slice(2);
const DO_WRITE_DOCS = args.includes('--write-docs');
const DO_CHECK_DOCS = args.includes('--check-docs');
if (DO_WRITE_DOCS || DO_CHECK_DOCS) {
  const sizes = collectSizes();
  const table = formatTable(sizes);
  const README = path.resolve('README.md');
  const ARCH = path.resolve('ARCHITECTURE.md');
  const R_START = '<!-- AUTO-GENERATED: BUNDLE_SIZES_START -->';
  const R_END = '<!-- AUTO-GENERATED: BUNDLE_SIZES_END -->';
  if (DO_WRITE_DOCS) {
    replaceBlock(README, R_START, R_END, table);
    replaceBlock(ARCH, R_START, R_END, table);
    console.log('\n✅ Updated README.md and ARCHITECTURE.md bundle size tables');
  }
  if (DO_CHECK_DOCS) {
    const ok1 = blockMatches(README, R_START, R_END, table);
    const ok2 = blockMatches(ARCH, R_START, R_END, table);
    if (!ok1 || !ok2) {
      console.error('\n❌ Bundle size tables out of date. Run: npm run size:docs:write');
      process.exit(1);
    }
    console.log('\n✅ Docs bundle size tables are in sync');
  }
}
