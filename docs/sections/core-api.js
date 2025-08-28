import dom, { useTemplate } from '../../dist/index.js';
import { createTabbedExamples } from '../content.js';

const renderExample = useTemplate('#example-template');

export function addCoreApiExamples() {
  const coreSection = dom('#core-api');

  // Create tabbed examples for Core API functionality
  const coreApiTabbedExamples = createTabbedExamples({
    id: 'core-api-examples-tabs',
    title: 'Core API Examples',
    description: 'Explore different aspects of the Core API with interactive examples',
    tabs: [
      {
        id: 'selection-basics',
        title: 'Selection & Chaining',
        demo: `
          <div class="space-y-4">
            <div class="space-y-2">
              <div class="example-elements">
                <button id="demo-btn-1" class="btn btn-primary">Button 1</button>
                <button id="demo-btn-2" class="btn btn-secondary">Button 2</button>
                <p class="demo-text">Some text</p>
              </div>
              <button id="select-demo" class="btn btn-primary">Try Selection</button>
            </div>
            <div class="space-y-2">
              <h5 class="font-medium">Collection Methods</h5>
              <div class="example-list space-y-2">
                <div class="p-3 border border-gray-300 rounded">Item 1</div>
                <div class="p-3 border border-gray-300 rounded">Item 2</div>
                <div class="p-3 border border-gray-300 rounded">Item 3</div>
              </div>
              <button id="collection-demo" class="btn btn-primary">Manipulate Collection</button>
            </div>
            <div class="space-y-2">
              <h5 class="font-medium">Class Replacement</h5>
              <div class="class-demo-element p-3 border border-gray-300 rounded bg-red-100 text-red-700">
                Element with red background
              </div>
              <div class="flex space-x-2">
                <button id="replace-blue" class="btn btn-primary text-sm">Replace with Blue</button>
                <button id="replace-green" class="btn btn-secondary text-sm">Replace with Green</button>
                <button id="replace-multi" class="btn btn-outline text-sm">Replace with Multiple</button>
              </div>
            </div>
          </div>
        `,
        code: `// Select by ID
dom('#demo-btn-1').addClass('highlighted');

// Select by class
dom('.demo-text').css('color', 'blue');

// Select multiple elements
dom('button').addClass('selected');

// Method chaining
dom('#demo-btn-2')
  .addClass('active')
  .css('background', '#10b981')
  .text('Updated!');

// Collection operations
const items = dom('.example-list div');
items
  .addClass('bg-blue-100')
  .css('border-color', '#3b82f6')
  .each((el, idx) => {
    dom(el).text(\`Updated Item \${idx + 1}\`);
  });

// Replace specific classes with new ones
dom('.class-demo-element')
  .replaceClass('bg-red-100', 'bg-blue-100');

// Replace multiple classes
dom('.class-demo-element')
  .replaceClass('bg-red-100 text-red-800', 'bg-green-100 text-green-800');`
      },
      {
        id: 'element-access',
        title: 'Element Access',
        demo: `
          <div class="space-y-2">
            <div class="access-examples">
              <span class="p-2 bg-gray-100 rounded mr-2">Element A</span>
              <span class="p-2 bg-gray-100 rounded mr-2">Element B</span>
              <span class="p-2 bg-gray-100 rounded">Element C</span>
            </div>
            <button id="access-demo" class="btn btn-primary">Access Elements</button>
            <div id="access-output" class="text-sm text-gray-600"></div>
          </div>
        `,
        code: `// Get DOMCollection
const elements = dom('.access-examples span');

// Get first element
const first = elements.el(); // HTMLElement

// Get element by index
const second = elements.el(1);

// Get all elements as array
const all = elements.elements; // HTMLElement[]

// Get collection length
const count = elements.length;

console.log('First element:', first.textContent);
console.log('Total count:', count);`
      },
      {
        id: 'collection-methods',
        title: 'Collection Methods',
        demo: `
          <div class="space-y-4">
            <div class="flex space-x-2">
              <button id="last-demo" class="btn btn-primary text-sm">Get Last</button>
              <button id="filter-demo" class="btn btn-primary text-sm">Filter Active</button>
              <button id="clone-demo" class="btn btn-secondary text-sm">Clone Items</button>
              <button id="empty-demo" class="btn btn-secondary text-sm">Empty Content</button>
              <button id="remove-demo" class="btn btn-danger text-sm">Remove Items</button>
              <button id="reset-demo" class="btn btn-outline text-sm">Reset</button>
            </div>
            <div id="demo-items" class="space-y-2">
              <div class="demo-item p-3 border border-gray-300 rounded bg-gray-50">
                <h4 class="font-medium">Item 1</h4>
                <p>Content for first item</p>
              </div>
              <div class="demo-item p-3 border border-gray-300 rounded bg-gray-50 active">
                <h4 class="font-medium">Item 2 (Active)</h4>
                <p>Content for second item</p>
              </div>
              <div class="demo-item p-3 border border-gray-300 rounded bg-gray-50">
                <h4 class="font-medium">Item 3</h4>
                <p>Content for third item</p>
              </div>
              <div class="demo-item p-3 border border-gray-300 rounded bg-gray-50 active">
                <h4 class="font-medium">Item 4 (Active)</h4>
                <p>Content for fourth item</p>
              </div>
            </div>
            <div id="clone-area" class="border-t border-gray-200 pt-4"></div>
            <div id="methods-output" class="text-sm text-gray-600 bg-gray-100 p-3 rounded"></div>
          </div>
        `,
        code: `// Get last element in collection
const lastItem = dom('.demo-item').last();
lastItem.addClass('bg-yellow-200');

// Filter elements by selector or function
const activeItems = dom('.demo-item').filter('.active');
const evenItems = dom('.demo-item').filter((el, idx) => idx % 2 === 0);

// Clone elements (shallow or deep)
const clonedItems = dom('.demo-item').clone();
dom('#clone-area').append(clonedItems);

// Empty element contents
dom('.demo-item').empty();

// Remove elements from DOM
dom('.demo-item').remove();`
      },
      {
        id: 'traversal-methods',
        title: 'DOM Traversal',
        demo: `
          <div class="space-y-4">
            <div class="flex space-x-2">
              <button id="parent-demo" class="btn btn-primary text-sm">Get Parents</button>
              <button id="parents-demo" class="btn btn-primary text-sm">Get All Ancestors</button>
              <button id="siblings-demo" class="btn btn-secondary text-sm">Get Siblings</button>
              <button id="clear-traversal" class="btn btn-outline text-sm">Clear Highlights</button>
            </div>
            <div class="container p-4 border-2 border-gray-400 rounded">
              <div class="section p-3 border border-gray-300 rounded bg-gray-50">
                <div class="subsection p-2 border border-gray-200 rounded">
                  <span class="target bg-yellow-100 px-2 py-1 rounded font-medium">Target Element</span>
                  <span class="sibling bg-gray-200 px-2 py-1 rounded ml-2">Sibling 1</span>
                  <span class="sibling bg-gray-200 px-2 py-1 rounded ml-2">Sibling 2</span>
                </div>
                <div class="subsection p-2 border border-gray-200 rounded mt-2">
                  <span class="other bg-gray-200 px-2 py-1 rounded">Other Element</span>
                </div>
              </div>
            </div>
            <div id="traversal-output" class="text-sm text-gray-600 bg-gray-100 p-3 rounded"></div>
          </div>
        `,
        code: `// Get immediate parent elements
const parentElements = dom('.target').parent();
parentElements.addClass('highlighted');

// Get all ancestor elements (optionally filtered)
const allAncestors = dom('.target').parents();
const containerAncestors = dom('.target').parents('.container');

// Get sibling elements (optionally filtered)
const allSiblings = dom('.target').siblings();
const specificSiblings = dom('.target').siblings('.sibling');`
      },
      {
        id: 'forms-properties',
        title: 'Forms & Properties',
        demo: `
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Text Input</label>
                <input id="text-input" class="input" value="Hello World">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Number Input</label>
                <input id="number-input" type="number" class="input" value="42">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Select Options</label>
              <select id="select-input" class="input">
                <option value="option1">Option 1</option>
                <option value="option2" selected>Option 2</option>
                <option value="option3">Option 3</option>
              </select>
            </div>
            <div>
              <label class="flex items-center">
                <input id="checkbox-input" type="checkbox" class="mr-2" checked>
                Enable notifications
              </label>
            </div>
            <div class="flex space-x-2">
              <button id="get-values" class="btn btn-primary text-sm">Get Values</button>
              <button id="set-values" class="btn btn-secondary text-sm">Set New Values</button>
              <button id="set-attrs" class="btn btn-secondary text-sm">Set Attributes</button>
              <button id="serialize-form" class="btn btn-primary text-sm">Serialize All</button>
            </div>
            <div id="form-output" class="text-sm text-gray-600 bg-gray-100 p-3 rounded"></div>
          </div>
        `,
        code: `// Get/set form element values
const textValue = dom('#text-input').val();
dom('#text-input').val('New value');

// Get/set element properties
const isChecked = dom('#checkbox-input').prop('checked');
dom('#checkbox-input').prop('checked', true);

// Set multiple attributes at once
dom('#text-input').attrs({
  'data-id': '123',
  'placeholder': 'Enter text...',
  'maxlength': '50'
});

// Serialize form data from elements
const formData = dom('input, select').serialize();
console.log(formData);`
      },
      {
        id: 'positioning',
        title: 'Element Positioning',
        demo: `
          <div class="space-y-4">
            <div class="flex space-x-2">
              <button id="add-before" class="btn btn-primary text-sm">Add Before</button>
              <button id="add-after" class="btn btn-secondary text-sm">Add After</button>
              <button id="clear-additions" class="btn btn-outline text-sm">Clear All</button>
            </div>
            <div class="border border-gray-300 rounded p-4">
              <div id="target-element" class="p-3 bg-blue-100 border border-blue-300 rounded text-center font-medium">
                Target Element
              </div>
            </div>
            <div id="positioning-output" class="text-sm text-gray-600 bg-gray-100 p-3 rounded"></div>
          </div>
        `,
        code: `// Insert content after elements
dom('#target-element').after('<div class="after-element">Content after</div>');

// Insert content before elements
dom('#target-element').before('<div class="before-element">Content before</div>');

// Chain multiple insertions
dom('#target-element')
  .before('<p>First before</p>')
  .after('<p>First after</p>')
  .after('<p>Second after</p>');`
      }
    ]
  });

  coreSection.append(coreApiTabbedExamples);

  // Event handlers for Selection & Chaining tab
  dom('#select-demo').on('click', () => {
    dom('#demo-btn-1').toggleClass('bg-yellow-200');
    dom('.demo-text').css('color', dom('.demo-text').css('color') === 'rgb(59, 130, 246)' ? '' : 'rgb(59, 130, 246)');
    dom('#demo-btn-2').text(dom('#demo-btn-2').text() === 'Button 2' ? 'Updated!' : 'Button 2');
  });

  dom('#collection-demo').on('click', () => {
    const items = dom('.example-list div');
    if (items.hasClass('bg-blue-100')) {
      items.removeClass('bg-blue-100').css('border-color', '').each((el, idx) => {
        el.textContent = `Item ${idx + 1}`;
      });
    } else {
      items.addClass('bg-blue-100').css('border-color', '#3b82f6').each((el, idx) => {
        el.textContent = `Updated Item ${idx + 1}`;
      });
    }
  });

  // Event handlers for replaceClass demo
  dom('#replace-blue').on('click', () => {
    dom('.class-demo-element')
      .replaceClass('bg-red-100', 'bg-blue-100 text-blue-800')
      .html('Element with blue background');
  });

  dom('#replace-green').on('click', () => {
    dom('.class-demo-element')
      .replaceClass('bg-blue-100 text-blue-800', 'bg-green-100 text-green-800')
      .html('Element with green background');
  });

  dom('#replace-multi').on('click', () => {
    dom('.class-demo-element')
      .replaceClass('bg-green-100 text-green-800', 'bg-purple-100 text-purple-800 font-bold')
      .html('Element with multiple replaced classes!');
  });

  // Event handlers for Element Access tab
  dom('#access-demo').on('click', () => {
    const elements = dom('.access-examples span');
    const first = elements.el();
    const count = elements.length;
    
    dom('#access-output').html(`
      <div>First element: <strong>${first.textContent}</strong></div>
      <div>Total count: <strong>${count}</strong></div>
      <div>All elements: <strong>${elements.elements.map(el => el.textContent).join(', ')}</strong></div>
    `);
  });

  // Event handlers for Collection Methods tab
  const originalItems = `
    <div class="demo-item p-3 border border-gray-300 rounded bg-gray-50">
      <h4 class="font-medium">Item 1</h4>
      <p>Content for first item</p>
    </div>
    <div class="demo-item p-3 border border-gray-300 rounded bg-gray-50 active">
      <h4 class="font-medium">Item 2 (Active)</h4>
      <p>Content for second item</p>
    </div>
    <div class="demo-item p-3 border border-gray-300 rounded bg-gray-50">
      <h4 class="font-medium">Item 3</h4>
      <p>Content for third item</p>
    </div>
    <div class="demo-item p-3 border border-gray-300 rounded bg-gray-50 active">
      <h4 class="font-medium">Item 4 (Active)</h4>
      <p>Content for fourth item</p>
    </div>
  `;

  dom('#last-demo').on('click', () => {
    const lastItem = dom('.demo-item').last();
    dom('.demo-item').removeClass('bg-yellow-200');
    lastItem.addClass('bg-yellow-200');
    dom('#methods-output').html('<strong>Last item highlighted!</strong> The .last() method selects the final element in the collection.');
  });

  dom('#filter-demo').on('click', () => {
    const activeItems = dom('.demo-item').filter('.active');
    dom('.demo-item').removeClass('bg-blue-200');
    activeItems.addClass('bg-blue-200');
    dom('#methods-output').html(`<strong>Filtered ${activeItems.length} active items!</strong> The .filter() method can use selectors or predicate functions.`);
  });

  dom('#clone-demo').on('click', () => {
    const clonedItems = dom('.demo-item').clone();
    clonedItems.addClass('bg-green-100').find('h4').each((el) => {
      el.textContent = el.textContent.replace('Item', 'Cloned Item');
    });
    dom('#clone-area').empty().append('<h5 class="font-medium mb-2 text-green-800">Cloned Items:</h5>').append(clonedItems);
    dom('#methods-output').html('<strong>Items cloned!</strong> The .clone() method creates deep copies of elements that can be modified independently.');
  });

  dom('#empty-demo').on('click', () => {
    dom('.demo-item').empty();
    dom('#methods-output').html('<strong>Content emptied!</strong> The .empty() method removes all child elements while keeping the containers.');
  });

  dom('#remove-demo').on('click', () => {
    dom('.demo-item').remove();
    dom('#methods-output').html('<strong>Items removed!</strong> The .remove() method completely removes elements from the DOM.');
  });

  dom('#reset-demo').on('click', () => {
    dom('#demo-items').html(originalItems);
    dom('#clone-area').empty();
    dom('#methods-output').html('Demo reset! Try the different methods above.');
  });

  // Event handlers for DOM Traversal tab
  dom('#parent-demo').on('click', () => {
    dom('.container *').removeClass('ring-2 ring-blue-500 ring-red-500 ring-green-500');
    const parents = dom('.target').parent();
    parents.addClass('ring-2 ring-blue-500');
    dom('#traversal-output').html('<strong>Parent highlighted!</strong> The .parent() method selects immediate parent elements.');
  });

  dom('#parents-demo').on('click', () => {
    dom('.container *').removeClass('ring-2 ring-blue-500 ring-red-500 ring-green-500');
    const parents = dom('.target').parents();
    parents.addClass('ring-2 ring-red-500');
    dom('#traversal-output').html(`<strong>${parents.length} ancestors highlighted!</strong> The .parents() method selects all ancestor elements.`);
  });

  dom('#siblings-demo').on('click', () => {
    dom('.container *').removeClass('ring-2 ring-blue-500 ring-red-500 ring-green-500');
    const siblings = dom('.target').siblings();
    siblings.addClass('ring-2 ring-green-500');
    dom('#traversal-output').html(`<strong>${siblings.length} siblings highlighted!</strong> The .siblings() method selects all sibling elements.`);
  });

  dom('#clear-traversal').on('click', () => {
    dom('.container *').removeClass('ring-2 ring-blue-500 ring-red-500 ring-green-500');
    dom('#traversal-output').html('Highlights cleared. Try the traversal methods above!');
  });

  // Event handlers for Forms & Properties tab
  dom('#get-values').on('click', () => {
    const values = {
      text: dom('#text-input').val(),
      number: dom('#number-input').val(),
      select: dom('#select-input').val(),
      checked: dom('#checkbox-input').prop('checked')
    };
    dom('#form-output').html(`<strong>Current values:</strong><br><pre>${JSON.stringify(values, null, 2)}</pre>`);
  });

  dom('#set-values').on('click', () => {
    dom('#text-input').val('Updated text!');
    dom('#number-input').val('99');
    dom('#select-input').val('option3');
    dom('#checkbox-input').prop('checked', false);
    dom('#form-output').html('<strong>Values updated!</strong> All form fields have been set to new values.');
  });

  dom('#set-attrs').on('click', () => {
    dom('#text-input').attrs({
      'data-id': '456',
      'placeholder': 'Type here...',
      'data-category': 'demo'
    });
    dom('#form-output').html('<strong>Attributes set!</strong> Check the text input element - it now has data-id, placeholder, and data-category attributes.');
  });

  dom('#serialize-form').on('click', () => {
    const serialized = dom('#text-input, #number-input, #select-input, #checkbox-input').serialize();
    dom('#form-output').html(`<strong>Serialized form data:</strong><br><pre>${JSON.stringify(serialized, null, 2)}</pre>`);
  });

  // Event handlers for Element Positioning tab
  let beforeCount = 0;
  let afterCount = 0;

  dom('#add-before').on('click', () => {
    beforeCount++;
    dom('#target-element').before(`<div class="p-2 bg-green-100 border border-green-300 rounded mb-2">Before Element #${beforeCount}</div>`);
    dom('#positioning-output').html(`<strong>Added before element #${beforeCount}!</strong> The .before() method inserts content before the target element.`);
  });

  dom('#add-after').on('click', () => {
    afterCount++;
    dom('#target-element').after(`<div class="p-2 bg-red-100 border border-red-300 rounded mt-2">After Element #${afterCount}</div>`);
    dom('#positioning-output').html(`<strong>Added after element #${afterCount}!</strong> The .after() method inserts content after the target element.`);
  });

  dom('#clear-additions').on('click', () => {
    dom('#target-element').parent().find('div').each((el) => {
      if (el !== dom('#target-element').el() && (el.textContent.includes('Before Element') || el.textContent.includes('After Element'))) {
        el.remove();
      }
    });
    beforeCount = 0;
    afterCount = 0;
    dom('#positioning-output').html('All added elements cleared. Try adding elements before and after the target.');
  });
}
