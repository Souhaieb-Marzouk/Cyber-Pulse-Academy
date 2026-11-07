'use strict';
/* ================= Lab data: folders, evidence sheets, exercises ================= */
const P = (s)=>'<p>'+s+'</p>';
const opt = (v,label,sel)=>'<option value="'+v+'"'+(sel===v?' selected':'')+'>'+label+'</option>';
const radio = (name,val,label,sub,cur)=>'<label class="choice"><input type="radio" name="'+name+'" value="'+val+'" data-f="'+name+'"'+(cur===val?' checked':'')+'><span>'+label+(sub?'<span class="c-sub">'+sub+'</span>':'')+'</span></label>';
const checkbox = (set,val,label,sub,checked)=>'<label class="choice"><input type="checkbox" data-set="'+set+'" data-val="'+val+'"'+(checked?' checked':'')+'><span>'+label+(sub?'<span class="c-sub">'+sub+'</span>':'')+'</span></label>';
const term = (id,txt)=>'<button type="button" class="term" data-term="'+id+'">'+txt+'</button>';

function selOptions(list, cur){
  return '<option value="" disabled'+(cur?'':' selected')+'>\u2014 choose \u2014</option>' + list.map(o=>opt(o.id,o.label,cur)).join('');
}

/* --- small reusable evidence widgets --- */
function statCard(t,big,unit){ return '<div class="ev"><div class="ev-t">'+t+'</div><span class="big">'+big+'</span> <span class="unit">'+unit+'</span></div>'; }
function curveSVG(points, w=300, h=84){
  const pts = points.map((p,i)=>[ (i*w/(points.length-1)), h-8-(p/100)*(h-16) ]);
  const str = pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  return '<svg viewBox="0 0 '+w+' '+h+'" width="100%" height="'+h+'" role="img" aria-label="24-hour CPU utilization curve">'+
    '<line x1="0" y1="'+(h-8-(50/100)*(h-16))+'" x2="'+w+'" y2="'+(h-8-(50/100)*(h-16))+'" stroke="#C9DAE6" stroke-dasharray="4 3"/>'+
    '<text x="4" y="'+(h-8-(50/100)*(h-16)-3)+'" font-size="9" fill="#46535E">50%</text>'+
    '<polyline points="'+str+'" fill="none" stroke="#9C3E20" stroke-width="2"/></svg>';
}
function heatGrid(){
  // deterministic 90-day access pattern: mostly cold, weekly blips, two recent touches
  let cells='';
  for(let i=0;i<90;i++){
    let a=0.06;
    if(i%7===3) a=0.3;
    if(i>80) a=0.55;
    if(i===12||i===47) a=0.8;
    const v=Math.round(200*(1-a));
    cells+='<i style="background:rgb('+v+','+Math.round(v*0.96)+','+Math.round(v*0.86)+')" title="day '+(90-i)+'"></i>';
  }
  return '<div class="heat" aria-hidden="true">'+cells+'</div>';
}
const CPU_DB=[10,8,7,8,14,30,38,41,44,42,40,41,39,31,24,18,14,12,11]; // 24h, business-hours shape
const CPU_WA=[8,7,6,7,10,20,26,30,33,34,31,29,30,28,25,20,15,12,10];

/* ============================ FOLDER DEFINITIONS ============================ */
const FOLDERS = [
/* ---------- REFERENCE ---------- */
{ id:'manual', group:'Reference', name:'Field Manual', tag:'Knowledge core', icon:'manual',
  tabs:[{id:'core', label:'Core', render:()=> `
    ${P('A migration is a <strong>plan, not a button</strong>. Before anything moves, objective 2.1 of the CV0-004 exam expects you to <em>analyze the system requirements</em>: what each workload consumes, how it behaves, what it talks to, what constrains it, what it must survive, and what it may cost. Every later task \u2014 IaC (2.2), the migration itself (2.3), provisioning (2.4) \u2014 inherits the quality of this analysis.')}
    <h4>The three lenses</h4>
    ${P('<strong>Business requirements</strong> come from the organization: deadlines, budgets, contracts. <strong>Functional requirements</strong> describe what the system must do (features, interfaces, jobs). <strong>Non-functional requirements</strong> describe how well it must do it: performance, availability, recoverability, security, compliance. A requirements dossier needs all three \u2014 a migration that meets two lenses fails the third.')}
    <h4>Baselines &amp; percentiles</h4>
    ${P(`Measure first: the ${term("g-baseline","baseline")} tells you what the workload really uses. Size from ${term("g-p95","p95")} \u2014 averages hide recurring peaks, and absolute maximums overreact to rare events. Then add ${term("g-headroom","headroom")} (this engagement\u2019s policy: \u2265 25%). For <em>episodic</em> peaks \u2014 three flash sales a year \u2014 the right tool is autoscaling, not an oversized server you pay for 8,760 hours.`)}
    <h4>Dependencies &amp; data gravity</h4>
    ${P(`${term("g-deps","Dependency mapping")} answers: who talks to whom, how often, and how fast must the answer come back? Chatty pairs (hundreds of queries per second) impose a round-trip budget; place them close together \u2014 ${term("g-gravity","data gravity")} pulls colocated services together, while separating failure domains (\u201cblast radius\u201d) pushes them apart — the budget decides which wins. Identity (SSO), batch jobs (ETL) and legacy links count too: a dependency can quietly veto a region choice.`)}
    <h4>Compatibility &amp; licensing</h4>
    ${P(`Check OS lifecycle (an end-of-life (EOL) OS is a finding \u2014 sometimes a reason to retire), hypervisor and image formats (can the provider import your disks?), and device-level constraints (a serial link to a mainframe cannot cross a WAN). Licensing is a compatibility requirement: ${term("g-byol","BYOL")} terms may count virtualized cores double, which can make a provider-managed edition cheaper.`)}
    <h4>Data volume &amp; the transfer equation</h4>
    <div class="callout">Usable link = 1 Gbps \u00d7 70% = 700 Mbps = <strong>87.5 MB/s</strong> (decimal units).<br>
    <strong>hours \u2248 TB \u00d7 1,000,000 MB \u00f7 87.5 MB/s \u00f7 3600 \u2248 TB \u00d7 3.17 h</strong><br>
    Worked example: 12 TB \u2192 38.1 h on the link \u2192 10 nights in the 4-hour window \u2192 start seeding ~2 weeks before the June 30 lease ends.</div>
    <h4>Availability: RTO &amp; RPO</h4>
    ${P(`${term("g-rto","RTO")} bounds downtime after a failure; ${term("g-rpo","RPO")} bounds data loss. They are requirements \u2014 the target platform must be chosen to meet them, and they shape backup design and migration testing.`)}
    <h4>Compliance &amp; residency</h4>
    ${P(`${term("g-residency","Data residency")} means data stays in its jurisdiction \u2014 solved by <strong>region pinning</strong>, never by encryption alone. Add the mandated controls: encryption at rest and in transit, SSO (single sign-on) / MFA (multi-factor authentication) through the corporate identity provider, audit logging.`)}
    <h4>Cost requirements</h4>
    ${P('A monthly run-rate cap is a hard requirement like any other: the design must pass the budget gate. One-time costs (egress for the initial transfer) are tracked separately. Oversizing \u201cjust in case\u201d violates the cap; undersizing violates performance \u2014 the dossier must satisfy both.')}
    <h4>The Six Rs</h4>
    <table class="rule"><tr><th>R</th><th>Means</th></tr>
    <tr><td>Rehost</td><td>move as-is, no OS/app changes</td></tr>
    <tr><td>Replatform</td><td>minor targeted changes (engine edition, OS upgrade mid-move)</td></tr>
    <tr><td>Refactor</td><td>re-architect for cloud-native</td></tr>
    <tr><td>Repurchase</td><td>drop the old product, buy a managed replacement</td></tr>
    <tr><td>Retire</td><td>decommission \u2014 migrating waste is still waste</td></tr>
    <tr><td>Retain</td><td>leave in place for now; revisit later</td></tr></table>
    <div class="ok"><strong>Exam relevance:</strong> CV0-004 Domain 2.0 Deployment = 19% of the exam; 2.1 System requirements is its first objective, and its analysis feeds 2.2 (IaC), 2.3 (workload migrations) and 2.4 (resource provisioning). Official page: <a href="https://www.comptia.org/en-us/certifications/cloud" target="_blank" rel="noopener">comptia.org/cloud</a> (opens in a new tab).</div>`}]},

{ id:'glossary', group:'Reference', name:'Glossary', tag:'23 terms', icon:'glossary',
  tabs:[{id:'terms', label:'Terms', render:()=> '<dl>'+GLOSSARY.map(g=>'<dt id="'+g.id+'" style="font-weight:700;margin-top:10px">'+g.t+'</dt><dd style="margin:2px 0 0">'+g.d+'</dd>').join('')+'</dl>'}]},

{ id:'debrief', group:'Reference', name:'Debrief', tag:'Field notes', icon:'debrief',
  tabs:[{id:'notes', label:'Notes', render:()=> `
    <h3>Before you sign off \u2014 the reviewer\u2019s checklist</h3>
    ${P('These are the \u201cdetection opportunities\u201d of requirements analysis: where a missing or wrong requirement hides, and which evidence source exposes it.')}
    <ul class="tight">
      <li><strong>Telemetry</strong> \u2192 size from p95 + \u2265 25% headroom, never from averages or single peaks.</li>
      <li><strong>Dependency map</strong> \u2192 every chatty pair has a round-trip budget; verify placement against it.</li>
      <li><strong>Inventory &amp; lifecycle</strong> \u2192 OS support dates, hypervisor/image compatibility, device links.</li>
      <li><strong>Licensing memo</strong> \u2192 BYOL terms can double virtual cores; compare with managed editions.</li>
      <li><strong>Data profile</strong> \u2192 volumes summed <em>with exclusions</em> (retiring/retained workloads do not transfer).</li>
      <li><strong>Compliance memo</strong> \u2192 residency pinning + mandated controls, per regulated dataset.</li>
      <li><strong>Draft dossier</strong> \u2192 audit for the missing three: rollback, growth/headroom, network budget.</li>
      <li><strong>Ticket history</strong> \u2192 separate live risks from closed false alarms before they burn analysis time.</li>
    </ul>
    <h3>Requirement \u2192 typical control</h3>
    <table class="rule"><tr><th>Requirement found</th><th>Typical control</th></tr>
    <tr><td>Episodic peaks (3\u00d7/year)</td><td>Autoscaling group sized to p95 baseline</td></tr>
    <tr><td>97% cold data + 12 h retrieval SLA</td><td>Archive storage tier</td></tr>
    <tr><td>Per-core license doubles on vCPUs</td><td>Provider-managed edition (or renegotiated BYOL)</td></tr>
    <tr><td>Chatty pair, 15 ms budget</td><td>Same region + same AZ placement</td></tr>
    <tr><td>EU PII residency</td><td>Region pin + encryption at rest/in transit + SSO/MFA</td></tr>
    <tr><td>12 TB over a constrained link</td><td>Staged pre-seed in nightly windows</td></tr>
    <tr><td>EOL OS + owner decommission plan</td><td>Retire instead of migrate</td></tr>
    <tr><td>8 ms serial-link budget, cloud RTT 34 ms</td><td>Retain on-prem until the dependency retires</td></tr></table>
    <h3>Exam-day takeaways (CV0-004)</h3>
    <ul class="tight">
      <li>Expect performance-based questions that make you <em>enter values and order steps</em> \u2014 exactly what this room\u2019s spec sheets and wave planner rehearse.</li>
      <li>Method selection is a factors question: downtime, dependencies, compatibility, performance, data integrity, cost, rollback.</li>
      <li>2.1 is the feeder objective for 2.2 (IaC), 2.3 (workload migrations) and 2.4 (provisioning) \u2014 questions often bundle them.</li>
    </ul>
    <h3>Practitioner takeaways</h3>
    <div class="cols2">
      <div class="ok"><strong>What good looks like</strong><ul class="tight">
      <li>Every requirement traced to evidence (a metric, a memo, a policy).</li>
      <li>Exclusions stated in the volume math.</li>
      <li>Rollback defined before cutover, per workload.</li>
      <li>Budget gate treated as a test, run against the final design.</li></ul></div>
      <div class="danger"><strong>What trips teams up</strong><ul class="tight">
      <li>Sizing from averages; getting surprised by p95.</li>
      <li>Chasing closed tickets instead of live risks.</li>
      <li>Encryption mistaken for residency compliance.</li>
      <li>Migrating an asset the owner already planned to retire.</li></ul></div>
    </div>
    <p class="small">Accuracy note: this lesson is deployment/requirements material \u2014 no MITRE ATT&amp;CK IDs apply to it, so none are used. Sources: CompTIA Cloud+ certification pages; CV0-004 domain breakdowns (certempire.com, pocketprep.com). Official objectives PDF: <a href="https://partners.comptia.org/docs/default-source/resources/comptia-cloud-cv0-004-exam-objectives.pdf" target="_blank" rel="noopener">partners.comptia.org</a> (login-gated).</p>`}]},

{ id:'quiz', group:'Reference', name:'Exam Drill', tag:'Knowledge check', icon:'quiz',
  tabs:[{id:'drill', label:'Drill', render:()=> '' /* rendered by engine per mode */}]},

/* ---------- WORKLOADS ---------- */
{ id:'ledgerdb', group:'Workloads', name:'LedgerDB', tag:'Transactional database', icon:'ledgerdb',
  tabs:[
    {id:'telemetry', label:'Telemetry', render:()=> `
      <h3>LedgerDB \u2014 30-day telemetry <span class="qmeta">host: ledgdb-prod-01 \u00b7 8 vCPU / 64 GB</span></h3>
      <div class="cols3">
        ${statCard('CPU \u00b7 average','18%','of 8 vCPU')}${statCard('CPU \u00b7 p95','41%','= 3.3 vCPU')}${statCard('RAM \u00b7 p95','88%','= 56.3 of 64 GB')}
        ${statCard('Disk IOPS \u00b7 average','4,200','read-heavy 60/40')}${statCard('Disk IOPS \u00b7 p95','11,800','\u00d71.25 \u2192 14,750')}${statCard('Data volume','1.8 TB','DB + local staging')}
      </div>
      <h4>24-hour CPU curve</h4>
      ${curveSVG(CPU_DB)}
      <div class="warn"><strong>Anomaly flag \u2014 read before sizing:</strong> CPU hits 96% every Saturday 01:00\u201301:40. Ticket <code>#4192</code> (closed): scheduled antivirus full scan, recurring <em>by design</em>. It is not part of the workload\u2019s baseline.</div>
      <div class="callout"><strong>Sizing policy (engagement standard):</strong> size to p95 of the current host, then add \u2265 25% headroom, then round <em>up</em> to the next catalog shape. The catalog lives in the Budget Gate folder.</div>`},
    {id:'inventory', label:'Inventory', render:()=> `
      <h3>LedgerDB \u2014 inventory &amp; DR requirement</h3>
      <table class="rule"><tr><th>Item</th><th>Value</th></tr>
        <tr><td>Engine</td><td>AurumDB Enterprise 12.2 (commercial)</td></tr>
        <tr><td>Host</td><td>VM ledgdb-prod-01, 8 vCPU / 64 GB, VMware 6.7 (VMDK \u2014 Nimbus supports import)</td></tr>
        <tr><td>Data volume</td><td>1.8 TB</td></tr>
        <tr><td>DR requirement (DBA team)</td><td><strong>RTO 4 h \u00b7 RPO 15 min</strong></td></tr>
        <tr><td>Placement constraint</td><td>Must sit within the 15 ms round-trip budget of Storefront Web (see Dependencies)</td></tr></table>
      <div class="quote">\u201cAurumDB Enterprise is licensed <strong>per core</strong>. On virtualized hosts, <strong>each vCPU counts as two licensed cores</strong> ($180 per licensed core per month). The Nimbus <em>Managed AurumDB</em> edition includes licensing for a flat $74/mo service uplift.\u201d \u2014 licensing memo, 12 May</div>
      <h4>Interpret the DR requirement</h4>
      <fieldset><legend class="small">Which reading matches \u201cRTO 4 h, RPO 15 min\u201d?</legend>
        ${radio('env.rto','r-ok','Restore service within 4 h of failure; tolerate at most 15 min of lost transactions.','',S.env.rto)}
        ${radio('env.rto','r-a','Back up every 4 h; restore fully within 15 min.','',S.env.rto)}
        ${radio('env.rto','r-b','Keep 4 h of backup copies; test recovery every 15 min.','',S.env.rto)}
        ${radio('env.rto','r-c','Recovery takes 15 min; up to 4 h of data may be lost.','',S.env.rto)}
      </fieldset>`},
    {id:'deps', label:'Dependencies', render:()=> `
      <h3>LedgerDB \u2014 dependency map</h3>
      <table class="rule"><tr><th>Relationship</th><th>Load</th><th>Latency</th></tr>
        <tr><td>Storefront Web \u2192 LedgerDB</td><td>840 queries/s (avg)</td><td>app-visible p95 <strong>11 ms</strong>; budget <strong>15 ms</strong></td></tr>
        <tr><td>same region, different AZ (under load)</td><td>\u2014</td><td>p95 <strong>16 ms \u2014 breaches budget</strong></td></tr>
        <tr><td>same region, same AZ</td><td>\u2014</td><td>p95 <strong>11 ms \u2014 meets budget</strong></td></tr>
        <tr><td>cross-region (measured RTT \u2014 round-trip time)</td><td>\u2014</td><td><strong>34 ms \u2014 hopeless</strong></td></tr>
        <tr><td>Reports Server \u2192 nightly extract</td><td>40 GB, 22:00\u201301:00</td><td>batch \u2014 tolerant; dies when BI SaaS lands</td></tr></table>
      <div class="callout"><strong>${'Data gravity'}:</strong> at 840 queries/s, LedgerDB pulls Storefront toward it \u2014 the pair\u2019s placement is one decision, not two.</div>`},
    {id:'spec', label:'Spec Sheet', render:()=> `
      <h3>LedgerDB \u2014 specification sheet <span class="qmeta">draft 1.0 \u00b7 fill every blank</span></h3>
      <div class="specrow"><label for="f-inst">Target instance</label>
        <select id="f-inst" data-f="env.spec.ledgerdb.instance">${selOptions(INSTANCES,S.env.spec.ledgerdb.instance)}</select>
        <span class="why">Policy: p95 CPU 3.3 vCPU, p95 RAM 56.3 GB \u2192 +25% headroom \u2192 \u2265 4.1 vCPU / \u2265 70.4 GB.</span></div>
      <div class="specrow"><label for="f-stor">Storage tier</label>
        <select id="f-stor" data-f="env.spec.ledgerdb.storage">${selOptions(TIERS.filter(t=>['std-ssd','perf-io'].includes(t.id)),S.env.spec.ledgerdb.storage)}</select>
        <span class="why">Transactional volume: p95 11,800 IOPS \u00d7 1.25 \u2248 14,750 IOPS required.</span></div>
      <div class="specrow"><label for="f-lic">Licensing approach</label>
        <select id="f-lic" data-f="env.spec.ledgerdb.licensing">
          ${opt('','\u2014 choose \u2014',S.env.spec.ledgerdb.licensing)}
          ${opt('byol','BYOL \u2014 per-core license ($180 \u00d7 2 \u00d7 vCPUs)',S.env.spec.ledgerdb.licensing)}
          ${opt('managed','Nimbus Managed AurumDB (+$74/mo, licenses included)',S.env.spec.ledgerdb.licensing)}
          ${opt('defer','Defer licensing decision to phase 2',S.env.spec.ledgerdb.licensing)}
        </select>
        <span class="why">16 vCPU under BYOL = 32 licensed cores = $5,760/mo. See the licensing memo in Inventory.</span></div>
      <div class="specrow"><label for="f-place">Placement vs Storefront</label>
        <select id="f-place" data-f="env.spec.ledgerdb.placement">
          ${opt('','\u2014 choose \u2014',S.env.spec.ledgerdb.placement)}
          ${opt('colocate','Same region + same AZ as Storefront Web',S.env.spec.ledgerdb.placement)}
          ${opt('crossaz','Same region, different AZ',S.env.spec.ledgerdb.placement)}
          ${opt('crossregion','Different region (blast-radius separation)',S.env.spec.ledgerdb.placement)}
        </select>
        <span class="why">Chatty pair: 840 q/s against a 15 ms round-trip budget.</span></div>
      <div class="specrow"><label for="f-win">Transfer window</label>
        <select id="f-win" data-f="env.spec.ledgerdb.window">
          ${opt('','\u2014 choose \u2014',S.env.spec.ledgerdb.window)}
          ${opt('nightly','Nightly 4 h reserved migration window',S.env.spec.ledgerdb.window)}
          ${opt('daytime','Daytime, shared with production replication',S.env.spec.ledgerdb.window)}
          ${opt('adhoc','Ad hoc, no reservation',S.env.spec.ledgerdb.window)}
        </select>
        <span class="why">1.8 TB \u2248 5.7 h of link time \u2014 the window must actually fit it.</span></div>`}
  ]},

{ id:'webapp', group:'Workloads', name:'Storefront Web', tag:'3-tier web app', icon:'webapp',
  tabs:[
    {id:'telemetry', label:'Telemetry', render:()=> `
      <h3>Storefront Web \u2014 30-day telemetry <span class="qmeta">per server: store-web-01/02 \u00b7 4 vCPU / 16 GB each</span></h3>
      <div class="cols3">
        ${statCard('CPU \u00b7 average','12%','per server')}${statCard('CPU \u00b7 p95','34%','= 1.4 vCPU')}${statCard('CPU \u00b7 absolute peak','91%','flash sales only')}
        ${statCard('RAM \u00b7 p95','38%','= 6.1 of 16 GB')}${statCard('Flash-sale peaks','3 / yr','&lt; 45 min each')}${statCard('Data volume','0.45 TB','app + logs')}
      </div>
      ${curveSVG(CPU_WA)}
      <div class="callout"><strong>Episodic vs sustained:</strong> the 91% peaks happen three times a year and last under 45 minutes (Black Friday, post-Christmas, spring promo). Sizing hardware for them means paying for idle capacity 8,760 hours to cover 135 minutes.</div>
      <div class="quote">\u201cNimbus autoscaling groups can scale on CPU &gt; 60% (5-minute average); new instances boot in ~90 s; a flash-sale traffic ramp develops over ~4 minutes \u2014 scale-out stays ahead of it.\u201d \u2014 Nimbus Compute Guide, \u00a7 7.2</div>`},
    {id:'inventory', label:'Inventory', render:()=> `
      <h3>Storefront Web \u2014 inventory</h3>
      <table class="rule"><tr><th>Item</th><th>Value</th></tr>
        <tr><td>Servers</td><td>2 \u00d7 store-web-01/02 behind a load balancer</td></tr>
        <tr><td>Per server</td><td>4 vCPU / 16 GB, Windows Server 2019 Standard</td></tr>
        <tr><td>OS support</td><td>Extended support ends Jan 2029 \u2014 <strong>supported, not a blocker</strong></td></tr>
        <tr><td>Application</td><td>Storefront 5.4 (stateless app tier)</td></tr>
        <tr><td>Data volume</td><td>0.45 TB (application + logs)</td></tr></table>`},
    {id:'deps', label:'Dependencies', render:()=> `
      <h3>Storefront Web \u2014 dependency map</h3>
      <table class="rule"><tr><th>Relationship</th><th>Detail</th></tr>
        <tr><td>\u2192 LedgerDB</td><td>840 q/s avg \u00b7 15 ms round-trip budget \u00b7 placement decided on LedgerDB\u2019s spec sheet</td></tr>
        <tr><td>\u2192 corporate IdP</td><td>staff SSO for admin functions</td></tr>
        <tr><td>\u2190 customers</td><td>via load balancer; DNS switch planned at cutover</td></tr></table>
      ${P('Stateless app tier \u2014 no session affinity constraints. The binding dependency is LedgerDB; its placement field drives this workload\u2019s network requirements.')}
      <div class="ok"><strong>Next affordance:</strong> open <em>LedgerDB \u2192 Spec Sheet</em> and set the placement field; then fill this workload\u2019s compute plan below in its own Spec tab.</div>`},
    {id:'spec', label:'Spec Sheet', render:()=> `
      <h3>Storefront Web \u2014 specification sheet <span class="qmeta">draft 1.0</span></h3>
      <div class="specrow"><label for="f-comp">Compute plan</label>
        <select id="f-comp" data-f="env.spec.webapp.compute">
          ${opt('','\u2014 choose \u2014',S.env.spec.webapp.compute)}
          ${opt('fixed4','2 \u00d7 n-standard-4 (fixed \u2014 today\u2019s shape)',S.env.spec.webapp.compute)}
          ${opt('memxl','1 \u00d7 n-mem-16XL (fixed)',S.env.spec.webapp.compute)}
          ${opt('asg','Autoscale group: n-standard-2 \u00b7 min 2 / max 6 \u00b7 scale at CPU &gt; 60% (5-min)',S.env.spec.webapp.compute)}
          ${opt('fixed8','2 \u00d7 n-standard-8 (fixed \u2014 sized to the 91% peak)',S.env.spec.webapp.compute)}
        </select>
        <span class="why">p95 CPU 1.4 vCPU &amp; RAM 6.1 GB per server \u2192 n-standard-2 fits the baseline; the 91% peaks are episodic (see Telemetry).</span></div>
      ${P('Other fields (owner, cutover window, DNS plan, smoke tests) are drafted in <em>Draft Audit \u2192 Storefront draft</em> \u2014 audit that sheet against this one.')}
      <div class="docnote">Reminder: the rollback, growth-projection and network-budget lines for this workload are checked in the Draft Audit folder.</div>`}
  ]},

{ id:'archive', group:'Workloads', name:'Media Archive', tag:'File store \u00b7 12 TB', icon:'archive',
  tabs:[
    {id:'profile', label:'Data Profile', render:()=> `
      <h3>Media Archive \u2014 data profile</h3>
      ${P('The source is a ' + term('g-nas','NAS (network-attached storage)') + ' appliance, archive-nas-01, exported over SMB \u2014 see the Glossary for the term.')}
      <div class="cols3">
        ${statCard('Volume used','12.0 TB','NAS archive-nas-01')}${statCard('Untouched 90 days','97%','of files')}${statCard('Growth','+0.8 TB/yr','')}
      </div>
      <h4>90-day access heat map (darker = touched)</h4>
      ${heatGrid()}
      <div class="quote">\u201cArchival retrievals within 12 hours are acceptable. Finance wants the lowest storage cost that still meets that SLA.\u201d \u2014 business memo, 3 June</div>
      <div class="warn"><strong>Anomaly flag:</strong> monitoring digest shows \u201c17 failed backup jobs \u2014 archive-nas-01\u201d. Ticket <code>#2107</code>, <strong>closed two years ago</strong>: the job moved to the new array. No current impact \u2014 do not spend migration time on it.</div>`},
    {id:'spec', label:'Spec Sheet', render:()=> `
      <h3>Media Archive \u2014 specification sheet <span class="qmeta">draft 1.0</span></h3>
      <div class="specrow"><label for="f-tier">Target storage tier</label>
        <select id="f-tier" data-f="env.spec.archive.tier">${selOptions(TIERS,S.env.spec.archive.tier)}</select>
        <span class="why">97% cold + \u201cretrievable within 12 h\u201d \u2192 match the tier to the access pattern, not to the old NAS\u2019s speed. 12 TB \u00d7 tier price = monthly cost.</span></div>
      ${P('Transfer math for the 12 TB seed lives in the <em>Bandwidth Ledger</em>.')}
      <div class="docnote">Simplified: per-file retrieval fees and early-deletion penalties are out of scope for this exercise.</div>`}
  ]},

{ id:'payroll', group:'Workloads', name:'HR Payroll', tag:'Regulated workload', icon:'payroll',
  tabs:[
    {id:'inventory', label:'Inventory', render:()=> `
      <h3>HR Payroll \u2014 inventory</h3>
      <div class="cols3">
        ${statCard('CPU \u00b7 p95','22%','of 2 vCPU')}${statCard('RAM \u00b7 p95','55%','= 4.4 of 8 GB')}${statCard('Data volume','0.2 TB','incl. 3,400 employee records')}
      </div>
      <table class="rule"><tr><th>Item</th><th>Value</th></tr>
        <tr><td>VMs</td><td>payroll-app-01 + payrolldb-01 \u00b7 2 vCPU / 8 GB each \u00b7 Windows Server 2022</td></tr>
        <tr><td>DR requirement</td><td>RTO 8 h \u00b7 RPO 1 h (monthly run + off-cycle runs feasible)</td></tr></table>
      <h4>Compliance memo (HR &amp; Legal)</h4>
      <div class="quote">\u201cPayroll data is EU-resident PII: it <strong>must remain in an EU region</strong>. Required controls: encryption at rest (AES-256), TLS 1.2+ in transit, access only via the corporate IdP with SSO + MFA, audit logs kept 12 months, quarterly access review.\u201d</div>`},
    {id:'deps', label:'Dependencies', render:()=> `
      <h3>HR Payroll \u2014 dependency map</h3>
      <table class="rule"><tr><th>Relationship</th><th>Detail</th></tr>
        <tr><td>\u2192 corporate IdP (meridian.auth)</td><td>SSO + MFA; reachable <strong>only via the private WAN link</strong> \u2014 public IdP endpoints are blocked by policy</td></tr>
        <tr><td>\u2190 HR operators</td><td>monthly run + off-cycle adjustments</td></tr></table>
      ${P('No dependency on Storefront or LedgerDB \u2014 payroll waves independently, gated by compliance sign-off (see Wave Planner).')}`},
    {id:'spec', label:'Spec Sheet', render:()=> `
      <h3>HR Payroll \u2014 specification sheet <span class="qmeta">draft 1.0</span></h3>
      <div class="specrow"><label for="f-region">Target region</label>
        <select id="f-region" data-f="env.spec.payroll.region">
          ${opt('','\u2014 choose \u2014',S.env.spec.payroll.region)}
          ${opt('us-central','Nimbus us-central (Iowa)',S.env.spec.payroll.region)}
          ${opt('us-west','Nimbus us-west (Oregon)',S.env.spec.payroll.region)}
          ${opt('eu','Nimbus eu-north (Amsterdam)',S.env.spec.payroll.region)}
        </select>
        <span class="why">Residency is a legal constraint on data location \u2014 see the compliance memo.</span></div>
      <h4>Required controls <span class="qmeta">\u2014 tick exactly the three the memo mandates</span></h4>
      <fieldset>
        ${checkbox('spec.payroll.controls','encrypt','Encryption at rest (AES-256) on app + DB volumes','',S.env.spec.payroll.controls.includes('encrypt'))}
        ${checkbox('spec.payroll.controls','tls','TLS 1.2+ for all connections in transit','',S.env.spec.payroll.controls.includes('tls'))}
        ${checkbox('spec.payroll.controls','sso','SSO + MFA via corporate IdP over the private link','',S.env.spec.payroll.controls.includes('sso'))}
        ${checkbox('spec.payroll.controls','pubip','Public IP on the payroll VMs so HR can connect directly','',S.env.spec.payroll.controls.includes('pubip'))}
        ${checkbox('spec.payroll.controls','shared','One shared admin account for the payroll team','',S.env.spec.payroll.controls.includes('shared'))}
        ${checkbox('spec.payroll.controls','noaudit','Disable audit logging to save storage','',S.env.spec.payroll.controls.includes('noaudit'))}
      </fieldset>
      <div class="docnote">Compute sizing note (for the ledger): p95 CPU 22% and RAM 4.4 GB + 25% headroom fit the smallest shape, n-standard-2 \u2014 already reflected in the Budget Gate.</div>`}
  ]},

{ id:'reports', group:'Workloads', name:'Reports Server', tag:'Legacy \u00b7 EOL OS', icon:'reports',
  tabs:[
    {id:'inventory', label:'Inventory', render:()=> `
      <h3>Reports Server \u2014 inventory</h3>
      <div class="danger"><strong>OS lifecycle:</strong> Windows Server 2012 R2 \u2014 extended support ended <strong>October 2023</strong>. No security patches. Any migration plan that upgrades and moves it spends money on an asset with a decommission date.</div>
      <div class="cols3">
        ${statCard('CPU \u00b7 p95','3%','of 4 vCPU')}${statCard('RAM \u00b7 p95','21%','of 16 GB')}${statCard('Data volume','0.9 TB','report exports')}
      </div>
      <table class="rule"><tr><th>Item</th><th>Value</th></tr>
        <tr><td>Nightly batch</td><td>22:00\u201301:00 extract from LedgerDB (40 GB)</td></tr>
        <tr><td>Successor</td><td>BI SaaS platform, contracted for Q3</td></tr></table>
      <div class="quote">\u201cReports moves to the BI SaaS in Q3. Keep this box on life support until then \u2014 <strong>don\u2019t spend migration money on it</strong>.\u201d \u2014 D. Okafor, Finance Systems (owner), 5 June</div>`}
  ]},

{ id:'bom', group:'Workloads', name:'BOM Gateway', tag:'Mainframe link', icon:'bom',
  tabs:[
    {id:'inventory', label:'Inventory', render:()=> `
      <h3>BOM Gateway \u2014 inventory</h3>
      <table class="rule"><tr><th>Item</th><th>Value</th></tr>
        <tr><td>Device</td><td>physical appliance bom-gw-01 (not virtualized)</td></tr>
        <tr><td>Link</td><td>RS-422 serial to the manufacturing mainframe in Eastport DC</td></tr>
        <tr><td>Latency requirement</td><td><strong>\u2264 8 ms</strong> (controller timeout at 10 ms)</td></tr>
        <tr><td>Data volume</td><td>0.05 TB (config + state)</td></tr></table>
      <h4>Latency test log (3 June)</h4>
      <table class="rule"><tr><th>Path</th><th>Measured RTT</th><th>Verdict</th></tr>
        <tr><td>Eastport DC \u2192 mainframe (current)</td><td class="num">1.2 ms</td><td>meets 8 ms</td></tr>
        <tr><td>Nimbus us-central \u2192 mainframe</td><td class="num">34 ms</td><td class="num"><strong>fails \u2014 4\u00d7 over budget</strong></td></tr></table>
      <div class="callout"><strong>Verdict:</strong> no Nimbus region meets an 8 ms budget to a mainframe that only exists in Eastport DC. The gateway cannot migrate \u2014 it is a candidate to <em>retain</em> until the mainframe decommissions (2027).</div>`}
  ]},

/* ---------- PLANNING SHEETS ---------- */
{ id:'cards', group:'Planning sheets', name:'Requirement Sorter', tag:'Exercise', icon:'cards',
  tabs:[{id:'sort', label:'Sort', render:()=> `
    <h3>Sort the requirements</h3>
    ${P('Classify each statement: <strong>Business</strong> (organizational constraints), <strong>Functional</strong> (what it must do), or <strong>Non-functional</strong> (how well it must do it).')}
    ${REQ_CARDS.map(c=>`<div class="ev"><div class="ev-t">Statement ${c.id.toUpperCase()}</div>${c.txt}
      <div class="flexrow" style="margin-top:6px">
        ${['business','functional','nonfn'].map(k=>'<label class="choice" style="margin:0;flex:1;min-width:130px"><input type="radio" name="env.classify.'+c.id+'" value="'+k+'" data-f="env.classify.'+c.id+'"'+(S.env.classify[c.id]===k?' checked':'')+'><span>'+REQ_CLASSES[k]+'</span></label>').join('')}
      </div></div>`).join('')}`}]},

{ id:'transfer', group:'Planning sheets', name:'Bandwidth Ledger', tag:'Transfer math', icon:'transfer',
  tabs:[{id:'ledger', label:'Ledger', render:()=> `
    <h3>Bandwidth Ledger</h3>
    <div class="callout"><strong>Conventions (stated, simplified):</strong> 1 Gbps circuit \u00d7 70% usable = 700 Mbps = 87.5 MB/s \u00b7 decimal units (1 TB = 1,000,000 MB) \u00b7 nightly migration window 02:00\u201306:00 = <strong>4 h</strong> \u00b7 lease ends June 30 (T-21 days today).<br>Equation: <code>hours \u2248 TB \u00d7 3.17</code></div>
    <h4>Fleet volumes \u2014 what actually migrates</h4>
    <table class="rule"><tr><th>Workload</th><th class="num">TB</th><th>Migrates?</th></tr>
      ${FLEET.map(f=>'<tr><td>'+f.name+'</td><td class="num">'+f.tb.toFixed(2)+'</td><td>'+(f.migrating?'yes':(f.note||'no')+' \u2014 excluded')+'</td></tr>').join('')}
      <tr><td><strong>Total to transfer</strong></td><td class="num"><strong id="fleettotal">?</strong></td><td>fill the fleet block below</td></tr></table>
    <h4>Block A \u2014 Media Archive seed (12.0 TB)</h4>
    <div class="specrow"><label for="f-ah">Hours on the link</label><input type="number" id="f-ah" step="0.1" min="0" data-f="env.calc.archiveHours" value="${S.env.calc.archiveHours}" placeholder="e.g. 38.1"><span class="why">12 TB \u00f7 usable bandwidth \u2014 compute, don\u2019t guess.</span></div>
    <div class="specrow"><label for="f-an">Nights needed (4 h each)</label><input type="number" id="f-an" step="1" min="0" data-f="env.calc.archiveNights" value="${S.env.calc.archiveNights}" placeholder="e.g. 10"><span class="why">Round up \u2014 a partial night is still a night.</span></div>
    <h4>Block B \u2014 whole fleet (migrating workloads only)</h4>
    <div class="specrow"><label for="f-fv">Total volume (TB)</label><input type="number" id="f-fv" step="0.01" min="0" data-f="env.calc.fleetVolume" value="${S.env.calc.fleetVolume}" placeholder="e.g. 14.45"><span class="why">Sum the migrating rows only.</span></div>
    <div class="specrow"><label for="f-fh">Hours on the link</label><input type="number" id="f-fh" step="0.1" min="0" data-f="env.calc.fleetHours" value="${S.env.calc.fleetHours}" placeholder="e.g. 45.9"><span class="why"></span></div>
    <div class="specrow"><label for="f-fn">Nights needed (4 h each)</label><input type="number" id="f-fn" step="1" min="0" data-f="env.calc.fleetNights" value="${S.env.calc.fleetNights}" placeholder="e.g. 12"><span class="why"></span></div>`}]},

{ id:'scan', group:'Planning sheets', name:'Compatibility Scan', tag:'Blockers & noise', icon:'scan',
  tabs:[
    {id:'blockers', label:'Blockers', render:()=> `
      <h3>Compatibility scan \u2014 findings</h3>
      ${P('The scanner aggregated five findings from inventory, licensing and dependency evidence. <strong>Tick the findings that are true migration blockers</strong> (would force a design change or veto the move).')}
      ${checkbox('blockers','B1','AurumDB per-core license: each vCPU counts as two licensed cores \u2014 BYOL on a 16-vCPU host = 32 licensed cores ($5,760/mo)','',S.env.blockers.includes('B1'))}
      ${checkbox('blockers','B2','Storefront\u2194LedgerDB needs p95 \u2264 15 ms; measured cross-region RTT is 34 ms','',S.env.blockers.includes('B2'))}
      ${checkbox('blockers','B3','LedgerDB runs on VMware 6.7; Nimbus accepts VMDK (VMware disk image) imports','',S.env.blockers.includes('B3'))}
      ${checkbox('blockers','B4','Storefront runs Windows Server 2019, supported through Jan 2029','',S.env.blockers.includes('B4'))}
      ${checkbox('blockers','B5','Archive NAS exposes SMB 3.0 shares; Nimbus Storage supports SMB 3.0','',S.env.blockers.includes('B5'))}`},
    {id:'anomalies', label:'False alarms', render:()=> `
      <h3>Anomaly digest \u2014 triage</h3>
      ${P('Five anomalies surfaced across the monitoring digest and ticket history. <strong>Exactly two are false alarms</strong> that should NOT drive migration decisions \u2014 tick those two.')}
      ${checkbox('anomalies','A1','LedgerDB CPU 96% every Saturday 01:00\u201301:40','',S.env.anomalies.includes('A1'))}
      ${checkbox('anomalies','A2','\u201c17 failed backup jobs\u201d on archive-nas-01 in the monitoring digest','',S.env.anomalies.includes('A2'))}
      ${checkbox('anomalies','A3','Per-core licensing doubles the DB license under BYOL','',S.env.anomalies.includes('A3'))}
      ${checkbox('anomalies','A4','Cross-region RTT 34 ms vs the 15 ms dependency budget','',S.env.anomalies.includes('A4'))}
      ${checkbox('anomalies','A5','Windows Server 2012 R2 EOL on the Reports Server','',S.env.anomalies.includes('A5'))}
      <div class="docnote">Evidence sources: LedgerDB Telemetry (ticket #4192), Media Archive Data Profile (ticket #2107), licensing memo, dependency map, Reports inventory.</div>`}
  ]},

{ id:'audit', group:'Planning sheets', name:'Draft Audit', tag:'Gap hunting', icon:'audit',
  tabs:[
    {id:'webdraft', label:'Storefront draft', render:()=> `
      <h3>Spec sheet, Storefront Web \u2014 Draft v0.9 (received from the web team)</h3>
      <div class="ev"><div class="ev-t">Draft contents</div>
        <ul class="tight">
          <li>Owner: A. Reyes, Web team</li>
          <li>Cutover window: Sunday 02:00\u201306:00</li>
          <li>Data volume: 0.45 TB</li>
          <li>DNS switch at the load balancer</li>
          <li>Smoke-test plan: checkout + search</li>
          <li>Compute plan: ASG n-standard-2 (2\u20136)</li>
          <li>Source shutdown: after June validation</li>
        </ul></div>
      ${P('<strong>Audit it:</strong> tick every requirement below that is <strong>missing</strong> from Draft v0.9. <em>Three are missing.</em>')}
      ${checkbox('gaps','present1','Named owner (A. Reyes)','in the draft',S.env.gaps.includes('present1'))}
      ${checkbox('gaps','present2','Cutover window (Sun 02:00\u201306:00)','in the draft',S.env.gaps.includes('present2'))}
      ${checkbox('gaps','present3','Data volume (0.45 TB)','in the draft',S.env.gaps.includes('present3'))}
      ${checkbox('gaps','present4','DNS switch plan','in the draft',S.env.gaps.includes('present4'))}
      ${checkbox('gaps','present5','Smoke-test plan','in the draft',S.env.gaps.includes('present5'))}
      ${checkbox('gaps','present6','Compute plan (ASG 2\u20136)','in the draft',S.env.gaps.includes('present6'))}
      ${checkbox('gaps','present7','Source shutdown date','in the draft',S.env.gaps.includes('present7'))}
      ${checkbox('gaps','gap-rollback','Rollback plan (way back if validation fails)','',S.env.gaps.includes('gap-rollback'))}
      ${checkbox('gaps','gap-growth','Growth / headroom projection','',S.env.gaps.includes('gap-growth'))}
      ${checkbox('gaps','gap-network','Network latency / bandwidth requirement','',S.env.gaps.includes('gap-network'))}`},
    {id:'fleetdraft', label:'Fleet dossier draft', render:()=> `
      <h3>Requirements Dossier v0.9 \u2014 fleet level (pre-review)</h3>
      <div class="ev"><div class="ev-t">Sections present in v0.9</div>
        <ul class="tight">
          <li>Workload inventory (6 systems)</li>
          <li>Baseline summary (p95 table per workload)</li>
          <li>Dependency map</li>
          <li>Budget cap memo ($1,380/mo)</li>
          <li>DNS cutover plan</li>
          <li>Smoke-test plan (checkout, search)</li>
          <li>Vendor marketing brochure (attached by the provider)</li>
        </ul></div>
      ${P('<strong>Pre-review audit:</strong> tick every requirement below that is <strong>missing</strong> from the fleet dossier. <em>Four are missing.</em>')}
      ${checkbox('gapsFleet','fpresent1','Workload inventory','present',S.env.gapsFleet.includes('fpresent1'))}
      ${checkbox('gapsFleet','fpresent2','Baseline summary','present',S.env.gapsFleet.includes('fpresent2'))}
      ${checkbox('gapsFleet','fpresent3','Dependency map','present',S.env.gapsFleet.includes('fpresent3'))}
      ${checkbox('gapsFleet','fpresent4','Budget cap memo','present',S.env.gapsFleet.includes('fpresent4'))}
      ${checkbox('gapsFleet','fpresent5','DNS cutover plan','present',S.env.gapsFleet.includes('fpresent5'))}
      ${checkbox('gapsFleet','fgap-rto','Per-workload RTO/RPO statements','',S.env.gapsFleet.includes('fgap-rto'))}
      ${checkbox('gapsFleet','fgap-rollback','Rollback plans per workload','',S.env.gapsFleet.includes('fgap-rollback'))}
      ${checkbox('gapsFleet','fgap-growth','Growth / headroom projections','',S.env.gapsFleet.includes('fgap-growth'))}
      ${checkbox('gapsFleet','fgap-accept','Acceptance criteria (\u201cdefinition of done\u201d per workload)','',S.env.gapsFleet.includes('fgap-accept'))}
      ${checkbox('gapsFleet','fgap-brochure','Vendor marketing brochure','present (not a requirement)',S.env.gapsFleet.includes('fgap-brochure'))}`}
  ]},

{ id:'sizing', group:'Planning sheets', name:'Sizing Review', tag:'Verdicts', icon:'sizing',
  tabs:[{id:'review', label:'Review', render:()=> `
    <h3>Sizing review \u2014 Storefront Web proposals</h3>
    ${P('Three proposals reached your desk. Mark each <strong>accept</strong> or <strong>reject</strong>. Ground truth: per server, p95 CPU is 34% of 4 vCPU (1.4 vCPU), p95 RAM 6.1 GB; the 91% peaks are 3 flash sales a year, &lt; 45 min each; ASG boot \u2248 90 s, sale ramp \u2248 4 min; policy: p95 + \u2265 25% headroom.')}
    <div class="ev"><div class="ev-t">Proposal 1</div>\u201c4 \u00d7 n-standard-8, fixed \u2014 size for the 91% flash-sale peak.\u201d
      <div class="flexrow" style="margin-top:6px">${radio('env.sizing.p1','bad','Reject','',S.env.sizing.p1)}${radio('env.sizing.p1','ok','Accept','',S.env.sizing.p1)}</div></div>
    <div class="ev"><div class="ev-t">Proposal 2</div>\u201c1 \u00d7 n-standard-2, fixed \u2014 average CPU is only 12%.\u201d
      <div class="flexrow" style="margin-top:6px">${radio('env.sizing.p2','bad','Reject','',S.env.sizing.p2)}${radio('env.sizing.p2','ok','Accept','',S.env.sizing.p2)}</div></div>
    <div class="ev"><div class="ev-t">Proposal 3</div>\u201cAutoscale group: n-standard-2, min 2 / max 6, scale at CPU &gt; 60% (5-min avg).\u201d
      <div class="flexrow" style="margin-top:6px">${radio('env.sizing.p3','bad','Reject','',S.env.sizing.p3)}${radio('env.sizing.p3','ok','Accept','',S.env.sizing.p3)}</div></div>`}]},

{ id:'strategy', group:'Planning sheets', name:'Strategy Board', tag:'The Six Rs', icon:'strategy',
  tabs:[{id:'six', label:'Board', render:()=> `
    <h3>Strategy board \u2014 one R per workload</h3>
    ${P('Assign the migration strategy each workload\u2019s evidence supports. Definitions are in the Field Manual and the Glossary \u2014 the board grades against those definitions.')}
    ${[['ledgerdb','LedgerDB \u00b7 commercial engine, license trap, 1.8 TB chatty core'],
       ['webapp','Storefront Web \u00b7 supported OS, stateless, episodic peaks'],
       ['archive','Media Archive \u00b7 12 TB cold files on an aging NAS'],
       ['payroll','HR Payroll \u00b7 small, regulated, private-link dependent'],
       ['reports','Reports Server \u00b7 EOL OS, 3% CPU, owner plans decommission'],
       ['bom','BOM Gateway \u00b7 8 ms serial link no cloud region can meet']].map(([id,desc])=>`
      <div class="specrow"><label for="f-str-${id}">${desc}</label>
        <select id="f-str-${id}" data-f="env.strategy.${id}">
          ${opt('','\u2014 choose an R \u2014',S.env.strategy[id])}
          ${opt('rehost','Rehost \u2014 move as-is',S.env.strategy[id])}
          ${opt('replatform','Replatform \u2014 minor targeted changes',S.env.strategy[id])}
          ${opt('refactor','Refactor \u2014 re-architect',S.env.strategy[id])}
          ${opt('repurchase','Repurchase \u2014 replace with a managed product',S.env.strategy[id])}
          ${opt('retire','Retire \u2014 decommission',S.env.strategy[id])}
          ${opt('retain','Retain \u2014 leave for now',S.env.strategy[id])}
        </select></div>`).join('')}
    <div class="docnote">Reminder: \u201cmanaged edition of the same engine\u201d is a minor targeted change \u2014 it is <em>not</em> buying a different product.</div>`}]},

{ id:'waves', group:'Planning sheets', name:'Wave Planner', tag:'Sequencing', icon:'waves',
  tabs:[{id:'plan', label:'Plan', render:()=> `
    <h3>Wave planner \u2014 start order</h3>
    ${P('Assign each workload a wave (or \u201cno wave\u201d). Waves execute in order; each night offers one 4-hour window. The deadline is June 30.')}
    ${FLEET.map(f=>`
      <div class="specrow"><label for="f-wave-${f.id}">${f.name} <span class="qmeta">${f.tb} TB${f.migrating?'':' \u00b7 '+f.note}</span></label>
        <select id="f-wave-${f.id}" data-f="env.waves.${f.id}">
          ${opt('','\u2014 assign \u2014',S.env.waves[f.id])}
          ${opt('w1','Wave 1 \u2014 first start',S.env.waves[f.id])}
          ${opt('w2','Wave 2',S.env.waves[f.id])}
          ${opt('w3','Wave 3',S.env.waves[f.id])}
          ${opt('w4','Wave 4',S.env.waves[f.id])}
          ${opt('none','No wave (not migrating)',S.env.waves[f.id])}
        </select></div>`).join('')}
    <h4>Gates</h4>
    <fieldset><legend class="small">What must happen before the HR Payroll wave starts?</legend>
      ${radio('env.gates.payroll','budget','CFO budget sign-off','',S.env.gates.payroll)}
      ${radio('env.gates.payroll','eu','EU residency compliance sign-off','',S.env.gates.payroll)}
      ${radio('env.gates.payroll','dns','DNS TTL reduction','',S.env.gates.payroll)}
    </fieldset>
    <fieldset><legend class="small">What must pass before the Storefront cutover completes?</legend>
      ${radio('env.gates.webapp','dbtest','LedgerDB validation test (app\u2194DB connectivity + latency)','',S.env.gates.webapp)}
      ${radio('env.gates.webapp','seed','Archive seed completion','',S.env.gates.webapp)}
      ${radio('env.gates.webapp','saas','BI SaaS contract signature','',S.env.gates.webapp)}
    </fieldset>`}]},

{ id:'budget', group:'Planning sheets', name:'Budget Gate', tag:'Cost requirement', icon:'budget',
  tabs:[{id:'sheet', label:'Gate', render:()=> renderBudgetSheet()}]},

{ id:'rollbacks', group:'Planning sheets', name:'Rollback Plans', tag:'Way back', icon:'rollbacks',
  tabs:[{id:'plan', label:'Plans', render:()=> `
    <h3>Rollback plans \u2014 defined before cutover</h3>
    ${P('Match each workload to the rollback strategy its evidence supports. One option per workload; the pool includes distractors.')}
    ${[['ledgerdb','LedgerDB'],['webapp','Storefront Web'],['archive','Media Archive'],['payroll','HR Payroll']].map(([id,name])=>`
      <div class="specrow"><label for="f-rb-${id}">${name}</label>
        <select id="f-rb-${id}" data-f="env.rollback.${id}">
          ${opt('','\u2014 assign \u2014',S.env.rollback[id])}
          ${opt('rb-none','No rollback \u2014 cloud becomes the source of truth at cutover',S.env.rollback[id])}
          ${opt('rb-db','Keep source read-only 30 days; stop replication at cutover; revert connection strings if validation fails',S.env.rollback[id])}
          ${opt('rb-dns','Lower DNS TTL to 60 s a week ahead; keep the on-prem load balancer warm for a blue/green revert (both environments run; traffic switches back)',S.env.rollback[id])}
          ${opt('rb-dual','Dual-run: seed once, then nightly delta syncs until final cutover',S.env.rollback[id])}
          ${opt('rb-parallel','Parallel run for two pay cycles; on-prem stays authoritative until sign-off',S.env.rollback[id])}
          ${opt('rb-old','Restore from last year\u2019s backup if anything breaks',S.env.rollback[id])}
          ${opt('rb-bb','Big-bang: decommission the source before validation to force success',S.env.rollback[id])}
        </select></div>`).join('')}`}
  ]}
];

/* --- Budget Gate live sheet (rendered + recomputed from spec state) --- */
function computeBudget(){
  const sp=S.env.spec;
  const inst=INSTANCES.find(i=>i.id===sp.ledgerdb.instance);
  const tier=TIERS.find(t=>t.id===sp.ledgerdb.storage);
  const lic=sp.ledgerdb.licensing;
  const dbLic = lic==='managed'?MANAGED_UPLIFT : lic==='byol'?BYOL_CORE*32 : 0;
  const archTier=TIERS.find(t=>t.id===sp.archive.tier);
  const web = sp.webapp.compute==='asg'?2*62 : sp.webapp.compute==='fixed4'?248 : sp.webapp.compute==='memxl'?968 : sp.webapp.compute==='fixed8'?496 : 0;
  const rows=[
    {n:'LedgerDB \u00b7 '+(inst?inst.id:'instance?'), v:(inst?inst.$:0)},
    {n:'LedgerDB \u00b7 '+(tier?tier.id:'storage?')+' (1.8 TB)', v:(tier?tier.$*1.8:0)},
    {n:'LedgerDB \u00b7 licensing '+(lic? '('+lic+')':'?'), v:dbLic},
    {n:'Storefront Web \u00b7 compute '+(sp.webapp.compute||'?'), v:web},
    {n:'Storefront Web \u00b7 std-ssd (0.45 TB)', v:0.45*18},
    {n:'HR Payroll \u00b7 n-standard-2 + std-ssd (0.2 TB)', v:62+0.2*18},
    {n:'Media Archive \u00b7 '+(archTier?archTier.id:'tier?')+' (12 TB)', v:(archTier?archTier.$*12:0)}
  ];
  const total=rows.reduce((a,r)=>a+r.v,0);
  return {rows,total,pass:total<=BUDGET_CAP && inst && tier && lic && archTier && sp.webapp.compute && total>0};
}
function renderBudgetSheet(){
  const b=computeBudget();
  return `<h3>Budget gate <span class="qmeta">CFO memo: monthly run-rate cap $${BUDGET_CAP} for these four workloads</span></h3>
  <table class="rule"><tr><th>Line item (from your spec sheets)</th><th class="num">$/mo</th></tr>
    ${b.rows.map(r=>'<tr><td>'+r.n+'</td><td class="num">'+r.v.toFixed(2)+'</td></tr>').join('')}
    <tr><td><strong>Total</strong></td><td class="num"><strong>${b.total.toFixed(2)}</strong></td></tr></table>
  <div class="${b.total<=BUDGET_CAP?'ok':'danger'}"><strong>Cap $${BUDGET_CAP}:</strong> ${b.total===0?'fill the spec sheets to price the design.':(b.total<=BUDGET_CAP?'the current design fits.':'the current design is OVER the cap by $'+(b.total-BUDGET_CAP).toFixed(2)+'.')}</div>
  ${P('<span class="small">One-time egress for the initial transfer (14.45 TB \u00d7 $0.02/GB \u2248 $289) is tracked separately from the monthly cap \u2014 simplified for this exercise. The gate passes only when <em>every</em> technical requirement <em>and</em> the cap are met \u2014 see the Hard-mode objective.</span>')}
  <div class="docnote">Autoscaling cost shown at baseline (2 \u00d7 n-standard-2); flash-sale scale-out is episodic and bounded by max 6.</div>`;
}
