#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { SSGRenderer } from './ssg-renderer.mjs';
import { JSUsageAnalyzer } from './analyze-usage.mjs';

/**
 * dom-ssg: Static Site Generator for dom.js applications
 * 
 * Builds finished HTML with only the JS that is needed by:
 * 1. Pre-rendering templates server-side
 * 2. Analyzing JavaScript usage patterns
 * 3. Creating optimized bundles
 */

class DomSSG {
  constructor(options = {}) {
    this.options = {
      srcDir: 'docs',
      distDir: 'docs/dist-ssg',
      analyzer: true,
      optimize: true,
      ...options
    };

    this.renderer = new SSGRenderer();
    this.analyzer = new JSUsageAnalyzer();
  }

  /**
   * Main build process
   */
  async build() {
    console.log('🚀 Starting dom-ssg build...\n');

    // Ensure dist directory exists
    this.ensureDistDir();

    try {
      // Step 1: Render HTML with templates
      console.log('📄 Rendering templates to static HTML...');
      const { html, usedFeatures } = await this.renderer.renderDocs();
      console.log(`   ✅ Templates rendered (${usedFeatures.length} features detected)\n`);

      // Step 2: Analyze JavaScript usage
      console.log('🔍 Analyzing JavaScript usage...');
      const jsAnalysis = this.analyzeJavaScriptUsage(html);
      console.log(`   ✅ Analysis complete (${jsAnalysis.requiredModules.length} modules needed)\n`);

      // Step 3: Create optimized JavaScript bundle
      console.log('⚡ Creating optimized JavaScript bundle...');
      const { optimizedJS, bundleInfo } = await this.createOptimizedBundle(jsAnalysis);
      console.log(`   ✅ Bundle created (${bundleInfo.optimizedSize}KB vs ${bundleInfo.fullSize}KB - ${bundleInfo.percentSavings}% savings)\n`);

      // Step 4: Generate final HTML
      console.log('📝 Generating final HTML...');
      let finalHTML = this.injectOptimizedJS(html, optimizedJS, jsAnalysis);
      console.log('   ✅ HTML generation complete\n');

      // Step 5: Copy static assets and get CSS filename
      console.log('📁 Copying static assets...');
      const assetInfo = await this.copyStaticAssets();
      console.log('   ✅ Assets copied\n');

      // Step 6: Update CSS references in HTML
      if (assetInfo.cssFile) {
        finalHTML = this.updateCSSReferences(finalHTML, assetInfo.cssFile);
      }

      // Step 7: Write output files
      console.log('💾 Writing output files...');
      this.writeOutputFiles(finalHTML, optimizedJS, bundleInfo);
      console.log('   ✅ Files written successfully\n');

      // Display build summary
      this.displayBuildSummary(bundleInfo, jsAnalysis);

      return {
        success: true,
        bundleInfo,
        analysis: jsAnalysis
      };

    } catch (error) {
      console.error('❌ Build failed:', error.message);
      if (this.options.verbose) {
        console.error(error.stack);
      }
      return { success: false, error };
    }
  }

  /**
   * Ensure the dist directory exists
   */
  ensureDistDir() {
    if (!fs.existsSync(this.options.distDir)) {
      fs.mkdirSync(this.options.distDir, { recursive: true });
    }
  }

  /**
   * Analyze JavaScript usage in the rendered HTML and source files
   */
  analyzeJavaScriptUsage(html) {
    // For SSG, use the SSG-specific HTML analysis that doesn't include pre-rendered features
    const htmlAnalysis = this.analyzer.analyzeHTMLForSSG(html);

    // Analyze only the client-side interactive JavaScript files
    const interactiveJSFiles = [
      // Don't analyze content.js since templates are pre-rendered
      // path.join(this.options.srcDir, 'content.js'),
      // Only analyze files that handle client-side interactivity
    ];

    const jsAnalysis = this.analyzer.analyzeFiles(interactiveJSFiles);

    // For SSG, we primarily rely on HTML analysis since templates are pre-rendered
    // and most JS features are either pre-rendered or minimal for interactivity
    return {
      usedFeatures: htmlAnalysis.usedFeatures,
      requiredModules: htmlAnalysis.requiredModules,
      htmlAnalysis,
      jsAnalysis
    };
  }

  /**
   * Create optimized JavaScript bundle
   */
  async createOptimizedBundle(analysis) {
    const { requiredModules } = analysis;

    // Calculate bundle size information
    const bundleInfo = this.analyzer.calculateSavings(requiredModules);

    // Read and inline the actual dom.js code instead of importing
    const domJSCode = await this.readDomJSBundle(requiredModules);

    // Read the minimal client-side code needed
    const clientCode = this.generateClientCode(analysis);

    const optimizedJS = `
${domJSCode}

${clientCode}

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
`.trim();

    return {
      optimizedJS,
      bundleInfo: {
        ...bundleInfo,
        modules: requiredModules,
        bundled: true // Mark as bundled instead of imported
      }
    };
  }

  /**
   * Read and prepare the dom.js bundle code for inlining
   */
  async readDomJSBundle(requiredModules) {
    // For SSG, we always use the core module as the base
    // Read the built CommonJS bundle which is self-contained
    const corePath = path.join('dist', 'core.cjs');
    
    if (!fs.existsSync(corePath)) {
      throw new Error('dom.js core bundle not found. Run `npm run build` first.');
    }
    
    let domJSCode = fs.readFileSync(corePath, 'utf8');
    
    // Convert CommonJS to make dom available globally
    // Remove the CommonJS exports and module.exports
    domJSCode = domJSCode.replace(/module\.exports[^;]*;/g, '');
    domJSCode = domJSCode.replace(/var R=.*?;D\(R,.*?\);\s*/gs, '');
    domJSCode = domJSCode.replace(/module\.exports=P\(R\);\s*/g, '');
    
    // Extract the core functionality and make it globally available
    // The core.cjs defines 'k' as the main dom function, we need to make it global
    domJSCode += `
// Make dom globally available for SSG
window.dom = typeof k !== 'undefined' ? k : (typeof A !== 'undefined' ? A : undefined);
if (!window.dom) {
  console.error('Could not find dom function in bundle');
}
`;

    return `// dom.js core bundle (inlined for SSG)\n${domJSCode}`;
  }

  /**
   * Generate minimal client-side code
   */
  generateClientCode(analysis) {
    const { usedFeatures } = analysis;

    let clientCode = `
// Minimal client-side code for interactivity

// Ensure dom is available (should be set by the inlined bundle above)
const dom = window.dom;
if (!dom) {
  console.error('dom.js not available - SSG bundle may have failed to load');
  return;
}
`;

    // Add only the interactive features that are actually needed
    if (usedFeatures.includes('core')) {
      clientCode += `
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
`;
    }

    return clientCode;
  }

  /**
   * Inject optimized JavaScript into HTML
   */
  injectOptimizedJS(html, optimizedJS, analysis) {
    // Remove the original large script tag
    let finalHTML = html.replace(/<script[^>]*src="[^"]*assets\/[^"]*\.js"[^>]*><\/script>/g, '');

    // Create optimized script tag (no type="module" needed since we're bundling everything)
    const optimizedScript = `<script>\n${optimizedJS}\n</script>`;

    // Inject before closing body tag
    finalHTML = finalHTML.replace('</body>', `  ${optimizedScript}\n</body>`);

    // Add build info comment
    const buildInfo = `
<!--
  Built with dom-ssg
  Modules: ${analysis.requiredModules.join(', ')}
  Features: ${analysis.usedFeatures.join(', ')}
  Bundle optimization: Inlined at build time
-->
`;

    finalHTML = finalHTML.replace('<head>', `<head>\n${buildInfo}`);

    return finalHTML;
  }

  /**
   * Write output files with minification
   */
  writeOutputFiles(html, js, bundleInfo) {
    // Minify HTML before writing
    const minifiedHTML = this.minifyHTML(html);
    
    // Write main HTML file
    fs.writeFileSync(path.join(this.options.distDir, 'index.html'), minifiedHTML);

    // Write bundle info
    fs.writeFileSync(
      path.join(this.options.distDir, 'bundle-info.json'),
      JSON.stringify(bundleInfo, null, 2)
    );

    // Write optimized JS separately for debugging
    fs.writeFileSync(path.join(this.options.distDir, 'optimized.js'), js);
  }

  /**
   * Simple HTML minification
   */
  minifyHTML(html) {
    return html
      // Remove HTML comments (except build info comments)
      .replace(/<!--(?!\s*Built with dom-ssg)[\s\S]*?-->/g, '')
      // Remove extra whitespace between tags
      .replace(/>\s+</g, '><')
      // Remove whitespace at the beginning of lines
      .replace(/^\s+/gm, '')
      // Remove empty lines
      .replace(/\n\s*\n/g, '\n')
      // Preserve single spaces in text content but remove excessive whitespace
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /**
   * Copy static assets (CSS, images, etc.) and minify CSS
   */
  async copyStaticAssets() {
    const assetsSrc = path.join(this.options.srcDir, 'dist', 'assets');
    const assetsDest = path.join(this.options.distDir, 'assets');
    let cssFile = null;

    if (fs.existsSync(assetsSrc)) {
      // Copy CSS files with minification
      if (!fs.existsSync(assetsDest)) {
        fs.mkdirSync(assetsDest, { recursive: true });
      }

      const files = fs.readdirSync(assetsSrc);
      files.forEach(file => {
        if (file.endsWith('.css')) {
          let cssContent = fs.readFileSync(path.join(assetsSrc, file), 'utf8');
          
          // Simple CSS minification
          cssContent = this.minifyCSS(cssContent);
          
          fs.writeFileSync(path.join(assetsDest, file), cssContent);
          cssFile = file; // Store the CSS filename for reference updating
        }
      });
    }

    return { cssFile };
  }

  /**
   * Simple CSS minification
   */
  minifyCSS(css) {
    return css
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove whitespace around certain characters
      .replace(/\s*([{}:;,>~+])\s*/g, '$1')
      // Remove trailing semicolons before closing braces
      .replace(/;}/g, '}')
      // Remove unnecessary quotes around values
      .replace(/(['"])((?:\\.|(?!\1)[^\\])*?)\1/g, (match, quote, content) => {
        // Keep quotes if content contains spaces or special characters
        if (/[\s,();{}]/.test(content)) return match;
        return content;
      })
      .trim();
  }

  /**
   * Update CSS references in HTML to point to hashed filenames
   */
  updateCSSReferences(html, cssFile) {
    // Replace generic style.css reference with the actual hashed CSS filename
    return html.replace(
      /href="\.\/style\.css"/g, 
      `href="./assets/${cssFile}"`
    );
  }

  /**
   * Display build summary
   */
  displayBuildSummary(bundleInfo, analysis) {
    console.log('📊 Build Summary');
    console.log('================');
    console.log(`Bundle Size:     ${bundleInfo.optimizedSize}KB (${bundleInfo.percentSavings}% smaller)`);
    console.log(`Modules:         ${analysis.requiredModules.join(', ')}`);
    console.log(`Features:        ${analysis.usedFeatures.join(', ')}`);
    console.log(`Output:          ${this.options.distDir}/index.html`);
    console.log('\n✅ SSG build completed successfully!');
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const ssg = new DomSSG();
  ssg.build().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

export { DomSSG };