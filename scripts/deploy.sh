#!/bin/sh
# Publish the site: GitHub Pages serves master:/docs ("deploy from branch", no Actions), so the build is committed there.
# Only this script writes docs/; `npm run build` goes to dist/ (ignored), so ordinary commits never change the live site.
set -e
cd "$(dirname "$0")/.."
[ "$(git branch --show-current)" = master ] || { echo "deploy runs on master only" >&2; exit 1; }
[ -z "$(git status --porcelain -- . ':!docs')" ] || { echo "commit or discard source changes first:" >&2; git status --short -- . ':!docs' >&2; exit 1; }
npm run build -- --outDir docs
git add docs
git diff --cached --quiet -- docs || git commit -q -m "Build site" -- docs
git push
