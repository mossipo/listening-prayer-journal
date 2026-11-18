// Akouō Greek: the home screen of the Greek app (akouo-greek.html). Its own app on the home screen, sharing Akouō's
// sign-in and saved data (users/{uid}/greek/...). From here: the Study Desk (greek.html), the Greek School
// (greek-school.html) and the guide (greek-guide.html).
import { parseRefs } from "../bible.js";
import { createBackend, isPlus, authMessage, DEMO } from "../backend.js";
import { pref, NT_CODES } from "./data.js";
import { esc } from "./grammar.js";
import { Learn } from "./learn.js";
import { ALL, lessonById, before } from "./school/course.js";

const $ = s => document.querySelector(s);
const main = $("#home");
const withDemo = href => DEMO ? href + (href.includes("?") ? "&" : "?") + "demo" : href;
// Every file of the Greek app, fetched once after sign-in so the service worker keeps them for offline use
const FILES = ["akouo-greek.html", "greek.html", "greek-guide.html", "greek-school.html", "greek.webmanifest",
  "greek/home.js", "greek/home.css", "greek/main.js", "greek/data.js", "greek/panel.js", "greek/grammar.js", "greek/structure.js", "greek/learn.js",
  "greek/learnui.js", "greek/paradigm.js", "greek/lessons.js", "greek/patterns.js", "greek/translit.js", "greek/greek.css",
  "greek/school.js", "greek/school.css", "greek/school/course.js", "greek/school/level0.js", "greek/school/level1.js", "greek/school/level2.js", "greek/school/drills.js", "greek/school/sounds.js",
  "bible/greek/index.json", "bible/greek/codes.json", "bible/greek/forms.json", "bible/greek/JHN.json",
  "bible.js", "backend.js", "firebase-config.js", "icons/greek-192.png", "icons/greek-apple-touch-icon.png"];

let B = null, user = null, mode = "in", busy = false, err = "", info = "", email = "";
function sync(text, cls){ const s = $("#sync"); s.hidden = false; s.textContent = text; s.className = "sync" + (cls ? " " + cls : ""); }

if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
function keepOffline(){
  if (!navigator.onLine || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.ready.then(() => setTimeout(() => { for (const f of FILES) fetch(f).catch(() => {}); }, 3000)).catch(() => {});
}

B = await createBackend();
B.onAuth(async u => {
  user = u;
  if (!u) return signInPage();
  if (!(await isPlus(u))) {
    main.innerHTML = `<div class="msg"><h1>Akouō Greek</h1><p>Reading the New Testament in Greek, with every word explained, and the Greek School are part of Akouō Plus, which isn’t available on this account yet.</p><p class="small">Signed in as ${esc(u.email)}. <button type="button" class="linkbtn" id="out">Sign out</button></p></div>`;
    $("#out").onclick = signOut; return;
  }
  await homePage();
  keepOffline();
  sync(navigator.onLine ? "Saved" : "Offline", navigator.onLine ? "" : "off");
});
window.addEventListener("online", () => user && sync("Saved"));
window.addEventListener("offline", () => user && sync("Offline", "off"));
async function signOut(){ await B.signOut(); }

/* ---------- signed out ---------- */
function signInPage(){
  const reset = mode === "reset";
  main.innerHTML = `<header class="hero"><h1>Akouō Greek</h1><p class="lead">Read the New Testament in Greek with every word explained, and learn Greek from the alphabet up.</p></header>
    <form class="signin" id="signin" novalidate><h2>${reset ? "Reset your password" : "Sign in"}</h2>
      <p class="small">Use the same account as Akouō. Your progress is saved to it.</p>
      <label for="a-email">Email</label><input id="a-email" type="email" autocomplete="email" value="${esc(email)}" required>
      ${reset ? "" : `<label for="a-pw">Password</label><input id="a-pw" type="password" autocomplete="current-password" required>`}
      ${err ? `<p class="err" role="alert">${esc(err)}</p>` : ""}${info ? `<p class="info" role="status">${esc(info)}</p>` : ""}
      <div class="row"><button class="btn primary" type="submit"${busy ? " disabled" : ""}>${busy ? "One moment" : reset ? "Send reset link" : "Sign in"}</button>
      <button class="btn" type="button" id="amode">${reset ? "Back to sign in" : "Forgot password?"}</button></div>
      <p class="small">No account yet? Create one in <a href="./">Akouō</a>, the listening prayer journal, then sign in here.</p></form>`;
  $("#amode").onclick = () => { mode = reset ? "in" : "reset"; err = info = ""; signInPage(); };
  $("#signin").onsubmit = async e => {
    e.preventDefault();
    email = $("#a-email").value.trim(); const pw = $("#a-pw") ? $("#a-pw").value : "";
    err = info = "";
    if (!email) { err = "Enter your email address."; return signInPage(); }
    busy = true; signInPage();
    try {
      if (reset) { await B.reset(email); info = "If an account uses that email, a reset link is on its way. Check your inbox."; mode = "in"; }
      else await B.signIn(email, pw);
    } catch (x) { err = authMessage(x); }
    busy = false; if (!user) signInPage();
  };
}

/* ---------- signed in ---------- */
async function homePage(){
  const learn = new Learn(B, user.uid, sync);
  await learn.load();
  let done = {};
  try { const d = await B.getGreek(user.uid, "school"); done = (d && d.done) || {}; } catch (e) {}
  const last = pref("last", "") || learn.recent(1)[0] || "";
  const due = learn.due().length, known = learn.knownCount(), deck = Object.keys(learn.s.deck).length;
  const open = id => { const b = before(id); return !b || !!done[b.id]; };
  const next = ALL.find(x => open(x.id) && !done[x.id]), nDone = ALL.filter(x => done[x.id]).length;
  const lesson = next ? lessonById(next.id) : null;

  main.innerHTML = `<h1 class="sr">Akouō Greek</h1>
    <section class="hcard read" aria-labelledby="h-read"><p class="eyebrow">STUDY DESK</p>
      <h2 id="h-read">${last ? `Continue in ${esc(last)}` : "Read the New Testament in Greek"}</h2>
      <p class="small">Tap any word for its grammar in plain English, see how each sentence is built, and learn as you read. All 27 books.</p>
      <div class="row"><a class="btn primary" href="${withDemo("greek.html?ref=" + encodeURIComponent(last || "John 1"))}">${last ? "Continue" : "Start with John 1"}</a></div>
      <form class="openp" id="go"><label for="ref">Open a passage</label><div class="openp-row"><input id="ref" placeholder="Romans 8 or John 3:16-21" autocomplete="off" enterkeyhint="go"><button class="btn" type="submit">Open</button></div><p class="err" id="go-err" role="alert" hidden></p></form>
    </section>
    <section class="hcard" aria-labelledby="h-school"><p class="eyebrow">GREEK SCHOOL</p>
      <h2 id="h-school">${lesson ? (nDone ? `Next: ${esc(lesson.title)}` : "Learn Greek from the alphabet up") : "Every lesson written so far is done"}</h2>
      <p class="small">${nDone} of ${ALL.length} lessons done. Short lessons in the order of Machen's <i>New Testament Greek for Beginners</i>, with real verses from the start.</p>
      <div class="row"><a class="btn primary" href="${withDemo("greek-school.html")}${lesson ? "#lesson=" + lesson.id : ""}">${lesson ? (nDone ? "Continue" : "Start Lesson 1") : "Open the School"}</a><a class="btn" href="${withDemo("greek-school.html")}#sounds">Sound chart</a></div>
    </section>
    <section class="hcard" aria-labelledby="h-words"><p class="eyebrow">YOUR WORDS</p>
      <h2 id="h-words">${due ? `${due} ${due === 1 ? "card" : "cards"} to review` : known ? `${known} ${known === 1 ? "word" : "words"} known` : "Build your vocabulary"}</h2>
      <p class="small">${known} known · ${deck} in your deck. A few minutes of review a day keeps them.</p>
      <div class="row"><a class="btn${due ? " primary" : ""}" href="${withDemo("greek.html?ref=" + encodeURIComponent(last || "John 1") + "&learn=" + (due ? "review" : "progress"))}">${due ? "Review now" : "Open Learn"}</a></div>
    </section>
    <p class="hlinks"><a href="${withDemo("greek-guide.html")}">How to use</a> · <span>Signed in as ${esc(user.email)}</span> · <button type="button" class="linkbtn" id="out">Sign out</button></p>
    <footer class="foot"><p>Greek text: SBL Greek New Testament (CC BY 4.0). Word data: MACULA Greek and STEPBible (CC BY 4.0). English: Berean Standard Bible. Lexicons: Abbott-Smith and Thayer. Full credits are at the foot of the Study Desk.</p></footer>`;
  $("#out").onclick = signOut;
  $("#go").onsubmit = e => {
    e.preventDefault();
    const v = $("#ref").value.trim(), r = v && parseRefs(v)[0], ge = $("#go-err");
    if (!r) { ge.hidden = false; ge.textContent = "Type a passage such as Romans 8 or John 3:16."; return; }
    if (!NT_CODES.includes(r.book[1])) { ge.hidden = false; ge.textContent = `${r.book[0]} is in the Old Testament. Akouō Greek covers the Greek New Testament.`; return; }
    location.href = withDemo("greek.html?ref=" + encodeURIComponent(r.label));
  };
}
