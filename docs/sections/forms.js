import dom, { useTemplate, onSubmit, serializeForm, toQueryString, setForm, resetForm, validateForm } from '../../dist/index.js';
import { createTabbedExamples } from '../content.js';

const renderSubsection = useTemplate('#subsection-template');

export function addFormExamples() {
  const formSection = dom('#forms');
  if (formSection.length === 0) return;

  formSection.append(renderSubsection({
    id: 'form-utilities-overview',
    title: 'Form Utilities',
    content: `
      <p class="text-gray-700 mb-4">
        Handle forms with automatic serialization and submission helpers.
      </p>
    `
  }));

  // Create tabbed examples for Form functionality
  const formTabbedExamples = createTabbedExamples({
    id: 'form-examples-tabs',
    title: 'Form Examples',
    description: 'Explore different form handling features with interactive examples',
    tabs: [
      {
        id: 'form-handling',
        title: 'Form Handling',
        demo: `
          <form id="demo-form" class="space-y-4 mb-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input name="name" class="input" value="John Doe" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input name="email" type="email" class="input" value="john@example.com" required>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
              <select name="tags" multiple class="input" size="4">
                <option value="javascript" selected>JavaScript</option>
                <option value="html" selected>HTML</option>
                <option value="css" selected>CSS</option>
                <option value="react">React</option>
                <option value="vue">Vue</option>
                <option value="angular">Angular</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input type="radio" name="experience" value="beginner" class="mr-2">
                  <span>Beginner</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" name="experience" value="intermediate" class="mr-2" checked>
                  <span>Intermediate</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" name="experience" value="advanced" class="mr-2">
                  <span>Advanced</span>
                </label>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Interests</label>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center">
                  <input type="checkbox" name="interests" value="frontend" class="mr-2" checked>
                  <span>Frontend</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" name="interests" value="backend" class="mr-2">
                  <span>Backend</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" name="interests" value="mobile" class="mr-2" checked>
                  <span>Mobile</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" name="interests" value="devops" class="mr-2">
                  <span>DevOps</span>
                </label>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea name="bio" class="input" rows="3" placeholder="Tell us about yourself...">A passionate developer interested in modern web technologies.</textarea>
            </div>
            
            <div>
              <label class="flex items-center">
                <input type="checkbox" name="newsletter" value="yes" class="mr-2" checked>
                <span class="text-sm">Subscribe to newsletter</span>
              </label>
            </div>
            
            <button type="submit" class="btn btn-primary">Submit Form</button>
          </form>
          <div id="form-results"></div>
        `,
        code: `import { onSubmit, serializeForm, toQueryString } from '@dmitrijkiltau/dom.js';

// Handle form submission
onSubmit('#demo-form', async (data, event) => {
  console.log('Form data:', data);
  console.log('Query string:', toQueryString(data));
  
  // Example data structure:
  // {
  //   name: 'John Doe',
  //   email: 'john@example.com',
  //   tags: ['javascript', 'html', 'css'], // Array from multi-select
  //   experience: 'intermediate',
  //   interests: ['frontend', 'mobile'], // Array from checkboxes
  //   bio: 'A passionate developer...',
  //   newsletter: 'yes' // Single checkbox
  // }
  
  // Send to server
  try {
    const response = await http.post('/api/submit', data);
    const result = await response.json();
    console.log('Response:', result);
  } catch (error) {
    console.error('Error:', error);
  }
});

// Manual form serialization
const form = dom('#demo-form').el();
const data = serializeForm(form);
console.log(data);`
      },
      {
        id: 'set-reset',
        title: 'Populate & Reset',
        demo: `
          <form id="populate-form" class="space-y-4 mb-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">User Name</label>
                <input name="user[name]" class="input" placeholder="Name">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="user[email]" type="email" class="input" placeholder="Email">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div class="grid grid-cols-3 gap-2">
                <label class="flex items-center"><input type="checkbox" class="mr-2" name="tags[]" value="js">JS</label>
                <label class="flex items-center"><input type="checkbox" class="mr-2" name="tags[]" value="css">CSS</label>
                <label class="flex items-center"><input type="checkbox" class="mr-2" name="tags[]" value="html">HTML</label>
              </div>
            </div>
            <div>
              <label class="flex items-center">
                <input type="checkbox" class="mr-2" name="settings[newsletter]" value="yes">
                <span class="text-sm">Subscribe to newsletter</span>
              </label>
            </div>
          </form>
          <div class="flex space-x-2 mb-3">
            <button id="btn-populate" class="btn btn-secondary text-sm">Populate Values</button>
            <button id="btn-serialize-populated" class="btn btn-primary text-sm">Serialize</button>
            <button id="btn-reset-form" class="btn btn-outline text-sm">Reset</button>
          </div>
          <div id="populate-output" class="text-sm text-gray-700 bg-gray-100 p-3 rounded"></div>
        `,
        code: `import { setForm, resetForm, serializeForm } from '@dmitrijkiltau/dom.js/forms';

// Populate with nested values
setForm('#populate-form', {
  user: { name: 'Jane', email: 'jane@example.com' },
  tags: ['js', 'css'],
  settings: { newsletter: true }
});

// Serialize
const data = serializeForm('#populate-form');

// Reset to initial defaults
resetForm('#populate-form');`
      },
      {
        id: 'validation',
        title: 'Validation',
        demo: `
          <form id="validation-form" class="space-y-4 mb-4" novalidate>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input name="name" class="input" required minlength="2" placeholder="Your name">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input name="email" type="email" class="input" required placeholder="you@example.com">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input name="age" type="number" class="input" min="18" max="120" placeholder="18+">
            </div>
          </form>
          <div class="flex space-x-2 mb-3">
            <button id="btn-validate" class="btn btn-primary text-sm">Validate</button>
            <button id="btn-submit-validation" class="btn btn-secondary text-sm">Submit</button>
          </div>
          <div id="validation-output" class="text-sm bg-gray-100 p-3 rounded text-gray-800"></div>
        `,
        code: `import { validateForm, onSubmit } from '@dmitrijkiltau/dom.js/forms';

// Validate manually
const { valid, errors } = validateForm('#validation-form');
if (!valid) console.log(errors);

// With submit helper
onSubmit('#validation-form', (data, ev) => {
  const v = validateForm(ev.target);
  if (!v.valid) return console.warn('Fix errors before submitting', v.errors);
  // proceed
});`
      },
      {
        id: 'collection-serialize',
        title: 'Collection Serialize',
        demo: `
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <h5 class="font-medium mb-2">Form Elements Collection</h5>
                <div class="space-y-2">
                  <input name="username" class="input form-element" placeholder="Username" value="johndoe">
                  <input name="email" type="email" class="input form-element" placeholder="Email" value="john@example.com">
                  <select name="role" class="input form-element">
                    <option value="">Select role...</option>
                    <option value="admin">Admin</option>
                    <option value="user" selected>User</option>
                    <option value="guest">Guest</option>
                  </select>
                  <label class="flex items-center">
                    <input name="notifications" type="checkbox" class="mr-2 form-element" checked>
                    Enable notifications
                  </label>
                </div>
              </div>
              <div>
                <h5 class="font-medium mb-2">Product Preferences</h5>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input name="products" type="checkbox" value="web" class="mr-2 product-element" checked>
                    Web Development
                  </label>
                  <label class="flex items-center">
                    <input name="products" type="checkbox" value="mobile" class="mr-2 product-element">
                    Mobile Development
                  </label>
                  <label class="flex items-center">
                    <input name="products" type="checkbox" value="design" class="mr-2 product-element" checked>
                    UI/UX Design
                  </label>
                  <textarea name="comments" class="input product-element" rows="2" placeholder="Additional comments...">Great service!</textarea>
                </div>
              </div>
            </div>
            
            <div class="flex space-x-2">
              <button id="serialize-form-elements" class="btn btn-primary text-sm">Serialize Form Elements</button>
              <button id="serialize-products" class="btn btn-secondary text-sm">Serialize Product Preferences</button>
              <button id="serialize-all-inputs" class="btn btn-accent text-sm">Serialize All Inputs</button>
            </div>
            
            <div id="serialize-output" class="text-sm text-gray-600 bg-gray-100 p-3 rounded"></div>
          </div>
        `,
        code: `// Serialize specific form elements using collections
const formData = dom('.form-element').serialize();
console.log(formData);
// Output: { username: 'johndoe', email: 'john@example.com', role: 'user', notifications: 'on' }

// Serialize checkboxes with same name (creates arrays)
const productData = dom('input[name="products"]:checked').serialize();
console.log(productData);
// Output: { products: ['web', 'design'] }

// Serialize all form inputs
const allData = dom('input, select, textarea').serialize();

// Works with any collection of form elements
const specificInputs = dom('#form input[type="text"], #form select').serialize();

// Can be chained with other collection methods
const filteredData = dom('.form-element')
  .filter('[name]')  // Only elements with name attributes
  .serialize();`
      },
      {
        id: 'dynamic-building',
        title: 'Dynamic Building',
        demo: `
          <div class="space-y-4">
            <div class="flex space-x-2">
              <button id="add-field" class="btn btn-secondary">Add Field</button>
              <button id="add-section" class="btn btn-secondary">Add Section</button>
              <button id="serialize-dynamic" class="btn btn-primary">Serialize</button>
              <button id="clear-dynamic" class="btn btn-danger">Clear</button>
            </div>
            
            <form id="dynamic-form" class="space-y-4 border border-gray-300 p-4 rounded">
              <div class="dynamic-sections"></div>
            </form>
            
            <div id="dynamic-results" class="hidden"></div>
          </div>
        `,
        code: `// Build forms dynamically
const form = dom('#dynamic-form');

// Add input field
const addField = (name, type = 'text', placeholder = '') => {
  const field = \`
    <div class="field-group">
      <label class="block text-sm font-medium mb-1">\${name}</label>
      <input name="\${name.toLowerCase().replace(/\\s+/g, '_')}" 
             type="\${type}" 
             placeholder="\${placeholder}"
             class="input">
      <button type="button" class="text-red-500 text-xs mt-1 remove-field">Remove</button>
    </div>
  \`;
  form.append(field);
};

// Handle dynamic removal
form.click('.remove-field', (ev, el) => {
  dom(el).closest('.field-group').remove();
});

// Serialize anytime
const data = serializeForm(form.el());`
      }
    ]
  });

  formSection.append(formTabbedExamples);

  // Event handlers for Form Handling tab
  dom(document).on('submit', '#demo-form',  (event, el) => {
    event.preventDefault(); const data = serializeForm(el)

    const resultTemplate = useTemplate('#form-result-template');
    const result = resultTemplate({
      result: JSON.stringify(data, null, 2)
    });

    dom('#form-results').html('').append(result);

    // Show query string version
    const queryString = toQueryString(data);
    dom('#form-results').append(`
      <div class="p-4 bg-blue-50 border border-blue-200 rounded">
        <h5 class="font-semibold text-blue-900 mb-2">Query String:</h5>
        <code class="text-sm text-blue-800 break-all">${queryString}</code>
      </div>
    `);
  });

  // Event handlers for Collection Serialize tab
  dom('#serialize-form-elements').click(() => {
    const data = dom('.form-element').serialize();
    dom('#serialize-output').html(`
      <strong>Form Elements Data:</strong>
      <pre class="mt-2 text-xs">${JSON.stringify(data, null, 2)}</pre>
      <div class="mt-2 text-xs text-gray-500">Serialized ${dom('.form-element').length} form elements using dom('.form-element').serialize()</div>
    `);
  });

  dom('#serialize-products').click(() => {
    const data = dom('.product-element').serialize();
    dom('#serialize-output').html(`
      <strong>Product Preferences Data:</strong>
      <pre class="mt-2 text-xs">${JSON.stringify(data, null, 2)}</pre>
      <div class="mt-2 text-xs text-gray-500">Note: Checkboxes with same name become arrays automatically</div>
    `);
  });

  dom('#serialize-all-inputs').click(() => {
    const data = dom('input, select, textarea').serialize();
    dom('#serialize-output').html(`
      <strong>All Form Data:</strong>
      <pre class="mt-2 text-xs">${JSON.stringify(data, null, 2)}</pre>
      <div class="mt-2 text-xs text-gray-500">Serialized all input, select, and textarea elements on the page</div>
    `);
  });

  // Event handlers for Populate & Reset tab
  dom('#btn-populate').click(() => {
    setForm('#populate-form', {
      user: { name: 'Jane', email: 'jane@example.com' },
      tags: ['js', 'css'],
      settings: { newsletter: true }
    });
    dom('#populate-output').html('<div class="text-green-700">Form populated.</div>');
  });

  dom('#btn-serialize-populated').click(() => {
    const data = serializeForm('#populate-form');
    dom('#populate-output').html(`
      <strong>Serialized Data:</strong>
      <pre class="mt-2 text-xs">${JSON.stringify(data, null, 2)}</pre>
    `);
  });

  dom('#btn-reset-form').click(() => {
    resetForm('#populate-form');
    dom('#populate-output').html('<div class="text-gray-700">Form reset to defaults.</div>');
  });

  // Event handlers for Validation tab
  dom('#btn-validate').click(() => {
    const { valid, errors } = validateForm('#validation-form');
    if (valid) {
      dom('#validation-output').html('<div class="text-green-700">Form is valid ✅</div>');
    } else {
      const list = errors.map(e => `- ${e.name}: ${e.message}`).join('\n');
      dom('#validation-output').html(`
        <div class="text-red-700">Found ${errors.length} error(s):</div>
        <pre class="mt-2 text-xs">${list}</pre>
      `);
    }
  });

  dom(document).on('submit', '#validation-form', (ev, el) => {
    const result = validateForm('#validation-form');
    if (!result.valid) {
      ev.preventDefault();
      const list = result.errors.map(e => `- ${e.name}: ${e.message}`).join('\n');
      dom('#validation-output').html(`
        <div class="text-red-700">Please fix the following before submitting:</div>
        <pre class="mt-2 text-xs">${list}</pre>
      `);
      return;
    }
    dom('#validation-output').html('<div class="text-green-700">Submitted successfully ✔️</div>');
  });

  dom('#btn-submit-validation').click(() => {
    const f = dom('#validation-form').el();
    if (f && 'requestSubmit' in f) f.requestSubmit();
  });

  // Event handlers for Dynamic Building tab
  let fieldCounter = 0;
  let sectionCounter = 0;

  dom('#add-field').click(() => {
    fieldCounter++;
    const fieldHtml = `
      <div class="field-group border-l-2 border-blue-200 pl-4 py-2">
        <label class="block text-sm font-medium mb-1">Field ${fieldCounter}</label>
        <div class="flex space-x-2">
          <input name="field_${fieldCounter}" class="input flex-1" placeholder="Enter value...">
          <select name="field_${fieldCounter}_type" class="input w-24">
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="email">Email</option>
          </select>
          <button type="button" class="text-red-500 hover:text-red-700 px-2 remove-field">&times;</button>
        </div>
      </div>
    `;
    dom('.dynamic-sections').append(fieldHtml);
  });

  dom('#add-section').click(() => {
    sectionCounter++;
    const sectionHtml = `
      <div class="section-group border border-gray-300 rounded p-3 bg-gray-50">
        <div class="flex justify-between items-center mb-2">
          <h4 class="font-medium">Section ${sectionCounter}</h4>
          <button type="button" class="text-red-500 hover:text-red-700 remove-section">Remove Section</button>
        </div>
        <input name="section_${sectionCounter}_title" class="input mb-2" placeholder="Section title...">
        <textarea name="section_${sectionCounter}_content" class="input" rows="2" placeholder="Section content..."></textarea>
      </div>
    `;
    dom('.dynamic-sections').append(sectionHtml);
  });

  dom('#dynamic-form').click('.remove-field', (ev, el) => {
    dom(el).closest('.field-group').remove();
  });

  dom('#dynamic-form').click('.remove-section', (ev, el) => {
    dom(el).closest('.section-group').remove();
  });

  dom('#serialize-dynamic').click(() => {
    const data = serializeForm(dom('#dynamic-form').el());
    dom('#dynamic-results').removeClass('hidden').html(`
      <div class="p-4 bg-green-50 border border-green-200 rounded">
        <h5 class="font-semibold text-green-900 mb-2">Serialized Data:</h5>
        <pre class="text-sm text-green-800 whitespace-pre-wrap overflow-x-auto">${JSON.stringify(data, null, 2)}</pre>
      </div>
    `);
  });

  dom('#clear-dynamic').click(() => {
    dom('.dynamic-sections').html('');
    dom('#dynamic-results').addClass('hidden');
    fieldCounter = 0;
    sectionCounter = 0;
  });
}
