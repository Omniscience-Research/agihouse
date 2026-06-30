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
  - **The portrait cycles through the builders** (`assets/people/*.jpg`, ~3.2s each). This
    is done *without* changing the effect: the inline loader script grabs the scene's first
    image layer and calls `layer.setSource(nextPhoto)` on a timer (George's approach), so
    the dither/glitter/god-rays/tether stay identical and only the photo swaps. See
    **Updating the hero** below.
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

## Updating the hero
The hero = a UnicornStudio scene file + the people photos that cycle through it. Two
independent things to update:

**A) Change WHO appears (just the photos) — no UnicornStudio needed.**
1. Add/replace head-and-shoulders shots on a near-black background (any size) — keep them
   consistent with the existing ones.
2. Preprocess to a uniform 1280×960 (4:3) JPEG into `assets/people/`:
   ```
   python3 - <<'PY'
   from PIL import Image; import os
   TW,TH=1280,960; out='assets/people'
   def proc(src,dst):
       im=Image.open(src).convert('RGB'); w,h=im.size; t=TW/TH; ar=w/h
       if ar>t: nw=int(h*t); im=im.crop(((w-nw)//2,0,(w-nw)//2+nw,h))
       else:    nh=int(w/t); im=im.crop((0,(h-nh)//2,w,(h-nh)//2+nh))
       im.resize((TW,TH),Image.LANCZOS).save(dst,quality=86,optimize=True)
   proc('SOURCE.png', out+'/NAME.jpg')
   PY
   ```
3. Add the filename to the `PEOPLE` array in the hero `<script>` at the top of `index.html`
   (`var PEOPLE = ['aravind','andrej','josh','anton'].map(...)`). Order = cycle order.
   `HOLD` (ms) sets the time per person.

**B) Change the EFFECT itself (the dither, colours, layout, the name/logo text).**
This lives inside UnicornStudio and must be edited there:
1. Open the project in the UnicornStudio editor (see *Project & access* below).
2. Make your changes, then **Export** the scene → it gives you a JSON file.
3. **Give that JSON to Claude** (or drop it in) to replace `assets/agi-hero-scene.json`.
   The cycle auto-targets the scene's *first image layer* as the portrait, so a normal
   re-export keeps working as long as that layer stays the portrait.

> The page never talks to UnicornStudio at runtime — it loads the exported JSON + the
> UnicornStudio player library and runs entirely in the visitor's browser. So editing the
> project changes nothing live until you export and replace the JSON here.

### Project & access
- **Project (editor):** https://www.unicorn.studio/edit/SbptrY7OCDXhoN3ytzkd
- George's 8-texture cycle remix (reference): https://unicorn.studio/remix/DT9hYYtXiO9mFUnL7ghA
- **Login credentials are NOT stored in this public repo** (it serves agihouse.ai). They're
  kept in Claude's private memory / your password manager. Don't paste the password here.

## Favicon
`assets/phoenix-mark.png` is the transparent phoenix, also installed site-wide
(`img/assets/favicon.png`, `img/content/favicon*`).

## Preview
Serve from the repo root (so `/js/` and `/newlander/` both resolve) over http:// — the
UnicornStudio SDK fetches the scene JSON, which `file://` blocks:
```
python3 -m http.server 8765      # → http://localhost:8765/newlander/
```
