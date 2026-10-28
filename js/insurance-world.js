/* =========================================================
   CO₹PU$ — insurance needs outside India
   Same plain method as the India calculator, without the India
   specific parts (states, metro hospital costs, Section 80D):
   • Life cover: loans + present value of the family's living costs
     until you would have retired + goals, minus cover and savings
     you already have. Money assumed to earn 6% while prices rise 3%.
   • Income protection: a share of gross income, the range insurers
     in most countries will cover.
   • Health: the country's own guidance, because public systems
     differ too much for one number.
   Answers are saved only on this device, with the India profile.
   ========================================================= */
(function(){
  'use strict';
  function boot(){
    const CC = window.CorpusCountry;
    const host = document.getElementById('worldCalc');
    if(!host || !CC || CC.isIndia() || !window.CORPUS_GUIDES) return;
    const code = CC.current(), G = window.CORPUS_GUIDES[code];
    if(!G) return;
    const K = G.calc, P = CC.get(code);
    const $ = (id) => document.getElementById(id);
    const esc = (s) => (window.escapeHtml ? escapeHtml(s) : String(s));
    const M = (v) => fmtMoney(Math.round(v)), L = (v) => fmtCompact(v);
    const roundUp = (v, step) => v <= 0 ? 0 : Math.ceil(v / step) * step;

    host.className = 'card';
    host.innerHTML = `<h2>Find the Cover That Fits You</h2>
      <p class="hint" style="margin-top:0">Amounts in ${esc(P.currency)}. Your loans, existing policies and savings are read from the Assets and Liabilities pages automatically.</p>
      <div class="form-row">
        <div><label for="w_income">Your yearly income before tax</label><input type="number" id="w_income" inputmode="numeric" placeholder="e.g. 85000"></div>
        <div><label for="w_age">Your age</label><input type="number" id="w_age" inputmode="numeric" placeholder="e.g. 34"></div>
      </div>
      <div class="form-row">
        <div><label for="w_dependents">People who depend on your income</label><input type="number" id="w_dependents" min="0" value="2" inputmode="numeric"><p class="hint">Partner, children, anyone your income supports.</p></div>
        <div><label for="w_expense">Household spending per month</label><input type="number" id="w_expense" inputmode="numeric" placeholder="Leave blank to estimate"></div>
      </div>
      <div class="form-row">
        <div><label for="w_goal">Big goals your family would still need funded</label><input type="number" id="w_goal" value="0" inputmode="numeric"><p class="hint">For example university costs, in today's money.</p></div>
        <div><label for="w_work">Life cover from your employer</label><input type="number" id="w_work" value="0" inputmode="numeric"><p class="hint">${esc(K.lifeNote)}</p></div>
      </div>
      <div class="form-row">
        <div><label for="w_smoker">Do you smoke or vape?</label><select id="w_smoker"><option value="no">No</option><option value="yes">Yes</option></select></div>
        <div></div>
      </div>
      <div style="margin-top:18px;"><button type="button" id="w_btn">Show my recommendation</button></div>
      <div id="w_out" aria-live="polite"></div>`;

    const fields = ['income', 'age', 'dependents', 'expense', 'goal', 'work', 'smoker'];
    const st = loadData().settings || {}, saved = st.insuranceWorld || {};
    fields.forEach(f => { if(saved[f] != null && saved[f] !== '') $('w_' + f).value = saved[f]; });
    if(!saved.age && st.age) $('w_age').value = st.age;
    if(!saved.expense && st.monthlyExpense) $('w_expense').value = st.monthlyExpense;

    function run(scroll){
      const p = {}; fields.forEach(f => p[f] = $('w_' + f).value);
      const income = Number(p.income) || 0, age = Number(p.age) || 0;
      const out = $('w_out');
      if(!income || !age){ out.innerHTML = '<p class="hint" style="margin-top:14px">Enter at least your yearly income and age.</p>'; return; }
      updateSettings({ insuranceWorld: p });
      const dependents = Math.max(0, Number(p.dependents) || 0), goal = Number(p.goal) || 0, work = Number(p.work) || 0;
      const monthly = Number(p.expense) || 0, annualExp = monthly > 0 ? monthly * 12 : income * 0.6;

      const s = computeSummary();
      const owed = s.totalLiabilities, pols = s.c.insurance || [];
      const sumCat = (cat) => pols.filter(x => x.category === cat).reduce((a, x) => a + (Number(x.sumInsured) || 0), 0);
      const lifeHave = sumCat('life');
      const cls = Object.fromEntries(s.classTotals.map(c => [c.key, c.value]));
      const usable = (cls.equity || 0) + (cls.fixed || 0) + (cls.gold || 0);

      const years = Math.min(30, Math.max(5, 65 - age));
      const familyShare = dependents > 0 ? annualExp * 0.75 : 0;
      const replacement = dependents > 0 ? presentValueAnnuity(familyShare, realRate(6, 3), years) : 0;
      const need = owed + replacement + (dependents > 0 ? goal : 0);
      const have = lifeHave + usable;
      const gap = Math.max(0, need - have);
      const step = income > 200000 ? 50000 : 25000;
      const suggest = roundUp(gap, step);

      const ipLow = income * 0.5 / 12, ipHigh = income * 0.7 / 12;
      const kv = (a, b) => `<div class="kv"><span>${a}</span><span>${b}</span></div>`;
      const smoke = p.smoker === 'yes' ? 'Smokers and vapers pay noticeably more, but always declare it: non disclosure is a common reason claims fail.' : 'Answer health questions fully: incomplete disclosure is the most common reason claims fail.';

      const pri = [];
      if(dependents > 0 && gap > 0) pri.push(['Life cover', `${dependents} ${dependents === 1 ? 'person depends' : 'people depend'} on your income and your cover falls ${L(gap)} short.`]);
      else if(dependents === 0 && owed > 0 && gap > 0) pri.push(['Life cover for your loans', `${L(owed)} of loans would fall to co-borrowers or your estate.`]);
      pri.push([K.disability, `Illness that stops you working is more likely than dying young, and it hits income for longer. ${K.disabilityNote}`]);
      if(work > 0) pri.push(['Do not rely on cover from work', `${L(work)} of employer cover ends when the job does.`]);

      out.innerHTML = `
        <div class="result-box" style="margin-top:22px;"><h3 style="margin-top:0;">What to sort out first</h3>
          ${pri.map((x, i) => `<div class="advice ${i === 0 ? 'warn' : 'info'}"><h4>${i + 1}. ${esc(x[0])}</h4><p>${esc(x[1])}</p></div>`).join('')}</div>
        <div class="grid-3" style="margin-top:16px;">
          <div class="card" style="margin:0;"><div class="stat-label">Life cover to add</div>
            <div class="stat-num">${suggest > 0 ? L(suggest) : 'None needed'}</div>
            <div class="stat-sub">${suggest > 0 ? `A term of about ${years} years` : (dependents === 0 && owed === 0 ? 'No dependents and no loans' : 'Your savings and policies already cover it')}</div>
            <div style="margin-top:12px;">${kv('Loans and debts to clear', M(owed))}${dependents > 0 ? kv(`Family living costs for ${years} years`, M(replacement)) : ''}${dependents > 0 && goal > 0 ? kv('Goals still to fund', M(goal)) : ''}
              ${kv('<strong>Total need</strong>', `<strong>${M(need)}</strong>`)}${kv('Life cover you hold', lifeHave ? '−' + M(lifeHave) : M(0))}${kv('Savings your family could use', usable ? '−' + M(usable) : M(0))}${work ? kv('Employer cover (not counted)', M(work)) : ''}</div>
            <p class="hint">${esc(smoke)}</p></div>
          <div class="card" style="margin:0;"><div class="stat-label">${esc(K.disability)}</div>
            <div class="stat-num">${L(ipLow)} – ${L(ipHigh)}</div><div class="stat-sub">a month, before tax</div>
            <div style="margin-top:12px;">${kv('50% of your income', M(ipLow) + ' / mo')}${kv('70% of your income', M(ipHigh) + ' / mo')}</div>
            <p class="hint">${esc(K.disabilityNote)}</p></div>
          <div class="card" style="margin:0;"><div class="stat-label">Health cover</div>
            <p style="margin:8px 0 0; font-size:14px; line-height:1.6">${esc(K.health)}</p></div>
        </div>
        <p class="hint" style="margin-top:14px;">${monthly > 0 ? '' : 'Household spending was estimated at 60% of your income; enter your real figure for a sharper answer. '}Living costs assume your family needs about 75% of current spending, with money earning 6% a year while prices rise 3%. This is a reference calculation using commonly taught methods, not advice. Check with a licensed adviser before buying a large policy.</p>`;
      if(scroll) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    $('w_btn').addEventListener('click', () => run(true));
    if(saved.income) run(false);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
