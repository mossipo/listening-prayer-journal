// Akouō Greek School: the Erasmian sounds taught at Level 0, the classroom pronunciation used by Machen's
// New Testament Greek for Beginners (1923, Lesson I) and most English-speaking grammars. English letters follow the
// same conventions as the Study Desk (greek/translit.js). Every sound is an English approximation, as Machen's are.

// [small, capital, name, English letters, sound, how to write it]
export const LETTERS = [
  ["α", "Α", "alpha", "a", "a as in father", "One stroke, like a small fish facing left. No hook on top as in a printed English a."],
  ["β", "Β", "beta", "b", "b as in boy", "A tall loop that starts below the line."],
  ["γ", "Γ", "gamma", "g", "g as in go", "Like a y whose tail drops below the line."],
  ["δ", "Δ", "delta", "d", "d as in dog", "Start with the curl at the top, then the round body on the line."],
  ["ε", "Ε", "epsilon", "e", "e as in get", "Like a backwards 3."],
  ["ζ", "Ζ", "zeta", "z", "dz as in adze", "Like a z with a tail that curls below the line."],
  ["η", "Η", "eta", "ē", "ey as in obey", "Like an n whose right leg drops below the line."],
  ["θ", "Θ", "theta", "th", "th as in thin", "An oval with a bar across the middle."],
  ["ι", "Ι", "iota", "i", "i as in pit, or as in machine when long", "A short stroke with no dot."],
  ["κ", "Κ", "kappa", "k", "k as in kit", "Like a small k, both arms short."],
  ["λ", "Λ", "lambda", "l", "l as in law", "A long stroke leaning right, with a short leg from the middle."],
  ["μ", "Μ", "mu", "m", "m as in me", "Like a u with a tail down on the left."],
  ["ν", "Ν", "nu", "n", "n as in now", "Like a v, pointed at the bottom. Never round like an English n."],
  ["ξ", "Ξ", "xi", "x", "x as in axe", "Three small curves stacked, with a tail below the line."],
  ["ο", "Ο", "omicron", "o", "o as in lot", "A small round o."],
  ["π", "Π", "pi", "p", "p as in pet", "Two legs under a flat roof."],
  ["ρ", "Ρ", "rho", "r", "r as in run", "Start at the bottom of the tail and finish with the loop. It looks like a p but is an r."],
  ["σ", "Σ", "sigma", "s", "s as in sit", "A circle with a short flat tail at the top right. At the end of a word it is written ς."],
  ["τ", "Τ", "tau", "t", "t as in top", "A flat bar with a short stem, no curl at the bottom."],
  ["υ", "Υ", "upsilon", "u", "oo as in boot (strict teachers use the French u)", "Like a u with a round bottom and no tail."],
  ["φ", "Φ", "phi", "ph", "ph as in phone", "A circle with a line through it from top to bottom."],
  ["χ", "Χ", "chi", "ch", "ch as in the Scottish loch", "Like an x that drops below the line."],
  ["ψ", "Ψ", "psi", "ps", "ps as in lips", "A u shape with a long stem through it, like a trident."],
  ["ω", "Ω", "omega", "ō", "o as in tone", "Like a w with round bottoms."]
];
export const letter = g => LETTERS.find(l => l[0] === g || (g === "ς" && l[0] === "σ"));

// [pair, English letters, sound, example]
export const PAIRS = [
  ["αι", "ai", "ai as in aisle", "καί"],
  ["ει", "ei", "ei as in eight", "εἰς"],
  ["οι", "oi", "oi as in oil", "οἶδα"],
  ["υι", "ui", "ui as in suite", "υἱός"],
  ["αυ", "au", "ow as in cow", "αὐτός"],
  ["ευ", "eu", "eu as in feud", "εὐθύς"],
  ["ου", "ou", "ou as in soup", "οὐ"]
];
// [mark, name, what it does]
export const MARKS = [
  ["ἁ", "rough breathing", "an h sound before the word"],
  ["ἀ", "smooth breathing", "no sound at all"],
  ["ᾳ", "iota written under (iota subscript)", "silent; it is still part of the spelling"]
];
export const ACCENTS = [
  ["ά", "acute", "rises to the right"],
  ["ὰ", "grave", "falls to the right; only on the last syllable"],
  ["ᾶ", "circumflex", "a small wave; only on a long vowel or a pair"]
];
// [mark, name, what it means]
export const PUNCT = [
  [",", "comma", "a comma"],
  [".", "full stop", "the end of a sentence"],
  ["·", "raised dot", "a colon or semicolon"],
  [";", "Greek question mark", "a question mark"]
];
// What a beginner tends to read each letter as: used to make wrong answers that teach something
export const LOOKS_LIKE = { η: "n", ν: "v", ρ: "p", υ: "y", χ: "x", ω: "w", γ: "y", ς: "c", ι: "l", σ: "o", ζ: "s", ξ: "e", θ: "o" };
