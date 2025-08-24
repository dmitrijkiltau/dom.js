import vk, { renderTemplate, useTemplate, onSubmit, toQueryString, http, use } from '@dmitrijkiltau/vanilla-kit';

// Make vk globally available for console debugging
window.vk = vk;

// Navigation data
const navigationItems = [
  { title: 'Getting Started', href: '#getting-started' },
  { title: 'Installation', href: '#installation' },
  { title: 'Core API', href: '#core-api' },
  { title: 'Templates', href: '#templates' },
  { title: 'Forms', href: '#forms' },
  { title: 'Events', href: '#events' },
  { title: 'HTTP', href: '#http' },
  { title: 'Animation', href: '#animation' },
  { title: 'Plugin System', href: '#plugins' }
];

// Content sections data
const sections = [
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
    `
  },
  {
    id: 'templates',
    title: 'Templates',
    content: ``
  },
  {
    id: 'forms',
    title: 'Forms',
    content: ``
  },
  {
    id: 'events',
    title: 'Events',
    content: ``
  },
  {
    id: 'http',
    title: 'HTTP',
    content: ``
  },
  {
    id: 'animation',
    title: 'Animation',
    content: ``
  },
  {
    id: 'plugins',
    title: 'Plugin System',
    content: ``
  }
];

// Template renderers
const renderNavItem = useTemplate('#nav-item-template');
const renderSection = useTemplate('#section-template');
const renderSubsection = useTemplate('#subsection-template');
const renderExample = useTemplate('#example-template');

// Initialize navigation
function initNavigation() {
  const navMenu = vk('#nav-menu');
  navigationItems.forEach(item => {
    navMenu.append(renderNavItem(item));
  });

  // Handle navigation clicks
  vk('#nav-menu').on('click', 'a', (ev, el) => {
    ev.preventDefault();
    const href = el.getAttribute('href');
    const targetId = href.substring(1); // Remove #
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
      
      // Update active state
      vk('#nav-menu .nav-link').removeClass('active');
      vk(el).addClass('active');
    }
  });
}

// Initialize content sections
function initContent() {
  const content = vk('#content');
  
  sections.forEach(section => {
    content.append(renderSection(section));
  });
  
  // Add examples to specific sections
  addCoreApiExamples();
  addTemplateExamples();
  addFormExamples();
  addEventExamples();
  addHttpExamples();
  addAnimationExamples();
  addPluginExamples();
}

function addCoreApiExamples() {
  const coreSection = vk('#core-api');
  
  // Basic selector example
  const basicExample = renderExample({
    title: 'Basic Selection',
    description: 'Select elements using CSS selectors',
    demo: `
      <div class="space-y-2">
        <div class="example-elements">
          <button id="demo-btn-1" class="btn btn-primary">Button 1</button>
          <button id="demo-btn-2" class="btn btn-secondary">Button 2</button>
          <p class="demo-text">Some text</p>
        </div>
        <button id="select-demo" class="btn btn-primary">Try Selection</button>
      </div>
    `,
    code: `// Select by ID
vk('#demo-btn-1').addClass('highlighted');

// Select by class
vk('.demo-text').css('color', 'blue');

// Select multiple elements
vk('button').addClass('selected');

// Method chaining
vk('#demo-btn-2')
  .addClass('active')
  .css('background', '#10b981')
  .text('Updated!');`
  });
  
  coreSection.append(basicExample);
  
  // Add interactivity to the example
  vk('#select-demo').on('click', () => {
    vk('#demo-btn-1').toggleClass('bg-yellow-200');
    vk('.demo-text').css('color', vk('.demo-text').css('color') === 'rgb(59, 130, 246)' ? '' : 'rgb(59, 130, 246)');
    vk('#demo-btn-2').text(vk('#demo-btn-2').text() === 'Button 2' ? 'Updated!' : 'Button 2');
  });
  
  // Collection methods example
  const collectionExample = renderExample({
    title: 'VKCollection Methods',
    description: 'Chain methods for DOM manipulation',
    demo: `
      <div class="space-y-2">
        <div class="example-list">
          <div class="p-3 border rounded">Item 1</div>
          <div class="p-3 border rounded">Item 2</div>
          <div class="p-3 border rounded">Item 3</div>
        </div>
        <button id="collection-demo" class="btn btn-primary">Manipulate Collection</button>
      </div>
    `,
    code: `// Get collection
const items = vk('.example-list div');

// Chain operations
items
  .addClass('bg-blue-100')
  .css('border-color', '#3b82f6')
  .each((el, idx) => {
    vk(el).text(\`Updated Item \${idx + 1}\`);
  });

// Access individual elements
const firstItem = items.el(); // First element
const allElements = items.elements; // Array of all elements`
  });
  
  coreSection.append(collectionExample);
  
  vk('#collection-demo').on('click', () => {
    const items = vk('.example-list div');
    if (items.hasClass('bg-blue-100')) {
      items.removeClass('bg-blue-100').css('border-color', '').text((el, idx) => `Item ${idx + 1}`);
    } else {
      items.addClass('bg-blue-100').css('border-color', '#3b82f6').text((el, idx) => `Updated Item ${idx + 1}`);
    }
  });
}

function addTemplateExamples() {
  const templateSection = vk('#templates');
  if (templateSection.length === 0) return;
  
  templateSection.append(renderSubsection({
    title: 'Template System',
    content: `
      <p class="text-gray-700 mb-4">
        vanilla-kit provides a powerful template system with data binding using HTML template elements.
      </p>
    `
  }));
  
  const templateExample = renderExample({
    title: 'Template Rendering',
    description: 'Create reusable templates with data binding',
    demo: `
      <div class="space-y-4">
        <div class="space-y-2">
          <input id="item-name" placeholder="Item name" class="input" value="Example Item">
          <input id="item-url" placeholder="Item URL" class="input" value="https://example.com">
          <button id="add-item" class="btn btn-primary">Add Item</button>
        </div>
        <div id="items-list" class="space-y-2"></div>
      </div>
    `,
    code: `// Template with data bindings
<template id="template-demo-item">
  <div class="p-3 bg-blue-50 border border-blue-200 rounded mb-2">
    <h5 class="font-semibold text-blue-900" data-text="name"></h5>
    <a data-attr-href="url" data-text="url" class="text-blue-600 hover:text-blue-800 text-sm underline"></a>
  </div>
</template>

// JavaScript
import { useTemplate, renderTemplate } from '@dmitrijkiltau/vanilla-kit';

// Create reusable render function
const renderItem = useTemplate('#template-demo-item');

// Render with data
const item = renderItem({
  name: 'Example Item',
  url: 'https://example.com'
});

vk('#items-list').append(item);

// Or use renderTemplate directly
vk('#items-list').append(
  renderTemplate('#template-demo-item', { name: 'Another Item', url: '#' })
);`
  });
  
  templateSection.append(templateExample);
  
  // Add template demo functionality
  vk('#add-item').on('click', () => {
    const name = vk('#item-name').el().value;
    const url = vk('#item-url').el().value;
    
    if (name && url) {
      const item = renderTemplate('#template-demo-item', {
        name: name,
        description: 'Added via template rendering',
        url: url
      });
      
      vk('#items-list').append(item);
      vk('#item-name').el().value = '';
      vk('#item-url').el().value = '';
    }
  });
}

function addFormExamples() {
  const formSection = vk('#forms');
  if (formSection.length === 0) return;
  
  formSection.append(renderSubsection({
    title: 'Form Utilities',
    content: `
      <p class="text-gray-700 mb-4">
        Handle forms with automatic serialization and submission helpers.
      </p>
    `
  }));
  
  const formExample = renderExample({
    title: 'Form Handling',
    description: 'Serialize forms and handle submissions',
    demo: `
      <form id="demo-form" class="space-y-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input name="name" class="input" value="John Doe">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input name="email" type="email" class="input" value="john@example.com">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <select name="tags" multiple class="input" size="3">
            <option value="javascript">JavaScript</option>
            <option value="html" selected>HTML</option>
            <option value="css" selected>CSS</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
      </form>
      <div id="form-results"></div>
    `,
    code: `import { onSubmit, serializeForm, toQueryString } from '@dmitrijkiltau/vanilla-kit';

// Handle form submission
onSubmit('#demo-form', async (data, event) => {
  console.log('Form data:', data);
  console.log('Query string:', toQueryString(data));
  
  // Send to server
  try {
    const response = await http.post('/api/submit', data);
    console.log('Response:', await response.json());
  } catch (error) {
    console.error('Error:', error);
  }
});

// Manual form serialization
const form = vk('#demo-form').el();
const data = serializeForm(form);
console.log(data); // { name: 'John Doe', email: 'john@example.com', tags: ['html', 'css'] }`
  });
  
  formSection.append(formExample);
  
  // Add form demo functionality
  onSubmit('#demo-form', async (data, event) => {
    const resultHtml = renderTemplate('#form-result-template', {
      result: JSON.stringify({ 
        formData: data, 
        queryString: toQueryString(data)
      }, null, 2)
    });
    
    vk('#form-results').html('').append(resultHtml);
  });
}

function addEventExamples() {
  const eventSection = vk('#events');
  if (eventSection.length === 0) return;
  
  eventSection.append(renderSubsection({
    title: 'Event Handling',
    content: `
      <p class="text-gray-700 mb-4">
        Handle events with support for delegation and multiple targets.
      </p>
    `
  }));
  
  const eventExample = renderExample({
    title: 'Event Handling',
    description: 'Bind events to elements with delegation support',
    demo: `
      <div class="space-y-4">
        <div class="space-x-2">
          <button id="add-button" class="btn btn-primary">Add Button</button>
          <button id="clear-buttons" class="btn btn-secondary">Clear All</button>
        </div>
        <div id="button-container" class="space-y-2 p-4 border rounded min-h-[100px] bg-gray-50"></div>
        <div id="event-log" class="text-sm text-gray-600 max-h-24 overflow-y-auto"></div>
      </div>
    `,
    code: `import { on, off } from '@dmitrijkiltau/vanilla-kit';

// Direct event binding
vk('#add-button').on('click', () => {
  console.log('Button clicked!');
});

// Event delegation - handle events on dynamically created elements
vk('#button-container').on('click', 'button', (ev, el, idx) => {
  console.log(\`Dynamic button \${idx} clicked\`);
  vk(el).toggleClass('bg-green-200');
});

// Multiple event types
vk('#button-container').on('mouseenter mouseleave', 'button', (ev, el) => {
  vk(el).toggleClass('shadow-lg');
});

// Remove events
vk(element).off('click', handler);`
  });
  
  eventSection.append(eventExample);
  
  // Add event demo functionality
  let buttonCount = 0;
  
  vk('#add-button').on('click', () => {
    buttonCount++;
    const button = vk.create('button', 
      { class: 'btn btn-secondary transition-all duration-200' }, 
      `Dynamic Button ${buttonCount}`
    );
    vk('#button-container').append(button);
    
    // Log the event
    const logEntry = vk.create('div', null, `Added button ${buttonCount}`);
    vk('#event-log').append(logEntry);
  });
  
  vk('#clear-buttons').on('click', () => {
    vk('#button-container').html('');
    vk('#event-log').html('');
    buttonCount = 0;
  });
  
  // Event delegation for dynamic buttons
  vk('#button-container').on('click', 'button', (ev, el, idx) => {
    vk(el).toggleClass('bg-green-200');
    const logEntry = vk.create('div', null, `Clicked dynamic button: ${vk(el).text()}`);
    vk('#event-log').append(logEntry);
  });
  
  vk('#button-container').on('mouseenter', 'button', (ev, el) => {
    vk(el).addClass('shadow-lg scale-105');
  });
  
  vk('#button-container').on('mouseleave', 'button', (ev, el) => {
    vk(el).removeClass('shadow-lg scale-105');
  });
}

function addHttpExamples() {
  const httpSection = vk('#http');
  if (httpSection.length === 0) return;
  
  httpSection.append(renderSubsection({
    title: 'HTTP Utilities',
    content: `
      <p class="text-gray-700 mb-4">
        Make HTTP requests with a simple, promise-based API.
      </p>
    `
  }));
  
  const httpExample = renderExample({
    title: 'HTTP Requests',
    description: 'Fetch data and handle responses',
    demo: `
      <div class="space-y-4">
        <div class="space-x-2">
          <button id="fetch-data" class="btn btn-primary">Fetch JSONPlaceholder Data</button>
          <button id="post-data" class="btn btn-secondary">Post Data (Demo)</button>
        </div>
        <div id="http-results" class="p-4 bg-gray-50 border rounded min-h-[100px] overflow-auto"></div>
      </div>
    `,
    code: `import { http } from '@dmitrijkiltau/vanilla-kit';

// GET request
try {
  const response = await http.get('https://jsonplaceholder.typicode.com/posts/1');
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error('Error:', error);
}

// POST request
const postData = { title: 'New Post', body: 'Content', userId: 1 };
try {
  const response = await http.post('/api/posts', postData);
  const result = await response.json();
  console.log(result);
} catch (error) {
  console.error('Error:', error);
}

// Other methods
await http.put('/api/posts/1', updateData);
await http.patch('/api/posts/1', partialData);
await http.delete('/api/posts/1');

// Response helpers
const response = await http.get('/api/data');
console.log(response.ok);       // boolean
console.log(response.status);   // number
const text = await response.text();
const json = await response.json();
const html = await response.html();`
  });
  
  httpSection.append(httpExample);
  
  // Add HTTP demo functionality
  vk('#fetch-data').on('click', async () => {
    vk('#http-results').html('<p class="text-gray-500">Loading...</p>');
    
    try {
      const response = await http.get('https://jsonplaceholder.typicode.com/posts/1');
      const data = await response.json();
      
      vk('#http-results').html(`
        <div class="space-y-2">
          <h4 class="font-semibold text-green-700">✓ Successfully fetched data:</h4>
          <pre class="text-sm bg-white p-3 rounded border overflow-auto">${JSON.stringify(data, null, 2)}</pre>
        </div>
      `);
    } catch (error) {
      vk('#http-results').html(`
        <div class="text-red-600">
          <h4 class="font-semibold">✗ Error:</h4>
          <p>${error.message}</p>
        </div>
      `);
    }
  });
  
  vk('#post-data').on('click', async () => {
    vk('#http-results').html('<p class="text-gray-500">Posting data...</p>');
    
    const postData = { 
      title: 'Test Post from vanilla-kit', 
      body: 'This is a demo post', 
      userId: 1 
    };
    
    try {
      const response = await http.post('https://jsonplaceholder.typicode.com/posts', postData);
      const result = await response.json();
      
      vk('#http-results').html(`
        <div class="space-y-2">
          <h4 class="font-semibold text-green-700">✓ Successfully posted data:</h4>
          <div class="text-sm">
            <p><strong>Status:</strong> ${response.status}</p>
            <p><strong>Response:</strong></p>
            <pre class="bg-white p-3 rounded border overflow-auto">${JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      `);
    } catch (error) {
      vk('#http-results').html(`
        <div class="text-red-600">
          <h4 class="font-semibold">✗ Error:</h4>
          <p>${error.message}</p>
        </div>
      `);
    }
  });
}

function addAnimationExamples() {
  const animationSection = vk('#animation');
  if (animationSection.length === 0) return;
  
  animationSection.append(renderSubsection({
    title: 'Animation',
    content: `
      <p class="text-gray-700 mb-4">
        Animate elements using the Web Animations API with a simple interface.
      </p>
    `
  }));
  
  const animationExample = renderExample({
    title: 'Element Animation',
    description: 'Animate elements with keyframes and options',
    demo: `
      <div class="space-y-4">
        <div class="space-x-2">
          <button id="fade-demo" class="btn btn-primary">Fade In/Out</button>
          <button id="slide-demo" class="btn btn-primary">Slide Animation</button>
          <button id="bounce-demo" class="btn btn-primary">Bounce Effect</button>
        </div>
        <div class="flex space-x-4">
          <div id="animation-target" class="w-20 h-20 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
            Box
          </div>
          <div id="message-container" class="flex-1"></div>
        </div>
      </div>
    `,
    code: `// Fade animation
vk('#animation-target').animate(
  [
    { opacity: 1 },
    { opacity: 0 },
    { opacity: 1 }
  ],
  {
    duration: 600,
    easing: 'ease-in-out'
  }
);

// Slide and transform
vk('#animation-target').animate(
  [
    { transform: 'translateX(0) scale(1)' },
    { transform: 'translateX(100px) scale(1.2)' },
    { transform: 'translateX(0) scale(1)' }
  ],
  { duration: 800, easing: 'cubic-bezier(0.4, 0.1, 0.2, 1)' }
);

// Chain animations
vk('#element')
  .animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 })
  .then(() => {
    // Animation completed
    console.log('Animation finished!');
  });`
  });
  
  animationSection.append(animationExample);
  
  // Add animation demo functionality
  vk('#fade-demo').on('click', () => {
    vk('#animation-target').animate(
      [{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }],
      { duration: 600, easing: 'ease-in-out' }
    );
    
    const message = renderTemplate('#message-template', { text: 'Fade animation triggered!' });
    vk('#message-container').append(message);
    setTimeout(() => message.remove(), 2000);
  });
  
  vk('#slide-demo').on('click', () => {
    vk('#animation-target').animate(
      [
        { transform: 'translateX(0) scale(1)', backgroundColor: '#3b82f6' },
        { transform: 'translateX(100px) scale(1.2)', backgroundColor: '#10b981' },
        { transform: 'translateX(0) scale(1)', backgroundColor: '#3b82f6' }
      ],
      { duration: 800, easing: 'cubic-bezier(0.4, 0.1, 0.2, 1)' }
    );
    
    const message = renderTemplate('#message-template', { text: 'Slide animation with color change!' });
    vk('#message-container').append(message);
    setTimeout(() => message.remove(), 2000);
  });
  
  vk('#bounce-demo').on('click', () => {
    vk('#animation-target').animate(
      [
        { transform: 'translateY(0)' },
        { transform: 'translateY(-20px)' },
        { transform: 'translateY(0)' },
        { transform: 'translateY(-10px)' },
        { transform: 'translateY(0)' }
      ],
      { duration: 600, easing: 'ease-out' }
    );
    
    const message = renderTemplate('#message-template', { text: 'Bounce animation complete!' });
    vk('#message-container').append(message);
    setTimeout(() => message.remove(), 2000);
  });
}

function addPluginExamples() {
  const pluginSection = vk('#plugins');
  if (pluginSection.length === 0) return;
  
  pluginSection.append(renderSubsection({
    title: 'Plugin System',
    content: `
      <p class="text-gray-700 mb-4">
        Extend vanilla-kit with custom functionality using the plugin system.
      </p>
    `
  }));
  
  const pluginExample = renderExample({
    title: 'Custom Plugins',
    description: 'Create reusable functionality with plugins',
    demo: `
      <div class="space-y-4">
        <div class="space-x-2">
          <button id="flash-demo" class="btn btn-primary">Flash Effect Plugin</button>
          <button id="typewriter-demo" class="btn btn-primary">Typewriter Plugin</button>
        </div>
        <div id="plugin-demo-area" class="p-4 bg-gray-50 border rounded min-h-[100px]">
          <div id="flash-target" class="p-3 bg-blue-100 border border-blue-300 rounded mb-2">
            This element will flash when you click the button above
          </div>
          <div id="typewriter-target" class="p-3 bg-green-100 border border-green-300 rounded">
            Original text that will be replaced by typewriter effect
          </div>
        </div>
      </div>
    `,
    code: `import { use } from '@dmitrijkiltau/vanilla-kit';

// Define a flash plugin
use((api) => {
  api.flash = function(selector, options = {}) {
    const { duration = 300, iterations = 3 } = options;
    
    return this(selector).animate(
      [{ opacity: 1 }, { opacity: 0.3 }, { opacity: 1 }],
      { duration: duration / iterations, iterations }
    );
  };
});

// Define a typewriter plugin
use((api) => {
  api.typewriter = function(selector, text, options = {}) {
    const { speed = 50, cursor = '|' } = options;
    const element = this(selector).el();
    
    if (!element) return this;
    
    let i = 0;
    element.textContent = '';
    
    const type = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    };
    
    type();
    return this;
  };
});

// Use the plugins
vk.flash('#flash-target', { duration: 600, iterations: 2 });
vk.typewriter('#typewriter-target', 'Hello from vanilla-kit!', { speed: 80 });`
  });
  
  pluginSection.append(pluginExample);
  
  // Create the plugins
  use((api) => {
    api.flash = function(selector, options = {}) {
      const { duration = 300, iterations = 3 } = options;
      
      return this(selector).animate(
        [{ opacity: 1 }, { opacity: 0.3 }, { opacity: 1 }],
        { duration: duration / iterations, iterations }
      );
    };
  });
  
  use((api) => {
    api.typewriter = function(selector, text, options = {}) {
      const { speed = 50 } = options;
      const element = this(selector).el();
      
      if (!element) return this;
      
      let i = 0;
      element.textContent = '';
      
      const type = () => {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          setTimeout(type, speed);
        }
      };
      
      type();
      return this;
    };
  });
  
  // Add plugin demo functionality
  vk('#flash-demo').on('click', () => {
    vk.flash('#flash-target', { duration: 600, iterations: 2 });
  });
  
  vk('#typewriter-demo').on('click', () => {
    const messages = [
      'Hello from vanilla-kit!',
      'This is a typewriter effect!',
      'Plugins make extension easy!',
      'Build amazing things!'
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    vk.typewriter('#typewriter-target', randomMessage, { speed: 60 });
  });
}

// Initialize the documentation
function init() {
  initNavigation();
  initContent();
  
  // Smooth scrolling for internal links
  vk(document).on('click', 'a[href^="#"]', (ev, el) => {
    ev.preventDefault();
    const targetId = el.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  });
  
  // Update active navigation on scroll
  let ticking = false;
  function updateActiveNav() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const sections = navigationItems.map(item => ({
          id: item.href.substring(1),
          element: document.getElementById(item.href.substring(1))
        })).filter(section => section.element);
        
        let activeSection = sections[0];
        const scrollPosition = window.scrollY + 100;
        
        for (const section of sections) {
          if (section.element.offsetTop <= scrollPosition) {
            activeSection = section;
          }
        }
        
        vk('#nav-menu .nav-link').removeClass('active');
        vk(`#nav-menu a[href="#${activeSection.id}"]`).addClass('active');
        
        ticking = false;
      });
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav(); // Initial call
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}