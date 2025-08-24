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
  // Process a single element for data-* bindings
  function process(el: Element) {
    if (el.hasAttribute('data-text')) {
      const key = el.getAttribute('data-text')!;
      (el as HTMLElement).textContent = get(data, key);
    }
    if (el.hasAttribute('data-html')) {
      const key = el.getAttribute('data-html')!;
      (el as HTMLElement).innerHTML = get(data, key);
    }
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith('data-attr-')) {
        const name = attr.name.replace('data-attr-', '');
        const key = attr.value;
        const val = get(data, key);
        if (val == null) el.removeAttribute(name); else el.setAttribute(name, String(val));
      }
    }
  }
  // Include root itself
  process(root);
  // Then descendants (universal match; process filters internally)
  root.querySelectorAll('*').forEach(el => process(el));
}

function get(obj: any, path: string, fallback: any = '') {
  return path.split('.').reduce((a, k) => (a && k in a) ? a[k] : undefined, obj) ?? fallback;
}
