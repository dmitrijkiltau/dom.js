# dom-ssg: Static Site Generator Integration

dom-ssg is a Static Site Generator (SSG) integration for dom.js that pre-renders HTML templates and optimizes JavaScript bundles by including only the features actually needed for interactivity.

## Overview

Traditional SPAs load all JavaScript upfront, even for static content. dom-ssg solves this by:

1. **Pre-rendering templates** server-side using the same dom.js template system
2. **Analyzing JavaScript usage** to determine minimal required features  
3. **Creating optimized bundles** with only the DOM manipulation needed for interactivity
4. **Generating static HTML** with minimal client-side JavaScript

## Benefits

- **Smaller bundles**: 46% smaller JavaScript (7KB vs 13KB for documentation site)
- **Better performance**: Faster initial page loads with pre-rendered HTML
- **SEO-friendly**: Content is available immediately without JavaScript
- **Same developer experience**: Uses existing dom.js templates and APIs

## Build Process

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Templates +     │───▶│ Server-side     │───▶│ Static HTML +   │
│ Data            │    │ Rendering       │    │ Optimized JS    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

1. **Template Rendering**: Execute dom.js templates in Node.js/JSDOM
2. **Usage Analysis**: Analyze what JavaScript features are actually needed
3. **Bundle Optimization**: Include only required dom.js modules
4. **Static Generation**: Output pre-rendered HTML with minimal JS

## Usage

### Basic Build

```bash
# Build the library first
npm run build

# Run SSG build
npm run docs:ssg
```

### Preview SSG Output

```bash
# Build and serve with Python
npm run docs:ssg-preview

# Or manually serve the dist-ssg directory
cd docs/dist-ssg
python -m http.server 8080
```

## Configuration

The SSG system is configured via the `DomSSG` class options:

```javascript
import { DomSSG } from './scripts/ssg.mjs';

const ssg = new DomSSG({
  srcDir: 'docs',           // Source directory
  distDir: 'docs/dist-ssg', // Output directory  
  analyzer: true,           // Enable usage analysis
  optimize: true            // Enable bundle optimization
});

await ssg.build();
```

## Bundle Optimization

dom-ssg analyzes your code to determine the minimal dom.js features needed:

### Optimization Levels

1. **Full Bundle** (13KB) - All features included
   ```javascript
   import dom from '@dmitrijkiltau/dom.js';
   ```

2. **Core Only** (7KB) - Basic DOM manipulation for interactivity
   ```javascript
   import dom from '@dmitrijkiltau/dom.js/core';
   ```

3. **Modular** (varies) - Mix of specific modules
   ```javascript
   import dom from '@dmitrijkiltau/dom.js/core';
   import { http } from '@dmitrijkiltau/dom.js/http';
   ```

### Feature Detection

The analyzer detects usage patterns to include only necessary modules:

- **Core**: Always included for DOM manipulation
- **Template**: Excluded (pre-rendered server-side)
- **HTTP**: Only if `http.get()`, `http.post()` etc. found in JavaScript
- **Forms**: Only if `serializeForm()`, `onSubmit()` found in JavaScript  
- **Motion**: Only if `.animate()`, `.fadeIn()` etc. found in JavaScript

## Architecture

### Scripts

- `scripts/ssg.mjs` - Main SSG build orchestrator
- `scripts/ssg-renderer.mjs` - Server-side template renderer
- `scripts/analyze-usage.mjs` - JavaScript usage analyzer

### Renderer (`ssg-renderer.mjs`)

Executes dom.js templates server-side using JSDOM:

1. Creates virtual DOM environment
2. Loads dom.js library  
3. Renders templates with data
4. Binds data to template attributes
5. Outputs rendered HTML

### Analyzer (`analyze-usage.mjs`)

Analyzes JavaScript to determine required features:

1. Scans JavaScript code in `<script>` tags
2. Looks for dom.js method calls and imports
3. Excludes documentation text/examples
4. Returns minimal required modules

## Template System Integration

dom-ssg leverages the existing dom.js template system:

### Data Binding Attributes

Templates use standard dom.js binding:
- `data-text="fieldName"` - Text content
- `data-html="fieldName"` - HTML content  
- `data-attr-id="fieldName"` - Dynamic attributes

### Server-side Rendering

Templates are rendered server-side with the same data binding logic:

```javascript
// This template:
<section data-attr-id="id">
  <h2 data-text="title"></h2>
  <div data-html="content"></div>
</section>

// With data:
{ id: 'getting-started', title: 'Getting Started', content: '<p>...</p>' }

// Becomes:
<section id="getting-started">
  <h2>Getting Started</h2>
  <div><p>...</p></div>
</section>
```

## Build Output

SSG generates several files in the output directory:

- `index.html` - Pre-rendered HTML with optimized JavaScript
- `bundle-info.json` - Bundle optimization details  
- `optimized.js` - The optimized JavaScript (for debugging)
- `assets/` - Copied static assets (CSS, etc.)

### Bundle Info

The `bundle-info.json` contains optimization details:

```json
{
  "fullSize": 13,
  "optimizedSize": 7,
  "savings": 6, 
  "percentSavings": 46,
  "modules": ["core"],
  "import": "import dom from '@dmitrijkiltau/dom.js/core';"
}
```

## Integration Examples

### Documentation Sites

Perfect for documentation that needs:
- Pre-rendered content for SEO
- Minimal JavaScript for navigation/search
- Fast initial page loads

### Marketing Sites

Ideal for marketing pages with:
- Static content pre-rendered
- Interactive elements (forms, animations)
- Optimized performance

### Component Libraries

Great for component showcases with:
- Pre-rendered examples
- Interactive demos
- Minimal bundle overhead

## Future Enhancements

- **Selective hydration**: Hydrate only interactive components
- **Route-based splitting**: Different bundles per page
- **Build-time feature flags**: Compile-time feature elimination  
- **Plugin ecosystem**: Custom SSG plugins

## Migration

To migrate existing dom.js applications to SSG:

1. Ensure templates use data binding attributes
2. Move dynamic data to separate files  
3. Replace client-side rendering with SSG build
4. Test interactive features still work with optimized bundle

The dom-ssg integration maintains full compatibility with existing dom.js code while providing significant performance improvements through pre-rendering and bundle optimization.