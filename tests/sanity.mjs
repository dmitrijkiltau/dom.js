#!/usr/bin/env node

/**
 * Basic sanity test for dom.js
 * Ensures the build output is valid and core functions work
 */

import api, { dom, DOMCollection, http, once, animations } from '../dist/index.js';

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
  if (typeof DOMCollection !== 'function') throw new Error('DOMCollection not exported');
  if (typeof http !== 'object') throw new Error('http object not exported');
});

test('DOMCollection can be instantiated', () => {
  const collection = new DOMCollection([]);
  if (!(collection instanceof DOMCollection)) throw new Error('DOMCollection instantiation failed');
});

test('dom function returns DOMCollection', () => {
  const result = dom();
  if (!(result instanceof DOMCollection)) throw new Error('dom() did not return DOMCollection');
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
  const expectedMethods = ['dom', 'create', 'on', 'once', 'off'];
  for (const method of expectedMethods) {
    if (typeof api[method] !== 'function') {
      throw new Error(`api.${method} is not a function`);
    }
  }
});

test('DOMCollection has new methods', () => {
  const collection = new DOMCollection([]);
  const expectedMethods = ['last', 'filter', 'parent', 'siblings', 'remove', 'empty', 'clone', 'once', 'trigger', 'val', 'prop', 'attrs'];
  for (const method of expectedMethods) {
    if (typeof collection[method] !== 'function') {
      throw new Error(`DOMCollection.${method} is not a function`);
    }
  }
});

test('once function is available', () => {
  if (typeof once !== 'function') {
    throw new Error('once function not exported');
  }
});

test('animations object has presets', () => {
  if (typeof animations !== 'object') {
    throw new Error('animations object not exported');
  }
  const expectedAnimations = ['fadeIn', 'fadeOut', 'slideUp', 'slideDown', 'pulse', 'shake'];
  for (const animation of expectedAnimations) {
    if (typeof animations[animation] !== 'function') {
      throw new Error(`animations.${animation} is not a function`);
    }
  }
});

test('DOMCollection has animation shortcuts', () => {
  const collection = new DOMCollection([]);
  const expectedMethods = ['fadeIn', 'fadeOut', 'slideUp', 'slideDown', 'pulse', 'shake'];
  for (const method of expectedMethods) {
    if (typeof collection[method] !== 'function') {
      throw new Error(`DOMCollection.${method} is not a function`);
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