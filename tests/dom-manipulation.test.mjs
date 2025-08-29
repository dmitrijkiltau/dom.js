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

console.log(`\n📊 DOM Manipulation Test Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
