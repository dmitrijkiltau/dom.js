// Content sections data
export const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: `
      <div class="space-y-6">
        <p class="text-lg text-gray-800">
          dom.js is a lightweight, modern DOM utility with a chainable API, zero dependencies, and first-class ES modules.
        </p>

        <div class="grid gap-6 md:grid-cols-2">
          <div class="bg-gray-50 rounded-lg p-4 border">
            <h4 class="text-lg font-semibold mb-2">Install</h4>
            <pre class="code-block"><code>npm install @dmitrijkiltau/dom.js</code></pre>
            <p class="text-sm text-gray-600 mt-2">Works with Vite, Next, webpack, and plain ES modules.</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 border">
            <h4 class="text-lg font-semibold mb-2">CDN (try it now)</h4>
            <pre class="code-block"><code>import dom from 'https://unpkg.com/@dmitrijkiltau/dom.js/dist/index.js';</code></pre>
            <p class="text-sm text-gray-600 mt-2">Pin a version for stability:</p>
            <pre class="code-block text-xs"><code>import dom from 'https://unpkg.com/@dmitrijkiltau/dom.js@1.5.1/dist/index.js';</code></pre>
          </div>
        </div>

        <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
          <h4 class="text-lg font-medium text-blue-900">Pick an import</h4>
          <div class="import-picker">
            <div class="import-tabs">
              <button class="import-tab" data-variant="full">Full Bundle</button>
              <button class="import-tab" data-variant="core">Core Only</button>
              <button class="import-tab" data-variant="modular">Modular</button>
            </div>
            <pre class="code-block"><code class="language-javascript" data-import-code></code></pre>

            <!-- Hidden raw code variants -->
            <pre class="hidden" data-variant="full"><code data-no-highlight>import dom from '@dmitrijkiltau/dom.js';</code></pre>
            <pre class="hidden" data-variant="core"><code data-no-highlight>import dom from '@dmitrijkiltau/dom.js/core';</code></pre>
            <pre class="hidden" data-variant="modular"><code data-no-highlight>import dom from '@dmitrijkiltau/dom.js/core';
import { http } from '@dmitrijkiltau/dom.js/http';</code></pre>
          </div>
          <p class="text-sm text-blue-700 mt-2">See <a class="underline" href="#installation">Installation</a> and <a class="underline" href="#modular-architecture">Modular Architecture</a> for details.</p>
        </div>

        <div>
          <h4 class="text-lg font-semibold mb-2">30‑second example</h4>
          <pre class="code-block"><code>import dom from '@dmitrijkiltau/dom.js';

dom('#app').html('&lt;button class="btn"&gt;Click&lt;/button&gt;');

dom('.btn')
  .addClass('active')
  .on('click', (ev, el) => {
    dom(el).toggleClass('active');
  });</code></pre>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 border">
          <h4 class="text-lg font-semibold mb-2">What you get</h4>
          <ul class="text-gray-700 space-y-1">
            <li>• Chainable API for DOM traversal and manipulation</li>
            <li>• Template system with data binding</li>
            <li>• Forms, HTTP helpers, and animations</li>
            <li>• TypeScript types and plugin system</li>
          </ul>
        </div>

        <div>
          <h4 class="text-lg font-semibold mb-2">Next steps</h4>
          <ul class="text-gray-700 space-y-1">
            <li>• <a class="underline" href="#core-api">Core API</a> — selectors, chaining, traversal</li>
            <li>• <a class="underline" href="#templates">Templates</a> — render and bind HTML</li>
            <li>• <a class="underline" href="#forms">Forms</a> — submit and serialize</li>
            <li>• <a class="underline" href="#http">HTTP</a> — fetch helpers and responses</li>
            <li>• <a class="underline" href="#animation">Animation</a> — presets and Web Animations</li>
          </ul>
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

        <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
          <h4 class="text-lg font-medium text-blue-900">ESM imports</h4>
          <p class="text-sm text-blue-700 mt-1">Choose a pattern; one code block updates.</p>
          <div class="import-picker">
            <div class="import-tabs">
              <button class="import-tab" data-variant="full-esm">Full</button>
              <button class="import-tab" data-variant="core-esm">Core</button>
              <button class="import-tab" data-variant="modular-esm">Modular</button>
            </div>
            <pre class="code-block"><code class="language-javascript" data-import-code></code></pre>

            <pre class="hidden" data-variant="full-esm"><code data-no-highlight>import dom from '@dmitrijkiltau/dom.js';

// Everything included
dom('.elements').fadeIn(200);
await dom.http.get('/api/data');</code></pre>
            <pre class="hidden" data-variant="core-esm"><code data-no-highlight>import dom from '@dmitrijkiltau/dom.js/core';

// DOM + events only
dom('.elements').addClass('active').on('click', handler);</code></pre>
            <pre class="hidden" data-variant="modular-esm"><code data-no-highlight>import dom from '@dmitrijkiltau/dom.js/core';
import { http } from '@dmitrijkiltau/dom.js/http';
import { renderTemplate } from '@dmitrijkiltau/dom.js/template';

// Import only what you need
const res = await http.get('/api');
const el = renderTemplate('#template', data);</code></pre>
          </div>
        </div>

        
        <div>
          <h4 class="text-lg font-semibold mb-2">CDN Options</h4>
          <div class="import-picker">
            <div class="import-tabs">
              <button class="import-tab" data-variant="cdn-full">Full</button>
              <button class="import-tab" data-variant="cdn-core">Core</button>
              <button class="import-tab" data-variant="cdn-pinned">Pinned</button>
            </div>
            <pre class="code-block"><code class="language-javascript" data-import-code></code></pre>

            <pre class="hidden" data-variant="cdn-full"><code data-no-highlight>import dom from 'https://unpkg.com/@dmitrijkiltau/dom.js/dist/index.js';</code></pre>
            <pre class="hidden" data-variant="cdn-core"><code data-no-highlight>import dom from 'https://unpkg.com/@dmitrijkiltau/dom.js/dist/core.js';</code></pre>
            <pre class="hidden" data-variant="cdn-pinned"><code data-no-highlight>import dom from 'https://unpkg.com/@dmitrijkiltau/dom.js@1.5.1/dist/index.js';
// Core pinned:
// import dom from 'https://unpkg.com/@dmitrijkiltau/dom.js@1.5.1/dist/core.js';</code></pre>
          </div>
          
        </div>

        <div class="bg-gray-50 border-l-4 border-gray-400 p-4">
          <h4 class="text-lg font-medium text-gray-900">CommonJS (Node/CJS)</h4>
          <div class="import-picker">
            <div class="import-tabs">
              <button class="import-tab" data-variant="cjs-full">Full</button>
              <button class="import-tab" data-variant="cjs-modular">Modular</button>
            </div>
            <pre class="code-block"><code class="language-javascript" data-import-code></code></pre>

            <pre class="hidden" data-variant="cjs-full"><code data-no-highlight>// Full bundle
const dom = require('@dmitrijkiltau/dom.js');</code></pre>
            <pre class="hidden" data-variant="cjs-modular"><code data-no-highlight>// Modular subpath imports
const { http } = require('@dmitrijkiltau/dom.js/http');
const { renderTemplate } = require('@dmitrijkiltau/dom.js/template');</code></pre>
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
    id: 'layout-geometry',
    title: 'Layout & Geometry',
    content: `
      <p class="text-gray-700 mb-4">
        Measure element sizes and positions, control scroll offsets, and get bounding rectangles. These helpers mirror common jQuery-style APIs with modern, predictable behavior.
      </p>
      <div class="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-6">
        <div class="flex">
          <div class="ml-3">
            <h4 class="text-lg font-medium text-indigo-900 mb-2">Available Methods</h4>
            <ul class="text-indigo-800 space-y-1">
              <li>• <code class="bg-gray-200 px-1 rounded">.width([value])</code>, <code class="bg-gray-200 px-1 rounded">.height([value])</code></li>
              <li>• <code class="bg-gray-200 px-1 rounded">.innerWidth()</code>, <code class="bg-gray-200 px-1 rounded">.innerHeight()</code></li>
              <li>• <code class="bg-gray-200 px-1 rounded">.outerWidth([includeMargin])</code>, <code class="bg-gray-200 px-1 rounded">.outerHeight([includeMargin])</code></li>
              <li>• <code class="bg-gray-200 px-1 rounded">.offset()</code>, <code class="bg-gray-200 px-1 rounded">.position()</code>, <code class="bg-gray-200 px-1 rounded">.offsetParent()</code></li>
              <li>• <code class="bg-gray-200 px-1 rounded">.scrollTop([value])</code>, <code class="bg-gray-200 px-1 rounded">.scrollLeft([value])</code></li>
              <li>• <code class="bg-gray-200 px-1 rounded">.rect()</code> — wrapper around <code class="bg-gray-200 px-1 rounded">getBoundingClientRect()</code></li>
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
