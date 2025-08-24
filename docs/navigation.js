import vk, { useTemplate } from '../dist/index.js';
import { navigationItems } from './data/navigation.js';

const renderNavItem = useTemplate('#nav-item-template');

export function initNavigation() {
  const navMenu = vk('#nav-menu');
  
  for (const item of navigationItems) {
    navMenu.append(renderNavItem(item));
  }

  // Handle navigation clicks
  vk('#nav-menu').on('click', 'a', (ev, el) => {
    ev.preventDefault();
    const href = el.getAttribute('href');
    const targetId = href.substring(1); // Remove #
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });

      // Update active state
      vk('#nav-menu .nav-link').removeClass('active');
      vk(el).addClass('active');
    }
  });

  // Update active navigation on scroll
  let ticking = false;
  function updateActiveNav() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const sections = navigationItems.map(item => ({
          id: item.href.substring(1),
          element: document.getElementById(item.href.substring(1))
        })).filter(section => section.element);

        let activeSection = sections[0];
        const scrollPosition = window.scrollY + 100;

        for (const section of sections) {
          if (section.element.offsetTop <= scrollPosition) {
            activeSection = section;
          }
        }

        vk('#nav-menu .nav-link').removeClass('active');
        vk(`#nav-menu a[href="#${activeSection?.id}"]`).addClass('active');

        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav(); // Initial call
}
