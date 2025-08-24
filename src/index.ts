import { MaybeArray, Selector, EventTargetish } from './types';
import { isString, isElement, isDocument, isWindow } from './utils';
import { VKCollection } from './collection';
import { renderTemplate, useTemplate, tpl } from './template';
import { serializeForm, toQueryString, onSubmit } from './forms';
import { animate } from './motion';

// ——— Core selector ———
export function vk(input?: Selector): VKCollection {
  if (!input) return new VKCollection([]);
  if (isString(input)) return new VKCollection(document.querySelectorAll(input));
  if (isElement(input)) return new VKCollection([input]);
  if (input instanceof NodeList || Array.isArray(input)) return new VKCollection(input as any);
  if (isDocument(input)) return new VKCollection([input.documentElement]);
  if (isWindow(input)) return new VKCollection([input.document.documentElement]);
  return new VKCollection([]);
}

// ——— Element creation ———
export function create(tag: string, attrs?: Record<string, any> | null, children?: MaybeArray<string | Node | VKCollection>): Element {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) setAttr(el, k, v);
  if (children) appendChildren(el, children);
  return el;
}

// ——— Event helpers ———
export function on(target: EventTargetish | VKCollection, type: string, handler: (ev: Event) => void): void {
  const list = target instanceof VKCollection ? target.elements : [target as any];
  list.forEach(t => (t as any).addEventListener(type, handler));
}
export function off(target: EventTargetish | VKCollection, type: string, handler: (ev: Event) => void, options?: boolean | EventListenerOptions): void {
  const list = target instanceof VKCollection ? target.elements : [target as any];
  list.forEach(t => (t as any).removeEventListener(type, handler, options));
}

// ——— HTTP wrapper ———
export const http = {
  async get(url: string, init?: RequestInit) { const r = await fetch(url, { method: 'GET', ...init }); return wrap(r); },
  async post(url: string, body?: any, init?: RequestInit) { const r = await fetch(url, { method: 'POST', body: serialize(body), headers: headers(init, body), ...init }); return wrap(r); },
  async put(url: string, body?: any, init?: RequestInit) { const r = await fetch(url, { method: 'PUT', body: serialize(body), headers: headers(init, body), ...init }); return wrap(r); },
  async patch(url: string, body?: any, init?: RequestInit) { const r = await fetch(url, { method: 'PATCH', body: serialize(body), headers: headers(init, body), ...init }); return wrap(r); },
  async delete(url: string, init?: RequestInit) { const r = await fetch(url, { method: 'DELETE', ...init }); return wrap(r); }
};

function wrap(r: Response) {
  return {
    raw: r,
    ok: r.ok,
    status: r.status,
    text: () => r.text(),
    json: <T = unknown>() => r.json() as Promise<T>,
    html: () => r.text().then(s => new DOMParser().parseFromString(s, 'text/html'))
  };
}

function serialize(body: any) {
  if (body == null) return undefined;
  if (body instanceof FormData || typeof body === 'string' || body instanceof Blob) return body as any;
  if (typeof body === 'object') return JSON.stringify(body);
  return String(body);
}

function headers(init: RequestInit | undefined, body: any) {
  const h = new Headers(init?.headers);
  if (body && !(body instanceof FormData) && !h.has('Content-Type')) h.set('Content-Type', 'application/json');
  return h;
}

function setAttr(el: Element, key: string, value: any) {
  if (key === 'style' && typeof value === 'object') Object.assign((el as HTMLElement).style, value);
  else if (key in el) (el as any)[key] = value;
  else if (value === false || value == null) el.removeAttribute(key);
  else el.setAttribute(key, String(value));
}

function appendChildren(el: Element, kids: MaybeArray<string | Node | VKCollection>) {
  for (const child of (Array.isArray(kids) ? kids : [kids])) {
    if (child == null) continue;
    if (typeof child === 'string') el.insertAdjacentHTML('beforeend', child);
    else if (child instanceof VKCollection) child.elements.forEach(n => el.appendChild(n));
    else el.appendChild(child);
  }
}

// ——— Plugin system ———
export type Plugin = (api: typeof vk) => void;
const _plugins = new Set<Plugin>();
export function use(plugin: Plugin) { if (!_plugins.has(plugin)) { plugin(api); _plugins.add(plugin); } }

// ——— API bag (default export) ———
const api = Object.assign(function core(input?: Selector) { return vk(input); }, {
  vk, create, on, off, http,
  renderTemplate, useTemplate, tpl,
  serializeForm, toQueryString, onSubmit,
  animate,
  VKCollection,
});

// ——— Prototype sugar ———
(VKCollection as any).prototype.animate = function (keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: KeyframeAnimationOptions) {
  this.elements.forEach((el: Element) => animate(el as HTMLElement, keyframes as any, options));
  return this;
};

// ——— Exports ———
export { VKCollection, renderTemplate, useTemplate, tpl, serializeForm, toQueryString, onSubmit, animate };
export default api as typeof vk & typeof api;
