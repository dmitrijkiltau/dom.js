# Copilot Instructions for `vanilla-kit`

## Project Overview
- **vanilla-kit** is a lightweight TypeScript/JavaScript utility library for DOM manipulation, templating, forms, events, HTTP, and animation, designed for modern browsers (ES2020+).
- The codebase is modular: each file in `src/` provides a focused set of utilities (e.g., `forms.ts`, `motion.ts`, `template.ts`).
- The main entry point is `src/index.ts`.

## Key Patterns & APIs
- **Templating:**
  - `useTemplate(ref)` returns a render function: `(data?) => Element`.
  - `tpl(ref)` returns an `HTMLTemplateElement`.
  - Example: `vk("#list").append(renderTemplate("#row", { title: "Docs", url: "/docs" }));`
- **Forms:**
  - `onSubmit(form, handler)` accepts selector, VKCollection, or HTMLFormElement.
  - `serializeForm(form)` returns a plain object; arrays are handled.
  - `toQueryString(obj)` serializes to URL query string.
- **Events:**
  - `on(target, type, handler)` and `off(...)` support window, document, Element, or VKCollection.
- **HTTP:**
  - `http.post(url, data)` returns `{ raw, ok, status, text(), json<T>(), html() }`.
- **Motion:**
  - `vk(sel).animate(keyframes, options)` for simple animations.
- **Plugin System:**
  - `use((api) => { ... })` to extend vk with custom methods.

## TypeScript Usage
- Use `vk(sel).el<T>()` for type-safe element access.
- Event handler signature: `(ev: Event, el: Element, idx: number)`.
- You can wrap elements locally: `const $ = vk(el)`.

## Conventions & Structure
- Keep modules focused; avoid monolithic files.
- Prefer composable, functional utilities over classes.
- Favor native DOM APIs and modern JS/TS idioms.
- All public APIs are exported from `src/index.ts`.
- Use clear, minimal naming (e.g., `vk`, `tpl`, `on`, `off`).

## Examples & References
- See `README.md` for usage examples and API documentation.
- Key files: `src/index.ts`, `src/template.ts`, `src/forms.ts`, `src/motion.ts`, `src/collection.ts`.

---

**If you are unsure about a pattern or workflow, check `README.md` or the relevant file in `src/`.**
