/* ===========================================================
   CO₹PU$ — navigation, logo, theme, privacy, quick search
   Every page's sidebar is built from the single NAV list below,
   so a page is added in one place and is never missing from some
   menus. Settings, privacy and theme are pinned to the bottom of
   the sidebar so they are always visible. On phones the sidebar
   becomes a drawer opened from a top bar.
=========================================================== */
(function(){
  const I = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    charts: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    assets: '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v3h-4a2 2 0 0 0 0 4h4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/>',
    liabilities: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    goals: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    calculators: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 6h6M9 11h.01M12 11h.01M15 11h.01M9 15h.01M12 15h.01M15 15h.01M9 18h6"/>',
    reports: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    tax: '<path d="M5 3v18l2.5-1.5L10 21l2-1.5 2 1.5 2.5-1.5L19 21V3l-2.5 1.5L14 3l-2 1.5L10 3 7.5 4.5z"/><path d="M9 9h6M9 13h6"/>',
    audit: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    insurance: '<path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z"/><path d="M12 12v7a2 2 0 0 0 4 0"/>',
    schemes: '<path d="M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10M2 10l10-6 10 6"/>',
    states: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    scholarships: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    disputes: '<path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    auto: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    budget: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.4 3.3M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.6 5-1.5M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    upload: '<path d="M12 15V3M7 8l5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5h.01"/>'
  };

  const CC = () => (window.CorpusCountry ? CorpusCountry.current() : 'IN');
  const showItem = (item) => !item[3] || item[3] === CC();
  const NAV = [
    { group: 'Overview', items: [
      ['dashboard.html', 'Dashboard', 'dashboard'],
      ['charts.html', 'Charts', 'charts'],
    ]},
    { group: 'Money', items: [
      ['import.html', 'Import Documents', 'upload'],
      ['assets.html', 'Assets', 'assets'],
      ['liabilities.html', 'Liabilities', 'liabilities'],
      ['budget.html', 'Budget', 'budget'],
      ['goals.html', 'Goals', 'goals'],
    ]},
    { group: 'Tools', items: [
      ['calculators.html', 'Calculators', 'calculators'],
      ['reports.html', 'Reports & Advice', 'reports'],
      ['tax.html', 'Tax', 'tax', 'IN'],
      ['audit.html', 'Pre-Filing Audit', 'audit', 'IN'],
    ]},
    { group: 'Protect', items: [
      ['insurance.html', 'Insurance', 'insurance'],
      ['schemes.html', 'Govt Schemes', 'schemes'],
      ['states.html', 'State Resources', 'states', 'IN'],
    ]},
    { group: 'Help', items: [
      ['scholarships.html', CC() === 'IN' ? 'Scholarships' : 'Student Aid', 'scholarships'],
      ['disputes.html', 'Disputes', 'disputes'],
      ['faq.html', 'FAQ', 'help'],
      ['privacy.html', 'Privacy & Disclaimer', 'shield'],
    ]},
  ];
  const PINNED = ['settings.html', 'Settings', 'settings'];

  // Extra destinations for quick search: individual calculators and tools
  const EXTRA = [
    ['calculators.html#invest', 'SIP, step-up SIP, lumpsum, SWP', 'calculators', 'Calculator'],
    ['calculators.html#invest', 'Sukanya Samriddhi, PPF projection', 'calculators', 'Calculator'],
    ['calculators.html#invest', 'XIRR, CAGR, rolling returns', 'calculators', 'Calculator'],
    ['calculators.html#plan', 'FIRE number, emergency fund', 'calculators', 'Calculator'],
    ['calculators.html#loans', 'EMI, loan prepayment, home affordability', 'calculators', 'Calculator'],
    ['calculators.html#tax', 'Income tax old vs new, HRA, gratuity', 'calculators', 'Calculator'],
    ['calculators.html#tax', 'Freelancer tax, presumptive section 58 (old 44ADA), advance tax', 'calculators', 'Calculator'],
    ['import.html', 'Upload payslip, Form 16, bank statement, 26AS, CAS, holdings', 'upload', 'Import'],
    ['import.html', 'Read an Excel, CSV, PDF or photo', 'upload', 'Import'],
    ['calculators.html#interest', 'Simple and compound interest, inflation', 'calculators', 'Calculator'],
    ['calculators.html#fx', 'Currency converter', 'calculators', 'Calculator'],
    ['liabilities.html#payoff', 'Debt payoff planner', 'liabilities', 'Tool'],
    ['insurance.html', 'How much term and health cover do I need', 'insurance', 'Tool'],
    ['dashboard.html#health', 'Financial health score', 'dashboard', 'Tool'],
    ['dashboard.html#upcoming', 'Tax deadlines and reminders', 'dashboard', 'Tool'],
  ];

  const svg = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[name] || ''}</svg>`;
  window.CORPUS_ICON = svg;

  const LOGO_MARK = '<svg class="logo-mark" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="13" fill="#F2A516"/><g fill="#221A2E"><rect x="7.5" y="33" width="9.5" height="4" rx="2"/><rect x="7.5" y="27.5" width="9.5" height="4" rx="2"/><rect x="19.25" y="33" width="9.5" height="4" rx="2"/><rect x="19.25" y="27.5" width="9.5" height="4" rx="2"/><rect x="19.25" y="22" width="9.5" height="4" rx="2"/><rect x="31" y="33" width="9.5" height="4" rx="2"/><rect x="31" y="27.5" width="9.5" height="4" rx="2"/><rect x="31" y="22" width="9.5" height="4" rx="2"/><rect x="31" y="16.5" width="9.5" height="4" rx="2"/><circle cx="35.75" cy="9.6" r="3.7"/></g></svg>';
  const LOGO = `<a href="index.html" class="logo" aria-label="Corpus home">${LOGO_MARK}<span class="logo-word">CO<b>₹</b>PU<b>$</b></span></a>`;
  window.CORPUS_LOGO = LOGO;

  /* ---------- theme ---------- */
  const THEME_KEY = 'corpus_theme';
  function getTheme(){ try{ return localStorage.getItem(THEME_KEY) || 'auto'; }catch(e){ return 'auto'; } }
  function effectiveTheme(){
    const t = getTheme();
    if(t !== 'auto') return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme(t){
    const root = document.documentElement;
    if(t === 'light' || t === 'dark') root.setAttribute('data-theme', t); else root.removeAttribute('data-theme');
    try{ t === 'auto' ? localStorage.removeItem(THEME_KEY) : localStorage.setItem(THEME_KEY, t); }catch(e){}
    document.querySelectorAll('.theme-switch button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.theme === t)));
    document.querySelectorAll('.mobile-theme, [data-theme-toggle]').forEach(mt => { mt.innerHTML = svg(effectiveTheme() === 'dark' ? 'sun' : 'moon'); mt.setAttribute('aria-label', effectiveTheme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'); });
    document.dispatchEvent(new CustomEvent('corpus:theme'));
  }
  window.corpusSetTheme = applyTheme;

  // Theme change with a circular reveal from where you clicked (View Transitions),
  // a soft colour cross-fade where that is not supported, and none if the
  // person has asked their device for reduced motion.
  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function switchTheme(t, ev){
    const before = effectiveTheme();
    const after = t === 'auto' ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t;
    const root = document.documentElement;
    if(before === after || reduceMotion()){ applyTheme(t); return; }
    let x = innerWidth - 40, y = 40;
    if(ev && ev.currentTarget && ev.currentTarget.getBoundingClientRect){ const r = ev.currentTarget.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
    if(ev && ev.clientX){ x = ev.clientX; y = ev.clientY; }
    if(!document.startViewTransition){
      root.classList.add('theme-fade'); applyTheme(t);
      setTimeout(() => root.classList.remove('theme-fade'), 520); return;
    }
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add('vt-theme');
    root.dataset.vtDir = after;
    const vt = document.startViewTransition(() => applyTheme(t));
    vt.ready.then(() => {
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 680, easing: 'cubic-bezier(.22,.9,.3,1)', pseudoElement: '::view-transition-new(root)' });
    }).catch(() => {});
    vt.finished.finally(() => { root.classList.remove('vt-theme'); delete root.dataset.vtDir; });
  }
  window.corpusSwitchTheme = switchTheme;

  /* ---------- sliding selection pill for tabs and segmented buttons ---------- */
  const SLIDER_GROUPS = '.tabs, .theme-switch, .seg, .lp-countries';
  function attachSlider(group){
    if(group.__slider) return;
    const pill = document.createElement('span');
    pill.className = 'seg-slider'; pill.setAttribute('aria-hidden', 'true');
    group.__slider = pill; group.classList.add('has-slider');
    let placed = false;
    const place = () => {
      if(!pill.isConnected){ group.prepend(pill); getComputedStyle(pill).transform; }
      const a = group.querySelector(':scope > .active:not(.seg-slider), :scope > [aria-pressed="true"]');
      if(!a || a.offsetParent === null){ pill.style.opacity = '0'; return; }
      const first = !placed || !pill.style.width;
      if(first) pill.style.transition = 'none';
      pill.style.opacity = '1';
      pill.style.width = a.offsetWidth + 'px'; pill.style.height = a.offsetHeight + 'px';
      pill.style.transform = `translate(${a.offsetLeft}px, ${a.offsetTop}px)`;
      if(first){ getComputedStyle(pill).transform; pill.style.transition = ''; placed = true; }
    };
    new MutationObserver(place).observe(group, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'aria-pressed', 'hidden'] });
    if(window.ResizeObserver) new ResizeObserver(() => { placed = false; place(); }).observe(group);
    place();
  }
  function attachSliders(root){ (root || document).querySelectorAll(SLIDER_GROUPS).forEach(attachSlider); }

  /* ---------- FAQ answers open and close smoothly ---------- */
  /* FAQ answers glide open and shut. The whole <details> height is animated
     from wherever it is right now to where it is going, so a second click
     halfway through simply turns it around, with no jump at either end. */
  const FAQ_EASE = 'cubic-bezier(.33,1,.68,1)';
  function smoothDetails(root){
    (root || document).querySelectorAll('details.faq-item').forEach(d => {
      if(d.__smooth) return; d.__smooth = true;
      const sum = d.querySelector('summary'), body = d.querySelector('.faq-a');
      if(!sum || !body || !d.animate) return;
      const closedH = () => { const cs = getComputedStyle(d); return sum.offsetHeight + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom); };
      const finish = () => {
        d.__anim = null; d.__target = null;
        if(d.__inner){ d.__inner.cancel(); d.__inner = null; }
        d.style.height = ''; d.style.overflow = '';
        d.classList.remove('opening', 'closing');
      };
      sum.addEventListener('click', (e) => {
        if(reduceMotion()) return;
        e.preventDefault();
        const opening = d.__anim ? !d.__target : !d.open;      // mid-animation: reverse it
        const from = d.getBoundingClientRect().height;
        if(d.__anim){ d.__anim.onfinish = null; d.__anim.cancel(); }
        if(d.__inner){ d.__inner.cancel(); d.__inner = null; }
        d.style.overflow = 'hidden';
        d.__target = opening;
        let to;
        if(opening){
          d.open = true;
          d.style.height = 'auto';
          to = d.getBoundingClientRect().height;
          d.classList.add('opening'); d.classList.remove('closing');
        } else {
          to = closedH();
          d.classList.add('closing'); d.classList.remove('opening');
        }
        d.style.height = from + 'px';
        const dist = Math.abs(to - from);
        const duration = Math.round(Math.min(520, Math.max(260, 220 + dist * 0.9)) * (opening ? 1 : 0.85));
        d.__anim = d.animate([{ height: from + 'px' }, { height: to + 'px' }], { duration, easing: FAQ_EASE });
        // the text drifts in a touch behind the opening edge, and fades as it closes
        d.__inner = body.animate(opening
          ? [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }]
          : [{ opacity: getComputedStyle(body).opacity, transform: 'none' }, { opacity: 0, transform: 'translateY(-4px)' }],
          { duration: opening ? duration + 80 : duration * 0.7, delay: opening ? 40 : 0, easing: FAQ_EASE, fill: 'both' });
        d.__anim.onfinish = () => { if(!opening) d.open = false; finish(); };
      });
    });
  }

  /* ---------- content below the fold rises into view ---------- */
  let revealIO = null;
  function reveal(root){
    if(reduceMotion() || !window.IntersectionObserver) return;
    if(!revealIO) revealIO = new IntersectionObserver((entries) => entries.forEach(en => { if(en.isIntersecting){ en.target.classList.add('in'); revealIO.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    const sel = '.main > .card, .main > section.card, .main > .grid-2 > *, .main > .stat-grid > *, .lp-entry, .lp-group, .lp-steps li, .lp-faq .faq-item, .lp-privacy-card, .lp-import-demo, .lp-import-copy, .lp-final, .lp-footer-cols > div, .faq-group .faq-item, .related > a';
    const vh = innerHeight;
    (root || document).querySelectorAll(sel).forEach((el, i) => {
      if(el.__rev) return; el.__rev = true;
      if(el.getBoundingClientRect().top < vh * 0.92) return;          // already on screen: no delay, no flash
      const sib = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
      el.style.setProperty('--rd', Math.min(sib, 6) * 60 + 'ms');
      el.classList.add('reveal'); revealIO.observe(el);
    });
  }
  window.corpusReveal = reveal;
  window.corpusAttachSliders = attachSliders;

  /* ---------- privacy mode: blur every amount ---------- */
  const PRIV_KEY = 'corpus_privacy';
  function getPrivacy(){ try{ return localStorage.getItem(PRIV_KEY) === '1'; }catch(e){ return false; } }
  function applyPrivacy(on){
    document.body.classList.toggle('privacy', on);
    try{ on ? localStorage.setItem(PRIV_KEY, '1') : localStorage.removeItem(PRIV_KEY); }catch(e){}
    document.querySelectorAll('[data-privacy]').forEach(b => {
      b.setAttribute('aria-pressed', String(on));
      b.innerHTML = svg(on ? 'eyeoff' : 'eye');
      b.title = on ? 'Show amounts' : 'Hide amounts';
      b.setAttribute('aria-label', b.title);
    });
  }
  window.corpusTogglePrivacy = () => applyPrivacy(!getPrivacy());

  function currentPage(){
    let p = (location.pathname.split('/').pop() || 'index.html').split('?')[0].split('#')[0];
    if(p && !p.includes('.')) p += '.html';      // hosts that serve /about for about.html (Cloudflare Pages)
    return p;
  }
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || '');

  function buildSidebar(sidebar){
    const here = currentPage();
    let html = LOGO + `<nav class="nav" aria-label="Main">`;
    html += `<a href="#" class="qs-open" data-qs>${svg('search')}<span>Search</span><span class="nav-kbd">${isMac ? '⌘' : 'Ctrl'} K</span></a>`;
    NAV.forEach(g => {
      const items = g.items.filter(showItem);
      if(!items.length) return;
      html += `<div class="nav-group-label">${g.group}</div>`;
      items.forEach(([href, label, icon]) => {
        const active = href === here;
        html += `<a href="${href}"${active ? ' class="active" aria-current="page"' : ''}>${svg(icon)}<span>${label.replace('&','&amp;')}</span></a>`;
      });
    });
    const pinActive = PINNED[0] === here;
    html += `</nav>
      <div class="side-foot">
        ${window.CorpusCountry ? (() => { const P = CorpusCountry.get(); return `<button type="button" class="country-chip" data-country-open aria-label="Country: ${P.name}. Change country"><span class="cc-code">${P.code}</span><span class="cc-name">${P.short}<small>${P.symbol.trim()} · ${P.taxYear}</small></span>${svg('chevron')}</button>`; })() : ''}
        <a href="${PINNED[0]}" class="nav-link-pinned${pinActive ? ' active' : ''}"${pinActive ? ' aria-current="page"' : ''}>${svg(PINNED[2])}<span>${PINNED[1]}</span></a>
        <div class="side-row">
          <div class="theme-switch" role="group" aria-label="Colour theme">
            <button type="button" data-theme="light" aria-pressed="false" title="Light">${svg('sun')}<span>Light</span></button>
            <button type="button" data-theme="dark" aria-pressed="false" title="Dark">${svg('moon')}<span>Dark</span></button>
            <button type="button" data-theme="auto" aria-pressed="false" title="Match my device">${svg('auto')}<span>Auto</span></button>
          </div>
          <button type="button" class="icon-btn" data-privacy aria-pressed="false"></button>
        </div>
        <div class="nav-note">Calculated in your browser, saved only on this device. Nothing is uploaded.</div>
      </div>`;
    sidebar.innerHTML = html;
    sidebar.setAttribute('aria-label', 'Main navigation');
    sidebar.querySelectorAll('.theme-switch button').forEach(b => b.addEventListener('click', (e) => switchTheme(b.dataset.theme, e)));
    keepActiveVisible(sidebar);
  }

  /* ---------- sidebar: the current page is always in view, and the highlight slides ---------- */
  const NAV_SCROLL = 'corpus_nav_scroll', NAV_FROM = 'corpus_nav_from';
  function keepActiveVisible(sidebar){
    const nav = sidebar.querySelector('.nav'); if(!nav) return;
    const ss = (k, v) => { try{ if(v === undefined) return sessionStorage.getItem(k); if(v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); }catch(e){ return null; } };
    const saved = Number(ss(NAV_SCROLL));
    if(saved > 0) nav.scrollTop = saved;
    const act = nav.querySelector('a.active');
    const reveal = () => {
      if(!act) return;
      const top = act.offsetTop, bottom = top + act.offsetHeight, pad = 28;
      if(top < nav.scrollTop + pad || bottom > nav.scrollTop + nav.clientHeight - pad){
        nav.scrollTop = Math.max(0, top - nav.clientHeight / 2 + act.offsetHeight / 2);
      }
    };
    reveal();
    // the highlight pill: starts where the clicked link was and settles on this page's link
    const ind = document.createElement('span'); ind.className = 'nav-indicator'; ind.setAttribute('aria-hidden', 'true');
    nav.prepend(ind); nav.classList.add('has-indicator');
    const placeOn = (a, animate) => {
      if(!a){ ind.style.opacity = '0'; return; }
      if(!animate) ind.style.transition = 'none';
      ind.style.opacity = '1';
      ind.style.height = a.offsetHeight + 'px'; ind.style.width = a.offsetWidth + 'px';
      ind.style.transform = `translate(${a.offsetLeft}px, ${a.offsetTop}px)`;
      if(!animate){ getComputedStyle(ind).transform; ind.style.transition = ''; }
    };
    const fromRaw = ss(NAV_FROM); ss(NAV_FROM, null);
    const from = fromRaw == null || fromRaw === '' ? NaN : Number(fromRaw);
    if(act && !isNaN(from) && Math.abs(from - act.offsetTop) > 2 && !reduceMotion()){
      ind.style.transition = 'none'; ind.style.opacity = '1';
      ind.style.height = act.offsetHeight + 'px'; ind.style.width = act.offsetWidth + 'px';
      ind.style.transform = `translate(${act.offsetLeft}px, ${from}px)`;
      getComputedStyle(ind).transform; ind.style.transition = '';
      requestAnimationFrame(() => placeOn(act, true));
    } else placeOn(act, false);
    nav.addEventListener('scroll', () => ss(NAV_SCROLL, String(nav.scrollTop)), { passive: true });
    if(window.ResizeObserver) new ResizeObserver(() => placeOn(nav.querySelector('a.active'), false)).observe(nav);
    // on click, slide the pill to the new item first, then go
    nav.querySelectorAll('a[href]:not([data-qs])').forEach(a => a.addEventListener('click', (e) => {
      if(e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.classList.contains('active')) return;
      ss(NAV_SCROLL, String(nav.scrollTop)); ss(NAV_FROM, String(a.offsetTop));
      if(reduceMotion()) return;
      e.preventDefault();
      nav.querySelectorAll('a.active').forEach(x => { x.classList.remove('active'); x.removeAttribute('aria-current'); });
      a.classList.add('active'); placeOn(a, true);
      setTimeout(() => { location.href = a.href; }, 170);
    }));
  }

  /* ---------- country picker ---------- */
  function buildCountryPicker(){
    if(!window.CorpusCountry || document.getElementById('countryDialog')) return;
    const cur = CorpusCountry.current();
    const dlg = document.createElement('dialog');
    dlg.className = 'corpus-dialog country-dialog'; dlg.id = 'countryDialog';
    dlg.setAttribute('aria-labelledby', 'countryDialogH');
    dlg.innerHTML = `<h3 id="countryDialogH">Where do you live?</h3>
      <p>This sets the currency, tax rules, account types, deadlines and complaint bodies used across the app. Your entries stay as they are.</p>
      <div class="country-grid">${CorpusCountry.list().map(P => `<button type="button" class="country-opt${P.code === cur ? ' on' : ''}" data-pick="${P.code}" aria-pressed="${P.code === cur}">
        <span class="cc-code">${P.code}</span><span class="co-text"><b>${P.name}</b><small>${P.symbol.trim() === P.currency ? P.currency : P.symbol.trim() + " " + P.currency} · ${P.tagline}</small></span></button>`).join('')}</div>
      <div class="imp-actions"><button type="button" class="secondary" data-close>Close</button></div>`;
    document.body.appendChild(dlg);
    dlg.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pick]');
      if(b){ CorpusCountry.set(b.dataset.pick); dlg.close(); location.reload(); return; }
      if(e.target.closest('[data-close]') || e.target === dlg) dlg.close();
    });
  }
  window.corpusOpenCountry = () => { buildCountryPicker(); const d = document.getElementById('countryDialog'); if(d && !d.open) d.showModal(); };

  function countryNotes(){
    if(!window.CorpusCountry) return;
    const main = document.querySelector('.main'); if(!main) return;
    const here = currentPage(), P = CorpusCountry.get();
    const item = NAV.flatMap(g => g.items).find(i => i[0] === here);
    if(item && item[3] === 'IN' && P.code !== 'IN'){
      const n = document.createElement('div'); n.className = 'country-note';
      n.innerHTML = `<div><strong>This page covers India.</strong> Your country is set to ${P.name}, so its rules and schemes here may not apply to you.</div>
        <div class="row-actions"><button type="button" class="secondary" data-to="IN">Switch to India</button><a class="btn" href="dashboard.html">Back to my dashboard</a></div>`;
      n.querySelector('[data-to]').addEventListener('click', () => { CorpusCountry.set('IN'); location.reload(); });
      main.prepend(n);
    } else if(!CorpusCountry.isChosen() && here === 'dashboard.html'){
      const n = document.createElement('div'); n.className = 'country-note guess';
      n.innerHTML = `<div><strong>Using ${P.name} rules and ${P.symbol.trim()}.</strong> We picked this from your device's time zone. Nothing was sent anywhere.</div>
        <div class="row-actions"><button type="button" data-yes>That's right</button><button type="button" class="secondary" data-change>Choose another country</button></div>`;
      n.querySelector('[data-yes]').addEventListener('click', () => { CorpusCountry.set(P.code); location.reload(); });
      n.querySelector('[data-change]').addEventListener('click', () => window.corpusOpenCountry());
      main.prepend(n);
    }
  }

  /* ---------- quick search ---------- */
  function buildQuickSearch(){
    const items = [];
    NAV.forEach(g => g.items.filter(showItem).forEach(([href, label, icon]) => items.push({ href, label, icon, kind: g.group })));
    if(window.CorpusCountry) CorpusCountry.list().forEach(P => items.push({ action: () => { CorpusCountry.set(P.code); location.reload(); }, label: `Switch country to ${P.name} (${P.symbol.trim()})`, icon: 'globe', kind: 'Country' }));
    items.push({ href: PINNED[0], label: PINNED[1], icon: PINNED[2], kind: 'Settings' });
    EXTRA.forEach(([href, label, icon, kind]) => items.push({ href, label, icon, kind }));
    items.push({ action: () => { window.corpusTogglePrivacy(); }, label: 'Hide or show amounts', icon: 'eye', kind: 'Action' });
    items.push({ action: () => switchTheme(effectiveTheme() === 'dark' ? 'light' : 'dark'), label: 'Switch light or dark theme', icon: 'moon', kind: 'Action' });
    items.push({ action: () => { if(typeof exportData === 'function') exportData(); else location.href = 'settings.html'; }, label: 'Download a backup file', icon: 'download', kind: 'Action' });

    const back = document.createElement('div');
    back.className = 'qs-backdrop';
    back.innerHTML = `<div class="qs" role="dialog" aria-modal="true" aria-label="Quick search">
      <input type="search" placeholder="Search pages, calculators and actions" aria-label="Search" autocomplete="off">
      <div class="qs-list" role="listbox"></div></div>`;
    document.body.appendChild(back);
    const input = back.querySelector('input'), list = back.querySelector('.qs-list');
    let shown = [], sel = 0;
    const esc = (s) => String(s).replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
    function render(){
      const q = input.value.trim().toLowerCase();
      shown = items.filter(it => !q || (it.label + ' ' + it.kind).toLowerCase().includes(q)).slice(0, 12);
      sel = Math.min(sel, Math.max(0, shown.length - 1));
      list.innerHTML = shown.length ? shown.map((it, i) =>
        `<a class="qs-item${i === sel ? ' sel' : ''}" role="option" aria-selected="${i === sel}" data-i="${i}" href="${it.href ? esc(it.href) : '#'}">${svg(it.icon)}<span>${esc(it.label)}</span><small>${esc(it.kind)}</small></a>`).join('')
        : '<div class="qs-empty">Nothing matches. Try "tax", "SIP" or "insurance".</div>';
    }
    function choose(i){
      const it = shown[i]; if(!it) return;
      close();
      if(it.action){ it.action(); return; }
      const [page, hash] = it.href.split('#');
      if(page === currentPage() && hash){ location.hash = hash; location.reload(); }
      else location.href = it.href;
    }
    function open(){ back.classList.add('show'); input.value = ''; sel = 0; render(); setTimeout(() => input.focus(), 10); }
    function close(){ back.classList.remove('show'); }
    input.addEventListener('input', () => { sel = 0; render(); });
    input.addEventListener('keydown', (e) => {
      if(e.key === 'ArrowDown'){ sel = Math.min(shown.length - 1, sel + 1); render(); e.preventDefault(); }
      else if(e.key === 'ArrowUp'){ sel = Math.max(0, sel - 1); render(); e.preventDefault(); }
      else if(e.key === 'Enter'){ choose(sel); e.preventDefault(); }
    });
    list.addEventListener('click', (e) => { const a = e.target.closest('.qs-item'); if(a){ e.preventDefault(); choose(Number(a.dataset.i)); } });
    back.addEventListener('click', (e) => { if(e.target === back) close(); });
    document.addEventListener('keydown', (e) => {
      if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); back.classList.contains('show') ? close() : open(); }
      else if(e.key === 'Escape' && back.classList.contains('show')) close();
    });
    document.querySelectorAll('[data-qs]').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); open(); }));
    window.corpusOpenSearch = open;
  }

  function initNav(){
    const sidebar = document.querySelector('.sidebar');
    const shell = document.querySelector('.shell');
    if(!sidebar || !shell) return;
    buildSidebar(sidebar);

    const topbar = document.createElement('div');
    topbar.className = 'mobile-topbar';
    topbar.innerHTML = `
      <button class="hamburger" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
      ${LOGO}
      <button class="mobile-search" type="button" aria-label="Search" data-qs>${svg('search')}</button>
      <button class="mobile-privacy" type="button" data-privacy aria-pressed="false"></button>
      <button class="mobile-theme" type="button" aria-label="Switch light or dark theme"></button>`;
    shell.insertBefore(topbar, shell.firstChild);

    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    shell.appendChild(backdrop);

    const hamburger = topbar.querySelector('.hamburger');
    topbar.querySelector('.mobile-theme').addEventListener('click', (e) => switchTheme(effectiveTheme() === 'dark' ? 'light' : 'dark', e));
    function closeNav(){ sidebar.classList.remove('open'); backdrop.classList.remove('show'); hamburger.setAttribute('aria-expanded', 'false'); }
    function openNav(){ sidebar.classList.add('open'); backdrop.classList.add('show'); hamburger.setAttribute('aria-expanded', 'true'); }
    hamburger.addEventListener('click', () => sidebar.classList.contains('open') ? closeNav() : openNav());
    backdrop.addEventListener('click', closeNav);
    sidebar.querySelectorAll('.nav a:not([data-qs]), .side-foot a').forEach(a => a.addEventListener('click', closeNav));
    sidebar.querySelectorAll('[data-qs]').forEach(a => a.addEventListener('click', closeNav));
    window.addEventListener('resize', () => { if(window.innerWidth > 900) closeNav(); });
    document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeNav(); });

    document.querySelectorAll('[data-privacy]').forEach(b => b.addEventListener('click', () => window.corpusTogglePrivacy()));
    countryNotes();
    buildQuickSearch();
    applyTheme(getTheme());
    applyPrivacy(getPrivacy());
    if(window.matchMedia){
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if(getTheme() === 'auto') applyTheme('auto'); });
    }
  }

  function initAll(){
    initNav();
    // landing page theme toggle
    document.addEventListener('click', (e) => { if(e.target.closest('[data-country-open]')){ e.preventDefault(); window.corpusOpenCountry(); } });
    document.querySelectorAll('[data-theme-toggle]').forEach(b => b.addEventListener('click', (e) => switchTheme(effectiveTheme() === 'dark' ? 'light' : 'dark', e)));
    attachSliders(); smoothDetails();
    requestAnimationFrame(() => reveal());
    // groups created later (tabs built by page scripts) get a slider too
    new MutationObserver(muts => { if(muts.some(m => m.addedNodes.length)){ attachSliders(); smoothDetails(); } }).observe(document.body, { childList: true, subtree: true });
  }
  applyTheme(getTheme());
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();
})();
