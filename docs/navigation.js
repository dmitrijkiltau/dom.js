import dom, { animations, useTemplate, inView, scrollIntoView } from '../dist/index.js';
import { navigationItems } from './data/navigation.js';

let lastSection = null;
let currentActiveId = null;

export function initNavigation() {
  renderNav();
  initKeyboard();
  initMobileToggle();
  initHashOnLoad();
  initSmoothScrolling();
  initScrollSpy();
  initHashChangeSync();
}

/**
 * Remove url except for the hash part
 * 
 * @param {*} href 
 */
function cleanIdFromHref(href) {
  if (!href) return '';
  if (href.startsWith('#')) return href;
  const hashIndex = href.indexOf('#');
  if (hashIndex === -1) return null;
  return href.slice(hashIndex);
}

function renderNav() {
  const navMenu = dom('#nav-menu');
  const renderItem = useTemplate('#nav-item-template');

  navMenu.attrs({ 'aria-label': 'Main navigation', role: 'list' }).empty();

  for (const item of navigationItems) {
    navMenu.append(renderItem(item));
  }

  dom('#nav-menu .nav-link').fadeIn(300);
}

function initSmoothScrolling() {
  dom('#nav-menu').on('click', '.nav-link', (ev, link) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    ev.preventDefault();
    // Be extra safe to avoid duplicate delegated handlers
    if ('stopImmediatePropagation' in ev) ev.stopImmediatePropagation();
    ev.stopPropagation();

    const id = href.slice(1);
    const target = dom(`#${CSS.escape(id)}`).el();
    if (!target) return;

    // Update URL without reloading and perform smooth scroll
    if (window.location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    scrollIntoView(target, { behavior: 'smooth', block: 'start' });
  });
}

function initScrollSpy() {
  const sections = navigationItems.map(i => dom(i.href).el()).filter(Boolean);

  if (!('IntersectionObserver' in window) || sections.length === 0) {
    window.addEventListener('scroll', dom.throttle(updateByScroll, 150), { passive: true });
    updateByScroll();
    return;
  }

  // mark active when a section becomes visible enough
  const spy = inView(sections, { rootMargin: '-64px 0px -60% 0px', threshold: 0.25 });
  spy.enter((el, entry) => {
    const changed = setActive(el.id, false);
    if (changed) history.replaceState(null, '', `#${el.id}`);
  }).leave((el) => {
    // Optionally handle leave of active section: fall back to lastSection if computed by scroll
    // We keep it simple: if active leaves and no other enter yet, let scroll fallback handle it
  });

  function updateByScroll() {
    const y = window.scrollY + 100;
    let current = sections[0];
    for (const s of sections) {
      if (s.offsetTop <= y) current = s;
    }
    if (current === lastSection) return;
    lastSection = current;
    const changed = setActive(current.id, false);
    if (changed) history.replaceState(null, '', `#${current.id}`);
  }
}

function setActive(id, animate = true) {
  if (currentActiveId === id) return false;
  currentActiveId = id;
  dom('#nav-menu .nav-link').each(a => {
    const href = a.getAttribute('href') || '';
    const isActive = cleanIdFromHref(href) === `#${id}`;
    const $a = dom(a);
    if (isActive) {
      $a.addClass('active').attr('aria-current', 'page');
      if (animate) {
        const anyA = $a;
        // Prefer built-in pulse helper if available
        if (typeof (anyA).pulse === 'function') (anyA).pulse(200);
        else $a.animate(...animations.pulse(200));
      }
    } else {
      $a.removeClass('active').attr('aria-current', null);
    }
  });
  return true;
}

function initKeyboard() {
  const navMenu = dom('#nav-menu');

  navMenu.on('keydown', '.nav-link', (ev, link) => {
    const links = Array.from(navMenu.find('.nav-link').elements);
    const i = Math.max(0, links.indexOf(link));
    let j = i;

    switch (ev.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        ev.preventDefault(); j = Math.min(i + 1, links.length - 1); links[j].focus(); break;
      case 'ArrowLeft':
      case 'ArrowUp':
        ev.preventDefault(); j = Math.max(i - 1, 0); links[j].focus(); break;
      case 'Home':
        ev.preventDefault(); links[0]?.focus(); break;
      case 'End':
        ev.preventDefault(); links[links.length - 1]?.focus(); break;
      case 'Enter':
      case ' ':
        ev.preventDefault();
        link.click();
        break;
    }
  });
}

function initMobileToggle() {
  const btn = dom('#mobile-menu-button');
  const sidebar = dom('#sidebar');
  const overlay = dom('#mobile-sidebar-overlay');

  btn.on('click', () => {
    const open = !sidebar.hasClass('-translate-x-full');
    if (open) {
      sidebar.replaceClass('translate-x-0', '-translate-x-full');
      overlay.replaceClass('pointer-events-auto', 'hidden pointer-events-none');
      btn.attr('aria-expanded', 'false');
    } else {
      sidebar.replaceClass('-translate-x-full', 'translate-x-0');
      overlay.replaceClass('hidden pointer-events-none', 'pointer-events-auto');
      btn.attr('aria-expanded', 'true').attr('aria-controls', 'sidebar');
      const first = sidebar.find('a,button,[tabindex]:not([tabindex="-1"])').first();
      first.el()?.focus();
    }
  });

  function closeMobileMenuIfOpen() {
    if (overlay.hasClass('hidden')) return;
    sidebar.replaceClass('translate-x-0', '-translate-x-full');
    overlay.addClass('hidden pointer-events-none').removeClass('pointer-events-auto');
    btn.focus();
  }

  overlay.on('click', closeMobileMenuIfOpen);

  dom(document).on('keydown', (ev) => {
    if (ev.key === 'Escape' && !overlay.hasClass('hidden')) closeMobileMenuIfOpen();
  });
}

function initHashOnLoad() {
  const h = window.location.hash?.slice(1);
  if (!h) return;
  const el = dom(`#${CSS.escape(h)}`).el();
  if (!el) return;
  setTimeout(() => {
    // Smooth scroll to the section; active will be set by scroll spy when it enters
    scrollIntoView(el, { behavior: 'smooth', block: 'start' });
  }, 0);
}

function initHashChangeSync() {
  // Keep nav state in sync when hash changes externally
  dom.on(window, 'hashchange', () => {
    const h = window.location.hash?.slice(1) || '';
    if (h) setActive(h);
  });
}
