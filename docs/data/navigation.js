// Navigation data derived from sections to ensure consistent ordering
import { sections } from './sections.js';

export const navigationItems = sections.map(s => ({ title: s.title, href: `#${s.id}` }));
