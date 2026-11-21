// npx cap add android এর পর একবার চালান: node scripts/fix-android.js
// ১) minSdkVersion কমপক্ষে 23 (QR স্ক্যানার)
// ২) compileSdkVersion 35 + সতর্কতা বন্ধ (নতুন androidx লাইব্রেরি)
// ৩) Gradle এর মেমরি বাড়ানো (বিল্ড মাঝপথে থেমে যাওয়া ঠেকায়)
// ৪) ভাইব্রেশন permission AndroidManifest এ বসানো
const fs = require("fs");
const f = "android/variables.gradle";
if (!fs.existsSync(f)) { console.log("android/variables.gradle পাওয়া যায়নি, আগে npx cap add android চালান"); process.exit(0); }
let s = fs.readFileSync(f, "utf8");
s = s.replace(/minSdkVersion\s*=\s*(\d+)/, (m, v) => "minSdkVersion = " + Math.max(23, Number(v)));
s = s.replace(/compileSdkVersion\s*=\s*(\d+)/, (m, v) => "compileSdkVersion = " + Math.max(35, Number(v)));
fs.writeFileSync(f, s);

const g = "android/gradle.properties";
let p = fs.existsSync(g) ? fs.readFileSync(g, "utf8") : "";
if (!/suppressUnsupportedCompileSdk/.test(p)) p += "\nandroid.suppressUnsupportedCompileSdk=35\n";
if (/^org\.gradle\.jvmargs=.*$/m.test(p)) p = p.replace(/^org\.gradle\.jvmargs=.*$/m, "org.gradle.jvmargs=-Xmx3g -Dfile.encoding=UTF-8");
else p += "org.gradle.jvmargs=-Xmx3g -Dfile.encoding=UTF-8\n";
fs.writeFileSync(g, p);

const m = "android/app/src/main/AndroidManifest.xml";
if (fs.existsSync(m)) {
  let x = fs.readFileSync(m, "utf8");
  ["android.permission.VIBRATE"].forEach((perm) => {
    if (!x.includes(perm)) x = x.replace("</manifest>", `    <uses-permission android:name="${perm}" />\n</manifest>`);
  });
  fs.writeFileSync(m, x);
}

/* ৫) টানলে স্ক্রিন বড়/নরম হওয়া (overscroll stretch) বন্ধ, যেন নেটিভ অ্যাপের মতো স্থির থাকে */
(function walk(d) {
  if (!fs.existsSync(d)) return;
  for (const n of fs.readdirSync(d)) {
    const q = d + "/" + n;
    if (fs.statSync(q).isDirectory()) walk(q);
    else if (n === "MainActivity.java") {
      let c = fs.readFileSync(q, "utf8");
      if (!c.includes("OVER_SCROLL_NEVER") && /extends BridgeActivity\s*\{\s*\}/.test(c)) {
        c = c.replace(/extends BridgeActivity\s*\{\s*\}/, "extends BridgeActivity {\n    @Override\n    public void onStart() {\n        super.onStart();\n        try { getBridge().getWebView().setOverScrollMode(android.view.View.OVER_SCROLL_NEVER); } catch (Exception e) {}\n    }\n}");
        fs.writeFileSync(q, c);
        console.log("MainActivity: overscroll বন্ধ");
      }
    }
  }
})("android/app/src/main/java");

/* ৬) অ্যাপ খোলার সময় কালো/ধূসর স্ক্রিন বন্ধ: নেটিভ স্প্ল্যাশ পুরো গোলাপি, আইকন স্বচ্ছ, তারপর সরাসরি আমাদের অ্যানিমেশন */
(function () {
  const res = "android/app/src/main/res";
  if (!fs.existsSync(res)) return;
  fs.mkdirSync(res + "/values", {recursive: true}); fs.mkdirSync(res + "/drawable", {recursive: true});
  fs.writeFileSync(res + "/drawable/fp_splash_icon.xml", '<?xml version="1.0" encoding="utf-8"?>\n<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle"><solid android:color="#00000000"/><size android:width="48dp" android:height="48dp"/></shape>\n');
  fs.writeFileSync(res + "/values/fp_colors.xml", '<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="fp_splash_bg">#c40f5e</color></resources>\n');
  const st = res + "/values/styles.xml";
  if (fs.existsSync(st)) {
    let x = fs.readFileSync(st, "utf8");
    if (!x.includes("windowSplashScreenBackground")) {
      x = x.replace(/(<style name="AppTheme\.NoActionBarLaunch"[^>]*>)/, '$1\n        <item name="windowSplashScreenBackground">@color/fp_splash_bg</item>\n        <item name="windowSplashScreenAnimatedIcon">@drawable/fp_splash_icon</item>\n        <item name="windowSplashScreenAnimationDuration">0</item>\n        <item name="android:windowBackground">@color/fp_splash_bg</item>');
      fs.writeFileSync(st, x);
      console.log("styles.xml: স্প্ল্যাশ গোলাপি করা হলো");
    }
  }
  /* ডার্ক মোডেও একই (values-night থাকলে) */
  const sn = res + "/values-night/styles.xml";
  if (fs.existsSync(sn)) { let y = fs.readFileSync(sn, "utf8"); if (!y.includes("windowSplashScreenBackground")) { y = y.replace(/(<style name="AppTheme\.NoActionBarLaunch"[^>]*>)/, '$1\n        <item name="windowSplashScreenBackground">@color/fp_splash_bg</item>\n        <item name="windowSplashScreenAnimatedIcon">@drawable/fp_splash_icon</item>'); fs.writeFileSync(sn, y); } }
})();
console.log("android সেটিং ঠিক করা হয়েছে");
