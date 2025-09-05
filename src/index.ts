import { MaybeArray, Selector, EventTargetish, Handler } from './types';
import { debounce, throttle, nextTick, raf, rafThrottle } from './utils';
import { DOMCollection } from './collection';
import { renderTemplate, useTemplate, tpl, mountTemplate, escapeHTML, unsafeHTML, isUnsafeHTML, hydrateTemplate } from './template';
import { serializeForm, toQueryString, onSubmit, toFormData, setForm, resetForm, validateForm, isValid } from './forms';
import { animate, animations, installAnimationMethods } from './motion';
import { http } from './http';
import { use } from './plugins';
import { dom, fromHTML, create, on, once, off, ready } from './core-api';
import { onIntersect, onResize, onMutation } from './observers';
import { scrollIntoView, scrollIntoViewIfNeeded } from './scroll';

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
  hydrateTemplate: typeof hydrateTemplate;
  escapeHTML: typeof escapeHTML;
  unsafeHTML: typeof unsafeHTML;
  isUnsafeHTML: typeof isUnsafeHTML;
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
  renderTemplate, useTemplate, tpl, mountTemplate, hydrateTemplate, escapeHTML, unsafeHTML, isUnsafeHTML,
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
export { DOMCollection, renderTemplate, useTemplate, tpl, mountTemplate, hydrateTemplate, escapeHTML, unsafeHTML, isUnsafeHTML, serializeForm, toQueryString, onSubmit, toFormData, setForm, resetForm, validateForm, isValid, animate, animations, http, use, debounce, throttle, nextTick, raf, rafThrottle, onIntersect, onResize, onMutation, scrollIntoView, scrollIntoViewIfNeeded };
export { dom, fromHTML, create, on, once, off, ready } from './core-api';
export type Plugin = (api: Dom) => void;
export default api;
