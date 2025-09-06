#!/usr/bin/env node

import { JSDOM } from 'jsdom';
import { useTemplate } from '../dist/template.js';

console.log('\n🧪 Testing data-class-* and data-style-* bindings...');

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
  <template id="tpl">
    <div id="box" class="base" data-class-active="isActive" data-style-background-color="bg" data-style-display="display"></div>
  </template>
`;

test('Toggles class and sets styles', () => {
  const render = useTemplate('#tpl');
  const inst = render.mount({ isActive: false, bg: 'red', display: 'block' });
  const host = document.createElement('div');
  host.append(inst.el);
  const box = host.querySelector('#box');
  if (!box) throw new Error('Box not found');
  if (!box.classList.contains('base')) throw new Error('Static class missing');
  if (box.classList.contains('active')) throw new Error('Active class should be absent');
  if (box.style.backgroundColor !== 'red') throw new Error('Background should be red');
  if (box.style.display !== 'block') throw new Error('Display should be block');

  inst.update({ isActive: true, bg: null, display: '' });
  if (!box.classList.contains('active')) throw new Error('Active class should be present');
  if (box.style.backgroundColor) throw new Error('Background should be removed');
  if (box.style.display) throw new Error('Display should be removed');

  inst.destroy();
});

console.log(`\n📊 Class/Style Test Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

