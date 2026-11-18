// Akouō Plus, Greek Study Desk: Greek in English letters, for learning the alphabet.
// Words in the text use STEPBible's transliteration (book.translit). Words that are not in the text (dictionary forms,
// paradigm forms) are transliterated here with the same conventions: υ = u (hupo), χ = ch, γγ = ng (angelos),
// η = ē, ω = ō, θ = th, φ = ph, ψ = ps, ξ = x, rough breathing = h (ho, hagios), ῥ = rh; iota subscript is dropped.
const MAP = { α: "a", β: "b", γ: "g", δ: "d", ε: "e", ζ: "z", η: "ē", θ: "th", ι: "i", κ: "k", λ: "l", μ: "m", ν: "n", ξ: "x", ο: "o",
  π: "p", ρ: "r", σ: "s", ς: "s", τ: "t", υ: "u", φ: "ph", χ: "ch", ψ: "ps", ω: "ō" };
const VOWEL = /[αεηιουω]/;
const ROUGH = "̔";

// One word letter by letter, for teaching sounds: [{ g: the Greek letter with its marks, t: its English letters,
// stress: true on the vowel (or both vowels of a pair) that carries the accent }]. A rough breathing comes first as
// { g: "", t: "h" }. Joined, the t values give the same English letters as translit().
const ACCENT = /[́̀͂]/, PAIRS = ["αι", "ει", "οι", "υι", "αυ", "ευ", "ηυ", "ου"];
export function parts(word){
  const ls = [];
  for (const ch of (word || "").normalize("NFD")) {
    if (/[̀-ͯͅ]/.test(ch)) { if (ls.length) ls[ls.length - 1].m += ch; }
    else ls.push({ c: ch, m: "" });
  }
  let rough = false;
  const out = ls.map((l, k) => {
    const lo = l.c.toLowerCase(), cap = l.c !== lo;
    let t = MAP[lo];
    if (t === undefined) return { g: l.c, t: l.c, stress: false };
    if (lo === "γ" && ls[k + 1] && ls[k + 1].c.toLowerCase() === "γ") t = "n";
    if (lo === "ρ" && l.m.includes(ROUGH)) t = "rh";
    if (VOWEL.test(lo) && l.m.includes(ROUGH) && k < 2) rough = true;
    return { g: (l.c + l.m).normalize("NFC"), t: cap ? t[0].toUpperCase() + t.slice(1) : t, stress: ACCENT.test(l.m), lo, dia: l.m.includes("̈") };
  });
  // an accent on the second vowel of a pair stresses the whole pair
  out.forEach((p, k) => { if (p.stress && k && !p.dia && PAIRS.includes((out[k - 1].lo || "") + p.lo)) out[k - 1].stress = true; });
  if (rough) {
    if (out[0] && /^[A-ZĒŌ]/.test(out[0].t)) { out[0].t = out[0].t.toLowerCase(); return [{ g: "", t: "H", stress: false }, ...out]; }
    return [{ g: "", t: "h", stress: false }, ...out];
  }
  return out;
}

export function translit(word){
  if (!word) return "";
  return word.split(/(\s+)/).map(one).join("");
}
function one(w){
  // letters with their marks
  const ls = [];
  for (const ch of w.normalize("NFD")) {
    if (/[̀-ͯͅ]/.test(ch)) { if (ls.length) ls[ls.length - 1].m += ch; }
    else ls.push({ c: ch, m: "" });
  }
  let out = "", rough = false;
  ls.forEach((l, k) => {
    const lo = l.c.toLowerCase(), cap = l.c !== lo;
    let t = MAP[lo];
    if (t === undefined) { out += l.c; return; }
    if (lo === "γ" && ls[k + 1] && ls[k + 1].c.toLowerCase() === "γ") t = "n";
    if (lo === "ρ" && l.m.includes(ROUGH)) t = "rh";
    if (VOWEL.test(lo) && l.m.includes(ROUGH) && k < 2) rough = true;
    out += cap ? t[0].toUpperCase() + t.slice(1) : t;
  });
  if (rough) out = /^[A-ZĒŌ]/.test(out) ? "H" + out[0].toLowerCase() + out.slice(1) : "h" + out;
  return out;
}
