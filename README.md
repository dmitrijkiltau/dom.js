# dom.js

A lightweight, modular DOM manipulation library with chainable API, zero dependencies, and modern ES modules.

[![npm version](https://badge.fury.io/js/@dmitrijkiltau%2Fdom.js.svg)](https://www.npmjs.com/package/@dmitrijkiltau/dom.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Lightweight** - Modular architecture, import only what you need
- ⛓️ **Chainable API** - Intuitive method chaining for DOM operations
- 📦 **Modern ES Modules** - Built for modern browsers (ES2020+)
- 🎯 **TypeScript Support** - Full TypeScript definitions included
- 🏗️ **Template System** - HTML templates with data binding
- 📝 **Form Utilities** - Easy form handling and serialization
- 🌐 **HTTP Utilities** - Fetch wrapper with baseUrl, query, interceptors, retries, errors, progress, caching
- 🎬 **Animation Support** - Web Animations API integration (awaitable, queued, reduced-motion aware)
- 🔧 **Plugin System** - Extend functionality with custom plugins
- 🆔 **Zero Dependencies** - No external dependencies
- 🧰 **Utilities & Observers** - Debounce/throttle, nextTick/raf, Intersection/Resize/Mutation observers, scrollIntoView helpers

## Installation

### npm

```bash
npm install @dmitrijkiltau/dom.js
```

### ES Module Import

```js
import dom from "@dmitrijkiltau/dom.js";

// Or import specific functions
import dom, { renderTemplate, onSubmit, http, debounce, onIntersect, scrollIntoView } from "@dmitrijkiltau/dom.js";
```

### CDN (ES Module)

```js
import dom from "https://unpkg.com/@dmitrijkiltau/dom.js/dist/index.js";
```

Pinned version (recommended for stability):

```js
import dom from "https://unpkg.com/@dmitrijkiltau/dom.js@1.5.1/dist/index.js";
```

### CommonJS (Node/CJS)

```js
// Full bundle
const dom = require("@dmitrijkiltau/dom.js");

// Modular subpath imports
const { http } = require("@dmitrijkiltau/dom.js/http");
const { renderTemplate } = require("@dmitrijkiltau/dom.js/template");
```

## Import Options

Choose the import style that best fits your needs:

### Full Bundle (Default)

Best for: Feature-rich applications, comprehensive DOM manipulation

```js
import dom from "@dmitrijkiltau/dom.js";

// Everything available (~10.6 KB gzip)
dom(".elements").fadeIn(300);
await dom.http.get("/api/data");
```

### Core Only

Best for: Basic DOM manipulation, size-critical applications

```js
import dom from "@dmitrijkiltau/dom.js/core";

// Core functionality only (~6.8 KB gzip)
dom(".elements").addClass("active").on("click", handler);
```

### Modular Imports

Best for: Maximum tree-shaking, library authors

```js
import dom from "@dmitrijkiltau/dom.js/core";
import { http } from "@dmitrijkiltau/dom.js/http";
import { renderTemplate } from "@dmitrijkiltau/dom.js/template";
import {
  serializeForm,
  toFormData,
  setForm,
  resetForm,
  validateForm,
  onSubmit,
} from "@dmitrijkiltau/dom.js/forms";
import { animate, animations } from "@dmitrijkiltau/dom.js/motion";
import { debounce, throttle, nextTick, raf, rafThrottle } from "@dmitrijkiltau/dom.js/utils";
import { onIntersect, onResize, onMutation } from "@dmitrijkiltau/dom.js/observers";
import { scrollIntoView, scrollIntoViewIfNeeded } from "@dmitrijkiltau/dom.js/scroll";

// Use only what you import
const response = await http.get("/api");
const element = renderTemplate("#template", data);
const data = serializeForm("#form");
const fd = toFormData(data);
const [keyframes, options] = animations.fadeIn(300);
animate(dom(".items").el(), keyframes, options);

// Utilities
const debounced = debounce(() => console.log('typed'), 150);
dom("input").on("input", debounced as any);
await nextTick();
await raf();

// Observers
const stop = onIntersect(".lazy", (entry, el) => {
  if (entry.isIntersecting) {
    // load as it appears
    stop();
  }
}, { threshold: 0.1 });

// Scroll helpers
scrollIntoView("#details", { behavior: 'smooth', block: 'start' });
dom("#item").scrollIntoViewIfNeeded({ behavior: 'smooth', block: 'center' });
```

**[📖 Complete Architecture Guide →](ARCHITECTURE.md)**

## Quick Start

```js
import dom from "@dmitrijkiltau/dom.js";

// Select elements and chain operations
dom(".my-elements")
  .addClass("active")
  .on("click", (ev, el) => {
    console.log("Clicked:", el);
  });
```

## Core API

The core of dom.js is the `dom()` function, which selects elements and returns a DOMCollection for chaining operations.

### Basic Selection

```js
// Select elements
dom(".items"); // by class
dom("#app"); // by id
dom("div"); // by tag
dom(element); // wrap existing element
dom([el1, el2]); // wrap multiple elements
dom(document); // wrap document
dom(window); // wrap window

// Optional context selection
dom(".child", rootElement); // search within a root element
dom(".item", dom("#list")); // context can be a DOMCollection

// Create from HTML strings
dom('<li class="entry">Hello</li>'); // parse HTML into elements
dom.fromHTML("<div><span>Hi</span></div>"); // explicit helper

// Chain operations
dom(".cards")
  .addClass("animate")
  .css("opacity", "0.8")
  .on("mouseenter", (ev, el) => dom(el).addClass("hover"));
```

### Element Creation

```js
// Create elements
const div = dom.create("div", { class: "container", id: "main" });
const button = dom.create("button", { type: "submit" }, "Click me");
const list = dom.create("ul", null, [
  dom.create("li", null, "Item 1"),
  dom.create("li", null, "Item 2"),
]);
```

### DOMCollection Methods

```js
// DOM manipulation
dom(".items").addClass("active");
dom(".items").removeClass("inactive");
dom(".items").replaceClass("old-class", "new-class"); // replace specific classes
dom(".items").toggleClass("visible");
dom(".items").toggleClass("foo bar"); // toggles multiple classes at once
dom(".items").hasClass("active"); // check if has class
// CSS helpers
dom(".items").css("color", "red");
dom(".items").css("margin", 12); // numbers default to px for unitful props
dom(".items").css({ paddingTop: 8, opacity: 0.9 }); // mixed object; unitless props stay unitless
dom(".items").cssVar("--accent", "#09f"); // set/get CSS custom properties
dom(".items").cssVar("radius", "8px"); // '--radius'
dom(".items").cssVars({ gap: "12px", brand: "#f60" }); // set multiple CSS variables
dom(".items").computed("color font-size"); // batch read computed styles -> { color: '...', 'font-size': '...' }
dom(".items").attr("data-id", "123");
dom(".items").attrs({ id: "main", class: "active" }); // bulk attributes
dom(".items").prop("checked", true); // properties vs attributes
dom(".items").val("new value"); // form element values
dom(".items").data("custom", "value"); // data attributes
dom(".items").html("<span>New content</span>");
dom(".items").text("New text");
dom(".items").append("<div>Child</div>");
// If inserting a Node/DOMCollection into multiple targets, nodes are cloned so each target gets a copy
dom(".items").append(dom.create("span", null, "X"));
dom(".items").prepend("<div>First</div>");
dom(".items").appendTo("#container"); // append to target (selector, Element, or DOMCollection)
dom(".items").prependTo("#container"); // prepend to target
dom(".items").after("<div>After</div>");
dom(".items").before("<div>Before</div>");
dom("<p>New</p>").insertAfter(".ref"); // insert current collection after target(s)
dom("<p>New</p>").insertBefore(".ref"); // insert current collection before target(s)
dom(".items").replaceWith("<p>Replaced</p>"); // replace element(s)
dom("<b>New</b>").replaceAll(".old"); // replace target(s) with current collection
dom(".items").wrap('<div class="wrap"></div>'); // wrap each element
dom(".items").wrap("#wrap-template"); // wrap using a selector (wrapper is cloned)
dom(".items").wrapAll(
  '<section class="box"><div class="inner"></div></section>'
); // wrap entire set with one wrapper
dom(".items").wrapAll("#wrapper-prototype"); // can use selector (cloned)
dom(".items").wrapInner('<span class="inner"></span>'); // wrap contents of each element
dom(".items").wrapInner("#inner-template"); // can use selector (cloned)
dom(".items").unwrap(); // remove direct parent wrapper
dom(".items").empty(); // remove all children
dom(".items").detach(); // remove without losing data/events
dom(".items").remove(); // remove elements
dom(".items").clone(); // clone elements

// Visibility
dom(".items").show(); // show elements
dom(".items").hide(); // hide elements
dom(".items").toggle(); // toggle visibility
dom(".items").toggle(true); // force show
dom(".items").toggle(false); // force hide
dom(".items").isVisible(); // true if first element is visible in layout

// Event handling (enhanced)
// Multi-type, options, namespacing, and unbind handle (top-level on)
const unbind = dom.on(window, "scroll resize.ns", handler, { passive: true });
unbind(); // remove both handlers

// DOMCollection binding (chainable) with multi-type + options
dom(".btn").on(
  "click focus",
  (e, el) => {
    /* ... */
  },
  { passive: true }
);
dom(".btn").once("click", (e, el) => {
  /* fires once */
});
dom(".btn").off("click"); // remove all click handlers
dom(".btn").off("click.ns"); // remove namespaced click handlers
dom(".btn").off(".ns"); // remove all handlers in namespace
dom(".btn").trigger("custom-event", { data: "value" }); // dispatch events

// Event shortcuts
dom(".btn").click(); // trigger click
dom(".btn").click(handler); // bind click handler
dom(".btn").focus(); // focus element
dom(".btn").blur(); // blur element
dom(".btn").hover(enterHandler, leaveHandler); // mouse enter/leave
// Pointer and touch shortcuts
dom(".drag").pointerdown(handler);
dom(".drag").pointermove(handler);
dom(".drag").pointerup(handler);
dom(".drag").touchstart(handler);
dom(".drag").touchmove(handler);
dom(".drag").touchend(handler);

// Event delegation + delegated off by selector
dom("#list").on("click", "a.item", (ev, el, idx) => {
  // el is the matched descendant (the anchor)
  // idx is the index of the bound element within the original collection (#list in this case)
});
// Remove delegated handlers by selector
dom("#list").off("click", "a.item");
// Or remove a specific delegated handler function
dom("#list").off("click", "a.item", handler);

// Traversal and filtering
dom(".items").filter(".active"); // filter by selector or function
dom(".items").find(".child"); // descendants
dom(".items").children(".child"); // immediate children (optionally filtered)
dom(".items").parent(); // immediate parents
dom(".items").parents(".container"); // all ancestors (optionally filtered)
dom(".items").siblings(".other"); // sibling elements
dom(".items").closest(".container"); // closest ancestor that matches
dom(".items").next(".row"); // next element sibling (optionally filtered)
dom(".items").prev(".row"); // previous element sibling (optionally filtered)
dom(".items").first(); // first element
dom(".items").last(); // last element
dom(".items").eq(0); // element at index
dom(".items").get(0); // get raw element at index
dom(".items").slice(1, -1); // sub-collection
dom(".items").map((el, i) => el.id); // map to array
dom(".items").index(); // index of first element among its siblings
dom(".items").is(".active"); // does any element match selector
dom(".items").not(".disabled"); // exclude matching elements
dom(".sections").has(".item"); // keep elements that contain a descendant
dom(".a").add(".b"); // union with selector/elements/collection

// Layout & geometry
// Sizes
dom("#panel").width(); // content width (excludes padding & border)
dom("#panel").height(); // content height (excludes padding & border)
dom("#panel").innerWidth(); // includes padding
dom("#panel").innerHeight(); // includes padding
dom("#panel").outerWidth(); // includes padding + border
dom("#panel").outerHeight(true); // includes padding + border + margin
// Set sizes (number = px)
dom("#panel").width(320).height("2rem");

// Positioning
dom("#el").offset(); // {top,left} relative to document
dom("#el").position(); // {top,left} relative to offsetParent
dom("#el").offsetParent(); // DOMCollection wrapping the offsetParent element

// Scroll
dom("#box").scrollTop(); // get scrollTop
dom("#box").scrollLeft(100); // set scrollLeft

// Rect wrapper
dom("#el").rect(); // getBoundingClientRect() snapshot as plain object

// Utilities
dom(".items").each((el, idx) => console.log(el));
dom(".items").el(); // get first element
dom(".items").el(1); // get element by index (convenience)
dom(".items").serialize(); // serialize form/controls (nested, FormData parity)
dom("form").toFormData(); // FormData from first form
dom("form").setForm({ name: "Alice" }); // populate first form
dom("form").reset(); // reset forms/controls in collection
```

## Templates

HTML template system with data binding, conditional chains, keyed loops, partials/includes, safe escaping, event arguments, and incremental updates.

### Basic Usage

```html
<template id="row">
  <li data-if="visible" data-show="active">
    <a data-text="title" data-attr-href="url" data-on-click="handleClick"></a>
    <span data-hide="editing" data-text="description"></span>
  </li>
</template>
```

```js
import { renderTemplate, useTemplate, tpl } from "@dmitrijkiltau/dom.js";

// Render with conditional logic
const data = {
  title: "Docs",
  url: "/docs",
  description: "Documentation page",
  visible: true,
  active: false,
  editing: true,
  handleClick: (e) => console.log("Clicked!", e),
};

// Render once
dom("#list").append(renderTemplate("#row", data));

// Create reusable render function
const renderRow = useTemplate("#row");
dom("#list").append(renderRow(data));

// Get template element
const template = tpl("#row"); // returns HTMLTemplateElement
```

### Template Binding Types

- `data-text="expr"`: Set textContent (safe by default)
- `data-html="expr"`: Set innerHTML (raw). Use `unsafeHTML()` or trusted strings only
- `data-safe-html="expr"`: Set escaped HTML from a string via `escapeHTML`
- `data-attr-*="expr"`: Set attribute value (removes attribute if null/false)
- `data-if="expr"` / `data-elseif="expr"` / `data-else`: Conditional chain among siblings
- `data-show="expr"` / `data-hide="expr"`: Toggle display style
- `data-on-<type>="handler(args...)"`: Bind event with optional args. Event is the first argument
- `data-each="list as item, i [by keyExpr]"`: Repeat element for items; optional keyed diff
- `data-include="#tplId"` or `data-include="ref"` + `data-with="expr"`: Include partial templates or renderers

### Loops with `data-each`

Repeat an element for each item in an array.

```html
<template id="users">
  <li data-each="users as user, i">
    <a data-text="user.name" data-attr-href="user.url"></a>
    <span>#<span data-text="$index"></span></span>
  </li>
  <!-- Note: You can place data-each on any element inside your template. -->
  <!-- When used on the root element of the template, renderTemplate returns a DocumentFragment. -->
  <!-- dom().append() handles both Elements and DocumentFragments. -->
  <!-- Access current item via the alias (default: `item`) and index via `$index` (or a custom alias). -->
  <!-- Syntax: data-each="items" | data-each="items as item" | data-each="items as item, idx" -->
</template>
```

```js
const data = {
  users: [
    { name: "Alice", url: "/u/alice" },
    { name: "Bob", url: "/u/bob" },
  ],
};

dom("#list").append(renderTemplate("#users", data));
```

- Parent scope inside loops: use `$parent` (or `..`) to reach the parent scope values.
- Keyed loops for stable updates: `data-each="users as user, i by user.id"` or add `data-key="user.id"` on the repeated element.

### If/ElseIf/Else Chains

Adjacent siblings can form a chain. Only one branch renders, in order:

```html
<template id="notice">
  <p class="info" data-if="type === 'info'">Info</p>
  <p class="warn" data-elseif="type === 'warn'">Warning</p>
  <p class="err" data-else>Error</p>
</template>
```

### Partials / Includes

Include another template or a custom renderer, with optional context via `data-with`:

```html
<div data-include="#user-card" data-with="user"></div>
```

Or refer to a renderer function in scope:

```js
const partials = { card: useTemplate("#user-card") };
renderTemplate("#host", { user, partials });
// <div data-include="partials.card" data-with="user"></div>
```

### Event Arguments

Pass arguments to handlers using a simple expression syntax. The event object is passed as the first parameter automatically.

```html
<button data-on-click="remove(user.id, $index)">Remove</button>
```

Supported argument values: string/number/boolean/null/undefined literals, scope paths (`user.id`), and special tokens `$index`, `$item`, `$parent`. (`$event` is implicit as the first param.)

### Safe Escaping

- `data-text` uses `textContent` (safe by default)
- `data-safe-html="expr"` escapes with `escapeHTML(expr)`
- `data-html` inserts raw HTML. For explicit unsafe content, return `{__html: '...'}` via `unsafeHTML('...')`:

```js
import { escapeHTML, unsafeHTML } from "@dmitrijkiltau/dom.js";

renderTemplate("#row", {
  title: "<script>x</script>", // safe with data-text
  safe: "<b>bold</b>", // use data-safe-html
  rich: unsafeHTML("<b>trusted</b>"), // use data-html
});
```

### Incremental Update

For dynamic UIs, mount templates with an update function instead of one-shot rendering:

```js
import { useTemplate, mountTemplate } from "@dmitrijkiltau/dom.js";

// Option A: from useTemplate
const renderUser = useTemplate("#user");
const instance = renderUser.mount({ user });
container.append(instance.el);
// Later
instance.update({ user: nextUser });

// Option B: direct mount
const ui = mountTemplate("#list", { items: [] });
container.append(ui.el);
ui.update({ items: [{ id: 1, name: "A" }] });
```

## Forms

Comprehensive form handling with serialization and submission utilities.

### Form Handling

```js
import {
  onSubmit,
  serializeForm,
  toQueryString,
  toFormData,
  setForm,
  resetForm,
  validateForm,
} from "@dmitrijkiltau/dom.js";

// Handle form submission
onSubmit("#contact", async (data, ev) => {
  console.log("Form data:", data);
  const response = await http.post("/api/contact", data);
});

// Serialize (supports nested names like user[name])
const data = serializeForm("#my-form"); // nested object
const fd = toFormData(data); // FormData
const queryString = toQueryString(data); // URL query

// Populate and reset
setForm("#my-form", { user: { name: "Alice" }, tags: ["js", "css"] });
resetForm("#my-form");

// Validate
const { valid, errors } = validateForm("#my-form");
if (!valid) console.warn(errors);
```

### Supported Form Elements

- Text inputs, textareas
- Select dropdowns (single and multiple)
- Checkboxes and radio buttons
- File inputs
- Arrays (elements with same name)
- Nested field names (user[name], address[street], items[])

## Events

Event handling with support for delegation and various target types.

```js
import dom, { on, once, off, ready } from "@dmitrijkiltau/dom.js";

// Event binding - target can be window, document, Element, or DOMCollection
// on() returns an unbind function
const stop = on(window, "scroll resize.ns", handler, { passive: true });
// Namespacing supported: use .ns in type string; multi-types allowed
stop(); // unbind all created handlers

// once() sugar for { once: true }
once(document, "DOMContentLoaded", handler);
once(document, "mousemove.ns", handler, { passive: true });

// Bind via selector or DOMCollection too
on(document, "click", handler);
on(dom(".items"), "mouseenter", handler);

// Event removal
off(window, "scroll");
off(window, "resize.ns"); // remove namespaced only

// DOM ready
ready(() => {
  dom("#app").addClass("ready");
});
```

## HTTP

Enhanced fetch wrapper with:
- baseUrl support, query helpers, and default headers
- pre/post interceptors and error hooks
- retries with exponential backoff
- automatic throw on non-ok responses (opt-in) and `okOrThrow()`
- upload progress hooks
- AbortController helpers for cancellation
- simple in-memory caching

```js
import { http } from "@dmitrijkiltau/dom.js";

// GET request
const response = await http.get("/api/users", { query: { page: 2 } });
const users = await response.okOrThrow().json();

// POST request
const result = await http.post("/api/items", { title: "New Item" });

// Other methods
await http.put("/api/items/1", data);
await http.patch("/api/items/1", partialData);
await http.delete("/api/items/1");

// Request helpers
const api = http
  .withBaseUrl("/api")
  .withHeaders({ Authorization: "Bearer token" })
  .withQuery({ locale: "en" })
  .withTimeout(5000)
  .withRetry({ retries: 2, retryDelay: 250, retryBackoff: 2 })
  .withThrowOnError();

const result = await api.post("/secure-data", payload);

// Query helper (append params to URL)
const url = http.appendQuery("/items", { q: "abc", tags: [1, 2] });
await http.get(url);

// Upload progress
await http.post("/upload", fileBlob, {
  onUploadProgress: ({ loaded, total, percent }) => {
    console.log(Math.round(percent || 0));
  },
});

// Abort/cancel
const { controller, signal } = http.abortable();
const p = http.get("/slow", { signal });
controller.abort(); // cancel when needed
```

### Response Object

```js
{
  raw,           // original Response object
  ok,            // response.ok
  status,        // response.status
  text(),        // response.text()
  json<T>(),     // response.json() with type support
  html(),        // parse response as HTML document
  okOrThrow(),   // throw HttpError on non-ok
  cancel(),      // abort via attached controller (if present)
}
```

### Interceptors

```js
const api = http.withInterceptors({
  onRequest: ({ method, url, init }) => {
    // mutate or return a new context
    return { method, url, init };
  },
  onResponse: ({ response }) => {
    // inspect/modify/replace response
  },
  onError: ({ error, attempt }) => {
    // return { response } to recover, or do nothing to continue retries/throws
  },
});
```

### Retries

```js
// Global
const api = http.withRetry({ retries: 3, retryDelay: 300, retryBackoff: 2 });
// Per request
await api.get("/unstable", { retries: 1 });
```

By default, retries occur on network errors, 5xx, and 429.

### Caching

```js
const api = http.withCache({ enabled: true, ttl: 60_000 }); // cache GET for 60s
await api.get("/items"); // served from cache within TTL
api.cache.clear(); // clear client cache
```

Per-request options: `{ noCache, cacheKey, cacheTtl }`.

### HTTP Quick Reference

Client builders (chainable):

| Helper | Description |
| --- | --- |
| `withBaseUrl(baseUrl)` | Applies a base URL to relative request URLs. Per-request override via `baseUrl`. |
| `withHeaders(headers)` | Sets default headers (merged with per-request `headers`). |
| `withQuery(params)` | Adds default query parameters. Per-request via `query`. |
| `withTimeout(ms)` | Aborts requests after `ms` milliseconds unless resolved/cancelled. |
| `withRetry({ retries, retryDelay, retryBackoff, retryOn })` | Configures global retry strategy. |
| `withInterceptors({ onRequest, onResponse, onError })` | Hooks into request/response/error lifecycle. |
| `withCache({ enabled, ttl, key })` | Enables in-memory caching for GET requests. |
| `withThrowOnError([on=true])` | Throws `HttpError` on non-ok responses. Also `response.okOrThrow()`. |

Per-request options (subset):

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `baseUrl` | `string` | client base | Override base URL for this request |
| `query` | `Record<string, any>` | `{}` | Query params to append to URL |
| `headers` | `HeadersInit` | merged | Extra headers for this request |
| `timeout` | `number` | client timeout | Abort after ms |
| `controller` | `AbortController` | auto | Explicit controller; also supports `signal` from RequestInit |
| `throwOnError` | `boolean` | client setting | Throw `HttpError` on non-ok |
| `onUploadProgress` | `(p) => void` | — | Upload progress for streamed bodies (Blob/string/ArrayBuffer) |
| `retries` | `number` | client setting | Additional retry attempts |
| `retryDelay` | `number` | 250 | Initial backoff delay in ms |
| `retryBackoff` | `number` | 2 | Exponential multiplier |
| `retryOn` | `(res, err, attempt) => boolean` | default (errors, 5xx, 429) | Custom retry decision |
| `cacheKey` | `string` | computed | Override cache key |
| `cacheTtl` | `number` | client ttl | TTL for this request (ms) |
| `noCache` | `boolean` | `false` | Skip cache read/store |

Interceptors:

| Hook | Signature | Purpose |
| --- | --- | --- |
| `onRequest` | `({ method, url, init }) => void | ctx | Promise` | Inspect/mutate request before fetch |
| `onResponse` | `({ method, url, init, response }) => void | ctx | Promise` | Inspect/replace response |
| `onError` | `({ method, url, init, error, attempt }) => void | {response} | Promise` | Handle errors; return `{response}` to recover |

Response wrapper:

| Member | Type | Description |
| --- | --- | --- |
| `raw` | `Response` | Native Response |
| `ok` | `boolean` | `response.ok` |
| `status` | `number` | Status code |
| `text()` | `() => Promise<string>` | Body as text |
| `json<T>()` | `() => Promise<T>` | Body as JSON |
| `html()` | `() => Promise<Document>` | Body parsed as HTML |
| `okOrThrow()` | `() => this` | Throw on non-ok, else return wrapper |
| `controller` | `AbortController | undefined` | Attached controller if created |
| `cancel()` | `() => void` | Abort via attached controller |

## Animation

Web Animations API integration with common presets and smooth animations.

```js
import { animate, animations } from "@dmitrijkiltau/dom.js";

// Built-in animation presets
await dom(".notice").fadeIn(300); // returns a Promise<DOMCollection>
await dom(".modal").slideUp(400); // queued per element
await dom(".button").pulse();
await dom(".error").shake();

// Available presets: fadeIn, fadeOut, fadeToggle, slideUp, slideDown, slideToggle, pulse, shake

// Custom animations
await dom(".notice").animate(
  [
    { opacity: 0, transform: "translateY(-20px)" },
    { opacity: 1, transform: "translateY(0)" },
  ],
  {
    duration: 300,
    easing: "ease-out",
  }
);

// Or use the function directly
const [keyframes, options] = animations.fadeIn(500);
const anim = animate(element, keyframes, options); // returns Animation
await anim.finished; // await the low-level Animation promise if you need
```

### Animation Queueing and Control

- Per-element calls are automatically queued in order. Multiple chained calls play sequentially.
- Collection methods now return a Promise that resolves to the collection when all animations finish (await-friendly).
- Control helpers on collections:
  - `pause()` / `resume()`: pause or resume active animations
  - `cancel()`: cancel active animations and clear the queue
  - `stop(jumpToEnd?)`: cancel or finish immediately (`true` to jump to end)

```js
// Queueing
await dom(".box").fadeIn(200).then($ => $.slideDown(200));
// Control
const $box = dom(".box");
$box.fadeIn(300);
$box.pause();
$box.resume();
$box.stop(true); // jump to end state
$box.cancel(); // cancel and clear queue
```

### Visibility Integration and Toggles

- `fadeIn`/`slideDown` ensure the element is shown before animating.
- `fadeOut`/`slideUp` hide the element (`display: none`) after finishing.
- `fadeToggle`/`slideToggle` switch between visible and hidden states.

```js
await dom(".panel").fadeToggle(200);
await dom(".panel").slideToggle(200);
```

### Reduced Motion

The animation helpers respect `prefers-reduced-motion: reduce` and reduce durations to zero (no motion), while still updating visibility. You can still use the low-level `animate()` directly if you need explicit control.
```

## Utilities & Observers

Handy utilities and DOM observer wrappers for ergonomic UI code.

```js
import dom, { debounce, throttle, nextTick, raf, rafThrottle, onIntersect, onResize, onMutation, scrollIntoView } from "@dmitrijkiltau/dom.js";

// Debounce/throttle
const onType = debounce((e) => console.log('typed'), 200);
const onScroll = throttle((e) => console.log('scroll'), 100);
dom(window).on('scroll', onScroll as any);
dom('input').on('input', onType as any);

// nextTick / raf scheduling
await nextTick(); // microtask queue
await raf();      // next animation frame
const draw = rafThrottle(() => {/* expensive layout work once per frame */});
dom(window).on('resize', draw as any);

// Observers
const stopIntersect = onIntersect('.watch', (entry, el) => {
  if (entry.isIntersecting) {
    el.classList.add('in-view');
    stopIntersect(); // unobserve all watched elements
  }
}, { threshold: 0.2 });

const stopResize = onResize('.box', (entry, el) => {
  const size = entry.contentRect;
  console.log('resized', el, size.width, size.height);
});

const stopMutation = onMutation('#list', (mutations, el) => {
  console.log('changed children of', el, mutations);
}, { childList: true, subtree: true });

// Scroll helpers
scrollIntoView('#details', { behavior: 'smooth', block: 'start' });
dom('#item').scrollIntoViewIfNeeded({ behavior: 'smooth', block: 'center' });
```

## Plugin System

Extend dom.js with custom functionality.

```js
import { use } from "@dmitrijkiltau/dom.js";

// Create a plugin
use((api) => {
  // Add method to dom object
  api.flash = function (selector) {
    return this(selector).animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 150,
    });
  };

  // Add method to DOMCollection prototype
  api.prototype.highlight = function () {
    return this.addClass("highlight");
  };
});

// Use the plugin
dom.flash(".message");
dom(".items").highlight();
```

## TypeScript Tips

- Use `dom(sel).el<HTMLButtonElement>()` for type-safe element access
- Event handler signature: `(ev: Event, el: Element, idx: number)`
- For delegated events, `idx` refers to the index of the element you bound the listener on (the collection item), not the matched child.
- You can wrap elements locally: `const $ = dom(el)`

Example:

```ts
dom(".buttons").on("click", (ev, el, idx) => {
  const button = el as HTMLButtonElement;
  const $ = dom(el); // wrap for chaining
  $.addClass("clicked");
});
```

## Browser Support & Size

- **Target**: ES2020+ (modern evergreen browsers)
- **Bundle Size (minified + gzip, ESM, v1.5.1)**:
  - Full bundle: ~10.6 KB
  - Core only: ~6.8 KB
  - Individual modules (each): HTTP ~0.7 KB, Forms ~1.7 KB, Template ~2.8 KB, Motion ~6.5 KB
- **Dependencies**: Zero

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Dmitrij Kiltau

## Security

- Prefer `data-text` and `data-safe-html` for untrusted data.
- `dom().html()` and template `data-html` insert raw HTML. Only use with trusted content or via `unsafeHTML()` when you’ve sanitized externally.
