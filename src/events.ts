import type { Handler, EventTargetish } from './types';

type ListenerRecord = {
  type: string;
  namespaces: string[];
  selector?: string;
  original: Function; // Handler or EventListener
  wrapped: EventListener;
  options?: boolean | AddEventListenerOptions;
  delegated?: boolean;
};

const registry = new WeakMap<EventTarget, Set<ListenerRecord>>();

function getStore(target: EventTarget): Set<ListenerRecord> {
  let set = registry.get(target);
  if (!set) { set = new Set(); registry.set(target, set); }
  return set;
}

function parseTypes(types: string): Array<{ type: string; namespaces: string[] }> {
  const out: Array<{ type: string; namespaces: string[] }> = [];
  for (const token of types.split(/\s+/).map(t => t.trim()).filter(Boolean)) {
    const parts = token.split('.');
    const base = parts.shift() || '';
    const namespaces = parts.filter(Boolean);
    out.push({ type: base, namespaces });
  }
  return out;
}

function matchNamespaces(recNS: string[], wantNS: string[]): boolean {
  // All wanted namespaces must be present in record
  for (const ns of wantNS) if (!recNS.includes(ns)) return false;
  return true;
}

export type OnOptions = boolean | AddEventListenerOptions | undefined;

export function addManaged(
  target: EventTarget,
  types: string,
  wrappedFactory: (baseType: string) => EventListener,
  original: Function,
  options?: OnOptions,
  selector?: string
): () => void {
  const store = getStore(target);
  const specs = parseTypes(types);
  const unbinders: Array<() => void> = [];
  for (const spec of specs) {
    if (!spec.type) continue; // cannot bind only namespace
    const wrapped = wrappedFactory(spec.type);
    (target as any).addEventListener(spec.type, wrapped, options as any);
    const rec: ListenerRecord = {
      type: spec.type,
      namespaces: spec.namespaces,
      selector,
      original,
      wrapped,
      options,
      delegated: !!selector
    };
    store.add(rec);
    unbinders.push(() => {
      (target as any).removeEventListener(spec.type, wrapped, options as any);
      store.delete(rec);
    });
  }
  return () => { for (const u of unbinders) u(); };
}

export function removeManaged(
  target: EventTarget,
  types?: string,
  selectorOrHandler?: string | Function,
  maybeHandler?: Function
): void {
  const store = registry.get(target);
  if (!store || store.size === 0) return;

  let selector: string | undefined;
  let handler: Function | undefined;
  if (typeof selectorOrHandler === 'string') selector = selectorOrHandler;
  else if (typeof selectorOrHandler === 'function') handler = selectorOrHandler;
  if (typeof maybeHandler === 'function') handler = maybeHandler;

  const specs = types ? parseTypes(types) : [{ type: '', namespaces: [] }];

  for (const rec of Array.from(store)) {
    for (const spec of specs) {
      // Type match: if spec.type provided, must equal rec.type
      if (spec.type && spec.type !== rec.type) continue;
      // Namespace match: spec namespaces must be subset of rec.namespaces
      if (spec.namespaces.length && !matchNamespaces(rec.namespaces, spec.namespaces)) continue;
      // Selector match (for delegated): if selector specified, must equal
      if (selector !== undefined && selector !== rec.selector) continue;
      // Handler match: if handler specified, must be same original
      if (handler && handler !== rec.original) continue;
      // Remove
      (target as any).removeEventListener(rec.type, rec.wrapped, rec.options as any);
      store.delete(rec);
      break; // For this rec, no need to test other specs
    }
  }
}

export function removeAllManaged(target: EventTarget): void {
  const store = registry.get(target);
  if (!store) return;
  for (const rec of Array.from(store)) {
    (target as any).removeEventListener(rec.type, rec.wrapped, rec.options as any);
    store.delete(rec);
  }
}

// High-level helpers for different handler shapes
export function onDirect(
  target: EventTarget,
  types: string,
  handler: (ev: Event) => void,
  options?: OnOptions
): () => void {
  return addManaged(target, types, (baseType) => {
    if (options && typeof options === 'object' && (options as AddEventListenerOptions).once) {
      return function onceWrapper(ev: Event) {
        handler(ev);
        // Removal is handled by native once, but also prune store entry
        // prune is handled by removeManaged when called explicitly; not necessary here
      };
    }
    return (ev: Event) => handler(ev);
  }, handler as any, options);
}

export function onDelegated(
  target: EventTarget,
  types: string,
  selector: string,
  handler: Handler,
  options?: OnOptions,
  idx?: number
): () => void {
  return addManaged(target, types, (baseType) => {
    if (options && typeof options === 'object' && (options as AddEventListenerOptions).once) {
      const onceHandler = (ev: Event) => {
        const el = target as Element;
        const tgt = ev.target as Element | null;
        if (!tgt) return;
        const match = tgt.closest(selector);
        if (match && (el as any).contains ? (el as any).contains(match) : true) {
          handler(ev, match, idx ?? 0);
        }
      };
      return onceHandler;
    }
    return (ev: Event) => {
      const el = target as Element;
      const tgt = ev.target as Element | null;
      if (!tgt) return;
      const match = tgt.closest(selector);
      if (match && (el as any).contains ? (el as any).contains(match) : true) {
        handler(ev, match, idx ?? 0);
      }
    };
  }, handler as any, options, selector);
}

export function ready(fn: () => void): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

