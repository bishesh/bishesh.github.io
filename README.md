# bishesh.github.io

Personal website of Bishesh Khanal — **Dreamer · Scientist · Entrepreneur**.
Static site built with [Eleventy](https://www.11ty.dev/); all content is YAML in `src/_data/`.

## Run locally

```sh
npm install
npm run dev        # http://localhost:8080, live-reloads on save
```

## Updating content (the GitHub web editor is enough)

| To add… | Edit | Notes |
|---|---|---|
| a paper | `src/_data/publications.yaml` | Copy an entry. Write yourself as `**Khanal B**`. `themes:` keys come from `themes.yaml`. `featured: true` puts it on the Scientist page. `hidden: true` keeps it out. |
| a talk / podcast | `src/_data/talks.yaml` | `scope:` international · regional · national · local sets which tier it lands in. `video:` takes a YouTube URL or id and the thumbnail follows. `persona:` sets the dot colour. |
| press | `src/_data/media.yaml` | |
| a government role | `src/_data/government.yaml` | Grouped by `body`. |
| persona page text | `src/_data/{dreamer,scientist,entrepreneur,home}.yaml` | Markdown is allowed in `lead`, `story`, `text`. |

`review:` fields mark something imported by keyword guess or flagged "verify" in the source dossier.
Check it, then delete the field. The page ignores it either way.

## Design

The visual contract is `.claude/skills/site-design/SKILL.md`: the "Himalayan Light" palette, the three
persona accents (dawn · glacier · terrace), typography and components. A page sets `persona:` in its front
matter, and that one attribute is all it does to change colour.

## Going live

This is being built on the `redesign` branch. `master` still holds the old Nikola site and GitHub Pages
serves it. To switch over:
1. Repo Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. Merge `redesign` into `master`. `.github/workflows/deploy.yml` builds and publishes.
