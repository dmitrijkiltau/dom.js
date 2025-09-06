#!/usr/bin/env node

import { JSDOM } from 'jsdom';
import dom, { on, off } from '../dist/index.js';

console.log('\n🧪 Testing events: namespaces, multiple types, delegated off(), and { signal }...');

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
const domenv = new JSDOM('<!doctype html><html><body><button id="btn">B</button><div id="wrap"><a class="alpha">A</a><a class="beta">B</a></div></body></html>');
global.window = domenv.window;
global.document = domenv.window.document;
global.Element = domenv.window.Element;
global.HTMLElement = domenv.window.HTMLElement;

test('off(\'.ns\') removes namespace-only (all types)', () => {
  const btn = document.getElementById('btn');
  let clicks = 0; let keys = 0; let plain = 0;
  const stopClickNs = on(btn, 'click.ns', () => { clicks++; });
  const stopKeyNs = on(btn, 'keydown.ns', () => { keys++; });
  const stopPlain = on(btn, 'click', () => { plain++; });

  // Remove by namespace only
  off(btn, '.ns');

  btn.dispatchEvent(new domenv.window.MouseEvent('click', { bubbles: true }));
  btn.dispatchEvent(new domenv.window.KeyboardEvent('keydown', { bubbles: true }));

  // Clean up remaining
  stopClickNs(); stopKeyNs(); stopPlain(); // idempotent after off

  if (clicks !== 0) throw new Error('namespaced click should be removed');
  if (keys !== 0) throw new Error('namespaced keydown should be removed');
  if (plain !== 1) throw new Error('non-namespaced click should remain');
});

test('namespaces subset and multi-namespace removal', () => {
  const btn = document.getElementById('btn');
  let a = 0, b = 0, ab = 0;
  const stopA = on(btn, 'click.a', () => { a++; });
  const stopB = on(btn, 'click.b', () => { b++; });
  const stopAB = on(btn, 'click.a.b', () => { ab++; });

  // Remove just .a (should remove a and a.b)
  off(btn, '.a');
  btn.dispatchEvent(new domenv.window.MouseEvent('click', { bubbles: true }));
  if (a !== 0 || ab !== 0) throw new Error('handlers with .a should be removed');
  if (b !== 1) throw new Error('handler with only .b should remain');

  // Cleanup remaining
  stopA(); stopB(); stopAB();
});

test('multiple types unbind correctly', () => {
  const btn = document.getElementById('btn');
  let clicks = 0, keys = 0;
  const stop = on(btn, 'click.ns keydown.ns', (e) => {
    if (e.type === 'click') clicks++; else if (e.type === 'keydown') keys++;
  });

  // Remove only click.ns
  off(btn, 'click.ns');

  btn.dispatchEvent(new domenv.window.MouseEvent('click', { bubbles: true }));
  btn.dispatchEvent(new domenv.window.KeyboardEvent('keydown', { bubbles: true }));

  // Cleanup
  stop();

  if (clicks !== 0) throw new Error('click.ns should be removed');
  if (keys !== 1) throw new Error('keydown.ns should remain');
});

test('delegated off() by selector only removes matching handlers', () => {
  const wrap = document.getElementById('wrap');
  const a = wrap.querySelector('a.alpha');
  const b = wrap.querySelector('a.beta');
  const calls = { a: 0, b: 0 };

  const $wrap = dom('#wrap');
  $wrap.on('click.ns', 'a.alpha', () => { calls.a++; });
  $wrap.on('click.ns', 'a.beta', () => { calls.b++; });

  // Remove only alpha delegated handler via selector
  $wrap.off('click.ns', 'a.alpha');

  a.dispatchEvent(new domenv.window.MouseEvent('click', { bubbles: true }));
  b.dispatchEvent(new domenv.window.MouseEvent('click', { bubbles: true }));

  if (calls.a !== 0) throw new Error('delegated alpha handler should be removed');
  if (calls.b !== 1) throw new Error('delegated beta handler should remain');
});

test('{ signal } abort stops handler and pre-aborted signal does not attach', () => {
  const btn = document.getElementById('btn');
  let n1 = 0, n2 = 0;
  const c1 = new domenv.window.AbortController();
  const c2 = new domenv.window.AbortController();
  c2.abort(); // pre-aborted

  on(btn, 'click', () => { n1++; }, { signal: c1.signal });
  on(btn, 'click', () => { n2++; }, { signal: c2.signal });

  // Abort first
  c1.abort();

  btn.dispatchEvent(new domenv.window.MouseEvent('click', { bubbles: true }));

  if (n1 !== 0) throw new Error('aborted signal should prevent handler');
  if (n2 !== 0) throw new Error('pre-aborted signal should not attach');
});

console.log(`\n📊 Events (namespaces/delegation/signal): ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
