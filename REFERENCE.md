# dom.js Reference

This reference provides a compact, scan-friendly overview of dom.js: entries, modules, and API surfaces. It complements README.md (getting started) and ARCHITECTURE.md (design and DX).

## Package Entries

| Import                                  | Includes                                             | Import‑safe on server | Approx size (min+gzip) | Typical use |
| --------------------------------------- | ---------------------------------------------------- | --------------------- | ---------------------- | ----------- |
| `@dmitrijkiltau/dom.js`                 | Full bundle: core, templates, forms, http, motion…   | Yes (DOM used at call)| ~10–11 KB              | Easiest start |
| `@dmitrijkiltau/dom.js/core`            | Core DOM selection, traversal, events, utils bridge  | Yes                   | ~6–7 KB                | Minimal DOM toolkit |
| `@dmitrijkiltau/dom.js/http`            | HTTP client                                          | Yes                   | ~0.7 KB                | API calls only |
| `@dmitrijkiltau/dom.js/template`        | Template engine (render/use/mount, escape helpers)   | Yes                   | ~2.8 KB                | HTML templates |
| `@dmitrijkiltau/dom.js/forms`           | Form serialize/populate/reset/validate/submit        | Yes                   | ~1.7 KB                | Forms utilities |
| `@dmitrijkiltau/dom.js/motion`          | Animations and composition helpers                   | Yes                   | ~6.5 KB                | Web Animations |
| `@dmitrijkiltau/dom.js/utils`           | debounce/throttle/nextTick/raf(/rafThrottle)         | Yes                   | tiny                   | Scheduling & rate‑limit |
| `@dmitrijkiltau/dom.js/observers`       | onIntersect/onResize/onMutation wrappers             | Yes                   | tiny                   | Observers |
| `@dmitrijkiltau/dom.js/scroll`          | scrollIntoView + scroll lock                         | Yes                   | tiny                   | Scrolling |
| `@dmitrijkiltau/dom.js/server`          | Server‑safe entry (no real DOM ops)                  | Yes                   | —                      | SSR/Node import |

Note: “Import‑safe on server” means modules do not access `window`/`document` at import time. DOM‑touching functions still require a browser.

## Modules & Key Exports

| Module                        | Key exports |
| ---------------------------- | ----------- |
| `core`                       | `default` (callable `dom()`), `dom`, `fromHTML`, `create`, `on`, `once`, `off`, `ready`, `DOMCollection`, `use` |
| `template`                   | `renderTemplate`, `useTemplate`, `mountTemplate`, `hydrateTemplate`, `tpl`, `setTemplateDevMode`, `escapeHTML`, `unsafeHTML` |
| `forms`                      | `serializeForm`, `toFormData`, `toQueryString`, `setForm`, `resetForm`, `validateForm`, `onSubmit`, `isValid` |
| `http`                       | `http`, `appendQuery` |
| `motion`                     | `animate`, `animations`, `sequence`, `stagger` |
| `utils`                      | `debounce`, `throttle`, `nextTick`, `raf`, `rafThrottle` (plus helpers like `toArray`, `isString`) |
| `observers`                  | `onIntersect`, `onResize`, `onMutation` |
| `scroll`                     | `scrollIntoView`, `scrollIntoViewIfNeeded`, `lockScroll`, `unlockScroll` |
| `server`                     | `default` (SSR‑safe `dom()` + `http` + utils; DOM ops are guarded) |

## Top‑Level `dom()` Object (full bundle and core)

- Call `dom(selector, [context])` → `DOMCollection`
- Utilities: `dom.fromHTML(html)`, `dom.create(tag, attrs?, children?)`
- Events: `dom.on/once/off(target, types[, selector], handler, options)`, `dom.ready(fn)`
  - Supports direct and delegated forms for `Element`, `Document`, and `Window`
  - Multiple event types and namespaces (e.g. `"click resize.ns"`) supported
  - Namespace-only unbind supported: pass just the namespace token (e.g. `off(target, '.ns')`)
- Plugins: `dom.use(plugin)`
- Class: `dom.DOMCollection`

## DOMCollection Methods (by category)

Selection & traversal:
- `.each(fn)`, `.length`, `.el(i?)`, `.first()`, `.last()`, `.eq(i)`
- `.find(selector)`, `.filter(selector|fn)`, `.children(selector?)`, `.parent()`, `.parents(selector?)`, `.siblings(selector?)`, `.closest(selector)`
- `.next(selector?)`, `.prev(selector?)`, `.index()`
- Set ops: `.is(target|fn)`, `.not(target|fn)`, `.has(target)`, `.add(target)`
- List ops: `.slice(a,b)`, `.map(fn)`, `.get(i?)`

Content & structure:
- `.text([value])`, `.html([value|Node|DOMCollection|fn])`
  - `fn: (el, i) => string|number|null|Node|DOMCollection` applied per element
- `.append(node|string|DOMCollection)`, `.prepend(node|string|DOMCollection)`
- `.appendTo(target)`, `.prependTo(target)`
- `.insertBefore(target)`, `.insertAfter(target)`
- `.after(content)`, `.before(content)`
- `.replaceWith(content)`, `.replaceAll(target)`
- `.wrap(html|selector)`, `.wrapAll(html|selector)`, `.wrapInner(html|selector)`, `.unwrap()`
- `.remove()`, `.empty()`, `.clone([deep=true])`

Attributes, properties, values:
- `.attr(name[, value])`, `.attrs(map)`
- `.prop(name[, value])`, `.val([value])`, `.data(name[, value])`
- `.dataset([map])` → get all dataset of first element or set multiple `data-*` attrs
- `.aria(name[, value])` or `.aria(map)` → convenience for `aria-*` attributes

Classes & styles:
- `.addClass(...names)`, `.removeClass(...names)`, `.toggleClass(names[, force])`, `.toggleClass(map)`, `.hasClass(name)`, `.replaceClass(oldClasses, newClasses)`
- `.css(name[, value])` or `.css(map)`
- `.cssVar(name[, value])`, `.cssVars(map)`
- `.computed(names: "prop1 prop2" | string[])` → `{ name: value }`

Visibility & layout:
- `.show([display=''])`, `.hide()`, `.toggle([force])`, `.isVisible()`
- Sizes: `.width([value])`, `.height([value])`, `.innerWidth()`, `.innerHeight()`, `.outerWidth([includeMargin])`, `.outerHeight([includeMargin])`
- Position: `.offset()`, `.position()`, `.offsetParent()`
- Scroll: `.scrollTop([value])`, `.scrollLeft([value])`
- Rect: `.rect()` (getBoundingClientRect snapshot)

Events (collection):
- `.on(types[, selector], handler, [options])`, `.once(...)`, `.off([types[, selector[, handler]]])`, `.trigger(type[, init])`
  - `init` accepts `EventInit | CustomEventInit | any` (non‑object becomes `{ detail }`)
  - Defaults to `{ bubbles: true }` if unspecified
  - Also accepts a ready `Event`/`CustomEvent` instance: `.trigger(event)`; the event is dispatched as‑is
  - Namespacing: `click.ns` or `click.ns1.ns2`; remove by type+ns (`.off('click.ns')`) or namespace‑only (`.off('.ns')`)
  - Multiple types: space‑separated (e.g. `'.on("mouseenter mouseleave", ... )'`); removal works per‑type
  - Delegated off: `.off(types, selector[, handler])` removes only matching delegated handlers for `selector`
  - AbortController: pass `{ signal }` via options to auto‑unbind on `abort`

Iteration helpers:
- `.each(fn)` → iterate elements
- `.beforeEach(fn)`, `.afterEach(fn)` → aliases to `.each(fn)` for chain readability
- Shortcuts: `.click([handler])`, `.focus()`, `.blur()`, `.hover(enter, leave)`
- Pointer/touch: `.pointerdown/move/up/enter/leave/cancel()`, `.touchstart/move/end/cancel()`

Forms (collection helpers):
- `.serialize()` → nested object (names like `user[name]`, `tags[]` supported)
- `.toFormData()`, `.setForm(values)`, `.reset()`

## Templates (template module)

Functions:
- `tpl(ref)`, `renderTemplate(ref, data)`, `useTemplate(ref)` → `(data) => Node` with `.mount(data)`
- `mountTemplate(ref, data)` → `{ el, update(data), destroy() }`
- `hydrateTemplate(ref, root, data)` → binds to server-rendered `root` without re-creating DOM; returns `{ el, update, destroy }`
- Diagnostics: `setTemplateDevMode(true|false)` → log binding errors/invalid expressions in development
- Safety: `escapeHTML(str)`, `unsafeHTML(str)`, `isUnsafeHTML(str)` (alias)

Bindings (overview):
- `data-text`, `data-html`, `data-safe-html`
- `data-attr-*`, `data-on-*`
- `data-show`, `data-hide`
- `data-class-<name>`: toggle class on truthy
- `data-style-<prop>`: set/remove inline style
- `data-on-<type>="handler(args)"` (event passed as first arg implicitly)
- Loops: `data-each="items as item, i [by key]"` (supports keyed diff; also `data-key`)
- Includes: `data-include="#tplId"` or renderer ref, optional `data-with` for context
- Conditionals: `data-if` / `data-elseif` / `data-else` sibling chains

Performance:
- Per‑template compile caching: `useTemplate(ref)` caches a compiled plan per `HTMLTemplateElement` (also used by `renderTemplate`).
- Structural plans: `if/elseif/else`, `each`, and `include` are precompiled and instantiated quickly.
- Includes consult the same cache for nested templates; event handler specs are parsed once.

## Forms (forms module)

- `serializeForm<T = Record<string, any>>(form)` → nested object
- `toFormData(obj)`, `toQueryString(obj)`
- `setForm(form, values)`, `resetForm(form)`, `validateForm(form)`, `isValid(form)`
- `onSubmit<T = Record<string, any>>(form, (data: T, event) => Promise|void)`

## HTTP (http module)

Requests:
- `http.get/post/put/patch/delete(url, [init])` → wrapped response (`{ ok, status, text(), json<T>(), blob(), arrayBuffer(), formData(), html(), okOrThrow(), cancel() }`)
  - Examples:
    - `const img = await http.get('/img').then(r => r.okOrThrow().blob())`
    - `const buf = await http.get('/bin').then(r => r.arrayBuffer())`
    - `const fd = await http.post('/upload').then(r => r.formData())`

Client builders (chainable):
- `withBaseUrl(baseUrl)`, `withHeaders(headers)`, `withQuery(params)`, `withTimeout(ms)`, `withJSON()`
- `withRetry({ retries, retryDelay, retryBackoff, retryOn })`, `withInterceptors({ onRequest, onResponse, onError })`
- `withCache({ enabled, ttl, key, methods })`, `withThrowOnError([true])`

Per‑request options (subset): `baseUrl`, `query`, `headers`, `timeout`, `controller`/`signal`, `throwOnError`, `onUploadProgress`, `onDownloadProgress`, `retries`, `retryDelay`, `retryBackoff`, `retryOn`, `cacheKey`, `cacheTtl`, `noCache`.

Utilities:
- `http.appendQuery(url, params)`, `http.abortable()` → `{ controller, signal }`
- Cache: `http.cache.clear/delete/get/set/computeKey`

Notes:
- Smart JSON: when `body` is a plain object, the client serializes it with `JSON.stringify` and sets `Content-Type: application/json` unless you already set a `Content-Type` header. Use `withJSON()` to also send `Accept: application/json` by default.
- Caching guardrails: caches only `GET` by default. To cache other methods, pass `withCache({ enabled: true, methods: ['GET', 'POST'] })`. When caching non‑GET requests, the default cache key becomes `method:url:body=<hash>` where `<hash>` is a stable digest of the request body.

## Motion (motion module)

- Low‑level: `animate(el, keyframes, options)` → `Animation`
- Presets: `animations.fadeIn/fadeOut/slideUp/slideDown/pulse/shake(duration?)`
- Sequences: `sequence(steps)` → returns runner `(el, idx) => Promise<void>`; `steps` can be `[keyframes, options]`, function `(el, idx) => [keyframes, options]`, or a `number` delay in ms.
- Stagger: `stagger(stepMs, fn)` → returns runner for collections/arrays; runs `fn(el, idx)` per element with `idx * stepMs` delay, integrated with per‑element queue. `fn` may return an `Animation` or a `Promise`.
- Collection helpers (.fadeIn/.fadeOut/.fadeToggle/.slideUp/.slideDown/.slideToggle/.pulse/.shake/.sequence/.stagger) are available on `DOMCollection` in the full bundle; they are queued per‑element and return `Promise<DOMCollection>`
- Visibility wrapper: `withVisible([display])` returns animation helpers that make elements visible (set `display`) before animating — ensures correct state when reduced‑motion collapses durations to 0.

## Utilities & Observers & Scroll

- Utils: `debounce(fn, wait, opts?)`, `throttle(fn, wait, opts?)`, `nextTick(cb?)`, `raf(cb?)`, `rafThrottle(fn)`
- Observers: `onIntersect(targets, cb, opts?)`, `inView(targets, { threshold, once, ... }?)`, `onResize(targets, cb, opts?)`, `onMutation(targets, cb, opts?)`
- Scroll: `scrollIntoView(target, opts)`, `scrollIntoViewIfNeeded(target, opts)` (also available on collections); `lockScroll(el?)`, `unlockScroll(el?)`

## Typing & Plugins

- Generics: `dom<T>(selector)` → `DOMCollection<T>` for typed chains
- Events: names map to DOM event types (top‑level and collection)
- Custom events typing: augment `interface CustomEventMap {}` in `@dmitrijkiltau/dom.js` to map names → detail payloads. Overloads enable:
  - `dom.on(window|document|element, 'my:event', (e) => e.detail …)`
  - `dom('#btn').on<'my:event'>('my:event', (e) => e.detail …)`
- Typed serialization:
  - `DOMCollection.prototype.serialize<T = Record<string, any>>(): T`
  - `serializeForm<T = Record<string, any>>(form): T` (forms module)
  - `onSubmit<T = Record<string, any>>(form, (data: T, ev) => …)` (forms module)
- Augmentation: `declare module '@dmitrijkiltau/dom.js' { interface Dom { … } }` then `dom.use(api => { /* add methods */ })`
Notes:
- For explicit raw HTML intent, templates may use `data-html="unsafe(expr)"`.
- Alternatively, return a wrapper from data using `unsafeHTML(x)` / `isUnsafeHTML(x)` and bind with `data-html="path"`.
