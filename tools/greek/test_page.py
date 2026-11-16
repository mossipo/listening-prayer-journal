#!/usr/bin/env python3
"""Browser tests for the Greek Study Desk (Playwright, Chromium), run against a local copy of the site in demo mode.

    AKOUO_PLUS_EMAIL=<an address on the Akouō Plus list> python3 tools/greek/test_page.py [screenshot folder]

The address is never written into the repository; it is only placed in the demo journal of the test browser so that
isPlus passes. Optional: FONT_DIR=<node_modules/@fontsource> serves Alegreya locally when Google Fonts can't be reached,
so screenshots use the real fonts.
"""
import json
import os
import re
import subprocess
import sys
import time

from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
PORT = int(os.environ.get("PORT", "8765"))
BASE = f"http://localhost:{PORT}"
EMAIL = os.environ.get("AKOUO_PLUS_EMAIL", "")
FONT_DIR = os.environ.get("FONT_DIR", "")
SHOTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, ".cache", "shots")
PORTRAIT, LANDSCAPE = {"width": 820, "height": 1180}, {"width": 1180, "height": 820}
JOHN_1_1 = "Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος."

results, errors = [], []


def check(name, ok, detail=""):
    results.append((name, bool(ok)))
    print(("  pass  " if ok else "  FAIL  ") + name + (f"   [{detail}]" if detail and not ok else ""))


FACES = [("Alegreya", "alegreya", w, s) for w in (400, 600, 700) for s in ("normal", "italic")] + \
        [("Alegreya Sans", "alegreya-sans", w, s) for w in (400, 500, 700) for s in ("normal", "italic")] + \
        [("Alegreya Sans SC", "alegreya-sans-sc", w, "normal") for w in (500, 700)]


def fonts(context):
    """Google Fonts from local files when FONT_DIR is given; otherwise let the request fail fast."""
    def css(route):
        if not FONT_DIR:
            return route.abort()
        out = ""
        for fam, pkg, w, s in FACES:
            f = f"{pkg}-latin-{w}-{s}.woff2"
            if os.path.exists(os.path.join(FONT_DIR, pkg, "files", f)):
                out += f"@font-face{{font-family:'{fam}';font-style:{s};font-weight:{w};src:url(https://fonts.gstatic.com/local/{pkg}/{f}) format('woff2')}}\n"
        route.fulfill(status=200, content_type="text/css", body=out, headers={"access-control-allow-origin": "*"})

    def face(route):
        parts = route.request.url.split("/local/")[-1].split("/")
        path = os.path.join(FONT_DIR, parts[0], "files", parts[-1]) if FONT_DIR and len(parts) == 2 else ""
        if path and os.path.exists(path):
            route.fulfill(status=200, content_type="font/woff2", path=path, headers={"access-control-allow-origin": "*"})
        else:
            route.abort()
    context.route("https://fonts.googleapis.com/**", css)
    context.route("https://fonts.gstatic.com/**", face)


def watch(page, label):
    page.on("pageerror", lambda e: errors.append(f"{label}: {e}"))
    page.on("console", lambda m: errors.append(f"{label}: {m.text}") if m.type == "error" and "fonts.g" not in m.text and "ERR_FAILED" not in m.text and "net::" not in m.text else None)


def seed(page, email):
    """Put the sample journal, signed in as this address, into the test browser."""
    page.goto(BASE + "/privacy.html")
    page.evaluate("""async (email) => { const m = await import('./demo-data.js'); const d = m.demoData(); d.email = email;
        localStorage.setItem('akouo.demo', JSON.stringify(d)); }""", email)


def open_greek(page, ref, extra=""):
    page.goto(f"{BASE}/greek.html?demo&ref={ref}{extra}")
    page.wait_for_selector(".verse, .msg")
    page.evaluate("document.fonts.ready")


def panel_text(page, i):
    page.click(f'.w[data-i="{i}"]')
    page.wait_for_selector("#panel:not([hidden]) .pb")
    return page.inner_text("#panel")


def main():
    if not EMAIL:
        sys.exit("Set AKOUO_PLUS_EMAIL to an address on the Akouō Plus list.")
    os.makedirs(SHOTS, exist_ok=True)
    with open(os.path.join(ROOT, "bible", "greek", "JHN.json"), encoding="utf-8") as f:
        jhn = json.load(f)
    with open(os.path.join(ROOT, "bible", "greek", "codes.json"), encoding="utf-8") as f:
        roles = json.load(f)["roles"]
    server = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"], cwd=ROOT,
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.2)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(channel=os.environ.get("CHROME_CHANNEL", "chrome"), args=["--no-sandbox"])

            # ---------------- golden passage: John 1:1-5, checked against the data files
            print("John 1:1-5 (iPad portrait)")
            ctx = browser.new_context(viewport=PORTRAIT, device_scale_factor=2, has_touch=True)
            fonts(ctx)
            page = ctx.new_page()
            watch(page, "greek")
            seed(page, EMAIL)
            t0 = time.time()
            open_greek(page, "John 1:1-5")
            first_open = time.time() - t0
            check("five verses are shown", page.locator(".verse").count() == 5)
            v1 = " ".join(page.locator("#v1-1 .w .g").all_inner_texts())
            check("verse 1 reads exactly as the SBLGNT prints it", v1 == JOHN_1_1, v1)
            check("Greek is marked lang=el and set in Gentium Plus",
                  page.evaluate("""() => { const g = document.querySelector('.w .g'); return g.lang === 'el' && getComputedStyle(g).fontFamily.includes('Gentium Plus') && document.fonts.check('26px "Gentium Plus"', 'ἀρχῇ'); }"""))
            check("BSB English is under verse 1", "In the beginning was the Word" in page.inner_text("#v1-1 .en"))
            check("a gloss sits under each Greek word", page.inner_text('.w[data-i="1"] .gl') == "beginning")
            sizes = page.evaluate("[...document.querySelectorAll('.w')].map(b => b.getBoundingClientRect().height)")
            check("every word is a real button at least 40 px tall", min(sizes) >= 40 and page.evaluate("[...document.querySelectorAll('.w')].every(b => b.tagName === 'BUTTON')"), min(sizes))
            page.screenshot(path=os.path.join(SHOTS, "1-john1-portrait-reader.png"))

            # the data itself: imperfect ἦν; θεὸς predicate; ὁ λόγος subject (word numbers 13 to 16 of John)
            w = jhn["w"]
            check("data: word 14 is ἦν, V-IAI-3S, linking verb", jhn["F"][w["f"][14]] == "ἦν" and jhn["M"][w["m"][14]] == "V-IAI-3S" and roles[w["r"][14]] == "vc")
            check("data: θεὸς carries the role predicate", jhn["F"][w["f"][13]] == "θεὸς" and roles[w["r"][13]] == "p")
            clause = jhn["s"][0][3][2]      # third coordinate clause: θεὸς ἦν ὁ λόγος
            subj = clause[3]
            check("data: ὁ λόγος is a noun phrase with the role subject, head λόγος", subj[1:] == [15, 16] and roles[subj[0][1]] == "s" and subj[0][3] == 16)

            t = panel_text(page, 14)
            check("ἦν: Verb · imperfect · active · indicative · 3rd person singular", "Verb · imperfect · active · indicative · 3rd person singular" in t, t[:300])
            check("ἦν: the imperfect is explained", "The imperfect pictures a past action as ongoing" in t)
            check("ἦν: linking verb of its clause", "Linking verb of its clause" in t)
            check("ἦν: a Careful note about tense", "CAREFUL" in t and "tense" in t)
            page.wait_for_function("document.querySelector('#p-occ') && /occurs/.test(document.querySelector('#p-occ').innerText)")
            page.wait_for_function("document.querySelector('#p-lex') && !/Looking up/.test(document.querySelector('#p-lex').innerText)")
            t = page.inner_text("#panel")
            check("ἦν: dictionary form εἰμί and its count in the New Testament", "εἰμί" in t and "occurs" in t)
            check("ἦν: lexicon shows the short entry, Abbott-Smith and Thayer", "Abbott-Smith, full entry" in t and "Thayer, full entry" in t)
            check("the panel is a bottom sheet in portrait", page.evaluate("getComputedStyle(document.querySelector('#panel')).position") == "fixed")
            page.screenshot(path=os.path.join(SHOTS, "2-john1-portrait-word-panel.png"))

            t = panel_text(page, 13)
            check("θεὸς: Noun · nominative singular masculine", "Noun · nominative singular masculine" in t, t[:200])
            check("θεὸς: predicate, joined to the subject by ἦν", "Predicate, joined to the subject by ἦν" in t, t)
            check("θεὸς: possible uses of the nominative, with 'context decides'", "Possible uses of the nominative".upper() in t.upper() and "Context decides" in t)
            t = panel_text(page, 16)
            check("λόγος: part of the subject (ὁ λόγος) of ἦν", "Part of the subject (ὁ λόγος) of ἦν" in t, t)
            check("λόγος: the BSB rendering in this verse is shown", "BSB in this verse" in t and "Word" in t)
            t = panel_text(page, 15)
            check("ὁ: part of the subject, goes with λόγος", "Part of the subject (ὁ λόγος) of ἦν" in t and "Goes with λόγος, the head word of its noun phrase" in t, t)
            check("the panel says the analysis is MACULA's and one reading", "MACULA's syntax analysis, which is one scholarly reading" in t)
            check("the foot of the page credits every source", "MACULA" in page.inner_text(".foot") and page.locator(".foot li").count() >= 7)

            # toggles
            page.click("#panel [data-close]")
            page.click("#t-gloss")
            check("Glosses toggle hides the gloss line", not page.locator('.w[data-i="1"] .gl').is_visible())
            page.click("#t-gloss")
            page.click('[data-en="off"]')
            check("English can be turned off", not page.locator("#v1-1 .en").is_visible())
            page.click('[data-en="beside"]')
            check("English can sit beside the Greek", page.evaluate("getComputedStyle(document.querySelector('#v1-1 .vbody')).display") == "grid")
            page.screenshot(path=os.path.join(SHOTS, "3-john1-portrait-english-beside.png"))
            page.click('[data-en="under"]')

            # picker, previous and next
            page.click("#pick")
            ready = json.load(open(os.path.join(ROOT, "bible", "greek", "index.json"), encoding="utf-8"))["books"]
            check("picker lists the New Testament, with the built books ready and the rest marked as coming",
                  all(page.locator(f'#pbody button[data-book="{b}"]:not([disabled])').count() == 1 for b in ready)
                  and page.locator("#pbody button[data-book][disabled]").count() == 27 - len(ready))
            page.screenshot(path=os.path.join(SHOTS, "4-picker.png"))
            page.click('#pbody button[data-book="JHN"]')
            check("picker shows John's 21 chapters and a verse range", page.locator("#pbody button[data-ch]").count() == 21 and page.locator("#pfrom").count() == 1)
            page.fill("#pref", "John 3:16-17")
            page.press("#pref", "Enter")
            page.wait_for_selector("#v3-16")
            check("typing John 3:16-17 opens those two verses", page.locator(".verse").count() == 2 and "ref=John+3%3A16-17" in page.url and "demo" in page.url, page.url)
            page.click("#next")
            page.wait_for_selector("#v4-1")
            check("Next opens John 4, the whole chapter", page.inner_text("#pick") == "John 4" and page.locator(".verse").count() == 54)
            page.click("#prev")
            page.wait_for_selector("#v3-1")
            check("Previous opens John 3", page.inner_text("#pick") == "John 3")
            open_greek(page, "Genesis 1:1")
            check("an Old Testament passage says the desk covers the New Testament", "Old Testament" in page.inner_text(".msg") and page.locator(".verse").count() == 0)

            # keyboard
            open_greek(page, "John 1:1-5")
            page.focus('.w[data-i="2"]')
            page.keyboard.press("Enter")
            page.wait_for_selector("#panel:not([hidden]) .pb")
            check("keyboard: Enter on a word opens the panel and moves focus into it", page.evaluate("document.activeElement.id") == "panel")
            page.keyboard.press("Escape")
            check("keyboard: Escape closes the panel and returns to the word", page.evaluate("document.activeElement.dataset.i") == "2" and page.locator("#panel").is_hidden())

            # ---------------- saving
            print("Saving notes")
            page.click('.w[data-i="4"]')
            page.wait_for_selector("#p-note:not([disabled])")
            page.fill("#p-note", "The Word: John's name for the Son before he names Jesus.")
            page.wait_for_function("/Saved/.test(document.querySelector('#p-note-s').textContent)")
            page.reload()
            page.wait_for_selector(".verse")
            page.click('.w[data-i="7"]')    # another λόγος: the note belongs to the dictionary word
            page.wait_for_selector("#p-note:not([disabled])")
            check("a word note is saved and comes back after a refresh", page.input_value("#p-note").startswith("The Word: John's name"))
            stored = page.evaluate("JSON.parse(localStorage.getItem('akouo.demo')).greek")
            check("it is stored under greek/wnotes-G3, keyed by the dictionary word", "λόγος" in stored.get("wnotes-G3", {}).get("w", {}))
            page.fill("#p-note", "")
            page.wait_for_function("/Saved/.test(document.querySelector('#p-note-s').textContent)")
            check("clearing a note removes it", "λόγος" not in page.evaluate("JSON.parse(localStorage.getItem('akouo.demo')).greek['wnotes-G3'].w"))
            page.fill("#p-note", "kept until the account is deleted")
            page.wait_for_function("/Saved/.test(document.querySelector('#p-note-s').textContent)")
            page.evaluate("async () => { const m = await import('./backend.js'); const B = await m.createBackend(); await B.deleteAccount(); }")
            check("deleting the account removes the Greek study data (demo backend)", "greek" not in page.evaluate("JSON.parse(localStorage.getItem('akouo.demo') || '{}')"))
            ctx.close()

            # ---------------- landscape, dark, long chapter
            print("Landscape and dark")
            ctx = browser.new_context(viewport=LANDSCAPE, device_scale_factor=2, has_touch=True)
            fonts(ctx)
            page = ctx.new_page()
            watch(page, "landscape")
            seed(page, EMAIL)
            open_greek(page, "John 1:1-5")
            panel_text(page, 13)
            page.wait_for_function("!/Looking up/.test(document.querySelector('#p-lex').innerText) && /occurs/.test(document.querySelector('#p-occ').innerText)")
            check("landscape: the panel sits beside the text", page.evaluate("getComputedStyle(document.querySelector('#panel')).position") == "sticky" and page.evaluate("document.querySelector('#panel').getBoundingClientRect().left") > 700)
            page.screenshot(path=os.path.join(SHOTS, "5-john1-landscape-word-panel.png"))
            ctx.close()
            ctx = browser.new_context(viewport=LANDSCAPE, device_scale_factor=2, color_scheme="dark")
            fonts(ctx)
            page = ctx.new_page()
            watch(page, "dark")
            seed(page, EMAIL)
            open_greek(page, "John 1:1-5")
            panel_text(page, 14)
            page.wait_for_function("!/Looking up/.test(document.querySelector('#p-lex').innerText)")
            check("dark setting: the page follows it", page.evaluate("getComputedStyle(document.body).backgroundColor") == "rgb(22, 24, 15)")
            page.screenshot(path=os.path.join(SHOTS, "6-john1-landscape-dark.png"))
            t0 = time.time()
            open_greek(page, "John 6")
            long_open = time.time() - t0
            check("a long chapter (John 6, 71 verses) opens in under a second once the book is loaded", long_open < 1.0 and page.locator(".verse").count() == 71, f"{long_open:.2f}s")
            ctx.close()

            # ---------------- gating and entry points
            print("Gating and entry points")
            ctx = browser.new_context(viewport=PORTRAIT)
            fonts(ctx)
            page = ctx.new_page()
            watch(page, "other account")
            seed(page, "someone.else@example.com")
            open_greek(page, "John 1:1-5")
            check("another account gets a polite message and no Greek", "Akouō Plus" in page.inner_text(".msg") and page.locator(".verse").count() == 0 and page.locator("#tools").is_hidden())
            page.goto(BASE + "/?demo#entry/e-demo05s")
            page.wait_for_selector(".passage-card")
            page.wait_for_timeout(600)
            check("another account sees no Greek or Mark up links in the app", page.locator('a[href^="greek.html"]').count() == 0 and page.locator('a[href^="markup.html"]').count() == 0)
            ctx.close()
            ctx = browser.new_context(viewport=PORTRAIT, device_scale_factor=2)
            fonts(ctx)
            page = ctx.new_page()
            watch(page, "app")
            seed(page, EMAIL)
            page.goto(BASE + "/?demo#entry/e-demo05s")
            page.wait_for_selector(".passage-card")
            page.wait_for_selector('.passage-card a[href^="greek.html"]')
            href = page.get_attribute('.passage-card a[href^="greek.html"]', "href")
            check("a John passage on an entry shows a Greek link beside Mark up", href == "greek.html?ref=John%2015%3A1-8&demo" and page.locator('.passage-card a[href^="markup.html"]').count() == 1, href)
            page.screenshot(path=os.path.join(SHOTS, "7-entry-with-greek-link.png"))
            # the word card: tap an English word, then Study in Greek
            if page.get_attribute(".passage-card .wtoggle", "aria-pressed") != "true":
                page.click(".passage-card .wtoggle")
            page.wait_for_selector(".passage.words .w")
            vine = page.locator('.passage.words .w[data-s="G288"]').first
            vine.click()
            page.wait_for_selector('#wsheet a[href^="greek.html"]')
            href = page.get_attribute('#wsheet a[href^="greek.html"]', "href")
            check("the word card has a Study in Greek link carrying the verse and the word", href.startswith("greek.html?ref=John%2015%3A1&s=288&n=1"), href)
            page.goto(BASE + "/" + href)
            page.wait_for_selector("#panel:not([hidden]) .pb")
            check("Study in Greek opens the verse with the matching Greek word selected (ἄμπελος)", page.inner_text('.w[aria-pressed="true"] .g').startswith("ἄμπελος") and page.inner_text("#pick") == "John 15:1", page.inner_text("#pick"))
            page.goto(BASE + "/?demo#entry/e-demo06s")
            page.wait_for_selector(".passage-card")
            page.wait_for_timeout(500)
            check("a passage outside John (Psalm 23) shows no Greek link", page.locator('a[href^="greek.html"]').count() == 0)
            page.goto(BASE + "/markup.html?demo&ref=John%2015")
            page.wait_for_selector("#page")
            check("the mark-up page shows a Greek button for John 15", page.locator("#greek").is_visible() and page.get_attribute("#greek", "href") == "greek.html?ref=John%2015&demo")
            page.click("#greek")
            page.wait_for_selector("#v15-1")
            check("and the Greek page links back to mark up the same chapter", page.get_attribute("#t-markup", "href") == "markup.html?ref=John%2015&demo")
            page.goto(BASE + "/markup.html?demo&ref=Isaiah%2030")
            page.wait_for_selector("#page")
            check("the mark-up page shows no Greek button for Isaiah 30", page.locator("#greek").is_hidden())

            # ---------------- the rest of the app still works
            print("Existing app")
            for name in ["Today", "Entries", "Prayer", "Walk", "Settings"]:
                page.goto(BASE + "/?demo#" + name.lower())
                page.wait_for_function("!document.querySelector('.boot') && !!document.querySelector('#app header.top')")
                cur = page.locator('#app a[aria-current="page"]').first.inner_text()
                check(f"{name} opens", name in cur and len(page.inner_text("#app")) > 150, cur)
            version = re.search(r'const VERSION = "([^"]+)"', open(os.path.join(ROOT, "app.js"), encoding="utf-8").read()).group(1)
            check(f"Settings shows version {version}", f"Akouō {version}" in page.inner_text("body"))
            ctx.close()

            # ---------------- offline (the service worker only registers on https, so the test registers it itself)
            print("Offline")
            ctx = browser.new_context(viewport=PORTRAIT)
            fonts(ctx)
            page = ctx.new_page()
            watch(page, "offline")
            seed(page, EMAIL)
            page.evaluate("async () => { await navigator.serviceWorker.register('sw.js'); await navigator.serviceWorker.ready; }")
            page.reload()
            page.wait_for_function("!!navigator.serviceWorker.controller")
            open_greek(page, "John 1:1-5")
            panel_text(page, 14)
            page.wait_for_function("!/Looking up/.test(document.querySelector('#p-lex').innerText) && /occurs/.test(document.querySelector('#p-occ').innerText)")
            page.wait_for_timeout(800)
            ctx.set_offline(True)
            page.reload()
            page.wait_for_selector(".verse")
            v1 = " ".join(page.locator("#v1-1 .w .g").all_inner_texts())
            check("offline: the passage opens after a reload", v1 == JOHN_1_1 and "In the beginning" in page.inner_text("#v1-1 .en"))
            t = panel_text(page, 14)
            page.wait_for_function("!/Looking up/.test(document.querySelector('#p-lex').innerText) && !/Counting/.test(document.querySelector('#p-occ').innerText)")
            t = page.inner_text("#panel")
            check("offline: parsing, counts and lexicon still show", "Verb · imperfect" in t and "occurs" in t and "Abbott-Smith, full entry" in t, t[-400:])
            page.click('.w[data-i="4"]')
            page.wait_for_selector("#p-note:not([disabled])")
            page.fill("#p-note", "written offline")
            page.wait_for_function("/Saved/.test(document.querySelector('#p-note-s').textContent)")
            check("offline: a note can be written and is kept on the device", "written offline" in json.dumps(page.evaluate("JSON.parse(localStorage.getItem('akouo.demo')).greek"), ensure_ascii=False))
            open_greek(page, "John 21")
            check("offline: another chapter of the same book opens", page.locator(".verse").count() == 25)
            ctx.close()
            browser.close()
    finally:
        server.terminate()

    check("no errors in the browser console", not errors, "; ".join(errors[:5]))
    failed = [n for n, ok in results if not ok]
    print(f"\n{len(results) - len(failed)} of {len(results)} checks passed. First open of John 1:1-5: {first_open:.2f}s; John 6 once loaded: {long_open:.2f}s. Screenshots: {SHOTS}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
