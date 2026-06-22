/* =============================================================
   AGI House — Newsletter signup (slim site-wide sticky bar)
   -------------------------------------------------------------
   Self-contained: injects its own styles + markup, handles
   validation, anti-spam honeypot, optimistic success, and
   remembers dismiss / subscribed state in localStorage.

   Backend: a Google Apps Script web app that writes each signup
   to Beehiiv AND the attendee CRM sheet. Set the deployed URL
   below (or define window.AGIH_NEWSLETTER_ENDPOINT before this
   script loads).

   Conversion best-practices applied here:
     - one field only (email) = lowest friction
     - concrete value prop + social proof
     - non-intrusive: slides in after a short scroll, dismissible,
       and never shown again once subscribed/dismissed
     - inline success state, no page reload
     - honeypot field to silently drop bots
   ============================================================= */
(function () {
  "use strict";

  // --- Config -------------------------------------------------
  // Replace with your deployed Apps Script /exec URL after deploy.
  var ENDPOINT =
    window.AGIH_NEWSLETTER_ENDPOINT ||
    "REPLACE_WITH_APPS_SCRIPT_WEB_APP_URL";

  var STORAGE_DISMISSED = "agih_nl_dismissed";
  var STORAGE_SUBSCRIBED = "agih_nl_subscribed";
  var SHOW_AFTER_MS = 2500; // gentle delay before first reveal
  var SHOW_AFTER_SCROLL = 350; // or once the user scrolls this far

  var IS_DEV =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.protocol === "file:";
  var ENDPOINT_CONFIGURED =
    ENDPOINT && ENDPOINT.indexOf("REPLACE_WITH") === -1;

  // Don't show if already handled.
  function flag(key) {
    try {
      return window.localStorage.getItem(key) === "1";
    } catch (e) {
      return false;
    }
  }
  function setFlag(key) {
    try {
      window.localStorage.setItem(key, "1");
    } catch (e) {}
  }
  if (flag(STORAGE_DISMISSED) || flag(STORAGE_SUBSCRIBED)) return;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // --- Styles -------------------------------------------------
  var css =
    "" +
    "#agih-nl{position:fixed;left:0;right:0;bottom:0;z-index:9000;" +
    "font-family:'Raleway',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;" +
    "background:#0c0c0e;color:#f5f5f2;border-top:1px solid rgba(255,255,255,.14);" +
    "box-shadow:0 -12px 40px rgba(0,0,0,.35);transform:translateY(110%);" +
    "transition:transform .55s cubic-bezier(.16,1,.3,1);will-change:transform}" +
    "#agih-nl.agih-nl--in{transform:translateY(0)}" +
    "#agih-nl .agih-nl__inner{max-width:1180px;margin:0 auto;padding:14px 22px;" +
    "display:flex;align-items:center;gap:18px;flex-wrap:wrap}" +
    "#agih-nl .agih-nl__copy{flex:1 1 280px;min-width:240px}" +
    "#agih-nl .agih-nl__kicker{font-family:'Cinzel',serif;letter-spacing:.18em;" +
    "text-transform:uppercase;font-size:11px;color:#c9b27a;margin:0 0 3px}" +
    "#agih-nl .agih-nl__line{font-size:14px;line-height:1.45;color:#e7e7e2;margin:0}" +
    "#agih-nl .agih-nl__line b{color:#fff;font-weight:600}" +
    "#agih-nl form{display:flex;align-items:center;gap:10px;flex:1 1 380px;" +
    "justify-content:flex-end;flex-wrap:wrap}" +
    "#agih-nl input[type=email]{flex:1 1 240px;min-width:200px;height:44px;" +
    "padding:0 16px;border-radius:2px;border:1px solid rgba(255,255,255,.22);" +
    "background:#161618;color:#fff;font-size:14px;outline:none;" +
    "transition:border-color .2s,background .2s}" +
    "#agih-nl input[type=email]::placeholder{color:#8a8a86}" +
    "#agih-nl input[type=email]:focus{border-color:#c9b27a;background:#1c1c1f}" +
    "#agih-nl button.agih-nl__submit{height:44px;padding:0 24px;border:0;cursor:pointer;" +
    "border-radius:2px;background:#c9b27a;color:#161009;font-weight:700;font-size:13px;" +
    "letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;" +
    "transition:background .2s,transform .05s}" +
    "#agih-nl button.agih-nl__submit:hover{background:#d8c48c}" +
    "#agih-nl button.agih-nl__submit:active{transform:translateY(1px)}" +
    "#agih-nl button.agih-nl__submit[disabled]{opacity:.6;cursor:default}" +
    "#agih-nl .agih-nl__close{position:absolute;top:8px;right:10px;width:26px;height:26px;" +
    "border:0;background:transparent;color:#9a9a96;font-size:18px;line-height:1;cursor:pointer;" +
    "border-radius:50%}" +
    "#agih-nl .agih-nl__close:hover{color:#fff;background:rgba(255,255,255,.08)}" +
    "#agih-nl .agih-nl__msg{font-size:13px;margin:0;min-height:1px}" +
    "#agih-nl .agih-nl__msg--err{color:#ff9b8a}" +
    "#agih-nl .agih-nl__hp{position:absolute;left:-9999px;width:1px;height:1px;" +
    "overflow:hidden;opacity:0}" +
    "#agih-nl.agih-nl--done .agih-nl__inner{justify-content:center;text-align:center}" +
    "@media (max-width:640px){#agih-nl .agih-nl__inner{padding:14px 18px 16px}" +
    "#agih-nl form{justify-content:stretch}" +
    "#agih-nl button.agih-nl__submit{flex:1 1 120px}}" +
    "@media (prefers-reduced-motion:reduce){#agih-nl{transition:none}}";

  var style = document.createElement("style");
  style.setAttribute("data-agih-nl", "");
  style.appendChild(document.createTextNode(css));

  // --- Markup -------------------------------------------------
  var bar = document.createElement("div");
  bar.id = "agih-nl";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Subscribe to the AGI House newsletter");
  bar.innerHTML =
    '<button type="button" class="agih-nl__close" aria-label="Dismiss">&times;</button>' +
    '<div class="agih-nl__inner">' +
    '<div class="agih-nl__copy">' +
    '<p class="agih-nl__kicker">AGI House</p>' +
    '<p class="agih-nl__line"><b>Get the drop on every hackathon, dinner &amp; demo day.</b> ' +
    "Join the builders shaping the intelligence age.</p>" +
    "</div>" +
    '<form novalidate>' +
    '<label class="agih-nl__hp" aria-hidden="true">Company<input type="text" name="company" tabindex="-1" autocomplete="off"></label>' +
    '<input type="email" name="email" required autocomplete="email" ' +
    'placeholder="you@email.com" aria-label="Email address" />' +
    '<button type="submit" class="agih-nl__submit">Subscribe</button>' +
    "</form>" +
    "</div>";

  function mount() {
    if (document.getElementById("agih-nl")) return;
    document.head.appendChild(style);
    document.body.appendChild(bar);
    wire();
    scheduleReveal();
  }

  function reveal() {
    bar.classList.add("agih-nl--in");
  }
  function scheduleReveal() {
    var shown = false;
    function go() {
      if (shown) return;
      shown = true;
      reveal();
      window.removeEventListener("scroll", onScroll);
    }
    function onScroll() {
      if (window.pageYOffset > SHOW_AFTER_SCROLL) go();
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.setTimeout(go, SHOW_AFTER_MS);
  }

  function dismiss() {
    bar.classList.remove("agih-nl--in");
    setFlag(STORAGE_DISMISSED);
    window.setTimeout(function () {
      if (bar.parentNode) bar.parentNode.removeChild(bar);
    }, 600);
  }

  function showMsg(text, isErr) {
    var inner = bar.querySelector(".agih-nl__inner");
    inner.innerHTML =
      '<div class="agih-nl__copy" style="flex:1 1 100%;text-align:center">' +
      '<p class="agih-nl__kicker">' +
      (isErr ? "Hmm" : "You're in") +
      "</p>" +
      '<p class="agih-nl__line ' +
      (isErr ? "agih-nl__msg--err" : "") +
      '">' +
      text +
      "</p></div>";
    bar.classList.add("agih-nl--done");
  }

  function send(payload) {
    if (!ENDPOINT_CONFIGURED) {
      // Dev / not-yet-deployed: log and resolve so the UX is demoable.
      if (window.console) console.info("[agih-nl] (dev) would POST", payload);
      return Promise.resolve();
    }
    // Apps Script web apps don't return CORS headers, so we fire a
    // simple (no-preflight) text/plain POST and treat it as success
    // once it leaves the browser. Validation + honeypot run client-side;
    // Beehiiv de-dupes server-side.
    return fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  }

  function wire() {
    bar.querySelector(".agih-nl__close").addEventListener("click", dismiss);

    var form = bar.querySelector("form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var emailEl = form.querySelector('input[name="email"]');
      var honeypot = form.querySelector('input[name="company"]');
      var btn = form.querySelector("button.agih-nl__submit");
      var email = (emailEl.value || "").trim();

      if (honeypot && honeypot.value) {
        // Bot filled the hidden field — pretend success, drop silently.
        showMsg("Thanks &mdash; you're on the list.");
        setFlag(STORAGE_SUBSCRIBED);
        return;
      }
      if (!EMAIL_RE.test(email)) {
        emailEl.focus();
        emailEl.style.borderColor = "#ff9b8a";
        return;
      }

      btn.disabled = true;
      btn.textContent = "Subscribing…";

      var payload = {
        email: email,
        source: "Newsletter — agihouse.ai sticky bar",
        page: location.pathname,
        referrer: document.referrer || "",
        ts: new Date().toISOString(),
      };

      send(payload)
        .then(function () {
          setFlag(STORAGE_SUBSCRIBED);
          showMsg(
            "Welcome to AGI House. Check your inbox to confirm &mdash; see you at the next one."
          );
          window.setTimeout(function () {
            bar.classList.remove("agih-nl--in");
          }, 6000);
        })
        .catch(function () {
          // no-cors never rejects in practice; this is a safety net.
          setFlag(STORAGE_SUBSCRIBED);
          showMsg("Welcome to AGI House &mdash; you're on the list.");
        });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
