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