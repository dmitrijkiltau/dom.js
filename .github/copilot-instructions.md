## dom.js – AI Contributor Guide (concise)

High‑signal notes so an AI can make safe, high‑value changes fast. Reflect current code; don’t invent abstractions.

### Architecture at a glance
- ES2020, zero‑dep TS library. Each concern in `src/*.ts`: core DOM/collection/events, `forms`, `http`, `template`, `motion`, `observers`, `scroll`, `plugins`, `utils`, `types`.
- Public surface assembled in `src/index.ts`. Docs/tests import from built `dist/` only (never from `src/`).
- `DOMCollection<T>` (`src/collection.ts`) is the chainable wrapper: mutators return `this`; getters return scalars/arrays/new collections. Use plain `for`/`for..of` in hot paths.

### Conventions that matter
- SSR‑safe: never touch `document/window` at import time; guard with `hasDOM()`. On server, selections return empty, motion resolves immediately, `create()` throws to surface misuse.
- Don’t mutate user data; return new arrays/objects. Avoid optional chaining in tight loops.
- New collection methods iterate `this.elements` without intermediate arrays; keep names terse (jQuery‑like).

### Dev workflow (verify before PR)
- Build: `npm run build` (ESM+CJS+d.ts via tsup). Watch: `npm run dev`. Bundle analysis: `npm run analyze`.
- Test: `npm test` (build + feature tests in `tests/*.mjs`), types: `npm run test:types` (TS in `tests/types`).
- Docs site: `npm run docs:dev` (in `docs/`), `docs:build/preview` as needed.

### Adding or exposing features
1) Implement in the closest `src/*.ts` module (no new layers). 2) Export via `src/index.ts` (default API and/or named). 3) If creating a new top‑level module (like `scroll`), also add the entry to:
	- build inputs in `package.json` `scripts.build` (tsup entry list), and
	- `package.json` `exports` map (ESM/CJS/types paths).
4) Update `types.ts` if needed; keep `DOMCollection<T>` generics intact. 5) Add focused tests + README/REFERENCE snippets when user‑visible.

### Cross‑cutting behaviors (examples)
- Selection/creation: `dom(selector|el|[els], [root])`, `dom.fromHTML('<li>x</li>')` (HTML detected by `<...>`), `dom.create('button', { type:'button' }, 'Click')`.
- Events (`src/events.ts`): types + namespaces (`'click.ns'`), multi‑types, delegation. `off(type.ns)` removes scoped handlers; `off('.ns')` removes all in that namespace. `.trigger(type[, init])` defaults `{ bubbles:true }`; non‑object becomes `{ detail }`.
- Templates (`src/template.ts`): `data-if/elseif/else`, `data-each="list as item, i [by key]"`, `data-include`, `data-text/html/safe-html`, `data-attr-*`, `data-on-*` with literals/`$event`/`$item`/`$index`. Compiled once; attributes removed post‑bind. Prefer `unsafeHTML()` only for trusted content.
- HTTP (`src/http.ts`): builder chain `.withBaseUrl/Headers/Retry/Cache/ThrowOnError/Interceptors`; GET‑only cache; retries on network/5xx/429 by default; responses expose `{ ok, status, json(), text(), html(), okOrThrow(), cancel() }`.
- Motion (`src/motion.ts`): queued animations (`fadeIn/Out`, `slideUp/Down`, etc.), reduced‑motion → 0 duration.

### Performance/SSR gotchas
- Avoid re‑collecting NodeLists in loops; collect once per method. For `append/prepend`, clone until the last target to preserve original nodes.
- Hydration relies on template anchor comments (`if/each/include :start/:end`) emitted by this engine.

### Quick review gate
- Chainability preserved; no top‑level DOM access; loops avoid `forEach` and optional chaining in hot paths.
- Public exports typed and wired; docs/tests updated; build + tests + type tests pass.

Refs: `ARCHITECTURE.md` (why/structure), `REFERENCE.md` (API), `README.md` (usage), `tests/*` (behavior), `package.json` (build/exports).
