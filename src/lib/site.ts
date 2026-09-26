// Shared helpers: page copy (single YAML objects), formatting, and visible-entry queries.
import fs from "node:fs";
import * as yaml from "js-yaml";
import { marked } from "marked";
import { getCollection } from "astro:content";

export const copy = <T = any>(name: string): T =>
  yaml.load(fs.readFileSync(`${process.cwd()}/src/data/${name}.yaml`, "utf8")) as T;

export const site = copy("site");
export const themes = copy<{ key: string; label: string; blurb: string }[]>("themes");

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
export const nav = site.nav as { label: string; url: string; persona: string }[];
