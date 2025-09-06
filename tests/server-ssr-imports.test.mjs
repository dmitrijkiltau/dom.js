import { test, expect } from 'vitest';

test('SSR entry default export provides stubs and utils', async () => {
  const server = await import('../dist/server.js');
  const api = server.default;
  expect(typeof api).toBe('function');
  // http exists
  expect(typeof api.http).toBe('object');
  // utils exist
  expect(typeof api.debounce).toBe('function');
  expect(typeof api.rafThrottle).toBe('function');

  // DOMCollection stubs
  const empty = api();
  const p = empty.fadeIn();
  expect(p instanceof Promise).toBe(true);
  expect(empty.scrollIntoView()).toBe(empty);
});

test('SSR entry methods: fromHTML returns empty, create throws', async () => {
  const { default: api } = await import('../dist/server.js');
  const col = api.fromHTML('<div></div>');
  // We don’t have a length API here, but ensure chain returns a collection and does not throw
  expect(typeof col).toBe('object');
  let threw = false;
  try { api.create('div'); } catch { threw = true; }
  expect(threw).toBe(true);
});

