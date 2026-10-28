/* ===========================================================
   CO₹PU$ — offline support
   When the site is served over the web (not opened as a local file),
   this keeps a copy of every page so it opens without internet and
   can be installed to a phone's home screen. Your data is never
   cached here, it stays in your browser's own storage.
   Live price lookups always go to the network.
=========================================================== */
const VERSION = 'corpus-v5-2026-10-28-d7cb4475';
const FILES = [
  "./",
  "manifest.webmanifest",
  "about.html",
  "ae/benefits.html",
  "ae/income-tax-calculator.html",
  "ae/index.html",
  "ae/insurance.html",
  "ae/student-aid.html",
  "assets.html",
  "assets/apple-touch-icon.png",
  "assets/favicon.svg",
  "assets/icon-192.png",
  "assets/icon-512-maskable.png",
  "assets/icon-512.png",
  "assets/logo-mark.svg",
  "assets/og-image.png",
  "au/benefits.html",
  "au/income-tax-calculator.html",
  "au/index.html",
  "au/insurance.html",
  "au/student-aid.html",
  "audit.html",
  "budget.html",
  "ca/benefits.html",
  "ca/income-tax-calculator.html",
  "ca/index.html",
  "ca/insurance.html",
  "ca/student-aid.html",
  "calculators.html",
  "charts.html",
  "css/landing.css",
  "css/style.css",
  "dashboard.html",
  "disputes.html",
  "emi-calculator.html",
  "faq.html",
  "favicon.ico",
  "fire-calculator.html",
  "fonts/bricolage-grotesque-latin-ext-standard-normal.woff2",
  "fonts/bricolage-grotesque-latin-standard-normal.woff2",
  "fonts/inter-latin-ext-standard-normal.woff2",
  "fonts/inter-latin-standard-normal.woff2",
  "fonts/pdf/inter-bold.ttf",
  "fonts/pdf/inter-regular.ttf",
  "freelancer-tax-calculator.html",
  "goals.html",
  "gratuity-calculator.html",
  "hra-calculator.html",
  "import.html",
  "income-tax-calculator.html",
  "index.html",
  "insurance.html",
  "js/advice.js",
  "js/calc-extra.js",
  "js/charts.js",
  "js/compute.js",
  "js/countries.js",
  "js/extract.js",
  "js/finance.js",
  "js/guides-view.js",
  "js/guides.js",
  "js/importer.js",
  "js/insurance-needs.js",
  "js/insurance-world.js",
  "js/keys.js",
  "js/nav.js",
  "js/prices.js",
  "js/readers.js",
  "js/report-pdf.js",
  "js/states-data.js",
  "js/storage.js",
  "js/vendor/fflate.min.js",
  "js/vendor/jspdf.umd.min.js",
  "js/vendor/pdf.min.js",
  "js/vendor/pdf.worker.min.js",
  "liabilities.html",
  "nz/benefits.html",
  "nz/income-tax-calculator.html",
  "nz/index.html",
  "nz/insurance.html",
  "nz/student-aid.html",
  "privacy.html",
  "reports.html",
  "schemes.html",
  "scholarships.html",
  "settings.html",
  "sg/benefits.html",
  "sg/income-tax-calculator.html",
  "sg/index.html",
  "sg/insurance.html",
  "sg/student-aid.html",
  "sip-calculator.html",
  "states.html",
  "tax.html",
  "uk/benefits.html",
  "uk/income-tax-calculator.html",
  "uk/index.html",
  "uk/insurance.html",
  "uk/student-aid.html",
  "us/benefits.html",
  "us/income-tax-calculator.html",
  "us/index.html",
  "us/insurance.html",
  "us/student-aid.html",
  "xirr-calculator.html"
];

// Some hosts (Cloudflare Pages) redirect /about.html to /about. A redirected
// response must never be handed back for a page load, so each one is copied
// into a plain response before it is cached or served.
const plain = (res) => res && res.redirected
  ? res.blob().then(b => new Response(b, { status: res.status, statusText: res.statusText, headers: res.headers }))
  : Promise.resolve(res);

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(FILES.map(f =>
    fetch(f, { cache: 'reload' }).then(r => {
      if(!r.ok) return;
      const finalUrl = r.url, moved = r.redirected;
      return plain(r).then(p => Promise.all([c.put(f, p.clone()), moved ? c.put(finalUrl, p.clone()) : null]));
    }).catch(() => {})
  ))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if(e.request.method !== 'GET' || url.origin !== location.origin) return;   // prices and other sites: straight to the network
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit ? plain(hit) : fetch(e.request).then(res => {
      if(res.ok && res.type === 'basic'){ const copy = res.clone(); plain(copy).then(p => caches.open(VERSION).then(c => c.put(e.request, p))); }
      return res;
    }).catch(() => caches.match('dashboard.html').then(plain)))
  );
});
