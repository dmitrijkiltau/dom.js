#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

/**
 * Analyzes JavaScript usage to determine minimal dom.js bundle
 */

export class JSUsageAnalyzer {
  constructor() {
    this.coreFeatures = new Set(['dom', 'DOMCollection', 'on', 'off']);
    this.featureMap = {
      'http': ['http', 'get', 'post', 'put', 'patch', 'delete'],
      'template': ['renderTemplate', 'useTemplate', 'tpl'],
      'forms': ['serializeForm', 'toQueryString', 'onSubmit'],
      'motion': ['animate', 'animations', 'fadeIn', 'fadeOut']
    };
  }

  /**
   * Analyze JavaScript files to determine which dom.js features are used
   */
  analyzeFiles(filePaths) {
    const usedFeatures = new Set();
    
    filePaths.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const features = this.extractFeatures(content);
        features.forEach(feature => usedFeatures.add(feature));
      }
    });

    return {
      usedFeatures: Array.from(usedFeatures),
      requiredModules: this.getRequiredModules(usedFeatures)
    };
  }

  /**
   * Analyze HTML content for interactive features (SSG context)
   */
  analyzeHTMLForSSG(html) {
    const usedFeatures = new Set();

    // For a documentation site with SSG, we typically only need core DOM manipulation
    // Templates are pre-rendered, so we don't need template module client-side

    // Always need core for any DOM manipulation
    usedFeatures.add('core');

    // Look for actual JavaScript code (in script tags) not just documentation text
    const scriptTags = html.match(/<script[^>]*>(.*?)<\/script>/gs) || [];
    const scriptContent = scriptTags.join('\n');

    // Be very conservative - only add modules if there's clear evidence in actual JavaScript
    
    // Only add forms if there are actual form submission handlers in JavaScript code
    if (/onSubmit\s*\(|serializeForm\s*\(/.test(scriptContent)) {
      usedFeatures.add('forms');
    }

    // Only add animations if there are programmatic animations in JavaScript code
    if (/\.animate\s*\(|\.fadeIn\s*\(|\.fadeOut\s*\(/.test(scriptContent)) {
      usedFeatures.add('motion');
    }

    // Only add HTTP if there are actual API calls in JavaScript code
    if (/http\.[a-z]+\s*\(|fetch\s*\(/.test(scriptContent)) {
      usedFeatures.add('http');
    }

    return {
      usedFeatures: Array.from(usedFeatures),
      requiredModules: this.getRequiredModules(usedFeatures)
    };
  }

  /**
   * Extract dom.js features from JavaScript code
   */
  extractFeatures(code) {
    const features = new Set();

    // Look for dom.js imports
    const importMatches = code.match(/import.*?from.*?['"](.*?dom\.js.*?)['"]/) || [];
    importMatches.forEach(() => features.add('core'));

    // Look for specific method calls
    Object.entries(this.featureMap).forEach(([module, methods]) => {
      methods.forEach(method => {
        const patterns = [
          new RegExp(`\\b${method}\\s*\\(`, 'g'),
          new RegExp(`\\.${method}\\s*\\(`, 'g'),
          new RegExp(`dom\\.${method}`, 'g')
        ];

        if (patterns.some(pattern => pattern.test(code))) {
          features.add(module);
        }
      });
    });

    // Look for chaining methods that indicate core usage
    if (/\.(addClass|removeClass|css|on|off|click|find)/.test(code)) {
      features.add('core');
    }

    return Array.from(features);
  }

  /**
   * Check if HTML has event handlers
   */
  hasEventHandlers(html) {
    return /on\w+\s*=/.test(html) || 
           /addEventListener/.test(html) ||
           /\.on\(/.test(html);
  }

  /**
   * Check if HTML has form handlers (not just forms)
   */
  hasFormHandlers(html) {
    return /serializeForm|onSubmit|form.*addEventListener/i.test(html);
  }

  /**
   * Check if HTML has dynamic animations (not just CSS)
   */
  hasDynamicAnimations(html) {
    return /\.animate\(|\.fadeIn|\.fadeOut|animations\./i.test(html);
  }

  /**
   * Check if there are actual API calls in JS
   */
  hasAPICallsInJS(html) {
    return /http\.get|http\.post|fetch\(/i.test(html);
  }

  /**
   * Check if HTML has forms
   */
  hasForms(html) {
    return /<form/.test(html);
  }

  /**
   * Check if HTML has animations
   */
  hasAnimations(html) {
    return /fadeIn|fadeOut|animate/.test(html) ||
           /animation/.test(html) ||
           /transition/.test(html);
  }

  /**
   * Check if HTML indicates HTTP usage
   */
  hasHTTP(html) {
    return /fetch|http\.|xhr|ajax/i.test(html) ||
           /api\/|\/api/.test(html);
  }

  /**
   * Get required modules based on used features
   */
  getRequiredModules(usedFeatures) {
    const modules = ['core']; // Always need core

    if (usedFeatures.has('http')) {
      modules.push('http');
    }

    if (usedFeatures.has('template')) {
      modules.push('template');
    }

    if (usedFeatures.has('forms')) {
      modules.push('forms');
    }

    if (usedFeatures.has('motion')) {
      modules.push('motion');
    }

    return modules;
  }

  /**
   * Generate optimized import statement
   */
  generateOptimizedImport(requiredModules) {
    if (requiredModules.length === 1 && requiredModules[0] === 'core') {
      return "import dom from '@dmitrijkiltau/dom.js/core';";
    }

    if (requiredModules.length <= 2) {
      // Use modular imports
      const imports = [];
      imports.push("import dom from '@dmitrijkiltau/dom.js/core';");
      
      requiredModules.forEach(module => {
        if (module !== 'core') {
          const moduleImports = this.getModuleImports(module);
          imports.push(`import { ${moduleImports.join(', ')} } from '@dmitrijkiltau/dom.js/${module}';`);
        }
      });

      return imports.join('\n');
    }

    // Use full bundle if many modules are needed
    return "import dom from '@dmitrijkiltau/dom.js';";
  }

  /**
   * Get the main exports for a module
   */
  getModuleImports(module) {
    const moduleExports = {
      'http': ['http'],
      'template': ['renderTemplate', 'useTemplate'],
      'forms': ['serializeForm', 'onSubmit'],
      'motion': ['animate', 'animations']
    };

    return moduleExports[module] || [];
  }

  /**
   * Calculate bundle size savings
   */
  calculateSavings(requiredModules) {
    // Approximate sizes from the build output
    const moduleSizes = {
      'full': 13, // ~13KB full bundle
      'core': 7,  // ~7KB core only
      'http': 2,  // ~2KB additional
      'template': 2, // ~2KB additional
      'forms': 1,    // ~1KB additional
      'motion': 1    // ~1KB additional
    };

    let estimatedSize = moduleSizes.core;
    requiredModules.forEach(module => {
      if (module !== 'core' && moduleSizes[module]) {
        estimatedSize += moduleSizes[module];
      }
    });

    const fullSize = moduleSizes.full;
    const savings = fullSize - estimatedSize;
    const percentSavings = Math.round((savings / fullSize) * 100);

    return {
      fullSize,
      optimizedSize: estimatedSize,
      savings,
      percentSavings
    };
  }
}