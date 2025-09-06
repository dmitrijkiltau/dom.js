#!/usr/bin/env node

import { JSDOM } from 'jsdom';
import { renderTemplate, hydrateTemplate } from '../dist/template.js';

console.log('\n🧪 Testing template hydration (SSR -> hydrate)...');

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
  <template id="hydr">
    <div id="root">
      <button id="btn" data-on-click="clickSpy($event)"><span id="cnt" data-text="count"></span></button>
      <ul id="cond">
        <li data-if="showA">A</li>
        <li data-else>B</li>
      </ul>
      <ol id="list">
        <li data-each="items as item, i">
          <span class="name" data-text="item"></span>#<em class="idx" data-text="i"></em>
        </li>
      </ol>
    </div>
  </template>
`;

test('Hydrates server-rendered DOM and wires listeners', () => {
  // Server render
  const initial = { count: 1, clickSpy: () => {}, showA: true, items: ['X', 'Y'] };
  const ssrNode = renderTemplate('#hydr', initial);
  const host = document.createElement('div');
  host.append(ssrNode);
  const root = host.querySelector('#root');
  if (!root) throw new Error('SSR root not found');

  // Hydrate
  let clicks = 0;
  const inst = hydrateTemplate('#hydr', root, { count: 1, clickSpy: () => { clicks++; }, showA: true, items: ['X', 'Y'] });

  // Check initial SSR content preserved
  const cnt = host.querySelector('#cnt');
  if (!cnt) throw new Error('Counter span missing');
  if ((cnt.textContent || '').trim() !== '1') throw new Error('Initial count mismatch after hydrate');
  // Event should be bound
  const btn = host.querySelector('#btn');
  btn?.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  if (clicks !== 1) throw new Error('Click handler not invoked on hydrated node');

  // Update count
  inst.update({ count: 2, clickSpy: () => { clicks++; }, showA: true, items: ['X', 'Y'] });
  if ((cnt.textContent || '').trim() !== '2') throw new Error('Count did not update');

  // Flip condition A->B without re-mounting root
  inst.update({ count: 2, clickSpy: () => { clicks++; }, showA: false, items: ['X', 'Y'] });
  const ul = host.querySelector('#cond');
  const lis = ul?.querySelectorAll('li') || [];
  if (lis.length !== 1 || (lis[0].textContent || '').trim() !== 'B') throw new Error('If/Else branch did not update');

  // Update each items
  inst.update({ count: 2, clickSpy: () => { clicks++; }, showA: false, items: ['A', 'B', 'C'] });
  const ol = host.querySelector('#list');
  const names = Array.from(ol?.querySelectorAll('.name') || []).map(n => (n.textContent || '').trim());
  const idxs = Array.from(ol?.querySelectorAll('.idx') || []).map(n => (n.textContent || '').trim());
  if (names.join(',') !== 'A,B,C') throw new Error('Each items did not update');
  if (idxs.join(',') !== '0,1,2') throw new Error('Each indexes did not update');

  inst.destroy();
});

console.log(`\n📊 Hydration Test Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

