import dom, { useTemplate, use } from '../../dist/index.js';

const renderExample = useTemplate('#example-template');
const renderSubsection = useTemplate('#subsection-template');

export function addPluginExamples() {
  const pluginSection = dom('#plugins');
  if (pluginSection.length === 0) return;

  pluginSection.append(renderSubsection({
    id: 'plugin-system-overview',
    title: 'Plugin System',
    content: `
      <p class="text-gray-700 mb-4">
        Extend dom.js with custom functionality using the plugin system.
      </p>
    `
  }));

  const pluginExample = renderExample({
    id: 'creating-plugins-example',
    title: 'Creating Plugins',
    description: 'Add custom methods to dom.js',
    demo: `
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <h5 class="font-medium">Flash Effect Plugin</h5>
            <button id="flash-demo" class="btn btn-primary">Flash Element</button>
            <div id="flash-target" class="w-full h-16 bg-yellow-400 rounded mx-auto flex items-center justify-center text-sm font-bold">
              FLASH
            </div>
          </div>
          
          <div class="space-y-2">
            <h5 class="font-medium">Typewriter Plugin</h5>
            <button id="typewriter-demo" class="btn btn-primary">Start Typing</button>
            <div id="typewriter-target" class="h-16 bg-gray-100 rounded p-3 text-sm font-mono border border-gray-300 min-h-[60px]">
              Click button to see effect...
            </div>
          </div>
        </div>
        
        <div class="space-y-2">
          <h5 class="font-medium">Toast Notification Plugin</h5>
          <div class="flex space-x-2">
            <button id="toast-success" class="btn btn-primary text-sm">Success Toast</button>
            <button id="toast-warning" class="btn btn-secondary text-sm">Warning Toast</button>
            <button id="toast-error" class="btn btn-secondary text-sm">Error Toast</button>
          </div>
          <div id="toast-container" class="fixed top-4 right-4 z-50 space-y-2"></div>
        </div>
      </div>
    `,
    code: `import { use } from '@dmitrijkiltau/dom.js';

// Flash effect plugin
use((api) => {
  api.flash = function(selector, options = {}) {
    const { duration = 300, iterations = 3 } = options;
    
    return this(selector).animate([
      { opacity: 1 },
      { opacity: 0.3 },
      { opacity: 1 }
    ], {
      duration: duration / iterations,
      iterations
    });
  };
});

// Typewriter effect plugin
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

// Usage
dom.flash('#element', { duration: 600, iterations: 2 });
dom.typewriter('#output', 'Hello World!', { speed: 100 });`
  });

  pluginSection.append(pluginExample);

  // Define the flash plugin
  use((api) => {
    api.flash = function (selector, options = {}) {
      const { duration = 300, iterations = 3 } = options;

      return this(selector).animate(
        [{ opacity: 1 }, { opacity: 0.3 }, { opacity: 1 }],
        { duration: duration / iterations, iterations }
      );
    };
  });

  // Define the typewriter plugin
  use((api) => {
    api.typewriter = function (selector, text, options = {}) {
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

  // Define the toast plugin
  use((api) => {
    api.toast = function (message, options = {}) {
      const { type = 'info', duration = 3000, position = 'top-right' } = options;
      
      const typeClasses = {
        success: 'bg-green-100 border-green-200 text-green-800',
        warning: 'bg-yellow-100 border-yellow-200 text-yellow-800',
        error: 'bg-red-100 border-red-200 text-red-800',
        info: 'bg-blue-100 border-blue-200 text-blue-800'
      };

      const toast = document.createElement('div');
      toast.className = `
        ${typeClasses[type] || typeClasses.info}
        border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm cursor-pointer
        transform transition-all duration-300 translate-x-full opacity-0
      `.replace(/\s+/g, ' ').trim();
      
      toast.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">${message}</span>
          <button class="ml-3 text-current opacity-70 hover:opacity-100">&times;</button>
        </div>
      `;

      const container = document.getElementById('toast-container');
      if (container) {
        container.appendChild(toast);

        // Animate in
        setTimeout(() => {
          toast.classList.remove('translate-x-full', 'opacity-0');
        }, 10);

        // Auto remove
        const removeToast = () => {
          toast.classList.add('translate-x-full', 'opacity-0');
          setTimeout(() => {
            if (toast.parentNode) {
              toast.parentNode.removeChild(toast);
            }
          }, 300);
        };

        // Remove on click
        toast.addEventListener('click', removeToast);

        // Auto remove after duration
        if (duration > 0) {
          setTimeout(removeToast, duration);
        }
      }

      return this;
    };
  });

  // Add plugin demo functionality
  dom('#flash-demo').on('click', () => {
    dom.flash('#flash-target', { duration: 600, iterations: 2 });
  });

  dom('#typewriter-demo').on('click', () => {
    const messages = [
      'Hello from dom.js!',
      'This is a typewriter effect!',
      'Plugins make extension easy!',
      'Build amazing things!',
      'Customize to your heart\'s content!'
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    dom.typewriter('#typewriter-target', randomMessage, { speed: 60 });
  });

  dom('#toast-success').on('click', () => {
    dom.toast('Operation completed successfully!', { type: 'success', duration: 4000 });
  });

  dom('#toast-warning').on('click', () => {
    dom.toast('Please check your input data.', { type: 'warning', duration: 5000 });
  });

  dom('#toast-error').on('click', () => {
    dom.toast('An error occurred during processing.', { type: 'error', duration: 6000 });
  });

  // Advanced plugin example
  const advancedExample = renderExample({
    id: 'advanced-plugin-patterns-example',
    title: 'Advanced Plugin Patterns',
    description: 'Complex plugins with state management and chaining',
    demo: `
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <h5 class="font-medium">Draggable Plugin</h5>
            <button id="toggle-draggable" class="btn btn-primary text-sm">Toggle Draggable</button>
            <div class="demo-area border border-gray-300 rounded p-4 h-32 bg-gray-50 relative">
              <div id="draggable-box" class="w-12 h-12 bg-indigo-500 rounded cursor-move absolute top-2 left-2 flex items-center justify-center text-white text-xs font-bold select-none">
                DRAG
              </div>
            </div>
          </div>
          
          <div class="space-y-2">
            <h5 class="font-medium">Highlight Plugin</h5>
            <input id="search-text" placeholder="Type to highlight..." class="input text-sm">
            <div class="demo-area border border-gray-300 rounded p-3 h-32 bg-gray-100 text-sm overflow-y-auto" id="highlight-content">
              <p>dom.js is a lightweight, modern DOM manipulation library that provides a jQuery-like API with ES modules support and no dependencies.</p>
              <p>It's designed for modern browsers and offers a chainable, intuitive API for DOM manipulation, templating, forms, events, HTTP requests, and animations.</p>
            </div>
          </div>
        </div>
        
        <div class="space-y-2">
          <h5 class="font-medium">Counter Plugin with State</h5>
          <div class="flex space-x-2">
            <button id="counter-increment" class="btn btn-primary text-sm">Increment</button>
            <button id="counter-decrement" class="btn btn-secondary text-sm">Decrement</button>
            <button id="counter-reset" class="btn btn-secondary text-sm">Reset</button>
          </div>
          <div class="demo-area border border-gray-300 rounded p-4 bg-gray-50 text-center">
            <div id="counter-display" class="text-2xl font-bold">0</div>
            <div class="text-sm text-gray-600 mt-2">Current Count</div>
          </div>
        </div>
      </div>
    `,
    code: `// Draggable plugin with state
use((api) => {
  api.DOMCollection.prototype.draggable = function(options = {}) {
    const { containment = null, axis = 'both' } = options;
    
    return this.each((el) => {
      let isDragging = false;
      let startX, startY, startLeft, startTop;
      
      const onMouseDown = (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = el.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        el.style.zIndex = '1000';
      };
      
      const onMouseMove = (e) => {
        if (!isDragging) return;
        
        let newLeft = startLeft + (e.clientX - startX);
        let newTop = startTop + (e.clientY - startY);
        
        if (axis === 'x') newTop = startTop;
        if (axis === 'y') newLeft = startLeft;
        
        el.style.position = 'absolute';
        el.style.left = newLeft + 'px';
        el.style.top = newTop + 'px';
      };
      
      const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        el.style.zIndex = '';
      };
      
      el.addEventListener('mousedown', onMouseDown);
    });
  };
});

// Highlight plugin
use((api) => {
  api.DOMCollection.prototype.highlight = function(text, className = 'bg-yellow-200') {
    return this.each((el) => {
      const regex = new RegExp(\`(\${text.replace(/[.*+?^()|[\\]\\\\]/g, '\\\\$&')})\`, 'gi');
      el.innerHTML = el.innerHTML.replace(regex, \`<mark class="\${className}">$1</mark>\`);
    });
  };
});

// Usage
dom('#draggable-element').draggable({ axis: 'x' });
dom('#content').highlight('dom.js');`
  });

  pluginSection.append(advancedExample);

  // Define advanced plugins FIRST before using them
  use((api) => {
    api.DOMCollection.prototype.draggable = function(options = {}) {
      const { axis = 'both' } = options;
      
      return this.each((el) => {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        
        const onMouseDown = (e) => {
          isDragging = true;
          startX = e.clientX;
          startY = e.clientY;
          
          const transform = window.getComputedStyle(el).transform;
          if (transform !== 'none') {
            const matrix = transform.match(/matrix.*\((.+)\)/)[1].split(', ');
            initialX = parseFloat(matrix[4]) || 0;
            initialY = parseFloat(matrix[5]) || 0;
          } else {
            initialX = 0;
            initialY = 0;
          }
          
          el.style.cursor = 'grabbing';
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        };
        
        const onMouseMove = (e) => {
          if (!isDragging) return;
          
          let deltaX = e.clientX - startX;
          let deltaY = e.clientY - startY;
          
          if (axis === 'x') deltaY = 0;
          if (axis === 'y') deltaX = 0;
          
          el.style.transform = `translate(${initialX + deltaX}px, ${initialY + deltaY}px)`;
        };
        
        const onMouseUp = () => {
          isDragging = false;
          el.style.cursor = 'move';
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };
        
        el.style.cursor = 'move';
        el.addEventListener('mousedown', onMouseDown);
        
        // Store cleanup function
        el._draggableCleanup = () => {
          el.removeEventListener('mousedown', onMouseDown);
        };
      });
    };

    api.DOMCollection.prototype.undraggable = function() {
      return this.each((el) => {
        if (el._draggableCleanup) {
          el._draggableCleanup();
          delete el._draggableCleanup;
        }
        el.style.cursor = '';
        el.style.transform = '';
      });
    };
  });

  use((api) => {
    api.DOMCollection.prototype.highlight = function(text, className = 'bg-yellow-200') {
      return this.each((el) => {
        // First, remove existing highlights
        el.innerHTML = el.innerHTML.replace(/<mark class="[^"]*">([^<]*)<\/mark>/gi, '$1');
        
        if (text.trim()) {
          const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(${escapedText})`, 'gi');
          el.innerHTML = el.innerHTML.replace(regex, `<mark class="${className}">$1</mark>`);
        }
      });
    };
  });

  use((api) => {
    api.counter = function(selector, options = {}) {
      const { initial = 0, min = null, max = null, step = 1 } = options;
      const element = this(selector).el();
      
      if (!element) return this;
      
      let value = initial;
      element._counterValue = value;
      element.textContent = value;
      
      return {
        increment() {
          if (max === null || value + step <= max) {
            value += step;
            element.textContent = value;
            element._counterValue = value;
          }
        },
        
        decrement() {
          if (min === null || value - step >= min) {
            value -= step;
            element.textContent = value;
            element._counterValue = value;
          }
        },
        
        reset() {
          value = initial;
          element.textContent = value;
          element._counterValue = value;
        },
        
        getValue() {
          return value;
        },
        
        setValue(newValue) {
          if ((min === null || newValue >= min) && (max === null || newValue <= max)) {
            value = newValue;
            element.textContent = value;
            element._counterValue = value;
          }
        }
      };
    };
  });

  // Initialize advanced plugin demos
  let isDraggableEnabled = false;
  let counterInstance;

  dom('#toggle-draggable').on('click', () => {
    const box = dom('#draggable-box');
    if (isDraggableEnabled) {
      box.undraggable();
      dom('#toggle-draggable').text('Enable Draggable');
      isDraggableEnabled = false;
    } else {
      box.draggable();
      dom('#toggle-draggable').text('Disable Draggable');
      isDraggableEnabled = true;
    }
  });

  dom('#search-text').on('input', (e) => {
    const searchText = e.target.value;
    dom('#highlight-content').highlight(searchText);
  });

  // Initialize counter
  counterInstance = dom.counter('#counter-display', { initial: 0, min: -10, max: 100, step: 1 });

  dom('#counter-increment').on('click', () => {
    counterInstance.increment();
  });

  dom('#counter-decrement').on('click', () => {
    counterInstance.decrement();
  });

  dom('#counter-reset').on('click', () => {
    counterInstance.reset();
  });
}
