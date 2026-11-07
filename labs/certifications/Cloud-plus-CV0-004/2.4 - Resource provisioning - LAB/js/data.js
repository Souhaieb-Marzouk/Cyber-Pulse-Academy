/* js/data.js — ALL lab content, separated from logic.
 * Objectives, quiz banks, region/instance/finding/forensics/drift/telemetry data,
 * glossary, constraints, sequences — extracted 1:1 from the original lab. */
'use strict';
/* ================= DATA ================= */
var BUDGET=2000;
var REGIONS=[
 {id:'cf-eu-central',label:'Frankfurt (cf-eu-central)',eu:true,lat:4},
 {id:'cf-eu-west',label:'Dublin (cf-eu-west)',eu:true,lat:13},
 {id:'cf-us-east',label:'N. Virginia (cf-us-east)',eu:false,lat:92},
 {id:'cf-ap-se',label:'Sydney (cf-ap-se)',eu:false,lat:180}
];
var VPCS=['10.0.0.0/16','172.31.0.0/16','192.168.0.0/16'];
var INSTANCES=[
 {id:'standard.small',vcpu:2,ram:8,price:60},
 {id:'standard.medium',vcpu:4,ram:16,price:120},
 {id:'standard.large',vcpu:8,ram:32,price:240},
 {id:'compute.xlarge',vcpu:16,ram:32,price:380},
 {id:'memory.large',vcpu:8,ram:64,price:330},
 {id:'gpu.accel',vcpu:16,ram:96,price:1450,gpu:true}
];
var SG=[
 {id:'r443',label:'Allow <span class="mono">TCP 443</span> from <span class="mono">0.0.0.0/0</span> → web load balancer',risk:'Required: the web tier serves patients over HTTPS.'},
 {id:'r80',label:'Allow <span class="mono">TCP 80</span> from <span class="mono">0.0.0.0/0</span> → web load balancer',risk:'Plain HTTP — nothing here needs it.'},
 {id:'r22any',label:'Allow <span class="mono">TCP 22 (SSH)</span> from <span class="mono">0.0.0.0/0</span> → all instances',risk:'World-open SSH is the classic mis-provisioning find.'},
 {id:'r22corp',label:'Allow <span class="mono">TCP 22 (SSH)</span> from <span class="mono">192.168.0.0/16</span> (corp) only',risk:'Admin access limited to the corporate network.'},
 {id:'r5432any',label:'Allow <span class="mono">TCP 5432</span> from <span class="mono">0.0.0.0/0</span> → database',risk:'Direct internet path to the data store.'},
 {id:'r5432priv',label:'Allow <span class="mono">TCP 5432</span> from private subnet <span class="mono">10.0.2.0/24</span> only',risk:'Only the application tier reaches the database.'}
];
var IAMS=[
 {id:'admin-full',label:'AdministratorAccess (actions: * on resources: *)'},
 {id:'power-user',label:'PowerUser (everything except IAM administration)'},
 {id:'app-runtime-least',label:'app-runtime: read/write app storage + write logs only (least privilege)'}
];
var TAGDEF={environment:['dev','test','stage','prod'],owner:['platform','data-eng','security','unassigned'],'cost-center':['CC-2847','CC-0000','none'],'data-class':['public','internal','confidential']};
var TAGPOLICY={environment:'prod',owner:'platform','cost-center':'CC-2847','data-class':'confidential'};
var STORETYPES=[{id:'block',label:'Block storage (volumes)'},{id:'object',label:'Object storage (buckets)'},{id:'file',label:'File storage (shares)'}];
var TIERS=[{id:'standard',label:'Standard (hot data)'},{id:'infrequent',label:'Infrequent access (cool)'},{id:'archive',label:'Archive (cold, long retention)'}];
var DBS=[{id:'relational',label:'Relational (SQL) database'},{id:'nosql',label:'NoSQL document store'}];
var PURCH_WORKLOADS=[
 {id:'web-tier-247',t:'Web tier — steady 24/7 baseline, must never be interrupted'},
 {id:'nightly-batch',t:'Nightly analytics batch — 2 h, checkpointed, tolerates interruption'},
 {id:'dev-sandbox',t:'Developer sandbox — a few hours per week, created/deleted freely'}
];
var PURCHOPTS=[{id:'',label:'— purchasing model —'},{id:'on-demand',label:'On-demand (pay per second, highest rate)'},{id:'reserved',label:'Reserved (1–3 yr commitment, big discount)'},{id:'spot',label:'Spot (spare capacity, cheapest, can be interrupted)'}];
var GLOSSARY=[
 ['Provisioning','Creating and configuring cloud resources — network, compute, storage, identities — so a workload can run.'],
 ['Infrastructure as Code (IaC)','Defining infrastructure in machine-readable templates: repeatable, versioned, reviewable, idempotent.'],
 ['Idempotency','Applying the same template twice produces the same environment — the guarantee that makes IaC safe to re-run.'],
 ['Orchestration','Coordinating many automated provisioning/configuration steps into one end-to-end workflow.'],
 ['Golden image','A pre-built, hardened server image used as the base for new instances.'],
 ['Bootstrapping (user data)','A script that runs automatically on first boot to install and configure software.'],
 ['Region','An independent geographic area (e.g. Frankfurt) with its own quota, pricing and latency.'],
 ['Availability zone (AZ)','One or more isolated data centers inside a region; Multi-AZ designs survive a zone failure.'],
 ['VPC','A logically isolated virtual network in the cloud, sized with a CIDR range.'],
 ['Subnet','An IP range inside a VPC — public (internet-routable) or private.'],
 ['CIDR','IP-range notation such as 10.0.0.0/16 used to size and route networks; overlapping CIDRs break routing.'],
 ['NAT gateway','Gives private-subnet instances outbound internet access (patches, updates) with no inbound path.'],
 ['Security group','A stateful, instance-level virtual firewall: an allow-list of ports, protocols and sources.'],
 ['Least privilege','Granting a role only the actions it actually needs — the opposite of a wildcard *:* policy.'],
 ['Drift','Live infrastructure diverging from its IaC template — usually from manual console changes.'],
 ['Right-sizing','Matching instance size and purchasing model to measured utilization and requirements.'],
 ['Data residency','A legal/contractual requirement that data stay within a jurisdiction (here: EU/EEA).'],
 ['Service quota','A per-region ceiling on a resource type (instances, gateways…); new regions fail until quotas are raised.']
];
var SITUATIONS=[
 {id:'sit1',t:'A data scientist needs a one-off sandbox VM this afternoon — it will be deleted tomorrow.'},
 {id:'sit2',t:'A partner integration needs bespoke per-run logic — scripts with conditionals and retries.'},
 {id:'sit3',t:'Three identical environments (dev / stage / prod) rebuilt on every release.'}
];
var METHOD_OPTS=[{id:'',label:'— method —'},{id:'console',label:'Cloud console (manual clicks)'},{id:'cli',label:'Scripted CLI / API calls'},{id:'iac',label:'IaC template pipeline'},{id:'catalog',label:'Self-service catalog (pre-approved builds)'}];
var METHOD_OK={sit1:'console',sit2:'cli',sit3:'iac'};
var STOR_WORK=[
 {id:'st1',t:'Patient database volume — millisecond latency, transactional I/O.'},
 {id:'st2',t:'Raw data lake: CSV/JSON exports written once, read by analytics jobs.'},
 {id:'st3',t:'Shared home directories for the legacy reporting app (NFS/SMB).'}
];
var STOR_OPTS=[{id:'',label:'— storage type —'},{id:'block',label:'Block storage'},{id:'object',label:'Object storage'},{id:'file',label:'File storage'}];
var STOR_OK={st1:'block',st2:'object',st3:'file'};
var FINDINGS=[
 {id:'F1',t:'Object store mh-legacy-exports allows public reads',d:'Public access block = OFF; anonymous read policy present. The bucket holds exported reports containing patient-reference numbers. (Synthetic resource; nothing real.)',real:true,fixes:[
   {id:'a',t:'Turn the public access block ON and restrict the bucket policy to approved roles',ok:true},
   {id:'b',t:'Delete the bucket immediately',ok:false},
   {id:'c',t:'Move the objects to the archive tier',ok:false}]},
 {id:'F2',t:'40 legacy instances have no tags at all',d:'The 2021 console-built fleet carries zero tags: no owner, no cost center, no data classification. FinOps cannot allocate the spend; automation skips the fleet.',real:true,fixes:[
   {id:'a',t:'Bulk-apply the mandatory tags now and enforce tags in the IaC pipeline going forward',ok:true},
   {id:'b',t:'Buy a tagging scanner and leave the fleet as it is',ok:false},
   {id:'c',t:'Tag everything environment=prod and move on',ok:false}]},
 {id:'F3',t:'Deploy role grants *:* (wildcard on everything)',d:'The legacy-deploy role used by the old CI pipeline holds AdministratorAccess with no conditions — anyone who compromises the pipeline owns the account.',real:true,fixes:[
   {id:'a',t:'Rewrite the policy to least-privilege actions per pipeline stage',ok:true},
   {id:'b',t:'Delete the role before Monday',ok:false},
   {id:'c',t:'Give every developer the same wildcard role so debugging is easier',ok:false}]},
 {id:'F4',t:'Reporting instance massively oversized',d:'rep-01 runs 16 vCPU / 64 GB; two weeks of telemetry show 9% average CPU and 22% RAM. It costs about 5× a right-sized node.',real:true,fixes:[
   {id:'a',t:'Right-size to 4 vCPU / 16 GB after confirming peak headroom',ok:true},
   {id:'b',t:'Terminate rep-01 now — nobody will notice',ok:false},
   {id:'c',t:'Add two more rep-01 instances for safety',ok:false}]},
 {id:'F5',t:'Temporary backup instance starts nightly at 01:00',d:'A 25-minute scheduled instance runs the nightly backup, then stops. Alerting flagged it as “unusual instance”, but it is the documented backup job.',real:false},
 {id:'F6',t:'Autoscaling added 3 web nodes Monday 08:00–10:00',d:'Weekly scale-out during the Monday peak, scale-in after. The cost-anomaly alert fires every week — this is the elasticity design working, not a misconfiguration.',real:false}
];
var FORENSICS=[
 {id:'E1',label:'Error 1 — network create',lines:['12:04:11  EVALUATE  vpc-create  cidr=192.168.0.0/16  account=partner-42','12:04:12  ERROR    VpcCidrConflict: 192.168.0.0/16 overlaps transit-gateway attachment tgw-corp (on-prem 192.168.0.0/16)','12:04:12  INFO     no resources were created; run aborted'],ok:'cidr',why:'The chosen range is already routed by the corporate network. New networks must use unclaimed space — that is why CIDR planning happens before provisioning.'},
 {id:'E2',label:'Error 2 — compute scale-up',lines:['12:04:40  EVALUATE  compute-cluster create  count=50  machine=standard.large  region=cf-us-east','12:04:41  ERROR    LimitExceeded: running-instances limit of 40 reached in cf-us-east for this account','12:04:41  INFO     request a quota increase or free capacity first'],ok:'quota',why:'Every resource type has per-region quotas. Scale-ups in a new region hit them until you request an increase — plan quotas before big deployments.'},
 {id:'E3',label:'Error 3 — gateway create',lines:['12:05:02  EVALUATE  nat-gateway create  subnet=public-a','12:05:03  ERROR    UnauthorizedOperation: role ci-deployer is not authorized to perform natgateway:CreateNatGateway (allowed: [])','12:05:03  INFO     the pipeline identity itself is missing the permission'],ok:'iam',why:'IaC pipelines need their own least-privilege rights. Here the deploy role was never granted the NAT action — permission errors are provisioning evidence, not random failures.'}
];
var CAUSES=[{id:'',label:'— choose root cause —'},{id:'cidr',label:'CIDR overlap with an existing network'},{id:'quota',label:'Service quota exceeded'},{id:'iam',label:'IAM permission missing on the pipeline role'},{id:'outage',label:'Provider region outage'}];
var DRIFT=[
 {id:'D1',item:'Security group web-sg — SSH rule',tpl:'22/tcp from 192.168.0.0/16',live:'22/tcp from 0.0.0.0/0',chg:true,drift:true,sev:'high'},
 {id:'D2',item:'Bucket mh-reports — public access block',tpl:'ON',live:'OFF',chg:true,drift:true,sev:'high'},
 {id:'D3',item:'Database mh-db — Multi-AZ',tpl:'ON (standby in AZ-B)',live:'OFF (single AZ)',chg:true,drift:true,sev:'high'},
 {id:'D4',item:'Instance rep-01 — machine type',tpl:'standard.large (8 vCPU)',live:'gpu.accel (16 vCPU + GPU)',chg:true,drift:true,sev:'medium'},
 {id:'D5',item:'Resource tags — environment',tpl:'environment=prod',live:'(tag removed on 12 instances)',chg:true,drift:true,sev:'medium'},
 {id:'D6',item:'Bucket mh-logs — versioning',tpl:'ON',live:'ON',chg:false},
 {id:'D7',item:'Stack description',tpl:'analytics stack',live:'analytics stack v2',chg:true,drift:false},
 {id:'D8',item:'Golden image (AMI)',tpl:'cfair-113',live:'cfair-113',chg:false},
 {id:'D9',item:'Public subnet',tpl:'10.0.1.0/24',live:'10.0.1.0/24',chg:false},
 {id:'D10',item:'IAM role app-runtime',tpl:'least-privilege (4 actions)',live:'least-privilege (4 actions)',chg:false}
];
var TELE=[
 {id:'web-01',cpu:'12% avg / 31% peak',ram:'30% avg',note:'Steady low load across all 14 days',ok:'downsize'},
 {id:'web-02',cpu:'86% avg / 99% peak',ram:'91% avg',note:'Throttling alerts; latency SLO breaches at peak',ok:'upsize'},
 {id:'batch-01',cpu:'idle 22 h/day, 70% for 2 h',ram:'low',note:'Nightly batch, checkpointed, tolerates interruption',ok:'terminate'},
 {id:'db-01',cpu:'61% avg / 72% peak',ram:'65% avg',note:'Within SLA headroom, stable trend',ok:'keep'}
];
var TELOPTS=[{id:'',label:'— action —'},{id:'keep',label:'Keep as is'},{id:'downsize',label:'Downsize'},{id:'upsize',label:'Upsize'},{id:'terminate',label:'Terminate / replace workload'}];
var EVENTS=['14:02:11  AuthorizeSecurityGroupIngress   principal=ci-deployer    sg=web-sg      port=443  src=0.0.0.0/0   result=allow',
 '14:05:37  AuthorizeSecurityGroupIngress   principal=j.wild@meridianhi.example  sg=web-sg  port=22  src=0.0.0.0/0  result=allow',
 '14:05:52  ModifyPublicAccessBlock         principal=j.wild@meridianhi.example  bucket=mh-reports  blockPublicAcls=false',
 '14:07:03  CreateBucket                    principal=ci-deployer    bucket=mh-logs  publicAccessBlock=false',
 '14:09:44  RunInstances                    principal=ci-deployer    count=2  machine=standard.large',
 '15:12:08  BudgetThreshold                 forecast=CHF 2,050   actualRunRate=CHF 2,410   status=BREACH',
 '15:14:26  DeleteBucketPublicAccessBlock   principal=temp-contractor (assume-role)  bucket=mh-reports',
 '15:20:01  DescribeInstances               principal=monitoring-reader  result=allow'];
var RULEDEFS=[
 {id:'RA',name:'Drift alert — security group changed outside the pipeline',evOk:'AuthorizeSecurityGroupIngress',condOk:'principal is not the pipeline role (ci-deployer)'},
 {id:'RB',name:'Exposure alert — bucket created publicly reachable',evOk:'CreateBucket',condOk:'publicAccessBlock is disabled'},
 {id:'RC',name:'Budget alert — spend running above forecast',evOk:'BudgetThreshold',condOk:'run-rate exceeds 110% of forecast'}
];
var RULEEV=['','AuthorizeSecurityGroupIngress','CreateBucket','RunInstances','DescribeInstances','ModifyInstanceAttribute','BudgetThreshold'];
var RULECOND={
 RA:['','principal is not the pipeline role (ci-deployer)','source is 0.0.0.0/0 (any source)'],
 RB:['','publicAccessBlock is disabled','bucket name starts with mh-'],
 RC:['','run-rate exceeds 110% of forecast','forecast changed by any amount']};
var SEQSTEPS=[
 'Contain: turn the public access block ON and remove the anonymous grants',
 'Assess: preserve access logs for the exposure window',
 'Assess: review who fetched data while it was public',
 'Fix: rewrite the wildcard deploy policy to least privilege',
 'Fix: bulk-apply the mandatory tags and enforce tagging in the pipeline',
 'Fix: right-size rep-01 to 4 vCPU / 16 GB after a headroom check',
 'Verify: re-scan the account and try the old public URL — expect denial'
];
var SEQ_INIT=[2,0,6,1,4,5,3];
var VSTEPS=[
 {id:'S1',t:'Re-scan public access settings on mh-reports — expect fully blocked',ok:1},
 {id:'S2',t:'Attempt to fetch a former public URL — expect access denied',ok:2},
 {id:'S3',t:'Confirm the drift alert fired for the change and closed after the fix',ok:3},
 {id:'S4',t:'Re-run the full provisioning validation suite — expect all green',ok:4},
 {id:'S5',t:'Record residual risk and sign off the change ticket',ok:5},
 {id:'S6',t:'Delete the bucket permanently so the question disappears',ok:0},
 {id:'S7',t:'Wait 30 days and re-check the exposure then',ok:0},
 {id:'S8',t:'Email the CFO the raw access logs',ok:0}
];
var VRANKS=[{id:0,label:'— not a verification step —'},{id:1,label:'1 (first)'},{id:2,label:'2'},{id:3,label:'3'},{id:4,label:'4'},{id:5,label:'5 (last)'}];
var CONSTRAINTS=[
 {id:'K1',t:'Patient data must remain in the EU/EEA',src:'Architect notes',ok:true},
 {id:'K2',t:'Lowest latency to Zurich / Munich users',src:'Architect notes',ok:true},
 {id:'K3',t:'99.9% availability for the data tier',src:'Architect notes',ok:true},
 {id:'K4',t:'Monthly cost ceiling CHF 2,000 (steady state)',src:'Architect notes',ok:true},
 {id:'K5',t:'No data store reachable from the internet',src:'Architect notes',ok:true},
 {id:'K6',t:'Every resource tagged per policy',src:'Architect notes',ok:true},
 {id:'K7',t:'Use the newest GPU family for all compute',src:'CFO email',ok:false},
 {id:'K8',t:'Migrate the legacy CRM in phase 2',src:'Work order',ok:false},
 {id:'K9',t:'Deploy a Sydney DR site now',src:'Architect notes (future idea)',ok:false},
 {id:'K10',t:'Support 10,000 concurrent users at go-live',src:'Work order (aspirational)',ok:false},
 {id:'K11',t:'Buckets must be named with the “mh-” prefix',src:'CFO email (naming preference)',ok:false},
 {id:'K12',t:'Finish the configuration by Friday',src:'CFO email (schedule, not config)',ok:false}
];
/* ================= QUIZ BANKS ================= */
var QUIZ={
medium:[
 {id:'QM1',tag:'IaC & idempotency',q:'What is the primary benefit of provisioning through IaC templates instead of clicking in the console?',
  o:['Templates are always much cheaper than console resources','Templates bypass all service quotas and provider limits','The same template reproduces the environment every time','Templates remove the need to tag any resource'],c:2,
  e:'Idempotency is the point: applying the same template yields the same environment, so deployments are repeatable, reviewable as code diffs, and drift from manual clicks becomes visible. The tempting distractors are all false: templates are not automatically cheaper, they do not touch quotas, and tagging is still your job.'},
 {id:'QM2',tag:'Region selection',q:'For Meridian’s patient-analytics platform, which factors dominate the region decision?',
  o:['Data residency law and user latency','The provider’s logo colors and brand','Which instance families the region offers','How long the catalog page is'],c:0,
  e:'Residency (EU/EEA health data) is non-negotiable and latency is user-facing; both are effectively fixed once you provision. Region is the least reversible provisioning decision — which is why it is chosen first. Family availability and page cosmetics are secondary at best.'},
 {id:'QM3',tag:'Storage types',q:'A transactional patient database needs storage provisioned. Which type fits?',
  o:['Object storage','A file share','Archive tape','Block storage'],c:3,
  e:'Block storage gives low-latency, transactional volumes for databases. Object storage fits data lakes and exports; file storage fits shared directories like NFS/SMB homes; archive tiers fit write-once, rarely-read retention.'},
 {id:'QM4',tag:'Security groups',q:'Which statement about security groups is correct?',
  o:['Stateless filters evaluated at the subnet level','Stateful instance-level allow-lists of ports and sources','Rules that cannot be changed after creation','A total replacement for least-privilege IAM policies'],c:1,
  e:'Security groups are stateful and attach to instances; network ACLs are stateless and attach to subnets — that is the stateless/subnet distractor’s mistake. Rules change freely, and neither control replaces least-privilege IAM.'},
 {id:'QM5',tag:'Purchasing models',q:'The web tier runs a steady 24/7 baseline load. Which purchasing model fits best?',
  o:['Spot spare capacity','On-demand with alerts','Reserved baseline capacity','Autoscaling group sizing'],c:2,
  e:'Reserved capacity buys a steady baseline at a large discount. Spot fits interruptible batch; on-demand fits short or spiky workloads. Autoscaling changes node counts, not rates, and alerts warn instead of discounting — neither is a purchasing model.'},
 {id:'QM6',tag:'Drift',q:'A colleague changed a security group in the console; the template still says otherwise. This is called…',
  o:['Drift','Rollback','Orchestration','Bootstrapping'],c:0,
  e:'Drift is live infrastructure diverging from its IaC source — usually manual console changes. Rollback restores a prior version, orchestration coordinates steps, bootstrapping configures at first boot; none of them names this divergence. That is why drift detection compares live config against the template.'}],
hard:[
 {id:'QH1',tag:'CIDR planning',q:'A provisioning run fails with: “VpcCidrConflict: 192.168.0.0/16 overlaps transit-gateway tgw-corp”. The correct response is to…',
  o:['Retry the same run until the conflict clears itself','Pick an unclaimed CIDR that overlaps nothing already routed','Delete the conflicting transit-gateway attachment on the corp side','Use 0.0.0.0/0 as the entire new VPC address range'],c:1,
  e:'An overlap error means the address space is already routed. CIDR planning happens before provisioning: choose unclaimed space and document it. Retrying cannot clear a routing conflict, deleting the corp attachment breaks the network, and 0.0.0.0/0 is not a usable VPC range.'},
 {id:'QH2',tag:'Tag governance',q:'40 legacy instances are untagged. The strongest durable control is to…',
  o:['Send a monthly manual audit email to fleet owners','Fire the whole team that built the untagged fleet','Let FinOps infer the owners from IP addresses alone','Bulk-tag the fleet and enforce tags in the pipeline'],c:3,
  e:'Fixing existing resources without pipeline enforcement invites the next untagged fleet; enforcement without fixing the backlog leaves today’s cost unallocatable. Governance needs both — which is why the durable control pairs the bulk fix with deny-untagged pipeline enforcement.'},
 {id:'QH3',tag:'Purchasing models',q:'A nightly 2-hour, checkpointed batch job must cost as little as possible. Purchasing model?',
  o:['Reserved','On-demand','Spot','Multi-AZ'],c:2,
  e:'Spot capacity is cheapest and this workload tolerates interruption (checkpointed, retriable). Reserved fits steady baselines; on-demand fits spiky, short-lived needs. A Multi-AZ standby is an availability design, not a rate plan.'},
 {id:'QH4',tag:'Private egress (NAT)',q:'App servers in a private subnet must download OS patches. What do you provision?',
  o:['A dedicated NAT gateway routed from the private subnet','An internet gateway attached directly to the private subnet','A public IP address on every single app server','Allow inbound SSH from anywhere just for patch downloads'],c:0,
  e:'NAT provides outbound-only internet access: patches flow out-initiated, and no inbound path exists. The distractors each create exactly the exposure the design forbids — a subnet-level IGW, public IPs, or world-open SSH.'},
 {id:'QH5',tag:'Residency response',q:'An audit finds old exports in a US bucket, but policy says EU/EEA only. The right action is to…',
  o:['Leave the old exports in place; nobody reads them anymore','Block access, migrate data to an EU region, verify, document','Delete everything immediately, including all of the audit access logs','Rename the buckets with the mh- prefix and move on'],c:1,
  e:'Residency violations are contained first (block access), then remediated (migrate), then verified — and evidence is preserved. Leaving them keeps the violation live; deleting destroys the record of who may have accessed the data; renaming is cosmetic.'},
 {id:'QH6',tag:'Service quotas',q:'A scale-out to 50 instances in a new region fails with LimitExceeded. Best next step?',
  o:['Retry the same run in a tight loop','Switch this workload to a different cloud provider','Disable the autoscaling feature for the whole account','Request a quota increase and plan quotas ahead'],c:3,
  e:'Quotas are per-region ceilings. The professional response is to request an increase and to check quotas during planning — the lab’s forensics bench shows the same error class. Retrying, switching providers or disabling autoscaling treats the symptom, not the ceiling.'},
 {id:'QH7',tag:'Drift response',q:'Drift detection shows the live security group allows SSH from 0.0.0.0/0, which the template forbids. Respond by…',
  o:['Treat it as cosmetic; update the template to match reality','Archive the drift report for the next annual review cycle','Revert the exposure first, then alert on out-of-pipeline SG changes','Delete the exposed security group and rebuild it next sprint'],c:2,
  e:'A world-open SSH rule is a critical exposure, not documentation noise: revert it, then close the door it came through — alert on non-pipeline SG changes so the next one is caught in minutes. Re-documenting the exposure, archiving the report, or deleting the group all leave the door open longer.'}]
};
var OBJ={
 medium:[
  {id:'M1',p:'P1',t:'Choose the right provisioning method',b:'On the Reference Shelf, match all three situations to the method that fits (console / scripted CLI / IaC / catalog).',jump:{sel:'#cardMethods'},hints:['Ask how many times each task repeats, and whether it needs custom per-run logic.','One-off → console; custom logic per run → scripted CLI; identical rebuilds → IaC pipeline. The catalog fits none of these.','sit1 = console, sit2 = scripted CLI, sit3 = IaC pipeline.']},
  {id:'M2',p:'P1',t:'Select the region',b:'In Draft → Region & network, choose the region that satisfies EU/EEA residency with the lowest latency to Zurich/Munich.',jump:{stage:'draft',sub:'net',sel:'#selRegion'},hints:['Residency first: only EU regions qualify. Then compare latency.','Frankfurt and Dublin are both EU — check which is closer to Zurich/Munich.','Select Frankfurt (cf-eu-central).']},
  {id:'M3',p:'P2',t:'Design the network foundation',b:'Set the VPC CIDR, create the public and private subnets, and attach the IGW and NAT gateway.',jump:{stage:'draft',sub:'net',sel:'#selVpc'},hints:['The VPC range must not overlap the corporate 192.168.0.0/16 network.','Public subnet for the load balancer (.1), private for data (.2); the web tier needs the IGW, private patching needs NAT.','10.0.0.0/16 · 10.0.1.0/24 · 10.0.2.0/24 · IGW on · NAT on.']},
  {id:'M4',p:'P2',t:'Right-size the compute',b:'In Draft → Compute, pick the instance type, node count and elasticity for analytics nodes (≥ 8 vCPU, ≥ 32 GB RAM per node).',jump:{stage:'draft',sub:'compute',sel:'#instGrid'},hints:['Find every type meeting the profile, then take the cheapest (right-sizing).','standard.large (8/32) meets it exactly; set 2 nodes and enable autoscaling.','standard.large · count 2 · autoscaling ON.']},
  {id:'M5',p:'P2',t:'Match storage to workloads',b:'In Draft → Storage & data, match the three workloads to storage types, choose the platform data store and the patient-data database engine, set the audit-log tier, and give the data store ≥ 3,000 IOPS.',jump:{stage:'draft',sub:'storage',sel:'#selStoreType'},hints:['Transactional volume, API-accessed exports, shared directories — one storage type each. The platform store backs the relational database, and structured records with transactions want a relational engine.','database → block; data lake → object; shared homes → file; platform store → block; patient database → relational. Audit logs: write-once, rarely read → archive tier.','st1 block · st2 object · st3 file · platform store block · engine relational · tier archive · IOPS 3000+.']},
  {id:'M6',p:'P2',t:'Complete the IaC template',b:'In Draft → IaC template, fill the four blanks so the template matches the approved design.',jump:{stage:'draft',sub:'iac',sel:'#iacSheet'},hints:['Each blank mirrors a decision you already made in the Draft sheets.','region = your chosen region; count and machine type from Compute; environment from the tag policy.','cf-eu-central · 2 · standard.large · prod.']},
  {id:'M7',p:'P4',t:'Provision the security layer',b:'In Draft → Security & access, build the security group rule set (no extras!) and pick the least-privilege execution role.',jump:{stage:'draft',sub:'sec',sel:'#sgList'},hints:['Allow-list the minimum: web port, admin port from corp, DB port from the private subnet only.','Required: 443, SSH-from-corp, 5432-from-private. Everything world-open is a liability.','Rules: 443 + SSH-corp + DB-private only · role: app-runtime (least privilege).']},
  {id:'M8',p:'P1',t:'Apply the tagging policy',b:'In Draft → Security & access, set all four mandatory tags to the policy values.',jump:{stage:'draft',sub:'sec',sel:'#tagRows'},hints:['The requirements board (right rail) lists the exact expected values.','environment=prod · owner=platform · cost-center=CC-2847 · data-class=confidential.','Set each dropdown to the policy value shown in the requirements board.']},
  {id:'M9',p:'P3',t:'Provision and prove it works',b:'Run the provisioning in Build, read the log, then pass all five validation tests in Verify (fix whatever fails).',jump:{stage:'build',sel:'#btnProvision'},hints:['The log warns about risks it can see; the tests prove the ones that matter. Expect one HA failure on a default draft.','Enable Multi-AZ on the database (Draft → Storage & data) if test T4 fails, then re-provision and re-run tests.','All five green = Go. The blocker is almost always the single-AZ database.']},
  {id:'M10',p:'P3',t:'Triage the audit findings',b:'In Audit → Findings triage, classify all six findings as real mis-provisioning or benign design.',jump:{stage:'audit',aud:'findings',sel:'#aud-findings'},hints:['Two findings are documented, intentional behavior — the alerts are doing their job.','Real = creates exposure, breaks policy, or wastes money. Benign = the nightly backup job and the Monday autoscaling pattern.','F1–F4 real · F5–F6 benign.']},
  {id:'M11',p:'P4',t:'Plan the remediation',b:'In Remediate, choose the correct fix for each real finding and order the response plan (containment first).',jump:{stage:'remedy',sel:'#remedyBody'},hints:['Some “fixes” destroy data or dodge the problem — read each option critically.','For the public store: block access first; evidence before surgery. Sequence: contain → assess → fix → verify.','F1 block+restrict · F2 tag now + enforce · F3 least-privilege rewrite · F4 right-size · plan starts with the containment step, then preserving logs.']},
  {id:'M12',p:'P4',t:'Set purchasing & budget guardrails',b:'In Remediate → Govern, assign a purchasing model to each workload and set the budget alert to 80%.',jump:{stage:'remedy',sel:'#governBlock'},hints:['Match model to workload profile: steady / interruptible / unpredictable.','web tier → reserved · nightly batch → spot · dev sandbox → on-demand.','Move the budget alert slider to 80.']}],
 hard:[
  {id:'H1',p:'P1',t:'Extract the binding constraints',b:'The requirements packet (left) is noisy. Select the six constraints that actually bind this configuration — no more, no fewer.',jump:{sel:'#packetPanel'},hints:['The CFO email and the work order contain wishes, phases and schedule pressure — not configuration constraints.','Binding = residency, latency, availability, budget, exposure, tagging. Everything else is aspiration, future phase, preference or schedule.','K1–K6 only.']},
  {id:'H2',p:'P2',t:'Deliver the blueprint under budget',b:'Build the full environment so every requirement stamps green and total cost stays ≤ CHF 2,000/mo — then provision and pass validation.',jump:{stage:'draft',sub:'net',sel:'#selRegion'},hints:['The requirements board is your scorecard: make every row green, then watch the BOM.','EU region with lowest latency · right-sized compute · Multi-AZ DB · locked-down SG · all tags · NAT+IGW.','Same target configuration as the guided path: Frankfurt, 10.0.0.0/16 net, standard.large ×2 auto, block 3k IOPS, relational Multi-AZ, minimal SG, full tags — ~CHF 1,000/mo.']},
  {id:'H3',p:'P3',t:'Root-cause the failed run',b:'In Audit → Failed-run forensics, assign each of the three errors its root cause.',jump:{stage:'audit',aud:'forensics',sel:'#aud-forensics'},hints:['Each ERROR line names its class in capital letters.','overlap → conflict with routed networks; LimitExceeded → quota; UnauthorizedOperation → IAM.','E1 CIDR overlap · E2 quota exceeded · E3 IAM permission missing.']},
  {id:'H4',p:'P3',t:'Hunt the drift',b:'In Audit → Drift diff, flag exactly the rows whose live config differs meaningfully from the template, with severities. Cosmetic changes are not drift.',jump:{stage:'audit',aud:'drift',sel:'#aud-drift'},hints:['Five rows carry security, availability or cost impact.','Exposures and HA loss are high; cost/governance drift is medium. The description text is cosmetic.','D1 high · D2 high · D3 high · D4 medium · D5 medium.']},
  {id:'H5',p:'P4',t:'Sequence the remediation',b:'In Remediate, order all seven steps of the response plan.',jump:{stage:'remedy',sel:'#seqBlock'},hints:['The plan follows contain → assess → fix → verify.','Steps 1–2 contain; 3 assesses; 4–6 fix; 7 verifies.','Containment steps first, then evidence, then fixes, verification last.']},
  {id:'H6',p:'P2',t:'Right-size from telemetry',b:'In Audit → Right-sizing telemetry, decide keep / downsize / upsize / terminate for each of the four resources.',jump:{stage:'audit',aud:'telemetry',sel:'#aud-telemetry'},hints:['Compare sustained averages and peaks against SLA needs — not one number.','Low steady → downsize; peaks at 100% with SLO breaches → upsize; idle batch shape → terminate (replace with spot); healthy → keep.','web-01 down · web-02 up · batch-01 terminate · db-01 keep.']},
  {id:'H7',p:'P4',t:'Govern: purchasing & guardrails',b:'In Remediate → Govern: assign purchasing models, set the 80% budget alert, and enable the EU-region deny guardrail.',jump:{stage:'remedy',sel:'#governBlock'},hints:['Guardrails make policy automatic; alerts make it visible before the invoice.','reserved / spot / on-demand as in the guided path; slider 80; deny non-EU regions.','All three models + slider 80 + guardrail ON.']},
  {id:'H8',p:'P3',t:'Engineer provisioning detections',b:'In Audit → Event stream & alerts, complete the three alert rules: pick the triggering event and the condition for each.',jump:{stage:'audit',aud:'events',sel:'#aud-events'},hints:['Scan the event stream: which entries begin each risk — SG change, bucket creation, budget breach?','RA watches AuthorizeSecurityGroupIngress by anyone but the pipeline; RB watches CreateBucket with public access unblocked; RC watches BudgetThreshold.','RA: AuthorizeSecurityGroupIngress + principal-not-pipeline · RB: CreateBucket + publicAccessBlock disabled · RC: BudgetThreshold + >110% forecast.']},
  {id:'H9',p:'P4',t:'Design the verification protocol',b:'In Remediate → Verification, rank the five steps that actually prove the fix, in order. Three distractors must stay unranked.',jump:{stage:'remedy',sel:'#verifyBlock'},hints:['A verification step yields evidence the specific exposure is closed. Deleting data or waiting weeks prove nothing.','Re-scan → attempt old access → alert lifecycle → full test suite → sign-off.','S1→1, S2→2, S3→3, S4→4, S5→5; S6–S8 unranked.']}
 ]};
