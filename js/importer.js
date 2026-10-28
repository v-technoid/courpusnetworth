/* ===========================================================
   CO₹PU$ — import page
   Read → detect → let the person check every number → apply only
   what they tick. A copy of the data is kept first, so the last
   import can be undone in one click.
=========================================================== */
(function(){
  const $ = (id) => document.getElementById(id);
  const X = window.CorpusExtract;
  const M = (v) => fmtMoney(Math.round(Number(v) || 0));
  const C = (v) => fmtCompact(Number(v) || 0);
  const esc = escapeHtml;
  const n = (v) => Number(v) || 0;
  const UNDO_KEY = 'corpus_undo_v1';
  const icon = (name) => window.CORPUS_ICON ? window.CORPUS_ICON(name) : '';

  const TYPES = {
    payslip:  { label: 'Salary Slip', icon: 'reports' },
    form16:   { label: 'Form 16', icon: 'tax' },
    bank:     { label: 'Bank Statement', icon: 'liabilities' },
    invoices: { label: 'Invoices or Income List', icon: 'budget' },
    tds26as:  { label: 'Form 26AS or AIS', icon: 'audit' },
    holdings: { label: 'Stock or Fund Holdings', icon: 'charts' },
    cas:      { label: 'Mutual Fund Statement (CAS)', icon: 'charts' },
    epf:      { label: 'EPF Passbook', icon: 'assets' },
    backup:   { label: 'CO₹PU$ Backup File', icon: 'download' },
    unknown:  { label: 'Not Recognised Yet', icon: 'help' },
  };
  const WORK = {
    salaried:   { label: 'Salaried', need: [['Latest payslip', 'Fills take-home pay, PF, tax and HRA'], ['Form 16', 'Last year’s salary, deductions and tax'], ['Bank statement', '3 to 12 months, builds your budget'], ['Broker holdings or CAS', 'Adds your stocks and funds']] },
    freelancer: { label: 'Freelancer or Consultant', need: [['Invoice list (Excel or CSV)', 'Receipts, TDS and GST by client'], ['Form 26AS or AIS', 'TDS your clients deducted'], ['Bank statement', 'Client payments and spending'], ['Broker holdings or CAS', 'Adds your stocks and funds']] },
    business:   { label: 'Business Owner', need: [['Bank statement', 'Money in and out by category'], ['Sales or invoice register', 'Receipts and GST'], ['Form 26AS or AIS', 'TDS deducted on your receipts'], ['Broker holdings or CAS', 'Adds your investments']] },
    mixed:      { label: 'Salary Plus Side Income', need: [['Payslip', 'Your salary side'], ['Invoice list or 26AS', 'Your side income and its TDS'], ['Bank statement', 'Everything that came in and went out'], ['Broker holdings or CAS', 'Adds your investments']] },
    retired:    { label: 'Retired or Pension', need: [['Bank statement', 'Pension, interest and spending'], ['Form 26AS or AIS', 'TDS on interest and pension'], ['CAS', 'Your mutual funds'], ['EPF passbook', 'If anything is left in EPF']] },
    student:    { label: 'Student or Not Earning Yet', need: [['Bank statement', 'Pocket money, stipend and spending'], ['Broker holdings or CAS', 'Any investments you have started'], ['Scholarship letters', 'See the Scholarships page'], ['Nothing else needed', 'Start with a budget']] },
  };

  /* ---------- work type ---------- */
  function renderWork(){
    const cur = loadData().settings.workType || '';
    $('workSeg').innerHTML = Object.entries(WORK).map(([k, w]) => `<button type="button" data-work="${k}" aria-pressed="${k === cur}">${esc(w.label)}</button>`).join('');
    const w = WORK[cur];
    const need = w ? (INDIA ? w.need : w.need.filter(([a]) => !NOT_INDIA_DOCS.test(a)).map(([a, b]) => [a.replace(/ or CAS|CAS/, 'Fund holdings'), b])) : null;
    if(need && !INDIA && !need.some(([a]) => /holdings/i.test(a))) need.push(['Broker or fund holdings', 'Adds your investments']);
    $('workNeed').innerHTML = need ? need.map(([a, b]) => `<div><strong>${esc(a)}</strong>${esc(b)}</div>`).join('') : '<div><strong>Pick one above</strong>so the list of useful documents fits how you earn.</div>';
    if(!INDIA){
      const head = document.querySelector('.page-head p');
      if(head && !head.dataset.done){ head.dataset.done = '1'; head.textContent = `Drop in a payslip, bank statement, invoice list or broker and fund holdings. It is read inside this browser using ${P.name} formats, you check every number, and only what you tick gets filled in across the app.`; }
      document.querySelectorAll('.imp-kinds span').forEach(x => { if(/Form 16|26AS|CAMS|EPF/.test(x.textContent)) x.remove(); });
    }
  }
  $('workSeg').addEventListener('click', (e) => {
    const b = e.target.closest('[data-work]'); if(!b) return;
    updateSettings({ workType: b.dataset.work }); renderWork();
    queue.forEach(it => it.result && renderCard(it));
  });
  const workType = () => loadData().settings.workType || '';
  const P = window.CorpusCountry ? CorpusCountry.get() : { code: 'IN' };
  const INDIA = P.code === 'IN';
  const NOT_INDIA_DOCS = /Form 16|26AS|AIS|EPF/;
  const earnsFreelance = () => ['freelancer', 'business', 'mixed'].includes(workType());

  /* ---------- password dialog ---------- */
  function askPassword(fileName, wrong){
    return new Promise(resolve => {
      const dlg = $('pwDialog');
      $('pwFile').textContent = fileName;
      $('pwErr').hidden = !wrong;
      const input = $('pwInput'); input.value = '';
      const done = (v) => { dlg.close(); $('pwForm').onsubmit = null; $('pwSkip').onclick = null; resolve(v); };
      $('pwForm').onsubmit = (e) => { e.preventDefault(); done(input.value); };
      $('pwSkip').onclick = () => done(null);
      dlg.addEventListener('cancel', () => done(null), { once: true });
      dlg.showModal(); input.focus();
    });
  }

  /* ---------- queue ---------- */
  const queue = [];
  let busy = false;
  function addFiles(files){
    [...files].forEach(f => {
      const it = { id: 'imp' + Math.random().toString(36).slice(2, 8), file: f, status: 'waiting' };
      const el = document.createElement('article'); el.className = 'card imp-card'; el.id = it.id; it.el = el;
      $('impList').prepend(el);
      queue.push(it); renderCard(it);
    });
    $('impEmpty').hidden = true;
    pump();
  }
  async function pump(){
    if(busy) return; busy = true;
    for(const it of queue.filter(q => q.status === 'waiting')){
      it.status = 'reading'; it.progress = 'Opening the file'; renderCard(it);
      try{
        it.doc = await CorpusReaders.read(it.file, {
          askPassword: (wrong) => askPassword(it.file.name, wrong),
          onProgress: (msg) => { it.progress = msg; const s = it.el.querySelector('.imp-status span'); if(s) s.textContent = msg; }
        });
        it.result = X.extract(it.doc);
        it.status = 'ready';
      }catch(err){
        it.status = 'error'; it.error = err.message || 'This file could not be read.';
      }
      renderCard(it);
    }
    busy = false;
  }

  /* ---------- helpers for current data ---------- */
  const budgetIncome = () => n(loadData().budget.income);
  const firstOf = (bucket, pred) => (loadData()[bucket] || []).find(pred || (() => true));

  /* ---------- per type: editable fields, targets, insights ---------- */
  function fieldInput(it, key, label, value, opts){
    opts = opts || {};
    const v = value == null || value === '' ? '' : value;
    return `<div><label for="${it.id}_${key}">${esc(label)}</label><input id="${it.id}_${key}" data-k="${key}" type="${opts.type || 'number'}" ${opts.type ? '' : 'inputmode="decimal" step="any"'} value="${esc(v)}" class="${value != null && value !== '' && opts.found !== false ? 'found' : ''}" placeholder="${opts.ph || ''}"></div>`;
  }

  const SPEC = {
    payslip: {
      title: (r) => r.month ? `Salary Slip · ${monthName(r.month)}` : 'Salary Slip',
      sub: (r) => r.employer,
      body(it){
        const r = it.result, v = r.values;
        const keys = ['basic','da','hra','special','conveyance','lta','medical','bonus','otherEarn','gross','pf','vpf','employerPf','nps','employerNps','pt','tds','esi','loan','totalDed','net','ctc'];
        const always = ['basic','hra','gross','pf','employerPf','tds','net'];
        const labels = { ...X.PAY_LABELS, otherEarn: 'Other earnings' };
        return `<div class="imp-sec"><h4>Check the numbers</h4><div class="imp-fields">
          ${fieldInput(it, 'month', 'Month', r.month || '', { type: 'month' })}
          ${keys.filter(k => v[k] != null || always.includes(k)).map(k => fieldInput(it, k, labels[k] + (k === 'ctc' ? '' : ' (month)'), v[k])).join('')}
          ${fieldInput(it, 'epfBalance', 'EPF balance today, if you know it', v.epfBalance, { found: false, ph: 'optional' })}
        </div></div>`;
      },
      read(it, key, val){ if(key === 'month') it.result.month = val; else it.result.values[key] = val === '' ? null : Number(val); },
      targets(it){
        const r = it.result, v = r.values, d = loadData();
        const t = [];
        t.push({ id: 'profile', label: 'Save as your salary profile', desc: 'Prefills the income tax, HRA, gratuity and insurance calculators', on: true,
          run: (data) => { data.income.salary = { month: r.month, employer: r.employer, ...cleanVals(v), importedAt: localISO() }; } });
        if(n(v.net)) t.push({ id: 'budget', label: 'Budget take-home pay', chg: [budgetIncome(), v.net], on: true,
          run: (data) => { data.budget.income = String(Math.round(n(v.net))); } });
        if(n(v.gross) && INDIA) t.push({ id: 'ins', label: 'Yearly income for the insurance calculator', chg: [n((d.settings.insuranceProfile || {}).income), annualGross(v)], on: true,
          run: (data) => { data.settings.insuranceProfile = { ...(data.settings.insuranceProfile || {}), income: String(Math.round(annualGross(v))) }; } });
        // of the employer's 12%, 8.33% goes to the EPS pension and only 3.67% reaches the EPF balance
        const pfMonthly = Math.round(n(v.pf) + n(v.vpf) + n(v.employerPf || v.pf) * 3.67 / 12);
        if(n(v.pf) && !INDIA){
          const R = P.retire || { label: 'Retirement', types: ['Retirement account'] };
          const monthly = Math.round(n(v.pf) + n(v.vpf) + n(v.employerPf));
          const ex = firstOf('retire');
          t.push({ id: 'retire', label: ex ? `Monthly contribution on “${ex.name}”` : `Start tracking ${R.types[0]} in Assets`, chg: [ex ? n(ex.monthlyContribution) : 0, monthly],
            desc: v.employerPf ? 'Your contribution plus your employer’s' : 'Your own contribution. Add your employer’s match on the Assets page if it is not on the payslip.', on: true,
            run: (data) => { data.retire = data.retire || []; const e = data.retire[0]; if(e) e.monthlyContribution = String(monthly); else data.retire.push({ id: uid(), name: R.types[0] + (r.employer ? ' via ' + r.employer.split(/\s+/).slice(0, 2).join(' ') : ''), accountType: R.types[0], openingBalance: '0', monthlyContribution: String(monthly), expectedReturn: '6', startDate: localISO() }); } });
        }
        if(n(v.pf) && INDIA){
          const ex = firstOf('epf');
          t.push({ id: 'epf', label: ex ? `EPF monthly contribution on “${ex.name}”` : 'Start tracking EPF in Assets', chg: [ex ? n(ex.monthlyContribution) : 0, pfMonthly],
            desc: 'Your PF plus the 3.67% of your employer’s share that reaches EPF. The rest goes to the EPS pension. Your passbook shows the exact split.', on: true,
            run: (data) => {
              const e = data.epf[0];
              if(e){ e.monthlyContribution = String(Math.round(pfMonthly)); if(n(v.epfBalance)){ e.openingBalance = String(Math.round(n(v.epfBalance))); e.startDate = localISO(); } }
              else data.epf.push({ id: uid(), name: 'EPF' + (r.employer ? ' via ' + r.employer.split(/\s+/).slice(0, 2).join(' ') : ''), openingBalance: String(Math.round(n(v.epfBalance))), monthlyContribution: String(Math.round(pfMonthly)), rate: '8.25', startDate: localISO() });
            } });
        }
        const npsMonthly = n(v.nps) + n(v.employerNps);
        if(npsMonthly && INDIA){
          const ex = firstOf('nps');
          t.push({ id: 'nps', label: ex ? `NPS monthly contribution on “${ex.name}”` : 'Start tracking NPS in Assets', chg: [ex ? n(ex.monthlyContribution) : 0, npsMonthly], on: true,
            run: (data) => { const e = data.nps[0]; if(e) e.monthlyContribution = String(Math.round(npsMonthly)); else data.nps.push({ id: uid(), name: 'NPS via employer', tier: 'I', openingBalance: '0', monthlyContribution: String(Math.round(npsMonthly)), expectedReturn: '10', startDate: localISO() }); } });
        }
        if(!d.settings.workType) t.push({ id: 'work', label: 'Set how you earn to Salaried', on: true, run: (data) => { data.settings.workType = 'salaried'; } });
        return t;
      },
      insights(it){
        const v = it.result.values, out = [];
        if(!n(v.gross)) return out;
        if(!INDIA){
          const yearly = annualGross(v);
          const r = CorpusCountry.computeTax(P.code, yearly, { kind: 'salary' });
          const withheld = (n(v.tds) + n(v.stateTax)) * 12;
          out.push({ level: 'info', title: `About ${M(r.incomeTax)} a year in ${P.tax.incomeTaxLabel ? P.tax.incomeTaxLabel.toLowerCase() : 'income tax'}`, text: `On ${M(yearly)} a year with ${P.name}'s ${P.taxYear} rules, plus ${M(r.levies)} in payroll contributions. ${P.tax.notes[0]}` });
          if(n(v.tds) && r.incomeTax && Math.abs(n(v.tds) * 12 - r.incomeTax) > Math.max(500, r.incomeTax * 0.15)) out.push({ level: n(v.tds) * 12 > r.incomeTax ? 'good' : 'warn', title: n(v.tds) * 12 > r.incomeTax ? 'Withholding looks higher than your likely tax' : 'Withholding looks lower than your likely tax', text: `${M(n(v.tds) * 12)} a year is withheld against an estimate of ${M(r.incomeTax)}. Bonuses, other income, credits or state tax can explain a gap; check before the year ends.` });
          if(n(v.net)) out.push({ level: 'good', title: `You take home ${Math.round(n(v.net) / n(v.gross) * 100)}% of your gross pay`, text: `${M(n(v.gross) - n(v.net))} a month goes to tax, contributions and other deductions${n(v.pf) ? ', and the retirement part of that is still your money' : ''}.` });
          return out;
        }
        const yearly = annualGross(v);
        const newTax = incomeTaxNew(yearly, { employerNps: n(v.employerNps) * 12 }).total;
        const ded80c = Math.min(150000, (n(v.pf) + n(v.vpf)) * 12);
        const oldTax = incomeTaxOld(yearly, ded80c + n(v.pt) * 12, Number(loadData().settings.age) || 30).total;
        const tdsYear = n(v.tds) * 12;
        out.push({ level: 'info', title: `About ${M(newTax)} a year in tax under the new regime`, text: `On ${M(yearly)} a year. The old regime comes to about ${M(oldTax)} with only your PF counted under 80C${n(v.hra) ? '; rent, 80D and home loan interest could lower it further, so try the HRA and tax calculators, they are now filled in' : ''}.` });
        if(tdsYear && Math.abs(tdsYear - newTax) > Math.max(5000, newTax * 0.15)){
          out.push({ level: tdsYear > newTax ? 'good' : 'warn', title: tdsYear > newTax ? 'Your employer may be deducting more tax than needed' : 'Tax deducted looks lower than your likely tax',
            text: `${M(n(v.tds))} a month is ${M(tdsYear)} a year, against an estimate of ${M(newTax)}. ${tdsYear > newTax ? 'Declaring your investments and rent to payroll, or picking the right regime, can raise your take-home now instead of waiting for a refund.' : 'If bonuses or arrears come later, the gap may be deducted then. Otherwise you may owe tax at filing, plus interest.'}` });
        }
        if(n(v.pf) && n(v.basic) && n(v.pf) < n(v.basic) * 0.115){
          out.push({ level: 'info', title: 'Your PF is worked out on a capped wage', text: `12% of your basic would be ${M(n(v.basic) * 0.12)}, but ${M(v.pf)} is deducted. That is normal: many employers use the PF wage ceiling, which went up from ₹15,000 to ₹25,000 a month from 17 September 2026. Voluntary PF lets you save more at the EPF rate if you want to.` });
        }
        if(n(v.net) && n(v.gross)) out.push({ level: 'good', title: `You take home ${Math.round(n(v.net) / n(v.gross) * 100)}% of your gross pay`, text: `${M(n(v.gross) - n(v.net))} a month goes to tax, PF and other deductions, and PF part of that is still your savings.` });
        return out;
      }
    },

    form16: {
      title: (r) => `Form 16${r.fy ? ' · FY ' + r.fy : ''}`,
      sub: (r) => [r.employer, r.regime ? (r.regime === 'new' ? 'new regime' : 'old regime') : ''].filter(Boolean).join(' · '),
      body(it){
        const v = it.result.values;
        const keys = Object.keys(X.F16_LABELS);
        const always = ['grossSalary', 'stdDeduction', 'd80c', 'taxableIncome', 'taxPayable', 'tdsTotal'];
        return `<div class="imp-sec"><h4>Check the numbers (yearly)</h4><div class="imp-fields">${keys.filter(k => v[k] != null || always.includes(k)).map(k => fieldInput(it, k, X.F16_LABELS[k], v[k])).join('')}</div></div>`;
      },
      read(it, key, val){ it.result.values[key] = val === '' ? null : Number(val); },
      targets(it){
        const r = it.result, v = r.values, d = loadData();
        const t = [{ id: 'profile', label: 'Save last year’s tax details', desc: 'Prefills the tax calculator and the pre-filing audit', on: true, run: (data) => { data.income.form16 = { fy: r.fy, regime: r.regime, employer: r.employer, ...cleanVals(v), importedAt: localISO() }; } }];
        if(n(v.grossTotal || v.grossSalary)) t.push({ id: 'audit', label: 'Taxable income on the pre-filing audit', chg: [n(d.auditInputs.otherTaxableIncome), n(v.grossTotal || v.grossSalary)], on: true, run: (data) => { data.auditInputs.otherTaxableIncome = String(Math.round(n(v.grossTotal || v.grossSalary))); if(n(v.d80c)) data.auditInputs.eightyCInvestment = String(Math.round(n(v.d80c))); } });
        if(n(v.grossSalary) && INDIA) t.push({ id: 'ins', label: 'Yearly income for the insurance calculator', chg: [n((d.settings.insuranceProfile || {}).income), n(v.grossSalary)], on: !n((d.settings.insuranceProfile || {}).income), run: (data) => { data.settings.insuranceProfile = { ...(data.settings.insuranceProfile || {}), income: String(Math.round(n(v.grossSalary))) }; } });
        if(!d.settings.workType) t.push({ id: 'work', label: 'Set how you earn to Salaried', on: true, run: (data) => { data.settings.workType = 'salaried'; } });
        return t;
      },
      insights(it){
        const v = it.result.values, r = it.result, out = [];
        const gross = n(v.grossSalary); if(!gross) return out;
        const newT = incomeTaxNew(gross + n(v.otherSources) + n(v.houseProperty), { employerNps: n(v.d80ccd2) }).total;
        const oldDed = n(v.totalExempt || v.hraExempt) + n(v.ptax) + (n(v.totalDeductions) || (Math.min(150000, n(v.d80c)) + n(v.d80d) + Math.min(50000, n(v.d80ccd1b)) + n(v.d80ccd2) + n(v.d80tta)));
        const oldT = incomeTaxOld(gross + n(v.otherSources) + n(v.houseProperty), oldDed, Number(loadData().settings.age) || 30).total;
        const better = newT <= oldT ? 'new' : 'old';
        out.push({ level: r.regime && r.regime !== better && Math.abs(newT - oldT) > 2000 ? 'warn' : 'good', title: `The ${better} regime looks cheaper by ${M(Math.abs(newT - oldT))}`,
          text: `With these numbers: new regime about ${M(newT)}, old regime about ${M(oldT)}.${r.regime ? ` This Form 16 was worked out under the ${r.regime} regime.` : ''} Salaried people can choose again every year when filing, so use this for the year ahead.` });
        if(n(v.tdsTotal) && n(v.taxPayable) && Math.abs(n(v.tdsTotal) - n(v.taxPayable)) > 500){
          const refund = n(v.tdsTotal) > n(v.taxPayable);
          out.push({ level: refund ? 'good' : 'warn', title: refund ? `Possible refund of ${M(n(v.tdsTotal) - n(v.taxPayable))}` : `About ${M(n(v.taxPayable) - n(v.tdsTotal))} may still be due`, text: refund ? 'Claim it by filing your return on time.' : 'Pay it as self-assessment tax before filing to avoid interest.' });
        }
        if(n(v.d80c) < 150000 && (r.regime === 'old' || better === 'old')) out.push({ level: 'info', title: `${M(150000 - n(v.d80c))} of 80C room unused`, text: 'Only matters under the old regime. PPF, ELSS, EPF, life cover premiums and children’s tuition fees all count.' });
        return out;
      }
    },

    bank: {
      title: (r) => `Bank Statement${r.from ? ` · ${shortDate(r.from)} to ${shortDate(r.to)}` : ''}`,
      sub: (r) => r.tx && r.tx.length ? `${r.tx.length} transactions over about ${r.months} month${r.months === 1 ? '' : 's'}` : '',
      body(it){
        const r = it.result;
        if(!r.tx || !r.tx.length) return mapperHtml(it);
        if(!r.edit){
          r.edit = { cats: {}, payers: {}, income: 0, spend: Math.round(r.monthlySpend), balance: r.closingBalance != null ? Math.round(r.closingBalance) : '', account: guessBank(it) };
          Object.entries(r.outByCat).forEach(([k, c]) => r.edit.cats[k] = Math.round(c.monthly));
          r.payers.forEach((p, i) => r.edit.payers[i] = earnsFreelance());
          r.edit.income = Math.round(bankIncome(r));
        }
        const e = r.edit;
        const rows = Object.entries(r.outByCat).sort((a, b) => b[1].monthly - a[1].monthly).map(([k, c]) => `<tr><td>${esc(c.label)}<div class="hint" style="margin:0">${c.count} payment${c.count > 1 ? 's' : ''} · ${c.btype === 'need' ? 'need' : c.btype === 'want' ? 'want' : 'saving'}</div></td><td class="num"><input type="number" data-cat="${k}" value="${e.cats[k]}" aria-label="${esc(c.label)} per month"></td></tr>`).join('');
        const ins = Object.values(r.inByCat).sort((a, b) => b.monthly - a.monthly).map(c => `<div class="kv"><span>${esc(c.label)}</span><span>${M(c.monthly)} / month</span></div>`).join('');
        const payers = r.payers.length ? `<div class="imp-sec"><h4>Who paid you (besides salary)</h4><p class="hint" style="margin-top:-4px">Tick the ones that are client or business income. Untick refunds from friends, family transfers and the like.</p>
          <div class="imp-scroll"><table class="imp-table"><tbody>${r.payers.map((p, i) => `<tr><td style="width:36px"><input type="checkbox" data-payer="${i}" ${e.payers[i] ? 'checked' : ''} aria-label="${esc(p.name)} is client income"></td><td>${esc(p.name)}</td><td class="num">${M(p.total)}</td><td class="num muted">${p.count}×</td></tr>`).join('')}</tbody></table></div></div>` : '';
        const rec = r.recurring.length ? `<div class="imp-sec"><h4>Regular payments we spotted</h4><div class="imp-scroll"><table class="imp-table"><tbody>${r.recurring.map(x => `<tr><td>${esc(x.desc)}</td><td class="muted">${esc(x.cat.label)}</td><td class="num">${M(x.amount)}</td><td class="num muted">${x.times}×</td></tr>`).join('')}</tbody></table></div>
          <p class="hint">EMIs here are not added as loans automatically, since a statement does not show what is left to repay. Add them on <a href="liabilities.html">Liabilities</a>.</p></div>` : '';
        return `<div class="imp-sec"><h4>Money in, per month</h4>${ins}</div>
          <div class="imp-sec"><h4>Spending by category, per month</h4><div class="imp-scroll"><table class="imp-table"><tbody>${rows}</tbody></table></div></div>
          ${payers}${rec}
          <div class="imp-sec"><h4>Totals to use</h4><div class="imp-fields">
            ${fieldInput(it, 'income', 'Monthly income', e.income)}
            ${fieldInput(it, 'spend', 'Monthly spending (needs and wants)', e.spend)}
            ${fieldInput(it, 'balance', 'Closing balance', e.balance)}
            ${fieldInput(it, 'account', 'Account name', e.account, { type: 'text' })}
          </div></div>`;
      },
      read(it, key, val, el){
        const e = it.result.edit;
        if(el && el.dataset.cat){ e.cats[el.dataset.cat] = Number(val) || 0; return; }
        if(el && el.dataset.payer != null){ e.payers[el.dataset.payer] = el.checked; e.income = Math.round(bankIncome(it.result)); const f = it.el.querySelector('[data-k="income"]'); if(f) f.value = e.income; return; }
        e[key] = key === 'account' ? val : (val === '' ? '' : Number(val));
      },
      targets(it){
        const r = it.result; if(!r.tx || !r.tx.length) return [];
        const e = r.edit, d = loadData(), t = [];
        const lines = Object.entries(r.outByCat).filter(([k]) => e.cats[k] > 0);
        t.push({ id: 'budget', label: `Fill your Budget with ${lines.length} monthly averages`, desc: 'Lines with the same name are updated, new ones are added. Nothing else in your budget changes.', on: true,
          run: (data) => {
            const b = data.budget.items && data.budget.items.length ? data.budget : { income: data.budget.income || '', items: [] };
            lines.forEach(([k, c]) => {
              const ex = b.items.find(i => norm(i.name) === norm(c.line));
              if(ex) ex.amount = String(e.cats[k]); else b.items.push({ id: uid(), name: c.line, type: c.btype, amount: String(e.cats[k]) });
            });
            data.budget = b;
          } });
        if(e.income) t.push({ id: 'income', label: 'Budget take-home income', chg: [budgetIncome(), e.income], on: true, run: (data) => { data.budget.income = String(Math.round(e.income)); } });
        if(e.spend) t.push({ id: 'exp', label: 'Monthly expense in Settings', desc: 'Used by the emergency fund check, insurance calculator and health score', chg: [n(d.settings.monthlyExpense), e.spend], on: true, run: (data) => { data.settings.monthlyExpense = String(Math.round(e.spend)); } });
        if(e.balance !== '' && e.balance != null){
          const ex = (d.cash || []).find(c => norm(c.name) === norm(e.account));
          t.push({ id: 'cash', label: ex ? `Update “${e.account}” in Bank & Cash` : `Add “${e.account}” to Bank & Cash`, chg: [ex ? n(ex.balance) : 0, e.balance], on: true,
            run: (data) => { data.cash = data.cash || []; const x = data.cash.find(c => norm(c.name) === norm(e.account)); if(x){ x.balance = String(e.balance); x.asOf = r.to; } else data.cash.push({ id: uid(), name: e.account, balance: String(e.balance), asOf: r.to }); } });
        }
        const sel = r.payers.filter((p, i) => e.payers[i]);
        if(sel.length){
          const total = sel.reduce((a, p) => a + p.total, 0);
          t.push({ id: 'free', label: `Record ${M(total)} of client income`, desc: `From ${sel.length} payer${sel.length > 1 ? 's' : ''} over ${r.months} months, for the freelancer tax calculator`, on: true,
            run: (data) => { data.income.freelance = { ...(data.income.freelance || {}), bank: { from: r.from, to: r.to, months: r.months, receipts: total, avgMonthly: total / r.months, clients: sel.map(p => ({ name: p.name, total: p.total, count: p.count })) }, importedAt: localISO() }; } });
        }
        return t;
      },
      insights(it){
        const r = it.result, e = r.edit, out = [];
        if(!r.tx || !r.tx.length || !e) return out;
        const spend = n(e.spend), inc = n(e.income);
        const saved = (r.outByCat.invest ? r.outByCat.invest.monthly : 0) + (r.outByCat.self ? r.outByCat.self.monthly : 0);
        if(inc > 0){
          const rate = (inc - spend) / inc;
          out.push({ level: rate >= 0.2 ? 'good' : rate >= 0.1 ? 'info' : 'warn', title: `You keep about ${Math.round(rate * 100)}% of what comes in`, text: `${M(inc)} in, ${M(spend)} spent on needs and wants each month${saved ? `, and ${M(saved)} a month already goes to SIPs, FDs or your own accounts` : ''}. Twenty percent or more is a healthy target.` });
        }
        const fixed = ['emi', 'rent', 'insurance'].reduce((a, k) => a + (r.outByCat[k] ? r.outByCat[k].monthly : 0), 0);
        if(inc > 0 && fixed / inc > 0.4) out.push({ level: 'warn', title: `Rent, EMIs and premiums take ${Math.round(fixed / inc * 100)}% of income`, text: 'Above 40% leaves little room if income dips. Avoid new loans until this comes down.' });
        if(r.outByCat.subs) out.push({ level: 'info', title: `Subscriptions cost ${M(r.outByCat.subs.monthly * 12)} a year`, text: 'Worth a look once a year, small ones add up.' });
        if(r.outByCat.cash && spend && r.outByCat.cash.monthly / spend > 0.12) out.push({ level: 'info', title: `${M(r.outByCat.cash.monthly)} a month goes out as cash`, text: 'Cash is hard to track. Paying by UPI or card makes your next import far more useful.' });
        if(r.closingBalance && spend && r.closingBalance > spend * 6) out.push({ level: 'info', title: `${M(r.closingBalance - spend * 6)} more than 6 months of spending sits in this account`, text: 'Savings accounts usually pay around 2.5 to 3.5%. Money beyond your emergency fund could sit in an FD, a sweep deposit or a liquid fund, and anything for 5+ years in diversified investments.' });
        const top = Object.values(r.outByCat).filter(c => !['self', 'invest'].includes(c.key)).sort((a, b) => b.monthly - a.monthly).slice(0, 3);
        if(top.length) out.push({ level: 'info', title: 'Where most of the money goes', text: top.map(c => `${c.label} ${M(c.monthly)}`).join(', ') + ' a month.' });
        return out;
      }
    },

    invoices: {
      title: (r) => `Income List${r.fy ? ' · FY ' + r.fy : ''}`,
      sub: (r) => r.items ? `${r.items.length} entries, ${r.clients.length} client${r.clients.length === 1 ? '' : 's'}` : '',
      body(it){
        const r = it.result;
        if(!r.items || !r.items.length) return mapperHtml(it);
        return `<div class="imp-sec"><h4>This financial year</h4><div class="imp-fields">
            ${fieldInput(it, 'receipts', 'Received so far', Math.round(r.receipts))}
            ${fieldInput(it, 'tds', 'TDS deducted by clients', Math.round(r.tds))}
            ${fieldInput(it, 'gst', 'GST collected', Math.round(r.gst))}
            ${fieldInput(it, 'monthsSeen', 'Months covered', r.monthsSeen)}
          </div></div>
          <div class="imp-sec"><h4>By client</h4><div class="imp-scroll"><table class="imp-table"><thead><tr><th>Client</th><th class="num">Received</th><th class="num">TDS</th><th class="num">Invoices</th></tr></thead><tbody>${r.clients.map(c => `<tr><td>${esc(c.name)}</td><td class="num">${M(c.total)}</td><td class="num">${M(c.tds)}</td><td class="num">${c.count}</td></tr>`).join('')}</tbody></table></div>
          ${r.unpaid ? `<p class="hint">${M(r.unpaid)} is still unpaid and not counted.</p>` : ''}</div>`;
      },
      read(it, key, val){ it.result[key] = Number(val) || 0; it.result.avgMonthly = it.result.receipts / Math.max(1, it.result.monthsSeen); },
      targets(it){
        const r = it.result; if(!r.items || !r.items.length) return [];
        const d = loadData(), t = [];
        const yearly = projectYear(r.receipts, r.monthsSeen, r.fy);
        t.push({ id: 'free', label: 'Save as your freelance income', desc: 'Prefills the freelancer tax calculator', on: true,
          run: (data) => { data.income.freelance = { ...(data.income.freelance || {}), invoices: { fy: r.fy, receipts: r.receipts, tds: r.tds, gst: r.gst, monthsSeen: r.monthsSeen, avgMonthly: r.avgMonthly, projected: yearly, clients: r.clients.slice(0, 8) }, importedAt: localISO() }; } });
        t.push({ id: 'income', label: 'Budget take-home income', desc: 'Average monthly receipts', chg: [budgetIncome(), r.avgMonthly], on: !budgetIncome(), run: (data) => { data.budget.income = String(Math.round(r.avgMonthly)); } });
        if(INDIA) t.push({ id: 'ins', label: 'Yearly income for the insurance calculator', chg: [n((d.settings.insuranceProfile || {}).income), yearly], on: !n((d.settings.insuranceProfile || {}).income), run: (data) => { data.settings.insuranceProfile = { ...(data.settings.insuranceProfile || {}), income: String(Math.round(yearly)) }; } });
        if(!d.settings.workType) t.push({ id: 'work', label: 'Set how you earn to Freelancer', on: true, run: (data) => { data.settings.workType = 'freelancer'; } });
        return t;
      },
      insights(it){ const r = it.result; return r.items && r.items.length ? freelanceInsights(projectYear(r.receipts, r.monthsSeen, r.fy), r.tds * (projectYear(r.receipts, r.monthsSeen, r.fy) / Math.max(1, r.receipts)), r.fy) : []; }
    },

    tds26as: {
      title: (r) => `Form 26AS or AIS${r.fy ? ' · FY ' + r.fy : ''}`,
      sub: (r) => r.rows ? `${r.rows.length} deductor${r.rows.length === 1 ? '' : 's'} found` : '',
      body(it){
        const r = it.result;
        return `<div class="imp-sec"><h4>Totals</h4><div class="imp-fields">
            ${fieldInput(it, 'profPaid', 'Paid to you for work (194J / 393 and similar)', Math.round(r.profPaid))}
            ${fieldInput(it, 'profTds', 'TDS on that', Math.round(r.profTds))}
            ${fieldInput(it, 'salaryPaid', 'Salary (192)', Math.round(r.salaryPaid))}
            ${fieldInput(it, 'salaryTds', 'TDS on salary', Math.round(r.salaryTds))}
            ${fieldInput(it, 'otherPaid', 'Interest and other', Math.round(r.otherPaid))}
            ${fieldInput(it, 'otherTds', 'TDS on that', Math.round(r.otherTds))}
          </div></div>
          <div class="imp-sec"><h4>By deductor</h4><div class="imp-scroll"><table class="imp-table"><thead><tr><th>Deductor</th><th>Section</th><th class="num">Paid</th><th class="num">TDS</th></tr></thead><tbody>${r.rows.map(x => `<tr><td>${esc(x.name)}</td><td>${esc(x.section || '—')}</td><td class="num">${M(x.paid)}</td><td class="num">${M(x.deducted)}</td></tr>`).join('')}</tbody></table></div></div>`;
      },
      read(it, key, val){ it.result[key] = Number(val) || 0; },
      targets(it){
        const r = it.result; const t = [];
        if(r.profPaid || r.profTds) t.push({ id: 'free', label: 'Save TDS credit from clients', desc: 'Used by the freelancer tax calculator to work out what is left to pay', on: true,
          run: (data) => { data.income.freelance = { ...(data.income.freelance || {}), tds26as: { fy: r.fy, paid: r.profPaid, tds: r.profTds, other: r.otherPaid, otherTds: r.otherTds }, importedAt: localISO() }; } });
        if(r.salaryTds) t.push({ id: 'sal', label: 'Save salary TDS', on: true, run: (data) => { data.income.salaryTds26as = { fy: r.fy, paid: r.salaryPaid, tds: r.salaryTds }; } });
        return t;
      },
      insights(it){
        const r = it.result, out = [];
        const fl = (loadData().income || {}).freelance || {};
        const own = fl.invoices && fl.invoices.fy === r.fy ? fl.invoices.receipts : null;
        if(own && r.profPaid && Math.abs(own - r.profPaid) > 1000) out.push({ level: 'info', title: `Your records show ${M(own)}, 26AS shows ${M(r.profPaid)}`, text: own > r.profPaid ? 'Normal if some clients (foreign clients, individuals) do not deduct TDS. Declare all of it, not just what appears in 26AS.' : 'A client may have reported more than you received, or an invoice is missing from your list. Check before filing, since the tax department matches these.' });
        if(r.profTds) out.push({ level: 'good', title: `${M(r.profTds)} of TDS counts towards your tax`, text: 'It is subtracted from what you owe. If it is more than your tax, filing your return gets the extra back as a refund.' });
        if(r.otherTds) out.push({ level: 'info', title: `Interest and other income: ${M(r.otherPaid)}`, text: 'Interest from FDs and savings is taxed at your slab rate. Make sure it is declared, the TDS on it is only a part payment.' });
        return out;
      }
    },

    holdings: holdingsSpec('holdings'),
    cas: holdingsSpec('cas'),

    epf: {
      title: (r) => `EPF Passbook${r.asOf ? ' · ' + shortDate(r.asOf) : ''}`,
      sub: (r) => r.monthly && r.monthly.length ? `${r.monthly.length} monthly contributions found` : '',
      body(it){
        const r = it.result;
        return `<div class="imp-sec"><h4>Check the numbers</h4><div class="imp-fields">
          ${fieldInput(it, 'balance', 'EPF balance (your share + employer)', r.balance != null ? Math.round(r.balance) : '')}
          ${fieldInput(it, 'asOf', 'As on', r.asOf || localISO(), { type: 'date' })}
          ${fieldInput(it, 'monthlyContribution', 'Monthly contribution (both shares)', r.monthlyContribution)}
        </div></div>`;
      },
      read(it, key, val){ it.result[key] = key === 'asOf' ? val : (val === '' ? null : Number(val)); },
      targets(it){
        const r = it.result; if(r.balance == null) return [];
        const ex = firstOf('epf');
        return [{ id: 'epf', label: ex ? `Update “${ex.name}” in Assets` : 'Add EPF to Assets', chg: [ex ? computeEpf(ex).currentValue : 0, r.balance], on: true,
          run: (data) => { const e = data.epf[0]; const v = { openingBalance: String(Math.round(r.balance)), startDate: r.asOf || localISO() }; if(r.monthlyContribution) v.monthlyContribution = String(Math.round(r.monthlyContribution)); if(e) Object.assign(e, v); else data.epf.push({ id: uid(), name: 'EPF', rate: '8.25', monthlyContribution: '0', ...v }); } }];
      },
      insights(it){
        const r = it.result; if(!r.balance) return [];
        return [{ level: 'info', title: 'EPF is one of your safest compounding assets', text: `At the declared rate of about 8.25% a year, ${M(r.balance)} roughly doubles in 9 years even without new contributions. Avoid withdrawing it when changing jobs, transfer it instead.` }];
      }
    },

    backup: {
      title: () => 'CO₹PU$ Backup File',
      sub: () => 'Restores everything from a backup you downloaded earlier',
      body(){ return '<p class="muted">This replaces everything currently stored in this browser with the contents of the backup. Download a fresh backup first from Settings if you might want today’s data back.</p>'; },
      read(){},
      targets(it){ return [{ id: 'restore', label: 'Replace all data with this backup', on: false, run: null, restore: true }]; },
      insights(){ return []; }
    },

    unknown: {
      title: () => 'We Could Not Tell What This File Is',
      sub: () => '',
      body(it){ return mapperHtml(it) || '<p class="muted">Pick what it is from the list above, or enter the numbers by hand on the right page.</p>'; },
      read(){}, targets(){ return []; }, insights(){ return []; }
    },
  };

  function holdingsSpec(kind){
    return {
      title: (r) => kind === 'cas' ? 'Mutual Fund Statement (CAS)' : (r.items && r.items.every(x => x.kind === 'mf') ? 'Fund Holdings' : 'Stock Holdings'),
      sub: (r) => r.items && r.items.length ? `${r.items.length} holdings, worth ${M(r.value)}` : '',
      body(it){
        const r = it.result;
        if(!r.items || !r.items.length) return mapperHtml(it);
        if(!r.pick) r.pick = r.items.map(() => true);
        return `<div class="imp-sec"><h4>Holdings</h4><div class="imp-scroll"><table class="imp-table"><thead><tr><th></th><th>Name</th><th class="num">${kind === 'cas' ? 'Units' : 'Qty'}</th><th class="num">Avg cost</th><th class="num">Price</th><th class="num">Value</th></tr></thead><tbody>
          ${r.items.map((x, i) => `<tr><td style="width:34px"><input type="checkbox" data-pick="${i}" ${r.pick[i] ? 'checked' : ''} aria-label="Include ${esc(x.name)}"></td><td>${esc(x.name)}${x.kind === 'mf' && kind !== 'cas' ? ' <span class="pill plain">fund</span>' : ''}</td><td class="num">${(+x.qty).toLocaleString('en-IN', { maximumFractionDigits: 3 })}</td><td class="num">${x.avg ? (+x.avg).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '—'}</td><td class="num">${x.ltp ? (+x.ltp).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '—'}</td><td class="num">${M(x.value || x.qty * (x.ltp || x.avg))}</td></tr>`).join('')}
        </tbody></table></div><p class="hint">Holdings already in your Assets with the same name are updated, not duplicated.${kind === 'cas' ? ' Fund NAVs refresh from mfapi.in once you link a scheme code on the Assets page.' : ''}</p></div>`;
      },
      read(it, key, val, el){ if(el && el.dataset.pick != null) it.result.pick[el.dataset.pick] = el.checked; },
      targets(it){
        const r = it.result; if(!r.items || !r.items.length) return [];
        const picked = r.items.filter((x, i) => r.pick[i]);
        const stocks = picked.filter(x => x.kind === 'stock'), funds = picked.filter(x => x.kind === 'mf');
        const d = loadData(), t = [];
        const match = (list, x) => list.find(e => (x.isin && e.isin === x.isin) || norm(e.symbol || e.name) === norm(x.name) || norm(e.name) === norm(x.name));
        if(stocks.length){
          const upd = stocks.filter(x => match(d.stocks, x)).length;
          t.push({ id: 'stocks', label: `Stocks: add ${stocks.length - upd}, update ${upd}`, on: true, run: (data) => stocks.forEach(x => {
            const e = match(data.stocks, x);
            const v = { quantity: String(x.qty), buyPrice: String(round2(x.avg)), currentPrice: x.ltp ? String(round2(x.ltp)) : '' , isin: x.isin || '' };
            if(e) Object.assign(e, v); else data.stocks.push({ id: uid(), name: x.name, symbol: /^[A-Z0-9&\-]{2,20}$/.test(x.name) ? x.name : '', exchange: x.isin && /^IN/.test(x.isin) ? 'BSE' : (/^[A-Z&\-]+$/.test(x.name) ? 'BSE' : ''), buyDate: '', ...v });
          }) });
        }
        if(funds.length){
          const upd = funds.filter(x => match(d.mf, x)).length;
          t.push({ id: 'mf', label: `Mutual funds: add ${funds.length - upd}, update ${upd}`, on: true, run: (data) => funds.forEach(x => {
            const e = match(data.mf, x);
            const v = { units: String(x.qty), buyPrice: x.avg ? String(round4(x.avg)) : (e ? e.buyPrice : ''), currentNav: x.ltp ? String(round4(x.ltp)) : '', isin: x.isin || '' };
            if(e) Object.assign(e, v); else data.mf.push({ id: uid(), name: x.name, schemeCode: '', buyDate: '', ...v });
          }) });
        }
        return t;
      },
      insights(it){
        const r = it.result, out = []; if(!r.items || !r.items.length) return out;
        const total = r.items.reduce((a, x) => a + (x.value || x.qty * (x.ltp || x.avg)), 0);
        const big = r.items.map(x => ({ x, v: x.value || x.qty * (x.ltp || x.avg) })).sort((a, b) => b.v - a.v)[0];
        if(big && total && big.v / total > 0.3 && r.items.length > 1) out.push({ level: 'warn', title: `${big.x.name} is ${Math.round(big.v / total * 100)}% of these holdings`, text: 'A single holding above 25 to 30% means one bad year for it hits your whole portfolio.' });
        const regular = r.items.filter(x => /regular/i.test(x.name));
        if(regular.length) out.push({ level: 'info', title: `${regular.length} fund${regular.length > 1 ? 's are' : ' is'} in a Regular plan`, text: 'Regular plans pay a distributor commission inside the expense ratio, often 0.5 to 1.5% a year more than the Direct plan of the same fund. Over 15 to 20 years that difference compounds into a large sum. Switching can trigger capital gains tax, so plan it.' });
        const inv = r.items.reduce((a, x) => a + x.qty * (x.avg || 0), 0);
        if(inv > 0) out.push({ level: total >= inv ? 'good' : 'warn', title: `${total >= inv ? 'Up' : 'Down'} ${Math.abs(Math.round((total / inv - 1) * 1000) / 10)}% on what you paid`, text: `${M(inv)} invested is worth ${M(total)} now. For your real yearly return including dates, use XIRR on the Calculators page.` });
        return out;
      }
    };
  }

  /* ---------- freelancer insights shared by invoices and the calculator ---------- */
  function freelanceInsights(yearly, tdsYearly, fy){
    const out = [];
    if(!yearly) return out;
    if(!INDIA){
      const r = CorpusCountry.computeTax(P.code, yearly, { kind: 'self', revenue: yearly });
      out.push({ level: 'info', title: `About ${M(yearly)} coming in this year`, text: `If all of it were profit, tax and contributions in ${P.name} would be about ${M(r.total)}; business expenses bring that down. Setting aside ${M(r.total / 12)} a month keeps you covered. The self-employed tax calculator on the Calculators page works it out with your expenses.` });
      if(P.freelance) out.push({ level: 'info', title: 'Sales tax and registration', text: P.freelance.vat });
      out.push({ level: 'info', title: 'A bigger emergency fund suits irregular income', text: 'Six to twelve months of expenses, since a quiet quarter can come without warning.' });
      return out;
    }
    const presumptive = yearly <= 7500000;
    const profit = yearly * 0.5;
    const tax = incomeTaxNew(profit, { salaried: false }).total;
    const due = Math.max(0, tax - tdsYearly);
    out.push({ level: 'info', title: `About ${M(yearly)} expected this year`, text: `If you use presumptive taxation (section 58 of the new Income-tax Act, the old 44ADA), half of it, ${M(profit)}, is treated as profit, and tax on that under the new regime is about ${M(tax)}.${presumptive ? '' : ' Your receipts are above the ₹75 lakh limit for this scheme, so normal books and a tax audit may apply.'}` });
    if(due >= 10000) out.push({ level: 'warn', title: `Advance tax of about ${M(due)} after TDS`, text: `Under presumptive taxation you can pay it in one go by 15 March. Otherwise it is 15% by 15 June, 45% by 15 September, 75% by 15 December and 100% by 15 March. Setting aside ${M(due / 12)} a month makes it painless.` });
    else out.push({ level: 'good', title: 'TDS likely covers your tax', text: 'Advance tax only applies if what you owe after TDS is ₹10,000 or more.' });
    if(yearly > 2000000) out.push({ level: 'warn', title: 'Above the GST registration limit', text: 'Service providers must register for GST once yearly turnover crosses ₹20 lakh (₹10 lakh in some special category states). Exports of services are zero-rated, but they still count.' });
    else if(yearly > 1500000) out.push({ level: 'info', title: 'Getting close to the GST limit', text: `At ${M(yearly)} a year you are within reach of the ₹20 lakh registration threshold for services.` });
    out.push({ level: 'info', title: 'A bigger emergency fund suits irregular income', text: 'Six to twelve months of expenses, since a quiet quarter can come without warning.' });
    return out;
  }
  window.CorpusFreelanceInsights = freelanceInsights;

  /* ---------- column mapper for tables we could not read on our own ---------- */
  function mapperHtml(it){
    const doc = it.doc;
    if(!doc || !doc.tables || !doc.tables.length || !doc.tables.some(t => t.rows.length > 2)) return '';
    const t = doc.tables.slice().sort((a, b) => b.rows.length - a.rows.length)[0];
    if(!it.map) it.map = { kind: it.result.type === 'invoices' ? 'invoices' : it.result.type === 'holdings' ? 'holdings' : 'bank', table: doc.tables.indexOf(t), header: guessHeaderRow(t.rows), cols: {} };
    const m = it.map, tbl = doc.tables[m.table];
    const head = tbl.rows[m.header] || [];
    const specs = { bank: [['date', 'Date'], ['desc', 'Description'], ['debit', 'Money out'], ['credit', 'Money in'], ['amount', 'Amount (if one column)'], ['type', 'Dr / Cr column'], ['balance', 'Balance']],
      invoices: [['date', 'Date'], ['client', 'Client'], ['amount', 'Amount'], ['tds', 'TDS'], ['gst', 'GST'], ['status', 'Paid / unpaid']],
      holdings: [['name', 'Name or symbol'], ['qty', 'Quantity or units'], ['avg', 'Average cost'], ['ltp', 'Current price'], ['isin', 'ISIN']] };
    const opts = (sel) => `<option value="">—</option>` + head.map((h, i) => `<option value="${i}" ${String(sel) === String(i) ? 'selected' : ''}>${esc(h || 'Column ' + (i + 1))}</option>`).join('');
    const sample = tbl.rows.slice(m.header, m.header + 4).map(r => `<tr>${r.slice(0, 8).map(c => `<td>${esc(String(c).slice(0, 26))}</td>`).join('')}</tr>`).join('');
    return `<div class="imp-sec"><h4>Match the columns yourself</h4>
      <div class="imp-map">
        <div><label>This table is</label><select data-map="kind"><option value="bank" ${m.kind === 'bank' ? 'selected' : ''}>Bank or card transactions</option><option value="invoices" ${m.kind === 'invoices' ? 'selected' : ''}>Income or invoices</option><option value="holdings" ${m.kind === 'holdings' ? 'selected' : ''}>Stock or fund holdings</option></select></div>
        ${doc.tables.length > 1 ? `<div><label>Sheet or table</label><select data-map="table">${doc.tables.map((x, i) => `<option value="${i}" ${i === m.table ? 'selected' : ''}>${esc(x.name)} (${x.rows.length} rows)</option>`).join('')}</select></div>` : ''}
        <div><label>Header row</label><input type="number" min="1" data-map="header" value="${m.header + 1}"></div>
        ${specs[m.kind].map(([k, l]) => `<div><label>${l}</label><select data-mapcol="${k}">${opts(m.cols[k])}</select></div>`).join('')}
      </div>
      <div class="imp-scroll" style="margin-top:12px"><table class="imp-table"><tbody>${sample}</tbody></table></div>
      <div class="imp-actions"><button type="button" class="secondary" data-act="map">Read with these columns</button></div></div>`;
  }
  function guessHeaderRow(rows){
    let best = 0, score = -1;
    rows.slice(0, 40).forEach((r, i) => { const s = r.filter(c => c && /[a-z]/i.test(c) && !/\d{3,}/.test(c)).length; const next = rows[i + 1] || []; const bonus = next.filter(c => /\d/.test(c)).length; if(s + bonus > score && s >= 2){ score = s + bonus; best = i; } });
    return best;
  }
  function runMapper(it){
    const m = it.map, tbl = it.doc.tables[m.table];
    const cols = {}; Object.entries(m.cols).forEach(([k, v]) => { if(v !== '' && v != null) cols[k] = Number(v); });
    const mapping = { rows: tbl.rows, header: { index: m.header, cols } };
    if(m.kind === 'bank'){ if(cols.date == null || cols.desc == null || !((cols.debit != null && cols.credit != null) || cols.amount != null)){ showToast('Pick at least a date, a description and the amount columns.'); return; } it.result = X.extractBank(it.doc, mapping); }
    else if(m.kind === 'invoices'){ if(cols.date == null || cols.amount == null){ showToast('Pick at least a date and an amount column.'); return; } it.result = X.extractInvoices(it.doc, mapping); }
    else { if(cols.name == null || cols.qty == null){ showToast('Pick at least a name and a quantity column.'); return; } it.result = X.extractHoldings(it.doc, mapping); }
    renderCard(it);
  }

  /* ---------- small formatting helpers ---------- */
  function monthName(ym){ const [y, m] = ym.split('-'); return new Date(+y, +m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }); }
  function shortDate(iso){ return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function norm(s){ return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
  const round2 = (x) => Math.round(x * 100) / 100, round4 = (x) => Math.round(x * 10000) / 10000;
  function cleanVals(v){ const o = {}; Object.entries(v).forEach(([k, x]) => { if(x != null && x !== '' && !isNaN(x)) o[k] = Number(x); }); return o; }
  function annualGross(v){ return n(v.gross) * 12; }
  function bankIncome(r){ const e = r.edit || {}; const sal = r.salaryMonthly || 0; const pay = r.payers.filter((p, i) => e.payers && e.payers[i]).reduce((a, p) => a + p.total, 0) / r.months; const other = ['interest', 'dividend', 'rentin'].reduce((a, k) => a + (r.inByCat[k] ? r.inByCat[k].monthly : 0), 0); return sal + pay + other; }
  function guessBank(it){
    const m = (it.doc.text || '').slice(0, 4000).match(/\b(HDFC|ICICI|Axis|Kotak|State Bank of India|SBI|Yes Bank|IDFC FIRST|IndusInd|Bank of Baroda|Punjab National|Canara|Union Bank|Federal|AU Small Finance|RBL|Bank of India|Indian Bank|IDBI|Standard Chartered|HSBC|Citi|DBS|Jupiter|Fi Money|Niyo)\b/i);
    const name = m ? m[1].replace(/^state bank of india$/i, 'SBI') : 'Bank';
    return name + ' savings';
  }
  function projectYear(received, months, fy){
    // a part-year list is scaled to 12 months; a finished year is taken as is
    if(!fy || fy !== X.currentFy()) return received;
    return months >= 12 ? received : received / Math.max(1, months) * 12;
  }

  /* ---------- render ---------- */
  function renderCard(it){
    const el = it.el;
    el.classList.toggle('applied', it.status === 'applied');
    el.classList.toggle('error', it.status === 'error');
    const fileLine = `${esc(it.file.name)} · ${(it.file.size / 1024).toFixed(0)} KB`;
    if(it.status === 'waiting' || it.status === 'reading'){
      el.innerHTML = `<div class="imp-head"><div class="imp-ic">${icon('upload')}</div><div><h3>${esc(it.file.name)}</h3><p class="muted">${(it.file.size / 1024).toFixed(0)} KB</p></div></div>
        <div class="imp-status" role="status"><i class="imp-spin" aria-hidden="true"></i><span>${esc(it.progress || 'Waiting')}</span></div>`;
      return;
    }
    if(it.status === 'error'){
      el.innerHTML = `<div class="imp-head"><div class="imp-ic">${icon('help')}</div><div><h3>${esc(it.file.name)}</h3><p class="muted">Could not be read</p></div></div>
        <p style="margin:12px 0 0">${esc(it.error)}</p><div class="imp-actions"><button type="button" class="secondary" data-act="discard">Remove</button></div>`;
      return;
    }
    const r = it.result, spec = SPEC[r.type] || SPEC.unknown, info = TYPES[r.type] || TYPES.unknown;
    const conf = r.confidence === 'high' ? '<span class="pill moss">Looks right</span>' : r.confidence === 'medium' ? '<span class="pill gold">Please check</span>' : '<span class="pill brick">Low confidence</span>';
    const source = it.doc.ocr ? 'read from an image' : it.doc.kind === 'pdf' ? (it.doc.encrypted ? 'locked PDF, opened with your password' : 'PDF') : it.doc.kind === 'sheet' ? 'spreadsheet' : it.doc.kind;
    const types = Object.entries(TYPES).filter(([k]) => !['unknown', 'backup'].includes(k)).map(([k, t]) => `<option value="${k}" ${k === r.type ? 'selected' : ''}>${t.label}</option>`).join('');
    const notes = (r.notes || []).map(t => `<div class="advice info imp-insight"><p>${esc(t)}</p></div>`).join('');
    let body = '';
    try{ body = spec.body(it); }catch(e){ console.error(e); body = '<p class="muted">Something in this file confused the reader. Pick another type above, or enter the numbers by hand.</p>'; }
    if(it.status === 'applied'){
      el.innerHTML = `<div class="imp-head"><div class="imp-ic">${icon(info.icon)}</div><div><h3>${esc(spec.title(r))}</h3><p class="muted">${fileLine}</p></div><span class="pill moss">Applied</span></div>
        <div class="imp-done">${(it.links || []).map(([h, l]) => `<a href="${h}">${esc(l)} →</a>`).join('')}</div>
        ${insightsHtml(it)}`;
      return;
    }
    el.innerHTML = `<div class="imp-head"><div class="imp-ic">${icon(info.icon)}</div><div><h3>${esc(spec.title(r))}</h3><p class="muted">${[spec.sub(r), fileLine, source].filter(Boolean).map(esc).join(' · ')}</p></div>${r.type === 'unknown' ? '' : conf}</div>
      <div class="imp-retype"><span>${r.type === 'unknown' ? 'What is it?' : 'Not right?'}</span><select data-act="retype" aria-label="Document type">${r.type === 'unknown' ? '<option value="">Choose…</option>' : ''}${types}</select></div>
      ${notes}${body}
      <div class="imp-sec" data-part="targets">${targetsHtml(it)}</div>
      <div data-part="insights">${insightsHtml(it)}</div>
      <div class="imp-actions">${(spec.targets(it) || []).length ? `<button type="button" data-act="apply">${r.type === 'backup' ? 'Restore this backup' : 'Apply ticked items'}</button>` : ''}<button type="button" class="secondary" data-act="discard">Discard</button><span class="muted">Nothing is saved until you apply.</span></div>`;
  }
  function targetsHtml(it){
    const spec = SPEC[it.result.type] || SPEC.unknown;
    let list = [];
    try{ list = spec.targets(it) || []; }catch(e){ console.error(e); }
    it.targets = list;
    if(!it.picks) it.picks = {};
    if(!list.length) return '';
    return `<h4>Where this goes</h4><div class="imp-targets">${list.map(t => {
      const on = it.picks[t.id] != null ? it.picks[t.id] : t.on;
      const chg = t.chg ? `<span class="chg">${t.chg[0] ? `<s>${M(t.chg[0])}</s> → ` : ''}${M(t.chg[1])}</span>` : '';
      return `<label class="imp-target"><input type="checkbox" data-target="${t.id}" ${on ? 'checked' : ''}><div><strong>${esc(t.label)}</strong>${chg ? chg + ' ' : ''}${t.desc ? `<span>${esc(t.desc)}</span>` : ''}</div></label>`;
    }).join('')}</div>`;
  }
  function insightsHtml(it){
    const spec = SPEC[it.result.type] || SPEC.unknown;
    let list = [];
    try{ list = spec.insights(it) || []; }catch(e){ console.error(e); }
    if(!list.length) return '';
    return `<div class="imp-sec"><h4>What we noticed</h4>${list.map(a => `<div class="advice ${a.level} imp-insight"><h4>${esc(a.title)}</h4><p>${esc(a.text)}</p></div>`).join('')}</div>`;
  }
  function refreshParts(it){
    const t = it.el.querySelector('[data-part="targets"]'); if(t) t.innerHTML = targetsHtml(it);
    const s = it.el.querySelector('[data-part="insights"]'); if(s) s.innerHTML = insightsHtml(it);
  }

  /* ---------- events on cards ---------- */
  const findItem = (el) => queue.find(q => q.el === el.closest('.imp-card'));
  let refreshTimer;
  $('impList').addEventListener('input', (e) => {
    const it = findItem(e.target); if(!it || !it.result) return;
    const el = e.target;
    if(el.dataset.target){ it.picks[el.dataset.target] = el.checked; return; }
    if(el.dataset.map || el.dataset.mapcol) return;
    const spec = SPEC[it.result.type]; if(!spec) return;
    spec.read(it, el.dataset.k, el.type === 'checkbox' ? el.checked : el.value, el);
    clearTimeout(refreshTimer); refreshTimer = setTimeout(() => refreshParts(it), 250);
  });
  $('impList').addEventListener('change', (e) => {
    const it = findItem(e.target); if(!it) return;
    const el = e.target;
    if(el.dataset.act === 'retype' && el.value){ it.result = X.extract(it.doc, el.value); it.picks = {}; it.map = null; renderCard(it); return; }
    if(el.dataset.map){
      if(el.dataset.map === 'kind'){ it.map.kind = el.value; it.map.cols = {}; }
      if(el.dataset.map === 'table'){ it.map.table = Number(el.value); it.map.header = guessHeaderRow(it.doc.tables[it.map.table].rows); it.map.cols = {}; }
      if(el.dataset.map === 'header'){ it.map.header = Math.max(0, Number(el.value) - 1); }
      renderCard(it); return;
    }
    if(el.dataset.mapcol){ it.map.cols[el.dataset.mapcol] = el.value; return; }
    if(el.dataset.pick != null || el.dataset.payer != null){ refreshParts(it); }
  });
  $('impList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if(!b || b.tagName === 'SELECT') return;
    const it = findItem(b); if(!it) return;
    if(b.dataset.act === 'discard'){ it.el.remove(); queue.splice(queue.indexOf(it), 1); if(!queue.length) $('impEmpty').hidden = false; }
    if(b.dataset.act === 'apply') apply(it);
    if(b.dataset.act === 'map') runMapper(it);
  });

  /* ---------- apply and undo ---------- */
  function apply(it){
    const chosen = (it.targets || []).filter(t => it.picks[t.id] != null ? it.picks[t.id] : t.on);
    if(!chosen.length){ showToast('Tick at least one item to apply.'); return; }
    if(chosen.some(t => t.restore)){
      if(!confirm('Replace everything stored in this browser with this backup?')) return;
      try{ localStorage.setItem(UNDO_KEY, JSON.stringify({ at: new Date().toISOString(), file: it.file.name, data: loadData() })); }catch(e){}
      importData(it.file, (ok) => { if(ok){ it.status = 'applied'; it.links = [['dashboard.html', 'Open your dashboard']]; renderCard(it); renderLog(); showToast('Backup restored.'); } else showToast('That backup could not be read.'); });
      return;
    }
    const before = loadData();
    try{ localStorage.setItem(UNDO_KEY, JSON.stringify({ at: new Date().toISOString(), file: it.file.name, data: before })); }catch(e){}
    const data = loadData();
    data.income = data.income || {}; data.cash = data.cash || []; data.importLog = data.importLog || [];
    chosen.forEach(t => { try{ t.run(data); }catch(e){ console.error('apply failed', t.id, e); } });
    data.importLog.unshift({ id: uid(), at: new Date().toISOString(), file: it.file.name.slice(0, 80), type: it.result.type, summary: chosen.map(t => t.label).join('; ').slice(0, 300) });
    data.importLog = data.importLog.slice(0, 50);
    saveData(data);
    const LINKS = { budget: ['budget.html', 'See your Budget'], income: ['budget.html', 'See your Budget'], exp: ['settings.html', 'Settings'], cash: ['assets.html', 'Bank & Cash in Assets'], epf: ['assets.html', 'EPF in Assets'], nps: ['assets.html', 'NPS in Assets'],
      stocks: ['assets.html', 'Stocks in Assets'], mf: ['assets.html', 'Mutual funds in Assets'], ins: ['insurance.html', 'Insurance needs calculator'], profile: ['calculators.html#tax', 'Tax calculators, now filled in'], free: ['calculators.html#tax', INDIA ? 'Freelancer tax calculator' : 'Self-employed tax calculator'], retire: ['assets.html', 'Retirement accounts in Assets'], audit: ['audit.html', 'Pre-filing audit'] };
    const links = []; chosen.forEach(t => { const l = LINKS[t.id]; if(l && !links.some(x => x[1] === l[1])) links.push(l); });
    links.push(['dashboard.html', 'Dashboard']);
    it.status = 'applied'; it.links = links; renderCard(it); renderLog();
    showToast('Applied. You can undo this from the bottom of the page.');
  }
  function renderLog(){
    const log = loadData().importLog || [];
    let undo = null; try{ undo = JSON.parse(localStorage.getItem(UNDO_KEY) || 'null'); }catch(e){}
    $('undoBtn').hidden = !undo;
    if(undo) $('undoBtn').textContent = `Undo last import (${undo.file.length > 28 ? undo.file.slice(0, 26) + '…' : undo.file})`;
    $('impLog').innerHTML = log.length ? log.map(l => `<li><div><strong>${esc((TYPES[l.type] || TYPES.unknown).label)}</strong> · ${esc(l.file)}<div class="hint" style="margin:2px 0 0">${esc(l.summary)}</div></div><span class="muted" style="white-space:nowrap">${new Date(l.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></li>`).join('') : '<li class="muted">Nothing imported yet.</li>';
  }
  $('undoBtn').addEventListener('click', () => {
    let undo = null; try{ undo = JSON.parse(localStorage.getItem(UNDO_KEY) || 'null'); }catch(e){}
    if(!undo) return;
    if(!confirm(`Put everything back the way it was before importing ${undo.file}?`)) return;
    saveData(undo.data); localStorage.removeItem(UNDO_KEY);
    queue.filter(q => q.status === 'applied' && q.file.name === undo.file).forEach(q => { q.status = 'ready'; renderCard(q); });
    renderLog(); showToast('Undone.');
  });

  /* ---------- drop zone ---------- */
  const drop = $('impDrop'), input = $('impFile');
  input.addEventListener('change', () => { if(input.files.length) addFiles(input.files); input.value = ''; });
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => { if(e.dataTransfer.files.length) addFiles(e.dataTransfer.files); });
  // also accept files dropped anywhere on the page
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => { if(!drop.contains(e.target)){ e.preventDefault(); if(e.dataTransfer.files.length) addFiles(e.dataTransfer.files); } });
  // and pasted screenshots
  window.addEventListener('paste', (e) => { const f = [...(e.clipboardData || {}).files || []]; if(f.length){ addFiles(f.map((x, i) => new File([x], x.name && x.name !== 'image.png' ? x.name : `pasted-${i + 1}.png`, { type: x.type }))); } });

  window.CorpusImporter = { addFiles, queue };
  renderWork(); renderLog();
})();
