#!/usr/bin/env python3
"""Browser tests for the Greek School (greek-school.html), run like test_page.py:

    AKOUO_PLUS_EMAIL=<an address on the Akouō Plus list> FONT_DIR=<@fontsource folder> [AXE_JS=<path to axe.min.js>] \\
        python3 tools/greek/test_school.py [screenshot folder]
"""
import json
import os
import subprocess
import sys
import time

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_page import BASE, EMAIL, PORT, PORTRAIT, ROOT, check, errors, fonts, results, seed, watch  # noqa: E402

SHOTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cache", "shots")
AXE = open(os.environ["AXE_JS"], encoding="utf-8").read() if os.environ.get("AXE_JS") else None
LESSONS = ["0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7"]


def axe(page, where):
    if not AXE:
        return []
    page.add_script_tag(content=AXE)
    found = page.evaluate("""async () => (await axe.run(document, { resultTypes: ["violations"] }))
        .violations.map(v => `${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(" ")}`)""")
    return [f"{where}: {x}" for x in found]


def school(page, hash_=""):
    page.goto(f"{BASE}/greek-school.html?demo#{hash_}")
    page.reload()   # a fresh load each time, so what is shown comes from what was saved
    page.wait_for_selector(".level, .teach, .verses, .run, .chart, .locked, .msg")
    page.wait_for_timeout(250)


def answer_all(page, right=True):
    """Answer every question in the run in progress, rightly or wrongly; returns the result text."""
    for _ in range(14):
        if page.locator(".result").count():
            break
        if page.locator(".opt").count():
            page.locator(".opt[data-right]" if right else ".opt:not([data-right])").first.click()
        elif page.locator("#tin").count():
            page.fill("#tin", page.get_attribute("#tin", "data-answer") if right else "zzz")
            page.click("#styped button[type=submit]")
        elif page.locator(".spot").count():
            if right:
                for el in page.locator(".spot .sw[data-right]").all():
                    el.click()
            page.click("#spotcheck")
        page.click("#nextq")
    return page.inner_text(".result") if page.locator(".result").count() else ""


def stored(page, key):
    return page.evaluate(f"(JSON.parse(localStorage.getItem('akouo.demo')).greek || {{}})['{key}'] || null")


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
            watch(page, "school")
            seed(page, EMAIL)

            print("The map")
            school(page)
            check("Level 0 lists its seven lessons", page.locator(".level").first.locator(".lessons li").count() == 7)
            check("only the first lesson is open at the start", page.locator(".is-open").count() == 1 and page.locator(".is-locked").count() == 6)
            check("Levels 1 to 6 are shown as being written", page.locator(".level.soon").count() == 6)
            check("the start button opens the first lesson", "Letters you already know" in page.inner_text(".hero .btn.primary"))
            check("the sources name Machen and the SBLGNT", "Machen" in page.inner_text(".foot") and "SBL Greek New Testament" in page.inner_text(".foot"))
            page.screenshot(path=os.path.join(SHOTS, "s-map.png"), full_page=True)

            print("Exercises built from John")
            gaps = page.evaluate("""() => { const out = [];
                for (const id of __school.ids()) for (const which of ["practise", "check"]) for (let n = 0; n < 25; n++) {
                  const want = { practise: 8, check: 10 }[which], items = __school.build(id, which);
                  if (items.length !== want) out.push(`${id} ${which}: ${items.length} of ${want}`);
                  for (const it of items) {
                    if (it.kind === "choice" && (it.options.filter(o => o.ok).length !== 1 || it.options.length < 2 || new Set(it.options.map(o => o.html)).size !== it.options.length)) out.push(`${id} bad choice: ${it.prompt}`);
                    if (it.kind === "spot" && !it.words.some(w => w.ok)) out.push(`${id} spot with nothing to find`);
                    if (it.kind === "type" && !it.answer) out.push(`${id} type with no answer`);
                  }
                } return [...new Set(out)].slice(0, 8); }""")
            check("every lesson builds a full practice (8) and checkpoint (10), 25 times over, each question sound", not gaps, "; ".join(gaps))

            print("A lesson, step by step")
            school(page, "lesson=0.1")
            check("Learn shows this lesson's eight letters", page.locator(".chart tbody tr").count() == 8)
            check("Learn has handwriting tips", page.locator(".write li").count() == 8)
            check("the steps run Learn, See it in Scripture, Practise, Checkpoint", page.inner_text(".steps").replace("\n", " ").count("Checkpoint") == 1)
            page.click(".row.end a")
            page.wait_for_selector(".verses")
            check("See it shows John 1:1 from the SBLGNT", "λόγος" in page.inner_text(".verses"))
            check("this lesson's letters are highlighted in the verse", page.locator(".verses mark").count() > 10)
            page.locator(".verses .sw").nth(4).click()
            check("tapping a word shows its English letters with the stress in bold", "logos" in page.inner_text("#seeinfo") and page.locator("#seeinfo b").count() == 1, page.inner_text("#seeinfo"))
            page.screenshot(path=os.path.join(SHOTS, "s-see.png"), full_page=True)
            page.click(".row.end a")
            page.wait_for_selector(".run .sq")
            page.screenshot(path=os.path.join(SHOTS, "s-practise.png"), full_page=True)
            res = answer_all(page)
            check("a practice round of 8, all right, says so and points to the checkpoint", "8 of 8" in res and "checkpoint" in res.lower(), res)
            check("practice does not mark the lesson done", not (stored(page, "school") or {}).get("done", {}).get("0.1"))

            print("Checkpoints")
            school(page, "lesson=0.1&step=check")
            res = answer_all(page, right=False)
            check("a failed checkpoint says not yet and sends you back to practise", "not yet" in res and "Practise again" in res, res)
            check("a failed checkpoint saves nothing", not (stored(page, "school") or {}).get("done", {}).get("0.1"))
            page.screenshot(path=os.path.join(SHOTS, "s-fail.png"), full_page=True)
            # the long-vowel keys type into the box
            school(page, "lesson=0.2&step=check")
            check("a locked lesson cannot be opened before the one before it", page.locator(".locked").count() == 1)
            words = 0
            for lid in LESSONS:
                school(page, f"lesson={lid}&step=check")
                res = answer_all(page)
                ok = "Passed" in res
                if lid == "0.7":
                    words = "18 new words" in res
                    page.screenshot(path=os.path.join(SHOTS, "s-pass.png"), full_page=True)
                if not ok:
                    check(f"lesson {lid} checkpoint can be passed", False, res)
                    break
            else:
                check("all seven Level 0 checkpoints can be passed in order", True)
            done = (stored(page, "school") or {}).get("done", {})
            check("each passed lesson is saved to your account with its score", all(done.get(x) and done[x][1] == 100 and done[x][2] == "pass" for x in LESSONS), json.dumps(done)[:200])
            check("passing the last lesson adds the 18 most common words to your review deck", words and len((stored(page, "learn") or {}).get("deck", {})) >= 18)
            check("the deck cards carry their meanings", ((stored(page, "learn") or {}).get("deck", {}).get("καί") or {}).get("g") == "and, also, even")
            page.goto(f"{BASE}/greek-school.html?demo#")
            page.wait_for_selector(".level")
            page.wait_for_timeout(300)
            check("after a reload the map shows Level 0 done", page.locator(".is-done").count() == 7 and "Done" in page.inner_text(".level"))

            print("Skipping ahead")
            page.evaluate("() => { const d = JSON.parse(localStorage.getItem('akouo.demo')); if (d.greek) delete d.greek.school; localStorage.setItem('akouo.demo', JSON.stringify(d)); }")
            school(page, "lesson=0.2")
            check("the next locked lesson offers its checkpoint to skip ahead", page.locator("#skip").count() == 1)
            school(page, "lesson=0.3")
            check("a lesson two steps ahead does not", page.locator("#skip").count() == 0)
            school(page, "lesson=0.2")
            page.click("#skip")
            page.wait_for_selector(".run")
            res = answer_all(page)
            done = (stored(page, "school") or {}).get("done", {})
            check("passing it marks it skipped, counts the lesson before as done, and opens the next", "Passed" in res and done.get("0.2", [0, 0, ""])[2] == "skip" and done.get("0.1") and "New shapes" in res, json.dumps(done))

            print("Typing English letters")
            school(page, "lesson=0.3&step=practise")
            for _ in range(10):
                if page.locator("#tin").count():
                    break
                answer = page.locator(".opt[data-right]").first if page.locator(".opt").count() else None
                if answer:
                    answer.click()
                    page.click("#nextq")
            if page.locator("#tin").count():
                page.click(".keys [data-k='ē']")
                check("the ē key types a long e into the answer box", page.input_value("#tin") == "ē")
            else:
                check("practice includes a typed answer", False)

            print("Sounds, links and wording")
            school(page, "sounds")
            check("the sound chart lists all 24 letters", page.locator(".chart").first.locator("tbody tr").count() == 24)
            check("it explains why Erasmian and names Kantor for the Koine sound", "Why Erasmian" in page.inner_text("main") and "Kantor" in page.inner_text("main"))
            page.screenshot(path=os.path.join(SHOTS, "s-sounds.png"), full_page=True)
            dashes = []
            for lid in LESSONS:
                for step in ("learn", "see"):
                    page.goto(f"{BASE}/greek-school.html?demo#lesson={lid}&step={step}")
                    page.wait_for_selector(".teach, .verses, .locked")
                    if "—" in page.inner_text("main"):
                        dashes.append(f"{lid} {step}")
            check("no em dashes anywhere in the lessons", not dashes, ", ".join(dashes))
            page.goto(f"{BASE}/greek.html?demo&ref=John 1")
            page.wait_for_selector(".verse")
            check("the Study Desk toolbar links to the School, keeping the demo", "greek-school.html?demo" in page.get_attribute("#t-school", "href"))
            page.goto(f"{BASE}/index.html?demo")
            page.wait_for_selector(".greek-card", timeout=8000)
            check("the Greek card on Today has a Greek School button", page.locator(".greek-card a[href^='greek-school.html']").count() == 1)
            ctx.close()

            problems = []
            if AXE:
                for scheme in ("light", "dark"):
                    ctx = browser.new_context(viewport=PORTRAIT, color_scheme=scheme)
                    fonts(ctx)
                    page = ctx.new_page()
                    watch(page, scheme)
                    seed(page, EMAIL)
                    for h in ("", "lesson=0.1", "lesson=0.1&step=see", "lesson=0.1&step=practise", "sounds", "lesson=0.4"):
                        school(page, h)
                        problems += axe(page, f"{scheme} #{h}")
                    page.locator(".opt").first.click() if page.locator(".opt").count() else None
                    ctx.close()
            check("axe finds no accessibility problems, light or dark" if AXE else "axe audit skipped (set AXE_JS)", not problems, "; ".join(problems[:6]))
            browser.close()
    finally:
        server.terminate()
    check("no errors in the browser console", not errors, "; ".join(errors[:5]))
    failed = [n for n, ok in results if not ok]
    print(f"\n{len(results) - len(failed)} of {len(results)} checks passed. Screenshots: {SHOTS}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
