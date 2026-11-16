// Greek Study Desk: the word panel. Tap a word and this shows what the data says about it:
// the word, its parsing in plain English, its job in the sentence, where else it occurs, the lexicons, and your notes.
import { lexEntry } from "../bible.js";
import { loadOcc, fullLex, hasBook, NT_BOOKS, NT_CODES } from "./data.js";
import { esc, describe, teach, functionOf, CAREFUL_LEXICON } from "./grammar.js";

const gk = s => `<span lang="el" class="gkin">${esc(s)}</span>`;
const em = s => esc(s).replace(/_\s*([^_]+?)\s*_/g, "<em>$1</em>").replace(/_/g, "").replace(/\s+/g, " ").trim();
const OCC_SHOWN = 48;
let token = 0;

// ctx: { el, book, codes, bookName, onClose(), onJump(code, c, v, lemma), notes: { load(lemma, strong), save(lemma, strong, text) } }
export function showWord(ctx, i){
  const { el, book, codes } = ctx, my = ++token;
  const v = book.verseOf(i), lemma = book.lemma(i), strong = book.strong(i), code = book.code_(i), gloss = book.gloss(i);
  const d = describe(codes, code);
  const tr = book.translit(i);
  const ref = `${ctx.bookName} ${v.c}:${v.v}`;
  const untranslated = !gloss || gloss === "-";

  // Word
  const facts = [
    ["Dictionary form", `${gk(lemma)} <span id="p-ltr" class="small"></span>`],
    ["Meaning", `<span id="p-short">…</span>`],
    ["Here", untranslated ? "No separate English word in the gloss" : `“${esc(gloss)}” <span class="small">(${esc(book.glossSource(i))} gloss)</span>`],
    ["BSB in this verse", book.bsb(i)
      ? `“${esc(book.bsb(i))}”${book.bsbApprox(i) ? ` <span class="small">(matched by position: this word's Strong's number occurs more than once in the verse)</span>` : ""}`
      : `<span class="small">Not translated as a separate word in the BSB, or no link in the data.</span>`],
    ["Strong's number", strong ? "G" + strong : "No number in the data"]
  ];

  // Parsing
  let parsing, caseUses = null;
  if (!d) parsing = `<p>No plain-English wording in the data for the code <span class="code">${esc(code)}</span>.</p>`;
  else {
    const t = teach(d);
    const [first, ...rest] = d.parts;
    parsing = `<p class="parse"><b>${esc(first)}</b>${rest.length ? " · " + esc(rest.join(" · ")) : ""}${untranslated ? "" : `: <i>${esc(gloss)}</i>`}</p>
      <p class="small"><span class="code">${esc(code)}</span> · ${d.fromMacula ? "spelled out from MACULA's own fields; STEPBible does not list this code" : "parsing from MACULA, wording from STEPBible"}</p>
      ${d.meaning ? `<p>STEPBible describes this form as: ${em(d.meaning)}${d.example ? `. Its pattern in English: “${em(d.example)}”` : ""}.</p>` : ""}
      ${t.notes.length ? `<ul class="notes">${t.notes.map(([h, x]) => `<li><b>${esc(h)}.</b> ${esc(x)}</li>`).join("")}</ul>` : ""}
      ${t.careful.map(x => `<p class="careful"><b>CAREFUL</b> ${esc(x)}</p>`).join("")}`;
    const sc = book.stepCode(i);
    if (sc) {
      const sd = describe(codes, sc);
      parsing += sc.startsWith(code + "-")
        ? `<p class="small" style="margin-top:8px">STEPBible gives the same parsing with one more tag: <span class="code">${esc(sc)}</span>${sd ? " (" + esc(sd.label) + ")" : ""}.</p>`
        : `<p class="small" style="margin-top:8px">STEPBible tags this word differently: <span class="code">${esc(sc)}</span>${sd ? " (" + esc(sd.label) + ")" : ""}. The two sources class some words in different ways; weigh both.</p>`;
    }
    caseUses = t.caseUses;
  }

  const fn = functionOf(book, codes, i);

  el.innerHTML = `
    <div class="ph"><div class="pw"><h2 class="big" lang="el">${esc(book.form(i))}</h2><p class="tr">${tr ? esc(tr) + " · " : ""}${esc(ref)}</p></div>
      <button type="button" class="x" data-close aria-label="Close word details">×</button></div>
    <div class="pb">
      <section><h3>Word</h3><dl class="facts">${facts.map(([k, x]) => `<dt>${k}</dt><dd>${x}</dd>`).join("")}</dl></section>
      <section><h3>Parsing</h3>${parsing}</section>
      <section><h3>In this sentence</h3>${fn.map(x => `<p>${x}</p>`).join("") || "<p>No sentence data for this word.</p>"}
        <p class="small">From MACULA's syntax analysis, which is one scholarly reading. Other readings of some constructions exist.</p></section>
      ${caseUses ? `<section><h3>Possible uses of the ${esc(caseUses.name)}</h3><ul class="uses">${caseUses.uses.map(u => `<li>${esc(u)}</li>`).join("")}</ul>
        <p class="small">These are possibilities to weigh. Context decides which fits here; the data does not label the use.</p></section>` : ""}
      <section id="p-occ"><h3>In the New Testament</h3><p class="small">Counting…</p></section>
      <section id="p-lex"><h3>Lexicon</h3><p class="small">Looking up…</p></section>
      <section><h3>My notes on this word</h3>
        <label><span class="small">Notes on ${gk(lemma)}, kept with your account</span>
        <textarea id="p-note" rows="3" disabled placeholder="Loading your notes…"></textarea></label>
        <p class="small" id="p-note-s" role="status"></p></section>
      <section><p class="small">Greek text: SBLGNT. Parsing and sentence analysis: MACULA Greek (Clear Bible). Grammar wording, transliteration: STEPBible (Tyndale House). All CC BY 4.0. Full credits are at the foot of the page.</p></section>
    </div>`;
  el.hidden = false;
  el.scrollTop = 0;
  el.querySelector("[data-close]").onclick = () => ctx.onClose();

  fillLexicon(ctx, my, lemma, strong);
  fillOccurrences(ctx, my, i, lemma);
  fillNotes(ctx, my, lemma, strong);
}

async function fillLexicon(ctx, my, lemma, strong){
  const el = ctx.el;
  let short = null, full = null;
  try { short = strong ? await lexEntry("G" + strong) : null; } catch (e) {}
  try { full = await fullLex(strong); } catch (e) {}
  if (my !== token) return;
  const s = el.querySelector("#p-short"), l = el.querySelector("#p-ltr"), box = el.querySelector("#p-lex");
  if (s) s.textContent = short && short.g ? short.g : "No short gloss in the data";
  if (l && short && short.t) l.textContent = "(" + short.t + ")";
  if (!box) return;
  let h = "<h3>Lexicon</h3>";
  if (short && short.x) h += `<p class="lex">${esc(short.x)}</p><p class="small">Short entry: STEPBible TBESG, shortened from Abbott-Smith.</p>`;
  if (full && full.as) h += `<details><summary>Abbott-Smith, full entry</summary><div class="lex">${full.as}</div></details>`;
  if (full && full.th) h += `<details><summary>Thayer, full entry</summary><div class="lex">${full.th}</div></details>`;
  if (!(short && short.x) && !full) h += `<p class="small">${navigator.onLine ? "No lexicon entry in the data for this word." : "This part of the lexicon isn't saved on this device yet. Connect once and it will be kept."}</p>`;
  else h += CAREFUL_LEXICON.map(x => `<p class="careful"><b>CAREFUL</b> ${esc(x)}</p>`).join("");
  box.innerHTML = h;
}

async function fillOccurrences(ctx, my, i, lemma){
  const el = ctx.el, book = ctx.book;
  let occ = null;
  try { occ = await loadOcc(); } catch (e) {}
  if (my !== token) return;
  const box = el.querySelector("#p-occ");
  if (!box) return;
  const row = occ && occ[lemma];
  if (!row) { box.innerHTML = `<h3>In the New Testament</h3><p class="small">${occ ? "No count in the data for this word." : "The word counts aren't saved on this device yet. Connect once and they will be kept."}</p>`; return; }
  const count = row[0], ids = [];
  let cur = 0;
  for (let k = 1; k < row.length; k++) { cur += row[k]; ids.push(cur); }
  const per = new Map();
  for (const id of ids) { const b = Math.floor(id / 1e6); if (!per.has(b)) per.set(b, []); per.get(b).push([Math.floor(id / 1000) % 1000, id % 1000]); }
  const hereB = NT_CODES.indexOf(book.code), here = book.verseOf(i), mine = per.get(hereB) || [];
  const chip = ([c, v]) => `<li><button type="button" data-c="${c}" data-v="${v}"${c === here.c && v === here.v ? ' class="here" aria-current="true"' : ""}>${c}:${v}</button></li>`;
  const others = [...per.entries()].filter(([b]) => b !== hereB).map(([b, list]) => {
    const name = NT_BOOKS[b][0];
    return hasBook(NT_CODES[b]) ? `<li><button type="button" data-b="${NT_CODES[b]}" data-c="${list[0][0]}" data-v="${list[0][1]}">${esc(name)} ${list.length}</button></li>` : `<li><span>${esc(name)} ${list.length}</span></li>`;
  }).join("");
  box.innerHTML = `<h3>In the New Testament</h3>
    <p>${gk(lemma)} occurs ${count.toLocaleString("en-CA")} ${count === 1 ? "time" : "times"}, in ${ids.length.toLocaleString("en-CA")} ${ids.length === 1 ? "verse" : "verses"}.</p>
    ${mine.length ? `<p class="small">${esc(ctx.bookName)}: ${mine.length} ${mine.length === 1 ? "verse" : "verses"}. Tap one to go there.</p>
      <ul class="occ" id="p-mine">${mine.slice(0, OCC_SHOWN).map(chip).join("")}</ul>
      ${mine.length > OCC_SHOWN ? `<button type="button" class="more" id="p-more">Show all ${mine.length}</button>` : ""}` : ""}
    ${others ? `<p class="small" style="margin-top:8px">Verses in other books${[...per.keys()].some(b => b !== hereB && !hasBook(NT_CODES[b])) ? " (they open once those books are added)" : ""}:</p><ul class="occ">${others}</ul>` : ""}
    <p class="small" style="margin-top:8px">Counted from the SBLGNT by dictionary form (MACULA).</p>`;
  const more = box.querySelector("#p-more");
  if (more) more.onclick = () => { box.querySelector("#p-mine").innerHTML = mine.map(chip).join(""); more.remove(); };
  box.addEventListener("click", e => {
    const b = e.target.closest("button[data-c]");
    if (b) ctx.onJump(b.dataset.b || book.code, +b.dataset.c, +b.dataset.v, lemma);
  });
}

async function fillNotes(ctx, my, lemma, strong){
  const el = ctx.el;
  const got = await ctx.notes.load(lemma, strong);
  if (my !== token) return;
  const ta = el.querySelector("#p-note"), st = el.querySelector("#p-note-s");
  if (!ta) return;
  if (!got.ok) { ta.placeholder = "Your notes can't be reached right now."; st.textContent = "Notes will open again when the connection is back. Nothing has been lost."; return; }
  ta.value = got.text; ta.disabled = false; ta.placeholder = "What you notice about this word";
  let t = 0;
  const save = () => { clearTimeout(t); t = 0; ctx.notes.save(lemma, strong, ta.value, s => { if (my === token) st.textContent = s; }); };
  ta.addEventListener("input", () => { st.textContent = "Saving…"; clearTimeout(t); t = setTimeout(save, 900); });
  ta.addEventListener("blur", () => { if (t) save(); });
}
