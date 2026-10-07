---
name: Content accuracy
description: A factual claim, a date, a link or an attribution on this site is wrong. A source citation is required.
title: "Content accuracy: "
labels: content

---

body:
  - type: markdown
    attributes:
      value: |
        Thank you for checking our work. CyberMastery is a study resource, and a
        confidently wrong study resource is worse than no study resource at all,
        so accuracy reports are the most valuable issues we receive.

        **A citation is required.** A report without a source cannot be actioned,
        because the only way to change the site is to check the claim against
        something authoritative. Reports that arrive without a citation will be
        closed with a request for one. This is not gatekeeping: it is what keeps
        the correction from being a second opinion we have no way to verify.

        Acceptable sources include the MITRE ATT&CK knowledge base, NIST
        publications, RFCs, OWASP guidance, vendor documentation, and the official
        exam objectives published by the certification body. A blog post or a
        training provider's marketing page is usually not enough on its own.

        One claim per issue, please. It keeps the discussion and the fix clean.

  - type: input
    id: location
    attributes:
      label: Topic id or page URL
      description: The topic id if the problem is on a topic page, otherwise the full URL of the page.
      placeholder: t1059, or https://example.github.io/cybermastery/pages/privacy.html
    validations:
      required: true

  - type: textarea
    id: wrong-claim
    attributes:
      label: Which claim is wrong
      description: Quote the exact sentence or figure that is wrong, and say what it currently says. Then state what is actually correct. Precision here saves a round trip.
      placeholder: |
        The page says "Kerberoasting requires domain admin rights". It does not; it only
        requires any authenticated domain account that can request a service ticket.
    validations:
      required: true

  - type: input
    id: citation
    attributes:
      label: Source citation (mandatory)
      description: "**Mandatory.** A full https URL to the authoritative source that settles this. A report without one cannot be actioned and will be closed with a request for a citation."
      placeholder: https://attack.mitre.org/techniques/T1558/003/
      pattern: '^https://\S+$'
    validations:
      required: true
      regex: '^https://\S+$'

  - type: dropdown
    id: severity
    attributes:
      label: Severity
      description: How much does this mislead a learner?
      options:
        - factual error
        - out of date
        - misleading phrasing
        - broken link
        - attribution or licensing problem
    validations:
      required: true

  - type: textarea
    id: suggested-correction
    attributes:
      label: Suggested correction
      description: Optional, but welcome. If you can, write the replacement wording, and note the source for anything you add.
    validations:
      required: false

  - type: checkboxes
    id: no-copyrighted-material
    attributes:
      label: Copyright check
      options:
        - label: This report does not reproduce copyrighted or paid course material.
          required: true
