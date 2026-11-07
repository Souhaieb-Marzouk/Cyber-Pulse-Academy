/* CyberLab · Cloud+ CV0-004 · Lesson 1.3 — static port. Code split verbatim from the original single-file lab; behavior unchanged. */
"use strict";
/* Lab content: requirements doc, hosts, glossary, alerts, flow logs, quiz banks, schematic data, inspector keys, objective definitions */
/* ============================ DATA ============================ */

const REQ_DOC = `DEPLOYMENT ORDER NET-CHG-2411  (training data — synthetic)
Meridian Analytics · Hybrid cutover, NimbusCloud region us-central
===============================================================
1. VIRTUAL NETWORK (VPC-PROD)
   - VPC-PROD CIDR ............ 10.10.0.0/16
   - PUBLIC-WEB-A  10.10.1.0/24  AZ-1  PUBLIC
   - PUBLIC-WEB-B  10.10.2.0/24  AZ-2  PUBLIC
   - APP-A        10.10.11.0/24 AZ-1  PRIVATE
   - DB-A         10.10.21.0/24 AZ-1  ISOLATED
2. ROUTING
   - Attach INTERNET GATEWAY (IGW) to VPC-PROD
   - PUBLIC-RT:  0.0.0.0/0 -> IGW
   - APP-RT:     0.0.0.0/0 -> NAT-GW  (NAT-GW deployed in PUBLIC-WEB-A)
   - DB-RT:      local only  +  replication route (see 3)
   - Hybrid routes BOTH WAYS:
       HQ-EDGE (on-prem):  10.10.0.0/16 -> VPN
       APP-RT & DB-RT:     192.168.50.0/24 -> VGW
3. SITE-TO-SITE VPN (HQ-DC <-> VPC-PROD)
   - Customer gateway CGW: public IP 203.0.113.10 (HQ-EDGE)
   - Virtual private gateway VGW attached to VPC-PROD
   - Connection: IPsec site-to-site, IKEv2
   - Dynamic routing BGP, our ASN 65010
   - TWO tunnels required (A + B) for high availability
4. VPC PEERING
   - Peer VPC-PROD <-> VPC-STAGE (STAGE CIDR 10.20.0.0/16)
   - Add peer routes on BOTH route tables:
       APP-RT:   10.20.0.0/16 -> PEER
       STAGE-RT: 10.10.0.0/16 -> PEER
5. SECURITY (least privilege)
   - SG-WEB:  443/tcp from 0.0.0.0/0  (ONLY this rule)
   - SG-APP:  8443/tcp from SG-WEB, SG-APP, SG-STAGE
   - SG-DB:   5432/tcp from SG-APP  +  5432/tcp from 192.168.50.0/24
   - NACL-PUBLIC (web subnets):  IN allow 443 · OUT allow 1024-65535
   - NACL-APP (APP-A subnet):    IN allow 8443 · OUT allow 1024-65535
6. DNS (private hosted zone)
   - Zone meridian.internal associated with VPC-PROD
   - Record: db.meridian.internal  A -> 10.10.21.10
7. MONITORING
   - VPC flow logs: ON
   - VPN tunnel-state alarms: ON

All addresses are synthetic training ranges (RFC 5737 / RFC 1918).
NimbusCloud semantics are AWS-style and SIMPLIFIED for training.`;

const HOSTS = {
  "ITX-CLIENT": {ip:"192.0.2.55",  net:"INTERNET", label:"Internet client"},
  "CRM-ONPREM": {ip:"192.168.50.20", net:"HQDC", label:"CRM app server (HQ-DC)"},
  "LEGACY-DB":  {ip:"192.168.50.35", net:"HQDC", label:"Legacy DB (replication source)"},
  "PROD-WEB":   {ip:"10.10.1.10",  net:"PROD", subnet:"PUBLIC-WEB-A", sg:"SG-WEB",  label:"Web tier"},
  "PROD-APP":   {ip:"10.10.11.10", net:"PROD", subnet:"APP-A",      sg:"SG-APP",  label:"App tier"},
  "PROD-DB":    {ip:"10.10.21.10", net:"PROD", subnet:"DB-A",       sg:"SG-DB",   label:"Data tier"},
  "STAGE-APP":  {ip:"10.20.1.20",  net:"STAGE", subnet:"STAGE-A",   sg:"SG-STAGE",label:"Staging app"}
};
const SUBNET_OF_RT = {"PUBLIC-RT":["PUBLIC-WEB-A","PUBLIC-WEB-B"], "APP-RT":["APP-A"], "DB-RT":["DB-A"], "STAGE-RT":["STAGE-A"]};
const RT_OF_SUBNET = {"PUBLIC-WEB-A":"PUBLIC-RT","PUBLIC-WEB-B":"PUBLIC-RT","APP-A":"APP-RT","DB-A":"DB-RT","STAGE-A":"STAGE-RT"};

const GLOSSARY = [
  ["VPC / VNet","A logically isolated, customer-defined virtual network inside a cloud region."],
  ["CIDR block","IP range written as address/prefix; the prefix length fixes how many addresses exist (a /16 = 65,536 addresses)."],
  ["Subnet","A scoped range inside a VPC placed in one availability zone; public, private, or isolated."],
  ["Public subnet","Subnet whose route table sends 0.0.0.0/0 to an internet gateway."],
  ["Private subnet","Subnet with no direct inbound internet path; typically egresses through a NAT gateway."],
  ["Isolated subnet","Subnet with no internet egress at all — typical for data tiers."],
  ["Route table","Rule set mapping destination CIDRs to targets (IGW, NAT, VGW, peering, transit, local). Every subnet uses exactly one."],
  ["Internet gateway (IGW)","VPC-attached gateway enabling bidirectional internet traffic for public subnets."],
  ["NAT gateway","Managed egress-only gateway: private subnets can reach out, but the internet cannot reach in."],
  ["Virtual private gateway (VGW)","The cloud side of a site-to-site VPN, attached to the VPC."],
  ["Customer gateway (CGW)","The on-premises side of the VPN, identified by its public IP (and BGP ASN)."],
  ["IPsec / IKE","The encryption suite and key-exchange protocol that build site-to-site VPN tunnels (IKEv2 is current)."],
  ["BGP","Dynamic routing protocol that exchanges prefixes over the VPN and withdraws routes on failure so traffic fails over."],
  ["VPC peering","Direct private network path between two VPCs. NOT transitive: A-B and B-C does not connect A-C."],
  ["Transit gateway","Hub router connecting many VPCs and sites so spoke-to-spoke traffic can transit."],
  ["Security group","Stateful, instance-level firewall; rules reference CIDRs or other security groups, and return traffic is tracked automatically."],
  ["Network ACL (NACL)","Stateless, subnet-level rule list; return traffic must be allowed explicitly (ephemeral ports 1024-65535)."],
  ["Private hosted zone","DNS zone resolvable only from associated VPCs (split-horizon DNS) — internal names never leave the cloud."],
  ["Flow logs","Metadata records of accepted/rejected flows; the primary network detection data source."]
];

const ALERTS = [ /* display order deliberately non-alternating so positions never hint at the triage key */
  {id:"ALR-301", sev:"sev", text:"VPN Tunnel B (peer 203.0.113.19) reports status DOWN since 06:12.", real:true,  why:"A down tunnel kills redundancy — required fix (objective on tunnel failover)."},
  {id:"ALR-303", sev:"",    text:"TLS certificate for app.meridian.com expires in 12 days.", real:false, why:"PKI housekeeping on a public name — not a network connectivity fault."},
  {id:"ALR-302", sev:"sev", text:"PROD-DB unreachable from replication host HQ-DC (tcp/5432 timeout).", real:true, why:"Replication path broken — route/SG fault pair (objective H2)."},
  {id:"ALR-304", sev:"sev", text:"STAGE-APP -> PROD-APP transfers time out between VPCs.", real:true, why:"Inter-VPC path fault — peering routes/NACL (objective H3)."},
  {id:"ALR-305", sev:"",    text:"Storage bucket meridian-lake at 92% of quota.", real:false, why:"Capacity planning item — unrelated to the network outage."},
  {id:"ALR-307", sev:"",    text:"IAM role netops-bot policy modified by user j.okafor.", real:false, why:"Governance review item — real hygiene issue, but not the network incident. Worth its own ticket."},
  {id:"ALR-306", sev:"sev", text:"PROD-APP resolves db.meridian.internal to 10.10.21.99; DB connection fails.", real:true, why:"Name resolution fault — stale record (objective H8)."}
];

const FLOWLOGS_MED = [
  ["02:14:11","198.51.100.77","10.10.1.10","tcp/22","ACCEPT"],
  ["02:14:12","198.51.100.77","10.10.1.10","tcp/22","ACCEPT"],
  ["02:14:13","198.51.100.77","10.10.1.10","tcp/22","ACCEPT"],
  ["02:15:40","192.0.2.55","10.10.1.10","tcp/443","ACCEPT"],
  ["02:16:03","192.168.50.20","10.10.11.10","tcp/8443","ACCEPT"],
  ["02:16:58","10.20.1.20","10.10.1.10","tcp/443","REJECT"]
];

const FLOWLOGS_HARD = [
  ["06:11:02","10.20.1.20","10.10.11.10","tcp/8443","ACCEPT"],
  ["06:12:09","203.0.113.19","203.0.113.11","ipsec/500","EVENT Tunnel-B DOWN"],
  ["06:13:44","192.168.50.35","10.10.21.10","tcp/5432","REJECT"],
  ["06:13:45","192.168.50.35","10.10.21.10","tcp/5432","REJECT"],
  ["06:14:20","192.0.2.55","10.10.1.10","tcp/443","ACCEPT"],
  ["06:15:31","10.20.1.20","10.10.21.10","tcp/5432","REJECT"]
];

const MQUIZ = [ /* correct positions deliberately rotated; options length-balanced so nothing gives the answer away */
  {q:"PROD-APP (10.10.11.10) connects OUT to a patch server; the replies come back even though APP-RT has no special inbound rule. Why?",
   tag:"stateful vs stateless filtering",
   o:["The NACL passes ephemeral return ports both ways","The internet gateway rewrites the return path","Security groups are stateful and track reply traffic","BGP advertises a return route to the peer"],
   a:2, e:"Security groups are STATEFUL — they remember established flows, so replies flow without extra rules. Why the others fail: a NACL is stateless and would need explicit ephemeral-port rules in BOTH directions; the internet gateway does not rewrite return paths inside the VPC; BGP only exchanges prefixes and never carries reply traffic."},
  {q:"Two same-region VPCs need private routing between them. Which connectivity option fits best?",
   tag:"connectivity selection",
   o:["VPC peering","NAT gateway","Client VPN access","Publishing public IPs"],
   a:0, e:"Peering gives a private, direct path between two VPCs. NAT is egress-only, client VPN connects individual users, and publishing public IPs defeats private addressing and exposes the tier."},
  {q:"The design requires TWO tunnels on the site-to-site VPN. What is the primary reason?",
   tag:"VPN redundancy",
   o:["To double encryption strength","To double replication bandwidth","Providers mandate it for BGP","Redundancy if one tunnel fails"],
   a:3, e:"Dual tunnels are a high-availability design: maintenance or a line fault on one tunnel must not drop the site, and traffic shifts to the second. Encryption strength does not stack per tunnel, a second tunnel is failover — not a 2× bandwidth promise — and no provider forces BGP on you."},
  {q:"What is the purpose of the NAT gateway in PUBLIC-WEB-A?",
   tag:"egress-only NAT",
   o:["Publish internal servers inbound to the internet","Let private subnets reach the internet outbound","Resolve DNS names inside the VPC","Exchange VPN keys with the VGW"],
   a:1, e:"NAT is egress-only: private app servers can fetch patches, but no internet host can start a connection inbound to them. Inbound publishing is exactly what this design avoids, DNS resolution belongs to the private hosted zone, and VPN keys are negotiated by IKE between the gateways."},
  {q:"What actually builds the encrypted site-to-site tunnel?",
   tag:"IKE / IPsec",
   o:["BGP exchanging the route prefixes","ARP resolving the gateway peer","IKE negotiating IPsec security associations","VLAN tags on the edge routers"],
   a:2, e:"IKE (we use IKEv2) negotiates the IPsec security associations that actually encrypt the tunnel. BGP only exchanges routes across the built tunnel, ARP resolves layer-2 addresses, and VLAN tags are a switching concern."},
  {q:"How many /24 subnets fit into 10.10.0.0/16?",
   tag:"CIDR math",
   o:["16","128","4096","256"],
   a:3, e:"A /16 has 65,536 addresses, a /24 has 256 → 65,536 / 256 = 256 subnets. Prefix math: 24−16 = 8 bits → 2⁸ = 256."}
];

const HQUIZ = [ /* correct positions deliberately rotated; options length-balanced so nothing gives the answer away */
  {q:"Flow log: REJECT 10.20.1.20:51222 → 10.10.11.10:8443. SG-APP allows SG-STAGE on 8443; NACL-APP IN allows 8443; NACL-APP OUT allows only 443. What blocks the flow?",
   tag:"stateless NACL return path",
   o:["The security group inbound rule","NACL-APP OUT: the stateless reply path","The route table between the VPCs","DNS resolution inside the VPC"],
   a:1, e:"NACLs are stateless: the app's reply must leave through an OUT rule, and only 443 is allowed outbound — replies on the client's ephemeral port 51222 are dropped. The SG is stateful (replies are auto-allowed), the route delivered the packet fine, and DNS plays no role in an established flow."},
  {q:"HQ needs a consistent 10 Gbps, low-latency, private link into the cloud; VPN throughput is no longer enough. What do you recommend?",
   tag:"dedicated connectivity",
   o:["A second site-to-site VPN for more capacity","VPC peering between HQ and the VPC","Publishing the app through the internet gateway","A dedicated private circuit with VPN backup"],
   a:3, e:"Dedicated private circuits (Direct Connect/ExpressRoute style) deliver consistent bandwidth and lower latency that internet VPN cannot guarantee — and keeping the VPN as an encrypted backup preserves HA. A second VPN shares the same internet path, peering is VPC-to-VPC (not HQ), and public publishing is the opposite of private."},
  {q:"PROD↔STAGE and STAGE↔ANALYTICS are both peered. PROD cannot reach ANALYTICS. Why, and what is the scalable fix?",
   tag:"peering non-transitivity / transit gateway",
   o:["Peering is not transitive; use a transit hub","Routes are missing — just add one bigger route","Increase the CIDR size of every single VPC","Use a client VPN for every single instance"],
   a:0, e:"Peering connects exactly two VPCs and does not transit A→B→C, so PROD can never reach ANALYTICS through STAGE — a transit gateway is the hub built for many-to-many routing. No single route fixes a topology, CIDR size does not change reachability, and a per-host client VPN does not scale."},
  {q:"Why does the design prefer BGP over static routes for the VPN?",
   tag:"BGP failover",
   o:["BGP encrypts the tunnel payload","Static routes cost less per route","BGP withdraws routes on tunnel failure","BGP is strictly required for NAT"],
   a:2, e:"With BGP, prefixes are advertised per tunnel and withdrawn the moment a tunnel dies — traffic shifts to the healthy tunnel automatically. BGP never encrypts (IPsec does), per-route cost is irrelevant at this scale, and NAT works fine without BGP."},
  {q:"Why place db.meridian.internal in a PRIVATE hosted zone instead of a public one?",
   tag:"split-horizon DNS",
   o:["Private zones use lower TTL values","Internal names resolve only inside associated VPCs","VPN connections require private DNS zones","It is cheaper than a public zone"],
   a:1, e:"Split-horizon DNS: a private hosted zone is associated to VPCs only, so internal names and addresses never resolve from the internet. TTLs are unrelated, VPN does not require private zones, and cost is not the design driver here."},
  {q:"Why does SG-DB reference SG-APP instead of listing CIDR 10.10.11.0/24?",
   tag:"SG reference vs CIDR",
   o:["SG references are evaluated faster in practice","CIDR rules are forbidden in security groups","It satisfies the NACL control layer instead","The reference tracks the whole tier dynamically"],
   a:3, e:"Referencing SG-APP means 'anything in that tier, now and in the future' — no rule churn when instances are added, replaced or rescaled. Evaluation speed is not the point, CIDR rules ARE allowed, and NACLs are a separate subnet-layer control."},
  {q:"After NACL-APP was tightened to a single OUT rule (allow 443), web clients fail to reach the app on 8443. What is the fix?",
   tag:"stateless NACL repair",
   o:["Add an IN rule for 443","Enable BGP on the subnet","Allow the ephemeral range 1024-65535 outbound","Associate an internet gateway with APP-A"],
   a:2, e:"The clients' replies leave the app on their ephemeral source ports; a stateless NACL must explicitly allow 1024-65535 outbound or the return packets drop. An IN rule for 443 does not help return traffic, BGP is a routing protocol rather than a subnet filter, and an IGW changes the internet path — not peer replies."}
];

/* Board geometry: id, x, y, w, h, label */
const N = {
  INTERNET:{x:520,y:14,w:170,h:58,label:"INTERNET",tag:"PUBLIC NETWORK"},
  HQEDGE:{x:36,y:118,w:158,h:66,label:"HQ-EDGE",tag:"ON-PREM EDGE ROUTER"},
  CRM:{x:36,y:236,w:158,h:54,label:"CRM-ONPREM",tag:"192.168.50.20"},
  LDB:{x:36,y:308,w:158,h:54,label:"LEGACY-DB",tag:"192.168.50.35"},
  CGW:{x:238,y:126,w:118,h:56,label:"CGW",tag:"CUSTOMER GATEWAY"},
  VPN:{x:378,y:118,w:126,h:72,label:"VPN-CONN",tag:"SITE-TO-SITE"},
  VGW:{x:526,y:126,w:118,h:56,label:"VGW",tag:"VIRTUAL PRIVATE GW"},
  IGW:{x:700,y:96,w:130,h:50,label:"IGW",tag:"INTERNET GATEWAY"},
  VPC:{x:614,y:170,w:556,h:428,label:"VPC-PROD",tag:"VIRTUAL PRIVATE CLOUD"},
  SUB_WA:{x:630,y:220,w:150,h:64,label:"PUBLIC-WEB-A",tag:"subnet"},
  SUB_WB:{x:630,y:300,w:150,h:64,label:"PUBLIC-WEB-B",tag:"subnet"},
  SUB_APP:{x:630,y:380,w:150,h:64,label:"APP-A",tag:"subnet"},
  SUB_DB:{x:630,y:460,w:150,h:64,label:"DB-A",tag:"subnet"},
  NAT:{x:796,y:300,w:130,h:56,label:"NAT-GW",tag:"EGRESS ONLY"},
  DNS:{x:796,y:380,w:130,h:64,label:"DNS-ZONE",tag:"PRIVATE ZONE"},
  MON:{x:796,y:460,w:130,h:64,label:"MONITOR",tag:"OBSERVABILITY"},
  RT_PUB:{x:942,y:220,w:158,h:56,label:"PUBLIC-RT",tag:"route table"},
  RT_APP:{x:942,y:300,w:158,h:56,label:"APP-RT",tag:"route table"},
  RT_DB:{x:942,y:380,w:158,h:56,label:"DB-RT",tag:"route table"},
  SG_WEB:{x:630,y:542,w:150,h:50,label:"SG-WEB",tag:"stateful"},
  SG_APP:{x:796,y:542,w:130,h:50,label:"SG-APP",tag:"stateful"},
  SG_DB:{x:942,y:542,w:158,h:50,label:"SG-DB",tag:"stateful"},
  STAGE:{x:614,y:620,w:470,h:130,label:"VPC-STAGE",tag:"10.20.0.0/16"},
  SUB_STAGE:{x:630,y:650,w:140,h:62,label:"STAGE-A",tag:"subnet"},
  PEER:{x:784,y:650,w:126,h:62,label:"PEERING",tag:"PROD<->STAGE"},
  RT_STAGE:{x:922,y:650,w:146,h:62,label:"STAGE-RT",tag:"route table"},
  NACL_P:{x:1090,y:618,w:112,h:50,label:"NACL-PUB",tag:"stateless"},
  NACL_A:{x:1090,y:678,w:112,h:50,label:"NACL-APP",tag:"stateless"}
};
const REGION = {x:600,y:70,w:610,h:690};
const NODE_KIND = {
  INTERNET:"internet", HQEDGE:"edge", CRM:"host", LDB:"host", CGW:"cgw", VPN:"vpn", VGW:"vgw",
  IGW:"info", VPC:"vpc", SUB_WA:"subnet", SUB_WB:"subnet", SUB_APP:"subnet", SUB_DB:"subnet",
  NAT:"nat", DNS:"dns", MON:"monitor", RT_PUB:"rt", RT_APP:"rt", RT_DB:"rt",
  SG_WEB:"sg", SG_APP:"sg", SG_DB:"sg", STAGE:"info", SUB_STAGE:"info", PEER:"peer",
  RT_STAGE:"rt", NACL_P:"nacl", NACL_A:"nacl"
};

const SUBNET_KEY = {"SUB_WA":"PUBLIC-WEB-A","SUB_WB":"PUBLIC-WEB-B","SUB_APP":"APP-A","SUB_DB":"DB-A"};
const RT_KEY = {"RT_PUB":"PUBLIC-RT","RT_APP":"APP-RT","RT_DB":"DB-RT","RT_STAGE":"STAGE-RT"};
const SG_KEY = {"SG_WEB":"SG-WEB","SG_APP":"SG-APP","SG_DB":"SG-DB"};
const NACL_KEY = {"NACL_P":"NACL-PUBLIC","NACL_A":"NACL-APP"};

const BLURB = {
  vpc:"A VPC is your private slice of the cloud: one CIDR block that all its subnets carve up.",
  subnet:"A subnet is a scoped range inside the VPC, pinned to one availability zone. Public = route to IGW; private = NAT egress only; isolated = no internet at all.",
  rt:"Route tables decide where packets go next. Every subnet uses exactly one; routes are (destination CIDR → target) pairs.",
  sg:"Security groups are STATEFUL instance firewalls: return traffic is automatic, and rules can reference other security groups.",
  nacl:"Network ACLs are STATELESS subnet firewalls: you must explicitly allow the return traffic (ephemeral ports 1024-65535).",
  vpn:"A site-to-site VPN encrypts traffic between two networks over the internet: IKE builds the tunnel (SA), IPsec encrypts, BGP or static routes steer it.",
  peer:"VPC peering is a direct private path between exactly two VPCs. It is not transitive, and both sides need routes.",
  dns:"A private hosted zone resolves internal names only for associated VPCs — split-horizon DNS keeps topology hidden.",
  monitor:"Observability is your detection layer: flow logs record accepted/rejected flows; tunnel alarms watch VPN health.",
  nat:"A NAT gateway gives private subnets outbound-only internet access: patches out, attackers not in.",
  cgw:"The customer gateway represents the on-premises VPN device by its public IP (and BGP ASN).",
  vgw:"The virtual private gateway is the cloud-side termination of the site-to-site VPN, attached to your VPC.",
  edge:"The on-prem edge router also needs a route to the cloud CIDRs — routing must exist in BOTH directions.",
  info:"", host:"", internet:""
};
const TARGET_OPTS = ["IGW","NAT-GW","VGW","PEER","VPN","NAT-GW-STAGE"];

const CONNECT_OPTS = [["","— choose —"],["S2S","Site-to-site VPN"],["RA","Remote-access VPN"],["PEER","VPC peering"],["DX","Dedicated private connection"]];

const OBJ_M = [
 {id:"M1", pillar:"P1", title:"Classify the four connectivity designs",
  brief:"Before touching the board, prove you can tell the four hybrid-connectivity options apart. Assign each statement its design.",
  look:"Use the selector under each card below.",
  hints:["Ask: who or what is connecting? A whole site → VPN; two VPCs → peering; a single user → remote access.",
         "Site-to-site connects networks; remote-access connects people; peering connects VPCs; dedicated connects when bandwidth/latency SLAs exceed VPN.",
         "Answers in order: Remote-access VPN · Site-to-site VPN · VPC peering · Dedicated private connection."],
  widget:{html(){ const ans=(S.objs.M1&&S.objs.M1.ans)||{}; const lock=S.objs.M1&&S.objs.M1.done;
      return [0,1,2,3].map(i=>{
      const stmts=["HR staff connect securely to HQ systems from home laptops.","HQ-DC and the cloud exchange all inter-site traffic over an encrypted IPsec tunnel.","VPC-PROD and VPC-STAGE need private, direct routing between them.","The factory floor needs a consistent 10 Gbps private link — beyond what VPN can guarantee."];
      return `<div style="border-bottom:1px dashed rgba(22,50,79,.3);padding:7px 0"><p class="hinttext" style="margin:0 0 4px">${stmts[i]}</p>
        <select class="m1sel" data-i="${i}" ${lock?"disabled":""} aria-label="connectivity design ${i+1}">${CONNECT_OPTS.map(o=>`<option value="${o[0]}" ${ans["c"+i]===o[0]?"selected":""}>${o[1]}</option>`).join("")}</select></div>`;
    }).join(""); },
   bind(){ document.querySelectorAll(".m1sel").forEach(el=>el.addEventListener("change",()=>{
      const st=S.objs.M1||(S.objs.M1={ans:{}}); st.ans=st.ans||{}; st.ans["c"+el.dataset.i]=el.value; save(); })); }},
  validate(){ const a=(S.objs.M1&&S.objs.M1.ans)||{}; const want={c0:"RA",c1:"S2S",c2:"PEER",c3:"DX"};
    const bad=Object.keys(want).filter(k=>a[k]!==want[k]);
    return bad.length? {pass:false,msg:`${bad.length} of 4 cards are misassigned. Think about WHO connects (a person? a site? two VPCs?) and WHY (privacy vs guaranteed bandwidth).`}
      : {pass:true,msg:"All four classified correctly. Site-to-site VPN links networks, remote-access VPN links people, peering links two VPCs privately, and a dedicated connection delivers guaranteed bandwidth that VPN over the internet cannot. On the exam, expect exactly this discrimination task."}; } },
 {id:"M2", pillar:"P1", title:"Carve the VPC: set CIDR 10.10.0.0/16",
  brief:"Every design starts with the address plan. Set VPC-PROD's CIDR block exactly as approved in NET-CHG-2411 §1.",
  look:"Select the VPC-PROD frame on the board, then set its CIDR.",
  hints:["The VPC frame is the large box labelled VPC-PROD inside the NimbusCloud region.",
         "The inspector has a 'VPC CIDR block' field once you select VPC-PROD.",
         "Type exactly 10.10.0.0/16 (STAGE already uses 10.20.0.0/16, so these never overlap)."],
  validate(){ return norm(S.world.vpc.cidr)==="10.10.0.0/16"
    ? {pass:true,msg:"10.10.0.0/16 gives 65,536 addresses — room for every tier plus growth, and it cannot collide with STAGE's 10.20.0.0/16. Overlapping CIDRs are the #1 reason peering and VPN routing silently fail."}
    : {pass:false,msg:`VPC-PROD CIDR is '${S.world.vpc.cidr||"unset"}'. The approved plan is 10.10.0.0/16 (NET-CHG-2411 §1).`}; } },
 {id:"M3", pillar:"P1", title:"Build the four subnets on the plan",
  brief:"Carve the /16 into public, private and isolated subnets across two AZs per NET-CHG-2411 §1 — this is the segmentation your security later depends on.",
  look:"Select each subnet card on the board (dashed = not configured).",
  hints:["PUBLIC-WEB-A/B get /24s in .1 and .2; APP-A uses .11; DB-A uses .21 of the third octet.",
         "AZ-2 is only used by PUBLIC-WEB-B — that is your multi-AZ web tier.",
         "Expected: 10.10.1.0/24 AZ-1 public · 10.10.2.0/24 AZ-2 public · 10.10.11.0/24 AZ-1 private · 10.10.21.0/24 AZ-1 isolated."],
  validate(){ const s=S.world.subnets; const want={
      "PUBLIC-WEB-A":["10.10.1.0/24","az-1","public"], "PUBLIC-WEB-B":["10.10.2.0/24","az-2","public"],
      "APP-A":["10.10.11.0/24","az-1","private"], "DB-A":["10.10.21.0/24","az-1","isolated"]};
    const bad=Object.keys(want).filter(k=>!(norm(s[k].cidr)===want[k][0]&&norm(s[k].az)===want[k][1]&&norm(s[k].type)===want[k][2]));
    return bad.length? {pass:false,msg:`Not on plan yet: ${bad.join(", ")}. Each subnet needs CIDR + AZ + type exactly per §1.`}
      : {pass:true,msg:"Web tier spans two AZs (resilience), app tier is private (NAT egress only), data tier is isolated (no internet path at all). This tiered segmentation is the pattern Cloud+ expects you to design — and what your security groups will enforce next."}; } },
 {id:"M4", pillar:"P1", title:"Wire the gateways and default routes",
  brief:"Attach the IGW, deploy the NAT gateway in PUBLIC-WEB-A, and add the default routes: PUBLIC-RT → IGW, APP-RT → NAT. DB-RT stays local-only.",
  look:"VPC-PROD (attach IGW) · NAT-GW node (deploy) · PUBLIC-RT and APP-RT nodes (routes).",
  hints:["Attach the IGW first — a route to IGW is useless while no IGW is attached.",
         "The NAT gateway must sit in a PUBLIC subnet (PUBLIC-WEB-A) to have an internet path.",
         "Routes: PUBLIC-RT add 0.0.0.0/0 → IGW; APP-RT add 0.0.0.0/0 → NAT-GW. Add nothing to DB-RT."],
  validate(){ const w=S.world; const miss=[];
    if(!w.vpc.igw) miss.push("IGW not attached to VPC-PROD");
    if(!rtHasRoute("PUBLIC-RT","0.0.0.0/0","IGW")) miss.push("PUBLIC-RT lacks 0.0.0.0/0 → IGW");
    if(!w.nat.deployed) miss.push("NAT gateway not deployed");
    if(w.nat.subnet!=="PUBLIC-WEB-A") miss.push("NAT gateway must live in PUBLIC-WEB-A (a public subnet)");
    if(!rtHasRoute("APP-RT","0.0.0.0/0","NAT-GW")) miss.push("APP-RT lacks 0.0.0.0/0 → NAT-GW");
    return miss.length? {pass:false,msg:miss.join(" · ")}
      : {pass:true,msg:"Egress design complete: internet replies exit via IGW, private app servers patch through NAT, and DB-A has no internet path at all. Inbound-publish vs egress-only is a classic exam discriminator — NAT never lets the internet start a connection."}; } },
 {id:"M5", pillar:"P1", title:"Deploy the site-to-site VPN (CGW, VGW, IKEv2)",
  brief:"Bring HQ-DC into the cloud: configure the customer gateway with HQ-EDGE's public IP, attach the VGW to VPC-PROD, create the IPsec connection with IKEv2.",
  look:"CGW node (IP) · VGW node (attach) · VPN-CONN node (create).",
  hints:["Order matters: CGW IP → VGW attach → create the connection.",
         "HQ-EDGE's synthetic public IP is 203.0.113.10 (per §3 of the order).",
         "On the create form: IKEv2, routing can stay STATIC for now (M6 upgrades it to BGP)."],
  validate(){ const w=S.world; const miss=[];
    if(norm(w.cgw.ip)!=="203.0.113.10") miss.push("CGW public IP must be 203.0.113.10");
    if(!w.vgw.attached) miss.push("VGW not attached to VPC-PROD");
    if(!w.vpn.exists) miss.push("VPN connection not created");
    if(w.vpn.exists && norm(w.vpn.ike)!=="ikev2") miss.push("IKE must be IKEv2");
    if(w.vpn.exists && w.vpn.tunnelA!=="UP") miss.push("Tunnel A must be UP");
    return miss.length? {pass:false,msg:miss.join(" · ")}
      : {pass:true,msg:"Tunnel A is up. IKEv2 negotiated the IPsec security associations that encrypt everything between HQ-EDGE and the VGW — BGP and routes just steer traffic through it. Note the CGW/VGW pair: one object per side of the tunnel, a favourite exam question."}; } },
 {id:"M6", pillar:"P4", title:"Make the VPN resilient: BGP + second tunnel",
  brief:"A single tunnel is a single point of failure. Upgrade to BGP with ASN 65010 and bring Tunnel B up — the approved HA design (§3).",
  look:"VPN-CONN node: routing, ASN, tunnel states.",
  hints:["Set routing to BGP; the ASN field becomes relevant (65010).",
         "Tunnel B currently reads DISABLED — switch its state to UP.",
         "BGP withdraws routes if a tunnel dies, so traffic shifts to the healthy tunnel automatically."],
  validate(){ const v=S.world.vpn; const miss=[];
    if(norm(v.routing)!=="bgp") miss.push("routing must be BGP");
    if(norm(v.asn)!=="65010") miss.push("BGP ASN must be 65010");
    if(v.tunnelB!=="UP") miss.push("Tunnel B must be UP");
    return miss.length? {pass:false,msg:miss.join(" · ")}
      : {pass:true,msg:"Redundancy in place: two tunnels, dynamic routing. If one tunnel flaps, BGP withdraws its prefixes and traffic fails over — no manual route surgery at 3 a.m. This is the mitigation side of the lesson: HA is a design choice you apply, not a feature you hope for."}; } },
 {id:"M7", pillar:"P2", title:"Establish PROD↔STAGE peering end-to-end",
  brief:"Request the peering, accept it, then add the peer routes on BOTH route tables (APP-RT: 10.20.0.0/16 → PEER; STAGE-RT: 10.10.0.0/16 → PEER).",
  look:"PEERING node (request/accept) · APP-RT and STAGE-RT nodes (routes).",
  hints:["Peering has two phases: request, then accept — both buttons on the PEERING node.",
         "A accepted peering with no routes still blackholes traffic; routes must be added manually on both sides.",
         "APP-RT: destination 10.20.0.0/16 target PEER. STAGE-RT: destination 10.10.0.0/16 target PEER."],
  validate(){ const p=S.world.peer; const miss=[];
    if(!p.requested) miss.push("peering not requested");
    if(!p.accepted) miss.push("peering not accepted");
    if(!rtHasRoute("APP-RT","10.20.0.0/16","PEER")) miss.push("APP-RT lacks 10.20.0.0/16 → PEER");
    if(!rtHasRoute("STAGE-RT","10.10.0.0/16","PEER")) miss.push("STAGE-RT lacks 10.10.0.0/16 → PEER");
    return miss.length? {pass:false,msg:miss.join(" · ")}
      : {pass:true,msg:"Peering is fully operational. You just proved its two classic gotchas: acceptance alone routes nothing, and peering is NOT transitive — if a third VPC joins, PROD still cannot reach it through STAGE. That is exactly why transit gateways exist."}; } },
 {id:"M8", pillar:"P4", title:"Harden: SG rules + stateless NACLs",
  brief:"Apply NET-CHG-2411 §5: least-privilege security groups, and NACL rules that allow requests IN and the ephemeral return ports OUT (1024-65535).",
  look:"SG-WEB / SG-APP / SG-DB nodes · NACL-PUBLIC / NACL-APP nodes.",
  hints:["SG-DB must accept 5432 from SG-APP AND from 192.168.50.0/24 (the on-prem replication host).",
         "NACLs are stateless: each direction needs its own rule — IN 443/8443, OUT 1024-65535.",
         "SG-WEB must contain ONLY 443 from 0.0.0.0/0 — no SSH, no RDP."],
  validate(){ const miss=[];
    if(!sgRulesEq("SG-WEB",[["443","0.0.0.0/0"]])) miss.push("SG-WEB must be exactly: 443 from 0.0.0.0/0");
    if(!sgRulesEq("SG-APP",[["8443","SG-WEB"],["8443","SG-APP"],["8443","SG-STAGE"]])) miss.push("SG-APP must be exactly: 8443 from SG-WEB, SG-APP, SG-STAGE");
    if(!sgRulesEq("SG-DB",[["5432","SG-APP"],["5432","192.168.50.0/24"]])) miss.push("SG-DB must be exactly: 5432 from SG-APP + 5432 from 192.168.50.0/24");
    if(!naclHas("NACL-PUBLIC","in","ALLOW","443")) miss.push("NACL-PUBLIC IN allow 443");
    if(!naclHas("NACL-PUBLIC","out","ALLOW","1024-65535")) miss.push("NACL-PUBLIC OUT allow 1024-65535");
    if(!naclHas("NACL-APP","in","ALLOW","8443")) miss.push("NACL-APP IN allow 8443");
    if(!naclHas("NACL-APP","out","ALLOW","1024-65535")) miss.push("NACL-APP OUT allow 1024-65535");
    return miss.length? {pass:false,msg:miss.join(" · ")}
      : {pass:true,msg:"Least privilege applied. SGs are stateful (one rule per direction of the request), NACLs are stateless (return traffic needs the ephemeral range). The SG-reference rules mean 'whatever is in that tier' — they keep working as instances scale. If your Traffic Lab tests fail below, suspect a missing OUT rule first."}; } },
 {id:"M9", pillar:"P2", title:"Verify the three designed flows in the Traffic Lab",
  brief:"The board is configured — now prove it. In the Traffic Lab (tray), run: internet→PROD-WEB:443 · LEGACY-DB→PROD-DB:5432 (replication over the VPN) · STAGE-APP→PROD-APP:8443 (peering).",
  look:"Tray → Traffic Lab. Quick-run buttons are provided.",
  hints:["If a flow fails, read the FIRST failing hop — it names the exact missing rule or route.",
         "Replication needs the hybrid routes in BOTH directions (§2): HQ-EDGE → 10.10.0.0/16, and DB-RT → 192.168.50.0/24 via VGW.",
         "The check below re-runs all three flows against the live board."],
  validate(){ const flows=[["ITX-CLIENT","PROD-WEB",443],["LEGACY-DB","PROD-DB",5432],["STAGE-APP","PROD-APP",8443]];
    const fails=flows.map(f=>({f,r:simulate(...f)})).filter(x=>!x.r.ok);
    return fails.length? {pass:false,msg:`${3-fails.length}/3 flows pass. First failure: ${fails[0].f[0]} → ${fails[0].f[1]}:${fails[0].f[2]} — ${fails[0].r.hops.find(h=>!h.ok).note}. Open the Traffic Lab to trace it.`}
      : {pass:true,msg:"All three designed flows pass hop-by-hop. You just executed the defender's core verification loop: design → deploy → TRACE. The same hop model (edge route → tunnel → route table → NACL → SG) is how you will troubleshoot real outages in seconds. And note what does NOT pass by design: the CRM host has no rule in SG-APP — least privilege means flows you never approved stay blocked."}; } },
 {id:"M10", pillar:"P3", title:"Turn on the detection layer",
  brief:"Configuration without observability is invisible. Enable VPC flow logs and VPN tunnel-state alarms (§7).",
  look:"MONITOR node on the board.",
  hints:["The MONITOR node sits in the right column of the region, below DNS-ZONE.",
         "Two buttons, two toggles — both must read ON.",
         "Flow logs are the data source for objective M12 — and for real REJECT investigations."],
  validate(){ const m=S.world.monitor;
    return (m.flowLogs&&m.vpnAlarms)? {pass:true,msg:"Detection layer armed. Flow logs give you the who-talked-to-whom record (including REJECTs); tunnel alarms catch a dead tunnel before users do. Cloud+ 6.x assumes you know which data source answers which question."}
      : {pass:false,msg:`flow logs: ${m.flowLogs?"ON":"OFF"} · tunnel alarms: ${m.vpnAlarms?"ON":"OFF"}. Both are required (§7).`}; } },
 {id:"M11", pillar:"P1", title:"Deploy split-horizon DNS for the data tier",
  brief:"Create the private hosted zone meridian.internal, associate it with VPC-PROD, and add record db → 10.10.21.10 (§6). Then test resolution.",
  look:"DNS-ZONE node on the board (create zone, associate, add record, test).",
  hints:["Zone name must be exactly meridian.internal; association is a separate button.",
         "Record name is 'db' (zone appends the rest), type A, value 10.10.21.10.",
         "Press 'Test resolution' — the traffic sim verifies the full chain."],
  validate(){ const d=S.world.dns;
    const rec=d.records.find(r=>norm(r.name)==="db");
    const recOk=rec&&norm(rec.ip)==="10.10.21.10";
    const simOk=dnsSim("PROD-APP").ok;
    const miss=[];
    if(norm(d.zone)!=="meridian.internal") miss.push("zone must be meridian.internal");
    if(!d.assoc) miss.push("zone not associated with VPC-PROD");
    if(!recOk) miss.push("record db must resolve to 10.10.21.10");
    if(!simOk) miss.push("resolution test fails");
    return miss.length? {pass:false,msg:miss.join(" · ")}
      : {pass:true,msg:"Internal names now resolve only inside the VPC — the address plan never leaks to public DNS. Why a PRIVATE zone? Because a public record for db.meridian.internal would advertise your data tier's address to anyone. Split-horizon DNS is both an operational and a security control."}; } },
 {id:"M12", pillar:"P3", title:"Read the flow logs like an analyst",
  brief:"Open the Flow Logs tab (tray) — a historical export captured before hardening. One line shows traffic that should never have succeeded. Identify it and the right action.",
  look:"Tray → Flow Logs, then answer below.",
  hints:["Look for ACCEPT lines where the port is not one of your approved service ports.",
         "An external IP reaching tcp/22 on the web tier is remote management exposed to the internet.",
         "The fix is removing the tcp/22 rule from SG-WEB — least privilege, not shutting the IGW."],
  widget:{html(){ const a=(S.objs.M12&&S.objs.M12.ans); const lock=S.objs.M12&&S.objs.M12.done;
      const opts=["The REJECT on tcp/443 proves NACL-PUBLIC is broken — add an allow rule","CRM-ONPREM reaching PROD-APP looks abnormal — tear down the whole site-to-site VPN tunnel","Internet host 198.51.100.77 opened SSH (tcp/22) on the web tier — remove it","ACCEPT on tcp/443 means over-exposure — close the IGW for the web tier"];
      return `<div class="optlist" role="radiogroup" aria-label="finding">${opts.map((o,i)=>`<label class="opt"><input type="radio" name="m12a" value="${i}" ${a===i?"checked":""} ${lock?"disabled":""}> <span>${o}</span></label>`).join("")}</div>`; },
   bind(){ document.querySelectorAll('input[name="m12a"]').forEach(el=>el.addEventListener("change",()=>{ const st=S.objs.M12||(S.objs.M12={}); st.ans=+el.value; save(); })); }},
  validate(){ return (S.objs.M12&&S.objs.M12.ans)===2
    ? {pass:true,msg:"Correct. Three ACCEPTs on tcp/22 from one external address = an SSH service open to the world — the requirements say SG-WEB must expose ONLY 443. The tcp/443 REJECT line is the controls WORKING, and CRM→PROD-APP is the approved replication path. Reading flow logs as signal-vs-noise is the detection half of this lesson."}
    : {pass:false,msg:"Re-read the table: which line shows something SUCCEEDING that the hardened design forbids? Rejects are usually good news."}; } }
];

const OBJ_H = [
 {id:"H1", pillar:"P2", title:"Triage the Alert Board: faults vs noise",
  brief:"07:00 — three teams are paged. Open the Alert Board (tray) and classify every alert: network fault to fix in this incident, or unrelated noise for another queue.",
  look:"Tray → Alert Board.",
  nudge:"Four alerts describe the broken connectivity; three are real but off-topic problems (PKI, storage, IAM governance).",
  validate(){ const a=(S.objs.H1&&S.objs.H1.ans)||{}; const real=["ALR-301","ALR-302","ALR-304","ALR-306"];
    const miss=[];
    real.forEach(id=>{ if(a[id]!=="fault") miss.push(id+" is a real fault"); });
    ["ALR-303","ALR-305","ALR-307"].forEach(id=>{ if(a[id]!=="noise") miss.push(id+" is not part of the network incident"); });
    return miss.length? {pass:false,msg:`${miss.length} misclassified: ${miss.join("; ")}.`}
      : {pass:true,msg:"Clean triage. ALR-301/302/304/306 are the connectivity incident (tunnel, replication, peering, DNS); the certificate expiry, bucket quota and IAM change are real but belong to other queues — a good responder separates incidents instead of chasing everything. Now fix the four."}; } },
 {id:"H2", pillar:"P3", title:"Restore on-prem → PROD-DB replication (5432)",
  brief:"ALR-302: LEGACY-DB (192.168.50.35) cannot reach PROD-DB on 5432. Diagnose with the Traffic Lab, fix the board (route + security group per NET-CHG-2411 §2/§5), and make the flow pass.",
  look:"Traffic Lab: LEGACY-DB → PROD-DB, port 5432.",
  nudge:"DB-RT is missing the route back to HQ AND SG-DB's source is a stale staging CIDR instead of 192.168.50.0/24 (+ SG-APP).",
  validate(){ const r=simulate("LEGACY-DB","PROD-DB",5432); const miss=[];
    if(!rtHasRoute("DB-RT","192.168.50.0/24","VGW")) miss.push("DB-RT lacks 192.168.50.0/24 → VGW");
    if(!sgHas("SG-DB","5432","192.168.50.0/24")) miss.push("SG-DB lacks 5432 from 192.168.50.0/24");
    if(!sgHas("SG-DB","5432","SG-APP")) miss.push("SG-DB lacks 5432 from SG-APP");
    if(sgHas("SG-DB","5432","10.20.0.0/16")) miss.push("SG-DB still has the stale 10.20.0.0/16 rule — remove it");
    if(!r.ok) miss.push("flow still fails: "+(r.hops.find(h=>!h.ok)||{}).note);
    return miss.length? {pass:false,msg:miss.join(" · ")}
      : {pass:true,msg:"Replication restored. Two faults cooperated: a missing return route (network-layer blackhole) and a wrong SG source (stale CIDR from staging). The Traffic Lab localized each in one hop — exactly how you should name the failing control in an incident report."}; } },
 {id:"H3", pillar:"P2", title:"Repair STAGE↔PROD transfer path",
  brief:"ALR-304: STAGE-APP → PROD-APP:8443 times out. Peering is already accepted — find what routing/stateless-NACL detail is missing and make the flow pass.",
  look:"Traffic Lab: STAGE-APP → PROD-APP, port 8443.",
  nudge:"STAGE-RT has no route to the PROD CIDR, and NACL-APP has no OUT rule for the ephemeral return range.",
  validate(){ const r=simulate("STAGE-APP","PROD-APP",8443); const miss=[];
    if(!rtHasRoute("STAGE-RT","10.10.0.0/16","PEER")) miss.push("STAGE-RT lacks 10.10.0.0/16 → PEER");
    if(!naclHas("NACL-APP","out","ALLOW","1024-65535")) miss.push("NACL-APP OUT lacks allow 1024-65535");
    if(!r.ok) miss.push("flow still fails: "+(r.hops.find(h=>!h.ok)||{}).note);
    return miss.length? {pass:false,msg:miss.join(" · ")}
      : {pass:true,msg:"Transfers restored. You repaired the two failure modes peering and stateless filtering produce: a one-sided route table (request leaves, nothing answers) and a NACL that ate the return traffic. Symptom 'timeout' + hop trace = precise diagnosis."}; } },
 {id:"H4", pillar:"P4", title:"Recover VPN redundancy (Tunnel B + BGP)",
  brief:"ALR-301: Tunnel B has been DOWN/disabled since 06:12 — and the connection still runs static routes. Restore the approved HA design (BGP, ASN 65010, both tunnels UP) and prove HQ replication traffic passes.",
  look:"VPN-CONN node.",
  nudge:"Enable Tunnel B, switch routing to BGP with ASN 65010, then re-run LEGACY-DB → PROD-DB:5432 in the Traffic Lab.",
  validate(){ const v=S.world.vpn; const r=simulate("LEGACY-DB","PROD-DB",5432); const miss=[];
    if(v.tunnelB!=="UP") miss.push("Tunnel B must be UP");
    if(norm(v.routing)!=="bgp") miss.push("routing must be BGP");
    if(norm(v.asn)!=="65010") miss.push("BGP ASN must be 65010");
    if(!r.ok) miss.push("replication flow fails: "+(r.hops.find(h=>!h.ok)||{}).note);
    return miss.length? {pass:false,msg:miss.join(" · ")}
      : {pass:true,msg:"HA restored. Until you fixed it, the site rode a single tunnel: any maintenance window or line fault would cut HQ off. With BGP over two tunnels, prefixes advertise per tunnel and fail over automatically — resilience you configured, not luck."}; } },
 {id:"H5", pillar:"P4", title:"Close the public-exposure gap on SG-WEB",
  brief:"NET-CHG-2411 §5 says SG-WEB exposes 443 ONLY — but someone left management ports open to the internet. Fix SG-WEB to the exact approved rule set.",
  look:"SG-WEB node.",
  nudge:"Delete the tcp/22 and tcp/3389 rules; keep exactly one rule: 443 from 0.0.0.0/0.",
  validate(){ return sgRulesEq("SG-WEB",[["443","0.0.0.0/0"]])
    ? {pass:true,msg:"Web tier now answers only on 443. Open management ports (SSH/RDP from 0.0.0.0/0) are the most common cloud finding in real audits — the flow logs in H6 are how you'd catch it in production."}
    : {pass:false,msg:`SG-WEB currently: ${S.world.sg["SG-WEB"].rules.map(r=>r.port+" from "+r.src).join(" · ")||"(empty)"}. Required: exactly 443 from 0.0.0.0/0.`}; } },
 {id:"H6", pillar:"P3", title:"Attribute the REJECT: which TWO controls?",
  brief:"Read the current flow-log export (tray → Flow Logs): replication host 192.168.50.35 is REJECTED on 5432. Select the two controls contributing to the block.",
  look:"Tray → Flow Logs, then answer below.",
  nudge:"One control is a route table, the other a security group — the NACL, DNS and IGW are red herrings here.",
  widget:{html(){ const a=(S.objs.H6&&S.objs.H6.ans)||[]; const lock=S.objs.H6&&S.objs.H6.done;
      const opts=[["rt","Route table — DB-RT has no return path"],["sg","Security group — SG-DB source CIDR is stale"],["nacl","NACL-APP — stateless filter on the wrong subnet"],["dns","DNS private zone — internal name mapping service"],["igw","Internet gateway — edge of the public path"]];
      return `<div class="optlist" role="group" aria-label="controls">${opts.map(o=>`<label class="opt"><input type="checkbox" value="${o[0]}" ${a.includes(o[0])?"checked":""} ${lock?"disabled":""}> <span>${o[1]}</span></label>`).join("")}</div>`; },
   bind(){ document.querySelectorAll('.task input[type="checkbox"][value]').forEach(el=>{ if(!el.closest(".task")) return;
      el.addEventListener("change",()=>{ const st=S.objs.H6||(S.objs.H6={ans:[]});
        if(!Array.isArray(st.ans)) st.ans = [];
        const v=el.value; const i=st.ans.indexOf(v);
        if(el.checked && i<0) st.ans.push(v); if(!el.checked && i>=0) st.ans.splice(i,1);
        st.ans.sort(); save(); }); }); }},
  validate(){ const a=(S.objs.H6&&S.objs.H6.ans)||[]; const ok=a.length===2&&a.includes("rt")&&a.includes("sg");
    return ok? {pass:true,msg:"Correct: route table AND security group. The REJECT on 5432 needed both a missing return route and a wrong SG source to produce — and note the flow log alone cannot tell you WHICH of them fired, which is why you reproduce with the Traffic Lab instead of guessing."}
      : {pass:false,msg:"Pick exactly the two controls whose misconfiguration produces this REJECT. Hint: NACL-APP sits on APP-A, not on the DB subnet; DNS never blocks TCP; the IGW is irrelevant to an on-prem path."}; } },
 {id:"H7", pillar:"P1", title:"Design decision: add the Analytics VPC + a faster HQ link",
  brief:"Leadership wants a third network (Analytics VPC, 10.30.0.0/16) plus a consistent 10 Gbps HQ link. Choose the design — and the reason a reviewer would accept.",
  look:"Answer below — then defend it in the quiz.",
  nudge:"Peering chains collapse on non-transitivity; think hub + dedicated circuit.",
  widget:{html(){ const a=(S.objs.H7&&S.objs.H7.ans)||{}; const lock=S.objs.H7&&S.objs.H7.done;
      const d=["Chain peering PROD↔STAGE and then STAGE↔ANALYTICS","Transit hub plus a dedicated circuit","Client VPN for every analytics host","Publish Analytics through public IP addresses"];
      const r=["Peering is always cheaper with three or more VPCs","Client VPN encrypts every single analytics host individually","A hub routes any-to-any; the circuit guarantees bandwidth","Public IPs remove the need for private routing"];
      return `<label>Design</label><div class="optlist" role="radiogroup" aria-label="design">${d.map((o,i)=>`<label class="opt"><input type="radio" name="h7d" value="${i}" ${a.d===i?"checked":""} ${lock?"disabled":""}> <span>${o}</span></label>`).join("")}</div>
      <label>Justification</label><div class="optlist" role="radiogroup" aria-label="justification">${r.map((o,i)=>`<label class="opt"><input type="radio" name="h7r" value="${i}" ${a.r===i?"checked":""} ${lock?"disabled":""}> <span>${o}</span></label>`).join("")}</div>`; },
   bind(){ [["h7d","d"],["h7r","r"]].forEach(([nm,k])=>document.querySelectorAll('input[name="'+nm+'"]').forEach(el=>el.addEventListener("change",()=>{
      const st=S.objs.H7||(S.objs.H7={ans:{}});
      if(!st.ans || typeof st.ans !== "object" || Array.isArray(st.ans)) st.ans = {};
      st.ans[k]=+el.value; save(); }))); }},
  validate(){ const a=(S.objs.H7&&S.objs.H7.ans)||{};
    return (a.d===1&&a.r===2)? {pass:true,msg:"Approved design: transit hub + dedicated circuit. Peering PROD↔STAGE↔ANALYTICS still leaves PROD unable to reach ANALYTICS (non-transitive), and N² peerings explode as networks grow; a hub scales linearly. The dedicated circuit answers the bandwidth/latency SLA that no internet VPN can — with the existing VPN kept as encrypted backup."}
      : {pass:false,msg:"Not the approved design. Remember: peering is not transitive, client VPN is per-user, and public publishing defeats the private-address design. Choose the option that solves routing AND bandwidth."}; } },
 {id:"H8", pillar:"P2", title:"Fix the name-resolution fault",
  brief:"ALR-306: PROD-APP resolves db.meridian.internal to 10.10.21.99 — a stale address. Correct the private zone record and make the resolution test pass.",
  look:"DNS-ZONE node; Traffic Lab destination 'db.meridian.internal'.",
  nudge:"Edit the db record's value to the approved data-tier address 10.10.21.10, then test resolution.",
  validate(){ const d=S.world.dns; const rec=d.records.find(r=>norm(r.name)==="db");
    const miss=[];
    if(!rec||norm(rec.ip)!=="10.10.21.10") miss.push("db record must point to 10.10.21.10");
    if(!(d.zone&&d.assoc)) miss.push("zone must exist and stay associated");
    if(!dnsSim("PROD-APP").ok) miss.push("resolution test fails");
    return miss.length? {pass:false,msg:miss.join(" · ")}
      : {pass:true,msg:"DNS repaired. A stale A record mimics a routing outage perfectly — connectivity to a name fails while connectivity to the IP is fine. Testing 'name' vs 'IP' separately is the fastest DNS-vs-routing discriminator in the troubleshooting domain."}; } },
 {id:"H9", pillar:"P3", title:"Arm monitoring — and know the metric",
  brief:"Enable flow logs and tunnel alarms (§7), then answer: which metric proves the VPN can fail over?",
  look:"MONITOR node; answer below.",
  nudge:"The failover-readiness metric reports each tunnel's state — not packet counts or latency.",
  widget:{html(){ const a=(S.objs.H9&&S.objs.H9.ans); const lock=S.objs.H9&&S.objs.H9.done;
      const o=["PacketDropCount metric on the NAT gateway device","Total latency metric on the peering link","TunnelState per tunnel — alarms on both tunnels","BucketSize metric of the flow-log storage destination"];
      return `<div class="optlist" role="radiogroup" aria-label="metric">${o.map((x,i)=>`<label class="opt"><input type="radio" name="h9m" value="${i}" ${a===i?"checked":""} ${lock?"disabled":""}> <span>${x}</span></label>`).join("")}</div>`; },
   bind(){ document.querySelectorAll('input[name="h9m"]').forEach(el=>el.addEventListener("change",()=>{ const st=S.objs.H9||(S.objs.H9={}); st.ans=+el.value; save(); })); }},
  validate(){ const m=S.world.monitor; const a=(S.objs.H9&&S.objs.H9.ans);
    const miss=[]; if(!m.flowLogs) miss.push("flow logs OFF"); if(!m.vpnAlarms) miss.push("tunnel alarms OFF");
    if(a!==2) miss.push("wrong metric — failover readiness is TunnelState per tunnel");
    return miss.length? {pass:false,msg:miss.join(" · ")}
      : {pass:true,msg:"Monitoring armed with the right metric. TunnelState tells you a tunnel died BEFORE traffic does; drop counts and latency only tell you users are already hurting. Detection = the correct data source for the correct question."}; } }
];

const OBJ_ALL = {};
[...OBJ_M, ...OBJ_H].forEach(o => OBJ_ALL[o.id] = o);
