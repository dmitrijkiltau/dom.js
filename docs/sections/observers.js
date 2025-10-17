import dom, { useTemplate, onIntersect, onResize, onMutation } from '../../dist/index.js';
import { createTabbedExamples } from '../content.js';

const renderSubsection = useTemplate('#subsection-template');

export function addObserverExamples() {
  const section = dom('#observers');
  if (section.length === 0) return;

  section.append(renderSubsection({
    id: 'observers-examples',
    title: 'Interactive Examples',
    content: `<p class="text-gray-700 mb-4">Observe intersections, resizes, and DOM mutations.</p>`
  }));

  const tabs = createTabbedExamples({
    id: 'observers-tabs',
    title: 'Observers',
    description: 'Intersection, Resize, and Mutation Observer wrappers',
    tabs: [
      {
        id: 'intersection',
        title: 'Intersection',
        demo: `
          <div class="space-y-4">
            <div class="h-40 overflow-auto border rounded p-2 bg-gray-50" id="io-container">
              ${Array.from({ length: 15 }, (_, i) => `<div class=\"io-item my-2 p-2 border rounded bg-white\">Item ${i + 1}</div>`).join('')}
            </div>
            <div class="text-sm text-gray-700 bg-gray-100 p-3 rounded h-24 overflow-auto" id="io-log"></div>
          </div>
        `,
        code: `import { onIntersect } from '@dk/dom-js/observers';

const stop = onIntersect('.lazy', (entry, el) => {
  if (entry.isIntersecting) {
    el.classList.add('visible');
    stop(); // unobserve
  }
}, { threshold: 0.2 });`
      },
      {
        id: 'resize',
        title: 'Resize',
        demo: `
          <div class="space-y-4">
            <div class="flex gap-2">
              <button id="resize-grow" class="btn btn-primary text-sm">Grow</button>
              <button id="resize-shrink" class="btn btn-secondary text-sm">Shrink</button>
            </div>
            <div id="resize-target" class="p-2 border rounded bg-white" style="width:160px;height:90px">Resize me</div>
            <div class="text-sm text-gray-700 bg-gray-100 p-3 rounded h-24 overflow-auto" id="resize-log"></div>
          </div>
        `,
        code: `import { onResize } from '@dk/dom-js/observers';

onResize('#box', (entry, el) => {
  console.log(entry.contentRect.width, entry.contentRect.height);
});`
      },
      {
        id: 'mutation',
        title: 'Mutation',
        demo: `
          <div class="space-y-4">
            <div class="flex gap-2">
              <button id="mut-add" class="btn btn-primary text-sm">Add</button>
              <button id="mut-remove" class="btn btn-secondary text-sm">Remove</button>
              <button id="mut-attr" class="btn btn-outline text-sm">Toggle Attr</button>
            </div>
            <div id="mut-target" class="p-2 border rounded bg-white min-h-[60px]">Target</div>
            <div class="text-sm text-gray-700 bg-gray-100 p-3 rounded h-24 overflow-auto" id="mut-log"></div>
          </div>
        `,
        code: `import { onMutation } from '@dk/dom-js/observers';

onMutation('#list', (records, el) => console.log(records), { childList: true, subtree: true });`
      }
    ]
  });

  section.append(tabs);

  // Intersection demo
  const ioLog = (m) => {
    const ts = new Date().toLocaleTimeString();
    dom('#io-log').append(`<div>[${ts}] ${m}</div>`);
    const el = dom('#io-log').el(); if (el) el.scrollTop = el.scrollHeight;
  };
  const stopIO = onIntersect('#observers .io-item', (entry, el) => {
    if (entry.isIntersecting) {
      dom(el).addClass('bg-green-50 border-green-300');
      ioLog(`Visible: ${el.textContent.trim()}`);
    }
  }, { root: dom('#io-container').el(), threshold: 0.25 });

  // Resize demo
  onResize('#resize-target', (entry, el) => {
    const { width, height } = entry.contentRect;
    dom('#resize-log').append(`<div>${Math.round(width)} x ${Math.round(height)}</div>`);
    const log = dom('#resize-log').el(); if (log) log.scrollTop = log.scrollHeight;
  });
  dom('#resize-grow').on('click', () => {
    const el = dom('#resize-target');
    const w = Math.min(300, (parseInt(el.css('width')) || 160) + 20);
    const h = Math.min(200, (parseInt(el.css('height')) || 90) + 15);
    el.css({ width: w + 'px', height: h + 'px' });
  });
  dom('#resize-shrink').on('click', () => {
    const el = dom('#resize-target');
    const w = Math.max(100, (parseInt(el.css('width')) || 160) - 20);
    const h = Math.max(60, (parseInt(el.css('height')) || 90) - 15);
    el.css({ width: w + 'px', height: h + 'px' });
  });

  // Mutation demo
  onMutation('#mut-target', (records) => {
    for (const r of records) {
      dom('#mut-log').append(`<div>${r.type}</div>`);
    }
    const log = dom('#mut-log').el(); if (log) log.scrollTop = log.scrollHeight;
  }, { attributes: true, childList: true });
  dom('#mut-add').on('click', () => {
    dom('#mut-target').append('<div class="p-1 border rounded mb-1">Child</div>');
  });
  dom('#mut-remove').on('click', () => {
    const child = dom('#mut-target').children().last().el();
    if (child) child.remove();
  });
  dom('#mut-attr').on('click', () => {
    const t = dom('#mut-target');
    t.attr('data-flag', t.attr('data-flag') ? null : 'on');
  });
}

