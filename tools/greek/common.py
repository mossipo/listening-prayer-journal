"""Shared tables and loaders for the Greek Study Desk build scripts. Python 3 standard library only."""
import glob
import gzip
import json
import os
import re
import unicodedata
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "bible", "greek")
CACHE = os.environ.get("GREEK_SRC", os.path.join(HERE, ".cache"))

# Bump when the shipped data changes, so devices that already hold a copy fetch the new one.
DATA_VERSION = "2026-11-15.1"
FORMAT = 1

# Books that are built and shipped. Phase 1: John only. Later phases add to this list.
BOOKS = ["JHN"]

# USFM code (Akouō file name), name in Akouō, SBLGNT file stem, STEPBible code
NT = [
    ("MAT", "Matthew", "Matt", "Mat"), ("MRK", "Mark", "Mark", "Mrk"), ("LUK", "Luke", "Luke", "Luk"),
    ("JHN", "John", "John", "Jhn"), ("ACT", "Acts", "Acts", "Act"), ("ROM", "Romans", "Rom", "Rom"),
    ("1CO", "1 Corinthians", "1Cor", "1Co"), ("2CO", "2 Corinthians", "2Cor", "2Co"), ("GAL", "Galatians", "Gal", "Gal"),
    ("EPH", "Ephesians", "Eph", "Eph"), ("PHP", "Philippians", "Phil", "Php"), ("COL", "Colossians", "Col", "Col"),
    ("1TH", "1 Thessalonians", "1Thess", "1Th"), ("2TH", "2 Thessalonians", "2Thess", "2Th"),
    ("1TI", "1 Timothy", "1Tim", "1Ti"), ("2TI", "2 Timothy", "2Tim", "2Ti"), ("TIT", "Titus", "Titus", "Tit"),
    ("PHM", "Philemon", "Phlm", "Phm"), ("HEB", "Hebrews", "Heb", "Heb"), ("JAS", "James", "Jas", "Jas"),
    ("1PE", "1 Peter", "1Pet", "1Pe"), ("2PE", "2 Peter", "2Pet", "2Pe"), ("1JN", "1 John", "1John", "1Jn"),
    ("2JN", "2 John", "2John", "2Jn"), ("3JN", "3 John", "3John", "3Jn"), ("JUD", "Jude", "Jude", "Jud"),
    ("REV", "Revelation", "Rev", "Rev"),
]
CODES = [b[0] for b in NT]
BY_CODE = {b[0]: b for b in NT}
STEP_TO_CODE = {b[3]: b[0] for b in NT}

# Enumerations shared with the page through bible/greek/codes.json. Index 0 means "none".
ROLES = ["", "s", "v", "vc", "o", "o2", "io", "p", "adv", "aux"]
CLASSES = ["", "cl", "np", "pp", "vp", "adjp", "advp", "nump", "adv", "conj"]
# Bits of a tree node's flags
F_ARTICULAR, F_APPOSITION, F_NOMINALIZED, F_VERBLESS, F_ELIDED, F_GROUP = 1, 2, 4, 8, 16, 32

XID = "{http://www.w3.org/XML/1998/namespace}id"
UBS_FIELDS = ("domain", "ln", "LexDomain", "LN")   # never shipped; check.py fails the build if they appear


def nfc(s):
    return unicodedata.normalize("NFC", s)


def strip_marks(s):
    return "".join(ch for ch in unicodedata.normalize("NFD", s) if not unicodedata.combining(ch))


_PUNCT = re.compile(r"[^\w]+", re.UNICODE)


def norm_greek(word):
    """Letters only, no accents or breathings, lower case, final sigma folded. For matching, never for display."""
    w = strip_marks(word).lower().replace("ς", "σ")
    for a in "’'᾽ʼ":
        w = w.replace(a, "")
    return _PUNCT.sub("", w)


def loose_equal(a, b):
    """Same word allowing the small spelling differences between editions (movable nu, elision, final sigma of οὕτως)."""
    if a == b:
        return True
    if not a or not b:
        return False
    s, l = (a, b) if len(a) <= len(b) else (b, a)
    return len(l) - len(s) == 1 and l.startswith(s) and len(s) >= 2


# ---------------------------------------------------------------- MACULA
def macula_file(kind, code):
    i = CODES.index(code) + 1
    hits = glob.glob(os.path.join(CACHE, "macula_greek", "SBLGNT", kind, f"{i:02d}-*.xml"))
    if len(hits) != 1:
        raise SystemExit(f"MACULA {kind} file for {code} not found. Run tools/greek/fetch.py first.")
    return hits[0]


def wref(w):
    m = re.match(r"^(\S+) (\d+):(\d+)!(\d+)$", w.get("ref"))
    return m.group(1), int(m.group(2)), int(m.group(3)), int(m.group(4))


def load_sentences(code):
    """The <sentence> elements of MACULA's lowfat tree for one book."""
    return list(ET.parse(macula_file("lowfat", code)).getroot().iter("sentence"))


def load_heads(code):
    """{frozenset of word ids: id of the head word} from MACULA's nodes format, which records the head of each group."""
    heads = {}

    def walk(n):
        if n.get(XID):
            return [n.get(XID)], n.get(XID)
        ids, hs = [], []
        for ch in n:
            if ch.tag == "Node":
                a, h = walk(ch)
                ids += a
                hs.append(h)
        hi = int(n.get("Head") or 0)
        h = hs[hi] if hi < len(hs) else (hs[0] if hs else None)
        heads[frozenset(ids)] = h
        return ids, h

    for t in ET.parse(macula_file("nodes", code)).getroot().iter("Tree"):
        for n in t:
            walk(n)
    return heads


# ---------------------------------------------------------------- SBLGNT
SBL_SIGNS = re.compile("[⸀-⸏⸜⸝]")   # marks that point to the apparatus


def load_sblgnt(code):
    """{(chapter, verse): printed line with the apparatus marks removed}"""
    out = {}
    path = os.path.join(CACHE, "sblgnt", "data", "sblgnt", "text", BY_CODE[code][2] + ".txt")
    with open(path, encoding="utf-8-sig") as f:
        for line in f:
            m = re.match(r"^\S+(?: \S+)? (\d+):(\d+)\t(.*)$", line.rstrip("\n"))
            if m:
                out[(int(m.group(1)), int(m.group(2)))] = nfc(re.sub(r"\s+", " ", SBL_SIGNS.sub("", m.group(3))).strip())
    return out


# ---------------------------------------------------------------- STEPBible
_REF = re.compile(r"^([0-9A-Za-z]+)\.(\d+)\.(\d+)((?:[\(\[\{][\d.]+[\)\]\}])*)#(\d+)=(\S+)$")


def load_tagnt():
    """{(code, chapter, verse) in the SBLGNT's (Nestle-Aland) numbering: [word rows in order]}"""
    out = {}
    files = sorted(glob.glob(os.path.join(CACHE, "stepbible", "Translators Amalgamated OT+NT", "TAGNT*.txt")))
    if not files:
        raise SystemExit("TAGNT not found. Run tools/greek/fetch.py first.")
    for path in files:
        with open(path, encoding="utf-8-sig") as f:
            for line in f:
                if not line or line[0] in "#\t \n=" or "#" not in line[:30]:
                    continue
                cols = line.rstrip("\n").split("\t")
                m = _REF.match(cols[0])
                if not m or m.group(1) not in STEP_TO_CODE:
                    continue
                c, v = int(m.group(2)), int(m.group(3))
                na = re.search(r"\(([\d.]+)\)", m.group(4) or "")
                if na:
                    c, v = (int(x) for x in na.group(1).split("."))
                cols += [""] * (14 - len(cols))
                g = re.match(r"^(.*?)\s*\(([^)]*)\)\s*$", cols[1])
                greek, tr = (g.group(1), g.group(2)) if g else (cols[1], "")
                ds, _, gram = cols[3].partition("=")
                out.setdefault((STEP_TO_CODE[m.group(1)], c, v), []).append({
                    "n": norm_greek(greek), "tr": tr.strip(), "en": cols[2].strip(), "ds": ds.strip(),
                    "gram": gram.strip(), "sbl": "SBL" in cols[5].split("+"), "alt": cols[12].strip(),
                })
    return out


def strong_nums(text):
    return [int(x) for x in re.findall(r"G0*(\d+)", text or "")]


def clean_step(s):
    """TEGMC wording: its low commas become ordinary commas, wrapping quotes go, no em dashes."""
    s = s.replace("‚", ",").replace("—", " - ").strip().strip('"').strip()
    return re.sub(r"\s+", " ", s)


def load_tegmc():
    """{code: {"f": [[key, value], ...], "s": summary, "m": meaning, "x": example}} for STEPBible's full Greek codes."""
    path = glob.glob(os.path.join(CACHE, "stepbible", "Morphology codes", "TEGMC*"))[0]
    out, cur, extra = {}, None, []

    def close():
        if cur:
            e = out[cur]
            e["s"] = clean_step(extra[0]) if len(extra) > 0 else ""
            e["m"] = clean_step(extra[1]) if len(extra) > 1 else ""
            e["x"] = clean_step(extra[2]) if len(extra) > 2 else ""

    with open(path, encoding="utf-8-sig") as f:
        for line in f:
            line = line.rstrip("\n")
            m = re.match(r"^([A-Z][A-Za-z0-9-]*)\tFunction=(.*)$", line)
            if m:
                close()
                cur, extra = m.group(1), []
                pairs = []
                for part in ("Function=" + m.group(2)).split(";"):
                    k, _, val = part.strip().partition("=")
                    k, val = k.strip(), clean_step(val)
                    if k and val and [k, val] not in pairs:
                        pairs.append([k, val])
                out[cur] = {"f": pairs}
            elif cur and line.startswith("\t") and line.strip():
                extra.append(line.strip())
            elif line.startswith("$") or not line.strip():
                close()
                cur = None
    close()
    return out


# ---------------------------------------------------------------- Akouō data already in the app
def akouo_json(*parts):
    with open(os.path.join(ROOT, "bible", *parts), encoding="utf-8") as f:
        return json.load(f)


def load_short_lex():
    """Akouō's short Greek lexicon: {Strong's number: entry}"""
    out = {}
    for path in glob.glob(os.path.join(ROOT, "bible", "lex", "G*.json")):
        with open(path, encoding="utf-8") as f:
            for k, e in json.load(f).items():
                out[int(k)] = e
    return out


_EDGE = "“”‘’\"'.,;:!?()[]—–- ⁠"


def bsb_groups(code, c, v, bsb, words):
    """The English word groups of one BSB verse with their Strong's numbers, split exactly as bible.js does:
    [(English, number)], number 0 when no original word is linked, negative when the source flags the link as uncertain."""
    parts = []
    on = False
    for t in bsb["c"][c - 1]:
        if isinstance(t[0], int):
            if t[0] > 0:
                on = t[0] == v
            if on:
                parts += t[1].split()
    lst = words.get(f"{c}:{v}") or []
    out, gi, rem, cur, grp = [], 0, 0, 0, []

    def close():
        if grp:
            out.append((" ".join(grp), cur))
            grp.clear()

    for p in parts:
        if rem <= 0:
            close()
            if gi >= len(lst):
                out.append((p, 0))
                continue
            rem, cur = lst[gi], lst[gi + 1]
            gi += 2
        grp.append(p)
        rem -= len(p.encode("utf-16-le")) // 2   # JavaScript string length, as bible.js counts it
        if rem <= 0:
            close()
    close()
    return [(g.strip(_EDGE), s) for g, s in out]


# ---------------------------------------------------------------- output
class Table:
    """String table: call it with a value to get the value's index."""

    def __init__(self, first=None):
        self.ix, self.items = {}, []
        if first is not None:
            self(first)

    def __call__(self, k):
        if k not in self.ix:
            self.ix[k] = len(self.items)
            self.items.append(k)
        return self.ix[k]


def write_json(rel, obj):
    """Write under bible/greek/. Returns (raw bytes, gzip bytes)."""
    full = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    raw = json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    with open(full, "wb") as f:
        f.write(raw)
    return len(raw), len(gzip.compress(raw, 9))
