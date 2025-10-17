# @dk/dom-js Documentation

Interactive documentation for @dk/dom-js built with:

- **TailwindCSS 4**: utility-first styling
- **Vite**: fast dev/build
- **@dk/dom-js**: the docs use the library itself
- **Prism.js**: code highlighting

## Features

- Live, interactive examples across all features
- Real-time code and demo toggles
- HTML templates with data binding
- Responsive layout and theme toggle
- Plugin system demonstrations

## Development

Run docs from the repository root (single source of truth):

```bash
npm run docs:install  # Install docs dependencies
npm run docs:dev      # Start docs dev server
npm run docs:build    # Build static docs
npm run docs:preview  # Preview the production build
```

Note: The docs also have local scripts in `docs/package.json`, but prefer the root-level scripts above to avoid duplication.

## Navigation & Sections

- Sections are defined in `docs/data/navigation.js` and rendered at runtime.
- Content scaffolding lives in `docs/data/sections.js`; interactive demos live in `docs/sections/`.
- See `docs/STRUCTURE.md` for module responsibilities and how to add new content.
