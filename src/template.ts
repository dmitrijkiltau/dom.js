export type TemplateData = Record<string, any>;

export function tpl(ref: string | HTMLTemplateElement): HTMLTemplateElement {
  const t = typeof ref === 'string' ? document.querySelector(ref) : ref;
  if (!t || !(t instanceof HTMLTemplateElement)) throw new Error('template not found');
  return t;
}

export function useTemplate(ref: string | HTMLTemplateElement) {
  const t = tpl(ref);
  return (data?: TemplateData) => bindTemplate(t, data);
}

export function renderTemplate(ref: string | HTMLTemplateElement, data?: TemplateData) {
  return useTemplate(ref)(data);
}

function bindTemplate(t: HTMLTemplateElement, data: TemplateData = {}) {
  const node = t.content.firstElementChild?.cloneNode(true) as Element;
  if (!node) throw new Error('empty template');
  applyBindings(node, data);
  return node;
}

function applyBindings(root: Element, data: TemplateData) {
  root.querySelectorAll('[data-text]').forEach(el => { const key = el.getAttribute('data-text')!; (el as HTMLElement).textContent = get(data, key); });
  root.querySelectorAll('[data-html]').forEach(el => { const key = el.getAttribute('data-html')!; (el as HTMLElement).innerHTML = get(data, key); });
  root.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('data-attr-')) {
        const name = attr.name.replace('data-attr-', '');
        const key = attr.value; const val = get(data, key);
        if (val == null) el.removeAttribute(name); else el.setAttribute(name, String(val));
      }
    });
  });
}

function get(obj: any, path: string, fallback: any = '') {
  return path.split('.').reduce((a, k) => (a && k in a) ? a[k] : undefined, obj) ?? fallback;
}
