import type { MaybeArray, Selector } from './types';
import { DOMCollection } from './collection';
import { http } from './http';
import { debounce, throttle, nextTick, raf, rafThrottle } from './utils';

// Server-safe stubs: no DOM at import or call time

function dom<T extends Element = Element>(_input?: Selector<T>, _context?: Element | Document | DOMCollection): DOMCollection<T> {
  return new DOMCollection<T>([] as any);
}

function fromHTML(_html: string): DOMCollection {
  // On server, return empty collection instead of throwing
  return new DOMCollection([]);
}

function create(_tag: string, _attrs?: Record<string, any> | null, _children?: MaybeArray<string | Node | DOMCollection>): Element {
  // Explicit error helps catch accidental server-side DOM usage
  throw new Error('create(tag) requires a DOM environment');
}

function on(): () => void { return () => {}; }
function once(): () => void { return () => {}; }
function off(): void { /* no-op */ }
function ready(fn: () => void): void { try { fn(); } catch {} }

const api = Object.assign(function core<T extends Element = Element>(input?: Selector<T>, context?: Element | Document | DOMCollection) { return dom<T>(input, context); }, {
  dom,
  fromHTML,
  create,
  on,
  once,
  off,
  ready,
  http,
  // Utilities are safe on server
  debounce,
  throttle,
  nextTick,
  raf,
  rafThrottle,
  // Expose class for type parity; avoid using methods that touch the real DOM on server
  DOMCollection
});

export type ServerDom = typeof api;
export default api;

