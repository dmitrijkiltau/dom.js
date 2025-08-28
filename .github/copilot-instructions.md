# Copilot Instructions for `dom.js`

Precise operational knowledge for AI agents contributing to this repository. Focus on existing patterns—avoid inventing abstractions.

## Quick Reference

**Core Files:**
- `src/index.ts` - Public API assembly and exports
- `src/core.ts` - Core DOM manipulation (minimal bundle)
- `src/collection.ts` - DOMCollection class with chainable methods
- `src/http.ts` - HTTP utilities
- `src/template.ts` - HTML template binding engine
- `src/forms.ts` - Form serialization and handling
- `src/motion.ts` - Web Animations API wrapper
- `src/plugins.ts` - Plugin system implementation
- `src/utils.ts` - Shared utilities
- `src/types.ts` - TypeScript definitions

**Build Commands:**
- `npm run build` - Generate dist bundles (ESM + CJS + d.ts)
- `npm run dev` - Watch mode for development
- `npm test` - Run sanity tests
- `npm run docs:dev` - Start documentation site

## 1. Architecture Overview

**Modular Design:** One concern per file in `src/`, zero dependencies, ES2020+ target.

**Build Output:** `dist/index.js` (ESM), `dist/index.cjs` (CJS), TypeScript definitions via tsup.

**Bundle Sizes:** Full (~13KB), Core (~7KB), Individual modules (2-7KB).

**Import Patterns:**
- Full: `import dom from '@dmitrijkiltau/dom.js'`
- Core: `import dom from '@dmitrijkiltau/dom.js/core'`
- Modular: `import { http } from '@dmitrijkiltau/dom.js/http'`

## 2. Public API Surface

**Exported from `index.ts`:**
- `dom` - Main selector function and API object
- `create` - Element creation utility
- `on`/`off` - Event binding utilities
- `http` - HTTP client with `.get/.post/.put/.patch/.delete`
- Template: `renderTemplate`, `useTemplate`, `tpl`
- Forms: `serializeForm`, `toQueryString`, `onSubmit`
- Animation: `animate`, `animations`
- `DOMCollection` - Chainable collection class
- `use` - Plugin registration function

## 3. DOMCollection Patterns

**Core Principles:**
- Return `this` from all mutator methods for chaining
- Use `for` loops, never `forEach` (performance)
- Internal `elements: Element[]` array
- Accept: selectors, elements, NodeLists, arrays, window, document

**Method Categories:**
- **Selection:** `find()`, `filter()`, `first()`, `last()`, `eq()`
- **Traversal:** `parent()`, `parents()`, `siblings()`
- **Manipulation:** `append()`, `prepend()`, `after()`, `before()`, `remove()`, `empty()`, `clone()`
- **Styling:** `addClass()`, `removeClass()`, `toggleClass()`, `hasClass()`, `css()`
- **Attributes:** `attr()`, `removeAttr()`, `attrs()`, `prop()`, `val()`, `data()`
- **Events:** `on()`, `off()`, `once()`, `trigger()`, shortcuts (`click()`, `focus()`, `blur()`, `hover()`)
- **Visibility:** `show()`, `hide()`, `toggle()`
- **Content:** `text()`, `html()`

## 4. Module-Specific Patterns

### HTTP (`http.ts`)
- Returns `{ raw, ok, status, text(), json<T>(), html() }`
- Auto-serializes JSON objects to `post/put/patch`
- Auto-adds `Content-Type: application/json` unless FormData/existing header
- Methods: `get()`, `post()`, `put()`, `patch()`, `delete()`
- Helpers: `withTimeout()`, `withHeaders()`

### Templates (`template.ts`)
- Bindings: `data-text`, `data-html`, `data-attr-*`, `data-if`, `data-show`, `data-hide`, `data-on-*`
- `data-attr-*` markers removed after binding (real attributes remain)
- Dotted paths: `user.name` (fallback to empty string)
- Functions: `renderTemplate()`, `useTemplate()`, `tpl()`

### Forms (`forms.ts`)
- `serializeForm()` - Collapses scalars, arrays for repeated names
- `onSubmit()` - Prevents default, serializes, passes `(data, event)`, awaits async handlers
- Accepts: selector, DOMCollection, or `<form>` element
- Throws descriptive errors for invalid inputs

### Motion (`motion.ts`)
- `animate(element, keyframes, options)` returns native `Animation`
- Collection method loops elements, returns collection (fire-and-forget)
- Built-in presets: `fadeIn`, `fadeOut`, `slideUp`, `slideDown`, `pulse`, `shake`

### Plugins (`plugins.ts`)
- `use(plugin)` passes API function (callable as `dom`)
- `_plugins` Set prevents duplicate registration
- Plugins can extend: callable API and `DOMCollection.prototype`

## 5. Coding Standards

**Language Target:** ES2020, no polyfills beyond TypeScript output.

**Dependencies:** Zero runtime dependencies. Justify any addition.

**Performance:**
- Single-pass loops, gather NodeLists once
- Avoid interim array allocation in hot loops
- Simple guards over optional chaining in loops

**Data Handling:**
- Never mutate user-provided objects (clone if needed)
- Return new objects/collections, not modified originals

**Error Handling:**
- Throw early with clear messages for invalid inputs
- Empty selector → empty collection (no error)
- Missing template → descriptive error

## 6. Development Workflow

**Setup:**
```bash
npm install                    # Root dependencies
npm run docs:install          # Docs dependencies (once)
```

**Development:**
```bash
npm run dev                   # Watch mode
npm run docs:dev             # Docs development server
npm test                      # Run sanity tests
```

**Building:**
```bash
npm run build                # Library bundles
npm run docs:build           # Documentation site
```

**Testing:** Add to `tests/sanity.mjs` or create feature-specific files. Import from `dist/`, not `src/`.

## 7. Adding Features

**Checklist:**
1. Implement in appropriate `src/*.ts` file
2. Export from `index.ts` (API object + named export if public)
3. Add TypeScript definitions to `types.ts`
4. Update public API surface documentation
5. Add sanity tests to `tests/`
6. Rebuild and verify docs examples work
7. Update README.md with usage examples

**For Collection Methods:**
- Return `this` for mutators, scalar/array for getters
- Follow existing naming patterns
- Add to `DOMCollection` class in `collection.ts`

**For New Modules:**
- Create focused `src/*.ts` file
- Export utilities from `index.ts`
- Consider tree-shaking impact
- Add to build configuration if needed

## 8. Code Review Guidelines

**Must Verify:**
- No new runtime dependencies
- ES2020 compatibility maintained
- Chainability preserved for collection methods
- Error messages are descriptive
- Tests added and passing
- Documentation examples work
- Bundle sizes not significantly increased

**Common Issues:**
- Missing return `this` in collection methods
- Using `forEach` instead of `for..of` loops
- Mutating user input objects
- Optional chaining in performance-critical code
- Missing TypeScript definitions

## 9. Documentation Integration

**Important:** Docs site imports from `dist/`, never `src/`.

**Template Examples:** Use `data-attr-id="id"` → becomes real `id` attribute.

**Verification:** After changes affecting templates, rebuild and test docs examples.

## 10. Preferred Patterns

**Always:**
- Maintain zero runtime dependencies
- Avoid global variables and side-effects
- Use flat structures over class hierarchies or decorators
- Stick to ES2020+ without polyfills or transpiler-specific code
- Keep utilities simple and focused
- Preserve existing API contracts
- Use `for..of` loops in collection methods
- Clone user-provided objects if mutation is needed; return new objects
- Use simple guards instead of optional chaining in hot loops

---

**When Uncertain:** Reference existing implementations in similar modules. For collection methods, check `collection.ts`. For HTTP features, check `http.ts`. Ask for clarification if semantics would change.
