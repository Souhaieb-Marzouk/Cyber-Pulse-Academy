"use strict";

/* ============================================================================
   js/data.js — ALL lab content (data separated from logic, port spec SC-D7/B).
   Glossary, evidence artifacts, objective definitions (check rules + hint tiers),
   quiz bank, board option sets, findings, lanes. Content is 1:1 with the original lab.
   ============================================================================ */

const GLOSSARY = [
  ["Symmetric encryption","One shared secret key encrypts and decrypts; fast, ideal for bulk data (e.g., AES-256)."],
  ["Asymmetric encryption","Mathematically linked public/private key pair; slow, used for key exchange and signatures (RSA, ECC)."],
  ["Public key","Freely shareable half of a pair; others use it to encrypt to you or verify your signatures."],
  ["Private key","Secret half of a pair; you use it to decrypt messages sent to you and to create signatures."],
  ["Key escrow","Trusted third-party custody of key copies so data can be recovered if keys are lost or staff leave."],
  ["PKI","The people, policies and systems that issue, distribute and revoke key-based trust."],
  ["Root of trust","The implicitly trusted anchor (root CA / TPM) every certificate chain ultimately depends on."],
  ["CSR","Certificate Signing Request: signed request containing identity info + public key, sent to a CA."],
  ["CRL","Certificate Revocation List: periodically downloaded list of revoked certificate serial numbers."],
  ["OCSP","Online Certificate Status Protocol: real-time per-certificate status query; stapling lets the server present a cached signed response."],
  ["Salt","Unique random value per record, stored with the hash, that defeats precomputed (rainbow-table) cracking."],
  ["Non-repudiation","Proof that a specific key holder performed an action, so they cannot credibly deny it."],
  ["Perfect Forward Secrecy","Ephemeral session keys mean a stolen long-term key cannot decrypt previously captured sessions."],
  ["Obfuscation","Deliberately hard-to-read code/data; slows casual analysis but is not real protection on its own."],
  ["Tokenization","Replacing sensitive data with a token; the real data lives in a separately secured vault."],
  ["Data masking","Showing a de-identified version of data (e.g., last 4 of an SSN) to non-privileged users."]
];

/* ---------- state ---------- */

const FILE_A = "ARHN HCS-11 self-assessment, section 4.2 Encryption levels. Approved by Cryptographic Controls Lead.";

const FILE_B = "ARHN HCS-11 self-assessment, section 4.2 Encryptioon levels. Approved by Cryptographic Controls Lead.";

const STATION_OBJ = { k:["M1","M2"], c:["M3","M4","M5","H2"], e:["M6","M7","M8","H3","H4"], h:["M9","M10","M11","H5","H6"], m:["M12","H7"], debrief:["H8","H9"] };

const LEVELS_EXPECT = { laptop:"full-disk", partition:"partition", file:"file", volume:"volume", database:"database", record:"record" };

const serialNorm = (s) => String(s||"").toLowerCase().replace(/[^0-9a-f]/g,"");

const MODE_DEFS = {
  medium: [
    { id:"M1", pillar:"P1", station:"k", title:"Assign each task to the correct key half (encrypt, decrypt, sign, verify).",
      hints:["Who must be able to open the file meant for Alice — her key, and is it public or private?","The public half is shared with the world: encrypt TO the owner, verify BY the owner. The private half decrypts and signs.","Correct set: encrypt→Public, decrypt→Private, sign→Private, verify→Public."],
      check:(e)=>{ const l=e.lane; const ok = l.enc==="public"&&l.dec==="private"&&l.sign==="private"&&l.verify==="public";
        return {pass:ok, msg: ok ? "Correct. Everyone encrypts to you with your PUBLIC key; only your PRIVATE key can open it and sign for you. This asymmetry is the engine of PKI. Next: decide what ARHN does when a key holder disappears (escrow)." : "Not yet — check the lane assignments. Encrypt→Public, Decrypt→Private, Sign→Private, Verify→Public. Remember: anything your private key can do, nobody else's can." }; } },
    { id:"M2", pillar:"P4", station:"k", title:"Set the escrow policy: which keys are escrowed and why.",
      hints:["INC-003: the tape is unreadable because the only key holder is gone. Which key half is irreplaceable?","Public keys are re-derivable from certificates; only PRIVATE keys unlock data. Escrow = custody of copies.","Escrow copies of private keys, because a trusted custodian can recover data when the key holder is gone."],
      check:(e)=>{ const ok=e.escrow==="private"&&e.escrowWhy==="recover";
        return {pass:ok, msg: ok ? "Correct. Escrow trades a small custody risk for recoverability — that is the key-management judgment the exam wants. Objective 1.3: the appropriate solution includes planning for key loss." : "Public keys are public — escrowing them recovers nothing. You escrow PRIVATE key copies so a trusted custodian can recover data when the holder is gone (INC-003)." }; } },
    { id:"M3", pillar:"P1", station:"c", title:"Source each certificate: third-party CA, internal CA, or self-signed.",
      hints:["Who needs to trust each service, and do they already trust ARHN?","Browsers worldwide trust public third-party CAs. Your own devices can be configured to trust your internal CA. A throwaway test box trusts only itself — self-signed is fine.","Public portal→third-party CA; internal app→internal CA; dev box→self-signed."],
      check:(e)=>{ const ok=e.ca.portal==="third"&&e.ca.internal==="internal"&&e.ca.dev==="self";
        return {pass:ok, msg: ok ? "Correct. You just placed three roots of trust: public CAs for the world, the internal CA for ARHN-managed devices, self-signed for disposable hosts. Wrong placement either breaks trust or widens the attack surface." : "Re-check: world-facing browsers only trust third-party CAs; ARHN devices can trust an internal CA; a disposable dev box can self-sign. Ask 'who must trust this, and do they already?'" }; } },
    { id:"M4", pillar:"P2", station:"c", title:"Read the CSR and pick the right certificate type for two services.",
      hints:["Look at the CSR's CN and the hostname list. One label deep means what for a wildcard?","Wildcards cover exactly ONE label deep: *.arhn.example covers billing.arhn.example but NOT vpn.corp.arhn.example.","Farm→wildcard *.arhn.example; the two-depth pair→SAN listing exact names."],
      check:(e)=>{ const ok=e.ctype.farm==="wildcard"&&e.ctype.hr==="san";
        return {pass:ok, msg: ok ? "Correct. Wildcard for the one-label-deep farm; SAN for names at different depths — a wildcard cannot reach vpn.corp.arhn.example." : "Wildcard covers exactly one label deep. The portal farm (portal/billing/pharmacy.arhn.example) fits *.arhn.example; hr.arhn.example + vpn.corp.arhn.example needs a SAN cert listing both exact names." }; } },
    { id:"M5", pillar:"P2", station:"c", title:"Design revocation checking for three contexts.",
      hints:["Speed vs freshness vs offline. CRL downloads; OCSP asks live; stapling moves the OCSP answer server-side.","High-traffic portal: per-visitor OCSP is slow — let the SERVER staple the signed response. Compliance wants per-cert real-time proof. Air-gapped means no live queries at all.","Portal→stapling; compliance→OCSP; batch/offline→CRL."],
      check:(e)=>{ const ok=e.rev.portal==="staple"&&e.rev.audit==="ocsp"&&e.rev.batch==="crl";
        return {pass:ok, msg: ok ? "Correct — and this is a real exam favorite: CRL = periodic list, OCSP = live query, stapling = server-presented cached OCSP response. INC-004 (expired cert serving) is exactly the failure this prevents." : "Match context to mechanism: fast high-traffic portal → OCSP stapling; real-time per-cert proof → OCSP; offline/low-bandwidth batch → CRL." }; } },
    { id:"M6", pillar:"P1", station:"e", title:"Choose symmetric vs asymmetric for two jobs.",
      hints:["40 GB nightly: same system, speed matters. Exchanging a key with a partner over open internet: secrecy of the key itself matters.","Symmetric (AES-256) for bulk. Asymmetric (RSA/ECC) to protect the symmetric key in transit — that hybrid is exactly how TLS works.","Backup→symmetric AES-256; key exchange→asymmetric."],
      check:(e)=>{ const ok=e.symasym.backup==="sym"&&e.symasym.exchange==="asym";
        return {pass:ok, msg: ok ? "Correct. Symmetric for bulk speed, asymmetric to bootstrap the shared secret — the hybrid pattern the exam expects you to recognize." : "Bulk data → symmetric (AES-256, fast). Sending that key across the internet → asymmetric (encrypt it with the partner's public key). One job per class." }; } },
    { id:"M7", pillar:"P2", station:"e", title:"Match all six assets to their encryption level.",
      hints:["Where does the data live and how big is the boundary? Disk = whole drive; volume = a logical store; file = per file; database/record = inside the DBMS.","INC-001's laptop needs whole-disk protection; the SSN column needs protection even inside an encrypted database... think smallest correct boundary.","Laptop→full-disk; /boot→partition; project docs→file; backup volume→volume; DB→database (TDE); SSN column→record/column level."],
      check:(e)=>{ const ok=Object.keys(LEVELS_EXPECT).every(k=>e.levels[k]===LEVELS_EXPECT[k]);
        return {pass:ok, msg: ok ? "Correct. The right level = smallest boundary that still covers the threat: a stolen disk dies to FDE; a queried PII column dies to record-level encryption. One size never fits all." : "Assign every row. Boundary size: full-disk ⊃ volume ⊃ file; database and record live inside the DBMS. The SSN column needs record-level protection even inside an encrypted database." }; } },
    { id:"M8", pillar:"P2", station:"e", title:"Commission secure transport: protocol, key exchange mode, and the property it buys.",
      hints:["INC-002 says unencrypted traffic was captured. Which protocol fixes that for browsers? And what makes yesterday's captures safe from today's stolen key?","TLS is the transport protocol; ephemeral ECDHE gives each session its own keys — Perfect Forward Secrecy.","TLS + ephemeral ECDHE + PFS."],
      check:(e)=>{ const ok=e.proto==="tls"&&e.kx==="ephemeral"&&e.kxwhy==="pfs";
        return {pass:ok, msg: ok ? "Correct. TLS with ephemeral key exchange means a stolen long-term key cannot decrypt past captures — that is PFS, and it is why ECDHE matters beyond 'encryption on'." : "Protocol = TLS. Exchange = ephemeral ECDHE. Property = Perfect Forward Secrecy (past captures stay safe). Static key transport fails exactly INC-002's fear." }; } },
    { id:"M9", pillar:"P3", station:"h", title:"Run the integrity bench: hash both copies, judge the result, pick the standard algorithm.",
      hints:["You must click both hash buttons so the bench prints real digests, then compare with the manifest.","If the received copy's digest differs from the manifest, the bytes changed — integrity breach, quarantine it. For new standards avoid MD5: it is collision-broken.","Both hashes → verdict 'breach' → SHA-256."],
      check:(e)=>{ const ok=!!(e.hashA&&e.hashB)&&e.verdict==="breach"&&e.halgo==="sha256";
        return {pass:ok, msg: ok ? "Correct. Hashing is the defender's change detector: same input→same digest, always. One flipped character moves the digest completely (avalanche). MD5 is retired for security work." : "Hash BOTH copies (two buttons), then judge. Differing digest vs manifest = integrity breach, not 'variance'. Standard = SHA-256 (MD5 is collision-broken)." }; } },
    { id:"M10", pillar:"P3", station:"h", title:"Turn on per-user salting and explain what it defeats.",
      hints:["Toggle the salt switch and watch three identical hashes split into three unique ones. Then pick the reason.","Precomputation only helps if every user with the same password shares one digest. A unique per-user salt makes the attacker re-crack every row.","Salt ON + 'attacker can no longer precompute one table for all users'."],
      check:(e)=>{ const ok=e.saltOn===true&&e.saltwhy==="pre";
        return {pass:ok, msg: ok ? "Correct. Salting does not make hashing 'stronger' — it makes precomputation worthless by ensuring identical passwords no longer share a digest." : "Flip the toggle first (watch the table), then pick the reason: unique per-user salt → one precomputed rainbow table no longer hits every row." }; } },
    { id:"M11", pillar:"P2", station:"h", title:"Assemble the signing pipeline in order, verify it, and tick what a signature proves.",
      hints:["Order: hash the document → protect that hash with which key? → attach → how does the recipient check it? The 'email' step is a trap.","Sign = hash, encrypt the hash with the PRIVATE key, attach signature+cert; recipient verifies with the PUBLIC key.","Pipeline hash→priv→attach→verify; properties: integrity, authenticity, non-repudiation — NOT confidentiality."],
      check:(e)=>{ const ok=e.sign.join(",")==="hash,priv,attach,verify"&&e.props.integrity===true&&e.props.auth===true&&e.props.nonrep===true&&e.props.conf!==true;
        return {pass:ok, msg: ok ? "Correct. A signature proves integrity, authenticity and non-repudiation — the signer cannot credibly deny it. It does NOT hide the document; confidentiality needs encryption. Run the tamper test to feel why." : "Build the pipeline hash→private→attach→verify (skip the 'email' trap), run verification, then tick properties: integrity + authenticity + non-repudiation. Confidentiality is NOT among them." }; } },
    { id:"M12", pillar:"P4", station:"m", title:"Fix the key calendar: rotation, escrow, destruction, key length.",
      hints:["INC-003 says escrow; INC-004's world says short-lived keys. Legacy 1024-bit RSA is below modern floor.","Rotate TLS keys on a short interval (90 days or 30), escrow the backup master key, destroy the retired fileserver key, upgrade RSA-1024 to ≥2048.","rot≤90d, escrow ON, destroy, 2048/4096."],
      check:(e)=>{ const c=e.cal; const ok=(c.rot==="30"||c.rot==="90")&&c.escrow==="on"&&c.destroy==="destroy"&&(c.len==="2048"||c.len==="4096");
        return {pass:ok, msg: ok ? "Correct. Keys age: rotate to limit blast radius, escrow what must be recoverable, destroy what is done, and length-match the algorithm era. This board is your residual-risk plan." : "Set all four rows: short rotation (90 or 30 days), escrow ON for the backup master key, secure destruction for the retired key, and upgrade 1024-bit RSA to at least 2048." }; } }
  ],
  hard: [
    { id:"H1", pillar:"P2", station:"dossier", title:"Triage the dossier: select exactly the three CRITICAL cryptographic findings and tag each sub-area.",
      hints:["Not every finding is crypto — two are outright noise, and two are real but minor. Critical = data or trust is exposed NOW.","Expired cert serving traffic, unescrowed departed-admin keys, unsalted MD5 password export. The UDP printers and the CDN cost are noise.","Criticals: F-01→certificates, F-02→key management, F-05→hashing/salting."],
      check:(e)=>{ const sel=Object.keys(e.dossier||{}).filter(k=>e.dossier[k]);
        const ok=sel.length===3&&sel.includes("F-01")&&sel.includes("F-02")&&sel.includes("F-05")&&e.h1class&&e.h1class["F-01"]==="certs"&&e.h1class["F-02"]==="keymgmt"&&e.h1class["F-05"]==="hashing";
        return {pass:ok, msg: ok ? "Clean triage: F-04/F-07 were red herrings, F-03/F-06 real-but-minor, F-08 acceptable as designed. The three criticals map to three stations you must commission." : "Exactly three criticals. Expired cert = certificates; unescrowed departed-admin keys = key management; unsalted MD5 export = hashing/salting. The printer-UDP and CDN findings are not cryptographic." }; } },
    { id:"H2", pillar:"P3", station:"c", title:"Certificate forensics: identify the revoked-but-serving serial, how it was caught, the chain anchor, and order the response.",
      hints:["Read the OCSP responses against the live inventory. One serial answers REVOKED while still serving.","api.arhn.example serves 77:9B and live OCSP says REVOKED (keyCompromise). You cannot revoke what is already revoked — the CA step is the trap.","Serial 77:9B; caught by OCSP; anchored by ARHN-ROOT-CA; order: confirm → remove from service → reissue & deploy."],
      check:(e)=>{ const ok=serialNorm(e.h2serial)==="779b"&&e.h2check==="ocsp"&&e.h2root==="root"&&JSON.stringify(e.h2seq)===JSON.stringify(["confirm","remove","replace"]);
        return {pass:ok, msg: ok ? "Forensics clean: 77:9B revoked yet serving; OCSP caught it live; the chain ends at ARHN-ROOT-CA (the root of trust); and you avoided re-revoking an already-revoked cert." : "Re-read the evidence. Serial 77:9B (strip the colon — 779b). Live OCSP flagged it — not the weekly CRL. Chain anchor = ARHN-ROOT-CA. Correct order: confirm via OCSP → take out of service → reissue & deploy. 'Revoke on the CA' is the trap: it is already revoked." }; } },
    { id:"H3", pillar:"P4", station:"e", title:"Commission the patient portal cipher posture: transport, key exchange, algorithm, length — then justify the exchange.",
      hints:["New build, health data, public-facing. Modern floor: TLS 1.3, ephemeral exchange, AES-256.","Transport=TLS 1.3; key exchange=ECDHE ephemeral; algorithm=AES; length=256. The property is PFS.","Four exact picks + 'Perfect Forward Secrecy' justification."],
      check:(e)=>{ const p=e.posture||{}; const ok=p.transport==="tls13"&&p.kx==="ephemeral"&&p.alg==="aes"&&p.len==="256"&&e.postwhy==="pfs";
        return {pass:ok, msg: ok ? "Posture accepted: TLS 1.3 + ephemeral ECDHE + AES-256. Justification locked on PFS — past captures stay sealed even if a long-term key leaks later." : "Exact values required: TLS 1.3 (not 1.2/plain HTTP), ephemeral ECDHE (not static RSA), AES (not 3DES), 256 (not 128/64). Justification = Perfect Forward Secrecy." }; } },
    { id:"H4", pillar:"P2", station:"e", title:"Protection matrix, strict: all six asset levels exact AND both certificate type picks exact.",
      hints:["Every row must be exact — near-misses are rejected. The two cert picks were instrument 2 at the Certificates station.","Laptop→full-disk; /boot→partition; docs→file; backup volume→volume; DB→database; SSN column→record. Farm→wildcard; two-depth pair→SAN.","All 6 levels + wildcard + SAN."],
      check:(e)=>{ const ok=Object.keys(LEVELS_EXPECT).every(k=>e.levels[k]===LEVELS_EXPECT[k])&&e.ctype.farm==="wildcard"&&e.ctype.hr==="san";
        return {pass:ok, msg: ok ? "Matrix exact. Boundary discipline + cert-type discipline in one sweep — this is the 'appropriate solution' skill the exam scores." : "Every row is checked exactly. Re-visit the level board (all six) and the certificate type desk (farm→wildcard, two-depth pair→SAN). Near-misses fail here on purpose." }; } },
    { id:"H5", pillar:"P3", station:"h", title:"Signature forensics: verdict on the CFO memo + the single control that would have caught it.",
      hints:["Compare three values: payload hash vs recomputed hash; claimed fingerprint vs actual signing key fingerprint.","Payload 5c8d… ≠ recomputed 8f4a… → body tampered. AB:12… ≠ CD:34… → signed by a different key than claimed. Both → verdict 'both'. The catch = automated verification against the published key.","Verdict 'different key AND tampered'; control: automated signature verification."],
      check:(e)=>{ const ok=e.h5verdict==="both"&&e.h5ctrl==="verify";
        return {pass:ok, msg: ok ? "Correct: two independent failures, one verdict. Automated verification against the CFO's published key would have stopped it at the door — that is detection discipline." : "Two mismatches in the evidence: the decrypted payload hash differs from the recomputed body hash (tampered) AND the signing key fingerprint differs from the claimed one (wrong key). Control: automated verification against the published key. FDE and salting do not check signatures." }; } },
    { id:"H6", pillar:"P3", station:"h", title:"Password-dump forensics: which store falls to a rainbow table, and the correct remediation.",
      hints:["In Store A three users share one identical hash — what does that tell the attacker?","Identical unsalted hashes = one precomputed table cracks every row. Fix: per-user salt + a modern hash (SHA-256/bcrypt-class). A static salt + MD5 just moves the table.","Store A vulnerable; fix = per-user salt + modern hash."],
      check:(e)=>{ const ok=e.h6vuln==="a"&&e.h6fix==="salt-sha";
        return {pass:ok, msg: ok ? "Correct. Store A leaked password equality instantly; Store B's per-user salts force per-row work. Remediation = per-user salt + modern algorithm — never MD5, never a single static salt." : "Store A: identical hashes across users → one rainbow table hits all. Store B is salted. Remediation: per-user salt + modern hash; 'static salt + MD5' is a trap, and encrypting the store does not stop offline cracking of the hashes." }; } },
    { id:"H7", pillar:"P4", station:"m", title:"Departed-admin incident: order the five-step response (one pool item is a trap).",
      hints:["Contain first (what can he still authenticate with?), then limit blast radius, then recover the data, then prevent a repeat, then clean up.","Revoke his certs → rotate reachable keys → rebuild+re-encrypt backups → mandate escrow → destroy stale keys. 'Re-issue his old keys' is the trap: keys are regenerated, never re-issued.","revoke → rotate → rebuild → escrow → destroy."],
      check:(e)=>{ const ok=JSON.stringify(e.h7seq)===JSON.stringify(["revoke","rotate","rebuild","escrow","destroy"]);
        return {pass:ok, msg: ok ? "Response ordered like an incident plan: contain (revoke/rotate), recover (rebuild), prevent (escrow), clean (destroy). You never re-issue a departed admin's keys — they are destroyed and regenerated." : "Order matters and is graded exactly: revoke → rotate → rebuild → escrow → destroy. 'Re-issue his old keys to the replacement' is the trap — compromised-key history does not transfer." }; } },
    { id:"H8", pillar:"P3", station:"debrief", title:"MITRE map: pick the exact ATT&CK ID for five defensive pairings.",
      hints:["The umbrella mitigation covering encryption at rest/in transit is M1041. Sniffing, private keys, forged certs, AitM, NTDS — all technique IDs.","Rows: umbrella=M1041; span-port sniffer=T1040; unprotected private keys=T1552.004; forged certs=T1649; cert validation defeats=T1557.","M1041, T1040, T1552.004, T1649, T1557."],
      check:(e)=>{ const m=e.mitre||{}; const ok=m.m1==="M1041"&&m.m2==="T1040"&&m.m3==="T1552.004"&&m.m4==="T1649"&&m.m5==="T1557";
        return {pass:ok, msg: ok ? "Map verified against attack.mitre.org: M1041 Encrypt Sensitive Information mitigates T1040, T1552.004, T1649, T1557(.002), T1003.003 and T1558 — your stations are a mitigation portfolio, not a settings page." : "Exact IDs required: umbrella=M1041; span-port sniffer=T1040 Network Sniffing; unprotected private keys=T1552.004 (Unsecured Credentials: Private Keys); stolen/forged certs=T1649; cert validation defeats=T1557 (Adversary-in-the-Middle)." }; } },
    { id:"H9", pillar:"P1", station:"debrief", title:"Property grid: map four tools to the one property each delivers (one row is not cryptography).",
      hints:["Encryption hides; hashing detects change; signatures bind identity. RAID neither hides nor binds — what does mirroring give you?","Encryption→Confidentiality; Hashing→Integrity; Signature→Non-repudiation; RAID→Availability (not crypto).","confidentiality / integrity / non-repudiation / availability."],
      check:(e)=>{ const p=e.props9||{}; const ok=p.p1==="conf"&&p.p2==="int"&&p.p3==="nonrep"&&p.p4==="avail";
        return {pass:ok, msg: ok ? "Grid exact. This is objective 1.3's core judgment: pick the tool by the property you owe the auditor — and know which 'protections' were never cryptographic." : "Each tool delivers ONE primary property: encryption→confidentiality; hashing→integrity; signature→non-repudiation; RAID mirroring→availability (an uptime control, not crypto)." }; } }
  ]
};

/* ---------- quiz data ---------- */
/* Every item rebuilt to R5 discipline: options within one word of each other, correct answer never longest,
   explanations address the tempting distractors. t = topic label (feeds the focus-area report). */

const QUIZ = {
  medium: [
    { t:"Hashing vs encryption", q:"A colleague says: “We hashed the signed contracts, so nobody can read them.” What is wrong?",
      o:["Hashing becomes reversible once salts are added","Hashing only works when certificates are attached","Hashing encrypts files with the recipient’s key","Hashing detects changes: it never hides data"], c:3,
      x:"A hash is a one-way fingerprint: it detects change and hides nothing — confidentiality needs encryption. “Encrypts with the recipient’s key” misuses public keys (they encrypt and verify, they don’t hash); certificates sign identities rather than hashes; and hashes are not reversible — salts add no readability." },
    { t:"What a signature proves", q:"What does a digital signature prove that a bare hash cannot?",
      o:["Higher availability of the signing service itself","A faster digest for very large documents","Confidentiality of the memo from every reader","Non-repudiation: only the private key could sign"], c:3,
      x:"Anyone can compute a hash; only the private key holder can create the signature — that binding is non-repudiation. Signatures add no availability (redundancy does), no speed (the digest is unchanged), and no confidentiality (the document stays readable)." },
    { t:"CRL vs OCSP", q:"CRL versus OCSP — which statement is true?",
      o:["CRL answers one certificate faster than OCSP","Both are symmetric ciphers used inside TLS","OCSP is a periodic list; CRL answers live","CRL is a periodic list; OCSP answers live"], c:3,
      x:"A CRL is a downloaded list of revoked serials refreshed periodically; OCSP answers one certificate’s status in real time (stapling caches the signed answer server-side). Option 3 swaps the two, option 2 confuses revocation protocols with ciphers, and option 1 inverts the latency profile." },
    { t:"Data-at-rest control", q:"A clinician’s laptop is stolen (INC-001). Which control most directly protects its data at rest?",
      o:["Full-disk encryption on that laptop","Per-user salting in the password store","OCSP stapling on the patient portal","Key escrow with a trusted custodian"], c:0,
      x:"FDE protects the whole volume at rest — the smallest boundary covering a stolen disk. Salting guards password stores, stapling is revocation transport, and escrow is recoverability — none of them touches the stolen disk." },
    { t:"Purpose of salting", q:"Why salt passwords per user?",
      o:["TLS handshakes demand salted password stores","Salting makes every login verify faster","Salting also encrypts the password more strongly","Rainbow tables stop matching every row"], c:3,
      x:"Without salts, identical passwords share one digest and a single precomputed table cracks all rows; a unique per-user salt forces per-row work. Salting is not encryption (it adds randomness, not secrecy), it does not speed up logins, and TLS is unrelated to password storage." },
    { t:"Wildcard scope", q:"What does the wildcard in *.arhn.example cover?",
      o:["One label deep: billing.arhn.example, never deeper names","Every subdomain of the domain, unlimited depth","Only the bare apex domain arhn.example","Only hosts named inside a SAN field"], c:0,
      x:"Wildcards match exactly one label: billing.arhn.example yes, a.b.arhn.example no — deeper names need a SAN certificate listing exact names. “Unlimited depth” is the classic misconception, the apex itself is not covered by its own wildcard, and SAN lists exact names rather than defining wildcard scope." },
    { t:"Purpose of escrow", q:"The purpose of key escrow is…",
      o:["Custodians recover data when keys go missing","Private keys get published for faster access","Revocation checking becomes unnecessary after adoption","Key rotation schedules can safely be skipped"], c:0,
      x:"Escrow trades a small custody risk for recoverability (INC-003 is what happens without it). It never publishes keys, never replaces revocation checking, and never excuses rotation — those are separate lifecycle controls." }
  ],
  hard: [
    { t:"Live revoked certificate", q:"api.arhn.example serves serial 77:9B; live OCSP reports REVOKED (keyCompromise). Service must not drop. First move?",
      o:["Wait for the next weekly CRL publication","Revoke the ARHN-ROOT-CA and stop all trust","Keep serving — revocation status is advisory","Swap in a reissued certificate; retire 77:9B"], c:3,
      x:"The deployed copy is the problem, so replace it. The CA needs nothing — 77:9B is already revoked — and revoking the root would burn every chain that depends on it; waiting leaves a compromised certificate live, and revocation status is never advisory." },
    { t:"Forward secrecy failure", q:"Six months of TLS sessions were captured. Today the server’s static-RSA private key is stolen. Which captured sessions are decryptable?",
      o:["Only sessions the CA countersigned at issuance","Only the sessions captured after today’s theft","None — captures stay sealed without session caches","All of them: static keys lack forward secrecy"], c:3,
      x:"Without ephemeral exchange, one long-term key unlocks every past capture; ephemeral ECDHE (Perfect Forward Secrecy) is the fix drilled in Station 3. Captures need no session cache, CA signatures play no role in session decryption, and the compromise is retroactive — not limited to today." },
    { t:"M1041 implementation", q:"Which control directly implements M1041 (Encrypt Sensitive Information) for the appointments database?",
      o:["The destruction calendar for retired keys","Per-user salts in the password store","OCSP stapling on the patient portal","Record-level encryption on the PII columns"], c:3,
      x:"M1041’s implementation areas include database and column-level encryption — record-level PII encryption is exactly that. Stapling is revocation transport, salts guard password stores, and destruction is lifecycle hygiene rather than data encryption." },
    { t:"Unescrowed key incident", q:"Departed admin, unescrowed keys, unreadable tape. Correct pairing?",
      o:["Re-issue the old keys to the replacement","Shorten rotation intervals to hide the gap","Ship the tape to the departed admin","Rebuild backups from source; mandate escrow forward"], c:3,
      x:"You recover by regenerating from source data and prevent recurrence with mandatory escrow. Old keys are never re-issued (compromised history does not transfer), mailing tapes out widens exposure, and hiding a gap is an audit finding, not a fix." },
    { t:"Revocation transport", q:"The OCSP responder is down; the portal must keep proving revocation status quickly. Best option?",
      o:["Publish the portal’s key to all responders","Re-issue the portal certificate using MD5","Disable revocation checking until responders recover","OCSP stapling with cached responses inside nextUpdate"], c:3,
      x:"Stapling decouples visitors from the responder: the server presents a cached, signed, time-bounded status. Disabling checking is how INC-004 happened, MD5 is retired for security work, and publishing private keys is surrender, not resilience." },
    { t:"Integrity verdict", q:"A backup manifest hash differs from the freshly computed hash of the received copy. This indicates:",
      o:["A rainbow table matched the manifest","The issuing certificate authority has expired","The encryption layer on the backup failed","The received copy changed — quarantine it"], c:3,
      x:"Hashes answer one question — did the bytes change? A mismatch is an integrity event, so quarantine and investigate. Encryption failures, CA expiry and rainbow-table hits belong to entirely different failure families; none of them changes a digest." },
    { t:"Key retirement", q:"Why destroy a retired key instead of archiving it?",
      o:["Because archived keys cannot be hashed quickly","Because rotation policy forbids storing old keys","To free disk space on the key server","A retired key still decrypts everything it protected"], c:3,
      x:"Compromise is retroactive for everything the key ever protected — destruction removes that risk, while escrow covers what must be recovered. Disk space is trivial next to the exposure, policy states the rule without the reason, and hashing speed has nothing to do with stored keys." }
  ]
};

const LEVEL_ASSETS=[["laptop","Clinician laptop 4-C disk (INC-001)"],["partition","Server /boot partition"],["file","Shared-drive project documents"],["volume","External backup volume"],["database","Patient records database (TDE)"],["record","Single SSN column inside that database"]];

const LEVEL_OPTS=[["full-disk","Full-disk encryption"],["partition","Partition encryption"],["file","File-level encryption"],["volume","Volume encryption"],["database","Database (TDE)"],["record","Record / column-level encryption"]];

const POSTURE_ROWS=[
 ["transport","Transport protocol",[["","— select —"],["tls13","TLS 1.3"],["tls12","TLS 1.2"],["http","HTTP/2 plaintext"],["ssh","SSH tunnel"]]],
 ["kx","Key exchange",[["","— select —"],["ephemeral","Ephemeral ECDHE"],["static","Static RSA key transport"],["none","None"]]],
 ["alg","Cipher algorithm",[["","— select —"],["aes","AES"],["3des","3DES"],["rsa","RSA"]]],
 ["len","Key length",[["","— select —"],["256","256-bit"],["128","128-bit"],["64","64-bit"]]]];

const CAL_ROT=[["","— rotation interval —"],["30","30 days"],["90","90 days"],["365","1 year"],["1825","5 years"]];

const CAL_DESTROY=[["","— disposition —"],["destroy","Destroy securely"],["keep","Keep forever"],["publish","Publish for archive"]];

const CAL_LEN=[["","— key length —"],["2048","Upgrade to RSA-2048"],["4096","Upgrade to RSA-4096"],["keep1024","Keep 1024-bit"]];

const MITRE_ROWS=[
 ["m1","Umbrella mitigation covering encryption at rest &amp; in transit",[["","— select ID —"],["M1041","M1041"],["T1040","T1040"],["T1649","T1649"],["T1557","T1557"],["T1003.003","T1003.003"]]],
 ["m2","The technique TLS + ephemeral exchange defeats on a span-port sniffer",[["","— select ID —"],["M1041","M1041"],["T1040","T1040"],["T1552.004","T1552.004"],["T1649","T1649"],["T1557","T1557"]]],
 ["m3","Unprotected private keys on disk enable…",[["","— select ID —"],["T1040","T1040"],["T1552.004","T1552.004"],["T1003.003","T1003.003"],["T1649","T1649"],["T1558.004","T1558.004"]]],
 ["m4","Stolen or forged authentication certificates are…",[["","— select ID —"],["T1552.004","T1552.004"],["T1649","T1649"],["T1040","T1040"],["T1557","T1557"],["M1041","M1041"]]],
 ["m5","Server-side certificate validation defeats…",[["","— select ID —"],["T1557","T1557"],["T1003.003","T1003.003"],["T1552.004","T1552.004"],["T1649","T1649"],["T1040","T1040"]]]];

const PROP_ROWS=[
 ["p1","Encryption (e.g., AES)"],["p2","Hashing (e.g., SHA-256)"],["p3","Digital signature"],["p4","RAID mirroring"]];

const PROP_OPTS=[["","— select —"],["conf","Confidentiality"],["int","Integrity"],["nonrep","Non-repudiation"],["avail","Availability"]];

const LANE_TASKS=[["enc","Encrypt a file so only Alice can open it"],["dec","Decrypt a message that was sent to you"],["sign","Create your digital signature on a memo"],["verify","Verify a signature you just received"]];

const SALT_USERS=[["j.alvarez","9f2c7d1e"],["m.okafor","44a1b203"],["t.nguyen","1e77cc48"]];

const SALT_PW="Winter2026!";

const SIGN_STEPS={hash:"Compute the document hash (SHA-256)",priv:"Encrypt the hash with the signer’s PRIVATE key",attach:"Attach signature + signer certificate",verify:"Recipient decrypts with the PUBLIC key and compares hashes",email:"Email the document unencrypted for speed"};

const FINDINGS=[
 ["F-01","portal.arhn.example serves an EXPIRED wildcard certificate (notAfter 2026-10-01)."],
 ["F-02","Backup tape keys: sole custodian departed 9 days ago; no escrow record; tape unreadable."],
 ["F-05","Password export spreadsheet contains UNSALTED MD5 hashes for 240 accounts."],
 ["F-03","Appointments DB: record-level encryption of the PII column is on the roadmap (volume-level active)."],
 ["F-06","VPN concentrator negotiates AES-128; policy floor for health data is AES-256."],
 ["F-08","Internal staff app signed by ARHN internal CA; ARHN-ROOT-CA present in staff trust stores."],
 ["F-04","Printer fleet pushes firmware over unauthenticated UDP broadcast."],
 ["F-07","Marketing site moved to a new CDN; bandwidth doubled, costs up."]];

const H1_CLASSES=[["","— sub-area —"],["certs","Certificates"],["keymgmt","Key management"],["hashing","Hashing / salting"],["enclevels","Encryption levels"]];

/* ---------- R2 answer lock (after a passing validation, answers freeze) + R6 shuffles ---------- */
