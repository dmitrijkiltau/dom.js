import dom from '../dist/index.js';
import { initNavigation } from './navigation.js';
import { initContent } from './content.js';
import { version } from './version.js';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/themes/prism-tomorrow.css';

// Make dom globally available for console debugging
window.dom = dom;

// Initialize the documentation
function init() {
  initNavigation();
  initContent();
  initSidebarFooter();
  initMobileNavigation(); // Add mobile navigation
  
  // Run syntax highlighting after content is loaded to catch all code blocks
  setTimeout(() => {
    initSyntaxHighlighting();
    initTabbedExamples(); // Initialize tabs after content is loaded
  }, 100);
  initExampleToggles();

  // Smooth scrolling for internal links
  dom(document).on('click', 'a[href^="#"]', (ev, el) => {
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
  dom(document).on('click', '.toggle-demo-code', (ev, button) => {
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

// Initialize tabbed examples functionality
function initTabbedExamples() {
  // Handle tab button clicks using event delegation
  dom(document).on('click', '.tab-button', (ev, button) => {
    ev.preventDefault();
    
    // Find the tabbed examples container using native DOM traversal
    const container = button.closest('.tabbed-examples-container');
    if (!container) return;
    
    const tabId = button.getAttribute('data-tab');
    if (!tabId) return;
    
    // Remove active class from all tab buttons in this container
    const allTabButtons = container.querySelectorAll('.tab-button');
    allTabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    button.classList.add('active');
    
    // Hide all tab panels in this container
    const allPanels = container.querySelectorAll('.tab-panel');
    allPanels.forEach(panel => panel.style.display = 'none');
    
    // Show the corresponding tab panel
    const targetPanel = container.querySelector(`[data-panel="${tabId}"]`);
    if (targetPanel) {
      targetPanel.style.display = 'block';
    }
  });
  
  // Initialize first tab as active for each tabbed examples container
  dom('.tabbed-examples-container').each((container) => {
    const firstTab = container.querySelector('.tab-button');
    const firstPanel = container.querySelector('.tab-panel');
    
    if (firstTab && firstPanel) {
      firstTab.classList.add('active');
      firstPanel.style.display = 'block';
    }
  });
}

// Initialize sidebar footer functionality
function initSidebarFooter() {
  // Display version
  const versionDisplay = dom('#version-display');
  versionDisplay.text(`v${version}`);

  // Initialize theme toggle
  initThemeToggle();
}

// Initialize theme toggle functionality
function initThemeToggle() {
  const themeToggle = dom('#theme-toggle');
  const themeIconLight = dom('#theme-icon-light');
  const themeIconDark = dom('#theme-icon-dark');
  const themeLabel = dom('#theme-label');
  
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
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      themeIconLight.addClass('hidden');
      themeIconDark.removeClass('hidden');
      themeLabel.text('Dark Theme');
    } else {
      root.classList.remove('dark');
      themeIconLight.removeClass('hidden');
      themeIconDark.addClass('hidden');
      themeLabel.text('Light Theme');
    }
  }
}

// Initialize mobile navigation functionality
function initMobileNavigation() {
  const mobileMenuButton = dom('#mobile-menu-button');
  const sidebar = dom('#sidebar');
  const overlay = dom('#mobile-sidebar-overlay');
  
  // Toggle mobile menu
  mobileMenuButton.on('click', () => {
    const isOpen = sidebar.elements[0]?.classList.contains('translate-x-0');
    
    if (isOpen) {
      // Close menu
      sidebar.removeClass('translate-x-0').addClass('-translate-x-full');
      overlay.addClass('hidden');
    } else {
      // Open menu
      sidebar.removeClass('-translate-x-full').addClass('translate-x-0');
      overlay.removeClass('hidden');
    }
  });
  
  // Close menu when clicking overlay
  overlay.on('click', () => {
    sidebar.removeClass('translate-x-0').addClass('-translate-x-full');
    overlay.addClass('hidden');
  });
  
  // Close menu when clicking navigation links on mobile
  dom('#nav-menu').on('click', 'a', () => {
    // Only close on mobile (when overlay is visible)
    if (!overlay.elements[0]?.classList.contains('hidden')) {
      sidebar.removeClass('translate-x-0').addClass('-translate-x-full');
      overlay.addClass('hidden');
    }
  });
  
  // Handle resize to ensure proper state
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) { // lg breakpoint
      // Desktop: ensure overlay is hidden and sidebar is visible
      overlay.addClass('hidden');
      sidebar.removeClass('translate-x-0 -translate-x-full');
    } else {
      // Mobile: ensure sidebar starts hidden
      sidebar.removeClass('translate-x-0').addClass('-translate-x-full');
    }
  });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
