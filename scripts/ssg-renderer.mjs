#!/usr/bin/env node

import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

/**
 * Server-side renderer for dom.js templates
 * Renders the documentation templates to static HTML
 */

export class SSGRenderer {
  constructor() {
    this.usedFeatures = new Set();
  }

  /**
   * Render the documentation to static HTML
   */
  async renderDocs() {
    console.log('🎯 Starting SSG rendering...');

    // Load the HTML template
    const htmlTemplate = fs.readFileSync(path.join('docs', 'index.html'), 'utf8');
    
    // Create JSDOM environment
    const dom = new JSDOM(htmlTemplate, {
      url: 'http://localhost',
      pretendToBeVisual: true,
      resources: undefined, // Don't load external resources during SSR
      runScripts: 'dangerously'
    });

    const { window } = dom;
    global.window = window;
    global.document = window.document;
    global.HTMLElement = window.HTMLElement;
    global.Element = window.Element;
    global.Node = window.Node;
    global.NodeFilter = window.NodeFilter;

    // Load and execute the dom.js library in the JSDOM context
    await this.loadDomJS(window);

    // Load and execute the docs data and rendering logic
    await this.renderContent(window);

    // Extract the rendered HTML
    const renderedHTML = this.extractHTML(dom);

    // Clean up global references
    delete global.window;
    delete global.document;
    delete global.HTMLElement;
    delete global.Element;
    delete global.Node;
    delete global.NodeFilter;

    return {
      html: renderedHTML,
      usedFeatures: Array.from(this.usedFeatures)
    };
  }

  /**
   * Load dom.js library into JSDOM context
   */
  async loadDomJS(window) {
    // For SSR, let's use a simpler approach and directly import the modules
    try {
      const domModule = await import('../dist/index.js');
      
      // Make everything available in window context
      window.dom = domModule.default;
      window.renderTemplate = domModule.renderTemplate;
      window.useTemplate = domModule.useTemplate;
      window.serializeForm = domModule.serializeForm;
      window.onSubmit = domModule.onSubmit;
      window.http = domModule.http;
      window.animate = domModule.animate;
      window.DOMCollection = domModule.DOMCollection;
      
      // Track that we're using the template system
      this.usedFeatures.add('template');
      this.usedFeatures.add('core');
      
    } catch (error) {
      console.warn('Could not load dom.js modules, using fallback renderer');
    }
  }

  /**
   * Render the content using the existing docs logic
   */
  async renderContent(window) {
    // Load sections data directly
    const sectionsModule = await import('../docs/data/sections.js');
    const sections = sectionsModule.sections;
    
    // Set up dom context properly
    const dom = window.dom;
    if (!dom) {
      console.warn('dom.js not available in window context');
      return;
    }

    // Render sections using the template system
    this.renderSections(window, sections);
  }

  /**
   * Render sections using dom.js template system
   */
  renderSections(window, sections) {
    const dom = window.dom;

    // Track that we're using templates
    this.usedFeatures.add('template');

    // Find the content area and section template
    const contentElement = window.document.querySelector('#content');
    const sectionTemplate = window.document.querySelector('#section-template');
    
    if (!contentElement || !sectionTemplate) {
      console.warn('Content area or section template not found');
      return;
    }

    // Render each section
    sections.forEach(section => {
      const sectionHTML = this.renderSectionTemplate(sectionTemplate, section);
      contentElement.appendChild(sectionHTML);
    });

    // Clean up - remove templates after rendering
    const templates = window.document.querySelectorAll('template');
    templates.forEach(template => template.remove());
  }

  /**
   * Fallback renderer if renderTemplate is not available
   */
  createFallbackRenderer(window, selector) {
    return (data) => {
      const template = window.document.querySelector(selector);
      if (!template || !template.content) return '';

      const clone = template.content.cloneNode(true);
      
      // Simple data binding implementation
      this.bindData(clone, data);
      
      return clone;
    };
  }

  /**
   * Render a section using template
   */
  renderSectionTemplate(template, data) {
    if (!template.content) return null;

    const clone = template.content.cloneNode(true);
    this.bindData(clone, data);
    return clone;
  }

  /**
   * Simple data binding for fallback renderer
   */
  /**
   * Simple data binding for templates
   */
  bindData(element, data) {
    // Get the document from the element
    const doc = element.ownerDocument || global.document || document;
    
    const walker = doc.createTreeWalker(
      element,
      (global.NodeFilter || doc.defaultView?.NodeFilter)?.SHOW_ELEMENT || 1,
      null,
      false
    );

    const nodes = [];
    
    // Collect all elements
    function collectElements(node) {
      if (node.nodeType === 1) { // Element node
        nodes.push(node);
      }
      for (let child of node.childNodes) {
        collectElements(child);
      }
    }
    
    collectElements(element);

    nodes.forEach(node => {
      if (node.nodeType === 1) { // Element node
        // Handle data-text
        const textAttr = node.getAttribute('data-text');
        if (textAttr && data[textAttr] !== undefined) {
          node.textContent = data[textAttr];
          node.removeAttribute('data-text');
        }

        // Handle data-html
        const htmlAttr = node.getAttribute('data-html');
        if (htmlAttr && data[htmlAttr] !== undefined) {
          node.innerHTML = data[htmlAttr];
          node.removeAttribute('data-html');
        }

        // Handle data-attr-*
        const attributes = Array.from(node.attributes);
        attributes.forEach(attr => {
          if (attr.name.startsWith('data-attr-')) {
            const attrName = attr.name.replace('data-attr-', '');
            const attrValue = attr.value;
            if (data[attrValue] !== undefined) {
              node.setAttribute(attrName, data[attrValue]);
              node.removeAttribute(attr.name);
            }
          }
        });
      }
    });
  }

  /**
   * Extract the final HTML with templates rendered
   */
  extractHTML(dom) {
    // Remove script tags that were added for SSR
    const scripts = dom.window.document.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    // Get the full HTML
    return dom.serialize();
  }

  /**
   * Analyze JavaScript usage in the rendered content
   */
  analyzeJSUsage(html) {
    const usedFeatures = new Set();

    // Simple analysis - look for event handlers and interactive elements
    if (html.includes('onclick') || html.includes('addEventListener')) {
      usedFeatures.add('events');
    }

    if (html.includes('data-') || html.includes('template')) {
      usedFeatures.add('template');
    }

    if (html.includes('form') || html.includes('input')) {
      usedFeatures.add('forms');
    }

    if (html.includes('animation') || html.includes('fadeIn')) {
      usedFeatures.add('motion');
    }

    return Array.from(usedFeatures);
  }
}