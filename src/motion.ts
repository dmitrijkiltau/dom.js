import { DOMCollection } from './collection';
import { hasDOM } from './utils';

// ——— Low-level: direct animate (returns Animation) ———
export function animate(el: HTMLElement, keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: KeyframeAnimationOptions) {
  return el.animate(keyframes as any, options);
}

// ——— Internal state for queueing + control ———
const queues = new WeakMap<Element, Promise<any>>();
const active = new WeakMap<Element, Set<Animation>>();
const prevDisplay = new WeakMap<Element, string>();

function getActiveSet(el: Element): Set<Animation> {
  let set = active.get(el);
  if (!set) { set = new Set(); active.set(el, set); }
  return set;
}

function track(el: Element, anim: Animation) {
  const set = getActiveSet(el);
  set.add(anim);
  const remove = () => set.delete(anim);
  anim.finished.then(remove, remove);
  anim.addEventListener?.('cancel', remove as any);
  return anim;
}

function enqueue<T>(el: Element, start: () => Promise<T>): Promise<T> {
  const prev = queues.get(el) || Promise.resolve();
  const next = prev.catch(() => {}).then(() => start());
  // Keep chain alive regardless of resolution
  queues.set(el, next.catch(() => {}));
  return next;
}

function motionDisabled(): boolean {
  try {
    return typeof window !== 'undefined' && !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch { return false; }
}

function showEl(el: HTMLElement) {
  if (!hasDOM()) return;
  const cs = getComputedStyle(el);
  const cur = cs.display;
  if (cur === 'none') {
    const stored = prevDisplay.get(el) || '';
    el.style.display = stored || 'block';
  }
}

function hideEl(el: HTMLElement) {
  if (!hasDOM()) return;
  const cs = getComputedStyle(el);
  if (cs.display !== 'none') prevDisplay.set(el, cs.display);
  el.style.display = 'none';
}

// Common animation presets
export const animations = {
  fadeIn: (duration: number = 300): [Keyframe[], KeyframeAnimationOptions] => [
    [{ opacity: 0 }, { opacity: 1 }],
    { duration, easing: 'ease-out' }
  ],
  fadeOut: (duration: number = 300): [Keyframe[], KeyframeAnimationOptions] => [
    [{ opacity: 1 }, { opacity: 0 }],
    { duration, easing: 'ease-in' }
  ],
  slideUp: (duration: number = 300): [Keyframe[], KeyframeAnimationOptions] => [
    [{ transform: 'translateY(20px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
    { duration, easing: 'ease-out' }
  ],
  slideDown: (duration: number = 300): [Keyframe[], KeyframeAnimationOptions] => [
    [{ transform: 'translateY(-20px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
    { duration, easing: 'ease-out' }
  ],
  pulse: (duration: number = 600): [Keyframe[], KeyframeAnimationOptions] => [
    [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }],
    { duration, easing: 'ease-in-out' }
  ],
  shake: (duration: number = 500): [Keyframe[], KeyframeAnimationOptions] => [
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(0)' }
    ],
    { duration, easing: 'ease-in-out' }
  ]
};

async function playQueued(el: HTMLElement, keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: KeyframeAnimationOptions): Promise<void> {
  return enqueue(el, async () => {
    if (motionDisabled()) {
      // No-op animation honoring visibility integration
      return;
    }
    const anim = track(el, animate(el, keyframes as any, options));
    try { await anim.finished; } catch { /* canceled */ }
  });
}

function durationWithPrefs(opts?: KeyframeAnimationOptions): KeyframeAnimationOptions | undefined {
  if (!opts) return opts;
  if (motionDisabled()) return Object.assign({}, opts, { duration: 0 });
  return opts;
}

/**
 * Install animation methods on DOMCollection prototype
 * Called during library initialization
 */
export function installAnimationMethods() {
  // General animate method (queued, returns Promise<DOMCollection>)
  (DOMCollection as any).prototype.animate = function (keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: KeyframeAnimationOptions) {
    if (!hasDOM()) return Promise.resolve(this);
    const promises: Promise<void>[] = [];
    for (const el of this.elements) {
      promises.push(playQueued(el as HTMLElement, keyframes as any, durationWithPrefs(options)));
    }
    return Promise.all(promises).then(() => this);
  };

  // Control helpers (pause/resume/cancel/stop)
  (DOMCollection as any).prototype.pause = function () {
    if (!hasDOM()) return this;
    for (const el of this.elements) for (const a of getActiveSet(el)) a.pause();
    return this;
  };
  (DOMCollection as any).prototype.resume = function () {
    if (!hasDOM()) return this;
    for (const el of this.elements) for (const a of getActiveSet(el)) a.play();
    return this;
  };
  (DOMCollection as any).prototype.cancel = function () {
    if (!hasDOM()) return this;
    for (const el of this.elements) {
      const set = getActiveSet(el);
      for (const a of Array.from(set)) a.cancel();
      queues.set(el, Promise.resolve());
    }
    return this;
  };
  (DOMCollection as any).prototype.stop = function (jumpToEnd?: boolean) {
    if (!hasDOM()) return this;
    for (const el of this.elements) {
      const set = getActiveSet(el);
      for (const a of Array.from(set)) jumpToEnd ? a.finish() : a.cancel();
      queues.set(el, Promise.resolve());
    }
    return this;
  };

  // Animation shortcuts (integrate visibility + toggle variants)
  (DOMCollection as any).prototype.fadeIn = function (duration?: number) {
    if (!hasDOM()) return Promise.resolve(this);
    const [keyframes, base] = animations.fadeIn(duration);
    const opts = durationWithPrefs(base);
    const proms: Promise<void>[] = [];
    for (const el of this.elements) {
      const h = el as HTMLElement;
      proms.push(enqueue(h, async () => {
        showEl(h);
        if (motionDisabled()) return; // instantly visible
        const anim = track(h, animate(h, keyframes, opts));
        try { await anim.finished; } catch {}
      }));
    }
    return Promise.all(proms).then(() => this);
  };
  
  (DOMCollection as any).prototype.fadeOut = function (duration?: number) {
    if (!hasDOM()) return Promise.resolve(this);
    const [keyframes, base] = animations.fadeOut(duration);
    const opts = durationWithPrefs(base);
    const proms: Promise<void>[] = [];
    for (const el of this.elements) {
      const h = el as HTMLElement;
      proms.push(enqueue(h, async () => {
        if (motionDisabled()) { hideEl(h); return; }
        const anim = track(h, animate(h, keyframes, opts));
        try { await anim.finished; } catch {}
        hideEl(h);
      }));
    }
    return Promise.all(proms).then(() => this);
  };
  
  (DOMCollection as any).prototype.fadeToggle = function (duration?: number) {
    if (!hasDOM()) return Promise.resolve(this);
    const proms: Promise<any>[] = [];
    for (const el of this.elements) {
      const h = el as HTMLElement;
      const isHidden = getComputedStyle(h).display === 'none';
      proms.push(isHidden ? (DOMCollection as any).prototype.fadeIn.call(new DOMCollection([h]), duration)
                          : (DOMCollection as any).prototype.fadeOut.call(new DOMCollection([h]), duration));
    }
    return Promise.all(proms).then(() => this);
  };
  
  (DOMCollection as any).prototype.slideUp = function (duration?: number) {
    if (!hasDOM()) return Promise.resolve(this);
    const [keyframes, base] = animations.slideUp(duration);
    const opts = durationWithPrefs(base);
    const proms: Promise<void>[] = [];
    for (const el of this.elements) {
      const h = el as HTMLElement;
      proms.push(enqueue(h, async () => {
        if (motionDisabled()) { hideEl(h); return; }
        const anim = track(h, animate(h, keyframes, opts));
        try { await anim.finished; } catch {}
        hideEl(h);
      }));
    }
    return Promise.all(proms).then(() => this);
  };
  
  (DOMCollection as any).prototype.slideDown = function (duration?: number) {
    if (!hasDOM()) return Promise.resolve(this);
    const [keyframes, base] = animations.slideDown(duration);
    const opts = durationWithPrefs(base);
    const proms: Promise<void>[] = [];
    for (const el of this.elements) {
      const h = el as HTMLElement;
      proms.push(enqueue(h, async () => {
        showEl(h);
        if (motionDisabled()) return; // instantly visible
        const anim = track(h, animate(h, keyframes, opts));
        try { await anim.finished; } catch {}
      }));
    }
    return Promise.all(proms).then(() => this);
  };
  
  (DOMCollection as any).prototype.slideToggle = function (duration?: number) {
    if (!hasDOM()) return Promise.resolve(this);
    const proms: Promise<any>[] = [];
    for (const el of this.elements) {
      const h = el as HTMLElement;
      const isHidden = getComputedStyle(h).display === 'none';
      proms.push(isHidden ? (DOMCollection as any).prototype.slideDown.call(new DOMCollection([h]), duration)
                          : (DOMCollection as any).prototype.slideUp.call(new DOMCollection([h]), duration));
    }
    return Promise.all(proms).then(() => this);
  };
  
  (DOMCollection as any).prototype.pulse = function (duration?: number) {
    if (!hasDOM()) return Promise.resolve(this);
    const [keyframes, base] = animations.pulse(duration);
    const opts = durationWithPrefs(base);
    const proms: Promise<void>[] = [];
    for (const el of this.elements) {
      const h = el as HTMLElement;
      proms.push(playQueued(h, keyframes, opts));
    }
    return Promise.all(proms).then(() => this);
  };
  
  (DOMCollection as any).prototype.shake = function (duration?: number) {
    if (!hasDOM()) return Promise.resolve(this);
    const [keyframes, base] = animations.shake(duration);
    const opts = durationWithPrefs(base);
    const proms: Promise<void>[] = [];
    for (const el of this.elements) {
      const h = el as HTMLElement;
      proms.push(playQueued(h, keyframes, opts));
    }
    return Promise.all(proms).then(() => this);
  };
}
