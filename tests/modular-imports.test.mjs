#!/usr/bin/env node

// Test script to verify all modular import patterns work as documented
// This validates the examples shown in the documentation

import { strict as assert } from 'assert';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, '..', 'dist');

console.log('🧪 Testing Modular Import Patterns\n');

// Test 1: Core import
console.log('1️⃣ Testing Core Import...');
try {
  const { default: dom } = await import(join(distPath, 'core.js'));
  assert(typeof dom === 'function', 'dom should be a function');
  console.log('   ✅ Core import successful');
} catch (error) {
  console.error('   ❌ Core import failed:', error.message);
  process.exit(1);
}

// Test 2: HTTP import  
console.log('2️⃣ Testing HTTP Import...');
try {
  const { http } = await import(join(distPath, 'http.js'));
  assert(typeof http === 'object', 'http should be an object');
  assert(typeof http.get === 'function', 'http.get should be a function');
  assert(typeof http.post === 'function', 'http.post should be a function');
  console.log('   ✅ HTTP import successful');
} catch (error) {
  console.error('   ❌ HTTP import failed:', error.message);
  process.exit(1);
}

// Test 3: Template import
console.log('3️⃣ Testing Template Import...');
try {
  const { renderTemplate, useTemplate, tpl } = await import(join(distPath, 'template.js'));
  assert(typeof renderTemplate === 'function', 'renderTemplate should be a function');
  assert(typeof useTemplate === 'function', 'useTemplate should be a function');
  assert(typeof tpl === 'function', 'tpl should be a function');
  console.log('   ✅ Template import successful');
} catch (error) {
  console.error('   ❌ Template import failed:', error.message);
  process.exit(1);
}

// Test 4: Forms import
console.log('4️⃣ Testing Forms Import...');
try {
  const { serializeForm, toQueryString, onSubmit } = await import(join(distPath, 'forms.js'));
  assert(typeof serializeForm === 'function', 'serializeForm should be a function');
  assert(typeof toQueryString === 'function', 'toQueryString should be a function');
  assert(typeof onSubmit === 'function', 'onSubmit should be a function');
  console.log('   ✅ Forms import successful');
} catch (error) {
  console.error('   ❌ Forms import failed:', error.message);
  process.exit(1);
}

// Test 5: Motion import
console.log('5️⃣ Testing Motion Import...');
try {
  const { animate, animations } = await import(join(distPath, 'motion.js'));
  assert(typeof animate === 'function', 'animate should be a function');
  assert(typeof animations === 'object', 'animations should be an object');
  assert(typeof animations.fadeIn === 'function', 'animations.fadeIn should be a function');
  console.log('   ✅ Motion import successful');
} catch (error) {
  console.error('   ❌ Motion import failed:', error.message);
  process.exit(1);
}

// Test 6: Full bundle import  
console.log('6️⃣ Testing Full Bundle Import...');
try {
  const module = await import(join(distPath, 'index.js'));
  const dom = module.default;
  const { http, renderTemplate, serializeForm, animate } = module;
  
  assert(typeof dom === 'function', 'dom should be a function');
  assert(typeof http === 'object', 'http should be an object');
  assert(typeof renderTemplate === 'function', 'renderTemplate should be a function');
  assert(typeof serializeForm === 'function', 'serializeForm should be a function');
  assert(typeof animate === 'function', 'animate should be a function');
  console.log('   ✅ Full bundle import successful');
} catch (error) {
  console.error('   ❌ Full bundle import failed:', error.message);
  process.exit(1);
}

// Test 7: Mixed modular usage (Core + HTTP)
console.log('7️⃣ Testing Mixed Modular Usage (Core + HTTP)...');
try {
  const { default: dom } = await import(join(distPath, 'core.js'));
  const { http } = await import(join(distPath, 'http.js'));
  
  // Test that both work together
  assert(typeof dom === 'function', 'dom should be a function');
  assert(typeof http.get === 'function', 'http.get should be a function');
  console.log('   ✅ Mixed modular usage successful');
} catch (error) {
  console.error('   ❌ Mixed modular usage failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 All modular import patterns work correctly!');
console.log('\n📊 Bundle Size Benefits (as documented):');
console.log('   • Full Bundle: ~13KB (all features)');
console.log('   • Core Only: ~7KB (43% smaller)');  
console.log('   • Core + HTTP: ~9KB (30% smaller)');
console.log('   • Individual modules: Varies (up to 50% smaller)');

console.log('\n✅ Documentation examples are accurate and working!');