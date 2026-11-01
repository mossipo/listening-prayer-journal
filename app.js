import { createBackend, authMessage, isConfigured } from "./backend.js";
import { findThemes } from "./themes.js";

const VERSION = "2.2.1";

/* ================= content ================= */
const DEFAULT_QS = [
  "Lord, what do You want me to know about how You see me today?",
  "What are You inviting me into this week?",
  "Is there anything standing between You and me right now?",
  "Is there something I need to confess, to You or to someone else?",
  "Who do You want me to encourage, and how?",
  "Who do You want me to pray for today? What should I pray?",
  "What would You like me to stop doing? What would You like me to start?",
  "How do You want me to order my time with You each day?",
  "What should I pray for my marriage and family?",
  "Is there a question You would like me to ask You?"
];
const AREAS = ["Walk with God","Marriage","Children and family","Church and ministry","Calling and gifts","Work and finances","Health and healing","Relationships","Evangelism","Time, rest and schedule","Community and nation","Understanding Scripture","Other"];
const HOW = ["While reading Scripture","Quiet impression or thought","Picture, dream or vision","Through another person","Through circumstances","During worship or prayer","Other"];
const MSG_KINDS = ["Encouragement","Correction","Direction","Promise","Wisdom"];
const TESTS = [
  {k:"scripture",gate:true,name:"Agrees with Scripture",t:"Does it agree with Scripture read in context?",s:"The written Word is the measuring line. A word that contradicts it is set aside, however strong it felt.",r:"Isa 8:20; Acts 17:11; 2 Tim 3:16-17"},
  {k:"christ",gate:true,name:"Honours Jesus",t:"Does it honour Jesus and fit His character?",s:"The Spirit glorifies Christ and speaks what is His.",r:"John 16:13-14; 1 John 4:1-3"},
  {k:"tone",name:"Tone of heavenly wisdom",t:"Does it carry the tone of wisdom from above?",s:"Pure, peaceable, gentle, open to reason. Not condemning, frantic or flattering.",r:"Jas 3:17; Rom 8:1"},
  {k:"fruit",name:"Produces good fruit",t:"Will obeying it produce the fruit of the Spirit?",s:"Love, holiness, humility and unity, not division or pride.",r:"Gal 5:22-23; Matt 7:16-20"},
  {k:"motive",name:"Heart and motives checked",t:"Have I checked my own heart and desires?",s:"Am I hearing what I want to hear? Have I surrendered the outcome?",r:"Jer 17:9; Ps 139:23-24"},
  {k:"counsel",name:"Weighed with counsel",t:"Have mature believers weighed it with me?",s:"Spouse, pastor, elders or trusted friends who love God and will be honest.",r:"Prov 15:22; 1 Cor 14:29"},
  {k:"witness",name:"Recurring or confirmed",t:"Has it come again, or been confirmed in the Word?",s:"A recurring sense or a later passage that speaks to the same thing.",r:"Gen 41:32; 2 Cor 13:1"},
  {k:"peace",name:"Peace of Christ",t:"Does the peace of Christ settle over it?",s:"Peace is an umpire, not a standalone authority. Weigh it with the others.",r:"Col 3:15; Phil 4:6-7"},
  {k:"doors",name:"Circumstances line up",t:"Do circumstances line up, without forcing them?",s:"Doors open and close by God's hand, yet Jonah also found a ship. Never manufacture a sign.",r:"Acts 16:6-10; Jonah 1:3; Matt 4:7"}
];
const STAKES = [["everyday","Everyday"],["significant","Significant"],["life","Life-shaping"]];
const VERSIONS = ["NIV","NKJV","ESV","NLT","KJV","NASB","CSB"];
const john = n => Array.from({length:n},(_,i)=>"John "+(i+1));
const PLANS = [
  {key:"w2",title:"Meditation in the Psalms",days:["Psalm 1","Psalm 19","Psalm 23","Psalm 24","Psalm 37","Psalm 42","Psalm 121","Psalm 103"]},
  {key:"w3",title:"The Upper Room (John 14 to 16)",days:["John 14:1-14","John 14:15-31","John 15:1-17","John 15:18-25","John 16:1-15","John 16:16-33"]},
  {key:"john",title:"John, a chapter a day",days:john(21)},
  {key:"w5",title:"Guidance: Psalms and John",days:["Psalm 25; John 7","Psalm 27; John 8","Psalm 32; John 9","Psalm 37; John 10","Psalm 91; John 11","Psalm 143; John 12"]}
];
const TYPE = {journal:{label:"Listen",glyph:"L"},smorp:{label:"SMORP",glyph:"S"},weigh:{label:"Weigh",glyph:"W"},task:{label:"Step",glyph:"\u2713"}};
const LIST_TYPES = ["journal","smorp","weigh"];
const DEFAULT_SETTINGS = {version:"NIV",questions:DEFAULT_QS.slice(),plan:"w2",readings:{},hiddenThemes:[]};

/* ================= helpers ================= */
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const esc = s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clone = o=>JSON.parse(JSON.stringify(o));
const ymd = d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const today = ()=>ymd(new Date());
function fmtDate(s,long){ if(!s) return "No date"; const d=new Date(s+"T12:00:00"); if(isNaN(d)) return s; return d.toLocaleDateString(undefined,long?{weekday:"long",month:"long",day:"numeric"}:{weekday:"short",month:"short",day:"numeric",year:"numeric"}); }
function monthKey(s){ const d=new Date((s||today())+"T12:00:00"); return d.toLocaleDateString(undefined,{month:"long",year:"numeric"}); }
const newId = ()=>"e-"+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
function getPath(o,p){ return p.split(".").reduce((a,k)=>a==null?a:a[k],o); }
function setPath(o,p,v){ const ks=p.split("."); let a=o; for(let i=0;i<ks.length-1;i++){ const k=ks[i]; if(a[k]==null||typeof a[k]!=="object") a[k]=/^\d+$/.test(ks[i+1])?[]:{}; a=a[k]; } a[ks[ks.length-1]]=v; }
const bgLink = (p,v)=>"https://www.biblegateway.com/passage/?search="+encodeURIComponent(p)+"&version="+encodeURIComponent(v||"NIV");
let toastT; function toast(m){ const t=$("#toast"); t.textContent=m; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true,2600); }
const ICON = {
  today:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-1.5Z"/><path d="M8 7h6M8 11h4"/></svg>',
  entries:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>',
  settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>'
};

/* ================= state ================= */
let B = null, user = null;
let entries = {}, settings = clone(DEFAULT_SETTINGS);
let unsubE = null, unsubS = null, loaded = false;
const dirty = new Set(), timers = {};
let settingsDirty = false, settingsTimer = null, serverPending = false;
let route = {name:"today"}, lastList = "#today";
let filter = {q:"",type:"all",ids:null,label:""};
let installEvt = null;

/* ================= persistence ================= */
function syncState(){ if(!navigator.onLine) return "offline"; return (dirty.size||serverPending||settingsDirty)?"saving":"saved"; }
function paintSync(){ const el=$("#sync"); if(!el) return; const s=syncState(); el.dataset.s=s; el.lastChild.textContent=s==="offline"?"Offline, will sync":s==="saving"?"Saving":"Saved"; }
function touch(e){
  e.updatedAt=Date.now(); entries[e.id]=e; dirty.add(e.id); paintSync();
  clearTimeout(timers[e.id]); timers[e.id]=setTimeout(()=>flush(e.id),600);
}
function flush(id){
  clearTimeout(timers[id]); delete timers[id];
  const e=entries[id]; dirty.delete(id);
  if(e&&user) B.saveEntry(user.uid,e).catch(err=>toast("Couldn't save: "+(err.message||"try again")));
  paintSync();
}
function flushAll(){ Object.keys(timers).forEach(flush); if(settingsDirty) pushSettings(); }
function touchSettings(){ settingsDirty=true; paintSync(); clearTimeout(settingsTimer); settingsTimer=setTimeout(pushSettings,600); }
function pushSettings(){ clearTimeout(settingsTimer); if(!user) return; settingsDirty=false; B.saveSettings(user.uid,settings).catch(()=>{}); paintSync(); }
function removeEntry(id){ clearTimeout(timers[id]); delete timers[id]; dirty.delete(id); delete entries[id]; if(user) B.deleteEntry(user.uid,id).catch(()=>{}); }
window.addEventListener("pagehide",flushAll);
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="hidden") flushAll(); });
window.addEventListener("online",paintSync); window.addEventListener("offline",paintSync);

function startData(){
  stopData();
  unsubE=B.watchEntries(user.uid,remote=>{
    for(const id of dirty){ if(entries[id]) remote[id]=entries[id]; }
    entries=remote; loaded=true; onData();
  },st=>{ if(st.error){ toast("Can't reach your journal right now. Changes will sync when you're back online."); } serverPending=!!st.pending; paintSync(); });
  unsubS=B.watchSettings(user.uid,s=>{ if(settingsDirty) return; settings=Object.assign(clone(DEFAULT_SETTINGS),s||{}); if(!Array.isArray(settings.questions)) settings.questions=DEFAULT_QS.slice(); onData(); });
}
function stopData(){ unsubE&&unsubE(); unsubS&&unsubS(); unsubE=unsubS=null; entries={}; loaded=false; settings=clone(DEFAULT_SETTINGS); }
function onData(){
  if(!user) return;
  const main=$("main"), ae=document.activeElement, typing=main&&main.contains(ae)&&((ae.tagName==="INPUT"&&ae.type!=="checkbox")||ae.tagName==="TEXTAREA"||ae.tagName==="SELECT");
  if(route.name==="entry"){ if(main&&main.contains(ae)) return; if(!entries[route.id]&&loaded){ location.hash=lastList; return; } }
  else if(route.name==="entries"&&ae&&ae.id==="q"){ renderEntryList(); return; }
  else if(typing) return;
  renderMain();
}

/* ================= model ================= */
function sorted(type){ return Object.values(entries).filter(e=>LIST_TYPES.includes(e.type)&&(!type||type==="all"||e.type===type)).sort((a,b)=>(b.date||"").localeCompare(a.date||"")||(b.createdAt||0)-(a.createdAt||0)); }
function summary(e){
  if(e.type==="journal"){ const r=(e.thread||[]).find(l=>l.r==="R"&&l.t); return e.title||(r&&r.t)||e.praise||"Untitled conversation"; }
  if(e.type==="smorp") return e.passage||e.standout||"Untitled reading";
  return e.question||e.what||"Untitled matter";
}
function isBlank(e){
  const strs=[e.title,e.praise,e.scripture,e.notes,e.memory,e.standout,e.message,e.obedience,e.repentance,e.prayer,e.question,e.what,e.howNote,e.when];
  if(strs.some(s=>s&&String(s).trim())) return false;
  if((e.thread||[]).some(l=>l.t&&l.t.trim())) return false;
  if(e.tests&&Object.values(e.tests).some(t=>t&&(t.v||t.n))) return false;
  if(e.outcome&&(e.outcome.result||e.outcome.lesson)) return false;
  if((e.actions||[]).some(a=>a.t&&a.t.trim())) return false;
  return true;
}
function verdict(e){
  const t=e.tests||{}, g=k=>(t[k]&&t[k].v)||"";
  const stakes=e.stakes||"everyday";
  const passes=TESTS.filter(x=>g(x.k)==="pass").length, answered=TESTS.filter(x=>g(x.k)).length;
  if(g("scripture")==="fail"||g("christ")==="fail") return {v:"stop",short:"Set aside",label:"Set this aside.",text:"A word that contradicts Scripture or the character of Christ is not from Him, however strong it felt. Release it, and thank Him for His Word."};
  if(g("tone")==="fail"||g("fruit")==="fail") return {v:"stop",short:"Likely not",label:"Hold this loosely; it likely isn't the Lord.",text:"Condemnation, pressure or bad fruit are warning signs. Bring it back to prayer and to someone you trust before going further."};
  if(!answered) return {v:"weigh",short:"Not weighed",label:"Not yet weighed.",text:"Start with the two must-pass tests. Nothing else counts until both are a clear yes."};
  if(g("scripture")!=="pass"||g("christ")!=="pass") return {v:"weigh",short:"Weighing",label:"Settle the must-pass tests first.",text:"Search the Scriptures until you can say clearly that this agrees with the Word and honours Jesus."};
  if(stakes==="life"&&g("counsel")!=="pass") return {v:"wait",short:"Seek counsel",label:"Wait. Seek counsel before deciding.",text:"Life-shaping decisions need mature believers who will be honest with you. Plans succeed with many advisers (Prov 15:22)."};
  const anyFail=TESTS.some(x=>g(x.k)==="fail");
  const need=stakes==="everyday"?3:stakes==="significant"?6:8;
  const extra=stakes==="significant"?(g("counsel")==="pass"||g("witness")==="pass"):stakes==="life"?g("witness")==="pass":true;
  if(!anyFail&&passes>=need&&extra) return {v:"go",short:"Proceed humbly",label:"Freedom to proceed, humbly.",text:"The tests line up. Step out in faith, stay teachable, and record what happens. The fruit after obedience is the final confirmation."};
  if(anyFail) return {v:"weigh",short:"Keep weighing",label:"Keep weighing.",text:"One or more checks came back no. That is not a final answer, but it is a reason to wait, pray and seek more light before acting."};
  return {v:"weigh",short:"Keep weighing",label:"Keep weighing.",text:stakes==="everyday"?"A few more checks will help. Small steps of obedience are a good way to learn His voice.":"For a decision of this weight, look for more witnesses: counsel, a recurring sense, or confirmation in the Word."};
}
function nextReading(){
  const p=PLANS.find(x=>x.key===settings.plan)||PLANS[0];
  const i=p.days.findIndex((_,j)=>!settings.readings[p.key+"-"+j]);
  return i<0?{plan:p,done:true}:{plan:p,i,ref:p.days[i]};
}
function allSteps(){
  const out=[];
  for(const e of Object.values(entries)){
    if(e.type==="task"){ if(e.t&&e.t.trim()) out.push({key:"t:"+e.id,src:null,eid:e.id,t:e.t.trim(),done:!!e.done,doneAt:e.doneAt||0,created:e.createdAt||0}); continue; }
    if(e.type==="smorp"&&e.obeyPin&&e.obedience&&e.obedience.trim()) out.push({key:"o:"+e.id,src:e,eid:e.id,t:e.obedience.trim(),done:!!e.obeyDone,doneAt:e.obeyDoneAt||0,created:e.createdAt||0});
    (e.actions||[]).forEach(a=>{ if(a.t&&a.t.trim()) out.push({key:"a:"+e.id+":"+a.id,src:e,eid:e.id,t:a.t.trim(),done:!!a.done,doneAt:a.doneAt||0,created:a.createdAt||e.createdAt||0}); });
  }
  return out.sort((a,b)=>(a.done-b.done)||(a.done?b.doneAt-a.doneAt:b.created-a.created));
}
function todaySteps(){ const cut=Date.now()-12*3600e3; return allSteps().filter(s=>!s.done||s.doneAt>cut); }
function toggleStep(key,done){
  const [kind,eid,aid]=key.split(":"), e=entries[eid]; if(!e) return;
  const at=done?Date.now():0;
  if(kind==="t"){ e.done=done; e.doneAt=at; }
  else if(kind==="o"){ e.obeyDone=done; e.obeyDoneAt=at; }
  else { const a=(e.actions||[]).find(x=>x.id===aid); if(!a) return; a.done=done; a.doneAt=at; }
  touch(e);
}
const actId=()=>"a"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
function newEntry(type,seed){
  const shapes={
    journal:{title:"",praise:"",thread:[{r:"R",t:""}],scripture:"",checks:{},notes:"",actions:[]},
    smorp:{passage:"",memory:"",standout:"",message:"",msgKinds:[],obedience:"",obeyPin:true,obeyDone:false,repentance:"",prayer:"",thread:[]},
    weigh:{area:"",stakes:"everyday",question:"",what:"",how:"",howNote:"",when:"",tests:{},outcome:{acted:"Not yet",date:"",result:"",lesson:""},actions:[]}
  };
  const e=Object.assign({id:newId(),type,date:today(),createdAt:Date.now()},clone(shapes[type]),seed||{});
  touch(e); location.hash="#entry/"+e.id; return e;
}

/* ================= routing ================= */
function parseRoute(){
  const h=(location.hash||"#today").slice(1);
  if(h.indexOf("entry/")===0) return {name:"entry",id:h.slice(6)};
  if(["today","entries","settings"].includes(h)) return {name:h};
  return {name:"today"};
}
window.addEventListener("hashchange",()=>{
  const prev=route; route=parseRoute();
  if(prev.name==="entry"&&prev.id!==route.id){ flush(prev.id); const e=entries[prev.id]; if(e&&isBlank(e)){ if(e.planDay&&settings.readings[e.planDay]){ settings.readings[e.planDay]=false; touchSettings(); } removeEntry(prev.id); } }
  if(route.name!=="entry") lastList="#"+route.name;
  render(); window.scrollTo(0,0);
});

/* ================= render ================= */
function render(){
  const app=$("#app");
  if(!user){ app.innerHTML=authHTML(); return; }
  const inEntry=route.name==="entry";
  const e=inEntry?entries[route.id]:null;
  const tab=n=>`aria-current="${route.name===n?"page":"false"}"`;
  const sync=`<span class="sync" id="sync" data-s="saved"><i></i><span>Saved</span></span>`;
  const top=inEntry
    ?`<header class="top gut"><div class="col"><button class="back" data-act="back" aria-label="Back">‹ Back</button><h1>${e?esc(TYPE[e.type].label.toUpperCase()):""}</h1><span class="spacer"></span>${sync}</div></header>`
    :`<header class="top gut"><div class="col wide"><span class="brand"><b>Listening</b> Prayer Journal</span><nav class="toplinks" aria-label="Sections"><a href="#today" ${tab("today")}>Today</a><a href="#entries" ${tab("entries")}>Entries</a><a href="#settings" ${tab("settings")}>Settings</a></nav><span class="spacer"></span>${sync}</div></header>`;
  const nav=inEntry?"":`<nav class="tabbar" aria-label="Sections"><a href="#today" ${tab("today")}>${ICON.today}Today</a><a href="#entries" ${tab("entries")}>${ICON.entries}Entries</a><a href="#settings" ${tab("settings")}>${ICON.settings}Settings</a></nav>`;
  app.innerHTML=top+`<main class="gut${inEntry?" editor-main":""}"><div class="col" id="main"></div></main>`+nav;
  renderMain(); paintSync();
}
function renderMain(){
  const m=$("#main"); if(!m) return;
  if(route.name==="today") m.innerHTML=todayHTML();
  else if(route.name==="entries"){ m.innerHTML=entriesHTML(); renderEntryList(); }
  else if(route.name==="settings") m.innerHTML=settingsHTML();
  else {
    const e=entries[route.id];
    if(!e){ m.innerHTML=loaded?`<div class="empty-card">That entry isn't here any more.</div>`:`<p class="muted">Opening</p>`; return; }
    m.innerHTML=e.type==="journal"?journalHTML(e):e.type==="smorp"?smorpHTML(e):weighHTML(e);
  }
  $$("#main textarea").forEach(grow);
}
function grow(t){ t.style.height="auto"; t.style.height=(t.scrollHeight+2)+"px"; }

/* ---------- auth ---------- */
let authMode="in", authErr="", authInfo="", authBusy=false;
function authHTML(){
  const demo=!isConfigured?`<div class="info">Demo mode. Firebase isn't connected yet, so any email and password will work and entries stay in this browser.</div>`:"";
  const tabs=authMode==="reset"?"":`<div class="seg-tabs" role="group" aria-label="Account"><button type="button" data-act="amode" data-m="in" aria-pressed="${authMode==="in"}">Sign in</button><button type="button" data-act="amode" data-m="up" aria-pressed="${authMode==="up"}">Create account</button></div>`;
  const pw=authMode==="reset"?"":`<label class="fld"><span>Password${authMode==="up"?" (at least 8 characters)":""}</span><div class="pw"><input type="password" id="a-pw" autocomplete="${authMode==="up"?"new-password":"current-password"}" required minlength="${authMode==="up"?8:1}"><button type="button" data-act="showpw">Show</button></div></label>`;
  const label=authMode==="in"?"Sign in":authMode==="up"?"Create account":"Send reset link";
  return `<div class="auth gut"><form class="auth-card" id="auth-form" novalidate>
    <div><h1><b>Listening</b> Prayer Journal</h1><p class="verse">"My sheep hear my voice." John 10:27</p></div>
    ${demo}${tabs}
    ${authMode==="reset"?`<p class="muted" style="margin:0">Enter your email and we'll send a link to choose a new password.</p>`:""}
    <label class="fld"><span>Email</span><input type="email" id="a-email" autocomplete="email" inputmode="email" required value="${esc(authEmail)}"></label>
    ${pw}
    ${authErr?`<div class="err" role="alert">${esc(authErr)}</div>`:""}${authInfo?`<div class="info" role="status">${esc(authInfo)}</div>`:""}
    <button class="btn primary block" type="submit"${authBusy?" disabled":""}>${authBusy?"One moment":label}</button>
    ${authMode==="in"?`<button class="btn ghost" type="button" data-act="amode" data-m="reset">Forgot password?</button>`:authMode==="reset"?`<button class="btn ghost" type="button" data-act="amode" data-m="in">Back to sign in</button>`:""}
    <p class="muted small" style="margin:0">Your journal is private to your account. Only you can read your entries.</p>
  </form></div>`;
}
let authEmail="";
async function submitAuth(){
  authEmail=($("#a-email").value||"").trim(); const pw=$("#a-pw")?$("#a-pw").value:"";
  authErr=""; authInfo="";
  if(!authEmail){ authErr="Enter your email address."; return render(); }
  if(authMode==="up"&&pw.length<8){ authErr="Choose a password with at least 8 characters."; return render(); }
  authBusy=true; render();
  try{
    if(authMode==="in") await B.signIn(authEmail,pw);
    else if(authMode==="up"){ await B.signUp(authEmail,pw); toast("Account created. Check your email to verify it."); }
    else { await B.reset(authEmail); authInfo="If an account uses that email, a reset link is on its way. Check your inbox."; authMode="in"; }
  }catch(err){ authErr=authMessage(err); }
  authBusy=false; if(!user) render();
}

/* ---------- today ---------- */
function todayHTML(){
  const h=new Date().getHours(), greet=h<12?"Good morning":h<17?"Good afternoon":"Good evening";
  const nr=nextReading();
  const all=sorted("all");
  const open=sorted("weigh").filter(e=>(!e.outcome||e.outcome.acted==="Not yet"||!e.outcome.acted)&&verdict(e).v!=="stop").slice(0,3);
  const recent=all.slice(0,6), steps=todaySteps();
  const verify=user&&!user.verified&&B.kind==="firebase"?`<div class="banner"><span>Please verify your email so you can reset your password if you ever need to.</span><span class="btns"><button class="btn sm" data-act="resend">Resend email</button><button class="btn sm ghost" data-act="recheck">I've verified</button></span></div>`:"";
  return `<div class="stack-lg">
    <div><p class="eyebrow">${greet.toUpperCase()} \u00b7 ${esc(fmtDate(today(),true).toUpperCase())}</p><h2 class="big">"My sheep hear my voice."</h2><p class="ref" style="margin:4px 0 0;font-size:.95rem">John 10:27</p></div>
    ${verify}
    <div class="actions">
      <button class="act" data-act="new" data-type="journal"><span class="glyph">L</span><span><b>Listen</b><span>Thank Him, then ask and listen</span></span></button>
      <button class="act" data-act="new" data-type="smorp"><span class="glyph">S</span><span><b>SMORP</b><span>${nr.done?"Plan complete. Choose another in Settings":"Today: "+esc(nr.ref)}</span></span></button>
      <button class="act" data-act="new" data-type="weigh"><span class="glyph">W</span><span><b>Weigh a word</b><span>Test what you sensed</span></span></button>
    </div>
    <section class="stack"><h3 class="sec">NEXT STEPS</h3>${steps.length?stepsHTML(steps):""}
      <form class="addstep" id="addstep"><input type="text" id="newstep" placeholder="${steps.length?"Add another step":"Add a step, or pin one from an entry"}" aria-label="Add a step" enterkeyhint="done"><button class="btn sm" type="submit">Add</button></form></section>
    ${themesHTML()}
    ${open.length?`<section class="stack"><h3 class="sec">STILL WEIGHING</h3>${listHTML(open)}</section>`:""}
    <section class="stack"><h3 class="sec">RECENT</h3>${recent.length?listHTML(recent):`<div class="empty-card">Your entries will show here. Start with Listen: thank Him for something from yesterday, then ask a question and write what you sense.</div>`}${all.length>6?`<a class="btn ghost" href="#entries">See all ${all.length} entries</a>`:""}</section>
  </div>`;
}
function stepsHTML(list){
  return `<ul class="list steps">${list.map(s=>`<li class="step${s.done?" done":""}"><input type="checkbox" data-step="${s.key}"${s.done?" checked":""} aria-label="Done: ${esc(s.t)}">
    ${s.src?`<button class="step-t" data-act="open" data-id="${s.eid}"><span class="t">${esc(s.t)}</span><span class="d">From ${esc(TYPE[s.src.type].label)}: ${esc(summary(s.src))}</span></button><span></span>`
      :`<span class="step-t"><span class="t">${esc(s.t)}</span></span><button class="x" data-act="deltask" data-id="${s.eid}" aria-label="Remove step">\u00d7</button>`}</li>`).join("")}</ul>`;
}
function themesHTML(){
  const th=findThemes(Object.values(entries),settings.hiddenThemes||[]);
  const items=[...th.phrases,...th.words,...th.passages];
  if(!items.length){
    return th.analysed>0&&th.analysed<5?`<section class="stack"><h3 class="sec">KEEPS COMING UP</h3><p class="legend" style="margin:0">After a few more entries, words, phrases and passages that repeat will show here.</p></section>`:"";
  }
  return `<section class="stack"><h3 class="sec">KEEPS COMING UP</h3>
    <div class="chips">${items.map(t=>`<span class="theme"><button class="chip" data-act="theme" data-q="${esc(t.q)}" data-ids="${t.ids.join(",")}" data-label="${esc(t.label)}">${esc(t.label)}<span class="cnt" aria-label="in ${t.n} entries">${t.n}</span></button><button class="theme-x" data-act="hidetheme" data-q="${esc(t.q)}" aria-label="Hide ${esc(t.label)}">\u00d7</button></span>`).join("")}</div>
    <p class="legend" style="margin:0">Repeated across your entries. Tap one to see where. Recurrence is worth weighing, but it isn't proof on its own.</p></section>`;
}
function listHTML(list){
  return `<ul class="list">${list.map(e=>{
    const v=e.type==="weigh"?verdict(e):null;
    return `<li><button class="row-btn" data-act="open" data-id="${e.id}"><span class="badge" aria-hidden="true">${TYPE[e.type].glyph}</span><span class="row-main"><span class="t">${esc(summary(e))}</span><span class="d">${esc(TYPE[e.type].label)} · ${esc(fmtDate(e.date))}</span></span>${v?`<span class="pill" data-v="${v.v}">${esc(v.short)}</span>`:"<span></span>"}</button></li>`;
  }).join("")}</ul>`;
}

/* ---------- entries ---------- */
function entriesHTML(){
  const chip=(t,l)=>`<button class="chip" data-act="filter" data-t="${t}" aria-pressed="${filter.type===t}">${l}</button>`;
  return `<div class="stack"><h2 class="big">Entries</h2>
    <input type="search" id="q" placeholder="Search everything you've written" value="${esc(filter.q)}" aria-label="Search entries">
    <div class="chips">${chip("all","All")}${chip("journal","Listen")}${chip("smorp","SMORP")}${chip("weigh","Weigh")}${chip("steps","Steps")}</div>
    ${filter.ids?`<div class="banner"><span>Entries with <b>${esc(filter.label)}</b></span><button class="btn sm" data-act="clearids">Show all</button></div>`:""}
    <div id="elist" class="stack"></div></div>`;
}
function renderEntryList(){
  const box=$("#elist"); if(!box) return;
  const term=filter.q.trim().toLowerCase();
  if(filter.type==="steps"){
    let st=allSteps(); if(term) st=st.filter(x=>x.t.toLowerCase().includes(term));
    box.innerHTML=st.length?stepsHTML(st):`<div class="empty-card">No steps yet. Add one on Today, pin a SMORP obedience step, or add steps inside an entry.</div>`; return;
  }
  let list=sorted(filter.type);
  if(filter.ids){ const set=new Set(filter.ids); list=list.filter(e=>set.has(e.id)); }
  if(term) list=list.filter(e=>JSON.stringify(e).toLowerCase().includes(term));
  if(!list.length){ box.innerHTML=`<div class="empty-card">${Object.keys(entries).length?"Nothing matches.":"No entries yet. Start one from Today."}</div>`; return; }
  const groups=[]; list.forEach(e=>{ const k=monthKey(e.date); const g=groups[groups.length-1]; if(g&&g.k===k) g.items.push(e); else groups.push({k,items:[e]}); });
  box.innerHTML=groups.map(g=>`<p class="month">${esc(g.k.toUpperCase())}</p>${listHTML(g.items)}`).join("");
}

/* ---------- editors ---------- */
const fid=p=>"f-"+p.replace(/\./g,"-");
function input(label,path,e,o={}){ return `<label class="fld"><span>${label}</span><input type="${o.type||"text"}" id="${fid(path)}" data-f="${path}" value="${esc(getPath(e,path)??"")}" placeholder="${esc(o.ph||"")}"></label>`; }
function area(label,path,e,o={}){ return `<label class="fld">${label?`<span>${label}</span>`:""}<textarea id="${fid(path)}" data-f="${path}" rows="${o.rows||2}" placeholder="${esc(o.ph||"")}"${label?"":` aria-label="${esc(o.aria||o.ph||"")}"`}>${esc(getPath(e,path)??"")}</textarea></label>`; }
function select(label,path,e,opts){ const v=getPath(e,path)||""; return `<label class="fld"><span>${label}</span><select id="${fid(path)}" data-f="${path}"><option value="">Choose</option>${opts.map(o=>`<option${o===v?" selected":""}>${esc(o)}</option>`).join("")}</select></label>`; }
function threadHTML(e){
  const t=e.thread||[];
  return `<div class="thread">${t.length?t.map((l,i)=>`<div class="line${l.r==="G"?" g":""}">
      <button class="role" data-act="role" data-i="${i}" aria-label="Line ${i+1}, ${l.r==="G"?"what I sensed":"me"}. Tap to switch.">${l.r}</button>
      <textarea id="f-thread-${i}" data-f="thread.${i}.t" rows="1" placeholder="${l.r==="G"?"Write what you sense, then weigh it":"Ask or respond to the Lord"}" aria-label="${l.r==="G"?"What I sensed":"My words"}">${esc(l.t)}</textarea>
      <button class="x" data-act="delline" data-i="${i}" aria-label="Remove line ${i+1}">×</button></div>`).join(""):`<div class="legend" style="padding:12px 14px">Begin with a question. Then be quiet, listen, and write what comes.</div>`}</div>
    <div class="btns"><button class="btn sm" data-act="addline" data-r="R">+ R</button><button class="btn sm" data-act="addline" data-r="G">+ G</button><button class="btn sm ghost" data-act="qs">Starter questions</button></div>
    <div class="qsheet" id="qsheet" hidden>${settings.questions.map((q,i)=>`<button data-act="useq" data-i="${i}">${esc(q)}</button>`).join("")}<a class="small" href="#settings">Edit these questions</a></div>
    <p class="legend" style="margin:0"><b>R</b> is you asking or responding. <b class="g">G</b> is what you sensed, kept for weighing.</p>`;
}
const delBtn=`<button class="btn ghost danger" data-act="del">Delete entry</button>`;
function actionsHTML(e){
  const acts=e.actions||[];
  return `<div class="card"><h3 class="sec">NEXT STEPS</h3>
    ${acts.length?`<div class="acts">${acts.map((a,i)=>`<div class="act-row${a.done?" done":""}"><input type="checkbox" id="f-actions-${i}-done" data-f="actions.${i}.done"${a.done?" checked":""} aria-label="Done"><input type="text" id="f-actions-${i}-t" data-f="actions.${i}.t" value="${esc(a.t)}" placeholder="What will you do?" aria-label="Step"><button class="x" data-act="delact" data-i="${i}" aria-label="Remove step">\u00d7</button></div>`).join("")}</div>`:`<p class="legend" style="margin:0">Anything to act on? Steps added here show on Today until you tick them off.</p>`}
    <div class="btns"><button class="btn sm" data-act="addact">+ Add a step</button>${e.type==="journal"?`<button class="btn sm ghost" data-act="fromg">From what I sensed</button>`:""}</div>
    <div class="qsheet" id="gsheet" hidden></div></div>`;
}
function journalHTML(e){
  const c=e.checks||{};
  const ck=(k,l,r)=>`<label class="check"><input type="checkbox" id="f-checks-${k}" data-f="checks.${k}"${c[k]?" checked":""}><span>${l} <span class="ref">${r}</span></span></label>`;
  return `<div class="stack">
    <div><p class="eyebrow">LISTENING PRAYER</p><h2 class="date-line">${esc(e.title||fmtDate(e.date,true))}</h2></div>
    <div class="card"><h3 class="sec">BEGIN WITH THANKS</h3>${area("","praise",e,{ph:"Lord, thank You for...",aria:"Thanks"})}</div>
    <div class="card"><h3 class="sec">LISTEN</h3>${threadHTML(e)}</div>
    ${actionsHTML(e)}
    <div class="card"><h3 class="sec">TEST THIS</h3>
      <div class="checks">${ck("scripture","Nothing here contradicts Scripture read in context.","1 Thess 5:21")}${ck("shepherd","It sounds like the Good Shepherd: gentle, pure, true.","John 10:27")}${ck("alone","I'm not acting on anything weighty alone.","Prov 15:22")}</div>
      <div class="btns"><button class="btn sm" data-act="toweigh">Weigh this further</button></div>
      <details class="more"><summary>More</summary><div class="inside">
        <div class="row2">${input("Date","date",e,{type:"date"})}${input("Title","title",e,{ph:"A few words to find it later"})}</div>
        ${input("Scripture that came to mind","scripture",e,{ph:"e.g. Psalm 32:8"})}
        ${area("Notes: what He taught me, answered prayer","notes",e,{rows:2})}
      </div></details></div>
    ${delBtn}</div>`;
}
function smorpHTML(e){
  const v=settings.version, kinds=e.msgKinds||[], nr=nextReading();
  const suggest=!e.passage&&!nr.done?`<div class="plan-chip"><span>Today's reading: <b>${esc(nr.ref)}</b></span><button class="btn sm" data-act="useplan">Use it</button></div>`:"";
  const thread=e.thread||[];
  return `<div class="stack">
    <div><p class="eyebrow">SMORP · ${esc(fmtDate(e.date).toUpperCase())}</p><h2 class="date-line">${esc(e.passage||"Today's reading")}</h2></div>
    <div class="card">${suggest}${input("Passage","passage",e,{ph:"e.g. John 15:1-17"})}${e.passage?`<a href="${bgLink(e.passage,v)}" target="_blank" rel="noopener">Read ${esc(e.passage)} (${esc(v)})</a>`:""}</div>
    <div class="card"><div class="smorp">
      <div class="cap">S</div><div class="body"><b>SCRIPTURE</b><em>The verse or phrase that stood out.</em>${area("","standout",e,{aria:"Scripture that stood out"})}</div>
      <div class="cap">M</div><div class="body"><b>MESSAGE</b><em>What you notice, and what He may be saying.</em>
        <div class="chips">${MSG_KINDS.map(k=>`<button class="chip" data-act="kind" data-k="${k}" aria-pressed="${kinds.includes(k)}">${k}</button>`).join("")}</div>${area("","message",e,{rows:3,aria:"Message"})}</div>
      <div class="cap">O</div><div class="body"><b>OBEDIENCE</b><em>One step for today or this week.</em>${area("","obedience",e,{aria:"Obedience"})}<label class="check small"><input type="checkbox" id="f-obeyPin" data-f="obeyPin"${e.obeyPin?" checked":""}><span>Show this step on Today${e.obeyDone?" (done)":""}</span></label></div>
      <div class="cap">R</div><div class="body"><b>REPENTANCE</b><em>Confession, and how you are turning.</em>${area("","repentance",e,{aria:"Repentance"})}</div>
      <div class="cap">P</div><div class="body"><b>PRAYER</b><em>Thanks, and what He lays on your heart.</em>${area("","prayer",e,{rows:3,aria:"Prayer"})}</div>
    </div>
    <p class="credit">The SMORP devotional tool was developed by <b>Pastor Stephan of Church Renewal International</b>. Used with gratitude.</p>
    <details class="more"${thread.some(l=>l.t)?" open":""}><summary>Listen from this passage</summary><div class="inside">${threadHTML(e)}</div></details>
    <details class="more"><summary>More</summary><div class="inside"><div class="row2">${input("Date","date",e,{type:"date"})}${input("Memory verse","memory",e,{ph:"Reference"})}</div></div></details>
    </div>${delBtn}</div>`;
}
function segHTML(k,cur){ return `<div class="seg" role="group" aria-label="Answer">${[["pass","Yes"],["unclear","?"],["fail","No"]].map(([v,l])=>`<button data-act="test" data-k="${k}" data-v="${v}" aria-pressed="${cur===v}" aria-label="${l==="?"?"Unclear":l}">${l}</button>`).join("")}</div>`; }
function weighHTML(e){
  const t=e.tests||{}, val=k=>(t[k]&&t[k].v)||"", note=k=>(t[k]&&t[k].n)||"";
  const stakes=e.stakes||"everyday", o=e.outcome||{};
  const gate=TESTS.filter(x=>x.gate).map(x=>`<div class="test"><div class="test-head"><div class="q"><b>${esc(x.t)}</b><span class="ref">${esc(x.r)}</span></div>${segHTML(x.k,val(x.k))}</div><input type="text" id="f-tests-${x.k}-n" data-f="tests.${x.k}.n" value="${esc(note(x.k))}" placeholder="Passage or note"></div>`).join("");
  const rest=TESTS.filter(x=>!x.gate).map(x=>`<div class="test"><div class="test-head"><button class="tname q" data-act="tinfo" data-k="${x.k}" aria-expanded="false">${esc(x.name)}<small>${note(x.k)?esc(note(x.k)):"Tap for the question"}</small></button>${segHTML(x.k,val(x.k))}</div>
      <div class="tdetail" id="td-${x.k}" hidden><span>${esc(x.t)} ${esc(x.s)} <span class="ref">${esc(x.r)}</span></span><input type="text" id="f-tests-${x.k}-n" data-f="tests.${x.k}.n" value="${esc(note(x.k))}" placeholder="Note: person, passage, what you observed"></div></div>`).join("");
  const v=verdict(e);
  return `<div class="stack">
    <div><p class="eyebrow">WEIGH A WORD · ${esc(fmtDate(e.date).toUpperCase())}</p><h2 class="date-line">${esc(e.question||"A matter to weigh")}</h2></div>
    <div class="card">
      ${input("What am I asking the Lord?","question",e,{ph:"Write the question plainly"})}
      ${area("What I sensed","what",e,{rows:2})}
      <div class="fld"><span>How weighty is this decision?</span><div class="seg" role="group" aria-label="Stakes">${STAKES.map(([k,l])=>`<button data-act="stake" data-k="${k}" data-v="stake" aria-pressed="${stakes===k}">${l}</button>`).join("")}</div></div>
    </div>
    <div class="card">
      <h3 class="sec">MUST PASS</h3><div class="gate">${gate}</div>
      <h3 class="sec">THEN WEIGH</h3><div class="tlist">${rest}</div>
      <div class="verdict" id="verdict" data-v="${v.v}"><b>${esc(v.label)}</b><p>${esc(v.text)}</p></div>
    </div>
    ${actionsHTML(e)}
    <div class="card flat">
      <details class="more"${o.acted&&o.acted!=="Not yet"?" open":""}><summary>Outcome</summary><div class="inside">
        <div class="row2">${select("Did I act on it?","outcome.acted",e,["Not yet","Yes","Chose not to"])}${input("Date acted","outcome.date",e,{type:"date"})}</div>
        ${area("What happened","outcome.result",e)}${area("Fruit and lessons about hearing Him","outcome.lesson",e)}</div></details>
      <details class="more"><summary>How and when it came</summary><div class="inside">
        <div class="row2">${select("How it came","how",e,HOW)}${select("Area of life","area",e,AREAS)}</div>
        ${input("Details","howNote",e)}${input("Timing sensed","when",e,{ph:"Now, later, a season, unclear"})}${input("Date","date",e,{type:"date"})}</div></details>
    </div>${delBtn}</div>`;
}
function repaintVerdict(e){ const v=verdict(e), el=$("#verdict"); if(!el) return; el.dataset.v=v.v; el.innerHTML=`<b>${esc(v.label)}</b><p>${esc(v.text)}</p>`; }

/* ---------- settings ---------- */
function settingsHTML(){
  const p=PLANS.find(x=>x.key===settings.plan)||PLANS[0];
  const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone;
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  const install=standalone?"":`<div class="card"><h3 class="sec">INSTALL ON THIS DEVICE</h3>${installEvt?`<p class="muted" style="margin:0">Add the journal to your home screen so it opens like an app.</p><div class="btns"><button class="btn primary" data-act="install">Install app</button></div>`:ios?`<p style="margin:0">In Safari, tap the <b>Share</b> button, then <b>Add to Home Screen</b>. It will open full screen like an app.</p>`:`<p style="margin:0">Open your browser's menu and choose <b>Install app</b> or <b>Add to Home Screen</b>.</p>`}</div>`;
  return `<div class="stack"><h2 class="big">Settings</h2>
    <div class="card"><h3 class="sec">ACCOUNT</h3>
      <div class="set-row"><span style="min-width:0;overflow-wrap:anywhere">${esc(user.email)}</span>${B.kind==="firebase"?(user.verified?`<span class="pill" data-v="go">VERIFIED</span>`:`<button class="btn sm" data-act="resend">Verify email</button>`):`<span class="pill">DEMO</span>`}</div>
      <details class="more"><summary>Change password</summary><div class="inside">
        <label class="fld"><span>Current password</span><input type="password" id="cp-old" autocomplete="current-password"></label>
        <label class="fld"><span>New password (at least 8 characters)</span><input type="password" id="cp-new" autocomplete="new-password"></label>
        <div class="btns"><button class="btn" data-act="chpw">Change password</button></div></div></details>
      <div class="btns"><button class="btn" data-act="signout">Sign out</button></div></div>
    ${install}
    <div class="card"><h3 class="sec">BIBLE</h3><label class="fld"><span>Translation for reading links</span><select id="s-version" data-s="version">${VERSIONS.map(x=>`<option${x===settings.version?" selected":""}>${x}</option>`).join("")}</select></label></div>
    <div class="card"><h3 class="sec">READING PLAN</h3>
      <label class="fld"><span>Plan for SMORP</span><select id="s-plan" data-s="plan">${PLANS.map(x=>`<option value="${x.key}"${x.key===p.key?" selected":""}>${esc(x.title)}</option>`).join("")}</select></label>
      <ul class="days">${p.days.map((d,i)=>{const k=p.key+"-"+i;return `<li><input type="checkbox" id="rd-${k}" data-read="${k}"${settings.readings[k]?" checked":""} aria-label="Mark ${esc(d)} read"><span class="n">Day ${i+1}</span><a href="${bgLink(d,settings.version)}" target="_blank" rel="noopener">${esc(d)}</a></li>`;}).join("")}</ul>
      <p class="muted small" style="margin:0">Starting a SMORP from Today's reading marks that day read.</p></div>
    <div class="card"><h3 class="sec">STARTER QUESTIONS</h3>
      <ul class="qlist">${settings.questions.map((q,i)=>`<li><span>${esc(q)}</span><button class="btn sm ghost danger" data-act="delq" data-i="${i}" aria-label="Remove question">Remove</button></li>`).join("")}</ul>
      <div class="row2"><input type="text" id="newq" placeholder="Add your own question" aria-label="New question"></div>
      <div class="btns"><button class="btn sm" data-act="addq">Add question</button><button class="btn sm ghost" data-act="resetq">Restore defaults</button></div></div>
    <div class="card"><h3 class="sec">KEEPS COMING UP</h3>
      ${(settings.hiddenThemes||[]).length?`<p class="muted small" style="margin:0">Hidden from Today:</p><ul class="qlist">${settings.hiddenThemes.map((h,i)=>`<li><span>${esc(h)}</span><button class="btn sm ghost" data-act="unhide" data-i="${i}">Show again</button></li>`).join("")}</ul>`:`<p class="muted small" style="margin:0">Tap the \u00d7 beside a word on Today to hide it, for example a name you write often. Hidden words are listed here.</p>`}</div>
    <div class="card"><h3 class="sec">BACKUP</h3>
      <p class="muted" style="margin:0">Your journal is saved to your account automatically. A backup file is extra peace of mind, and also brings entries over from the earlier version in Claude.</p>
      <div class="btns"><button class="btn" data-act="export">Download backup</button><label class="btn" for="imfile">Restore from file</label><input type="file" id="imfile" accept=".json,application/json" hidden></div></div>
    <div class="card"><h3 class="sec">PRIVACY</h3>
      <p style="margin:0" class="small">Entries are stored in Google Firebase in Canada (Montréal) under your account. Security rules let only you read or change them. The person who runs this app's Firebase project administers the database and could technically access it, so share sign-up only with people who know and trust that arrangement. Deleting your account erases your entries.</p></div>
    <div class="card danger-zone"><h3 class="sec">DELETE ACCOUNT</h3>
      <details class="more"><summary>Delete my account and all entries</summary><div class="inside">
        <p class="small" style="margin:0">This permanently erases your account and every entry. Download a backup first if you want to keep anything.</p>
        <label class="fld"><span>Enter your password to confirm</span><input type="password" id="del-pw" autocomplete="current-password"></label>
        <div class="btns"><button class="btn danger" data-act="delacct">Delete forever</button></div></div></details></div>
    <p class="muted small" style="text-align:center">Listening Prayer Journal ${VERSION}<br>SMORP devotional tool by Pastor Stephan, Church Renewal International.</p></div>`;
}

/* ================= events ================= */
function curEntry(){ return route.name==="entry"?entries[route.id]:null; }
document.addEventListener("submit",ev=>{
  if(ev.target.id==="auth-form"){ ev.preventDefault(); submitAuth(); }
  if(ev.target.id==="addstep"){ ev.preventDefault(); const inp=$("#newstep"), t=inp.value.trim(); if(!t) return;
    const e={id:newId(),type:"task",t,done:false,doneAt:0,date:today(),createdAt:Date.now()}; touch(e); inp.value=""; inp.blur(); renderMain(); toast("Step added"); }
});
document.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-act]"); if(!b) return;
  const a=b.dataset.act, e=curEntry();
  switch(a){
    case "amode": { authMode=b.dataset.m; authErr=""; authInfo=""; const em=$("#a-email"); if(em) authEmail=em.value; render(); break; }
    case "showpw": { const i=$("#a-pw"); i.type=i.type==="password"?"text":"password"; b.textContent=i.type==="password"?"Show":"Hide"; break; }
    case "new": {
      if(b.dataset.type==="smorp"){ const nr=nextReading(); const seed={}; if(!nr.done){ seed.passage=nr.ref; seed.planDay=nr.plan.key+"-"+nr.i; settings.readings[seed.planDay]=true; touchSettings(); } newEntry("smorp",seed); }
      else newEntry(b.dataset.type); break; }
    case "open": location.hash="#entry/"+b.dataset.id; break;
    case "back": location.hash=lastList; break;
    case "filter": filter.type=b.dataset.t; $$(".chips .chip").forEach(c=>c.setAttribute("aria-pressed",c.dataset.t===filter.type)); renderEntryList(); break;
    case "del":
      if(!e) break;
      if(b.dataset.armed){ const id=e.id; removeEntry(id); toast("Entry deleted"); location.hash=lastList; }
      else { b.dataset.armed="1"; b.textContent="Tap again to delete"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.armed; b.textContent="Delete entry"; } },4000); }
      break;
    case "addline": if(!e) break; e.thread=e.thread||[]; e.thread.push({r:b.dataset.r,t:""}); touch(e); renderMain(); focusLast(); break;
    case "delline": if(!e) break; e.thread.splice(+b.dataset.i,1); touch(e); renderMain(); break;
    case "role": if(!e) break; { const l=e.thread[+b.dataset.i]; l.r=l.r==="G"?"R":"G"; touch(e); renderMain(); } break;
    case "qs": { const s=$("#qsheet"); s.hidden=!s.hidden; break; }
    case "useq": if(!e) break; { const q=settings.questions[+b.dataset.i]; e.thread=e.thread||[]; const last=e.thread[e.thread.length-1]; if(last&&last.r==="R"&&!last.t) last.t=q; else e.thread.push({r:"R",t:q}); e.thread.push({r:"G",t:""}); touch(e); renderMain(); focusLast(); } break;
    case "toweigh": if(!e) break; {
      const gs=(e.thread||[]).filter(l=>l.r==="G"&&l.t).map(l=>l.t).join(" "), rq=(e.thread||[]).find(l=>l.r==="R"&&l.t);
      flush(e.id); newEntry("weigh",{question:rq?rq.t:"",what:gs,how:"Quiet impression or thought",howNote:"From listening prayer on "+fmtDate(e.date),tests:e.scripture?{scripture:{v:"",n:e.scripture}}:{}});
      toast("New matter to weigh"); } break;
    case "useplan": if(!e) break; { const nr=nextReading(); if(nr.done) break; e.passage=nr.ref; e.planDay=nr.plan.key+"-"+nr.i; settings.readings[e.planDay]=true; touchSettings(); touch(e); renderMain(); } break;
    case "kind": if(!e) break; { const s=new Set(e.msgKinds||[]); s.has(b.dataset.k)?s.delete(b.dataset.k):s.add(b.dataset.k); e.msgKinds=[...s]; touch(e); b.setAttribute("aria-pressed",s.has(b.dataset.k)); } break;
    case "test": if(!e) break; {
      const k=b.dataset.k; e.tests=e.tests||{}; e.tests[k]=e.tests[k]||{v:"",n:""};
      e.tests[k].v=e.tests[k].v===b.dataset.v?"":b.dataset.v; touch(e);
      $$(`[data-act=test][data-k=${k}]`).forEach(x=>x.setAttribute("aria-pressed",x.dataset.v===e.tests[k].v)); repaintVerdict(e); } break;
    case "stake": if(!e) break; e.stakes=b.dataset.k; touch(e); $$("[data-act=stake]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.k===e.stakes)); repaintVerdict(e); break;
    case "tinfo": { const d=$("#td-"+b.dataset.k); d.hidden=!d.hidden; b.setAttribute("aria-expanded",!d.hidden); break; }
    case "deltask": { const id=b.dataset.id; removeEntry(id); renderMain(); toast("Step removed"); break; }
    case "addact": if(!e) break; e.actions=e.actions||[]; e.actions.push({id:actId(),t:"",done:false,doneAt:0,createdAt:Date.now()}); touch(e); renderMain(); { const ins=$$("#main .act-row input[type=text]"); ins[ins.length-1]&&ins[ins.length-1].focus(); } break;
    case "delact": if(!e) break; e.actions.splice(+b.dataset.i,1); touch(e); renderMain(); break;
    case "fromg": { if(!e) break; const g=$("#gsheet"); if(!g.hidden){ g.hidden=true; break; }
      const gs=(e.thread||[]).filter(l=>l.r==="G"&&l.t&&l.t.trim());
      if(!gs.length){ toast("Write what you sensed in a G line first."); break; }
      g.innerHTML=`<p class="legend" style="margin:0 6px">Tap a line to make it a step:</p>`+gs.map(l=>`<button data-act="gstep" data-t="${esc(l.t)}">${esc(l.t)}</button>`).join(""); g.hidden=false; break; }
    case "gstep": if(!e) break; e.actions=e.actions||[]; e.actions.push({id:actId(),t:b.dataset.t,done:false,doneAt:0,createdAt:Date.now()}); touch(e); renderMain(); toast("Added to Next steps"); break;
    case "theme": filter={q:"",type:"all",ids:(b.dataset.ids||"").split(",").filter(Boolean),label:b.dataset.label}; location.hash="#entries"; break;
    case "clearids": filter.ids=null; filter.label=""; renderMain(); break;
    case "hidetheme": { const q=b.dataset.q; settings.hiddenThemes=settings.hiddenThemes||[]; if(!settings.hiddenThemes.includes(q)) settings.hiddenThemes.push(q); touchSettings(); renderMain(); toast("Hidden. You can show it again in Settings."); break; }
    case "unhide": settings.hiddenThemes.splice(+b.dataset.i,1); touchSettings(); renderMain(); break;
    case "resend": try{ await B.resendVerification(); toast("Verification email sent. Check your inbox."); }catch(err){ toast(authMessage(err)); } break;
    case "recheck": { const u=await B.refreshUser(); if(u){ user=u; } toast(user.verified?"Email verified. Thank you.":"Not verified yet. Open the link in the email first."); renderMain(); break; }
    case "signout": flushAll(); stopData(); await B.signOut(); break;
    case "chpw": { const o=$("#cp-old").value, n=$("#cp-new").value; if(n.length<8){ toast("Choose a new password with at least 8 characters."); break; } try{ await B.changePassword(o,n); toast("Password changed"); $("#cp-old").value=""; $("#cp-new").value=""; }catch(err){ toast(authMessage(err)); } break; }
    case "install": if(installEvt){ installEvt.prompt(); installEvt=null; renderMain(); } break;
    case "delq": settings.questions.splice(+b.dataset.i,1); touchSettings(); renderMain(); break;
    case "addq": { const v=$("#newq").value.trim(); if(!v) break; settings.questions.push(v); touchSettings(); renderMain(); toast("Question added"); break; }
    case "resetq": settings.questions=DEFAULT_QS.slice(); touchSettings(); renderMain(); break;
    case "export": exportBackup(); break;
    case "delacct": {
      const pw=$("#del-pw").value; if(!pw&&B.kind==="firebase"){ toast("Enter your password to confirm."); break; }
      if(!b.dataset.armed){ b.dataset.armed="1"; b.textContent="Tap again to erase everything"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.armed; b.textContent="Delete forever"; } },5000); break; }
      try{ b.disabled=true; b.textContent="Deleting"; stopData(); await B.deleteAccount(pw); toast("Your account and entries were deleted."); }
      catch(err){ toast(authMessage(err)); b.disabled=false; b.textContent="Delete forever"; delete b.dataset.armed; if(user) startData(); }
      break; }
  }
});
function focusLast(){ const ts=$$("#main .line textarea"); const t=ts[ts.length-1]; if(t){ t.focus(); } }
document.addEventListener("input",ev=>{
  const t=ev.target;
  if(t.dataset.f&&t.type!=="checkbox"){ const e=curEntry(); if(!e) return; setPath(e,t.dataset.f,t.value); touch(e); if(t.tagName==="TEXTAREA") grow(t); return; }
  if(t.id==="q"){ filter.q=t.value; renderEntryList(); return; }
});
document.addEventListener("change",ev=>{
  const t=ev.target;
  if(t.dataset.step){ toggleStep(t.dataset.step,t.checked); const li=t.closest(".step"); if(li) li.classList.toggle("done",t.checked); return; }
  if(t.dataset.f&&(t.type==="checkbox"||t.tagName==="SELECT"||t.type==="date")){ const e=curEntry(); if(!e) return; setPath(e,t.dataset.f,t.type==="checkbox"?t.checked:t.value);
    const m=t.dataset.f.match(/^actions\.(\d+)\.done$/); if(m){ e.actions[+m[1]].doneAt=t.checked?Date.now():0; const r=t.closest(".act-row"); if(r) r.classList.toggle("done",t.checked); }
    touch(e); return; }
  if(t.dataset.s){ settings[t.dataset.s]=t.value; touchSettings(); renderMain(); return; }
  if(t.dataset.read){ settings.readings[t.dataset.read]=t.checked; touchSettings(); return; }
  if(t.id==="imfile"&&t.files&&t.files[0]){ const r=new FileReader(); r.onload=()=>importBackup(String(r.result)); r.readAsText(t.files[0]); t.value=""; }
});
document.addEventListener("keydown",ev=>{
  const t=ev.target;
  if(ev.key==="Enter"&&(ev.ctrlKey||ev.metaKey)&&t.closest&&t.closest(".line")){
    ev.preventDefault(); const e=curEntry(); if(!e) return; const i=+t.dataset.f.split(".")[1];
    e.thread.splice(i+1,0,{r:e.thread[i].r==="R"?"G":"R",t:""}); touch(e); renderMain(); const ts=$$("#main .line textarea"); ts[i+1]&&ts[i+1].focus();
  }
  if(ev.key==="Enter"&&t.id==="newq"){ ev.preventDefault(); $("[data-act=addq]").click(); }
});
window.addEventListener("beforeinstallprompt",ev=>{ ev.preventDefault(); installEvt=ev; if(route.name==="settings") renderMain(); });

/* ================= backup ================= */
function exportBackup(){
  const data=JSON.stringify({app:"listening-prayer-journal",version:2,exported:new Date().toISOString(),entries:Object.values(entries),settings},null,2);
  const blob=new Blob([data],{type:"application/json"}), url=URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download="listening-prayer-journal-"+today()+".json"; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),4000); toast("Backup downloaded");
}
function importBackup(text){
  let o; try{ o=JSON.parse(text); }catch(err){ toast("That file isn't a journal backup."); return; }
  const list=Array.isArray(o.entries)?o.entries:[]; let n=0;
  list.forEach(x=>{
    if(!x||!x.id||!/^e-/.test(x.id)||!TYPE[x.type]) return;
    const e={}; for(const k in x){ if(k[0]!=="_") e[k]=x[k]; }
    const cur=entries[e.id]; if(cur&&(cur.updatedAt||0)>=(e.updatedAt||0)) return;
    e.updatedAt=e.updatedAt||Date.now(); entries[e.id]=e; B.saveEntry(user.uid,e).catch(()=>{}); n++;
  });
  if(o.settings&&typeof o.settings==="object"){
    const s=o.settings;
    if(Array.isArray(s.questions)&&s.questions.length) settings.questions=s.questions;
    if(VERSIONS.includes(s.version)) settings.version=s.version;
    if(s.readings&&typeof s.readings==="object") settings.readings=Object.assign({},s.readings,settings.readings);
    touchSettings();
  }
  toast(n?`Restored ${n} ${n===1?"entry":"entries"}`:"Nothing new to restore"); renderMain();
}

/* ================= boot ================= */
(async function boot(){
  route=parseRoute(); if(route.name!=="entry") lastList="#"+route.name;
  try{ B=await createBackend(); }
  catch(err){ $("#app").innerHTML=`<div class="auth gut"><div class="auth-card"><h1><b>Listening</b> Prayer Journal</h1><div class="err">Couldn't start. Check your connection and reload. (${esc(err.message||err)})</div></div></div>`; return; }
  B.onAuth(u=>{
    const was=user&&user.uid; user=u;
    if(u&&u.uid!==was){ authBusy=false; authErr=""; startData(); }
    if(!u){ stopData(); if(route.name==="entry"){ history.replaceState(null,"","#today"); route={name:"today"}; } }
    render();
  });
  if("serviceWorker" in navigator&&location.protocol==="https:") navigator.serviceWorker.register("sw.js").catch(()=>{});
})();
