import { test } from 'vitest';
import api, { dom, DOMCollection, http, once, animations } from '../dist/index.js';

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
  const expectedMethods = ['last', 'filter', 'parent', 'siblings', 'remove', 'empty', 'clone', 'once', 'trigger', 'val', 'prop', 'attrs', 'serialize', 'click', 'focus', 'blur', 'hover', 'replaceClass'];
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

// Summary handled by Vitest

