// Operation THAWLINE — static port: deterministic, seed-stable shuffles.
// 1:1 mirror of src/lib/lab/shuffle.ts (Fisher–Yates over a mulberry32 PRNG).
// Used to rotate correct-answer positions (quiz) and break order-alignment in
// matching pools. Seeds are stable, so persisted answers — which are keyed by
// option/term id, never by position — stay valid across reloads.

function hashSeed(seed) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledBySeed(items, seed) {
  const rand = mulberry32(hashSeed(seed));
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
