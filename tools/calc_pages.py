# Standalone calculator pages: each one is a real page with its own URL,
# title and explanation, so it can be found for searches like "SIP calculator".
# Worked examples were computed with js/finance.js, the same code the calculators run.

CALCS = [
 dict(slug='sip-calculator', card='card_sip', cat='invest', run='runSip',
  title='SIP Calculator India: Monthly SIP Returns and Chart | CO₹PU$',
  desc='Free SIP and monthly investment calculator. See what a monthly SIP grows to, how much is your money and how much is returns, with a year by year chart. Private, no sign up.',
  h1='SIP calculator', intro='Find out what a fixed monthly investment in a mutual fund can grow to, and how much of the final amount is your own money versus returns.',
  body='''<h2>What is a SIP?</h2>
<p>A Systematic Investment Plan (SIP) puts a fixed amount into a mutual fund every month, usually by auto debit from your bank. Because you buy every month, you get more units when prices are low and fewer when they are high, and you never have to time the market.</p>
<h2>How SIP returns are calculated</h2>
<p class="formula">Future value = P × [(1 + i)<sup>n</sup> − 1] ÷ i × (1 + i)</p>
<p>Here <strong>P</strong> is the monthly amount, <strong>i</strong> is the yearly return divided by 12 (as a fraction), and <strong>n</strong> is the number of months. The last “× (1 + i)” is there because each instalment is invested at the start of the month.</p>
<div class="example"><p><strong>Example:</strong> ₹10,000 a month for 15 years at 12% a year.</p><p>You invest ₹18,00,000. It grows to about <strong>₹50,45,760</strong>, so roughly ₹32,45,760 is returns.</p></div>
<h2>Keep in mind</h2>
<ul><li>Mutual fund returns are not fixed. 12% is a common long term assumption for equity funds in India, but some years are negative.</li><li>Raising your SIP every year, a step up SIP, makes a large difference. The same ₹10,000 raised by 10% each year comes to about ₹86.8 lakh in 15 years.</li><li>Equity fund gains above ₹1.25 lakh a year are taxed at 12.5% when held over a year.</li></ul>''',
  faqs=[('Is 12% a realistic SIP return?', 'Broad Indian equity index funds have delivered around 11 to 13% a year over long periods, but there is no guarantee. Use 10 to 12% for equity funds, 7% for debt funds, and check your real return with the XIRR calculator.'),
        ('SIP or lump sum, which is better?', 'If you already have the money, a lump sum invested early usually ends higher because it is invested longer. A SIP suits money that arrives monthly from salary, and it removes the worry of investing everything at a market peak.'),
        ('Can I stop or pause a SIP?', 'Yes. Most funds let you pause or cancel a SIP any time without a penalty. Only ELSS tax saving funds lock each instalment for three years.')],
  related=['xirr-calculator', 'fire-calculator', 'income-tax-calculator']),

 dict(slug='xirr-calculator', card='h2:XIRR', cat='invest', run='runXirr',
  title='XIRR Calculator: Real Return on SIPs and Investments | CO₹PU$',
  desc='Free XIRR calculator. Work out the true yearly return on SIPs, top ups and withdrawals made on different dates. Explained with an example, runs privately in your browser.',
  h1='XIRR calculator', intro='Work out the real yearly return on money that went in and came out on different dates, like a SIP, top ups or partial withdrawals.',
  body='''<h2>What is XIRR?</h2>
<p>XIRR, the extended internal rate of return, is the single yearly growth rate that explains every cash flow you made and what your investment is worth today. It is the fairest way to measure SIP returns, because each instalment was invested for a different length of time.</p>
<h2>How it is worked out</h2>
<p class="formula">Find r so that Σ C<sub>k</sub> ÷ (1 + r)<sup>(d<sub>k</sub> − d<sub>0</sub>) ÷ 365</sup> = 0</p>
<p>Each amount <strong>C</strong> is entered with its date <strong>d</strong>: money you put in as a negative number, money you got back or the value today as a positive number. The calculator tries rates until the total comes to zero.</p>
<div class="example"><p><strong>Example:</strong> you invested ₹1,00,000 on 1 January 2024 and ₹50,000 on 1 July 2024. On 1 January 2026 it is worth ₹1,80,000.</p><p>XIRR comes to about <strong>10.4% a year</strong>.</p></div>
<h2>XIRR versus CAGR</h2>
<p>CAGR is for one amount from one date to another: ₹1 lakh becoming ₹2 lakh in 6 years is a CAGR of about 12.2%. As soon as there is more than one investment date, use XIRR.</p>''',
  faqs=[('Why should investments be negative?', 'XIRR follows money from your point of view: money leaving your pocket is negative, money coming back, or today’s value, is positive. Without at least one of each there is no return to work out.'),
        ('What is a good XIRR?', 'For an equity mutual fund held five years or more, 10 to 14% is a reasonable range in India. Compare it with inflation, around 5 to 6%, and with what a fixed deposit would have paid over the same dates.'),
        ('Why is my XIRR different from what my app shows?', 'Small differences come from dates (purchase date versus allotment date), dividends, and whether today’s value uses the latest NAV. Large differences usually mean a cash flow is missing.')],
  related=['sip-calculator', 'fire-calculator', 'emi-calculator']),

 dict(slug='income-tax-calculator', card='card_tax', cat='tax', run='runTax',
  title='Income Tax Calculator FY 2026-27: Old vs New Regime | CO₹PU$',
  desc='Compare old and new tax regimes for tax year 2026-27. New regime slabs, ₹75,000 standard deduction, nil tax up to ₹12 lakh, surcharge and cess, with a worked example.',
  h1='Income tax calculator, old vs new regime', intro='Compare your tax under both regimes for the tax year 2026-27, the first year under the Income-tax Act 2025. Slabs are unchanged by Budget 2026.',
  body='''<h2>New regime slabs for 2026-27</h2>
<ul><li>Up to ₹4 lakh: nil</li><li>₹4 to 8 lakh: 5%</li><li>₹8 to 12 lakh: 10%</li><li>₹12 to 16 lakh: 15%</li><li>₹16 to 20 lakh: 20%</li><li>₹20 to 24 lakh: 25%</li><li>Above ₹24 lakh: 30%</li></ul>
<p>Salaried people get a <strong>₹75,000 standard deduction</strong>. A rebate of up to ₹60,000 makes tax nil when taxable income is ₹12 lakh or less, so a salary of up to ₹12.75 lakh pays no tax. Just above ₹12 lakh, marginal relief keeps tax from exceeding the income above ₹12 lakh. A 4% health and education cess applies on top.</p>
<h2>Old regime</h2>
<p>Slabs are nil up to ₹2.5 lakh (₹3 lakh at 60, ₹5 lakh at 80), 5% to ₹5 lakh, 20% to ₹10 lakh and 30% above, with a ₹50,000 standard deduction and a rebate up to ₹5 lakh of taxable income. In exchange you can claim HRA, 80C up to ₹1.5 lakh, 80D health insurance, home loan interest up to ₹2 lakh and more.</p>
<div class="example"><p><strong>Example:</strong> ₹15 lakh salary, with ₹1.5 lakh in 80C and ₹25,000 in 80D.</p><p>New regime: about <strong>₹97,500</strong>. Old regime: about <strong>₹2,02,800</strong>. The new regime wins unless large HRA or home loan interest is added.</p></div>''',
  faqs=[('Can I switch between regimes?', 'Salaried people can choose each year when filing the return. With business or professional income you can switch back to the old regime only once, so think it through.'),
        ('Is ₹12.75 lakh salary really tax free?', 'Yes, in the new regime. ₹12.75 lakh minus the ₹75,000 standard deduction is ₹12 lakh of taxable income, and the rebate cancels the tax. At ₹13 lakh, marginal relief keeps tax to about ₹26,000 including cess, instead of over ₹66,000.'),
        ('Which deductions are allowed in the new regime?', 'Mainly the ₹75,000 standard deduction and your employer’s NPS contribution up to 14% of salary. HRA, 80C, 80D and home loan interest on a self occupied house are not allowed.')],
  related=['hra-calculator', 'freelancer-tax-calculator', 'gratuity-calculator']),

 dict(slug='freelancer-tax-calculator', card='card_free', cat='tax', run='runFree',
  title='Freelancer Tax Calculator India: Section 58 (44ADA) | CO₹PU$',
  desc='Freelancer and consultant tax in India, 2026-27: presumptive section 58 (old 44ADA) vs actual profit, TDS credit, advance tax by 15 March, GST limit.',
  h1='Freelancer and consultant tax calculator', intro='See your tax as a freelancer or consultant under presumptive taxation and under actual profit, after the TDS your clients already deducted.',
  body='''<h2>Presumptive taxation for professionals</h2>
<p>Under section 58 of the Income-tax Act 2025 (the old section 44ADA), half of your gross receipts is treated as profit. You do not need to keep detailed books or claim expenses one by one. It applies up to <strong>₹50 lakh</strong> of receipts, or <strong>₹75 lakh</strong> if 5% or less came in cash.</p>
<p>It covers listed professions: legal, medical, engineering, architecture, accountancy, technical consultancy, interior decoration, information technology, company secretaries and film artists. If your work is not on that list, for example many writers or video editors, the presumptive scheme for small businesses (the old 44AD, 6% of digital receipts) may fit instead. Ask a chartered accountant if unsure.</p>
<div class="example"><p><strong>Example 1:</strong> ₹18 lakh of receipts means ₹9 lakh of profit. Under the new regime that is below ₹12 lakh, so tax is <strong>nil</strong>, and the TDS clients deducted is refunded when you file.</p>
<p><strong>Example 2:</strong> ₹30 lakh of receipts means ₹15 lakh of profit and tax of about <strong>₹1,09,200</strong> under the new regime.</p></div>
<h2>Advance tax, TDS and GST</h2>
<ul><li><strong>TDS:</strong> clients deduct 10% on professional fees above ₹50,000 a year (section 393, earlier 194J), 2% for technical services. It is credited against your tax.</li>
<li><strong>Advance tax:</strong> if you owe ₹10,000 or more after TDS, presumptive taxpayers can pay it all by 15 March. Otherwise it is due on 15 June, 15 September, 15 December and 15 March.</li>
<li><strong>GST:</strong> registration is needed once service turnover crosses ₹20 lakh a year (₹10 lakh in some special category states). Exports of services are zero rated but still count.</li></ul>''',
  faqs=[('Can I claim expenses under presumptive taxation?', 'No, the 50% deemed profit already allows for them. If your real expenses are above half your receipts, declaring actual profit with proper books can cost less, the calculator shows both.'),
        ('What if I have a job and freelance on the side?', 'Add your salary in the calculator. Salary keeps its ₹75,000 standard deduction, the freelance part is taxed on 50% of receipts, and both are added together for the slabs.'),
        ('Do foreign clients deduct TDS?', 'Usually not. That income is still fully taxable in India for a resident, so declare it even though it will not appear in Form 26AS.')],
  related=['income-tax-calculator', 'sip-calculator', 'fire-calculator']),

 dict(slug='hra-calculator', card='card_hra', cat='tax', run='runHra',
  title='HRA Exemption Calculator: How Much HRA Is Tax Free | CO₹PU$',
  desc='Calculate HRA exemption under the old tax regime. The lowest of actual HRA, 50% or 40% of salary, and rent minus 10% of salary, with a worked example and city list.',
  h1='HRA exemption calculator', intro='Work out how much of your house rent allowance is tax free under the old regime, from your basic salary, HRA and the rent you pay.',
  body='''<h2>How HRA exemption works</h2>
<p>If you live in a rented home and get HRA, the exempt part is the <strong>lowest</strong> of these three, all yearly:</p>
<ol><li>The HRA you actually received.</li><li>50% of basic + DA in Delhi, Mumbai, Chennai, Kolkata, Bengaluru, Hyderabad, Pune or Ahmedabad, 40% elsewhere.</li><li>Rent paid minus 10% of basic + DA.</li></ol>
<div class="example"><p><strong>Example:</strong> basic ₹6 lakh a year, HRA ₹2.4 lakh, rent ₹3 lakh, living in Bengaluru.</p><p>The three limits are ₹2.4 lakh, ₹3 lakh and ₹2.4 lakh, so <strong>₹2.4 lakh</strong> is exempt and none of the HRA is taxed.</p></div>
<p>HRA exemption is only available in the old regime. In the new regime HRA is fully taxable, so compare both with the income tax calculator.</p>''',
  faqs=[('Do I need my landlord’s PAN?', 'Yes, if the rent you pay is more than ₹1 lakh a year. Keep rent receipts or a rent agreement as proof either way.'),
        ('Can I pay rent to my parents and claim HRA?', 'Yes, if you really pay them by bank transfer and they own the house. They must show the rent as income in their own return.'),
        ('What if I get no HRA but pay rent?', 'Self employed people and employees without HRA may claim a smaller deduction under the old regime (the old section 80GG), subject to its limits.')],
  related=['income-tax-calculator', 'gratuity-calculator', 'emi-calculator']),

 dict(slug='fire-calculator', card='card_fire', cat='plan', run='runFire',
  title='FIRE Calculator India: Retire Early Number and SIP | CO₹PU$',
  desc='Find your FIRE number in India: the corpus you need to retire early, adjusted for inflation, with a safe withdrawal rate of 3 to 3.5% and the monthly SIP to get there.',
  h1='FIRE calculator', intro='Find the amount you need to stop depending on a salary, adjusted for Indian inflation, and the monthly investment that gets you there.',
  body='''<h2>What is FIRE?</h2>
<p>Financial Independence, Retire Early (FIRE) means saving and investing enough that the returns can pay your expenses for the rest of your life. Your <strong>FIRE number</strong> is that corpus.</p>
<h2>How it is calculated</h2>
<p class="formula">FIRE number = yearly expenses at retirement ÷ safe withdrawal rate</p>
<p>Today’s expenses are first grown by inflation to the year you plan to retire. Many Indian planners use a withdrawal rate of 3 to 3.5% rather than the American 4%, because inflation in India runs higher.</p>
<div class="example"><p><strong>Example:</strong> expenses of ₹60,000 a month at age 32, retiring at 50, with 6% inflation and a 3.5% withdrawal rate.</p><p>Expenses grow to about ₹1,71,260 a month by 50, so the FIRE number is about <strong>₹5.87 crore</strong>.</p></div>''',
  faqs=[('Is 3.5% a safe withdrawal rate?', 'It is a cautious rule of thumb for long Indian retirements, not a promise. A mix of equity and debt, and the flexibility to spend less in bad years, matter as much as the exact rate.'),
        ('Does FIRE mean I never work again?', 'Not necessarily. Many people use financial independence to choose lower paid but meaningful work, take breaks, or work part time.'),
        ('What should count as investments?', 'Count investments you can draw on: equity and debt funds, stocks, PPF, EPF and NPS (with their lock ins in mind). Leave out the house you live in.')],
  related=['sip-calculator', 'xirr-calculator', 'emi-calculator']),

 dict(slug='emi-calculator', card='h2:EMI', cat='loans', run='runEmi',
  title='EMI Calculator: Home, Car and Personal Loan EMI | CO₹PU$',
  desc='Free EMI calculator for home, car and personal loans. Monthly EMI, total interest and the formula explained with an example. Private, no sign up.',
  h1='EMI calculator', intro='Work out the monthly instalment on a home, car or personal loan, and how much you pay in interest over the full term.',
  body='''<h2>The EMI formula</h2>
<p class="formula">EMI = P × r × (1 + r)<sup>n</sup> ÷ [(1 + r)<sup>n</sup> − 1]</p>
<p><strong>P</strong> is the loan amount, <strong>r</strong> is the yearly interest rate divided by 12 (as a fraction) and <strong>n</strong> is the number of months.</p>
<div class="example"><p><strong>Example:</strong> a ₹50 lakh home loan at 8.5% for 20 years.</p><p>EMI is about <strong>₹43,391</strong> a month. Over 20 years you pay about ₹54.1 lakh in interest, more than the loan itself.</p></div>
<h2>How to pay less interest</h2>
<ul><li>Even small prepayments early in the loan cut interest sharply, because early EMIs are mostly interest.</li><li>Keeping the same EMI after a prepayment and shortening the term saves more than lowering the EMI.</li><li>Banks cannot charge a prepayment penalty on floating rate home loans to individuals.</li></ul>''',
  faqs=[('How much EMI can I afford?', 'A common guide is to keep all EMIs together under 40% of take-home pay, and lower if your income is irregular.'),
        ('Is a home loan tax deductible?', 'In the old regime, interest up to ₹2 lakh a year on a self occupied home and principal within the ₹1.5 lakh 80C limit can be claimed. The new regime does not allow these for a self occupied home.'),
        ('Fixed or floating rate?', 'Most Indian home loans are floating and linked to an external benchmark like the repo rate, so EMIs or tenure change when rates move. Fixed rates are usually higher and often reset after a few years.')],
  related=['sip-calculator', 'income-tax-calculator', 'fire-calculator']),

 dict(slug='gratuity-calculator', card='card_grat', cat='tax', run='runGrat',
  title='Gratuity Calculator India: Amount and Tax Free Limit | CO₹PU$',
  desc='Calculate gratuity: 15 days of last basic plus DA per year of service, rounding rules, eligibility after 5 years (1 for fixed term), ₹20 lakh tax free limit.',
  h1='Gratuity calculator', intro='Work out the gratuity you receive when you leave a job, and how much of it is tax free.',
  body='''<h2>The gratuity formula</h2>
<p class="formula">Gratuity = 15 ÷ 26 × last monthly basic + DA × years of service</p>
<p>A final year with more than six months counts as a full year. Regular employees qualify after five years of continuous service; under the labour codes, fixed term employees qualify after one year.</p>
<div class="example"><p><strong>Example:</strong> last basic + DA of ₹50,000 a month and 7 years 8 months of service.</p><p>That rounds to 8 years, so gratuity is about <strong>₹2,30,769</strong>.</p></div>
<p>Up to <strong>₹20 lakh</strong> of gratuity is tax free over your whole working life, across all employers.</p>''',
  faqs=[('Is gratuity paid if I resign before five years?', 'Usually not for regular employees, except on death or disability. Fixed term employees under the labour codes qualify after one year.'),
        ('Does my CTC include gratuity?', 'Many companies show about 4.81% of basic as gratuity in the CTC. You receive it only when you leave after becoming eligible.'),
        ('Is gratuity part of the payslip?', 'No, it is not paid monthly. It is a lump sum when you leave, retire, or in case of death or disability.')],
  related=['income-tax-calculator', 'hra-calculator', 'fire-calculator']),
]
