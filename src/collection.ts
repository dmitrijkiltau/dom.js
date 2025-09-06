import { CSSInput, CSSValue, Handler } from './types';
import { serializeForm as serializeFormEl, toFormData as toFD, setForm as setFormValues, resetForm as resetFormEl } from './forms';
import { addManaged, removeManaged, removeAllManaged } from './events';
import { camelToKebab, toArray, isElement } from './utils';

// CSS helpers
const UNITLESS_CSS_PROPS = new Set<string>([
  'opacity', 'z-index', 'font-weight', 'line-height',
  'flex', 'flex-grow', 'flex-shrink', 'order',
  'grid-row-start', 'grid-row-end', 'grid-column-start', 'grid-column-end',
  'scale', 'zoom', 'orphans', 'widows', 'tab-size', 'column-count'
]);

function formatCssValue(propKebab: string, value: string | number): string {
  if (typeof value !== 'number') return String(value);
  if (propKebab.startsWith('--')) return String(value);
  return UNITLESS_CSS_PROPS.has(propKebab) ? String(value) : `${value}px`;
}

/**
 * Chainable collection of DOM elements. Generic parameter `T` narrows the
 * contained element type for better DX (e.g. DOMCollection<HTMLButtonElement>).
 */
export class DOMCollection<T extends Element = Element> {
  elements: T[];

  constructor(input: ArrayLike<T> | T[] | null | undefined) {
    this.elements = toArray(input) as T[];
  }

  // Core iterator
  each(fn: (el: T, idx: number) => void): this {
    for (let i = 0; i < this.elements.length; i++) fn(this.elements[i], i);
    return this;
  }

  // Basic DOM read helpers
  get length(): number { return this.elements.length; }
  el<U extends T = T>(i?: number): U | undefined { return this.elements[(i ?? 0)] as U | undefined; }
  first(): DOMCollection<T> { return new DOMCollection<T>(this.elements.length ? [this.elements[0]] : []); }
  last(): DOMCollection<T> { return new DOMCollection<T>(this.elements.length ? [this.elements[this.elements.length - 1]] : []); }
  eq(i: number): DOMCollection<T> { return new DOMCollection<T>(this.elements[i] ? [this.elements[i]] : []); }
  find(selector: string): DOMCollection {
    const found: Element[] = [];
    for (const el of this.elements) found.push(...toArray(el.querySelectorAll(selector)));
    return new DOMCollection(found);
  }
  filter(selector: string | ((el: T, idx: number) => boolean)): DOMCollection<T> | DOMCollection {
    if (typeof selector === 'function') {
      const filtered: T[] = [];
      for (let i = 0; i < this.elements.length; i++) {
        if (selector(this.elements[i], i)) filtered.push(this.elements[i]);
      }
      return new DOMCollection<T>(filtered);
    }
    return new DOMCollection(this.elements.filter(el => el.matches(selector)));
  }

  // Traversal methods
  children(selector?: string): DOMCollection {
    const kids: Element[] = [];
    for (const el of this.elements) {
      for (const c of toArray(el.children)) {
        if (!selector || (c as Element).matches(selector)) {
          if (!kids.includes(c as Element)) kids.push(c as Element);
        }
      }
    }
    return new DOMCollection(kids);
  }
  closest(selector: string): DOMCollection {
    const matches: Element[] = [];
    for (const el of this.elements) {
      const m = el.closest(selector);
      if (m && !matches.includes(m)) matches.push(m);
    }
    return new DOMCollection(matches);
  }
  next(selector?: string): DOMCollection {
    const out: Element[] = [];
    for (const el of this.elements) {
      const n = (el as any).nextElementSibling as Element | null;
      if (!n) continue;
      if (!selector || n.matches(selector)) {
        if (!out.includes(n)) out.push(n);
      }
    }
    return new DOMCollection(out);
  }
  prev(selector?: string): DOMCollection {
    const out: Element[] = [];
    for (const el of this.elements) {
      const p = (el as any).previousElementSibling as Element | null;
      if (!p) continue;
      if (!selector || p.matches(selector)) {
        if (!out.includes(p)) out.push(p);
      }
    }
    return new DOMCollection(out);
  }
  parent(): DOMCollection {
    const parents: Element[] = [];
    for (const el of this.elements) {
      if (el.parentElement && !parents.includes(el.parentElement)) {
        parents.push(el.parentElement);
      }
    }
    return new DOMCollection(parents);
  }
  parents(selector?: string): DOMCollection {
    const ancestors: Element[] = [];
    for (const el of this.elements) {
      let current = el.parentElement;
      while (current) {
        if (!ancestors.includes(current)) {
          if (!selector || current.matches(selector)) {
            ancestors.push(current);
          }
        }
        current = current.parentElement;
      }
    }
    return new DOMCollection(ancestors);
  }
  siblings(selector?: string): DOMCollection {
    const siblings: Element[] = [];
    for (const el of this.elements) {
      if (el.parentElement) {
        for (const sibling of toArray(el.parentElement.children)) {
          if (sibling !== el && !siblings.includes(sibling)) {
            if (!selector || sibling.matches(selector)) {
              siblings.push(sibling);
            }
          }
        }
      }
    }
    return new DOMCollection(siblings);
  }

  // Collection tests and set operations
  is(selectorOrEl: string | Element | DOMCollection | ((el: T, idx: number) => boolean)): boolean {
    if (typeof selectorOrEl === 'function') return this.elements.some((el, i) => selectorOrEl(el, i));
    if (typeof selectorOrEl === 'string') return this.elements.some(el => el.matches(selectorOrEl));
    if (selectorOrEl instanceof DOMCollection) {
      const set = new Set(selectorOrEl.elements);
      return this.elements.some(el => set.has(el));
    }
    if (isElement(selectorOrEl)) return this.elements.some(el => el === selectorOrEl);
    return false;
  }
  not(selectorOrEl: string | Element | DOMCollection | ((el: T, idx: number) => boolean)): DOMCollection<T> | DOMCollection {
    if (typeof selectorOrEl === 'function') return new DOMCollection(this.elements.filter((el, i) => !selectorOrEl(el, i)));
    if (typeof selectorOrEl === 'string') return new DOMCollection(this.elements.filter(el => !el.matches(selectorOrEl)));
    if (selectorOrEl instanceof DOMCollection) {
      const set = new Set(selectorOrEl.elements);
      return new DOMCollection(this.elements.filter(el => !set.has(el)));
    }
    if (isElement(selectorOrEl)) return new DOMCollection(this.elements.filter(el => el !== selectorOrEl));
    return new DOMCollection(this.elements.slice());
  }
  has(selectorOrEl: string | Element | DOMCollection): DOMCollection {
    if (typeof selectorOrEl === 'string') return new DOMCollection(this.elements.filter(el => !!el.querySelector(selectorOrEl)));
    if (selectorOrEl instanceof DOMCollection) {
      const set = new Set(selectorOrEl.elements);
      return new DOMCollection(this.elements.filter(el => {
        for (const c of set) if (el.contains(c)) return true;
        return false;
      }));
    }
    if (isElement(selectorOrEl)) return new DOMCollection(this.elements.filter(el => el.contains(selectorOrEl)));
    return new DOMCollection([]);
  }
  add(input: string | Element | ArrayLike<Element> | DOMCollection): DOMCollection {
    let addl: Element[] = [];
    if (typeof input === 'string') addl = toArray(document.querySelectorAll(input));
    else if (input instanceof DOMCollection) addl = input.elements;
    else if (isElement(input)) addl = [input];
    else addl = toArray(input);
    const out: Element[] = [];
    const base = this.elements as unknown as Element[];
    for (const el of base.concat(addl)) if (el && !out.includes(el)) out.push(el);
    return new DOMCollection(out);
  }
  index(): number {
    const el = this.elements[0];
    if (!el || !el.parentElement) return -1;
    const kids = toArray(el.parentElement.children);
    return kids.indexOf(el);
  }
  slice(start?: number, end?: number): DOMCollection<T> {
    return new DOMCollection<T>(this.elements.slice(start, end));
  }
  map<U>(fn: (el: T, idx: number) => U): U[] {
    return this.elements.map((el, i) => fn(el, i));
  }
  get(): T[];
  get(index: number): T | undefined;
  get(index?: number): T | T[] | undefined {
    if (index === undefined) return this.elements.slice();
    return this.elements[index];
  }

  // Content
  text(value?: string | number | null): any {
    if (value === undefined) return (this.elements[0] as unknown as HTMLElement | undefined)?.textContent ?? '';
    return this.each(el => (el as unknown as HTMLElement).textContent = value == null ? '' : String(value));
  }
  html(): string;
  html(value: string | number | null | Node | DOMCollection): this;
  html(fn: (el: T, idx: number) => string | number | null | Node | DOMCollection): this;
  html(value?: any): any {
    if (value === undefined) return (this.elements[0] as unknown as HTMLElement | undefined)?.innerHTML ?? '';
    if (typeof value === 'function') {
      const fn = value as (el: T, idx: number) => string | number | null | Node | DOMCollection;
      return this.each((el, i) => {
        const res = fn(el, i);
        const h = el as unknown as HTMLElement;
        if (typeof res === 'string' || typeof res === 'number' || res === null) {
          h.innerHTML = res == null ? '' : String(res);
        } else if (res instanceof DOMCollection) {
          h.innerHTML = '';
          for (const n of res.elements) el.appendChild(n);
        } else if (res instanceof Node) {
          h.innerHTML = '';
          el.appendChild(res);
        } else {
          h.innerHTML = res == null ? '' : String(res as any);
        }
      });
    }
    if (typeof value === 'string' || typeof value === 'number' || value === null) {
      return this.each(el => (el as unknown as HTMLElement).innerHTML = value == null ? '' : String(value));
    }
    // Replace content with provided node(s)
    if (value instanceof DOMCollection) {
      return this.each(el => {
        (el as unknown as HTMLElement).innerHTML = '';
        for (const n of value.elements) el.appendChild(n);
      });
    }
    // Single Node
    return this.each(el => {
      (el as unknown as HTMLElement).innerHTML = '';
      el.appendChild(value as Node);
    });
  }

  append(child: string | Node | DOMCollection): this {
    if (child == null) return this;
    const recipients = this.elements;
    const lastIdx = recipients.length - 1;
    for (let i = 0; i < recipients.length; i++) {
      const el = recipients[i];
      if (typeof child === 'string') {
        (el as unknown as HTMLElement).insertAdjacentHTML('beforeend', child);
      } else if (child instanceof DOMCollection) {
        for (const n of child.elements) {
          el.appendChild(i === lastIdx ? n : n.cloneNode(true));
        }
      } else {
        el.appendChild(i === lastIdx ? child : child.cloneNode(true));
      }
    }
    return this;
  }
  prepend(child: string | Node | DOMCollection): this {
    if (child == null) return this;
    const recipients = this.elements;
    const lastIdx = recipients.length - 1;
    for (let i = 0; i < recipients.length; i++) {
      const el = recipients[i];
      if (typeof child === 'string') {
        (el as unknown as HTMLElement).insertAdjacentHTML('afterbegin', child);
      } else if (child instanceof DOMCollection) {
        // Insert in order so final order matches input
        const first = el.firstChild;
        for (let j = child.elements.length - 1; j >= 0; j--) {
          const n = child.elements[j];
          el.insertBefore(i === lastIdx ? n : n.cloneNode(true), first);
        }
      } else {
        el.insertBefore(i === lastIdx ? child : child.cloneNode(true), el.firstChild);
      }
    }
    return this;
  }
  appendTo(target: string | Element | DOMCollection): this {
    if (typeof target === 'string') {
      new DOMCollection(document.querySelectorAll(target)).append(this);
    } else if (target instanceof DOMCollection) {
      target.append(this);
    } else if (isElement(target)) {
      target.append(...this.elements);
    }
    return this;
  }
  prependTo(target: string | Element | DOMCollection): this {
    if (typeof target === 'string') {
      new DOMCollection(document.querySelectorAll(target)).prepend(this);
    } else if (target instanceof DOMCollection) {
      target.prepend(this);
    } else if (isElement(target)) {
      (target as any).prepend(...this.elements);
    }
    return this;
  }
  insertAfter(target: string | Element | DOMCollection): this {
    let targets: Element[] = [];
    if (typeof target === 'string') targets = Array.from(document.querySelectorAll(target));
    else if (target instanceof DOMCollection) targets = target.elements;
    else if (isElement(target)) targets = [target];
    if (!targets.length) return this;
    const lastIdx = targets.length - 1;
    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      const nodes = i === lastIdx ? this.elements : this.elements.map(n => n.cloneNode(true) as Element);
      (t as any).after(...nodes);
    }
    return this;
  }
  insertBefore(target: string | Element | DOMCollection): this {
    let targets: Element[] = [];
    if (typeof target === 'string') targets = Array.from(document.querySelectorAll(target));
    else if (target instanceof DOMCollection) targets = target.elements;
    else if (isElement(target)) targets = [target];
    if (!targets.length) return this;
    const lastIdx = targets.length - 1;
    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      const parent = t.parentNode;
      if (!parent) continue;
      const nodes = i === lastIdx ? this.elements : this.elements.map(n => n.cloneNode(true) as Element);
      for (const n of nodes) parent.insertBefore(n, t);
    }
    return this;
  }

  // DOM manipulation
  remove(): this {
    return this.each(el => el.remove());
  }
  empty(): this {
    return this.each(el => el.innerHTML = '');
  }
  clone(deep: boolean = true): DOMCollection {
    const cloned: Element[] = [];
    for (const el of this.elements) {
      cloned.push(el.cloneNode(deep) as Element);
    }
    return new DOMCollection(cloned);
  }

  after(content: string | Node | DOMCollection): this {
    for (const el of this.elements) {
      if (typeof content === 'string') {
        el.insertAdjacentHTML('afterend', content);
      } else if (content instanceof DOMCollection) {
        for (const node of content.elements) {
          el.after(node.cloneNode(true));
        }
      } else {
        el.after(content.cloneNode(true));
      }
    }
    return this;
  }
  before(content: string | Node | DOMCollection): this {
    for (const el of this.elements) {
      if (typeof content === 'string') {
        el.insertAdjacentHTML('beforebegin', content);
      } else if (content instanceof DOMCollection) {
        for (const node of content.elements) {
          el.before(node.cloneNode(true));
        }
      } else {
        el.before(content.cloneNode(true));
      }
    }
    return this;
  }

  replaceWith(content: string | Node | DOMCollection): this {
    for (const el of this.elements) {
      if (typeof content === 'string') {
        (el as unknown as HTMLElement).outerHTML = content;
      } else if (content instanceof DOMCollection) {
        const clones = content.elements.map(node => node.cloneNode(true));
        (el as any).replaceWith(...clones);
      } else {
        el.replaceWith(content.cloneNode(true));
      }
    }
    return this;
  }

  replaceAll(target: Element | DOMCollection | string): this {
    let targets: Element[] = [];
    if (typeof target === 'string') targets = Array.from(document.querySelectorAll(target));
    else if (target instanceof DOMCollection) targets = target.elements;
    else if (isElement(target)) targets = [target];
    if (!targets.length) return this;
    const lastIdx = targets.length - 1;
    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      const parent = t.parentNode;
      if (!parent) continue;
      if (this.elements.length === 0) {
        // If nothing to insert, just remove targets
        t.remove();
        continue;
      }
      const nodes = i === lastIdx ? this.elements : this.elements.map(n => n.cloneNode(true) as Element);
      (t as any).replaceWith(...nodes);
    }
    return this;
  }

  wrap(wrapper: string | Element | DOMCollection): this {
    for (const el of this.elements) {
      let wrapEl: Element | null = null;
      if (typeof wrapper === 'string') {
        const s = wrapper.trim();
        if (s.startsWith('<') && s.includes('>')) {
          const tmp = document.createElement('div');
          tmp.innerHTML = s;
          wrapEl = tmp.firstElementChild as Element | null;
        } else {
          const found = document.querySelector(s) as Element | null;
          wrapEl = found ? (found.cloneNode(true) as Element) : null;
        }
      } else if (wrapper instanceof DOMCollection) {
        wrapEl = (wrapper.elements[0]?.cloneNode(true) as Element) || null;
      } else if (wrapper instanceof Element) {
        wrapEl = wrapper.cloneNode(true) as Element;
      }
      if (!wrapEl) continue;
      const parent = el.parentNode;
      if (!parent) continue;
      parent.insertBefore(wrapEl, el);
      let target: Element = wrapEl;
      while (target.firstElementChild) target = target.firstElementChild as Element;
      target.appendChild(el);
    }
    return this;
  }

  wrapAll(wrapper: string | Element | DOMCollection): this {
    if (this.elements.length === 0) return this;
    // Resolve wrapper element (use first element of wrapper if multiple)
    let wrapEl: Element | null = null;
    if (typeof wrapper === 'string') {
      const s = wrapper.trim();
      if (s.startsWith('<') && s.includes('>')) {
        const tmp = document.createElement('div');
        tmp.innerHTML = s;
        wrapEl = tmp.firstElementChild as Element | null;
      } else {
        const found = document.querySelector(s) as Element | null;
        wrapEl = found ? (found.cloneNode(true) as Element) : null;
      }
    } else if (wrapper instanceof DOMCollection) {
      wrapEl = (wrapper.elements[0]?.cloneNode(true) as Element) || null;
    } else if (wrapper instanceof Element) {
      wrapEl = wrapper.cloneNode(true) as Element;
    }
    if (!wrapEl) return this;
    // Find insertion parent/before for the first element
    const firstEl = this.elements[0];
    const parent = firstEl.parentNode;
    if (!parent) return this;
    parent.insertBefore(wrapEl, firstEl);
    // Find deepest descendant to append into
    let target: Element = wrapEl;
    while (target.firstElementChild) target = target.firstElementChild as Element;
    for (const el of this.elements) target.appendChild(el);
    return this;
  }

  wrapInner(wrapper: string | Element | DOMCollection): this {
    for (const el of this.elements) {
      let wrapEl: Element | null = null;
      if (typeof wrapper === 'string') {
        const s = wrapper.trim();
        if (s.startsWith('<') && s.includes('>')) {
          const tmp = document.createElement('div');
          tmp.innerHTML = s;
          wrapEl = tmp.firstElementChild as Element | null;
        } else {
          const found = document.querySelector(s) as Element | null;
          wrapEl = found ? (found.cloneNode(true) as Element) : null;
        }
      } else if (wrapper instanceof DOMCollection) {
        wrapEl = (wrapper.elements[0]?.cloneNode(true) as Element) || null;
      } else if (wrapper instanceof Element) {
        wrapEl = wrapper.cloneNode(true) as Element;
      }
      if (!wrapEl) continue;
      // Insert wrapper as the first child
      el.insertBefore(wrapEl, el.firstChild);
      // Find deepest descendant within wrapper
      let target: Element = wrapEl;
      while (target.firstElementChild) target = target.firstElementChild as Element;
      // Move all existing child nodes into the wrapper target
      while (wrapEl.previousSibling) {
        const n = wrapEl.previousSibling;
        target.insertBefore(n, target.firstChild);
      }
      // Move any remaining nodes after wrapper (if insertion wasn't at start)
      while (wrapEl.nextSibling) {
        const n = wrapEl.nextSibling;
        target.appendChild(n);
      }
    }
    return this;
  }

  unwrap(): this {
    const parents: Element[] = [];
    for (const el of this.elements) {
      const p = el.parentElement;
      if (p && !parents.includes(p)) parents.push(p);
    }
    for (const p of parents) {
      const gp = p.parentNode;
      if (!gp) continue;
      while (p.firstChild) gp.insertBefore(p.firstChild, p);
      p.remove();
    }
    return this;
  }

  detach(): this {
    // In this library, event listeners and data attributes are retained on nodes
    // when they are removed from the DOM. detach() mirrors jQuery semantics.
    return this.each(el => el.remove());
  }

  // Attributes
  attr(name: string, value?: string | number | null): any {
    if (value === undefined) return this.elements[0]?.getAttribute(name) ?? null;
    return this.each(el => {
      if (value == null) el.removeAttribute(name); else el.setAttribute(name, String(value));
    });
  }
  attrs(obj: Record<string, string | number | null | undefined>): this {
    return this.each(el => {
      for (const [name, value] of Object.entries(obj)) {
        if (value == null) el.removeAttribute(name); else el.setAttribute(name, String(value));
      }
    });
  }

  // Properties (for form elements, etc.)
  prop(name: string, value?: any): any {
    if (value === undefined) return (this.elements[0] as any)?.[name] ?? null;
    return this.each(el => (el as any)[name] = value);
  }

  // Form element values
  val(value?: string | number | null): any {
    if (value === undefined) {
      const el = this.elements[0];
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
        return el.value;
      }
      return null;
    }
    return this.each(el => {
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
        el.value = value == null ? '' : String(value);
      }
    });
  }

  // Classes
  addClass(...names: string[]): this { 
    const allNames = names.flatMap(name => name.split(/\s+/).filter(Boolean));
    return this.each(el => el.classList.add(...allNames)); 
  }
  removeClass(...names: string[]): this { 
    const allNames = names.flatMap(name => name.split(/\s+/).filter(Boolean));
    return this.each(el => el.classList.remove(...allNames)); 
  }
  replaceClass(oldClasses: string, newClasses: string): this {
    const oldNames = oldClasses.split(/\s+/).filter(Boolean);
    const newNames = newClasses.split(/\s+/).filter(Boolean);
    return this.each(el => {
      el.classList.remove(...oldNames);
      el.classList.add(...newNames);
    });
  }
  toggleClass(map: Record<string, boolean>): this;
  toggleClass(name: string, force?: boolean): this;
  toggleClass(nameOrMap: string | Record<string, boolean>, force?: boolean): this {
    if (typeof nameOrMap === 'object') {
      const entries = Object.entries(nameOrMap);
      return this.each(el => {
        for (const [key, shouldEnable] of entries) {
          const names = String(key).split(/\s+/).filter(Boolean);
          for (const n of names) el.classList.toggle(n, !!shouldEnable);
        }
      });
    }
    const allNames = String(nameOrMap).split(/\s+/).filter(Boolean);
    return this.each(el => {
      for (const n of allNames) el.classList.toggle(n, force as any);
    });
  }
  hasClass(name: string): boolean { return !!this.elements[0]?.classList.contains(name); }

  // CSS
  css(nameOrInput: string | CSSInput, value?: CSSValue | null): any {
    if (typeof nameOrInput === 'string') {
      if (value === undefined) {
        const first = this.elements[0] as Element | undefined;
        if (!first) return '';
        return getComputedStyle(first).getPropertyValue(camelToKebab(nameOrInput)).trim();
      }
      return this.each(el => {
        const s = (el as unknown as HTMLElement).style;
        const prop = camelToKebab(nameOrInput);
        if (value === null) s.removeProperty(prop);
        else s.setProperty(prop, formatCssValue(prop, value as any));
      });
    }
    const map = nameOrInput;
    return this.each(el => {
      const s = (el as unknown as HTMLElement).style;
      for (const [k, v] of Object.entries(map)) {
        const prop = camelToKebab(k);
        if (v == null) s.removeProperty(prop);
        else s.setProperty(prop, formatCssValue(prop, v as any));
      }
    });
  }

  // CSS Custom Properties (variables)
  cssVar(name: string): string;
  cssVar(name: string, value: string | number | null): this;
  cssVar(name: string, value?: string | number | null): any {
    const prop = name.startsWith('--') ? name : `--${name}`;
    if (value === undefined) {
      const first = this.elements[0] as Element | undefined;
      if (!first) return '';
      return getComputedStyle(first).getPropertyValue(prop).trim();
    }
    return this.each(el => {
      const s = (el as unknown as HTMLElement).style;
      if (value == null) s.removeProperty(prop);
      else s.setProperty(prop, String(value));
    });
  }

  cssVars(map: Record<string, string | number | null | undefined>): this {
    return this.each(el => {
      const s = (el as unknown as HTMLElement).style;
      for (const [k, v] of Object.entries(map)) {
        const prop = k.startsWith('--') ? k : `--${k}`;
        if (v == null) s.removeProperty(prop); else s.setProperty(prop, String(v));
      }
    });
  }

  show(display: string = ''): this { return this.each(el => (el as unknown as HTMLElement).style.display = display); }
  hide(): this { return this.each(el => (el as unknown as HTMLElement).style.display = 'none'); }
  toggle(force?: boolean): this {
    return this.each(el => {
      const h = (el as unknown as HTMLElement).style.display === 'none' || getComputedStyle(el).display === 'none';
      const shouldShow = force ?? h;
      (el as unknown as HTMLElement).style.display = shouldShow ? '' : 'none';
    });
  }

  isVisible(): boolean {
    const el = this.elements[0] as Element | undefined;
    if (!el) return false;
    // Must be connected to the document to be considered visible
    if (!(el as any).isConnected) return false;
    // Check computed styles on self and ancestors for display/visibility
    let cur: Element | null = el;
    while (cur && cur instanceof Element) {
      const cs = getComputedStyle(cur);
      if (cs.display === 'none') return false;
      if (cs.visibility === 'hidden' || cs.visibility === 'collapse') return false;
      cur = cur.parentElement;
    }
    // Has layout boxes
    const rects = (el as unknown as HTMLElement).getClientRects();
    if (rects && rects.length > 0) return true;
    const rect = (el as unknown as HTMLElement).getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  // Layout & geometry
  width(): number;
  width(value: number | string | null): this;
  width(value?: number | string | null): any {
    const first = this.elements[0] as unknown as HTMLElement | undefined;
    if (value === undefined) {
      if (!first) return 0;
      const rect = first.getBoundingClientRect();
      const cs = getComputedStyle(first);
      const pl = parseFloat(cs.paddingLeft) || 0;
      const pr = parseFloat(cs.paddingRight) || 0;
      const bl = parseFloat(cs.borderLeftWidth) || 0;
      const br = parseFloat(cs.borderRightWidth) || 0;
      return Math.max(0, rect.width - pl - pr - bl - br);
    }
    return this.each(el => {
      const s = (el as unknown as HTMLElement).style;
      if (value == null) s.removeProperty('width');
      else s.width = typeof value === 'number' ? `${value}px` : String(value);
    });
  }

  height(): number;
  height(value: number | string | null): this;
  height(value?: number | string | null): any {
    const first = this.elements[0] as unknown as HTMLElement | undefined;
    if (value === undefined) {
      if (!first) return 0;
      const rect = first.getBoundingClientRect();
      const cs = getComputedStyle(first);
      const pt = parseFloat(cs.paddingTop) || 0;
      const pb = parseFloat(cs.paddingBottom) || 0;
      const bt = parseFloat(cs.borderTopWidth) || 0;
      const bb = parseFloat(cs.borderBottomWidth) || 0;
      return Math.max(0, rect.height - pt - pb - bt - bb);
    }
    return this.each(el => {
      const s = (el as unknown as HTMLElement).style;
      if (value == null) s.removeProperty('height');
      else s.height = typeof value === 'number' ? `${value}px` : String(value);
    });
  }

  innerWidth(): number {
    const first = this.elements[0] as unknown as HTMLElement | undefined;
    if (!first) return 0;
    const rect = first.getBoundingClientRect();
    const cs = getComputedStyle(first);
    const bl = parseFloat(cs.borderLeftWidth) || 0;
    const br = parseFloat(cs.borderRightWidth) || 0;
    return Math.max(0, rect.width - bl - br);
  }

  innerHeight(): number {
    const first = this.elements[0] as unknown as HTMLElement | undefined;
    if (!first) return 0;
    const rect = first.getBoundingClientRect();
    const cs = getComputedStyle(first);
    const bt = parseFloat(cs.borderTopWidth) || 0;
    const bb = parseFloat(cs.borderBottomWidth) || 0;
    return Math.max(0, rect.height - bt - bb);
  }

  // Batch computed style getter
  computed(names: string | string[]): Record<string, string> {
    const first = this.elements[0] as Element | undefined;
    const list = Array.isArray(names) ? names : String(names).split(/[\s,]+/).filter(Boolean);
    const out: Record<string, string> = {};
    if (!first) return out;
    const cs = getComputedStyle(first);
    for (const name of list) {
      const prop = camelToKebab(name);
      out[name] = cs.getPropertyValue(prop).trim();
    }
    return out;
  }

  outerWidth(includeMargin: boolean = false): number {
    const first = this.elements[0] as unknown as HTMLElement | undefined;
    if (!first) return 0;
    const rect = first.getBoundingClientRect();
    if (!includeMargin) return rect.width;
    const cs = getComputedStyle(first);
    const ml = parseFloat(cs.marginLeft) || 0;
    const mr = parseFloat(cs.marginRight) || 0;
    return rect.width + ml + mr;
  }

  outerHeight(includeMargin: boolean = false): number {
    const first = this.elements[0] as unknown as HTMLElement | undefined;
    if (!first) return 0;
    const rect = first.getBoundingClientRect();
    if (!includeMargin) return rect.height;
    const cs = getComputedStyle(first);
    const mt = parseFloat(cs.marginTop) || 0;
    const mb = parseFloat(cs.marginBottom) || 0;
    return rect.height + mt + mb;
  }

  offset(): { top: number; left: number } {
    const first = this.elements[0] as unknown as HTMLElement | undefined;
    if (!first) return { top: 0, left: 0 };
    const rect = first.getBoundingClientRect();
    const top = rect.top + (window.pageYOffset || document.documentElement.scrollTop || 0);
    const left = rect.left + (window.pageXOffset || document.documentElement.scrollLeft || 0);
    return { top, left };
  }

  position(): { top: number; left: number } {
    const first = this.elements[0] as unknown as HTMLElement | undefined;
    if (!first) return { top: 0, left: 0 };
    const parent = (first.offsetParent as Element | null) || document.documentElement;
    const parentEl = parent as unknown as HTMLElement;
    const rect = first.getBoundingClientRect();
    const parentRect = parentEl.getBoundingClientRect();
    const pcs = getComputedStyle(parentEl);
    const borderTop = parseFloat(pcs.borderTopWidth) || 0;
    const borderLeft = parseFloat(pcs.borderLeftWidth) || 0;
    return {
      top: rect.top - parentRect.top - borderTop,
      left: rect.left - parentRect.left - borderLeft
    };
  }

  offsetParent(): DOMCollection {
    const first = this.elements[0] as unknown as HTMLElement | undefined;
    const parent = first ? ((first.offsetParent as Element | null) || document.documentElement) : null;
    return new DOMCollection(parent ? [parent] : []);
  }

  scrollTop(): number;
  scrollTop(value: number): this;
  scrollTop(value?: number): any {
    const first = this.elements[0] as unknown as HTMLElement | undefined;
    if (value === undefined) return first ? (first as any).scrollTop ?? 0 : 0;
    return this.each(el => { (el as any).scrollTop = value; });
  }

  scrollLeft(): number;
  scrollLeft(value: number): this;
  scrollLeft(value?: number): any {
    const first = this.elements[0] as unknown as HTMLElement | undefined;
    if (value === undefined) return first ? (first as any).scrollLeft ?? 0 : 0;
    return this.each(el => { (el as any).scrollLeft = value; });
  }

  rect(): { top: number; left: number; right: number; bottom: number; width: number; height: number; x: number; y: number } {
    const first = this.elements[0] as Element | undefined;
    if (!first) return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 };
    const r = first.getBoundingClientRect();
    return { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height, x: (r as any).x ?? r.left, y: (r as any).y ?? r.top };
  }

  // Events (direct + delegated), supports: options object, multi-types, namespacing
  /**
   * Bind event handlers to each element in the collection.
   *
   * - Direct: `on('click', (e, el) => ...)`
   * - Delegated: `on('click', 'a.item', (e, link) => ...)`
   * - Supports multiple space-separated types and namespaces (e.g. `"click ns1"` or `"click.ns"`)
   * - Overloads provide strong typing for common DOM events by name
   */
  // Overloads for stricter typing by event name for direct and delegated usage
  on<K extends keyof GlobalEventHandlersEventMap>(
    types: K,
    handler: Handler<GlobalEventHandlersEventMap[K], T>,
    options?: boolean | AddEventListenerOptions
  ): this;
  on<K extends keyof GlobalEventHandlersEventMap, U extends Element = Element>(
    types: K,
    selector: string,
    handler: Handler<GlobalEventHandlersEventMap[K], U>,
    options?: boolean | AddEventListenerOptions
  ): this;
  on(
    types: string,
    handler: Handler,
    options?: boolean | AddEventListenerOptions
  ): this;
  on(
    types: string,
    selector: string,
    handler: Handler,
    options?: boolean | AddEventListenerOptions
  ): this;
  on(types: string, selectorOrHandler: any, maybeHandler?: any, options?: boolean | AddEventListenerOptions): this {
    if (typeof selectorOrHandler === 'function') {
      const handler = selectorOrHandler as Handler;
      const opts = (maybeHandler as any) as boolean | AddEventListenerOptions | undefined;
      return this.each((el, i) => {
        addManaged(el, types, () => (ev: Event) => handler(ev, el, i), handler as any, opts);
      });
    }
    const selector = String(selectorOrHandler);
    const handler = maybeHandler as Handler;
    const opts = options as boolean | AddEventListenerOptions | undefined;
    return this.each((el, i) => {
      addManaged(el, types, () => (ev: Event) => {
        const target = ev.target as Element | null;
        if (!target) return;
        const match = target.closest(selector);
        if (match && (el as any).contains(match)) handler(ev, match, i);
      }, handler as any, opts, selector);
    });
  }
  once<K extends keyof GlobalEventHandlersEventMap>(
    types: K,
    handler: Handler<GlobalEventHandlersEventMap[K], T>,
    options?: boolean | AddEventListenerOptions
  ): this;
  once<K extends keyof GlobalEventHandlersEventMap, U extends Element = Element>(
    types: K,
    selector: string,
    handler: Handler<GlobalEventHandlersEventMap[K], U>,
    options?: boolean | AddEventListenerOptions
  ): this;
  once(types: string, selectorOrHandler: any, maybeHandler?: any, options?: boolean | AddEventListenerOptions): this {
    const baseOpts: AddEventListenerOptions = Object.assign({ once: true }, typeof options === 'object' ? options : {});
    if (typeof selectorOrHandler === 'function') {
      const handler = selectorOrHandler as Handler;
      return this.on(types, handler, baseOpts);
    }
    const selector = String(selectorOrHandler);
    const handler = maybeHandler as Handler;
    return this.on(types, selector, handler, baseOpts);
  }
  off(types?: string, selectorOrHandler?: any, maybeHandler?: any): this {
    if (types === undefined) return this.each(el => removeAllManaged(el));
    if (typeof selectorOrHandler === 'function' || selectorOrHandler === undefined) {
      const handler = selectorOrHandler as Function | undefined;
      return this.each(el => removeManaged(el, types, handler));
    }
    const selector = String(selectorOrHandler);
    const handler = maybeHandler as Function | undefined;
    return this.each(el => removeManaged(el, types, selector, handler));
  }
  trigger(event: Event): this;
  trigger(type: string, init?: Event | CustomEvent | EventInit | CustomEventInit | any): this;
  trigger(typeOrEvent: any, init?: any): this {
    return this.each(el => {
      const view = (el as any).ownerDocument?.defaultView as (Window | undefined);
      const EvCtor = (view && (view as any).Event) || (typeof Event !== 'undefined' ? Event : undefined);
      const CevCtor = (view && (view as any).CustomEvent) || (typeof CustomEvent !== 'undefined' ? CustomEvent : undefined);

      const isEventInstance = (v: any) => !!v && ((view && (v instanceof (view as any).Event)) || (v instanceof (globalThis as any).Event));

      let event: Event;
      if (isEventInstance(typeOrEvent)) {
        event = typeOrEvent as Event;
      } else if (isEventInstance(init)) {
        event = init as Event;
      } else {
        const type = String(typeOrEvent);
        const isInitLike = (v: any) => v && typeof v === 'object' && ('detail' in v || 'bubbles' in v || 'cancelable' in v || 'composed' in v);
        const opts: any = (init !== undefined)
          ? (isInitLike(init) ? { ...(init as any) } : { detail: init })
          : {};
        if (opts.bubbles == null) opts.bubbles = true;
        if ('detail' in opts) {
          const Ctor = CevCtor as any;
          event = Ctor ? new Ctor(type, opts) : new (EvCtor as any)(type, opts);
        } else {
          const Ctor = EvCtor as any;
          event = new Ctor(type, opts);
        }
      }
      el.dispatchEvent(event);
    });
  }

  // Common event shortcuts
  click(handler?: Handler<MouseEvent, T>): this {
    return handler ? this.on('click', handler) : this.trigger('click');
  }
  focus(handler?: Handler<FocusEvent, T>): this {
    return handler ? this.on('focus', handler) : this.each(el => (el as unknown as HTMLElement).focus());
  }
  blur(handler?: Handler<FocusEvent, T>): this {
    return handler ? this.on('blur', handler) : this.each(el => (el as unknown as HTMLElement).blur());
  }
  hover(enterHandler: Handler<MouseEvent, T>, leaveHandler?: Handler<MouseEvent, T>): this {
    this.on('mouseenter', enterHandler);
    if (leaveHandler) this.on('mouseleave', leaveHandler);
    return this;
  }

  // Pointer/touch shortcuts
  pointerdown(handler?: Handler<PointerEvent, T>): this { return handler ? this.on('pointerdown', handler) : this.trigger('pointerdown'); }
  pointerup(handler?: Handler<PointerEvent, T>): this { return handler ? this.on('pointerup', handler) : this.trigger('pointerup'); }
  pointermove(handler?: Handler<PointerEvent, T>): this { return handler ? this.on('pointermove', handler) : this.trigger('pointermove'); }
  pointerenter(handler?: Handler<PointerEvent, T>): this { return handler ? this.on('pointerenter', handler) : this.trigger('pointerenter'); }
  pointerleave(handler?: Handler<PointerEvent, T>): this { return handler ? this.on('pointerleave', handler) : this.trigger('pointerleave'); }
  pointercancel(handler?: Handler<PointerEvent, T>): this { return handler ? this.on('pointercancel', handler) : this.trigger('pointercancel'); }
  touchstart(handler?: Handler<TouchEvent, T>): this { return handler ? this.on('touchstart', handler) : this.trigger('touchstart'); }
  touchend(handler?: Handler<TouchEvent, T>): this { return handler ? this.on('touchend', handler) : this.trigger('touchend'); }
  touchmove(handler?: Handler<TouchEvent, T>): this { return handler ? this.on('touchmove', handler) : this.trigger('touchmove'); }
  touchcancel(handler?: Handler<TouchEvent, T>): this { return handler ? this.on('touchcancel', handler) : this.trigger('touchcancel'); }

  data(name: string, value?: string | number | null): any {
    const key = name.startsWith('data-') ? name : `data-${name}`;
    if (value === undefined) return this.attr(key);
    return this.attr(key, value as any);
  }

  // Dataset helpers
  dataset(): Record<string, string>;
  dataset(map: Record<string, string | number | null | undefined>): this;
  dataset(map?: Record<string, string | number | null | undefined>): any {
    if (map === undefined) {
      const first = this.elements[0] as unknown as HTMLElement | undefined;
      const out: Record<string, string> = {};
      if (!first) return out;
      const ds = (first as any).dataset as DOMStringMap;
      for (const k in ds) { if (Object.prototype.hasOwnProperty.call(ds, k)) out[k] = ds[k] as string; }
      return out;
    }
    return this.each(el => {
      const h = el as unknown as HTMLElement;
      for (const [k, v] of Object.entries(map)) {
        const attr = k.startsWith('data-') ? k : `data-${camelToKebab(k)}`;
        if (v == null) h.removeAttribute(attr);
        else h.setAttribute(attr, String(v));
      }
    });
  }

  // ARIA attribute helper
  aria(name: string): string | null;
  aria(name: string, value: string | number | boolean | null | undefined): this;
  aria(map: Record<string, string | number | boolean | null | undefined>): this;
  aria(nameOrMap: any, value?: any): any {
    if (typeof nameOrMap === 'string') {
      const attr = nameOrMap.startsWith('aria-') ? nameOrMap : `aria-${nameOrMap}`;
      if (value === undefined) return this.attr(attr);
      const v = typeof value === 'boolean' ? (value ? 'true' : 'false') : value;
      return this.attr(attr, v == null ? null : String(v));
    }
    const map = nameOrMap as Record<string, any>;
    return this.each(el => {
      const h = el as unknown as HTMLElement;
      for (const [k, v] of Object.entries(map)) {
        const attr = k.startsWith('aria-') ? k : `aria-${k}`;
        const val = typeof v === 'boolean' ? (v ? 'true' : 'false') : v;
        if (val == null) h.removeAttribute(attr);
        else h.setAttribute(attr, String(val));
      }
    });
  }

  // Iterator helpers for symmetry/readability
  beforeEach(fn: (el: T, idx: number) => void): this { return this.each(fn); }
  afterEach(fn: (el: T, idx: number) => void): this { return this.each(fn); }

  // Form serialization
  serialize(): Record<string, any> {
    if (this.elements.length === 0) return {};
    const firstEl = this.elements[0];
    if (firstEl instanceof HTMLFormElement) {
      return serializeFormEl(firstEl);
    }
    // If not a form, serialize only successful controls from the collection
    type Entry = [string, any];
    const entries: Entry[] = [];
    const isSuccessfulControl = (el: Element): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement => {
      if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)) return false as any;
      if (!el.name) return false;
      if (el.disabled) return false;
      if (el instanceof HTMLInputElement) {
        const type = (el.type || '').toLowerCase();
        if (type === 'submit' || type === 'button' || type === 'image' || type === 'reset') return false;
        if ((type === 'checkbox' || type === 'radio') && !el.checked) return false;
      }
      let p: Element | null = el;
      while ((p = p.parentElement)) {
        if (p instanceof HTMLFieldSetElement && (p as HTMLFieldSetElement).disabled) return false;
      }
      return true;
    };
    const pushEntries = (el: Element) => {
      if (!isSuccessfulControl(el)) return;
      const name = (el as any).name as string;
      if (el instanceof HTMLSelectElement) {
        if (el.multiple) Array.from(el.selectedOptions).forEach(opt => entries.push([name, opt.value]));
        else entries.push([name, el.value]);
        return;
      }
      if (el instanceof HTMLInputElement && el.type === 'file') {
        const files = el.files ? Array.from(el.files) : [];
        if (files.length === 0) entries.push([name, new File([], '')]);
        else files.forEach(f => entries.push([name, f]));
        return;
      }
      entries.push([name, (el as HTMLInputElement | HTMLTextAreaElement).value]);
    };
    for (const el of this.elements) pushEntries(el);

    // Build nested object from entries (supports user[name] and arr[])
    const parseName = (name: string): Array<{ key?: string; index?: number; push?: boolean }> => {
      const out: Array<{ key?: string; index?: number; push?: boolean }> = [];
      const re = /\[([^\]]*)\]/g;
      const firstBracket = name.indexOf('[');
      if (firstBracket === -1) return [{ key: name }];
      const root = name.slice(0, firstBracket);
      if (root) out.push({ key: root });
      let m: RegExpExecArray | null;
      while ((m = re.exec(name))) {
        const seg = m[1];
        if (seg === '') out.push({ push: true });
        else if (/^\d+$/.test(seg)) out.push({ index: parseInt(seg, 10) });
        else out.push({ key: seg });
      }
      return out.length ? out : [{ key: name }];
    };
    const setNested = (target: any, name: string, value: any) => {
      const tokens = parseName(name);
      let obj = target;
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        const last = i === tokens.length - 1;
        if (t.key != null) {
          if (last) {
            if (obj[t.key] === undefined) obj[t.key] = value;
            else if (Array.isArray(obj[t.key])) obj[t.key].push(value);
            else obj[t.key] = [obj[t.key], value];
          } else {
            const nxt = tokens[i + 1];
            if (nxt?.push || typeof nxt?.index === 'number') {
              if (!Array.isArray(obj[t.key])) obj[t.key] = [];
            } else {
              if (obj[t.key] == null || typeof obj[t.key] !== 'object' || Array.isArray(obj[t.key])) obj[t.key] = {};
            }
            obj = obj[t.key];
          }
          continue;
        }
        if (t.push) {
          if (!Array.isArray(obj)) {
            const tmp: any[] = [];
            if (obj != null && typeof obj === 'object' && Object.keys(obj).length) tmp.push(obj);
            obj = tmp;
          }
          if (last) { obj.push(value); return; }
          const nxt = tokens[i + 1];
          const placeholder = (nxt && (nxt.key != null)) ? {} : (nxt && typeof nxt.index === 'number') ? [] : {};
          obj.push(placeholder);
          obj = obj[obj.length - 1];
          continue;
        }
        if (typeof t.index === 'number') {
          if (!Array.isArray(obj)) obj = (obj[tokens[i - 1] as any] = []);
          if (last) { obj[t.index] = value; return; }
          if (obj[t.index] == null) obj[t.index] = {};
          obj = obj[t.index];
        }
      }
    };
    const out: Record<string, any> = {};
    for (const [k, v] of entries) setNested(out, k, v);
    return out;
  }

  // Convert current collection's serialized data to FormData
  toFormData(): FormData {
    const obj = this.serialize();
    return toFD(obj);
  }

  // Populate form fields for the first form in collection
  setForm(values: Record<string, any>): this {
    const firstEl = this.elements[0];
    if (firstEl instanceof HTMLFormElement) setFormValues(firstEl, values);
    return this;
  }

  reset(): this {
    if (this.elements.length === 0) return this;
    const firstEl = this.elements[0];
    if (firstEl instanceof HTMLFormElement) {
      resetFormEl(firstEl);
      return this;
    }
    // Reset individual controls in the collection
    for (const el of this.elements) {
      if (el instanceof HTMLInputElement) {
        const type = (el.type || '').toLowerCase();
        if (type === 'checkbox' || type === 'radio') el.checked = el.defaultChecked;
        else el.value = el.defaultValue;
      } else if (el instanceof HTMLTextAreaElement) {
        el.value = el.defaultValue;
      } else if (el instanceof HTMLSelectElement) {
        for (const opt of Array.from(el.options)) opt.selected = opt.defaultSelected;
      }
    }
    return this;
  }
}

export default DOMCollection;
