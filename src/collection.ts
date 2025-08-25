import { CSSInput, CSSValue, Handler } from './types';
import { camelToKebab, toArray, isElement } from './utils';

export class DOMCollection {
  elements: Element[];

  constructor(input: ArrayLike<Element> | Element[] | null | undefined) {
    this.elements = toArray(input);
  }

  // Core iterator
  each(fn: (el: Element, idx: number) => void): this {
    for (let i = 0; i < this.elements.length; i++) fn(this.elements[i], i);
    return this;
  }

  // Basic DOM read helpers
  get length(): number { return this.elements.length; }
  el<T extends Element = Element>(): T | undefined { return this.elements[0] as T | undefined; }
  first(): DOMCollection { return new DOMCollection(this.elements.length ? [this.elements[0]] : []); }
  last(): DOMCollection { return new DOMCollection(this.elements.length ? [this.elements[this.elements.length - 1]] : []); }
  eq(i: number): DOMCollection { return new DOMCollection(this.elements[i] ? [this.elements[i]] : []); }
  find(selector: string): DOMCollection {
    const found: Element[] = [];
    for (const el of this.elements) found.push(...toArray(el.querySelectorAll(selector)));
    return new DOMCollection(found);
  }
  filter(selector: string | ((el: Element, idx: number) => boolean)): DOMCollection {
    if (typeof selector === 'function') {
      const filtered: Element[] = [];
      for (let i = 0; i < this.elements.length; i++) {
        if (selector(this.elements[i], i)) filtered.push(this.elements[i]);
      }
      return new DOMCollection(filtered);
    }
    return new DOMCollection(this.elements.filter(el => el.matches(selector)));
  }

  // Traversal methods
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

  // Content
  text(value?: string | number | null): any {
    if (value === undefined) return (this.elements[0] as HTMLElement | undefined)?.textContent ?? '';
    return this.each(el => (el as HTMLElement).textContent = value == null ? '' : String(value));
  }
  html(value?: string | number | null): any {
    if (value === undefined) return (this.elements[0] as HTMLElement | undefined)?.innerHTML ?? '';
    return this.each(el => (el as HTMLElement).innerHTML = value == null ? '' : String(value));
  }

  append(child: string | Node | DOMCollection): this {
    for (const el of this.elements) {
      if (child == null) continue;
      if (typeof child === 'string') (el as HTMLElement).insertAdjacentHTML('beforeend', child);
      else if (child instanceof DOMCollection) for (const n of child.elements) el.appendChild(n);
      else el.appendChild(child);
    }
    return this;
  }
  appendTo(target: Element | DOMCollection): this {
    if (target instanceof DOMCollection) target.append(this);
    else if (isElement(target)) target.append(...this.elements);
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
  toggleClass(name: string, force?: boolean): this { return this.each(el => el.classList.toggle(name, force)); }
  hasClass(name: string): boolean { return !!this.elements[0]?.classList.contains(name); }

  // CSS
  css(nameOrInput: string | CSSInput, value?: CSSValue | null): any {
    if (typeof nameOrInput === 'string') {
      if (value === undefined) return getComputedStyle(this.elements[0] as Element).getPropertyValue(camelToKebab(nameOrInput)).trim();
      return this.each(el => {
        const s = (el as HTMLElement).style;
        const prop = camelToKebab(nameOrInput);
        if (value === null) s.removeProperty(prop); else s.setProperty(prop, String(value));
      });
    }
    const map = nameOrInput;
    return this.each(el => {
      const s = (el as HTMLElement).style;
      for (const [k, v] of Object.entries(map)) {
        const prop = camelToKebab(k);
        if (v == null) s.removeProperty(prop); else s.setProperty(prop, String(v));
      }
    });
  }

  show(display: string = ''): this { return this.each(el => (el as HTMLElement).style.display = display); }
  hide(): this { return this.each(el => (el as HTMLElement).style.display = 'none'); }
  toggle(force?: boolean): this {
    return this.each(el => {
      const h = (el as HTMLElement).style.display === 'none' || getComputedStyle(el).display === 'none';
      const shouldShow = force ?? h;
      (el as HTMLElement).style.display = shouldShow ? '' : 'none';
    });
  }

  // Events (direct + delegated)
  on(type: string, selectorOrHandler: any, maybeHandler?: any): this {
    if (typeof selectorOrHandler === 'function') {
      const handler = selectorOrHandler as Handler;
      return this.each((el, i) => el.addEventListener(type, (ev) => handler(ev, el, i)));
    }
    const selector = String(selectorOrHandler);
    const handler = maybeHandler as Handler;
    return this.each((el) => el.addEventListener(type, (ev) => {
      const target = ev.target as Element | null;
      if (!target) return;
      const match = target.closest(selector);
      if (match && el.contains(match)) handler(ev, match, this.elements.indexOf(match));
    }));
  }
  once(type: string, selectorOrHandler: any, maybeHandler?: any): this {
    if (typeof selectorOrHandler === 'function') {
      const handler = selectorOrHandler as Handler;
      return this.each((el, i) => {
        const onceHandler = (ev: Event) => {
          handler(ev, el, i);
          el.removeEventListener(type, onceHandler);
        };
        el.addEventListener(type, onceHandler);
      });
    }
    const selector = String(selectorOrHandler);
    const handler = maybeHandler as Handler;
    return this.each((el) => {
      const onceHandler = (ev: Event) => {
        const target = ev.target as Element | null;
        if (!target) return;
        const match = target.closest(selector);
        if (match && el.contains(match)) {
          handler(ev, match, this.elements.indexOf(match));
          el.removeEventListener(type, onceHandler);
        }
      };
      el.addEventListener(type, onceHandler);
    });
  }
  off(type: string, handler: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): this {
    return this.each(el => el.removeEventListener(type, handler, options));
  }
  trigger(type: string, detail?: any): this {
    return this.each(el => {
      const event = detail !== undefined 
        ? new CustomEvent(type, { detail, bubbles: true })
        : new Event(type, { bubbles: true });
      el.dispatchEvent(event);
    });
  }

  // Common event shortcuts
  click(handler?: Handler): this {
    return handler ? this.on('click', handler) : this.trigger('click');
  }
  focus(handler?: Handler): this {
    return handler ? this.on('focus', handler) : this.each(el => (el as HTMLElement).focus());
  }
  blur(handler?: Handler): this {
    return handler ? this.on('blur', handler) : this.each(el => (el as HTMLElement).blur());
  }
  hover(enterHandler: Handler, leaveHandler?: Handler): this {
    this.on('mouseenter', enterHandler);
    if (leaveHandler) this.on('mouseleave', leaveHandler);
    return this;
  }

  data(name: string, value?: string | number | null): any {
    const key = name.startsWith('data-') ? name : `data-${name}`;
    if (value === undefined) return this.attr(key);
    return this.attr(key, value as any);
  }

  // Form serialization
  serialize(): Record<string, any> {
    if (this.elements.length === 0) return {};
    const firstEl = this.elements[0];
    if (firstEl instanceof HTMLFormElement) {
      const fd = new FormData(firstEl);
      const out: Record<string, any> = {};
      for (const [k, v] of (fd as any).entries()) {
        if (k in out) out[k] = ([] as any[]).concat(out[k], v as any);
        else out[k] = v;
      }
      return out;
    }
    // If not a form, try to serialize form fields within the collection
    const out: Record<string, any> = {};
    for (const el of this.elements) {
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
        const name = el.name;
        if (name) {
          const value = el instanceof HTMLSelectElement 
            ? Array.from(el.selectedOptions).map(o => o.value)
            : el.value;
          if (name in out) out[name] = ([] as any[]).concat(out[name], value as any);
          else out[name] = value;
        }
      }
    }
    return out;
  }
}

export default DOMCollection;
