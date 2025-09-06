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

// ——— Install SSR-safe stubs on DOMCollection ———
// These mirror motion/scroll collection methods so code can call them on server.
// Motion methods resolve immediately with the original collection; scroll methods no-op.
(() => {
  const proto: any = (DOMCollection as any).prototype;

  // Motion: Promise-returning methods resolve immediately
  const resolved = function <T>(this: T): Promise<T> { return Promise.resolve(this); };

  proto.animate = function () { return resolved.call(this); };
  proto.sequence = function () { return resolved.call(this); };
  proto.stagger = function () { return resolved.call(this); };
  proto.fadeIn = function () { return resolved.call(this); };
  proto.fadeOut = function () { return resolved.call(this); };
  proto.fadeToggle = function () { return resolved.call(this); };
  proto.slideUp = function () { return resolved.call(this); };
  proto.slideDown = function () { return resolved.call(this); };
  proto.slideToggle = function () { return resolved.call(this); };
  proto.pulse = function () { return resolved.call(this); };
  proto.shake = function () { return resolved.call(this); };

  // Visibility preset helper
  proto.withVisible = function () {
    const base = this;
    return {
      animate: () => Promise.resolve(base),
      sequence: () => Promise.resolve(base),
      fadeIn: () => Promise.resolve(base),
      slideDown: () => Promise.resolve(base)
    };
  };

  // Motion control: no-ops returning the collection
  proto.pause = function () { return this; };
  proto.resume = function () { return this; };
  proto.cancel = function () { return this; };
  proto.stop = function () { return this; };

  // Scroll collection helpers: no-ops returning the collection
  proto.scrollIntoView = function () { return this; };
  proto.scrollIntoViewIfNeeded = function () { return this; };
})();

export type ServerDom = typeof api;
export default api;
