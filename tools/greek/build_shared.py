"""Files shared by every book of the Greek Study Desk.

  bible/greek/codes.json   grammar code -> its parts in plain English (STEPBible TEGMC), plus the role and class lists
  bible/greek/occ.json     lemma -> [times it occurs, then the verses it occurs in (first verse id, then differences)]
  bible/greek/lex/G12.json Abbott-Smith and Thayer by Strong's number, 250 numbers per file
  bible/greek/index.json   data version, books, credit lines
  bible/greek/forms.json   lemma -> every grammar code it takes in the New Testament, with its spelling and count (paradigms)
  bible/greek/core.json    the words that occur 50 times or more, most frequent first (Learn mode)
"""
import glob
import html
import json
import os
import re
import unicodedata
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict

from common import (CACHE, CLASSES, CODES, DATA_VERSION, FORMAT, HERE, ROLES, load_sentences, load_tegmc, nfc, wref,
                    write_json)

LEX_BLOCK = 250

FUNCTION = {"noun": "Noun", "verb": "Verb", "adj": "Adjective", "det": "Definite article", "prep": "Preposition",
            "conj": "Conjunction", "adv": "Adverb", "ptcl": "Particle", "num": "Number", "intj": "Interjection"}
PRONOUN = {"personal": "Personal pronoun", "demonstrative": "Demonstrative pronoun", "relative": "Relative pronoun",
           "interrogative": "Interrogative pronoun", "indefinite": "Indefinite pronoun", "possessive": "Possessive pronoun"}
PERSON = {"first": "1st", "second": "2nd", "third": "3rd"}


def from_macula(attrs):
    """Parts of a grammar code spelled out from MACULA's own explicit fields, for codes TEGMC does not list."""
    cls, typ, tense, voice, mood, person, number, gender, case, degree = attrs
    f = [["Function", PRONOUN.get(typ, "Pronoun") if cls == "pron" else FUNCTION.get(cls, cls or "Word")]]
    if tense:
        f.append(["Tense", tense.capitalize()])
    if voice:
        f.append(["Voice", voice.capitalize()])
    if mood:
        f.append(["Form" if mood in ("participle", "infinitive") else "Mood", mood.capitalize()])
    if person:
        f.append(["Person", PERSON.get(person, person)])
    if case:
        f.append(["Case", case.capitalize()])
    if number:
        f.append(["Number", number.capitalize()])
    if gender:
        f.append(["Gender", gender.capitalize()])
    if degree:
        f.append(["Extra", degree.capitalize()])
    return f


def scan_macula():
    """One pass over all 27 books: grammar codes with their explicit fields, and where every lemma occurs."""
    code_attrs = defaultdict(Counter)
    occ = defaultdict(list)
    count = Counter()
    forms = defaultdict(Counter)       # (lemma, code) -> spellings
    strongs = defaultdict(Counter)     # lemma -> Strong's numbers
    glosses = defaultdict(Counter)     # lemma -> word glosses (only used where the short lexicon has none)
    for bi, code in enumerate(CODES):
        for s in load_sentences(code):
            for w in s.iter("w"):
                _, c, v, _ = wref(w)
                code_attrs[w.get("morph")][tuple(w.get(a) or "" for a in ("class", "type", "tense", "voice", "mood", "person", "number", "gender", "case", "degree"))] += 1
                lemma = nfc(w.get("lemma"))
                count[lemma] += 1
                occ[lemma].append(bi * 1000000 + c * 1000 + v)
                form = nfc(w.get("normalized") or w.text)
                if lemma[:1].islower():
                    form = form.lower()
                # a grave accent only shows a word's place before another word; tables show the acute (τὰς -> τάς)
                form = nfc(unicodedata.normalize("NFD", form).replace("\u0300", "\u0301"))
                forms[(lemma, w.get("morph"))][form] += 1
                for n in re.findall(r"\d+", w.get("strong") or ""):
                    strongs[lemma][int(n)] += 1
                    break
                if w.get("gloss") and w.get("gloss") != "None":
                    glosses[lemma][w.get("gloss")] += 1
    return code_attrs, occ, count, {"forms": forms, "strongs": strongs, "glosses": glosses}


def build_codes(code_attrs, extra_codes):
    teg = load_tegmc()
    codes, composed = {}, {}
    for code, attrs in code_attrs.items():
        if code in teg:
            e = teg[code]
            codes[code] = {"f": e["f"], "m": e["m"], "x": e["x"]}
        else:
            # keep only the fields every word with this code agrees on
            most = attrs.most_common()
            agreed = tuple(most[0][0][i] if all(a[i] == most[0][0][i] for a, _ in most) else "" for i in range(10))
            if not agreed[0]:
                agreed = (most[0][0][0],) + agreed[1:]
            codes[code] = {"f": from_macula(agreed), "m": "", "x": "", "src": "macula"}
            composed[code] = sum(attrs.values())
    for code in extra_codes:            # STEPBible's code for a word, where it differs from MACULA's
        if code not in codes and code in teg:
            e = teg[code]
            codes[code] = {"f": e["f"], "m": e["m"], "x": e["x"]}
    out = {"roles": ROLES, "classes": CLASSES,
           "flags": {"articular": 1, "apposition": 2, "nominalized": 4, "verbless": 8, "elided": 16, "group": 32},
           "codes": codes}
    raw, gz = write_json("codes.json", out)
    return {"codes": len(codes), "from TEGMC": len(codes) - len(composed), "spelled out from MACULA's fields": composed,
            "bytes": raw, "gzip bytes": gz}, set(codes)


def build_occ(occ, count):
    out = {}
    for lemma, vids in occ.items():
        vs = sorted(set(vids))
        out[lemma] = [count[lemma], vs[0]] + [b - a for a, b in zip(vs, vs[1:])]
    raw, gz = write_json("occ.json", out)
    return {"lemmas": len(out), "lemmas occurring 50 times or more": sum(1 for c in count.values() if c >= 50),
            "bytes": raw, "gzip bytes": gz}


class _Tab:
    def __init__(self):
        self.items, self.at = [], {}

    def __call__(self, k):
        if k not in self.at:
            self.at[k] = len(self.items)
            self.items.append(k)
        return self.at[k]


def build_forms(extra):
    """forms.json: {"M": codes, "F": spellings, "x": {lemma: [[code, spelling, count, other spelling...], ...]}}.
    Every cell of a paradigm table on the page comes from here; a cell with no entry is not attested in the New Testament."""
    M, F, out = _Tab(), _Tab(), {}
    for (lemma, code), sp in sorted(extra["forms"].items()):
        top = sp.most_common()
        out.setdefault(lemma, []).append([M(code), F(top[0][0]), sum(sp.values())] + [F(x) for x, _ in top[1:3]])
    raw, gz = write_json("forms.json", {"M": M.items, "F": F.items, "x": out})
    return {"lemmas": len(out), "lemma and code pairs": sum(len(v) for v in out.values()), "bytes": raw, "gzip bytes": gz}


def build_core(count, extra, short_lex, by_lemma, least=50):
    """core.json: [[lemma, Strong's number, transliteration, short gloss, times, commonest code], ...] for every word that
    occurs `least` times or more, most frequent first. Built from the data; nothing typed in."""
    rows = []
    for lemma, n in count.most_common():
        if n < least:
            break
        # the short lexicon's own entry for the dictionary form first (MACULA gives some forms of σύ, ἐγώ, εἰμί their own numbers)
        num = by_lemma.get(lemma) or (extra["strongs"][lemma].most_common(1)[0][0] if extra["strongs"][lemma] else 0)
        e = short_lex.get(num) or {}
        gloss = e.get("g") or (extra["glosses"][lemma].most_common(1)[0][0] if extra["glosses"][lemma] else "")
        code = max(((c, sum(sp.values())) for (l, c), sp in extra["forms"].items() if l == lemma), key=lambda x: x[1])[0]
        # the short lexicon writes some glosses as "general: specific" (lord: God); the deck shows the general part
        rows.append([lemma, num, e.get("t", ""), no_em(gloss.split(":")[0].strip()), n, code])
    total = sum(count.values())
    raw, gz = write_json("core.json", {"least": least, "total words": total, "words": rows})
    return {"words": len(rows), "share of all words": round(sum(r[4] for r in rows) / total, 4), "bytes": raw, "gzip bytes": gz}


# ---------------------------------------------------------------- lexicons (same conversion as Threads' build_lex.py)
def element_html(el, mapping):
    parts = []

    def walk(e):
        tag = e.tag.split("}")[-1]
        open_t, close_t = mapping.get(tag, ("", ""))
        if tag == "sense" and e.get("n"):
            n = e.get("n")
            open_t += f"<b>{html.escape(n if n.endswith('.') else n + '.')}</b> "
        if tag == "ref" and e.get("osisRef"):
            open_t, close_t = f'<a data-ref="{html.escape(e.get("osisRef"))}">', "</a>"
        parts.append(open_t)
        if e.text:
            parts.append(html.escape(e.text))
        for c in e:
            walk(c)
            if c.tail:
                parts.append(html.escape(c.tail))
        parts.append(close_t)

    walk(el)
    return re.sub(r"\s+", " ", "".join(parts)).strip()


def no_em(s):
    return re.sub(r"\s*—\s*", " - ", s)


def load_abbott_smith():
    root = ET.parse(os.path.join(CACHE, "abbott_smith", "abbott-smith.tei.xml")).getroot()
    mapping = {"orth": ("<b>", "</b>"), "gloss": ("<i>", "</i>"), "foreign": ('<span lang="el">', "</span>"),
               "sense": ('<div class="sense">', "</div>")}
    out = {}
    for e in root.iter():
        if e.tag.split("}")[-1] != "entry":
            continue
        keys = re.findall(r"G(\d+)", e.get("n") or "")
        if not keys:
            continue
        h = no_em(element_html(e, mapping))
        for k in keys:
            k = int(k)
            out[k] = (out[k] + "<hr>" + h) if k in out else h
    return out


def load_thayer():
    out = {}
    for path in sorted(glob.glob(os.path.join(CACHE, "thayer", "book", "*.md"))):
        with open(path, encoding="utf-8") as f:
            text = f.read()
        chunks = re.split(r"^`Strong's G(\d+)`\s*$", text, flags=re.M)
        for i in range(1, len(chunks), 2):
            body = re.split(r"^#{1,6} ", chunks[i + 1], flags=re.M)[0].strip()
            paras = [p.strip() for p in re.split(r"\n\s*\n", body) if p.strip() and not p.strip().startswith("---")]
            out[int(chunks[i])] = no_em("".join(f"<p>{html.escape(p)}</p>" for p in paras))
    return out


def build_lex():
    asm, th = load_abbott_smith(), load_thayer()
    blocks = defaultdict(dict)
    for k in set(asm) | set(th):
        e = {}
        if k in asm:
            e["as"] = asm[k]
        if k in th:
            e["th"] = th[k]
        blocks[k // LEX_BLOCK][str(k)] = e
    raw = gz = big = 0
    for b, d in blocks.items():
        r, g = write_json(f"lex/G{b}.json", d)
        raw, gz, big = raw + r, gz + g, max(big, g)
    return {"Abbott-Smith entries": len(asm), "Thayer entries": len(th), "files": len(blocks), "bytes": raw,
            "gzip bytes": gz, "largest file gzip bytes": big}


def build_index(books):
    with open(os.path.join(HERE, "sources.json"), encoding="utf-8") as f:
        src = json.load(f)
    credits = [{k: s[k] for k in ("name", "license", "license_url", "attribution", "changes", "used_for") if k in s}
               for s in src["sources"]] + src["in_app"]
    out = {"v": DATA_VERSION, "format": FORMAT, "text": "SBLGNT", "lexBlock": LEX_BLOCK, "books": books, "credits": credits,
           "analysis": "The sentence analysis is one scholarly analysis (MACULA Greek, Clear Bible). Other readings of some constructions exist."}
    return write_json("index.json", out)
