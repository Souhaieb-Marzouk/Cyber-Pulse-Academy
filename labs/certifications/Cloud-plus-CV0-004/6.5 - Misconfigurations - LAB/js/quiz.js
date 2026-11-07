// ─── Ledgerline · knowledge check (quiz) ────────────────────────────────────
// Static port of src/lib/lab/quiz.ts — items, answers and explanations 1:1.
'use strict';

const MEDIUM_QUIZ = [
  {
    id: 'mq1',
    prompt: 'Under the shared responsibility model, who is responsible for the bucket policy of an object store you use in IaaS?',
    options: [
      { id: 'a', text: 'The provider — it is their storage service' },
      { id: 'b', text: 'The customer — policies are part of security IN the cloud' },
      { id: 'c', text: 'Whoever wrote the application' },
      { id: 'd', text: 'Responsibility is shared 50/50 for every setting' },
    ],
    correct: 'b',
    explanation: 'The provider secures the platform (of the cloud); the customer owns every configuration decision (in the cloud), including bucket policies, ACLs and encryption choices. "Shared" splits by layer, not by percentage.',
  },
  {
    id: 'mq2',
    prompt: 'A security-group rule reads "TCP 22 from 0.0.0.0/0". What does the source mean?',
    options: [
      { id: 'a', text: 'The provider\'s internal management network' },
      { id: 'b', text: 'The first 22 addresses of the subnet' },
      { id: 'c', text: 'Every IPv4 address — the entire internet' },
      { id: 'd', text: 'Only addresses already inside the VPC' },
    ],
    correct: 'c',
    explanation: '0.0.0.0/0 in CIDR notation matches all IPv4 addresses. Combined with a management port like SSH it makes the instance a global brute-force target — the classic network misconfiguration.',
  },
  {
    id: 'mq3',
    prompt: 'Why is an IAM policy with Action:["*"] and Resource:["*"] dangerous even for a "lowly" pipeline account?',
    options: [
      { id: 'a', text: 'It makes the console slower to load' },
      { id: 'b', text: 'It violates least privilege — if that identity is compromised, the attacker inherits every permission' },
      { id: 'c', text: 'Wildcard policies are only dangerous for admin users' },
      { id: 'd', text: 'It prevents the account from using MFA' },
    ],
    correct: 'b',
    explanation: 'Wildcards turn any compromise of that identity into an account-level takeover. The pipeline in this lab needed exactly two S3 actions on one bucket path; the wildcard policy made its stolen key an estate-wide master key.',
  },
  {
    id: 'mq4',
    prompt: 'Which of these is a PROVIDER responsibility?',
    options: [
      { id: 'a', text: 'Patching the hypervisor host' },
      { id: 'b', text: 'Enabling MFA on your IAM users' },
      { id: 'c', text: 'Restricting security-group sources' },
      { id: 'd', text: 'Encrypting database backups you configured' },
    ],
    correct: 'a',
    explanation: 'The hypervisor, physical facilities and the service platform are "of the cloud" — provider duty. Everything you configure in a console (MFA, SGs, encryption settings) is "in the cloud" — customer duty.',
  },
  {
    id: 'mq5',
    prompt: 'A static access key has just been found in a public code repository. What is the correct first action?',
    options: [
      { id: 'a', text: 'Rotate it (issue the new key), then deactivate the old one later' },
      { id: 'b', text: 'Deactivate/revoke the exposed key immediately, then rotate' },
      { id: 'c', text: 'Delete the repository entry and watch for anomalies' },
      { id: 'd', text: 'Wait for the quarterly key-rotation cycle' },
    ],
    correct: 'b',
    explanation: 'Revoke → rotate → investigate. Containment comes first: the exposed key is a working credential from the moment of exposure. Rotating before revoking leaves a hostile key live while you work.',
  },
  {
    id: 'mq6',
    prompt: 'Which tool class continuously evaluates cloud resource configuration against rules and surfaces misconfigurations?',
    options: [
      { id: 'a', text: 'Antivirus' },
      { id: 'b', text: 'CSPM (Cloud Security Posture Management)' },
      { id: 'c', text: 'A WAF' },
      { id: 'd', text: 'SIEM correlation rules on firewall logs' },
    ],
    correct: 'b',
    explanation: 'CSPM is the posture scanner this lab simulated: rule-based, continuous evaluation of resource state (public access, wildcards, open ports, disabled trails). AV and WAFs see runtime behavior; SIEMs see logs — none read a bucket policy.',
  },
];

const HARD_QUIZ = [
  {
    id: 'hq1', scenario: 'A bucket policy you inherit allows s3:PutObject to Principal:"*".',
    prompt: 'What is the worst realistic outcome of this specific misconfiguration?',
    options: [
      { id: 'a', text: 'Anyone can read the bucket' },
      { id: 'b', text: 'Anyone can overwrite your data or plant malicious content — integrity loss and possible malware staging' },
      { id: 'c', text: 'The bucket becomes unencrypted' },
      { id: 'd', text: 'The provider will quarantine the bucket automatically' },
    ],
    correct: 'b',
    explanation: 'PutObject to the world is an integrity catastrophe: silent data destruction (no versioning = gone) or malware staged in your storage for distribution. Confidentiality leaks get headlines; integrity loss poisons everything downstream of the data.',
  },
  {
    id: 'hq2', scenario: 'You are asked to enforce IMDSv2 (token required) on all instances.',
    prompt: 'Which attack does this control primarily blunt?',
    options: [
      { id: 'a', text: 'Brute-force SSH from the internet' },
      { id: 'b', text: 'SQL injection into the application database' },
      { id: 'c', text: 'SSRF-driven theft of instance role credentials via the metadata API (T1552.005)' },
      { id: 'd', text: 'DNS hijacking of the instance\'s resolver' },
    ],
    correct: 'c',
    explanation: 'IMDSv1 answers any request originating from the host — exactly what a server-side request forgery payload produces. Token-required metadata breaks that theft path; it is the control that would have blunted the Capitol One breach.',
  },
  {
    id: 'hq3', scenario: 'Your CSPM flags four public exposures. Which is an ACCEPTED EXCEPTION rather than a must-fix?',
    options: [
      { id: 'a', text: 'Bucket allowing anonymous GetObject on every object' },
      { id: 'b', text: 'Public static-website bucket scoped to s3:GetObject on assets/*, writes denied, documented' },
      { id: 'c', text: 'Database endpoint listening publicly' },
      { id: 'd', text: 'SSH (22) open to 0.0.0.0/0 on the bastion' },
    ],
    correct: 'b',
    explanation: 'Judgment beats reflex: public-by-design with a scoped action, a write-deny, and documentation is an accepted exception. The other three are unscoped exposures of sensitive surfaces — true misconfigurations.',
  },
  {
    id: 'hq4', scenario: 'The scanner reports 300 findings. Your team can ship three fixes tonight.',
    prompt: 'Which set is the defensible triage?',
    options: [
      { id: 'a', text: 'Public database, actively-used exposed access key, SSH open to the world' },
      { id: 'b', text: 'Unencrypted dev sandbox, missing versioning, missing drift alerts' },
      { id: 'c', text: 'Missing drift alerts, unencrypted log bucket, low-severity stale key' },
      { id: 'd', text: 'Anything alphabetical — consistency is what matters' },
    ],
    correct: 'a',
    explanation: 'Triage = exploitability × blast radius. A public database and an in-use exposed key are working attack paths; world-open SSH is a standing brute-force surface. The others are real hygiene items — they wait, scheduled.',
  },
  {
    id: 'hq5', scenario: 'Incident response has contained the attacker. The post-incident hardening ticket asks for the key-remediation sequence.',
    prompt: 'Which order is correct?',
    options: [
      { id: 'a', text: 'Deactivate/revoke the exposed key → issue rotated replacement → review audit trail for other use of the old key' },
      { id: 'b', text: 'Issue rotated replacement → revoke the old key after a week' },
      { id: 'c', text: 'Review the trail → wait 72 hours → revoke everything' },
      { id: 'd', text: 'Revoke → rotate → delete the audit trail to save cost' },
    ],
    correct: 'a',
    explanation: 'Contain (revoke), restore (rotate), learn (review the trail for every use of the compromised key — scope definition). Deleting the trail would destroy the forensic record; rotating late leaves the hostile key live.',
  },
  {
    id: 'hq6', scenario: 'The account has no audit trail enabled. Nothing in the estate currently "feels" broken.',
    prompt: 'Why is the disabled trail still a critical misconfiguration?',
    options: [
      { id: 'a', text: 'It slows down API calls to have no logs' },
      { id: 'b', text: 'Because the exam lists it as critical' },
      { id: 'c', text: 'Without it, neither detection (who used the stolen key?) nor forensics (what exactly did they take?) is possible' },
      { id: 'd', text: 'The trail encrypts the buckets it monitors' },
    ],
    correct: 'c',
    explanation: 'In this lab\'s breach the stolen key was used 02:19–02:47 with no record kept. Detection and scope definition both depend on the trail — it is the difference between "we think only exports were read" and proof.',
  },
  {
    id: 'hq7', scenario: 'You are mapping findings to ATT&CK for the debrief.',
    prompt: 'Which misconfiguration maps to T1552.005 (Unsecured Credentials: Cloud Instance Metadata API)?',
    options: [
      { id: 'a', text: 'Metadata service left in v1 mode — token not required' },
      { id: 'b', text: 'Wildcard Action in an IAM policy' },
      { id: 'c', text: 'Anonymous-read bucket policy' },
      { id: 'd', text: 'Versioning disabled on a bucket' },
    ],
    correct: 'a',
    explanation: 'v1 metadata answers credential requests without a session token — the exact mechanic T1552.005 describes. Wildcards map to Valid Accounts abuse after theft (T1078.004); anonymous reads map to T1530.',
  },
];

const QUIZ_BY_MODE = { medium: MEDIUM_QUIZ, hard: HARD_QUIZ };
