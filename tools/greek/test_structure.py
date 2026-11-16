#!/usr/bin/env python3
"""Browser tests for the sentence-structure view (Phase 2), run like test_page.py:

    AKOUO_PLUS_EMAIL=<an address on the Akouō Plus list> FONT_DIR=<@fontsource folder> python3 tools/greek/test_structure.py [screenshot folder]

Checks the golden passages against MACULA's analysis in the built data, the group panel, the tree view, the flow of
thought, the verse-numbering notes, switching views, and timing on the longest sentence (Ephesians 1:3-14).
"""
import json
import os
import subprocess
import sys
import time
import unicodedata

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_page import BASE, EMAIL, LANDSCAPE, PORT, PORTRAIT, ROOT, check, errors, fonts, results, seed, watch  # noqa: E402

SHOTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cache", "shots")
BOOKS = {}


def book(code):
    if code not in BOOKS:
        with open(os.path.join(ROOT, "bible", "greek", code + ".json"), encoding="utf-8") as f:
            BOOKS[code] = json.load(f)
    return BOOKS[code]


def bare(s):
    s = unicodedata.normalize("NFD", s)
    return "".join(ch for ch in s if unicodedata.category(ch) != "Mn").lower()


def word(code, c, v, form, nth=1):
    """Index of the nth word spelled `form` (accents ignored) in verse c:v."""
    b = book(code)
    vs = b["vs"]
    for k in range(0, len(vs), 3):
        if vs[k] == c and vs[k + 1] == v:
            a = vs[k + 2]
            z = vs[k + 5] if k + 5 < len(vs) else len(b["w"]["f"])
            seen = 0
            for i in range(a, z):
                if bare(b["F"][b["w"]["f"][i]]) == bare(form):
                    seen += 1
                    if seen == nth:
                        return i
    raise SystemExit(f"{code} {c}:{v}: no word {form}")


def open_structure(page, ref):
    page.goto(f"{BASE}/greek.html?demo&ref={ref}")
    page.wait_for_selector(".sent, .msg")
    page.evaluate("document.fonts.ready")


def chip_label(page, i):
    return page.evaluate("""i => { const w = document.querySelector(`.outline .w[data-i="${i}"]`); if (!w) return null;
        const c = w.closest('.chip'); const l = c && c.querySelector('.chip-l'); return l ? l.textContent.trim() : ''; }""", i)


def line_of(page, i):
    return page.evaluate("""i => { const w = document.querySelector(`.outline .w[data-i="${i}"]`); const ln = w && w.closest('.ln');
        return ln ? { c: ln.dataset.c, label: ln.querySelector('.ln-l').innerText.replace(/\\s+/g, ' ').trim(),
                      wdw: (ln.querySelector('.ln-w') || {}).innerText || '' } : null; }""", i)


def same_chip(page, a, b):
    return page.evaluate("""([a, b]) => { const x = document.querySelector(`.outline .w[data-i="${a}"]`), y = document.querySelector(`.outline .w[data-i="${b}"]`);
        return !!x && !!y && x.closest('.chip') === y.closest('.chip'); }""", [a, b])


def tap_label(page, i):
    page.evaluate("""i => document.querySelector(`.outline .w[data-i="${i}"]`).closest('.chip').querySelector('.chip-l').click()""", i)
    page.wait_for_selector("#panel:not([hidden]) .pb")
    return page.inner_text("#panel")


def shot(page, name):
    page.screenshot(path=os.path.join(SHOTS, name + ".png"))


def main():
    if not EMAIL:
        sys.exit("Set AKOUO_PLUS_EMAIL to an address on the Akouō Plus list.")
    os.makedirs(SHOTS, exist_ok=True)
    server = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"], cwd=ROOT,
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.2)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(args=["--no-sandbox"])
            ctx = browser.new_context(viewport=PORTRAIT, device_scale_factor=2)
            fonts(ctx)
            page = ctx.new_page()
            watch(page, "structure")
            seed(page, EMAIL)
            page.evaluate("localStorage.setItem('akouo.greek.view', JSON.stringify('structure'))")

            print("John 1:1-5")
            open_structure(page, "John 1:1-5")
            theos, en, logos3 = word("JHN", 1, 1, "θεὸς"), word("JHN", 1, 1, "ἦν", 3), word("JHN", 1, 1, "λόγος", 3)
            check("θεὸς is the predicate", chip_label(page, theos) == "Predicate", chip_label(page, theos))
            check("ἦν is the linking verb", chip_label(page, en) == "Linking verb", chip_label(page, en))
            check("ὁ λόγος is the subject", chip_label(page, logos3) == "Subject", chip_label(page, logos3))
            w = line_of(page, theos)["wdw"]
            check("who does what names subject, linking verb and predicate", all(x in w for x in ("Subject:", "Linking verb:", "Predicate:")), w)
            check("one block per sentence, and a flow-of-thought entry for each", page.locator(".sent").count() == page.locator(".flow li").count() > 0)
            check("connectives are marked with their usual sense", page.locator(".chip.conn .sense").count() > 0)
            check("the MACULA analysis note is shown", "one careful scholarly analysis" in page.inner_text(".snote"))
            shot(page, "s-john-1-1-5-portrait")
            t = tap_label(page, logos3)
            check("tapping a role label explains the group", "subject of" in t and "Head word" in t, t[:200])
            check("its words light up, with the head word marked", page.locator(".outline .w.hl").count() == 2 and page.locator(".outline .w.head").count() == 1)
            page.click("#panel [data-close]")
            check("closing the panel clears the highlight", page.locator(".outline .w.hl").count() == 0)
            page.locator(".treebox summary").first.click()
            page.wait_for_selector(".treebox[open] .tree")
            check("the tree view opens with nested groups", page.locator(".treebox[open] .tree li").count() > 10)
            page.click("#t-wdw")
            check("Who does what can be hidden", page.locator(".ln-w").first.is_hidden())
            page.click("#t-wdw")

            print("Ephesians 2:8-10")
            open_structure(page, "Ephesians 2:8-10")
            este, ses = word("EPH", 2, 8, "ἐστε"), word("EPH", 2, 8, "σεσῳσμένοι")
            check("ἐστε σεσῳσμένοι form one verb part", same_chip(page, este, ses) and chip_label(page, ses) == "Verb", chip_label(page, ses))
            t = tap_label(page, ses)
            check("the group panel says MACULA treats them as one verb", "one verb" in t)
            page.click("#panel [data-close]")
            chariti, dia = word("EPH", 2, 8, "χάριτί"), word("EPH", 2, 8, "διὰ")
            check("τῇ χάριτι is adverbial", chip_label(page, chariti) == "Adverbial", chip_label(page, chariti))
            check("διὰ πίστεως is adverbial", chip_label(page, dia) == "Adverbial", chip_label(page, dia))
            touto = word("EPH", 2, 8, "τοῦτο")
            page.click(f'.outline .w[data-i="{touto}"]')
            page.wait_for_selector("#panel:not([hidden]) .pb")
            t = page.inner_text("#panel")
            check("τοῦτο shows MACULA's link back, labelled as MACULA's", "MACULA links this word back to" in t)
            page.click("#panel [data-close]")
            shot(page, "s-ephesians-2-8-10-portrait")

            print("Hebrews 11:3")
            open_structure(page, "Hebrews 11:3")
            pistei = word("HEB", 11, 3, "Πίστει")
            check("Πίστει is adverbial", chip_label(page, pistei) == "Adverbial", chip_label(page, pistei))
            page.click(f'.outline .w[data-i="{pistei}"]')
            page.wait_for_selector("#panel:not([hidden]) .pb")
            check("its panel gives the dative parsing", "dative" in page.inner_text("#panel").lower())
            page.click("#panel [data-close]")

            print("Romans 5:1")
            open_structure(page, "Romans 5:1")
            dik, echo = word("ROM", 5, 1, "Δικαιωθέντες"), word("ROM", 5, 1, "ἔχομεν")
            ln = line_of(page, dik)
            check("Δικαιωθέντες opens an adverbial participle clause that tells more about ἔχομεν",
                  "Adverbial clause" in ln["label"] and "participle" in ln["label"] and "ἔχομεν" in ln["label"], ln["label"])
            check("ἔχομεν is the verb of the main clause", chip_label(page, echo) == "Verb" and line_of(page, echo)["c"] != ln["c"])
            shot(page, "s-romans-5-1-portrait")

            print("Acts 1:8")
            open_structure(page, "Acts 1:8")
            lem, dyn, epel = word("ACT", 1, 8, "λήμψεσθε"), word("ACT", 1, 8, "δύναμιν"), word("ACT", 1, 8, "ἐπελθόντος")
            check("λήμψεσθε is the verb and δύναμιν its object", chip_label(page, lem) == "Verb" and chip_label(page, dyn) == "Object")
            check("the two clauses joined by καί are both main clauses",
                  line_of(page, lem)["label"].startswith("Main clause") and line_of(page, word("ACT", 1, 8, "ἔσεσθέ"))["label"].startswith("Main clause"))
            ln = line_of(page, epel)
            check("ἐπελθόντος τοῦ ἁγίου πνεύματος stands as its own clause line", ln["c"] != line_of(page, lem)["c"] and "participle" in ln["label"], ln["label"])
            shot(page, "s-acts-1-8-portrait")

            print("Acts 2:38")
            open_structure(page, "Acts 2:38")
            bap, eis = word("ACT", 2, 38, "βαπτισθήτω"), word("ACT", 2, 38, "εἰς")
            check("εἰς ἄφεσιν sits in the βαπτισθήτω clause (MACULA's attachment)", line_of(page, eis)["c"] == line_of(page, bap)["c"])
            check("and is labelled adverbial", chip_label(page, eis) == "Adverbial", chip_label(page, eis))
            met = word("ACT", 2, 38, "Μετανοήσατε")
            check("Μετανοήσατε is in a different clause", line_of(page, met)["c"] != line_of(page, bap)["c"])

            print("Verse numbering and views")
            page.evaluate("localStorage.setItem('akouo.greek.view', JSON.stringify('read'))")
            page.goto(f"{BASE}/greek.html?demo&ref=Acts 13:38-39")
            page.wait_for_selector(".verse")
            notes = page.inner_text(".reader")
            check("Acts 13:38 says the BSB counts some words in verse 39", "The BSB counts" in notes and "verse 39" in notes)
            check("Acts 13:39 says its BSB verse also translates words from verse 38", "also translates" in notes)
            first = word("ACT", 13, 38, "Γνωστὸν")
            page.click(f'.w[data-i="{first}"]')
            page.wait_for_selector("#panel:not([hidden]) .pb")
            page.click("#panel [data-structure]")
            page.wait_for_selector(".sent")
            check("See the structure of this sentence switches view and keeps the word selected",
                  page.locator(f'.outline .w[data-i="{first}"][aria-pressed="true"]').count() == 1)
            page.click('[data-view="read"]')
            page.wait_for_selector(".verse")
            check("switching back to Read keeps it selected", page.locator(f'.w[data-i="{first}"][aria-pressed="true"]').count() == 1)

            print("Long sentences")
            page.evaluate("localStorage.setItem('akouo.greek.view', JSON.stringify('structure'))")
            t0 = time.time()
            open_structure(page, "Ephesians 1:3-14")
            dt = time.time() - t0
            longest = max(page.evaluate("[...document.querySelectorAll('.sent')].map(s => s.querySelectorAll('.outline .w').length)"))
            check(f"Ephesians 1:3-14 opens in under 1.5 s ({dt:.2f}s; longest sentence {longest} words)", dt < 1.5)
            shot(page, "s-ephesians-1-3-14-portrait")

            print("Whole New Testament (Phase 3)")
            with open(os.path.join(ROOT, "bible", "greek", "index.json"), encoding="utf-8") as f:
                built = json.load(f)["books"]
            check("all 27 books are built", len(built) == 27, str(len(built)))
            slow = []
            for code, b in built.items():
                t0 = time.time()
                open_structure(page, f"{b['name']} {b['chapters']}")
                if page.locator(".sent").count() == 0:
                    slow.append(f"{code} did not open")
                elif time.time() - t0 > 2.5:
                    slow.append(f"{code} {time.time() - t0:.1f}s")
            check("the last chapter of every book opens in Structure view", not slow, "; ".join(slow))
            open_structure(page, "Romans 16:25-27")
            check("Romans 16:25-27 is there, labelled as from Nestle 1904", "Nestle 1904" in page.inner_text(".nxnote") and page.locator(".sent").count() == 1)
            t0 = time.time()
            open_structure(page, "Luke 3:23-38")
            dt = time.time() - t0
            page.locator(".treebox summary").first.click()
            page.wait_for_selector(".treebox[open] .tree")
            check(f"Luke's genealogy opens ({dt:.2f}s) and its tree stops indenting deep down", dt < 2 and page.locator(".tree ul.flat").count() > 0)
            open_structure(page, "Romans 8:1")
            oud, kat = word("ROM", 8, 1, "Οὐδὲν"), word("ROM", 8, 1, "κατάκριμα")
            check("Οὐδὲν … κατάκριμα (split by ἄρα νῦν) is marked as one subject in two pieces",
                  chip_label(page, oud) == "Subject …" and chip_label(page, kat) == "… Subject", f"{chip_label(page, oud)} / {chip_label(page, kat)}")
            t = tap_label(page, kat)
            check("tapping either piece lights up the whole subject", page.locator(".outline .w.hl").count() == 2)
            page.click("#panel [data-close]")
            open_structure(page, "Ephesians 2:8")
            check("a postpositive γάρ stays inside its phrase instead of splitting it", page.locator(".chip .tuck").count() >= 1 and page.locator(".chip.split").count() == 0)

            print("Landscape and dark")
            ctx2 = browser.new_context(viewport=LANDSCAPE, device_scale_factor=2, color_scheme="dark")
            fonts(ctx2)
            p2 = ctx2.new_page()
            watch(p2, "landscape")
            seed(p2, EMAIL)
            p2.evaluate("localStorage.setItem('akouo.greek.view', JSON.stringify('structure'))")
            open_structure(p2, "Acts 1:8")
            tap_label(p2, word("ACT", 1, 8, "δύναμιν"))
            shot(p2, "s-acts-1-8-landscape-dark")
            open_structure(p2, "Ephesians 2:8-10")
            shot(p2, "s-ephesians-2-8-10-landscape-dark")
            check("dark landscape renders with the panel beside the text", p2.locator(".sent").count() > 0)
            browser.close()
    finally:
        server.terminate()
    check("no errors in the browser console", not errors, "; ".join(errors[:5]))
    failed = [n for n, ok in results if not ok]
    print(f"\n{len(results) - len(failed)} of {len(results)} checks passed. Screenshots: {SHOTS}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
