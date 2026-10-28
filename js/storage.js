/* ===========================================================
   CO₹PU$ — storage layer
   Everything lives in the browser's localStorage, under one
   key. Nothing is ever sent to a server. Export/Import lets a
   person move their data between devices as a plain file.
=========================================================== */

const STORE_KEY = 'corpus_data_v1';
const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$', SGD: 'S$', AED: 'AED ', NZD: 'NZ$' };

function defaultData(){
  return {
    cash: [],
    ppf: [],
    epf: [],
    nps: [],
    retire: [],
    fd: [],
    rd: [],
    stocks: [],
    mf: [],
    gold: [],
    crypto: [],
    bonds: [],
    land: [],
    rental: [],
    insurance: [],
    loans: [],
    debts: [],
    goals: [],
    history: [],
    income: {},
    importLog: [],
    budget: { income: '', items: [] },
    settings: {
      currency: 'INR',
      alphaVantageKey: '',
      finnhubKey: '',
      eodhdKey: '',
      priceProvider: 'alphavantage',
      monthlyExpense: '',
      age: '',
      country: '',
      inflationAssumption: 6
    },
    auditInputs: {
      cashDepositsYear: '',
      cashLoanSingle: '',
      mfPurchaseYear: '',
      propertyPurchaseYear: '',
      foreignRemittanceYear: '',
      eightyCInvestment: '',
      otherTaxableIncome: '',
      taxSlabRate: 30,
      isSeniorCitizen: false
    }
  };
}

// Until someone picks a country, money is shown in the currency of the country guessed from their time zone.
function withCountryCurrency(d){
  if(!d || !d.settings || typeof window === 'undefined' || !window.CorpusCountry) return d;
  try{
    // a country page (for example /ca/) always shows its own currency
    const pc = document.documentElement.getAttribute('data-page-country');
    if(pc && window.CorpusCountry.DATA[pc]) d.settings.currency = window.CorpusCountry.DATA[pc].currency;
    else if(!d.settings.country) d.settings.currency = window.CorpusCountry.get().currency;
  }catch(e){}
  return d;
}

function loadData(){
  const raw = localStorage.getItem(STORE_KEY);
  if(!raw) return withCountryCurrency(defaultData());
  try{
    const parsed = JSON.parse(raw);
    // fill in any missing keys for people upgrading from an older version
    const base = defaultData();
    return withCountryCurrency({
      ...base, ...parsed,
      settings: { ...base.settings, ...(parsed.settings||{}) },
      income: { ...(parsed.income||{}) },
      auditInputs: { ...base.auditInputs, ...(parsed.auditInputs||{}) }
    });
  }catch(e){
    console.error('Could not read saved data, starting fresh.', e);
    return defaultData();
  }
}

function saveData(data){
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function uid(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

function addEntry(bucket, entry){
  const data = loadData();
  entry.id = uid();
  data[bucket].push(entry);
  saveData(data);
  return data;
}

function removeEntry(bucket, id){
  const data = loadData();
  data[bucket] = data[bucket].filter(e => e.id !== id);
  saveData(data);
  return data;
}

function updateEntry(bucket, id, patch){
  const data = loadData();
  data[bucket] = data[bucket].map(e => e.id === id ? { ...e, ...patch } : e);
  saveData(data);
  return data;
}

function updateSettings(patch){
  const data = loadData();
  data.settings = { ...data.settings, ...patch };
  saveData(data);
  return data;
}

// One net worth snapshot per day, kept only in this browser, so the
// dashboard and charts can show how things have moved over time.
// The date in the person's own timezone as YYYY-MM-DD (toISOString would give UTC,
// which is the previous day in India before 5:30 am).
function localISO(d){
  d = d ? new Date(d) : new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function recordHistorySnapshot(snapshot){
  const data = loadData();
  const today = localISO();
  const entry = { date: today, ...snapshot };
  const idx = data.history.findIndex(h => h.date === today);
  if(idx >= 0) data.history[idx] = entry; else data.history.push(entry);
  data.history.sort((a,b) => a.date.localeCompare(b.date));
  if(data.history.length > 1500) data.history = data.history.slice(-1500);
  saveData(data);
  return data.history;
}

// Short money format for chart axes and tiles: ₹1.2 Cr, ₹45 L, ₹12K
function fmtCompact(n, currency){
  currency = currency || (loadData().settings.currency) || 'INR';
  const sym = CURRENCY_SYMBOLS[currency] || '';
  const v = Number(n) || 0, a = Math.abs(v), sign = v < 0 ? '-' : '';
  const trim = (x) => (Math.round(x * 10) / 10).toString();
  if(currency === 'INR'){
    if(a >= 1e7) return `${sign}${sym}${(Math.round(a / 1e7 * 100) / 100).toString()} Cr`;
    if(a >= 1e5) return `${sign}${sym}${trim(a/1e5)} L`;
    if(a >= 1e3) return `${sign}${sym}${trim(a/1e3)}K`;
    return `${sign}${sym}${Math.round(a)}`;
  }
  if(a >= 1e9) return `${sign}${sym}${trim(a/1e9)}B`;
  if(a >= 1e6) return `${sign}${sym}${trim(a/1e6)}M`;
  if(a >= 1e3) return `${sign}${sym}${trim(a/1e3)}K`;
  return `${sign}${sym}${Math.round(a)}`;
}

function escapeHtml(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function updateAuditInputs(patch){
  const data = loadData();
  data.auditInputs = { ...data.auditInputs, ...patch };
  saveData(data);
  return data;
}

function exportData(){
  const data = loadData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `corpus-backup-${localISO()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importData(file, onDone){
  const reader = new FileReader();
  reader.onload = (e) => {
    try{
      const parsed = JSON.parse(e.target.result);
      const base = defaultData();
      const merged = {
        ...base, ...parsed,
        settings: { ...base.settings, ...(parsed.settings||{}) },
        auditInputs: { ...base.auditInputs, ...(parsed.auditInputs||{}) }
      };
      saveData(merged);
      onDone(true);
    }catch(err){
      console.error(err);
      onDone(false);
    }
  };
  reader.readAsText(file);
}

function clearAllData(){
  localStorage.removeItem(STORE_KEY);
}

function showToast(msg){
  let t = document.querySelector('.toast');
  if(!t){
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function fmtMoney(n, currency){
  currency = currency || (loadData().settings.currency) || 'INR';
  const symbols = CURRENCY_SYMBOLS;
  const sym = symbols[currency] || '';
  const num = Number(n) || 0;
  // Keep decimals when they're meaningful (prices, per-gram or per-unit
  // values), but don't clutter a round net worth figure with ".00".
  const hasDecimals = Math.abs(num % 1) > 0.001;
  const fixedStr = Math.abs(num).toFixed(hasDecimals ? 2 : 0);
  const [intPart, decPart] = fixedStr.split('.');
  let intStr;
  if(currency === 'INR'){
    intStr = indianGrouping(Number(intPart));
  }else{
    intStr = Number(intPart).toLocaleString('en-US');
  }
  return (num < 0 ? '-' : '') + sym + intStr + (decPart ? '.' + decPart : '');
}

// Animates a number counting up to its final value, used for the
// headline stats on the dashboard. Respects reduced-motion preferences.
function animateCountUp(el, endValue, formatFn, duration){
  duration = duration || 800;
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    el.textContent = formatFn(endValue);
    return;
  }
  const start = performance.now();
  const from = 0;
  function tick(now){
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const current = from + (endValue - from) * eased;
    el.textContent = formatFn(current);
    if(t < 1) requestAnimationFrame(tick);
    else el.textContent = formatFn(endValue);
  }
  requestAnimationFrame(tick);
}

// For per-unit prices (a NAV, a share price, a price per gram) where
// rounding to the nearest whole rupee would throw away the number that
// actually matters. Totals and aggregates should keep using fmtMoney.
function fmtMoneyPrecise(n, currency){
  currency = currency || (loadData().settings.currency) || 'INR';
  const symbols = CURRENCY_SYMBOLS;
  const sym = symbols[currency] || '';
  const num = Number(n) || 0;
  const abs = Math.abs(num);
  // very small unit prices (some crypto) need more than 2 decimals or they'd show as 0
  const decimals = abs > 0 && abs < 1 ? 6 : 2;
  const fixed = abs.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const grouped = currency === 'INR' ? indianGrouping(Number(intPart)) : Number(intPart).toLocaleString('en-US');
  return (num < 0 ? '-' : '') + sym + grouped + '.' + decPart;
}

function indianGrouping(n){
  const s = String(n);
  if(s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
}
