import { test } from 'vitest';
import dom from '../dist/index.js';
import domCore from '../dist/core.js';
import { http } from '../dist/http.js';
import { renderTemplate } from '../dist/template.js';
import { serializeForm } from '../dist/forms.js';
import { animate, animations } from '../dist/motion.js';

// Test core module
test('Core module exports dom function', () => {
  if (typeof domCore !== 'function') throw new Error('domCore is not a function');
});

test('Core module has DOMCollection', () => {
  if (!domCore.DOMCollection) throw new Error('DOMCollection not found in core');
});

test('Core module can create collections', () => {
  const collection = domCore();
  if (!(collection instanceof domCore.DOMCollection)) throw new Error('Collection not created properly');
});

// Test HTTP module
test('HTTP module exports http object', () => {
  if (!http || typeof http.get !== 'function') throw new Error('HTTP module not properly exported');
});

test('HTTP module has all methods', () => {
  const methods = ['get', 'post', 'put', 'patch', 'delete', 'withTimeout', 'withHeaders'];
  methods.forEach(method => {
    if (typeof http[method] !== 'function') {
      throw new Error(`HTTP method ${method} not found`);
    }
  });
});

// Test template module
test('Template module exports renderTemplate', () => {
  if (typeof renderTemplate !== 'function') throw new Error('renderTemplate not exported');
});

// Test forms module  
test('Forms module exports serializeForm', () => {
  if (typeof serializeForm !== 'function') throw new Error('serializeForm not exported');
});

// Test motion module
test('Motion module exports animate and animations', () => {
  if (typeof animate !== 'function') throw new Error('animate function not exported');
  if (!animations || typeof animations.fadeIn !== 'function') throw new Error('animations object not properly exported');
});

// Test full bundle still works
test('Full bundle maintains backward compatibility', () => {
  if (typeof dom !== 'function') throw new Error('Main dom function not available');
  if (!dom.http) throw new Error('HTTP not available on main export');
  if (!dom.renderTemplate) throw new Error('renderTemplate not available on main export');
  if (!dom.serializeForm) throw new Error('serializeForm not available on main export');
  if (!dom.animate) throw new Error('animate not available on main export');
});

// Test bundle sizes (approximate)
test('Core bundle has fewer features than full bundle', () => {
  // Check that core doesn't have HTTP functionality
  if (domCore.http) throw new Error('Core bundle should not include HTTP functionality');
  if (domCore.renderTemplate) throw new Error('Core bundle should not include template functionality');
  
  // Check that full bundle has everything
  if (!dom.http) throw new Error('Full bundle should include HTTP functionality');
  if (!dom.renderTemplate) throw new Error('Full bundle should include template functionality');
});

// Summary handled by Vitest
