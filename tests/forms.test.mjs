import { test, expect } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup JSDOM for each test group
const setupDom = (html) => {
  const dom = new JSDOM(`<!doctype html><html><body>${html || ''}</body></html>`);
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.HTMLFormElement = dom.window.HTMLFormElement;
  global.HTMLInputElement = dom.window.HTMLInputElement;
  global.HTMLSelectElement = dom.window.HTMLSelectElement;
  global.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
  global.HTMLTemplateElement = dom.window.HTMLTemplateElement;
  global.File = dom.window.File;
  global.FormData = dom.window.FormData;
  global.CSS = dom.window.CSS || {};
  // Identity escape to work with attribute selectors like [name="flags[]"]
  global.CSS.escape = (s) => String(s);
  return dom;
};

test('serializeForm handles text, arrays, nested, multi-select, files', async () => {
  setupDom(`
    <form id="f">
      <input name="user[name]" value="Alice" />
      <input name="tags[]" value="a" />
      <input name="tags[]" value="b" />
      <select name="roles[]" multiple>
        <option value="admin" selected>admin</option>
        <option value="user" selected>user</option>
        <option value="guest">guest</option>
      </select>
      <input type="file" name="avatar" />
    </form>
  `);
  expect('HTMLFormElement' in globalThis).toBe(true);
  const { serializeForm } = await import('../dist/forms.js');
  const data = serializeForm('#f');
  expect(data.user.name).toBe('Alice');
  expect(data.tags).toEqual(['a', 'b']);
  expect(data.roles).toEqual(['admin', 'user']);
  // File inputs with no files produce a File placeholder
  expect(data.avatar).toBeInstanceOf(File);
});

test('setForm populates inputs including radios and checkboxes', async () => {
  setupDom(`
    <form id="f">
      <input name="user[name]" />
      <input type="radio" name="color" value="red" />
      <input type="radio" name="color" value="blue" />
      <input type="checkbox" name="flags[]" value="a" />
      <input type="checkbox" name="flags[]" value="b" />
      <input type="checkbox" name="enabled" />
      <select name="roles[]" multiple>
        <option value="admin">admin</option>
        <option value="user">user</option>
      </select>
    </form>
  `);
  const { setForm } = await import('../dist/forms.js');
  setForm('#f', {
    user: { name: 'Bob' },
    color: 'blue',
    flags: ['a'],
    enabled: true,
    roles: ['user']
  });
  const f = document.getElementById('f');
  expect(f.querySelector('[name="user[name]"]').value).toBe('Bob');
  expect(f.querySelector('[value="blue"]').checked).toBe(true);
  expect(f.querySelector('[value="red"]').checked).toBe(false);
  const flags = f.querySelectorAll('input[name="flags[]"]');
  expect(flags[0].checked).toBe(true);
  expect(flags[1].checked).toBe(false);
  expect(f.querySelector('input[name="enabled"]').checked).toBe(true);
  const roles = f.querySelector('select[name="roles[]"]');
  const selected = Array.from(roles.selectedOptions).map(o => o.value);
  expect(selected).toEqual(['user']);
});

test('resetForm resets to defaults', async () => {
  setupDom(`
    <form id="f">
      <input name="a" value="x" />
      <input name="b" />
    </form>
  `);
  const a = document.querySelector('[name="a"]');
  const b = document.querySelector('[name="b"]');
  a.value = 'changed';
  b.value = 'y';
  const { resetForm } = await import('../dist/forms.js');
  resetForm('#f');
  expect(a.value).toBe('x');
  expect(b.value).toBe('');
});

test('validateForm and isValid report HTML5 constraints', async () => {
  const dom = setupDom(`
    <form id="f">
      <input name="email" type="email" required value="not-an-email" />
      <input name="age" type="number" min="18" value="16" />
    </form>
  `);
  const { validateForm, isValid } = await import('../dist/forms.js');
  const res = validateForm('#f');
  expect(res.valid).toBe(false);
  // Should include typeMismatch for email and rangeUnderflow for age
  const emailErr = res.errors.find(e => e.name === 'email');
  const ageErr = res.errors.find(e => e.name === 'age');
  expect(emailErr?.types).toContain('typeMismatch');
  expect(ageErr?.types).toContain('rangeUnderflow');
  expect(isValid('#f')).toBe(false);

  // Fix values and re-check
  dom.window.document.querySelector('[name="email"]').value = 'a@b.com';
  dom.window.document.querySelector('[name="age"]').value = '21';
  const res2 = validateForm('#f');
  expect(res2.valid).toBe(true);
  expect(isValid('#f')).toBe(true);
});

test('toFormData and toQueryString serialize nested and arrays', async () => {
  const { toFormData, toQueryString } = await import('../dist/forms.js');
  const obj = { user: { name: 'Alice' }, tags: ['a', 'b'], empty: null };
  const fd = toFormData(obj);
  // Read back values
  const got = Array.from(fd.entries()).map(([k, v]) => [k, typeof v === 'string' ? v : (v && v.name) || 'obj']);
  expect(got).toEqual([
    ['user[name]', 'Alice'],
    ['tags[]', 'a'],
    ['tags[]', 'b']
  ]);

  const qs = toQueryString(obj);
  expect(qs).toContain('user%5Bname%5D=Alice');
  expect(qs).toContain('tags%5B%5D=a');
  expect(qs).toContain('tags%5B%5D=b');
});

test('onSubmit prevents default and passes serialized data', async () => {
  setupDom(`
    <form id="f">
      <input name="name" value="Zoe" />
    </form>
  `);
  const form = document.getElementById('f');
  let received = null;
  const { onSubmit } = await import('../dist/forms.js');
  onSubmit('#f', async (data, ev) => {
    received = data;
    expect(ev.defaultPrevented).toBe(true);
  });
  const ev = new window.SubmitEvent('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(ev);
  expect(received).toEqual({ name: 'Zoe' });
});
