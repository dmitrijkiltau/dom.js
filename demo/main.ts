import vk, { use, useTemplate, renderTemplate, onSubmit, toQueryString, http } from '../src/index.ts';

// Expose for console tinkering
// @ts-ignore
window.vk = vk;

// 1. Template rendering demo
let nextId = 1;
const list = vk('#list');
const listCount = vk('#list-count');
const row = useTemplate('#row');

function updateCount() {
  listCount.text(`Items: ${list.find('li').elements.length}`);
}

function normaliseUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return url;
  return 'https://' + url;
}

function addRow(data: { title: string; url: string }) {
  const el = row({ ...data, url: normaliseUrl(data.url), id: nextId++ });
  list.append(el);
  updateCount();
}

addRow({ title: 'Docs', url: 'https://developer.mozilla.org/' });
addRow({ title: 'GitHub', url: 'https://github.com/' });

onSubmit('#add-row', (data) => {
  addRow(data as any);
  (vk('#add-row').el() as HTMLFormElement).reset();
});

vk('#list').on('click', 'button.remove', (_ev, el) => {
  const li = el.closest('li');
  if (!li) return;
  li.classList.add('fade-out');
  setTimeout(() => { li.remove(); updateCount(); }, 260);
});

// 2. Form serialization demo
onSubmit('#contact', async (data, ev) => {
  const pre = vk('#form-output');
  const qs = toQueryString(data);
  const raw = JSON.stringify({ data, queryString: qs }, null, 2);
  pre.html(highlightJson(raw));
  // Fake post (will 404) to show HTTP API surface, ignore errors
  try { await http.post('/api/contact', data); } catch { /* ignore in demo */ }
});

vk('#clear').on('click', () => {
  const form = vk('#contact').el<HTMLFormElement>();
  form?.reset();
  vk('#form-output').text('');
});

function highlightJson(json: string): string {
  return json.replace(
    /("(?:\\.|[^"\\])*")|\b-?\d+\.?\d*(?:[eE][+-]?\d+)?\b|\b(?:true|false|null)\b|[{}\[\],:]/g,
    (match) => {
      let cls = 'n';
      if (match.startsWith('"')) {
        cls = /":$/.test(match) ? 'k' : 's';
      } else if (/^(true|false|null)$/.test(match)) {
        cls = 'b';
      } else if (/^[{}\[\],:]$/.test(match)) {
        cls = 'p';
      }
      const esc = match
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<span class="${cls}">${esc}</span>`;
    }
  );
}

// 3. Events + animation
const pushBtn = vk('#push-msg');
let msgCount = 1;
pushBtn.on('click', () => {
  const msg = renderTemplate('#msg-tpl', { text: `Message ${msgCount++}` });
  (vk('#messages').append(msg) as any).animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 180, easing: 'ease-out' });
});

// 4. Plugin system - flash helper
use((api) => {
  (api as any).flash = (sel: string) => (api(sel) as any).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240 });
});

vk('#flash').on('click', () => (vk as any).flash('#messages'));

// Theme toggle
vk('#toggle-theme').on('click', () => {
  document.documentElement.classList.toggle('light');
});

// Initial count
updateCount();

console.info('[vanilla-kit demo] Try:', '\n', 'vk("button").addClass("hi")');
