import { CSSInput, CSSValue, Handler } from './types';

addClass(...names: string[]): this { return this.each(el => el.classList.add(...names)); }
removeClass(...names: string[]): this { return this.each(el => el.classList.remove(...names)); }
toggleClass(name: string, force ?: boolean): this { return this.each(el => el.classList.toggle(name, force)); }
hasClass(name: string): boolean { return !!this.elements[0]?.classList.contains(name); }

css(nameOrInput: string | CSSInput, value ?: CSSValue | null): any {
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
toggle(force ?: boolean): this {
  return this.each(el => {
    const h = (el as HTMLElement).style.display === 'none' || getComputedStyle(el).display === 'none';
    const shouldShow = force ?? h;
    (el as HTMLElement).style.display = shouldShow ? '' : 'none';
  });
}

on(type: string, selectorOrHandler: any, maybeHandler ?: any): this {
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

off(type: string, handler: EventListenerOrEventListenerObject, options ?: boolean | EventListenerOptions): this {
  return this.each(el => el.removeEventListener(type, handler, options));
}

data(name: string, value ?: string | number | null): any {
  const key = name.startsWith('data-') ? name : `data-${name}`;
  if (value === undefined) return this.attr(key);
  return this.attr(key, value as any);
}
