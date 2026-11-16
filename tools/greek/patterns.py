#!/usr/bin/env python3
"""Named grammar patterns, found in a built book file and stored in it as `pt` (approved by Barry, 2026-11-16).

Each test uses only the data: MACULA's grammar codes and sentence trees, and the Greek spelling. Nothing is guessed.
    pt: [[pattern id, [word numbers], extra], ...]   extra: the preposition for "artinf", else ""

The five approved patterns:
    peri     periphrastic: a form of εἰμί with a participle that MACULA analyses as one verb (its BeVerb / VerbBe rules)
    oume     οὐ μή with an aorist subjunctive or a future indicative: the strongest "never"
    artinf   a preposition, a singular article and an infinitive that the article goes with (ἐν τῷ + infinitive)
    ean      ἐάν with a subjunctive, introducing a condition (not ἐάν after a relative word, "whoever")
    accsubj  an infinitive clause whose subject (in MACULA's analysis) is in the accusative

Held back until Barry has reviewed examples: the genitive absolute and εἰ + indicative conditions.
Run on its own to print counts and examples:  python3 tools/greek/patterns.py [BOOK ...]
"""
import json
import os
import re
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "bible", "greek")
IDS = ["peri", "oume", "artinf", "ean", "accsubj"]


def bare(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn").lower()


def parse(code):
    """The parts of a grammar code the tests need: function, tense, mood, case, number, gender."""
    code = code.split(" +")[0]
    p = code.split("-")
    out = {"fn": p[0]}
    if p[0] == "V" and len(p) > 1:
        tvm = p[1]
        out["mood"] = tvm[-1]
        out["tense"] = tvm[:-2]
        if out["mood"] == "P" and len(p) > 2:
            out.update(case=p[2][0], num=p[2][1:2], gen=p[2][2:3])
    elif len(p) > 1 and p[1]:
        cng = p[1].lstrip("123")
        if len(cng) >= 2:
            out.update(case=cng[0], num=cng[1], gen=cng[2:3])
    return out


def find(book):
    F, M, L, R = book["F"], book["M"], book["L"], book["R"]
    wf, wm, wl = book["w"]["f"], book["w"]["m"], book["w"]["l"]
    n = len(wf)
    form = lambda i: bare(F[wf[i]])
    lemma = lambda i: L[wl[i]][0]
    code = lambda i: parse(M[wm[i]])
    roles = ["", "s", "v", "vc", "o", "o2", "io", "p", "adv", "aux"]
    classes = ["", "cl", "np", "pp", "vp", "adjp", "advp", "nump", "adv", "conj"]
    found = []

    def words(nd):
        return [nd] if isinstance(nd, int) else [w for ch in nd[1:] for w in words(ch)]

    wr = book["w"]["r"]

    def role(nd):
        return roles[wr[nd]] if isinstance(nd, int) else roles[nd[0][1]]

    parent = {}

    def walk(nd):
        if isinstance(nd, int):
            return
        for ch in nd[1:]:
            parent[ch if isinstance(ch, int) else id(ch)] = nd
            walk(ch)
        # periphrastic: MACULA's own BeVerb / VerbBe groups, with εἰμί and a participle in them
        if R[nd[0][2]] in ("BeVerb", "VerbBe"):
            ws = words(nd)
            be = [i for i in ws if lemma(i) == "εἰμί"]
            pt = [i for i in ws if code(i).get("mood") == "P"]
            if be and pt:
                found.append(["peri", sorted(be + pt), ""])
        # accusative subject of an infinitive: a clause whose verb is an infinitive and whose subject is accusative
        if classes[nd[0][0]] == "cl":
            verb = [w for ch in nd[1:] if role(ch) in ("v", "vc") for w in words(ch)]
            inf = [i for i in verb if code(i).get("mood") == "N"]
            subj = [ch for ch in nd[1:] if role(ch) == "s"]
            if inf and subj:
                sw = words(subj[0])
                heads = [i for i in sw if code(i)["fn"] in ("N", "P", "R", "D", "A", "F", "S", "C", "K", "Q", "X", "T") and code(i).get("case")]
                if heads and all(code(i).get("case") == "A" for i in heads):
                    found.append(["accsubj", sorted(set(sw + inf[:1])), ""])

    for t in book["s"]:
        walk(t)

    for i in range(n - 1):
        f = form(i)
        # οὐ μή + aorist subjunctive or future indicative, within the next few words
        if f in ("ου", "ουκ", "ουχ") and form(i + 1) == "μη":
            for j in range(i + 2, min(n, i + 8)):
                c = code(j)
                if c["fn"] == "V":
                    if (c.get("mood") == "S" and "A" in c.get("tense", "")) or (c.get("mood") == "I" and "F" in c.get("tense", "")):
                        found.append(["oume", [i, i + 1, j], ""])
                    break
        # preposition + singular article + infinitive the article goes with. MACULA codes most of these articles as neuter
        # (ἐν τῷ), some as masculine (πρὸ τοῦ ... φωνῆσαι, John 1:48), so the test is: nothing between the article and the
        # infinitive agrees with the article (no noun, adjective or participle of its case and gender), and MACULA puts the
        # article and the infinitive in one group inside the preposition's phrase.
        if M[wm[i]].startswith("PREP") and i + 2 < n:
            a = code(i + 1)
            # an infinitive's article is neuter; MACULA occasionally codes it masculine, never feminine (ἐπὶ τὴν αὔριον, Acts 4:5)
            if a["fn"] == "T" and a.get("num") == "S" and a.get("gen") != "F":
                for k in range(i + 2, min(n, i + 7)):
                    c = code(k)
                    if c["fn"] == "V":
                        if c.get("mood") == "N":
                            agree = any(code(j).get("case") == a.get("case") and code(j).get("gen") == a.get("gen") and code(j).get("num") == "S"
                                        for j in range(i + 2, k))
                            g, up = parent.get(i + 1), 0
                            while g is not None and k not in words(g) and up < 4:
                                g, up = parent.get(id(g)), up + 1
                            inside = g is not None and k in words(g) and (i in words(g) or i in words(parent.get(id(g), [None])))
                            if not agree and inside:
                                found.append(["artinf", [i, i + 1, k], lemma(i)])
                        break
        # ἐάν + subjunctive: the next finite verb is subjunctive; not ἐάν after a relative word ("whoever", "wherever")
        if lemma(i) == "ἐάν":
            prev = code(i - 1) if i else {"fn": ""}
            if prev["fn"] == "R" or (i and bare(lemma(i - 1)) in ("οπου", "οσος", "οστις", "ος", "οσακις", "ου", "ως", "καθως")):
                continue
            for j in range(i + 1, min(n, i + 12)):
                c = code(j)
                # another linking word first: the verb belongs to it (ἐὰν μὴ ἵνα φανερωθῇ, Mark 4:22)
                if lemma(j) in ("ἵνα", "ὅτι", "ὅπως", "ὅταν", "ὅτε", "ὥστε", "εἰ", "ἐάν"):
                    break
                if c["fn"] == "V" and c.get("mood") in ("I", "S", "M", "O"):
                    if c["mood"] == "S":
                        found.append(["ean", [i, j], ""])
                    break
    # one entry per pattern and words; in word order
    seen, out = set(), []
    for p in sorted(found, key=lambda x: (x[1][0], IDS.index(x[0]))):
        key = (p[0], tuple(p[1]))
        if key not in seen:
            seen.add(key)
            out.append(p)
    return out


def ref(book, i):
    vs = book["vs"]
    k = max(j for j in range(0, len(vs), 3) if vs[j + 2] <= i)
    return f"{vs[k]}:{vs[k + 1]}"


if __name__ == "__main__":
    codes = sys.argv[1:] or [c for c in json.load(open(os.path.join(OUT, "index.json")))["books"]]
    tot = {k: 0 for k in IDS}
    for c in codes:
        b = json.load(open(os.path.join(OUT, c + ".json"), encoding="utf-8"))
        pts = find(b)
        for p in pts:
            tot[p[0]] += 1
        if len(codes) <= 3:
            for k in IDS:
                ex = [p for p in pts if p[0] == k][:6]
                print(c, k, [f"{ref(b, p[1][0])} {' '.join(b['F'][b['w']['f'][i]] for i in p[1])}" for p in ex])
    print(tot)
