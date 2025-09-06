import { test } from 'vitest';
import { JSDOM } from 'jsdom';
import { renderTemplate, useTemplate } from '../dist/template.js';

// Setup DOM
const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLTemplateElement = dom.window.HTMLTemplateElement;

document.body.innerHTML = `
  <template id="item">
    <span data-text="name"></span>
  </template>

  <template id="main">
    <div id="wrap">
      <div data-include="#item" data-with="user"></div>
    </div>
  </template>

  <template id="main-fn">
    <div id="wrap2">
      <div data-include="renderer" data-with="user"></div>
    </div>
  </template>

  <template id="main-el">
    <div id="wrap3">
      <div data-include="tplRef" data-with="ctx"></div>
    </div>
  </template>
`;

test('Includes static #item with with-context', () => {
  const data = { user: { name: 'Alice' } };
  const result = renderTemplate('#main', data);
  const wrap = document.createElement('div');
  wrap.append(result);
  const span = wrap.querySelector('#wrap span');
  if (!span) throw new Error('Included span not found');
  if (span.textContent !== 'Alice') throw new Error('Included content mismatch');
});

test('Includes via function renderer with with-context', () => {
  const data = { user: { name: 'Bob' }, renderer: (ctx) => { const i = document.createElement('i'); i.textContent = ctx.name; return i; } };
  const result = renderTemplate('#main-fn', data);
  const wrap = document.createElement('div');
  wrap.append(result);
  const el = wrap.querySelector('#wrap2 i');
  if (!el) throw new Error('Function include node not found');
  if (el.textContent !== 'Bob') throw new Error('Function include content mismatch');
});

test('Includes via template element reference and updates', () => {
  const tplEl = document.querySelector('#item');
  const render = useTemplate('#main-el');
  const inst = render.mount({ tplRef: tplEl, ctx: { name: 'Cleo' } });
  const host = document.createElement('div');
  host.append(inst.el);
  const span = host.querySelector('#wrap3 span');
  if (!span) throw new Error('Span not found');
  if (span.textContent !== 'Cleo') throw new Error('Initial include content mismatch');
  inst.update({ tplRef: tplEl, ctx: { name: 'Dora' } });
  if (span.textContent !== 'Dora') throw new Error('Updated include content mismatch');
  inst.destroy();
});

// Summary handled by Vitest
