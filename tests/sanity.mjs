#!/usr/bin/env node

/**
 * Basic sanity test for dom.js
 * Ensures the build output is valid and core functions work
 */

import api, { dom, VKCollection, http } from '../dist/index.js';

console.log('🧪 Running dom.js sanity tests...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    failed++;
  }
}

// Test basic exports
test('Default export exists and is a function', () => {
  if (typeof api !== 'function') throw new Error('Default export is not a function');
});

test('Named exports exist', () => {
  if (typeof dom !== 'function') throw new Error('dom function not exported');
  if (typeof VKCollection !== 'function') throw new Error('VKCollection not exported');
  if (typeof http !== 'object') throw new Error('http object not exported');
});

test('VKCollection can be instantiated', () => {
  const collection = new VKCollection([]);
  if (!(collection instanceof VKCollection)) throw new Error('VKCollection instantiation failed');
});

test('dom function returns VKCollection', () => {
  const result = dom();
  if (!(result instanceof VKCollection)) throw new Error('dom() did not return VKCollection');
});

test('HTTP object has expected methods', () => {
  const expectedMethods = ['get', 'post', 'put', 'patch', 'delete'];
  for (const method of expectedMethods) {
    if (typeof http[method] !== 'function') {
      throw new Error(`http.${method} is not a function`);
    }
  }
});

test('API object has utility methods', () => {
  const expectedMethods = ['dom', 'create', 'on', 'off'];
  for (const method of expectedMethods) {
    if (typeof api[method] !== 'function') {
      throw new Error(`api.${method} is not a function`);
    }
  }
});

// Summary
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.log('❌ Some tests failed');
  process.exit(1);
} else {
  console.log('✅ All tests passed');
  process.exit(0);
}