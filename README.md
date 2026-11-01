# Listening Prayer Journal

A private journal for listening prayer, SMORP devotions, and weighing what you sense from the Lord.
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
