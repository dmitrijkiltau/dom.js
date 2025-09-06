#!/usr/bin/env node

import { JSDOM } from 'jsdom';
import { renderTemplate, isUnsafeHTML, escapeHTML } from '../dist/template.js';

console.log('\n🧪 Testing unsafe HTML bindings...');

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
const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLTemplateElement = dom.window.HTMLTemplateElement;

document.body.innerHTML = `
  <template id="t">
    <div>
      <p id="a" data-html="unsafe(html)"></p>
      <p id="b" data-safe-html="html"></p>
      <p id="c" data-html="wrapped"></p>
    </div>
  </template>
`;

test('data-html="unsafe(expr)" renders raw HTML', () => {
  const html = '<b>bold</b>';
  const result = renderTemplate('#t', { html });
  const wrap = document.createElement('div');
  wrap.append(result);
  const a = wrap.querySelector('#a');
  if (!a) throw new Error('Missing #a');
  if (a.innerHTML !== html) throw new Error('Expected raw HTML in #a');
});

test('data-safe-html escapes content', () => {
  const html = '<b>bold</b>';
  const result = renderTemplate('#t', { html });
  const wrap = document.createElement('div');
  wrap.append(result);
  const b = wrap.querySelector('#b');
  if (!b) throw new Error('Missing #b');
  if (b.innerHTML !== escapeHTML(html)) throw new Error('Expected escaped HTML in #b');
});

test('isUnsafeHTML wrapper works with data-html', () => {
  const wrapped = isUnsafeHTML('<i>em</i>');
  const result = renderTemplate('#t', { html: 'x', wrapped });
  const wrap = document.createElement('div');
  wrap.append(result);
  const c = wrap.querySelector('#c');
  if (!c) throw new Error('Missing #c');
  if (c.innerHTML !== '<i>em</i>') throw new Error('Expected raw HTML from wrapper in #c');
});

console.log(`\n📊 Unsafe HTML Test Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

