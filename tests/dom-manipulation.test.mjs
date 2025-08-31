#!/usr/bin/env node

import { JSDOM } from 'jsdom';
import api, { DOMCollection } from '../dist/index.js';

console.log('\n🧪 Testing DOM manipulation helpers (prepend, prependTo, replaceWith, wrap, unwrap)...');

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
global.Element = dom.window.Element;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLTemplateElement = dom.window.HTMLTemplateElement;

// Alias
const $ = api;

test('prepend inserts content at the beginning', () => {
  const root = document.createElement('div');
  root.id = 'root';
  root.innerHTML = '<span id="a">A</span>';
  $(root).prepend('<b id="p">P</b>');
  if (root.firstElementChild?.id !== 'p') throw new Error('Expected prepended element first');
});

test('append appends string/Element/DOMCollection without wrappers', () => {
  const root = document.createElement('div');
  // String append
  $(root).append('<span id="s1">S1</span>');
  if (root.lastElementChild?.id !== 's1') throw new Error('String append failed');
  if (root.querySelector('div > div') != null) {
    throw new Error('Unexpected extra <div> wrapper created');
  }
  // Element append
  const el = document.createElement('em'); el.id = 'e1';
  $(root).append(el);
  if (root.lastElementChild?.id !== 'e1') throw new Error('Element append failed');
  // DOMCollection append
  const a = document.createElement('i'); a.id = 'c1';
  const b = document.createElement('i'); b.id = 'c2';
  $(root).append(new DOMCollection([a, b]));
  const ids = Array.from(root.children).map(c => c.id).slice(-2);
  if (ids.join(',') !== 'c1,c2') throw new Error('DOMCollection append failed');
});

test('html can accept Element and DOMCollection to replace contents', () => {
  const root = document.createElement('div');
  root.innerHTML = '<span>old</span>';
  // Single element
  const el = document.createElement('strong'); el.id = 'h1';
  $(root).html(el);
  if (root.children.length !== 1 || root.firstElementChild?.id !== 'h1') {
    throw new Error('html(Element) did not replace content correctly');
  }
  // DOMCollection
  const a = document.createElement('b'); a.id = 'h2a';
  const b = document.createElement('b'); b.id = 'h2b';
  $(root).html(new DOMCollection([a, b]));
  const ids = Array.from(root.children).map(c => c.id);
  if (ids.join(',') !== 'h2a,h2b') throw new Error('html(DOMCollection) did not replace content correctly');
});

test('prependTo inserts collection at the beginning of target', () => {
  const ul = document.createElement('ul');
  const old = document.createElement('li'); old.id = 'old';
  ul.appendChild(old);
  const li = document.createElement('li'); li.id = 'new';
  new DOMCollection([li]).prependTo(ul);
  if (ul.firstElementChild?.id !== 'new') throw new Error('Expected collection to be prepended to target');
});

test('replaceWith replaces element with string', () => {
  const parent = document.createElement('div');
  const child = document.createElement('i');
  child.id = 'old';
  parent.appendChild(child);
  $(child).replaceWith('<span id="new">N</span>');
  if (parent.querySelector('#new') == null) throw new Error('Expected #new after replaceWith');
  if (parent.querySelector('#old') != null) throw new Error('Old element still present');
});

test('replaceWith supports DOMCollection content (multiple nodes)', () => {
  const parent = document.createElement('div');
  const child = document.createElement('i');
  parent.appendChild(child);
  const a = document.createElement('span'); a.id = 'r1';
  const b = document.createElement('span'); b.id = 'r2';
  new DOMCollection([child]).replaceWith(new DOMCollection([a, b]));
  const ids = Array.from(parent.children).map(c => c.id);
  if (ids.join(',') !== 'r1,r2') throw new Error('Expected two nodes after replaceWith');
});

test('wrap wraps element with provided wrapper', () => {
  const parent = document.createElement('div');
  const child = document.createElement('span'); child.id = 'x';
  parent.appendChild(child);
  $(child).wrap('<div class="wrap"></div>');
  const wrapped = parent.querySelector('.wrap');
  if (!wrapped) throw new Error('Wrapper not found');
  if (wrapped.firstElementChild?.id !== 'x') throw new Error('Element not inside wrapper');
});

test('unwrap removes parent wrapper and keeps children', () => {
  const parent = document.createElement('div');
  const child = document.createElement('span'); child.id = 'x';
  parent.appendChild(child);
  $(child).wrap('<div class="wrap"></div>');
  const wrapper = parent.querySelector('.wrap');
  if (!wrapper) throw new Error('Wrapper not created for unwrap test');
  $(child).unwrap();
  if (parent.querySelector('.wrap')) throw new Error('Wrapper still present after unwrap');
  if (parent.firstElementChild?.id !== 'x') throw new Error('Child not preserved after unwrap');
});

test('insertAfter inserts collection after each target (clones for all but last)', () => {
  const a = document.createElement('div'); a.id = 'a';
  const b = document.createElement('div'); b.id = 'b';
  const c = document.createElement('div'); c.id = 'c';
  const root = document.createElement('div');
  root.append(a, b, c);
  const badge = document.createElement('span'); badge.className = 'badge';
  new DOMCollection([badge]).insertAfter(new DOMCollection([a, b, c]));
  const badgesAfterIds = Array.from(root.querySelectorAll('.badge')).map(x => x.previousElementSibling?.id).join(',');
  if (badgesAfterIds !== 'a,b,c') throw new Error('insertAfter did not place clones after each target');
});

test('insertBefore inserts collection before each target (clones for all but last)', () => {
  const a = document.createElement('div'); a.id = 'a';
  const b = document.createElement('div'); b.id = 'b';
  const c = document.createElement('div'); c.id = 'c';
  const root = document.createElement('div');
  root.append(a, b, c);
  const badge = document.createElement('span'); badge.className = 'badge';
  new DOMCollection([badge]).insertBefore(new DOMCollection([a, b, c]));
  const badgesBeforeIds = Array.from(root.querySelectorAll('.badge')).map(x => x.nextElementSibling?.id).join(',');
  if (badgesBeforeIds !== 'a,b,c') throw new Error('insertBefore did not place clones before each target');
});

test('replaceAll replaces targets with current collection (clones for all but last)', () => {
  const root = document.createElement('div');
  const t1 = document.createElement('i'); t1.id = 't1';
  const t2 = document.createElement('i'); t2.id = 't2';
  root.append(t1, t2);
  const a = document.createElement('span'); a.id = 'n1';
  const b = document.createElement('span'); b.id = 'n2';
  new DOMCollection([a, b]).replaceAll(new DOMCollection([t1, t2]));
  const ids = Array.from(root.children).map(x => x.id).join(',');
  if (ids !== 'n1,n2,n1,n2') throw new Error('replaceAll did not replace each target with clones of collection');
});

test('wrapAll wraps entire set with a single wrapper, appending to deepest descendant', () => {
  const root = document.createElement('div');
  const a = document.createElement('div'); a.id = 'wa1';
  const b = document.createElement('div'); b.id = 'wa2';
  root.append(a, b);
  new DOMCollection([a, b]).wrapAll('<section class="wrap-all"><div class="inner"></div></section>');
  const wrapper = root.querySelector('section.wrap-all');
  if (!wrapper) throw new Error('wrapAll wrapper not found');
  const inner = wrapper.querySelector('.inner');
  if (!inner) throw new Error('wrapAll inner not found');
  const ids = Array.from(inner.children).map(x => x.id).join(',');
  if (ids !== 'wa1,wa2') throw new Error('wrapAll did not move elements into deepest descendant in order');
});

test('wrapInner wraps the contents of each element', () => {
  const a = document.createElement('div'); a.id = 'wi1'; a.innerHTML = '<span>A</span><em>B</em>';
  const b = document.createElement('div'); b.id = 'wi2'; b.innerHTML = '<i>C</i>';
  new DOMCollection([a, b]).wrapInner('<div class="inner"></div>');
  const ai = a.querySelector('.inner');
  const bi = b.querySelector('.inner');
  if (!ai || !bi) throw new Error('wrapInner did not insert wrapper');
  if (ai.children.length !== 2 || bi.children.length !== 1) throw new Error('wrapInner did not move children');
});

test('detach removes nodes but preserves event listeners on the nodes', () => {
  const el = document.createElement('button');
  const parent = document.createElement('div');
  parent.appendChild(el);
  let count = 0;
  el.addEventListener('click', () => count++);
  $(el).detach();
  // Not in DOM
  if (parent.contains(el)) throw new Error('Element still in DOM after detach');
  // Dispatch event directly to node to verify listener still attached
  el.dispatchEvent(new dom.window.Event('click'));
  if (count !== 1) throw new Error('Event listener lost after detach');
});

console.log(`\n📊 DOM Manipulation Test Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
