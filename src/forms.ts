import type { DOMCollection } from './collection';

export type Formish = HTMLFormElement | DOMCollection | string | null | undefined;

function resolveForm(input: Formish): HTMLFormElement {
  if (!input) throw new Error('Form not provided');
  // Direct form element
  if (typeof HTMLFormElement !== 'undefined' && input instanceof HTMLFormElement) {
    return input as HTMLFormElement;
  }
  if (typeof input === 'string') {
    const el = document.querySelector(input);
    if (!el) throw new Error(`Form not found: ${input}`);
    if (!(el instanceof HTMLFormElement)) throw new Error('Selector did not resolve to <form>');
    return el;
  }
  // DOMCollection-like (has .elements list)
  if (typeof input === 'object' && input != null && 'elements' in (input as any)) {
    const el = (input as any).elements?.[0];
    if (!el) throw new Error('Empty collection');
    if (!(el instanceof HTMLFormElement)) throw new Error('Collection[0] is not a <form>');
    return el as HTMLFormElement;
  }
  return input as HTMLFormElement;
}

type Entry = [string, any];

// ——— Name parsing utilities ———
function parseName(name: string): Array<{ key?: string; index?: number; push?: boolean }> {
  // Supports: user[name], user[address][street], arr[], items[0]
  const out: Array<{ key?: string; index?: number; push?: boolean }> = [];
  const re = /\[([^\]]*)\]/g;
  const firstBracket = name.indexOf('[');
  if (firstBracket === -1) return [{ key: name }];
  const root = name.slice(0, firstBracket);
  if (root) out.push({ key: root });
  let m: RegExpExecArray | null;
  while ((m = re.exec(name))) {
    const seg = m[1] ?? '';
    if (seg === '') out.push({ push: true });
    else if (/^\d+$/.test(seg)) out.push({ index: parseInt(seg, 10) });
    else out.push({ key: seg });
  }
  return out.length ? out : [{ key: name }];
}

function setNested(target: any, name: string, value: any) {
  const tokens = parseName(name);
  let obj = target;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]!;
    const last = i === tokens.length - 1;

    if (t.key != null) {
      if (last) {
        if (obj[t.key] === undefined) obj[t.key] = value;
        else if (Array.isArray(obj[t.key])) obj[t.key].push(value);
        else obj[t.key] = [obj[t.key], value];
      } else {
        const nxt = tokens[i + 1];
        if (nxt?.push || typeof nxt?.index === 'number') {
          if (!Array.isArray(obj[t.key])) obj[t.key] = [];
        } else {
          if (obj[t.key] == null || typeof obj[t.key] !== 'object' || Array.isArray(obj[t.key])) obj[t.key] = {};
        }
        obj = obj[t.key];
      }
      continue;
    }
    if (t.push) {
      if (!Array.isArray(obj)) {
        // Convert to array if not already
        const tmp = [] as any[];
        if (obj != null && typeof obj === 'object' && Object.keys(obj).length) tmp.push(obj);
        obj = tmp;
      }
      if (last) {
        obj.push(value);
        return;
      }
      // Push an object placeholder for further nesting
      const nxt = tokens[i + 1];
      const placeholder = (nxt && (nxt.key != null)) ? {} : (nxt && typeof nxt.index === 'number') ? [] : {};
      obj.push(placeholder);
      obj = obj[obj.length - 1];
      continue;
    }
    if (typeof t.index === 'number') {
      if (!Array.isArray(obj)) obj = (tokens[i - 1] && (tokens[i - 1] as any).key != null)
        ? (obj[(tokens[i - 1] as any).key] = [])
        : [];
      if (last) {
        obj[t.index] = value;
        return;
      }
      if (obj[t.index] == null) obj[t.index] = {};
      obj = obj[t.index];
    }
  }
}

// ——— Entry collection ———
function isSuccessfulControl(el: Element): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)) return false as any;
  const anyEl = el as any;
  if (!el.name) return false;
  if (el.disabled) return false;
  // Skip buttons by default
  if (el instanceof HTMLInputElement) {
    const type = (el.type || '').toLowerCase();
    if (type === 'submit' || type === 'button' || type === 'image' || type === 'reset') return false;
    if ((type === 'checkbox' || type === 'radio') && !el.checked) return false;
  }
  // Skip elements inside disabled fieldset
  let p: Element | null = el;
  while ((p = p.parentElement)) {
    if (p instanceof HTMLFieldSetElement && (p as HTMLFieldSetElement).disabled) return false;
  }
  return true;
}

function entriesFromElements(elements: ArrayLike<Element>): Entry[] {
  const entries: Entry[] = [];
  for (const el of Array.from(elements)) {
    if (!isSuccessfulControl(el)) continue;
    const name = el.name;
    if (el instanceof HTMLSelectElement) {
      if (el.multiple) {
        for (const opt of Array.from(el.selectedOptions)) entries.push([name, opt.value]);
      } else {
        entries.push([name, el.value]);
      }
      continue;
    }
    if (el instanceof HTMLInputElement && el.type === 'file') {
      const files = el.files ? Array.from(el.files) : [];
      if (files.length === 0) entries.push([name, new File([], '')]);
      else files.forEach(f => entries.push([name, f]));
      continue;
    }
    entries.push([name, (el as HTMLInputElement | HTMLTextAreaElement).value]);
  }
  return entries;
}

function buildObjectFromEntries(entries: Entry[]): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of entries) setNested(out, k, v);
  return out;
}

// ——— Public API ———
export function serializeForm<T extends Record<string, any> = Record<string, any>>(form: Formish): T {
  const el = resolveForm(form);
  // Use real FormData to respect browser rules, then convert
  const fd = new FormData(el);
  const entries: Entry[] = [];
  for (const [k, v] of (fd as any).entries()) entries.push([k, v]);
  return buildObjectFromEntries(entries) as unknown as T;
}

export function toFormData(obj: Record<string, any>): FormData {
  const fd = new FormData();
  const append = (key: string, value: any) => {
    if (value == null) return;
    // Preserve File/Blob
    if (value instanceof Blob || value instanceof File) fd.append(key, value);
    else fd.append(key, String(value));
  };
  const walk = (prefix: string, value: any) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach(v => walk(prefix + '[]', v));
      return;
    }
    if (value instanceof Date) {
      append(prefix, value.toISOString());
      return;
    }
    if (typeof value === 'object' && !(value instanceof Blob) && !(value instanceof File)) {
      for (const [k, v] of Object.entries(value)) walk(prefix ? `${prefix}[${k}]` : k, v);
      return;
    }
    append(prefix, value);
  };
  for (const [k, v] of Object.entries(obj)) walk(k, v);
  return fd;
}

export function toQueryString(obj: Record<string, any>): string {
  const usp = new URLSearchParams();
  const add = (key: string, value: any) => {
    if (value == null) return;
    usp.append(key, String(value));
  };
  const walk = (prefix: string, value: any) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach(v => walk(prefix + '[]', v));
      return;
    }
    if (typeof value === 'object' && !(value instanceof Blob) && !(value instanceof File)) {
      for (const [k, v] of Object.entries(value)) walk(prefix ? `${prefix}[${k}]` : k, v);
      return;
    }
    add(prefix, value);
  };
  for (const [k, v] of Object.entries(obj)) walk(k, v);
  return usp.toString();
}

export function onSubmit<T extends Record<string, any> = Record<string, any>>(form: Formish, handler: (data: T, ev: SubmitEvent) => void | Promise<void>) {
  const el = resolveForm(form);
  el.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const data = serializeForm<T>(el);
    await handler(data, ev);
  });
}

// ——— Set/reset helpers ———
export function setForm(form: Formish, values: Record<string, any>) {
  const el = resolveForm(form);
  // Flatten values into name->values[] pairs using toFormData traversal without FormData
  const pairs: Entry[] = [];
  const walk = (prefix: string, value: any) => {
    if (value == null) return;
    if (Array.isArray(value)) { value.forEach(v => walk(prefix + '[]', v)); return; }
    if (typeof value === 'object' && !(value instanceof Blob) && !(value instanceof File)) {
      for (const [k, v] of Object.entries(value)) walk(prefix ? `${prefix}[${k}]` : k, v);
      return;
    }
    pairs.push([prefix, value]);
  };
  for (const [k, v] of Object.entries(values)) walk(k, v);

  // Group by name
  const byName: Record<string, any[]> = {};
  for (const [k, v] of pairs) { if (!byName[k]) byName[k] = []; byName[k].push(v); }

  const controls = el.querySelectorAll('[name]') as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
  for (const ctl of Array.from(controls)) {
    const name = ctl.name;
    if (!name) continue;
    const valuesForName = byName[name];
    if (!valuesForName) continue;

    if (ctl instanceof HTMLSelectElement) {
      const isMultiple = ctl.multiple;
      const wanted = new Set(valuesForName.map(v => String(v)));
      for (const opt of Array.from(ctl.options)) {
        opt.selected = isMultiple ? wanted.has(opt.value) : wanted.has(opt.value);
      }
      continue;
    }
    if (ctl instanceof HTMLInputElement && ctl.type === 'radio') {
      const wanted = String(valuesForName[0]);
      const group = el.querySelectorAll(`input[type="radio"][name="${CSS.escape(name)}"]`) as NodeListOf<HTMLInputElement>;
      for (const r of Array.from(group)) r.checked = (r.value === wanted);
      continue;
    }
    if (ctl instanceof HTMLInputElement && ctl.type === 'checkbox') {
      // If multiple checkboxes share the same name, use array values
      const group = el.querySelectorAll(`input[type="checkbox"][name="${CSS.escape(name)}"]`) as NodeListOf<HTMLInputElement>;
      if (group.length > 1) {
        const wantedSet = new Set(valuesForName.map(v => String(v)));
        for (const cb of Array.from(group)) cb.checked = wantedSet.has(cb.value);
      } else {
        const v0 = valuesForName[0];
        if (typeof v0 === 'boolean') (ctl as HTMLInputElement).checked = v0;
        else (ctl as HTMLInputElement).checked = v0 != null;
      }
      continue;
    }
    // Text-like inputs and textarea
    (ctl as HTMLInputElement | HTMLTextAreaElement).value = String(valuesForName[0] ?? '');
  }
}

export function resetForm(form: Formish) {
  const el = resolveForm(form);
  el.reset();
}

// ——— Validation helpers ———
export type ValidationError = { name: string; element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement; message: string; types: string[] };

export function validateForm(form: Formish): { valid: boolean; errors: ValidationError[] } {
  const el = resolveForm(form);
  const controls = el.querySelectorAll('[name]') as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
  const errors: ValidationError[] = [];
  for (const ctl of Array.from(controls)) {
    if (!ctl.willValidate) continue;
    if (ctl.checkValidity()) continue;
    const v = (ctl as any).validity as ValidityState;
    const types: string[] = [];
    if (v.valueMissing) types.push('valueMissing');
    if (v.typeMismatch) types.push('typeMismatch');
    if (v.patternMismatch) types.push('patternMismatch');
    if (v.tooLong) types.push('tooLong');
    if (v.tooShort) types.push('tooShort');
    if (v.rangeUnderflow) types.push('rangeUnderflow');
    if (v.rangeOverflow) types.push('rangeOverflow');
    if (v.stepMismatch) types.push('stepMismatch');
    if (v.badInput) types.push('badInput');
    if (v.customError) types.push('customError');
    errors.push({ name: ctl.name, element: ctl, message: ctl.validationMessage, types });
  }
  return { valid: errors.length === 0, errors };
}

export function isValid(form: Formish): boolean {
  const el = resolveForm(form);
  return el.checkValidity();
}
