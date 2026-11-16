#!/usr/bin/env python3
"""Browser tests for Phase 5 (accessibility, long chapters, the guide), run like test_page.py:

    AKOUO_PLUS_EMAIL=<an address on the Akouō Plus list> FONT_DIR=<@fontsource folder> [AXE_JS=<path to axe.min.js>] \\
        python3 tools/greek/test_finish.py [screenshot folder]

With AXE_JS set (axe-core 4.x, `npm install axe-core`), every screen is also audited with axe in light and dark.
"""
import os
import subprocess
import sys
import time

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_page import BASE, EMAIL, PORT, PORTRAIT, ROOT, check, errors, fonts, results, seed, watch  # noqa: E402

SHOTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cache", "shots")
AXE = open(os.environ["AXE_JS"], encoding="utf-8").read() if os.environ.get("AXE_JS") else None


def axe(page, where, scope=None):
    if not AXE:
        return []
    page.add_script_tag(content=AXE)
    found = page.evaluate("""async sel => (await axe.run(sel ? document.querySelector(sel) : document, { resultTypes: ["violations"] }))
        .violations.map(v => `${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(" ")}`)""", scope)
    return [f"{where}: {x}" for x in found]


def view(page, v, ref):
    page.evaluate(f"localStorage.setItem('akouo.greek.view', JSON.stringify('{v}'))")
    page.goto(f"{BASE}/greek.html?demo&ref={ref}")
    page.wait_for_selector(".verse, .sent")


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
            problems = []
            for scheme in ("light", "dark"):
                ctx = browser.new_context(viewport=PORTRAIT, device_scale_factor=2, color_scheme=scheme)
                fonts(ctx)
                page = ctx.new_page()
                watch(page, scheme)
                seed(page, EMAIL)
                view(page, "read", "John 3:16-18")
                problems += axe(page, f"{scheme} read")
                if scheme == "light":
                    print("Screen readers and keyboard")
                    snap = page.locator(".verse").first.aria_snapshot()
                    check("each word is a button named by its Greek, its English letters and its gloss", 'button "θεὸς (theos) God"' in snap, snap[:200])
                    check("a word with no English of its own is not read as 'hyphen'", 'button "ὁ (ho)"' in snap)
                    page.locator(".w").nth(2).focus()
                    page.keyboard.press("Enter")
                    page.wait_for_selector("#panel:not([hidden]) .pb")
                    check("Enter on a word opens its panel and moves focus there", page.evaluate("document.activeElement.id") == "panel")
                    page.keyboard.press("Escape")
                    page.wait_for_timeout(200)
                    check("Escape closes it and puts focus back on the word", page.evaluate("document.activeElement.classList.contains('w')"))
                page.locator(".w").nth(4).click()
                page.wait_for_selector("#panel:not([hidden]) .pb")
                page.wait_for_timeout(500)
                problems += axe(page, f"{scheme} panel")
                page.click("#panel [data-close]")
                view(page, "structure", "John 3:16-18")
                problems += axe(page, f"{scheme} structure")
                if scheme == "light":
                    check("sentence headings follow the page title in order (h1, then h2)", page.locator("h2.sent-h").count() > 0 and page.locator("h3.sent-h").count() == 0)
                page.click("#t-learn")
                page.wait_for_selector("#lbody .lcard")
                for t in ("progress", "review", "parse", "paradigms", "lessons"):
                    page.click(f'#ltabs [data-tab="{t}"]')
                    page.wait_for_timeout(900)
                    problems += axe(page, f"{scheme} learn {t}", "#learn")
                    if scheme == "light" and t == "review":
                        small = page.evaluate("[...document.querySelectorAll('#lbody button')].filter(b => b.offsetParent && b.getBoundingClientRect().height < 44).length")
                        check("every button in the Learn sheet is at least 44 points tall", small == 0, f"{small} smaller")
                    if scheme == "light" and t == "parse":
                        fields = page.evaluate("[...new Set([...document.querySelectorAll('.fo button')].map(b => b.dataset.f))]")
                        for fld in fields:
                            page.locator(f'.fo button[data-f="{fld}"]').first.click()
                        page.click("[data-check]")
                        page.wait_for_timeout(300)
                        said = page.inner_text("#lsay")
                        check("a drill result is announced to VoiceOver", len(said) > 5, said)
                        check("right and wrong answers are marked by more than colour", page.evaluate(
                            "[...document.querySelectorAll('.fo button.ok, .fo button.bad')].every(b => getComputedStyle(b, '::before').content.length > 2)"))
                page.click("#lclose")
                ctx.close()
            check("axe finds no accessibility problems on any screen, light or dark" if AXE else "axe audit skipped (set AXE_JS)", not problems, "; ".join(problems[:6]))

            print("Long chapters")
            ctx = browser.new_context(viewport=PORTRAIT)
            page = ctx.new_page()
            watch(page, "long")
            seed(page, EMAIL)
            view(page, "structure", "Matthew 26")
            t0 = time.time()
            view(page, "structure", "Matthew 26")
            dt = time.time() - t0
            n = page.evaluate("document.querySelectorAll('#reader *').length")
            check(f"Matthew 26, the longest chapter, opens in Structure in under 1.5 s ({dt:.2f}s, {n} elements)", dt < 1.5)
            check("sentence trees are built only when opened", page.locator(".treebox .tree").count() == 0)
            page.locator(".treebox summary").nth(3).click()
            page.wait_for_selector(".treebox[open] .tree")
            check("opening one builds just that tree", page.locator(".treebox .tree").count() == 1)
            ctx.close()

            print("The guide")
            ctx = browser.new_context(viewport=PORTRAIT, device_scale_factor=2)
            fonts(ctx)
            page = ctx.new_page()
            watch(page, "guide")
            seed(page, EMAIL)
            view(page, "read", "Romans 8:1-4")
            href = page.get_attribute("#t-help", "href")
            check("How to use links to the guide, keeping the passage and the demo", "greek-guide.html" in href and "Romans" in href and "demo" in href, href)
            page.click("#t-help")
            page.wait_for_selector(".guide h1")
            txt = page.inner_text(".guide")
            check("the guide covers reading, structure, learning, a weekly rhythm and sources",
                  all(x in txt for x in ("Reading and tapping words", "Seeing the structure", "Learning the Greek", "A weekly rhythm", "Sources")))
            check("the guide has no em dashes", "—" not in page.content())
            page.screenshot(path=os.path.join(SHOTS, "f-guide.png"))
            if AXE:
                gp = axe(page, "guide")
                check("the guide passes axe", not gp, "; ".join(gp))
            page.click("#back")
            page.wait_for_selector(".verse")
            check("Back to the Greek returns to the same passage", "Romans 8:1-4" in page.inner_text(".ptitle"))
            ctx.close()
            browser.close()
    finally:
        server.terminate()
    check("no errors in the browser console", not errors, "; ".join(errors[:5]))
    failed = [n for n, ok in results if not ok]
    print(f"\n{len(results) - len(failed)} of {len(results)} checks passed. Screenshots: {SHOTS}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
