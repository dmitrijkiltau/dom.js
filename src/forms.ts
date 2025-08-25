import { DOMCollection } from './collection';

export type Formish = HTMLFormElement | DOMCollection | string | null | undefined;

function resolveForm(input: Formish): HTMLFormElement {
  if (!input) throw new Error('Form not provided');
  if (typeof input === 'string') {
    const el = document.querySelector(input);
    if (!el) throw new Error(`Form not found: ${input}`);
    if (!(el instanceof HTMLFormElement)) throw new Error('Selector did not resolve to <form>');
    return el;
  }
  if (input instanceof DOMCollection) {
    const el = input.elements[0];
    if (!el) throw new Error('Empty collection');
    if (!(el instanceof HTMLFormElement)) throw new Error('Collection[0] is not a <form>');
    return el as HTMLFormElement;
  }
  return input;
}

export function serializeForm(form: Formish): Record<string, any> {
  const el = resolveForm(form);
  const fd = new FormData(el);
  const out: Record<string, any> = {};
  for (const [k, v] of (fd as any).entries()) {
    if (k in out) out[k] = ([] as any[]).concat(out[k], v as any);
    else out[k] = v;
  }
  return out;
}

export function toQueryString(obj: Record<string, any>): string {
  const usp = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach(x => usp.append(k, String(x)));
    else if (v != null) usp.append(k, String(v));
  });
  return usp.toString();
}

export function onSubmit(form: Formish, handler: (data: Record<string, any>, ev: SubmitEvent) => void | Promise<void>) {
  const el = resolveForm(form);
  el.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const data = serializeForm(el);
    await handler(data, ev);
  });
}
