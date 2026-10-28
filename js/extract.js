/* ===========================================================
   CO₹PU$ — document understanding
   Pure rules, no AI service: keyword scoring decides what a file is,
   then a matching extractor pulls out the numbers. Every result is
   shown to the person for checking before anything is saved.
   Identity numbers (PAN, UAN, account numbers) are never kept.
=========================================================== */
(function(){
  const API = { dateOrder: 'dmy', extra: {}, salaryWords: null };
  /* ---------- number and date parsing ---------- */
  function parseAmount(s){
    if(s == null) return null;
    if(typeof s === 'number') return isFinite(s) ? s : null;
    let t = String(s).trim();
    if(!t) return null;
    let neg = false;
    if(/^\(.*\)$/.test(t)){ neg = true; t = t.slice(1, -1); }
    if(/\bdr\.?$/i.test(t)){ neg = true; }
    t = t.replace(/(rs\.?|inr|₹|\/-|\bcr\.?$|\bdr\.?$)/gi, '').replace(/\s/g, '');
    if(/^-/.test(t)){ neg = !neg; t = t.slice(1); }
    if(/-$/.test(t)){ neg = !neg; t = t.slice(0, -1); }
    // "20.000.00" from OCR: keep only the last dot as the decimal point
    const dots = (t.match(/\./g) || []).length;
    if(dots > 1){ const i = t.lastIndexOf('.'); t = t.slice(0, i).replace(/\./g, '') + t.slice(i); }
    t = t.replace(/,/g, '');
    if(!/^\d+(\.\d+)?$/.test(t)) return null;
    const n = Number(t);
    return neg ? -n : n;
  }
  const MONTHS = { jan:1, feb:2, mar:3, apr:4, may:5, jun:6, jul:7, aug:8, sep:9, sept:9, oct:10, nov:11, dec:12,
    january:1, february:2, march:3, april:4, june:6, july:7, august:8, september:9, october:10, november:11, december:12 };
  const pad = (n) => String(n).padStart(2, '0');
  function yy(y){ y = Number(y); return y < 100 ? (y > 70 ? 1900 + y : 2000 + y) : y; }
  function validDate(y, m, d){ return y > 1970 && y < 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31; }
  function parseDate(s){
    if(s == null) return null;
    const t = String(s).trim();
    let m;
    if((m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return validDate(+m[1], +m[2], +m[3]) ? `${m[1]}-${pad(m[2])}-${pad(m[3])}` : null;
    if((m = t.match(/^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{2,4})\b/))){
      const y = yy(m[3]); let d = +m[1], mo = +m[2];
      if(API.dateOrder === 'mdy' && +m[1] <= 12){ d = +m[2]; mo = +m[1]; }
      return validDate(y, mo, d) ? `${y}-${pad(mo)}-${pad(d)}` : null;
    }
    if((m = t.match(/^(\d{1,2})[\-\/ ]?([A-Za-z]{3,9})[\-\/ ,']*(\d{2,4})\b/))){ const mo = MONTHS[m[2].toLowerCase()]; const y = yy(m[3]); return mo && validDate(y, mo, +m[1]) ? `${y}-${pad(mo)}-${pad(m[1])}` : null; }
    if((m = t.match(/^([A-Za-z]{3,9})[ \-](\d{1,2}),?[ \-](\d{4})\b/))){ const mo = MONTHS[m[1].toLowerCase()]; return mo && validDate(+m[3], mo, +m[2]) ? `${m[3]}-${pad(mo)}-${pad(m[2])}` : null; }
    if(/^\d{5}(\.\d+)?$/.test(t)){ const n = Number(t); if(n > 30000 && n < 70000){ const d = new Date(Math.round((n - 25569) * 864e5)); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; } }
    return null;
  }
  // Money-like tokens in a line, after removing section numbers, dates and years
  function moneyTokens(line, strict){
    let t = ' ' + line + ' ';
    t = t.replace(/\b\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b/g, ' ')
         .replace(/\b\d{1,2}[\- ]?[A-Za-z]{3,9}[\- ,]*\d{2,4}\b/g, ' ')
         .replace(/\b(19|20)\d{2}\s*[-–]\s*\d{2,4}\b/g, ' ')
         .replace(/\b(?:section|sec\.?|u\/s|rule|form(?: no\.?)?)\s*[0-9][0-9A-Za-z()]*/gi, ' ')
         .replace(/\b\d{1,3}[A-Z]{1,5}(\([0-9A-Za-z]+\))*/g, ' ')
         .replace(/\b\d+(\([0-9A-Za-z]+\))+/g, ' ')
         .replace(/\b[A-Z]{4,5}\d{4,5}[A-Z]\b/g, ' ');
    const re = /(?:₹|rs\.?|inr)?\s*\(?-?(?:\d{1,3}(?:,\d{2,3})+|\d+)(?:\.\d{1,2})?\)?(?:\s?(?:cr|dr)\b)?/gi;
    const out = [];
    let m;
    while((m = re.exec(t))){
      const raw = m[0].trim();
      if(strict && !/\.\d{2}\b|,\d{3}/.test(raw)) continue; // bank statements always print paise or grouping
      const v = parseAmount(raw);
      if(v == null) continue;
      if(!strict && Math.abs(v) < 10 && !/\./.test(raw)) continue;   // footnote numbers like (1), 2
      out.push(v);
    }
    return out;
  }
  const lastMoney = (line, strict) => { const a = moneyTokens(line, strict); return a.length ? a[a.length - 1] : null; };
  const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const sum = (a) => a.reduce((x, y) => x + (Number(y) || 0), 0);
  const round = (n) => Math.round(n);

  /* financial year (April to March) a date belongs to, as "2026-27" */
  function fyOf(iso){ const y = +iso.slice(0, 4), m = +iso.slice(5, 7); const s = m >= 4 ? y : y - 1; return `${s}-${String(s + 1).slice(2)}`; }
  function currentFy(){ const d = new Date(); return fyOf(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`); }

  /* ---------- table header finder ---------- */
  function findHeader(rows, spec, maxScan){
    let best = null;
    for(let i = 0; i < Math.min(rows.length, maxScan || 40); i++){
      const r = rows[i] || [];
      const cols = {}; let hits = 0;
      for(const [key, re] of Object.entries(spec)){
        for(let c = 0; c < r.length; c++){
          const cell = norm(r[c]);
          if(cell && cell.length < 60 && re.test(cell) && !Object.values(cols).includes(c)){ cols[key] = c; hits++; break; }
        }
      }
      if(!best || hits > best.hits) best = { index: i, cols, hits };
    }
    return best;
  }

  /* ---------- detection ---------- */
  const SIGNS = {
    payslip: [/pay\s*slip|salary\s*slip|payslip|pay\s*statement|salary statement/i, /earnings?/i, /deductions?/i, /net\s*(pay|salary|amount)|take\s*home/i, /\bbasic\b/i, /house rent|\bhra\b/i, /provident|\bpf\b/i, /prof(essional|\.)?\s*tax/i, /pay\s*period|for the month|month of|salary for/i, /days (paid|worked)|paid days|lop/i],
    form16: [/form\s*(no\.?)?\s*16\b/i, /certificate under section 203|section 395/i, /\bpart\s*b\b/i, /17\s*\(\s*1\s*\)/, /gross total income/i, /chapter\s*vi-?a/i, /tan of (the )?deductor|tan of employer/i, /assessment year|tax year/i, /standard deduction/i, /115bac|opting out/i],
    bank: [/statement of account|account statement|bank statement|transaction history|passbook/i, /opening balance/i, /closing balance/i, /withdrawal|debit/i, /deposit|credit/i, /narration|particulars|description/i, /ifsc|branch/i, /value date|txn date|transaction date/i],
    cas: [/consolidated account statement|\bcas\b/i, /\bcams\b|kfin|karvy/i, /folio\s*(no|number)/i, /closing unit balance/i, /\bnav\b/i, /market value/i, /isin/i],
    tds26as: [/form\s*26as|annual tax statement|annual information statement|\bais\b|taxpayer information summary/i, /deductor|tan of deductor/i, /\b194\s?j|\b194\s?c|\b192\b|\b393\b|\b194\s?a/i, /tax deducted|tds deposited|amount paid\s*\/\s*credited/i],
    holdings: [/holdings?/i, /\bisin\b/i, /quantity|qty/i, /avg\.?\s*(price|cost)|average (buy )?price/i, /ltp|last traded|closing price|current price|market value/i, /symbol|instrument|scrip|stock name/i],
    epf: [/employees'? provident fund organi[sz]ation|epfo/i, /member passbook|passbook/i, /\buan\b/i, /employee share|employer share|pension contribution|ee share|er share/i, /cont\.?\s*for due-?month|due month/i],
    invoices: [/invoice/i, /client|customer|billed to|party/i, /\btds\b/i, /\bgst|igst|cgst|sgst/i, /amount|fee|value/i, /receipt|received|paid/i],
  };
  function detect(doc){
    const text = doc.text || '';
    const head = text.slice(0, 6000);
    const scores = {};
    for(const [type, list] of Object.entries(SIGNS)) scores[type] = list.reduce((s, re) => s + (re.test(type === 'bank' || type === 'cas' || type === 'tds26as' ? text.slice(0, 20000) : head) ? 1 : 0), 0);
    // structure counts as much as words
    const tbl = bestTable(doc);
    if(tbl){
      if(findBankHeader(tbl.rows)) scores.bank += 4;
      const h = findHoldingsHeader(tbl.rows); if(h) scores.holdings += 3;
      if(findInvoiceHeader(tbl.rows)) scores.invoices += 3;
    }
    const dateLines = (doc.lines || []).filter(l => parseDate(l.split(/\s+/)[0]) || parseDate(l.slice(0, 11))).length;
    if(dateLines > 8 && moneyTokens(text.slice(0, 30000), true).length > 20) scores.bank += 2;
    if(/closing unit balance/i.test(text)) scores.cas += 4;
    if(/form\s*26as|annual information statement/i.test(head)) scores.tds26as += 3;
    if(/form\s*(no\.?)?\s*16\b/i.test(head)) scores.form16 += 3;
    if(/pay\s*slip|payslip|salary slip/i.test(head)) scores.payslip += 2;
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return { type: ranked[0][1] >= 3 ? ranked[0][0] : null, ranked, scores };
  }
  function bestTable(doc){
    if(!doc.tables || !doc.tables.length) return null;
    return doc.tables.slice().sort((a, b) => b.rows.length - a.rows.length)[0];
  }

  /* ---------- payslip ---------- */
  const PAY_FIELDS = [
    // order matters: specific before general
    ['employerPf', /employer'?s?\s*(contribution\s*(to|towards)\s*)?(pf|p\.f|provident|epf)|(pf|provident fund).*employer|er\.?\s*pf/i, 'employer'],
    ['employerNps', /employer'?s?\s*(contribution\s*(to|towards)\s*)?nps|nps.*employer|80\s*ccd\s*\(\s*2\s*\)/i, 'employer'],
    ['gross', /^(gross|total)\s*(earnings?|salary|pay|income|wages)|^gross$/i, 'total'],
    ['totalDed', /^total\s*deductions?|^deductions?\s*total|^gross deductions?/i, 'total'],
    ['net', /^net\s*(pay|salary|amount|payable|take ?home|earnings)|take\s*home|amount (credited|transferred)|^net$/i, 'total'],
    ['ctc', /\bctc\b|cost to (the )?company/i, 'meta'],
    ['basic', /^basic(\s*(salary|pay|wage))?$|^basic\b(?!.*(da|dearness))|^(regular|base|ordinary)\s*(pay|salary|earnings|hours|wages)?$|^salary$/i, 'earn'],
    ['social', /social security|oasdi|^medicare|fica|national insurance|^\s*ni\b|\bnic\b|\bcpp\b|\bqpp\b|\bei\b|employment insurance|acc levy|earners'? levy/i, 'ded'],
    ['da', /dearness|^d\.?\s?a\.?$/i, 'earn'],
    ['hra', /house\s*rent|^h\.?r\.?a\.?\b/i, 'earn'],
    ['special', /special|spl\.?\s*allow|flexi|flexible/i, 'earn'],
    ['conveyance', /conveyance|transport\s*allow/i, 'earn'],
    ['lta', /\blta\b|leave travel/i, 'earn'],
    ['medical', /medical/i, 'earn'],
    ['bonus', /bonus|incentive|variable|performance pay|commission/i, 'earn'],
    ['overtime', /overtime|\bot\b/i, 'earn'],
    ['vpf', /\bvpf\b|voluntary/i, 'ded'],
    ['pf', /provident|\bp\.?f\.?\b|\bepf\b|401\s*\(?k\)?|403\s*\(?b\)?|pension|superannuation|kiwisaver|\bcpf\b|\brrsp\b|retirement/i, 'ded'],
    ['pt', /prof(essional|\.)?\s*tax|^p\.?\s?t\.?$|profession tax/i, 'ded'],
    ['tds', /income\s*tax|\btds\b|^i\.?\s?tax|tax deducted|federal\s*(income\s*)?(tax|withholding)|fed\s*w\/?h|^fit$|\bpaye\b|tax withheld|withholding tax|^payg/i, 'ded'],
    ['stateTax', /state\s*(income\s*)?tax|provincial\s*tax|^sit$|local tax|city tax/i, 'ded'],
    ['esi', /\besi\b|e\.s\.i|state insurance/i, 'ded'],
    ['nps', /\bnps\b/i, 'ded'],
    ['lwf', /labour welfare|\blwf\b/i, 'ded'],
    ['loan', /loan|advance\s*(recovery|deduction)|salary advance/i, 'ded'],
    ['daysPaid', /days\s*(paid|worked|payable)|paid\s*days|payable days/i, 'meta'],
    ['lop', /\blop\b|loss of pay|leave without pay/i, 'meta'],
  ];
  const PAY_LABELS = { social:'Social contributions', stateTax:'State or provincial tax', basic:'Basic', da:'Dearness allowance', hra:'HRA', special:'Special allowance', conveyance:'Conveyance', lta:'LTA', medical:'Medical', bonus:'Bonus or variable pay', overtime:'Overtime',
    pf:'Your PF', vpf:'Voluntary PF', pt:'Professional tax', tds:'Income tax (TDS)', esi:'ESI', nps:'Your NPS', lwf:'Labour welfare fund', loan:'Loan recovery',
    employerPf:'Employer PF', employerNps:'Employer NPS', gross:'Gross pay', totalDed:'Total deductions', net:'Net pay', ctc:'CTC (yearly)', daysPaid:'Days paid', lop:'Loss of pay days' };

  const NUMRUN = '(?:₹|Rs\\.?|INR)?\\s*\\(?-?(?:\\d{1,3}(?:[,.]\\d{2,3})+|\\d+)(?:\\.\\d{1,2})?\\)?';
  const PAIR_RE = new RegExp(`([A-Za-z][A-Za-z0-9 .&()\\/'’+\\-]*?[A-Za-z.)%])\\s*[:\\-–=]?\\s*(${NUMRUN}(?:\\s+${NUMRUN})*)(?=\\s|$)`, 'g');

  function extractPayslip(doc){
    const lines = doc.lines;
    const text = doc.text;
    const hasYtd = /\bytd\b|year to date|cumulative|upto (the )?month/i.test(text);
    const out = {}; const seen = {};
    lines.forEach(line => {
      let m; PAIR_RE.lastIndex = 0;
      while((m = PAIR_RE.exec(line))){
        let label = m[1].replace(/\s+/g, ' ').trim().replace(/[\s:\-]+$/, '');
        if(label.length > 48 || /^(rs|inr|no|nos|qty)$/i.test(label)) continue;
        if(/\b(ytd|year to date|cumulative)\b/i.test(label)) continue;
        if(/^(pan|uan|esic? (no|number)|account|a\/c|bank|ifsc|employee (id|no|code)|emp\.? (id|no|code)|mobile|phone|pin|date)\b/i.test(label)) continue;
        const nums = m[2].trim().split(/\s+(?=(?:₹|Rs|INR|\(|-)?\s*\d)/).map(parseAmount).filter(v => v != null);
        if(!nums.length) continue;
        const v = hasYtd ? nums[0] : nums[nums.length - 1];
        for(const [key, re] of PAY_FIELDS){
          if(re.test(label)){
            if(key === 'pf' && /employer|er\b/i.test(label)) break;
            if(key === 'tds' && /professional/i.test(label)) break;
            if(seen[key] == null){ out[key] = v; seen[key] = label; }
            break;
          }
        }
      }
    });
    // month of the payslip
    let month = null;
    const mm = text.match(/(?:pay\s*slip|salary\s*slip|payslip|pay\s*period|for the month(?: of)?|month(?: of)?|salary for|period)\s*[:\-]?\s*(?:of\s*)?([A-Za-z]{3,9})[\s,'\-]*(\d{2,4})/i)
           || text.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[\s,'\-]*((?:19|20)\d{2})\b/i);
    if(mm && MONTHS[mm[1].toLowerCase()]) month = `${yy(mm[2])}-${pad(MONTHS[mm[1].toLowerCase()])}`;
    else { const md = text.match(/(?:period|month)\s*[:\-]?\s*(\d{1,2})[\/\-](\d{4})/i); if(md) month = `${md[2]}-${pad(md[1])}`; }
    // employer: first line that looks like a company name
    const employer = (lines.slice(0, 12).find(l => /\b(pvt|private|ltd|limited|llp|inc|corporation|technologies|solutions|services|bank|industries|enterprises|labs|systems)\b/i.test(l) && l.length < 90) || '').replace(/\s{2,}.*/, '').trim();

    // fill gaps and sanity checks
    const earnKeys = ['basic','da','hra','special','conveyance','lta','medical','bonus','overtime'];
    const dedKeys = ['pf','vpf','pt','tds','stateTax','social','esi','nps','lwf','loan'];
    const earnSum = sum(earnKeys.map(k => out[k]));
    const dedSum = sum(dedKeys.map(k => out[k]));
    const notes = [];
    if(out.gross == null && earnSum > 0){ out.gross = earnSum; notes.push('Gross pay was not printed, so it is the total of the earnings found.'); }
    if(out.totalDed == null && dedSum > 0) out.totalDed = dedSum;
    if(out.net == null && out.gross != null && out.totalDed != null){ out.net = out.gross - out.totalDed; notes.push('Net pay was worked out as gross minus deductions.'); }
    if(out.gross != null && earnSum > 0 && out.gross - earnSum > 1) out.otherEarn = out.gross - earnSum;
    // PT is at most ₹2,500 a year, so a big figure is almost certainly something else
    if(out.pt > 2600) delete out.pt;
    let confidence = 'low';
    const checks = out.gross && out.net ? Math.abs((out.gross - (out.totalDed || 0)) - out.net) : null;
    const found = Object.keys(out).filter(k => PAY_LABELS[k]).length;
    if(out.basic && out.gross && out.net && checks != null && checks <= 2) confidence = 'high';
    else if(out.gross && out.net && found >= 4) confidence = 'medium';
    if(checks != null && checks > 2 && out.totalDed) notes.push(`Gross minus deductions comes to ${Math.round(out.gross - out.totalDed).toLocaleString('en-IN')}, not the printed net pay. Check the numbers below.`);
    if(out.basic && out.gross && out.basic > out.gross) { notes.push('Basic looks larger than gross pay, so one of them was probably misread.'); confidence = 'low'; }
    if(doc.ocr) notes.push('Read from an image, so check each figure against your payslip.');
    // annual CTC lines are sometimes monthly; if it is under 2x gross treat it as monthly
    if(out.ctc && out.gross && out.ctc < out.gross * 3) out.ctc = out.ctc * 12;
    return { type: 'payslip', month, employer, values: out, labelsFound: seen, confidence, notes };
  }

  /* ---------- Form 16 ---------- */
  const F16 = [
    ['salary171', /salary as per provisions contained in sec(tion)?\.?\s*17\s*\(\s*1\s*\)|17\s*\(\s*1\s*\)/i],
    ['perq172', /value of perquisites.*17\s*\(\s*2\s*\)|17\s*\(\s*2\s*\)/i],
    ['profit173', /profits in lieu of salary|17\s*\(\s*3\s*\)/i],
    ['grossSalary', /^\s*\(?d\)?\s*total|gross salary|total\s*\(?\s*a\s*\+\s*b\s*\+\s*c\s*\)?/i],
    ['hraExempt', /house rent allowance|10\s*\(\s*13a\s*\)/i],
    ['ltaExempt', /travel concession|10\s*\(\s*5\s*\)/i],
    ['totalExempt', /total amount of exemptions? claimed under section 10/i],
    ['stdDeduction', /standard deduction/i],
    ['ptax', /tax on employment|16\s*\(\s*iii\s*\)/i],
    ['salaryIncome', /income chargeable under the head\s*["“']?salaries/i],
    ['houseProperty', /income\s*\(?or admissible loss\)? from house property/i],
    ['otherSources', /income under the head other sources|income from other sources/i],
    ['grossTotal', /gross total income/i],
    ['d80c', /80\s*c\b(?!c)|life insurance premia, contribution to provident fund/i],
    ['d80ccd1b', /80\s*ccd\s*\(\s*1b\s*\)/i],
    ['d80ccd2', /80\s*ccd\s*\(\s*2\s*\)/i],
    ['d80d', /80\s*d\b|health insurance premia/i],
    ['d80tta', /80\s*tta|80\s*ttb/i],
    ['totalDeductions', /aggregate of deductible amount|total deductions? under chapter vi-?a|aggregate.*chapter vi-?a/i],
    ['taxableIncome', /^\s*\d*\.?\s*total taxable income|total income\s*\(/i],
    ['taxOnIncome', /^\s*\d*\.?\s*tax on total income/i],
    ['rebate87a', /rebate under section 87a|87a/i],
    ['surcharge', /surcharge/i],
    ['cess', /health and education cess|education cess/i],
    ['taxPayable', /^\s*\d*\.?\s*tax payable|net tax payable|tax payable\s*\(/i],
    ['tdsTotal', /total \(rs\.?\)|amount of tax deducted|tax deducted and deposited|total tax deducted/i],
  ];
  const F16_LABELS = { salary171:'Salary under 17(1)', perq172:'Perquisites 17(2)', profit173:'Profits in lieu 17(3)', grossSalary:'Gross salary', hraExempt:'HRA exemption', ltaExempt:'LTA exemption', totalExempt:'Total section 10 exemptions',
    stdDeduction:'Standard deduction', ptax:'Professional tax', salaryIncome:'Income from salary', houseProperty:'House property income', otherSources:'Other sources', grossTotal:'Gross total income',
    d80c:'80C', d80ccd1b:'80CCD(1B) own NPS', d80ccd2:'80CCD(2) employer NPS', d80d:'80D health insurance', d80tta:'80TTA / 80TTB', totalDeductions:'Total Chapter VI-A deductions', taxableIncome:'Total taxable income',
    taxOnIncome:'Tax on total income', rebate87a:'Rebate 87A', surcharge:'Surcharge', cess:'Cess', taxPayable:'Tax payable', tdsTotal:'Tax deducted (TDS)' };
  function extractForm16(doc){
    const lines = doc.lines; const v = {}; const notes = [];
    const amountNear = (i) => {
      for(let k = i; k <= Math.min(lines.length - 1, i + 2); k++){
        const a = moneyTokens(lines[k]).filter(x => Math.abs(x) >= 0);
        if(a.length) return a[a.length - 1];
        if(k > i && /[a-z]{4,}/i.test(lines[k]) && !/^\s*[\d,.\s₹rs]+$/i.test(lines[k])) break;
      }
      return null;
    };
    F16.forEach(([key, re]) => {
      for(let i = 0; i < lines.length; i++){
        if(re.test(lines[i])){
          // for deductions, Form 16 prints gross amount then deductible amount: the last is what counts
          const a = amountNear(i);
          if(a != null){ v[key] = a; break; }
        }
      }
    });
    const ay = doc.text.match(/assessment year\s*[:\-]?\s*(\d{4})\s*[-–]\s*(\d{2,4})/i);
    const ty = doc.text.match(/tax year\s*[:\-]?\s*(\d{4})\s*[-–]\s*(\d{2,4})/i);
    let fy = null;
    if(ty) fy = `${ty[1]}-${String(ty[2]).slice(-2)}`;
    else if(ay){ const s = Number(ay[1]) - 1; fy = `${s}-${String(s + 1).slice(2)}`; }
    const optOut = doc.text.match(/opt(ing|ed)? out of taxation u\/?s\.? 115bac\s*\(?1a\)?\s*\??\s*[:\-]?\s*(yes|no)/i);
    const regime = optOut ? (optOut[2].toLowerCase() === 'yes' ? 'old' : 'new') : null;
    const employer = (doc.lines.find(l => /name and address of the employer/i.test(l)) ? doc.lines[doc.lines.findIndex(l => /name and address of the employer/i.test(l)) + 1] : (doc.lines.find(l => /\b(pvt|private|ltd|limited|llp)\b/i.test(l)) || '')).replace(/\s{2,}.*/, '').trim();
    if(v.grossSalary == null && v.salary171 != null) v.grossSalary = sum([v.salary171, v.perq172, v.profit173]);
    if(v.grossSalary && v.salary171 && v.grossSalary < v.salary171) delete v.grossSalary;
    const found = Object.keys(v).length;
    const confidence = v.grossSalary && (v.taxableIncome || v.grossTotal) ? (found >= 8 ? 'high' : 'medium') : 'low';
    if(!doc.text.match(/part\s*b/i)) notes.push('Only Part A was found. Part B, with the salary breakup, is usually a separate PDF from your employer.');
    if(doc.ocr) notes.push('Read from an image, so check each figure against the form.');
    return { type: 'form16', fy, regime, employer, values: v, confidence, notes };
  }

  /* ---------- bank statements ---------- */
  const BANK_SPEC = {
    date: /^(s\.?\s*no\.?\s*)?(txn\.?|tran\.?|transaction|post(ing|ed)?|book(ing)?)?\s*date$|^date$|^dt\.?$|^txn date|^transaction date|^tran date|^value\s*(date|dt)$/,
    desc: /narration|description|particulars|remarks|details|transaction details|beneficiary|^memo$/,
    debit: /^(debit|withdrawals?|withdrawl|withdrawal amt\.?|withdrawal amount|dr\.?|debit amount|debit amt\.?|paid out|money out|amount debited|debits?\s*\(.*\))$|withdrawal/,
    credit: /^(credit|deposits?|deposit amt\.?|deposit amount|cr\.?|credit amount|credit amt\.?|paid in|money in|amount credited|credits?\s*\(.*\))$|deposit/,
    amount: /^(transaction )?amount|^txn amount|^amt\.?$/,
    type: /dr\s*\/\s*cr|cr\s*\/\s*dr|^type$|debit\s*\/\s*credit|^(txn|transaction) type$/,
    balance: /balance/,
  };
  function findBankHeader(rows){
    const h = findHeader(rows, BANK_SPEC, 60);
    if(!h) return null;
    const c = h.cols;
    if(c.date == null || c.desc == null) return null;
    if(!((c.debit != null && c.credit != null) || c.amount != null)) return null;
    return h;
  }
  // categories: [key, label, budgetLine, budgetType, regex] for money going out
  const OUT_CATS = [
    ['self', 'Transfers to your own accounts and FDs', 'Transfers to savings and FDs', 'savings', /\bself\b|own a\/?c|own account|sweep|fd booked|to fd|term deposit|\brd\b inst|recurring deposit|transfer to .*savings|ppf|sukanya/i],
    ['invest', 'SIPs and investments', 'SIPs and investments', 'savings', /\bsip\b|mutual fund|\bmf\b|bse star|nse ?mf|iccl|indian clearing|zerodha|groww|kuvera|upstox|paytm money|\bcoin\b|\bnps\b|elss|angel one|icici direct|hdfc sec|kotak sec|smallcase|dhan\b/i],
    ['emi', 'Loan EMIs', 'Loan EMIs', 'need', /\bemi\b|loan|nach.*(fin|bajaj|hdfc ltd|housing|capital)|ach d-.*(fin|loan|housing)|housing fin|home fin|lic hfl|pnb housing|bajaj fin|tata capital|hdb fin/i],
    ['rent', 'Rent and maintenance', 'Rent or home EMI', 'need', /\brent\b|nobroker|housing\.com|landlord|maintenance|society|apartment|nestaway|mygate|nobrokerhood/i],
    ['insurance', 'Insurance premiums', 'Insurance premiums', 'need', /\blic\b|insurance|premium|policy|hdfc life|icici pru|sbi life|max life|bajaj allianz|star health|niva bupa|care health|tata aig|acko|go digit|policybazaar/i],
    ['tax', 'Taxes', 'Taxes', 'need', /advance tax|self assessment tax|income tax|cbdt|tin-?nsdl|oltas|gst payment|challan|e-?pay tax/i],
    ['utilities', 'Electricity, phone, internet', 'Electricity, phone, internet', 'need', /electricity|bescom|mseb|mahadiscom|tpddl|bses|tneb|tangedco|kseb|uppcl|cesc|adani elec|torrent power|water|gas\b|igl|mgl|indane|bharatgas|hp gas|airtel|jio|vodafone|\bvi\b|bsnl|act fibernet|hathway|broadband|\bdth\b|tata play|recharge|postpaid|prepaid/i],
    ['groceries', 'Groceries and household', 'Groceries and household', 'need', /bigbasket|blinkit|zepto|instamart|dmart|d mart|avenue supermart|reliance (fresh|smart|retail)|jiomart|more retail|spencer|nature'?s basket|grocer|kirana|supermarket|milk|dairy|vegetable|ratnadeep|star bazaar|country delight/i],
    ['education', 'Education', 'School or college fees', 'need', /school|college|university|tuition|\bfees?\b|byju|unacademy|coursera|udemy|vedantu|upgrad|physicswallah/i],
    ['health', 'Health and medicines', 'Health and medicines', 'need', /hospital|pharma|apollo|medplus|1mg|pharmeasy|netmeds|clinic|diagnostic|\blabs?\b|practo|healthians|dental|doctor/i],
    ['transport', 'Transport and fuel', 'Transport and fuel', 'need', /uber|\bola\b|rapido|irctc|metro|fastag|petrol|fuel|hpcl|bpcl|iocl|indian oil|shell|parking|redbus|namma yatri|blusmart/i],
    ['eating', 'Eating out and entertainment', 'Eating out and entertainment', 'want', /swiggy|zomato|restaurant|cafe|starbucks|domino|mcdonald|\bkfc\b|pizza|eatclub|bookmyshow|pvr|inox|district|\bbar\b|brew|biryani|food/i],
    ['shopping', 'Shopping', 'Shopping', 'want', /amazon|flipkart|myntra|ajio|nykaa|meesho|tata cliq|croma|reliance digital|decathlon|ikea|lifestyle|westside|pantaloons|h&m|zara|uniqlo|lenskart|firstcry/i],
    ['travel', 'Travel', 'Travel', 'want', /makemytrip|goibibo|cleartrip|indigo|air india|vistara|akasa|spicejet|\boyo\b|airbnb|booking\.com|agoda|yatra|ixigo|easemytrip|thomas cook|hotel/i],
    ['subs', 'Subscriptions', 'Subscriptions', 'want', /netflix|spotify|hotstar|jiocinema|amazon prime|prime video|youtube|apple\.com|itunes|google play|adobe|microsoft|zee5|sonyliv|audible|chatgpt|openai|notion|canva|linkedin/i],
    ['card', 'Credit card bills', 'Credit card bills', 'want', /credit card|cc payment|card payment|\bcred\b|autopay.*card|billdesk.*card|card bill|cc bill/i],
    ['cash', 'Cash withdrawals', 'Cash withdrawals', 'want', /\batm\b|cash wd|cash withdrawal|\bnwd\b|\batw\b|cash wdl|self cheque|cash paid/i],
    ['charges', 'Bank charges', 'Bank charges', 'need', /charges|chgs|\bfee\b|gst on|sms alert|annual fee|min bal|penalty|amc\b/i],
  ];
  const IN_CATS = [
    ['salary', 'Salary', /salary|\bsal\b|sal cr|payroll|salaries|wages|stipend/i],
    ['interest', 'Interest', /int\.?\s*pd|interest|int cr|credit interest|sb int|int\.coll|\bint\b.*credit/i],
    ['dividend', 'Dividends', /dividend|\bdiv\b|ach c-.*div/i],
    ['refund', 'Refunds and cashback', /refund|reversal|cashback|reversed|chargeback|rev\b/i],
    ['self', 'Transfers from your own accounts', /\bself\b|own a\/?c|own account|sweep|fd closure|fd matur|from fd|redemption.*fd/i],
    ['redeem', 'Investment redemptions', /redemption|redeem|mf redemp|iccl|zerodha|groww|indian clearing/i],
    ['rentin', 'Rent received', /rent received|\brent\b/i],
    ['tax', 'Tax refunds', /cmp of ito|it refund|income tax refund|tax refund|cbdt/i],
  ];
  const payerName = (desc) => {
    let s = String(desc).toUpperCase().replace(/[0-9]{4,}/g, ' ').replace(/[^A-Z&. \/\-@]/g, ' ');
    const parts = s.split(/[\/\-@]| {2,}/).map(x => x.trim()).filter(x => x.length >= 3 && !/^(NEFT|IMPS|RTGS|UPI|INB|MB|NACH|ACH|CR|DR|INWARD|OUTWARD|TRF|TRANSFER|FROM|TO|BY|PAYMENT|REMITTANCE|UTR|REF|THE|AND|IFSC|SBIN|HDFC|ICIC|UTIB|KKBK|YESB|PUNB|BARB|CNRB|IDIB|OKAXIS|OKHDFCBANK|OKICICI|OKSBI|YBL|PAYTM|IBL|AXL)$/.test(x) && !/^[A-Z]{4}0/.test(x));
    return (parts.sort((a, b) => b.length - a.length)[0] || 'Unknown').replace(/\s+/g, ' ').slice(0, 40);
  };

  function bankRowsFromTable(rows, h){
    const c = h.cols; const tx = [];
    for(let i = h.index + 1; i < rows.length; i++){
      const r = rows[i]; if(!r) continue;
      const date = parseDate(r[c.date]); if(!date) continue;
      const desc = String(r[c.desc] || '').trim();
      let amt = 0;
      if(c.debit != null && c.credit != null){
        const d = parseAmount(r[c.debit]) || 0, cr = parseAmount(r[c.credit]) || 0;
        amt = cr ? Math.abs(cr) : -Math.abs(d);
        if(!d && !cr) continue;
      } else {
        const a = parseAmount(r[c.amount]); if(a == null || a === 0) continue;
        const ty = c.type != null ? norm(r[c.type]) : '';
        if(/^(d|dr|debit|withdraw)/.test(ty) || /\bdr\.?$/i.test(String(r[c.amount]))) amt = -Math.abs(a);
        else if(/^(c|cr|credit|deposit)/.test(ty)) amt = Math.abs(a);
        else amt = a;
      }
      const bal = c.balance != null ? parseAmount(r[c.balance]) : null;
      tx.push({ date, desc, amount: amt, balance: bal });
    }
    return tx;
  }
  function bankRowsFromLines(lines){
    const tx = []; let prevBal = null; let cur = null;
    const ob = lines.find(l => /opening balance|balance b\/?f|brought forward/i.test(l));
    if(ob){ const v = lastMoney(ob, true); if(v != null) prevBal = v; }
    lines.forEach(l => {
      const first = l.slice(0, 12).trim();
      const date = parseDate(first) || parseDate(l.split(/\s+/)[0]);
      if(/opening balance|closing balance|balance b\/?f|carried forward|total/i.test(l) && !date) return;
      if(date){
        const nums = moneyTokens(l, true);
        if(nums.length >= 1){
          const bal = nums.length >= 2 ? nums[nums.length - 1] : null;
          const amtAbs = Math.abs(nums.length >= 2 ? nums[nums.length - 2] : nums[0]);
          let desc = l.replace(/^\S+\s+(\d{1,2}[\/\-. ][\dA-Za-z]{1,9}[\/\-. ]\d{2,4}\s+)?/, '').replace(/(?:\s+\(?-?(?:\d{1,3}(?:,\d{2,3})+|\d+)\.\d{2}\)?(?:\s?(?:cr|dr))?)+\s*$/i, '').trim();
          let amt = null;
          if(prevBal != null && bal != null){
            if(Math.abs((bal - prevBal) - amtAbs) < 1) amt = amtAbs;
            else if(Math.abs((prevBal - bal) - amtAbs) < 1) amt = -amtAbs;
          }
          if(amt == null){
            if(/\bcr\b|\bby\b|deposit|credit|neft cr|imps cr|\/cr\//i.test(l) && !/\bdr\b|withdraw/i.test(l)) amt = amtAbs;
            else amt = -amtAbs;
          }
          cur = { date, desc, amount: amt, balance: bal };
          tx.push(cur);
          if(bal != null) prevBal = bal;
          return;
        }
      }
      if(cur && !date && l.length < 120 && !moneyTokens(l, true).length && !/page \d|statement|account no|ifsc|branch/i.test(l)) cur.desc += ' ' + l.trim();
    });
    return tx;
  }
  function categorize(t){
    if(t.amount < 0){
      for(const [key, label, line, btype, re] of OUT_CATS){ const x = API.extra[key]; if(re.test(t.desc) || (x && x.test(t.desc))) return { key, label, line, btype }; }
      return { key: 'other', label: 'Other payments (UPI and transfers)', line: 'Other payments', btype: 'want' };
    }
    if(API.salaryWords && API.salaryWords.test(t.desc)) return { key: 'salary', label: 'Salary' };
    for(const [key, label, re] of IN_CATS) if(re.test(t.desc)) return { key, label };
    return { key: 'otherin', label: 'Other money in' };
  }
  function extractBank(doc, mapping){
    let tx = [];
    let source = 'table';
    if(mapping) tx = bankRowsFromTable(mapping.rows, mapping.header);
    else if(doc.kind === 'pdf' || doc.ocr){
      // PDF columns drift when a row has only a debit or only a credit, so read lines and use the balance to tell direction
      tx = bankRowsFromLines(doc.lines); source = 'lines';
    }
    else {
      for(const t of (doc.tables || []).slice().sort((a, b) => b.rows.length - a.rows.length)){
        const h = findBankHeader(t.rows);
        if(h){ tx = bankRowsFromTable(t.rows, h); if(tx.length >= 3) break; }
      }
      if(tx.length < 3){ tx = bankRowsFromLines(doc.lines); source = 'lines'; }
    }
    tx = tx.filter(t => t.amount && isFinite(t.amount));
    if(!tx.length) return { type: 'bank', confidence: 'low', tx: [], notes: ['No transactions could be found. If this is a spreadsheet, use "Match the columns myself" below.'] };
    tx.sort((a, b) => a.date.localeCompare(b.date));
    tx.forEach(t => Object.assign(t, { cat: categorize(t) }));
    const from = tx[0].date, to = tx[tx.length - 1].date;
    const days = Math.max(1, (new Date(to) - new Date(from)) / 864e5 + 1);
    const months = Math.max(1, Math.round(days / 30.44 * 10) / 10);
    const outByCat = {}, inByCat = {};
    tx.forEach(t => {
      const bucket = t.amount < 0 ? outByCat : inByCat;
      const k = t.cat.key;
      if(!bucket[k]) bucket[k] = { ...t.cat, total: 0, count: 0 };
      bucket[k].total += Math.abs(t.amount); bucket[k].count++;
    });
    Object.values(outByCat).forEach(c => c.monthly = c.total / months);
    Object.values(inByCat).forEach(c => c.monthly = c.total / months);
    // recurring payments: same cleaned description and similar amount in 2+ different months
    const groups = {};
    tx.filter(t => t.amount < 0).forEach(t => {
      const key = t.desc.toUpperCase().replace(/[0-9]{3,}|[^A-Z ]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 28) + '|' + Math.round(Math.abs(t.amount) / 50);
      (groups[key] = groups[key] || []).push(t);
    });
    const recurring = Object.values(groups).filter(g => new Set(g.map(t => t.date.slice(0, 7))).size >= 2)
      .map(g => ({ desc: g[0].desc.slice(0, 60), amount: Math.abs(g[0].amount), times: g.length, cat: g[0].cat }))
      .sort((a, b) => b.amount - a.amount).slice(0, 12);
    // salary: largest regular credit tagged salary
    const sal = tx.filter(t => t.amount > 0 && t.cat.key === 'salary');
    const salaryMonthly = sal.length ? sum(sal.map(t => t.amount)) / months : 0;
    // payers of "other money in", for freelancers and small businesses
    const payers = {};
    tx.filter(t => t.amount > 0 && t.cat.key === 'otherin').forEach(t => { const n = payerName(t.desc); (payers[n] = payers[n] || { name: n, total: 0, count: 0 }); payers[n].total += t.amount; payers[n].count++; });
    const lastBal = [...tx].reverse().find(t => t.balance != null);
    const spendKeys = Object.keys(outByCat).filter(k => !['self', 'invest'].includes(k));
    const monthlySpend = sum(spendKeys.map(k => outByCat[k].monthly));
    const totalIn = sum(tx.filter(t => t.amount > 0 && !['self', 'refund', 'redeem'].includes(t.cat.key)).map(t => t.amount));
    const notes = [];
    if(months < 2.5) notes.push(`This statement covers about ${months} month${months === 1 ? '' : 's'}. Three to twelve months gives steadier monthly averages.`);
    if(outByCat.card) notes.push('Credit card bills are counted as one line. Import your card statement too if you want that spending split into categories.');
    if(outByCat.other && outByCat.other.monthly > monthlySpend * 0.35) notes.push('A large share of payments are UPI or transfers to people, which cannot be categorised from the bank narration alone.');
    const balChecks = tx.filter(t => t.balance != null).length;
    const confidence = tx.length >= 10 && (balChecks > tx.length * 0.6 || source === 'table') ? 'high' : tx.length >= 4 ? 'medium' : 'low';
    return { type: 'bank', from, to, months, tx, outByCat, inByCat, recurring, salaryMonthly, payers: Object.values(payers).sort((a, b) => b.total - a.total).slice(0, 15),
      closingBalance: lastBal ? lastBal.balance : null, monthlySpend, monthlyIn: totalIn / months, confidence, notes, source };
  }

  /* ---------- invoices / freelance income register ---------- */
  const INV_SPEC = {
    date: /^(invoice |bill |receipt |payment )?date$|^date of (invoice|receipt|payment)|^dated?$/,
    client: /client|customer|party|billed to|bill to|company|payer|buyer|^name$/,
    amount: /^(invoice |bill |gross |taxable |base )?(amount|value|fee|fees|billed|total amount|amount received|receipt)|^taxable value|^professional fee|^amount \(|^total$/,
    tds: /\btds\b|tax deducted/,
    gst: /\bgst\b|igst|cgst|sgst|tax amount/,
    status: /status|received|paid\?|payment status/,
    invno: /invoice (no|number|#)|bill no|^inv/,
  };
  function findInvoiceHeader(rows){
    const h = findHeader(rows, INV_SPEC, 30);
    if(!h || h.cols.date == null || h.cols.amount == null) return null;
    if(h.cols.client == null && h.cols.invno == null && h.cols.tds == null) return null;
    if(findBankHeader(rows)) return null;
    return h;
  }
  function extractInvoices(doc, mapping){
    let rows, h;
    if(mapping){ rows = mapping.rows; h = mapping.header; }
    else for(const t of (doc.tables || [])){ const x = findInvoiceHeader(t.rows); if(x){ rows = t.rows; h = x; break; } }
    if(!h) return { type: 'invoices', confidence: 'low', items: [], notes: ['No income table was found.'] };
    const c = h.cols; const items = [];
    for(let i = h.index + 1; i < rows.length; i++){
      const r = rows[i]; const date = parseDate(r[c.date]); const amount = parseAmount(r[c.amount]);
      if(!date || !amount || amount <= 0) continue;
      const status = c.status != null ? norm(r[c.status]) : '';
      items.push({ date, client: c.client != null ? String(r[c.client] || '').slice(0, 50) : '', amount, tds: c.tds != null ? Math.abs(parseAmount(r[c.tds]) || 0) : 0, gst: c.gst != null ? Math.abs(parseAmount(r[c.gst]) || 0) : 0,
        unpaid: /unpaid|pending|due|overdue|open|^no$/.test(status) });
    }
    return summariseReceipts(items, 'invoices');
  }
  function summariseReceipts(items, type){
    const fyNow = currentFy();
    const byFy = {};
    items.forEach(it => { const fy = fyOf(it.date); (byFy[fy] = byFy[fy] || []).push(it); });
    const fys = Object.keys(byFy).sort();
    const fy = byFy[fyNow] ? fyNow : fys[fys.length - 1];
    const list = (byFy[fy] || []);
    const paid = list.filter(x => !x.unpaid);
    const receipts = sum(paid.map(x => x.amount)), tds = sum(paid.map(x => x.tds)), gst = sum(paid.map(x => x.gst));
    const monthsSeen = new Set(list.map(x => x.date.slice(0, 7))).size || 1;
    const clients = {};
    paid.forEach(x => { const k = x.client || 'Unnamed'; (clients[k] = clients[k] || { name: k, total: 0, count: 0, tds: 0 }); clients[k].total += x.amount; clients[k].count++; clients[k].tds += x.tds; });
    const top = Object.values(clients).sort((a, b) => b.total - a.total);
    const notes = [];
    if(list.some(x => x.unpaid)) notes.push(`${list.filter(x => x.unpaid).length} invoices are marked unpaid, so they are left out of receipts.`);
    if(top[0] && receipts > 0 && top[0].total / receipts > 0.6) notes.push(`${top[0].name} is ${Math.round(top[0].total / receipts * 100)}% of your income. Relying on one client is a risk worth planning for with a bigger emergency fund.`);
    return { type, fy, fys, items, receipts, tds, gst, monthsSeen, avgMonthly: receipts / monthsSeen, clients: top.slice(0, 12), unpaid: sum(list.filter(x => x.unpaid).map(x => x.amount)),
      confidence: items.length >= 3 ? 'high' : items.length ? 'medium' : 'low', notes };
  }

  /* ---------- Form 26AS / AIS: who deducted TDS and how much ---------- */
  function extract26as(doc){
    const lines = doc.lines; const rows = [];
    const TAN = /\b([A-Z]{4}\d{5}[A-Z])\b/;
    lines.forEach((l, i) => {
      const m = l.match(TAN); if(!m) return;
      const nums = moneyTokens(l.replace(TAN, ' ')).filter(v => v >= 0);
      if(nums.length < 2) return;
      const name = l.slice(0, l.indexOf(m[1])).replace(/^\s*\d+\s+/, '').replace(/\s{2,}/g, ' ').trim().slice(0, 60);
      let section = null;
      for(let k = i; k < Math.min(lines.length, i + 6); k++){ const s = lines[k].match(/\b(192A?|194[A-Z]{0,2}|393|392|195)\b/); if(s){ section = s[1]; break; } }
      const [paid, deducted] = nums.length >= 3 ? nums.slice(-3) : nums.slice(-2);
      if(paid > 0 && deducted <= paid) rows.push({ name: name || m[1].slice(0, 4) + '…', section, paid, deducted });
    });
    const salary = rows.filter(r => r.section && /^192|^392/.test(r.section));
    const prof = rows.filter(r => !salary.includes(r) && (!r.section || /^194J|^393|^194C|^194H|^194O|^194M/.test(r.section)));
    const other = rows.filter(r => !salary.includes(r) && !prof.includes(r));
    const ay = doc.text.match(/assessment year\s*[:\-]?\s*(\d{4})\s*[-–]\s*(\d{2,4})/i);
    const fy = ay ? `${Number(ay[1]) - 1}-${String(ay[1]).slice(2)}` : (doc.text.match(/(?:financial|tax) year\s*[:\-]?\s*(\d{4})\s*[-–]\s*(\d{2,4})/i) || [])[0];
    return { type: 'tds26as', fy: fy || null, rows, salary, prof, other,
      salaryPaid: sum(salary.map(r => r.paid)), salaryTds: sum(salary.map(r => r.deducted)),
      profPaid: sum(prof.map(r => r.paid)), profTds: sum(prof.map(r => r.deducted)),
      otherPaid: sum(other.map(r => r.paid)), otherTds: sum(other.map(r => r.deducted)),
      confidence: rows.length ? 'medium' : 'low', notes: rows.length ? ['Check the totals against the summary at the top of your 26AS or AIS.'] : ['No deductor rows were found.'] };
  }

  /* ---------- broker holdings (stocks) and fund holdings sheets ---------- */
  const HOLD_SPEC = {
    name: /^(symbol|instrument|stock name|scrip( name)?|security( name)?|company( name)?|name|trading symbol|stock|scheme( name)?|fund( name)?)$/,
    isin: /^isin/,
    qty: /^(quantity( available)?|qty\.?|shares|no\.? of shares|units|balance units|net qty|holding qty|free qty|quantity held|total quantity)$/,
    avg: /^(avg\.?|average)\s*(buy\s*)?(price|cost|nav)|^buy (price|avg)|^cost price|^purchase (price|nav)|^avg\.? cost|^average cost/,
    ltp: /^(ltp|last (traded )?price|closing price|current price|previous closing price|prev\.? close|market price|cmp|nav|current nav|latest nav)$/,
    invested: /^(invested|investment|buy value|cost value|total cost|invested value|amount invested|purchase value)( value| amount)?/,
    value: /^(current value|market value|present value|value at ltp|cur\.? val|valuation)/,
  };
  function findHoldingsHeader(rows){
    const h = findHeader(rows, HOLD_SPEC, 40);
    if(!h || h.cols.name == null || h.cols.qty == null) return null;
    if(h.cols.avg == null && h.cols.invested == null && h.cols.ltp == null && h.cols.value == null) return null;
    return h;
  }
  function extractHoldings(doc, mapping){
    let rows, h;
    if(mapping){ rows = mapping.rows; h = mapping.header; }
    else for(const t of (doc.tables || [])){ const x = findHoldingsHeader(t.rows); if(x){ rows = t.rows; h = x; break; } }
    if(!h) return { type: 'holdings', items: [], confidence: 'low', notes: ['No holdings table was found.'] };
    const c = h.cols; const items = [];
    const header = (rows[h.index] || []).map(norm).join(' ');
    let isFund = /scheme|fund|nav|folio|units/.test(header);
    for(let i = h.index + 1; i < rows.length; i++){
      const r = rows[i]; const name = String(r[c.name] || '').trim();
      const qty = parseAmount(r[c.qty]);
      if(!name || !qty || qty <= 0 || /^total/i.test(name)) continue;
      const isin = c.isin != null ? String(r[c.isin] || '').trim() : '';
      let avg = c.avg != null ? parseAmount(r[c.avg]) : null;
      if(avg == null && c.invested != null){ const inv = parseAmount(r[c.invested]); if(inv) avg = inv / qty; }
      let ltp = c.ltp != null ? parseAmount(r[c.ltp]) : null;
      if(ltp == null && c.value != null){ const v = parseAmount(r[c.value]); if(v) ltp = v / qty; }
      const fund = isFund || /^INF/.test(isin);
      items.push({ name, isin, qty, avg: avg || 0, ltp: ltp || 0, kind: fund ? 'mf' : 'stock' });
    }
    const invested = sum(items.map(x => x.qty * x.avg)), value = sum(items.map(x => x.qty * (x.ltp || x.avg)));
    return { type: 'holdings', items, invested, value, confidence: items.length ? 'high' : 'low', notes: items.length ? [] : ['The table had no rows with a name and a quantity.'] };
  }

  /* ---------- mutual fund CAS (CAMS / KFintech) ---------- */
  function extractCas(doc){
    const text = doc.lines.join('\n');
    const items = [];
    const re = /Closing\s*Unit\s*Balance:?\s*([\d,]+\.\d+)[\s\S]{0,80}?NAV\s*on\s*([0-9A-Za-z\-\/]+):?\s*(?:INR|Rs\.?|₹)?\s*([\d,]+\.\d+)([\s\S]{0,200}?)Market\s*Value\s*on\s*[0-9A-Za-z\-\/]+:?\s*(?:INR|Rs\.?|₹)?\s*([\d,]+\.\d+)/gi;
    let m;
    while((m = re.exec(text))){
      // the scheme name is the nearest earlier line that mentions a fund or an ISIN
      const before = text.slice(Math.max(0, m.index - 1500), m.index).split('\n').reverse();
      let nameLine = before.find(l => /ISIN|Fund|Plan|Scheme/i.test(l) && !/Folio|PAN|KYC|Opening|Closing|NAV on|Market Value/i.test(l)) || 'Mutual fund';
      let name = nameLine.replace(/\s*-?\s*ISIN.*$/i, '').replace(/\(.*?(advisor|arn|registrar).*$/i, '').replace(/^[A-Z0-9]{2,8}-/, '').replace(/\s{2,}/g, ' ').trim();
      const isinM = nameLine.match(/\b(INF[A-Z0-9]{9})\b/);
      const costM = m[4].match(/Cost\s*Value:?\s*(?:INR|Rs\.?|₹)?\s*([\d,]+\.\d+)/i);
      const units = parseAmount(m[1]), nav = parseAmount(m[3]), cost = costM ? parseAmount(costM[1]) : null, value = parseAmount(m[5]);
      if(units > 0) items.push({ name: name.slice(0, 90), isin: isinM ? isinM[1] : '', qty: units, ltp: nav, avg: cost ? cost / units : 0, value, cost: cost || 0, navDate: parseDate(m[2]), kind: 'mf' });
    }
    // KFintech/MF Central summary tables: rows with an INF ISIN and numbers
    if(!items.length){
      doc.lines.forEach(l => {
        const im = l.match(/\b(INF[A-Z0-9]{9})\b/); if(!im) return;
        const nums = moneyTokens(l.replace(im[1], ' ')).filter(v => v > 0);
        if(nums.length < 3) return;
        const name = l.slice(0, l.indexOf(im[1])).replace(/^\s*[\w\/]+\s{2,}/, '').trim() || 'Mutual fund';
        // common order: units, NAV, cost, market value
        const [units, nav, cost, value] = nums.length >= 4 ? nums.slice(-4) : [nums[0], nums[1], 0, nums[2]];
        items.push({ name: name.slice(0, 90), isin: im[1], qty: units, ltp: nav, avg: cost ? cost / units : 0, value, cost, kind: 'mf' });
      });
    }
    return { type: 'cas', items, value: sum(items.map(x => x.value || x.qty * x.ltp)), invested: sum(items.map(x => x.cost || 0)),
      confidence: items.length ? 'high' : 'low', notes: items.length ? ['Folio numbers and your PAN are not stored, only fund names, units and values.'] : ['No fund balances were found. CAS files are usually locked with your PAN in capitals as the password.'] };
  }

  /* ---------- EPFO member passbook ---------- */
  function extractEpf(doc){
    const lines = doc.lines; const monthly = [];
    lines.forEach(l => {
      const m = l.match(/cont\.?\s*for\s*due-?\s*month\s*(\d{2})(\d{4})/i) || l.match(/\b(\d{2})(\d{4})\b.*\bcr\b/i);
      if(!m) return;
      const nums = moneyTokens(l).filter(v => v >= 0);
      if(nums.length >= 3){ const [ee, er, pen] = nums.slice(-3); monthly.push({ month: `${m[2]}-${m[1]}`, ee, er, pension: pen }); }
    });
    let balance = null;
    const closing = [...lines].reverse().find(l => /closing balance|total balance|balance as on/i.test(l));
    if(closing){ const nums = moneyTokens(closing).filter(v => v >= 0); if(nums.length >= 2) balance = nums.length >= 3 ? nums[nums.length - 3] + nums[nums.length - 2] : nums[0] + nums[1]; else if(nums.length) balance = nums[0]; }
    const asOfM = closing && closing.match(/(\d{2}[\/\-.]\d{2}[\/\-.]\d{4})/);
    const last = monthly[monthly.length - 1];
    return { type: 'epf', balance, asOf: asOfM ? parseDate(asOfM[1]) : null, monthly, monthlyContribution: last ? last.ee + last.er : null, lastMonth: last ? last.month : null,
      confidence: balance ? 'high' : monthly.length ? 'medium' : 'low', notes: ['The pension (EPS) part is not part of your withdrawable EPF balance, so it is left out.'] };
  }

  /* ---------- Corpus backup ---------- */
  function isBackup(json){ return json && typeof json === 'object' && json.settings && (Array.isArray(json.ppf) || Array.isArray(json.stocks) || Array.isArray(json.loans)); }

  function extract(doc, forcedType, mapping){
    if(doc.kind === 'json') return isBackup(doc.json) ? { type: 'backup', confidence: 'high', json: doc.json, notes: [] } : { type: 'unknown', notes: ['This JSON file is not a CO₹PU$ backup.'] };
    const det = forcedType ? { type: forcedType, ranked: [] } : detect(doc);
    const t = det.type;
    let r;
    if(t === 'payslip') r = extractPayslip(doc);
    else if(t === 'form16') r = extractForm16(doc);
    else if(t === 'bank') r = extractBank(doc, mapping);
    else if(t === 'invoices') r = extractInvoices(doc, mapping);
    else if(t === 'tds26as') r = extract26as(doc);
    else if(t === 'holdings') r = extractHoldings(doc, mapping);
    else if(t === 'cas') r = extractCas(doc);
    else if(t === 'epf') r = extractEpf(doc);
    else r = { type: 'unknown', confidence: 'low', notes: ['This file did not match a payslip, Form 16, bank statement, invoice list, 26AS, broker holdings, CAS or EPF passbook.'] };
    r.detected = det.ranked;
    return r;
  }

  // the chosen country's date order, merchant names and payroll words
  function useCountry(P){
    if(!P) return;
    API.dateOrder = P.dateOrder || 'dmy';
    API.extra = {}; Object.entries(P.keywords || {}).forEach(([k, v]) => { try{ API.extra[k] = new RegExp(v, 'i'); }catch(e){} });
    API.salaryWords = P.salaryWords ? new RegExp(P.salaryWords, 'i') : null;
  }
  if(window.CorpusCountry) useCountry(CorpusCountry.get());
  window.CorpusExtract = { useCountry, API, extract, detect, parseAmount, parseDate, moneyTokens, fyOf, currentFy, findHeader, PAY_LABELS, F16_LABELS, BANK_SPEC, INV_SPEC, HOLD_SPEC, summariseReceipts, extractBank, extractInvoices, extractHoldings };
})();
