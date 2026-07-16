#!/usr/bin/env node
/**
 * Fetches upcoming events from Partiful and writes them to data/partiful-events.json
 *
 * Usage:
 *   node scripts/fetch-partiful-events.js
 *
 * Environment variables:
 *   PARTIFUL_AUTH_TOKEN  — Firebase bearer token (optional, enables full event list)
 *
 * Without a token, this uses the public getPublishedEvents endpoint.
 * With a token, it also fetches upcoming events via getMyUpcomingEventsForHomePage.
 *
 * To get a bearer token:
 *   1. Log into partiful.com in your browser
 *   2. Open DevTools → Network tab
 *   3. Refresh the page
 *   4. Find any request to api.partiful.com
 *   5. Copy the Authorization header value (without "Bearer " prefix)
 *   6. Export it: export PARTIFUL_AUTH_TOKEN="your_token_here"
 *
 * The token expires periodically. To automate token refresh, use the
 * sendAuthCode + getLoginToken endpoints (see comments at bottom).
 */

const fs = require('fs');
const path = require('path');

const API_BASE = 'https://api.partiful.com';

// Jeremy Nixon's Partiful user ID
const JEREMY_USER_ID = 'FFul3rBdtCT3Ap9Ytp6nzalEXak1';

const AUTH_TOKEN = process.env.PARTIFUL_AUTH_TOKEN || '';

async function callPartiful(endpoint, params, requiresAuth) {
  const headers = { 'Content-Type': 'application/json' };
  if (requiresAuth || AUTH_TOKEN) {
    if (!AUTH_TOKEN) {
      console.warn(`  Skipping ${endpoint} (requires auth token)`);
      return null;
    }
    headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  }

  const resp = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data: { params: params || {} } }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.warn(`  ${endpoint} returned ${resp.status}: ${text.slice(0, 200)}`);
    return null;
  }

  const json = await resp.json();
  return json.result || json;
}

async function fetchPublishedEvents() {
  console.log('Fetching published events for user...');
  const result = await callPartiful('getPublishedEvents', { userId: JEREMY_USER_ID }, false);
  if (!result) return [];

  const events = result.events || result.data?.events || [];
  console.log(`  Found ${events.length} published events`);
  return events;
}

async function fetchUpcomingEvents() {
  if (!AUTH_TOKEN) {
    console.log('No auth token — skipping upcoming events endpoint');
    return [];
  }

  console.log('Fetching upcoming events (authenticated)...');
  const result = await callPartiful('getMyUpcomingEventsForHomePage', {}, true);
  if (!result) return [];

  // The response structure may vary; try common patterns
  const events = result.events || result.data?.events ||
                 result.upcomingEvents || result.data?.upcomingEvents || [];
  console.log(`  Found ${events.length} upcoming events`);
  return events;
}

async function fetchEventDetails(eventId) {
  const result = await callPartiful('getEvent', { eventId }, false);
  return result;
}

async function fetchDiscoverSF() {
  console.log('Fetching SF discover feed...');
  try {
    // Public Next.js data route — no auth needed
    const resp = await fetch(
      'https://partiful.com/_next/data/uVGCxSROk3n_zUK46vseT/discover/SF.json?region=SF'
    );
    if (!resp.ok) {
      console.warn(`  Discover feed returned ${resp.status}`);
      return [];
    }
    const json = await resp.json();
    const pageProps = json.pageProps || {};

    // Extract events from sections and feed
    const events = [];
    const seen = new Set();

    // From curated sections
    (pageProps.sections || []).forEach(section => {
      (section.events || section.items || []).forEach(item => {
        const evt = item.event || item;
        if (evt.id && !seen.has(evt.id)) {
          seen.add(evt.id);
          events.push(evt);
        }
      });
    });

    // From feed items
    (pageProps.feedItems || []).forEach(item => {
      const evt = item.event || item;
      if (evt.id && !seen.has(evt.id)) {
        seen.add(evt.id);
        events.push(evt);
      }
    });

    console.log(`  Found ${events.length} events in SF discover feed`);
    return events;
  } catch (err) {
    console.warn('  Failed to fetch discover feed:', err.message);
    return [];
  }
}

function normalizeEvent(evt) {
  // Handle different response shapes from various endpoints
  const id = evt.id || evt.eventId || '';
  const title = evt.title || evt.name || evt.eventName || 'Untitled';
  const startAt = evt.startDate || evt.startDateTime || evt.start_at || evt.date || null;
  const endAt = evt.endDate || evt.endDateTime || evt.end_at || null;
  const location = evt.location || evt.locationName || evt.venue || '';
  const coverUrl = evt.coverImage || evt.imageUrl || evt.coverPhoto || evt.image || '';
  const description = evt.description || evt.details || '';

  return {
    id,
    title,
    startAt,
    endAt,
    url: `https://partiful.com/e/${id}`,
    location: typeof location === 'string' ? location : (location.name || location.address || ''),
    coverUrl,
    description: description.slice(0, 300),
    source: 'partiful',
  };
}

async function main() {
  console.log('=== Partiful Event Fetcher ===\n');

  const allEvents = [];
  const seenIds = new Set();

  function addEvents(events) {
    events.forEach(evt => {
      const normalized = normalizeEvent(evt);
      if (normalized.id && !seenIds.has(normalized.id)) {
        seenIds.add(normalized.id);
        allEvents.push(normalized);
      }
    });
  }

  // 1. Public: published events for Jeremy
  const published = await fetchPublishedEvents();
  addEvents(published);

  // 2. Authenticated: upcoming events (if token available)
  const upcoming = await fetchUpcomingEvents();
  addEvents(upcoming);

  // 3. Public: SF discover feed (to catch AGI House events)
  const discover = await fetchDiscoverSF();
  // Filter discover for AGI House related events
  const agiHouseEvents = discover.filter(evt => {
    const text = JSON.stringify(evt).toLowerCase();
    return text.includes('agi house') || text.includes('agihouse') ||
           text.includes('jeremy nixon') || text.includes(JEREMY_USER_ID);
  });
  if (agiHouseEvents.length) {
    console.log(`  ${agiHouseEvents.length} AGI House events found in discover feed`);
  }
  addEvents(agiHouseEvents);

  // Sort by date
  allEvents.sort((a, b) => {
    if (!a.startAt) return 1;
    if (!b.startAt) return -1;
    return new Date(a.startAt) - new Date(b.startAt);
  });

  // Write output
  const outPath = path.join(__dirname, '..', 'data', 'partiful-events.json');
  const output = {
    fetchedAt: new Date().toISOString(),
    hasAuthToken: !!AUTH_TOKEN,
    eventCount: allEvents.length,
    events: allEvents,
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${allEvents.length} events to ${outPath}`);

  if (!AUTH_TOKEN) {
    console.log('\nTip: Set PARTIFUL_AUTH_TOKEN for the full event list.');
    console.log('See the comment at the top of this script for instructions.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

/*
 * ── Token refresh (for automation) ──
 *
 * To programmatically get a bearer token, use these two endpoints:
 *
 * Step 1: Send auth code to Jeremy's phone
 *   POST https://api.partiful.com/sendAuthCode
 *   Body: {"data":{"params":{"phoneNumber":"+1XXXXXXXXXX"}}}
 *
 * Step 2: Exchange code for token
 *   POST https://api.partiful.com/getLoginToken
 *   Body: {"data":{"params":{"phoneNumber":"+1XXXXXXXXXX","code":"123456"}}}
 *
 * The response contains a Firebase Auth token you can use as PARTIFUL_AUTH_TOKEN.
 * This flow requires manual code entry, so full automation would need
 * a Twilio webhook or similar to capture the SMS code.
 */
