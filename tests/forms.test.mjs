import { test, expect } from 'vitest'
import { serializeForm, toFormData, toQueryString, setForm, resetForm, validateForm, isValid, onSubmit } from '../dist/forms.js'

// Ensure CSS.escape exists when building attribute selectors
if (!globalThis.CSS) (globalThis).CSS = {}
if (!globalThis.CSS.escape) (globalThis.CSS).escape = (s) => String(s)

test('serializeForm handles text, arrays, nested, multi-select, files', () => {
  document.body.innerHTML = `
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
  `
  const data = serializeForm('#f')
  expect(data.user.name).toBe('Alice')
  expect(data.tags).toEqual(['a', 'b'])
  expect(data.roles).toEqual(['admin', 'user'])
  expect(data.avatar).toBeInstanceOf(File)
})

test('setForm populates inputs including radios and checkboxes', () => {
  document.body.innerHTML = `
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
  `
  setForm('#f', {
    user: { name: 'Bob' },
    color: 'blue',
    flags: ['a'],
    enabled: true,
    roles: ['user']
  })
  const f = document.getElementById('f')
  expect(f.querySelector('[name="user[name]"]').value).toBe('Bob')
  expect(f.querySelector('[value="blue"]').checked).toBe(true)
  expect(f.querySelector('[value="red"]').checked).toBe(false)
  const flags = f.querySelectorAll('input[name="flags[]"]')
  expect(flags[0].checked).toBe(true)
  expect(flags[1].checked).toBe(false)
  expect(f.querySelector('input[name="enabled"]').checked).toBe(true)
  const roles = f.querySelector('select[name="roles[]"]')
  const selected = Array.from(roles.selectedOptions).map(o => o.value)
  expect(selected).toEqual(['user'])
})

test('resetForm resets to defaults', () => {
  document.body.innerHTML = `
    <form id="f">
      <input name="a" value="x" />
      <input name="b" />
    </form>
  `
  const a = document.querySelector('[name="a"]')
  const b = document.querySelector('[name="b"]')
  a.value = 'changed'
  b.value = 'y'
  resetForm('#f')
  expect(a.value).toBe('x')
  expect(b.value).toBe('')
})

test('validateForm and isValid report HTML5 constraints', () => {
  document.body.innerHTML = `
    <form id="f">
      <input name="email" type="email" required value="not-an-email" />
      <input name="age" type="number" min="18" value="16" />
    </form>
  `
  const res = validateForm('#f')
  expect(res.valid).toBe(false)
  const emailErr = res.errors.find(e => e.name === 'email')
  const ageErr = res.errors.find(e => e.name === 'age')
  expect(emailErr?.types).toContain('typeMismatch')
  expect(ageErr?.types).toContain('rangeUnderflow')
  expect(isValid('#f')).toBe(false)

  // Fix values and re-check
  document.querySelector('[name="email"]').value = 'a@b.com'
  document.querySelector('[name="age"]').value = '21'
  const res2 = validateForm('#f')
  expect(res2.valid).toBe(true)
  expect(isValid('#f')).toBe(true)
})

test('toFormData and toQueryString serialize nested and arrays', () => {
  const obj = { user: { name: 'Alice' }, tags: ['a', 'b'], empty: null }
  const fd = toFormData(obj)
  const got = Array.from(fd.entries()).map(([k, v]) => [k, typeof v === 'string' ? v : (v && v.name) || 'obj'])
  expect(got).toEqual([
    ['user[name]', 'Alice'],
    ['tags[]', 'a'],
    ['tags[]', 'b']
  ])

  const qs = toQueryString(obj)
  expect(qs).toContain('user%5Bname%5D=Alice')
  expect(qs).toContain('tags%5B%5D=a')
  expect(qs).toContain('tags%5B%5D=b')
})

test('onSubmit prevents default and passes serialized data', () => {
  document.body.innerHTML = `
    <form id="f">
      <input name="name" value="Zoe" />
    </form>
  `
  let received = null
  onSubmit('#f', (data, ev) => {
    received = data
    expect(ev.defaultPrevented).toBe(true)
  })
  const form = document.getElementById('f')
  const ev = new window.SubmitEvent('submit', { bubbles: true, cancelable: true })
  form.dispatchEvent(ev)
  expect(received).toEqual({ name: 'Zoe' })
})

