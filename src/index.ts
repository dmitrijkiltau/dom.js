import { MaybeArray, Selector, EventTargetish } from './types';
import { isString, isElement, isDocument, isWindow } from './utils';
import { DOMCollection } from './collection';
import { renderTemplate, useTemplate, tpl } from './template';
import { serializeForm, toQueryString, onSubmit } from './forms';
import { animate, animations } from './motion';

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

// ——— HTTP wrapper ———
type HttpMethod = {
  get(url: string, init?: RequestInit): Promise<ReturnType<typeof wrap>>;
  post(url: string, body?: any, init?: RequestInit): Promise<ReturnType<typeof wrap>>;
  put(url: string, body?: any, init?: RequestInit): Promise<ReturnType<typeof wrap>>;
  patch(url: string, body?: any, init?: RequestInit): Promise<ReturnType<typeof wrap>>;
  delete(url: string, init?: RequestInit): Promise<ReturnType<typeof wrap>>;
  withTimeout(ms: number): HttpMethod;
  withHeaders(defaultHeaders: Record<string, string>): HttpMethod;
};

export const http: HttpMethod = {
  async get(url: string, init?: RequestInit) { const r = await fetch(url, { method: 'GET', ...init }); return wrap(r); },
  async post(url: string, body?: any, init?: RequestInit) { const r = await fetch(url, { method: 'POST', body: serialize(body), headers: headers(init, body), ...init }); return wrap(r); },
  async put(url: string, body?: any, init?: RequestInit) { const r = await fetch(url, { method: 'PUT', body: serialize(body), headers: headers(init, body), ...init }); return wrap(r); },
  async patch(url: string, body?: any, init?: RequestInit) { const r = await fetch(url, { method: 'PATCH', body: serialize(body), headers: headers(init, body), ...init }); return wrap(r); },
  async delete(url: string, init?: RequestInit) { const r = await fetch(url, { method: 'DELETE', ...init }); return wrap(r); },
  
  // Request helpers
  withTimeout(ms: number): HttpMethod {
    const timeoutHttp = {} as any;
    for (const [method, fn] of Object.entries(http)) {
      if (typeof fn === 'function' && method !== 'withTimeout' && method !== 'withHeaders') {
        timeoutHttp[method] = async (...args: any[]) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), ms);
          try {
            const init = args[args.length - 1] || {};
            args[args.length - 1] = { ...init, signal: controller.signal };
            return await (fn as any).apply(null, args);
          } finally {
            clearTimeout(timeoutId);
          }
        };
      }
    }
    timeoutHttp.withTimeout = http.withTimeout;
    timeoutHttp.withHeaders = http.withHeaders;
    return timeoutHttp;
  },
  
  withHeaders(defaultHeaders: Record<string, string>): HttpMethod {
    const headersHttp = {} as any;
    for (const [method, fn] of Object.entries(http)) {
      if (typeof fn === 'function' && method !== 'withTimeout' && method !== 'withHeaders') {
        headersHttp[method] = async (...args: any[]) => {
          const init = args[args.length - 1] || {};
          args[args.length - 1] = {
            ...init,
            headers: { ...defaultHeaders, ...(init.headers || {}) }
          };
          return await (fn as any).apply(null, args);
        };
      }
    }
    headersHttp.withTimeout = http.withTimeout;
    headersHttp.withHeaders = http.withHeaders;
    return headersHttp;
  }
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

function appendChildren(el: Element, kids: MaybeArray<string | Node | DOMCollection>) {
  for (const child of (Array.isArray(kids) ? kids : [kids])) {
    if (child == null) continue;
    if (typeof child === 'string') el.insertAdjacentHTML('beforeend', child);
    else if (child instanceof DOMCollection) child.elements.forEach(n => el.appendChild(n));
    else el.appendChild(child);
  }
}

// ——— Plugin system ———
export type Plugin = (api: typeof dom) => void;
const _plugins = new Set<Plugin>();
export function use(plugin: Plugin) { if (!_plugins.has(plugin)) { plugin(api); _plugins.add(plugin); } }

// ——— API bag (default export) ———
const api = Object.assign(function core(input?: Selector) { return dom(input); }, {
  dom, create, on, once, off, http,
  renderTemplate, useTemplate, tpl,
  serializeForm, toQueryString, onSubmit,
  animate, animations,
  DOMCollection,
});

// ——— Prototype sugar ———
(DOMCollection as any).prototype.animate = function (keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: KeyframeAnimationOptions) {
  this.elements.forEach((el: Element) => animate(el as HTMLElement, keyframes as any, options));
  return this;
};

// Add animation shortcuts
(DOMCollection as any).prototype.fadeIn = function (duration?: number) {
  const [keyframes, options] = animations.fadeIn(duration);
  return this.animate(keyframes, options);
};
(DOMCollection as any).prototype.fadeOut = function (duration?: number) {
  const [keyframes, options] = animations.fadeOut(duration);
  return this.animate(keyframes, options);
};
(DOMCollection as any).prototype.slideUp = function (duration?: number) {
  const [keyframes, options] = animations.slideUp(duration);
  return this.animate(keyframes, options);
};
(DOMCollection as any).prototype.slideDown = function (duration?: number) {
  const [keyframes, options] = animations.slideDown(duration);
  return this.animate(keyframes, options);
};
(DOMCollection as any).prototype.pulse = function (duration?: number) {
  const [keyframes, options] = animations.pulse(duration);
  return this.animate(keyframes, options);
};
(DOMCollection as any).prototype.shake = function (duration?: number) {
  const [keyframes, options] = animations.shake(duration);
  return this.animate(keyframes, options);
};

// ——— Exports ———
export { DOMCollection, renderTemplate, useTemplate, tpl, serializeForm, toQueryString, onSubmit, animate, animations };
export default api as typeof dom & typeof api;
