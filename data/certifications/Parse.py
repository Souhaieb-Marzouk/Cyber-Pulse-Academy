#!/usr/bin/env python3
"""
Replace branding strings across all files in a folder.

Usage:
    python replace_branding.py <folder_path> [--dry-run]

Replacements performed (in this order):
    1. "https://souhaieb-marzouk.github.io/Cyber-Pulse-Academy"
         -> "https://souhaieb-marzouk.github.io/Cyber-Pulse-Academy"
    2. "CYBERPULSEACADEMY"  -> "CYBERPULSEACADEMY"
    3. "CyberPulseAcademy"  -> "CyberPulseAcademy"
    4. "cyberpulseacademy"  -> "cyberpulseacademy"

Note: The URL replacement runs first because it contains the lowercase
token "cyberpulseacademy" as a substring.
"""

import argparse
import sys
from pathlib import Path


# Order matters: put the URL first.
REPLACEMENTS = [
    ("https://souhaieb-marzouk.github.io/Cyber-Pulse-Academy",
     "https://souhaieb-marzouk.github.io/Cyber-Pulse-Academy"),
    ("CYBERPULSEACADEMY", "CYBERPULSEACADEMY"),
    ("CyberPulseAcademy", "CyberPulseAcademy"),
    ("cyberpulseacademy", "cyberpulseacademy"),
]


def process_file(filepath: Path, dry_run: bool = False) -> bool:
    """Apply replacements to a single file. Returns True if it was modified."""
    try:
        original = filepath.read_text(encoding="utf-8")
    except (UnicodeDecodeError, PermissionError, OSError) as exc:
        print(f"  Skipped (cannot read): {filepath}  [{exc}]")
        return False

    updated = original
    for old, new in REPLACEMENTS:
        if old in updated:
            updated = updated.replace(old, new)

    if updated == original:
        return False

    if dry_run:
        print(f"  [DRY-RUN] Would update: {filepath}")
    else:
        try:
            filepath.write_text(updated, encoding="utf-8")
            print(f"  Updated: {filepath}")
        except (PermissionError, OSError) as exc:
            print(f"  Failed to write: {filepath}  [{exc}]")
            return False
    return True


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Replace CyberPulseAcademy branding strings inside all files of a folder."
    )
    parser.add_argument("folder", help="Path to the folder to process")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would change without writing any files",
    )
    parser.add_argument(
        "--no-recursive",
        action="store_true",
        help="Only process files directly inside the given folder (default: recursive)",
    )
    args = parser.parse_args()

    folder = Path(args.folder).expanduser().resolve()
    if not folder.is_dir():
        print(f"Error: '{folder}' is not a valid directory.", file=sys.stderr)
        return 1

    iterator = folder.iterdir() if args.no_recursive else folder.rglob("*")
    files = [p for p in iterator if p.is_file()]

    print(f"Scanning {len(files)} file(s) in: {folder}")
    if args.dry_run:
        print("(dry-run mode — no files will be modified)\n")

    changed = 0
    for filepath in files:
        if process_file(filepath, dry_run=args.dry_run):
            changed += 1

    verb = "would be updated" if args.dry_run else "updated"
    print(f"\nDone. {changed} file(s) {verb}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())