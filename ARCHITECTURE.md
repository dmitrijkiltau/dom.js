# dom.js Architecture Guide

This document explains how dom.js is structured and why it’s built this way. It’s written for maintainers and contributors. For installation, import options, and API usage, see `README.md`.

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
import dom, { type DOMCollection } from '@dmitrijkiltau/dom.js';

declare module '@dmitrijkiltau/dom.js' {
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

Use `@dmitrijkiltau/dom.js/server` to import in Node/SSR. It exposes the same callable `dom()` with safe no‑ops for DOM operations while keeping `http` and utilities available.

Environment safeguards:
- No `window`/`document` access at import time in any module
- `ready()` runs immediately without `document`
- `raf()`/`rafThrottle()` fall back to `setTimeout`
- Scroll/motion helpers early‑return when DOM is missing
- `fromHTML()` returns an empty collection on server; `create()` throws to reveal accidental DOM usage

See `README.md` for SSR usage examples.

## Bundling & Imports

dom.js ships pure ESM with subpath exports to support three common patterns:

- Full bundle: `@dmitrijkiltau/dom.js` (everything included)
- Core only: `@dmitrijkiltau/dom.js/core` (DOM + events)
- Modular: import individual modules (e.g. `.../http`, `.../template`)

These entry points are designed for good tree‑shaking in modern bundlers. See `README.md` for code samples and guidance on when to use each style.

### Approximate Bundle Sizes (v1.5.1, min+gzip)

| Module          | Size      | Notes                         |
| --------------- | --------- | ----------------------------- |
| Full Bundle     | ~10.6 KB  | Complete functionality        |
| Core Only       | ~6.8 KB   | DOM manipulation + events     |
| HTTP            | ~0.7 KB   | Fetch utilities               |
| Templates       | ~2.8 KB   | Template engine               |
| Forms           | ~1.7 KB   | Form helpers                  |
| Motion          | ~6.5 KB   | Animations                    |

Actual sizes depend on your bundler and configuration.

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
