import { test } from 'vitest';
import { JSDOM } from 'jsdom';
import api, { DOMCollection } from '../dist/index.js';

// Setup DOM
const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.Element = dom.window.Element;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLTemplateElement = dom.window.HTMLTemplateElement;
global.Node = dom.window.Node;

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

test('html can accept a function (el, i) to compute content per node', () => {
  const a = document.createElement('div'); a.id = 'hcb-a'; a.innerHTML = 'old';
  const b = document.createElement('div'); b.id = 'hcb-b'; b.innerHTML = 'old';
  new DOMCollection([a, b]).html((el, i) => {
    if (i === 0) return '<u id="u1">U1</u>';
    const n = document.createElement('strong');
    n.id = 'n1'; n.textContent = 'N1';
    return n;
  });
  if (a.firstElementChild?.id !== 'u1') throw new Error('html(fn) did not set HTML string for first');
  if (b.firstElementChild?.id !== 'n1') throw new Error('html(fn) did not set Node for second');
});

test('prependTo inserts collection at the beginning of target', () => {
  const ul = document.createElement('ul');
  const old = document.createElement('li'); old.id = 'old';
  ul.appendChild(old);
  const li = document.createElement('li'); li.id = 'new';
  new DOMCollection([li]).prependTo(ul);
  if (ul.firstElementChild?.id !== 'new') throw new Error('Expected collection to be prepended to target');
});

test('appendTo accepts selector string and clones for multiple targets', () => {
  const root = document.createElement('div');
  const c1 = document.createElement('div'); c1.className = 'multi';
  const c2 = document.createElement('div'); c2.className = 'multi';
  root.append(c1, c2);
  document.body.appendChild(root);
  const a = document.createElement('span');
  const b = document.createElement('span');
  new DOMCollection([a, b]).appendTo('.multi');
  if (c1.children.length !== 2 || c2.children.length !== 2) throw new Error('appendTo did not append to all matched selectors with cloning');
  root.remove();
});

test('prependTo accepts selector string and clones for multiple targets', () => {
  const root = document.createElement('div');
  const c1 = document.createElement('div'); c1.className = 'multi2';
  const c2 = document.createElement('div'); c2.className = 'multi2';
  c1.innerHTML = '<i>old</i>';
  c2.innerHTML = '<i>old</i>';
  root.append(c1, c2);
  document.body.appendChild(root);
  const a = document.createElement('b'); a.id = 'p1';
  const b = document.createElement('b'); b.id = 'p2';
  new DOMCollection([a, b]).prependTo('.multi2');
  if (c1.firstElementChild?.tagName !== 'B' || c2.firstElementChild?.tagName !== 'B') throw new Error('prependTo did not prepend to all matched selectors with cloning');
  root.remove();
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

test('wrap supports selector string (clones wrapper prototype)', () => {
  // Prepare a wrapper prototype in the DOM
  const proto = document.createElement('div');
  proto.id = 'wrap-proto';
  proto.className = 'wrap-proto';
  proto.innerHTML = '<div class="inner"></div>';
  document.body.appendChild(proto);

  const parent = document.createElement('div');
  const child = document.createElement('span'); child.id = 'wx';
  parent.appendChild(child);
  $(child).wrap('#wrap-proto');
  const wrapped = parent.querySelector('.wrap-proto');
  if (!wrapped) throw new Error('Selector wrapper not applied');
  if (wrapped.firstElementChild?.className !== 'inner') throw new Error('Deepest descendant not present from prototype');
  if (wrapped.firstElementChild?.firstElementChild?.id !== 'wx') throw new Error('Child not moved into wrapper');
  // Ensure original prototype remains in DOM
  if (!document.getElementById('wrap-proto')) throw new Error('Original wrapper prototype should not be moved');
  proto.remove();
});

test('wrapAll supports selector string for wrapper', () => {
  const proto = document.createElement('section');
  proto.id = 'wrapall-proto';
  proto.innerHTML = '<div class="inner"></div>';
  document.body.appendChild(proto);

  const root = document.createElement('div');
  const a = document.createElement('div'); a.id = 'wsa';
  const b = document.createElement('div'); b.id = 'wsb';
  root.append(a, b);
  new DOMCollection([a, b]).wrapAll('#wrapall-proto');
  const wrapper = root.querySelector('section#wrapall-proto');
  if (!wrapper) throw new Error('wrapAll selector wrapper not applied');
  const inner = wrapper.querySelector('.inner');
  const ids = Array.from(inner.children).map(x => x.id).join(',');
  if (ids !== 'wsa,wsb') throw new Error('wrapAll selector wrapper did not collect all elements');
  // Prototype remains
  if (!document.getElementById('wrapall-proto')) throw new Error('Original wrapAll prototype removed unexpectedly');
  proto.remove();
});

test('wrapInner supports selector string for wrapper', () => {
  const proto = document.createElement('div');
  proto.id = 'wrapinner-proto';
  proto.className = 'inner-wrap';
  document.body.appendChild(proto);

  const a = document.createElement('div'); a.id = 'wia'; a.innerHTML = '<em>1</em><em>2</em>';
  const b = document.createElement('div'); b.id = 'wib'; b.innerHTML = '<em>3</em>';
  new DOMCollection([a, b]).wrapInner('#wrapinner-proto');
  if (!a.querySelector('.inner-wrap') || !b.querySelector('.inner-wrap')) throw new Error('wrapInner selector wrapper not applied');
  if (a.querySelector('.inner-wrap')?.children.length !== 2) throw new Error('wrapInner did not move children for first');
  if (b.querySelector('.inner-wrap')?.children.length !== 1) throw new Error('wrapInner did not move children for second');
  // Prototype remains
  if (!document.getElementById('wrapinner-proto')) throw new Error('Original wrapInner prototype removed unexpectedly');
  proto.remove();
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

test('insertAfter accepts selector string and clones for multiple targets', () => {
  const root = document.createElement('div');
  root.innerHTML = '<div class="tgt" id="s1"></div><div class="tgt" id="s2"></div>';
  document.body.appendChild(root);
  const n = document.createElement('span'); n.className = 'ins';
  new DOMCollection([n]).insertAfter('.tgt');
  const order = Array.from(root.children).map(x => x.className || x.id).join(',');
  if (order !== 'tgt,ins,tgt,ins') throw new Error('insertAfter(selector) did not insert correctly');
  root.remove();
});

test('insertBefore accepts selector string and clones for multiple targets', () => {
  const root = document.createElement('div');
  root.innerHTML = '<div class="tgt2" id="b1"></div><div class="tgt2" id="b2"></div>';
  document.body.appendChild(root);
  const n = document.createElement('span'); n.className = 'ins2';
  new DOMCollection([n]).insertBefore('.tgt2');
  const order = Array.from(root.children).map(x => x.className || x.id).join(',');
  if (order !== 'ins2,tgt2,ins2,tgt2') throw new Error('insertBefore(selector) did not insert correctly');
  root.remove();
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

// Summary handled by Vitest
