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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toFinishedPromise(res: any): Promise<void> {
  if (!res) return Promise.resolve();
  // If it's a Web Animation, wait for finished
  if (res && typeof res === 'object' && 'finished' in res && typeof (res as any).finished?.then === 'function') {
    return (res as Animation).finished.then(() => {}, () => {});
  }
  // If it's a promise, await it
  if (typeof res?.then === 'function') return Promise.resolve(res).then(() => {}, () => {});
  return Promise.resolve();
}

// ——— Sequencing & Stagger helpers ———
export type SequenceStep =
  | [Keyframe[] | PropertyIndexedKeyframes, KeyframeAnimationOptions]
  | ((el: HTMLElement, idx: number) => [Keyframe[] | PropertyIndexedKeyframes, KeyframeAnimationOptions])
  | number; // delay between steps (ms)

/**
 * Compose multiple animations to run sequentially on a single element.
 * Returns a runner that, when called with (el, idx), enqueues the steps
 * on that element and waits for completion.
 */
export function sequence(steps: SequenceStep[]) {
  return async (el: HTMLElement, idx: number) => {
    return enqueue(el, async () => {
      for (const step of steps) {
        if (typeof step === 'number') { await sleep(Math.max(0, motionDisabled() ? 0 : step)); continue; }
        const [kf, base] = typeof step === 'function' ? step(el, idx) : step;
        const opts = durationWithPrefs(base);
        if (motionDisabled()) continue;
        const anim = track(el, animate(el, kf as any, opts));
        try { await anim.finished; } catch {}
      }
    });
  };
}

/**
 * Run a function for each element with a staggered start time.
 * The function result may be an Animation or a Promise and will be awaited.
 * Integrates with per-element queue so staggered work is queued as well.
 */
export function stagger(stepMs: number, fn: (el: HTMLElement, idx: number) => any) {
  return async (els: ArrayLike<Element> | DOMCollection) => {
    const arr: Element[] = els instanceof DOMCollection ? (els as any).elements : Array.from(els as ArrayLike<Element>);
    const proms: Promise<void>[] = [];
    for (let i = 0; i < arr.length; i++) {
      const el = arr[i] as HTMLElement;
      proms.push(enqueue(el, async () => {
        if (stepMs > 0) await sleep((motionDisabled() ? 0 : i * stepMs));
        const res = fn(el, i);
        await toFinishedPromise(res);
      }));
    }
    await Promise.all(proms);
  };
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

  // Visibility helper: returns an object with animation methods that ensure the
  // element is visible (sets display) before animating. Useful when duration is
  // reduced to 0 by prefers-reduced-motion, to still land in a visible state.
  (DOMCollection as any).prototype.withVisible = function (display?: string) {
    const base: DOMCollection = this;
    const setVisible = (h: HTMLElement) => {
      if (display !== undefined) {
        (h.style.display as any) = display;
      } else {
        showEl(h);
      }
    };
    const api: any = {};
    api.animate = function (keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: KeyframeAnimationOptions) {
      if (!hasDOM()) return Promise.resolve(base);
      const promises: Promise<void>[] = [];
      for (const el of base.elements) {
        const h = el as HTMLElement;
        promises.push(enqueue(h, async () => {
          setVisible(h);
          if (motionDisabled()) return; // already visible; no animation
          const anim = track(h, animate(h, keyframes as any, durationWithPrefs(options)));
          try { await anim.finished; } catch {}
        }));
      }
      return Promise.all(promises).then(() => base);
    };
    api.sequence = function (steps: SequenceStep[]) {
      if (!hasDOM()) return Promise.resolve(base);
      const proms: Promise<void>[] = [];
      for (let i = 0; i < base.elements.length; i++) {
        const h = base.elements[i] as HTMLElement;
        proms.push(enqueue(h, async () => {
          setVisible(h);
          for (const step of steps) {
            if (typeof step === 'number') { await sleep(Math.max(0, motionDisabled() ? 0 : step)); continue; }
            const [keyframes, baseOpts] = typeof step === 'function' ? step(h, i) : step;
            const opts = durationWithPrefs(baseOpts);
            if (motionDisabled()) continue;
            const anim = track(h, animate(h, keyframes as any, opts));
            try { await anim.finished; } catch {}
          }
        }));
      }
      return Promise.all(proms).then(() => base);
    };
    api.fadeIn = function (duration?: number) {
      const [kf, op] = animations.fadeIn(duration);
      return api.animate(kf, op);
    };
    api.slideDown = function (duration?: number) {
      const [kf, op] = animations.slideDown(duration);
      return api.animate(kf, op);
    };
    return api;
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

  // Sequence: run multiple animations one after another per element
  (DOMCollection as any).prototype.sequence = function (steps: SequenceStep[]) {
    if (!hasDOM()) return Promise.resolve(this);
    const proms: Promise<void>[] = [];
    for (let i = 0; i < this.elements.length; i++) {
      const h = this.elements[i] as HTMLElement;
      proms.push(enqueue(h, async () => {
        for (const step of steps) {
          if (typeof step === 'number') { await sleep(Math.max(0, motionDisabled() ? 0 : step)); continue; }
          const [keyframes, base] = typeof step === 'function' ? step(h, i) : step;
          const opts = durationWithPrefs(base);
          if (motionDisabled()) continue;
          const anim = track(h, animate(h, keyframes as any, opts));
          try { await anim.finished; } catch {}
        }
      }));
    }
    return Promise.all(proms).then(() => this);
  };

  // Stagger: run a user function per element with staggered delays, integrated with queue
  (DOMCollection as any).prototype.stagger = function (stepMs: number, fn: (el: HTMLElement, idx: number) => any) {
    if (!hasDOM()) return Promise.resolve(this);
    const proms: Promise<void>[] = [];
    for (let i = 0; i < this.elements.length; i++) {
      const h = this.elements[i] as HTMLElement;
      proms.push(enqueue(h, async () => {
        if (stepMs > 0) await sleep((motionDisabled() ? 0 : i * stepMs));
        const res = fn(h, i);
        await toFinishedPromise(res);
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
