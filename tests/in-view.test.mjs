import { test } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup DOM
const dom = new JSDOM('<!doctype html><html><body><div id="a"></div><div id="b"></div></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.Element = dom.window.Element;
global.HTMLElement = dom.window.HTMLElement;

// Minimal fake IntersectionObserver
class FakeIntersectionObserver {
  constructor(cb, options) {
    this._cb = cb;
    this._options = options || {};
    this._observed = new Set();
    global.__lastIO = this;
  }
  observe(el) { this._observed.add(el); }
  unobserve(el) { this._observed.delete(el); }
  disconnect() { this._observed.clear(); }
  trigger(entries) {
    const filtered = entries.filter(e => this._observed.has(e.target));
    if (filtered.length) this._cb(filtered);
  }
}

global.window.IntersectionObserver = FakeIntersectionObserver;
global.IntersectionObserver = FakeIntersectionObserver;

const api = (await import('../dist/index.js')).default;

test('enter/leave fire around threshold', () => {
  const a = document.getElementById('a');
  const b = document.getElementById('b');

  const iv = api.inView('#a, #b', { threshold: 0.5 });
  let enters = 0, leaves = 0;
  iv.enter((el, entry) => { enters++; }).leave((el, entry) => { leaves++; });

  const io = global.__lastIO;
  io.trigger([
    { target: a, isIntersecting: true, intersectionRatio: 0.6 },
    { target: b, isIntersecting: false, intersectionRatio: 0.0 }
  ]);
  if (enters !== 1 || leaves !== 0) throw new Error('enter should fire for #a only');

  io.trigger([
    { target: a, isIntersecting: true, intersectionRatio: 0.4 },
    { target: b, isIntersecting: true, intersectionRatio: 0.7 }
  ]);
  if (enters !== 2) throw new Error('enter should fire for #b');
  if (leaves !== 1) throw new Error('leave should fire for #a');

  iv.stop();
});

test('once:true unobserves after first enter per element', () => {
  const a = document.getElementById('a');

  const iv = api.inView('#a', { threshold: 0.25, once: true });
  let enters = 0, leaves = 0;
  iv.enter(() => { enters++; }).leave(() => { leaves++; });

  const io = global.__lastIO;
  io.trigger([{ target: a, isIntersecting: true, intersectionRatio: 0.3 }]);
  if (enters !== 1) throw new Error('enter should fire once');

  io.trigger([{ target: a, isIntersecting: true, intersectionRatio: 0.1 }]);
  if (leaves !== 0) throw new Error('leave should not fire after unobserve');

  iv.stop();
});

// Summary handled by Vitest
