import { test, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import api, { on, off, once } from '../dist/index.js';

const setup = () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"><a class="x"></a><a class="y"></a></div></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.Element = dom.window.Element;
  global.HTMLElement = dom.window.HTMLElement;
  return dom;
};

test('on() returns disposer that detaches handler', () => {
  setup();
  const el = document.querySelector('#root .x');
  let n = 0;
  const stop = on(el, 'click.ns1', () => { n++; });
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  expect(n).toBe(1);
  stop();
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  expect(n).toBe(1);
});

test('off() idempotent and respects namespaces with multi-types', () => {
  setup();
  const el = document.querySelector('#root');
  let a = 0, b = 0;
  const h = (e) => { if (e.type === 'click') a++; else b++; };
  const stop = on(el, 'click.ns keydown.ns', h);
  off(el, 'click.ns'); // remove just click
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  el.dispatchEvent(new window.KeyboardEvent('keydown', { bubbles: true }));
  // Idempotent off
  off(el, 'click.ns');
  stop();
  expect(a).toBe(0);
  expect(b).toBe(1);
});

test('delegated off() with handler removes only matching one', () => {
  setup();
  const root = document.getElementById('root');
  const xa = root.querySelector('.x');
  const ya = root.querySelector('.y');
  let nx = 0, ny = 0;
  const hx = () => { nx++; };
  const hy = () => { ny++; };
  on(root, 'click.ns', '.x', hx);
  on(root, 'click.ns', '.y', hy);
  off(root, 'click.ns', '.x', hx);
  xa.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  ya.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  expect(nx).toBe(0);
  expect(ny).toBe(1);
});

test('once() with delegation fires exactly once', () => {
  setup();
  const root = document.getElementById('root');
  let n = 0;
  once(root, 'click.ns', '.x', () => { n++; });
  const x = root.querySelector('.x');
  x.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  x.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  expect(n).toBe(1);
});

