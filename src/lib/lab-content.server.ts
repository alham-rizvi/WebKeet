// Full written content for every seeded lab. Server-only so solutions never ship to the browser.
export type LabContent={description:string;scenario:string;objectives:string[];prerequisites:string[];tools:string[];hints:string[];solution:string;tags:string[]};
export const LAB_CONTENT: Record<string, LabContent> = {
 "sql-injection-fundamentals": {
  "description": "Your first hands-on look at classical SQL injection. The lab presents a login form that concatenates the username and password into a query. You will craft payloads that alter the query logic, bypass authentication, and read data from tables the application never intended to expose. By the end you should understand why every modern framework insists on parameterized queries and how a single missing placeholder becomes an account takeover.",
  "scenario": "A small e-commerce site is preparing to launch. QA gave it the green light. Your job on the pre-launch review is to prove that the login page cannot be bypassed and that the search endpoint cannot be turned into a data-exfiltration primitive.",
  "objectives": [
   "Bypass login using a tautology payload",
   "Enumerate table names from the current schema",
   "Read a row from a table the account is not authorized for",
   "Explain in one paragraph how a prepared statement would prevent every attempt above"
  ],
  "prerequisites": [
   "Comfortable reading basic HTML forms",
   "Have opened browser developer tools once"
  ],
  "tools": [
   "Browser",
   "Burp Suite Community (optional)",
   "The lab terminal"
  ],
  "hints": [
   "Try `' OR 1=1 --` in the username field and leave password blank.",
   "The application echoes SQL errors \u2014 read them, they name columns.",
   "UNION SELECT lets you pull data from another table once you know its column count."
  ],
  "solution": "The vulnerable code builds SQL by string concatenation. Replace the query with a prepared statement using placeholders and bind the user input. Reject inputs that fail a positive-character allowlist for usernames. Return a generic 'invalid credentials' message so error messages stop leaking the schema.",
  "tags": [
   "injection",
   "owasp-a03",
   "sqli"
  ]
 },
 "blind-sqli-time": {
  "description": "The application no longer echoes database errors and returns identical pages for valid and invalid requests. Extraction now depends on measuring response times. You will build a boolean oracle out of `IF(...) SLEEP(1)`, then extract a full column character by character. This lab teaches patience, scripting instinct, and why 'errors are hidden' is not a defense.",
  "scenario": "An audit found a search endpoint that appears sanitized. The security team wants proof that the input still reaches the database engine before it accepts the developer's mitigation.",
  "objectives": [
   "Confirm the injection point using a time delay",
   "Determine the length of the current database name",
   "Extract the admin password hash one character at a time",
   "Rewrite the offending fragment as a parameterized query"
  ],
  "prerequisites": [
   "Completed SQL Injection Fundamentals",
   "Basic Python or a similar scripting language"
  ],
  "tools": [
   "Browser",
   "curl",
   "Python 3",
   "sqlmap (allowed as a sanity check only)"
  ],
  "hints": [
   "`AND IF(1=1, SLEEP(2), 0)` is your oracle.",
   "Binary search on ASCII values converges much faster than linear.",
   "Automate with a short Python script; don't do this by hand."
  ],
  "solution": "Rewrite the query with placeholders. Add a query timeout at the database driver so a single request cannot execute a five-second sleep. Rate-limit the endpoint and alert on unusual response-time distributions.",
  "tags": [
   "injection",
   "blind",
   "time-based",
   "owasp-a03"
  ]
 },
 "reflected-xss": {
  "description": "The search parameter is reflected into the page without encoding. A well-crafted URL therefore executes JavaScript in a victim's browser. You will confirm the reflection, break out of the surrounding HTML context, and pop a proof-of-concept alert. The lesson is not the alert box \u2014 it is that the same primitive can steal a session cookie or drive a targeted phishing attack.",
  "scenario": "A support engineer forwarded a link a customer 'clicked by accident'. Recreate the reflection so the team understands why the customer's account was later drained.",
  "objectives": [
   "Locate the reflection point",
   "Bypass a naive keyword filter that blocks `<script>`",
   "Execute JavaScript from a crafted URL",
   "Draft a report describing the impact for a non-technical audience"
  ],
  "prerequisites": [
   "Familiarity with basic HTML"
  ],
  "tools": [
   "Browser DevTools",
   "URL encoder"
  ],
  "hints": [
   "Try the search box with an HTML tag first, not a script tag.",
   "`<img src=x onerror=alert(1)>` avoids the word 'script'.",
   "Encode the payload if the browser mangles special characters in the URL."
  ],
  "solution": "Encode all output for the correct context (HTML body, attribute, or JavaScript). Set a strict Content-Security-Policy that forbids inline scripts. Add a WAF rule as depth, never as the only line of defense.",
  "tags": [
   "xss",
   "reflected",
   "owasp-a03"
  ]
 },
 "stored-xss-reviews": {
  "description": "Reviews are stored server-side and rendered to every visitor. A payload that survives sanitization runs against every user who loads the page \u2014 including administrators. You will land a persistent payload, capture a session-scoped token, and demonstrate why stored XSS is treated as a critical severity even without a network exploit chain.",
  "scenario": "A reviewer left a suspicious rating and the marketing team noticed unusual clicks from the admin panel later that day. Reproduce the attack path end to end.",
  "objectives": [
   "Submit a review that escapes the sanitizer",
   "Exfiltrate the current user's authentication token to a listener",
   "Explain the difference between stored and reflected XSS impact",
   "Propose an output-encoding fix specific to the templating engine in use"
  ],
  "prerequisites": [
   "Reflected XSS lab completed"
  ],
  "tools": [
   "Browser DevTools",
   "A public HTTPS listener (RequestBin, ngrok)",
   "Burp Repeater (optional)"
  ],
  "hints": [
   "Try event handlers on tags the sanitizer allows.",
   "Encoding the payload as HTML entities in the request bypasses one common filter.",
   "Once execution lands, `fetch()` back to your listener with `document.cookie`."
  ],
  "solution": "Sanitize on input with a strict allowlist (DOMPurify or the framework equivalent) and encode on output. Set `HttpOnly` on session cookies so `document.cookie` cannot read them, and configure a Content-Security-Policy that blocks outbound requests to unexpected origins.",
  "tags": [
   "xss",
   "stored",
   "owasp-a03"
  ]
 },
 "csrf-profile-update": {
  "description": "The profile-update endpoint accepts requests without a token or origin check. You will host a page that a signed-in victim's browser silently submits, changing their registered email to one you control. This lab makes the case for token-based or SameSite protection with a single working demo.",
  "scenario": "A support ticket claims 'someone else' changed a customer's contact email overnight. Prove that a click on a crafted link is enough.",
  "objectives": [
   "Build a self-submitting HTML form that targets the endpoint",
   "Confirm the change against a logged-in test account",
   "Contrast SameSite=Lax and a synchronizer token",
   "Add the correct mitigation to the offending route"
  ],
  "prerequisites": [
   "Familiar with HTTP methods and cookies"
  ],
  "tools": [
   "Browser",
   "A tiny HTTP server (e.g. `python -m http.server`)"
  ],
  "hints": [
   "The form must POST from a different origin than the target.",
   "Cookies still ride along unless SameSite is set.",
   "Set `enctype` correctly or the server may reject the body."
  ],
  "solution": "Require an unpredictable CSRF token on every state-changing request. Set `SameSite=Lax` (or `Strict`) on the session cookie. Verify the `Origin` header for sensitive endpoints.",
  "tags": [
   "csrf",
   "owasp-a01"
  ]
 },
 "idor-invoice": {
  "description": "The invoice endpoint uses a numeric identifier in the URL and no ownership check. Incrementing the number returns another customer's invoice. You will enumerate identifiers, capture data that never should have been readable, and understand why authorization must be evaluated on the server for every object.",
  "scenario": "A customer noticed that changing a digit in the URL loaded a stranger's invoice. Confirm the scope of what an unauthenticated user can read.",
  "objectives": [
   "Enumerate invoice identifiers",
   "Retrieve a record that does not belong to your account",
   "Recommend an authorization check appropriate for the endpoint",
   "Explain why obfuscated identifiers alone are not a fix"
  ],
  "prerequisites": [
   "Basic HTTP knowledge"
  ],
  "tools": [
   "Browser",
   "curl"
  ],
  "hints": [
   "The identifier looks sequential \u2014 try nearby values.",
   "UUIDs alone do not fix this; they only slow enumeration.",
   "The fix belongs on the server, not in the URL."
  ],
  "solution": "Check on every read that the requesting user owns the object or has an explicit role that permits access. Log denied attempts and alert on bulk enumeration.",
  "tags": [
   "idor",
   "owasp-a01",
   "authz"
  ]
 },
 "xxe-upload": {
  "description": "The upload endpoint parses XML with external entities enabled. A crafted document reads local files or triggers outbound requests from the server. You will exfiltrate `/etc/passwd` and then a configuration file, and disable the vulnerable parser feature at the end.",
  "scenario": "An integration partner sends orders as XML. A code review flagged the parser configuration and asked for a proof of impact.",
  "objectives": [
   "Send an XML document that includes an external DOCTYPE",
   "Read a file from the server's filesystem",
   "Attempt an out-of-band exfiltration channel",
   "Disable external entity resolution in the parser"
  ],
  "prerequisites": [
   "Basic XML familiarity"
  ],
  "tools": [
   "curl",
   "Burp Repeater",
   "A public HTTP listener"
  ],
  "hints": [
   "The magic lives in the DOCTYPE.",
   "`SYSTEM \"file:///etc/passwd\"` is the classic payload.",
   "If direct reads fail, try out-of-band via a URL entity."
  ],
  "solution": "Disable DTDs entirely on the XML parser (`FEATURE_SECURE_PROCESSING`, `disallow-doctype-decl`). Prefer JSON where possible. Never trust content-type headers alone \u2014 validate structure.",
  "tags": [
   "xxe",
   "owasp-a05"
  ]
 },
 "ssrf-metadata": {
  "description": "The 'fetch preview' feature takes a URL and returns the response body. In a cloud environment this becomes a bridge to the instance metadata service and any credentials it hands out. You will point the endpoint at 169.254.169.254, retrieve temporary credentials, and demonstrate the pivot to cloud APIs.",
  "scenario": "A backend engineer is proud of a new URL-preview feature. Show the team the credential-theft risk before it ships.",
  "objectives": [
   "Fingerprint the URL fetcher for allowed schemes",
   "Reach the cloud metadata endpoint from the target",
   "Retrieve a temporary access key",
   "Design an allowlist-based fix that survives DNS rebinding"
  ],
  "prerequisites": [
   "Aware of how cloud instance credentials work",
   "Comfortable reading HTTP headers"
  ],
  "tools": [
   "curl",
   "Browser",
   "A DNS rebinding harness (optional)"
  ],
  "hints": [
   "Metadata lives at 169.254.169.254 for most cloud vendors.",
   "IMDSv2 requires a token \u2014 read the documentation.",
   "A blocklist of IPs is not enough; DNS can point anywhere."
  ],
  "solution": "Move URL fetching to a dedicated egress proxy that enforces an allowlist. Block link-local and private address ranges after DNS resolution, not before. Enforce IMDSv2 on the cloud side.",
  "tags": [
   "ssrf",
   "cloud",
   "owasp-a10"
  ]
 },
 "path-traversal-download": {
  "description": "The download endpoint takes a filename and reads it from a directory. Adding `../` climbs out and reveals unrelated files. You will read a configuration file the endpoint never intended to expose and then apply a canonical-path check.",
  "scenario": "A customer downloaded 'anything.txt' and got a database backup. Reproduce the bug and propose the fix.",
  "objectives": [
   "Confirm the traversal primitive",
   "Read a file two directories above the intended root",
   "Bypass a naive `..` filter using encoding",
   "Rewrite the path resolution using a canonical-path check"
  ],
  "prerequisites": [
   "Basic HTTP knowledge"
  ],
  "tools": [
   "Browser",
   "curl"
  ],
  "hints": [
   "`..%2f` sometimes bypasses a filter looking for literal `..`.",
   "Try double-URL-encoding as well.",
   "Resolve the path, then check that it stays inside the safe root."
  ],
  "solution": "Resolve the requested path against a fixed root and reject anything outside. Never build paths by string concatenation. Serve downloads through an identifier-to-file lookup rather than a raw filename.",
  "tags": [
   "path-traversal",
   "owasp-a01"
  ]
 },
 "insecure-deserialization": {
  "description": "The session cookie is a serialized Java object. Replacing it with a gadget-chain payload leads to remote code execution. You will craft the payload with ysoserial, land the shell, and then swap the format for a signed JSON token.",
  "scenario": "A legacy monolith stores its session state in a serialized cookie. The re-platform is a year away. What can go wrong in the meantime?",
  "objectives": [
   "Identify the serialization format from the cookie",
   "Generate a gadget-chain payload",
   "Achieve code execution against the target",
   "Design a safe replacement using signed JSON"
  ],
  "prerequisites": [
   "Comfortable with Java basics",
   "Familiar with base64"
  ],
  "tools": [
   "ysoserial",
   "curl",
   "openssl"
  ],
  "hints": [
   "`CommonsCollections1` is the classic gadget chain for older classpaths.",
   "The cookie is base64 \u2014 decode it first to fingerprint the format.",
   "Verify the vulnerability with a benign payload before RCE."
  ],
  "solution": "Do not deserialize untrusted input in a format that carries type information. Move to signed JSON, verify signatures with a rotating key, and add integrity checks around anything that must round-trip through the client.",
  "tags": [
   "deserialization",
   "rce",
   "owasp-a08"
  ]
 },
 "unrestricted-upload": {
  "description": "The upload endpoint trusts the client-provided extension. Uploading a script with a permitted extension and then requesting it as an executable route yields code execution. You will land a small web shell, retrieve the flag, and then apply layered mitigations.",
  "scenario": "A marketing team wants to accept resume uploads on the careers page. Prove why 'we check the extension client-side' is not enough.",
  "objectives": [
   "Bypass client-side extension validation",
   "Upload a file that executes server-side",
   "Retrieve the placed flag",
   "Add server-side content-type and content-inspection checks"
  ],
  "prerequisites": [
   "Familiar with HTTP multipart uploads"
  ],
  "tools": [
   "Burp Suite",
   "curl"
  ],
  "hints": [
   "Client-side JavaScript checks lose the moment you use curl.",
   "Some servers execute based on the actual content, not the extension.",
   "Store uploads outside the web root and serve them through a controller."
  ],
  "solution": "Validate the file with a magic-byte inspector on the server, store uploads outside the web root, generate the served name yourself, and never execute files from user-writable directories.",
  "tags": [
   "upload",
   "rce",
   "owasp-a04"
  ]
 },
 "open-redirect": {
  "description": "The login flow accepts a `next` parameter and redirects to it verbatim. An attacker can send victims through the trusted domain to an attacker-controlled page \u2014 the ideal phishing setup. You will craft the URL, understand why it survives most spam filters, and add a strict allowlist.",
  "scenario": "The security team keeps seeing 'from our own domain' phishing links in reports. Reproduce the primitive and remove it.",
  "objectives": [
   "Craft a login link that lands on an external domain after sign-in",
   "Explain why the browser address bar looks trusted",
   "Implement an allowlist-based redirect target",
   "Log unusual redirect targets for review"
  ],
  "prerequisites": [
   "Basic URL familiarity"
  ],
  "tools": [
   "Browser"
  ],
  "hints": [
   "Look for `?next=`, `?redirect=`, `?returnUrl=` and friends.",
   "Absolute URLs are the usual bypass path.",
   "Only accept destinations that match a fixed prefix or host list."
  ],
  "solution": "Only accept redirect targets that match a strict allowlist of internal paths. If external targets are ever required, mark them with an interstitial page.",
  "tags": [
   "phishing",
   "owasp-a01"
  ]
 },
 "clickjacking-basics": {
  "description": "The account-settings page has no framing protection. An attacker can iframe it, overlay a decoy UI, and trick a signed-in victim into clicking the 'Delete account' button. You will build the demo page and then add framing protection.",
  "scenario": "A user reported that their account was deleted by 'a game they played'. Prove that clickjacking is the mechanism.",
  "objectives": [
   "Frame the vulnerable page from your own origin",
   "Overlay a decoy that hides the true target",
   "Confirm a click reaches the underlying button",
   "Add the correct framing protection"
  ],
  "prerequisites": [
   "Basic HTML and CSS"
  ],
  "tools": [
   "Browser"
  ],
  "hints": [
   "`opacity: 0` on the iframe is your friend.",
   "Line up the decoy with the real button using `position: absolute`.",
   "`X-Frame-Options: DENY` or a CSP `frame-ancestors` directive stops this."
  ],
  "solution": "Set `Content-Security-Policy: frame-ancestors 'none'` on state-changing pages, add `X-Frame-Options: DENY` for legacy browsers, and require re-authentication for account deletion.",
  "tags": [
   "clickjacking",
   "owasp-a05"
  ]
 },
 "broken-auth-bypass": {
  "description": "The application distinguishes users by a hidden form field returned after login. Tampering with that field switches identities without re-authenticating. You will confirm the flaw, escalate to an admin account, and design a stateful session as the fix.",
  "scenario": "An intern noticed that the admin dashboard loads if you 'edit the page a little'. Confirm the report as either a critical bug or a false alarm.",
  "objectives": [
   "Locate the identity-carrying field",
   "Tamper with it to escalate privileges",
   "Retrieve an admin-only resource",
   "Design a stateful, server-verified session"
  ],
  "prerequisites": [
   "Familiar with browser cookies and DevTools"
  ],
  "tools": [
   "Browser DevTools",
   "Burp Suite"
  ],
  "hints": [
   "The identifier is on the client \u2014 try changing it.",
   "Server-side authorization must not trust client-provided identity.",
   "Session identifiers should be opaque and server-verified."
  ],
  "solution": "Store the authenticated identity in a server-side session store, keyed by an opaque identifier. Re-check role on every request. Rotate the session id on privilege change.",
  "tags": [
   "auth",
   "owasp-a07"
  ]
 },
 "jwt-none-algorithm": {
  "description": "The API accepts JWTs with the `none` algorithm because the verifier is misconfigured. Rewriting the header and dropping the signature yields an admin token. You will produce the token, exercise a privileged endpoint, and switch the verifier to a strict allowlist.",
  "scenario": "A partner API team is proud of its 'stateless auth'. Show that the verifier accepts unsigned tokens.",
  "objectives": [
   "Decode a valid token and identify claims",
   "Forge a token with `alg=none`",
   "Reach an admin endpoint using the forged token",
   "Configure the verifier to accept only expected algorithms"
  ],
  "prerequisites": [
   "Familiar with base64 and JSON"
  ],
  "tools": [
   "jwt.io",
   "curl"
  ],
  "hints": [
   "Header, payload, signature are base64url \u2014 the signature can be empty.",
   "Set `alg` to `none` in the header.",
   "Fix: pass an explicit algorithm list to the verifier."
  ],
  "solution": "Configure JWT verifiers with an explicit algorithm allowlist, never accept `none`, and prefer asymmetric signatures with rotating keys.",
  "tags": [
   "jwt",
   "auth",
   "owasp-a02"
  ]
 },
 "oauth-redirect-uri": {
  "description": "The OAuth provider does a prefix match on the registered redirect URI. An attacker registers a lookalike path, phishes a victim into consenting, and captures the authorization code. You will build the attack path and repair the registration.",
  "scenario": "A partner OAuth integration went live last week. Prove that a subtle configuration mistake makes it dangerous.",
  "objectives": [
   "Enumerate the registered redirect URIs",
   "Identify a prefix or wildcard weakness",
   "Capture an authorization code and exchange it for a token",
   "Rewrite the registration to require an exact match"
  ],
  "prerequisites": [
   "Familiar with OAuth 2.0 authorization-code flow"
  ],
  "tools": [
   "Browser",
   "curl",
   "A public HTTPS callback host"
  ],
  "hints": [
   "A single trailing slash difference matters.",
   "The `state` parameter should also be checked.",
   "Match the redirect URI exactly, byte for byte."
  ],
  "solution": "Register redirect URIs with exact string matching, disable wildcards, verify `state` for CSRF, and short-lived authorization codes should be single-use.",
  "tags": [
   "oauth",
   "auth",
   "owasp-a05"
  ]
 },
 "password-reset-token": {
  "description": "The reset token is derived from the user id and a timestamp with second precision. That is a small enough keyspace to brute-force. You will predict a token, take over an account, and swap the generator for a cryptographically secure one.",
  "scenario": "A support engineer noticed reset links look 'a bit similar'. Determine whether that observation is a security incident waiting to happen.",
  "objectives": [
   "Recover the token format by requesting several resets",
   "Predict a valid token for another account",
   "Confirm account takeover on a test victim",
   "Replace the generator with `crypto.randomBytes(32)` or equivalent"
  ],
  "prerequisites": [
   "Basic scripting comfort"
  ],
  "tools": [
   "curl",
   "Python 3"
  ],
  "hints": [
   "Request several resets and diff the tokens.",
   "A second of jitter is a very small space.",
   "Use a cryptographic RNG and enforce single-use with a database record."
  ],
  "solution": "Generate reset tokens from a cryptographically secure RNG, store the hash server-side, expire quickly and enforce single use. Invalidate all sessions on password change.",
  "tags": [
   "auth",
   "reset",
   "owasp-a07"
  ]
 },
 "bola-crapi": {
  "description": "The vehicle-details endpoint checks that the caller is authenticated but not that they own the requested vehicle. Changing the identifier in the URL returns any other customer's record. You will enumerate identifiers, extract data, and design an ownership check.",
  "scenario": "A crAPI customer noticed they can see other users' vehicle service records by clicking around. Confirm the impact.",
  "objectives": [
   "Discover the endpoint returning object data",
   "Confirm no ownership check exists",
   "Enumerate identifiers to prove scale",
   "Add an ownership check to the route"
  ],
  "prerequisites": [
   "Familiar with REST APIs and JWTs"
  ],
  "tools": [
   "curl",
   "Burp Repeater"
  ],
  "hints": [
   "Compare the JWT subject to the requested identifier.",
   "The endpoint responds identically for owned and non-owned records.",
   "Always assert ownership on the server, never on the client."
  ],
  "solution": "On every read, join with the caller's user id or evaluate a policy explicitly. Return 404 rather than 403 for unrelated identifiers to reduce information leakage.",
  "tags": [
   "api",
   "authz",
   "owasp-api1"
  ]
 },
 "mass-assignment": {
  "description": "The profile-update endpoint accepts the entire request body and binds it to the user model \u2014 including the `role` field. Sending an extra property elevates the caller to admin. You will confirm the flaw and refactor to an explicit allowlist DTO.",
  "scenario": "A junior developer bragged about 'not needing DTOs anymore'. Show why that decision is a critical bug.",
  "objectives": [
   "Send a profile update including an unexpected field",
   "Confirm the role changed to admin",
   "Reach an admin-only endpoint",
   "Refactor the handler to bind only explicit fields"
  ],
  "prerequisites": [
   "Familiar with Express or a similar framework"
  ],
  "tools": [
   "curl",
   "Postman"
  ],
  "hints": [
   "The vulnerable code likely calls `Object.assign(user, req.body)`.",
   "Every mutable field on the model is fair game.",
   "Explicit DTOs beat cleverness."
  ],
  "solution": "Accept only fields on an explicit allowlist for each endpoint. Never bind directly to the persistence model. Fail closed when unknown fields are present.",
  "tags": [
   "api",
   "authz",
   "owasp-api6"
  ]
 },
 "rate-limit-bypass": {
  "description": "The login endpoint enforces a rate limit by IP address using the `X-Forwarded-For` header directly. Spoofing that header resets the counter and enables credential stuffing. You will demonstrate the bypass and correct the trust boundary.",
  "scenario": "The team believes 'we already have rate limiting'. Show the difference between having a rate limit and having a correct one.",
  "objectives": [
   "Confirm rate limiting on the endpoint",
   "Bypass it by manipulating a request header",
   "Draft an attack rate that stays under a real limit",
   "Configure the proxy to strip untrusted forwarding headers"
  ],
  "prerequisites": [
   "Basic HTTP knowledge"
  ],
  "tools": [
   "curl",
   "Hydra (in demo mode only)"
  ],
  "hints": [
   "`X-Forwarded-For` from an untrusted source is client input.",
   "Strip or overwrite the header at the edge.",
   "Rate-limit on the authenticated identity, not just IP."
  ],
  "solution": "Only trust `X-Forwarded-For` from your own proxy. Rate-limit on the authenticated identity where possible and add anomaly detection on top of raw counters.",
  "tags": [
   "api",
   "rate-limit",
   "owasp-api4"
  ]
 },
 "graphql-introspection": {
  "description": "Introspection is enabled in production, exposing every type and field. Combined with a missing authorization on a sensitive query, this becomes a data-exfiltration primitive. You will map the schema, extract data, and lock down the endpoint.",
  "scenario": "A GraphQL API rolled out with 'sensible defaults'. Determine whether those defaults survive contact with a curious visitor.",
  "objectives": [
   "Fetch the introspection response",
   "Identify sensitive fields that are missing authorization",
   "Extract data via a targeted query",
   "Disable introspection in production and add field-level authorization"
  ],
  "prerequisites": [
   "Familiar with GraphQL basics"
  ],
  "tools": [
   "curl",
   "GraphiQL",
   "Postman"
  ],
  "hints": [
   "Introspection uses a special query \u2014 check the docs.",
   "Field-level checks matter as much as type-level checks.",
   "Persisted queries reduce accidental exposure."
  ],
  "solution": "Disable introspection outside development. Apply field-level authorization. Consider persisted queries and query cost limits to reduce blast radius.",
  "tags": [
   "api",
   "graphql",
   "owasp-api9"
  ]
 },
 "coupon-race": {
  "description": "The coupon-redemption endpoint checks for prior use, then records it \u2014 a classic time-of-check to time-of-use bug. Firing enough concurrent requests uses the same coupon many times. You will land the race, quantify the impact, and add a database-level guard.",
  "scenario": "Marketing keeps blaming 'weird redemption counts' on a broken export. Prove it is a race condition instead.",
  "objectives": [
   "Establish a baseline single-use redemption",
   "Fire concurrent requests and observe multiple successes",
   "Estimate the financial impact at scale",
   "Add a unique constraint to eliminate the race"
  ],
  "prerequisites": [
   "Basic scripting comfort"
  ],
  "tools": [
   "hey",
   "curl",
   "Python asyncio",
   "SQL client"
  ],
  "hints": [
   "Two requests can be 'first' at the same time.",
   "A unique constraint plus a transaction closes the window.",
   "Serial IDs at the application layer do not help."
  ],
  "solution": "Add a unique constraint on (user_id, coupon_id) or use a database-level lock. Roll the redemption and the order write into one transaction. Alert on unusually parallel usage.",
  "tags": [
   "logic",
   "race",
   "owasp-a04"
  ]
 },
 "privilege-escalation-vertical": {
  "description": "The admin route is hidden but not gated. Direct navigation grants access. You will discover the route, prove access, and add a role-based check that fails closed.",
  "scenario": "A pen test report said 'no authorization issues found'. Verify.",
  "objectives": [
   "Discover the hidden admin route",
   "Access it without an admin session",
   "Enumerate what a non-admin can reach",
   "Add a fail-closed authorization filter"
  ],
  "prerequisites": [
   "Basic HTTP familiarity"
  ],
  "tools": [
   "Browser",
   "dirb (for discovery)"
  ],
  "hints": [
   "Look at the JavaScript bundle for route names.",
   "Security by obscurity is not security.",
   "Default deny beats default allow."
  ],
  "solution": "Route-level authorization filters that fail closed. Verify role on every request. Never rely on menu items being hidden.",
  "tags": [
   "authz",
   "owasp-a01"
  ]
 },
 "cart-price-tampering": {
  "description": "The checkout endpoint accepts a `price` field from the client and trusts it. You will place an order at your own price, understand why the mistake is common in single-page apps, and rework the server to recompute totals.",
  "scenario": "A finance analyst spotted a 0.01 order. Reproduce the flaw.",
  "objectives": [
   "Locate the client-controlled price field",
   "Submit a modified value at checkout",
   "Recompute totals server-side",
   "Add an audit event when totals diverge"
  ],
  "prerequisites": [
   "Familiar with HTTP request tampering"
  ],
  "tools": [
   "Burp Suite",
   "Browser DevTools"
  ],
  "hints": [
   "Prices come from a catalog service, not the browser.",
   "Recompute totals from authoritative data.",
   "Log any client-supplied total that disagrees."
  ],
  "solution": "Recompute totals on the server from authoritative catalog data. Ignore client-provided totals or reject the request when they disagree.",
  "tags": [
   "logic",
   "owasp-a04"
  ]
 },
 "weak-md5": {
  "description": "The user table stores unsalted MD5 password hashes. A rainbow table cracks common ones in seconds. You will crack a set of hashes, understand why per-user salts alone are not enough, and migrate the schema to Argon2id.",
  "scenario": "A dumped table leaked online. Determine which accounts to force-reset first.",
  "objectives": [
   "Recognize MD5 hashes",
   "Crack a subset with an online rainbow table",
   "Explain why fast hashes are wrong for passwords",
   "Draft a migration to Argon2id with a rehash-on-login step"
  ],
  "prerequisites": [
   "Basic hex familiarity"
  ],
  "tools": [
   "hashcat",
   "John the Ripper"
  ],
  "hints": [
   "MD5 hashes are 32 hex characters.",
   "Fast hashes are a bug for password storage, not a feature.",
   "Rehash on login when migrating."
  ],
  "solution": "Migrate to Argon2id (or scrypt / bcrypt) with parameters tuned to current hardware. Rehash on successful login. Force-reset accounts still on legacy hashes after a deadline.",
  "tags": [
   "crypto",
   "passwords",
   "owasp-a02"
  ]
 },
 "ecb-mode": {
  "description": "An admin cookie is AES-encrypted in ECB mode. Identical plaintext blocks produce identical ciphertext blocks \u2014 you can see the structure without decrypting. You will exploit block-boundary alignment to elevate privileges and switch the app to AES-GCM.",
  "scenario": "A vendor is proud of 'AES encryption'. Show why the mode matters as much as the algorithm.",
  "objectives": [
   "Identify ECB from repeating ciphertext blocks",
   "Craft input that aligns a target block",
   "Rewrite a block to change stored data",
   "Migrate to AES-GCM with per-message nonces"
  ],
  "prerequisites": [
   "Familiar with block ciphers"
  ],
  "tools": [
   "Python 3",
   "hexdump"
  ],
  "hints": [
   "Repeating plaintext gives repeating ciphertext under ECB.",
   "Align a boundary by controlling one field.",
   "Authenticated encryption prevents this class of bugs."
  ],
  "solution": "Use AES-GCM (or ChaCha20-Poly1305) with unique nonces. Authenticate the ciphertext. Store keys in a KMS.",
  "tags": [
   "crypto",
   "owasp-a02"
  ]
 },
 "padding-oracle": {
  "description": "A CBC-mode endpoint returns distinguishable errors for padding versus content failures. That is enough to decrypt any ciphertext block by block. You will build the oracle, decrypt a token, and then fix the endpoint.",
  "scenario": "A legacy service still uses CBC and returns detailed error messages. Prove the impact before the rewrite.",
  "objectives": [
   "Distinguish padding errors from content errors",
   "Decrypt one block using the oracle",
   "Automate decryption of a full token",
   "Move the endpoint to authenticated encryption"
  ],
  "prerequisites": [
   "Completed the ECB lab",
   "Comfortable scripting in Python"
  ],
  "tools": [
   "Python 3",
   "curl"
  ],
  "hints": [
   "The error messages are the oracle.",
   "Work byte-by-byte from the end of the block.",
   "Authenticated encryption removes the oracle entirely."
  ],
  "solution": "Use AES-GCM with authenticated decryption failures returning a single generic error. Never leak padding details.",
  "tags": [
   "crypto",
   "padding-oracle",
   "owasp-a02"
  ]
 },
 "predictable-random": {
  "description": "Session tokens are generated with `Math.random()`. Given a few observed tokens you can recover state and predict future ones. You will confirm the pattern, forge a token for another user, and swap the generator for the OS CSPRNG.",
  "scenario": "A developer said 'we use random UUIDs'. Verify how they generate them.",
  "objectives": [
   "Collect several tokens and recover state",
   "Predict the next token",
   "Take over a target session",
   "Swap the generator for `crypto.getRandomValues`"
  ],
  "prerequisites": [
   "Basic scripting comfort"
  ],
  "tools": [
   "Python 3",
   "Node.js"
  ],
  "hints": [
   "`Math.random` is not cryptographic.",
   "OS-level entropy sources are the correct choice.",
   "UUID version matters; v4 from a good RNG is fine."
  ],
  "solution": "Generate session tokens from `crypto.randomBytes(32)` / `crypto.getRandomValues`. Rotate on privilege change. Store hash server-side.",
  "tags": [
   "crypto",
   "owasp-a02"
  ]
 },
 "exposed-bucket": {
  "description": "A staging bucket is configured for public list-and-read. Anyone with the URL can enumerate its contents. You will locate the bucket from a leaked reference, list its contents, retrieve a sensitive file, and lock it down.",
  "scenario": "An old blog post included a screenshot with a bucket URL in the corner. Estimate what it still exposes.",
  "objectives": [
   "Locate the bucket URL",
   "List its contents anonymously",
   "Download a file that should not be public",
   "Apply a private ACL and a bucket policy that denies public access"
  ],
  "prerequisites": [
   "Basic cloud storage familiarity"
  ],
  "tools": [
   "curl",
   "aws-cli (or a compatible client)"
  ],
  "hints": [
   "Object storage often speaks XML for listings.",
   "Bucket policies and ACLs are separate layers \u2014 check both.",
   "Block public access at the account level as depth."
  ],
  "solution": "Deny public access at the account level, keep buckets private by default, use pre-signed URLs for sharing, and monitor for policy changes.",
  "tags": [
   "cloud",
   "storage",
   "owasp-a05"
  ]
 },
 "docker-socket": {
  "description": "A container has `/var/run/docker.sock` mounted read-write. That is equivalent to root on the host. You will confirm the mount, spawn a privileged container, and remove the mount.",
  "scenario": "An SRE 'just wanted to see container stats'. Show why that shortcut is a full host compromise.",
  "objectives": [
   "Confirm the socket is mounted inside the container",
   "Spawn a new container with the host filesystem mounted",
   "Read a file from the host",
   "Redesign the metrics collection without the socket"
  ],
  "prerequisites": [
   "Comfortable with Docker basics"
  ],
  "tools": [
   "docker CLI (inside the lab container)",
   "curl"
  ],
  "hints": [
   "`docker.sock` speaks the Docker API.",
   "A new container with `--privileged` and a host bind is effectively root on the host.",
   "Metrics can be collected without socket access."
  ],
  "solution": "Never mount the Docker socket into an application container. Use a metrics agent with a scoped API surface. Enforce with an admission controller.",
  "tags": [
   "cloud",
   "container",
   "owasp-a05"
  ]
 },
 "iam-over-permissive": {
  "description": "A service role is attached with `*:*` permissions. Any compromise of the workload becomes account-wide. You will enumerate what the role can do, demonstrate an unrelated action, and tighten the policy.",
  "scenario": "A quick 'we'll scope it later' decision made it to production. Show what 'later' costs.",
  "objectives": [
   "Enumerate the role's effective permissions",
   "Perform an unrelated action to prove the scope",
   "Draft a minimum-required policy",
   "Apply the tighter policy and verify the workload still functions"
  ],
  "prerequisites": [
   "Familiar with cloud IAM basics"
  ],
  "tools": [
   "cloud CLI",
   "policy simulator"
  ],
  "hints": [
   "Star wildcards are a smell.",
   "Deny statements can plug a widely-open allow.",
   "Least privilege is iterative \u2014 start narrow and add."
  ],
  "solution": "Grant only the actions and resources the workload needs. Review with an IAM analyzer, and add a deny guardrail for destructive actions.",
  "tags": [
   "cloud",
   "iam",
   "owasp-a05"
  ]
 },
 "git-secrets": {
  "description": "A repository contains a rotated-looking `.env` in HEAD but the previous version, with a live API key, is still in the history. You will scan the history, retrieve the key, and reset it correctly.",
  "scenario": "A junior engineer says 'I already removed the secret'. Confirm whether that is true.",
  "objectives": [
   "Clone the repository",
   "Scan history for secrets",
   "Retrieve the exposed value",
   "Rotate the credential and rewrite history correctly"
  ],
  "prerequisites": [
   "Basic git familiarity"
  ],
  "tools": [
   "git",
   "gitleaks",
   "truffleHog"
  ],
  "hints": [
   "`git log -p` still shows what was removed.",
   "Rewriting history requires a force push and coordinated rotation.",
   "Rotate the credential; a rewrite alone does not invalidate it."
  ],
  "solution": "Rotate the credential first, then rewrite history and force push. Add a pre-commit secret scanner. Store secrets in a dedicated manager, not in the repository.",
  "tags": [
   "cloud",
   "secrets",
   "owasp-a05"
  ]
 },
 "suid-abuse": {
  "description": "A system administrator marked a helper binary SUID root to 'save time'. That binary calls out to a script the current user can rewrite. Chaining the two grants a root shell. You will enumerate SUID binaries, execute the chain, and clean up the permission.",
  "scenario": "You have a shell on a jump host. Determine whether local privilege escalation is trivial.",
  "objectives": [
   "List SUID binaries",
   "Identify one that invokes user-writable content",
   "Escalate to root",
   "Fix the permission and audit the rest"
  ],
  "prerequisites": [
   "Basic Linux command-line comfort"
  ],
  "tools": [
   "Terminal",
   "GTFOBins"
  ],
  "hints": [
   "`find / -perm -4000 -type f 2>/dev/null` is your friend.",
   "Look at the strings inside the binary for user-writable paths.",
   "Never SUID scripts; audit binaries carefully."
  ],
  "solution": "Remove SUID from unnecessary binaries. Prefer `sudo` with narrow rules or `capabilities` for the specific privilege needed. Audit regularly.",
  "tags": [
   "linux",
   "privesc"
  ]
 },
 "cron-hijack": {
  "description": "Root runs `/opt/backup.sh` every minute. That file is writable by a low-privileged group. You will rewrite it, wait for the next tick, and land root. Then you will lock down ownership and permissions.",
  "scenario": "An old backup script survived a directory reorganization. Verify whether it is still safe.",
  "objectives": [
   "Identify writable files invoked by root cron",
   "Rewrite the script to obtain a root shell",
   "Confirm privilege escalation",
   "Correct ownership and mode"
  ],
  "prerequisites": [
   "Basic Linux comfort"
  ],
  "tools": [
   "Terminal"
  ],
  "hints": [
   "Check `/etc/cron*` and `/var/spool/cron/`.",
   "A file writable by your group but executed by root is a bug.",
   "Ownership matters more than mode alone."
  ],
  "solution": "Cron scripts should be owned by root and writable only by root. Prefer a dedicated system user for jobs that do not need root.",
  "tags": [
   "linux",
   "privesc"
  ]
 },
 "nmap-discovery": {
  "description": "An isolated subnet hides several services from the intended user. You will fingerprint the network, identify the intended service, and document how a defender should shrink the exposed surface.",
  "scenario": "A partner service is 'only reachable from our VPN'. Verify what that means in practice.",
  "objectives": [
   "Perform a ping sweep",
   "Identify open ports on the target",
   "Fingerprint one service",
   "Recommend an ingress hardening step"
  ],
  "prerequisites": [
   "Basic networking familiarity"
  ],
  "tools": [
   "nmap"
  ],
  "hints": [
   "`-sn` for a ping sweep, `-sV` for versions.",
   "Rate-limit yourself in shared labs.",
   "Fewer open ports is the simplest hardening."
  ],
  "solution": "Reduce the exposed surface with strict security groups. Prefer identity-aware proxies. Alert on scans from unexpected sources.",
  "tags": [
   "linux",
   "network"
  ]
 },
 "sudo-root": {
  "description": "A `sudoers` rule grants NOPASSWD to a helper binary that supports a `-c` flag executing arbitrary commands. That is a full root shell. You will identify the entry, land root, and rewrite the rule.",
  "scenario": "An engineer said 'we only sudo one binary'. Determine whether that scopes the risk.",
  "objectives": [
   "Read `/etc/sudoers` (and drop-ins) safely",
   "Identify the risky command",
   "Escalate to root using the intended flag",
   "Rewrite the sudoers entry"
  ],
  "prerequisites": [
   "Comfortable with Linux shell"
  ],
  "tools": [
   "Terminal",
   "GTFOBins"
  ],
  "hints": [
   "Some binaries have hidden shell-execution flags.",
   "Wildcards in sudoers are dangerous.",
   "Prefer explicit script paths and no arguments."
  ],
  "solution": "Grant sudo to a wrapper script that accepts no user-controlled arguments. Audit sudoers with `visudo -c`. Consider `polkit` for finer control.",
  "tags": [
   "linux",
   "privesc"
  ]
 },
 "scr-sqli": {
  "description": "You are given a pull request that introduces a new search endpoint. Somewhere in the diff a developer switched from a parameterized query to string interpolation. Your job is to spot the change, explain the impact, and submit the fix as a rewritten diff.",
  "scenario": "A weekly code-review rotation lands on your calendar. The diff is 240 lines. The bug is one of them.",
  "objectives": [
   "Read the diff without running the code",
   "Identify the introduced injection",
   "Write a two-sentence impact note",
   "Submit the corrected query"
  ],
  "prerequisites": [
   "Familiar with SQL"
  ],
  "tools": [
   "Diff viewer",
   "IDE"
  ],
  "hints": [
   "Look for `+` and `${}` in query strings.",
   "Parameters are placeholders, not string templates.",
   "A single line change is enough."
  ],
  "solution": "Restore the placeholder. Add a lint rule that flags string interpolation into SQL clients.",
  "tags": [
   "scr",
   "sqli"
  ]
 },
 "scr-csrf": {
  "description": "The middleware verifies a CSRF token \u2014 but only for POST requests. A newer PUT/PATCH endpoint quietly bypasses the check. You will identify the gap and generalize the guard.",
  "scenario": "A refactor moved several endpoints to PUT. Confirm the CSRF middleware still applies.",
  "objectives": [
   "Read the middleware",
   "Identify state-changing methods it does not cover",
   "Extend the check to all state-changing verbs",
   "Add a regression test"
  ],
  "prerequisites": [
   "Familiar with Express or a similar middleware model"
  ],
  "tools": [
   "IDE"
  ],
  "hints": [
   "The list of methods is the smell.",
   "Prefer allowlist of safe methods over blocklist.",
   "Regression tests belong in the same PR."
  ],
  "solution": "Guard every method except `GET/HEAD/OPTIONS`. Add integration tests that exercise each verb.",
  "tags": [
   "scr",
   "csrf"
  ]
 },
 "scr-upload": {
  "description": "A pull request adds resume uploads. It validates the extension client-side, stores the file inside the web root, and uses the client-provided filename. There are three separate bugs. Your task: find all three and propose fixes in one review.",
  "scenario": "A hiring team wants to ship by Friday. Give them the review they need without saying no.",
  "objectives": [
   "Enumerate the three flaws",
   "Explain the individual and combined impact",
   "Propose a corrected implementation",
   "Provide a rollout note for the hiring team"
  ],
  "prerequisites": [
   "Basic web upload familiarity"
  ],
  "tools": [
   "IDE"
  ],
  "hints": [
   "Server-side validation is not optional.",
   "Never trust the client filename.",
   "Storage location matters as much as validation."
  ],
  "solution": "Validate on the server, generate the stored filename, place uploads outside the web root, and serve them through a controller that sets a safe content-type.",
  "tags": [
   "scr",
   "upload"
  ]
 },
 "access-log-timeline": {
  "description": "You are handed a day's worth of web-server access logs. Somewhere in there an account was compromised. You will normalize the log, build a timeline, and identify the moment of takeover.",
  "scenario": "An incident channel pings you at 09:00 with 'user@corp says their password stopped working'. Reconstruct what happened.",
  "objectives": [
   "Load the logs into a query tool",
   "Identify the successful login from an unusual origin",
   "Reconstruct the request sequence that followed",
   "Write a one-page incident timeline"
  ],
  "prerequisites": [
   "Basic shell or SQL familiarity"
  ],
  "tools": [
   "Terminal",
   "duckdb / grep / awk",
   "Text editor"
  ],
  "hints": [
   "Timestamps are the backbone of the timeline.",
   "Group by IP and user-agent to spot outliers.",
   "Correlate login success with sensitive endpoints."
  ],
  "solution": "Standardize log fields, keep at least 30 days of history, and forward to a SIEM. Alert on impossible-travel and new-device patterns.",
  "tags": [
   "blue",
   "forensics",
   "logs"
  ]
 },
 "web-shell-upload": {
  "description": "Access logs contain an upload followed by unusual GET requests to the uploaded path. You will identify the upload, the initial execution, and the persistence step, then propose a monitoring rule.",
  "scenario": "A web-shell alert fired overnight. Explain how it started.",
  "objectives": [
   "Identify the upload request",
   "Correlate it with subsequent GETs",
   "Confirm persistence",
   "Draft a detection rule"
  ],
  "prerequisites": [
   "Completed the Access Log Timeline lab"
  ],
  "tools": [
   "duckdb / grep / awk"
  ],
  "hints": [
   "Uploads to writable directories are worth alerting on.",
   "Small responses followed by shell-like command patterns are a signal.",
   "New files under `/uploads` warrant scanning."
  ],
  "solution": "Alert on writes to web-writable directories, scan uploaded files, and forward web-server access logs to a SIEM.",
  "tags": [
   "blue",
   "forensics",
   "logs"
  ]
 },
 "exfil-iocs": {
  "description": "DNS and outbound web logs show subtle exfiltration over several days. You will pull out the indicators \u2014 domain, TTL, request size, timing \u2014 and produce a shareable indicator list.",
  "scenario": "A finance team suspects a document leak. Nothing obvious shows in the SIEM. Look harder.",
  "objectives": [
   "Identify the covert channel",
   "Extract indicators of compromise",
   "Rank them by fidelity",
   "Publish the IOC list in a machine-readable format"
  ],
  "prerequisites": [
   "Completed the Web Shell lab"
  ],
  "tools": [
   "duckdb",
   "STIX or a simpler CSV format"
  ],
  "hints": [
   "Long, high-entropy subdomains often carry data.",
   "Regular intervals are a fingerprint.",
   "Domain age and registrar are useful pivots."
  ],
  "solution": "Deploy DNS logging, monitor for unusual outbound volumes, and share indicators via a common format with peers.",
  "tags": [
   "blue",
   "forensics",
   "dns",
   "exfil"
  ]
 },
 "deobfuscate-js": {
  "description": "You are handed a heavily obfuscated JavaScript file recovered from a compromised page. You will unpack it, identify the exfiltration endpoint, and extract the secret it hides.",
  "scenario": "A page 'looked weird for a second'. Recover what it actually did.",
  "objectives": [
   "Beautify the payload",
   "Trace control flow through the packer",
   "Identify the exfiltration endpoint",
   "Extract the hidden secret"
  ],
  "prerequisites": [
   "Basic JavaScript familiarity"
  ],
  "tools": [
   "prettier",
   "Node.js REPL",
   "Browser DevTools"
  ],
  "hints": [
   "`eval` chains are your first fold.",
   "Rename variables as you understand them.",
   "Static analysis usually beats running unknown code."
  ],
  "solution": "Deploy Content-Security-Policy with `script-src 'self'`. Subresource-Integrity for third-party scripts. Alert on script mutations.",
  "tags": [
   "reverse",
   "js"
  ]
 },
 "hidden-admin-endpoint": {
  "description": "A single-page app references an admin API in a JavaScript bundle but hides the UI. You will locate the endpoint, call it, and demonstrate why hiding it did nothing.",
  "scenario": "An engineer said 'nobody knows that URL exists'. Verify.",
  "objectives": [
   "Search the JavaScript bundle for route names",
   "Call the endpoint directly",
   "Confirm response contents",
   "Add a proper authorization filter"
  ],
  "prerequisites": [
   "Familiar with the browser Network tab"
  ],
  "tools": [
   "Browser DevTools",
   "curl"
  ],
  "hints": [
   "Bundles ship all route names, even hidden ones.",
   "Search for `admin`, `internal`, or `debug`.",
   "Authorization must be on the server, not the UI."
  ],
  "solution": "Add a role-based filter to every admin route. Do not rely on client-side routing to enforce access.",
  "tags": [
   "reverse",
   "authz"
  ]
 },
 "source-map-secrets": {
  "description": "A production build shipped its source map. The map exposes original filenames and a hardcoded API key. You will recover the key, understand why source maps in production are a common oversight, and configure the build to publish them only to an authenticated debugger.",
  "scenario": "A build engineer asked 'source maps are safe, right?' \u2014 answer with evidence.",
  "objectives": [
   "Locate the source map from the bundle URL",
   "Rehydrate the original sources",
   "Extract the leaked secret",
   "Configure the build to gate the map"
  ],
  "prerequisites": [
   "Basic build tooling familiarity"
  ],
  "tools": [
   "Browser DevTools",
   "source-map CLI"
  ],
  "hints": [
   "Source maps live at `.js.map`.",
   "Original filenames are a bonus finding, not the main event.",
   "Uploaded to Sentry, gated by SSO \u2014 that is the pattern."
  ],
  "solution": "Do not publish source maps to public origins. Upload them to a debugging service protected by SSO. Rotate any leaked secrets before you close the ticket.",
  "tags": [
   "reverse",
   "sourcemap"
  ]
 }
};
