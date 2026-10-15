#!/usr/bin/env python3
"""Link every batch file on disk to its topic, in one command.

The homepage coverage bars, their colours and their percentages are all derived from
`data/catalog.json`, which is derived from the topic JSON files. So the numbers follow the
data automatically — but only once a new batch file is *recorded* on its topic. Dropping
four files into `exercises/detections/DET0099/` changes nothing on its own, which is the
one manual step between a finished batch and a moving progress bar.

This closes that gap for a whole drop at once:

    python scripts/sync_exercises.py             # link everything and write the JSON
    python scripts/sync_exercises.py --check     # write nothing; exit 1 if unlinked work exists
    python scripts/sync_exercises.py --dry-run   # show what would change

It matches files to topics by the convention the batch generator already produces:

    exercises/<catalog>/<EXTERNAL_ID>/<EXTERNAL_ID>_<TIER>.html
    exercises/certifications/<track>/<chapter number> <title> - <TIER>.html

Filling a reserved slot is safe; adding a missing one uses the same title and summary
wording as every other slot, so a generated entry is indistinguishable from a hand-made
one. It never deletes an entry, never touches a topic with no matching folder, and reports
what it could not match instead of guessing. For one file with an unusual name, use
`scripts/new_exercise.py`.

Standard library only.
"""

from __future__ import annotations

import argparse
import datetime
import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent
DATA = ROOT / "data"
EXERCISES = ROOT / "exercises"

TYPE_DIRS = {
    "keyword": "keywords",
    "certification": "certifications",
    "tactic": "tactics",
    "technique": "techniques",
    "mitigation": "mitigations",
    "detection": "detections",
    "group": "groups",
}

# Longest suffix first: "X_EXTREMELY_HARD" also ends with "_HARD", and reading it as HARD
# would point the wrong slot at the wrong file.
TIERS = [
    ("EXTREMELY_HARD", "extremely-hard",
     "Synthesis under pressure: incomplete evidence, competing priorities, and a decision you must defend."),
    ("MEDIUM", "medium", "Application: read a short log or alert and choose the correct next step."),
    ("HARD", "hard", "Analysis: a multi-step scenario with distractors, evidence to weigh, and a reason to give."),
    ("EASY", "easy", "Recall and recognition: definitions, one clear answer, single-step questions."),
]
SUFFIX_TO_TIER = {suffix: slug for suffix, slug, _ in TIERS}
TIER_LABEL = {"easy": "EASY", "medium": "MEDIUM", "hard": "HARD", "extremely-hard": "EXTREMELY_HARD"}
TIER_SUMMARY = {slug: summary for _, slug, summary in TIERS}


def tier_of(stem: str) -> str | None:
    """The tier a file name claims, or None when it claims nothing."""
    upper = stem.upper()
    for suffix, _, _ in TIERS:
        if upper.endswith("_" + suffix):
            return SUFFIX_TO_TIER[suffix]
    return None


def batch_files(folder: Path) -> dict[str, Path]:
    """Files in one topic folder, keyed by tier. A tier with two candidates is ambiguous."""
    found: dict[str, Path] = {}
    ambiguous: set[str] = set()
    for path in sorted(folder.glob("*.html")):
        tier = tier_of(path.stem)
        if not tier:
            continue
        if tier in found:
            ambiguous.add(tier)
        found[tier] = path
    for tier in ambiguous:
        found.pop(tier, None)
    return found, ambiguous


def topic_folder(topic: dict):
    """The folder that holds this topic's batches, if it exists."""
    dirname = TYPE_DIRS.get(topic.get("type"))
    if not dirname:
        return None
    base = EXERCISES / dirname
    if not base.is_dir():
        return None
    names = {str(topic.get("id", "")).lower()}
    if topic.get("externalId"):
        names.add(str(topic["externalId"]).lower())
    names.discard("")
    for folder in sorted(base.iterdir()):
        if folder.is_dir() and folder.name.lower() in names:
            return folder
    return None


def slot(**kwargs) -> dict:
    return kwargs


def sync_topic_slots(topic: dict, folder: Path, today: str):
    """Fill or add every tier slot the folder has a file for. Returns (changes, notes)."""
    changes, notes = [], []
    files, ambiguous = batch_files(folder)
    for tier in sorted(ambiguous):
        notes.append(f"{TIER_LABEL[tier]}: two files claim this tier, left alone")
    if not files:
        return changes, notes

    slots = topic.setdefault("exercises", [])
    for tier, path in sorted(files.items(), key=lambda kv: kv[1].name):
        rel = path.relative_to(ROOT).as_posix()
        existing = next((s for s in slots if str(s.get("difficulty", "")).lower() == tier), None)
        if existing is not None:
            if existing.get("path") != rel or existing.get("status") != "published":
                changes.append(f"{TIER_LABEL[tier]}: {existing.get('path')} -> {rel}")
                existing["path"] = rel
                existing["status"] = "published"
            continue
        slots.append(slot(
            title=f"{topic.get('title', topic.get('id'))} - {TIER_LABEL[tier]}",
            path=rel,
            difficulty=tier,
            kind="exam",
            status="published",
            summary=TIER_SUMMARY[tier],
        ))
        changes.append(f"{TIER_LABEL[tier]}: added {rel}")
    if changes:
        topic["lastReviewed"] = today
    return changes, notes


def sync_chapter_slots(topic: dict, folder: Path, today: str):
    """Certification chapters name their files '<number> <title> - <TIER>.html'."""
    changes, notes = [], []
    for chapter in topic.get("chapters") or []:
        number = str(chapter.get("number", "")).strip()
        if not number:
            continue
        slots = chapter.setdefault("exercises", [])
        for suffix, slug, _ in TIERS:
            candidates = [p for p in sorted(folder.glob(f"{number} * - {suffix}.html"))]
            if len(candidates) != 1:
                if len(candidates) > 1:
                    notes.append(f"chapter {number} {TIER_LABEL[slug]}: {len(candidates)} files match, left alone")
                continue
            rel = candidates[0].relative_to(ROOT).as_posix()
            existing = next((s for s in slots
                             if str(s.get("difficulty", "")).lower() == slug), None)
            if existing is not None:
                if existing.get("path") != rel or existing.get("status") != "published":
                    changes.append(f"chapter {number} {TIER_LABEL[slug]}: {existing.get('path')} -> {rel}")
                    existing["path"] = rel
                    existing["status"] = "published"
                continue
            slots.append(slot(
                title=f"{chapter.get('title', number)} - {TIER_LABEL[slug]}",
                path=rel,
                difficulty=slug,
                kind="exam",
                status="published",
                summary=TIER_SUMMARY[slug],
            ))
            changes.append(f"chapter {number} {TIER_LABEL[slug]}: added {rel}")
    if changes:
        topic["lastReviewed"] = today
    return changes, notes


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check", action="store_true",
                        help="Write nothing. Exit 1 when something on disk is not linked yet.")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show the changes without writing them.")
    parser.add_argument("--quiet", action="store_true", help="Only print the summary line.")
    args = parser.parse_args()

    today = datetime.date.today().isoformat()
    changed_topics = 0
    changed_slots = 0
    notes: list[str] = []
    unmatched: list[str] = []

    for dirname in sorted(set(TYPE_DIRS.values())):
        for path in sorted((DATA / dirname).glob("*.json")):
            topic = json.loads(path.read_text(encoding="utf-8"))
            folder = topic_folder(topic)
            if folder is None:
                continue
            changes, chapter_notes = sync_chapter_slots(topic, folder, today)
            more, topic_notes = sync_topic_slots(topic, folder, today)
            changes += more
            notes += [f"{path.name}: {n}" for n in chapter_notes + topic_notes]
            if not changes:
                continue
            changed_topics += 1
            changed_slots += len(changes)
            if not args.quiet:
                print(f"{path.name}")
                for line in changes:
                    print(f"    {line}")
            if not (args.check or args.dry_run):
                path.write_text(json.dumps(topic, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    if notes:
        print("\nLeft alone:")
        for line in notes:
            print("    " + line)

    # Anything on disk that no topic claims. Reported, never guessed at.
    claimed = set()
    for dirname in sorted(set(TYPE_DIRS.values())):
        for path in sorted((DATA / dirname).glob("*.json")):
            topic = json.loads(path.read_text(encoding="utf-8"))
            entries = list(topic.get("exercises") or [])
            for chapter in topic.get("chapters") or []:
                entries += list(chapter.get("exercises") or [])
            claimed.update(str(e.get("path", "")) for e in entries)
    if EXERCISES.is_dir():
        unmatched = sorted(p.relative_to(ROOT).as_posix() for p in EXERCISES.rglob("*.html")
                           if p.relative_to(ROOT).as_posix() not in claimed)
    if unmatched:
        print(f"\n{len(unmatched)} exercise file(s) no topic claims:")
        for rel in unmatched[:12]:
            print("    " + rel)
        if len(unmatched) > 12:
            print(f"    ... and {len(unmatched) - 12} more")

    verb = "would link" if args.dry_run else "linked"
    print(f"\n{changed_slots} slot(s) {verb} across {changed_topics} topic(s); "
          f"{len(unmatched)} file(s) unmatched.")
    if args.check and (changed_slots or unmatched):
        print("FAIL: run python scripts/sync_exercises.py, then rebuild.")
        return 1
    if not args.check and not args.dry_run and changed_slots:
        print("\nNow rebuild so the catalogue and the pages pick it up:")
        print("    python scripts/build_catalog.py && python scripts/generate_pages.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
