#!/usr/bin/env node

import { JSDOM } from 'jsdom';
import { renderTemplate } from '../dist/template.js';

console.log('\n🧪 Testing data-if/elseif/else template bindings...');

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
  <template id="cond">
    <ul>
      <li data-if="a">A</li>
      <li data-elseif="b">B</li>
      <li data-else>E</li>
    </ul>
  </template>
`;

test('Shows A when a is true', () => {
  const data = { a: true, b: false };
  const result = renderTemplate('#cond', data);
  const wrap = document.createElement('div');
  wrap.append(result);
  const ul = wrap.querySelector('ul');
  const lis = ul?.querySelectorAll('li') || [];
  if (lis.length !== 1) throw new Error('Expected 1 list item');
  if (lis[0].textContent !== 'A') throw new Error('Expected A branch');
});

test('Shows B when a is false and b is true', () => {
  const data = { a: false, b: true };
  const result = renderTemplate('#cond', data);
  const wrap = document.createElement('div');
  wrap.append(result);
  const ul = wrap.querySelector('ul');
  const lis = ul?.querySelectorAll('li') || [];
  if (lis.length !== 1) throw new Error('Expected 1 list item');
  if (lis[0].textContent !== 'B') throw new Error('Expected B branch');
});

test('Shows Else when both are false', () => {
  const data = { a: false, b: false };
  const result = renderTemplate('#cond', data);
  const wrap = document.createElement('div');
  wrap.append(result);
  const ul = wrap.querySelector('ul');
  const lis = ul?.querySelectorAll('li') || [];
  if (lis.length !== 1) throw new Error('Expected 1 list item');
  if (lis[0].textContent !== 'E') throw new Error('Expected Else branch');
});

console.log(`\n📊 If/Else Test Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

