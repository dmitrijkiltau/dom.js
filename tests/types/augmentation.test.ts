// Type-only test to validate module augmentation and typing of plugins.
// Compiled via tests/tsconfig.types.json with noEmit.

import dom, { DOMCollection } from '@klt/dom-js';

// 1) Augment the Dom interface with a new method signature
declare module '@klt/dom-js' {
  interface Dom {
    highlight(selector: string): DOMCollection;
  }
}

// 2) Register a plugin that implements the augmented method
dom.use((api) => {
  api.highlight = (selector: string) => api(selector).addClass('highlighted');
});

// 3) Type checks
const $col: DOMCollection = dom.highlight('.message');
$col.addClass('ok');

// Ensure typed selection still works
const $btn = dom<HTMLButtonElement>('#save');
$btn.on('click', (e, el) => { el.disabled = true; });
