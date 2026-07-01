# /newlander — AGI House "Phoenix" landing concept

Pure-black, minimalist redesign served at **agihouse.ai/newlander**. Single static
page (`index.html`), no build step.

## Pieces
- **Hero** — a self-hosted [UnicornStudio](https://www.unicorn.studio) WebGL scene
  (`assets/agi-hero-scene-fine.json`, loaded via the v2.2.5 jsDelivr SDK with
  `data-us-project-src`). The scene is now **just the image** — the dithered portrait with
  live mouse-trail, god-rays, and 3D tilt. All text was pulled *out* of the scene so it can
  be edited independently, and is now crisp HTML on top:
  - **Left lockup** — "AGI HOUSE SF" + "RESEARCHERS BUILDING UNICORNS" (`.hero-lockup`, in
    the self-hosted **Delight** webfont, `assets/fonts/`). Static.
  - **Name + company logo** (`.hero-label`) — floats above the head, right-of-centre, and
    swaps in sync with the portrait.
  - **The portrait cycles through the builders** (`assets/people/*.jpg`, ~3.4s each) with a
    **hard cut** (no fade). Done *without* changing the effect: the inline loader grabs the
    scene's first image layer and calls `layer.setSource(nextPhoto)` on a timer (George's
    approach), so the dither/glitter/god-rays/tether stay identical and only the photo swaps.
    The name + logo swap at the same instant. See **Updating the hero** below.
  - Two scene files exist: `agi-hero-scene.json` (default grain) and
    `agi-hero-scene-fine.json` (the **50%-smaller dither** we settled on — the one the page
    loads). Both are the same 6-layer just-the-image scene; the fine one only halves the
    glyphDither `getGridSize()`.
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
3. Add an entry to the `PEOPLE` array in the hero `<script>` at the top of `index.html`.
   Each entry is `{ slug, name, logo }` — `slug` = the photo filename (minus `.jpg`),
   `name` = the crisp name shown above the head, `logo` = the company mark under it. Order =
   cycle order. `HOLD` (ms) sets the time per person.

**Company logos & sizing.** The logo images live in `assets/logos/`. Single-company people
point at a clean mark (e.g. `perplexity.png`, `openai.png`). People with two affiliations use
a pre-composed `hero-<slug>.png` (e.g. `hero-josh.png` = Autograph + Coframe; `hero-jeremy.png`
= AGI HOUSE + Infinity). All logos render at one CSS height cap (`.hl-logo`, ~38px), so to make
one mark bigger/smaller *relative* to another you bake the ratio into the PNG (a taller
transparent canvas = a smaller-looking mark). `hero-anton.png` is Lovable padded to render 25%
smaller; the Autograph/Infinity ratios are baked into their composites. Rebuild helper is in the
commit that introduced them (split composite at the transparent gap, rescale one piece, recompose).

**B) Change the EFFECT itself (the dither, colours, portrait layout).**
This lives inside UnicornStudio and must be edited there:
1. Open the project in the UnicornStudio editor (see *Project & access* below).
2. Keep the scene as **just the portrait** — do not add the name/title/logo back in; those
   are HTML now (edit them in `index.html`). Make your changes, then **Export** → JSON.
3. **Give that JSON to Claude** (or drop it in). The cycle auto-targets the scene's *first
   image layer* as the portrait, so a re-export keeps working as long as that layer stays the
   portrait. Claude re-applies the 50%-smaller dither (halve the glyphDither `getGridSize()`)
   to produce `agi-hero-scene-fine.json`, which is the file the page loads.

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
