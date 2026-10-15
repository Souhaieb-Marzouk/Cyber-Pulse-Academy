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

## Adding an exercise

**One file, with any name:**

```bash
python scripts/new_exercise.py --topic firewall --title "Reading firewall logs" \
    --path "exercises/keywords/firewall/firewall-logs.html" --minutes 20
```

**A whole batch drop**, named by the convention the generator produces
(`exercises/<catalog>/<EXTERNAL_ID>/<EXTERNAL_ID>_<TIER>.html`):

```bash
python scripts/sync_exercises.py            # record every new batch on its topic
python scripts/build_catalog.py             # rebuild data/catalog.json, sitemap.xml, robots.txt
python scripts/generate_pages.py            # rebuild the study pages and the injected figures
python scripts/validate.py                  # the checks; the repository must be publishable
```

`sync_exercises.py` fills the reserved slot for each tier it finds, adds the slot when a
tier has no entry yet, reports files it cannot match instead of guessing, and takes
`--check` (write nothing, exit 1 if work is unlinked) or `--dry-run`.

**Why the home-page numbers cannot drift.** Every figure on the home page — the coverage
bars, their colours and the percentages beside them — is derived from `data/catalog.json`,
which is derived from the topic JSON files. Nothing is typed in by hand: the build injects
the values into the static HTML, and `assets/js/catalog-render.js` recomputes them from the
manifest when the page loads. Add a batch, record it, rebuild, and the bars, the colours and
the percentages move on their own. The one thing that does *not* happen by itself is the
recording step, which is what the two commands above are for — and `validate.py` fails if an
exercise file exists that no topic lists, so a missed step cannot ship quietly.

---