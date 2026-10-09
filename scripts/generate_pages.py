#!/usr/bin/env python3
"""Generate topics/<id>.html for every topic, and refresh derived markup.

Idempotent by construction: every generated file is written from scratch from
data/catalog.json, so re-running never duplicates content. It also

  * fills every <span data-cm-count="KEY"> with the real number from the manifest,
    so the no-JavaScript view still shows honest counts;
  * stamps ?v=<siteVersion> onto local CSS and JS references, because GitHub
    Pages cannot send Cache-Control headers and a stale bundle is the most
    common "why is it broken" report on a static site.

Standard library only. Python 3.8+.

Usage:
    python scripts/build_catalog.py
    python scripts/generate_pages.py
    python scripts/generate_pages.py --only t1059
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent
DATA_DIR = ROOT / "data"
CATALOG_PATH = DATA_DIR / "catalog.json"
CACHE_PATH = DATA_DIR / ".cache" / "topics.json"

# The pages are rendered from the source topic files, not from data/catalog.json.
# catalog.json is the lean index the browser downloads and no longer carries the
# article text, so reading it here would produce pages with empty sections.
sys.path.insert(0, str(SCRIPT_DIR))
from build_catalog import load_topics  # noqa: E402  (path set just above)
TOPICS_DIR = ROOT / "topics"
PAGES_DIR = ROOT / "pages"
CONFIG_JS = ROOT / "assets" / "js" / "config.js"

MITRE_BANNER = (    "ATT&CK\u00ae is a registered trademark of The MITRE Corporation. CyberPulseAcademy content is "
    "derived from publicly available ATT&CK data and is not official MITRE material. See "
    "MITRE's Terms of Use."
)

CERT_BANNER = (
    "Unofficial Study Resource. CyberPulseAcademy is not affiliated with, endorsed by, or sponsored by "
    "CompTIA, ISC2, ISACA, OffSec, EC-Council, GIAC, Microsoft, AWS, Google, Cisco, or any other "
    "vendor. Objectives summaries are paraphrased from publicly available exam objectives."
)

DETECTION_EXTRA = (
    "This section is community-authored detection guidance created for training. MITRE retired the "
    "standalone Detections objects in ATT&CK v13 and replaced them with Detection Strategies and "
    "Analytics, so nothing here should be read as official MITRE detection content."
)

CATALOG_PAGE = {
    "keyword": ("pages/keywords.html", "Keywords"),
    "certification": ("pages/certifications.html", "Certifications"),
    "tactic": ("pages/mitre-tactics.html", "MITRE ATT&CK Tactics"),
    "technique": ("pages/mitre-techniques.html", "MITRE ATT&CK Techniques"),
    "mitigation": ("pages/mitre-mitigations.html", "MITRE ATT&CK Mitigations"),
    "detection": ("pages/mitre-detections.html", "Detection Strategies"),
    "group": ("pages/mitre-groups.html", "MITRE ATT&CK Groups"),
}

TYPE_LABEL = {
    "keyword": "Keyword",
    "certification": "Certification",
    "tactic": "Tactic",
    "technique": "Technique",
    "mitigation": "Mitigation",
    "detection": "Detection Strategy",
    "group": "Threat Group",
}

DIFFICULTY_LABEL = {"hard": "Hard", "very-hard": "Very hard", "extreme": "Extreme"}


def esc(value) -> str:
    return html.escape(str(value if value is not None else ""), quote=True)


def read_site_version() -> str:
    try:
        text = CONFIG_JS.read_text(encoding="utf-8")
    except OSError:
        return "1.0.0"
    match = re.search(r"siteVersion\s*:\s*['\"]([^'\"]+)['\"]", text)
    return match.group(1) if match else "1.0.0"


def read_repo_url() -> str:
    try:
        text = CONFIG_JS.read_text(encoding="utf-8")
    except OSError:
        return "https://github.com/<user>/<repo>"
    match = re.search(r"repoUrl\s*:\s*['\"]([^'\"]+)['\"]", text)
    return match.group(1).rstrip("/") if match else "https://github.com/<user>/<repo>"


def base_url_from(config_repo: str) -> str:
    """Turn the GitHub repository URL into the GitHub Pages URL.

    GitHub serves an organisation or user site at the lowercased owner
    subdomain, while the repository path keeps its original capitalisation, so
    Souhaieb-Marzouk/Cyber-Pulse-Academy becomes
    https://souhaieb-marzouk.github.io/Cyber-Pulse-Academy. Getting this wrong
    produces canonical URLs that point at a hostname that does not resolve.
    """
    gh = re.match(r"https://github\.com/([^/]+)/([^/]+?)/?$", config_repo)
    if gh and not gh.group(1).startswith("<"):
        return f"https://{gh.group(1).lower()}.github.io/{gh.group(2)}"
    return "https://example.github.io/cyber-pulse-academy"


# --------------------------------------------------------------------------- #
# FAQ text. Generated in Python so the markup and the FAQPage JSON-LD are
# present in the static HTML, which crawlers and link unfurlers can read
# without executing JavaScript. seo.js only adds what Python cannot know at
# build time.
# --------------------------------------------------------------------------- #

def first_sentences(text: str, count: int = 2) -> str:
    clean = re.sub(r"\s+", " ", str(text or "")).strip()
    if not clean:
        return ""
    parts = re.findall(r"[^.!?]+[.!?]+", clean)
    if not parts:
        return clean
    return " ".join(part.strip() for part in parts[:count]).strip()


def build_faqs(topic: dict) -> list[dict]:
    kind = topic.get("type")
    is_mitre = kind in ("tactic", "technique", "mitigation", "detection", "group")
    is_cert = kind == "certification"
    difficulty = DIFFICULTY_LABEL.get(topic.get("difficulty", "extreme"), "Extreme").lower()
    title = topic.get("title", "")

    if is_cert:
        official = (
            f"No. CyberPulseAcademy is an independent, community-run study resource. It is not affiliated "
            f"with, endorsed by, or sponsored by {topic.get('theme', 'the vendor')} or any other "
            f"vendor, and no vendor logo appears anywhere on this site. Objective summaries are "
            f"paraphrased from publicly available exam objectives."
        )
    elif is_mitre:
        official = (
            "No. ATT&CK is a registered trademark of The MITRE Corporation. Content here is derived "
            "from the publicly available ATT&CK knowledge base and, for detection strategies, from "
            "community-authored guidance. It is not official MITRE material and MITRE has not "
            "reviewed or approved it."
        )
    else:
        official = (
            "No. CyberPulseAcademy is independent and community-run. It is a free study resource and is "
            "not affiliated with any vendor, certification body or training provider."
        )

    return [
        {
            "q": f"What is {title}?",
            "a": first_sentences(topic.get("summary"), 2),
        },
        {
            "q": f"Is {title} explained for beginners on this page?",
            "a": (
                "Yes. The page opens with a plain-language section written at B1 English level: a simple "
                "definition, why the topic matters, how it works in a few steps, a real-world example and "
                "the key takeaways. The detailed technical explanation comes after it, for readers who "
                "already work in security."
            ),
        },
        {
            "q": f"How hard are the {title} exercises on CyberPulseAcademy?",
            "a": (
                f"The exercises are graded {difficulty}. They are hands-on scenario work rather than "
                f"definitions: reading logs and alerts, choosing the right next step, configuring or "
                f"correcting something, and explaining your reasoning. Most exercises use a pass mark "
                f"of about 70 percent."
            ),
        },
        {
            "q": f"How many {title} exercises are there?",
            "a": (
                "The number grows over time, so the honest answer is on the page itself: each exercise is "
                "listed with its type and whether it is ready to open. The coverage dashboard shows the "
                "same information for every topic on the site."
            ),
        },
        {"q": f"Is CyberPulseAcademy official {'study material' if is_cert else 'training'}?", "a": official},
        {
            "q": "Does CyberPulseAcademy track me?",
            "a": (
                "No tracking cookies, no third-party scripts and no fingerprinting. The name and "
                "country you enter are stored only in your own browser, and the statistics page states "
                "plainly which mode the site is running in and what that means for your data."
            ),
        },
    ]


# --------------------------------------------------------------------------- #
# Relationships, resolved at build time so the links are in the static HTML.
# --------------------------------------------------------------------------- #

def relationships(topic: dict, index: dict) -> list[tuple[str, list[str]]]:
    kind = topic.get("type")
    tid = topic.get("id")
    out: list[tuple[str, list[str]]] = []

    def exists(ids):
        return [i for i in ids if i in index]

    if kind == "technique":
        if topic.get("parentTactic"):
            out.append(("Parent tactic", exists([topic["parentTactic"]])))
        subs = [t["id"] for t in index.values()
                if t.get("type") == "technique" and t.get("parentTechnique") == tid]
        out.append(("Sub-techniques", exists(sorted(subs))))
        out.append(("How to defend against this", exists(sorted(
            t["id"] for t in index.values()
            if t.get("type") == "mitigation" and tid in (t.get("mitigatesTechniques") or [])
        ))))
        out.append(("Detection strategies", exists(sorted(
            t["id"] for t in index.values()
            if t.get("type") == "detection"
            and (t.get("techniqueId") == tid or tid in (t.get("detectsTechniques") or []))
        ))))
        out.append(("Groups reported to use this", exists(sorted(
            t["id"] for t in index.values()
            if t.get("type") == "group" and tid in (t.get("linkedTechniques") or [])
        ))))

    elif kind == "tactic":
        out.append(("Techniques in this tactic", exists(sorted(
            t["id"] for t in index.values()
            if t.get("type") == "technique" and t.get("parentTactic") == tid
        ))))

    elif kind == "mitigation":
        out.append(("Techniques this mitigates", exists(topic.get("mitigatesTechniques") or [])))

    elif kind == "detection":
        refs = [topic.get("techniqueId")] + list(topic.get("detectsTechniques") or [])
        out.append(("Techniques observed", exists(sorted({r for r in refs if r}))))

    elif kind == "group":
        out.append(("Techniques linked to this group", exists(topic.get("linkedTechniques") or [])))

    out.append(("Related topics", exists(topic.get("relatedTopics") or [])))
    return [(heading, ids) for heading, ids in out if ids]


# --------------------------------------------------------------------------- #
# Rendering
# --------------------------------------------------------------------------- #

def head_block(topic: dict, canonical: str, og_image: str, site_version: str) -> str:
    title = f"{topic.get('externalId', '')} {topic.get('title', '')}".strip()
    meta_title = f"{title} \u2014 Practice Exam | CyberPulseAcademy"
    description = re.sub(r"\s+", " ", str(topic.get("summary", ""))).strip()
    if len(description) > 300:
        description = description[:297].rsplit(" ", 1)[0] + "..."
    return f"""<!DOCTYPE html>
<html lang="en" data-cm-build="{esc(site_version)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(meta_title)}</title>
<meta name="description" content="{esc(description)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{esc(canonical)}">
<meta name="theme-color" content="#070d16">
<meta name="color-scheme" content="dark light">

<meta property="og:site_name" content="CyberPulseAcademy">
<meta property="og:type" content="article">
<meta property="og:title" content="{esc(title)} practice exam">
<meta property="og:description" content="{esc(description[:200])}">
<meta property="og:url" content="{esc(canonical)}">
<meta property="og:image" content="{esc(og_image)}">
<meta property="og:image:alt" content="{esc(title)} study page on CyberPulseAcademy">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)} practice exam">
<meta name="twitter:description" content="{esc(description[:200])}">
<meta name="twitter:image" content="{esc(og_image)}">

<link rel="icon" href="../assets/img/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="../assets/img/logo.svg">
<link rel="manifest" href="../manifest.json">
<link rel="stylesheet" href="../assets/css/main.css?v={esc(site_version)}">
<link rel="stylesheet" href="../assets/css/components.css?v={esc(site_version)}">
<link rel="stylesheet" href="../assets/css/exam.css?v={esc(site_version)}">
<link rel="stylesheet" href="../assets/css/components-v2.css?v={esc(site_version)}">
<script>
/* Theme bootstrap. One inline line so the correct theme is applied before the
   first paint. Without it a dark-default site flashes white on every load,
   which is an accessibility problem for photosensitive users, not just an
   aesthetic one. This is the only duplicated line in the whole project and it
   exists because no external request can run early enough. */
(function(){{try{{var r=localStorage.getItem('cm.theme.v1');if(r){{var t=JSON.parse(r);if(t==='light'||t==='dark'){{document.documentElement.setAttribute('data-theme',t);}}}}}}catch(e){{}}}})();
</script>
</head>"""


def attribution_banner(topic: dict, repo_url: str) -> str:
    kind = topic.get("type")
    if kind == "certification":
        return f"""<aside class="cm-attrib" role="note" aria-label="Unofficial study resource notice">
  {icon('alert')}
  <p><strong>Unofficial Study Resource.</strong> {esc(CERT_BANNER)}</p>
</aside>"""
    if kind in ("tactic", "technique", "mitigation", "detection", "group"):
        extra = f"<p class=\"cm-mb0\">{esc(DETECTION_EXTRA)}</p>" if kind == "detection" else ""
        return f"""<aside class="cm-attrib" role="note" aria-label="MITRE attribution notice">
  {icon('alert')}
  <div>
    <p>{esc(MITRE_BANNER)} <a href="https://attack.mitre.org/resources/terms-of-use/" target="_blank" rel="noopener noreferrer">MITRE Terms of Use</a></p>
    {extra}
  </div>
</aside>"""
    return ""


def icon(name: str) -> str:
    paths = {
        "alert": "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
        "external": "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3",
        "check": "M20 6 9 17l-5-5",
        "bug": "M8 2v3M16 2v3M3 8h3M18 8h3M4 14h16M8 20a4 4 0 0 1-4-4v-2h16v2a4 4 0 0 1-4 4M12 22v-2",
        "info": "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01",
        "grid": "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
        "book": "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
        "layers": "M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
        "play": "M5 3l14 9-14 9V3z",
    }
    return (
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
        f'<path d="{paths.get(name, paths["info"])}"/></svg>'
    )


def render_topic(topic: dict, index: dict, catalog: dict, site_version: str, repo_url: str, base_url: str) -> str:
    tid = topic["id"]
    kind = topic.get("type", "keyword")
    catalog_path, catalog_label = CATALOG_PAGE[kind]
    canonical = f"{base_url}/topics/{tid}.html"
    # The preview is always the PNG. Facebook, LinkedIn and X render PNG but
    # ignore SVG, so the PNG is the correct tag, and generate_og.py --png is a
    # build step that produces it.
    #
    # This used to prefer the PNG only when it already existed and fall back to
    # the SVG otherwise. That read sensibly but made the output depend on build
    # ORDER: a page generated before its PNG was written recorded the SVG and
    # never changed again, so a later regeneration rewrote it and CI reported
    # drift. Naming one format unconditionally makes the same input always
    # produce the same page.
    #
    # If the PNG is ever missing, validate.py reports it: a warning when the SVG
    # is there as a fallback, a failure when neither exists.
    og_image = f"{base_url}/assets/img/og/{tid}.png"

    title_with_id = f"{topic.get('externalId', '')} {topic.get('title', '')}".strip()

    # ---- badges
    badges = []
    if topic.get("externalId"):
        badges.append(f'<span class="cm-badge cm-badge--id">{esc(topic["externalId"])}</span>')
    badges.append(f'<span class="cm-badge cm-badge--theme">{esc(topic.get("theme", ""))}</span>')
    difficulty = topic.get("difficulty", "extreme")
    badges.append(
        f'<span class="cm-badge cm-badge--{esc(difficulty)}">{icon("alert")}'
        f'{esc(DIFFICULTY_LABEL.get(difficulty, "Extreme"))}</span>'
    )
    badges.append(f'<span class="cm-badge">{esc(TYPE_LABEL[kind])}</span>')
    if kind == "certification":
        badges.append('<span class="cm-badge cm-badge--unofficial">Unofficial Study Resource</span>')

    # ---- objectives
    objectives = topic.get("objectives") or []
    objectives_html = ""
    if objectives:
        heading = "Exam domains and objectives" if kind == "certification" else "What you will practise"
        objectives_html = (
            f'<section class="cm-section" aria-labelledby="cm-objectives">'
            f'<h2 id="cm-objectives">{esc(heading)}</h2><ul>'
            + "".join(f"<li>{esc(o)}</li>" for o in objectives)
            + "</ul></section>"
        )

    # ---- beginner introduction -------------------------------------------
    # Rendered statically rather than by JavaScript, so it is the first thing a
    # visitor and a crawler both see, and so the page is useful with JavaScript
    # switched off. The five headings are the ones the owner asked for.
    beginner = topic.get("beginner") or {}
    beginner_html = ""
    if beginner:
        steps = beginner.get("howItWorks") or []
        takeaways = beginner.get("takeaways") or []
        steps_html = "".join(f"<li>{esc(step)}</li>" for step in steps)
        takeaways_html = "".join(f"<li>{esc(item)}</li>" for item in takeaways)
        beginner_html = f"""<section class="cm-start" aria-labelledby="cm-start-heading">
  <p class="cm-start__eyebrow">New to this? Start here</p>
  <h2 id="cm-start-heading" class="cm-start__title">Explained in plain language</h2>
  <p class="cm-start__note">Written for beginners. No security background needed.</p>

  <div class="cm-start__grid">
    <div class="cm-start__card">
      <h3>{icon("info")} Simple definition</h3>
      <p>{esc(beginner.get("definition", ""))}</p>
    </div>
    <div class="cm-start__card">
      <h3>{icon("alert")} Why should you care?</h3>
      <p>{esc(beginner.get("whyItMatters", ""))}</p>
    </div>
  </div>

  <div class="cm-start__card cm-start__card--wide">
    <h3>{icon("grid")} How it works, in plain steps</h3>
    <ol class="cm-start__steps">{steps_html}</ol>
  </div>

  <div class="cm-start__card cm-start__card--wide">
    <h3>{icon("book")} Real-world example</h3>
    <p>{esc(beginner.get("example", ""))}</p>
  </div>

  <div class="cm-start__card cm-start__card--wide cm-start__card--take">
    <h3>{icon("check")} Key takeaways</h3>
    <ul class="cm-start__takeaways">{takeaways_html}</ul>
  </div>
</section>"""

    # ---- exercises -------------------------------------------------------
    # A topic may hold any number of exercises. A certification groups them under
    # chapters; everything else uses one flat list. Both render as static HTML so
    # the list is crawlable and works without JavaScript, and assets/js/exam-hub.js
    # only has to attach behaviour to the buttons.
    flat_exercises = []
    for chapter in (topic.get("chapters") or []):
        for exercise in (chapter.get("exercises") or []):
            flat_exercises.append((exercise, chapter))
    for exercise in (topic.get("exercises") or []):
        flat_exercises.append((exercise, None))

    KIND_LABEL = {"lesson": "Lesson", "quiz": "Quiz", "lab": "Lab", "exam": "Exam", "scenario": "Scenario"}
    # The four reserved exercise tiers. Named TIER_*, not DIFFICULTY_*, because
    # DIFFICULTY_LABEL already means the whole topic's difficulty (hard,
    # very-hard, extreme) and shadowing it here would break the page header.
    # The tier is always written as visible text, never as colour alone, so it
    # survives a monochrome screen or a screen reader; the class only adds the
    # colour hint on top of the words.
    TIER_LABEL = {
        "easy": "Easy",
        "medium": "Medium",
        "hard": "Hard",
        "extremely-hard": "Extremely hard",
    }
    TIER_CLASS = {
        "easy": "cm-badge--diff-easy",
        "medium": "cm-badge--diff-medium",
        "hard": "cm-badge--diff-hard",
        "extremely-hard": "cm-badge--diff-extreme",
    }

    def exercise_card(exercise, index, chapter_title=None):
        status = exercise.get("status") or "published"
        kind = exercise.get("kind") or "exam"
        tier = exercise.get("difficulty")
        badge_class = {"published": "cm-badge--ok", "draft": "cm-badge--warn"}.get(status, "cm-badge--bad")
        symbol = {"published": "\u2713", "draft": "\u25CB"}.get(status, "\u2014")
        label = {"published": "Ready", "draft": "Draft"}.get(status, "Not published yet")
        summary = exercise.get("summary") or ""
        minutes = exercise.get("minutes")
        difficulty_badge = ""
        if tier in TIER_LABEL:
            difficulty_badge = (
                f'<span class="cm-badge {TIER_CLASS[tier]}">'
                f'{esc(TIER_LABEL[tier])}</span>'
            )
        if status == "missing":
            action = ('<span class="cm-exercise__soon">Coming soon</span>')
        else:
            action = (f'<button type="button" class="cm-btn cm-btn--primary cm-btn--sm" '
                      f'data-cm-exercise="{index}" data-cm-path="{esc(exercise.get("path", ""))}">'
                      f'Start exercise</button>')
        return f"""<article class="cm-exercise" data-cm-status="{esc(status)}"{f' data-cm-difficulty="{esc(tier)}"' if tier else ''}>
  <div class="cm-exercise__body">
    <div class="cm-row cm-mb1">
      {difficulty_badge}
      <span class="cm-badge">{esc(KIND_LABEL.get(kind, "Exercise"))}</span>
      <span class="cm-badge {badge_class}">{symbol} {esc(label)}</span>
      {f'<span class="cm-badge cm-badge--theme">{esc(chapter_title)}</span>' if chapter_title else ''}
      {f'<span class="cm-badge">{minutes} min</span>' if minutes else ''}
    </div>
    <h3 class="cm-exercise__title">{esc(exercise.get("title", "Exercise"))}</h3>
    {f'<p class="cm-exercise__summary">{esc(summary)}</p>' if summary else ''}
    <p class="cm-exercise__best" data-cm-best="{esc(exercise.get("path", ""))}" hidden></p>
  </div>
  <div class="cm-exercise__action">{action}</div>
</article>"""

    exercises_html = ""
    exercise_no = 0
    if flat_exercises:
        if topic.get("type") == "certification" and (topic.get("chapters") or []):
            chapter_blocks = []
            for chapter in (topic.get("chapters") or []):
                items = chapter.get("exercises") or []
                cards = ""
                for exercise in items:
                    exercise_no += 1
                    cards += exercise_card(exercise, exercise_no)
                weight = f'<span class="cm-badge cm-badge--theme">{esc(chapter.get("weight"))}</span>' if chapter.get("weight") else ""
                objectives = "".join(f"<li>{esc(o)}</li>" for o in (chapter.get("objectives") or []))
                if cards:
                    body = f'<div class="cm-exercises">{cards}</div>'
                else:
                    body = ('<p class="cm-small cm-dim">No exercises published for this chapter yet.</p>')
                chapter_blocks.append(f"""<details class="cm-chapter"{" open" if chapter.get("number") == 1 else ""}>
  <summary>
    <span class="cm-chapter__num">Chapter {int(chapter.get("number", 0))}</span>
    <span class="cm-chapter__name">{esc(chapter.get("title", ""))}</span>
    {weight}
    <span class="cm-chapter__count">{len(items)} exercise{"s" if len(items) != 1 else ""}</span>
  </summary>
  <div class="cm-chapter__body">
    <h4>What this chapter covers</h4>
    <ul>{objectives}</ul>
    {body}
  </div>
</details>""")
            exercises_html = (
                '<section class="cm-section" aria-labelledby="cm-chapters-heading">'
                '<h2 id="cm-chapters-heading">Chapters and exercises</h2>'
                '<p class="cm-muted">This certification is organised by chapter, following the official '
                'exam domains. Open a chapter to see its exercises.</p>'
                + "".join(chapter_blocks) + "</section>"
            )
            # Flat exercises that belong to no chapter still get shown.
            flat_only = topic.get("exercises") or []
            if flat_only:
                cards = ""
                for exercise in flat_only:
                    exercise_no += 1
                    cards += exercise_card(exercise, exercise_no)
                exercises_html += (
                    '<section class="cm-section" aria-labelledby="cm-extra-heading">'
                    '<h2 id="cm-extra-heading">Additional exercises</h2>'
                    f'<div class="cm-exercises">{cards}</div></section>'
                )
        else:
            cards = ""
            for exercise, _chapter in flat_exercises:
                exercise_no += 1
                cards += exercise_card(exercise, exercise_no)
            exercises_html = (
                '<section class="cm-section" aria-labelledby="cm-exercises-heading">'
                '<h2 id="cm-exercises-heading">Exercises</h2>'
                f'<div class="cm-exercises">{cards}</div></section>'
            )

    # The no-JavaScript story: list every exercise with its path, honestly.
    noscript_rows = "".join(
        f'<li>{esc(e.get("title", ""))} '
        f'<span class="cm-badge { {"published":"cm-badge--ok","draft":"cm-badge--warn"}.get(e.get("status") or "published","cm-badge--bad") }">'
        f'{esc(e.get("status") or "published")}</span> '
        f'<code>{esc(e.get("path", ""))}</code></li>'
        for e, _c in flat_exercises
    ) or '<li>No exercises have been published for this topic yet.</li>'
    exercises_noscript = (
        '<noscript><div class="cm-banner cm-banner--info">' + icon("info") +
        '<div><span class="cm-banner__title">Exercises on this page</span>'
        '<p class="cm-small">Starting an exercise needs JavaScript. The exercise files themselves are '
        'plain HTML and can be opened directly:</p><ul>' + noscript_rows + '</ul></div></div></noscript>'
    )

    # ---- tags
    tags = topic.get("tags") or []
    tags_html = ""
    if tags:
        tags_html = (
            '<section class="cm-section" aria-labelledby="cm-tags"><h2 id="cm-tags">Tags</h2>'
            '<ul class="cm-chips">'
            + "".join(
                f'<li><a href="../pages/search.html?q={esc(tag)}">{esc(tag)}</a></li>' for tag in tags
            )
            + "</ul></section>"
        )

    # ---- relationships
    rels = relationships(topic, index)
    rels_html = ""
    if rels:
        blocks = []
        for heading, ids in rels:
            links = " ".join(
                f'<li><a href="{esc(i)}.html">{esc((index[i].get("externalId") or "") + " " + index[i].get("shortTitle", index[i].get("title", "")))}</a></li>'
                for i in ids
            )
            blocks.append(
                f'<div class="cm-mb2"><h3>{esc(heading)}</h3><ul class="cm-chips">{links}</ul></div>'
            )
        rels_html = (
            '<section class="cm-section" aria-labelledby="cm-related"><h2 id="cm-related">'
            "Cross-references</h2>" + "".join(blocks) + "</section>"
        )

    # ---- sources
    sources = topic.get("sources") or []
    sources_html = ""
    if sources:
        items = "".join(
            f'<li><a href="{esc(s.get("url", ""))}" target="_blank" rel="noopener noreferrer">'
            f'{esc(s.get("label", ""))} {icon("external")}</a>'
            f'<span class="cm-vh"> (opens in a new tab)</span></li>'
            for s in sources
        )
        sources_html = (
            '<section class="cm-section" aria-labelledby="cm-sources"><h2 id="cm-sources">Sources</h2>'
            f'<ul class="cm-sources">{items}</ul>'
            '<p class="cm-small cm-dim">External links open in a new tab. CyberPulseAcademy is not '
            'responsible for the content of third-party sites.</p></section>'
        )

    # ---- FAQ (static, so it is crawlable and readable without JavaScript)
    faqs = build_faqs(topic)
    faq_html = "".join(
        f'<details class="cm-details"{" open" if i == 0 else ""}><summary>{esc(f["q"])}</summary>'
        f'<div class="cm-details__body"><p>{esc(f["a"])}</p></div></details>'
        for i, f in enumerate(faqs)
    )

    # ---- static JSON-LD. seo.js adds the Course node for certifications and
    # repairs absolute URLs at runtime; this block is what a crawler that does
    # not execute JavaScript still sees.
    graph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "@id": canonical + "#breadcrumb",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": base_url + "/index.html"},
                    {"@type": "ListItem", "position": 2, "name": catalog_label,
                     "item": f"{base_url}/{catalog_path}"},
                    {"@type": "ListItem", "position": 3, "name": topic.get("title", ""), "item": canonical},
                ],
            },
            {
                "@type": "Quiz",
                "@id": canonical + "#quiz",
                "name": f"{topic.get('title', '')} practice exam",
                "description": first_sentences(topic.get("summary"), 2),
                "url": canonical,
                "inLanguage": "en",
                "educationalLevel": "Intermediate" if difficulty == "hard" else "Expert",
                "typicalAgeRange": "16-",
                "learningResourceType": "Practice exam",
                "numberOfQuestions": 3,
                "isAccessibleForFree": True,
                "assesses": objectives[:6] or [f"{topic.get('title', '')} concepts and their real-world application"],
                "about": [{"@type": "Thing", "name": t} for t in tags[:8]],
                "provider": {"@type": "Organization", "name": "CyberPulseAcademy", "url": base_url},
                "isPartOf": {"@type": "WebSite", "name": "CyberPulseAcademy", "url": base_url},
            },
            {
                "@type": "FAQPage",
                "@id": canonical + "#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": f["q"],
                        "acceptedAnswer": {"@type": "Answer", "text": f["a"]},
                    }
                    for f in faqs
                ],
            },
        ],
    }

    accuracy_link = (
        f"{repo_url}/issues/new"
        f"?title=Content%20problem%3A%20{esc(topic.get('title', ''))}"
        f"&labels=content"
        f"&body=Page%3A%20{esc('topics/' + tid + '.html')}"
    )

    share_fallback = (
        f"I am studying {topic.get('title', '')} on CyberPulseAcademy, "
        f"{DIFFICULTY_LABEL.get(difficulty, 'Extreme').lower()} level."
    )

    return f"""{head_block(topic, canonical, og_image, site_version)}
<body data-cm-topic="{esc(tid)}">
<a class="cm-skip" href="#cm-main">Skip to main content</a>
<div class="cm-shell">
<header id="cm-header"></header>
<main class="cm-main" id="cm-main" tabindex="-1">
  <div class="cm-wrap">

    <nav class="cm-crumbs" aria-label="Breadcrumb">
      <ol>
        <li><a href="../index.html">Home</a></li>
        <li><a href="../{esc(catalog_path)}">{esc(catalog_label)}</a></li>
        <li aria-current="page">{esc(topic.get("shortTitle", topic.get("title", "")))}</li>
      </ol>
    </nav>

    <div id="cm-notices"></div>

    <div class="cm-pagehead">
      <h1>{esc(title_with_id)}</h1>
      <div class="cm-row cm-mb2">{''.join(badges)}</div>
    </div>

    {beginner_html}

    <section class="cm-section" aria-labelledby="cm-overview-heading">
      <h2 id="cm-overview-heading">In more detail</h2>
      <p>{esc(topic.get("summary", ""))}</p>
      {attribution_banner(topic, repo_url)}
    </section>

    {objectives_html}

    {exercises_html}

    <div class="cm-hub" id="cm-hub"></div>
    {exercises_noscript}
    <div class="cm-celebrate" id="cm-celebrate" hidden></div>
    <div id="cm-attempts" class="cm-mt3"></div>

    <section class="cm-section" id="cm-share-section" aria-labelledby="cm-share-heading">
      <h2 id="cm-share-heading">Share this topic</h2>
      <div id="cm-share" class="cm-card">
        <p class="cm-share__preview">{esc(share_fallback)}</p>
      </div>
    </section>

    {tags_html}
    {rels_html}
    {sources_html}

    <section class="cm-section" aria-labelledby="cm-faq-heading">
      <h2 id="cm-faq-heading">Frequently asked questions</h2>
      <div id="cm-faq">{faq_html}</div>
    </section>

    <section class="cm-section" aria-labelledby="cm-report">
      <h2 id="cm-report">Something wrong with this page?</h2>
      <p class="cm-muted">Found a mistake, a broken link, or an exercise that will not open? Use the
      button below and describe it. Please include a link that supports your correction.</p>
      <div class="cm-row">
        <a class="cm-btn cm-btn--ghost" href="{accuracy_link}" target="_blank" rel="noopener noreferrer">
          {icon("bug")} Report a problem with this content
        </a>
      </div>
    </section>

    <aside class="cm-donate-card cm-mt3" aria-labelledby="cm-donate-mini">
      <h2 id="cm-donate-mini" class="cm-h3">Support more free content</h2>
      <p class="cm-small cm-muted">CyberPulseAcademy is free, has no adverts and runs no third-party
      tracking. Voluntary support funds new exercise batches. It is never required and never gates
      content.</p>
      <a class="cm-btn cm-btn--primary cm-btn--sm" href="../pages/support.html">Support this project</a>
    </aside>

  </div>
</main>
<footer id="cm-footer"></footer>
</div>
<div id="cm-toasts" class="cm-toasts" aria-live="polite" aria-atomic="false"></div>

<script type="application/ld+json" id="cm-jsonld-{esc(tid)}">{json.dumps(graph, ensure_ascii=False)}</script>

<script src="../assets/js/config.js?v={esc(site_version)}"></script>
<script src="../assets/js/i18n.js?v={esc(site_version)}"></script>
<script src="../assets/js/store.js?v={esc(site_version)}"></script>
<script src="../assets/js/a11y.js?v={esc(site_version)}"></script>
<script src="../assets/js/nav.js?v={esc(site_version)}"></script>
<script src="../assets/js/identity.js?v={esc(site_version)}"></script>
<script src="../assets/js/stats.js?v={esc(site_version)}"></script>
<script src="../assets/js/catalog-render.js?v={esc(site_version)}"></script>
<script src="../assets/js/exam-hub.js?v={esc(site_version)}"></script>
<script src="../assets/js/share.js?v={esc(site_version)}"></script>
<script src="../assets/js/seo.js?v={esc(site_version)}"></script>
<script src="../assets/js/sw-register.js?v={esc(site_version)}"></script>
<script>
/* Wire the share text to the best recorded score for this topic. Batches may
   be missing, in which case the neutral phrasing is used automatically. */
(function () {{
  if (window.CM && CM.share) {{ CM.share.init({json.dumps(tid)}); }}
}})();
</script>
</body>
</html>
"""


# --------------------------------------------------------------------------- #
# Derived markup refresh across hand-written pages
# --------------------------------------------------------------------------- #

# Keys are case-sensitive and include camelCase ones such as batchesPublished,
# so the character class must not be lowercase-only.
COUNT_RE = re.compile(r'(<span[^>]*\bdata-cm-count="([A-Za-z]+)"[^>]*>)(.*?)(</span>)', re.S)
ASSET_RE = re.compile(r'((?:src|href)=")([^":#?][^":]*?\.(?:css|js))(\?v=[^"]*)?(")')
BASE_URL_TOKEN = "__CM_BASE_URL__"
REPO_URL_TOKEN = "__CM_REPO_URL__"

# Recognise an already-stamped absolute URL so the stamping pass can be re-run.
# Without this, the first run consumes the tokens and a later change to repoUrl
# silently leaves nineteen hand-written pages pointing at the old host, which is
# the single easiest way to ship a site with wrong canonical URLs.
STAMPED_REPO_URL = re.compile(
    r'https://github\.com/(?:&lt;user&gt;/&lt;repo&gt;|<user>/<repo>|[A-Za-z0-9._-]+/[A-Za-z0-9._-]+)'
)

# A repository URL is substituted inside attribute values only. Substituting it in
# text content too would put a literal <user>/<repo> into the markup, where a
# browser reads <repo> as an unknown tag and silently hides it. Text occurrences
# are therefore escaped instead, which is both correct HTML and stable across
# repeated runs.
HREF_ATTR_RE = re.compile(r'(href=")([^"]*)(")')
CONTENT_ATTR_RE = re.compile(r'(content=")([^"]*)(")')
ANGLE_PLACEHOLDER_RE = re.compile(r'<user>/<repo>')

# GUIDE.html is documentation: it legitimately prints example deployment URLs
# inside code samples, and rewriting them would corrupt the instructions.
STAMP_EXEMPT = {"GUIDE.html"}

CANONICAL_RE = re.compile(r'(<link\s+rel="canonical"\s+href=")([^"]*)(")')
OG_URL_RE = re.compile(r'(<meta\s+property="og:url"\s+content=")([^"]*)(")')
OG_IMAGE_RE = re.compile(r'(<meta\s+property="og:image"\s+content=")([^"]*)(")')
TW_IMAGE_RE = re.compile(r'(<meta\s+name="twitter:image"\s+content=")([^"]*)(")')


def normalise_absolute_urls(base_url: str, repo_url: str, verbose: bool = False) -> int:
    """Make every absolute URL in the hand-written pages correct, deterministically.

    Earlier this pass tried to detect what a previous run had stamped and undo it,
    which is fragile: it has to guess, and guessing wrong silently truncates a URL.
    This version does not guess at all. A page's canonical URL is a pure function
    of where the page sits in the repository:

        canonical = base_url + "/" + <the page's own repo-relative path>

    So the correct value is computed from the file's position and written over
    whatever is there. That makes the pass correct on a first run, correct on a
    re-run, correct after repoUrl changes, and correct even if a previous run
    damaged the file. Nothing depends on history.

    404.html is deliberately left alone: it has no canonical and no og:url,
    because a 404 claiming to be a real page is worse than a 404 with no metadata.
    """
    current_pages = base_url.rstrip("/")
    current_repo = repo_url.rstrip("/")
    default_preview = f"{current_pages}/assets/img/og-default.png"

    changed = 0
    candidates = [p for p in (list(ROOT.glob("*.html")) + list(PAGES_DIR.glob("*.html")))
                  if p.relative_to(ROOT).as_posix() not in STAMP_EXEMPT]

    for path in candidates:
        text = path.read_text(encoding="utf-8")
        original = text
        rel = path.relative_to(ROOT).as_posix()
        canonical = f"{current_pages}/{rel}"

        # Tokens, for any page that still carries them.
        text = text.replace(BASE_URL_TOKEN, current_pages)
        text = text.replace(REPO_URL_TOKEN, current_repo)

        # Force the absolute metadata to the value implied by this file's path.
        text = CANONICAL_RE.sub(lambda m: m.group(1) + canonical + m.group(3), text)
        text = OG_URL_RE.sub(lambda m: m.group(1) + canonical + m.group(3), text)
        # Hand-written pages all share the default preview card. Topic pages are
        # generated separately and get a per-topic card of their own.
        text = OG_IMAGE_RE.sub(lambda m: m.group(1) + default_preview + m.group(3), text)
        text = TW_IMAGE_RE.sub(lambda m: m.group(1) + default_preview + m.group(3), text)

        # Point every GitHub repository reference at this project's own repo.
        # Attributes get the raw URL; text content gets the escaped form.
        def in_attribute(match):
            return match.group(1) + STAMPED_REPO_URL.sub(lambda _m: current_repo, match.group(2)) + match.group(3)

        text = HREF_ATTR_RE.sub(in_attribute, text)
        text = CONTENT_ATTR_RE.sub(in_attribute, text)
        text = ANGLE_PLACEHOLDER_RE.sub('&lt;user&gt;/&lt;repo&gt;', text)

        if text != original:
            path.write_text(text, encoding="utf-8")
            changed += 1
            if verbose:
                print(f"  normalised {rel}")
    return changed


def inject_counts(catalog: dict) -> int:
    totals = catalog.get("totals", {})
    changed = 0
    for path in list(PAGES_DIR.glob("*.html")) + [ROOT / "index.html", ROOT / "404.html"]:
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")

        def replace_count(match):
            key = match.group(2)
            value = totals.get(key, 0)
            return f"{match.group(1)}{value}{match.group(4)}"

        updated = COUNT_RE.sub(replace_count, text)
        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed += 1
    return changed


def stamp_versions(site_version: str) -> int:
    """Append ?v=<siteVersion> to every local CSS/JS reference. Idempotent."""
    changed = 0
    candidates = list(ROOT.glob("*.html")) + list(PAGES_DIR.glob("*.html")) + list(TOPICS_DIR.glob("*.html"))
    for path in candidates:
        text = path.read_text(encoding="utf-8")

        def replace_asset(match):
            prefix, target, _existing, suffix = match.groups()
            if target.startswith(("http://", "https://", "//", "data:")):
                return match.group(0)
            return f"{prefix}{target}?v={site_version}{suffix}"

        updated = ASSET_RE.sub(replace_asset, text)
        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed += 1
    return changed


# --------------------------------------------------------------------------- #

def main():
    parser = argparse.ArgumentParser(description="Generate topics/*.html from catalog.json.")
    parser.add_argument("--only", default=None, help="Generate a single topic id.")
    parser.add_argument("--no-stamp", action="store_true", help="Skip the ?v= cache-bust pass.")
    parser.add_argument("--verbose", action="store_true", help="List every page whose absolute URLs were rewritten.")
    args = parser.parse_args()

    if not CATALOG_PATH.exists():
        print("FAIL: data/catalog.json is missing. Run: python scripts/build_catalog.py", file=sys.stderr)
        return 1

    # Full topic objects, straight from data/<type>/<id>.json. load_topics returns
    # (topics, errors); build_catalog.py has already failed the run if any error
    # was found, so the list is safe to render here.
    topics, load_errors = load_topics()
    if load_errors:
        print(f"FAIL: {len(load_errors)} data problem(s). Run python scripts/build_catalog.py",
              file=sys.stderr)
        return 1
    # The published index, used only for the totals that get injected into the
    # hand-written pages. Its per-topic entries are the lean projection.
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    index = {t["id"]: t for t in topics}
    site_version = read_site_version()
    repo_url = read_repo_url()
    base_url = base_url_from(repo_url)

    TOPICS_DIR.mkdir(parents=True, exist_ok=True)

    targets = [index[args.only]] if args.only and args.only in index else topics
    if args.only and args.only not in index:
        print(f"FAIL: no topic with id '{args.only}'", file=sys.stderr)
        return 1

    written = 0
    for topic in targets:
        html_text = render_topic(topic, index, catalog, site_version, repo_url, base_url)
        (TOPICS_DIR / f"{topic['id']}.html").write_text(html_text, encoding="utf-8")
        written += 1

    counts_changed = inject_counts(catalog)
    urls_stamped = normalise_absolute_urls(base_url, repo_url, verbose=args.verbose)
    stamped = 0 if args.no_stamp else stamp_versions(site_version)

    print(f"Generated {written} topic page(s) in topics/")
    print(f"Refreshed counts in {counts_changed} page(s)")
    print(f"Normalised absolute URLs in {urls_stamped} page(s)")
    print(f"  base URL  {base_url}")
    print(f"  repo URL  {repo_url}")
    print(f"Stamped ?v={site_version} in {stamped} file(s)")
    largest = max(
        ((p.stat().st_size, p) for p in TOPICS_DIR.glob("*.html")),
        default=(0, None),
    )
    if largest[1] is not None:
        print(f"Largest topic page: {largest[1].name} at {largest[0] / 1024:.1f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
