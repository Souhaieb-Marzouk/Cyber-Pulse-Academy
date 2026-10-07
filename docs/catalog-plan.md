# CyberPulseAcademy — Seed Catalog Plan

This file is the **canonical ID registry** for the shipped seed catalog. Every id below exists as
`data/<type>/<id>.json`, gets a generated `topics/<id>.html`, and reserves `exercises/<id>/batch-{1,2,3}.html`.

Rules enforced by `scripts/validate.py`:

1. An id appears **once** across the whole registry.
2. `technique.parentTactic` must be a tactic id in this list.
3. `mitigation.mitigatesTechniques[]`, `detection.techniqueId`, `detection.detectsTechniques[]` and
   `group.linkedTechniques[]` must reference technique ids in this list.
4. `relatedTopics[]` must reference ids in this list.

Totals: **125 keywords · 28 certifications · 14 tactics · 33 techniques · 18 mitigations ·
12 detections · 16 groups = 246 topics**, reserving 738 exercise batches.

---

## Tactics (14) — `data/tactics/`

| id | externalId | title |
|---|---|---|
| `ta0043` | TA0043 | Reconnaissance |
| `ta0042` | TA0042 | Resource Development |
| `ta0001` | TA0001 | Initial Access |
| `ta0002` | TA0002 | Execution |
| `ta0003` | TA0003 | Persistence |
| `ta0004` | TA0004 | Privilege Escalation |
| `ta0005` | TA0005 | Defense Evasion |
| `ta0006` | TA0006 | Credential Access |
| `ta0007` | TA0007 | Discovery |
| `ta0008` | TA0008 | Lateral Movement |
| `ta0009` | TA0009 | Collection |
| `ta0011` | TA0011 | Command and Control |
| `ta0010` | TA0010 | Exfiltration |
| `ta0040` | TA0040 | Impact |

## Techniques (33) — `data/techniques/`

| id | externalId | parentTactic | title |
|---|---|---|---|
| `t1059` | T1059 | ta0002 | Command and Scripting Interpreter |
| `t1059-001` | T1059.001 | ta0002 | PowerShell |
| `t1059-003` | T1059.003 | ta0002 | Windows Command Shell |
| `t1059-004` | T1059.004 | ta0002 | Unix Shell |
| `t1566` | T1566 | ta0001 | Phishing |
| `t1566-001` | T1566.001 | ta0001 | Spearphishing Attachment |
| `t1566-002` | T1566.002 | ta0001 | Spearphishing Link |
| `t1566-003` | T1566.003 | ta0001 | Spearphishing via Service |
| `t1078` | T1078 | ta0001 | Valid Accounts |
| `t1055` | T1055 | ta0004 | Process Injection |
| `t1486` | T1486 | ta0040 | Data Encrypted for Impact |
| `t1041` | T1041 | ta0010 | Exfiltration Over C2 Channel |
| `t1110` | T1110 | ta0006 | Brute Force |
| `t1110-003` | T1110.003 | ta0006 | Password Spraying |
| `t1110-004` | T1110.004 | ta0006 | Credential Stuffing |
| `t1021` | T1021 | ta0008 | Remote Services |
| `t1021-001` | T1021.001 | ta0008 | Remote Desktop Protocol |
| `t1021-002` | T1021.002 | ta0008 | SMB/Windows Admin Shares |
| `t1021-004` | T1021.004 | ta0008 | SSH |
| `t1547` | T1547 | ta0003 | Boot or Logon Autostart Execution |
| `t1071` | T1071 | ta0011 | Application Layer Protocol |
| `t1071-001` | T1071.001 | ta0011 | Web Protocols |
| `t1071-004` | T1071.004 | ta0011 | DNS |
| `t1190` | T1190 | ta0001 | Exploit Public-Facing Application |
| `t1133` | T1133 | ta0003 | External Remote Services |
| `t1562` | T1562 | ta0005 | Impair Defenses |
| `t1548` | T1548 | ta0004 | Abuse Elevation Control Mechanism |
| `t1136` | T1136 | ta0003 | Create Account |
| `t1087` | T1087 | ta0007 | Account Discovery |
| `t1018` | T1018 | ta0007 | Remote System Discovery |
| `t1567` | T1567 | ta0010 | Exfiltration Over Web Service |
| `t1490` | T1490 | ta0040 | Inhibit System Recovery |
| `t1204` | T1204 | ta0002 | User Execution |

## Mitigations (18) — `data/mitigations/`

| id | externalId | title |
|---|---|---|
| `m1038` | M1038 | Execution Prevention |
| `m1017` | M1017 | User Training |
| `m1032` | M1032 | Multi-factor Authentication |
| `m1050` | M1050 | Exploit Protection |
| `m1047` | M1047 | Audit |
| `m1030` | M1030 | Network Segmentation |
| `m1026` | M1026 | Privileged Account Management |
| `m1018` | M1018 | User Account Management |
| `m1042` | M1042 | Disable or Remove Feature or Program |
| `m1037` | M1037 | Filter Network Traffic |
| `m1051` | M1051 | Update Software |
| `m1027` | M1027 | Password Policies |
| `m1036` | M1036 | Account Use Policies |
| `m1041` | M1041 | Encrypt Sensitive Information |
| `m1054` | M1054 | Software Configuration |
| `m1049` | M1049 | Antivirus/Antimalware |
| `m1031` | M1031 | Network Intrusion Prevention |
| `m1013` | M1013 | Application Developer Guidance |

## Detection Strategies (12) — `data/detections/`

`det-powershell-encodedcommand`, `det-lsass-handle-access`, `det-rdp-new-asn`,
`det-mass-file-rename-entropy`, `det-scheduled-task-non-admin`, `det-kerberoasting-spn-spike`,
`det-dns-txt-beaconing`, `det-shadow-copy-deletion`, `det-new-service-installation`,
`det-office-child-shell`, `det-cloud-iam-policy-attached`, `det-impossible-travel`

## Groups (16) — `data/groups/`

| id | externalId | title |
|---|---|---|
| `g0007` | G0007 | APT28 |
| `g0006` | G0006 | APT1 |
| `g0016` | G0016 | APT29 |
| `g0027` | G0027 | Threat Group-3390 |
| `g0032` | G0032 | Lazarus Group |
| `g0046` | G0046 | FIN7 |
| `g0045` | G0045 | menuPass |
| `g0005` | G0005 | APT12 |
| `g1017` | G1017 | Volt Typhoon |
| `g1046` | G1046 | Storm-0501 |
| `g0087` | G0087 | APT39 |
| `g0050` | G0050 | APT32 |
| `g0096` | G0096 | APT41 |
| `g0125` | G0125 | HAFNIUM |
| `g0004` | G0004 | Ke3chang |
| `g0010` | G0010 | Turla |

## Certifications (28) — `data/certifications/`

| id | externalId | theme (vendor) |
|---|---|---|
| `security-plus` | SY0-701 | CompTIA |
| `cysa-plus` | CS0-003 | CompTIA |
| `pentest-plus` | PT0-003 | CompTIA |
| `cissp` | CISSP | ISC2 |
| `ccsp` | CCSP | ISC2 |
| `isc2-cc` | CC | ISC2 |
| `cism` | CISM | ISACA |
| `cisa` | CISA | ISACA |
| `crisc` | CRISC | ISACA |
| `oscp` | OSCP | OffSec |
| `oswa` | OSWA | OffSec |
| `ceh` | CEH | EC-Council |
| `chfi` | CHFI | EC-Council |
| `gsec` | GSEC | GIAC |
| `gcih` | GCIH | GIAC |
| `gcia` | GCIA | GIAC |
| `sc-200` | SC-200 | Microsoft |
| `sc-100` | SC-100 | Microsoft |
| `az-500` | AZ-500 | Microsoft |
| `aws-security-specialty` | SCS-C02 | AWS |
| `google-professional-cloud-security-engineer` | PCSE | Google Cloud |
| `ccna` | 200-301 | Cisco |
| `cisco-cyberops-associate` | 200-201 | Cisco |
| `ccnp-security` | 350-701 | Cisco |
| `lfcs` | LFCS | Linux Foundation |
| `cks` | CKS | Linux Foundation |
| `iso-27001-lead-implementer` | ISO 27001 LI | ISO/IEC |
| `iso-27001-lead-auditor` | ISO 27001 LA | ISO/IEC |

## Keywords (125) — `data/keywords/`

### Network Security (12)
`firewall`, `ids-ips`, `network-segmentation`, `zero-trust`, `vpn`, `tls-inspection`,
`dns-tunnelling`, `proxy`, `nac`, `netflow`, `bgp-hijacking`, `ddos`

### Identity & Access (13)
`mfa`, `sso`, `saml`, `oauth2`, `oidc`, `kerberos`, `ldap`, `pam`, `rbac`, `abac`,
`just-in-time-access`, `passwordless`, `conditional-access`

### Endpoint & Malware (12)
`edr`, `xdr`, `ransomware`, `fileless-malware`, `rootkit`, `lolbin`, `process-injection`,
`amsi`, `wdac-applocker`, `macro-malware`, `infostealer`, `c2-beacon`

### Cryptography (12)
`aes-gcm`, `rsa`, `ecdsa`, `sha-256`, `hmac`, `pki`, `certificate-pinning`, `key-rotation`,
`hsm`, `post-quantum-cryptography`, `salt`, `nonce-reuse`

### Cloud Security (11)
`shared-responsibility-model`, `iam-policy`, `s3-bucket-policy`, `cspm`, `cwpp`, `kms`,
`secrets-manager`, `imdsv2`, `container-escape`, `kubernetes-rbac`, `terraform-drift`

### SOC & Detection Engineering (12)
`siem`, `soar`, `triage`, `alert-fatigue`, `true-false-positive`, `detection-as-code`,
`sigma-rules`, `yara`, `kql-spl`, `playbook`, `mttd-mttr`, `threat-hunting-hypothesis`

### Incident Response & Forensics (10)
`picerl`, `containment`, `eradication`, `chain-of-custody`, `volatile-data`, `memory-dump`,
`timeline-analysis`, `disk-imaging`, `anti-forensics`, `tabletop-exercise`

### Threat Intelligence (10)
`ioc`, `ttp`, `diamond-model`, `cyber-kill-chain`, `stix-taxii`, `misp`, `attribution`,
`confidence-level`, `flash-report`, `dark-web-monitoring`

### GRC & Compliance (12)
`iso-27001`, `nist-csf`, `nist-800-53`, `soc-2`, `gdpr`, `hipaa`, `pci-dss`, `risk-register`,
`control-gap`, `statement-of-applicability`, `bia`, `rto-rpo`

### Secure Engineering (11)
`ssdlc`, `threat-modelling`, `stride`, `sast`, `dast`, `sca`, `secret-scanning`, `sbom`,
`supply-chain-attack`, `code-signing`, `iac-scanning`

### Offensive Security (10)
`reconnaissance`, `foothold`, `privilege-escalation`, `lateral-movement`, `persistence`,
`exfiltration`, `payload-staging`, `evasion`, `opsec`, `scope-rules-of-engagement`
