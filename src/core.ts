import { MaybeArray, Selector, EventTargetish } from './types';
import { DOMCollection } from './collection';
import { use } from './plugins';
import { dom, fromHTML, create, on, once, off, ready } from './core-api';

// ——— Core API (default export) ———
export interface Dom {
  <T extends Element = Element>(input?: Selector<T>, context?: Element | Document | DOMCollection): DOMCollection<T>;
  dom: typeof dom;
  fromHTML: typeof fromHTML;
  create: typeof create;
  on: typeof on;
  once: typeof once;
  off: typeof off;
  ready: typeof ready;
  DOMCollection: typeof DOMCollection;
  use: (plugin: Plugin) => void;
}

const api = Object.assign(function core<T extends Element = Element>(input?: Selector<T>, context?: Element | Document | DOMCollection) { return dom<T>(input, context); }, {
  dom, fromHTML, create, on, once, off, ready,
  DOMCollection,
  use: (plugin: Plugin) => use(plugin, api as any)
}) as Dom;

// ——— Exports ———
export { DOMCollection, use };
export { dom, fromHTML, create, on, once, off, ready } from './core-api';
export type Plugin = (api: Dom) => void;
export default api;
