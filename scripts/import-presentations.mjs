#!/usr/bin/env node
// Bring talks from the presentations repo into src/data/talks.yaml.
//   node scripts/import-presentations.mjs [path/to/presentations/talks.yaml] [--check]
// From the RISE-MICCAI keynote (30 Sep 2026) on, ../presentations is the source of truth for talks: each
// talk's context.md carries a `public:` list, and that repo derives talks.yaml from them in this site's
// talk fields, plus `source:` (the talk folder). This script replaces every entry here that has a
// `source:`, or the same date and title as an incoming one, with the incoming version, and inserts new ones
// by date. Entries without a `source:` (older talks) are never touched, and nor is the file's formatting
// outside the entries it replaces. Fix a managed talk in ../presentations, not here: a re-run overwrites it.
// --check exits 1 if talks.yaml is behind presentations, without writing.
import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";

const args = process.argv.slice(2);
const check = args.includes("--check");
const src = path.resolve(args.find((a) => !a.startsWith("--")) || "../presentations/talks.yaml");
const dst = path.resolve("src/data/talks.yaml");

const incoming = yaml.load(fs.readFileSync(src, "utf8")) || [];
const text = fs.readFileSync(dst, "utf8");

// Split the file into its header (comments before the first entry) and one text block per top-level entry,
// so untouched entries keep their exact formatting.
const lines = text.split("\n");
const first = lines.findIndex((l) => l.startsWith("- "));
const header = lines.slice(0, first).join("\n");
const blocks = [];
for (const l of lines.slice(first)) {
  if (l.startsWith("- ") || !blocks.length) blocks.push([l]);
  else blocks[blocks.length - 1].push(l);
}
const entries = blocks.map((b) => {
  const body = b.join("\n").replace(/\n+$/, "");
  return { body, data: yaml.load(body)[0] };
});

const key = (e) => `${e.date}|${e.title}`;
const incomingKeys = new Set(incoming.map(key));
const managed = (d) => d.source || incomingKeys.has(key(d));
const dump = (e) => yaml.dump([e], { lineWidth: -1, noRefs: true, quotingType: "'" }).replace(/\n+$/, "");

// keep every unmanaged entry in place; drop the managed ones and re-insert the incoming set by date
// (newest first, as the file is ordered; a talk keeps its order relative to its panel on the same day)
const kept = entries.filter((e) => !managed(e.data));
const out = [...kept];
for (const e of incoming) {   // incoming is newest first: each goes before the first older entry
  const i = out.findIndex((x) => String(x.data?.date ?? "") < String(e.date));
  const block = { body: dump(e), data: e };
  if (i === -1) out.push(block);
  else out.splice(i, 0, block);
}
const result = [header, ...out.map((e) => e.body)].join("\n") + "\n";

const removed = entries.length - kept.length;
if (check) {
  if (result !== text) { console.error("src/data/talks.yaml is behind ../presentations/talks.yaml: run npm run import:talks"); process.exit(1); }
  console.log("talks.yaml is up to date with presentations");
} else {
  fs.writeFileSync(dst, result);
  console.log(`talks.yaml: ${incoming.length} talks from presentations (replaced ${removed}), ${kept.length} others untouched`);
}
