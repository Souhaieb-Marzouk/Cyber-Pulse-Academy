/*
 * ============================================================================
 * CyberPulseAcademy - cloudflare-worker/worker.js
 *
 * This Worker is the ONLY non-static component of the entire project, and
 * deploying it is entirely optional. The site as shipped has
 * `statsProvider: "local"` in assets/js/config.js, which means every counter
 * lives in the visitor's own browser and nothing is ever transmitted. This
 * Worker exists for the owner who wants a public, site-wide statistics page
 * instead of a per-device one, and it must be deployed deliberately: see
 * cloudflare-worker/README.md.
 *
 * Contract: this file implements exactly what assets/js/stats.js sends and
 * expects. Read that file before changing anything here. In particular:
 *
 *   POST /event   { type: "user", country, userHash, ts, siteVersion }
 *                 { type: "run", topicId, batch, country, userHash, score,
 *                   total, percent, passed, ts, siteVersion }
 *   GET  /stats   { generatedAt, totals: { users, countries, examsTaken,
 *                   passRate, avgScore, mostAttempted, hardest },
 *                   usersByCountry: [{ code, count }],
 *                   rows: [{ topicId, batch, runs, uniqueUsers, avgScore,
 *                            passRate, topCountries: [{ code, count }] }] }
 *   GET  /healthz { status }
 *
 * Sources and sinks, stated plainly:
 *   accepted  - a two-letter country code, a 16-hex-character username hash,
 *               a topic id, a batch number, a score, a timestamp, a version.
 *   rejected  - a raw username, an unknown field, anything oversized, any
 *               value that fails a type or range check.
 *   stored    - aggregates only, plus the hashed visitor identifier used to
 *               count distinct users. No raw IP address is ever written down.
 *   returned  - aggregates only. Never a per-user record, never a raw
 *               identifier of any kind.
 *
 * No dependencies. Plain fetch, Request, Response, JSON and the KV binding.
 * ============================================================================
 */

'use strict';

/* ------------------------------------------------------------------------- */
/* Limits and shapes                                                          */
/* ------------------------------------------------------------------------- */

/* A legitimate payload is a few hundred bytes. 2 KB is generous and still
   stops anyone from using the endpoint as free storage. */
const MAX_BODY_BYTES = 2048;

/* A username hash is 16 hex characters. The client's documented fallback for
   browsers without Web Crypto is 'fnv' followed by 32 hex characters. The
   literal 'anonymous' is what the client sends when no name was entered: the
   visitor is counted, but as one shared anonymous bucket rather than as an
   individual. Nothing else is accepted, and a raw username never is. */
const USER_HASH_RE = /^(?:[0-9a-f]{16}|fnv[0-9a-f]{32}|anonymous)$/;

const COUNTRY_RE = /^[A-Z]{2}$/;
const TOPIC_ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const SITE_VERSION_RE = /^[0-9A-Za-z._-]{1,32}$/;

/* Score bounds. A batch is a small exam, so 500 is already far beyond
   anything real and keeps a hostile client from skewing an average. */
const MAX_SCORE = 500;
const MIN_TS_LOOKBACK_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_TS_FUTURE_MS = 24 * 60 * 60 * 1000;

/* How many distinct users we are willing to remember per batch in order to
   report uniqueUsers honestly. Past this the count stops growing, which is a
   documented limit rather than a silent wrong answer. */
const MAX_UNIQUE_USERS_PER_KEY = 4000;

/* Distinct users remembered globally, so the per-country breakdown and the
   users total stay consistent with each other. */
const MAX_GLOBAL_USERS = 20000;

/* How many countries a single /stats response carries, and how many countries
   a single row carries. The client renders at most ten per row itself. */
const MAX_COUNTRIES_RETURNED = 50;
const MAX_ROW_COUNTRIES = 10;

/* The floor below which a topic is never called "hardest". Mirrors the client:
   a handful of bad runs must not crown a topic. */
const HARDEST_MIN_SCORED = 10;

/* Crude and deliberate: 120 writes per minute per address. A real visitor
   sends a handful of events per session. This is a backstop, not a security
   control, and it is honest about being one. */
const RATE_LIMIT_MAX = 120;
const RATE_LIMIT_WINDOW_SECONDS = 60;

/* ------------------------------------------------------------------------- */
/* KV key layout                                                              */
/* ------------------------------------------------------------------------- */
/*
 * cm:t          { examsTaken }                 one global run counter
 * cm:u          { users: { hash: country } }    global distinct users + country
 * cm:keys       [ "t1059#2", ... ]              index of per-batch keys
 * cm:us:<hash>  { topicId, batch, u: [hash] }   per-batch distinct users
 * cm:r:<id>#<n> { runs, u, users: { hash: 1 },
 *                 scoreSum, scored, passes,
 *                 countries: { CC: runs } }     one aggregate per topic+batch
 *
 * The global user map carries the country, so the country breakdown counts a
 * visitor once even if they announce themselves again from elsewhere, and the
 * users total can never disagree with the sum of the country counts.
 *
 * Read-modify-write is not atomic. See the note on the KV write helper.
 */
const KEY_TOTALS = 'cm:t';
const KEY_USERS = 'cm:u';
const KEY_INDEX = 'cm:keys';
const KEY_BATCH_USERS_PREFIX = 'cm:us:';
const KEY_RUN_PREFIX = 'cm:r:';
const KEY_RATE_PREFIX = 'cm:rl:';

/* ------------------------------------------------------------------------- */
/* Small helpers                                                              */
/* ------------------------------------------------------------------------- */

function jsonResponse(body, status, extraHeaders) {
  const headers = new Headers(extraHeaders || {});
  headers.set('Content-Type', 'application/json; charset=utf-8');
  /* A statistics endpoint has no business being indexed or cached by a shared
     proxy: the numbers change and the URL is the owner's own hostname. */
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(JSON.stringify(body, null, 2) + '\n', { status, headers });
}

function corsHeaders(origin, methods) {
  /* An explicit list, read from the environment. A wildcard origin on a site
     that also has a donations page and a repository is a needless invitation,
     so there is no '*' in this file on purpose, not even as a fallback: an
     unconfigured deployment refuses every cross-origin request instead of
     silently accepting the whole internet. */
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', methods);
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  /* credentials: 'omit' on the client, so no credentials header is sent and
     none needs to be allowed. */
  headers.set('Access-Control-Max-Age', '86400');
  /* The allowed origin depends on the request's Origin header, so any cache in
     front of this Worker must key on it. */
  headers.set('Vary', 'Origin');
  return headers;
}

function parseAllowedOrigins(env) {
  return String((env && env.ALLOWED_ORIGINS) || '')
    .split(',')
    .map(function (entry) { return entry.trim(); })
    .filter(function (entry) { return entry.length > 0; });
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

/* Type and range check in one place. Returns null for anything that is not a
   finite number inside the bounds, so the caller never has to trust a value it
   has not checked. */
function numberInRange(value, min, max) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  if (value < min || value > max) {
    return null;
  }
  return value;
}

function integerInRange(value, min, max) {
  const checked = numberInRange(value, min, max);
  if (checked === null || !Number.isInteger(checked)) {
    return null;
  }
  return checked;
}

function validTimestamp(value, now) {
  if (typeof value !== 'string' || value.length < 20 || value.length > 40) {
    return null;
  }
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  if (parsed < now - MIN_TS_LOOKBACK_MS || parsed > now + MAX_TS_FUTURE_MS) {
    return null;
  }
  return new Date(parsed).toISOString();
}

function reject(reason, detail, status) {
  return jsonResponse(
    { error: reason, detail: detail },
    status || 400
  );
}

/* ------------------------------------------------------------------------- */
/* KV access                                                                  */
/* ------------------------------------------------------------------------- */
/*
 * Every write below is a read, a mutation and a write. KV has no transaction
 * and no compare-and-swap, so two events that arrive in the same instant can
 * both read the same counter and both write it back incremented once: one
 * increment is lost. That is a real race and it is not hidden here.
 *
 * It is accepted deliberately. Events for one visitor are serialised by the
 * client (stats.js awaits each submission), collisions need two different
 * visitors inside the same few milliseconds, and the numbers on the statistics
 * page are illustrative rather than audited. At this site's volume an
 * occasional lost increment changes nothing a reader would notice.
 *
 * If that ever stops being true - if these counts are ever used for something
 * that has to be exact, or the traffic grows enough that collisions stop being
 * rare - the correct fix is a Durable Object per topic (or one per batch),
 * which serialises writes through a single instance and gives a real
 * transactional guarantee. Do not try to patch this with more KV keys.
 */

async function readJSON(env, key, fallback) {
  const raw = await env.CM_STATS.get(key);
  if (raw === null) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(raw);
    return parsed === null ? fallback : parsed;
  } catch (err) {
    /* A corrupted value must not take the endpoint down. Treat it as absent
       and let the next write replace it. */
    return fallback;
  }
}

async function writeJSON(env, key, value) {
  await env.CM_STATS.put(key, JSON.stringify(value));
}

/* ------------------------------------------------------------------------- */
/* Rate limiting                                                              */
/* ------------------------------------------------------------------------- */

async function hashKeyValue(salt, value) {
  const data = new TextEncoder().encode(String(salt) + '|' + String(value));
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  let hex = '';
  for (let i = 0; i < bytes.length; i += 1) {
    hex += ('0' + bytes[i].toString(16)).slice(-2);
  }
  return hex.slice(0, 32);
}

/*
 * A per-address counter with a short TTL. The address is hashed with the
 * IP_HASH_SALT secret before it becomes a key, so the raw IP address is never
 * stored, never logged and never returned. The hash is not reversible in
 * practice, but it is stable for the lifetime of the salt, which is exactly
 * what a counter needs and also why it is a secret rather than a constant.
 *
 * Returns true when the caller is over the limit.
 */
async function isRateLimited(env, request) {
  /* CF-Connecting-IP is set by Cloudflare's edge and cannot be spoofed by the
     client. It is the only address source used here; a forwarded-for header
     could be set by anyone. */
  const address = request.headers.get('CF-Connecting-IP') || '';
  if (!address) {
    /* No address to count against. Rather than block a legitimate request,
       let it through unthrottled and note the gap in the health response. */
    return { limited: false, addressKnown: false };
  }
  const salt = String((env && env.IP_HASH_SALT) || '');
  if (!salt) {
    /* Without a salt, hashing is worthless and storing the raw address is not
       acceptable, so the limiter is skipped rather than done badly. The
       deployment instructions require the secret to be set. */
    return { limited: false, addressKnown: true, saltMissing: true };
  }

  const key = KEY_RATE_PREFIX + (await hashKeyValue(salt, address));
  const current = await readJSON(env, key, { n: 0 });
  const count = integerInRange(current.n, 0, Number.MAX_SAFE_INTEGER) || 0;
  if (count >= RATE_LIMIT_MAX) {
    return { limited: true, addressKnown: true };
  }
  await env.CM_STATS.put(
    key,
    JSON.stringify({ n: count + 1 }),
    { expirationTtl: RATE_LIMIT_WINDOW_SECONDS }
  );
  return { limited: false, addressKnown: true };
}

/* ------------------------------------------------------------------------- */
/* Per-batch aggregate storage                                                */
/* ------------------------------------------------------------------------- */

function emptyBatch() {
  return {
    runs: 0,
    users: {},
    scoreSum: 0,
    scored: 0,
    passes: 0,
    countries: {}
  };
}

function batchKey(topicId, batch) {
  return KEY_RUN_PREFIX + topicId + '#' + String(batch);
}

function batchUsersKey(topicId, batch) {
  return KEY_BATCH_USERS_PREFIX + topicId + '#' + String(batch);
}

async function loadIndex(env) {
  const keys = await readJSON(env, KEY_INDEX, []);
  return Array.isArray(keys) ? keys.filter(function (k) { return typeof k === 'string'; }) : [];
}

async function rememberBatchKey(env, key) {
  const keys = await loadIndex(env);
  if (keys.indexOf(key) !== -1) {
    return;
  }
  keys.push(key);
  await writeJSON(env, KEY_INDEX, keys);
}

/* ------------------------------------------------------------------------- */
/* Event handling                                                             */
/* ------------------------------------------------------------------------- */

function validateUserEvent(body, now) {
  const country = typeof body.country === 'string' ? body.country.toUpperCase() : null;
  if (!country || !COUNTRY_RE.test(country)) {
    return { error: 'country must be a two-letter ISO 3166-1 alpha-2 code' };
  }
  const userHash = typeof body.userHash === 'string' ? body.userHash.toLowerCase() : null;
  if (!userHash || !USER_HASH_RE.test(userHash)) {
    return { error: 'userHash must be 16 hex characters, the documented fnv fallback, or anonymous' };
  }
  const ts = validTimestamp(body.ts, now);
  if (!ts) {
    return { error: 'ts must be an ISO 8601 timestamp within the last 30 days' };
  }
  const siteVersion = typeof body.siteVersion === 'string' ? body.siteVersion : null;
  if (!siteVersion || !SITE_VERSION_RE.test(siteVersion)) {
    return { error: 'siteVersion must be a short version string' };
  }
  return { value: { country, userHash, ts, siteVersion } };
}

function validateRunEvent(body, now) {
  const topicId = typeof body.topicId === 'string' ? body.topicId : null;
  if (!topicId || !TOPIC_ID_RE.test(topicId)) {
    return { error: 'topicId must match ^[a-z0-9][a-z0-9-]{0,63}$' };
  }
  const batch = integerInRange(body.batch, 1, 3);
  if (batch === null) {
    return { error: 'batch must be the integer 1, 2 or 3' };
  }
  const country = typeof body.country === 'string' ? body.country.toUpperCase() : null;
  if (!country || !COUNTRY_RE.test(country)) {
    return { error: 'country must be a two-letter ISO 3166-1 alpha-2 code' };
  }
  const userHash = typeof body.userHash === 'string' ? body.userHash.toLowerCase() : null;
  if (!userHash || !USER_HASH_RE.test(userHash)) {
    return { error: 'userHash must be 16 hex characters, the documented fnv fallback, or anonymous' };
  }
  const ts = validTimestamp(body.ts, now);
  if (!ts) {
    return { error: 'ts must be an ISO 8601 timestamp within the last 30 days' };
  }
  const siteVersion = typeof body.siteVersion === 'string' ? body.siteVersion : null;
  if (!siteVersion || !SITE_VERSION_RE.test(siteVersion)) {
    return { error: 'siteVersion must be a short version string' };
  }
  if (typeof body.passed !== 'boolean') {
    return { error: 'passed must be a boolean' };
  }

  /* score and total are nullable by contract: the client sends null when a
     batch reported no raw marks. percent is what the aggregates use, and it is
     only counted when it is a real number, exactly as the client does. */
  let score = null;
  if (body.score !== null && body.score !== undefined) {
    score = integerInRange(body.score, 0, MAX_SCORE);
    if (score === null) {
      return { error: 'score must be an integer between 0 and ' + MAX_SCORE + ', or null' };
    }
  }
  let total = null;
  if (body.total !== null && body.total !== undefined) {
    total = integerInRange(body.total, 0, MAX_SCORE);
    if (total === null) {
      return { error: 'total must be an integer between 0 and ' + MAX_SCORE + ', or null' };
    }
  }
  let percent = null;
  if (body.percent !== null && body.percent !== undefined) {
    percent = numberInRange(body.percent, 0, 100);
    if (percent === null) {
      return { error: 'percent must be a number between 0 and 100, or null' };
    }
  }

  return {
    value: { topicId, batch, country, userHash, score, total, percent, passed: body.passed, ts, siteVersion }
  };
}

async function recordRun(env, event) {
  /* 1. The global run counter, so examsTaken is one cheap read on /stats. */
  const totals = await readJSON(env, KEY_TOTALS, { examsTaken: 0 });
  const examsTaken = integerInRange(totals.examsTaken, 0, Number.MAX_SAFE_INTEGER) || 0;
  await writeJSON(env, KEY_TOTALS, { examsTaken: examsTaken + 1 });

  /* 2. The global distinct-user map, which carries the country. A repeat
        announcement updates nothing but the country, so the country breakdown
        counts a visitor exactly once. */
  const users = await readJSON(env, KEY_USERS, { users: {} });
  if (!users.users || typeof users.users !== 'object') {
    users.users = {};
  }
  const knownUser = Object.prototype.hasOwnProperty.call(users.users, event.userHash);
  if (!knownUser && Object.keys(users.users).length < MAX_GLOBAL_USERS) {
    users.users[event.userHash] = event.country;
    await writeJSON(env, KEY_USERS, users);
  } else if (knownUser && users.users[event.userHash] !== event.country) {
    users.users[event.userHash] = event.country;
    await writeJSON(env, KEY_USERS, users);
  }

  /* 3. The per-batch aggregate. */
  const key = batchKey(event.topicId, event.batch);
  const record = await readJSON(env, key, emptyBatch());
  if (typeof record.runs !== 'number') {
    Object.assign(record, emptyBatch());
  }
  record.runs = (integerInRange(record.runs, 0, Number.MAX_SAFE_INTEGER) || 0) + 1;

  if (event.percent !== null) {
    record.scoreSum = (numberInRange(record.scoreSum, 0, Number.MAX_SAFE_INTEGER) || 0) + event.percent;
    record.scored = (integerInRange(record.scored, 0, Number.MAX_SAFE_INTEGER) || 0) + 1;
    if (event.passed) {
      record.passes = (integerInRange(record.passes, 0, Number.MAX_SAFE_INTEGER) || 0) + 1;
    }
  }

  if (!record.countries || typeof record.countries !== 'object') {
    record.countries = {};
  }
  const countryRuns = integerInRange(record.countries[event.country], 0, Number.MAX_SAFE_INTEGER) || 0;
  record.countries[event.country] = countryRuns + 1;

  /* A distinct-user set is kept per batch so uniqueUsers is a real count of
     people who ran that batch, not a proxy. It is capped, and the cap is a
     documented limit rather than a silent truncation. */
  const usersKey = batchUsersKey(event.topicId, event.batch);
  const seen = await readJSON(env, usersKey, { u: [] });
  if (!Array.isArray(seen.u)) {
    seen.u = [];
  }
  if (seen.u.indexOf(event.userHash) === -1 && seen.u.length < MAX_UNIQUE_USERS_PER_KEY) {
    seen.u.push(event.userHash);
    await writeJSON(env, usersKey, seen);
  }

  await writeJSON(env, key, record);
  await rememberBatchKey(env, event.topicId + '#' + String(event.batch));
}

async function recordUser(env, event) {
  const users = await readJSON(env, KEY_USERS, { users: {} });
  if (!users.users || typeof users.users !== 'object') {
    users.users = {};
  }
  const knownUser = Object.prototype.hasOwnProperty.call(users.users, event.userHash);
  if (!knownUser && Object.keys(users.users).length >= MAX_GLOBAL_USERS) {
    return;
  }
  if (knownUser && users.users[event.userHash] === event.country) {
    return;
  }
  users.users[event.userHash] = event.country;
  await writeJSON(env, KEY_USERS, users);
}

async function handleEvent(request, env) {
  /* Size guard before parsing: a hostile client should not be able to make the
     Worker allocate an unbounded amount of memory. */
  const declaredLength = Number(request.headers.get('Content-Length') || '0');
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return reject('payload-too-large', 'the body must be 2 KB or smaller', 413);
  }

  let raw;
  try {
    raw = await request.text();
  } catch (err) {
    return reject('unreadable-body', 'the request body could not be read');
  }
  if (raw.length > MAX_BODY_BYTES) {
    return reject('payload-too-large', 'the body must be 2 KB or smaller', 413);
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch (err) {
    return reject('invalid-json', 'the body must be a single JSON object');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return reject('invalid-json', 'the body must be a single JSON object');
  }

  /* An explicit guard for the one field that must never arrive. The client
     contract in assets/js/stats.js is to send only sha256(statsSalt + '|' +
     username.toLowerCase()) truncated to 16 hex characters. If a raw username
     ever shows up here, either the client was changed without updating this
     contract or someone is probing for a backend that accepts one. Either way
     it is refused loudly rather than silently stored. */
  const FORBIDDEN_FIELDS = ['username', 'user', 'name', 'email', 'ip', 'ipAddress'];
  for (let i = 0; i < FORBIDDEN_FIELDS.length; i += 1) {
    if (Object.prototype.hasOwnProperty.call(body, FORBIDDEN_FIELDS[i])) {
      return reject(
        'raw-identifier-refused',
        'the field "' + FORBIDDEN_FIELDS[i] + '" is never accepted. The client must send userHash only.',
        400
      );
    }
  }

  const now = Date.now();

  if (body.type === 'user') {
    /* Strict field allow-list. Anything unexpected is rejected rather than
       ignored, so a client cannot smuggle extra data in through this endpoint. */
    const allowed = ['type', 'country', 'userHash', 'ts', 'siteVersion'];
    const unexpected = Object.keys(body).filter(function (k) { return allowed.indexOf(k) === -1; });
    if (unexpected.length > 0) {
      return reject('unexpected-field', 'unexpected field(s): ' + unexpected.join(', '));
    }
    const checked = validateUserEvent(body, now);
    if (checked.error) {
      return reject('invalid-event', checked.error);
    }
    await recordUser(env, checked.value);
    return new Response(null, { status: 204 });
  }

  if (body.type === 'run') {
    const allowed = ['type', 'topicId', 'batch', 'country', 'userHash', 'score', 'total',
      'percent', 'passed', 'ts', 'siteVersion'];
    const unexpected = Object.keys(body).filter(function (k) { return allowed.indexOf(k) === -1; });
    if (unexpected.length > 0) {
      return reject('unexpected-field', 'unexpected field(s): ' + unexpected.join(', '));
    }
    const checked = validateRunEvent(body, now);
    if (checked.error) {
      return reject('invalid-event', checked.error);
    }
    await recordRun(env, checked.value);
    return new Response(null, { status: 204 });
  }

  return reject('unknown-event-type', 'type must be "user" or "run"');
}

/* ------------------------------------------------------------------------- */
/* Snapshot                                                                   */
/* ------------------------------------------------------------------------- */

async function handleStats(env) {
  const totals = await readJSON(env, KEY_TOTALS, { examsTaken: 0 });
  const examsTaken = integerInRange(totals.examsTaken, 0, Number.MAX_SAFE_INTEGER) || 0;

  const users = await readJSON(env, KEY_USERS, { users: {} });
  const userMap = (users.users && typeof users.users === 'object') ? users.users : {};

  const countryCounts = {};
  const userHashes = Object.keys(userMap);
  for (let i = 0; i < userHashes.length; i += 1) {
    let code = String(userMap[userHashes[i]] || 'ZZ').toUpperCase();
    if (!COUNTRY_RE.test(code)) {
      code = 'ZZ';
    }
    countryCounts[code] = (countryCounts[code] || 0) + 1;
  }
  const usersByCountry = Object.keys(countryCounts)
    .map(function (code) { return { code: code, count: countryCounts[code] }; })
    .sort(function (a, b) { return b.count - a.count || (a.code < b.code ? -1 : 1); })
    .slice(0, MAX_COUNTRIES_RETURNED);

  /* One KV read per batch. The index is a single key, so /stats costs one read
     for the counter, one for the users, one for the index, and one per batch.
     At the catalog's 738 reserved batches that is a few hundred reads; Cloudflare
     allows a thousand reads per invocation on the free plan, and the response is
     cached by the browser, so this stays comfortably inside the free tier. */
  const keys = await loadIndex(env);
  const rows = [];
  let scoredTotal = 0;
  let scoreSumTotal = 0;
  let passesTotal = 0;
  const topicAggregates = {};

  for (let i = 0; i < keys.length; i += 1) {
    const parts = keys[i].split('#');
    if (parts.length !== 2) {
      continue;
    }
    const topicId = parts[0];
    const batch = integerInRange(Number(parts[1]), 1, 3);
    if (batch === null || !TOPIC_ID_RE.test(topicId)) {
      continue;
    }
    const record = await readJSON(env, batchKey(topicId, batch), null);
    if (!record || typeof record !== 'object') {
      continue;
    }

    const runs = integerInRange(record.runs, 0, Number.MAX_SAFE_INTEGER) || 0;
    const scored = integerInRange(record.scored, 0, Number.MAX_SAFE_INTEGER) || 0;
    const passes = integerInRange(record.passes, 0, Number.MAX_SAFE_INTEGER) || 0;
    const scoreSum = numberInRange(record.scoreSum, 0, Number.MAX_SAFE_INTEGER) || 0;

    const seen = await readJSON(env, batchUsersKey(topicId, batch), { u: [] });
    const uniqueUsers = Array.isArray(seen.u) ? seen.u.length : 0;

    const countries = (record.countries && typeof record.countries === 'object') ? record.countries : {};
    const topCountries = Object.keys(countries)
      .map(function (code) {
        return { code: code, count: integerInRange(countries[code], 0, Number.MAX_SAFE_INTEGER) || 0 };
      })
      .filter(function (entry) { return COUNTRY_RE.test(entry.code) && entry.count > 0; })
      .sort(function (a, b) { return b.count - a.count || (a.code < b.code ? -1 : 1); })
      .slice(0, MAX_ROW_COUNTRIES);

    /* Both figures are rounded to one decimal place, exactly as the client's
       own aggregate does, so a local snapshot and a remote one read the same. */
    rows.push({
      topicId: topicId,
      batch: batch,
      runs: runs,
      uniqueUsers: uniqueUsers,
      avgScore: scored > 0 ? round1(scoreSum / scored) : null,
      passRate: scored > 0 ? round1((passes / scored) * 100) : null,
      topCountries: topCountries
    });

    scoredTotal += scored;
    scoreSumTotal += scoreSum;
    passesTotal += passes;

    /* Topic-level rollup, used for mostAttempted and hardest. A topic is one
       entry across its three batches, which is what the client's local
       aggregate reports as well. */
    if (!topicAggregates[topicId]) {
      topicAggregates[topicId] = { scored: 0, scoreSum: 0, runs: 0 };
    }
    topicAggregates[topicId].scored += scored;
    topicAggregates[topicId].scoreSum += scoreSum;
    topicAggregates[topicId].runs += runs;
  }

  rows.sort(function (a, b) {
    if (a.topicId !== b.topicId) {
      return a.topicId < b.topicId ? -1 : 1;
    }
    return a.batch - b.batch;
  });

  /* Most attempted is a topic, summed across its three batches, which is what
     the client's local aggregate reports too. */
  let mostAttempted = null;
  const topicIds = Object.keys(topicAggregates);
  for (let i = 0; i < topicIds.length; i += 1) {
    const id = topicIds[i];
    if (!mostAttempted || topicAggregates[id].runs > mostAttempted.runs) {
      mostAttempted = { topicId: id, runs: topicAggregates[id].runs };
    }
  }

  /* Hardest requires a floor of scored attempts across the topic's batches, so
     one bad run cannot crown a topic "hardest". */
  let hardest = null;
  for (let i = 0; i < topicIds.length; i += 1) {
    const id = topicIds[i];
    const aggregate = topicAggregates[id];
    if (aggregate.scored < HARDEST_MIN_SCORED) {
      continue;
    }
    const mean = aggregate.scoreSum / aggregate.scored;
    if (!hardest || mean < hardest.avgScore) {
      hardest = { topicId: id, avgScore: round1(mean), runs: aggregate.scored };
    }
  }

  return jsonResponse({
    generatedAt: new Date().toISOString(),
    totals: {
      users: userHashes.length,
      countries: Object.keys(countryCounts).length,
      examsTaken: examsTaken,
      passRate: scoredTotal > 0 ? round1((passesTotal / scoredTotal) * 100) : null,
      avgScore: scoredTotal > 0 ? round1(scoreSumTotal / scoredTotal) : null,
      mostAttempted: mostAttempted,
      hardest: hardest
    },
    usersByCountry: usersByCountry,
    rows: rows
  }, 200);
}

/* ------------------------------------------------------------------------- */
/* Health                                                                     */
/* ------------------------------------------------------------------------- */

async function handleHealth(env) {
  /* This probe must stay cheap and must not pretend: it reads the totals key so
     a broken KV binding reports as unhealthy rather than as a cheerful OK. */
  try {
    const totals = await readJSON(env, KEY_TOTALS, { examsTaken: 0 });
    return jsonResponse({
      status: 'ok',
      service: 'cyberpulseacademy-stats',
      examsTaken: integerInRange(totals.examsTaken, 0, Number.MAX_SAFE_INTEGER) || 0,
      allowedOrigins: parseAllowedOrigins(env).length,
      saltConfigured: Boolean(env && env.IP_HASH_SALT),
      checkedAt: new Date().toISOString()
    }, 200);
  } catch (err) {
    return jsonResponse({
      status: 'degraded',
      service: 'cyberpulseacademy-stats',
      detail: 'the KV binding CM_STATS did not respond',
      checkedAt: new Date().toISOString()
    }, 503);
  }
}

/* ------------------------------------------------------------------------- */
/* Entry point                                                                */
/* ------------------------------------------------------------------------- */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowed = parseAllowedOrigins(env);

    /* An empty allow-list means the deployment has not been configured. Every
       cross-origin request is then refused, which is the safe direction to fail
       in: a misconfigured Worker collects nothing rather than everything. A
       same-origin or server-to-server request carries no Origin header and is
       still served, which is what keeps curl and an uptime check working. */
    if (origin && allowed.indexOf(origin) === -1) {
      return jsonResponse({
        error: 'origin-not-allowed',
        detail: 'this origin is not in the ALLOWED_ORIGINS list for this deployment'
      }, 403);
    }

    if (request.method === 'OPTIONS') {
      /* Preflight. The origin has already been checked against the allow-list
         above, so this answers with the origin echoed back from that list
         rather than reflected blindly. A preflight that carries no Origin at
         all is not a browser request and needs no CORS headers. */
      if (!origin) {
        return new Response(null, { status: 204 });
      }
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, 'GET, POST, OPTIONS')
      });
    }

    const cors = corsHeaders(origin, 'GET, POST, OPTIONS');

    try {
      if (url.pathname === '/event' && request.method === 'POST') {
        const rate = await isRateLimited(env, request);
        if (rate.limited) {
          const headers = new Headers(cors);
          /* Tell an honest client when to come back. The client does not retry
             on its own; it queues the event and drains the queue on the next
             submission, so a 429 costs a delay rather than the attempt. */
          headers.set('Retry-After', String(RATE_LIMIT_WINDOW_SECONDS));
          const body = JSON.stringify({ error: 'rate-limited', detail: 'too many events from this address' });
          return new Response(body + '\n', {
            status: 429,
            headers: Object.assign(headers, { 'Content-Type': 'application/json; charset=utf-8' })
          });
        }
        const response = await handleEvent(request, env);
        const headers = new Headers(response.headers);
        cors.forEach(function (value, key) { headers.set(key, value); });
        return new Response(response.body, { status: response.status, headers });
      }

      if (url.pathname === '/stats' && (request.method === 'GET' || request.method === 'HEAD')) {
        const response = await handleStats(env);
        const headers = new Headers(response.headers);
        cors.forEach(function (value, key) { headers.set(key, value); });
        /* The counts move, but slowly, and a shared statistics page does not
           need to hit the Worker on every keystroke. A short edge cache keeps
           reads cheap without ever making a visitor's own result invisible for
           long. Builders who want it always fresh can remove this line. */
        headers.set('Cache-Control', 'public, max-age=60');
        return new Response(request.method === 'HEAD' ? null : response.body, {
          status: response.status,
          headers
        });
      }

      if (url.pathname === '/healthz' && (request.method === 'GET' || request.method === 'HEAD')) {
        const response = await handleHealth(env);
        return new Response(request.method === 'HEAD' ? null : response.body, {
          status: response.status,
          headers: response.headers
        });
      }

      if (url.pathname === '/' ) {
        /* A human who opens the Worker hostname should get an explanation
           rather than a bare 404. It names no hostname and no secret. */
        return jsonResponse({
          service: 'cyberpulseacademy-stats',
          endpoints: {
            'POST /event': 'record one anonymised event',
            'GET /stats': 'aggregate snapshot for the statistics page',
            'GET /healthz': 'uptime probe'
          },
          note: 'This is the optional statistics backend for the CyberPulseAcademy static site.'
        }, 200);
      }

      return jsonResponse({ error: 'not-found', detail: 'no route for ' + request.method + ' ' + url.pathname }, 404);
    } catch (err) {
      /* Nothing internal is leaked to the caller: no stack, no binding names,
         no visitor data. The detail is a fixed string. */
      return jsonResponse({
        error: 'internal-error',
        detail: 'the request could not be completed'
      }, 500);
    }
  }
};
