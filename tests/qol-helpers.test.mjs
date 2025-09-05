#!/usr/bin/env node

import { JSDOM } from 'jsdom';
import api from '../dist/index.js';

console.log('\n🧪 Testing QoL helpers: dataset, aria, beforeEach/afterEach...');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`);
    failed++;
  }
}

// Setup DOM
const dom = new JSDOM('<!doctype html><html><body><div id="a"></div><div id="b"></div></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.Element = dom.window.Element;
global.HTMLElement = dom.window.HTMLElement;

test('dataset(map) sets multiple data-* attributes', () => {
  const $els = api('#a, #b');
  $els.dataset({ userId: 123, 'data-active': true });
  const a = document.getElementById('a');
  const b = document.getElementById('b');
  if (a.getAttribute('data-user-id') !== '123') throw new Error('data-user-id not set on #a');
  if (b.getAttribute('data-user-id') !== '123') throw new Error('data-user-id not set on #b');
  if (a.getAttribute('data-active') !== 'true') throw new Error('data-active not set on #a');
});

test('dataset() reads dataset from first element', () => {
  const a = document.getElementById('a');
  a.setAttribute('data-mode', 'dark');
  const ds = api('#a').dataset();
  if (ds.mode !== 'dark') throw new Error('dataset() did not read data-mode');
});

test('aria(name, value) sets aria-* and aria(map) merges', () => {
  const $a = api('#a');
  $a.aria('busy', true).aria({ label: 'X', 'aria-checked': false });
  const a = document.getElementById('a');
  if (a.getAttribute('aria-busy') !== 'true') throw new Error('aria-busy not set to true');
  if (a.getAttribute('aria-label') !== 'X') throw new Error('aria-label not set');
  if (a.getAttribute('aria-checked') !== 'false') throw new Error('aria-checked not set false');
  if ($a.aria('label') !== 'X') throw new Error('aria(name) did not read back value');
});

test('beforeEach/afterEach call the callback for each element', () => {
  const $els = api('#a, #b');
  let before = 0, after = 0;
  $els.beforeEach(() => before++).afterEach(() => after++);
  if (before !== 2 || after !== 2) throw new Error('beforeEach/afterEach did not run for each element');
});

console.log(`\n📊 QoL tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
