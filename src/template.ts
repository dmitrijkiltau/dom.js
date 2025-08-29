export type TemplateData = Record<string, any>;

export function tpl(ref: string | HTMLTemplateElement): HTMLTemplateElement {
  const t = typeof ref === 'string' ? document.querySelector(ref) : ref;
  if (!t || !(t instanceof HTMLTemplateElement)) throw new Error('template not found');
  return t;
}

export function useTemplate(ref: string | HTMLTemplateElement) {
  const t = tpl(ref);
  return (data?: TemplateData): Node => bindTemplate(t, data);
}

export function renderTemplate(ref: string | HTMLTemplateElement, data?: TemplateData): Node {
  return useTemplate(ref)(data);
}

function bindTemplate(t: HTMLTemplateElement, data: TemplateData = {}): Node {
  const node = t.content.firstElementChild?.cloneNode(true) as Element;
  if (!node) throw new Error('empty template');
  const processed = applyBindings(node, data);
  return processed;
}

function applyBindings(root: Element, data: TemplateData): Node {
  // Depth-first processing that supports scopes and structural directives
  function processNode(el: Element, scope: TemplateData): Node | null {
    // Structural: data-if
    if (el.hasAttribute('data-if')) {
      const key = el.getAttribute('data-if')!;
      const condition = get(scope, key);
      el.removeAttribute('data-if');
      if (!condition) return null;
    }

    // Structural: data-each (loops)
    if (el.hasAttribute('data-each')) {
      const expr = el.getAttribute('data-each')!;
      el.removeAttribute('data-each');

      const { listKey, itemAlias, indexAlias } = parseEach(expr);
      const list = get(scope, listKey);

      const frag = document.createDocumentFragment();
      if (Array.isArray(list)) {
        for (let i = 0; i < list.length; i++) {
          const item = list[i];
          const clone = el.cloneNode(true) as Element;
          // Prepare child scope
          const childScope: TemplateData = Object.assign({}, scope, {
            [itemAlias]: item,
            [indexAlias]: i
          });
          const processed = processNode(clone, childScope);
          if (processed) frag.appendChild(toNode(processed));
        }
      }
      // If not array, nothing is rendered
      return frag;
    }

    // Non-structural: visibility
    if (el.hasAttribute('data-show')) {
      const key = el.getAttribute('data-show')!;
      const condition = get(scope, key);
      (el as HTMLElement).style.display = condition ? '' : 'none';
      el.removeAttribute('data-show');
    }
    if (el.hasAttribute('data-hide')) {
      const key = el.getAttribute('data-hide')!;
      const condition = get(scope, key);
      (el as HTMLElement).style.display = condition ? 'none' : '';
      el.removeAttribute('data-hide');
    }

    // Content bindings
    if (el.hasAttribute('data-text')) {
      const key = el.getAttribute('data-text')!;
      (el as HTMLElement).textContent = get(scope, key);
      el.removeAttribute('data-text');
    }
    if (el.hasAttribute('data-html')) {
      const key = el.getAttribute('data-html')!;
      (el as HTMLElement).innerHTML = get(scope, key);
      el.removeAttribute('data-html');
    }

    // Event bindings
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith('data-on-')) {
        const eventType = attr.name.replace('data-on-', '');
        const handlerKey = attr.value;
        const handler = get(scope, handlerKey);
        if (typeof handler === 'function') el.addEventListener(eventType, handler);
        el.removeAttribute(attr.name);
      }
    }

    // Attribute bindings
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith('data-attr-')) {
        const original = attr.name;
        const name = original.replace('data-attr-', '');
        const key = attr.value;
        const val = get(scope, key);
        if (val == null) el.removeAttribute(name); else el.setAttribute(name, String(val));
        el.removeAttribute(original);
      }
    }

    // Process children after applying current node bindings
    // Use Array.from snapshot to avoid issues with live changes
    const children = Array.from(el.children) as Element[];
    for (const child of children) {
      const result = processNode(child, scope);
      if (result === null) {
        child.remove();
      } else if (result !== child) {
        child.replaceWith(toNode(result));
      }
    }

    return el;
  }

  const out = processNode(root, data);
  // If null, return an empty fragment to avoid returning null
  return out == null ? document.createDocumentFragment() : toNode(out);
}

function parseEach(expr: string): { listKey: string; itemAlias: string; indexAlias: string } {
  // Supported syntax: "items", "items as item", "items as item, i"
  const trimmed = expr.trim();
  const asMatch = trimmed.split(/\s+as\s+/i);
  let listKey = trimmed;
  let itemAlias = 'item';
  let indexAlias = '$index';
  if (asMatch.length === 2) {
    listKey = asMatch[0].trim();
    const rhs = asMatch[1].trim();
    const parts = rhs.split(',');
    if (parts[0]) itemAlias = parts[0].trim();
    if (parts[1]) indexAlias = parts[1].trim();
  } else {
    listKey = trimmed;
  }
  return { listKey, itemAlias, indexAlias };
}

function toNode(n: Node): Node { return n; }

function get(obj: any, path: string, fallback: any = '') {
  return path.split('.').reduce((a, k) => (a && k in a) ? a[k] : undefined, obj) ?? fallback;
}
