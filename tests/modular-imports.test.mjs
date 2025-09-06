import { test, expect } from 'vitest';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, '..', 'dist');

test('Core import', async () => {
  const { default: dom } = await import(join(distPath, 'core.js'));
  expect(typeof dom).toBe('function');
});

test('HTTP import', async () => {
  const { http } = await import(join(distPath, 'http.js'));
  expect(typeof http).toBe('object');
  expect(typeof http.get).toBe('function');
  expect(typeof http.post).toBe('function');
});

test('Template import', async () => {
  const { renderTemplate, useTemplate, tpl } = await import(join(distPath, 'template.js'));
  expect(typeof renderTemplate).toBe('function');
  expect(typeof useTemplate).toBe('function');
  expect(typeof tpl).toBe('function');
});

test('Forms import', async () => {
  const { serializeForm, toQueryString, onSubmit } = await import(join(distPath, 'forms.js'));
  expect(typeof serializeForm).toBe('function');
  expect(typeof toQueryString).toBe('function');
  expect(typeof onSubmit).toBe('function');
});

test('Motion import', async () => {
  const { animate, animations } = await import(join(distPath, 'motion.js'));
  expect(typeof animate).toBe('function');
  expect(typeof animations).toBe('object');
  expect(typeof animations.fadeIn).toBe('function');
});

test('Full bundle import', async () => {
  const module = await import(join(distPath, 'index.js'));
  const dom = module.default;
  const { http, renderTemplate, serializeForm, animate } = module;
  expect(typeof dom).toBe('function');
  expect(typeof http).toBe('object');
  expect(typeof renderTemplate).toBe('function');
  expect(typeof serializeForm).toBe('function');
  expect(typeof animate).toBe('function');
});

test('Mixed modular usage (Core + HTTP)', async () => {
  const { default: dom } = await import(join(distPath, 'core.js'));
  const { http } = await import(join(distPath, 'http.js'));
  expect(typeof dom).toBe('function');
  expect(typeof http.get).toBe('function');
});
