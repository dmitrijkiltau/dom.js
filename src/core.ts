import { MaybeArray, Selector, EventTargetish } from './types';
import { isString, isElement, isDocument, isWindow } from './utils';
import { DOMCollection } from './collection';
import { use, type Plugin } from './plugins';

// ——— Core selector ———
export function dom(input?: Selector): DOMCollection {
  if (!input) return new DOMCollection([]);
  if (isString(input)) return new DOMCollection(document.querySelectorAll(input));
  if (isElement(input)) return new DOMCollection([input]);
  if (input instanceof NodeList || Array.isArray(input)) return new DOMCollection(input as any);
  if (isDocument(input)) return new DOMCollection([input.documentElement]);
  if (isWindow(input)) return new DOMCollection([input.document.documentElement]);
  return new DOMCollection([]);
}

// ——— Element creation ———
export function create(tag: string, attrs?: Record<string, any> | null, children?: MaybeArray<string | Node | DOMCollection>): Element {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) setAttr(el, k, v);
  if (children) appendChildren(el, children);
  return el;
}

// ——— Event helpers ———
export function on(target: EventTargetish | DOMCollection, type: string, handler: (ev: Event) => void): void {
  const list = target instanceof DOMCollection ? target.elements : [target as any];
  list.forEach(t => (t as any).addEventListener(type, handler));
}

export function once(target: EventTargetish | DOMCollection, type: string, handler: (ev: Event) => void): void {
  const list = target instanceof DOMCollection ? target.elements : [target as any];
  list.forEach(t => {
    const onceHandler = (ev: Event) => {
      handler(ev);
      (t as any).removeEventListener(type, onceHandler);
    };
    (t as any).addEventListener(type, onceHandler);
  });
}

export function off(target: EventTargetish | DOMCollection, type: string, handler: (ev: Event) => void, options?: boolean | EventListenerOptions): void {
  const list = target instanceof DOMCollection ? target.elements : [target as any];
  list.forEach(t => (t as any).removeEventListener(type, handler, options));
}

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

// ——— Core API (default export) ———
const api = Object.assign(function core(input?: Selector) { return dom(input); }, {
  dom, create, on, once, off,
  DOMCollection,
  use: (plugin: Plugin) => use(plugin, api)
});

// ——— Exports ———
export { DOMCollection, use };
export type { Plugin };
export default api as typeof dom & typeof api;