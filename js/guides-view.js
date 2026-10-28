/* =========================================================
   CO₹PU$ — show the person's own country on the Insurance,
   Government Schemes and Scholarships pages.
   India keeps its hand built content. For any other country the
   India sections are hidden and the matching guide from
   js/guides.js (built from tools/guides_data.py) is shown instead.
   The page says which guide it is with <body data-guide="...">.
   ========================================================= */
(function(){
  'use strict';
  const CC = window.CorpusCountry;
  if(!CC || CC.isIndia() || !window.CORPUS_GUIDES) return;
  const code = CC.current(), G = window.CORPUS_GUIDES[code];
  const kind = document.body.dataset.guide;
  if(!G || !G[kind]) return;
  const P = CC.get(code);
  const NM = (['US', 'UK', 'AE'].includes(code) ? 'the ' : '') + P.name;
  const main = document.querySelector('.main'); if(!main) return;
  const TITLES = {
    insurance: ['Insurance', `What you already have in ${NM}, how much life and income cover fits you, and the honest pros and cons of each type.`],
    schemes: ['Government Schemes', `Savings incentives, family payments, pensions and home buying help in ${NM}, each linked to the official page.`],
    students: ['Student Aid and Scholarships', `Grants, loans, savings schemes and scholarship searches for students in ${NM}.`]
  };
  [...main.children].forEach(el => { if(!el.matches('.page-head, .crumbs')) el.hidden = true; });
  const head = main.querySelector('.page-head');
  if(head){
    const h1 = head.querySelector('h1'), p = head.querySelector('p');
    if(h1) h1.textContent = TITLES[kind][0];
    if(p) p.textContent = TITLES[kind][1];
  }
  document.title = `${TITLES[kind][0]} in ${NM} | CO₹PU$`;
  const box = document.createElement('div');
  box.className = 'gd-wrap';
  box.innerHTML = G[kind] + `<p class="hint">Looking for India? <a href="#" data-country-open>Change country</a>.</p>`;
  main.appendChild(box);
})();
