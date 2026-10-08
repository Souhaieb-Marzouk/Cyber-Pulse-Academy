# Exercises for Alert Triage

Put the exercise HTML files for the `alert-triage` keyword topic in this folder.
There is no fixed number and no required file name: the site only needs the path
you give it to be inside `exercises/` and to end in `.html`.

## Linking an exercise to this topic

**One command (recommended).** It checks the file exists, refuses duplicates,
writes the entry for you, and rebuilds the site:

```
python scripts/new_exercise.py --topic alert-triage --title "Your exercise title" ^
    --path "exercises/alert-triage/your-file.html" --kind lesson --minutes 30
```

On macOS or Linux, replace the `^` at the end of the first line with `\`.

**By hand.** Open `data/keywords/alert-triage.json` and add an object to the
`exercises` list:

```json
{
  "title": "Your exercise title",
  "path": "exercises/alert-triage/your-file.html",
  "kind": "lesson",
  "status": "published",
  "summary": "One sentence describing what the learner will do.",
  "minutes": 30
}
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
try {
  var percent = Math.round(correct / total * 100);
  parent.postMessage({
    type: "CYBERPULSE_SCORE",
    topicId: "alert-triage",
    batch: 1,
    score: correct,
    total: total,
    percent: percent,
    passed: percent >= 70
  }, location.origin);
} catch (e) { /* opened outside the site, nothing to report to */ }
```

The `try`/`catch` matters: it lets the same file work when you open it directly.

The exercise may also receive a handshake from the site, and should ignore it if
it does not need it:

```js
window.addEventListener("message", function (ev) {
  if (ev.data && ev.data.type === "CYBERPULSE_INIT") {
    // ev.data.username, ev.data.country, ev.data.theme, ev.data.language
  }
});
```

## Content safety, non-negotiable

No working exploit code. No real credentials. No live malware samples or their
hashes. Nothing that crosses into "how to attack a real target". Everything is
framed as defensive or lab-only, and every indicator is defanged:
`hxxp://evil[.]example`, `10[.]0[.]0[.]1`. `scripts/validate.py` enforces the
defanging rule automatically.
