/* ======================================================================
   GATEHOUSE lab — objective catalog + pure validation engine + stats
   Ported 1:1 from src/lib/lab/objectives.ts and the validation rules in
   src/lib/lab/validation.ts (rules, thresholds and feedback strings verbatim).
   ====================================================================== */

/* ---------- objective catalog (medium 12 / hard 9) ---------- */
const OBJECTIVES = [
  /* ---------- MEDIUM ---------- */
  {
    id: "OBJ-M1",
    mode: "medium",
    station: "vault",
    pillar: "understand",
    title:
      "Sort all eight data items into In transit / At rest, then pick the right protection for each of the four flows.",
    anchor: "Encryption — data in transit (TLS/IPsec) vs data at rest (FDE/DB-column)",
    hints: [
      "Ask one question per item: is this data moving across a link right now, or sitting on storage?",
      "Sessions, tunnels, replication and telemetry are moving. Backups, disks, server files and USB exports are stored.",
      "Demo: the backup NAS item is At rest → full-disk/column encryption class; the HTTPS session is In transit → TLS.",
    ],
    teach:
      "Every flow has a data state, and each state needs its own control: TLS/IPsec guard transit; full-disk and database-column encryption guard rest. Auditors classify flows before choosing controls — now you can too.",
  },
  {
    id: "OBJ-M2",
    mode: "medium",
    station: "badge",
    pillar: "understand",
    title:
      "Match the six PKI terms to their definitions, then order the five certificate-lifecycle steps.",
    anchor: "PKI — CA, CSR, key pair, CRL, OCSP, SAN + certificate lifecycle",
    hints: [
      "Think of the CA as the badge office: it verifies identity and signs. Who requests? Who publishes revocations?",
      "The lifecycle starts with the key pair and the request (CSR) — revocation/OCSP only matters after deployment.",
      "Demo order: Generate keys+CSR → CA validates → CA signs & issues → deploy & bind → renew or revoke (CRL/OCSP).",
    ],
    teach:
      "Certificates live and die: expiry and revocation checking (CRL/OCSP) is what keeps trust current. Meridian's expired portal certificate shows exactly what happens when this lifecycle is unmonitored.",
  },
  {
    id: "OBJ-M3",
    mode: "medium",
    station: "federation",
    pillar: "understand",
    title:
      "Order the five SAML SSO steps, label MeridianID and the EHR app as IdP/SP, and select the two benefits and two risks of SSO.",
    anchor: "SSO & SAML — IdP issues signed assertion; SP consumes; benefits vs concentration risk",
    hints: [
      "The user always starts at the application (SP); the identity provider only speaks when asked.",
      "After the IdP authenticates the user, it hands back a signed assertion — then the SP opens the session.",
      "Demo: risks to pick are the IdP outage blocking everything, and one phished password unlocking many apps.",
    ],
    teach:
      "SSO trades password sprawl for concentration of risk at the IdP. That trade is worth it — with step-up MFA, short sessions and IdP resilience paying the interest.",
  },
  {
    id: "OBJ-M4",
    mode: "medium",
    station: "directory",
    pillar: "recognize",
    title:
      "Build the full LDAP distinguished name for Dr. Chen, then choose the port and setting that make binds confidential.",
    anchor: "LDAP — DN structure (CN/OU/DC) + 389 vs 636 LDAPS",
    hints: [
      "A DN reads from the leaf inward-to-the-top? No — it reads most-specific first: CN, then OU, then DC components.",
      "Dr. Chen is CN=d.chen inside OU=Clinical under DC=meridianregional,DC=org.",
      "Demo answer: CN=d.chen,OU=Clinical,DC=meridianregional,DC=org — and LDAPS on port 636.",
    ],
    teach:
      "DNs are addresses in the directory tree — every bind and search uses one. The morning billing-app binds on 389 with tls=NONE are exactly the kind of traffic an auditor flags next.",
  },
  {
    id: "OBJ-M5",
    mode: "medium",
    station: "radio",
    pillar: "recognize",
    title:
      "Assign RADIUS / TACACS+ / LDAP to the three scenarios with the right reason, then answer the port and encryption facts.",
    anchor: "RADIUS (UDP 1812, password-only) vs TACACS+ (TCP 49, full payload) vs LDAP (directory)",
    hints: [
      "Who is the client? A tablet joining Wi-Fi, an engineer on a switch CLI, or an app looking up attributes?",
      "802.1X network access → RADIUS. Device administration with per-command control → TACACS+. Attribute lookups → LDAP.",
      "Demo facts: RADIUS = UDP 1812, encrypts only the password field; TACACS+ = TCP 49, encrypts the entire payload.",
    ],
    teach:
      "These three cover almost every 'which protocol?' exam question: access broker, device AAA, directory access. The core switch using RADIUS with no command accounting is tonight's planted version of getting it wrong.",
  },
  {
    id: "OBJ-M6",
    mode: "medium",
    station: "gate",
    pillar: "mitigate",
    title:
      "Assemble a compliant MFA chain for remote VPN access (two different factor categories), then answer the reflection about password + security questions.",
    anchor: "MFA — two+ distinct factors (know/have/are)",
    hints: [
      "Pick at least two chips from two DIFFERENT categories — the tray labels each factor's category.",
      "Password alone is never enough; pair it with something you have (TOTP, hardware key) or are (fingerprint).",
      "Demo chain: Password + TOTP authenticator code — know + have. Reflection: password + security questions is NOT MFA (same category).",
    ],
    teach:
      "MFA collapses most credential-stuffing attacks. The push-flood in Incident 2211 shows the residual risk — which is why number matching and context checks ride on top of every push.",
  },
  {
    id: "OBJ-M7",
    mode: "medium",
    station: "roles",
    pillar: "mitigate",
    title:
      "Rebuild the RBAC matrix to least privilege: the registry import left every cell blank except four over-grants — grant exactly what each role's job needs, remove the rest, and handle the three joiner/mover/leaver cases.",
    anchor: "Authorization — RBAC + least privilege + IAM lifecycle (IAM)",
    hints: [
      "The matrix starts empty: a grant is missing unless the role's job truly requires it. Four cells were planted with more than the job needs — un-grant them.",
      "Grants: nurses and physicians chart (EHR read + write) and view labs; lab techs view labs + read EHR; billing posts payments + reads demographics; IT admin gets device SSH, badge issuing, guest Wi-Fi — never patient data; contractors get nothing.",
      "Demo lifecycle: joiner → provision role; mover → re-assign role; leaver → disable account & revoke credentials. Matrix target: exactly 13 granted cells.",
    ],
    teach:
      "Least privilege is the cheapest blast-radius reducer in the hospital. The billing EHR-write cell you just removed is exactly what made Incident 2211 an export instead of a failed login.",
  },
  {
    id: "OBJ-M8",
    mode: "medium",
    station: "clock",
    pillar: "mitigate",
    title:
      "Set the geofence allow/deny rules for the three personas and judge the four live access events.",
    anchor: "Geofencing — zone rules + exceptions for traveling staff",
    hints: [
      "Staff roam the campus+metro; the contractor is campus-only; the traveling physician gets an in-country exception.",
      "Abroad is denied for everyone — the exception is country-level, not worldwide.",
      "Demo: coffee shop in metro = allow; contractor VPN from abroad = deny; conference in-country = allow; resort abroad = deny.",
    ],
    teach:
      "Geofencing narrows where a stolen credential is even usable. It is a context signal, not a wall — VPN spoofing defeats IP fences, so exceptions and step-up MFA stay governed.",
  },
  {
    id: "OBJ-M9",
    mode: "medium",
    station: "clock",
    pillar: "detect",
    title:
      "Set the shift login windows for the three roster roles, then diagnose the TOTP lockouts from ntp.log and choose the fix.",
    anchor: "Time-based authentication — login windows + TOTP/NTP sync",
    hints: [
      "Nurses run 19:00→07:00 (end before start = overnight wrap); billing and contractors run business hours Mon–Fri.",
      "Read ntp.log: the pool source is UNREACHABLE and offset is +4.7 s — far beyond the ±100 ms policy.",
      "Demo: cause = dead NTP → drift breaks the 30 s TOTP window; fix = re-sync to internal NTP + drift alert.",
    ],
    teach:
      "Time-based authentication is only as good as the clock behind it. Monitoring NTP offset is detection work most hospitals skip — until 14:05 lockouts.",
  },
  {
    id: "OBJ-M10",
    mode: "medium",
    station: "audit",
    pillar: "detect",
    title:
      "Raise a flag for every real misconfiguration hiding in the evidence — and none for the two benign events.",
    anchor: "Detection — evidence review across logs/configs (data sources)",
    hints: [
      "Six candidates are real. Cross-check every log tab: ldap.log, vpn-policy.cfg, certs.txt, hr-roster.txt, ntp.log, core-sw1.cfg.",
      "The 03:00 logins match the night-shift roster; the svc_backup rejects have an open change ticket (CHG-2041).",
      "Demo real set: cleartext LDAP, contractor MFA off, expired cert, leaver active, NTP drift, RADIUS-for-device-admin.",
    ],
    teach:
      "Detection starts with knowing the baseline: shifts, tickets and rosters turn scary-looking lines into false positives — and policy files turn quiet lines into findings.",
  },
  {
    id: "OBJ-M11",
    mode: "medium",
    station: "audit",
    pillar: "detect",
    title: "Classify the six audit events as true or false positives.",
    anchor: "Detection — true vs false positive judgment with context",
    hints: [
      "For each event ask: does it violate policy, or does it merely look unusual?",
      "Roster (night shift, on-call) and the change ticket explain half the list.",
      "Demo: pushes flood + cleartext bind + foreign resort = true; night nurse, on-call doctor, backup rejects = false.",
    ],
    teach:
      "True-positive discipline is what makes paging meaningful: every false positive you can explain with context makes the real ones louder.",
  },
  {
    id: "OBJ-M12",
    mode: "medium",
    station: "harden",
    pillar: "mitigate",
    title:
      "Match each of the five gaps to its control, then order the six remediation steps.",
    anchor: "Mitigation set — control selection + sequencing (M1018/M1032/M1041/M1026)",
    hints: [
      "Each gap has exactly one direct control; the decoys (firewall appliance, more admins, less logging) fix nothing here.",
      "Contain first (disable the leaver), then rebuild trust (certificate before LDAPS enforcement).",
      "Demo order: leaver → renew cert → enforce LDAPS → re-sync NTP → VPN MFA → quarterly recertification.",
    ],
    teach:
      "Mitigation is sequencing: containment before rebuilding, dependencies respected (LDAPS needs the new certificate), and a recurring control (recertification) so the fixes stay fixed.",
  },

  /* ---------- HARD ---------- */
  {
    id: "OBJ-H1",
    mode: "hard",
    station: "harden",
    pillar: "understand",
    title:
      "Place all ten controls on the defense-in-depth blueprint so the CISO briefing is correct.",
    anchor: "Full-concept synthesis — every control to its layer (Access Context / Identity / Authorization / Data / Audit)",
    hints:
      [
        "Layer questions: does it gate where/when a connection may ask (context), prove who asks (identity), decide what they may do (authorization), protect the payload (data), or record it (audit)?",
      ],
    teach:
      "Defense in depth only works when each layer actually holds its assigned control — a fence in the data layer protects nothing. You can now brief a CISO on why one missing layer breaks the chain.",
  },
  {
    id: "OBJ-H2",
    mode: "hard",
    station: "audit",
    pillar: "recognize",
    title:
      "Reconstruct Incident 2211: order the five events, select the four missing controls, and give the exact MITRE technique ID for the push flood.",
    anchor: "Incident analysis — chain reconstruction + MITRE T1621 + control-gap analysis",
    hints: [
      "Work from the breach-check date forward: credential dump → pushes → approval → assertion → export.",
      "Missing controls are the ones that, if present, would have broken the chain — geofence, number matching, least privilege, session revocation.",
      "The push flood is catalogued as T1621 (Multi-Factor Authentication Request Generation).",
    ],
    teach:
      "Incident narratives are control analyses: each step happened because a control was absent. Reconstructing the chain tells you exactly which mitigations buy the most risk reduction.",
  },
  {
    id: "OBJ-H4",
    mode: "hard",
    station: "badge",
    pillar: "recognize",
    title:
      "Inspect the two certificates: identify the broken one and check exactly the three field-level defects.",
    anchor: "PKI forensics — validity dates, SAN hostnames, signature algorithms",
    hints: [
      "Compare notAfter against today (2025-11-04), then read the SAN character by character against the service hostname.",
      "Two defects are obvious in CERT-1; the third is the signature algorithm.",
      "Internal-CA issuance and RSA-2048 are perfectly acceptable — do not flag them.",
    ],
    teach:
      "Certificate forensics is field-by-field reading: validity window, SAN coverage, signature strength. Three silent defects on one line of certs.txt caused this morning's portal outage.",
  },
  {
    id: "OBJ-H5",
    mode: "hard",
    station: "radio",
    pillar: "recognize",
    title:
      "Complete the full protocol mapping table — protocol and key property for all six requirements.",
    anchor: "Protocol deep-dive — RADIUS/TACACS+/LDAP/SAML/TOTP/biometrics with exact facts",
    hints: [
      "Pair each protocol with its signature fact: port/transport and encryption scope are in those facts.",
      "Two fact options are decoys with wrong ports or mismatched mechanisms.",
      "Biometric badge = 'something you are'; rotating codes = TOTP with a 30 s NTP-dependent window.",
    ],
    teach:
      "The exam asks these pairings cold: 1812/UDP/password-only vs 49/TCP/full-payload vs 389/636 bind+search vs signed assertions vs time-windowed codes vs inherent factors.",
  },
  {
    id: "OBJ-H3",
    mode: "hard",
    station: "audit",
    pillar: "detect",
    title:
      "Build three working detection rules: pick the data source, the exact condition set, and the threshold for each.",
    anchor: "Detection engineering — sources (IdP/VPN, push, TACACS+) + conditions + thresholds",
    hints: [
      "Match the rule to the log that would actually contain the events: pushes live in IdP push logs, commands in TACACS+ accounting.",
      "Impossible travel needs: same user, two locations/countries, inside 10 minutes.",
      "The push-flood rule: ≥5 requests, zero approvals, within 5 minutes — alert on one burst.",
    ],
    teach:
      "A detection is source + condition + threshold. Wrong source = silent rule; wrong conditions = noise. These three rules would have caught Incident 2211 at 09:42.",
  },
  {
    id: "OBJ-H6",
    mode: "hard",
    station: "roles",
    pillar: "mitigate",
    title:
      "Rebuild the entire 6×8 RBAC matrix from the persona dossiers — zero over-grants, zero missing grants.",
    anchor: "Least privilege at scale — full RBAC construction from role requirements",
    hints: [
      "Read each dossier's verb: 'reads demographics', 'posts payments', 'administers switches'. Only verbs grant cells.",
      "Contractors get no clinical permissions at all — their only route is the internet VLAN.",
      "15 grants total: nurses and physicians share three, lab techs two, billing two, IT admin three, contractors none.",
    ],
    teach:
      "Full-matrix construction proves you can reason permissions from job verbs instead of copying templates — the discipline that keeps least privilege true as the hospital changes.",
  },
  {
    id: "OBJ-H7",
    mode: "hard",
    station: "harden",
    pillar: "mitigate",
    title:
      "Complete the zero-trust access plan: choose the right control for all 15 cells across the five access paths.",
    anchor: "Mitigation selection per path — MFA/transport/context per access vector",
    hints: [
      "Every path needs all three answers: strong auth, encrypted transport, and a context or session control.",
      "Device CLI wants TACACS+ over SSH on a management VLAN — never Telnet or shared logins.",
      "Wi-Fi is 802.1X EAP-TLS with per-device certificates and dynamic VLANs.",
    ],
    teach:
      "Zero trust is per-path decisions, not one big control: each of the five paths got auth + transport + context chosen deliberately. That plan is your 4.1 objective in operational form.",
  },
  {
    id: "OBJ-H8",
    mode: "hard",
    station: "multi",
    pillar: "mitigate",
    title:
      "Resolve all four trade-off cards: pick a stance and mark the residual risks that remain.",
    anchor: "Evaluate — SSO, TOTP vs keys, geofence exceptions, RBAC granularity + residual risk",
    hints: [
      "Each stance names residual risks that SURVIVE your choice — pick exactly those two per card.",
      "Session theft and IdP outage survive even a well-run SSO.",
      "Phishable codes and clock drift survive TOTP; VPN spoofing and exception review survive geofencing; role creep and mis-classification survive RBAC.",
    ],
    teach:
      "Naming residual risk is the difference between a control list and an actual risk decision. Every mitigation you deployed tonight leaves two — now you can say which.",
  },
  {
    id: "OBJ-H9",
    mode: "hard",
    station: "harden",
    pillar: "mitigate",
    title:
      "Sequence all eight remediation actions in dependency-correct order — the platform rejects orders that break dependencies with a rationale.",
    anchor: "Mitigation sequencing with dependency validation (contain → fix trust → enforce → institutionalize)",
    hints: [
      "Containment before anything; the clock before the codes that depend on it; the certificate before the service that binds it.",
      "TOTP verification must follow NTP repair; LDAPS enforcement must follow the certificate reissue.",
      "Institutional controls (recertification) close the runbook after all technical fixes.",
    ],
    teach:
      "Hardening fails most often in the ordering: enforce LDAPS before the certificate and you extend the outage; skip containment and the attacker works while you fix. Sequencing is mitigation.",
  },
];

const objectById = (id) => OBJECTIVES.find((o) => o.id === id);
const objectivesForMode = (m) => OBJECTIVES.filter((o) => o.mode === m);

/* ---------- pure validation helpers ---------- */
const setEq = (a, b) =>
  a.length === b.length && [...a].sort().join("¦") === [...b].sort().join("¦");

/* order-sensitive equality for sequences (lifecycles, flows, runbooks) */
const seqEq = (a, b) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

const boolMapEq = (a, truth) => {
  const keys = new Set([...Object.keys(truth), ...Object.keys(a)]);
  for (const k of keys) if (!!a[k] !== !!truth[k]) return false;
  return true;
};

/* ---------- per-objective validation ---------- */
function validateObjective(id, env) {
  switch (id) {
    case "OBJ-M1": {
      const missC = VAULT_ITEMS.filter((i) => env.vault.cls[i.id] !== i.b);
      const missP = VAULT_FLOWS.filter((f) => env.vault.prot[f.id] !== f.correct);
      if (!missC.length && !missP.length)
        return { pass: true, fb: "All eight data states and all four protections correct." };
      const parts = [];
      if (missC.length)
        parts.push(
          `misclassified: ${missC.slice(0, 3).map((i) => `"${i.label}" is ${i.b === "transit" ? "in transit" : "at rest"}`).join(" / ")}${missC.length > 3 ? ` (+${missC.length - 3} more)` : ""}`
        );
      if (missP.length) parts.push(`wrong protection: ${missP.map((f) => f.label).join(" / ")}`);
      return { pass: false, fb: `Not yet — ${parts.join("; ")}. Transit = moving (TLS/IPsec). Rest = stored (disk/db).` };
    }
    case "OBJ-M2": {
      const badT = PKI_TERMS.filter((t) => env.badge.terms[t.id] !== t.correct);
      const lifeOk = seqEq(env.badge.life, PKI_LIFECYCLE.map((l) => l.id));
      if (!badT.length && lifeOk)
        return { pass: true, fb: "PKI vocabulary and lifecycle in order." };
      const parts = [];
      if (badT.length) parts.push(`${badT.length} term(s) mismatched`);
      if (!lifeOk) parts.push("lifecycle order wrong — it starts with the key pair + CSR and ends with renewal/revocation");
      return { pass: false, fb: `Not yet: ${parts.join("; ")}.` };
    }
    case "OBJ-M3": {
      const flowOk = seqEq(env.federation.flow, SAML_STEPS.map((s) => s.id));
      const roleOk = env.federation.role1 === "idp" && env.federation.role2 === "sp";
      const benOk = setEq(env.federation.ben, SSO_BEN);
      const riskOk = setEq(env.federation.risk, SSO_RISK);
      if (flowOk && roleOk && benOk && riskOk)
        return { pass: true, fb: "SAML handshake ordered, actors labeled, SSO trade-offs named." };
      const parts = [];
      if (!flowOk) parts.push("flow order wrong — the user starts at the SP, the IdP returns the signed assertion");
      if (!roleOk) parts.push("IdP/SP labels swapped — MeridianID issues assertions (IdP); the EHR app consumes them (SP)");
      if (!benOk || !riskOk) parts.push("benefit/risk selection off — the two risks are IdP outage and one phished password unlocking many apps");
      return { pass: false, fb: `Not yet: ${parts.join("; ")}.` };
    }
    case "OBJ-M4": {
      const dnOk = seqEq(env.directory.dn, DN_ORDER);
      const portOk = env.directory.port === "636";
      if (dnOk && portOk)
        return { pass: true, fb: "DN built correctly and binds moved to LDAPS/636." };
      const parts = [];
      if (!dnOk) parts.push("DN should read CN=d.chen,OU=Clinical,DC=meridianregional,DC=org — most-specific first");
      if (!portOk) parts.push("confidential binds = LDAPS on 636");
      return { pass: false, fb: `Not yet: ${parts.join("; ")}.` };
    }
    case "OBJ-M5": {
      const pOk = RADIO_SCENARIOS.every((s) => env.radio.pick[s.id] === s.proto);
      const rOk = RADIO_SCENARIOS.every((s) => env.radio.reason[s.id] === s.reason);
      const fOk = RADIO_FACTS.every((f) => env.radio.facts[f.id] === f.correct);
      if (pOk && rOk && fOk)
        return { pass: true, fb: "RADIUS/TACACS+/LDAP assigned with correct facts — ports and encryption scope cold." };
      const parts = [];
      if (!pOk || !rOk) parts.push("scenario mapping off — 802.1X→RADIUS, device admin→TACACS+, directory lookups→LDAP");
      if (!fOk) parts.push("facts: RADIUS UDP 1812/password-only; TACACS+ TCP 49/full payload");
      return { pass: false, fb: `Not yet: ${parts.join("; ")}.` };
    }
    case "OBJ-M6": {
      const chosen = MFA_FACTORS.filter((f) => env.gate.factors.includes(f.id));
      const cats = new Set(chosen.map((f) => f.cat));
      const reflectOk = env.gate.reflect === "no" && env.gate.why === "w1";
      if (chosen.length >= 2 && cats.size >= 2 && reflectOk)
        return { pass: true, fb: "MFA chain spans two factor categories — and you can defend why two knowledge items are not MFA." };
      const parts = [];
      if (chosen.length < 2 || cats.size < 2)
        parts.push("select at least two factors from two different categories (know/have/are)");
      if (!reflectOk) parts.push("password + security questions are both 'something you know' — not MFA");
      return { pass: false, fb: `Not yet: ${parts.join("; ")}.` };
    }
    case "OBJ-M7": {
      const matrixOk = boolMapEq(env.roles.matrix, RBAC_TRUTH);
      const lifeOk = LIFE_CASES.every((c) => env.roles.life[c.id] === c.correct);
      if (matrixOk && lifeOk)
        return { pass: true, fb: "Matrix now matches least privilege and the lifecycle cases are handled." };
      const over = Object.keys(env.roles.matrix).filter(
        (k) => env.roles.matrix[k] && !RBAC_TRUTH[k]
      );
      const missing = Object.keys(RBAC_TRUTH).filter(
        (k) => RBAC_TRUTH[k] && !env.roles.matrix[k]
      );
      const parts = [];
      if (over.length) parts.push(`still over-granted: ${over.join(", ")}`);
      if (missing.length) parts.push(`needed grants missing: ${missing.join(", ")}`);
      if (!lifeOk) parts.push("lifecycle: provision the joiner, re-assign the mover, disable the leaver");
      return { pass: false, fb: `Not yet: ${parts.join("; ")}.` };
    }
    case "OBJ-M8": {
      const fenceOk = boolMapEq(env.clock.fence, FENCE_TRUTH);
      const evOk = FENCE_EVENTS.every((e) => env.clock.events[e.id] === e.ans);
      if (fenceOk && evOk)
        return { pass: true, fb: "Geofence matches policy and all four live events judged correctly." };
      const parts = [];
      if (!fenceOk) parts.push("zones: staff campus+metro; traveler adds in-country; contractor campus-only; abroad denies all");
      if (!evOk) parts.push("re-judge the events against the zones you set");
      return { pass: false, fb: `Not yet: ${parts.join("; ")}.` };
    }
    case "OBJ-M9": {
      const wOk = WINDOW_ROLES.every(
        (w) => {
          const s = env.clock.win[w.id];
          return !!s && s.start === w.start && s.end === w.end && s.days === w.days;
        }
      );
      const cOk = env.clock.ntpCause === "c1" && env.clock.ntpFix === "f1";
      if (wOk && cOk)
        return { pass: true, fb: "Shift windows set and the TOTP lockout traced to NTP drift with the right fix." };
      const parts = [];
      if (!wOk) parts.push("windows: nights 19:00→07:00 (wrap), billing 08:00–18:00 Mon–Fri, contractor 08:00–17:00 Mon–Fri");
      if (!cOk) parts.push("ntp.log: pool unreachable → +4.7 s drift → 30 s TOTP window breaks; re-sync + drift alert");
      return { pass: false, fb: `Not yet: ${parts.join("; ")}.` };
    }
    case "OBJ-M10": {
      const raised = env.audit.flags;
      const herrings = raised.filter((f) => !AUDIT_REAL.includes(f));
      const missed = AUDIT_REAL.filter((f) => !raised.includes(f));
      if (!herrings.length && missed.length <= 1)
        return { pass: true, fb: "Findings raised cleanly — and the two benign events stayed unflagged." };
      const parts = [];
      if (herrings.length) {
        const names = herrings.map((h) => (AUDIT_FLAGS.find((x) => x.id === h) || {}).short);
        parts.push(`false flags (benign): ${names.join(" / ")}`);
      }
      if (missed.length > 1) parts.push(`still hidden: ${missed.map((m) => (AUDIT_FLAGS.find((x) => x.id === m) || {}).tab).join(", ")}`);
      return { pass: false, fb: `Not yet: ${parts.join("; ")}.` };
    }
    case "OBJ-M11": {
      const bad = TPFP_EVENTS.filter((e) => env.audit.tpfp[e.id] !== e.ans);
      if (!bad.length)
        return { pass: true, fb: "All six events judged correctly — context (roster, tickets) did the work." };
      const wrong = bad.map((e) => `${e.id} (${e.ans === "tp" ? "true" : "false"} positive)`);
      return { pass: false, fb: `Not yet — misjudged: ${wrong.join(", ")}. Ask: policy violation, or just unusual?` };
    }
    case "OBJ-M12": {
      const gOk = M12_GAPS.every((g) => env.harden.gaps[g.id] === g.correct);
      const sOk = seqEq(env.harden.seq, M12_SEQ.map((s) => s.id));
      if (gOk && sOk)
        return { pass: true, fb: "Controls matched to gaps and the runbook sequenced with dependencies intact." };
      const parts = [];
      if (!gOk) parts.push("one or more gap→control matches off — the decoys fix nothing here");
      if (!sOk) parts.push("order: contain the leaver first; the new certificate must precede LDAPS enforcement");
      return { pass: false, fb: `Not yet: ${parts.join("; ")}.` };
    }
    case "OBJ-H1": {
      const bad = H1_CONTROLS.filter((c) => env.harden.h1[c.id] !== c.layer);
      if (!bad.length)
        return { pass: true, fb: "Blueprint correct — all ten controls sit in their operational layer." };
      const wrong = bad.map((c) => `${c.label} → ${H1_LAYERS_LABEL[c.layer] ?? c.layer}`);
      return {
        pass: false,
        fb: `Near-miss: ${wrong.length} control(s) misplaced. Correct layering: ${wrong.join("; ")}. Ask what each control actually gates.`,
      };
    }
    case "OBJ-H2": {
      const seqOk = seqEq(env.audit.h2.seq, H2_SEQ.map((s) => s.id));
      const ctlCorrect = H2_CONTROLS.filter((c) => c.correct).map((c) => c.id);
      const ctlOk = setEq(env.audit.h2.controls, ctlCorrect);
      const mitreOk = H2_MITRE.test(env.audit.h2.mitre.trim());
      if (seqOk && ctlOk && mitreOk)
        return { pass: true, fb: "Incident 2211 fully reconstructed — chain, missing controls, and T1621 named." };
      const parts = [];
      if (!seqOk) parts.push("event order: dump → push flood → approval → assertion → export");
      if (!ctlOk) parts.push("missing controls are the four whose presence would have broken the chain — full-disk encryption, TACACS+ accounting, Wi-Fi passphrase and UPS are red herrings");
      if (!mitreOk) parts.push("MITRE ID must be exactly T1621");
      return { pass: false, fb: `Not yet: ${parts.join("; ")}.` };
    }
    case "OBJ-H3": {
      const bad = [];
      for (const r of H3_RULES) {
        const d = env.audit.h3[r.id];
        if (!d) { bad.push(`${r.name}: empty`); continue; }
        const srcOk = d.src === r.src;
        const condOk = setEq(d.conds, r.conds);
        const thrOk = d.thr === r.thr;
        if (!srcOk) bad.push(`${r.name}: wrong data source`);
        if (!condOk) bad.push(`${r.name}: condition set off (needs exactly: ${r.conds.length} condition(s))`);
        if (!thrOk) bad.push(`${r.name}: threshold off`);
      }
      if (!bad.length)
        return { pass: true, fb: "Three detections engineered with the right sources, conditions and thresholds." };
      return { pass: false, fb: `Near-miss: ${bad.join("; ")}. A rule on the wrong source can never fire — check the log each event type actually lands in.` };
    }
    case "OBJ-H4": {
      const pickOk = env.badge.hardPick === "cert1";
      const correct = ["d-exp", "d-san", "d-sha1"];
      const defOk = setEq(env.badge.hardDefs, correct);
      if (pickOk && defOk)
        return { pass: true, fb: "CERT-1 isolated with exactly its three field-level defects." };
      const parts = [];
      if (!pickOk) parts.push("CERT-2 is healthy — the broken one is CERT-1");
      if (!defOk) {
        const extra = env.badge.hardDefs.filter((d) => !correct.includes(d));
        const missing = correct.filter((d) => !env.badge.hardDefs.includes(d));
        if (extra.length) parts.push(`not defects (do not flag): ${extra.map((e) => H4_LABELS[e] ?? e).join(" / ")}`);
        if (missing.length) parts.push(`missed defects: ${missing.map((e) => H4_LABELS[e] ?? e).join(" / ")}`);
      }
      return { pass: false, fb: `Near-miss: ${parts.join("; ")}.` };
    }
    case "OBJ-H5": {
      const bad = H5_ROWS.filter(
        (r) =>
          env.radio.h5[`${r.id}:proto`] !== r.proto ||
          env.radio.h5[`${r.id}:fact`] !== r.fact
      );
      if (!bad.length)
        return { pass: true, fb: "Full protocol table correct — six requirement rows, exact pairings." };
      const detail = bad
        .map((r) => `${r.prompt} → ${r.proto.replace("p-", "")} + ${r.fact.replace("f-", "")}`)
        .slice(0, 3)
        .join("; ");
      return {
        pass: false,
        fb: `Near-miss: ${bad.length} row(s) wrong. Expected: ${detail}. RADIUS is 1812/UDP/password-only; TACACS+ is 49/TCP/full payload; directory is bind+search.`,
      };
    }
    case "OBJ-H6": {
      const over = Object.keys(env.roles.matrix).filter(
        (k) => env.roles.matrix[k] && !RBAC_TRUTH[k]
      );
      const missing = Object.keys(RBAC_TRUTH).filter(
        (k) => RBAC_TRUTH[k] && !env.roles.matrix[k]
      );
      if (!over.length && !missing.length)
        return { pass: true, fb: "Full 6×8 matrix rebuilt — zero over-grants, zero missing grants." };
      const parts = [];
      if (over.length) parts.push(`over-granted (${over.length}): ${over.slice(0, 3).join(", ")}${over.length > 3 ? "…" : ""}`);
      if (missing.length) parts.push(`missing grants (${missing.length}): ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "…" : ""}`);
      return { pass: false, fb: `Near-miss: ${parts.join("; ")}. Reason from each dossier's verbs — 'reads' grants read, nothing more.` };
    }
    case "OBJ-H7": {
      const bad = [];
      for (const p of H7_PATHS)
        for (const s of p.slots)
          if (env.harden.h7[`${p.id}:${s.id}`] !== s.correct)
            bad.push(`${p.label}/${s.label}`);
      if (!bad.length)
        return { pass: true, fb: "Zero-trust access plan complete — all five paths, all 15 control cells." };
      return {
        pass: false,
        fb: `Near-miss: ${bad.length} cell(s) off (${bad.slice(0, 4).join(", ")}${bad.length > 4 ? "…" : ""}). Each path needs strong auth + encrypted transport + a context/session control.`,
      };
    }
    case "OBJ-H8": {
      const bad = [];
      for (const c of H8_CARDS) {
        const st = env[c.id].h8;
        const correctRisks = c.riskPool.filter((r) => r.correct).map((r) => r.id);
        if (st.stance !== c.stanceCorrect) bad.push(`${c.title}: stance`);
        if (!setEq(st.risk, correctRisks)) bad.push(`${c.title}: residual-risk set`);
      }
      if (!bad.length)
        return { pass: true, fb: "All four trade-offs resolved with honest residual risks named." };
      return {
        pass: false,
        fb: `Near-miss: ${bad.join("; ")}. Residual risks are what SURVIVES your stance — not everything in the pool.`,
      };
    }
    case "OBJ-H9": {
      const want = H9_STEPS.map((s) => s.id);
      if (seqEq(env.harden.h9, want))
        return { pass: true, fb: "Runbook sequenced with every dependency intact." };
      const got = env.harden.h9;
      for (let i = 0; i < Math.min(got.length, want.length); i++) {
        if (got[i] !== want[i]) {
          const wantLabel = (H9_STEPS.find((s) => s.id === want[i]) || {}).label ?? want[i];
          return {
            pass: false,
            fb: `Near-miss: position ${i + 1} should be "${wantLabel}". Dependencies: TOTP verification needs NTP fixed; LDAPS enforcement needs the new certificate deployed.`,
          };
        }
      }
      return { pass: false, fb: `Incomplete — ${got.length}/8 steps placed, in order.` };
    }
    default:
      return { pass: false, fb: "Unknown objective." };
  }
}

const H1_LAYERS_LABEL = {
  "ly-ctx": "Access Context",
  "ly-idn": "Identity & Authentication",
  "ly-authz": "Authorization & Least Privilege",
  "ly-data": "Data Protection",
  "ly-acct": "Audit & Accounting",
};
const H4_LABELS = {
  "d-exp": "expired validity",
  "d-san": "SAN hostname mismatch",
  "d-sha1": "SHA-1 signature",
  "d-self": "self-signed claim",
  "d-intca": "internal CA issuer",
  "d-key": "RSA-2048 key",
  "d-valid": "two-year validity",
};

/* ---------- stats / stars ---------- */
function quizScore(quiz, mode) {
  const qs = mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM;
  if (!quiz.quizSubmitted) return null;
  let correct = 0;
  for (const q of qs) if (setEq(quiz.quizAnswers[q.id] ?? [], q.correct)) correct++;
  return { correct, total: qs.length, ratio: correct / qs.length };
}

function computeStats(obj, quiz, mode) {
  const list = objectivesForMode(mode);
  const total = list.length;
  const doneCount = list.filter((o) => obj[o.id]?.done).length;
  const firstAttemptRatio = total
    ? list.filter((o) => obj[o.id]?.firstAttempt).length / total
    : 0;
  const hintsUsed = list.reduce((acc, o) => acc + (obj[o.id]?.hintsUsed ?? 0), 0);
  const q = quizScore(quiz, mode);
  const allDone = doneCount === total && total > 0;
  let stars = null;
  let score = null;
  if (allDone && q) {
    const hintScore = Math.max(0, 1 - hintsUsed * 0.05);
    const base = 0.55 * firstAttemptRatio + 0.35 * q.ratio + 0.1 * hintScore;
    stars = Math.min(5, Math.max(1, Math.round((1 + 4 * base) * 2) / 2));
    score = Math.round((0.6 * firstAttemptRatio + 0.4 * q.ratio) * 100);
  }
  return { total, doneCount, firstAttemptRatio, hintsUsed, quiz: q, allDone, stars, score };
}

/* ---------- factory: pristine environment ---------- */
function initialEnv() {
  const cls = {};
  VAULT_ITEMS.forEach((i) => (cls[i.id] = null));
  const prot = {};
  VAULT_FLOWS.forEach((f) => (prot[f.id] = null));
  const terms = {};
  PKI_TERMS.forEach((t) => (terms[t.id] = null));
  const pick = {};
  const reason = {};
  RADIO_SCENARIOS.forEach((s) => {
    pick[s.id] = null;
    reason[s.id] = null;
  });
  const facts = {};
  RADIO_FACTS.forEach((f) => (facts[f.id] = null));
  const matrix = {};
  RBAC_ROLES.forEach((r) =>
    RBAC_PERMS.forEach((p) => {
      matrix[`${r}:${p.id}`] = false;
    })
  );
  // planted over-grants (least-privilege violations to be found)
  matrix["billing:ehr_write"] = true;
  matrix["contractor:hr_portal"] = true;
  matrix["nurse:device_ssh"] = true;
  matrix["itadmin:ehr_read"] = true;
  const win = {};
  WINDOW_ROLES.forEach((w) => (win[w.id] = null));
  const fence = {};
  FENCE_PERSONAS.forEach((p) =>
    FENCE_ZONES.forEach((z) => {
      fence[`${p.id}:${z.id}`] = false;
    })
  );
  // planted geofence over-allowances
  fence["staff:country"] = true;
  fence["contractor:metro"] = true;
  const events = {};
  FENCE_EVENTS.forEach((e) => (events[e.id] = null));
  const tpfp = {};
  TPFP_EVENTS.forEach((e) => (tpfp[e.id] = null));
  const h3 = {};
  H3_RULES.forEach(
    (r) => (h3[r.id] = { src: null, conds: [], thr: null })
  );
  const gaps = {};
  M12_GAPS.forEach((g) => (gaps[g.id] = null));
  const h1 = {};
  H1_CONTROLS.forEach((c) => (h1[c.id] = null));
  const h5 = {};
  H5_ROWS.forEach((r) => {
    h5[`${r.id}:proto`] = null;
    h5[`${r.id}:fact`] = null;
  });
  const h7 = {};
  H7_PATHS.forEach((p) =>
    p.slots.forEach((s) => (h7[`${p.id}:${s.id}`] = null))
  );
  const life = {};
  LIFE_CASES.forEach((c) => (life[c.id] = null));

  return {
    vault: { cls, prot },
    badge: { terms, life: [], hardPick: null, hardDefs: [] },
    federation: {
      flow: [],
      role1: null,
      role2: null,
      ben: [],
      risk: [],
      h8: { stance: null, risk: [] },
    },
    directory: { dn: [], port: null },
    radio: { pick, reason, facts, h5 },
    gate: { factors: [], reflect: null, why: null, h8: { stance: null, risk: [] } },
    roles: { matrix, life, h8: { stance: null, risk: [] } },
    clock: {
      win,
      fence,
      events,
      ntpCause: null,
      ntpFix: null,
      h8: { stance: null, risk: [] },
    },
    audit: {
      flags: [],
      tpfp,
      h2: { seq: [], controls: [], mitre: "" },
      h3,
    },
    harden: { gaps, seq: [], h1, h7, h9: [] },
  };
}
