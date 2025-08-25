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
  eq(i: number): DOMCollection { return new DOMCollection(this.elements[i] ? [this.elements[i]] : []); }
  find(selector: string): DOMCollection {
    const found: Element[] = [];
    for (const el of this.elements) found.push(...toArray(el.querySelectorAll(selector)));
    return new DOMCollection(found);
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

  // Attributes
  attr(name: string, value?: string | number | null): any {
    if (value === undefined) return this.elements[0]?.getAttribute(name) ?? null;
    return this.each(el => {
      if (value == null) el.removeAttribute(name); else el.setAttribute(name, String(value));
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
  off(type: string, handler: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): this {
    return this.each(el => el.removeEventListener(type, handler, options));
  }

  data(name: string, value?: string | number | null): any {
    const key = name.startsWith('data-') ? name : `data-${name}`;
    if (value === undefined) return this.attr(key);
    return this.attr(key, value as any);
  }
}

export default DOMCollection;
