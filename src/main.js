import './style.css';
import { convert, diffWords, CATEGORIES, leftoverHindi } from './engine.js';
import { lineChart, barChart, table } from './charts.js';

// ---------- storage (safe) ----------
const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — app still works for this session */
    }
  },
};

const settings = Object.assign(
  { theme: 'system', enabled: true, engine: 'offline', tone: 'friendly', live: true, autoCopy: false, apiKey: '' },
  store.get('speedx.settings', {}),
);
const saveSettings = () => store.set('speedx.settings', settings);
let msgLog = store.get('speedx.history', []); // [{t, before, after, scoreBefore, scoreAfter, counts, changes:[{from,to,type}] }]

// ---------- dom ----------
const $ = (id) => document.getElementById(id);
const input = $('input');
const outputEl = $('output');
const outputCard = $('outputCard');
const notice = $('notice');
let current = null; // last conversion result
let lastRecordedKey = '';

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2200);
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- theme ----------
function applyTheme() {
  const root = document.documentElement;
  if (settings.theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = settings.theme;
  document.querySelectorAll('[data-theme-choice]').forEach((b) => {
    const on = b.dataset.themeChoice === settings.theme;
    b.classList.toggle('active', on);
    b.setAttribute('aria-checked', on);
  });
  const dark = root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name="theme-color"]').content = dark ? '#0f1110' : '#f4f5f2';
  if (document.getElementById('tab-insights').classList.contains('active')) renderInsights();
}
$('themeBtn').addEventListener('click', () => {
  const root = document.documentElement;
  const isDark = root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  settings.theme = isDark ? 'light' : 'dark';
  saveSettings();
  applyTheme();
});
document.querySelectorAll('[data-theme-choice]').forEach((b) =>
  b.addEventListener('click', () => {
    settings.theme = b.dataset.themeChoice;
    saveSettings();
    applyTheme();
  }),
);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

// ---------- tabs ----------
function showTab(name) {
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.id === `tab-${name}`));
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  if (name === 'insights') renderInsights();
  window.scrollTo({ top: 0 });
}
document.querySelectorAll('.nav-btn').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));

// ---------- on/off + engine + tone ----------
function renderMode() {
  $('masterToggle').checked = settings.enabled;
  $('modeLabel').textContent = settings.enabled ? 'ON' : 'OFF';
  $('modeLabel').classList.toggle('on', settings.enabled);
  $('modeHint').textContent = settings.enabled
    ? 'Your message will be converted before sending.'
    : 'Free-hand mode: sent exactly as you type.';
  $('engineRow').style.opacity = settings.enabled ? 1 : 0.45;
  $('engineRow').querySelectorAll('button').forEach((b) => (b.disabled = !settings.enabled));
  $('offHint').hidden = settings.enabled;
  $('convertBtn').hidden = !settings.enabled;
  document.querySelectorAll('[data-engine]').forEach((b) => {
    const on = b.dataset.engine === settings.engine;
    b.classList.toggle('active', on);
    b.setAttribute('aria-checked', on);
  });
  document.querySelectorAll('[data-tone]').forEach((b) => {
    const on = b.dataset.tone === settings.tone;
    b.classList.toggle('active', on);
    b.setAttribute('aria-checked', on);
  });
  $('toneSeg').hidden = settings.engine !== 'ai';
}
$('masterToggle').addEventListener('change', (e) => {
  settings.enabled = e.target.checked;
  saveSettings();
  renderMode();
  run();
});
document.querySelectorAll('[data-engine]').forEach((b) =>
  b.addEventListener('click', () => {
    settings.engine = b.dataset.engine;
    if (settings.engine === 'ai' && !settings.apiKey) toast('Add your Claude API key in Settings to use AI mode');
    saveSettings();
    renderMode();
    run();
  }),
);
document.querySelectorAll('[data-tone]').forEach((b) =>
  b.addEventListener('click', () => {
    settings.tone = b.dataset.tone;
    saveSettings();
    renderMode();
    run();
  }),
);

// ---------- conversion ----------
function wordsIn(text) {
  return (text.match(/[\p{L}\p{N}']+/gu) || []).length;
}
input.addEventListener('input', () => {
  const n = wordsIn(input.value);
  $('charCount').textContent = `${n} word${n === 1 ? '' : 's'}`;
  clearTimeout(input.timer);
  if (settings.live && (settings.engine === 'offline' || !settings.enabled)) input.timer = setTimeout(run, 250);
});
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) run(true);
});
$('convertBtn').addEventListener('click', () => run(true));
$('clearBtn').addEventListener('click', () => {
  input.value = '';
  input.dispatchEvent(new Event('input'));
  outputCard.hidden = true;
  current = null;
  input.focus();
});
$('pasteBtn').addEventListener('click', async () => {
  try {
    input.value = await navigator.clipboard.readText();
    input.dispatchEvent(new Event('input'));
    run(true);
  } catch {
    toast('Long-press the box and choose Paste');
  }
});

let runId = 0;
async function run(explicit = false) {
  const text = input.value.trim();
  const id = ++runId;
  if (!text) {
    outputCard.hidden = true;
    current = null;
    return;
  }
  if (!settings.enabled) {
    current = { output: text, changes: [], stats: null, raw: true };
    render(text);
    return;
  }
  if (settings.engine === 'ai' && settings.apiKey) {
    if (!explicit) return; // AI runs only on the Convert button (saves your credits)
    $('convertBtn').disabled = true;
    $('convertBtn').textContent = 'Converting…';
    try {
      const { convertWithAI } = await import('./ai.js');
      const res = await convertWithAI(text, { apiKey: settings.apiKey, tone: settings.tone });
      if (id !== runId) return;
      current = { ...res, engine: 'ai' };
      render(text);
    } catch (err) {
      if (id !== runId) return;
      current = { ...convert(text), engine: 'offline' };
      render(text, err.message || 'AI failed. Showing the offline result.');
    } finally {
      $('convertBtn').disabled = false;
      $('convertBtn').textContent = 'Convert';
    }
    return;
  }
  current = { ...convert(text), engine: 'offline' };
  render(text);
  if (explicit && settings.autoCopy) copy();
}

function render(original, warn = '') {
  outputCard.hidden = false;
  outputEl.textContent = current.output;

  // scores
  if (current.stats) {
    $('scores').innerHTML = `<span title="Score of what you typed">You</span><span class="score">${current.stats.before}</span><span aria-hidden="true">→</span><span class="score" title="Score after SpeedX">${current.stats.after}</span>`;
  } else {
    $('scores').innerHTML = '<span class="pill">Sent as typed</span>';
  }

  // notice
  let msg = warn;
  if (!msg && current.engine === 'offline' && current.lowConfidence && settings.enabled) {
    msg = settings.apiKey
      ? 'This sentence is complex for the offline engine. Switch to ✨ AI for a natural translation.'
      : 'This sentence is complex for the offline engine. Check the result, or add a Claude key in Settings for full-sentence AI translation.';
  }
  notice.hidden = !msg;
  notice.textContent = msg;

  // diff + change list
  const box = $('changesBox');
  if (current.raw || !current.changes.length) {
    box.hidden = !!current.raw;
    $('changesTitle').textContent = 'Looks good — nothing to fix ✅';
    $('diff').innerHTML = '';
    $('changeList').innerHTML = '';
    return;
  }
  box.hidden = false;
  $('changesTitle').textContent = `What changed (${current.changes.length})`;
  $('diff').innerHTML = diffWords(original, current.output)
    .map((p) => (p.type === 'same' ? esc(p.text) : p.type === 'del' ? `<del>${esc(p.text)}</del>` : `<ins>${esc(p.text)}</ins>`))
    .join('');
  $('changeList').innerHTML = current.changes
    .filter((c) => c.type !== 'capitalization' && c.type !== 'punctuation')
    .concat(summarizeMinor(current.changes))
    .map(
      (c) => `<li><span class="tag">${esc(CATEGORIES[c.type]?.label || c.type)}</span>${c.from ? `<span class="from">${esc(c.from)}</span> → ` : ''}<span class="to">${esc(c.to)}</span>${c.note ? `<div class="muted small">${esc(c.note)}</div>` : ''}</li>`,
    )
    .join('');
}

// Collapse many tiny capitalization/punctuation fixes into one line each.
function summarizeMinor(changes) {
  const out = [];
  for (const type of ['capitalization', 'punctuation']) {
    const list = changes.filter((c) => c.type === type);
    if (list.length === 1) out.push(list[0]);
    else if (list.length > 1) out.push({ type, from: '', to: `${list.length} fixes`, note: CATEGORIES[type].tip });
  }
  return out;
}

// The output box is editable — keep edits.
outputEl.addEventListener('input', () => {
  if (current) current.output = outputEl.innerText;
});

// ---------- send / copy / share ----------
function finalText() {
  return current ? current.output.trim() : input.value.trim();
}

function record() {
  if (!current || current.raw || !current.stats) return;
  const key = `${input.value.trim()}|${current.output}`;
  if (key === lastRecordedKey) return;
  lastRecordedKey = key;
  msgLog.push({
    t: Date.now(),
    before: input.value.trim().slice(0, 500),
    after: current.output.slice(0, 500),
    scoreBefore: current.stats.before,
    scoreAfter: current.stats.after,
    counts: current.stats.counts,
    changes: current.changes
      .filter((c) => !['capitalization', 'punctuation'].includes(c.type))
      .map((c) => ({ from: c.from.toLowerCase().slice(0, 40), to: c.to.slice(0, 40), type: c.type })),
    engine: current.engine,
  });
  if (msgLog.length > 500) msgLog = msgLog.slice(-500);
  store.set('speedx.history', msgLog);
}

async function copy() {
  const text = finalText();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    toast('Copied — paste it in WhatsApp');
  } catch {
    const r = document.createRange();
    r.selectNodeContents(outputEl);
    getSelection().removeAllRanges();
    getSelection().addRange(r);
    toast('Selected — tap Copy');
  }
  record();
}
$('copyBtn').addEventListener('click', copy);

$('waBtn').addEventListener('click', () => {
  const text = finalText();
  if (!text) return toast('Type a message first');
  record();
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});

if (navigator.share) {
  $('shareBtn').hidden = false;
  $('shareBtn').addEventListener('click', async () => {
    const text = finalText();
    if (!text) return;
    try {
      await navigator.share({ text });
      record();
    } catch {
      /* user cancelled */
    }
  });
}

// ---------- insights ----------
function renderInsights() {
  const empty = msgLog.length === 0;
  $('insightsEmpty').hidden = !empty;
  $('insightsBody').hidden = empty;
  if (empty) return;

  const n = msgLog.length;
  const avg = (arr) => Math.round(arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length));
  const recent = msgLog.slice(-10);
  const earlier = msgLog.slice(-20, -10);
  const avgBefore = avg(recent.map((h) => h.scoreBefore));
  const trend = earlier.length ? avgBefore - avg(earlier.map((h) => h.scoreBefore)) : null;
  const totalFixes = msgLog.reduce((s, h) => s + Object.values(h.counts || {}).reduce((a, b) => a + b, 0), 0);
  const totals = {};
  for (const h of msgLog) for (const [k, v] of Object.entries(h.counts || {})) totals[k] = (totals[k] || 0) + v;
  const topType = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  const today = new Date().toDateString();
  const todayCount = msgLog.filter((h) => new Date(h.t).toDateString() === today).length;

  $('tiles').innerHTML = [
    { k: 'Messages improved', v: n, s: `${todayCount} today` },
    { k: 'Your score (last 10)', v: avgBefore, s: trend === null ? 'Keep going to see a trend' : trend >= 0 ? `▲ ${trend} vs previous 10` : `▼ ${Math.abs(trend)} vs previous 10` },
    { k: 'Fixes made', v: totalFixes, s: `${(totalFixes / n).toFixed(1)} per message` },
    { k: 'Work on', v: topType ? CATEGORIES[topType[0]]?.label.split(' ')[0] : '—', s: topType ? CATEGORIES[topType[0]]?.label : 'No mistakes yet' },
  ]
    .map((t) => `<div class="tile"><div class="k">${esc(t.k)}</div><div class="v">${esc(t.v)}</div><div class="s">${esc(t.s)}</div></div>`)
    .join('');

  // Trend: last 30 messages, before vs after
  const last = msgLog.slice(-30);
  const labels = last.map((h) => new Date(h.t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ' ' + new Date(h.t).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }));
  const series = [
    { name: 'You typed', color: 'var(--series-2)', values: last.map((h) => h.scoreBefore) },
    { name: 'After SpeedX', color: 'var(--series-1)', values: last.map((h) => h.scoreAfter) },
  ];
  $('trendLegend').innerHTML = series.map((s) => `<span style="--c:${s.color}">${s.name}</span>`).join('');
  lineChart($('trendChart'), { labels, series });
  table($('trendTable'), ['When', 'You typed', 'After SpeedX'], last.map((h, i) => [labels[i], h.scoreBefore, h.scoreAfter]).reverse());

  // Mistakes by type
  const data = Object.keys(CATEGORIES)
    .map((k) => ({ label: CATEGORIES[k].label, value: totals[k] || 0, hint: CATEGORIES[k].tip }))
    .sort((a, b) => b.value - a.value);
  barChart($('typeChart'), { data, unit: ' fixes' });
  table($('typeTable'), ['Type', 'Fixes'], data.map((d) => [d.label, d.value]));

  // Top repeated mistakes
  const pairs = {};
  for (const h of msgLog) for (const c of h.changes || []) {
    if (!c.from || c.from === c.to.toLowerCase()) continue;
    const k = `${c.from}→${c.to}`;
    pairs[k] = pairs[k] || { ...c, count: 0 };
    pairs[k].count++;
  }
  const top = Object.values(pairs).sort((a, b) => b.count - a.count).slice(0, 8);
  $('topMistakes').innerHTML = top.length
    ? top.map((p) => `<li><span><span class="from">${esc(p.from)}</span> → <span class="to">${esc(p.to)}</span></span><span class="count">×${p.count}</span></li>`).join('')
    : '<li class="muted">Nothing repeated yet.</li>';

  $('tip').textContent = topType ? CATEGORIES[topType[0]].tip : 'Great work — keep writing!';

  $('history').innerHTML = msgLog
    .slice(-6)
    .reverse()
    .map((h) => `<li><div class="b">${esc(h.before)}</div><div>${esc(h.after)}</div></li>`)
    .join('');
}
let resizeTimer;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if ($('tab-insights').classList.contains('active')) renderInsights();
  }, 150);
});
$('resetBtn').addEventListener('click', () => {
  if (!confirm('Delete all your insights data on this device?')) return;
  msgLog = [];
  store.set('speedx.history', msgLog);
  renderInsights();
});

// ---------- settings ----------
$('liveToggle').checked = settings.live;
$('autoCopyToggle').checked = settings.autoCopy;
$('liveToggle').addEventListener('change', (e) => { settings.live = e.target.checked; saveSettings(); });
$('autoCopyToggle').addEventListener('change', (e) => { settings.autoCopy = e.target.checked; saveSettings(); });
$('apiKey').value = settings.apiKey ? '••••••••••••' : '';
$('saveKeyBtn').addEventListener('click', () => {
  const v = $('apiKey').value.trim();
  if (!v || v.startsWith('•')) return toast('Paste your key first');
  settings.apiKey = v;
  settings.engine = 'ai';
  saveSettings();
  $('apiKey').value = '••••••••••••';
  renderMode();
  toast('Key saved on this device. AI mode on.');
});
$('removeKeyBtn').addEventListener('click', () => {
  settings.apiKey = '';
  settings.engine = 'offline';
  saveSettings();
  $('apiKey').value = '';
  renderMode();
  toast('Key removed');
});

// ---------- shared text (Android share sheet → SpeedX) ----------
const params = new URLSearchParams(location.search);
const shared = [params.get('text'), params.get('title')].filter(Boolean).join(' ').trim() || params.get('url') || '';
if (shared) {
  input.value = shared;
  window.history.replaceState(null, '', location.pathname);
}

// ---------- boot ----------
applyTheme();
renderMode();
if (input.value) {
  input.dispatchEvent(new Event('input'));
  run(true);
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

// expose for quick debugging in the console
window.speedx = { convert, leftoverHindi };
