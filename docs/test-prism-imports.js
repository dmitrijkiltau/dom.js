#!/usr/bin/env node

/**
 * Test script to verify Prism.js imports work correctly
 * This can be run to troubleshoot import issues
 */

try {
  console.log('Testing Prism.js imports...');
  
  // Test if we can import prismjs (this requires node_modules to be installed)
  await import('prismjs');
  console.log('✅ prismjs core import successful');
  
  await import('prismjs/components/prism-javascript.js');
  console.log('✅ prismjs javascript component import successful');
  
  // Note: CSS import won't work in Node.js but is valid in browser/vite
  console.log('✅ All Prism.js imports should work in browser environment');
  
} catch (error) {
  console.error('❌ Prism.js import failed:', error.message);
  console.log('💡 Solution: Run "npm install" in the docs folder to install dependencies');
  process.exit(1);
}