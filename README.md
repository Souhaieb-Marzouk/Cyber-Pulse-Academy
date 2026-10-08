# CyberPulseAcademy

**Learn cyber security by doing it, not by reading about it.**

A free, non-commercial study site. Every topic opens with a plain-language explanation you can
follow even with no security background, then gives you hands-on exercises where you read the
evidence, decide what to do, and find out why the answer was right or wrong.

Live site: **https://souhaieb-marzouk.github.io/Cyber-Pulse-Academy/**

- No account, no sign-up, no email address
- No adverts, no third-party scripts, no trackers, no cookies
- Works on a phone, and keeps working offline once you have visited
- 246 study pages across seven catalogs
- Results are stored in your own browser only

---

## What is in the site

| Catalog | What it covers |
|---|---|
| **Keywords** | The everyday vocabulary of the job: firewall, MFA, ransomware, zero trust, SIEM, GDPR and around a hundred more, each explained from scratch |
| **Certifications** | Study tracks for CompTIA, ISC2, ISACA, OffSec, EC-Council, GIAC, Microsoft, AWS, Google Cloud, Cisco and ISO. Each track is organised into chapters that follow the official exam domains, and each chapter lists its own exercises |
| **ATT&CK Tactics** | The fourteen goals an attacker works towards, described by what a defender can actually see |
| **ATT&CK Techniques** | The specific methods attackers use, each cross-linked to the defences and detections that address it |
| **ATT&CK Mitigations** | The controls that stop attacks, described by how they are installed in practice and where they quietly fail |
| **Detection Strategies** | How to spot a behaviour in logs: the telemetry, the logic, the false alarms and the tuning |
| **Threat Groups** | Who is behind known campaigns, attributed to public reporting rather than stated as fact |

Every topic page has the same shape: a beginner explanation, the detailed technical explanation,
the list of exercises that go with it, cross-references, sources, and answers to common questions.

---

## Viewing the site on your own computer

You must serve the folder over HTTP. Opening `index.html` by double-clicking it will show an empty
page, because browsers block `fetch()` on `file://` and only allow a service worker over HTTP.

```bash
python -m http.server 8000
```

Then open <http://localhost:8000/>. Use `python3` on macOS and Linux. Any static file server works.

---

## Publishing to GitHub Pages

1. Create a repository on github.com. Make it **Public** and do not initialise it with a README,
   a licence or a gitignore.
2. Open **GitHub Desktop**, choose **File → Add local repository**, and pick this folder. Accept
   when it offers to create a git repository.
3. Commit, then click **Publish repository** and make sure **Keep this code private** is unchecked.
4. On github.com go to **Settings → Pages**. Set **Source** to **Deploy from a branch**,
   **Branch** to **main**, and **Folder** to **/ (root)**. Save.
5. Wait about a minute. The site appears at `https://<your-user>.github.io/<your-repo>/`.

`.nojekyll` is present so GitHub Pages serves every folder as-is.

---