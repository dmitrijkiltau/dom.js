export const toArray = <T>(x: ArrayLike<T> | T[] | null | undefined): T[] => x ? Array.from(x as any) : [];
export const isString = (v: unknown): v is string => typeof v === 'string';
export const isElement = (v: unknown): v is Element => v instanceof Element;
export const isWindow = (v: unknown): v is Window => v instanceof Window;
export const isDocument = (v: unknown): v is Document => v instanceof Document;
export const camelToKebab = (s: string) => s.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
export const kebabToCamel = (s: string) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
export const ensureArray = <T>(v: T | T[]): T[] => Array.isArray(v) ? v : [v];

// Scheduling helpers
export function nextTick(cb?: () => void): Promise<void> | void {
  if (cb) {
    if (typeof queueMicrotask === 'function') queueMicrotask(cb);
    else Promise.resolve().then(cb);
    return;
  }
  return new Promise<void>(resolve => {
    if (typeof queueMicrotask === 'function') queueMicrotask(resolve);
    else Promise.resolve().then(resolve);
  });
}

export function raf(cb?: FrameRequestCallback): number | Promise<number> {
  if (cb) return requestAnimationFrame(cb);
  return new Promise<number>(resolve => requestAnimationFrame(resolve));
}

// Debounce/throttle
export type Debounced<F extends (...args: any[]) => any> = ((...args: Parameters<F>) => void) & {
  cancel: () => void;
  flush: () => void;
};

export function debounce<F extends (...args: any[]) => any>(fn: F, wait = 0, opts?: { leading?: boolean; trailing?: boolean }): Debounced<F> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: any[] | null = null;
  let leadingCalled = false;
  const leading = !!opts?.leading;
  const trailing = opts?.trailing !== false; // default true

  const invoke = (args: any[]) => {
    lastArgs = null;
    leadingCalled = true;
    (fn as any)(...args);
  };

  const debounced: any = (...args: any[]) => {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    if (leading && !leadingCalled) invoke(args);
    timer = setTimeout(() => {
      timer = null;
      leadingCalled = false;
      if (trailing && lastArgs) invoke(lastArgs);
    }, wait);
  };
  debounced.cancel = () => { if (timer) clearTimeout(timer); timer = null; lastArgs = null; leadingCalled = false; };
  debounced.flush = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    if (lastArgs) { const args = lastArgs; lastArgs = null; invoke(args); }
  };
  return debounced;
}

export function throttle<F extends (...args: any[]) => any>(fn: F, interval = 0, opts?: { leading?: boolean; trailing?: boolean }): Debounced<F> {
  let lastTime = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: any[] | null = null;
  const leading = opts?.leading !== false; // default true
  const trailing = opts?.trailing !== false; // default true

  const invoke = (time: number, args: any[]) => {
    lastTime = time;
    (fn as any)(...args);
  };

  const throttled: any = (...args: any[]) => {
    const now = Date.now();
    if (!lastTime && !leading) lastTime = now;
    const remaining = interval - (now - lastTime);
    lastArgs = args;
    if (remaining <= 0 || remaining > interval) {
      if (timer) { clearTimeout(timer); timer = null; }
      invoke(now, args);
    } else if (trailing && !timer) {
      timer = setTimeout(() => {
        timer = null;
        invoke(leading ? Date.now() : 0, lastArgs!);
        lastArgs = null;
      }, remaining);
    }
  };
  throttled.cancel = () => { if (timer) clearTimeout(timer); timer = null; lastArgs = null; lastTime = 0; };
  throttled.flush = () => {
    if (timer && lastArgs) {
      clearTimeout(timer);
      timer = null;
      invoke(Date.now(), lastArgs);
      lastArgs = null;
    }
  };
  return throttled;
}

export function rafThrottle<F extends (...args: any[]) => any>(fn: F): ((...args: Parameters<F>) => void) & { cancel: () => void } {
  let rafId: number | null = null;
  let lastArgs: any[] | null = null;
  const wrapper: any = (...args: any[]) => {
    lastArgs = args;
    if (rafId != null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      if (lastArgs) (fn as any)(...lastArgs);
      lastArgs = null;
    });
  };
  wrapper.cancel = () => { if (rafId != null) cancelAnimationFrame(rafId); rafId = null; lastArgs = null; };
  return wrapper;
}
