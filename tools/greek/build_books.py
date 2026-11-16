"""Per-book files for the Greek Study Desk: bible/greek/CODE.json.

Words, grammar and sentence trees come from MACULA Greek (SBLGNT edition). Punctuation comes from the printed
SBLGNT. Transliteration and a second parsing come from STEPBible's TAGNT, matched word by word. The English
rendering of each word comes from the BSB word links already in Akouō (bible/words).

Format (see docs/greek-study/PLAN.md, section 5):
  F forms, T transliteration per form, L [lemma, Strong's number], M grammar codes, G glosses, E BSB renderings,
  R MACULA rule names, P punctuation after a word
  w   one entry per word in text order: f, p, l, m, g, r (role), e (BSB rendering, 0 = none)
  bx  the BSB's Strong's number for a word, where it is not the number in L
  pre punctuation before a word; gs gloss source when not Berean (1 Cherith, 2 STEPBible)
  ea  BSB rendering matched only approximately; td STEPBible's grammar code where it differs from MACULA's
  ref pronoun -> word(s) MACULA says it refers to; sr verb -> its understood subject
  vs  chapter, verse, index of first word (flat); ss first word of each sentence
  bv  word -> [chapter, verse] of the BSB verse that holds it, where that is not its SBLGNT verse
  pt  named grammar patterns: [[id, [word numbers], extra]...] (see patterns.py)
  nx  verses the SBLGNT does not print, added from MACULA's Nestle 1904 edition: {verses: [[c, v]...], note}
  s   one tree per sentence: node = [[class, role, rule, head word, flags], child, ...]; a child that is a number is a word
"""
import difflib
import re
from collections import Counter, OrderedDict, defaultdict

from patterns import IDS as PATTERN_IDS, find as find_patterns
from common import (BY_CODE, CLASSES, F_APPOSITION, F_ARTICULAR, F_ELIDED, F_GROUP, F_NOMINALIZED, F_VERBLESS, ROLES,
                    Table, XID, akouo_json, bsb_groups, load_heads, load_nestle_extra, load_sblgnt, NESTLE_NOTE, load_sentences, loose_equal, nfc,
                    norm_greek, strong_nums, wref, write_json)

ELISION = "ʼ’᾿'"
EDGE_PUNCT = ".,;·:()[]⟦⟧—–\"“”‘0123456789"


def split_token(tok, core):
    """Split a printed SBLGNT token into (before, word, after) around MACULA's word. Returns None when the spelling differs."""
    j = tok.find(core)
    if j < 0:
        return None
    pre, post = tok[:j], tok[j + len(core):]
    if post[:1] and post[0] in ELISION:      # the elision mark belongs to the word as written
        core, post = core + post[0], post[1:]
    return pre, core, post


def link_tagnt(a, rows):
    """Match MACULA words (normalised spellings a) to STEPBible rows of the same verse.
    Returns ({position: row index}, counts by how the match was made)."""
    how = Counter()
    link, used = {}, set()
    sbl = [j for j, r in enumerate(rows) if r["sbl"]]
    sm = difflib.SequenceMatcher(None, a, [rows[j]["n"] for j in sbl], autojunk=False)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            link[blk.a + k] = sbl[blk.b + k]
            used.add(sbl[blk.b + k])
            how["in order"] += 1
    # words left over: look between the neighbours that did match, allowing small spelling differences
    for k in range(len(a)):
        if k in link:
            continue
        lo = max((link[x] for x in link if x < k), default=-1)
        hi = min((link[x] for x in link if x > k), default=len(rows))
        gap = [j for j in range(lo + 1, hi) if j not in used]
        pick = next((j for j in gap if rows[j]["sbl"] and loose_equal(a[k], rows[j]["n"])), None)
        if pick is None:
            pick = next((j for j in gap if loose_equal(a[k], rows[j]["n"])), None)
        if pick is not None:
            link[k] = pick
            used.add(pick)
            how["spelling variant in place"] += 1
    # still left: the same word anywhere else in the verse (another edition's word order)
    for k in range(len(a)):
        if k in link:
            continue
        pick = next((j for j, r in enumerate(rows) if j not in used and r["n"] == a[k]), None)
        if pick is None:
            pick = next((j for j, r in enumerate(rows) if j not in used and loose_equal(a[k], r["n"])), None)
        if pick is not None:
            link[k] = pick
            used.add(pick)
            how["elsewhere in the verse"] += 1
    return link, how


def lex_key(lemma, cands, lex, by_lemma):
    """The Strong's number under which Akouō's lexicon files hold this word. Returns (number, found)."""
    nl = norm_greek(lemma)
    for n in cands:
        if n in lex and norm_greek(lex[n].get("l", "")) == nl:
            return n, True
    if nfc(lemma) in by_lemma:
        return by_lemma[nfc(lemma)], True
    for n in cands:
        if n in lex:
            return n, True
    return (cands[0] if cands else 0), False


def match_bsb(cands, groups):
    """Pair Greek words of a verse with BSB word groups by Strong's number.
    cands: one list of candidate numbers per Greek word. groups: [(English, number)].
    A number that occurs equally often on both sides is paired in order. Where the counts differ (English often has
    fewer articles than Greek), each English group goes to the unpaired Greek word nearest to where its already-paired
    neighbours say it should be. Any pairing that rests on position (the number occurs more than once in the verse)
    is marked approximate, because English can reorder repeated words.
    Returns ({word position: (English, number, approximate)}, English groups left unpaired)."""
    by_num = OrderedDict()
    for gi, (text, s) in enumerate(groups):
        if s:
            by_num.setdefault(abs(s), []).append(gi)
    pair, taken, left = {}, set(), 0          # pair: English group index -> (Greek word position, approximate)
    later = []
    for num, gis in by_num.items():
        ks = [k for k in range(len(cands)) if num in cands[k] and k not in taken]
        if not ks:
            left += len(gis)
        elif len(ks) == len(gis):
            for gi, k in zip(gis, ks):
                pair[gi] = (k, len(ks) > 1)      # a repeated word is paired by position, which English may reorder
            taken.update(ks)
        else:
            later.append((num, gis))
    for num, gis in later:
        ks = [k for k in range(len(cands)) if num in cands[k] and k not in taken]
        if not ks:
            left += len(gis)
            continue
        anchors = sorted((gi, k) for gi, (k, _) in pair.items())
        chosen = []
        for gi in gis:
            before = [(g, k) for g, k in anchors if g < gi]
            after = [(g, k) for g, k in anchors if g > gi]
            guess = [before[-1][1] + (gi - before[-1][0])] if before else []
            guess += [after[0][1] - (after[0][0] - gi)] if after else []
            want = sum(guess) / len(guess) if guess else gi * len(cands) / max(1, len(groups))
            free = [k for k in ks if k not in taken]
            k = min(free or chosen, key=lambda x: (abs(x - want), x))
            pair[gi] = (k, True)
            taken.add(k)
            chosen.append(k)
    got = {}
    for gi in sorted(pair):
        k, approx = pair[gi]
        e = got.setdefault(k, [[], abs(groups[gi][1]), False])
        e[0].append(groups[gi][0])
        e[2] = e[2] or approx or groups[gi][1] < 0
    return {k: (" … ".join(t for t in e[0] if t), e[1], e[2]) for k, e in got.items()}, left


def build_book(code, tagnt, lex, by_lemma):
    """Build bible/greek/CODE.json. Returns (stats for index.json, report for report.json)."""
    rep = {"spelling differs from the printed SBLGNT": [], "error roles dropped": [], "unlinked to STEPBible": [],
           "no gloss in any source": [], "gloss 'None' treated as missing": [], "not in Akouō's short lexicon": {},
           "referent outside this book dropped": 0, "verse numbering": []}
    sents = load_sentences(code)
    heads = load_heads(code)
    sbl = load_sblgnt(code)
    nx_sents, nx_heads, nx_lines = load_nestle_extra(code)
    sents += nx_sents
    heads.update(nx_heads)
    for k in nx_lines:
        if k in sbl:
            raise SystemExit(f"{code} {k}: the SBLGNT already prints this verse")
    sbl.update(nx_lines)
    bsb = akouo_json("bsb", code + ".json")
    wl = akouo_json("words", code + ".json")

    allw = sorted((w for s in sents for w in s.iter("w")), key=lambda w: wref(w)[1:])
    idx = {w.get(XID): i for i, w in enumerate(allw)}
    if len(idx) != len(allw):
        raise SystemExit(f"{code}: a word id appears twice")
    verses = OrderedDict()
    for i, w in enumerate(allw):
        _, c, v, _ = wref(w)
        verses.setdefault((c, v), []).append(i)

    F, L, M, G, E, R, P = Table(), Table(), Table(), Table(), Table(""), Table(""), Table()
    tr_of = {}
    n = len(allw)
    col = {k: [0] * n for k in ("f", "p", "l", "m", "g", "r", "e")}
    pre, gs, ea, td, ref, sr, vs, bx, bv = {}, {}, {}, {}, {}, {}, [], {}, {}
    to_bsb = OrderedDict()      # BSB verse -> [(word, candidate Strong's numbers)] in text order
    moves = defaultdict(list)   # (SBLGNT verse, other verse) -> [(word, numbers)] that another edition numbers differently
    bsb_nums = {k: {abs(x) for x in lst[1::2] if x} for k, lst in wl.items()}
    how_linked, gloss_src, bsb_left, bsb_linked = Counter(), Counter(), 0, 0
    parse = Counter()

    for (c, v), ids in verses.items():
        vs += [c, v, ids[0]]
        line = sbl.get((c, v))
        if line is None:
            raise SystemExit(f"{code} {c}:{v} is in MACULA but not in the SBLGNT text")
        toks = line.split()
        if len(toks) != len(ids):
            raise SystemExit(f"{code} {c}:{v}: MACULA has {len(ids)} words, the SBLGNT line has {len(toks)}")
        rows = tagnt.get((code, c, v), [])
        a = [norm_greek(allw[i].text) for i in ids]
        link, how = link_tagnt(a, rows)
        how_linked.update(how)
        cands = []
        for k, i in enumerate(ids):
            w = allw[i]
            # the word as printed, with its punctuation
            sp = split_token(toks[k], nfc(w.text))
            if sp is None:
                form = toks[k].strip(EDGE_PUNCT)
                j = toks[k].find(form)
                sp = (toks[k][:j], form, toks[k][j + len(form):])
                rep["spelling differs from the printed SBLGNT"].append(f"{code} {c}:{v} word {k + 1}: MACULA {w.text}, printed {form}")
            if sp[0]:
                pre[i] = sp[0]
            col["f"][i] = F(sp[1])
            col["p"][i] = P(sp[2])
            # STEPBible: transliteration, Strong's numbers, second parsing
            t = rows[link[k]] if k in link else None
            if t is None:
                rep["unlinked to STEPBible"].append(f"{code} {c}:{v} {w.text}")
            elif col["f"][i] not in tr_of and t["tr"]:
                tr_of[col["f"][i]] = t["tr"]
            nums = (strong_nums(t["ds"]) if t else []) + [int(x) for x in re.findall(r"\d+", w.get("strong"))] + (strong_nums(t["alt"]) if t else [])
            nums = list(OrderedDict.fromkeys(nums))
            cands.append(nums)
            for ov in (t["ov"] if t else []):
                moves[((c, v), tuple(ov))].append((i, nums))
            key, found = lex_key(w.get("lemma"), nums, lex, by_lemma)
            if not found:
                rep["not in Akouō's short lexicon"][w.get("lemma")] = rep["not in Akouō's short lexicon"].get(w.get("lemma"), 0) + 1
            col["l"][i] = L((nfc(w.get("lemma")), key))
            col["m"][i] = M(w.get("morph"))
            if t and t["gram"] and t["gram"] != w.get("morph"):
                td[i] = M(t["gram"])
                parse["STEPBible parses differently"] += 1
            elif t:
                parse["same code in both"] += 1
            # gloss: Berean, else Cherith, else STEPBible
            g = w.get("gloss") or ""
            if g == "None":
                rep["gloss 'None' treated as missing"].append(f"{code} {c}:{v} {w.text}")
                g = ""
            src = 0
            if not g and w.get("english"):
                g, src = w.get("english"), 1
            if not g and t and t["en"]:
                g, src = t["en"], 2
            if not g:
                rep["no gloss in any source"].append(f"{code} {c}:{v} {w.text}")
            if src:
                gs[i] = src
            gloss_src[("Berean", "Cherith", "STEPBible")[src] if g else "none"] += 1
            col["g"][i] = G(g.replace("—", " - "))
            role = w.get("role") or ""
            if role not in ROLES:
                rep["error roles dropped"].append(f"{code} {c}:{v} {w.text}: {role[:40]}")
                role = ""
            col["r"][i] = ROLES.index(role)
            for attr, d in (("referent", ref), ("subjref", sr)):
                if w.get(attr):
                    got = [idx[x] for x in w.get(attr).split() if x in idx]
                    rep["referent outside this book dropped"] += len(w.get(attr).split()) - len(got)
                    if got:
                        d[i] = got
        for k, i in enumerate(ids):
            to_bsb.setdefault((c, v), []).append((i, cands[k]))

    # Words another edition numbers in a neighbouring verse. The BSB's own word links decide where the BSB has them:
    # a run of such words moves when more of their Strong's numbers are linked in the other verse than in their own.
    home = {}
    for (sv, ov), items in moves.items():
        here = sum(1 for _, nums in items if set(nums) & bsb_nums.get(f"{sv[0]}:{sv[1]}", set()))
        there = sum(1 for _, nums in items if set(nums) & bsb_nums.get(f"{ov[0]}:{ov[1]}", set()))
        verdict = "moved" if there > here else "kept"
        rep["verse numbering"].append(f"{code} {sv[0]}:{sv[1]} -> {ov[0]}:{ov[1]}: {len(items)} words, {here} linked here, {there} there: {verdict}")
        if there > here:
            for i, _ in items:
                home[i] = ov
    if home:
        regroup = OrderedDict()
        for key, items in to_bsb.items():
            for i, nums in items:
                regroup.setdefault(home.get(i, key), []).append((i, nums))
        to_bsb = OrderedDict(sorted(regroup.items()))
        for key in to_bsb:
            to_bsb[key].sort()
        for i, ov in home.items():
            bv[i] = list(ov)

    # how the BSB rendered each word, verse by verse in the BSB's numbering
    for (c, v), items in to_bsb.items():
        if f"{c}:{v}" not in wl:
            continue
        got, left = match_bsb([nums for _, nums in items], bsb_groups(code, c, v, bsb, wl))
        bsb_left += left
        for k, (text, num, approx) in got.items():
            i = items[k][0]
            col["e"][i] = E(text or "(no separate word)")
            if num != L.items[col["l"][i]][1]:
                bx[i] = num
            bsb_linked += 1
            if approx:
                ea[i] = 1

    # sentence trees
    def node(el):
        if el.tag == "w":
            return idx[el.get(XID)]
        ids = frozenset(w.get(XID) for w in el.iter("w"))
        h = heads.get(ids)
        role = el.get("role") or ""
        if role not in ROLES:
            rep["error roles dropped"].append(f"{code} group at {next(el.iter('w')).get('ref')}: {' '.join(role.split())[:60]}")
            role = ""
        cls = el.get("class") or ""
        if cls not in CLASSES:
            raise SystemExit(f"{code}: unknown group class {cls}")
        flags = ((F_ARTICULAR if el.get("articular") else 0) | (F_APPOSITION if el.get("type") == "apposition" or el.get("junction") else 0)
                 | (F_NOMINALIZED if el.get("clauseType") else 0) | (F_VERBLESS if el.get("predication") == "verbless" else 0)
                 | (F_ELIDED if el.get("predication") == "elided" else 0) | (F_GROUP if el.get("type") == "group" else 0))
        kids = [node(ch) for ch in el if ch.tag in ("w", "wg")]
        return [[CLASSES.index(cls), ROLES.index(role), R(el.get("rule") or el.get("Rule") or ""), idx[h] if h else -1, flags]] + kids

    def inherit(nd):
        """A group with no head of its own (the 'and + clause' wrappers) takes the head of its last group child."""
        if isinstance(nd, int):
            return nd
        last = -1
        for ch in nd[1:]:
            h = inherit(ch)
            if not isinstance(ch, int):
                last = h
        if nd[0][3] < 0:
            nd[0][3] = last if last >= 0 else next((ch for ch in nd[1:] if isinstance(ch, int)), -1)
        return nd[0][3]

    S, ss, seen, heads_direct, groups = [], [], 0, 0, 0
    for s in sents:
        ids = sorted(idx[w.get(XID)] for w in s.iter("w"))
        if ids != list(range(ids[0], ids[-1] + 1)) or ids[0] != seen:
            raise SystemExit(f"{code}: a sentence is not one unbroken run of words (word {ids[0]})")
        seen = ids[-1] + 1
        tops = [node(ch) for ch in s if ch.tag in ("w", "wg")]
        tree = tops[0] if len(tops) == 1 and not isinstance(tops[0], int) else [[0, 0, 0, -1, 0]] + tops
        stack = [tree]
        while stack:
            nd = stack.pop()
            groups += 1
            heads_direct += nd[0][3] >= 0
            stack += [ch for ch in nd[1:] if not isinstance(ch, int)]
        inherit(tree)
        S.append(tree)
        ss.append(ids[0])
    if seen != n:
        raise SystemExit(f"{code}: {n - seen} words are in no sentence")

    book = {"v": 1, "b": code, "lang": "grc", "text": "SBLGNT",
            "F": F.items, "T": [tr_of.get(i, "") for i in range(len(F.items))], "L": [list(x) for x in L.items],
            "M": M.items, "G": G.items, "E": E.items, "R": R.items, "P": P.items,
            "w": col, "pre": pre, "gs": gs, "ea": ea, "bx": bx, "bv": bv, "td": td, "ref": ref, "sr": sr, "vs": vs, "ss": ss, "s": S}
    if nx_lines:
        book["nx"] = {"verses": [list(k) for k in sorted(nx_lines)], "note": NESTLE_NOTE}
    # named grammar patterns (tools/greek/patterns.py), found from the data just built
    book["pt"] = find_patterns(book)
    rep["patterns"] = {k: sum(1 for p in book["pt"] if p[0] == k) for k in PATTERN_IDS}
    raw, gz = write_json(code + ".json", book)

    linked = sum(how_linked.values())
    rep.update({
        "words": n, "sentences": len(S), "verses": len(verses), "word groups": groups,
        "word groups with a head word straight from MACULA": heads_direct,
        "linked to STEPBible": dict(how_linked), "linked to STEPBible total": linked,
        "grammar code": dict(parse), "gloss source": dict(gloss_src),
        "words with a BSB rendering": bsb_linked, "BSB word groups with no Greek word found": bsb_left,
        "forms with no transliteration": sum(1 for i in range(len(F.items)) if i not in tr_of),
        "bytes": raw, "gzip bytes": gz,
    })
    stats = {"name": BY_CODE[code][1], "words": n, "sentences": len(S), "verses": len(verses), "bytes": raw, "gzip": gz,
             "chapters": max(c for c, v in verses)}
    return stats, rep
