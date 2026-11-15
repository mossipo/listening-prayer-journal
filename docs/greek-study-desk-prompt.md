# Build brief: the Greek Study Desk for Akouō (Akouō Plus)

Paste everything below this line into a new coding session. It is written for an agent that can clone and push to GitHub.

---

## 0. Your role and how to work

You are building a new feature inside an existing web app. Read this whole brief before you change anything. Work in the phases in section 10. At the end of each phase, stop, report back in plain language with screenshots, and wait for my go-ahead before starting the next phase. If something in this brief turns out to be wrong when you look at the real code or data, trust what you find, tell me what was different, and adjust.

Ask me before you: ship any dataset whose licence you are unsure of; exceed the size budgets in section 4; change how the existing app saves data; or make a design choice that changes how the learning works (section 5).

Repositories (both under my GitHub account):
- `mossipo/listening-prayer-journal`: the app, Akouō. Live at https://mossipo.github.io/listening-prayer-journal/ (pushing to `main` publishes it through GitHub Pages).
- `mossipo/threads`: my earlier Scripture study tool. Reuse its data pipeline and its pinned source list. Do not copy its interface; I tried it and did not like its look or how it worked.

## 1. Who this is for and what success looks like

I am Barry Mossip, a Pentecostal (PAOC) senior pastor in rural Manitoba. I preach and teach weekly and I use Logos. I want this tool to help me **learn to read the Greek of the New Testament myself**, so that over time I need software less, not more. It must also let me dive deep into **Greek sentence structure** when I prepare a sermon: how each clause is built, what modifies what, who does what to whom, and why the grammar matters for the meaning.

This is not a Logos replacement. It is a study desk that sits beside my prayer journal and my marked-up Bible, teaches me as I use it, and keeps my notes in one place.

Success means:
1. I can open any New Testament passage, see the Greek, tap any word and get its exact parsing explained in plain English, and see the structure of every sentence.
2. I can switch to a learning mode where the tool hides help I no longer need, quizzes me on the words and forms in the passage I am studying, and tracks what I know.
3. Every piece of grammar it shows comes from real, credited data, never guessed.
4. It works on my iPad first (Apple Pencil user, portrait and landscape), then iPhone and desktop, and it works offline once a book has been opened.
5. Only my account sees it for now. Later I may offer it to others as a paid feature.

## 2. What to build

A new page, `greek.html`, in the same repository, opened as `greek.html?ref=John 1:1-18`. It follows the pattern of the existing `markup.html` page (section 3). Hebrew comes later; design the data format and code so Hebrew (MACULA Hebrew, TAHOT) can be added without a rewrite, but build Greek only.

### 2.1 Reader
- The Greek text of the passage, verse by verse, in a good Greek font (bundle Gentium Plus, SIL Open Font Licence; `mossipo/threads` already bundles it in `fonts/`).
- The BSB English alongside or under each verse (toggle). Akouō already has the BSB in `bible/bsb/`.
- Every Greek word is tappable. A light word-by-word gloss line can be shown under the Greek (toggle).
- A passage picker that matches Akouō's (book, chapter, verse range), with previous and next.

### 2.2 Word panel (tap a word)
- The word as written, transliteration, lemma (dictionary form), short gloss, and how the BSB rendered it in this verse.
- **Full parsing in plain English**, from the data. Example: `ἠγάπησεν` V-AAI-3S becomes "Verb · aorist · active · indicative · 3rd person singular: *he/she/it loved*". Under it, one or two sentences on what each part signals, written for a learner (for example, what the aorist usually conveys and what it does not).
- Its function in this sentence, from the syntax data (section 2.3): "Subject of ἦν", "Object of ἀγαπάω", "Prepositional phrase modifying ἐπίστευσαν".
- Case usage hints for nouns, adjectives and articles (for example, the common uses of the dative), shown as possibilities with "context decides", never as one certain answer unless the data states it.
- Frequency in the New Testament and a list of its other occurrences (tap to jump).
- Lexicon entries: Akouō already ships brief entries (`bible/lex/`, from STEPBible TBESG with definitions shortened from Abbott-Smith, public domain). Show these, plus fuller Abbott-Smith and Thayer entries (both public domain) built into the Greek data.
- A "My notes on this word" field saved to my account.

### 2.3 Sentence structure (the core of this build)
Use the MACULA Greek syntax trees (section 4). For each sentence, offer:
1. **Clause outline (default view).** Main clauses at the left margin; subordinate clauses and phrases indented under the word they modify, like a phrasing or block diagram. Each line labelled with its role (Subject, Verb, Object, Indirect object, Predicate, Adverbial, and so on) and connectives emphasised (καί, δέ, γάρ, οὖν, ἵνα, ὅτι, ὅτε, εἰ...). Glosses under the Greek can be toggled on and off.
2. **Tree view.** The same analysis as a collapsible tree for detailed study.
3. **"Who does what to whom" line** per clause, built by template from the roles: "Subject: ὁ λόγος (the Word) · Verb: ἦν (was; imperfect) · Predicate: θεός (God)".
4. **Tap a word group** to highlight its head word and everything that depends on it, with one sentence explaining the relationship ("This prepositional phrase tells you *how* they were saved").
5. **Flow of thought** for the paragraph: the chain of connectives between clauses with their usual sense (γάρ often gives a reason, οὖν draws an inference), shown as typical sense, not a verdict.
6. A clear note that the tree is **one scholarly analysis** (MACULA, Clear Bible), and that other readings of some constructions exist.

### 2.4 Learn mode
Learning is the point. Build these on top of the same data:
- **Graded reading.** A switch hides glosses and parsing by default. Words I have marked as known never show a gloss; unknown words reveal on tap. Show "You know 72% of the words in this passage."
- **Vocabulary deck.** Add words from the passage I am studying, or start from a core list (New Testament words that occur 50 or more times, about 300 words, built from the data, not typed in). Spaced repetition (a simple Leitner or SM-2 scheme), Greek to English and English to Greek, with the lemma, gloss and one example verse from my own study passages. Saved to my account.
- **Parsing practice.** Drills drawn from the passage I am studying: "Parse ἐπίστευσαν" with choices for tense, voice, mood, person and number (or case, number and gender). Answers checked against the data. Explain mistakes.
- **Paradigms.** Tables for the article, the noun declensions, the main verb forms, εἰμί and participles. Build them from forms actually found in the New Testament data where possible, and mark any cell that is not attested. Highlight the cell that matches the word I tapped.
- **Short grammar lessons** triggered by what is in my passage ("This passage has four participles. Here is how to read a participle."). Keep each lesson short, accurate and practical, written in your own words; do not copy text from published grammars.
- **Progress.** Words known, words due for review, passages studied.

### 2.5 How it connects to the rest of Akouō
- From the Bible mark-up page (`markup.html`): a "Greek" button for the current chapter (New Testament only), and a link back.
- From the existing word card in the app (tap an English word, see the Greek): a "Study in Greek" link that opens `greek.html` at that verse with the matching Greek word highlighted. The English to Greek link already exists through Strong's numbers (section 3).
- From passage rows that already show "Mark up": add "Greek" for New Testament passages.
- Study notes per passage, saved to my account, with a button to send a note to a journal entry's "What stood out" or a Listen entry.
- All entry points appear only when `PLUS && !NATIVE` (section 3).

## 3. The existing app: facts and patterns to follow

- **Stack.** Plain HTML, CSS and JavaScript ES modules. No framework and no build step for the app itself; keep it that way. Build steps are allowed only for data (Python scripts that write JSON).
- **Main files.** `app.js` (about 1,700 lines; all main screens, rendered as template strings), `bible.js` (Scripture module: `parseRefs`, `refLabel`, `findBook`, `BIBLE_BOOKS`, `passageHTML`, `lexEntry`, `saveWholeBible`, credits), `backend.js` (Firebase auth and Firestore, a demo backend, and `isPlus`), `markup.html` (the Bible mark-up page, Plus only), `sw.js` (service worker), `styles.css`, `index.html`.
- **Scripture data.** `bible/bsb/CODE.json` per book (USFM codes such as `JHN`). Token format: `["h"]` heading, `["d"]` psalm title, `["p",cls]` paragraph or poetry line, `["b"]` stanza break, `[n,text]` verse n starts, `[0,text]` verse continues.
- **Original-word links.** `bible/words/CODE.json` maps `"c:v"` to `[n1, s1, n2, s2, ...]`: n = letters (no spaces) in an English word group of the BSB, s = Strong's number (negative = uncertain link, 0 = none). Built from the BSB interlinear data carried in Threads. `bible/lex/G0.json`... hold `{l, t, g, x, n, e}` per Strong's number (lemma, transliteration, gloss, short definition, count, English renderings). Read `bible/words/README.md` and `bible/lex/README.md`.
- **Offline.** `sw.js` serves everything under `/bible/` cache-first from a separate cache (`BIBLE_CACHE`) that survives app updates. Put new data under `bible/greek/` so it is cached the same way. Bump `CACHE` in `sw.js` and `VERSION` in `app.js` on every release.
- **Plus gating.** `isPlus(user)` in `backend.js` compares a SHA-256 fingerprint of the sign-in email with a list. In `app.js`, `PLUS` is set after sign-in and `markLink()` shows Mark up links only when `PLUS && !NATIVE`. Copy this. This hides the feature; it is not payment enforcement. Note in the README what a paid version would need (entitlements users cannot write, checked by Firestore rules).
- **The Plus page pattern to copy: `markup.html`.** It imports `bible.js` and `backend.js`, calls `createBackend()`, waits for `B.onAuth`, checks `isPlus`, then shows the page. It saves through backend methods `getInk(uid, key)` and `saveInk(uid, key, data, summary)`, implemented for both the Firebase backend and the demo backend, one Firestore document per chapter under `users/{uid}/ink/` plus an `_index` document. Account deletion in `backend.js` also deletes that collection. Add study-data methods the same way (for example `users/{uid}/greek/...` for notes, known words and the vocabulary deck), add them to account deletion, and keep every document well under Firestore's 1 MB limit.
- **Firestore rules** already allow everything under `users/{uid}/` for the signed-in owner, so no rule change is needed for new collections.
- **iPhone app.** A Capacitor build lives in `native/` (Version 1, App Store). Do not change its behaviour. Hide every new entry point when `NATIVE` is true.
- **Demo mode** for testing without Firebase: open the app with `?demo`. The demo journal lives in localStorage under `akouo.demo` (see `demo-data.js`). To pass `isPlus` in tests, first open any page on the same origin (for example `privacy.html`), set `akouo.demo.email` to `barrymossip@gmail.com`, then open `greek.html?demo&ref=...`. Keep the `demo` parameter when the page rewrites its own URL.
- **Commits.** Use `git -c user.name="Barry Mossip" -c user.email="barrymossip@gmail.com" commit ...`. Push to `main` only at the end of a phase, after tests pass. Write clear commit messages that say what changed and why.

## 4. Data: sources, licences and pipeline

I may sell this later, so **use only data that allows commercial use**, and credit every source on the page and in the README. `mossipo/threads` has a pinned registry of sources with licences (`data/meta/sources.json`) and a fetch script (`build/fetch.py`) that downloads exact paths at exact commits. Reuse that approach and those pins.

Use:
- **MACULA Greek** (Clear Bible, `Clear-Bible/macula-greek`): syntax trees and word data for the SBLGNT and Nestle 1904 texts, in several formats (lowfat, nodes, TEI, TSV). Clear's components are CC BY 4.0. **Do not ship the UBS semantic domain fields** (attributes such as `ln` and `domain`); Clear uses those with permission and Threads deliberately excluded them. Read `LICENSE.md` and the `doc/` folder at the pinned commit and confirm the field names before you write the build script. Choose the SBLGNT trees unless you find a reason to prefer Nestle 1904, and tell me which you chose and why.
- **SBL Greek New Testament** (`LogosBible/SBLGNT`), now CC BY 4.0: the Greek text.
- **STEPBible data** (Tyndale House, CC BY 4.0): TAGNT (words, glosses, grammar codes), **TEGMC** (plain-English expansions of the Greek grammar codes; use these for the parsing explanations), TBESG (brief lexicon). Threads already reformats these per book in `data/orig/` (for example `["ἠγάπησεν","ēgapēsen","loved","G0025","","V-AAI-3S","NKO",...]`); you may reuse that build.
- **Abbott-Smith** and **Thayer** lexicons: public domain.
- **BSB** with its interlinear alignment: public domain (already in Akouō).

Do not use: anything CC BY-NC (for example the Dead Sea Scrolls data in Threads), the UBS domains, or any text copied from copyrighted grammars or lexicons.

Pipeline:
- Put scripts in `tools/greek/` (Python 3, standard library where possible), with a pinned `sources.json` and a short README on how to rebuild.
- Write compact per-book files to `bible/greek/CODE.json` (and a small shared file for code explanations), loaded only when a book is opened. Use short keys or arrays and shared string tables to keep sizes down.
- **Size budget:** about 400 KB gzip per book on average and no more than about 10 MB gzip for the whole New Testament. Measure and report the real numbers. Ask me before going over.
- **Versification:** SBLGNT and BSB verse numbers differ in a few places (Threads counted 23 renumbered verses). Map them, list every case in a build report, and make sure tapping from the BSB lands on the right Greek words.
- **Alignment:** link each SBLGNT or MACULA word to TAGNT's grammar and to the BSB English through Strong's numbers and word order. Threads reports where TAGNT and SBLGNT word sets differ; handle those cases explicitly and report how many words you could not link.
- **Build checks** that fail loudly: word counts per book against the source, every word has a lemma and parsing, every word appears in exactly one sentence tree, no UBS domain fields in the output, licence and credit lines present.

## 5. Learning design principles

- Teach through my own passages. The best lesson is the one about the verse I am preaching on Sunday.
- Fade the help. Start with full support, and let me turn off glosses, parsing and English as I grow. Never force help back on.
- Frequency first. Point me to the words and forms I will meet most often.
- Explain, don't just label. A parsing label should come with what it means for reading the sentence.
- Keep sessions short and resumable. Five minutes of drills should be worth doing.
- Track honestly. "Known" means I have marked it known or answered it correctly enough times, not that I saw it once.

## 6. Accuracy and exegetical integrity (non-negotiable)

- **Data only.** Every parsing, lemma, gloss and syntax relation shown must come from the datasets. Never invent or guess grammar. If data is missing, say "No data for this word" rather than filling the gap.
- **Separate data from interpretation.** Label the trees as MACULA's analysis. Present usage categories (for example "dative of means") as possibilities for me to weigh in context.
- **Guard against common word-study errors** with short "Careful" notes where they apply: the root fallacy (a word's origin is not its meaning), reading every possible meaning into one use, the idea that the aorist always means "once for all", and over-reading tense in general.
- **Stay neutral on doctrine.** I am Pentecostal and I will bring my theology to the text myself. The tool shows the grammar; it does not argue for or against any doctrine.
- **Credit sources** clearly on the page, as the CC BY licences require.

## 7. Design rules

- Match Akouō: fonts Alegreya (headings and English Scripture) and Alegreya Sans (interface); Greek in Gentium Plus; olive `#5D6B3F` for structure, amber `#8A5E12` for emphasis, paper `#F5F2EA`; rounded cards; quiet and readable. Look at `styles.css` and `markup.html`.
- Respect the app's light and dark themes, or tell me if you keep the page light like `markup.html`, and why.
- iPad first: large tap targets (at least 40 px), works with a finger and the Apple Pencil, side panels in landscape, bottom sheets in portrait. Also usable on iPhone and desktop.
- Accessible: real buttons and labels, keyboard navigation on desktop, sufficient contrast, `lang="el"` on Greek text, nothing conveyed by colour alone (role colours also carry labels).
- Plain language everywhere. No em dashes anywhere in the interface or in written content (quoted Bible text keeps whatever punctuation the translation has). Canadian spelling (colour, honour, centre).

## 8. Technical constraints

- Offline-first: once a book's data has loaded, the page must work with no connection, including notes, which sync later through Firestore's offline cache.
- Fast: open a chapter in under one second on an iPad after the first load. Render long chapters progressively if needed.
- No new third-party JavaScript libraries without asking me. Keep everything on GitHub Pages; no servers, no paid services, no AI calls from the app.
- Keep the existing app working exactly as it does now for everyone else.

## 9. Testing and verification

Use Playwright (Chromium) against a local static server, in demo mode with my email set so `isPlus` passes (section 3). For every phase:
- **Golden passages.** Check these by hand against the data and include screenshots at iPad size (820 × 1180 portrait and 1180 × 820 landscape):
  - John 1:1-5: imperfect ἦν; θεὸς ἦν ὁ λόγος must show ὁ λόγος as subject and θεός as predicate.
  - Ephesians 2:8-10: τῇ χάριτι (dative), διὰ πίστεως, the perfect periphrastic ἐστε σεσῳσμένοι, and what τοῦτο refers to (show the data, flag uncertainty).
  - Hebrews 11:3: Πίστει, N-DSF, where English "By" comes from the dative case and there is no separate Greek word.
  - Romans 5:1: the aorist passive participle Δικαιωθέντες and how it relates to the main verb.
  - Acts 1:8: λήμψεσθε δύναμιν and the genitive absolute ἐπελθόντος τοῦ ἁγίου πνεύματος ἐφ᾽ ὑμᾶς.
  - Acts 2:38: the imperatives and the εἰς phrase.
- **Gating.** Another email sees no entry points and gets a polite message on `greek.html`.
- **Saving.** Notes, known words and the vocabulary deck save, reload and survive a page refresh, and are removed by account deletion.
- **Offline.** Load a book, go offline, reload, and confirm everything still works.
- **No regressions** in the existing app (Today, entries, Prayer, Walk, the Bible mark-up page).
- Run the build checks from section 4 and report their numbers.

## 10. Phases

**Phase 0: Look and plan.** Clone both repositories. Read `markup.html`, `backend.js`, `bible.js`, `sw.js`, and Threads' `build/` and `data/meta/sources.json`. Inspect MACULA Greek at a pinned commit: formats, field names, licence. Write `docs/greek-study/PLAN.md` with the data format you propose, size estimates, the SBLGNT or Nestle choice, and any risks. Report back. Do not push.

**Phase 1: One book, reader and word panel.** Build the pipeline for John only. Ship `greek.html` with the reader, passage picker, word panel with plain-English parsing and lexicon, gating and entry points. Pass the John 1:1-5 checks. Push, report.

**Phase 2: Sentence structure.** Clause outline, tree view, roles, "who does what to whom", tap-to-highlight dependents, flow of thought, and the MACULA analysis note. Pass the golden passages that fall in John, plus add Ephesians, Hebrews, Romans and Acts data for testing. Push, report.

**Phase 3: Whole New Testament and connections.** All 27 books, versification mapping and report, links from the Bible mark-up page, the word card and passage rows, and study notes saved to my account. Pass every golden passage and the offline test. Push, report sizes.

**Phase 4: Learn mode.** Graded reading, known words, vocabulary deck with spaced repetition, parsing drills, paradigms from attested forms, short lessons, progress. Push, report.

**Phase 5: Finish.** Accessibility pass, performance on long chapters, README section (including credits and what a paid version would need), and a short "How to use the Greek Study Desk" note I can read on my iPad. Push, report.

## 11. What to report at each checkpoint

- What you built, in plain language, and how to try it (the exact link).
- Screenshots at iPad size of the main screens.
- Test results, including the golden passages and build check numbers.
- Data sizes, licences and anything you could not do or chose differently, with your reasons.
- The questions you need me to answer before the next phase.

## 12. Do not

- Do not change how existing entries, prayers or settings are saved.
- Do not show this feature to any account other than mine, or inside the iPhone app.
- Do not ship non-commercial data, the UBS domains, or copied text from grammars.
- Do not invent grammar, glosses or syntax.
- Do not add frameworks, servers, paid services or AI calls.
- Do not use em dashes in anything a person reads.
