#!/usr/bin/env bash
# Recurring events refresh for the AGI House SF lander.
# Re-fetches newlander/events.json from the Luma API and pushes to main if it changed
# (the site renders the Events section client-side from that one file).
#
# Install (runs every 6 hours) via launchd — see com.agihouse.events.plist next to this
# file. That plist is a template with a placeholder API key; the *installed* copy at
# ~/Library/LaunchAgents/com.agihouse.events.plist holds the real key and is NOT
# committed to this public repo.
#
#   cp newlander/com.agihouse.events.plist ~/Library/LaunchAgents/
#   # edit ~/Library/LaunchAgents/com.agihouse.events.plist: fill in the real LUMA_API_KEY
#   launchctl load ~/Library/LaunchAgents/com.agihouse.events.plist
#
# Remove:
#   launchctl unload ~/Library/LaunchAgents/com.agihouse.events.plist
set -euo pipefail

# launchd runs with a minimal PATH; make sure git/python3 are reachable.
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

REPO="/Users/juliusritter/agihouse"
cd "$REPO"

if [ -z "${LUMA_API_KEY:-}" ]; then
  echo "[$(date)] LUMA_API_KEY not set in environment; skipping refresh" >&2
  exit 1
fi

git checkout main
git pull --ff-only || true

python3 newlander/fetch-events.py

if git diff --quiet -- newlander/events.json; then
  echo "[$(date)] events.json unchanged, nothing to commit"
  exit 0
fi

# Commit ONLY events.json, even if other files happen to be staged/dirty from
# unrelated in-progress work — `git commit <pathspec>` scopes the commit to just
# that path and leaves everything else untouched in the working tree/index.
git commit newlander/events.json -m "chore(newlander): refresh events snapshot ($(date -u +%Y-%m-%d))"
git push origin main
echo "[$(date)] events refresh pushed"
