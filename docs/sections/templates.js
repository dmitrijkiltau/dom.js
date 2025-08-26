import dom, { useTemplate, renderTemplate } from '../../dist/index.js';
import { createTabbedExamples } from '../content.js';

const renderExample = useTemplate('#example-template');
const renderSubsection = useTemplate('#subsection-template');

export function addTemplateExamples() {
  const templateSection = dom('#templates');
  if (templateSection.length === 0) return;

  templateSection.append(renderSubsection({
    id: 'template-system-overview',
    title: 'Template System',
    content: `
      <p class="text-gray-700 mb-4">
        dom.js provides a powerful template system with data binding using HTML template elements.
      </p>
    `
  }));

  // Create tabbed examples for Template functionality
  const templateTabbedExamples = createTabbedExamples({
    id: 'template-examples-tabs',
    title: 'Template System Examples',
    description: 'Explore different template features with interactive examples',
    tabs: [
      {
        id: 'basic-rendering',
        title: 'Basic Rendering',
        demo: `
          <div class="space-y-4">
            <div class="space-y-2">
              <input id="item-name" placeholder="Item name" class="input" value="Example Item">
              <input id="item-url" placeholder="Item URL" class="input" value="https://example.com">
              <input id="item-description" placeholder="Description" class="input" value="A sample description">
              <button id="add-item" class="btn btn-primary">Add Item</button>
            </div>
            <div id="items-list" class="space-y-2"></div>
          </div>
        `,
        code: `// Template with data bindings
<template id="template-demo-item">
  <div class="p-3 bg-blue-50 border border-blue-200 rounded mb-2">
    <h5 class="font-semibold text-blue-900" data-text="name"></h5>
    <p class="text-sm text-blue-700" data-text="description"></p>
    <a data-attr-href="url" data-text="url" class="text-blue-600 hover:text-blue-800 text-sm underline" target="_blank"></a>
  </div>
</template>

// JavaScript
import { useTemplate, renderTemplate } from '@dmitrijkiltau/dom.js';

// Create reusable render function
const renderItem = useTemplate('#template-demo-item');

// Render with data
const item = renderItem({
  name: 'Example Item',
  url: 'https://example.com',
  description: 'A sample description'
});

dom('#items-list').append(item);

// Or use renderTemplate directly
dom('#items-list').append(
  renderTemplate('#template-demo-item', { 
    name: 'Another Item', 
    url: '#',
    description: 'Another description'
  })
);`
      },
      {
        id: 'advanced-binding',
        title: 'Advanced Binding',
        demo: `
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Card Title</label>
                <input id="card-title" class="input" value="Sample Card">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Status</label>
                <select id="card-status" class="input">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Priority</label>
                <input id="card-priority" type="number" class="input" value="1" min="1" max="5">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Due Date</label>
                <input id="card-date" type="date" class="input">
              </div>
            </div>
            <textarea id="card-content" placeholder="Card content..." class="input" rows="3">This is sample card content with <strong>HTML</strong> support.</textarea>
            <button id="create-card" class="btn btn-primary">Create Card</button>
            <div id="cards-container" class="space-y-3"></div>
          </div>

          <template id="advanced-card-template">
            <div class="border border-gray-600 rounded-lg p-4 bg-gray-100 shadow-sm" data-attr-class="statusClass">
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-semibold" data-text="title"></h3>
                <span class="text-xs px-2 py-1 rounded" data-attr-class="statusBadge" data-text="status"></span>
              </div>
              <div class="text-gray-600 mb-3" data-html="content"></div>
              <div class="flex justify-between text-sm text-gray-500">
                <span>Priority: <span data-text="priority" class="font-medium"></span>/5</span>
                <span data-text="dueDate"></span>
              </div>
            </div>
          </template>
        `,
        code: `// Advanced template with conditional classes
<template id="advanced-card-template">
  <div class="border border-gray-300 rounded-lg p-4" data-attr-class="statusClass">
    <h3 class="text-lg font-semibold" data-text="title"></h3>
    <span data-attr-class="statusBadge" data-text="status"></span>
    <div data-html="content"></div>
    <span data-text="priority"></span>
    <span data-text="dueDate"></span>
  </div>
</template>

// JavaScript with computed properties
const renderCard = useTemplate('#advanced-card-template');

const card = renderCard({
  title: 'Sample Card',
  status: 'active',
  content: 'Card <strong>content</strong>',
  priority: 3,
  dueDate: '2024-12-31',
  
  // Computed properties for styling
  statusClass: status === 'active' ? 'border-green-200 bg-green-50' : 
               status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
               'border-gray-200 bg-gray-50',
               
  statusBadge: status === 'active' ? 'bg-green-100 text-green-800' :
               status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
               'bg-gray-100 text-gray-800'
});`
      },
      {
        id: 'enhanced-features',
        title: 'Enhanced Features',
        demo: `
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <h5 class="font-medium mb-2">Control Variables</h5>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" id="show-header" class="mr-2" checked>
                    Show Header (data-if)
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" id="show-content" class="mr-2" checked>
                    Show Content (data-show)
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" id="hide-footer" class="mr-2">
                    Hide Footer (data-hide)
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" id="enable-actions" class="mr-2" checked>
                    Enable Actions (event binding)
                  </label>
                </div>
              </div>
              <div>
                <h5 class="font-medium mb-2">Template Data</h5>
                <div class="space-y-2">
                  <input id="demo-title" class="input text-sm" value="Dynamic Title" placeholder="Title">
                  <input id="demo-message" class="input text-sm" value="This content can be shown/hidden dynamically!" placeholder="Message">
                  <select id="demo-theme" class="input text-sm">
                    <option value="primary">Primary Theme</option>
                    <option value="success">Success Theme</option>
                    <option value="warning">Warning Theme</option>
                  </select>
                </div>
              </div>
            </div>
            
            <button id="render-enhanced-template" class="btn btn-primary">Render Template</button>
            
            <div id="enhanced-template-container" class="border border-gray-300 rounded p-4 bg-gray-50 min-h-[200px]"></div>
            
            <div id="enhanced-template-log" class="text-sm text-gray-600 bg-gray-100 p-3 rounded max-h-32 overflow-y-auto"></div>
          </div>

          <template id="enhanced-demo-template">
            <div class="p-4 rounded-lg" data-attr-class="themeClass">
              <header data-if="showHeader" class="mb-4 pb-2 border-b border-gray-300">
                <h3 class="text-xl font-bold" data-text="title"></h3>
                <p class="text-sm text-gray-600">This header is conditionally rendered with data-if</p>
              </header>
              
              <main data-show="showContent" class="mb-4">
                <p data-text="message" class="text-gray-700 mb-3"></p>
                <div class="flex space-x-2">
                  <button data-on-click="handlePrimaryAction" class="btn btn-primary text-sm" data-if="enableActions">
                    Primary Action
                  </button>
                  <button data-on-click="handleSecondaryAction" class="btn btn-secondary text-sm" data-if="enableActions">
                    Secondary Action
                  </button>
                </div>
              </main>
              
              <footer data-hide="hideFooter" class="pt-2 border-t border-gray-300 text-xs text-gray-500">
                <p>Footer text - hidden when hideFooter is true</p>
                <button data-on-click="handleFooterClick" class="text-blue-600 hover:text-blue-800 underline" data-if="enableActions">
                  Footer Action
                </button>
              </footer>
            </div>
          </template>
        `,
        code: `// Enhanced template with conditional rendering and events
<template id="enhanced-demo-template">
  <div data-attr-class="themeClass">
    <!-- Conditional element (removed if false) -->
    <header data-if="showHeader">
      <h3 data-text="title"></h3>
    </header>
    
    <!-- Show/hide with display style -->
    <main data-show="showContent">
      <p data-text="message"></p>
      <!-- Event binding -->
      <button data-on-click="handleAction">Click Me</button>
    </main>
    
    <!-- Hide when condition is true -->
    <footer data-hide="hideFooter">
      Footer content
    </footer>
  </div>
</template>

// Render with data including event handlers
const templateData = {
  showHeader: true,
  showContent: true,
  hideFooter: false,
  title: 'Dynamic Title',
  message: 'Content message',
  themeClass: 'bg-blue-50 border-blue-200',
  
  // Event handlers
  handleAction: (event) => {
    console.log('Button clicked!', event);
  }
};

const element = renderTemplate('#enhanced-demo-template', templateData);`
      },
      {
        id: 'modular-usage',
        title: 'Modular Usage',
        demo: `
          <div class="space-y-4">
            <div class="bg-purple-50 border border-purple-200 rounded p-4">
              <h5 class="font-medium text-purple-800 mb-2">📦 Bundle Size Comparison</h5>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Full Bundle:</strong><br>
                  <code class="text-xs">import dom, { renderTemplate } from '@dmitrijkiltau/dom.js';</code><br>
                  <span class="text-gray-600">~13KB total</span>
                </div>
                <div>
                  <strong>Templates Only:</strong><br>
                  <code class="text-xs">import { renderTemplate } from '@dmitrijkiltau/dom.js/template';</code><br>
                  <span class="text-green-700 font-semibold">~130B + chunks</span>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-100 p-4 rounded">
              <h5 class="font-medium mb-2">Template Usage (Works Same Way)</h5>
              <p class="text-sm text-gray-600 mb-3">
                Whether you use full bundle or modular imports, the template API remains identical:
              </p>
              <div class="space-y-2">
                <input id="modular-item-title" placeholder="Item title" class="input text-sm" value="Modular Example">
                <button id="render-modular-item" class="btn btn-primary text-sm">Render with Template</button>
              </div>
              <div id="modular-items-container" class="mt-3 space-y-2"></div>
            </div>
          </div>

          <template id="modular-item-template">
            <div class="p-3 bg-indigo-50 border border-indigo-200 rounded">
              <h6 class="font-medium text-indigo-900" data-text="title"></h6>
              <p class="text-sm text-indigo-700">
                Created with <span data-text="importType"></span> 
                (Bundle size: <span data-text="bundleSize" class="font-mono"></span>)
              </p>
            </div>
          </template>
        `,
        code: `// Option 1: Full Bundle Import
import dom, { renderTemplate, useTemplate } from '@dmitrijkiltau/dom.js';

// Option 2: Modular Import (Much Smaller!)  
import { renderTemplate, useTemplate } from '@dmitrijkiltau/dom.js/template';
// + import dom from '@dmitrijkiltau/dom.js/core'; // if you need DOM manipulation

// Usage is identical regardless of import method:
const template = useTemplate('#my-template');

const element = renderTemplate('#my-template', {
  title: 'My Title',
  message: 'Template content',
  // Event handlers work the same
  onClick: (event) => console.log('Clicked!')
});

// If using modular imports with core:
import dom from '@dmitrijkiltau/dom.js/core';
import { renderTemplate } from '@dmitrijkiltau/dom.js/template';

dom('#container').append(
  renderTemplate('#template', data)
);`
      }
    ]
  });

  templateSection.append(templateTabbedExamples);

  // Event handlers for Basic Rendering tab
  dom('#add-item').on('click', () => {
    const name = dom('#item-name').el().value;
    const url = dom('#item-url').el().value;
    const description = dom('#item-description').el().value;

    if (name.trim()) {
      const item = renderTemplate('#template-demo-item', {
        name,
        url: url || '#',
        description: description || 'No description provided'
      });

      dom('#items-list').append(item);

      // Clear inputs
      dom('#item-name').el().value = '';
      dom('#item-url').el().value = '';
      dom('#item-description').el().value = '';
    }
  });

  // Event handlers for Advanced Binding tab
  // Set today's date as default after the advanced example is in the DOM
  setTimeout(() => {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = dom('#card-date');
    if (dateInput.length > 0) {
      dateInput.el().value = today;
    }
  }, 100);

  dom('#create-card').on('click', () => {
    const title = dom('#card-title').el().value;
    const status = dom('#card-status').el().value;
    const priority = dom('#card-priority').el().value;
    const content = dom('#card-content').el().value;
    const dueDate = dom('#card-date').el().value;

    if (title.trim()) {
      const statusClasses = {
        active: 'p-4 rounded-lg border-green-200 bg-green-50',
        pending: 'p-4 rounded-lg border-yellow-200 bg-yellow-50',
        inactive: 'p-4 rounded-lg border-gray-200 bg-gray-50'
      };

      const statusBadges = {
        active: 'py-1 px-3 text-sm rounded-lg bg-green-100 text-green-800',
        pending: 'py-1 px-3 text-sm rounded-lg bg-yellow-100 text-yellow-800',
        inactive: 'py-1 px-3 text-sm rounded-lg bg-gray-100 text-gray-800'
      };

      const card = renderTemplate('#advanced-card-template', {
        title,
        status: status.charAt(0).toUpperCase() + status.slice(1),
        content: content || 'No content provided',
        priority,
        dueDate: dueDate || 'No due date',
        statusClass: statusClasses[status],
        statusBadge: statusBadges[status]
      });

      dom('#cards-container').append(card);
    }
  });

  // Event handlers for Enhanced Features tab
  function logTemplateEvent(message) {
    const log = dom('#enhanced-template-log');
    const timestamp = new Date().toLocaleTimeString();
    log.append(`<div>[${timestamp}] ${message}</div>`);
    log.el().scrollTop = log.el().scrollHeight;
  }

  dom('#render-enhanced-template').on('click', () => {
    const showHeader = dom('#show-header').prop('checked');
    const showContent = dom('#show-content').prop('checked');
    const hideFooter = dom('#hide-footer').prop('checked');
    const enableActions = dom('#enable-actions').prop('checked');
    const title = dom('#demo-title').val();
    const message = dom('#demo-message').val();
    const theme = dom('#demo-theme').val();

    const themeClasses = {
      primary: 'bg-blue-50 border-blue-200 border-2',
      success: 'bg-green-50 border-green-200 border-2',
      warning: 'bg-yellow-50 border-yellow-200 border-2'
    };

    const templateData = {
      showHeader,
      showContent,
      hideFooter,
      enableActions,
      title,
      message,
      themeClass: themeClasses[theme],
      
      // Event handlers
      handlePrimaryAction: (event) => {
        logTemplateEvent('Primary action clicked!');
        event.target.classList.add('animate-pulse');
        setTimeout(() => event.target.classList.remove('animate-pulse'), 1000);
      },
      handleSecondaryAction: (event) => {
        logTemplateEvent('Secondary action clicked!');
        event.target.style.transform = 'scale(0.95)';
        setTimeout(() => event.target.style.transform = '', 200);
      },
      handleFooterClick: (event) => {
        logTemplateEvent('Footer action clicked!');
        event.target.textContent = event.target.textContent === 'Footer Action' ? 'Clicked!' : 'Footer Action';
      }
    };

    const renderedTemplate = renderTemplate('#enhanced-demo-template', templateData);
    dom('#enhanced-template-container').empty().append(renderedTemplate);
    
    logTemplateEvent(`Template rendered with: header=${showHeader}, content=${showContent}, hideFooter=${hideFooter}, actions=${enableActions}`);
  });

  // Initial render for Enhanced Features tab
  setTimeout(() => {
    dom('#render-enhanced-template').click();
  }, 100);

  // Event handlers for Modular Usage tab
  dom('#render-modular-item').on('click', () => {
    const title = dom('#modular-item-title').val();
    if (title.trim()) {
      const item = renderTemplate('#modular-item-template', {
        title: title,
        importType: 'modular imports',
        bundleSize: '~130B + chunks'
      });

      dom('#modular-items-container').append(item);
      dom('#modular-item-title').val('');
    }
  });
}
