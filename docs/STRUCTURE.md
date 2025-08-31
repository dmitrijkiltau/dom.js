# Documentation Structure

## Overview

The documentation is organized into focused modules for maintainability and collaboration.

## File Structure

```
docs/
├── index.html              # Main HTML page
├── main.js                 # Application entry point
├── navigation.js           # Navigation handling
├── content.js              # Content rendering
├── version.js              # Version info
├── style.css               # Styles
├── vite.config.js          # Build config
├── package.json            # Dependencies
├── data/
│   ├── navigation.js       # Navigation data
│   └── sections.js         # Section content
└── sections/
    ├── core-api.js         # Core API examples
    ├── dom-manipulation.js # DOM manipulation examples
    ├── layout.js           # Layout & geometry examples
    ├── utilities.js        # Utilities examples
    ├── observers.js        # Intersection/Resize/Mutation examples
    ├── templates.js        # Template examples
    ├── forms.js            # Form examples
    ├── events.js           # Event examples
    ├── http.js             # HTTP examples
    ├── animation.js        # Animation examples
    └── plugins.js          # Plugin examples
```

## Module Responsibilities

### Core Files

- **`main.js`**: Application entry point, global setup, syntax highlighting
- **`navigation.js`**: Menu generation, scroll spy, keyboard navigation
- **`content.js`**: Section rendering, example coordination
- **`version.js`**: Version information display
- **`style.css`**: Responsive styling and themes

### Data Files

- **`data/navigation.js`**: Navigation menu configuration
- **`data/sections.js`**: Section content and HTML templates

### Section Files

Each `sections/*.js` file contains interactive examples:

- **`core-api.js`**: Selection, chaining, DOM manipulation
- **`templates.js`**: Data binding, conditional rendering
- **`forms.js`**: Form handling, serialization, validation
- **`events.js`**: Event delegation, custom events
- **`http.js`**: REST API calls, error handling
- **`animation.js`**: Web Animations API, keyframes
- **`plugins.js`**: Plugin system, custom extensions

### Configuration

- **`vite.config.js`**: Build configuration and optimization
- **`package.json`**: Dependencies and development scripts

### Single Source of Truth

- Use root-level scripts in the repo (`npm run docs:*`) to run, build, and preview the docs. The local `docs/package.json` scripts are secondary and should not be duplicated elsewhere.
- Section lists are driven by `docs/data/navigation.js`. Avoid repeating static lists in READMEs.

## Benefits

- **Maintainability**: Self-contained sections, easy updates
- **Collaboration**: Multiple developers can work simultaneously
- **Interactive Learning**: Live examples for immediate understanding
- **Developer Experience**: Hot reload, modern tooling
- **Performance**: Optimized build process

## Adding New Content

1. Add navigation item to `data/navigation.js`
2. Add section content to `data/sections.js`
3. Create section file in `sections/` with examples
4. Import and initialize in `content.js`
