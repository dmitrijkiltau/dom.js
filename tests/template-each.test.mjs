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
  <template id="t">
    <li data-each="items as item, i">
      <span data-text="item.name"></span>
      <em data-text="i"></em>
    </li>
  </template>
`;

test('Repeats elements for array items', () => {
  const data = { items: [ { name: 'Alice' }, { name: 'Bob' } ] };
  const result = renderTemplate('#t', data);
  const ul = document.createElement('ul');
  ul.append(result);

  const lis = ul.querySelectorAll('li');
  if (lis.length !== 2) throw new Error('Expected 2 list items');
  if (lis[0].querySelector('span')?.textContent !== 'Alice') throw new Error('First name mismatch');
  if (lis[1].querySelector('span')?.textContent !== 'Bob') throw new Error('Second name mismatch');
  if (lis[0].querySelector('em')?.textContent !== '0') throw new Error('First index mismatch');
  if (lis[1].querySelector('em')?.textContent !== '1') throw new Error('Second index mismatch');
});

// Summary handled by Vitest
