# @dk/dom-js Architecture Guide

This document explains how @dk/dom-js is structured and why it’s built this way. It’s written for maintainers and contributors. For installation, import options, and API usage, see `README.md`.

## Principles

- Single-concern modules: Each file owns one area of functionality
- Zero dependencies: No runtime deps across all modules
- Tree‑shakable ESM: Import only what you use
- Backward compatible: Full bundle remains stable
- Extensible: First‑class plugin system
- Strong typings: Generic `DOMCollection<T>`, typed events, and module augmentation

## Module Map

```
src/
├── index.ts          # Main entry point (full bundle)
├── core.ts           # Core DOM manipulation (no extras)
├── server.ts         # Server‑safe entry (no real DOM)
├── collection.ts     # DOMCollection class + methods
├── http.ts           # HTTP utilities
├── template.ts       # Template system
├── forms.ts          # Form helpers
├── motion.ts         # Animations (Web Animations API)
├── plugins.ts        # Plugin system wiring
├── utils.ts          # Debounce/throttle, nextTick/raf
├── observers.ts      # Intersection/Resize/Mutation wrappers
├── scroll.ts         # Scroll helpers
└── types.ts          # Shared types
```

Responsibilities are intentionally narrow so features can be combined without dragging in unused code.

## Types & DX

- Generic collections: `DOMCollection<T extends Element>` preserves element type through chains.
- Typed selection: `dom<T>(selector)` returns `DOMCollection<T>` (e.g. `dom<HTMLButtonElement>("#save")`).
- Typed events: Event names map to DOM event types for `on/once` at both top‑level and collection APIs.
- Module augmentation: Consumers can extend the `Dom` interface and the collection prototype with full typings.

Example augmentation:

```ts
import dom, { type DOMCollection } from '@dk/dom-js';

declare module '@dk/dom-js' {
  interface Dom {
    flash(selector: string): Promise<DOMCollection>;
  }
}

dom.use(api => {
  api.flash = (sel) => api(sel).fadeIn(150);
});
```

## Plugins

- Register with `dom.use(api => { ... })`.
- Add static helpers on `api`, or chainable methods via `api.DOMCollection.prototype.method = ...`.
- Keep plugins side‑effect free at import time and avoid hard DOM dependencies.

## SSR/Non‑DOM Environments

Use `@dk/dom-js/server` to import in Node/SSR. It exposes the same callable `dom()` with safe no‑ops for DOM operations while keeping `http` and utilities available.

Environment safeguards:
- No `window`/`document` access at import time in any module
- `ready()` runs immediately without `document`
- `raf()`/`rafThrottle()` fall back to `setTimeout`
- Scroll/motion helpers early‑return when DOM is missing
- `fromHTML()` returns an empty collection on server; `create()` throws to reveal accidental DOM usage

See `README.md` for SSR usage examples.

### Template Hydration

The template engine supports client‑side hydration that binds event listeners and data bindings to server‑rendered HTML, instead of re‑creating nodes.

- Structural directives (`data-if/elseif/else`, `data-each`, `data-include`) are compiled to plans that render with paired anchor comments: `if:start/if:end`, `each:start/each:end`, `include:start/include:end`.
- During hydration, the same Plans use these anchors to locate the existing DOM subtree and wire up bindings:
  - Element plans: attach non‑structural bindings (`data-text`, `data-html`, `data-attr-*`, `data-on-*`, `data-show/hide`) directly to the live element, then hydrate child plans in order.
  - If plans: detect the active branch between `if` anchors, hydrate the branch, and on updates switch branches (removing/re‑inserting between anchors) while preserving the anchors.
  - Each plans: on first update, hydrate existing children between `each` anchors into row programs; subsequent updates perform keyed/non‑keyed diffing as usual.
  - Include plans: attempt to hydrate static includes if the precompiled partial matches the existing node; otherwise instantiate on first update.

API: `hydrateTemplate(ref, root, data)` returns `{ el, update, destroy }` similar to `mountTemplate`. It expects that `root` corresponds to the first element inside the template `ref` as rendered on the server and that structural anchors are present in the HTML.

## Bundling & Imports

@dk/dom-js ships pure ESM with subpath exports to support three common patterns:

- Full bundle: `@dk/dom-js` (everything included)
- Core only: `@dk/dom-js/core` (DOM + events)
- Modular: import individual modules (e.g. `.../http`, `.../template`)

These entry points are designed for good tree‑shaking in modern bundlers. See `README.md` for code samples and guidance on when to use each style.

### Current Bundle Sizes (raw dist)

<!-- AUTO-GENERATED: BUNDLE_SIZES_START -->
| Module | ESM (KB) | CJS (KB) |
| --- | --- | --- |
| Full | 68.98 | 69.94 |
| Core | 27.55 | 28.10 |
| HTTP | 9.25 | 9.75 |
| Templates | 16.66 | 17.26 |
| Forms | 4.55 | 5.11 |
| Motion | 31.51 | 32.05 |

_Note: raw minified dist file sizes (not gzip)._<!-- AUTO-GENERATED: BUNDLE_SIZES_END -->

## Template Engine (Plan/Program)

The template system compiles HTML templates to a reusable Plan (parse once) and instantiates Programs (per mount/update):

- Plan: result of a single DOM walk that normalizes a template node, collects binding factories, and compiles structural directives (`if/elseif/else`, `each`, `include`). Plans are pure and reusable.
- Program: per‑instance object `{ node, update(data), destroy() }` created from a Plan. It clones the normalized blueprint, attaches listeners, and wires updaters.

Caching:
- A `WeakMap<HTMLTemplateElement, Plan>` caches compiled plans per template element. `useTemplate(ref)` and `renderTemplate(ref)` both use this cache.
- `data-include` reuses the same cache for nested templates. Static `#id` includes are resolved during planning when possible.

Parsing:
- Non‑structural bindings (`data-text/html/safe-html`, `data-attr-*`, `data-show/hide`) use compiled accessors instead of repeated string path parsing.
- Event handlers (`data-on-*`) are pre‑parsed once into a function accessor and argument evaluators (literals, paths, `$event`).

This two‑phase design removes repeated parsing/traversal across mounts while keeping the public API unchanged.

## Contribution Guidelines (Architecture)

- Prefer adding features as modules or plugins over growing core
- Keep import‑time side effects out of modules
- Preserve zero‑dependency policy and SSR safety
- Maintain strong typings and avoid `any` in public APIs
- Document new modules here briefly and reference `README.md` for usage
