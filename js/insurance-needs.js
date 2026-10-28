/* ===========================================================
   CO₹PU$ — insurance needs calculator
   Plain, explainable rules (no model, no guesswork):
   • Term life: what your family would need if your income stopped
     = outstanding loans + present value of their living costs until
       you would have retired + big goals still to fund,
     minus life cover you already hold and savings they could use.
   • Health: a starting range by age and city, plus room for each
     extra family member. Employer cover is shown but not counted,
     because it ends the day you leave the job.
   • Personal accident: a common 5 to 10 times income rule of thumb.
   Every figure is shown with how it was worked out.
=========================================================== */
(function(){
  const $ = (id) => document.getElementById(id);
  const fields = ['income','age','gender','state','city','smoker','dependents','family','parents','employer','expense','goal'];

  function fillStates(){
    const sel = $('n_state');
    sel.innerHTML = '<option value="">Choose your state</option>' + STATES.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  }

  function loadProfile(){
    const st = loadData().settings;
    const p = st.insuranceProfile || {};
    if(p.income) $('n_income').value = p.income;
    $('n_age').value = p.age || st.age || '';
    if(p.gender) $('n_gender').value = p.gender;
    if(p.state) $('n_state').value = p.state;
    if(p.city) $('n_city').value = p.city;
    if(p.smoker) $('n_smoker').value = p.smoker;
    if(p.dependents != null && p.dependents !== '') $('n_dependents').value = p.dependents;
    if(p.family) $('n_family').value = p.family;
    if(p.parents != null) $('n_parents').value = p.parents;
    if(p.employer != null) $('n_employer').value = p.employer;
    $('n_expense').value = p.expense || st.monthlyExpense || '';
    if(p.goal != null) $('n_goal').value = p.goal;
  }

  function saveProfile(p){ updateSettings({ insuranceProfile: p }); }

  const roundUp = (v, step) => v <= 0 ? 0 : Math.ceil(v / step) * step;
  const L = (v) => fmtCompact(v);
  const M = (v) => fmtMoney(Math.round(v));

  function healthBase(age, city){
    const metro = city === 'metro';
    if(age < 35) return metro ? 1000000 : 700000;
    if(age < 50) return metro ? 1500000 : 1000000;
    if(age < 65) return metro ? 2000000 : 1500000;
    return metro ? 2500000 : 2000000;
  }

  function run(){
    const p = {};
    fields.forEach(f => p[f] = $('n_' + f).value);
    const income = Number(p.income) || 0;
    const age = Number(p.age) || 0;
    const out = $('needs_out');

    if(!income || !age){
      out.innerHTML = `<div class="callout">${CORPUS_ICON ? CORPUS_ICON('insurance') : ''}<div>Enter at least your annual income and age to see a recommendation.</div></div>`;
      return;
    }
    saveProfile(p);

    const dependents = Math.max(0, Number(p.dependents) || 0);
    const family = Math.max(1, Number(p.family) || 1);
    const parents = Number(p.parents) || 0;
    const employer = Number(p.employer) || 0;
    const goal = Number(p.goal) || 0;
    const monthlyExp = Number(p.expense) || 0;
    const annualExp = monthlyExp > 0 ? monthlyExp * 12 : income * 0.6;
    const expEstimated = !(monthlyExp > 0);

    const s = computeSummary();
    const owed = s.totalLiabilities;
    const pols = s.c.insurance || [];
    const sumCat = (cat) => pols.filter(x => x.category === cat).reduce((a, x) => a + (Number(x.sumInsured) || 0), 0);
    const lifeHave = sumCat('life'), healthHave = sumCat('health'), accHave = sumCat('accident');
    const cls = Object.fromEntries(s.classTotals.map(c => [c.key, c.value]));
    const usable = (cls.equity || 0) + (cls.fixed || 0) + (cls.gold || 0);

    /* ---- term life ---- */
    const yearsToSupport = Math.min(30, Math.max(5, 60 - age));
    const familyShare = dependents > 0 ? annualExp * 0.75 : 0;  // your own share of spending stops
    const real = realRate(8, 6);                                // money earning 8% while prices rise 6%
    const replacement = dependents > 0 ? presentValueAnnuity(familyShare, real, yearsToSupport) : 0;
    const termNeed = owed + replacement + (dependents > 0 ? goal : 0);
    const termHave = lifeHave + usable;
    const termGap = Math.max(0, termNeed - termHave);
    const termSuggest = roundUp(termGap, 2500000);
    const termMultiple = income > 0 ? termNeed / income : 0;
    const termTill = Math.max(60, Math.min(70, age + yearsToSupport));

    /* ---- health ---- */
    const base = healthBase(age, p.city);
    const healthSuggest = Math.min(5000000, base + (family - 1) * 300000);
    const healthGap = Math.max(0, healthSuggest - healthHave);
    const basePolicy = p.city === 'metro' ? 1000000 : 500000;
    const topUp = Math.max(0, healthSuggest - basePolicy);
    const stateInfo = p.state ? stateHealthInfo(p.state) : null;

    /* ---- personal accident ---- */
    const accLow = income * 5, accHigh = income * 10;
    const accGap = Math.max(0, accLow - accHave);

    /* ---- priority order ---- */
    const pri = [];
    if(healthHave + employer === 0) pri.push({ k:'health', t:'Health insurance', why:'You have no health cover on record, a single hospital stay could undo years of saving.' });
    if(dependents > 0 && termGap > 0) pri.push({ k:'term', t:'Term life insurance', why:`${dependents} ${dependents === 1 ? 'person depends' : 'people depend'} on your income and your cover falls ${L(termGap)} short.` });
    else if(dependents === 0 && owed > 0 && termGap > 0) pri.push({ k:'term', t:'Term cover for your loans', why:`No one depends on your income, but ${L(owed)} of loans would pass to co-borrowers or your estate.` });
    if(healthHave + employer > 0 && healthGap > 0) pri.push({ k:'health', t:'Top up your health cover', why:`Your own policy is ${L(healthGap)} below the suggested amount for your age and city.` });
    if(parents > 0) pri.push({ k:'parents', t:'Separate cover for your parents', why:'Senior citizens are better on their own policy, so their claims don\'t eat into your family floater.' });
    if(accGap > 0) pri.push({ k:'acc', t:'Personal accident cover', why:'Cheap protection for your income if an accident stops you working.' });
    if(!pri.length) pri.push({ k:'ok', t:'You look well covered', why:'Your existing policies meet or beat each suggested amount. Review them once a year or after a big life change.' });

    const genderTerm = p.gender === 'female'
      ? 'Insurers often quote slightly lower term premiums for women, so compare a few quotes. The cover you need is the same either way.'
      : 'Gender affects the premium an insurer quotes, not how much cover you need.';
    const smokerTerm = p.smoker === 'yes'
      ? 'Tobacco users pay noticeably more, but always declare it: undisclosed tobacco use is one of the most common reasons claims are rejected.'
      : 'Declare your health history fully on the application, incomplete disclosure is the most common reason claims are rejected.';
    const genderHealth = (p.gender === 'female' && age < 45)
      ? 'If you are planning a child, choose a plan with maternity cover early: maternity benefits usually have a waiting period of two to four years.'
      : '';

    const kv = (a, b) => `<div class="kv"><span>${a}</span><span>${b}</span></div>`;

    out.innerHTML = `
      <div class="result-box" style="margin-top:22px;">
        <h3 style="margin-top:0;">What to sort out first</h3>
        ${pri.map((x, i) => `<div class="advice ${i === 0 ? 'warn' : 'info'}" style="animation-delay:${i * 0.05}s"><h4>${i + 1}. ${escapeHtml(x.t)}</h4><p>${escapeHtml(x.why)}</p></div>`).join('')}
      </div>

      <div class="grid-3" style="margin-top:16px;">
        <div class="card" style="margin:0;">
          <div class="stat-label">Term life cover to add</div>
          <div class="stat-num">${termSuggest > 0 ? L(termSuggest) : 'None needed'}</div>
          <div class="stat-sub">${termSuggest > 0 ? `Policy running until about age ${termTill}` : (dependents === 0 && owed === 0 ? 'No dependents and no loans' : 'Your savings and policies already cover it')}</div>
          <div style="margin-top:12px;">
            ${kv('Loans and debts to clear', M(owed))}
            ${dependents > 0 ? kv(`Family living costs for ${yearsToSupport} years`, M(replacement)) : ''}
            ${dependents > 0 && goal > 0 ? kv('Goals still to fund', M(goal)) : ''}
            ${kv('<strong>Total need</strong>', `<strong>${M(termNeed)}</strong>`)}
            ${kv('Life cover you already hold', lifeHave ? '−' + M(lifeHave) : M(0))}
            ${kv('Savings your family could use', usable ? '−' + M(usable) : M(0))}
          </div>
          <p class="hint">${dependents > 0 ? `Your total need is about ${termMultiple.toFixed(1)} times your income. ` : ''}${escapeHtml(genderTerm)} ${escapeHtml(smokerTerm)}</p>
        </div>

        <div class="card" style="margin:0;">
          <div class="stat-label">Health cover to aim for</div>
          <div class="stat-num">${L(healthSuggest)}</div>
          <div class="stat-sub">${healthGap > 0 ? `${L(healthGap)} more than your own policies today` : 'Your own policies already meet this'}</div>
          <div style="margin-top:12px;">
            ${kv('Starting point for your age and city', M(base))}
            ${family > 1 ? kv(`Room for ${family - 1} more ${family - 1 === 1 ? 'person' : 'people'}`, M((family - 1) * 300000)) : ''}
            ${kv('Your own health policies', M(healthHave))}
            ${kv('Employer cover (not counted)', M(employer))}
          </div>
          <p class="hint">A cheaper way to reach this: a base policy of ${L(basePolicy)} plus a super top-up of about ${L(topUp)} that starts paying once ${L(basePolicy)} is used. Employer cover ends when you change jobs, so it is shown but not relied on. ${escapeHtml(genderHealth)}</p>
          ${parents > 0 ? `<p class="hint"><strong>Parents:</strong> a separate senior citizen policy for ${parents === 1 ? 'your parent' : 'your parents'} keeps their claims off your floater. Under the old tax regime, their premium qualifies for up to ₹50,000 a year under Section 80D, on top of ${age >= 60 ? '₹50,000' : '₹25,000'} for your own family.</p>` : ''}
        </div>

        <div class="card" style="margin:0;">
          <div class="stat-label">Personal accident cover</div>
          <div class="stat-num">${L(accLow)} – ${L(accHigh)}</div>
          <div class="stat-sub">${accHave > 0 ? `You hold ${L(accHave)} today` : 'None on record'}</div>
          <div style="margin-top:12px;">
            ${kv('5 times your income', M(accLow))}
            ${kv('10 times your income', M(accHigh))}
            ${kv('Accident cover you hold', M(accHave))}
          </div>
          <p class="hint">A common rule of thumb, not a precise need. It pays on accidental death or disability only, never illness, and costs far less than term or health cover. Check whether your bank account or credit card already includes some before buying more.</p>
        </div>
      </div>

      ${stateInfo ? `
      <div class="callout" style="margin-top:16px;">${CORPUS_ICON('states')}
        <div><strong>${escapeHtml(p.state)}: ${escapeHtml(stateInfo.scheme)}</strong><br>${escapeHtml(stateInfo.summary)}${stateInfo.note ? ' ' + escapeHtml(stateInfo.note) : ''}
        ${stateInfo.incomeLimit && income > stateInfo.incomeLimit ? `<br><strong>Your income of ${escapeHtml(L(income))} is above this scheme's ${escapeHtml(L(stateInfo.incomeLimit))} limit, so you likely won't qualify, plan on your own policy.</strong>` : ''}
        <br><span class="muted">If you qualify, treat it as a free base layer. It works on fixed treatment packages at empanelled hospitals, so it is not a replacement for your own policy.</span>
        ${stateInfo.link ? `<br><a href="${escapeHtml(stateInfo.link)}" target="_blank" rel="noopener" style="color:var(--accent); font-weight:600;">${escapeHtml(stateInfo.linkLabel || 'Official portal')} ↗</a>` : ''}
        · <a href="states.html" style="color:var(--accent); font-weight:600;">All state schemes</a></div>
      </div>` : (p.state ? `
      <div class="callout" style="margin-top:16px;">${CORPUS_ICON('states')}
        <div><strong>${escapeHtml(p.state)}</strong><br>${escapeHtml(NATIONAL_HEALTH.summary)} Your state may add its own top-up.
        <br><a href="${NATIONAL_HEALTH.link}" target="_blank" rel="noopener" style="color:var(--accent); font-weight:600;">${NATIONAL_HEALTH.linkLabel} ↗</a> · <a href="states.html" style="color:var(--accent); font-weight:600;">State resources</a></div>
      </div>` : '')}

      <p class="hint" style="margin-top:14px;">${expEstimated ? 'Household expenses were estimated at 60% of your income, enter your real figure above for a sharper answer. ' : ''}Living costs assume your family needs about 75% of current household spending, with money earning 8% a year while prices rise 6%. This is a reference calculation using commonly taught methods, not advice for your specific situation. Talk to a fee-only adviser before buying a large policy.</p>
    `;
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  fillStates();
  loadProfile();
  $('needsBtn').addEventListener('click', run);
  if(loadData().settings.insuranceProfile && loadData().settings.insuranceProfile.income) setTimeout(() => { run(); window.scrollTo(0, 0); }, 0);
})();
