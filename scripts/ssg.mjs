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
      const finalHTML = this.injectOptimizedJS(html, optimizedJS, jsAnalysis);
      console.log('   ✅ HTML generation complete\n');

      // Step 5: Write output files
      console.log('💾 Writing output files...');
      this.writeOutputFiles(finalHTML, optimizedJS, bundleInfo);
      console.log('   ✅ Files written successfully\n');

      // Step 6: Copy static assets
      console.log('📁 Copying static assets...');
      await this.copyStaticAssets();
      console.log('   ✅ Assets copied\n');

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

    // Generate optimized imports
    const optimizedImport = this.analyzer.generateOptimizedImport(requiredModules);

    // Read the minimal client-side code needed
    const clientCode = this.generateClientCode(analysis);

    const optimizedJS = `
${optimizedImport}

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
        import: optimizedImport
      }
    };
  }

  /**
   * Generate minimal client-side code
   */
  generateClientCode(analysis) {
    const { usedFeatures } = analysis;

    let clientCode = `
// Minimal client-side code for interactivity

// Make dom available globally for console debugging
if (typeof dom !== 'undefined') {
  window.dom = dom;
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

    // Create optimized script tag
    const optimizedScript = `<script type="module">\n${optimizedJS}\n</script>`;

    // Inject before closing body tag
    finalHTML = finalHTML.replace('</body>', `  ${optimizedScript}\n</body>`);

    // Add build info comment
    const buildInfo = `
<!--
  Built with dom-ssg
  Modules: ${analysis.requiredModules.join(', ')}
  Features: ${analysis.usedFeatures.join(', ')}
  Bundle optimization: Generated at build time
-->
`;

    finalHTML = finalHTML.replace('<head>', `<head>\n${buildInfo}`);

    return finalHTML;
  }

  /**
   * Write output files
   */
  writeOutputFiles(html, js, bundleInfo) {
    // Write main HTML file
    fs.writeFileSync(path.join(this.options.distDir, 'index.html'), html);

    // Write bundle info
    fs.writeFileSync(
      path.join(this.options.distDir, 'bundle-info.json'),
      JSON.stringify(bundleInfo, null, 2)
    );

    // Write optimized JS separately for debugging
    fs.writeFileSync(path.join(this.options.distDir, 'optimized.js'), js);
  }

  /**
   * Copy static assets (CSS, images, etc.)
   */
  async copyStaticAssets() {
    const assetsSrc = path.join(this.options.srcDir, 'dist', 'assets');
    const assetsDest = path.join(this.options.distDir, 'assets');

    if (fs.existsSync(assetsSrc)) {
      // Copy CSS files
      if (!fs.existsSync(assetsDest)) {
        fs.mkdirSync(assetsDest, { recursive: true });
      }

      const files = fs.readdirSync(assetsSrc);
      files.forEach(file => {
        if (file.endsWith('.css')) {
          fs.copyFileSync(
            path.join(assetsSrc, file),
            path.join(assetsDest, file)
          );
        }
      });
    }
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