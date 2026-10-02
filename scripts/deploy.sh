#!/bin/sh
# Build the site into docs/ and publish it: GitHub Pages serves master:/docs ("deploy from branch", no Actions).
set -e
cd "$(dirname "$0")/.."
[ "$(git branch --show-current)" = master ] || { echo "deploy runs on master only" >&2; exit 1; }
npm run build
git add docs
git diff --cached --quiet -- docs || git commit -q -m "Build site" -- docs
git push
