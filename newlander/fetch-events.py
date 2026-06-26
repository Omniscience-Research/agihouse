#!/usr/bin/env python3
"""Snapshot AGI House Luma events -> events.json (same-origin; avoids browser CORS).
Re-run to refresh: python3 fetch-events.py"""
import json, urllib.request, urllib.parse, datetime, os, sys

# Key is read from the environment so it never lands in this public repo.
#   export LUMA_API_KEY=secret-xxxx   (then)   python3 fetch-events.py
API_KEY = os.environ.get("LUMA_API_KEY", "").strip()
if not API_KEY:
    sys.exit("Set LUMA_API_KEY in your environment before running (it must stay out of this public repo).")
BASE = "https://public-api.luma.com/v1/calendar/list-events"
now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def fetch(params):
    url = BASE + "?" + "&".join(f"{k}={urllib.parse.quote(str(v))}" for k,v in params.items())
    req = urllib.request.Request(url, headers={"x-luma-api-key": API_KEY,
                                               "Content-Type":"application/json",
                                               "User-Agent":"Mozilla/5.0 (agihouse-events-fetch)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

def norm(entry):
    e = entry.get("event", {})
    geo = e.get("geo_address_info") or {}
    return {
        "title": e.get("name") or "Untitled Event",
        "startAt": e.get("start_at"),
        "endAt": e.get("end_at"),
        "url": e.get("url") or ("https://lu.ma/" + (entry.get("api_id") or "")),
        "coverUrl": e.get("cover_url") or "",
        "city": geo.get("city") or "",
        "venue": geo.get("address") or geo.get("full_address") or "",
    }

up = fetch({"after": now, "sort_column":"start_at","sort_direction":"asc","pagination_limit":50})
past = fetch({"before": now, "sort_column":"start_at","sort_direction":"desc","pagination_limit":50})

out = {
    "generatedAt": now,
    "upcoming": [norm(x) for x in up.get("entries",[])],
    "past":     [norm(x) for x in past.get("entries",[])],
}
json.dump(out, open("events.json","w"), indent=2)
print(f"wrote events.json — {len(out['upcoming'])} upcoming, {len(out['past'])} past")
