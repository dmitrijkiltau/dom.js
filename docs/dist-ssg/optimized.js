import dom from '@dmitrijkiltau/dom.js/core';


// Minimal client-side code for interactivity

// Make dom available globally for console debugging
if (typeof dom !== 'undefined') {
  window.dom = dom;
}

// Mobile navigation functionality
function initMobileNavigation() {
  const mobileMenuButton = dom('#mobile-menu-button');
  const sidebar = dom('#sidebar');
  const overlay = dom('#mobile-sidebar-overlay');
  
  if (mobileMenuButton.elements.length === 0) return;
  
  mobileMenuButton.on('click', () => {
    const isOpen = sidebar.elements[0]?.classList.contains('translate-x-0');
    
    if (isOpen) {
      sidebar.removeClass('translate-x-0').addClass('-translate-x-full');
      overlay.addClass('hidden');
    } else {
      sidebar.removeClass('-translate-x-full').addClass('translate-x-0');
      overlay.removeClass('hidden');
    }
  });
  
  overlay.on('click', () => {
    sidebar.removeClass('translate-x-0').addClass('-translate-x-full');
    overlay.addClass('hidden');
  });
}

// Theme toggle functionality
function initThemeToggle() {
  const themeToggle = dom('#theme-toggle');
  if (themeToggle.elements.length === 0) return;
  
  let currentTheme = localStorage.getItem('theme') || 'light';
  applyTheme(currentTheme);
  
  themeToggle.on('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
  });
  
  function applyTheme(theme) {
    const root = document.documentElement;
    const themeIconLight = dom('#theme-icon-light');
    const themeIconDark = dom('#theme-icon-dark');
    const themeLabel = dom('#theme-label');
    
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


// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  console.log('🎯 dom-ssg initialized with optimized bundle');
  
  // Add any remaining interactivity here
  initializeInteractivity();
}

function initializeInteractivity() {
  // Mobile navigation
  if (typeof initMobileNavigation !== 'undefined') {
    initMobileNavigation();
  }
  
  // Theme toggle
  if (typeof initThemeToggle !== 'undefined') {
    initThemeToggle();
  }
}