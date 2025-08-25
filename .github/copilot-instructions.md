# Copilot Instructions for `dom.js`

Concise operational knowledge for AI agents contributing to this repo. Focus on existing patterns—avoid inventing abstractions.

## 1. Architecture & Modules
- Library lives in `src/` (one concern per file):
	- `collection.ts` (core chainable wrapper `DOMCollection`)
	- `index.ts` (public API assembly + plugin system + HTTP wrapper)
	- `template.ts` (HTML `<template>` binding engine)
	- `forms.ts` (serialization & submit helper)
	- `motion.ts` (thin Web Animations wrapper)
	- `utils.ts`, `types.ts` (internal helpers & types)
- Build output: `dist/index.js` (ESM) + `dist/index.cjs` (CJS) + d.ts via `tsup`.
- Docs site (`docs/`) is a separate Vite app consuming the built library (never import raw `src/` in docs).

## 2. Public API Surface (exported from `index.ts`)
`dom`, `create`, `on`, `off`, `http` (with .get/.post/.put/.patch/.delete), templating (`renderTemplate`, `useTemplate`, `tpl`), forms (`serializeForm`, `toQueryString`, `onSubmit`), `animate`, `DOMCollection`, plus plugin extension via `use(plugin)`.

## 3. DOMCollection Patterns
- Always return `this` for chainable mutators.
- Iterate with plain `for` loops; avoid `forEach` (performance + style consistency).
- Methods work on an internal `elements: Element[]` array; creation wraps selectors, single elements, NodeLists, arrays, or window/document.
- Keep methods small; no hidden side-effects (e.g. no implicit DOM queries beyond the provided selector or `find()`.)

## 4. Templating Conventions (`template.ts`)
- Data binding attributes: `data-text`, `data-html`, `data-attr-*`.
- After binding, `data-attr-*` markers are removed (so dynamic id/class appear as real attributes only).
- Path resolution supports dotted keys (`user.name`). Missing values fallback to empty string.
- Add new binding types only if broadly useful; keep zero-dependency approach.

## 5. Forms (`forms.ts`)
- `serializeForm` collapses scalar fields; repeated names become arrays.
- `onSubmit` prevents default, serializes, passes `(data, event)` to handler, and awaits async handlers.
- Input resolution accepts selector | `DOMCollection` | `<form>` element; throw with clear messages if invalid.

## 6. HTTP Wrapper
- Simple `fetch` sugar producing an object: `{ raw, ok, status, text(), json<T>(), html() }`.
- JSON body auto-serialized when an object is passed to `post/put/patch`; `Content-Type: application/json` auto-added unless FormData / existing header.
- Leave advanced concerns (retries, abort, timeouts) to user-land unless repeatedly needed in docs.

## 7. Animation
- `animate(el, keyframes, options)` returns native `Animation` from `HTMLElement.animate`.
- `DOMCollection.prototype.animate` loops elements and returns the collection (fire-and-forget). Don’t introduce promise wrappers.

## 8. Plugin System (`use`)
- `use(plugin)` passes the exported `api` function (which is also callable as `dom`).
- Safe-guards: a `Set` prevents duplicate plugin application. Plugins can augment both the callable (`api.someFn = ...`) and `DOMCollection.prototype`.
- When adding new core methods ensure they’re also exposed on `api` (index export) if part of public surface.

## 9. Coding Style & Constraints
- Target ES2020; no polyfills or transpiler helpers beyond TypeScript output.
- Zero runtime dependencies; adding one requires strong justification.
- Prefer tiny, explicit helpers over “utility kitchen sinks”.
- Do not mutate user-provided objects; clone if transformation is required.
- Avoid optional chaining inside hot loops if simple guards suffice.

## 10. Build & Dev Workflows
- Install root deps: `npm install`.
- Build library: `npm run build` (produces minified ESM + CJS + sourcemaps + d.ts).
- Watch mode: `npm run dev`.
- Docs: run `npm run docs:install` once, then `npm run docs:dev` (served via Vite, imports from `dist/`).
- Tests: `npm test` runs `tests/sanity.mjs` (light contract checks). Add new tests adjacent in `tests/` (plain Node; no framework).

## 11. When Editing / Adding Features
- Update both TypeScript source and ensure new API is exported in `index.ts`.
- Preserve chainability (return `this`) for collection mutators; for getters return scalar/array.
- Add minimal test assertions to `sanity.mjs` or a new file if feature-specific.
- If templating change affects attributes, verify docs templates still render (IDs/classes applied and markers removed).

## 12. Common Edge Cases to Handle
- Empty selector → `dom()` returns empty collection (no throw).
- Missing `<template>` or empty template content → throw early with clear message.
- Form names repeating → ensure arrays not overwritten.
- HTTP helper with `undefined` body → don’t send `Content-Type`.
- Plugin re-registration → ensure idempotence via `_plugins` Set.

## 13. Performance Notes
- Favor single pass loops; gather NodeLists once.
- Avoid allocating interim arrays inside tight loops unless necessary.

## 14. Documentation Site Integration
- Docs consume built `dist/` bundle—rebuild (`npm run build`) to reflect API changes before verifying examples.
- Examples rely on template binding (IDs like `data-attr-id="id"` -> real `id`). Confirm after changes.

## 15. Adding New APIs (Checklist)
1. Implement in focused `src/*.ts` (or extend existing logically related file).
2. Export in `index.ts` (add to `api` object + named export list if public).
3. Add brief usage to `README.md` or docs section module.
4. Add sanity test (import from `dist/`, not `src/`).
5. Rebuild and verify docs manual examples still function.

## 16. Avoid
- Introducing dependencies, global side-effects, polyfills, or transpiler-specific constructs.
- Overengineering (no class hierarchies, no decorators, no proxy magic).
- Large utility aggregations—keep focused.

---

If uncertain: inspect the existing file that implements similar behavior (e.g., new collection method → see patterns in `collection.ts`). Ask for clarification if a change would alter public semantics.
