import { MaybeArray, Selector, EventTargetish } from './types';
import { isString, isElement, isDocument, isWindow, hasDOM } from './utils';
import { DOMCollection } from './collection';
import { onDirect, removeManaged, removeAllManaged, ready as domReady } from './events';

// ——— Core selector ———
export function dom<T extends Element = Element>(input?: Selector<T>, context?: Element | Document | DOMCollection): DOMCollection<T> {
  if (!input) return new DOMCollection([]);
  if (isString(input)) {
    const s = input.trim();
    if (s.startsWith('<') && s.endsWith('>')) return fromHTML(s) as unknown as DOMCollection<T>;
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

// ——— Internal helpers ———
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

