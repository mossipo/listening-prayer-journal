// Akouō Plus, Greek Study Desk: named grammar patterns. Which words form a pattern is decided when the data is built
// (tools/greek/patterns.py, from MACULA's codes and sentence trees) and stored in each book as `pt`:
// [[id, [word numbers], extra], ...]. This file only names them, explains them and shows the evidence.
// The five approved by Barry (2026-11-16). The genitive absolute and εἰ conditions wait for his review.
import { esc } from "./grammar.js";

const gk = s => `<span lang="el">${esc(s)}</span>`;

// what the preposition usually signals with the article and an infinitive
const ARTINF = { "ἐν": "while, when", "μετά": "after", "πρό": "before", "διά": "because", "εἰς": "so that, in order to (sometimes result)",
  "πρός": "so that, in order to", "ἕνεκα": "for the sake of", "ἀντί": "instead of", "ἕως": "until", "ἐκ": "from", "ἐπί": "on the basis of, for" };

export const PATTERNS = {
  peri: {
    name: "Periphrastic", short: "a form of εἰμί with a participle, working as one verb",
    evidence: (b, p) => {
      const be = p[1].filter(i => b.lemma(i) === "εἰμί"), pt = p[1].filter(i => b.lemma(i) !== "εἰμί");
      return `${be.map(i => gk(b.form(i))).join(" ")} (from εἰμί) with the participle ${pt.map(i => gk(b.form(i))).join(" ")}. MACULA analyses the two as one verb.`;
    },
    lesson: { title: "Periphrastic: \"to be\" with a participle",
      body: [
        "Sometimes Greek says \"was teaching\" with two words, a form of εἰμί (\"to be\") and a participle, instead of one verb form. Together they work as one verb.",
        "A past form of εἰμί with a present participle usually stresses an action going on in the past: ἦν διδάσκων, \"he was teaching\". A present form of εἰμί with a perfect participle stresses a settled state: χάριτί ἐστε σεσῳσμένοι, \"by grace you have been saved\" (Ephesians 2:8).",
        "Read the pair together, and let the participle's tense tell you how the action is viewed."
      ],
      careful: "Not every participle next to εἰμί is periphrastic, and some cases are debated (John 1:9). These tags follow MACULA's analysis." } },
  oume: {
    name: "οὐ μή, emphatic negation", short: "the strongest \"never\" in Greek",
    evidence: (b, p) => {
      const v = p[1][2], c = b.code_(v);
      return `${gk(b.form(p[1][0]))} ${gk(b.form(p[1][1]))} with the ${/^V-\d?F/.test(c) ? "future indicative" : "aorist subjunctive"} ${gk(b.form(v))}.`;
    },
    lesson: { title: "οὐ μή: the strongest \"never\"",
      body: [
        "Greek has two words for \"not\". Put together, οὐ μή with an aorist subjunctive (or a future indicative) is the most emphatic way to say something will not happen: \"never\", \"by no means\", \"certainly not\".",
        "Many of Jesus' promises use it: \"whoever comes to me will never hunger\" (John 6:35), \"I will never cast out\" (John 6:37), and \"I will never leave you\" (Hebrews 13:5)."
      ],
      careful: "The subjunctive here does not mean uncertainty. It is simply the form this construction takes; the force comes from the doubled negative." } },
  artinf: {
    name: "Preposition, article and infinitive", short: "a whole clause in a few words",
    evidence: (b, p) => {
      const sense = ARTINF[p[2]];
      return `${gk(b.form(p[1][0]))} with the article ${gk(b.form(p[1][1]))} and the infinitive ${gk(b.form(p[1][2]))}${sense ? `. With ${gk(p[2])} this usually means "${esc(sense)}".` : "."}`;
    },
    lesson: { title: "Preposition, article and infinitive",
      body: [
        "A preposition with the article and an infinitive does the work of a whole clause in a few words. The preposition gives the meaning.",
        "ἐν τῷ + infinitive: \"while\" or \"when\" (ἐν τῷ συμπληροῦσθαι τὴν ἡμέραν τῆς πεντηκοστῆς, \"when the day of Pentecost had fully come\", Acts 2:1). μετὰ τό: \"after\". πρὸ τοῦ: \"before\". διὰ τό: \"because\". εἰς τό and πρὸς τό: \"so that\", \"in order to\".",
        "If the infinitive has its own subject, it is in the accusative."
      ],
      careful: "εἰς τό can show purpose (\"in order to\") or result (\"so that\"). Context decides, and translations sometimes differ." } },
  ean: {
    name: "ἐάν with the subjunctive", short: "a condition looking ahead: \"if\", or with μή \"unless\"",
    evidence: (b, p) => {
      const mh = p[1][0] + 1 < b.n && b.lemma(p[1][0] + 1) === "μή";
      return `${gk(b.form(p[1][0]))}${mh ? ` ${gk(b.form(p[1][0] + 1))}` : ""} with the subjunctive ${gk(b.form(p[1][1]))}${mh ? `. ἐὰν μή means "unless".` : "."}`;
    },
    lesson: { title: "ἐάν with the subjunctive: \"if\" looking ahead",
      body: [
        "ἐάν with a subjunctive introduces a condition about what may happen: \"if\", sometimes \"whenever\". The rest of the sentence says what follows. Grammars call this a third class condition.",
        "ἐὰν μή means \"unless\": ἐὰν μή τις γεννηθῇ ἄνωθεν, \"unless someone is born again\" (John 3:3).",
        "Watch for it in promises and warnings: \"if we confess our sins, he is faithful\" (1 John 1:9)."
      ],
      careful: "This \"if\" does not say how likely something is. The subjunctive simply goes with ἐάν; 1 John 1:9 is a promise, not a doubt." } },
  accsubj: {
    name: "Accusative subject of an infinitive", short: "the one doing the action is in the accusative",
    evidence: (b, p) => {
      const inf = p[1].find(i => /^V-\w+N$/.test(b.code_(i))), subj = p[1].filter(i => i !== inf);
      return `${subj.map(i => gk(b.form(i))).join(" ")} (accusative) is the subject of the infinitive ${gk(b.form(inf))} in MACULA's analysis, so read it as the one doing the action.`;
    },
    lesson: { title: "The subject of an infinitive is accusative",
      body: [
        "When an infinitive has its own subject, that subject goes in the accusative case, so it can look like an object at first.",
        "John 3:30: ἐκεῖνον δεῖ αὐξάνειν, ἐμὲ δὲ ἐλαττοῦσθαι, \"He must increase, but I must decrease.\" ἐκεῖνον and ἐμέ are accusative, yet they are the ones increasing and decreasing.",
        "You will see it often after δεῖ (\"it is necessary\"), after ὥστε (\"so that\"), and after verbs of saying and thinking."
      ],
      careful: "When an infinitive has an accusative subject and an accusative object, word order and context decide which is which. The tag follows MACULA's analysis." } }
};
export const PATTERN_IDS = Object.keys(PATTERNS);

// patterns that include word i, or that start within a set of words: [{ k, p }] where k is the index into book.d.pt
export function patternsWith(book, i){ return (book.d.pt || []).map((p, k) => ({ k, p })).filter(x => PATTERNS[x.p[0]] && x.p[1].includes(i)); }
export function patternsStarting(book, words){
  const set = new Set(words);
  return (book.d.pt || []).map((p, k) => ({ k, p })).filter(x => PATTERNS[x.p[0]] && set.has(Math.min(...x.p[1])));
}
export function patternsIn(book, a, z){ return (book.d.pt || []).map((p, k) => ({ k, p })).filter(x => PATTERNS[x.p[0]] && x.p[1][0] >= a && x.p[1][0] < z); }
export const phraseOf = (book, p) => { const a = Math.min(...p[1]), z = Math.max(...p[1]); return book.phrase(Array.from({ length: z - a + 1 }, (_, j) => a + j), 12); };

// The panel for one pattern: { ids, html }
export function patternInfo(book, k){
  const p = (book.d.pt || [])[k], P = p && PATTERNS[p[0]];
  if (!P) return null;
  const v = book.verseOf(p[1][0]);
  return { ids: p[1], html: `
    <div class="ph"><div class="pw"><p class="pt-badge">Pattern</p><h2 class="big">${esc(P.name)}</h2><p class="tr" lang="el">${esc(phraseOf(book, p))}</p></div><button type="button" class="x" data-close aria-label="Close">×</button></div>
    <div class="pb">
      <section><h3>What it is</h3><p>${esc(P.short[0].toUpperCase() + P.short.slice(1))}.</p></section>
      <section><h3>The evidence here</h3><p>${P.evidence(book, p)}</p><p class="small">Verse ${v.c}:${v.v}. The highlighted words are the ones the pattern is built from.</p></section>
      <section><h3>How to read it</h3>${P.lesson.body.map(x => `<p>${esc(x)}</p>`).join("")}${P.lesson.careful ? `<p class="careful"><b>CAREFUL</b> ${esc(P.lesson.careful)}</p>` : ""}</section>
      <section><p class="small">Found from MACULA Greek's parsing and sentence analysis by Akouō's pattern tests. Explanations written for Akouō.</p></section>
    </div>` };
}
