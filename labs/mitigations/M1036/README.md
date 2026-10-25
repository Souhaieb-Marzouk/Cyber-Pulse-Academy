# M1036: accounting for a mitigation that only partly works

A {family} lab for `{topicId}`.

| | |
|---|---|
| Kind | mitigations |
| Topic | `{topicId}` |
| Time | about 12 minutes |
| Pass mark | 70% |

## Files

```
index.html      the lab, readable without JavaScript
css/lab.css     its styles
js/lab.js       the questions, scoring, and the LAB_SCORE report
assets/         images or fixtures, if the lab needs them
README.md       this file
```

## Contract

On load the lab posts `LAB_READY`; on check it posts:

```js
{ type: "LAB_SCORE", labId, topicId, detail: { percent, passed, correct, total } }
```

The site uses the same message path as exercises, so a lab result can be counted the same way.

## Adding another lab

Copy `labs/_template/`, rename the folder, and edit two things: the `lab-data` JSON in `index.html`
and the `<title>`. The folder name determines which topic shows it:

| Path | Appears on |
|---|---|
| `labs/techniques/T1059.001/` | technique `t1059-001` |
| `labs/detections/DET0088/` | detection `det0088` |
| `labs/groups/G0007/` | group `g0007` |
| `labs/keywords/ai-governance/` | keyword `ai-governance` |
| `labs/mitigations/M1036/` | mitigation `m1036` |
| `labs/tactics/TA0001/` | tactic `ta0001` |
| `labs/certifications/CySA-plus-CS0-003/Lesson1.1/` | that certification |
