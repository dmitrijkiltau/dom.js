import vk, { useTemplate, renderTemplate } from '../../dist/index.js';

const renderExample = useTemplate('#example-template');
const renderSubsection = useTemplate('#subsection-template');

export function addTemplateExamples() {
  const templateSection = vk('#templates');
  if (templateSection.length === 0) return;

  templateSection.append(renderSubsection({
    id: 'template-system-overview',
    title: 'Template System',
    content: `
      <p class="text-gray-700 mb-4">
        vanilla-kit provides a powerful template system with data binding using HTML template elements.
      </p>
    `
  }));

  const templateExample = renderExample({
    id: 'template-rendering-example',
    title: 'Template Rendering',
    description: 'Create reusable templates with data binding',
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
import { useTemplate, renderTemplate } from '@dmitrijkiltau/vanilla-kit';

// Create reusable render function
const renderItem = useTemplate('#template-demo-item');

// Render with data
const item = renderItem({
  name: 'Example Item',
  url: 'https://example.com',
  description: 'A sample description'
});

vk('#items-list').append(item);

// Or use renderTemplate directly
vk('#items-list').append(
  renderTemplate('#template-demo-item', { 
    name: 'Another Item', 
    url: '#',
    description: 'Another description'
  })
);`
  });

  templateSection.append(templateExample);

  // Add template demo functionality
  vk('#add-item').on('click', () => {
    const name = vk('#item-name').el().value;
    const url = vk('#item-url').el().value;
    const description = vk('#item-description').el().value;

    if (name.trim()) {
      const item = renderTemplate('#template-demo-item', {
        name,
        url: url || '#',
        description: description || 'No description provided'
      });

      vk('#items-list').append(item);

      // Clear inputs
      vk('#item-name').el().value = '';
      vk('#item-url').el().value = '';
      vk('#item-description').el().value = '';
    }
  });

  // Advanced template binding example
  const advancedExample = renderExample({
    id: 'advanced-template-binding-example',
    title: 'Advanced Data Binding',
    description: 'Complex templates with multiple binding types',
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
        <div class="border border-gray-300 rounded-lg p-4 bg-gray-100 shadow-sm" data-attr-class="statusClass">
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
  });

  templateSection.append(advancedExample);

  // Set today's date as default after the advanced example is in the DOM
  const today = new Date().toISOString().split('T')[0];
  const dateInput = vk('#card-date');
  if (dateInput.length > 0) {
    dateInput.el().value = today;
  }

  vk('#create-card').on('click', () => {
    const title = vk('#card-title').el().value;
    const status = vk('#card-status').el().value;
    const priority = vk('#card-priority').el().value;
    const content = vk('#card-content').el().value;
    const dueDate = vk('#card-date').el().value;

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

      vk('#cards-container').append(card);
    }
  });
}
