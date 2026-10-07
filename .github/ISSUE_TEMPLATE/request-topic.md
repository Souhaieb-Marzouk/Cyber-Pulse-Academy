---
name: Topic request
description: Propose a keyword, certification, tactic, technique, mitigation, detection or group that is missing from the catalog.
title: "Topic request: "
labels: enhancement

---

body:
  - type: markdown
    attributes:
      value: |
        CyberMastery ships a fixed seed catalog and grows by request. This form is
        for proposing a topic that is **not already listed**.

        A topic is one JSON file in `data/<type>/` plus three reserved exercise
        batches. That is a real amount of work, so a proposal that names its
        sources and explains who it helps is far more likely to be accepted than
        one that only names the subject. The coverage dashboard on the site lists
        every id that already exists; please check it before opening this.

        Please read the scope rules first. Everything here is defensive or
        lab-only study material, with no working exploit code and no live
        indicators of compromise.

  - type: dropdown
    id: catalog-type
    attributes:
      label: Catalog type
      description: Which folder the topic would live in, and which listing page it would appear on.
      options:
        - keyword
        - certification
        - tactic
        - technique
        - mitigation
        - detection
        - group
    validations:
      required: true

  - type: input
    id: proposed-title
    attributes:
      label: Proposed title
      description: The display title, in title case, the way it should read on the listing page.
      placeholder: Container Runtime Sandboxing
    validations:
      required: true

  - type: input
    id: proposed-id
    attributes:
      label: Proposed id
      description: "Lowercase letters, digits and hyphens only. 2 to 64 characters, must start with a letter or digit. This becomes the URL and the folder name."
      placeholder: container-runtime-sandboxing
      pattern: '^[a-z0-9][a-z0-9-]{1,63}$'
    validations:
      required: true
      regex: '^[a-z0-9][a-z0-9-]{1,63}$'

  - type: input
    id: external-id
    attributes:
      label: ATT&CK id or exam code
      description: Optional. Required for ATT&CK topics, for example `T1610` or `TA0004`, and for certifications, for example `SY0-701`.
      placeholder: T1610
    validations:
      required: false

  - type: textarea
    id: why-it-matters
    attributes:
      label: Why this topic matters, and who it helps
      description: Explain the gap it fills and name the roles or learners it serves. Two or three sentences is plenty.
      placeholder: Container escapes are a common route out of a compromised workload. This would help cloud engineers and SOC analysts who can read Kubernetes audit logs but have never seen the persistence techniques that follow an escape.
    validations:
      required: true

  - type: textarea
    id: sources
    attributes:
      label: Authoritative sources
      description: "**Required.** At least one source, with a full https URL. Primary sources only: vendor documentation, the MITRE ATT&CK knowledge base, a standards body, or a peer-reviewed paper. Blogs and course marketing pages are not sufficient on their own."
      placeholder: |
        - NIST SP 800-190, Application Container Security Guide — https://csrc.nist.gov/pubs/sp/800/190/final
        - MITRE ATT&CK, Escape to Host (T1611) — https://attack.mitre.org/techniques/T1611/
    validations:
      required: true

  - type: textarea
    id: related-topics
    attributes:
      label: Related existing topic ids
      description: Optional. Existing ids from the catalog that this topic should cross-reference, one per line or comma separated.
      placeholder: kubernetes-rbac, container-escape, ta0004
    validations:
      required: false

  - type: checkboxes
    id: coverage-checked
    attributes:
      label: Coverage check
      options:
        - label: I checked the coverage dashboard first, and this topic is not already in the catalog.
          required: true
