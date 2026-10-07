<!--
  CyberPulseAcademy pull request template.

  Everything here maps to a check that either CI or a reviewer will run. If you
  are unsure about an item, please ask in the pull request rather than deleting
  the line: an honest "I am not sure about this one" is much easier to review
  than a checked box that turns out to be wrong.
-->

## Summary

<!-- What does this change, and why? Two or three sentences. If it fixes
     something, describe the problem as a reader would experience it. -->

## Type of change

<!-- Put an x in every box that applies. -->

- [ ] New topic (a `data/<type>/<id>.json` file)
- [ ] New exercise batch
- [ ] Content correction, with a citation
- [ ] Accessibility fix
- [ ] Bug fix
- [ ] Documentation
- [ ] Build or CI

## Related issue

<!-- Which issue does this close? Write "Closes #123" so GitHub links and closes
     it automatically. Write "None" if there is no issue. -->

Closes #

## Checklist

<!-- Every line below is a gate. Tick only what is genuinely true. -->

- [ ] The topic JSON validates against `data/schema/topic.schema.json`.
- [ ] The topic reserves exactly three batches, on the canonical paths `exercises/<id>/batch-1.html`, `batch-2.html` and `batch-3.html`, in that order, with the correct `batch` number on each.
- [ ] Every file I added or changed is under 250 KB. No shipped file exceeds the budget.
- [ ] No external CDN, no web font and no third-party script was added. The site loads only its own assets.
- [ ] Every indicator of compromise is defanged. IP addresses use `10[.]0[.]0[.]1` style notation or the documentation ranges, and URLs use `hxxp://example[.]com`.
- [ ] `attributionNote` is present where the schema and the validation gate require it: certifications, tactics, techniques, mitigations, detections and groups.
- [ ] Sources are cited for every claim that needs one, and each source is an authoritative one with an `https://` URL.
- [ ] No vendor logo was added, and nothing implies endorsement by a vendor, a certification body or The MITRE Corporation.
- [ ] I tested the change on a narrow viewport or on an actual phone, not only on a desktop window.
- [ ] I tested with the keyboard alone: tab order is sensible, focus is visible, and nothing is unreachable without a mouse.
- [ ] There are no console errors on the pages I changed.
- [ ] I ran `python scripts/validate.py` locally and it passed.
- [ ] I updated `CHANGELOG.md`.

## Content safety confirmation

<!-- These are separate from the checklist above on purpose. They are the rules
     that would get the project taken down or, worse, get a reader hurt. -->

- [ ] This change contains no working exploit code.
- [ ] This change contains no real credentials, keys or tokens.
- [ ] This change contains no live malware samples and no hashes of live samples.
- [ ] Nothing in this change crosses into how to attack a real target. Everything is framed as defensive work, or as a lab-only exercise against infrastructure the reader controls.
- [ ] Everything I have written is my own work, or is quoted briefly and attributed to a public source.

## A note on CI

CI runs four things that cause most failures: schema validation, the 250 KB size
budget, the external-URL allow-list, and the defanging check. If your run is
failing and the message is not obvious, it is almost always one of those four,
and all four can be reproduced locally with `python scripts/validate.py`.
