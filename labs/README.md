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
