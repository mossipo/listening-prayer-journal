# Greek Study Desk: data build

These scripts turn openly licensed sources into the compact files the Greek Study Desk reads from `bible/greek/`.
Python 3, standard library only. Nothing here runs in the app.

## Rebuild

From the repository root:

```
python3 tools/greek/fetch.py           # download the sources at their pinned commits into tools/greek/.cache (not committed)
python3 -I tools/greek/build.py        # write bible/greek/ and tools/greek/report.json
python3 -I tools/greek/check.py        # must end with "All checks passed"
```

To add a book, add its code to `BOOKS` in `common.py`, bump `DATA_VERSION` there, rebuild, and add the book's name to
`GREEK_BOOKS` in `app.js` and `markup.html`. Bumping `DATA_VERSION` is what makes devices that already hold the old files
fetch the new ones.

## What is built

| File | Contents |
|---|---|
| `bible/greek/index.json` | Data version, the books that are ready, and the credit lines the page shows |
| `bible/greek/JHN.json` | One book: words, verses and sentence trees (format described at the top of `build_books.py`) |
| `bible/greek/codes.json` | Each grammar code spelled out in plain English, and the lists of roles and group classes |
| `bible/greek/occ.json` | Every dictionary word with its count and the verses where it occurs, across all 27 books |
| `bible/greek/lex/G12.json` | Abbott-Smith and Thayer entries, 250 Strong's numbers per file |

## Sources and licences

Pinned in `sources.json`, the same commits Threads uses. All allow commercial use.

| Source | Licence | Used for |
|---|---|---|
| MACULA Greek, SBLGNT edition (Clear Bible, Biblica) | CC BY 4.0 | Lemmas, grammar codes, sentence trees, roles, head words, referent links, word glosses |
| SBL Greek New Testament (LogosBible) | CC BY 4.0 | The Greek text and its punctuation |
| STEPBible TAGNT and TEGMC (Tyndale House) | CC BY 4.0 | Transliteration, Strong's numbers, a second parsing, plain-English wording for grammar codes |
| Abbott-Smith (1922) | Public domain | Fuller lexicon entries |
| Thayer (1889), Every-Promise edition | Public domain, edition CC0 | Fuller lexicon entries |
| Berean Standard Bible and its word links (already in `bible/bsb`, `bible/words`) | Public domain | English beside the Greek; how the BSB rendered each word |
| Gentium Plus (SIL) | SIL OFL 1.1 | Greek font (`fonts/`) |

**Left out on purpose:** MACULA's `domain` and `ln` fields. They come from the United Bible Societies and Clear uses
them with permission; they are not openly licensed. `check.py` fails if either appears in the output.

Word glosses are the Berean Interlinear glosses that MACULA carries (public domain). Where one is missing the Cherith
gloss by Andi Wu (Cherith Analytics, CC BY 4.0) is used, then STEPBible's.

## Rules the build keeps

- **Data only.** Parsing, lemmas, glosses and syntax come from the sources. Where a source has nothing, the output has
  nothing, and the page says "no data".
- **The text is the SBLGNT as printed.** Every verse is rebuilt from the built words and compared with the printed line,
  character for character. Where MACULA spells a word differently (an accent or a capital), the printed form is shown and
  the difference is listed in `report.json`.
- **Two parsings are kept apart.** MACULA's grammar code is the main one, because the sentence tree comes from the same
  analysis. STEPBible's code is stored only where it differs, and the page shows both.
- **Approximate links are marked.** A Greek word is matched to its BSB rendering by Strong's number. When that number
  occurs more than once in the verse the match rests on position, and it is flagged.

## Tests

`test_page.py` drives a real browser (Playwright, Chrome) against a local copy of the site in demo mode:

```
AKOUO_PLUS_EMAIL=<an address on the Akouō Plus list> python3 tools/greek/test_page.py
```

The address is used only inside the test browser and is never written to the repository.
