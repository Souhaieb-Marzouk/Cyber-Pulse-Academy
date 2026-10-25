# Labs

Interactive lessons, one folder per topic, mirroring `exercises/`.

```
labs/<family>/<topic>/index.html   css/lab.css   js/lab.js   assets/   README.md
```

| Family | Folder | Shows on |
|---|---|---|
| certifications | `<Track>/Lesson<X.Y>/` | that certification topic |
| detections | `DET0088/` | detection `det0088` |
| groups | `G0007/` | group `g0007` |
| keywords | `ai-governance/` | keyword `ai-governance` |
| mitigations | `M1036/` | mitigation `m1036` |
| tactics | `TA0001/` | tactic `ta0001` |
| techniques | `T1059.001/` | technique `t1059-001` |

A lab is discovered by its path, so no registry is maintained by hand. Copy `_template/`, rename the
folder, and edit the `lab-data` JSON and the `<title>`.

Every lab posts `LAB_READY` on load and `LAB_SCORE` on check, the same way exercises report a score.
Labs are self-contained: their CSS and JS sit beside them, no build step, no dependency, and the
briefing stays readable with JavaScript off.

## Naming rule

A lab is named exactly like the exercise batches it sits beside, with the tier replaced by `LAB`:

| Exercises | Lab |
|---|---|
| `1.1 - Understanding Cybersecurity Leadership Concepts - MEDIUM` | `1.1 - Understanding Cybersecurity Leadership Concepts - LAB` |
| `T1595 - Active Scanning - EASY` | `T1595 - Active Scanning - LAB` |
| `DET0088 - … - HARD` | `DET0088 - … - LAB` |

One lab per section, grouped under the same chapters as the exercises. Discovery reads the folder
name up to the first " - ", so the naming is what attaches a lab to its topic — nothing else to edit.
