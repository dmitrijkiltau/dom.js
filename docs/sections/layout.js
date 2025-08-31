import dom, { useTemplate } from '../../dist/index.js';
import { createTabbedExamples } from '../content.js';

const renderSubsection = useTemplate('#subsection-template');

export function addLayoutExamples() {
  const section = dom('#layout-geometry');
  if (section.length === 0) return;

  section.append(renderSubsection({
    id: 'layout-geometry-examples',
    title: 'Interactive Examples',
    content: `
      <p class="text-gray-700 mb-4">Explore size measurements, positioning, scroll offsets, and bounding rects.</p>
    `
  }));

  const tabs = createTabbedExamples({
    id: 'layout-geometry-tabs',
    title: 'Layout & Geometry',
    description: 'Sizes, positioning, scroll, and rect — hands-on demos',
    tabs: [
      {
        id: 'sizes',
        title: 'Sizes',
        demo: `
          <div class="space-y-4">
            <div class="flex flex-wrap gap-2">
              <button id="measure-sizes" class="btn btn-primary text-sm">Measure</button>
              <button id="set-width" class="btn btn-secondary text-sm">Set width 320px</button>
              <button id="set-height" class="btn btn-secondary text-sm">Set height 120px</button>
              <button id="clear-size" class="btn btn-outline text-sm">Clear size</button>
              <button id="toggle-margin" class="btn btn-outline text-sm">Toggle margin</button>
            </div>
            <div class="p-3 border border-gray-300 rounded bg-white">
              <div id="size-target" style="width: 240px; height: 100px; padding: 16px; border: 2px solid #cbd5e1; margin: 8px; background: #f8fafc;">
                <div class="text-sm text-gray-700">Measure this box</div>
              </div>
            </div>
            <div id="size-log" class="text-sm text-gray-700 bg-gray-100 p-3 rounded"></div>
          </div>
        `,
        code: `// Sizes
const w = dom('#box').width();       // content width (excludes padding & border)
const iw = dom('#box').innerWidth(); // includes padding
const ow = dom('#box').outerWidth(); // includes padding + border
const owm = dom('#box').outerWidth(true); // + margin

// Setters (number => px)
dom('#box').width(320).height('120px');
dom('#box').width(null); // remove inline width`
      },
      {
        id: 'positioning',
        title: 'Positioning',
        demo: `
          <div class="space-y-4">
            <div class="flex flex-wrap gap-2">
              <button id="read-offset" class="btn btn-primary text-sm">offset()</button>
              <button id="read-position" class="btn btn-secondary text-sm">position()</button>
              <button id="read-offset-parent" class="btn btn-outline text-sm">offsetParent()</button>
              <button id="toggle-parent-pos" class="btn btn-outline text-sm">Toggle positioned parent</button>
            </div>
            <div class="p-3 border border-gray-300 rounded bg-white">
              <div id="pos-container" style="padding: 20px; border: 2px solid #cbd5e1; position: static;">
                <div id="pos-parent" style="padding: 12px; border: 2px dashed #94a3b8; position: static;">
                  <div id="pos-target" style="width: 120px; height: 60px; background: #e0f2fe; border: 2px solid #38bdf8;">
                    <div class="text-sm text-gray-700 p-1">Target</div>
                  </div>
                </div>
              </div>
            </div>
            <div id="pos-log" class="text-sm text-gray-700 bg-gray-100 p-3 rounded"></div>
          </div>
        `,
        code: `// Position values
const off = dom('#el').offset();      // { top, left } relative to document
const pos = dom('#el').position();    // { top, left } relative to offsetParent
const op = dom('#el').offsetParent(); // DOMCollection with the offsetParent element

// Parent becomes offsetParent when positioned (relative/absolute/fixed)
dom('#parent').css('position', 'relative');`
      },
      {
        id: 'scrolling',
        title: 'Scroll',
        demo: `
          <div class="space-y-4">
            <div class="flex flex-wrap gap-2">
              <button id="read-scroll" class="btn btn-primary text-sm">Read scroll</button>
              <button id="scroll-top-50" class="btn btn-secondary text-sm">scrollTop(50)</button>
              <button id="scroll-left-100" class="btn btn-secondary text-sm">scrollLeft(100)</button>
              <button id="scroll-top-left" class="btn btn-outline text-sm">To top-left</button>
              <button id="scroll-bottom-right" class="btn btn-outline text-sm">To bottom-right</button>
            </div>
            <div class="p-3 border border-gray-300 rounded bg-white">
              <div id="scroll-box" style="width: 280px; height: 120px; overflow: auto; border: 2px solid #cbd5e1;">
                <div style="width: 600px; height: 400px; background: linear-gradient(135deg, #fafafa, #e5e7eb); display: grid; place-items: center;">
                  <span class="text-sm text-gray-700">Scrollable content</span>
                </div>
              </div>
            </div>
            <div id="scroll-log" class="text-sm text-gray-700 bg-gray-100 p-3 rounded"></div>
          </div>
        `,
        code: `// Scroll get/set
dom('#box').scrollTop();      // number
dom('#box').scrollLeft(100);  // set
dom('#box').scrollTop(0).scrollLeft(0);`
      },
      {
        id: 'scroll-into-view',
        title: 'Scroll Into View',
        demo: `
          <div class="space-y-4">
            <div class="flex flex-wrap gap-2">
              <button id="siv-center" class="btn btn-primary text-sm">Center Row 15</button>
              <button id="siv-start" class="btn btn-secondary text-sm">Start Row 5</button>
              <button id="siv-ifneeded" class="btn btn-outline text-sm">Scroll If Needed</button>
            </div>
            <div class="p-3 border border-gray-300 rounded bg-white">
              <div id="siv-container" style="height: 140px; overflow: auto; border: 2px solid #cbd5e1; padding: 8px;">
                <div class="space-y-2">
                  ${Array.from({ length: 25 }, (_, i) => `<div id=\"siv-item-${i+1}\" class=\"p-2 bg-gray-50 border rounded\">Row ${i + 1}</div>`).join('')}
                </div>
              </div>
            </div>
            <div id="siv-log" class="text-sm text-gray-700 bg-gray-100 p-3 rounded"></div>
          </div>
        `,
        code: `import { scrollIntoView, scrollIntoViewIfNeeded } from '@dmitrijkiltau/dom.js/scroll';

scrollIntoView('#item-15', { container: '#list', behavior: 'smooth', block: 'center' });
scrollIntoView('#item-5', { container: '#list', behavior: 'smooth', block: 'start' });
scrollIntoViewIfNeeded('#item-5', { container: '#list', behavior: 'smooth' });`
      },
      {
        id: 'rect',
        title: 'Rect',
        demo: `
          <div class="space-y-4">
            <div class="flex flex-wrap gap-2">
              <button id="measure-rect" class="btn btn-primary text-sm">Measure rect()</button>
              <button id="resize-rect-target" class="btn btn-secondary text-sm">Resize</button>
              <button id="reset-rect-target" class="btn btn-outline text-sm">Reset</button>
            </div>
            <div class="p-3 border border-gray-300 rounded bg-white">
              <div id="rect-target" style="width: 220px; height: 90px; padding: 10px; border: 2px solid #cbd5e1; background: #f1f5f9;">
                <div class="text-sm text-gray-700">Rect target</div>
              </div>
            </div>
            <div id="rect-log" class="text-sm text-gray-700 bg-gray-100 p-3 rounded"></div>
          </div>
        `,
        code: `// Bounding client rect
const r = dom('#el').rect();
// { top, left, right, bottom, width, height, x, y }`
      }
    ]
  });

  section.append(tabs);

  // Sizes handlers
  dom('#measure-sizes').click(() => {
    const $t = dom('#size-target');
    const w = $t.width();
    const iw = $t.innerWidth();
    const ow = $t.outerWidth();
    const owm = $t.outerWidth(true);
    const h = $t.height();
    const ih = $t.innerHeight();
    const oh = $t.outerHeight();
    const ohm = $t.outerHeight(true);
    dom('#size-log').html(`
      <div><strong>Width</strong> — content: ${w.toFixed(1)} | inner: ${iw.toFixed(1)} | outer: ${ow.toFixed(1)} | outer+margin: ${owm.toFixed(1)}</div>
      <div><strong>Height</strong> — content: ${h.toFixed(1)} | inner: ${ih.toFixed(1)} | outer: ${oh.toFixed(1)} | outer+margin: ${ohm.toFixed(1)}</div>
    `);
  });

  dom('#set-width').click(() => { dom('#size-target').width(320); dom('#size-log').text('Set width to 320px'); });
  dom('#set-height').click(() => { dom('#size-target').height(120); dom('#size-log').text('Set height to 120px'); });
  dom('#clear-size').click(() => { dom('#size-target').width(null).height(null); dom('#size-log').text('Cleared inline width/height'); });
  dom('#toggle-margin').click(() => {
    const el = dom('#size-target').el();
    if (!el) return;
    const cur = getComputedStyle(el).marginLeft;
    const has = (parseFloat(cur) || 0) > 0;
    dom(el).css('margin', has ? '0px' : '16px');
    dom('#size-log').text(has ? 'Removed margin' : 'Added 16px margin');
  });

  // Positioning handlers
  dom('#read-offset').click(() => {
    const v = dom('#pos-target').offset();
    dom('#pos-log').text(`offset() => top: ${v.top.toFixed(1)}, left: ${v.left.toFixed(1)}`);
  });
  dom('#read-position').click(() => {
    const v = dom('#pos-target').position();
    dom('#pos-log').text(`position() => top: ${v.top.toFixed(1)}, left: ${v.left.toFixed(1)}`);
  });
  dom('#read-offset-parent').click(() => {
    const op = dom('#pos-target').offsetParent().el();
    const tag = op ? op.tagName.toLowerCase() : 'none';
    const pos = op ? getComputedStyle(op).position : 'n/a';
    dom('#pos-log').text(`offsetParent() => <${tag}> (position: ${pos})`);
  });
  dom('#toggle-parent-pos').click(() => {
    const p = dom('#pos-parent');
    const cur = p.css('position');
    const next = cur === 'static' ? 'relative' : 'static';
    p.css('position', next);
    dom('#pos-log').text(`Parent position => ${next}`);
  });

  // Scroll handlers
  dom('#read-scroll').click(() => {
    const top = dom('#scroll-box').scrollTop();
    const left = dom('#scroll-box').scrollLeft();
    dom('#scroll-log').text(`scrollTop: ${top}, scrollLeft: ${left}`);
  });
  dom('#scroll-top-50').click(() => { dom('#scroll-box').scrollTop(50); dom('#scroll-log').text('scrollTop set to 50'); });
  dom('#scroll-left-100').click(() => { dom('#scroll-box').scrollLeft(100); dom('#scroll-log').text('scrollLeft set to 100'); });
  dom('#scroll-top-left').click(() => { dom('#scroll-box').scrollTop(0).scrollLeft(0); dom('#scroll-log').text('Scrolled to top-left'); });
  dom('#scroll-bottom-right').click(() => {
    const box = dom('#scroll-box').el();
    if (!box) return;
    const maxTop = box.scrollHeight - box.clientHeight;
    const maxLeft = box.scrollWidth - box.clientWidth;
    dom(box).scrollTop(maxTop).scrollLeft(maxLeft);
    dom('#scroll-log').text('Scrolled to bottom-right');
  });

  // Scroll-into-view handlers
  const getContainer = () => dom('#siv-container').el();
  dom('#siv-center').on('click', () => {
    dom('#siv-item-15').scrollIntoView({ container: getContainer(), behavior: 'smooth', block: 'center' });
    dom('#siv-log').text('Centered Row 15');
  });
  dom('#siv-start').on('click', () => {
    dom('#siv-item-5').scrollIntoView({ container: getContainer(), behavior: 'smooth', block: 'start' });
    dom('#siv-log').text('Scrolled Row 5 to start');
  });
  dom('#siv-ifneeded').on('click', () => {
    dom('#siv-item-5').scrollIntoViewIfNeeded({ container: getContainer(), behavior: 'smooth', block: 'center' });
    dom('#siv-log').text('Scrolled Row 5 if needed');
  });

  // Rect handlers
  dom('#measure-rect').click(() => {
    const r = dom('#rect-target').rect();
    dom('#rect-log').html(`
      <div>top: ${r.top.toFixed(1)}, left: ${r.left.toFixed(1)}, width: ${r.width.toFixed(1)}, height: ${r.height.toFixed(1)}</div>
      <div>right: ${r.right.toFixed(1)}, bottom: ${r.bottom.toFixed(1)}, x: ${r.x.toFixed(1)}, y: ${r.y.toFixed(1)}</div>
    `);
  });
  dom('#resize-rect-target').click(() => {
    const el = dom('#rect-target');
    const w = Math.floor(180 + Math.random() * 160);
    const h = Math.floor(80 + Math.random() * 140);
    el.width(w).height(h);
    dom('#rect-log').text(`Resized to ${w}x${h}`);
  });
  dom('#reset-rect-target').click(() => { dom('#rect-target').width(null).height(null); dom('#rect-log').text('Reset size'); });
}
