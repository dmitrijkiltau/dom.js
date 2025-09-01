import { MaybeArray, Selector, EventTargetish, Handler } from './types';
import { isString, isElement, isDocument, isWindow, debounce, throttle, nextTick, raf, rafThrottle, hasDOM } from './utils';
import { DOMCollection } from './collection';
import { renderTemplate, useTemplate, tpl, mountTemplate, escapeHTML, unsafeHTML } from './template';
import { serializeForm, toQueryString, onSubmit, toFormData, setForm, resetForm, validateForm, isValid } from './forms';
import { animate, animations, installAnimationMethods } from './motion';
import { http } from './http';
import { use } from './plugins';
import { onDirect, removeManaged, removeAllManaged, ready as domReady } from './events';
import { onIntersect, onResize, onMutation } from './observers';
import { scrollIntoView, scrollIntoViewIfNeeded } from './scroll';

// ——— Core selector ———
/**
 * Select DOM elements or create from HTML.
 *
 * - Accepts CSS selectors, Elements, NodeLists/arrays, Document or Window
 * - Optional `context` limits CSS selection scope
 * - Supports manual generic to type the resulting collection
 *
 * Examples:
 *  dom<HTMLButtonElement>('#save');
 *  dom('button');
 *  dom('<div class="x"></div>');
 */
export function dom<T extends Element = Element>(input?: Selector<T>, context?: Element | Document | DOMCollection): DOMCollection<T> {
  if (!input) return new DOMCollection([]);
  if (isString(input)) {
    const s = input.trim();
    if (s.startsWith('<') && s.endsWith('>')) return fromHTML(s) as unknown as DOMCollection<T>;
    // Contextual selection
    if (!context) return hasDOM() ? new DOMCollection(document.querySelectorAll(s) as any) : new DOMCollection([] as any);
    if (context instanceof DOMCollection) {
      const found: Element[] = [] as any;
      for (const el of context.elements) found.push(...(hasDOM() ? (el.querySelectorAll(s) as any) : []));
      return new DOMCollection(found) as unknown as DOMCollection<T>;
    }
    if (context instanceof Element) return hasDOM() ? new DOMCollection(context.querySelectorAll(s) as any) as unknown as DOMCollection<T> : new DOMCollection([] as any);
    return hasDOM() ? new DOMCollection((context as Document).querySelectorAll(s) as any) as unknown as DOMCollection<T> : new DOMCollection([] as any);
  }
  if (isElement(input)) return new DOMCollection([input as T]);
  if (input instanceof NodeList || Array.isArray(input)) return new DOMCollection(input as any);
  if (isDocument(input)) return new DOMCollection([input.documentElement as any]);
  if (isWindow(input)) return new DOMCollection([input.document.documentElement as any]);
  return new DOMCollection([]) as DOMCollection<T>;
}

// ——— HTML string to elements ———
export function fromHTML(html: string): DOMCollection {
  if (!hasDOM()) return new DOMCollection([]);
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return new DOMCollection(Array.from(tpl.content.children) as any);
}

// ——— Element creation ———
export function create(tag: string, attrs?: Record<string, any> | null, children?: MaybeArray<string | Node | DOMCollection>): Element {
  if (!hasDOM()) throw new Error('create(tag) requires a DOM environment');
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) setAttr(el, k, v);
  if (children) appendChildren(el, children);
  return el;
}

// ——— Event helpers ———
/**
 * Bind event listener(s) to an Element/Document/Window or a DOMCollection.
 *
 * - Supports multiple space-separated event types and namespaces (e.g. 'click.ns')
 * - Returns an unbind function
 * - Event type maps to proper DOM event type for strong typing
 */
export function on<K extends keyof GlobalEventHandlersEventMap>(target: Element | DOMCollection, types: K, handler: (ev: GlobalEventHandlersEventMap[K]) => void, options?: boolean | AddEventListenerOptions): () => void;
export function on<K extends keyof DocumentEventMap>(target: Document, types: K, handler: (ev: DocumentEventMap[K]) => void, options?: boolean | AddEventListenerOptions): () => void;
export function on<K extends keyof WindowEventMap>(target: Window, types: K, handler: (ev: WindowEventMap[K]) => void, options?: boolean | AddEventListenerOptions): () => void;
export function on(target: EventTargetish | DOMCollection, types: string, handler: (ev: Event) => void, options?: boolean | AddEventListenerOptions): () => void;
export function on(target: EventTargetish | DOMCollection, types: string, handler: (ev: Event) => void, options?: boolean | AddEventListenerOptions): () => void {
  const list = target instanceof DOMCollection ? target.elements : [target as any];
  const unbinders = list.map(t => onDirect(t as any, types, handler, options));
  return () => { for (const u of unbinders) u(); };
}

export function once<K extends keyof GlobalEventHandlersEventMap>(target: Element | DOMCollection, types: K, handler: (ev: GlobalEventHandlersEventMap[K]) => void, options?: boolean | AddEventListenerOptions): () => void;
export function once<K extends keyof DocumentEventMap>(target: Document, types: K, handler: (ev: DocumentEventMap[K]) => void, options?: boolean | AddEventListenerOptions): () => void;
export function once<K extends keyof WindowEventMap>(target: Window, types: K, handler: (ev: WindowEventMap[K]) => void, options?: boolean | AddEventListenerOptions): () => void;
export function once(target: EventTargetish | DOMCollection, types: string, handler: (ev: Event) => void, options?: boolean | AddEventListenerOptions): () => void;
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
export interface Dom {
  <T extends Element = Element>(input?: Selector<T>, context?: Element | Document | DOMCollection): DOMCollection<T>;
  dom: typeof dom;
  fromHTML: typeof fromHTML;
  create: typeof create;
  on: typeof on;
  once: typeof once;
  off: typeof off;
  ready: typeof ready;
  http: typeof http;
  renderTemplate: typeof renderTemplate;
  useTemplate: typeof useTemplate;
  tpl: typeof tpl;
  mountTemplate: typeof mountTemplate;
  escapeHTML: typeof escapeHTML;
  unsafeHTML: typeof unsafeHTML;
  serializeForm: typeof serializeForm;
  toQueryString: typeof toQueryString;
  onSubmit: typeof onSubmit;
  toFormData: typeof toFormData;
  setForm: typeof setForm;
  resetForm: typeof resetForm;
  validateForm: typeof validateForm;
  isValid: typeof isValid;
  animate: typeof animate;
  animations: typeof animations;
  debounce: typeof debounce;
  throttle: typeof throttle;
  nextTick: typeof nextTick;
  raf: typeof raf;
  rafThrottle: typeof rafThrottle;
  onIntersect: typeof onIntersect;
  onResize: typeof onResize;
  onMutation: typeof onMutation;
  scrollIntoView: typeof scrollIntoView;
  scrollIntoViewIfNeeded: typeof scrollIntoViewIfNeeded;
  DOMCollection: typeof DOMCollection;
  use: (plugin: Plugin) => void;
}

const api = Object.assign(function core<T extends Element = Element>(input?: Selector<T>, context?: Element | Document | DOMCollection) { return dom<T>(input, context); }, {
  dom, fromHTML, create, on, once, off, ready, http,
  renderTemplate, useTemplate, tpl, mountTemplate, escapeHTML, unsafeHTML,
  serializeForm, toQueryString, onSubmit, toFormData, setForm, resetForm, validateForm, isValid,
  animate, animations,
  // Utilities
  debounce, throttle, nextTick, raf, rafThrottle,
  // Observers
  onIntersect, onResize, onMutation,
  // Scroll helpers
  scrollIntoView, scrollIntoViewIfNeeded,
  DOMCollection,
  use: (plugin: Plugin) => use(plugin, api as any)
}) as Dom;

// ——— Initialize animation methods ———
installAnimationMethods();

// ——— Exports ———
export { DOMCollection, renderTemplate, useTemplate, tpl, mountTemplate, escapeHTML, unsafeHTML, serializeForm, toQueryString, onSubmit, toFormData, setForm, resetForm, validateForm, isValid, animate, animations, http, use, debounce, throttle, nextTick, raf, rafThrottle, onIntersect, onResize, onMutation, scrollIntoView, scrollIntoViewIfNeeded };
export type Plugin = (api: Dom) => void;
export default api;
