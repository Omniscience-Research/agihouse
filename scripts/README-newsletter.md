# Newsletter signup — how it works & how to finish setup

A slim, dismissible sticky bar (`js/newsletter.js`) appears site-wide and
captures emails. Each signup is written to **Beehiiv** and to the **attendee
CRM sheet** by a small Google Apps Script web app
(`scripts/newsletter-apps-script.gs`).

```
agihouse.ai (static)  ──POST email──▶  Apps Script web app  ──▶ Beehiiv API
                                                            └──▶ CRM Google Sheet (tab gid 905886528)
```

The Beehiiv API key never touches the browser — it lives in the Apps Script's
Script Properties.

## One-time deploy (~2 minutes)

1. Go to <https://script.google.com> → **New project**.
2. Delete the boilerplate, paste in all of `scripts/newsletter-apps-script.gs`.
3. **Project Settings (gear) → Script Properties → Add**:
   - `BEEHIIV_API_KEY` = your Beehiiv API key
     (Beehiiv dashboard → Settings → Integrations → API)
   - `BEEHIIV_PUBLICATION_ID` = your publication id (looks like `pub_xxxx…`)
4. **Deploy → New deployment → Web app**:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
   - Click Deploy and authorize (it'll warn it's unverified — that's your own
     script; allow it).
5. Copy the **Web app URL** (ends in `/exec`).
6. In `js/newsletter.js`, set `ENDPOINT` to that URL, commit, and push.

That's it. To test: load any page, enter an email, submit — a new row appears in
the CRM tab and the subscriber shows up in Beehiiv.

## Notes

- **CRM mapping is by header name.** The script finds the Email / Source /
  Notes / Tags / Date columns in tab `gid 905886528` automatically and stamps
  `Source = "Newsletter — agihouse.ai"` + `Tags = "Newsletter"` so signups are
  easy to filter. Duplicate emails are skipped.
- **CORS:** Apps Script web apps don't return CORS headers, so the browser sends
  a simple `text/plain` POST (no preflight) and the UI shows success
  optimistically. Beehiiv de-dupes server-side, so retries are harmless.
- **Dev mode:** on `localhost` with `ENDPOINT` still unset, the widget logs the
  payload and simulates success so the UX is fully demoable without a backend.
- Re-deploying: use **Deploy → Manage deployments → edit (pencil) → New version**
  so the `/exec` URL stays the same.
