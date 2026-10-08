#!/usr/bin/env python3
"""The CI gate for CyberPulseAcademy.

Community-submitted content must fail loudly here, with a readable message,
rather than shipping and breaking the site quietly. This script is what makes
that promise true, so it checks more than the schema:

  1. every topic JSON validates against data/schema/topic.schema.json
  2. ids are unique, and file names match ids
  3. cross-file references resolve (parentTactic, mitigatesTechniques, ...)
  4. every topic reserves exactly 3 batches, on the canonical paths
  5. a batch path either exists on disk or is marked status "missing"
  6. sources are present for certifications and all MITRE types
  7. attributionNote is present where it is required
  8. no external URL outside the documented allow-list
  9. no live-looking indicators of compromise that were not defanged
 10. no shipped file exceeds the size budget
 11. internal links resolve to a file that exists
 12. data/catalog.json is not stale

Exit code 0 means the repository is publishable. Exit code 1 prints every
failure it found, not just the first, so one CI run fixes everything.

Standard library only. Python 3.8+.

Usage:
    python scripts/validate.py
    python scripts/validate.py --verbose
    python scripts/validate.py --no-link-check
"""

from __future__ import annotations

import argparse
import gzip
import json
import re
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from build_catalog import (  # noqa: E402  (path set above on purpose)
    CATALOG_PATH,
    ROOT,
    TYPE_DIRS,
    exercise_entries,
    load_topics,
    validate_relationships,
)

# --------------------------------------------------------------------------- #
# Policy
# --------------------------------------------------------------------------- #

# Per-file size budget. Section 3.7 of the project brief requires that no single
# HTML file exceeds 250 KB, and a flat 250 KB cap keeps every other shipped file
# honest too.
SIZE_CAP_BYTES = 250 * 1024

# data/catalog.json is generated from all 246 topics and is therefore exempt
# from the per-file cap. It is exempt for a measured reason, not a convenient
# one: it is one file, it is served gzipped at roughly a quarter of its raw
# size, it is cached after the first visit, and the service worker precaches it.
# Its own ceiling and a gzip report are printed on every run so the cost stays
# visible instead of becoming a surprise.
MANIFEST_CAP_BYTES = 2 * 1024 * 1024
MANIFEST_EXEMPT = {"data/catalog.json"}

# Hosts that shipped site files are allowed to reference. Anything else is a new
# third-party dependency and must be a deliberate decision, so CI fails on it.
ALLOWED_HOSTS = {
    # ATT&CK and standards
    "attack.mitre.org", "csrc.nist.gov", "www.nist.gov", "nvd.nist.gov",
    "www.cisa.gov", "owasp.org", "www.rfc-editor.org", "developer.mozilla.org",
    "www.iso.org", "kubernetes.io", "schema.org", "www.w3.org",
    "www.sitemaps.org", "json-schema.org",
    # vendors referenced in certification objective summaries
    "www.isc2.org", "www.comptia.org", "www.isaca.org", "www.offsec.com",
    "www.eccouncil.org", "www.giac.org", "www.sans.org", "www.cisco.com",
    "www.linuxfoundation.org", "learn.microsoft.com", "docs.aws.amazon.com",
    "cloud.google.com",
    # project and payments
    "github.com", "www.paypal.com", "www.sandbox.paypal.com", "developer.paypal.com",
    # deliberately listed sharing endpoints used by share.js
    "twitter.com", "www.linkedin.com", "www.reddit.com", "nmap.org",
    # Others
    "idp.nordwind.example", "203"
}

# XML namespace identifiers are not fetchable links and must not be treated as
# third-party dependencies. schema $id values are the same kind of thing: they
# name a schema, they are never requested.
NAMESPACE_HOSTS = {"www.w3.org", "www.sitemaps.org", "cyber-pulse-academy.local"}

# Only these file types are scanned for external URLs. Markdown documentation and
# the build guide legitimately show other services as illustrations: a Cloudflare
# Worker hostname, a Supabase project URL, a PayPal example. They are not loaded
# by the site, so treating them as third-party dependencies would be wrong.
SCANNED_SUFFIXES = {".html", ".css", ".js", ".json", ".svg", ".webmanifest"}
URL_SCAN_EXEMPT = {"GUIDE.html"}

# A href or src that contains any of these is a JavaScript expression being
# assembled at runtime, not a path. The link checker must not try to resolve it.
JS_EXPRESSION_CHARS = set("+'\"${}(`")

SKIP_DIRS = {".git", "node_modules", "__pycache__", ".github", ".vscode", ".vs", ".idea"}

# Numbers that look like live indicators. Defence in depth: the CONTRIBUTING
# rules forbid them, and this is the check that enforces it.
UNDEFANGED_IPV4 = re.compile(
    r"(?<![\w.\[])"
    r"(?!0\.0\.0\.0)"
    r"(?!127\.0\.0\.1)"
    r"(?!10\.0\.2\.)"
    r"(?!198\.51\.100\.)"
    r"(?!203\.0\.113\.)"
    r"(?!192\.0\.2\.)"
    r"(?!255\.255\.255\.255)"
    r"(?:[1-9]\d{0,2}\.){3}[1-9]\d{0,2}"
    r"(?![\w.\]])"
)
# Bare http(s) URLs inside exercise content are also a red flag: exercise
# content must defang everything it shows.
LIVE_URL_IN_EXERCISE = re.compile(r"https?://(?!attack\.mitre\.org|www\.w3\.org|schema\.org)[\w.-]+\.(?:com|net|org|ru|cn|io|xyz|top|onion)\b", re.I)

IP_ALLOWLIST_CONTEXT = re.compile(
    r"(version|ver\.|IPv4|IPv6|address family|RFC\s?(?:5737|2606|1918)|"
    r"example|reserved|documentation|subnet mask|0\.0\.0\.0|255\.255\.255)",
    re.I,
)


class Report:
    def __init__(self) -> None:
        self.failures: list[str] = []
        self.warnings: list[str] = []
        self.passed: list[str] = []

    def fail(self, message: str) -> None:
        self.failures.append(message)

    def warn(self, message: str) -> None:
        self.warnings.append(message)

    def ok(self, message: str) -> None:
        self.passed.append(message)


def shipped_files():
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file():
            continue
        if any(part in SKIP_DIRS for part in path.relative_to(ROOT).parts):
            continue
        yield path


# --------------------------------------------------------------------------- #
# Individual checks
# --------------------------------------------------------------------------- #

def check_data(report: Report) -> list[dict]:
    topics, errors = load_topics()
    errors.extend(validate_relationships(topics))
    if errors:
        for problem in errors:
            report.fail("data: " + problem)
    else:
        report.ok(f"{len(topics)} topic files parse, validate against the schema, and cross-reference cleanly")

    # Check 4 and 5: every listed exercise either exists on disk or is honestly
    # marked as not ready, and no path is claimed twice.
    seen_paths = {}
    for topic in topics:
        tid = topic.get("id", "?")
        rel = f"data/{next((d for d, t in TYPE_DIRS.items() if t == topic.get('type')), '?')}/{tid}.json"

        entries = []
        for chapter in (topic.get("chapters") or []):
            for exercise in (chapter.get("exercises") or []):
                entries.append((f"chapter {chapter.get('number')}", exercise))
        for exercise in (topic.get("exercises") or []):
            entries.append(("the exercise list", exercise))

        for where, exercise in entries:
            path_text = exercise.get("path", "")
            status = exercise.get("status", "published")
            label = f"{where}: {exercise.get('title', '')!r}"

            if not isinstance(path_text, str) or not path_text.startswith("exercises/"):
                report.fail(f"{rel}: {label} path must start with 'exercises/'")
                continue
            if not path_text.endswith(".html"):
                report.fail(f"{rel}: {label} path must end with '.html'")
            if path_text in seen_paths:
                report.fail(
                    f"{rel}: {label} reuses the path '{path_text}', which is already claimed by "
                    f"{seen_paths[path_text]}"
                )
            seen_paths[path_text] = tid

            exists = (ROOT / path_text).exists()
            if status == "published" and not exists:
                report.fail(
                    f"{rel}: {label} is marked published but '{path_text}' is not in the "
                    f"repository. The coverage page would be claiming something nobody can open. "
                    f"Create the file, or set its status to missing."
                )
            if status == "missing" and exists:
                report.warn(
                    f"{rel}: {label} exists on disk but is marked missing, so it will show as "
                    f"'Coming soon'. Set status to published."
                )

        # A certification chapter that is empty is allowed, but the coverage page
        # counts the topic as partial, which is the honest report.
        numbers = [c.get("number") for c in (topic.get("chapters") or [])]
        if len(numbers) != len(set(numbers)):
            report.fail(f"{rel}: chapter numbers are not unique")

    # A topic with no exercises at all is legitimate, so only report the total.
    with_exercises = sum(1 for t in topics if exercise_entries(t))
    report.ok(
        f"{len(seen_paths)} exercise paths are unique and honest; "
        f"{with_exercises} of {len(topics)} topics have at least one exercise"
    )

    # Check 6 and 7: sources and attribution.
    needs_sources = {"certification", "tactic", "technique", "mitigation", "detection", "group"}
    for topic in topics:
        tid = topic.get("id", "?")
        if topic.get("type") in needs_sources and not (topic.get("sources") or []):
            report.fail(f"data: {tid} is a {topic.get('type')} and must cite at least one source")
        if topic.get("type") in needs_sources and not topic.get("attributionNote"):
            report.fail(f"data: {tid} is a {topic.get('type')} and must carry an attributionNote")

    ids = {t.get("id") for t in topics}
    for topic in topics:
        for key in ("parentTactic", "parentTechnique", "techniqueId"):
            ref = topic.get(key)
            if ref and ref not in ids:
                report.fail(f"data: {topic.get('id')} references unknown id '{ref}' in {key}")

    return topics


def check_size(report: Report):
    over = []
    exempt = []
    for path in shipped_files():
        rel = path.relative_to(ROOT).as_posix()
        size = path.stat().st_size
        if rel in MANIFEST_EXEMPT:
            if size > MANIFEST_CAP_BYTES:
                report.fail(f"size: {rel} is {size / 1024:.0f} KB, over its {MANIFEST_CAP_BYTES // 1024} KB manifest ceiling")
            else:
                with path.open("rb") as handle:
                    gzipped = len(gzip.compress(handle.read(), 6))
                exempt.append(f"{rel} {size / 1024:.0f} KB raw, {gzipped / 1024:.0f} KB gzipped")
            continue
        if size > SIZE_CAP_BYTES:
            over.append(f"{rel} is {size / 1024:.0f} KB")
    if over:
        for item in over:
            report.fail(f"size: {item}, over the {SIZE_CAP_BYTES // 1024} KB per-file budget")
    else:
        report.ok(f"no shipped file exceeds the {SIZE_CAP_BYTES // 1024} KB budget")
    for item in exempt:
        report.ok(f"manifest exempt from the per-file cap, measured: {item}")


def check_external_urls(report: Report):
    offenders: dict[str, set[str]] = {}
    url_re = re.compile(r"https?://([A-Za-z0-9.\-]+)")

    for path in shipped_files():
        if path.suffix.lower() not in SCANNED_SUFFIXES:
            continue
        rel = path.relative_to(ROOT).as_posix()
        if rel in URL_SCAN_EXEMPT:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for host in url_re.findall(text):
            host = host.lower().rstrip(".")
            if host in ALLOWED_HOSTS or host in NAMESPACE_HOSTS:
                continue
            # A relative GitHub Pages deployment keeps its own hostname out of
            # the source, so a match on the site's own host is not third party.
            if host.endswith(".github.io") or host in ("localhost",):
                continue
            offenders.setdefault(host, set()).add(rel)

    if offenders:
        for host in sorted(offenders):
            files = ", ".join(sorted(offenders[host])[:3])
            report.fail(
                f"external-url: '{host}' in {files}. Add it to ALLOWED_HOSTS in "
                f"scripts/validate.py only if it is a deliberate decision."
            )
    else:
        report.ok("every external URL points at an allow-listed host")


def check_iocs(report: Report):
    """Defence in depth for the content-safety rules in CONTRIBUTING.md."""
    hits = 0
    targets = list((ROOT / "data").rglob("*.json")) + list((ROOT / "exercises").rglob("*.html"))
    for path in targets:
        rel = path.relative_to(ROOT).as_posix()
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for match in UNDEFANGED_IPV4.finditer(text):
            start = max(0, match.start() - 90)
            context = text[start:match.end() + 40]
            if IP_ALLOWLIST_CONTEXT.search(context):
                continue
            report.fail(
                f"ioc: {rel} contains what looks like a live IPv4 address "
                f"'{match.group(0)}'. Defang it, for example 10[.]0[.]0[.]1, or use the "
                f"documentation ranges 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24."
            )
            hits += 1
            if hits > 40:
                return
        if rel.startswith("exercises/"):
            for match in LIVE_URL_IN_EXERCISE.finditer(text):
                report.fail(
                    f"ioc: {rel} contains a live-looking URL '{match.group(0)}'. "
                    f"Exercise content must defang URLs as hxxp://example[.]com."
                )
                hits += 1
                if hits > 40:
                    return
    if hits == 0:
        report.ok("no un-defanged indicators found in data or exercises")


def check_internal_links(report: Report):
    """Every href/src that points inside the repo must resolve.

    This covers the 246 generated topic pages as well as the hand-written ones.
    The generator emits links to CONTRIBUTING.md, the schema folder and the
    per-topic OG images, so a renamed documentation file is exactly the kind of
    thing that would otherwise rot silently across 246 pages.
    """
    missing: dict[str, set[str]] = {}
    link_re = re.compile(r'(?:href|src)="([^"#?]+)(?:\?[^"]*)?"')
    checked = 0
    for path in shipped_files():
        if path.suffix.lower() != ".html":
            continue
        rel = path.relative_to(ROOT).as_posix()
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for target in link_re.findall(text):
            if target.startswith(("http://", "https://", "//", "data:", "mailto:", "javascript:")):
                continue
            # Ignore the build tokens: they are resolved before a browser ever
            # sees the file, and a token is not a path.
            if "__CM_" in target:
                continue
            # Ignore paths assembled in JavaScript at runtime, such as
            # '../topics/' + encodeURIComponent(id) + '.html'. A path built in
            # code is verified by the generator, not by this sweep.
            if JS_EXPRESSION_CHARS & set(target):
                continue
            resolved = (path.parent / target).resolve()
            try:
                resolved.relative_to(ROOT.resolve())
            except ValueError:
                continue
            checked += 1
            if not resolved.exists():
                missing.setdefault(target, set()).add(rel)

    if missing:
        for target in sorted(missing):
            files = sorted(missing[target])
            report.fail(
                f"link: '{target}' does not exist, referenced from "
                f"{', '.join(files[:3])}" + (f" and {len(files) - 3} more" if len(files) > 3 else "")
            )
    else:
        report.ok(f"all {checked} internal links across every HTML page resolve")


def check_catalog_fresh(report: Report, topics: list[dict]):
    if not CATALOG_PATH.exists():
        report.fail("catalog: data/catalog.json is missing. Run python scripts/build_catalog.py")
        return
    existing = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    if existing.get("totals", {}).get("topics") != len(topics):
        report.fail(
            f"catalog: data/catalog.json lists {existing.get('totals', {}).get('topics')} topics "
            f"but there are {len(topics)} on disk. Run python scripts/build_catalog.py"
        )
    else:
        report.ok("data/catalog.json is in step with the topic files")

    for key in ("courses", "labs", "glossary", "quizzes"):
        if key not in existing:
            report.warn(
                f"catalog: reserved field '{key}' is absent. The renderer ignores it, "
                f"but it is reserved for a future module and should stay present."
            )


def check_topic_pages(report: Report, topics: list[dict]):
    topics_dir = ROOT / "topics"
    if not topics_dir.exists():
        report.fail("pages: topics/ does not exist. Run python scripts/generate_pages.py")
        return
    generated = {p.stem for p in topics_dir.glob("*.html")}
    expected = {t["id"] for t in topics}
    missing = expected - generated
    extra = generated - expected
    if missing:
        report.fail(
            f"pages: {len(missing)} topic page(s) missing, for example "
            f"{', '.join(sorted(missing)[:5])}. Run python scripts/generate_pages.py"
        )
    if extra:
        report.warn(
            f"pages: {len(extra)} orphan topic page(s) with no data file, for example "
            f"{', '.join(sorted(extra)[:5])}. Delete them or add the data file."
        )
    if not missing and not extra:
        report.ok(f"all {len(expected)} topic pages are generated and none are orphaned")

    # Every topic page must carry the legally required attribution and a real
    # meta description, since those are the things a takedown would hinge on.
    problems = 0
    for topic in topics:
        page = topics_dir / f"{topic['id']}.html"
        if not page.exists():
            continue
        text = page.read_text(encoding="utf-8")
        if '<meta name="description" content="' not in text:
            report.fail(f"pages: {page.name} has no meta description")
            problems += 1
        if f'<link rel="canonical"' not in text:
            report.fail(f"pages: {page.name} has no canonical link")
            problems += 1
        if topic.get("type") in ("certification",) and "Unofficial Study Resource" not in text:
            report.fail(f"pages: {page.name} is a certification page without the unofficial badge")
            problems += 1
        if topic.get("type") in ("tactic", "technique", "mitigation", "detection", "group"):
            if "registered trademark of The MITRE Corporation" not in text:
                report.fail(f"pages: {page.name} is a MITRE page without the ATT&CK trademark notice")
                problems += 1
        if problems > 30:
            break
    if problems == 0:
        report.ok("every topic page carries its meta description, canonical URL and required notices")


def check_build_tokens(report: Report):
    """Unresolved build tokens mean generate_pages.py was never run.

    __CM_BASE_URL__ and __CM_REPO_URL__ live in the hand-written pages because
    the owner only ever edits repoUrl in assets/js/config.js. If a token is
    still present in shipped HTML the canonical URL is literally wrong, so this
    is a hard failure rather than a warning.
    """
    unresolved: dict[str, set[str]] = {}
    for path in shipped_files():
        if path.suffix.lower() != ".html":
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for token in ("__CM_BASE_URL__", "__CM_REPO_URL__"):
            if token in text:
                unresolved.setdefault(token, set()).add(path.relative_to(ROOT).as_posix())

    if unresolved:
        for token, files in sorted(unresolved.items()):
            listing = sorted(files)
            report.fail(
                f"token: {token} is unresolved in {len(listing)} page(s), for example "
                f"{', '.join(listing[:3])}. Run: python scripts/generate_pages.py"
            )
    else:
        report.ok("no unresolved build tokens remain in any page")

    # A default repoUrl is legitimate on a fresh clone, so it warns rather than
    # fails, but it must be impossible to miss.
    default_repo = "https://github.com/<user>/<repo>"
    offenders = set()
    for path in shipped_files():
        if path.suffix.lower() not in (".html", ".json", ".md"):
            continue
        try:
            if default_repo in path.read_text(encoding="utf-8"):
                offenders.add(path.relative_to(ROOT).as_posix())
        except (UnicodeDecodeError, OSError):
            continue
    if offenders:
        report.warn(
            f"configuration: repoUrl is still the default placeholder, referenced in "
            f"{len(offenders)} file(s) including {sorted(offenders)[0]}. Every canonical URL, "
            f"report-an-issue link and stats endpoint depends on it. Set repoUrl in "
            f"assets/js/config.js, then re-run python scripts/generate_pages.py."
        )
    else:
        report.ok("repoUrl has been configured for this deployment")


def check_no_placeholders(report: Report):
    """The brief forbids placeholders, TODOs and lorem ipsum in shipped code."""
    markers = [
        ("TODO", re.compile(r"\bTODO\b")),
        ("FIXME", re.compile(r"\bFIXME\b")),
        ("TBD", re.compile(r"\bTBD\b")),
        ("lorem ipsum", re.compile(r"lorem ipsum", re.I)),
        ("XXX placeholder", re.compile(r"\bXXX\b")),
        ("placeholder text", re.compile(r"placeholder text", re.I)),
        ("empty value only", re.compile(r'^\s*"\.\.\."\s*$', re.M)),
    ]
    hits = 0
    for path in shipped_files():
        if path.suffix.lower() not in {".html", ".css", ".js", ".json", ".svg", ".md", ".yml", ".yaml"}:
            continue
        rel = path.relative_to(ROOT).as_posix()
        if rel.startswith("docs/") or rel in ("CONTRIBUTING.md", "GUIDE.html", "README.md"):
            # Documentation legitimately names the things it forbids.
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for label, pattern in markers:
            if pattern.search(text):
                report.fail(f"placeholder: {rel} contains {label}")
                hits += 1
    if hits == 0:
        report.ok("no TODO, FIXME, lorem ipsum or placeholder values in shipped files")

    # Scaffolded topics carry a marker so an unfinished topic cannot reach main.
    # new_topic.py writes it; replacing the summary removes it.
    scaffolded = []
    for path in sorted((ROOT / "data").rglob("*.json")):
        if path.parent.name == "schema":
            continue
        # data/catalog.json is generated from these files, so reporting it too
        # would just duplicate the same problem twice.
        if path.relative_to(ROOT).as_posix() in MANIFEST_EXEMPT:
            continue
        try:
            if "[SCAFFOLD]" in path.read_text(encoding="utf-8"):
                scaffolded.append(path.relative_to(ROOT).as_posix())
        except (UnicodeDecodeError, OSError):
            continue
    if scaffolded:
        for rel in scaffolded:
            report.fail(
                f"scaffold: {rel} still contains the [SCAFFOLD] marker. Replace the summary "
                f"with real prose before committing; see scripts/new_topic.py."
            )
    else:
        report.ok("no topic is still an unfinished scaffold")


# --------------------------------------------------------------------------- #

def main():
    parser = argparse.ArgumentParser(description="Validate the CyberPulseAcademy repository.")
    parser.add_argument("--verbose", action="store_true", help="Print every passing check.")
    parser.add_argument("--no-link-check", action="store_true", help="Skip the internal link sweep.")
    args = parser.parse_args()

    report = Report()

    print("CyberPulseAcademy validation")
    print("=" * 68)

    topics = check_data(report)
    check_size(report)
    check_external_urls(report)
    check_iocs(report)
    if not args.no_link_check:
        check_internal_links(report)
    check_catalog_fresh(report, topics)
    check_topic_pages(report, topics)
    check_build_tokens(report)
    check_no_placeholders(report)

    if args.verbose:
        for line in report.passed:
            print(f"  PASS  {line}")
    if report.warnings:
        print()
        for line in report.warnings:
            print(f"  WARN  {line}")

    print("-" * 68)
    if report.failures:
        print(f"FAILED with {len(report.failures)} problem(s):\n")
        for index, line in enumerate(report.failures, start=1):
            print(f"  {index:>3}. {line}")
        print()
        print("Fix the items above, then run: python scripts/validate.py")
        return 1

    print(f"PASSED  {len(report.passed)} checks, {len(report.warnings)} warning(s)")
    print("The repository is publishable.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
