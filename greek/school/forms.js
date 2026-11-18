// Akouō Greek School: helpers for writing paradigm tables in the lesson files (level3.js, level4.js).
// gendered() makes a three-gender grid to show, plus a hidden table per gender so every form can be asked about in
// exercises and checked against the New Testament data by the tests.
const SLOTS = [["nominative singular", "NS"], ["genitive singular", "GS"], ["dative singular", "DS"], ["accusative singular", "AS"],
  ["nominative plural", "NP"], ["genitive plural", "GP"], ["dative plural", "DP"], ["accusative plural", "AP"]];
const G = [["masculine", "M"], ["feminine", "F"], ["neuter", "N"]];

// rows: 8 rows of [masculine, feminine, neuter] in the order of SLOTS; prefix: the code before the case letters ("V-PAP-")
export function gendered(caption, model, prefix, rows){
  const out = [{ grid: { caption, head: ["", "Masculine", "Feminine", "Neuter"], el: [1, 2, 3], rows: SLOTS.map(([label], k) => [label, ...rows[k]]) } }];
  G.forEach(([g, letter], j) => out.push({ table: { title: `${caption}, ${g}`, model, kind: "noun", hidden: true,
    rows: SLOTS.map(([label, cn], k) => [label, "", rows[k][j], prefix + cn + letter]) } }));
  return out;
}
// one table of person and number: forms[k] = [ending, form]; persons: which of the six to include (imperatives have no 1st person)
const PN = [["1st singular", "1S"], ["2nd singular", "2S"], ["3rd singular", "3S"], ["1st plural", "1P"], ["2nd plural", "2P"], ["3rd plural", "3P"]];
export const pn = (prefix, forms, persons = [0, 1, 2, 3, 4, 5]) => persons.map((p, k) => [PN[p][0], forms[k][0], forms[k][1], prefix + PN[p][1]]);
// one table of case and number: forms[k] = [ending, form]
export const cn = (prefix, gender, forms) => SLOTS.map(([label, c], k) => [label, forms[k][0], forms[k][1], prefix + c + gender]);
