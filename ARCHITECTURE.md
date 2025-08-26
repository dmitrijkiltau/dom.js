# dom.js Architecture Guide

## Overview

dom.js now features a **modular architecture** that allows you to import only the functionality you need, resulting in smaller bundle sizes while maintaining full backward compatibility.

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
├── core.ts           # Core DOM manipulation only (~1.3KB)
├── collection.ts     # DOMCollection class
├── http.ts           # HTTP utilities
├── template.ts       # Template system
├── forms.ts          # Form handling
├── motion.ts         # Animation utilities
├── plugins.ts        # Plugin system
├── utils.ts          # Shared utilities
└── types.ts          # TypeScript definitions
```

### Bundle Sizes (ESM, minified)

| Module | Size | Description |
|--------|------|-------------|
| **Full Bundle** | ~1.8KB + chunks | Complete functionality (default) |
| **Core Only** | ~1.3KB + chunks | Basic DOM manipulation + events |
| **HTTP** | ~86B | HTTP utilities only |
| **Templates** | ~130B | Template system only |  
| **Forms** | ~161B | Form utilities only |
| **Motion** | ~168B | Animation utilities only |

*Note: Actual sizes include shared chunks for common dependencies*

## Import Patterns

### 1. Full Bundle (Default)
For maximum convenience and full jQuery replacement:

```js
// Everything included (~12KB total)
import dom from '@dmitrijkiltau/dom.js';

dom('.elements')
  .addClass('active')
  .fadeIn()
  .on('click', handler);

// All utilities available
const response = await dom.http.get('/api/data');
const element = dom.renderTemplate('#template', data);
```

### 2. Core Only  
For basic DOM manipulation with minimal overhead:

```js
// Core functionality only (~7KB total)
import dom from '@dmitrijkiltau/dom.js/core';

dom('.elements')
  .addClass('active')
  .css('color', 'red')
  .on('click', handler);

// HTTP, templates, animations not included
// dom.http          // ❌ Not available
// dom.renderTemplate // ❌ Not available  
// .fadeIn()         // ❌ Not available
```

### 3. Modular Imports
Cherry-pick specific functionality:

```js
// Import only what you need
import dom from '@dmitrijkiltau/dom.js/core';
import { http } from '@dmitrijkiltau/dom.js/http';
import { renderTemplate } from '@dmitrijkiltau/dom.js/template';

// Use core DOM functionality  
dom('.elements').addClass('active');

// Use HTTP separately
const response = await http.get('/api/data');

// Use templates separately
const element = renderTemplate('#template', data);
```

### 4. Mixed Approach
Combine approaches based on your needs:

```js
// Core + specific modules
import dom from '@dmitrijkiltau/dom.js/core';
import { animate, animations } from '@dmitrijkiltau/dom.js/motion';

// Add animation to core
dom.use(function(api) {
  api.animate = animate;
  api.animations = animations;
  
  // Add prototype methods
  api.DOMCollection.prototype.fadeIn = function(duration) {
    const [keyframes, options] = animations.fadeIn(duration);
    return this.animate(keyframes, options);
  };
});

// Now available
dom('.elements').fadeIn();
```

## Module Details

### Core (`@dmitrijkiltau/dom.js/core`)

**Essential DOM manipulation without extras**

```js
import dom from '@dmitrijkiltau/dom.js/core';

// Available:
dom(selector)              // Element selection
dom.create(tag, attrs)     // Element creation  
dom.on/once/off()         // Event handling
dom.DOMCollection         // Collection class
dom.use(plugin)           // Plugin system

// DOMCollection methods:
.each() .length .first() .last() .eq()
.find() .filter() .parent() .parents() .siblings()
.text() .html() .append() .appendTo() .prepend() .prependTo()
.addClass() .removeClass() .toggleClass() .hasClass()
.css() .attr() .removeAttr() .val() .prop() .attrs()
.on() .off() .once() .trigger() .click() .focus() .blur() .hover()
.remove() .empty() .clone() .after() .before() .serialize()
```

### HTTP (`@dmitrijkiltau/dom.js/http`)

**Fetch-based HTTP utilities**

```js
import { http } from '@dmitrijkiltau/dom.js/http';

// Methods
const response = await http.get(url, init?);
const response = await http.post(url, body?, init?);  
const response = await http.put(url, body?, init?);
const response = await http.patch(url, body?, init?);
const response = await http.delete(url, init?);

// Helpers
const timeoutHttp = http.withTimeout(5000);
const authedHttp = http.withHeaders({'Authorization': 'Bearer token'});

// Response object
response.raw      // Original Response
response.ok       // Boolean
response.status   // Number
response.text()   // Promise<string>
response.json()   // Promise<T>  
response.html()   // Promise<Document>
```

### Templates (`@dmitrijkiltau/dom.js/template`)

**HTML template binding system**

```js
import { renderTemplate, useTemplate, tpl } from '@dmitrijkiltau/dom.js/template';

// Usage
const element = renderTemplate('#template', data);
const render = useTemplate('#template');
const templateEl = tpl('#template');

// Bindings supported:
// data-text="key"           - Set text content
// data-html="key"           - Set HTML content  
// data-attr-id="key"        - Set attribute (removes marker)
// data-if="condition"       - Conditional rendering
// data-show="visible"       - Show/hide with display
// data-hide="hidden"        - Hide when truthy
// data-on-click="handler"   - Event binding
```

### Forms (`@dmitrijkiltau/dom.js/forms`) 

**Form handling utilities**

```js
import { serializeForm, toQueryString, onSubmit } from '@dmitrijkiltau/dom.js/forms';

// Serialize form data
const data = serializeForm(form);
const query = toQueryString(data);

// Handle form submission
onSubmit(form, (data, event) => {
  console.log('Form data:', data);
});
```

### Motion (`@dmitrijkiltau/dom.js/motion`)

**Web Animations API utilities**

```js
import { animate, animations } from '@dmitrijkiltau/dom.js/motion';

// Direct animation
animate(element, keyframes, options);

// Presets
const [keyframes, options] = animations.fadeIn(300);
const [keyframes, options] = animations.fadeOut(300);
const [keyframes, options] = animations.slideUp(300);
const [keyframes, options] = animations.slideDown(300);
const [keyframes, options] = animations.pulse(600);
const [keyframes, options] = animations.shake(500);

// Install on core (if desired)
import dom from '@dmitrijkiltau/dom.js/core';
import { installAnimationMethods } from '@dmitrijkiltau/dom.js/motion';

installAnimationMethods(); // Adds .animate(), .fadeIn(), etc. to collections
```

## Migration Guide

### From Full Bundle (No Changes)
Existing code continues to work unchanged:

```js
// This still works exactly the same
import dom from '@dmitrijkiltau/dom.js';
```

### To Core + Modules
Gradually adopt modular imports:

```js
// Before (full bundle)
import dom from '@dmitrijkiltau/dom.js';
const response = await dom.http.get('/api');

// After (modular)  
import dom from '@dmitrijkiltau/dom.js/core';
import { http } from '@dmitrijkiltau/dom.js/http';
const response = await http.get('/api');
```

### To Pure Modular
Ultimate optimization:

```js
// Only import exactly what you use
import { DOMCollection, dom } from '@dmitrijkiltau/dom.js/core';  
import { animate } from '@dmitrijkiltau/dom.js/motion';
import { renderTemplate } from '@dmitrijkiltau/dom.js/template';
```

## Bundle Size Analysis

### Usage Scenarios

**Scenario 1: Basic DOM Manipulation**
```js
import dom from '@dmitrijkiltau/dom.js/core'; // ~7KB total
```
Perfect for: Simple websites, basic interactivity

**Scenario 2: DOM + HTTP**  
```js
import dom from '@dmitrijkiltau/dom.js/core';
import { http } from '@dmitrijkiltau/dom.js/http'; // ~9KB total
```
Perfect for: SPAs with API calls, no complex animations

**Scenario 3: Full Featured (Default)**
```js
import dom from '@dmitrijkiltau/dom.js'; // ~12KB total  
```
Perfect for: Complex applications, jQuery replacement

## Plugin System

The modular architecture maintains full plugin compatibility:

```js
import dom from '@dmitrijkiltau/dom.js/core';

// Custom plugin
const myPlugin = (api) => {
  api.customMethod = () => 'Hello from plugin';
  
  api.DOMCollection.prototype.customChain = function() {
    console.log('Custom chaining method');
    return this;
  };
};

dom.use(myPlugin);

// Now available
dom.customMethod();
dom('.elements').customChain();
```

## Benefits

1. **Smaller Bundles**: Import only what you need
2. **Better Tree Shaking**: Modern bundlers can eliminate unused code
3. **Cleaner Architecture**: Separated concerns, better maintainability  
4. **Backward Compatible**: Existing code works unchanged
5. **Flexible**: Mix and match based on project needs
6. **Future Proof**: Easy to add new modules without bloating core

## Best Practices

1. **Start with core** for new projects and add modules as needed
2. **Use full bundle** for jQuery migrations or complex apps
3. **Prefer modular imports** for library authors or size-critical apps  
4. **Use plugins** to extend functionality across modules
5. **Check bundle analyzer** to verify optimal imports