# dom.js Architecture Guide

## Overview

dom.js features a **modular architecture** that allows you to import only the functionality you need, resulting in optimized bundle sizes while maintaining full backward compatibility. The library offers flexible import patterns ranging from a full feature bundle (~10.6 KB gzip) down to individual modules (~0.7–6.8 KB gzip each).

## Architecture Principles

- **Single-concern modules**: Each module handles one specific area of functionality
- **Zero dependencies**: All modules maintain the zero-dependency philosophy
- **Tree-shakable**: Import only what you use for optimal bundle sizes
- **Backward compatible**: Existing code continues to work unchanged
- **Plugin system**: Extensible architecture for custom functionality

## Module Structure

### Core Modules

```
src/
├── index.ts          # Main entry point (full functionality)
├── core.ts           # Core DOM manipulation only (~6.8 KB gzip)
├── collection.ts     # DOMCollection class with all methods
├── http.ts           # HTTP utilities (~0.7 KB gzip)
├── template.ts       # Template system (~2.8 KB gzip)
├── forms.ts          # Form handling (~1.7 KB gzip)
├── motion.ts         # Animation utilities (~6.5 KB gzip)
├── plugins.ts        # Plugin system
├── utils.ts          # Shared utilities
└── types.ts          # TypeScript definitions
```

### Bundle Sizes (ESM, minified + gzip, v1.5.1)

| Module          | Size  | Description                      |
| --------------- | ----- | -------------------------------- |
| **Full Bundle** | ~10.6 KB | Complete functionality (default) |
| **Core Only**   | ~6.8 KB  | Basic DOM manipulation + events  |
| **HTTP**        | ~0.7 KB  | HTTP utilities only              |
| **Templates**   | ~2.8 KB  | Template system only             |
| **Forms**       | ~1.7 KB  | Form utilities only              |
| **Motion**      | ~6.5 KB  | Animation utilities only         |

_Note: Individual modules include shared dependencies. Actual sizes may vary based on bundler configuration._

## Import Patterns

### 1. Full Bundle (Default)

For maximum convenience and comprehensive DOM manipulation:

```js
// Everything included (~10.6 KB gzip)
import dom from "@dmitrijkiltau/dom.js";

dom(".elements").addClass("active").fadeIn(300).on("click", handler);

// All utilities available
const response = await dom.http.get("/api/data");
const element = dom.renderTemplate("#template", data);
```

### 2. Core Only

For basic DOM manipulation with minimal overhead:

```js
// Core functionality only (~6.8 KB gzip)
import dom from "@dmitrijkiltau/dom.js/core";

dom(".elements").addClass("active").css("color", "red").on("click", handler);

// HTTP, templates, animations not included
// dom.http           // ❌ Not available
// dom.renderTemplate // ❌ Not available
// .fadeIn()          // ❌ Not available
```

### 3. Modular Imports

Cherry-pick specific functionality:

```js
// Import only what you need
import dom from "@dmitrijkiltau/dom.js/core";
import { http } from "@dmitrijkiltau/dom.js/http";
import { renderTemplate } from "@dmitrijkiltau/dom.js/template";

// Use core DOM functionality
dom(".elements").addClass("active");

// Use HTTP separately
const response = await http.get("/api/data");

// Use templates separately
const element = renderTemplate("#template", data);
```

### 4. Mixed Approach

Combine approaches based on your needs:

```js
// Core + specific modules
import dom from "@dmitrijkiltau/dom.js/core";
import { animate, animations } from "@dmitrijkiltau/dom.js/motion";

// Add animation to core
dom.use(function (api) {
  api.animate = animate;
  api.animations = animations;

  // Add prototype methods
  api.DOMCollection.prototype.fadeIn = function (duration) {
    const [keyframes, options] = animations.fadeIn(duration);
    return this.animate(keyframes, options);
  };
});

// Now available
dom(".elements").fadeIn();
```

## Module Details

### Core (`@dmitrijkiltau/dom.js/core`)

**Essential DOM manipulation without extras**

```js
import dom from '@dmitrijkiltau/dom.js/core';

// Available:
dom(selector, context?)   // Element selection (with optional context)
dom('<div>…</div>')       // Create elements from HTML
dom.fromHTML(html)        // Explicit HTML-to-elements
dom.create(tag, attrs)    // Element creation
dom.on/once/off()         // Event handling (multi-type, namespaces, options; on() returns unbind)
dom.ready(fn)             // DOMContentLoaded shortcut
dom.DOMCollection         // Collection class
dom.use(plugin)           // Plugin system (automatically available)

// DOMCollection methods:
.each() .length .first() .last() .eq() .get() .get(index)
.find() .filter() .children() .parent() .parents() .siblings() .closest()
.next() .prev() .index()
.is() .not() .has() .add()
.slice() .map()
.text() .html() .append() .appendTo() .prepend() .prependTo()
.insertBefore() .insertAfter()
.addClass() .removeClass() .toggleClass() .hasClass()
.css() .cssVar() .cssVars() .computed() .attr() .removeAttr() .val() .prop() .attrs() .data()
.show() .hide() .toggle()
.isVisible()
.width() .height() .innerWidth() .innerHeight()
.outerWidth([includeMargin]) .outerHeight([includeMargin])
.offset() .position() .offsetParent()
.scrollTop([value]) .scrollLeft([value]) .rect()
.on() .off() .once() .trigger()
.click() .focus() .blur() .hover()
.pointerdown() .pointerup() .pointermove() .pointerenter() .pointerleave() .pointercancel()
.touchstart() .touchend() .touchmove() .touchcancel()
.remove() .detach() .empty() .clone() .after() .before() .serialize()
.wrap() .wrapAll() .wrapInner() .unwrap() .replaceWith() .replaceAll()

// Notes:
// - wrap/wrapAll/wrapInner accept HTML strings or selector strings (selectors are cloned)
// - .toggleClass() accepts space-separated multiple class names
// - .css() accepts numbers and appends 'px' for unitful properties (unitless properties like opacity/line-height remain unitless)
// - .cssVar(name[, value]) and .cssVars(map) get/set CSS custom properties (variables)
// - .computed('prop1 prop2') batch-reads computed style values into an object
```

### HTTP (`@dmitrijkiltau/dom.js/http`)

**Fetch-based HTTP utilities**

Features:
- Base URL + default query + default headers
- Interceptors (pre-request, post-response, error)
- Retries with backoff, configurable strategy
- Throw-on-error mode (`withThrowOnError` or `okOrThrow()`)
- Upload progress hooks (streamed body)
- Abort helpers
- Simple client-local caching for GET

```js
import { http } from '@dmitrijkiltau/dom.js/http';

// Methods
await http.get(url, init?);
await http.post(url, body?, init?);
await http.put(url, body?, init?);
await http.patch(url, body?, init?);
await http.delete(url, init?);

// Chainable helpers
const api = http
  .withBaseUrl('/api')
  .withHeaders({ Authorization: 'Bearer token' })
  .withQuery({ locale: 'en' })
  .withTimeout(5000)
  .withRetry({ retries: 2, retryDelay: 250, retryBackoff: 2 })
  .withThrowOnError()
  .withCache({ enabled: true, ttl: 60_000 })
  .withInterceptors({
    onRequest: ({ url, init }) => ({ method: 'GET', url, init }),
    onResponse: ({ response }) => ({ method: 'GET', url: response.url, init: {}, response }),
  });

// Per-request options (subset)
await api.get('/items', {
  query: { page: 2 },
  retries: 1,
  timeout: 3000,
  throwOnError: true,
  onUploadProgress: p => console.log(p.percent),
  cacheTtl: 10_000,
});

// Response wrapper
const r = await api.get('/users');
r.ok; r.status; await r.text(); await r.json(); await r.html();
await r.okOrThrow();

// Utilities
http.appendQuery('/path', { q: 'x' });
const { controller, signal } = http.abortable();
const p = http.get('/slow', { signal }); controller.abort();

// Cache controls
api.cache.clear();
api.cache.delete(api.cache.computeKey('GET', '/api/items', { } as any));
```

#### HTTP Quick Reference

Client builders:

| Helper | Purpose |
| --- | --- |
| `withBaseUrl(baseUrl)` | Default base URL for relative paths |
| `withHeaders(headers)` | Default headers (merged) |
| `withQuery(params)` | Default query params |
| `withTimeout(ms)` | Global request timeout |
| `withRetry({ retries, retryDelay, retryBackoff, retryOn })` | Retry strategy |
| `withInterceptors({ onRequest, onResponse, onError })` | Lifecycle hooks |
| `withCache({ enabled, ttl, key })` | In-memory GET cache |
| `withThrowOnError([on=true])` | Throw on non-ok responses |

Per-request options (partial): `baseUrl`, `query`, `headers`, `timeout`, `controller`/`signal`, `throwOnError`, `onUploadProgress`, `retries`, `retryDelay`, `retryBackoff`, `retryOn`, `cacheKey`, `cacheTtl`, `noCache`.

### Templates (`@dmitrijkiltau/dom.js/template`)

**HTML template binding system with incremental updates**

```js
import {
  renderTemplate,
  useTemplate,
  mountTemplate,
  tpl,
  escapeHTML,
  unsafeHTML,
} from "@dmitrijkiltau/dom.js/template";

// One-shot rendering
const element = renderTemplate("#template", data);

// Reusable renderer
const render = useTemplate("#template");

// Stateful instance with .update()
const instance = render.mount(data);
container.append(instance.el);
instance.update(nextData);

// Access template element
const templateEl = tpl("#template");

// Safe escaping helpers
escapeHTML("<b>X</b>");
unsafeHTML("<b>trusted</b>");

// Bindings supported:
// data-text="expr"                       - textContent (escaped by nature)
// data-html="expr"                       - innerHTML (raw, accepts unsafeHTML)
// data-safe-html="expr"                  - innerHTML from escaped string
// data-attr-id="expr"                    - attribute (removed if null/false)
// data-if / data-elseif / data-else      - sibling conditional chain
// data-show / data-hide                  - toggle with display style
// data-on-<type>="fn(args)"              - event binding with args; event is first arg
// data-each="list as item, i by key"     - loops with optional keyed diff
// data-include="#id" / "ref"             - partials/includes; optional data-with for context
```

### Forms (`@dmitrijkiltau/dom.js/forms`)

**Form handling utilities**

```js
import {
  serializeForm,
  toFormData,
  toQueryString,
  setForm,
  resetForm,
  validateForm,
  onSubmit,
} from "@dmitrijkiltau/dom.js/forms";

// Serialize form data (nested names → objects)
const data = serializeForm(form);
const fd = toFormData(data); // FormData with bracket encoding for nested/arrays
const query = toQueryString(data); // URL query string with bracket encoding

// Populate and reset
setForm(form, { user: { name: "Alice" }, tags: ["js", "css"] });
resetForm(form);

// Validate with the Constraint Validation API
const { valid, errors } = validateForm(form);
if (!valid) console.warn(errors);

// Handle form submission
onSubmit(form, (data, event) => {
  console.log("Form data:", data);
});
```

### Motion (`@dmitrijkiltau/dom.js/motion`)

**Web Animations API utilities (awaitable, queued, reduced-motion aware)**

```js
import { animate, animations, installAnimationMethods } from "@dmitrijkiltau/dom.js/motion";

// Low-level: returns Animation
const anim = animate(element, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
await anim.finished;

// Presets
const [kf1, op1] = animations.fadeIn(300);
const [kf2, op2] = animations.fadeOut(300);
const [kf3, op3] = animations.slideUp(300);
const [kf4, op4] = animations.slideDown(300);
const [kf5, op5] = animations.pulse(600);
const [kf6, op6] = animations.shake(500);

// Install collection helpers (if using core-only entry)
import dom from "@dmitrijkiltau/dom.js/core";
installAnimationMethods();

// Collection helpers return Promise<DOMCollection> and queue per element
await dom(".el").fadeIn(200);
await dom(".el").fadeToggle(200);
await dom(".el").slideUp(200);

// Control helpers
dom(".el").pause();
dom(".el").resume();
dom(".el").stop(true);  // jump to end state
dom(".el").cancel();    // cancel and clear queue

// Visibility integration
// - fadeIn/slideDown show before animating
// - fadeOut/slideUp hide after finishing
// - fadeToggle/slideToggle switch between states

// Reduced motion
// Respects prefers-reduced-motion; animations run with zero duration while preserving visibility effects
```

## Migration Guide

### From Full Bundle (No Changes)

Existing code continues to work unchanged:

```js
// This still works exactly the same
import dom from "@dmitrijkiltau/dom.js";
```

### To Core + Modules

Gradually adopt modular imports:

```js
// Before (full bundle)
import dom from "@dmitrijkiltau/dom.js";
const response = await dom.http.get("/api");

// After (modular)
import dom from "@dmitrijkiltau/dom.js/core";
import { http } from "@dmitrijkiltau/dom.js/http";
const response = await http.get("/api");
```

### To Pure Modular

Ultimate optimization:

```js
// Only import exactly what you use
import { DOMCollection, dom } from "@dmitrijkiltau/dom.js/core";
import { animate } from "@dmitrijkiltau/dom.js/motion";
import { renderTemplate } from "@dmitrijkiltau/dom.js/template";
```

## Bundle Size Analysis

### Usage Scenarios

**Scenario 1: Basic DOM Manipulation**

```js
import dom from "@dmitrijkiltau/dom.js/core"; // ~6.8 KB gzip
```

Perfect for: Simple websites, basic interactivity

**Scenario 2: DOM + HTTP**

```js
import dom from "@dmitrijkiltau/dom.js/core";
import { http } from "@dmitrijkiltau/dom.js/http"; // ~7.5 KB gzip (core + http)
```

Perfect for: SPAs with API calls, no complex animations

**Scenario 3: Full Featured (Default)**

```js
import dom from "@dmitrijkiltau/dom.js"; // ~10.6 KB gzip
```

Perfect for: Complex applications, feature-rich DOM manipulation

## Plugin System

The modular architecture maintains full plugin compatibility:

```js
import dom from "@dmitrijkiltau/dom.js/core";

// Custom plugin
const myPlugin = (api) => {
  api.customMethod = () => "Hello from plugin";

  api.DOMCollection.prototype.customChain = function () {
    console.log("Custom chaining method");
    return this;
  };
};

dom.use(myPlugin);

// Now available
dom.customMethod();
dom(".elements").customChain();
```

## Benefits

1. **Optimized Bundles**: Import only what you need, from ~6.8 KB (core) to ~10.6 KB (full)
2. **Better Tree Shaking**: Modern bundlers can eliminate unused code effectively
3. **Clean Architecture**: Separated concerns, better maintainability
4. **Backward Compatible**: Existing code works unchanged
5. **Flexible**: Mix and match based on project needs
6. **Future Proof**: Easy to add new modules without bloating core

## Best Practices

1. **Start with core** for new projects and add modules as needed
2. **Use full bundle** for feature-rich applications requiring comprehensive DOM manipulation
3. **Prefer modular imports** for library authors or size-critical applications
4. **Use plugins** to extend functionality across modules
5. **Check bundle analyzer** to verify optimal imports and tree shaking
6. **Consider HTTP + Core** for SPAs that need API integration but minimal DOM features
