/* =========================================================
   CO₹PU$ — PDF report, made on this device
   ---------------------------------------------------------
   Builds a real PDF file in the browser with a bundled copy of
   jsPDF and a small subset of the Inter font (so ₹, £ and € print
   properly). Nothing is uploaded: the file is assembled in memory
   and handed straight to the browser's download.
   Needs storage.js, countries.js, finance.js, compute.js and
   advice.js on the page. jsPDF and the fonts load on first use.
   ========================================================= */
(function(){
  'use strict';
  let libPromise = null;

  function loadScript(src){
    return new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = src; s.onload = res;
      s.onerror = () => rej(new Error('Could not load the PDF maker. Check your connection once, after that it works offline.'));
      document.head.appendChild(s);
    });
  }
  async function fontB64(url){
    const buf = await (await fetch(url)).arrayBuffer();
    const bytes = new Uint8Array(buf); let bin = '';
    for(let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  function loadLib(){
    if(!libPromise){
      libPromise = (async () => {
        if(!(window.jspdf && window.jspdf.jsPDF)) await loadScript('js/vendor/jspdf.umd.min.js');
        const [reg, bold] = await Promise.all([fontB64('fonts/pdf/inter-regular.ttf'), fontB64('fonts/pdf/inter-bold.ttf')]);
        return { jsPDF: window.jspdf.jsPDF, reg, bold };
      })();
      libPromise.catch(() => { libPromise = null; });
    }
    return libPromise;
  }

  /* ---------- colours (fixed, so the PDF looks the same in dark mode) ---------- */
  const C = {
    ink: [34, 26, 46], ink2: [86, 80, 98], ink3: [130, 124, 140], line: [226, 223, 230],
    brand: [242, 165, 22], brandSoft: [253, 242, 220], pos: [21, 128, 61], neg: [185, 28, 28], soft: [247, 246, 243],
    series: [[42, 120, 214], [235, 104, 52], [27, 175, 122], [237, 161, 0], [232, 123, 164], [0, 131, 0]]
  };
  const strip = (h) => String(h == null ? '' : h).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;|&rsquo;/g, '’').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

  async function build(){
    const { jsPDF, reg, bold } = await loadLib();
    const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
    doc.addFileToVFS('Inter-Regular.ttf', reg); doc.addFont('Inter-Regular.ttf', 'Inter', 'normal');
    doc.addFileToVFS('Inter-Bold.ttf', bold); doc.addFont('Inter-Bold.ttf', 'Inter', 'bold');
    doc.setFont('Inter', 'normal');

    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
    const M = 46, CW = W - M * 2, FOOT = 54;
    let y = M;

    const P = window.CorpusCountry ? CorpusCountry.get() : { code: 'IN', name: 'India', currency: 'INR', taxYear: 'FY 2026-27', checkWith: 'a qualified professional' };
    const data = loadData();
    const s = computeSummary();
    const hs = typeof healthScore === 'function' ? healthScore() : null;
    const money = (n) => fmtMoney(Math.round(Number(n) || 0)).replace(/^-/, '−');
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const color = (rgb, kind) => kind === 'fill' ? doc.setFillColor(...rgb) : kind === 'draw' ? doc.setDrawColor(...rgb) : doc.setTextColor(...rgb);
    const font = (size, weight, rgb) => { doc.setFont('Inter', weight || 'normal'); doc.setFontSize(size); color(rgb || C.ink); };
    function ensure(h){ if(y + h > H - FOOT){ doc.addPage(); y = M; return true; } return false; }
    function para(text, size, rgb, gap, weight){
      font(size || 10, weight, rgb || C.ink2);
      const lines = doc.splitTextToSize(strip(text), CW);
      const lh = (size || 10) * 1.45;
      lines.forEach(l => { ensure(lh); doc.text(l, M, y + (size || 10)); y += lh; });
      y += gap == null ? 6 : gap;
    }
    function heading(text){
      ensure(100);   // keep a heading with at least its first rows
      y += 10;
      font(14, 'bold', C.ink); doc.text(text, M, y + 14);
      color(C.brand, 'fill'); doc.rect(M, y + 21, 28, 2.5, 'F');
      y += 34;
    }
    // table: cols = [{ label, w (fraction), align }], rows = arrays of strings
    function table(cols, rows, opts){
      opts = opts || {};
      const rowH = 20, pad = 6;
      const xs = []; let x = M; cols.forEach(c => { xs.push(x); x += c.w * CW; });
      const head = () => {
        color(C.soft, 'fill'); doc.rect(M, y, CW, rowH, 'F');
        font(8.5, 'bold', C.ink3);
        cols.forEach((c, i) => {
          const tx = c.align === 'right' ? xs[i] + c.w * CW - pad : xs[i] + pad;
          doc.text(c.label.toUpperCase(), tx, y + 13, { align: c.align === 'right' ? 'right' : 'left' });
        });
        y += rowH;
      };
      ensure(rowH * 2); head();
      rows.forEach((r, ri) => {
        // every cell wraps to at most three lines inside its column
        font(9.5, 'normal', C.ink);
        const cells = cols.map((c, i) => doc.splitTextToSize(String(r[i] == null ? '' : r[i]), c.w * CW - pad * 2).slice(0, 3));
        const h = Math.max(rowH, Math.max(...cells.map(l => l.length)) * 12 + 8);
        if(ensure(h)) head();
        const isTotal = opts.totalLast && ri === rows.length - 1;
        cols.forEach((c, i) => {
          font(9.5, isTotal || (i === 0 && opts.boldFirst) ? 'bold' : 'normal', (opts.tone && opts.tone(ri, i)) || C.ink);
          const tx = c.align === 'right' ? xs[i] + c.w * CW - pad : xs[i] + pad;
          cells[i].forEach((ln, k) => doc.text(ln, tx, y + 13 + k * 12, { align: c.align === 'right' ? 'right' : 'left' }));
        });
        color(C.line, 'draw'); doc.setLineWidth(0.6); doc.line(M, y + h, M + CW, y + h);
        y += h;
      });
      y += 10;
    }

    /* ---------- cover band ---------- */
    color(C.ink, 'fill'); doc.rect(0, 0, W, 118, 'F');
    // logo mark: an amber tile with rising bars
    color(C.brand, 'fill'); doc.roundedRect(M, 34, 34, 34, 8, 8, 'F');
    color(C.ink, 'fill');
    [[0, 2], [1, 3], [2, 4]].forEach(([col, n]) => { for(let k = 0; k < n; k++) doc.roundedRect(M + 5.5 + col * 8.3, 34 + 26.5 - k * 4, 6.6, 2.9, 1.4, 1.4, 'F'); });
    doc.circle(M + 5.5 + 2 * 8.3 + 3.3, 34 + 7, 2.6, 'F');
    font(20, 'bold', [255, 255, 255]); doc.text('CO₹PU$', M + 46, 58);
    font(10, 'normal', [210, 204, 220]); doc.text('Net Worth Report', M + 46, 74);
    font(9.5, 'normal', [210, 204, 220]);
    doc.text(`Prepared ${dateStr}`, W - M, 52, { align: 'right' });
    doc.text(`${P.name} · ${P.taxYear} rules · ${data.settings.currency || P.currency}`, W - M, 67, { align: 'right' });
    y = 146;

    /* ---------- headline tiles ---------- */
    const tiles = [
      ['Net worth', money(s.netWorth), s.netWorth < 0 ? C.neg : C.ink],
      ['What you own', money(s.totalAssets), C.ink],
      ['What you owe', money(s.totalLiabilities), C.ink],
      ['Health score', hs ? `${hs.total} / 100` : '—', C.ink]
    ];
    const tw = (CW - 3 * 10) / 4;
    tiles.forEach((t, i) => {
      const x = M + i * (tw + 10);
      color(i === 0 ? C.brandSoft : C.soft, 'fill'); doc.roundedRect(x, y, tw, 62, 8, 8, 'F');
      font(8.5, 'bold', C.ink3); doc.text(t[0].toUpperCase(), x + 10, y + 18);
      let size = 15; font(size, 'bold', t[2]);
      while(doc.getTextWidth(t[1]) > tw - 20 && size > 9){ size -= 1; doc.setFontSize(size); }
      doc.text(t[1], x + 10, y + 42);
      if(i === 3 && hs){ font(8.5, 'normal', C.ink2); doc.text(hs.band, x + 10, y + 55); }
    });
    y += 82;

    /* ---------- allocation bar ---------- */
    const classes = s.classTotals.filter(c => c.value > 0);
    if(s.totalAssets > 0 && classes.length){
      heading('Where Your Money Sits');
      let x = M;
      s.classTotals.forEach((c, i) => {
        if(c.value <= 0) return;
        const w = CW * c.value / s.totalAssets;
        color(C.series[i % 6], 'fill'); doc.rect(x, y, Math.max(w, 1), 14, 'F'); x += w;
      });
      y += 26;
      let lx = M, ly = y;
      s.classTotals.forEach((c, i) => {
        if(c.value <= 0) return;
        const label = `${c.label}  ${(100 * c.value / s.totalAssets).toFixed(1)}%`;
        font(9, 'normal', C.ink2);
        const w = doc.getTextWidth(label) + 26;
        if(lx + w > M + CW){ lx = M; ly += 16; }
        color(C.series[i % 6], 'fill'); doc.roundedRect(lx, ly - 7.5, 9, 9, 2, 2, 'F');
        doc.text(label, lx + 14, ly);
        lx += w;
      });
      y = ly + 18;
    }

    /* ---------- assets ---------- */
    const typeRows = Object.entries(s.assetBuckets).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    if(typeRows.length){
      heading('Assets');
      const labels = typeof ASSET_TYPE_LABELS === 'object' ? ASSET_TYPE_LABELS : {};
      const rows = typeRows.map(([k, v]) => [labels[k] || k, String((s.c[k] || []).length), money(v), (100 * v / s.totalAssets).toFixed(1) + '%']);
      rows.push(['Total', '', money(s.totalAssets), '100%']);
      table([{ label: 'Type', w: .46 }, { label: 'Holdings', w: .14, align: 'right' }, { label: 'Value', w: .24, align: 'right' }, { label: 'Share', w: .16, align: 'right' }], rows, { totalLast: true });

      // the individual holdings, largest first
      const items = [];
      typeRows.forEach(([k]) => (s.c[k] || []).forEach(e => items.push([e.name || e.bank || e.symbol || 'Untitled', labels[k] || k, money(e.currentValue), typeof e.gain === 'number' ? (e.gain >= 0 ? '+' : '−') + money(Math.abs(e.gain)) : '', e])));
      items.sort((a, b) => (b[4].currentValue || 0) - (a[4].currentValue || 0));
      if(items.length > 1){
        y += 4; font(10.5, 'bold', C.ink); ensure(30); doc.text('Holdings', M, y + 10); y += 18;
        table([{ label: 'Name', w: .42 }, { label: 'Type', w: .2 }, { label: 'Value', w: .2, align: 'right' }, { label: 'Gain', w: .18, align: 'right' }],
          items.slice(0, 60).map(r => r.slice(0, 4)),
          { tone: (ri, ci) => ci === 3 ? (items[ri][4].gain < 0 ? C.neg : C.pos) : null });
        if(items.length > 60) para(`And ${items.length - 60} smaller holdings.`, 9, C.ink3);
      }
    }

    /* ---------- liabilities ---------- */
    const debts = [
      ...s.c.loans.map(l => [l.name || 'Loan', (Number(l.rate) || 0) + '%', money(l.monthlyEmi), money(l.balance)]),
      ...s.c.debts.map(d => [d.name || 'Debt', (Number(d.rate) || 0) + '%', money(d.minPayment), money(d.amount)])
    ];
    if(debts.length){
      heading('Liabilities');
      debts.push(['Total', '', money(s.monthlyEmiOutgo + s.monthlyDebtMin), money(s.totalLiabilities)]);
      table([{ label: 'Name', w: .43 }, { label: 'Rate', w: .13, align: 'right' }, { label: 'Monthly', w: .2, align: 'right' }, { label: 'Balance', w: .24, align: 'right' }], debts, { totalLast: true });
    }

    /* ---------- health score ---------- */
    if(hs){
      heading(`Financial Health: ${hs.total} out of 100, ${hs.band}`);
      table([{ label: 'Area', w: .24 }, { label: 'Points', w: .12, align: 'right' }, { label: 'Where you are', w: .64 }],
        hs.parts.map(p => [p.label, `${p.points} / 20`, strip(p.status)]), { boldFirst: true });
    }

    /* ---------- budget ---------- */
    const b = data.budget || {};
    const income = Number(b.income) || 0;
    const spend = (b.items || []).filter(i => i.type !== 'savings').reduce((a, i) => a + (Number(i.amount) || 0), 0);
    if(income > 0){
      heading('Monthly Budget');
      const kinds = { need: 'Needs', want: 'Wants', savings: 'Savings' };
      const by = {}; (b.items || []).forEach(i => { const k = kinds[i.type] || 'Other'; by[k] = (by[k] || 0) + (Number(i.amount) || 0); });
      const rows = [['Take-home income', money(income), '100%']];
      Object.entries(by).forEach(([k, v]) => rows.push([k, money(v), (100 * v / income).toFixed(0) + '%']));
      rows.push(['Left to save', money(income - spend), (100 * Math.max(0, income - spend) / income).toFixed(0) + '%']);
      table([{ label: 'Line', w: .5 }, { label: 'Per month', w: .3, align: 'right' }, { label: 'Of income', w: .2, align: 'right' }], rows, { totalLast: true });
    }

    /* ---------- goals ---------- */
    if((data.goals || []).length){
      heading('Goals');
      table([{ label: 'Goal', w: .44 }, { label: 'Target', w: .22, align: 'right' }, { label: 'By', w: .12, align: 'right' }, { label: 'Monthly', w: .22, align: 'right' }],
        data.goals.map(g => [g.name || 'Goal', money(g.target), String(g.targetYear || '—'), money(g.sip)]));
    }

    /* ---------- dates ---------- */
    if(typeof taxDeadlines === 'function'){
      const dl = taxDeadlines(Date.now(), 120).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0).slice(0, 6);
      if(dl.length){
        heading('Coming Up in the Next 120 Days');
        table([{ label: 'Date', w: .2 }, { label: 'What', w: .42 }, { label: 'Detail', w: .38 }],
          dl.map(e => [new Date(e.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), strip(e.title), strip(e.detail)]));
      }
    }

    /* ---------- advice ---------- */
    const adv = typeof generateAdvice === 'function' ? generateAdvice() : [];
    if(adv.length){
      heading('What to Look At');
      adv.slice(0, 12).forEach(a => {
        const tone = a.level === 'bad' || a.level === 'danger' ? C.neg : a.level === 'good' ? C.pos : C.brand;
        font(10.5, 'bold', C.ink);
        const t = doc.splitTextToSize(strip(a.title), CW - 14);
        ensure(t.length * 14 + 24);
        color(tone, 'fill'); doc.rect(M, y + 2, 3, t.length * 14 + 2, 'F');
        t.forEach((l, k) => doc.text(l, M + 12, y + 12 + k * 14));
        y += t.length * 14 + 4;
        const keep = M; // indent body under the title
        font(9.5, 'normal', C.ink2);
        doc.splitTextToSize(strip(a.text), CW - 12).forEach(l => { ensure(14); doc.text(l, keep + 12, y + 10); y += 13.5; });
        y += 10;
      });
    }

    /* ---------- disclaimer ---------- */
    const disc = `This report was made on your own device from the figures you entered or imported, using ${P.name} rules as last checked (${P.taxYear}). It is an estimate to help you think, not a confirmation of your net worth, the tax you owe, any refund or future returns, and it is not financial, tax or legal advice. Before you act on it, check with ${P.checkWith || 'a qualified professional'}. If anything here disagrees with an official statement, the official statement is right.`;
    font(9.5, 'normal', C.ink2);
    const dl = doc.splitTextToSize(disc, CW - 28);
    const bh = dl.length * 13.5 + 40;
    ensure(bh + 20); y += 12;
    color(C.brandSoft, 'fill'); doc.roundedRect(M, y, CW, bh, 8, 8, 'F');
    color(C.brand, 'fill'); doc.rect(M, y, 4, bh, 'F');
    font(10.5, 'bold', C.ink); doc.text('Please Read: Estimates, Not Advice', M + 14, y + 20);
    font(9.5, 'normal', C.ink2); dl.forEach((l, k) => doc.text(l, M + 14, y + 38 + k * 13.5));
    y += bh;

    /* ---------- footer on every page ---------- */
    const n = doc.getNumberOfPages();
    for(let i = 1; i <= n; i++){
      doc.setPage(i);
      color(C.line, 'draw'); doc.setLineWidth(0.6); doc.line(M, H - 36, W - M, H - 36);
      font(8, 'normal', C.ink3);
      doc.text(`CO₹PU$ · ${dateStr} · Estimates only, not advice. Check with a qualified professional before acting.`, M, H - 22);
      doc.text(`Page ${i} of ${n}`, W - M, H - 22, { align: 'right' });
    }
    doc.setProperties({ title: `CO₹PU$ Net Worth Report, ${dateStr}`, subject: 'Net worth report', creator: 'CO₹PU$ (made in your browser)', keywords: 'net worth, report' });
    return doc;
  }

  async function download(btn){
    const label = btn ? btn.innerHTML : '';
    if(btn){ btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.textContent = 'Making your PDF…'; }
    try{
      const doc = await build();
      const d = new Date();
      const name = `corpus-report-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.pdf`;
      doc.save(name);
      if(window.showToast) showToast('Report downloaded. It holds your figures, so keep it somewhere safe.');
      return doc;
    }catch(err){
      if(window.showToast) showToast(err.message || 'Could not make the PDF.');
      throw err;
    }finally{
      if(btn){ btn.disabled = false; btn.removeAttribute('aria-busy'); btn.innerHTML = label; }
    }
  }

  window.CorpusReport = { build, download };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pdf-report]');
    if(b){ e.preventDefault(); download(b).catch(() => {}); }
  });
})();
