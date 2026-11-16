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

## Greek Study Desk (Akouō Plus)

`greek.html?ref=John 1:1-18` shows a New Testament passage in Greek (SBL Greek New Testament) with the BSB English and a word-by-word gloss line. Tap any Greek word for its dictionary form, its parsing in plain English, its job in the sentence, where else it occurs, the lexicon entries and a place for your own notes. Its code is in `greek/`, its data in `bible/greek/`, and the scripts that build the data in `tools/greek/` (see the README there for sources and licences). John is the only book so far; sentence structure, the rest of the New Testament and Learn mode follow in later phases (plan: `docs/greek-study/PLAN.md`).

Everything shown comes from credited data: parsing and sentence analysis from MACULA Greek (Clear Bible), wording for grammar codes and transliteration from STEPBible (Tyndale House), lexicons from Abbott-Smith and Thayer. The short teaching notes ("what the aorist usually conveys") are written for Akouō and all live in `greek/grammar.js`.

Word notes are saved under `users/{uid}/greek/` and removed with the account. Like Bible mark-up, the page is on only for the accounts listed in `PLUS` in `backend.js`, and its links are hidden in the iPhone app. A paid version needs the same thing mark-up needs: entitlements users can't write, checked by the Firestore rules.

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
