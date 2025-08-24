// Test script to verify all sections load without errors
console.log('Testing documentation sections...');

// Test that all required templates exist
const requiredTemplates = [
  '#nav-item-template',
  '#section-template', 
  '#subsection-template',
  '#example-template',
  '#template-demo-item',
  '#form-result-template',
  '#message-template',
  '#advanced-card-template'
];

requiredTemplates.forEach(templateId => {
  const template = document.querySelector(templateId);
  if (template) {
    console.log(`✓ Template ${templateId} found`);
  } else {
    console.error(`✗ Template ${templateId} missing`);
  }
});

// Test that vk is available globally
if (window.vk) {
  console.log('✓ vk global object available');
} else {
  console.error('✗ vk global object missing');
}

// Test sections are rendered
const expectedSections = [
  '#getting-started',
  '#installation', 
  '#core-api',
  '#templates',
  '#forms',
  '#events',
  '#http',
  '#animation',
  '#plugins'
];

setTimeout(() => {
  expectedSections.forEach(sectionId => {
    const section = document.querySelector(sectionId);
    if (section) {
      console.log(`✓ Section ${sectionId} rendered`);
    } else {
      console.error(`✗ Section ${sectionId} missing`);
    }
  });
  
  console.log('Documentation test complete!');
}, 1000);
