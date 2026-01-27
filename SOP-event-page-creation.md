# SOP: Creating AGI House Event Pages

## Prerequisites

1. **Git access** to the repo: `git@github.com:Omniscience-Research/agihouse.git`
2. **Clone the repo locally**: `git clone git@github.com:Omniscience-Research/agihouse.git ~/agihouse`
3. **Event photos** accessible on your machine (e.g., from Google Drive desktop app at `~/Library/CloudStorage/GoogleDrive-{email}/`)
4. **YouTube video URL** if available
5. **Luma event link** for event details

---

## Single Prompt for Claude

Copy and customize this prompt:

```
Create an AGI House event recap page for [EVENT NAME].

**Event details:**
- Luma link: [LUMA URL]
- Date: [DATE]
- Hosts: [NAMES]
- Partners: [NAMES]

**YouTube video to embed as hero:**
[YOUTUBE URL]

**Photos location:**
[PATH TO PHOTOS FOLDER, e.g., ~/Library/CloudStorage/GoogleDrive-email@domain.com/My Drive/Social Media/EVENT FOLDER/]

**Instructions:**
1. Use the existing AGI House event page template (reference biological-sciences.html or vibe-coding-jam.html)
2. Create the HTML file and image folder with matching names (e.g., event-name.html and img/event-name/)
3. Copy photos from the specified folder into the repo
4. Embed the YouTube video as the hero at the top (16:9 responsive)
5. Include a photo grid below the content
6. Write copy in this style:
   - Simple, precise sentences
   - Understated and confident
   - No hyphens or em dashes
   - No phrases like "deep conversations," "curated," "craft," "intentional," "authentic"
   - No AI slop or buzzwords
   - Think Jony Ive: restrained, deliberate, lets the work speak
7. Frame as a past event recap, not a future event
8. Include "Join the Next Gathering" CTA at bottom linking to lu.ma/agihouse
9. Commit and push to main

**Example tone:**
- Good: "An afternoon of tea, conversation, and making. Each participant arrived with an idea and left with something they had built."
- Bad: "A vibrant gathering of passionate builders came together to craft intentional experiences and engage in deep conversations about the future of design."

**Example tea description:**
- Good: "Jasmine. Rose. Hibiscus. Chamomile. The selection was deliberate."
- Bad: "A curated selection of artisanal loose-leaf teas, each carefully chosen to inspire creativity and contemplation."
```

---

## File Structure

```
~/agihouse/
├── event-name.html          # The event page
├── img/
│   └── event-name/          # Folder name matches HTML filename
│       ├── photo1.jpeg
│       ├── photo2.jpeg
│       └── ...
```

---

## Page Structure

1. **Hero**: YouTube video embed (16:9 ratio) or full-width image
2. **Title block**: Event name, date, time, location
3. **Pull quote**: Key theme from the event
4. **Intro**: 1-2 sentences on what happened
5. **Hosts section**: Photo + brief bio
6. **What Happened**: Simple bullet list
7. **Additional sections** as needed (e.g., The Tea)
8. **Photo grid**: 3-column responsive grid
9. **Footer CTA**: Link to upcoming events

---

## Style Guidelines

### Copy
- Short sentences
- Active voice
- No jargon
- State facts, don't sell
- If it sounds like marketing, rewrite it

### Photos
- Use 4:3 aspect ratio for standard images
- Use 16:9 for wide images
- Hero images can span full width
- Delete unflattering or low-quality photos

### Technical
- HTML filename and image folder must match
- Commit messages should be descriptive
- Always push to main after committing

---

## Git Commands

```bash
# Pull latest
cd ~/agihouse && git pull

# After creating files
git add event-name.html img/event-name/
git commit -m "Add [Event Name] event page"
git push
```

---

## Checklist

- [ ] Repo cloned and up to date
- [ ] Photos copied to img/event-name/
- [ ] HTML file created as event-name.html
- [ ] YouTube video embedded (if available)
- [ ] Copy reviewed for AI slop
- [ ] Photo grid displays correctly
- [ ] Committed and pushed
- [ ] Verified live on agihouse.ai
