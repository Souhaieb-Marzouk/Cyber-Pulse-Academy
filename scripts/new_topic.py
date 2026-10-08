#!/usr/bin/env python3
"""Scaffold a new topic in one command, then rebuild the catalog and the pages.

    python scripts/new_topic.py --type technique --id t1059-001 --title "PowerShell"
    python scripts/new_topic.py --type keyword --id threat-hunting --title "Threat Hunting"
    python scripts/new_topic.py --type certification --id az-104 --title "Microsoft AZ-104"

What it does:

  1. validates the id (pattern, uniqueness) and rejects the command if either fails;
  2. writes a schema-valid, pre-filled JSON file into data/<type>/;
  3. creates exercises/<id>/ with a README explaining how to add exercises to it;
  4. runs build_catalog.py and generate_pages.py so the site is immediately
     consistent, with no manual bookkeeping;
  5. prints a next-steps checklist.

The generated file carries [SCAFFOLD] markers in the `beginner` block and the
`summary`. scripts/validate.py FAILS while any of them is present, so an
unfinished topic can never be committed to main by accident. Replace them with
real text and validation passes.

A new topic starts with an empty exercise list. Add exercises to it with
scripts/new_exercise.py, or by editing the JSON by hand.

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


def beginner_scaffold(title: str) -> dict:
    """A schema-valid placeholder for the plain-language block.

    The length limits here are the ones data/schema/topic.schema.json enforces:
    a definition of 80 to 700 characters, "why it matters" of 80 to 900, three to
    eight steps of 20 to 400 characters each, an example of 80 to 1200, and two
    to five takeaways of 20 to 300 characters each. Every string keeps a
    [SCAFFOLD] marker so scripts/validate.py refuses to publish the topic until
    the text is real.
    """
    return {
        "definition": (
            f"[SCAFFOLD] Replace this with two or three short sentences that say what {title} is, "
            "in plain words a beginner can follow. Define any technical term the moment you use it."
        ),
        "whyItMatters": (
            "[SCAFFOLD] Replace this with three to five short sentences explaining the problem this "
            "topic solves, or the risk when it is ignored. Use everyday words and short sentences, "
            "written at B1 English level."
        ),
        "howItWorks": [
            "[SCAFFOLD] Replace with the first plain step, in one short sentence.",
            "[SCAFFOLD] Replace with the second plain step, in one short sentence.",
            "[SCAFFOLD] Replace with the third plain step, in one short sentence.",
            "[SCAFFOLD] Replace with the fourth plain step, in one short sentence.",
        ],
        "example": (
            "[SCAFFOLD] Replace this with one concrete analogy or real-world situation the reader can "
            "picture. A locked door, a night-shift alarm desk or a sealed letter all work if they fit "
            "the topic."
        ),
        "takeaways": [
            "[SCAFFOLD] Replace with the first thing to remember tomorrow.",
            "[SCAFFOLD] Replace with the second thing to remember tomorrow.",
            "[SCAFFOLD] Replace with the third thing to remember tomorrow.",
        ],
    }


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

    payload: dict = {
        "id": topic_id,
        "type": kind,
        "title": args.title,
        "shortTitle": args.short_title or (args.title if len(args.title) <= 40 else args.title[:37] + "..."),
        "theme": theme,
        "summary": SCAFFOLD_SUMMARY,
        "beginner": beginner_scaffold(args.title),
        "objectives": [
            "Explain what this topic is and the mechanism behind it.",
            "Identify the telemetry, artefact or control evidence it leaves behind.",
            "Distinguish it from legitimate activity that looks similar.",
            "Apply it correctly under time pressure in a realistic scenario.",
        ],
        "tags": [t.strip().lower() for t in (args.tags or "").split(",") if t.strip()] or [topic_id.replace("-", " ")],
        "difficulty": args.difficulty,
        "relatedTopics": [r.strip() for r in (args.related or "").split(",") if r.strip()],
        "sources": [{"label": args.source_label or "Add a source", "url": args.source or "https://attack.mitre.org/"}],
        "lastReviewed": args.last_reviewed,
    }

    # The exercise model. A certification is a syllabus, so it is organised by
    # chapter and starts with one empty chapter for you to fill in. Everything
    # else gets a flat list. Both start empty: the page then says "No exercises
    # yet", which is the honest state and is what the coverage page reports.
    if kind == "certification":
        payload["chapters"] = [
            {
                "number": 1,
                "title": f"{args.title}: first chapter",
                "objectives": [
                    "[SCAFFOLD] Replace this with the first official exam domain, "
                    "paraphrased in your own words. Add one chapter per domain."
                ],
                "exercises": [],
            }
        ]
        payload["exercises"] = []
    else:
        payload["exercises"] = []

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


def readme_for(topic_id: str, kind: str, title: str) -> str:
    return f"""# Exercises for {title}

Put the exercise HTML files for the `{topic_id}` {kind} topic in this folder.
There is no fixed number and no required file name: the site only needs the path
you give it to be inside `exercises/` and to end in `.html`.

## Linking an exercise to this topic

**One command (recommended).** It checks the file exists, refuses duplicates,
writes the entry for you, and rebuilds the site:

```
python scripts/new_exercise.py --topic {topic_id} --title "Your exercise title" ^
    --path "exercises/{topic_id}/your-file.html" --kind lesson --minutes 30
```

On macOS or Linux, replace the `^` at the end of the first line with `\\`.

**By hand.** Open `data/{TYPE_DIRS[kind]}/{topic_id}.json` and add an object to the
`exercises` list:

```json
{{
  "title": "Your exercise title",
  "path": "exercises/{topic_id}/your-file.html",
  "kind": "lesson",
  "status": "published",
  "summary": "One sentence describing what the learner will do.",
  "minutes": 30
}}
```

`kind` is one of `lesson`, `quiz`, `lab`, `exam` or `scenario`.
`status` is `published`, `draft` or `missing`. Use `missing` for an exercise you
have not written yet: the page shows "Coming soon" instead of a broken button.
A `published` entry whose file is not on disk fails `scripts/validate.py` on
purpose, so the coverage page can never claim something nobody can open.

If this topic is a certification, the exercises live inside its chapters instead.
Attach one with `--chapter N`, or paste the object into that chapter's
`exercises` list.

## Then rebuild

```
python scripts/build_catalog.py
python scripts/generate_pages.py
python scripts/validate.py
```

The topic page picks the new exercise up automatically and shows a Start button.

## What an exercise file must be

* **One file.** All CSS and JavaScript inline. No CDN, no web font, no external
  request of any kind, no build step.
* **Under 250 KB.** `scripts/validate.py` fails the build if it is larger.
* **Self-contained.** It must work when opened directly in a browser, not only
  inside the site.
* **Keyboard operable and readable by a screen reader.** One `<h1>`, real labels,
  a visible focus ring, and no interaction that needs a mouse.

## Reporting the score (optional but recommended)

If the exercise tells the site its result, the score is saved and appears in
"Continue where you left off". Without it the site still tries to read a
percentage from the results screen, so a visible results panel usually works.

To be certain, add this to the exercise's own `<script>` when the results show:

```js
try {{
  var percent = Math.round(correct / total * 100);
  parent.postMessage({{
    type: "CYBERPULSE_SCORE",
    topicId: "{topic_id}",
    batch: 1,
    score: correct,
    total: total,
    percent: percent,
    passed: percent >= 70
  }}, location.origin);
}} catch (e) {{ /* opened outside the site, nothing to report to */ }}
```

The `try`/`catch` matters: it lets the same file work when you open it directly.

The exercise may also receive a handshake from the site, and should ignore it if
it does not need it:

```js
window.addEventListener("message", function (ev) {{
  if (ev.data && ev.data.type === "CYBERPULSE_INIT") {{
    // ev.data.username, ev.data.country, ev.data.theme, ev.data.language
  }}
}});
```

## Content safety, non-negotiable

No working exploit code. No real credentials. No live malware samples or their
hashes. Nothing that crosses into "how to attack a real target". Everything is
framed as defensive or lab-only, and every indicator is defanged:
`hxxp://evil[.]example`, `10[.]0[.]0[.]1`. `scripts/validate.py` enforces the
defanging rule automatically.
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
    print(f"  1. Write the beginner explanation. Open data/{TYPE_DIRS[args.type]}/{args.id}.json")
    print("     and replace the [SCAFFOLD] text in the 'beginner' block. It has five parts,")
    print("     and they are the first thing a visitor reads:")
    print("       definition     2-3 short sentences saying what it is")
    print("       whyItMatters   the problem it solves, or the risk if ignored")
    print("       howItWorks     3-8 plain steps, one sentence each")
    print("       example        one real-world comparison the reader can picture")
    print("       takeaways      2-5 things to remember tomorrow")
    print("     Write it in B1 English: short sentences, everyday words, and define any")
    print("     technical term as soon as you use it.")
    print("  2. Replace the [SCAFFOLD] paragraph in 'summary' with 200 or more characters")
    print("     of real prose for a reader who already works in security. It is also used")
    print("     as the page description and the first FAQ answer.")
    print(f"  3. Fill in the remaining fields that need real content{'' if args.type == 'keyword' else ':'}")
    if args.type == "detection":
        print("       dataSources, logic, pseudoQuery, falsePositives, tuningNotes, severity.")
        print("     A detection with placeholder telemetry is worse than no detection.")
    elif args.type == "mitigation":
        print("       mitigatesTechniques, which technique ids this control actually addresses.")
    elif args.type == "group":
        print("       linkedTechniques from public reporting. Say where attribution is contested.")
    elif args.type == "certification":
        print("       chapters, one per official exam domain, with that domain's objectives.")
        print("       A starter chapter 1 is already in the file. Copy it and give each new")
        print("       chapter the next number. Chapter numbers must be unique.")
        print("       Never link or embed a vendor logo: that implies endorsement.")
    else:
        print("       objectives, tags and sources.")
    print(f"  4. Add exercises. Put the HTML files in exercises/{args.id}/ and link each one:")
    print(f"       python scripts/new_exercise.py --topic {args.id} \\")
    print(f"           --title \"Your exercise title\" \\")
    print(f"           --path \"exercises/{args.id}/your-file.html\" --kind lesson --minutes 30")
    if args.type == "certification":
        print("     Add --chapter N to attach it to a specific chapter.")
    print("     A topic with no exercises yet is fine: the page says so honestly.")
    print(f"  5. Rebuild and gate:")
    print(f"       python scripts/build_catalog.py")
    print(f"       python scripts/generate_pages.py")
    print(f"       python scripts/validate.py")
    print(f"  6. Preview locally, then commit:")
    print(f"       python -m http.server 8000")
    print(f"       open http://localhost:8000/{page}")
    print()
    print("validate.py FAILS until every [SCAFFOLD] marker is gone. That is deliberate:")
    print("it is what stops an unfinished topic from reaching main. The coverage page")
    print("will show this topic as not ready until it has at least one published exercise,")
    print("which is the honest state and is not a problem.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
