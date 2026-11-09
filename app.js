import { createBackend, authMessage, isConfigured } from "./backend.js";
import { findThemes } from "./themes.js";
import { LESSONS, QUICK } from "./learn.js";
import { JOURNEYS } from "./journeys.js";
import { NATIVE, nativeShare, reminderGet, reminderSet } from "./native.js";

// Editions: the iPhone app launches as Version 1 (prayer and listening: RHEMA, reading plans and sermon prep come later).
// The web app stays full. Add ?edition=v1 to the address to preview Version 1 in a browser, ?edition=full to go back.
const EDITION = (()=>{ let q=null; try{ q=new URLSearchParams(location.search).get("edition"); if(q==="v1"||q==="full") localStorage.setItem("akouo.edition",q); else q=localStorage.getItem("akouo.edition"); }catch(e){} return q||(NATIVE?"v1":"full"); })();
const V1 = EDITION==="v1";

const VERSION = "3.12.0";

/* ================= content ================= */
// Earlier default questions, swapped for the new set if never edited.
const OLD_QS = ["Lord, what do You want me to know about how You see me today?","What are You inviting me into this week?","Is there anything standing between You and me right now?","Is there something I need to confess, to You or to someone else?","Who do You want me to encourage, and how?","Who do You want me to pray for today? What should I pray?","What would You like me to stop doing? What would You like me to start?","How do You want me to order my time with You each day?","What should I pray for my marriage and family?","Is there a question You would like me to ask You?"];
const DEFAULT_QS = [
  "Lord, what are You saying to me through today's reading?",
  "Father, how do You see me right now?",
  "Jesus, what do You want me to receive from You today?",
  "Holy Spirit, is there anything You want to bring into the light?",
  "Who is on Your heart that should be on mine today?",
  "How do You want me to pray for my church this week?",
  "What step of obedience have I been putting off?",
  "Where do You want me to slow down and rest?",
  "What lie have I been believing, and what is Your truth?",
  "Is there someone I need to forgive, or ask forgiveness from?",
  "How can I love my family well this week?"
];
const AREAS = ["Walk with God","Marriage","Children and family","Church and ministry","Calling and gifts","Work and finances","Health and healing","Relationships","Evangelism","Time, rest and schedule","Community and nation","Understanding Scripture","Other"];
const HOW = ["While reading Scripture","Quiet impression or thought","Picture, dream or vision","Through another person","Through circumstances","During worship or prayer","Other"];
// What Scripture does in us (2 Tim 3:16; Rom 15:4).
const MSG_KINDS = ["Teaching","Reproof","Correction","Training","Promise","Comfort"];
// RHEMA Examine: the same basic tests for every believer, every time (1 Cor 10:12).
// "christ" and "whole" are the Confession and Scripture tests from the seven tests, applied to a daily reading.
const EXAM = [
  {k:"plain",short:"Plain sentence",q:"I can say what I heard in one plain sentence.",how:"If you can't say it simply, it isn't ready to test. Rewrite it under Hear until it is one clear sentence.",r:"Habakkuk 2:2"},
  {k:"context",short:"In context",q:"It fits what this passage meant to the people it was first written to.",how:"Read the verses before and after. Ask who this was written to and what it meant to them. Does what you heard fit that meaning, or stretch it?",r:"2 Timothy 2:15; Nehemiah 8:8"},
  {k:"christ",short:"Honours Christ",tag:"Confession test",q:"It honours Jesus and draws me toward Him.",how:"The Spirit always points to Christ. A word that puts me at the centre, or quietly makes Him smaller, fails here.",r:"John 16:14; 1 John 4:1-3"},
  {k:"whole",short:"Whole Bible agrees",tag:"Scripture test",q:"The rest of the Bible agrees with it.",how:"Check your Bible's cross-references. Is there a clear passage that says the opposite? Let the clear verses explain the unclear ones.",r:"Acts 17:11; Isaiah 8:20"},
  {k:"fruit",short:"Good fruit",q:"It leads toward love, holiness and peace, not fear, pride or hurry.",how:"God's wisdom is pure, peaceable and gentle. Condemnation, panic and flattery are warning signs.",r:"James 3:17; Romans 8:1"}
];
const EXAM_DEEP = [
  "What kind of writing is this: story, law, poetry, prophecy, Gospel or letter?",
  "Is the passage describing what happened, or telling God's people what to do?",
  "Whose promise is it: given to all believers, or spoken to one person in the story?",
  "Where does this passage sit in the whole story of the Bible, and how does Jesus fulfil it?",
  "Am I hearing the text, or a sermon, a teacher or a habit I already carry?"
];
const EXAM_NEW = [
  "Stay with the plain meaning. If you need a clever reading to get your impression out of the verse, set it aside.",
  "\"Not sure\" is a good answer. Hold it loosely and don't act on it alone.",
  "Act on what the passage clearly says. Its comfort, correction and commands are for today.",
  "Before acting on anything new or directional, talk it over with your pastor or a mature believer.",
  "The less certain you are, the smaller the step.",
  "No fear. Jesus promised His sheep would hear Him, and when we mishear, He corrects without condemning. John 10:27; Romans 8:1",
  "Discernment grows by practice, one reading at a time. Hebrews 5:14"
];
const EXAM_SEASONED = [
  "Familiar passages are where we stop reading carefully. Read it as if for the first time.",
  "Experience is not one of the tests. The Word is.",
  "Watch for hearing what confirms a plan you already wanted.",
  "Let someone younger in the faith ask you how you tested it.",
  "\"Let anyone who thinks that he stands take heed lest he fall.\" 1 Corinthians 10:12; Galatians 6:1"
];
// Seven tests, from Pastor Barry's paper on discernment, grouped by who runs them.
const TESTS = [
  {k:"confession",n:1,group:"word",name:"Confession",t:"Does it honour Jesus Christ come in the flesh, and draw you toward Him?",s:"Whatever does not confess Jesus as Lord is not from God.",r:"1 John 4:1-3; 1 Cor 12:3"},
  {k:"scripture",n:2,group:"word",name:"Scripture",t:"Does it agree with what God has already said in His Word?",s:"A word fails this test even if a sign comes with it or it seems to come true.",r:"Deut 13:1-5; Deut 18:21-22"},
  {k:"fruit",n:3,group:"time",name:"Fruit",t:"Over time, what is it producing in you and around you?",s:"Love, joy, peace and holiness, or division, pride and fear?",r:"Matt 7:15-20; Gal 5:22-23"},
  {k:"selfcontrol",n:4,group:"body",name:"Submission and self-control",t:"Does it leave you free to pause, wait and submit it, or does it press and compel?",s:"The spirits of prophets are subject to prophets. God is not a God of confusion.",r:"1 Cor 14:32-33"},
  {k:"edification",n:5,group:"body",name:"Edification",t:"Will acting on it build up, encourage and comfort, you and others?",s:"Everything is to be done for building up.",r:"1 Cor 14:3, 26"},
  {k:"body",n:6,group:"body",name:"Body discernment",t:"Have mature believers with discernment weighed it with you?",s:"Spouse, pastor, elders or trusted friends who love God and will be honest.",r:"1 Cor 12:10; 1 Cor 14:29"},
  {k:"trajectory",n:7,group:"time",name:"Lifestyle and doctrinal trajectory",t:"Where is it heading: toward holiness and sound teaching, or slowly away?",s:"Watch the direction of life and doctrine, not just the moment.",r:"1 Tim 4:16; Heb 13:7-9"}
];
const LEGACY_TEST = {confession:"christ",selfcontrol:"tone",body:"counsel"};
const STAKES = [["everyday","Everyday"],["significant","Significant"],["life","Life-shaping"]];
const VERSIONS = ["NIV","NKJV","ESV","NLT","KJV","NASB","CSB"];
const chapters = (book,n) => Array.from({length:n},(_,i)=>book+" "+(i+1));
const PLANS = [
  {key:"found",title:"Foundations of the faith",level:"Start here",desc:"Ten readings on who God is, what Jesus did, and how to walk with Him.",days:["Genesis 1","Psalm 103","John 3:1-21","Romans 3:21-26","Romans 5:1-11","Ephesians 2:1-10","Romans 6:1-14","Romans 8:1-17","Acts 2:36-47","Matthew 28:16-20"]},
  {key:"mark",title:"Mark, a chapter a day",level:"Start here",desc:"The shortest Gospel. Meet Jesus in sixteen days.",days:chapters("Mark",16)},
  {key:"voice",title:"The Shepherd's voice",level:"Start here",desc:"A week in John 10 and the Shepherd psalms.",days:["John 10:1-10","John 10:11-18","John 10:22-30","Psalm 23","Ezekiel 34:11-16","1 Peter 2:21-25","Hebrews 13:20-21"]},
  {key:"trust",title:"Psalms of trust",level:"Start here",desc:"Seven psalms for anxious or weary seasons.",days:["Psalm 16","Psalm 27","Psalm 46","Psalm 62","Psalm 91","Psalm 131","Psalm 139"]},
  {key:"mount",title:"The Sermon on the Mount",level:"Deeper",desc:"Jesus' teaching on the life of the kingdom, in seven readings.",days:["Matthew 5:1-12","Matthew 5:13-20","Matthew 5:21-48","Matthew 6:1-18","Matthew 6:19-34","Matthew 7:1-12","Matthew 7:13-29"]},
  {key:"phil",title:"Philippians in a week",level:"Deeper",desc:"Joy, humility and pressing on, a passage a day.",days:["Philippians 1:1-11","Philippians 1:12-30","Philippians 2:1-11","Philippians 2:12-30","Philippians 3:1-11","Philippians 3:12-21","Philippians 4:1-23"]},
  {key:"hear",title:"Learning to hear",level:"Deeper",desc:"How God spoke to Samuel, Elijah, Peter and Paul.",days:["1 Samuel 3:1-10","1 Samuel 3:11-21","1 Kings 19:1-8","1 Kings 19:9-18","Isaiah 30:15-21","John 16:7-15","Acts 10:9-23","Acts 16:6-10","1 Thessalonians 5:16-24"]},
  {key:"test",title:"Testing what you hear",level:"Deeper",desc:"The Scriptures behind the seven tests.",days:["1 John 4:1-6","Deuteronomy 13:1-5","Deuteronomy 18:15-22","Matthew 7:15-23","1 Corinthians 12:1-11","1 Corinthians 14:26-33","Galatians 5:16-26"]},
  {key:"john",title:"John, a chapter a day",level:"Deeper",desc:"The Gospel of belief, in twenty-one days.",days:chapters("John",21)}
];
// "smorp" is the stored type key for the RHEMA devotional (kept so earlier entries still open).
const TYPE = {journal:{label:"Listen",glyph:"L"},smorp:{label:"RHEMA",glyph:"R"},weigh:{label:"Weigh",glyph:"W"},task:{label:"Step",glyph:"✓"},prayer:{label:"Prayer",glyph:"P"},whisper:{label:"Whisper",glyph:"W"},stone:{label:"Stone",glyph:"S"},selah:{label:"Selah",glyph:"S"}};
const PRAYER_CATS = ["Family","Church","Friends","Ministry","Personal","Healing","Salvation","Nations","Other"];
const FREQS = [["daily","Every day"],["sun","Sundays"],["mon","Mondays"],["tue","Tuesdays"],["wed","Wednesdays"],["thu","Thursdays"],["fri","Fridays"],["sat","Saturdays"],["led","As I'm led"]];
const DOW = ["sun","mon","tue","wed","thu","fri","sat"];
const LIST_TYPES = ["journal","smorp","weigh"];
const ROLE = {R:"Me",G:"Listening"};
const DEFAULT_SETTINGS = {version:"NIV",questions:DEFAULT_QS.slice(),plan:"voice",readings:{},hiddenThemes:[],journey:null,journeysDone:[],guideCollapsed:false,readMode:"",ownBook:""};

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
  today:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  prayer:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>',
  walk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21c2.5-1.5 2-4.5 5-6s6.5-1.5 7.5-4.5S16 5.5 19 4"/><circle cx="19" cy="4" r="1.2" fill="currentColor"/><circle cx="5" cy="21" r="1.2" fill="currentColor"/></svg>',
  learn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2Z"/><path d="M22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7Z"/></svg>',
  entries:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>',
  settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>'
};

/* ================= state ================= */
let B = null, user = null;
let entries = {}, settings = clone(DEFAULT_SETTINGS);
let unsubE = null, unsubS = null, loaded = false;
const dirty = new Set(), timers = {};
let settingsDirty = false, settingsTimer = null, serverPending = false;
let route = {name:"today"}, lastList = "#today", plansReturn = "#today";
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
  unsubS=B.watchSettings(user.uid,s=>{ if(settingsDirty) return; settings=Object.assign(clone(DEFAULT_SETTINGS),s||{}); if(!Array.isArray(settings.questions)||JSON.stringify(settings.questions)===JSON.stringify(OLD_QS)) settings.questions=DEFAULT_QS.slice(); onData(); });
}
function stopData(){ unsubE&&unsubE(); unsubS&&unsubS(); unsubE=unsubS=null; entries={}; loaded=false; settings=clone(DEFAULT_SETTINGS); }
function onData(){
  if(!user) return;
  const main=$("main"), ae=document.activeElement, typing=main&&main.contains(ae)&&((ae.tagName==="INPUT"&&ae.type!=="checkbox")||ae.tagName==="TEXTAREA"||ae.tagName==="SELECT");
  if(route.name==="journey"&&jt.run) return;
  if(route.name==="pray"){ if(!pray.queue.length&&!pray.i&&loaded){ startPray(); renderMain(); } return; }
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
  if(e.type==="prayer") return e.title||"Untitled request";
  return e.question||e.what||"Untitled matter";
}
function isBlank(e){
  if(e.type==="stone") return !((e.title||"").trim()||(e.detail||"").trim());
  if(e.type==="prayer") return !((e.title||"").trim()||(e.details||"").trim()||(e.thread||[]).some(l=>l.t&&l.t.trim()));
  const strs=[e.title,e.praise,e.scripture,e.notes,e.memory,e.standout,e.message,e.obedience,e.repentance,e.prayer,e.question,e.what,e.howNote,e.when];
  if(strs.some(s=>s&&String(s).trim())) return false;
  if((e.thread||[]).some(l=>l.t&&l.t.trim())) return false;
  if(e.tests&&Object.values(e.tests).some(t=>t&&(t.v||t.n))) return false;
  if(e.outcome&&(e.outcome.result||e.outcome.lesson)) return false;
  if((e.actions||[]).some(a=>a.t&&a.t.trim())) return false;
  return true;
}
function testVal(e,k){ const t=e.tests||{}, old=LEGACY_TEST[k]?t[LEGACY_TEST[k]]:null; return Object.assign({},old||{},t[k]||{}); }
function verdict(e){
  const g=k=>testVal(e,k).v||"";
  const stakes=e.stakes||"everyday";
  const NOW=["confession","scripture","selfcontrol","edification","body"];
  const answered=TESTS.filter(x=>g(x.k)).length, nowPass=NOW.filter(k=>g(k)==="pass").length;
  if(g("confession")==="fail"||g("scripture")==="fail") return {v:"stop",short:"Set aside",label:"Set this aside.",text:"A word that does not honour Jesus Christ, or that pulls against what God has already said, is not from Him. That holds even if a sign comes with it or it seems to come true (Deut 13:1-3)."};
  if(g("fruit")==="fail"||g("trajectory")==="fail") return {v:"stop",short:"Bad fruit",label:"The fruit says no.",text:"Over time this has not produced good fruit, or it is pulling away from holiness and sound teaching. Lay it down and talk it through with someone you trust."};
  if(g("selfcontrol")==="fail"||g("edification")==="fail") return {v:"stop",short:"Likely not",label:"Hold this loosely; it likely isn't the Lord.",text:"The Spirit does not drive us beyond self-control or tear down. Pressure and compulsion are warning signs. Wait, and bring it to mature believers."};
  if(!answered) return {v:"weigh",short:"Not weighed",label:"Not yet weighed.",text:"Start with the first two tests. Confession and Scripture must both be a clear yes before anything else counts."};
  if(g("confession")!=="pass"||g("scripture")!=="pass") return {v:"weigh",short:"Weighing",label:"Settle the first two tests first.",text:"Search the Scriptures until you can say clearly that this honours Christ and agrees with the Word."};
  if(g("body")==="fail") return {v:"wait",short:"Body concerned",label:"Wait. The body has concerns.",text:"Mature believers who weighed this are not at peace with it. Take that seriously, keep praying with them, and wait (Prov 12:15)."};
  if(stakes!=="everyday"&&g("body")!=="pass") return {v:"wait",short:"Seek counsel",label:"Wait. Let the body weigh it.",text:stakes==="life"?"A life-shaping decision needs mature believers with discernment to weigh it with you before you act (1 Cor 14:29).":"For a decision of this weight, ask mature believers to weigh it with you before you act (1 Cor 14:29)."};
  const need=stakes==="everyday"?3:stakes==="significant"?4:5;
  if(nowPass>=need) return {v:"go",short:"Proceed humbly",label:"Freedom to proceed, humbly.",text:"The tests you can run now line up. Step out, stay teachable, and come back to the fruit and trajectory tests. Time is the final witness."};
  return {v:"weigh",short:"Keep weighing",label:"Keep weighing.",text:stakes==="everyday"?"A few more checks will help. Self-control and edification are good next questions.":"For a decision of this weight, work through the tests the body runs before you act."};
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
    smorp:{passage:"",memory:"",standout:"",message:"",msgKinds:[],examineOk:false,repentance:"",obedience:"",obeyPin:true,obeyDone:false,prayer:"",thread:[]},
    stone:{title:"",kind:"testimony",detail:"",scripture:""},
    weigh:{area:"",stakes:"everyday",question:"",what:"",how:"",howNote:"",when:"",tests:{},outcome:{acted:"Not yet",date:"",result:"",lesson:""},actions:[]}
  };
  const e=Object.assign({id:newId(),type,date:today(),createdAt:Date.now()},clone(shapes[type]),seed||{});
  touch(e); location.hash="#entry/"+e.id; return e;
}

/* ================= routing ================= */
function parseRoute(){
  const h=(location.hash||"#today").slice(1);
  if(h.indexOf("entry/")===0) return {name:"entry",id:h.slice(6)};
  if(V1&&h==="plans") return {name:"today"};
  if(["today","entries","prayer","pray","settings","walk","whisper","stones","selah","comeaway","journey","learn","plans"].includes(h)) return {name:h};
  return {name:"today"};
}
window.addEventListener("hashchange",()=>{
  const prev=route; route=parseRoute();
  const prevHash=prev.name==="entry"?"#entry/"+prev.id:"#"+prev.name;
  if(route.name==="plans"&&prev.name!=="plans") plansReturn=prevHash;
  if(prev.name==="plans"&&plansReturn.indexOf("#entry/")===0&&location.hash!==plansReturn){ const id=plansReturn.slice(7), e=entries[id]; if(e&&isBlank(e)) removeEntry(id); }
  if(prev.name==="entry"&&prev.id!==route.id&&route.name!=="plans"){ flush(prev.id); const e=entries[prev.id]; if(e&&isBlank(e)) removeEntry(prev.id); }
  if(route.name==="pray"&&prev.name!=="pray") startPray();
  if(prev.name==="journey"&&route.name!=="journey") jStop();
  if(!["entry","pray","plans"].includes(route.name)) lastList="#"+route.name;
  render(); window.scrollTo(0,0);
});

/* ================= render ================= */
function render(){
  const app=$("#app");
  if(!user){ app.innerHTML=authHTML(); return; }
  const inEntry=route.name==="entry"||route.name==="pray";
  const e=inEntry?entries[route.id]:null;
  const tab=n=>`aria-current="${(n==="walk"?WALK_ROUTES.includes(route.name):n==="prayer"?(route.name==="prayer"||route.name==="stones"):route.name===n)?"page":"false"}"`;
  const sync=`<span class="sync" id="sync" data-s="saved"><i></i><span>Saved</span></span>`;
  const top=inEntry
    ?`<header class="top gut"><div class="col"><button class="back" data-act="back" aria-label="Back">${route.name==="pray"?"Done":"‹ Back"}</button><h1>${route.name==="pray"?"PRAY NOW":e?esc(TYPE[e.type].label.toUpperCase()):""}</h1><span class="spacer"></span>${sync}</div></header>`
    :`<header class="top gut"><div class="col wide"><span class="brand"><b>Akouō</b></span><nav class="toplinks" aria-label="Sections"><a href="#today" ${tab("today")}>Today</a><a href="#entries" ${tab("entries")}>Entries</a><a href="#prayer" ${tab("prayer")}>Prayer</a><a href="#walk" ${tab("walk")}>Walk</a><a href="#settings" ${tab("settings")}>Settings</a></nav><span class="spacer"></span><a class="hdr-learn" href="#learn" aria-current="${route.name==="learn"?"page":"false"}">${ICON.learn}<span>Learn</span></a>${sync}</div></header>`;
  const nav=inEntry?"":`<nav class="tabbar" aria-label="Sections"><a href="#today" ${tab("today")}>${ICON.today}Today</a><a href="#entries" ${tab("entries")}>${ICON.entries}Entries</a><a href="#prayer" ${tab("prayer")}>${ICON.prayer}Prayer</a><a href="#walk" ${tab("walk")}>${ICON.walk}Walk</a><a href="#settings" ${tab("settings")}>${ICON.settings}Settings</a></nav>`;
  const sbar=supportBarHTML(inEntry||route.name==="journey");
  document.body.classList.toggle("has-sb",!!sbar);
  app.innerHTML=top+`<main class="gut${inEntry?" editor-main":""}"><div class="col" id="main"></div></main>`+sbar+nav;
  renderMain(); paintSync();
}
function renderMain(){
  const m=$("#main"); if(!m) return;
  if(route.name==="today") m.innerHTML=todayHTML();
  else if(route.name==="entries"){ m.innerHTML=entriesHTML(); renderEntryList(); }
  else if(route.name==="settings") m.innerHTML=settingsHTML();
  else if(route.name==="learn") m.innerHTML=learnHTML();
  else if(route.name==="prayer") m.innerHTML=prayerListHTML();
  else if(route.name==="walk") m.innerHTML=walkHTML();
  else if(route.name==="whisper") m.innerHTML=whisperHTML();
  else if(route.name==="stones") m.innerHTML=stonesHTML();
  else if(route.name==="selah") m.innerHTML=selahHTML();
  else if(route.name==="comeaway") m.innerHTML=comeAwayHTML();
  else if(route.name==="journey") m.innerHTML=journeyHTML();
  else if(route.name==="plans") m.innerHTML=plansHTML();
  else if(route.name==="pray") m.innerHTML=prayHTML();
  else {
    const e=entries[route.id];
    if(!e){ m.innerHTML=loaded?`<div class="empty-card">That entry isn't here any more.</div>`:`<p class="muted">Opening</p>`; return; }
    m.innerHTML=e.type==="journal"?journalHTML(e):e.type==="smorp"?smorpHTML(e):e.type==="prayer"?prayerHTML(e):e.type==="stone"?stoneHTML(e):weighHTML(e);
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
    <div><h1><b>Akouō</b></h1><p class="auth-sub">A listening prayer journal</p><p class="auth-tag">Hear God. Test it. Follow.</p><p class="verse">"My sheep hear my voice." John 10:27</p></div>
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
  const recent=all.slice(0,4), steps=todaySteps(), nrd=nextRead();
  const active=activePrayers(), due=duePrayers();
  const verify=user&&!user.verified&&B.kind==="firebase"?`<div class="banner"><span>Please verify your email so you can reset your password if you ever need to.</span><span class="btns"><button class="btn sm" data-act="resend">Resend email</button><button class="btn sm ghost" data-act="recheck">I've verified</button></span></div>`:"";
  return `<div class="stack-lg">
    <div><p class="eyebrow">${greet.toUpperCase()} · ${esc(fmtDate(today(),true).toUpperCase())}</p><h2 class="big">"My sheep hear my voice."</h2><p class="ref" style="margin:4px 0 0;font-size:.95rem">John 10:27</p></div>
    ${verify}
    ${V1?"":readChoiceHTML()}
    ${guideHTML("today")}
    ${V1?`<div class="quick3 two">
      <button class="qbtn" data-act="new" data-type="journal"><b>Listen</b><span>Be still</span></button>
      <a class="qbtn" href="#comeaway"><b>Come Away</b><span>${esc(comeAwaySub())}</span></a>
    </div>`:`<div class="quick3">
      <button class="qbtn" data-act="new" data-type="journal"><b>Listen</b><span>Be still</span></button>
      <button class="qbtn" data-act="new" data-type="smorp"><b>RHEMA</b><span>${esc(nextReadLabel(nrd))}</span></button>
      <button class="qbtn" data-act="new" data-type="weigh"><b>Weigh</b><span>Test a word</span></button>
    </div>`}
    ${whisperBar()}
    <div class="pray-strip">${active.length
      ?`<div><b>Prayer</b><span>${due.length?`${due.length} to pray for today`:`${active.length} on your list`}</span></div><a class="btn primary sm" href="#pray">Pray now</a>`
      :`<div><b>Prayer</b><span>Keep a list of the people and needs you carry.</span></div><a class="btn sm" href="#prayer">Start a list</a>`}</div>
    <section class="stack"><h3 class="sec">NEXT STEPS</h3>${steps.length?stepsHTML(steps):""}
      <form class="addstep" id="addstep"><input type="text" id="newstep" placeholder="${steps.length?"Add another step":"Add a step"}" aria-label="Add a step" enterkeyhint="done"><button class="btn sm" type="submit">Add</button></form></section>
    ${themesHTML()}
    ${inProgressHTML(open)}
    <section class="stack"><h3 class="sec">RECENT</h3>${recent.length?listHTML(recent):`<div class="empty-card">Your entries will show here. Start with Listen: be still, thank Him for something specific, then ask a question and write what you sense.</div>`}${all.length>4?`<a class="btn ghost" href="#entries">See all ${all.length} entries</a>`:""}</section>
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
function listItems(list){
  return list.map(e=>{
    const v=e.type==="weigh"?verdict(e):null;
    return `<li><button class="row-btn" data-act="open" data-id="${e.id}"><span class="badge" aria-hidden="true">${TYPE[e.type].glyph}</span><span class="row-main"><span class="t">${esc(summary(e))}</span><span class="d">${esc(TYPE[e.type].label)} · ${esc(fmtDate(e.date))}</span></span>${v?`<span class="pill" data-v="${v.v}">${esc(v.short)}</span>`:"<span></span>"}</button></li>`;
  }).join("");
}
function listHTML(list){ return `<ul class="list">${listItems(list)}</ul>`; }
// Everything still being worked on: a journey, a reading plan, words being weighed, whispers to weigh, a monthly Selah.
function inProgressHTML(open){
  const rows=[], row=(href,glyph,t,d,pill)=>`<li><a class="row-btn" href="${href}"><span class="badge" aria-hidden="true">${glyph}</span><span class="row-main"><span class="t">${esc(t)}</span><span class="d">${esc(d)}</span></span>${pill?`<span class="pill">${esc(pill)}</span>`:"<span></span>"}</a></li>`;
  const j=settings.journey, jd=j&&JOURNEYS.find(x=>x.key===j.key);
  if(jd){ const d=Math.min(j.day,jd.days.length); rows.push(row("#journey","C",`${jd.title} · Day ${d} of ${jd.days.length}`,`Come Away · ${jd.days[d-1].p}`,"Continue")); }
  if(!V1&&settings.readMode!=="own"){ const nr=nextReading(), p=nr.plan, n=p.days.filter((_,i)=>settings.readings[p.key+"-"+i]).length;
    if(!nr.done&&n>0) rows.push(row("#plans","R",p.title,`Reading plan · ${n} of ${p.days.length} done · next: ${nr.ref}`,"")); }
  const ws=Object.values(entries).filter(w=>w.type==="whisper"&&w.intent==="weigh"&&!(w.linkedId&&entries[w.linkedId])).length;
  if(ws) rows.push(row("#whisper","W",`${ws} ${ws===1?"whisper":"whispers"} waiting to be weighed`,"Walk · Whisper",""));
  const sm=selahDefaultMonth(), sel=entries["e-selah-"+sm];
  if(new Date().getDate()<=7&&!(sel&&(sel.q1||sel.q2||sel.q3))) rows.push(row("#selah","S",`Your ${monthOnly(sm)} Selah is ready`,"Walk · Selah · a monthly look back",""));
  if(!rows.length&&!open.length) return "";
  return `<section class="stack"><h3 class="sec">IN PROGRESS</h3><ul class="list">${rows.slice(0,2).join("")}${listItems(open)}${rows.slice(2).join("")}</ul></section>`;
}

/* ---------- entries ---------- */
function entriesHTML(){
  const chip=(t,l)=>`<button class="chip" data-act="filter" data-t="${t}" aria-pressed="${filter.type===t}">${l}</button>`;
  return `<div class="stack"><h2 class="big">Entries</h2>
    <input type="search" id="q" placeholder="Search everything you've written" value="${esc(filter.q)}" aria-label="Search entries">
    <div class="chips">${chip("all","All")}${chip("journal","Listen")}${V1?"":chip("smorp","RHEMA")}${chip("weigh","Weigh")}${chip("steps","Steps")}</div>
    ${filter.ids?`<div class="banner"><span>Entries with <b>${esc(filter.label)}</b></span><button class="btn sm" data-act="clearids">Show all</button></div>`:""}
    ${prepHTML("list")}
    <div id="elist" class="stack"></div></div>`;
}
function filteredEntries(){
  if(filter.type==="steps") return [];
  const term=filter.q.trim().toLowerCase();
  let list=sorted(filter.type);
  if(filter.ids){ const set=new Set(filter.ids); list=list.filter(e=>set.has(e.id)); }
  if(term) list=list.filter(e=>JSON.stringify(e).toLowerCase().includes(term));
  return list;
}
function renderEntryList(){
  const box=$("#elist"); if(!box) return;
  const term=filter.q.trim().toLowerCase();
  if(filter.type==="steps"){
    let st=allSteps(); if(term) st=st.filter(x=>x.t.toLowerCase().includes(term));
    box.innerHTML=st.length?stepsHTML(st):`<div class="empty-card">No steps yet. Add one on Today${V1?"":", pin a RHEMA Move step,"} or add steps inside an entry.</div>`; return;
  }
  const list=filteredEntries();
  const pb=$("#prepcount"); if(pb) pb.textContent=list.length?`Export ${Math.min(list.length,40)} ${list.length===1?"entry":"entries"} for sermon prep`:"Export for sermon prep";
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
      <button class="role" data-act="role" data-i="${i}" aria-label="Line ${i+1}, ${l.r==="G"?"what I sensed":"me"}. Tap to switch.">${ROLE[l.r]||l.r}</button>
      <textarea id="f-thread-${i}" data-f="thread.${i}.t" rows="1" placeholder="${l.r==="G"?"Write what you sense, then weigh it":"Ask or respond to the Lord"}" aria-label="${l.r==="G"?"What I sensed":"My words"}">${esc(l.t)}</textarea>
      <button class="x" data-act="delline" data-i="${i}" aria-label="Remove line ${i+1}">×</button></div>`).join(""):`<div class="legend" style="padding:12px 14px">Begin with a question. Then be quiet, listen, and write what comes.</div>`}</div>
    <div class="btns"><button class="btn sm" data-act="addline" data-r="R">+ Me</button><button class="btn sm" data-act="addline" data-r="G">+ Listening</button><button class="btn sm ghost" data-act="qs">Starter questions</button></div>
    <div class="qsheet" id="qsheet" hidden>${settings.questions.map((q,i)=>`<button data-act="useq" data-i="${i}">${esc(q)}</button>`).join("")}<a class="small" href="#settings">Edit these questions</a></div>
    <p class="legend" style="margin:0"><b>Me</b> is you asking or responding. <b class="g">Listening</b> is what you sensed, kept for weighing. "Speak, for your servant hears." 1 Sam 3:10</p>`;
}
const delBtn=`<button class="btn ghost danger" data-act="del">Delete entry</button>`;
function actionsHTML(e){
  const acts=e.actions||[];
  return `<div class="card"><h3 class="sec">NEXT STEPS</h3>
    ${acts.length?`<div class="acts">${acts.map((a,i)=>`<div class="act-row${a.done?" done":""}"><input type="checkbox" id="f-actions-${i}-done" data-f="actions.${i}.done"${a.done?" checked":""} aria-label="Done"><input type="text" id="f-actions-${i}-t" data-f="actions.${i}.t" value="${esc(a.t)}" placeholder="What will you do?" aria-label="Step"><button class="x" data-act="delact" data-i="${i}" aria-label="Remove step">\u00d7</button></div>`).join("")}</div>`:`<p class="legend" style="margin:0">Anything to act on? Steps added here show on Today until you tick them off.</p>`}
    <div class="btns"><button class="btn sm" data-act="addact">+ Add a step</button>${e.type==="journal"?`<button class="btn sm ghost" data-act="fromg">From what I sensed</button>`:""}</div>
    <div class="qsheet" id="gsheet" hidden></div></div>`;
}
/* completing a journey day or a plan reading from the entry itself */
function journeyOf(e){
  let key=e.journeyKey, day=e.journeyDay;
  if(!key&&e.title){ const m=/^(.*) · Day (\d+)$/.exec(e.title), jd=m&&JOURNEYS.find(x=>x.title===m[1]); if(jd){ key=jd.key; day=+m[2]; } }
  const jd=key&&JOURNEYS.find(x=>x.key===key); return jd&&day?{jd,day}:null;
}
function journeyDayHTML(e){
  const o=journeyOf(e); if(!o) return ""; const {jd,day}=o, j=settings.journey, last=day>=jd.days.length;
  const eyebrow=`<p class="eyebrow">${esc(jd.title.toUpperCase())} · DAY ${day} OF ${jd.days.length}</p>`;
  if(j&&j.key===jd.key&&j.day===day) return `<div class="card done-card">${eyebrow}
    <p class="legend" style="margin:0">Finished the reading, the stillness and your listening? ${last?"Mark the journey complete.":`Mark the day complete and Day ${day+1} will be ready in Come Away.`}</p>
    <button class="btn primary block" data-act="jdone" data-stay="1">${last?"Finish the journey":"Complete Day "+day}</button></div>`;
  const finished=(j&&j.key===jd.key&&j.day>day)||(!(j&&j.key===jd.key)&&(settings.journeysDone||[]).some(d=>d.key===jd.key));
  return finished?`<div class="card done-card">${eyebrow}<p class="done-line">✓ Day ${day} complete</p></div>`:"";
}
function planOf(e){
  if(!e.planDay) return null; const m=/^(.*)-(\d+)$/.exec(e.planDay), p=m&&PLANS.find(x=>x.key===m[1]);
  return p?{p,i:+m[2],day:+m[2]+1}:null;
}
function planDayHTML(e){
  const o=planOf(e); if(!o) return ""; const {p,day}=o, done=!!settings.readings[e.planDay], last=day>=p.days.length;
  const eyebrow=`<p class="eyebrow">${esc(p.title.toUpperCase())} · DAY ${day} OF ${p.days.length}</p>`;
  return done?`<div class="card done-card">${eyebrow}<div class="done-row"><p class="done-line">✓ Reading complete</p><button class="btn sm ghost" data-act="planundo">Not finished? Undo</button></div></div>`
    :`<div class="card done-card">${eyebrow}<p class="legend" style="margin:0">Finished with this reading? ${last?"Mark it complete to finish the plan.":"Mark it complete and the next reading will be ready on Today."}</p>
      <button class="btn primary block" data-act="plancomplete">${last?"Finish the plan":"Complete Day "+day}</button></div>`;
}
function journalHTML(e){
  const c=e.checks||{};
  const ck=(k,l,r)=>`<label class="check"><input type="checkbox" id="f-checks-${k}" data-f="checks.${k}"${c[k]?" checked":""}><span>${l} <span class="ref">${r}</span></span></label>`;
  return `<div class="stack">
    <div><p class="eyebrow">LISTENING PRAYER</p><h2 class="date-line">${esc(e.title||fmtDate(e.date,true))}</h2></div>
    <div class="card"><h3 class="sec">STILL YOURSELF</h3><p class="legend" style="margin:0">"Be still, and know that I am God." Psalm 46:10. Pause, then thank Him for something specific.</p>${area("","praise",e,{ph:"Lord, thank You for...",aria:"Stillness and thanks"})}</div>
    ${journeyOf(e)||e.standout?`<div class="card"><h3 class="sec">WHAT STOOD OUT</h3>${area("","standout",e,{ph:"A word, phrase or verse the Holy Spirit highlighted...",aria:"What passage or phrase stood out"})}</div>`:""}
    <div class="card"><h3 class="sec">LISTEN</h3>${threadHTML(e)}</div>
    ${actionsHTML(e)}
    <div class="card"><h3 class="sec">TEST THIS</h3>
      <div class="checks">${ck("scripture","It honours Jesus and agrees with Scripture read in context.","1 John 4:1-3")}${ck("shepherd","It leaves me calm and free to wait, not driven.","1 Cor 14:32")}${ck("alone","I'm not acting on anything weighty alone.","1 Cor 14:29")}</div>
      <div class="btns"><button class="btn sm" data-act="toweigh">Weigh this further</button></div>
      <details class="more"><summary>More</summary><div class="inside">
        <div class="row2">${input("Date","date",e,{type:"date"})}${input("Title","title",e,{ph:"A few words to find it later"})}</div>
        ${input("Scripture that came to mind","scripture",e,{ph:"e.g. Psalm 32:8"})}
        ${area("Notes: what He taught me, answered prayer","notes",e,{rows:2})}
      </div></details></div>
    ${journeyDayHTML(e)}
    ${prepHTML("entry")}${shareHTML(e)}
    ${delBtn}</div>`;
}
function smorpHTML(e){
  const v=settings.version, kinds=e.msgKinds||[], nr=nextRead();
  const suggest=!e.passage&&!nr.done?`<div class="plan-chip"><span>${nr.mode==="own"?"Next in your reading":"Today's reading"}: <b>${esc(nr.ref)}</b></span><button class="btn sm" data-act="useplan">Use it</button></div>`:"";
  const planLink=`<a class="small" href="#plans">${nr.mode==="own"?"Change book":"Change plan"}</a>`;
  const thread=e.thread||[];
  return `<div class="stack">
    <div><p class="eyebrow">RHEMA · ${esc(fmtDate(e.date).toUpperCase())}</p><h2 class="date-line">${esc(e.passage||"Today's reading")}</h2></div>
    <div class="card">${suggest}${input("Passage","passage",e,{ph:"e.g. John 15:1-17"})}<div class="row-links">${e.passage?`<a href="${bgLink(e.passage,v)}" target="_blank" rel="noopener">Read ${esc(e.passage)} (${esc(v)})</a>`:"<span></span>"}${planLink}</div></div>
    <div class="card"><div class="devo">
      <div class="cap">R</div><div class="body"><b>READ</b><em>Read slowly. Write the verse or phrase that holds you.</em>${area("","standout",e,{aria:"What I read"})}</div>
      <div class="cap">H</div><div class="body"><b>HEAR</b><em>What is the Spirit highlighting, and what may He be saying?</em>
        <div class="chips">${MSG_KINDS.map(k=>`<button class="chip" data-act="kind" data-k="${k}" aria-pressed="${kinds.includes(k)}">${k}</button>`).join("")}</div>${area("","message",e,{rows:3,aria:"What I hear"})}</div>
      <div class="cap">E</div><div class="body"><b>EXAMINE</b><em>Test what you heard by the Word, then let Him search your heart.</em>
        ${examHTML(e)}
        ${area("","repentance",e,{ph:"Search me, O God, and know my heart... (Psalm 139:23-24)",aria:"Let Him search my heart"})}</div>
      <div class="cap">M</div><div class="body"><b>MOVE</b><em>One concrete step of obedience for today or this week.</em>${area("","obedience",e,{aria:"My step"})}<label class="check small"><input type="checkbox" id="f-obeyPin" data-f="obeyPin"${e.obeyPin?" checked":""}><span>Show this step on Today${e.obeyDone?" (done)":""}</span></label></div>
      <div class="cap">A</div><div class="body"><b>ABIDE</b><em>Respond in prayer, then rest in Him. John 15:4-5</em>${area("","prayer",e,{rows:3,aria:"Prayer"})}</div>
    </div>
    <details class="more"${thread.some(l=>l.t)?" open":""}><summary>Listen from this passage</summary><div class="inside">${threadHTML(e)}</div></details>
    <details class="more"><summary>More</summary><div class="inside"><div class="row2">${input("Date","date",e,{type:"date"})}${input("Memory verse","memory",e,{ph:"Reference"})}</div></div></details>
    </div>${planDayHTML(e)}${prepHTML("entry")}${shareHTML(e)}${delBtn}</div>`;
}
function examVals(e){ const x=Object.assign({},e.exam||{}); if(!e.exam&&e.examineOk){ x.christ="pass"; x.whole="pass"; } return x; }
function examState(e){
  const x=examVals(e), vs=EXAM.map(q=>x[q.k]||"");
  if(vs.includes("fail")) return {v:"stop",label:"Set this impression aside",text:"Keep what the passage plainly says, and let that be today's word. Nothing is lost by laying down what doesn't pass."};
  if(vs.includes("unclear")) return {v:"wait",label:"Hold it loosely",text:"Not sure is an honest answer. Don't act on the unsure part alone: talk it over with a mature believer, or weigh it further."};
  if(vs.every(v=>v==="pass")) return {v:"go",label:"Tested by the Word",text:"Hold it humbly, and let Move put it into practice."};
  return {v:"",label:"Answer each question",text:"However long you have walked with Him, the basics are what keep us from traps."};
}
function examSumHTML(st){ return `<b>${esc(st.label)}</b><p>${esc(st.text)}</p>`; }
function examHTML(e){
  const x=examVals(e), st=examState(e), ul=a=>`<ul class="exlist">${a.map(t=>`<li>${esc(t)}</li>`).join("")}</ul>`;
  const seg=k=>`<div class="seg" role="group" aria-label="Answer">${[["pass","Yes"],["unclear","Not sure"],["fail","No"]].map(([v,l])=>`<button data-act="ex" data-k="${k}" data-v="${v}" aria-pressed="${x[k]===v}">${l}</button>`).join("")}</div>`;
  return `<div class="exam">
    <p class="legend" style="margin:0">The same five questions for every believer, every time.</p>
    ${EXAM.map((q,i)=>`<div class="exq"><div class="exq-top"><span class="exq-t"><span class="tn">${i+1}</span> ${esc(q.q)}${q.tag?` <span class="extag">${esc(q.tag)}</span>`:""}</span>${seg(q.k)}</div>
      <button class="exhow" data-act="exhow" data-i="${i}" aria-expanded="false" aria-controls="exh-${i}">How do I check this?</button>
      <p class="exhelp" id="exh-${i}" hidden>${esc(q.how)} <span class="ref">${esc(q.r)}</span></p></div>`).join("")}
    <div class="verdict" id="exsum" data-v="${st.v}" aria-live="polite">${examSumHTML(st)}</div>
    <p class="legend" style="margin:0">Is it asking you to do something big, like move, quit, start, confront someone, or give a word to another person? Weigh it with all seven tests and mature counsel, whatever the answers above.</p>
    <div class="btns"><button class="btn sm" data-act="rtoweigh">Weigh this further</button><button class="btn sm" data-act="rshare">Talk it over with a partner</button></div>
    <details class="more"><summary>New to this?</summary><div class="inside">${ul(EXAM_NEW)}</div></details>
    <details class="more"><summary>Walked with Him a long time?</summary><div class="inside">${ul(EXAM_SEASONED)}</div></details>
    <details class="more"><summary>Go deeper in the text</summary><div class="inside">${ul(EXAM_DEEP)}</div></details>
    <div class="exheart"><b>Let Him search your heart</b><span class="legend">What does this passage show you about yourself? Anything to confess or surrender?</span></div>
  </div>`;
}
function segHTML(k,cur){ return `<div class="seg" role="group" aria-label="Answer">${[["pass","Yes"],["unclear","?"],["fail","No"]].map(([v,l])=>`<button data-act="test" data-k="${k}" data-v="${v}" aria-pressed="${cur===v}" aria-label="${l==="?"?"Unclear":l}">${l}</button>`).join("")}</div>`; }
function testRow(e,x,full){
  const tv=testVal(e,x.k), cur=tv.v||"", note=tv.n||"";
  if(full) return `<div class="test"><div class="test-head"><div class="q"><b><span class="tn">${x.n}</span> ${esc(x.name)}</b><span class="tq">${esc(x.t)}</span><span class="ref">${esc(x.r)}</span></div>${segHTML(x.k,cur)}</div><input type="text" id="f-tests-${x.k}-n" data-f="tests.${x.k}.n" value="${esc(note)}" placeholder="Passage or note"></div>`;
  return `<div class="test"><div class="test-head"><button class="tname q" data-act="tinfo" data-k="${x.k}" aria-expanded="false"><span class="tn">${x.n}</span> ${esc(x.name)}<small>${note?esc(note):"Tap for the question"}</small></button>${segHTML(x.k,cur)}</div>
      <div class="tdetail" id="td-${x.k}" hidden><span>${esc(x.t)} ${esc(x.s)} <span class="ref">${esc(x.r)}</span></span><input type="text" id="f-tests-${x.k}-n" data-f="tests.${x.k}.n" value="${esc(note)}" placeholder="Note: person, passage, what you observed"></div></div>`;
}
function weighHTML(e){
  const stakes=e.stakes||"everyday", o=e.outcome||{};
  const grp=g=>TESTS.filter(x=>x.group===g);
  const v=verdict(e);
  return `<div class="stack">
    <div><p class="eyebrow">WEIGH A WORD · ${esc(fmtDate(e.date).toUpperCase())}</p><h2 class="date-line">${esc(e.question||"A matter to weigh")}</h2></div>
    <div class="card">
      ${input("What am I asking the Lord?","question",e,{ph:"Write the question plainly"})}
      ${area("What I sensed","what",e,{rows:2})}
      <div class="fld"><span>How weighty is this decision?</span><div class="seg" role="group" aria-label="Stakes">${STAKES.map(([k,l])=>`<button data-act="stake" data-k="${k}" data-v="stake" aria-pressed="${stakes===k}">${l}</button>`).join("")}</div></div>
    </div>
    <div class="card">
      <h3 class="sec">TESTS YOU RUN ON THE WORD</h3><p class="legend" style="margin:-4px 0 0">Both must be a clear yes. If either fails, nothing else matters.</p>
      <div class="gate">${grp("word").map(x=>testRow(e,x,true)).join("")}</div>
      <h3 class="sec">TESTS THE BODY RUNS</h3><div class="tlist">${grp("body").map(x=>testRow(e,x,false)).join("")}</div>
      <h3 class="sec">TESTS TIME RUNS</h3><p class="legend" style="margin:-4px 0 0">Come back to these after you act.</p><div class="tlist">${grp("time").map(x=>testRow(e,x,false)).join("")}</div>
      <div class="verdict" id="verdict" data-v="${v.v}"><b>${esc(v.label)}</b><p>${esc(v.text)}</p></div>
    </div>
    ${actionsHTML(e)}
    <div class="card flat">
      <details class="more"${o.acted&&o.acted!=="Not yet"?" open":""}><summary>Outcome</summary><div class="inside">
        <div class="row2">${select("Did I act on it?","outcome.acted",e,["Not yet","Yes","Chose not to"])}${input("Date acted","outcome.date",e,{type:"date"})}</div>
        ${area("What happened","outcome.result",e)}${area("Fruit and lessons about hearing Him","outcome.lesson",e)}<label class="check"><input type="checkbox" id="f-outcome-stone" data-f="outcome.stone"${o.stone?" checked":""}><span>This word was fulfilled. Raise a stone of remembrance. <span class="ref">1 Sam 7:12</span></span></label></div></details>
      <details class="more"><summary>How and when it came</summary><div class="inside">
        <div class="row2">${select("How it came","how",e,HOW)}${select("Area of life","area",e,AREAS)}</div>
        ${input("Details","howNote",e)}${input("Timing sensed","when",e,{ph:"Now, later, a season, unclear"})}${input("Date","date",e,{type:"date"})}</div></details>
    </div>${prepHTML("entry")}${shareHTML(e)}${delBtn}</div>`;
}
function repaintVerdict(e){ const v=verdict(e), el=$("#verdict"); if(!el) return; el.dataset.v=v.v; el.innerHTML=`<b>${esc(v.label)}</b><p>${esc(v.text)}</p>`; }

/* ---------- prayer ---------- */
let prayFilter={status:"active",cat:"all"};
let pray={queue:[],i:0,prayed:0};
const activePrayers=()=>Object.values(entries).filter(e=>e.type==="prayer"&&e.status!=="answered"&&(e.title||"").trim());
function duePrayers(){ const d=DOW[new Date().getDay()]; return activePrayers().filter(e=>!e.freq||e.freq==="daily"||e.freq===d); }
const freqLabel=f=>(FREQS.find(x=>x[0]===f)||FREQS[0])[1];
function lastPrayedLabel(ms){ if(!ms) return "Not yet prayed"; const days=Math.floor((Date.now()-ms)/864e5); return days<=0?"Prayed today":days===1?"Prayed yesterday":`Prayed ${days} days ago`; }
function prayerListHTML(){
  const all=Object.values(entries).filter(e=>e.type==="prayer"&&(e.title||"").trim());
  const act=all.filter(e=>e.status!=="answered"), ans=all.filter(e=>e.status==="answered");
  let list=prayFilter.status==="answered"?ans:act;
  const cats=[...new Set(list.map(e=>e.cat).filter(Boolean))];
  if(prayFilter.cat!=="all") list=list.filter(e=>e.cat===prayFilter.cat);
  list.sort(prayFilter.status==="answered"?(a,b)=>(b.answeredAt||"").localeCompare(a.answeredAt||""):(a,b)=>(a.lastPrayed||0)-(b.lastPrayed||0)||(b.createdAt||0)-(a.createdAt||0));
  const due=duePrayers();
  const chip=(k,v,l)=>`<button class="chip" data-act="pfilter" data-k="${k}" data-v="${esc(v)}" aria-pressed="${prayFilter[k]===v}">${esc(l)}</button>`;
  const card=e=>`<li><button class="row-btn prow" data-act="open" data-id="${e.id}"><span class="row-main"><span class="t">${esc(e.title)}</span><span class="d">${esc([e.who&&"For "+e.who,e.cat,e.status==="answered"?"Answered "+fmtDate(e.answeredAt):freqLabel(e.freq)].filter(Boolean).join(" · "))}</span></span><span class="pcount" aria-label="${e.status==="answered"?"Answered":"Prayed "+(e.prayedCount||0)+" times"}">${e.status==="answered"?"✓":(e.prayedCount||0)}</span></button></li>`;
  return `<div class="stack"><h2 class="big">Prayer</h2>
    ${act.length?`<a class="btn primary block" href="#pray">Pray now · ${due.length||act.length} ${due.length?"for today":"on your list"}</a>`:""}
    <form class="addstep" id="addprayer"><input type="text" id="newprayer" placeholder="Add a prayer request" aria-label="Add a prayer request" enterkeyhint="done"><button class="btn sm" type="submit">Add</button></form>
    ${(()=>{ const st=allStones(); return `<a class="wcard" href="#stones"><span><b>Stones (Answered Prayers)</b><span>${st.length?`${st.length} raised · latest: ${esc(st[0].title)}`:"Answered prayers and what God has done, kept as a testimony"}</span></span><span class="chev" aria-hidden="true">›</span></a>`; })()}
    <div class="chips">${chip("status","active",`Praying (${act.length})`)}${chip("status","answered",`Answered (${ans.length})`)}</div>
    ${cats.length>1?`<div class="chips">${chip("cat","all","All")}${cats.map(c=>chip("cat",c,c)).join("")}</div>`:""}
    ${list.length?`<ul class="list">${list.map(card).join("")}</ul>`:`<div class="empty-card">${prayFilter.status==="answered"?"Answered prayers gather here, a record of His faithfulness.":"Add the people and needs you carry. Tap one to add details, choose how often to pray, or listen for how to pray."}</div>`}
    ${list.length&&prayFilter.status==="active"?`<p class="legend" style="margin:0">The number shows how many times you've prayed for each request.</p>`:""}</div>`;
}
function prayerHTML(e){
  const answered=e.status==="answered";
  return `<div class="stack">
    <div><p class="eyebrow">PRAYER REQUEST · ${esc(lastPrayedLabel(e.lastPrayed).toUpperCase())}${e.prayedCount?` · ${e.prayedCount} TIMES`:""}</p><h2 class="date-line">${esc(e.title||"Prayer request")}</h2></div>
    <div class="card">
      ${input("What are you praying for?","title",e,{ph:"e.g. Healing for Mom"})}
      <div class="row2">${input("For whom","who",e,{ph:"Name (optional)"})}${select("Category","cat",e,PRAYER_CATS)}</div>
      <label class="fld"><span>Pray for this</span><select id="f-freq" data-f="freq">${FREQS.map(([k,l])=>`<option value="${k}"${(e.freq||"daily")===k?" selected":""}>${l}</option>`).join("")}</select></label>
      ${area("Details and updates","details",e,{rows:3})}
    </div>
    <div class="card"><h3 class="sec">LISTEN FOR HOW TO PRAY</h3>
      ${(e.thread||[]).length?"":`<div class="btns"><button class="btn sm" data-act="askhow">Ask: "Lord, how do You want me to pray for this?"</button></div>`}
      ${threadHTML(e)}
      ${input("Scripture to pray","promise",e,{ph:"e.g. Philippians 4:6-7"})}${e.promise?`<a href="${bgLink(e.promise,settings.version)}" target="_blank" rel="noopener">Read ${esc(e.promise)} (${esc(settings.version)})</a>`:""}
    </div>
    <div class="card">${answered
      ?`<h3 class="sec">ANSWERED</h3>${input("Date answered","answeredAt",e,{type:"date"})}${area("How He answered","answer",e,{rows:3})}<div class="btns"><button class="btn sm ghost" data-act="unanswer">Move back to praying</button></div>`
      :`<h3 class="sec">ANSWERED?</h3><p class="legend" style="margin:0">When God answers, mark it here and record how. Answered prayers are kept as a testimony.</p><div class="btns"><button class="btn sm" data-act="markanswered">Mark as answered</button></div>`}</div>
    ${delBtn}</div>`;
}
function startPray(){
  const due=duePrayers(), list=due.length?due:activePrayers();
  pray={queue:list.sort((a,b)=>(a.lastPrayed||0)-(b.lastPrayed||0)).map(e=>e.id),i:0,prayed:0};
}
function prayHTML(){
  if(!pray.queue.length) return `<div class="praymode"><div class="pray-card"><p class="eyebrow">PRAY NOW</p><h2 class="big">Your list is empty.</h2><p class="muted">Add the people and needs you carry, then come back to pray.</p><a class="btn primary" href="#prayer">Add a request</a></div></div>`;
  if(pray.i>=pray.queue.length) return `<div class="praymode"><div class="pray-card"><p class="eyebrow">FINISHED</p><h2 class="big">Amen.</h2><p class="muted">You prayed for ${pray.prayed} ${pray.prayed===1?"request":"requests"}. "The prayer of a righteous person has great power as it is working." James 5:16</p><div class="btns"><a class="btn primary" href="#today">Back to Today</a><button class="btn" data-act="prayagain">Pray again</button></div></div></div>`;
  const e=entries[pray.queue[pray.i]];
  if(!e){ pray.i++; return prayHTML(); }
  const lastG=(e.thread||[]).filter(l=>l.r==="G"&&l.t).slice(-1)[0];
  return `<div class="praymode">
    <p class="pray-prog">${pray.i+1} of ${pray.queue.length}</p>
    <div class="pray-dots" aria-hidden="true">${pray.queue.map((_,j)=>`<i class="${j<pray.i?"on":j===pray.i?"cur":""}"></i>`).join("")}</div>
    <div class="pray-card">
      <p class="eyebrow">${esc([e.cat,e.who&&"For "+e.who].filter(Boolean).join(" · ").toUpperCase()||"PRAYER")}</p>
      <h2 class="big">${esc(e.title)}</h2>
      ${e.details?`<p class="pray-details">${esc(e.details)}</p>`:""}
      ${lastG?`<p class="pray-sensed"><b>Listening:</b> ${esc(lastG.t)}</p>`:""}
      ${e.promise?`<p class="pray-promise"><a href="${bgLink(e.promise,settings.version)}" target="_blank" rel="noopener">Pray ${esc(e.promise)}</a></p>`:""}
      <p class="ref" style="margin:0">${esc(lastPrayedLabel(e.lastPrayed))}${e.prayedCount?` · ${e.prayedCount} times`:""}</p>
    </div>
    <div class="pray-actions"><button class="btn primary" data-act="prayed">Prayed</button><button class="btn" data-act="prayskip">Skip</button></div>
    <button class="btn ghost" data-act="prayanswered">God answered this</button>
  </div>`;
}

/* ---------- guide ---------- */
function guideHTML(where){
  if(where==="today"&&settings.guideCollapsed) return `<button class="guide-mini" data-act="guide" data-v="open"><span>How to use Akouō</span><span class="guide-show">Show</span></button>`;
  return `<section class="card guide"><div class="guide-head"><h3 class="sec">HOW TO USE AKOUŌ</h3>${where==="today"?`<button class="btn sm ghost" data-act="guide" data-v="close">Hide</button>`:""}</div>
    <p class="guide-lead">${V1?"A simple rhythm: be still, listen, pray, then take your next step.":"A simple rhythm: be still, hear from His Word, pray, then take your next step."}</p>
    <dl class="guide-list">
      <div><dt>Listen</dt><dd>Be still and thank Him. Ask a question, then write what you sense under "Listening." Test it before you act on it.</dd></div>
      ${V1?"":`<div><dt>RHEMA</dt><dd>Your daily time in Scripture: Read, Hear, Examine, Move, Abide. Today's passage is ready for you.</dd></div>`}
      <div><dt>Weigh</dt><dd>${V1?"From Listen or a Whisper, anything that calls for a real decision goes through the seven tests before you act.":"Anything that calls for a real decision goes through the seven tests before you act."}</dd></div>
      <div><dt>Prayer</dt><dd>Keep the people and needs you carry. Pray now walks you through today's list, one at a time.</dd></div>
      <div><dt>Walk</dt><dd>Whisper captures a prompting on the go. Selah and Come Away help you reflect and retreat. Stones, under Prayer, keep answered prayers as a testimony.</dd></div>
    </dl>
    ${where==="today"?`<a class="btn sm" href="#learn">Learn the teaching behind it</a>`:""}</section>`;
}

/* ---------- reading: guided plans or my own reading ---------- */
const BOOK_CH={Genesis:50,Exodus:40,Leviticus:27,Numbers:36,Deuteronomy:34,Joshua:24,Judges:21,Ruth:4,"1 Samuel":31,"2 Samuel":24,"1 Kings":22,"2 Kings":25,"1 Chronicles":29,"2 Chronicles":36,Ezra:10,Nehemiah:13,Esther:10,Job:42,Psalm:150,Proverbs:31,Ecclesiastes:12,"Song of Songs":8,Isaiah:66,Jeremiah:52,Lamentations:5,Ezekiel:48,Daniel:12,Hosea:14,Joel:3,Amos:9,Obadiah:1,Jonah:4,Micah:7,Nahum:3,Habakkuk:3,Zephaniah:3,Haggai:2,Zechariah:14,Malachi:4,Matthew:28,Mark:16,Luke:24,John:21,Acts:28,Romans:16,"1 Corinthians":16,"2 Corinthians":13,Galatians:6,Ephesians:6,Philippians:4,Colossians:4,"1 Thessalonians":5,"2 Thessalonians":3,"1 Timothy":6,"2 Timothy":4,Titus:3,Philemon:1,Hebrews:13,James:5,"1 Peter":5,"2 Peter":3,"1 John":5,"2 John":1,"3 John":1,Jude:1,Revelation:22};
const BOOK_NAMES=Object.keys(BOOK_CH);
function canonBook(s){
  const t=String(s||"").trim().toLowerCase().replace(/\s+/g," ").replace(/^psalms$/,"psalm").replace(/^song of solomon$/,"song of songs").replace(/^revelations$/,"revelation");
  return BOOK_NAMES.find(b=>b.toLowerCase()===t)||null;
}
function parseRef(p){ const m=/^\s*((?:[1-3]\s*)?[A-Za-z][A-Za-z ]*?)\s+(\d+)/.exec(p||""); if(!m) return null; const book=canonBook(m[1].replace(/^([1-3])\s*/,"$1 ")); return book?{book,ch:+m[2]}:null; }
function ownStart(){
  const st=settings.ownStart;
  if(st&&canonBook(st.book)) return {book:canonBook(st.book),ch:+st.ch||1,v1:+st.v1||0,v2:+st.v2||0,setAt:+st.setAt||0};
  if(settings.ownBook&&canonBook(settings.ownBook)) return {book:canonBook(settings.ownBook),ch:1,v1:0,v2:0,setAt:0};
  return null;
}
const startRef=st=>`${st.book} ${st.ch}${st.v1?":"+st.v1+(st.v2&&st.v2>st.v1?"-"+st.v2:""):""}`;
function ownNext(){
  const st=ownStart();
  const list=Object.values(entries).filter(e=>e.type==="smorp"&&parseRef(e.passage)).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  if(!st){ const last=list[0]; if(!last) return {done:true,mode:"own",needBook:true}; const r=parseRef(last.passage), ch=r.ch+1; return ch>BOOK_CH[r.book]?{done:true,mode:"own",finished:r.book}:{ref:`${r.book} ${ch}`,mode:"own",book:r.book,ch}; }
  const last=list.find(e=>parseRef(e.passage).book===st.book&&(e.createdAt||0)>st.setAt);
  if(!last) return {ref:startRef(st),mode:"own",book:st.book,ch:st.ch};
  const ch=parseRef(last.passage).ch+1;
  if(ch>BOOK_CH[st.book]) return {done:true,mode:"own",finished:st.book};
  return {ref:`${st.book} ${ch}`,mode:"own",book:st.book,ch};
}
function nextRead(){
  if(settings.readMode==="own") return ownNext();
  const nr=nextReading();
  return nr.done?{done:true,mode:"guided"}:{ref:nr.ref,planDay:nr.plan.key+"-"+nr.i,mode:"guided"};
}
function nextReadLabel(nr){ return nr.done?(nr.mode==="own"?(nr.finished?`Finished ${nr.finished}`:"Set your book"):"Choose a plan"):nr.ref; }
function readChoiceHTML(){
  if(settings.readMode) return "";
  return `<section class="card readchoice"><h3 class="sec">HOW WOULD YOU LIKE TO READ?</h3>
    <div class="choice2">
      <button class="choice" data-act="readmode" data-v="guided"><b>Guide me</b><span>Choose a reading plan and the next passage will be ready each day.</span></button>
      <button class="choice" data-act="readmode" data-v="own"><b>I have my own reading</b><span>Tell me the book you're in. Akouō keeps your place.</span></button>
    </div><p class="legend" style="margin:0">You can change this anytime.</p></section>`;
}
function plansHTML(){
  const mode=settings.readMode||"guided", nr=nextRead();
  const seg=`<div class="seg" role="group" aria-label="How you read"><button data-act="readmode2" data-mode="guided" aria-pressed="${mode==="guided"}">Guide me</button><button data-act="readmode2" data-mode="own" aria-pressed="${mode==="own"}">My own reading</button></div>`;
  const body=mode==="own"
    ?(()=>{ const st=ownStart()||{book:"",ch:1,v1:0,v2:0}, bk=st.book, max=bk?BOOK_CH[bk]:1;
      const ot=BOOK_NAMES.slice(0,39), nt=BOOK_NAMES.slice(39);
      const opt=x=>`<option value="${esc(x)}"${x===bk?" selected":""}>${esc(x)}</option>`;
      return `<div class="card"><h3 class="sec">MY OWN READING</h3><p style="margin:0">Tell Akouō where you are. Your next RHEMA starts there, then moves on a chapter at a time.</p>
        <label class="fld"><span>Book</span><select id="ownbook"><option value="">Choose a book</option><optgroup label="Old Testament">${ot.map(opt).join("")}</optgroup><optgroup label="New Testament">${nt.map(opt).join("")}</optgroup></select></label>
        <div class="row3">
          <label class="fld"><span>Chapter</span><select id="ownch">${Array.from({length:max},(_,i)=>`<option${i+1===st.ch?" selected":""}>${i+1}</option>`).join("")}</select></label>
          <label class="fld"><span>From verse</span><input type="number" id="ownv1" min="1" inputmode="numeric" value="${st.v1||""}" placeholder="Optional"></label>
          <label class="fld"><span>To verse</span><input type="number" id="ownv2" min="1" inputmode="numeric" value="${st.v2||""}" placeholder="Optional"></label>
        </div>
        <div class="btns"><button class="btn primary" data-act="ownsave">Save my place</button></div>
        <p class="plan-next">${nr.done?(nr.finished?`You've finished ${esc(nr.finished)}. Choose your next book.`:"Choose a book to begin."):`Next up: <b>${esc(nr.ref)}</b>`}</p>
        <p class="legend" style="margin:0">Leave the verses empty to read the whole chapter. You can always type any passage into RHEMA as well.</p></div>`; })()
    :`<ul class="plan-list">${PLANS.map(p=>{ const done=p.days.filter((_,i)=>settings.readings[p.key+"-"+i]).length, cur=p.key===settings.plan;
        return `<li class="plan-card${cur?" current":""}"><div class="plan-top"><span><b>${esc(p.title)}</b><span class="pill${p.level==="Start here"?"":" deep"}">${esc((p.level||"").toUpperCase())}</span></span>${cur?`<span class="pill" data-v="go">CURRENT</span>`:`<button class="btn sm" data-act="pickplan" data-k="${p.key}">Choose</button>`}</div>
          <p>${esc(p.desc||"")}</p><span class="plan-meta">${p.days.length} readings${done?` · ${done} done`:""}</span><div class="progress" aria-hidden="true"><i style="width:${Math.round(done/p.days.length*100)}%"></i></div></li>`; }).join("")}</ul>`;
  return `<div class="stack"><a class="crumb" href="${plansReturn}">‹ Back</a>
    <div><h2 class="big">Reading</h2><p class="muted" style="margin:4px 0 0">Choose a plan, or keep your place in your own reading.</p></div>
    ${seg}${body}</div>`;
}

/* ---------- share with a partner ---------- */
function shareText(e){
  const L=[];
  if(e.type==="journal"){ L.push("Listening prayer · "+fmtDate(e.date)); if(e.standout) L.push("What stood out: "+e.standout); (e.thread||[]).filter(l=>l.t&&l.t.trim()).forEach(l=>L.push((l.r==="G"?"I sensed: ":"I asked: ")+l.t.trim())); if(e.scripture) L.push("Scripture: "+e.scripture); (e.actions||[]).filter(a=>a.t).forEach(a=>L.push("My step: "+a.t)); }
  else if(e.type==="smorp"){ L.push("RHEMA · "+(e.passage||"")+" · "+fmtDate(e.date)); if(e.standout) L.push("Read: "+e.standout); if(e.message) L.push("Hear: "+e.message); if(e.obedience) L.push("Move: "+e.obedience); if(e.prayer) L.push("Abide: "+e.prayer); }
  else if(e.type==="weigh"){ L.push("Weighing a word · "+fmtDate(e.date)); if(e.question) L.push("Question: "+e.question); if(e.what) L.push("What I sensed: "+e.what); const passed=TESTS.filter(x=>testVal(e,x.k).v==="pass").map(x=>x.name); if(passed.length) L.push("Tests passed so far: "+passed.join(", ")); L.push("Where it stands: "+verdict(e).label); L.push("Would you weigh this with me?"); }
  else if(e.type==="selah"){ L.push("My Selah · "+monthName(e.month)); if(e.q1) L.push("What God has been saying: "+e.q1); if(e.q3) L.push("What I'm carrying forward: "+e.q3); }
  L.push("","Shared from Akouō"); return L.join("\n");
}
function shareHTML(e){
  return `<details class="more share-box"><summary>Share with a partner</summary><div class="inside">
    <p class="legend" style="margin:0">Only the text below is shared, and only when you send it. Edit or remove anything first. Confession is never included.</p>
    <textarea id="sharetext" rows="6" aria-label="Text to share">${esc(shareText(e))}</textarea>
    <div class="btns"><button class="btn primary sm" data-act="share">Share</button><button class="btn sm" data-act="copyshare">Copy</button></div></div></details>`;
}

/* ---------- export for sermon prep ---------- */
function prepBlock(e,incConf){
  const L=[], line=(k,v)=>{ if(!v||!String(v).trim()) return; const parts=String(v).split(/\n+/).map(x=>x.trim().replace(/^[-*\u2022]\s*/,"")).filter(Boolean); if(parts.length<2) L.push(`- ${k}: ${parts[0]||""}`); else { L.push(`- ${k}:`); parts.forEach(x=>L.push(`  - ${x}`)); } };
  const thread=t=>{ const ls=(t||[]).filter(l=>l.t&&l.t.trim()); if(ls.length){ L.push("- Listening conversation:"); ls.forEach(l=>L.push(`  - ${l.r==="G"?"Listening (sensed)":"Me"}: ${l.t.trim()}`)); } };
  if(e.type==="journal"){
    L.push(`## Listening prayer · ${fmtDate(e.date)}${e.title?" · "+e.title:""}`);
    line("Stillness and thanks",e.praise); line("What stood out",e.standout); thread(e.thread); line("Scripture that came to mind",e.scripture); line("Notes",e.notes);
    (e.actions||[]).filter(a=>a.t).forEach(a=>line("Step",a.t+(a.done?" (done)":"")));
  } else if(e.type==="smorp"){
    L.push(`## RHEMA · ${e.passage||"(no passage)"} · ${fmtDate(e.date)}`);
    line("Read (what held me)",e.standout); line("Hear"+((e.msgKinds||[]).length?" ("+e.msgKinds.join(", ")+")":""),e.message);
    { const x=examVals(e), ans=EXAM.filter(q=>x[q.k]).map(q=>`${q.short} ${({pass:"yes",unclear:"not sure",fail:"no"})[x[q.k]]}`); if(ans.length) L.push("- Examine: "+ans.join(", ")); }
    if(incConf) line("Examine (my heart)",e.repentance);
    line("Move (my step)",e.obedience); line("Abide (prayer)",e.prayer); line("Memory verse",e.memory); thread(e.thread);
  } else if(e.type==="weigh"){
    L.push(`## Weighing a word · ${fmtDate(e.date)}`);
    line("Question",e.question); line("What I sensed",e.what); line("How it came",[e.how,e.howNote].filter(Boolean).join(": ")); line("Timing",e.when);
    const res=TESTS.map(x=>{ const v=testVal(e,x.k); return v.v?`${x.name} ${({pass:"yes",unclear:"unclear",fail:"no"})[v.v]}${v.n?" ("+v.n+")":""}`:""; }).filter(Boolean);
    if(res.length) line("Tests",res.join("; "));
    line("Where it stands",verdict(e).label);
    const o=e.outcome||{}; if(o.acted&&o.acted!=="Not yet") line("Outcome",[o.acted,o.date,o.result].filter(Boolean).join(", ")); line("Lessons",o.lesson);
  }
  return L.join("\n");
}
function prepText(list,incConf){
  const focus=route.name==="entries"?(filter.label||filter.q.trim()):"";
  const items=list.slice(0,40);
  return [`# Sermon prep notes from Akouō`, focus?`Focus: ${focus}`:"", `${items.length} ${items.length===1?"entry":"entries"} · exported ${fmtDate(today())}`, "",
    ...items.map(e=>prepBlock(e,incConf)+"\n"),
    "Request: Please help me develop a sermon from these notes using ME-WE-GOD-YOU-WE. Keep the exegesis first and the application practical."].filter((x,i)=>x!==""||i===3).join("\n");
}
function prepHTML(where){
  if(V1) return ""; // sermon prep export arrives with RHEMA in Version 2
  return `<details class="more prep-box" data-where="${where}"><summary id="prepcount">Export for sermon prep</summary><div class="inside">
    <p class="legend" style="margin:0">${where==="list"?"Exports the entries shown below (up to 40). Search a passage, like John 10, to gather everything on it.":"Copies this whole entry, ready to paste into a sermon prep conversation."} Edit anything before sending.</p>
    <label class="check small"><input type="checkbox" id="prepconf"><span>Include my Examine confession</span></label>
    <textarea id="preptext" rows="8" aria-label="Sermon prep notes"></textarea>
    <div class="btns"><button class="btn primary sm" data-act="prepshare">Share</button><button class="btn sm" data-act="prepcopy">Copy</button></div></div></details>`;
}
function fillPrep(){
  const ta=$("#preptext"); if(!ta) return; const inc=!!($("#prepconf")&&$("#prepconf").checked);
  const list=route.name==="entries"?filteredEntries():[curEntry()].filter(Boolean);
  ta.value=list.length?prepText(list,inc):"No entries to export. Change the search or filter above.";
}

/* ---------- rhythm calendar ---------- */
function rhythmHTML(m){
  const days=new Set();
  Object.values(entries).forEach(e=>{
    if(["journal","smorp","weigh","whisper"].includes(e.type)&&(e.date||"").slice(0,7)===m) days.add(e.date);
    if(e.type==="prayer") (e.prayLog||[]).forEach(t=>{ const d=ymd(new Date(t)); if(d.slice(0,7)===m) days.add(d); });
  });
  const first=new Date(m+"-01T12:00:00"), dim=new Date(first.getFullYear(),first.getMonth()+1,0).getDate(), pad=first.getDay(), td=today();
  let cells=""; for(let i=0;i<pad;i++) cells+=`<span class="rc empty"></span>`;
  for(let d=1;d<=dim;d++){ const k=m+"-"+String(d).padStart(2,"0"); cells+=`<span class="rc${days.has(k)?" met":""}${k===td?" today":""}" aria-label="${k}${days.has(k)?", met with Him":""}">${d}</span>`; }
  return `<section class="stack"><h3 class="sec">YOUR RHYTHM</h3>
    <div class="card flat rhythm"><div class="rgrid">${["S","M","T","W","T","F","S"].map(x=>`<span class="rh">${x}</span>`).join("")}${cells}</div>
    <p class="legend" style="margin:0">${days.size} ${days.size===1?"day":"days"} with Him this month. Not a score: just a picture of your rhythm.</p></div></section>`;
}

/* ---------- walk ---------- */
const WALK_ROUTES=["walk","whisper","selah","comeaway","journey"];
const backToWalk=`<a class="crumb" href="#walk">‹ Walk</a>`;
const monthName=m=>new Date(m+"-15T12:00:00").toLocaleDateString(undefined,{month:"long",year:"numeric"});
const monthOnly=m=>new Date(m+"-15T12:00:00").toLocaleDateString(undefined,{month:"long"});
function selahDefaultMonth(){ const d=new Date(); if(d.getDate()<=7) d.setMonth(d.getMonth()-1); return ymd(d).slice(0,7); }
let selahMonth=null;
// Support link (website only: Apple doesn't allow outside payment links in iPhone apps).
const SUPPORT_URL = "https://square.link/u/M0WSzC2T";
function supportCardHTML(){
  if(NATIVE) return "";
  return `<div class="card support-card"><h3 class="sec">SUPPORT AKOUŌ</h3>
    <p style="margin:0">Akouō is free, with no ads. If it's helping you hear Him, you can help keep it that way.</p>
    <p class="legend" style="margin:0">Most people give $5 or $10. This is a personal gift to support the app, not a charitable donation, so no tax receipt is issued.</p>
    <div class="btns"><a class="btn primary" href="${SUPPORT_URL}" target="_blank" rel="noopener">Give a gift</a></div></div>`;
}
// The support bar on the website: above the tabs on phones, at the bottom on wide screens.
// Left out of the iPhone app, while writing an entry, in Pray now and during a Come Away day.
// "×" hides it for 14 days; after tapping Support it rests for 30 days.
const SB_KEY="akouo.supportHide";
function supportBarHTML(inFocus){
  if(NATIVE||inFocus) return "";
  try{ if(Date.now()<(+localStorage.getItem(SB_KEY)||0)) return ""; }catch(e){}
  return `<div class="supportbar" id="supportbar" role="region" aria-label="Support Akouō">
    <span class="sb-text"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg><span>Akouō is free, with no ads.<span class="sb-more"> Help keep it that way.</span></span></span>
    <a class="btn primary sm" href="${SUPPORT_URL}" target="_blank" rel="noopener" data-act="sbgive">Support</a>
    <button class="sb-x" data-act="sbclose" aria-label="Hide for now">×</button></div>`;
}
function hideSupportBar(days){ try{ localStorage.setItem(SB_KEY,String(Date.now()+days*864e5)); }catch(e){} const el=$("#supportbar"); if(el) el.remove(); document.body.classList.remove("has-sb"); }
function comeAwaySub(){ const j=settings.journey, jd=j&&JOURNEYS.find(x=>x.key===j.key); return jd?`${jd.title} · Day ${Math.min(j.day,jd.days.length)}`:"Guided time with Jesus"; }
function fmtTime(t){ const [h,m]=String(t).split(":").map(Number); return `${(h%12)||12}:${String(m||0).padStart(2,"0")} ${h<12?"a.m.":"p.m."}`; }
function reminderCardHTML(){ const r=reminderGet();
  return `<div class="card"><h3 class="sec">DAILY REMINDER</h3><p class="muted small" style="margin:0">A gentle nudge each day to come away and listen.</p>
    <div class="set-row"><label class="check small" style="margin:0"><input type="checkbox" id="rem-on"${r.on?" checked":""}><span>Remind me every day</span></label>
      <input type="time" id="rem-time" value="${esc(r.time)}" aria-label="Reminder time" style="width:auto"></div></div>`; }
function walkHTML(){
  const st=allStones(), j=settings.journey, jd=j&&JOURNEYS.find(x=>x.key===j.key);
  const sm=selahDefaultMonth(), firstWeek=new Date().getDate()<=7;
  const card=(href,title,sub,soft)=>`<a class="wcard${soft?" soft":""}" href="${href}"><span><b>${title}</b><span>${sub}</span></span><span class="chev" aria-hidden="true">›</span></a>`;
  return `<div class="stack-lg">
    <div><p class="eyebrow">WALK · περιπατέω</p><h2 class="big">Walk by the Spirit.</h2><p class="ref" style="margin:4px 0 0;font-size:.95rem">Galatians 5:16</p></div>
    ${whisperBar()}
    <div class="stack">
      ${card("#selah","Selah",firstWeek?`Your ${esc(monthOnly(sm))} review is ready`:`Review ${esc(monthOnly(sm))} so far`,firstWeek)}
      ${card("#comeaway","Come Away",jd?`${esc(jd.title)} · Day ${Math.min(j.day,jd.days.length)} of ${jd.days.length}`:"Guided days of retreat, fasting and waiting")}
    </div></div>`;
}
const whisperBar=()=>`<a class="whisper-bar" href="#whisper"><span>I sensed something…</span><span class="plus" aria-hidden="true">+</span></a>`;

/* whisper */
let whisperIntent="weigh";
const INTENTS=[["weigh","Weigh it later"],["pray","Pray about it"],["step","Make it a step"],["keep","Just keep it"]];
function whisperStatus(w){
  const l=w.linkedId&&entries[w.linkedId];
  if(w.intent==="pray") return l?`On your prayer list${l.status==="answered"?" · answered":l.prayedCount?` · prayed ${l.prayedCount} times`:""}`:"Prayer request removed";
  if(w.intent==="step") return l?(l.done?"Became a step · done":"Became a step"):"Step removed";
  if(w.intent==="weigh") return l?`Weighed · ${verdict(l).short}`:"Waiting to be weighed";
  return "Kept";
}
function whisperHTML(){
  const list=Object.values(entries).filter(e=>e.type==="whisper").sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).slice(0,15);
  const when=ms=>new Date(ms).toLocaleString(undefined,{weekday:"short",hour:"numeric",minute:"2-digit"});
  return `<div class="stack">${backToWalk}
    <div><h2 class="big">What did you sense?</h2><p class="ref" style="margin:4px 0 0">"And after the fire the sound of a low whisper." 1 Kings 19:12</p></div>
    <form class="card" id="whisperform">
      <label class="fld"><span>Write it down before it fades</span><textarea id="wtext" rows="3" placeholder="One line is enough" style="min-height:84px"></textarea></label>
      <div class="chips" role="group" aria-label="What is it for?">${INTENTS.map(([k,l])=>`<button type="button" class="chip" data-act="wintent" data-k="${k}" aria-pressed="${whisperIntent===k}">${l}</button>`).join("")}</div>
      <button class="btn primary block" type="submit">Save whisper</button>
    </form>
    ${list.length?`<h3 class="sec">RECENT WHISPERS</h3><ul class="list">${list.map(w=>{
      const l=w.linkedId&&entries[w.linkedId];
      const acts=w.intent==="weigh"&&!l?`<button class="btn sm" data-act="wweigh" data-id="${w.id}">Weigh</button>`
        :w.intent==="keep"?`<button class="btn sm" data-act="wweigh" data-id="${w.id}">Weigh</button><button class="btn sm" data-act="wpray" data-id="${w.id}">Pray</button><button class="btn sm" data-act="wstep" data-id="${w.id}">Step</button>`
        :l?`<button class="btn sm ghost" data-act="open" data-id="${l.id}">Open</button>`:"";
      return `<li class="wrow"><p class="wt">${esc(w.t)}</p><div class="wmeta"><span>${esc(when(w.createdAt))} · ${esc(whisperStatus(w))}</span><span class="btns">${acts}<button class="btn sm ghost" data-act="wdel" data-id="${w.id}" aria-label="Delete whisper">×</button></span></div></li>`;}).join("")}</ul>`
      :`<div class="empty-card">Whispers you capture will gather here, so nothing He prompts gets lost on a busy day.</div>`}
  </div>`;
}
function whisperTo(w,intent){
  let linked=null;
  if(intent==="pray"){ linked={id:newId(),type:"prayer",title:w.t,who:"",cat:"",freq:"daily",details:"",promise:"",thread:[],status:"active",prayedCount:0,lastPrayed:0,prayLog:[],date:today(),createdAt:Date.now()}; }
  if(intent==="step"){ linked={id:newId(),type:"task",t:w.t,done:false,doneAt:0,date:today(),createdAt:Date.now()}; }
  if(linked){ touch(linked); w.linkedId=linked.id; }
  w.intent=intent; touch(w);
}

/* stones */
let stoneFilter="all";
const STONE_KINDS=[["prayer","Answered prayer"],["word","Word fulfilled"],["testimony","Testimony"]];
function allStones(){
  const out=[];
  for(const e of Object.values(entries)){
    if(e.type==="prayer"&&e.status==="answered"&&(e.title||"").trim()) out.push({kind:"prayer",date:e.answeredAt||e.date,title:e.title,text:e.answer||(e.prayedCount?`Prayed ${e.prayedCount} ${e.prayedCount===1?"time":"times"}.`:""),id:e.id});
    else if(e.type==="weigh"&&e.outcome&&e.outcome.stone) out.push({kind:"word",date:e.outcome.date||e.date,title:e.question||e.what||"A word fulfilled",text:e.outcome.result||e.what||"",id:e.id});
    else if(e.type==="stone"&&((e.title||"").trim()||(e.detail||"").trim())) out.push({kind:e.kind||"testimony",date:e.date,title:e.title||"A stone of remembrance",text:e.detail||"",id:e.id});
  }
  return out.sort((a,b)=>(b.date||"").localeCompare(a.date||""));
}
function stonesHTML(){
  const all=allStones(), list=stoneFilter==="all"?all:all.filter(s=>s.kind===stoneFilter);
  const chip=(k,l)=>`<button class="chip" data-act="sfilter" data-k="${k}" aria-pressed="${stoneFilter===k}">${l}</button>`;
  const label=k=>(STONE_KINDS.find(x=>x[0]===k)||STONE_KINDS[2])[1];
  return `<div class="stack"><a class="crumb" href="#prayer">‹ Prayer</a>
    <div><p class="eyebrow">STONES (ANSWERED PRAYERS)</p><h2 class="big">"Thus far the LORD has helped us."</h2><p class="ref" style="margin:4px 0 0">1 Samuel 7:12${all.length?` · ${all.length} ${all.length===1?"stone":"stones"} raised`:""}</p></div>
    <button class="btn primary block" data-act="newstone">Raise a stone</button>
    ${all.length?`<div class="chips">${chip("all","All")}${STONE_KINDS.map(([k,l])=>chip(k,l)).join("")}</div>`:""}
    ${list.length?`<ol class="timeline">${list.map(s=>`<li class="tl tl-${s.kind}"><button class="tl-btn" data-act="open" data-id="${s.id}"><span class="tl-meta">${esc(fmtDate(s.date).toUpperCase())} · ${esc(label(s.kind).toUpperCase())}</span><b>${esc(s.title)}</b>${s.text?`<span class="tl-text">${esc(s.text)}</span>`:""}</button></li>`).join("")}</ol>`
      :`<div class="empty-card">${all.length?"No stones of this kind yet.":"Answered prayers and fulfilled words gather here on their own. You can also raise a stone for anything God has done."}</div>`}
  </div>`;
}
function stoneHTML(e){
  return `<div class="stack">
    <div><p class="eyebrow">STONE OF REMEMBRANCE</p><h2 class="date-line">${esc(e.title||"What has God done?")}</h2></div>
    <div class="card">
      ${input("What has God done?","title",e,{ph:"e.g. Provision for the furnace repair"})}
      <div class="row2">${input("Date","date",e,{type:"date"})}<label class="fld"><span>Kind</span><select id="f-kind" data-f="kind">${STONE_KINDS.map(([k,l])=>`<option value="${k}"${(e.kind||"testimony")===k?" selected":""}>${l}</option>`).join("")}</select></label></div>
      ${area("The story","detail",e,{rows:4,ph:"How it happened, and what it taught you about Him"})}
      ${input("Scripture","scripture",e,{ph:"e.g. Psalm 103:2"})}
    </div>${delBtn}</div>`;
}

/* selah */
function inMonth(ms,m){ return ms&&ymd(new Date(ms)).slice(0,7)===m; }
function selahHTML(){
  const m=selahMonth||selahDefaultMonth(), cur=ymd(new Date()).slice(0,7);
  const ents=sorted("all").filter(e=>(e.date||"").slice(0,7)===m);
  const rhemaDays=new Set(ents.filter(e=>e.type==="smorp").map(e=>e.date)).size;
  const prayed=Object.values(entries).filter(e=>e.type==="prayer").reduce((n,e)=>n+(e.prayLog||[]).filter(t=>inMonth(t,m)).length,0);
  const obeyed=allSteps().filter(s=>s.done&&inMonth(s.doneAt,m)).length;
  const th=findThemes(ents,settings.hiddenThemes||[]), themes=[...th.phrases,...th.words,...th.passages].slice(0,6);
  const stones=allStones().filter(s=>(s.date||"").slice(0,7)===m);
  const rec=entries["e-selah-"+m]||{};
  const q=(k,label,ph)=>`<label class="fld"><span class="qlabel">${label}</span><textarea id="selah-${k}" data-selah="${k}" rows="2" placeholder="${esc(ph)}">${esc(rec[k]||"")}</textarea></label>`;
  return `<div class="stack">${backToWalk}
    <div><div class="month-nav"><button class="btn sm ghost" data-act="selahprev" aria-label="Previous month">‹</button><p class="eyebrow">${esc(monthName(m).toUpperCase())}</p>${m<cur?`<button class="btn sm ghost" data-act="selahnext" aria-label="Next month">›</button>`:"<span></span>"}</div>
      <h2 class="big">Pause and consider.</h2><p class="ref" style="margin:4px 0 0">"I will remember the deeds of the LORD." Psalm 77:11</p></div>
    <div class="stats">
      <div class="stat"><b>${ents.length}</b><span>entries written</span></div>
      ${V1?"":`<div class="stat"><b>${rhemaDays}</b><span>days in RHEMA</span></div>`}
      <div class="stat"><b>${prayed}</b><span>times prayed</span></div>
      <div class="stat"><b>${obeyed}</b><span>steps obeyed</span></div>
    </div>
    ${rhythmHTML(m)}
    ${themes.length?`<section class="stack"><h3 class="sec">WHAT KEPT COMING UP</h3><div class="chips">${themes.map(t=>`<span class="theme static">${esc(t.label)}<span class="cnt">${t.n}</span></span>`).join("")}</div></section>`:""}
    ${stones.length?`<section class="stack"><h3 class="sec">STONES RAISED</h3><p class="stone-line">${stones.map(s=>esc(s.title)).join(" · ")}</p></section>`:""}
    <div class="card">
      ${q("q1","What has God been saying to me this month?","Look back over your entries and what kept coming up.")}
      ${q("q2","Where did I obey? Where did I hold back?","Be honest; this is between you and Him.")}
      ${q("q3","What will I carry into next month?","One word, verse or step.")}
      <p class="legend" style="margin:0">Your reflections save as you type.</p>
    </div>${shareHTML(Object.assign({type:"selah",month:m},rec))}</div>`;
}

/* come away */
const jt={left:0,total:0,run:false,iv:null};
function comeAwayHTML(){
  const j=settings.journey, jd=j&&JOURNEYS.find(x=>x.key===j.key);
  const done=settings.journeysDone||[];
  const active=jd?`<div class="card journey-now"><p class="eyebrow">${esc(jd.title.toUpperCase())} · DAY ${Math.min(j.day,jd.days.length)} OF ${jd.days.length}</p>
      <div class="progress" aria-hidden="true"><i style="width:${Math.round((j.day-1)/jd.days.length*100)}%"></i></div>
      <b class="jpass">${esc(jd.days[j.day-1].p)}</b><p class="muted" style="margin:0">${esc(jd.days[j.day-1].q)}</p>
      <a class="btn primary block" href="#journey">Begin Day ${j.day}</a></div>`:"";
  return `<div class="stack">${backToWalk}
    <div><h2 class="big">"Come away and rest a while."</h2><p class="ref" style="margin:4px 0 0">Mark 6:31 · Guided days for retreat, fasting and seasons of waiting</p></div>
    ${active}
    <h3 class="sec">${jd?"OTHER JOURNEYS":"JOURNEYS"}</h3>
    <ul class="list">${JOURNEYS.filter(x=>!jd||x.key!==jd.key).map(x=>`<li><div class="jrow"><span class="row-main"><span class="t">${esc(x.title)}</span><span class="d">${x.days.length} days · ${esc(x.blurb)}${done.some(d=>d.key===x.key)?" · completed":""}</span></span><button class="btn sm" data-act="jstart" data-k="${x.key}">Start</button></div></li>`).join("")}</ul>
    ${jd?`<button class="btn ghost" data-act="jend">End this journey</button>`:""}</div>`;
}
function journeyHTML(){
  const j=settings.journey, jd=j&&JOURNEYS.find(x=>x.key===j.key);
  if(!jd) return `<div class="stack">${backToWalk}<div class="empty-card">No journey in progress. Choose one in Come Away.</div><a class="btn" href="#comeaway">Choose a journey</a></div>`;
  const d=jd.days[j.day-1];
  if(!jt.total){ jt.total=jt.left=d.s*60; }
  return `<div class="stack"><a class="crumb" href="#comeaway">‹ Come Away</a>
    <div><p class="eyebrow">${esc(jd.title.toUpperCase())} · DAY ${j.day} OF ${jd.days.length}</p><h2 class="big">${esc(d.p)}</h2></div>
    <div class="card"><h3 class="sec">READ</h3><p style="margin:0">Read the passage twice, slowly. Notice what holds you.</p><a class="btn" href="${bgLink(d.p,settings.version)}" target="_blank" rel="noopener">Open ${esc(d.p)} (${esc(settings.version)})</a></div>
    <div class="card"><h3 class="sec">BE STILL</h3><p style="margin:0">${d.s} minutes of silence. Let your thoughts settle. When they wander, return to a phrase from the passage.</p>
      <div class="jclock" id="jclock">${fmtClock(jt.left)}</div>
      <div class="btns"><button class="btn primary" data-act="jtimer" id="jtimerbtn">${jt.run?"Pause":jt.left<jt.total?"Resume":"Start"}</button><button class="btn" data-act="jreset">Reset</button></div></div>
    <div class="card"><h3 class="sec">WHAT STOOD OUT?</h3><p class="legend" style="margin:0">The word, phrase or verse the Holy Spirit highlighted as you read and sat still. Akouō watches for words that keep coming back across your entries.</p>
      <label class="fld"><textarea id="jstand" data-jstand="1" rows="2" placeholder="A word, phrase or verse..." aria-label="What passage or phrase stood out">${esc((jDayEntry(false)||{}).standout||"")}</textarea></label></div>
    <div class="card"><h3 class="sec">ASK</h3><p class="jq">${esc(d.q)}</p><button class="btn" data-act="jjournal">Listen and write</button></div>
    <button class="btn primary block" data-act="jdone">${j.day>=jd.days.length?"Finish the journey":"Complete Day "+j.day}</button></div>`;
}
// This journey day's listening entry (created quietly when "What stood out?" is first typed).
function jDayEntry(create){
  const j=settings.journey, jd=j&&JOURNEYS.find(x=>x.key===j.key); if(!jd) return null;
  const since=j.startedAt||"";
  let e=Object.values(entries).filter(x=>{ if(x.type!=="journal"||(x.date||"")<since) return false; const o=journeyOf(x); return o&&o.jd.key===jd.key&&o.day===j.day; })
    .sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))[0];
  if(!e&&create){ const d=jd.days[j.day-1];
    e={id:newId(),type:"journal",date:today(),createdAt:Date.now(),title:`${jd.title} · Day ${j.day}`,journeyKey:jd.key,journeyDay:j.day,praise:"",standout:"",scripture:d.p,checks:{},notes:"",actions:[],thread:[{r:"R",t:d.q},{r:"G",t:""}]};
    touch(e); }
  return e||null;
}
const fmtClock=s=>Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
function jPaint(){ const c=$("#jclock"); if(c) c.textContent=fmtClock(jt.left); const b=$("#jtimerbtn"); if(b) b.textContent=jt.run?"Pause":jt.left<jt.total&&jt.left>0?"Resume":"Start"; }
function jStop(){ clearInterval(jt.iv); jt.iv=null; jt.run=false; }
function jChime(){ try{ const A=window.AudioContext||window.webkitAudioContext, a=new A(); [523.25,659.25,783.99].forEach((f,i)=>{ const o=a.createOscillator(), g=a.createGain(); o.frequency.value=f; g.gain.setValueAtTime(0,a.currentTime+i*.4); g.gain.linearRampToValueAtTime(.18,a.currentTime+i*.4+.03); g.gain.exponentialRampToValueAtTime(.001,a.currentTime+i*.4+1.5); o.connect(g).connect(a.destination); o.start(a.currentTime+i*.4); o.stop(a.currentTime+i*.4+1.6); }); }catch(e){} }
function jToggle(){
  if(jt.run){ jStop(); jPaint(); return; }
  if(jt.left<=0) jt.left=jt.total;
  jt.run=true; const end=Date.now()+jt.left*1000;
  jt.iv=setInterval(()=>{ jt.left=Math.max(0,Math.round((end-Date.now())/1000)); if(jt.left===0){ jStop(); jChime(); } jPaint(); },250); jPaint();
}

/* ---------- learn ---------- */
const learnOpen=new Set();
function refLinks(str){ return str.split(";").map(r=>r.trim()).filter(Boolean).map(r=>`<a href="${bgLink(r,settings.version)}" target="_blank" rel="noopener">${esc(r)}</a>`).join(""); }
function learnHTML(){
  const quick=QUICK.filter(q=>!(V1&&/RHEMA/.test(q.title))).map(q=>`<details class="more"><summary>${esc(q.title)}</summary><div class="inside"><ul class="qref">${q.items.map(i=>`<li>${esc(i)}</li>`).join("")}</ul></div></details>`).join("");
  const lessons=LESSONS.map((l,i)=>`<details class="lesson" data-lesson="${i}"${learnOpen.has(i)?" open":""}><summary><span class="ltitle"><b>${esc(l.title)}</b><span>${esc(l.question)}</span></span></summary>
    <div class="lbody">
      <h4 class="lsub">KEY IDEAS</h4><ul class="ideas">${l.ideas.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
      ${l.balance?`<div class="balance"><b>A word of balance</b><p>${esc(l.balance)}</p></div>`:""}
      <h4 class="lsub">KEY PASSAGES</h4><div class="refs">${refLinks(l.passages)}</div>
      <h4 class="lsub">CHECK YOUR UNDERSTANDING</h4>
      <ol class="checksq">${l.checks.map(c=>`<li><span>${esc(c.q)}</span><details class="hint"><summary>Hint</summary><p>${esc(c.hint)}</p></details></li>`).join("")}</ol>
      ${V1&&l.practice.type==="smorp"?"":`<div class="btns"><button class="btn primary sm" data-act="practice" data-i="${i}">${esc(l.practice.label)}</button></div>`}
    </div></details>`).join("");
  return `<div class="stack"><div><h2 class="big">Learn</h2><p class="muted" style="margin:4px 0 0">Short teachings on hearing God's voice, grounded in Scripture. Passages open in your chosen translation.</p></div>
    ${guideHTML("learn")}
    <div class="card flat name-card"><h3 class="sec">ABOUT THE NAME</h3>
      <p style="margin:0"><b class="gk">Akouō</b> <span class="gk-g">ἀκούω</span> is the Greek word for <i>hear</i> in John 10:27: "My sheep hear my voice." It describes the life of the sheep: hearing, being known, and following.</p>
      ${V1?"":`<p style="margin:0"><b class="gk">RHEMA</b>, the daily pattern, comes from <span class="gk-g">ῥῆμα</span> (rhēma), a spoken word: Scripture pressed home by the Spirit. Read, Hear, Examine, Move, Abide.</p>`}</div>
    <div class="card flat author-card"><h3 class="sec">ABOUT THE AUTHOR</h3>
      <p class="author-name">Pastor Barry Mossip</p>
      <p style="margin:0">Pastor Barry Mossip is a First Nations pastor and the Senior Pastor of Roseisle Pentecostal Assembly in rural Manitoba. He holds ministerial credentials with the Pentecostal Assemblies of Canada (PAOC). Raised in Thompson, Manitoba, Barry carries a heart for prayer, deep study of the Scriptures, discipleship and the unity of the church. He is the author of <i>Conquering Shadows</i>.</p>
      <p style="margin:0">Akouō grew out of his own practice of listening prayer and his teaching on discernment. The seven tests in Weigh a Word come from his study on discerning the spirits.</p></div>
    ${supportCardHTML()}
    <div class="card flat"><h3 class="sec">QUICK REFERENCE</h3>${quick}</div>
    <div class="stack">${lessons}</div></div>`;
}

/* ---------- settings ---------- */
function settingsHTML(){
  const p=PLANS.find(x=>x.key===settings.plan)||PLANS[0];
  const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone;
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  const install=standalone||NATIVE?"":`<div class="card"><h3 class="sec">INSTALL ON THIS DEVICE</h3>${installEvt?`<p class="muted" style="margin:0">Add the journal to your home screen so it opens like an app.</p><div class="btns"><button class="btn primary" data-act="install">Install app</button></div>`:ios?`<p style="margin:0">In Safari, tap the <b>Share</b> button, then <b>Add to Home Screen</b>. It will open full screen like an app.</p>`:`<p style="margin:0">Open your browser's menu and choose <b>Install app</b> or <b>Add to Home Screen</b>.</p>`}</div>`;
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
${V1?"":`    <div class="card"><h3 class="sec">READING</h3>
      <div class="set-row"><span>${settings.readMode==="own"?`My own reading${nextRead().ref?" · next: "+esc(nextRead().ref):""}`:`Plan: ${esc(p.title)}`}</span><a class="btn sm" href="#plans">Change</a></div>
      ${settings.readMode==="own"?"":`<ul class="days">${p.days.map((d,i)=>{const k=p.key+"-"+i;return `<li><input type="checkbox" id="rd-${k}" data-read="${k}"${settings.readings[k]?" checked":""} aria-label="Mark ${esc(d)} read"><span class="n">Day ${i+1}</span><a href="${bgLink(d,settings.version)}" target="_blank" rel="noopener">${esc(d)}</a></li>`;}).join("")}</ul>
      <p class="muted small" style="margin:0">A reading counts as done when you tap Complete at the bottom of its RHEMA.</p>`}</div>
`}
    ${NATIVE?reminderCardHTML():""}
    <div class="card"><h3 class="sec">STARTER QUESTIONS</h3>
      <ul class="qlist">${settings.questions.map((q,i)=>`<li><span>${esc(q)}</span><button class="btn sm ghost danger" data-act="delq" data-i="${i}" aria-label="Remove question">Remove</button></li>`).join("")}</ul>
      <div class="row2"><input type="text" id="newq" placeholder="Add your own question" aria-label="New question"></div>
      <div class="btns"><button class="btn sm" data-act="addq">Add question</button><button class="btn sm ghost" data-act="resetq">Restore defaults</button></div></div>
    <div class="card"><h3 class="sec">KEEPS COMING UP</h3>
      ${(settings.hiddenThemes||[]).length?`<p class="muted small" style="margin:0">Hidden from Today:</p><ul class="qlist">${settings.hiddenThemes.map((h,i)=>`<li><span>${esc(h)}</span><button class="btn sm ghost" data-act="unhide" data-i="${i}">Show again</button></li>`).join("")}</ul>`:`<p class="muted small" style="margin:0">Tap the \u00d7 beside a word on Today to hide it, for example a name you write often. Hidden words are listed here.</p>`}</div>
    <div class="card"><h3 class="sec">BACKUP</h3>
      <p class="muted" style="margin:0">Your journal is saved to your account automatically. A backup file is extra peace of mind${V1?".":", and also brings entries over from the earlier version in Claude."}</p>
      <div class="btns"><button class="btn" data-act="export">Download backup</button><label class="btn" for="imfile">Restore from file</label><input type="file" id="imfile" accept=".json,application/json" hidden></div></div>
    ${supportCardHTML()}
    <div class="card"><h3 class="sec">PRIVACY</h3>
      <p style="margin:0" class="small">Entries are stored in Google Firebase in Canada (Montréal) under your account. Security rules let only you read or change them. The person who runs this app's Firebase project administers the database and could technically access it, so share sign-up only with people who know and trust that arrangement. Deleting your account erases your entries.</p></div>
    <div class="card danger-zone"><h3 class="sec">DELETE ACCOUNT</h3>
      <details class="more"><summary>Delete my account and all entries</summary><div class="inside">
        <p class="small" style="margin:0">This permanently erases your account and every entry. Download a backup first if you want to keep anything.</p>
        <label class="fld"><span>Enter your password to confirm</span><input type="password" id="del-pw" autocomplete="current-password"></label>
        <div class="btns"><button class="btn danger" data-act="delacct">Delete forever</button></div></div></details></div>
    <p class="muted small" style="text-align:center">Akouō ${VERSION} · A listening prayer journal<br>Hear God. Test it. Follow.<br>ἀκούω, "I hear." John 10:27</p></div>`;
}

/* ================= events ================= */
function curEntry(){ return route.name==="entry"?entries[route.id]:null; }
document.addEventListener("submit",ev=>{
  if(ev.target.id==="auth-form"){ ev.preventDefault(); submitAuth(); }
  if(ev.target.id==="whisperform"){ ev.preventDefault(); const ta=$("#wtext"), t=ta.value.trim(); if(!t){ toast("Write what you sensed first."); return; }
    const w={id:newId(),type:"whisper",t,intent:"keep",date:today(),createdAt:Date.now()};
    whisperTo(w,whisperIntent); renderMain(); toast(whisperIntent==="pray"?"Saved and added to your prayer list":whisperIntent==="step"?"Saved and added to Next steps":whisperIntent==="weigh"?"Saved. Weigh it when you have time.":"Whisper saved"); return; }
  if(ev.target.id==="addprayer"){ ev.preventDefault(); const inp=$("#newprayer"), t=inp.value.trim(); if(!t) return;
    const e={id:newId(),type:"prayer",title:t,who:"",cat:"",freq:"daily",details:"",promise:"",thread:[],status:"active",prayedCount:0,lastPrayed:0,date:today(),createdAt:Date.now()};
    touch(e); inp.value=""; prayFilter.status="active"; renderMain(); $("#newprayer").focus(); toast("Added to your prayer list"); return; }
  if(ev.target.id==="addstep"){ ev.preventDefault(); const inp=$("#newstep"), t=inp.value.trim(); if(!t) return;
    const e={id:newId(),type:"task",t,done:false,doneAt:0,date:today(),createdAt:Date.now()}; touch(e); inp.value=""; inp.blur(); renderMain(); toast("Step added"); }
});
document.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-act]"); if(!b) return;
  const a=b.dataset.act, e=curEntry();
  switch(a){
    case "sbclose": hideSupportBar(14); break;
    case "sbgive": setTimeout(()=>hideSupportBar(30),300); break;
    case "amode": { authMode=b.dataset.m; authErr=""; authInfo=""; const em=$("#a-email"); if(em) authEmail=em.value; render(); break; }
    case "showpw": { const i=$("#a-pw"); i.type=i.type==="password"?"text":"password"; b.textContent=i.type==="password"?"Show":"Hide"; break; }
    case "new": {
      if(b.dataset.type==="smorp"){ const nr=nextRead(); const seed={}; if(!nr.done){ seed.passage=nr.ref; if(nr.planDay) seed.planDay=nr.planDay; } newEntry("smorp",seed); }
      else newEntry(b.dataset.type); break; }
    case "open": location.hash="#entry/"+b.dataset.id; break;
    case "back": location.hash=lastList; break;
    case "filter": filter.type=b.dataset.t; $$(".chips .chip").forEach(c=>c.setAttribute("aria-pressed",c.dataset.t===filter.type)); renderEntryList(); { const pb=document.querySelector(".prep-box"); if(pb&&pb.open) fillPrep(); } break;
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
    case "useplan": if(!e) break; { const nr=nextRead(); if(nr.done) break; e.passage=nr.ref; if(nr.planDay) e.planDay=nr.planDay; touch(e); renderMain(); } break;
    case "plancomplete": if(!e||!e.planDay) break; { settings.readings[e.planDay]=true; touchSettings(); const o=planOf(e), nr=nextReading(); renderMain();
      toast(o&&o.p.key===settings.plan&&nr.done?`${o.p.title} complete. Well done.`:`Day ${o?o.day:""} complete${nr.done?"":". Next: "+nr.ref}`); } break;
    case "planundo": if(!e||!e.planDay) break; settings.readings[e.planDay]=false; touchSettings(); renderMain(); break;
    case "kind": if(!e) break; { const s=new Set(e.msgKinds||[]); s.has(b.dataset.k)?s.delete(b.dataset.k):s.add(b.dataset.k); e.msgKinds=[...s]; touch(e); b.setAttribute("aria-pressed",s.has(b.dataset.k)); } break;
    case "test": if(!e) break; {
      const k=b.dataset.k; e.tests=e.tests||{}; e.tests[k]=e.tests[k]||Object.assign({v:"",n:""},testVal(e,k));
      e.tests[k].v=e.tests[k].v===b.dataset.v?"":b.dataset.v; touch(e);
      $$(`[data-act=test][data-k=${k}]`).forEach(x=>x.setAttribute("aria-pressed",x.dataset.v===e.tests[k].v)); repaintVerdict(e); } break;
    case "ex": if(!e) break; {
      const k=b.dataset.k; e.exam=examVals(e); e.exam[k]=e.exam[k]===b.dataset.v?"":b.dataset.v; e.examineOk=EXAM.every(q=>e.exam[q.k]==="pass"); touch(e);
      $$(`[data-act=ex][data-k=${k}]`).forEach(x=>x.setAttribute("aria-pressed",x.dataset.v===e.exam[k]));
      { const st=examState(e), el=$("#exsum"); if(el){ el.dataset.v=st.v; el.innerHTML=examSumHTML(st); } } } break;
    case "exhow": { const p=$("#exh-"+b.dataset.i); if(!p) break; p.hidden=!p.hidden; b.setAttribute("aria-expanded",!p.hidden); b.textContent=p.hidden?"How do I check this?":"Hide help"; break; }
    case "rtoweigh": if(!e) break; {
      flush(e.id); newEntry("weigh",{what:e.message||"",how:"While reading Scripture",howNote:"From RHEMA"+(e.passage?" in "+e.passage:"")+" on "+fmtDate(e.date),tests:e.passage?{scripture:{v:"",n:e.passage}}:{}});
      toast("New matter to weigh"); } break;
    case "rshare": { const d=$(".share-box"); if(d){ d.open=true; d.scrollIntoView({behavior:"smooth",block:"start"}); } break; }
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
    case "practice": { const l=LESSONS[+b.dataset.i], pr=l.practice;
      if(pr.type==="smorp") newEntry("smorp",{passage:pr.passage||""});
      else if(pr.type==="journal") newEntry("journal",Object.assign(pr.question?{thread:[{r:"R",t:pr.question},{r:"G",t:""}]}:{},pr.title?{title:pr.title}:{}));
      else newEntry(pr.type); break; }
    case "pfilter": prayFilter[b.dataset.k]=b.dataset.v; if(b.dataset.k==="status") prayFilter.cat="all"; renderMain(); break;
    case "askhow": if(!e) break; e.thread=[{r:"R",t:"Lord, how do You want me to pray for this?"},{r:"G",t:""}]; touch(e); renderMain(); focusLast(); break;
    case "markanswered": if(!e) break; e.status="answered"; e.answeredAt=today(); touch(e); renderMain(); toast("Praise God! Kept with your answered prayers."); break;
    case "unanswer": if(!e) break; e.status="active"; touch(e); renderMain(); break;
    case "prayed": { const p=entries[pray.queue[pray.i]]; if(p){ p.prayedCount=(p.prayedCount||0)+1; p.lastPrayed=Date.now(); p.prayLog=(p.prayLog||[]).concat([Date.now()]).slice(-300); touch(p); pray.prayed++; } pray.i++; renderMain(); window.scrollTo(0,0); break; }
    case "prayskip": pray.i++; renderMain(); window.scrollTo(0,0); break;
    case "prayanswered": { const p=entries[pray.queue[pray.i]]; if(p){ p.status="answered"; p.answeredAt=today(); p.prayedCount=(p.prayedCount||0)+1; p.lastPrayed=Date.now(); p.prayLog=(p.prayLog||[]).concat([Date.now()]).slice(-300); touch(p); pray.prayed++; toast("Praise God! You can record how He answered on your prayer list."); } pray.i++; renderMain(); window.scrollTo(0,0); break; }
    case "prayagain": startPray(); renderMain(); break;
    case "wintent": whisperIntent=b.dataset.k; $$("[data-act=wintent]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.k===whisperIntent)); break;
    case "wweigh": { const w=entries[b.dataset.id]; if(!w) break; const id=newId(); w.linkedId=id; w.intent="weigh"; touch(w);
      newEntry("weigh",{id,what:w.t,how:"Quiet impression or thought",howNote:"From a whisper on "+fmtDate(w.date)}); break; }
    case "wpray": { const w=entries[b.dataset.id]; if(!w) break; whisperTo(w,"pray"); renderMain(); toast("Added to your prayer list"); break; }
    case "wstep": { const w=entries[b.dataset.id]; if(!w) break; whisperTo(w,"step"); renderMain(); toast("Added to Next steps"); break; }
    case "wdel": { const id=b.dataset.id; if(b.dataset.armed){ removeEntry(id); renderMain(); toast("Whisper deleted"); } else { b.dataset.armed="1"; b.textContent="Delete?"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.armed; b.textContent="×"; } },3000); } break; }
    case "sfilter": stoneFilter=b.dataset.k; renderMain(); break;
    case "newstone": newEntry("stone",{}); break;
    case "selahprev": { const d=new Date((selahMonth||selahDefaultMonth())+"-15T12:00:00"); d.setMonth(d.getMonth()-1); selahMonth=ymd(d).slice(0,7); renderMain(); break; }
    case "selahnext": { const d=new Date((selahMonth||selahDefaultMonth())+"-15T12:00:00"); d.setMonth(d.getMonth()+1); selahMonth=ymd(d).slice(0,7); renderMain(); break; }
    case "jstart": {
      if(settings.journey&&!b.dataset.armed){ b.dataset.armed="1"; b.textContent="Replace current?"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.armed; b.textContent="Start"; } },4000); break; }
      settings.journey={key:b.dataset.k,day:1,startedAt:today()}; touchSettings(); jStop(); jt.total=0; location.hash="#journey"; break; }
    case "jend": if(!b.dataset.armed){ b.dataset.armed="1"; b.textContent="Tap again to end"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.armed; b.textContent="End this journey"; } },4000); break; }
      settings.journey=null; touchSettings(); renderMain(); break;
    case "jtimer": jToggle(); break;
    case "jreset": jStop(); jt.left=jt.total; jPaint(); break;
    case "jjournal": { const j=settings.journey, jd=j&&JOURNEYS.find(x=>x.key===j.key); if(!jd) break; const d=jd.days[j.day-1];
      { const ex=jDayEntry(false); if(ex){ location.hash="#entry/"+ex.id; break; } }
      newEntry("journal",{title:`${jd.title} · Day ${j.day}`,journeyKey:jd.key,journeyDay:j.day,scripture:d.p,thread:[{r:"R",t:d.q},{r:"G",t:""}]}); break; }
    case "jdone": { const j=settings.journey, jd=j&&JOURNEYS.find(x=>x.key===j.key); if(!jd) break; jStop(); jt.total=0;
      const stay=!!b.dataset.stay;
      if(j.day>=jd.days.length){ settings.journeysDone=(settings.journeysDone||[]).concat([{key:jd.key,finishedAt:today()}]); settings.journey=null; touchSettings(); toast(`${jd.title} complete. Well done.`); }
      else { j.day++; touchSettings(); toast(`Day ${j.day-1} complete. Day ${j.day} is ready in Come Away.`); }
      if(stay) renderMain(); else location.hash="#comeaway"; break; }
    case "guide": settings.guideCollapsed=b.dataset.v==="close"; touchSettings(); renderMain(); break;
    case "readmode": settings.readMode=b.dataset.v; touchSettings(); location.hash="#plans"; break;
    case "readmode2": settings.readMode=b.dataset.mode; touchSettings(); renderMain(); break;
    case "pickplan": settings.plan=b.dataset.k; touchSettings(); renderMain(); toast("Plan chosen. Today's reading is ready."); break;
    case "ownsave": { const bk=canonBook($("#ownbook").value); if(!bk){ toast("Choose a book first."); break; }
      const ch=Math.min(Math.max(1,+$("#ownch").value||1),BOOK_CH[bk]); let v1=parseInt($("#ownv1").value,10)||0, v2=parseInt($("#ownv2").value,10)||0;
      if(v2&&!v1){ v1=1; } if(v1&&v2&&v2<v1){ toast("The ending verse comes before the starting verse."); break; }
      settings.ownStart={book:bk,ch,v1,v2,setAt:Date.now()}; settings.ownBook=bk; settings.readMode="own"; touchSettings(); renderMain();
      toast("Your place is saved: "+startRef(settings.ownStart)); break; }
    case "share": { const t=$("#sharetext").value; nativeShare(t).then(ok=>{ if(ok) return; if(navigator.share) navigator.share({text:t}).catch(()=>{}); else copyText(t); }); break; }
    case "copyshare": copyText($("#sharetext").value); break;
    case "prepshare": { const t=$("#preptext").value; if(NATIVE){ nativeShare(t,"Sermon prep notes"); break; } if(navigator.share){ navigator.share({title:"Sermon prep notes",text:t}).catch(()=>{}); } else copyText(t,"#preptext"); break; }
    case "prepcopy": copyText($("#preptext").value,"#preptext"); break;
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
function copyText(t,sel){
  const done=()=>toast(sel==="#preptext"?"Copied. Paste it into your sermon prep conversation.":"Copied. Paste it into a text or email.");
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done,()=>selectShare(sel)); else selectShare(sel);
}
function selectShare(sel){ const ta=$(sel||"#sharetext"); if(ta){ ta.focus(); ta.select(); toast("Text selected. Use your device's Copy."); } }
function focusLast(){ const ts=$$("#main .line textarea"); const t=ts[ts.length-1]; if(t){ t.focus(); } }
document.addEventListener("input",ev=>{
  const t=ev.target;
  if(t.dataset.f&&t.type!=="checkbox"){ const e=curEntry(); if(!e) return; setPath(e,t.dataset.f,t.value); touch(e); if(t.tagName==="TEXTAREA") grow(t); return; }
  if(t.dataset.jstand){ const e=jDayEntry(true); if(!e) return; e.standout=t.value; touch(e); grow(t); return; }
  if(t.id==="q"){ filter.q=t.value; renderEntryList(); const pb=document.querySelector(".prep-box"); if(pb&&pb.open) fillPrep(); return; }
  if(t.dataset.selah){ const m=selahMonth||selahDefaultMonth(), id="e-selah-"+m; const e=entries[id]||{id,type:"selah",month:m,date:m+"-01",createdAt:Date.now()}; e[t.dataset.selah]=t.value; touch(e); grow(t); return; }
});
document.addEventListener("change",ev=>{
  const t=ev.target;
  if(t.dataset.step){ toggleStep(t.dataset.step,t.checked); const li=t.closest(".step"); if(li) li.classList.toggle("done",t.checked); return; }
  if(t.dataset.f&&(t.type==="checkbox"||t.tagName==="SELECT"||t.type==="date")){ const e=curEntry(); if(!e) return; setPath(e,t.dataset.f,t.type==="checkbox"?t.checked:t.value);
    const m=t.dataset.f.match(/^actions\.(\d+)\.done$/); if(m){ e.actions[+m[1]].doneAt=t.checked?Date.now():0; const r=t.closest(".act-row"); if(r) r.classList.toggle("done",t.checked); }
    touch(e); return; }
  if(t.id==="rem-on"||t.id==="rem-time"){ const on=$("#rem-on").checked, time=$("#rem-time").value||"07:00";
    reminderSet(on,time).then(r=>{ if(r.ok) toast(on?`Reminder set for ${fmtTime(time)} each day`:"Daily reminder off");
      else { $("#rem-on").checked=false; toast(r.reason==="denied"?"Notifications are off for Akouō. Turn them on in iPhone Settings, then try again.":"Reminders work in the iPhone app."); } }); return; }
  if(t.dataset.s){ settings[t.dataset.s]=t.value; touchSettings(); renderMain(); return; }
  if(t.id==="ownbook"){ const bk=canonBook(t.value), sel=$("#ownch"); if(sel){ const max=bk?BOOK_CH[bk]:1; sel.innerHTML=Array.from({length:max},(_,i)=>`<option>${i+1}</option>`).join(""); } return; }
  if(t.id==="prepconf"){ fillPrep(); return; }
  if(t.dataset.read){ settings.readings[t.dataset.read]=t.checked; touchSettings(); return; }
  if(t.id==="imfile"&&t.files&&t.files[0]){ const r=new FileReader(); r.onload=()=>importBackup(String(r.result)); r.readAsText(t.files[0]); t.value=""; }
});
document.addEventListener("toggle",ev=>{ const d=ev.target; if(d.classList&&d.classList.contains("prep-box")&&d.open) fillPrep(); },true);
document.addEventListener("toggle",ev=>{ const d=ev.target; if(d.classList&&d.classList.contains("share-box")&&d.open){ const ta=d.querySelector("#sharetext"), m=selahMonth||selahDefaultMonth(); const src=route.name==="selah"?Object.assign({type:"selah",month:m},entries["e-selah-"+m]||{}):curEntry(); if(ta&&src) ta.value=shareText(src); } },true);
document.addEventListener("toggle",ev=>{ const d=ev.target; if(d.dataset&&d.dataset.lesson!=null){ const i=+d.dataset.lesson; d.open?learnOpen.add(i):learnOpen.delete(i); } },true);
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
  const data=JSON.stringify({app:"akouo",version:3,exported:new Date().toISOString(),entries:Object.values(entries),settings},null,2);
  const blob=new Blob([data],{type:"application/json"}), url=URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download="akouo-journal-"+today()+".json"; document.body.appendChild(a); a.click(); a.remove();
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
  catch(err){ $("#app").innerHTML=`<div class="auth gut"><div class="auth-card"><h1><b>Akouō</b></h1><div class="err">Couldn't start. Check your connection and reload. (${esc(err.message||err)})</div></div></div>`; return; }
  B.onAuth(u=>{
    const was=user&&user.uid; user=u;
    if(u&&u.uid!==was){ authBusy=false; authErr=""; startData(); }
    if(!u){ stopData(); if(route.name==="entry"){ history.replaceState(null,"","#today"); route={name:"today"}; } }
    render();
  });
  if("serviceWorker" in navigator&&location.protocol==="https:") navigator.serviceWorker.register("sw.js").catch(()=>{});
})();
