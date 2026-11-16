#!/usr/bin/env python3
"""Build the Greek Study Desk data into bible/greek/.

Usage (from the repository root, after tools/greek/fetch.py):
    python3 -I tools/greek/build.py            build the books listed in common.BOOKS and the shared files
    python3 -I tools/greek/build.py JHN ROM    build only these books (shared files are still rebuilt)
Then run tools/greek/check.py. The run writes tools/greek/report.json with everything it could not do.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.setrecursionlimit(10000)   # Luke's genealogy nests 157 groups deep

from build_books import build_book
from build_shared import build_codes, build_index, build_lex, build_occ, scan_macula
from common import BOOKS, DATA_VERSION, HERE, load_short_lex, load_tagnt, nfc


def main():
    want = [a for a in sys.argv[1:] if not a.startswith("-")] or BOOKS
    print("reading STEPBible TAGNT and Akouō's short lexicon")
    tagnt = load_tagnt()
    lex = load_short_lex()
    by_lemma = {}
    for n in sorted(lex):
        by_lemma.setdefault(nfc(lex[n].get("l", "")), n)
    report = {"data version": DATA_VERSION, "books": {}}
    books = {}
    index_path = os.path.join(HERE, "..", "..", "bible", "greek", "index.json")
    if os.path.exists(index_path):          # keep books built in an earlier run
        with open(index_path, encoding="utf-8") as f:
            books = {k: v for k, v in json.load(f).get("books", {}).items() if k in BOOKS}
    extra_codes = set()
    for code in want:
        print("building", code)
        stats, rep = build_book(code, tagnt, lex, by_lemma)
        books[code] = stats
        report["books"][code] = rep
        with open(os.path.join(HERE, "..", "..", "bible", "greek", code + ".json"), encoding="utf-8") as f:
            b = json.load(f)
        extra_codes |= {b["M"][i] for i in b["td"].values()}
        print(f"  {stats['words']} words, {stats['sentences']} sentences, {stats['gzip'] // 1024} KB gzip")
    print("scanning all 27 books for grammar codes and occurrences")
    code_attrs, occ, count = scan_macula()
    report["codes"], _ = build_codes(code_attrs, extra_codes)
    report["occurrences"] = build_occ(occ, count)
    print("lexicons")
    report["lexicons"] = build_lex()
    build_index({k: books[k] for k in BOOKS if k in books})
    with open(os.path.join(HERE, "report.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=1)
    print("done. Now run: python3 -I tools/greek/check.py")


if __name__ == "__main__":
    main()
