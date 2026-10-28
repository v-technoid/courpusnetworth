/* ===========================================================
   CO₹PU$ — advice engine
   Every message here comes from a plain coded rule, not a
   model. You can read every condition below and see exactly
   why a message appeared. Nothing is guessed.
=========================================================== */

function generateAdvice(){
  const s = computeSummary();
  const settings = s.c.settings;
  const items = [];

  const hasAnyData = s.totalAssets > 0 || s.totalLiabilities > 0;
  if(!hasAnyData){
    items.push({ level:'info', title:'Add your numbers to get a real picture',
      text:'Once you add a few assets and any loans, this page will fill up with a proper health check of your finances.' });
    return items;
  }

  // 1. Debt load relative to assets
  if(s.totalAssets > 0){
    const debtRatio = (s.totalLiabilities / s.totalAssets) * 100;
    if(debtRatio > 50){
      items.push({ level:'warn', title:'Your debt is large next to what you own',
        text:`Your loans and debts add up to ${debtRatio.toFixed(0)}% of your total assets. Anything above 50% usually means a bad year could put you in real trouble. Focus extra payments on the highest interest loan first.` });
    }else if(debtRatio > 30){
      items.push({ level:'info', title:'Debt is manageable but worth watching',
        text:`Liabilities are ${debtRatio.toFixed(0)}% of your assets. That is a workable level, but try not to let it grow further before paying some of it down.` });
    }else{
      items.push({ level:'good', title:'Your debt load looks healthy',
        text:`Liabilities are only ${debtRatio.toFixed(0)}% of your assets, which gives you room to handle an emergency without panic.` });
    }
  }

  // 2. Concentration risk in any one bucket
  const bucketNames = { cash:'your bank accounts', retire:'retirement accounts', ppf:'PPF', epf:'EPF', nps:'NPS', fd:'Fixed deposits', rd:'Recurring deposits', stocks:'Stocks', mf:'Mutual funds', gold:'Gold & silver', crypto:'Crypto', bonds:'Bonds', land:'Land or property' };
  if(s.totalAssets > 0){
    Object.entries(s.assetBuckets).forEach(([key, val]) => {
      const share = (val / s.totalAssets) * 100;
      if(share >= 60){
        items.push({ level:'warn', title:`Too much sitting in ${bucketNames[key]}`,
          text:`${bucketNames[key]} makes up ${share.toFixed(0)}% of everything you own. If something goes wrong in that one place, most of your money feels it. Spreading this across a couple more types of assets would lower that risk.` });
      }
    });
  }

  // 2b. Crypto gets its own, lower threshold, since it swings far more
  // than the other asset classes here.
  if(s.totalAssets > 0 && s.assetBuckets.crypto > 0){
    const cryptoShare = (s.assetBuckets.crypto / s.totalAssets) * 100;
    if(cryptoShare >= 20){
      items.push({ level:'warn', title:'Crypto is a large slice of your net worth',
        text:`Crypto makes up ${cryptoShare.toFixed(0)}% of what you own. It moves far more sharply than your other holdings, so a share this size can swing your whole net worth in a single bad week. Worth deciding if that is intentional.` });
    }
  }

  // 3. Real returns vs inflation, for fixed income buckets
  const inflation = Number(settings.inflationAssumption) || 6;
  ['fd','rd','ppf','epf'].forEach(key => {
    const entries = s.c[key];
    if(entries.length === 0) return;
    const avgRate = entries.reduce((a,e)=>a+(Number(e.rate)||0),0) / entries.length;
    if(avgRate < inflation){
      items.push({ level:'warn', title:`${bucketNames[key]} may be losing value in real terms`,
        text:`Your average ${bucketNames[key]} rate is about ${avgRate.toFixed(1)}%, against an assumed inflation of ${inflation}%. The money is technically growing, but it is buying less over time. This is fine for safety, but it should not be your only home for long term savings.` });
    }
  });

  // 4. Expensive loans that are costing more than most investments earn
  s.c.loans.forEach(loan => {
    if(Number(loan.rate) >= 11){
      items.push({ level:'warn', title:`"${loan.name}" is an expensive loan`,
        text:`This loan charges ${loan.rate}% a year. Very few safe investments beat that consistently, so any spare cash usually does more good paying this down faster than it would sitting in a new investment.` });
    }
  });
  s.c.debts.forEach(debt => {
    if(Number(debt.rate) >= 20){
      items.push({ level:'warn', title:`"${debt.name}" is very high cost debt`,
        text:`At ${debt.rate}% a year, this is likely a credit card or a similar high cost debt. Clearing this before anything else is almost always the single best financial move you can make right now.` });
    }
  });

  // 5. Emergency fund check
  const liquid = s.assetBuckets.cash + s.assetBuckets.fd + s.assetBuckets.rd;
  if(settings.monthlyExpense){
    const target = Number(settings.monthlyExpense) * 6;
    if(liquid < target){
      items.push({ level:'warn', title:'Your emergency fund looks thin',
        text:`Six months of expenses at your entered monthly spend comes to about ${fmtMoney(target, settings.currency)}. Your bank balances, fixed and recurring deposits together only cover ${fmtMoney(liquid, settings.currency)}. Building this up should come before riskier investing.` });
    }else{
      items.push({ level:'good', title:'Your emergency fund is in good shape',
        text:`Your bank balances and deposits of ${fmtMoney(liquid, settings.currency)} comfortably cover six months of your expenses.` });
    }
  }

  // 6. Age based equity allocation, classic rule of thumb
  if(settings.age){
    const age = Number(settings.age);
    const suggestedEquity = Math.min(90, Math.max(10, 100 - age));
    const actualEquity = s.totalAssets > 0 ? ((s.assetBuckets.stocks + s.assetBuckets.mf) / s.totalAssets) * 100 : 0;
    const gap = suggestedEquity - actualEquity;
    if(Math.abs(gap) > 20){
      items.push({ level:'info', title:'Your equity mix is out of step with your age',
        text:`A common rule of thumb is to hold about ${suggestedEquity.toFixed(0)}% in stocks and mutual funds at your age. You are currently at ${actualEquity.toFixed(0)}%. This is just a starting reference, not a rule, but it is worth deciding on purpose rather than by accident.` });
    }
  }

  // 7. Monthly cash flow from rental income against EMI and debt outgo
  if(s.monthlyRental > 0 || s.monthlyEmiOutgo > 0 || s.monthlyDebtMin > 0){
    if(s.monthlyCashFlow < 0){
      items.push({ level:'warn', title:'Loan payments are outrunning your rental income',
        text:`Your EMIs and minimum debt payments come to ${fmtMoney(s.monthlyEmiOutgo + s.monthlyDebtMin, settings.currency)} a month, while rental income brings in ${fmtMoney(s.monthlyRental, settings.currency)}. This shortfall of ${fmtMoney(Math.abs(s.monthlyCashFlow), settings.currency)} has to come from your regular income every month.` });
    }
  }

  // 8. Insurance coverage gaps, simple presence checks, not a sizing exercise
  const categoriesHeld = new Set(s.c.insurance.map(p => p.category));
  if(s.c.insurance.length === 0){
    items.push({ level:'info', title:'No insurance on record yet',
      text:'Add your health, life, or accident policies on the Assets page to see your coverage at a glance. Individual health and life premiums also dropped to zero GST from September 2025, worth a look if you have been putting it off.' });
  }else{
    if(!categoriesHeld.has('health')){
      items.push({ level:'warn', title:'No health insurance on record',
        text:'A single hospital stay can undo years of saving. If you are not covered by an employer policy, an individual or family floater plan is usually the first insurance worth having, and it is now GST free.' });
    }
    if((s.totalLoans > 0 || s.totalDebts > 0) && !categoriesHeld.has('life') && !categoriesHeld.has('accident')){
      items.push({ level:'warn', title:'Loans on record, but no life or accident cover',
        text:'You are carrying debt but have no term life or personal accident policy logged. Either would stop that debt becoming a burden on your family if something happened to you, and a term plan is usually inexpensive for the cover it gives.' });
    }
  }

  if(items.length === 0){
    items.push({ level:'good', title:'Nothing concerning to flag right now',
      text:'Your numbers look balanced against the checks this page runs. Keep adding entries as things change.' });
  }

  return items;
}

// A simple, transparent starting allocation by age. This is a
// rule of thumb used widely in personal finance, not a
// personal recommendation, and it is shown as one reference
// point among several, not an instruction.
function suggestAllocation(age){
  age = Number(age) || 30;
  const equity = Math.min(90, Math.max(10, 100 - age));
  const gold = 10;
  const debt = Math.max(0, 100 - equity - gold);
  return { equity, debt, gold };
}
