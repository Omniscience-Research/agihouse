# Weekly valuation refresh — runbook

This is the instruction set the weekly cron (a scheduled Claude Code agent) follows to keep the
trillion-dollar number on the AGI House SF lander current. The site computes the headline number
and the hover breakdown **client-side from `newlander/data/companies.json`**, so the only thing that
needs updating is that one file.

## What to do each run

1. Open `newlander/data/companies.json`.
2. For each company with a non-null `valuationB`, web-search for the **latest** valuation
   (search: `"<company>" valuation latest funding round`). Use the most recent, well-sourced
   public figure (press, company blog, Crunchbase/PitchBook). Update `valuationB` (USD billions),
   `display` (e.g. `$6.6B`), `note`, and `source`.
3. For companies with `valuationB: null` (undisclosed), check whether a valuation has since been
   disclosed; if so, fill it in.
4. Watch for **new** companies co-founded by anyone in `newlander/data/people.json` and add them.
5. Set `asOf` to today's date (YYYY-MM-DD).
6. Sanity-check: `python3 -c "import json;d=json.load(open('newlander/data/companies.json'));p=[c for c in d['companies'] if c['valuationB']];print('total $%.2fT'%(sum(c['valuationB'] for c in p)/1000),'unicorns',len([c for c in p if c['valuationB']>=1]))"`
7. Commit the change. Default: open a PR titled `chore: weekly valuation refresh (<date>)` summarizing
   what moved, so the public numbers get a human glance before going live.

## Notes / guardrails

- Don't invent numbers. If a valuation can't be confirmed, leave the prior value and add a note.
- Big swing factors are OpenAI (Karpathy) and Anthropic (Mann) — double-check those two each run.
- Valuations are attributed to founding-team members; that framing is intentional and is disclosed
  in the panel footnote. Keep the footnote honest about undisclosed companies.
- The number is a floor ("$X.XT+"); the page already renders it that way.
