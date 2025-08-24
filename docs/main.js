import vk from '../dist/index.js';
import { initNavigation } from './navigation.js';
import { initContent } from './content.js';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/themes/prism-tomorrow.css';

// Make vk globally available for console debugging
window.vk = vk;

// Initialize the documentation
function init() {
  initNavigation();
  initContent();
  initExampleToggles();

  // Smooth scrolling for internal links
  vk(document).on('click', 'a[href^="#"]', (ev, el) => {
    ev.preventDefault();
    const targetId = el.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// Initialize example toggle functionality
function initExampleToggles() {
  // Handle toggle button clicks using event delegation
  vk(document).on('click', '.toggle-demo-code', (ev, button) => {
    ev.preventDefault();
    
    // Find the example container using native DOM traversal
    const container = button.closest('.example-container');
    if (!container) return;
    
    const demoSection = container.querySelector('.example-demo');
    const codeSection = container.querySelector('.example-code');
    const toggleText = container.querySelector('.toggle-text');
    const toggleIcon = container.querySelector('.toggle-icon');
    const currentView = button.getAttribute('data-view');
    
    if (currentView === 'demo') {
      // Switch to code view
      if (demoSection) demoSection.style.display = 'none';
      if (codeSection) {
        codeSection.style.display = 'block';
        // Apply syntax highlighting to code blocks
        const codeBlock = codeSection.querySelector('code');
        if (codeBlock && !codeBlock.classList.contains('highlighted')) {
          Prism.highlightElement(codeBlock);
          codeBlock.classList.add('highlighted');
        }
      }
      if (toggleText) toggleText.textContent = 'Show Demo';
      if (toggleIcon) toggleIcon.classList.add('rotated');
      button.setAttribute('data-view', 'code');
    } else {
      // Switch to demo view
      if (demoSection) demoSection.style.display = 'block';
      if (codeSection) codeSection.style.display = 'none';
      if (toggleText) toggleText.textContent = 'Show Code';
      if (toggleIcon) toggleIcon.classList.remove('rotated');
      button.setAttribute('data-view', 'demo');
    }
  });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
