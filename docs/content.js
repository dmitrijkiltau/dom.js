import dom, { useTemplate } from '../dist/index.js';
import { sections } from './data/sections.js';
import { addCoreApiExamples } from './sections/core-api.js';
import { addTemplateExamples } from './sections/templates.js';
import { addDomManipulationExamples } from './sections/dom-manipulation.js';
import { addFormExamples } from './sections/forms.js';
import { addEventExamples } from './sections/events.js';
import { addHttpExamples } from './sections/http.js';
import { addAnimationExamples } from './sections/animation.js';
import { addPluginExamples } from './sections/plugins.js';
import { addLayoutExamples } from './sections/layout.js';

const renderSection = useTemplate('#section-template');
const renderTabbedExamples = useTemplate('#tabbed-examples-template');
const renderTab = useTemplate('#tab-template');
const renderTabPanel = useTemplate('#tab-panel-template');

// Utility function to create tabbed examples
export function createTabbedExamples({ id, title, description, tabs }) {
  // Create the main container
  const container = renderTabbedExamples({ id, title, description });
  
  // Find tabs container and content container
  const tabsList = container.querySelector('[data-tabs-container="true"]');
  const tabsContent = container.querySelector('[data-tabs-content="true"]');
  
  // Add each tab and its panel
  tabs.forEach((tab, index) => {
    // Create tab button
    const tabButton = renderTab({ 
      id: tab.id, 
      title: tab.title 
    });
    tabsList.appendChild(tabButton);
    
    // Create tab panel
    const tabPanel = renderTabPanel({
      id: tab.id,
      demo: tab.demo,
      code: tab.code
    });
    tabsContent.appendChild(tabPanel);
  });
  
  return container;
}

export function initContent() {
  const content = dom('#content');

  for (const section of sections) {
    content.append(renderSection(section));
  }

  // Add examples to specific sections
  addCoreApiExamples();
  addDomManipulationExamples();
  addLayoutExamples();
  addTemplateExamples();
  addFormExamples();
  addEventExamples();
  addHttpExamples();
  addAnimationExamples();
  addPluginExamples();
}
