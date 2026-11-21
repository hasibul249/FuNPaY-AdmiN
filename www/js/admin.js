/* FuNPaY Admin অ্যাপ: ইউজার, লেনদেন, ব্যানার, নোটিশ, কুপন ও রক্ষণাবেক্ষণ নিয়ন্ত্রণ */
const SUPA_URL = ""; /* GitHub বিল্ডের সময় নিজে বসে যায় (বা লগইন পেজে নিজে লিখুন) */
const SUPA_KEY = "";
const APP_VERSION = "1.3.0";
const OTA_URL = ""; /* GitHub বিল্ডের সময় নিজে বসে যায় */
const $ = (id) => document.getElementById(id);
const ls = {get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }};
const clean = (s) => String(s || "").replace(/[\s"']/g, "");
const CFG = () => ({u: clean(SUPA_URL || ls.get("fpa_u")).replace(/\/+$/, ""), k: clean(SUPA_KEY || ls.get("fpa_k"))});
const cap = () => (window.Capacitor && window.Capacitor.Plugins) || {};

/* ---------- আইকন ---------- */
const P = {
  home: '<path d="M3 11l9-8 9 8v10H3z"/>', users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 3-5.5 6.5-5.5s6.5 1.9 6.5 5.5M16 4.5a3.5 3.5 0 010 7M18.5 14.8c2 .7 3 2.3 3 5.2"/>',
  swap: '<path d="M7 7h12l-3-3M17 17H5l3 3"/>', layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>', more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  srch: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', plus: '<path d="M12 5v14M5 12h14"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  tool: '<path d="M21 6.5a5 5 0 01-6.8 4.7L6 19.4a1.9 1.9 0 01-2.7-2.7l8.2-8.2A5 5 0 0117.5 2.2L14 5.7l2.6 2.6z"/>',
  bell: '<path d="M6 16v-5a6 6 0 0112 0v5l2 2H4zM10 21h4"/>', gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18M12 8c-3-4-6 0-3 0M12 8c3-4 6 0 3 0"/>',
  tag: '<path d="M3 12l9-9h8v8l-9 9z"/><circle cx="16" cy="8" r="1.5"/>', ok: '<circle cx="12" cy="12" r="9.5"/><path d="M7.5 12.4l3 3 6-6.4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>', ref: '<path d="M20 11a8 8 0 10-2.3 6M20 4v7h-7"/>', out: '<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', eyeo: '<path d="M3 3l18 18M10.6 6.2A9.6 9.6 0 0112 6c6 0 10 6 10 6a17 17 0 01-3.2 3.8M6.5 7.6C3.9 9.3 2 12 2 12s4 7 10 7c1.6 0 3-.3 4.3-.9"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>', down: '<path d="M12 5v14M6 13l6 6 6-6"/>', ch: '<path d="M9 6l6 6-6 6"/>', cpn: '<path d="M3 9a2 2 0 002-2V6h14v1a2 2 0 002 2v2a2 2 0 00-2 2v5H5v-5a2 2 0 00-2-2z"/><path d="M10 9l4 6"/>',
  shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>', coin: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 10c0-2 6-2 6 0s-6 2-6 4 6 2 6 0"/>',
  send: '<path d="M7 17L17 7M8 7h9v9"/>', cash: '<path d="M17 7L7 17M16 17H7V8"/>', rech: '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>', pay: '<path d="M6 7h12l1 13H5z"/><path d="M9 7a3 3 0 016 0"/>',
  bill: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', bank: '<path d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>', insur: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/>', edu: '<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5"/>',
  log: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>', adm: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/><path d="M17 4l1 1.5L20 5"/>',
  idc: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="11" r="2"/><path d="M5.8 16.2c.6-1.5 1.8-2.2 3.2-2.2s2.6.7 3.2 2.2M14.5 9.8h4M14.5 13.2h3"/>'
};
const ic = (k) => `<svg class="i" viewBox="0 0 24 24">${P[k] || ""}</svg>`;
const BICO = {pct: '<circle cx="32" cy="32" r="22"/><path d="M23 41L41 23"/><circle cx="24.5" cy="24.5" r="3.6"/><circle cx="39.5" cy="39.5" r="3.6"/>', phone: '<rect x="19" y="6" width="26" height="52" rx="6"/><path d="M28 50h8"/><path d="M34 15l-6 11h8l-6 12"/>',
  gift: '<rect x="11" y="28" width="42" height="27" rx="4"/><rect x="8" y="19" width="48" height="10" rx="3"/><path d="M32 19v36"/><path d="M32 19c-3-9-14-9-14-3 0 4 8 3 14 3zM32 19c3-9 14-9 14-3 0 4-8 3-14 3z"/>',
  star: '<path d="M32 8l7.3 15 16.5 2.3-12 11.6 2.9 16.4L32 45.4 17.3 53.3l2.9-16.4-12-11.6L24.7 23z"/>', bell: '<path d="M18 44V30a14 14 0 0128 0v14l4 5H14z"/><path d="M27 54h10"/>', shield: '<path d="M32 8l18 6v14c0 12-8 20-18 24-10-4-18-12-18-24V14z"/><path d="M24 31l6 6 11-12"/>'};
const TH = ["#e2136e", "#8c1456", "#34162f", "#12a15b", "#6b43c9"]; /* ব্যানারের রঙ (মূল অ্যাপের থিম ০-৪) */
const TY = {send: ["সেন্ড মানি", "send"], cash: ["ক্যাশ আউট", "cash"], pay: ["পেমেন্ট", "pay"], add: ["অ্যাড মানি", "coin"], rech: ["মোবাইল রিচার্জ", "rech"], bill: ["পে বিল", "bill"], bank: ["ব্যাংকে পাঠান", "bank"], insur: ["ইন্স্যুরেন্স", "insur"], edu: ["এডুকেশন ফি", "edu"]};
const RL = {user: "ইউজার", agent: "এজেন্ট", merchant: "মার্চেন্ট"};
const AUD = {all: "সবাই", user: "শুধু ইউজার", agent: "শুধু এজেন্ট", merchant: "শুধু মার্চেন্ট"};
const ACT = {none: "কিছু হবে না", add: "অ্যাড মানি খুলবে", rech: "রিচার্জ খুলবে", send: "সেন্ড মানি খুলবে", pay: "পেমেন্ট খুলবে", cash: "ক্যাশ আউট খুলবে", bill: "পে বিল খুলবে", coupons: "কুপন পেজ খুলবে", link: "লিংক খুলবে"};
const NKI = {info: "info", success: "ok", warn: "info", offer: "gift"};
const NKL = {info: "সাধারণ", success: "সুখবর", warn: "সতর্কতা", offer: "অফার"};
const WD = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];

/* ---------- ছোট সহায়ক ---------- */
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
const pad = (x) => String(x).padStart(2, "0");
const bn = (n) => Number(n || 0).toLocaleString("en-US", {maximumFractionDigits: 2});
const money = (n) => "৳ " + bn(n);
const cmp = (n) => { n = Number(n || 0); return n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : String(Math.round(n)); };
const fmt = (i) => { if (!i) return "—"; const d = new Date(i); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fmtD = (i) => { const d = new Date(i); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
const ldt = (i) => { if (!i) return ""; const d = new Date(i); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const toIso = (v) => (v ? new Date(v).toISOString() : null);
const fch = (s) => { const a = Array.from(String(s || "").trim()); return a.length ? esc(a[0].toUpperCase()) : "?"; };
const enc = (q) => encodeURIComponent(String(q).replace(/[,()*%\\]/g, " ").trim());
const val = (id) => { const e = $(id); return e ? e.value.trim() : ""; };
const chk = (id) => { const e = $(id); return !!(e && e.checked); };
function toast(m) {
  document.querySelectorAll(".toast").forEach((e) => e.remove());
  const e = document.createElement("div"); e.className = "toast"; e.textContent = m; document.body.appendChild(e);
  setTimeout(() => { e.classList.add("o"); setTimeout(() => e.remove(), 260); }, 2600);
}

/* ---------- ডাটাবেস যোগাযোগ ---------- */
const kNew = () => ({f: "pending", q: "", items: [], more: false, busy: false, tk: 0, seen: false, counts: {pending: 0, approved: 0, rejected: 0}});
const S = {auth: false, tok: "", rt: "", me: null, tab: "home", busy: false, stats: null, maint: {}, recent: [],
  u: {q: "", f: "all", items: [], more: false, busy: false, tk: 0}, x: {q: "", f: "all", items: [], more: false, busy: false, tk: 0},
  c: {seg: "bn", bn: [], nt: [], cp: [], cs: {}, busy: false, loaded: false}, k: kNew(), err: ""};
const TX = new Map(); /* লেনদেনের ক্যাশ */
let FORM = {}, TMR = {};
async function rawFetch(url, o) {
  try { return await fetch(url, o); }
  catch (e) {
    const H = cap().CapacitorHttp; if (!H || !H.request) throw new Error("NET");
    let data; if (o.body) { try { data = JSON.parse(o.body); } catch (_) { data = o.body; } }
    try { const r = await H.request({url, method: o.method || "GET", headers: o.headers || {}, data}); return {ok: r.status >= 200 && r.status < 300, status: r.status, json: async () => (typeof r.data === "string" ? JSON.parse(r.data) : r.data)}; }
    catch (e2) { throw new Error("NET"); }
  }
}
async function api(path, o = {}) {
  const c = CFG(); if (!c.u || !c.k) throw new Error("NOCFG");
  const h = {apikey: c.k, "Content-Type": "application/json"};
  if (o.auth !== false && S.tok) h.Authorization = "Bearer " + S.tok;
  if (o.prefer) h.Prefer = o.prefer;
  const r = await rawFetch(c.u + path, {method: o.m || "GET", headers: h, body: o.b ? JSON.stringify(o.b) : undefined});
  let j = null; try { j = await r.json(); } catch (e) {}
  if (r.status === 401 && o.auth !== false && S.rt && !o.retry) {
    try { const t = await api("/auth/v1/token?grant_type=refresh_token", {m: "POST", auth: false, b: {refresh_token: S.rt}}); setSess(t); }
    catch (e) { logout("সেশন শেষ হয়েছে, আবার লগইন করুন"); throw new Error("SESS"); }
    return api(path, Object.assign({}, o, {retry: true}));
  }
  if (!r.ok) throw new Error((j && (j.message || j.msg || j.error_description || j.error)) || "ERR");
  return j;
}
const rpc = (name, b) => api("/rest/v1/rpc/" + name, {m: "POST", b: b || {}});
const setSess = (j) => { S.tok = j.access_token; S.rt = j.refresh_token; };
function errMsg(e) {
  const m = (e && e.message) || "";
  const k = {NOADMIN: "এই অ্যাকাউন্টের অ্যাডমিন অনুমতি নেই", NEEDOWNER: "এই কাজ শুধু মালিক (owner) করতে পারবেন", NOUSER: "এই নম্বর/ইমেইলে কোনো অ্যাকাউন্ট নেই", BADCODE: "কুপন পাওয়া যায়নি", NET: "ইন্টারনেট সংযোগে সমস্যা", SELF: "নিজেকে সরানো যাবে না", BADTARGET: "কাকে দেবেন তা ঠিক নয়", NOCFG: "Supabase URL ও key দিন", SESS: "সেশন শেষ হয়েছে",
    NOREQ: "আবেদনটি পাওয়া যায়নি", DONE: "এই আবেদনে আগেই সিদ্ধান্ত হয়ে গেছে", NEEDREASON: "বাতিলের কারণ লিখুন", NIDUSED: "এই NID আরেকজনের অ্যাকাউন্টে আগেই একসেপ্ট করা আছে"}[m];
  if (k) return k;
  if (/invalid login/i.test(m)) return "ইমেইল বা পাসওয়ার্ড ভুল";
  if (/duplicate key/i.test(m)) return "এই কোড আগেই আছে";
  if (/could not find the (function|table)|schema cache|does not exist/i.test(m)) return "ডাটাবেস আপডেট বাকি: update-v2.15.sql, update-v2.18-kyc.sql ও update-v2.20-kyc-auto.sql চালান";
  if (/JWT|expired/i.test(m)) return "সেশন শেষ, আবার লগইন করুন";
  return "কিছু ভুল হয়েছে (" + m.slice(0, 60) + ")";
}
async function act(fn, ok) { try { await fn(); if (ok) toast(ok); return true; } catch (e) { toast(errMsg(e)); return false; } }

/* ---------- লগইন / লগআউট ---------- */
function loginHtml() {
  const c = CFG(), need = !c.u || !c.k;
  return `<div class="login"><div class="lhero"><img src="icons/logo.png" alt=""><h1>FuNPaY</h1><span>ADMIN PANEL</span></div>
  <div class="lpanel">${S.err ? `<div class="err">${esc(S.err)}</div>` : ""}
  ${need ? `<label class="fl"><span>Supabase Project URL</span><input id="lu" placeholder="https://xxxx.supabase.co" autocapitalize="off" autocomplete="off"></label><label class="fl"><span>Supabase anon key</span><input id="lk" autocapitalize="off" autocomplete="off"></label>` : ""}
  <label class="fl"><span>অ্যাডমিন ইমেইল</span><input id="le" type="email" value="${esc(ls.get("fpa_e") || "")}" placeholder="admin@example.com" autocapitalize="off" autocomplete="username"></label>
  <label class="fl"><span>পাসওয়ার্ড</span><div class="pw"><input id="lp" type="password" autocomplete="current-password" onkeydown="if(event.key==='Enter')doLogin()"><button type="button" onclick="pwTog()" aria-label="show">${ic("eye")}</button></div></label>
  <button class="btn" id="lb" onclick="doLogin()">লগইন করুন</button></div></div>`;
}
function pwTog() { const e = $("lp"); if (!e) return; e.type = e.type === "password" ? "text" : "password"; e.nextElementSibling.innerHTML = ic(e.type === "password" ? "eye" : "eyeo"); }
async function doLogin() {
  const b = $("lb"); if (!b || b.classList.contains("ld")) return;
  const em = val("le"), pw = $("lp").value;
  if ($("lu")) { ls.set("fpa_u", val("lu")); ls.set("fpa_k", val("lk")); }
  if (!em || !pw) { S.err = "ইমেইল ও পাসওয়ার্ড দিন"; return render(); }
  b.classList.add("ld"); b.innerHTML = '<i class="lg"></i>';
  try {
    setSess(await api("/auth/v1/token?grant_type=password", {m: "POST", auth: false, b: {email: em, password: pw}}));
    ls.set("fpa_e", em);
    try { S.me = await rpc("admin_me"); } catch (e) { S.tok = ""; S.rt = ""; throw new Error(e.message === "NOADMIN" ? "NOADMIN" : e.message); }
    S.err = ""; S.auth = true; S.tab = "home"; S.stats = null; render(); loadHome();
  } catch (e) { S.err = errMsg(e); S.tok = ""; S.rt = ""; render(); }
}
function logout(msg) {
  S.auth = false; S.tok = ""; S.rt = ""; S.me = null; S.stats = null; S.err = msg || "";
  S.u = {q: "", f: "all", items: [], more: false, busy: false, tk: 0}; S.x = {q: "", f: "all", items: [], more: false, busy: false, tk: 0}; S.c = {seg: "bn", bn: [], nt: [], cp: [], cs: {}, busy: false, loaded: false}; S.k = kNew();
  ["sh", "cf", "pv", "kimg"].forEach((i) => { const e = $(i); if (e) e.remove(); });
  render();
}

/* ---------- শিট ও ডায়ালগ ---------- */
function sheet(html) {
  let e = $("sh");
  if (e && e.classList.contains("out")) { e.remove(); e = null; }
  if (!e) { e = document.createElement("div"); e.id = "sh"; e.className = "sh"; e.onclick = (ev) => { if (ev.target === e) closeSheet(); }; e.innerHTML = '<div class="box"></div>'; document.body.appendChild(e); }
  e.firstChild.innerHTML = html; return e;
}
function closeSheet() { const e = $("sh"); if (!e || e.classList.contains("out")) return; e.classList.add("out"); setTimeout(() => { if (e.classList.contains("out")) e.remove(); }, 220); }
const spin = '<div class="em"><span class="lg" style="border-color:#e2136e44;border-top-color:#e2136e"></span></div>';
function ask(o) {
  return new Promise((res) => {
    const e = document.createElement("div"); e.className = "sh up"; e.id = "cf";
    const done = (v) => { e.classList.add("out"); setTimeout(() => e.remove(), 220); res(v); };
    e.onclick = (ev) => { if (ev.target === e) done(null); };
    e.innerHTML = `<div class="box"><div class="grip"></div><h3>${esc(o.title)}</h3>${o.msg ? `<p class="sub">${esc(o.msg)}</p>` : ""}${o.input ? `<label class="fl"><span>${esc(o.input)}</span><textarea id="cfi"></textarea></label>${o.chips ? `<div class="qc">${o.chips.map((c) => `<button type="button">${esc(c)}</button>`).join("")}</div>` : ""}` : ""}<div class="rowb"><button class="btn o" id="cfc">বাতিল</button><button class="btn ${o.danger ? "r" : ""}" id="cfo">${esc(o.ok || "ঠিক আছে")}</button></div></div>`;
    document.body.appendChild(e);
    e.querySelector("#cfc").onclick = () => done(null);
    e.querySelector("#cfo").onclick = () => { const i = e.querySelector("#cfi"), v = i ? i.value.trim() : ""; if (o.req && !v) { toast("লিখে দিন"); return; } done(v); };
    e.querySelectorAll(".qc button").forEach((b) => { b.onclick = () => { e.querySelector("#cfi").value = b.textContent; }; });
  });
}
const fl = (label, inner) => `<label class="fl"><span>${label}</span>${inner}</label>`;
const swt = (id, label, on) => `<label class="swl"><span>${label}</span><input type="checkbox" id="${id}"${on ? " checked" : ""}><i></i></label>`;
const opts = (o, cur) => Object.keys(o).map((k) => `<option value="${k}"${String(k) === String(cur) ? " selected" : ""}>${esc(o[k])}</option>`).join("");

/* ---------- মূল স্ক্রিন ---------- */
function render() {
  const a = $("app");
  if (!S.auth) { a.innerHTML = loginHtml(); return; }
  const nv = (k, l, i) => `<button class="${S.tab === k ? "on" : ""}" onclick="go('${k}')">${ic(i)}${l}${k === "kyc" ? kbdg() : ""}</button>`;
  const pg = {home: pageHome, users: pageUsers, kyc: pageKyc, tx: pageTx, cnt: pageCnt, more: pageMore}[S.tab]();
  a.innerHTML = `<nav><div class="nl"><img src="icons/logo-pink.png" alt="">Admin</div>${nv("home", "হোম", "home")}${nv("users", "ইউজার", "users")}${nv("kyc", "KYC", "idc")}${nv("tx", "লেনদেন", "swap")}${nv("cnt", "কনটেন্ট", "layers")}${nv("more", "আরও", "more")}</nav><main class="pg">${pg}</main>`;
}
function go(k) {
  if (S.tab === k) { window.scrollTo({top: 0, behavior: "smooth"}); return; }
  S.tab = k; render(); window.scrollTo(0, 0);
  if (k === "home") loadHome(); else if (k === "users" && !S.u.items.length) loadUsers(true); else if (k === "kyc") loadKyc(true); else if (k === "tx" && !S.x.items.length) loadTx(true); else if (k === "cnt" && !S.c.loaded) loadContent();
}
function reload() { S.busy = true; render(); const p = S.tab === "home" ? loadHome() : S.tab === "users" ? loadUsers(true) : S.tab === "kyc" ? loadKyc(true) : S.tab === "tx" ? loadTx(true) : S.tab === "cnt" ? loadContent() : Promise.resolve(); Promise.resolve(p).finally(() => { S.busy = false; if (S.tab === "home") render(); }); }
const tbar = (t) => `<div class="tbar"><b>${t}</b><img src="icons/logo.png" alt=""></div>`;
const refreshList = (id, html) => { const e = $(id); if (e) e.innerHTML = html; };

/* ---------- হোম / ড্যাশবোর্ড ---------- */
async function loadHome(silent) {
  try {
    const [s, st, rc, kc] = await Promise.all([rpc("admin_stats"), rpc("app_status"), api("/rest/v1/transactions?select=*&order=id.desc&limit=6"), rpc("admin_kyc_counts").catch(() => null)]);
    if (kc && kc[0]) kSetCounts(kc[0]);
    S.stats = s; S.maint = (st && st.maint) || {}; S.recent = rc; rc.forEach((x) => TX.set(x.trx, x));
    if (S.tab === "home") render();
  } catch (e) { if (!silent) toast(errMsg(e)); }
}
function pageHome() {
  const s = S.stats, m = S.maint || {}, own = S.me.level === "owner";
  const hero = `<div class="hero"><div class="top"><div class="av">${fch(S.me.name || "A")}</div><div class="who"><small>স্বাগতম, ${esc(S.me.name || "অ্যাডমিন")}</small><span class="lv">${own ? "মালিক" : "স্টাফ"}</span></div><button class="hb${S.busy ? " sp" : ""}" onclick="reload()" aria-label="refresh">${ic("ref")}</button></div></div>`;
  const mc = `<div class="mcard${m.on ? " on" : ""}" onclick="openMaint()"><i>${ic(m.on ? "tool" : "shield")}</i><div><b>${m.on ? "রক্ষণাবেক্ষণ চালু আছে" : "অ্যাপ স্বাভাবিক চলছে"}</b><span>${m.on ? "ইউজাররা কোনো লেনদেন করতে পারছে না" : "রক্ষণাবেক্ষণ মোড বন্ধ আছে"}</span></div><em>${m.on ? "দেখুন" : "চালু করুন"}</em></div>`;
  const kn = (S.k.counts && S.k.counts.pending) || 0;
  const kc = `<div class="mcard${kn ? " on" : ""}" onclick="go('kyc')"><i>${ic("idc")}</i><div><b>${kn ? bn(kn) + " টি KYC আবেদন বাকি" : "কোনো KYC আবেদন বাকি নেই"}</b><span>NID ও মুখের ছবি মিলিয়ে একসেপ্ট বা বাতিল করুন</span></div><em>${kn ? "দেখুন" : "তালিকা"}</em></div>`;
  if (!s) return hero + `<div class="lift">${mc}${kc}<div class="stats">${'<div class="stat"><small>&nbsp;</small><b>…</b></div>'.repeat(6)}</div></div>`;
  const st = (c, i, l, v) => `<div class="stat ${c}"><i>${ic(i)}</i><small>${l}</small><b>${v}</b></div>`;
  const days = s.days || [], mx = Math.max(1, ...days.map((d) => Number(d.amt)));
  const chart = days.map((d) => `<div title="${bn(d.n)} টি লেনদেন"><em>${cmp(d.amt)}</em><i style="height:${Math.max(4, Math.round(Number(d.amt) / mx * 100))}px"></i><small>${WD[new Date(d.d + "T00:00:00").getDay()]}</small></div>`).join("");
  const qa = [["openMaint()", "tool", "রক্ষণাবেক্ষণ"], ["bnForm()", "tag", "নতুন ব্যানার"], ["ntForm()", "bell", "নোটিশ পাঠান"], ["cpForm()", "cpn", "নতুন কুপন"]].map((q) => `<button onclick="${q[0]}"><i>${ic(q[1])}</i>${q[2]}</button>`).join("");
  return hero + `<div class="lift">${mc}${kc}
  <div class="stats">${st("", "users", "মোট ইউজার", bn(s.users))}${st("v", "adm", "এজেন্ট / মার্চেন্ট", bn(s.agents) + " / " + bn(s.merchants))}${st("g", "swap", "আজকের লেনদেন", bn(s.tx_today))}${st("g", "coin", "আজকের পরিমাণ", money(s.vol_today))}${st("a", "users", "আজ নতুন ইউজার", bn(s.new_today))}${st("", "coin", "সবার মোট ব্যালেন্স", money(s.balance))}${st("r", "lock", "স্থগিত / বন্ধ", bn(s.suspended) + " / " + bn(s.closed))}${st("v", "log", "মোট লেনদেন", bn(s.tx_total))}</div>
  <div class="card"><div class="ttl"><span>দ্রুত কাজ</span></div><div class="qa">${qa}</div></div>
  <div class="card"><div class="ttl"><span>গত ৭ দিনের লেনদেন (৳)</span></div><div class="chart">${chart}</div></div>
  <div class="card" style="padding:14px 0 4px"><div class="ttl" style="padding:0 14px 6px"><span>সাম্প্রতিক লেনদেন</span><a onclick="go('tx')">সব দেখুন</a></div>${S.recent.length ? S.recent.map(txRow).join("") : '<p class="em">এখনো কোনো লেনদেন নেই</p>'}</div></div>`;
}

/* ---------- ইউজার ---------- */
const UF = [["all", "সব"], ["user", "ইউজার"], ["agent", "এজেন্ট"], ["merchant", "মার্চেন্ট"], ["suspended", "স্থগিত"], ["closed", "বন্ধ"], ["kyc", "KYC অপেক্ষায়"]];
function pageUsers() {
  return tbar("ইউজার") + `<div class="srch"><div>${ic("srch")}<input id="uq" placeholder="নাম বা নম্বর দিয়ে খুঁজুন" value="${esc(S.u.q)}" oninput="uSearch(this.value)"></div></div><div class="chips">${UF.map((f) => `<button class="chip${S.u.f === f[0] ? " on" : ""}" onclick="uFilter('${f[0]}')">${f[1]}</button>`).join("")}</div><div id="ulist">${uList()}</div>`;
}
const stBd = (p) => (p.status === "suspended" ? '<span class="bd r">স্থগিত</span>' : p.status === "closed" ? '<span class="bd m">বন্ধ</span>' : "");
const kcBd = (p) => (p.kyc_status === "pending" ? '<span class="bd a">KYC অপেক্ষায়</span>' : p.kyc_status === "rejected" ? '<span class="bd r">KYC বাতিল</span>' : p.kyc_status === "none" ? '<span class="bd m">KYC বাকি</span>' : "");
const rlBd = (p) => (p.role !== "user" ? `<span class="bd ${p.role === "agent" ? "v" : "a"}">${RL[p.role]}</span>` : "");
function uList() {
  const u = S.u;
  if (u.busy && !u.items.length) return '<div class="sk"></div>'.repeat(5);
  if (!u.items.length) return '<p class="em">কাউকে পাওয়া যায়নি</p>';
  return `<div class="list">${u.items.map((p) => `<div class="row" onclick="openUser('${p.id}')"><div class="av s">${fch(p.name || p.phone)}</div><div class="m"><b>${esc(p.name || "নাম নেই")}${rlBd(p)}${stBd(p)}${kcBd(p)}</b><span>${esc(p.phone)}</span></div><div class="r"><b>${money(p.balance)}</b><small>${fmtD(p.created_at)}</small></div></div>`).join("")}</div>${u.more ? `<button class="more" onclick="loadUsers(false)">${u.busy ? "…" : "আরও দেখুন"}</button>` : ""}`;
}
function uSearch(v) { clearTimeout(TMR.u); TMR.u = setTimeout(() => { S.u.q = v.trim(); loadUsers(true); }, 350); }
function uFilter(f) { S.u.f = f; document.querySelectorAll(".chips .chip").forEach((b, i) => b.classList.toggle("on", UF[i][0] === f)); loadUsers(true); }
async function loadUsers(reset) {
  const u = S.u; if (u.busy && !reset) return;
  if (reset) { u.items = []; u.more = false; }
  const tk = ++u.tk; u.busy = true; refreshList("ulist", uList());
  const build = (withK) => {
    let p = `/rest/v1/profiles?select=id,phone,name,role,status,balance,created_at${withK ? ",kyc_status" : ""}&order=created_at.desc&limit=30&offset=${u.items.length}`;
    if (["user", "agent", "merchant"].includes(u.f)) p += "&role=eq." + u.f; else if (["suspended", "closed"].includes(u.f)) p += "&status=eq." + u.f; else if (u.f === "kyc" && withK) p += "&kyc_status=eq.pending";
    if (u.q) p += `&or=(phone.ilike.*${enc(u.q)}*,name.ilike.*${enc(u.q)}*)`;
    return p;
  };
  try {
    let rows;
    try { rows = await api(build(!S.nokyc)); }
    catch (e) { if (!S.nokyc && /kyc_status/i.test((e && e.message) || "")) { S.nokyc = true; rows = await api(build(false)); } else throw e; }
    if (tk !== u.tk) return; u.items = u.items.concat(rows); u.more = rows.length === 30;
  }
  catch (e) { if (tk === u.tk) toast(errMsg(e)); }
  if (tk === u.tk) { u.busy = false; refreshList("ulist", uList()); }
}
async function openUser(id) {
  sheet('<div class="grip"></div>' + spin);
  try {
    const [p, tx] = await Promise.all([api(`/rest/v1/profiles?id=eq.${id}&select=*`), api(`/rest/v1/transactions?or=(from_id.eq.${id},to_id.eq.${id})&order=id.desc&limit=15`)]);
    if (!p.length) throw new Error("NOUSER");
    tx.forEach((x) => TX.set(x.trx, x)); showUser(p[0], tx);
  } catch (e) { closeSheet(); toast(errMsg(e)); }
}
function showUser(p, tx) {
  const own = S.me.level === "owner", id = p.id;
  const sts = {active: "সক্রিয়", suspended: "স্থগিত", closed: "বন্ধ"}[p.status], ks = {none: "জমা দেয়নি", pending: "অপেক্ষায়", approved: "একসেপ্ট", rejected: "বাতিল"}[p.kyc_status];
  const btns = (p.status === "active" ? `<button class="btn o" onclick="suspendUser('${id}')">স্থগিত করুন</button>` : `<button class="btn g" onclick="activateUser('${id}')">আবার চালু করুন</button>`)
    + (own && p.status !== "closed" ? `<button class="btn r" onclick="closeUser('${id}')">অ্যাকাউন্ট বন্ধ</button>` : "");
  sheet(`<div class="grip"></div><div class="uh"><div class="av">${fch(p.name || p.phone)}</div><div><h3>${esc(p.name || "নাম নেই")}</h3><span>+88 ${esc(p.phone)}</span></div></div>
  ${p.status !== "active" ? `<div class="note r"><b>${sts}</b>${p.status_reason ? " · কারণ: " + esc(p.status_reason) : ""}${p.status_at ? "<br>" + fmt(p.status_at) : ""}</div>` : ""}
  <div class="kv"><div><small>ব্যালেন্স</small><b>${money(p.balance)}</b></div><div><small>অবস্থা</small><b>${sts}</b></div><div><small>ধরন</small><b>${RL[p.role] || p.role}</b></div><div><small>যোগদান</small><b>${fmt(p.created_at)}</b></div>${ks ? `<div style="grid-column:1/-1"><small>KYC</small><b>${ks}${p.kyc_status === "rejected" && p.kyc_reason ? " · " + esc(p.kyc_reason) : ""}</b></div>` : ""}</div>
  <div class="rowb" style="margin-bottom:8px">${btns}</div>
  <div class="rowb"><button class="btn o" onclick="giveToUser('${esc(p.phone)}')">কুপন দিন</button><button class="btn o" onclick="ntForm(0,'${esc(p.phone)}')">নোটিশ পাঠান</button></div>
  ${p.kyc_status && p.kyc_status !== "none" ? `<button class="btn o" style="margin-top:8px" onclick="kycOfUser('${esc(p.phone)}')">KYC আবেদন দেখুন</button>` : ""}
  ${own ? `<div style="height:14px"></div>${fl("ধরন বদলান (এজেন্ট / মার্চেন্ট করতে)", `<select id="urole" onchange="setRole('${id}',this.value)">${opts(RL, p.role)}</select>`)}` : ""}
  <div style="height:${own ? 0 : 14}px"></div>${fl("অ্যাডমিন নোট (ইউজার দেখে না)", `<textarea id="unote" placeholder="যেমন: কেওয়াইসি যাচাই বাকি">${esc(p.admin_note || "")}</textarea>`)}
  <button class="btn o s" onclick="saveNote('${id}')">নোট সেভ করুন</button>
  <div class="ttl" style="padding:18px 2px 8px"><span>সাম্প্রতিক লেনদেন</span></div>${tx.length ? `<div class="list" style="margin:0;box-shadow:none;border:1px solid var(--ln)">${tx.map(txRow).join("")}</div>` : '<p class="em">কোনো লেনদেন নেই</p>'}`);
}
async function suspendUser(id) {
  const r = await ask({title: "অ্যাকাউন্ট স্থগিত করবেন?", msg: "ইউজার অ্যাপে ঢুকলে স্থগিতের বার্তা দেখবে এবং কোনো লেনদেন করতে পারবে না। টাকা অ্যাকাউন্টেই থাকবে।", input: "কারণ (ইউজার দেখতে পাবে, ঐচ্ছিক)", chips: ["সন্দেহজনক লেনদেন", "ভুল তথ্য দেওয়া", "গ্রাহকের অনুরোধ"], ok: "স্থগিত করুন", danger: true});
  if (r === null) return;
  if (await act(() => rpc("admin_set_status", {p_id: id, p_status: "suspended", p_reason: r}), "অ্যাকাউন্ট স্থগিত করা হয়েছে")) { openUser(id); S.u.items.length && loadUsers(true); }
}
async function activateUser(id) {
  if (await ask({title: "আবার চালু করবেন?", msg: "ইউজার আবার সব লেনদেন করতে পারবে।", ok: "চালু করুন"}) === null) return;
  if (await act(() => rpc("admin_set_status", {p_id: id, p_status: "active", p_reason: ""}), "অ্যাকাউন্ট চালু করা হয়েছে")) { openUser(id); S.u.items.length && loadUsers(true); }
}
async function closeUser(id) {
  const r = await ask({title: "অ্যাকাউন্ট বন্ধ করবেন?", msg: "বন্ধ করলে ইউজার অ্যাপে শুধু \"অ্যাকাউন্ট বন্ধ\" বার্তা দেখবে, কিছুই করতে পারবে না। ব্যালেন্সে টাকা থাকলে সেটা অ্যাকাউন্টেই থেকে যাবে। পরে চাইলে আবার চালু করা যাবে।", input: "কারণ (ইউজার দেখতে পাবে)", req: true, ok: "অ্যাকাউন্ট বন্ধ করুন", danger: true});
  if (r === null) return;
  if (await act(() => rpc("admin_set_status", {p_id: id, p_status: "closed", p_reason: r}), "অ্যাকাউন্ট বন্ধ করা হয়েছে")) { openUser(id); S.u.items.length && loadUsers(true); }
}
async function setRole(id, role) { if (await act(() => rpc("admin_set_role", {p_id: id, p_role: role}), "ধরন বদলানো হয়েছে")) { openUser(id); S.u.items.length && loadUsers(true); } else openUser(id); }
async function saveNote(id) { await act(() => rpc("admin_set_note", {p_id: id, p_note: val("unote")}), "নোট সেভ হয়েছে"); }

/* ---------- লেনদেন ---------- */
const XF = [["all", "সব"], ["send", "সেন্ড"], ["cash", "ক্যাশ আউট"], ["pay", "পেমেন্ট"], ["rech", "রিচার্জ"], ["bill", "বিল"], ["bank", "ব্যাংক"], ["add", "অ্যাড মানি"]];
const isFail = (x) => /fail|error|cancel/i.test(String(x.status || ""));
function txRow(x) {
  const T = TY[x.type] || [x.type, "swap"], a = x.from_name || x.from_phone || "FuNPaY", b = x.to_name || x.to_phone || x.ref || T[0];
  return `<div class="row" onclick="openTx('${esc(x.trx)}')"><div class="ic">${ic(T[1])}</div><div class="m"><b>${T[0]}${isFail(x) ? '<span class="bd r">ব্যর্থ</span>' : ""}</b><span>${esc(a)} → ${esc(b)}</span></div><div class="r"><b>${money(x.amount)}</b><small>${fmt(x.created_at)}</small></div></div>`;
}
function pageTx() {
  return tbar("লেনদেন") + `<div class="srch"><div>${ic("srch")}<input id="xq" placeholder="TrxID, নাম বা নম্বর" value="${esc(S.x.q)}" oninput="xSearch(this.value)"></div></div><div class="chips">${XF.map((f) => `<button class="chip${S.x.f === f[0] ? " on" : ""}" onclick="xFilter('${f[0]}')">${f[1]}</button>`).join("")}</div><div id="xlist">${xList()}</div>`;
}
function xList() {
  const x = S.x;
  if (x.busy && !x.items.length) return '<div class="sk"></div>'.repeat(5);
  if (!x.items.length) return '<p class="em">কোনো লেনদেন পাওয়া যায়নি</p>';
  return `<div class="list">${x.items.map(txRow).join("")}</div>${x.more ? `<button class="more" onclick="loadTx(false)">${x.busy ? "…" : "আরও দেখুন"}</button>` : ""}`;
}
function xSearch(v) { clearTimeout(TMR.x); TMR.x = setTimeout(() => { S.x.q = v.trim(); loadTx(true); }, 350); }
function xFilter(f) { S.x.f = f; document.querySelectorAll(".chips .chip").forEach((b, i) => b.classList.toggle("on", XF[i][0] === f)); loadTx(true); }
async function loadTx(reset) {
  const x = S.x; if (x.busy && !reset) return;
  if (reset) { x.items = []; x.more = false; }
  const tk = ++x.tk; x.busy = true; refreshList("xlist", xList());
  let p = `/rest/v1/transactions?select=*&order=id.desc&limit=30&offset=${x.items.length}`;
  if (x.f !== "all") p += "&type=eq." + x.f;
  if (x.q) { const q = enc(x.q); p += `&or=(trx.ilike.*${q}*,from_phone.ilike.*${q}*,to_phone.ilike.*${q}*,from_name.ilike.*${q}*,to_name.ilike.*${q}*)`; }
  try { const rows = await api(p); if (tk !== x.tk) return; rows.forEach((r) => TX.set(r.trx, r)); x.items = x.items.concat(rows); x.more = rows.length === 30; }
  catch (e) { if (tk === x.tk) toast(errMsg(e)); }
  if (tk === x.tk) { x.busy = false; refreshList("xlist", xList()); }
}
async function openTx(trx) {
  let x = TX.get(trx);
  if (!x) { try { x = (await api(`/rest/v1/transactions?trx=eq.${encodeURIComponent(trx)}&select=*`))[0]; } catch (e) { return toast(errMsg(e)); } }
  if (!x) return toast("পাওয়া যায়নি");
  const T = TY[x.type] || [x.type, "swap"], dr = (k, v) => (v || v === 0 ? `<div class="dr"><span>${k}</span><b>${v}</b></div>` : "");
  const who = (n, ph) => (ph || n ? esc(n || "") + (ph ? " · " + esc(ph) : "") : "");
  sheet(`<div class="grip"></div><div class="uh"><div class="ic" style="width:56px;height:56px">${ic(T[1])}</div><div><h3>${money(x.amount)}</h3><span>${T[0]}${isFail(x) ? " · ব্যর্থ" : ""}</span></div></div>
  ${dr("TrxID", esc(x.trx))}${dr("সময়", fmt(x.created_at))}${dr("প্রেরক", who(x.from_name, x.from_phone))}${dr("প্রাপক", who(x.to_name, x.to_phone))}${dr("রেফারেন্স", esc(x.ref))}${dr("মাধ্যম", esc(x.ch))}${Number(x.fee) ? dr("চার্জ", money(x.fee)) : ""}${Number(x.comm) ? dr("এজেন্ট কমিশন", money(x.comm)) : ""}${Number(x.disc) ? dr("কুপন ছাড়", money(x.disc)) : ""}${dr("অবস্থা", isFail(x) ? "ব্যর্থ" : "সফল")}
  <div class="rowb" style="margin-top:14px">${x.from_id ? `<button class="btn o" onclick="openUser('${x.from_id}')">প্রেরককে দেখুন</button>` : ""}${x.to_id ? `<button class="btn o" onclick="openUser('${x.to_id}')">প্রাপককে দেখুন</button>` : ""}</div>`);
}

/* ---------- KYC যাচাই ---------- */
const KF = [["pending", "বাকি"], ["approved", "একসেপ্ট"], ["auto", "অটো"], ["rejected", "বাতিল"], ["all", "সব"]];
const kBd = (s) => (s === "pending" ? '<span class="bd a">অপেক্ষায়</span>' : s === "approved" ? '<span class="bd g">একসেপ্ট</span>' : s === "rejected" ? '<span class="bd r">বাতিল</span>' : "");
const kBd2 = (r) => (r.auto_approved && r.status === "approved" ? '<span class="bd g">অটো একসেপ্ট</span>' : kBd(r.status));
/* ফেস ম্যাচের চিহ্ন: [লেখা, গুরুতর কিনা] */
const KFLG = {lowmatch: ["মিল ৮৫% এর কম, মেলেনি", 0], nolive: ["লাইভনেস পাস হয়নি", 0], manual: ["হাতে তোলা সেলফি (লাইভ নয়)", 0], nodesc: ["মুখ মেলানো হয়নি (মডেল লোড হয়নি বা পুরনো অ্যাপ)", 0], livetimeout: ["লাইভনেসে সময় শেষ হয়েছিল", 0],
  swap: ["মুখ ঘোরানোর ছবিতে একই মুখ পাওয়া যায়নি", 1], dupface: ["এই মুখ অন্য অ্যাকাউন্টেও আছে", 1], identical: ["দুই মুখের ছাপ হুবহু এক (নকল ডেটার সন্দেহ)", 1], toofast: ["লাইভনেস অস্বাভাবিক দ্রুত শেষ হয়েছে", 1]};
const kFlags = (k) => (Array.isArray(k.flags) ? k.flags : []).map((x) => (KFLG[x] ? `<li class="${KFLG[x][1] ? "hi" : ""}">${KFLG[x][0]}</li>` : "")).join("");
const kPctTxt = (p) => (p === null || p === undefined ? "" : bn(Math.round(Number(p))) + "%");
const kbdg = () => { const n = (S.k.counts && S.k.counts.pending) || 0; return `<i class="nb" id="kb"${n ? "" : " hidden"}>${n > 99 ? "99+" : n}</i>`; };
function kChips() {
  const c = S.k.counts || {};
  return KF.map((f) => { const n = f[0] === "all" ? (c.pending || 0) + (c.approved || 0) + (c.rejected || 0) : c[f[0]] || 0; return `<button class="chip${S.k.f === f[0] ? " on" : ""}" onclick="kFilter('${f[0]}')">${f[1]}${f[0] === "auto" ? "" : " (" + bn(n) + ")"}</button>`; }).join("");
}
function kBadge() {
  const n = S.k.counts.pending || 0, b = $("kb");
  if (b) { b.textContent = n > 99 ? "99+" : String(n); b.hidden = !n; }
  const c = $("kchips"); if (c) c.innerHTML = kChips();
}
function kSetCounts(c) {
  const old = S.k.counts.pending || 0, n = {pending: Number(c.pending) || 0, approved: Number(c.approved) || 0, rejected: Number(c.rejected) || 0};
  S.k.counts = n; kBadge();
  if (S.k.seen && n.pending > old) toast("নতুন KYC আবেদন এসেছে");
  S.k.seen = true;
}
async function loadKycCounts(silent) {
  try { const r = await rpc("admin_kyc_counts"); if (r && r[0]) kSetCounts(r[0]); }
  catch (e) { if (!silent) toast(errMsg(e)); }
}
function pageKyc() {
  return tbar("KYC যাচাই") + `<div class="srch"><div>${ic("srch")}<input id="kq" inputmode="search" placeholder="নাম, নম্বর বা NID দিয়ে খুঁজুন" value="${esc(S.k.q)}" oninput="kSearch(this.value)"></div></div><div class="chips" id="kchips">${kChips()}</div><div id="klist">${kList()}</div>`;
}
function kList() {
  const k = S.k;
  if (k.busy && !k.items.length) return '<div class="sk"></div>'.repeat(4);
  if (!k.items.length) return `<p class="em">${k.f === "pending" && !k.q ? "কোনো আবেদন বাকি নেই" : "কোনো আবেদন পাওয়া যায়নি"}</p>`;
  return `<div class="list">${k.items.map((r) => `<div class="row" onclick="openKyc(${r.id})"><div class="av s">${fch(r.name || r.phone)}</div><div class="m"><b>${esc(r.name || "নাম নেই")}${kBd2(r)}</b><span>${esc(r.phone)} · NID ${esc(r.nid_no)}${r.match_pct !== null && r.match_pct !== undefined ? " · মিল " + kPctTxt(r.match_pct) : ""}${r.flags && r.flags.length && r.status === "pending" ? " · ⚠ " + bn(r.flags.length) : ""}</span></div><div class="r"><small>${fmt(r.created_at)}</small></div></div>`).join("")}</div>${k.more ? `<button class="more" onclick="loadKyc(false)">${k.busy ? "…" : "আরও দেখুন"}</button>` : ""}`;
}
function kSearch(v) { clearTimeout(TMR.k); TMR.k = setTimeout(() => { S.k.q = v.trim(); loadKyc(true); }, 350); }
function kFilter(f) { S.k.f = f; const c = $("kchips"); if (c) c.innerHTML = kChips(); loadKyc(true); }
async function loadKyc(reset, silent) {
  const k = S.k; if (k.busy && !reset) return;
  const tk = ++k.tk;
  if (reset && !silent) { k.items = []; k.more = false; }
  k.busy = true; if (!silent) refreshList("klist", kList());
  const off = reset ? 0 : k.items.length;
  try {
    const rows = await rpc("admin_kyc_list", {p_status: k.f, p_limit: 30, p_offset: off, p_q: k.q || null});
    if (tk !== k.tk) return;
    k.items = reset ? rows : k.items.concat(rows); k.more = rows.length === 30;
  } catch (e) { if (tk === k.tk && !silent) toast(errMsg(e)); }
  if (tk === k.tk) { k.busy = false; refreshList("klist", kList()); loadKycCounts(true); }
}
/* ছবি প্রাইভেট স্টোরেজে থাকে, তাই অল্প সময়ের signed লিংক নিয়ে দেখাতে হয় */
async function kSign(path) {
  if (!path) return "";
  const j = await api("/storage/v1/object/sign/kyc/" + String(path).split("/").map(encodeURIComponent).join("/"), {m: "POST", b: {expiresIn: 900}});
  const u = j && (j.signedURL || j.signedUrl); if (!u) throw new Error("NOIMG");
  const c = CFG(); return c.u + (u.startsWith("/storage/v1") ? "" : "/storage/v1") + (u.startsWith("/") ? u : "/" + u);
}
async function kImgErr(el) {
  if (el.dataset.r) { el.classList.add("bad"); return; }
  el.dataset.r = "1";
  try { el.src = await kSign(el.dataset.p); } catch (e) { el.classList.add("bad"); }
}
function kView(el) {
  const src = el.currentSrc || el.src; if (!src || el.classList.contains("bad")) return;
  const e = document.createElement("div"); e.id = "kimg"; e.className = "kimg";
  const im = document.createElement("img"); im.src = src; im.alt = "";
  const bt = document.createElement("button"); bt.type = "button"; bt.setAttribute("aria-label", "close"); bt.innerHTML = "&times;";
  const hn = document.createElement("small"); hn.textContent = "ছবিতে চাপ দিলে বড়/ছোট হবে";
  im.onclick = (ev) => { ev.stopPropagation(); e.classList.toggle("z"); };
  bt.onclick = () => e.remove(); e.onclick = () => e.remove();
  e.append(im, bt, hn); document.body.appendChild(e);
}
async function openKyc(id) {
  sheet('<div class="grip"></div>' + spin);
  try {
    const r = await rpc("admin_kyc_get", {p_id: id}), k = r && r[0]; if (!k) throw new Error("NOREQ");
    const u = await Promise.all([k.front_path, k.back_path, k.selfie_path].map((p) => kSign(p).catch(() => "")));
    showKyc(k, u);
  } catch (e) { closeSheet(); toast(errMsg(e)); }
}
async function kycOfUser(phone) {
  try {
    const r = await rpc("admin_kyc_list", {p_status: "all", p_limit: 1, p_offset: 0, p_q: phone});
    if (!r.length) return toast("এই ইউজারের কোনো KYC আবেদন নেই");
    openKyc(r[0].id);
  } catch (e) { toast(errMsg(e)); }
}
function showKyc(k, u) {
  const img = (p, url, cap) => `<figure class="kf"><img src="${esc(url)}" data-p="${esc(p || "")}" alt="${cap}" onclick="kView(this)" onerror="kImgErr(this)"><figcaption>${cap}</figcaption></figure>`;
  const f = (l, v, full) => `<div${full ? ' style="grid-column:1/-1"' : ""}><small>${l}</small><b>${esc(v || "—")}</b></div>`;
  const by = (k.reviewer ? " · " + esc(k.reviewer) : "");
  const info = k.status === "rejected" ? `<div class="note r"><b>বাতিল হয়েছে</b> · কারণ: ${esc(k.reject_reason)}<br>${fmt(k.reviewed_at)}${by}</div>` : k.status === "approved" ? `<div class="note g"><b>একসেপ্ট হয়েছে</b><br>${fmt(k.reviewed_at)}${by}</div>` : "";
  const hasM = k.match_pct !== null && k.match_pct !== undefined, mp = Number(k.match_pct), fl = kFlags(k);
  const lv = k.liveness || {};
  const face = hasM || fl || k.auto_approved ? `<div class="note ${hasM ? (mp >= 85 && !fl ? "g" : mp < 60 ? "r" : "") : ""}"><b>${k.auto_approved ? "অটো একসেপ্ট (সিস্টেম নিজে)" : "মুখ মেলানো (সিস্টেমের হিসাব)"}</b><br>${hasM ? "মুখ মিল: <b>" + kPctTxt(mp) + "</b> · " : "মুখ মিল: হিসাব হয়নি · "}লাইভনেস: ${k.live_ok ? "পাস" : "পাস হয়নি"} · চেষ্টা: ${bn(k.tries || 1)}${lv.ms ? " · সময়: " + bn(Math.round(Number(lv.ms) / 1000)) + " সেকেন্ড" : ""}${fl ? '<ul class="kfl">' + fl + "</ul>" : ""}</div>` : "";
  const warn = Number(k.prev_rejects) > 0 ? `<div class="note">এই ইউজারের আগে ${bn(k.prev_rejects)} বার KYC বাতিল হয়েছে।</div>` : "";
  const acts = k.status === "pending"
    ? `<div class="kact"><div class="rowb"><button class="btn r" onclick="kReject(${Number(k.id)})">বাতিল করুন</button><button class="btn g" onclick="kApprove(${Number(k.id)})">একসেপ্ট করুন</button></div></div>`
    : `${k.status === "approved" ? `<button class="btn r" style="margin-bottom:8px" onclick="kRevoke(${Number(k.id)})">${k.auto_approved ? "অটো একসেপ্ট বাতিল করুন" : "একসেপ্ট বাতিল করুন"}</button>` : ""}<button class="btn o" onclick="openUser('${esc(k.user_id)}')">ইউজারের প্রোফাইল দেখুন</button>`;
  sheet(`<div class="grip"></div><div class="uh"><div class="av">${fch(k.name || k.phone)}</div><div><h3>${esc(k.name || "নাম নেই")}${kBd2(k)}</h3><span>+88 ${esc(k.phone)}</span></div></div>
  ${info}${face}${warn}
  <p class="sub">NID-র লেখা নিচের তথ্যের সঙ্গে মেলান, আর সেলফির মুখ NID-র ছবির সঙ্গে মিলিয়ে দেখুন। ছবিতে চাপ দিলে বড় হবে।</p>
  <div class="kim">${img(k.front_path, u[0], "NID সামনে")}${img(k.back_path, u[1], "NID পেছনে")}${img(k.selfie_path, u[2], "সেলফি (মুখ)")}</div>
  <div class="kv">${f("নাম", k.name)}${f("পিতার নাম (নমিনি)", k.father_name)}${f("জন্মতারিখ", k.dob)}${f("NID নম্বর", k.nid_no)}${f("ঠিকানা", k.address, true)}${f("আবেদনের সময়", fmt(k.created_at), true)}</div>
  ${acts}`);
}
async function kApprove(id) {
  if (await ask({title: "KYC একসেপ্ট করবেন?", msg: "NID-র ছবি, তথ্য আর মুখ ঠিকমতো মিলিয়ে দেখেছেন তো? একসেপ্ট করলে ইউজারের অ্যাকাউন্ট চালু হয়ে যাবে।", ok: "একসেপ্ট করুন"}) === null) return;
  kDecide(id, true, "");
}
async function kReject(id) {
  const r = await ask({title: "KYC বাতিল করবেন?", msg: "কারণটা ইউজার তার অ্যাপে দেখতে পাবে, তাই পরিষ্কার করে লিখুন।", input: "বাতিলের কারণ", chips: ["ছবি অস্পষ্ট", "মুখ মেলেনি", "তথ্য পড়া যায়নি"], req: true, ok: "বাতিল করুন", danger: true});
  if (r === null) return;
  kDecide(id, false, r);
}
async function kRevoke(id) {
  const r = await ask({title: "একসেপ্ট বাতিল করবেন?", msg: "ইউজারের KYC বাতিল হবে, টাকা খরচ আবার বন্ধ হবে। কারণ ইউজার তার অ্যাপে দেখবে।", input: "বাতিলের কারণ", chips: ["মুখ মেলেনি", "ছবি অস্পষ্ট", "সন্দেহজনক"], req: true, ok: "বাতিল করুন", danger: true});
  if (r === null) return;
  if (!(await act(() => rpc("admin_kyc_revoke", {p_id: id, p_reason: r}), "KYC বাতিল হয়েছে"))) return;
  kNotify(id); S.u.items = []; S.u.more = false; closeSheet(); loadKyc(true); loadKycCounts(true);
}
async function kDecide(id, ok, why) {
  if (!(await act(() => rpc("admin_kyc_decide", {p_id: id, p_approve: ok, p_reason: ok ? null : why}), ok ? "KYC একসেপ্ট হয়েছে" : "KYC বাতিল হয়েছে"))) return;
  kNotify(id);
  S.u.items = []; S.u.more = false;
  closeSheet(); loadKyc(true); loadKycCounts(true);
}
/* ইউজারকে SMS ও Telegram এ জানানো (Edge Function "kyc-notify" না থাকলে চুপচাপ বাদ যায়, KYC এর কাজ আটকায় না) */
function kNotify(id) {
  try {
    const c = CFG();
    Promise.resolve(rawFetch(c.u + "/functions/v1/kyc-notify", {method: "POST", headers: {apikey: c.k, Authorization: "Bearer " + S.tok, "Content-Type": "application/json"}, body: JSON.stringify({action: "decided", id: id})})).catch(() => {});
  } catch (e) {}
}

/* ---------- কনটেন্ট: ব্যানার, নোটিশ, কুপন ---------- */
function pageCnt() {
  const seg = [["bn", "ব্যানার"], ["nt", "নোটিশ"], ["cp", "কুপন"]].map(([k, l]) => `<button class="${S.c.seg === k ? "on" : ""}" onclick="cSeg('${k}')">${l}</button>`).join("");
  return tbar("কনটেন্ট") + `<div class="seg">${seg}</div><div id="clist">${cList()}</div>`;
}
function cSeg(k) { S.c.seg = k; document.querySelectorAll(".seg button").forEach((b, i) => b.classList.toggle("on", ["bn", "nt", "cp"][i] === k)); refreshList("clist", cList()); }
const cList = () => (S.c.busy && !S.c.loaded ? '<div class="sk"></div>'.repeat(3) : S.c.seg === "bn" ? bnList() : S.c.seg === "nt" ? ntList() : cpList());
async function loadContent() {
  S.c.busy = true; refreshList("clist", cList());
  try {
    const [b, n, c, cs] = await Promise.all([api("/rest/v1/banners?select=*&order=sort.asc,id.asc"), api("/rest/v1/notices?select=*,profiles(phone,name)&order=id.desc&limit=60"), api("/rest/v1/coupons?select=*&order=id.desc"), rpc("admin_coupon_stats")]);
    S.c.bn = b; S.c.nt = n; S.c.cp = c; S.c.cs = {}; cs.forEach((r) => { S.c.cs[r.coupon_id] = r; }); S.c.loaded = true;
  } catch (e) { toast(errMsg(e)); }
  S.c.busy = false; refreshList("clist", cList());
}
function winTag(r) {
  const now = Date.now(), s = r.starts_at && new Date(r.starts_at).getTime(), e = r.ends_at && new Date(r.ends_at).getTime(), out = [];
  if (s && s > now) out.push('<span class="bd a">শুরু ' + fmtD(r.starts_at) + "</span>"); else if (s) out.push('<span class="bd m">শুরু ' + fmtD(r.starts_at) + "</span>");
  if (e && e < now) out.push('<span class="bd r">মেয়াদ শেষ</span>'); else if (e) out.push('<span class="bd m">শেষ ' + fmtD(r.ends_at) + "</span>");
  return out.join("");
}
const onTag = (r) => (r.active ? '<span class="bd g">চালু</span>' : '<span class="bd m">বন্ধ</span>');
const acts = (...a) => `<div class="acts">${a.map((x) => `<button class="${x[2] || ""}" onclick="${x[0]}">${x[1]}</button>`).join("")}</div>`;
async function tgl(tbl, id, on) { if (await act(() => api(`/rest/v1/${tbl}?id=eq.${id}`, {m: "PATCH", b: {active: on}, prefer: "return=minimal"}), on ? "চালু করা হয়েছে" : "বন্ধ করা হয়েছে")) loadContent(); }
async function del(tbl, id, what, warn) {
  if (await ask({title: what + " মুছবেন?", msg: warn || "মুছে ফেললে আর ফেরত পাওয়া যাবে না।", ok: "মুছে দিন", danger: true}) === null) return;
  if (await act(() => api(`/rest/v1/${tbl}?id=eq.${id}`, {m: "DELETE", prefer: "return=minimal"}), "মুছে ফেলা হয়েছে")) loadContent();
}

/* ব্যানার */
function bnPrev(b) { return `<div class="bn b${(Number(b.theme) || 0) % 5}"><div class="bt">${b.tag ? `<small>${esc(b.tag)}</small>` : ""}<b>${esc(b.title || "ব্যানারের শিরোনাম")}</b>${b.sub ? `<p>${esc(b.sub)}</p>` : ""}${b.btn ? `<span>${esc(b.btn)} ›</span>` : ""}</div><svg class="bv" viewBox="0 0 64 64">${BICO[b.icon] || BICO.gift}</svg></div>`; }
function bnList() {
  const L = S.c.bn;
  return `<button class="add" onclick="bnForm()">${ic("plus")} নতুন ব্যানার</button>` + (L.length ? L.map((b, i) => `<div class="item">${bnPrev(b)}<div class="bd2"><div class="meta">${onTag(b)}<span class="bd">${AUD[b.audience]}</span><span class="bd v">${ACT[b.action]}</span>${winTag(b)}</div></div>${acts([`bnMove(${b.id},-1)`, i ? ic("up") : "·"], [`bnMove(${b.id},1)`, i < L.length - 1 ? ic("down") : "·"], [`bnForm(${b.id})`, ic("edit") + "এডিট", "p"], [`tgl('banners',${b.id},${!b.active})`, b.active ? "বন্ধ" : "চালু"], [`del('banners',${b.id},'ব্যানার')`, ic("trash"), "d"])}</div>`).join("") : '<p class="em">কোনো ব্যানার নেই। হোম পেজে ব্যানার দেখাবে না।</p>');
}
function bnVals() {
  return {tag: val("bt"), title: val("bti"), sub: val("bs"), btn: val("bb"), action: val("ba"), link: val("bl"), theme: FORM.theme, icon: FORM.icon, audience: val("bau"), sort: parseInt(val("bso"), 10) || 0, active: chk("bac"), starts_at: toIso(val("bst")), ends_at: toIso(val("ben"))};
}
function bnPv() { const v = bnVals(); const e = $("bpv"); if (e) e.innerHTML = bnPrev(v); const l = $("blw"); if (l) l.style.display = v.action === "link" ? "" : "none"; }
function pickSw(k, v) { FORM[k] = v; document.querySelectorAll('[data-k="' + k + '"]').forEach((b) => b.classList.toggle("on", String(b.dataset.v) === String(v))); bnPv(); }
function bnForm(id) {
  const b = id ? S.c.bn.find((x) => x.id === id) : {tag: "", title: "", sub: "", btn: "", action: "none", link: "", theme: 0, icon: "gift", audience: "all", sort: (S.c.bn.length + 1) * 10, active: true, starts_at: null, ends_at: null};
  if (!b) return;
  FORM = {id: id || 0, theme: b.theme, icon: b.icon};
  sheet(`<div class="grip"></div><h3>${id ? "ব্যানার এডিট" : "নতুন ব্যানার"}</h3><div id="bpv">${bnPrev(b)}</div>
  <div oninput="bnPv()" onchange="bnPv()">
  ${fl("ছোট লেখা (উপরে, যেমন: অফার)", `<input id="bt" maxlength="30" value="${esc(b.tag)}">`)}${fl("শিরোনাম *", `<input id="bti" maxlength="70" value="${esc(b.title)}" placeholder="যেমন: ঈদে ২০% ক্যাশব্যাক">`)}${fl("ছোট বিবরণ", `<input id="bs" maxlength="80" value="${esc(b.sub)}">`)}${fl("বাটনের লেখা (খালি রাখলে বাটন থাকবে না)", `<input id="bb" maxlength="20" value="${esc(b.btn)}" placeholder="যেমন: এখনই নিন">`)}
  ${fl("বাটন চাপলে কী হবে", `<select id="ba">${opts(ACT, b.action)}</select>`)}<div id="blw" style="display:${b.action === "link" ? "" : "none"}">${fl("লিংক (https:// দিয়ে শুরু)", `<input id="bl" value="${esc(b.link)}" autocapitalize="off">`)}</div>
  <div class="fl"><span>রং</span><div class="pick">${TH.map((c, i) => `<button type="button" class="sw${Number(b.theme) === i ? " on" : ""}" data-k="theme" data-v="${i}" style="background:${c}" onclick="pickSw('theme',${i})"></button>`).join("")}</div></div>
  <div class="fl"><span>আইকন</span><div class="pick">${Object.keys(BICO).map((k) => `<button type="button" class="sw ib${b.icon === k ? " on" : ""}" data-k="icon" data-v="${k}" onclick="pickSw('icon','${k}')"><svg viewBox="0 0 64 64">${BICO[k]}</svg></button>`).join("")}</div></div>
  <div class="two">${fl("কাদের দেখাবে", `<select id="bau">${opts(AUD, b.audience)}</select>`)}${fl("ক্রম (ছোট আগে)", `<input id="bso" type="number" value="${b.sort}">`)}</div>
  <div class="two">${fl("শুরুর সময় (ঐচ্ছিক)", `<input id="bst" type="datetime-local" value="${ldt(b.starts_at)}">`)}${fl("শেষের সময় (ঐচ্ছিক)", `<input id="ben" type="datetime-local" value="${ldt(b.ends_at)}">`)}</div>
  ${swt("bac", "ব্যানার চালু থাকবে", b.active)}</div><button class="btn" onclick="bnSave()">সেভ করুন</button>`);
}
async function bnSave() {
  const v = bnVals();
  if (!v.title) return toast("শিরোনাম লিখুন");
  if (v.action === "link" && !/^https?:\/\//i.test(v.link)) return toast("লিংক https:// দিয়ে শুরু হতে হবে");
  if (v.action !== "link") v.link = "";
  const ok = await act(() => api(FORM.id ? `/rest/v1/banners?id=eq.${FORM.id}` : "/rest/v1/banners", {m: FORM.id ? "PATCH" : "POST", b: v, prefer: "return=minimal"}), "ব্যানার সেভ হয়েছে");
  if (ok) { closeSheet(); loadContent(); }
}
async function bnMove(id, d) {
  const L = S.c.bn, i = L.findIndex((b) => b.id === id), j = i + d; if (i < 0 || j < 0 || j >= L.length) return;
  const a = L.slice(); const t = a[i]; a[i] = a[j]; a[j] = t;
  const ch = a.map((b, k) => [b, (k + 1) * 10]).filter(([b, s]) => b.sort !== s);
  if (await act(() => Promise.all(ch.map(([b, s]) => api(`/rest/v1/banners?id=eq.${b.id}`, {m: "PATCH", b: {sort: s}, prefer: "return=minimal"}))))) loadContent();
}

/* নোটিশ */
function ntList() {
  const L = S.c.nt;
  return `<button class="add" onclick="ntForm()">${ic("plus")} নতুন নোটিশ পাঠান</button>` + (L.length ? L.map((n) => {
    const who = n.target_id ? `<span class="bd v">${esc((n.profiles && (n.profiles.name || n.profiles.phone)) || "একজন")}</span>` : `<span class="bd">${AUD[n.audience]}</span>`;
    return `<div class="item"><div class="nt"><div class="ic">${ic(NKI[n.kind])}</div><div class="t"><b>${esc(n.title)}</b>${n.body ? `<p>${esc(n.body)}</p>` : ""}<div class="meta">${onTag(n)}<span class="bd">${NKL[n.kind]}</span>${who}${n.popup ? '<span class="bd a">পপআপ</span>' : ""}${winTag(n)}<span class="bd m">${fmt(n.created_at)}</span></div></div></div>${acts([`ntForm(${n.id})`, ic("edit") + "এডিট", "p"], [`tgl('notices',${n.id},${!n.active})`, n.active ? "বন্ধ" : "চালু"], [`del('notices',${n.id},'নোটিশ')`, ic("trash"), "d"])}</div>`;
  }).join("") : '<p class="em">কোনো নোটিশ নেই</p>');
}
function ntAud() { const e = $("nau"), w = $("nphw"); if (e && w) w.style.display = e.value === "one" ? "" : "none"; }
function ntForm(id, phone) {
  const n = id ? S.c.nt.find((x) => x.id === id) : {title: "", body: "", kind: "info", popup: false, audience: "all", target_id: null, active: true, starts_at: null, ends_at: null};
  if (!n) return;
  FORM = {id: id || 0, target: n.target_id || null};
  const aud = phone || n.target_id ? "one" : n.audience, ph = phone || (n.profiles && n.profiles.phone) || "";
  sheet(`<div class="grip"></div><h3>${id ? "নোটিশ এডিট" : "নতুন নোটিশ"}</h3>
  <p class="sub">নোটিশ ইউজারের অ্যাপের ইনবক্স → নোটিফিকেশনে দেখাবে। "পপআপ" চালু করলে অ্যাপ খুললেই পর্দায় ভেসে উঠবে (প্রতি ফোনে একবার)।</p>
  ${fl("শিরোনাম *", `<input id="nti" maxlength="70" value="${esc(n.title)}" placeholder="যেমন: ঈদ মোবারক!">`)}${fl("বিস্তারিত", `<textarea id="nbo" maxlength="500">${esc(n.body)}</textarea>`)}
  <div class="two">${fl("ধরন", `<select id="nki">${opts(NKL, n.kind)}</select>`)}${fl("কাদের পাঠাবেন", `<select id="nau" onchange="ntAud()">${opts(Object.assign({}, AUD, {one: "নির্দিষ্ট একজন"}), aud)}</select>`)}</div>
  <div id="nphw" style="display:${aud === "one" ? "" : "none"}">${fl("ইউজারের নম্বর", `<input id="nph" inputmode="numeric" maxlength="11" value="${esc(ph)}" placeholder="01XXXXXXXXX">`)}</div>
  <div class="two">${fl("শুরুর সময় (ঐচ্ছিক)", `<input id="nst" type="datetime-local" value="${ldt(n.starts_at)}">`)}${fl("শেষের সময় (ঐচ্ছিক)", `<input id="nen" type="datetime-local" value="${ldt(n.ends_at)}">`)}</div>
  ${swt("npo", "পপআপ হিসেবেও দেখাও", n.popup)}${swt("nac", "নোটিশ চালু থাকবে", n.active)}<button class="btn" onclick="ntSave()">${id ? "সেভ করুন" : "পাঠিয়ে দিন"}</button>`);
}
async function ntSave() {
  const title = val("nti"); if (!title) return toast("শিরোনাম লিখুন");
  const aud = val("nau"); let target = null;
  const b = {title, body: val("nbo"), kind: val("nki"), popup: chk("npo"), active: chk("nac"), starts_at: toIso(val("nst")), ends_at: toIso(val("nen")), audience: aud === "one" ? "all" : aud};
  if (aud === "one") {
    const ph = val("nph"); if (!/^01\d{9}$/.test(ph)) return toast("সঠিক ১১ ডিজিট নম্বর দিন");
    try { const r = await api(`/rest/v1/profiles?phone=eq.${ph}&select=id`); if (!r.length) return toast("এই নম্বরে কোনো ইউজার নেই"); target = r[0].id; } catch (e) { return toast(errMsg(e)); }
  }
  b.target_id = target;
  if (await act(() => api(FORM.id ? `/rest/v1/notices?id=eq.${FORM.id}` : "/rest/v1/notices", {m: FORM.id ? "PATCH" : "POST", b, prefer: "return=minimal"}), FORM.id ? "নোটিশ সেভ হয়েছে" : "নোটিশ পাঠানো হয়েছে")) { closeSheet(); S.c.loaded && loadContent(); }
}

/* কুপন */
const cpSum = (c) => (c.kind === "percent" ? bn(c.val) + "% ছাড়" + (c.max_disc ? ", সর্বোচ্চ " + money(c.max_disc) : "") : money(c.val) + " ছাড়") + (Number(c.min_amt) ? " · সর্বনিম্ন " + money(c.min_amt) : "");
function cpList() {
  const L = S.c.cp;
  return `<button class="add" onclick="cpForm()">${ic("plus")} নতুন কুপন</button>` + (L.length ? L.map((c) => {
    const s = S.c.cs[c.id] || {given: 0, used: 0}, ex = c.expires_at && new Date(c.expires_at) < new Date();
    return `<div class="item"><div class="cp"><span class="cpc">${esc(c.code)}</span> ${onTag(c)}${ex ? '<span class="bd r">মেয়াদ শেষ</span>' : ""}<b>${esc(c.title)}</b><span>${cpSum(c)}${c.expires_at ? " · মেয়াদ " + fmt(c.expires_at) : ""}</span><div class="cps"><div><b>${bn(s.given)}</b>পেয়েছেন</div><div><b>${bn(s.used)}</b>ব্যবহার করেছেন</div></div></div>${acts([`giveCoupon(${c.id})`, ic("gift") + "ইউজারদের দিন", "p"], [`cpForm(${c.id})`, ic("edit")], [`tgl('coupons',${c.id},${!c.active})`, c.active ? "বন্ধ" : "চালু"], [`del('coupons',${c.id},'কুপন','এই কুপন যাদের কাছে আছে তাদের কাছ থেকেও মুছে যাবে।')`, ic("trash"), "d"])}</div>`;
  }).join("") : '<p class="em">কোনো কুপন নেই</p>');
}
function cpKind() { const e = $("ck"), w = $("cmw"); if (e && w) w.style.display = e.value === "percent" ? "" : "none"; }
function cpForm(id) {
  const c = id ? S.c.cp.find((x) => x.id === id) : {code: "", title: "", kind: "flat", val: "", max_disc: "", min_amt: 0, expires_at: null, active: true};
  if (!c) return;
  FORM = {id: id || 0};
  sheet(`<div class="grip"></div><h3>${id ? "কুপন এডিট" : "নতুন কুপন"}</h3>
  <p class="sub">কুপন বানালে ইউজাররা অ্যাপে "কুপন কোড" লিখে নিজেই যোগ করতে পারবে। চাইলে "ইউজারদের দিন" থেকে সরাসরি সবার কাছে পাঠাতে পারেন।</p>
  ${fl("কুপন কোড * (ইংরেজি অক্ষর/সংখ্যা)", `<input id="cc" maxlength="20" value="${esc(c.code)}" ${id ? "disabled" : ""} autocapitalize="characters" placeholder="EID20" style="text-transform:uppercase;letter-spacing:1px;font-weight:700">`)}
  ${fl("কুপনের বর্ণনা * (ইউজার দেখবে)", `<input id="ct" maxlength="60" value="${esc(c.title)}" placeholder="যেমন: ঈদ অফার ২০ টাকা ছাড়">`)}
  <div class="two">${fl("ছাড়ের ধরন", `<select id="ck" onchange="cpKind()">${opts({flat: "টাকা (ফ্ল্যাট)", percent: "শতাংশ (%)"}, c.kind)}</select>`)}${fl("ছাড়ের পরিমাণ *", `<input id="cv" type="number" inputmode="decimal" value="${esc(c.val)}">`)}</div>
  <div id="cmw" style="display:${c.kind === "percent" ? "" : "none"}">${fl("সর্বোচ্চ ছাড় (ঐচ্ছিক, ৳)", `<input id="cm" type="number" inputmode="decimal" value="${esc(c.max_disc == null ? "" : c.max_disc)}">`)}</div>
  <div class="two">${fl("সর্বনিম্ন পেমেন্ট (৳)", `<input id="cn" type="number" inputmode="decimal" value="${esc(c.min_amt)}">`)}${fl("মেয়াদ শেষ (ঐচ্ছিক)", `<input id="ce" type="datetime-local" value="${ldt(c.expires_at)}">`)}</div>
  ${swt("cac", "কুপন চালু", c.active)}<button class="btn" onclick="cpSave()">সেভ করুন</button>`);
}
async function cpSave() {
  const code = val("cc").toUpperCase(), title = val("ct"), kind = val("ck"), v = Number(val("cv"));
  if (!FORM.id && !/^[A-Z0-9]{3,20}$/.test(code)) return toast("কোড ৩-২০টি ইংরেজি অক্ষর/সংখ্যার হতে হবে");
  if (!title) return toast("বর্ণনা লিখুন");
  if (!(v > 0) || (kind === "percent" && v > 100)) return toast("ছাড়ের পরিমাণ ঠিক নয়");
  const b = {title, kind, val: v, max_disc: kind === "percent" && Number(val("cm")) > 0 ? Number(val("cm")) : null, min_amt: Number(val("cn")) || 0, expires_at: toIso(val("ce")), active: chk("cac")};
  if (!FORM.id) b.code = code;
  if (await act(() => api(FORM.id ? `/rest/v1/coupons?id=eq.${FORM.id}` : "/rest/v1/coupons", {m: FORM.id ? "PATCH" : "POST", b, prefer: "return=minimal"}), "কুপন সেভ হয়েছে")) { closeSheet(); loadContent(); }
}
function giveCoupon(id) {
  const c = S.c.cp.find((x) => x.id === id); if (!c) return;
  FORM = {id};
  sheet(`<div class="grip"></div><h3>কুপন দিন</h3><p class="sub"><b>${esc(c.code)}</b> · ${esc(c.title)}\nযারা আগেই পেয়েছেন তারা আবার পাবেন না।</p>
  ${fl("কাদের দেবেন", `<select id="gt" onchange="$('gpw').style.display=this.value==='one'?'':'none'">${opts(Object.assign({}, AUD, {one: "নির্দিষ্ট একজন"}), "all")}</select>`)}<div id="gpw" style="display:none">${fl("ইউজারের নম্বর", `<input id="gph" inputmode="numeric" maxlength="11" placeholder="01XXXXXXXXX">`)}</div>
  <button class="btn" onclick="giveGo()">কুপন পাঠান</button>`);
}
async function giveGo() {
  let t = val("gt"); if (t === "one") { t = val("gph"); if (!/^01\d{9}$/.test(t)) return toast("সঠিক ১১ ডিজিট নম্বর দিন"); }
  if (t === "all" && await ask({title: "সবাইকে কুপন দেবেন?", msg: "অ্যাপের সব সক্রিয় ইউজার এই কুপন পাবেন।", ok: "হ্যাঁ, দিন"}) === null) return;
  try { const n = await rpc("admin_give_coupon", {p_coupon: FORM.id, p_target: t}); toast(n ? n + " জন কুপন পেলেন" : "সবার কাছে আগেই আছে বা কেউ পাওয়া যায়নি"); closeSheet(); loadContent(); } catch (e) { toast(errMsg(e)); }
}
async function giveToUser(phone) {
  sheet('<div class="grip"></div><h3>কোন কুপন দেবেন?</h3>' + spin);
  try { if (!S.c.loaded) await loadContent(); } catch (e) {}
  const L = S.c.cp.filter((c) => c.active);
  sheet(`<div class="grip"></div><h3>কোন কুপন দেবেন?</h3><p class="sub">${esc(phone)} নম্বরের ইউজারকে</p>${L.length ? `<div class="list" style="margin:0;box-shadow:none;border:1px solid var(--ln)">${L.map((c) => `<div class="row" onclick="giveOne(${c.id},'${esc(phone)}')"><div class="ic">${ic("cpn")}</div><div class="m"><b>${esc(c.code)}</b><span>${esc(c.title)}</span></div></div>`).join("")}</div>` : '<p class="em">কোনো চালু কুপন নেই। আগে কনটেন্ট → কুপন থেকে বানান।</p>'}`);
}
async function giveOne(id, phone) { try { const n = await rpc("admin_give_coupon", {p_coupon: id, p_target: phone}); toast(n ? "কুপন দেওয়া হয়েছে" : "ইউজারের কাছে এই কুপন আগেই আছে"); closeSheet(); } catch (e) { toast(errMsg(e)); } }

/* ---------- আরও: রক্ষণাবেক্ষণ, অ্যাডমিন, লগ ---------- */
function pageMore() {
  const own = S.me.level === "owner", R = (i, l, js, r, c) => `<button class="mr ${c || ""}" onclick="${js}">${ic(i)}<span>${l}</span>${r || ic("ch").replace('class="i"', 'class="i ch"')}</button>`;
  return tbar("আরও") + `<div class="msec"><h4>অ্যাপ নিয়ন্ত্রণ</h4>${R("tool", "রক্ষণাবেক্ষণ মোড", "openMaint()", `<small>${S.maint && S.maint.on ? "চালু আছে" : "বন্ধ"}</small>`)}</div>
  ${own ? `<div class="msec"><h4>শুধু মালিকের জন্য</h4>${R("adm", "অ্যাডমিন ব্যবস্থাপনা", "openAdmins()")}${R("log", "অডিট লগ (কে কী করেছে)", "openAudit()")}</div>` : ""}
  <div class="msec"><h4>অ্যাকাউন্ট</h4>${R("adm", esc(S.me.name || "অ্যাডমিন"), "void 0", `<small>${own ? "মালিক" : "স্টাফ"}</small>`)}${R("out", "লগআউট", "logout()", "", "d")}</div>
  <div class="msec"><h4>অ্যাপ</h4>${R("tool", "আপডেট চেক করুন", "checkUpdate(true)", `<small>v${APP_VERSION}</small>`)}</div>
  <p class="em">FuNPaY Admin v${APP_VERSION}<br>নিরাপত্তার জন্য ৫ মিনিট ব্যাকগ্রাউন্ডে থাকলে নিজে লগআউট হয়</p>`;
}
const MT = [["আপডেট চলছে", "নতুন আপডেটের কাজ চলছে", "FuNPaY তে নতুন সুবিধা যোগ করা হচ্ছে। কিছুক্ষণ পরে আবার আসুন। আপনার টাকা সম্পূর্ণ নিরাপদ আছে।"], ["সার্ভার আপগ্রেড", "সার্ভার আপগ্রেড চলছে", "আরও দ্রুত ও নিরাপদ সেবা দিতে আমরা সার্ভার আপগ্রেড করছি। অল্প সময়ের মধ্যেই আবার চালু হবে।"], ["জরুরি রক্ষণাবেক্ষণ", "জরুরি রক্ষণাবেক্ষণ চলছে", "একটি জরুরি কাজের জন্য সেবা সাময়িক বন্ধ আছে। অসুবিধার জন্য আমরা দুঃখিত।"]];
function openMaint() {
  const m = S.maint || {}, own = S.me.level === "owner";
  sheet(`<div class="grip"></div><h3>রক্ষণাবেক্ষণ মোড</h3>
  <div class="note${m.on ? " r" : ""}">${m.on ? "<b>এখন চালু আছে।</b> সব ইউজারের অ্যাপে রক্ষণাবেক্ষণের স্ক্রিন দেখাচ্ছে এবং কেউ লেনদেন করতে পারছে না।" : "এখন বন্ধ। চালু করলে ১০ সেকেন্ডের মধ্যে সব ইউজারের অ্যাপে সুন্দর বার্তা দেখাবে এবং সব লেনদেন বন্ধ হয়ে যাবে। বন্ধ করলে অ্যাপ নিজে থেকেই আবার চালু হবে।"}</div>
  ${own ? "" : '<div class="note">এটি শুধু মালিক বদলাতে পারেন।</div>'}
  <div class="qc">${MT.map((t, i) => `<button type="button" onclick="mtTpl(${i})">${t[0]}</button>`).join("")}</div>
  ${fl("শিরোনাম (খালি রাখলে সাধারণ লেখা দেখাবে)", `<input id="mti" maxlength="60" value="${esc(m.title || "")}" placeholder="রক্ষণাবেক্ষণের কাজ চলছে">`)}
  ${fl("বার্তা", `<textarea id="mms" maxlength="300" placeholder="ইউজাররা যা পড়বে">${esc(m.message || "")}</textarea>`)}
  ${fl("আনুমানিক শেষ হওয়ার সময় (ঐচ্ছিক)", `<input id="met" type="datetime-local" value="${ldt(m.eta)}">`)}
  <button class="btn o" onclick="mtPreview()">ইউজার যেমন দেখবে (প্রিভিউ)</button>
  ${own ? (m.on ? `<div class="rowb"><button class="btn o" onclick="mtSet(true)">বার্তা আপডেট</button><button class="btn g" onclick="mtSet(false)">রক্ষণাবেক্ষণ শেষ করুন</button></div>` : `<button class="btn r" onclick="mtSet(true)">রক্ষণাবেক্ষণ চালু করুন</button>`) : ""}`);
}
function mtTpl(i) { $("mti").value = MT[i][1]; $("mms").value = MT[i][2]; }
function mtPreview() {
  const t = val("mti") || "রক্ষণাবেক্ষণের কাজ চলছে", m = val("mms") || "আমরা FuNPaY কে আরও ভালো করছি। কিছুক্ষণ পরে আবার আসুন। এই সময় কোনো লেনদেন করা যাবে না, আপনার টাকা সম্পূর্ণ নিরাপদ আছে।", eta = val("met");
  const e = document.createElement("div"); e.id = "pv"; e.className = "ovl";
  e.innerHTML = `<div class="ovl-in"><div class="ovl-ic"><i></i>${ic("tool")}</div><h2>${esc(t)}</h2><p>${esc(m)}</p>${eta ? `<div class="eta">আনুমানিক শেষ হবে<b>${esc(fmt(new Date(eta).toISOString()))}</b></div>` : ""}<button class="ovl-btn" onclick="document.getElementById('pv').remove()">প্রিভিউ বন্ধ করুন</button><small>এটি শুধু প্রিভিউ</small></div>`;
  document.body.appendChild(e);
}
async function mtSet(on) {
  const r = await ask(on ? {title: "রক্ষণাবেক্ষণ চালু করবেন?", msg: "সব ইউজারের অ্যাপ বন্ধ হয়ে রক্ষণাবেক্ষণের বার্তা দেখাবে এবং কোনো লেনদেন চলবে না। আপনি অ্যাডমিন অ্যাপ থেকে স্বাভাবিকভাবেই কাজ করতে পারবেন।", ok: "চালু করুন", danger: true} : {title: "রক্ষণাবেক্ষণ শেষ করবেন?", msg: "ইউজারদের অ্যাপ নিজে থেকেই আবার চালু হবে এবং লেনদেন শুরু হবে।", ok: "হ্যাঁ, চালু করুন"});
  if (r === null) return;
  const b = {p_on: on, p_title: val("mti"), p_message: val("mms"), p_eta: on ? toIso(val("met")) : null};
  if (await act(() => rpc("admin_set_maintenance", b), on ? "রক্ষণাবেক্ষণ চালু হয়েছে" : "অ্যাপ আবার চালু হয়েছে")) { try { S.maint = (await rpc("app_status")).maint || {}; } catch (e) {} closeSheet(); render(); }
}
async function openAdmins() {
  sheet('<div class="grip"></div><h3>অ্যাডমিন ব্যবস্থাপনা</h3>' + spin);
  try {
    const L = await rpc("admin_list");
    sheet(`<div class="grip"></div><h3>অ্যাডমিন ব্যবস্থাপনা</h3><div class="list" style="margin:0 0 14px;box-shadow:none;border:1px solid var(--ln)">${L.map((a) => `<div class="row" style="cursor:default"><div class="av s">${fch(a.name || a.email)}</div><div class="m"><b>${esc(a.name || "—")}<span class="bd ${a.level === "owner" ? "v" : ""}">${a.level === "owner" ? "মালিক" : "স্টাফ"}</span></b><span>${esc(a.email)}</span></div>${a.user_id === S.me.id ? "" : `<button class="chip" style="color:var(--red)" onclick="admDel('${a.user_id}')">সরান</button>`}</div>`).join("")}</div>
    <div class="note">নতুন অ্যাডমিন যোগ করতে আগে Supabase → Authentication → Users এ তার ইমেইল ও পাসওয়ার্ড দিয়ে অ্যাকাউন্ট বানান (Auto Confirm User টিক দিন; OTP চালু থাকলে README র ৩ নম্বর ধাপ মেনে), তারপর এখানে সেই ইমেইল দিন।</div>
    ${fl("ইমেইল", `<input id="ae" type="email" autocapitalize="off">`)}${fl("নাম", `<input id="an" maxlength="30">`)}${fl("ধরন", `<select id="al">${opts({staff: "স্টাফ (ইউজার সামলাতে, কনটেন্ট বানাতে পারবে)", owner: "মালিক (সব ক্ষমতা)"}, "staff")}</select>`)}<button class="btn" onclick="admAdd()">অ্যাডমিন যোগ করুন</button>`);
  } catch (e) { closeSheet(); toast(errMsg(e)); }
}
async function admAdd() { const em = val("ae"); if (!em) return toast("ইমেইল দিন"); if (await act(() => rpc("admin_add", {p_email: em, p_name: val("an"), p_level: val("al")}), "অ্যাডমিন যোগ হয়েছে")) openAdmins(); }
async function admDel(id) { if (await ask({title: "অ্যাডমিন সরাবেন?", msg: "সে আর অ্যাডমিন অ্যাপে ঢুকতে পারবে না।", ok: "সরান", danger: true}) === null) return; if (await act(() => rpc("admin_remove", {p_id: id}), "সরানো হয়েছে")) openAdmins(); }
const AL = (a) => ({"status suspended": "অ্যাকাউন্ট স্থগিত", "status active": "অ্যাকাউন্ট চালু", "status closed": "অ্যাকাউন্ট বন্ধ", "maintenance on": "রক্ষণাবেক্ষণ চালু", "maintenance off": "রক্ষণাবেক্ষণ বন্ধ", "give coupon": "কুপন দেওয়া", "admin remove": "অ্যাডমিন সরানো", "kyc approve": "KYC একসেপ্ট", "kyc reject": "KYC বাতিল", "kyc auto-approve": "KYC অটো একসেপ্ট (মুখ মিলেছে)", "kyc revoke": "KYC একসেপ্ট ফেরত (বাতিল)",
  "insert banners": "নতুন ব্যানার", "update banners": "ব্যানার বদল", "delete banners": "ব্যানার মোছা", "insert notices": "নোটিশ পাঠানো", "update notices": "নোটিশ বদল", "delete notices": "নোটিশ মোছা", "insert coupons": "নতুন কুপন", "update coupons": "কুপন বদল", "delete coupons": "কুপন মোছা"}[a]
  || (a.startsWith("role ") ? "ধরন বদল: " + (RL[a.slice(5)] || a.slice(5)) : a.startsWith("admin add") ? "অ্যাডমিন যোগ" : a));
async function openAudit() {
  sheet('<div class="grip"></div><h3>অডিট লগ</h3>' + spin);
  try {
    const L = await api("/rest/v1/audit_log?select=*&order=id.desc&limit=60");
    sheet(`<div class="grip"></div><h3>অডিট লগ</h3>${L.length ? `<div class="list" style="margin:0;box-shadow:none;border:1px solid var(--ln)">${L.map((a) => { const d = a.detail || {}, x = d.reason || d.title || d.code || (d.count != null ? d.count + " জন" : ""); return `<div class="row" style="cursor:default"><div class="ic">${ic("log")}</div><div class="m"><b>${esc(AL(a.action))}</b><span>${esc([a.target, x].filter(Boolean).join(" · "))} · ${esc(a.admin_name || "—")}</span></div><div class="r"><small>${fmt(a.created_at)}</small></div></div>`; }).join("")}</div>` : '<p class="em">এখনো কিছু করা হয়নি</p>'}`);
  } catch (e) { closeSheet(); toast(errMsg(e)); }
}

/* ---------- OTA আপডেট: নতুন কোড পুশ করলেই অ্যাপ নিজে নামিয়ে নেয়, APK আবার বানাতে হয় না ---------- */
const newer = (a, b) => { const x = String(a).split(".").map(Number), y = String(b).split(".").map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) > (y[i] || 0)) return true; if ((x[i] || 0) < (y[i] || 0)) return false; } return false; };
const pkgUrls = (j) => {
  const u = j.pkg || "", m = /raw\.githubusercontent\.com\/([^/]+\/[^/]+)\/ota\/(.+)$/.exec(u);
  return m ? [u, "https://github.com/" + m[1] + "/raw/ota/" + m[2], "https://cdn.jsdelivr.net/gh/" + m[1] + "@ota/" + m[2]] : (u ? [u] : []);
};
let OTA_PEND = false, OTA_BUSY = false;
/* নতুন কোড নামিয়ে ফোনে সেভ করে। ভাঙা কোড হলে সেভই হয় না */
async function fetchPkg(j) {
  let last = "";
  for (const url of pkgUrls(j)) {
    try {
      const r = await rawFetch(url, {cache: "no-store"});
      if (!r.ok) { last = "HTTP " + r.status; continue; }
      const p = await r.json();
      if (!p || p.version !== j.version || !p.js || p.js.length < 20000) { last = "bad pkg"; continue; }
      new Function(p.js);
      localStorage.setItem("fpota", JSON.stringify({version: p.version, js: p.js, css: p.css || ""}));
      return "";
    } catch (e) { last = String((e && e.message) || e).slice(0, 80); }
  }
  return last || "fail";
}
function otaReload(v) {
  try { if (sessionStorage.getItem("fpr") === v) return; sessionStorage.setItem("fpr", v); } catch (e) {}
  setTimeout(() => location.reload(), 700);
}
/* কাজের মাঝখানে (ফর্ম/ছবি/ডায়ালগ খোলা) রিলোড করা হয় না, সেটা পরে হয় */
const otaIdle = () => !$("sh") && !$("cf") && !$("kimg") && !$("pv") && !S.busy && !(document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName || ""));
async function checkUpdate(manual) {
  if (OTA_BUSY) return; OTA_BUSY = true;
  try {
    if (!OTA_URL) { if (manual === true) toast("আপডেট সার্ভার সেট করা নেই"); return; }
    if (manual === true) toast("আপডেট দেখা হচ্ছে…");
    const r = await rawFetch(OTA_URL + "?t=" + Date.now(), {cache: "no-store"}), j = await r.json();
    if (!newer(j.version, APP_VERSION)) { if (manual === true) toast("আপনি সর্বশেষ ভার্সনে আছেন"); return; }
    if (!j.pkg) { if (manual === true) toast("আপডেট নামানো যায়নি"); return; }
    let have = "", bad = ""; try { have = (JSON.parse(localStorage.getItem("fpota") || "null") || {}).version || ""; bad = localStorage.getItem("fpbad") || ""; } catch (e) {}
    if (bad === j.version) { if (manual === true) toast("এই আপডেট এই ফোনে চলেনি, নতুন আপডেটের অপেক্ষা করুন"); return; }
    if (have !== j.version) {
      if (manual === true) toast("নতুন আপডেট নামছে · v" + j.version);
      const err = await fetchPkg(j);
      if (err) { if (manual === true) toast("নামানো যায়নি (" + err + ")"); return; }
    }
    if (manual === true || otaIdle()) { toast("আপডেট তৈরি, অ্যাপ নতুন হচ্ছে…"); otaReload(j.version); }
    else OTA_PEND = true;
  } catch (e) { if (manual === true) toast("আপডেট দেখা যায়নি, ইন্টারনেট দেখুন"); }
  finally { OTA_BUSY = false; }
}
/* অপেক্ষায় থাকা আপডেট ফাঁকা সময়ে বসানো */
setInterval(() => { if (OTA_PEND && otaIdle()) { OTA_PEND = false; otaReload("p" + Date.now()); } }, 4000);
setTimeout(() => checkUpdate(), 2500);
setInterval(() => { if (!document.hidden) checkUpdate(); }, 600000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) setTimeout(() => checkUpdate(), 1200); });

/* ---------- চালু করা ---------- */
let hiddenAt = 0;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { hiddenAt = Date.now(); return; }
  if (S.auth && hiddenAt && Date.now() - hiddenAt > 300000) logout("নিরাপত্তার জন্য লগআউট হয়েছে, আবার লগইন করুন");
  else if (S.auth && S.tab === "home") loadHome(true);
  else if (S.auth) loadKycCounts(true);
  hiddenAt = 0;
});
setInterval(() => { if (S.auth && S.tab === "home" && !document.hidden && !$("sh") && !$("cf")) loadHome(true); }, 30000);
setInterval(() => {
  if (!S.auth || document.hidden || S.tab === "home") return;
  loadKycCounts(true);
  if (S.tab === "kyc" && !$("sh") && !$("cf") && !$("kimg")) loadKyc(true, true);
}, 30000);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { if ($("kimg")) $("kimg").remove(); else if ($("pv")) $("pv").remove(); else if ($("cf")) $("cfc").click(); else closeSheet(); } });
try {
  const A = cap().App;
  if (A) A.addListener("backButton", () => {
    if ($("kimg")) { $("kimg").remove(); return; }
    if ($("pv")) { $("pv").remove(); return; }
    if ($("cf")) { $("cfc").click(); return; }
    if ($("sh")) { closeSheet(); return; }
    if (S.auth && S.tab !== "home") { go("home"); return; }
    A.exitApp();
  });
  const SB = cap().StatusBar; if (SB) { SB.setStyle({style: "DARK"}); SB.setBackgroundColor({color: "#e2136e"}); }
  const SS = cap().SplashScreen; if (SS) setTimeout(() => SS.hide(), 300);
} catch (e) {}
render();
window.__fpready = true;
