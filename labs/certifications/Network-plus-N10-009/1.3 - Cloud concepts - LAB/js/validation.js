// ── LZ-MERIDIAN static · validation.js ──
// Ported 1:1 from src/lib/lab/validation.ts (types erased; logic and strings untouched).
'use strict';
// ── LZ-MERIDIAN · CHECK RESULTS validation engine ──────────────────────────
// Machine-checkable, per-objective. Medium = tolerant (synonyms, case),
// Hard = strict (exact CIDRs, priority windows, sequence, exact sets).

const norm = (s) =>
  (s ?? '').trim().toLowerCase().replace(/\s+/g, '');

const isAnySource = (s) => ['0.0.0.0/0', 'any', '*', '0.0.0.0'].includes(norm(s));

function findRule(rules, p) {
  return rules.find((r) => {
    if (p.direction && r.direction !== p.direction) return false;
    if (p.action && r.action !== p.action) return false;
    if (p.protocol && r.protocol !== p.protocol) return false;
    if (p.port !== undefined && r.port !== p.port) return false;
    if (p.source !== undefined && norm(r.source) !== norm(p.source)) return false;
    return true;
  });
}

const ok = (title, body) => ({ ok: true, title, body });
const no = (title, body) => ({ ok: false, title, body });

function validateObjective(id, env) {
  switch (id) {
    // ═══ MEDIUM ═══
    case 'M1': {
      const bad = M1_WORKLOADS.filter((w) => norm(env.workloadAssign[w.id]) !== norm(M1_ANSWERS[w.id]));
      if (bad.length === 0) {
        return ok('Service models sorted correctly', 'The discriminator is always “who manages the OS and runtime”. SaaS = vendor runs everything (mail, CRM); PaaS = you push code onto a managed runtime (managed Postgres, microservices); IaaS = raw VMs you administer (ERP fleet, Hadoop). In the field, mis-modeling a workload means mis-scoping its patching duty — and audit findings follow.');
      }
      return no(`${bad.length} workload(s) still misfiled`, 'Re-read each row and ask: who patches the guest OS? Who patches the runtime? Nobody here → SaaS. Vendor patches engine/runtime, you own code/data → PaaS. You patch the OS → IaaS. Rows still open: ' + bad.map((b) => b.label).join(' · '));
    }
    case 'M2': {
      const bad = RESP_ITEMS.filter((i) => norm(env.respBoard[i.id]) !== i.iaas);
      if (bad.length === 0) {
        return ok('IaaS responsibility line drawn correctly', 'On IaaS the provider owns the hypervisor and everything physical beneath it; you own the guest OS and everything above — including NSG rules and identities. Getting this split wrong is how “the cloud” gets blamed for unpatched customer VMs.');
      }
      return no(`${bad.length} operation(s) on the wrong side`, 'Rule of thumb: physical plant, fabric, hypervisor → Provider. From the guest OS up (patching, code, NSG config, MFA) → Customer. Check: ' + bad.map((b) => b.label).join(' · '));
    }
    case 'M3': {
      const bad = M3_SCENARIOS.filter((s) => norm(env.depMatch[s.id]) !== s.answer);
      if (bad.length === 0) {
        return ok('Deployment models matched', 'Deployment models answer “whose infrastructure, who may use it”: public = shared provider gear; private = single-tenant dedication; hybrid = orchestrated mix; community = shared among organizations with common needs. Exam scenarios usually telegraph the answer with ownership and privacy words.');
      }
      return no(`${bad.length} scenario(s) mismatched`, 'Look for the ownership signal: per-minute shared gear → public; “dedicated, sovereignty, single org” → private; “stays on-prem + bursts” → hybrid; “consortium of several orgs” → community. Check: ' + bad.map((b) => b.label).join(' · '));
    }
    case 'M4': {
      const bad = M4_APPLIANCES.filter((a) => norm(env.nfvBoard[a.id]) !== a.answer);
      if (bad.length === 0) {
        return ok('NFV migration sheet flagged correctly', 'Anything that is pure packet logic — firewalls, routers, balancers, IDS/IPS — virtualizes cleanly into VNFs on commodity hosts. The two that stay physical do so for non-technical-capacity reasons: a proprietary DSP appliance and a compliance-mandated tamper-resistant HSM. NFV’s limit is rarely performance; it is hardware-bound features and legal mandates.');
      }
      return no(`${bad.length} appliance(s) flagged wrong`, 'If its function is pure packet handling, it virtualizes. Stay physical only where the value is in the box itself: proprietary DSP hardware, or a legally mandated tamper-resistant HSM. Check: ' + bad.map((b) => b.label).join(' · '));
    }
    case 'M5': {
      const cidrOk = norm(env.vpc.cidr) === norm(M5_CORRECT_CIDR);
      const web = env.vpc.subnets.find((s) => s.name.toLowerCase().includes('web'));
      const app = env.vpc.subnets.find((s) => /app|db/.test(s.name.toLowerCase()));
      const problems = [];
      if (!cidrOk) problems.push('VPC CIDR must be the cloud-reserved block 10.200.0.0/16 (10.20.x.x collides with HQ, and 10.20.200.0/24 is inside HQ’s range).');
      if (!web || norm(web.cidr) !== '10.200.1.0/24' || web.type !== 'public') problems.push('Public web subnet: name containing “web”, CIDR 10.200.1.0/24, type public.');
      if (!app || norm(app.cidr) !== '10.200.2.0/24' || app.type !== 'private') problems.push('Private app/db subnet: name containing “app” or “db”, CIDR 10.200.2.0/24, type private.');
      if (problems.length === 0) {
        return ok('VPC skeleton commissioned', 'You reserved non-overlapping address space and split exposure correctly: the web tier sits in a public subnet (routable via the internet gateway), the app/db tier in a private subnet (no direct internet path). Overlapping CIDRs are the classic day-one hybrid outage — route tables on both sides black-hole silently.');
      }
      return no('VPC not commissioned yet', problems.join(' '));
    }
    case 'M6': {
      const bad = GATEWAY_FLOWS.slice(0, 4).filter((f) => norm(env.gatewayPlan[f.id]) !== f.wants);
      if (bad.length === 0) {
        return ok('All four flows wired to the right front door', 'IGW = bidirectional internet for public subnets. NAT = outbound-only egress for private subnets. VPN gateway = IPsec site-to-site over the internet. Direct Connect = dedicated private circuit for SLA traffic. And the storage-gateway decoy? It bridges hybrid file/volume storage — it is not a network door at all.');
      }
      return no(`${bad.length} flow(s) miswired`, 'Think in doors: public inbound → IGW · private outbound-only → NAT · HQ tunnel → VPN gateway · SLA bulk sync → Direct Connect. If you picked the storage gateway, that one moves files, not packets. Check: ' + bad.map((b) => b.label).join(' · '));
    }
    case 'M7': {
      const r = findRule(env.nsgRules, { direction: 'in', action: 'allow', protocol: 'TCP', port: 443 });
      const webRule = r && (isAnySource(r.source) || norm(r.source) === '0.0.0.0/0') && r.priority >= 10 && r.priority <= 4095;
      if (webRule) {
        return ok('HTTPS allow rule authored', 'A minimal, correctly-scoped rule: direction in · action allow · TCP/443 · source 0.0.0.0/0 · a priority in the evaluation order. Priorities make the table a story read lowest-number-first — keep intentional rules well below the noise.');
      }
      return no('No valid web rule found', 'Add a rule with: priority 10–4095 · direction in · action allow · protocol TCP · port 443 · source 0.0.0.0/0 (or “any”). Found: ' + (r ? `in/${r.action}/TCP/${r.port} from ${r.source} pri ${r.priority}` : 'no inbound TCP/443 rule at all'));
    }
    case 'M8': {
      const worldSsh = env.nsgRules.some((r) => r.direction === 'in' && r.action === 'allow' && r.port === 22 && isAnySource(r.source));
      const hqSsh = findRule(env.nsgRules, { direction: 'in', action: 'allow', protocol: 'TCP', port: 22, source: HQ_CIDR });
      if (!worldSsh && hqSsh) {
        return ok('SSH hole closed — least privilege restored', 'Management ports are the highest-value target on any landing zone: world-open SSH is found by scanners within minutes and maps directly to real breach entry (ATT&CK T1190). Least privilege = the narrowest source CIDR that still does the job: HQ’s 10.20.0.0/16.');
      }
      if (worldSsh) return no('World-open SSH still present', 'At least one rule still allows inbound TCP/22 from 0.0.0.0/0 (rule r-ssh by default). Edit its source to 10.20.0.0/16 — or delete it and add a scoped rule.');
      return no('HQ-scoped SSH rule missing', 'The world-open rule is gone, but no inbound allow/TCP/22 from 10.20.0.0/16 exists. Edit r-ssh’s source field to 10.20.0.0/16.');
    }
    case 'M9': {
      const patchAllow = env.packetRuns.some((r) => r.flowId === 'sim-patch' && r.result === 'allow');
      const probeDeny = env.packetRuns.some((r) => r.flowId === 'sim-probe' && r.result === 'deny');
      const answersOk =
        norm(env.m9.outboundVerdict) === 'allowed' &&
        norm(env.m9.probeVerdict) === 'denied' &&
        norm(env.m9.reasonKey) === 'no-allow' &&
        norm(env.m9.nslKey) === 'nsl-return';
      if (patchAllow && probeDeny && answersOk) {
        return ok('Statefulness proven — and the stateless contrast recorded', 'You just demonstrated the exam’s favourite contrast: stateful NSGs auto-permit return traffic of established sessions, so outbound works with no matching inbound rule, while a NEW unsolicited probe hits the default inbound deny. A stateless security list would need explicit return rules covering ephemeral ports in both directions — remember that pair.');
      }
      const missing = [];
      if (!patchAllow) missing.push('run the outbound patch probe until it is ALLOWED');
      if (!probeDeny) missing.push('run the unsolicited probe and capture its DENY');
      if (patchAllow && probeDeny) missing.push('record both verdicts, the reason pick (“no-allow”) and the list answer (“nsl-return”)');
      return no('Simulation evidence incomplete', missing.join(' · '));
    }
    case 'M10': {
      const bad = M10_FLOWS.filter((f) => {
        const c = env.connChoice[f.id];
        return !c || norm(c.choice) !== f.answer || norm(c.factor) !== f.factor;
      });
      if (bad.length === 0) {
        return ok('Connectivity decisions justified', 'VPN: minutes to deploy, no circuit fees, internet-grade variability — right for burst and dev/test. Direct Connect: private circuit, predictable latency, sustained throughput — right for SLAs and bulk sync. Always attach the deciding factor; exam scenarios show their hand through SLA and volume words.');
      }
      return no(`${bad.length} flow decision(s) incomplete`, 'Pick option + factor per flow: dev/test burst → VPN + “fast to stand up, no circuit fees” · 2 TB sync → Direct Connect + “sustained throughput” · 99.99% telemetry → Direct Connect + “predictable latency”. Check: ' + bad.map((b) => b.label).join(' · '));
    }
    case 'M11': {
      const bad = M11_STATEMENTS.filter((s) => norm(env.conceptSort[s.id]) !== s.answer);
      if (bad.length === 0) {
        return ok('Multitenancy / elasticity / scalability separated', 'Multitenancy = many unrelated tenants, one physical platform, logical isolation. Elasticity = capacity that follows demand automatically (and the bill follows capacity). Scalability = the capacity to grow — bigger box (vertical) or more boxes (horizontal). Expect exam questions to hide the vertical/horizontal pair inside one scenario.');
      }
      return no(`${bad.length} statement(s) misclassified`, 'Signals: “same host, isolated tenants” → multitenancy · “auto adds/removes with demand, pay while used” → elasticity · “more vCPUs” (vertical) or “more identical VMs” (horizontal) → scalability. Check: ' + bad.map((b) => b.label).join(' · '));
    }
    case 'M12': {
      const causeOk = norm(env.flowTriage.cause) === 'cause-deny';
      const portOk = norm(env.flowTriage.fixPort) === '8443';
      const prio = Number(env.flowTriage.fixPriority);
      const prioOk = Number.isInteger(prio) && prio >= 10 && prio < 120;
      if (causeOk && portOk && prioOk) {
        return ok('Flow log triaged — minimal fix specified', 'You read the DENY’s MATCHED-RULE column and named the real cause: the legacy deny at priority 120 fires before anything else for the collector, and no allow covers 10.20.7.20. The fix is the narrowest allow — TCP/8443 from the collector’s address at a priority below 120. In production you would also schedule the deletion of that stale deny.');
      }
      const msgs = [];
      if (!causeOk) msgs.push('Cause: read the flow log’s MATCHED-RULE column — which rule actually fired for 10.20.7.20?');
      if (!portOk) msgs.push('Fix port: the collector speaks TCP 8443.');
      if (!prioOk) msgs.push('Fix priority: your allow must be evaluated BEFORE the deny at 120 — pick 10–119.');
      return no('Triage incomplete', msgs.join(' '));
    }

    // ═══ HARD ═══
    case 'H1': {
      const bad = H1_MANIFEST.filter((w) => norm(env.manifestAssign[w.id]) !== norm(w.correct));
      if (bad.length === 0) {
        return ok('Manifest re-filed — all ten rows correct', 'The three misfiles shared one root cause: “managed-sounding” pushed rows toward IaaS and “server-sounding” pushed rows toward PaaS. Control is the truth: CRM → SaaS, OS-patched Ubuntu fleet → IaaS, vendor-managed SQL engine → PaaS. And you left the two red herrings (managed Postgres, managed queue) untouched — that is the discipline the exam rewards.');
      }
      const wrongIds = bad.map((b) => b.label).join(' · ');
      return no(`${bad.length} row(s) still misfiled`, 'Trust definitions, not vibes: who manages the OS? the runtime? nothing? Rows still wrong: ' + wrongIds);
    }
    case 'H2': {
      const problems = [];
      if (norm(env.vpc.cidr) !== '10.200.0.0/16') problems.push('Flaw 1: CIDR still collides with HQ — must be 10.200.0.0/16.');
      const db = env.vpc.subnets.find((s) => s.name.toLowerCase().includes('db'));
      if (!db || db.type !== 'private') problems.push('Flaw 2: the db subnet is still public — set it private.');
      if (env.vpc.routeTarget !== 'nat') problems.push('Flaw 3: the private 0.0.0.0/0 route still points at the internet gateway — retarget the NAT gateway.');
      if (problems.length === 0) {
        return ok('Three design flaws fixed — design is now shippable', 'You corrected the classic landing-zone trio: overlapping CIDR (silent hybrid outage), database in a public subnet (internet-addressable production data — ATT&CK T1190 bait), and a private route pointed at the IGW (which would expose the whole private subnet). The jump host and NTP in the public subnet were intentional and documented — leaving them alone was the audit discipline under test.');
      }
      return no('Design still carries flaws', problems.join(' '));
    }
    case 'H3': {
      const fix = env.nsgRules.find((r) => r.direction === 'in' && r.action === 'allow' && r.protocol === 'TCP' && r.port === 8443 && norm(r.source) === '10.20.5.4/32');
      const scanAllow = env.packetRuns.some((r) => r.flowId === 'sim-scan' && r.result === 'allow');
      const nearMiss = env.nsgRules.find((r) => r.direction === 'in' && r.action === 'allow' && r.protocol === 'TCP' && r.port === 8443 && /10\.20\.5\.4\/(8|16|24|0)\b/.test(norm(r.source)) === false && /10\.20\.5\.4\b/.test(norm(r.source)) && norm(r.source) !== '10.20.5.4/32');
      if (fix && fix.priority < 120 && scanAllow) {
        return ok('Root cause fixed and proven in the simulator', 'Diagnosis: the scanner lives outside the ops /24, so the only matching rule was the legacy deny at priority 120 — first-match evaluation did the rest. Your fix is the minimal scoped allow (10.20.5.4/32, priority < 120), and the re-run probe turned ALLOW. Exactly how an NSG change should be born: evidence → minimal rule → simulated proof.');
      }
      if (fix && fix.priority >= 120) {
        return no('Near miss — your allow sits below the deny', `Your rule has priority ${fix.priority}, but the deny at 120 is evaluated FIRST (lower number wins). Rejected: move the allow to a priority below 120.`);
      }
      if (nearMiss) {
        return no('Near miss — source too broad', `Source “${nearMiss.source}” sweeps in addresses beyond the scanner. Strict mode expects exactly 10.20.5.4/32 — least privilege is the point of this objective.`);
      }
      const missing = [];
      if (!fix) missing.push('add: in · allow · TCP · 8443 · source 10.20.5.4/32 · priority < 120');
      if (!scanAllow) missing.push('re-run the “HQ scanner → App VM :8443” probe until ALLOW');
      return no('Fix not complete', missing.join(' · '));
    }
    case 'H4': {
      const required = [
        { direction: 'in', action: 'allow', protocol: 'TCP', port: 443, source: '0.0.0.0/0' },
        { direction: 'in', action: 'allow', protocol: 'TCP', port: 22, source: '10.20.0.0/16' },
        { direction: 'out', action: 'allow', protocol: 'TCP', port: 443, source: '0.0.0.0/0' },
        { direction: 'in', action: 'allow', protocol: 'TCP', port: 8443, source: '10.20.6.0/24' },
        { direction: 'in', action: 'allow', protocol: 'TCP', port: 8443, source: '10.20.5.4/32' },
      ];
      const missing = required.filter((q) => !findRule(env.nsgRules, q));
      const forbiddenRdp = env.nsgRules.filter((r) => r.port === 3389);
      const worldMgmt = env.nsgRules.filter((r) => r.direction === 'in' && r.action === 'allow' && (r.port === 22 || r.port === 3389) && isAnySource(r.source));
      const extras = env.nsgRules.length - required.length;
      if (missing.length === 0 && forbiddenRdp.length === 0 && worldMgmt.length === 0 && extras === 0) {
        return ok('Screening table is at exactly the approved five-rule set', 'This is least privilege as an exact end-state, not a vibe: two app-port allows scoped to named sources, one HQ-scoped SSH, one world HTTPS (the product), one patch egress. Every broad or dead rule you deleted was either attacker surface (world-open RDP/SSH) or evaluation noise (the stale deny). Keep the table this small and audits stay boring.');
      }
      const msgs = [];
      if (missing.length) msgs.push('Missing: ' + missing.map((m) => `${m.direction}/${m.action}/${m.protocol}/${m.port} from ${m.source}`).join(' · '));
      if (forbiddenRdp.length) msgs.push('Delete all RDP/3389 rules (jump path is SSH over the tunnel).');
      if (worldMgmt.length) msgs.push('World-open management ports remain — scope 22 to 10.20.0.0/16.');
      if (extras > 0) msgs.push(`Table has ${extras} extra rule(s) beyond the approved five — remove dead entries (legacy 8443 deny).`);
      if (extras < 0) msgs.push('A required rule is missing — see list above.');
      return no('Not the approved set yet', msgs.join(' '));
    }
    case 'H5': {
      const badFlows = GATEWAY_FLOWS.filter((f) => norm(env.gatewayPlan[f.id]) !== f.wants);
      const seqOk = env.seqOrder.length === SEQ_CORRECT.length && env.seqOrder.every((s, i) => s === SEQ_CORRECT[i]);
      if (badFlows.length === 0 && seqOk) {
        return ok('Full gateway architecture planned and sequenced', 'Five doors, five jobs: IGW (public in+out), NAT (private out-only), VPN gateway (HQ IPsec), Direct Connect (SLA circuit), transit gateway (VPC hub). The storage-gateway decoy bridges storage, not networks. And the build order matters: address space → subnets/routes → gateways → filters → test, because each layer depends on the one before it.');
      }
      const msgs = [];
      if (badFlows.length) msgs.push('Miswired flows: ' + badFlows.map((b) => b.label).join(' · '));
      if (!seqOk) msgs.push('Commissioning order must be: CIDR → subnets → gateways → NSG → test.');
      return no('Architecture incomplete', msgs.join(' '));
    }
    case 'H6': {
      const bad = H6_FUNCTIONS.filter((f) => norm(env.nfvBoard[f.id]) !== f.answer);
      const wanReason = norm(env.nfvReasons['b-wan']) === 'hardware-bound';
      const hsmReason = norm(env.nfvReasons['b-hsm']) === 'compliance';
      if (bad.length === 0 && wanReason && hsmReason) {
        return ok('NFV placement decided and justified', 'Four pure packet functions virtualize; two stay physical for reasons that are NOT “software is slow”: the DSP accelerator has no host to live on (hardware-bound), and the HSM exists to be tamper-resistant (compliance). Saying “software can never match hardware” in a design review would get the plan rejected — hardware limits and mandates are the defensible reasons.');
      }
      const msgs = [];
      if (bad.length) msgs.push('Placement wrong for: ' + bad.map((b) => b.label).join(' · '));
      if (!wanReason) msgs.push('Attach “hardware-bound” to the branch WAN accelerator.');
      if (!hsmReason) msgs.push('Attach “compliance” to the HSM.');
      return no('Placement board incomplete', msgs.join(' '));
    }
    case 'H7': {
      // Sequence contract: capture a DENY first, then prove recovery with an ALLOW
      // recorded AFTER that deny. (Using the first allow ever would permanently
      // dead-end any run where the student probed while NAT was already wired.)
      const denyRun = env.packetRuns.find((r) => r.flowId === 'sim-patch' && r.result === 'deny');
      const allowRun = denyRun
        ? env.packetRuns.find((r) => r.flowId === 'sim-patch' && r.result === 'allow' && r.order > denyRun.order)
        : undefined;
      const answerOk = norm(env.h7Answer) === 'h7-stateful';
      const ordered = !!denyRun && !!allowRun;
      if (ordered && answerOk) {
        return ok('Runbook executed in order — and the residual deny explained', 'You captured the failure before fixing it (deny: no route → NAT missing), wired the NAT gateway, proved recovery (allow via NAT), and then correctly explained that the unsolicited probe STILL fails: stateful default deny is the design working, not a fault. Distinguishing “broken” from “correctly closed” is the core SOC skill this runbook drills.');
      }
      const msgs = [];
      if (!denyRun) msgs.push('Run the outbound patch probe while the NAT gateway is NOT wired — capture the DENY first.');
      if (denyRun && !allowRun) msgs.push('Wire flow-egress → NAT gateway on the Gateways bench, then re-run the probe to ALLOW.');
      if (ordered && !answerOk) msgs.push('Final question: the unsolicited probe failing is expected — stateful default deny (option “h7-stateful”).');
      return no('Runbook incomplete or out of order', msgs.join(' '));
    }
    case 'H8': {
      const bad = H8_FLOWS.filter((f) => {
        const c = env.connChoice[f.id];
        return !c || norm(c.choice) !== f.answer || norm(c.factor) !== f.factor;
      });
      const trapOk = norm(env.notEncrypted) === 'direct';
      if (bad.length === 0 && trapOk) {
        return ok('Procurement matrix signed off — trap caught', 'You matched each flow’s economics: internet underlay for burst and 600-branch scale, private circuit for latency SLA and bulk throughput. And you caught the sign-off trap: Direct Connect ships UNENCRYPTED — privacy comes from the private path, confidentiality only from an IPsec/MACsec overlay. That sentence is worth real money in a security review.');
      }
      const msgs = [];
      if (bad.length) msgs.push('Incomplete flows: ' + bad.map((b) => b.label).join(' · '));
      if (!trapOk) msgs.push('Encryption trap: which option is NOT encrypted by default? (It rides a private path but needs an overlay for confidentiality.)');
      return no('Procurement matrix incomplete', msgs.join(' '));
    }
    case 'H9': {
      const bad = RESP_ITEMS.filter((i) => norm(env.respBoard[i.id]) !== i.paas);
      if (bad.length === 0) {
        return ok('PaaS responsibility audit complete', 'Moving the lane from IaaS to PaaS slid guest-OS patching AND runtime patching to the provider — that is the entire economic point of PaaS. What never moves: your code, your data, your NSG rules, your identities. Exam questions love flipping the lane; you have now done both sides from memory.');
      }
      return no(`${bad.length} operation(s) on the wrong side`, 'PaaS pushes the boundary up: OS and runtime are the provider’s now. Customer keeps: application code & data, NSG/firewall rules, identities & MFA. Check: ' + bad.map((b) => b.label).join(' · '));
    }
    default:
      return no('Unknown objective', 'This objective has no validator registered.');
  }
}
