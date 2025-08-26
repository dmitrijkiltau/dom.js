#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🧪 Testing dom-ssg integration...\n');

// Test 1: Check that SSG files exist
console.log('1️⃣ Checking SSG output files...');
const ssgDir = path.join(__dirname, '../docs/dist-ssg');
const requiredFiles = ['index.html', 'bundle-info.json', 'optimized.js'];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(ssgDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} missing`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Run: npm run docs:ssg');
  process.exit(1);
}

// Test 2: Check bundle optimization
console.log('\n2️⃣ Checking bundle optimization...');
const bundleInfoPath = path.join(ssgDir, 'bundle-info.json');
const bundleInfo = JSON.parse(fs.readFileSync(bundleInfoPath, 'utf8'));

console.log(`   Bundle size: ${bundleInfo.optimizedSize}KB (was ${bundleInfo.fullSize}KB)`);
console.log(`   Savings: ${bundleInfo.savings}KB (${bundleInfo.percentSavings}%)`);
console.log(`   Modules: ${bundleInfo.modules.join(', ')}`);

if (bundleInfo.percentSavings > 0) {
  console.log('   ✅ Bundle optimization successful');
} else {
  console.log('   ⚠️  No bundle optimization achieved');
}

// Test 3: Check HTML pre-rendering
console.log('\n3️⃣ Checking HTML pre-rendering...');
const htmlPath = path.join(ssgDir, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Check for pre-rendered content (should have actual sections, not just templates)
const hasPrerenderedContent = html.includes('<section class="section" id="getting-started">');
const hasOptimizedImport = html.includes('import dom from \'@dmitrijkiltau/dom.js/core\'');
const hasSSGComment = html.includes('Built with dom-ssg');

if (hasPrerenderedContent) {
  console.log('   ✅ Templates pre-rendered successfully');
} else {
  console.log('   ❌ Templates not pre-rendered');
}

if (hasOptimizedImport) {
  console.log('   ✅ Optimized import statement found');
} else {
  console.log('   ❌ Optimized import not found');
}

if (hasSSGComment) {
  console.log('   ✅ SSG build comment present');
} else {
  console.log('   ❌ SSG build comment missing');
}

// Test 4: File size comparison
console.log('\n4️⃣ Comparing file sizes...');
const originalHtmlPath = path.join(__dirname, '../docs/dist/index.html');
if (fs.existsSync(originalHtmlPath)) {
  const originalSize = fs.statSync(originalHtmlPath).size;
  const ssgSize = fs.statSync(htmlPath).size;
  
  console.log(`   Original (SPA): ${(originalSize / 1024).toFixed(2)}KB`);
  console.log(`   SSG: ${(ssgSize / 1024).toFixed(2)}KB`);
  
  if (ssgSize > originalSize) {
    console.log('   ✅ SSG HTML is larger (contains pre-rendered content)');
  } else {
    console.log('   ⚠️  SSG HTML is not larger than original');
  }
} else {
  console.log('   ⚠️  Original build not found, run: cd docs && npm run build');
}

// Summary
console.log('\n📊 SSG Integration Test Summary');
console.log('================================');

if (allFilesExist && hasPrerenderedContent && hasOptimizedImport && hasSSGComment) {
  console.log('✅ All tests passed! dom-ssg is working correctly.');
  console.log(`\n🎯 Key benefits achieved:`);
  console.log(`   • ${bundleInfo.percentSavings}% smaller JavaScript bundle`);
  console.log(`   • Pre-rendered HTML for better SEO and performance`);
  console.log(`   • Optimized import: ${bundleInfo.import}`);
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please check the output above.');
  process.exit(1);
}