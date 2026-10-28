# CO₹PU$

A personal net worth and financial health tracker that runs entirely in your
browser. There is no server and no backend of any kind. There is no AI
involved anywhere in this tool, every number and every piece of advice comes
from plain formulas and coded rules that you can read yourself inside the
`js` folder.

## Look and feel

The brand is **marigold and aubergine**: marigold (`#F2A516`) for the logo,
buttons and highlights, aubergine ink (`#221A2E`) for text, jade for gains
and brick for losses. Every text colour was checked to WCAG AA contrast in
both light and dark themes. Headings use Bricolage Grotesque and everything
else uses Inter; both fonts ship inside `fonts/`, so nothing loads from the
internet. The logo (`assets/logo-mark.svg`) is three coin stacks rising like
a bar chart, with a coin landing on the tallest.

## How to open it

Double click `index.html`, or open it from your browser with File > Open.
This is a short landing page introducing what the tool does. Press "Open
your dashboard" to get into the actual app, which starts at
`dashboard.html`. From there, every page links to the others from the
sidebar, so you never need to touch a file name directly again.

If you want it to feel like a proper app day to day, bookmark
`dashboard.html` directly, or add it to your desktop, so you land straight
in your numbers instead of the introduction each time.

## Where your data lives

Everything you type in is saved using your browser's local storage, tied to
this folder's `index.html` and its sibling pages. It stays on this device,
inside this browser, until you delete it yourself. Nothing is uploaded, and
there is no account or login of any kind.

Because of this:
- Use the same browser each time, on the same computer.
- If you clear your browser's site data, or use private or incognito mode,
  your entries will be gone.
- Go to Settings and press "Download a backup file" every so often. That
  file is a plain JSON file you can keep in cloud storage, on a USB drive,
  or email to yourself, and load back in with "Restore from a backup file"
  on any device.

## What is on each page

The sidebar on every page is built from one list in `js/nav.js`, so pages
are never missing from some menus. Settings and the Light / Dark / Auto
theme switch are pinned to the bottom of the sidebar and are always visible.
On a phone, the sidebar becomes a menu opened from the top bar.

**Overview**
- **Landing page** (`index.html`): a passbook that prints its own entries
  and stamps your net worth, plus what the app covers.
- **Dashboard**: net worth, a financial health score out of 100 (five plain
  checks of 20 points each, each with one thing to do), allocation, net
  worth trend, cash flow, and what is coming up: deposit maturities, policy
  renewals and tax deadlines. "Add to calendar" downloads a calendar file
  with a year of reminders.
- **Charts**: allocation, assets against liabilities, gains and losses,
  history and a projection, each with hover values and a table view.

**Money**
- **Assets**: PPF, EPF, NPS, fixed and recurring deposits, stocks, mutual
  funds, gold & silver, crypto, bonds, land and property, rental income and
  insurance policies. EPF can be filled from a salary slip or EPFO passbook
  PDF, read inside your browser. Bonds are priced off the YTM you enter,
  since no free live bond price feed exists.
- **Liabilities**: loans and other debts, with EMI and balance left, and a
  debt payoff planner comparing avalanche (highest rate first) and snowball
  (smallest balance first) with any extra you can pay.
- **Budget**: monthly income, needs, wants and savings, your savings rate,
  and a comparison with the 50/30/20 guide. Saves as you type.
- **Goals**: future cost after inflation, the monthly SIP to reach it, and a
  retirement corpus.

**Tools**
- **Calculators**: twenty-one tools in six tabs with a search box: FIRE
  number, emergency fund, SIP,
  step-up SIP, lumpsum, SWP, Sukanya Samriddhi, PPF projection, CAGR, XIRR,
  rolling returns, EMI, loan prepayment, home affordability, income tax old
  vs new regime, HRA exemption, gratuity, simple and compound interest,
  inflation, and a currency converter.
- **Reports & advice**: a health check from coded rules, losses, and which
  debt to clear first. "Save as PDF" prints a clean report.
- **Tax**: capital gains, debt funds, FD/RD interest, 80C, 80CCD(1B) and
  rental income.
- **Pre-filing audit**: checks against TDS, advance tax, cash limits and the
  high-value transactions that show up in your AIS.

**Protect**
- **Insurance**: a calculator that works out term, health and personal
  accident cover from your salary, age, gender, state, family, loans,
  existing policies and savings, ranks what to sort out first, and shows
  how each figure was reached. Below it, the pros and cons of health,
  accident, term, vehicle and home insurance.
- **Govt schemes**: PMJJBY, PMSBY, Atal Pension Yojana, Ayushman Bharat and
  EV incentives.
- **State resources**: state health schemes (Aarogyasri, CMCHIS, MJPJAY,
  Swasthya Sathi, MAA, Mukh Mantri Sehat Yojna and others) with cover,
  eligibility and official portals. Your state choice is shared with the
  insurance calculator.

**Help**
- **Scholarships** and **Disputes**: curated directories with official links.

**Settings**: currency, age, expenses, inflation, price provider and API
keys, and backup controls.

## Handy extras

- **Quick search**: press Ctrl + K (⌘ + K on a Mac), or the search icon,
  to jump to any page, calculator or action.
- **Privacy mode**: the eye button blurs every amount, for checking your
  numbers in public. Hover or tap a figure to see it.
- **Light, dark or automatic** theme, from the sidebar or the top bar.
- **Install it**: when the folder is served from a website, browsers offer
  to install CO₹PU$ as an app, and it keeps working without internet
  (`sw.js` and `manifest.webmanifest`). Opened as local files it already
  works offline.

## Facts used, and when they were checked

Checked in October 2026. Tax: FY 2026-27 slabs, unchanged by Budget 2026
(new regime nil up to ₹12 lakh of taxable income after the ₹60,000 rebate,
₹75,000 standard deduction). HRA: 50% cities now include Bengaluru,
Hyderabad, Pune and Ahmedabad. Small savings for October to December 2026:
PPF 7.1%, Sukanya Samriddhi 8.2%. Gratuity: ₹20 lakh lifetime tax-free
limit, one year of service for fixed-term employees. State health schemes:
see `js/states-data.js`, where only confirmed figures are given as numbers.
Tax deadlines: advance tax 15 June, 15 September, 15 December, 15 March;
ITR 31 July (ITR-1 and 2) and 31 August (ITR-3 and 4 without audit), as
split by Budget 2026; for AY 2026-27 audited cases were extended to
21 November 2026. All of these change, so check before relying on them.

## Live data

- **Mutual fund NAVs** come from the free public **mfapi.in** service. No
  account or key is needed, just search for your fund by name on the
  Assets page.
- **Stock, ETF and fund prices** come from **Alpha Vantage**, **Finnhub** or
  **EODHD**, each with a free personal key that is tested before it is saved
  (Settings, Live Prices). Alpha Vantage covers US, BSE, London and Toronto;
  Finnhub US only; EODHD US, London, Toronto and the ASX, 20 lookups a day.
  Singapore, New Zealand and UAE listings have no free live source, so their
  price is typed in. When a refresh needs a key, a short guide opens instead
  of an error.
- **Gold and silver prices** come from the free, keyless **goldprice.dev**
  service, converted to a price per gram in your chosen currency.
- **Crypto prices** come from the free, keyless **CoinGecko** API.
- **Currency conversion** on the Calculators page uses **Frankfurter**, a
  free, keyless service built on European Central Bank reference rates.

All of these are plain data lookups, not AI services, and every call goes
straight from your browser to that data provider, with nothing of ours in
between. The two that need a key store it only in your browser's local
storage.

## Importing documents (Import page)

Drop in a file and CO₹PU$ works out what it is, pulls out the numbers,
and shows them to you in editable boxes. Nothing is saved until you tick
what should go where and press Apply, and **Undo last import** puts
everything back.

| Document | Formats | What it fills |
|---|---|---|
| Payslip | PDF (also locked), Excel, Word, photo | Budget take-home, EPF and NPS contributions, tax, HRA and gratuity calculators, insurance income |
| Form 16 (Part B) | PDF | Last year's tax details, regime comparison, pre-filing audit |
| Bank statement | CSV, Excel, bank ".xls" (HTML), PDF | Budget lines from monthly averages, monthly expense, Bank & cash balance, client receipts |
| Invoice or income list | Excel, CSV | Freelance receipts, TDS, GST, client split |
| Form 26AS / AIS | PDF | TDS credit by deductor and section |
| Broker holdings | Zerodha, Groww, Upstox exports (CSV, Excel) | Stocks and funds in Assets |
| Mutual fund CAS | CAMS / KFintech PDF (locked) | Funds with units, NAV and cost |
| EPFO passbook | PDF | EPF balance and monthly contribution |
| CO₹PU$ backup | JSON | Restores everything |

How it works, all inside the browser:

- `js/readers.js` turns a file into text lines and tables: pdf.js for PDFs
  (with a password prompt), a small built in reader for .xlsx and .docx
  (using fflate to unzip), a CSV parser, and an HTML table reader for the
  many bank ".xls" files that are really web pages. Scanned PDFs and photos
  go through Tesseract.js OCR, bundled in `js/vendor/ocr` and loaded only
  when needed. OCR needs the site served from a web address, not opened as
  a file.
- `js/extract.js` scores the text against keyword lists to decide the
  document type, then a matching extractor pulls the figures. Bank
  transactions are sorted by readable rules (Swiggy → eating out, ACH BSE
  STAR MF → SIPs, and so on). In PDF statements, the change in balance on
  each line tells debit from credit.
- `js/importer.js` is the review screen: confidence, notes, editable
  fields, a "where this goes" list showing before → after, insights, a
  column matcher for unfamiliar spreadsheets, and the import history.
- Files are never stored. PAN, UAN, account and folio numbers are ignored.
- Old binary .xls files (pre 2007 Excel) cannot be read in a browser; save
  them as .xlsx or CSV first.

## Freelancers and the self employed

"How do you earn?" on the Import page tailors which documents are
suggested. The **Freelancer and consultant tax** calculator compares
presumptive tax (section 58 of the Income-tax Act 2025, the old 44ADA:
50% of receipts as profit, up to ₹50 lakh or ₹75 lakh with 5% or less in
cash) with actual profit, subtracts client TDS (10% above ₹50,000 under
section 393, the old 194J), and gives advance tax (single instalment by
15 March for presumptive cases) and a GST threshold check (₹20 lakh for
services). It fills itself from imported invoices, bank receipts, 26AS
and payslips. The PF wage ceiling of ₹25,000 a month from
17 September 2026 (raised from ₹15,000) is used in payslip insights.

## Publishing and search engines

The site is plain static files, hosted on Cloudflare Pages at
https://corpusnetworth.in and deployed from GitHub.

1. After changing pages, run `python3 tools/build.py` (it remembers the
   address and clean URL setting in `tools/site.json`). This writes the
   title, description, canonical URL, Open Graph and Twitter tags and
   JSON-LD for every page, and rebuilds `sitemap.xml`, `robots.txt`,
   `llms.txt`, `faq.html`, the calculator and country pages and the
   offline file list in `sw.js`. Commit the result. It needs only Python 3.
2. Cloudflare Pages settings (Settings, Build):
   - Framework preset: None
   - Build command: `python3 tools/publish.py`
   - Build output directory: `dist`
   - Production branch: `main`
3. `tools/publish.py` copies the site into `dist/`, leaving out everything
   listed in `.pagesignore` (the `tools/` folder, this README, Python
   files, editor folders). This is the Cloudflare version of Vercel's
   `.vercelignore`, since Cloudflare has no ignore file of its own. It also
   stops the deploy if `index.html`, `_headers` or another key file is
   missing, if a file is over 25 MiB, or if `_headers` has over 100 rules.
   Run it locally to see exactly what will go live. `dist/` is in
   `.gitignore`, so it is never committed.
4. Submit `https://corpusnetworth.in/sitemap.xml` in Google Search Console
   and Bing Webmaster Tools.

Other hosts: use `--html-urls` for hosts that keep `.html` in addresses
(Netlify, GitHub Pages), and add `--vercel` only for Vercel, which ignores
`_headers` and needs `vercel.json` and `.vercelignore` instead. Without
`--vercel` the build deletes those two files.

What is in place for search:

- Unique titles and descriptions on all 30 pages; 22 public pages are
  indexable, personal screens such as the dashboard carry `noindex`.
- JSON-LD: WebSite, Organization, WebApplication, FAQPage and
  BreadcrumbList.
- Eight standalone calculator pages (SIP, XIRR, income tax, freelancer
  tax, HRA, FIRE, EMI, gratuity), each with an explanation, a worked
  example, questions and related links.
- `faq.html` with 31 questions and FAQPage markup. The landing page shows 8 of them with short answers linking to the full ones, without markup, since Google asks for one marked up copy per site (and has retired FAQ rich results).
- `about.html`, `privacy.html`, a `404.html`, breadcrumbs, a 1200×630
  social image (`assets/og-image.png`), `hreflang` for en-IN.
- `_headers` (Netlify, Cloudflare Pages) sets a strict Content Security
  Policy, security headers and caching. It was tested with imports and
  OCR running.

FAQ text lives in `tools/faq_data.py` and calculator page text in
`tools/calc_pages.py`; edit there and run the build again.

## Visitor counts

The site uses Cloudflare Web Analytics, switched on in the Cloudflare
Pages project (Metrics, Web Analytics), which adds its script at deploy
time. It counts visits, pages, referrers, countries, devices and page
speed, uses no cookies and never sees what people enter. `_headers`
allows `static.cloudflareinsights.com` (script) and
`cloudflareinsights.com` (beacon) in the Content Security Policy; without
those the counter is silently blocked. It has no custom events, so button
clicks are not counted. The privacy page, About page and FAQ
(`visitor-counts`) describe this.

## Countries

CO₹PU$ works for **India, the USA, the UK, Canada, Australia, Singapore,
the UAE and New Zealand**. The country is guessed from the device's time
zone (nothing is sent anywhere) and can be changed from the country button
in the sidebar, the landing page chips, or `?country=US` on any link.

The country sets the currency, the tax calculator (brackets, allowances,
payroll contributions and self-employed tax), retirement account types in
Assets, tax dates on the dashboard and calendar export, bank statement
merchant names and date order for imports, and where to complain.

| Country | Tax year | Built in |
|---|---|---|
| India | FY 2026-27 | New and old regime, PPF, EPF, NPS, section 58, TDS |
| USA | 2026 | Federal brackets, $16,100 / $32,200 standard deduction, FICA, self-employment tax, optional state rate |
| UK | 2026/27 | £12,570 allowance with taper, 20/40/45%, NI 8%/2%, Class 4 6%/2% |
| Canada | 2026 | Federal 14% to 33%, BPA credit, CPP, CPP2, EI, Ontario (surtax, health premium), BC, Alberta |
| Australia | 2026-27 | 15% second bracket from 1 July 2026, LITO, Medicare levy with low-income phase-in |
| Singapore | YA 2026 | Resident rates, earned income relief, CPF for citizens and PRs |
| UAE | 2026 | No personal tax, end of service gratuity, 9% corporate tax above AED 375,000 |
| New Zealand | 2026-27 | 10.5% to 39%, ACC levy 1.75%, KiwiSaver 3.5% |

**Updating after a budget:** every country's numbers live in the JSON
block at the top of `js/countries.js`. Edit the figures and `checked`,
then run `python3 tools/build.py`. The app and the generated country pages
(`/us/`, `/uk/`... each with a tax calculator page and `hreflang` links
between them) both read that one block, and the build's Python engine
mirrors the app's JavaScript engine so examples always match.

## Motion

Theme changes grow from the button you press, tabs and choices have a
sliding pill, the sidebar highlight follows your click, pages fade
between each other, FAQ answers open and close smoothly, content rises
in as you scroll, and the hero rotates its currency word and replays the
passbook for each country. Everything stops when the device asks for
reduced motion.

## Naming

- Switching theme grows the new theme as a circle from the button you
  pressed (View Transitions), with a colour cross-fade on browsers without
  them. Tabs, the theme switch and option buttons have a pill that slides
  to the selected item, the sidebar highlight slides to the page you click,
  and moving between pages keeps the sidebar still while the content rises
  in. All motion is switched off when the device asks for reduced motion.
- The sidebar always scrolls the current page into view.
- Navigation, page titles, tabs and section headings use Title Case
  (Pre-Filing Audit, Reports & Advice); body text, buttons, questions and
  sentence-style headlines stay in sentence case. Abbreviations are always
  in capitals. `tools/titlecase.py` holds the rules and the build applies
  them to every heading.

## A note on the advice

The messages on the Reports page are generated by simple, readable rules,
things like "if debt is more than half of your assets, say so" or "if a
fixed deposit's rate is below the inflation number you set, say so". You
can open `js/advice.js` and read every single rule in plain JavaScript.
None of it comes from a model guessing at your situation, and none of it
should be treated as professional financial advice, it is a starting point
for your own thinking. The Audit page works the same way, its threshold
checks are written directly in `audit.html` rather than a shared file,
since they are only used there.

The scholarship and dispute directories on the Help pages are static lists
maintained by hand, not a live feed, so amounts, deadlines, and contact
details there should always be double checked on the official page before
you rely on them.

## Country guides (insurance, schemes, student aid)

`tools/guides_data.py` holds the insurance, government scheme and student aid
content for the USA, UK, Canada, Australia, Singapore, the UAE and New
Zealand, each item linked to an official page. `python3 tools/build.py` turns
it into `js/guides.js` (shown on insurance.html, schemes.html and
scholarships.html when that country is chosen) and into static pages such as
`/uk/insurance.html`, `/uk/benefits.html` and `/uk/student-aid.html` for search
engines. After editing figures, update `CHECKED` in that file.
