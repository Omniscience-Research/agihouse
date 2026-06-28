# /newlander — AGI House "Phoenix" landing concept

Pure-black, minimalist redesign served at **agihouse.ai/newlander**. Single static
page (`index.html`), no build step.

## Pieces
- **Hero** — a self-contained **WebGL2 cycling pixel-portrait** (inline `<script>` in
  `index.html`, no library). It dissolves through the AGI House builders (`assets/people/*.jpg`),
  ~2s each, tile-by-tile, rendering each face as an LED/mosaic dither on black. The
  name + company label (top-right) is synced to each face; the left lockup (AGI HOUSE SF /
  RESEARCHERS BUILDING UNICORNS, in the self-hosted **Delight** webfont, `assets/fonts/`)
  stays put. The cycle + dither shader is adapted from George's UnicornStudio effect
  (8-texture slot cycler). Edit the `PEOPLE` array at the top of the script to change the
  roster; `prefers-reduced-motion` holds on the first builder. Falls back to a static
  first portrait if WebGL2 is unavailable.
  - Portraits are preprocessed to a uniform 1280×960 (4:3) by hand from the source shots;
    keep new ones consistent (head-and-shoulders, centered, on near-black).
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
hero loads the portraits as WebGL textures, which `file://` blocks via CORS:
```
python3 -m http.server 8765      # → http://localhost:8765/newlander/
```
