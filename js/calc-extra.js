/* ===========================================================
   CO₹PU$ — calculators page: tabs, search, and the newer tools
=========================================================== */
(function(){
  const $ = (id) => document.getElementById(id);
  const val = (id) => Number(($(id) || {}).value) || 0;
  const M = (v) => fmtMoney(Math.round(v));
  const C = (v) => fmtCompact(v);
  const show = (id, html) => { const b = $(id); b.style.display = 'block'; b.innerHTML = html; };
  const stat = (label, value, cls) => `<div><div class="stat-label">${label}</div><div class="num ${cls || ''}" style="font-size:20px;">${value}</div></div>`;
  window.CALC_HELPERS = { val, M, C, show, stat };

  /* ---------- country: on the main calculators page keep only the cards for this country ---------- */
  const CC = window.CorpusCountry ? CorpusCountry.current() : 'IN';
  if($('calcTabs')){
    document.querySelectorAll('[data-only]').forEach(el => { if(!el.dataset.only.split(',').includes(CC)) el.remove(); });
    document.querySelectorAll('[data-not]').forEach(el => { if(el.dataset.not.split(',').includes(CC)) el.remove(); });
    document.querySelectorAll('.calc-group').forEach(g => { if(!g.querySelector('.calc-grid > .card')) g.remove(); });
  }

  /* ---------- layout: wide cards, tabs, search ---------- */
  document.querySelectorAll('.calc-grid > .card').forEach(card => {
    if(card.querySelector('table') || ['card_tax','card_sip','card_swp','card_fire','card_free','card_ctax'].includes(card.id) || /PPF year|Rolling|XIRR/i.test(card.querySelector("h2").textContent)){
      card.style.gridColumn = '1 / -1';
    }
  });

  const groups = [...document.querySelectorAll('.calc-group')];
  const tabs = $('calcTabs');
  if(groups.length && tabs){
  let active = groups[0].dataset.cat;
  const setTab = (cat) => {
    active = cat;
    $('calcSearch').value = '';
    groups.forEach(g => { g.hidden = g.dataset.cat !== cat; g.querySelectorAll(':scope > .calc-grid > .card').forEach(c => c.hidden = false); });
    tabs.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
    $('calcNone').hidden = true;
    try{ history.replaceState(null, '', '#' + cat); }catch(e){}
  };
  groups.forEach(g => {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.cat = g.dataset.cat;
    b.textContent = `${g.dataset.label} (${g.querySelectorAll(':scope > .calc-grid > .card').length})`;
    b.onclick = () => setTab(g.dataset.cat);
    tabs.appendChild(b);
  });
  $('calcSearch').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if(!q){ setTab(active); return; }
    tabs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    let any = false;
    groups.forEach(g => {
      let groupHit = false;
      g.querySelectorAll(':scope > .calc-grid > .card').forEach(c => {
        const hit = c.textContent.toLowerCase().includes(q);
        c.hidden = !hit; groupHit = groupHit || hit;
      });
      g.hidden = !groupHit; any = any || groupHit;
    });
    $('calcNone').hidden = any;
  });
  const start = (location.hash || '').slice(1);
  setTab(groups.some(g => g.dataset.cat === start) ? start : active);
  }

  /* ---------- investing ---------- */
  window.runSip = function(){
    const m = val('sip_m'), r = val('sip_r'), y = Math.max(1, Math.round(val('sip_y')));
    const s = sipSchedule(m, y, r);
    show('sip_out', `<div class="grid-3">${stat('Money you put in', M(s.invested))}${stat('Growth on top', M(s.value - s.invested), 'pos')}${stat('Value after ' + y + ' years', M(s.value))}</div>
      <p class="hint">${((s.value / s.invested)).toFixed(1)} times what you put in. Assumes ${r}% a year every year, real returns vary.</p>`);
    CorpusCharts.line('sip_chart', [
      { name: 'Value', color: 'var(--series-1)', points: [{ x: 0, y: 0 }, ...s.yearly.map(p => ({ x: p.year, y: p.value }))] },
      { name: 'Money put in', color: 'var(--series-2)', points: [{ x: 0, y: 0 }, ...s.yearly.map(p => ({ x: p.year, y: p.invested }))] },
    ], { height: 240, xFormat: x => 'Year ' + x, xTickFormat: x => 'Yr ' + x, ariaLabel: 'SIP growth' });
  };

  window.runStepUp = function(){
    const m = val('su_m'), st = val('su_s'), r = val('su_r'), y = Math.max(1, Math.round(val('su_y')));
    const up = stepUpSip(m, st, y, r), flat = sipSchedule(m, y, r);
    show('su_out', `<div class="grid-3">${stat('Value with step-up', M(up.value))}${stat('Value if kept flat', M(flat.value))}${stat('Extra from stepping up', M(up.value - flat.value), 'pos')}</div>
      <p class="hint">You would put in ${M(up.invested)} in total, ending at ${M(up.yearly[up.yearly.length - 1].sip)} a month in the final year.</p>`);
  };

  window.runLump = function(){
    const p = val('ls_p'), r = val('ls_r'), y = val('ls_y');
    const v = lumpsumValue(p, r, y);
    show('ls_out', `<div class="grid-3">${stat('Invested', M(p))}${stat('Growth', M(v - p), 'pos')}${stat('Value after ' + y + ' years', M(v))}</div>`);
  };

  window.runSwp = function(){
    const c = val('swp_c'), w = val('swp_w'), r = val('swp_r'), y = Math.max(1, Math.round(val('swp_y'))), st = val('swp_s');
    const s = swpSchedule(c, w, r, y, st);
    const lasted = s.ranOutMonth
      ? `<p class="hint"><strong style="color:var(--neg)">The money runs out after ${Math.floor(s.ranOutMonth / 12)} years ${s.ranOutMonth % 12} months.</strong> Lower the withdrawal or start with a larger corpus to make it last ${y} years.</p>`
      : `<p class="hint"><strong style="color:var(--pos)">The money lasts all ${y} years</strong> with ${M(s.balance)} still left at the end.</p>`;
    show('swp_out', `<div class="grid-3">${stat('Total withdrawn', M(s.withdrawn))}${stat('Left at the end', M(s.balance), s.balance > 0 ? 'pos' : 'neg')}${stat('Starting corpus', M(c))}</div>${lasted}`);
    CorpusCharts.line('swp_chart', [{ name: 'Balance left', color: 'var(--series-1)', points: [{ x: 0, y: c }, ...s.yearly.map(p => ({ x: p.year, y: p.balance }))] }],
      { height: 220, xFormat: x => 'Year ' + x, xTickFormat: x => 'Yr ' + x, ariaLabel: 'Corpus left over time' });
  };

  window.runSsy = function(){
    const d = Math.min(150000, Math.max(250, val('ssy_d'))), r = val('ssy_r');
    const s = sukanyaSchedule(d, r);
    show('ssy_out', `<div class="grid-3">${stat('You deposit (15 years)', M(s.invested))}${stat('Interest earned', M(s.interest), 'pos')}${stat('At maturity (21 years)', M(s.maturity))}</div>
      <p class="hint">Assumes ${r}% for the whole period, the government resets it every quarter. Deposits qualify for Section 80C under the old regime, and the interest and maturity amount are tax free.${val('ssy_d') !== d ? ' Your deposit was kept within the ₹250 to ₹1,50,000 yearly limit.' : ''}</p>`);
  };


  /* ---------- planning: FIRE and emergency fund ---------- */
  (function prefill(){
    try{
      const s = computeSummary(); const st = s.c.settings || {};
      const exp = Number(st.monthlyExpense); if(exp > 0){ $('fi_exp').value = Math.round(exp); $('ef_exp').value = Math.round(exp); }
      if(Number(st.age) > 0) $('fi_age').value = st.age;
      const cls = Object.fromEntries(s.classTotals.map(c => [c.key, c.value]));
      const invest = (cls.equity || 0) + (cls.fixed || 0) + (cls.retirement || 0) + (cls.gold || 0);
      if(invest > 0) $('fi_cur').value = Math.round(invest);
      const liquid = s.assetBuckets.cash + s.assetBuckets.fd + s.assetBuckets.rd;
      if(liquid > 0) $('ef_have').value = Math.round(liquid);
    }catch(e){}
  })();

  /* ---------- prefill tax, HRA, gratuity and freelancer tools from imported documents ---------- */
  (function prefillIncome(){
    try{
      const d = loadData(), inc = d.income || {}, st = d.settings || {};
      const set = (id, v) => { const el = $(id); if(el && v != null && isFinite(v) && v > 0) el.value = Math.round(v); };
      const note = (id, text) => { const el = $(id); if(el){ el.hidden = false; el.textContent = text; } };
      if(Number(st.age) > 0 && $('tx_age')) $('tx_age').value = st.age;
      const f16 = inc.form16, sal = inc.salary;
      if(f16 && f16.grossSalary){
        set('tx_g', f16.grossSalary + (f16.otherSources || 0)); set('tx_80c', Math.min(150000, f16.d80c || 0) || null); set('tx_80d', f16.d80d); set('tx_enps', f16.d80ccd2); set('tx_nps', f16.d80ccd1b); set('tx_hra', f16.hraExempt);
        if($('tx_sal')) $('tx_sal').value = 'yes';
        addNote('card_tax', `Filled from your Form 16${f16.fy ? ' for FY ' + f16.fy : ''}. Change anything to test a different year.`);
      } else if(sal && sal.gross){
        set('tx_g', sal.gross * 12); set('tx_enps', (sal.employerNps || 0) * 12);
        if($('tx_80c')) $('tx_80c').value = Math.round(Math.min(150000, ((sal.pf || 0) + (sal.vpf || 0)) * 12));
        if($('tx_sal')) $('tx_sal').value = 'yes';
        addNote('card_tax', `Filled from your ${sal.month ? monthLabel(sal.month) + ' ' : ''}payslip, times twelve. Add bonuses and other income if you expect them.`);
      }
      if(sal && sal.basic){
        set('hra_b', ((sal.basic || 0) + (sal.da || 0)) * 12); set('hra_h', (sal.hra || 0) * 12);
        addNote('card_hra', 'Basic and HRA filled from your payslip. Enter the rent you pay to see the exemption.');
        set('gr_w', (sal.basic || 0) + (sal.da || 0));
        addNote('card_grat', 'Basic + DA filled from your payslip.');
      }
      const fl = inc.freelance;
      if(fl){
        const iv = fl.invoices, bk = fl.bank, t26 = fl.tds26as;
        const rec = iv ? (iv.projected || iv.receipts) : bk ? bk.avgMonthly * 12 : t26 ? t26.paid : 0;
        const tds = t26 && t26.tds ? t26.tds : iv ? iv.tds * ((iv.projected || iv.receipts) / Math.max(1, iv.receipts)) : 0;
        set('fr_rec', rec); if($('fr_tds')) $('fr_tds').value = Math.round(tds || 0);
        if(sal && sal.gross && $('fr_sal')) $('fr_sal').value = Math.round(sal.gross * 12);
        if(sal && sal.tds && $('fr_tds')) $('fr_tds').value = Math.round((tds || 0) + sal.tds * 12);
        const src = [iv ? 'your invoice list' : '', bk ? 'client payments in your bank statement' : '', t26 ? 'Form 26AS' : ''].filter(Boolean).join(', ');
        note('fr_src', `Filled from ${src}${sal && sal.gross ? ', and your payslip for salary' : ''}${iv && iv.projected && iv.projected !== iv.receipts ? `, with ${fmtMoney(Math.round(iv.receipts))} so far scaled to a full year` : ''}.`);
      }
    }catch(e){ console.error(e); }
    function addNote(cardId, text){ const c = $(cardId); if(!c) return; const p = document.createElement('p'); p.className = 'hint'; p.style.cssText = 'margin-top:-4px;color:var(--pos);font-weight:600'; p.textContent = text; const h = c.querySelector('.hint'); (h || c.querySelector('h2')).after(p); }
    function monthLabel(ym){ const [y, m] = ym.split('-'); return new Date(+y, +m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }); }
  })();

  /* ---------- country income tax, self-employed tax, UAE gratuity ---------- */
  (function setupCountryCards(){
    if(!window.CorpusCountry || !$('card_ctax')) return;
    const P = CorpusCountry.get();
    if(P.code === 'IN') return;
    $('ct_hint').textContent = `${P.name}, ${P.taxYear} (${P.taxYearSpan}). Brackets, allowances and payroll contributions as of ${P.checked}.`;
    const T = P.tax;
    if(T.statusOptions && $('ct_status')){
      $('ct_status').innerHTML = T.statusOptions.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
      if(P.code === 'SG') $('ct_status_lbl').textContent = 'Residency';
    } else if($('ct_status_wrap')) $('ct_status_wrap').remove();
    const regionOpts = T.regions ? Object.entries(T.regions.list).map(([k, R]) => `<option value="${k}"${k === T.regions.default ? ' selected' : ''}>${R.name}</option>`).join('') : '';
    ['ct', 'cf'].forEach(pre => {
      if(T.regions && $(pre + '_region')){ $(pre + '_region').innerHTML = regionOpts; $(pre + '_region_wrap').hidden = false; }
      if(T.stateRate && $(pre + '_state_wrap')) $(pre + '_state_wrap').hidden = false;
    });
    if($('ct_inc')) $('ct_inc').value = P.example;
    if($('cf_rev')) $('cf_rev').value = Math.round(P.example * 1.2);
    if($('cf_exp')) $('cf_exp').value = Math.round(P.example * 0.2);
    try{
      const sal = (loadData().income || {}).salary;
      if(sal && sal.gross && $('ct_inc')){ $('ct_inc').value = Math.round(sal.gross * 12); const n = $('ct_src'); n.hidden = false; n.textContent = 'Filled from your imported payslip, times twelve.'; n.style.color = 'var(--pos)'; n.style.fontWeight = '600'; }
    }catch(e){}
  })();
  const pct = (x) => (Math.round(x * 1000) / 10) + '%';
  window.runCtax = function(){
    const P = CorpusCountry.get(), inc = val('ct_inc');
    const opts = { kind: 'salary', status: $('ct_status') ? $('ct_status').value : undefined, region: $('ct_region') ? $('ct_region').value : undefined, stateRate: val('ct_state') };
    const r = CorpusCountry.computeTax(P.code, inc, opts);
    const mr = CorpusCountry.marginalRate(P.code, inc, opts);
    show('ct_out', `<div class="grid-3">${stat('Tax and contributions', M(r.total), 'neg')}${stat(r.savings ? 'Take-home after savings' : 'Take-home pay', M(r.takeHome), 'pos')}${stat('Per month', M(r.takeHome / 12))}</div>
      ${r.lines.map(l => `<div class="kv"><span>${l.label}</span><span>${M(l.amount)}</span></div>`).join('')}
      ${r.allowance ? `<div class="kv"><span>${(P.tax.allowance || (P.tax.married || {}).allowance || {}).label || 'Allowance'} used</span><span>${M(r.allowance)}</span></div>` : ''}
      <p class="hint">Effective rate ${pct(r.effective)}, and ${pct(mr)} on your next ${P.symbol.trim()}100. ${P.tax.notes.join(' ')}</p>`);
    if(window.CorpusCharts && r.parts.length){
      CorpusCharts.hbars('ct_chart', r.parts.filter(p => p.tax > 0 || p.rate === 0).map(p => ({ label: `${Math.round(p.rate * 1000) / 10}% band`, sub: `${fmtCompact(p.from)} to ${p.to === Infinity ? 'above' : fmtCompact(p.to)}`, value: Math.round(p.tax), color: 'var(--series-1)' })), { compactValues: true, emptyText: 'No income tax at this income.' });
    } else if($('ct_chart')) $('ct_chart').innerHTML = '';
  };
  window.runCfree = function(){
    const P = CorpusCountry.get(), rev = val('cf_rev'), exp = val('cf_exp'), profit = Math.max(0, rev - exp);
    const r = CorpusCountry.computeTax(P.code, profit, { kind: 'self', revenue: rev, region: $('cf_region') ? $('cf_region').value : undefined, stateRate: val('cf_state') });
    const f = P.freelance || { points: [], vat: '' };
    show('cf_out', `<div class="grid-3">${stat('Profit', M(profit))}${stat('Tax and contributions', M(r.total), 'neg')}${stat('Set aside each month', M(r.total / 12))}</div>
      ${r.lines.map(l => `<div class="kv"><span>${l.label}</span><span>${M(l.amount)}</span></div>`).join('')}
      <p class="hint">Effective rate on profit ${pct(profit ? r.total / profit : 0)}. ${f.vat}</p>
      <ul class="hint" style="padding-left:18px;margin:6px 0 0">${f.points.map(x => `<li>${x}</li>`).join('')}</ul>`);
  };
  window.runCgrat = function(){
    const b = val('cg2_b'), y = val('cg2_y');
    const g = CorpusCountry.uaeGratuity(b, y);
    show('cg2_out', g.eligible ? `<div class="grid-2">${stat('Gratuity', M(g.amount), 'pos')}${stat('In months of basic pay', (g.amount / b).toFixed(1))}</div>
      <p class="hint">${g.capped ? 'Capped at two years of basic pay. ' : ''}Worked out on basic pay only, not allowances, at 1/30 of a month per day. Gratuity is not taxed in the UAE.</p>` : '<p>Gratuity starts after one full year of continuous service.</p>');
  };
  addEventListener('load', () => { try{ if($('card_ctax') && $('calcTabs')) runCtax(); }catch(e){} });

  /* ---------- freelancer and consultant tax (presumptive section 58, old 44ADA) ---------- */
  window.runFree = function(){
    const rec = val('fr_rec'), cashPct = val('fr_cash'), exp = val('fr_exp'), tds = val('fr_tds'), oth = val('fr_oth') + val('fr_sal'), ded = val('fr_ded'), salaried = val('fr_sal') >= 75000;
    const limit = cashPct <= 5 ? 7500000 : 5000000;
    const eligible = rec <= limit;
    const presProfit = rec * 0.5;
    const actualProfit = Math.max(0, rec - exp);
    // the salary standard deduction applies only when there is salary income
    const pNew = incomeTaxNew(presProfit + oth, { salaried }).total;
    const pOld = incomeTaxOld(presProfit + oth, ded, Number(loadData().settings.age) || 30, { salaried }).total;
    const aNew = incomeTaxNew(actualProfit + oth, { salaried }).total;
    const best = eligible ? Math.min(pNew, pOld) : aNew;
    const bestLabel = !eligible ? 'actual profit, new regime' : pNew <= pOld ? 'presumptive, new regime' : 'presumptive, old regime';
    const due = Math.max(0, best - tds);
    const presumptive = eligible && Math.min(pNew, pOld) <= aNew;
    let sched = '';
    if(due >= 10000){
      sched = presumptive
        ? `<div class="kv"><span>Pay all of it by 15 March</span><span>${M(due)}</span></div><p class="hint">Presumptive taxpayers can pay advance tax in one instalment. Paying by 31 March still counts, with a little interest.</p>`
        : [['15 June', .15], ['15 September', .45], ['15 December', .75], ['15 March', 1]].map(([d, p]) => `<div class="kv"><span>By ${d} (${p * 100}% in total)</span><span>${M(due * p)}</span></div>`).join('');
    }
    show('fr_out', `<div class="grid-3">${stat('Tax for the year', M(best))}${stat('Already deducted as TDS', M(tds), 'pos')}${stat(due > 0 ? 'Still to pay' : 'Likely refund', M(due > 0 ? due : tds - best), due > 0 ? 'neg' : 'pos')}</div>
      <div class="kv" style="margin-top:12px"><span>Presumptive, new regime (profit ${M(presProfit)})</span><span>${eligible ? M(pNew) : 'not allowed'}</span></div>
      <div class="kv"><span>Presumptive, old regime</span><span>${eligible ? M(pOld) : 'not allowed'}</span></div>
      <div class="kv"><span>Actual profit, new regime (profit ${M(actualProfit)})</span><span>${M(aNew)}</span></div>
      <p class="hint">Best here: <strong>${bestLabel}</strong>. ${eligible ? `Presumptive taxation works up to ${limit === 7500000 ? '₹75 lakh, since 5% or less came in cash' : '₹50 lakh, since more than 5% came in cash (₹75 lakh if cash is 5% or less)'}. If your real expenses are above half your receipts, keeping books and declaring actual profit can cost less, but then books and possibly an audit are needed.` : `Receipts are above ${limit === 7500000 ? '₹75' : '₹50'} lakh, so presumptive taxation is not available. Books of account and a tax audit apply.`}</p>
      ${due >= 10000 ? `<p class="hint" style="margin-bottom:4px"><strong>Advance tax</strong>, because more than ₹10,000 is due after TDS:</p>${sched}<p class="hint">Setting aside ${M(due / 12)} a month covers it.</p>` : '<p class="hint">Under ₹10,000 due after TDS, so no advance tax is needed. Pay any balance before filing.</p>'}
      ${rec > 2000000 ? '<p class="hint"><strong>GST:</strong> services above ₹20 lakh a year (₹10 lakh in some special category states) need GST registration. Exports of services are zero-rated but still count towards the limit.</p>' : rec > 1500000 ? '<p class="hint"><strong>GST:</strong> you are close to the ₹20 lakh registration limit for services.</p>' : ''}
      <p class="hint">Clients deduct TDS at 10% on professional fees above ₹50,000 a year (section 393, earlier 194J), 2% for technical services. Check your Form 26AS or AIS so every rupee of it is credited.</p>`);
  };

  window.runFire = function(){
    const exp = val('fi_exp'), age = val('fi_age'), ret = val('fi_ret'), swr = val('fi_swr') || 3.5;
    const cur = val('fi_cur'), sip = val('fi_sip'), r = val('fi_r'), inf = val('fi_inf');
    const years = Math.max(0, ret - age);
    const futureMonthly = inflationAdjustedGoal(exp, inf, years);
    const target = futureMonthly * 12 / (swr / 100);
    const projected = lumpsumValue(cur, r, years) + (years > 0 ? sipFutureValue(sip, years, r) : 0);
    const gap = Math.max(0, target - projected);
    const extraSip = gap > 0 && years > 0 ? requiredMonthlySip(gap, years, r, 0) : 0;
    // the age you would actually get there at your current pace
    let reachAge = null; const series = [];
    for(let y = 0; y <= 50; y++){
      const corpus = lumpsumValue(cur, r, y) + (y > 0 ? sipFutureValue(sip, y, r) : 0);
      const need = inflationAdjustedGoal(exp, inf, y) * 12 / (swr / 100);
      if(y <= Math.max(years + 5, 15)) series.push({ y, corpus, need });
      if(reachAge === null && corpus >= need) reachAge = age + y;
    }
    show('fi_out', `<div class="grid-3">${stat('FIRE number at ' + ret, M(target))}${stat('You are on track for', M(projected), projected >= target ? 'pos' : '')}${stat(gap > 0 ? 'Extra monthly SIP needed' : 'Ahead by', M(gap > 0 ? extraSip : projected - target), gap > 0 ? 'neg' : 'pos')}</div>
      <p class="hint">Your expenses of ${M(exp)} a month grow to about ${M(futureMonthly)} by age ${ret}. At a ${swr}% withdrawal rate you need ${(100 / swr).toFixed(0)} times a year's spending. ${reachAge ? `At your current pace you reach it around age ${reachAge}.` : 'At your current pace you would not reach it within 50 years.'}
      Many Indian planners use 3 to 3.5% rather than the American 4%, because Indian inflation runs higher.</p>`);
    CorpusCharts.line('fi_chart', [
      { name: 'Your corpus', color: 'var(--series-1)', points: series.map(p => ({ x: age + p.y, y: p.corpus })) },
      { name: 'Amount needed', color: 'var(--series-2)', points: series.map(p => ({ x: age + p.y, y: p.need })) },
    ], { height: 240, xFormat: x => 'Age ' + x, xTickFormat: x => String(x), ariaLabel: 'Corpus against FIRE number by age' });
  };

  window.runEmergency = function(){
    const exp = val('ef_exp'), m = Number($('ef_m').value) || 6, have = val('ef_have'), add = val('ef_add');
    const target = exp * m, gap = Math.max(0, target - have);
    const months = gap > 0 && add > 0 ? Math.ceil(gap / add) : 0;
    show('ef_out', `<div class="grid-3">${stat('Target', M(target))}${stat('Set aside', M(have), have >= target ? 'pos' : '')}${stat(gap > 0 ? 'Still to build' : 'Covered', gap > 0 ? M(gap) : '✓', gap > 0 ? 'neg' : 'pos')}</div>
      <p class="hint">${gap > 0 ? (add > 0 ? `Adding ${M(add)} a month gets you there in about ${months} month${months === 1 ? '' : 's'}. ` : 'Set a monthly amount to see how long it takes. ') : 'You have a full cushion. Anything beyond this can be invested for growth. '}Keep it where you can reach it within a day or two: a savings account, sweep-in FD or liquid fund, not in shares.</p>`);
  };

  /* ---------- tax & salary ---------- */
  window.runTax = function(){
    const g = val('tx_g'), age = val('tx_age') || 30, sal = $('tx_sal').value === 'yes';
    const hl = Math.min(200000, val('tx_hl')), nps = Math.min(50000, val('tx_nps')), c80 = Math.min(150000, val('tx_80c'));
    const oldDed = c80 + val('tx_80d') + hl + val('tx_hra') + nps + val('tx_oth') + val('tx_enps');
    const n = incomeTaxNew(g, { salaried: sal, employerNps: val('tx_enps') });
    const o = incomeTaxOld(g, oldDed, age, { salaried: sal });
    const better = n.total <= o.total ? 'new' : 'old';
    const diff = Math.abs(n.total - o.total);
    const col = (t, name, win) => `<div class="card" style="margin:0; ${win ? 'border-color:var(--accent); box-shadow:0 0 0 1px var(--accent);' : ''}">
        <div class="stat-label">${name} ${win ? '<span class="pill moss">Lower tax</span>' : ''}</div>
        <div class="num" style="font-size:24px;">${M(t.total)}</div>
        <div class="kv"><span>Deductions used</span><span>${M(t.deductions)}</span></div>
        <div class="kv"><span>Taxable income</span><span>${M(t.taxable)}</span></div>
        <div class="kv"><span>Tax on slabs</span><span>${M(t.slabTax)}</span></div>
        <div class="kv"><span>Rebate / relief</span><span>${t.rebate ? "−" + M(t.rebate) : M(0)}</span></div>
        ${t.surcharge ? `<div class="kv"><span>Surcharge</span><span>${M(t.surcharge)}</span></div>` : ''}
        <div class="kv"><span>Cess (4%)</span><span>${M(t.cess)}</span></div>
        <div class="kv"><span>Per month</span><span>${M(t.total / 12)}</span></div>
      </div>`;
    show('tx_out', `<div class="grid-2">${col(n, 'New regime', better === 'new')}${col(o, 'Old regime', better === 'old')}</div>
      <p class="hint" style="margin-top:12px;">${diff < 1 ? 'Both regimes come to the same tax.' : `The ${better} regime saves you about ${M(diff)} a year.`}
      ${o.total < n.total ? ' Your deductions are large enough to make the old regime worthwhile.' : ' Unless your deductions grow a lot, the new regime\'s lower slabs win.'}
      Surcharge above ₹50 lakh is shown without marginal relief, so treat very high incomes as approximate. Confirm on the Income Tax Department's own calculator before filing.</p>`);
  };

  window.runHra = function(){
    const h = hraExemption(val('hra_b'), val('hra_h'), val('hra_r'), $('hra_c').value === '50');
    const pct = $('hra_c').value;
    show('hra_out', `<div class="grid-2">${stat('Tax-free HRA', M(h.exempt), 'pos')}${stat('Taxable HRA', M(h.taxable))}</div>
      <div style="margin-top:10px;">
        <div class="kv"><span>Actual HRA received</span><span>${M(h.a)}</span></div>
        <div class="kv"><span>${pct}% of basic + DA</span><span>${M(h.b)}</span></div>
        <div class="kv"><span>Rent minus 10% of basic + DA</span><span>${M(h.c)}</span></div>
      </div>
      <p class="hint">The exemption is the lowest of these three. Under the new regime HRA is fully taxable. If your rent is over ₹1 lakh a year you need your landlord's PAN.</p>`);
  };

  window.runGrat = function(){
    const g = gratuityAmount(val('gr_w'), Math.floor(val('gr_y')), val('gr_m'));
    show('gr_out', `<div class="grid-3">${stat('Gratuity', M(g.amount))}${stat('Tax free', M(g.taxFree), 'pos')}${stat('Taxable', M(g.taxable))}</div>
      <p class="hint">Counted as ${g.fullYears} years${val('gr_m') > 6 ? ', since more than 6 months in the last year rounds up' : ''}. The ₹20 lakh tax-free limit is for your whole working life across all employers.</p>`);
  };

  /* ---------- loans ---------- */
  window.runPrepay = function(){
    const o = val('pp_o'), r = val('pp_r'), n = Math.round(val('pp_n')), p = Math.min(val('pp_p'), o);
    const x = loanPrepayment(o, r, n, p);
    const left = n - x.monthsA;
    show('pp_out', `<div class="grid-2">
        <div class="card" style="margin:0;"><div class="stat-label">Keep your EMI, finish sooner</div><div class="num pos" style="font-size:22px;">Save ${M(x.savedA)}</div>
          <div class="kv"><span>EMI</span><span>${M(x.oldEmi)}</span></div><div class="kv"><span>Loan ends</span><span>${Math.floor(left / 12)} yrs ${left % 12} mo earlier</span></div></div>
        <div class="card" style="margin:0;"><div class="stat-label">Keep your tenure, lower EMI</div><div class="num pos" style="font-size:22px;">Save ${M(x.savedB)}</div>
          <div class="kv"><span>New EMI</span><span>${M(x.emiB)}</span></div><div class="kv"><span>Lower by</span><span>${M(x.oldEmi - x.emiB)} a month</span></div></div>
      </div>
      <p class="hint" style="margin-top:12px;">Keeping the EMI saves more interest${x.savedA > x.savedB ? `, ${M(x.savedA - x.savedB)} more here` : ''}. Banks cannot charge a prepayment penalty on floating-rate home loans taken by individuals.</p>`);
  };

  window.runAfford = function(){
    const a = homeAffordability(val('af_i'), val('af_e'), val('af_r'), val('af_y'), val('af_d'), val('af_s'));
    show('af_out', `<div class="grid-3">${stat('Home price you can afford', M(a.maxPrice))}${stat('Largest loan', M(a.maxLoan))}${stat('EMI that fits', M(a.maxEmi))}</div>
      <p class="hint">Over the loan you would pay about ${M(a.totalInterest)} in interest. Stamp duty, registration and interiors usually add another 7 to 10% to the price, so keep cash aside for those.</p>`);
  };

  /* ---------- inflation ---------- */
  window.runInfl = function(){
    const a = val('in_a'), r = val('in_r'), y = val('in_y');
    const x = inflationImpact(a, r, y);
    show('in_out', `<div class="grid-2">${stat(`What ${M(a)} of things costs in ${y} years`, M(x.futureCost), 'neg')}${stat(`What ${M(a)} received in ${y} years is worth today`, M(x.todaysValueOfFuture))}</div>
      <p class="hint">At ${r}% inflation, prices double roughly every ${(72 / (r || 1)).toFixed(0)} years.</p>`);
  };
})();
