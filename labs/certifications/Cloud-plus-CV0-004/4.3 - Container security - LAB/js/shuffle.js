// HARBOR-7 — deterministic shuffles for exercise pools.
// QA audit R6/R4: pool display order must never reveal the correct pairs/sequence,
// and any shuffle must be identical between server and client render (no Math.random
// during render). Seeded mulberry32 gives stable, reproducible orders.
// Static port note: 1:1 port of src/lib/lab/shuffle.ts.

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic Fisher-Yates shuffle keyed by a string seed. */
function seededShuffle(items, seed) {
  const rand = mulberry32(hashStr(seed));
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Rotate a list by a fixed offset (used to break answer-position diagonals). */
function rotate(items, offset) {
  const n = items.length;
  if (n === 0) return [];
  const k = ((offset % n) + n) % n;
  return [...items.slice(k), ...items.slice(0, k)];
}
