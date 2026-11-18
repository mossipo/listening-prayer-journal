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
const regW = l => /ω$/.test(l) && !/(έω|άω|όω)$/.test(l);
const dep = l => /ομαι$/.test(l);
const SUBJ = ["I", "you", "he/she/it", "we", "you (plural)", "they"], BE = ["am", "are", "is", "are", "are", "are"], WAS = ["was", "were", "was", "were", "were", "were"];
const BASE_VERBS = [["λέγω", ["say", "says", "said", "saying", "said"]]];

export function makeDrills({ john, codes, FD, ALL, choice }){
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
    n2: i => { const d = D(i); return F(d).Function === "Noun" && !named(L(i)) && /(ος|ον)$/.test(L(i)) && F(d).Case !== "Vocative"; },
    n2gen: i => FILTER.n2(i) && F(D(i)).Case === "Genitive",
    n1f: i => { const d = D(i); return F(d).Function === "Noun" && !named(L(i)) && F(d).Gender === "Feminine" && /(η|α)$/.test(L(i)) && F(d).Case !== "Vocative"; },
    art: i => F(D(i)).Function === "Definite article",
    adj2: i => F(D(i)).Function === "Adjective" && /ος$/.test(L(i)) && !!F(D(i)).Case,
    n1m: i => { const d = D(i); return F(d).Function === "Noun" && !named(L(i)) && F(d).Gender === "Masculine" && /ης$/.test(L(i)) && F(d).Case !== "Vocative"; },
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
    api: i => { const d = D(i); return ind(d) && ["Aorist", "Future"].includes(tense(d)) && ["Passive", "Passive Deponent"].includes(F(d).Voice); }
  };
  const isVerbFocus = k => ["pai", "pmpi", "iai", "impi", "fi", "aai1", "aai2", "api", "eimi"].includes(k);

  // tense and voice as the lessons name them, or null for forms the lessons do not ask about
  function tvLabel(d){
    if (!ind(d)) return null;
    const t = tense(d), v = F(d).Voice || "";
    const T = { Present: "present", Imperfect: "imperfect", Future: "future", Aorist: "aorist" }[t];
    if (!T) return null;
    if (v === "Active") return T + " active";
    if (t === "Present" || t === "Imperfect") return MP.has(v) ? T + " middle or passive" : null;
    if (v === "Middle" || v === "Middle Deponent") return T + " middle";
    if (v === "Passive" || v === "Passive Deponent") return T + " passive";
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
    if (!pools.has(key)) { const out = []; for (let i = 0; i < john.n; i++) if (FILTER[key](i)) out.push(i); pools.set(key, out); }
    return pools.get(key);
  }
  function wordFor(key, used){
    const list = poolOf(key).filter(i => !used.has(normForm(john.form(i), L(i))));
    if (!list.length) return -1;
    const i = pick(list); used.add(normForm(john.form(i), L(i))); return i;
  }
  const where = i => { const v = john.verseOf(i); return `John ${v.c}:${v.v}`; };
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
      const t = pick(tablesOf(l)); if (!t) return null;
      const r = pick(t.rows);
      const wrong = uniq(t.rows.filter(x => x[2] !== r[2]).map(x => x[2]));
      return choice(`Which form is the <b>${esc(r[0])}</b>?<span class="small q-sub">${esc(t.title)}</span>`, gk(r[2]), shuffle(wrong).map(gk), `The ${esc(r[0])} is ${gk(r[2])}.`, { big: true });
    },
    parseV(l, used){
      const key = isVerbFocus(l.focus) ? l.focus : "eimi";
      const i = wordFor(key, used); if (i < 0) return null;
      const d = D(i), right = pnLabel(F(d).Person.replace(/ .*/, ""), F(d).Number);
      const tv = tvLabel(d);
      const ok = new Set(readings(L(i), john.form(i)).filter(x => tvLabel(x) === tv && F(x).Person).map(x => pnLabel(F(x).Person.replace(/ .*/, ""), F(x).Number)));
      if (F(d).Voice === "Active" && ["Imperfect", "2nd Aorist"].includes(F(d).Tense)) { ok.add(pnLabel("1st", "Singular")); ok.add(pnLabel("3rd", "Plural")); }
      ok.add(right);
      const wrong = PN.map(([p, n]) => pnLabel(p, n)).filter(x => !ok.has(x));
      return choice(`Who is acting? Choose the person and number.<span class="q-big">${gk(john.form(i))}</span><span class="small q-sub">${where(i)}</span>`, right, shuffle(wrong), explainWord(i, d));
    },
    parseN(l, used){
      const i = wordFor(l.focus, used); if (i < 0) return null;
      const d = D(i), fn = F(d).Function, withG = fn !== "Noun" && !(l.focus === "pron12");
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
      const want = pick(l.tv);
      const list = poolOf("anyInd").filter(i => tvLabel(D(i)) === want && !thetaDep(D(i), john.form(i)) && !used.has(normForm(john.form(i), L(i))) && (regW(L(i)) || dep(L(i))));
      if (!list.length) return null;
      const i = pick(list); used.add(normForm(john.form(i), L(i)));
      const d = D(i), right = tvLabel(d);
      const ok = new Set(readings(L(i), john.form(i)).map(tvLabel).filter(Boolean)); ok.add(right);
      return choice(`Which tense and voice?<span class="q-big">${gk(john.form(i))}</span><span class="small q-sub">${where(i)}</span>`, right, shuffle(l.tv.filter(x => !ok.has(x))), explainWord(i, d));
    },
    meaning(l, used){ return meaningItem(l, used); },
    prep(l, used){ return prepItem(l, used); },
    vocab(l){ const [w, , g] = pick(l.words); return choice(`What does this word mean?<span class="q-big">${gk(w)}</span>`, esc(g), shuffle(l.words.filter(x => x[0] !== w)).map(x => esc(x[2])), `${gk(w)} means “${esc(g)}”.`); },
    toVocab(l){ const [w, , g] = pick(l.words); return choice(`Which word means <b>“${esc(g)}”</b>?`, gk(w), shuffle(l.words.filter(x => x[0] !== w)).map(x => gk(x[0])), `“${esc(g)}” is ${gk(w)}.`, { big: true }); }
  };
  FILTER.anyInd = i => ind(D(i));

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
    eimiFut: [x => tense(x) === "Future", k => `${SUBJ[k]} will be`, null, "εἰμί"]
  };
  const KINDS = { pai: ["pres"], pron12: ["eimiPres"], pmpi: ["presDep", "presPass"], iai: ["impf", "eimiImpf"], impi: ["impfDep"], fi: ["fut", "eimiFut"], aai1: ["aor"], aai2: ["aor"], api: ["aorPass", "futPass"] };
  function verbsUpTo(l){
    const upto = ALL.slice(0, ALL.findIndex(x => x.id === l.id) + 1);
    return [...BASE_VERBS, ...upto.flatMap(x => (x.words || []).filter(w => w[3]).map(w => [w[0], w[3]]))];
  }
  function meaningItem(l, used){
    const kinds = KINDS[l.focus]; if (!kinds) return null;
    for (let tries = 0; tries < 12; tries++) {
      const kname = pick(kinds), [test, en, wantDep, only] = K[kname];
      const verbs = only ? [[only, null]] : verbsUpTo(l).filter(([lemma]) => wantDep == null || dep(lemma) === wantDep);
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
      const otherKinds = Object.entries(K).filter(([n, v]) => n !== kname && !v[3] === !only && (only ? v[3] === only : true)).map(([, v]) => v[1](k, e)).filter(Boolean);
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
  const allVerses = () => verses || (verses = john.verses({ c1: 1, v1: 1, c2: 21, v2: 99 }));
  function spotItem(l){
    const [key, label] = pick(l.spot || []);
    const test = FILTER[key]; if (!test) return null;
    const cands = shuffle(allVerses().filter(v => v.z - v.a <= 22 && v.z - v.a >= 6)).slice(0, 400).map(v => ({ v, hits: [...Array(v.z - v.a).keys()].map(k => v.a + k).filter(test) })).filter(x => x.hits.length >= 1 && x.hits.length <= 5);
    if (!cands.length) return null;
    const { v, hits } = pick(cands.slice(0, 40));
    const words = [];
    for (let i = v.a; i < v.z; i++) words.push({ i, html: esc(john.before(i) + john.form(i) + john.after(i)), ok: hits.includes(i) });
    return { kind: "spot", prompt: `Tap every word that ${esc(label)}.`, ref: `John ${v.c}:${v.v}`, words, explain: `In John ${v.c}:${v.v}: ${hits.map(i => gk(john.form(i))).join(", ")}.` };
  }

  /* ---------- See it in Scripture ---------- */
  function seeRange(l){
    const s = l.see; if (s.c) return { c: s.c, v1: s.v1, v2: s.v2 };
    const f = FILTER[l.focus] || (() => false);
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

  return { GEN, spotItem, tableHTML, gridHTML, seeRange, markedG, infoG, FILTER, poolOf, tvLabel, readings };
}
