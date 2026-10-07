# Contributing to CyberPulseAcademy

Thank you for considering it. This is a free, non-commercial study platform, and everything good about it comes from people who know their subject giving away some of their time.

## The highest-leverage contribution: generate a missing exercise batch

There are 246 topics and each reserves three exercise batches. **738 batches are reserved and none are published yet.** Every single one is currently a gap, and every gap is a topic where a learner reads the explanation, wants to test themselves, and finds nothing.

Generating one batch takes an experienced practitioner a couple of hours. It requires no permission, no coordination, no local build setup and no prior involvement in the project. You take the prompt from this file, fill in a topic block, hand it to an AI assistant, review the output properly, and open a pull request. That is the whole process.

The **Coverage Dashboard** lists exactly which topics are still missing which batches, and it is generated from the same data the site uses, so it cannot be out of date. Start there and pick a topic you actually know.

If you want to contribute something smaller first, improving a topic summary, correcting an inaccurate source, or fixing an accessibility problem in an existing batch are all genuinely useful.

## File and folder conventions

| Path | Convention |
|---|---|
| `data/<type>/<id>.json` | One topic per file. The **file name must equal the `id` field**. |
| `topics/<id>.html` | **Generated.** Never hand-edit. Regenerate with `scripts/generate_pages.py`. |
| `exercises/<id>/batch-1.html` | Batch 1, Detection and Triage. |
| `exercises/<id>/batch-2.html` | Batch 2, Response and Hands-on. |
| `exercises/<id>/batch-3.html` | Batch 3, Adversarial and Cross-domain. |

The `<type>` directory is one of: `keywords`, `certifications`, `tactics`, `techniques`, `mitigations`, `detections`, `groups`.

**The id pattern is `^[a-z0-9][a-z0-9-]{1,63}$`** — lowercase letters, digits and hyphens only, starting with a letter or a digit, between 2 and 64 characters. `t1059-001`, `det-rdns-lookup`, `security-plus` and `g0007` are all valid. An id must be globally unique across all seven catalogs; the build fails on a duplicate.

**The file name must equal the id.** `data/techniques/t1059-001.json` must contain `"id": "t1059-001"`. `validate.py` fails if they disagree, because the id is what becomes the URL, the topic page path and the exercise folder name.

Every topic reserves exactly three batches, in order, on the canonical paths above. `validate.py` and the CI workflow both fail if a topic has any number of batch entries other than three, or if any batch `path` is not exactly `exercises/<id>/batch-<n>.html`. The `status` field is `"missing"`, `"draft"` or `"published"`, and it must be honest: a batch marked `published` without a file on disk fails the build.

## Batch differentiation: the project standard

The three batches are three different examinations of the same subject, not three variants of one quiz. This is the standard, and `scripts/new_topic.py` writes these descriptions into every new topic's batch records so the intent is visible in the data:

* **Batch 1 — Detection and Triage.** Log and alert analysis, SIEM-style queries, prioritisation between competing alerts, triage decisions, and the blue-team lens. The learner is looking at telemetry and deciding what it means and what to do first.
* **Batch 2 — Response and Hands-on.** A terminal emulator, configuration and policy completion, decision trees, spot-the-mistake, and incident timeline ordering. The learner is doing something with their hands and being judged on whether the action is correct and safe.
* **Batch 3 — Adversarial and Cross-domain.** The red-team perspective, evasion reasoning, dual-perspective pairs where the learner answers the same scenario first as attacker and then as defender, ATT&CK mapping, risk ranking, and report drafting. The learner must reason about both sides of the same event.

If a batch you generate could be swapped with one of the other two without anyone noticing, it is not differentiated enough.

## The exercise generation prompt

This is the canonical prompt, reproduced verbatim from [docs/exercise-generation-prompt.md](docs/exercise-generation-prompt.md). Copy it, fill in the **TOPIC BLOCK**, and hand it to an AI assistant of your choice. Save the output as `exercises/<topic-id>/batch-<n>.html`.

````markdown
## THE PROMPT

You are generating ONE exercise batch for CyberPulseAcademy, a free, non-commercial cyber security
study platform. The output must be a single, complete, standalone HTML file that runs by
double-clicking it, with no build step, no server, and no network access.

### TOPIC BLOCK

```
topicId        = <id, for example t1059>
topicTitle     = <title, for example Command and Scripting Interpreter>
externalId     = <ATT&CK id or exam code, for example T1059, or leave blank>
batch          = <1, 2, or 3>
batchLens      = <see the lens definitions below>
difficulty     = <hard, very-hard, or extreme>
questionCount  = <20 unless told otherwise>
passMark       = <70 unless told otherwise>
audience       = <for example SOC analyst tier 2, incident responder, cloud security engineer>
```

### LENS DEFINITIONS, use the one that matches the batch number

* **Batch 1, Detection and Triage.** Log and alert analysis, SIEM-style queries, prioritisation
  between competing alerts, triage decisions, and the blue-team perspective. The learner is
  looking at telemetry and deciding what it means and what to do first.
* **Batch 2, Response and Hands-on.** A terminal emulator, configuration and policy completion,
  decision trees, spot-the-mistake, and incident timeline ordering. The learner is doing
  something with their hands and being judged on whether the action is correct and safe.
* **Batch 3, Adversarial and Cross-domain.** The red-team perspective, evasion reasoning,
  dual-perspective pairs where the learner must answer the same scenario as attacker and then as
  defender, ATT&CK mapping, risk ranking, and report drafting. The learner must reason about both
  sides of the same event.

### HARD REQUIREMENTS

1. **One file.** All CSS in `<style>`, all JavaScript in `<script>`. No external requests of any
   kind: no CDN, no web font, no icon library, no analytics, no remote image. Inline SVG only.
2. **Under 250 KB.** Aim for 60 to 120 KB. Never embed base64 images.
3. **Declare the metadata block** so the hosting page can render an accurate header:
   ```html
   <script type="application/json" id="cm-exercise-meta">
   { "topicId": "<topicId>", "batch": <batch>, "version": "1.0.0",
     "title": "<a specific descriptive title>", "focus": "<one-line lens summary>",
     "difficulty": "<difficulty>", "questionCount": <questionCount>,
     "passMark": <passMark>, "estimatedMinutes": <a realistic integer>,
     "supportsScoreBridge": true, "resultsSelector": "#cm-results" }
   </script>
   ```
4. **Emit the score contract.** When the results screen is shown, post exactly once:
   ```js
   try {
     parent.postMessage({
       type: "CYBERPULSEACADEMY_SCORE", topicId: "<topicId>", batch: <batch>,
       score: <number correct>, total: <questionCount>,
       percent: <0-100 integer>, passed: <boolean>
     }, location.origin);
   } catch (e) { /* works standalone too */ }
   ```
5. **Accept the host handshake and ignore what you do not need:**
   ```js
   window.addEventListener("message", function (ev) {
     if (ev.data && ev.data.type === "CYBERPULSEACADEMY_INIT") {
       // ev.data.username, ev.data.country, ev.data.theme, ev.data.locale, ev.data.batch
     }
   });
   ```
   Apply `ev.data.theme` ("dark" or "light") to your own `html` element. The batch must work
   perfectly when opened directly, with no handshake ever arriving.
6. **The results container must have `id="cm-results"`** and must be hidden until the results
   screen is shown.
7. **Question quality over quantity.** Every question must be genuinely difficult and realistic
   for the stated audience. For a 20-question batch, include a deliberate spread:
   * at least 6 multiple-choice questions where more than one option is correct, and the question
     text says so explicitly
   * at least 3 questions presenting a short SIEM-style or audit-log excerpt in a `<pre>` block,
     asking for the most likely ATT&CK technique or the correct next triage step
   * at least 3 prioritisation questions, for example which of four alerts to work first and why
   * at least 2 questions whose correct answer is "this is benign activity", with a
     confident-sounding false positive as the main distractor
   * at least 2 detection-engineering questions, for example which telemetry source would actually
     let you detect a behaviour, or why a given rule would drown an analyst in false positives
   * free-text questions must accept a documented set of reasonable answers, matched
     case-insensitively and with obvious synonyms tolerated
8. **Explain every answer.** After each question is answered, show why the correct answer is
   correct and why each distractor is wrong. This is a study tool: the explanation carries more
   value than the score.
9. **Results screen** with score, total, percent, pass or fail against the pass mark, a
   per-question review linking back to the explanation, and a retry that resets cleanly.
10. **Accessibility, WCAG 2.1 AA, non-negotiable:**
    * one `<h1>`, ordered headings, a `<main>` landmark
    * every input has a real `<label>`; group choices with `<fieldset>` and `<legend>`
    * a visible focus ring that is never removed
    * `aria-live="polite"` on the score and feedback region
    * progress conveyed by text, for example "Question 7 of 20, 35 percent", never by colour or a
      bar alone
    * honour `prefers-reduced-motion`
    * fully keyboard operable, with no interaction that requires a pointer; if you use drag and
      drop anywhere, provide a click-to-select fallback
    * text contrast of at least 4.5 to 1
    * touch targets of at least 44 by 44 pixels
11. **Work on iOS Safari and Android Chrome.** Use Pointer Events if you need pointer input, guard
    every `localStorage` write in `try/catch` and fall back to an in-memory object, and never rely
    on hover.
12. **Visual continuity.** Use the CyberPulseAcademy palette so the batch does not look foreign inside
    the host iframe:
    background `#070d16`, surface `#0e1a28`, raised surface `#101d2e`, border `#1e3350`,
    primary text `#e8f1fb`, secondary text `#b3c6db`, accent `#22d3ee`, warning `#fbbf24`,
    success `#34d399`, failure `#f87171`. Provide a light theme applied by
    `html[data-theme="light"]` using background `#f6f9fc` and text `#0d1b2a`.

### CONTENT SAFETY, NON-NEGOTIABLE

* Defensive training only. No working exploit code.
* No real credentials, no real API keys, no real tokens.
* No live malware samples and no hashes of live samples.
* Nothing that crosses into how to actually attack a real target. No procedures to follow.
* Every indicator must be defanged: `hxxp://evil[.]example`, `10[.]0[.]0[.]1`.
* Use only the RFC 5737 documentation ranges `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`
  and the RFC 2606 example domains `example.com`, `example.net`, `example.org`.
* Log excerpts must be analyst-facing telemetry presented as data to investigate, such as command
  lines, process trees, parent-child relationships, encoded parameters, scheduled task creation
  and audit log entries. They must never read as instructions.
* If a question genuinely needs to reference an attack technique, describe the behaviour and what
  it leaves behind. Do not write the procedure.

### OUTPUT FORMAT

Return **only** the complete HTML file, from `<!DOCTYPE html>` to `</html>`. No commentary before
or after. No markdown fences.
````

### After you have the file

1. Save it as `exercises/<topic-id>/batch-<n>.html`.
2. In `data/<type>/<topic-id>.json`, set that batch's `"status"` to `"published"`.
3. Run the build and the gate:

   ```
   python scripts/build_catalog.py
   python scripts/generate_pages.py
   python scripts/validate.py
   ```

4. Preview with `python -m http.server 8000`, open `http://localhost:8000/topics/<topic-id>.html`, click Start on your batch, and confirm the score reaches the page. The hub shows a toast and updates "your recent attempts" when it does.
5. Also open the batch directly, outside the iframe, and confirm it still works. It must never depend on the host.

### Why the batch contract is shaped this way

The site does **not** duplicate the exercise UI. The batch owns its own interface; the hub only frames it, passes identity in, and listens for a score. That keeps hundreds of exercise files from each re-implementing navigation, and it means a batch is useful on its own, which is what lets a contributor generate one in isolation.

Because batches are generated separately and may be written before this contract existed, `assets/js/exam-hub.js` also injects a small bridge script into the same-origin iframe on load. That bridge watches for a results screen and for score-shaped `localStorage` writes, and degrades silently when it finds nothing. It is a safety net, not a substitute: a batch that emits the contract itself is always more reliable.

**An AI assistant will produce something plausible that is wrong.** Check every technical claim, every log excerpt and every answer explanation yourself. You are the author of the batch, not the assistant, and your name goes on the pull request.

## The batch technical contract

A batch must satisfy all of the following. This is the same contract the generation prompt states, collected here as a checklist so it can be verified without reading the prompt again.

* **One standalone HTML file.** All CSS in `<style>`, all JavaScript in `<script>`. Runs by double-clicking it.
* **No external dependency of any kind.** No CDN, no web font, no icon library, no analytics, no remote image, no `<link>` to another origin. Inline SVG only.
* **Under 250 KB.** Enforced by CI. Aim for 60–120 KB. Never embed base64 images.
* **Listens for the `CYBERPULSEACADEMY_INIT` postMessage** from the host, and ignores it gracefully if it does not need it. The payload carries `username`, `country`, `theme`, `locale` and `batch`. Applying `theme` is expected.
* **Emits `CYBERPULSEACADEMY_SCORE` to `parent`** with `topicId`, `batch`, `score`, `total`, `percent` and `passed`, exactly once, when the results screen appears. Posting to `location.origin` is correct. Wrap it in `try/catch` so the file still works when opened standalone.
* **May declare a metadata header block** — optional, but it lets the hosting page show an accurate label with the question count, the estimated time and the pass mark:

  ```html
  <script type="application/json" id="cm-exercise-meta">
  { "topicId": "t1059", "batch": 1, "version": "1.0.0",
    "title": "PowerShell detection and triage",
    "focus": "Detection and triage of suspicious PowerShell execution",
    "difficulty": "extreme", "questionCount": 20, "passMark": 70,
    "estimatedMinutes": 35, "supportsScoreBridge": true,
    "resultsSelector": "#cm-results" }
  </script>
  ```

  The schema for it is `data/schema/exercise-meta.schema.json`. The hub reads this block only when it is present; a batch without one still works completely.
* **Accessible to WCAG 2.1 AA**, as spelled out in item 10 of the prompt above.
* **Fully keyboard operable.** No interaction may require a pointer. If you use drag and drop, provide a click-to-select fallback.
* **Works on iOS Safari and Android Chrome.** Guard every `localStorage` write in `try/catch` with an in-memory fallback, never rely on hover, and use Pointer Events if you need pointer input.
* **The results container has `id="cm-results"`** and stays hidden until the results screen is shown.

## The JSON schema requirement

**Every topic file must validate against `data/schema/topic.schema.json`.** `validate.py` checks this as its first step and reports every failure it finds, not just the first one.

* **Batches must number exactly three**, on the canonical paths `exercises/<id>/batch-1.html`, `batch-2.html` and `batch-3.html`, in that order. Not two, not four, and not a different naming scheme.
* **Every certification, tactic, technique, mitigation, detection and group topic must cite at least one source and carry an `attributionNote`.** A keyword topic needs neither.
* Sources are objects with a `label` and an `url`, and the URL must be `https://`.
* Type-specific required fields, all enforced by the schema's conditional rules:
  * `technique` requires `parentTactic`, matching `^ta[0-9]{4}$`, which must be a tactic id present in the catalog.
  * `mitigation` requires `mitigatesTechniques`, an array of technique ids present in the catalog.
  * `detection` requires `techniqueId`, `dataSources`, `logic`, `pseudoQuery`, `falsePositives`, `tuningNotes`, `severity` and `attributionNote`.
  * `group` requires `externalId`, `linkedTechniques`, `linkedSoftware` and `attributionNote`.
* `relatedTopics` must reference ids that exist. `validate.py` fails on a dangling reference, which is what stops a rename from silently orphaning links across the site.
* The `attributionNote` types and the text that `new_topic.py` writes for each: **certification**, **tactic**, **technique**, **mitigation**, **detection**, **group**. Keep it intact and keep it accurate.

Use the scaffolder to get all of this right by default:

```
python scripts/new_topic.py --type technique --id t1059-001 --title "PowerShell" --external-id T1059.001 --parent-tactic ta0002
```

## Content safety rules

These are non-negotiable. They are the condition on which this project can exist at all, and a pull request that breaks them is rejected regardless of how good the rest of it is.

> **No working exploit code. No real credentials. No live malware samples or hashes of live samples. And no instructions that cross into how to actually attack a real target.**
>
> Everything must be framed as defensive or lab-only. Log excerpts are data to be investigated, never procedures to follow. If a question needs to reference an attack technique, describe the behaviour and the artefacts it leaves behind; do not write the method.
>
> **Every indicator must be defanged.** Write `hxxp://evil[.]example` and `10[.]0[.]0[.]1`, never the live form. Use only the RFC 5737 documentation ranges `192.0.2.0/24`, `198.51.100.0/24` and `203.0.113.0/24`, and the RFC 2606 example domains `example.com`, `example.net` and `example.org`.

**`scripts/validate.py` enforces the defanging rule automatically and will fail the build on an undefanged dotted IPv4 address.** It scans every JSON file under `data/` and every HTML file under `exercises/`, and it also rejects a live-looking URL inside exercise content. A recognised documentation range, or a match sitting in a context that clearly marks it as a version number, a subnet mask or an example, is permitted; anything else is a failure. Do not add an exception to the checker to get your content through — defang the indicator.

If you are ever unsure whether something crosses the line, leave it out. There are hundreds of legitimate defensive scenarios for every one that needs a real indicator, and an exercise that teaches nothing but looks alarming is worse than no exercise.

## Legal and attribution rules

* **Never add a vendor logo.** Not as an image, not as an inline SVG, not as an emoji, not as a favicon. A logo implies endorsement, and this project is not endorsed by anyone.
* **Never imply affiliation or endorsement.** No "official", no "certified by", no "in partnership with", and no phrasing that suggests a vendor reviewed, approved or supports this content.
* **Keep the `attributionNote` intact.** It is the statement of where the content came from and what this project is not. Editing it, shortening it or removing it is a licence violation, not a style preference.
* **Do not reproduce exam questions or paid course material.** Certification objective summaries must be paraphrased from publicly available objectives, in your own words. Copying a question bank, a course handout or a paid study guide is both a copyright problem and a disservice to learners who will memorise an answer instead of understanding a mechanism.
* **Quote sources, do not copy them wholesale.** A sentence or a paraphrase with a citation is fine. A screenful of someone else's prose is not. Link to the original.
* **Respect the licences of anything you bring in.** If you adapt a diagram or a definition from somewhere, check that its licence permits it and say so in the source entry.

## Local workflow

Run every command from the repository root. All of them work identically on Windows, macOS and Linux; on macOS and Linux the interpreter is often named `python3`, so substitute that if `python` is not found.

```
# 1. Gate. Run this before committing, always. It exits 1 and prints every problem it found.
python scripts/validate.py

# 2. Preview. The site cannot be opened from the file system: fetch() and service
#    workers need HTTP. Leave this running and open http://localhost:8000/
python -m http.server 8000

# 3. Rebuild after ANY change to a file under data/. Both are required.
python scripts/build_catalog.py
python scripts/generate_pages.py
```

`validate.py` checks that `data/catalog.json` is in step with the topic files on disk, so forgetting step 3 fails the gate with an explicit message telling you to run it. It also checks that every topic has a generated page and that no orphan page exists, so forgetting `generate_pages.py` fails too. Add `--verbose` to see the passing checks as well as the failures.

Two optional extras:

```
# Regenerate the Open Graph social cards (SVG by default)
python scripts/generate_og.py

# Also write PNG versions of them, which needs Pillow. CI never does this.
python scripts/generate_og.py --png
```

`generate_og.py` is not required for a content pull request; the CI workflow runs the SVG-only pass to prove it still works without Pillow. If you changed a topic title and want its social card to match, run it — and commit both the `.svg` and, if you generated it, the `.png`.

## Pull request checklist

Copy this into your pull request description and tick every box. A pull request with unticked boxes will be asked to complete them before review.

```markdown
- [ ] `python scripts/validate.py` passes with no failures
- [ ] The topic JSON validates against `data/schema/topic.schema.json`
- [ ] Exactly three batches are present, on the canonical paths `exercises/<id>/batch-{1,2,3}.html`
- [ ] Each batch is under 250 KB
- [ ] No external CDN, font, icon library, analytics or third-party script was added
- [ ] Every indicator is defanged (`hxxp://evil[.]example`, `10[.]0[.]0[.]1`)
- [ ] `attributionNote` is present and unedited where the schema requires it
- [ ] Sources are cited for every factual claim I made
- [ ] Tested on a phone or in a narrow viewport
- [ ] Tested with a keyboard alone, with no mouse
- [ ] No console errors or warnings from my changes
- [ ] CHANGELOG.md updated
```

## Review process

A reviewer is looking for four things, in this order:

1. **Technical accuracy.** Is the content correct at the level a practising professional would expect? Are the log excerpts realistic? Is every answer explanation actually right?
2. **The content safety rules.** Nothing that crosses into operational attack instruction, nothing live, everything defanged.
3. **The contract.** Does the batch load, run standalone, emit the score message, and work with a keyboard?
4. **Fit.** Does it match the batch lens it claims, and does it look like the rest of the site?

Reviewers will ask questions rather than rewrite your work, and they will say so when they are unsure. **A source citation is required for any accuracy claim.** If you state that a technique behaves in a particular way, or that a control has a particular limitation, link to where that comes from. An uncited claim that a reviewer cannot verify is removed rather than argued about.

**CI must pass.** The `Validate` workflow runs on every push to `main` and on every pull request, and it must be green before a pull request is merged. It runs the same `validate.py` you can run locally, proves `data/catalog.json` is not stale, re-runs the page generator and fails if the regenerated output differs from what you committed, enforces the 250 KB HTML budget, asserts that every topic reserves exactly three batches on canonical paths, and proves the OG generator still works without Pillow. Because the generator check is in there, a change to `siteVersion` in `assets/js/config.js` requires you to commit the regenerated `topic` pages, `pages` and `index.html` along with it.

## Recognition

Contributors may be credited on `pages/contributors.html`.

This is **manual and opt-in**. Nobody is listed automatically, no GitHub handle is scraped from commit metadata, and a contribution is not conditional on being credited. If you want to appear, say so in your pull request and provide the name or handle you want shown. If you would rather not be listed, nothing happens and nobody asks again. The optional `contributors` array in a topic record exists so that a topic can credit specific people, and it is populated the same way: only on request.
