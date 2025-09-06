import { test } from 'vitest';
import { JSDOM } from 'jsdom';
import { renderTemplate } from '../dist/template.js';

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

// Summary handled by Vitest
