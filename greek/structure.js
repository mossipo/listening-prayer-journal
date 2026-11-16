// Greek Study Desk: sentence structure. Everything here is drawn from MACULA Greek's syntax trees (Clear Bible):
// the nesting of clauses and phrases, each part's role, and each group's head word. Nothing is guessed. The only
// written text is the usual sense of connectives (grammar.js, CONNECTIVE), always labelled as usual, not certain.
//
// Views, for each sentence in the passage:
//   1. Clause outline: one line per clause in Greek word order. Main clauses at the margin, clauses that do a job in
//      another clause indented beneath it. Each part of a line is a chip labelled with its role.
//   2. "Who does what": the subject, verb, objects and predicate of each clause, from the roles of its parts.
//   3. Tree: the same analysis as nested groups.
// Plus a "flow of thought" list of the connectives that open each sentence's clauses.
import { PATTERNS, patternsStarting } from "./patterns.js";
import { esc, describe, ROLE_NAME, CLASS_NAME, CONNECTIVE, CONNECTIVE_NOTE, IN_THE_VERB } from "./grammar.js";

const gk = s => `<span lang="el" class="gkin">${esc(s)}</span>`;
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const MAX_INDENT = 6, TREE_INDENT = 8;
const isConj = (book, i) => /^CONJ/.test(book.code_(i));

// The analysis of one sentence: node ids, parents, each word's chain of groups, the clause behind each line.
export class Sentence {
  constructor(book, codes, k){
    this.book = book; this.codes = codes; this.k = k;
    this.tree = book.d.s[k];
    this.a = book.d.ss[k]; this.z = k + 1 < book.d.ss.length ? book.d.ss[k + 1] : book.n;
    this.nodes = []; this.id = new Map(); this.parent = new Map(); this.pathOf = new Map();
    const walk = (nd, path) => {
      this.id.set(nd, this.nodes.length); this.nodes.push(nd);
      const here = [...path, nd];
      for (let c = 1; c < nd.length; c++) {
        const ch = nd[c];
        if (typeof ch === "number") this.pathOf.set(ch, here);
        else { this.parent.set(ch, nd); walk(ch, here); }
      }
    };
    walk(this.tree, []);
    this.depthMemo = new Map();
  }
  cls(nd){ return this.codes.classes[nd[0][0]] || ""; }
  roleOfNode(nd){ return this.codes.roles[nd[0][1]] || ""; }
  roleOf(x){ return typeof x === "number" ? (this.codes.roles[this.book.role(x)] || "") : this.roleOfNode(x); }
  isClause(nd){ return nd === this.tree || this.cls(nd) === "cl"; }
  // MACULA's ClCl rules set a second clause beside the first without naming its role (often a participle clause,
  // such as a genitive absolute). We indent it under the first and say plainly that no role is named.
  attached(nd){
    const g = this.parent.get(nd);
    if (!g || !/^ClCl/.test(this.book.rule(g) || "")) return false;
    const first = g.slice(1).find(ch => typeof ch !== "number" && this.cls(ch) === "cl");
    return first !== nd && !this.roleOfNode(nd);
  }
  clauseOf(i){ const p = this.pathOf.get(i) || [this.tree]; for (let k = p.length - 1; k >= 0; k--) if (this.isClause(p[k])) return p[k]; return this.tree; }
  parentClause(nd){ for (let p = this.parent.get(nd); p; p = this.parent.get(p)) if (this.isClause(p)) return p; return null; }
  // a clause is indented one step for each clause around it that has a job (a role) in a larger clause
  depth(nd){
    if (this.depthMemo.has(nd)) return this.depthMemo.get(nd);
    const pc = this.parentClause(nd);
    const d = pc ? this.depth(pc) + (this.roleOfNode(nd) || this.attached(nd) ? 1 : 0) : 0;
    this.depthMemo.set(nd, d); return d;
  }
  words(nd){ return this.book.wordsOf(nd); }
  // the child of clause cl that holds word i (a group, or the word itself)
  slot(cl, i){ const p = this.pathOf.get(i) || []; const at = p.indexOf(cl); return at >= 0 && at + 1 < p.length ? p[at + 1] : i; }
  // the verb words of a clause (its child with the role verb or linking verb)
  verbOf(cl){
    for (let c = 1; c < cl.length; c++) { const r = this.roleOf(cl[c]); if (r === "v" || r === "vc") return typeof cl[c] === "number" ? [cl[c]] : this.words(cl[c]); }
    return null;
  }
  // the first word of a verb group that is a verb (for its tense and mood)
  mainVerb(ids){ return (ids || []).find(i => /^V-/.test(this.book.code_(i))) ?? (ids ? ids[0] : -1); }
  // a connective tucked inside a part, like γάρ in τῇ γὰρ χάριτι: it stays inside that part's box instead of splitting it
  tucked(cl, i){
    if (!isConj(this.book, i) || i <= this.a || i + 1 >= this.z) return false;
    if (this.clauseOf(i - 1) !== cl || this.clauseOf(i + 1) !== cl) return false;
    const a = this.slot(cl, i - 1), b = this.slot(cl, i + 1);
    return a === b && typeof a !== "number" && this.slot(cl, i) !== a;
  }
  // how many separate runs each part of a clause falls into (a part that other words split falls into two or more)
  runsOf(cl){
    this.runMemo = this.runMemo || new Map();
    if (this.runMemo.has(cl)) return this.runMemo.get(cl);
    const n = new Map(); let prev = null;
    for (let i = this.a; i < this.z; i++) {
      if (this.tucked(cl, i)) continue;
      if (this.clauseOf(i) !== cl) { prev = null; continue; }
      const sl = this.slot(cl, i);
      if (sl !== prev && typeof sl !== "number") n.set(sl, (n.get(sl) || 0) + 1);
      prev = sl;
    }
    this.runMemo.set(cl, n); return n;
  }
  // lines of the outline, in Greek word order
  lines(){
    const out = []; const seen = new Set(); let cur = null;
    for (let i = this.a; i < this.z; i++) {
      let cl = this.clauseOf(i);
      if (cur && cl !== cur.cl && this.tucked(cur.cl, i)) cl = cur.cl;   // γάρ inside τῇ γὰρ χάριτι stays on that line
      if (!cur || cur.cl !== cl) { cur = { cl, depth: this.depth(cl), words: [], cont: seen.has(cl) }; seen.add(cl); out.push(cur); }
      cur.words.push(i);
    }
    // a line that is only a connective ("and", "for") is joined to the start of the next line
    for (let k = out.length - 2; k >= 0; k--) {
      const ln = out[k];
      if (ln.words.every(i => isConj(this.book, i))) { out[k + 1].lead = ln.words.concat(out[k + 1].lead || []); out.splice(k, 1); }
    }
    return out;
  }
}

/* ---------- plain-English pieces ---------- */
function glossOf(book, ids, max = 6){
  const g = ids.map(i => book.gloss(i)).filter(x => x && x !== "-");
  const t = g.slice(0, max).join(" ").replace(/\s+/g, " ").trim();
  return t ? (g.length > max ? t + " …" : t) : "";
}
function phraseHTML(book, ids, max = 7){
  const g = glossOf(book, ids, max);
  return `${gk(book.phrase(ids, max))}${g ? ` <span class="q">“${esc(g)}”</span>` : ""}`;
}
function verbKind(S, cl){
  const v = S.verbOf(cl); if (!v) return "";
  const d = describe(S.codes, S.book.code_(S.mainVerb(v)));
  const m = d ? String(d.f.Mood || d.f.Form || "").toLowerCase() : "";
  return m === "participle" || m === "infinitive" ? m : "";
}
// The label on the first line of a clause
function clauseLabel(S, cl, first){
  if (!first) return { t: "continues", sub: "" };
  if (cl === S.tree && S.cls(cl) !== "cl") return { t: "", sub: "" };
  const r = S.roleOfNode(cl), kind = verbKind(S, cl);
  const flags = cl[0][4] || 0, f = S.codes.flags;
  const noVerb = flags & f.verbless ? "no verb stated" : flags & f.elided ? "verb understood from nearby" : "";
  if (!r && S.attached(cl)) {
    const pc = S.parentClause(cl), pv = pc ? S.verbOf(pc) : null;
    const prev = S.parent.get(cl).slice(1).find(ch => typeof ch !== "number" && S.cls(ch) === "cl"), first = prev ? S.verbOf(prev) : pv;
    return { t: "Attached clause", sub: [kind, noVerb, first ? `set beside ${gk(S.book.phrase(first, 4))}; MACULA names no role` : "MACULA names no role"].filter(Boolean).join(" · ") };
  }
  if (!r) {
    const pc = S.parentClause(cl);
    // top level clauses are main clauses, even when MACULA joins two of them (καί, ἀλλά); deeper ones are joined inside a larger clause
    const top = S.depth(cl) === 0;
    return { t: top ? "Main clause" : "Joined clause", sub: [kind, noVerb, top || !pc ? "" : "joined to the clause around it"].filter(Boolean).join(" · ") };
  }
  const pc = S.parentClause(cl), pv = pc ? S.verbOf(pc) : null, target = pv ? gk(S.book.phrase(pv, 4)) : "";
  const name = { s: "Subject", o: "Object", o2: "Second object", io: "Indirect object", p: "Predicate", adv: "Adverbial", v: "Verb", vc: "Linking verb", aux: "Auxiliary" }[r] || cap(ROLE_NAME[r] || r);
  let rel = "";
  if (target) rel = r === "adv" ? `tells more about ${target}` : r === "p" ? `predicate with ${target}` : `${ROLE_NAME[r] || r} of ${target}`;
  return { t: `${name} clause`, sub: [kind, noVerb, rel].filter(Boolean).join(" · ") };
}
// "Who does what" for a clause, from the roles of its own parts
function whoDoesWhat(S, cl){
  if (!S.isClause(cl) || (cl === S.tree && S.cls(cl) !== "cl")) return "";
  const book = S.book, parts = [], adv = [];
  let hasS = false, verbIds = null;
  for (let c = 1; c < cl.length; c++) {
    const ch = cl[c], r = S.roleOf(ch);
    if (!r) continue;
    const ids = typeof ch === "number" ? [ch] : S.words(ch);
    const isCl = typeof ch !== "number" && S.cls(ch) === "cl";
    const text = isCl ? `${gk(book.phrase(ids, 4))} <span class="q">(a clause, shown on its own line)</span>` : phraseHTML(book, ids);
    if (r === "adv") { adv.push(text); continue; }
    if (r === "s") hasS = true;
    if (r === "v" || r === "vc") {
      verbIds = ids;
      const d = describe(S.codes, book.code_(S.mainVerb(ids)));
      const how = d ? d.parts.slice(1).filter(x => !/person|singular|plural/.test(x) || /participle|infinitive/.test(x)).join(" ") : "";
      parts.push([r === "vc" ? "Linking verb" : "Verb", text + (how ? ` <span class="small">(${esc(how)})</span>` : "")]);
      continue;
    }
    parts.push([cap(ROLE_NAME[r] || r), text]);
  }
  if (!hasS && verbIds) {
    const vi = S.mainVerb(verbIds), sr = book.d.sr[vi];
    const d = describe(S.codes, book.code_(vi));
    // the person in the verb first; then MACULA's link, one item per referent (it can name several, far apart: "we" = Paul + the believers)
    const inVerb = d && d.person ? `<span class="q">in the verb: ${esc(IN_THE_VERB[`${d.person} ${(d.f.Number || "").toLowerCase()}`] || d.person + " person")}</span>` : "";
    let link = "";
    if (sr && sr.length) {
      const runs = [];
      [...sr].sort((x, y) => x - y).forEach(i => { const r = runs[runs.length - 1]; if (r && i - r[r.length - 1] <= 1) r.push(i); else runs.push([i]); });
      const at = r => { const v = book.verseOf(r[0]); return ` <span class="small">(${v.c}:${v.v})</span>`; };
      link = `<span class="small">MACULA links this to ${runs.slice(0, 4).map(r => gk(book.phrase(r, 4)) + at(r)).join(", ")}${runs.length > 4 ? " …" : ""}</span>`;
    }
    if (inVerb || link) parts.unshift(["Subject", [inVerb || `<span class="q">not stated here</span>`, link].filter(Boolean).join(" · ")]);
  }
  if (adv.length) parts.push([adv.length === 1 ? "Adverbial" : `Adverbials (${adv.length})`, adv.join("; ")]);
  if (!parts.length) return "";
  return `<p class="wdw">${parts.map(([k, x]) => `<span class="wdw-i"><b>${esc(k)}:</b> ${x}</span>`).join("")}</p>`;
}

/* ---------- rendering ---------- */
const ROLE_LABEL = { s: "Subject", v: "Verb", vc: "Linking verb", o: "Object", o2: "2nd object", io: "Indirect obj.", p: "Predicate", adv: "Adverbial", aux: "Auxiliary" };

function wordBtn(book, i, starts){
  const g = book.gloss(i), vs = starts.get(i);
  return `${vs ? `<sup class="vref" aria-label="Verse ${vs}">${vs}</sup>` : ""}<button type="button" class="w" data-i="${i}" aria-pressed="false"><span class="g" lang="el">${esc(book.before(i) + book.form(i) + book.after(i))}</span>${tlSpan(book, i)}${glossSpan(g)}</button>`;
}
// the word in English letters, in brackets (STEPBible's transliteration); hidden when "English letters" is off
export const tlSpan = (book, i) => { const t = book.translit(i); return t ? `<span class="tl" lang="el-Latn">(${esc(t)})</span>` : ""; };
// a word with no English of its own shows "-"; VoiceOver should not read "hyphen"
export const glossSpan = g => !g ? `<span class="gl" lang="en">&nbsp;</span>` : g === "-" ? `<span class="gl" lang="en" aria-hidden="true">-</span>` : `<span class="gl" lang="en">${esc(g)}</span>`;
function lineHTML(S, ln, starts){
  const book = S.book;
  const lab = clauseLabel(S, ln.cl, !ln.cont);
  let chips = "";
  if (ln.lead && ln.lead.length) chips += connChip(book, ln.lead, starts);
  let run = [], runSlot = null;
  const runs = S.runsOf(ln.cl), seenRuns = S.seenRuns = S.seenRuns || new Map();
  const flush = () => {
    if (!run.length) return;
    const r = typeof runSlot === "number" ? S.roleOf(runSlot) : S.roleOfNode(runSlot);
    const id = typeof runSlot === "number" ? "" : S.id.get(runSlot);
    // a part split by other words: "Object …" on its first piece, "… Object" on the rest
    const total = typeof runSlot === "number" ? 1 : runs.get(runSlot) || 1, nth = (seenRuns.get(runSlot) || 0) + 1;
    if (total > 1) seenRuns.set(runSlot, nth);
    const name = esc(ROLE_LABEL[r] || r), lbl = total > 1 ? (nth === 1 ? `${name} …` : `… ${name}`) : name;
    const tip = total > 1 ? "This part is split by other words; tap to see all of it" : "What is this part?";
    if (!r && run.every(i => isConj(book, i))) chips += connChip(book, run, starts);
    else chips += `<span class="chip${r ? " r-" + r : ""}${total > 1 ? " split" : ""}">${r ? `<button type="button" class="chip-l" ${id !== "" ? `data-n="${id}"` : `data-wi="${run[0]}"`} title="${tip}">${lbl}</button>` : ""}<span class="cw">${run.map(i => S.tucked(ln.cl, i) ? `<span class="tuck" title="A connective set inside this part">${wordBtn(book, i, starts)}</span>` : wordBtn(book, i, starts)).join("")}</span></span>`;
    run = [];
  };
  for (const i of ln.words) {
    if (run.length && S.tucked(ln.cl, i)) { run.push(i); continue; }
    const sl = S.slot(ln.cl, i);
    if (run.length && sl !== runSlot) flush();
    runSlot = sl; run.push(i);
  }
  flush();
  const indent = Math.min(ln.depth, MAX_INDENT);
  return `<div class="ln${ln.cont ? " cont" : ""}" style="--d:${indent}" data-c="${S.id.get(ln.cl)}">
    <div class="ln-l">${lab.t ? `<button type="button" class="ln-t" data-n="${S.id.get(ln.cl)}">${esc(lab.t)}</button>` : ""}${ln.depth > MAX_INDENT ? `<span class="deep">level ${ln.depth}</span>` : ""}${lab.sub ? `<span class="ln-s">${lab.sub}</span>` : ""}</div>
    <div class="ln-b">${chips}${patternsStarting(book, ln.words).map(x => `<button type="button" class="ptag" data-pattern="${x.k}" title="${esc(PATTERNS[x.p[0]].short)}">Pattern: ${esc(PATTERNS[x.p[0]].name)}</button>`).join("")}</div>
    ${!ln.cont ? `<div class="ln-w">${whoDoesWhat(S, ln.cl)}</div>` : ""}</div>`;
}
function connChip(book, ids, starts){
  const sense = ids.map(i => CONNECTIVE[book.lemma(i)]).filter(Boolean)[0];
  return `<span class="chip conn"><span class="chip-l" aria-hidden="true">Connective</span><span class="cw">${ids.map(i => wordBtn(book, i, starts)).join("")}</span>${sense ? `<span class="sense">${esc(sense)}</span>` : ""}</span>`;
}
function treeHTML(S){
  const book = S.book;
  const node = (nd, depth) => {
    const cls = CLASS_NAME[S.cls(nd)] || (nd === S.tree ? "sentence" : "group"), r = S.roleOfNode(nd);
    const ids = S.words(nd);
    const kids = nd.slice(1).map(ch => typeof ch === "number"
      ? `<li class="tleaf"><button type="button" class="tw" data-i="${ch}" lang="el">${esc(book.form(ch))}</button> <span class="q">${esc(book.gloss(ch) || "")}</span>${S.roleOf(ch) ? ` <span class="tag r-${S.roleOf(ch)}">${esc(ROLE_LABEL[S.roleOf(ch)] || "")}</span>` : ""}</li>`
      : node(ch, depth + 1)).join("");
    return `<li><details${depth < 3 ? " open" : ""}><summary>${depth >= TREE_INDENT ? `<span class="deep">level ${depth}</span> ` : ""}<span class="tn">${esc(cap(cls))}</span>${r ? ` <span class="tag r-${r}">${esc(ROLE_LABEL[r] || r)}</span>` : ""} <span class="small" lang="el">${esc(book.phrase(ids, 5))}</span></summary><ul${depth + 1 >= TREE_INDENT ? ' class="flat"' : ""}>${kids}</ul></details></li>`;
  };
  const html = node(S.tree, 0);
  // past TREE_INDENT levels the lists stop indenting (Luke's genealogy nests 150 deep); the level is written instead
  return `<ul class="tree">${html}</ul>`;
}

// The structure view for a passage: one block per sentence that has words in the passage
export function structureHTML(book, codes, verses, bookName, english){
  if (!verses.length) return "";
  const a = verses[0].a, z = verses[verses.length - 1].z;
  const starts = new Map();
  for (const v of verses) starts.set(v.a, `${v.c}:${v.v}`);
  // verse starts inside sentences that run outside the passage
  const s1 = book.sentenceIndex(a), s2 = book.sentenceIndex(z - 1);
  for (let k = 0; k < book.vcount; k++) { const v = book.verseAt(k); if (v.a >= book.d.ss[s1] && v.a < (s2 + 1 < book.d.ss.length ? book.d.ss[s2 + 1] : book.n)) starts.set(v.a, `${v.c}:${v.v}`); }
  let flow = "", body = "";
  for (let k = s1; k <= s2; k++) {
    const S = new Sentence(book, codes, k);
    const lines = S.lines();
    const v1 = book.verseOf(S.a), v2 = book.verseOf(S.z - 1);
    const ref = v1.c === v2.c && v1.v === v2.v ? `${v1.c}:${v1.v}` : v1.c === v2.c ? `${v1.c}:${v1.v}-${v2.v}` : `${v1.c}:${v1.v}-${v2.c}:${v2.v}`;
    const out = S.a < a || S.z > z;
    // connectives that open this sentence's lines
    const conns = [];
    for (const ln of lines) for (const i of (ln.lead || []).concat(ln.words.slice(0, 2).filter(i => isConj(book, i)))) if (!conns.includes(i)) conns.push(i);
    flow += `<li><a href="#s${k}">${esc(ref)}</a> ${gk(book.phrase(Array.from({ length: Math.min(5, S.z - S.a) }, (_, x) => S.a + x), 5))}${conns.length ? `<span class="fc">${conns.slice(0, 4).map(i => `${gk(book.form(i))}${CONNECTIVE[book.lemma(i)] ? ` <span class="q">${esc(CONNECTIVE[book.lemma(i)].split(":")[0])}</span>` : ""}`).join(" · ")}</span>` : ""}</li>`;
    body += `<section class="sent" id="s${k}" data-k="${k}">
      <h2 class="sent-h">${esc(bookName)} ${esc(ref)}${out ? ' <span class="small">(the sentence runs past the verses you chose)</span>' : ""}<span class="sent-n">${S.z - S.a} words</span></h2>${book.d.nx && book.d.nx.verses.some(([c, v]) => { const x = book.verseOf(S.a); return x.c === c && x.v === v; }) ? `<p class="nxnote">${esc(book.d.nx.note)}</p>` : ""}
      <div class="outline">${lines.map(ln => lineHTML(S, ln, starts)).join("")}</div>
      ${english ? englishFor(book, english, S) : ""}
      <details class="treebox" data-k="${k}"><summary>Tree view</summary></details>
    </section>`;
  }
  return `<div class="struct">
    <div class="snote"><b>Sentence structure from MACULA Greek</b> (Clear Bible). It is one careful scholarly analysis; other readings of some constructions exist. Where a point matters for preaching, weigh it with the commentaries.</div>
    <details class="flow"${s2 - s1 < 12 ? " open" : ""}><summary>Flow of thought (${s2 - s1 + 1} ${s2 === s1 ? "sentence" : "sentences"})</summary><ol>${flow}</ol><p class="small">${esc(CONNECTIVE_NOTE)}</p></details>
    <div class="legend" aria-hidden="true"><span class="chip r-s"><span class="chip-l">Subject</span></span><span class="chip r-v"><span class="chip-l">Verb</span></span><span class="chip r-o"><span class="chip-l">Object</span></span><span class="chip r-p"><span class="chip-l">Predicate</span></span><span class="chip r-adv"><span class="chip-l">Adverbial</span></span><span class="small">Tap a label to see that part. Tap a word for its parsing.</span></div>
    ${body}</div>`;
}

// The BSB English of the verses a sentence touches (the English sentence may start or end elsewhere)
function englishFor(book, english, S){
  const k1 = book.verseIndex(S.a), k2 = book.verseIndex(S.z - 1);
  let h = "";
  for (let k = k1; k <= k2; k++) { const v = book.verseAt(k), t = english.get(v.c + ":" + v.v); if (t) h += `<span class="bn">${v.v}</span>${esc(t)} `; }
  return h ? `<p class="en" lang="en">${h.trim()}</p>` : "";
}

/* ---------- the group panel: tap a role label or a clause label ---------- */
// The tree for one sentence, built only when its "Tree view" is opened (a whole chapter's trees would double the page)
export function treeFor(book, codes, k){ return treeHTML(new Sentence(book, codes, k)); }

export function groupInfo(book, codes, k, nodeId){
  const S = new Sentence(book, codes, k);
  const nd = S.nodes[nodeId];
  if (!nd) return null;
  const ids = S.words(nd), head = nd[0][3], r = S.roleOfNode(nd), cls = S.cls(nd);
  const isCl = S.isClause(nd);
  const lines = [];
  const name = isCl ? (r ? `${cap(ROLE_NAME[r] || r)} clause` : nd === S.tree ? "Sentence" : "Clause") : `${cap(CLASS_NAME[cls] || "group")}${r ? `, ${ROLE_NAME[r] || r}` : ""}`;
  const pc = S.parentClause(nd), pv = pc ? S.verbOf(pc) : null;
  if (r && pv && !(isCl && nd === S.tree)) {
    const target = gk(book.phrase(pv, 4));
    lines.push(r === "adv" ? `It tells more about ${target}: when, where, how, why or under what circumstances.`
      : r === "s" ? `It is the subject of ${target}.` : r === "o" || r === "o2" ? `It is the ${ROLE_NAME[r]} of ${target}.` : r === "io" ? `It is the indirect object of ${target}: to or for whom.`
      : r === "p" ? `It is the predicate: what the subject is said to be, joined by ${target}.` : r === "v" || r === "vc" ? `It is the ${ROLE_NAME[r]} of its clause.` : `Its role: ${ROLE_NAME[r] || r}.`);
  }
  if (head >= 0 && ids.length > 1) lines.push(`Head word: ${gk(book.form(head))}${book.gloss(head) ? ` <span class="q">“${esc(book.gloss(head))}”</span>` : ""}. The other words depend on it.`);
  const f = nd[0][4] || 0, F = codes.flags;
  if (f & F.articular) lines.push("It has the article.");
  if (f & F.apposition) lines.push("It stands in apposition: it renames or explains the word beside it.");
  if (f & F.nominalized) lines.push("A clause used like a noun.");
  if (f & F.verbless) lines.push("No verb is stated in this clause; English supplies one (often “is”).");
  if (f & F.elided) lines.push("Its verb is understood from a nearby clause.");
  if (book.rule(nd) === "BeVerb") lines.push(`MACULA treats these words as one verb: a form of ${gk("εἰμί")} with a participle.`);
  const kids = nd.slice(1).map(ch => {
    const cr = S.roleOf(ch), w = typeof ch === "number" ? [ch] : S.words(ch);
    const what = typeof ch === "number" ? "word" : (S.cls(ch) === "cl" ? "clause" : CLASS_NAME[S.cls(ch)] || "group");
    return `<li><span class="tag${cr ? " r-" + cr : ""}">${esc(cr ? ROLE_LABEL[cr] || cr : what)}</span> ${phraseHTML(book, w, 6)}${typeof ch !== "number" && cr ? ` <span class="small">(${esc(what)})</span>` : ""}</li>`;
  }).join("");
  const chain = []; for (let p = S.parent.get(nd); p; p = S.parent.get(p)) { const pr = S.roleOfNode(p); if (S.isClause(p) && p !== S.tree) chain.push(pr ? `${ROLE_NAME[pr] || pr} clause` : "clause"); }
  return { ids, head, html: `
    <div class="ph"><div class="pw"><h2 class="big">${esc(name)}</h2><p class="tr" lang="el">${esc(book.phrase(ids, 12))}</p></div><button type="button" class="x" data-close aria-label="Close">×</button></div>
    <div class="pb">
      <section><h3>What it does</h3>${lines.map(x => `<p>${x}</p>`).join("") || "<p>MACULA gives this group no role label of its own.</p>"}
        ${glossOf(book, ids, 30) ? `<p class="small">Word by word: “${esc(glossOf(book, ids, 30))}”</p>` : ""}</section>
      <section><h3>Its parts</h3><ul class="parts">${kids}</ul></section>
      ${chain.length ? `<section><h3>Where it sits</h3><p>Inside ${chain.map(esc).join(", inside ")}.</p></section>` : ""}
      <section><p class="small">From MACULA Greek's analysis${book.rule(nd) ? ` (rule ${esc(book.rule(nd))})` : ""}, one scholarly reading. Other readings of some constructions exist.</p></section>
    </div>` };
}
