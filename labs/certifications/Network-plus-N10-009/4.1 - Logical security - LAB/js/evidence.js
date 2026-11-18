/* ======================================================================
   GATEHOUSE lab — synthetic evidence files
   Ported 1:1 from src/lib/lab/evidence.ts.
   ALL TRAINING DATA — fully fictional.
   ====================================================================== */

const EVIDENCE = {
  "radius.log": `# radius.log — Meridian VPN / Wi-Fi gateway        [TRAINING DATA — synthetic]
2025-11-03 03:11:58 AUTH-OK  user=anaya.k   nas=ap-ward3f  method=802.1X-EAP-TLS vlan=clinical  loc=campus
2025-11-03 03:12:44 AUTH-OK  user=r.okafor  nas=ap-ward3f  method=802.1X-EAP-TLS vlan=clinical  loc=campus
2025-11-03 08:02:11 AUTH-OK  user=billing1  nas=vpn-gw01   method=EAP-MSCHAPv2   vlan=corp      loc=metro-cafe
2025-11-03 09:40:03 AUTH-OK  user=l.grant   nas=vpn-gw01   method=EAP-MSCHAPv2   vlan=corp      loc=unknown-asn64512
2025-11-03 09:40:09 AUTH-OK  user=l.grant   nas=vpn-gw01   method=EAP-MSCHAPv2   vlan=corp      loc=unknown-asn64512
2025-11-01 21:04:55 AUTH-OK  user=j.marek   nas=vpn-gw01   method=EAP-MSCHAPv2   vlan=contractor loc=abroad
2025-11-03 14:31:02 AUTH-REJ user=svc_backup nas=vpn-gw01  reason=bad-secret     retries=3
2025-11-03 14:31:19 AUTH-REJ user=svc_backup nas=vpn-gw01  reason=bad-secret     retries=3
2025-11-03 14:31:33 AUTH-REJ user=svc_backup nas=vpn-gw01  reason=bad-secret     retries=3`,
  "idp.log": `# idp.log — MeridianID cloud IdP (SAML + push MFA)  [TRAINING DATA — synthetic]
2025-11-03 09:41:30 PUSH-REQ      user=l.grant  asn=unknown-64512  (req 1/11)
2025-11-03 09:41:52 PUSH-REQ      user=l.grant  asn=unknown-64512  (req 2/11)
... 9 more push requests 09:42–09:45 ...
2025-11-03 09:45:20 PUSH-APPROVED user=l.grant  asn=unknown-64512  (req 11/11 — no number-match)
2025-11-03 09:46:01 ASSERTION     user=l.grant  sp=ehr-web   idp=MeridianID  result=ISSUED
2025-11-03 09:52:14 EXPORT        user=l.grant  sp=ehr-web   object=patient-batch-4411 rows=2874`,
  "ldap.log": `# ldap.log — directory edge                        [TRAINING DATA — synthetic]
2025-11-03 07:55:12 BIND   dn=CN=billing-app,OU=ServiceAccts,DC=meridianregional,DC=org  port=389 tls=NONE from=10.44.7.21
2025-11-03 07:55:12 SEARCH base=OU=Clinical,DC=meridianregional,DC=org filter=(cn=d.chen)
2025-11-03 08:00:31 BIND   dn=CN=ehrweb,OU=ServiceAccts,DC=meridianregional,DC=org      port=636 tls=TLS1.3 from=10.44.7.10
2025-11-03 08:00:31 SEARCH base=OU=Clinical,DC=meridianregional,DC=org filter=(department=nursing)`,
  "tacacs.log": `# tacacs.log — core network devices                 [TRAINING DATA — synthetic]
2025-11-02 10:22:09 SESSION user=netadmin1 device=core-sw1 action=login method=tacacs+ result=ok
# NOTE: no per-command authorization/accounting lines exist for core-sw1 —
#       its AAA lines point at RADIUS (see core-sw1.cfg).`,
  "ntp.log": `# ntp.log — authentication servers                  [TRAINING DATA — synthetic]
2025-11-03 00:00:01 idp-01 offset=+4.7s  source=pool.ntp.org(UNREACHABLE → local-fallback)
2025-11-03 06:00:01 idp-01 offset=+5.1s  source=local-fallback
2025-11-03 12:00:01 idp-01 offset=+4.7s  source=local-fallback   ← exceeds ±100 ms policy
2025-11-03 14:05:40 USER-REPORT "TOTP code rejected" x3 clinicians (ward 3F)`,
  "hr-roster.txt": `# hr-roster.txt — HR extract                        [TRAINING DATA — synthetic]
j.marek   contractor  terminated=2025-10-18   access-last-seen=2025-11-01 21:04 (abroad)
l.grant   billing     active  mfa=push-only   breach-check=2025-11-02 MATCH (credential dump "rock-2024")
anaya.k   nurse       active  shift=nights 19:00–07:00
r.okafor  nurse       active  shift=nights 19:00–07:00
d.chen    physician   active  on-call rota (ward 3F nights)`,
  "vpn-policy.cfg": `# vpn-policy.cfg — VPN concentrator                [TRAINING DATA — synthetic]
group "clinical"    { mfa: required(2-factors)  geofence: campus,metro }
group "corp"        { mfa: required(2-factors)  geofence: campus,metro }
group "contractors" { mfa: OFF                  geofence: none }
session { idle-timeout: none  revoke-on-anomaly: OFF }`,
  "core-sw1.cfg": `! core-sw1 running-config (excerpt)                 [TRAINING DATA — synthetic]
aaa new-model
aaa authentication login default group radius local
aaa authorization exec default group radius none
aaa accounting exec default start-stop group radius
! no 'aaa accounting commands' line  → no per-command authorization/accounting
tacacs-server host 10.20.0.49        ! configured but UNUSED`,
  "certs.txt": `# certs.txt — certificate inventory snapshot 2025-11-04  [TRAINING DATA — synthetic]
CERT-1  subject=CN=portal.meridianregional.org   issuer=CN=Meridian-Issuing-CA-01
        notBefore=2024-08-30  notAfter=2025-08-30        ← EXPIRED (today = 2025-11-04)
        SAN=portal-old.meridianregional.org               ← host mismatch
        sigAlg=sha1WithRSAEncryption                      ← deprecated
CERT-2  subject=CN=sso.meridianregional.org             issuer=CN=Meridian-Issuing-CA-01
        notBefore=2025-06-01  notAfter=2026-06-01
        SAN=sso.meridianregional.org
        sigAlg=sha256WithRSAEncryption`,
};

const TICKET_NOTE = `CHG-2041 (open): svc_backup secret rotation scheduled 2025-11-05 —
3 reject bursts expected/known. [TRAINING DATA — synthetic]`;

const INCIDENT_2211 = `INCIDENT 2211 — summary briefing                [TRAINING DATA — synthetic]
2025-11-03 · Billing clerk l.grant · Meridian Regional Medical Center
• 2025-11-02  breach-check: l.grant's reused password matched dump "rock-2024"
• 09:41–09:45  11 MFA push requests from unknown-asn64512 — one approved 09:45:20
• 09:46:01     SAML assertion issued by MeridianID for sp=ehr-web (new device, abroad)
• 09:52:14     2,874-row patient batch exported from ehr-web
Question for the night shift: which controls were missing, in what order did the
events unfold, and what does MITRE call the push-flood step?`;
