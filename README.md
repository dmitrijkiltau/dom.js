# vanilla-kit

- `useTemplate(ref)` → `(data?) => Element`
- `tpl(ref)` → `HTMLTemplateElement`

Beispiel:

```html
<template id="row">
  <li>
    <a data-text="title" data-attr-href="url"></a>
  </li>
</template>
```

```ts
vk("#list").append(renderTemplate("#row", { title: "Docs", url: "/docs" }));
```

### Forms

- `onSubmit(form, handler)` – `form` kann **Selector**, **VKCollection** oder **HTMLFormElement** sein
- `serializeForm(form)` → Objekt mit Feldern (Arrays werden korrekt gesammelt)
- `toQueryString(obj)` → URL‑Query

```ts
onSubmit("#contact", async (data, ev) => {
  const qs = toQueryString(data);
  await http.post("/api/contact", data);
});
```

### Events (Top‑Level)

- `on(target, type, handler)` / `off(...)` – `target` kann `window`, `document`, ein Element oder `VKCollection` sein

### HTTP

```ts
const res = await http.post("/api/items", { title: "A" });
if (res.ok) {
  const json = await res.json<{ id: number }>();
}
```

Rückgabe: `{ raw, ok, status, text(), json<T>(), html() }`

### Motion

```ts
vk(".notice").animate([{ opacity: 0 }, { opacity: 1 }], {
  duration: 180,
  easing: "ease-out",
});
```

### Plugin‑System

```ts
import vk, { use } from "@dmitrijkiltau/vanilla-kit";
use((api) => {
  (api as any).flash = (sel: string) =>
    api(sel).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
});

(vk as any).flash("#msg");
```

---

## TypeScript Tipps

- `vk(sel).el<HTMLButtonElement>()` hilft beim Typsicher‑Greifen des ersten Elements
- Handler‑Signaturen: `(ev: Event, el: Element, idx: number)` – du kannst `el` lokal weiter‑wrapen: `const $ = vk(el)`

---

## Browser‑Support & Größe

- Ziel: **ES2020** (evergreen Browser)
- Bundlegröße: klein (wenige KB, abhängig vom Bundler und genutzten API‑Teilen)

---

## Roadmap

- `.serialize()` direkt auf `VKCollection`
- `once()` Event‑Sugar
- leichtes `morph()`/`swap()` für HTML‑Snippets

---

## Lizenz

MIT
