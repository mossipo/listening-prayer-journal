// Akouō Plus: the Greek Study Desk. Opened as greek.html?ref=John 1:1-18
// Same start as the Bible mark-up page: wait for sign-in, check Akouō Plus, then show the page.
// Reader, passage picker and word panel (Phase 1), sentence structure (Phase 2), Learn mode (Phase 4).
import { parseRefs } from "../bible.js";
import { createBackend, isPlus, DEMO } from "../backend.js";
import { loadIndex, loadCodes, loadBook, bsbVerses, hasBook, NT_BOOKS, NT_CODES, pref, setPref } from "./data.js";
import { esc } from "./grammar.js";
import { showWord } from "./panel.js";
import { structureHTML, groupInfo, glossSpan, treeFor } from "./structure.js";
import { Learn, inDays } from "./learn.js";
import { openLearn, wireLearn, resetLearn, refreshLearn } from "./learnui.js";

const $ = s => document.querySelector(s);
const reader = $("#reader"), panel = $("#panel"), stage = $("#stage"), picker = $("#picker");
const withDemo = href => DEMO ? href + (href.includes("?") ? "&" : "?") + "demo" : href;

let B = null, user = null, index = null, codes = null;
let book = null, passage = null, selected = -1, english = null, shown = [];
let learn = null;   // Learn mode: what you know and your deck (greek/learn.js)

function message(title, body){
  reader.innerHTML = `<div class="msg"><h2>${title}</h2><p>${body}</p><p><a href="${withDemo("./")}">Back to Akouō</a></p></div>`;
  closePanel();
}
function sync(text, cls){ const s = $("#sync"); s.hidden = false; s.textContent = text; s.className = "sync" + (cls ? " " + cls : ""); }
function topHeight(){ document.documentElement.style.setProperty("--top-h", $("#top").offsetHeight + "px"); }
window.addEventListener("resize", topHeight);

/* ---------- start: signed in, and Akouō Plus ---------- */
$("#back").href = withDemo("./");
B = await createBackend();
B.onAuth(async u => {
  user = u;
  if (!u) { message("Sign in first", "Open Akouō and sign in, then come back to the Greek Study Desk."); return; }
  if (!(await isPlus(u))) { message("Greek Study Desk", "Reading the New Testament in Greek, with every word explained, is part of Akouō Plus, which isn’t available on this account yet."); return; }
  try { [index, codes] = await Promise.all([loadIndex(), loadCodes()]); }
  catch (e) { message("Not saved on this device", "The Greek Study Desk hasn’t been downloaded yet. Connect to the internet once and open it again."); return; }
  learn = new Learn(B, u.uid, sync);
  await learn.load();
  $("#nav").hidden = false; $("#tools").hidden = false; $("#t-markup").hidden = false;
  applyPrefs(); topHeight();
  const q = new URLSearchParams(location.search);
  await openPassage(q.get("ref") || pref("last", "John 1"), { strong: +q.get("s") || 0, nth: +q.get("n") || 1 });
  sync(navigator.onLine ? "Saved" : "Offline", navigator.onLine ? "" : "off");
});
window.addEventListener("online", () => sync("Saved"));
window.addEventListener("offline", () => sync("Offline", "off"));

/* ---------- reading options ---------- */
function applyPrefs(){
  const gloss = pref("gloss", true), en = pref("english", "under"), view = pref("view", "read"), wdw = pref("wdw", true);
  document.body.classList.toggle("v-read", view !== "structure");
  document.body.classList.toggle("v-structure", view === "structure");
  document.body.classList.toggle("wdw-off", !wdw);
  document.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
  $("#t-wdw").setAttribute("aria-pressed", String(wdw));
  document.body.classList.toggle("gloss-off", !gloss);
  const graded = pref("graded", false);
  document.body.classList.toggle("graded", graded);
  $("#t-graded").setAttribute("aria-pressed", String(graded));
  document.body.classList.toggle("en-off", en === "off");
  document.body.classList.toggle("en-beside", en === "beside");
  $("#t-gloss").setAttribute("aria-pressed", String(gloss));
  document.querySelectorAll("[data-en]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.en === en)));
}
$("#t-gloss").onclick = () => { setPref("gloss", !pref("gloss", true)); applyPrefs(); };
$("#t-wdw").onclick = () => { setPref("wdw", !pref("wdw", true)); applyPrefs(); };
$("#t-graded").onclick = () => { setPref("graded", !pref("graded", false)); reader.querySelectorAll(".w.rv").forEach(x => x.classList.remove("rv")); applyPrefs(); markKnown(); };
document.querySelectorAll("[data-view]").forEach(b => b.onclick = () => setView(b.dataset.view));
// Switch between reading and the sentence structure, keeping the selected word (or the first verse) in view
function setView(view, focusWord){
  if (pref("view", "read") === view && focusWord == null) return;
  const keep = focusWord != null ? focusWord : selected;
  setPref("view", view); applyPrefs();
  if (!passage) return;
  closePanel();
  render(shown, english);
  if (keep >= 0) select(keep);
}
document.querySelectorAll("[data-en]").forEach(b => b.onclick = () => { setPref("english", b.dataset.en); applyPrefs(); });

/* ---------- passages ---------- */
// The first New Testament passage in a reference, with its range kept inside the book.
function toPassage(ref){
  const r = parseRefs(ref).find(x => NT_CODES.includes(x.book[1]));
  return r ? { book: r.book, code: r.book[1], c1: r.c1, v1: r.v1, c2: r.c2, v2: r.v2, label: r.label } : null;
}
const chapterRef = (b, c) => b[2] === 1 ? b[0] : `${b[0]} ${c}`;
function neighbour(dir){
  if (!passage) return null;
  const b = passage.book, i = NT_CODES.indexOf(passage.code);
  if (dir > 0) { if (passage.c2 < b[2]) return chapterRef(b, passage.c2 + 1); const nb = NT_BOOKS[i + 1]; return nb && hasBook(nb[1]) ? chapterRef(nb, 1) : null; }
  if (passage.c1 > 1) return chapterRef(b, passage.c1 - 1);
  const pb = NT_BOOKS[i - 1]; return pb && hasBook(pb[1]) ? chapterRef(pb, pb[2]) : null;
}
$("#prev").onclick = () => { const r = neighbour(-1); if (r) openPassage(r); };
$("#next").onclick = () => { const r = neighbour(1); if (r) openPassage(r); };

// opts: { strong, nth } highlight the nth word in the first verse whose BSB link is this Strong's number;
//       { c, v, lemma } go to this verse and highlight this dictionary word
async function openPassage(ref, opts = {}){
  const any = ref ? parseRefs(ref)[0] : null;
  closePanel();
  $("#warn").innerHTML = "";
  if (any && !NT_CODES.includes(any.book[1])) {
    message(esc(any.book[0]) + " is in the Old Testament", "The Greek Study Desk covers the Greek New Testament. Choose a New Testament passage to read it in Greek.");
    $("#pick").textContent = "Greek"; passage = null; setNav(); return;
  }
  const p = toPassage(ref) || toPassage("John 1");
  if (!hasBook(p.code)) {
    const have = Object.values(index.books).map(b => b.name).join(", ");
    message(esc(p.book[0]) + " is not ready yet", `This book's Greek is not on this device yet. The Greek Study Desk has ${esc(have)}.`);
    $("#pick").textContent = "Greek"; passage = null; setNav(); return;
  }
  reader.innerHTML = `<p class="loading">Opening ${esc(p.label)}…</p>`;
  try { book = await loadBook(p.code); }
  catch (e) { message("Not saved on this device", `${esc(p.book[0])} in Greek hasn’t been downloaded yet. Connect to the internet once and open it again.`); return; }
  english = null;
  try { english = await bsbVerses(p.code); } catch (e) { $("#warn").innerHTML = '<p class="warn">The English (BSB) for this book isn’t saved on this device yet, so only the Greek is shown.</p>'; }
  const verses = book.verses(p);
  if (!verses.length) { message("No such passage", `The Greek text has no verses at ${esc(p.label)}.`); return; }
  passage = p;
  setPref("last", p.label);
  { const u = new URL(location.href); u.searchParams.set("ref", p.label); u.searchParams.delete("s"); u.searchParams.delete("n"); history.replaceState(null, "", u); }
  $("#pick").textContent = p.label; document.title = "Akouō · " + p.label + " in Greek";
  $("#t-markup").href = withDemo("markup.html?ref=" + encodeURIComponent(chapterRef(p.book, p.c1)));
  $("#t-help").href = withDemo("greek-guide.html?ref=" + encodeURIComponent(p.label));
  setNav();
  shown = verses;
  resetLearn();
  if (learn) learn.studied(p.label, NT_CODES.indexOf(p.code), p);
  render(verses, english);
  window.scrollTo(0, 0);
  // arrive on a particular word
  let target = -1, verse = null;
  if (opts.strong) { verse = verses[0]; let n = 0; for (let i = verse.a; i < verse.z; i++) if (book.bsbNum(i) === opts.strong && ++n === opts.nth) { target = i; break; } if (target < 0) for (let i = verse.a; i < verse.z; i++) if (book.strong(i) === opts.strong) { target = i; break; } }
  else if (opts.lemma) { verse = verses.find(x => x.c === opts.c && x.v === opts.v); if (verse) for (let i = verse.a; i < verse.z; i++) if (book.lemma(i) === opts.lemma) { target = i; break; } }
  if (target >= 0) select(target);
  else if (verse) { const el = document.getElementById(`v${verse.c}-${verse.v}`) || wordEl(verse.a); if (el) el.scrollIntoView({ block: "start" }); }
}
function setNav(){ $("#prev").disabled = !neighbour(-1); $("#next").disabled = !neighbour(1); }

function render(verses, english){
  const many = passage.c2 > passage.c1;
  let h = `<h1 class="ptitle">${esc(passage.label)}</h1><p class="psub">SBL GREEK NEW TESTAMENT${english ? " · ENGLISH FROM THE BEREAN STANDARD BIBLE" : ""}</p><p class="kshare" id="kshare"></p>`;
  if (pref("view", "read") === "structure") {
    h += structureHTML(book, codes, verses, passage.book[0], english);
    reader.innerHTML = h + footHTML();
    markKnown();
    return;
  }
  let lastC = 0, nxShown = false;
  for (const v of verses) {
    if (many && v.c !== lastC) h += `<h2 class="chap">CHAPTER ${v.c}</h2>`;
    lastC = v.c;
    let words = "";
    for (let i = v.a; i < v.z; i++) {
      const g = book.gloss(i);
      words += `<button type="button" class="w" data-i="${i}" aria-pressed="false"><span class="g" lang="el">${esc(book.before(i) + book.form(i) + book.after(i))}</span>${glossSpan(g)}</button>`;
    }
    const en = english && english.get(v.c + ":" + v.v);
    if (!nxShown && isNestle(v)) { h += `<p class="nxnote">${esc(book.d.nx.note)}</p>`; nxShown = true; }
    h += `<div class="verse${isNestle(v) ? " nx" : ""}" id="v${v.c}-${v.v}"><div class="vn" aria-label="Verse ${v.v}">${v.v}</div><div class="vbody"><p class="gk">${words}</p>${en ? `<p class="en">${esc(en)}</p>` : ""}${english ? numberingNote(v) : ""}</div></div>`;
  }
  reader.innerHTML = h + footHTML();
  markKnown();
}
// Learn mode: mark the words whose dictionary form you know, and say how much of the passage that is
function markKnown(){
  if (!learn || !book) return;
  reader.querySelectorAll(".w").forEach(x => x.classList.toggle("known", learn.known(book.lemma(+x.dataset.i))));
  const el = $("#kshare");
  if (!el) return;
  const s = learn.share(book, shown);
  el.hidden = !(pref("graded", false) || s.k);
  el.innerHTML = `You know <b>${s.pct}%</b> of the words in this passage <span class="small">(${s.k} of ${s.n})</span>${pref("graded", false) ? ` · <span class="small">Graded reading: tap a word to reveal its gloss, tap again for the details.</span>` : ""}`;
}
// Verses the SBLGNT does not print, added from Nestle 1904 (Romans 16:25-27)
function isNestle(v){ return !!(book.d.nx && book.d.nx.verses.some(([c, n]) => c === v.c && n === v.v)); }
// Where the BSB counts some of this verse's words in a neighbouring verse, or this BSB verse holds words the SBLGNT
// counts in a neighbour (STEPBible marks these; the BSB's own word links decide)
function numberingNote(v){
  const bv = book.d.bv || {}, out = {}, into = {};
  for (let i = v.a; i < v.z; i++) if (bv[i]) { const k = bv[i].join(":"); (out[k] = out[k] || []).push(i); }
  for (const [i, t] of Object.entries(bv)) if (t[0] === v.c && t[1] === v.v) { const w = book.verseOf(+i); const k = w.c + ":" + w.v; (into[k] = into[k] || []).push(+i); }
  const gkp = ids => `<span lang="el" class="gkin">${esc(book.phrase(ids, 6))}</span>`;
  const lines = [
    ...Object.entries(out).map(([k, ids]) => `The BSB counts ${gkp(ids)} in verse ${esc(k.split(":")[1])}${+k.split(":")[0] !== v.c ? ` of chapter ${esc(k.split(":")[0])}` : ""}, so its English is there.`),
    ...Object.entries(into).map(([k, ids]) => `This BSB verse also translates ${gkp(ids)}, which the Greek text counts in verse ${esc(k.split(":")[1])}.`)
  ];
  return lines.map(x => `<p class="vnote">${x}</p>`).join("");
}
function footHTML(){
  return `<div class="foot"><p>${esc(index.analysis)}</p>
    <p>Tap any Greek word for its parsing, its place in the sentence and its lexicon entries. Everything shown comes from the sources below; where the data has nothing, the page says so.</p>
    <details><summary>Sources and credits</summary><ul>${index.credits.map(c => `<li><b>${esc(c.name)}</b>. ${esc(c.attribution)} ${esc(c.license)}.${c.changes ? " " + esc(c.changes) : ""}</li>`).join("")}</ul>
    <p>Data version ${esc(index.v)}.</p></details></div>`;
}

/* ---------- words and the panel ---------- */
const wordEl = i => reader.querySelector(`.w[data-i="${i}"]`);
function clearMarks(){ reader.querySelectorAll(".w.hl,.w.head").forEach(x => x.classList.remove("hl", "head")); }
// Tap a role label or a clause label: light up the group's words and its head word, and explain it in the panel
function selectGroup(k, nodeId, byKeyboard){
  const info = groupInfo(book, codes, k, nodeId);
  if (!info) return;
  if (selected >= 0) { const o = wordEl(selected); if (o) o.setAttribute("aria-pressed", "false"); }
  reader.querySelectorAll(".w.same").forEach(x => x.classList.remove("same"));
  selected = -1; clearMarks();
  for (const i of info.ids) { const el = wordEl(i); if (el) el.classList.add("hl"); }
  if (info.head >= 0 && info.ids.length > 1) { const el = wordEl(info.head); if (el) el.classList.add("head"); }
  panel.innerHTML = info.html; panel.hidden = false; panel.scrollTop = 0; stage.classList.add("open");
  panel.querySelector("[data-close]").onclick = () => closePanel();
  if (byKeyboard) panel.focus();
}
function select(i, byKeyboard){
  clearMarks();
  if (selected >= 0) { const o = wordEl(selected); if (o) o.setAttribute("aria-pressed", "false"); }
  reader.querySelectorAll(".w.same").forEach(x => x.classList.remove("same"));
  selected = i;
  const el = wordEl(i);
  if (el) el.setAttribute("aria-pressed", "true");
  const li = book.d.w.l[i];
  reader.querySelectorAll(".w").forEach(x => { const k = +x.dataset.i; if (k !== i && book.d.w.l[k] === li) x.classList.add("same"); });
  stage.classList.add("open");
  showWord({ el: panel, book, codes, bookName: passage.book[0], onClose: () => closePanel(true), onJump: jump, notes, learnHTML }, i);
  if (el) requestAnimationFrame(() => {
    const r = el.getBoundingClientRect(), top = $("#top").offsetHeight + 8;
    const sheet = getComputedStyle(panel).position === "fixed";
    const bottom = sheet ? panel.getBoundingClientRect().top - 8 : innerHeight - 8;
    if (r.top < top || r.bottom > bottom) window.scrollBy({ top: r.top - top - Math.max(0, (bottom - top - r.height) / 3), behavior: "smooth" });
  });
  if (byKeyboard) panel.focus();
}
function closePanel(refocus){
  const was = selected;
  if (selected >= 0) { const o = wordEl(selected); if (o) o.setAttribute("aria-pressed", "false"); }
  reader.querySelectorAll(".w.same").forEach(x => x.classList.remove("same"));
  selected = -1; panel.hidden = true; panel.innerHTML = ""; stage.classList.remove("open"); clearMarks();
  if (refocus && was >= 0) { const o = wordEl(was); if (o) o.focus(); }
}
reader.addEventListener("click", e => {
  const g = e.target.closest("[data-n]");
  if (g && reader.contains(g)) { const sec = g.closest(".sent"); if (sec) selectGroup(+sec.dataset.k, +g.dataset.n, e.detail === 0); return; }
  const one = e.target.closest("[data-wi]");
  if (one) { select(+one.dataset.wi, e.detail === 0); return; }
  const tw = e.target.closest(".tw");
  if (tw) { select(+tw.dataset.i, e.detail === 0); return; }
  const w = e.target.closest(".w");
  if (!w) return;
  const i = +w.dataset.i;
  // graded reading: the first tap on a word you don't know shows its gloss; the next tap opens the details
  if (document.body.classList.contains("graded") && !w.classList.contains("known") && !w.classList.contains("rv")) {
    reader.querySelectorAll(`.w[data-i="${i}"]`).forEach(x => x.classList.add("rv")); return;
  }
  if (i === selected) closePanel(); else select(i, e.detail === 0);
});
panel.addEventListener("click", async e => {
  const b = e.target.closest("[data-structure]"); if (b) { const i = +b.dataset.structure; setView("structure", i); return; }
  const l = e.target.closest("[data-learn]"); if (!l || selected < 0) return;
  const i = selected, lemma = book.lemma(i);
  if (l.dataset.learn === "known") await learn.setKnown(lemma, !learn.marked(lemma));
  else if (l.dataset.learn === "deck") {
    if (learn.inDeck(lemma)) await learn.remove(lemma);
    else { const v = book.verseOf(i), short = panel.querySelector("#p-short"); await learn.add(lemma, { k: book.strong(i), g: (short && short.textContent !== "…" && !/^No short/.test(short.textContent) ? short.textContent.split(":")[0].trim() : book.gloss(i)) || "", b: book.code, c: v.c, v: v.v }); }
  }
  else if (l.dataset.learn === "paradigm") { showLearn("paradigms"); return; }
  const box = panel.querySelector("#p-learn"); if (box) box.innerHTML = learnHTML(i);
  markKnown();
});
// the Learn row in the word panel
function learnHTML(i){
  if (!learn) return "";
  const lemma = book.lemma(i), c = learn.card(lemma);
  return `<button type="button" class="lbtn${learn.known(lemma) ? " on" : ""}" data-learn="known" aria-pressed="${learn.marked(lemma)}">${learn.marked(lemma) ? "✓ Known" : learn.mastered(lemma) ? "✓ Known from reviews" : "Mark as known"}</button>
    <button type="button" class="lbtn${c ? " on" : ""}" data-learn="deck" aria-pressed="${!!c}">${c ? "✓ In my deck · " + inDays(learn.nextDue(lemma)) : "Add to my deck"}</button>
    <button type="button" class="lbtn" data-learn="paradigm">All its forms</button>`;
}
// Structure view: fill a sentence's tree the first time it is opened, and mark the selection in it
reader.addEventListener("toggle", e => {
  const d = e.target;
  if (!d.classList || !d.classList.contains("treebox") || !d.open || d.dataset.built) return;
  d.insertAdjacentHTML("beforeend", treeFor(book, codes, +d.dataset.k));
  d.dataset.built = "1";
  markKnown();
  if (selected >= 0) d.querySelectorAll(`.w[data-i="${selected}"]`).forEach(x => x.setAttribute("aria-pressed", "true"));
}, true);
/* ---------- the Learn sheet ---------- */
const learnDlg = $("#learn");
wireLearn(learnDlg, $("#ltabs"), $("#lbody"));
$("#lclose").onclick = () => learnDlg.close();
learnDlg.addEventListener("click", e => { if (e.target === learnDlg) learnDlg.close(); });
learnDlg.addEventListener("close", () => { markKnown(); if (selected >= 0) { const box = panel.querySelector("#p-learn"); if (box) box.innerHTML = learnHTML(selected); } });
function showLearn(which){
  if (!passage || !learn) return;
  openLearn({ dlg: learnDlg, body: $("#lbody"), tabs: $("#ltabs"), learn, codes, book, passage, verses: shown,
    selected: () => selected, select: i => select(i), open: label => openPassage(label), status: () => markKnown() }, which);
}
$("#t-learn").onclick = () => showLearn();
document.addEventListener("keydown", e => { if (e.key === "Escape" && !picker.open && !learnDlg.open && selected >= 0) closePanel(true); });
function jump(code, c, v, lemma){
  const b = NT_BOOKS[NT_CODES.indexOf(code)];
  if (passage && code === passage.code && passage.c1 === c && passage.c2 === c && v >= passage.v1 && v <= passage.v2) {
    const k = book.findVerse(c, v);
    if (k >= 0) { const ve = book.verseAt(k); for (let i = ve.a; i < ve.z; i++) if (book.lemma(i) === lemma) { select(i); return; } }
  }
  openPassage(chapterRef(b, c), { c, v, lemma });
}

/* ---------- my notes on a word (users/{uid}/greek/wnotes-G3: { w: { lemma: { t, at } } }) ---------- */
// Only the note that changed is written (a merge), so a note that failed to load can never be wiped by a later save.
const noteDocs = new Map();
const noteKey = strong => "wnotes-G" + Math.floor((strong || 0) / 1000);
const notes = {
  async load(lemma, strong){
    const key = noteKey(strong);
    if (!noteDocs.has(key)) noteDocs.set(key, B.getGreek(user.uid, key).then(d => (d && d.w) || {}).catch(() => { noteDocs.delete(key); return null; }));
    const w = await noteDocs.get(key);
    return w ? { ok: true, text: (w[lemma] && w[lemma].t) || "" } : { ok: false, text: "" };
  },
  async save(lemma, strong, text, status){
    const key = noteKey(strong), w = await noteDocs.get(key);
    if (!w) return;
    const val = text.trim() ? { t: text, at: Date.now() } : null;
    if (val) w[lemma] = val; else delete w[lemma];
    sync("Saving…", "busy");
    try {
      await B.saveGreek(user.uid, key, { w: { [lemma]: val } });
      const s = navigator.onLine ? "Saved" : "Saved on this device";
      sync(s, navigator.onLine ? "" : "off"); status(s + ".");
    } catch (e) { sync("Not saved", "off"); status("Not saved yet. It will be tried again when you type or reconnect."); }
  }
};

/* ---------- passage picker: type a reference, or choose book, chapter and verses ---------- */
$("#pick").onclick = () => { showBooks(); picker.showModal(); };
$("#pclose").onclick = () => picker.close();
picker.addEventListener("click", e => { if (e.target === picker) picker.close(); });
const typed = () => `<h4>TYPE A PASSAGE</h4><form class="typed" id="ptyped"><input type="text" id="pref" aria-label="Passage, for example John 3:16-21" placeholder="John 3:16-21" autocomplete="off" autocapitalize="words"><button type="submit" class="go">Open</button></form><p class="perr" id="perr" role="alert"></p>`;
function showBooks(){
  $("#ptitle").textContent = "Choose a passage";
  const btn = b => { const ok = hasBook(b[1]); return `<button type="button" data-book="${b[1]}" class="${passage && b[1] === passage.code ? "cur" : ""}"${ok ? "" : " disabled"}>${esc(b[0])}${ok ? "" : "<small>coming later</small>"}</button>`; };
  $("#pbody").innerHTML = typed() + `<h4>NEW TESTAMENT</h4><div class="grid">${NT_BOOKS.map(btn).join("")}</div>`;
}
function showChapters(code, chosen){
  const b = NT_BOOKS[NT_CODES.indexOf(code)];
  $("#ptitle").textContent = b[0];
  const cur = chosen || (passage && passage.code === code ? passage.c1 : 0);
  let h = `<button type="button" class="back2" data-books>‹ All books</button><h4>CHAPTER</h4><div class="grid ch">`;
  for (let c = 1; c <= b[2]; c++) h += `<button type="button" data-ch="${c}" data-code="${code}" class="${c === cur ? "cur" : ""}">${c}</button>`;
  h += `</div><p class="phelp">Tap a chapter to open all of it. For only some verses, use the verse boxes for the chapter you are in, or type the passage.</p>`;
  $("#pbody").innerHTML = h + `<div id="prange"></div>` + typed();
  if (cur) showRange(code, cur);
}
async function showRange(code, c){
  const b = NT_BOOKS[NT_CODES.indexOf(code)], box = $("#prange");
  let last = 0;
  try { last = (await loadBook(code)).lastVerse(c); } catch (e) {}
  if (!box || !last) return;
  const from = passage && passage.code === code && passage.c1 === c && passage.c2 === c ? passage.v1 : 1;
  const to = passage && passage.code === code && passage.c1 === c && passage.c2 === c && passage.v2 !== Infinity ? Math.min(passage.v2, last) : last;
  const opts = sel => Array.from({ length: last }, (_, k) => `<option${k + 1 === sel ? " selected" : ""}>${k + 1}</option>`).join("");
  box.innerHTML = `<h4>VERSES IN ${esc(b[0].toUpperCase())} ${c}</h4><div class="range"><label>From <select id="pfrom">${opts(from)}</select></label><label>to <select id="pto">${opts(to)}</select></label><button type="button" class="go" id="pgo">Open these verses</button></div>`;
  $("#pgo").onclick = () => { const a = +$("#pfrom").value, z = Math.max(a, +$("#pto").value); picker.close(); openPassage(a === 1 && z === last ? chapterRef(b, c) : `${b[0]} ${c}:${a}${z > a ? "-" + z : ""}`); };
}
$("#pbody").addEventListener("click", e => {
  const t = e.target.closest("button"); if (!t) return;
  if (t.dataset.book) showChapters(t.dataset.book);
  else if (t.dataset.books != null) showBooks();
  else if (t.dataset.ch) { const b = NT_BOOKS[NT_CODES.indexOf(t.dataset.code)]; picker.close(); openPassage(chapterRef(b, +t.dataset.ch)); }
});
$("#pbody").addEventListener("submit", e => {
  e.preventDefault();
  const p = toPassage($("#pref").value);
  if (!p) { $("#perr").textContent = "That doesn’t look like a New Testament passage. Try something like John 3:16-21."; return; }
  if (!hasBook(p.code)) { $("#perr").textContent = `${p.book[0]} isn’t ready yet.`; return; }
  picker.close(); openPassage(p.label);
});
