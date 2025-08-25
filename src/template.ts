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
    // Handle conditional rendering first
    if (el.hasAttribute('data-if')) {
      const key = el.getAttribute('data-if')!;
      const condition = get(data, key);
      if (!condition) {
        el.remove();
        return; // Don't process further if element is removed
      }
      el.removeAttribute('data-if');
    }
    if (el.hasAttribute('data-show')) {
      const key = el.getAttribute('data-show')!;
      const condition = get(data, key);
      (el as HTMLElement).style.display = condition ? '' : 'none';
      el.removeAttribute('data-show');
    }
    if (el.hasAttribute('data-hide')) {
      const key = el.getAttribute('data-hide')!;
      const condition = get(data, key);
      (el as HTMLElement).style.display = condition ? 'none' : '';
      el.removeAttribute('data-hide');
    }
    
    if (el.hasAttribute('data-text')) {
      const key = el.getAttribute('data-text')!;
      (el as HTMLElement).textContent = get(data, key);
      el.removeAttribute('data-text');
    }
    if (el.hasAttribute('data-html')) {
      const key = el.getAttribute('data-html')!;
      (el as HTMLElement).innerHTML = get(data, key);
      el.removeAttribute('data-html');
    }
    
    // Handle event bindings
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith('data-on-')) {
        const eventType = attr.name.replace('data-on-', '');
        const handlerKey = attr.value;
        const handler = get(data, handlerKey);
        if (typeof handler === 'function') {
          el.addEventListener(eventType, handler);
        }
        el.removeAttribute(attr.name);
      }
    }
    
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith('data-attr-')) {
        const original = attr.name;
        const name = original.replace('data-attr-', '');
        const key = attr.value;
        const val = get(data, key);
        if (val == null) {
          el.removeAttribute(name);
        } else {
          el.setAttribute(name, String(val));
        }
        // remove the template binding attribute after applying
        el.removeAttribute(original);
      }
    }
  }
  
  // Include root itself
  process(root);
  // Then descendants (universal match; process filters internally)
  // Use Array.from to avoid live NodeList issues when elements are removed
  Array.from(root.querySelectorAll('*')).forEach(el => process(el));
}

function get(obj: any, path: string, fallback: any = '') {
  return path.split('.').reduce((a, k) => (a && k in a) ? a[k] : undefined, obj) ?? fallback;
}
