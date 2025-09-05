#!/usr/bin/env node

import { JSDOM } from 'jsdom';
import { on, once } from '../dist/index.js';

console.log('\n🧪 Testing top-level delegated events (document/window)...');

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
const dom = new JSDOM('<!doctype html><html><body><ul id="list"><li class="item"><a class="link">A</a></li></ul></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.Element = dom.window.Element;
global.HTMLElement = dom.window.HTMLElement;

test('Delegated handler on document fires for matching target', () => {
  const calls = [];
  const stop = on(document, 'click.test', 'a.link', (e, el) => { calls.push(el); });
  const a = document.querySelector('a.link');
  a.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  stop();
  if (calls.length !== 1) throw new Error('Expected delegated handler to fire exactly once');
});

test('once() delegated fires only once', () => {
  let n = 0;
  once(document, 'click', 'a.link', () => { n++; });
  const a = document.querySelector('a.link');
  a.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  a.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  if (n !== 1) throw new Error('Expected once delegated handler to fire only once');
});

console.log(`\n📊 Top-level delegation: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
