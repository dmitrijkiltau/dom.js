import vk, { useTemplate } from '../dist/index.js';
import { sections } from './data/sections.js';
import { addCoreApiExamples } from './sections/core-api.js';
import { addTemplateExamples } from './sections/templates.js';
import { addFormExamples } from './sections/forms.js';
import { addEventExamples } from './sections/events.js';
import { addHttpExamples } from './sections/http.js';
import { addAnimationExamples } from './sections/animation.js';
import { addPluginExamples } from './sections/plugins.js';

const renderSection = useTemplate('#section-template');

export function initContent() {
  const content = vk('#content');

  for (const section of sections) {
    content.append(renderSection(section));
  }

  // Add examples to specific sections
  addCoreApiExamples();
  addTemplateExamples();
  addFormExamples();
  addEventExamples();
  addHttpExamples();
  addAnimationExamples();
  addPluginExamples();
}
