"""Country pages for search: /us/, /uk/ ... each with a tax calculator page.
Reads the same country data as the app (the JSON block in js/countries.js)
and works out every example with a Python twin of the app's tax engine."""
import html, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
esc = lambda s: html.escape(str(s), quote=True)

def load():
    s = open(os.path.join(ROOT, 'js', 'countries.js'), encoding='utf-8').read()
    return json.loads(s[s.index('/*DATA*/') + 8:s.index('/*END*/')])

ORDER = ['IN', 'US', 'UK', 'CA', 'AU', 'SG', 'AE', 'NZ']

# ---------------------------------------------------------------- engine twin
def band(x, frm, up):
    return max(0.0, min(x, float('inf') if up is None else up) - (frm or 0))

def progressive(x, brackets):
    tax, prev, parts = 0.0, 0.0, []
    for up, rate in brackets:
        top = float('inf') if up is None else up
        if x > prev:
            sl = min(x, top) - prev; tax += sl * rate; parts.append((prev, top, rate, sl * rate))
        prev = top
    return tax, parts

def piecewise(x, steps):
    for up, base, rate, frm in steps:
        if up is None or x <= up: return max(0.0, base + rate * (x - frm))
    return 0.0

def compute_tax(P, income, kind='salary', status=None, revenue=None, region=None, state_rate=0):
    T = P['tax']
    status = status or (T['statusOptions'][0][0] if T.get('statusOptions') else 'single')
    married = status == 'married' and 'married' in T
    S = T['married'] if married else T
    lines, acc = [], dict(deductible=0.0, levies=0.0, savings=0.0, credit=0.0)
    def apply(l, base):
        frm = l.get('fromMarried') if married and l.get('fromMarried') is not None else l.get('from', 0)
        amt = l['rate'] * band(base, frm, l.get('upTo'))
        if l.get('shadeIn'): amt = min(amt, l['shadeIn']['rate'] * max(0.0, base - l['shadeIn']['from']))
        if amt <= 0: return
        acc['savings' if l.get('type') == 'saving' else 'levies'] += amt
        acc['deductible'] += amt * l.get('deductibleShare', 0)
        acc['credit'] += amt * l.get('creditShare', 0)
        lines.append((l['label'], amt, l.get('type') == 'saving'))
    mine = [l for l in T.get('levies', []) if l['kind'] in ('both', kind) and (not l.get('onlyStatus') or l['onlyStatus'] == status)]
    for l in mine:
        if l.get('base') != 'taxable': apply(l, income * 0.9235 if l.get('base') == 'self9235' else income)
    levy_credits = acc['credit']
    credit_base = levy_credits + sum(c['amount'] for c in T.get('credits', []) if c['kind'] in ('both', kind))
    taxable, allowance = max(0.0, income - acc['deductible']), 0.0
    A = S['allowance'] if 'allowance' in S else T.get('allowance')
    if A and A['type'] == 'deduction':
        allowance = A['amount']
        if A.get('taper'): allowance = max(0.0, allowance - max(0.0, income - A['taper']['from']) * A['taper']['rate'])
        taxable = max(0.0, taxable - allowance)
    tax, parts = progressive(taxable, S.get('brackets', T['brackets']))
    if A and A['type'] == 'credit':
        allowance = A['amount'] if income <= A['from'] else A['amount'] - (A['amount'] - A['min']) * min(1, (income - A['from']) / (A['to'] - A['from']))
        tax = max(0.0, tax - (allowance + credit_base) * A['rate'])
    for o in T.get('offsets', []):
        tax -= min(tax, piecewise(taxable, o['steps']))
    if kind == 'self' and T.get('corporate'):
        c = T['corporate']; turnover = income if revenue is None else revenue
        tax = c['rate'] * max(0.0, income - c['threshold']) if turnover > c['minTurnover'] else 0.0
        taxable, parts = income, []
    for l in mine:
        if l.get('base') == 'taxable': apply(l, taxable)
    label = T['corporate']['label'] if kind == 'self' and T.get('corporate') else T.get('incomeTaxLabel', 'Income tax')
    lines.insert(0, (label, tax, False))
    region_tax = 0.0
    if T.get('regions'):
        key = region if region in T['regions']['list'] else T['regions']['default']
        R = T['regions']['list'][key]
        low = next((b[1] for b in R['brackets'] if b[1] > 0), 0)
        rt, _ = progressive(taxable, R['brackets'])
        rt = max(0.0, rt - (R['credit'] + levy_credits) * low)
        if R.get('surtax'): rt += sum(rate * max(0.0, rt - over) for over, rate in R['surtax'])
        if rt > 0: lines.insert(1, (f"{R['name']} income tax", rt, False)); region_tax += rt
        if R.get('premium'):
            pr = piecewise(taxable, R['premium'])
            if pr > 0: lines.insert(2, (R.get('premiumLabel', 'Health premium'), pr, False)); region_tax += pr
    if T.get('stateRate') and state_rate:
        st = max(0.0, income - acc['deductible'] - (allowance if A and A['type'] == 'deduction' else 0)) * state_rate / 100
        if st > 0: lines.insert(1, (f'State income tax ({state_rate}%, estimate)', st, False)); region_tax += st
    total = tax + acc['levies'] + region_tax
    return dict(income=income, taxable=taxable, allowance=allowance, incomeTax=tax, regionTax=region_tax, levies=acc['levies'], savings=acc['savings'], total=total,
                takeHome=income - total - acc['savings'], effective=(total / income if income else 0), lines=lines, parts=parts)

# ---------------------------------------------------------------- formatting
def money(P, n):
    n = round(n)
    s = f'{abs(n):,}'
    sym = P['symbol'].strip()
    return ('-' if n < 0 else '') + (sym + ' ' if sym.isalpha() else sym) + s

def pct(x): return (f'{x * 100:.1f}'.rstrip('0').rstrip('.')) + '%'

MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

def bracket_rows(P, brackets, on_taxable=True):
    rows, prev = [], 0
    for up, rate in brackets:
        lo = money(P, prev + (1 if prev else 0)) if prev else money(P, 0)
        rng = f'{lo} to {money(P, up)}' if up is not None else f'Over {money(P, prev)}'
        rows.append(f'<tr><td>{rng}</td><td class="num">{pct(rate)}</td></tr>')
        prev = up or prev
    return ''.join(rows)

def the(P): return ('the ' + P['short']) if P['code'] in ('US', 'UK', 'AE') else P['short']

# ---------------------------------------------------------------- page bodies
def landing_main(P, data):
    T = P['tax']; ex = P['example']
    r = compute_tax(P, ex)
    rs = compute_tax(P, ex, 'self', revenue=ex)
    retire = P.get('retire') or {}
    A = T.get('allowance')
    allowance_line = ''
    if A:
        allowance_line = f'<p><strong>{esc(A["label"])}:</strong> {money(P, A["amount"])}' + (' (tax credit at the lowest rate)' if A['type'] == 'credit' else '') + (f', reduced above {money(P, A["taper"]["from"])}' if A.get('taper') else '') + '.</p>'
    levies = [l for l in T.get('levies', [])]
    levy_list = ''.join(f'<li>{esc(l["label"])}{" (self-employed)" if l["kind"] == "self" else ""}{f", up to {money(P, l["upTo"])}" if l.get("upTo") else ""}{f", above {money(P, l["from"])}" if l.get("from") and l["kind"] != "self" else ""}</li>' for l in levies)
    married = ''
    if 'married' in T:
        married = f'<h3>Married filing jointly</h3><div class="imp-scroll"><table class="imp-table"><thead><tr><th>Taxable income</th><th class="num">Rate</th></tr></thead><tbody>{bracket_rows(P, T["married"]["brackets"])}</tbody></table></div><p>Standard deduction {money(P, T["married"]["allowance"]["amount"])}.</p>'
    if T.get('regions'):
        for key, R in T['regions']['list'].items():
            if R['brackets'] == [[None, 0]]: continue
            extra = []
            if R.get('surtax'): extra.append('a surtax of ' + ' and '.join(f'{pct(r)} on provincial tax over {money(P, o)}' for o, r in R['surtax']))
            if R.get('premium'): extra.append(f"the {R.get('premiumLabel', 'health premium')} of up to {money(P, max(st[1] for st in R['premium']))}")
            married += f'<h3>{esc(R["name"])}</h3><div class="imp-scroll"><table class="imp-table"><thead><tr><th>Taxable income</th><th class="num">Rate</th></tr></thead><tbody>{bracket_rows(P, R["brackets"])}</tbody></table></div><p>Basic personal amount {money(P, R["credit"])}{(", plus " + ", and ".join(extra)) if extra else ""}.</p>'
    deadlines = ''.join(f'<li><strong>{d} {MONTHS[m - 1]}</strong>: {esc(t)}</li>' for m, d, t in sorted(P.get('deadlines', []), key=lambda x: (x[0], x[1])))
    regs = ''.join(f'<li><a href="{esc(u)}" rel="noopener" target="_blank">{esc(n)}</a>: {esc(w)}</li>' for n, w, u in P.get('regulators', []))
    fl = P.get('freelance', {})
    others = ''.join(f'<a href="{(data[c]["slug"] + "/") if data[c]["slug"] else "index.html"}"><b class="cc-code">{c}</b> {esc(data[c]["name"])}<span>{esc(data[c]["tagline"])}</span></a>' for c in ORDER if c != P['code'])
    lines = ''.join(f'<div class="kv"><span>{esc(l)}</span><span>{money(P, a)}</span></div>' for l, a, _s in r['lines'])
    no_tax = T['brackets'] == [[None, 0]]
    tax_section = (f'''<h2>Personal Income Tax in {esc(the(P))}</h2>
      <p>{esc(" ".join(T["notes"]))}</p>''' if no_tax else f'''<h2>{esc(P["taxYear"])} Income Tax at a Glance</h2>
      <p>{esc(P["taxYearSpan"][0].upper() + P["taxYearSpan"][1:])}. Rules as of {esc(P["checked"])}.</p>
      {allowance_line}
      <div class="imp-scroll"><table class="imp-table"><thead><tr><th>{"Taxable income" if A else "Income"}</th><th class="num">Rate</th></tr></thead><tbody>{bracket_rows(P, T["brackets"])}</tbody></table></div>
      {married}
      {f"<h3>Payroll Contributions</h3><ul>{levy_list}</ul>" if levy_list else ""}
      <p class="hint">{esc(" ".join(T["notes"]))}</p>''')
    example = '' if no_tax else f'''<div class="example"><p><strong>Example:</strong> a salary of {money(P, ex)} a year.</p>{lines}
      <p>Total {money(P, r["total"])}, an effective rate of {pct(r["effective"])}. Take-home about <strong>{money(P, r["takeHome"])}</strong> a year, or {money(P, r["takeHome"] / 12)} a month{" after savings contributions" if r["savings"] else ""}.</p></div>'''
    return f'''
    <div class="page-head country-hero">
      <span class="cc-code">{P["code"]}</span>
      <h1>Net Worth Tracker and Money Planner for {esc(the(P)[0].upper() + the(P)[1:])}</h1>
      <p>Track everything you own and owe in {esc(P["currency"])}, see your {esc(P["taxYear"])} tax and take-home pay, and plan with {esc(retire.get("label", "your savings"))}, budgets and calculators. Free, private, and nothing leaves your device.</p>
      <div class="row-actions"><a class="btn" href="dashboard.html?country={P["code"]}">Open CO₹PU$ in {esc(P["symbol"].strip())}</a><a class="btn secondary" href="{P["slug"]}/income-tax-calculator.html">{esc(P["short"])} tax calculator</a></div>
    </div>
    <article class="card prose">
      <h2>What It Tracks in {esc(the(P)[0].upper() + the(P)[1:])}</h2>
      <ul>
        <li><strong>Bank balances, {esc(P["fdLabel"])}, stocks, funds and ETFs, gold, crypto, bonds and property</strong>, valued in {esc(P["currency"])}.</li>
        {f'<li><strong>{esc(retire["label"])}:</strong> {esc(", ".join(retire["types"]))}. {esc(retire.get("limits", ""))}</li>' if retire else ''}
        <li><strong>Loans and cards</strong>, with a payoff planner that shows which debt to clear first.</li>
        <li><strong>Imports</strong>: payslips, bank statements ({esc(P["dateOrder"].upper())} dates and local shop names understood), invoice lists and broker holdings, read inside your browser.</li>
      </ul>
      {tax_section}
      {example}
      <h2>Self-Employed and Freelancers</h2>
      <ul>{"".join(f"<li>{esc(x)}</li>" for x in fl.get("points", []))}<li>{esc(fl.get("vat", ""))}</li></ul>
      <p>On {money(P, ex)} of profit, tax and contributions come to about <strong>{money(P, rs["total"])}</strong>, so setting aside {money(P, rs["total"] / 12)} a month keeps you covered.</p>
      <h2>Key Dates</h2>
      <ul>{deadlines}</ul>
      <h2>If Something Goes Wrong</h2>
      <ul>{regs}</ul>
    </article>
    <section class="card" aria-labelledby="faqh"><h2 id="faqh">Common Questions</h2><div class="faq-list">{faq_html(P, r)}</div></section>
    <section class="card" aria-labelledby="othh"><h2 id="othh">Other Countries</h2><div class="related countries-related">{others}</div></section>'''

def faqs(P, r):
    T = P['tax']; ex = P['example']; retire = P.get('retire') or {}
    no_tax = T['brackets'] == [[None, 0]]
    out = []
    if no_tax:
        out.append((f'Is there income tax in {the(P)}?', f'No. {T["notes"][0]} {T["notes"][1] if len(T["notes"]) > 1 else ""}'))
    else:
        out.append((f'How much tax do I pay on {money(P, ex)} in {the(P)}?', f'For {P["taxYear"]}, about {money(P, r["total"])} in income tax and payroll contributions, an effective rate of {pct(r["effective"])}, leaving roughly {money(P, r["takeHome"])} a year. {T["notes"][0]}'))
        top = T['brackets'][-1][1]
        out.append((f'What are the {P["taxYear"]} tax rates?', f'Rates run from {pct(T["brackets"][0][1])} to {pct(top)}. The full table is above, and the calculator works out your own figure.'))
    if retire:
        out.append((f'Can I track {retire["types"][0]} and other {retire["label"]} accounts?', f'Yes. Add them under {retire["label"]} on the Assets page with your balance and monthly contribution, and they count towards your net worth and retirement projections. {retire.get("limits", "")}'))
    out.append(('Is my financial data uploaded anywhere?', 'No. Everything is stored only in your own browser on your device. There is no server, account or tracking, and imported documents are read in the page and never kept.'))
    return out

def faq_html(P, r):
    return ''.join(f'<details class="faq-item"><summary>{esc(q)}</summary><div class="faq-a"><p>{esc(a)}</p></div></details>' for q, a in faqs(P, r))

def calc_main(P, data, cards_html):
    T = P['tax']; ex = P['example']; r = compute_tax(P, ex)
    others = ''.join(f'<a href="{(data[c]["slug"] + "/income-tax-calculator.html") if data[c]["slug"] else "income-tax-calculator.html"}"><b class="cc-code">{c}</b> {esc(data[c]["short"])} income tax<span>{esc(data[c]["taxYear"])}</span></a>' for c in ORDER if c != P['code'])
    no_tax = T['brackets'] == [[None, 0]]
    head = f'{P["short"]} Income Tax Calculator' if not no_tax else 'UAE Take-Home Pay, Gratuity and Business Tax Calculator'
    return head, f'''
    <div class="page-head">
      <h1>{esc(head)}</h1>
      <p>{esc(P["taxYear"])} ({esc(P["taxYearSpan"])}). {"Income tax and payroll contributions on a salary, and tax on self-employed profit." if not no_tax else "No personal income tax: see take-home pay, end of service gratuity and the corporate tax on business profit."} Rules as of {esc(P["checked"])}. Free and private.</p>
    </div>
    <section class="calc-group"><div class="calc-grid" style="display:grid;grid-template-columns:minmax(0,1fr)">{cards_html}</div></section>
    <article class="card prose">
      <h2>How It Is Worked Out</h2>
      <p>{esc(" ".join(T["notes"]))}</p>
      {"" if no_tax else f'<div class="imp-scroll"><table class="imp-table"><thead><tr><th>Taxable income</th><th class="num">Rate</th></tr></thead><tbody>{bracket_rows(P, T["brackets"])}</tbody></table></div>'}
      {"" if no_tax else f'<div class="example"><p><strong>Example:</strong> {money(P, ex)} a year comes to about {money(P, r["total"])} in tax and contributions, taking home {money(P, r["takeHome"])}.</p></div>'}
      <p><a href="{P["slug"]}/">Everything else for {esc(the(P))}</a>: accounts, deadlines and where to complain.</p>
    </article>
    <section class="card" aria-labelledby="othh"><h2 id="othh">Tax Calculators for Other Countries</h2><div class="related countries-related">{others}</div></section>'''

def page_cfg(P):
    no_tax = P['tax']['brackets'] == [[None, 0]]
    year = re.sub(r'^(Tax year|Income year|Year of Assessment|FY)\s*', '', P['taxYear'])
    land = dict(index=True, pri='0.8', freq='monthly', crumb=P['name'], country=P['code'],
                title=f'{P["short"]} Net Worth Tracker and {year} Tax Calculator | CO₹PU$' if not no_tax else 'UAE Net Worth Tracker, Gratuity and Savings Planner | CO₹PU$',
                desc=(f'Track net worth in {P["currency"]}, see {P["taxYear"]} tax and take-home pay, {P["retire"]["label"] if P.get("retire") else "savings"}, budgets and calculators for {the(P)}. Private, no sign up.')[:160])
    calc = dict(index=True, pri='0.8', freq='monthly', crumb='Income Tax Calculator', country=P['code'], parent=(P['slug'] + '/', P['name']),
                title=(f'{P["short"]} Income Tax Calculator {year}: Take-Home Pay | CO₹PU$' if not no_tax else 'UAE Salary, Gratuity and Corporate Tax Calculator | CO₹PU$'),
                desc=(f'Free {P["short"]} income tax calculator for {P["taxYear"]}: brackets, {", ".join(l["label"].split(" (")[0] for l in P["tax"]["levies"] if l["kind"] != "self")[:60] or "allowances"}, take-home pay and self-employed tax.' if not no_tax else 'No personal income tax in the UAE: work out take-home pay, end of service gratuity, and 9% corporate tax on business profit above AED 375,000.')[:160])
    return land, calc
