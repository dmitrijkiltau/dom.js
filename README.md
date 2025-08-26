# dom.js

A tiny, intuitive, chainable DOM utility for modern browsers (like jQuery, but ESM and no $).

[![npm version](https://badge.fury.io/js/@dmitrijkiltau%2Fdom.js.svg)](https://www.npmjs.com/package/@dmitrijkiltau/dom.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Lightweight** - Modular architecture, import only what you need
- ⛓️ **Chainable API** - Familiar jQuery-like syntax
- 📦 **Modern ES Modules** - Built for modern browsers (ES2020+)
- 🎯 **TypeScript Support** - Full TypeScript definitions included
- 🏗️ **Template System** - HTML templates with data binding
- 📝 **Form Utilities** - Easy form handling and serialization
- 🌐 **HTTP Utilities** - Simple fetch wrapper with response helpers
- 🎬 **Animation Support** - Web Animations API integration
- 🔧 **Plugin System** - Extend functionality with custom plugins
- 🆔 **Zero Dependencies** - No external dependencies

## Modular Architecture

dom.js features a **modular architecture** for optimal bundle sizes:

```js
// Full bundle (~13KB) - Everything included
import dom from '@dmitrijkiltau/dom.js';

// Core only (~7KB) - Basic DOM manipulation + events  
import dom from '@dmitrijkiltau/dom.js/core';

// Individual modules - Maximum tree-shaking
import { http } from '@dmitrijkiltau/dom.js/http';
import { renderTemplate } from '@dmitrijkiltau/dom.js/template';
```

**[📖 Complete Architecture Guide →](ARCHITECTURE.md)**

## Installation

### npm

```bash
npm install @dmitrijkiltau/dom.js
```

### ES Module Import

```js
import dom from '@dmitrijkiltau/dom.js';

// Or import specific functions
import dom, { renderTemplate, onSubmit, http } from '@dmitrijkiltau/dom.js';
```

### CDN (ES Module)

```js
import dom from 'https://unpkg.com/@dmitrijkiltau/dom.js/dist/index.js';
```

## Import Options

Choose the import style that best fits your needs:

### Full Bundle (Default)
Best for: jQuery replacement, complex applications
```js
import dom from '@dmitrijkiltau/dom.js';

// Everything available (~13KB total)
dom('.elements').fadeIn();
await dom.http.get('/api/data');
```

### Core Only
Best for: Basic DOM manipulation, size-critical applications
```js
import dom from '@dmitrijkiltau/dom.js/core';

// Core functionality only (~7KB total)
dom('.elements')
  .addClass('active')
  .on('click', handler);
```

### Modular Imports  
Best for: Maximum tree-shaking, library authors
```js
import dom from '@dmitrijkiltau/dom.js/core';
import { http } from '@dmitrijkiltau/dom.js/http';
import { renderTemplate } from '@dmitrijkiltau/dom.js/template';

// Use only what you import
const response = await http.get('/api');
const element = renderTemplate('#template', data);
```

## Quick Start

```js
import dom from '@dmitrijkiltau/dom.js';

// Select elements and chain operations
dom('.my-elements')
  .addClass('active')
  .on('click', (ev, el) => {
    console.log('Clicked:', el);
  });
```

## Core API

The core of dom.js is the `dom()` function, which selects elements and returns a DOMCollection for chaining operations.

### Basic Selection

```js
// Select elements
dom('.items')              // by class
dom('#app')                // by id
dom('div')                 // by tag
dom(element)               // wrap existing element
dom([el1, el2])           // wrap multiple elements

// Chain operations
dom('.cards')
  .addClass('animate')
  .css('opacity', '0.8')
  .on('mouseenter', (ev, el) => dom(el).addClass('hover'));
```

### DOMCollection Methods

```js
// DOM manipulation
dom('.items').addClass('active')
dom('.items').removeClass('inactive')
dom('.items').replaceClass('new-class') // replace all classes
dom('.items').toggleClass('visible')
dom('.items').css('color', 'red')
dom('.items').attr('data-id', '123')
dom('.items').attrs({id: 'main', class: 'active'}) // bulk attributes
dom('.items').prop('checked', true) // properties vs attributes
dom('.items').val('new value') // form element values
dom('.items').html('<span>New content</span>')
dom('.items').text('New text')
dom('.items').append('<div>Child</div>')
dom('.items').after('<div>After</div>')
dom('.items').before('<div>Before</div>')
dom('.items').empty() // remove all children
dom('.items').remove() // remove elements
dom('.items').clone() // clone elements

// Event handling
dom('.btn').on('click', handler)
dom('.btn').once('click', handler) // one-time event
dom('.btn').off('click', handler)
dom('.btn').trigger('custom-event', {data: 'value'}) // dispatch events

// Event shortcuts
dom('.btn').click() // trigger click
dom('.btn').click(handler) // bind click handler
dom('.btn').focus() // focus element
dom('.btn').hover(enterHandler, leaveHandler) // mouse enter/leave

// Traversal and filtering
dom('.items').filter('.active') // filter by selector or function
dom('.items').find('.child') // descendants
dom('.items').parent() // immediate parents
dom('.items').parents('.container') // all ancestors (optionally filtered)
dom('.items').siblings('.other') // sibling elements
dom('.items').first() // first element
dom('.items').last() // last element
dom('.items').eq(0) // element at index

// Utilities
dom('.items').each((el, idx) => console.log(el))
dom('.items').el() // get first element
dom('.items').serialize() // serialize form data (works on forms or form fields)
```

## Templates

HTML template system with data binding and conditional rendering using `data-*` attributes.

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
import { renderTemplate, useTemplate, tpl } from '@dmitrijkiltau/dom.js';

// Render with conditional logic
const data = {
  title: 'Docs',
  url: '/docs',
  description: 'Documentation page',
  visible: true,
  active: false,
  editing: true,
  handleClick: (e) => console.log('Clicked!', e)
};

// Render once
dom('#list').append(renderTemplate('#row', data));

// Create reusable render function
const renderRow = useTemplate('#row');
dom('#list').append(renderRow(data));

// Get template element
const template = tpl('#row'); // returns HTMLTemplateElement
```

### Template Binding Types

- `data-text="key"` - Sets element text content
- `data-html="key"` - Sets element innerHTML
- `data-attr-*="key"` - Sets any attribute (e.g., `data-attr-id="userId"`)
- `data-if="key"` - Shows element only if value is truthy (removes if falsy)
- `data-show="key"` - Shows/hides element with display style
- `data-hide="key"` - Hides element when value is truthy
- `data-on-*="key"` - Binds event handlers (e.g., `data-on-click="handleClick"`)

## Forms

Comprehensive form handling with serialization and submission utilities.

### Form Handling

```js
import { onSubmit, serializeForm, toQueryString } from '@dmitrijkiltau/dom.js';

// Handle form submission
onSubmit('#contact', async (data, ev) => {
  console.log('Form data:', data);
  const response = await http.post('/api/contact', data);
});

// Serialize form manually
const formData = serializeForm('#my-form'); // returns plain object
const queryString = toQueryString(formData); // converts to URL query string
```

### Supported Form Elements

- Text inputs, textareas
- Select dropdowns (single and multiple)
- Checkboxes and radio buttons
- File inputs
- Arrays (elements with same name)

## Events

Event handling with support for delegation and various target types.

```js
import { on, once, off } from '@dmitrijkiltau/dom.js';

// Event binding - target can be window, document, Element, or DOMCollection
on(window, 'scroll', handler);
once(document, 'DOMContentLoaded', handler); // one-time event
on(document, 'click', handler);
on('.buttons', 'click', handler);
on(dom('.items'), 'mouseenter', handler);

// Event removal
off(window, 'scroll', handler);
```

## HTTP

Simple fetch wrapper with response helpers, automatic JSON handling, and request utilities.

```js
import { http } from '@dmitrijkiltau/dom.js';

// GET request
const response = await http.get('/api/users');
if (response.ok) {
  const users = await response.json();
}

// POST request
const result = await http.post('/api/items', { title: 'New Item' });

// Other methods
await http.put('/api/items/1', data);
await http.patch('/api/items/1', partialData);
await http.delete('/api/items/1');

// Request helpers
const timeoutHttp = http.withTimeout(5000); // 5 second timeout
const authedHttp = http.withHeaders({ 
  'Authorization': 'Bearer token',
  'X-Client': 'my-app'
});

// Use configured HTTP clients
const response = await timeoutHttp.get('/slow-endpoint');
const result = await authedHttp.post('/api/secure-data', payload);
```

### Response Object

```js
{
  raw,           // original Response object
  ok,            // response.ok
  status,        // response.status
  text(),        // response.text()
  json<T>(),     // response.json() with type support
  html()         // parse response as HTML document
}
```

## Animation

Web Animations API integration with common presets and smooth animations.

```js
import { animate, animations } from '@dmitrijkiltau/dom.js';

// Built-in animation presets
dom('.notice').fadeIn(300);
dom('.modal').slideUp(400);
dom('.button').pulse();
dom('.error').shake();

// Available presets: fadeIn, fadeOut, slideUp, slideDown, pulse, shake

// Custom animations
dom('.notice').animate([
  { opacity: 0, transform: 'translateY(-20px)' },
  { opacity: 1, transform: 'translateY(0)' }
], {
  duration: 300,
  easing: 'ease-out'
});

// Or use the function directly
const [keyframes, options] = animations.fadeIn(500);
animate(element, keyframes, options);
```

## Plugin System

Extend dom.js with custom functionality.

```js
import { use } from '@dmitrijkiltau/dom.js';

// Create a plugin
use((api) => {
  // Add method to dom object
  api.flash = function(selector) {
    return this(selector).animate([
      { opacity: 0 }, 
      { opacity: 1 }
    ], { duration: 150 });
  };
  
  // Add method to DOMCollection prototype
  api.prototype.highlight = function() {
    return this.addClass('highlight');
  };
});

// Use the plugin
dom.flash('.message');
dom('.items').highlight();
```

## TypeScript Tips

- Use `dom(sel).el<HTMLButtonElement>()` for type-safe element access
- Event handler signature: `(ev: Event, el: Element, idx: number)`
- You can wrap elements locally: `const $ = dom(el)`

Example:

```ts
dom('.buttons').on('click', (ev, el, idx) => {
  const button = el as HTMLButtonElement;
  const $ = dom(el); // wrap for chaining
  $.addClass('clicked');
});
```

## Browser Support & Size

- **Target**: ES2020+ (modern evergreen browsers)
- **Bundle Size**: Small (few KB, depending on bundler and used API parts)
- **Dependencies**: Zero

## Documentation

Full interactive documentation with live examples: [View Documentation](./docs)

To run the documentation locally:

```bash
# Install docs dependencies
npm run docs:install

# Start development server
npm run docs:dev
```

## Roadmap

### Recently Added ✅
- `.last()`, `.filter()`, `.empty()`, `.remove()` collection methods
- `.parent()`, `.parents()`, `.siblings()` traversal methods
- `.val()`, `.prop()`, `.attrs()`, `.serialize()` for better form and attribute handling
- `.once()` event method for one-time event handling
- `.clone()`, `.after()`, `.before()` element manipulation
- `.trigger()` for custom event dispatching
- Event shortcuts (`.click()`, `.focus()`, `.blur()`, `.hover()`)
- Animation presets (fadeIn, fadeOut, slideUp, slideDown, pulse, shake)
- Enhanced template system with conditional rendering (`data-if`, `data-show`, `data-hide`)
- Event binding in templates (`data-on-*`)
- HTTP request helpers (`withTimeout()`, `withHeaders()`)

### Future Enhancements
- [ ] Lightweight `morph()`/`swap()` for HTML snippets
- [ ] Template loops (`data-for`)
- [ ] Additional animation utilities and chaining
- [ ] Extended plugin ecosystem
- [ ] HTTP request interceptors and middleware

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Dmitrij Kiltau
