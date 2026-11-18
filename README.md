# Akouō

*ἀκούω, "I hear." "My sheep hear my voice." John 10:27*

**A listening prayer journal.** Hear God. Test it. Follow.

A listening prayer journal that helps you hear God through Scripture, test what you sense, and follow Him in everyday steps.
It installs to a phone or laptop home screen, works without signal, and syncs through a personal account.

## What's in the folder

| File | Purpose |
|---|---|
| `index.html`, `styles.css`, `app.js` | The app |
| `backend.js` | Sign-in and storage (Firebase), plus a demo mode used before Firebase is connected |
| `firebase-config.js` | Paste your Firebase web app settings here |
| `firestore.rules` | Security rules: each person can read and write only their own journal |
| `sw.js`, `manifest.webmanifest`, `icons/` | Make it installable and available offline |

## One-time setup

1. **Firebase project.** At console.firebase.google.com, add a project (Analytics off).
2. **Sign-in.** Build > Authentication > Get started > Email/Password > Enable.
3. **Database.** Build > Firestore Database > Create database, location `northamerica-northeast1 (Montréal)`, production mode.
4. **Rules.** Firestore Database > Rules: replace everything with the contents of `firestore.rules`, then Publish.
5. **Web app.** Project settings > Your apps > `</>` > register "Journal". Copy the `firebaseConfig` values into `firebase-config.js`.
6. **Hosting.** Put this folder in a public GitHub repository, then Settings > Pages > Deploy from branch `main`, folder `/ (root)`.
   The site appears at `https://<your-username>.github.io/listening-prayer-journal/`.
7. **Allow the site to sign in.** Firebase > Authentication > Settings > Authorized domains > add `<your-username>.github.io`.
8. **Password reset emails** (optional polish): Authentication > Templates lets you set the sender name and wording.

## Bible mark-up (Akouō Plus)

`markup.html` shows any chapter as a fixed journaling-Bible page with a wide margin. Apple Pencil writes with a pen (fine, medium, bold; pressure), a highlighter that snaps straight onto the line of text (turn off Straight to draw freely) and a stroke eraser, with undo and redo; fingers still scroll. Margin notes are anchored to a verse, and Scribble turns Pencil writing into text. Marks are saved to the account, one document per chapter (`users/{uid}/ink/ISA-30`) plus `users/{uid}/ink/_index`, and are removed with the account.

For now it is on only for the accounts listed in `PLUS` in `backend.js` (a SHA-256 fingerprint of the sign-in email). That hides the feature; it is not payment enforcement. A paid version needs entitlements users can't write (a server-written document checked by the Firestore rules).

## Akouō Greek (Akouō Plus, its own app)

Since 3.32.0 the Greek tools are their own app, **Akouō Greek**, on the same website and sharing Akouō's sign-in and saved data. Its home is `akouo-greek.html` (own manifest `greek.webmanifest`, own name and `icons/greek-*` icons), so it can be added to the home screen beside Akouō. Akouō itself no longer links to the Greek tools; the Bible mark-up page stays with Akouō.

## Greek Study Desk

`greek.html?ref=John 1:1-18` shows any New Testament passage in Greek (SBL Greek New Testament) with the BSB English and a word-by-word gloss line. All 27 books are built. A plain-language guide for users is `greek-guide.html` (linked as "How to use" on the page).

- **Read:** tap any Greek word for its dictionary form, its parsing in plain English, its job in the sentence, where else it occurs, the lexicon entries and your own notes.
- **Structure:** each sentence as a clause outline in Greek word order, with role labels, "who does what", tap a group to see its head word, a tree view and the flow of thought. The analysis is MACULA's and the page says so.
- **Learn:** graded reading with known words, a spaced-repetition vocabulary deck (passage words or the 309 core words), parsing drills checked against the data, paradigm tables built only from forms that occur in the New Testament, short lessons offered by what the passage contains, and progress.

- **Greek School:** `greek-school.html` teaches from the alphabet up in the order of Machen's *New Testament Greek for Beginners* (1923, public domain), with Erasmian pronunciation. Each lesson: learn, see it in a verse of John, practise, and a ten-question checkpoint (8 to pass; the next locked lesson can be skipped by passing its checkpoint). Exercises are built when the lesson opens from real words in John that use only the letters taught so far. Progress is saved in `users/{uid}/greek/school`; words a lesson teaches go into the Desk's review deck. All seven levels are written: Levels 0 to 4 (38 lessons, all 33 of Machen's, about 300 words), Level 5 (8 graded readings in 1 John, John, Mark and Ephesians, with each passage's new words, the BSB on request, and exercises from the passage) and Level 6 (8 lessons of Greek for preaching: cases, aspect, conditions, the article, following the argument, from text to outline, and an optional lesson on first-century pronunciation). Lesson content is in `greek/school/` (`course.js` lists the levels, `level0.js` to `level6.js` the lessons, `forms.js` table helpers, `sounds.js` the sound chart, `drills.js` the grammar exercises). Grammar exercises parse real words from John, translate real New Testament forms, and never mark an answer wrong that another New Testament reading of the same spelling supports; the tests check every model form in the tables against the data.

Its code is in `greek/`, its data in `bible/greek/` (about 6.5 MB compressed), and the scripts that build and check the data in `tools/greek/` (see the README there). The design, phases and decisions are in `docs/greek-study/PLAN.md`. Browser tests: `tools/greek/test_page.py`, `test_structure.py`, `test_learn.py`, `test_finish.py` and `test_school.py`.

### Credits

Everything shown comes from credited data. Each allows commercial use, and the credits are shown at the foot of every Greek page:

- Greek text: SBL Greek New Testament (Society of Biblical Literature and Logos Bible Software), CC BY 4.0. Romans 16:25-27, which the SBLGNT does not print, from the Nestle 1904 text (public domain), labelled on the page.
- Parsing and sentence analysis: MACULA Greek (Clear Bible, Biblica), CC BY 4.0.
- Grammar-code wording and transliteration: STEPBible data (Tyndale House, Cambridge), CC BY 4.0.
- Lexicons: Abbott-Smith, Manual Greek Lexicon of the New Testament (1922), and Thayer (1889), both public domain (the Thayer digital edition is CC0).
- Greek font: Gentium Plus (SIL), SIL Open Font License.
- English: Berean Standard Bible, public domain.
- The teaching notes and lessons are written for Akouō (`greek/grammar.js`, `greek/lessons.js`).

Two things are deliberately left out so the data stays commercial-safe: MACULA's UBS semantic-domain fields (`domain`, `ln`), which are not openly licensed, and anything under a non-commercial licence. `check.py` fails if either domain field appears.

### Saving and access

Word notes and Learn progress are saved under `users/{uid}/greek/` (one document per word note, and `learn` for known words, the deck, passages studied and drill counts), merged so only what changed is written, and removed with the account. Like Bible mark-up, the page is on only for the accounts listed in `PLUS` in `backend.js`, and its links are hidden in the iPhone app. For a Plus account the app also fetches the Greek pages in the background after each update, so they open offline.

### What a paid version would need

- **Real entitlements.** Today `PLUS` only hides the feature. A paid version needs a server-written entitlement (for example `entitlements/{uid}`, written only by a payment webhook) and Firestore rules that allow `users/{uid}/greek` and `users/{uid}/ink` only when it is present.
- **Payments.** On the web, a payment provider such as Stripe with a small server function for the webhook. In the iPhone app, Apple requires in-app purchase for digital features, which is why Plus is hidden there for now.
- **The data on the open web.** `bible/greek/` is served as public files. That is fine under the licences (all allow redistribution with attribution), but anyone could copy the processed data. If that matters, serve it only to entitled accounts (for example from Firebase Storage with rules).
- **Credits kept in place.** CC BY 4.0 requires the attribution lines shown on every page; keep them in any paid version and in the app's About screen.
- **Support and accuracy.** A short page explaining that the analysis is MACULA's (one scholarly reading), and a way for users to report a problem with a verse.

## Demo journal (no sign-in)

Share https://mossipo.github.io/listening-prayer-journal/?demo to let someone try Akouō with a sample journal. Nothing is sent to Firebase: the demo lives in that browser only (`akouo.demo` in local storage), dates move forward so the samples look current, and a real journal on the same device is left alone. "Start over" restores the samples; "Leave the demo" in Settings goes to the normal sign-in page. The samples are in `demo-data.js`.

## Installing on a device

- **iPhone or iPad:** open the site in Safari, tap Share, then Add to Home Screen.
- **Android:** open in Chrome, then tap Install app (or menu > Add to Home Screen).
- **Laptop:** in Chrome or Edge, click the install icon in the address bar.

## Publishing an update

Change the files, bump `CACHE` in `sw.js` (for example `lpj-v2.0.1`) and `VERSION` in `app.js`, then push.
Installed copies pick up the new version the next time they open with a connection.

## Later: an Apple App Store app

The same code can be wrapped with Capacitor (capacitorjs.com) into an iOS app. What that takes:

- Apple Developer Program membership ($99 USD a year).
- A Mac with Xcode, or a cloud build service such as Codemagic or Ionic Appflow.
- A privacy policy page (the in-app Privacy text is a starting point) and in-app account deletion (already built in Settings).

## Privacy

Entries live in Firestore under `users/<uid>/`, readable and writable only by that signed-in user (see `firestore.rules`).
The Firebase project owner administers the database and could access it from the console, which the in-app Privacy note states plainly.
The free Spark plan has no billing attached, so heavy use can only pause the service until the daily quota resets, never create a charge.

## iPhone app

The App Store version lives in `native/` (Capacitor) and launches as Version 1: prayer and listening. See [APP-STORE.md](APP-STORE.md) for the steps, the listing text and Apple's requirements. Privacy policy: `privacy.html`. Support: `support.html`.
