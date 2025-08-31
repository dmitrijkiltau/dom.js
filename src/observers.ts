import { Selector } from './types';
import { isElement, toArray } from './utils';
import { DOMCollection } from './collection';

function resolveTargets(input: Selector | DOMCollection): Element[] {
  if (input instanceof DOMCollection) return input.elements.slice();
  if (typeof input === 'string') return Array.from(document.querySelectorAll(input));
  if (isElement(input)) return [input];
  if (input && (input as any) instanceof NodeList) return Array.from(input as any);
  if (Array.isArray(input)) return (input as any).filter(isElement);
  if ((input as any)?.documentElement) return [(input as any).documentElement];
  return [];
}

// IntersectionObserver wrapper
export type IntersectOptions = IntersectionObserverInit & { once?: boolean };
export function onIntersect(
  targets: Selector | DOMCollection,
  callback: (entry: IntersectionObserverEntry, el: Element, unobserve: () => void) => void,
  options?: IntersectOptions
): () => void {
  const els = resolveTargets(targets);
  if (typeof (globalThis as any).IntersectionObserver === 'undefined' || els.length === 0) return () => {};
  const { once, ...init } = options || {};
  const obs = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target as Element;
      const unobserve = () => obs.unobserve(el);
      if (once && entry.isIntersecting) {
        obs.unobserve(el);
      }
      callback(entry, el, unobserve);
    }
  }, init);
  els.forEach(el => obs.observe(el));
  return () => { try { obs.disconnect(); } catch {} };
}

// ResizeObserver wrapper
export type ResizeOptions = { box?: ResizeObserverBoxOptions };
export function onResize(
  targets: Selector | DOMCollection,
  callback: (entry: ResizeObserverEntry, el: Element, unobserve: () => void) => void,
  options?: ResizeOptions
): () => void {
  const els = resolveTargets(targets);
  if (typeof (globalThis as any).ResizeObserver === 'undefined' || els.length === 0) return () => {};
  const obs = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target as Element;
      const unobserve = () => obs.unobserve(el);
      callback(entry, el, unobserve);
    }
  });
  const box = options?.box;
  els.forEach(el => (box ? (obs as any).observe(el, { box }) : obs.observe(el)));
  return () => { try { obs.disconnect(); } catch {} };
}

// MutationObserver wrapper
export function onMutation(
  targets: Selector | DOMCollection,
  callback: (mutations: MutationRecord[], el: Element, unobserve: () => void) => void,
  options: MutationObserverInit = { childList: true, subtree: true }
): () => void {
  const els = resolveTargets(targets);
  if (typeof (globalThis as any).MutationObserver === 'undefined' || els.length === 0) return () => {};
  const observers: MutationObserver[] = [];
  els.forEach(el => {
    const obs = new MutationObserver((records) => callback(records, el, () => obs.disconnect()));
    obs.observe(el, options);
    observers.push(obs);
  });
  return () => { for (const o of observers) { try { o.disconnect(); } catch {} } };
}

