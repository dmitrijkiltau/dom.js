# dom.js

A lightweight, modular DOM manipulation library with chainable API, zero dependencies, and modern ES modules.

[![npm version](https://badge.fury.io/js/@dmitrijkiltau%2Fdom.js.svg)](https://www.npmjs.com/package/@dmitrijkiltau/dom.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Lightweight** - Modular architecture, import only what you need
- ⛓️ **Chainable API** - Intuitive method chaining for DOM operations  
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

Pinned version (recommended for stability):

```js
import dom from 'https://unpkg.com/@dmitrijkiltau/dom.js@1.2.1/dist/index.js';
```

### CommonJS (Node/CJS)

```js
// Full bundle
const dom = require('@dmitrijkiltau/dom.js');

// Modular subpath imports
const { http } = require('@dmitrijkiltau/dom.js/http');
const { renderTemplate } = require('@dmitrijkiltau/dom.js/template');
```

## Import Options

Choose the import style that best fits your needs:

### Full Bundle (Default)
Best for: Feature-rich applications, comprehensive DOM manipulation
```js
import dom from '@dmitrijkiltau/dom.js';

// Everything available (~13KB total)
dom('.elements').fadeIn(300);
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
import { serializeForm, onSubmit } from '@dmitrijkiltau/dom.js/forms';
import { animate, animations } from '@dmitrijkiltau/dom.js/motion';

// Use only what you import
const response = await http.get('/api');
const element = renderTemplate('#template', data);
const formData = serializeForm('#form');
dom('.items').fadeIn(300);
```

**[📖 Complete Architecture Guide →](ARCHITECTURE.md)**

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
dom(document)             // wrap document
dom(window)               // wrap window

// Optional context selection
dom('.child', rootElement) // search within a root element
dom('.item', dom('#list')) // context can be a DOMCollection

// Create from HTML strings
dom('<li class="entry">Hello</li>') // parse HTML into elements
dom.fromHTML('<div><span>Hi</span></div>') // explicit helper

// Chain operations
dom('.cards')
  .addClass('animate')
  .css('opacity', '0.8')
  .on('mouseenter', (ev, el) => dom(el).addClass('hover'));
```

### Element Creation

```js
// Create elements
const div = dom.create('div', { class: 'container', id: 'main' });
const button = dom.create('button', { type: 'submit' }, 'Click me');
const list = dom.create('ul', null, [
  dom.create('li', null, 'Item 1'),
  dom.create('li', null, 'Item 2')
]);
```

### DOMCollection Methods

```js
// DOM manipulation
dom('.items').addClass('active')
dom('.items').removeClass('inactive')
dom('.items').replaceClass('old-class', 'new-class') // replace specific classes
dom('.items').toggleClass('visible')
dom('.items').hasClass('active') // check if has class
dom('.items').css('color', 'red')
dom('.items').attr('data-id', '123')
dom('.items').attrs({id: 'main', class: 'active'}) // bulk attributes
dom('.items').prop('checked', true) // properties vs attributes
dom('.items').val('new value') // form element values
dom('.items').data('custom', 'value') // data attributes
dom('.items').html('<span>New content</span>')
dom('.items').text('New text')
dom('.items').append('<div>Child</div>')
// If inserting a Node/DOMCollection into multiple targets, nodes are cloned so each target gets a copy
dom('.items').append(dom.create('span', null, 'X'))
dom('.items').prepend('<div>First</div>')
dom('.items').appendTo(dom('#container')) // append to target (Element or DOMCollection)
dom('.items').prependTo(dom('#container')) // prepend to target
dom('.items').after('<div>After</div>')
dom('.items').before('<div>Before</div>')
dom('<p>New</p>').insertAfter(dom('.ref')) // insert current collection after target(s)
dom('<p>New</p>').insertBefore(dom('.ref')) // insert current collection before target(s)
dom('.items').replaceWith('<p>Replaced</p>') // replace element(s)
dom('<b>New</b>').replaceAll('.old') // replace target(s) with current collection
dom('.items').wrap('<div class="wrap"></div>') // wrap each element
dom('.items').wrapAll('<section class="box"><div class="inner"></div></section>') // wrap entire set with one wrapper
dom('.items').wrapInner('<span class="inner"></span>') // wrap contents of each element
dom('.items').unwrap() // remove direct parent wrapper
dom('.items').empty() // remove all children
dom('.items').detach() // remove without losing data/events
dom('.items').remove() // remove elements
dom('.items').clone() // clone elements

// Visibility
dom('.items').show() // show elements
dom('.items').hide() // hide elements
dom('.items').toggle() // toggle visibility
dom('.items').toggle(true) // force show
dom('.items').toggle(false) // force hide

// Event handling
dom('.btn').on('click', handler)
dom('.btn').once('click', handler) // one-time event
dom('.btn').off('click', handler)
dom('.btn').trigger('custom-event', {data: 'value'}) // dispatch events

// Event shortcuts
dom('.btn').click() // trigger click
dom('.btn').click(handler) // bind click handler
dom('.btn').focus() // focus element
dom('.btn').blur() // blur element
dom('.btn').hover(enterHandler, leaveHandler) // mouse enter/leave

// Event delegation
dom('#list').on('click', 'a.item', (ev, el, idx) => {
  // el is the matched descendant (the anchor)
  // idx is the index of the bound element within the original collection (#list in this case)
});

// Traversal and filtering
dom('.items').filter('.active') // filter by selector or function
dom('.items').find('.child') // descendants
dom('.items').children('.child') // immediate children (optionally filtered)
dom('.items').parent() // immediate parents
dom('.items').parents('.container') // all ancestors (optionally filtered)
dom('.items').siblings('.other') // sibling elements
dom('.items').closest('.container') // closest ancestor that matches
dom('.items').next('.row') // next element sibling (optionally filtered)
dom('.items').prev('.row') // previous element sibling (optionally filtered)
dom('.items').first() // first element
dom('.items').last() // last element
dom('.items').eq(0) // element at index
dom('.items').get(0) // get raw element at index
dom('.items').slice(1, -1) // sub-collection
dom('.items').map((el, i) => el.id) // map to array
dom('.items').index() // index of first element among its siblings
dom('.items').is('.active') // does any element match selector
dom('.items').not('.disabled') // exclude matching elements
dom('.sections').has('.item') // keep elements that contain a descendant
dom('.a').add('.b') // union with selector/elements/collection

// Layout & geometry
// Sizes
dom('#panel').width() // content width (excludes padding & border)
dom('#panel').height() // content height (excludes padding & border)
dom('#panel').innerWidth() // includes padding
dom('#panel').innerHeight() // includes padding
dom('#panel').outerWidth() // includes padding + border
dom('#panel').outerHeight(true) // includes padding + border + margin
// Set sizes (number = px)
dom('#panel').width(320).height('2rem')

// Positioning
dom('#el').offset() // {top,left} relative to document
dom('#el').position() // {top,left} relative to offsetParent
dom('#el').offsetParent() // DOMCollection wrapping the offsetParent element

// Scroll
dom('#box').scrollTop() // get scrollTop
dom('#box').scrollLeft(100) // set scrollLeft

// Rect wrapper
dom('#el').rect() // getBoundingClientRect() snapshot as plain object

// Utilities
dom('.items').each((el, idx) => console.log(el))
dom('.items').el() // get first element
dom('.items').el(1) // get element by index (convenience)
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

### Loops with `data-each`

Repeat an element for each item in an array.

```html
<template id="users">
  <li data-each="users as user, i">
    <a data-text="user.name" data-attr-href="user.url"></a>
    <span>#<span data-text="$index"></span></span>
  </li>
  <!-- Note: You can place data-each on any element inside your template. -->
  <!-- When used on the root element of the template, renderTemplate returns a DocumentFragment. -->
  <!-- dom().append() handles both Elements and DocumentFragments. -->
  <!-- Access current item via the alias (default: `item`) and index via `$index` (or a custom alias). -->
  <!-- Syntax: data-each="items" | data-each="items as item" | data-each="items as item, idx" -->
```

```js
const data = {
  users: [
    { name: 'Alice', url: '/u/alice' },
    { name: 'Bob', url: '/u/bob' }
  ]
};

dom('#list').append(renderTemplate('#users', data));
```

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
- For delegated events, `idx` refers to the index of the element you bound the listener on (the collection item), not the matched child.
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
- **Bundle Size**: 
  - Full bundle: ~13KB (all features)
  - Core only: ~7KB (DOM manipulation + events)
  - Individual modules: 2-8KB each
- **Dependencies**: Zero

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Dmitrij Kiltau

## Security

- `dom().html()` and template `data-html` bindings insert raw HTML into the DOM. Do not pass untrusted input without sanitizing it first.
