// Scripture inside Akouō: the Berean Standard Bible (BSB), dedicated to the public domain on April 30, 2023
// (https://berean.bible/terms.htm). One small file per book in bible/bsb/, loaded when a passage is opened
// and kept on the device by the service worker, so passages open offline after the first time.
export const BIBLE_ABBR = "BSB";
export const BIBLE_CREDIT = "Scripture from the Berean Standard Bible (BSB), public domain.";
const BASE = "./bible/bsb/";

// [name used in Akouō, USFM file code, chapters, other names people type separated by |]
const BOOKS = [
  ["Genesis","GEN",50,"gen|ge|gn"],["Exodus","EXO",40,"exod|exo|ex"],["Leviticus","LEV",27,"lev|lv"],["Numbers","NUM",36,"num|nm|nb"],
  ["Deuteronomy","DEU",34,"deut|deu|dt"],["Joshua","JOS",24,"josh|jos"],["Judges","JDG",21,"judg|jdg|jg"],["Ruth","RUT",4,"rut|ru"],
  ["1 Samuel","1SA",31,"1 sam|1 sa|1sam"],["2 Samuel","2SA",24,"2 sam|2 sa|2sam"],["1 Kings","1KI",22,"1 kgs|1 ki|1kgs"],["2 Kings","2KI",25,"2 kgs|2 ki|2kgs"],
  ["1 Chronicles","1CH",29,"1 chr|1 chron|1 ch"],["2 Chronicles","2CH",36,"2 chr|2 chron|2 ch"],["Ezra","EZR",10,"ezr"],["Nehemiah","NEH",13,"neh|ne"],
  ["Esther","EST",10,"esth|est"],["Job","JOB",42,"jb"],["Psalm","PSA",150,"psalms|ps|psa|pss|psm"],["Proverbs","PRO",31,"prov|pro|prv|pr"],
  ["Ecclesiastes","ECC",12,"eccl|ecc|qoh"],["Song of Songs","SNG",8,"song of solomon|song|sos|canticles"],["Isaiah","ISA",66,"isa|is"],["Jeremiah","JER",52,"jer|je"],
  ["Lamentations","LAM",5,"lam|la"],["Ezekiel","EZK",48,"ezek|eze|ezk"],["Daniel","DAN",12,"dan|da|dn"],["Hosea","HOS",14,"hos|ho"],
  ["Joel","JOL",3,"jl"],["Amos","AMO",9,"am"],["Obadiah","OBA",1,"obad|ob"],["Jonah","JON",4,"jnh"],["Micah","MIC",7,"mic|mi"],
  ["Nahum","NAM",3,"nah|na"],["Habakkuk","HAB",3,"hab|hb"],["Zephaniah","ZEP",3,"zeph|zep"],["Haggai","HAG",2,"hag|hg"],
  ["Zechariah","ZEC",14,"zech|zec"],["Malachi","MAL",4,"mal|ml"],["Matthew","MAT",28,"matt|mat|mt"],["Mark","MRK",16,"mrk|mk|mr"],
  ["Luke","LUK",24,"luk|lk"],["John","JHN",21,"jhn|jn"],["Acts","ACT",28,"act|ac"],["Romans","ROM",16,"rom|ro|rm"],
  ["1 Corinthians","1CO",16,"1 cor|1 co|1cor"],["2 Corinthians","2CO",13,"2 cor|2 co|2cor"],["Galatians","GAL",6,"gal|ga"],["Ephesians","EPH",6,"eph|ephes"],
  ["Philippians","PHP",4,"phil|php|pp"],["Colossians","COL",4,"col"],["1 Thessalonians","1TH",5,"1 thess|1 th|1thess"],["2 Thessalonians","2TH",3,"2 thess|2 th|2thess"],
  ["1 Timothy","1TI",6,"1 tim|1 ti|1tim"],["2 Timothy","2TI",4,"2 tim|2 ti|2tim"],["Titus","TIT",3,"tit"],["Philemon","PHM",1,"philem|phlm|phm"],
  ["Hebrews","HEB",13,"heb"],["James","JAS",5,"jas|jm"],["1 Peter","1PE",5,"1 pet|1 pe|1pet"],["2 Peter","2PE",3,"2 pet|2 pe|2pet"],
  ["1 John","1JN",5,"1 jn|1 jhn|1jn"],["2 John","2JN",1,"2 jn|2jn"],["3 John","3JN",1,"3 jn|3jn"],["Jude","JUD",1,"jud|jd"],["Revelation","REV",22,"rev|re|revelations"]
];
const ALIAS = new Map();
for (const b of BOOKS) for (const n of [b[0], b[1], ...b[3].split("|")]) ALIAS.set(norm(n), b);
function norm(s){
  return String(s).toLowerCase().replace(/\./g, "").replace(/^(iii|3rd|third)\s*/, "3 ").replace(/^(ii|2nd|second)\s*/, "2 ").replace(/^(i|1st|first)\s+/, "1 ")
    .replace(/^([1-3])\s*/, "$1 ").replace(/\s+/g, " ").trim();
}
export const BIBLE_BOOKS = BOOKS.map(b => b[0]);
export function findBook(name){ return ALIAS.get(norm(name)) || null; }

// "Isaiah 30:15-21", "Ps 23", "John 15:1-8, 16", "Matthew 5:1-7:29", "Jude 20-25", "Romans 8:26-27; 12:1"
export function parseRefs(str){
  const out = []; let last = null;
  for (const seg of String(str || "").replace(/[–—]/g, "-").split(";")) {
    const s = seg.trim(); if (!s) continue;
    const m = /^((?:[1-3]|i{1,3})\s*[a-z][a-z .]*?|[a-z][a-z .]*?)\.?\s*(\d.*)?$/i.exec(s);
    let book, nums;
    if (m && findBook(m[1])) { book = findBook(m[1]); nums = (m[2] || "").trim(); }
    else if (last && /^\d/.test(s)) { book = last; nums = s; }
    else continue;
    last = book;
    const one = book[2] === 1;
    if (!nums) { out.push(mk(book, 1, 1, book[2], Infinity, book[0])); continue; }
    let ch = null;
    for (const item of nums.split(",").map(x => x.trim()).filter(Boolean)) {
      let r;
      if ((r = /^(\d+):(\d+)\s*-\s*(\d+):(\d+)$/.exec(item))) { out.push(mk(book, +r[1], +r[2], +r[3], +r[4])); ch = +r[3]; }
      else if ((r = /^(\d+):(\d+)(?:\s*-\s*(\d+))?$/.exec(item))) { ch = +r[1]; out.push(mk(book, ch, +r[2], ch, r[3] ? +r[3] : +r[2])); }
      else if ((r = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(item))) {
        if (one) { ch = 1; out.push(mk(book, 1, +r[1], 1, r[2] ? +r[2] : +r[1])); }
        else if (ch != null) out.push(mk(book, ch, +r[1], ch, r[2] ? +r[2] : +r[1]));
        else { const a = +r[1], z = r[2] ? +r[2] : a; out.push(mk(book, a, 1, z, Infinity)); }
      }
    }
  }
  for (const r of out) r.label = label(r);
  return out.filter(r => r.c1 >= 1 && r.c1 <= r.book[2]);
}
function mk(book, c1, v1, c2, v2){ return { book, c1, v1, c2: Math.min(c2, book[2]), v2 }; }
function label(r){
  const n = r.book[0], one = r.book[2] === 1;
  if (r.v1 === 1 && r.v2 === Infinity) return r.c1 === r.c2 ? (one ? n : `${n} ${r.c1}`) : `${n} ${r.c1}-${r.c2}`;
  const a = one ? `${r.v1}` : `${r.c1}:${r.v1}`;
  if (r.c1 === r.c2) return `${n} ${a}${r.v2 !== r.v1 ? "-" + r.v2 : ""}`;
  return `${n} ${a}-${r.c2}:${r.v2 === Infinity ? "end" : r.v2}`;
}
export function refLabel(str){ const r = parseRefs(str); return r.length ? r.map(x => x.label).join("; ") : String(str || ""); }

const books = new Map();
async function loadBook(code){
  if (!books.has(code)) books.set(code, fetch(BASE + code + ".json").then(res => { if (!res.ok) throw new Error("missing"); return res.json(); })
    .catch(err => { books.delete(code); throw err; }));
  return books.get(code);
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
// LORD/GOD in small capitals as printed; a dash stays on the line with the word before it
const lord = s => esc(s).replace(/(\S)—/g, "$1⁠—").replace(/\bLORD\b/g, '<span class="lord">Lord</span>').replace(/\bGOD\b/g, '<span class="lord">God</span>');
const PCLASS = { m: "pm", pmo: "pm", p: "pm", nb: "pm", pc: "pc", q1: "q1", q2: "q2", q3: "q3", qa: "pc", qr: "qr", li1: "li1", li2: "li2" };

function renderRange(data, r, multi){
  let html = "", open = null, pend = "pm", heads = [], started = false;
  const close = () => { if (open) { html += "</p>"; open = null; } };
  const put = s => { if (!open) { html += `<p class="${pend}">`; open = pend; } html += s; };
  for (let c = r.c1; c <= r.c2; c++) {
    const ch = data.c[c - 1]; if (!ch) break;
    const lo = c === r.c1 ? r.v1 : 1, hi = c === r.c2 ? r.v2 : Infinity;
    let cv = 0;
    if (multi && c > r.c1) { close(); html += `<p class="chap">Chapter ${c}</p>`; }
    for (const t of ch) {
      const k = t[0];
      if (k === "h" || k === "d") { heads.push(t); continue; }
      if (k === "p") { if (open) close(); pend = PCLASS[t[1]] || "pm"; continue; }
      if (k === "b") { if (started && cv >= lo && cv <= hi) { close(); html += '<span class="stanza"></span>'; } continue; }
      if (k > 0) cv = k;
      const inside = cv >= lo && cv <= hi && (k > 0 || started || lo === 1);
      if (!inside) { if (k > 0) heads = []; continue; }
      if (heads.length) {
        close();
        for (const h of heads) if (h[0] === "h") html += `<p class="bh">${lord(h[1])}</p>`; else if (cv <= 1 || lo === 1) html += `<p class="bd">${lord(h[1])}</p>`;
        heads = [];
      }
      if (k > 0) { put(`<sup class="vn">${k}</sup>`); started = true; }
      put(lord(t[1]) + " ");
    }
    if (hi !== Infinity && cv > hi) break;
  }
  close();
  return html;
}

// Returns the passage as HTML, or throws if a book can't be loaded (offline and not saved yet).
export async function passageHTML(str){
  const refs = parseRefs(str);
  if (!refs.length) return "";
  let html = "";
  for (const r of refs) {
    const data = await loadBook(r.book[1]);
    if (refs.length > 1) html += `<p class="bref">${esc(r.label)}</p>`;
    html += renderRange(data, r, r.c2 > r.c1);
  }
  return html;
}

// Save every book on this device (the service worker keeps what is fetched). progress(done, total)
export async function saveWholeBible(progress){
  let done = 0;
  for (const b of BOOKS) { await fetch(BASE + b[1] + ".json", { cache: "reload" }).then(r => { if (!r.ok) throw new Error(b[1]); }); progress && progress(++done, BOOKS.length); }
}
