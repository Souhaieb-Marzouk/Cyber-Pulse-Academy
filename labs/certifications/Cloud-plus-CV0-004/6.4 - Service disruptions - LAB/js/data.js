/* ================= DATA LAYER ================= */
"use strict";

const PATIENTS = [
  { id:"portal", name:"PORTAL-FRONT fleet", bed:"WARD 1 · BED 1", kind:"Public web tier (4 VMs behind LB)",
    desc:"Serves portal.nimbuscare.example to patients and staff.", service:"dns", walkin:false },
  { id:"vmpool", name:"VMPOOL-A / VMPOOL-B", bed:"WARD 1 · BED 2", kind:"Internal VM subnets",
    desc:"Two /24 subnets; Pool A autoscales tonight (+30 VMs).", service:"dhcp", walkin:false },
  { id:"batch",  name:"BATCH-01", bed:"WARD 2 · BED 1", kind:"Analytics host",
    desc:"Runs nightly jobs; authenticates to the internal identity platform.", service:"ntp", walkin:false },
  { id:"mailrelay", name:"MAILRELAY-2", bed:"WALK-IN", kind:"Mail service host",
    desc:"Walked in for a check-up. All service checks nominal.", service:null, walkin:true },
  { id:"objstore", name:"OBJSTORE-7", bed:"WALK-IN", kind:"Object storage appliance",
    desc:"Storage-tier p99 latency alarm. Not a DNS/DHCP/NTP organ.", service:null, walkin:true },
  { id:"cdnedge", name:"CDN-EDGE-3", bed:"WALK-IN", kind:"CDN edge node",
    desc:"Scheduled maintenance window 09:00–11:00. Coincidental, not sick.", service:null, walkin:true }
];

const CORRECT = {
  portalA_old:"198.51.100.77", portalA_new:"203.0.113.20", ttl_new:"300", ttl_old:"86400",
  api_name:"api.internal.nimbuscare.example", api_ip:"10.20.30.40",
  apipa:"169.254.118.23", poolA_free:7, poolA_free_after:69,
  opt003_wrong:"10.20.30.1", opt003_new:"10.20.31.254",
  drift:872, drift_str:"-14m32s",
  ntp_legacy:"10.40.50.60"
};

const ALERTS = [
  { id:"a1", t:"08:52", sev:"CRITICAL", txt:"PORTAL-FRONT: HTTP 200 rate 41% (baseline 99.8%)", cls:"dns" },
  { id:"a2", t:"08:54", sev:"CRITICAL", txt:"PORTAL-FRONT: DNS resolution failures rising for portal.nimbuscare.example", cls:"dns" },
  { id:"a3", t:"09:01", sev:"WARN",     txt:"VMPOOL-A: 12 new VMs stuck provisioning with no IPv4 address", cls:"dhcp" },
  { id:"a4", t:"09:03", sev:"CRITICAL", txt:"VMPOOL-B: 47 VMs report gateway unreachable", cls:"dhcp" },
  { id:"a5", t:"09:11", sev:"CRITICAL", txt:"BATCH-01: nightly jobs failing — KRB_AP_ERR_SKEW / TLS cert errors", cls:"ntp" },
  { id:"a6", t:"09:14", sev:"WARN",     txt:"OBJSTORE-7: object storage p99 latency 840 ms", cls:"none" },
  { id:"a7", t:"09:15", sev:"INFO",     txt:"CDN-EDGE-3: scheduled maintenance window 09:00–11:00", cls:"none" },
  { id:"a8", t:"09:20", sev:"INFO",     txt:"MAILRELAY-2: all service checks nominal", cls:"none" }
];

const SYMPTOMS = [
  { id:"s1", txt:"“The portal will not load by name, but it opens when I type the IP address.”", cls:"dns" },
  { id:"s2", txt:"Two new VMs booted with address 169.254.118.23 and no connectivity.", cls:"dhcp" },
  { id:"s3", txt:"BATCH-01 nightly jobs fail authentication; log shows KRB_AP_ERR_SKEW.", cls:"ntp" },
  { id:"s4", txt:"OBJSTORE-7 uploads are slow this morning.", cls:"none" },
  { id:"s5", txt:"Internal tool cannot resolve api.internal.nimbuscare.example — NXDOMAIN.", cls:"dns" },
  { id:"s6", txt:"CDN-EDGE-3 shows a maintenance window this morning.", cls:"none" }
];

const ROLES = [
  { id:"r1", txt:"Leases each client an IPv4 address plus gateway and DNS server options, for a fixed time (DORA: Discover → Offer → Request → Acknowledge).", cls:"dhcp" },
  { id:"r2", txt:"Translates hostnames into IP addresses; every “by name” connection starts here.", cls:"dns" },
  { id:"r3", txt:"Keeps every machine's clock aligned within fractions of a second, so authentication tokens and certificates validate.", cls:"ntp" },
  { id:"r4", txt:"Distributes incoming HTTPS sessions across a pool of web servers.", cls:"none" }
];

/* ---------- Diagnostics cart: tools × targets ---------- */
const TOOLS = [
  { id:"dig", name:"dig (DNS lookup)", targets:["portal","api"],
    run:(S,t)=> t==="portal" ? dnsPortalOut(S) : dnsApiOut(S) },
  { id:"nslookup", name:"nslookup (interactive lookup)", targets:["portal","api"],
    run:(S,t)=> t==="portal" ? nsPortalOut(S) : "> Server: 10.20.30.53\n> api.internal.nimbuscare.example\n" + (apiFixed(S) ? "Name: api.internal.nimbuscare.example\nAddress: 10.20.30.40" : "*** Can't find api.internal.nimbuscare.example: Non-existent domain (NXDOMAIN)") },
  { id:"ping", name:"ping (ICMP reachability)", targets:["portalname","gwB","ntplegacy"],
    run:(S,t)=>{
      if(t==="portalname"){ const ip = portalIpNow(S);
        return ip===CORRECT.portalA_new
          ? "PING portal.nimbuscare.example (203.0.113.20): 56 data bytes\n64 bytes from 203.0.113.20: icmp_seq=0 ttl=118 time=8.4 ms\n64 bytes from 203.0.113.20: icmp_seq=1 ttl=118 time=7.9 ms\n--- 2 packets transmitted, 2 received, 0% packet loss ---"
          : "PING portal.nimbuscare.example ("+ip+"): 56 data bytes\nRequest timeout for icmp_seq 0\nRequest timeout for icmp_seq 1\n--- 2 packets transmitted, 0 packets received, 100.0% packet loss ---\n(old LB 198.51.100.77 was decommissioned Friday — nobody is listening)"; }
      if(t==="gwB"){ return gwBOk(S)
          ? "PING 10.20.31.254: 56 data bytes\n64 bytes from 10.20.31.254: icmp_seq=0 ttl=64 time=0.9 ms\n--- gateway responds, 0% packet loss ---"
          : "PING 10.20.31.254: 56 data bytes\nRequest timeout for icmp_seq 0\nRequest timeout for icmp_seq 1\n100.0% packet loss — the VM's configured gateway is "+(S.env.poolBOptionApplied? S.env.poolBOption : CORRECT.opt003_wrong)+", not this address"; }
      return "PING 10.40.50.60: 56 data bytes\nRequest timeout for icmp_seq 0\nRequest timeout for icmp_seq 1\n100.0% packet loss — host 10.40.50.60 was powered off during CHG-2481 (legacy NTP, decommissioned)";
    } },
  { id:"ipconfig", name:"ipconfig /all (client network state)", targets:["vmpoolA","vmpoolB"],
    run:(S,t)=>{
      if(t==="vmpoolA"){ return scopeAFixed(S)
        ? "Windows IP Configuration\n\nEthernet adapter Ethernet0:\n   DHCP Enabled. . . . . . . . . . : Yes\n   IPv4 Address. . . . . . . . . . : 10.20.28.37 (Preferred)\n   Subnet Mask . . . . . . . . . . : 255.255.255.192\n   Default Gateway . . . . . . . . : 10.20.28.1\n   DHCP Server . . . . . . . . . . : 10.20.29.5\n   Lease Expires . . . . . . . . . : Monday, November 6, 2023 5:47 PM"
        : "Windows IP Configuration\n\nEthernet adapter Ethernet0:\n   DHCP Enabled. . . . . . . . . . : Yes\n   Autoconfiguration IPv4 Address. . : 169.254.118.23 (Preferred)\n   Subnet Mask . . . . . . . . . . : 255.255.0.0\n   Default Gateway . . . . . . . . :\n   (APIPA: the client asked, no DHCP server had an address to offer,\n    so Windows self-assigned a link-local 169.254.0.0/16 address)"; }
      return "Windows IP Configuration\n\nEthernet adapter Ethernet0:\n   DHCP Enabled. . . . . . . . . . : Yes\n   IPv4 Address. . . . . . . . . . : 10.20.31.56 (Preferred)\n   Subnet Mask . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . : " + (gwBOk(S) ? "10.20.31.254" : "10.20.30.1  \u2190 WRONG SUBNET (copied from Pool A config)") + "\n   DHCP Server . . . . . . . . . . : 10.20.31.5";
    } },
  { id:"dhcpconsole", name:"DHCP console (scopes, options, leases)", targets:["poolA","poolB"],
    run:(S,t)=>{
      if(t==="poolA"){ const fixed = scopeAFixed(S); const total = fixed?311:249, leased = fixed?242:242, free = fixed?CORRECT.poolA_free_after:CORRECT.poolA_free;
        return "Scope [10.20.29.0/24] VMPOOL-A"+(fixed?" + secondary [10.20.28.0/26]":"")+"\n  Address pool total : "+total+" leaseable\n  Active leases      : "+leased+"\n  Free addresses     : "+free+"\n  Exclusions         : .1 (router), .5-.8 (infrastructure)\n  Lease duration     : 8 hours\n  Note: autoscale plan CHG-2481 adds +30 VMs tonight (22:00)"+(fixed?"\n  Change applied: secondary range active, router 10.20.28.1":""); }
      return "Scope [10.20.31.0/24] VMPOOL-B\n  Option 003 Router        : "+(S.env.poolBOptionApplied && S.env.poolBOption==="10.20.31.254" ? "10.20.31.254" : CORRECT.opt003_wrong+"  \u2190 points into VMPOOL-A (10.20.30.x); should be 10.20.31.254")+"\n  Option 006 DNS Servers   : 10.20.30.53\n  Option 042 NTP Servers   : (not set — clients inherit time config from image)\n  Lease duration           : 8 hours\n  Free addresses           : 121 of 249 (capacity is fine here — the fault is an OPTION, not the scope)";
    } },
  { id:"timedatectl", name:"timedatectl (system clock state)", targets:["batch01"],
    run:(S)=> ntpOk(S)
      ? "               Local time: Mon 2023-11-06 09:47:12 UTC\n           Universal time: Mon 2023-11-06 09:47:12 UTC\n        Time zone: Etc/UTC (UTC, +0000)\nSystem clock synchronized: yes\n              NTP service: active\n       Sources: ntp01.nimbuscare.example, ntp02.nimbuscare.example, ntp03.nimbuscare.example, cloud-time (169.254.169.123)"
      : "               Local time: Mon 2023-11-06 09:32:40 UTC\n           Universal time: Mon 2023-11-06 09:32:40 UTC\n        Time zone: Etc/UTC (UTC, +0000)\nSystem clock synchronized: no\n              NTP service: active (configured source unreachable)\n  Monitoring reference says local clock is BEHIND by 872 s (14 min 32 s) — drift began after Friday's host migration and was never corrected (source 10.40.50.60 is gone)" },
  { id:"ntpq", name:"ntpq -p (NTP source status)", targets:["batch01"],
    run:(S)=> ntpOk(S)
      ? "     remote           refid      st t when poll reach   delay   offset   jitter\n==============================================================================\n*ntp01.nimbuscar 10.40.50.1       3 u   32   64  377   0.412   +0.291   0.088\n+ntp02.nimbuscar 10.40.50.1       3 u   45   64  377   0.398   +0.274   0.102\n+ntp03.nimbuscar 10.40.50.1       3 u   51   64  377   0.421   +0.305   0.091\n#169.254.169.123 .GPS.            1 u   38   64  377   0.187   +0.110   0.043"
      : "     remote           refid      st t when poll reach   delay   offset   jitter\n==============================================================================\n 10.40.50.60     .INIT.          16 u   47   64    0   0.000   +0.000   0.000\n(refid .INIT., reach 0 — the configured source never answers;\n the host free-runs on its own crystal, drifting since Friday's migration)" },
  { id:"authlog", name:"Auth & TLS log (BATCH-01)", targets:["batch01"],
    run:(S)=> ntpOk(S)
      ? "Nov  6 09:46:02 batch-01 cron[812]: NIGHTLY-JOB-417 started\nNov  6 09:46:04 batch-01 app: TLS handshake OK (cert CN=identity.nimbuscare.example)\nNov  6 09:46:05 batch-01 krb5: TGT acquired for svc_batch@NIMBUSCARE.EXAMPLE\nNov  6 09:46:06 batch-01 app: job 417: authentication OK — running"
      : "Nov  6 09:11:04 batch-01 krb5: KRB_AP_ERR_SKEW — clock skew too great (tolerance ~300 s; measured drift 872 s)\nNov  6 09:11:05 batch-01 app: TLS handshake FAILED: certificate is not yet valid\n    (cert notBefore 08:55:00 UTC; local clock reads 08:40:28 — the certificate is\n     fine, the client's clock is 14 m 32 s behind real time)\nNov  6 09:11:09 batch-01 app: job 417: authentication FAILED (retry 1/3)" },
  { id:"tcpdump", name:"tcpdump (packet capture)", targets:["portal"],
    run:(S)=> portalIpNow(S)===CORRECT.portalA_new
      ? "08:47:41.221 IP 10.10.5.12.51122 > 203.0.113.20.443: Flags [S], seq 1842...\n08:47:41.229 IP 203.0.113.20.443 > 10.10.5.12.51122: Flags [S.], seq 9911...\n08:47:41.230 IP 10.10.5.12.51122 > 203.0.113.20.443: Flags [.], ACK — handshake proceeding"
      : "08:52:41.221 IP 10.10.5.12.51122 > 198.51.100.77.443: Flags [S], seq 1842...\n08:52:42.222 IP 10.10.5.12.51122 > 198.51.100.77.443: Flags [S], seq 1842...\n08:52:44.223 IP 10.10.5.12.51122 > 198.51.100.77.443: Flags [S], seq 1842...\n(SYN, SYN, SYN — three retransmits, zero answers. 198.51.100.77 is a dead end:\n the DNS name resolves there, but nothing is listening.)" },
  { id:"zonefile", name:"Zone file (public + private view)", targets:["zone"],
    run:(S)=> "$ORIGIN nimbuscare.example.\n; public view — last modified 08:12 by svc-migration (CHG-2481)\nportal          "+(S.env.dnsTtl||"86400")+"\tIN\tA\t"+portalIpNow(S)+"\nwww             3600  IN\tCNAME\tportal.nimbuscare.example.\npayments        300   IN\tA\t203.0.113.99\n\n; private view (inside VPC) — split-horizon zone\napi.internal"+(apiFixed(S)?"\t300\tIN\tA\t10.20.30.40":"\t\t\t; NO RECORD — internal tools resolve this from the public view and get NXDOMAIN")+"\ndb.internal     300   IN\tA\t10.20.30.50" },
  { id:"changelog", name:"Change log (CHG-2481)", targets:["change"],
    run:()=> "CHG-2481 — NimbusCare migration cutover window (Sat 22:00 – Sun 04:00, overrun)\n08:00  window reopened: DNS + time services in scope\n08:05  legacy NTP server 10.40.50.60 powered off (replaced by cloud time service —\n       but no VM was ever re-pointed to it)\n08:12  svc-migration script set-dns.ps1 wrote portal A record = 198.51.100.77\n       (value taken from the OLD runbook; new LB is 203.0.113.20)\n08:41  VMPOOL-A autoscale launched 12 new VMs ahead of tonight's +30\n09:52  [pending] no post-change verification was executed" },
  { id:"ticket", name:"Ticket CHG-2481 summary", targets:["ticket"],
    run:()=> "TICKET CHG-2481 (summary view)\n  Type       : Standard change — platform migration\n  Risk       : Medium   Rollback plan : yes (but never rehearsed for DNS/time)\n  Verification step: 'spot-check portal' — SKIPPED at 08:20 (owner paged away)\n  Open items : re-point fleet NTP config away from 10.40.50.60 (planned, not done);\n               update runbook IP list (stale copy caused the A-record write)" }
];

function portalIpNow(S){ return (S.env.dnsApplied && S.env.dnsA) ? S.env.dnsA : CORRECT.portalA_old; }
function apiFixed(S){ return S.env.dnsApplied && S.env.dnsPrivName===CORRECT.api_name && S.env.dnsPrivIp===CORRECT.api_ip; }
function scopeAFixed(S){ return S.env.poolAFixApplied && S.env.poolAFix==="r26"; }
function gwBOk(S){ return S.env.poolBOptionApplied && S.env.poolBOption===CORRECT.opt003_new; }
function ntpOk(S){ return S.env.ntpResynced && S.env.ntpSources.filter(s=>s!=="legacy").length>=1; }

function dnsPortalOut(S){
  const ip = portalIpNow(S), ttl = S.env.dnsApplied ? (S.env.dnsTtl||"86400") : "86400";
  const good = ip===CORRECT.portalA_new;
  return "; <<>> DiG 9.18.24 <<>> portal.nimbuscare.example A\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 51532\n;; ANSWER SECTION:\nportal.nimbuscare.example. "+ttl+" IN A "+ip+"\n;; Query time: 2 msec — SERVER: 10.20.30.53#53\n"+
  (good ? ";; (answer matches the live load balancer)" : ";; NOTE: 198.51.100.77 was the OLD load balancer — powered off Friday.\n;; The record answers 'successfully' with a corpse; TTL "+ttl+" keeps resolvers\n;; caching it. Check the zone file and the change log for how this happened.");
}
function dnsApiOut(S){
  return apiFixed(S)
    ? "; <<>> DiG 9.18.24 <<>> api.internal.nimbuscare.example A\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR\n;; ANSWER SECTION:\napi.internal.nimbuscare.example. 300 IN A 10.20.30.40"
    : "; <<>> DiG 9.18.24 <<>> api.internal.nimbuscare.example A\n;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 41007\n;; QUESTION SECTION:\n;api.internal.nimbuscare.example.\tIN\tA\n;; NXDOMAIN = this name does not exist in the zone that answered.\n;; The private (split-horizon) zone has no record for it — the public view\n;; cannot see inside the VPC. This is a MISSING RECORD, not a server fault.";
}
function nsPortalOut(S){
  const ip = portalIpNow(S);
  return "Server:\t\t10.20.30.53\nAddress:\t10.20.30.53#53\n\nNon-authoritative answer:\nName:\tportal.nimbuscare.example\nAddress: "+ip+"   TTL: "+(S.env.dnsApplied?(S.env.dnsTtl||"86400"):"86400");
}

/* ---------- Objectives ---------- */
/* pillar: P1 understand, P2 recognize/analyze, P3 detect, P4 mitigate */
const OBJECTIVES = [
  { id:"M1", mode:"M", pillar:"P1", where:"roleBoard",
    title:"Pair each admitting note with its service",
    prompt:"On the Intake board, pair all four notes with DNS, DHCP, NTP or “not one of ours”, then check.",
    anchor:"Lesson concept: the role of DNS, DHCP and NTP (and their neighbours).",
    hints:["Three notes describe the three services; one describes a load balancer, which is none of them.","DHCP is the one about leasing addresses with a clock on them (DORA).","“Translates names” = DNS; “keeps clocks aligned” = NTP; “leases addresses for a fixed time” = DHCP; “spreads HTTPS across servers” = none."],
    okMsg:"Anatomy learned. DNS answers “where is it?”, DHCP answers “who am I on this network?”, NTP answers “what time is it — really?”. A load balancer spreads traffic but none of the three — mislabelling it is how outages get mis-triaged.",
    failMsg:"Not every note is paired correctly yet — remember: names → DNS, addresses+options → DHCP, clocks → NTP, traffic spreading → none of them." },
  { id:"M2", mode:"M", pillar:"P1", where:"symptomBoard",
    title:"Map the six symptoms to a failing service",
    prompt:"Classify all six complaints on the Symptom board: DNS, DHCP, NTP, or not a service-disruption symptom.",
    anchor:"Symptom → service reasoning (the exam's “given a scenario” skill).",
    hints:["Two symptoms are noise: one belongs to the storage team, one to the CDN team.","169.254.x.x (APIPA) screams DHCP; NXDOMAIN screams DNS; KRB_AP_ERR_SKEW screams time.","“Works by IP but not by name” = DNS; self-assigned address = DHCP; auth skew = NTP."],
    okMsg:"You just did the exam's core move: symptoms are shared (“can't connect”), evidence is specific. Name-resolution phrasing → DNS; address-assignment phrasing → DHCP; clock/auth phrasing → NTP.",
    failMsg:"Some symptoms are misfiled. Hint: anything about a *name* is DNS; anything about *addresses or APIPA* is DHCP; anything about *clocks, Kerberos or certificates* is NTP; storage latency and CDN maintenance are other teams' patients." },
  { id:"M3", mode:"M", pillar:"P2", where:"chartPortal",
    title:"Read the portal's DNS answer",
    prompt:"Open PORTAL-FRONT's chart, run dig on the Assessment tab instructions, then record the A record value dig returns and what it means.",
    anchor:"DNS disruption cause: stale A record after a cutover (dig output, zone file).",
    hints:["Admit PORTAL-FRONT from the ward, then use the chart's Assessment tab — and run dig from the Diagnostics cart with target portal.","The ANSWER SECTION gives the current A record. Compare it against the change log: which load balancer is actually live?","dig answers 198.51.100.77 — that LB was decommissioned Friday. The record is stale, not the network."],
    okMsg:"Diagnosed: the portal name resolves “successfully” — to a decommissioned LB. DNS didn't fail; it failed *usefully wrong*, which is why users could still reach the app by IP. Next question a defender asks: how long will resolvers keep believing it? (Look at the TTL.)",
    failMsg:"Check the dig output's ANSWER SECTION for the exact IP, and pick the interpretation that matches the change log — the old LB 198.51.100.77 is dead, so the record is stale, not propagating or poisoned." },
  { id:"M4", mode:"M", pillar:"P2", where:"chartVmpool",
    title:"Diagnose the VM that cannot get an address",
    prompt:"Open VMPOOL-A/B's chart, run ipconfig on the stuck VM and read the DHCP console, then record the client's self-assigned address and the root cause.",
    anchor:"DHCP disruption cause: scope exhaustion (ipconfig APIPA + lease table).",
    hints:["Admit VMPOOL-A/B, then on the Assessment tab: run ipconfig with target VMPOOL-A-NEW-01 and the DHCP console with target VMPOOL-A.","An address starting 169.254 means the client never got a lease — that pattern is called APIPA.","The Pool A console shows 7 free leases; autoscale wanted 12 more. The scope, not the server, is exhausted."],
    okMsg:"Diagnosed: APIPA (169.254.0.0/16) — the client asked for a lease and no server had one to give, because VMPOOL-A has 7 free addresses and needed 12. DHCP is up; the *pool* is dry. Capacity, not connectivity.",
    failMsg:"The stuck VM self-assigned 169.254.118.23 — record it exactly, and choose “scope exhausted” (the DHCP console shows only 7 free leases against 12 requested), not a bad option or a rogue server." },
  { id:"M5", mode:"M", pillar:"P2", where:"chartBatch",
    title:"Prove the clock problem before treating it",
    prompt:"Open BATCH-01's chart, run timedatectl / ntpq / auth log, then record the drift in seconds, its direction, and which downstream failures it explains.",
    anchor:"NTP disruption causes: unreachable source, post-migration drift; downstream auth impact.",
    hints:["timedatectl states the offset in seconds against the monitoring reference; the auth log shows what it broke.","872 seconds = 14 minutes 32 seconds. Kerberos tolerates ~5 minutes (300 s).","The certificate isn't broken: with the clock *behind*, a cert issued at 08:55 still looks 'not yet valid' at local time 08:40."],
    okMsg:"Evidence chain complete: source 10.40.50.60 was decommissioned in CHG-2481 → the host free-runs and sits 872 s behind → Kerberos rejects skew > ~300 s, and TLS calls the new certificate “not yet valid”. One dead NTP source, two authentication symptoms.",
    failMsg:"Enter the drift magnitude from timedatectl (872 s), the direction (behind), and tick BOTH downstream failures the log shows: KRB_AP_ERR_SKEW and the TLS “not yet valid” error. Disk corruption and CPU are not time symptoms." },
  { id:"M6", mode:"M", pillar:"P3", where:"triageFeed",
    title:"Separate the signal from the noise",
    prompt:"In the Triage feed, classify all eight alerts: DNS, DHCP, NTP, or unrelated. Get all eight right.",
    anchor:"True vs false positives; triage discipline under an alert storm.",
    hints:["Three alerts are noise: one is the storage team's patient, one is a scheduled maintenance notice, one is a healthy service reporting in.","Alerts naming PORTAL resolution and HTTP rates → DNS; VMPOOL addressing and gateway → DHCP; BATCH auth → NTP.","MAILRELAY-2 reporting 'all checks nominal' is good news, not an incident."],
    okMsg:"Perfect triage. Notice the pattern: the two DNS alerts describe the *consequence* (HTTP 200 rate) and the *cause* (resolution failures) — reading both together is how you skip a dozen wrong hypotheses. And refusing the three noise alerts is half of triage.",
    failMsg:"Re-file: a1/a2 → DNS (portal names), a3/a4 → DHCP (addresses/gateway), a5 → NTP (auth skew). a6 (storage latency), a7 (CDN maintenance) and a8 (healthy mail relay) are unrelated to a DNS/DHCP/NTP disruption." },
  { id:"M7", mode:"M", pillar:"P3", where:"monitorDesk",
    title:"Configure the monitors that page you first",
    prompt:"On the Monitoring desk, enable the DNS record-integrity check, set the DHCP utilization threshold and the NTP offset threshold to the values that catch problems early without crying wolf.",
    anchor:"Cross-cutting: monitoring thresholds per service (leading indicators).",
    hints:["A 100% utilization alert fires when VMs are already dying; a 50% alert pages you every autoscale run.","Kerberos tolerates ~5 minutes of skew — but users notice certificate weirdness well before that. 1 s is a healthy, quiet threshold.","The DNS check that catches *this* outage compares the live answer against the expected A record."],
    okMsg:"Monitors set: record drift (DNS), ≥80% utilization sustained (DHCP), |offset| > 1 s (NTP). All three of today's outages would have paged before 08:52 — leading indicators beat user pain, and beats 100%-utilization alerts that fire only once patients are already on the floor.",
    failMsg:"Pick: DNS integrity check ON; DHCP alert at ≥80% (95–100% alerts arrive too late, 50% is noise); NTP offset alert at >1 s (5 min waits for Kerberos to break; 100 ms is over-sensitive)." },
  { id:"M8", mode:"M", pillar:"P4", where:"chartPortal",
    title:"Treat DNS: fix the record, mind the TTL",
    prompt:"On PORTAL-FRONT's Treatment tab, set the A record to the live LB, cut the TTL for the change window, add the missing private api.internal record, then commit the zone changes.",
    anchor:"DNS remediation: correct records, TTL policy, split-horizon fix, verify.",
    hints:["The live load balancer per the change log is 203.0.113.20 — not the payments LB, not an internal IP.","During a change window you want short caching: 300 s, not 86400 s (24 h) — otherwise resolvers serve the old answer for a day.","The private zone needs api.internal.nimbuscare.example → 10.20.30.40; then COMMIT."],
    okMsg:"Zone committed: portal → 203.0.113.20 at TTL 300, api.internal → 10.20.30.40. Two lessons stick: the TTL you set *before* a change decides how long the old answer haunts resolvers, and split-horizon zones fail silently when a record exists only in one view.",
    failMsg:"On the Treatment tab set: A = 203.0.113.20 (live LB), TTL = 300, private record api.internal.nimbuscare.example = 10.20.30.40 — then press COMMIT ZONE CHANGES. Re-run dig afterwards to watch the answer change." },
  { id:"M9", mode:"M", pillar:"P4", where:"chartVmpool",
    title:"Treat DHCP: right-size the scope, fix the gateway option",
    prompt:"On VMPOOL-A/B's Treatment tab: give Pool A enough addresses for tonight (+30 VMs with headroom), correct Pool B's Option 003, apply both, then renew the affected leases.",
    anchor:"DHCP remediation: expand scope, correct options, renew leases, verify.",
    hints:["Pool A needs ≥36 addresses with headroom (30 × 1.2). A /26 secondary range adds 62; a /28 adds only 14.","Pool B's Option 003 points at 10.20.30.1 — Pool A's router. The correct router for 10.20.31.0/24 is 10.20.31.254.","Order matters: fix the option FIRST, then renew — otherwise you re-lease the same bad gateway."],
    okMsg:"Pool A gains 62 addresses (secondary /26), Pool B's Option 003 now hands out 10.20.31.254, and renewed clients re-lease into a working config. Note what you did NOT do: shorten leases or go static — those treat symptoms and create tomorrow's incident.",
    failMsg:"Treatment tab: Pool A → “Add secondary range 10.20.28.0/26 (+62)”, APPLY; Pool B Option 003 → 10.20.31.254, APPLY; then RENEW AFFECTED LEASES. A /28 (+14) is too small for +30 VMs with headroom." },
  { id:"M10", mode:"M", pillar:"P4", where:"chartBatch",
    title:"Restore time sync and prove it",
    prompt:"On BATCH-01's Treatment tab, select reliable time sources (the internal pool and the provider's time service — not the decommissioned server), save and force resync, then recheck vitals.",
    anchor:"NTP remediation: ≥2–3 independent sources incl. cloud time sync; force resync; verify offset.",
    hints:["10.40.50.60 was powered off in CHG-2481 — a dead source in the config is config drift that silently stops contributing.","Best practice is ≥2–3 sources: pick the internal pool (ntp01–03) AND StratusCloud Time Sync 169.254.169.123.","After saving sources, press FORCE RESYNC, then use Recheck vitals — 'synced' is a claim until the offset reads green."],
    okMsg:"Resynced against live sources; offset collapses from −872 s to fractions of a second, and the Kerberos and TLS failures stop being reproducible. You proved it by rechecking — authentication didn't recover because you 'believed' it, but because you measured it.",
    failMsg:"Select ntp01/02/03 (internal pool) plus StratusCloud Time Sync 169.254.169.123 — leave 10.40.50.60 unticked — then SAVE SOURCES & FORCE RESYNC, and finally RECHECK VITALS in the chart header." },
  { id:"M11", mode:"M", pillar:"P4", where:"preventionBoard",
    title:"Discharge checklist: verify and prevent readmission",
    prompt:"Recheck all three patients' vitals until every trace is green, then adopt the correct preventive controls on the Prevention board (leave the traps unticked).",
    anchor:"Cross-cutting: end-to-end verification + preventive hardening per service.",
    hints:["If any trace is still red, its chart's Treatment tab is missing a fix — re-run the treatment and press recheck again.","Traps: static IPs everywhere, permanent TTL 0, disabling certificate time checks, and a single stratum-0 source.","Real controls: TTL ≤300 + reviewed zone changes; snooping + 80% alert + split scopes; ≥3 sources + offset monitoring."],
    okMsg:"All traces green, prevention adopted. You verified recovery end-to-end (names resolve, leases hand out working gateways, clocks hold) — 'fixed' is a measurement, not an intention. That closes the clinical loop this lesson teaches: triage → diagnose → treat → verify → prevent.",
    failMsg:"Two things outstanding: every patient's vitals must be green (recheck after fixing whatever is still red), and the Prevention board must tick the real controls and leave the trap controls (static-everything, TTL 0, disabled cert checks, single time source) unticked." },

  { id:"H1", mode:"H", pillar:"P1", where:"anatomyBoard",
    title:"Anatomy round: name the organs",
    prompt:"Night shift has no service labels. On the Anatomy board, assign each mechanism statement to the service that owns it — one statement belongs to none of the three.",
    anchor:"Service roles at mechanism level (deeper than the day shift's intake notes): the foundation every later round stands on.",
    hints:["One nudge only: the impostor spreads HTTPS sessions across web servers and is none of the three."],
    okMsg:"Anatomy accepted — by mechanism, not by label: time discipline underwrites Kerberos and TLS, the directory is asked before every by-name connection, whoever answers the Offer owns addressing, and the load balancer is still none of ours.",
    failMsg:"Rejected. Assign by mechanism: clock discipline and skew → NTP; names resolved and cached for the TTL window → DNS; the Offer with address, gateway and DNS options → DHCP; spreading HTTPS sessions → none of the three." },
  { id:"H2", mode:"H", pillar:"P2", where:"coldTriage",
    title:"Cold triage: find the real patients and the exact evidence",
    prompt:"Three services are genuinely disrupted. Log one exact corroborating value for each on the Cold-triage board: the stale DNS answer, the APIPA address, and the clock drift in seconds. Exact strings required.",
    anchor:"Full triage under noise: T1071.004-adjacent DNS surface + DHCP/NTP evidence identification.",
    hints:["One nudge only: dig, ipconfig and timedatectl each name one number you need."],
    okMsg:"Cold triage accepted: 198.51.100.77 (stale portal answer), 169.254.118.23 (APIPA client), 872 s (drift). You went from a noisy feed to three named patients with hard evidence — that is the exam scenario in miniature.",
    failMsg:"Rejected. Exact values required: the portal A record dig returns, the stuck VM's self-assigned 169.254.x.x address, and the drift magnitude in seconds from timedatectl. Copy them precisely from the cart." },
  { id:"H3", mode:"H", pillar:"P2", where:"chartPortal",
    title:"DNS deep dive: full record autopsy",
    prompt:"On PORTAL-FRONT's Assessment tab, fill the complete record autopsy: current A value, correct A value, current TTL, TTL to set for change windows, and the missing private record (name and IP).",
    anchor:"DNS causes covered: stale record, TTL caching, missing split-horizon record.",
    hints:["One nudge only: the zone file and change log between them contain every value."],
    okMsg:"Autopsy complete: 198.51.100.77 → 203.0.113.20, TTL 86400 → 300, plus api.internal.nimbuscare.example = 10.20.30.40. Three distinct DNS failure modes caught in one chart: wrong value, wrong caching policy, and a record that only exists in one view.",
    failMsg:"Rejected — exact multi-part answer required. Re-read dig (current value), the change log (which LB is live), the zone file (TTL + what the private view lacks) and re-submit all six fields." },
  { id:"H4", mode:"H", pillar:"P2", where:"chartVmpool",
    title:"DHCP deep dive: capacity math and the copy-paste option",
    prompt:"On VMPOOL-A/B's Assessment tab: free leases in Pool A right now, the correct expansion for +30 VMs with ≥20% headroom, Pool B's correct Option 003 value, and the root configuration error.",
    anchor:"DHCP causes covered: scope exhaustion, wrong gateway option; tooling: lease table + options.",
    hints:["One nudge only: the DHCP console shows the free count and both scopes' options; the headroom math decides /26 vs /28."],
    okMsg:"Deep dive accepted: 7 free leases; secondary /26 (+62 ≥ 36 needed); Option 003 must be 10.20.31.254; root error = the option was copied from Pool A's config and points into the wrong subnet. Note how different the two Pool B symptoms are from Pool A's — same service, different anatomy.",
    failMsg:"Rejected — check each part: the console's free-lease count (exact number), the /26 secondary range (a /28 adds only 14 addresses; 30 × 1.2 = 36 needed), Option 003 = 10.20.31.254, and the copy-paste-from-Pool-A root error." },
  { id:"H5", mode:"H", pillar:"P2", where:"chartBatch",
    title:"NTP deep dive: drift, mechanism, sources",
    prompt:"On BATCH-01's Assessment tab: drift magnitude and direction, which TLS failure mechanism applies, the correct source set, and why 10.40.50.60 must be removed.",
    anchor:"NTP causes covered: unreachable source, migration drift; downstream TLS/Kerberos mechanics.",
    hints:["One nudge only: the auth log line spells out the certificate arithmetic — read the notBefore against the local clock."],
    okMsg:"Accepted: 872 s behind; clock-behind makes a fresh cert read 'not yet valid' (clock-ahead would read 'expired'); sources = internal pool + provider time service; 10.40.50.60 goes because it was decommissioned in CHG-2481 and only poisons the config. That's the full time-integrity story examiners look for.",
    failMsg:"Rejected — all four parts must be exact: 872 s behind; the 'clock behind → certificate not yet valid' mechanism; internal pool + StratusCloud Time Sync as sources; 10.40.50.60 removed because it was decommissioned (unreachable), not because of stratum or licensing." },
  { id:"H6", mode:"H", pillar:"P3", where:"planningDesk",
    title:"Sequence the recovery correctly",
    prompt:"On the Planning desk, order the six recovery actions so each step's precondition is met before it runs, then check.",
    anchor:"Cross-cutting: remediation ordering — TTL before record, scope before renew, source before resync.",
    hints:["One nudge only: caching policy is decided before the value it caches is changed."],
    okMsg:"Sequence accepted. TTL first (so the new answer propagates instead of the old one), record second, capacity before renewals, sources before resync, verification last — because a recovery that isn't re-measured is a rumour.",
    failMsg:"Rejected — the order is wrong. Think preconditions: lower the TTL *before* correcting the record; expand the scope *before* renewing; configure sources *before* forcing resync; verify after everything." },
  { id:"H7", mode:"H", pillar:"P3", where:"monitorDesk",
    title:"Defend the detection plan",
    prompt:"On the Monitoring desk (night-shift panel), choose the best early-warning check for each service. Near-misses are rejected with a rationale.",
    anchor:"Detection engineering: choosing the check that leads, not lags.",
    hints:["One nudge only: an alert that fires when users already hurt is a lagging indicator."],
    okMsg:"Plan defended: active answer-validation (DNS), utilization headroom at 80% (DHCP), sustained offset metric (NTP). Each fires while you can still act quietly — the near-misses all detect the incident after it has become an outage.",
    failMsg:"Rejected: a wrong choice detected the failure too late (100% utilization, Kerberos already failing) or not at all (CPU graphs, packet counts). Choose the leading indicator for each service." },
  { id:"H8", mode:"H", pillar:"P3", where:"triageFeed",
    title:"Classify the feed with zero tolerance",
    prompt:"Classify all eight feed alerts correctly — a night-shift mis-triage pages the wrong team at 3 a.m.",
    anchor:"True vs false positives, strict.",
    hints:["One nudge only: three of the eight alerts are not service disruptions at all."],
    okMsg:"8/8 — clean board. Under an alert storm you kept the discipline: consequence alert + cause alert read together (DNS), capacity vs option symptoms separated (DHCP), and three alerts refused as other teams' noise.",
    failMsg:"Rejected. 8/8 required — a mis-filed alert means the wrong on-call team. Reconsider: portal name/HTTP → DNS; VMPOOL addressing/gateway → DHCP; BATCH auth → NTP; storage latency, CDN maintenance and the healthy mail relay → unrelated." },
  { id:"H9", mode:"H", pillar:"P4", where:"preventionBoard",
    title:"Hardening board: adopt only what survives scrutiny",
    prompt:"Tick the preventive controls each service should adopt and leave every trap control unticked. Any trap ticked = rejected.",
    anchor:"Preventive controls + residual risk judgement.",
    hints:["One nudge only: two of the controls on this board would make the next outage worse."],
    okMsg:"Board approved. The adopted set fixes causes (TTL policy, capacity, sources, snooping) instead of symptoms (static everything, TTL 0, disabled cert validation) — and each control also shrinks the attack surface mapped in Case Review (T1557.003, T1071.004, T1070.006).",
    failMsg:"Rejected — a trap control was adopted (or a real one skipped). Static-IP-everywhere, permanent TTL 0, disabling certificate time validation and single-source time all trade one outage for a worse one. Adopt: TTL ≤300 + reviewed changes; snooping + 80% alert + split scope; ≥3 sources + offset monitoring." },
  { id:"H10", mode:"H", pillar:"P2", where:"planningDesk",
    title:"Reconstruct the incident timeline",
    prompt:"On the Planning desk, place the six event cards in true chronological order using the change log and the feed timestamps.",
    anchor:"Analysis: causal chain from change window to alert storm.",
    hints:["One nudge only: the change log's timestamps are ground truth."],
    okMsg:"Timeline reconstructed. Read end-to-end it tells the exam's favourite story: one change window, three unverified sub-changes (DNS value, NTP source, capacity plan) → three simultaneous 'unrelated' outages on Monday morning. Post-change verification would have caught all three.",
    failMsg:"Rejected — the order is off. The change log timestamps are authoritative: window opens → NTP powered off → A record rewritten → autoscale hits the dry scope → first user report → auth cascade." }
];

const QUIZ = [
  { m:"M", t:"APIPA and DHCP addressing", q:"A Windows VM shows “Autoconfiguration IPv4 Address 169.254.118.23”. What does that tell you?",
    o:["The lease renewed normally and connectivity is unaffected","A second DHCP server is answering on this subnet","No DHCP server answered, so Windows self-assigned APIPA","The address was assigned statically by an administrator"], a:2,
    e:"169.254.0.0/16 is APIPA: the client sent DHCP Discover and got no Offer/Ack, so Windows self-assigned a link-local address. A renewed lease would show a normal scope address, a static set would not say “Autoconfiguration”, and a rogue server would still hand out a real lease." },
  { m:"M", t:"DNS TTL", q:"In DNS, what does a record's TTL control?",
    o:["How long resolvers may cache the answer","How long a TCP session may stay open","How long a DHCP lease lasts for a client","How long a certificate remains valid for clients"], a:0,
    e:"TTL is the cache lifetime of a DNS answer: a long TTL (86400 s) is efficient but slow to correct, a short one (300 s) makes change-window fixes propagate fast. Session lifetimes are TCP's business, leases belong to DHCP option 051, and certificate validity is set by the CA — none of them live in a DNS record." },
  { m:"M", t:"DHCP options", q:"Which DHCP option hands clients their default gateway?",
    o:["Option 006 (DNS servers)","Option 015 (domain name)","Option 051 (lease time)","Option 003 (router)"], a:3,
    e:"Option 003 hands clients their default gateway; 006 the DNS servers, 015 the domain suffix, 051 the lease duration. VMPOOL-B's outage was exactly a wrong Option 003 — an address that worked, pointing at the wrong subnet's router." },
  { m:"M", t:"NTP and Kerberos", q:"A batch node's log shows KRB_AP_ERR_SKEW. Most likely root cause?",
    o:["The service account's password just expired — every auth fails","Clock skew beyond Kerberos' tolerance, so time sync broke","The node's TLS certificate was revoked by the CA","A firewall drops UDP 88 — packets never reach the KDC"], a:1,
    e:"Kerberos time-stamps every ticket and rejects skew beyond roughly five minutes (300 s), so KRB_AP_ERR_SKEW is the time-sync fingerprint. A wrong password surfaces as a pre-auth failure instead, a revoked certificate as an explicit revocation error, and a blocked UDP 88 as timeouts — none of them measures 872 s of drift." },
  { m:"M", t:"DNS responses", q:"dig returns status: NXDOMAIN for api.internal.nimbuscare.example. What does that mean?",
    o:["The name does not exist in the zone that answered","The DNS server refuses to answer any queries now","The query timed out before an answer arrived","The answer arrived but had already gone stale in cache"], a:0,
    e:"NXDOMAIN is an authoritative “no such name here” from the zone that answered — this shift's split-horizon missing-record case. A refusing or down server answers SERVFAIL or nothing, a slow one times out, and a stale cache still returns an address (wrong-but-present), never NXDOMAIN." },
  { m:"M", t:"Time integrity and TLS", q:"A freshly issued certificate fails TLS with “certificate is not yet valid”. What does that suggest?",
    o:["The CA revoked the certificate overnight","The client's clock is ahead of real time","The client's clock is behind real time","The portal's name resolves to the wrong host"], a:2,
    e:"A certificate's notBefore sits in the future only for a clock running behind — BATCH-01's cert (08:55) against its clock (08:40). Ahead reads “expired”, revoked reads “certificate revoked”, and a wrong host gives a name-mismatch error: each leaves a different fingerprint than “not yet valid”." },
  { m:"H", t:"DHCP gateway options", q:"VM 10.20.31.56 can ping 10.20.31.51 but not its gateway 10.20.31.254. First thing to check?",
    o:["The DNS A record for the gateway's name","The subnet mask configured on the client's NIC","The NTP offset between client and domain","The DHCP router option (003) for that subnet"], a:3,
    e:"East-west works, north-south doesn't: the client has an address but a dead route out. On a DHCP network the first suspect is the option set the server handed out — Option 003. DNS plays no role in pinging an IP, a bad mask would break the same-subnet ping too, and clock skew doesn't route packets." },
  { m:"H", t:"DNS caching", q:"An A record was corrected 5 minutes ago, but users still resolve the old IP. Why?",
    o:["The record was committed into the wrong DNS zone view","Resolvers hold the old answer until its TTL expires","The operating system's DNS client service crashed","The registrar stopped serving the delegation records"], a:1,
    e:"Caching is a feature: resolvers honour TTL, so a fixed zone doesn't override answers still alive in caches. A wrong zone view would misserve the name consistently, a crashed client service returns nothing at all, and registrar trouble affects the whole domain — not one record, five minutes after a clean fix." },
  { m:"H", t:"DHCP capacity", q:"Scope: 249 leaseable, 242 leased; fleet grows +30 tonight; you want ≥20% headroom. Best action?",
    o:["Add a secondary range /26 — sixty-two usable addresses","Add a secondary range /28 — fourteen usable addresses","Shorten the lease to fifteen minutes to churn clients","Do nothing tonight and let expiries free addresses"], a:0,
    e:"The math: 30 new VMs × 1.2 headroom = 36 addresses needed. A /26 adds 62 ✓; a /28 adds 14 ✗. Short leases mask the shortage and churn the network, and lease expiry frees only a handful of addresses hours after the 22:00 autoscale — the outage happens first." },
  { m:"H", t:"NTP sources", q:"ntpq -p shows refid .INIT., reach 0 for 10.40.50.60. Correct action?",
    o:["Increase the poll interval — and wait it out","Restart the application that owns the drift","Re-point to live sources and force a resync","Ignore it — reach 0 is normal for stratum 16"], a:2,
    e:".INIT. with reach 0 means the configured source never answers — if it was decommissioned (10.40.50.60 in CHG-2481), no poll interval resurrects it, and the application is a victim, not the cause. Repoint to live sources, force a resync, then verify the offset; stratum 16 just means “unsynchronized”." },
  { m:"H", t:"Service boundaries", q:"Which of these is NOT a plausible cause of a DNS disruption?",
    o:["A stale A record left behind after a cutover","A rogue DHCP server answering on the user VLAN","A record missing from the private split-horizon zone","An excessive TTL keeping a bad answer cached"], a:1,
    e:"Stale records, missing split-horizon records and TTL bloat are all textbook DNS failure modes — three of them happened in this lab. A rogue DHCP server breaks addressing, not names (and positions an attacker — see the next item)." },
  { m:"H", t:"Rogue DHCP (ATT&CK)", q:"A rogue DHCP server on a user VLAN primarily enables which attack?",
    o:["Timestomping of dropped files (T1070.006)","DNS tunneling for command and control (T1071.004)","Password spraying against the identity platform","On-path position via DHCP spoofing (T1557.003)"], a:3,
    e:"Whoever answers the DHCP Offer owns the client's gateway and DNS options — a textbook Adversary-in-the-Middle position, documented as T1557.003. Timestomping forges file times, DNS tunneling needs control of DNS records, and spraying stuffs logins — none needs a rogue Offer." },
  { m:"H", t:"TTL planning", q:"True or false: lowering TTLs *ahead of* a migration makes future record changes take effect sooner.",
    o:["True — caches pick up new values sooner","False — TTL only shapes the server's memory"], a:0,
    e:"True: TTL is honoured end-to-end, so resolvers re-query sooner and the corrected answer reaches users in minutes rather than tomorrow. The standard order: lower TTL → change the record → verify → raise TTL." },
  { m:"H", t:"Kerberos and NTP", q:"Kerberos default clock-skew tolerance and the matching fix are:",
    o:["Twenty-four hours — reboot the host and rejoin","Zero tolerance — nothing can be done about it","About five minutes — resynchronize time, then re-auth","Sixty seconds — renew the DHCP lease and retry"], a:2,
    e:"Active Directory-style Kerberos rejects skew beyond about five minutes — which is why BATCH-01's 872 s broke authentication. The durable fix is time sync followed by re-authentication; rebooting doesn't move the clock, the tolerance isn't zero, and a lease renewal changes addressing, not time." }
];

const GLOSSARY = [
  ["APIPA","Automatic Private IP Addressing — a client self-assigns 169.254.0.0/16 when no DHCP server answers; no gateway, no outside connectivity."],
  ["A record","DNS record mapping a hostname to an IPv4 address. The record NimbusCare's migration script rewrote."],
  ["CNAME","DNS alias pointing one name at another name (which then must resolve)."],
  ["TTL","Time To Live — seconds a resolver may cache a DNS answer before re-querying."],
  ["NXDOMAIN","DNS response meaning “this name does not exist” in the zone that answered."],
  ["Split-horizon DNS","Separate zone views: one for the internet (public), one for inside the VPC (private). Records must be maintained in both."],
  ["DHCP scope","The address pool (+options) a DHCP server serves for one subnet."],
  ["Lease","Time-limited grant of an IP address to a client (DORA: Discover, Offer, Request, Acknowledge)."],
  ["DHCP option","Configuration handed out with the lease: 003 router, 006 DNS servers, 015 domain, 042 NTP servers, 051 lease time."],
  ["Rogue DHCP","An unauthorized DHCP server answering clients — outage vector and (T1557.003) on-path attack position. Countermeasure: DHCP snooping."],
  ["Clock skew / drift","The difference between a machine's clock and true time; grows unbounded without synchronization."],
  ["Stratum","NTP hierarchy level: stratum 0 = reference clocks, each hop down adds 1. Quality/reliability signal for a source."],
  ["KRB_AP_ERR_SKEW","Kerberos error rejecting authentication because client and server clocks differ more than the ~5-minute tolerance."],
  ["TLS certificate validation","A TLS client checks the certificate's validity window (notBefore/notAfter) against its own clock — broken clocks break the check."],
  ["Leading indicator","A metric that degrades *before* users are impacted (utilization %, clock offset), as opposed to lagging symptoms (failed logins, tickets)."]
];

const KNOWLEDGE = [
  { icon:"i-net", title:"DNS — the directory", body:[
    "DNS answers one question: “what address does this name point to?”. A resolver walks root → TLD → authoritative servers (here, the public zone and the split-horizon private zone), then caches the answer for the record's TTL. Everything “by name” rides on it: portal, APIs, mail, identity.",
    "How it breaks in the wild: a record pointed at the wrong address (our stale A record), a record that exists in one zone view but not the other (our missing api.internal), resolvers/forwarders down, or a *correct-looking* answer that caches for 24 h because nobody lowered the TTL before the change.",
    "Why attackers love it: DNS is allowed through almost every firewall, so it is a favourite command-and-control channel — T1071.004 Application Layer Protocol: DNS. Documented cases: SUNBURST (S0559) blended C2 into DNS “API” lookups; BONDUPDATER (S0360) tunneled via DNS TXT records; FIN7 (G0046) used A/OPT/TXT records for C2. Defenders who can read dig output can read those tunnels."
  ]},
  { icon:"i-server", title:"DHCP — the front desk", body:[
    "DHCP hands each client its network identity: address, mask, router (Option 003), DNS servers (006), lease time (051) — the DORA handshake: Discover, Offer, Request, Acknowledge. Clients without a server self-assign APIPA 169.254.0.0/16, which routes nowhere.",
    "How it breaks: the scope runs dry under autoscale (Pool A: 7 free leases, 12 VMs wanting in), an option is wrong even when the address works (Pool B's gateway pointing into the wrong subnet), a relay misconfigured, duplicate IPs, or a rogue server answering first — which is also attack position T1557.003 DHCP Spoofing.",
    "Why attackers love it: whoever answers the Offer owns the victim's gateway and DNS — a textbook Adversary-in-the-Middle position. The MITRE T1557 family documents it (Sea Turtle (G1041) redirected traffic by altering DNS records at providers; the .003 sub-technique covers DHCP spoofing). DHCP snooping and segmentation (M1030, M1037) blunt it."
  ]},
  { icon:"i-clock", title:"NTP — the master clock", body:[
    "NTP disciplines every machine's clock against a hierarchy of sources (stratum: reference clocks at 0, each hop +1). Kerberos tolerates only ~5 minutes of skew; TLS certificate validation compares notBefore/notAfter against local time; log correlation assumes shared time.",
    "How it breaks: the configured source disappears (10.40.50.60 was decommissioned mid-window in CHG-2481) and hosts free-run — VMs that migrate or suspend can jump minutes. Our BATCH-01 sits 872 s behind: Kerberos throws KRB_AP_ERR_SKEW, and a certificate issued at 08:55 looks “not yet valid” to a clock reading 08:40.",
    "Why time integrity matters beyond uptime: forensics runs on timestamps. T1070.006 Timestomp (APT29 (G0016) forged web-shell timestamps in the SolarWinds compromise; Lazarus Group (G0032) copied calc.exe's timestamp onto dropped files) forges file times — but a monitored, disciplined clock keeps the timeline honest. Mitigations focus on detection (the technique has no clean preventive control)."
  ]}
];

/* ---- lab data constants moved verbatim from the engine module ---- */

const PREVENTION = {
  dns: [
    { id: "d1", txt: "Lower TTLs to \u2264 300 s before any record change window", req: true },
    { id: "d2", txt: "Peer review + rollback plan for every zone change (change management)", req: true },
    { id: "d3", txt: "DNSSEC signing for the public zone", req: false },
    { id: "d4", txt: "Set every record TTL to 0 permanently", trap: true }
  ],
  dhcp: [
    { id: "h1", txt: "DHCP snooping on access switch ports (rogue-server protection)", req: true },
    { id: "h2", txt: "Utilization alert at 80% + capacity review before autoscale events", req: true },
    { id: "h3", txt: "Split scope / secondary DHCP server for redundancy", req: true },
    { id: "h4", txt: "Disable DHCP fleet-wide and assign static IPs to every VM", trap: true },
    { id: "h5", txt: "Set a 5-minute lease on all scopes to \u201crelieve\u201d exhaustion", trap: true }
  ],
  ntp: [
    { id: "n1", txt: "\u2265 3 independent time sources (internal pool + provider time service)", req: true },
    { id: "n2", txt: "Monitor clock offset as a metric; alert when |offset| > 1 s", req: true },
    { id: "n3", txt: "Rely on exactly one stratum-0 source to keep time \u201cunambiguous\u201d", trap: true },
    { id: "n4", txt: "Disable TLS certificate time validation so skew cannot break handshakes", trap: true }
  ]
};

const TARGET_LABELS = {
  portal: "portal.nimbuscare.example (public)", api: "api.internal.nimbuscare.example",
  portalname: "portal.nimbuscare.example (from office VPN)", gwB: "10.20.31.254 (from VMPOOL-B-14)",
  ntplegacy: "10.40.50.60 (legacy NTP)", vmpoolA: "VMPOOL-A-NEW-01 (stuck VM)", vmpoolB: "VMPOOL-B-14",
  poolA: "Scope VMPOOL-A (10.20.29.0/24)", poolB: "Scope VMPOOL-B (10.20.31.0/24)",
  batch01: "BATCH-01", zone: "Zone files (public + private view)", change: "Change log CHG-2481", ticket: "Ticket CHG-2481"
};

const SEQ = {
  correct: ["ttl", "arecord", "scopeA", "optB", "ntp", "verify"],
  labels: {
    ttl: "Lower the portal record TTL to 300 s (decide caching before changing the value)",
    arecord: "Correct the portal A record to 203.0.113.20",
    scopeA: "Expand VMPOOL-A (secondary /26, +62 addresses)",
    optB: "Fix VMPOOL-B Option 003, then renew affected leases",
    ntp: "Re-point NTP to live sources and force a resync",
    verify: "Re-run end-to-end verification (names, leases, time, auth)"
  },
  init: ["arecord", "ttl", "scopeA", "ntp", "optB", "verify"]
};

const TL = {
  correct: ["window", "ntpoff", "arecord", "autoscale", "user1", "cascade"],
  labels: {
    window: "CHG-2481 migration window reopens (08:00)",
    ntpoff: "Legacy NTP 10.40.50.60 powered off (08:05)",
    arecord: "Migration script rewrites portal A record to 198.51.100.77 (08:12)",
    autoscale: "VMPOOL-A autoscale launches 12 VMs into the dry scope (08:41)",
    user1: "First user report: portal unreachable by name (08:52)",
    cascade: "BATCH-01 auth cascade: KRB_AP_ERR_SKEW + TLS errors (09:11)"
  },
  init: ["user1", "arecord", "cascade", "window", "autoscale", "ntpoff"]
};

const ANATOMY = [
  { id: "an1", txt: "Kerberos rejects authentication when its discipline slips by more than about five minutes.", cls: "ntp" },
  { id: "an2", txt: "Spreads incoming HTTPS sessions across a pool of web servers behind one name.", cls: "none" },
  { id: "an3", txt: "Every “by name” connection starts here, and resolvers cache its answers for the TTL window.", cls: "dns" },
  { id: "an4", txt: "Whoever answers the Offer hands the client its address, gateway (Option 003) and DNS servers.", cls: "dhcp" }
];
