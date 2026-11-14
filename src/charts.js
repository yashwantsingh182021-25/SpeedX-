// Tiny dependency-free SVG charts with hover tooltips.
const NS = 'http://www.w3.org/2000/svg';

function el(name, attrs = {}, parent) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
}

const tooltip = () => document.getElementById('tooltip');

function showTip(html, x, y) {
  const t = tooltip();
  t.innerHTML = html;
  t.hidden = false;
  const r = t.getBoundingClientRect();
  let left = x + 14;
  if (left + r.width > window.innerWidth - 8) left = x - r.width - 14;
  t.style.left = `${Math.max(8, left)}px`;
  t.style.top = `${Math.max(8, y - r.height - 10)}px`;
}
function hideTip() {
  tooltip().hidden = true;
}

/**
 * Line chart: series = [{ name, color(css var), values: number[] }], labels = string[] (x)
 */
export function lineChart(container, { labels, series, yMax = 100 }) {
  container.innerHTML = '';
  const W = Math.max(280, container.clientWidth || 320);
  const H = 200;
  const m = { t: 12, r: 12, b: 24, l: 30 };
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;
  const n = labels.length;
  const x = (i) => m.l + (n <= 1 ? iw / 2 : (i * iw) / (n - 1));
  const y = (v) => m.t + ih - (v / yMax) * ih;

  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Line chart: ${series.map((s) => s.name).join(' vs ')} across ${n} messages` }, container);

  for (const v of [0, 25, 50, 75, 100]) {
    el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: 'var(--grid)', 'stroke-width': 1 }, svg);
    const t = el('text', { x: m.l - 6, y: y(v) + 4, 'text-anchor': 'end' }, svg);
    t.textContent = v;
  }
  // x labels: first, last
  if (n) {
    const a = el('text', { x: x(0), y: H - 6, 'text-anchor': n === 1 ? 'middle' : 'start' }, svg);
    a.textContent = labels[0];
    if (n > 1) {
      const b = el('text', { x: x(n - 1), y: H - 6, 'text-anchor': 'end' }, svg);
      b.textContent = labels[n - 1];
    }
  }

  for (const s of series) {
    const d = s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    el('path', { d, fill: 'none', stroke: s.color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
    if (n <= 20) {
      s.values.forEach((v, i) => el('circle', { cx: x(i), cy: y(v), r: 3.5, fill: s.color, stroke: 'var(--surface)', 'stroke-width': 2 }, svg));
    }
    // direct label at the end of the line
    if (n) {
      const last = s.values[n - 1];
      const lbl = el('text', { x: x(n - 1) - 4, y: y(last) - 8, 'text-anchor': 'end', class: 'val' }, svg);
      lbl.textContent = `${s.name} ${last}`;
    }
  }

  // hover layer
  const cross = el('line', { y1: m.t, y2: m.t + ih, stroke: 'var(--muted)', 'stroke-width': 1, 'stroke-dasharray': '3 3', visibility: 'hidden' }, svg);
  const hit = el('rect', { x: m.l - 10, y: 0, width: iw + 20, height: H, fill: 'transparent' }, svg);
  const onMove = (ev) => {
    if (!n) return;
    const pt = svg.getBoundingClientRect();
    const px = ((ev.clientX - pt.left) / pt.width) * W;
    const i = Math.max(0, Math.min(n - 1, Math.round(n <= 1 ? 0 : ((px - m.l) / iw) * (n - 1))));
    cross.setAttribute('x1', x(i));
    cross.setAttribute('x2', x(i));
    cross.setAttribute('visibility', 'visible');
    const rows = series.map((s) => `<div class="tt-row"><span class="dot" style="--c:${s.color}"></span>${s.name}: <strong>${s.values[i]}</strong></div>`).join('');
    showTip(`<div><strong>${labels[i]}</strong></div>${rows}`, ev.clientX, ev.clientY);
  };
  hit.addEventListener('pointermove', onMove);
  hit.addEventListener('pointerdown', onMove);
  hit.addEventListener('pointerleave', () => { cross.setAttribute('visibility', 'hidden'); hideTip(); });
}

/** Horizontal bar chart: data = [{ label, value }] sorted by caller. */
export function barChart(container, { data, color = 'var(--series-1)', unit = '' }) {
  container.innerHTML = '';
  const W = Math.max(280, container.clientWidth || 320);
  const rowH = 30;
  const labelW = Math.min(150, W * 0.42);
  const m = { t: 4, r: 36, b: 4, l: labelW };
  const H = m.t + m.b + data.length * rowH;
  const max = Math.max(1, ...data.map((d) => d.value));
  const iw = W - m.l - m.r;

  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Bar chart of mistakes by type' }, container);
  data.forEach((d, i) => {
    const yy = m.t + i * rowH;
    const t = el('text', { x: 0, y: yy + rowH / 2 + 4 }, svg);
    t.textContent = d.label;
    const w = Math.max(d.value ? 4 : 0, (d.value / max) * iw);
    // bar: flat at baseline, 4px rounded data end
    const h = 14;
    const by = yy + (rowH - h) / 2;
    const r = Math.min(4, w / 2);
    if (w > 0) {
      el('path', {
        d: `M${m.l},${by} H${m.l + w - r} Q${m.l + w},${by} ${m.l + w},${by + r} V${by + h - r} Q${m.l + w},${by + h} ${m.l + w - r},${by + h} H${m.l} Z`,
        fill: color,
      }, svg);
    }
    const v = el('text', { x: m.l + w + 6, y: yy + rowH / 2 + 4, class: 'val' }, svg);
    v.textContent = d.value;
    const hit = el('rect', { x: 0, y: yy, width: W, height: rowH, fill: 'transparent' }, svg);
    const move = (ev) => showTip(`<strong>${d.label}</strong><div class="tt-row"><span class="dot" style="--c:${color}"></span>${d.value}${unit}</div>${d.hint ? `<div class="muted">${d.hint}</div>` : ''}`, ev.clientX, ev.clientY);
    hit.addEventListener('pointermove', move);
    hit.addEventListener('pointerdown', move);
    hit.addEventListener('pointerleave', hideTip);
  });
}

export function table(container, headers, rows) {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  container.innerHTML = `<table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td class="${typeof c === 'number' ? 'n' : ''}">${esc(c)}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;
}
