/* ==========================================================================
   js/quiz.js — knowledge-check banks (Medium 6 items / Hard 7 items)
   --------------------------------------------------------------------------
   1:1 port of the original src/lib/lab/quiz.ts, including the audited item
   design contract: correct-answer positions rotate (Medium [3,1,4,2,3,1],
   Hard [4,1,3,2,4,1,3]) and the correct option is never the longest.
   ========================================================================== */

// Knowledge Check — Medium: 6 concept items (recall + explain).
// Hard: 7 scenario items (application + justification).
//
// Item design contract (audited against B3/R4/R5):
//  - correct-answer POSITION rotates across items (no fixed index);
//  - option lengths are balanced — the correct answer is never the longest;
//  - distractors come from the same concept family (real misconceptions, no filler).
const QUIZ_MEDIUM = [
    {
        id: 'qm1',
        prompt: 'A workload runs 24/7 at a stable size and has not changed in 11 months. Which billing model fits it best?',
        options: [
            { id: 'a', text: 'On-demand pay-as-you-go rates' },
            { id: 'b', text: 'Spot capacity, reclaimable anytime' },
            { id: 'c', text: 'Reserved capacity for one year' },
            { id: 'd', text: 'A savings plan for 10% of spend' },
        ],
        correct: 'c',
        topic: 'Billing models',
        explanation: 'Steady 24/7 workloads are exactly what commitments were priced for: ~40% off in exchange for being billed whether the instance runs or not. On-demand (a) pays the highest rate for the same hours; spot (b) risks reclaiming a production workload; a savings plan sized to 10% (d) barely dents the bill.',
    },
    {
        id: 'qm2',
        prompt: 'Object storage on the invoice is metered in "GB-month". What does the provider actually count?',
        options: [
            { id: 'a', text: 'The average amount kept over the month' },
            { id: 'b', text: 'The largest single upload of the month' },
            { id: 'c', text: 'The object count across your buckets' },
            { id: 'd', text: 'The bucket count in the account' },
        ],
        correct: 'a',
        topic: 'Resource metering — storage',
        explanation: 'GB-month approximates the average gigabytes kept during the month — not the biggest upload (b), not the object count (c), not the bucket count (d). Deleting stale data lowers the average, which is why the Meridian snapshot backlog (88,200 GB nobody touched) cost $1,852.20 while it existed.',
    },
    {
        id: 'qm3',
        prompt: 'You copy 10 TB INTO the cloud and later copy 10 TB OUT cross-region. What do you pay for?',
        options: [
            { id: 'a', text: 'Both directions at the same rate' },
            { id: 'b', text: 'Only the inbound (ingress) transfer' },
            { id: 'c', text: 'Neither — transfers under 100 TB are free' },
            { id: 'd', text: 'Only the outbound (egress) transfer' },
        ],
        correct: 'd',
        topic: 'Resource metering — egress',
        explanation: 'Ingress is free; egress is billed per GB — that asymmetry is why the vault-sync export cost $4,221 while the same volume inbound would cost $0. Direction, not volume, decides the charge (a and b invert it; c is false — there is no blanket free tier here). "Just copy it to another region/cloud" is a priced decision.',
    },
    {
        id: 'qm4',
        prompt: 'What is the primary purpose of cost-allocation tags?',
        options: [
            { id: 'a', text: 'Encrypt resource data at rest' },
            { id: 'b', text: 'Attribute spend to owning teams' },
            { id: 'c', text: 'Speed up instance boot times' },
            { id: 'd', text: 'Serve as access-control policies' },
        ],
        correct: 'b',
        topic: 'Tagging & attribution',
        explanation: 'Tags are metadata for attribution: with dept/env tags, Finance can showback or chargeback each team; without them (like the 14 hack-* resources), spend lands in an anonymous pool nobody is accountable for. They do not encrypt (a), they do not touch boot performance (c), and IAM — not tags — controls access (d).',
    },
    {
        id: 'qm5',
        prompt: '"Rightsizing" a cloud resource means:',
        options: [
            { id: 'a', text: 'Always picking the cheapest available size' },
            { id: 'b', text: 'Setting every instance to the provider default' },
            { id: 'c', text: 'Matching size to utilization evidence' },
            { id: 'd', text: 'Enabling auto-scaling on every resource' },
        ],
        correct: 'c',
        topic: 'Rightsizing',
        explanation: 'Rightsizing is evidence-driven sizing: prod-postgres-01 peaked at 9% CPU / 22% memory on a 16-vCPU box, so a quarter of it fits with headroom (−$3,749.76/mo). Cheapest-isn\u2019t-right (a) is how you starve peaks; defaults (b) ignore the workload; auto-scaling (d) is one structural tool, not the definition — and the memory-bound cache taught the other half: shrink what is actually bloated.',
    },
    {
        id: 'qm6',
        prompt: 'A service line with no prior history suddenly accrues $19,872 in one month. From a SECURITY standpoint, the first thing this should suggest is:',
        options: [
            { id: 'a', text: 'Possible resource hijacking (T1496)' },
            { id: 'b', text: 'A provider-side pricing or metering error' },
            { id: 'c', text: 'A successful marketing campaign' },
            { id: 'd', text: 'A signal to buy reserved capacity' },
        ],
        correct: 'a',
        topic: 'Cost anomalies & security',
        explanation: 'Unexplained new compute is the classic billing signature of resource hijacking (T1496, the cryptojacking sub-technique T1496.001 in this case): attackers monetize your metered surface. A pricing error (b) is possible but rare first hypothesis; the campaign here had an approved allowance (c); buying reserved capacity (d) is a mitigation for steady load — not a triage verdict. The bill is often the first sensor that fires.',
    },
];
const QUIZ_HARD = [
    {
        id: 'qh1',
        prompt: 'SCENARIO — A fleet renders marketing videos, jobs checkpoint every 2 minutes, and it only exists Oct 20–31. Which model do you assign, and what is the deciding property?',
        options: [
            { id: 'a', text: 'Reserved — the discount beats idle days' },
            { id: 'b', text: 'On-demand — short-lived needs no deal' },
            { id: 'c', text: 'BYOL — the renderer ships licensed' },
            { id: 'd', text: 'Spot — jobs checkpoint through reclaims' },
        ],
        correct: 'd',
        topic: 'Billing models in practice',
        explanation: 'Spot is defensible exactly where interruption cannot lose work: checkpointable jobs survive a 2-minute reclaim and the rate is ~70% off (~$1,261 vs $4,205 for the same hours). Reserved (a) bills idle capacity for a year on a 12-day fleet; on-demand (b) leaves ~$2,943 on the table; BYOL (c) answers a licensing question nobody asked.',
    },
    {
        id: 'qh2',
        prompt: 'SCENARIO — A new GPU line bills $19,872 with no owner. Which evidence combination CONFIRMS cryptojacking rather than a forgotten legit experiment?',
        options: [
            { id: 'a', text: '24/7 CPU, unrotated key, mining pools' },
            { id: 'b', text: 'A high bill plus consistently high CPU' },
            { id: 'c', text: 'One daily spike plus missing owner tags' },
            { id: 'd', text: 'The mere existence of the GPU line' },
        ],
        correct: 'a',
        topic: 'Incident evidence (T1496.001)',
        explanation: 'This mirrors ATT&CK analytic AN0744: "sudden spikes in cloud VM CPU usage with outbound traffic to mining pools and unauthorized instance creation." The key minted outside rotation plus API-only creation plus flat 24/7 saturation distinguishes hijacking from an ownerless-but-legit experiment. High bill + high CPU (b) describes half the workload in any data center; one spike + no tags (c) is a triage hint, not proof; the line existing (d) proves nothing.',
    },
    {
        id: 'qh3',
        prompt: 'SCENARIO — You have confirmed cryptojacking (T1496.001). What is the correct FIRST action?',
        options: [
            { id: 'a', text: 'Terminate the GPU fleet right away' },
            { id: 'b', text: 'Open a support ticket on the charges' },
            { id: 'c', text: 'Revoke and rotate the runner key' },
            { id: 'd', text: 'Wait for a scheduled response window' },
        ],
        correct: 'c',
        topic: 'Incident response order',
        explanation: 'The key is the attacker\u2019s live capability: while it stands, terminated instances can be re-created within minutes. Revoke first, quarantine the runner for forensics second, terminate the fleet third, then add guardrails — cut capability → preserve evidence → stop the bleed → prevent recurrence. Terminating first (a) destroys evidence while the key stays live; a billing ticket (b) addresses the symptom; waiting (d) funds the attacker.',
    },
    {
        id: 'qh4',
        prompt: 'SCENARIO — The vault-sync job must keep copying backups out for DR. Which change actually reduces the billed egress?',
        options: [
            { id: 'a', text: 'Run the job at 02:00 instead of 01:00' },
            { id: 'b', text: 'Same-region target, incremental sends' },
            { id: 'c', text: 'Split the export into smaller files' },
            { id: 'd', text: 'Rename the target bucket or job' },
        ],
        correct: 'b',
        topic: 'Egress architecture',
        explanation: 'Same-region targets bill $0 cross-region transfer, and incremental sends shrink every future export to changed blocks only. Egress is priced per GB with no time-of-day discount, so scheduling (a) changes nothing; chunking (c) meters the same GB; renaming (d) relabels the line, not the volume.',
    },
    {
        id: 'qh5',
        prompt: 'SCENARIO — Which clause of a proposed cost policy is actually SOUND?',
        options: [
            { id: 'a', text: 'Commit the 12-day burst fleet for a year' },
            { id: 'b', text: 'Delete all snapshots older than 7 days' },
            { id: 'c', text: 'Make tagging optional for experiment work' },
            { id: 'd', text: 'Alert at 85% of cap; review monthly' },
        ],
        correct: 'd',
        topic: 'Cost policy audit',
        explanation: '85%-of-cap alerting leaves runway to act before the ceiling — the pattern that would have fired on Oct 22. The other three: committing a burst fleet (a) bills idle capacity for a year; deleting all snapshots past 7 days (b) breaks the recovery point objective for production backups — retention is a DR decision; optional tagging (c) re-opens the attribution blind spot.',
    },
    {
        id: 'qh6',
        prompt: 'SCENARIO — Why does the anomaly alert need an absolute-dollar rule for new lines, even though a % rule exists?',
        options: [
            { id: 'a', text: 'New lines start at $0, breaking % math' },
            { id: 'b', text: 'Dollar rules read better in alerts' },
            { id: 'c', text: 'Providers bill new lines at double rate' },
            { id: 'd', text: 'Percentage rules only apply to storage' },
        ],
        correct: 'a',
        topic: 'Anomaly detection rules',
        explanation: 'Percentage rules divide by a trailing baseline; dividing by zero breaks the math. A brand-new service line shows ∞% growth on day one — so new lines need an absolute trigger (>$500 MTD with no history), while the % rule handles established lines drifting. Readability (b) is a nicety, not the reason; there is no double-rate policy (c); % rules apply to any metered line (d).',
    },
    {
        id: 'qh7',
        prompt: 'SCENARIO — The support line rose from $580 to $1,860. Triage stamped it EXPECTED, yet $1,260 is still recoverable. How?',
        options: [
            { id: 'a', text: 'The stamp was wrong — it was unauthorized' },
            { id: 'b', text: 'Downgrade back and pay $580 again' },
            { id: 'c', text: 'Dispute proration — 10 days owed, not 31' },
            { id: 'd', text: 'Nothing — legit charges cannot be disputed' },
        ],
        correct: 'c',
        topic: 'Invoice reconciliation',
        explanation: 'Triage classifies the CAUSE (planned upgrade → expected spike); reconciliation verifies the AMOUNT (31 days billed vs 10 days active Oct 22–31 at $60/day = $600 owed → $1,260 disputed on proration). The stamp was right (a); downgrading (b) abandons a tier Finance chose; legitimate charges with wrong amounts are disputed and credited every day (d).',
    },
];
