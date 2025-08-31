import { MaybeArray, Selector, EventTargetish } from './types';
import { isString, isElement, isDocument, isWindow } from './utils';
import { DOMCollection } from './collection';
import { renderTemplate, useTemplate, tpl, mountTemplate, escapeHTML, unsafeHTML } from './template';
import { serializeForm, toQueryString, onSubmit, toFormData, setForm, resetForm, validateForm, isValid } from './forms';
import { animate, animations, installAnimationMethods } from './motion';
import { http } from './http';
import { use, type Plugin } from './plugins';
import { onDirect, removeManaged, removeAllManaged, ready as domReady } from './events';

// ——— Core selector ———
export function dom(input?: Selector, context?: Element | Document | DOMCollection): DOMCollection {
  if (!input) return new DOMCollection([]);
  if (isString(input)) {
    const s = input.trim();
    if (s.startsWith('<') && s.endsWith('>')) return fromHTML(s);
    // Contextual selection
    if (!context) return new DOMCollection(document.querySelectorAll(s));
    if (context instanceof DOMCollection) {
      const found: Element[] = [] as any;
      for (const el of context.elements) found.push(...(el.querySelectorAll(s) as any));
      return new DOMCollection(found);
    }
    if (context instanceof Element) return new DOMCollection(context.querySelectorAll(s));
    return new DOMCollection((context as Document).querySelectorAll(s));
  }
  if (isElement(input)) return new DOMCollection([input]);
  if (input instanceof NodeList || Array.isArray(input)) return new DOMCollection(input as any);
  if (isDocument(input)) return new DOMCollection([input.documentElement]);
  if (isWindow(input)) return new DOMCollection([input.document.documentElement]);
  return new DOMCollection([]);
}

// ——— HTML string to elements ———
export function fromHTML(html: string): DOMCollection {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return new DOMCollection(Array.from(tpl.content.children) as any);
}

// ——— Element creation ———
export function create(tag: string, attrs?: Record<string, any> | null, children?: MaybeArray<string | Node | DOMCollection>): Element {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) setAttr(el, k, v);
  if (children) appendChildren(el, children);
  return el;
}

// ——— Event helpers ———
export function on(target: EventTargetish | DOMCollection, types: string, handler: (ev: Event) => void, options?: boolean | AddEventListenerOptions): () => void {
  const list = target instanceof DOMCollection ? target.elements : [target as any];
  const unbinders = list.map(t => onDirect(t as any, types, handler, options));
  return () => { for (const u of unbinders) u(); };
}

export function once(target: EventTargetish | DOMCollection, types: string, handler: (ev: Event) => void, options?: boolean | AddEventListenerOptions): () => void {
  const opts: AddEventListenerOptions = Object.assign({ once: true }, typeof options === 'object' ? options : {});
  return on(target, types, handler, opts);
}

export function off(target: EventTargetish | DOMCollection, types?: string, handler?: (ev: Event) => void): void {
  const list = target instanceof DOMCollection ? target.elements : [target as any];
  if (!types) {
    list.forEach(t => removeAllManaged(t as any));
    return;
  }
  list.forEach(t => removeManaged(t as any, types, handler as any));
}

export function ready(fn: () => void): void { domReady(fn); }

// ——— Helper functions ———
function setAttr(el: Element, key: string, value: any) {
  if (key === 'style' && typeof value === 'object') Object.assign((el as HTMLElement).style, value);
  else if (key in el) (el as any)[key] = value;
  else if (value === false || value == null) el.removeAttribute(key);
  else el.setAttribute(key, String(value));
}

function appendChildren(el: Element, kids: MaybeArray<string | Node | DOMCollection>) {
  for (const child of (Array.isArray(kids) ? kids : [kids])) {
    if (child == null) continue;
    if (typeof child === 'string') el.insertAdjacentHTML('beforeend', child);
    else if (child instanceof DOMCollection) child.elements.forEach(n => el.appendChild(n));
    else el.appendChild(child);
  }
}

// ——— API bag (default export) ———
const api = Object.assign(function core(input?: Selector, context?: Element | Document | DOMCollection) { return dom(input, context); }, {
  dom, fromHTML, create, on, once, off, ready, http,
  renderTemplate, useTemplate, tpl, mountTemplate, escapeHTML, unsafeHTML,
  serializeForm, toQueryString, onSubmit, toFormData, setForm, resetForm, validateForm, isValid,
  animate, animations,
  DOMCollection,
  use: (plugin: Plugin) => use(plugin, api)
});

// ——— Initialize animation methods ———
installAnimationMethods();

// ——— Exports ———
export { DOMCollection, renderTemplate, useTemplate, tpl, mountTemplate, escapeHTML, unsafeHTML, serializeForm, toQueryString, onSubmit, toFormData, setForm, resetForm, validateForm, isValid, animate, animations, http, use };
export type { Plugin };
export default api as typeof dom & typeof api;
