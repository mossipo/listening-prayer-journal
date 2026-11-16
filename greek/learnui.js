// Akouō Plus, Greek Study Desk: the Learn sheet. Five tabs, all built from the passage you are reading:
// Progress, Review (vocabulary deck), Parsing (drills), Paradigms and Lessons.
// Everything a drill checks or a table shows comes from the data (MACULA's parsing of the SBLGNT, Akouō's short lexicon).
import { lexEntry } from "../bible.js";
import { loadBook, loadOcc, loadForms, loadCore, bsbVerses, NT_BOOKS, NT_CODES } from "./data.js";
import { esc, describe, noteFor } from "./grammar.js";
import { KNOWN_BOX, inDays } from "./learn.js";
import { paradigmHTML, MODELS, spellingOf, formsOf } from "./paradigm.js";
import { lessonsFor, LESSONS, PATTERN_LESSONS } from "./lessons.js";

const gk = s => `<span lang="el" class="gkin">${esc(s)}</span>`;
const TABS = [["progress", "Progress"], ["review", "Review"], ["parse", "Parsing"], ["paradigms", "Paradigms"], ["lessons", "Lessons"]];
let C = null;                       // the context of the open sheet
let tab = "progress", session = null, drill = null, model = null;

// ctx: { dlg, body, tabs, learn, codes, book, passage, verses, selected, select(i), open(label), status(text) }
export function openLearn(ctx, which){
  C = ctx;
  if (which) tab = which;
  if (!C.dlg.open) C.dlg.showModal();
  draw();
}
export function refreshLearn(){ if (C && C.dlg.open) draw(); }

function draw(){
  const due = C.learn.due().length;
  C.tabs.innerHTML = TABS.map(([k, t]) => `<button type="button" role="tab" data-tab="${k}" aria-controls="lbody" aria-selected="${k === tab}">${t}${k === "review" && due ? ` <span class="badge">${due}</span>` : ""}</button>`).join("");
  C.body.innerHTML = `<p class="loading">…</p>`;
  C.body.scrollTop = 0;
  ({ progress, review, parse, paradigms, lessons })[tab]();
}

/* ---------- helpers ---------- */
// say something to VoiceOver without moving focus (drill results, review answers)
function say(text){ const el = document.getElementById("lsay"); if (el) { el.textContent = ""; setTimeout(() => { el.textContent = text; }, 60); } }
const occIds = row => { const ids = []; let cur = 0; for (let k = 1; k < row.length; k++) { cur += row[k]; ids.push(cur); } return ids; };
async function shortGloss(strong, fallback){
  try { const e = strong ? await lexEntry("G" + strong) : null; if (e && e.g) return e.g.split(":")[0].trim(); } catch (e) {}
  return fallback || "";
}
// dictionary words in these verses: Map lemma -> { i: first word, n: times here, k: Strong's number }
function passageLemmas(book, verses){
  const m = new Map();
  for (const v of verses) for (let i = v.a; i < v.z; i++) {
    const l = book.lemma(i);
    if (!m.has(l)) m.set(l, { i, n: 0, k: book.strong(i) });
    m.get(l).n++;
  }
  return m;
}
const where = i => { const v = C.book.verseOf(i); return { b: C.book.code, c: v.c, v: v.v }; };
function shuffle(a){ for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ---------- Progress ---------- */
async function progress(){
  const L = C.learn;
  let core = null; try { core = await loadCore(); } catch (e) {}
  const share = L.share(C.book, C.verses);
  const known = L.knownList();
  const deck = Object.keys(L.s.deck).length, due = L.due().length;
  let coreLine = "";
  if (core) {
    const ck = core.words.filter(r => L.known(r[0]));
    const cover = ck.reduce((a, r) => a + r[4], 0) / core["total words"];
    coreLine = `<p>Of the ${core.words.length} words that occur ${core.least} times or more, you know <b>${ck.length}</b>. Together they make up <b>${(cover * 100).toFixed(1)}%</b> of all the words in the New Testament.</p>`;
  }
  const recent = L.recent(10);
  const d = L.s.drill;
  if (tab !== "progress") return;
  C.body.innerHTML = `
    <section class="lcard"><h3>This passage</h3>
      <p class="big-stat">You know <b>${share.pct}%</b> of the words in ${esc(C.passage.label)} <span class="small">(${share.k} of ${share.n})</span></p>
      <p class="small">Counted by dictionary form: knowing λόγος counts every form of it.</p></section>
    <section class="lcard"><h3>Words</h3>
      <p>You know <b>${known.length}</b> ${known.length === 1 ? "word" : "words"}.</p>${coreLine}
      <p>Your deck has <b>${deck}</b> ${deck === 1 ? "word" : "words"}; <b>${due}</b> ${due === 1 ? "card is" : "cards are"} due now.${due ? ` <button type="button" class="go sm" data-tab="review">Review now</button>` : ""}</p>
      <p class="small">A word counts as known when you mark it known, or when you have recalled it both ways (Greek to English and English to Greek) enough times in a row to reach box ${KNOWN_BOX} of the review boxes, which takes at least a week. Seeing a word once never counts.</p>
      ${known.length ? `<details><summary>Words you know (${known.length})</summary><ul class="wlist">${known.sort((a, b) => a.localeCompare(b, "el")).map(l => `<li>${gk(l)}${L.marked(l) ? ` <button type="button" class="tiny" data-unknow="${esc(l)}">Not known</button>` : ` <span class="small">from your reviews</span>`}</li>`).join("")}</ul></details>` : ""}</section>
    <section class="lcard"><h3>Passages studied</h3>
      <p>You have opened <b>${Object.keys(L.s.studied).length}</b> ${Object.keys(L.s.studied).length === 1 ? "passage" : "passages"} in the Greek Study Desk.</p>
      ${recent.length ? `<ul class="plist">${recent.map(r => `<li><button type="button" data-open="${esc(r)}">${esc(r)}</button></li>`).join("")}</ul>` : ""}</section>
    <section class="lcard"><h3>Parsing practice</h3>
      <p>${d.n ? `You have parsed <b>${d.n}</b> ${d.n === 1 ? "word" : "words"} and got <b>${Math.round(100 * d.ok / d.n)}%</b> fully right.` : "No parsing practice yet."} <button type="button" class="go sm" data-tab="parse">Practise on this passage</button></p></section>
    ${L.ok ? "" : `<p class="warn">Your saved progress couldn't be read just now (offline, and not opened on this device before). New progress is still saved and will join up when you reconnect.</p>`}`;
}

/* ---------- Review: the vocabulary deck ---------- */
async function review(){
  if (session) return reviewCard();
  const L = C.learn, due = L.due();
  const here = [...passageLemmas(C.book, C.verses).entries()].filter(([l]) => !L.known(l) && !L.inDeck(l));
  let occ = null, core = null;
  try { occ = await loadOcc(); } catch (e) {}
  try { core = await loadCore(); } catch (e) {}
  if (tab !== "review" || session) return;
  here.sort((a, b) => ((occ && occ[b[0]] ? occ[b[0]][0] : 0) - (occ && occ[a[0]] ? occ[a[0]][0] : 0)));
  const nextCore = core ? core.words.filter(r => !L.known(r[0]) && !L.inDeck(r[0])).slice(0, 20) : [];
  const deck = Object.entries(L.s.deck).sort((a, b) => L.nextDue(a[0]) - L.nextDue(b[0]));
  const row = (l, k, g, n, attrs) => `<li data-l="${esc(l)}"><span class="wl">${gk(l)}</span><span class="wg" data-k="${k || 0}">${esc(g || "")}</span><span class="small">${n ? n.toLocaleString("en-CA") + "×" : ""}</span>
      <span class="wb"><button type="button" class="tiny" data-add ${attrs}>Add</button><button type="button" class="tiny" data-know>I know it</button></span></li>`;
  C.body.innerHTML = `
    <section class="lcard"><h3>Review</h3>
      ${due.length ? `<p><b>${due.length}</b> ${due.length === 1 ? "card is" : "cards are"} due. A session is up to 20 cards and takes about five minutes.</p><p><button type="button" class="go" data-start>Start review</button></p>`
        : `<p>Nothing is due right now.${deck.length ? ` Next card ${inDays(Math.min(...deck.map(([l]) => L.nextDue(l))))}.` : " Add some words below to start your deck."}</p>`}
      <p class="small">Each word is practised both ways. A right answer moves it to a later box (1, 2, 4, 8, 16, 32 and 64 days); a miss brings it back soon.</p></section>
    <section class="lcard"><h3>Words from ${esc(C.passage.label)}</h3>
      ${here.length ? `<p class="small">Words here that you don't know yet, most common in the New Testament first.</p>
        <ul class="wrows" id="lr-here">${here.slice(0, 40).map(([l, x]) => row(l, x.k, "", occ && occ[l] ? occ[l][0] : 0, `data-i="${x.i}"`)).join("")}</ul>
        <p><button type="button" class="go sm" data-addall="lr-here">Add all ${Math.min(40, here.length)}</button></p>`
        : `<p>You know or are already learning every word in this passage.</p>`}</section>
    <section class="lcard"><h3>Core words</h3>
      ${nextCore.length ? `<p class="small">The most frequent New Testament words you are not learning yet. ${core.words.length} words occur ${core.least} times or more and make up about four in every five words of the New Testament.</p>
        <ul class="wrows" id="lr-core">${nextCore.map(r => row(r[0], r[1], r[3], r[4], "")).join("")}</ul>
        <p><button type="button" class="go sm" data-addall="lr-core">Add these ${nextCore.length}</button></p>`
        : core ? `<p>You are learning or know all ${core.words.length} core words.</p>` : `<p class="small">The core list isn't saved on this device yet.</p>`}</section>
    ${deck.length ? `<section class="lcard"><details><summary>Your deck (${deck.length})</summary><ul class="wrows">${deck.map(([l, c]) =>
      `<li data-l="${esc(l)}"><span class="wl">${gk(l)}</span><span class="wg">${esc(c.g)}</span><span class="small">${L.mastered(l) ? "known" : "box " + Math.min(c.ge[0], c.eg[0])} · ${inDays(L.nextDue(l))}</span><span class="wb"><button type="button" class="tiny" data-remove>Remove</button></span></li>`).join("")}</ul></details></section>` : ""}`;
  // fill the short glosses for the passage words
  for (const li of C.body.querySelectorAll("#lr-here li")) {
    const s = li.querySelector(".wg");
    shortGloss(+s.dataset.k, C.book.gloss(+li.querySelector("[data-add]").dataset.i)).then(g => { s.textContent = g; });
  }
}
function startSession(){
  const due = C.learn.due().slice(0, 20);
  session = { queue: due.map(x => ({ ...x })), at: 0, back: false, right: 0, seen: 0, again: new Set() };
  draw();
}
function reviewCard(){
  const s = session, L = C.learn;
  if (s.at >= s.queue.length) {
    C.body.innerHTML = `<section class="lcard"><h3>Session done</h3><p>${s.seen} ${s.seen === 1 ? "card" : "cards"} reviewed, ${s.right} right first time.</p>
      <p><button type="button" class="go" data-end>Back to the deck</button></p></section>`;
    return;
  }
  const q = s.queue[s.at], card = L.card(q.lemma) || { g: "" };
  const front = q.dir === "ge"
    ? `<p class="cue">What does it mean?</p><p class="card-gk" lang="el">${esc(q.lemma)}</p>`
    : `<p class="cue">Which Greek word?</p><p class="card-en">${esc(card.g || "(no gloss)")}</p>`;
  C.body.innerHTML = `<section class="lcard flash">
      <p class="small">${s.at + 1} of ${s.queue.length} · ${q.dir === "ge" ? "Greek to English" : "English to Greek"}</p>
      ${front}
      <div id="lr-back"${s.back ? "" : " hidden"}>
        <p class="card-gk" lang="el">${esc(q.lemma)}</p><p class="card-en">${esc(card.g || "")}</p>
        <div id="lr-eg" class="eg"><p class="small">Finding an example verse…</p></div>
      </div>
      <p class="fbtns">${s.back
        ? `<button type="button" class="miss" data-grade="0">Missed it</button><button type="button" class="got" data-grade="1">Got it</button>`
        : `<button type="button" class="go" data-show>Show answer</button>`}</p>
    </section><p><button type="button" class="tiny" data-end>End session</button></p>`;
  if (s.back) { say(`${q.lemma}: ${card.g || ""}`); example(q.lemma, card).then(h => { const el = C.body.querySelector("#lr-eg"); if (el) el.innerHTML = h; }); }
}
// One example verse for a word: where you added it, else a passage you have studied, else this book, else its first
// occurrence in the New Testament. Its Greek, with the word marked, and the BSB.
async function example(lemma, card){
  try {
    const occ = await loadOcc(), row = occ[lemma];
    if (!row) return "";
    const ids = occIds(row);
    let pick = null, why = "";
    if (card.b) { pick = NT_CODES.indexOf(card.b) * 1e6 + card.c * 1000 + card.v; why = "where you added it"; }
    if (!pick) {
      for (const r of Object.values(C.learn.s.studied)) {
        const [, bi, c1, v1, c2, v2] = r, lo = bi * 1e6 + c1 * 1000 + v1, hi = bi * 1e6 + c2 * 1000 + v2;
        const hit = ids.find(x => x >= lo && x <= hi);
        if (hit) { pick = hit; why = "from a passage you have studied"; break; }
      }
    }
    if (!pick) { const bi = NT_CODES.indexOf(C.book.code); pick = ids.find(x => Math.floor(x / 1e6) === bi); if (pick) why = "from the book you are reading"; }
    if (!pick) { pick = ids[0]; why = "its first place in the New Testament"; }
    const bi = Math.floor(pick / 1e6), c = Math.floor(pick / 1000) % 1000, v = pick % 1000, code = NT_CODES[bi];
    const b = await loadBook(code), k = b.findVerse(c, v);
    if (k < 0) return "";
    const ve = b.verseAt(k);
    let g = "";
    for (let i = ve.a; i < ve.z; i++) g += (b.lemma(i) === lemma ? `<b>${esc(b.form(i))}</b>` : esc(b.form(i))) + esc(b.after(i)) + " ";
    let en = ""; try { en = (await bsbVerses(code)).get(c + ":" + v) || ""; } catch (e) {}
    return `<p class="eg-gk" lang="el">${g}</p>${en ? `<p class="eg-en">${esc(en)}</p>` : ""}<p class="small">${esc(NT_BOOKS[bi][0])} ${c}:${v}, ${why}. Times in the New Testament: ${row[0].toLocaleString("en-CA")}.</p>`;
  } catch (e) { return `<p class="small">The example verse isn't saved on this device yet.</p>`; }
}

/* ---------- Parsing practice ---------- */
// in the order a parsing is usually given: tense, voice, mood, person, then case, number, gender
const FIELD_OPTS = {
  Tense: ["Present", "Imperfect", "Future", "Aorist", "Perfect", "Pluperfect"],
  Voice: ["Active", "Middle", "Passive", "Middle or passive"],
  Mood: ["Indicative", "Subjunctive", "Imperative", "Optative", "Participle", "Infinitive"],
  Person: ["1st", "2nd", "3rd"],
  Case: ["Nominative", "Genitive", "Dative", "Accusative", "Vocative"],
  Number: ["Singular", "Plural"],
  Gender: ["Masculine", "Feminine", "Neuter"]
};
// What the data says for each field a learner is asked, in the drill's terms. raw keeps the data's own wording.
function truth(d){
  const f = d.f, t = {}, raw = {};
  const put = (k, v, r) => { if (v) { t[k] = v; raw[k] = r || v; } };
  if (f.Function === "Verb") {
    put("Tense", (f.Tense || "").replace(/^2nd /, ""), f.Tense);
    put("Voice", /middle or passive/i.test(f.Voice || "") ? "Middle or passive" : /^middle/i.test(f.Voice || "") ? "Middle" : /^passive/i.test(f.Voice || "") ? "Passive" : f.Voice, f.Voice);
    put("Mood", f.Mood || f.Form);
    if (!f.Case) { put("Person", d.person); put("Number", f.Number); }
  }
  if (f.Case) { put("Case", f.Case); put("Number", f.Number); put("Gender", f.Gender); }
  return { t, raw };
}
// "Middle or passive" in the data accepts either answer
const fits = (field, answer, want) => answer === want || (field === "Voice" && want === "Middle or passive" && (answer === "Middle" || answer === "Passive"));
function drillPool(){
  const seen = new Set(), out = [];
  for (const v of C.verses) for (let i = v.a; i < v.z; i++) {
    const d = describe(C.codes, C.book.code_(i));
    if (!d || !(d.f.Function === "Verb" || d.f.Case) || /Indeclinable/.test(d.f.Function || "")) continue;
    const key = C.book.lemma(i) + "|" + C.book.code_(i);
    if (seen.has(key)) continue;
    seen.add(key); out.push(i);
  }
  return shuffle(out).slice(0, 10);
}
async function parse(){
  if (!drill) {
    const pool = drillPool();
    if (!pool.length) { C.body.innerHTML = `<section class="lcard"><h3>Parsing practice</h3><p>This passage has no words to parse. Try a longer passage.</p></section>`; return; }
    drill = { pool, at: 0, pick: {}, checked: null, right: 0 };
  }
  let FD = null; try { FD = await loadForms(); } catch (e) {}
  if (tab !== "parse") return;
  const s = drill;
  if (s.at >= s.pool.length) {
    C.body.innerHTML = `<section class="lcard"><h3>Done</h3><p>${s.right} of ${s.pool.length} fully right.</p>
      <p><button type="button" class="go" data-again>Ten more from this passage</button></p></section>`;
    return;
  }
  const i = s.pool[s.at], book = C.book, d = describe(C.codes, book.code_(i)), { t, raw } = truth(d);
  const ve = book.verseOf(i);
  let ctxLine = "";
  for (let k = ve.a; k < ve.z; k++) ctxLine += (k === i ? `<b>${esc(book.form(k))}</b>` : esc(book.form(k))) + esc(book.after(k)) + " ";
  const fields = Object.keys(FIELD_OPTS).filter(k => t[k]);
  const res = s.checked;
  let h = `<section class="lcard drill"><p class="small">${s.at + 1} of ${s.pool.length} · ${esc(C.passage.book[0])} ${ve.c}:${ve.v}</p>
    <p class="drill-ctx" lang="el">${ctxLine}</p>
    <p class="card-gk" lang="el">${esc(book.form(i))}</p><p class="small">from ${gk(book.lemma(i))}${d.f.Function !== "Verb" ? ` · ${esc(d.f.Function.toLowerCase())}` : ""}</p>`;
  for (const k of fields) {
    const opts = FIELD_OPTS[k].filter(o => k !== "Mood" || d.f.Function === "Verb");
    h += `<div class="fld"><span class="fl">${k === "Mood" ? "Mood or form" : k}</span><span class="fo">${opts.map(o => {
      const chosen = s.pick[k] === o, ok = res && (o === t[k] || (chosen && fits(k, o, t[k]))), bad = res && chosen && !fits(k, o, t[k]);
      return `<button type="button" data-f="${k}" data-o="${esc(o)}" aria-pressed="${chosen}" class="${ok ? "ok" : ""}${bad ? "bad" : ""}"${res ? " disabled" : ""}>${esc(o)}</button>`;
    }).join("")}</span></div>`;
  }
  if (!res) h += `<p><button type="button" class="go" data-check${fields.every(k => s.pick[k]) ? "" : " disabled"}>Check</button></p>`;
  else {
    const wrong = fields.filter(k => !fits(k, s.pick[k], t[k]));
    let also = "";
    if (wrong.length && FD) {
      // the same spelling parsed the way you chose, somewhere else in the New Testament
      const mine = spellingOf(FD, book.lemma(i), book.code_(i));
      const alt = formsOf(FD, C.codes, book.lemma(i)).find(e => e.d && e.code !== book.code_(i) && e.form === mine && fields.every(k => fits(k, s.pick[k], truth(e.d).t[k])));
      if (alt) also = `<p class="note">Your answer fits this spelling: the same form is parsed that way elsewhere in the New Testament (${esc(alt.d.label)}, ${alt.n} ${alt.n === 1 ? "time" : "times"}). In this verse MACULA reads it as below, from the context.</p>`;
    }
    h += wrong.length
      ? `<p class="verdict bad">${also ? "Fits the form, but not the reading here." : `${fields.length - wrong.length} of ${fields.length} right.`}</p>${also}<ul class="why">${wrong.map(k => `<li><b>${k === "Mood" ? "Mood or form" : k}:</b> you chose ${esc(s.pick[k])}; the data says ${esc(raw[k])}. ${esc(noteFor(k === "Mood" && !d.f.Mood ? "Form" : k, raw[k]))}</li>`).join("")}</ul>`
      : `<p class="verdict ok">All right.</p>`;
    if (/deponent/i.test(d.f.Voice || "")) h += `<p class="small">${esc(noteFor("Voice", d.f.Voice))}</p>`;
    h += `<p class="parse"><b>${esc(d.parts[0])}</b> · ${esc(d.parts.slice(1).join(" · "))}${book.gloss(i) && book.gloss(i) !== "-" ? `: <i>${esc(book.gloss(i))}</i>` : ""}</p>
      <p class="small"><span class="code">${esc(book.code_(i))}</span> · parsing from MACULA${book.stepCode(i) ? `; STEPBible tags it <span class="code">${esc(book.stepCode(i))}</span>` : ""}</p>
      <p class="fbtns"><button type="button" class="tiny" data-word="${i}">Open this word</button><button type="button" class="go" data-next>Next</button></p>`;
  }
  C.body.innerHTML = h + "</section>";
  if (res) { const v = C.body.querySelector(".verdict"); say(`${v ? v.textContent : ""} ${d.parts.join(", ")}`); }
}

/* ---------- Paradigms ---------- */
async function paradigms(){
  let FD = null; try { FD = await loadForms(); } catch (e) {}
  if (tab !== "paradigms") return;
  if (!FD) { C.body.innerHTML = `<p class="warn">The paradigm tables aren't saved on this device yet. Connect once and open this tab again.</p>`; return; }
  const sel = C.selected();
  const pick = model || (sel >= 0 ? { lemma: C.book.lemma(sel), mark: C.book.code_(sel), note: `${C.book.form(sel)} is highlighted` } : null);
  C.body.innerHTML = `
    <section class="lcard"><h3>Model tables</h3>
      ${MODELS.map(([t, list]) => `<p class="mrow"><span class="small">${esc(t)}</span> ${list.map(([l, n]) => `<button type="button" class="tiny${pick && pick.lemma === l ? " cur" : ""}" data-model="${esc(l)}" title="${esc(n)}">${gk(l)}</button>`).join("")}</p>`).join("")}
      ${sel >= 0 ? `<p><button type="button" class="tiny${!model ? " cur" : ""}" data-model="">The word you tapped: ${gk(C.book.form(sel))}</button></p>` : `<p class="small">Tap a word in the passage, then open Paradigms to see all of its forms with that one highlighted.</p>`}</section>
    ${pick ? `<section class="lcard">${paradigmHTML(FD, C.codes, pick.lemma, pick.mark, pick.note)}</section>` : ""}`;
}

/* ---------- Lessons ---------- */
function lessons(){
  const found = lessonsFor(C.book, C.codes, C.verses, describe);
  const here = new Set(found.map(x => x.lesson.id));
  const card = (L, words) => `<section class="lcard lesson"><h3>${esc(L.title)}</h3>
      ${words ? `<p class="small">This passage has ${words.length} ${words.length === 1 ? L.one : L.many}.</p>` : ""}
      ${L.body.map(p => `<p>${esc(p)}</p>`).join("")}
      ${L.careful ? `<p class="careful"><b>CAREFUL</b> ${esc(L.careful)}</p>` : ""}
      ${words ? `<p class="small">In this passage (tap one to see it):</p><p class="wchips">${words.slice(0, 30).map(i => `<button type="button" class="tiny" data-word="${i}">${gk(C.book.form(i))}</button>`).join("")}${words.length > 30 ? ` <span class="small">and ${words.length - 30} more</span>` : ""}</p>` : ""}</section>`;
  C.body.innerHTML = (found.length ? `<p class="small">Lessons for what is in ${esc(C.passage.label)}, the most frequent first.</p>` + found.map(x => card(x.lesson, x.words)).join("") : `<p>No lessons match this passage.</p>`)
    + `<details class="lcard"><summary>Other lessons</summary>${[...LESSONS, ...PATTERN_LESSONS].filter(L => !here.has(L.id)).map(L => card(L, null)).join("")}</details>`;
}

/* ---------- one click handler for the whole sheet ---------- */
export function wireLearn(dlg, tabs, body){
  tabs.addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if (b) { tab = b.dataset.tab; draw(); } });
  body.addEventListener("click", async e => {
    const b = e.target.closest("button"); if (!b || !C) return;
    const L = C.learn, li = b.closest("li[data-l]"), lemma = li && li.dataset.l;
    if (b.dataset.tab) { tab = b.dataset.tab; draw(); }
    else if (b.dataset.open) { dlg.close(); C.open(b.dataset.open); }
    else if (b.dataset.unknow != null) { await L.setKnown(b.dataset.unknow, false); draw(); }
    else if (b.hasAttribute("data-add") && lemma) {
      const i = b.dataset.i != null ? +b.dataset.i : -1, g = li.querySelector(".wg").textContent;
      await L.add(lemma, { k: +li.querySelector(".wg").dataset.k || 0, g, ...(i >= 0 ? where(i) : {}) });
      li.remove(); C.status();
    }
    else if (b.hasAttribute("data-know") && lemma) { await L.setKnown(lemma, true); li.remove(); C.status(); }
    else if (b.hasAttribute("data-remove") && lemma) { await L.remove(lemma); li.remove(); C.status(); }
    else if (b.dataset.addall) {
      const rows = [...body.querySelectorAll(`#${b.dataset.addall} li`)];
      await L.addMany(rows.map(r => { const a = r.querySelector("[data-add]"), i = a.dataset.i != null ? +a.dataset.i : -1, w = r.querySelector(".wg");
        return [r.dataset.l, { k: +w.dataset.k || 0, g: w.textContent, ...(i >= 0 ? where(i) : {}) }]; }));
      C.status(); draw();
    }
    else if (b.hasAttribute("data-start")) startSession();
    else if (b.hasAttribute("data-show")) { session.back = true; reviewCard(); }
    else if (b.dataset.grade != null) {
      const q = session.queue[session.at], right = b.dataset.grade === "1";
      if (!session.again.has(q.lemma + q.dir)) { session.seen++; if (right) session.right++; }
      await L.grade(q.lemma, q.dir, right);
      if (!right && !session.again.has(q.lemma + q.dir)) { session.again.add(q.lemma + q.dir); session.queue.push({ ...q }); }
      session.at++; session.back = false; reviewCard(); C.status();
    }
    else if (b.hasAttribute("data-end")) { session = null; draw(); }
    else if (b.dataset.f) { if (!drill.checked) { drill.pick[b.dataset.f] = b.dataset.o; parse(); } }
    else if (b.hasAttribute("data-check")) {
      const i = drill.pool[drill.at], { t } = truth(describe(C.codes, C.book.code_(i)));
      const right = Object.keys(t).every(k => fits(k, drill.pick[k], t[k]));
      drill.checked = true; if (right) drill.right++;
      L.drilled(right); parse();
    }
    else if (b.hasAttribute("data-next")) { drill.at++; drill.pick = {}; drill.checked = null; parse(); }
    else if (b.hasAttribute("data-again")) { drill = null; parse(); }
    else if (b.dataset.word != null) { dlg.close(); C.select(+b.dataset.word); }
    else if (b.dataset.model != null) { model = b.dataset.model ? { lemma: b.dataset.model, mark: "", note: "" } : null; paradigms(); }
  });
}
// a new passage starts fresh drills
export function resetLearn(){ drill = null; session = null; model = null; }
