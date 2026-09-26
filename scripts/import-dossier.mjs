#!/usr/bin/env node
// One-time (re-runnable) import of the cortex dossier's markdown lists into this site's YAML data.
//   node scripts/import-dossier.mjs [path/to/cortex/dossier]
// After the first import the YAML files in src/_data/ are the source of truth for the site;
// re-running overwrites publications.yaml and talks.yaml, so only do it before hand-editing them.
// Themes, talk scope and talk persona are KEYWORD GUESSES and are marked `review: true`.
import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";

const dossier = process.argv[2] || path.resolve("../cortex/dossier");
const out = path.resolve("src/_data");

// ---------- publications ----------
const THEME_RULES = [
  ["reorganizing-work", /workforce|capability|pyramid|skilling/i],
  ["trustworthy-ai-policy", /trustworth|FUTURE-AI|equitable|just,|socio-economic|leapfrog|ethic|generative AI technologies|epilepsy/i],
  ["low-resource-language", /Nepali|Devanagari|tweets|hate speech|language model/i],
  ["ultrasound", /ultrasound|fetal|placenta|sonograph|head circumference|gestational|landmark localisation/i],
  ["frugal-diagnostics", /cervical|Giardia|Cryptosporidium|smartphone|paper analytical|colorimetric|telehealth|ECG|pulmonary hypertension/i],
  ["xray-3d", /X-ray|Cobb|spinal|biplanar|COVID-19 detection|3-D reconstruction|3D bone/i],
  ["foundation-models", /vision-language|VLSM|prompt tuning|transfer learning|parameter-efficient|adapter|transformers|self-supervised pretraining/i],
  ["robust-learning", /label noise|noisy labels|active learning|FixMatch|semi-supervised|uncertainty|Improving medical image classification|weakly supervised|geometry aware|conditional generative/i],
  ["modelling-simulation", /Alzheimer|atrophy|biophysical|brain MRI|Riemannian|mesh|spectral|curvature|pose|canonical|registration|shape|graphs|geometric|control strategies/i],
  ["imaging-methods", /segmentation|echocardiograph|polyp|brain tumor|reconstruction/i],
  ["community", /Workshop, ASMUS|International Workshop|DeCaF|DART 20|Simplifying medical ultrasound/i],
  ["early-vision", /skin detection|road signs|robot/i],
];
// Shown under "Selected work" on the Scientist page. Title substrings.
const FEATURED = ["The AI pyramid", "FUTURE-AI: international", "Transforming healthcare through just", "Automated quality assessment of blind sweep",
  "Benchmarking encoder-decoder architectures", "VLSM-adapter", "Standard plane detection in 3D fetal ultrasound using an iterative", "A biophysical model of brain deformation"];
function themesFor(text) {
  const t = THEME_RULES.filter(([, re]) => re.test(text)).map(([k]) => k);
  return t.length ? t.slice(0, 2) : ["other"];
}
// Bold Bishesh. With 2+ "Khanal B" the LAST is Bishesh (Bidur is first/earlier); with 1, it is him.
// This is a guess — every paper with two Khanal B is marked review.
function markMe(authors) {
  const parts = authors.split(/,\s*/);
  const idx = parts.map((p, i) => (/^Khanal B$/.test(p.trim()) ? i : -1)).filter((i) => i >= 0);
  if (!idx.length) return { authors, ambiguous: false, found: false };
  const me = idx[idx.length - 1];
  parts[me] = `**${parts[me].trim()}**`;
  return { authors: parts.join(", "), ambiguous: idx.length > 1, found: true };
}
function parsePubs(md) {
  const pubs = [];
  let year = null;
  for (const line of md.split("\n")) {
    const y = line.match(/^## (\d{4})/);
    if (y) { year = +y[1]; continue; }
    if (/^## 2009/.test(line)) { year = 2009; continue; }
    if (!year || !line.startsWith("- ")) continue;
    let s = line.slice(2);
    const type = (s.match(/\[(journal|conference|workshop|preprint|proceedings|thesis|other|correction)\]/) || [])[1] || "other";
    const verify = /\*\(.*verify.*\)\*/i.test(s);
    s = s.replace(/\s*\*\(.*?\)\*\s*$/, "").replace(/\s*\[(journal|conference|workshop|preprint|proceedings|thesis|other|correction)\]\s*/, " ").trim();
    const doi = (s.match(/doi:(\S+?)\.?(\s|$)/) || [])[1];
    const arxiv = (s.match(/arXiv(?: preprint)?:? ?(?:arXiv:)?(\d{4}\.\d{4,5})/) || [])[1];
    const code = (s.match(/Code: (https?:\/\/\S+?)\.?(\s|$)/) || [])[1];
    // "Authors. Title. Venue..." — authors end at the first ". " followed by a capital that isn't an initial
    const m = s.match(/^(.+?(?:et al|[A-Z]{1,3}|[a-zé]{2,}))\. (.+?[.?!]) (.+)$/);
    let authors = "", title = s, venue = "";
    if (m) { authors = m[1]; title = m[2].replace(/\.$/, ""); venue = m[3]; }
    venue = venue.replace(/\s*doi:\S+/, "").replace(/\s*Code: \S+/, "").replace(/\s*arXiv:\d{4}\.\d{4,5}\.?/, "").replace(/\.\s*$/, "").replace(/^In: /, "").replace(new RegExp(`[;.]\\s*${year}$`), "").replace(/^(.*?)\.\s*(\d{4});/, "$1, $2;").trim();
    const me = markMe(authors);
    const entry = {
      title, authors: me.authors, venue, year, type,
      themes: themesFor(`${title} ${venue}`),
    };
    if (FEATURED.some((f) => title.startsWith(f))) entry.featured = true;
    if (doi) entry.doi = doi.replace(/\.$/, "");
    if (arxiv) entry.arxiv = arxiv;
    if (code) entry.code = code;
    if (type === "correction" || /project proposal/i.test(venue)) entry.hidden = true;
    const review = [];
    if (verify) review.push("dossier says: verify authors/link");
    if (me.ambiguous) review.push("two 'Khanal B' — check which is Bishesh");
    if (!me.found && authors) review.push("Bishesh not found in author list");
    if (review.length) entry.review = review.join("; ");
    pubs.push(entry);
  }
  return pubs;
}

// ---------- talks ----------
const ABROAD = /\b(UK|Switzerland|Spain|Germany|Bulgaria|India|Canada|France|CERN|Cambridge|Imperial College|York|ETH Zurich|INSAIT|Munich|Barcelona|FCDO|PHC Global|Pune|Punjab)\b/;
const NATIONAL = /Govt|Government|Ministry|National|NAST|NHRC|FNCCI|UNFPA|UNICEF|UN House|Save The Children|Society of|Conference|Conf\.|ANAIS|HAICon|Symposium|Digital Health|NRN|Radisson|Hyatt|Marriott|Paropakar|AI for Prosperous/i;
function scopeFor(t) {
  if (ABROAD.test(t)) return /India|Pune|Punjab/i.test(t) ? "regional" : "international";
  if (NATIONAL.test(t)) return "national";
  return "local";
}
function personaFor(t) {
  if (/start-?up|incubat|Innovation and Leadership|entrepreneur/i.test(t)) return "entrepreneur";
  if (/NAAMII|Centers? of Excellence|Centre of Excellence|Ecosystem|Our Dream|Research Outside|Possible in|Global South|ANAIS|Winter School|Young Scientists|Children|Gender/i.test(t)) return "dreamer";
  return "scientist";
}
const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
function parseTalks(md) {
  const talks = [];
  const section = md.split("## Invited talks")[1] || "";
  let year = null;
  for (const line of section.split("\n")) {
    const y = line.match(/^### (\d{4})/);
    if (y) { year = +y[1]; continue; }
    if (!year || !line.startsWith("- ")) continue;
    const m = line.match(/^- \*(.+?)\* — (.+)$/);
    if (!m) continue;
    const title = m[1];
    const parts = m[2].split(" — ");
    let dateStr = parts.length > 1 ? parts.pop() : "";
    const venue = parts.join(" — ");
    const dm = dateStr.match(/(\d{1,2})?\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/);
    let date = String(year);
    if (dm) date = `${year}-${String(MONTHS[dm[2]]).padStart(2, "0")}${dm[1] ? "-" + dm[1].padStart(2, "0") : ""}`;
    else if (dateStr) { // no date split — the tail was part of the venue
      talks.push({ title, venue: `${venue} — ${dateStr}`.replace(/^ — /, ""), date, scope: scopeFor(line), persona: personaFor(line), kind: "invited-talk", review: true });
      continue;
    }
    talks.push({ title, venue, date, scope: scopeFor(line), persona: personaFor(title + " " + venue), kind: "invited-talk", review: true });
  }
  return talks;
}

const pubs = parsePubs(fs.readFileSync(path.join(dossier, "publications.md"), "utf8"));
const talks = parseTalks(fs.readFileSync(path.join(dossier, "talks-media.md"), "utf8"));
const header = (what) =>
  `# ${what} — the site renders this file directly. Edit here (GitHub web editor is fine).\n` +
  `# Imported from cortex/dossier by scripts/import-dossier.mjs on ${new Date().toISOString().slice(0, 10)}.\n` +
  `# \`review:\` marks a keyword guess or a dossier "verify" note — delete it once checked.\n`;
fs.writeFileSync(path.join(out, "publications.yaml"),
  header("Publications") + "# Bishesh is written **Khanal B** (bold). Themes: see themes.yaml. Types: journal · conference · workshop · preprint · proceedings · thesis · other.\n\n" +
  yaml.dump(pubs, { lineWidth: 120, noRefs: true }));
fs.writeFileSync(path.join(out, "talks.yaml"),
  header("Talks") + "# scope: international | regional | national | local  ·  persona: dreamer | scientist | entrepreneur\n# kind: keynote | invited-talk | panel | podcast | interview | lecture | tv  ·  video: YouTube id or URL  ·  featured: true pins to the top of its tier\n\n" +
  yaml.dump(talks, { lineWidth: 120, noRefs: true }));
const count = (xs, k) => xs.reduce((a, x) => ((a[x[k]] = (a[x[k]] || 0) + 1), a), {});
console.log(`publications: ${pubs.length}`, count(pubs, "type"));
console.log("themes:", pubs.flatMap((p) => p.themes).reduce((a, t) => ((a[t] = (a[t] || 0) + 1), a), {}));
console.log("needs review:", pubs.filter((p) => p.review).length);
console.log(`talks: ${talks.length}`, count(talks, "scope"), count(talks, "persona"));
