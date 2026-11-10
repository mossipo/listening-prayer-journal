// Storage and sign-in. Two implementations share one interface:
//   Firebase (real accounts, private per user, works offline and syncs)
//   Demo (only when firebase-config.js is still blank; keeps data in this browser)
import { firebaseConfig } from "./firebase-config.js";

// The App Store build bundles Firebase inside the app (native/build.mjs) so it starts without a connection.
const NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const FB = NATIVE ? "./vendor/firebase/" : "https://www.gstatic.com/firebasejs/10.12.2/";
export const isConfigured = !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId);
// Public demo: opening the app with ?demo shows a sample journal with no sign-in. It is kept in its own
// storage on this device, never touches Firebase, and leaves a real journal on the same device alone.
export const DEMO = (() => { try { return new URLSearchParams(location.search).has("demo"); } catch (e) { return false; } })();
export const DEMO_KEY = "akouo.demo";

const AUTH_MESSAGES = {
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/missing-email": "Enter your email address.",
  "auth/missing-password": "Enter your password.",
  "auth/email-already-in-use": "An account already uses that email. Try signing in instead.",
  "auth/weak-password": "Choose a password with at least 8 characters.",
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/wrong-password": "Email or password is incorrect.",
  "auth/user-not-found": "Email or password is incorrect.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes, or reset your password.",
  "auth/network-request-failed": "No connection. Check your signal and try again.",
  "auth/requires-recent-login": "For your security, enter your password again to continue.",
  "auth/user-disabled": "This account has been turned off."
};
export function authMessage(err){
  return AUTH_MESSAGES[err && err.code] || (err && err.message) || "Something went wrong. Try again.";
}

function clean(o){ return JSON.parse(JSON.stringify(o)); }

/* ---------------- Firebase ---------------- */
async function firebaseBackend(){
  const [{ initializeApp }, A, F] = await Promise.all([
    import(FB + "firebase-app.js"),
    import(FB + "firebase-auth.js"),
    import(FB + "firebase-firestore.js")
  ]);
  const app = initializeApp(firebaseConfig);
  // Inside the iPhone app, sign-in is kept in IndexedDB directly (getAuth can stall in an app web view).
  const auth = NATIVE ? A.initializeAuth(app, { persistence: [A.indexedDBLocalPersistence, A.browserLocalPersistence] }) : A.getAuth(app);
  let db;
  try {
    db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) });
  } catch (e) {
    db = F.getFirestore(app);
  }
  const entriesCol = uid => F.collection(db, "users", uid, "entries");
  const entryDoc = (uid, id) => F.doc(db, "users", uid, "entries", id);
  const settingsDoc = uid => F.doc(db, "users", uid, "meta", "settings");
  const who = () => auth.currentUser;

  return {
    kind: "firebase",
    onAuth(cb){ return A.onAuthStateChanged(auth, u => cb(u ? { uid: u.uid, email: u.email, verified: u.emailVerified } : null)); },
    async signUp(email, pw){
      const cred = await A.createUserWithEmailAndPassword(auth, email, pw);
      try { await A.sendEmailVerification(cred.user); } catch (e) {}
    },
    async signIn(email, pw){ await A.signInWithEmailAndPassword(auth, email, pw); },
    async reset(email){ await A.sendPasswordResetEmail(auth, email); },
    async signOut(){ await A.signOut(auth); },
    async resendVerification(){ if (who()) await A.sendEmailVerification(who()); },
    async refreshUser(){ const u = who(); if (!u) return null; await u.reload(); return { uid: u.uid, email: u.email, verified: u.emailVerified }; },
    async changePassword(currentPw, newPw){
      const u = who();
      await A.reauthenticateWithCredential(u, A.EmailAuthProvider.credential(u.email, currentPw));
      await A.updatePassword(u, newPw);
    },
    async deleteAccount(pw){
      const u = who();
      await A.reauthenticateWithCredential(u, A.EmailAuthProvider.credential(u.email, pw));
      const snap = await F.getDocs(entriesCol(u.uid));
      let batch = F.writeBatch(db), n = 0;
      for (const d of snap.docs){
        batch.delete(d.ref); n++;
        if (n % 400 === 0){ await batch.commit(); batch = F.writeBatch(db); }
      }
      batch.delete(settingsDoc(u.uid));
      await batch.commit();
      await A.deleteUser(u);
    },
    watchEntries(uid, next, onStatus){
      return F.onSnapshot(entriesCol(uid), { includeMetadataChanges: true }, snap => {
        const out = {};
        snap.docs.forEach(d => { out[d.id] = d.data(); });
        next(out, { fromCache: snap.metadata.fromCache });
        onStatus && onStatus({ pending: snap.metadata.hasPendingWrites, fromCache: snap.metadata.fromCache });
      }, err => onStatus && onStatus({ error: err }));
    },
    watchSettings(uid, next){
      // includeMetadataChanges: so the app also hears when the server confirms what the phone already had
      return F.onSnapshot(settingsDoc(uid), { includeMetadataChanges: true }, d => next(d.exists() ? d.data() : null, { fromCache: d.metadata.fromCache }), () => {});
    },
    saveEntry(uid, e){ return F.setDoc(entryDoc(uid, e.id), clean(e)); },
    deleteEntry(uid, id){ return F.deleteDoc(entryDoc(uid, id)); },
    saveSettings(uid, s){ return F.setDoc(settingsDoc(uid), clean(s)); }
  };
}

/* ---------------- Demo (setup only) ---------------- */
function demoBackend(KEY = "lpj.demo", seed = null){
  let mem = null;   // used when the browser blocks storage, so the demo still works for that visit
  const read = () => { try { const v = localStorage.getItem(KEY); return v ? JSON.parse(v) : (mem || {}); } catch (e) { return mem || {}; } };
  const write = s => { mem = s; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };
  if (seed && !read().email) write(seed());
  let authCb = null; const entryCbs = new Set(); const setCbs = new Set();
  const user = () => { const s = read(); return s.email ? { uid: "demo", email: s.email, verified: true } : null; };
  const emitEntries = () => { const s = read(); entryCbs.forEach(cb => cb(clean(s.entries || {}))); };
  const fail = (code) => { const e = new Error(code); e.code = code; throw e; };
  return {
    kind: "demo",
    onAuth(cb){ authCb = cb; setTimeout(() => cb(user()), 0); return () => { authCb = null; }; },
    async signUp(email, pw){ if (!/^\S+@\S+\.\S+$/.test(email)) fail("auth/invalid-email"); if ((pw || "").length < 8) fail("auth/weak-password"); const s = read(); s.email = email; write(s); authCb && authCb(user()); },
    async signIn(email, pw){ if (!email) fail("auth/missing-email"); if (!pw) fail("auth/missing-password"); const s = read(); s.email = email; write(s); authCb && authCb(user()); },
    async reset(){ },
    async signOut(){ const s = read(); delete s.email; write(s); authCb && authCb(null); },
    async resendVerification(){ },
    async refreshUser(){ return user(); },
    async changePassword(){ },
    async deleteAccount(){ write({}); authCb && authCb(null); },
    watchEntries(uid, next, onStatus){ entryCbs.add(next); setTimeout(() => { emitEntries(); onStatus && onStatus({ pending: false }); }, 0); return () => entryCbs.delete(next); },
    watchSettings(uid, next){ setCbs.add(next); setTimeout(() => next(read().settings || null), 0); return () => setCbs.delete(next); },
    async saveEntry(uid, e){ const s = read(); s.entries = s.entries || {}; s.entries[e.id] = clean(e); write(s); emitEntries(); },
    async deleteEntry(uid, id){ const s = read(); if (s.entries) delete s.entries[id]; write(s); emitEntries(); },
    async saveSettings(uid, st){ const s = read(); s.settings = clean(st); write(s); }
  };
}

export async function createBackend(){
  if (DEMO) { const m = await import("./demo-data.js"); return demoBackend(DEMO_KEY, () => m.demoData()); }
  return isConfigured ? firebaseBackend() : demoBackend();
}
