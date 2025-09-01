## dom.js – AI Contributor Guide

Concise project knowledge so an AI agent can make safe, high‑value changes fast. Reflect current code; do not invent abstractions.

### Core Architecture
- Modular, zero‑dep ES2020 library. Each concern in `src/*.ts` (DOM, collection, events, forms, http, template, motion, observers, scroll, plugins, utils, types).
- Public surface assembled in `src/index.ts`; docs & tests import from built `dist/` (never from `src/`).
- `DOMCollection` (in `collection.ts`) is the central chainable wrapper; all mutators return `this`; getters return scalars/arrays/new collections. Performance: plain `for` / `for..of`, no `forEach` in hot paths.

### Key Modules & Patterns
- Selection / creation: `dom()`, `fromHTML()`, `create()`. HTML string detection: starts '<' ends '>'. Server mode guarded by `hasDOM()`.
- Events: Managed registry in `events.ts` supports namespacing (`click.ns`), multi types, delegation, `once`. Remove via `off()`; unspecified types → remove all managed listeners.
- Templates: Structural directives `data-if / data-elseif / data-else`, `data-each="list as item, i [by key]"`, `data-include`, plus bindings `data-text|html|safe-html|attr-*|show|hide|on-*`. Compilation builds updater list; attributes removed after binding. Event arg parsing supports literals, `$event`, `$item`, `$index`, `$parent`.
- Forms: `serializeForm`, `toFormData`, nested name parsing (e.g. `user[address][street]`, arrays with `[]`). `setForm` populates, `validateForm` returns `{ valid, errors[] }` with validity types.
- HTTP: Fluent client builder (`withBaseUrl`, `withHeaders`, `withRetry`, `withCache`, `withThrowOnError`, `withInterceptors`). Retry w/ backoff & predicate. Caching (GET only) keyed `method:url`. Upload progress via streaming wrapper. Responses wrapped: `{ raw, ok, status, text(), json(), html(), okOrThrow() }` plus `cancel()`.
- Motion: `installAnimationMethods()` augments `DOMCollection` with queued animations (`fadeIn/Out`, `slideUp/Down`, `pulse`, `shake`, toggle variants). Respects reduced‑motion → zero duration.
- Plugins: `use(plugin)` receives API function; may extend callable and `DOMCollection.prototype`; duplicates prevented (see `plugins.ts`).

### Coding Conventions
- No runtime deps; keep additions small, side‑effect free at import time (SSR safety). Guard DOM access with `hasDOM()`.
- Return new arrays/objects instead of mutating inputs. Never mutate user data objects passed in.
- Prefer explicit guards to optional chaining inside tight loops.
- For new collection methods: iterate `this.elements`, avoid intermediate arrays; add to class; ensure chainability.
- Keep method names terse & consistent (mirrors jQuery‑like ergonomics).

### Development Workflow
Commands: `npm run dev` (watch build), `npm run build` (dist ESM+CJS+d.ts), `npm test` (sanity/feature tests), `npm run docs:dev` (docs site), `npm run docs:build`.
Tests live in `tests/*.mjs`; import from `dist/` (trigger a build first if needed). Add focused tests for new public API points.

### Adding / Exposing Features
1. Implement in appropriate `src/*.ts` (follow existing module style; no new abstraction layers).
2. Export through `index.ts` (both on default API object and named export if part of documented surface).
3. Update `types.ts` if new types needed; preserve generics for `DOMCollection<T>`.
4. Add/extend README & `REFERENCE.md` if user‑facing.
5. Add tests (happy path + 1 edge). Build & run tests.
6. If templates/forms/http behavior changed, manually verify docs examples (rebuild docs).

### Template Engine Gotchas
- Conditional chains: only one branch active. Ensure `data-elseif` expressions are mutually exclusive; repeated predicate wastes work.
- Keyed loops: supply `by key` or `data-key` for stable DOM reuse; otherwise index‑based.
- Event handlers: `data-on-click="handler(arg, $event)"`; unrecognized functions fail silently (no throw in listener).

### HTTP Edge Cases
- JSON auto serialization skipped for FormData / Blob / (ArrayBuffer|TypedArray) / string.
- Retries apply to network errors, 5xx, 429 (default predicate). `withThrowOnError()` converts non‑ok into thrown `HttpError` (interceptors can recover).
- Cache only for GET when enabled; respects TTL; key customizable via `withCache({ key })`.

### Performance Notes
- Avoid allocating intermediate NodeLists repeatedly; collect once per method.
- For bulk DOM insertion (`append`, `prepend`), clones only until last target to preserve original nodes.
- Animations queue per element via a Promise chain to prevent overlap; cancel/stop clears queue.

### SSR Safety
- All DOM‑touching utilities guard with `hasDOM()`. On server: selectors return empty collections; motion methods resolve immediately; `create()` intentionally throws to surface misuse.

### Review Checklist (PR Gate)
- ES2020+ syntax
- Chainability preserved; mutators return `this`.
- Public exports updated & typed; docs/tests updated.
- No DOM access at import time (scan new code for top‑level `document`/`window`).
- Loops: no `forEach`; no optional chaining inside hot loops.

When unsure: copy patterns from the closest existing module (e.g. new binding in templates → follow structure in `compileNodeBindings`). Ask before changing semantics.
