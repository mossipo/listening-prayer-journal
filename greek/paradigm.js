// Akouō Plus, Greek Study Desk: paradigm tables built only from forms that occur in the New Testament
// (bible/greek/forms.json, from MACULA's parsing of the SBLGNT). A dash is a form that does not occur in the New
// Testament; it does not mean the form never existed in Greek.
import { describe, esc } from "./grammar.js";
import { translit } from "./translit.js";
let TL = false;   // show each form in English letters too (the "English letters" switch)

const CASES = ["Nominative", "Genitive", "Dative", "Accusative", "Vocative"];
const GENDERS = ["Masculine", "Feminine", "Neuter"];
const NUMBERS = ["Singular", "Plural"];
const PN = [["1st", "Singular"], ["2nd", "Singular"], ["3rd", "Singular"], ["1st", "Plural"], ["2nd", "Plural"], ["3rd", "Plural"]];
const TENSES = ["Present", "Imperfect", "Future", "2nd Future", "Aorist", "2nd Aorist", "Perfect", "2nd Perfect", "Pluperfect", "2nd Pluperfect"];
const VOICES = ["Active", "Middle", "Middle Deponent", "Middle or Passive", "Middle or Passive Deponent", "Passive", "Passive Deponent"];
const MOODS = ["Indicative", "Subjunctive", "Imperative", "Optative"];
const abbr = { Nominative: "Nom", Genitive: "Gen", Dative: "Dat", Accusative: "Acc", Vocative: "Voc", Singular: "Sg", Plural: "Pl", Masculine: "Masc", Feminine: "Fem", Neuter: "Neut" };
const gk = s => `<span lang="el">${esc(s)}</span>`;

// Model tables offered on the Paradigms tab: every one is a real New Testament word, filled from the data.
export const MODELS = [
  ["The article", [["ὁ", "the"]]],
  ["Second declension", [["λόγος", "masculine"], ["ἔργον", "neuter"]]],
  ["First declension", [["φωνή", "-η"], ["ἡμέρα", "-α"], ["δόξα", "mixed"], ["προφήτης", "masculine"]]],
  ["Third declension", [["σάρξ", "consonant stem"], ["πνεῦμα", "neuter"], ["πόλις", "-ις"], ["πατήρ", "-ηρ"]]],
  ["Adjectives", [["ἀγαθός", "2-1-2"], ["πᾶς", "3-1-3"]]],
  ["Pronouns", [["ἐγώ", "I, we"], ["σύ", "you"], ["αὐτός", "he, she, it"], ["οὗτος", "this"], ["ὅς", "who, which"]]],
  ["Verbs", [["εἰμί", "to be"], ["λύω", "to loose"], ["πιστεύω", "to believe"], ["ἔρχομαι", "middle forms"], ["δίδωμι", "-μι verb"]]]
];

// Every form of a dictionary word: [{ code, form, n, alt: [other spellings], d: described code }]
export function formsOf(FD, codes, lemma){
  const rows = (FD && FD.x[lemma]) || [];
  return rows.map(([m, f, n, ...alt]) => ({ code: FD.M[m], form: FD.F[f], n, alt: alt.map(a => FD.F[a]), d: describe(codes, FD.M[m]) }));
}
// The usual spelling of a word's own grammar code (accents as in a lexicon), or ""
export function spellingOf(FD, lemma, code){
  const r = ((FD && FD.x[lemma]) || []).find(x => FD.M[x[0]] === code);
  return r ? FD.F[r[1]] : "";
}

function cell(list, mark){
  if (!list.length) return `<td class="na" title="Not found in the New Testament">–</td>`;
  const me = list.some(e => e.code === mark);
  return `<td class="${me ? "me" : ""}"${me ? ' aria-current="true"' : ""}>${list.map(e => `${gk(e.form)}<small>${e.n}</small>${TL ? `<span class="ptl" lang="el-Latn">(${esc(translit(e.form))})</span>` : ""}`).join("<br>")}</td>`;
}

// case by number (by gender where the word has genders)
function nominalTable(list, mark, title){
  const genders = GENDERS.filter(g => list.some(e => e.d.f.Gender === g));
  const cols = genders.length ? genders.flatMap(g => NUMBERS.map(n => [g, n])) : NUMBERS.map(n => [null, n]);
  const cases = CASES.filter(c => c !== "Vocative" || list.some(e => e.d.f.Case === c));
  let h = `<div class="pwrap"><table class="pdg"><caption>${esc(title)}</caption><thead>`;
  if (genders.length > 1) h += `<tr><th></th>${genders.map(g => `<th colspan="2">${abbr[g]}</th>`).join("")}</tr>`;
  h += `<tr><th></th>${cols.map(([g, n]) => `<th>${genders.length === 1 ? abbr[g] + " " : ""}${abbr[n]}</th>`).join("")}</tr></thead><tbody>`;
  for (const c of cases) h += `<tr><th>${abbr[c]}</th>${cols.map(([g, n]) => cell(list.filter(e => e.d.f.Case === c && e.d.f.Number === n && (!g || e.d.f.Gender === g)), mark)).join("")}</tr>`;
  return h + "</tbody></table></div>";
}

const tvKey = e => `${e.d.f.Tense || ""}|${e.d.f.Voice || ""}`;
const tvLabel = k => k.split("|").filter(Boolean).join(" ").toLowerCase();
const tvOrder = k => { const [t, v] = k.split("|"); return (TENSES.indexOf(t) + 1) * 10 + VOICES.indexOf(v); };

function finiteTables(list, mark){
  let h = "";
  for (const mood of MOODS) {
    const of = list.filter(e => e.d.f.Mood === mood);
    if (!of.length) continue;
    const keys = [...new Set(of.map(tvKey))].sort((a, b) => tvOrder(a) - tvOrder(b));
    h += `<div class="pwrap"><table class="pdg"><caption>${mood}</caption><thead><tr><th></th>${keys.map(k => `<th>${esc(tvLabel(k))}</th>`).join("")}</tr></thead><tbody>`;
    for (const [p, n] of PN) {
      const rows = keys.map(k => of.filter(e => tvKey(e) === k && String(e.d.f.Person || "").startsWith(p) && e.d.f.Number === n));
      h += `<tr><th>${p.replace("st", "").replace("nd", "").replace("rd", "")}${n === "Singular" ? "s" : "p"}</th>${rows.map(r => cell(r, mark)).join("")}</tr>`;
    }
    h += "</tbody></table></div>";
  }
  return h;
}

// The whole paradigm of one dictionary word, from its New Testament forms. mark: the grammar code to highlight.
export function paradigmHTML(FD, codes, lemma, mark, note, tl){
  TL = !!tl;
  const all = formsOf(FD, codes, lemma).filter(e => e.d);
  if (!all.length) return `<p>No forms of ${gk(lemma)} in the data.</p>`;
  const total = all.reduce((a, e) => a + e.n, 0);
  let h = `<h3 class="ph3">${gk(lemma)}${TL ? ` <span class="ptl-h" lang="el-Latn">(${esc(translit(lemma))})</span>` : ""}${note ? ` <span class="small">${esc(note)}</span>` : ""}</h3>
    <p class="small">${total.toLocaleString("en-CA")} times in the New Testament, in ${all.length} different ${all.length === 1 ? "form" : "forms"}. Small numbers are how often each form occurs.</p>`;
  const verbs = all.filter(e => e.d.f.Function === "Verb");
  const finite = verbs.filter(e => e.d.f.Mood), inf = verbs.filter(e => e.d.f.Form === "Infinitive"), part = verbs.filter(e => e.d.f.Form === "Participle");
  const nominal = all.filter(e => e.d.f.Function !== "Verb" && e.d.f.Case);
  const other = all.filter(e => !finite.includes(e) && !inf.includes(e) && !part.includes(e) && !nominal.includes(e));
  if (finite.length) h += finiteTables(finite, mark);
  if (inf.length) {
    const keys = [...new Set(inf.map(tvKey))].sort((a, b) => tvOrder(a) - tvOrder(b));
    h += `<div class="pwrap"><table class="pdg"><caption>Infinitive</caption><tbody>${keys.map(k => `<tr><th>${esc(tvLabel(k))}</th>${cell(inf.filter(e => tvKey(e) === k), mark)}</tr>`).join("")}</tbody></table></div>`;
  }
  if (part.length) {
    const keys = [...new Set(part.map(tvKey))].sort((a, b) => tvOrder(a) - tvOrder(b));
    h += `<h4 class="ph4">Participles</h4>` + keys.map(k => {
      const of = part.filter(e => tvKey(e) === k), open = of.some(e => e.code === mark);
      return `<details class="pdet"${open ? " open" : ""}><summary>${esc(tvLabel(k))} participle <span class="small">${of.reduce((a, e) => a + e.n, 0)} times</span></summary>${nominalTable(of, mark, tvLabel(k) + " participle")}</details>`;
    }).join("");
  }
  if (nominal.length) {
    // one table per kind (a pronoun's persons, an adjective's degrees) so cells never mix different words' jobs
    const kinds = new Map();
    for (const e of nominal) { const k = [e.d.f.Function, e.d.person || "", e.d.f.Extra || ""].join("|"); if (!kinds.has(k)) kinds.set(k, []); kinds.get(k).push(e); }
    for (const [k, of] of kinds) { const [fn, person, extra] = k.split("|"); h += nominalTable(of, mark, [fn, person && person + " person", extra && extra.toLowerCase()].filter(Boolean).join(", ")); }
  }
  if (other.length) h += `<div class="pwrap"><table class="pdg"><caption>Other forms</caption><tbody>${other.map(e => `<tr><th>${esc(e.d.label || e.code)}</th>${cell([e], mark)}</tr>`).join("")}</tbody></table></div>`;
  h += `<p class="small">Every form shown occurs in the New Testament (SBLGNT, parsed by MACULA). A dash means the form does not occur in the New Testament, not that it never existed. Where a word's forms are parsed in more than one way, each parsing has its own cell.</p>`;
  return h;
}
