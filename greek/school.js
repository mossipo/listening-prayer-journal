// Akouō Plus: the Greek School. Opened as greek-school.html; #lesson=0.1&step=learn opens a lesson, #sounds the sound chart.
// Takes a learner from the alphabet to reading the New Testament, lesson by lesson, in the order of Machen's
// New Testament Greek for Beginners (1923). Same start as the Study Desk: wait for sign-in, check Akouō Plus.
// Progress is kept in users/{uid}/greek/school: { done: { lessonId: [when, score out of 100, "pass" | "skip"] }, last }.
// Words a lesson teaches go into the Study Desk's own review deck (greek/learn.js), so nothing is learned twice.
import { createBackend, isPlus, DEMO } from "../backend.js";
import { loadIndex, loadBook, loadCodes, loadForms, loadOcc, bsbVerses, NT_BOOKS } from "./data.js";
import { lexEntry } from "../bible.js";
import { esc } from "./grammar.js";
import { Learn } from "./learn.js";
import { translit, parts } from "./translit.js";
import { LEVELS, ALL, lessonById, before, after, PASS } from "./school/course.js";
import { LETTERS, PAIRS, MARKS, ACCENTS, PUNCT, LOOKS_LIKE, letter } from "./school/sounds.js";
import { makeDrills } from "./school/drills.js";

const $ = s => document.querySelector(s);
const main = $("#school");
const withDemo = href => DEMO ? href + (href.includes("?") ? "&" : "?") + "demo" : href;
const gk = s => `<span lang="el">${esc(s)}</span>`;
const STEPS = [["learn", "Learn"], ["see", "See it in Scripture"], ["practise", "Practise"], ["check", "Checkpoint"]];

let B = null, user = null, learn = null, john = null;
let prog = { done: {}, last: "" };
let run = null;   // the practice or checkpoint in progress: { lesson, step, items, k, right, answered }
let drills = null;   // grammar exercises for Levels 1 and up (school/drills.js), made once the parsing data is loaded
let CODES = null, FDATA = null;
async function ensureDrills(){
  if (drills) return drills;
  [CODES, FDATA] = await Promise.all([loadCodes(), loadForms()]);
  drills = makeDrills({ john, codes: CODES, FD: FDATA, ALL, choice });
  Object.assign(GEN, drills.GEN);
  return drills;
}

/* ---------- reading lessons (Level 5): one passage of any book ---------- */
const readers = new Map();   // book code -> exercises built on that book
const bookName = code => (NT_BOOKS.find(b => b[1] === code) || [code])[0];
const passageOf = l => ({ c1: l.read.c, v1: l.read.v1, c2: l.read.c2 || l.read.c, v2: l.read.v2 });
const passageRef = l => `${bookName(l.read.b)} ${l.read.c}:${l.read.v1}${l.read.c2 && l.read.c2 !== l.read.c ? `-${l.read.c2}:${l.read.v2}` : l.read.v2 > l.read.v1 ? "-" + l.read.v2 : ""}`;
const named = lem => lem[0] !== lem[0].toLowerCase();
async function readerFor(l){
  await ensureDrills();
  const code = l.read.b;
  if (!readers.has(code)) {
    const book = code === "JHN" ? john : await loadBook(code);
    readers.set(code, makeDrills({ john: book, codes: CODES, FD: FDATA, ALL, choice, name: bookName(code) }));
  }
  const r = readers.get(code), vs = r.book.verses(passageOf(l));
  l._range = [vs[0].a, vs[vs.length - 1].z];
  r.setRange(...l._range);
  if (!l.words) l.words = await newWords(l, r.book, vs);
  return r;
}
// the School's words before this lesson
const wordsBefore = l => new Set(ALL.slice(0, ALL.findIndex(x => x.id === l.id)).flatMap(x => (x.words || []).map(w => w[0])));
// a passage's words the course has not taught yet, most common in the New Testament first, with STEPBible's short gloss;
// a passage with few new words is topped up with common words met before, for review
async function newWords(l, book, vs){
  const before = wordsBefore(l), occ = await loadOcc().catch(() => ({})), fresh = new Map(), old = new Map();
  for (const v of vs) for (let i = v.a; i < v.z; i++) {
    const lem = book.lemma(i);
    if (named(lem)) continue;
    (before.has(lem) ? old : fresh).has(lem) || (before.has(lem) ? old : fresh).set(lem, i);
  }
  const rank = m => [...m].map(([lem, i]) => ({ lem, i, n: (occ[lem] || [0])[0] })).sort((a, b) => b.n - a.n);
  const pickd = rank(fresh).filter(x => x.n >= 10).slice(0, 10);
  const out = [];
  for (const x of pickd) {
    const k = book.strong(x.i); let g = "";
    try { const e = await lexEntry("G" + k); g = (e && e.g) || ""; } catch (e) {}
    out.push([x.lem, k, (g || book.gloss(x.i)).replace(/: .*$/, "")]);   // "to test/tempt: tempt" reads as "to test/tempt"
  }
  if (out.length < 6) {
    const known = new Map(ALL.flatMap(x => x.words || []).map(w => [w[0], w]));
    // review the rarest words already learned, the ones most easily forgotten
    for (const x of rank(old).reverse()) { if (out.length >= 6) break; const w = known.get(x.lem); if (w) out.push([w[0], w[1], w[2], null, "review"]); }
  }
  return out;
}

function sync(text, cls){ const s = $("#sync"); s.hidden = false; s.textContent = text; s.className = "sync" + (cls ? " " + cls : ""); }
// say something to VoiceOver without moving focus
function say(text){ const el = $("#ssay"); el.textContent = ""; setTimeout(() => { el.textContent = text; }, 60); }
function message(title, body){ main.innerHTML = `<div class="msg"><h1>${title}</h1><p>${body}</p><p><a href="${withDemo("akouo-greek.html")}">Back to Akouō Greek</a></p></div>`; }

/* ---------- start: signed in, and Akouō Plus ---------- */
$("#back").href = withDemo("akouo-greek.html");
$("#desk").href = withDemo("greek.html");
B = await createBackend();
B.onAuth(async u => {
  user = u;
  if (!u) { message("Sign in first", "Open Akouō Greek and sign in, then come back to the Greek School."); return; }
  if (!(await isPlus(u))) { message("Greek School", "Learning to read the New Testament in Greek, from the alphabet up, is part of Akouō Plus, which isn’t available on this account yet."); return; }
  try { await loadIndex(); john = await loadBook("JHN"); }
  catch (e) { message("Not saved on this device", "The Greek School hasn’t been downloaded yet. Connect to the internet once and open it again."); return; }
  learn = new Learn(B, u.uid, sync);
  await learn.load();
  try { const d = await B.getGreek(u.uid, "school"); if (d) prog = { done: d.done || {}, last: d.last || "" }; } catch (e) {}
  $("#desk").hidden = false;
  route();
  sync(navigator.onLine ? "Saved" : "Offline", navigator.onLine ? "" : "off");
});
window.addEventListener("online", () => sync("Saved"));
window.addEventListener("offline", () => sync("Offline", "off"));
window.addEventListener("hashchange", () => { if (john) route(); });

async function save(patch){
  sync("Saving…", "busy");
  try { await B.saveGreek(user.uid, "school", patch); sync(navigator.onLine ? "Saved" : "Saved on this device", navigator.onLine ? "" : "off"); }
  catch (e) { sync("Not saved", "off"); }
}

/* ---------- where am I ---------- */
const isDone = id => !!prog.done[id];
// A lesson is open when it is the first, or the one before it is done
const isOpen = id => { const b = before(id); return !b || isDone(b.id); };
// Where to carry on: the first open lesson not yet done
const nextUp = () => ALL.find(x => isOpen(x.id) && !isDone(x.id)) || null;
const place = l => { const lv = LEVELS[l.level]; return `Level ${l.level} · Lesson ${lv.lessons.indexOf(lv.lessons.find(x => x.id === l.id)) + 1} of ${lv.lessons.length}`; };

function route(){
  run = null;
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.has("sounds")) return showSounds();
  const l = h.get("lesson") && lessonById(h.get("lesson"));
  if (l) return showLesson(l, STEPS.some(s => s[0] === h.get("step")) ? h.get("step") : "learn");
  showMap();
}
const go = hash => { if (location.hash === hash) route(); else location.hash = hash; };
const top = () => { window.scrollTo(0, 0); const h = main.querySelector("h1"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); } };

/* ---------- the map of the course ---------- */
function showMap(){
  document.title = "Akouō Greek · School";
  const total = ALL.length, done = ALL.filter(x => isDone(x.id)).length, nx = nextUp();
  let h = `<header class="hero"><p class="eyebrow">AKOUŌ PLUS</p><h1>Greek School</h1>
    <p class="lead">From the alphabet to reading the New Testament in Greek, one short lesson at a time. The lessons follow J. Gresham Machen's <i>New Testament Greek for Beginners</i>, and every example comes from the Greek New Testament itself.</p>
    <div class="hero-row">${nx ? `<a class="btn primary" href="#lesson=${nx.id}">${done ? "Continue" : "Start"}: ${esc(nx.title)}</a>` : `<span class="done-all">You have finished every lesson written so far.</span>`}
    <a class="btn" href="#sounds">Sound chart</a>${learn.due().length ? `<a class="btn" href="${withDemo("greek.html?learn=review")}">Review ${learn.due().length} on the Desk</a>` : ""}</div>
    <p class="small">${done} of ${total} lessons done${done ? ` · ${learn.knownCount()} words known` : ""} · Pronunciation: Erasmian, the classroom standard (<a href="#sounds">why</a>)</p></header>`;
  for (const lv of LEVELS) {
    const ready = lv.lessons.length > 0, lvDone = ready && lv.lessons.every(x => isDone(x.id));
    h += `<section class="level${ready ? "" : " soon"}" aria-labelledby="lv-${lv.n}">
      <div class="lv-head"><span class="lv-n" aria-hidden="true">${lv.n}</span><div><h2 id="lv-${lv.n}">Level ${lv.n}: ${esc(lv.title)}${lvDone ? ` <span class="tick">Done</span>` : ""}</h2>
      <p class="small">${esc(lv.teaches)}. <b>Goal:</b> ${esc(lv.goal)}. <span class="machen">${lv.machen.startsWith("Beyond") ? esc(lv.machen) : "Machen " + esc(lv.machen)}</span></p></div></div>`;
    if (ready) {
      h += `<ol class="lessons">`;
      for (const l of lv.lessons) {
        const d = prog.done[l.id], open = isOpen(l.id);
        const state = d ? (d[2] === "skip" ? `Skipped ahead, ${d[1]}%` : `Done, ${d[1]}%`) : open ? `About ${l.minutes} minutes` : "Locked";
        h += `<li class="${d ? "is-done" : open ? "is-open" : "is-locked"}"><a href="#lesson=${l.id}"><span class="lno">${l.id}</span><span class="lti">${esc(l.title)}<small>${state}</small></span></a></li>`;
      }
      h += `</ol>`;
    } else h += `<p class="soon-note">Being written. It opens here when it is ready.</p>`;
    h += `</section>`;
  }
  h += sourcesHTML();
  main.innerHTML = h;
}

function sourcesHTML(){
  return `<footer class="foot"><p><b>Sources.</b> Lesson order and teaching after J. Gresham Machen, <i>New Testament Greek for Beginners</i> (Macmillan, 1923; public domain), retold in Akouō's own words; Levels 5 and 6 go beyond his book. Greek text: SBL Greek New Testament (CC BY 4.0). English in the reading lessons: Berean Standard Bible (public domain). Word data: MACULA Greek (CC BY 4.0), STEPBible (CC BY 4.0). English letters follow STEPBible's conventions.</p></footer>`;
}

/* ---------- the sound chart ---------- */
function lettersTable(list, title){
  return `<div class="twrap"><table class="chart"><caption>${esc(title || "Letters")}</caption><thead><tr><th scope="col">Letter</th><th scope="col">Name</th><th scope="col">English letters</th><th scope="col">Say it</th></tr></thead><tbody>${
    list.map(g => { const l = letter(g); return `<tr><td class="big">${gk(l[0] + (l[0] === "σ" ? " ς" : ""))}</td><td>${esc(l[2])}</td><td class="lat">${esc(l[3])}</td><td>${esc(l[4])}</td></tr>`; }).join("")}</tbody></table></div>`;
}
const pairsTable = () => `<div class="twrap"><table class="chart"><caption>Vowel pairs</caption><thead><tr><th scope="col">Pair</th><th scope="col">English letters</th><th scope="col">Say it</th><th scope="col">Example</th></tr></thead><tbody>${
  PAIRS.map(p => `<tr><td class="big">${gk(p[0])}</td><td class="lat">${p[1]}</td><td>${esc(p[2])}</td><td>${gk(p[3])} <span class="lat">(${stressHTML(p[3])})</span></td></tr>`).join("")}</tbody></table></div>`;
const marksTable = (rows, title) => `<div class="twrap"><table class="chart"><caption>${title}</caption><thead><tr><th scope="col">Mark</th><th scope="col">Name</th><th scope="col">What it does</th></tr></thead><tbody>${
  rows.map(m => `<tr><td class="big">${gk(m[0])}</td><td>${esc(m[1])}</td><td>${esc(m[2])}</td></tr>`).join("")}</tbody></table></div>`;
const capsTable = () => `<div class="twrap"><table class="chart caps"><caption>Capitals and small letters</caption><tbody>${
  [0, 6, 12, 18].map(s => `<tr>${LETTERS.slice(s, s + 6).map(l => `<td>${gk(l[1])} ${gk(l[0])}<small>${esc(l[2])}</small></td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

function showSounds(){
  document.title = "Akouō Greek · Sounds";
  main.innerHTML = `<p class="crumb"><a href="#">‹ Greek School</a></p><h1>The sounds of Greek</h1>
    <p class="lead">The School teaches the Erasmian pronunciation: one sound for every letter and letter pair, so what you hear tells you how a word is spelled.</p>
    ${lettersTable(LETTERS.map(l => l[0]), "The alphabet")}${pairsTable()}${marksTable(MARKS, "Breathing marks and the iota underneath")}
    <p class="small">Before γ, κ, ξ or χ, gamma is said ng: ${gk("ἄγγελος")} is ${stressHTML("ἄγγελος")}.</p>
    ${marksTable(ACCENTS, "Accents")}<p class="small">Say the syllable with the accent a little louder. In English letters the app shows that vowel in bold.</p>${marksTable(PUNCT, "Punctuation")}
    <h2>Why Erasmian</h2>
    <p>No Greek speaker ever talked exactly this way: it is a teaching pronunciation named after Erasmus. It is used here because it is the easiest for a beginner, it matches Machen, Kairos and most teachers and recordings, and pronunciation never changes the grammar or meaning of a verse. Reconstructed Koine, the sound of Greek in the apostles' day (see Benjamin Kantor, <i>The Pronunciation of New Testament Greek</i>, Eerdmans 2023), will be offered as an optional level near the end of the course.</p>
    <p class="small">The iPad's built-in Greek voice speaks modern Greek, so the School does not use it. Recordings in the Erasmian sound are planned.</p>
    ${sourcesHTML()}`;
  top();
}

/* ---------- a lesson ---------- */
function stepNav(l, step){
  return `<nav class="steps" aria-label="Lesson steps"><ol>${STEPS.map(([k, name], n) => `<li><a href="#lesson=${l.id}&step=${k}"${k === step ? ' aria-current="step"' : ""}><span class="sn">${n + 1}</span>${name}</a></li>`).join("")}</ol></nav>`;
}
async function showLesson(l, step){
  document.title = `Akouō Greek · ${l.title}`;
  const head = `<p class="crumb"><a href="#">‹ Greek School</a></p>
    <p class="eyebrow">${place(l)}${l.machen ? ` · Machen ${esc(l.machen)}` : ""} · about ${l.minutes} minutes</p><h1>${esc(l.title)}</h1>`;
  if (!isOpen(l.id)) {
    const b = before(l.id), canSkip = isOpen(b.id);
    main.innerHTML = `${head}<div class="locked"><p><b>This lesson opens when you finish “${esc(b.title)}”.</b></p>
      ${canSkip ? `<p>If you already know what it teaches, take its checkpoint now. Pass with 80% or more and you skip ahead.</p>` : ""}
      <div class="row">${canSkip ? `<button type="button" class="btn primary" id="skip">Take the checkpoint</button>` : ""}<a class="btn" href="#lesson=${isOpen(b.id) ? b.id : nextUp().id}">Go to ${esc(isOpen(b.id) ? b.title : nextUp().title)}</a></div></div>`;
    if (canSkip) $("#skip").onclick = async () => { if (l.level > 0) await ensureDrills(); if (l.read) await readerFor(l); startRun(l, "check", true); };
    top(); return;
  }
  prog.last !== l.id && (prog.last = l.id, save({ last: l.id }));
  main.innerHTML = head + stepNav(l, step) + `<div id="step"><p class="loading">Opening…</p></div>`;
  if (l.level > 0) {
    try { await ensureDrills(); if (l.read) await readerFor(l); }
    catch (e) { $("#step").innerHTML = `<p>This lesson needs the grammar data, which isn’t saved on this device yet. Connect to the internet once and open it again.</p>`; return; }
  }
  ({ learn: stepLearn, see: stepSee, practise: s => startRun(s, "practise"), check: s => startRun(s, "check") })[step](l);
  if (step === "learn" || step === "see") top();
}
function nextStepLink(l, step){
  const k = STEPS.findIndex(s => s[0] === step), n = STEPS[k + 1];
  return n ? `<div class="row end"><a class="btn primary" href="#lesson=${l.id}&step=${n[0]}">Next: ${n[1]} ›</a></div>` : "";
}

// how much of a reading passage the learner can already read
function shareHTML(l){
  const r = readers.get(l.read.b), bk = r.book, before = wordsBefore(l), mine = new Set(learn.knownList());
  let n = 0, a = 0, b = 0;
  for (let i = l._range[0]; i < l._range[1]; i++) { n++; const lem = bk.lemma(i); if (before.has(lem) || named(lem)) a++; if (before.has(lem) || named(lem) || mine.has(lem)) b++; }
  const pa = Math.round(100 * a / n), pb = Math.round(100 * b / n);
  return `<p class="share"><b>${pa}%</b> of the ${n} words in ${esc(passageRef(l))} are words the School has taught you (names included).${pb > pa ? ` Counting the words you have marked as known on the Desk: <b>${pb}%</b>.` : ""}</p>`;
}
function stepLearn(l){
  let h = "";
  for (const b of l.teach) {
    if (b.h) h += `<h2>${esc(b.h)}</h2>${b.p}`;
    else if (b.chart === "letters") h += lettersTable(b.list, b.title || "This lesson's letters");
    else if (b.chart === "pairs") h += pairsTable();
    else if (b.chart === "marks") h += marksTable(MARKS, "Breathing marks and the iota underneath");
    else if (b.chart === "accents") h += marksTable(ACCENTS, "Accents");
    else if (b.chart === "punct") h += marksTable(PUNCT, "Punctuation");
    else if (b.chart === "caps") h += capsTable();
    else if (b.write) h += `<h2>Write them</h2><p>Write each letter five times on paper, saying its name each time. Your hand remembers what your eyes forget.</p><ul class="write">${b.write.map(g => `<li>${gk(g)}<span>${esc(letter(g)[5])}</span></li>`).join("")}</ul>`;
    else if (b.table) h += b.table.hidden ? "" : drills.tableHTML(b.table);
    else if (b.grid) h += drills.gridHTML(b.grid);
    else if (b.share) h += shareHTML(l);
    else if (b.words) h += `<h2>Words to learn</h2><div class="twrap"><table class="chart"><caption>${l.read ? `New words in ${esc(passageRef(l))}, most common first (meanings from STEPBible's short lexicon)` : l.level ? "This lesson's words, most of them common in the New Testament" : "The 18 most common words"}</caption><thead><tr><th scope="col">Word</th><th scope="col">Say it</th><th scope="col">Meaning</th></tr></thead><tbody>${
      l.words.map(([w, , g]) => `<tr><td class="big">${gk(w)}</td><td class="lat">${stressHTML(w)}</td><td>${esc(g)}</td></tr>`).join("")}</tbody></table></div>`;
  }
  if (l.level > 0 && l.words) h += `<p class="small">Passing the checkpoint adds these words to your review deck.</p>`;
  $("#step").innerHTML = `<div class="teach">${h}</div>` + nextStepLink(l, "learn");
}

// English letters with the stressed vowel in bold (from the accent), escaped
function stressHTML(word){ return parts(word).map(p => p.stress ? `<b>${esc(p.t)}</b>` : esc(p.t)).join(""); }

/* ---------- See it in Scripture: real verses, this lesson's feature highlighted ---------- */
const NFD = s => s.normalize("NFD");
const base = s => [...NFD(s).toLowerCase()].filter(c => !/[̀-ͯͅ]/.test(c)).map(c => c === "ς" ? "σ" : c).filter(c => /[α-ω]/.test(c));
const has = {
  rough: f => NFD(f).includes("̔"),
  subscript: f => NFD(f).includes("ͅ"),
  caps: f => /[Α-Ω]/.test(NFD(f)),
  nasal: f => /γ[γκξχ]/.test(base(f).join("")),
  accent: f => /[́̀͂]/.test(NFD(f)),
  question: (book, i) => book.after(i).includes(";")
};
const accentOf = f => { const m = NFD(f); return m.includes("͂") ? "circumflex" : m.includes("̀") ? "grave" : m.includes("́") ? "acute" : ""; };
const sightSet = l => new Set((l.words || []).map(w => w[0]));

// letters learned up to and including this lesson, and what words may contain
function cumulative(l){
  const upto = ALL.slice(0, ALL.findIndex(x => x.id === l.id) + 1);
  const letters = new Set(upto.flatMap(x => x.letters || []));
  if (letters.has("σ")) letters.add("ς");
  return { letters, allow: new Set(l.allow || (upto.some(x => x.level > 0) ? ["rough", "nasal", "subscript", "caps"] : [])) };
}
// does word i of the book show this lesson's feature?
function marked(l, book, i){
  const f = book.form(i), m = l.see.mark;
  if (m === "letters") return base(f).some(c => l.letters.includes(c));
  if (m === "breath") return has.rough(f);
  if (m === "caps") return has.caps(f);
  if (m === "accent") return has.accent(f);
  if (m === "sight") return sightSet(l).has(book.lemma(i));
  if (m === "focus" || m === "prep") return drills.markedG(l, i);
  return false;
}
// the Greek of word i with this lesson's letters (or accented vowels) picked out
function wordHTML(l, book, i){
  const f = book.form(i), m = l.see.mark;
  if (m === "letters" || m === "accent") {
    return [...f.normalize("NFC")].map(ch => {
      const b = base(ch)[0], on = m === "letters" ? b && l.letters.includes(b) : /[́̀͂]/.test(NFD(ch));
      return on ? `<mark>${esc(ch)}</mark>` : esc(ch);
    }).join("");
  }
  return esc(f);
}
const verseRef = (c, v1, v2) => `John ${c}:${v1}${v2 > v1 ? "-" + v2 : ""}`;

async function stepSee(l){
  const r = l.read ? readers.get(l.read.b) : drills, bk = l.read ? r.book : john;
  const s = l.read ? { ...l.see, c: l.read.c, v1: l.read.v1, v2: l.read.v2 } : l.level > 0 ? { ...l.see, ...drills.seeRange(l) } : l.see;
  const verses = bk.verses(l.read ? passageOf(l) : { c1: s.c, v1: s.v1, c2: s.c, v2: s.v2 });
  const ref = l.read ? passageRef(l) : verseRef(s.c, s.v1, s.v2);
  const fresh = new Set((l.words || []).filter(w => !w[4]).map(w => w[0]));
  let english = null;
  if (l.read) { try { english = await bsbVerses(l.read.b); } catch (e) {} }
  let h = `<p>${esc(s.say)}</p>${english ? `<p><button type="button" class="btn" id="t-en" aria-pressed="false">Show the English (BSB)</button></p>` : ""}<div class="verses" lang="el">`;
  for (const v of verses) {
    h += `<p class="sv"><sup>${v.v}</sup> `;
    for (let i = v.a; i < v.z; i++) {
      const on = l.read ? fresh.has(bk.lemma(i)) : marked(l, john, i);
      h += `<button type="button" class="sw${on ? " on" : ""}" data-i="${i}" aria-label="${esc(bk.form(i))}, ${esc(translit(bk.form(i)))}">${esc(bk.before(i))}${l.read ? esc(bk.form(i)) : wordHTML(l, john, i)}${esc(bk.after(i))}</button> `;
    }
    h += `</p>${english && english.get(v.c + ":" + v.v) ? `<p class="bsb" lang="en" hidden>${esc(english.get(v.c + ":" + v.v))}</p>` : ""}`;
  }
  h += `</div><p class="seeinfo" id="seeinfo" role="status" aria-live="polite">Tap a word.</p>
    <p class="small">${esc(ref)}, SBL Greek New Testament${english ? "; English from the Berean Standard Bible" : ""}. <a href="${withDemo("greek.html?ref=" + encodeURIComponent(ref) + (l.read ? "&graded=1" : ""))}">Open it on the Study Desk</a>${l.read ? " with Graded reading on" : " to see every word's grammar"}.</p>`;
  $("#step").innerHTML = h + nextStepLink(l, "see");
  const ten = $("#t-en");
  if (ten) ten.onclick = () => { const on = ten.getAttribute("aria-pressed") !== "true"; ten.setAttribute("aria-pressed", String(on)); ten.textContent = on ? "Hide the English" : "Show the English (BSB)"; $("#step").querySelectorAll(".bsb").forEach(p => p.hidden = !on); };
  $("#step").querySelectorAll(".sw").forEach(b => b.onclick = () => {
    $("#step").querySelectorAll(".sw[aria-pressed]").forEach(x => x.removeAttribute("aria-pressed"));
    b.setAttribute("aria-pressed", "true");
    const i = +b.dataset.i, f = bk.form(i), g = bk.gloss(i);
    $("#seeinfo").innerHTML = `${gk(f)} <span class="lat">${stressHTML(f)}</span>${g && g !== "-" ? ` · “${esc(g)}”` : ""}${l.see.mark === "letters" ? ` · ${base(f).map(c => letter(c)[2]).join(", ")}` : ""}${l.level > 0 ? `<br><span class="small">${r.infoG(i)}</span>` : ""}`;
  });
}

/* ---------- exercises, built from real words in John ---------- */
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const shuffle = a => { const b = a.slice(); for (let k = b.length - 1; k > 0; k--) { const j = rnd(k + 1); [b[k], b[j]] = [b[j], b[k]]; } return b; };
const uniq = a => [...new Set(a)];
let poolCache = new Map();
// words in John a learner can read after this lesson, most common first: [{ f, n, i }] (i: one place it occurs)
function pool(l){
  if (poolCache.has(l.id)) return poolCache.get(l.id);
  const { letters, allow } = cumulative(l), seen = new Map();
  for (let i = 0; i < john.n; i++) {
    const f = john.form(i).normalize("NFC");
    if (seen.has(f)) { seen.get(f).n++; continue; }
    const b = base(f);
    if (b.length < 2 || /[^\p{L}\p{M}]/u.test(f) || !b.every(c => letters.has(c))) continue;
    if ((has.rough(f) && !allow.has("rough")) || (has.subscript(f) && !allow.has("subscript")) || (has.caps(f) && !allow.has("caps")) || (has.nasal(f) && !allow.has("nasal"))) continue;
    seen.set(f, { f, n: 1, i });
  }
  const list = [...seen.values()].sort((a, b) => b.n - a.n).slice(0, 160);
  poolCache.set(l.id, list);
  return list;
}
// the letters learned so far, as LETTERS rows (all 24 once there are fewer than four to choose from)
const known = l => { const c = cumulative(l).letters, k = LETTERS.filter(x => c.has(x[0])); return k.length >= 4 ? k : LETTERS; };
const lessonLetters = l => l.letters && l.letters.length ? l.letters : [...cumulative(l).letters].filter(c => c !== "ς");
const choice = (prompt, right, wrong, explain, opts = {}) => {
  const options = shuffle([{ html: right, ok: true }, ...uniq(wrong).filter(w => w !== right).slice(0, 3).map(html => ({ html, ok: false }))]);
  return options.length < 2 ? null : { kind: "choice", prompt, options, explain, big: opts.big };
};
// wrong spellings that teach: each letter replaced by what it looks like, or a long vowel swapped for a short one
function misspell(f, l){
  const breath = !l || cumulative(l).allow.has("rough"), long = !l || cumulative(l).letters.has("η");
  const ps = parts(f), out = [];
  ps.forEach((p, k) => {
    const lo = (p.g ? base(p.g)[0] : "") || "";
    const alt = [];
    if (p.g && NFD(p.g)[0] === "ς") alt.push("c");
    else if (LOOKS_LIKE[lo]) alt.push(LOOKS_LIKE[lo]);
    if (long) { if (p.t === "ē") alt.push("e"); if (p.t === "e") alt.push("ē"); if (p.t === "ō") alt.push("o"); if (p.t === "o") alt.push("ō"); }
    if (p.t === "h" && !p.g && breath) alt.push("");
    for (const a of alt) out.push(ps.map((q, j) => j === k ? (q.t[0] === q.t[0].toUpperCase() && q.t[0] !== q.t[0].toLowerCase() ? a.toUpperCase() : a) : q.t).join(""));
  });
  if (breath && !has.rough(f) && /^[αεηιοω]/.test(base(f)[0] || "")) out.push("h" + translit(f));
  return shuffle(uniq(out).filter(x => x && x !== translit(f)));
}

const GEN = {
  name(l){ const g = pick(lessonLetters(l)), L = letter(g);
    return choice(`What is this letter called?<span class="q-big">${gk(g)}</span>`, L[2], shuffle(known(l).filter(x => x[0] !== L[0])).map(x => x[2]), `${gk(g)} is ${L[2]}, said ${L[4]}.`); },
  toLetter(l){ const g = pick(lessonLetters(l)), L = letter(g), ks = known(l).map(x => x[0]);
    const near = shuffle(Object.keys(LOOKS_LIKE).filter(k => k !== g && k !== "ς" && ks.includes(k)));
    return choice(`Which letter is <b>${esc(L[2])}</b>?`, gk(g), [...near.slice(0, 1), ...shuffle(ks)].filter(x => x !== g).map(gk), `${L[2]} is written ${gk(g)}.`, { big: true }); },
  sound(l){ const g = pick(lessonLetters(l)), L = letter(g);
    return choice(`How do you say this letter?<span class="q-big">${gk(g)}</span>`, esc(L[4]), shuffle(known(l).filter(x => x[0] !== L[0])).map(x => esc(x[4])), `${gk(g)} (${L[2]}) is said ${esc(L[4])}.`); },
  order(l){ const k = 1 + rnd(LETTERS.length - 1), prev = LETTERS[k - 1], L = LETTERS[k];
    return choice(`Which letter comes right after ${gk(prev[0])} (${esc(prev[2])}) in the alphabet?`, gk(L[0]), shuffle(LETTERS.filter((x, j) => j !== k && j !== k - 1)).slice(0, 6).map(x => gk(x[0])), `The order runs ${gk(prev[0])} ${gk(L[0])}: ${prev[2]}, ${L[2]}.`, { big: true }); },
  tlPick(l, used){ const w = word(l, used, x => misspell(x.f, l).length >= 2); if (!w) return null;
    return choice(`How is this word written in English letters?<span class="q-big">${gk(w.f)}</span>`, esc(translit(w.f)), misspell(w.f, l).map(esc), `${gk(w.f)} is ${stressHTML(w.f)}: ${tlExplain(w.f)}.`); },
  tlType(l, used){ const w = word(l, used, x => base(x.f).length <= (l.id < "0.4" ? 6 : 9)); if (!w) return null;
    return { kind: "type", prompt: `Type this word in English letters.<span class="q-big">${gk(w.f)}</span>`, answer: translit(w.f), explain: `${gk(w.f)} is ${stressHTML(w.f)}: ${tlExplain(w.f)}.` }; },
  pair(l){ const p = pick(PAIRS);
    return rnd(2) ? choice(`How do you say this vowel pair?<span class="q-big">${gk(p[0])}</span>`, esc(p[2]), PAIRS.filter(x => x !== p).map(x => esc(x[2])), `${gk(p[0])} is said ${esc(p[2])}, as in ${gk(p[3])} (${stressHTML(p[3])}).`)
      : choice(`Which pair is said <b>${esc(p[2])}</b>?`, gk(p[0]), shuffle(PAIRS.filter(x => x !== p)).map(x => gk(x[0])), `${esc(p[2])} is ${gk(p[0])}, as in ${gk(p[3])}.`, { big: true }); },
  breath(l, used){
    const want = rnd(2) === 1;
    const w = word(l, used, x => /^[αεηιουωρ]/.test(base(x.f)[0] || "") && has.rough(x.f) === want); if (!w) return null;
    return choice(`Does this word start with an h sound?<span class="q-big">${gk(w.f)}</span>`, want ? "Yes: rough breathing" : "No: smooth breathing", [want ? "No: smooth breathing" : "Yes: rough breathing"],
      `${gk(w.f)} is ${stressHTML(w.f)}. ${want ? "The rough breathing (‘) adds the h." : "The smooth breathing (’) adds no sound."}`); },
  cap(l){ const L = pick(LETTERS.filter(x => !"ΑΒΕΖΙΚΜΟΤ".includes(x[1])));
    return choice(`Which small letter goes with this capital?<span class="q-big">${gk(L[1])}</span>`, gk(L[0]), shuffle(LETTERS.filter(x => x !== L)).map(x => gk(x[0])), `${gk(L[1])} is capital ${L[2]}, small ${gk(L[0])}.`, { big: true }); },
  punct(l){ const p = pick(PUNCT);
    return choice(`What does this mark mean in Greek?<span class="q-big">${gk("λόγος" + p[0])}</span>`, esc(p[2]), PUNCT.filter(x => x !== p).map(x => esc(x[2])), `${esc(p[0])} is the ${esc(p[1])}: ${esc(p[2])}.`); },
  accent(l, used){ const kind = pick(["acute", "grave", "circumflex"]); const w = word(l, used, x => accentOf(x.f) === kind); if (!w) return null;
    return choice(`Which accent is on this word?<span class="q-big">${gk(w.f)}</span>`, kind, ["acute", "grave", "circumflex"].filter(x => x !== kind), `${gk(w.f)} has the ${kind}. ${esc(ACCENTS.find(a => a[1] === kind)[2])}.`); },
  stress(l, used){ const w = word(l, used, x => has.accent(x.f) && vowelGroups(x.f).length >= 2); if (!w) return null;
    const groups = vowelGroups(w.f), right = groups.findIndex(g => g.some(k => parts(w.f)[k].stress));
    if (right < 0) return null;
    const ORD = ["first", "second", "third", "fourth", "fifth", "sixth"];
    const show = n => parts(w.f).map((p, k) => groups[n].includes(k) ? `<b>${esc(p.t)}</b>` : esc(p.t)).join("") + `<span class="sr">, stress on the ${ORD[n] || ""} vowel, ${groups[n].map(k => parts(w.f)[k].t).join("")}</span>`;
    return choice(`Which syllable do you stress?<span class="q-big">${gk(w.f)}</span>`, show(right), groups.map((_, n) => n).filter(n => n !== right).map(show), `The accent sits over the vowel to stress: ${stressHTML(w.f)}.`); },
  sight(l){ const [w, , g] = pick(l.words);
    return choice(`What does this word mean?<span class="q-big">${gk(w)}</span>`, esc(g), shuffle(l.words.filter(x => x[0] !== w)).map(x => esc(x[2])), `${gk(w)} (${stressHTML(w)}) means “${esc(g)}”.`); },
  toSight(l){ const [w, , g] = pick(l.words);
    return choice(`Which word means <b>“${esc(g)}”</b>?`, gk(w), shuffle(l.words.filter(x => x[0] !== w)).map(x => gk(x[0])), `“${esc(g)}” is ${gk(w)} (${stressHTML(w)}).`, { big: true }); },
  spot(l){ return l.level > 0 ? drills.spotItem(l) : spotItem(l); }
};
// a word from the pool not used yet in this run, meeting a test
function word(l, used, test = () => true){
  const list = pool(l).filter(x => !used.has(x.f) && test(x));
  if (!list.length) return null;
  const w = pick(list.slice(0, Math.max(12, Math.ceil(list.length / 2))));
  used.add(w.f);
  return w;
}
// groups of part indexes that are vowels (a pair counts as one)
function vowelGroups(f){
  const ps = parts(f), out = [];
  ps.forEach((p, k) => {
    if (!p.g || !/[αεηιουω]/.test(base(p.g)[0] || "")) return;
    const last = out[out.length - 1], prev = ps[k - 1];
    if (last && last[last.length - 1] === k - 1 && prev && PAIRS.some(x => x[0] === base(prev.g)[0] + base(p.g)[0]) && !NFD(p.g).includes("̈")) last.push(k);
    else out.push([k]);
  });
  return out;
}
const tlExplain = f => parts(f).filter(p => p.g || p.t).map(p => p.g ? `${gk(p.g)} ${esc(p.t)}` : `rough breathing ${esc(p.t)}`).join(", ");

// Tap every word in a verse that shows a feature
function spotItem(l){
  const m = l.see.mark;
  let test, label;
  if (m === "letters") { const g = pick(l.letters.filter(c => c !== "ς")); test = i => base(john.form(i)).includes(g); label = `contains the letter ${gk(g)} (${esc(letter(g)[2])})`; }
  else if (m === "breath") { test = i => has.rough(john.form(i)); label = "starts with an h sound (a rough breathing)"; }
  else if (m === "caps") { if (rnd(2)) { test = i => has.question(john, i); label = "ends a question (look for ;)"; } else { test = i => has.caps(john.form(i)); label = "has a capital letter"; } }
  else if (m === "accent") { const kind = pick(["circumflex", "grave"]); test = i => accentOf(john.form(i)) === kind; label = `carries a ${kind} accent (${gk(kind === "grave" ? "ὰ" : "ᾶ")})`; }
  else if (m === "sight") { const s = sightSet(l); const w = pick([...s].filter(x => ["καί", "ὁ", "θεός", "ἐν", "οὗτος", "αὐτός"].includes(x))); test = i => john.lemma(i) === w; label = `is a form of ${gk(w)} (“${esc(l.words.find(x => x[0] === w)[2])}”)`; }
  else return null;
  // a verse in John 1 with at least one such word and not too many words
  const cands = john.verses({ c1: 1, v1: 1, c2: 1, v2: 51 }).filter(v => v.z - v.a <= 24).map(v => ({ v, hits: [...Array(v.z - v.a).keys()].map(k => v.a + k).filter(test) })).filter(x => x.hits.length && x.hits.length < x.v.z - x.v.a);
  if (!cands.length) return null;
  const own = cands.filter(x => x.v.c === l.see.c && x.v.v >= l.see.v1 && x.v.v <= l.see.v2), { v, hits } = pick(own.length && rnd(2) ? own : cands);
  const words = [];
  for (let i = v.a; i < v.z; i++) words.push({ i, html: esc(john.before(i) + john.form(i) + john.after(i)), ok: hits.includes(i) });
  return { kind: "spot", prompt: `Tap every word that ${label}.`, ref: `John ${v.c}:${v.v}`, words, explain: `In John ${v.c}:${v.v}: ${hits.map(i => gk(john.form(i))).join(", ")}.` };
}

/* ---------- running practice and checkpoints ---------- */
// for the browser tests (demo only): build any lesson's exercises without the page
if (DEMO) window.__school = { build: (id, which) => build(lessonById(id), lessonById(id)[which]), ids: () => ALL.map(x => x.id),
  ready: async () => { await ensureDrills(); for (const l of ALL.filter(x => x.read)) await readerFor(l); return true; }, drills: () => drills, lesson: id => lessonById(id) };
function build(l, types){
  const used = new Set(), items = [];
  const r = l.read ? readers.get(l.read.b) : null;
  if (r) r.setRange(...l._range);
  const gen = t => r ? (t === "spot" ? r.spotItem(l) : r.GEN[t](l, used)) : GEN[t](l, used);
  for (const t of types) { let it = null; for (let n = 0; n < 6 && !it; n++) it = gen(t); if (it) items.push(it); }
  return items;
}
function startRun(l, step, skipping = false){
  if (skipping) {
    main.innerHTML = `<p class="crumb"><a href="#">‹ Greek School</a></p><p class="eyebrow">${place(l)} · checkpoint to skip ahead</p><h1>${esc(l.title)}</h1><div id="step"></div>`;
  }
  run = { lesson: l, step, skipping, items: build(l, step === "check" ? l.check : l.practise), k: 0, right: 0, answered: false };
  $("#step").innerHTML = `<div class="run" id="run"></div>`;
  showItem();
  top();
}
function showItem(){
  const r = run, it = r.items[r.k], box = $("#run");
  if (!it) return finish();
  r.answered = false;
  const head = `<p class="qn">${r.step === "check" ? "Checkpoint" : "Practice"} · ${r.k + 1} of ${r.items.length}<span class="qs" aria-hidden="true">${r.items.map((_, n) => `<i class="${n < r.k ? "past" : n === r.k ? "now" : ""}"></i>`).join("")}</span></p>`;
  let body = "";
  if (it.kind === "choice") body = `<div class="sq">${it.prompt}</div><div class="opts${it.big ? " big" : ""}" role="group" aria-label="Answers">${it.options.map((o, n) => `<button type="button" class="opt" data-n="${n}"${DEMO && o.ok ? " data-right" : ""}>${o.html}</button>`).join("")}</div>`;
  else if (it.kind === "type") body = `<div class="sq">${it.prompt}</div><form class="styped" id="styped" autocomplete="off"><label class="sr" for="tin">English letters</label><input id="tin" class="tin" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done"${DEMO ? ` data-answer="${esc(it.answer)}"` : ""}>
      <span class="keys" role="group" aria-label="Long vowels"><button type="button" data-k="ē" aria-label="e with a line, long e">ē</button><button type="button" data-k="ō" aria-label="o with a line, long o">ō</button></span><button type="submit" class="btn primary">Check</button></form>`;
  else if (it.kind === "spot") body = `<div class="sq">${it.prompt} <span class="small">${esc(it.ref)}</span></div><div class="spot" lang="el">${it.words.map((w, n) => `<button type="button" class="sw" data-n="${n}" aria-pressed="false"${DEMO && w.ok ? " data-right" : ""}>${w.html}</button>`).join(" ")}</div><div class="row"><button type="button" class="btn primary" id="spotcheck">Check</button></div>`;
  box.innerHTML = head + body + `<div class="fb" id="fb" hidden></div>`;
  if (it.kind === "choice") box.querySelectorAll(".opt").forEach(b => b.onclick = () => answer(it.options[+b.dataset.n].ok, b));
  if (it.kind === "type") {
    const inp = $("#tin");
    box.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { const s = inp.selectionStart ?? inp.value.length; inp.value = inp.value.slice(0, s) + b.dataset.k + inp.value.slice(inp.selectionEnd ?? s); inp.focus(); inp.setSelectionRange(s + 1, s + 1); });
    $("#styped").onsubmit = e => { e.preventDefault(); if (r.answered || !inp.value.trim()) return; answer(norm(inp.value) === norm(it.answer), inp); };
    inp.focus({ preventScroll: true });
  }
  if (it.kind === "spot") {
    box.querySelectorAll(".spot .sw").forEach(b => b.onclick = () => { if (!r.answered) b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); });
    $("#spotcheck").onclick = () => {
      if (r.answered) return;
      const btns = [...box.querySelectorAll(".spot .sw")];
      let ok = true;
      btns.forEach((b, n) => { const on = b.getAttribute("aria-pressed") === "true", want = it.words[n].ok; if (on !== want) ok = false; b.classList.add(want ? (on ? "ok" : "missed") : on ? "bad" : "x"); });
      answer(ok, null);
    };
  }
}
const norm = s => s.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
function answer(ok, el){
  const r = run, it = r.items[r.k];
  if (r.answered) return;
  r.answered = true;
  if (ok) r.right++;
  if (it.kind === "choice") $("#run").querySelectorAll(".opt").forEach((b, n) => { b.disabled = true; if (it.options[n].ok) b.classList.add("ok"); else if (b === el) b.classList.add("bad"); });
  if (it.kind === "type") { el.disabled = true; el.classList.add(ok ? "ok" : "bad"); $("#run").querySelectorAll("#styped button").forEach(b => b.disabled = true); }
  const last = r.k + 1 >= r.items.length;
  const fb = $("#fb");
  fb.hidden = false;
  fb.className = "fb " + (ok ? "good" : "notyet");
  fb.innerHTML = `<p><b>${ok ? "Right." : it.kind === "type" ? `Not quite. It is <span class="lat">${esc(it.answer)}</span>.` : "Not quite."}</b> ${it.explain}</p><button type="button" class="btn primary" id="nextq">${last ? "See how you did" : "Next"}</button>`;
  say(fb.querySelector("p").textContent);
  $("#nextq").onclick = () => { r.k++; showItem(); const q = $("#run .sq"); if (q) { q.setAttribute("tabindex", "-1"); q.focus(); } };
  $("#nextq").focus({ preventScroll: true });
}

async function finish(){
  const r = run, l = r.lesson, n = r.items.length, score = n ? Math.round(100 * r.right / n) : 0, box = $("#run");
  if (r.step === "practise") {
    box.innerHTML = `<div class="result"><h2>${r.right} of ${n} right</h2><p>${score >= 80 ? "You are ready for the checkpoint." : "Practise once more before the checkpoint; each round uses different words."}</p>
      <div class="row"><button type="button" class="btn${score >= 80 ? "" : " primary"}" id="again">Practise again</button><a class="btn${score >= 80 ? " primary" : ""}" href="#lesson=${l.id}&step=check">Go to the checkpoint ›</a></div></div>`;
    $("#again").onclick = () => startRun(l, "practise");
    say(`${r.right} of ${n} right`); return;
  }
  const passed = score >= PASS * 100, nx = after(l.id);
  if (!passed) {
    box.innerHTML = `<div class="result notyet"><h2>${r.right} of ${n}: not yet</h2><p>The checkpoint needs 8 of 10. ${r.skipping ? "Work through the lesson instead; it will not take long." : "Go back to practise: you keep everything you have learned, and the next try uses different words."}</p>
      <div class="row">${r.skipping ? `<a class="btn primary" href="#lesson=${before(l.id).id}">Back to the lesson before</a>` : `<a class="btn primary" href="#lesson=${l.id}&step=practise">Practise again</a>`}<button type="button" class="btn" id="retry">Try the checkpoint again</button></div></div>`;
    $("#retry").onclick = () => startRun(l, "check", r.skipping);
    say(`${r.right} of ${n}. Not yet passed.`); return;
  }
  const prev = prog.done[l.id];
  const row = [Date.now(), Math.max(score, prev ? prev[1] : 0), prev && prev[2] === "pass" ? "pass" : r.skipping ? "skip" : "pass"];
  prog.done[l.id] = row;
  const patch = { done: { [l.id]: row }, last: nx ? nx.id : l.id };
  // when skipping ahead, the lessons before it count as done too
  if (r.skipping) for (const x of ALL.slice(0, ALL.indexOf(ALL.find(y => y.id === l.id)))) if (!prog.done[x.id]) { prog.done[x.id] = patch.done[x.id] = [Date.now(), 0, "skip"]; }
  save(patch);
  let added = 0;
  if (l.words && l.words.length) { const fresh = l.words.filter(w => !learn.inDeck(w[0])); added = fresh.length; await learn.addMany(fresh.map(([w, k, g]) => [w, { k, g }])); }
  const s = l.read ? null : l.level > 0 ? drills.seeRange(l) : l.see, ref = l.read ? passageRef(l) : verseRef(s.c, s.v1, s.v2);
  box.innerHTML = `<div class="result good"><h2>Passed: ${r.right} of ${n}</h2>
    <p>${nx ? `“${esc(nx.title)}” is open.` : "That is every lesson written so far. The next level opens here when it is ready."}</p>
    ${added ? `<p>${added} new ${added === 1 ? "word is" : "words are"} in your review deck. Review them a few minutes a day on the Study Desk: <b>Learn</b>, then <b>Review</b>.</p>` : ""}
    <p>See it at work: open ${esc(ref)} on the Study Desk and read it with this lesson in mind.</p>
    <div class="row">${nx ? `<a class="btn primary" href="#lesson=${nx.id}">Next lesson ›</a>` : `<a class="btn primary" href="#">Back to the School</a>`}<a class="btn" href="${withDemo("greek.html?ref=" + encodeURIComponent(ref) + (l.read ? "&graded=1" : ""))}">Open ${esc(ref)} on the Desk</a>${added ? `<a class="btn" href="${withDemo("greek.html?learn=review")}">Review now</a>` : ""}</div></div>`;
  say(`Passed, ${r.right} of ${n}.`);
}
