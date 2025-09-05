# dom.js

A lightweight, modular DOM manipulation library with chainable API, zero dependencies, and modern ES modules.

[![npm version](https://badge.fury.io/js/@dmitrijkiltau%2Fdom.js.svg)](https://www.npmjs.com/package/@dmitrijkiltau/dom.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

- [dom.js](#domjs)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Install](#install)
  - [Quick Start](#quick-start)
  - [Import Options](#import-options)
  - [Core API Highlights](#core-api-highlights)
  - [Templates](#templates)
  - [Forms](#forms)
  - [Events](#events)
  - [HTTP](#http)
  - [Motion](#motion)
  - [Utilities \& Observers](#utilities--observers)
  - [SSR (Server‑Safe)](#ssr-serversafe)
  - [TypeScript](#typescript)
  - [Plugin System](#plugin-system)
  - [Browser Support \& Size](#browser-support--size)
  - [Security](#security)
  - [Contributing](#contributing)
  - [License](#license)

## Features

- 🚀 **Lightweight**: modular architecture, import only what you need
- ⛓️ **Chainable API**: intuitive method chaining for DOM ops
- 📦 **Modern ESM**: built for ES2020+ browsers
- 🎯 **TypeScript**: full type definitions and event typing
- 🏗️ **Templates**: HTML templates with data binding
- 📝 **Forms**: serialization, population, validation, submit helpers
- 🌐 **HTTP**: fetch wrapper with baseUrl, query, retries, interceptors, caching
- 🎬 **Motion**: Web Animations API helpers (awaitable, queued, reduced‑motion aware)
- 🔧 **Plugins**: extend functionality safely
- 🆔 **Zero Deps**: no external runtime dependencies

## Install

```bash
npm install @dmitrijkiltau/dom.js
```

ESM:

```js
import dom from "@dmitrijkiltau/dom.js";
```

CDN (pinned):

```js
import dom from "https://unpkg.com/@dmitrijkiltau/dom.js@1.6.2/dist/index.js";
```

CommonJS:

```js
const dom = require("@dmitrijkiltau/dom.js");
```

## Quick Start

```js
import dom from "@dmitrijkiltau/dom.js";

dom(".my-items")
  .addClass("active")
  .on("click", (ev, el) => console.log("Clicked", el));
```

## Import Options

Choose what you need:

```js
// 1) Full bundle (everything)
import dom from "@dmitrijkiltau/dom.js";

// 2) Core only (DOM + events)
import dom from "@dmitrijkiltau/dom.js/core";

// 3) Modular (cherry-pick)
import dom from "@dmitrijkiltau/dom.js/core";
import { http } from "@dmitrijkiltau/dom.js/http";
import { renderTemplate, useTemplate, tpl } from "@dmitrijkiltau/dom.js/template";
import { onSubmit, serializeForm, toFormData, toQueryString, setForm, resetForm, validateForm } from "@dmitrijkiltau/dom.js/forms";
import { animate, animations } from "@dmitrijkiltau/dom.js/motion";
import { debounce, throttle, nextTick, raf, rafThrottle } from "@dmitrijkiltau/dom.js/utils";
import { onIntersect, onResize, onMutation } from "@dmitrijkiltau/dom.js/observers";
import { scrollIntoView, scrollIntoViewIfNeeded } from "@dmitrijkiltau/dom.js/scroll";
```

## Core API Highlights

Selection & creation:

```js
dom(".items");          // selector
dom(element);            // wrap element
dom([el1, el2]);         // wrap list
dom(".child", root);     // scoped selection
dom('<li class="row">X</li>');
dom.fromHTML("<div>…</div>");
dom.create("button", { type: "button" }, "Click");
```

Common operations (chaining):

```js
dom(".items")
  .addClass("active")
  .css({ opacity: 0.9 })
  .on("mouseenter", (e, el) => dom(el).toggleClass("hover"))
  .append("<span>Hi</span>");
```

Highlights by category:
- Traversal: `find`, `children`, `parent`, `parents`, `siblings`, `closest`, `first`, `last`, `eq`, `get`, `slice`, `map`, `index`
- Content & attrs: `text`, `html`, `append`, `prepend`, `before`, `after`, `replaceWith`, `wrap*`, `empty`, `clone`, `attr/attrs`, `prop`, `val`, `data`
  - `.dataset(map)` to set multiple `data-*` attrs; `.aria(name[, value])` and `.aria(map)` helpers
- Classes & CSS: `addClass/removeClass/toggleClass/hasClass`, `css`, `cssVar/cssVars`, `computed`
- Visibility & layout: `show/hide/toggle/isVisible`, `width/height/inner*/outer*`, `offset/position/offsetParent`, `scrollTop/scrollLeft`, `rect`
- Events: `on/once/off/trigger`, shortcuts like `click`, `focus`, `blur`, `hover`, pointer/touch helpers
  - `.trigger(type[, init])` accepts `EventInit | CustomEventInit` and defaults to `{ bubbles: true }`; non‑object becomes `{ detail }`.
  - Delegation supported at collection and top‑level: `on(el|document|window, 'click', 'a.item', handler)`.
- Forms: `serialize`, `toFormData`, `setForm`, `reset`

## Templates

HTML templates with data binding, conditionals, loops, includes, safe escaping, event args, and incremental updates.

```html
<template id="row">
  <li data-if="visible" data-show="active">
    <a data-text="title" data-attr-href="url" data-on-click="handleClick"></a>
    <span data-hide="editing" data-text="description"></span>
  </li>
  <!-- data-elseif / data-else supported on sibling chain -->
</template>
``` 

```js
import { renderTemplate, useTemplate, tpl, escapeHTML, unsafeHTML, isUnsafeHTML } from "@dmitrijkiltau/dom.js/template";

const data = {
  title: "Docs",
  url: "/docs",
  description: "Demo",
  visible: true,
  active: false,
  editing: false,
  handleClick: (e) => console.log("Clicked!", e),
};

// One-shot
dom("#list").append(renderTemplate("#row", data));

// Reusable renderer + incremental update
const render = useTemplate("#row");
const instance = render.mount(data);
dom("#list").append(instance.el);
instance.update({ ...data, active: true });

// Safe HTML helpers
escapeHTML("<b>x</b>"); // escape to text
unsafeHTML("<b>trusted</b>"); // wrap as explicitly unsafe
isUnsafeHTML("<i>also trusted</i>"); // alias for readability
```

Bindings overview:
- `data-text`, `data-html`, `data-safe-html`, `data-attr-*`, `data-show`, `data-hide`
- `data-on-<type>="handler(args)"` (event is first arg implicitly)
- `data-each="items as item, i [by key]"` (keyed loops supported)
- `data-include="#tplId"` or renderer ref + optional `data-with`

Performance notes:
- `useTemplate(ref)` caches a compiled plan per `HTMLTemplateElement` so repeated renders/mounts skip re‑parsing.
- Structural directives (`data-if`/`elseif`/`else`, `data-each`, `data-include`) are precompiled; includes reuse cached plans.
- Event handler specs (`data-on-*`) are parsed once; arguments support literals, paths, and `$event`.

Diagnostics (dev):
- Enable dev logging for template binding errors and invalid expressions:
  `import { setTemplateDevMode } from '@dmitrijkiltau/dom.js/template'; setTemplateDevMode(true);`
- Logs include event handler exceptions, non-function handlers, include ref issues, and safe destroy/hydrate errors.

## Forms

```js
import { onSubmit, serializeForm, toQueryString, toFormData, setForm, resetForm, validateForm } from "@dmitrijkiltau/dom.js/forms";

onSubmit("#contact", async (data, ev) => {
  console.log("submit", data);
});

const data = serializeForm("#my-form");
const fd = toFormData(data);
const query = toQueryString(data);

setForm("#my-form", { user: { name: "Alice" }, tags: ["js", "css"] });
resetForm("#my-form");

const { valid, errors } = validateForm("#my-form");
```

## Events

Top‑level helpers work with `window`, `document`, Elements, and DOMCollections; collection methods are chainable.

```js
import dom, { on, once, off, ready } from "@dmitrijkiltau/dom.js";

const stop = on(window, "scroll resize.ns", handler, { passive: true });
stop(); // unbind

dom(".btn").on("click focus", (e, el) => {/* ... */}, { passive: true }).once("click", () => {/* ... */});
dom("#list").on("click", "a.item", (e, link, i) => {/* delegated */});
```

## HTTP

Fetch wrapper with baseUrl, default query/headers, retries, interceptors, cache, progress, and throw‑on‑error.

```js
import { http } from "@dmitrijkiltau/dom.js/http";

const api = http
  .withBaseUrl("/api")
  .withHeaders({ Authorization: "Bearer token" })
  .withRetry({ retries: 2 })
  .withThrowOnError();

const r = await api.get("/users", { query: { page: 1 } });
const users = await r.json();
```

## Motion

```js
import { animate, animations } from "@dmitrijkiltau/dom.js/motion";

const [kf, op] = animations.fadeIn(250);
await animate(dom(".box").el(), kf, op).finished;
```

## Utilities & Observers

```js
import { debounce, throttle, nextTick, raf, rafThrottle } from "@dmitrijkiltau/dom.js/utils";
import { onIntersect, onResize, onMutation } from "@dmitrijkiltau/dom.js/observers";
import { scrollIntoView, scrollIntoViewIfNeeded } from "@dmitrijkiltau/dom.js/scroll";

const onType = debounce(() => {/* ... */}, 150);
await nextTick(); await raf();

const stop1 = onIntersect(".watch", (entry, el) => {/* ... */}, { threshold: 0.1 });
scrollIntoView("#details", { behavior: "smooth", block: "start" });
```

## SSR (Server‑Safe)

```js
import dom from "@dmitrijkiltau/dom.js/server";

dom(".x");              // -> empty collection on server
dom.on(window, "x");    // -> no-op unbinder on server
dom.ready(() => {});     // -> runs immediately on server

await dom.http.get("/api");
await dom.nextTick();
await dom.raf(); // setTimeout fallback
```

Environment safeguards: no `window`/`document` access at import time; `ready()` runs immediately; RAF helpers fallback; scroll/motion early‑return without DOM; `fromHTML()` returns empty collection; `create()` throws on server to surface misuse.

### Hydration (client)

If your HTML was rendered using dom.js templates (so it contains the `if/each/include` anchor comments), you can hydrate the existing DOM instead of re‑creating it. This wires event listeners and bindings while preserving the server‑rendered markup.

```html
<template id="user">
  <div id="root">
    <button data-on-click="onClick($event)"><span data-text="count"></span></button>
    <ul>
      <li data-if="showA">A</li>
      <li data-else>B</li>
    </ul>
    <ol>
      <li data-each="items as item, i">
        <span data-text="item"></span>#<em data-text="i"></em>
      </li>
    </ol>
  </div>
  <!-- When rendered by dom.js, if/each/include are wrapped with comment anchors like `if:start`/`if:end`. -->
  <!-- Those anchors enable fast, reliable hydration. -->
  <!-- On the server, pre-render using the same template so anchors are present in the HTML. -->
</template>
```

```js
import { hydrateTemplate } from '@dmitrijkiltau/dom.js/template';

const root = document.querySelector('#root');
const state = { count: 1, onClick: () => console.log('clicked'), showA: true, items: ['A','B'] };

const inst = hydrateTemplate('#user', root, state);
inst.update({ count: 2, showA: false, items: ['C','D','E'] });
// later
inst.destroy();
```

Notes:
- Hydration expects anchor comments (`if:start/end`, `each:start/end`, `include:start/end`) present in the HTML between the right nodes. These are inserted when the same template is used to render.
- Dynamic `data-include` may instantiate on first update if it can’t match a static include.
- Event handlers from `data-on-*` are wired during hydration; `update()` refreshes bound values without replacing nodes.

## TypeScript

```ts
const $btn = dom<HTMLButtonElement>("#save");
$btn.on("click", (e, btn) => (btn.disabled = true));

// Delegated with typing
dom('#list').on('click', 'a.item', (e, link) => link.focus());
```

- `DOMCollection<T>` preserves element type through chains
- Event names map to DOM event types (top‑level and collection)
- Module augmentation supported for plugins

## Plugin System

```js
import dom, { use } from "@dmitrijkiltau/dom.js";

use((api) => {
  api.flash = (selector) => api(selector).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
  api.DOMCollection.prototype.highlight = function () { return this.addClass("highlight"); };
});

await dom.flash(".message");
dom(".items").highlight();
```

## Browser Support & Size

- Target: ES2020+ (modern evergreen browsers)
- Bundle Size (min+gzip, ESM, v1.6.x):
  - Full bundle: ~10–11 KB
  - Core only: ~6–7 KB
  - Modules (each): HTTP ~0.7 KB, Forms ~1.7 KB, Templates ~2.8 KB, Motion ~6.5 KB
- Dependencies: Zero

## Links

- Reference: `REFERENCE.md` (full API/exports overview)
- Architecture: `ARCHITECTURE.md`
- Docs (local): `docs/README.md` (run `npm run docs:dev`)

## Security

- Prefer `data-text` and `data-safe-html` for untrusted data
- Raw HTML setters (`data-html`, `dom().html()`) only with trusted/sanitized content.
  To make intent explicit, use one of:
  - `data-html="unsafe(expr)"` in templates
  - `data-html="pathReturningWrapper"` where code uses `unsafeHTML(x)` / `isUnsafeHTML(x)`

## Contributing

PRs welcome. Keep modules single‑purpose, SSR‑safe, and side‑effect free at import time.

## License

MIT © Dmitrij Kiltau
