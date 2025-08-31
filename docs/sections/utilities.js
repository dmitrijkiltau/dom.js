import dom, { useTemplate, debounce, throttle, nextTick, raf, rafThrottle } from '../../dist/index.js';
import { createTabbedExamples } from '../content.js';

const renderSubsection = useTemplate('#subsection-template');

export function addUtilitiesExamples() {
  const section = dom('#utilities');
  if (section.length === 0) return;

  section.append(renderSubsection({
    id: 'utilities-examples',
    title: 'Interactive Examples',
    content: `<p class="text-gray-700 mb-4">Try the helpers below and watch the logs update.</p>`
  }));

  const tabs = createTabbedExamples({
    id: 'utilities-tabs',
    title: 'Utilities',
    description: 'Debounce, throttle, nextTick, raf, and rafThrottle',
    tabs: [
      {
        id: 'debounce-throttle',
        title: 'Debounce & Throttle',
        demo: `
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Debounced input (200ms)</label>
                <input id="debounce-input" class="input" placeholder="Type quickly...">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Throttled scroll (100ms)</label>
                <div id="throttle-box" class="border rounded h-24 overflow-auto bg-gray-50">
                  <div style="height: 300px; display: grid; place-items: center;">Scroll me</div>
                </div>
              </div>
            </div>
            <div id="util-log" class="text-sm text-gray-700 bg-gray-100 p-3 rounded h-24 overflow-auto"></div>
          </div>
        `,
        code: `import { debounce, throttle } from '@dmitrijkiltau/dom.js/utils';

const log = (msg) => console.log(msg);
const onType = debounce((e) => log('debounced: ' + e.target.value), 200);
dom('#input').on('input', onType);

const onScroll = throttle((e) => log('throttled scroll'), 100);
dom('#scroll-box').on('scroll', onScroll);`
      },
      {
        id: 'scheduling',
        title: 'Scheduling',
        demo: `
          <div class="space-y-4">
            <div class="flex flex-wrap gap-2">
              <button id="run-nexttick" class="btn btn-primary text-sm">nextTick()</button>
              <button id="run-raf" class="btn btn-secondary text-sm">raf()</button>
              <button id="run-rafthrottle" class="btn btn-outline text-sm">rafThrottle()</button>
            </div>
            <div id="sched-box" class="border rounded h-24 overflow-auto bg-gray-50 p-2 text-sm text-gray-700"></div>
          </div>
        `,
        code: `import { nextTick, raf, rafThrottle } from '@dmitrijkiltau/dom.js/utils';

const out = [];
await nextTick(); out.push('nextTick resolved');
await raf(); out.push('raf resolved');
const draw = rafThrottle(() => out.push('drawn'));
draw(); draw(); // fires once per frame`
      }
    ]
  });

  section.append(tabs);

  const logEl = () => dom('#util-log');
  const push = (msg) => {
    const ts = new Date().toLocaleTimeString();
    logEl().append(`<div>[${ts}] ${msg}</div>`);
    const el = logEl().el();
    if (el) el.scrollTop = el.scrollHeight;
  };

  const onType = debounce((e) => push(`debounced: ${e.target.value}`), 200);
  dom('#debounce-input').on('input', onType);

  const onScroll = throttle(() => push('throttled scroll'), 100);
  dom('#throttle-box').on('scroll', onScroll);

  dom('#run-nexttick').on('click', async () => {
    push('click: nextTick queued');
    await nextTick();
    push('nextTick resolved');
  });
  dom('#run-raf').on('click', async () => {
    push('click: raf queued');
    await raf();
    push('raf resolved');
  });

  const draw = rafThrottle(() => push('rafThrottle draw'));
  dom('#run-rafthrottle').on('click', () => { draw(); draw(); draw(); });
}

