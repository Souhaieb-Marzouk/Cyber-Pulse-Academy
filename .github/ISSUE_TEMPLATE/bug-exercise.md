---
name: Broken exercise batch
description: An exercise batch will not load, scores wrongly, or misbehaves in your browser.
title: "Broken batch: "
labels: bug

---

body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to report this. A batch that silently fails costs
        other people hours of study time, so a precise report is genuinely valuable.

        **Where this form comes from.** The "Report it" button on a failed batch card
        on a topic page links straight here, and it often fills in the title and the
        topic id for you. If the title above already reads something like
        `Broken batch: t1059 batch 2`, you only need to fill in the rest. If you
        arrived here from the Issues tab instead, please fill in every required field.

        **Before you submit**, reload the page once, and if you have a content blocker
        or an extension that blocks scripts, try with it disabled. A batch is a
        self-contained HTML file, so an extension that rewrites or blocks iframes can
        stop it loading even though the file itself is fine. If it still fails, we
        definitely want to hear about it.

  - type: input
    id: topic-id
    attributes:
      label: Topic id
      description: The id in the URL, for example `topics/t1059.html` means the topic id is `t1059`.
      placeholder: t1059
    validations:
      required: true

  - type: dropdown
    id: batch
    attributes:
      label: Which batch
      description: Batch 1 is detection and triage, batch 2 is hands-on response, batch 3 is adversarial.
      options:
        - "1"
        - "2"
        - "3"
    validations:
      required: true

  - type: textarea
    id: what-happened
    attributes:
      label: What happened
      description: Describe what you saw and what you expected instead. Include the score or error text verbatim if there was one.
      placeholder: The batch loaded but the score screen said 0% even though I answered every question correctly.
    validations:
      required: true

  - type: dropdown
    id: browser
    attributes:
      label: Browser
      description: The browser you were using when it failed. If you can reproduce it in two browsers, please send one report and mention both.
      options:
        - Chrome
        - Firefox
        - Safari
        - Edge
        - iOS Safari
        - Android Chrome
        - Other
    validations:
      required: true

  - type: input
    id: device
    attributes:
      label: Device and operating system
      description: Optional, but it helps a lot. Include the version where you know it.
      placeholder: Windows 11 24H2 desktop, or iPhone 14 on iOS 18.2
    validations:
      required: false

  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
      description: Number them. If it happens every time, say so; if it is intermittent, say roughly how often.
      placeholder: |
        1. Open topics/t1059.html
        2. Click batch 2
        3. Answer question 5 and press Next
        4. The page goes blank
    validations:
      required: false

  - type: textarea
    id: console
    attributes:
      label: Console error text
      description: Optional. Open the browser developer tools, reload, and paste any red errors here. Exact text is far more useful than a summary.
      render: text
    validations:
      required: false

  - type: checkboxes
    id: local-file-unmodified
    attributes:
      label: Local file check
      options:
        - label: I have not edited the exercise file locally. I am reporting the version deployed on the site.
          required: true
