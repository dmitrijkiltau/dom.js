import { Selector } from './types';
import { isElement, hasDOM } from './utils';
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
  if (!hasDOM()) return null;
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
  if (!hasDOM()) return;
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
  if (!hasDOM()) return;
  scrollIntoView(target as any, { ...opts, ifNeeded: true });
}

// ——— Scroll lock utilities ———
type SavedStyles = Partial<Record<'overflow' | 'paddingRight' | 'position' | 'top' | 'left' | 'width', string>>;
type LockState = {
  count: number;
  saved: SavedStyles;
  scrollX: number;
  scrollY: number;
  mode: 'bodyFixed' | 'overflowHidden';
};

const lockMap: WeakMap<Element, LockState> = new WeakMap();

function resolveTarget(input?: Selector | Element | DOMCollection | null): Element | null {
  if (!hasDOM()) return null;
  if (!input) return document.body || document.documentElement;
  if (input instanceof DOMCollection) return input.el() ?? null;
  if (typeof input === 'string') return document.querySelector(input);
  if (isElement(input)) return input;
  if ((input as any)?.documentElement) return (input as any).documentElement as Element;
  return null;
}

function getScrollbarWidth(): number {
  if (!hasDOM()) return 0;
  const sw = window.innerWidth - document.documentElement.clientWidth;
  return sw > 0 ? sw : 0;
}

export function lockScroll(target?: Selector | Element | DOMCollection | null): void {
  if (!hasDOM()) return;
  const el = resolveTarget(target);
  if (!el) return;

  const current = lockMap.get(el);
  if (current) { current.count++; return; }

  // Page-level lock if locking <body> or <html>
  const tag = (el as Element).tagName;
  const isPage = tag === 'BODY' || tag === 'HTML';

  const saved: SavedStyles = {};
  const style = (el as HTMLElement).style;
  const computed = getComputedStyle(el as HTMLElement);

  if (isPage) {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft || 0;
    saved.position = style.position || '';
    saved.top = style.top || '';
    saved.left = style.left || '';
    saved.width = style.width || '';
    saved.overflow = style.overflow || '';
    saved.paddingRight = style.paddingRight || '';

    const sw = getScrollbarWidth();
    const basePadRight = parseFloat(computed.paddingRight) || 0;
    if (sw > 0) style.paddingRight = `${basePadRight + sw}px`;

    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.left = `-${scrollX}px`;
    style.width = '100%';
    style.overflow = 'hidden';

    lockMap.set(el, { count: 1, saved, scrollX, scrollY, mode: 'bodyFixed' });
    return;
  }

  // Element-level lock: hide overflow and compensate for scrollbar
  saved.overflow = style.overflow || '';
  saved.paddingRight = style.paddingRight || '';

  const hadVScroll = (el as HTMLElement).scrollHeight > (el as HTMLElement).clientHeight;
  const sw = hadVScroll ? ((el as HTMLElement).offsetWidth - (el as HTMLElement).clientWidth) : 0;
  const basePadRight = parseFloat(computed.paddingRight) || 0;

  if (hadVScroll && sw > 0) style.paddingRight = `${basePadRight + sw}px`;
  style.overflow = 'hidden';

  lockMap.set(el, { count: 1, saved, scrollX: 0, scrollY: 0, mode: 'overflowHidden' });
}

export function unlockScroll(target?: Selector | Element | DOMCollection | null): void {
  if (!hasDOM()) return;
  const el = resolveTarget(target);
  if (!el) return;
  const state = lockMap.get(el);
  if (!state) return; // not locked
  if (--state.count > 0) return; // nested locks remain

  const style = (el as HTMLElement).style;
  const { saved, mode, scrollX, scrollY } = state;

  // Restore styles
  if (saved.overflow != null) style.overflow = saved.overflow;
  if (saved.paddingRight != null) style.paddingRight = saved.paddingRight;
  if (mode === 'bodyFixed') {
    if (saved.position != null) style.position = saved.position;
    if (saved.top != null) style.top = saved.top;
    if (saved.left != null) style.left = saved.left;
    if (saved.width != null) style.width = saved.width;
    // Restore scroll position after releasing fixed body
    window.scrollTo(scrollX, scrollY);
  }

  lockMap.delete(el);
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
