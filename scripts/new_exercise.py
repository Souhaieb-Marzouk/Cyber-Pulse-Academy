#!/usr/bin/env python3
"""Link an exercise page to a topic, in one command.

You have written an exercise as a standalone HTML file. This command records it
on the right study page and rebuilds the site, so you never hand-edit a list.

    python scripts/new_exercise.py --topic firewall --title "Reading firewall logs" \
        --path "exercises/keywords/firewall/firewall-logs.html"

    # put it under chapter 3 of a certification instead of the topic itself
    python scripts/new_exercise.py --topic cysa-plus --chapter 3 \
        --title "Triage a suspicious login" \
        --path "exercises/certifications/CySA+/triage-suspicious-login.html" \
        --kind scenario --minutes 25

What it does:

  1. checks the topic exists and that the file path is inside exercises/;
  2. checks the exercise file is really there, unless you pass --allow-missing;
  3. checks you are not adding the same path twice;
  4. writes the entry into the topic JSON, in the chapter you asked for when the
     topic is a certification, otherwise into the topic's own list;
  5. rebuilds the catalog and the pages, so the new exercise appears immediately.

Where the file itself lives is up to you. The site only needs the path to be
relative to the repository root and to end in .html. Use a folder name that
makes sense to you, for example exercises/keywords/, exercises/CySA+/ or
exercises/mitre/.

Standard library only.
"""

from __future__ import annotations

import argparse
import datetime
import json
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent
DATA = ROOT / "data"

TYPE_DIRS = {
    "keyword": "keywords",
    "certification": "certifications",
    "tactic": "tactics",
    "technique": "techniques",
    "mitigation": "mitigations",
    "detection": "detections",
    "group": "groups",
}

KINDS = ["lesson", "quiz", "lab", "exam", "scenario"]


def die(message: str) -> int:
    print("FAIL: " + message, file=sys.stderr)
    return 1


def find_topic(topic_id: str):
    """Return (path, data) for a topic id, searching every type folder."""
    for dirname in TYPE_DIRS.values():
        candidate = DATA / dirname / f"{topic_id}.json"
        if candidate.exists():
            return candidate, json.loads(candidate.read_text(encoding="utf-8"))
    return None, None


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Link an exercise page to a topic and rebuild the site.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--topic", required=True, help="the topic id, for example firewall or cysa-plus")
    parser.add_argument("--title", required=True, help="what the learner sees on the button")
    parser.add_argument("--path", required=True,
                        help="repository-relative path, for example exercises/certifications/CySA+/lesson-1.html")
    parser.add_argument("--chapter", type=int, default=None,
                        help="for a certification only: which chapter number to attach it to")
    parser.add_argument("--kind", default="exam", choices=KINDS, help="shown as a chip")
    parser.add_argument("--minutes", type=int, default=None, help="roughly how long it takes")
    parser.add_argument("--summary", default=None, help="one sentence describing what the learner will do")
    parser.add_argument("--status", default="published", choices=["published", "draft", "missing"])
    parser.add_argument("--allow-missing", action="store_true",
                        help="record it even though the file is not there yet, so the page shows Coming soon")
    parser.add_argument("--dry-run", action="store_true", help="show what would change, write nothing")
    args = parser.parse_args()

    topic_path, topic = find_topic(args.topic)
    if topic_path is None:
        return die(f"no topic with the id '{args.topic}'. Check the file name under data/.")

    path = args.path.replace("\\", "/").lstrip("./")
    if not path.startswith("exercises/"):
        return die("--path must start with 'exercises/'")
    if not path.endswith(".html"):
        return die("--path must end with '.html'")

    on_disk = (ROOT / path).exists()
    if not on_disk and not args.allow_missing:
        return die(
            f"the file '{path}' is not in the repository. Create it first, or pass "
            f"--allow-missing to list it as Coming soon."
        )
    if on_disk and args.status == "missing":
        print(f"NOTE: '{path}' exists, so the status is being set to published.")
        args.status = "published"

    entry = {"title": args.title, "path": path, "kind": args.kind, "status": args.status}
    if args.summary:
        entry["summary"] = args.summary
    if args.minutes:
        entry["minutes"] = args.minutes

    is_cert = topic.get("type") == "certification"
    chapters = topic.setdefault("chapters", []) if is_cert else []

    # Duplicate check across the whole topic.
    existing = []
    for chapter in chapters:
        for item in chapter.get("exercises") or []:
            existing.append(item.get("path"))
    for item in topic.get("exercises") or []:
        existing.append(item.get("path"))
    if path in existing:
        return die(f"'{path}' is already linked to {args.topic}. Remove the old entry first.")

    if is_cert and args.chapter is not None:
        target = None
        for chapter in chapters:
            if chapter.get("number") == args.chapter:
                target = chapter
                break
        if target is None:
            numbers = ", ".join(str(c.get("number")) for c in chapters) or "none"
            return die(f"chapter {args.chapter} does not exist on {args.topic}. Available: {numbers}.")
        target.setdefault("exercises", []).append(entry)
        where = f"chapter {args.chapter} ({target.get('title')})"
    elif is_cert:
        topic.setdefault("exercises", []).append(entry)
        where = "the certification's own list (no --chapter given)"
    else:
        topic.setdefault("exercises", []).append(entry)
        where = "the topic's exercise list"

    topic["lastReviewed"] = datetime.date.today().isoformat()

    if args.dry_run:
        print(json.dumps(entry, indent=2, ensure_ascii=False))
        print(f"would add to {where} on {topic_path.relative_to(ROOT).as_posix()}")
        return 0

    topic_path.write_text(json.dumps(topic, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Linked '{args.title}'")
    print(f"  topic   : {args.topic}")
    print(f"  where   : {where}")
    print(f"  file    : {path}{'' if on_disk else '  (not on disk yet, shown as Coming soon)'}")
    print(f"  file    : {topic_path.relative_to(ROOT).as_posix()}")

    print("\nRebuilding")
    print("-" * 58)
    for script in ("build_catalog.py", "generate_pages.py"):
        result = subprocess.run([sys.executable, str(SCRIPT_DIR / script)], cwd=str(ROOT), text=True)
        if result.returncode != 0:
            return die(f"{script} failed. Fix the data, then run it again.")

    print("\n" + "=" * 58)
    print("Done. Next steps:")
    print(f"  1. Preview:  python -m http.server 8000")
    print(f"     Open:     http://localhost:8000/topics/{args.topic}.html")
    print(f"  2. Click your exercise. It opens in the frame on the study page.")
    print(f"  3. Run the checks:  python scripts/validate.py")
    print(f"  4. Commit and push. GitHub Pages publishes within about a minute.")
    print()
    print("Optional but recommended: make the exercise report its own score.")
    print("Add these three lines to the exercise HTML, inside its own <script>:")
    print()
    print('    try {')
    print('      parent.postMessage({ type: "CYBERPULSE_SCORE", topicId: "%s",' % args.topic)
    print('        batch: 1, score: correct, total: total,')
    print('        percent: Math.round(correct / total * 100), passed: percent >= 70 },')
    print('        location.origin);')
    print('    } catch (e) {}')
    print()
    print("Without it, the site still tries to read the score from the results screen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
