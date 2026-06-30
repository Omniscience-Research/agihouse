#!/usr/bin/env bash
# Weekly valuation refresh for the AGI House SF lander.
# Runs the Claude CLI headless against the runbook, which updates
# newlander/data/companies.json and pushes to main (the site recomputes
# the trillion-dollar number client-side from that one file).
#
# Install (run weekly, Mondays 9am) via launchd — see the .plist next to this file,
# or add a crontab line:
#   0 9 * * 1  /Users/juliusritter/agihouse/newlander/refresh-valuations.sh >> /tmp/agihouse-valuations.log 2>&1
set -euo pipefail

# launchd runs with a minimal PATH; make sure user bins + git are reachable.
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
CLAUDE_BIN="$(command -v claude || echo "$HOME/.local/bin/claude")"

REPO="/Users/juliusritter/agihouse"
cd "$REPO"

git checkout main
git pull --ff-only || true

# Hand the runbook to Claude headless. --permission-mode bypassPermissions lets it
# edit the JSON, run the sanity check, commit, and push without prompts.
"$CLAUDE_BIN" -p "Follow the instructions in newlander/update-valuations.md to refresh company valuations, then commit and push the updated newlander/data/companies.json to main. Report a short summary of what moved." \
  --permission-mode bypassPermissions

echo "[$(date)] valuation refresh run complete"
