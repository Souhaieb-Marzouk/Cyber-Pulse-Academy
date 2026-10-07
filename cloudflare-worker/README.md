# CyberPulseAcademy statistics Worker

An optional Cloudflare Worker that gives CyberMastery site-wide aggregate
statistics instead of per-device ones.

**It is optional.** The site ships with `statsProvider: 'local'` in
`assets/js/config.js`, which means every number on the statistics page comes
from the visitor's own browser and nothing is transmitted. This Worker does
nothing at all until you deploy it *and* point the site at it. It is the only
non-static component in the entire project; everything else runs on GitHub
Pages.

What it is:

- A **module Worker** with three routes: `POST /event`, `GET /stats` and
  `GET /healthz`.
- Backed by a single **KV namespace** holding aggregates only.
- **Dependency-free.** Plain `fetch`, `Request`, `Response`, `JSON` and KV
  bindings. There is no `package.json` and nothing to install beyond the
  `wrangler` CLI itself.
- Written against the exact client contract in `assets/js/stats.js`. If you
  change either side, change both.

What it is not:

- Not required to use the site.
- Not a user database. It cannot return a per-user record, because it does not
  store one.
- Not exact. See [The KV race condition](#the-kv-race-condition) below.

---

## The endpoint contract

Everything below matches `assets/js/stats.js`. The client sends
`Content-Type: application/json`, `credentials: 'omit'`, and a 5 second
timeout (`statsTimeoutMs`); if a POST fails it queues the payload locally and
retries on the next submission, so the Worker is allowed to be briefly
unavailable without losing data.

### POST /event

Two event shapes. Any other field is rejected with `400 unexpected-field`.

**A visitor announcing themselves**, once per deployment, so the country
breakdown has a denominator before anyone finishes an exercise:

| field | type | notes |
|---|---|---|
| `type` | string | exactly `"user"` |
| `country` | string | two uppercase letters, ISO 3166-1 alpha-2, or `"ZZ"` |
| `userHash` | string | 16 hex characters, or the `fnv` fallback, or `anonymous` |
| `ts` | string | ISO 8601 date-time, within the last 30 days |
| `siteVersion` | string | e.g. `"1.0.0"` |

**A completed exercise attempt:**

| field | type | notes |
|---|---|---|
| `type` | string | exactly `"run"` |
| `topicId` | string | `^[a-z0-9][a-z0-9-]{0,63}$` |
| `batch` | integer | `1`, `2` or `3` |
| `country` | string | two uppercase letters, or `"ZZ"` |
| `userHash` | string | as above |
| `score` | integer or null | `0`–`500` |
| `total` | integer or null | `0`–`500` |
| `percent` | number or null | `0`–`100`, one decimal is fine |
| `passed` | boolean | required, and must be a real boolean |
| `ts` | string | ISO 8601 date-time, within the last 30 days |
| `siteVersion` | string | e.g. `"1.0.0"` |

**Responses**

| status | meaning |
|---|---|
| `204` | recorded. The client only checks `res.ok`, so no body is needed. |
| `400` | bad payload: unexpected field, bad type, bad range, or a raw identifier. The body is `{ "error": ..., "detail": ... }`. |
| `403` | the request `Origin` is not in `ALLOWED_ORIGINS`. |
| `413` | the body is larger than 2 KB. |
| `429` | more than 120 events in a minute from one address. `Retry-After: 60`. |
| `500` | something unexpected. The detail never leaks internals. |

### GET /stats

Returns exactly the snapshot shape `assets/js/stats.js` expects, which is the
shape `buildLocalSnapshot()` produces, so the statistics page renders a remote
snapshot with the same code path as a local one:

```json
{
  "generatedAt": "2025-01-15T04:17:09.000Z",
  "totals": {
    "users": 412,
    "countries": 37,
    "examsTaken": 9021,
    "passRate": 63.4,
    "avgScore": 68.2,
    "mostAttempted": { "topicId": "t1059", "runs": 733 },
    "hardest": { "topicId": "t1490", "avgScore": 41.7, "runs": 128 }
  },
  "usersByCountry": [
    { "code": "US", "count": 118 },
    { "code": "DE", "count": 47 }
  ],
  "rows": [
    {
      "topicId": "t1059",
      "batch": 2,
      "runs": 240,
      "uniqueUsers": 181,
      "avgScore": 66.4,
      "passRate": 58.3,
      "topCountries": [
        { "code": "US", "count": 71 },
        { "code": "IN", "count": 33 }
      ]
    }
  ]
}
```

The same rules the client applies are applied here, so a local figure and a
remote figure mean the same thing:

- `avgScore` and `passRate` are rounded to **one decimal place**.
- `passRate` is `null` when nothing has been scored for that batch; it is not
  reported as `0`, because zero and unknown are different claims.
- `hardest` requires **at least 10 scored attempts** across the topic's three
  batches, so one bad run cannot crown a topic "hardest".
- `mostAttempted` is a topic, summed across its batches.
- `rows` is one entry per topic **and** batch, sorted by topic id then batch.
- `usersByCountry` is capped at 50 entries and `topCountries` per row at 10 —
  the client renders 10. Both are sorted by count, descending.

The client stamps `mode: "remote"` and a fallback `localOnly` onto whatever
this endpoint returns; those two fields are deliberately not sent from here.

Nothing per-user is ever returned. No `userHash` ever appears in a response,
and neither does a raw IP address — the Worker has no way to produce one,
because it never stores one.

### GET /healthz

A cheap uptime probe that actually reads KV, so a broken binding reports
unhealthy instead of a cheerful `ok`:

```json
{
  "status": "ok",
  "service": "cyberpulseacademy-stats",
  "examsTaken": 9021,
  "allowedOrigins": 1,
  "saltConfigured": true,
  "checkedAt": "2025-01-15T04:17:09.000Z"
}
```

`503` with `"status": "degraded"` when KV does not answer. Point a free uptime
monitor at this rather than at `/stats`, which reads far more.

---

## Deploying it

You need a Cloudflare account (the free plan is enough) and Node.js for the
`wrangler` CLI. None of this touches the static site.

### 1. Install and sign in to wrangler

```bash
npx wrangler --version
npx wrangler login
```

`wrangler login` opens a browser and stores a token locally. Alternatively set
`CLOUDFLARE_API_TOKEN` in your environment for non-interactive use.

### 2. Create the KV namespace

```bash
cd cloudflare-worker
npx wrangler kv namespace create CM_STATS
```

It prints a namespace id. Paste it into `wrangler.toml`, replacing
`<your-kv-namespace-id>`:

```toml
[[kv_namespaces]]
binding = "CM_STATS"
id = "0123456789abcdef0123456789abcdef"
```

The id is not a secret — it is useless without your account credentials — but
it is specific to your account, so each deployment needs its own namespace.
Anyone forking this repository must create their own rather than copy yours.

### 3. Set the IP hash salt secret

```bash
npx wrangler secret put IP_HASH_SALT
```

Paste a long random string when prompted, for example the output of:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

This is a real secret: it is the salt used to hash a visitor's IP address
before that address is used as a rate-limit key. Setting it with
`wrangler secret put` stores it encrypted in Cloudflare and overrides the
visible placeholder in `wrangler.toml`. Never commit a real value in that file.

If you skip this step, the Worker still serves events but silently skips rate
limiting, because hashing without a salt is worthless and storing the raw
address is not acceptable. `/healthz` reports `"saltConfigured": false` so you
can see that you skipped it.

### 4. Set ALLOWED_ORIGINS to your real Pages origin

Edit the `[vars]` section of `wrangler.toml` and replace `<user>` with your
GitHub account or organisation, for example:

```toml
ALLOWED_ORIGINS = "https://yourname.github.io"
```

The value is a comma-separated list of **origins**: scheme plus host, with no
trailing slash and no path. `/cyberpulseacademy` is never part of an `Origin`
header, so it must not appear here even for a project site. There is no
wildcard support by design — an unconfigured Worker refuses every cross-origin
request rather than accepting the whole internet.

A second allowed origin is useful while you test, for example a local preview:

```toml
ALLOWED_ORIGINS = "https://yourname.github.io,http://localhost:8000"
```

Remove it before you are finished.

### 5. Deploy

```bash
npx wrangler deploy
```

Wrangler prints the deployed hostname, for example:

```
https://cyberpulseacademy-stats.your-subdomain.workers.dev
```

### 6. Point the site at it

In `assets/js/config.js`, near the top of the `CONFIG` object:

```js
statsEndpoint: 'https://cyberpulseacademy-stats.your-subdomain.workers.dev',
statsProvider: 'remote',
```

Commit that change and let the site redeploy. Remote mode is not enabled by the
Worker existing — it is enabled by this config change, and nothing before this
step collects anything.

If you would rather not use a `workers.dev` hostname, add a custom domain in
the Cloudflare dashboard (`Workers & Pages` → your Worker → `Settings` →
`Domains & Routes`) and use that instead. A custom domain is the more stable
choice, since it survives a rename of the Worker.

### 7. Publish the privacy and cookies pages first

This is step 7 in the list but it must happen **before** step 6.
`pages/privacy.html` and `pages/cookies.html` must be published and must
describe this collection accurately — what is stored, why, for how long, and
what cannot be done with it. Collecting statistics from real visitors without a
published privacy policy is a genuine legal exposure under the GDPR and
comparable regimes, not a formality, and "it is only anonymous aggregates" is a
claim a policy still has to make in writing. Check those two pages against the
actual behaviour of this Worker before you switch remote mode on, and update
them if you changed anything here.

---

## Testing it

Substitute your own hostname and a topic id that exists. The Worker accepts
requests with no `Origin` header, so `curl` works without pretending to be a
browser.

### Health

```bash
curl -sS https://cyberpulseacademy-stats.your-subdomain.workers.dev/healthz
```

### A user announcement

```bash
curl -sS -i -X POST https://cyberpulseacademy-stats.your-subdomain.workers.dev/event \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://yourname.github.io' \
  -d '{
    "type": "user",
    "country": "DE",
    "userHash": "0123456789abcdef",
    "ts": "2025-01-15T04:17:09.000Z",
    "siteVersion": "1.0.0"
  }'
```

Expect `HTTP/2 204` with no body.

### An exercise attempt

```bash
curl -sS -i -X POST https://cyberpulseacademy-stats.your-subdomain.workers.dev/event \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://yourname.github.io' \
  -d '{
    "type": "run",
    "topicId": "t1059",
    "batch": 2,
    "country": "DE",
    "userHash": "0123456789abcdef",
    "score": 18,
    "total": 20,
    "percent": 90,
    "passed": true,
    "ts": "2025-01-15T04:17:09.000Z",
    "siteVersion": "1.0.0"
  }'
```

Expect `HTTP/2 204`.

### The aggregate

```bash
curl -sS https://cyberpulseacademy-stats.your-subdomain.workers.dev/stats
```

Expect `rows` to contain a `t1059` / batch `2` entry with `runs` at least 1,
`avgScore` `90`, `passRate` `100`, and `topCountries` containing
`{ "code": "DE", "count": 1 }`.

### The rejections, which are the interesting part

```bash
# A wildcard origin is refused.
curl -sS -i -X POST https://cyberpulseacademy-stats.your-subdomain.workers.dev/event \
  -H 'Content-Type: application/json' -H 'Origin: https://evil.example' \
  -d '{"type":"user","country":"US","userHash":"0123456789abcdef","ts":"2025-01-15T04:17:09.000Z","siteVersion":"1.0.0"}'
# -> 403 origin-not-allowed

# A raw username is refused, loudly, even alongside a valid hash.
curl -sS -i -X POST https://cyberpulseacademy-stats.your-subdomain.workers.dev/event \
  -H 'Content-Type: application/json' \
  -d '{"type":"user","username":"alice","country":"US","userHash":"0123456789abcdef","ts":"2025-01-15T04:17:09.000Z","siteVersion":"1.0.0"}'
# -> 400 raw-identifier-refused

# An unknown field is refused rather than ignored.
curl -sS -i -X POST https://cyberpulseacademy-stats.your-subdomain.workers.dev/event \
  -H 'Content-Type: application/json' \
  -d '{"type":"user","country":"US","userHash":"0123456789abcdef","ts":"2025-01-15T04:17:09.000Z","siteVersion":"1.0.0","plan":"premium"}'
# -> 400 unexpected-field

# A batch number outside 1-3 and a percent over 100 are both refused.
curl -sS -i -X POST https://cyberpulseacademy-stats.your-subdomain.workers.dev/event \
  -H 'Content-Type: application/json' \
  -d '{"type":"run","topicId":"t1059","batch":7,"country":"US","userHash":"0123456789abcdef","score":1,"total":1,"percent":140,"passed":true,"ts":"2025-01-15T04:17:09.000Z","siteVersion":"1.0.0"}'
# -> 400 invalid-event
```

While you test, `npx wrangler tail` streams the Worker's logs in another
terminal. Those logs contain no visitor identifiers, because nothing in
`worker.js` writes one.

### Local development

```bash
cd cloudflare-worker
npx wrangler dev
```

This runs the Worker on `http://localhost:8787` against a local KV simulation,
and reads the placeholder `IP_HASH_SALT` from `wrangler.toml`, so you can
exercise every path without touching production data. Add
`http://localhost:8787` (or your preview origin) to `ALLOWED_ORIGINS` while you
do this.

---

## Privacy: what this implementation guarantees, and what it does not

Read this before you switch remote mode on, and make sure
`pages/privacy.html` and `pages/cookies.html` say the same thing.

### What it guarantees

- **No raw username is ever accepted.** The client sends
  `sha256(statsSalt + "|" + username.toLowerCase())` truncated to 16 hex
  characters. A field named `username` (or `user`, `name`, `email`, `ip`,
  `ipAddress`) is rejected with `400`, not ignored. The raw username cannot
  reach storage even by mistake, because there is no code path that stores one.
- **No IP address is stored.** The only address source is Cloudflare's
  `CF-Connecting-IP`, and it is hashed with the `IP_HASH_SALT` secret
  immediately. The hash is used once, as a rate-limit counter key with a
  60-second TTL, and is written nowhere else. The raw address is never logged
  by this code and never returned.
- **Aggregate only.** Every response is a count, a sum, a mean or a rate. There
  is no per-user record to leak, no row that says "this person did that", and
  nothing that can be exported as a list of people.
- **No cookies, no fingerprinting, no third-party script.** The client sends
  `credentials: 'omit'`, the Worker sets no cookie, and the only request the
  browser makes is the one to this endpoint.
- **No cross-site reuse.** The origin allow-list means no other site can use
  your Worker as a free backend, and the endpoint cannot be used to track
  visitors on anyone else's site.

### What it cannot guarantee, stated honestly

- **The hash is a pseudonym, not an anonymisation.** 16 hex characters is
  truncated SHA-256 over a *public, non-secret* salt and a username. Someone
  who has the salt, a guess at the username, and the stored hash can confirm
  the guess by recomputation. For a common or short display name this is a real
  risk, and it is the reason the salt must not be treated as a secret that
  makes the hash safe.
- **This is anonymous in practice, not anonymous by construction.** The
  Worker's operator — meaning you, or anyone with access to your Cloudflare
  account, or anyone who compels it — can correlate the *timing* of inbound
  requests with other data. If a single event arrives at 14:03:07 and one
  person was on the site at 14:03:07, that event is theirs. The stored data
  cannot be re-identified by itself, but the collection process is observable.
  Saying "fully anonymous" would be a stronger claim than this implementation
  earns; the accurate sentence is "pseudonymous aggregates with no per-user
  records", and the privacy page should say that.
- **Cloudflare sees the traffic.** Requests transit Cloudflare's edge, which
  means Cloudflare's own logging and retention policies apply to the request
  metadata. See Cloudflare's privacy documentation. This is true of any hosted
  endpoint, including the alternatives below.
- **`country` is self-declared.** It comes from what the visitor typed on the
  identity page, not from IP geolocation. It is a study aid, not a fact.

If you want a stronger guarantee than this, do not deploy the endpoint:
`statsProvider: 'local'` is the honest default, and it is the shipped one.

---

## The KV race condition

Every counter in this Worker is updated with a read, a modify and a write. KV
has no transactions and no compare-and-swap, so two events arriving in the same
instant can both read `runs: 41` and both write back `42`. **One increment is
lost.** This is a real bug, it is documented here rather than hidden, and the
code comments say the same thing at the point where it happens.

Why it is acceptable at this site's scale:

- The client serialises a single visitor's events — `stats.js` awaits each
  submission — so one person's attempts cannot race each other.
- A collision needs two *different* visitors inside the same few milliseconds,
  on the same topic and batch, hitting the same KV key.
- The numbers are illustrative. A statistics page reading 9,021 instead of
  9,022 changes nothing a reader would notice or act on.

**When to move to a Durable Object.** If any of these becomes true, KV is the
wrong storage:

- The counts are used for something that must be exact — a leaderboard with
  prizes, a per-user quota, anything audited.
- Traffic grows enough that collisions stop being rare, which shows up as
  `examsTaken` drifting persistently below the true number.
- You find yourself adding more KV keys to reduce the window. That does not
  work; it only moves the race.

The fix is one Durable Object per topic (or per batch), which serialises writes
through a single instance and gives a genuine transactional guarantee with
`blockConcurrencyWhile` or an internal SQLite-backed store. The routing, the
payload validation and the response shape in this file can be reused as-is;
only the storage layer changes. Do not attempt to patch the race with more KV.

A second, smaller caveat: KV is eventually consistent across Cloudflare's edge,
so a read immediately after a write may briefly return the old value. For a
statistics page refreshed by hand this is invisible.

---

## Two alternative backends

The same client contract can be served by something other than this Worker. The
README describes three options; here is the honest tradeoff on the other two.

### A Supabase table

Insert one row per event into a Postgres table, and expose `/stats` as a
database view or an Edge Function that reads the aggregate. Row-level security
locks the table down to insert-only for the public anon key, so the browser can
write events and can never read rows.

The upside is that the aggregate is a real SQL query over real rows, which means
no lost increments, no read-modify-write, and the ability to answer a question
you did not anticipate by writing a new view. Postgres will happily enforce
constraints, so a bad payload fails at the database rather than relying on the
endpoint's validation alone. The downside is that it stores **one row per
event**, including the `userHash` and the timestamp, so you are now holding
pseudonymous per-event data rather than aggregates. That is a materially larger
privacy surface: it must be covered honestly by the privacy page, it needs a
retention policy, and it turns a "delete my data" request into a real operation
instead of a shrug. It is also a second platform to learn, and the free tier
pauses an idle project, which remote mode handles badly.

Choose it if you want real analytics and are prepared to run a retention
policy. Do not choose it because it sounds more capable.

### A Google Apps Script writing to a Google Sheet

An Apps Script web app receives the POST, appends a row to a sheet, and serves
the aggregate from a second sheet of formulas, deployed as "execute as me" with
access to anyone.

The upside is that it is the least infrastructure of the three: no CLI, no
namespace, no secret to set, and the data is readable by anyone who can open a
spreadsheet. For a small deployment run by someone who does not want to learn
`wrangler`, that is a genuine advantage, and it is the easiest of the three to
hand over to a non-technical maintainer.

The downsides are real. Apps Script web apps are slow (hundreds of
milliseconds minimum, often more) against a `statsTimeoutMs` of 5 seconds, and
they have daily quota limits that a busy day can exhaust. Every event is one row
in a sheet, so the same privacy surface as Supabase applies, plus the sheet is
easy to share by accident. `e.parameter`-style handling and CORS in Apps Script
are awkward to get right, and the aggregate has to be computed by sheet formulas
rather than code. Choose it only for a small, low-traffic deployment where
simplicity matters more than accuracy or latency.

---

## Cost

Cloudflare's free tier is generous and this workload is nowhere near it.

- **Workers:** 100,000 requests per day free. A visitor generates a handful of
  events per session plus one `/stats` read per statistics page view, so even
  tens of thousands of daily visits fit.
- **KV:** 100,000 reads and 1,000 writes per day free. A single `/event` costs
  a few reads and a few writes; `/stats` costs roughly one read per tracked
  batch, which is the most expensive operation here and is why the response is
  cached for 60 seconds. At the seed catalog's 246 topics this is trivial.
- **Storage:** 1 GB free. The stored values are small JSON objects and the
  unique-user lists are capped, so the whole thing is well under a megabyte.

The realistic cost of running this is **zero**, and the failure mode of
exceeding the free tier is a bill measured in cents rather than an outage. The
one thing that would change this is a bot hammering the endpoint, which is what
the rate limiter is for; check `/healthz` occasionally and set a Cloudflare
budget alert if you want certainty.

---

## Before you switch remote mode on

`pages/privacy.html` and `pages/cookies.html` must be **published and accurate
first**. Collecting statistics from real visitors without a published privacy
policy is a genuine legal exposure under the GDPR and comparable regimes — it is
not a formality, and it is not excused by the data being aggregate. Both pages
already exist in this repository; read them against what this Worker actually
does before you flip `statsProvider` to `'remote'`, and update them if anything
here changed.

Specifically, the pages must be able to state, truthfully and in plain
language:

1. That an owner-operated endpoint is receiving data at all, and where it is
   hosted.
2. That a truncated hash of the display name is sent, that it is a pseudonym
   rather than an anonymisation, and that the salt is public.
3. That the country is self-declared rather than derived from the IP address.
4. That no raw IP address is stored, and that the IP is hashed with a secret
   salt for rate limiting only.
5. What is retained and for how long, and how a visitor can have their data
   removed — which, with this design, means clearing their own browser storage,
   because there is no per-user record to delete server-side.

If you cannot make those statements truthfully with a given backend, do not use
that backend. `statsProvider: 'local'` costs the site nothing and is the reason
the pages can honestly claim that nothing leaves the device.
