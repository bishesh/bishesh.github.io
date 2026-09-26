// Content collections: every list the site renders is loaded from src/data/*.yaml and VALIDATED here.
// A malformed entry (unknown theme, bad scope, missing year…) fails `npm run build` with the file + field,
// so a bad edit can never reach the live site silently. Entries need no `id:` — the loader assigns one.
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import fs from "node:fs";
import * as yaml from "js-yaml";

const read = (f: string) => yaml.load(fs.readFileSync(`${process.cwd()}/src/data/${f}`, "utf8")) as any;
const list = (f: string) => async () =>
  (read(f) as any[]).map((x, i) => ({
    // readable id so a schema error names the entry: "0012-fast-fetal-head-compounding"
    id: `${String(i).padStart(4, "0")}-${String(x?.title ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48).replace(/-+$/, "")}`,
    ...x,
  }));

const themeKeys = (read("themes.yaml") as { key: string }[]).map((t) => t.key) as [string, ...string[]];
const persona = z.enum(["dreamer", "scientist", "entrepreneur"]);
const dateish = z.union([z.string(), z.number()]).transform(String)
  .refine((s) => s === "" || /^\d{4}(-\d{2}(-\d{2})?)?$/.test(s), "date must be YYYY, YYYY-MM or YYYY-MM-DD");

const publications = defineCollection({
  loader: list("publications.yaml"),
  schema: z.object({
    title: z.string(),
    // a list in paper order (a legacy "A, B, C" string is split). Shortening for display is formatAuthors()'s job.
    authors: z.union([z.array(z.string()), z.string().transform((s) => s.split(/,\s*/))])
      .refine((a) => a.length === 0 || a.some((x) => x.includes("**") || /et al/.test(x)),
        "wrap your own name in double asterisks, e.g.  - \"**Khanal B**\"  (or end a truncated list with  - et al)"),
    venue: z.string().default(""),
    year: z.number().int().min(2000).max(2100),
    type: z.enum(["journal", "conference", "workshop", "preprint", "proceedings", "thesis", "other", "correction"]),
    themes: z.array(z.enum(themeKeys)).min(1),
    doi: z.string().optional(), arxiv: z.string().optional(), url: z.string().url().optional(),
    pdf: z.string().optional(), code: z.string().url().optional(),
    featured: z.boolean().optional(), hidden: z.boolean().optional(), review: z.string().optional(),
  }),
});

const talks = defineCollection({
  loader: list("talks.yaml"),
  schema: z.object({
    title: z.string(), venue: z.string().default(""), date: dateish,
    scope: z.enum(["international", "regional", "national", "local"]),
    persona,
    kind: z.enum(["keynote", "invited-talk", "panel", "podcast", "interview", "lecture", "tv"]),
    video: z.string().optional(), url: z.string().url().optional(), language: z.enum(["en", "ne"]).optional(),
    featured: z.boolean().optional(), hidden: z.boolean().optional(), review: z.union([z.string(), z.boolean()]).optional(),
  }),
});

const media = defineCollection({
  loader: list("media.yaml"),
  schema: z.object({
    title: z.string(), outlet: z.string(), date: dateish, language: z.enum(["en", "ne"]).default("en"),
    kind: z.enum(["feature", "interview", "news", "op-ed", "podcast", "tv"]), persona,
    url: z.string().url().optional(), hidden: z.boolean().optional(), review: z.string().optional(),
  }),
});

export const collections = { publications, talks, media };
