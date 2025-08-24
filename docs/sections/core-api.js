import dom, { useTemplate } from '../../dist/index.js';

const renderExample = useTemplate('#example-template');

export function addCoreApiExamples() {
  const coreSection = dom('#core-api');

  // Basic selector example
  const basicExample = renderExample({
    id: 'basic-selection-example',
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
dom('#demo-btn-1').addClass('highlighted');

// Select by class
dom('.demo-text').css('color', 'blue');

// Select multiple elements
dom('button').addClass('selected');

// Method chaining
dom('#demo-btn-2')
  .addClass('active')
  .css('background', '#10b981')
  .text('Updated!');`
  });

  coreSection.append(basicExample);

  // Add interactivity to the example
  dom('#select-demo').on('click', () => {
    dom('#demo-btn-1').toggleClass('bg-yellow-200');
    dom('.demo-text').css('color', dom('.demo-text').css('color') === 'rgb(59, 130, 246)' ? '' : 'rgb(59, 130, 246)');
    dom('#demo-btn-2').text(dom('#demo-btn-2').text() === 'Button 2' ? 'Updated!' : 'Button 2');
  });

  // Collection methods example
  const collectionExample = renderExample({
    id: 'vkcollection-methods-example',
    title: 'VKCollection Methods',
    description: 'Chain methods for DOM manipulation',
    demo: `
      <div class="space-y-2">
        <div class="example-list space-y-2">
          <div class="p-3 border border-gray-300 rounded">Item 1</div>
          <div class="p-3 border border-gray-300 rounded">Item 2</div>
          <div class="p-3 border border-gray-300 rounded">Item 3</div>
        </div>
        <button id="collection-demo" class="btn btn-primary">Manipulate Collection</button>
      </div>
    `,
    code: `// Get collection
const items = dom('.example-list div');

// Chain operations
items
  .addClass('bg-blue-100')
  .css('border-color', '#3b82f6')
  .each((el, idx) => {
    dom(el).text(\`Updated Item \${idx + 1}\`);
  });

// Access individual elements
const firstItem = items.el(); // First element
const allElements = items.elements; // Array of all elements`
  });

  coreSection.append(collectionExample);

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

  // Element access example
  const accessExample = renderExample({
    id: 'element-access-example',
    title: 'Element Access',
    description: 'Access underlying DOM elements',
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
    code: `// Get VKCollection
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
  });

  coreSection.append(accessExample);

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
}
