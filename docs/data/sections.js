// Content sections data
export const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: `
      <p class="text-lg text-gray-700 mb-4">
        dom.js is a lightweight, modern DOM manipulation library that provides an intuitive chainable API 
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
      <div class="space-y-6">
        <div>
          <h4 class="text-lg font-semibold mb-2">npm</h4>
          <pre class="code-block"><code>npm install @dmitrijkiltau/dom.js</code></pre>
        </div>
        
        <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div class="flex">
            <div class="ml-3">
              <h4 class="text-lg font-medium text-blue-900 mb-3">🏗️ Modular Architecture</h4>
              <p class="text-blue-700 mb-3">
                dom.js now features a modular architecture for optimal bundle sizes. Choose the import style that fits your needs:
              </p>
            </div>
          </div>
        </div>

        <div class="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <div class="bg-gray-50 rounded-lg p-4 border">
            <h5 class="font-semibold text-gray-800 mb-2">📦 Full Bundle (~13KB)</h5>
            <p class="text-sm text-gray-600 mb-3">Best for: Feature-rich applications, comprehensive DOM manipulation</p>
            <pre class="code-block text-xs"><code>import dom from '@dmitrijkiltau/dom.js';

// Everything available
dom('.elements').fadeIn();
await dom.http.get('/api/data');</code></pre>
          </div>
          
          <div class="bg-green-50 rounded-lg p-4 border border-green-200">
            <h5 class="font-semibold text-green-800 mb-2">🎯 Core Only (~7KB)</h5>
            <p class="text-sm text-green-600 mb-3">Best for: Basic DOM manipulation, size-critical apps</p>
            <pre class="code-block text-xs"><code>import dom from '@dmitrijkiltau/dom.js/core';

// Core functionality only
dom('.elements')
  .addClass('active')
  .on('click', handler);</code></pre>
          </div>
          
          <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h5 class="font-semibold text-purple-800 mb-2">🧩 Modular (Flexible)</h5>
            <p class="text-sm text-purple-600 mb-3">Best for: Maximum tree-shaking, library authors</p>
            <pre class="code-block text-xs"><code>import dom from '@dmitrijkiltau/dom.js/core';
import { http } from '@dmitrijkiltau/dom.js/http';

// Import only what you use</code></pre>
          </div>
        </div>

        <div>
          <h4 class="text-lg font-semibold mb-2">Bundle Size Comparison</h4>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm border border-gray-200 rounded-lg">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-4 py-2 text-left border-r">Import Pattern</th>
                  <th class="px-4 py-2 text-left border-r">Size</th>
                  <th class="px-4 py-2 text-left border-r">Savings</th>
                  <th class="px-4 py-2 text-left">Use Case</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-t">
                  <td class="px-4 py-2 border-r"><code class="bg-gray-200 text-gray-700 px-1 rounded">Full Bundle</code></td>
                  <td class="px-4 py-2 border-r">~13KB</td>
                  <td class="px-4 py-2 border-r">-</td>
                  <td class="px-4 py-2">Comprehensive DOM library</td>
                </tr>
                <tr class="border-t bg-green-50 text-green-700">
                  <td class="px-4 py-2 border-r"><code class="bg-gray-200 text-gray-700 px-1 rounded">Core Only</code></td>
                  <td class="px-4 py-2 border-r">~7KB</td>
                  <td class="px-4 py-2 border-r font-semibold text-green-700">43% smaller</td>
                  <td class="px-4 py-2">Basic websites</td>
                </tr>
                <tr class="border-t">
                  <td class="px-4 py-2 border-r"><code class="bg-gray-200 text-gray-700 px-1 rounded">Core + HTTP</code></td>
                  <td class="px-4 py-2 border-r">~9KB</td>
                  <td class="px-4 py-2 border-r text-green-700">30% smaller</td>
                  <td class="px-4 py-2">Simple SPAs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 class="text-lg font-semibold mb-2">CDN Options</h4>
          <div class="space-y-3">
            <div>
              <h5 class="font-medium mb-1">Full Bundle</h5>
              <pre class="code-block"><code>import dom from 'https://unpkg.com/@dmitrijkiltau/dom.js/dist/index.js';</code></pre>
            </div>
            <div>
              <h5 class="font-medium mb-1">Core Only</h5>
              <pre class="code-block"><code>import dom from 'https://unpkg.com/@dmitrijkiltau/dom.js/dist/core.js';</code></pre>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'modular-architecture',
    title: 'Modular Architecture',
    content: `
      <p class="text-lg text-gray-700 mb-6">
        dom.js features a flexible modular architecture that allows you to import only what you need, 
        resulting in significantly smaller bundle sizes while maintaining 100% backward compatibility.
      </p>

      <div class="space-y-6">
        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <h4 class="text-lg font-semibold mb-3 flex items-center">
              <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">Full Bundle</span>
              Unchanged Experience
            </h4>
            <pre class="code-block mb-3"><code>import dom from '@dmitrijkiltau/dom.js';

// All features available (~13KB total)
dom('.elements')
  .addClass('active')
  .fadeIn()
  .on('click', handler);

// All utilities included
const response = await dom.http.get('/api/data');
const element = dom.renderTemplate('#template', data);</code></pre>
            <p class="text-sm text-gray-600">Perfect for comprehensive DOM manipulation and feature-rich applications.</p>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3 flex items-center">
              <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">Core Only</span>
              43% Smaller
            </h4>
            <pre class="code-block mb-3"><code>import dom from '@dmitrijkiltau/dom.js/core';

// Core functionality only (~7KB total)
dom('.elements')
  .addClass('active')
  .css('color', 'red')
  .on('click', handler);

// HTTP, templates, animations not included
// dom.http          ❌ Not available
// dom.renderTemplate ❌ Not available  
// .fadeIn()         ❌ Not available</code></pre>
            <p class="text-sm text-gray-600">Perfect for basic websites and size-critical applications.</p>
          </div>
        </div>

        <div>
          <h4 class="text-lg font-semibold mb-3 flex items-center">
            <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">Modular</span>
            Maximum Flexibility
          </h4>
          <pre class="code-block mb-3"><code>// Import only what you need
import dom from '@dmitrijkiltau/dom.js/core';
import { http } from '@dmitrijkiltau/dom.js/http';
import { renderTemplate } from '@dmitrijkiltau/dom.js/template';

// Use core DOM functionality  
dom('.elements').addClass('active');

// Use HTTP separately
const response = await http.get('/api/data');

// Use templates separately  
const element = renderTemplate('#template', data);</code></pre>
          <p class="text-sm text-gray-600">Perfect for library authors and applications that need maximum optimization.</p>
        </div>

        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div class="flex">
            <div class="ml-3">
              <h4 class="text-lg font-medium text-yellow-900 mb-2">🔄 Migration Path</h4>
              <p class="text-yellow-700 mb-2">
                Existing code continues to work unchanged. You can gradually adopt modular imports:
              </p>
              <div class="space-y-2 text-yellow-700 text-sm">
                <div><strong>Step 1:</strong> Keep using full bundle during development</div>
                <div><strong>Step 2:</strong> Switch to core + specific modules for production</div>
                <div><strong>Step 3:</strong> Optimize further with pure modular imports</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-lg font-semibold mb-3">Available Modules</h4>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div class="bg-gray-50 p-3 rounded border">
              <h5 class="font-medium text-gray-800">core.js</h5>
              <p class="text-sm text-gray-600 mt-1">DOM manipulation, events, plugins</p>
              <code class="text-xs bg-gray-200 px-1 rounded">~1.3KB</code>
            </div>
            <div class="bg-gray-50 p-3 rounded border">
              <h5 class="font-medium text-gray-800">http.js</h5>
              <p class="text-sm text-gray-600 mt-1">Fetch-based HTTP utilities</p>
              <code class="text-xs bg-gray-200 px-1 rounded">~86B</code>
            </div>
            <div class="bg-gray-50 p-3 rounded border">
              <h5 class="font-medium text-gray-800">template.js</h5>
              <p class="text-sm text-gray-600 mt-1">HTML template binding</p>
              <code class="text-xs bg-gray-200 px-1 rounded">~130B</code>
            </div>
            <div class="bg-gray-50 p-3 rounded border">
              <h5 class="font-medium text-gray-800">forms.js</h5>
              <p class="text-sm text-gray-600 mt-1">Form handling & serialization</p>
              <code class="text-xs bg-gray-200 px-1 rounded">~161B</code>
            </div>
            <div class="bg-gray-50 p-3 rounded border">
              <h5 class="font-medium text-gray-800">motion.js</h5>
              <p class="text-sm text-gray-600 mt-1">Web Animations API</p>
              <code class="text-xs bg-gray-200 px-1 rounded">~168B</code>
            </div>
            <div class="bg-gray-50 p-3 rounded border">
              <h5 class="font-medium text-gray-800">index.js</h5>
              <p class="text-sm text-gray-600 mt-1">Full bundle (all modules)</p>
              <code class="text-xs bg-gray-200 px-1 rounded">~1.8KB</code>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">
            <em>Note: Sizes include shared chunks. Actual total depends on bundler and used features.</em>
          </p>
        </div>
      </div>
    `
  },
  {
    id: 'core-api',
    title: 'Core API',
    content: `
      <p class="text-gray-700 mb-4">
        The core of dom.js is the <code class="bg-gray-200 px-2 py-1 rounded">dom()</code> function, 
        which selects elements and returns a DOMCollection for chaining operations.
      </p>
      
      <div class="bg-gray-50 border-l-4 border-gray-400 p-4 mb-6">
        <div class="flex">
          <div class="ml-3">
            <h4 class="text-lg font-medium text-gray-900 mb-2">📦 Core Import Options</h4>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <h5 class="font-medium text-gray-800 mb-2">Full Bundle</h5>
                <pre class="text-sm bg-gray-100 p-2 rounded"><code>import dom from '@dmitrijkiltau/dom.js';
// All features available</code></pre>
              </div>
              <div>
                <h5 class="font-medium text-gray-800 mb-2">Core Only (43% smaller)</h5>
                <pre class="text-sm bg-gray-100 p-2 rounded"><code>import dom from '@dmitrijkiltau/dom.js/core';
// DOM manipulation + events only</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="space-y-4">
        <div>
          <h4 class="text-lg font-semibold mb-2">Basic Usage</h4>
          <pre class="code-block"><code>// Select elements
const elements = dom('.my-class');
const singleElement = dom('#my-id');

// Method chaining (works with both full and core)
dom('.buttons')
  .addClass('active')
  .css('color', 'blue')
  .on('click', handler);</code></pre>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-2">DOMCollection Methods</h4>
          <p class="text-gray-600 mb-2">Available in both full bundle and core-only:</p>
          <ul class="text-gray-700 space-y-1">
            <li>• <code class="bg-gray-200 px-1 rounded">addClass(className)</code> - Add CSS class</li>
            <li>• <code class="bg-gray-200 px-1 rounded">removeClass(className)</code> - Remove CSS class</li>
            <li>• <code class="bg-gray-200 px-1 rounded">replaceClass(oldClasses, newClasses)</code> - Replace specific classes</li>
            <li>• <code class="bg-gray-200 px-1 rounded">toggleClass(className)</code> - Toggle CSS class</li>
            <li>• <code class="bg-gray-200 px-1 rounded">css(prop, value)</code> - Get/set CSS properties</li>
            <li>• <code class="bg-gray-200 px-1 rounded">text(content)</code> - Get/set text content</li>
            <li>• <code class="bg-gray-200 px-1 rounded">html(content)</code> - Get/set HTML content</li>
            <li>• <code class="bg-gray-200 px-1 rounded">attr(name, value)</code> - Get/set attributes</li>
            <li>• <code class="bg-gray-200 px-1 rounded">each(callback)</code> - Iterate over elements</li>
            <li>• <code class="bg-gray-200 px-1 rounded">on(event, handler)</code> - Event binding</li>
            <li>• <code class="bg-gray-200 px-1 rounded">find(selector)</code>, <code class="bg-gray-200 px-1 rounded">parent()</code>, <code class="bg-gray-200 px-1 rounded">siblings()</code> - Traversal</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    id: 'dom-manipulation',
    title: 'DOM Manipulation',
    content: `
      <p class="text-gray-700 mb-4">
        Manipulate elements with a concise, chainable API. Update content, classes, styles, attributes, and structure with clear, predictable behavior.
      </p>
      <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div class="flex">
          <div class="ml-3">
            <h4 class="text-lg font-medium text-blue-900 mb-2">What You Can Do</h4>
            <ul class="text-blue-800 space-y-1">
              <li>• Content: <code class="bg-gray-200 px-1 rounded">.text()</code>, <code class="bg-gray-200 px-1 rounded">.html()</code></li>
              <li>• Structure: <code class="bg-gray-200 px-1 rounded">.append()</code>, <code class="bg-gray-200 px-1 rounded">.prepend()</code>, <code class="bg-gray-200 px-1 rounded">.before()</code>, <code class="bg-gray-200 px-1 rounded">.after()</code>, <code class="bg-gray-200 px-1 rounded">.wrap()</code>, <code class="bg-gray-200 px-1 rounded">.unwrap()</code>, <code class="bg-gray-200 px-1 rounded">.replaceWith()</code></li>
              <li>• Classes & styles: <code class="bg-gray-200 px-1 rounded">.addClass()</code>, <code class="bg-gray-200 px-1 rounded">.removeClass()</code>, <code class="bg-gray-200 px-1 rounded">.replaceClass()</code>, <code class="bg-gray-200 px-1 rounded">.css()</code></li>
              <li>• Attributes & data: <code class="bg-gray-200 px-1 rounded">.attr()</code>, <code class="bg-gray-200 px-1 rounded">.attrs()</code>, <code class="bg-gray-200 px-1 rounded">.prop()</code>, <code class="bg-gray-200 px-1 rounded">.data()</code></li>
              <li>• Visibility: <code class="bg-gray-200 px-1 rounded">.show()</code>, <code class="bg-gray-200 px-1 rounded">.hide()</code>, <code class="bg-gray-200 px-1 rounded">.toggle()</code></li>
            </ul>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'templates',
    title: 'Templates',
    content: `
      <p class="text-gray-700 mb-4">
        dom.js provides a powerful template system with data binding using HTML template elements.
        Templates support <code class="bg-gray-200 px-1 rounded">data-text</code>, 
        <code class="bg-gray-200 px-1 rounded">data-html</code>, and 
        <code class="bg-gray-200 px-1 rounded">data-attr-*</code> attributes for dynamic content.
      </p>
      
      <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div class="flex">
          <div class="ml-3">
            <h4 class="text-lg font-medium text-blue-900 mb-2">📦 Import Options</h4>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <h5 class="font-medium text-blue-800 mb-2">Full Bundle</h5>
                <pre class="text-sm bg-blue-100 p-2 rounded"><code>import dom, { renderTemplate, useTemplate } from '@dmitrijkiltau/dom.js';</code></pre>
              </div>
              <div>
                <h5 class="font-medium text-blue-800 mb-2">Modular Import</h5>
                <pre class="text-sm bg-blue-100 p-2 rounded"><code>import { renderTemplate, useTemplate } from '@dmitrijkiltau/dom.js/template';</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
            <li>• <code class="bg-gray-200 px-1 rounded">data-if="condition"</code> - Conditional rendering</li>
            <li>• <code class="bg-gray-200 px-1 rounded">data-show="visible"</code> - Show/hide with display</li>
            <li>• <code class="bg-gray-200 px-1 rounded">data-hide="hidden"</code> - Hide when truthy</li>
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
      
      <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
        <div class="flex">
          <div class="ml-3">
            <h4 class="text-lg font-medium text-green-900 mb-2">📦 Import Options</h4>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <h5 class="font-medium text-green-800 mb-2">Full Bundle</h5>
                <pre class="text-sm bg-green-100 p-2 rounded"><code>import dom, { onSubmit, serializeForm } from '@dmitrijkiltau/dom.js';</code></pre>
              </div>
              <div>
                <h5 class="font-medium text-green-800 mb-2">Modular Import</h5>
                <pre class="text-sm bg-green-100 p-2 rounded"><code>import { onSubmit, serializeForm, toQueryString } from '@dmitrijkiltau/dom.js/forms';</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
        <div>
          <h4 class="text-lg font-semibold mb-2">Mixed Usage Example</h4>
          <pre class="code-block"><code>// Core + Forms modular approach
import dom from '@dmitrijkiltau/dom.js/core';
import { onSubmit } from '@dmitrijkiltau/dom.js/forms';

onSubmit('#contact-form', async (data, ev) => {
  dom('#status').text('Submitting...');
  // Handle form submission
});</code></pre>
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
            <li>• <code class="bg-gray-200 px-1 rounded">dom(selector).on(type, handler)</code> - Chain event binding</li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-2">Event Delegation</h4>
          <p class="text-gray-700 mb-2">Handle events on dynamically created elements:</p>
          <pre class="code-block"><code>// Event delegation
dom('#container').on('click', '.dynamic-button', (ev, el) => {
  // Handle clicks on .dynamic-button inside #container
});

// Multiple event types
dom(element).on('mouseenter mouseleave', handler);</code></pre>
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
      
      <div class="bg-purple-50 border-l-4 border-purple-400 p-4 mb-6">
        <div class="flex">
          <div class="ml-3">
            <h4 class="text-lg font-medium text-purple-900 mb-2">📦 Import Options</h4>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <h5 class="font-medium text-purple-800 mb-2">Full Bundle</h5>
                <pre class="text-sm bg-purple-100 p-2 rounded"><code>import dom, { http } from '@dmitrijkiltau/dom.js';</code></pre>
              </div>
              <div>
                <h5 class="font-medium text-purple-800 mb-2">Modular Import</h5>
                <pre class="text-sm bg-purple-100 p-2 rounded"><code>import { http } from '@dmitrijkiltau/dom.js/http';</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
        <div>
          <h4 class="text-lg font-semibold mb-2">Mixed Usage Example</h4>
          <pre class="code-block"><code>// Core + HTTP modular approach
import dom from '@dmitrijkiltau/dom.js/core';
import { http } from '@dmitrijkiltau/dom.js/http';

dom('#load-data').on('click', async () => {
  const response = await http.get('/api/users');
  if (response.ok) {
    const users = await response.json();
    dom('#user-list').html(
      users.map(user => \`<li>\${user.name}</li>\`).join('')
    );
  }
});</code></pre>
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
      
      <div class="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-6">
        <div class="flex">
          <div class="ml-3">
            <h4 class="text-lg font-medium text-indigo-900 mb-2">📦 Import Options</h4>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <h5 class="font-medium text-indigo-800 mb-2">Full Bundle</h5>
                <pre class="text-sm bg-indigo-100 p-2 rounded"><code>import dom from '@dmitrijkiltau/dom.js';
// .fadeIn(), .slideUp(), etc. available</code></pre>
              </div>
              <div>
                <h5 class="font-medium text-indigo-800 mb-2">Modular Import</h5>
                <pre class="text-sm bg-indigo-100 p-2 rounded"><code>import { animate, animations } from '@dmitrijkiltau/dom.js/motion';</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="space-y-4">
        <div>
          <h4 class="text-lg font-semibold mb-2">Animation Methods</h4>
          <ul class="text-gray-700 space-y-1">
            <li>• <code class="bg-gray-200 px-1 rounded">dom(selector).animate(keyframes, options)</code> - Animate elements (full bundle)</li>
            <li>• <code class="bg-gray-200 px-1 rounded">animate(element, keyframes, options)</code> - Direct animation (modular)</li>
            <li>• <code class="bg-gray-200 px-1 rounded">dom(selector).fadeIn(duration)</code> - Fade in animation (full bundle)</li>
            <li>• <code class="bg-gray-200 px-1 rounded">dom(selector).slideUp(duration)</code> - Slide up animation (full bundle)</li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-2">Keyframes & Options</h4>
          <pre class="code-block"><code>// Full bundle usage
dom('.box').animate([
  { transform: 'translateX(0px)' },
  { transform: 'translateX(100px)' }
], {
  duration: 1000,
  easing: 'ease-in-out',
  iterations: 1,
  fill: 'forwards'
});

// Modular usage
import dom from '@dmitrijkiltau/dom.js/core';
import { animate, animations } from '@dmitrijkiltau/dom.js/motion';

const element = dom('.fade').el();
const [keyframes, options] = animations.fadeIn(500);
animate(element, keyframes, options);</code></pre>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-2">Available Animation Presets</h4>
          <ul class="text-gray-700 space-y-1">
            <li>• <code class="bg-gray-200 px-1 rounded">fadeIn(duration)</code> - Fade in from opacity 0 to 1</li>
            <li>• <code class="bg-gray-200 px-1 rounded">fadeOut(duration)</code> - Fade out from opacity 1 to 0</li>
            <li>• <code class="bg-gray-200 px-1 rounded">slideUp(duration)</code> - Slide up with fade</li>
            <li>• <code class="bg-gray-200 px-1 rounded">slideDown(duration)</code> - Slide down with fade</li>
            <li>• <code class="bg-gray-200 px-1 rounded">pulse(duration)</code> - Pulse scale effect</li>
            <li>• <code class="bg-gray-200 px-1 rounded">shake(duration)</code> - Shake side-to-side</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    id: 'plugins',
    title: 'Plugin System',
    content: `
      <p class="text-gray-700 mb-4">
        Extend dom.js with custom functionality using the plugin system.
        Plugins can add new methods to the dom object and DOMCollection prototype.
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
  // Add method to dom object
  api.myUtility = function(selector, options) {
    return this(selector).addClass('my-class');
  };
  
  // Add method to DOMCollection prototype
  api.prototype.myMethod = function(value) {
    return this.css('custom-property', value);
  };
});

// Use the plugin
dom.myUtility('.elements');
dom('.elements').myMethod('value');</code></pre>
        </div>
      </div>
    `
  }
];
