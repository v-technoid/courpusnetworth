/* =========================================================
   CO₹PU$ — price sources and API keys
   ---------------------------------------------------------
   Most live prices need nothing. Two services (Alpha Vantage and
   Finnhub) ask each person for a free key of their own. This file
   explains that in plain words, shows which sources are ready, lets
   people test a key before saving it, and opens a short guided
   dialog the moment a refresh needs a key, instead of an error.
   Keys live only in this browser (settings in corpus_data_v1) and
   are sent only to the service they belong to.
   Needs storage.js and prices.js.
   ========================================================= */
(function(){
  'use strict';
  const PROVIDERS = {
    alphavantage: {
      name: 'Alpha Vantage', setting: 'alphaVantageKey', signup: 'https://www.alphavantage.co/support/#api-key', host: 'alphavantage.co',
      limit: '25 lookups a day', time: 'about 20 seconds, no card needed',
      covers: 'Stocks, ETFs and funds by ticker: US (VOO, VFIAX), India BSE (RELIANCE.BSE), London (VWRL.LON), Toronto (XIU.TRT)',
      test: 'IBM', fetch: (sym, key) => fetchStockPrice(sym, key)
    },
    finnhub: {
      name: 'Finnhub', setting: 'finnhubKey', signup: 'https://finnhub.io/register', host: 'finnhub.io',
      limit: '60 lookups a minute', time: 'about a minute, free account',
      covers: 'US listed stocks and ETFs (AAPL, VOO). Its free plan does not cover other exchanges',
      test: 'AAPL', fetch: (sym, key) => fetchFinnhubQuote(sym, key).then(r => ({ price: r.price }))
    },
    eodhd: {
      name: 'EODHD', setting: 'eodhdKey', signup: 'https://eodhd.com/register', host: 'eodhd.com',
      limit: '20 lookups a day, prices about 15 minutes old', time: 'about a minute, free account',
      covers: 'Stocks and ETFs on many world exchanges: Australia (VAS.AU), Toronto (XIU.TO), London (VWRL.LSE) and the US (VOO.US)',
      test: 'AAPL.US', fetch: (sym, key) => fetchEodhdQuote(sym, key)
    }
  };
  // exchange choice on the Assets page -> code for each service
  const EX = { LON: { av: 'LON', eod: 'LSE' }, TRT: { av: 'TRT', eod: 'TO' }, ASX: { eod: 'AU' }, BSE: { av: 'BSE' } };
  const AV_SUFFIX = ['LON', 'TRT', 'TRV', 'DEX', 'BSE', 'SHH', 'SHZ'];
  const EOD_FROM_AV = { LON: 'LSE', TRT: 'TO', TRV: 'V', DEX: 'XETRA' };
  const FREE = [
    { name: 'Mutual fund NAVs', by: 'mfapi.in', what: 'Indian mutual funds, by scheme code', india: true },
    { name: 'Gold and silver', by: 'goldprice.dev', what: 'Price per gram in your currency' },
    { name: 'Crypto', by: 'CoinGecko', what: 'Bitcoin, Ether and other coins' },
    { name: 'Currency rates', by: 'Frankfurter', what: 'Converter and foreign holdings' }
  ];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const I = {
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3M17 6l3 3M14 9l2 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
  };

  const settings = () => loadData().settings || {};
  const keyOf = (p) => (settings()[PROVIDERS[p].setting] || '').trim();
  const hasKey = (p) => !!keyOf(p);
  function saveKey(p, key){ updateSettings({ [PROVIDERS[p].setting]: (key || '').trim() }); document.dispatchEvent(new CustomEvent('corpus:keys')); }

  // Choose a service for a ticker: a suffix like .BSE or .LON needs Alpha Vantage;
  // otherwise use the preferred one, or whichever already has a key.
  function pick(){
    const pref = PROVIDERS[settings().priceProvider] ? settings().priceProvider : 'alphavantage';
    if(hasKey(pref)) return pref;
    return ['finnhub', 'alphavantage', 'eodhd'].find(hasKey) || pref;
  }
  // Which service to ask, and how to write the ticker for it.
  function route(symbol, exchange){
    const s = String(symbol || '').trim().toUpperCase();
    const ex = EX[exchange];
    if(ex){
      if(ex.eod && (hasKey('eodhd') || !ex.av)) return { provider: 'eodhd', symbol: s + '.' + ex.eod };
      return { provider: 'alphavantage', symbol: s + '.' + ex.av };
    }
    const m = s.match(/^(.+)\.([A-Z]{1,6})$/);
    if(m){
      if(AV_SUFFIX.includes(m[2])){
        if(hasKey('alphavantage') || !hasKey('eodhd') || !EOD_FROM_AV[m[2]]) return { provider: 'alphavantage', symbol: s };
        return { provider: 'eodhd', symbol: m[1] + '.' + EOD_FROM_AV[m[2]] };
      }
      return { provider: 'eodhd', symbol: s };
    }
    const p = pick();
    return { provider: p, symbol: p === 'eodhd' ? s + '.US' : s };
  }

  // Test a key with one real lookup. Resolves to a short human message.
  async function test(p, key){
    const P = PROVIDERS[p];
    if(!key || key.trim().length < 6) throw new Error('That does not look like a full key. Copy it again from ' + P.host + '.');
    const r = await P.fetch(P.test, key.trim());
    return `It works. ${P.test} is ${r.price.toLocaleString('en-US', { maximumFractionDigits: 2 })} US dollars right now.`;
  }

  /* ---------- the guided dialog ---------- */
  function steps(p, idp){
    const P = PROVIDERS[p];
    return `<ol class="key-steps">
      <li><span class="ks-n">1</span><div><b>Claim a free key from ${P.name}</b><small>${esc(P.time)}</small>
        <a class="btn ks-link" href="${P.signup}" target="_blank" rel="noopener noreferrer">${icon(I.ext)}Get my free key</a></div></li>
      <li><span class="ks-n">2</span><div><b>Copy the key it shows you</b><small>A mix of letters and numbers.</small></div></li>
      <li><span class="ks-n">3</span><div><b>Paste it here</b>
        <div class="key-input"><input type="password" id="${idp}Input" autocomplete="off" spellcheck="false" placeholder="Paste your ${P.name} key" value="${esc(keyOf(p))}">
        <button type="button" class="secondary" data-k-show="${idp}Input">Show</button></div></div></li>
    </ol>`;
  }

  let gate = null;
  function need(p, context){
    return new Promise((resolve, reject) => {
      if(gate) gate.remove();
      const P = PROVIDERS[p], other = p === 'alphavantage' ? 'finnhub' : p === 'finnhub' ? 'alphavantage' : null;
      const dlg = document.createElement('dialog');
      dlg.className = 'corpus-dialog key-dialog'; dlg.setAttribute('aria-labelledby', 'keyDlgH');
      dlg.innerHTML = `<div class="kd-head"><span class="kd-icon">${icon(I.key)}</span><div>
          <h3 id="keyDlgH">Turn on live prices${context ? ' for ' + esc(context) : ''}</h3>
          <p>${P.name} gives every person a free key of their own. Add yours once and the Refresh buttons just work.</p></div></div>
        <details class="faq-item kd-why"><summary>Why do I need a key?</summary><div class="faq-a"><p>Price services hand out free keys so they can share their free allowance fairly (${esc(P.limit)} on ${P.name}). CO₹PU$ has no server to hold one shared key, which is also why your data never leaves this browser. Mutual fund NAVs in India, gold, crypto and currency rates need no key at all.</p></div></details>
        ${steps(p, 'kd')}
        <p class="kd-status" id="kdStatus" role="status" aria-live="polite"></p>
        <div class="imp-actions kd-actions">
          <button type="button" id="kdSave">Test and save</button>
          <button type="button" class="secondary" data-k-cancel>Enter the price myself</button>
        </div>
        <p class="kd-foot">${icon(I.lock)}<span>Stored only in this browser and sent only to ${P.host} with the ticker. Never in PDF reports.${other ? ` <button type="button" class="link" data-k-switch="${other}">Use ${PROVIDERS[other].name} instead</button>` : ''}</span></p>`;
      document.body.appendChild(dlg); gate = dlg;
      const status = dlg.querySelector('#kdStatus'), input = dlg.querySelector('#kdInput'), save = dlg.querySelector('#kdSave');
      let done = false;
      const finish = (ok, val) => { done = true; dlg.close(); setTimeout(() => dlg.remove(), 300); gate = null; ok ? resolve(val) : reject(Object.assign(new Error('cancelled'), { code: 'CANCELLED' })); };
      save.addEventListener('click', async () => {
        status.className = 'kd-status'; status.textContent = 'Checking with ' + P.name + '…'; save.disabled = true;
        try{
          const msg = await test(p, input.value);
          saveKey(p, input.value);
          if(!settings().priceProvider || !hasKey(settings().priceProvider)) updateSettings({ priceProvider: p });
          status.className = 'kd-status ok'; status.textContent = msg + ' Saved.';
          setTimeout(() => finish(true, { provider: p, key: input.value.trim() }), 700);
        }catch(err){ status.className = 'kd-status err'; status.textContent = err.message; }
        finally{ save.disabled = false; }
      });
      input.addEventListener('keydown', (e) => { if(e.key === 'Enter'){ e.preventDefault(); save.click(); } });
      dlg.addEventListener('click', (e) => {
        if(e.target.closest('[data-k-cancel]') || e.target === dlg) finish(false);
        const sw = e.target.closest('[data-k-switch]');
        if(sw){ done = true; dlg.close(); dlg.remove(); gate = null; need(sw.dataset.kSwitch, context).then(resolve, reject); }
        const sh = e.target.closest('[data-k-show]'); if(sh) toggle(sh);
      });
      dlg.addEventListener('close', () => { if(!done) finish(false); });
      dlg.showModal();
      setTimeout(() => input.focus(), 50);
    });
  }
  function toggle(btn){
    const inp = document.getElementById(btn.dataset.kShow); if(!inp) return;
    const show = inp.type === 'password'; inp.type = show ? 'text' : 'password'; btn.textContent = show ? 'Hide' : 'Show';
  }

  // Run a lookup; if it fails for want of a key (or a wrong one), guide the person and try again once.
  async function withKey(p, run, context){
    if(!hasKey(p)) await need(p, context);
    try{ return await run(keyOf(p)); }
    catch(err){
      if(err.code === 'BAD_KEY' || err.code === 'NO_KEY'){ await need(p, context); return run(keyOf(p)); }
      throw err;
    }
  }

  /* ---------- small status strip for the Assets page ---------- */
  function strip(kind){
    const india = !window.CorpusCountry || CorpusCountry.isIndia();
    if(kind === 'mf' && india){
      return `<div class="src-strip ok">${icon(I.check)}<span><b>Live NAV, no key needed.</b> Search for your fund below, and Refresh fetches the latest NAV from mfapi.in.</span></div>`;
    }
    const p = pick(), ready = Object.keys(PROVIDERS).some(hasKey);
    const what = kind === 'stock' ? 'stock prices' : 'fund and ETF prices';
    if(ready){
      const names = Object.keys(PROVIDERS).filter(hasKey).map(k => PROVIDERS[k].name).join(' and ');
      return `<div class="src-strip ok">${icon(I.check)}<span><b>Live ${what} are on</b> with your ${names} key. Add the ticker, then press Refresh.</span><a href="settings.html#prices" class="link">Manage</a></div>`;
    }
    return `<div class="src-strip need">${icon(I.key)}<span><b>Live ${what} need one free key.</b> It takes under a minute${kind === 'fund' ? ', or just type the price yourself' : ''}.</span><button type="button" class="secondary" data-key-setup="${p}">Set up</button></div>`;
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-key-setup]');
    if(b){ e.preventDefault(); need(b.dataset.keySetup).then(() => { document.dispatchEvent(new CustomEvent('corpus:keys')); if(window.showToast) showToast('Key saved. Refresh buttons now fetch live prices.'); }).catch(() => {}); }
  });

  /* ---------- the Settings panel ---------- */
  function renderSettings(el){
    if(!el) return;
    const india = !window.CorpusCountry || CorpusCountry.isIndia();
    const s = settings();
    const free = FREE.filter(f => india || !f.india);
    const keyed = Object.keys(PROVIDERS);
    const ready = free.length + keyed.filter(hasKey).length, total = free.length + keyed.length;
    el.innerHTML = `
      <div class="src-head"><div><h2>Live Prices</h2>
        <p class="hint" style="margin:0;">Refresh buttons can fetch today’s prices. Most sources need nothing. Three ask for a free personal key, and you only need one.</p></div>
        <span class="src-count${ready === total ? ' all' : ''}">${ready} of ${total} ready</span></div>
      <div class="src-grid">
        ${free.map(f => `<div class="src-tile"><span class="src-dot ok"></span><div><b>${f.name}</b><small>${f.what} · ${f.by}</small><span class="src-badge ok">No key needed</span></div></div>`).join('')}
        ${keyed.map(k => { const P = PROVIDERS[k], on = hasKey(k); return `<div class="src-tile"><span class="src-dot ${on ? 'ok' : 'need'}"></span><div><b>${k === 'alphavantage' ? (india ? 'Stocks (BSE and US)' : 'Stocks, ETFs and funds') : k === 'eodhd' ? 'World stocks and ETFs' : 'US stocks and ETFs'}</b><small>${P.name} · ${P.limit}</small><span class="src-badge ${on ? 'ok' : 'need'}">${on ? 'Key added' : 'Free key needed'}</span></div></div>`; }).join('')}
      </div>
      ${!india ? `<p class="callout">${icon(I.key)}<span>Outside India there is no free, keyless source for fund prices, so funds and ETFs refresh by ticker through Alpha Vantage, Finnhub or EODHD. Funds without a ticker, such as many UK unit trusts or super options, can keep a price you type in.</span></p>` : ''}
      <div class="key-cards">
        ${keyed.map(k => { const P = PROVIDERS[k], on = hasKey(k); return `<section class="key-card${on ? ' on' : ''}" data-provider="${k}">
          <div class="kc-top"><h3>${P.name}</h3><span class="src-badge ${on ? 'ok' : 'need'}">${on ? 'Key added' : 'No key yet'}</span></div>
          <p class="hint" style="margin-top:0;">${esc(P.covers)}. Free plan: ${esc(P.limit)}.</p>
          ${steps(k, 'kc_' + k)}
          <p class="kd-status" id="kc_${k}Status" role="status" aria-live="polite"></p>
          <div class="kc-actions"><button type="button" data-k-test="${k}">Test and save</button>${on ? `<button type="button" class="secondary" data-k-remove="${k}">Remove key</button>` : ''}</div>
        </section>`; }).join('')}
      </div>
      <div class="src-pref"><label for="priceProvider">When a US ticker could use either, ask</label>
        <select id="priceProvider"><option value="alphavantage">Alpha Vantage</option><option value="finnhub">Finnhub</option><option value="eodhd">EODHD</option></select>
        <p class="hint">Indian BSE tickers use Alpha Vantage. Australian (ASX) tickers need EODHD. London and Toronto use EODHD if you added its key, otherwise Alpha Vantage. Singapore, New Zealand and UAE listings have no free live source yet, so type their price.</p></div>
      <p class="kd-foot">${icon(I.lock)}<span>Keys are stored only in this browser and sent only to the service they belong to. They are included in your backup file, so keep that file private.</span></p>`;
    const sel = el.querySelector('#priceProvider'); sel.value = PROVIDERS[s.priceProvider] ? s.priceProvider : 'alphavantage';
    sel.addEventListener('change', () => { updateSettings({ priceProvider: sel.value }); if(window.showToast) showToast('Saved.'); });
    el.onclick = async (e) => {
      const sh = e.target.closest('[data-k-show]'); if(sh){ toggle(sh); return; }
      const rm = e.target.closest('[data-k-remove]');
      if(rm){ saveKey(rm.dataset.kRemove, ''); renderSettings(el); if(window.showToast) showToast('Key removed from this browser.'); return; }
      const tb = e.target.closest('[data-k-test]'); if(!tb) return;
      const k = tb.dataset.kTest, st = document.getElementById('kc_' + k + 'Status'), inp = document.getElementById('kc_' + k + 'Input');
      st.className = 'kd-status'; st.textContent = 'Checking with ' + PROVIDERS[k].name + '…'; tb.disabled = true;
      try{
        const msg = await test(k, inp.value); saveKey(k, inp.value);
        renderSettings(el);
        const st2 = document.getElementById('kc_' + k + 'Status'); st2.className = 'kd-status ok'; st2.textContent = msg + ' Saved.';
      }catch(err){ st.className = 'kd-status err'; st.textContent = err.message; tb.disabled = false; }
    };
  }

  window.CorpusKeys = { PROVIDERS, hasKey, keyOf, pick, route, test, need, withKey, strip, renderSettings };
})();
