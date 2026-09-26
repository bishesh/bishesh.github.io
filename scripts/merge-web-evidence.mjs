#!/usr/bin/env node
// One-off: merge web-verified videos + media (from a research pass, each YouTube id re-checked via oEmbed)
// into src/_data/talks.yaml and media.yaml.  node scripts/merge-web-evidence.mjs <dir with talks-video.yaml, media.yaml>
import fs from "node:fs"; import path from "node:path"; import * as yaml from "js-yaml";
const dir = process.argv[2];
const vids = yaml.load(fs.readFileSync(path.join(dir, "talks-video.yaml"), "utf8"));
const webMedia = yaml.load(fs.readFileSync(path.join(dir, "media.yaml"), "utf8"));
const talksPath = "src/_data/talks.yaml", mediaPath = "src/_data/media.yaml";
const header = fs.readFileSync(talksPath, "utf8").split("\n").filter((l) => l.startsWith("#")).join("\n");
const talks = yaml.load(fs.readFileSync(talksPath, "utf8"));
const byId = Object.fromEntries(vids.filter((v) => v.youtube_id).map((v) => [v.youtube_id, v]));

// 1. videos that ARE an existing dossier talk → attach
const ATTACH = [
  [/Can AI democratize healthcare/, "R0_fRAOK4rc"],
  [/Research Outside Universities/, "74veiKa_Ph0"],
  [/Python Ecosystem/, "sYPJZYr38wI"],
  [/Third Nepal Winter School/, "UUKaaC2w2dE"],
  [/Low Resource and Trustworthy AI/, "uBFT5rrVR8I"],
];
for (const [re, id] of ATTACH) {
  const t = talks.find((x) => re.test(x.title));
  if (t) { t.video = id; t.featured = true; } else console.warn("no dossier talk for", id);
}
// 2. new talks from video (persona / scope / kind decided here; the research pass's own labels are hints)
const ADD = {
  "6DQ6KRylKr0": { persona: "scientist", scope: "national", kind: "podcast", title: "Dialogues in Health AI, Ep. 1 — How AI will reshape healthcare, health systems & the workforce", note: "co-host" },
  "FHtRwAheq20": { persona: "scientist", scope: "national", kind: "keynote", title: "AI in Radiology — RADCON 2026" },
  "brOBWWbOuB0": { persona: "entrepreneur", scope: "national", kind: "panel", title: "AI-driven innovation: from Nepal to the global startup ecosystem" },
  "mhoyfb4SMVo": { persona: "dreamer", scope: "international", kind: "panel", title: "UN Open Science and Open Scholarship Conference 2025 — panel", featured: true },
  "k53ZafbWYPo": { persona: "dreamer", scope: "national", kind: "tv", title: "Prime Sambad — conversation with AI scientist Dr. Bishesh Khanal", language: "ne" },
  "mrmcbpNgWPI": { persona: "dreamer", scope: "national", kind: "interview", title: "Professional Excellence, ICT Award 2024" },
  "I2b453jqDbg": { persona: "dreamer", scope: "national", kind: "interview", title: "“They come from the US and UK to study AI in Nepal” — Himal Khabar", language: "ne" },
  "4AKSsXTNKs4": { persona: "scientist", scope: "national", kind: "podcast", title: "AI, ChatGPT & machine learning — Sushant Pradhan Podcast, Ep. 115", language: "ne" },
  "IrVEic_Kv8Y": { persona: "entrepreneur", scope: "local", kind: "interview", title: "Diyo.ai — Bishesh Khanal" },
  "W17N5ofHk5k": { persona: "scientist", scope: "local", kind: "panel", title: "Panel discussion on AI — Tech and Trendy" },
  "2_IbrP863lA": { persona: "dreamer", scope: "national", kind: "podcast", title: "Let's Get Real with Bishesh Khanal — The Doers Podcast, EP110", language: "ne" },
  "jqaWEtnUrC4": { persona: "dreamer", scope: "local", kind: "invited-talk", title: "Applications of AI and research at NAAMII — SACS CDCSIT" },
  "e8GAdk5IxzI": { persona: "scientist", scope: "national", kind: "invited-talk", title: "Artificial intelligence as an emerging technology — Provincial Youth Scientist Conference" },
  "4n0BRbyBjBg": { persona: "scientist", scope: "national", kind: "panel", title: "Can AI redefine art? — Nepal Literature Festival" },
  "LL12vtkSdzA": { persona: "scientist", scope: "national", kind: "panel", title: "Integrated AI: demand, challenges and solutions — AI Expo Nepal 2019, plenary" },
  "5hwjExAZGRs": { persona: "scientist", scope: "national", kind: "lecture", title: "Introduction to AI; linear algebra for computer vision — First Nepal Winter School in AI", date: "2018-12" },
  "nDsqFgwJuG8": { persona: "scientist", scope: "national", kind: "lecture", title: "Image representation, processing and feature extraction — First Nepal Winter School in AI", date: "2018-12" },
  "D8I15_KsOII": { persona: "scientist", scope: "national", kind: "lecture", title: "Medical imaging informatics (with Taman Upadhaya) — First Nepal Winter School in AI", date: "2018-12" },
  "Os9mYQ3kguU": { persona: "dreamer", scope: "national", kind: "tv", title: "With Binod Bhattarai on NAAMII and the first AI winter school — The Connection, Palika TV", language: "ne" },
  "drpNQsBZe3g": { persona: "dreamer", scope: "national", kind: "interview", title: "From curiosity to discovery: the journey of Dr. Bishesh Khanal — ICT Samachar", review: "research pass could not confirm; check it is you" },
};
// Deliberately NOT added: Sushant Pradhan clips (WUXraNn03jQ L56vPFfJ5N8 gi7A18piIpE tHBwJ4Nr9mQ), duplicate Doers uploads
// (rM4RY_YSqgo YqLlbfX3-Ik 502zqv-flAM), EPTV part B (6GlnA0xUcXQ), unconfirmed: N-h5nBPWk8I (CTO Retreat — possible namesake),
// CVbRM5earhQ (2018 inauguration — unclear he speaks).
for (const [id, o] of Object.entries(ADD)) {
  const v = byId[id]; if (!v) { console.warn("missing", id); continue; }
  const venue = [v.venue, v.city].filter(Boolean).join(", ").replace(/\s*\(.*?channel.*?\)/i, "");
  talks.push({ title: o.title, venue, date: String(o.date || v.date || ""), scope: o.scope, persona: o.persona, kind: o.kind,
    video: id, ...(o.featured ? { featured: true } : {}), ...(o.language || v.language === "ne" ? { language: o.language || "ne" } : {}),
    ...(o.review ? { review: o.review } : {}) });
}
talks.sort((a, b) => String(b.date).localeCompare(String(a.date)));
fs.writeFileSync(talksPath, header + "\n\n" + yaml.dump(talks, { lineWidth: 120, noRefs: true }));

// 3. media: web-verified list replaces the seed; seeds that turned out to be VIDEOS are now talks.
const personaOf = (m) => /NAAMII|School|Award|UNESCO|ecosystem|King's College|DOECE|intelligence$/i.test(m.title) ? "dreamer" : /Robot|startup|Diyo|Tangible/i.test(m.title) ? "entrepreneur" : "scientist";
const media = webMedia.map((m) => ({ title: m.title, outlet: m.outlet, date: String(m.date || ""), language: m.language || "en", kind: m.kind,
  persona: m.persona || personaOf(m), ...(m.url ? { url: m.url } : {}),
  ...(m.verified ? {} : { review: m.note || "not verified by the research pass", hidden: !m.url }) }));
fs.writeFileSync(mediaPath, "# Media coverage. kind: feature | interview | news | op-ed | podcast | tv · language: en | ne · persona colours the card.\n" +
  "# Merged from a web research pass 2026-09-26 (each page fetched, name confirmed). `review:` = unverified; `hidden: true` keeps it off the page.\n\n" +
  yaml.dump(media, { lineWidth: 120, noRefs: true }));
console.log("talks", talks.length, "with video", talks.filter((t) => t.video).length, "· media", media.length, "shown", media.filter((m) => !m.hidden).length);
