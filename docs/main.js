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
  initContent();
  initNavigation();
  initSidebarFooter();
  
  // Run syntax highlighting after content is loaded to catch all code blocks
  setTimeout(() => {
    initSyntaxHighlighting();
    initTabbedExamples(); // Initialize tabs after content is loaded
    initImportPicker(); // Initialize import tabs in Getting Started
    initCopyButtons(); // Add copy buttons to code blocks
  }, 100);
  initExampleToggles();

  // Smooth scrolling for internal links
  dom(document).on('click', 'a[href^="#"]', (ev, el) => {
    ev.preventDefault();
    const targetId = el.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // Use library helper for consistency
      dom.scrollIntoView(targetElement, { behavior: 'smooth', block: 'start' });
    }
  });
}

// Re-highlight a code element if needed
function rehighlight(codeEl) {
  if (!codeEl) return;
  codeEl.classList.remove('highlighted');
  if (!codeEl.className.includes('language-')) {
    codeEl.classList.add('language-javascript');
  }
  Prism.highlightElement(codeEl);
  codeEl.classList.add('highlighted');
}

// Initialize syntax highlighting for all code blocks
function initSyntaxHighlighting() {
  // Highlight all code blocks that don't have the 'highlighted' class
  const codeBlocks = document.querySelectorAll('pre code:not(.highlighted):not([data-no-highlight])');
  for (const codeBlock of codeBlocks) rehighlight(codeBlock);
}

// Initialize the simple import picker tabs in Getting Started
function initImportPicker() {
  // Delegated click handler for import tabs
  dom(document).on('click', '.import-tab', (ev, button) => {
    ev.preventDefault();
    const container = button.closest('.import-picker');
    if (!container) return;

    // Set active state on tabs
    container.querySelectorAll('.import-tab').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const variant = button.getAttribute('data-variant');
    const targetCode = container.querySelector('[data-import-code]');
    const sourceCode = container.querySelector(`pre[data-variant="${variant}"] code`);
    if (!targetCode || !sourceCode) return;

    // Update code text and re-highlight
    targetCode.textContent = sourceCode.textContent;
    rehighlight(targetCode);
  });

  // Initialize each picker with its first tab
  document.querySelectorAll('.import-picker').forEach(container => {
    const firstTab = container.querySelector('.import-tab');
    if (firstTab) firstTab.click();
  });
}

// Add copy buttons to code blocks
function initCopyButtons() {
  const pres = document.querySelectorAll('pre.code-block:not([data-copy-enabled])');
  for (const pre of pres) {
    pre.setAttribute('data-copy-enabled', 'true');
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code');
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.textContent || '');
        const original = btn.textContent;
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1200);
      } catch (e) {
        const original = btn.textContent;
        btn.textContent = 'Failed';
        setTimeout(() => { btn.textContent = original; }, 1200);
      }
    });
    pre.appendChild(btn);
  }
}

// Initialize example toggle functionality
function initExampleToggles() {
  // Handle toggle button clicks using event delegation
  dom(document).on('click', '.toggle-demo-code', (ev, button) => {
    ev.preventDefault();
    
    // Check if this toggle is in a tabbed examples header
    const tabbedContainer = button.closest('.tabbed-examples-container');
    if (tabbedContainer) {
      // Handle centralized toggle for tabbed examples
      handleTabbedExamplesToggle(button, tabbedContainer);
      return;
    }
    
    // Handle regular example container toggle
    const container = button.closest('.example-container');
    if (!container) return;
    
    handleSingleExampleToggle(button, container);
  });
}

// Handle toggle for regular example containers
function handleSingleExampleToggle(button, container) {
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
      const codeBlock = codeSection.querySelector('code');
      if (codeBlock) rehighlight(codeBlock);
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
}

// Handle centralized toggle for tabbed examples
function handleTabbedExamplesToggle(button, tabbedContainer) {
  const toggleText = button.querySelector('.toggle-text');
  const codeIcon = button.querySelector('.code-icon');
  const cubeIcon = button.querySelector('.cube-icon');
  const currentView = button.getAttribute('data-view');
  
  // Get all tab panels in this tabbed container
  const allPanels = tabbedContainer.querySelectorAll('.tab-panel');

  if (currentView === 'demo') {
    // Switch all panels to code view
    for (const panel of allPanels) {
      const demoSection = panel.querySelector('.example-demo');
      const codeSection = panel.querySelector('.example-code');
      if (demoSection) demoSection.style.display = 'none';
      if (codeSection) {
        codeSection.style.display = 'block';
        const codeBlock = codeSection.querySelector('code');
        if (codeBlock) rehighlight(codeBlock);
      }
    }
    if (toggleText) toggleText.textContent = 'Show Demo';
    // Switch to cube icon (showing demo)
    if (codeIcon) codeIcon.style.display = 'none';
    if (cubeIcon) cubeIcon.style.display = 'block';
    button.setAttribute('data-view', 'code');
  } else {
    // Switch all panels to demo view
    for (const panel of allPanels) {
      const demoSection = panel.querySelector('.example-demo');
      const codeSection = panel.querySelector('.example-code');
      if (demoSection) demoSection.style.display = 'block';
      if (codeSection) codeSection.style.display = 'none';
    }
    if (toggleText) toggleText.textContent = 'Show Code';
    // Switch to code icon (showing code)
    if (codeIcon) codeIcon.style.display = 'block';
    if (cubeIcon) cubeIcon.style.display = 'none';
    button.setAttribute('data-view', 'demo');
  }
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
  const containers = document.querySelectorAll('.tabbed-examples-container');
  for (const container of containers) {
    const firstTab = container.querySelector('.tab-button');
    const firstPanel = container.querySelector('.tab-panel');
    if (firstTab && firstPanel) {
      firstTab.classList.add('active');
      firstPanel.style.display = 'block';
    }
  }
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

document.addEventListener('DOMContentLoaded', init);
