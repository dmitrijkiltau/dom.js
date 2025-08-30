import dom, { useTemplate } from '../../dist/index.js';
import { createTabbedExamples } from '../content.js';

const renderSubsection = useTemplate('#subsection-template');

export function addDomManipulationExamples() {
  const section = dom('#dom-manipulation');
  if (section.length === 0) return;

  section.append(renderSubsection({
    id: 'dom-manipulation-overview',
    title: 'Interactive Examples',
    content: `
      <p class="text-gray-700 mb-4">Try the operations below and switch between Demo and Code views.</p>
    `
  }));

  const tabbed = createTabbedExamples({
    id: 'dom-manipulation-tabs',
    title: 'DOM Manipulation',
    description: 'Content, structure, classes, styles, attributes, and visibility — hands-on demos',
    tabs: [
      {
        id: 'content-structure',
        title: 'Content & Structure',
        demo: `
          <div class="space-y-4">
            <div class="flex flex-wrap gap-2">
              <button id="add-item" class="btn btn-primary text-sm">Append Item</button>
              <button id="add-first" class="btn btn-secondary text-sm">Prepend Item</button>
              <button id="insert-before" class="btn btn-secondary text-sm">Insert Before</button>
              <button id="insert-after" class="btn btn-secondary text-sm">Insert After</button>
              <button id="wrap-items" class="btn btn-outline text-sm">Wrap Each</button>
              <button id="unwrap-items" class="btn btn-outline text-sm">Unwrap</button>
              <button id="replace-second" class="btn btn-danger text-sm">Replace 2nd</button>
              <button id="reset-structure" class="btn btn-outline text-sm">Reset</button>
            </div>
            <div class="p-3 border border-gray-300 rounded">
              <div id="structure-target" class="space-y-2">
                <div class="card p-2 bg-gray-50 border rounded">Item A</div>
                <div class="card p-2 bg-gray-50 border rounded">Item B</div>
                <div class="card p-2 bg-gray-50 border rounded">Item C</div>
              </div>
            </div>
            <div id="structure-log" class="text-sm text-gray-600 bg-gray-100 p-3 rounded"></div>
          </div>
        `,
        code: `// Append / Prepend
dom('#list').append('<li>New</li>');
dom('#list').prepend('<li>First</li>');

// Before / After
dom('#target').before('<div>Before target</div>');
dom('#target').after('<div>After target</div>');

// Wrap / Unwrap each element
dom('.item').wrap('<div class="wrapper"></div>');
dom('.item').unwrap();

// Replace elements
dom('.item').eq(1).replaceWith('<div class="item">Replaced</div>');`
      },
      {
        id: 'classes-styles',
        title: 'Classes & Styles',
        demo: `
          <div class="space-y-4">
            <div class="flex flex-wrap gap-2">
              <button id="toggle-active" class="btn btn-primary text-sm">Toggle .active</button>
              <button id="set-blue" class="btn btn-secondary text-sm">Blue Theme</button>
              <button id="set-green" class="btn btn-secondary text-sm">Green Theme</button>
              <button id="replace-theme" class="btn btn-outline text-sm">Replace Theme</button>
              <button id="clear-styles" class="btn btn-outline text-sm">Clear Styles</button>
            </div>
            <div id="style-cards" class="grid grid-cols-2 gap-3">
              <div class="style-card p-3 border rounded bg-white">Card 1</div>
              <div class="style-card p-3 border rounded bg-white">Card 2</div>
              <div class="style-card p-3 border rounded bg-white">Card 3</div>
              <div class="style-card p-3 border rounded bg-white">Card 4</div>
            </div>
            <div id="style-log" class="text-sm text-gray-600 bg-gray-100 p-3 rounded"></div>
          </div>
        `,
        code: `// Classes
dom('.cards').addClass('active');
dom('.cards').removeClass('active');
dom('.cards').toggleClass('active');

// Replace specific classes only
dom('.cards').replaceClass('theme-blue', 'theme-green');

// Inline styles
dom('.cards').css('borderColor', '#3b82f6').css('opacity', '0.9');`
      },
      {
        id: 'attributes-data-props',
        title: 'Attributes, Data & Props',
        demo: `
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Attribute</label>
                <div class="flex gap-2">
                  <input id="attr-name" class="input" placeholder="data-role" value="data-role">
                  <input id="attr-value" class="input" placeholder="admin" value="admin">
                </div>
                <button id="set-attr" class="btn btn-primary mt-2 text-sm">Set Attribute</button>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Property</label>
                <div class="flex gap-2 items-center">
                  <input id="prop-checked" type="checkbox" class="mr-2" checked>
                  <span class="text-sm">checked</span>
                </div>
                <button id="apply-prop" class="btn btn-secondary mt-2 text-sm">Apply Property</button>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button id="set-multiple" class="btn btn-outline text-sm">Set Multiple Attrs</button>
              <button id="set-data" class="btn btn-outline text-sm">Set Data</button>
              <button id="read-all" class="btn btn-outline text-sm">Read Values</button>
            </div>
            <div class="p-3 border rounded bg-gray-50">
              <label class="flex items-center gap-2 mb-2">
                <input id="demo-checkbox" type="checkbox" class="mr-2">
                Demo checkbox
              </label>
              <a id="demo-link" href="#" class="text-blue-600 underline">Demo link</a>
            </div>
            <div id="attr-log" class="text-sm text-gray-600 bg-gray-100 p-3 rounded"></div>
          </div>
        `,
        code: `// Attributes
dom('#user').attr('data-role', 'admin');
dom('#user').attrs({ id: 'u-1', title: 'Title' });

// Properties
dom('#agree').prop('checked', true);

// Data attributes
dom('#user').data('theme', 'dark');
dom('#user').data('counter', 3);`
      },
      {
        id: 'visibility-text-html',
        title: 'Visibility, Text & HTML',
        demo: `
          <div class="space-y-4">
            <div class="flex flex-wrap gap-2">
              <button id="show-box" class="btn btn-primary text-sm">Show</button>
              <button id="hide-box" class="btn btn-secondary text-sm">Hide</button>
              <button id="toggle-box" class="btn btn-outline text-sm">Toggle</button>
              <button id="set-text" class="btn btn-secondary text-sm">Set Text</button>
              <button id="set-html" class="btn btn-outline text-sm">Set HTML</button>
              <button id="reset-box" class="btn btn-outline text-sm">Reset</button>
            </div>
            <div id="vh-box" class="p-4 bg-indigo-50 border border-indigo-200 rounded">Hello!</div>
            <div id="vh-log" class="text-sm text-gray-600 bg-gray-100 p-3 rounded"></div>
          </div>
        `,
        code: `// Visibility
dom('#box').show();
dom('#box').hide();
dom('#box').toggle();

// Content
dom('#box').text('Plain text');
dom('#box').html('<strong>HTML</strong> content');`
      }
    ]
  });

  section.append(tabbed);

  // -------- Content & Structure handlers --------
  const originalStructure = `
    <div class=\"card p-2 bg-gray-50 border rounded\">Item A</div>
    <div class=\"card p-2 bg-gray-50 border rounded\">Item B</div>
    <div class=\"card p-2 bg-gray-50 border rounded\">Item C</div>
  `;

  let count = 0;
  dom('#add-item').click(() => {
    count++;
    dom('#structure-target').append(`<div class="card p-2 bg-white border rounded">Appended #${count}</div>`);
    dom('#structure-log').text(`Appended item #${count}`);
  });

  dom('#add-first').click(() => {
    count++;
    dom('#structure-target').prepend(`<div class="card p-2 bg-white border rounded">Prepended #${count}</div>`);
    dom('#structure-log').text(`Prepended item #${count}`);
  });

  dom('#insert-before').click(() => {
    dom('#structure-target .card').first().before('<div class="p-2 bg-yellow-50 border border-yellow-200 rounded">Before first</div>');
    dom('#structure-log').text('Inserted before the first card');
  });

  dom('#insert-after').click(() => {
    dom('#structure-target .card').last().after('<div class="p-2 bg-green-50 border border-green-200 rounded">After last</div>');
    dom('#structure-log').text('Inserted after the last card');
  });

  dom('#wrap-items').click(() => {
    dom('#structure-target .card').wrap('<div class="p-1 bg-gray-100 rounded border"></div>');
    dom('#structure-log').text('Wrapped each card element');
  });

  dom('#unwrap-items').click(() => {
    dom('#structure-target .card').unwrap();
    dom('#structure-log').text('Unwrapped card elements');
  });

  dom('#replace-second').click(() => {
    const second = dom('#structure-target .card').eq(1);
    second.replaceWith('<div class="card p-2 bg-purple-50 border border-purple-200 rounded">Replaced second</div>');
    dom('#structure-log').text('Replaced the second card');
  });

  dom('#reset-structure').click(() => {
    dom('#structure-target').html(originalStructure);
    dom('#structure-log').text('Reset structure');
    count = 0;
  });

  // -------- Classes & Styles handlers --------
  dom('#toggle-active').click(() => {
    dom('#style-cards .style-card').toggleClass('ring-2').toggleClass('ring-blue-400').toggleClass('active');
    dom('#style-log').text('Toggled .active and ring classes');
  });

  dom('#set-blue').click(() => {
    dom('#style-cards .style-card')
      .removeClass('bg-green-50 border-green-300 text-green-900')
      .addClass('bg-blue-50 border-blue-300 text-blue-900')
      .css('borderColor', '#93c5fd');
    dom('#style-log').text('Applied blue theme');
  });

  dom('#set-green').click(() => {
    dom('#style-cards .style-card')
      .removeClass('bg-blue-50 border-blue-300 text-blue-900')
      .addClass('bg-green-50 border-green-300 text-green-900')
      .css('borderColor', '#86efac');
    dom('#style-log').text('Applied green theme');
  });

  dom('#replace-theme').click(() => {
    dom('#style-cards .style-card')
      .replaceClass('bg-blue-50 border-blue-300 text-blue-900', 'bg-purple-50 border-purple-300 text-purple-900')
      .replaceClass('bg-green-50 border-green-300 text-green-900', 'bg-purple-50 border-purple-300 text-purple-900')
      .css('borderColor', '#c4b5fd');
    dom('#style-log').text('Replaced theme classes with purple theme');
  });

  dom('#clear-styles').click(() => {
    dom('#style-cards .style-card')
      .removeClass('ring-2 ring-blue-400 active bg-blue-50 border-blue-300 text-blue-900 bg-green-50 border-green-300 text-green-900 bg-purple-50 border-purple-300 text-purple-900')
      .css('borderColor', '');
    dom('#style-log').text('Cleared themes and inline styles');
  });

  // -------- Attributes, Data & Props handlers --------
  dom('#set-attr').click(() => {
    const name = dom('#attr-name').val();
    const value = dom('#attr-value').val();
    dom('#demo-link').attr(name, value);
    dom('#attr-log').text(`Set attribute ${name}="${value}" on #demo-link`);
  });

  dom('#apply-prop').click(() => {
    const checked = dom('#prop-checked').prop('checked');
    dom('#demo-checkbox').prop('checked', checked);
    dom('#attr-log').text(`Set checkbox.checked = ${checked}`);
  });

  dom('#set-multiple').click(() => {
    dom('#demo-link').attrs({
      title: 'Example link',
      target: '_blank',
      rel: 'noopener'
    });
    dom('#attr-log').text('Set multiple attributes on #demo-link');
  });

  dom('#set-data').click(() => {
    dom('#demo-link').data('category', 'docs');
    dom('#demo-link').data('counter', (Number(dom('#demo-link').data('counter')) || 0) + 1);
    dom('#attr-log').text(`Set data-category and incremented data-counter=${dom('#demo-link').data('counter')}`);
  });

  dom('#read-all').click(() => {
    const attrs = {
      href: dom('#demo-link').attr('href'),
      title: dom('#demo-link').attr('title'),
      target: dom('#demo-link').attr('target'),
      counter: dom('#demo-link').data('counter')
    };
    const props = {
      checked: dom('#demo-checkbox').prop('checked')
    };
    dom('#attr-log').html(`<strong>Attributes:</strong> <pre>${JSON.stringify(attrs, null, 2)}</pre><strong>Properties:</strong> <pre>${JSON.stringify(props, null, 2)}</pre>`);
  });

  // -------- Visibility, Text & HTML handlers --------
  const originalBox = '<div id="vh-box" class="p-4 bg-indigo-50 border border-indigo-200 rounded">Hello!</div>';

  dom('#show-box').click(() => {
    dom('#vh-box').show();
    dom('#vh-log').text('Shown');
  });

  dom('#hide-box').click(() => {
    dom('#vh-box').hide();
    dom('#vh-log').text('Hidden');
  });

  dom('#toggle-box').click(() => {
    dom('#vh-box').toggle();
    dom('#vh-log').text('Toggled visibility');
  });

  dom('#set-text').click(() => {
    dom('#vh-box').text('This is plain text');
    dom('#vh-log').text('Set text');
  });

  dom('#set-html').click(() => {
    dom('#vh-box').html('<strong>HTML</strong> content with <em>formatting</em>');
    dom('#vh-log').text('Set HTML');
  });

  dom('#reset-box').click(() => {
    dom('#vh-box').replaceWith(originalBox);
    dom('#vh-log').text('Reset box content and visibility');
  });
}

