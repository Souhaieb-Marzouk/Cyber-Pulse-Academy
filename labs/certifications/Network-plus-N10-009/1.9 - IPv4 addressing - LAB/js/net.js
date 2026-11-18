// ── IPv4 math utilities — shared by validators and UI ──────────────────────
// Faithful port of src/lib/lab/net.ts (behavior identical).
"use strict";

var NET = (function () {
  const OCTETS = (ip) => {
    const parts = ip.trim().split(".");
    if (parts.length !== 4) return null;
    const nums = [];
    for (const p of parts) {
      if (!/^\d{1,3}$/.test(p)) return null;
      const n = Number(p);
      if (n > 255) return null;
      nums.push(n);
    }
    return nums;
  };

  const isValidIp = (ip) => OCTETS(ip) !== null;

  const ipToLong = (ip) => {
    const o = OCTETS(ip);
    if (!o) return null;
    return ((o[0] << 24) >>> 0) + (o[1] << 16) + (o[2] << 8) + o[3];
  };

  const longToIp = (n) =>
    [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");

  /** 32-bit string of an IP as 4 groups of 8 bit-chars */
  const octetBits = (n) => {
    const s = (n >>> 0).toString(2).padStart(32, "0");
    return [s.slice(0, 8), s.slice(8, 16), s.slice(16, 24), s.slice(24, 32)];
  };

  const maskFromPrefix = (prefix) => {
    if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return null;
    return longToIp(prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0);
  };

  const prefixFromMask = (mask) => {
    const l = ipToLong(mask);
    if (l === null) return null;
    // contiguous-ones check
    let ones = 0;
    for (let i = 31; i >= 0; i--) {
      if ((l >>> i) & 1) ones++;
      else if (ones > 0) return null; // gap — non-contiguous mask
    }
    return ones;
  };

  const normPrefix = (s) => {
    const t = String(s).trim().replace(/^\//, "");
    if (!/^\d{1,2}$/.test(t)) return String(s).trim();
    return "/" + Number(t);
  };

  const normIp = (s) => String(s).trim().replace(/\s+/g, "");

  const blockInfo = (ip, prefix) => {
    const l = ipToLong(ip);
    if (l === null || prefix < 0 || prefix > 32) return null;
    const hostBits = 32 - prefix;
    const maskOnes = prefix === 0 ? 0 : (0xffffffff << hostBits) >>> 0;
    const net = (l & maskOnes) >>> 0;
    const size = Math.pow(2, hostBits);
    const bcast = net + size - 1;
    const usable = Math.max(0, size - 2);
    return {
      network: longToIp(net),
      broadcast: longToIp(bcast),
      first: hostBits === 0 ? longToIp(net) : longToIp(net + 1),
      last: hostBits === 0 ? longToIp(bcast) : longToIp(bcast - 1),
      usable,
      total: size,
    };
  };

  const usableHosts = (prefix) => Math.max(0, Math.pow(2, 32 - prefix) - 2);

  const classOf = (ip) => {
    const o = OCTETS(ip);
    if (!o) return null;
    const n = o[0];
    if (n <= 127) return "A"; // 0 & 127 handled as specials elsewhere
    if (n <= 191) return "B";
    if (n <= 223) return "C";
    if (n <= 239) return "D";
    return "E";
  };

  const DEFAULT_MASK = { A: "255.0.0.0", B: "255.255.0.0", C: "255.255.255.0", D: "—", E: "—" };

  const longIn = (ip, cidrIp, prefix) => {
    const a = ipToLong(ip);
    const b = ipToLong(cidrIp);
    if (a === null || b === null) return false;
    const m = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    return ((a & m) >>> 0) === ((b & m) >>> 0);
  };

  return {
    OCTETS, isValidIp, ipToLong, longToIp, octetBits, maskFromPrefix, prefixFromMask,
    normPrefix, normIp, blockInfo, usableHosts, classOf, DEFAULT_MASK,
    isRfc1918: (ip) => longIn(ip, "10.0.0.0", 8) || longIn(ip, "172.16.0.0", 12) || longIn(ip, "192.168.0.0", 16),
    isApipa: (ip) => longIn(ip, "169.254.0.0", 16),
    isLoopback: (ip) => longIn(ip, "127.0.0.0", 8),
    isMulticast: (ip) => longIn(ip, "224.0.0.0", 4),
    isClassE: (ip) => longIn(ip, "240.0.0.0", 4),
    isLimitedBroadcast: (ip) => ip.trim() === "255.255.255.255",
    isUnspecified: (ip) => ip.trim() === "0.0.0.0",
  };
})();
