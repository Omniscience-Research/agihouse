/**
 * AGI House — Newsletter signup backend (Google Apps Script web app)
 * ------------------------------------------------------------------
 * Receives an email from the agihouse.ai sticky bar and:
 *   1. Subscribes them in Beehiiv (server-side, key stays hidden)
 *   2. Appends a row to the attendee CRM sheet (native Sheets access)
 *
 * SETUP (one time, ~2 min) — see scripts/README-newsletter.md:
 *   1. script.google.com → New project → paste this file.
 *   2. Project Settings → Script Properties, add:
 *        BEEHIIV_API_KEY        = <your beehiiv API key>
 *        BEEHIIV_PUBLICATION_ID = <pub_xxxxxxxx>
 *   3. Deploy → New deployment → type "Web app",
 *        Execute as: Me,  Who has access: Anyone.
 *   4. Copy the /exec URL into js/newsletter.js (ENDPOINT) and push.
 */

// The CRM spreadsheet + the exact tab the signups go to (gid from the URL).
var SPREADSHEET_ID = '1roR4zshmn-mPxWC-pVXDU9KawyPXET-raiPFhPUXh0w';
var CRM_SHEET_GID = 905886528;

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
    var email = (data.email || '').toString().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json_({ ok: false, error: 'invalid_email' });
    }
    // Drop bots that tripped the honeypot, but answer 200 so the UI is happy.
    if (data.company) {
      return json_({ ok: true, skipped: 'honeypot' });
    }

    var beehiiv = subscribeBeehiiv_(email, data);
    var crm = appendToCrm_(email, data);

    return json_({ ok: true, beehiiv: beehiiv, crm: crm });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json_({ ok: true, service: 'agih-newsletter' });
}

// --- Beehiiv ---------------------------------------------------------
function subscribeBeehiiv_(email, data) {
  var props = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('BEEHIIV_API_KEY');
  var pubId = props.getProperty('BEEHIIV_PUBLICATION_ID');
  if (!apiKey || !pubId) return 'not_configured';

  var url = 'https://api.beehiiv.com/v2/publications/' + pubId + '/subscriptions';
  var payload = {
    email: email,
    reactivate_existing: true,
    send_welcome_email: true,
    utm_source: 'agihouse.ai',
    utm_medium: 'website',
    utm_campaign: 'sticky-bar',
    referring_site: data.referrer || 'agihouse.ai',
  };
  var res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + apiKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  var code = res.getResponseCode();
  return code >= 200 && code < 300 ? 'ok' : 'error_' + code;
}

// --- CRM sheet -------------------------------------------------------
// Maps fields to the tab's existing columns by header name, so it works
// regardless of the exact CRM schema.
function appendToCrm_(email, data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = null;
  var all = ss.getSheets();
  for (var i = 0; i < all.length; i++) {
    if (all[i].getSheetId() === CRM_SHEET_GID) {
      sheet = all[i];
      break;
    }
  }
  if (!sheet) return 'tab_not_found';

  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return 'no_columns';
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  // De-dupe: skip if this email already exists in the email column.
  var emailCol = findCol_(headers, ['email', 'email address', 'email address 1']);
  if (emailCol > -1 && sheet.getLastRow() > 1) {
    var existing = sheet
      .getRange(2, emailCol + 1, sheet.getLastRow() - 1, 1)
      .getValues();
    for (var r = 0; r < existing.length; r++) {
      if ((existing[r][0] || '').toString().trim().toLowerCase() === email.toLowerCase()) {
        return 'duplicate';
      }
    }
  }

  var row = new Array(lastCol).fill('');
  var stamp = data.ts || new Date().toISOString();
  var note = 'Newsletter signup via agihouse.ai (' + stamp + ')';

  setCol_(row, headers, ['email', 'email address', 'email address 1'], email);
  setCol_(row, headers, ['source', 'channel'], 'Newsletter — agihouse.ai');
  setCol_(row, headers, ['notes', 'note'], note);
  setCol_(row, headers, ['tags', 'tag'], 'Newsletter');
  setCol_(row, headers, ['date', 'last contact', 'dates', 'contact status'], stamp);
  setCol_(row, headers, ['event link', 'related event'], data.referrer || '');

  sheet.appendRow(row);
  return 'appended';
}

function findCol_(headers, names) {
  for (var i = 0; i < headers.length; i++) {
    var h = (headers[i] || '').toString().trim().toLowerCase();
    for (var j = 0; j < names.length; j++) {
      if (h === names[j]) return i;
    }
  }
  return -1;
}

function setCol_(row, headers, names, value) {
  var idx = findCol_(headers, names);
  if (idx > -1 && !row[idx]) row[idx] = value;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
