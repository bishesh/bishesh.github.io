---
name: site-design
description: The visual contract for bishesh.github.io — the "Himalayan Light" palette, the three-persona accent system (Dreamer · Scientist · Entrepreneur), typography, spacing, components and the rules for adding a page or section. Load before adding or restyling ANY page, section, component or colour on this site, and before adding content types (talks, publications, media) so they render through the existing components.
---

# site-design — the visual contract

The site presents one person through **three personas**. The design's job is to make the reader
*feel* which persona they are in without ever shouting it. **Persona is an accent, never a theme**:
the page, type, spacing and components are identical everywhere; only a small set of accent
tokens changes.

## 1. The palette — "Three Houses"

Each accent is a **quiet echo** of an organisation he built, never a copy of its brand. The echo is a
shifted hue, a lower saturation, or a darker value, so no page ever reads as NAAMII-, Tangible- or
Terahs-branded:

| Token family | Persona | Echo of | 700 (text) | 500 (marks) | 100 (tint) | Dark 700/500 |
|---|---|---|---|---|---|---|
| `--crimson-*` | **Dreamer** | NAAMII's Pure Red `#db0505`, softened into rhododendron crimson (Nepal's national flower) | `#A31D33` | `#D63A4E` | `#FCEBEE` | `#F28796` / `#F07A8A` |
| `--indigo-*` | **Scientist** | Tangible's deep navy + periwinkle, and NAAMII's blue-grey | `#2F3F9E` | `#5268D8` | `#ECEFFC` | `#A3B1F4` / `#8C9DF0` |
| `--ember-*` | **Entrepreneur** | the orange Tangible (`#ff5a10`) and Terahs share, burnt down | `#B4460F` | `#EC6A2A` | `#FEEFE6` | `#F7A673` / `#F59A62` |

Neutrals are **cool, not beige**:

| Token | Light | Dark | Note |
|---|---|---|---|
| `--paper` | `#F8F9FC` | `#0E1120` | dark = Terahs' dusk aubergine-navy |
| `--surface` | `#FFFFFF` | `#161A2C` | cards |
| `--ink` | `#121829` | `#ECEEF5` | deep navy ink (after Tangible's `#10192b`) |
| `--ink-soft` | `#454D59` | `#B5BACB` | NAAMII's Dark Blue Grey, used verbatim |
| `--muted` | `#737A8C` | `#878DA2` | metadata only |
| `--line` | `#E3E6EE` | `#262B41` | hairlines |

Rules:
1. **Accents are for marks, not fields.** A persona colour may appear as: the 3px top rule, the
   eyebrow, link underlines, chips/dots, a card's edge, icons, and a *100-tint* background on at most
   one callout per section. Never a full-bleed saturated background, never body text in a 500.
2. **Text in an accent uses 700** (≥ 4.5:1 on `--paper`). 500 is for non-text marks only.
3. **Never introduce a hex outside this file.** A new need is a new token here first.
4. **Never use a source brand's exact hex** (`#db0505`, `#ff5a10`, `#10192b`) as an accent. The
   one deliberate exception is `--ink-soft` = NAAMII's blue-grey, a neutral that nobody reads as branding.
5. **Signatures, once each:** the **tri-band** (crimson | indigo | ember, 3px) under the home header
   and in the footer, and the **dusk wash** (`.dusk`, three 10% radial glows) behind the home hero only.
   It nods to the gradient heroes of Tangible and Terahs. Don't reuse either elsewhere.
6. Neutral pages (Talks & media, CV) use `--ink` as accent and let **each item carry its own persona
   dot**. Cross-cutting content is coloured by what it speaks to, not by where it sits.

## 2. How persona colour is applied (the mechanism)

One attribute, three tokens. Set `data-persona` on `<body>` (page-level) or on any `<section>`
(section-level); CSS maps it to the generic accent tokens that every component reads:

```css
[data-persona="dreamer"]      { --accent: var(--crimson-500); --accent-strong: var(--crimson-700); --accent-tint: var(--crimson-100); }
[data-persona="scientist"]    { --accent: var(--indigo-500);  --accent-strong: var(--indigo-700);  --accent-tint: var(--indigo-100); }
[data-persona="entrepreneur"] { --accent: var(--ember-500);   --accent-strong: var(--ember-700);   --accent-tint: var(--ember-100); }
```

**Components only ever read `--accent`, `--accent-strong`, `--accent-tint`** — never a named
family. That is what lets a section on the home page switch persona by changing one attribute,
and it is what keeps a new component automatically correct on all three personas.

Page → persona map (nav dots live in `src/data/site.yaml`; the page persona is the `persona` prop on `<Base>`):

| Page | Persona |
|---|---|
| `/dreamer/`, `/government/` | dreamer |
| `/scientist/`, `/publications/` | scientist |
| `/entrepreneur/` | entrepreneur |
| `/`, `/talks/` (Talks & media; `/media/` redirects here), `/cv/` | neutral (items carry their own dot) |

## 3. Persona glyphs

Each persona has one line glyph (1.5px stroke, `currentColor`, 24px grid), in
`src/components/Glyph.astro`:
- **Dreamer** — a sun half-risen over a ridge line.
- **Scientist** — a lens: two concentric circles with a crosshair tick.
- **Entrepreneur** — three ascending terraces.

Use them at 20–28px in eyebrows and persona cards. Never fill them, never animate them.

## 4. Typography

- **Headings:** `Source Serif 4` (600; display 700), optical sizing on. Serif = the scholar's voice.
- **Body & UI:** `Inter` (400/500/600). 17px base, line-height 1.65, measure ≤ 68ch.
- **Numbers & metadata:** Inter with `font-variant-numeric: tabular-nums`.
- Scale (rem): 0.8125 meta · 0.9375 small · 1.0625 body · 1.25 h4 · 1.5 h3 · 2 h2 · 2.75 h1 · 3.5 display.
- **Eyebrow:** 0.75rem, 600, letter-spacing 0.12em, uppercase, colour `--accent-strong`,
  preceded by the persona glyph. It is the main place persona is *named*.

## 5. Space, shape, motion

- 4px base; section padding `clamp(3rem, 8vw, 6rem)` vertical; container 1120px, text 720px.
- Radius: 10px cards, 999px chips. Borders 1px `--line`. Shadows: one soft level only
  (`0 1px 2px rgb(0 0 0 / .04), 0 8px 24px -12px rgb(0 0 0 / .12)`), on hover.
- Motion: 150ms ease-out on colour/transform; hover lift ≤ 2px. Respect
  `prefers-reduced-motion`. No parallax, no scroll-jacking, no autoplay video.

## 6. Components (styles in `public/assets/css/site.css`, markup in `src/components/`)

| Component | Anatomy | Persona expression |
|---|---|---|
| `.page-rule` | 3px bar at top of `<main>` | `--accent` |
| `.eyebrow` | glyph + label | `--accent-strong` |
| `.persona-card` | glyph, name, one-liner, link | left edge 3px `--accent`, tint on hover |
| `.chip` | pill filter/tag | outline `--line`; active = `--accent-tint` bg + `--accent-strong` text |
| `.dot` | 8px circle before an item | the item's own persona colour |
| `.pub` | title · authors (self bolded) · venue · year · links | links in `--accent-strong` |
| `.talk-card` | 16:9 thumbnail, title, venue · city · date, scope badge, persona dot | dot only |
| `.timeline` | year column + entries | year in `--accent-strong`, rail `--line` |
| `.stat` | big number + label | number in `--ink`, label `--muted`; no accent (numbers don't belong to a persona) |
| `.callout` | at most one per section | `--accent-tint` background |

## 7. Content hierarchy rules

- **Talks & media** (`/talks/`) holds talks, panels, podcasts, video/TV interviews and press as one list
  (`getAppearances()` in `src/lib/site.ts`, cards from `AppearanceCard.astro`). Dimensions: *type* is a tab
  (one at a time); *kind* or *role* refines it under its own tab; *persona* chips cut across; *reach* (`scope`)
  is a chip row (so a visitor sees both reaches and their counts from the top) and the section, a collapsible
  `<details>` with a live count: `international` (venue or audience outside Nepal, plus ANAIS and HAICon) → large
  16:9 cards, `national` → smaller cards. Within a section: newest first.
  Cards name the people (host, guest, moderator, co-panelists, with affiliation and profile link) and carry
  labels for kind, his role and language.
- **Publications** are grouped by year, filterable by `themes` and `type`. `authors:` is a YAML **list in
  paper order, always complete**. Bishesh is written `**Khanal B**` and rendered bold, never auto-guessed
  (Bidur Khanal is also "Khanal B"). A consortium credit is written `"X Consortium (incl. **Khanal B**)"`.
- **Author display rule (his, 2026-09-26)** — `formatAuthors()` in `src/lib/site.ts`, and nowhere else:
  ≤ 20 authors → show all. > 20 → the first 20, **his name wherever it falls**, and **the last author**,
  with `…` at every gap. Examples: `A1…A20, …, **Khanal B**` (he is last);
  `A1…A20, …, Z` (he is inside the first 20); `A1…A20, …, **Khanal B**, …, Z` (he is 35th). The point is
  that a reader can always tell whether he is the last author. Never shorten the data itself.
- A page never shows more than one callout per section and never more than three stats in a row.

## 8. Adding something — checklist

0. **Stack:** Astro (static output → GitHub Pages). Lists (publications, talks, media) are
   content collections validated by `src/content.config.ts`. A new field or enum value goes into
   the schema first, or the build rejects it. Page copy is plain YAML read by `src/lib/site.ts`.
1. Content goes in `src/data/*.yaml`, never hard-coded into a page.
2. Pick the persona for the page/section from §2: `<Base persona="…">` or `data-persona` on a section, nothing else.
3. Compose from §6 components. A new component reads only `--accent*` tokens.
4. Check both themes (`prefers-color-scheme` and the toggle) and 375px width.
5. `npm run build` must pass (it is the validator), then screenshot it (headless Chrome) and look
   before calling it done. Layout defects are not visible in source. Headless Chrome cannot make a
   window narrower than ~500px, so test phone width inside a 375px `<iframe>`.
