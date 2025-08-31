import { Selector } from './types';
import { isElement } from './utils';
import { DOMCollection } from './collection';

export type ScrollOptions = {
  container?: Element | Window | Document | null;
  behavior?: ScrollBehavior;
  block?: 'start' | 'center' | 'end' | 'nearest';
  inline?: 'start' | 'center' | 'end' | 'nearest';
  ifNeeded?: boolean;
  offset?: number | { top?: number; left?: number };
};

function resolveElement(input: Selector | DOMCollection): Element | null {
  if (input instanceof DOMCollection) return input.el() ?? null;
  if (typeof input === 'string') return document.querySelector(input);
  if (isElement(input)) return input;
  if ((input as any)?.documentElement) return (input as any).documentElement;
  return null;
}

function getScrollParent(el: Element | null): Element | Window {
  if (!el) return window;
  let parent: Element | null = el.parentElement;
  while (parent) {
    const style = getComputedStyle(parent);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;
    const scrollableY = /(auto|scroll|overlay)/.test(overflowY);
    const scrollableX = /(auto|scroll|overlay)/.test(overflowX);
    if ((scrollableY && parent.scrollHeight > parent.clientHeight) || (scrollableX && parent.scrollWidth > parent.clientWidth)) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

function isFullyVisibleIn(el: Element, container: Element | Window): boolean {
  const rect = el.getBoundingClientRect();
  let cRect: DOMRect | { top: number; left: number; right: number; bottom: number };
  if (container === window) {
    cRect = { top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight };
  } else {
    const cr = (container as Element).getBoundingClientRect();
    cRect = { top: cr.top, left: cr.left, right: cr.right, bottom: cr.bottom };
  }
  return rect.top >= cRect.top && rect.bottom <= cRect.bottom && rect.left >= cRect.left && rect.right <= cRect.right;
}

function applyOffset(targetTop: number, targetLeft: number, offset?: number | { top?: number; left?: number }) {
  if (typeof offset === 'number') return { top: targetTop - offset, left: targetLeft - offset };
  if (!offset) return { top: targetTop, left: targetLeft };
  return { top: targetTop - (offset.top || 0), left: targetLeft - (offset.left || 0) };
}

export function scrollIntoView(target: Selector | Element | DOMCollection, opts: ScrollOptions = {}): void {
  const el = resolveElement(target as any);
  if (!el) return;
  const behavior = opts.behavior || 'smooth';
  const block = opts.block || 'start';
  const inline = opts.inline || 'nearest';
  const container = (opts.container as any) || getScrollParent(el);

  if (opts.ifNeeded && isFullyVisibleIn(el, container)) return;

  if (container === window || container === document) {
    const rect = el.getBoundingClientRect();
    let top = rect.top + (window.pageYOffset || document.documentElement.scrollTop || 0);
    let left = rect.left + (window.pageXOffset || document.documentElement.scrollLeft || 0);
    if (block === 'center') top = top - (window.innerHeight / 2 - rect.height / 2);
    else if (block === 'end') top = top - (window.innerHeight - rect.height);
    if (inline === 'center') left = left - (window.innerWidth / 2 - rect.width / 2);
    else if (inline === 'end') left = left - (window.innerWidth - rect.width);
    const withOffset = applyOffset(top, left, opts.offset);
    window.scrollTo({ top: withOffset.top, left: withOffset.left, behavior });
    return;
  }

  const c = container as Element;
  const cRect = c.getBoundingClientRect();
  const tRect = el.getBoundingClientRect();

  let targetTop = c.scrollTop + (tRect.top - cRect.top);
  let targetLeft = c.scrollLeft + (tRect.left - cRect.left);

  if (block === 'center') targetTop = targetTop - (c.clientHeight / 2 - tRect.height / 2);
  else if (block === 'end') targetTop = targetTop - (c.clientHeight - tRect.height);
  // nearest behavior tries to avoid scrolling if already visible partially; keep simple by snapping within bounds
  if (inline === 'center') targetLeft = targetLeft - (c.clientWidth / 2 - tRect.width / 2);
  else if (inline === 'end') targetLeft = targetLeft - (c.clientWidth - tRect.width);

  const withOffset = applyOffset(targetTop, targetLeft, opts.offset);
  c.scrollTo({ top: withOffset.top, left: withOffset.left, behavior });
}

export function scrollIntoViewIfNeeded(target: Selector | Element | DOMCollection, opts: Omit<ScrollOptions, 'ifNeeded'> = {}): void {
  scrollIntoView(target as any, { ...opts, ifNeeded: true });
}

// DOMCollection convenience methods
declare module './collection' {
  interface DOMCollection {
    scrollIntoView(options?: ScrollOptions): this;
    scrollIntoViewIfNeeded(options?: Omit<ScrollOptions, 'ifNeeded'>): this;
  }
}

DOMCollection.prototype.scrollIntoView = function (this: DOMCollection, options?: ScrollOptions) {
  const el = this.el();
  if (el) scrollIntoView(el, options);
  return this;
};

DOMCollection.prototype.scrollIntoViewIfNeeded = function (this: DOMCollection, options?: Omit<ScrollOptions, 'ifNeeded'>) {
  const el = this.el();
  if (el) scrollIntoViewIfNeeded(el, options);
  return this;
};

