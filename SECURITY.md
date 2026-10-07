# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| `main` branch, site version 1.0.0 | Yes |
| Any other branch, fork or tag | No |

**CyberPulseAcademy is a static site with no server component.** It is HTML, CSS, vanilla JavaScript and a set of Python standard-library build scripts. There is no database, no authentication, no session handling, no server-side request processing, and no user-supplied content rendered on the server. The only thing that runs anywhere other than the visitor's browser is whatever statistics endpoint the owner chooses to host themselves, and that is optional and disabled by default.

Two consequences follow, and both matter for how you read this document:

1. The realistic attack surface of a *deployed* site is the browser-side JavaScript, the content it renders, and the service worker. That is a small surface, and most of it is the catalog renderer.
2. "The repository is public" is not a vulnerability, and neither is the absence of security headers that GitHub Pages does not let anyone set. Details below.

## How to report a vulnerability in this site

**This policy covers this site and this repository only.** Do not report vulnerabilities in third-party software, vendors, certification bodies or the standards organisations referenced in the content here — those belong with the organisation that makes the thing. Nothing in this project speaks for them.

### Preferred: GitHub private vulnerability reporting

If it is enabled on the repository, use it. On github.com, go to the **Security** tab and choose **Report a vulnerability**. This creates a private advisory that only the maintainers can see, and it gives the project a structured place to discuss, fix and later publish the issue.

### Otherwise: ask for a private channel

If private vulnerability reporting is not enabled, **open a GitHub issue that asks for a private contact route, and put nothing sensitive in it.** State that you have a security report and would like a private channel; a maintainer will set one up. Do not describe the vulnerability, do not include a proof of concept, and do not name affected users in a public issue. A public report of an exploitable issue is a disclosure to everyone who reads the tracker, including anyone who would use it, at a time when no fix exists.

### What to include

Enough for a maintainer to reproduce and understand the problem without guessing:

* **The URL** where the issue occurs, as precisely as you can give it — the page, and the query string if it matters.
* **The browser and version**, and the operating system. Browser-side behaviour differs enough that this is often the difference between reproducible and not.
* **A description of the problem** in plain terms: what is wrong, and what an attacker or a faulty input can make happen.
* **Reproduction steps.** A numbered list that a maintainer can follow. If it needs a specific input, give the exact input. If it needs a specific state — a particular `localStorage` value, a specific stats mode, a service worker already installed — say so.
* **The impact you believe it has.** Be honest about how far the issue reaches. If you are unsure, say that instead of overstating it; an accurate "I think this only affects the visitor themselves" is more useful than a claim of full account takeover on a site with no accounts.

A minimal, reproducible report is far more valuable than a long one. If you can, check whether the issue also occurs with the service worker unregistered and with the browser cache disabled, and say which state you saw it in.

## What counts as a vulnerability here

These are in scope. Each is a real weakness in this project rather than a general observation about the web:

* **Cross-site scripting through the catalog renderer.** Topic titles, summaries, objectives, tags, source labels, detection logic, group aliases, exercise metadata and every other field under `data/` end up interpolated into the DOM. `CM.util.esc()` exists for exactly this, and any code path that builds markup from catalog data without escaping it is a genuine XSS vector. This is the highest-value class of bug in this project.
* **A supply-chain issue in the build scripts.** `scripts/build_catalog.py`, `generate_pages.py`, `generate_og.py`, `validate.py` and `new_topic.py` all run in contributors' environments and in CI. A path traversal that writes outside the repository, a script that executes content from a topic JSON, a template that allows injected markup through to generated pages, or the introduction of a third-party dependency into what is currently a standard-library-only toolchain — all of these count. Note that `build_catalog.py` contains a hand-rolled JSON Schema validator; a way to make it accept a schema-invalid file, or to make `validate.py` pass on content it should reject, is a security bug, because the gate is what keeps bad content off `main`.
* **A GitHub Actions workflow that can be abused.** `.github/workflows/validate.yml` runs on pushes and pull requests. A way to escalate its `GITHUB_TOKEN` beyond its declared read-only permission, to exfiltrate a secret, to execute attacker-controlled code from a pull request, or to make the workflow's own checks report success while the underlying data is invalid.
* **A privacy leak in the statistics payload.** The remote-mode payload is specified to contain a truncated SHA-256 hash of `statsSalt + "|" + username.toLowerCase()`, a country code, a topic id, a batch number, a score, a pass flag, a timestamp and the site version — and never the raw username. Anything that leaks the raw username, a cookie, a device fingerprint, an IP address, a referrer, or more data than that specification allows is a privacy vulnerability and is in scope even though it is not a classic exploit.
* **An accessibility flaw that blocks a keyboard or screen-reader user.** Accessibility is a stated WCAG 2.1 AA commitment. A control that cannot be reached or operated with a keyboard, a focus trap, a dialog that does not return focus, a live region that announces nothing, a form field with no accessible name, or a state conveyed only by colour is treated as a defect worth reporting through this process, because for some learners it makes the platform unusable.
* **A service worker caching a page across a security boundary.** `service-worker.js` caches same-origin shell assets, `data/catalog.json`, topic pages, exercise batches and hand-written pages. A bug that serves one user's cached content to another, that returns a cached response from a different origin, that fails to scope a cache correctly, or that keeps serving a cached page after a security-relevant fix has shipped is in scope.
* **A broken internal link that could mislead a learner.** This is deliberately included. This site teaches security, and a link inside a lesson or an exercise that points somewhere other than where its text claims is not merely untidy — it can send a learner to the wrong standard, the wrong vendor page, or a lookalike domain. `validate.py` sweeps internal links and fails on a missing target precisely because a dead or misleading link is a correctness problem here, not a cosmetic one.

## What does not count

Reporting these is not a vulnerability, and a report of one will be closed with a pointer back to this section:

* **The absence of a Content Security Policy header, or of `X-Frame-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy` or any other response header.** GitHub Pages does not allow a repository to set HTTP response headers. The only headers a GitHub Pages site gets are the ones GitHub sends. Therefore "your site has no CSP" is a statement about the hosting platform, not a defect that can be fixed in this repository, and it cannot be actioned here. If a `_headers` file or a CDN in front of Pages is ever added, this answer changes.
* **The fact that the repository is public.** It is intended to be public. Public source, a public commit history, the presence of build scripts in the repository, and the visibility of the catalog data are all by design. Nothing secret is stored here, and nothing secret may be stored here — see the "no secrets in client-side code" rule in the README and CONTRIBUTING.
* **Self-XSS.** A payload that a user must paste into their own developer console, or that requires them to modify their own browser state, before it does anything. There is no privilege boundary being crossed, because the user already has full control of their own browser and their own data.
* **Outdated dependency reports.** The build uses the Python standard library only. There are no npm packages, no pip dependencies in the toolchain, no vendored JavaScript libraries and no third-party code of any kind shipped to the browser. `scripts/requirements.txt` names exactly one optional extra, Pillow, used only by `generate_og.py --png`, which CI never runs. An automated "your dependencies are out of date" report is therefore either about that single optional extra or about nothing at all.
* **The absence of a security.txt, a bug bounty, a paid reward, or a formal response-time SLA.** This is a volunteer, non-commercial project. It has no budget for bounties and does not offer one.
* **Automated scanner output with no analysis.** A raw report from a link checker or a header scanner, pasted without any indication of why the finding matters here, will be closed. If you can explain an actual impact in this project, that is a different report and it is welcome.

## Responsible disclosure

Please give the project a reasonable opportunity to fix an issue before you disclose it publicly.

**The project commits to acknowledging your report within seven days.** This is a commitment to *acknowledge* — to confirm that the report arrived and is being looked at — not a commitment to have a fix within seven days. This is a volunteer project with no security team and no on-call rota, and pretending otherwise would be a lie. What you can expect:

1. An acknowledgement within seven days of a report arriving through a private channel.
2. An honest assessment: whether the issue is accepted, what its scope is believed to be, and roughly what fixing it involves. If it is out of scope, you will be told why with reference to the sections above.
3. Notification when a fix ships. Because the site is served from a branch, a fix is usually live a minute or two after it is merged.
4. **Credit if you want it.** Reporters who ask to be credited are credited, in the advisory, in `CHANGELOG.md`, and on the contributors page if they want to appear there. Reporters who prefer to stay anonymous are never named — say which you prefer in your first message, and change your mind at any point.

Please do not test against a deployment you do not own or operate. If you want to demonstrate an issue, do it against a local copy: serve the repository with `python -m http.server 8000` and work there.

## No live malware, ever

**This repository contains no live malware, and it never will.**

* No exercise batch contains working exploit code.
* No topic file, exercise file or generated page contains a live malware sample.
* No file contains a hash of a live malware sample, because publishing such a hash associates this educational project with a real sample and points a learner at something that should only ever be handled in a controlled malware-analysis lab.
* No file contains real credentials, real API keys or real tokens.
* Every indicator of compromise in the content is defanged: `hxxp://evil[.]example`, `10[.]0[.]0[.]1`. Only the RFC 5737 documentation ranges (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`) and the RFC 2606 example domains are used. `scripts/validate.py` enforces this automatically on every JSON file under `data/` and every HTML file under `exercises/`, and fails the build on an undefanged address or a live-looking URL.

**If you find content that appears to cross that line, report it immediately, and report it twice.** Open a security report through the private channel described above *and* raise it as a content problem, because a file that looks like it contains live malicious material is both a security issue for the repository and a content issue for the learners who would read it. Do not download, execute or reproduce the content in your report; quote the smallest fragment that identifies the problem and say where it is.

## A note on contributed exercise batches

**The generated exercise batches are third-party contributions. They are reviewed, but they are not formally audited.**

Every batch is read by a maintainer against the content safety rules and the technical contract before it is published, and the automated gate enforces defanging, the file size budget, the batch paths and the internal links. That is a real review, and it is the reason the rules matter.

It is not the same thing as a security audit. A batch is a single self-contained HTML file of contributed JavaScript, reviewed by volunteers for correctness, safety and accessibility, and then served inside a sandboxed same-origin iframe. It has not been subjected to a code audit, a fuzzing campaign or a professional assessment, and no maintainer will claim otherwise. Treat a batch the way you would treat any contributed code of unknown provenance: read it if you are going to trust it, and report anything that looks wrong.

If you are the owner of a deployment and would like a stronger guarantee for a specific batch, the practical step is to read that batch's source yourself before publishing it. The file is one readable HTML document, which is the reason the contract requires it to be one file in the first place.
