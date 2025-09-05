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
- Classes & CSS: `addClass/removeClass/toggleClass/hasClass`, `css`, `cssVar/cssVars`, `computed`
- Visibility & layout: `show/hide/toggle/isVisible`, `width/height/inner*/outer*`, `offset/position/offsetParent`, `scrollTop/scrollLeft`, `rect`
- Events: `on/once/off/trigger`, shortcuts like `click`, `focus`, `blur`, `hover`, pointer/touch helpers
  - `.trigger(type[, init])` accepts `EventInit | CustomEventInit` and defaults to `{ bubbles: true }`; non‑object becomes `{ detail }`.
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
import { renderTemplate, useTemplate, tpl, escapeHTML, unsafeHTML } from "@dmitrijkiltau/dom.js/template";

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

// Safe HTML
escapeHTML("<b>x</b>");
unsafeHTML("<b>trusted</b>");
```

Bindings overview:
- `data-text`, `data-html`, `data-safe-html`, `data-attr-*`, `data-show`, `data-hide`
- `data-on-<type>="handler(args)"` (event is first arg implicitly)
- `data-each="items as item, i [by key]"` (keyed loops supported)
- `data-include="#tplId"` or renderer ref + optional `data-with`

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
- Raw HTML setters (`data-html`, `dom().html()`) only with trusted/sanitized content (or via `unsafeHTML()`)

## Contributing

PRs welcome. Keep modules single‑purpose, SSR‑safe, and side‑effect free at import time.

## License

MIT © Dmitrij Kiltau
