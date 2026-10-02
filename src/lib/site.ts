// Shared helpers: page copy (single YAML objects), formatting, and visible-entry queries.
import fs from "node:fs";
import * as yaml from "js-yaml";
import { marked } from "marked";
import { getCollection } from "astro:content";

export const copy = <T = any>(name: string): T =>
  yaml.load(fs.readFileSync(`${process.cwd()}/src/data/${name}.yaml`, "utf8")) as T;

// Read on every access, not once at import: the dev server caches this module, and a constant would keep
// serving the YAML as it was when the server started.
export const getSite = () => copy("site");
export const getThemes = () => copy<{ key: string; label: string; blurb: string }[]>("themes");

export const md = (s?: string) => (s ? (marked.parse(String(s), { async: false }) as string) : "");
export const mdInline = (s?: string) => (s ? (marked.parseInline(String(s), { async: false }) as string) : "");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fuzzyDate = (d?: string | number) => {
  if (!d) return "";
  const [y, m, day] = String(d).split("-");
  return [day ? +day : null, m ? MONTHS[+m - 1] : null, y].filter(Boolean).join(" ");
};
export const youtubeId = (v?: string) => {
  if (!v) return "";
  const m = String(v).match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1] : /^[\w-]{11}$/.test(v) ? v : "";
};
export const pubLink = (p: any) =>
  p.url || (p.doi ? `https://doi.org/${p.doi}` : p.arxiv ? `https://arxiv.org/abs/${p.arxiv}` : "");

// featured, then items with a video, then newest
const rank = (x: any) => (x.featured ? 2 : 0) + (x.video ? 1 : 0);
export const featuredFirst = <T extends Record<string, any>>(xs: T[], k = "date") =>
  [...xs].sort((a, b) => rank(b) - rank(a) || String(b[k]).localeCompare(String(a[k])));

const visible = async (name: "publications" | "talks" | "media") =>
  (await getCollection(name)).map((e) => e.data as any).filter((x) => !x.hidden);
export const getPubs = () => visible("publications");
export const getTalks = () => visible("talks");
export const getMedia = () => visible("media");

export const groupBy = <T>(xs: T[], key: (x: T) => string) => {
  const g = new Map<string, T[]>();
  for (const x of xs) { const k = key(x); if (!g.has(k)) g.set(k, []); g.get(k)!.push(x); }
  return [...g.entries()];
};
export const getNav = () => getSite().nav as { label: string; url: string; persona: string }[];

// Author display rule (his, 2026-09-26): ≤20 authors → all of them. >20 → the first 20, then HIS name
// wherever it falls, then the LAST author — with "…" marking every gap. So a reader always sees
// whether he is the last author. The data always keeps the full list; this only shortens the view.
export const MAX_AUTHORS = 20;
export const formatAuthors = (authors: string[], max = MAX_AUTHORS) => {
  const n = authors.length;
  if (n <= max) return authors.map(mdInline).join(", ");
  const me = authors.findIndex((a) => a.includes("**"));
  const show = new Set<number>([...Array(max).keys(), n - 1]);
  if (me >= 0) show.add(me);
  const idx = [...show].sort((a, b) => a - b);
  const out: string[] = [];
  idx.forEach((i, k) => { if (k > 0 && i - idx[k - 1] > 1) out.push("…"); out.push(mdInline(authors[i])); });
  return out.join(", ");
};

// Talks & media, as one list. Talks (talks.yaml) and press (media.yaml) are normalised to one shape so the
// "Talks & media" page can slice them along independent dimensions: format (the tab), kind (keynote, feature…),
// persona, reach (scope: the section) and, for podcasts and interviews, his role (host / guest).
export const FORMATS = [
  { key: "talks", label: "Talks", kinds: ["keynote", "invited-talk", "lecture"] },
  { key: "panels", label: "Panels", kinds: ["panel"] },
  { key: "podcasts", label: "Podcasts", kinds: ["podcast"] },
  { key: "video", label: "Video & TV", kinds: ["interview", "tv"] },
  { key: "articles", label: "Articles", kinds: ["interview", "feature", "news", "op-ed"] },
] as const;
export const KIND_LABEL: Record<string, string> = {
  keynote: "Keynote", "invited-talk": "Invited talk", lecture: "Lecture", panel: "Panel", podcast: "Podcast",
  interview: "Interview", tv: "TV", feature: "Feature", news: "News", "op-ed": "Op-ed",
};
export type Person = { name: string; role: "host" | "co-host" | "guest" | "moderator" | "panelist"; affiliation?: string; url?: string };
// the people on an appearance, grouped by role in a fixed order, with display labels
export const peopleByRole = (people: Person[]) =>
  ([["host", "Host"], ["co-host", "Co-host"], ["moderator", "Moderator"], ["panelist", "Co-panelist"], ["guest", "Guest"]] as const)
    .map(([r, label]) => ({ ps: people.filter((p) => p.role === r), label }))
    .filter((g) => g.ps.length)
    .map((g) => ({ ...g, label: g.label + (g.ps.length > 1 ? "s" : "") }));
export type Appearance = {
  format: string; kind: string; title: string; outlet: string; date: string; language?: string; scope: string;
  persona: string; role?: string; people: Person[]; href: string; thumb: string; action: string; featured?: boolean;
};
export const getAppearances = async (): Promise<Appearance[]> => {
  const yt = (id: string) => ({ href: `https://www.youtube.com/watch?v=${id}`, thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` });
  const talks = (await getTalks()).map((t) => {
    const id = youtubeId(t.video);
    return {
      format: { panel: "panels", podcast: "podcasts", interview: "video", tv: "video" }[t.kind as string] ?? "talks",
      kind: t.kind, title: t.title, outlet: t.venue, date: t.date, language: t.language, scope: t.scope,
      persona: t.persona, role: t.role, people: t.people ?? [], featured: t.featured,
      ...(id ? yt(id) : { href: t.url || "", thumb: t.image || "" }),
      action: id ? "Watch" : "",
    };
  });
  const press = (await getMedia()).map((m) => {
    const id = youtubeId(m.video);
    const format = id || m.kind === "tv" ? "video" : m.kind === "podcast" ? "podcasts" : "articles";
    return {
      format, kind: m.kind, title: m.title, outlet: m.outlet, date: m.date, language: m.language, scope: m.scope,
      persona: m.persona, role: m.role, people: m.people ?? [],
      ...(id ? yt(id) : { href: m.url || "", thumb: m.image || "" }),
      action: id ? "Watch" : format === "podcasts" ? "Listen" : "",
    };
  });
  return [...talks, ...press];
};
