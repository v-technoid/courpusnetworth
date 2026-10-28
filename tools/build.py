#!/usr/bin/env python3
"""
CO₹PU$ site build. Plain Python 3, no packages needed.

    python3 tools/build.py --url https://your-domain.example

What it does (safe to run again and again):
  * builds faq.html and the FAQ block on the landing page from tools/faq_data.py
  * builds one standalone page per popular calculator from tools/calc_pages.py
  * writes the <head> of every page: title, description, canonical URL,
    robots, Open Graph and Twitter cards, and JSON-LD structured data
  * writes sitemap.xml, robots.txt and llms.txt
  * refreshes the offline file list and version in sw.js

The site works without running this. Run it before publishing, with the
address the site will live at, so search engines get correct absolute URLs.
"""
import argparse, datetime, html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from faq_data import FAQ            # noqa: E402
from calc_pages import CALCS        # noqa: E402
from titlecase import title_case, headings  # noqa: E402
import country_pages as CP  # noqa: E402
import guides_data as GD  # noqa: E402
import guides_pages as GPG  # noqa: E402
CDATA = CP.load()

NAME = 'CO₹PU$'
TODAY = datetime.date.today().isoformat()

# ------------------------------------------------------------------ pages
# index: True = public content worth finding in search. False = a personal,
# data-driven screen that is empty for a search engine, so it is kept out.
PAGES = {
 'index.html': dict(index=True, pri='1.0', freq='weekly',
   title='CO₹PU$: Private Net Worth Tracker for India, USA, UK and More',
   desc='Free private net worth tracker and tax calculator for India, USA, UK, Canada, Australia, Singapore, UAE and New Zealand. Runs in your browser, nothing uploaded.'),
 'import.html': dict(index=True, pri='0.9', freq='monthly', crumb='Import Documents',
   title='Salary Slip, Bank Statement and Form 16 Analyzer, Private | CO₹PU$',
   desc='Read a payslip, Form 16, bank statement, invoices, 26AS, CAS or holdings offline in your browser to fill your budget, tax and net worth. Nothing is uploaded.'),
 'calculators.html': dict(index=True, pri='0.9', freq='monthly', crumb='Calculators',
   title='22 Free Financial Calculators: SIP, XIRR, Income Tax, EMI, FIRE | CO₹PU$',
   desc='SIP, step up SIP, XIRR, CAGR, PPF, Sukanya, FIRE, EMI, prepayment, old vs new income tax, HRA, gratuity, freelancer tax and more. Free, private, explained in plain words.'),
 'faq.html': dict(index=True, pri='0.8', freq='monthly', crumb='FAQ',
   title='FAQ: Privacy, Imports, Tax and Freelancers | CO₹PU$',
   desc='Plain answers about CO₹PU$: where data is stored, importing payslips and bank statements, net worth, XIRR, old vs new tax regime, freelancer tax, advance tax and GST.'),
 'budget.html': dict(index=True, pri='0.7', freq='monthly', crumb='Budget',
   title='Monthly Budget Planner with 50/30/20 Check | CO₹PU$',
   desc='Plan your monthly budget: needs, wants and savings, your savings rate, and how you compare with the 50/30/20 guide. Fill it automatically from a bank statement. Private.'),
 'tax.html': dict(index=True, pri='0.7', freq='monthly', crumb='Tax',
   title='Tax on Investments in India: Capital Gains, FD, 80C, NPS | CO₹PU$',
   desc='How capital gains, FD interest, 80C, NPS and rental income are taxed in India, with calculators for each. Updated for tax year 2026-27.'),
 'audit.html': dict(index=True, pri='0.6', freq='monthly', crumb='Pre-Filing Audit',
   title='Pre Filing Tax Check: TDS, AIS, Advance Tax, Cash Limits | CO₹PU$',
   desc='Check before filing your return: TDS thresholds, high value transactions in AIS, cash limits, LRS remittance TCS and whether advance tax applies.'),
 'insurance.html': dict(index=True, pri='0.7', freq='monthly', crumb='Insurance',
   title='How Much Term and Health Insurance Do I Need? Calculator | CO₹PU$',
   desc='Work out the term life and health cover that fits your income, age, family and state, with plain pros and cons of each type of insurance in India.'),
 'schemes.html': dict(index=True, pri='0.6', freq='monthly', crumb='Govt Schemes',
   title='Government Schemes for Savings and Insurance in India | CO₹PU$',
   desc='PPF, SSY, NPS, APY, PMJJBY, PMSBY and more: who can join, how much, and what you get, explained simply.'),
 'states.html': dict(index=True, pri='0.6', freq='monthly', crumb='State Resources',
   title='State Health Schemes and Resources Across India | CO₹PU$',
   desc='Free and subsidised state health insurance schemes across Indian states, who qualifies and how to apply.'),
 'scholarships.html': dict(index=True, pri='0.6', freq='monthly', crumb='Scholarships',
   title='Scholarships in India: Central and State Schemes | CO₹PU$',
   desc='Central and state scholarships for school and college students in India, with eligibility and where to apply.'),
 'disputes.html': dict(index=True, pri='0.6', freq='monthly', crumb='Disputes',
   title='Complaint Against a Bank, Insurer or Broker: Where to Go | CO₹PU$',
   desc='Escalate unresolved complaints: RBI CMS, SEBI SCORES, IRDAI Bima Bharosa, Insurance Ombudsman, EPFO, NPS, consumer courts and the 1930 cyber fraud helpline.'),
 'about.html': dict(index=True, pri='0.4', freq='yearly', crumb='About',
   title='About CO₹PU$: How It Works Without a Server',
   desc='Why CO₹PU$ runs entirely in your browser, how numbers and tax rules are worked out, where live prices come from, and the open source libraries it uses.'),
 'privacy.html': dict(index=True, pri='0.3', freq='yearly', crumb='Privacy Policy and Disclaimer',
   title='Privacy Policy and Disclaimer | CO₹PU$',
   desc='CO₹PU$ collects nothing and is not financial advice. See who to check with, the official sources and the privacy law in India, the USA, UK, Canada, Australia, Singapore, UAE and New Zealand.'),
 'dashboard.html': dict(index=False, title='Dashboard | CO₹PU$', desc='Your net worth, health score, allocation and upcoming dates.'),
 'charts.html': dict(index=False, title='Charts | CO₹PU$', desc='Charts of your allocation, gains, debt and net worth trend.'),
 'assets.html': dict(index=False, title='Assets | CO₹PU$', desc='Your bank balances, deposits, retirement accounts, investments and property.'),
 'liabilities.html': dict(index=False, title='Liabilities | CO₹PU$', desc='Your loans, cards and the debt payoff planner.'),
 'goals.html': dict(index=False, title='Goals | CO₹PU$', desc='Your financial goals and the monthly SIP each one needs.'),
 'reports.html': dict(index=False, title='Reports and advice | CO₹PU$', desc='Your full health check and where you may be losing money.'),
 'settings.html': dict(index=False, title='Settings | CO₹PU$', desc='Your details, price keys, backup and restore.'),
 '404.html': dict(index=False, title='Page not found | CO₹PU$', desc='This page does not exist.'),
}
for c in CALCS:
    PAGES[c['slug'] + '.html'] = dict(index=True, pri='0.8', freq='monthly', crumb=title_case(c['h1']), parent=('calculators.html', 'Calculators'),
                                      title=c['title'], desc=c['desc'], calc=c)
for _c in CP.ORDER[1:]:
    _P = CDATA[_c]; _land, _calc = CP.page_cfg(_P)
    PAGES[_P['slug'] + '/index.html'] = _land
    PAGES[_P['slug'] + '/income-tax-calculator.html'] = _calc
for _c in CP.ORDER[1:]:
    _P = CDATA[_c]
    for _key, _file, _crumb, _title, _desc in GPG.PAGES:
        PAGES[_P['slug'] + '/' + _file] = dict(index=True, pri='0.6', freq='monthly', crumb=_crumb, country=_c, parent=(_P['slug'] + '/', _P['name']),
                                              title=(_title(_P) + ' | CO₹PU$'), desc=_desc(_P)[:160])
# pages that exist in one version per country, linked with hreflang
ALTERNATES = {
    'home': {c: ('index.html' if c == 'IN' else CDATA[c]['slug'] + '/index.html') for c in CP.ORDER},
    'taxcalc': {c: ('income-tax-calculator.html' if c == 'IN' else CDATA[c]['slug'] + '/income-tax-calculator.html') for c in CP.ORDER},
    'insurance': {c: ('insurance.html' if c == 'IN' else CDATA[c]['slug'] + '/insurance.html') for c in CP.ORDER},
    'schemes': {c: ('schemes.html' if c == 'IN' else CDATA[c]['slug'] + '/benefits.html') for c in CP.ORDER},
    'students': {c: ('scholarships.html' if c == 'IN' else CDATA[c]['slug'] + '/student-aid.html') for c in CP.ORDER},
}
def alternates_for(page):
    for grp in ALTERNATES.values():
        if page in grp.values(): return grp
    return None
CLEAN_URLS = False   # set by --clean-urls: Cloudflare Pages serves /about.html at /about
VERCEL = False       # set by --vercel: also write vercel.json and .vercelignore
def page_url(url, page):
    path = '' if page == 'index.html' else page[:-len('index.html')] if page.endswith('/index.html') else page
    if CLEAN_URLS and path.endswith('.html'): path = path[:-5]
    return url + '/' + path
PAGES['import.html']['app'] = True
PAGES['calculators.html']['app'] = True

def esc(s): return html.escape(s, quote=True)
def strip_tags(s): return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()

# ------------------------------------------------------------------ JSON-LD
def ld(obj): return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False, separators=(',', ':')) + '</script>'
def org(url): return {'@type': 'Organization', '@id': url + '/#org', 'name': NAME, 'alternateName': 'Corpus', 'url': url + '/', 'logo': url + '/assets/icon-512.png'}
def crumbs_ld(url, items):
    return {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': page_url(url, h if not h.endswith('/') else h + 'index.html')} for i, (h, n) in enumerate(items)]}
def faq_ld(pairs): return {'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': strip_tags(q), 'acceptedAnswer': {'@type': 'Answer', 'text': strip_tags(a)}} for q, a in pairs]}
def app_ld(url, page, name, desc, features=None):
    o = {'@type': 'WebApplication', 'name': name, 'url': url + '/' + page, 'description': desc, 'applicationCategory': 'FinanceApplication', 'operatingSystem': 'Any (runs in a web browser)',
         'browserRequirements': 'Requires JavaScript', 'inLanguage': 'en-IN', 'isAccessibleForFree': True, 'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'INR'}, 'publisher': {'@id': url + '/#org'}}
    if features: o['featureList'] = features
    return o

def head_block(url, page, cfg, extra_ld):
    canon = page_url(url, page)
    robots = 'index, follow, max-image-preview:large, max-snippet:-1' if cfg['index'] else 'noindex, follow'
    img = url + '/assets/og-image.png'
    out = ['<!-- seo:start -->', f'<title>{esc(cfg["title"])}</title>', f'<meta name="description" content="{esc(cfg["desc"])}">', f'<meta name="robots" content="{robots}">']
    if page != '404.html':
        out.append(f'<link rel="canonical" href="{canon}">')
        grp = alternates_for(page)
        if grp:
            out += [f'<link rel="alternate" hreflang="{CDATA[c]["hreflang"]}" href="{page_url(url, pg)}">' for c, pg in grp.items()]
            out.append(f'<link rel="alternate" hreflang="x-default" href="{page_url(url, grp["IN"])}">')
    out += ['<meta property="og:type" content="website">', f'<meta property="og:site_name" content="{NAME}">', f'<meta property="og:locale" content="{CDATA[cfg.get("country", "IN")]["hreflang"].replace("-", "_")}">',
            f'<meta property="og:title" content="{esc(cfg["title"])}">', f'<meta property="og:description" content="{esc(cfg["desc"])}">',
            f'<meta property="og:url" content="{canon}">', f'<meta property="og:image" content="{img}">', '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">',
            f'<meta property="og:image:alt" content="{NAME}: every rupee you own, added up privately in your browser">',
            '<meta name="twitter:card" content="summary_large_image">', f'<meta name="twitter:title" content="{esc(cfg["title"])}">', f'<meta name="twitter:description" content="{esc(cfg["desc"])}">', f'<meta name="twitter:image" content="{img}">',
            f'<meta name="application-name" content="{NAME}">', '<meta name="apple-mobile-web-app-title" content="Corpus">', '<meta name="format-detection" content="telephone=no">']
    if extra_ld:
        out.append(ld({'@context': 'https://schema.org', '@graph': extra_ld}))
    out.append('<!-- seo:end -->')
    return '\n'.join(out)

def page_ld(url, page, cfg):
    g = []
    trail = [('index.html', 'Home')]
    if cfg.get('parent'): trail.append(cfg['parent'])
    if page == 'index.html':
        g += [{'@type': 'WebSite', '@id': url + '/#site', 'name': NAME, 'alternateName': 'Corpus', 'url': url + '/', 'inLanguage': 'en-IN', 'publisher': {'@id': url + '/#org'}}, org(url),
              app_ld(url, '', NAME, cfg['desc'], ['Net worth tracking across 13 asset types', 'Import payslips, tax forms, bank statements, invoices, fund statements and broker holdings', 'Income tax on current rules for India, USA, UK, Canada, Australia, Singapore, UAE and New Zealand', 'Offline text recognition for photos of documents',
                     'Financial health score', 'Budget with 50/30/20 check', '22 calculators including SIP, XIRR, FIRE, EMI, income tax and freelancer tax', 'Tax deadline reminders', 'Works offline, no account, no server']),
              ]  # FAQPage markup lives only on faq.html: Google asks for one marked up copy per site
        return g
    if cfg['index']:
        g.append(org(url))
        g.append(crumbs_ld(url, trail + [(page, title_case(cfg.get('crumb', cfg['title'])))]))
    if page == 'faq.html': g.append(faq_ld([(q, a) for _, _, items in FAQ for (_id, q, a, _h) in items]))
    if cfg.get('country') and page.endswith('/index.html'):
        P = CDATA[cfg['country']]; g.append(faq_ld(CP.faqs(P, CP.compute_tax(P, P['example']))))
    if cfg.get('country') and page.endswith('income-tax-calculator.html'):
        g.append(app_ld(url, page, cfg['title'].split(' | ')[0], cfg['desc']))
    if cfg.get('calc'):
        c = cfg['calc']; g.append(app_ld(url, page, title_case(c['h1']), c['desc'])); g.append(faq_ld(c['faqs']))
    if page in ('import.html', 'calculators.html'): g.append(app_ld(url, page, cfg['title'].split(' | ')[0], cfg['desc']))
    return g

def set_head(path, url, page, cfg):
    s = open(path, encoding='utf-8').read()
    s = re.sub(r'<html lang="[^"]*"', '<html lang="en-IN"', s, count=1)
    s = re.sub(r'\s*<!-- seo:start -->.*?<!-- seo:end -->', '', s, flags=re.S)
    s = re.sub(r'\s*<title>.*?</title>', '', s, count=1, flags=re.S)
    s = re.sub(r'\s*<meta name="description"[^>]*>', '', s, count=1)
    s = re.sub(r'\s*<base href="[^"]*">', '', s)
    block = head_block(url, page, cfg, page_ld(url, page, cfg))
    if page == '404.html':
        base = re.sub(r'^https?://[^/]+', '', url) + '/'
        block = f'<base href="{base}">\n' + block
    elif '/' in page:
        block = '<base href="' + '../' * page.count('/') + '">\n' + block
    s = s.replace('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">', '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + block, 1)
    open(path, 'w', encoding='utf-8').write(s)

# ------------------------------------------------------------------ page shell
def shell(title, main, scripts='<script src="js/storage.js"></script>\n<script src="js/countries.js"></script>\n<script src="js/nav.js"></script>'):
    return f'''<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(title)}</title>
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<meta name="theme-color" content="#F6F6F3" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#14111A" media="(prefers-color-scheme: dark)">
<link rel="stylesheet" href="css/style.css">
<script>try{{var t=localStorage.getItem('corpus_theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}}catch(e){{}}</script>
</head>
<body>
<div class="shell">
  <aside class="sidebar"></aside>
  <main class="main">
{main}
  </main>
</div>
{scripts}
<script>if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){{addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{{}}));}}</script>
</body>
</html>
'''

def crumbs_html(items):
    lis = ''.join(f'<li><a href="{h}">{esc(n)}</a></li>' for h, n in items[:-1]) + f'<li aria-current="page">{esc(items[-1][1])}</li>'
    return f'    <nav class="crumbs" aria-label="Breadcrumb"><ol>{lis}</ol></nav>'

def faq_items_html(items, cls='faq-item'):
    return '\n'.join(f'<details class="{cls}" id="{i}"><summary>{esc(q)}</summary><div class="faq-a">{a}</div></details>' for i, q, a in items)

# ------------------------------------------------------------------ FAQ page + landing block
def build_faq():
    total = sum(len(items) for _, _, items in FAQ)
    cats = ''.join(f'<a href="#{key}">{esc(title_case(label))}</a>' for key, label, _ in FAQ)
    groups = '\n'.join(f'''    <section class="card faq-group" id="{key}" aria-labelledby="{key}-h">
      <h2 id="{key}-h">{esc(title_case(label))}</h2>
      <div class="faq-list">
{faq_items_html([(i, q, a) for i, q, a, _h in items])}
      </div>
    </section>''' for key, label, items in FAQ)
    main = f'''{crumbs_html([('index.html', 'Home'), ('faq.html', 'FAQ')])}
    <div class="page-head">
      <h1>Frequently Asked Questions</h1>
      <p>{total} plain answers about privacy, importing documents, the numbers, tax and freelancing. Can’t find yours? Every page explains its own working too.</p>
    </div>
    <div class="search" style="max-width:420px; margin-bottom:12px;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input type="search" id="faqSearch" placeholder="Search questions, e.g. password, GST, XIRR" aria-label="Search questions">
    </div>
    <nav class="faq-cats" aria-label="FAQ topics">{cats}</nav>
{groups}
    <p class="empty" id="faqNone" hidden>No question matches that. Try a shorter word.</p>'''
    script = '''<script src="js/storage.js"></script>
<script src="js/countries.js"></script>
<script src="js/nav.js"></script>
<script>
(function(){
  const input = document.getElementById('faqSearch');
  const items = [...document.querySelectorAll('.faq-item')];
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase(); let any = false;
    items.forEach(d => { const hit = !q || d.textContent.toLowerCase().includes(q); d.hidden = !hit; if(q && hit) d.open = true; any = any || hit; });
    document.querySelectorAll('.faq-group').forEach(g => g.hidden = ![...g.querySelectorAll('.faq-item')].some(d => !d.hidden));
    document.getElementById('faqNone').hidden = any;
  });
  // open the question named in the address, e.g. faq.html#password-pdf
  const id = location.hash.slice(1); const t = id && document.getElementById(id);
  if(t && t.tagName === 'DETAILS'){ t.open = true; setTimeout(() => t.scrollIntoView({ block: 'center' }), 50); }
})();
</script>'''
    open(os.path.join(ROOT, 'faq.html'), 'w', encoding='utf-8').write(shell('FAQ', main, script))
    # landing block
    # the landing page gets short answers that link to the full ones, so the two
    # pages do not repeat each other word for word
    home = [(i, q, f'<p>{esc(h)}</p><p><a href="faq.html#{i}">Read the full answer</a></p>') for _, _, items in FAQ for (i, q, a, h) in items if h]
    block = f'''<!-- faq:start -->
<section class="lp-section" id="faq">
  <h2 class="lp-h2 lp-center">Questions, answered plainly.</h2>
  <div class="lp-faq faq-list">
{faq_items_html(home)}
  </div>
  <p class="lp-center lp-more"><a href="faq.html">See all {total} questions →</a></p>
</section>
<!-- faq:end -->'''
    p = os.path.join(ROOT, 'index.html'); s = open(p, encoding='utf-8').read()
    if '<!-- faq:start -->' in s:
        s = re.sub(r'<!-- faq:start -->.*?<!-- faq:end -->', lambda m: block, s, flags=re.S)
        open(p, 'w', encoding='utf-8').write(s)
    else:
        print('note: index.html has no <!-- faq:start --> marker, landing FAQ not written')

# ------------------------------------------------------------------ calculator pages
def extract_card(src, card):
    if card.startswith('h2:'):
        h = src.index('<h2>' + card[3:] + '</h2>')
        start = src.rindex('<div class="card"', 0, h)
    else:
        start = src.rindex('<div', 0, src.index(f'id="{card}"'))
    depth, i = 0, start
    for m in re.finditer(r'<div\b|</div>', src[start:]):
        depth += 1 if m.group(0) != '</div>' else -1
        if depth == 0:
            return src[start:start + m.end()]
    raise ValueError('unbalanced card ' + card)

def build_calcs():
    src = open(os.path.join(ROOT, 'calculators.html'), encoding='utf-8').read()
    scripts = src[src.index('<script src="js/storage.js"></script>'):src.index("<script>if('serviceWorker'")].strip()
    by_slug = {c['slug']: c for c in CALCS}
    for c in CALCS:
        card = extract_card(src, c['card'])
        faqs = faq_items_html([(f'q{k + 1}', q, f'<p>{a}</p>') for k, (q, a) in enumerate(c['faqs'])])
        rel = ''.join(f'<a href="{r}.html">{esc(title_case(by_slug[r]["h1"]))}<span>{esc(by_slug[r]["intro"].split(",")[0][:70])}</span></a>' for r in c['related'] if r in by_slug)
        rel += '<a href="calculators.html">All 22 calculators<span>Investing, loans, tax, planning</span></a>'
        h1 = title_case(c['h1'])
        main = f'''{crumbs_html([('index.html', 'Home'), ('calculators.html', 'Calculators'), (c['slug'] + '.html', h1)])}
    <div class="page-head">
      <h1>{esc(h1)}</h1>
      <p>{esc(c['intro'])} Free, private, nothing to sign up for.</p>
    </div>
    <section class="calc-group" data-cat="{c['cat']}"><div class="calc-grid" style="display:grid;grid-template-columns:minmax(0,1fr)">
      {card}
    </div></section>
    <article class="card prose">
{c['body']}
    </article>
    <section class="card" aria-labelledby="faqh"><h2 id="faqh">Common Questions</h2><div class="faq-list">
{faqs}
    </div></section>
    <section class="card" aria-labelledby="relh"><h2 id="relh">Related Calculators</h2><div class="related">{rel}</div>
      <p class="hint" style="margin-top:14px">Want these filled in for you? <a href="import.html">Import a payslip, bank statement or invoice list</a>, it is read privately in your browser.</p></section>'''
        page = shell(h1, main, scripts + f"\n<script>addEventListener('load', () => {{ try{{ {c['run']}(); }}catch(e){{}} }});</script>")
        open(os.path.join(ROOT, c['slug'] + '.html'), 'w', encoding='utf-8').write(page)

# ------------------------------------------------------------------ sitemap, robots, llms, service worker
def build_countries():
    src = open(os.path.join(ROOT, 'calculators.html'), encoding='utf-8').read()
    scripts = src[src.index('<script src="js/storage.js"></script>'):src.index("<script>if('serviceWorker'")].strip()
    clean = lambda h: re.sub(r'\s+data-(only|not)="[^"]*"', '', h)
    for c in CP.ORDER[1:]:
        P = CDATA[c]; d = os.path.join(ROOT, P['slug']); os.makedirs(d, exist_ok=True)
        crumbs = crumbs_html([('index.html', 'Home'), (P['slug'] + '/', P['name'])])
        page = shell(P['name'], crumbs + CP.landing_main(P, CDATA)).replace('<html lang="en-IN">', f'<html lang="{P["hreflang"]}" data-page-country="{c}">')
        open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(page)
        cards = clean(extract_card(src, 'card_ctax')) + clean(extract_card(src, 'card_cfree')) + (clean(extract_card(src, 'card_cgrat')) if c == 'AE' else '')
        head, main = CP.calc_main(P, CDATA, cards)
        crumbs2 = crumbs_html([('index.html', 'Home'), (P['slug'] + '/', P['name']), (P['slug'] + '/income-tax-calculator.html', 'Income Tax Calculator')])
        run = "addEventListener('load', () => { try{ runCtax(); runCfree(); if(window.runCgrat && document.getElementById('cg2_b')) runCgrat(); }catch(e){} });"
        page = shell(head, crumbs2 + main, scripts + f'\n<script>{run}</script>').replace('<html lang="en-IN">', f'<html lang="{P["hreflang"]}" data-page-country="{c}">')
        open(os.path.join(d, 'income-tax-calculator.html'), 'w', encoding='utf-8').write(page)
        # insurance, schemes and student aid guides, readable without scripts
        G = GD.GUIDES[c]; base = '<script src="js/storage.js"></script>\n<script src="js/countries.js"></script>\n<script src="js/nav.js"></script>'
        for key, fname, crumb, title, _d in GPG.PAGES:
            h1 = title_case(title(P))
            body = {'insurance': GPG.insurance_html, 'schemes': GPG.schemes_html, 'students': GPG.students_html}[key](P, G, GD.CHECKED)
            main = crumbs_html([('index.html', 'Home'), (P['slug'] + '/', P['name']), (P['slug'] + '/' + fname, crumb)]) + f'''
    <div class="page-head"><h1>{esc(h1)}</h1><p>{esc(_d(P))}</p></div>
    {body}'''
            sc = base + ('\n<script src="js/finance.js"></script>\n<script src="js/compute.js"></script>\n<script src="js/guides.js"></script>\n<script src="js/insurance-world.js"></script>' if key == 'insurance' else '')
            page = shell(h1, main, sc).replace('<html lang="en-IN">', f'<html lang="{P["hreflang"]}" data-page-country="{c}">')
            open(os.path.join(d, fname), 'w', encoding='utf-8').write(page)
    open(os.path.join(ROOT, 'js', 'guides.js'), 'w', encoding='utf-8').write(GPG.js_payload(GD.GUIDES, CDATA, GD.CHECKED))

def write_vercel_json():
    """Only for Vercel (build.py --vercel). Vercel ignores _headers, so the same
    rules are written to vercel.json. Cloudflare Pages reads _headers directly."""
    rules, cur = [], None
    for line in open(os.path.join(ROOT, '_headers'), encoding='utf-8').read().splitlines():
        if not line.strip() or line.lstrip().startswith('#'): continue
        if not line.startswith((' ', '\t')):
            cur = {'path': line.strip(), 'headers': []}; rules.append(cur)
        elif cur is not None and ':' in line:
            k, v = line.strip().split(':', 1); cur['headers'].append({'key': k.strip(), 'value': v.strip()})
    def to_source(p):
        if p == '/*': return '/(.*)'
        if p.startswith('/*.'): return '/(.*)\\.' + p[3:]
        return p.replace('/*', '/(.*)')
    cfg = {'$schema': 'https://openapi.vercel.sh/vercel.json', 'cleanUrls': False,
           'headers': [{'source': to_source(r['path']), 'headers': r['headers']} for r in rules]}
    json.dump(cfg, open(os.path.join(ROOT, 'vercel.json'), 'w'), indent=2)
    open(os.path.join(ROOT, '.vercelignore'), 'w').write('tools\nREADME.md\n.pagesignore\n')

def remove_vercel_files():
    for f in ('vercel.json', '.vercelignore'):
        p = os.path.join(ROOT, f)
        if os.path.exists(p): os.remove(p)

def write_seo_files(url):
    urls = []
    for page, cfg in PAGES.items():
        if not cfg['index']: continue
        loc = page_url(url, page)
        grp = alternates_for(page)
        alts = ''
        if grp:
            alts = ''.join(f'\n    <xhtml:link rel="alternate" hreflang="{CDATA[c]["hreflang"]}" href="{page_url(url, pg)}"/>' for c, pg in grp.items())
            alts += f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{page_url(url, grp["IN"])}"/>\n  '
        urls.append(f'  <url><loc>{loc}</loc><lastmod>{TODAY}</lastmod><changefreq>{cfg.get("freq", "monthly")}</changefreq><priority>{cfg.get("pri", "0.5")}</priority>{alts}</url>')
    open(os.path.join(ROOT, 'sitemap.xml'), 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + '\n'.join(urls) + '\n</urlset>\n')
    write_vercel_json() if VERCEL else remove_vercel_files()
    open(os.path.join(ROOT, 'robots.txt'), 'w').write(f'''# CO₹PU$ has no server-side data, so everything public is fine to crawl.
# Personal screens (dashboard, assets...) carry a noindex tag instead of a block here,
# so crawlers can still see that tag.
User-agent: *
Allow: /
Disallow: /tools/

Sitemap: {url}/sitemap.xml
''')
    calc_lines = '\n'.join(f'- [{title_case(c["h1"])}]({url}/{c["slug"]}.html): {c["intro"]}' for c in CALCS)
    open(os.path.join(ROOT, 'llms.txt'), 'w').write(f'''# {NAME}

> A free, private net worth tracker and money planner for India, the USA, UK, Canada, Australia, Singapore, the UAE and New Zealand that runs entirely in the browser, with each country's current tax rules built in. No server, no account, no AI service. Users add or import their payslips, tax forms, bank statements, invoices, broker holdings and fund statements (in India also Form 16, Form 26AS, mutual fund CAS and EPF passbooks); files are read offline on the device and never uploaded.

Tax figures follow the Income-tax Act 2025 for tax year 2026-27 (checked October 2026). Renumbered sections are shown with their old numbers, for example section 58 (old 44ADA) and section 393 (old 194J).

## Main pages
- [Home]({url}/): what it does and why it is private
- [Import documents]({url}/import.html): payslip, Form 16, bank statement, invoices, 26AS/AIS, CAS, holdings and EPF passbook reader
- [Calculators]({url}/calculators.html): 22 calculators for investing, loans, tax and planning
- [FAQ]({url}/faq.html): privacy, imports, tax, freelancers
- [Privacy policy]({url}/privacy.html)
- [About]({url}/about.html)

## Calculators
{calc_lines}
''')

def update_sw():
    p = os.path.join(ROOT, 'sw.js'); s = open(p, encoding='utf-8').read()
    files = []
    for dp, dn, fn in os.walk(ROOT):
        rel = os.path.relpath(dp, ROOT).replace(os.sep, '/')
        rel = '' if rel == '.' else rel
        dn[:] = [d for d in dn if not d.startswith(('.', '_')) and d not in ('tools', 'dist') and (rel + '/' + d).lstrip('/') != 'js/vendor/ocr']
        for f in fn:
            if f.startswith(('.', '_')) or f.endswith(('.md', '.txt', '.py', '.xml', '.zip', '.json')) or f in ('sw.js', '404.html'):
                continue
            files.append((rel + '/' + f).lstrip('/'))
    files = ['./', 'manifest.webmanifest'] + sorted(f for f in set(files) if f != 'manifest.webmanifest')
    s = re.sub(r"const VERSION = '[^']*';", f"const VERSION = 'corpus-v5-{TODAY}';", s)
    s = re.sub(r'const FILES = \[.*?\];', lambda m: 'const FILES = ' + json.dumps(files, indent=2) + ';', s, flags=re.S)
    open(p, 'w', encoding='utf-8').write(s)
    return len(files)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--url', help='the address the site will be published at, e.g. https://corpus.example.in')
    ap.add_argument('--clean-urls', dest='clean', action='store_true', default=None, help='addresses without .html (Cloudflare Pages)')
    ap.add_argument('--html-urls', dest='clean', action='store_false', help='addresses ending in .html (Vercel, Netlify, GitHub Pages)')
    ap.add_argument('--vercel', action='store_true', help='also write vercel.json and .vercelignore (only if you host on Vercel)')
    a = ap.parse_args()
    global CLEAN_URLS, VERCEL
    VERCEL = a.vercel
    cfgp = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'site.json')
    saved = json.load(open(cfgp)) if os.path.exists(cfgp) else {}
    url = (a.url or saved.get('url') or 'https://example.com').rstrip('/')
    CLEAN_URLS = a.clean if a.clean is not None else bool(saved.get('cleanUrls', False))
    json.dump({'url': url, 'cleanUrls': CLEAN_URLS}, open(cfgp, 'w'), indent=2)
    build_faq(); build_calcs(); build_countries()
    for page, cfg in PAGES.items():
        p = os.path.join(ROOT, page)
        if os.path.exists(p):
            set_head(p, url, page, cfg)
            body = open(p, encoding='utf-8').read(); fixed = headings(body)
            if fixed != body: open(p, 'w', encoding='utf-8').write(fixed)
        else: print('missing page', page)
    write_seo_files(url)
    n = update_sw()
    print(f'built for {url}' + (' with clean addresses (no .html)' if CLEAN_URLS else '') + f': {len(PAGES)} pages, {sum(1 for c in PAGES.values() if c["index"])} indexable, {len(CALCS)} calculator pages, {n} files cached offline')
    if 'example.com' in url:
        print('NOTE: still using the placeholder address. Run again with --url https://your-real-domain before publishing.')

if __name__ == '__main__':
    main()
