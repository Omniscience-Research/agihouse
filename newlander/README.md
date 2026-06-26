# /newlander — AGI House "Phoenix" landing concept

Pure-black, minimalist redesign served at **agihouse.ai/newlander**. Single static
page (`index.html`), no build step.

## Pieces
- **Hero** — a self-hosted [UnicornStudio](https://www.unicorn.studio) WebGL scene
  (`assets/agi-hero-scene.json`, loaded via the v2.2.5 jsDelivr SDK with
  `data-us-project-src`). The scene renders the whole lockup: AGI HOUSE SF +
  "RESEARCHERS BUILDING UNICORNS" (in the self-hosted **Delight** webfont, `assets/fonts/`),
  ARAVIND SRINIVAS + Perplexity logo, and the dithered portrait with live mouse-trail,
  god-rays, and 3D tilt. The scene's own phoenix mark was removed so it doesn't double
  up with the nav logo.
- **Nav** — liquid-glass top bar with the AGI House phoenix mark + wordmark, top-left.
- **Events** — a section with a top-right **List / Calendar** switch:
  - *List* — events pulled from the Luma API into `events.json`, with an Upcoming / Past
    sub-toggle. Rendered same-origin (the Luma API sends no CORS headers, so a live
    browser fetch is blocked — we snapshot instead).
  - *Calendar* — the `lu.ma/agi-house` calendar embedded directly (dark theme).
- **Newsletter** — the shared site bar (`../js/newsletter.js`). NOTE: it only renders in
  production once `ENDPOINT` in `js/newsletter.js` is set to the deployed Apps Script
  `/exec` URL (until then it shows only on localhost).

## Refresh the events snapshot
```
export LUMA_API_KEY=secret-xxxx        # never commit the key
python3 fetch-events.py                # rewrites events.json (upcoming + past)
```
Re-run periodically (or wire to a cron / GitHub Action) so the List view stays current.
The Calendar view is always live (it embeds Luma directly).

## Favicon
`assets/phoenix-mark.png` is the transparent phoenix, also installed site-wide
(`img/assets/favicon.png`, `img/content/favicon*`).

## Preview
Serve from the repo root (so `/js/` and `/newlander/` both resolve) over http:// — the
UnicornStudio SDK fetches the scene JSON, which `file://` blocks:
```
python3 -m http.server 8765      # → http://localhost:8765/newlander/
```
