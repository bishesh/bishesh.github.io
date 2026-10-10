# bishesh.github.io: how we work

Bishesh asks for a change, watches it on localhost, iterates with Claude, and says **"deploy"** when happy.
Content is YAML in `src/data/`, pages in `src/pages/`, styles in `public/assets/css/site.css`. Before adding or
restyling a page, section or component, load the `site-design` skill.

## Making a change

1. **Make sure the dev server is up** before reporting back: `lsof -iTCP:8080 -sTCP:LISTEN`. If nothing is listening,
   run `npm run dev` (Astro detaches it; `npx astro dev stop` ends it). It reloads on save, so Bishesh sees each edit
   at http://localhost:8080 without being asked to start anything.
2. **Edit the source** (`src/`, `public/`). Never edit `docs/` by hand: it is the deployed build.
3. **Look at the result yourself** when the change is visual. Screenshot the page and read the PNG:
   ```sh
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
     --window-size=1280,900 --screenshot=<scratchpad>/shot.png http://localhost:8080/<page>/
   ```
   Use `--window-size=390,1200` to check phone width. Run `npm run build` (writes `dist/`, ignored) when data
   files change: it validates every entry against `src/content.config.ts`.
4. **Report** in a line or two what changed and which page to look at.

Commit and push as usual. Ordinary commits never change the live site, because only the deploy writes `docs/`.

## Talks come from ../presentations

From the RISE-MICCAI keynote (30 Sep 2026) on, the presentations repo is the source of truth for talks. Its
`talks.yaml` (derived from each talk's `context.md`) is in this site's talk fields; `npm run import:talks` merges it
into `src/data/talks.yaml`, replacing the entries that carry `source:` and leaving older talks alone. Fix a managed
talk in `../presentations/<talk>/context.md` (then its `scripts/talks-index.py`), not here: a re-import overwrites it.

## Deploying (only when Bishesh says "deploy")

1. Commit any outstanding source changes; `npm run deploy` refuses to run with uncommitted source.
2. `npm run deploy` on `master` builds into `docs/`, commits "Build site", and pushes. GitHub Pages serves
   `master:/docs` ("deploy from a branch"; there are no custom GitHub Actions) and updates within a minute or two.
3. Confirm it is live: `curl -s https://bishesh.github.io/<page>/` shows the change, or
   `gh api repos/bishesh/bishesh.github.io/pages/builds/latest --jq .status` is `built`.

## The old site

Branch `nikola-branch` holds the old Nikola site as the pages it served; tag `nikola-src` holds its source. To bring
something back, browse it side by side without leaving `master`:
`git worktree add ../bishesh-nikola nikola-branch && python3 -m http.server 8090 -d ../bishesh-nikola`.
