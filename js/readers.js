/* ===========================================================
   CO₹PU$ — file readers
   Turns whatever file a person drops in (PDF, Excel, CSV, a bank's
   ".xls" export, a Word file, a phone photo of a payslip) into plain
   text lines and tables. Everything runs inside this browser tab
   with libraries bundled in js/vendor. No file ever leaves the device.
=========================================================== */
(function(){
  const VENDOR = 'js/vendor/';
  const loaded = {};
  function loadScript(src){
    if(loaded[src]) return loaded[src];
    loaded[src] = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.onload = resolve;
      s.onerror = () => { delete loaded[src]; reject(new Error('Could not load a helper file (' + src.split('/').pop() + '). If you opened the site from a file, try again once it is hosted, or check your connection.')); };
      document.head.appendChild(s);
    });
    return loaded[src];
  }

  class ReadError extends Error { constructor(msg, code){ super(msg); this.code = code; } }

  /* ---------- helpers ---------- */
  const ext = (name) => (name.split('.').pop() || '').toLowerCase();
  const clean = (s) => String(s == null ? '' : s).replace(/ /g, ' ').replace(/[ \t]+/g, ' ').trim();
  function tablesToLines(tables){
    const out = [];
    tables.forEach(t => t.rows.forEach(r => { const line = r.map(clean).filter(Boolean).join('  '); if(line) out.push(line); }));
    return out;
  }
  function sniff(bytes){
    const b = bytes.subarray(0, 8);
    if(b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return 'pdf';
    if(b[0] === 0x50 && b[1] === 0x4b) return 'zip';
    if(b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0) return 'ole';
    if(b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
    if(b[0] === 0xff && b[1] === 0xd8) return 'jpg';
    if(b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) return 'webp';
    return 'text';
  }
  function decodeText(bytes){
    // UTF-8 first; fall back to Windows-1252 which many bank exports use
    try{ return new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
    catch(e){ return new TextDecoder('windows-1252').decode(bytes); }
  }

  /* ---------- PDF ---------- */
  async function ensurePdf(){
    if(!window.pdfjsLib){ await loadScript(VENDOR + 'pdf.min.js'); }
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = VENDOR + 'pdf.worker.min.js';
    return window.pdfjsLib;
  }

  // Rebuild visual lines from positioned text, keeping a wide gap as a column break
  function pageToLines(items){
    const rows = [];
    items.forEach(it => {
      if(!it.str || !it.str.trim()) return;
      const x = it.transform[4], y = it.transform[5], w = it.width || (it.str.length * 4), h = Math.abs(it.transform[3]) || 8;
      let row = rows.find(r => Math.abs(r.y - y) <= Math.max(2, h * 0.35));
      if(!row){ row = { y, h, parts: [] }; rows.push(row); }
      row.parts.push({ x, w, s: it.str, h });
    });
    rows.sort((a, b) => b.y - a.y);
    return rows.map(r => {
      r.parts.sort((a, b) => a.x - b.x);
      let line = '', end = null; const cells = [];
      r.parts.forEach(p => {
        const gap = end == null ? 0 : p.x - end;
        if(end == null){ line = p.s; cells.push(p.s); }
        else if(gap > Math.max(10, p.h * 1.2)){ line += '  ' + p.s; cells.push(p.s); }
        else { const sp = gap > p.h * 0.18 ? ' ' : ''; line += sp + p.s; cells[cells.length - 1] += sp + p.s; }
        end = p.x + p.w;
      });
      return { text: clean(line.replace(/ {2,}/g, '\u0001')).replace(/\u0001/g, '  '), cells: cells.map(clean).filter(Boolean) };
    }).filter(l => l.text);
  }

  async function readPdf(bytes, opts){
    const pdfjs = await ensurePdf();
    let password = undefined, attempt = 0, doc;
    while(true){
      try{
        doc = await pdfjs.getDocument({ data: bytes.slice(0), password, isEvalSupported: false }).promise;
        break;
      }catch(err){
        if(err && err.name === 'PasswordException'){
          attempt++;
          if(!opts.askPassword) throw new ReadError('This PDF is password protected.', 'password');
          password = await opts.askPassword(attempt > 1 || err.code === 2);
          if(password == null) throw new ReadError('Skipped, the PDF needs its password to open.', 'password');
          continue;
        }
        throw new ReadError('This PDF could not be opened. It may be damaged.', 'pdf');
      }
    }
    const lines = [], tables = [];
    let charCount = 0;
    for(let i = 1; i <= doc.numPages; i++){
      opts.onProgress && opts.onProgress(`Reading page ${i} of ${doc.numPages}`);
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pl = pageToLines(content.items);
      pl.forEach(l => { charCount += l.text.length; lines.push(l.text); });
      tables.push({ name: 'Page ' + i, rows: pl.map(l => l.cells) });
    }
    // A scanned PDF has pages but almost no text: read it with OCR instead
    if(charCount < 40 * Math.min(doc.numPages, 3)){
      opts.onProgress && opts.onProgress('This looks like a scanned PDF, reading the text from the images');
      const canvases = [];
      for(let i = 1; i <= Math.min(doc.numPages, 6); i++){
        const page = await doc.getPage(i);
        const vp = page.getViewport({ scale: 2.2 });
        const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
        await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
        canvases.push(c);
      }
      const o = await ocrImages(canvases, opts);
      return { kind: 'pdf', ocr: true, pages: doc.numPages, lines: o.lines, tables: [{ name: 'Scanned text', rows: o.lines.map(l => l.split(/ {2,}/)) }], encrypted: !!password, confidence: o.confidence };
    }
    return { kind: 'pdf', pages: doc.numPages, lines, tables, encrypted: !!password };
  }

  /* ---------- OCR (images, scanned PDFs) ---------- */
  let ocrWorker = null;
  async function getOcr(opts){
    if(ocrWorker) return ocrWorker;
    if(location.protocol === 'file:') throw new ReadError('Reading photos and scanned PDFs needs the site to be opened from a web address (any free static host works), because browsers block the text recogniser when a page is opened straight from a file. Typed PDFs, Excel and CSV files still work.', 'ocr-file');
    await loadScript(VENDOR + 'ocr/tesseract.min.js');
    const base = new URL(VENDOR + 'ocr/', location.href).href;
    ocrWorker = await window.Tesseract.createWorker('eng', 1, {
      workerPath: base + 'worker.min.js',
      corePath: base + 'tesseract-core-lstm.wasm.js',
      langPath: base + 'lang',
      gzip: true,
      logger: m => { if(opts.onProgress && m.status === 'recognizing text') opts.onProgress(`Reading text from the image, ${Math.round(m.progress * 100)}%`); }
    });
    await ocrWorker.setParameters({ preserve_interword_spaces: '1' });
    return ocrWorker;
  }

  function prepImage(src){
    // grey scale and stretch contrast, which helps with phone photos
    const w = src.width || src.naturalWidth, h = src.height || src.naturalHeight;
    const scale = Math.min(1, 3000 / Math.max(w, h)) * (Math.max(w, h) < 1400 ? 2 : 1);
    const c = document.createElement('canvas'); c.width = Math.round(w * scale); c.height = Math.round(h * scale);
    const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(src, 0, 0, c.width, c.height);
    const d = ctx.getImageData(0, 0, c.width, c.height), p = d.data;
    let lo = 255, hi = 0;
    for(let i = 0; i < p.length; i += 16){ const g = p[i] * .299 + p[i + 1] * .587 + p[i + 2] * .114; if(g < lo) lo = g; if(g > hi) hi = g; }
    const span = Math.max(40, hi - lo);
    for(let i = 0; i < p.length; i += 4){ let g = p[i] * .299 + p[i + 1] * .587 + p[i + 2] * .114; g = Math.max(0, Math.min(255, (g - lo) * 255 / span)); p[i] = p[i + 1] = p[i + 2] = g; }
    ctx.putImageData(d, 0, 0);
    return c;
  }

  async function ocrImages(sources, opts){
    const worker = await getOcr(opts);
    const lines = []; let confSum = 0, n = 0;
    for(const src of sources){
      const { data } = await worker.recognize(prepImage(src));
      data.text.split('\n').map(s => s.replace(/\s+$/,'')).filter(s => s.trim()).forEach(l => lines.push(l.replace(/ {3,}/g, '  ').replace(/(\S) (\S)/g, '$1 $2').trim()));
      confSum += data.confidence; n++;
    }
    return { lines, confidence: n ? confSum / n : 0 };
  }

  async function readImage(file, opts){
    const url = URL.createObjectURL(file);
    try{
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new ReadError('This image could not be opened.', 'image')); i.src = url; });
      const o = await ocrImages([img], opts);
      return { kind: 'image', ocr: true, lines: o.lines, tables: [{ name: 'Photo text', rows: o.lines.map(l => l.split(/ {2,}/)) }], confidence: o.confidence };
    } finally { URL.revokeObjectURL(url); }
  }

  /* ---------- CSV / TSV ---------- */
  function parseDelimited(text){
    text = text.replace(/^﻿/, '');
    const sample = text.split(/\r?\n/).slice(0, 20).join('\n');
    const counts = [',', ';', '\t', '|'].map(d => [d, (sample.match(new RegExp(d === '|' ? '\\|' : d, 'g')) || []).length]);
    const delim = counts.sort((a, b) => b[1] - a[1])[0][0];
    const rows = []; let row = [], cell = '', q = false;
    for(let i = 0; i < text.length; i++){
      const ch = text[i];
      if(q){
        if(ch === '"'){ if(text[i + 1] === '"'){ cell += '"'; i++; } else q = false; }
        else cell += ch;
      } else if(ch === '"' && cell === '') q = true;
      else if(ch === delim){ row.push(cell); cell = ''; }
      else if(ch === '\n' || ch === '\r'){ if(ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += ch;
    }
    if(cell !== '' || row.length){ row.push(cell); rows.push(row); }
    return rows.map(r => r.map(clean)).filter(r => r.some(Boolean));
  }

  /* ---------- XLSX (zip of XML), read with fflate ---------- */
  function colIndex(ref){ let n = 0; for(const ch of ref.replace(/\d+/g, '')) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; }
  function excelDate(serial){
    const ms = Math.round((serial - 25569) * 86400 * 1000);
    const d = new Date(ms);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  }
  async function readXlsx(bytes){
    await loadScript(VENDOR + 'fflate.min.js');
    let files;
    try{ files = window.fflate.unzipSync(bytes, { filter: f => /^(xl\/(workbook\.xml|sharedStrings\.xml|styles\.xml|worksheets\/[^/]+\.xml|_rels\/workbook\.xml\.rels)|word\/document\.xml)$/.test(f.name) }); }
    catch(e){ throw new ReadError('This file looks like an Excel file but could not be opened. It may be password protected; save a copy without a password and try again.', 'xlsx'); }
    const dec = new TextDecoder('utf-8');
    const xml = (name) => files[name] ? new DOMParser().parseFromString(dec.decode(files[name]), 'application/xml') : null;

    if(files['word/document.xml']){ // a .docx payslip
      const doc = xml('word/document.xml');
      const rows = [];
      doc.querySelectorAll('tbl tr, body > p').forEach(n => {
        if(n.localName === 'tr') rows.push([...n.children].filter(c => c.localName === 'tc').map(tc => clean(tc.textContent)));
        else { const t = clean(n.textContent); if(t) rows.push([t]); }
      });
      return { kind: 'docx', tables: [{ name: 'Document', rows }], lines: tablesToLines([{ rows }]) };
    }
    if(!files['xl/workbook.xml']) throw new ReadError('This zip file is not an Excel workbook.', 'xlsx');

    const shared = [];
    const ss = xml('xl/sharedStrings.xml');
    if(ss) ss.querySelectorAll('si').forEach(si => shared.push([...si.getElementsByTagName('t')].map(t => t.textContent).join('')));
    // which styles are dates
    const dateStyles = new Set();
    const st = xml('xl/styles.xml');
    if(st){
      const custom = {};
      st.querySelectorAll('numFmts numFmt').forEach(n => custom[n.getAttribute('numFmtId')] = n.getAttribute('formatCode') || '');
      const xfs = st.querySelector('cellXfs');
      if(xfs) [...xfs.children].forEach((xf, i) => {
        const id = Number(xf.getAttribute('numFmtId'));
        const code = custom[id] || '';
        if((id >= 14 && id <= 22) || (id >= 45 && id <= 47) || (/[dy]/i.test(code.replace(/\[[^\]]*\]|"[^"]*"/g, '')) && !/0\.0/.test(code))) dateStyles.add(i);
      });
    }
    const wb = xml('xl/workbook.xml'), rels = xml('xl/_rels/workbook.xml.rels');
    const relMap = {};
    if(rels) rels.querySelectorAll('Relationship').forEach(r => relMap[r.getAttribute('Id')] = r.getAttribute('Target'));
    const tables = [];
    wb.querySelectorAll('sheets sheet').forEach((sh, i) => {
      const rid = sh.getAttribute('r:id') || sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
      let target = relMap[rid] || `worksheets/sheet${i + 1}.xml`;
      target = target.replace(/^\/?xl\//, '');
      const doc = xml('xl/' + target);
      if(!doc) return;
      const rows = [];
      doc.querySelectorAll('sheetData row').forEach(r => {
        const ri = Number(r.getAttribute('r')) - 1;
        const arr = [];
        [...r.children].filter(c => c.localName === 'c').forEach((c, ci) => {
          const ref = c.getAttribute('r'); const col = ref ? colIndex(ref) : ci;
          const t = c.getAttribute('t'); const s = Number(c.getAttribute('s') || 0);
          const v = c.getElementsByTagName('v')[0];
          let val = '';
          if(t === 's') val = shared[Number(v && v.textContent)] || '';
          else if(t === 'inlineStr') val = [...c.getElementsByTagName('t')].map(x => x.textContent).join('');
          else if(t === 'b') val = v && v.textContent === '1' ? 'TRUE' : 'FALSE';
          else if(v){ val = v.textContent; if((!t || t === 'n') && dateStyles.has(s) && /^\d+(\.\d+)?$/.test(val) && Number(val) > 20000 && Number(val) < 80000) val = excelDate(Number(val)); }
          arr[col] = clean(val);
        });
        for(let k = 0; k < arr.length; k++) if(arr[k] == null) arr[k] = '';
        rows[ri] = arr;
      });
      tables.push({ name: sh.getAttribute('name') || ('Sheet ' + (i + 1)), rows: rows.filter(r => r && r.some(Boolean)) });
    });
    return { kind: 'sheet', tables, lines: tablesToLines(tables) };
  }

  /* ---------- HTML tables (many banks' ".xls" downloads are really HTML) ---------- */
  function readHtmlTables(text){
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const tables = [...doc.querySelectorAll('table')].map((t, i) => ({
      name: 'Table ' + (i + 1),
      rows: [...t.querySelectorAll('tr')].map(tr => [...tr.children].map(td => clean(td.textContent))).filter(r => r.some(Boolean))
    })).filter(t => t.rows.length);
    // keep only the innermost tables when they are nested
    return { kind: 'sheet', tables, lines: tables.length ? tablesToLines(tables) : clean(doc.body.textContent).split(/\n/) };
  }

  /* ---------- entry point ---------- */
  async function read(file, opts){
    opts = opts || {};
    if(file.size > 25 * 1024 * 1024) throw new ReadError('This file is over 25 MB. Statements and payslips are usually much smaller, so try exporting a shorter date range.', 'size');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = sniff(bytes), e = ext(file.name);
    let out;
    if(kind === 'pdf') out = await readPdf(bytes, opts);
    else if(kind === 'zip') out = await readXlsx(bytes);
    else if(kind === 'ole') throw new ReadError('This is an old style Excel (.xls) file, which can only be read by Excel itself. Open it in Excel, Google Sheets or LibreOffice and save it as .xlsx or CSV, then drop that here.', 'xls-binary');
    else if(['png', 'jpg', 'webp'].includes(kind) || /^(png|jpe?g|webp|bmp|gif|heic)$/.test(e)){
      if(e === 'heic') throw new ReadError('iPhone HEIC photos cannot be read in the browser. Share the photo as JPEG (most phones do this when you email or send it), then try again.', 'heic');
      out = await readImage(file, opts);
    }
    else {
      const text = decodeText(bytes);
      if(e === 'json' || /^\s*[{[]/.test(text)){
        try{ return { kind: 'json', json: JSON.parse(text), lines: [], tables: [] }; }catch(err){ /* not JSON, fall through */ }
      }
      if(/<table[\s>]/i.test(text)) out = readHtmlTables(text);
      else {
        const rows = parseDelimited(text);
        const looksTabular = rows.length > 2 && rows.filter(r => r.length > 2).length > rows.length * 0.5;
        out = looksTabular ? { kind: 'sheet', tables: [{ name: file.name, rows }], lines: tablesToLines([{ rows }]) }
                           : { kind: 'text', tables: [], lines: text.split(/\r?\n/).map(clean).filter(Boolean) };
      }
    }
    out.name = file.name; out.size = file.size;
    out.text = out.lines.join('\n');
    return out;
  }

  window.CorpusReaders = { read, ReadError, parseDelimited };
})();
