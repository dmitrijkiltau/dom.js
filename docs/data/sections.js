// Content sections data
export const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: `
      <p class="text-lg text-gray-700 mb-4">
        vanilla-kit is a lightweight, modern DOM manipulation library that provides a jQuery-like API 
        with ES modules support and no dependencies.
      </p>
      <p class="text-gray-700 mb-4">
        It's designed for modern browsers (ES2020+) and offers a chainable, intuitive API for 
        DOM manipulation, templating, forms, events, HTTP requests, and animations.
      </p>
      <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div class="flex">
          <div class="ml-3">
            <h4 class="text-lg font-medium text-blue-900">Key Features</h4>
            <ul class="mt-2 text-blue-700">
              <li>• Lightweight and fast (only a few KB)</li>
              <li>• Modern ES2020+ syntax</li>
              <li>• No dependencies</li>
              <li>• Chainable API</li>
              <li>• TypeScript support</li>
              <li>• Template system with data binding</li>
              <li>• Form utilities</li>
              <li>• Plugin system</li>
            </ul>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'installation',
    title: 'Installation',
    content: `
      <div class="space-y-4">
        <div>
          <h4 class="text-lg font-semibold mb-2">npm</h4>
          <pre class="code-block"><code>npm install @dmitrijkiltau/vanilla-kit</code></pre>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-2">ES Module Import</h4>
          <pre class="code-block"><code>import vk from '@dmitrijkiltau/vanilla-kit';

// Or import specific functions
import vk, { renderTemplate, onSubmit, http } from '@dmitrijkiltau/vanilla-kit';</code></pre>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-2">CDN (ES Module)</h4>
          <pre class="code-block"><code>import vk from 'https://unpkg.com/@dmitrijkiltau/vanilla-kit/dist/index.js';</code></pre>
        </div>
      </div>
    `
  },
  {
    id: 'core-api',
    title: 'Core API',
    content: `
      <p class="text-gray-700 mb-4">
        The core of vanilla-kit is the <code class="bg-gray-200 px-2 py-1 rounded">vk()</code> function, 
        which selects elements and returns a VKCollection for chaining operations.
      </p>
      <div class="space-y-4">
        <div>
          <h4 class="text-lg font-semibold mb-2">Basic Usage</h4>
          <pre class="code-block"><code>// Select elements
const elements = vk('.my-class');
const singleElement = vk('#my-id');

// Method chaining
vk('.buttons')
  .addClass('active')
  .css('color', 'blue')
  .on('click', handler);</code></pre>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-2">VKCollection Methods</h4>
          <ul class="text-gray-700 space-y-1">
            <li>• <code class="bg-gray-200 px-1 rounded">addClass(className)</code> - Add CSS class</li>
            <li>• <code class="bg-gray-200 px-1 rounded">removeClass(className)</code> - Remove CSS class</li>
            <li>• <code class="bg-gray-200 px-1 rounded">toggleClass(className)</code> - Toggle CSS class</li>
            <li>• <code class="bg-gray-200 px-1 rounded">css(prop, value)</code> - Get/set CSS properties</li>
            <li>• <code class="bg-gray-200 px-1 rounded">text(content)</code> - Get/set text content</li>
            <li>• <code class="bg-gray-200 px-1 rounded">html(content)</code> - Get/set HTML content</li>
            <li>• <code class="bg-gray-200 px-1 rounded">attr(name, value)</code> - Get/set attributes</li>
            <li>• <code class="bg-gray-200 px-1 rounded">each(callback)</code> - Iterate over elements</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    id: 'templates',
    title: 'Templates',
    content: `
      <p class="text-gray-700 mb-4">
        vanilla-kit provides a powerful template system with data binding using HTML template elements.
        Templates support <code class="bg-gray-200 px-1 rounded">data-text</code>, 
        <code class="bg-gray-200 px-1 rounded">data-html</code>, and 
        <code class="bg-gray-200 px-1 rounded">data-attr-*</code> attributes for dynamic content.
      </p>
      <div class="space-y-4">
        <div>
          <h4 class="text-lg font-semibold mb-2">Template Functions</h4>
          <ul class="text-gray-700 space-y-1">
            <li>• <code class="bg-gray-200 px-1 rounded">useTemplate(selector)</code> - Create reusable render function</li>
            <li>• <code class="bg-gray-200 px-1 rounded">renderTemplate(selector, data)</code> - Render template directly</li>
            <li>• <code class="bg-gray-200 px-1 rounded">tpl(selector)</code> - Get template element</li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-2">Data Binding Attributes</h4>
          <ul class="text-gray-700 space-y-1">
            <li>• <code class="bg-gray-200 px-1 rounded">data-text="property"</code> - Bind text content</li>
            <li>• <code class="bg-gray-200 px-1 rounded">data-html="property"</code> - Bind HTML content</li>
            <li>• <code class="bg-gray-200 px-1 rounded">data-attr-href="property"</code> - Bind href attribute</li>
            <li>• <code class="bg-gray-200 px-1 rounded">data-attr-class="property"</code> - Bind class attribute</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    id: 'forms',
    title: 'Forms',
    content: `
      <p class="text-gray-700 mb-4">
        Handle forms with automatic serialization and submission helpers. 
        Forms are automatically serialized into JavaScript objects with proper handling for arrays and special input types.
      </p>
      <div class="space-y-4">
        <div>
          <h4 class="text-lg font-semibold mb-2">Form Functions</h4>
          <ul class="text-gray-700 space-y-1">
            <li>• <code class="bg-gray-200 px-1 rounded">onSubmit(form, handler)</code> - Handle form submissions</li>
            <li>• <code class="bg-gray-200 px-1 rounded">serializeForm(form)</code> - Serialize form to object</li>
            <li>• <code class="bg-gray-200 px-1 rounded">toQueryString(object)</code> - Convert object to query string</li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-2">Supported Input Types</h4>
          <ul class="text-gray-700 space-y-1">
            <li>• Text inputs, textareas, and select elements</li>
            <li>• Checkboxes and radio buttons</li>
            <li>• File inputs</li>
            <li>• Multiple select elements (arrays)</li>
            <li>• Checkbox arrays (same name attribute)</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    id: 'events',
    title: 'Events',
    content: `
      <p class="text-gray-700 mb-4">
        Handle events with support for delegation and multiple targets. 
        Event handlers receive the event, element, and index as parameters.
      </p>
      <div class="space-y-4">
        <div>
          <h4 class="text-lg font-semibold mb-2">Event Functions</h4>
          <ul class="text-gray-700 space-y-1">
            <li>• <code class="bg-gray-200 px-1 rounded">on(target, type, handler)</code> - Add event listener</li>
            <li>• <code class="bg-gray-200 px-1 rounded">off(target, type, handler)</code> - Remove event listener</li>
            <li>• <code class="bg-gray-200 px-1 rounded">vk(selector).on(type, handler)</code> - Chain event binding</li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-2">Event Delegation</h4>
          <p class="text-gray-700 mb-2">Handle events on dynamically created elements:</p>
          <pre class="code-block"><code>// Event delegation
vk('#container').on('click', '.dynamic-button', (ev, el) => {
  // Handle clicks on .dynamic-button inside #container
});

// Multiple event types
vk(element).on('mouseenter mouseleave', handler);</code></pre>
        </div>
      </div>
    `
  },
  {
    id: 'http',
    title: 'HTTP',
    content: `
      <p class="text-gray-700 mb-4">
        Make HTTP requests with a simple, promise-based API. 
        All methods return a response object with helper methods for common content types.
      </p>
      <div class="space-y-4">
        <div>
          <h4 class="text-lg font-semibold mb-2">HTTP Methods</h4>
          <ul class="text-gray-700 space-y-1">
            <li>• <code class="bg-gray-200 px-1 rounded">http.get(url, options)</code> - GET request</li>
            <li>• <code class="bg-gray-200 px-1 rounded">http.post(url, data, options)</code> - POST request</li>
            <li>• <code class="bg-gray-200 px-1 rounded">http.put(url, data, options)</code> - PUT request</li>
            <li>• <code class="bg-gray-200 px-1 rounded">http.patch(url, data, options)</code> - PATCH request</li>
            <li>• <code class="bg-gray-200 px-1 rounded">http.delete(url, options)</code> - DELETE request</li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-2">Response Methods</h4>
          <ul class="text-gray-700 space-y-1">
            <li>• <code class="bg-gray-200 px-1 rounded">response.json()</code> - Parse as JSON</li>
            <li>• <code class="bg-gray-200 px-1 rounded">response.text()</code> - Get as text</li>
            <li>• <code class="bg-gray-200 px-1 rounded">response.html()</code> - Parse as HTML element</li>
            <li>• <code class="bg-gray-200 px-1 rounded">response.ok</code> - Success status boolean</li>
            <li>• <code class="bg-gray-200 px-1 rounded">response.status</code> - HTTP status code</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    id: 'animation',
    title: 'Animation',
    content: `
      <p class="text-gray-700 mb-4">
        Animate elements using the Web Animations API with a simple interface.
        Create smooth animations with keyframes and timing options.
      </p>
      <div class="space-y-4">
        <div>
          <h4 class="text-lg font-semibold mb-2">Animation Method</h4>
          <ul class="text-gray-700 space-y-1">
            <li>• <code class="bg-gray-200 px-1 rounded">vk(selector).animate(keyframes, options)</code> - Animate elements</li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-2">Keyframes & Options</h4>
          <pre class="code-block"><code>// Basic animation
vk('.box').animate([
  { transform: 'translateX(0px)' },
  { transform: 'translateX(100px)' }
], {
  duration: 1000,
  easing: 'ease-in-out',
  iterations: 1,
  fill: 'forwards'
});

// Common animations
vk('.fade').animate([
  { opacity: 0 },
  { opacity: 1 }
], { duration: 500 });</code></pre>
        </div>
      </div>
    `
  },
  {
    id: 'plugins',
    title: 'Plugin System',
    content: `
      <p class="text-gray-700 mb-4">
        Extend vanilla-kit with custom functionality using the plugin system.
        Plugins can add new methods to the vk object and VKCollection prototype.
      </p>
      <div class="space-y-4">
        <div>
          <h4 class="text-lg font-semibold mb-2">Plugin Function</h4>
          <ul class="text-gray-700 space-y-1">
            <li>• <code class="bg-gray-200 px-1 rounded">use(plugin)</code> - Register a plugin</li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-2">Creating Plugins</h4>
          <pre class="code-block"><code>// Create a plugin
use((api) => {
  // Add method to vk object
  api.myUtility = function(selector, options) {
    return this(selector).addClass('my-class');
  };
  
  // Add method to VKCollection prototype
  api.prototype.myMethod = function(value) {
    return this.css('custom-property', value);
  };
});

// Use the plugin
vk.myUtility('.elements');
vk('.elements').myMethod('value');</code></pre>
        </div>
      </div>
    `
  }
];
