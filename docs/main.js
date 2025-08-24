import vk from '../dist/index.js';
import { initNavigation } from './navigation.js';
import { initContent } from './content.js';

// Make vk globally available for console debugging
window.vk = vk;

// Initialize the documentation
function init() {
  initNavigation();
  initContent();

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

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
