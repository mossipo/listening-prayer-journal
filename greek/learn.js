// Akouō Plus, Greek Study Desk: Learn mode. What you know, your vocabulary deck and the passages you have studied,
// kept in one small document, users/{uid}/greek/learn:
//   known:   { lemma: when you marked it known }
//   deck:    { lemma: { k: Strong's number, g: gloss, b, c, v: where you met it, add: when added,
//                       ge: [box, due] Greek to English, eg: [box, due] English to Greek } }
//   studied: { "John 3:16-21": [when, book number, c1, v1, c2, v2] }
//   drill:   { n: answered, ok: right }
// Saves are merges of only what changed, so nothing saved elsewhere can be overwritten by a stale copy here.

// A simple Leitner scheme: a right answer moves a card up one box, a miss sends it back to the first box.
// The box decides when the card is next due.
export const BOX_DAYS = [0, 1, 2, 4, 8, 16, 32, 64];
// "Known" is honest: you marked the word known, or you recalled it both ways often enough to reach this box
// (four right answers in a row each way, spread over at least a week).
export const KNOWN_BOX = 4;
const DAY = 864e5, AGAIN = 10 * 60e3;

const blank = () => ({ known: {}, deck: {}, studied: {}, drill: { n: 0, ok: 0 } });

export class Learn {
  constructor(B, uid, sync){ this.B = B; this.uid = uid; this.sync = sync || (() => {}); this.s = blank(); this.ok = false; }

  async load(){
    try {
      const d = await this.B.getGreek(this.uid, "learn");
      const s = blank();
      if (d) for (const k of Object.keys(s)) if (d[k] && typeof d[k] === "object") s[k] = d[k];
      this.s = s; this.ok = true;
    } catch (e) { this.ok = false; }
    return this.ok;
  }
  async save(patch){
    this.sync("Saving…", "busy");
    try {
      await this.B.saveGreek(this.uid, "learn", patch);
      this.sync(navigator.onLine ? "Saved" : "Saved on this device", navigator.onLine ? "" : "off");
      return true;
    } catch (e) { this.sync("Not saved", "off"); return false; }
  }

  // known words
  marked(lemma){ return !!this.s.known[lemma]; }
  mastered(lemma){ const c = this.s.deck[lemma]; return !!c && c.ge[0] >= KNOWN_BOX && c.eg[0] >= KNOWN_BOX; }
  known(lemma){ return this.marked(lemma) || this.mastered(lemma); }
  setKnown(lemma, on){
    if (on) this.s.known[lemma] = Date.now(); else delete this.s.known[lemma];
    return this.save({ known: { [lemma]: on ? this.s.known[lemma] : null } });
  }
  knownCount(){ const set = new Set(Object.keys(this.s.known)); for (const l of Object.keys(this.s.deck)) if (this.mastered(l)) set.add(l); return set.size; }
  knownList(){ const set = new Set(Object.keys(this.s.known)); for (const l of Object.keys(this.s.deck)) if (this.mastered(l)) set.add(l); return [...set]; }

  // the deck
  card(lemma){ return this.s.deck[lemma] || null; }
  inDeck(lemma){ return !!this.s.deck[lemma]; }
  add(lemma, info){
    if (this.s.deck[lemma]) return Promise.resolve(true);
    const now = Date.now();
    const card = { k: info.k || 0, g: info.g || "", add: now, ge: [0, now], eg: [0, now + DAY] };
    if (info.b) Object.assign(card, { b: info.b, c: info.c, v: info.v });
    this.s.deck[lemma] = card;
    return this.save({ deck: { [lemma]: card } });
  }
  addMany(list){
    const now = Date.now(), patch = {};
    for (const [lemma, info] of list) {
      if (this.s.deck[lemma]) continue;
      const card = { k: info.k || 0, g: info.g || "", add: now, ge: [0, now], eg: [0, now + DAY] };
      if (info.b) Object.assign(card, { b: info.b, c: info.c, v: info.v });
      this.s.deck[lemma] = patch[lemma] = card;
    }
    return Object.keys(patch).length ? this.save({ deck: patch }) : Promise.resolve(true);
  }
  remove(lemma){ delete this.s.deck[lemma]; return this.save({ deck: { [lemma]: null } }); }
  // cards due now, Greek to English first, oldest due first
  due(now = Date.now()){
    const out = [];
    for (const [lemma, c] of Object.entries(this.s.deck)) for (const dir of ["ge", "eg"]) if (c[dir] && c[dir][1] <= now) out.push({ lemma, dir, at: c[dir][1] });
    return out.sort((a, b) => (a.dir === b.dir ? 0 : a.dir === "ge" ? -1 : 1) || a.at - b.at);
  }
  nextDue(lemma){ const c = this.s.deck[lemma]; return c ? Math.min(c.ge[1], c.eg[1]) : 0; }
  grade(lemma, dir, right){
    const c = this.s.deck[lemma]; if (!c) return Promise.resolve(false);
    const now = Date.now(), box = right ? Math.min(c[dir][0] + 1, BOX_DAYS.length - 1) : 0;
    c[dir] = [box, right ? now + BOX_DAYS[box] * DAY : now + AGAIN];
    return this.save({ deck: { [lemma]: { [dir]: c[dir] } } });
  }

  // passages and drills
  studied(label, bookNo, p){
    const row = [Date.now(), bookNo, p.c1, p.v1, p.c2, p.v2 === Infinity ? 999 : p.v2];
    this.s.studied[label] = row;
    return this.save({ studied: { [label]: row } });
  }
  recent(n = 8){ return Object.entries(this.s.studied).sort((a, b) => b[1][0] - a[1][0]).slice(0, n).map(([label]) => label); }
  drilled(right){ this.s.drill.n++; if (right) this.s.drill.ok++; return this.save({ drill: { n: this.s.drill.n, ok: this.s.drill.ok } }); }

  // share of the words (tokens) in these verses whose dictionary form you know
  share(book, verses){
    let n = 0, k = 0;
    for (const v of verses) for (let i = v.a; i < v.z; i++) { n++; if (this.known(book.lemma(i))) k++; }
    return { n, k, pct: n ? Math.round(100 * k / n) : 0 };
  }
}

export const inDays = t => {
  const d = Math.round((t - Date.now()) / DAY);
  return d <= 0 ? "due now" : d === 1 ? "due tomorrow" : `due in ${d} days`;
};
