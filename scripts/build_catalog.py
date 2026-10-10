#!/usr/bin/env python3
"""Build data/catalog.json, sitemap.xml and robots.txt from the per-topic JSON.

This is the single source of truth generator for CyberPulseAcademy. Nothing on the
site hard-codes a topic, a count or a theme: if it appears in a listing page it
came out of data/catalog.json, and catalog.json came out of one file per topic
in data/<type>/.

Standard library only. Python 3.8+.

Usage:
    python scripts/build_catalog.py
    python scripts/build_catalog.py --base-url https://user.github.io/repo
    python scripts/build_catalog.py --check          # exit 1 if catalog.json is stale
"""

from __future__ import annotations

import argparse
import datetime
import hashlib
import json
import re
import sys
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

# --------------------------------------------------------------------------- #
# Paths
# --------------------------------------------------------------------------- #

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent
DATA_DIR = ROOT / "data"
SCHEMA_DIR = DATA_DIR / "schema"
CATALOG_PATH = DATA_DIR / "catalog.json"
SITEMAP_PATH = ROOT / "sitemap.xml"
ROBOTS_PATH = ROOT / "robots.txt"
CONFIG_JS = ROOT / "assets" / "js" / "config.js"

TOPIC_TYPES = [
    "keyword",
    "certification",
    "tactic",
    "technique",
    "mitigation",
    "detection",
    "group",
]

# Directory name -> topic type. They differ only for keywords/certifications.
TYPE_DIRS = {
    "keywords": "keyword",
    "certifications": "certification",
    "tactics": "tactic",
    "techniques": "technique",
    "mitigations": "mitigation",
    "detections": "detection",
    "groups": "group",
}

TYPE_TO_DIR = {v: k for k, v in TYPE_DIRS.items()}

# --------------------------------------------------------------------------- #
# Minimal JSON Schema validator
# --------------------------------------------------------------------------- #
# A hand-rolled validator, deliberately. The alternative is a third-party
# dependency (jsonschema) that every contributor would then have to install
# before they could run the build or the CI gate, and the schemas used here
# only exercise a small, well understood subset of draft 2020-12.
#
# Supported keywords: type, enum, const, required, properties,
# additionalProperties, items, minItems, maxItems, minLength, maxLength,
# pattern, format (date), default, allOf, if/then.

_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


class SchemaError(Exception):
    pass


def _type_matches(value, expected):
    if expected == "object":
        return isinstance(value, dict)
    if expected == "array":
        return isinstance(value, list)
    if expected == "string":
        return isinstance(value, str)
    if expected == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if expected == "number":
        return isinstance(value, (int, float)) and not isinstance(value, bool)
    if expected == "boolean":
        return isinstance(value, bool)
    if expected == "null":
        return value is None
    return True


def _resolve_ref(ref, root_schema, schema_dir):
    """Resolve a local $ref such as 'topic.schema.json' from the schema folder."""
    if ref.startswith("#"):
        node = root_schema
        for part in ref.lstrip("#/").split("/"):
            if not part:
                continue
            node = node.get(part, {})
        return node
    target = schema_dir / ref
    if not target.exists():
        raise SchemaError(f"unresolvable $ref: {ref}")
    return json.loads(target.read_text(encoding="utf-8"))


def validate(instance, schema, path="$", root_schema=None, schema_dir=None):
    """Return a list of human-readable error strings. Empty list means valid."""
    root_schema = root_schema if root_schema is not None else schema
    schema_dir = schema_dir if schema_dir is not None else SCHEMA_DIR
    errors: list[str] = []

    if "$ref" in schema:
        try:
            schema = _resolve_ref(schema["$ref"], root_schema, schema_dir)
        except SchemaError as exc:
            return [f"{path}: {exc}"]

    if "type" in schema:
        expected = schema["type"]
        options = expected if isinstance(expected, list) else [expected]
        if not any(_type_matches(instance, opt) for opt in options):
            return [f"{path}: expected type {expected}, got {type(instance).__name__}"]

    if "enum" in schema and instance not in schema["enum"]:
        errors.append(f"{path}: value {instance!r} is not one of {schema['enum']}")
    if "const" in schema and instance != schema["const"]:
        errors.append(f"{path}: value {instance!r} must equal {schema['const']!r}")

    if isinstance(instance, str):
        if "minLength" in schema and len(instance) < schema["minLength"]:
            errors.append(
                f"{path}: string is {len(instance)} characters, minimum is {schema['minLength']}"
            )
        if "maxLength" in schema and len(instance) > schema["maxLength"]:
            errors.append(
                f"{path}: string is {len(instance)} characters, maximum is {schema['maxLength']}"
            )
        if "pattern" in schema and not re.search(schema["pattern"], instance):
            errors.append(f"{path}: {instance[:60]!r} does not match pattern {schema['pattern']}")
        if schema.get("format") == "date" and not _DATE_RE.match(instance):
            errors.append(f"{path}: {instance!r} is not a YYYY-MM-DD date")

    if isinstance(instance, list):
        if "minItems" in schema and len(instance) < schema["minItems"]:
            errors.append(f"{path}: has {len(instance)} items, minimum is {schema['minItems']}")
        if "maxItems" in schema and len(instance) > schema["maxItems"]:
            errors.append(f"{path}: has {len(instance)} items, maximum is {schema['maxItems']}")
        if "items" in schema:
            for index, item in enumerate(instance):
                errors.extend(
                    validate(item, schema["items"], f"{path}[{index}]", root_schema, schema_dir)
                )

    if isinstance(instance, dict):
        for key in schema.get("required", []):
            if key not in instance:
                errors.append(f"{path}: missing required property '{key}'")
        props = schema.get("properties", {})
        for key, value in instance.items():
            if key in props:
                errors.extend(
                    validate(value, props[key], f"{path}.{key}", root_schema, schema_dir)
                )
            elif schema.get("additionalProperties") is False:
                errors.append(f"{path}: unexpected property '{key}'")

    # allOf with if/then: the conditional-requirement pattern used to demand
    # attributionNote only for the types that need it.
    for branch in schema.get("allOf", []):
        condition = branch.get("if")
        if condition is None:
            errors.extend(validate(instance, branch, path, root_schema, schema_dir))
            continue
        probe = validate(instance, condition, path, root_schema, schema_dir)
        if not probe:
            errors.extend(validate(instance, branch.get("then", {}), path, root_schema, schema_dir))

    return errors


def load_schema(name):
    return json.loads((SCHEMA_DIR / name).read_text(encoding="utf-8"))


# --------------------------------------------------------------------------- #
# Loading
# --------------------------------------------------------------------------- #

def load_topics():
    """Return (topics, errors). Reads every data/<type>/*.json file."""
    schema = load_schema("topic.schema.json")
    topics: list[dict] = []
    errors: list[str] = []
    seen_ids: dict[str, str] = {}

    for dirname, topic_type in TYPE_DIRS.items():
        folder = DATA_DIR / dirname
        if not folder.exists():
            continue
        for path in sorted(folder.glob("*.json")):
            rel = path.relative_to(ROOT).as_posix()
            try:
                raw = json.loads(path.read_text(encoding="utf-8"))
            except json.JSONDecodeError as exc:
                errors.append(f"{rel}: invalid JSON at line {exc.lineno} column {exc.colno}: {exc.msg}")
                continue

            for problem in validate(raw, schema):
                errors.append(f"{rel}: {problem}")

            topic_id = raw.get("id")
            if isinstance(topic_id, str):
                if topic_id in seen_ids:
                    errors.append(
                        f"{rel}: duplicate id '{topic_id}', already defined in {seen_ids[topic_id]}"
                    )
                else:
                    seen_ids[topic_id] = rel

            if raw.get("type") != topic_type:
                errors.append(
                    f"{rel}: type is '{raw.get('type')}' but the file lives in data/{dirname}/ "
                    f"which means type should be '{topic_type}'"
                )
            if isinstance(topic_id, str) and path.stem != topic_id:
                errors.append(
                    f"{rel}: file name does not match id '{topic_id}' "
                    f"(expected {topic_id}.json)"
                )
            topics.append(raw)

    return topics, errors


def validate_relationships(topics):
    """Cross-file checks that a per-file schema cannot express."""
    errors: list[str] = []
    by_id = {t.get("id"): t for t in topics if isinstance(t.get("id"), str)}

    for topic in topics:
        tid = topic.get("id", "?")
        rel = f"data/{TYPE_TO_DIR.get(topic.get('type'), '?')}/{tid}.json"

        parent = topic.get("parentTactic")
        if parent and parent not in by_id:
            errors.append(f"{rel}: parentTactic '{parent}' does not exist")
        elif parent and by_id[parent].get("type") != "tactic":
            errors.append(f"{rel}: parentTactic '{parent}' is not a tactic")

        parent_tech = topic.get("parentTechnique")
        if parent_tech:
            if parent_tech not in by_id:
                errors.append(f"{rel}: parentTechnique '{parent_tech}' does not exist")
            elif by_id[parent_tech].get("type") != "technique":
                errors.append(f"{rel}: parentTechnique '{parent_tech}' is not a technique")

        for key in ("mitigatesTechniques", "detectsTechniques", "linkedTechniques"):
            for ref in topic.get(key) or []:
                if ref not in by_id:
                    errors.append(f"{rel}: {key} references unknown id '{ref}'")
                elif by_id[ref].get("type") != "technique":
                    errors.append(f"{rel}: {key} references '{ref}' which is not a technique")

        single = topic.get("techniqueId")
        if single and single not in by_id:
            errors.append(f"{rel}: techniqueId '{single}' does not exist")

        for ref in topic.get("relatedTopics") or []:
            if ref not in by_id:
                errors.append(f"{rel}: relatedTopics references unknown id '{ref}'")
            elif ref == tid:
                errors.append(f"{rel}: relatedTopics references itself")

        # Exercises. Any number, any file name, any folder under exercises/, and
        # a topic may legitimately have none yet. What is checked here is that a
        # path points inside exercises/, ends in .html, is unique across the whole
        # catalogue, and that a chapter number is not repeated within a topic.
        seen_paths = set()
        for label, exercise in exercise_entries(topic):
            path_text = exercise.get("path")
            if not isinstance(path_text, str) or not path_text.startswith("exercises/"):
                errors.append(f"{rel}: {label}.path must start with 'exercises/'")
                continue
            if not path_text.endswith(".html"):
                errors.append(f"{rel}: {label}.path must end with '.html'")
            if path_text in seen_paths:
                errors.append(f"{rel}: {label}.path '{path_text}' is listed twice in this topic")
            seen_paths.add(path_text)

        numbers = [c.get("number") for c in (topic.get("chapters") or [])]
        if len(numbers) != len(set(numbers)):
            errors.append(f"{rel}: chapter numbers are not unique")

    return errors


def exercise_entries(topic):
    """Yield (label, exercise) for every exercise on a topic, in display order.

    Chapters first, then any flat exercises, which is the order the pages show
    them in. This mirrors CM.util.exerciseList in assets/js/config.js; if the data
    shape ever changes, both must change together.
    """
    for chapter in (topic.get("chapters") or []):
        for index, exercise in enumerate(chapter.get("exercises") or [], start=1):
            yield (f"chapters[{chapter.get('number')}].exercises[{index - 1}]", exercise)
    for index, exercise in enumerate(topic.get("exercises") or [], start=1):
        yield (f"exercises[{index - 1}]", exercise)


def topic_exercise_stats(topic):
    """{total, published, draft, missing} for one topic."""
    stats = {"total": 0, "published": 0, "draft": 0, "missing": 0}
    for _label, exercise in exercise_entries(topic):
        stats["total"] += 1
        status = exercise.get("status") or "published"
        if status in stats:
            stats[status] += 1
    return stats


# --------------------------------------------------------------------------- #
# Building
# --------------------------------------------------------------------------- #

EXERCISE_META_RE = re.compile(
    r'id=["\']cm-exercise-meta["\'][^>]*>(.*?)</script>', re.S | re.I)


def batch_question_total(topics):
    """How many individual exercises live inside the batches that are ready.

    A "batch" is one exercise file — one exam. A file that follows the site's
    contract declares its own `questionCount` in a `cm-exercise-meta` block, so
    the real number of questions inside it is knowable without opening it in a
    browser. Files that predate that contract simply do not contribute, and the
    number that did contribute is returned alongside the total so the figure can
    be reported honestly rather than as an estimate.
    """
    total = 0
    counted = 0
    declared = 0
    for topic in topics:
        for _label, exercise in exercise_entries(topic):
            if (exercise.get("status") or "published") != "published":
                continue
            relative = str(exercise.get("path") or "")
            path = ROOT / relative
            if not relative or not path.is_file():
                continue
            declared += 1
            try:
                text = path.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue
            match = EXERCISE_META_RE.search(text)
            if not match:
                continue
            try:
                meta = json.loads(match.group(1))
            except json.JSONDecodeError:
                continue
            count = meta.get("questionCount")
            if isinstance(count, int) and count > 0:
                total += count
                counted += 1
    return total, counted, declared


def content_hash(topics):
    """Deterministic sha256 over the sorted topic payloads."""
    digest = hashlib.sha256()
    for topic in sorted(topics, key=lambda t: str(t.get("id", ""))):
        digest.update(json.dumps(topic, sort_keys=True, separators=(",", ":")).encode("utf-8"))
    return "sha256-" + digest.hexdigest()[:32]


def build_catalog(topics, site_version):
    totals = {name: 0 for name in TYPE_DIRS}
    for topic in topics:
        dirname = TYPE_TO_DIR.get(topic.get("type"))
        if dirname:
            totals[dirname] += 1

    # How many individual exercises sit inside the batches that are ready.
    batch_questions, batches_counted, batches_declared = batch_question_total(topics)

    # Exercise accounting across the whole catalogue.
    exercises_published = 0
    exercises_draft = 0
    exercises_missing = 0
    exercises_total = 0
    chapters_total = 0
    for topic in topics:
        chapters_total += len(topic.get("chapters") or [])
        for _label, exercise in exercise_entries(topic):
            exercises_total += 1
            status = exercise.get("status") or "published"
            if status == "published":
                exercises_published += 1
            elif status == "draft":
                exercises_draft += 1
            else:
                exercises_missing += 1

    # Coverage buckets, redefined for the flexible model. The old 0/1/2/3 scheme
    # only made sense when every topic had exactly three slots.
    #
    # A certification counts as complete only when every chapter has at least one
    # exercise. Otherwise a certificate with a single lesson attached would report
    # as finished while seven of its eight chapters were empty, which is exactly
    # the kind of flattering number this page exists to avoid.
    coverage = {
        "noExercises": [],
        "noPublished": [],
        "partial": [],
        "complete": [],
    }
    for topic in topics:
        stats = topic_exercise_stats(topic)
        chapters = topic.get("chapters") or []
        empty_chapters = [c for c in chapters if not (c.get("exercises") or [])]
        if stats["total"] == 0:
            coverage["noExercises"].append(topic.get("id"))
        elif stats["published"] == 0:
            coverage["noPublished"].append(topic.get("id"))
        elif empty_chapters or stats["published"] < stats["total"]:
            coverage["partial"].append(topic.get("id"))
        else:
            coverage["complete"].append(topic.get("id"))

    themes: dict[tuple, dict] = {}
    for topic in topics:
        key = (topic.get("theme", "Uncategorised"), topic.get("type"))
        if key not in themes:
            themes[key] = {
                "id": re.sub(r"[^a-z0-9]+", "-", str(key[0]).lower()).strip("-"),
                "label": key[0],
                "type": key[1],
                "count": 0,
            }
        themes[key]["count"] += 1

    ordered_themes = sorted(themes.values(), key=lambda item: (item["type"], item["label"]))
    ordered_topics = sorted(topics, key=lambda t: (t.get("type", ""), t.get("title", "").lower()))

    return {
        "version": "1.0.0",
        "generatedAt": datetime.datetime.now(datetime.timezone.utc)
        .replace(microsecond=0)
        .isoformat()
        .replace("+00:00", "Z"),
        "contentHash": content_hash(topics),
        "siteVersion": site_version,
        "totals": dict(
            {
                name: totals.get(name, 0)
                for name in TYPE_DIRS
            },
            exercisesPublished=exercises_published,
            exercisesDraft=exercises_draft,
            exercisesMissing=exercises_missing,
            exercisesTotal=exercises_total,
            chaptersTotal=chapters_total,
            topics=len(topics),
            topicsWithExercises=len(topics) - len(coverage["noExercises"]),
            topicsWithNoExercises=len(coverage["noExercises"]),
            # Topics a learner can actually start on right now: at least one of
            # their exercises has a real file. This is the honest "covered"
            # figure, as opposed to topicsWithExercises, which counts topics that
            # merely have slots reserved.
            topicsReady=(len(topics) - len(coverage["noExercises"])
                         - len(coverage["noPublished"])),
            # How many individual exercises live inside those ready batches,
            # summed from each file's own declared questionCount.
            batchQuestions=batch_questions,
            batchesCounted=batches_counted,
            batchesDeclared=batches_declared,
            # Legacy aliases. The old key names are kept so that any page or script
            # written against the batch model keeps returning a sensible number
            # instead of undefined.
            batchesPublished=exercises_published,
            batchesMissing=exercises_missing,
            batchesTotal=exercises_total,
        ),
        "coverage": coverage,
        "themes": ordered_themes,
        # Reserved for later modules. Empty on purpose, and the renderer
        # ignores unknown and empty fields, so these can be filled without
        # touching any UI code.
        "courses": [],
        "labs": [],
        "glossary": [],
        "quizzes": [],
        "topics": [lean_topic(topic) for topic in ordered_topics],
    }


def write_json(path: Path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


# --------------------------------------------------------------------------- #
# The published index is deliberately NOT a copy of the topic files.
#
# data/catalog.json is what every visitor's browser downloads, so it carries only
# what the listing, search and coverage pages actually read. The article text,
# the plain-language block, the sources and the reference lists all stay in
# data/<type>/<id>.json, where the page generator reads them when it renders the
# topic pages. Nothing is lost: the pages are built from the source files.
#
# The saving is large and grows with the catalogue. On the full ATT&CK import the
# difference is roughly 1.5 MB instead of 14 MB, and a 14 MB file would also be
# committed to git on every content change.
# --------------------------------------------------------------------------- #
INDEX_SUMMARY_CHARS = 500

# Fields the browser needs in order to filter and cross-reference.
#
# Leaving one of these out does not break the build or the page render, which is
# exactly what makes the omission easy to miss: the facet simply has nothing to
# match on, so choosing any value returns "no results" instead of an error. That
# is what happened to the technique "Parent tactic" filter. They are all short,
# so every field the UI can read is published.
REFERENCE_FIELDS = (
    "parentTactic",         # techniques: the "Parent tactic" facet
    "parentTechnique",      # techniques: the parent of a sub-technique
    "isSubTechnique",       # techniques: the parent/sub facet
    "mitigatesTechniques",  # mitigations: which techniques a control addresses
    "techniqueId",          # detections: the technique being detected
    "detectsTechniques",    # detections
    "severity",             # detections: the severity facet
    "linkedTechniques",     # groups
    "aliases",              # groups
    "relatedTopics",        # every type: the cross-reference list
)


def lean_topic(topic):
    """Project one topic down to the fields the browser needs."""
    exercises = []
    for _label, exercise in exercise_entries(topic):
        exercises.append({
            "difficulty": exercise.get("difficulty"),
            "kind": exercise.get("kind") or "exam",
            "status": exercise.get("status") or "published",
            "minutes": exercise.get("minutes"),
        })

    chapters = []
    for chapter in (topic.get("chapters") or []):
        chapters.append({
            "number": chapter.get("number"),
            "title": chapter.get("title"),
            "weight": chapter.get("weight"),
            "exercises": len(chapter.get("exercises") or []),
        })

    summary = str(topic.get("summary") or "")
    lean = {
        "id": topic.get("id"),
        "type": topic.get("type"),
        "title": topic.get("title"),
        "shortTitle": topic.get("shortTitle"),
        "externalId": topic.get("externalId"),
        "theme": topic.get("theme"),
        "difficulty": topic.get("difficulty"),
        "tags": topic.get("tags") or [],
        "summary": summary[:INDEX_SUMMARY_CHARS],
        "hasBeginner": bool(topic.get("beginner")),
        # A chapter list is a certification concept, so it stays empty elsewhere.
        "exercises": exercises,
        "chapters": chapters,
    }

    # Only a certification card renders objectives, so only certifications carry
    # them. At full catalogue size that keeps about 1.3 MB out of the index.
    if topic.get("type") == "certification":
        lean["objectives"] = topic.get("objectives") or []

    # The filter and cross-reference fields. Empty values are omitted rather than
    # published as null, so the index stays as small as it can be.
    for field in REFERENCE_FIELDS:
        value = topic.get(field)
        if value not in (None, "", [], {}):
            lean[field] = value

    return lean


def build_sitemap(catalog, base_url, exercise_paths):
    """Every page, topic and published exercise, with honest lastmod dates."""
    today = datetime.date.today().isoformat()
    urls: list[tuple[str, str, str, str]] = []

    def add(loc, lastmod, changefreq, priority):
        urls.append((base_url.rstrip("/") + "/" + loc.lstrip("/"), lastmod, changefreq, priority))

    add("index.html", today, "weekly", "1.0")
    add("pages/search.html", today, "monthly", "0.6")
    for dirname, topic_type in TYPE_DIRS.items():
        add(f"pages/{page_for_type(topic_type)}", today, "weekly", "0.9")
    for extra in (
        "pages/coverage.html",
        "pages/stats.html",
        "pages/contributors.html",
        "pages/about.html",
        "pages/support.html",
        "pages/disclaimer.html",
        "pages/terms.html",
        "pages/privacy.html",
        "pages/cookies.html",
    ):
        add(extra, today, "monthly", "0.4")

    for topic in catalog["topics"]:
        lastmod = topic.get("lastReviewed") or today
        add(f"topics/{topic['id']}.html", lastmod, "monthly", "0.8")

    for rel in sorted(exercise_paths):
        add(rel, today, "monthly", "0.5")

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for loc, lastmod, changefreq, priority in urls:
        lines.append("  <url>")
        lines.append(f"    <loc>{xml_escape(loc)}</loc>")
        lines.append(f"    <lastmod>{lastmod}</lastmod>")
        lines.append(f"    <changefreq>{changefreq}</changefreq>")
        lines.append(f"    <priority>{priority}</priority>")
        lines.append("  </url>")
    lines.append("</urlset>")
    return "\n".join(lines) + "\n", len(urls)


def page_for_type(topic_type):
    return {
        "keyword": "keywords.html",
        "certification": "certifications.html",
        "tactic": "mitre-tactics.html",
        "technique": "mitre-techniques.html",
        "mitigation": "mitre-mitigations.html",
        "detection": "mitre-detections.html",
        "group": "mitre-groups.html",
    }[topic_type]


def build_robots(base_url):
    return (
        "# CyberPulseAcademy robots.txt\n"
        "# Generated by scripts/build_catalog.py. Do not edit by hand.\n"
        "#\n"
        "# Everything here is public study material and is meant to be crawled.\n"
        "# The social preview images are deliberately NOT disallowed: Facebook,\n"
        "# LinkedIn and X fetch og:image, and some of their crawlers honour\n"
        "# robots.txt, so blocking that path would silently break link previews.\n"
        "# Bandwidth is controlled by the per-file size budget instead.\n"
        "#\n"
        "# Note for AI crawlers: the content is CC BY-NC-SA 4.0. Non-commercial\n"
        "# reuse with attribution and share-alike is permitted. Commercial reuse\n"
        "# is not. See LICENSE-CONTENT.\n"
        "\n"
        "User-agent: *\n"
        "Allow: /\n"
        "\n"
        "Sitemap: " + base_url.rstrip("/") + "/sitemap.xml\n"
    )


def derive_base_url():
    """Read repoUrl from assets/js/config.js and turn a GitHub repo into its
    Pages URL. Falls back to a clearly marked placeholder."""
    try:
        text = CONFIG_JS.read_text(encoding="utf-8")
    except OSError:
        return "https://example.github.io/cyber-pulse-academy"
    match = re.search(r"repoUrl\s*:\s*['\"]([^'\"]+)['\"]", text)
    if not match:
        return "https://example.github.io/cyber-pulse-academy"
    url = match.group(1).rstrip("/")
    gh = re.match(r"https://github\.com/([^/]+)/([^/]+)$", url)
    if gh:
        owner, repo = gh.group(1), gh.group(2)
        if owner.startswith("<") or repo.startswith("<"):
            return "https://example.github.io/cyber-pulse-academy"
        # GitHub Pages serves an organisation site at the lowercased owner
        # subdomain, while the repository path keeps its original case.
        return f"https://{owner.lower()}.github.io/{repo}"
    return url or "https://example.github.io/cyber-pulse-academy"


def read_site_version():
    try:
        text = CONFIG_JS.read_text(encoding="utf-8")
    except OSError:
        return "1.0.0"
    match = re.search(r"siteVersion\s*:\s*['\"]([^'\"]+)['\"]", text)
    return match.group(1) if match else "1.0.0"


def collect_exercise_paths():
    """Only exercises that actually exist on disk go into the sitemap."""
    found = set()
    exercises_dir = ROOT / "exercises"
    if exercises_dir.exists():
        for path in exercises_dir.rglob("batch-*.html"):
            found.add(path.relative_to(ROOT).as_posix())
    return found


def main():
    parser = argparse.ArgumentParser(description="Build catalog.json, sitemap.xml and robots.txt.")
    parser.add_argument("--base-url", default=None,
                        help="Absolute site URL, e.g. https://user.github.io/repo")
    parser.add_argument("--check", action="store_true",
                        help="Exit 1 if the committed catalog.json is out of date.")
    parser.add_argument("--quiet", action="store_true", help="Only print errors and the summary line.")
    args = parser.parse_args()

    base_url = args.base_url or derive_base_url()
    site_version = read_site_version()

    topics, errors = load_topics()
    errors.extend(validate_relationships(topics))

    if errors:
        print("FAIL: data validation found %d problem(s):\n" % len(errors), file=sys.stderr)
        for problem in errors:
            print("  - " + problem, file=sys.stderr)
        return 1

    catalog = build_catalog(topics, site_version)

    if args.check:
        if not CATALOG_PATH.exists():
            print("FAIL: data/catalog.json is missing. Run: python scripts/build_catalog.py", file=sys.stderr)
            return 1
        existing = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
        if existing.get("contentHash") != catalog["contentHash"]:
            print("FAIL: data/catalog.json is stale. Run: python scripts/build_catalog.py", file=sys.stderr)
            print(f"  committed: {existing.get('contentHash')}", file=sys.stderr)
            print(f"  expected:  {catalog['contentHash']}", file=sys.stderr)
            return 1
        print("OK: data/catalog.json is up to date.")
        return 0

    write_json(CATALOG_PATH, catalog)

    exercise_paths = collect_exercise_paths()
    sitemap, url_count = build_sitemap(catalog, base_url, exercise_paths)
    SITEMAP_PATH.write_text(sitemap, encoding="utf-8")
    ROBOTS_PATH.write_text(build_robots(base_url), encoding="utf-8")

    totals = catalog["totals"]
    if not args.quiet:
        print("CyberPulseAcademy catalog build")
        print("=" * 62)
        for dirname in TYPE_DIRS:
            print(f"  {dirname:<16} {totals.get(dirname, 0):>5}")
        print(f"  {'TOTAL TOPICS':<16} {totals['topics']:>5}")
        print("-" * 62)
        print(f"  exercises published {totals['exercisesPublished']:>4} of {totals['exercisesTotal']}")
        print(f"  exercises draft     {totals['exercisesDraft']:>4}")
        print(f"  exercises missing   {totals['exercisesMissing']:>4}  <- listed but no file yet")
        print(f"  certification chapters {totals['chaptersTotal']:>4}")
        print("-" * 62)
        print("  coverage: no exercises %d | none published %d | partial %d | complete %d" % (
            len(catalog["coverage"]["noExercises"]),
            len(catalog["coverage"]["noPublished"]),
            len(catalog["coverage"]["partial"]),
            len(catalog["coverage"]["complete"]),
        ))
        print(f"  topics with exercises  {totals['topicsWithExercises']} of {totals['topics']}")
        print(f"  themes            {len(catalog['themes'])}")
        print(f"  contentHash       {catalog['contentHash']}")
        print(f"  sitemap.xml       {url_count} URLs at {base_url}")
        print(f"  robots.txt        sitemap pointer written")
    else:
        print(f"OK: {totals['topics']} topics, hash {catalog['contentHash']}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
