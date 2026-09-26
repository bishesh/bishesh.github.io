---
name: site-design
description: The visual contract for bishesh.github.io — the "Himalayan Light" palette, the three-persona accent system (Dreamer · Scientist · Entrepreneur), typography, spacing, components and the rules for adding a page or section. Load before adding or restyling ANY page, section, component or colour on this site, and before adding content types (talks, publications, media) so they render through the existing components.
---

# site-design — the visual contract

The site presents one person through **three personas**. The design's job is to make the reader
*feel* which persona they are in without ever shouting it. **Persona is an accent, never a theme**:
the page, type, spacing and components are identical everywhere; only a small set of accent
tokens changes.

## 1. The palette — "Himalayan Light"

The three accents are one landscape seen at three heights: the **dawn** over the ridge (Dreamer),
the **glacier** at altitude (Scientist), the **terraced hills** below (Entrepreneur). Together on
warm paper they read as Nepal at first light — calm, not a flag, not a brand.

| Token family | Role | 700 (text on paper) | 500 (marks, rules, dots) | 100 (tint bg) | Dark-mode accent |
|---|---|---|---|---|---|
| `--dawn-*` | **Dreamer** — vision, institution-building, NAAMII | `#9A4B14` | `#D9822B` | `#FBEEDD` | `#EBA868` |
| `--glacier-*` | **Scientist** — research, publications | `#244A77` | `#3F6FA6` | `#E6EEF8` | `#93B6E2` |
| `--terrace-*` | **Entrepreneur** — ventures, building products | `#1E6A52` | `#2F9274` | `#E3F3EC` | `#71C9A9` |

Neutrals (shared by every page):

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | `#FAF8F4` | `#12151B` | page background |
| `--surface` | `#FFFFFF` | `#1A1E26` | cards |
| `--ink` | `#1D2330` | `#E8E6E1` | body text, headings |
| `--ink-soft` | `#4A5263` | `#B4B8C1` | secondary text |
| `--muted` | `#7B8292` | `#868C98` | metadata, captions (never body text) |
| `--line` | `#E6E1D8` | `#2A2F39` | hairlines, card borders |

Rules:
1. **Accents are for marks, not fields.** A persona colour may appear as: the 3px top rule of
   the page/section, the eyebrow label, link underlines, chips/dots, a card's left edge, icons,
   and a *100-tint* background on at most one callout per section. Never a full-bleed
   saturated background, never body text in a 500.
2. **Text in an accent uses 700** (≥ 4.5:1 on `--paper`). 500 is for non-text marks only.
3. **Never introduce a hex outside this file.** A new need is a new token here first.
4. **The tri-band** (`dawn | glacier | terrace`, equal thirds, 3px) is the site's only
   signature. It appears once: under the header on the home page and in the footer. Don't
   reuse it decoratively.
5. Neutral pages (Talks, Media, CV) use `--ink` as their accent and let **each item carry its
   own persona dot** — cross-cutting content is coloured by what it speaks to, not by where it sits.

## 2. How persona colour is applied (the mechanism)

One attribute, three tokens. Set `data-persona` on `<body>` (page-level) or on any `<section>`
(section-level); CSS maps it to the generic accent tokens that every component reads:

```css
[data-persona="dreamer"]      { --accent: var(--dawn-500);    --accent-strong: var(--dawn-700);    --accent-tint: var(--dawn-100); }
[data-persona="scientist"]    { --accent: var(--glacier-500); --accent-strong: var(--glacier-700); --accent-tint: var(--glacier-100); }
[data-persona="entrepreneur"] { --accent: var(--terrace-500); --accent-strong: var(--terrace-700); --accent-tint: var(--terrace-100); }
```

**Components only ever read `--accent`, `--accent-strong`, `--accent-tint`** — never a named
family. That is what lets a section on the home page switch persona by changing one attribute,
and it is what keeps a new component automatically correct on all three personas.

Page → persona map (keep in `src/_data/site.yaml` `nav`, not in templates):

| Page | Persona |
|---|---|
| `/dreamer/`, `/government/` | dreamer |
| `/scientist/`, `/publications/` | scientist |
| `/entrepreneur/` | entrepreneur |
| `/`, `/talks/`, `/media/`, `/cv/` | neutral (items carry their own dot) |

## 3. Persona glyphs

Each persona has one line glyph (1.5px stroke, `currentColor`, 24px grid), in
`src/_includes/partials/glyph.njk`:
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

## 6. Components (all in `src/assets/css/site.css`)

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

- **Talks** are tiered by `scope`: `international` → large 16:9 cards (first rows),
  `regional` → same grid, `national` → smaller cards, `local` → a compact list, collapsed.
  Within a tier: featured first, then newest.
- **Publications** are grouped by year, filterable by `themes` and `type`. Bishesh's own name
  is written `**Khanal B**` in the data and rendered bold — never auto-guessed (Bidur Khanal is
  also "Khanal B").
- A page never shows more than one callout per section and never more than three stats in a row.

## 8. Adding something — checklist

1. Content goes in `src/_data/*.yaml`, never hard-coded into a template.
2. Pick the persona for the page/section from §2; set `data-persona`, nothing else.
3. Compose from §6 components. A new component reads only `--accent*` tokens.
4. Check both themes (`prefers-color-scheme` and the toggle) and 375px width.
5. Screenshot it (headless Chrome) and look before calling it done — layout defects are not
   visible in source.
