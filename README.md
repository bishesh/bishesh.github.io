# bishesh.github.io

Personal website of Bishesh Khanal — **Dreamer · Scientist · Entrepreneur**.
A static site built with [Astro](https://astro.build), served on GitHub Pages. All content is YAML in `src/data/`.

## Run locally

```sh
npm install
npm run dev          # http://localhost:8080, live-reloads on save (Astro 7 detaches it; `npx astro dev stop` ends it)
npm run build        # builds dist/ AND validates every data entry
```

## Updating content (the GitHub web editor is enough)

| To add… | Edit | Notes |
|---|---|---|
| a paper | `src/data/publications.yaml` | Copy an entry. List **every** author in order, with yourself as `**Khanal B**`; lists over 20 are shortened on the page automatically, keeping your name and the last author. `node scripts/fill-authors.mjs` replaces any `et al` list with the full one from Crossref, Europe PMC or arXiv. `themes:` keys must exist in `themes.yaml`. `featured: true` puts it on the Scientist page. `hidden: true` keeps it off the site. |
| a talk / panel / podcast / TV interview | `src/data/talks.yaml` | `scope:` international (venue or audience outside Nepal, plus ANAIS and HAICon) · national picks the section. `kind:` picks the tab (talks, panels, podcasts, video & TV). `video:` takes a YouTube id or URL, and the thumbnail follows; otherwise `image:` (a file in `public/assets/img/talks/`). `persona:` sets the dot colour. `role:` and `people:` (name, role, affiliation, profile `url`) list hosts, guests, moderators and co-panelists. |
| press | `src/data/media.yaml` | Shows under the *Articles* tab of Talks & media. `scope:` international · national, `image:` a preview picture in `public/assets/img/media/`. |
| a service or policy role | `src/data/service.yaml` | One list per section (policy, organizing, committees, review, community); `when` is free text. |
| page text | `src/data/{home,dreamer,scientist,entrepreneur,cv}.yaml` | Markdown is allowed in `lead`, `story` and `text`. |

**Every list is schema-checked** (`src/content.config.ts`). A typo such as `themes: [ultrasuond]`, an unknown
`scope`, or a missing `year` fails the build with the entry and field named, and the list of allowed values. On a
branch, the *Check site* action shows it red. On `master`, the deploy stops and the live site stays as it was.

`review:` marks a keyword guess or an unverified item. Check it, then delete the field; the page ignores it either way.

## Design

The visual contract is `.claude/skills/site-design/SKILL.md`: the "Three Houses" palette, where crimson, indigo and ember
are quiet echoes of NAAMII, Tangible and Terahs, plus typography and components. A page picks its persona with
`<Base persona="…">`, and that is all it does to change colour.

## Going live

The site is built on the `redesign` branch. `master` still holds the old Nikola site, and Pages serves it
(legacy "deploy from branch"). To switch over:
1. Repo Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. Merge `redesign` into `master`. `.github/workflows/deploy.yml` builds, validates and publishes.
