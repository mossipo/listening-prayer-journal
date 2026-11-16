#!/usr/bin/env python3
"""Checks that must pass before Greek Study Desk data is published. Exits with an error on the first group that fails.

Usage: python3 -I tools/greek/check.py
It re-reads the sources and the built files on its own; it shares only the low-level loaders with the build.
"""
import glob
import gzip
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common import BOOKS, CLASSES, OUT, ROLES, UBS_FIELDS, load_nestle_extra, load_sblgnt, load_sentences

PER_BOOK_AVERAGE = 400 * 1024      # gzip
WHOLE_BUDGET = 10 * 1024 * 1024    # gzip
ALLOWED_TAGS = {"b", "i", "p", "hr", "div", "span", "a"}
failures = []


def fail(msg):
    failures.append(msg)
    print("  FAIL", msg)


def load(rel):
    with open(os.path.join(OUT, rel), encoding="utf-8") as f:
        return json.load(f)


def keys_of(obj, found):
    if isinstance(obj, dict):
        for k, v in obj.items():
            found.add(k)
            keys_of(v, found)
    elif isinstance(obj, list):
        for v in obj:
            keys_of(v, found)


def main():
    index = load("index.json")
    codes = load("codes.json")
    print("1. Books against their sources")
    total_words = 0
    for code in BOOKS:
        if code not in index["books"]:
            fail(f"{code} is listed in common.BOOKS but missing from index.json")
            continue
        b = load(code + ".json")
        w = b["w"]
        n = len(w["f"])
        total_words += n
        src_words = sum(1 for s in load_sentences(code) + load_nestle_extra(code)[0] for _ in s.iter("w"))
        if n != src_words:
            fail(f"{code}: {n} words built, MACULA has {src_words}")
        if any(len(col) != n for col in w.values()):
            fail(f"{code}: word columns have different lengths")
        # every verse rebuilds to the printed SBLGNT line, character for character
        sbl = load_sblgnt(code)
        sbl.update(load_nestle_extra(code)[2])   # verses added from Nestle 1904 rebuild to its text instead
        vs, bad, seen_verses = b["vs"], 0, 0
        for j in range(0, len(vs), 3):
            a = vs[j + 2]
            z = vs[j + 5] if j + 5 < len(vs) else n
            line = " ".join(b["pre"].get(str(i), "") + b["F"][w["f"][i]] + b["P"][w["p"][i]] for i in range(a, z))
            seen_verses += 1
            if line != sbl.get((vs[j], vs[j + 1])):
                bad += 1
                if bad <= 3:
                    print("   ", code, vs[j], vs[j + 1], "\n     built:  ", line, "\n     printed:", sbl.get((vs[j], vs[j + 1])))
        if bad:
            fail(f"{code}: {bad} verses do not rebuild to the printed SBLGNT text")
        if seen_verses != len(sbl):
            fail(f"{code}: {seen_verses} verses built, the SBLGNT has {len(sbl)}")
        # lemma and grammar code on every word
        no_lemma = sum(1 for i in range(n) if not b["L"][w["l"][i]][0])
        no_code = sum(1 for i in range(n) if not b["M"][w["m"][i]])
        if no_lemma or no_code:
            fail(f"{code}: {no_lemma} words without a lemma, {no_code} without a grammar code")
        unknown = sorted({b["M"][w["m"][i]] for i in range(n)} - set(codes["codes"]))
        if unknown:
            fail(f"{code}: grammar codes with no plain-English wording: {unknown[:10]}")
        if any(not codes["codes"][b["M"][w["m"][i]]]["f"] for i in range(n)):
            fail(f"{code}: a grammar code has empty wording")
        # every word in exactly one sentence tree; heads and enumerations valid
        count = [0] * n
        bad_head = bad_enum = groups = 0
        for tree in b["s"]:
            stack = [tree]
            while stack:
                nd = stack.pop()
                cls, role, rule, head, flags = nd[0]
                groups += 1
                span = set()
                inner = [nd]
                while inner:
                    x = inner.pop()
                    for ch in x[1:]:
                        if isinstance(ch, int):
                            span.add(ch)
                        else:
                            inner.append(ch)
                if head not in span:
                    bad_head += 1
                if not (0 <= cls < len(CLASSES) and 0 <= role < len(ROLES) and 0 <= rule < len(b["R"])):
                    bad_enum += 1
                for ch in nd[1:]:
                    if isinstance(ch, int):
                        count[ch] += 1
                    else:
                        stack.append(ch)
        if any(c != 1 for c in count):
            fail(f"{code}: {sum(1 for c in count if c != 1)} words are not in exactly one sentence tree")
        if bad_head or bad_enum:
            fail(f"{code}: {bad_head} groups whose head word is outside the group, {bad_enum} with an unknown class, role or rule")
        if len(b["ss"]) != len(b["s"]) or b["ss"] != sorted(b["ss"]) or b["ss"][0] != 0:
            fail(f"{code}: sentence starts are inconsistent")
        if any(not (0 <= r < len(ROLES)) for r in w["r"]):
            fail(f"{code}: unknown word role")
        st = index["books"][code]
        print(f"   {code}: {n} words, {seen_verses} verses, {len(b['s'])} sentences, {groups} word groups, "
              f"{st['gzip'] // 1024} KB gzip. All verses match the printed text: {'yes' if not bad else 'NO'}")

    print("2. No UBS semantic domain fields anywhere in the output")
    files = sorted(glob.glob(os.path.join(OUT, "**", "*.json"), recursive=True))
    found = set()
    for path in files:
        with open(path, encoding="utf-8") as f:
            text = f.read()
        keys_of(json.loads(text), found)
        for field in ("LexDomain", "sdbg", "MARBLE"):
            if field in text:
                fail(f"{os.path.relpath(path, OUT)} contains the text {field}")
    hit = found & set(UBS_FIELDS)
    if hit:
        fail(f"UBS fields present as keys: {sorted(hit)}")
    print(f"   {len(files)} files scanned, {len(found)} distinct keys, UBS fields found: {len(hit)}")

    print("3. Lexicon files contain only simple markup")
    tags = set()
    entries = 0
    for path in glob.glob(os.path.join(OUT, "lex", "*.json")):
        with open(path, encoding="utf-8") as f:
            for e in json.load(f).values():
                entries += 1
                for h in e.values():
                    tags |= set(re.findall(r"</?([a-zA-Z0-9]+)", h))
                    if re.search(r"\son\w+\s*=|javascript:|<script", h, re.I):
                        fail("script-like content in a lexicon entry")
                    if "—" in h:
                        fail("em dash in a lexicon entry")
    if tags - ALLOWED_TAGS:
        fail(f"unexpected tags in lexicon entries: {sorted(tags - ALLOWED_TAGS)}")
    print(f"   {entries} entries, tags used: {sorted(tags)}")

    print("4. Credits and licences")
    credits = index.get("credits", [])
    need = ["MACULA Greek", "SBL Greek New Testament", "STEPBible", "Abbott-Smith", "Thayer", "Berean Standard Bible", "Gentium Plus"]
    for name in need:
        c = next((x for x in credits if name in x["name"]), None)
        if not c or not c.get("attribution") or not c.get("license"):
            fail(f"credit or licence line missing for {name}")
    if not index.get("analysis"):
        fail("the note that the trees are one scholarly analysis is missing")
    print(f"   {len(credits)} credit lines, data version {index['v']}")

    print("5. Sizes (gzip)")
    total = 0
    for path in files:
        with open(path, "rb") as f:
            total += len(gzip.compress(f.read(), 9))
    books = [index["books"][c]["gzip"] for c in BOOKS if c in index["books"]]
    avg = sum(books) / max(1, len(books))
    if avg > PER_BOOK_AVERAGE:
        fail(f"average book is {avg / 1024:.0f} KB, over the 400 KB budget")
    if total > WHOLE_BUDGET:
        fail(f"all Greek data is {total / 1048576:.2f} MB, over the 10 MB budget")
    print(f"   books: {len(books)}, average {avg / 1024:.0f} KB, largest {max(books) / 1024:.0f} KB; everything under bible/greek: {total / 1048576:.2f} MB of 10 MB")

    print()
    if failures:
        print(f"{len(failures)} check(s) FAILED")
        sys.exit(1)
    print(f"All checks passed. {total_words} words in {len(BOOKS)} book(s).")


if __name__ == "__main__":
    main()
