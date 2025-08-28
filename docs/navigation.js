import dom, { animations } from '../dist/index.js';
import { navigationItems } from './data/navigation.js';

let lastSection = null;

export function initNavigation() {
  renderNav();
  initKeyboard();
  initMobileToggle();
  initHashOnLoad();
  initSmoothScrolling();
  initScrollSpy();
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
  navMenu.attr({ 'aria-label': 'Main navigation' });

  const frag = document.createDocumentFragment();
  for (const item of navigationItems) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'nav-link';
    a.href = item.href;
    a.textContent = item.title;
    li.appendChild(a);
    frag.appendChild(li);
  }

  navMenu.el()?.appendChild(frag);
  dom('#nav-menu .nav-link').animate(...animations.fadeIn(300));
}

function initSmoothScrolling() {
  let busy = false;

  dom('#nav-menu').on('click', '.nav-link', (ev, link) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const id = href.slice(1);
    history.pushState(null, '', href);
    setActive(id);
    setTimeout(() => (busy = false), 600);
  });
}

function initScrollSpy() {
  const sections = navigationItems.map(i => dom(i.href).el()).filter(Boolean);

  if (!('IntersectionObserver' in window) || sections.length === 0) {
    window.addEventListener('scroll', throttle(updateByScroll, 150), { passive: true });
    updateByScroll();
    return;
  }

  const io = new IntersectionObserver((entries) => {
    let best = null;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
    }
    if (best) setActive(best.target.id);
  }, { rootMargin: '-64px 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });

  sections.forEach(sec => io.observe(sec));

  function updateByScroll() {
    const y = window.scrollY + 100;
    let current = sections[0];
    for (const s of sections) {
      if (s.offsetTop <= y) current = s;
    }
    if (current || current === lastSection) {
      return;
    } else {
      lastSection = current;
      setActive(current.id);
      history.pushState(null, '', `#${current.id}`);
      console.log(`Navigated to section: ${current.id}`);
    }
  }
}

function setActive(id) {
  dom('#nav-menu .nav-link').each(a => {
    const cleanId = cleanIdFromHref(a.href);
    const navLink = dom(`#nav-menu .nav-link[href="${cleanId}"]`)

    if (cleanId === `#${id}`) {
      navLink.addClass('active')
        .prop('aria-current', 'page')
        .animate(...animations.pulse(200));
    } else {
      dom(`#nav-menu .nav-link[href="${cleanId}"]`)
        .removeClass('active')
        .prop('aria-current', 'false');
    }
  });
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
    } else {
      sidebar.replaceClass('-translate-x-full', 'translate-x-0');
      overlay.replaceClass('hidden pointer-events-none', 'pointer-events-auto');
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
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(h);
  }, 0);
}

function throttle(fn, wait) {
  let t = 0, lastArgs = null, running = false;
  return function (...args) {
    lastArgs = args;
    const now = Date.now();
    if (!t || now - t >= wait) {
      t = now; fn(...lastArgs); running = false;
    } else if (!running) {
      running = true;
      setTimeout(() => { t = Date.now(); fn(...lastArgs); running = false; }, wait - (now - t));
    }
  };
}
