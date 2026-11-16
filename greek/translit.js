// Akouō Plus, Greek Study Desk: Greek in English letters, for learning the alphabet.
// Words in the text use STEPBible's transliteration (book.translit). Words that are not in the text (dictionary forms,
// paradigm forms) are transliterated here with the same conventions: υ = u (hupo), χ = ch, γγ = ng (angelos),
// η = ē, ω = ō, θ = th, φ = ph, ψ = ps, ξ = x, rough breathing = h (ho, hagios), ῥ = rh; iota subscript is dropped.
const MAP = { α: "a", β: "b", γ: "g", δ: "d", ε: "e", ζ: "z", η: "ē", θ: "th", ι: "i", κ: "k", λ: "l", μ: "m", ν: "n", ξ: "x", ο: "o",
  π: "p", ρ: "r", σ: "s", ς: "s", τ: "t", υ: "u", φ: "ph", χ: "ch", ψ: "ps", ω: "ō" };
const VOWEL = /[αεηιουω]/;
const ROUGH = "̔";

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
