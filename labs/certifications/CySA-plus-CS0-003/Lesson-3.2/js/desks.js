// ─── The Access Bureau — desks: Field Manual (C2) + the five environment desks
// Ported from FieldManual.tsx and desks/{Identity,Auth,Access,Audit,Federation}Desk.tsx.

(function () {
  'use strict'

  var el = Bureau.el
  var icon = Bureau.icon

  // ── shared builders ──────────────────────────────────────────────────────────
  function stack() { return el('div', { class: 'desk-stack' }) }

  function directoryTable() {
    var body = el('tbody', {})
    ACCOUNTS.forEach(function (a) {
      var flags = el('span', { class: 'dir-flags' })
      if (a.privileged) flags.appendChild(el('span', { class: 'badge badge-priv', text: 'P privileged' }))
      if (a.remote) flags.appendChild(el('span', { class: 'badge badge-remote', text: 'R remote' }))
      if (a.owner) flags.appendChild(el('span', { class: 'dir-owner', text: 'owner: ' + a.owner }))
      body.appendChild(el('tr', { class: 'ledger-row' },
        el('td', { class: 'dir-td' },
          el('span', { class: 'dir-user', text: a.username }),
          el('span', { class: 'dir-sub', text: a.displayName })),
        el('td', { class: 'dir-td dir-muted' },
          a.dept,
          el('span', { class: 'dir-sub', text: a.role })),
        el('td', { class: 'dir-td' },
          el('span', { class: a.status === 'active' ? 'status-active' : 'status-dormant', text: a.status })),
        el('td', { class: 'dir-td dir-muted', text: a.lastLogon }),
        el('td', { class: 'dir-td dir-muted' },
          flags,
          a.note ? el('span', { class: 'dir-note', text: a.note }) : null)))
    })
    return el('div', { class: 'ledger-scroll dir-box' },
      el('table', { class: 'ledger-table' },
        el('thead', { class: 'ledger-thead' }, el('tr', {},
          el('th', { text: 'account' }), el('th', { text: 'dept / role' }), el('th', { text: 'status' }),
          el('th', { text: 'last logon' }), el('th', { text: 'flags / notes' }))),
        body))
  }

  // ═══ FIELD MANUAL (Knowledge core, C2) ══════════════════════════════════════
  function FieldManual() {
    var s = LabStore.getState()
    var isMedium = s.mode === 'medium'
    var root = stack()

    // Card 1 — What IAM is
    var iamText = el('div', { class: 'iam-text' })
    iamText.appendChild(el('p', {},
      'Every access decision walks the same ',
      Bureau.Term('AAA chain', 'Claim, prove, decide, record — the four A’s of identity.'),
      '. IAM is the bureaucracy of digital trust: it manages ',
      el('strong', { text: 'user identities' }), ', enforces ', el('strong', { text: 'secure authentication' }),
      ' (passwords, 2FA/MFA, SSO), grants ', el('strong', { text: 'roles and privileges' }), ', keeps the',
      el('strong', { text: ' audit ledger' }), ', and ', el('strong', { text: 'interfaces with external services' }),
      ' through federation.'))
    iamText.appendChild(el('p', { class: 'mt-p' },
      'Attackers love it because identity is the master key. A stolen valid account (MITRE ',
      Bureau.Term('T1078 Valid Accounts', 'MITRE T1078 — credentials that already work, so the attacker looks like a normal user.'),
      ') crosses Initial Access, Persistence, Privilege Escalation and Defense Evasion at once — no exploit required, no malware to detect.'))
    iamText.appendChild(el('p', { class: 'mt-p' },
      'Chain position: credential attacks (',
      Bureau.Term('T1110', 'MITRE T1110 — guessing, cracking, spraying, stuffing.'), ', ',
      Bureau.Term('T1621', 'MITRE T1621 — spamming MFA push requests until one is approved.'),
      ') usually precede or replace exploitation; account & role manipulation (',
      Bureau.Term('T1098', 'MITRE T1098 — adding accounts, roles, or credentials to persist.'),
      ') follows, cementing persistence. Your detection surface: the audit ledger.'))

    var fcList = el('ul', { class: 'fc-list' })
    FIELD_CASES.forEach(function (fc) {
      fcList.appendChild(el('li', { class: 'fc-item' },
        el('span', { class: 'fc-actor font-serif', text: fc.actor }),
        el('span', { class: 'fc-tech font-mono', text: fc.technique }),
        el('br'),
        fc.text))
    })
    var fieldCases = el('div', { class: 'field-cases' },
      el('p', { class: 'fc-label font-mono', text: 'Field cases — per official MITRE procedure examples' }),
      fcList)

    root.appendChild(Bureau.BureauCard({
      icon: icon('Landmark', 20),
      title: 'What IAM is — and why the Bureau exists',
      subtitle: 'Identity and Access Management: ensuring the right people have the right access to the right resources at the right time.',
    }, el('div', { class: 'iam-grid' }, iamText, fieldCases)))

    // Card 2 — the four A’s (exercise in Medium / reference in Hard)
    var fourAsBody
    if (isMedium) {
      var rows = el('div', { class: 'choice-stack' })
      TERM_ITEMS.forEach(function (t) {
        var row = Bureau.ChoiceRow({
          id: 'term-' + t.id,
          label: el('span', { class: 'font-serif row-label-bold', text: t.label }),
          options: TERM_OPTIONS,
          value: s.env.terms[t.id] || '',
          onChange: function (v) {
            var terms = Object.assign({}, LabStore.getState().env.terms)
            terms[t.id] = v
            LabStore.patchEnv({ terms: terms })
          },
        })
        rows.appendChild(row)
      })
      fourAsBody = el('div', {}, rows, Bureau.CheckStamp('OBJ-M1'))
    } else {
      var dl = el('dl', { class: 'fouras-grid' })
      var fourAs = [
        ['Identification', 'Claiming who you are — presenting a username or badge number'],
        ['Authentication', 'Proving that claim — password, OTP, biometric, key'],
        ['Authorization', 'Deciding what the proven identity may access and do'],
        ['Accounting', 'Recording what the identity did — audit logs, reviews'],
      ]
      fourAs.forEach(function (pair) {
        dl.appendChild(el('div', { class: 'fouras-item' },
          el('dt', { class: 'font-serif', text: pair[0] }),
          el('dd', { text: pair[1] })))
      })
      fourAsBody = dl
    }
    root.appendChild(Bureau.BureauCard({
      icon: icon('KeyRound', 20),
      title: isMedium ? 'Desk exercise — sort the four A’s' : 'The four A’s — reference',
      ref_: isMedium ? 'OBJ-M1' : undefined,
      subtitle: isMedium
        ? 'Match each term to its definition. This is the vocabulary every other desk assumes.'
        : 'Identification → Authentication → Authorization → Accounting, in the order a sign-in experiences them.',
    }, fourAsBody))

    // Card 3 — factors & federation quick reference
    var factorsList = el('ul', { class: 'ref-list' })
    FACTOR_ITEMS.forEach(function (f) {
      factorsList.appendChild(el('li', {}, f.label + ' ',
        el('span', { class: 'ref-anno font-mono', text: '(' + f.answer + ')' })))
    })
    var ssoBox = el('div', {},
      el('p', { class: 'ref-box-title font-serif', text: 'SSO & federation' }),
      el('p', { class: 'ref-box-text' },
        'Authenticate once at the ',
        Bureau.Term('IdP', 'Identity provider — authenticates users, issues assertions/tokens.'),
        '; every wired application trusts the signed assertion. ',
        el('strong', { text: 'SAML' }), ' = XML assertions · ', el('strong', { text: 'OAuth 2.0' }), ' = delegated authorization · ',
        el('strong', { text: 'OIDC' }), ' = identity layer over OAuth 2.0. Trade-off: one phished IdP credential unlocks everything.'))
    var modelsList = el('ul', { class: 'ref-list' })
    var models = [
      ['DAC', 'Discretionary ACLs set by resource owners.', 'owners set permissions'],
      ['MAC', 'Mandatory access control — labels/levels, OS-enforced.', 'labels & clearance'],
      ['RBAC', 'Role-based access control — permissions attach to job roles.', 'permissions attach to roles'],
      ['ABAC', 'Attribute-based access control — user/resource/context attributes per request.', 'attributes & context'],
      ['JIT / PAM', 'Just-in-time privileged access — admin rights checked out for a bounded time.', 'time-boxed admin'],
    ]
    models.forEach(function (m) {
      modelsList.appendChild(el('li', {}, Bureau.Term(m[0], m[1]), ' — ' + m[2]))
    })
    root.appendChild(Bureau.BureauCard({
      icon: icon('Fingerprint', 20),
      title: 'Authentication factors & federation — quick reference',
      subtitle: 'Strong MFA mixes factor TYPES: knowledge + possession, or possession + inherence. Two passwords are still one factor.',
    }, el('div', { class: 'factors-grid' },
      el('div', { class: 'ref-box' }, el('p', { class: 'ref-box-title font-serif', text: 'Factors' }), factorsList),
      el('div', { class: 'ref-box' }, ssoBox),
      el('div', { class: 'ref-box' }, el('p', { class: 'ref-box-title font-serif', text: 'Access models' }), modelsList))))

    // Card 4 — attacks gallery
    var attackGrid = el('div', { class: 'attack-grid' })
    var attacks = [
      ['Password spraying', 'T1110.003', 'A few common passwords across MANY usernames, under lockout thresholds. Overnight ledger shape: 1–2 failures per username, one source IP.'],
      ['Credential stuffing', 'T1110.004', 'Replaying breached username:password pairs from dumps. Shape: valid-looking passwords, many unrelated source IPs.'],
      ['MFA request generation', 'T1621', 'Push-notification flood (“MFA fatigue”). Shape: repeated pushes, denials, then a tired approval. Attacker already has the password.'],
      ['Kerberoasting', 'T1558.003', 'Request service-account Kerberos tickets and crack offline. Shape: TGS-request spike for service accounts from one host.'],
    ]
    attacks.forEach(function (a) {
      attackGrid.appendChild(el('div', { class: 'attack-card' },
        el('p', { class: 'attack-name font-serif' }, a[0] + ' ',
          el('span', { class: 'attack-id font-mono', text: a[1] })),
        el('p', { class: 'attack-text', text: a[2] })))
    })
    root.appendChild(Bureau.BureauCard({
      icon: icon('Bug', 20),
      title: 'Attacks on identity — the rogues’ gallery',
      subtitle: 'All four target the same prize: a session that looks like everyone else.',
    }, attackGrid))

    // Card 5 — glossary
    var gGrid = el('dl', { class: 'glossary-grid' })
    GLOSSARY.forEach(function (g) {
      gGrid.appendChild(el('div', { class: 'g-item' },
        el('dt', { class: 'font-serif', text: g.term }),
        el('dd', { text: g.def })))
    })
    root.appendChild(Bureau.BureauCard({
      icon: icon('ScrollText', 20),
      title: 'Glossary of the Bureau',
      subtitle: 'Fifteen terms, one line each. Dotted-underlined words throughout the lab open the same definitions on hover.',
    }, gGrid))

    // Card 6 — how to read
    root.appendChild(Bureau.BureauCard({
      icon: icon('ShieldAlert', 20),
      title: 'How to read this lab',
      subtitle: 'Six desks, one queue of tickets, one exam.',
    }, el('div', { class: 'howto' },
      el('span', { class: 'howto-icon', html: icon('BookOpen', 20) }),
      el('p', {},
        'The ', el('strong', { text: 'ticket queue' }),
        ' (left rail on desktop, Tickets button on mobile) lists your objectives. Open a ticket, work the matching desk, then press ',
        el('strong', { text: 'STAMP THIS TICKET' }),
        ' at the bottom of the exercise. Stamps are permanent once approved; hints live in the ticket and cost star credit. Stamp every ticket to unlock the ',
        el('strong', { text: 'Final Exam' }), ', and the exam opens the ', el('strong', { text: 'Debrief' }), '.'))))

    return root
  }

  // ═══ IDENTITY DESK ══════════════════════════════════════════════════════════
  function IdentityDesk() {
    var s = LabStore.getState()
    var mode = s.mode
    var root = stack()

    root.appendChild(Bureau.BureauCard({
      icon: icon('IdCard', 20),
      title: 'Directory records — the identity registry',
      subtitle: 'Fifteen identities on file. Flags: P = privileged access, R = remote/hybrid worker. Read carefully; several tickets live here.',
    }, directoryTable()))

    if (mode === 'medium') {
      var typeRows = el('div', { class: 'choice-stack' })
      ACCOUNT_TYPE_ITEMS.forEach(function (u) {
        typeRows.appendChild(Bureau.ChoiceRow({
          id: 'type-' + u,
          label: el('span', { class: 'font-mono row-label-bold', text: u }),
          options: ACCOUNT_TYPE_OPTIONS,
          value: s.env.accountTypes[u] || '',
          onChange: function (v) {
            var at = Object.assign({}, LabStore.getState().env.accountTypes)
            at[u] = v
            LabStore.patchEnv({ accountTypes: at })
          },
        }))
      })
      root.appendChild(Bureau.BureauCard({
        icon: icon('UsersRound', 20),
        title: 'Ticket — sort the directory by identity type',
        ref_: 'OBJ-M4',
        subtitle: 'Human, service, shared or device? Typing identities decides which policy applies to each.',
      }, el('div', {}, typeRows, Bureau.CheckStamp('OBJ-M4'))))

      var lifeRows = el('div', { class: 'choice-stack' })
      LIFECYCLE_ITEMS.forEach(function (l) {
        lifeRows.appendChild(Bureau.ChoiceRow({
          id: 'life-' + l.id,
          label: l.label,
          options: LIFECYCLE_OPTIONS,
          value: s.env.lifecycle[l.id] || '',
          onChange: function (v) {
            var lc = Object.assign({}, LabStore.getState().env.lifecycle)
            lc[l.id] = v
            LabStore.patchEnv({ lifecycle: lc })
          },
        }))
      })
      root.appendChild(Bureau.BureauCard({
        icon: icon('ClipboardList', 20),
        title: 'Ticket — lifecycle review worksheet',
        ref_: 'OBJ-M11',
        subtitle: 'Four flagged records, four actions. Joiner-mover-leaver: accounts must follow their humans in and out.',
      }, el('div', {}, lifeRows, Bureau.CheckStamp('OBJ-M11'))))
    }

    if (mode === 'hard') {
      // ── containment sequence (OBJ-H5) ──
      var seqLabel = el('p', { class: 'tray-label font-mono' })
      var trayList = el('ul', { class: 'tray-list' })
      var seqList = el('ol', { class: 'tray-list' })

      function getSeq() { return LabStore.getState().env.containment.slice() }
      function putSeq(seq) { LabStore.patchEnv({ containment: seq }) }

      function stepText(id) {
        var step = CONTAINMENT_STEPS.find(function (x) { return x.id === id })
        return step ? step.text : id
      }
      function renumber() {
        var items = seqList.querySelectorAll('.seq-item')
        Array.prototype.forEach.call(items, function (li, i) {
          li.querySelector('.seq-num').textContent = (i + 1) + '.'
          var btns = li.querySelectorAll('button')
          btns[0].setAttribute('aria-label', 'Move step ' + (i + 1) + ' up')
          btns[1].setAttribute('aria-label', 'Move step ' + (i + 1) + ' down')
          btns[2].setAttribute('aria-label', 'Remove step ' + (i + 1))
          var correctHere = CONTAINMENT_CORRECT[i] === li.__id
          li.querySelector('.seq-sr').textContent = correctHere ? '' : 'position not yet finalized'
        })
        seqLabel.textContent = 'Execution order ' + (getSeq().length > 0 ? '(' + getSeq().length + '/5 placed)' : '(empty)')
      }
      function addStep(id) {
        var seq = getSeq()
        if (seq.indexOf(id) >= 0) return
        seq.push(id)
        putSeq(seq)
        paint()
      }
      function removeStep(id) {
        putSeq(getSeq().filter(function (x) { return x !== id }))
        paint()
      }
      function moveStep(id, dir) {
        var seq = getSeq()
        var i = seq.indexOf(id)
        var j = i + dir
        if (i < 0 || j < 0 || j >= seq.length) return
        var tmp = seq[i]; seq[i] = seq[j]; seq[j] = tmp
        putSeq(seq)
        paint()
      }

      var seqItems = {} // id -> li node (kept alive to preserve focus on arrows)
      function paint() {
        var seq = getSeq()
        // tray
        trayList.innerHTML = ''
        CONTAINMENT_DISPLAY_ORDER.filter(function (id) { return seq.indexOf(id) < 0 }).forEach(function (id) {
          var add = Bureau.btn('outline', null, 'tray-btn', stepText(id), { 'aria-label': 'Add step: ' + stepText(id) })
          add.addEventListener('click', function () { addStep(id) })
          trayList.appendChild(el('li', {}, add))
        })
        // sequence — reuse li nodes, reorder via DOM moves (keeps arrow focus)
        seq.forEach(function (id) {
          if (!seqItems[id]) {
            var li = el('li', { class: 'seq-item' },
              el('span', { class: 'seq-num font-mono' }),
              el('span', { class: 'seq-text font-mono', text: stepText(id) }),
              el('span', { class: 'sr-only seq-sr' }))
            var up = Bureau.btn('ghost', 'sm', 'icon-btn', icon('ArrowUp', 16))
            var down = Bureau.btn('ghost', 'sm', 'icon-btn', icon('ArrowDown', 16))
            var rm = Bureau.btn('ghost', 'sm', 'icon-btn icon-btn-wide', '✕')
            up.addEventListener('click', function () { moveStep(id, -1) })
            down.addEventListener('click', function () { moveStep(id, 1) })
            rm.addEventListener('click', function () { removeStep(id) })
            li.appendChild(up); li.appendChild(down); li.appendChild(rm)
            li.__id = id
            seqItems[id] = li
          }
          seqList.appendChild(seqItems[id]) // appendChild moves existing nodes into order
        })
        // drop removed nodes
        Object.keys(seqItems).forEach(function (id) {
          if (seq.indexOf(id) < 0) { delete seqItems[id] }
        })
        if (seq.length === 0) {
          seqList.appendChild(el('li', { class: 'seq-empty font-mono', text: 'add steps from the tray →' }))
        }
        renumber()
      }
      paint()

      root.appendChild(Bureau.BureauCard({
        icon: icon('Ban', 20),
        title: 'Mandate — containment sequence (incident response)',
        ref_: 'OBJ-H5',
        subtitle: 'Build the response for the r.delgado intrusion. Move steps into order (arrows). One tray step must NOT be used.',
      }, el('div', { class: 'seq-cols' },
        el('div', {}, el('p', { class: 'tray-label font-mono', text: 'Step tray (tap to add)' }), trayList),
        el('div', {}, seqLabel, seqList),
        Bureau.CheckStamp('OBJ-H5'))))

      // ── quarterly access review (OBJ-H9) ──
      var reviewRows = el('ul', { class: 'review-rows' })
      ACCOUNTS.forEach(function (a) {
        var checked = s.env.review.disabled.indexOf(a.username) >= 0
        var cb = Bureau.Checkbox({
          id: 'rev-' + a.id,
          checked: checked,
          ariaLabel: 'Disable ' + a.username,
          onCheckedChange: function (v) {
            var cur = LabStore.getState().env.review.disabled.slice()
            var has = cur.indexOf(a.username) >= 0
            if (v && !has) cur.push(a.username)
            if (!v && has) cur = cur.filter(function (x) { return x !== a.username })
            LabStore.setEnvReview({ disabled: cur })
          },
        })
        cb.classList.add('review-check')
        var label = el('label', { class: 'review-label font-mono', for: 'rev-' + a.id },
          el('span', { class: 'review-user', text: a.username }), ' · ' + a.dept + ' · ' + a.status + ' · last logon ' + a.lastLogon,
          a.owner ? el('span', { class: 'review-sub', text: 'owner: ' + a.owner }) : null,
          a.note ? el('span', { class: 'review-sub is-note', text: a.note }) : null)
        reviewRows.appendChild(el('li', { class: 'review-row' }, cb, label))
      })
      var sched = Bureau.Switch({
        id: 'rev-sched',
        checked: s.env.review.scheduled,
        ariaLabel: 'Schedule next quarterly access review',
        onCheckedChange: function (v) { LabStore.setEnvReview({ scheduled: v }) },
      })
      var schedRow = el('div', { class: 'schedule-row' },
        sched,
        el('label', { class: 'review-label font-mono', for: 'rev-sched', text: 'Schedule next quarterly access review (required by policy)' }))
      root.appendChild(Bureau.BureauCard({
        icon: icon('CalendarClock', 20),
        title: 'Mandate — quarterly access review',
        ref_: 'OBJ-H9',
        subtitle: 'Disable exactly the accounts this review must remove, then schedule the next review. Criteria: dormant far beyond policy · orphaned ownership · expired contract.',
      }, el('div', {}, reviewRows, schedRow, Bureau.CheckStamp('OBJ-H9'))))
    }

    return root
  }

  // ═══ AUTHENTICATION DESK ════════════════════════════════════════════════════
  function AuthDesk() {
    var s = LabStore.getState()
    var isMedium = s.mode === 'medium'
    var root = stack()

    if (!isMedium) {
      root.appendChild(el('p', {
        class: 'hard-note font-mono',
        text: 'REFERENCE CONSOLES — your incident mandates (OBJ-H1…H9) have no ticket at this desk. The policy and enrollment boards below remain live for exploration; nothing here is graded.',
      }))
    }

    // factors card
    var factorRows = el('div', { class: 'choice-stack' })
    FACTOR_ITEMS.forEach(function (f) {
      factorRows.appendChild(Bureau.ChoiceRow({
        id: 'factor-' + f.id,
        label: f.label,
        options: FACTOR_OPTIONS,
        value: s.env.factors[f.id] || '',
        onChange: function (v) {
          var fc = Object.assign({}, LabStore.getState().env.factors)
          fc[f.id] = v
          LabStore.patchEnv({ factors: fc })
        },
      }))
    })
    root.appendChild(Bureau.BureauCard({
      icon: icon('KeyRound', 20),
      title: isMedium ? 'Ticket — classify the authentication factors' : 'Reference — authentication factors',
      ref_: isMedium ? 'OBJ-M2' : undefined,
      subtitle: 'Six methods are pinned to the desk board. Knowledge, possession, or inherence?',
    }, (function () {
      var d = el('div', {}, factorRows)
      if (isMedium) d.appendChild(Bureau.CheckStamp('OBJ-M2'))
      return d
    })()))

    // policy console
    var policy = s.env.policy
    var lenVal = el('span', { class: 'slider-val font-mono', 'aria-live': 'polite', text: String(policy.minLength) })
    var lockVal = el('span', { class: 'slider-val font-mono', 'aria-live': 'polite', text: String(policy.lockout) })
    var histVal = el('span', { class: 'slider-val font-mono', 'aria-live': 'polite', text: String(policy.history) })
    var policyLine = el('p', { class: 'policy-line font-mono', 'aria-live': 'polite' })

    function refreshPolicyLine() {
      var p = LabStore.getState().env.policy
      lenVal.textContent = String(p.minLength)
      lockVal.textContent = String(p.lockout)
      histVal.textContent = String(p.history)
      complexity.setAttribute('aria-checked', p.complexity ? 'true' : 'false')
      policyLine.textContent = 'current policy: len ≥ ' + p.minLength + ' · complexity ' + (p.complexity ? 'ON' : 'off') +
        ' · lockout ' + p.lockout + ' · history ' + p.history
    }

    function sliderBlock(labelText, id, min, max, value, onValue, valEl) {
      var slider = Bureau.Slider({
        min: min, max: max, value: value,
        ariaLabel: labelText,
        onValueChange: onValue,
      })
      return el('div', { class: 'slider-block' },
        el('div', { class: 'slider-head' },
          el('label', { class: 'slider-label font-mono', for: id, text: labelText }),
          valEl),
        slider)
    }

    var sliders = el('div', { class: 'policy-sliders' },
      sliderBlock('Minimum password length', 'pol-len', 8, 32, policy.minLength, function (v) { LabStore.setEnvPolicy({ minLength: v }); refreshPolicyLine() }, lenVal),
      sliderBlock('Lockout after failed attempts', 'pol-lock', 3, 20, policy.lockout, function (v) { LabStore.setEnvPolicy({ lockout: v }); refreshPolicyLine() }, lockVal),
      sliderBlock('Password history (remember last N)', 'pol-hist', 0, 24, policy.history, function (v) { LabStore.setEnvPolicy({ history: v }); refreshPolicyLine() }, histVal))

    var complexity = Bureau.Switch({
      id: 'pol-cplx',
      checked: policy.complexity,
      ariaLabel: 'Require character-class complexity',
      onCheckedChange: function (v) { LabStore.setEnvPolicy({ complexity: v }); refreshPolicyLine() },
    })
    var right = el('div', { class: 'policy-right' },
      el('div', { class: 'pam-row' },
        el('label', { class: 'policy-cplx-label', for: 'pol-cplx' },
          'Require character-class complexity',
          el('span', { class: 'policy-cplx-sub font-mono', text: 'upper · lower · digit · symbol' })),
        complexity),
      el('p', { class: 'why-note', html: 'Why it matters: this console is <span class="font-mono why-strong">M1027 + M1036</span> in miniature. The overnight spray in the ledger dies exactly here — length kills guessing, lockout kills automation, history kills rotation games.' }),
      policyLine)
    refreshPolicyLine()

    root.appendChild(Bureau.BureauCard({
      icon: icon('ShieldCheck', 20),
      title: isMedium ? 'Ticket — write the password policy' : 'Reference — password policy console',
      ref_: isMedium ? 'OBJ-M9' : undefined,
      subtitle: 'Ticket targets: minimum length ≥ 12 · complexity ON · lockout after ≤ 5 failures · remember ≥ 5 old passwords.',
    }, (function () {
      var d = el('div', { class: 'policy-grid' }, sliders, right)
      if (isMedium) d.appendChild(Bureau.CheckStamp('OBJ-M9'))
      return d
    })()))

    // MFA board
    var mfaList = el('ul', { class: 'mfa-list' })
    ACCOUNTS.forEach(function (a) {
      var on = s.env.mfa[a.username] !== undefined ? s.env.mfa[a.username] : a.mfa
      var badges = el('span', { class: 'mfa-badges' })
      if (a.privileged) badges.appendChild(el('span', { class: 'badge badge-priv', text: 'privileged' }))
      if (a.remote) badges.appendChild(el('span', { class: 'badge badge-remote', text: 'remote' }))
      badges.appendChild(el('span', { class: 'mfa-meta font-mono', text: a.type + ' · ' + a.location }))
      mfaList.appendChild(el('li', { class: 'mfa-row' },
        el('span', { class: 'mfa-id' },
          el('span', { class: 'mfa-user font-mono', text: a.username }),
          badges),
        el('span', { class: 'mfa-switch' },
          el('label', { class: 'sr-only', for: 'mfa-' + a.id, text: 'MFA for ' + a.username }),
          Bureau.Switch({
            id: 'mfa-' + a.id,
            checked: on,
            ariaLabel: 'MFA for ' + a.username,
            onCheckedChange: function (v) {
              var mfa = Object.assign({}, LabStore.getState().env.mfa)
              mfa[a.username] = v
              LabStore.patchEnv({ mfa: mfa })
            },
          }))))
    })
    root.appendChild(Bureau.BureauCard({
      icon: icon('ToggleRight', 20),
      title: isMedium ? 'Ticket — MFA enrollment board' : 'Reference — MFA enrollment board',
      ref_: isMedium ? 'OBJ-M10' : undefined,
      subtitle: 'Enable MFA for every administrator, privileged approver, and remote/hybrid worker. Service, shared, device and on-site standard accounts stay out of this rollout.',
    }, (function () {
      var d = el('div', {}, mfaList)
      if (isMedium) d.appendChild(Bureau.CheckStamp('OBJ-M10'))
      return d
    })()))

    return root
  }

  // ═══ ACCESS DESK ════════════════════════════════════════════════════════════
  function AccessDesk() {
    var s = LabStore.getState()
    var mode = s.mode
    var root = stack()

    // RBAC board
    var rbacGrid = el('div', { class: 'rbac-grid' })
    ROLES.forEach(function (r) {
      var isFinanceAdmin = r.role === 'finance-admin'
      var card = el('div', { class: 'role-card' + (isFinanceAdmin ? ' role-fa' : '') },
        el('p', { class: 'role-name font-serif', text: r.role }),
        el('p', { class: 'role-members font-mono', text: 'members: ' + r.members.join(', ') }))
      var chipRow = el('div', { class: 'chip-row' })
      if (r.perms.length === 0) {
        chipRow.appendChild(el('span', { class: 'role-noperm font-mono', text: 'no permissions' }))
      } else {
        r.perms.forEach(function (p) {
          var flagged = isFinanceAdmin && s.env.sodFlag === r.role + '.' + p
          var chip = el('button', {
            type: 'button',
            class: 'chip' + (flagged ? ' is-flagged' : '') + (isFinanceAdmin ? ' is-clickable' : ''),
            'aria-pressed': flagged ? 'true' : 'false',
            title: isFinanceAdmin ? 'Click to flag this permission in the SoD violation' : undefined,
          }, flagged ? el('span', { class: 'chip-flag', html: icon('Flag', 12) }) : null, p)
          if (!isFinanceAdmin) chip.disabled = true
          chip.__perm = p
          chip.__role = r.role
          chip.__fa = isFinanceAdmin
          chipRow.appendChild(chip)
        })
      }
      card.appendChild(chipRow)
      if (isFinanceAdmin) {
        card.appendChild(el('p', { class: 'sod-hint' },
          'Click a permission chip to flag the ', el('strong', { text: 'separation-of-duties' }),
          ' violation you can see in this role.'))
      }
      rbacGrid.appendChild(card)
    })
    rbacGrid.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip')
      if (!chip || !chip.__fa || chip.disabled) return
      var key = chip.__role + '.' + chip.__perm
      var cur = LabStore.getState().env.sodFlag
      LabStore.patchEnv({ sodFlag: cur === key ? '' : key })
      // repaint finance-admin chips in place (focus preserved)
      rbacGrid.querySelectorAll('.chip.is-clickable').forEach(function (c) {
        var nowFlagged = LabStore.getState().env.sodFlag === c.__role + '.' + c.__perm
        c.classList.toggle('is-flagged', nowFlagged)
        c.setAttribute('aria-pressed', nowFlagged ? 'true' : 'false')
        var hasIcon = c.querySelector('.chip-flag')
        if (nowFlagged && !hasIcon) c.insertBefore(el('span', { class: 'chip-flag', html: icon('Flag', 12) }), c.firstChild)
        if (!nowFlagged && hasIcon) hasIcon.remove()
      })
    })
    root.appendChild(Bureau.BureauCard({
      icon: icon('Layers', 20),
      title: 'Role chart wall — the RBAC board',
      subtitle: 'Roles carry permissions; people carry roles. Separation of duties rule: nobody may hold requisition-approve AND approve-payments.',
    }, rbacGrid))

    if (mode === 'medium') {
      var permSet = el('fieldset', { class: 'fieldset' },
        el('legend', { class: 'font-mono', text: 'AP-clerk permission set' }))
      var permGrid = el('div', { class: 'perm-grid' })
      var selLine = el('p', { class: 'perm-line font-mono', 'aria-live': 'polite' })
      function refreshSel() {
        var env = LabStore.getState().env
        selLine.textContent = 'selected: ' + (env.clerkPerms.length ? env.clerkPerms.join(', ') : '—') +
          ' · SoD flag: ' + (env.sodFlag || 'none')
      }
      PERMISSIONS.forEach(function (p) {
        var cb = Bureau.Checkbox({
          id: 'clerk-' + p.id,
          checked: s.env.clerkPerms.indexOf(p.id) >= 0,
          ariaLabel: 'Grant ' + p.label + ' to AP-clerk',
          onCheckedChange: function (v) {
            var cur = LabStore.getState().env.clerkPerms.slice()
            var has = cur.indexOf(p.id) >= 0
            if (v && !has) cur.push(p.id)
            if (!v && has) cur = cur.filter(function (x) { return x !== p.id })
            LabStore.patchEnv({ clerkPerms: cur })
            refreshSel()
          },
        })
        permGrid.appendChild(el('span', { class: 'perm-line-item' }, cb,
          el('label', { class: 'perm-check-label font-mono', for: 'clerk-' + p.id, text: p.label })))
      })
      permSet.appendChild(permGrid)
      refreshSel()
      root.appendChild(Bureau.BureauCard({
        icon: icon('UserCog', 20),
        title: 'Ticket — least privilege for the new AP-clerk',
        ref_: 'OBJ-M5',
        subtitle: 'New hire N. Iwuchukwu joins as AP-clerk. Build the MINIMUM permission set, and flag the SoD violation on the wall above.',
      }, el('div', {}, permSet, selLine, Bureau.CheckStamp('OBJ-M5'))))
    }

    if (mode === 'hard') {
      // OBJ-H6 — MITRE mitigation map
      var findings = el('div', { class: 'choice-stack' })
      MITRE_FINDINGS.forEach(function (f) {
        findings.appendChild(el('div', { class: 'finding-card' },
          el('p', { class: 'finding-text', text: f.text }),
          el('div', { class: 'finding-select' },
            Bureau.ChoiceRow({
              id: 'mitre-' + f.id,
              label: el('span', { class: 'mitre-label font-mono', text: 'mitigation' }),
              options: MITRE_OPTIONS.map(function (m) { return { id: m, text: m } }),
              value: s.env.mitreMap[f.id] || '',
              onChange: function (v) {
                var mm = Object.assign({}, LabStore.getState().env.mitreMap)
                mm[f.id] = v
                LabStore.patchEnv({ mitreMap: mm })
              },
              compact: true,
            }))))
      })
      root.appendChild(Bureau.BureauCard({
        icon: icon('ShieldHalf', 20),
        title: 'Mandate — map audit findings to MITRE mitigations',
        ref_: 'OBJ-H6',
        subtitle: 'Three findings from the morning review. Attach the correct official mitigation ID to each. Distractor M-IDs are real controls — they just don’t fit best.',
      }, el('div', {}, findings, Bureau.CheckStamp('OBJ-H6'))))

      // OBJ-H8 — PAM board
      var jit = Bureau.Switch({
        id: 'pam-jit',
        checked: s.env.pam.jit,
        ariaLabel: 'Just-in-time elevation for finance-admin',
        onCheckedChange: function (v) {
          LabStore.setEnvPam({ jit: v })
          refreshPam()
        },
      })
      var jitRow = el('div', { class: 'pam-row' },
        el('label', { class: 'policy-cplx-label', for: 'pam-jit' },
          'Just-in-time elevation for finance-admin',
          el('span', { class: 'policy-cplx-sub font-mono', text: 'approval + 4-hour max checkout (M1026)' })),
        jit)

      var members = el('ul', { class: 'pam-members' })
      var faRole = ROLES.find(function (r) { return r.role === 'finance-admin' })
      faRole.members.forEach(function (u) {
        var cb = Bureau.Checkbox({
          id: 'pam-' + u,
          checked: s.env.pam.removed.indexOf(u) >= 0,
          ariaLabel: 'Remove standing approve-payments from ' + u,
          onCheckedChange: function (v) {
            var cur = LabStore.getState().env.pam.removed.slice()
            var has = cur.indexOf(u) >= 0
            if (v && !has) cur.push(u)
            if (!v && has) cur = cur.filter(function (x) { return x !== u })
            LabStore.setEnvPam({ removed: cur })
            refreshPam()
          },
        })
        members.appendChild(el('li', { class: 'member-row' }, cb,
          el('label', { class: 'review-label font-mono', for: 'pam-' + u },
            el('span', { class: 'review-user', text: u }), ' — remove standing approve-payments',
            el('span', { class: 'review-sub is-note', text: PAM_MEMBERSHIP_NOTE[u] }))))
      })
      var addSvc = Bureau.Checkbox({
        id: 'pam-addsvc',
        checked: s.env.pam.addSvc,
        ariaLabel: 'Proposed: add backup-svc to finance-admin',
        onCheckedChange: function (v) {
          LabStore.setEnvPam({ addSvc: v })
          refreshPam()
        },
      })
      members.appendChild(el('li', { class: 'member-row addsvc-row' }, addSvc,
        el('label', { class: 'review-label font-mono', for: 'pam-addsvc' },
          el('span', { class: 'review-user', text: 'Proposed by ops:' }), ' add backup-svc to finance-admin “so backups can read payment files”',
          el('span', { class: 'review-sub is-note', text: 'A service account in a payment-approval role — what could go wrong?' }))))

      var pamStatus = el('p', { class: 'pam-status font-mono', 'aria-live': 'polite' })
      var jitNote = el('p', { class: 'jit-note', hidden: !s.env.pam.jit },
        el('span', { class: 'jit-note-icon', html: icon('CheckCircle2', 16) }),
        el('span', { text: 'Time-boxed privilege is the model now: “finance-admin for four hours, with approval” replaces “finance-admin, always”.' }),
        el('span', { class: 'badge badge-jit font-mono', text: 'M1026 applied' }))
      function refreshPam() {
        var p = LabStore.getState().env.pam
        jitNote.hidden = !p.jit
        pamStatus.textContent = 'JIT ' + (p.jit ? 'ON' : 'off') +
          ' · removals: ' + (p.removed.length ? p.removed.join(', ') : 'none') +
          ' · backup-svc proposal ' + (p.addSvc ? 'accepted' : 'rejected')
      }
      refreshPam()

      root.appendChild(Bureau.BureauCard({
        icon: icon('UserCog', 20),
        title: 'Mandate — right-size finance-admin (PAM board)',
        ref_: 'OBJ-H8',
        subtitle: 'Standing privilege is the finding. Enable just-in-time elevation, remove standing approve-payments from members without documented need (justify by the record), keep the documented one, and reject the service-account shortcut.',
      }, el('div', {}, jitRow, members, pamStatus, Bureau.CheckStamp('OBJ-H8'), jitNote)))
    }

    return root
  }

  // ═══ AUDIT DESK ═════════════════════════════════════════════════════════════
  var ENTRY_TECHNIQUES = [
    { id: 'T1110.003', text: 'T1110.003 — Password Spraying' },
    { id: 'T1110.004', text: 'T1110.004 — Credential Stuffing' },
    { id: 'T1621', text: 'T1621 — MFA Request Generation' },
    { id: 'T1078', text: 'T1078 — Valid Accounts' },
    { id: 'T1558.003', text: 'T1558.003 — Kerberoasting' },
    { id: 'T1556.009', text: 'T1556.009 — Conditional Access Policies' },
  ]

  function AuditDesk() {
    var s = LabStore.getState()
    var mode = s.mode
    var root = stack()

    root.appendChild(Bureau.BureauCard({
      icon: icon('ScrollText', 20),
      title: 'The night ledger — authentication audit stream',
      subtitle: 'Identity provider + directory sign-in telemetry for 14 May 2025. Filter it like a detective: who, from where, how often.',
    }, el('div', {},
      Bureau.LedgerViewer(),
      el('p', { class: 'readers-aid font-mono', text: 'Reader’s aid — expected data sources (DS0002 User Account · DS0028 Logon Session): logon.success / logon.failure / mfa.push.sent / mfa.push.denied / mfa.push.approved / privilege.granted / permission.changed. Internal IPs are 10.x.x.x; anything else is outside the wire.' }))))

    if (mode === 'medium') {
      // OBJ-M6
      var pushInput = el('input', {
        id: 'push-count', class: 'bureau-input', inputmode: 'numeric',
        value: s.env.pushCount, placeholder: 'e.g. 8',
      })
      pushInput.addEventListener('input', function () {
        LabStore.patchEnv({ pushCount: pushInput.value })
      })
      root.appendChild(Bureau.BureauCard({
        icon: icon('Siren', 20),
        title: 'Ticket — count the push flood',
        ref_: 'OBJ-M6',
        subtitle: 'Filter the ledger to r.delgado’s morning. How many MFA pushes were SENT before one was approved — and what happened right after?',
      }, el('div', {},
        el('div', { class: 'push-grid' },
          el('div', {},
            el('label', { class: 'slider-label font-mono', for: 'push-count', text: 'Pushes sent before one was approved (number)' }),
            pushInput),
          Bureau.ChoiceRow({
            id: 'push-outcome',
            label: 'What happened immediately after the approval?',
            options: [
              { id: 'approved-then-success', text: 'A push was approved and sign-in succeeded from the unusual location' },
              { id: 'user-recovered', text: 'The user denied everything and signed in normally later' },
              { id: 'lockout', text: 'The account was locked out' },
              { id: 'nothing', text: 'Nothing — the attacker gave up' },
            ],
            value: s.env.pushOutcome,
            onChange: function (v) { LabStore.patchEnv({ pushOutcome: v }) },
          })),
        Bureau.CheckStamp('OBJ-M6'))))

      // OBJ-M7
      var sprayInput = el('input', {
        id: 'spray-count', class: 'bureau-input spray-count', inputmode: 'numeric',
        value: s.env.sprayCount, placeholder: 'count',
      })
      sprayInput.addEventListener('input', function () {
        LabStore.patchEnv({ sprayCount: sprayInput.value })
      })
      root.appendChild(Bureau.BureauCard({
        icon: icon('AlertOctagon', 20),
        title: 'Ticket — name the overnight spray',
        ref_: 'OBJ-M7',
        subtitle: 'The 04:10 block is one story. Name the pattern, the source IP, and the number of distinct usernames it touched.',
      }, el('div', {},
        el('div', { class: 'choice-stack' },
          Bureau.ChoiceRow({
            id: 'spray-pattern', label: 'Attack pattern',
            options: PATTERN_OPTIONS,
            value: s.env.sprayPattern,
            onChange: function (v) { LabStore.patchEnv({ sprayPattern: v }) },
          }),
          Bureau.ChoiceRow({
            id: 'spray-ip', label: 'Source IP',
            options: [
              { id: SPRAY_IP, text: SPRAY_IP + ' (external)' },
              { id: '198.51.100.23', text: '198.51.100.23 (external)' },
              { id: '10.9.2.15', text: '10.9.2.15 (internal)' },
              { id: '10.0.4.19', text: '10.0.4.19 (internal)' },
            ],
            value: s.env.sprayIp,
            onChange: function (v) { LabStore.patchEnv({ sprayIp: v }) },
          }),
          el('div', {},
            el('label', { class: 'slider-label font-mono', for: 'spray-count', text: 'Distinct usernames attempted' }),
            sprayInput)),
        Bureau.CheckStamp('OBJ-M7'))))

      // OBJ-M8
      var cards = el('div', { class: 'choice-stack' })
      PATTERN_CARDS.forEach(function (c) {
        cards.appendChild(el('div', { class: 'finding-card' },
          el('p', { class: 'card-label font-mono', text: c.label }),
          el('p', { class: 'finding-text', text: c.text }),
          el('div', { class: 'finding-select' },
            Bureau.ChoiceRow({
              id: 'pm-' + c.id,
              label: el('span', { class: 'mitre-label font-mono', text: 'attack' }),
              options: PATTERN_OPTIONS,
              value: s.env.patternMatch[c.id] || '',
              onChange: function (v) {
                var pm = Object.assign({}, LabStore.getState().env.patternMatch)
                pm[c.id] = v
                LabStore.patchEnv({ patternMatch: pm })
              },
              compact: true,
            }))))
      })
      root.appendChild(Bureau.BureauCard({
        icon: icon('Filter', 20),
        title: 'Ticket — match the four pattern cards',
        ref_: 'OBJ-M8',
        subtitle: 'Four excerpts, four attacks. Learn the shapes once and tickets route themselves.',
      }, el('div', {}, cards, Bureau.CheckStamp('OBJ-M8'))))
    }

    if (mode === 'hard') {
      // OBJ-H1
      var aaaRows = el('div', { class: 'choice-stack' })
      AAA_ITEMS.forEach(function (e) {
        aaaRows.appendChild(Bureau.ChoiceRow({
          id: 'aaa-' + e.id,
          label: e.label,
          options: AAA_OPTIONS,
          value: s.env.aaaTags[e.id] || '',
          onChange: function (v) {
            var tags = Object.assign({}, LabStore.getState().env.aaaTags)
            tags[e.id] = v
            LabStore.patchEnv({ aaaTags: tags })
          },
        }))
      })
      root.appendChild(Bureau.BureauCard({
        icon: icon('Workflow', 20),
        title: 'Mandate — tag the AAA sequence',
        ref_: 'OBJ-H1',
        subtitle: 'Tag each event in the intruder’s timeline with the “A” it demonstrates. Tag the event itself, not its subject.',
      }, el('div', {}, aaaRows, Bureau.CheckStamp('OBJ-H1'))))

      // OBJ-H2
      root.appendChild(Bureau.BureauCard({
        icon: icon('Siren', 20),
        title: 'Mandate — find the intruder',
        ref_: 'OBJ-H2',
        subtitle: 'The ledger contains red herrings (a scheduled job, a demo account, someone’s typos). Name the compromised account, the entry technique (exact MITRE ID), and the technique demonstrated once inside (exact MITRE ID).',
      }, el('div', {},
        el('div', { class: 'choice-stack' },
          Bureau.ChoiceRow({
            id: 'intr-account', label: 'Compromised account',
            options: ['r.delgado', 'j.okafor', 'l.chen', 'b.talbot', 'backup-svc', 'mkt-test-01', 'e.graves']
              .map(function (u) { return { id: u, text: u } }),
            value: s.env.intrusion.account,
            onChange: function (v) { LabStore.setEnvIntrusion({ account: v }) },
          }),
          Bureau.ChoiceRow({
            id: 'intr-entry', label: 'Technique used to GET IN',
            options: ENTRY_TECHNIQUES,
            value: s.env.intrusion.entry,
            onChange: function (v) { LabStore.setEnvIntrusion({ entry: v }) },
          }),
          Bureau.ChoiceRow({
            id: 'intr-inside', label: 'Technique demonstrated ONCE INSIDE',
            options: ENTRY_TECHNIQUES,
            value: s.env.intrusion.inside,
            onChange: function (v) { LabStore.setEnvIntrusion({ inside: v }) },
          })),
        Bureau.CheckStamp('OBJ-H2'))))

      // OBJ-H3
      var thresholdInput = el('input', {
        id: 'rule-threshold', class: 'bureau-input', inputmode: 'numeric',
        value: s.env.rule.threshold, placeholder: 'e.g. 5',
      })
      thresholdInput.addEventListener('input', function () {
        LabStore.setEnvRule({ threshold: thresholdInput.value })
      })
      var exclRows = el('div', { class: 'excl-rows' })
      RULE_EXCLUSION_OPTIONS.forEach(function (x) {
        var cb = Bureau.Checkbox({
          id: 'excl-' + x.id,
          checked: s.env.rule.exclusions.indexOf(x.id) >= 0,
          ariaLabel: 'Exclude ' + x.text,
          onCheckedChange: function (v) {
            var cur = LabStore.getState().env.rule.exclusions.slice()
            var has = cur.indexOf(x.id) >= 0
            if (v && !has) cur.push(x.id)
            if (!v && has) cur = cur.filter(function (e2) { return e2 !== x.id })
            LabStore.setEnvRule({ exclusions: cur })
          },
        })
        exclRows.appendChild(el('span', { class: 'excl-item' }, cb,
          el('label', { class: 'review-label font-mono', for: 'excl-' + x.id, text: x.text })))
      })
      root.appendChild(Bureau.BureauCard({
        icon: icon('Workflow', 20),
        title: 'Mandate — build the spray detector',
        ref_: 'OBJ-H3',
        subtitle: 'Detection engineering: the overnight block (' + SPRAY_USERNAMES_HIT + ' usernames, one source) must page in minutes. Assemble the rule: data source, aggregation, threshold 5–10 distinct usernames, window ≤ 10 minutes, and exclude EXACTLY one documented noisy account.',
      }, el('div', {},
        el('div', { class: 'choice-stack' },
          Bureau.ChoiceRow({
            id: 'rule-source', label: 'Data source', options: RULE_SOURCES,
            value: s.env.rule.source,
            onChange: function (v) { LabStore.setEnvRule({ source: v }) },
          }),
          Bureau.ChoiceRow({
            id: 'rule-agg', label: 'Aggregation', options: RULE_AGGREGATIONS,
            value: s.env.rule.aggregation,
            onChange: function (v) { LabStore.setEnvRule({ aggregation: v }) },
          }),
          el('div', { class: 'rule-grid' },
            el('div', {},
              el('label', { class: 'slider-label font-mono', for: 'rule-threshold', text: 'Threshold (distinct usernames)' }),
              thresholdInput),
            Bureau.ChoiceRow({
              id: 'rule-window', label: 'Time window',
              options: [{ id: '5', text: '5 minutes' }, { id: '10', text: '10 minutes' }, { id: '30', text: '30 minutes' }, { id: '60', text: '60 minutes' }],
              value: s.env.rule.window,
              onChange: function (v) { LabStore.setEnvRule({ window: v }) },
              compact: true,
            })),
          el('fieldset', { class: 'fieldset' },
            el('legend', { class: 'font-mono', text: 'Narrow exclusions (choose carefully)' }),
            exclRows)),
        Bureau.CheckStamp('OBJ-H3'))))

      // OBJ-H4
      var tpfpCards = el('div', { class: 'choice-stack' })
      TPFP_ITEMS.forEach(function (t, i) {
        tpfpCards.appendChild(el('div', { class: 'finding-card' },
          el('p', { class: 'finding-text' },
            el('span', { class: 'tp-num font-mono', text: '#' + (i + 1) }),
            t.text),
          Bureau.RadioGroup({
            className: 'as-flex',
            ariaLabel: 'Verdict for excerpt ' + (i + 1),
            value: s.env.tpfp[t.id] === undefined ? '' : (s.env.tpfp[t.id] ? 'tp' : 'fp'),
            onValueChange: function (v) {
              var cur = Object.assign({}, LabStore.getState().env.tpfp)
              cur[t.id] = v === 'tp'
              LabStore.patchEnv({ tpfp: cur })
            },
            items: [
              { value: 'tp', id: t.id + '-tp', node: el('label', { class: 'tp-label tp-yes font-mono', for: t.id + '-tp', text: 'TRUE POSITIVE' }) },
              { value: 'fp', id: t.id + '-fp', node: el('label', { class: 'tp-label tp-no font-mono', for: t.id + '-fp', text: 'FALSE POSITIVE' }) },
            ],
          })))
      })
      root.appendChild(Bureau.BureauCard({
        icon: icon('Filter', 20),
        title: 'Mandate — true positive or false positive?',
        ref_: 'OBJ-H4',
        subtitle: 'Six excerpts, six verdicts, all six must be right. Adjudication is where detection engineering earns its salary.',
      }, el('div', {}, tpfpCards, Bureau.CheckStamp('OBJ-H4'))))
    }

    return root
  }

  // ═══ FEDERATION DESK (wire room) ════════════════════════════════════════════
  function FederationDesk() {
    var s = LabStore.getState()
    var isMedium = s.mode === 'medium'
    var root = stack()

    function wireNode(nodeName, host, iconHtml, isIdp) {
      var node = el('div', { class: 'wire-node' },
        el('span', { class: 'wire-node-icon', html: iconHtml }),
        el('p', { class: 'wire-node-name font-serif', text: nodeName }),
        el('p', { class: 'wire-node-host font-mono', text: host }))
      var key = isIdp ? 'bureau-idp' : 'payroll-app'
      var role = isIdp ? 'idp' : 'sp'
      var roleText = isIdp ? '✓ Identity Provider' : '✓ Service Provider'
      var staticText = isIdp ? 'Identity Provider' : 'Service Provider'
      if (isMedium) {
        var labelBtn = el('button', {
          type: 'button',
          class: 'label-btn font-mono' + (s.env.ssoRoles[key] === role ? ' is-on' : ''),
          text: s.env.ssoRoles[key] === role ? roleText : 'label me',
          'aria-pressed': s.env.ssoRoles[key] === role ? 'true' : 'false',
        })
        labelBtn.addEventListener('click', function () {
          var roles = Object.assign({}, LabStore.getState().env.ssoRoles)
          roles[key] = roles[key] === role ? '' : role
          LabStore.patchEnv({ ssoRoles: roles })
          var on = LabStore.getState().env.ssoRoles[key] === role
          labelBtn.classList.toggle('is-on', on)
          labelBtn.setAttribute('aria-pressed', on ? 'true' : 'false')
          labelBtn.textContent = on ? roleText : 'label me'
        })
        node.appendChild(el('div', { class: 'wire-node-label' }, labelBtn))
      } else {
        node.appendChild(el('div', { class: 'wire-node-label' },
          el('p', { class: 'wire-label-static font-mono', text: staticText })))
      }
      return node
    }

    var wireRow = el('div', { class: 'wire-row' },
      wireNode('Bureau IdP', 'idp.bureaulab.example', icon('Network', 24), true),
      el('div', { class: 'wire-arrow' },
        el('span', { class: 'wire-arrow-word font-mono', text: 'signed assertion' }),
        el('span', { class: 'wire-arrow-glyph font-mono', 'aria-hidden': 'true', text: '⟶' }),
        el('span', { class: 'wire-arrow-word font-mono', text: 'SAML 2.0' })),
      wireNode('Payroll Suite', 'payroll.bureaulab.example', icon('Cable', 24), false))

    var wireCard = Bureau.BureauCard({
      icon: icon('RadioTower', 20),
      title: 'The wire room — one login, many doors',
      subtitle: 'Federation: the Bureau IdP authenticates once; wired applications (service providers) trust the signed assertion. SAML = XML assertions · OAuth 2.0 = delegated authorization · OIDC = identity layer on OAuth 2.0.',
    }, wireRow)

    if (isMedium) {
      var ssoFs = el('fieldset', { class: 'sso-fieldset' },
        el('legend', { class: 'font-mono', text: 'Which statement correctly describes SSO?' }))
      var ssoGroup = Bureau.RadioGroup({
        className: 'as-stack sso-stack',
        ariaLabel: 'SSO statement',
        value: s.env.ssoStatement,
        onValueChange: function (v) { LabStore.patchEnv({ ssoStatement: v }) },
        items: SSO_STATEMENT_OPTIONS.map(function (o) {
          return {
            value: o.id, id: 'sso-' + o.id,
            node: el('label', { class: 'radio-label sso-radio-label', for: 'sso-' + o.id, text: o.text }),
          }
        }),
      })
      ssoFs.appendChild(ssoGroup)
      wireCard.querySelector('.bureau-card-body').appendChild(ssoFs)
      wireCard.querySelector('.bureau-card-body').appendChild(Bureau.CheckStamp('OBJ-M3'))
    }
    root.appendChild(wireCard)

    if (!isMedium) {
      var rows = el('ul', { class: 'config-rows' })
      var flagCount = el('p', { class: 'flag-count font-mono', 'aria-live': 'polite' })
      function refreshCount() {
        var flags = LabStore.getState().env.fedFlags
        flagCount.textContent = 'flagged: ' + (flags.length ? flags.join(', ') : 'none') + ' (' + flags.length + '/2 expected)'
      }
      FED_CONFIG.forEach(function (row) {
        var li = el('li', { class: 'config-row' + (s.env.fedFlags.indexOf(row.id) >= 0 ? ' is-flagged' : '') })
        li.appendChild(el('span', { class: 'config-main' },
          el('span', { class: 'config-label', text: row.label }),
          el('span', { class: 'config-value font-mono' + (row.isFlag ? ' is-bad' : ''), text: row.value })))
        var toggle = Bureau.FlagToggle(s.env.fedFlags.indexOf(row.id) >= 0, function () {
          var cur = LabStore.getState().env.fedFlags.slice()
          var has = cur.indexOf(row.id) >= 0
          if (has) cur = cur.filter(function (x) { return x !== row.id })
          else cur.push(row.id)
          LabStore.patchEnv({ fedFlags: cur })
          var on = !has
          li.classList.toggle('is-flagged', on)
          toggle.__setOn(on)
          refreshCount()
        }, 'flag line')
        li.appendChild(toggle)
        rows.appendChild(li)
      })
      refreshCount()
      root.appendChild(Bureau.BureauCard({
        icon: icon('Cable', 20),
        title: 'Mandate — audit the SAML configuration',
        ref_: 'OBJ-H7',
        subtitle: 'Flag EXACTLY the two configuration errors. Over-flagging fails the audit — precision is the job.',
      }, el('div', {}, rows, flagCount, Bureau.CheckStamp('OBJ-H7'))))
    }

    return root
  }

  window.BureauDesks = {
    FieldManual: FieldManual,
    IdentityDesk: IdentityDesk,
    AuthDesk: AuthDesk,
    AccessDesk: AccessDesk,
    AuditDesk: AuditDesk,
    FederationDesk: FederationDesk,
  }
})()
