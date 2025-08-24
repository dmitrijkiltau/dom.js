import dom, { useTemplate, on, off } from '../../dist/index.js';

const renderExample = useTemplate('#example-template');
const renderSubsection = useTemplate('#subsection-template');

export function addEventExamples() {
  const eventSection = dom('#events');
  if (eventSection.length === 0) return;

  eventSection.append(renderSubsection({
    id: 'event-handling-overview',
    title: 'Event Handling',
    content: `
      <p class="text-gray-700 mb-4">
        Handle events with support for delegation and multiple targets.
      </p>
    `
  }));

  const eventExample = renderExample({
    id: 'event-handling-example',
    title: 'Event Handling',
    description: 'Bind events to elements with delegation support',
    demo: `
      <div class="space-y-4">
        <div class="space-x-2">
          <button id="add-button" class="btn btn-primary">Add Button</button>
          <button id="clear-buttons" class="btn btn-secondary">Clear All</button>
          <button id="toggle-events" class="btn btn-secondary">Toggle Events</button>
        </div>
        <div id="button-container" class="space-y-2 p-4 border border-gray-300 rounded min-h-[100px] bg-gray-50"></div>
        <div id="event-log" class="text-sm text-gray-600 max-h-32 overflow-y-auto bg-gray-100 p-3 border border-gray-300 rounded"></div>
      </div>
    `,
    code: `import { on, off } from '@dmitrijkiltau/vanilla-kit';

// Direct event binding
dom('#add-button').on('click', () => {
  console.log('Button clicked!');
});

// Event delegation - handle events on dynamically created elements
dom('#button-container').on('click', 'button', (ev, el, idx) => {
  console.log(\`Dynamic button \${idx} clicked\`);
  dom(el).toggleClass('bg-green-200');
});

// Multiple event types
dom('#button-container').on('mouseenter mouseleave', 'button', (ev, el) => {
  dom(el).toggleClass('shadow-lg');
});

// Remove events
dom(element).off('click', handler);`
  });

  eventSection.append(eventExample);

  // Add event demo functionality
  let buttonCount = 0;
  let eventsEnabled = true;

  function logEvent(message) {
    const log = dom('#event-log');
    const timestamp = new Date().toLocaleTimeString();
    log.append(`<div>[${timestamp}] ${message}</div>`);
    log.el().scrollTop = log.el().scrollHeight;
  }

  dom('#add-button').on('click', () => {
    buttonCount++;
    const buttonHtml = `
      <button class="btn btn-secondary mr-2 mb-2 transition-all duration-200" data-button-id="${buttonCount}">
        Button ${buttonCount}
      </button>
    `;
    dom('#button-container').append(buttonHtml);
    logEvent(`Added Button ${buttonCount}`);
  });

  dom('#clear-buttons').on('click', () => {
    dom('#button-container').html('');
    dom('#event-log').html('');
    buttonCount = 0;
    logEvent('Cleared all buttons and events log');
  });

  // Event delegation for dynamic buttons
  dom('#button-container').on('click', 'button', (ev, el, idx) => {
    if (!eventsEnabled) return;
    const buttonId = el.getAttribute('data-button-id');
    dom(el).toggleClass('bg-green-200');
    logEvent(`Dynamic Button ${buttonId} clicked (index: ${idx})`);
  });

  dom('#button-container').on('mouseenter', 'button', (ev, el) => {
    if (!eventsEnabled) return;
    dom(el).addClass('shadow-lg scale-105');
    const buttonId = el.getAttribute('data-button-id');
    logEvent(`Mouse entered Button ${buttonId}`);
  });

  dom('#button-container').on('mouseleave', 'button', (ev, el) => {
    if (!eventsEnabled) return;
    dom(el).removeClass('shadow-lg scale-105');
    const buttonId = el.getAttribute('data-button-id');
    logEvent(`Mouse left Button ${buttonId}`);
  });

  dom('#toggle-events').on('click', () => {
    eventsEnabled = !eventsEnabled;
    dom('#toggle-events').text(eventsEnabled ? 'Disable Events' : 'Enable Events');
    logEvent(`Events ${eventsEnabled ? 'enabled' : 'disabled'}`);
  });

  // Advanced event handling example
  const advancedExample = renderExample({
    id: 'advanced-event-handling-example',
    title: 'Advanced Event Patterns',
    description: 'Complex event handling patterns and techniques',
    demo: `
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="event-zone border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:border-blue-400 transition-colors">
            <h4 class="font-medium mb-2">Drag & Drop Zone</h4>
            <p class="text-sm text-gray-600">Drag files here or click to select</p>
            <input type="file" multiple class="hidden" id="file-input">
          </div>
          
          <div class="keyboard-zone border-2 border-dashed border-gray-300 p-4 text-center" tabindex="0">
            <h4 class="font-medium mb-2">Keyboard Events</h4>
            <p class="text-sm text-gray-600">Click here and type something</p>
            <div class="mt-2 text-xs bg-gray-100 p-2 rounded min-h-[40px]" id="key-display"></div>
          </div>
        </div>
        
        <div class="scroll-zone border border-gray-300 p-4 h-32 overflow-y-auto bg-gray-50">
          <h4 class="font-medium mb-2">Scroll Events</h4>
          <div class="space-y-2">
            ${Array.from({ length: 20 }, (_, i) => `<div class="p-2 bg-gray-100 rounded">Item ${i + 1}</div>`).join('')}
          </div>
        </div>
        
        <div id="advanced-event-log" class="text-sm text-gray-600 max-h-24 overflow-y-auto bg-gray-100 p-3 border border-gray-300 rounded"></div>
      </div>
    `,
    code: `// Multiple event types on same element
dom('.event-zone').on('dragover dragenter dragleave drop', (ev) => {
  ev.preventDefault();
  // Handle drag events
});

// Keyboard events with key combinations
dom('.keyboard-zone').on('keydown', (ev, el) => {
  const key = ev.key;
  const ctrl = ev.ctrlKey ? 'Ctrl+' : '';
  const shift = ev.shiftKey ? 'Shift+' : '';
  console.log(\`Key: \${ctrl}\${shift}\${key}\`);
});

// Throttled scroll events
let scrollTimeout;
dom('.scroll-zone').on('scroll', (ev, el) => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    const scrollPercent = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
    console.log(\`Scrolled: \${scrollPercent.toFixed(1)}%\`);
  }, 100);
});

// Custom event handling
const customHandler = (ev, el, idx) => {
  console.log('Custom handler called', { ev, el, idx });
};

// Remove specific handlers
dom(element).off('click', customHandler);`
  });

  eventSection.append(advancedExample);

  function logAdvancedEvent(message) {
    const log = dom('#advanced-event-log');
    const timestamp = new Date().toLocaleTimeString();
    log.append(`<div>[${timestamp}] ${message}</div>`);
    log.el().scrollTop = log.el().scrollHeight;
  }

  // Drag and drop events
  dom('.event-zone').on('dragover dragenter', (ev) => {
    ev.preventDefault();
    dom(ev.target).addClass('border-blue-400 bg-blue-50');
  });

  dom('.event-zone').on('dragleave', (ev) => {
    ev.preventDefault();
    dom(ev.target).removeClass('border-blue-400 bg-blue-50');
  });

  dom('.event-zone').on('drop', (ev) => {
    ev.preventDefault();
    dom(ev.target).removeClass('border-blue-400 bg-blue-50');
    const files = ev.dataTransfer.files;
    logAdvancedEvent(`Dropped ${files.length} file(s)`);
  });

  dom('.event-zone').on('click', () => {
    dom('#file-input').el().click();
  });

  dom('#file-input').on('change', (ev) => {
    const files = ev.target.files;
    logAdvancedEvent(`Selected ${files.length} file(s)`);
  });

  // Keyboard events
  dom('.keyboard-zone').on('keydown', (ev, el) => {
    const key = ev.key;
    const modifiers = [];
    if (ev.ctrlKey) modifiers.push('Ctrl');
    if (ev.shiftKey) modifiers.push('Shift');
    if (ev.altKey) modifiers.push('Alt');
    
    const keyCombo = modifiers.length ? `${modifiers.join('+')}+${key}` : key;
    
    dom('#key-display').html(`
      <div>Key: <code>${keyCombo}</code></div>
      <div>Code: <code>${ev.code}</code></div>
    `);
    
    logAdvancedEvent(`Key pressed: ${keyCombo}`);
  });

  dom('.keyboard-zone').on('focus', () => {
    dom('.keyboard-zone').addClass('ring-2 ring-blue-400');
    logAdvancedEvent('Keyboard zone focused');
  });

  dom('.keyboard-zone').on('blur', () => {
    dom('.keyboard-zone').removeClass('ring-2 ring-blue-400');
    logAdvancedEvent('Keyboard zone blurred');
  });

  // Throttled scroll events
  let scrollTimeout;
  dom('.scroll-zone').on('scroll', (ev, el) => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollPercent = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
      logAdvancedEvent(`Scrolled: ${scrollPercent}%`);
    }, 150);
  });

  // Touch events for mobile
  if ('ontouchstart' in window) {
    dom('.event-zone').on('touchstart touchmove touchend', (ev) => {
      logAdvancedEvent(`Touch event: ${ev.type}`);
    });
  }

  // Window resize events
  let resizeTimeout;
  dom(window).on('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      logAdvancedEvent(`Window resized to ${window.innerWidth}x${window.innerHeight}`);
    }, 200);
  });
}
