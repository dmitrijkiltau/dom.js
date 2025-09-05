#!/usr/bin/env node

import { JSDOM } from 'jsdom';
import api from '../dist/index.js';

console.log('\n🧪 Testing trigger() init options (EventInit | CustomEventInit)...');

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
const dom = new JSDOM('<!doctype html><html><body><div id="root"><button id="btn"></button></div></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.Element = dom.window.Element;
global.HTMLElement = dom.window.HTMLElement;

test('trigger() with detail uses CustomEvent and bubbles by default', () => {
  const btn = document.getElementById('btn');
  const root = document.getElementById('root');
  let receivedDetail;
  root.addEventListener('go', (e) => {
    receivedDetail = (e instanceof dom.window.CustomEvent) ? e.detail : undefined;
  });
  api(btn).trigger('go', { msg: 'ok' });
  if (!receivedDetail || receivedDetail.msg !== 'ok') throw new Error('CustomEvent detail not received at parent');
});

test('trigger() honors cancelable option for EventInit', () => {
  const btn = document.getElementById('btn');
  let prevented = false;
  btn.addEventListener('save', (e) => {
    e.preventDefault();
    prevented = e.defaultPrevented;
  });
  api(btn).trigger('save', { cancelable: true });
  if (!prevented) throw new Error('Expected defaultPrevented when cancelable: true and preventDefault() called');
});

test('trigger() accepts CustomEventInit directly', () => {
  const btn = document.getElementById('btn');
  let got = null;
  btn.addEventListener('hello', (e) => {
    got = e.detail;
  });
  api(btn).trigger('hello', { detail: 42, bubbles: false });
  if (got !== 42) throw new Error('Expected detail to be 42');
});

console.log(`\n📊 trigger() tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
