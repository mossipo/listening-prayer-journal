# Greek Study Desk: Phase 0 plan

Written 15 November 2026, after reading both repositories and the real data. Nothing has been pushed. Every number below was measured from the pinned sources, not estimated, unless it says "estimate".

## 1. Recommendations in brief

1. **Use the SBLGNT trees**, not Nestle 1904 (reasons in section 4).
2. **Take the grammar from MACULA itself.** Every one of the 137,741 words already carries a lemma, a Strong's number and a grammar code (`V-AAI-3S` style), so the parsing and the sentence tree come from one source and cannot disagree with each other. STEPBible's TEGMC supplies the plain-English wording for those codes.
3. **The whole New Testament fits in about 5.9 MB gzip**, against the 10 MB budget. The largest book file (Luke) is 328 KB gzip; the average is 91 KB.
4. **Four things in the brief need a small change** (section 2), and **five questions need your answer** before Phase 1 (section 13).

## 2. Where the real code and data differ from the brief

| Brief says | What I found | What I propose |
|---|---|---|
| Link each word to TAGNT's grammar by Strong's number and word order | MACULA already has a grammar code on every word. TAGNT agrees exactly on 90.5% of words, differs only by an extra STEPBible suffix on 5.4%, and differs in substance on 4.1% (5,566 words), mostly in how particles, adverbs used as prepositions, and indeclinable names are classed | MACULA's parsing is the main one. Where STEPBible parses the word differently, the word panel says so ("STEPBible tags this as ...") instead of hiding it |
| SBLGNT and BSB verse numbers differ in about 23 places | Threads counted whole verses against King James numbering. Word by word, STEPBible marks 42 places where SBLGNT words sit in a different verse under another numbering, and the BSB follows the SBLGNT in some and the other numbering in about twenty (section 7) | Map at the level of the word, not the verse, using STEPBible's two numbers on each word, checked against the BSB word links, with every case listed in the build report |
| Put the data under `bible/greek/` | `native/build.mjs` copies the whole `bible/` folder into the iPhone app. Greek data placed there would add about 18 MB (uncompressed) to the next App Store build | Keep `bible/greek/`, and add one filter line to `native/build.mjs` so that folder is skipped. Question 3 |
| Hebrews 11:3 `Πίστει` | The SBLGNT prints `πίστει` in lower case there (it does not capitalize the start of every sentence) | Show the text as the SBLGNT prints it |
| Golden test: genitive absolute in Acts 1:8 | MACULA has no "genitive absolute" label. It shows a clause whose verb and subject are both genitive | Question 2 |
| Core list of about 300 words | 309 lemmas occur 50 times or more. Together they cover 79.7% of all words in the New Testament | Build the list from the data as planned |
| Service worker caches `/bible/` "the same way" | It is cache-first for good: a corrected data file would never reach a device that already has the old one | A small `bible/greek/index.json` with a data version, fetched fresh when online. When the version changes the page re-fetches the book files |

Two smaller data facts worth knowing:

- **Romans 16:25-27 is not in the SBLGNT at all.** Its editor judged the doxology secondary and printed 16:24 instead. The BSB has 16:25-27. Question 1.
- **Sentences do not follow verses.** Of 8,010 sentences, 1,196 span more than one verse and 1,665 begin partway through a verse. When you open John 1:1-5 the structure view will show whole sentences and dim the words outside your range.

## 3. Sources, pins and licences

All pins are the ones in Threads' `build/sources.json`. The MACULA pin is still that repository's newest commit today.

| Source | Commit | Licence | Used for |
|---|---|---|---|
| MACULA Greek, SBLGNT edition (Clear Bible, Biblica) | `8423afe` (7 July 2026) | CC BY 4.0 | Syntax trees, roles, lemma, grammar codes, referents |
| inside MACULA: Berean Interlinear glosses (`gloss`) | same | Public domain | Word-by-word gloss line |
| inside MACULA: Cherith glosses (`english`), Andi Wu | same | CC BY 4.0 | Fallback gloss for the 830 words with no Berean gloss |
| inside MACULA: UBS MARBLE domains (`domain`, `ln`) | same | Used by Clear with permission, **not open** | **Not shipped.** The build fails if either field appears in the output |
| SBL Greek New Testament (LogosBible) | `d7f35ad` | CC BY 4.0 | The printed Greek text and its punctuation |
| STEPBible TAGNT, TEGMC, TBESG (Tyndale House) | `5de0a47` | CC BY 4.0 | Transliteration, second-opinion parsing, plain-English grammar wording, Strong's alignment with the BSB |
| Abbott-Smith lexicon | `8c00cb2` | Public domain | Fuller lexicon entry |
| Thayer lexicon (Every-Promise edition) | `a31ff38` | Public domain, edition CC0 | Fuller lexicon entry |
| BSB and its interlinear alignment | already in Akouō | Public domain | English text, English to Greek links |
| Gentium Plus (SIL), Greek subsets | from Threads `fonts/` | SIL OFL 1.1 | Greek font, 26 KB |

I re-read each licence file at the pinned commit. Nothing non-commercial is used. STEPBible asks that its raw files not be re-posted; the build downloads them to a cache folder that is not committed, and ships only the reformatted data, which their licence allows.

The MACULA licence lists the semantic frames and the referent data as Clear's own work under CC BY 4.0, so the referent links (which word a pronoun points to) can be shipped.

## 4. SBLGNT or Nestle 1904

**Choice: SBLGNT.**

For it:
- It is the modern critical text you already see in Threads and that TAGNT marks word by word.
- I rebuilt every verse from MACULA's words and compared it with the published SBLGNT: all 7,939 verses have the same number of words in the same order, and one word in the whole New Testament is spelled differently (John 8:5, in the passage about the woman caught in adultery). So the build can take the exact printed punctuation from the SBLGNT and the grammar from MACULA.
- Every word has a lemma, a grammar code and a Strong's number. None is missing.

Against it, honestly:
- MACULA's analysis was made for Nestle 1904 first and carried across. 678 words (0.5%) that exist only in the SBLGNT were analysed separately by Clear. They still have full parsing and a place in the tree.
- 830 words have no Berean gloss. Of those, 761 have a Cherith gloss, 65 can take STEPBible's, and 4 have none (the tool will say "No gloss in the data").
- Three words carry the literal gloss "None" (a data slip, Romans 5:1 `ἔχομεν` is one). The build treats that as missing and lists them.
- Six word groups carry an error message where a role should be. The build drops those six roles and lists them.
- Romans 16:25-27 is absent (question 1).

Nestle 1904 would give the original MACULA analysis and the Romans doxology, but it is a 1904 text, it prints `Λόγος` and `Θεόν` with capitals, and it differs from the text behind modern translations in more places.

## 5. Data format

Everything is plain JSON, written by Python scripts in `tools/greek/`, loaded only when needed.

```
bible/greek/index.json        data version, book list, credits, licence lines (fetched fresh when online)
bible/greek/JHN.json          one file per book: words, verses, sentence trees
bible/greek/codes.json        grammar code -> plain English (from TEGMC) and role names
bible/greek/lex/G12.json      Abbott-Smith and Thayer, 250 Strong's numbers per file, loaded on tap
bible/greek/occ.json          every lemma -> the verses where it occurs, and its count
bible/greek/core.json         the 309 words that occur 50+ times (Phase 4)
bible/greek/paradigms.json    forms actually found in the New Testament, by lemma and grammar code (Phase 4)
```

### A book file

Shared tables first, then one column per word field (columns compress better than one object per word), then verses, then trees.

```
{ "v": 1, "b": "JHN", "lang": "grc", "text": "SBLGNT",
  "F": ["Ἐν","ἀρχῇ","ἦν", ...],             distinct word forms
  "T": ["En","archē","ēn", ...],            transliteration of each form (STEPBible)
  "L": [["ἐν","G1722"],["ἀρχή","G0746"], ...],   lemma and Strong's number
  "M": ["PREP","N-DSF","V-IAI-3S", ...],    grammar codes
  "G": ["In [the]","beginning","was", ...], glosses
  "R": ["Conj3CL","P-VC-S","PrepNp", ...],  MACULA rule names
  "P": [" ", ",", ".", "·", ...],           punctuation that follows a word
  "w": { "f":[0,1,2,...], "p":[...], "l":[...], "m":[...], "g":[...], "r":[...] },
                                            one entry per word, in text order; r = role
  "vs": [1,1,0, 1,2,17, ...],               chapter, verse, index of first word
  "s":  [ tree, tree, ... ],                one tree per sentence
  "td": { "412": 17 },                      words STEPBible parses differently -> its code
  "ref": { "530": [498] },                  pronoun -> the word(s) MACULA says it refers to
  "sr":  { "12": [4] } }                    verb -> its understood subject, when not stated
```

A tree node is `[[class, role, rule, headWord, flags], child, child, ...]`. A child is either another node or a word index. `class` is clause, noun phrase, prepositional phrase and so on. `role` is subject, verb, linking verb, object, second object, indirect object, predicate, adverbial, auxiliary. `flags` marks apposition, a verbless clause, an elided verb, a clause used as a noun, and a phrase with the article.

**Head words.** MACULA's simpler "lowfat" trees do not say which word is the head of a group. Its fuller "nodes" format does. The build reads both and copies the head across. This worked for 92% of the 101,170 word groups directly; the rest are plain "and + clause" wrappers that inherit the head of the clause inside them.

**Hebrew later.** Nothing in the format is Greek-specific: `lang`, the tables and the tree shape are the same in MACULA Hebrew. A Hebrew word made of several parts (prefix, stem, suffix) fits as several entries joined with no space, which the `p` column already allows.

## 6. Measured sizes

From a working prototype of the format over all 27 books:

| Part | Raw | Gzip |
|---|---|---|
| 27 book files | 7.8 MB | **2.45 MB** (average 91 KB, Luke 328 KB, Acts 321 KB, Matthew 296 KB, John 236 KB) |
| Abbott-Smith and Thayer, 23 files | about 9.5 MB | **3.1 MB** (largest file 181 KB; Abbott-Smith 1.0 MB, Thayer 2.0 MB) |
| Occurrence index (5,517 lemmas, 110,008 lemma and verse pairs) | 0.5 MB | **0.17 MB** |
| Grammar wording, core list, paradigms | | estimate under 0.15 MB |
| Greek font | | 0.03 MB |
| **Total** | | **about 5.9 MB** |

Budget: 400 KB per book on average and 10 MB in all. Both are met with room to spare. For comparison, the Bible data Akouō ships today is 3.7 MB gzip.

Options I measured and left out: a second gloss on every word (Cherith), +0.23 MB; MACULA's verb frames, +0.17 MB. Neither is needed for anything in the brief. Say the word if you want either.

## 7. Linking and verse numbers

**MACULA to STEPBible (for transliteration and the second-opinion parsing).** Matching by verse, spelling and order links 137,243 of 137,741 words (99.64%). The 498 left over are nearly all small spelling differences between editions (`παρέλαβε` and `παρέλαβεν`, `ἀλλὰ` and `ἀλλ᾽`). The real build will allow those and report the final count by book. An unlinked word still has full parsing and its place in the tree from MACULA; it only lacks the STEPBible transliteration, which then falls back to the lexicon's.

**Strong's numbers.** MACULA uses the old numbers (`ἦν` is 2258; `εἰμί` alone has 16). Akouō's word links and short lexicon use the BSB's (1510). STEPBible lists both, so the build converts through it: 126,958 words already agree, 8,677 are converted through STEPBible's alternates, and the rest are joined by lemma.

**Greek to English.** After conversion, 98.1% of the Strong's numbers behind BSB words are found among the Greek words of the same verse, so "tap an English word, land on the Greek word" works. In the other direction, 89% of Greek words have a BSB word linked to them. The other 11% are mostly words English does not translate separately (the article, `δέ`, `μέν`). For those the panel will say "Not translated as a separate word in the BSB."

**Akouō's short lexicon** covers 98.07% of words by Strong's number. The gaps are numbering quirks (`ἐγώ` filed under 3165). The build joins by lemma as well and reports what is still missing.

**Verse numbers, SBLGNT against the BSB in Akouō.** Two kinds of difference.

Whole verses that exist in one and not the other (I checked each against both texts):

| SBLGNT | BSB |
|---|---|
| Acts 19:40 (includes the dismissal) | Acts 19:40 and 19:41 |
| Romans 16:24 | not in the BSB text |
| not in the SBLGNT | Romans 16:25-27 |
| 2 Corinthians 13:12 | 13:12 and 13:13 |
| 2 Corinthians 13:13 | 13:14 |
| 3 John 15 | end of 3 John 14 |
| Revelation 12:18 | end of Revelation 12:17 |

A few words at a verse boundary that fall in the neighbouring verse. STEPBible marks 42 such places in the SBLGNT's words (five rows of the table above are among them). Testing each against the BSB word links, the BSB keeps the SBLGNT's division in about half (for example Philippians 1:16-17 and Mark 12:14) and uses the other division in about twenty (for example Luke 7:18-19, Acts 13:38-39, Philippians 2:7-8, 1 Thessalonians 2:6-7, Hebrews 3:9-10, 1 Peter 3:15-16, Revelation 2:27-28). A handful are mixed and need a look by hand.

So the build maps each Greek word, not each verse, to its BSB verse: STEPBible gives both numbers for the word, and the BSB word links say which one the BSB uses. Every case goes in the build report, and a verse whose English links mostly fail to find their Greek words stops the build. The reader keeps the SBLGNT's own numbers on the Greek and shows the BSB number beside the English where they differ.

## 8. Build pipeline and checks

`tools/greek/`: `sources.json` (the pins above), `fetch.py` (Threads' script, unchanged in approach), `build_books.py`, `build_lex.py`, `build_index.py`, `check.py`, and a README. Python 3 standard library only.

Checks that stop the build:

1. Word count per book equals MACULA's (total 137,741) and each verse has the same number of words as the published SBLGNT line.
2. Every word has a lemma and a grammar code.
3. Every word appears in exactly one sentence tree, and each sentence is one unbroken run of words (true for all 8,010 today).
4. The strings `domain`, `ln`, `LexDomain` and `LN` appear nowhere in the output.
5. Every grammar code has plain-English wording. 30 codes (277 words, such as `HEB` on `ἀμήν`) are not in TEGMC; for those the wording is assembled from MACULA's own explicit fields (case, number, tense and so on), never guessed.
6. Licence and credit lines are present in `index.json`.
7. Every file is within its size budget.

It also writes `tools/greek/report.json`: unlinked words by book, parsing differences between MACULA and STEPBible, the verse number table, missing glosses, dropped error roles.

## 9. How it fits into the app

- **Files.** `greek.html` as the page, with its code in a `greek/` folder of plain ES modules (`data.js`, `reader.js`, `panel.js`, `structure.js`, `learn.js`, `greek.css`). `markup.html` keeps everything in one file at 495 lines; this feature will be several times that, so one file would be hard to maintain. Still no framework and no build step.
- **Gating.** Same as `markup.html`: `createBackend()`, wait for `onAuth`, `isPlus(user)`, otherwise a polite message. Entry points use a `greekLink(ref)` beside `markLink(ref)` in `app.js` (the passage sheet, the passage card on an entry, and the Read card in a journey), shown only when `PLUS && !NATIVE` and the reference is in the New Testament. The word card gets a "Study in Greek" link under the same condition.
- **Saving.** New backend methods `getGreek(uid, key)` and `saveGreek(uid, key, data)` for both the Firebase and the demo backend, under `users/{uid}/greek/`. Documents: `known` (words marked known), `deck` (review state), `notes-JHN-3` (study notes for a chapter), `wnotes-G3` (word notes, by thousand Strong's numbers), `_index` (passages studied, settings). The largest, `deck`, would be about 200 KB (estimate) if every one of the 5,518 lemmas in the New Testament were added, well under 1 MB. Account deletion gains the `greek` collection.
- **One safety change from the mark-up pattern.** `markup.html` reads a chapter's document and, if the read fails, starts from empty and later saves over whatever was there. That is tolerable for one chapter's ink. For a vocabulary deck it could wipe progress after an offline start. Greek saves will therefore write only the fields that changed (Firestore merge), so a failed read can never erase data. Existing saves are not touched.
- **Offline.** Data under `bible/greek/` is kept by the service worker's Bible cache as the brief asks. The page and its code are cached the first time they load, exactly as `markup.html` is today. One thing to test in Phase 3: after an app update the app cache is cleared, so the Greek page needs one online visit before it works offline again. If that proves annoying I will come back with options, since the fix would touch what every user downloads.
- **Theme.** Follow the device's light or dark setting like the main app. `markup.html` is light only because ink is drawn on paper; that reason does not apply here. Question 4.
- **Version.** `VERSION` in `app.js` and `CACHE` in `sw.js` go from 3.21.0 to 3.22.0 at the first push.

## 10. Sentence structure: what comes from the data

| Feature in the brief | Source |
|---|---|
| Clause outline, indent under what a group modifies | Tree nesting plus the head word of the parent group |
| Role labels | `role` on words and groups: subject, verb, linking verb, object, second object, indirect object, predicate, adverbial, auxiliary |
| Who does what to whom | Roles of each clause's direct children. For a verb with no stated subject, MACULA's subject link (`sr`) names who is meant, shown as "understood subject (MACULA)" |
| Tap a group, see head and dependents | Head word from the nodes format |
| Flow of thought | Conjunction words that open a clause (`Conj-CL`, `sub-CL` and similar rules), with the "usual sense" wording written by me per conjunction and labelled as typical |
| What a pronoun refers to | MACULA's referent links, shown as MACULA's judgment |
| Periphrastic verbs | Rule `BeVerb` (171 in the New Testament). Ephesians 2:8 `ἐστε σεσῳσμένοι` is one |

Layout risks I will design for in Phase 2: Luke's genealogy nests 157 levels deep (a chain of "son of"), six sentences run over 100 words (the longest is 165), and 6,038 words are flagged as part of a group that other words split. The outline will cap indentation, fold long repeating chains, and mark split groups instead of silently reordering the Greek.

## 11. Learn mode data (Phase 4, no design changes proposed)

Everything comes from the same files: known words by lemma, the 309-word core list, review cards with an example verse from passages you have opened, parsing drills answered from each word's grammar code, paradigm tables filled only with forms found in the New Testament. I will follow section 5 of the brief as written and ask before any choice that changes how the learning works.

## 12. What the data says about the golden passages

I printed MACULA's trees for each so there are no surprises later.

- **John 1:1.** `θεὸς` predicate, `ἦν` linking verb, `ὁ λόγος` subject. As you expected.
- **Ephesians 2:8.** `τῇ χάριτι` is an adverbial dative noun phrase; `διὰ πίστεως` an adverbial prepositional phrase; `ἐστε σεσῳσμένοι` one verb group under the `BeVerb` rule. MACULA links `τοῦτο` to `σεσῳσμένοι`, that is, to the being saved. The tool will show that as MACULA's link and note that the reference of a neuter `τοῦτο` here is debated.
- **Hebrews 11:3.** `πίστει` N-DSF, adverbial, no preposition; Berean gloss "By faith".
- **Romans 5:1.** `Δικαιωθέντες` V-APP-NPM heads an adverbial clause inside the main clause whose verb is `ἔχομεν`. The SBLGNT reads the indicative `ἔχομεν`; the well-known variant `ἔχωμεν` is not in this text, and the tool will not mention variants it has no data for.
- **Acts 1:8.** `λήμψεσθε` verb, `δύναμιν` object. `ἐπελθόντος τοῦ ἁγίου πνεύματος ἐφ᾽ ὑμᾶς` is a separate clause with a genitive participle and a genitive subject, joined to the first with no label (question 2).
- **Acts 2:38.** `Μετανοήσατε` (V-AAM-2P) and `βαπτισθήτω` (V-APM-3S) are joined clauses. MACULA attaches `εἰς ἄφεσιν τῶν ἁμαρτιῶν ὑμῶν` to the `βαπτισθήτω` clause only. This is exactly the kind of place where the "one scholarly analysis" note matters: the tool will show MACULA's attachment, say plainly that it is MACULA's, and leave the theology to you.

## 13. Questions for you

1. **Romans 16:25-27.** The SBLGNT does not have it. Shall I add those three verses from MACULA's Nestle 1904 edition (public domain text, CC BY trees), clearly labelled "from Nestle 1904; not in the SBLGNT"? I recommend yes. The other choice is a note that says the SBLGNT omits them.
2. **Named constructions MACULA does not name.** "Genitive absolute" is the main one. I can detect it by a fixed test on the data (a clause whose participle and subject are both genitive and which is not governed by a preposition or noun), and show it as "Pattern: genitive absolute" together with the evidence. That is a rule applied to the data, not a guess, but it is one step beyond "data only". I recommend allowing a short list of such patterns, each with its test written down and each tested. Without it, Acts 1:8 would show only "a clause with a genitive participle and a genitive subject".
3. **iPhone build.** May I add one filter line to `native/build.mjs` so `bible/greek/` is left out of the App Store build? It changes nothing in the app's behaviour; without it the next native build would grow by about 18 MB.
4. **Theme.** Follow the device's light and dark setting (my recommendation), or light only like the mark-up page?
5. **Go-ahead for Phase 1** (John only: pipeline, reader, picker, word panel, gating, entry points).

## 14. Risks

- **Two sources that sometimes disagree.** 4.1% of words are parsed differently by MACULA and STEPBible. Showing both, labelled, is honest, but the plain-English explanations must make clear which source each line comes from.
- **Explanatory wording is mine.** The data gives labels; the one or two sentences on "what the aorist usually conveys" and the "Careful" notes are written by me in my own words. I will keep them short and conservative and collect them in one file so you can read and correct every one.
- **Derived text.** "Who does what to whom" and "flow of thought" are built by template from roles. Unusual clauses (verbless, elided, split) need fallbacks that say less, never more.
- **MACULA changes.** The pin protects us. Moving the pin later means re-running the checks and re-reading the report.
- **Testing in this environment.** Headless Chrome with Playwright runs here, so the golden screenshots at 820 by 1180 and 1180 by 820 can be produced. It is Chrome, not Safari; Apple Pencil behaviour and iPad Safari layout still need a look on your own iPad at each checkpoint.

## 15. Phase 1 notes (what changed from this plan once John was built)

- **Your answers:** Romans 16:25-27 will be added from Nestle 1904, labelled (Phase 3). Named patterns such as the genitive absolute are allowed, each with its test and its evidence shown (Phase 2). `native/build.mjs` now skips `bible/greek/`. The page follows the device's light or dark setting.
- **Book file format** gained four fields: `E` and `w.e` (how the BSB rendered each word), `ea` (that match rests on position), `bx` (the BSB's Strong's number where it differs) and `ss` (first word of each sentence). John is 286 KB gzip instead of the 236 KB estimated, because of the BSB renderings. The whole New Testament now projects to about 6.4 MB gzip, with Luke close to 400 KB.
- **"One word spelled differently"** was measured without accents. Counting accents and capitals, 12 words in John differ between MACULA and the printed SBLGNT (six of them in 7:53 to 8:11). The page shows the printed form; all 12 are in `tools/greek/report.json`.
- **STEPBible linking** for John: 15,597 of 15,625 words (99.8%). The 28 left over have full parsing from MACULA and only lack STEPBible's transliteration.
- **BSB rendering** is found for 12,688 of John's 15,625 words. For 3,955 of them the match rests on position because the same Strong's number occurs more than once in the verse; the panel says so.

## 16. Phase 2 notes (sentence structure)

- **Books built:** John, Acts, Romans, Ephesians and Hebrews. 4.12 MB of the 10 MB budget; `check.py` passes on all 48,443 words.
- **Verse numbering:** STEPBible marks where other editions number a verse differently. The build now keeps every alternative number and moves words to the BSB's verse only when the BSB's own Strong's links say so. The decisions are in `report.json` under "verse numbering" and were checked against the BSB text (for example Acts 13:38-39, Romans 3:25-26, Ephesians 2:14-15, Hebrews 12:22-23). Acts 2:11 stays where it is. The new `bv` field records each moved word, and the Read view says "The BSB counts these words in verse N".
- **Structure view** (`greek/structure.js`): a clause outline in Greek word order, a role label on every part, "Who does what" under each clause, tap a label to light up the group with its head word marked, a tree view, a flow-of-thought list with the usual sense of each connective, and the note that the analysis is MACULA's.
- **Clause labels:** a clause at the top level with no role is a "Main clause", even when MACULA joins two of them with καί or ἀλλά (Acts 1:8). Where MACULA's ClCl rule sets a second clause beside the first without naming its role, the page says "Attached clause ... MACULA names no role" and indents it. It does not call it a genitive absolute; that waits for the named patterns.
- **Unstated subjects:** the person in the verb comes first ("in the verb: we"), then MACULA's link, one referent per item with its verse (Romans 5:1: Παῦλος 1:1, τοῖς 1:7, πιστεύουσιν 4:24).
- **Not done yet:** folding long repeating chains (Luke's genealogy) and marking groups that other words split. Both matter only once Luke and the longer narrative books are built, so they move to Phase 3. Indentation is already capped at six levels.
- **Tests:** `tools/greek/test_structure.py` (34 checks on the golden passages, views, timing and dark landscape) alongside `test_page.py` (62 checks).
