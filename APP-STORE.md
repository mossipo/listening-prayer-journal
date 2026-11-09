# Akouō on the App Store: Version 1

Everything the iPhone app needs is kept in this repository. Nothing has to be redone when you join the Apple Developer Program.

## What Version 1 is

The iPhone app opens in **Version 1: prayer and listening**.

- **Included:** Today, Listen, Prayer (list, Pray now, answered prayers), Walk (Come Away, Whisper, Stones, Selah), Learn, and a daily reminder notification.
- **Weigh** is included, reached from Listen ("Weigh this further") and Whisper ("Weigh it later") instead of from a button on Today.
- **Coming in Version 2:** RHEMA, reading plans and the sermon prep export. They stay switched on in the website.
- Preview Version 1 in any browser by adding `?edition=v1` to the website address. Add `?edition=full` to go back.
- The website and the iPhone app share one account, so entries made in either one show up in both.

## What's in the repository

| Path | What it is |
|---|---|
| `native/` | The iPhone project (Capacitor 8). `build.mjs` copies the web app in, bundles Firebase and the fonts inside the app so it starts without a connection, and adds the native plugins. |
| `native/ios/` | The Xcode project. iPhone only, portrait, bundle ID `ca.mossip.akouo`. |
| `native/assets/` | App icon (1024 px) and launch screens. Replace these files to change the icon, then run `npm run assets`. |
| `native.js` | The daily reminder and share sheet. Does nothing on the website. |
| `codemagic.yaml` | Builds the app in the cloud and sends it to TestFlight. No Mac needed. |
| `privacy.html`, `support.html` | The privacy policy and support pages Apple requires. Published on GitHub Pages with the app. |

## Steps when you're ready

1. **Decide who publishes it.**
   - Under your own name: Apple Developer Program, individual, US$99 per year.
   - Under Roseisle Pentecostal Assembly: organization enrolment with a D-U-N-S number, and you can apply for Apple's nonprofit fee waiver. The app must then stay free with no in-app purchases.
   - If you choose the church, the bundle ID can change (for example `ca.rpamb.akouo`). Change it in `native/capacitor.config.json`, `native/ios/App/App.xcodeproj/project.pbxproj` (two places) and `codemagic.yaml` before the first upload. Once an app is uploaded, its bundle ID is permanent.
2. **Enrol** at developer.apple.com/programs. Approval can take a day or two, longer for organizations.
3. **Create the app in App Store Connect** (appstoreconnect.apple.com › Apps › New App):
   - Platform: iOS. Name: `Akouō` (if taken, `Akouō: Listening Prayer`).
   - Primary language: English (Canada). Bundle ID: `ca.mossip.akouo`. SKU: `akouo-ios-1`.
   - Copy the app's **Apple ID** number from App Information into `codemagic.yaml` (`APP_STORE_APPLE_ID`).
4. **Create an API key for Codemagic**: App Store Connect › Users and Access › Integrations › App Store Connect API › generate a key with the App Manager role. Download the .p8 file (it can only be downloaded once).
5. **Connect Codemagic** (codemagic.io, the account you already made):
   - Team settings › Integrations › Developer Portal › add the key. Name it exactly `Akouo ASC`.
   - Add application › GitHub › `mossipo/listening-prayer-journal`. Codemagic reads `codemagic.yaml`.
   - Start the workflow **Akouō iPhone to TestFlight**. It builds, signs, and uploads the app.
6. **Test on your phone with TestFlight**: install the TestFlight app, add yourself as an internal tester in App Store Connect › TestFlight, and Akouō appears there. Internal testers (up to 100 people on your App Store Connect team) need no review. Outside testers by email need a short Beta App Review first.
7. **Submit for review** when it's ready: fill in the listing below, upload screenshots, answer the privacy questions, and press Submit.

### Check one Firebase setting first
Firebase console › Project settings › General shows your Web API key. If that key was ever restricted to websites (Google Cloud console › APIs & Services › Credentials), sign-in will fail inside the iPhone app. Either leave the key unrestricted (it is safe to be public; your security rules protect the data) or add an iOS app restriction for `ca.mossip.akouo`.

## App Store listing (draft)

- **Name:** Akouō
- **Subtitle (30 max):** A listening prayer journal
- **Category:** Lifestyle (primary), Reference (secondary)
- **Age rating:** 4+ (answer "None" to every content question; entries are private, not shared publicly)
- **Price:** Free
- **Support URL:** https://mossipo.github.io/listening-prayer-journal/support.html
- **Privacy Policy URL:** https://mossipo.github.io/listening-prayer-journal/privacy.html
- **Copyright:** 2026 Barry Mossip
- **Keywords (100 max):** `prayer,journal,listening prayer,hear God,discernment,Bible,devotional,Christian,quiet time,Spirit`
- **Promotional text (170 max):** Be still, listen, and test what you sense by the Word. A quiet place for prayer, your prayer list, whispers on the go and stones of remembrance.

**Description:**

> "My sheep hear my voice, and I know them, and they follow me." John 10:27
>
> Akouō (ἀκούω) is the Greek word for "hear." Akouō is a listening prayer journal that helps you slow down, listen for the Lord, test what you sense by Scripture, and follow Him in everyday steps.
>
> LISTEN
> Be still and give thanks. Ask the Lord a question, then write what you sense. Simple checks help you test it before you act on it.
>
> PRAY
> Keep the people and needs you carry in one place. Pray now walks you through today's list one request at a time, and answered prayers are kept as a record of His faithfulness.
>
> WALK
> • Whisper: catch a prompting in seconds, then keep it, pray it, make it a step, or weigh it later.
> • Come Away: guided days of stillness, Scripture and listening, with a quiet timer.
> • Stones: remember what God has done, like the stones at the Jordan (Joshua 4).
> • Selah: a monthly look back at what God has been saying.
>
> WEIGH
> For anything that calls for a real decision, seven tests drawn from Scripture help you weigh what you sense, with mature believers alongside you.
>
> LEARN
> Short teachings on hearing God's voice, each grounded in the Scriptures.
>
> PRIVATE BY DESIGN
> Your journal belongs to you. It syncs between your iPhone and the web, works offline, and is never sold or used for advertising. Nothing is shared unless you choose to share it.
>
> A daily reminder can invite you back each morning.
>
> Created by Pastor Barry Mossip, Senior Pastor of Roseisle Pentecostal Assembly (PAOC), Manitoba, Canada.

## App Privacy answers (App Store Connect › App Privacy)

- **Do you collect data?** Yes.
- **Contact Info › Email Address:** App Functionality. Linked to the user. Not used for tracking.
- **User Content › Other User Content** (journal entries, prayer requests): App Functionality. Linked to the user. Not used for tracking.
- **Identifiers › User ID** (Firebase account ID): App Functionality. Linked to the user. Not used for tracking.
- Everything else: not collected. **Tracking:** No.

## Notes for Apple's reviewer

Create a demo account in the app first (for example a new Gmail address used only for review) and add a few sample entries. Then paste this into App Review Information:

> Akouō is a private listening prayer journal. Sign in with the demo account below. Native features: Settings › Daily reminder schedules a local notification; Share on any entry opens the iOS share sheet. Entries sync through Firebase and work offline. Account deletion is in Settings › Delete account.
> Demo account: [EMAIL] / [PASSWORD]

## Screenshots

Apple requires iPhone screenshots at 6.9 inch (1320 × 2868) or 6.7 inch (1290 × 2796). Ask Claude to capture them from the Version 1 preview with sample data: Today, Listen, Prayer, Walk, Come Away and Weigh make a good set of six.

## Updating the app later

Changes to the web code reach the website immediately. For the iPhone app, run the Codemagic workflow again: it rebuilds from the latest code and sets the next build number automatically. Raise the version (`MARKETING_VERSION` in the Xcode project, for example 1.1) for each App Store release.
