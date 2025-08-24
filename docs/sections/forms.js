import vk, { useTemplate, onSubmit, serializeForm, toQueryString } from '../../dist/index.js';

const renderExample = useTemplate('#example-template');
const renderSubsection = useTemplate('#subsection-template');

export function addFormExamples() {
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
    code: `import { onSubmit, serializeForm, toQueryString } from '@dmitrijkiltau/vanilla-kit';

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
const form = vk('#demo-form').el();
const data = serializeForm(form);
console.log(data);`
  });

  formSection.append(formExample);

  // Add form demo functionality
  onSubmit('#demo-form', (data, event) => {
    event.preventDefault();

    const resultTemplate = useTemplate('#form-result-template');
    const result = resultTemplate({
      result: JSON.stringify(data, null, 2)
    });

    vk('#form-results').html('').append(result);

    // Show query string version
    const queryString = toQueryString(data);
    vk('#form-results').append(`
      <div class="p-4 bg-blue-50 border border-blue-200 rounded">
        <h5 class="font-semibold text-blue-900 mb-2">Query String:</h5>
        <code class="text-sm text-blue-800 break-all">${queryString}</code>
      </div>
    `);
  });

  // Dynamic form example
  const dynamicExample = renderExample({
    title: 'Dynamic Form Building',
    description: 'Build forms dynamically and handle complex structures',
    demo: `
      <div class="space-y-4">
        <div class="flex space-x-2">
          <button id="add-field" class="btn btn-secondary">Add Field</button>
          <button id="add-section" class="btn btn-secondary">Add Section</button>
          <button id="serialize-dynamic" class="btn btn-primary">Serialize</button>
          <button id="clear-dynamic" class="btn btn-danger">Clear</button>
        </div>
        
        <form id="dynamic-form" class="space-y-4 border p-4 rounded">
          <div class="dynamic-sections"></div>
        </form>
        
        <div id="dynamic-results" class="hidden"></div>
      </div>
    `,
    code: `// Build forms dynamically
const form = vk('#dynamic-form');

// Add input field
const addField = (name, type = 'text', placeholder = '') => {
  const field = \`
    <div class="field-group">
      <label class="block text-sm font-medium mb-1">\${name}</label>
      <input name="\${name.toLowerCase().replace(/\s+/g, '_')}" 
             type="\${type}" 
             placeholder="\${placeholder}"
             class="input">
      <button type="button" class="text-red-500 text-xs mt-1 remove-field">Remove</button>
    </div>
  \`;
  form.append(field);
};

// Handle dynamic removal
form.on('click', '.remove-field', (ev, el) => {
  vk(el).closest('.field-group').remove();
});

// Serialize anytime
const data = serializeForm(form.el());`
  });

  formSection.append(dynamicExample);

  let fieldCounter = 0;
  let sectionCounter = 0;

  vk('#add-field').on('click', () => {
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
          <button type="button" class="text-red-500 hover:text-red-700 px-2 remove-field">×</button>
        </div>
      </div>
    `;
    vk('.dynamic-sections').append(fieldHtml);
  });

  vk('#add-section').on('click', () => {
    sectionCounter++;
    const sectionHtml = `
      <div class="section-group border rounded p-3 bg-gray-50">
        <div class="flex justify-between items-center mb-2">
          <h4 class="font-medium">Section ${sectionCounter}</h4>
          <button type="button" class="text-red-500 hover:text-red-700 remove-section">Remove Section</button>
        </div>
        <input name="section_${sectionCounter}_title" class="input mb-2" placeholder="Section title...">
        <textarea name="section_${sectionCounter}_content" class="input" rows="2" placeholder="Section content..."></textarea>
      </div>
    `;
    vk('.dynamic-sections').append(sectionHtml);
  });

  vk('#dynamic-form').on('click', '.remove-field', (ev, el) => {
    vk(el).closest('.field-group').remove();
  });

  vk('#dynamic-form').on('click', '.remove-section', (ev, el) => {
    vk(el).closest('.section-group').remove();
  });

  vk('#serialize-dynamic').on('click', () => {
    const data = serializeForm(vk('#dynamic-form').el());
    vk('#dynamic-results').removeClass('hidden').html(`
      <div class="p-4 bg-green-50 border border-green-200 rounded">
        <h5 class="font-semibold text-green-900 mb-2">Serialized Data:</h5>
        <pre class="text-sm text-green-800 whitespace-pre-wrap overflow-x-auto">${JSON.stringify(data, null, 2)}</pre>
      </div>
    `);
  });

  vk('#clear-dynamic').on('click', () => {
    vk('.dynamic-sections').html('');
    vk('#dynamic-results').addClass('hidden');
    fieldCounter = 0;
    sectionCounter = 0;
  });
}
