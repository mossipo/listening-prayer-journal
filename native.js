// Native iPhone features through Capacitor. On the web every function here does nothing or falls back,
// so the same code runs in the browser and in the App Store build.
// The App Store build loads native/capacitor-plugins.js first, which sets window.AkouoNative.
const C = window.Capacitor;
export const NATIVE = !!(C && C.isNativePlatform && C.isNativePlatform());
const plugin = name => (NATIVE && window.AkouoNative && window.AkouoNative[name]) || null;

export async function nativeShare(text, title){
  const S = plugin("Share"); if(!S) return false;
  try { await S.share({ title: title || "Shared from Akouō", text }); } catch (e) { /* closed the share sheet */ }
  return true;
}

// Daily reminder: a local notification scheduled on this phone (no server, no tracking).
const REM_ID = 1001, REM_KEY = "akouo.reminder";
export function reminderGet(){
  try { const r = JSON.parse(localStorage.getItem(REM_KEY) || "null"); if(r && typeof r.time === "string") return r; } catch (e) {}
  return { on: false, time: "07:00" };
}
export async function reminderSet(on, time){
  const LN = plugin("LocalNotifications"); if(!LN) return { ok: false, reason: "unavailable" };
  try {
    if(on){
      let perm = await LN.checkPermissions();
      if(perm.display !== "granted") perm = await LN.requestPermissions();
      if(perm.display !== "granted") return { ok: false, reason: "denied" };
    }
    await LN.cancel({ notifications: [{ id: REM_ID }] }).catch(() => {});
    if(on){
      const [hour, minute] = time.split(":").map(Number);
      await LN.schedule({ notifications: [{
        id: REM_ID,
        title: "Come and listen",
        body: "“My sheep hear my voice.” Take a few minutes with Him.",
        schedule: { on: { hour, minute }, allowWhileIdle: true }
      }] });
    }
    try { localStorage.setItem(REM_KEY, JSON.stringify({ on, time })); } catch (e) {}
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: "error" };
  }
}
