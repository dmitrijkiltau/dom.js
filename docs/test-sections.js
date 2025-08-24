// Test script to verify all sections load properly
import './main.js';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Testing documentation sections...');
  
  // Test if all section elements exist
  const sections = [
    'core-api',
    'templates', 
    'forms',
    'events',
    'http',
    'animation',
    'plugins'
  ];
  
  sections.forEach(sectionId => {
    const element = document.getElementById(sectionId);
    if (element) {
      console.log(`✅ Section ${sectionId} element found`);
    } else {
      console.error(`❌ Section ${sectionId} element missing`);
    }
  });
  
  // Test if templates exist
  const templates = [
    'card-template',
    'list-item-template', 
    'advanced-card-template'
  ];
  
  templates.forEach(templateId => {
    const template = document.getElementById(templateId);
    if (template) {
      console.log(`✅ Template ${templateId} found`);
    } else {
      console.error(`❌ Template ${templateId} missing`);
    }
  });
  
  // Test if navigation elements exist
  const nav = document.getElementById('sidebar');
  if (nav) {
    console.log('✅ Navigation sidebar found');
    const links = nav.querySelectorAll('a[href^="#"]');
    console.log(`📋 Found ${links.length} navigation links`);
  } else {
    console.error('❌ Navigation sidebar missing');
  }
  
  // Test if main content exists
  const main = document.getElementById('main-content');
  if (main) {
    console.log('✅ Main content area found');
  } else {
    console.error('❌ Main content area missing');
  }
  
  console.log('🏁 Section testing complete');
});
