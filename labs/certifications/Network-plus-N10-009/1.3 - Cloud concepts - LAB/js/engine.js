// ── LZ-MERIDIAN static · engine.js ──
// Ported 1:1 from src/lib/lab/engine.ts (types erased; logic and strings untouched).
'use strict';
// ── LZ-MERIDIAN · Packet simulator engine ──────────────────────────────────
// SIMPLIFIED cloud-NSG semantics (documented in-UI as "simplified"):
//   · gateway/route gating (IGW for public inbound, NAT for private egress, VPN for HQ)
//   · rules evaluated first-match by ascending priority
//   · stateful groups: allowed outbound sessions permit return traffic
//   · default posture: inbound deny · outbound allow


function ipToInt(ip) {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let acc = 0;
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    acc = (acc << 8) + n;
  }
  return acc >>> 0;
}

function cidrContains(cidr, ip) {
  const trimmed = cidr.trim();
  const slash = trimmed.indexOf('/');
  if (slash === -1) return false;
  const net = trimmed.slice(0, slash);
  const bits = Number(trimmed.slice(slash + 1));
  if (!Number.isInteger(bits) || bits < 0 || bits > 32) return false;
  const netInt = ipToInt(net);
  const ipInt = ipToInt(ip);
  if (netInt === null || ipInt === null) return false;
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (netInt & mask) === (ipInt & mask);
}

function natWired(env) {
  return env.gatewayPlan['flow-egress'] === 'nat';
}
function igwWired(env) {
  return env.gatewayPlan['flow-web-in'] === 'igw';
}
function vpnWired(env) {
  return env.gatewayPlan['flow-hq-vpn'] === 'vpngw';
}

function simulate(env, preset) {
  const rules = [...env.nsgRules].sort((a, b) => a.priority - b.priority);
  const entersVpc = preset.toZone === 'public' || preset.toZone === 'private';
  const direction = entersVpc ? 'in' : 'out';

  // ── Gateway / route gating ──
  if (preset.fromZone === 'internet' && preset.toZone === 'public' && !igwWired(env)) {
    return { result: 'deny', reason: 'No route: the public subnet’s route table does not reach an internet gateway — wire flow-web-in → IGW.', matchedRule: null };
  }
  if (preset.fromZone === 'internet' && preset.toZone === 'private') {
    return { result: 'deny', reason: 'Private subnets have no direct internet path — unsolicited traffic dies at the VPC boundary before any rule is read.', matchedRule: null };
  }
  if (preset.fromZone === 'hq' && preset.toZone === 'private' && !vpnWired(env)) {
    return { result: 'deny', reason: 'No site-to-site path: the VPN gateway is not wired for the HQ tunnel.', matchedRule: null };
  }
  if (preset.fromZone === 'private' && preset.toZone === 'internet' && !natWired(env)) {
    return { result: 'deny', reason: 'No route to the internet: the private route table must send 0.0.0.0/0 to a NAT gateway.', matchedRule: null };
  }

  // ── NSG rule evaluation (first match by priority) ──
  for (const r of rules) {
    if (r.direction !== direction) continue;
    if (r.protocol !== preset.protocol) continue;
    if (r.port !== preset.port) continue;
    if (direction === 'in' && !cidrContains(r.source, preset.fromIp)) continue;
    if (r.action === 'allow') {
      const reason =
        direction === 'out'
          ? `Allowed by rule “${r.tag}” (priority ${r.priority}) and forwarded via the NAT gateway — return traffic of this session is statefully permitted.`
          : `Allowed by rule “${r.tag}” (priority ${r.priority}).`;
      return { result: 'allow', reason, matchedRule: `${r.id} (pri ${r.priority})` };
    }
    return {
      result: 'deny',
      reason: `Denied by rule “${r.tag}” — ${r.direction === 'in' ? 'inbound' : 'outbound'} ${r.action} ${r.protocol}/${r.port} from ${r.source}, priority ${r.priority}. First match wins: no lower-priority allow was evaluated after this.`,
      matchedRule: `${r.id} (pri ${r.priority})`,
    };
  }

  // ── Default posture ──
  if (direction === 'out') {
    return { result: 'allow', reason: 'No outbound rule matched → default outbound allow; forwarded via the NAT gateway. Return traffic of this session is statefully permitted.', matchedRule: 'default (outbound allow)' };
  }
  return {
    result: 'deny',
    reason: 'Default inbound deny — no allow rule matched this flow, and the stateful engine only auto-permits return traffic of established outbound sessions. This probe is a brand-new unsolicited flow.',
    matchedRule: 'default (inbound deny)',
  };
}
