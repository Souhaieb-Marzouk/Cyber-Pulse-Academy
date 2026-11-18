"use strict";
/* ======================================================
   SY0-801 4.8 Practice Lab — The Evidence Room · data.js
All lab content, ported 1:1 from the single-file lab: glossary, evidence sheets,
SIEM rows, objectives (Medium guided case / Hard cold case), quiz banks.
Data only — no logic. All records are synthetic training data.
   ====================================================== */
/* ===== DATA: glossary + evidence sheets (all synthetic training data) ===== */
const GLOSS=[
["Log","A time-stamped record of an event, written by a system, application or security tool as things happen."],
["Data source","Any system or feed an investigator can pull facts from — logs, scans, reports, dashboards, captures."],
["Artifact","A snapshot of state taken for the case: a memory dump, a bit-level disk copy, a VM snapshot, even footage."],
["SIEM","Security Information and Event Management — centralizes and indexes sources so you can query and correlate them."],
["Packet capture (PCAP)","The full recorded network traffic — every packet, including payload. The only source that shows WHAT crossed the wire."],
["Network protocol analyzer log","The analyzer tool's own summary of sessions (who, when, how much) — lighter than the full capture it is based on."],
["NetFlow / IPFIX","Router/switch-exported flow records: endpoints, duration, packet and byte counts — no payload."],
["IDS / IPS","Intrusion Detection/Prevention System — matches traffic against signatures and anomalies; logs alerts (IDS) or blocks (IPS)."],
["OS-specific security log","The operating system's own audit trail — Windows Security event log (Event IDs), Linux auth.log / syslog."],
["Metadata","Data about data: timestamps, owners, User-Agent strings, file paths — corroborates or contradicts other evidence."],
["Memory dump / bit-level copy","Forensic images of volatile RAM and of the entire disk, sector by sector, taken in that order (order of volatility)."],
["File & log integrity","Proof evidence has not changed: hash it, record the hash, verify later."],
["Chain of custody","The documented history of who held evidence, when, and what was done to it."],
["False positive","An alert that fires on benign activity; tuning removes them so real signals are not buried."],
["Retention","How long records are kept before being purged — decides whether yesterday's evidence still exists today."]
];

const SHEETS={
fw:{title:"Firewall log",tag:"Log data · core",lead:"Edge firewall decisions: what was allowed, denied, and how much moved.",
blocks:[
{t:"table",head:["time (2026, UTC)","src","dst","port","action","bytes_out","rule"],rows:[
["11-12 02:47:22","203.0.113.87","vpn.helixfreight.example","1194/udp","allow (VPN)","—","VPN-POLICY vpnsess-2202"],
["11-13 03:41:07","203.0.113.87","10.20.30.5 (FS-CORE-01)","8443/tcp","deny","—","BLOCK-EXT-DB"],
["11-13 04:02:19","10.20.30.5 (FS-CORE-01)","203.0.113.87","443/tcp","allow","2247463936","ANY-OUT-443"],
["11-13 06:15:44","any","203.0.113.87","any","deny (admin)","—","SOC-EMERGENCY-BLK"],
["11-13 06:16:02","10.20.30.5 (FS-CORE-01)","203.0.113.87","443/tcp","deny","0","SOC-EMERGENCY-BLK"],
["11-13 04:11:02","10.20.14.23","192.0.2.44","443/tcp","allow","14320","ANY-OUT-443 (noise)"]]},
{t:"callout",text:"Firewall logs record DECISIONS and byte counts — not content. The 04:02 session is the one to explain; 2,247,463,936 bytes left under ANY-OUT-443."}]},

app:{title:"Application log — shipgate",tag:"Log data · core",lead:"The web application's own events: logins, sessions, HTTP errors.",
blocks:[
{t:"pre",text:[
"2026-11-12 02:14:11 LOGIN_OK user=svc_backup ip=203.0.113.87 ua=python-requests/2.31 auth=tok_9f2c**",
"2026-11-12 02:14:55 SESSION_OPEN user=svc_backup session=s-99131",
"2026-11-12 02:16:10 SESSION_CLOSE user=svc_backup session=s-99131",
"2026-11-12 06:40:02 LOGIN_OK user=j.kowalski ip=10.20.14.23 ua=Mozilla/5.0 auth=password",
"2026-11-12 09:12:44 LOGIN_OK user=a.reyes ip=10.20.14.51 ua=Mozilla/5.0 auth=password",
"2026-11-12 22:40:12 HTTP_403 path=/api/v1/search q=%27+OR+1%3D1+-- ip=10.20.9.9",
"2026-11-12 22:41:55 HTTP_403 path=/api/v1/search q=%27+OR+1%3D1+-- ip=10.20.9.9",
"2026-11-13 04:05:00 LOGIN_OK user=r.tanaka ip=10.20.14.77 ua=Mozilla/5.0 auth=password"]},
{t:"callout",text:"Read the User-Agent field (metadata): every human session uses a browser; the 02:14 login uses python-requests — a script. A service account logging in over the internet at 02:14 UTC is worth the case."}]},

edr:{title:"Endpoint (EDR) log",tag:"Log data · core",lead:"Host-agent telemetry from managed workstations and laptops.",
blocks:[
{t:"table",head:["time","host","event","detail","severity"],rows:[
["11-04 19:02:47","FIN-WS-042","FILE_WRITE","C:\\Users\\d.matthews\\AppData\\Roaming\\cache\\svchost32.exe reputation=malware.generic","medium (ticket EDR-1104, pending review)"],
["11-04 19:02:51","FIN-WS-042","NET_CONN","svchost32.exe → 203.0.113.87:443","medium"],
["11-05 03:00:00","FIN-WS-042","SCAN","Defender quick scan — clean","informational"],
["11-08 07:31:19","FIN-WS-042","SERVICE","spooler restarted","informational"],
["11-12 07:55:03","FIN-WS-042","USB","mouse connected","informational"]]},
{t:"callout",gap:true,text:"Coverage gap: the EDR agent runs on laptops/workstations ONLY. FS-CORE-01 and every other server are dark — no process or file events for the staging were recorded here."}]},

ossec:{title:"OS-specific security logs",tag:"Log data · core",lead:"The operating systems' own audit trails — Windows Security event log and Linux auth.log.",
blocks:[
{t:"doc",h:"Windows Security.evtx — FS-CORE-01",blocks:[
{t:"pre",text:[
"11-12 02:47:22  EventID=4624  LogonType=3(network)  User=svc_backup  SrcIP=10.20.118.55  Workstation=VPNPOOL",
"11-12 02:48:06  EventID=5140  ShareName=\\\\FS-CORE-01\\Finance  User=svc_backup  SrcIP=10.20.118.55  Access=Read",
"11-12 02:48:06  EventID=4663  ObjectName=D:\\Finance\\Q4-revenue-master.xlsx  Access=READ  User=svc_backup",
"11-12 02:48:09  EventID=4663  ObjectName=D:\\Finance\\carrier-rates-2026.xlsx  Access=READ  User=svc_backup",
"11-12 02:48:06 → 03:12:41   (10 more EventID=4663 READ events, User=svc_backup, objects under D:\\Finance)",
"11-12 03:12:55  EventID=4634  Logoff  User=svc_backup  SrcIP=10.20.118.55",
"11-12 08:00:03  EventID=4624  LogonType=3  User=helixadm  SrcIP=10.20.2.9   (routine)",
"11-12 12:01:44  EventID=4634  Logoff  User=j.kowalski   (routine)"]}]},
{t:"doc",h:"auth.log — jhub-01 (Linux jump host)",blocks:[
{t:"pre",text:[
"11-12 07:31:02 jhub-01 sshd[1143]: Accepted publickey for ops_amara from 10.20.14.51 port 55210 ssh2",
"11-12 08:15:37 jhub-01 sudo: j.kowalski : TTY=pts/0 ; COMMAND=/usr/bin/apt upgrade -y",
"11-12 14:03:11 jhub-01 sshd[2201]: Accepted publickey for ops_amara from 10.20.14.51 port 55214 ssh2"]}]},
{t:"callout",text:"Event 4624 type 3 = a network logon. 5140 names the share (\\\\FS-CORE-01\\Finance). The 4663 chain shows exactly which files were read. SrcIP 10.20.118.55 is the VPN pool address assigned to the attacker's session."}]},

ids:{title:"IPS / IDS alerts",tag:"Log data · core",lead:"Signature matches and anomaly alerts from the network sensors.",
blocks:[
{t:"table",head:["time","sid","signature","severity","action","src → dst"],rows:[
["11-09 02:22:41","SIG-3110","VPN auth brute-force pattern","high","alert+block","203.0.113.87 → vpn-gw"],
["11-12 22:40:11","SIG-2018-45","SQLi probe (OR-tautology)","high","alert","10.20.9.9 → shipgate-gw"],
["11-12 22:41:58","SIG-2018-45","SQLi probe (OR-tautology)","high","alert","10.20.9.9 → shipgate-gw"],
["11-12 23:05:41","SIG-6608","Unusual API request volume","medium","alert","198.51.100.23 → api-gw"],
["11-12 23:31:02","SIG-2204","DNS tunneling heuristic","low","alert","DNS-01 → resolver (noise)"],
["11-13 04:10:03","SIG-7712","Bulk POST exfil pattern (>100MB)","critical","alert","10.20.30.5 → 203.0.113.87"],
["11-13 06:16:01","SIG-7712","Bulk POST exfil pattern","critical","block","10.20.30.5 → 203.0.113.87"],
["11-12 23:59:44","SIG-5501","Webmail password spray","high","alert+block","192.0.2.88 → webmail"]]},
{t:"callout",text:"SIG-7712 at 04:10 is the detection that started this case — 95 minutes after exfil began. The 22:40 SQLi alerts and the 23:05 volume alert deserve a second look before you trust them."}]},

palog:{title:"Network protocol analyzer log",tag:"Log data · core",lead:"The analyzer's own session summaries for tap CORE-EGRESS.",
blocks:[
{t:"pre",text:[
"sess#8119  11-12 23:00:11 → 01:45:07  tcp 198.51.100.23:52104 → api-gw:443   frames=41208  bytes=88411302  tls",
"sess#8121  11-13 04:02:19 → 06:15:44  tcp 10.20.30.5:49152 → 203.0.113.87:443  frames=182344  bytes=2247463936  tls",
"sess#8122  11-13 06:16:02            tcp 10.20.30.5:49154 → 203.0.113.87:443  frames=3      bytes=240        tls (reset)",
"sess#8117  11-12 22:30:00 → 23:40:52  tcp 10.20.9.9 → shipgate-gw:443        frames=9112   bytes=12220118  tls (monthly vuln scan)"]},
{t:"callout",text:"An analyzer LOG summarizes sessions (who, when, how much). The analyzer's full CAPTURE — the packets themselves — lives in the Packet captures sheet."}]},

vuln:{title:"Vulnerability scan report",tag:"Data source",lead:"Monthly authenticated scan of 2026-10-12, scanner 10.20.9.9.",
blocks:[
{t:"table",head:["finding","asset","severity","CVSS","status"],rows:[
["V-4471 API gateway token validation bypass","shipgate-gw (10.20.31.10)","critical","9.1","OPEN — patch scheduled"],
["V-4468 SMBv1 enabled","FS-CORE-01","high","7.5","OPEN"],
["V-4459 TLS 1.0 allowed","vpn-gw","medium","5.3","OPEN"]]},
{t:"callout",text:"The scan runs monthly on the 12th at 22:30 — that is the 'SQLi probe' the IDS saw on 11-12 (scanner fingerprinting the search endpoint). Findings reflect the 10-12 state; no scan ran between then and the incident, so impact scoping must treat V-4471 as live during the attack window."}]},

autorep:{title:"Automated reports",tag:"Data source",lead:"Scheduled reports nobody asked for at 02:14 — and exactly what the case needed.",
blocks:[
{t:"doc",h:"Weekly SOC shift report — week ending 11-08",blocks:[
{t:"pre",text:["2026-11-05 21:37 — 4× failed token auth, api-gw, src 203.0.113.87.",
"Ticket SOC-3391 CLOSED: 'reconnaissance, no action.'"]}]},
{t:"doc",h:"Change ticket CHG-2291 — APPROVED",blocks:[
{t:"pre",text:["Contractor integration migration — PartnerNet LLC, src 198.51.100.23, token tok_cc7**.",
"Window: 11-12 23:00 → 11-13 02:00. Expected: high API volume. Approver: R. Vance."]}]},
{t:"doc",h:"Monthly compliance report (excerpt)",blocks:[
{t:"pre",text:["Retention matrix and integrity-check status per §7.2 — see the Retention ledger artifact."]}]},
{t:"callout",text:"Automated reports are scheduled snapshots — they preserve context the raw feeds have already purged: the 11-05 probe survives ONLY here, and CHG-2291 clears the contractor red herring."}]},

dash:{title:"SOC dashboards",tag:"Data source",lead:"Live aggregation of SIEM-indexed data — triage at a glance.",
blocks:[
{t:"table",head:["widget","current value"],rows:[
["Top egress talkers (24h)","FS-CORE-01 — 2.25 GB (baseline: 40 MB) ▲"],
["Failed logins by source (7d)","203.0.113.87 ×4 on 11-05 · 192.0.2.88 ×1,102 (spray, blocked)"],
["Open critical findings","V-4471 — shipgate-gw (API token validation bypass)"]]},
{t:"callout",text:"Dashboards are a starting point, not evidence: they aggregate and hide detail. Every number here traces back to a record you should pull."}]},

pcap:{title:"Packet captures",tag:"Data source · full capture",lead:"Capture TAP-CORE-EGRESS — session #8121, 182,344 frames, retained 14 days.",
blocks:[
{t:"table",head:["frames","offset","proto","src → dst","info"],rows:[
["1–3","+0.000s","tcp","10.20.30.5:49152 → 203.0.113.87:443","SYN / SYN-ACK / ACK"],
["4","+0.001s","tls","→ 203.0.113.87:443","ClientHello SNI=upload.telemetry-cdn.example"],
["9","+0.400s","tls","10.20.30.5 → 203.0.113.87","ApplicationData — first of ~1,790 segments"],
["176,502","+1:47:33","tls","10.20.30.5 → 203.0.113.87","ApplicationData — POST part 132"],
["182,340","+2:13:25","tcp","10.20.30.5 → 203.0.113.87","RST — after SOC block"]]},
{t:"doc",h:"Reassembled request (excerpt)",blocks:[
{t:"pre",text:["POST /gate/upload HTTP/1.1","Host: upload.telemetry-cdn.example","User-Agent: python-requests/2.31",
"Content-Type: application/octet-stream","X-Session: 8121","Content-Length: 134217728",
"[binary payload — shipment-record exports matching the D:\\Finance staging set]"]}]},
{t:"callout",text:"Only the capture shows WHAT left: shipment exports uploaded in 128 MB parts to a host dressed up as a telemetry CDN. Staging traffic on the FS VLAN is NOT captured — sensors cover core egress only."}]},

apitr:{title:"API transactions",tag:"Data source",lead:"Gateway log for api.helixfreight.example — every request, token, and status.",
blocks:[
{t:"pre",text:["— records before 2026-11-06 07:31 are purged (7-day retention) —",
"2026-11-12 02:14:55  GET /api/v1/shipments?limit=10000  req=req-8841  token=tok_9f2c**  src=203.0.113.87  status=200  records=10000  bytes_out=1048576",
"2026-11-12 02:15:31  GET /api/v1/shipments?limit=10000  req=req-8842  token=tok_9f2c**  src=203.0.113.87  status=200  records=10000  bytes_out=1048576",
"2026-11-12 02:16:03  GET /api/v1/shipments?limit=10000  req=req-8843  token=tok_9f2c**  src=203.0.113.87  status=200  records=10000  bytes_out=1048576",
"2026-11-12 22:40:12  POST /api/v1/search  req=req-8901  src=10.20.9.9  status=403   (monthly scan)",
"2026-11-12 23:00:11  POST /api/v1/integrations/sync  req=req-8930  token=tok_cc7**  src=198.51.100.23  status=200   (CHG-2291)",
"2026-11-12 23:00:11 → 01:45:07   (411 more integrations/sync rows, CHG-2291 window)",
"2026-11-13 02:00:44  POST /api/v1/integrations/sync  req=req-9201  token=tok_cc7**  src=198.51.100.23  status=200   (window end)"]},
{t:"callout",gap:true,text:"The 11-05 21:37 failed-token probe (4 events) exists ONLY in the automated shift report now — the raw rows aged out. Notice: svc_backup's normal job syncs backups outbound; it never READS bulk shipment data."}]}
};
/* ===== DATA: artifact sheets (V8 additions) + SIEM index ===== */
Object.assign(SHEETS,{
netflow:{title:"NetFlow / IPFIX records",tag:"Artifact · flow data",lead:"Router-exported flow records: endpoints, timing, volume — never content.",
blocks:[
{t:"table",head:["start (2026)","dur (s)","src:port","dst:port","proto","pkts","bytes"],rows:[
["11-13 04:02:19","8035","10.20.30.5:49152","203.0.113.87:443","tcp","145201","2247463936"],
["11-13 06:16:02","0","10.20.30.5:49154","203.0.113.87:443","tcp","2","240"],
["11-12 02:47:22","5700","203.0.113.87:51990","vpn-gw:1194","udp","8110","5402113"]]},
{t:"callout",text:"The 04:02 flow corroborates the firewall record exactly (2,247,463,936 bytes over 2 h 13 m). If the firewall log were lost, NetFlow still proves the volume — that is why you run both."}]},

cctv:{title:"Surveillance footage summary",tag:"Artifact · physical",lead:"DC-CAM-07 (wiring closet 3F) and badge reader FD-3B, 11-12 18:00 → 11-13 07:00.",
blocks:[
{t:"table",head:["source","window","result"],rows:[
["DC-CAM-07 motion events","11-12 18:00 → 11-13 07:00","none"],
["Badge reader FD-3B entries","same window","none — last entry 11-12 17:44 (M. Osei, facilities, routine)"]]},
{t:"callout",text:"Negative evidence is still evidence: no physical entry during the window rules out a hands-on path for the staging. Surveillance footage is a data source in the physical domain of the investigation."}]},

imaging:{title:"System images & acquisition",tag:"Artifact · forensic images",lead:"What was captured from the systems, and in what order.",
blocks:[
{t:"table",head:["asset","artifact","status"],rows:[
["FIN-WS-042","memory capture (8 GB)","ORDERED — must run before power-off"],
["FIN-WS-042","bit-level disk image + hash","QUEUED after memory"],
["FS-CORE-01","VM snapshot (cloud VM)","TAKEN 11-13 08:10, hashed"],
["FS-CORE-01","hypervisor host memory","pending legal-hold approval"]]},
{t:"callout",text:"Order of volatility: capture memory first (it dies at power-off), then the bit-level copy. For VMs, snapshots freeze disk state — but check what snapshot covers (this one: disk, not hypervisor RAM)."}]},

integrity:{title:"Integrity manifest (SHA-256)",tag:"Artifact · integrity",lead:"Hashes recorded when each evidence file entered the bundle.",
blocks:[
{t:"pre",text:["SHA-256 (simulated) — evidence bundle v2",
"fw-core.log            7c1f44ab9d03e251c88a5f026b47d1e0   verified OK",
"shipgate-app.log       4e91d0c377b28a410d55e6f92c83ab17   verified OK",
"winsec-FSCORE01.evtx   b2a7601d58f14c9031d7e2a49e6c0b35   verified OK",
"api-gateway.log        00000000000000000000000000000000   NOT HASHED — rotated before preservation",
"pcap-sess8121.pcap     1d94e77bc25a0f3684e1b9d05f22c7a8   verified OK"]},
{t:"callout",gap:true,text:"Chain of custody: every file hashed at intake, verified before each hand-off. api-gateway.log is the weak link — without a recorded hash, its contents are open to challenge. Use the Hash tool on the desk to verify."}]},

retention:{title:"Retention ledger",tag:"Artifact · policy",lead:"How long each source keeps records. Retention counts from record time; case day 0 = 2026-11-13.",
blocks:[
{t:"table",head:["source","retention","hashed before rotation"],rows:[
["API gateway logs","7 days","no"],
["Packet captures","14 days","yes"],
["Firewall logs","90 days","yes"],
["Windows security events (forwarded)","30 days","yes"],
["NetFlow / IPFIX","30 days","yes"],
["CCTV footage","30 days","yes"],
["EDR telemetry","14 days","yes"]]},
{t:"callout",text:"Read the ledger with a calendar: a 7-day-retained source has already destroyed anything older than a week, no matter how important it turns out to be."}]},

briefing:{title:"Case briefing",tag:"C1 · scenario",lead:"Read me first.",blocks:[
{t:"pre",text:["HELIX FREIGHT SYSTEMS — INCIDENT CASE FILE","Case: HLX-2026-1112 · Opened: 2026-11-13 07:30 UTC · Lead: you (SOC analyst)","Classification: INTERNAL — SYNTHETIC TRAINING DATA","",
"Saturday night into Sunday, somebody used the svc_backup service-account API token from an",
"internet host to bulk-read shipment records, logged into FS-CORE-01 over VPN, staged roughly",
"3 GB of finance files, and uploaded most of it to 203.0.113.87 before the SOC blocked the IP.",
"",
"Your job is NOT to hack anything back. Your job is to run the evidence side of the",
"investigation: pull the right sources from the locker, read them, reconstruct the timeline,",
"tune out the noise, verify integrity, and get the case ready for legal, HR and accounting."]},
{t:"callout",text:"Exam tie-in: Security+ SY0-801 objective 4.8 — 'Given a scenario, use data, artifacts and sources to support a security investigation.' This lab exercises every source named in that objective."}]},

primer:{title:"Case primer — the knowledge core",tag:"C2 · understand",lead:"What each source is for, and where investigations go wrong.",
blocks:[
{t:"doc",h:"Two families of evidence",blocks:[
{t:"pre",text:["LOG DATA — what systems wrote as things happened:",
"  firewall · application · endpoint (EDR) · OS security · IDS/IPS · protocol-analyzer logs",
"DATA SOURCES — what you pull on demand:",
"  vulnerability scans · automated reports · dashboards · packet captures ·",
"  API transactions · SIEM custom queries","",
"V8 additions you must know as artifacts: NetFlow/IPFIX flow records, file metadata,",
"surveillance footage, system images (memory dumps, bit-level copies, snapshots),",
"file & log integrity (hashing), and log-parsing techniques."]}]},
{t:"doc",h:"Where investigations live or die",blocks:[
{t:"pre",text:["1. COVERAGE — if a host is dark (no EDR on servers), nothing can prove what ran there.",
"2. RETENTION — a 7-day purge eats the probe that came before the incident.",
"3. INTEGRITY — an unhashed log can be challenged in front of legal.",
"4. NOISE — one untuned signature hides the one alert that mattered.",
"5. PARSING — raw lines only become evidence when you can extract fields from them."]}]},
{t:"doc",h:"How the pros use these sources (public patterns)",blocks:[
{t:"pre",text:["Real-world investigations routinely proceed like this one: an IDS or SIEM alert opens the case",
"(e.g. SIG-7712 here), firewall/NetFlow records size the event, authentication and API logs",
"identify the account and scope, packet captures prove content, forensic images preserve state,",
"and hash manifests keep it all admissible. MITRE ATT&CK models these evidence types as data",
"sources (e.g. 'Logon Session', 'Network Traffic', 'File', 'Command Execution') that detections","map back to — the same mapping you will practice here."]}]},
{t:"callout",text:"Open the glossary (header button) any time a term feels loose. Every evidence sheet stays available from the locker — good investigators re-read the raw records."}]}
});

/* SIEM bench sheet */
Object.assign(SHEETS,{siembench:{title:"SIEM — Lighthouse console",tag:"Data source · correlation layer",lead:"Index across every source: 11 rows currently ingested. Query it from here or from the Query objectives.",blocks:[]}});

/* SIEM index rows (synthetic) — fields: ts,host,source,user,src_ip,action,event */
const SIEM_ROWS=[
{ts:"11-12 02:14:11",host:"shipgate-01",source:"app:shipgate",user:"svc_backup",src_ip:"203.0.113.87",action:"LOGIN_OK",event:"web_login"},
{ts:"11-12 02:47:22",host:"FS-CORE-01",source:"win:security",user:"svc_backup",src_ip:"10.20.118.55",action:"LOGON_SUCCESS",event:"4624"},
{ts:"11-12 02:48:06",host:"FS-CORE-01",source:"win:security",user:"svc_backup",src_ip:"10.20.118.55",action:"SHARE_ACCESS",event:"5140"},
{ts:"11-12 02:48:06",host:"FS-CORE-01",source:"win:security",user:"svc_backup",src_ip:"10.20.118.55",action:"FILE_READ",event:"4663 (x12 aggregated)"},
{ts:"11-12 06:40:02",host:"shipgate-01",source:"app:shipgate",user:"j.kowalski",src_ip:"10.20.14.23",action:"LOGIN_OK",event:"web_login"},
{ts:"11-12 09:12:44",host:"shipgate-01",source:"app:shipgate",user:"a.reyes",src_ip:"10.20.14.51",action:"LOGIN_OK",event:"web_login"},
{ts:"11-12 22:40:12",host:"shipgate-gw",source:"app:shipgate",user:"(none)",src_ip:"10.20.9.9",action:"HTTP_403",event:"api_scan"},
{ts:"11-12 23:00:11",host:"api-gw",source:"api:gateway",user:"svc_integration",src_ip:"198.51.100.23",action:"API_CALL",event:"integrations_sync"},
{ts:"11-12 14:03:11",host:"jhub-01",source:"linux:auth",user:"ops_amara",src_ip:"10.20.14.51",action:"SSH_OK",event:"publickey"},
{ts:"11-13 04:05:00",host:"shipgate-01",source:"app:shipgate",user:"r.tanaka",src_ip:"10.20.14.77",action:"LOGIN_OK",event:"web_login"},
{ts:"11-13 03:12:55",host:"FS-CORE-01",source:"win:security",user:"svc_backup",src_ip:"10.20.118.55",action:"LOGOFF",event:"4634"}
];
/* ===== OBJECTIVES: Medium (guided case) ===== */
const LOGSRC=["Firewall log","Application log","Endpoint (EDR) log","OS-specific security logs","IPS/IDS logs","Network protocol analyzer log",
"Vulnerability scan","Automated reports","Dashboards","Packet captures","API transactions","SIEM"];

const OBJM=[
{id:"OBJ-M1",pillar:"P1",title:"Know your log types",cluster:"Understand the locker",
card:"Match the six log-data types to what each one records.",
prompt:"A file fell off a truck: six log-type labels and six descriptions, and only one pairing is right. Match them. This is the vocabulary every other objective uses.",
ui:"match",data:{pairs:[
["Firewall logs","Allow/deny decisions, endpoints, ports and byte counts at the network edge"],
["Application logs","What the software itself wrote: logins, sessions, HTTP errors, custom events"],
["Endpoint (EDR) logs","Host-agent telemetry on managed workstations: processes, files, connections"],
["OS-specific security logs","The OS audit trail: Windows Event IDs (4624, 5140, 4663), Linux auth.log and sudo"],
["IPS/IDS logs","Signature and anomaly alerts about suspicious traffic"],
["Network protocol analyzer (packet capture) logs","Session summaries of recorded traffic: who, when, how much"]]},
hints:["Descriptions are verbatim from the evidence sheets — open the locker cards and read the lead line.",
"Match the words: 'decisions' = firewall; 'Event IDs' = OS security logs; 'signature' = IDS/IPS.",
"Order on the right matches the locker order: fw, app, endpoint, OS, IDS, analyzer."],
fb:"Log types are the exam's first list under 4.8 — an analyst who cannot say what a source records will pull the wrong one. Next: notice each sheet's coverage LIMITS (the EDR gap) — that is objective M3 territory."},

{id:"OBJ-M2",pillar:"P1",title:"Know your data sources",cluster:"Understand the locker",
card:"Match the six data sources to the investigation role each plays.",
prompt:"The second half of the exam list: data sources you pull on demand. Match each to the role it plays in an investigation.",
ui:"match",data:{pairs:[
["Vulnerability scan","Point-in-time weaknesses with CVSS scores — used to scope impact"],
["Automated report","Scheduled snapshot that preserves context after raw records age out"],
["Dashboard","Live aggregation for triage — a starting point, never final evidence"],
["Packet capture","The full recorded traffic — the only source that proves WHAT crossed the wire"],
["API transactions","Per-request gateway record: token, endpoint, status, record counts"],
["SIEM (custom queries)","The index and query layer across sources — where correlation happens"]]},
hints:["Two of these both come from network sensors — one is the summary, one is the packets themselves.",
"'Preserves context after purge' is the automated report: the 11-05 probe survives only there.",
"Read the palog and pcap sheets back to back; the difference is summary vs content."],
fb:"The 4.8 data-source list is examinable verbatim. The subtle pair — analyzer log vs full capture — trips up candidates: summaries prove volume and timing; only captures prove content."},

{id:"OBJ-M3",pillar:"P2",title:"Evidence sweep",cluster:"Reconstruction desk",
card:"Decide which sources are DIRECT evidence of the attacker's actions.",
prompt:"Work the locker: open each evidence sheet and stamp it. Stamp INCLUDE only if the sheet directly documents what the attacker DID in this incident; stamp DISMISS if it is context, tooling, or negative evidence. Nine sheets earn INCLUDE.",
ui:"sweep",data:{include:["fw","app","ossec","ids","palog","pcap","apitr","dash","netflow"],total:17},
hints:["Direct = shows attacker actions. Ask of each sheet: does this record something the attacker did?",
"EDR, CCTV, imaging, integrity and retention are handling/context documents — the vuln scan, automated reports and SIEM bench are support, not direct evidence.",
"The nine: firewall, application, OS security, IDS, analyzer log, packet capture, API transactions, dashboards, NetFlow."],
fb:"'Use the APPROPRIATE source' is the actual skill: direct evidence answers what happened; context answers why it matters; tools produce evidence. Dismissing EDR is the hard one — it is relevant in general, but its coverage gap means it holds nothing for the staging. Next: find the first contact."},

{id:"OBJ-M4",pillar:"P2",title:"First contact",cluster:"Reconstruction desk",
card:"Identify the anomalous login from the application log.",
prompt:"Open the shipgate application log and find the login that opened this case. Enter the source IP and the account used.",
ui:"fields",data:{fields:[
{key:"ip",label:"Source IP of the anomalous login",accept:/^203\.0\.113\.87$/,ph:"x.x.x.x"},
{key:"acct",label:"Account used",accept:/^svc_backup$/i,ph:"account name"}]},
hints:["It is not the 06:40 login — humans log in from 10.20.14.x with a browser User-Agent.",
"02:14:11, User-Agent python-requests, from an internet address.",
"IP 203.0.113.87, account svc_backup."],
fb:"The app log caught it because the app logs its OWN logins with UA metadata — the firewall only saw 'HTTPS to shipgate'. Metadata (UA + IP) is what turns a routine line into evidence. Next: follow what that session did."},

{id:"OBJ-M5",pillar:"P2",title:"Follow the data",cluster:"Reconstruction desk",
card:"Trace what the session pulled and where the bulk data went.",
prompt:"Two hops: (1) In API transactions, enter the three request IDs of the bulk shipment reads. (2) In the firewall log, enter the destination and port of the session that moved the staged data OUT (format ip:port).",
ui:"fields",data:{fields:[
{key:"reqs",label:"The three bulk-read request IDs",accept:"reqs",ph:"req-XXXX, req-XXXX, req-XXXX"},
{key:"dest",label:"Exfil destination (ip:port)",accept:/^203\.0\.113\.87\s*:\s*443$/,ph:"ip:port"}]},
hints:["The API rows carry token tok_9f2c** and status=200 with records=10000 — three of them.",
"The firewall row says ALLOW with a seven-figure bytes_out and rule ANY-OUT-443.",
"req-8841, req-8842, req-8843 — and 203.0.113.87:443."],
fb:"Pivoting request IDs is how API-scale incidents are scoped: three rows × 10,000 records = 30,000 shipment records read. The 443 ALLOW with 2,247,463,936 bytes_out is your exfil lead — the capture sheet proves what it was."},

{id:"OBJ-M6",pillar:"P2",title:"Rebuild the timeline",cluster:"Reconstruction desk",
card:"Order six key events across four different sources.",
prompt:"Drag nothing — click events to place them on the timeline rope in the order they happened. All times are 2026 UTC, from four different sources.",
ui:"order",data:{events:[
["a","02:14:11 — shipgate login (svc_backup, script UA)"],
["b","02:14:55 → 02:16:03 — 3× bulk API reads (30,000 records)"],
["c","02:47:22 — VPN session + Windows 4624 on FS-CORE-01"],
["d","03:41:07 — firewall DENY: attacker probes 8443"],
["e","04:02:19 — firewall ALLOW: exfil session starts on 443"],
["f","06:15:44 — SOC emergency-blocks 203.0.113.87"]]},
hints:["Timestamps are in the labels, but confirm each against its source sheet.",
"Read → : login, read, logon, denied attempt, allowed exfil, block.",
"a → b → c → d → e → f."],
fb:"A timeline built from MULTIPLE sources is stronger than any single log: app log, API gateway, Windows events and firewall agree on the story. Correlation is the 4.8 skill examiners love to test. Next: make the SIEM do this at scale."},

{id:"OBJ-M7",pillar:"P3",title:"Query the SIEM",cluster:"Query & triage bench",
card:"Build a SIEM query that returns every svc_backup event.",
prompt:"On the query bench, build a query that returns ALL svc_backup activity across sources, run it, and enter how many rows come back. (Clue: do not over-filter — breadth first, narrow later.)",
ui:"query",data:{must:[{f:"user",op:"equals",v:"svc_backup"}],count:5},
hints:["The index holds 11 rows; five belong to svc_backup — including events from Windows on FS-CORE-01.",
"Add only ONE clause: user equals svc_backup. Extra clauses shrink the result and hide the Windows rows.",
"Run user=svc_backup, count = 5."],
fb:"Breadth-first querying is how correlation finds what you did not know to look for: the same account appears in the app log, then Windows events — one identity, five rows, two hosts. Narrow filters are for verification, not discovery. Next: judge the alerts."},

{id:"OBJ-M8",pillar:"P3",title:"Triage the alerts",cluster:"Query & triage bench",
card:"Classify six IDS alerts as true or false positives.",
prompt:"Stamp each alert TRUE POSITIVE or FALSE POSITIVE. The truth is in the other sheets: the vuln scan's schedule, the automated reports, and the incident timeline.",
ui:"triage",data:{alerts:[
["A1","SIG-2018-45 SQLi probe, 11-12 22:40, src 10.20.9.9 → shipgate-gw","FP","Scanner activity: the monthly vuln scan runs 22:30 on the 12th from 10.20.9.9 (vuln sheet)"],
["A2","SIG-7712 bulk POST exfil pattern, 11-13 04:10, src 10.20.30.5","TP","Matches the real exfil session to 203.0.113.87 (firewall + pcap)"],
["A3","SIG-6608 unusual API volume, 11-12 23:05, src 198.51.100.23","FP","Approved change window CHG-2291 (automated reports)"],
["A4","SIG-2204 DNS tunneling heuristic, 11-12 23:31, src DNS-01","FP","Low-severity heuristic on our own resolver — no tunnel observed anywhere"],
["A5","SIG-3110 VPN brute-force, 11-09 02:22, src 203.0.113.87","TP","Same attacker IP days earlier — failed token auths, then success"],
["A6","SIG-5501 webmail password spray, 11-12 23:59, src 192.0.2.88","TP","A real spray from an unrelated internet actor — separate ticket"]]},
hints:["Two alerts share a timestamp window with a scheduled activity — check the vuln sheet and CHG-2291.",
"203.0.113.87 appears twice: on 11-09 (blocked) and in this case. That is a pattern, not noise.",
"FP: A1, A3, A4 · TP: A2, A5, A6."],
fb:"True/false-positive judgment is why investigations need BOTH alert data and context sources: the scan schedule and the change ticket turn scary alerts into noise in seconds. Untuned noise is what buried the real alert for 95 minutes. Next: pick sources like an investigator."},

{id:"OBJ-M9",pillar:"P3",title:"Right source, right question",cluster:"Query & triage bench",
card:"Pick the best source for four investigation questions.",
prompt:"Four questions from the case team. For each, choose the single most appropriate source from the list.",
ui:"sel4",data:{qs:[
{q:"WHAT exactly crossed the wire to 203.0.113.87?",opts:["NetFlow/IPFIX","Packet captures","Firewall log","Analyzer log"],ans:1},
{q:"HOW MUCH data, for how long — without pulling payload?",opts:["Packet captures","IDS logs","NetFlow/IPFIX","OS security logs"],ans:2},
{q:"How many records did each API call return?",opts:["Application log","API transactions","SIEM dashboard","Automated report"],ans:1},
{q:"Which exploitable weaknesses existed at incident time?",opts:["Vulnerability scan","Endpoint log","Dashboards","Packet capture"],ans:0}]},
hints:["'Content' is the keyword — only one source stores payload.",
"'Without payload' rules the heavy option out; routers already counted bytes.",
"records= is a gateway field; weaknesses live in scan findings."],
fb:"Flow records vs captures, gateway rows vs app logs, scan findings vs dashboards — the exam words questions exactly this way ('Given a scenario…'). The discipline: content → capture; volume → flow; per-request facts → API transactions; weaknesses → scan."},

{id:"OBJ-M10",pillar:"P2",title:"Parse a raw record",cluster:"Query & triage bench",
card:"Extract six fields from one raw firewall line.",
prompt:"Log parsing is the bridge between raw lines and SIEM queries. Take this line and enter each field:\n2026-11-13 04:02:19 ALLOW tcp 10.20.30.5:49152 → 203.0.113.87:443 bytes_out=2247463936 rule=ANY-OUT-443",
ui:"fields",data:{fields:[
{key:"ts",label:"timestamp",accept:/^((2026-)?11-13\s)?04:02:19$/,ph:"…"},
{key:"act",label:"action",accept:/^allow$/i,ph:"…"},
{key:"sip",label:"src IP",accept:/^10\.20\.30\.5$/,ph:"…"},
{key:"sport",label:"src port",accept:/^49152$/,ph:"…"},
{key:"dport",label:"dst port",accept:/^443$/,ph:"…"},
{key:"bytes",label:"bytes_out",accept:/^2[, _]?247[, _]?463[, _]?936$/,ph:"…"}]},
hints:["ip:port splits on the colon; there are two pairs on the line.",
"The action sits between timestamp and protocol.",
"bytes_out is the field name in the line — enter its digits only."],
fb:"Before any query can run, something parsed '10.20.30.5:49152' into source and port fields — that is log parsing, and the exam lists it explicitly. Fields become filters; filters become the queries from M7. Next: does the evidence even still exist?"},

{id:"OBJ-M11",pillar:"P4",title:"Retention ledger check",cluster:"Evidence handling room",
card:"Work out which evidence the calendar destroyed.",
prompt:"You reopen the case on 2026-11-25 (day 12). (1) Select EVERY source that has LOST evidence of the 11-05 21:37 probe. (2) Enter the minimum API-log retention, in days, that would have kept the probe available on day 12.",
ui:"multi+field",data:{items:[
["api","API transactions (7 days)"],["pcap","Packet captures (14 days)"],["fw","Firewall logs (90 days)"],
["win","Windows security events (30 days)"],["nf","NetFlow/IPFIX (30 days)"],["cctv","CCTV footage (30 days)"]],
ans:["api","pcap"],field:{label:"Minimum API retention to keep the 11-05 probe through day 12",accept:/^1[9-9]|^2[0-1]/,exact:"20",ph:"days"}},
hints:["Retention counts from RECORD time, not case-open time. 11-05 + 7 = ? And 11-05 + 14 = ?",
"11-12 (purge day for API) is before 11-25; 11-19 (purge day for captures) is also before 11-25.",
"API transactions AND packet captures — and 20 days."],
fb:"Retention math decides what historians of your incident can ever know: the probe that predicted everything died at 7 days, and the capture would have died at 14. Retention is a mitigation control, not an IT chore — 30-day minimums for security-relevant feeds is the exam-level takeaway."},

{id:"OBJ-M12",pillar:"P4",title:"Close the readiness gaps",cluster:"Evidence handling room",
card:"Match each investigation gap to the fix that closes it.",
prompt:"Three gaps slowed this case down. Match each to the readiness improvement that prevents it next time.",
ui:"match",data:{pairs:[
["No process/file visibility on FS-CORE-01 during staging","Deploy EDR to the server tier"],
["Staging traffic on the FS VLAN was never captured","Add a tap / packet capture on the FS VLAN"],
["API logs purge after 7 days and were never hashed","Extend API-log retention and hash before rotation"]]},
hints:["One gap is about COVERAGE (an agent missing), one about VISIBILITY (a sensor missing), one about TIME + INTEGRITY.",
"'Never recorded at all' is coverage; 'recorded but invisible' is sensor placement.",
"Server agents · FS-VLAN tap · retention + hashing."],
fb:"This is the mitigate-pillar of a data-source chapter: you cannot patch the past, but you can make the next investigation faster and its evidence defensible — coverage, visibility, retention, integrity, in that order of regret."}
];
/* ===== OBJECTIVES: Hard (cold case) ===== */
const OBJH=[
{id:"OBJ-H1",pillar:"P1",title:"Source anatomy under fire",cluster:"Cold-case desk",
card:"Six questions. For each: pick the ONE best source AND name the exact field that answers it.",
prompt:"The case team wants answers with citations. For each question select the best source and type the field name in that source (as written on the sheet) that answers it. Exact field names; near-misses rejected.",
ui:"srcfield",data:{qs:[
{q:"Proves the byte volume of the exfil session",src:"Firewall log",field:["bytes_out"]},
{q:"Shows exactly how many records an API call returned",src:"API transactions",field:["records"]},
{q:"Names the network share that was accessed",src:"OS-specific security logs",field:["sharename","share"]},
{q:"Identifies the client software of a login",src:"Application log",field:["ua","user_agent","user-agent"]},
{q:"Identifies which signature fired",src:"IPS/IDS logs",field:["sid","signature id","signature-id"]},
{q:"Gives session duration without payload",src:"NetFlow/IPFIX",field:["dur","duration"]}]},
hints:["Each sheet renders these fields in its table headers or raw lines — read literally.",
"bytes_out, records, ShareName, ua, sid, dur — six different sheets, six exact names.",
"Return to the sheet, not to memory; the field is printed on it."],
fb:"Citing source + field is how findings survive review: 'firewall log, bytes_out=2247463936' is evidence; 'lots of data' is a feeling. This is the exam's core 4.8 reflex, made precise."},

{id:"OBJ-H2",pillar:"P2",title:"Full reconstruction",cluster:"Cold-case desk",
card:"Rebuild the complete 8-event timeline across six sources.",
prompt:"Place all eight events in true chronological order. No labels this time — cross-reference the sheets yourself: automated reports, application log, API transactions, OS security logs, firewall log, SOC block record.",
ui:"order",data:{events:[
["a","4× failed token auths from 203.0.113.87 on api-gw (ticket SOC-3391)"],
["b","shipgate login: svc_backup from 203.0.113.87, UA python-requests"],
["c","bulk shipment reads begin — req-8841/42/43, 30,000 records"],
["d","VPN session opens; Windows 4624 (type 3) on FS-CORE-01"],
["e","Share \\\\FS-CORE-01\\Finance accessed; 4663 file reads → staging"],
["f","Firewall DENY: 203.0.113.87 probes FS-CORE-01 on 8443"],
["g","Firewall ALLOW: 443 session to 203.0.113.87 — exfil begins"],
["h","IDS review escalates; SOC emergency-blocks 203.0.113.87"]]},
hints:["The failed auths are only in the automated report — they precede everything by a week.",
"Sequencing inside the night: identity (login) → collection (reads) → access (4624/share) → attempt (8443) → success (443) → response (block).",
"a→b→c→d→e→f→g→h."],
fb:"Eight events, six sources, one story — and note the_DENIED probe BEFORE the allowed session: attackers test, defenders get one denial to catch. Your timeline is the artifact legal will ask for first."},

{id:"OBJ-H3",pillar:"P2",title:"The four fingerprints",cluster:"Cold-case desk",
card:"Extract the four identifiers that define the incident.",
prompt:"Enter the exact values: attacker source IP · compromised account · staging share path (as written in Event 5140) · exfil endpoint (ip:port).",
ui:"fields",data:{fields:[
{key:"ip",label:"Attacker source IP",accept:/^203\.0\.113\.87$/,ph:"…"},
{key:"acct",label:"Compromised account",accept:/^svc_backup$/i,ph:"…"},
{key:"share",label:"Staging share path",accept:/^\\\\fs-core-01\\finance$/i,ph:"\\\\FS-CORE-01\\Finance"},
{key:"ep",label:"Exfil endpoint",accept:/^203\.0\.113\.87\s*:\s*443$/,ph:"ip:port"}]},
hints:["One of these lives in a Windows event, one in an app log line, two in firewall rows.",
"5140 prints the share literally: ShareName=\\\\FS-CORE-01\\Finance.",
"203.0.113.87 · svc_backup · \\\\FS-CORE-01\\Finance · 203.0.113.87:443."],
fb:"Four identifiers — IP, identity, location, destination — let any responder pivot every source in seconds. If these are wrong, the IOC list you hand to legal and to the blocklist is wrong."},

{id:"OBJ-H4",pillar:"P2",title:"Acquisition & integrity",cluster:"Evidence handling room",
card:"Order the volatile acquisitions, then verify the hash manifest.",
prompt:"Three steps. (1) Order the two FIN-WS-042 acquisitions correctly. (2) Choose the principle that dictates that order. (3) Use the desk Hash tool on the evidence files and decide which one CANNOT be integrity-verified — then say so.",
ui:"acq",data:{
order:[["mem","Memory capture"],["disk","Bit-level disk image"]],
whyq:{opts:["Memory is volatile — it is lost at power-off, so it goes first","Disk images are faster to take","Legal policy prefers memory","Bit-level copies alter memory"],ans:0},
files:["fw-core.log","shipgate-app.log","winsec-FSCORE01.evtx","api-gateway.log","pcap-sess8121.pcap"],
bad:"api-gateway.log",hashmap:{"fw-core.log":"7c1f44ab9d03e251c88a5f026b47d1e0","shipgate-app.log":"4e91d0c377b28a410d55e6f92c83ab17","winsec-FSCORE01.evtx":"b2a7601d58f14c9031d7e2a49e6c0b35","api-gateway.log":"00000000000000000000000000000000","pcap-sess8121.pcap":"1d94e77bc25a0f3684e1b9d05f22c7a8"}},
hints:["What survives a power-off? Only the disk.",
"Compare the tool's output for api-gateway.log against the manifest — and against the others.",
"Order: memory → disk. Principle: volatility. Unverifiable: api-gateway.log (never hashed before rotation)."],
fb:"Order of volatility is examinable and non-negotiable: RAM first, disk second. And integrity is what makes evidence evidence — the one unhashed file is the one opposing counsel would attack. Chain of custody is only as strong as its hashes."},

{id:"OBJ-H5",pillar:"P3",title:"Correlate like an analyst",cluster:"Cold-case desk",
card:"Build the correlation query, then prove the byte figure twice.",
prompt:"(1) On the bench, build a query that isolates ALL svc_backup activity on FS-CORE-01 (two clauses needed) and enter the row count. (2) Select every source INDEPENDENTLY corroborating the 2,247,463,936-byte figure.",
ui:"query+multi",data:{must:[{f:"user",op:"equals",v:"svc_backup"},{f:"host",op:"equals",v:"FS-CORE-01"}],count:4,
multi:{items:[["fw","Firewall log (bytes_out)"],["nf","NetFlow/IPFIX (bytes)"],["pcap","Packet capture (payload)"],["ids","IDS alert (severity)"]],
ans:["fw","nf"],why:"The capture proves content, not a byte tally; the IDS proves detection, not volume."}},
hints:["Host names are case-sensitive as stored: FS-CORE-01. Run it, read the table.",
"Volume appears in two independent telemetry systems; content appears in one.",
"Rows = 4. Corroborators: firewall bytes_out + NetFlow bytes."],
fb:"Correlation = same identity across hosts (4 rows: 4624, 5140, 4663-aggregate, 4634-logoff), and the volume figure standing on two independent legs (firewall + flow). When two unrelated systems agree, the number is fact; when only one says it, you investigate why."},

{id:"OBJ-H6",pillar:"P3",title:"Triage with reasons",cluster:"Cold-case desk",
card:"Classify 8 alerts — every verdict needs a reason code.",
prompt:"For each alert pick TP or FP AND the reason code that justifies it. Reason codes: scanner activity · approved change · matching exfil pattern · resolver noise · brute-force pattern · separate actor spray · same session post-block.",
ui:"triage",data:{reasons:["scanner activity","approved change","matching exfil pattern","resolver noise","brute-force pattern","separate actor spray","same session post-block"],alerts:[
["A1","SIG-2018-45 SQLi probe, 11-12 22:40, src 10.20.9.9","FP","scanner activity"],
["A2","SIG-7712 bulk POST exfil, 11-13 04:10, src 10.20.30.5","TP","matching exfil pattern"],
["A3","SIG-6608 unusual API volume, src 198.51.100.23","FP","approved change"],
["A4","SIG-2204 DNS tunneling heuristic, src DNS-01","FP","resolver noise"],
["A5","SIG-3110 VPN brute-force, 11-09, src 203.0.113.87","TP","brute-force pattern"],
["A6","SIG-5501 webmail spray, src 192.0.2.88","TP","separate actor spray"],
["A7","SIG-2018-45 SQLi probe, 11-12 22:41, src 10.20.9.9","FP","scanner activity"],
["A8","SIG-7712 bulk POST exfil, 06:16:01 (post-block)","TP","same session post-block"]]},
hints:["10.20.9.9 is the scanner IP; 198.51.100.23 has a change ticket; DNS-01 is our own resolver.",
"203.0.113.87 shows brute-force on 11-09 and exfil on 11-13 — one actor, two signatures, both real.",
"FP: A1 scanner, A3 change, A4 noise, A7 scanner · TP: A2, A5, A6, A8."],
fb:"A triage verdict without a reason code is an opinion. With codes, six FPs become one tuning backlog item (allowlist the scanner IP) and the TPs tell one coherent story: the actor rehearsed on 11-09, executed on 11-13."},

{id:"OBJ-H7",pillar:"P4",title:"The exfil verdict",cluster:"Cold-case desk",
card:"State, with numbers, how much data actually left.",
prompt:"Executive question: 'Did we lose everything?' (1) Verdict on the 443 session: full / partial / none. (2) Enter the firewall bytes_out exactly. (3) Enter the staged volume as recorded during staging. (4) Select the TWO sources that together prove BOTH volume and content.",
ui:"verdict",data:{verdicts:["full","partial","none"],bytesAccept:/^2[, _]?247[, _]?463[, _]?936$/,stagedAccept:/^3\s*gb$/i,
multi:{items:[["fw","Firewall log"],["pcap","Packet capture"],["nf","NetFlow/IPFIX"],["ids","IDS alert"]],ans:["fw","pcap"]}},
hints:["Compare bytes_out with the staged 3.0 GB — compute the percentage.",
"Which source counts bytes, and which one shows shipment exports in the payload?",
"partial · 2247463936 · 3 GB · firewall + packet capture."],
fb:"2,247,463,936 bytes ≈ 2.09 GiB ≈ 74.9% of the staged 3.0 GB left before the block: partial exfiltration, quantified. Volume without content is inconclusive — the capture is what upgrades 'a lot of bytes' into 'shipment exports'."},

{id:"OBJ-H8",pillar:"P4",title:"What the calendar destroyed",cluster:"Evidence handling room",
card:"Determine which case questions are now permanently unanswerable.",
prompt:"On day 12 (2026-11-25): (1) select EVERY question below that can NO LONGER be answered from retained evidence; (2) enter the minimum API-log retention, in days, that would have preserved all of it through day 12.",
ui:"multi+field",data:{items:[
["q1","Which records did the attacker read via the API on 11-12?"],
["q2","How much data left via the 443 session?"],
["q3","Was there physical access to the wiring closet?"],
["q4","Which exploitable weaknesses existed at incident time?"],
["q5","Did the attacker probe the API before 11-06?"]],
ans:["q1","q5"],field:{label:"Minimum API retention (days)",accept:/^20(\s*days)?$/i,exact:"20",ph:"days"}},
hints:["API rows live 7 days. 11-12 + 7 = 11-19 — before day 12. The probe: 11-05 + 7 = 11-12.",
"Firewall 90d, NetFlow 30d, CCTV 30d, and the scan report is a kept document.",
"Unanswerable: q1 and q5 · retention needed: 20 days."],
fb:"The bulk reads AND the pre-incident probe are both gone by day 12 — the difference between a scoped incident and an open question is 13 days of retention policy. 'Missing data sources, retention' are explicitly named in this exam domain."},

{id:"OBJ-H9",pillar:"P1",title:"Artifact epistemology",cluster:"Cold-case desk",
card:"Classify 8 samples: raw record, derived summary, full capture, or query result.",
prompt:"Match each sample to what it actually is. Two categories receive three samples each; two receive one each.",
ui:"match",data:{pairs:[
["Application log line (LOGIN_OK …)","Raw record"],
["Dashboard widget 'Top egress talkers'","Derived summary"],
["Frame 176,502 of session #8121 (TLS payload)","Full capture"],
["SIEM result table for user=svc_backup","Query result"],
["Windows Event 5140 entry","Raw record"],
["Weekly SOC shift report","Derived summary"],
["Reassembled HTTP POST from the capture","Full capture"],
["API gateway transaction row req-8842","Raw record"]]},
hints:["Ask: did a system write this as it happened, did a human or job summarize it, is it packets, or did a query produce it?",
"Raw ×3: app line, 5140, API row · Derived ×2: widget, weekly report · Capture ×2: frame, reassembled POST.",
"One query result: the SIEM table."],
fb:"Knowing WHAT KIND of thing you are holding tells you how much to trust it: raw records are ground truth, summaries lose detail, captures are heavy but complete, query results are only as good as the query. That distinction is the heart of 4.8."}
];

/* ===== QUIZ ===== */
/* ===== rebuilt quiz bank (QA fix: rotation, length discipline, per-option rationales) ===== */
const QUIZM=[
{topic:"OS-specific security logs",q:"A powered-on Windows server shows an interactive logon. Which source FIRST recorded it, by design?",opts:["Windows Security event log","Firewall connection audit log","Application session event log","Network intrusion alert log"],ans:0,
why:["The OS writes the audit event itself at logon time.","Firewalls see network flows, not local logon sessions.","Apps log their own sessions, not OS logons.","IDS alerts flag suspicious traffic, not routine logons."],
ex:"The OS writes the audit event (4624, logon type) itself — firewalls only saw network traffic, apps only see their own sessions. OS-specific security logs are the system of record for logons."},
{topic:"Firewall vs IDS roles",q:"The firewall log shows DENY for a connection. What does the IDS log add?",opts:["A second byte count for the session","Detection context: signature and severity","The payload that was blocked","The user account behind the traffic"],ans:1,
why:["Byte counting belongs to the firewall and NetFlow.","Signature and severity classify WHY the traffic looked malicious.","Payload lives in packet captures, not IDS alerts.","Accounts come from auth and application logs."],
ex:"Firewalls enforce (allow/deny); IDS/IPS detect and classify (signature, severity). The two together answer 'was it stopped?' AND 'was it malicious?'"},
{topic:"NetFlow vs packet capture",q:"Why would an investigator pull NetFlow records when a full packet capture already exists?",opts:["Flows contain payload the capture missed","Flow records are much cheaper to retain","Flow data proves which files were sent","Flow export can replace integrity hashing"],ans:1,
why:["Flows carry NO payload by definition.","Tiny metadata records mean much longer retention windows.","Files-as-content needs captures or disk images.","Hashing evidence and flow export are unrelated controls."],
ex:"Flow data is metadata only — tiny compared to PCAP, so retention is longer. It corroborates volume/timing (as the firewall does here) without the storage cost."},
{topic:"Reports vs dashboards",q:"How does an automated report differ from a dashboard?",opts:["Reports are scheduled snapshots; dashboards aggregate live","Reports are live views; dashboards are archived","Dashboards are always the more accurate source","The two differ only in chart styling choices"],ans:0,
why:["Snapshots preserve context; dashboards trend in real time.","Exactly inverted.","Dashboards summarize and hide detail.","Timing and purpose differ, not just presentation."],
ex:"In this case the automated weekly report is the ONLY surviving record of the 11-05 probe; the dashboard shows trends but its details age out with the index."},
{topic:"Content proof",q:"Which source best proves WHAT content was exfiltrated?",opts:["Firewall byte counter","NetFlow byte record","Packet capture","Trend dashboard panel"],ans:2,
why:["Counts bytes, shows none of them.","Same volume-only limitation as the firewall.","The payload is in the capture.","Aggregates for triage, not content."],
ex:"Only packet captures contain the payload. The firewall and flow records prove volume; the capture (or a system image of the staging host) proves content."},
{topic:"File & log integrity",q:"Why hash evidence files into a manifest at intake?",opts:["To compress files and speed storage access","To encrypt files ahead of legal review","To prove integrity — any change is detectable","To make the later parsing step more efficient"],ans:2,
why:["Hashing adds work; it compresses nothing.","A hash is not encryption.","The recorded hash turns tampering into a checkable claim.","Parsing efficiency is unrelated to hashing."],
ex:"A recorded hash turns 'this log might have been edited' into a checkable claim — the foundation of chain of custody. The api-gateway.log gap in this case shows exactly what you lose without it."}];

const QUIZH=[
{topic:"Volume vs content",q:"The capture for the 443 session has aged out, but the firewall log records bytes_out=2,247,463,936. What can you still prove?",opts:["The exact files that left the network","That nothing ever left the network","That the transfer used strong encryption","Volume and timing only, not content"],ans:3,
why:["File identity needs payload or the staged-image set.","The byte count proves something left.","A byte count says nothing about encryption.","Bytes prove scale, never substance."],
ex:"Bytes prove scale, not substance. Content claims require payload (capture) or the staged files' system image — this is the volume-vs-content distinction in one question."},
{topic:"Chain of custody",q:"Legal asks you to copy the evidence bundle to a USB stick. Correct handling?",opts:["Copy a hash-verified copy; log the hand-off","Copy the original files straight onto the stick","Email the bundle to legal as attachments","Delete the originals once copied across"],ans:0,
why:["Originals stay sealed; every transfer is hash-checked and recorded.","Originals never leave the sealed bundle.","Email breaks custody and integrity controls.","Destroying originals is evidence destruction."],
ex:"Originals stay sealed; every hand-off is hash-verified and logged. Breaking custody is how a good case dies in review."},
{topic:"Service accounts & HR",q:"HR asks: 'Which employee did this?' Evidence shows a stolen service-account token. Best answer?",opts:["Name the developer whose workstation held the stealer","Name the account, not a person; escalate first","Say nothing at all to HR representatives","Blame whoever last used the backup account"],ans:1,
why:["The workstation owner is a suspect, not a finding.","Service accounts have no single human; attribution goes through the case lead.","HR is a stakeholder; they get facts, not silence.","Last use is routine automation, not evidence of guilt."],
ex:"Service accounts have no single human. Jumping to the workstation owner assigns blame the evidence does not yet support — attribution goes through the stakeholders with authority to act on it."},
{topic:"Signature on a new host",q:"Thirty minutes ago SIG-7712 fired for FS-CORE-02 — a different host. Next move?",opts:["Ignore it until the first case is closed","Block every server at the network edge now","Open a second case; pull that host's records","Add the attacker IP to the blocklist again"],ans:2,
why:["A second host is new scope, not a queue item.","Containment without evidence misses the new host's story.","Same signature, new host: triage its firewall, API and OS logs first.","Already blocked; the host-side evidence is what matters now."],
ex:"Same signature, new host = new scope. Triage data sources first (firewall, API, OS logs for that host); containment follows evidence, not reflex."},
{topic:"False-positive tuning",q:"The SOC debates allowlisting the vulnerability scanner's IP in the IDS. Best practice?",opts:["Allowlist it globally and skip all paperwork","Never tune the IDS under any circumstances","Delete the scanner's past alerts from the logs","Suppress that IP's signatures, documented and reviewed"],ans:3,
why:["Undocumented allowlists hide real attacks.","Untuned noise buried the real alert for 95 minutes.","Never destroy records; tuning changes future alerting.","Known-good noise drops, the record stays, reviews catch drift."],
ex:"Tuning removes known-good noise while keeping the record; undocumented allowlists hide real attacks. The exam phrase is 'reduce false positives' without losing visibility."},
{topic:"Executive reporting",q:"The board asks: 'Did the attacker get our data?' Best-supported answer?",opts:["No — the block stopped the transfer in time","Partial: much staged data left; review is ongoing","Yes — everything the attacker touched was taken","Nothing can be known until the capture returns"],ans:1,
why:["74.9% left before the block.","Quantified from the firewall bytes and API rows, honest about unknowns.","Over-claims beyond the evidence.","Firewall, NetFlow and API rows already scope it."],
ex:"Precision with sources: each number cites a record (firewall bytes, API transaction rows). Over- or under-claiming both destroy trust in the investigation."},
{topic:"Order of volatility",q:"A VM is suspected compromised and still powered ON. Which acquisition sequence is correct?",opts:["Capture memory first, then snapshot disk state","Take the disk snapshot only and reboot after","Wipe and redeploy from a golden image","Copy just the log folder to a share"],ans:0,
why:["Volatility order: what dies first is captured first.","Rebooting destroys memory forever.","Destroys all evidence on the host.","Picks a sliver and mutates the crime scene."],
ex:"Order of volatility applies to VMs too: freeze and capture what dies first (memory, where the platform allows), then disk state; snapshots preserve disk but not hypervisor RAM."}];

const LOCKER_LOGS=["fw","app","edr","ossec","ids","palog"];
const LOCKER_SRC=["vuln","autorep","dash","pcap","apitr","siembench"];
const ARTIFACTS=["netflow","cctv","imaging","integrity","retention"];
const SIEMBENCH_NOTE="The SIEM is the correlation layer over every other source: its index below holds all 11 rows, and the query bench lives inside the Query objectives (and here as a free-play sandbox).";
