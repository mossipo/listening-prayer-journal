// Builds native/www for the App Store app from the web app in the parent folder.
//   1. Copies the web app (the same code as the website).
//   2. Bundles Firebase inside the app, so it starts with no connection and loads no code from the internet.
//   3. Bundles the Capacitor plugins (daily reminder, share sheet) as window.AkouoNative.
//   4. Includes the whole Berean Standard Bible (bible/bsb), so passages open offline.
//   5. Copies the fonts into the app and points index.html at them instead of Google Fonts.
// Run: npm run build   (or npm run sync to also update the iOS project)
import { build } from "esbuild";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const web = join(here, "..");
const www = join(here, "www");
const nm = join(here, "node_modules");

rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });

// 1. The web app (sw.js is left out: service workers don't run inside the iPhone app)
const FILES = ["index.html", "styles.css", "app.js", "backend.js", "themes.js", "learn.js", "journeys.js", "native.js", "bible.js", "firebase-config.js", "manifest.webmanifest"];
for (const f of FILES) cpSync(join(web, f), join(www, f));
cpSync(join(web, "icons"), join(www, "icons"), { recursive: true });
// The whole Bible (BSB) goes inside the app, so every passage opens offline from day one
cpSync(join(web, "bible"), join(www, "bible"), { recursive: true });

// 2. Firebase, split so app, auth and firestore share one copy of the core (same file names backend.js loads from the CDN)
const fb = join(here, ".fb-entries");
mkdirSync(fb, { recursive: true });
writeFileSync(join(fb, "firebase-app.js"), 'export * from "firebase/app";\n');
writeFileSync(join(fb, "firebase-auth.js"), 'export * from "firebase/auth";\n');
writeFileSync(join(fb, "firebase-firestore.js"), 'export * from "firebase/firestore";\n');
await build({
  entryPoints: ["firebase-app.js", "firebase-auth.js", "firebase-firestore.js"].map(f => join(fb, f)),
  bundle: true, splitting: true, format: "esm", minify: true, target: "safari15",
  outdir: join(www, "vendor", "firebase"), nodePaths: [nm], logLevel: "warning", legalComments: "none"
});
rmSync(fb, { recursive: true, force: true });

// 3. Capacitor plugins as a plain script that runs before the app
const capEntry = join(here, ".cap-entry.js");
writeFileSync(capEntry, [
  'import { LocalNotifications } from "@capacitor/local-notifications";',
  'import { Share } from "@capacitor/share";',
  "window.AkouoNative = { LocalNotifications, Share };", ""
].join("\n"));
await build({ entryPoints: [capEntry], bundle: true, format: "iife", minify: true, target: "safari15", outfile: join(www, "capacitor-plugins.js"), nodePaths: [nm], logLevel: "warning" });
rmSync(capEntry, { force: true });

// 4. Fonts: only the weights the app uses, Latin and Greek letters, woff2 only
const FONTS = {
  "alegreya": ["400", "400-italic", "600", "600-italic", "700"],
  "alegreya-sans": ["400", "400-italic", "500", "700"],
  "alegreya-sans-sc": ["500", "700"]
};
const KEEP = /\/\* [a-z-]+-(latin|latin-ext|greek|greek-ext)-\d{3}(-italic|-normal)? \*\//;
let css = "/* Fonts bundled from Fontsource (SIL Open Font License). */\n";
for (const [fam, weights] of Object.entries(FONTS)) {
  const src = join(nm, "@fontsource", fam), dest = join(www, "fonts", fam);
  mkdirSync(dest, { recursive: true });
  for (const w of weights) {
    const blocks = readFileSync(join(src, `${w}.css`), "utf8").split(/(?=\/\* )/).filter(b => KEEP.test(b));
    for (let b of blocks) {
      b = b.replace(/, url\([^)]+\.woff\) format\('woff'\)/g, "");
      const m = b.match(/url\(\.\/files\/([^)]+\.woff2)\)/);
      if (!m) continue;
      cpSync(join(src, "files", m[1]), join(dest, m[1]));
      css += b.replace(`./files/${m[1]}`, `fonts/${fam}/${m[1]}`).trim() + "\n";
    }
  }
}
writeFileSync(join(www, "fonts.css"), css);

// index.html: local fonts, plugins before the app, no web-only links
let html = readFileSync(join(www, "index.html"), "utf8");
html = html
  .replace(/<link rel="preconnect"[^>]*>\n?/g, "")
  .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/, '<link rel="stylesheet" href="fonts.css">')
  .replace('<script type="module" src="app.js"></script>', '<script src="capacitor-plugins.js"></script>\n<script type="module" src="app.js"></script>');
if (!html.includes("fonts.css") || !html.includes("capacitor-plugins.js")) throw new Error("index.html did not update as expected");
writeFileSync(join(www, "index.html"), html);

for (const f of ["firebase-app.js", "firebase-auth.js", "firebase-firestore.js"])
  if (!existsSync(join(www, "vendor", "firebase", f))) throw new Error("Missing bundled " + f);
console.log("Built native/www");
