# vanilla-kit

A tiny, intuitive, chainable DOM utility for modern browsers (like jQuery, but ESM and no $).

[![npm version](https://badge.fury.io/js/@dmitrijkiltau%2Fvanilla-kit.svg)](https://www.npmjs.com/package/@dmitrijkiltau/vanilla-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Lightweight** - Small bundle size (few KB, depending on usage)
- ⛓️ **Chainable API** - Familiar jQuery-like syntax
- 📦 **Modern ES Modules** - Built for modern browsers (ES2020+)
- 🎯 **TypeScript Support** - Full TypeScript definitions included
- 🏗️ **Template System** - HTML templates with data binding
- 📝 **Form Utilities** - Easy form handling and serialization
- 🌐 **HTTP Utilities** - Simple fetch wrapper with response helpers
- 🎬 **Animation Support** - Web Animations API integration
- 🔧 **Plugin System** - Extend functionality with custom plugins
- 🆔 **Zero Dependencies** - No external dependencies

## Installation

### npm

```bash
npm install @dmitrijkiltau/vanilla-kit
```

### ES Module Import

```js
import vk from '@dmitrijkiltau/vanilla-kit';

// Or import specific functions
import vk, { renderTemplate, onSubmit, http } from '@dmitrijkiltau/vanilla-kit';
```

### CDN (ES Module)

```js
import vk from 'https://unpkg.com/@dmitrijkiltau/vanilla-kit/dist/index.js';
```

## Quick Start

```js
import vk from '@dmitrijkiltau/vanilla-kit';

// Select elements and chain operations
vk('.my-elements')
  .addClass('active')
  .on('click', (ev, el) => {
    console.log('Clicked:', el);
  });
```

## Core API

The core of vanilla-kit is the `vk()` function, which selects elements and returns a VKCollection for chaining operations.

### Basic Selection

```js
// Select elements
vk('.items')              // by class
vk('#app')                // by id
vk('div')                 // by tag
vk(element)               // wrap existing element
vk([el1, el2])           // wrap multiple elements

// Chain operations
vk('.cards')
  .addClass('animate')
  .css('opacity', '0.8')
  .on('mouseenter', (ev, el) => vk(el).addClass('hover'));
```

### VKCollection Methods

```js
// DOM manipulation
vk('.items').addClass('active')
vk('.items').removeClass('inactive')
vk('.items').toggleClass('visible')
vk('.items').css('color', 'red')
vk('.items').attr('data-id', '123')
vk('.items').html('<span>New content</span>')
vk('.items').text('New text')
vk('.items').append('<div>Child</div>')
vk('.items').remove()

// Event handling
vk('.btn').on('click', handler)
vk('.btn').off('click', handler)

// Utilities
vk('.items').each((el, idx) => console.log(el))
vk('.items').filter('.active')
vk('.items').find('.child')
vk('.items').first()
vk('.items').last()
vk('.items').eq(0)
vk('.items').el() // get first element
```

## Templates

HTML template system with data binding using `data-text`, `data-attr-*`, and `data-html` attributes.

### Basic Usage

```html
<template id="row">
  <li>
    <a data-text="title" data-attr-href="url"></a>
  </li>
</template>
```

```js
import { renderTemplate, useTemplate, tpl } from '@dmitrijkiltau/vanilla-kit';

// Render once
vk('#list').append(renderTemplate('#row', { title: 'Docs', url: '/docs' }));

// Create reusable render function
const renderRow = useTemplate('#row');
vk('#list').append(renderRow({ title: 'Home', url: '/' }));

// Get template element
const template = tpl('#row'); // returns HTMLTemplateElement
```

## Forms

Comprehensive form handling with serialization and submission utilities.

### Form Handling

```js
import { onSubmit, serializeForm, toQueryString } from '@dmitrijkiltau/vanilla-kit';

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
import { on, off } from '@dmitrijkiltau/vanilla-kit';

// Event binding - target can be window, document, Element, or VKCollection
on(window, 'scroll', handler);
on(document, 'click', handler);
on('.buttons', 'click', handler);
on(vk('.items'), 'mouseenter', handler);

// Event removal
off(window, 'scroll', handler);
```

## HTTP

Simple fetch wrapper with response helpers and automatic JSON handling.

```js
import { http } from '@dmitrijkiltau/vanilla-kit';

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

Web Animations API integration for smooth animations.

```js
import { animate } from '@dmitrijkiltau/vanilla-kit';

// Animate elements
vk('.notice').animate([
  { opacity: 0, transform: 'translateY(-20px)' },
  { opacity: 1, transform: 'translateY(0)' }
], {
  duration: 300,
  easing: 'ease-out'
});

// Or use the method directly
animate(element, keyframes, options);
```

## Plugin System

Extend vanilla-kit with custom functionality.

```js
import { use } from '@dmitrijkiltau/vanilla-kit';

// Create a plugin
use((api) => {
  // Add method to vk object
  api.flash = function(selector) {
    return this(selector).animate([
      { opacity: 0 }, 
      { opacity: 1 }
    ], { duration: 150 });
  };
  
  // Add method to VKCollection prototype
  api.prototype.highlight = function() {
    return this.addClass('highlight');
  };
});

// Use the plugin
vk.flash('.message');
vk('.items').highlight();
```

## TypeScript Tips

- Use `vk(sel).el<HTMLButtonElement>()` for type-safe element access
- Event handler signature: `(ev: Event, el: Element, idx: number)`
- You can wrap elements locally: `const $ = vk(el)`

Example:

```ts
vk('.buttons').on('click', (ev, el, idx) => {
  const button = el as HTMLButtonElement;
  const $ = vk(el); // wrap for chaining
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

- [ ] `.serialize()` method directly on `VKCollection`
- [ ] `once()` event helper
- [ ] Lightweight `morph()`/`swap()` for HTML snippets
- [ ] Additional animation utilities
- [ ] Extended plugin ecosystem

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Dmitrij Kiltau
