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

# For the site owner

Everything below is how you add content. The site is designed so that adding a topic or an
exercise never means editing a list by hand: you add one JSON entry or one command, and the pages,
the counts, the sitemap and the coverage page all rebuild themselves.

## One-time configuration

Open `assets/js/config.js` and check these three values:

| Setting | What it does |
|---|---|
| `repoUrl` | Your GitHub repository. It drives every canonical URL, the sitemap, the footer link and the "report a problem" links. |
| `donationButtonId` | Your PayPal hosted button id. Already set to `KNUSPQTVR9WCU`. |
| `donationMinAmount` | The smallest donation the site offers. Already set to `5`. |

After changing `repoUrl`, run:

```bash
python scripts/build_catalog.py
python scripts/generate_pages.py
```

---

## Adding a topic — the fast way

One command creates the data file, validates the id, and rebuilds the site. Every new topic
automatically gets its own page at `topics/<id>.html`.

```bash
python scripts/new_topic.py --type keyword --id threat-hunting --title "Threat Hunting"
```

```bash
python scripts/new_topic.py --type technique --id t1059-002 --title "Python" \
    --external-id T1059.002 --parent-tactic ta0002
```

```bash
python scripts/new_topic.py --type certification --id az-104 --title "Microsoft AZ-104" \
    --external-id AZ-104 --theme Microsoft
```

Useful flags:

| Flag | Meaning |
|---|---|
| `--type` | `keyword`, `certification`, `tactic`, `technique`, `mitigation`, `detection` or `group` |
| `--id` | Lowercase letters, digits and hyphens. Becomes the page address, so pick it once and keep it |
| `--title` | What visitors see |
| `--external-id` | The ATT&CK number, exam code or group id, for example `T1059.002` or `CS0-003` |
| `--theme` | The group it appears under on the listing page, for example `Network Security` or `CompTIA` |
| `--difficulty` | `hard`, `very-hard` or `extreme` |
| `--tags` | Comma separated |
| `--source` / `--source-label` | The page you took the facts from |
| `--dry-run` | Print the file it would write, and stop |

Then do the two things the command cannot do for you:

1. **Write the beginner explanation.** Open the new file in `data/<type>/<id>.json` and replace the
   `[SCAFFOLD]` text in the `beginner` block. It has five parts, and they are the five headings a
   visitor sees first:
   - `definition` — what it is, in two or three short sentences
   - `whyItMatters` — the problem it solves, or the risk if you ignore it
   - `howItWorks` — a list of four to six steps, in plain language
   - `example` — one real-world comparison the reader can picture
   - `takeaways` — two or three things to remember

   Write it in B1 English: short sentences, everyday words, and define any technical term the
   moment you use it. `python scripts/validate.py` fails while the `[SCAFFOLD]` marker is still
   there, which is deliberate.

2. **Fill in the rest.** `objectives`, `tags`, and `sources` for anything that makes factual claims.
   Certifications and all five MITRE types also need an `attributionNote`, which the scaffolder
   fills in correctly for you.

## Adding a topic — the manual way

If you prefer to copy and edit, that works just as well.

1. Copy an existing file, for example `data/keywords/firewall.json`, to
   `data/keywords/<your-new-id>.json`.
2. Set `id` to the new id. **The `id` must match the file name**, or validation fails.
3. Fill in `title`, `shortTitle`, `theme`, `summary` (200 characters or more), the `beginner` block,
   `tags` and `sources`.
4. Leave `exercises` as an empty list `[]` for now. The page will say "No exercises yet", which is
   honest.
5. Run:

```bash
python scripts/build_catalog.py
python scripts/generate_pages.py
python scripts/validate.py
```

The new page appears at `topics/<your-new-id>.html`, and it is listed on its catalog page and in
the search immediately. Nothing else needs touching.

### What each field means

| Field | Required | Notes |
|---|---|---|
| `id` | Yes | Must equal the file name. `^[a-z0-9][a-z0-9-]{1,63}$` |
| `type` | Yes | One of the seven catalog names |
| `title` / `shortTitle` | Yes | `shortTitle` is used in compact chip lists |
| `theme` | Yes | The grouping on the listing page |
| `summary` | Yes | 200+ characters, written for someone who already works in security. Becomes the page's search description |
| `beginner` | Yes | The plain-language block described above |
| `tags` | Yes | At least one, lowercase |
| `exercises` | Yes (except certifications) | A list, any length including empty |
| `chapters` | Certifications only | Replaces `exercises` at this level |
| `sources` | Yes | At least one `https://` link |
| `attributionNote` | Certifications and MITRE types | Says plainly that the site is not affiliated and that the content is not official |
| `difficulty` | No | `hard`, `very-hard` or `extreme` |
| `relatedTopics` | No | Ids of other topics to cross-link |

---

## Adding an exercise and linking it

An exercise can be any standalone HTML file. It lives wherever you like under `exercises/`, so you
can keep your own folder names.

### The fast way

```bash
python scripts/new_exercise.py --topic firewall --title "Reading firewall logs" \
    --path "exercises/keywords/firewall-logs.html" --kind lesson --minutes 20
```

For a certification, say which chapter it belongs to:

```bash
python scripts/new_exercise.py --topic cysa-plus --chapter 3 \
    --title "Triage a suspicious login" \
    --path "exercises/CySA+/triage-suspicious-login.html" \
    --kind scenario --minutes 25
```

The command checks the file exists, refuses to add the same path twice, writes the entry, and
rebuilds. Add `--allow-missing` to list an exercise you have not written yet: the page then shows
"Coming soon" instead of a broken button.

Flags: `--kind` is one of `lesson`, `quiz`, `lab`, `exam`, `scenario`. `--minutes` shows an estimate.
`--summary` prints one sentence under the title.

### The manual way

Open `data/<type>/<topic-id>.json` and add an object to `exercises`:

```json
"exercises": [
  {
    "title": "Reading firewall logs",
    "path": "exercises/keywords/firewall-logs.html",
    "kind": "lesson",
    "status": "published",
    "summary": "Work through a day of deny records and decide which ones matter.",
    "minutes": 20
  }
]
```

`status` is `published`, `draft` or `missing`. A `published` exercise whose file is not on disk
fails validation, on purpose: the coverage page must never claim something you cannot open.

Then run the three commands again.

### Making an exercise report its score

This is optional. If your exercise tells the site its result, the score is saved and shown in
"Continue where you left off". If it does not, the site still tries to read the result from the
screen, so a results panel that shows a percentage usually works on its own.

To be certain, add this to your exercise's own `<script>`, when the results are shown:

```js
try {
  var percent = Math.round(correct / total * 100);
  parent.postMessage({
    type: "CYBERPULSE_SCORE",
    topicId: "firewall",
    batch: 1,
    score: correct,
    total: total,
    percent: percent,
    passed: percent >= 70
  }, location.origin);
} catch (e) { /* opened outside the site, nothing to report to */ }
```

The `try`/`catch` matters: it lets the same file work when you open it directly.

Your exercise can also receive a handshake from the site, and should ignore it if it does not need
it:

```js
window.addEventListener("message", function (ev) {
  if (ev.data && ev.data.type === "CYBERPULSE_INIT") {
    // ev.data.username, ev.data.country, ev.data.theme, ev.data.language
    if (ev.data.theme) { document.documentElement.setAttribute("data-theme", ev.data.theme); }
  }
});
```

---

## Certifications: chapters and their exercises

A certification is a syllabus, so it is organised by chapter rather than by a flat list. Each
chapter holds its own objectives and its own exercises, and there is no limit on how many.

The chapters were generated from the official exam domains when the topic was created:

```json
"chapters": [
  {
    "number": 1,
    "title": "Security Operations",
    "weight": "33%",
    "objectives": ["Security Operations: covers the collection, enrichment and correlation of security telemetry..."],
    "exercises": [
      {
        "title": "GLM Lesson 1.1, Understanding Cybersecurity Leadership Concepts, Part 1",
        "path": "exercises/CySA+/GLM - Lesson 1.1 - Understanding Cybersecurity Leadership Concepts - Part 1.html",
        "kind": "lesson",
        "status": "published",
        "minutes": 30
      }
    ]
  }
]
```

**To rename a chapter or change what it covers**, edit `title` and `objectives` directly.

**To add a chapter**, copy an existing chapter object, give it the next `number`, and rewrite the
title and objectives. Chapter numbers must be unique within a topic.

**To attach an exercise to a chapter**, either use `--chapter` with `new_exercise.py`, or add the
object to that chapter's `exercises` list by hand.

**To move an exercise between chapters**, cut the object from one list and paste it into the other.
Paths must stay unique across the whole topic.

**To add material that belongs to no single chapter**, put it in the topic's own `exercises` list,
above `chapters`. It appears under "Additional exercises".

Then rebuild:

```bash
python scripts/build_catalog.py
python scripts/generate_pages.py
python scripts/validate.py
```

---

## The three commands you will use most

```bash
python scripts/build_catalog.py    # reads data/, writes data/catalog.json, sitemap.xml, robots.txt
python scripts/generate_pages.py   # writes topics/*.html, refreshes counts and absolute URLs
python scripts/validate.py         # checks everything; must exit 0 before you push
```

Run them in that order after any change to `data/`. The third one prints a numbered list of
problems and exits 1 if anything is wrong.

Other scripts:

| Script | Purpose |
|---|---|
| `scripts/new_topic.py` | Add a study topic and get its page |
| `scripts/new_exercise.py` | Link an exercise file to a topic or a chapter |
| `scripts/generate_og.py` | Rebuild the social preview images |
| `scripts/generate_og.py --png` | Also write PNG previews (needs Pillow) |
| `scripts/generate_og.py --icons` | Rebuild the app icon PNGs (needs Pillow) |

Everything uses the Python standard library only. Pillow is optional and only needed for PNG
output.

---

## Donations

The **Donate** button is in the header of every page and in the footer of every page. It opens your
PayPal hosted button in a new tab with the minimum amount pre-filled, and the footer offers
5, 10, 25 and 50 EUR presets.

Two honest notes:

- A PayPal hosted button cannot be forced to a minimum by a link. The site always offers the
  minimum or more, and pre-fills it, but the real enforcement is a setting in your PayPal button
  ("donors choose the amount" with a minimum). Set it there as well.
- The donation wording says plainly that this is voluntary personal support, not a purchase, and
  not tax-deductible. Do not change that unless your legal status actually changes.

The impact ledger is `data/donations.json`. It ships at zero with an empty ledger. Update it by
hand when money arrives, and keep it truthful.

---

## Privacy

There are no cookies of any kind, no analytics, no third-party requests and no fingerprinting.

The name and country a visitor enters are stored in their own browser, in `localStorage`, and are
used only to label their own results. Statistics are in **local** mode by default, which means
nothing ever leaves the browser. The public statistics page says so plainly.

A visitor can delete everything with one button in the footer. The privacy and cookie pages in
`pages/` list every stored key by name.

If you ever switch statistics to remote mode, publish the privacy and cookie pages first, and
read `owner-handover/statistics-backend/README.md` before you do.

---

## Licensing

- **Code** — MIT. See [LICENSE](LICENSE).
- **Content** — Creative Commons BY-NC-SA 4.0. See [LICENSE-CONTENT](LICENSE-CONTENT).

In plain words: you may reuse and adapt the study material for non-commercial teaching, with
attribution, and anything you build on it must carry the same licence. Commercial reuse is not
permitted.

---

## Independence and attribution

CyberPulseAcademy is an independent, non-commercial study site. It is not affiliated with,
endorsed by, sponsored by or approved by MITRE, CompTIA, ISC2, ISACA, OffSec, EC-Council, GIAC,
Microsoft, AWS, Google, Cisco, the Linux Foundation or ISO/IEC.

ATT&CK® is a registered trademark of The MITRE Corporation. Content that refers to ATT&CK is
derived from the publicly available ATT&CK knowledge base, is not official MITRE material, and has
not been reviewed or approved by MITRE. See
[MITRE's Terms of Use](https://attack.mitre.org/resources/terms-of-use/).

No vendor logo appears anywhere on this site, because a logo implies an endorsement that does not
exist. The renderer refuses to draw one inside a certification card.

Certification objective summaries are paraphrased from publicly available exam objectives. No exam
questions are reproduced.

---

## Common problems

**The page is blank when I open `index.html` from my desktop.**
Serve it over HTTP instead: `python -m http.server 8000`, then open <http://localhost:8000/>.

**I added a topic and it does not appear.**
Run `python scripts/build_catalog.py` then `python scripts/generate_pages.py`. The listing pages
read `data/catalog.json`, which only exists after the build. Then hard-refresh the browser.

**An exercise says "Coming soon" but the file is there.**
Its `status` is still `missing` or `draft`. Set it to `published` and rebuild.

**An exercise does not open.**
Either the path in the JSON does not match the file on disk, or the file is over the size limit, or
it took more than five seconds to load. Open the file directly in a browser to check it works on
its own.

**`validate.py` complains about an outside web address.**
Add the host to `ALLOWED_HOSTS` in `scripts/validate.py` only if it is a deliberate decision. If it
is a CDN, a font service or an analytics script, do not add it.

**`validate.py` complains about an IP address.**
Defang it: `192[.]0[.]2[.]10`. Documentation ranges and the word "example" nearby are already
allowed.

**Visitors keep seeing an old version.**
Bump `siteVersion` in `assets/js/config.js`, bump `SHELL_VERSION` in `service-worker.js`, then
re-run `python scripts/generate_pages.py`.

---

## Requirements

Python 3.8 or newer for the build scripts, and nothing else. Pillow is optional:

```bash
python -m pip install -r scripts/requirements.txt
```
