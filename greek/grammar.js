// Greek Study Desk: turning the data's labels into plain English.
//
// Two kinds of text live here, and the page keeps them apart:
//   1. Labels that come straight from the data: the parts of a grammar code (STEPBible TEGMC wording, or MACULA's
//      own fields), and each word's role in its sentence (MACULA's syntax trees).
//   2. Short teaching notes written for Akouō, in our own words: what a tense, voice, mood or case usually signals,
//      and "Careful" notes against common word-study mistakes. These are general helps, never a verdict on a verse.
// Barry: every teaching note is in this one file so you can read and correct them all in one place.

export const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const gk = s => `<span lang="el" class="gkin">${esc(s)}</span>`;

/* ---------- 1. labels from the data ---------- */

// codes: bible/greek/codes.json. Returns null when the code has no wording (the panel then says so).
export function describe(codes, code){
  const e = codes.codes[code];
  if (!e) return null;
  const f = {};
  for (const [k, v] of e.f) f[k] = f[k] ? f[k] + ", " + v : v;
  const low = s => s.toLowerCase();
  const person = (/^(1st|2nd|3rd)/.exec(f.Person || "") || [])[1];
  const parts = [f.Function || "Word"];
  if (f.Tense) parts.push(low(f.Tense.replace(/^2nd /, "")));
  if (f.Voice) parts.push(low(f.Voice).replace(/ deponent$/, " (deponent)"));
  if (f.Mood) parts.push(low(f.Mood));
  if (f.Form) parts.push(low(f.Form));
  const cng = [f.Case, f.Number, f.Gender].filter(Boolean).map(low).join(" ");
  if (person && !f.Case) parts.push(`${person} person${f.Number ? " " + low(f.Number) : ""}`);
  else if (cng) parts.push((person ? person + " person " : "") + cng);
  if (f.Extra) parts.push(low(f.Extra));
  if (f["Name type"]) parts.push("name (" + low(f["Name type"]) + ")");
  if (f["Original language"]) parts.push(low(f["Original language"]));
  return { f, person, parts, label: parts.join(" · "), meaning: e.m || "", example: e.x || "", fromMacula: e.src === "macula" };
}

export const ROLE_NAME = { s: "subject", v: "verb", vc: "linking verb", o: "object", o2: "second object", io: "indirect object", p: "predicate", adv: "adverbial", aux: "auxiliary" };
export const CLASS_NAME = { cl: "clause", np: "noun phrase", pp: "prepositional phrase", vp: "verb phrase", adjp: "adjective phrase", advp: "adverb phrase", nump: "number phrase", adv: "adverb phrase", conj: "conjunction" };
const article = s => (/^[aeiou]/.test(s) ? "an " : "a ") + s;

// What MACULA's tree says this word is doing. Returns lines of HTML (Greek already marked up and escaped).
export function functionOf(book, codes, i){
  const roles = codes.roles, classes = codes.classes;
  const roleOf = x => roles[typeof x === "number" ? book.role(x) : x[0][1]];
  const path = book.path(i);
  if (!path.length) return [];
  const verbOf = clause => {
    for (let k = 1; k < clause.length; k++) {
      const r = roleOf(clause[k]);
      if (r === "v" || r === "vc") return typeof clause[k] === "number" ? [clause[k]] : book.wordsOf(clause[k]);
    }
    return null;
  };
  const lines = [];
  let role = roles[book.role(i)], holder = null, clause = path[path.length - 1];
  if (!role) {
    for (let k = path.length - 1; k >= 1; k--) if (path[k][0][1]) { holder = path[k]; role = roles[holder[0][1]]; clause = path[k - 1]; break; }
  }
  let verb = role ? verbOf(clause) : null;
  if (verb && !holder && verb.length === 1 && verb[0] === i) verb = null;
  const vt = verb ? gk(book.phrase(verb)) : null;
  const noVerb = "a clause with no stated verb";
  if (role && !holder) {
    if (role === "v") lines.push("Verb of its clause.");
    else if (role === "vc") lines.push("Linking verb of its clause: it joins the subject and the predicate.");
    else if (role === "p") lines.push(vt ? `Predicate, joined to the subject by ${vt}.` : `Predicate of ${noVerb}.`);
    else if (role === "adv") lines.push(vt ? `Adverbial: it tells more about ${vt}.` : `Adverbial in ${noVerb}.`);
    else if (role === "aux") lines.push(vt ? `Auxiliary with ${vt}.` : "Auxiliary.");
    else lines.push(`${cap(ROLE_NAME[role])} of ${vt || noVerb}.`);
    // a verb whose whole clause has a job in a larger clause (for example an adverbial participle)
    if ((role === "v" || role === "vc") && clause[0][1] && path.length >= 2) {
      const outer = verbOf(path[path.length - 2]);
      const cr = roles[clause[0][1]];
      if (outer) lines.push(cr === "adv" ? `Its clause is adverbial: it tells more about ${gk(book.phrase(outer))}.` : `Its clause is the ${ROLE_NAME[cr]} of ${gk(book.phrase(outer))}.`);
    }
  } else if (role && holder) {
    const text = gk(book.phrase(book.wordsOf(holder)));
    const cls = CLASS_NAME[classes[holder[0][0]]] || "group";
    if (role === "v" || role === "vc") {
      lines.push(`Part of the ${ROLE_NAME[role]} of its clause: ${text}.`);
      if (book.rule(holder) === "BeVerb") lines.push("MACULA treats these words as one verb: a form of εἰμί with a participle.".replace("εἰμί", gk("εἰμί")));
    }
    else if (role === "p") lines.push(`Part of the predicate (${text})${vt ? `, joined to the subject by ${vt}` : ""}.`);
    else if (role === "adv") lines.push(`Part of ${article(cls)} (${text}) that tells more about ${vt || "its clause"}.`);
    else if (role === "aux") lines.push(`Part of an auxiliary (${text})${vt ? ` with ${vt}` : ""}.`);
    else lines.push(`Part of the ${ROLE_NAME[role]} (${text}) of ${vt || noVerb}.`);
  } else {
    lines.push(/^CONJ/.test(book.code_(i))
      ? "Connective. MACULA gives it no role inside a clause; it links what follows to what comes before."
      : "MACULA gives this word no role label of its own.");
  }
  // the phrase the word sits in, and that phrase's head word
  const p = path[path.length - 1], pc = classes[p[0][0]], head = p[0][3];
  if (pc && pc !== "cl" && head >= 0) {
    const name = CLASS_NAME[pc] || "group";
    if (head === i) { if (book.wordsOf(p).length > 1) lines.push(`Head word of its ${name}: ${gk(book.phrase(book.wordsOf(p)))}.`); }
    else lines.push(`Goes with ${gk(book.form(head))}, the head word of its ${name}.`);
  }
  const refs = book.referents(i);
  if (refs.length) {
    const here = book.verseOf(i);
    const where = r => { const v = book.verseOf(r); return v.c === here.c && v.v === here.v ? "" : ` (${v.c}:${v.v})`; };
    lines.push(`MACULA links this word back to ${refs.slice(0, 3).map(r => gk(book.form(r)) + where(r)).join(", ")}.`);
  }
  return lines;
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- 2. teaching notes (written for Akouō) ---------- */

const TENSE = {
  Present: "The present usually pictures the action as in progress, or states a general truth. In the indicative it is normally present time, though storytellers also use it for vivid past events.",
  Imperfect: "The imperfect pictures a past action as ongoing, repeated or attempted: \"was doing\", \"kept doing\", \"used to do\". It is found only in the indicative.",
  Aorist: "The aorist presents the action as a whole, without saying how long it took or whether it was repeated. In the indicative it normally refers to the past.",
  Future: "The future speaks of what will happen. Depending on context it can carry the force of a promise or a command.",
  Perfect: "The perfect usually describes a present state that results from a completed action: \"it has been written\", and so it stands written.",
  Pluperfect: "The pluperfect describes a state that existed in the past because of a still earlier action: \"had done\"."
};
const SECOND = "This verb builds the tense in the \"second\" pattern (a changed stem instead of an added ending). That is a difference of form only; the meaning is the same.";
const VOICE = [
  [/deponent/i, "This verb uses middle or passive forms where English uses an active verb (often called deponent). Translate it as the lexicon gives it."],
  [/middle or passive/i, "Middle and passive share one form in this tense. The verb and its context show which is meant."],
  [/^active/i, "The subject does the action."],
  [/^middle/i, "The subject acts with a personal interest or involvement in the action. English often has to translate it as an active."],
  [/^passive/i, "The subject receives the action. The doer may be named (often with ὑπό) or left unstated."]
];
const MOOD = {
  Indicative: "The action is stated or asked about as fact. This is the one mood where tense normally also tells you the time.",
  Subjunctive: "The action is presented as possible, intended or expected. It is common after ἵνα (purpose), ἐάν (if) and in \"let us\" statements.",
  Imperative: "A command, request or permission. Its tense shows how the action is viewed, not when it happens.",
  Optative: "A wish or a more remote possibility (\"may it be\"). It is rare in the New Testament.",
  Infinitive: "A verbal noun, \"to do\". It can complete another verb, give a purpose or result, or stand as a subject or object. It has no person or number.",
  Participle: "A verbal adjective. It agrees with a noun or pronoun in case, number and gender, and tells you more about that word or about the circumstances of the main verb. Its tense shows how the action is viewed and often its time in relation to the main verb."
};
const PERSON = {
  "1st": { Singular: "the one speaking (\"I\")", Plural: "the speaker together with others (\"we\")" },
  "2nd": { Singular: "the one spoken to (\"you\")", Plural: "those spoken to (\"you\", more than one)" },
  "3rd": { Singular: "someone or something spoken about (\"he\", \"she\" or \"it\")", Plural: "those spoken about (\"they\")" }
};
const CASE = {
  Nominative: { note: "Usually the subject of the verb, or a word that renames the subject after a linking verb.",
    uses: ["Subject of the verb", "Predicate after a linking verb (\"the Word was God\")", "In apposition, renaming another nominative", "Direct address, in place of a vocative"] },
  Genitive: { note: "Often translated \"of\". It limits or describes another word.",
    uses: ["Possession or relationship (\"the house of Peter\", \"son of David\")", "Description or quality", "Source or separation (\"from\", \"out of\")", "The whole of which something is a part", "The doer or the receiver of an action noun (\"the love of God\")", "After certain verbs, adjectives and prepositions", "Time within which, or comparison (\"greater than\")", "With a participle, a genitive absolute"] },
  Dative: { note: "Often translated \"to\", \"for\", \"in\", \"with\" or \"by\", with no separate Greek word behind the English one.",
    uses: ["Indirect object (\"to\" or \"for\" someone)", "Advantage or disadvantage", "Means or instrument (\"by\", \"with\")", "Sphere or place (\"in\")", "Time when", "Manner", "Association (\"with\")", "Reference (\"with respect to\")", "After certain verbs and prepositions"] },
  Accusative: { note: "Usually the direct object, or the limit an action reaches.",
    uses: ["Direct object of the verb", "A second object (\"he taught them many things\")", "Subject of an infinitive", "Extent of time or space", "After certain prepositions", "Adverbial, giving manner or respect"] },
  Vocative: { note: "The case of direct address.", uses: ["Calling on or speaking to someone"] }
};
const FUNCTION = [
  [/Definite article/, "The Greek article often works like \"the\", but it also marks out a noun, can turn another word or phrase into a noun, and can point back to something already mentioned. Its absence does not by itself mean \"a\"."],
  [/Preposition/, "A preposition takes its exact sense from the case of the word it governs and from the context. Check the case of the noun that follows."],
  [/Conjunction/, "A connective shows how this clause relates to the one before. Its usual sense is a starting point; the flow of the passage decides."],
  [/Relative pronoun/, "A relative pronoun takes its gender and number from the word it points back to, and its case from the job it does in its own clause."],
  [/Adjective/, "An adjective agrees with the noun it describes in case, number and gender. With the article and no noun it can itself stand as a noun (\"the good ones\")."],
  [/Negative Particle/, "οὐ negates statements of fact; μή is used with the other moods, with participles and infinitives."]
];
const NOM_PRONOUN = "A Greek verb already includes its subject. When a nominative pronoun is added as well, it is often there for emphasis or contrast.";
const CAREFUL_AORIST = "The aorist does not by itself mean \"once for all\" or \"at a single moment\". That idea has to come from the verb and the context, not from the tense.";
const CAREFUL_TENSE = "A tense form mostly shows how the writer chose to view the action. Be slow to build a point on the tense alone.";
export const CAREFUL_LEXICON = [
  "A lexicon lists the range of meanings a word can have. In any one sentence it carries one of them, not all at once.",
  "A word's history, or the parts it is built from, does not fix its meaning here. Usage in context does."
];

// Notes for a described code: { notes: [[heading, text]], careful: [text], caseUses: { name, uses } | null }
export function teach(d){
  const f = d.f, notes = [], careful = [];
  for (const [re, text] of FUNCTION) if (re.test(f.Function || "")) notes.push([f.Function, text]);
  if (f.Tense) {
    const base = f.Tense.replace(/^2nd /, "");
    if (TENSE[base]) notes.push([base, TENSE[base]]);
    if (/^2nd /.test(f.Tense)) notes.push(["Second " + base.toLowerCase(), SECOND]);
    careful.push(base === "Aorist" ? CAREFUL_AORIST : CAREFUL_TENSE);
  }
  if (f.Voice) { const v = VOICE.find(([re]) => re.test(f.Voice)); if (v) notes.push([f.Voice, v[1]]); }
  const mood = f.Mood || f.Form;
  if (mood && MOOD[mood]) notes.push([mood, MOOD[mood]]);
  if (d.person && !f.Case && PERSON[d.person] && PERSON[d.person][f.Number]) notes.push([`${d.person} person ${f.Number.toLowerCase()}`, `The subject is ${PERSON[d.person][f.Number]}.`]);
  if (/Personal pronoun/.test(f.Function || "") && f.Case === "Nominative") notes.push(["Nominative pronoun", NOM_PRONOUN]);
  let caseUses = null;
  if (f.Case && CASE[f.Case]) { notes.push([f.Case, CASE[f.Case].note]); caseUses = { name: f.Case.toLowerCase(), uses: CASE[f.Case].uses }; }
  return { notes, careful, caseUses };
}

// One field's teaching note, for explaining a parsing drill answer: noteFor("Tense", "2nd Aorist"), noteFor("Case", "Dative")
export function noteFor(field, value){
  if (!value) return "";
  if (field === "Tense") { const b = value.replace(/^2nd /, ""); return (TENSE[b] || "") + (/^2nd /.test(value) ? " " + SECOND : ""); }
  if (field === "Voice") { const v = VOICE.find(([re]) => re.test(value)); return v ? v[1] : ""; }
  if (field === "Mood" || field === "Form") return MOOD[value] || "";
  if (field === "Case") return CASE[value] ? CASE[value].note : "";
  if (field === "Person") { const p = PERSON[String(value).slice(0, 3)]; return p ? `The subject is ${p.Singular} in the singular, ${p.Plural} in the plural.` : ""; }
  if (field === "Number") return value === "Plural" ? "More than one." : value === "Singular" ? "One." : "";
  if (field === "Gender") return "Gender is grammatical: it shows which noun a word agrees with, not necessarily male or female.";
  return "";
}
export const CAREFUL = { aorist: CAREFUL_AORIST, tense: CAREFUL_TENSE };

/* ---------- 3. connectives: their usual sense (written for Akouō) ---------- */
// Used by the sentence-structure view to label the words that join clauses. These are the usual senses only;
// every one can do other jobs, and the context decides. Keyed by dictionary form (MACULA lemma).
export const CONNECTIVE = {
  "καί": "and, also, even: adds or joins",
  "δέ": "and, but, now: the next step, often a light contrast",
  "γάρ": "for: usually gives a reason or explanation",
  "οὖν": "therefore, so, then: usually draws a conclusion or picks the story up again",
  "ἀλλά": "but: a strong contrast, often correcting what came before",
  "ἵνα": "so that, that: usually purpose or result, sometimes the content of a request",
  "ὅτι": "that, because: what was said, known or seen, or a reason",
  "ὅπως": "so that, how: usually purpose",
  "ὥστε": "so that, therefore: a result",
  "εἰ": "if: a condition (with other words, whether or since)",
  "ἐάν": "if, whenever: a condition, usually with the subjunctive",
  "ὅταν": "whenever, when: time, often repeated or expected",
  "ὅτε": "when: time",
  "ὡς": "as, like, when, that: comparison, time or manner",
  "καθώς": "just as: comparison",
  "ὥσπερ": "just as: comparison",
  "διό": "therefore: a conclusion",
  "διότι": "because: a reason",
  "ἐπεί": "since, because: a reason",
  "ἐπειδή": "since, because: a reason",
  "μέν": "on the one hand: usually sets up a pair, often answered by δέ",
  "τε": "and, both: joins closely",
  "ἤ": "or, than",
  "οὐδέ": "and not, nor, not even",
  "μηδέ": "and not, nor, not even",
  "οὔτε": "neither, nor",
  "μήτε": "neither, nor",
  "πλήν": "but, however, except",
  "ἄρα": "so, then: a conclusion",
  "ἕως": "until, while: time",
  "πρίν": "before: time",
  "καίπερ": "although",
  "μήποτε": "lest, so that not: a negative purpose or a fear",
  "μή": "not, lest: in a clause of fear or warning, that not",
  "ὅθεν": "therefore, from where",
  "τοίνυν": "so then: a conclusion",
  "εἴτε": "whether, or"
};
export const CONNECTIVE_NOTE = "These are the usual senses of these words. Each can do other jobs; the context decides.";
// Who a verb's own ending points to, when no subject is stated
export const IN_THE_VERB = { "1st singular": "I", "1st plural": "we", "2nd singular": "you (one person)", "2nd plural": "you (more than one)", "3rd singular": "he, she or it", "3rd plural": "they" };
