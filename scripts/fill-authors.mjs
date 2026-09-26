#!/usr/bin/env node
// Replace truncated author lists ("… et al") in src/data/publications.yaml with the full list from
// Crossref (by DOI), arXiv (by id) or OpenAlex (by title — accepted only if the title matches closely).
// Also converts every entry's `authors:` to a YAML list. Bishesh is marked **Khanal B** only when the source
// gives the given name "Bishesh"; otherwise the entry keeps a `review:` note.
//   node scripts/fill-authors.mjs            # dry run: prints what it would change
//   node scripts/fill-authors.mjs --write
import fs from "node:fs";
import * as yaml from "js-yaml";

const FILE = "src/data/publications.yaml";
const WRITE = process.argv.includes("--write");
const raw = fs.readFileSync(FILE, "utf8");
const header = raw.split("\n").filter((l) => l.startsWith("#")).join("\n");
const pubs = yaml.load(raw);

const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 2);
const sim = (a, b) => { const A = new Set(norm(a)), B = new Set(norm(b)); const i = [...A].filter((x) => B.has(x)).length; return i / Math.max(1, Math.min(A.size, B.size)); };
const ama = (given, family) => {
  const ini = String(given || "").replace(/\./g, " ").split(/[\s]+/).filter(Boolean)
    .map((g) => g.split("-").map((p) => p[0]?.toUpperCase() || "").join("")).join("");
  return `${String(family).trim()} ${ini}`.trim();
};
// "Family, Given" (OpenAlex raw names) or "Given Family"
const splitName = (full) => {
  const f = String(full).trim();
  if (f.includes(",")) { const [family, ...g] = f.split(","); return { given: g.join(" ").trim(), family: family.trim() }; }
  const p = f.split(/\s+/); return { given: p.slice(0, -1).join(" "), family: p.at(-1) };
};
const isMe = (given, family) => /^khanal$/i.test(family) && /^bishesh/i.test(String(given).trim());
const get = async (url, as = "json") => {
  const r = await fetch(url, { headers: { "User-Agent": "bishesh.github.io author-fill (personal site build)" } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return as === "json" ? r.json() : r.text();
};

async function fromCrossref(doi) {
  const j = await get(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
  const w = j.message;
  return { title: w.title?.[0] || "", authors: (w.author || []).map((a) => ({ given: a.given || "", family: a.family || a.name || "" })), src: `crossref:${doi}` };
}
// Europe PMC keeps group authors ("X Consortium") and the consortium's member list.
async function fromEuropePMC(doi) {
  const j = await get(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%22${encodeURIComponent(doi)}%22&resultType=core&format=json`);
  const r = j.resultList?.result?.[0];
  if (!r?.authorList?.author?.length) return null;
  const inConsortium = (r.investigatorList?.investigator || []).some((i) => isMe(i.firstName || "", i.lastName || ""));
  const authors = r.authorList.author.map((a) => a.collectiveName
    ? { collective: a.collectiveName + (inConsortium ? " (incl. **Khanal B**)" : "") }
    : { given: a.firstName || "", family: a.lastName || a.fullName || "" });
  return { title: r.title || "", authors, src: `europepmc:${doi}` };
}
async function fromArxiv(id) {
  const x = await get(`https://export.arxiv.org/api/query?id_list=${id}`, "text");
  const entry = x.split("<entry>")[1] || "";
  const title = (entry.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.replace(/\s+/g, " ").trim() || "";
  const names = [...entry.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((m) => splitName(m[1]));
  return { title, authors: names, src: `arxiv:${id}` };
}
async function fromOpenAlex(title) {
  const j = await get(`https://api.openalex.org/works?search=${encodeURIComponent(title)}&per-page=5`);
  let best = null;
  for (const w of j.results || []) { const s = sim(title, w.title || ""); if (!best || s > best.s) best = { s, w }; }
  if (!best || best.s < 0.85) return null;
  if (best.w.is_authors_truncated) return null;
  return { title: best.w.title, authors: best.w.authorships.map((a) => splitName(a.raw_author_name || a.author?.display_name || "")), src: `openalex:${best.w.id.split("/").pop()}` };
}

const report = [];
for (const p of pubs) {
  // normalise existing string → list
  let list = Array.isArray(p.authors) ? p.authors : String(p.authors || "").split(/,\s*/).filter(Boolean);
  const truncated = list.some((a) => /^(et al|others|and others)$/i.test(a.trim()));
  if (!truncated) { p.authors = list; continue; }
  let got = null, why = "";
  for (const attempt of [
    () => (p.doi ? fromEuropePMC(p.doi) : null),
    () => (p.doi ? fromCrossref(p.doi) : null),
    () => (p.arxiv ? fromArxiv(p.arxiv) : null),
    () => fromOpenAlex(p.title),
  ]) {
    try {
      const r = await attempt();
      if (r && r.authors.length && sim(p.title, r.title) >= 0.85) { got = r; break; }
      if (r) why = `title mismatch at ${r.src} ("${r.title.slice(0, 50)}")`;
    } catch (e) { why = e.message.slice(0, 80); }
  }
  if (!got) { p.authors = list; report.push(`✗ ${p.year} ${p.title.slice(0, 60)} — ${why || "no source"}`); continue; }
  const full = got.authors.map((a) => a.collective ?? (isMe(a.given, a.family) ? `**${ama(a.given, a.family)}**` : ama(a.given, a.family)));
  const marked = full.some((a) => a.includes("**"));
  const partial = got.authors.filter((a) => !a.collective && !a.given).map((a) => a.family);
  const oldKnown = list.filter((a) => !/et al/i.test(a)).length;
  report.push(`${marked ? "✓" : "?"} ${p.year} ${p.title.slice(0, 55)} — ${oldKnown}+et al → ${full.length} authors (${got.src})${marked ? "" : " — Bishesh NOT identified"}`);
  p.authors = full;
  p.authors_source = got.src;
  const notes = String(p.review || "").split("; ").filter((n) => n && !/verify authors|Bishesh not found/i.test(n));
  if (!marked) notes.push("full author list fetched but Bishesh not identified by given name — mark **Khanal B** by hand");
  if (partial.length) notes.push(`source gives incomplete name(s): ${partial.join(", ")} — fix from the paper`);
  if (full.length <= oldKnown) notes.push("source list is no longer than the old one — check it is complete");
  if (notes.length) p.review = notes.join("; "); else delete p.review;
}
console.log(report.join("\n"));
if (WRITE) {
  fs.writeFileSync(FILE, header + "\n\n" + yaml.dump(pubs, { lineWidth: 140, noRefs: true, flowLevel: -1 }));
  console.log(`\nwrote ${FILE}`);
} else console.log("\n(dry run — pass --write to save)");
