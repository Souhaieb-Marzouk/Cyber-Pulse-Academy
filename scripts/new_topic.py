#!/usr/bin/env python3
"""Scaffold a new topic in one command, then rebuild the catalog and the pages.

    python scripts/new_topic.py --type technique --id t1059-001 --title "PowerShell"
    python scripts/new_topic.py --type keyword --id threat-hunting --title "Threat Hunting"
    python scripts/new_topic.py --type certification --id az-104 --title "Microsoft AZ-104"

What it does:

  1. validates the id (pattern, uniqueness) and rejects the command if either fails;
  2. writes a schema-valid, pre-filled JSON file into data/<type>/;
  3. creates exercises/<id>/ with a README telling you exactly which three batches
     to generate and where to paste them;
  4. runs build_catalog.py and generate_pages.py so the site is immediately
     consistent, with no manual bookkeeping;
  5. prints a next-steps checklist.

The generated summary carries a [SCAFFOLD] marker. scripts/validate.py FAILS while
that marker is present, so a scaffold can never be committed to main by accident.
Replace the summary with real prose (200 words or more) and validation passes.

Standard library only. Python 3.8+.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent

TYPE_DIRS = {
    "keyword": "keywords",
    "certification": "certifications",
    "tactic": "tactics",
    "technique": "techniques",
    "mitigation": "mitigations",
    "detection": "detections",
    "group": "groups",
}

# Human-facing batch differentiation. Documented in CONTRIBUTING.md so that
# community-contributed batches stay consistent with each other.
BATCH_FOCUS = {
    1: "Detection & Triage: log and alert analysis, SIEM-style queries, prioritisation, blue-team lens.",
    2: "Response & Hands-on: terminal emulator, configuration and policy completion, decision trees, spot-the-mistake, incident timeline ordering.",
    3: "Adversarial & Cross-domain: red-team perspective, evasion, dual-perspective pairs, ATT&CK mapping, risk ranking, report drafting.",
}

ID_RE = re.compile(r"^[a-z0-9][a-z0-9-]{1,63}$")

# Attribution text that must accompany each content family. Copied verbatim from
# the shipped seed content so every topic reads identically.
ATTRIBUTION = {
    "certification": (
        "Objectives summary paraphrased from publicly available exam objectives. CyberPulseAcademy is not "
        "affiliated with, endorsed by, or sponsored by {vendor}."
    ),
    "tactic": (
        "Tactic content is derived from the publicly available MITRE ATT&CK knowledge base. ATT&CK is "
        "a registered trademark of The MITRE Corporation. CyberPulseAcademy is not affiliated with, "
        "endorsed by, or sponsored by MITRE, and this content is not official MITRE material."
    ),
    "technique": (
        "Technique content is derived from the publicly available MITRE ATT&CK knowledge base. ATT&CK "
        "is a registered trademark of The MITRE Corporation. CyberPulseAcademy is not affiliated with, "
        "endorsed by, or sponsored by MITRE, and this content is not official MITRE material."
    ),
    "mitigation": (
        "Mitigation content is derived from the publicly available MITRE ATT&CK knowledge base. "
        "ATT&CK is a registered trademark of The MITRE Corporation. CyberPulseAcademy is not affiliated "
        "with, endorsed by, or sponsored by MITRE, and this content is not official MITRE material."
    ),
    "detection": (
        "This detection content is community-authored guidance created for training. It is NOT "
        "official MITRE ATT&CK content. ATT&CK is a registered trademark of The MITRE Corporation."
    ),
    "group": (
        "Group summaries are derived from publicly available threat intelligence reporting and the "
        "MITRE ATT&CK knowledge base. ATT&CK is a registered trademark of The MITRE Corporation. "
        "Attribution statements reflect third-party reporting, not the position of CyberPulseAcademy."
    ),
}

SCAFFOLD_SUMMARY = (
    "[SCAFFOLD] Replace this paragraph before committing. Write at least 200 words of genuinely "
    "useful, factual prose for a practising security professional: what this topic actually is at a "
    "mechanism level, where it appears in real environments, the specific telemetry or artefact it "
    "leaves behind, how an experienced defender tells it apart from benign activity, and where the "
    "common misunderstandings are. Do not use filler openers, marketing language or keyword "
    "stuffing. This paragraph is also used as the page meta description, so make its first sentence "
    "a strong standalone definition. Run python scripts/validate.py when you are done: it fails "
    "while the [SCAFFOLD] marker is still present, which is what stops an unfinished topic from "
    "reaching main."
)


def die(message: str) -> int:
    print("FAIL: " + message, file=sys.stderr)
    return 1


def existing_ids() -> dict[str, str]:
    found: dict[str, str] = {}
    for dirname in TYPE_DIRS.values():
        folder = ROOT / "data" / dirname
        if not folder.exists():
            continue
        for path in folder.glob("*.json"):
            found[path.stem] = path.relative_to(ROOT).as_posix()
    return found


def build_payload(args) -> dict:
    topic_id = args.id
    theme = args.theme or default_theme(args.type)
    kind = args.type

    batches = []
    for index in (1, 2, 3):
        batches.append(
            {
                "batch": index,
                "path": f"exercises/{topic_id}/batch-{index}.html",
                "title": default_batch_title(kind, args.title, index),
                "focus": BATCH_FOCUS[index],
                # Honest by default: no file has been generated yet, so the
                # coverage dashboard must show a gap and the topic page must
                # show "not published yet, help us build it".
                "status": "missing",
            }
        )

    payload: dict = {
        "id": topic_id,
        "type": kind,
        "title": args.title,
        "shortTitle": args.short_title or (args.title if len(args.title) <= 40 else args.title[:37] + "..."),
        "theme": theme,
        "summary": SCAFFOLD_SUMMARY,
        "objectives": [
            "Explain what this topic is and the mechanism behind it.",
            "Identify the telemetry, artefact or control evidence it leaves behind.",
            "Distinguish it from legitimate activity that looks similar.",
            "Apply it correctly under time pressure in a realistic scenario.",
        ],
        "tags": [t.strip().lower() for t in (args.tags or "").split(",") if t.strip()] or [topic_id.replace("-", " ")],
        "difficulty": args.difficulty,
        "batches": batches,
        "relatedTopics": [r.strip() for r in (args.related or "").split(",") if r.strip()],
        "sources": [{"label": args.source_label or "Add a source", "url": args.source or "https://attack.mitre.org/"}],
        "lastReviewed": args.last_reviewed,
    }

    if args.external_id:
        payload["externalId"] = args.external_id

    if kind == "certification":
        payload["vendor"] = theme
        payload["examCode"] = args.external_id or ""
        payload["attributionNote"] = ATTRIBUTION["certification"].format(vendor=theme)
    elif kind in ATTRIBUTION:
        payload["attributionNote"] = ATTRIBUTION[kind]

    if kind == "technique":
        payload["parentTactic"] = args.parent_tactic or "ta0002"
        payload["isSubTechnique"] = bool(args.parent_technique)
        if args.parent_technique:
            payload["parentTechnique"] = args.parent_technique
    if kind == "mitigation":
        payload["mitigatesTechniques"] = [t.strip() for t in (args.mitigates or "").split(",") if t.strip()]
    if kind == "detection":
        payload["techniqueId"] = args.technique_id or "t1059"
        payload["detectsTechniques"] = [payload["techniqueId"]]
        payload["dataSources"] = ["Add the concrete telemetry this relies on"]
        payload["logic"] = "Describe, in plain language, what pattern is being detected and why it is meaningful."
        payload["pseudoQuery"] = "# Sigma-like pseudo-rule\n# title: Replace me\n# logsource:\n#   product: windows\n# detection:\n#   selection:\n#     EventID: 1\n#   condition: selection"
        payload["falsePositives"] = ["Add at least three benign activities that trigger this"]
        payload["tuningNotes"] = "Explain how to reduce noise without losing coverage."
        payload["severity"] = "medium"
    if kind == "group":
        payload["aliases"] = [a.strip() for a in (args.aliases or "").split(",") if a.strip()]
        payload["linkedTechniques"] = [t.strip() for t in (args.linked or "").split(",") if t.strip()]
        payload["linkedSoftware"] = []

    return payload


def default_theme(kind: str) -> str:
    return {
        "keyword": "Uncategorised",
        "certification": "Uncategorised vendor",
        "tactic": "Enterprise",
        "technique": "Execution",
        "mitigation": "Enterprise Mitigation",
        "detection": "Detection Strategy",
        "group": "Enterprise Group",
    }[kind]


def default_batch_title(kind: str, title: str, index: int) -> str:
    lens = {
        1: "Detection and triage",
        2: "Response and hands-on configuration",
        3: "Adversarial and cross-domain",
    }[index]
    return f"{title}: {lens}"


def readme_for(topic_id: str, kind: str, title: str) -> str:
    return f"""# {title} exercise batches

Three batches are reserved for the `{topic_id}` {kind} topic. Each is a **fully
standalone single HTML file** with its own UI. Paste them here with these exact
names, nothing else:

| File | Batch | Lens |
|---|---|---|
| `batch-1.html` | 1 | Detection & Triage |
| `batch-2.html` | 2 | Response & Hands-on |
| `batch-3.html` | 3 | Adversarial & Cross-domain |

## How to generate one

1. Open `docs/exercise-generation-prompt.md` (also reproduced in
   `CONTRIBUTING.md`).
2. Copy the whole prompt.
3. Fill in the topic block at the top with this topic's details:
   `topicId = {topic_id}`, `title = {title}`, `type = {kind}`.
4. Paste it into your AI assistant of choice and let it produce the batch.
5. Save the result as `batch-N.html` in this folder.
6. Set that batch's `status` to `published` in `data/{TYPE_DIRS[kind]}/{topic_id}.json`.
7. Run:

   ```
   python scripts/build_catalog.py
   python scripts/generate_pages.py
   python scripts/validate.py
   ```

The topic page picks the new batch up automatically. There is nothing else to
wire: the hub reads the manifest, checks the file exists, frames it in an
iframe, and listens for the score message.

## What the batch must do

* Be one file. No external CDN, no build step, no separate assets.
* Stay under 250 KB or CI fails.
* Emit `{{ type: "CYBERPULSE_SCORE", topicId: "{topic_id}", batch: N, score, total, percent, passed }}`
  to `parent` when the results screen appears, so the score reaches the stats page.
* Listen for `CYBERPULSE_INIT` and ignore it if it does not need it.
* Defang every indicator: `hxxp://evil[.]example`, `10[.]0[.]0[.]1`.
* Contain no working exploit code, no real credentials and no live malware.

## Content safety, non-negotiable

No working exploit code. No real credentials. No live malware samples or their
hashes. Nothing that crosses into "how to attack a real target". Everything is
framed as defensive or lab-only, and every indicator is defanged.
`scripts/validate.py` enforces the defanging rule automatically.
"""


def run(script: str) -> int:
    result = subprocess.run(
        [sys.executable, str(SCRIPT_DIR / script)],
        cwd=str(ROOT),
        text=True,
    )
    return result.returncode


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Scaffold a new CyberPulseAcademy topic and rebuild the site data.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--type", required=True, choices=sorted(TYPE_DIRS), help="catalog to add the topic to")
    parser.add_argument("--id", required=True, help="URL-safe id, for example t1059-001")
    parser.add_argument("--title", required=True, help="human-readable title")
    parser.add_argument("--short-title", default=None)
    parser.add_argument("--external-id", default=None, help="ATT&CK id or exam code, for example T1059.001")
    parser.add_argument("--theme", default=None, help="grouping shown on listing pages")
    parser.add_argument("--difficulty", default="extreme", choices=["hard", "very-hard", "extreme"])
    parser.add_argument("--tags", default=None, help="comma separated")
    parser.add_argument("--related", default=None, help="comma separated existing topic ids")
    parser.add_argument("--source", default=None, help="primary source URL, https only")
    parser.add_argument("--source-label", default=None)
    parser.add_argument("--last-reviewed", default=None, help="YYYY-MM-DD, defaults to today")
    parser.add_argument("--parent-tactic", default=None, help="technique only, for example ta0002")
    parser.add_argument("--parent-technique", default=None, help="sub-technique only, for example t1059")
    parser.add_argument("--mitigates", default=None, help="mitigation only, comma separated technique ids")
    parser.add_argument("--technique-id", default=None, help="detection only, for example t1059-001")
    parser.add_argument("--aliases", default=None, help="group only, comma separated")
    parser.add_argument("--linked", default=None, help="group only, comma separated technique ids")
    parser.add_argument("--dry-run", action="store_true", help="print the JSON without writing anything")
    args = parser.parse_args()

    if not ID_RE.match(args.id):
        return die(
            f"'{args.id}' is not a valid id. Use lowercase letters, digits and hyphens only, "
            f"starting with a letter or digit, 2 to 64 characters."
        )

    known = existing_ids()
    if args.id in known:
        return die(f"id '{args.id}' already exists at {known[args.id]}. Ids must be unique.")

    if not args.last_reviewed:
        import datetime
        args.last_reviewed = datetime.date.today().isoformat()

    payload = build_payload(args)

    if args.dry_run:
        print(json.dumps(payload, indent=2, ensure_ascii=False))
        return 0

    target_dir = ROOT / "data" / TYPE_DIRS[args.type]
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / f"{args.id}.json"
    target.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Created  {target.relative_to(ROOT).as_posix()}")

    exercise_dir = ROOT / "exercises" / args.id
    exercise_dir.mkdir(parents=True, exist_ok=True)
    readme = exercise_dir / "README.md"
    readme.write_text(readme_for(args.id, args.type, args.title), encoding="utf-8")
    print(f"Created  {readme.relative_to(ROOT).as_posix()}")

    print()
    print("Rebuilding catalog and topic pages")
    print("-" * 62)
    if run("build_catalog.py") != 0:
        return die("build_catalog.py failed. Fix the data file, then re-run it.")
    if run("generate_pages.py") != 0:
        return die("generate_pages.py failed. Fix the data file, then re-run it.")

    page = f"topics/{args.id}.html"
    print()
    print("=" * 62)
    print(f"Topic '{args.id}' scaffolded.")
    print("=" * 62)
    print()
    print("Next steps, in order:")
    print(f"  1. Write the real summary. Open data/{TYPE_DIRS[args.type]}/{args.id}.json and")
    print("     replace the [SCAFFOLD] paragraph with 200 or more words of real prose.")
    print("     scripts/validate.py FAILS until you do, which is deliberate.")
    print(f"  2. Fill in the remaining fields that need real content{'' if args.type == 'keyword' else ':'}")
    if args.type == "detection":
        print("       dataSources, logic, pseudoQuery, falsePositives, tuningNotes, severity.")
        print("     A detection with placeholder telemetry is worse than no detection.")
    elif args.type == "mitigation":
        print("       mitigatesTechniques, which technique ids this control actually addresses.")
    elif args.type == "group":
        print("       linkedTechniques from public reporting. Say where attribution is contested.")
    elif args.type == "certification":
        print("       objectives, one entry per exam domain, paraphrased in your own words.")
        print("       Never link or embed a vendor logo: that implies endorsement.")
    else:
        print("       objectives, tags and sources.")
    print(f"  3. Generate the three batches. The prompt is in docs/exercise-generation-prompt.md.")
    print(f"     Paste them into exercises/{args.id}/batch-1.html, batch-2.html and batch-3.html.")
    print(f"     Then set each batch status to \"published\" in the JSON.")
    print(f"  4. Rebuild and gate:")
    print(f"       python scripts/build_catalog.py")
    print(f"       python scripts/generate_pages.py")
    print(f"       python scripts/validate.py")
    print(f"  5. Preview locally, then commit:")
    print(f"       python -m http.server 8000")
    print(f"       open http://localhost:8000/{page}")
    print()
    print("The coverage dashboard will show this topic as incomplete until all three")
    print("batches are published. That is the point: the gaps are the roadmap.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
