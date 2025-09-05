export type TemplateData = Record<string, any>;

// ——— Public API ———
export function tpl(ref: string | HTMLTemplateElement): HTMLTemplateElement {
  const t = typeof ref === 'string' ? document.querySelector(ref) : ref;
  if (!t || !(t instanceof HTMLTemplateElement)) throw new Error('template not found');
  return t;
}

export type TemplateInstance = {
  el: Node;
  update: (data?: TemplateData) => void;
  destroy: () => void;
};

// Cache precompiled Plans per template element. A Plan can be instantiated
// multiple times without re-parsing attributes or re-traversing the template.
const PLAN_CACHE = new WeakMap<HTMLTemplateElement, Plan>();

export function useTemplate(ref: string | HTMLTemplateElement) {
  const t = tpl(ref);
  const first = t.content.firstElementChild as Element | null;
  if (!first) throw new Error('empty template');
  let plan = PLAN_CACHE.get(t);
  if (!plan) { plan = compilePlan(first); PLAN_CACHE.set(t, plan); }
  const render = ((data?: TemplateData) => {
    const program = plan!.instantiate();
    program.update(data ?? {});
    return program.node;
  }) as ((data?: TemplateData) => Node) & { mount?: (data?: TemplateData) => TemplateInstance };
  (render as any).mount = (data?: TemplateData) => {
    const program = plan!.instantiate();
    program.update(data ?? {});
    const instance: TemplateInstance = {
      el: program.node,
      update: (d?: TemplateData) => program.update(d ?? {}),
      destroy: () => program.destroy()
    };
    return instance;
  };
  return render as ((data?: TemplateData) => Node) & { mount: (data?: TemplateData) => TemplateInstance };
}

export function renderTemplate(ref: string | HTMLTemplateElement, data?: TemplateData): Node {
  return useTemplate(ref)(data);
}

export function mountTemplate(ref: string | HTMLTemplateElement, data: TemplateData = {}): TemplateInstance {
  const render = useTemplate(ref);
  return (render as any).mount(data);
}

// Bind to server-rendered DOM: hydrate instead of re-creating
export function hydrateTemplate(ref: string | HTMLTemplateElement, root: Element, data: TemplateData = {}): TemplateInstance {
  const t = tpl(ref);
  const first = t.content.firstElementChild as Element | null;
  if (!first) throw new Error('empty template');
  let plan = PLAN_CACHE.get(t);
  if (!plan) { plan = compilePlan(first); PLAN_CACHE.set(t, plan); }
  const program = plan.hydrate(root);
  program.update(data ?? {});
  return {
    el: root,
    update: (d?: TemplateData) => program.update(d ?? {}),
    destroy: () => program.destroy()
  };
}

// ——— Safe HTML helpers ———
export function escapeHTML(input: any): string {
  const s = String(input ?? '');
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function unsafeHTML(html: string): { __html: string } { return { __html: String(html ?? '') }; }
// Alias to make intent explicit at call sites
export const isUnsafeHTML = unsafeHTML;

// ——— Internal engine ———
type Updater = (scope: Scope) => void;

type Program = {
  node: Node;
  update: (data: TemplateData) => void;
  destroy: () => void;
};

type Scope = TemplateData & { $index?: number; $item?: any; $parent?: Scope | null };

function compile(root: Element): Program {
  const destroyers: Array<() => void> = [];
  const updaters: Updater[] = [];

  // Walk and compile bindings/structures
  const compiledNode = compileNode(root, updaters, destroyers);

  function update(data: TemplateData) {
    const scope: Scope = Object.assign(Object.create(null), data);
    for (const u of updaters) u(scope);
  }

  return { node: compiledNode, update, destroy: () => destroyers.forEach(fn => fn()) };
}

// ——— Plan-based precompilation (non-structural) ———
type BindingFactory = {
  attach(el: Element): { update: (scope: Scope) => void; destroy?: () => void };
};

type Plan = { kind: 'element' | 'if' | 'each' | 'include'; rootTag?: string; instantiate(): Program; hydrate(target: Node): Program };

function compilePlan(rootEl: Element): Plan {
  // Deep-clone once and strip dynamic attributes on this normalized blueprint
  const normalized = rootEl.cloneNode(true) as Element;
  return compilePlanNode(normalized);
}

function compilePlanNode(node: Element): Plan {
  // Fallback to legacy compiler for structural directives
  if (node.hasAttribute('data-if') || node.hasAttribute('data-elseif') || node.hasAttribute('data-else') || node.hasAttribute('data-each') || node.hasAttribute('data-include')) {
    return makeLegacyStructuralPlan(node);
  }

  // Non-structural bindings on this node
  const bindings: BindingFactory[] = [];

  if (node.hasAttribute('data-show')) {
    const expr = node.getAttribute('data-show')!; node.removeAttribute('data-show');
    const acc = compileAccessor(expr);
    bindings.push({ attach(el) { return { update(scope) { (el as HTMLElement).style.display = truthy(acc(scope)) ? '' : 'none'; } }; } });
  }
  if (node.hasAttribute('data-hide')) {
    const expr = node.getAttribute('data-hide')!; node.removeAttribute('data-hide');
    const acc = compileAccessor(expr);
    bindings.push({ attach(el) { return { update(scope) { (el as HTMLElement).style.display = truthy(acc(scope)) ? 'none' : ''; } }; } });
  }
  if (node.hasAttribute('data-text')) {
    const expr = node.getAttribute('data-text')!; node.removeAttribute('data-text');
    const acc = compileAccessor(expr);
    bindings.push({ attach(el) { return { update(scope) { (el as HTMLElement).textContent = toString(acc(scope)); } }; } });
  }
  if (node.hasAttribute('data-html')) {
    const raw = node.getAttribute('data-html')!; node.removeAttribute('data-html');
    const unsafeMatch = raw.match(/^\s*unsafe\s*\((.*)\)\s*$/);
    if (unsafeMatch) {
      const inner = unsafeMatch[1]?.trim() || '';
      const acc = compileAccessor(inner);
      bindings.push({ attach(el) { return { update(scope) { (el as HTMLElement).innerHTML = toString(acc(scope)); } }; } });
    } else {
      const acc = compileAccessor(raw);
      bindings.push({ attach(el) { return { update(scope) {
        const val = acc(scope);
        if (val && typeof val === 'object' && '__html' in val) (el as HTMLElement).innerHTML = String(val.__html);
        else (el as HTMLElement).innerHTML = toString(val);
      } }; } });
    }
  }
  if (node.hasAttribute('data-safe-html')) {
    const expr = node.getAttribute('data-safe-html')!; node.removeAttribute('data-safe-html');
    const acc = compileAccessor(expr);
    bindings.push({ attach(el) { return { update(scope) { (el as HTMLElement).innerHTML = escapeHTML(acc(scope)); } }; } });
  }

  // Snapshot attributes for data-attr-* and data-on-*
  for (const attr of Array.from(node.attributes)) {
    if (!attr.name.startsWith('data-attr-')) continue;
    const original = attr.name; const name = original.replace('data-attr-', ''); const expr = attr.value;
    const acc = compileAccessor(expr);
    node.removeAttribute(original);
    bindings.push({ attach(el) { return { update(scope) {
      const val = acc(scope);
      if (val === false || val == null) (el as Element).removeAttribute(name);
      else (el as Element).setAttribute(name, String(val));
    } }; } });
  }

  for (const attr of Array.from(node.attributes)) {
    if (!attr.name.startsWith('data-on-')) continue;
    const original = attr.name; const type = original.replace('data-on-', ''); const spec = attr.value;
    const parsed = parseHandlerSpec(spec);
    node.removeAttribute(original);
    bindings.push({ attach(el) {
      const EVENT_TOKEN: unique symbol = Symbol('event');
      const listener = (ev: Event) => {
        const scope = (listener as any)._scope as Scope;
        const fn = parsed.fn(scope);
        if (typeof fn === 'function') {
          try {
            const finalArgs = parsed.args.map(a => a(scope, EVENT_TOKEN)).map(v => v === EVENT_TOKEN ? ev : v);
            (fn as any).call(el, ev, ...finalArgs);
          } catch {}
        }
      };
      (listener as any)._scope = Object.create(null);
      el.addEventListener(type, listener as any);
      return {
        update(scope) { (listener as any)._scope = scope; },
        destroy() { el.removeEventListener(type, listener as any); }
      };
    } });
  }

  // Children: preserve static text and plan elements with structural lookahead
  type ChildUnit = { kind: 'text'; text: string } | { kind: 'plan'; plan: Plan };
  const childUnits: ChildUnit[] = [];
  const nodes = Array.from(node.childNodes) as ChildNode[];
  for (let i = 0; i < nodes.length; ) {
    const cn = nodes[i];
    if (cn.nodeType === 3) { // Text node
      childUnits.push({ kind: 'text', text: (cn.textContent ?? '') });
      i++;
      continue;
    }
    if (cn.nodeType !== 1) { // Skip comments/others
      i++;
      continue;
    }
    const el = cn as Element;
    if (el.hasAttribute('data-if')) {
      const chainNodes: Element[] = [el];
      let k = i;
      while (true) {
        // find next element sibling index
        let nextElIdx = k + 1;
        while (nextElIdx < nodes.length && nodes[nextElIdx].nodeType !== 1) nextElIdx++;
        if (nextElIdx >= nodes.length) break;
        const nx = nodes[nextElIdx] as Element;
        if (nx.hasAttribute('data-elseif') || nx.hasAttribute('data-else')) { chainNodes.push(nx); k = nextElIdx; continue; }
        break;
      }
      childUnits.push({ kind: 'plan', plan: makeIfPlanFromChain(chainNodes) });
      i = ((): number => {
        // advance i past last chain node
        let idx = i;
        for (const _ of chainNodes) {
          // move idx to next element after current
          let nextElIdx = idx + 1;
          while (nextElIdx < nodes.length && nodes[nextElIdx].nodeType !== 1) nextElIdx++;
          idx = nextElIdx;
        }
        return idx;
      })();
      continue;
    }
    if (el.hasAttribute('data-each')) { childUnits.push({ kind: 'plan', plan: makeEachPlan(el) }); i++; continue; }
    if (el.hasAttribute('data-include')) { childUnits.push({ kind: 'plan', plan: makeIncludePlan(el) }); i++; continue; }
    childUnits.push({ kind: 'plan', plan: compilePlanNode(el) });
    i++;
  }

  return {
    kind: 'element',
    rootTag: (node.tagName || '').toUpperCase(),
    instantiate(): Program {
      const el = node.cloneNode(false) as Element;
      const updaters: Updater[] = [];
      const destroyers: Array<() => void> = [];

      for (const b of bindings) {
        const res = b.attach(el);
        updaters.push(res.update);
        if (res.destroy) destroyers.push(res.destroy);
      }

      for (const unit of childUnits) {
        if (unit.kind === 'text') {
          el.appendChild(document.createTextNode(unit.text));
          continue;
        }
        const childProgram = unit.plan.instantiate();
        el.appendChild(childProgram.node);
        updaters.push((s: Scope) => childProgram.update(s));
        destroyers.push(() => childProgram.destroy());
      }

      function update(data: TemplateData) {
        const scope: Scope = Object.assign(Object.create(null), data);
        for (const u of updaters) u(scope);
      }

      return {
        node: el,
        update,
        destroy: () => { for (const d of destroyers) d(); }
      };
    },
    hydrate(target: Node): Program {
      const el = target as Element;
      const updaters: Updater[] = [];
      const destroyers: Array<() => void> = [];
      for (const b of bindings) {
        const res = b.attach(el);
        updaters.push(res.update);
        if (res.destroy) destroyers.push(res.destroy);
      }
      // Walk children and hydrate in order
      let cursor: ChildNode | null = el.firstChild as ChildNode | null;
      const nextSibling = (n: ChildNode | null) => n ? (n.nextSibling as ChildNode | null) : null;
      const findNextElement = () => {
        let n = cursor;
        while (n && n.nodeType !== 1) n = nextSibling(n);
        return n as Element | null;
      };
      const findNextAnchor = (label: string): { start: Comment | null; end: Comment | null } => {
        // Find the next start anchor and match it with a balanced end
        let start: Comment | null = null;
        let n: ChildNode | null = cursor;
        while (n) {
          if (n.nodeType === 8 /* comment */ && (n as Comment).data === label + ':start') { start = n as Comment; break; }
          n = nextSibling(n);
        }
        if (!start) return { start: null, end: null };
        let depth = 1;
        let m: ChildNode | null = start.nextSibling;
        while (m) {
          if (m.nodeType === 8 /* comment */) {
            const d = (m as Comment).data;
            if (d === label + ':start') depth++;
            else if (d === label + ':end') { depth--; if (depth === 0) return { start, end: m as Comment }; }
          }
          m = m.nextSibling;
        }
        return { start, end: null };
      };

      for (const unit of childUnits) {
        if (unit.kind === 'text') {
          // Consume one text node if present; SSR may collapse whitespace, so skip if not
          if (cursor && cursor.nodeType === 3) cursor = nextSibling(cursor);
          continue;
        }
        // Plan unit
        const childPlan = unit.plan;
        if (childPlan.kind === 'element') {
          const childEl = findNextElement();
          if (childEl) {
            const cp = childPlan.hydrate(childEl);
            updaters.push((s: Scope) => cp.update(s));
            destroyers.push(() => cp.destroy());
            cursor = nextSibling(childEl);
          }
          continue;
        }
        // Structural: find anchors by label
        const label = childPlan.kind; // 'if' | 'each' | 'include'
        const found = findNextAnchor(label);
        if (found.start) {
          const cp = childPlan.hydrate(found.start);
          updaters.push((s: Scope) => cp.update(s));
          destroyers.push(() => cp.destroy());
          cursor = (found.end ? (found.end.nextSibling as ChildNode | null) : null);
        }
      }

      function update(data: TemplateData) {
        const scope: Scope = Object.assign(Object.create(null), data);
        for (const u of updaters) u(scope);
      }

      return {
        node: el,
        update,
        destroy: () => { for (const d of destroyers) d(); }
      };
    }
  };
}

function makeLegacyStructuralPlan(node: Element): Plan {
  // Keep original attributes and structure for legacy compiler
  const blueprint = node.cloneNode(true) as Element;
  return {
    kind: node.hasAttribute('data-if') || node.hasAttribute('data-elseif') || node.hasAttribute('data-else') ? 'if'
      : node.hasAttribute('data-each') ? 'each'
      : node.hasAttribute('data-include') ? 'include'
      : 'element',
    rootTag: (blueprint.tagName || '').toUpperCase(),
    instantiate(): Program {
      const root = blueprint.cloneNode(true) as Element;
      return compile(root);
    },
    hydrate(target: Node): Program {
      // Fallback: compile against the live subtree without structural rewrites
      const updaters: Updater[] = [];
      const destroyers: Array<() => void> = [];
      const nodeEl = target as Element;
      const compiledRoot = compileNode(nodeEl, updaters, destroyers);
      function update(data: TemplateData) {
        const scope: Scope = Object.assign(Object.create(null), data);
        for (const u of updaters) u(scope);
      }
      return { node: compiledRoot, update, destroy: () => destroyers.forEach(fn => fn()) };
    }
  };
}

// ——— Structural Plans ———
function makeIfPlanFromChain(nodes: Element[]): Plan {
  // Build chain descriptors with subplans
  type ChainItem = { type: 'if' | 'elseif' | 'else'; expr?: string; plan: Plan };
  const chain: ChainItem[] = [];
  for (let idx = 0; idx < nodes.length; idx++) {
    const el = nodes[idx];
    if (idx === 0 && el.hasAttribute('data-if')) {
      const expr = el.getAttribute('data-if')!; el.removeAttribute('data-if');
      chain.push({ type: 'if', expr, plan: compilePlanNode(el) });
    } else if (el.hasAttribute('data-elseif')) {
      const expr = el.getAttribute('data-elseif')!; el.removeAttribute('data-elseif');
      chain.push({ type: 'elseif', expr, plan: compilePlanNode(el) });
    } else if (el.hasAttribute('data-else')) {
      el.removeAttribute('data-else');
      chain.push({ type: 'else', plan: compilePlanNode(el) });
    }
  }

  return {
    kind: 'if',
    instantiate(): Program {
      const start = document.createComment('if:start');
      const end = document.createComment('if:end');
      const frag = document.createDocumentFragment();
      frag.append(start, end);

      let activeIndex = -1;
      let active: Program | null = null;
      const update = (data: TemplateData) => {
        const scope: Scope = Object.assign(Object.create(null), data);
        let idx = -1;
        for (let i = 0; i < chain.length; i++) {
          const c = chain[i];
          if (c.type === 'else') { idx = i; break; }
          const cond = truthy(get(scope, c.expr!));
          if (cond) { idx = i; break; }
        }
        if (idx !== activeIndex) {
          // Remove old
          if (active) { try { active.destroy(); } catch {} }
          removeBetween(start, end);
          active = null;
          if (idx !== -1) {
            const p = chain[idx].plan.instantiate();
            end.before(p.node);
            active = p;
          }
          activeIndex = idx;
        }
        if (active) active.update(scope);
      };
      const destroy = () => { if (active) { try { active.destroy(); } catch {} } removeBetween(start, end); };
      return { node: frag, update, destroy };
    },
    hydrate(target: Node): Program {
      const start = target as Comment;
      // find matching end (balanced for nested ifs)
      let end: Comment | null = null;
      let depth = 1;
      let n: Node | null = start.nextSibling;
      while (n) {
        if (n.nodeType === 8) {
          const d = (n as Comment).data;
          if (d === 'if:start') depth++;
          else if (d === 'if:end') { depth--; if (depth === 0) { end = n as Comment; break; } }
        }
        n = n.nextSibling;
      }
      if (!end) throw new Error('hydrate(if): end anchor not found');

      let activeIndex = -1;
      let active: Program | null = null;

      // Try to detect existing branch without mutating DOM
      const firstBetween = ((): ChildNode | null => {
        let c = start.nextSibling as ChildNode | null;
        while (c && c !== end && (c.nodeType === 3 && !(c.textContent || '').trim())) c = c.nextSibling as ChildNode | null; // skip empty text
        return c && c !== end ? c : null;
      })();

      if (firstBetween) {
        // Try to map to chain based on node kind
        for (let i = 0; i < chain.length; i++) {
          const p = chain[i].plan as Plan;
          if (firstBetween.nodeType === 1 && p.kind === 'element') {
            if (p.rootTag && p.rootTag === ((firstBetween as Element).tagName || '').toUpperCase()) {
              activeIndex = i;
              try { active = p.hydrate(firstBetween as Element); } catch {}
              break;
            }
          } else if (firstBetween.nodeType === 8 && p.kind !== 'element') {
            const data = (firstBetween as Comment).data;
            if (data && data.startsWith(p.kind + ':start')) {
              activeIndex = i;
              try { active = p.hydrate(firstBetween as Comment); } catch {}
              break;
            }
          }
        }
      }

      const update = (data: TemplateData) => {
        const scope: Scope = Object.assign(Object.create(null), data);
        // Compute desired index
        let idx = -1;
        for (let i = 0; i < chain.length; i++) {
          const c = chain[i];
          if (c.type === 'else') { idx = i; break; }
          const cond = truthy(get(scope, c.expr!));
          if (cond) { idx = i; break; }
        }
        if (idx !== activeIndex) {
          // Remove old DOM and program
          if (active) { try { active.destroy(); } catch {} }
          removeBetween(start, end);
          active = null;
          if (idx !== -1) {
            const p = chain[idx].plan.instantiate();
            end.before(p.node);
            active = p;
          }
          activeIndex = idx;
        }
        if (active) active.update(scope);
      };
      const destroy = () => { if (active) { try { active.destroy(); } catch {} } removeBetween(start, end); };
      // For hydrate, return program tied to anchors; node is a placeholder
      const frag = document.createDocumentFragment();
      frag.append(document.createComment('hydrated-if'));
      return { node: frag, update, destroy };
    }
  };
}

function makeEachPlan(node: Element): Plan {
  const expr = node.getAttribute('data-each')!; node.removeAttribute('data-each');
  const { listKey, itemAlias, indexAlias, keyExpr } = parseEach(expr);
  const keyAttr = node.getAttribute('data-key') || undefined; if (keyAttr) node.removeAttribute('data-key');
  const itemPlan = compilePlanNode(node);

  type Row = { key: any; program: Program; scope: Scope };

  return {
    kind: 'each',
    instantiate(): Program {
      const start = document.createComment('each:start');
      const end = document.createComment('each:end');
      const frag = document.createDocumentFragment();
      frag.append(start, end);

      let rows: Row[] = [];

      function makeKey(itemScope: Scope): any {
        const exprToUse = keyAttr || keyExpr;
        if (!exprToUse) return undefined;
        try { return get(itemScope, exprToUse); } catch { return undefined; }
      }

      const update = (data: TemplateData) => {
        const scope: Scope = Object.assign(Object.create(null), data);
        const list = get(scope, listKey);
        const arr = Array.isArray(list) ? list : [];
        const nextRows: Row[] = new Array(arr.length);

        const keyed = (keyAttr || keyExpr) != null;
        const oldByKey = new Map<any, Row>();
        if (keyed) for (const r of rows) oldByKey.set(r.key, r);

        let prevSibling: Node = start;
        for (let i = 0; i < arr.length; i++) {
          const item = arr[i];
          const childScope: Scope = Object.assign(Object.create(scope), {
            [itemAlias]: item,
            [indexAlias]: i,
            $item: item,
            $index: i,
            $parent: scope
          });
          const key = makeKey(childScope);

          let row: Row | undefined;
          if (keyed && oldByKey.has(key)) {
            row = oldByKey.get(key)!;
            // Move node to correct position if needed
            if (row.program.node.nextSibling !== end) {
              if (prevSibling.nextSibling !== row.program.node) {
                end.parentNode!.insertBefore(row.program.node, prevSibling.nextSibling);
              }
            }
            row.scope = childScope;
            row.program.update(childScope);
            oldByKey.delete(key);
          } else if (!keyed && rows[i]) {
            row = rows[i];
            row.scope = childScope;
            row.program.update(childScope);
          } else {
            const p = itemPlan.instantiate();
            end.parentNode!.insertBefore(p.node, prevSibling.nextSibling);
            row = { key, program: p, scope: childScope };
            row.program.update(childScope);
          }
          nextRows[i] = row!;
          prevSibling = row!.program.node;
        }

        // Remove leftovers
        if (keyed) {
          for (const r of oldByKey.values()) {
            try { r.program.destroy(); } catch {}
            if (r.program.node.parentNode) r.program.node.parentNode.removeChild(r.program.node);
          }
        } else {
          for (let i = arr.length; i < rows.length; i++) {
            const r = rows[i];
            try { r.program.destroy(); } catch {}
            if (r.program.node.parentNode) r.program.node.parentNode.removeChild(r.program.node);
          }
        }

        rows = nextRows;
      };

      const destroy = () => { rows.forEach(r => { try { r.program.destroy(); } catch {} }); removeBetween(start, end); };
      return { node: frag, update, destroy };
    },
    hydrate(target: Node): Program {
      const start = target as Comment;
      // find matching end (balanced for nested each)
      let end: Comment | null = null;
      let depth = 1;
      let nn: Node | null = start.nextSibling;
      while (nn) {
        if (nn.nodeType === 8) {
          const d = (nn as Comment).data;
          if (d === 'each:start') depth++;
          else if (d === 'each:end') { depth--; if (depth === 0) { end = nn as Comment; break; } }
        }
        nn = nn.nextSibling;
      }
      if (!end) throw new Error('hydrate(each): end anchor not found');

      type Row = { key: any; program: Program; scope: Scope };
      let rows: Row[] = [];

      function makeKey(itemScope: Scope): any {
        const exprToUse = keyAttr || keyExpr;
        if (!exprToUse) return undefined;
        try { return get(itemScope, exprToUse); } catch { return undefined; }
      }

      const update = (data: TemplateData) => {
        const scope: Scope = Object.assign(Object.create(null), data);
        const list = get(scope, listKey);
        const arr = Array.isArray(list) ? list : [];
        const nextRows: Row[] = new Array(arr.length);

        // On first run with no rows, try to hydrate existing children
        if (rows.length === 0) {
          // Build rows from current DOM nodes between anchors
          const domChildren: Element[] = [];
          let c: Node | null = start.nextSibling;
          while (c && c !== end) {
            if (c.nodeType === 1) domChildren.push(c as Element);
            c = c.nextSibling;
          }
          for (let i = 0; i < domChildren.length && i < arr.length; i++) {
            const childScope: Scope = Object.assign(Object.create(scope), {
              [itemAlias]: arr[i],
              [indexAlias]: i,
              $item: arr[i],
              $index: i,
              $parent: scope
            });
            const key = makeKey(childScope);
            const p = itemPlan.hydrate(domChildren[i]);
            p.update(childScope);
            rows.push({ key, program: p, scope: childScope });
          }
        }

        const keyed = (keyAttr || keyExpr) != null;
        const oldByKey = new Map<any, Row>();
        if (keyed) for (const r of rows) oldByKey.set(r.key, r);

        let prevSibling: Node = start;
        for (let i = 0; i < arr.length; i++) {
          const item = arr[i];
          const childScope: Scope = Object.assign(Object.create(scope), {
            [itemAlias]: item,
            [indexAlias]: i,
            $item: item,
            $index: i,
            $parent: scope
          });
          const key = makeKey(childScope);

          let row: Row | undefined;
          if (keyed && oldByKey.has(key)) {
            row = oldByKey.get(key)!;
            // Move node to correct position if needed
            if (row.program.node.nextSibling !== end) {
              if (prevSibling.nextSibling !== row.program.node) {
                end.parentNode!.insertBefore(row.program.node, prevSibling.nextSibling);
              }
            }
            row.scope = childScope;
            row.program.update(childScope);
            oldByKey.delete(key);
          } else if (!keyed && rows[i]) {
            row = rows[i];
            row.scope = childScope;
            row.program.update(childScope);
          } else {
            const p = itemPlan.instantiate();
            end.parentNode!.insertBefore(p.node, prevSibling.nextSibling);
            row = { key, program: p, scope: childScope };
            row.program.update(childScope);
          }
          nextRows[i] = row!;
        
          prevSibling = row!.program.node;
        }

        // Remove leftovers
        if (keyed) {
          for (const r of oldByKey.values()) {
            try { r.program.destroy(); } catch {}
            if (r.program.node.parentNode) r.program.node.parentNode.removeChild(r.program.node);
          }
        } else {
          for (let i = arr.length; i < rows.length; i++) {
            const r = rows[i];
            try { r.program.destroy(); } catch {}
            if (r.program.node.parentNode) r.program.node.parentNode.removeChild(r.program.node);
          }
        }

        rows = nextRows;
      };
      const destroy = () => { rows.forEach(r => { try { r.program.destroy(); } catch {} }); removeBetween(start, end); };
      const frag = document.createDocumentFragment();
      frag.append(document.createComment('hydrated-each'));
      return { node: frag, update, destroy };
    }
  };
}

function makeIncludePlan(node: Element): Plan {
  const includeExpr = node.getAttribute('data-include')!; node.removeAttribute('data-include');
  const withExpr = node.getAttribute('data-with') || undefined; if (withExpr) node.removeAttribute('data-with');

  // Precompile context accessor
  const withAcc = withExpr ? compileAccessor(withExpr) : null;
  // Detect static template ref (e.g., "#tpl") and precompile Plan
  const staticTplId = typeof includeExpr === 'string' && includeExpr.startsWith('#') ? includeExpr : null;
  let staticTplPlan: Plan | null = null;
  if (staticTplId) {
    try {
      const t = tpl(staticTplId);
      staticTplPlan = PLAN_CACHE.get(t) || ((): Plan | null => {
        const first = t.content.firstElementChild as Element | null; if (!first) return null;
        const p = compilePlan(first); PLAN_CACHE.set(t, p); return p;
      })();
    } catch {}
  }
  // Dynamic ref accessor otherwise
  const refAcc = staticTplId ? null : compileAccessor(includeExpr);

  return {
    kind: 'include',
    instantiate(): Program {
      const start = document.createComment('include:start');
      const end = document.createComment('include:end');
      const frag = document.createDocumentFragment();
      frag.append(start, end);

      let child: Program | null = null;

      const update = (data: TemplateData) => {
        const scope: Scope = Object.assign(Object.create(null), data);
        const ctx = withAcc ? withAcc(scope) : scope;
        let templateEl: HTMLTemplateElement | null = null;
        let partialNode: Node | null = null;
        let plan: Plan | null = staticTplPlan;

        if (!staticTplPlan) {
          const ref = refAcc ? refAcc(scope) : undefined;
          if (ref instanceof HTMLTemplateElement) templateEl = ref;
          else if (typeof ref === 'string' && ref.startsWith('#')) templateEl = tpl(ref);
          else if (typeof ref === 'function') {
            partialNode = ref(ctx);
          }
          if (templateEl) {
            plan = PLAN_CACHE.get(templateEl) || ((): Plan | null => {
              const first = templateEl!.content.firstElementChild as Element | null; if (!first) return null;
              const p = compilePlan(first); PLAN_CACHE.set(templateEl!, p); return p;
            })();
          }
        }

        if (partialNode) {
          if (child) { try { child.destroy(); } catch {} child = null; }
          removeBetween(start, end);
          end.before(partialNode);
          return;
        }

        if (plan) {
          if (child) { child.update(ctx as any); return; }
          const p = plan.instantiate();
          p.update(ctx as any);
          end.before(p.node);
          child = p;
          return;
        }
      };
      const destroy = () => { if (child) { try { child.destroy(); } catch {} } removeBetween(start, end); };
      return { node: frag, update, destroy };
    },
    hydrate(target: Node): Program {
      const start = target as Comment;
      let end: Comment | null = null;
      let depth = 1;
      let n: Node | null = start.nextSibling;
      while (n) {
        if (n.nodeType === 8) {
          const d = (n as Comment).data;
          if (d === 'include:start') depth++;
          else if (d === 'include:end') { depth--; if (depth === 0) { end = n as Comment; break; } }
        }
        n = n.nextSibling;
      }
      if (!end) throw new Error('hydrate(include): end anchor not found');

      let child: Program | null = null;

      // Try to hydrate existing element if any and staticTplPlan is available
      const firstBetween = ((): Element | null => {
        let c: Node | null = start.nextSibling;
        while (c && c !== end) { if (c.nodeType === 1) return c as Element; c = c.nextSibling; }
        return null;
      })();
      if (firstBetween && staticTplPlan && (staticTplPlan.rootTag || '').toUpperCase() === (firstBetween.tagName || '').toUpperCase()) {
        try { child = staticTplPlan.hydrate(firstBetween); } catch {}
      }

      const update = (data: TemplateData) => {
        const scope: Scope = Object.assign(Object.create(null), data);
        const ctx = withAcc ? withAcc(scope) : scope;

        if (child) { child.update(ctx as any); return; }

        // Fallback to instantiate path for dynamic includes
        let templateEl: HTMLTemplateElement | null = null;
        let partialNode: Node | null = null;
        let plan: Plan | null = staticTplPlan;
        if (!staticTplPlan) {
          const ref = refAcc ? refAcc(scope) : undefined;
          if (ref instanceof HTMLTemplateElement) templateEl = ref;
          else if (typeof ref === 'string' && ref.startsWith('#')) templateEl = tpl(ref);
          else if (typeof ref === 'function') { partialNode = ref(ctx); }
          if (templateEl) {
            plan = PLAN_CACHE.get(templateEl) || ((): Plan | null => {
              const first = templateEl!.content.firstElementChild as Element | null; if (!first) return null;
              const p = compilePlan(first); PLAN_CACHE.set(templateEl!, p); return p;
            })();
          }
        }
        if (partialNode) { removeBetween(start, end); end.before(partialNode); return; }
        if (plan) {
          const p = plan.instantiate();
          p.update(ctx as any);
          removeBetween(start, end);
          end.before(p.node);
          child = p;
          return;
        }
      };
      const destroy = () => { if (child) { try { child.destroy(); } catch {} } removeBetween(start, end); };
      const frag = document.createDocumentFragment();
      frag.append(document.createComment('hydrated-include'));
      return { node: frag, update, destroy };
    }
  };
}

function compileNode(node: Element, updaters: Updater[], destroyers: Array<() => void>): Node {
  // Structural chains: data-if/elseif/else
  if (node.hasAttribute('data-if')) {
    return compileIfChain(node, updaters, destroyers);
  }

  // Loops
  if (node.hasAttribute('data-each')) {
    return compileEach(node, updaters, destroyers);
  }

  // Includes / partials
  if (node.hasAttribute('data-include')) {
    return compileInclude(node, updaters, destroyers);
  }

  // Non-structural bindings on this node
  compileNodeBindings(node, updaters, destroyers);

  // Children
  // Use static snapshot since we may mutate attributes
  const children = Array.from(node.children) as Element[];
  for (const child of children) {
    const compiled = compileNode(child, updaters, destroyers);
    if (compiled !== child) child.replaceWith(compiled);
  }
  return node;
}

function compileNodeBindings(el: Element, updaters: Updater[], destroyers: Array<() => void>) {
  // data-show / data-hide
  if (el.hasAttribute('data-show')) {
    const expr = el.getAttribute('data-show')!; el.removeAttribute('data-show');
    updaters.push(scope => { (el as HTMLElement).style.display = truthy(get(scope, expr)) ? '' : 'none'; });
  }
  if (el.hasAttribute('data-hide')) {
    const expr = el.getAttribute('data-hide')!; el.removeAttribute('data-hide');
    updaters.push(scope => { (el as HTMLElement).style.display = truthy(get(scope, expr)) ? 'none' : ''; });
  }

  // data-text
  if (el.hasAttribute('data-text')) {
    const expr = el.getAttribute('data-text')!; el.removeAttribute('data-text');
    updaters.push(scope => { (el as HTMLElement).textContent = toString(get(scope, expr)); });
  }

  // data-html (raw), data-safe-html (escaped)
  if (el.hasAttribute('data-html')) {
    const raw = el.getAttribute('data-html')!; el.removeAttribute('data-html');
    const unsafeMatch = raw.match(/^\s*unsafe\s*\((.*)\)\s*$/);
    if (unsafeMatch) {
      const inner = (unsafeMatch[1] || '').trim();
      updaters.push(scope => { (el as HTMLElement).innerHTML = toString(get(scope, inner)); });
    } else {
      updaters.push(scope => {
        const val = get(scope, raw);
        if (val && typeof val === 'object' && '__html' in val) (el as HTMLElement).innerHTML = String(val.__html);
        else (el as HTMLElement).innerHTML = toString(val);
      });
    }
  }
  if (el.hasAttribute('data-safe-html')) {
    const expr = el.getAttribute('data-safe-html')!; el.removeAttribute('data-safe-html');
    updaters.push(scope => { (el as HTMLElement).innerHTML = escapeHTML(get(scope, expr)); });
  }

  // data-attr-*
  for (const attr of Array.from(el.attributes)) {
    if (!attr.name.startsWith('data-attr-')) continue;
    const original = attr.name; const name = original.replace('data-attr-', ''); const expr = attr.value;
    el.removeAttribute(original);
    updaters.push(scope => {
      const val = get(scope, expr);
      if (val === false || val == null) el.removeAttribute(name);
      else el.setAttribute(name, String(val));
    });
  }

  // data-on-*
  for (const attr of Array.from(el.attributes)) {
    if (!attr.name.startsWith('data-on-')) continue;
    const original = attr.name; const type = original.replace('data-on-', ''); const expr = attr.value;
    el.removeAttribute(original);
    const EVENT_TOKEN: unique symbol = Symbol('event');
    const listener = (ev: Event) => {
      const scope = (listener as any)._scope as Scope;
      const { fn, args } = resolveHandler(scope, expr, EVENT_TOKEN);
      if (typeof fn === 'function') {
        try {
          const finalArgs = (args ?? []).map(a => a === EVENT_TOKEN ? ev : a);
          (fn as any).call(el, ev, ...finalArgs);
        } catch {}
      }
    };
    (listener as any)._scope = Object.create(null);
    el.addEventListener(type, listener as any);
    destroyers.push(() => el.removeEventListener(type, listener as any));
    updaters.push(scope => { (listener as any)._scope = scope; });
  }
}

// ——— Structural: If / ElseIf / Else chains ———
function compileIfChain(first: Element, updaters: Updater[], destroyers: Array<() => void>): Node {
  // Collect chain: first (has data-if) followed by any number of siblings with data-elseif / data-else
  const chain: Array<{ type: 'if' | 'elseif' | 'else'; node: Element; expr?: string }> = [];
  let cursor: Element | null = first;
  while (cursor) {
    if (cursor.hasAttribute('data-if')) {
      chain.push({ type: 'if', node: cursor, expr: cursor.getAttribute('data-if')! });
      cursor.removeAttribute('data-if');
    } else if (cursor.hasAttribute('data-elseif')) {
      chain.push({ type: 'elseif', node: cursor, expr: cursor.getAttribute('data-elseif')! });
      cursor.removeAttribute('data-elseif');
    } else if (cursor.hasAttribute('data-else')) {
      chain.push({ type: 'else', node: cursor });
      cursor.removeAttribute('data-else');
    } else {
      break;
    }
    const next: Element | null = cursor.nextElementSibling;
    cursor = next && (next.hasAttribute('data-elseif') || next.hasAttribute('data-else')) ? next : null;
  }

  const start = document.createComment('if:start');
  const end = document.createComment('if:end');
  if (first.parentNode) {
    first.before(start);
    for (const { node } of chain) { node.remove(); }
    start.after(end);
  } else {
    // Root-level chain: return a fragment containing anchors
    const frag = document.createDocumentFragment();
    frag.append(start, end);
  }

  // Compile blocks (detached)
  const blocks = chain.map(c => compileDetached(c.node, updaters, destroyers));

  // Active block state
  let activeIndex = -1;
  let activeNode: Node | null = null;
  const update = (scope: Scope) => {
    // Decide which block to show
    let idx = -1;
    for (let i = 0; i < chain.length; i++) {
      const c = chain[i];
      if (c.type === 'else') { idx = i; break; }
      const cond = truthy(get(scope, c.expr!));
      if (cond) { idx = i; break; }
    }
    // Switch blocks if necessary
    if (idx !== activeIndex) {
      if (activeNode) removeBetween(start, end);
      if (idx !== -1) {
        const block = blocks[idx];
        end.before(block.node);
        activeNode = block.node;
      } else {
        activeNode = null;
      }
      activeIndex = idx;
    }
    // Update the active block
    if (activeIndex !== -1) blocks[activeIndex].update(scope);
  };
  updaters.push(update);

  // If no parent at compile time, return a fragment holding anchors
  return start.parentNode ? start : ((): Node => {
    const frag = document.createDocumentFragment();
    frag.append(start, end);
    return frag;
  })();
}

// ——— Structural: Each (loops) ———
function compileEach(node: Element, updaters: Updater[], destroyers: Array<() => void>): Node {
  const expr = node.getAttribute('data-each')!; node.removeAttribute('data-each');
  const { listKey, itemAlias, indexAlias, keyExpr } = parseEach(expr);
  // Optional explicit key attribute on repeated node overrides parsed keyExpr
  const keyAttr = node.getAttribute('data-key') || undefined; if (keyAttr) node.removeAttribute('data-key');

  const start = document.createComment('each:start');
  const end = document.createComment('each:end');
  if (node.parentNode) {
    node.before(start); node.after(end); node.remove();
  }

  // Template for items
  const blueprint = node.cloneNode(true) as Element;

  type Row = { key: any; block: { node: Node; update: (s: Scope) => void; destroy: () => void }; scope: Scope };
  let rows: Row[] = [];

  function makeKey(itemScope: Scope): any {
    const exprToUse = keyAttr || keyExpr;
    if (!exprToUse) return undefined;
    try { return get(itemScope, exprToUse); } catch { return undefined; }
  }

  const update = (scope: Scope) => {
    const list = get(scope, listKey);
    const arr = Array.isArray(list) ? list : [];
    const nextRows: Row[] = new Array(arr.length);

    const keyed = (keyAttr || keyExpr) != null;
    const oldByKey = new Map<any, Row>();
    if (keyed) for (const r of rows) oldByKey.set(r.key, r);

    let prevSibling: Node = start;
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      // Child scope uses prototype chain for parent lookup
      const childScope: Scope = Object.assign(Object.create(scope), {
        [itemAlias]: item,
        [indexAlias]: i,
        $item: item,
        $index: i,
        $parent: scope
      });
      const key = makeKey(childScope);

      let row: Row | undefined;
      if (keyed && oldByKey.has(key)) {
        row = oldByKey.get(key)!;
        // Move node to correct position if needed
        if (row.block.node.nextSibling !== end) {
          // Ensure it's in the right order
          if (prevSibling.nextSibling !== row.block.node) {
            end.parentNode!.insertBefore(row.block.node, prevSibling.nextSibling);
          }
        }
        row.scope = childScope;
        row.block.update(childScope);
        oldByKey.delete(key);
      } else if (!keyed && rows[i]) {
        row = rows[i];
        row.scope = childScope;
        row.block.update(childScope);
      } else {
        // Create new
        const compiled = compileDetached(blueprint.cloneNode(true) as Element, updaters, destroyers);
        end.parentNode!.insertBefore(compiled.node, prevSibling.nextSibling);
        row = { key, block: compiled, scope: childScope };
        row.block.update(childScope);
      }
      nextRows[i] = row!;
      prevSibling = row!.block.node;
    }

    // Remove leftovers
    if (keyed) {
      for (const r of oldByKey.values()) {
        r.block.destroy();
        if (r.block.node.parentNode) r.block.node.parentNode.removeChild(r.block.node);
      }
    } else {
      for (let i = arr.length; i < rows.length; i++) {
        const r = rows[i];
        r.block.destroy();
        if (r.block.node.parentNode) r.block.node.parentNode.removeChild(r.block.node);
      }
    }

    rows = nextRows;
  };
  updaters.push(update);
  destroyers.push(() => { rows.forEach(r => r.block.destroy()); removeBetween(start, end); });

  // If root-level (no parent at compile time), return a fragment containing anchors
  return start.parentNode ? start : ((): Node => { const frag = document.createDocumentFragment(); frag.append(start, end); return frag; })();
}

// ——— Structural: Include / Partials ———
function compileInclude(node: Element, updaters: Updater[], destroyers: Array<() => void>): Node {
  const includeExpr = node.getAttribute('data-include')!; node.removeAttribute('data-include');
  const withExpr = node.getAttribute('data-with') || undefined; if (withExpr) node.removeAttribute('data-with');

  const start = document.createComment('include:start');
  const end = document.createComment('include:end');
  if (node.parentNode) { node.before(start); node.after(end); node.remove(); }

  let child: Program | null = null;

  const update = (scope: Scope) => {
    const ctx = withExpr ? get(scope, withExpr) : scope;
    let templateEl: HTMLTemplateElement | null = null;
    let partialNode: Node | null = null;
    let templateProgram: Program | null = null;

    const ref = get(scope, includeExpr);
    if (ref instanceof HTMLTemplateElement) templateEl = ref;
    else if (typeof ref === 'string' && ref.startsWith('#')) templateEl = tpl(ref);
    else if (typeof ref === 'function') {
      // User-provided renderer function
      partialNode = ref(ctx);
    } else if (typeof includeExpr === 'string' && includeExpr.startsWith('#')) {
      templateEl = tpl(includeExpr);
    }

    // If function returned a Node, mount it directly
    if (partialNode) {
      removeBetween(start, end);
      end.before(partialNode);
      return;
    }

    if (templateEl) {
      if (child) { child.update(ctx as any); return; }
      const first = templateEl.content.firstElementChild;
      if (!first) return;
      const program = compile(first.cloneNode(true) as Element);
      program.update(ctx as any);
      end.before(program.node);
      child = program;
      destroyers.push(() => { program.destroy(); });
      return;
    }
  };
  updaters.push(update);
  destroyers.push(() => removeBetween(start, end));
  return start.parentNode ? start : ((): Node => { const frag = document.createDocumentFragment(); frag.append(start, end); return frag; })();
}

// ——— Utilities for structural compilation ———
function compileDetached(node: Element, _updaters: Updater[], _destroyers: Array<() => void>): { node: Node; update: (s: Scope) => void; destroy: () => void } {
  const updaters: Updater[] = [];
  const destroyers: Array<() => void> = [];
  const compiled = compileNode(node, updaters, destroyers);
  return {
    node: compiled,
    update: (s: Scope) => { for (const u of updaters) u(s); },
    destroy: () => { destroyers.forEach(fn => fn()); }
  };
}

function removeBetween(start: Node, end: Node) {
  let n = start.nextSibling;
  while (n && n !== end) { const next = n.nextSibling; n.parentNode!.removeChild(n); n = next; }
}

// ——— Expressions & helpers ———
type Accessor = (scope: any) => any;

function compileAccessor(path: string): Accessor {
  if (path == null || path === '') return (scope: any) => scope;
  const segs = path.split('.');
  return (obj: any) => {
    let cur: any = obj;
    for (const seg of segs) {
      if (seg === '$parent' || seg === '..') cur = cur?.$parent ?? undefined;
      else if (seg === '$this' || seg === 'this') cur = cur;
      else cur = cur != null ? cur[seg] : undefined;
    }
    return cur;
  };
}

type ArgEvaluator = (scope: any, EVENT_TOKEN: symbol) => any;
function parseHandlerSpec(spec: string): { fn: Accessor; args: ArgEvaluator[] } {
  const name = spec.trim();
  if (!name) return { fn: () => undefined, args: [] };
  const callMatch = name.match(/^([a-zA-Z_$][\w$]*)\s*\((.*)\)\s*$/);
  let fnName = name; let argsSrc = '';
  if (callMatch) { fnName = callMatch[1]; argsSrc = callMatch[2]; }
  const fn = compileAccessor(fnName);
  const args: ArgEvaluator[] = [];
  if (callMatch) {
    // split by commas not in quotes (simple)
    const src = argsSrc;
    let i = 0, cur = '', inStr: false | '"' | "'" = false;
    const push = () => { const ev = compileArg(cur.trim()); if (ev) args.push(ev); cur = ''; };
    while (i < src.length) {
      const ch = src[i++];
      if ((ch === '"' || ch === "'") && !inStr) { inStr = ch as any; cur += ch; continue; }
      if (inStr === ch) { inStr = false; cur += ch; continue; }
      if (!inStr && ch === ',') { push(); continue; }
      cur += ch;
    }
    if (cur.trim()) push();
  }
  return { fn, args };
}

function compileArg(expr: string): ArgEvaluator | null {
  if (!expr) return null;
  // string literal
  const t = expr.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    let val: any = t.slice(1, -1);
    try { val = JSON.parse(t.replace(/^'(.+)'$/, '"$1"')); } catch {}
    return () => val;
  }
  if (t === 'true') return () => true;
  if (t === 'false') return () => false;
  if (t === 'null') return () => null;
  if (t === 'undefined') return () => undefined;
  if (/^-?\d+(?:\.\d+)?$/.test(t)) { const num = parseFloat(t); return () => num; }
  if (t === '$event') return (_s, EVENT_TOKEN) => EVENT_TOKEN;
  // path
  const acc = compileAccessor(t);
  return (s) => acc(s);
}

function parseEach(expr: string): { listKey: string; itemAlias: string; indexAlias: string; keyExpr?: string } {
  // Syntax: "items", "items as item", "items as item, i", optional key: "... by keyExpr"
  const trimmed = expr.trim();
  const byParts = trimmed.split(/\s+by\s+/i);
  let left = byParts[0].trim();
  const keyExpr = byParts[1] ? byParts[1].trim() : undefined;

  const asMatch = left.split(/\s+as\s+/i);
  let listKey = left;
  let itemAlias = 'item';
  let indexAlias = '$index';
  if (asMatch.length === 2) {
    listKey = asMatch[0].trim();
    const rhs = asMatch[1].trim();
    const parts = rhs.split(',');
    if (parts[0]) itemAlias = parts[0].trim();
    if (parts[1]) indexAlias = parts[1].trim();
  }
  return { listKey, itemAlias, indexAlias, keyExpr };
}

function truthy(v: any): boolean { return !!v; }
function toString(v: any): string { return v == null ? '' : String(v); }

function get(obj: any, path: string, fallback: any = ''): any {
  if (path == null || path === '') return obj;
  // Support ../ parent syntax
  const segs = path.split('.');
  let cur: any = obj;
  for (const seg of segs) {
    if (seg === '$parent' || seg === '..') cur = cur?.$parent ?? undefined;
    else if (seg === '$this' || seg === 'this') cur = cur;
    else cur = cur != null ? cur[seg] : undefined;
  }
  return cur ?? fallback;
}

// data-on-* handler spec parser: "fn", "fn(a,b)", args: literals, paths, $event, $item, $index, $parent
function resolveHandler(scope: Scope, spec: string, EVENT_TOKEN?: symbol): { fn: Function | undefined; args: any[] } {
  const name = spec.trim();
  if (!name) return { fn: undefined, args: [] };
  const callMatch = name.match(/^([a-zA-Z_$][\w$]*)\s*\((.*)\)\s*$/);
  let fnName = name; let argsSrc = '';
  if (callMatch) { fnName = callMatch[1]; argsSrc = callMatch[2]; }
  const fn = get(scope, fnName);
  const args = callMatch ? parseArgs(scope, argsSrc, EVENT_TOKEN) : [];
  return { fn, args };
}

function parseArgs(scope: Scope, src: string, EVENT_TOKEN?: symbol): any[] {
  // Very small argument parser: split by commas not in quotes
  const out: any[] = [];
  let i = 0, cur = '', inStr: false | '"' | "'" = false;
  const push = () => { const v = evalExpr(scope, cur.trim(), EVENT_TOKEN); if (v !== undefined) out.push(v); cur = ''; };
  while (i < src.length) {
    const ch = src[i++];
    if ((ch === '"' || ch === "'") && !inStr) { inStr = ch as any; cur += ch; continue; }
    if (inStr === ch) { inStr = false; cur += ch; continue; }
    if (!inStr && ch === ',') { push(); continue; }
    cur += ch;
  }
  if (cur.trim()) push();
  return out;
}

function evalExpr(scope: Scope, expr: string, EVENT_TOKEN?: symbol): any {
  if (!expr) return undefined;
  // string literal
  if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
    try { return JSON.parse(expr.replace(/^'(.+)'$/, '"$1"')); } catch { return expr.slice(1, -1); }
  }
  if (expr === 'true') return true;
  if (expr === 'false') return false;
  if (expr === 'null') return null;
  if (expr === 'undefined') return undefined;
  if (/^-?\d+(?:\.\d+)?$/.test(expr)) return parseFloat(expr);
  if (expr === '$event') return EVENT_TOKEN; // placeholder token -> substituted to the Event in listener
  // path lookup
  return get(scope, expr);
}
