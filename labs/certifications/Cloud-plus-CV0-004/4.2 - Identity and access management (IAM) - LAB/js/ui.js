// ============================================================================
// UI renderers — template functions mirroring the original React components:
//   intro.tsx (ModeSelect, Briefing, KnowledgeCore), console.tsx (HUD, grid),
//   directory.tsx, tabs.tsx (six workbench tabs), simulator.tsx,
//   objectives.tsx (drawer, ring, pillars, stars), overlays.tsx (quiz,
//   completion, glossary, reset), ui-bits.tsx (atoms).
// Pure functions of (LabStore state + transient UI state) → HTML strings.
// Transient UI state lives in LabUIState (module below); app.js wires events.
// ============================================================================
'use strict';

window.LabUIState = {
  tab: 'policies',
  objOpen: false,
  glossOpen: false,
  quizOpen: false,
  compOpen: false,
  resetOpen: false,
  overlay: 'none', // 'none' | 'brief' | 'concepts'
  dirOpen: false,
  attachPick: {},
  sim: { principal: 'role-devops', action: 'store:object:Get', resource: 'payroll-export/summary.csv', ip: window.LAB_DATA.SIM_IPS[0], mfa: true, result: null },
  gk: { user: 'alex.kim', ip: '10.0.4.12 (corporate HQ)', mfa: false, protocol: 'modern' },
  onlyFlagged: false,
  openIdentity: null,
  glossQuery: '',
  completionShown: false,
};

window.LabUI = (function () {
  const D = window.LAB_DATA;
  const E = window.LAB_ENGINE;
  const ICONS = window.LAB_ICONS;

  // --- atoms -----------------------------------------------------------------
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function icon(name, cls) {
    return `<svg class="icon ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }

  const PILLAR_CLS = { Understand: 'pillar-understand', Recognize: 'pillar-recognize', Detect: 'pillar-detect', Mitigate: 'pillar-mitigate' };
  function pillarBadge(pillar) {
    return `<span class="badge ${PILLAR_CLS[pillar] || ''}" style="font-size:11px;font-weight:600;">${esc(pillar)}</span>`;
  }

  function verdictChip(verdict) {
    const label = verdict === 'allowed' ? 'ALLOW' : verdict === 'deny-explicit' ? 'DENY (explicit)' : 'DENY (implicit)';
    return `<span class="verdict-chip verdict-${verdict}" role="status">${label}</span>`;
  }

  function loginVerdictChip(verdict) {
    const cls = verdict === 'allowed' ? 'verdict-allowed' : 'verdict-deny-explicit';
    const label = verdict === 'allowed' ? 'ALLOWED' : verdict.replace('blocked-', 'BLOCKED: ').replace(/-/g, ' ').toUpperCase();
    return `<span class="verdict-chip ${cls}" role="status">${esc(label)}</span>`;
  }

  function noteBox(children, tone) {
    return `<div class="note-box ${tone === 'warn' ? 'note-box-warn' : ''}" role="note">${icon('info')}<span>${children}</span></div>`;
  }

  function sectionTitle(title, sub) {
    return `<div class="section-title"><h3>${title}</h3>${sub ? `<p class="sub">${sub}</p>` : ''}</div>`;
  }

  function termBtn(t, children) {
    return `<button type="button" class="term-btn" data-action="term" data-term="${esc(t)}">${children || esc(t)}</button>`;
  }

  function selectHtml(attrs, options, value, placeholder) {
    const norm = (o) => Array.isArray(o) ? { value: o[0], label: o[1] } : (typeof o === 'object' && o !== null ? o : { value: o, label: o });
    const opts = placeholder ? [`<option value="" ${!value ? 'selected' : ''} disabled>${esc(placeholder)}</option>`] : [];
    for (const raw of options) {
      const o = norm(raw);
      opts.push(`<option value="${esc(o.value)}" ${String(value) === String(o.value) ? 'selected' : ''}>${esc(o.label)}</option>`);
    }
    return `<select ${attrs}>${opts.join('')}</select>`;
  }

  function radioInput(group, value, checked, extra) {
    return `<input type="radio" class="radio ${extra || ''}" name="${esc(group)}" value="${esc(value)}" data-radio="${esc(group)}" ${checked ? 'checked' : ''} />`;
  }

  function switchInput(action, key, checked, label, extra) {
    return `<span class="switch"><input type="checkbox" role="switch" ${checked ? 'checked' : ''} data-action="${action}" data-key="${esc(key)}" aria-label="${esc(label)}" ${extra || ''} /></span>`;
  }

  // --- Stage: mode select ------------------------------------------------------
  function renderModeSelect() {
    const card = (mode, title, iconName, points, cta, tone) => `
      <div class="mode-card ${tone}">
        <div class="mode-card-top">
          <span class="mode-icon ${tone}" aria-hidden="true">${icon(iconName)}</span>
          <div>
            <span class="badge" style="font-size:.75rem;">${tone === 'rose' ? 'HARD · analyze/evaluate/create' : 'MEDIUM · understand/apply'}</span>
            <h2>${esc(title)}</h2>
          </div>
        </div>
        <ul class="mode-points">${points.map((p) => `<li>${icon('chevron-right', tone)} ${esc(p)}</li>`).join('')}</ul>
        <button class="btn btn-block ${tone === 'rose' ? 'btn-rose' : 'btn-primary'}" style="font-weight:600;" data-action="mode" data-mode="${mode}">${esc(cta)}</button>
      </div>`;
    return `
      <div class="mode-screen">
        <div class="mode-inner">
          <div class="mode-head">
            <div style="margin-bottom:1rem;"><span class="badge-pill-round">${icon('key-round')} SYNTHETIC TRAINING DATA — fictional identities, keys and events</span></div>
            <h1>Identity Control Plane</h1>
            <p>An interactive practice lab for <strong>CompTIA Cloud+ CV0-004 · Lesson 4.2 — Identity and Access Management</strong> (exam objective 4.3: implement IAM to control resource access).</p>
          </div>
          <div class="mode-grid">
            ${card('medium', 'Guided Hardening Sprint', 'graduation-cap', ['12 guided objectives, in learning order', '“Where to look” links jump you to the evidence', 'Three-tier hints, forgiving validation', 'Quiz after practice — every check explains why'], 'Start learning', 'teal')}
            ${card('hard', 'Breach Simulation', 'swords', ['9 broad, multi-step objectives', 'Noisy audit trail with two red herrings', 'No pointers · at most one nudge, costs rating', 'Strict exact-value validation'], 'Enter the breach', 'rose')}
          </div>
          <p class="mode-foot">Both modes share the same console. Your progress auto-saves in this browser.</p>
        </div>
      </div>`;
  }

  // --- Stage: briefing (C1) ------------------------------------------------------
  function renderBriefing(onDone) {
    return `
      <div class="overlay-shell">
        <div class="overlay-inner">
          <div class="overlay-head">
            <span class="overlay-head-icon" aria-hidden="true">${icon('clipboard-list')}</span>
            <h1>Mission briefing — the Larkspur audit</h1>
          </div>
          <div class="brief-prose">
            <p><strong>${esc(D.ORG.company)}</strong>, an online retailer, runs its workloads on <strong>${esc(D.ORG.cloud)}</strong>. Last month an internal audit of the Identity and Access Management configuration returned findings the platform team must fix <em>this sprint</em> — and tonight the audit trail recorded something worse.</p>
            <div class="finding-card">
              <p class="head">${icon('shield-alert', 'head-amber')} Audit findings on your desk</p>
              <ol>
                <li>A <strong>contractor</strong> from a two-week July engagement still holds the platform-admin role.</li>
                <li>The <strong>DevOps role policy allows <code class="inline-code">store:*</code> on <code class="inline-code">*</code></strong> — it can read the payroll bucket and delete anything.</li>
                <li>Console sign-ins rely on <strong>passwords only</strong> — no MFA, no conditional access.</li>
                <li>Offboarding is broken: a <strong>departed employee</strong> is still active with a live API key.</li>
              </ol>
            </div>
            <p>You are the new <strong>IAM administrator</strong>. Your job is exactly what Cloud+ CV0-004 objective 4.3 says: <em>“Given a scenario, implement identity and access management.”</em> You will repair policies, enforce MFA and conditional access, offboard and rotate, read the audit trail like an analyst — and contain a live incident.</p>
            ${noteBox(`Everything here is <strong>simulated and labeled</strong>: ${esc(D.ORG.company)} does not exist, the console is a training replica, and every log line is synthetic. Nothing you do here touches a real cloud.`, 'warn')}
            <p class="small-muted">Vendor neutrality note: Cloud+ is platform-agnostic, so this lab simulates a generic cloud (“${esc(D.ORG.cloud)}”) rather than naming AWS, Azure or Google Cloud products.</p>
          </div>
          <div class="overlay-foot">
            <button class="btn btn-primary" style="font-weight:600;" data-action="stage" data-stage="${onDone ? 'console' : 'knowledge'}" data-fk="brief-continue">${onDone ? 'Back to the console →' : 'Open the concept deck →'}</button>
          </div>
        </div>
      </div>`;
  }

  // --- Stage: knowledge core (C2) -------------------------------------------------
  function aaaCard() {
    const st = window.LabStore.getState();
    const env = st.env;
    const placed = env.aaaOrder;
    const remaining = D.AAA_STAGES.filter((s) => !placed.includes(s.id));
    const slots = [0, 1, 2, 3].map((i) => {
      const stage = D.AAA_STAGES.find((s) => s.id === placed[i]);
      return `<div class="aaa-slot ${stage ? 'filled' : ''}">
        <span class="num">${i + 1}</span>
        <span class="name">${stage ? esc(stage.name) : '—'}</span>
      </div>`;
    }).join('');
    return `
      <div class="kcard" style="border:2px solid var(--teal-200);">
        ${sectionTitle('The request pipeline (AAA)', 'OBJ-M1 · Click the four stages in the order a request experiences them, then answer the record question.')}
        <div class="aaa-slots" aria-label="AAA pipeline slots">${slots}</div>
        <div class="aaa-picks">
          ${remaining.map((s) => `<button class="aaa-pick" data-action="aaa-pick" data-id="${s.id}" data-fk="aaa-${s.id}">${esc(s.name)}</button>`).join('')}
          <button class="btn btn-outline" data-action="aaa-reset">${icon('rotate-ccw')} Reset</button>
        </div>
        <p class="aaa-hint">${placed.length === 4 ? esc(D.AAA_STAGES.find((s) => s.id === placed[3]).desc) : 'Four slots, four stages. What happens first?'}</p>
        <div class="radio-col">
          <p class="q">Which stage produces the audit-trail record (“who did what, when, from where”)?</p>
          ${D.AAA_STAGES.map((s) => `<label class="radio-row">${radioInput('aaaRecordQ', s.id, env.aaaRecordQ === s.id)} ${esc(s.name)}</label>`).join('')}
        </div>
      </div>`;
  }

  function factorCard() {
    const env = window.LabStore.getState().env;
    const rows = D.FACTOR_ITEMS.map((f) => `
      <div class="factor-row">
        <span class="label">${esc(f.label)}</span>
        ${selectHtml(`class="select select-w-36" style="flex-shrink:0;" aria-label="Factor category for ${esc(f.label)}" data-select="factor" data-key="${f.id}" data-fk="factor-${f.id}"`,
        [['know', 'something you know'], ['have', 'something you have'], ['are', 'something you are']], env.factorAssign[f.id] || '', 'category')}
      </div>`).join('');
    return `
      <div class="kcard" style="border:2px solid var(--amber-200);">
        ${sectionTitle('Authentication factors', 'OBJ-M2 · Classify each credential into its factor category. MFA needs DIFFERENT categories combined.')}
        <div class="factor-grid">${rows}</div>
      </div>`;
  }

  function authzCard() {
    const env = window.LabStore.getState().env;
    const rows = D.AUTHZ_SCENARIOS.map((s) => `
      <div class="authz-row factor-row">
        <span class="text">${esc(s.text)}</span>
        ${selectHtml(`class="select select-w-28" style="flex-shrink:0;" aria-label="Authorization model" data-select="authz" data-key="${s.id}" data-fk="authz-${s.id}"`,
        ['RBAC', 'GBAC', 'DAC'], env.authzMatch[s.id] || '', 'model')}
      </div>`).join('');
    return `
      <div class="kcard" style="border:2px solid var(--amber-200);">
        ${sectionTitle('Authorization models', 'OBJ-M6 · RBAC grants by assigned role, GBAC by group membership, DAC by owner discretion.')}
        <div style="display:flex;flex-direction:column;gap:.75rem;">${rows}</div>
        <p class="tip-line">${icon('lightbulb')} Cloud+ wording: role-based, group-based, and discretionary access control — plus OAuth scopes for delegated authorization.</p>
      </div>`;
  }

  function kSection(iconName, title, body) {
    return `<div class="kcard"><div class="kcard-head">${icon(iconName)}<h3>${title}</h3></div>${body}</div>`;
  }

  function renderKnowledge(onDone) {
    return `
      <div class="overlay-shell">
        <div class="overlay-inner">
          <div class="overlay-head">
            <span class="overlay-head-icon" aria-hidden="true">${icon('book-open')}</span>
            <h1>Concept deck — what you must know before touching the console</h1>
          </div>
          <div class="knowledge-body">
            ${aaaCard()}
            ${factorCard()}
            ${kSection('cpu', 'Secure access: management plane &amp; data plane',
      `<p>Administrators reach a cloud through the <strong>web console</strong>, <strong>CLI</strong>, or <strong>APIs/SDKs</strong> — the management plane. Each path is authenticated: passwords + MFA for humans, ${termBtn('Service account & API key', 'API keys and tokens')} for programs. Servers are reached with <strong>SSH keys</strong> (never passwords) or <strong>RDP</strong>, ideally through a <strong>bastion host</strong> with IP restrictions. Same identity plumbing, different doors.</p>`)}
            ${kSection('folder-key', 'Federation, SSO &amp; the protocol trio',
      `<p>Instead of local users, organizations ${termBtn('Federation & SSO', 'federate')}: the corporate ${termBtn('Identity provider (IdP)', 'IdP')} authenticates employees and vouches for them to the cloud console. <strong>SAML</strong> carries signed XML assertions (enterprise SSO), <strong>OAuth 2.0</strong> delegates authorization with scoped tokens, and <strong>OpenID Connect</strong> adds authentication on top of OAuth. The Federation tab lets you walk the handshake.</p>`)}
            ${authzCard()}
            ${kSection('swords', 'Policy anatomy &amp; evaluation order (the engine you will drive)',
      `<p>Policies are JSON documents with <code class="inline-code">Effect / Action / Resource</code> and optional <code class="inline-code">Condition</code>. Evaluation is deterministic: <strong>an explicit Deny always wins</strong> → otherwise any matching Allow grants → otherwise <strong>denied by default (implicit deny)</strong>. Least privilege means shrinking Actions and Resources until the job still runs — the wildcard <code class="inline-code">*</code> is how payroll leaks happen.</p>`)}
            ${kSection('user-cog', 'Non-human identities, lifecycle &amp; governance',
      `<p>${termBtn('Service account & API key', 'Service accounts')} run jobs unattended; their static keys must be rotated and vaulted. Humans follow the lifecycle: provision → use → <strong>review</strong> → offboard. Deprovisioning failures (keys outliving owners) and dormant accounts are the classic audit findings — hence quarterly <strong>access reviews</strong> and privileged-account management.</p>`)}
            ${kSection('shield-alert', 'How attackers abuse IAM (defensive view)',
      `<p>In MITRE ATT&amp;CK, using someone’s legitimate credentials is <strong>Valid Accounts (T1078)</strong>; stealing application tokens/keys is <strong>T1528</strong>; granting an account extra permissions to persist is <strong>Account Manipulation (T1098)</strong>. Everything you implement in this lab exists to cut those paths.</p>`)}
          </div>
          <div class="overlay-foot">
            <button class="btn btn-primary" style="font-weight:600;" data-action="stage" data-stage="${onDone ? 'console' : 'console'}" data-fk="knowledge-continue">${onDone ? 'Back to the console →' : 'Enter the console →'}</button>
          </div>
        </div>
      </div>`;
  }

  // --- Console: HUD -----------------------------------------------------------------
  function progressRing(done, total) {
    const pct = total ? done / total : 0;
    const r = 9;
    const c = 2 * Math.PI * r;
    return `<span class="ring-wrap"><svg width="28" height="28" viewBox="0 0 28 28" role="img" aria-label="Objectives ${done} of ${total}">
      <circle cx="14" cy="14" r="${r}" fill="none" stroke="#E7E5E4" stroke-width="4"></circle>
      <circle cx="14" cy="14" r="${r}" fill="none" stroke="${pct === 1 ? '#059669' : '#0F766E'}" stroke-width="4" stroke-dasharray="${c * pct} ${c}" stroke-linecap="round" transform="rotate(-90 14 14)"></circle>
      <text x="14" y="18" text-anchor="middle" font-size="9" font-weight="700" fill="#1C1917">${total ? Math.round(pct * 100) : 0}</text>
    </svg></span>`;
  }

  function modeBadge(mode) {
    return `<span class="badge mode-badge ${mode === 'hard' ? 'mode-badge-hard' : 'mode-badge-medium'}">${mode === 'hard' ? 'HARD · Breach Simulation' : 'MEDIUM · Hardening Sprint'}</span>`;
  }

  function starsHtml(n) {
    return `<div class="stars" role="img" aria-label="${n} of 3 stars">${[1, 2, 3].map((i) => `<span class="star ${i <= n ? 'on' : ''}">★</span>`).join('')}</div>`;
  }

  function renderHud(mode) {
    const st = window.LabStore.getState();
    const defs = E.objectivesFor(mode);
    const done = defs.filter((o) => st.objectiveState[o.id] && st.objectiveState[o.id].done).length;
    const score = E.computeScore({ mode, objectiveState: st.objectiveState, quizAnswers: st.quizAnswers, quizSubmitted: st.quizSubmitted });
    const eligible = done === defs.length && st.quizSubmitted;
    return `
      <header class="hud">
        <div class="hud-row">
          <span class="hud-logo" aria-hidden="true">${icon('key-round')}</span>
          <div style="margin-right:.25rem;">
            <p class="hud-title">Identity Control Plane</p>
            <p class="hud-sub">Larkspur Retail Group · StratusForge Cloud · synthetic</p>
          </div>
          ${modeBadge(mode)}
          <div class="hud-actions">
            <span class="hud-chip obj-ring">${progressRing(done, defs.length)}<span>${done}/${defs.length} obj</span></span>
            <span class="hud-chip pts">${icon('trophy', 'trophy')} ${score.done + score.quizCorrect}/${score.totalObj + score.quizTotal} pts</span>
            ${eligible ? `<button class="btn btn-amber" data-action="open-comp" aria-label="View completion results">${icon('trophy')} View results</button>` : ''}
            <button class="btn btn-primary" data-action="open-obj" aria-label="Open objectives (${done}/${defs.length} done)">${icon('clipboard-list')} Objectives</button>
            <button class="btn btn-outline" data-action="open-quiz" aria-label="Open knowledge check">${icon('graduation-cap', 'head-teal')} Quiz</button>
            <button class="btn btn-outline hud-btn-concepts" data-action="overlay-open" data-overlay="concepts" aria-label="Open concept deck">${icon('book-open-text', 'head-teal')} Concepts</button>
            <button class="btn btn-outline hud-btn-brief" data-action="overlay-open" data-overlay="brief" aria-label="Reopen mission briefing">${icon('file-text', '')}</button>
            <button class="btn btn-outline" data-action="open-gloss" aria-label="Open glossary">${icon('book-open-text', 'head-amber')}</button>
            <button class="btn btn-outline" data-action="open-reset">${icon('refresh-ccw')} Reset</button>
          </div>
        </div>
      </header>`;
  }

  // --- Directory panel -------------------------------------------------------------
  function renderDirectory(mode) {
    const st = window.LabStore.getState();
    const env = st.env;
    const users = D.IDENTITIES.filter((i) => i.type === 'user');
    const services = D.IDENTITIES.filter((i) => i.type === 'service');

    const userRow = (u) => {
      const status = env.identities[u.id];
      const isOpen = window.LabUIState.openIdentity === u.id;
      return `
        <li class="dir-item">
          <button class="dir-item-btn" data-action="dir-expand" data-id="${esc(u.id)}" aria-expanded="${isOpen}" data-fk="dir-${esc(u.id)}">
            <span class="dir-row">
              <span class="dir-id ${status === 'disabled' ? 'disabled' : ''}">${esc(u.id)}</span>
              ${u.hrFlag === 'departed' ? '<span class="badge badge-xs" style="border-color:var(--rose-300);color:var(--rose-800);">departed</span>' : ''}
              ${u.hrFlag === 'external' ? '<span class="badge badge-xs" style="border-color:var(--amber-300);color:var(--amber-900);">external</span>' : ''}
              <span class="dir-dot ${status === 'active' ? 'active' : 'disabled'}" aria-label="${status === 'active' ? 'active' : 'disabled'}"></span>
              ${icon('chevron-down', 'dir-chevron ' + (isOpen ? 'open' : ''))}
            </span>
          </button>
          ${isOpen ? `
          <div class="dir-detail">
            <p class="name-line"><strong>${esc(u.name)}</strong> · ${esc(u.dept)} · groups: ${esc(u.groups.join(', ')) || '—'}</p>
            <p>Last sign-in: <span class="dir-mono">${esc(u.lastSignIn)}</span></p>
            <p>${esc(u.note)}</p>
            <div class="flex gap-2">
              <button class="btn ${status === 'active' ? 'btn-outline' : 'btn-primary'}" data-action="identity-status" data-id="${esc(u.id)}">${status === 'active' ? 'Disable account' : 'Re-enable'}</button>
            </div>
          </div>` : ''}
        </li>`;
    };

    const serviceRow = (u) => {
      const status = env.identities[u.id];
      const isOpen = window.LabUIState.openIdentity === u.id;
      return `
        <li class="dir-item">
          <button class="dir-item-btn" data-action="dir-expand" data-id="${esc(u.id)}" aria-expanded="${isOpen}" data-fk="dir-${esc(u.id)}">
            <span class="dir-row">
              <span class="dir-id ${status === 'disabled' ? 'disabled' : ''}" style="${status === 'disabled' ? '' : 'color:var(--stone-800);'}">${esc(u.id)}</span>
              <span class="dir-dot ${status === 'active' ? 'active' : 'disabled'}" aria-label="${status === 'active' ? 'active' : 'disabled'}"></span>
              ${icon('chevron-down', 'dir-chevron ' + (isOpen ? 'open' : ''))}
            </span>
          </button>
          ${isOpen ? `
          <div class="dir-detail">
            <p class="name-line" style="color:var(--stone-800);">${esc(u.name)} · ${esc(u.dept)}</p>
            <p>${esc(u.note)}</p>
          </div>` : ''}
        </li>`;
    };

    const roleRows = D.ROLES.map((r) => {
      const attached = D.POLICIES.filter((p) => (env.attachments[p.id] || []).includes(r.id)).map((p) => p.name);
      return `<li class="role-line">
        <p class="role-id">${esc(r.id)}</p>
        <p class="role-desc">${esc(r.desc)}</p>
        <p class="role-policies">policies: ${attached.length ? attached.map((n) => `<span class="dir-mono">${esc(n)}</span>`).join(', ') : '—'}</p>
      </li>`;
    }).join('');

    const reviewQueue = mode === 'hard' ? `
      <section class="card card-2-rose">
        <header class="card-head" style="border-bottom-color:var(--rose-100);">
          ${icon('clipboard-check', 'head-rose')}
          <h2 class="card-title">Access review — Q4 recertification</h2>
        </header>
        <div style="padding:.75rem;display:flex;flex-direction:column;gap:.5rem;">
          ${noteBox(`Every identity must justify its access: <strong>keep</strong>, <strong>disable</strong>, or <strong>scope-down</strong>. This feeds OBJ-H7.`, 'warn')}
          ${D.REVIEW_QUEUE.map((r) => `
            <div class="factor-row" style="display:block;">
              <p class="dir-id">${esc(r.id)}</p>
              <p style="font-size:.75rem;color:var(--stone-600);margin-top:.125rem;">${esc(r.why)}</p>
              ${selectHtml(`class="select" style="width:100%;margin-top:.375rem;" aria-label="Decision for ${esc(r.id)}" data-select="rv" data-key="${esc(r.id)}" data-fk="rv-${esc(r.id)}"`,
        [['keep', 'Keep as-is'], ['disable', 'Disable'], ['scope', 'Scope-down']], env.review['rv:' + r.id] || '', 'decision')}
            </div>`).join('')}
        </div>
      </section>` : '';

    return `
      <aside class="dir-aside" aria-label="Identity directory">
        <section class="card">
          <header class="card-head">${icon('user-round', 'head-teal')}<h2 class="card-title">Users</h2><span class="card-count">${users.length}</span></header>
          <ul class="dir-list">${users.map(userRow).join('')}</ul>
        </section>
        <section class="card">
          <header class="card-head">${icon('bot', 'head-amber')}<h2 class="card-title">Service identities</h2><span class="card-count">${services.length}</span></header>
          <ul class="dir-list">${services.map(serviceRow).join('')}</ul>
        </section>
        <section class="card">
          <header class="card-head">${icon('key-round', 'head-teal')}<h2 class="card-title">Roles</h2></header>
          <ul class="roles-ul">${roleRows}</ul>
        </section>
        ${reviewQueue}
      </aside>`;
  }

  // --- Tab: Policies -----------------------------------------------------------------
  function renderPoliciesTab(mode) {
    const st = window.LabStore.getState();
    const env = st.env;
    const visible = D.POLICIES.filter((p) => !p.hardOnly || mode === 'hard');
    const cards = visible.map((p) => {
      const ok = E.parsePolicy(env.policies[p.id]).statements ? true : false;
      const attached = env.attachments[p.id] || [];
      const candidates = D.SIM_PRINCIPALS.filter((x) => !attached.includes(x));
      const pick = window.LabUIState.attachPick[p.id] || '';
      return `
        <section class="card" aria-label="Policy ${esc(p.name)}">
          <header class="card-head" style="display:block;">
            <div class="policy-head-top">
              ${icon('file-json', p.editable ? 'head-amber' : '')}
              <h3 class="policy-name">${esc(p.name)}</h3>
              ${p.editable ? '<span class="badge badge-xs" style="border-color:var(--amber-300);color:var(--amber-900);">editable</span>' : ''}
              <span class="badge badge-xs ${ok ? 'status-active' : 'status-revoked'}" data-pjson-badge="${esc(p.id)}">${ok ? 'valid JSON' : 'invalid JSON'}</span>
            </div>
            <p class="policy-desc">${esc(p.desc)}</p>
          </header>
          <div class="policy-body">
            <p class="policy-attach-label">${icon('link-2')} Attached to</p>
            <div class="attach-chips">
              ${attached.length === 0 ? '<span class="not-attached">not attached</span>' : ''}
              ${attached.map((pr) => `
                <span class="attach-chip">${esc(pr)}
                  <button data-action="detach" data-pid="${esc(p.id)}" data-principal="${esc(pr)}" aria-label="Detach ${esc(p.name)} from ${esc(pr)}" data-fk="detach-${esc(p.id)}-${esc(pr)}">${icon('unlink')}</button>
                </span>`).join('')}
            </div>
            <div class="attach-controls">
              ${selectHtml(`class="select select-w-52 mono" aria-label="Attach ${esc(p.name)} to principal" data-select="attach-pick" data-key="${esc(p.id)}" data-fk="attach-${esc(p.id)}"`,
        candidates, pick, 'choose principal…')}
              <button class="btn btn-outline" data-action="attach" data-pid="${esc(p.id)}" ${!pick ? 'disabled' : ''}>Attach</button>
            </div>
            ${p.editable
        ? `<textarea class="textarea" data-policy-editor="${esc(p.id)}" rows="9" aria-label="Policy JSON editor for ${esc(p.name)}" spellcheck="false" data-fk="editor-${esc(p.id)}">${esc(env.policies[p.id])}</textarea>`
        : `<pre class="policy-pre">${esc(env.policies[p.id])}</pre>`}
          </div>
        </section>`;
    }).join('');
    return `
      <div class="tab-stack">
        ${noteBox(`Policies are JSON. The engine evaluates: <strong>explicit Deny → matching Allow → implicit deny</strong>. Editing is live — the Simulator and every CHECK RESULTS read these documents. Detaching <code class="inline-code">pol-iam-full-access</code> from <code class="inline-code">svc-reporting</code> matters for containment.`)}
        ${cards}
      </div>`;
  }

  // --- Tab: Federation ------------------------------------------------------------------
  function renderFederationTab() {
    const env = window.LabStore.getState().env;
    const displayOrder = [1, 3, 0, 4, 2];
    const picked = env.samlOrder.map((t) => D.SAML_STEPS.indexOf(t)).filter((i) => i >= 0);
    const remaining = displayOrder.filter((i) => !picked.includes(i));
    const done = picked.length === D.SAML_STEPS.length;
    return `
      <div class="tab-stack">
        <div class="card card-pad">
          ${sectionTitle('SAML 2.0 federated sign-in — console ← corporate IdP', 'OBJ-M7 · Click the steps in the correct order — the user always starts at the console.')}
          <div class="ascii-diagram" aria-hidden="true"><span>[user] ──open console──▶ [StratusForge console · service provider]</span>
<span class="dim">                    │ SAML request                       ▲</span>
<span class="dim">                    ▼                                    │ signed SAML assertion</span>
<span>[corporate IdP ─ directory + MFA ────────────────┘]</span></div>
          <ol class="seq-list" aria-label="Ordered federation steps">
            ${picked.map((idx, pos) => `<li class="seq-item"><span class="n">${pos + 1}.</span> ${esc(D.SAML_STEPS[idx])}</li>`).join('')}
            ${!done ? '<li class="seq-placeholder">…next step</li>' : ''}
          </ol>
          <div class="seq-remaining">
            ${remaining.map((i) => `<button class="seq-pick" data-action="saml-pick" data-i="${i}" data-fk="saml-${i}">${esc(D.SAML_STEPS[i])}</button>`).join('')}
          </div>
          <button class="btn btn-outline" style="margin-top:.75rem;" data-action="saml-reset">${icon('rotate-ccw')} Reset order</button>
        </div>
        <div class="card card-pad">
          ${sectionTitle('SAML vs OAuth 2.0 vs OpenID Connect', 'OBJ-M7 · Match each statement to the protocol it describes.')}
          <div style="display:flex;flex-direction:column;gap:.75rem;">
            ${D.PROTOCOL_MATCH.map((pm) => `
              <div class="protocol-row factor-row">
                <span class="text" style="flex:1;">${esc(pm.text)}</span>
                ${selectHtml(`class="select select-w-36" aria-label="Protocol" data-select="protocol" data-key="${pm.id}" data-fk="proto-${pm.id}"`,
        ['SAML', 'OAuth 2.0', 'OIDC'], env.protocolMatch[pm.id] || '', 'protocol')}
              </div>`).join('')}
          </div>
          <p class="tip-line">Implementation notes: the console validates the assertion <em>signature</em> and <em>audience</em> before granting the session — a stale IdP signing certificate is the classic “SSO is down” cause. OAuth scopes bound what a third-party app may do; OIDC ID tokens say who signed in.</p>
        </div>
      </div>`;
  }

  // --- Tab: Gatekeeper ---------------------------------------------------------------------
  function renderGatekeeperTab() {
    const st = window.LabStore.getState();
    const env = st.env;
    const gk = window.LabUIState.gk;
    const toggles = [
      { key: 'mfaAdmins', label: 'Require MFA — Admins group', why: 'M1032: interactive admin access always challenged.' },
      { key: 'mfaFinance', label: 'Require MFA — Finance group', why: 'M1032: payroll-adjacent humans challenged.' },
      { key: 'mfaAll', label: 'Require MFA — ALL groups', why: 'Zero-trust default: every interactive sign-in.' },
      { key: 'blockLegacy', label: 'Block legacy authentication protocols', why: 'M1036: legacy protocols cannot carry MFA.' },
      { key: 'restrictCidr', label: 'Restrict sign-in to corporate range 10.0.0.0/16', why: 'M1036: unknown networks denied outright.' },
    ];
    const IPS = ['10.0.4.12 (corporate HQ)', '198.51.100.23 (unrecognized geo)', '203.0.113.44 (vendor office)'];
    return `
      <div class="tab-stack">
        <div class="card card-pad">
          ${sectionTitle('Conditional access rules', 'Conditional access evaluates signals before access is granted. Changes apply immediately to the test panel below.')}
          <div style="display:flex;flex-direction:column;gap:.5rem;">
            ${toggles.map((t) => `
              <div class="ca-row">
                <div>
                  <p class="label">${esc(t.label)}</p>
                  <p class="why">${esc(t.why)}</p>
                </div>
                ${switchInput('ca-toggle', t.key, env.ca[t.key], t.label, `data-fk="ca-${t.key}"`)}
              </div>`).join('')}
          </div>
        </div>
        <div class="card card-pad" aria-live="polite">
          ${sectionTitle('Sign-in test panel', 'Simulate an interactive console sign-in and observe the gate decision.')}
          <div class="test-grid four">
            <label class="field-label"><span>User</span>
              ${selectHtml('class="select mono" aria-label="Test user" data-select="gk-user"', ['alex.kim', 'priya.nair', 'dana.wells', 'carlos.mendes', 'minnie.alvarez'], gk.user)}
            </label>
            <label class="field-label"><span>Source IP</span>
              ${selectHtml('class="select mono" aria-label="Source IP" data-select="gk-ip"', IPS, gk.ip)}
            </label>
            <label class="field-label"><span>Protocol</span>
              ${selectHtml('class="select" aria-label="Protocol" data-select="gk-protocol"', [['modern', 'Modern (SAML/OIDC + MFA capable)'], ['legacy', 'Legacy (basic auth)']], gk.protocol)}
            </label>
            <div class="flex items-center" style="align-self:end;">
              <span class="mfa-field" style="padding-bottom:.25rem;">
                ${switchInput('gk-mfa', 'mfa', gk.mfa, 'MFA provided', 'data-fk="gk-mfa"')}
                <label style="font-size:.875rem;color:var(--stone-800);">MFA provided</label>
              </span>
            </div>
          </div>
          <button class="btn btn-primary" style="font-weight:600;" data-action="run-login-test">${icon('shield-alert')} Run test sign-in</button>
          <div class="login-runs">
            ${env.loginRuns.length === 0 ? '<p style="font-size:.75rem;color:var(--stone-500);">No tests recorded yet. Objectives that require verification read these records.</p>' : ''}
            ${env.loginRuns.map((r) => `
              <div class="login-run">
                <span class="dim">${esc(r.at)}</span>
                <span class="who">${esc(r.user)}</span>
                <span class="dim">${esc(r.ip.split(' ')[0])}</span>
                <span class="dim">MFA:${r.mfa ? 'yes' : 'no'}</span>
                <span class="dim">${esc(r.protocol)}</span>
                <span class="chip">${loginVerdictChip(r.verdict)}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  }

  // --- Tab: Keys & Secrets -------------------------------------------------------------------
  function ageOf(lastRotated) {
    if (lastRotated === 'never') return null;
    const then = new Date(lastRotated).getTime();
    const now = new Date('2026-11-05').getTime();
    return Math.max(0, Math.round((now - then) / 86400000));
  }

  function renderSecretsTab(mode) {
    const st = window.LabStore.getState();
    const env = st.env;
    const extra = Object.keys(env.keys).filter((k) => !D.KEY_SEEDS.some((s) => s.id === k));
    const allKeys = [
      ...D.KEY_SEEDS.map((k) => ({ id: k.id, owner: k.owner, created: k.created, lastRotated: k.lastRotated })),
      ...extra.map((k) => ({ id: k, owner: k.replace(/^key-/, '').replace(/-\d+$/, ''), created: '2026-11-05', lastRotated: '2026-11-05' })),
    ];
    const justifyOptions = [
      { id: 'rotate-first', t: 'Rotate first so jobs keep running; the leaked key stops working once rotation completes.' },
      { id: 'policy-first', t: 'Detach the admin policy first; permissions matter more than credentials during containment.' },
      { id: 'correct', t: 'Revoke first — it kills the credential everywhere; rotation then restores service safely.' },
    ];
    return `
      <div class="tab-stack">
        ${noteBox(`Static API keys are the service-account weak point: <strong>rotate on schedule, revoke on incident</strong>, and prefer vaulted/managed credentials. Objectives OBJ-M11 and OBJ-H5 read this vault.`)}
        <div class="card" style="overflow:hidden;">
          <header class="card-head">${icon('vault', 'head-amber')}<h3 class="card-title">Keys &amp; secrets vault</h3></header>
          <div class="table-scroll">
            <table class="lab-table">
              <caption class="sr-only">API keys with rotation status and actions</caption>
              <thead>
                <tr>
                  <th>Key ID</th><th>Owner</th><th>Created</th><th>Last rotated</th><th>Age</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${allKeys.map((k) => {
      const status = env.keys[k.id] || 'active';
      const age = ageOf(k.lastRotated);
      const ageCls = age === null ? 'age-bad' : age > 365 ? 'age-bad' : age > 90 ? 'age-warn' : 'age-ok';
      const showFresh = env.keys[k.id] === 'rotated' || (k.id.endsWith('-2') && env.keys[k.id] === 'active');
      return `<tr>
                    <td class="mono" style="color:var(--stone-800);">${esc(k.id)}</td>
                    <td class="mono" style="color:var(--stone-600);">${esc(k.owner)}</td>
                    <td style="color:var(--stone-600);">${esc(k.created)}</td>
                    <td style="color:var(--stone-600);">${showFresh ? '2026-11-05' : esc(k.lastRotated)}</td>
                    <td class="${ageCls}">${age === null ? 'never' : age + 'd'}</td>
                    <td><span class="badge badge-xs status-${status}">${status}</span></td>
                    <td><div class="key-actions">
                      <button class="btn btn-outline" ${status === 'rotated' ? 'disabled' : ''} data-action="key-act" data-kid="${esc(k.id)}" data-kind="rotate" data-fk="key-${esc(k.id)}-rotate">${status === 'revoked' ? 'Issue replacement' : 'Rotate'}</button>
                      <button class="btn btn-outline-rose" ${status === 'revoked' ? 'disabled' : ''} data-action="key-act" data-kid="${esc(k.id)}" data-kind="revoke" data-fk="key-${esc(k.id)}-revoke">Revoke</button>
                    </div></td>
                  </tr>`;
    }).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ${mode === 'hard' ? `
        <div class="card card-2-rose card-pad">
          ${sectionTitle('Containment justification', 'OBJ-H5 · Choose the containment rationale that explains WHY revoke precedes rotate.')}
          <div class="radio-col" style="gap:.5rem;">
            ${justifyOptions.map((o) => `
              <label class="justify-option">${radioInput('h5Justify', o.id, env.h5Justify === o.id, 'mt')} <span>${esc(o.t)}</span></label>`).join('')}
          </div>
        </div>` : ''}
      </div>`;
  }

  // --- Tab: Audit Trail -------------------------------------------------------------------------
  function renderAuditTab(mode) {
    const st = window.LabStore.getState();
    const env = st.env;
    const events = D.EVENTS.filter((e) => (mode === 'hard' ? true : !e.hardOnly)).filter((e) => (window.LabUIState.onlyFlagged ? env.flagged.includes(e.id) : true));

    const chainEvents = D.EVENTS.filter((e) => ['ev05', 'ev06', 'ev07', 'ev16'].includes(e.id));
    const chainDisplay = [2, 0, 3, 1];
    const chainPicked = env.h2Order;
    const chainRemaining = chainDisplay.map((idx) => chainEvents[idx]).filter((e) => !chainPicked.includes(e.id));

    return `
      <div class="tab-stack">
        ${noteBox(`This is the <strong>accounting</strong> stage made real: every request recorded with who/what/when/where. Flag the events that deserve an IAM alert (OBJ-M9) and read the rest as baseline. Expected noise is marked inline by the analysts’ comments.`)}
        <div class="card card-2-rose card-pad">
          ${sectionTitle('Incident triage', mode === 'medium' ? 'OBJ-M8 · Record your triage verdict here — exact identity, exact first malicious event.' : 'OBJ-H1 · Record your triage verdict — exact values, no partial credit.')}
          <div class="triage-grid ${mode === 'hard' ? 'three' : 'two'}">
            <label class="field-label"><span>Compromised identity</span>
              ${selectHtml('class="select mono" aria-label="Compromised identity" data-select="h1Identity" data-fk="h1Identity"',
        ['alex.kim', 'priya.nair', 'dana.wells', 'carlos.mendes', 'minnie.alvarez', 'svc-reporting', 'svc-nightly-ci'], env.h1Identity, 'select identity…')}
            </label>
            <label class="field-label"><span>First malicious event</span>
              ${selectHtml('class="select mono" aria-label="First malicious event" data-select="h1Event" data-fk="h1Event"',
        D.EVENTS.filter((e) => (mode === 'hard' ? true : !e.hardOnly)).map((e) => ({ value: e.id, label: `${e.id} · ${e.ts} · ${e.actor} · ${e.action}` })), env.h1Event, 'select event…')}
            </label>
            ${mode === 'hard' ? `
            <label class="field-label"><span>Entry vector</span>
              ${selectHtml('class="select" aria-label="Entry vector" data-select="h1Vector" data-fk="h1Vector"',
        [['brute-force', 'Brute-force password attack on the service'], ['leaked-key', 'Leaked static API key replayed'], ['insider', 'Malicious insider using the console'], ['saml-forgery', 'Forged SAML assertion against the IdP']], env.h1Vector, 'select vector…')}
            </label>` : ''}
          </div>
        </div>
        ${mode === 'hard' ? `
        <div class="card card-2-rose card-pad">
          ${sectionTitle('Attack-chain reconstruction', 'OBJ-H2 · Order the four attacker events chronologically, then map theft / use / escalation to their ATT&CK technique IDs.')}
          <ol class="seq-list" style="margin-bottom:.75rem;" aria-label="Ordered attack chain">
            ${chainPicked.map((id, pos) => {
      const e = chainEvents.find((x) => x.id === id);
      return `<li class="seq-item"><span class="n">${pos + 1}.</span> <span class="mono" style="font-size:.75rem;">${esc(e.ts)} · ${esc(e.action)} · ${esc(e.resource)}</span></li>`;
    }).join('')}
            ${chainPicked.length < 4 ? '<li class="seq-placeholder" style="padding:.375rem .75rem;">…next attacker action</li>' : ''}
          </ol>
          <div class="seq-remaining" style="margin-bottom:.75rem;">
            ${chainRemaining.map((e) => `<button class="seq-pick rose" style="font-family:var(--font-mono);font-size:.75rem;" data-action="chain-pick" data-id="${esc(e.id)}" data-fk="chain-${esc(e.id)}">${esc(e.ts)} · ${esc(e.action)} · ${esc(e.resource)} · ${esc(e.ip)}</button>`).join('')}
          </div>
          <button class="btn btn-outline" style="margin-bottom:.75rem;" data-action="chain-reset">${icon('rotate-ccw')} Reset chain</button>
          <div class="test-grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));">
            <label class="field-label"><span>Obtaining the key (theft)</span>
              ${selectHtml('class="select mono" aria-label="MITRE ID for key theft" data-select="h2Mitre-theft"', ['T1528', 'T1078', 'T1098'], env.h2Mitre.theft, 'M-ID…')}
            </label>
            <label class="field-label"><span>Using the stolen identity</span>
              ${selectHtml('class="select mono" aria-label="MITRE ID for identity use" data-select="h2Mitre-use"', ['T1528', 'T1078', 'T1098'], env.h2Mitre.use, 'M-ID…')}
            </label>
            <label class="field-label"><span>Self-granting admin permissions</span>
              ${selectHtml('class="select mono" aria-label="MITRE ID for escalation" data-select="h2Mitre-escalation"', ['T1528', 'T1078', 'T1098'], env.h2Mitre.escalation, 'M-ID…')}
            </label>
          </div>
        </div>` : ''}
        <div class="filter-row">
          <button class="btn ${window.LabUIState.onlyFlagged ? 'btn-primary' : 'btn-outline'}" data-action="audit-filter">${icon('filter')} ${window.LabUIState.onlyFlagged ? 'Showing flagged only' : 'Show all events'}</button>
          <span class="filter-count">${env.flagged.length} flagged</span>
        </div>
        <div class="card" style="overflow:hidden;">
          <div class="table-scroll">
            <table class="lab-table">
              <caption class="sr-only">Audit trail events</caption>
              <thead>
                <tr><th>Time</th><th>Identity</th><th>Action</th><th>Resource</th><th>Source</th><th>Flag</th></tr>
              </thead>
              <tbody>
                ${events.map((e) => {
      const flagged = env.flagged.includes(e.id);
      return `<tr class="${flagged ? 'flagged' : ''}" style="vertical-align:top;">
                    <td class="mono" style="color:var(--stone-600);white-space:nowrap;">${esc(e.ts)}</td>
                    <td class="mono" style="color:var(--stone-800);white-space:nowrap;">${esc(e.actor)}</td>
                    <td class="mono" style="color:var(--stone-800);">${esc(e.action)}</td>
                    <td class="mono" style="color:var(--stone-600);">${esc(e.resource)}</td>
                    <td style="color:var(--stone-600);white-space:nowrap;">${esc(e.ip)}<br /><span style="color:var(--stone-400);">${esc(e.geo)}</span></td>
                    <td>
                      <button class="flag-btn ${flagged ? 'on' : ''}" data-action="flag" data-id="${esc(e.id)}" aria-pressed="${flagged}" aria-label="${flagged ? 'Unflag' : 'Flag'} event ${esc(e.id)}" data-fk="flag-${esc(e.id)}">${icon('flag')}</button>
                    </td>
                  </tr>`;
    }).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ${events.some((e) => e.note) ? `
        <div class="annotate-card">
          <p class="annotate-head">${icon('scroll-text')} Analyst annotations on the visible trail</p>
          <ul class="annotate-list">
            ${events.filter((e) => e.note).map((e) => `<li><span class="who">${esc(e.ts)} · ${esc(e.actor)}</span> — ${esc(e.note)}</li>`).join('')}
          </ul>
        </div>` : ''}
      </div>`;
  }

  // --- Tab: Field Notes -----------------------------------------------------------------------------
  function renderFieldNotesTab(mode) {
    const st = window.LabStore.getState();
    const env = st.env;
    const residualOptions = [
      { id: 'mfa-covers', t: 'With MFA everywhere, leaked API keys are harmless.' },
      { id: 'lp-suffices', t: 'Least privilege removes the need for periodic access reviews entirely.' },
      { id: 'residual-keys', t: 'API-key access bypasses MFA — rotation and vaulting stay essential.' },
      { id: 'disable-suffices', t: 'Disabling accounts eliminates all risk from stolen credentials.' },
    ];
    return `
      <div class="tab-stack">
        <div class="card card-pad">
          ${sectionTitle('Detection playbook', 'Where accounting data becomes detection.')}
          <div class="table-scroll">
            <table class="lab-table">
              <caption class="sr-only">Detection opportunities</caption>
              <thead><tr><th>Data source</th><th>Look for</th><th>Example logic (simplified)</th></tr></thead>
              <tbody>
                ${D.DETECTION_PLAYBOOK.map((d) => `<tr style="vertical-align:top;">
                  <td style="font-weight:600;color:var(--stone-800);">${esc(d.source)}</td>
                  <td style="color:var(--stone-600);">${esc(d.look)}</td>
                  <td class="logic-cell">${esc(d.logic)}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card card-pad">
          ${sectionTitle('Mitigation recommendations', 'Official MITRE ATT&CK mitigation IDs, mapped to what you implemented.')}
          <ul class="rec-grid" style="list-style:none;">
            ${D.MITIGATION_RECS.map((m) => `<li class="rec-item"><span class="mid">${esc(m.mid)}</span> <span class="mname">${esc(m.name)}</span><p>${esc(m.how)}</p></li>`).join('')}
          </ul>
        </div>

        <div class="card card-2-amber card-pad">
          ${sectionTitle('Risk → control matcher', 'OBJ-M12 · Choose the control that addresses each risk’s root cause.')}
          <div style="display:flex;flex-direction:column;gap:.75rem;">
            ${D.RISK_CONTROLS.map((rc) => `
              <div class="matcher-row">
                <p class="risk">${icon('shield-alert')}${esc(rc.risk)}</p>
                ${selectHtml(`class="select" style="width:100%;" aria-label="Control for risk ${esc(rc.id)}" data-select="rc" data-key="${esc(rc.id)}" data-fk="rc-${esc(rc.id)}"`,
        rc.options, env.review['rc:' + rc.id] || '', 'select control…')}
              </div>`).join('')}
          </div>
        </div>

        ${mode === 'hard' ? `
        <div class="card card-2-rose card-pad">
          ${sectionTitle('Evaluation-order probes', 'OBJ-H4 · Predict the engine — do NOT run these in the simulator first.')}
          <div style="display:flex;flex-direction:column;gap:.75rem;">
            ${D.H4_PROBES.map((p) => `
              <div class="probe-row">
                <p class="probe">${esc(p.probe)}</p>
                <div class="radio-flex">
                  ${p.options.map((o) => `<label>${radioInput('h4-' + p.id, o, env.h4[p.id] === o)} <span class="mono">${esc(o)}</span></label>`).join('')}
                </div>
              </div>`).join('')}
          </div>
        </div>
        <div class="card card-2-rose card-pad">
          ${sectionTitle('Mitigation ID mapping', 'OBJ-H8 · Post-incident gaps → official MITRE mitigation IDs.')}
          <div style="display:flex;flex-direction:column;gap:.75rem;">
            ${D.H8_GAPS.map((g) => `
              <div class="gap-row">
                <p class="gap">${esc(g.gap)}</p>
                <div class="radio-flex">
                  ${g.options.map((o) => `<label>${radioInput('h8-' + g.id, o, env.h8[g.id] === o)} <span class="mono">${esc(o)}</span></label>`).join('')}
                </div>
              </div>`).join('')}
          </div>
        </div>
        <div class="card card-2-rose card-pad">
          ${sectionTitle('Residual risk', 'OBJ-H9 · One of these statements is true after ALL remediation.')}
          <div class="radio-col" style="gap:.5rem;">
            ${residualOptions.map((o) => `<label class="justify-option">${radioInput('h9', o.id, env.h9 === o.id, 'mt')} <span>${esc(o.t)}</span></label>`).join('')}
          </div>
        </div>` : ''}

        <div class="takeaway-grid">
          <div class="card card-pad">
            ${sectionTitle('Blue-team takeaways')}
            <ul class="takeaway-list">
              <li>Least privilege is a verb: narrow actions AND resources, add conditions where state matters.</li>
              <li>Explicit Deny is a scalpel for guardrails — but a matching Allow underneath still needs cleanup.</li>
              <li>Detect via baseline: service keys have home IPs and schedules; deviations are the alert.</li>
              <li>Offboarding = disable + revoke credentials in the same change window.</li>
              <li>Verify every control with a test request — unverified mitigations are wishes.</li>
            </ul>
          </div>
          <div class="card card-pad">
            ${sectionTitle('Red-team mindset (defensive use)')}
            <ul class="takeaway-list">
              <li>Stolen valid credentials (T1078) look like the real user — baseline deviation is your only signal.</li>
              <li>A leaked static key is a persistent backdoor until rotated (T1528 → T1078).</li>
              <li>Self-service policy attachment (T1098) turns a read-only foothold into admin — alert on policy-attach events.</li>
              <li>Wildcards are free real estate: store:* on * is an invitation.</li>
            </ul>
          </div>
        </div>

        <div class="card card-pad">
          ${sectionTitle('Official references', 'Opens in a new tab.')}
          <div class="refs">
            ${[
        ['MITRE T1078 — Valid Accounts', 'https://attack.mitre.org/techniques/T1078/'],
        ['MITRE T1098 — Account Manipulation', 'https://attack.mitre.org/techniques/T1098/'],
        ['MITRE T1528 — Steal Application Access Token', 'https://attack.mitre.org/techniques/T1528/'],
        ['MITRE M1032 — Multi-factor Authentication', 'https://attack.mitre.org/mitigations/M1032/'],
        ['MITRE M1018 — User Account Management', 'https://attack.mitre.org/mitigations/M1018/'],
        ['CompTIA Cloud+ CV0-004 objectives', 'https://www.comptia.org/en-us/certifications/cloud'],
      ].map(([label, href]) => `<a class="ref-link" href="${href}" target="_blank" rel="noopener noreferrer">${icon('external-link')} ${esc(label)}</a>`).join('')}
          </div>
        </div>

        <div class="footnote">
          ${icon('clipboard-check')}
          <p>Objectives OBJ-M4/M5/M3 and OBJ-H3/H5 were verified against the live engine in this console; the evaluation rules shown here match the simulator exactly (simplified for training: single account, no policy variables).</p>
        </div>
      </div>`;
  }

  // --- Simulator dock -----------------------------------------------------------------------------
  function renderSimulator() {
    const env = window.LabStore.getState().env;
    const sim = window.LabUIState.sim;
    const result = sim.result;
    return `
      <aside class="dir-aside" aria-label="Policy simulator">
        <div class="card">
          <header class="card-head">${icon('shield-check', 'head-teal')}<h2 class="card-title">Policy Simulator</h2><span class="card-count" style="font-size:11px;">live engine</span></header>
          <div style="padding:.75rem;" class="sim-fields">
            <label class="field-label"><span>Principal (identity)</span>
              ${selectHtml('class="select mono" aria-label="Principal" data-select="sim-principal"', D.SIM_PRINCIPALS, sim.principal)}
            </label>
            <label class="field-label"><span>Action</span>
              ${selectHtml('class="select mono" aria-label="Action" data-select="sim-action"', D.ACTIONS, sim.action)}
            </label>
            <label class="field-label"><span>Resource</span>
              ${selectHtml('class="select mono" aria-label="Resource" data-select="sim-resource"', D.RESOURCES, sim.resource)}
            </label>
            <label class="field-label"><span>Source IP</span>
              ${selectHtml('class="select mono" aria-label="Source IP" data-select="sim-ip"', D.SIM_IPS, sim.ip)}
            </label>
            <div class="sim-mfa">
              <span>MFA verified on request</span>
              ${switchInput('sim-mfa', 'mfa', sim.mfa, 'MFA verified', 'data-fk="sim-mfa"')}
            </div>
            <button class="btn btn-primary btn-block" style="font-weight:600;" data-action="sim-evaluate">${icon('play')} Evaluate request</button>
          </div>
        </div>
        <div class="card" aria-live="polite">
          <div class="sim-result-head">
            ${result ? verdictChip(result.verdict) : '<span class="hint">Run a request to see the engine’s decision…</span>'}
          </div>
          ${result ? `
          <div style="padding:.75rem;">
            <div class="journey" aria-label="Request journey through the AAA pipeline">
              <div class="step j-identify">${icon('user-round')}<span class="lab">Identify</span></div>
              <div class="step ${sim.mfa ? 'j-auth-ok' : 'j-auth-no'}">${icon('fingerprint')}<span class="lab">Authenticate</span></div>
              <div class="step ${result.verdict === 'allowed' ? 'j-authz-ok' : 'j-authz-deny'}">${icon('shield-check')}<span class="lab">Authorize</span></div>
              <div class="step j-account">${icon('scroll-text')}<span class="lab">Account</span></div>
            </div>
            <pre class="trace-pre">${esc(result.trace.join('\n'))}</pre>
          </div>` : ''}
        </div>
      </aside>`;
  }

  // --- Objectives drawer (C4) -------------------------------------------------------------------------
  function renderObjDrawerInner(mode) {
    const st = window.LabStore.getState();
    const objectives = st.objectiveState;
    const lastCheck = st.lastCheck;
    const defs = E.objectivesFor(mode);
    const done = defs.filter((o) => objectives[o.id] && objectives[o.id].done).length;
    const isHard = mode === 'hard';
    const cards = defs.map((o, i) => {
      const stO = objectives[o.id];
      const check = lastCheck[o.id];
      const hintsUsed = (stO && stO.hintsUsed) || 0;
      return `
        <section class="obj-card ${stO && stO.done ? 'done' : ''}">
          <div style="padding:.625rem .75rem;">
            <div class="obj-top">
              <span class="obj-num ${stO && stO.done ? 'done' : ''}" aria-hidden="true">${i + 1}</span>
              ${pillarBadge(o.pillar)}
              ${stO && stO.done ? `<span class="obj-done-icon" role="img" aria-label="complete">${icon('circle-check-big')}</span>` : ''}
            </div>
            <h3 class="obj-title">${esc(o.title)}</h3>
            <p class="obj-student">${esc(o.student)}</p>
            ${!isHard ? `<p class="obj-context">${esc(o.context)}</p>` : ''}
            <p class="obj-anchor">${esc(o.id)} · ${esc(o.coverage)} · ${esc(o.anchor)}</p>
            <div class="obj-actions">
              ${!isHard ? `<button class="btn btn-outline" data-action="goto" data-goto='${esc(JSON.stringify(o.goTo))}' data-fk="goto-${o.id}">${icon('map-pin', 'head-teal')} Where to look</button>` : ''}
              <button class="btn btn-outline" data-action="hint" data-id="${o.id}" ${isHard ? (hintsUsed >= 1 ? 'disabled' : '') : (hintsUsed >= o.hints.length ? 'disabled' : '')}
                aria-label="Reveal hint for ${esc(o.title)}${isHard ? ' (costs rating)' : ''}" data-fk="hint-${o.id}">
                ${icon('lightbulb', '')}
                ${isHard ? `Nudge (${hintsUsed}/1 · costs rating)` : `Hint (${hintsUsed}/${o.hints.length})`}
              </button>
              <button class="btn btn-primary" style="font-weight:600;" data-action="check" data-id="${o.id}" data-fk="check-${o.id}">CHECK RESULTS</button>
            </div>
            ${stO && stO.hintsUsed > 0 ? `
            <div style="margin-top:.5rem;display:flex;flex-direction:column;gap:.375rem;">
              ${o.hints.slice(0, stO.hintsUsed).map((h, hi) => `<p class="hint-box"><strong>Hint ${hi + 1}:</strong> ${esc(h)}</p>`).join('')}
            </div>` : ''}
            ${check ? `
            <div class="check-result ${check.pass ? 'check-pass' : 'check-fail'}" aria-live="polite">
              <span class="verdict-line">${check.pass ? icon('circle-check-big') : icon('circle-x')} ${check.pass ? 'PASSED' : 'NOT YET'}</span>
              ${esc(check.msg)}
            </div>` : ''}
          </div>
        </section>`;
    }).join('');
    const hintsTotal = defs.reduce((a, o) => a + ((objectives[o.id] && objectives[o.id].hintsUsed) || 0), 0);
    return `
      <div class="drawer-head">
        ${icon('clipboard-list', 'head-teal')}
        <div style="flex:1;">
          <h2>Objectives — ${mode === 'medium' ? 'Guided Hardening Sprint' : 'Breach Simulation'}</h2>
          <p class="meta">${done}/${defs.length} complete · hints used: ${hintsTotal}</p>
        </div>
        <button class="btn-ghost-icon" data-action="close-obj" aria-label="Close objectives" data-fk="close-obj">${icon('x')}</button>
      </div>
      <div class="drawer-body">
        ${cards}
        ${noteBox(`Feedback on every check explains the <em>why</em> and what a defender does next — that is the real curriculum. Wrong checks never block progress.`)}
      </div>`;
  }

  // --- Glossary drawer ------------------------------------------------------------------------------
  function renderGlossInner() {
    const q = window.LabUIState.glossQuery.toLowerCase();
    const list = D.GLOSSARY.filter((g) => (g.term + ' ' + g.def).toLowerCase().includes(q));
    return `
      <div class="gloss-search">
        ${icon('search')}
        <input class="gloss-input" type="text" value="${esc(window.LabUIState.glossQuery)}" placeholder="Search terms…" aria-label="Search glossary" data-gloss-search data-fk="gloss-search" />
        <button class="btn-ghost-icon" data-action="close-gloss" aria-label="Close glossary" data-fk="close-gloss">${icon('x')}</button>
      </div>
      <div class="gloss-list" id="gloss-list">
        ${list.map((g) => `<div class="gloss-item"><p class="term">${esc(g.term)}</p><p class="def">${esc(g.def)}</p></div>`).join('')}
        ${list.length === 0 ? '<p class="gloss-empty">No matching terms.</p>' : ''}
      </div>`;
  }

  // --- Quiz modal (C5) ----------------------------------------------------------------------------------
  function renderQuizInner(mode) {
    const st = window.LabStore.getState();
    const answers = st.quizAnswers;
    const submitted = st.quizSubmitted;
    const bank = mode === 'medium' ? D.QUIZ_MEDIUM : D.QUIZ_HARD;
    const correct = submitted ? bank.filter((q) => answers[q.id] === q.correct).length : 0;
    return `
      <div class="modal-head">
        <div class="titles">
          <p class="modal-title">${icon('graduation-cap', 'head-teal')} Knowledge check — ${mode === 'medium' ? 'concepts' : 'scenario triage'}</p>
          <p class="modal-desc">${mode === 'medium' ? 'Six concept questions. Every answer unlocks an explanation.' : 'Seven scenario items — apply the lesson, justify the call.'}</p>
        </div>
        <button class="modal-close" data-action="close-quiz" aria-label="Close quiz">${icon('x')}</button>
      </div>
      <div class="modal-body">
        ${bank.map((q, i) => {
      const picked = answers[q.id];
      return `
          <fieldset class="quiz-fieldset ${submitted ? (picked === q.correct ? 'pass' : 'fail') : ''}">
            <legend class="quiz-legend">Q${i + 1}. ${esc(q.q)}</legend>
            <div class="quiz-options">
              ${q.options.map((o, oi) => {
        // R3 contract: ONLY the picked option gets a state color; the correct
        // answer is never revealed green on a wrong submission.
        const isCorrectPick = submitted && picked === oi && oi === q.correct;
        const isWrongPick = submitted && picked === oi && oi !== q.correct;
        return `<label class="quiz-option ${isCorrectPick ? 'picked-correct' : isWrongPick ? 'picked-wrong' : ''} ${submitted ? 'disabled' : ''}">
                  <input type="radio" class="radio" name="quiz-${q.id}" value="${oi}" data-radio="quiz" data-quiz-id="${q.id}" ${picked === oi ? 'checked' : ''} ${submitted ? 'disabled' : ''} style="margin-top:.125rem;" />
                  <span style="flex:1;">${esc(o)}</span>
                  ${isCorrectPick ? icon('circle-check-big', 'ok') : ''}
                  ${isWrongPick ? icon('circle-x', 'bad') : ''}
                  ${isCorrectPick ? '<span class="sr-only"> — your answer, correct</span>' : ''}
                  ${isWrongPick ? '<span class="sr-only"> — your answer, incorrect</span>' : ''}
                </label>`;
      }).join('')}
            </div>
            ${submitted ? `
            <p class="quiz-expl ${picked === q.correct ? 'ok' : 'bad'}">
              <strong>${picked === q.correct ? 'Correct. ' : `Correct answer: ${esc(q.options[q.correct])}. `}</strong>${esc(q.expl)}
            </p>` : ''}
          </fieldset>`;
    }).join('')}
        ${!submitted ? `
        <button class="btn btn-primary btn-block" style="font-weight:600;" data-action="submit-quiz" ${Object.keys(answers).length < bank.length ? 'disabled' : ''}>
          Submit answers (${Object.keys(answers).length}/${bank.length})
        </button>` : `
        <div class="quiz-score">
          <span>Score: ${correct}/${bank.length}</span>
          <span class="light">Review the explanations above — they are exam-grade reasoning.</span>
        </div>`}
      </div>`;
  }

  // --- Completion modal (C7) ------------------------------------------------------------------------------
  function renderCompInner(mode) {
    const s = window.LabStore.getState();
    const score = E.computeScore(s);
    const total = score.totalObj + score.quizTotal;
    const points = score.done + score.quizCorrect;
    const defs = E.objectivesFor(mode);
    const pillars = ['Understand', 'Recognize', 'Detect', 'Mitigate'].map((p) => ({
      name: p,
      done: defs.filter((o) => o.pillar === p && s.objectiveState[o.id] && s.objectiveState[o.id].done).length,
      total: defs.filter((o) => o.pillar === p).length,
    }));
    return `
      <div class="modal-head">
        <div class="titles">
          <p class="modal-title" style="font-size:1.25rem;">${icon('award', 'trophy')} Sprint complete — you ran the control plane</p>
          <p class="modal-desc">CompTIA Cloud+ CV0-004 · Lesson 4.2 (objective 4.3): implementing IAM to control resource access.</p>
        </div>
        <button class="modal-close" data-action="close-comp" aria-label="Close completion report">${icon('x')}</button>
      </div>
      <div class="modal-body">
        <div class="score-card">
          <div class="score-pct">
            <p class="big">${Math.round((points / Math.max(total, 1)) * 100)}%</p>
            <p class="of">${points} of ${total} points</p>
          </div>
          <div class="stars-box">
            ${starsHtml(score.stars)}
            <p class="stars-meta">first-attempt ${Math.round(score.firstTryRate * 100)}% · hints ${score.hints}</p>
          </div>
        </div>
        <div>
          <p style="font-size:.875rem;font-weight:700;color:var(--stone-900);margin-bottom:.5rem;">Mastery recap by pillar</p>
          <div class="pillar-grid">
            ${pillars.map((p) => `<div class="pillar-count">${pillarBadge(p.name)}<span class="count">${p.done}/${p.total}</span></div>`).join('')}
          </div>
        </div>
        <div class="focus-card">
          <p class="head">${icon('crosshair', 'head-amber')} Focus areas — where to push next</p>
          <p class="sub">Derived from your actual checks, hints and quiz answers in this run.</p>
          <ul class="focus-list">
            ${E.computeFocusAreas(s).map((a) => `<li class="focus-item"><p class="lab">${esc(a.label)}</p><p class="tip">${esc(a.tip)}</p></li>`).join('')}
          </ul>
        </div>
        <div class="next-card">
          <p class="head">${icon('book-open-text', 'head-teal')} What to learn next</p>
          <ul class="next-list">
            ${D.NEXT_STEPS.map((n) => `<li>${icon('chevron-right')}${esc(n)}</li>`).join('')}
          </ul>
        </div>
        <button class="btn btn-primary btn-block" style="font-weight:600;" data-action="close-comp">Back to the console</button>
      </div>`;
  }

  // --- Reset dialog -----------------------------------------------------------------------------------------
  function renderResetInner() {
    return `
      <div class="modal-head">
        <div class="titles">
          <p class="modal-title">Reset the lab?</p>
          <p class="modal-desc">This wipes saved progress, all console state (policies, gatekeeper, vault, audit flags) and quiz results, and returns to mode selection. This cannot be undone.</p>
        </div>
        <button class="modal-close" data-action="close-reset" aria-label="Close reset dialog">${icon('x')}</button>
      </div>
      <div class="reset-actions">
        <button class="btn btn-outline" data-action="close-reset">Cancel</button>
        <button class="btn btn-rose" data-action="confirm-reset">Reset everything</button>
      </div>`;
  }

  // --- Console page assembly -----------------------------------------------------------------------------------
  function renderConsole(mode) {
    const dirCls = window.LabUIState.dirOpen ? 'dir-zone open' : 'dir-zone';
    return `
      <div class="console-page">
        ${renderHud(mode)}
        <div class="console-grid">
          <div class="mobile-toolbar">
            <button class="btn btn-outline" data-action="dir-toggle" aria-expanded="${window.LabUIState.dirOpen}" aria-controls="directory-zone">${icon('panel-left', 'head-teal')} ${window.LabUIState.dirOpen ? 'Hide directory' : 'Show directory'}</button>
            <button class="btn btn-outline" data-action="overlay-open" data-overlay="concepts">Concepts</button>
          </div>
          <div class="${dirCls}" id="directory-zone">${renderDirectory(mode)}</div>
          <div>
            <div class="tabs-list" role="tablist" aria-label="Workbench tools">
              ${[
      ['policies', 'Policies', null],
      ['federation', 'Federation', null],
      ['gatekeeper', 'Gatekeeper', 'shield-check'],
      ['secrets', 'Keys & Secrets', null],
      ['audit', 'Audit Trail', null],
      ['notes', 'Field Notes', null],
    ].map(([id, label, ic]) => `<button class="tab-trigger" role="tab" aria-selected="${window.LabUIState.tab === id}" data-action="tab" data-tab="${id}" data-fk="tab-${id}">${ic ? icon(ic) : ''}${label}</button>`).join('')}
            </div>
            <div class="tab-panel" role="tabpanel">${renderTabContent(mode, window.LabUIState.tab)}</div>
          </div>
          <div class="dock-zone">${renderSimulator()}</div>
        </div>
      </div>`;
  }

  function renderTabContent(mode, tab) {
    switch (tab) {
      case 'policies': return renderPoliciesTab(mode);
      case 'federation': return renderFederationTab();
      case 'gatekeeper': return renderGatekeeperTab();
      case 'secrets': return renderSecretsTab(mode);
      case 'audit': return renderAuditTab(mode);
      case 'notes': return renderFieldNotesTab(mode);
      default: return '';
    }
  }

  return {
    esc, icon, noteBox,
    renderModeSelect, renderBriefing, renderKnowledge,
    renderConsole, renderHud, renderDirectory, renderTabContent, renderSimulator,
    renderObjDrawerInner, renderGlossInner, renderQuizInner, renderCompInner, renderResetInner,
  };
})();
