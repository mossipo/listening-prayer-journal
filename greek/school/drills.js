// Akouō Greek School: grammar exercises for Levels 1 and up, built from real words. Words to parse come from John's
// Gospel (SBLGNT, parsed by MACULA); verb forms to translate and the "In the New Testament" column come from every
// form in the New Testament (bible/greek/forms.json). Nothing is invented: a form is only asked about if the data has it,
// and an answer is only marked wrong if no reading of that spelling in the New Testament supports it.
import { describe, esc } from "../grammar.js";

const gk = s => `<span lang="el">${esc(s)}</span>`;
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const shuffle = a => { const b = a.slice(); for (let k = b.length - 1; k > 0; k--) { const j = rnd(k + 1); [b[k], b[j]] = [b[j], b[k]]; } return b; };
const uniq = a => [...new Set(a)];
// the same spelling as the data stores it: grave accent as acute, small letters for ordinary words
export const normForm = (f, lemma) => { let s = f.normalize("NFD").replace(/̀/g, "́").normalize("NFC").replace(/[,.;·’ʼ()]/g, ""); return lemma && lemma[0] === lemma[0].toLowerCase() ? s.toLowerCase() : s; };

const CASES = ["Nominative", "Genitive", "Dative", "Accusative"], NUMS = ["Singular", "Plural"], GENS = ["Masculine", "Feminine", "Neuter"];
const PN = [["1st", "Singular"], ["2nd", "Singular"], ["3rd", "Singular"], ["1st", "Plural"], ["2nd", "Plural"], ["3rd", "Plural"]];
const pnLabel = (p, n) => `${p} person ${n.toLowerCase()}`;
const MP = new Set(["Middle", "Passive", "Middle or Passive", "Middle or Passive Deponent", "Middle Deponent", "Passive Deponent"]);
// endings are tested without accents or breathings, so θεός counts as -ος and φωνή as -η
const bare = l => l.normalize("NFD").replace(/[\u0300-\u0344]/g, "").normalize("NFC");
const regW = l => /ω$/.test(bare(l)) && !/(εω|αω|οω)$/.test(bare(l)) && !/μι$/.test(bare(l));
const contract = l => /(εω|αω|οω)$/.test(bare(l));
const LIQUID = new Set(["κρίνω", "μένω", "ἀποστέλλω", "αἴρω", "ἀποκτείνω", "σπείρω", "ἐγείρω", "ἀπαγγέλλω", "φαίνω"]);
const MI = new Set(["δίδωμι", "παραδίδωμι", "ἀποδίδωμι", "τίθημι", "ἀφίημι", "ἵστημι", "ἀνίστημι", "ἀπόλλυμι", "δείκνυμι"]);
const dep = l => /ομαι$/.test(bare(l));
const SUBJ = ["I", "you", "he/she/it", "we", "you (plural)", "they"], BE = ["am", "are", "is", "are", "are", "are"], WAS = ["was", "were", "was", "were", "were", "were"];
const BASE_VERBS = [["λέγω", ["say", "says", "said", "saying", "said"]]];

// john: the book the words come from (John by default; a reading lesson passes its own book and name)
export function makeDrills({ john, codes, FD, ALL, choice, name = "John" }){
  // a reading lesson works inside one passage: [first word, word after the last]
  let range = [0, john.n];
  const inRange = i => i >= range[0] && i < range[1];
  const dcache = new Map();
  const D = i => { if (!dcache.has(i)) dcache.set(i, describe(codes, john.code_(i))); return dcache.get(i); };
  const dc = code => describe(codes, code);
  const L = i => john.lemma(i);
  const F = d => (d && d.f) || {};
  const ind = d => F(d).Function === "Verb" && F(d).Mood === "Indicative";
  const tense = d => (F(d).Tense || "").replace(/^2nd /, "");
  const named = l => l[0] !== l[0].toLowerCase();
  // an aorist like ἀπεκρίθη is passive in form though the data calls it a middle deponent; the lessons leave these out
  const thetaDep = (d, form) => tense(d) === "Aorist" && /Deponent/.test(F(d).Voice || "") && /θ[ηε]/.test(form.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

  // what kind of word: tests on a word number i in John
  const FILTER = {
    pai: i => { const d = D(i); return ind(d) && F(d).Tense === "Present" && F(d).Voice === "Active" && regW(L(i)) && L(i) !== "εἰμί"; },
    n2: i => { const d = D(i); return F(d).Function === "Noun" && !named(L(i)) && /(ος|ον)$/.test(bare(L(i))) && !(F(d).Gender === "Neuter" && /ος$/.test(bare(L(i)))) && F(d).Case !== "Vocative"; },
    n2gen: i => FILTER.n2(i) && F(D(i)).Case === "Genitive",
    n1f: i => { const d = D(i); return F(d).Function === "Noun" && !named(L(i)) && L(i) !== "γυνή" && F(d).Gender === "Feminine" && /(η|α)$/.test(bare(L(i))) && F(d).Case !== "Vocative"; },
    art: i => F(D(i)).Function === "Definite article",
    adj2: i => F(D(i)).Function === "Adjective" && /ος$/.test(bare(L(i))) && !!F(D(i)).Case,
    n1m: i => { const d = D(i); return F(d).Function === "Noun" && !named(L(i)) && F(d).Gender === "Masculine" && /ης$/.test(bare(L(i))) && F(d).Case !== "Vocative"; },
    prep: i => F(D(i)).Function === "Preposition",
    pron12: i => (L(i) === "ἐγώ" || L(i) === "σύ") && !!F(D(i)).Case && !!F(D(i)).Number,
    eimi: i => L(i) === "εἰμί" && ind(D(i)) && F(D(i)).Tense === "Present",
    demo: i => (L(i) === "οὗτος" || L(i) === "ἐκεῖνος") && !!F(D(i)).Case && !!F(D(i)).Gender,
    autos: i => L(i) === "αὐτός" && !!F(D(i)).Case && !!F(D(i)).Gender,
    pmpi: i => { const d = D(i); return ind(d) && F(d).Tense === "Present" && MP.has(F(d).Voice) && (regW(L(i)) || dep(L(i))); },
    iai: i => { const d = D(i); return ind(d) && F(d).Tense === "Imperfect" && F(d).Voice === "Active" && (regW(L(i)) || L(i) === "εἰμί"); },
    impi: i => { const d = D(i); return ind(d) && F(d).Tense === "Imperfect" && MP.has(F(d).Voice) && (regW(L(i)) || dep(L(i))); },
    fi: i => { const d = D(i); return ind(d) && tense(d) === "Future" && ["Active", "Middle", "Middle Deponent"].includes(F(d).Voice); },
    aai1: i => { const d = D(i); return ind(d) && F(d).Tense === "Aorist" && ["Active", "Middle", "Middle Deponent"].includes(F(d).Voice) && !thetaDep(d, john.form(i)); },
    aai2: i => { const d = D(i); return ind(d) && F(d).Tense === "2nd Aorist" && ["Active", "Middle", "Middle Deponent"].includes(F(d).Voice) && !thetaDep(d, john.form(i)); },
    api: i => { const d = D(i); return ind(d) && ["Aorist", "Future"].includes(tense(d)) && ["Passive", "Passive Deponent"].includes(F(d).Voice); },
    // Levels 3 and 4
    n3: i => { const d = D(i), l = bare(L(i)); return F(d).Function === "Noun" && !named(l) && F(d).Case && F(d).Case !== "Vocative" && (!/(ος|ον|η|α|ης|ας)$/.test(l) || (F(d).Gender === "Neuter" && /(μα|ος)$/.test(l)) || L(i) === "γυνή") && !(/ος$/.test(l) && F(d).Gender !== "Neuter"); },
    n3b: i => { const d = D(i), l = bare(L(i)); return FILTER.n3(i) && (/(ις|ευς)$/.test(l) || (F(d).Gender === "Neuter" && /ος$/.test(l))); },
    part: i => F(D(i)).Form === "Participle" && !!F(D(i)).Case && !!F(D(i)).Gender && !thetaDep(D(i), john.form(i)),
    ppart: i => FILTER.part(i) && F(D(i)).Tense === "Present",
    apart: i => FILTER.part(i) && tense(D(i)) === "Aorist" && ["Active", "Middle", "Middle Deponent"].includes(F(D(i)).Voice),
    appart: i => FILTER.part(i) && tense(D(i)) === "Aorist" && ["Passive", "Passive Deponent"].includes(F(D(i)).Voice),
    gpart: i => FILTER.part(i) && F(D(i)).Case === "Genitive",
    subj: i => { const d = D(i); return F(d).Mood === "Subjunctive" && ["Present", "Aorist"].includes(tense(d)) && !thetaDep(d, john.form(i)); },
    inf: i => F(D(i)).Form === "Infinitive" && ["Present", "Aorist"].includes(tense(D(i))) && !thetaDep(D(i), john.form(i)),
    cpai: i => { const d = D(i); return ind(d) && ["Present", "Imperfect"].includes(F(d).Tense) && F(d).Voice === "Active" && contract(L(i)); },
    liq: i => { const d = D(i); return ind(d) && LIQUID.has(L(i)) && ((tense(d) === "Future" && F(d).Voice === "Active") || (F(d).Tense === "Aorist" && F(d).Voice === "Active")); },
    adj3: i => F(D(i)).Function === "Adjective" && /ης$/.test(bare(L(i))) && !!F(D(i)).Case,
    pas: i => L(i) === "πᾶς" && !!F(D(i)).Case && !!F(D(i)).Gender,
    num: i => ["εἷς", "πολύς", "μέγας"].includes(L(i)) && !!F(D(i)).Case && !!F(D(i)).Gender,
    rel: i => L(i) === "ὅς" && F(D(i)).Function === "Relative pronoun" && !!F(D(i)).Case,
    interr: i => (L(i) === "τίς" || L(i) === "τις") && !!F(D(i)).Case && !!F(D(i)).Gender,
    imp: i => { const d = D(i); return F(d).Mood === "Imperative" && ["Present", "Aorist"].includes(tense(d)) && !!F(d).Person && !thetaDep(d, john.form(i)); },
    perf: i => { const d = D(i); return ind(d) && tense(d) === "Perfect" && L(i) !== "οἶδα"; },
    comp: i => F(D(i)).Function === "Adjective" && L(i) !== "πρῶτος" && /Comparative|Superlative/.test(F(D(i)).Extra || "") && !!F(D(i)).Case,
    mi: i => ind(D(i)) && MI.has(L(i)) && ["Present", "Aorist", "Imperfect"].includes(tense(D(i))) && F(D(i)).Voice === "Active",
    oida: i => L(i) === "οἶδα" && ind(D(i))
  };
  // Level 5 (reading a passage) and Level 6 (Greek for preaching)
  const READN = new Set(["Noun", "Adjective", "Definite article", "Personal pronoun", "Demonstrative pronoun", "Relative pronoun", "Verb"]);
  Object.assign(FILTER, {
    readV: i => inRange(i) && F(D(i)).Function === "Verb" && !!F(D(i)).Person && !!tvLabel(D(i)) && !thetaDep(D(i), john.form(i)),
    readN: i => inRange(i) && READN.has(F(D(i)).Function) && !!F(D(i)).Case && !!F(D(i)).Number && F(D(i)).Case !== "Vocative" && (F(D(i)).Function !== "Verb" || !!F(D(i)).Gender),
    readVerb: i => inRange(i) && !!tvLabel(D(i)) && !thetaDep(D(i), john.form(i)),
    readGen: i => inRange(i) && F(D(i)).Function === "Noun" && F(D(i)).Case === "Genitive",
    readPart: i => inRange(i) && F(D(i)).Form === "Participle",
    noun: i => F(D(i)).Function === "Noun" && !!F(D(i)).Case && !!F(D(i)).Number,
    gen: i => F(D(i)).Function === "Noun" && F(D(i)).Case === "Genitive",
    dat: i => F(D(i)).Function === "Noun" && F(D(i)).Case === "Dative",
    acc: i => F(D(i)).Function === "Noun" && F(D(i)).Case === "Accusative",
    aorAny: i => F(D(i)).Function === "Verb" && tense(D(i)) === "Aorist" && !!tvLabel(D(i)) && !thetaDep(D(i), john.form(i)),
    presAny: i => F(D(i)).Function === "Verb" && F(D(i)).Tense === "Present" && !!tvLabel(D(i)),
    aspect: i => FILTER.aorAny(i) || FILTER.presAny(i) || (F(D(i)).Function === "Verb" && tense(D(i)) === "Perfect" && !!tvLabel(D(i))),
    conn: i => ["γάρ", "οὖν", "δέ", "ἀλλά", "ἵνα", "ὅτι"].includes(L(i)),
    cond: i => ["εἰ", "ἐάν"].includes(L(i)),
    diph: i => /(ει|αι|οι)/.test(bare(john.form(i)).toLowerCase())
  });
  const isVerbFocus = k => ["readV", "pai", "pmpi", "iai", "impi", "fi", "aai1", "aai2", "api", "eimi", "subj", "imp", "cpai", "liq", "perf", "mi", "oida"].includes(k);

  // tense and voice as the lessons name them, or null for forms the lessons do not ask about
  // Indicatives are named by tense and voice alone ("aorist active"); other moods add the mood ("aorist active participle").
  function tvLabel(d){
    if (!d || F(d).Function !== "Verb") return null;
    const M = F(d).Mood === "Indicative" ? "" : F(d).Mood ? " " + F(d).Mood.toLowerCase() : F(d).Form ? " " + F(d).Form.toLowerCase() : null;
    if (M == null) return null;
    const t = tense(d), v = F(d).Voice || "";
    const T = { Present: "present", Imperfect: "imperfect", Future: "future", Aorist: "aorist", Perfect: "perfect" }[t];
    if (!T) return null;
    if (v === "Active") return T + " active" + M;
    if (t === "Present" || t === "Imperfect" || t === "Perfect") return MP.has(v) ? T + " middle or passive" + M : null;
    if (v === "Middle" || v === "Middle Deponent") return T + " middle" + M;
    if (v === "Passive" || v === "Passive Deponent") return T + " passive" + M;
    return null;
  }

  // every reading the New Testament gives this spelling of this word: [describe objects]
  function readings(lemma, form){
    const want = normForm(form, lemma);
    return ((FD.x[lemma]) || []).filter(r => FD.F[r[1]] === want || r.slice(3).some(a => FD.F[a] === want)).map(r => dc(FD.M[r[0]])).filter(Boolean);
  }

  /* ---------- pools of words in John ---------- */
  const pools = new Map();
  function poolOf(key){
    if (/^read/.test(key)) key += "@" + range.join("-");   // passage pools depend on the passage
    if (!pools.has(key)) { const f = FILTER[key.split("@")[0]], out = []; for (let i = 0; i < john.n; i++) if (f(i)) out.push(i); pools.set(key, out); }
    return pools.get(key);
  }
  function wordFor(key, used){
    const list = poolOf(key).filter(i => !used.has(normForm(john.form(i), L(i))));
    if (!list.length) return -1;
    const i = pick(list); used.add(normForm(john.form(i), L(i))); return i;
  }
  const where = i => { const v = john.verseOf(i); return `${name} ${v.c}:${v.v}`; };
  const glossOf = (l, i) => { const w = ALL.flatMap(x => x.words || []).find(x => x[0] === l); return w ? w[2] : (i != null ? john.gloss(i) : ""); };
  const explainWord = (i, d) => `${gk(john.form(i))} (${where(i)}) is ${esc(d.label.replace(/ · /g, ", ").toLowerCase())}, from ${gk(L(i))}${glossOf(L(i), i) ? `, “${esc(glossOf(L(i), i))}”` : ""}.`;

  /* ---------- the "In the New Testament" column ---------- */
  let byCode = null;
  function index(){
    if (byCode) return byCode;
    byCode = new Map();
    for (const [lemma, rows] of Object.entries(FD.x)) for (const r of rows) {
      const code = FD.M[r[0]];
      if (!byCode.has(code)) byCode.set(code, []);
      byCode.get(code).push([FD.F[r[1]], lemma, r[2]]);
    }
    return byCode;
  }
  function example(model, code){
    const rows = index().get(code) || [];
    const own = rows.filter(r => r[1] === model);
    if (own.length && model !== "λύω" && model !== "λείπω") { const r = own.sort((a, b) => b[2] - a[2])[0]; return `${gk(r[0])} <small>${r[2].toLocaleString("en-CA")}×</small>`; }
    const other = rows.filter(r => r[1] !== model && (/ω$/.test(r[1]) || dep(r[1])) && !/(έω|άω|όω)$/.test(r[1])).sort((a, b) => b[2] - a[2])[0];
    if (other) return `${gk(other[0])} <small>from ${esc(other[1])}, ${other[2].toLocaleString("en-CA")}×</small>`;
    return `<small>not in the New Testament</small>`;
  }
  function tableHTML(t){
    const endings = t.rows.some(r => r[1]);
    return `<div class="twrap"><table class="chart pdg-s"><caption>${esc(t.title)}</caption><thead><tr><th scope="col"></th>${endings ? `<th scope="col">Ending</th>` : ""}<th scope="col">Form</th><th scope="col">In the New Testament</th></tr></thead><tbody>${
      t.rows.map(r => `<tr><th scope="row">${esc(r[0])}</th>${endings ? `<td>${gk(r[1])}</td>` : ""}<td class="big">${gk(r[2])}</td><td>${example(r[4] || t.model, r[3])}</td></tr>`).join("")}</tbody></table></div>`;
  }
  function gridHTML(g){
    return `<div class="twrap"><table class="chart"><caption>${esc(g.caption)}</caption><thead><tr>${g.head.map(h => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${
      g.rows.map(r => `<tr>${r.map((c, k) => k === 0 && !g.el.includes(0) ? `<th scope="row">${esc(c)}</th>` : g.el.includes(k) ? `<td class="${k ? "big" : "big rowh"}">${gk(c)}</td>` : `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  /* ---------- exercises ---------- */
  const tablesOf = l => (l.teach || []).filter(b => b.table).map(b => b.table);
  const variants = f => f.includes("(ν)") ? [f.replace("(ν)", ""), f.replace("(ν)", "ν")] : [f];
  const GEN = {
    ending(l){
      const t = pick(tablesOf(l).filter(t => !t.hidden && t.rows.some(r => r[1]))); if (!t) return null;
      const r = pick(t.rows.filter(x => x[1]));
      const same = t.rows.filter(x => x[1] === r[1]).map(x => x[0]);
      const wrong = uniq(t.rows.filter(x => x[1] && x[1] !== r[1]).map(x => x[1]));
      return choice(`Which ending marks the <b>${esc(r[0])}</b>?<span class="small q-sub">${esc(t.title)}</span>`, gk(r[1]), shuffle(wrong).map(gk),
        `${gk(r[1])} marks the ${esc(same.join(" and the "))}: ${gk(r[2])}.`, { big: true });
    },
    form(l){
      const t = pick(tablesOf(l).filter(t => t.rows.every(r => r[0]))); if (!t) return null;
      const r = pick(t.rows);
      const wrong = uniq(t.rows.filter(x => x[2] !== r[2]).map(x => x[2]));
      return choice(`Which form is the <b>${esc(r[0])}</b>?<span class="small q-sub">${esc(t.title)}</span>`, gk(r[2]), shuffle(wrong).map(gk), `The ${esc(r[0])} is ${gk(r[2])}.`, { big: true });
    },
    parseV(l, used){
      const key = l.read ? "readV" : isVerbFocus(l.focus) ? l.focus : "eimi";
      const i = wordFor(key, used); if (i < 0) return null;
      const d = D(i), right = pnLabel(F(d).Person.replace(/ .*/, ""), F(d).Number);
      const tv = tvLabel(d);
      const ok = new Set(readings(L(i), john.form(i)).filter(x => tvLabel(x) === tv && F(x).Person).map(x => pnLabel(F(x).Person.replace(/ .*/, ""), F(x).Number)));
      if (F(d).Voice === "Active" && ["Imperfect", "2nd Aorist"].includes(F(d).Tense)) { ok.add(pnLabel("1st", "Singular")); ok.add(pnLabel("3rd", "Plural")); }
      ok.add(right);
      // an imperative has no 1st person
      const wrong = PN.filter(([p]) => F(d).Mood !== "Imperative" || p !== "1st").map(([p, n]) => pnLabel(p, n)).filter(x => !ok.has(x));
      return choice(`Who is acting? Choose the person and number.<span class="q-big">${gk(john.form(i))}</span><span class="small q-sub">${where(i)}</span>`, right, shuffle(wrong), explainWord(i, d));
    },
    parseN(l, used){
      const i = wordFor(l.read ? "readN" : l.pn || l.focus, used); if (i < 0) return null;   // l.pn: a wider pool than the lesson's focus
      const d = D(i), fn = F(d).Function, withG = fn !== "Noun" && !(l.focus === "pron12") && !(fn === "Personal pronoun" && /^(1st|2nd)/.test(F(d).Person || ""));
      const lab = x => `${F(x).Case.toLowerCase()} ${F(x).Number.toLowerCase()}${withG && F(x).Gender ? " " + F(x).Gender.toLowerCase() : ""}`;
      if (!F(d).Case || !F(d).Number) return null;
      const right = lab(d);
      const ok = new Set(readings(L(i), john.form(i)).filter(x => F(x).Case && F(x).Number).map(lab));
      // a neuter's nominative and accusative are always the same
      for (const x of [...ok, right]) { if (/ neuter$/.test(x) || (!withG && F(d).Gender === "Neuter")) { ok.add(x.replace(/^nominative/, "accusative")); ok.add(x.replace(/^accusative/, "nominative")); } }
      ok.add(right);
      let all = [];
      for (const c of CASES) for (const n of NUMS) { if (withG) for (const g of GENS) all.push(`${c} ${n} ${g}`.toLowerCase()); else all.push(`${c} ${n}`.toLowerCase()); }
      // wrong answers that differ in one thing are the ones that teach
      const near = x => { const a = x.split(" "), b = right.split(" "); return a.filter((w, k) => w !== b[k]).length; };
      const wrong = shuffle(all.filter(x => !ok.has(x))).sort((a, b) => near(a) - near(b)).slice(0, 6);
      return choice(`Choose the case${withG ? ", number and gender" : " and number"}.<span class="q-big">${gk(john.form(i))}</span><span class="small q-sub">${where(i)}</span>`, right, shuffle(wrong).slice(0, 3), explainWord(i, d));
    },
    tv(l, used){
      if (!l.tv || l.tv.length < 2) return null;
      const early = l.level <= 2;   // Levels 1 and 2 keep to verbs whose forms they have taught
      const fits = i => !thetaDep(D(i), john.form(i)) && !used.has(normForm(john.form(i), L(i))) && L(i) !== "εἰμί" && (early ? regW(L(i)) || dep(L(i)) : !MI.has(L(i)) || l.focus === "mi");
      const pool = poolOf(l.read ? "readVerb" : "anyVerb");
      // a label the words on hand actually show (a short passage may not have every tense)
      const labels = l.read ? uniq(pool.filter(fits).map(i => tvLabel(D(i)))).filter(t => l.tv.includes(t)) : l.tv;
      if (!labels.length) return null;
      const want = pick(labels);
      const list = pool.filter(i => tvLabel(D(i)) === want && fits(i));
      if (!list.length) return null;
      const i = pick(list); used.add(normForm(john.form(i), L(i)));
      const d = D(i), right = tvLabel(d);
      const ok = new Set(readings(L(i), john.form(i)).map(tvLabel).filter(Boolean)); ok.add(right);
      return choice(`Which tense and voice${/ (participle|subjunctive|infinitive|imperative|optative)$/.test(right) ? " (and form)" : ""}?<span class="q-big">${gk(john.form(i))}</span><span class="small q-sub">${where(i)}</span>`, right, shuffle(l.tv.filter(x => !ok.has(x))), explainWord(i, d));
    },
    meaning(l, used){ return meaningItem(l, used); },
    prep(l, used){ return prepItem(l, used); },
    // a question about how the grammar works, written into the lesson: [question, right answer, [wrong answers], why]
    quiz(l, used){
      const list = (l.quiz || []).filter(q => !used.has("q:" + q[0])); if (!list.length) return null;
      const q = pick(list); used.add("q:" + q[0]);
      return choice(q[0], q[1], shuffle(q[2]), q[3]);
    },
    vocab(l){ const [w, , g] = pick(l.words); return choice(`What does this word mean?<span class="q-big">${gk(w)}</span>`, esc(g), shuffle(l.words.filter(x => x[0] !== w)).map(x => esc(x[2])), `${gk(w)} means “${esc(g)}”.`); },
    toVocab(l){ const [w, , g] = pick(l.words); return choice(`Which word means <b>“${esc(g)}”</b>?`, gk(w), shuffle(l.words.filter(x => x[0] !== w)).map(x => gk(x[0])), `“${esc(g)}” is ${gk(w)}.`, { big: true }); }
  };
  FILTER.anyInd = i => ind(D(i));
  FILTER.anyVerb = i => F(D(i)).Function === "Verb";

  /* ---------- what a verb form means ---------- */
  // kinds of meaning by the lesson's focus: [test on a described code, English for person k from the verb's English forms]
  const K = {
    pres: [x => F(x).Tense === "Present" && F(x).Voice === "Active", (k, e) => `${SUBJ[k]} ${k === 2 ? e[1] : e[0]}`],
    presDep: [x => F(x).Tense === "Present" && MP.has(F(x).Voice), (k, e) => `${SUBJ[k]} ${k === 2 ? e[1] : e[0]}`, true],
    presPass: [x => F(x).Tense === "Present" && MP.has(F(x).Voice), (k, e) => e[4] ? `${SUBJ[k]} ${BE[k]} being ${e[4]}` : "", false],
    impf: [x => F(x).Tense === "Imperfect" && F(x).Voice === "Active", (k, e) => `${SUBJ[k]} ${WAS[k]} ${e[3]}`],
    impfDep: [x => F(x).Tense === "Imperfect" && MP.has(F(x).Voice), (k, e) => `${SUBJ[k]} ${WAS[k]} ${e[3]}`, true],
    fut: [x => tense(x) === "Future" && ["Active", "Middle Deponent"].includes(F(x).Voice), (k, e) => `${SUBJ[k]} will ${e[0]}`],
    aor: [x => tense(x) === "Aorist" && ["Active", "Middle Deponent"].includes(F(x).Voice), (k, e) => `${SUBJ[k]} ${e[2]}`],
    aorPass: [x => tense(x) === "Aorist" && F(x).Voice === "Passive", (k, e) => e[4] ? `${SUBJ[k]} ${WAS[k]} ${e[4]}` : ""],
    futPass: [x => tense(x) === "Future" && F(x).Voice === "Passive", (k, e) => e[4] ? `${SUBJ[k]} will be ${e[4]}` : ""],
    eimiPres: [x => F(x).Tense === "Present", k => `${SUBJ[k]} ${BE[k]}`, null, "εἰμί"],
    eimiImpf: [x => F(x).Tense === "Imperfect", k => `${SUBJ[k]} ${WAS[k]}`, null, "εἰμί"],
    eimiFut: [x => tense(x) === "Future", k => `${SUBJ[k]} will be`, null, "εἰμί"],
    perf: [x => tense(x) === "Perfect" && F(x).Voice === "Active", (k, e) => e[4] ? `${SUBJ[k]} ${k === 2 ? "has" : "have"} ${e[4]}` : ""],
    oida: [x => tense(x) === "Perfect", k => `${SUBJ[k]} ${k === 2 ? "knows" : "know"}`, null, "οἶδα"],
    oidaPast: [x => tense(x) === "Pluperfect", k => `${SUBJ[k]} knew`, null, "οἶδα"]
  };
  const KINDS = { pai: ["pres"], pron12: ["eimiPres"], pmpi: ["presDep", "presPass"], iai: ["impf", "eimiImpf"], impi: ["impfDep"], fi: ["fut", "eimiFut"], aai1: ["aor"], aai2: ["aor"], api: ["aorPass", "futPass"],
    cpai: ["pres", "impf"], liq: ["fut", "aor"], perf: ["perf"], mi: ["pres", "aor"], oida: ["oida", "oidaPast"] };
  function verbsUpTo(l){
    const upto = ALL.slice(0, ALL.findIndex(x => x.id === l.id) + 1);
    return [...BASE_VERBS, ...upto.flatMap(x => (x.words || []).filter(w => w[3]).map(w => [w[0], w[3]]))];
  }
  function meaningItem(l, used){
    const kinds = KINDS[l.focus]; if (!kinds) return null;
    for (let tries = 0; tries < 12; tries++) {
      const kname = pick(kinds), [test, en, wantDep, only] = K[kname];
      const limit = { mi: x => MI.has(x), liq: x => LIQUID.has(x), cpai: contract }[l.focus] || (() => true);
      const verbs = only ? [[only, null]] : verbsUpTo(l).filter(([lemma]) => (wantDep == null || dep(lemma) === wantDep) && limit(lemma));
      if (!verbs.length) continue;
      const [lemma, e] = pick(verbs);
      const rows = (FD.x[lemma] || []).map(r => ({ form: FD.F[r[1]], d: dc(FD.M[r[0]]) })).filter(r => r.d && ind(r.d) && F(r.d).Person && test(r.d));
      if (!rows.length) continue;
      const r = pick(rows);
      if (used.has("m:" + r.form)) continue;
      used.add("m:" + r.form);
      const k = PN.findIndex(([p, n]) => F(r.d).Person.startsWith(p) && F(r.d).Number === n);
      const right = en(k, e); if (!right) continue;
      // persons this same spelling can also be, so they are never offered as wrong
      const twins = new Set(rows.filter(x => x.form === r.form).map(x => PN.findIndex(([p, n]) => F(x.d).Person.startsWith(p) && F(x.d).Number === n)));
      const others = [0, 1, 2, 3, 4, 5].filter(j => !twins.has(j)).map(j => en(j, e));
      const passive = /Pass$/.test(kname);
      const otherKinds = Object.entries(K).filter(([n, v]) => n !== kname && !v[3] === !only && (only ? v[3] === only : true) && (passive || !/Pass$/.test(n))).map(([, v]) => v[1](k, e)).filter(Boolean);
      const wrong = uniq([...shuffle(others).slice(0, 2), ...shuffle(otherKinds)]).filter(x => x && x !== right);
      return choice(`What does this form mean?<span class="q-big">${gk(r.form)}</span><span class="small q-sub">a form of ${esc(lemma)}</span>`, esc(right), wrong.map(esc),
        `${gk(r.form)} is ${esc(r.d.label.replace(/ · /g, ", ").toLowerCase())}: “${esc(right)}”.`);
    }
    return null;
  }

  /* ---------- what a preposition means with its case ---------- */
  let PREPS = null;
  function preps(){
    if (PREPS) return PREPS;
    PREPS = {};
    const g = ALL.flatMap(x => (x.teach || []).filter(b => b.grid && /Prepositions/.test(b.grid.caption)).map(b => b.grid))[0];
    if (g) for (const r of g.rows) { const lem = r[0].split(",")[0].trim(); PREPS[lem] = { Genitive: r[1], Dative: r[2], Accusative: r[3] }; }
    return PREPS;
  }
  function prepItem(l, used){
    const P = preps();
    const list = poolOf("prep").filter(i => P[L(i)]);
    for (let tries = 0; tries < 20; tries++) {
      const i = pick(list);
      let j = i + 1, c = null;
      for (; j < Math.min(john.n, i + 4); j++) { const x = D(j); if (F(x).Case && F(x).Function !== "Preposition") { c = F(x).Case; if (F(x).Function !== "Definite article") break; } }
      if (!c || !P[L(i)][c]) continue;
      const phrase = []; for (let k = i; k <= j; k++) phrase.push(john.form(k));
      const key = "p:" + phrase.join(" "); if (used.has(key)) continue; used.add(key);
      const right = P[L(i)][c];
      const wrong = uniq([...Object.values(P[L(i)]).filter(x => x && x !== right), ...shuffle(Object.entries(P).filter(([k]) => k !== L(i)).flatMap(([, v]) => Object.values(v).filter(Boolean)))]).filter(x => x !== right);
      return choice(`What does ${gk(john.form(i))} mean here?<span class="q-big">${gk(phrase.join(" "))}</span><span class="small q-sub">${where(i)}</span>`, esc(right), wrong.slice(0, 3).map(esc),
        `${gk(L(i))} is followed by the ${c.toLowerCase()} here (${gk(john.form(j))}), so it means “${esc(right)}”.`);
    }
    return null;
  }

  /* ---------- tap every word that ... ---------- */
  let verses = null;
  const allVerses = () => verses || (verses = john.verses({ c1: 1, v1: 1, c2: 999, v2: 999 }));
  function spotItem(l){
    const [key, label] = pick(l.spot || []);
    const test = FILTER[key]; if (!test) return null;
    const source = l.read ? john.verses({ c1: l.read.c, v1: l.read.v1, c2: l.read.c2 || l.read.c, v2: l.read.v2 }) : allVerses();
    const cands = shuffle(source.filter(v => v.z - v.a <= (l.read ? 40 : 22) && v.z - v.a >= 4)).slice(0, 400).map(v => ({ v, hits: [...Array(v.z - v.a).keys()].map(k => v.a + k).filter(test) })).filter(x => x.hits.length >= 1 && x.hits.length <= 5);
    if (!cands.length) return null;
    const { v, hits } = pick(cands.slice(0, 40));
    const words = [];
    for (let i = v.a; i < v.z; i++) words.push({ i, html: esc(john.before(i) + john.form(i) + john.after(i)), ok: hits.includes(i) });
    return { kind: "spot", prompt: `Tap every word that ${esc(label)}.`, ref: `${name} ${v.c}:${v.v}`, words, explain: `In ${name} ${v.c}:${v.v}: ${hits.map(i => gk(john.form(i))).join(", ")}.` };
  }

  /* ---------- See it in Scripture ---------- */
  function seeRange(l){
    const s = l.see; if (s.c) return { c: s.c, v1: s.v1, v2: s.v2 };
    const f = FILTER[l.see.mark === "prep" ? "prep" : l.focus] || (() => false);
    const test = l.focus === "eimi" ? f : i => f(i) && L(i) !== "εἰμί";   // show the lesson's pattern, not only ἦν
    const vs = allVerses();
    let best = null, most = 0;
    for (let k = 0; k < vs.length - 1; k++) {
      const a = vs[k], b = vs[k + 1];
      if (a.c !== b.c || b.z - a.a > 40) continue;
      let n = 0; for (let i = a.a; i < b.z; i++) if (test(i)) n++;
      if (n >= 3) return { c: a.c, v1: a.v, v2: b.v };
      if (n > most) { most = n; best = { c: a.c, v1: a.v, v2: b.v }; }
    }
    if (best) return best;
    return { c: 1, v1: 1, v2: 2 };
  }
  const markedG = (l, i) => !!(FILTER[l.see.mark === "prep" ? "prep" : l.focus] || (() => false))(i);
  const infoG = i => { const d = D(i); return d ? `${esc(d.label.replace(/ · /g, ", "))} · from ${gk(L(i))}` : ""; };

  const setRange = (a, z) => { range = [a, z]; };
  return { GEN, spotItem, tableHTML, gridHTML, seeRange, markedG, infoG, FILTER, poolOf, tvLabel, readings, setRange, book: john, name };
}
