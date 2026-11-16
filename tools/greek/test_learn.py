#!/usr/bin/env python3
"""Browser tests for Learn mode (Phase 4), run like test_page.py:

    AKOUO_PLUS_EMAIL=<an address on the Akouō Plus list> FONT_DIR=<@fontsource folder> python3 tools/greek/test_learn.py [screenshot folder]

Graded reading, known words, the vocabulary deck and a review session, a parsing drill answered from the data,
paradigm tables from attested forms, lessons, progress, and that everything is saved to the account (the demo store).
"""
import json
import os
import subprocess
import sys
import time

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_page import BASE, EMAIL, LANDSCAPE, PORT, PORTRAIT, ROOT, check, errors, fonts, results, seed, watch  # noqa: E402
from test_structure import book, word  # noqa: E402

SHOTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cache", "shots")
with open(os.path.join(ROOT, "bible", "greek", "codes.json"), encoding="utf-8") as f:
    CODES = json.load(f)["codes"]


def saved(page):
    """The learn document in the demo account."""
    return page.evaluate("(() => { try { return JSON.parse(localStorage.getItem('akouo.demo')).greek.learn || {}; } catch (e) { return {}; } })()")


def open_read(page, ref):
    page.evaluate("localStorage.setItem('akouo.greek.view', JSON.stringify('read'))")
    page.goto(f"{BASE}/greek.html?demo&ref={ref}")
    page.wait_for_selector(".verse")


def tab(page, name):
    if not page.locator("#learn[open]").count():
        page.click("#t-learn")
    page.click(f'#ltabs [data-tab="{name}"]')
    page.wait_for_selector("#lbody .lcard")
    time.sleep(0.4)


def expected(code):
    """The drill's answer for a grammar code, worked out here independently from codes.json."""
    f = {}
    for k, v in CODES[code]["f"]:
        f[k] = v
    t = {}
    if f.get("Function") == "Verb":
        t["Tense"] = f.get("Tense", "").replace("2nd ", "")
        voice = f.get("Voice", "")
        t["Voice"] = "Middle or passive" if "middle or passive" in voice.lower() else "Middle" if voice.lower().startswith("middle") else "Passive" if voice.lower().startswith("passive") else voice
        t["Mood"] = f.get("Mood") or f.get("Form")
        if "Case" not in f:
            t["Person"] = f.get("Person", "")[:3]
            t["Number"] = f.get("Number")
    if "Case" in f:
        t.update({"Case": f["Case"], "Number": f.get("Number"), "Gender": f.get("Gender")})
    return {k: v for k, v in t.items() if v}


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
            watch(page, "learn")
            seed(page, EMAIL)
            page.evaluate("localStorage.removeItem('akouo.greek.graded')")

            print("Graded reading")
            open_read(page, "John 1:1-5")
            logos = word("JHN", 1, 1, "λόγος")
            w = page.locator(f'.w[data-i="{logos}"]')
            check("glosses show before graded reading is on", w.locator(".gl").is_visible())
            page.click("#t-graded")
            check("graded reading hides glosses", not w.locator(".gl").is_visible())
            check("and says how much of the passage you know", "You know 0%" in page.inner_text("#kshare"))
            w.click()
            check("the first tap on an unknown word shows its gloss, without opening the panel",
                  w.locator(".gl").is_visible() and page.locator("#panel").is_hidden())
            w.click()
            page.wait_for_selector("#panel:not([hidden]) .pb")
            check("the second tap opens the word panel", "λόγος" in page.inner_text("#panel"))

            print("Known words")
            page.click('#panel [data-learn="known"]')
            time.sleep(0.3)
            n_logos = page.locator(f'.w.known').count()
            check("Mark as known marks every form of λόγος in the passage", n_logos == 3, str(n_logos))
            check("known words never show a gloss in graded reading", not w.locator(".gl").is_visible())
            check("the share goes up", "You know 5%" in page.inner_text("#kshare"), page.inner_text("#kshare"))
            check("it is saved to the account", "λόγος" in saved(page).get("known", {}))

            print("The deck")
            theon = word("JHN", 1, 1, "θεόν")
            page.click("#panel [data-close]")
            page.locator(f'.w[data-i="{theon}"]').click()
            page.locator(f'.w[data-i="{theon}"]').click()
            page.wait_for_selector("#panel:not([hidden]) .pb")
            page.wait_for_function("document.querySelector('#p-short') && document.querySelector('#p-short').textContent !== '…'")
            page.click('#panel [data-learn="deck"]')
            time.sleep(0.3)
            card = saved(page).get("deck", {}).get("θεός", {})
            check("Add to my deck saves the word with its gloss and the verse you met it in",
                  card.get("g") == "God" and card.get("b") == "JHN" and card.get("c") == 1 and card.get("v") == 1, json.dumps(card, ensure_ascii=False))
            check("the panel shows it is in the deck", "In my deck" in page.inner_text("#p-learn"))
            page.click("#panel [data-close]")
            tab(page, "review")
            check("Review shows one card due", "1 card is due" in page.inner_text("#lbody"))
            here = page.locator("#lr-here li").count()
            check("words from the passage you don't know are offered, most frequent first",
                  here > 10 and page.locator("#lr-here li").first.get_attribute("data-l") == "ὁ", str(here))
            page.locator('#lr-here li[data-l="καί"] [data-know]').click()
            time.sleep(0.2)
            check("I know it marks the word known", "καί" in saved(page).get("known", {}))
            page.locator('#lr-here li[data-l="ἀρχή"] [data-add]').click()
            time.sleep(0.2)
            check("Add puts a passage word in the deck", "ἀρχή" in saved(page).get("deck", {}))
            page.click('[data-addall="lr-core"]')
            time.sleep(0.6)
            deck = saved(page).get("deck", {})
            check("Add these 20 adds the next core words", len(deck) == 22, str(len(deck)))
            check("core cards carry the short-lexicon gloss", deck.get("ἐν", {}).get("g") == "in/on/among", json.dumps(deck.get("ἐν"), ensure_ascii=False))

            print("A review session")
            tab(page, "review")
            page.click("[data-start]")
            page.wait_for_selector(".flash")
            first = page.inner_text(".flash .card-gk")
            check("the first card is Greek to English", "Greek to English" in page.inner_text(".flash"))
            page.click("[data-show]")
            page.wait_for_selector("#lr-eg .eg-gk", timeout=15000)
            eg = page.inner_text("#lr-eg")
            check("the answer shows an example verse with the BSB", len(eg) > 40 and page.locator("#lr-eg .eg-gk b").count() >= 1, eg[:120])
            shot = os.path.join(SHOTS, "l-review-card.png")
            page.screenshot(path=shot)
            if first.strip() == "θεός":
                check("θεός's example is the verse where you added it", "John 1:1" in eg and "where you added it" in eg, eg[-120:])
            lemma = first.strip()
            page.click('[data-grade="1"]')
            time.sleep(0.3)
            c = saved(page)["deck"][lemma]
            check("Got it moves the card to box 1, due again in a day", c["ge"][0] == 1 and c["ge"][1] > time.time() * 1000 + 20 * 3600e3, json.dumps(c))
            page.click("[data-show]")
            page.wait_for_selector("[data-grade]")
            second = page.inner_text("#lr-back .card-gk").strip()
            page.click('[data-grade="0"]')
            time.sleep(0.3)
            c2 = saved(page)["deck"][second]
            check("Missed it keeps the card in box 0 and brings it back soon", c2["ge"][0] == 0 and c2["ge"][1] < time.time() * 1000 + 15 * 60e3)
            check("English to Greek cards wait until tomorrow", all(v["eg"][1] > time.time() * 1000 + 20 * 3600e3 for v in saved(page)["deck"].values()))
            page.click("[data-end]")

            print("Parsing practice")
            tab(page, "parse")
            ok_once = False
            for _ in range(3):
                info = page.evaluate("""() => { const ctx = document.querySelector('.drill-ctx'), b = ctx.querySelector('b');
                    const words = ctx.innerText.trim().split(/\\s+/); const before = ctx.innerHTML.split('<b>')[0];
                    const tmp = document.createElement('div'); tmp.innerHTML = before; const n = tmp.innerText.trim() ? tmp.innerText.trim().split(/\\s+/).length : 0;
                    return { ref: document.querySelector('.drill .small').innerText, pos: n, form: b.innerText }; }""")
                c_, v_ = info["ref"].split("·")[1].strip().split(" ")[-1].split(":")
                b = book("JHN")
                vs = b["vs"]
                k = next(j for j in range(0, len(vs), 3) if vs[j] == int(c_) and vs[j + 1] == int(v_))
                i = vs[k + 2] + info["pos"]
                code = b["M"][b["w"]["m"][i]]
                want = expected(code)
                for field, val in want.items():
                    page.click(f'.fo button[data-f="{field}"][data-o="{val}"]')
                page.click("[data-check]")
                verdict = page.inner_text(".verdict")
                check(f"answering {info['form']} ({code}) as the data parses it is marked right", verdict.startswith("All right"), verdict)
                ok_once = ok_once or verdict.startswith("All right")
                page.click("[data-next]")
            # a wrong answer gets an explanation
            fields = page.evaluate("[...new Set([...document.querySelectorAll('.fo button')].map(b => b.dataset.f))]")
            for fld in fields:
                opts = page.locator(f'.fo button[data-f="{fld}"]')
                opts.nth(opts.count() - 1).click()
            page.click("[data-check]")
            txt = page.inner_text(".drill")
            check("a wrong answer is explained field by field, with the full parsing", ("the data says" in txt or "All right" in txt) and "parsing from MACULA" in txt)
            page.screenshot(path=os.path.join(SHOTS, "l-drill-checked.png"))
            check("drills are counted in your progress", saved(page).get("drill", {}).get("n", 0) >= 4)
            page.click("#lclose")

            print("Paradigms")
            page.click("#t-graded")   # graded reading off again
            page.locator(f'.w[data-i="{theon}"]').click()
            page.wait_for_selector("#panel:not([hidden]) .pb")
            page.click('#panel [data-learn="paradigm"]')
            page.wait_for_selector("#lbody .pdg")
            me = page.locator(".pdg td.me")
            check("All its forms opens θεός's own paradigm with θεόν highlighted", me.count() == 1 and "θεόν" in me.inner_text(), me.inner_text() if me.count() else "")
            page.screenshot(path=os.path.join(SHOTS, "l-paradigm-theos.png"))
            page.click('[data-model="ὁ"]')
            page.wait_for_selector(".pdg")
            art = page.inner_text(".pdg")
            check("the article table is filled from the data", all(x in art for x in ("ὁ", "τοῦ", "τῷ", "τόν", "τήν", "τό", "τῶν", "τοῖς")))
            page.click('[data-model="λύω"]')
            page.wait_for_selector(".pdg")
            check("λύω's table marks forms that never occur in the New Testament", page.locator(".pdg td.na").count() > 10)
            page.click('[data-model="εἰμί"]')
            page.wait_for_selector(".pdg")
            ei = page.inner_text("#lbody")
            check("εἰμί shows its present and imperfect and its participles", all(x in ei for x in ("εἰμί", "ἐστιν", "ἦν", "Participles")), ei[:200])
            page.screenshot(path=os.path.join(SHOTS, "l-paradigm-eimi.png"))

            print("Lessons")
            tab(page, "lessons")
            b = book("JHN")
            vs = b["vs"]
            a = next(vs[j + 2] for j in range(0, len(vs), 3) if vs[j] == 1 and vs[j + 1] == 1)
            z = next(vs[j + 2] for j in range(0, len(vs), 3) if vs[j] == 1 and vs[j + 1] == 6)
            n_art = sum(1 for i in range(a, z) if b["M"][b["w"]["m"][i]].startswith("T-"))
            art = page.locator(".lesson", has_text="The article").first.inner_text()
            check(f"the article lesson is offered, counted from the data ({n_art} in John 1:1-5)", f"has {n_art} articles" in art, art[:80])
            page.locator(".lesson", has_text="The article").first.locator("[data-word]").first.click()
            page.wait_for_selector("#panel:not([hidden]) .pb")
            check("tapping a word in a lesson closes the sheet and opens that word", page.locator("#learn[open]").count() == 0 and "article" in page.inner_text("#panel").lower())
            page.click("#panel [data-close]")

            print("Progress and saving")
            open_read(page, "Romans 5:1-5")
            tab(page, "progress")
            pr = page.inner_text("#lbody")
            check("progress counts passages studied", "John 1:1-5" in pr and "Romans 5:1-5" in pr)
            check("progress counts known words and core coverage", "You know 2 words" in pr and "you know 2." in pr and "%" in pr, pr[:400])
            page.screenshot(path=os.path.join(SHOTS, "l-progress.png"))
            page.reload()
            page.wait_for_selector(".verse")
            tab(page, "review")
            check("the deck is still there after reloading", "Your deck (22)" in page.inner_text("#lbody"))
            page.click("#lclose")

            print("Landscape and dark")
            ctx2 = browser.new_context(viewport=LANDSCAPE, device_scale_factor=2, color_scheme="dark")
            fonts(ctx2)
            p2 = ctx2.new_page()
            watch(p2, "landscape")
            seed(p2, EMAIL)
            open_read(p2, "Ephesians 2:8-10")
            tab(p2, "parse")
            p2.screenshot(path=os.path.join(SHOTS, "l-drill-landscape-dark.png"))
            tab(p2, "lessons")
            p2.screenshot(path=os.path.join(SHOTS, "l-lessons-landscape-dark.png"))
            check("Learn renders in dark landscape", p2.locator(".lesson").count() > 0)
            browser.close()
    finally:
        server.terminate()
    check("no errors in the browser console", not errors, "; ".join(errors[:5]))
    failed = [n for n, ok in results if not ok]
    print(f"\n{len(results) - len(failed)} of {len(results)} checks passed. Screenshots: {SHOTS}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
