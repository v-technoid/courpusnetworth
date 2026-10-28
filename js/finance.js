/* ===========================================================
   CO₹PU$ — finance formulas
   Every function here is plain arithmetic. Nothing calls out
   to any service. Rates are entered as whole percentages, e.g.
   7.1 for 7.1%, and time is in years unless a function name
   says otherwise.
=========================================================== */

function simpleInterest(principal, ratePct, years){
  const interest = (principal * ratePct * years) / 100;
  return { interest, maturity: principal + interest };
}

function compoundInterest(principal, ratePct, years, timesPerYear){
  timesPerYear = timesPerYear || 1;
  const r = ratePct / 100 / timesPerYear;
  const n = timesPerYear * years;
  const maturity = principal * Math.pow(1 + r, n);
  return { interest: maturity - principal, maturity };
}

function fdMaturity(principal, ratePct, years, compoundingPerYear){
  return compoundInterest(principal, ratePct, years, compoundingPerYear || 4).maturity;
}

// Approximate RD maturity using a monthly annuity-due model.
// This mirrors what most bank RD calculators show; actual bank
// figures can differ slightly by a few rupees due to their own
// quarterly-compounding conventions.
function rdMaturity(monthlyAmount, ratePct, months){
  const r = ratePct / 100 / 12;
  if(r === 0) return monthlyAmount * months;
  const fv = monthlyAmount * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  return fv;
}

// Approximate PPF value: annual contribution at the start of
// each year, compounded yearly, plus any opening balance.
function ppfValue(openingBalance, annualContribution, ratePct, years){
  const r = ratePct / 100;
  const fromOpening = openingBalance * Math.pow(1 + r, years);
  const fromContrib = r === 0
    ? annualContribution * years
    : annualContribution * ((Math.pow(1 + r, years) - 1) / r) * (1 + r);
  return fromOpening + fromContrib;
}

// Approximate EPF value: monthly combined contribution (employee plus
// employer), interest accrued monthly on the running balance but this
// mirrors what EPFO effectively credits once a year. Good enough for a
// personal estimate, not a substitute for your actual passbook.
function epfValue(openingBalance, monthlyContribution, ratePct, months){
  const r = ratePct / 100 / 12;
  let balance = Number(openingBalance) || 0;
  for(let m = 0; m < months; m++){
    balance += Number(monthlyContribution) || 0;
    balance += balance * r;
  }
  return balance;
}

/* ---------------- Goal planning ----------------
   Plain future-value and annuity algebra, solved for the
   unknown you asked for. No AI, no guessing, just the formula
   rearranged.
*/

// What a cost today will become after inflation, by the time you need it.
function inflationAdjustedGoal(currentCost, inflationPct, years){
  return currentCost * Math.pow(1 + inflationPct / 100, years);
}

// The monthly SIP needed to reach targetAmount in `years`, assuming
// annualReturnPct compounded monthly and a deposit at the start of
// each month (the usual SIP convention).
function requiredMonthlySip(targetAmount, years, annualReturnPct, existingLumpsum){
  existingLumpsum = existingLumpsum || 0;
  const months = years * 12;
  const r = annualReturnPct / 100 / 12;
  const growthOfExisting = existingLumpsum * Math.pow(1 + r, months);
  const remaining = Math.max(0, targetAmount - growthOfExisting);
  if(remaining === 0) return 0;
  if(r === 0) return remaining / months;
  const factor = ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  return remaining / factor;
}

// The future value a fixed monthly SIP will reach, for checking a plan
// rather than solving for the required amount.
function sipFutureValue(monthlyAmount, years, annualReturnPct){
  const months = years * 12;
  const r = annualReturnPct / 100 / 12;
  if(r === 0) return monthlyAmount * months;
  return monthlyAmount * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
}

// The lump sum today that would fund a fixed payment every year for
// `years`, earning `ratePct` a year. Used for working out a retirement
// corpus from the income it needs to replace.
function presentValueAnnuity(annualPayment, ratePct, years){
  const r = ratePct / 100;
  if(r === 0) return annualPayment * years;
  return annualPayment * (1 - Math.pow(1 + r, -years)) / r;
}

// The rate of return left over after inflation eats its share, using the
// compounding form rather than a plain subtraction.
function realRate(nominalPct, inflationPct){
  return ((1 + nominalPct / 100) / (1 + inflationPct / 100) - 1) * 100;
}

// Standard bond pricing: the present value of every coupon still to
// come, plus the face value at maturity, discounted at the yield to
// maturity you enter. There is no free live price feed for individual
// bonds, so this is a fair-value estimate from the numbers on your
// bond's own terms, not a quoted market price.
function bondPrice(faceValue, couponRatePct, ytmPct, yearsToMaturity, periodsPerYear){
  periodsPerYear = periodsPerYear || 1;
  const periods = Math.max(0, Math.round(yearsToMaturity * periodsPerYear));
  if(periods === 0) return faceValue;
  const couponPerPeriod = faceValue * (couponRatePct / 100) / periodsPerYear;
  const yPerPeriod = (ytmPct / 100) / periodsPerYear;
  if(yPerPeriod === 0) return couponPerPeriod * periods + faceValue;
  const pvCoupons = couponPerPeriod * (1 - Math.pow(1 + yPerPeriod, -periods)) / yPerPeriod;
  const pvFace = faceValue / Math.pow(1 + yPerPeriod, periods);
  return pvCoupons + pvFace;
}

function cagr(beginValue, endValue, years){
  if(beginValue <= 0 || years <= 0) return null;
  return (Math.pow(endValue / beginValue, 1 / years) - 1) * 100;
}

// EMI for a loan. ratePct is the ANNUAL rate, months is tenure in months.
function emi(principal, ratePct, months){
  const r = ratePct / 100 / 12;
  if(r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

// Outstanding loan balance after `paymentsMade` monthly EMIs.
function loanBalance(principal, ratePct, months, paymentsMade){
  const r = ratePct / 100 / 12;
  const monthlyEmi = emi(principal, ratePct, months);
  if(r === 0) return Math.max(principal - monthlyEmi * paymentsMade, 0);
  const factor = Math.pow(1 + r, paymentsMade);
  const balance = principal * factor - monthlyEmi * ((factor - 1) / r);
  return Math.max(balance, 0);
}

function totalInterestOnLoan(principal, ratePct, months){
  return emi(principal, ratePct, months) * months - principal;
}

function monthsBetween(fromDate, toDate){
  const f = new Date(fromDate), t = new Date(toDate);
  return (t.getFullYear() - f.getFullYear()) * 12 + (t.getMonth() - f.getMonth());
}

function yearsBetween(fromDate, toDate){
  return (new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24 * 365.25);
}

// Year by year PPF schedule. Contribution is treated as made at the
// start of each year, interest for the year is calculated on the
// opening balance plus that year's contribution, matching how PPF
// calculators commonly present the numbers.
function ppfSchedule(openingBalance, annualContribution, ratePct, years){
  const r = ratePct / 100;
  let balance = Number(openingBalance) || 0;
  const rows = [];
  for(let y = 1; y <= years; y++){
    const opening = balance;
    const contribution = Number(annualContribution) || 0;
    const interest = (opening + contribution) * r;
    const closing = opening + contribution + interest;
    rows.push({ year: y, opening, contribution, interest, closing });
    balance = closing;
  }
  return rows;
}

/* ---------------- Rolling returns ----------------
   points: array of { date: 'YYYY-MM-DD', value: number }, in any order.
   windowYears: the holding period you want to test, e.g. 3 or 5.
   Because entries are usually spaced unevenly when typed in by hand,
   this works out the average gap between your data points and uses
   that to decide how many points make up one window, then slides
   that window across every possible starting point.
*/
function rollingReturns(points, windowYears){
  const sorted = [...points]
    .filter(p => p.date && !isNaN(p.value))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const n = sorted.length;
  if(n < 2) return { error: 'need-more-points' };

  const totalYears = yearsBetween(sorted[0].date, sorted[n-1].date);
  const avgGap = totalYears / (n - 1);
  let steps = avgGap > 0 ? Math.round(windowYears / avgGap) : 1;
  if(steps < 1) steps = 1;
  if(steps >= n) return { error: 'window-too-long' };

  const series = [];
  for(let i = 0; i + steps < n; i++){
    const start = sorted[i], end = sorted[i + steps];
    const yrs = yearsBetween(start.date, end.date);
    if(yrs <= 0) continue;
    const rate = cagr(start.value, end.value, yrs);
    if(rate !== null) series.push({ startDate: start.date, endDate: end.date, rate });
  }
  if(series.length === 0) return { error: 'window-too-long' };

  const rates = series.map(s => s.rate);
  const avg = rates.reduce((a,b) => a+b, 0) / rates.length;
  const best = Math.max(...rates);
  const worst = Math.min(...rates);
  const negativeCount = rates.filter(r => r < 0).length;
  return { series, avg, best, worst, negativePct: (negativeCount / rates.length) * 100 };
}

/* ---------------- XIRR ----------------
   cashflows: array of { date: 'YYYY-MM-DD', amount: number }
   Convention: money going OUT of your pocket (an investment) is
   negative, money coming back or the current value is positive.
   Solved with Newton-Raphson, falling back to bisection if it
   does not converge cleanly. Returns a percentage, or null if
   no sensible root is found.
*/
function xirr(cashflows){
  if(!cashflows || cashflows.length < 2) return null;
  const sorted = [...cashflows].sort((a,b) => new Date(a.date) - new Date(b.date));
  const t0 = new Date(sorted[0].date);
  const years = sorted.map(cf => (new Date(cf.date) - t0) / (1000*60*60*24*365));

  function xnpv(rate){
    return sorted.reduce((sum, cf, i) => sum + cf.amount / Math.pow(1 + rate, years[i]), 0);
  }
  function xnpvDeriv(rate){
    return sorted.reduce((sum, cf, i) => sum - years[i] * cf.amount / Math.pow(1 + rate, years[i] + 1), 0);
  }

  let rate = 0.1;
  let converged = false;
  for(let i = 0; i < 100; i++){
    const f = xnpv(rate);
    const fPrime = xnpvDeriv(rate);
    if(Math.abs(fPrime) < 1e-10) break;
    const next = rate - f / fPrime;
    if(!isFinite(next)) break;
    if(Math.abs(next - rate) < 1e-7){ rate = next; converged = true; break; }
    rate = next;
  }

  if(!converged || rate <= -1 || !isFinite(rate)){
    // fallback: bisection between -0.99 and 10 (i.e. -99% to +1000%)
    let lo = -0.99, hi = 10;
    let fLo = xnpv(lo), fHi = xnpv(hi);
    if(fLo * fHi > 0) return null; // no sign change, cannot bisect reliably
    for(let i = 0; i < 200; i++){
      const mid = (lo + hi) / 2;
      const fMid = xnpv(mid);
      if(Math.abs(fMid) < 1e-6){ rate = mid; break; }
      if(fLo * fMid < 0){ hi = mid; fHi = fMid; } else { lo = mid; fLo = fMid; }
      rate = mid;
    }
  }
  return rate * 100;
}

/* ===========================================================
   More calculators (added October 2026)
   Tax figures are for FY 2026-27, unchanged by Budget 2026:
   new regime slabs 0-4L nil, 4-8L 5%, 8-12L 10%, 12-16L 15%,
   16-20L 20%, 20-24L 25%, above 24L 30%; ₹75,000 standard
   deduction; Section 87A rebate up to ₹60,000 so tax is nil up to
   ₹12 lakh of taxable income, with marginal relief just above it.
   Old regime: 2.5L/3L/5L basic exemption by age, 5/20/30%, ₹50,000
   standard deduction, ₹12,500 rebate up to ₹5 lakh. Cess 4%.
=========================================================== */

function lumpsumValue(amount, ratePct, years){
  return amount * Math.pow(1 + ratePct / 100, years);
}

// SIP that rises by stepPct every year (the usual "step-up" or "top-up" SIP).
function stepUpSip(monthly, stepPct, years, ratePct){
  const r = ratePct / 100 / 12;
  let value = 0, invested = 0, sip = monthly;
  const yearly = [];
  for(let y = 1; y <= years; y++){
    for(let m = 0; m < 12; m++){ value = (value + sip) * (1 + r); invested += sip; }
    yearly.push({ year: y, invested, value, sip });
    sip = sip * (1 + stepPct / 100);
  }
  return { value, invested, yearly };
}

// Plain SIP schedule, year by year, for charts.
function sipSchedule(monthly, years, ratePct){
  return stepUpSip(monthly, 0, years, ratePct);
}

// Systematic withdrawal: start with a corpus, take a fixed amount each month.
function swpSchedule(corpus, monthlyWithdrawal, ratePct, years, stepPct){
  const r = ratePct / 100 / 12;
  let bal = corpus, withdrawn = 0, w = monthlyWithdrawal, ranOutMonth = null;
  const yearly = [];
  for(let y = 1; y <= years; y++){
    for(let m = 0; m < 12; m++){
      bal = bal * (1 + r);
      const take = Math.min(w, bal);
      bal -= take; withdrawn += take;
      if(bal <= 0.01 && ranOutMonth === null){ ranOutMonth = (y - 1) * 12 + m + 1; bal = 0; }
    }
    yearly.push({ year: y, balance: bal, withdrawn });
    w = w * (1 + (stepPct || 0) / 100);
  }
  return { balance: bal, withdrawn, ranOutMonth, yearly };
}

// Sukanya Samriddhi: deposits for 15 years from opening, account matures at 21 years,
// interest compounded yearly. Deposit limits: ₹250 to ₹1.5 lakh a year.
function sukanyaSchedule(annualDeposit, ratePct){
  const r = ratePct / 100;
  let bal = 0, invested = 0;
  const yearly = [];
  for(let y = 1; y <= 21; y++){
    if(y <= 15){ bal += annualDeposit; invested += annualDeposit; }
    bal = bal * (1 + r);
    yearly.push({ year: y, invested, value: bal });
  }
  return { maturity: bal, invested, interest: bal - invested, yearly };
}

function applySlabs(income, slabs){
  // slabs: [[upTo, rate], ...] with the last upTo = Infinity
  let tax = 0, prev = 0;
  for(const [upTo, rate] of slabs){
    if(income <= prev) break;
    const portion = Math.min(income, upTo) - prev;
    tax += portion * rate / 100;
    prev = upTo;
  }
  return tax;
}

function surchargeRate(taxable, regime){
  if(taxable > 5e7) return regime === 'new' ? 25 : 37;
  if(taxable > 2e7) return 25;
  if(taxable > 1e7) return 15;
  if(taxable > 5e6) return 10;
  return 0;
}

// New regime. salaried adds the ₹75,000 standard deduction; employerNps is the
// Section 80CCD(2) employer contribution, the main deduction left in this regime.
function incomeTaxNew(grossIncome, opts){
  opts = opts || {};
  const std = opts.salaried === false ? 0 : 75000;
  const taxable = Math.max(0, grossIncome - std - (opts.employerNps || 0));
  const slabs = [[400000,0],[800000,5],[1200000,10],[1600000,15],[2000000,20],[2400000,25],[Infinity,30]];
  let tax = applySlabs(taxable, slabs);
  let rebate = 0;
  if(taxable <= 1200000){ rebate = Math.min(tax, 60000); }
  else { const relief = tax - (taxable - 1200000); if(relief > 0) rebate = relief; } // marginal relief
  tax -= rebate;
  const sur = tax * surchargeRate(taxable, 'new') / 100;
  const cess = (tax + sur) * 0.04;
  return { taxable, deductions: std + (opts.employerNps || 0), slabTax: tax + rebate, rebate, surcharge: sur, cess, total: tax + sur + cess };
}

// Old regime. deductions = 80C, 80D, home loan interest, HRA exemption etc. combined.
function incomeTaxOld(grossIncome, deductions, age, opts){
  opts = opts || {};
  const std = opts.salaried === false ? 0 : 50000;
  const taxable = Math.max(0, grossIncome - std - (deductions || 0));
  const basic = age >= 80 ? 500000 : age >= 60 ? 300000 : 250000;
  const slabs = basic === 500000
    ? [[500000,0],[1000000,20],[Infinity,30]]
    : [[basic,0],[500000,5],[1000000,20],[Infinity,30]];
  let tax = applySlabs(taxable, slabs);
  const rebate = taxable <= 500000 ? Math.min(tax, 12500) : 0;
  tax -= rebate;
  const sur = tax * surchargeRate(taxable, 'old') / 100;
  const cess = (tax + sur) * 0.04;
  return { taxable, deductions: std + (deductions || 0), slabTax: tax + rebate, rebate, surcharge: sur, cess, total: tax + sur + cess };
}

// HRA exemption (old regime only): the lowest of actual HRA, 50%/40% of salary
// (basic + DA), and rent paid minus 10% of salary. All amounts yearly.
function hraExemption(basicDa, hraReceived, rentPaid, fiftyPercentCity){
  const a = hraReceived;
  const b = basicDa * (fiftyPercentCity ? 0.5 : 0.4);
  const c = Math.max(0, rentPaid - 0.1 * basicDa);
  const exempt = Math.max(0, Math.min(a, b, c));
  return { exempt, taxable: Math.max(0, hraReceived - exempt), a, b, c };
}

// Gratuity: 15 days' wages for each completed year, on a 26-day month.
// Service beyond 6 months in the last year counts as a full year.
function gratuityAmount(monthlyBasicDa, years, months){
  const fullYears = years + ((months || 0) > 6 ? 1 : 0);
  const amount = 15 * monthlyBasicDa * fullYears / 26;
  return { amount, fullYears, taxFree: Math.min(amount, 2000000), taxable: Math.max(0, amount - 2000000) };
}

// Prepaying part of a loan: compare keeping the EMI (shorter loan) vs keeping the tenure (smaller EMI).
function loanPrepayment(outstanding, ratePct, monthsLeft, prepay){
  const r = ratePct / 100 / 12;
  const oldEmi = emi(outstanding, ratePct, monthsLeft);
  const oldInterest = oldEmi * monthsLeft - outstanding;
  const newPrincipal = Math.max(0, outstanding - prepay);
  // option A: same EMI, fewer months
  let monthsA = 0;
  if(newPrincipal > 0){
    monthsA = r === 0 ? Math.ceil(newPrincipal / oldEmi) : Math.ceil(-Math.log(1 - (newPrincipal * r) / oldEmi) / Math.log(1 + r));
  }
  const interestA = newPrincipal > 0 ? oldEmi * monthsA - newPrincipal : 0;
  // option B: same months, lower EMI
  const emiB = newPrincipal > 0 ? emi(newPrincipal, ratePct, monthsLeft) : 0;
  const interestB = emiB * monthsLeft - newPrincipal;
  return { oldEmi, oldInterest, monthsA, interestA, savedA: oldInterest - interestA, emiB, interestB, savedB: oldInterest - interestB };
}

// How much home you can afford: lenders usually cap all EMIs at a share of
// take-home income (often 40 to 50%), the rest is down payment.
function homeAffordability(monthlyIncome, existingEmi, ratePct, years, downPayment, emiSharePct){
  const maxEmi = Math.max(0, monthlyIncome * emiSharePct / 100 - existingEmi);
  const r = ratePct / 100 / 12, n = years * 12;
  const maxLoan = r === 0 ? maxEmi * n : maxEmi * (1 - Math.pow(1 + r, -n)) / r;
  return { maxEmi, maxLoan, maxPrice: maxLoan + downPayment, totalInterest: maxEmi * n - maxLoan };
}

// What today's money buys in future years, both directions.
function inflationImpact(amount, inflationPct, years){
  const f = Math.pow(1 + inflationPct / 100, years);
  return { futureCost: amount * f, todaysValueOfFuture: amount / f };
}
