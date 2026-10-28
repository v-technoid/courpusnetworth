/* ===========================================================
   CO₹PU$ — charts
   Plain SVG and HTML built from first principles, no charting
   library, so it works offline like everything else.
   Every chart: colours come from theme tokens (so dark mode just
   works), hover shows exact values, and each has a table view so
   no value depends on colour or hovering alone.
=========================================================== */
(function(){
  const NS = 'http://www.w3.org/2000/svg';
  const esc = (s) => (typeof escapeHtml === 'function' ? escapeHtml(s) : String(s));
  const money = (v) => (typeof fmtMoney === 'function' ? fmtMoney(v) : String(Math.round(v)));
  const compact = (v) => (typeof fmtCompact === 'function' ? fmtCompact(v) : String(Math.round(v)));
  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function host(el){
    if(typeof el === 'string') el = document.getElementById(el);
    if(!el) return null;
    el.classList.add('viz');
    return el;
  }

  function tipFor(el){
    let tip = el.querySelector(':scope > .viz-tip');
    if(!tip){ tip = document.createElement('div'); tip.className = 'viz-tip'; tip.setAttribute('role','status'); el.appendChild(tip); }
    return tip;
  }
  function placeTip(el, tip, clientX, clientY){
    const r = el.getBoundingClientRect();
    let x = clientX - r.left + 14, y = clientY - r.top - 10;
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    if(x + tw > r.width) x = clientX - r.left - tw - 14;
    if(x < 0) x = 4;
    if(y + th > r.height) y = r.height - th - 4;
    if(y < 0) y = 4;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }

  // Re-render a chart when its container is resized, so it stays crisp on any screen.
  function responsive(el, draw){
    draw();
    if(el._vizObserver) el._vizObserver.disconnect();
    let lastW = el.clientWidth, t;
    el._vizObserver = new ResizeObserver(() => {
      if(Math.abs(el.clientWidth - lastW) < 8) return;
      lastW = el.clientWidth;
      clearTimeout(t); t = setTimeout(draw, 120);
    });
    el._vizObserver.observe(el);
  }

  function niceTicks(min, max, count){
    if(min === max){ max = min + 1; }
    const span = max - min;
    const raw = span / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
    const ticks = [];
    for(let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
    return { lo, hi, ticks };
  }

  /* ---------------- donut ----------------
     segments: [{ label, value, color }]  (color can be a CSS var())
     opts: { centerLabel, centerValue, size } */
  function donut(elOrId, segments, opts){
    const el = host(elOrId); if(!el) return;
    opts = opts || {};
    const segs = segments.filter(s => s.value > 0);
    const total = segs.reduce((a, s) => a + s.value, 0);
    if(total <= 0){ el.innerHTML = `<p class="empty">${esc(opts.emptyText || 'Add some assets and this chart fills in.')}</p>`; return; }

    const size = opts.size || 220, cx = size / 2, cy = size / 2;
    const rOut = size / 2 - 2, rIn = rOut * 0.64;
    const gapDeg = segs.length > 1 ? (2 / ((rOut + rIn) / 2)) * (180 / Math.PI) : 0;

    const arc = (a0, a1) => {
      const p = (r, a) => { const t = (a - 90) * Math.PI / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; };
      const large = (a1 - a0) > 180 ? 1 : 0;
      if(a1 - a0 >= 359.99){ // full ring, one segment
        return `M ${cx} ${cy - rOut} A ${rOut} ${rOut} 0 1 1 ${cx - 0.01} ${cy - rOut} L ${cx - 0.01} ${cy - rIn} A ${rIn} ${rIn} 0 1 0 ${cx} ${cy - rIn} Z`;
      }
      const [x0,y0] = p(rOut, a0), [x1,y1] = p(rOut, a1), [x2,y2] = p(rIn, a1), [x3,y3] = p(rIn, a0);
      return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${rOut} ${rOut} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)} A ${rIn} ${rIn} 0 ${large} 0 ${x3.toFixed(2)} ${y3.toFixed(2)} Z`;
    };

    let a = 0, paths = '';
    segs.forEach((s, i) => {
      const sweep = s.value / total * 360;
      const a0 = a + gapDeg / 2, a1 = a + sweep - gapDeg / 2;
      paths += `<path class="viz-mark" data-i="${i}" tabindex="0" role="img" aria-label="${esc(s.label)}: ${esc(money(s.value))}, ${(s.value/total*100).toFixed(1)}%" d="${arc(a0, Math.max(a1, a0 + 0.3))}" style="fill:${s.color}; animation: cardIn .6s ${0.06 * i}s var(--ease) backwards"></path>`;
      a += sweep;
    });

    const legend = segs.map((s, i) => `
      <div class="row viz-mark" data-i="${i}">
        <span class="sw" style="background:${s.color}"></span>
        <span>${esc(s.label)}</span>
        <span class="val">${esc(compact(s.value))}</span>
        <span class="pct">${(s.value / total * 100).toFixed(0)}%</span>
      </div>`).join('');

    el.innerHTML = `
      <div style="display:flex; align-items:center; gap:28px; flex-wrap:wrap;">
        <div style="position:relative; width:${size}px; height:${size}px; flex-shrink:0; margin:0 auto;">
          <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-label="${esc(opts.ariaLabel || 'Allocation chart')}">${paths}</svg>
          <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; pointer-events:none;">
            ${opts.centerLabel ? `<div class="stat-label" style="margin:0 0 2px">${esc(opts.centerLabel)}</div>` : ''}
            ${opts.centerValue ? `<div class="num" style="font-size:20px;">${esc(opts.centerValue)}</div>` : ''}
          </div>
        </div>
        <div class="viz-legend" style="flex:1; min-width:200px;">${legend}</div>
      </div>`;

    const tip = tipFor(el);
    const marks = el.querySelectorAll('.viz-mark');
    const hot = (i, ev) => {
      el.classList.add('viz-dim');
      marks.forEach(m => m.classList.toggle('hot', m.dataset.i === String(i)));
      const s = segs[i];
      tip.innerHTML = `<strong>${esc(money(s.value))}</strong><span class="k" style="background:${s.color}"></span>${esc(s.label)} · ${(s.value/total*100).toFixed(1)}%`;
      tip.classList.add('show');
      if(ev && ev.clientX) placeTip(el, tip, ev.clientX, ev.clientY);
      else { const r = el.getBoundingClientRect(); placeTip(el, tip, r.left + size / 2, r.top + 20); }
    };
    const cold = () => { el.classList.remove('viz-dim'); marks.forEach(m => m.classList.remove('hot')); tip.classList.remove('show'); };
    marks.forEach(m => {
      m.addEventListener('pointermove', (ev) => hot(m.dataset.i, ev));
      m.addEventListener('pointerleave', cold);
      m.addEventListener('focus', () => hot(m.dataset.i));
      m.addEventListener('blur', cold);
    });
  }

  /* ---------------- line ----------------
     series: [{ name, color, points:[{ x:number, y:number }] }]
     opts: { height, xFormat(x), xTickFormat(x), yFormat(v), area, endLabels } */
  function line(elOrId, series, opts){
    const el = host(elOrId); if(!el) return;
    opts = opts || {};
    const valid = series.filter(s => s.points && s.points.length);
    const n = valid.length ? Math.max(...valid.map(s => s.points.length)) : 0;
    const allZero = valid.every(s => s.points.every(p => !p.y));
    if(n < 2 || allZero){ el.innerHTML = `<p class="empty">${esc(allZero && n >= 2 ? (opts.zeroText || 'Add assets or loans and this chart fills in.') : (opts.emptyText || 'Not enough points to draw a line yet.'))}</p>`; return; }

    const draw = () => {
      const W = Math.max(280, el.clientWidth || 600);
      const H = opts.height || 260;
      const yFmt = opts.yFormat || compact;
      const xFmt = opts.xFormat || (x => String(x));
      const xTick = opts.xTickFormat || xFmt;
      const multi = valid.length > 1;
      const showEnd = opts.endLabels !== false && valid.length <= 3 && W > 480;
      const m = { t: multi ? 34 : 14, r: showEnd ? 92 : 16, b: 30, l: 62 };

      const xs = valid.flatMap(s => s.points.map(p => p.x));
      const ys = valid.flatMap(s => s.points.map(p => p.y));
      const xMin = Math.min(...xs), xMax = Math.max(...xs);
      const yMinRaw = Math.min(0, ...ys), yMaxRaw = Math.max(...ys, 0);
      const { lo, hi, ticks } = niceTicks(yMinRaw, yMaxRaw, 4);
      const X = (x) => m.l + (xMax === xMin ? 0.5 : (x - xMin) / (xMax - xMin)) * (W - m.l - m.r);
      const Y = (y) => H - m.b - ((y - lo) / (hi - lo || 1)) * (H - m.t - m.b);

      let g = '';
      ticks.forEach(t => {
        g += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(t).toFixed(1)}" y2="${Y(t).toFixed(1)}" stroke="var(--grid)" stroke-width="1"/>`;
        g += `<text class="viz-axis" x="${m.l - 10}" y="${(Y(t) + 4).toFixed(1)}" text-anchor="end">${esc(yFmt(t))}</text>`;
      });
      if(lo < 0) g += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(0).toFixed(1)}" y2="${Y(0).toFixed(1)}" stroke="var(--line-strong)" stroke-width="1"/>`;

      // x ticks: first, last and up to 3 evenly spaced in between, from the first series
      const ref = valid[0].points;
      const want = Math.min(ref.length, W < 520 ? 3 : 5);
      const idx = [...new Set(Array.from({ length: want }, (_, k) => Math.round(k * (ref.length - 1) / (want - 1 || 1))))];
      idx.forEach((k, j) => {
        const anchor = j === 0 ? 'start' : (j === idx.length - 1 ? 'end' : 'middle');
        g += `<text class="viz-axis" x="${X(ref[k].x).toFixed(1)}" y="${H - 8}" text-anchor="${anchor}">${esc(xTick(ref[k].x))}</text>`;
      });

      let lines = '', ends = [];
      valid.forEach((s, si) => {
        const d = s.points.map((p, i) => `${i ? 'L' : 'M'} ${X(p.x).toFixed(1)} ${Y(p.y).toFixed(1)}`).join(' ');
        if((opts.area !== false) && !multi){
          const base = Y(Math.max(lo, 0));
          lines += `<path d="${d} L ${X(s.points[s.points.length-1].x).toFixed(1)} ${base.toFixed(1)} L ${X(s.points[0].x).toFixed(1)} ${base.toFixed(1)} Z" style="fill:${s.color}; opacity:.10"/>`;
        }
        lines += `<path class="viz-line" d="${d}" fill="none" style="stroke:${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
        const last = s.points[s.points.length - 1];
        lines += `<circle cx="${X(last.x).toFixed(1)}" cy="${Y(last.y).toFixed(1)}" r="4" style="fill:${s.color}" stroke="var(--surface)" stroke-width="2"/>`;
        ends.push({ y: Y(last.y), s, v: last.y });
      });

      let endLabels = '';
      if(showEnd){
        ends.sort((a, b) => a.y - b.y);
        const collide = ends.some((e, i) => i && e.y - ends[i - 1].y < 16);
        if(!collide){
          ends.forEach(e => {
            endLabels += `<text x="${W - m.r + 10}" y="${(e.y + 4).toFixed(1)}" style="font-size:12px; font-weight:600; fill:var(--ink)">${esc(yFmt(e.v))}</text>`;
            if(multi) endLabels += `<text x="${W - m.r + 10}" y="${(e.y + 18).toFixed(1)}" class="viz-axis">${esc(e.s.name)}</text>`;
          });
        }
      }

      const legend = multi ? `<div class="alloc-legend" style="margin:0 0 6px; position:absolute; top:0; left:${m.l}px;">${valid.map(s => `<span><span class="dot" style="background:${s.color}; height:3px; width:14px; border-radius:2px; vertical-align:middle;"></span>${esc(s.name)}</span>`).join('')}</div>` : '';

      el.innerHTML = `${legend}<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(opts.ariaLabel || 'Line chart')}">
        ${g}${lines}${endLabels}
        <line class="viz-cross" x1="0" x2="0" y1="${m.t}" y2="${H - m.b}" stroke="var(--ink-3)" stroke-width="1" style="opacity:0"/>
        <g class="viz-dots"></g>
        <rect x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}" fill="transparent" class="viz-hit" tabindex="0" aria-label="Move across to read values"/>
      </svg>`;

      if(!reduceMotion()){
        el.querySelectorAll('.viz-line').forEach(p => {
          const len = p.getTotalLength();
          p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
          p.getBoundingClientRect();
          p.style.transition = 'stroke-dashoffset 1s cubic-bezier(.22,.9,.3,1)';
          p.style.strokeDashoffset = '0';
          setTimeout(() => { p.style.strokeDasharray = ''; }, 1100);
        });
      }

      const svgEl = el.querySelector('svg'), cross = el.querySelector('.viz-cross'), dots = el.querySelector('.viz-dots'), hit = el.querySelector('.viz-hit');
      const tip = tipFor(el);
      let cur = ref.length - 1;
      const show = (i, cx, cy) => {
        cur = i;
        const xv = ref[i].x, px = X(xv);
        cross.setAttribute('x1', px); cross.setAttribute('x2', px); cross.style.opacity = 1;
        dots.innerHTML = valid.map(s => { const p = s.points[Math.min(i, s.points.length - 1)]; return `<circle cx="${px}" cy="${Y(p.y)}" r="5" style="fill:${s.color}" stroke="var(--surface)" stroke-width="2"/>`; }).join('');
        tip.innerHTML = `<div class="viz-axis" style="margin-bottom:4px">${esc(xFmt(xv))}</div>` + valid.map(s => {
          const p = s.points[Math.min(i, s.points.length - 1)];
          return `<div><strong style="display:inline">${esc(money(p.y))}</strong> <span class="k" style="background:${s.color}; margin-left:6px"></span>${multi ? esc(s.name) : ''}</div>`;
        }).join('');
        tip.classList.add('show');
        const r = svgEl.getBoundingClientRect();
        placeTip(el, tip, cx != null ? cx : r.left + px * r.width / W, cy != null ? cy : r.top + Y(valid[0].points[Math.min(i, valid[0].points.length-1)].y) * r.height / H);
      };
      const hide = () => { cross.style.opacity = 0; dots.innerHTML = ''; tip.classList.remove('show'); };
      hit.addEventListener('pointermove', (ev) => {
        const r = svgEl.getBoundingClientRect();
        const sx = (ev.clientX - r.left) * (W / r.width);
        let best = 0, bd = Infinity;
        ref.forEach((p, i) => { const d = Math.abs(X(p.x) - sx); if(d < bd){ bd = d; best = i; } });
        show(best, ev.clientX, ev.clientY);
      });
      hit.addEventListener('pointerleave', hide);
      hit.addEventListener('focus', () => show(cur));
      hit.addEventListener('blur', hide);
      hit.addEventListener('keydown', (ev) => {
        if(ev.key === 'ArrowLeft'){ show(Math.max(0, cur - 1)); ev.preventDefault(); }
        if(ev.key === 'ArrowRight'){ show(Math.min(ref.length - 1, cur + 1)); ev.preventDefault(); }
      });
    };
    responsive(el, draw);
  }

  /* ---------------- horizontal bars ----------------
     rows: [{ label, value, color, sub }]
     opts: { diverging, format } — diverging puts zero in the middle,
     gains go right in the positive colour and losses left in the negative one. */
  function hbars(elOrId, rows, opts){
    const el = host(elOrId); if(!el) return;
    opts = opts || {};
    if(!rows.length){ el.innerHTML = `<p class="empty">${esc(opts.emptyText || 'Nothing to show yet.')}</p>`; return; }
    const fmt = opts.format || money;
    const maxAbs = Math.max(...rows.map(r => Math.abs(r.value)), 1);
    const div = !!opts.diverging && rows.some(r => r.value < 0);
    // Diverging: one shared scale for both sides, with zero placed by how big the
    // largest loss is against the largest gain, so a single small loss doesn't
    // squeeze every gain into half the width.
    const posMax = Math.max(0, ...rows.map(r => r.value));
    const negMax = Math.max(0, ...rows.map(r => -r.value));
    const span = (posMax + negMax) || 1;
    const zero = div ? Math.min(85, Math.max(12, negMax / span * 100)) : 0;
    const scale = div ? (100 - zero) / (posMax || 1) : 0;
    const negScale = div ? zero / (negMax || 1) : 0;

    el.innerHTML = `<div style="display:grid; grid-template-columns: minmax(90px, 32%) 1fr auto; gap: 12px 14px; align-items:center;">
      ${rows.map((r, i) => {
        const pct = Math.abs(r.value) / maxAbs * (div ? 50 : 100);
        const color = r.color || (r.value < 0 ? 'var(--div-neg)' : 'var(--div-pos)');
        const sign = opts.diverging ? (r.value > 0 ? '+' : r.value < 0 ? '−' : '') : '';
        let bar;
        if(div){
          bar = r.value >= 0
            ? `<div class="viz-grow" style="position:absolute; left:${zero}%; width:${Math.max(r.value * scale, 0.6)}%; height:100%; background:${color}; border-radius:0 4px 4px 0; transform-origin:left; animation-delay:${i * 0.04}s"></div>`
            : `<div class="viz-grow" style="position:absolute; right:${100 - zero}%; width:${Math.max(-r.value * negScale, 0.6)}%; height:100%; background:${color}; border-radius:4px 0 0 4px; transform-origin:right; animation-delay:${i * 0.04}s"></div>`;
          bar += `<div style="position:absolute; left:${zero}%; top:-4px; bottom:-4px; width:1px; background:var(--line-strong)"></div>`;
        }else{
          bar = `<div class="viz-grow" style="width:${Math.max(pct, 0.6)}%; height:100%; background:${color}; border-radius:0 4px 4px 0; transform-origin:left; animation-delay:${i * 0.04}s"></div>`;
        }
        return `
          <div style="font-size:13.5px; min-width:0;"><div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${esc(r.label)}">${esc(r.label)}</div>${r.sub && r.sub !== r.label ? `<div class="hint" style="margin:0">${esc(r.sub)}</div>` : ''}</div>
          <div class="viz-mark" data-i="${i}" tabindex="0" aria-label="${esc(r.label)}: ${esc(sign + fmt(Math.abs(r.value)))}" style="position:relative; height:16px; cursor:default;">${bar}</div>
          <div style="font-size:13px; font-weight:600; font-variant-numeric:tabular-nums; text-align:right; white-space:nowrap;">${esc(sign + (opts.compactValues ? compact(Math.abs(r.value)) : fmt(Math.abs(r.value))))}</div>`;
      }).join('')}
    </div>`;

    const tip = tipFor(el);
    el.querySelectorAll('.viz-mark').forEach(mk => {
      const r = rows[Number(mk.dataset.i)];
      const showTip = (ev) => {
        const sign = opts.diverging ? (r.value > 0 ? '+' : r.value < 0 ? '−' : '') : '';
        tip.innerHTML = `<strong>${esc(sign + money(Math.abs(r.value)))}</strong>${esc(r.label)}${r.detail ? `<div class="viz-axis">${esc(r.detail)}</div>` : ''}`;
        tip.classList.add('show');
        if(ev && ev.clientX) placeTip(el, tip, ev.clientX, ev.clientY);
        else { const b = mk.getBoundingClientRect(); placeTip(el, tip, b.left + b.width / 2, b.top); }
        mk.style.filter = 'brightness(1.08)';
      };
      const hide = () => { tip.classList.remove('show'); mk.style.filter = ''; };
      mk.addEventListener('pointermove', showTip); mk.addEventListener('pointerleave', hide);
      mk.addEventListener('focus', () => showTip()); mk.addEventListener('blur', hide);
    });
  }

  /* ---------------- table view ----------------
     columns: [{ key, label, num, format }] */
  function table(elOrId, columns, rows){
    const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
    if(!el) return;
    if(!rows.length){ el.innerHTML = '<p class="empty">Nothing to show yet.</p>'; return; }
    el.innerHTML = `<table><thead><tr>${columns.map(c => `<th class="${c.num ? 'num' : ''}">${esc(c.label)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr>${columns.map(c => `<td class="${c.num ? 'num' : ''}">${esc(c.format ? c.format(r[c.key], r) : r[c.key])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }

  // Wires a "Table / Chart" button to flip between a chart and its table.
  function toggle(btn, chartEl, tableEl){
    if(typeof btn === 'string') btn = document.getElementById(btn);
    if(typeof chartEl === 'string') chartEl = document.getElementById(chartEl);
    if(typeof tableEl === 'string') tableEl = document.getElementById(tableEl);
    if(!btn || !chartEl || !tableEl) return;
    tableEl.hidden = true;
    btn.textContent = 'Show as table';
    btn.onclick = () => {
      const showTable = tableEl.hidden;
      tableEl.hidden = !showTable; chartEl.hidden = showTable;
      btn.textContent = showTable ? 'Show as chart' : 'Show as table';
      btn.setAttribute('aria-pressed', String(showTable));
    };
  }

  window.CorpusCharts = { donut, line, hbars, table, toggle };
})();
