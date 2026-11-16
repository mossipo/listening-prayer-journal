// Greek Study Desk: loading and reading the data in bible/greek/ (built by tools/greek, see its README).
// Files are fetched when first needed and kept on the device by the service worker. bible/greek/index.json carries
// a data version; when it changes, each file is fetched fresh the next time it is needed.
import { findBook } from "../bible.js";

const BASE = "./bible/greek/";
const mem = new Map();
let index = null;

const store = {
  get(k, d){ try { const v = localStorage.getItem("akouo.greek." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v){ try { localStorage.setItem("akouo.greek." + k, JSON.stringify(v)); } catch (e) {} }
};
export const pref = store.get, setPref = store.set;

async function fetchJSON(url, fresh){
  const res = await fetch(url, fresh && navigator.onLine ? { cache: "reload" } : undefined);
  if (!res.ok) throw new Error("missing " + url);
  return res.json();
}
// One request per file per visit. A file is fetched fresh once after the data version changes.
function file(rel){
  if (!mem.has(rel)) {
    const seen = store.get("files", {});
    const stale = !!index && seen[rel] !== index.v;
    mem.set(rel, fetchJSON(BASE + rel, stale).then(data => {
      if (index && stale) { const s = store.get("files", {}); s[rel] = index.v; store.set("files", s); }
      return data;
    }).catch(err => { mem.delete(rel); throw err; }));
  }
  return mem.get(rel);
}

export async function loadIndex(){
  if (!index) index = await fetchJSON(BASE + "index.json", true);
  return index;
}
export const hasBook = code => !!(index && index.books[code]);
export const loadCodes = () => file("codes.json");
export const loadOcc = () => file("occ.json");
export async function loadBook(code){ return new Book(await file(code + ".json")); }
// Abbott-Smith and Thayer for a Strong's number: { as, th } or null
export async function fullLex(num){
  if (!num) return null;
  const block = await file("lex/G" + Math.floor(num / (index.lexBlock || 250)) + ".json");
  return block[String(num)] || null;
}

// BSB English, verse by verse, from the files Akouō already has (bible/bsb): Map "c:v" -> text
const bsbMem = new Map();
export function bsbVerses(code){
  if (!bsbMem.has(code)) bsbMem.set(code, fetchJSON("./bible/bsb/" + code + ".json").then(data => {
    const out = new Map();
    data.c.forEach((ch, ci) => {
      let cur = 0;
      for (const t of ch) {
        if (typeof t[0] !== "number") continue;
        if (t[0] > 0) cur = t[0];
        if (!cur) continue;
        const k = (ci + 1) + ":" + cur;
        out.set(k, (out.has(k) ? out.get(k) + " " : "") + t[1]);
      }
    });
    return out;
  }).catch(err => { bsbMem.delete(code); throw err; }));
  return bsbMem.get(code);
}

// New Testament books in order, as bible.js names them: [name, code, chapters, ...]
export const NT_CODES = ["MAT","MRK","LUK","JHN","ACT","ROM","1CO","2CO","GAL","EPH","PHP","COL","1TH","2TH","1TI","2TI","TIT","PHM","HEB","JAS","1PE","2PE","1JN","2JN","3JN","JUD","REV"];
export const NT_BOOKS = NT_CODES.map(c => findBook(c));

// One book. Words are numbered from 0 in text order; every accessor takes a word number.
export class Book {
  constructor(d){
    this.d = d; this.code = d.b; this.n = d.w.f.length;
    this.vcount = d.vs.length / 3;
  }
  form(i){ return this.d.F[this.d.w.f[i]]; }
  before(i){ return this.d.pre[i] || ""; }
  after(i){ return this.d.P[this.d.w.p[i]]; }
  translit(i){ return this.d.T[this.d.w.f[i]]; }
  lemma(i){ return this.d.L[this.d.w.l[i]][0]; }
  strong(i){ return this.d.L[this.d.w.l[i]][1]; }
  code_(i){ return this.d.M[this.d.w.m[i]]; }
  stepCode(i){ const t = this.d.td[i]; return t == null ? null : this.d.M[t]; }
  gloss(i){ return this.d.G[this.d.w.g[i]]; }
  glossSource(i){ return ["Berean Interlinear", "Cherith (Andi Wu)", "STEPBible"][this.d.gs[i] || 0]; }
  role(i){ return this.d.w.r[i]; }
  bsb(i){ return this.d.E[this.d.w.e[i]]; }
  bsbApprox(i){ return !!this.d.ea[i]; }
  bsbNum(i){ return this.d.w.e[i] ? (this.d.bx[i] || this.strong(i)) : 0; }
  referents(i){ return this.d.ref[i] || []; }

  // verses
  verseIndex(i){ // which verse (0-based position in vs) holds word i
    const vs = this.d.vs; let lo = 0, hi = this.vcount - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (vs[m * 3 + 2] <= i) lo = m; else hi = m - 1; }
    return lo;
  }
  verseAt(k){ const vs = this.d.vs; return { c: vs[k * 3], v: vs[k * 3 + 1], a: vs[k * 3 + 2], z: k + 1 < this.vcount ? vs[k * 3 + 5] : this.n }; }
  verseOf(i){ return this.verseAt(this.verseIndex(i)); }
  findVerse(c, v){ const vs = this.d.vs; for (let k = 0; k < this.vcount; k++) if (vs[k * 3] === c && vs[k * 3 + 1] === v) return k; return -1; }
  // the verses of a passage { c1, v1, c2, v2 } (v2 may be Infinity), as verseAt() objects
  verses(r){
    const out = [];
    for (let k = 0; k < this.vcount; k++) {
      const c = this.d.vs[k * 3], v = this.d.vs[k * 3 + 1];
      if (c < r.c1 || c > r.c2 || (c === r.c1 && v < r.v1) || (c === r.c2 && v > r.v2)) continue;
      out.push(this.verseAt(k));
    }
    return out;
  }
  lastVerse(c){ let m = 0; for (let k = 0; k < this.vcount; k++) if (this.d.vs[k * 3] === c) m = Math.max(m, this.d.vs[k * 3 + 1]); return m; }

  // sentences and trees. A node is [[class, role, rule, head, flags], child, ...]; a child that is a number is a word.
  sentenceIndex(i){ const ss = this.d.ss; let lo = 0, hi = ss.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (ss[m] <= i) lo = m; else hi = m - 1; } return lo; }
  tree(i){ return this.d.s[this.sentenceIndex(i)]; }
  // the groups that contain word i, outermost first
  path(i){
    const out = [];
    const walk = nd => {
      for (let k = 1; k < nd.length; k++) {
        const ch = nd[k];
        if (ch === i) { out.push(nd); return true; }
        if (typeof ch !== "number" && walk(ch)) { out.unshift(nd); return true; }
      }
      return false;
    };
    walk(this.tree(i));
    return out;
  }
  wordsOf(nd){ const out = []; const walk = x => { for (let k = 1; k < x.length; k++) typeof x[k] === "number" ? out.push(x[k]) : walk(x[k]); }; walk(nd); return out.sort((a, b) => a - b); }
  rule(nd){ return this.d.R[nd[0][2]]; }
  phrase(ids, max = 7){ const t = ids.slice(0, max).map(i => this.form(i)).join(" "); return ids.length > max ? t + " …" : t; }
}
