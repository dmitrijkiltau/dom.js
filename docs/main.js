import vk from '../dist/index.js';
import { initNavigation } from './navigation.js';
import { initContent } from './content.js';
import { version } from './version.js';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/themes/prism-tomorrow.css';

// Make vk globally available for console debugging
window.vk = vk;

// Initialize the documentation
function init() {
  initNavigation();
  initContent();
  initSidebarFooter();
  
  // Run syntax highlighting after content is loaded to catch all code blocks
  setTimeout(() => {
    initSyntaxHighlighting();
  }, 100);
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

// Initialize syntax highlighting for all code blocks
function initSyntaxHighlighting() {
  // Highlight all code blocks that don't have the 'highlighted' class
  const codeBlocks = document.querySelectorAll('pre code:not(.highlighted)');
  codeBlocks.forEach(codeBlock => {
    // Add language-javascript class if no language class exists
    if (!codeBlock.className.includes('language-')) {
      codeBlock.classList.add('language-javascript');
    }
    Prism.highlightElement(codeBlock);
    codeBlock.classList.add('highlighted');
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
    const codeIcon = container.querySelector('.code-icon');
    const cubeIcon = container.querySelector('.cube-icon');
    const currentView = button.getAttribute('data-view');
    
    if (currentView === 'demo') {
      // Switch to code view
      if (demoSection) demoSection.style.display = 'none';
      if (codeSection) {
        codeSection.style.display = 'block';
        // Apply syntax highlighting to code blocks
        const codeBlock = codeSection.querySelector('code');
        if (codeBlock && !codeBlock.classList.contains('highlighted')) {
          // Add language-javascript class if no language class exists
          if (!codeBlock.className.includes('language-')) {
            codeBlock.classList.add('language-javascript');
          }
          Prism.highlightElement(codeBlock);
          codeBlock.classList.add('highlighted');
        }
      }
      if (toggleText) toggleText.textContent = 'Show Demo';
      // Switch to cube icon (showing demo)
      if (codeIcon) codeIcon.style.display = 'none';
      if (cubeIcon) cubeIcon.style.display = 'block';
      button.setAttribute('data-view', 'code');
    } else {
      // Switch to demo view
      if (demoSection) demoSection.style.display = 'block';
      if (codeSection) codeSection.style.display = 'none';
      if (toggleText) toggleText.textContent = 'Show Code';
      // Switch to code icon (showing code)
      if (codeIcon) codeIcon.style.display = 'block';
      if (cubeIcon) cubeIcon.style.display = 'none';
      button.setAttribute('data-view', 'demo');
    }
  });
}

// Initialize sidebar footer functionality
function initSidebarFooter() {
  // Display version
  const versionDisplay = vk('#version-display');
  versionDisplay.text(`v${version}`);

  // Initialize theme toggle
  initThemeToggle();
}

// Initialize theme toggle functionality
function initThemeToggle() {
  const themeToggle = vk('#theme-toggle');
  const themeIconLight = vk('#theme-icon-light');
  const themeIconDark = vk('#theme-icon-dark');
  const themeLabel = vk('#theme-label');
  
  // Get current theme from localStorage or default to light
  let currentTheme = localStorage.getItem('theme') || 'light';
  
  // Apply the current theme on load
  applyTheme(currentTheme);
  
  // Handle theme toggle click
  themeToggle.on('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
  });
  
  function applyTheme(theme) {
    const body = document.body;
    
    if (theme === 'dark') {
      body.classList.add('dark-theme');
      themeIconLight.addClass('hidden');
      themeIconDark.removeClass('hidden');
      themeLabel.text('Dark Theme');
    } else {
      body.classList.remove('dark-theme');
      themeIconLight.removeClass('hidden');
      themeIconDark.addClass('hidden');
      themeLabel.text('Light Theme');
    }
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
