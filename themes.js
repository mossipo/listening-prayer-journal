// Finds what keeps coming up across journal entries: repeated phrases, repeated words,
// and Scripture chapters that return. Pure functions, no storage.

// Words that carry no theme on their own (articles, pronouns, helpers, divine names).
const FUNC = new Set(("a an the and or but nor so yet of to in on at for with from by as into onto upon about over under " +
  "is are was were be been being am do does did doing have has had having will would shall should can could may might must " +
  "i me my mine myself you your yours yourself we us our ours he him his she her it its they them their this that these those " +
  "what which who whom whose when where why how there here then than not no yes oh just also very really too only even still " +
  "lord god jesus christ father amen im ive id ill dont youre its thats theres lets").split(" "));
// Extra words too common to be a theme when they stand alone.
const STOP = new Set([...FUNC, ..."all any some more most much many lot one two thing things way time today day days week weeks year now always never ever get got go going goes went come came coming make made makes see saw say said tell told know knew want wants need needs like thank thanks please let give gave take took keep put feel felt think thought good great little well back".split(" ")]);
// Words that should not begin or end a phrase.
const GLUE = new Set("a an the and or but nor of to in on at for with from by as is are was were be been that this it so than then into onto upon".split(" "));

const BOOKS = {};
[["Genesis","gen"],["Exodus","ex exod"],["Leviticus","lev"],["Numbers","num"],["Deuteronomy","deut dt"],["Joshua","josh"],["Judges","judg"],["Ruth",""],
 ["Samuel","sam"],["Kings","kgs"],["Chronicles","chr chron"],["Ezra",""],["Nehemiah","neh"],["Esther","esth"],["Job",""],["Psalm","ps psa pss psalms"],
 ["Proverbs","prov pr"],["Ecclesiastes","eccl ecc"],["Song of Songs","song"],["Isaiah","isa"],["Jeremiah","jer"],["Lamentations","lam"],["Ezekiel","ezek"],
 ["Daniel","dan"],["Hosea","hos"],["Joel",""],["Amos",""],["Obadiah","obad"],["Jonah",""],["Micah","mic"],["Nahum","nah"],["Habakkuk","hab"],
 ["Zephaniah","zeph"],["Haggai","hag"],["Zechariah","zech"],["Malachi","mal"],["Matthew","matt mt"],["Mark","mk"],["Luke","lk"],["John","jn"],
 ["Acts",""],["Romans","rom"],["Corinthians","cor"],["Galatians","gal"],["Ephesians","eph"],["Philippians","phil"],["Colossians","col"],
 ["Thessalonians","thess"],["Timothy","tim"],["Titus",""],["Philemon","phlm philem"],["Hebrews","heb"],["James","jas"],["Peter","pet"],["Jude",""],["Revelation","rev"]
].forEach(([name, abbr]) => { BOOKS[name.toLowerCase().split(" ")[0]] = name; abbr.split(" ").filter(Boolean).forEach(a => BOOKS[a] = name); });
const NUMBERED = new Set(["Samuel","Kings","Chronicles","Corinthians","Thessalonians","Timothy","Peter","John"]);
const REF = /\b([1-3])?\s?([A-Za-z]+)\.?\s+(\d{1,3})(?=[:\s.,;)]|$)/g;

// Text the person wrote that may carry what God is saying (not questions they asked or routine thanks).
export function themeText(e){
  const out = [];
  (e.thread || []).forEach(l => { if (l.r === "G" && l.t) out.push(l.t); });
  ["standout","message","obedience","notes","what","prayer"].forEach(k => { if (e[k]) out.push(e[k]); });
  (e.actions || []).forEach(a => a.t && out.push(a.t));
  return out.join("\n");
}
function allText(e){
  const out = [];
  const walk = v => { if (typeof v === "string") out.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === "object") Object.values(v).forEach(walk); };
  walk(e); return out.join("\n");
}

export function passagesIn(text){
  const found = new Set(); let m;
  REF.lastIndex = 0;
  while ((m = REF.exec(text))){
    const book = BOOKS[m[2].toLowerCase()]; if (!book) continue;
    const ch = +m[3]; if (!ch) continue;
    const num = m[1] && NUMBERED.has(book) ? m[1] + " " : "";
    found.add(num + book + " " + ch);
  }
  return found;
}

export function findThemes(entries, hidden = []){
  const hide = new Set(hidden.map(h => h.toLowerCase()));
  const docs = entries.filter(e => ["journal","smorp","weigh"].includes(e.type));
  const phraseDocs = new Map(), wordDocs = new Map(), passDocs = new Map();
  const add = (map, key, id) => { let s = map.get(key); if (!s) map.set(key, s = new Set()); s.add(id); };
  let analysed = 0;
  for (const e of docs){
    const text = themeText(e).toLowerCase().replace(/[‘’]/g, "'");
    passagesIn(allText(e)).forEach(p => add(passDocs, p, e.id));
    if (!text.trim()) continue;
    analysed++;
    for (const clause of text.split(/[.!?;:,\n()"“”]+/)){
      const toks = (clause.match(/[a-z][a-z']*/g) || []).map(t => t.replace(/'/g, ""));
      toks.forEach(t => { if (t.length >= 4 && !STOP.has(t)) add(wordDocs, t, e.id); });
      for (let n = 2; n <= 4; n++){
        for (let i = 0; i + n <= toks.length; i++){
          const g = toks.slice(i, i + n);
          if (GLUE.has(g[0]) || GLUE.has(g[n - 1])) continue;
          if (!g.some(t => !FUNC.has(t) && t.length >= 3)) continue;
          add(phraseDocs, g.join(" "), e.id);
        }
      }
    }
  }
  const result = { analysed, phrases: [], words: [], passages: [] };
  if (analysed < 3 && passDocs.size === 0) return result;

  let phrases = [...phraseDocs].filter(([p, s]) => s.size >= 2 && !hide.has(p))
    .map(([p, s]) => ({ q: p, label: p, n: s.size, ids: [...s], len: p.split(" ").length }))
    .sort((a, b) => b.n - a.n || b.len - a.len);
  const kept = [];
  for (const p of phrases){
    // Skip a phrase already covered by a longer kept phrase found in as many entries.
    if (kept.some(k => k.n >= p.n && (" " + k.q + " ").includes(" " + p.q + " "))) continue;
    // Replace shorter kept phrases that this longer one covers equally.
    for (let i = kept.length - 1; i >= 0; i--){ if (p.n >= kept[i].n && (" " + p.q + " ").includes(" " + kept[i].q + " ")) kept.splice(i, 1); }
    kept.push(p);
    if (kept.length >= 5) break;
  }
  result.phrases = kept;
  const inPhrase = w => kept.some(k => k.q.split(" ").includes(w));
  result.words = [...wordDocs].filter(([w, s]) => s.size >= 3 && !hide.has(w) && !inPhrase(w))
    .map(([w, s]) => ({ q: w, label: w, n: s.size, ids: [...s] }))
    .sort((a, b) => b.n - a.n || a.q.localeCompare(b.q)).slice(0, 4);
  result.passages = [...passDocs].filter(([p, s]) => s.size >= 2 && !hide.has(p.toLowerCase()))
    .map(([p, s]) => ({ q: p.toLowerCase(), label: p, n: s.size, ids: [...s] }))
    .sort((a, b) => b.n - a.n).slice(0, 4);
  return result;
}
