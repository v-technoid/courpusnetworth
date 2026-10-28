/* ===========================================================
   CO₹PU$ — turns saved entries into current values, and
   rolls everything up into net worth and cash flow numbers.
=========================================================== */

function computePpf(e){
  const years = Math.max(0, yearsBetween(e.startDate, new Date()));
  const value = ppfValue(Number(e.openingBalance)||0, Number(e.annualContribution)||0, Number(e.rate)||0, years);
  return { ...e, currentValue: value, invested: (Number(e.openingBalance)||0) + (Number(e.annualContribution)||0) * years };
}

function computeEpf(e){
  const months = Math.max(0, monthsBetween(e.startDate, new Date()));
  const value = epfValue(Number(e.openingBalance)||0, Number(e.monthlyContribution)||0, Number(e.rate)||0, months);
  return { ...e, currentValue: value, invested: (Number(e.openingBalance)||0) + (Number(e.monthlyContribution)||0) * months };
}

function computeGold(e){
  const price = Number(e.currentPricePerGram) || Number(e.buyPricePerGram) || 0;
  const value = (Number(e.grams)||0) * price;
  const invested = (Number(e.grams)||0) * (Number(e.buyPricePerGram)||0);
  return { ...e, currentValue: value, invested, gain: value - invested };
}

function computeCrypto(e){
  const price = Number(e.currentPrice) || Number(e.buyPrice) || 0;
  const value = (Number(e.quantity)||0) * price;
  const invested = (Number(e.quantity)||0) * (Number(e.buyPrice)||0);
  return { ...e, currentValue: value, invested, gain: value - invested };
}

function computeNps(e){
  const months = Math.max(0, monthsBetween(e.startDate, new Date()));
  const value = epfValue(Number(e.openingBalance)||0, Number(e.monthlyContribution)||0, Number(e.expectedReturn)||0, months);
  return { ...e, currentValue: value, invested: (Number(e.openingBalance)||0) + (Number(e.monthlyContribution)||0) * months };
}

// retirement and tax-advantaged accounts outside India (401(k), ISA, RRSP, super, CPF, KiwiSaver): same maths as NPS
function computeRetire(e){ return computeNps(e); }

function computeFd(e){
  const tenureYears = (Number(e.tenureMonths)||0) / 12;
  const elapsed = Math.min(Math.max(0, yearsBetween(e.startDate, new Date())), tenureYears);
  const value = fdMaturity(Number(e.principal)||0, Number(e.rate)||0, elapsed, 4);
  const maturity = fdMaturity(Number(e.principal)||0, Number(e.rate)||0, tenureYears, 4);
  const maturityDate = addMonths(e.startDate, Number(e.tenureMonths)||0);
  return { ...e, currentValue: value, invested: Number(e.principal)||0, maturity, maturityDate };
}

function computeRd(e){
  const elapsedMonths = Math.min(Math.max(0, monthsBetween(e.startDate, new Date())), Number(e.tenureMonths)||0);
  const value = rdMaturity(Number(e.monthlyAmount)||0, Number(e.rate)||0, elapsedMonths);
  const maturity = rdMaturity(Number(e.monthlyAmount)||0, Number(e.rate)||0, Number(e.tenureMonths)||0);
  const maturityDate = addMonths(e.startDate, Number(e.tenureMonths)||0);
  return { ...e, currentValue: value, invested: (Number(e.monthlyAmount)||0) * elapsedMonths, maturity, maturityDate };
}

function computeCash(e){
  return { ...e, currentValue: Number(e.balance) || 0 };
}

function computeStock(e){
  const price = Number(e.currentPrice) || Number(e.buyPrice) || 0;
  const value = (Number(e.quantity)||0) * price;
  const invested = (Number(e.quantity)||0) * (Number(e.buyPrice)||0);
  return { ...e, currentValue: value, invested, gain: value - invested };
}

function computeMf(e){
  const nav = Number(e.currentNav) || Number(e.buyPrice) || 0;
  const value = (Number(e.units)||0) * nav;
  const invested = (Number(e.units)||0) * (Number(e.buyPrice)||0);
  return { ...e, currentValue: value, invested, gain: value - invested };
}

function computeBond(e){
  const periodsPerYear = e.frequency === 'semi' ? 2 : 1;
  const yearsToMaturity = Math.max(0, yearsBetween(new Date(), e.maturityDate));
  const faceValue = Number(e.faceValue) || 0;
  const pricePerUnit = bondPrice(faceValue, Number(e.couponRate)||0, Number(e.ytm)||0, yearsToMaturity, periodsPerYear);
  const quantity = Number(e.quantity) || 0;
  const value = pricePerUnit * quantity;
  const invested = (Number(e.purchasePrice)||0) * quantity;
  const currentYield = pricePerUnit > 0 ? (faceValue * (Number(e.couponRate)||0) / 100) / pricePerUnit * 100 : 0;
  return { ...e, currentValue: value, invested, gain: value - invested, pricePerUnit, currentYield, yearsToMaturity };
}

function computeLand(e){
  const value = Number(e.currentValue) || Number(e.purchasePrice) || 0;
  return { ...e, currentValue: value, invested: Number(e.purchasePrice)||0 };
}

function computeLoan(e){
  const paymentsMade = Math.min(Math.max(0, monthsBetween(e.startDate, new Date())), Number(e.tenureMonths)||0);
  const balance = loanBalance(Number(e.principal)||0, Number(e.rate)||0, Number(e.tenureMonths)||0, paymentsMade);
  const monthlyEmi = emi(Number(e.principal)||0, Number(e.rate)||0, Number(e.tenureMonths)||0);
  return { ...e, balance, monthlyEmi, paymentsMade };
}

function addMonths(dateStr, months){
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + Number(months||0));
  return d.toISOString().slice(0,10);
}

function getComputed(){
  const data = loadData();
  return {
    cash: (data.cash || []).map(computeCash),
    ppf: data.ppf.map(computePpf),
    epf: data.epf.map(computeEpf),
    nps: data.nps.map(computeNps),
    retire: (data.retire || []).map(computeRetire),
    fd: data.fd.map(computeFd),
    rd: data.rd.map(computeRd),
    stocks: data.stocks.map(computeStock),
    mf: data.mf.map(computeMf),
    gold: data.gold.map(computeGold),
    crypto: data.crypto.map(computeCrypto),
    bonds: data.bonds.map(computeBond),
    land: data.land.map(computeLand),
    rental: data.rental,
    insurance: data.insurance,
    loans: data.loans.map(computeLoan),
    debts: data.debts,
    goals: data.goals,
    settings: data.settings,
    auditInputs: data.auditInputs
  };
}

function sumBy(arr, key){ return arr.reduce((s,e) => s + (Number(e[key])||0), 0); }

function computeSummary(){
  const c = getComputed();
  const assetBuckets = {
    cash: sumBy(c.cash, 'currentValue'),
    ppf: sumBy(c.ppf, 'currentValue'),
    epf: sumBy(c.epf, 'currentValue'),
    nps: sumBy(c.nps, 'currentValue'),
    retire: sumBy(c.retire, 'currentValue'),
    fd: sumBy(c.fd, 'currentValue'),
    rd: sumBy(c.rd, 'currentValue'),
    stocks: sumBy(c.stocks, 'currentValue'),
    mf: sumBy(c.mf, 'currentValue'),
    gold: sumBy(c.gold, 'currentValue'),
    crypto: sumBy(c.crypto, 'currentValue'),
    bonds: sumBy(c.bonds, 'currentValue'),
    land: sumBy(c.land, 'currentValue'),
  };
  const totalAssets = Object.values(assetBuckets).reduce((a,b)=>a+b, 0);

  const totalLoans = sumBy(c.loans, 'balance');
  const totalDebts = sumBy(c.debts, 'amount');
  const totalLiabilities = totalLoans + totalDebts;

  const netWorth = totalAssets - totalLiabilities;

  const monthlyRental = sumBy(c.rental, 'monthlyRent');
  const monthlyEmiOutgo = sumBy(c.loans, 'monthlyEmi');
  const monthlyDebtMin = sumBy(c.debts, 'minPayment');
  const monthlyCashFlow = monthlyRental - monthlyEmiOutgo - monthlyDebtMin;

  const insuranceByCategory = {};
  c.insurance.forEach(p => {
    const cat = p.category || 'other';
    if(!insuranceByCategory[cat]) insuranceByCategory[cat] = { sumInsured: 0, premium: 0, count: 0 };
    insuranceByCategory[cat].sumInsured += Number(p.sumInsured) || 0;
    insuranceByCategory[cat].premium += Number(p.premium) || 0;
    insuranceByCategory[cat].count += 1;
  });
  const totalAnnualPremium = sumBy(c.insurance, 'premium');

  const classTotals = groupIntoClasses(assetBuckets);

  return { c, assetBuckets, classTotals, totalAssets, totalLoans, totalDebts, totalLiabilities, netWorth, monthlyRental, monthlyEmiOutgo, monthlyDebtMin, monthlyCashFlow, insuranceByCategory, totalAnnualPremium };
}

/* ---------- asset classes ----------
   Eleven asset types fold into six classes for charts. Six is the
   most a colour-only legend can carry reliably, and the class view
   is also the more useful one for judging diversification.
   The order is fixed so a class keeps its colour no matter which
   classes happen to have money in them. */
const ASSET_CLASSES = [
  { key:'equity',     label:'Equity',       members:['stocks','mf'],        color:'var(--series-1)', defaultReturn: 12 },
  { key:'fixed',      label:'Cash & Fixed Income', members:['cash','fd','rd','bonds'],    color:'var(--series-2)', defaultReturn: 7 },
  { key:'retirement', label:'Retirement',   members:['ppf','epf','nps','retire'],    color:'var(--series-3)', defaultReturn: 8 },
  { key:'gold',       label:'Gold & Silver',members:['gold'],               color:'var(--series-4)', defaultReturn: 8 },
  { key:'realestate', label:'Real Estate',  members:['land'],               color:'var(--series-5)', defaultReturn: 6 },
  { key:'crypto',     label:'Crypto',       members:['crypto'],             color:'var(--series-6)', defaultReturn: 0 },
];
const ASSET_TYPE_LABELS = { cash:'Bank & Cash', ppf:'PPF', epf:'EPF', nps:'NPS', retire:(window.CorpusCountry && CorpusCountry.get().retire ? CorpusCountry.get().retire.label : 'Retirement accounts'), fd:'Fixed Deposits', rd:'Recurring Deposits', stocks:'Stocks', mf:'Mutual Funds', gold:'Gold & Silver', crypto:'Crypto', bonds:'Bonds', land:'Land & Property' };

function groupIntoClasses(assetBuckets){
  return ASSET_CLASSES.map(cls => ({
    ...cls,
    value: cls.members.reduce((s, m) => s + (assetBuckets[m] || 0), 0),
    breakdown: cls.members.map(m => ({ key: m, label: ASSET_TYPE_LABELS[m], value: assetBuckets[m] || 0 }))
  }));
}

// Every holding that has a cost basis, with its gain or loss, for the gains chart.
function listHoldingGains(c){
  const rows = [];
  const add = (arr, type) => arr.forEach(e => {
    const invested = Number(e.invested) || 0;
    if(invested <= 0) return;
    rows.push({ label: e.name || ASSET_TYPE_LABELS[type], type: ASSET_TYPE_LABELS[type], invested, value: e.currentValue || 0, gain: (e.currentValue || 0) - invested });
  });
  add(c.stocks,'stocks'); add(c.mf,'mf'); add(c.gold,'gold'); add(c.crypto,'crypto');
  add(c.bonds,'bonds'); add(c.land,'land'); add(c.ppf,'ppf'); add(c.epf,'epf'); add(c.nps,'nps');
  add(c.fd,'fd'); add(c.rd,'rd');
  return rows.sort((a,b) => b.gain - a.gain);
}

/* Projects assets, liabilities and net worth forward year by year.
   Each class grows at its own assumed rate, loans run down on their
   real EMI schedule, other debts are held flat (they have no schedule),
   and an optional monthly investment is added to equity. */
function projectNetWorth(years, returns, monthlyInvest){
  const s = computeSummary();
  const out = [];
  for(let y = 0; y <= years; y++){
    let assets = 0;
    s.classTotals.forEach(cls => {
      const r = (Number(returns[cls.key]) || 0) / 100;
      assets += cls.value * Math.pow(1 + r, y);
    });
    if(monthlyInvest > 0 && y > 0) assets += sipFutureValue(monthlyInvest, y, Number(returns.equity) || 0);
    let liabilities = s.totalDebts;
    s.c.loans.forEach(l => {
      const paid = Math.min((Number(l.paymentsMade) || 0) + y * 12, Number(l.tenureMonths) || 0);
      liabilities += loanBalance(Number(l.principal)||0, Number(l.rate)||0, Number(l.tenureMonths)||0, paid);
    });
    out.push({ year: y, assets, liabilities, netWorth: assets - liabilities });
  }
  return out;
}

// Upcoming dates worth a heads-up: deposit maturities and insurance renewals.
function upcomingEvents(withinDays){
  const c = getComputed();
  const now = new Date(); now.setHours(0,0,0,0);
  const limit = new Date(now.getTime() + withinDays * 864e5);
  const ev = [];
  const push = (date, title, detail, kind) => {
    if(!date) return;
    const d = new Date(date);
    if(isNaN(d) || d < now || d > limit) return;
    ev.push({ date, days: Math.round((d - now) / 864e5), title, detail, kind });
  };
  c.fd.forEach(e => push(e.maturityDate, `${e.name || 'Fixed deposit'} matures`, `About ${fmtMoney(e.maturity)} at maturity`, 'maturity'));
  c.rd.forEach(e => push(e.maturityDate, `${e.name || 'Recurring deposit'} matures`, `About ${fmtMoney(e.maturity)} at maturity`, 'maturity'));
  c.insurance.forEach(e => push(e.renewalDate, `${e.name || 'Policy'} renews`, `${fmtMoney(e.premium)} premium`, 'renewal'));
  return ev.sort((a,b) => a.days - b.days);
}

/* ===========================================================
   Financial health score, out of 100
   Five plain checks worth 20 points each. Every check returns its
   points, a status line and one thing to do, so the score is never
   a black box.
=========================================================== */
function healthScore(){
  const s = computeSummary();
  const data = loadData();
  const st = data.settings || {};
  const profile = st.insuranceProfile || {};
  const budget = data.budget || { items: [] };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const parts = [];

  // 1. Emergency fund: months of expenses held in deposits and liquid funds
  const budgetSpend = (budget.items || []).filter(i => i.type !== 'savings').reduce((a, i) => a + (Number(i.amount) || 0), 0);
  const monthly = Number(st.monthlyExpense) || budgetSpend || 0;
  const liquid = s.assetBuckets.cash + s.assetBuckets.fd + s.assetBuckets.rd;
  if(monthly > 0){
    const months = liquid / monthly;
    parts.push({ key:'emergency', label:'Emergency fund', points: Math.round(clamp(months / 6, 0, 1) * 20),
      status: `${months.toFixed(1)} months of expenses in bank and deposits`,
      tip: months >= 6 ? 'Six months or more set aside. Well done.' : `Build this up to about ${fmtCompact(monthly * 6)}, six months of spending.`, link: 'calculators.html#plan' });
  }else{
    parts.push({ key:'emergency', label:'Emergency fund', points: 0, missing: true,
      status: 'Monthly expenses not set', tip: 'Add your monthly expenses in Settings or Budget so this can be checked.', link: 'budget.html' });
  }

  // 2. Debt load
  if(s.totalAssets > 0 || s.totalLiabilities > 0){
    const ratio = s.totalAssets > 0 ? s.totalLiabilities / s.totalAssets : 1;
    let pts = Math.round(clamp((0.6 - ratio) / 0.5, 0, 1) * 20);
    const costly = (s.c.debts || []).some(d => Number(d.rate) >= 20 && Number(d.amount) > 0);
    if(costly) pts = Math.max(0, pts - 6);
    parts.push({ key:'debt', label:'Debt load', points: pts,
      status: `Debts are ${(ratio * 100).toFixed(0)}% of what you own${costly ? ', including high-interest debt' : ''}`,
      tip: costly ? 'Clear any card or high-interest debt first, it costs more than most investments earn.' : ratio <= 0.3 ? 'A comfortable level of debt.' : 'Try to bring debts below a third of your assets.', link: 'liabilities.html#payoff' });
  }else{
    parts.push({ key:'debt', label:'Debt load', points: 0, missing: true, status: 'Nothing added yet', tip: 'Add your assets and any loans.', link: 'assets.html' });
  }

  // 3. Savings rate, from the budget
  const income = Number(budget.income) || 0;
  if(income > 0 && (budget.items || []).length){
    const spend = (budget.items || []).filter(i => i.type !== 'savings').reduce((a, i) => a + (Number(i.amount) || 0), 0);
    const rate = Math.max(0, (income - spend) / income);
    parts.push({ key:'savings', label:'Savings rate', points: Math.round(clamp(rate / 0.3, 0, 1) * 20),
      status: `You keep ${(rate * 100).toFixed(0)}% of your income`,
      tip: rate >= 0.3 ? 'Saving 30% or more puts you well ahead.' : rate >= 0.2 ? 'Good. Pushing towards 30% speeds up every goal.' : 'Aim to save at least 20% of take-home pay.', link: 'budget.html' });
  }else{
    parts.push({ key:'savings', label:'Savings rate', points: 0, missing: true, status: 'No budget yet', tip: 'Fill in a monthly budget to see your savings rate.', link: 'budget.html' });
  }

  // 4. Insurance
  const pols = s.c.insurance || [];
  const has = (cat) => pols.some(p => p.category === cat && Number(p.sumInsured) > 0);
  const dependents = Number(profile.dependents) || 0;
  const needsTerm = dependents > 0 || s.totalLoans > 0;
  const insPts = (has('health') ? 10 : 0) + (!needsTerm || has('life') ? 10 : 0);
  parts.push({ key:'insurance', label:'Insurance', points: insPts,
    status: [has('health') ? 'Health cover on record' : 'No health cover', needsTerm ? (has('life') ? 'term cover on record' : 'no term cover') : 'term cover not essential yet'].join(', '),
    tip: insPts === 20 ? 'Both basics are covered. Check the amounts once a year.' : 'Work out how much cover fits you on the Insurance page.', link: 'insurance.html' });

  // 5. Diversification
  if(s.totalAssets > 0){
    const top = [...s.classTotals].sort((a, b) => b.value - a.value)[0];
    const share = top.value / s.totalAssets;
    parts.push({ key:'spread', label:'Diversification', points: Math.round(clamp((0.85 - share) / 0.45, 0, 1) * 20),
      status: `${top.label} is ${(share * 100).toFixed(0)}% of your assets`,
      tip: share <= 0.4 ? 'No single class dominates.' : `Consider spreading new money beyond ${top.label.toLowerCase()}.`, link: 'charts.html#allocation' });
  }else{
    parts.push({ key:'spread', label:'Diversification', points: 0, missing: true, status: 'Nothing added yet', tip: 'Add your assets to check how spread out they are.', link: 'assets.html' });
  }

  const total = parts.reduce((a, p) => a + p.points, 0);
  const band = total >= 75 ? 'Strong' : total >= 50 ? 'Fair' : 'Needs work';
  return { total, band, parts, missing: parts.filter(p => p.missing).length };
}

/* ---------- tax deadlines (individuals) ----------
   Advance tax: 15 Jun, 15 Sep, 15 Dec, 15 Mar (15/45/75/100%), only if tax
   after TDS is ₹10,000 or more. ITR: 31 July for ITR-1/2, 31 August for
   ITR-3/4 without audit (split from Budget 2026). For AY 2026-27 the audit
   case date was extended to 21 November 2026. 31 March closes the year
   for old-regime tax-saving investments. Checked October 2026. */
function taxDeadlines(fromDate, withinDays){
  if(window.CorpusCountry && !CorpusCountry.isIndia()){
    const now0 = new Date(fromDate || Date.now()); now0.setHours(0,0,0,0);
    const P = CorpusCountry.get();
    return CorpusCountry.deadlines(P.code, now0, withinDays).map(e => {
      const iso = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, '0')}-${String(e.date.getDate()).padStart(2, '0')}`;
      return { date: iso, title: e.label, detail: `${P.name} · ${P.taxYear}`, kind: 'tax', days: Math.round((e.date - now0) / 864e5) };
    });
  }
  const now = new Date(fromDate || Date.now()); now.setHours(0,0,0,0);
  const limit = new Date(now.getTime() + withinDays * 864e5);
  const out = [];
  const yearly = [
    [5, 15, 'Advance tax, first instalment', '15% of the year\'s tax, if your tax after TDS is ₹10,000 or more'],
    [8, 15, 'Advance tax, second instalment', '45% of the year\'s tax paid by now'],
    [11, 15, 'Advance tax, third instalment', '75% of the year\'s tax paid by now'],
    [2, 15, 'Advance tax, final instalment', '100% of the year\'s tax paid by now'],
    [2, 31, 'Last day for tax-saving investments', '80C, 80D and NPS payments count for this financial year only if made by today (old regime)'],
    [6, 31, 'Income tax return due (ITR-1 and ITR-2)', 'Salaried, pension, capital gains and other non-business income'],
    [7, 31, 'Income tax return due (ITR-3 and ITR-4)', 'Business or professional income without a tax audit'],
  ];
  for(let y = now.getFullYear(); y <= now.getFullYear() + 1; y++){
    yearly.forEach(([m, d, title, detail]) => {
      const dt = new Date(y, m, d);
      const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      if(dt >= now && dt <= limit) out.push({ date: iso, title, detail, kind: 'tax' });
    });
  }
  const audit = new Date(2026, 10, 21);
  if(audit >= now && audit <= limit) out.push({ date: '2026-11-21', title: 'Income tax return due, audited accounts', detail: 'Extended for AY 2026-27, only if your accounts are audited', kind: 'tax' });
  return out.map(e => { const [yy, mm, dd] = e.date.split('-').map(Number); return { ...e, days: Math.round((new Date(yy, mm - 1, dd) - now) / 864e5) }; });
}

// Everything worth a heads-up, deposits, renewals and tax dates, soonest first.
function allUpcoming(withinDays){
  const base = upcomingEvents(withinDays);
  return [...base, ...taxDeadlines(null, withinDays)].sort((a, b) => a.days - b.days);
}

// Builds a standard .ics calendar file so reminders open in Google Calendar,
// Outlook or the phone's calendar. All-day events with a reminder the day before.
function buildIcs(events){
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = new Date(); const dtstamp = `${stamp.getUTCFullYear()}${pad(stamp.getUTCMonth()+1)}${pad(stamp.getUTCDate())}T${pad(stamp.getUTCHours())}${pad(stamp.getUTCMinutes())}00Z`;
  const esc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Corpus//Reminders//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  events.forEach((e, i) => {
    const d = e.date.replace(/-/g, '');
    const next = new Date(e.date); next.setDate(next.getDate() + 1);
    const d2 = `${next.getFullYear()}${pad(next.getMonth()+1)}${pad(next.getDate())}`;
    lines.push('BEGIN:VEVENT', `UID:corpus-${d}-${i}-${(e.title || '').length}@local`, `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${d2}`, `SUMMARY:${esc(e.title)}`, `DESCRIPTION:${esc(e.detail)}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(e.title)}`, 'TRIGGER:-P1D', 'END:VALARM', 'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function downloadFile(name, text, type){
  const blob = new Blob([text], { type: type || 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- debt payoff: avalanche vs snowball ----------
   Every debt gets its minimum each month; the extra amount goes to one
   target. Avalanche targets the highest rate, snowball the smallest
   balance. When a debt is cleared its payment rolls onto the next. */
function simulatePayoff(debts, extra, strategy, rollover){
  if(rollover === undefined) rollover = true;
  let list = debts.map(d => ({ ...d, bal: d.balance })).filter(d => d.bal > 0.5);
  let month = 0, interest = 0;
  const order = [];
  const pool = list.reduce((a, d) => a + d.min, 0) + extra;
  while(list.length && month < 600){
    month++;
    list.forEach(d => { const i = d.bal * d.rate / 1200; d.bal += i; interest += i; });
    list.sort(strategy === 'snowball' ? (a, b) => a.bal - b.bal : (a, b) => b.rate - a.rate || a.bal - b.bal);
    // without rollover each debt only ever gets its own minimum (the 'do nothing extra' baseline)
    let budget = rollover ? pool : 0;
    list.forEach(d => { const pay = Math.min(d.min, d.bal); d.bal -= pay; budget -= pay; });
    if(!rollover) budget = 0;
    for(const d of list){ if(budget <= 0) break; const pay = Math.min(budget, d.bal); d.bal -= pay; budget -= pay; }
    list = list.filter(d => { if(d.bal <= 0.5){ order.push({ name: d.name, month }); return false; } return true; });
  }
  return { months: month, interest, order, finished: !list.length };
}

function payoffDebts(){
  const c = getComputed();
  return [
    ...c.loans.filter(l => l.balance > 0).map(l => ({ name: l.name || 'Loan', balance: l.balance, rate: Number(l.rate) || 0, min: l.monthlyEmi })),
    ...c.debts.filter(d => Number(d.amount) > 0).map(d => ({ name: d.name || 'Debt', balance: Number(d.amount), rate: Number(d.rate) || 0, min: Number(d.minPayment) || Math.max(500, Number(d.amount) * 0.03) })),
  ];
}
