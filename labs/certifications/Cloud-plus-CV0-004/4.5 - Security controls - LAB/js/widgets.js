/* ─────────────────────────────────────────────────────────────────────────────
 * widgets.js — Shield Ledger widget renderers (answer surfaces for objectives).
 * Ported 1:1 from src/components/lab/ledger-widgets.tsx + the widget selection
 * in Ledger.tsx. Every answer is stored in state.answers[oid] with the SAME
 * shape the validators expect.
 * ───────────────────────────────────────────────────────────────────────────── */

function asRec(p) {
  return typeof p === "object" && p !== null && !Array.isArray(p) ? p : {};
}

/* Segmented radio row (CSP/Customer, Technical/…, TP/FP…).
 * Native radios (visually hidden) keep arrow-key selection working. */
function segRow(opts) {
  var name = opts.name;
  var value = opts.value || "";
  var cls =
    "seg" +
    (value === opts.current ? " seg-on" : "");
  var inner = opts.options
    .map(function (o) {
      var on = opts.current === o.v;
      return (
        '<label class="seg-opt' +
        (on ? " seg-opt-on" : "") +
        '">' +
        '<input type="radio" name="' + name + '" value="' + o.v + '"' +
        (on ? " checked" : "") +
        ' data-action="ans-radio" data-oid="' + opts.oid + '" data-key="' + opts.rowId + '" data-value="' + o.v + '" data-fkey="ans:' + opts.oid + ':' + opts.rowId + ':' + o.v + '"' +
        (opts.disabled ? " disabled" : "") +
        ' aria-label="' + esc(opts.ariaLabel + ": " + o.t) + '">' +
        "<span>" + o.t + "</span></label>"
      );
    })
    .join("");
  return '<div class="seg-group" role="radiogroup" aria-label="' + esc(opts.ariaLabel) + '">' + inner + "</div>";
}

/* Generic labeled row card used by sorter widgets. */
function sorterRow(content, controlHtml) {
  return (
    '<div class="row-card">' +
    '<span class="row-text">' + content + "</span>" +
    controlHtml +
    "</div>"
  );
}

function typeOptions(selected, ariaLabel, oid, key) {
  return (
    '<select class="select select-type" aria-label="' + esc(ariaLabel) + '" data-fkey="ans:' + oid + ':' + key + '"' +
    ' data-action="ans-select" data-oid="' + oid + '" data-key="' + key + '">' +
    '<option value="" disabled' + (selected ? "" : " selected") + ">pick type…</option>" +
    LAB.SIX_TYPES.map(function (t) {
      return '<option value="' + t.v + '"' + (selected === t.v ? " selected" : "") + ">" + t.t + "</option>";
    }).join("") +
    "</select>"
  );
}

/* ─── OBJ-M1: categories ───────────────────────────────────────────────────── */
function widgetM1(state, oid) {
  var a = asRec(getAnswer(state, oid));
  var items = shuffleSeeded(LAB.WIDGET_ITEMS.M1, state.shuffleSeed || 0, "M1");
  return (
    '<div class="stack-2">' +
    items
      .map(function (it) {
        return sorterRow(
          esc(it.t),
          segRow({
            name: "m1-" + it.id,
            oid: oid,
            rowId: it.id,
            current: a[it.id] || "",
            ariaLabel: "Category of: " + it.t,
            options: [
              { v: "technical", t: "Technical" },
              { v: "administrative", t: "Administrative" },
              { v: "physical", t: "Physical" },
            ],
          })
        );
      })
      .join("") +
    "</div>"
  );
}

/* ─── OBJ-M2: types ────────────────────────────────────────────────────────── */
function widgetM2(state, oid) {
  var a = asRec(getAnswer(state, oid));
  var items = shuffleSeeded(LAB.WIDGET_ITEMS.M2, state.shuffleSeed || 0, "M2");
  return (
    '<div class="stack-2">' +
    items
      .map(function (it) {
        return sorterRow(
          esc(it.t),
          typeOptions(a[it.id] || "", "Type of: " + it.t, oid, it.id)
        );
      })
      .join("") +
    "</div>"
  );
}

/* ─── OBJ-M3 / OBJ-H3: shared responsibility ───────────────────────────────── */
function widgetResponsibility(state, oid, salt, rows) {
  var a = asRec(getAnswer(state, oid));
  var ordered = shuffleSeeded(rows, state.shuffleSeed || 0, salt);
  return (
    '<div class="stack-2">' +
    ordered
      .map(function (r) {
        return sorterRow(
          esc(r.t),
          segRow({
            name: oid + "-" + r.id,
            oid: oid,
            rowId: r.id,
            current: a[r.id] || "",
            ariaLabel: "Owner of: " + r.t,
            options: [
              { v: "csp", t: "CSP" },
              { v: "customer", t: "Customer" },
            ],
          })
        );
      })
      .join("") +
    "</div>"
  );
}

/* ─── OBJ-M4: layer placement ──────────────────────────────────────────────── */
function widgetM4(state, oid) {
  var a = asRec(getAnswer(state, oid));
  var items = shuffleSeeded(LAB.WIDGET_ITEMS.M4, state.shuffleSeed || 0, "M4");
  return (
    '<div class="stack-2">' +
    items
      .map(function (it) {
        return sorterRow(
          esc(it.t),
          '<select class="select select-deck" aria-label="Deck placement of: ' + esc(it.t) + '" data-fkey="ans:' + oid + ':' + it.id + '"' +
            ' data-action="ans-select" data-oid="' + oid + '" data-key="' + it.id + '">' +
            '<option value="" disabled' + (a[it.id] ? "" : " selected") + ">assign deck…</option>" +
            LAB.DECKS.map(function (d) {
              return '<option value="' + d.id + '"' + (a[it.id] === d.id ? " selected" : "") + ">" + esc(d.name) + "</option>";
            }).join("") +
            "</select>"
        );
      })
      .join("") +
    "</div>"
  );
}

/* ─── OBJ-M5 / OBJ-H1: audit triage ────────────────────────────────────────── */
function widgetTriage(state, hard) {
  var oid = hard ? "OBJ-H1" : "OBJ-M5";
  var raw = getAnswer(state, oid);
  var sel = (raw && raw.sel) || [];
  var decks = (raw && raw.decks) || {};
  var findings = hard ? LAB.FINDINGS_HARD : LAB.FINDINGS_MEDIUM;
  var locked = !!(state.results[oid] && state.results[oid].pass);
  return (
    '<div class="stack-2">' +
    findings
      .map(function (f) {
        var checked = sel.indexOf(f.id) > -1;
        return (
          '<div class="row-card triage-card' + (checked ? " triage-on" : "") + '">' +
          '<div class="triage-head">' +
          '<label class="triage-label">' +
          '<input type="checkbox" data-action="triage-toggle" data-oid="' + oid + '" data-fid="' + f.id + '" data-fkey="triage:' + f.id + '"' +
          (checked ? " checked" : "") + (locked ? " disabled" : "") +
          ' aria-label="Mark finding as genuine: ' + esc(f.text) + '">' +
          "<span>" +
          '<span class="mono dim11">' + esc(f.resource) + " · </span>" +
          esc(f.text) +
          "</span></label>" +
          '<span class="sev sev-' + f.severity + '">' + f.severity + "</span>" +
          "</div>" +
          (hard && checked
            ? '<div class="triage-deck"><span class="dim11">Deck:</span>' +
              '<select class="select select-deck" aria-label="Deck for finding ' + esc(f.resource) + '" data-fkey="triagedeck:' + f.id + '"' +
              ' data-action="triage-deck" data-oid="' + oid + '" data-fid="' + f.id + '"' + (locked ? " disabled" : "") + ">" +
              '<option value="" disabled' + (decks[f.id] ? "" : " selected") + ">assign deck…</option>" +
              LAB.DECKS.map(function (d) {
                return '<option value="' + d.id + '"' + (decks[f.id] === d.id ? " selected" : "") + ">" + esc(d.name) + "</option>";
              }).join("") +
              "</select></div>"
            : "") +
          "</div>"
        );
      })
      .join("") +
    '<p class="mono dim10">' +
    (hard
      ? "Select exactly the 7 genuine gaps and assign each deck."
      : "Select exactly the 4 genuine gaps.") +
    "</p></div>"
  );
}

/* ─── sequence rail (OBJ-M12, OBJ-H4) ──────────────────────────────────────── */
function widgetSeq(state, oid) {
  var cfg = LAB.SEQ[oid];
  var stored = state.answers[oid];
  var validStored =
    Array.isArray(stored) &&
    stored.filter(function (k) {
      return cfg.steps.some(function (s) {
        return s.k === k;
      });
    }).length === cfg.steps.length;
  var order = validStored ? stored : cfg.initial;
  return (
    '<ol class="seq-list" aria-label="Ordered steps for ' + oid + '">' +
    order
      .map(function (k, i) {
        var step = cfg.steps.find(function (s) {
          return s.k === k;
        });
        return (
          '<li class="row-card seq-row">' +
          '<span class="mono accent-text seq-num">' + (i + 1) + ".</span>" +
          '<span class="seq-text">' + esc(step.t) + "</span>" +
          '<span class="seq-btns">' +
          '<button type="button" class="btn btn-outline btn-icon" data-action="seq-move" data-oid="' + oid + '" data-idx="' + i + '" data-dir="-1" data-fkey="seq:' + oid + ':' + i + ':-1"' +
          (i === 0 ? " disabled" : "") + ' aria-label="Move step ' + (i + 1) + ' up">' + icon("arrow-up") + "</button>" +
          '<button type="button" class="btn btn-outline btn-icon" data-action="seq-move" data-oid="' + oid + '" data-idx="' + i + '" data-dir="1" data-fkey="seq:' + oid + ':' + i + ':1"' +
          (i === order.length - 1 ? " disabled" : "") + ' aria-label="Move step ' + (i + 1) + ' down">' + icon("arrow-down") + "</button>" +
          "</span></li>"
        );
      })
      .join("") +
    "</ol>"
  );
}

/* ─── OBJ-H2: tricky five (type + category) ────────────────────────────────── */
function widgetH2(state, oid) {
  var a = getAnswer(state, oid);
  var items = shuffleSeeded(LAB.WIDGET_ITEMS.H2, state.shuffleSeed || 0, "H2");
  function catSelect(id, current) {
    return (
      '<select class="select select-type" aria-label="Category of: ' + esc(id) + '" data-fkey="ans2:' + oid + ':' + id + ':cat"' +
      ' data-action="ans-select2" data-oid="' + oid + '" data-row="' + id + '" data-key="cat">' +
      '<option value="" disabled' + (current ? "" : " selected") + ">category…</option>" +
      ["technical", "administrative", "physical"]
        .map(function (c) {
          return '<option value="' + c + '"' + (current === c ? " selected" : "") + ">" + c.charAt(0).toUpperCase() + c.slice(1) + "</option>";
        })
        .join("") +
      "</select>"
    );
  }
  return (
    '<div class="stack-2">' +
    items
      .map(function (it) {
        var row = asRec(a[it.id]);
        return (
          '<div class="row-card">' +
          '<span class="row-text">' + esc(it.t) + "</span>" +
          '<div class="h2-controls">' +
          '<select class="select select-type" aria-label="Type of: ' + esc(it.t) + '" data-fkey="ans2:' + oid + ':' + it.id + ':type"' +
          ' data-action="ans-select2" data-oid="' + oid + '" data-row="' + it.id + '" data-key="type">' +
          '<option value="" disabled' + (row.type ? "" : " selected") + ">type…</option>" +
          LAB.SIX_TYPES.map(function (t) {
            return '<option value="' + t.v + '"' + (row.type === t.v ? " selected" : "") + ">" + t.t + "</option>";
          }).join("") +
          "</select>" +
          catSelect(it.id, row.cat) +
          "</div></div>"
        );
      })
      .join("") +
    "</div>"
  );
}

/* ─── OBJ-H5: compensations with justification ─────────────────────────────── */
function widgetH5(state, oid) {
  var a = asRec(getAnswer(state, oid));
  function panel(sc, key, choices, choiceVal, justVal, ariaLabel) {
    return (
      '<div class="panel-inner">' +
      '<p class="h5-prompt">' + sc.prompt + "</p>" +
      '<div class="radio-stack" role="radiogroup" aria-label="' + esc(ariaLabel) + '">' +
      choices
        .map(function (o) {
          return (
            '<label class="radio-row">' +
            '<input type="radio" name="' + oid + "-" + key + '" value="' + o.v + '"' +
            (choiceVal === o.v ? " checked" : "") +
            ' data-action="ans-radio" data-oid="' + oid + '" data-key="' + key + '" data-value="' + o.v + '" data-fkey="ans:' + oid + ':' + key + ':' + o.v + '"' +
            ' aria-label="' + esc(o.t) + '">' +
            "<span>" + o.t + "</span></label>"
          );
        })
        .join("") +
      "</div>" +
      '<textarea class="textarea" rows="2" aria-label="Justification for ' + esc(ariaLabel) + '" data-fkey="text:' + oid + ':' + justVal + '"' +
      ' placeholder="Justify in one line — name the exact mechanism…"' +
      ' data-action="ans-text" data-oid="' + oid + '" data-key="' + justVal + '">' +
      esc(asRec(a)[justVal] || "") +
      "</textarea></div>"
    );
  }
  return (
    '<div class="stack-3">' +
    panel(LAB.H5.A, "choiceA", LAB.H5.A.choices, a.choiceA || "", "justA", "scenario A") +
    panel(LAB.H5.B, "choiceB", LAB.H5.B.choices, a.choiceB || "", "justB", "scenario B") +
    "</div>"
  );
}

/* ─── OBJ-H7: budget call ──────────────────────────────────────────────────── */
function widgetH7(state, oid) {
  var a = asRec(getAnswer(state, oid));
  return (
    "<div>" +
    '<p class="h7-constraint">' + esc(LAB.H7.constraint).replace("one", "<strong>one</strong>").replace("between the 40 internal workloads", "<strong> between the 40 internal workloads</strong>") + "</p>" +
    '<div class="radio-stack" role="radiogroup" aria-label="Budget decision">' +
    LAB.H7.choices
      .map(function (o) {
        return (
          '<label class="radio-row boxed">' +
          '<input type="radio" name="' + oid + '-choice" value="' + o.v + '"' +
          (a.choice === o.v ? " checked" : "") +
          ' data-action="ans-radio" data-oid="' + oid + '" data-key="choice" data-value="' + o.v + '" data-fkey="ans:' + oid + ':choice:' + o.v + '"' +
          ' aria-label="' + esc(o.t) + '">' +
          "<span>" + o.t + "</span></label>"
        );
      })
      .join("") +
    "</div>" +
    '<textarea class="textarea" rows="2" aria-label="Justification for the budget decision" data-fkey="text:' + oid + ':just"' +
    ' placeholder="Justify in one line — name the traffic direction you are defending…"' +
    ' data-action="ans-text" data-oid="' + oid + '" data-key="just">' +
    esc(a.just || "") +
    "</textarea></div>"
  );
}

/* ─── OBJ-H8: verification plan ────────────────────────────────────────────── */
function widgetH8(state, oid) {
  var sel = Array.isArray(state.answers[oid]) ? state.answers[oid] : [];
  return (
    '<div class="stack-2">' +
    LAB.H8_ITEMS.map(function (it) {
      var on = sel.indexOf(it.id) > -1;
      return (
        '<label class="check-row' + (on ? " check-on" : "") + '">' +
        '<input type="checkbox" data-action="h8-toggle" data-oid="' + oid + '" data-fid="' + it.id + '" data-fkey="h8:' + it.id + '"' +
        (on ? " checked" : "") +
        ' aria-label="Select verification activity: ' + esc(it.t) + '">' +
        "<span>" + it.t + "</span></label>"
      );
    }).join("") +
    '<p class="mono dim10">Pick exactly the four activities that generate evidence about control effectiveness.</p>' +
    "</div>"
  );
}

/* ─── OBJ-H9: attribution table ────────────────────────────────────────────── */
function widgetH9(state, oid) {
  var a = getAnswer(state, oid);
  var t = asRec(a.table);
  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  return (
    '<div class="table-scroll">' +
    '<table class="data-table attr-table">' +
    '<caption class="sr-only">Attribution table: fill the final verdict and acting deck for each replay</caption>' +
    "<thead><tr><th scope=\"col\">replay</th><th scope=\"col\">verdict</th><th scope=\"col\">acting deck</th></tr></thead><tbody>" +
    LAB.H9_ROWS.map(function (r) {
      var deckKey = "deck" + cap(r.id);
      return (
        "<tr><td>" + r.name + "</td>" +
        '<td><select class="select" aria-label="Verdict for ' + esc(r.name) + '" data-fkey="h9:' + r.id + '"' +
        ' data-action="h9-select" data-key="' + r.id + '">' +
        '<option value="" disabled' + (t[r.id] ? "" : " selected") + ">verdict…</option>" +
        ["blocked", "detected", "passed"]
          .map(function (v) {
            return '<option value="' + v + '"' + (t[r.id] === v ? " selected" : "") + ">" + v + "</option>";
          })
          .join("") +
        "</select></td>" +
        '<td><select class="select select-deck" aria-label="Acting deck for ' + esc(r.name) + '" data-fkey="h9:' + deckKey + '"' +
        ' data-action="h9-select" data-key="' + deckKey + '">' +
        '<option value="" disabled' + (t[deckKey] ? "" : " selected") + ">assign deck…</option>" +
        LAB.DECKS.map(function (d) {
          return '<option value="' + d.id + '"' + (t[deckKey] === d.id ? " selected" : "") + ">" + esc(d.name) + "</option>";
        }).join("") +
        "</select></td></tr>"
      );
    }).join("") +
    "</tbody></table></div>"
  );
}

/* ─── widget dispatch (mirrors WidgetFor in Ledger.tsx) ──────────────────────
 * OBJ-M11 and OBJ-H6 are "ledger-zone" objectives whose answer surfaces live on
 * the Cutaway (Legacy card / SIEM feed) — the ledger intentionally renders no
 * widget for them, exactly like the original's default case. */
function widgetFor(o, state) {
  var oid = o.id;
  switch (o.widget) {
    case "M1":
      return widgetM1(state, oid);
    case "M2":
      return widgetM2(state, oid);
    case "M3":
      return widgetResponsibility(state, oid, "M3", LAB.WIDGET_ITEMS.M3);
    case "H3":
      return widgetResponsibility(state, oid, "H3", LAB.WIDGET_ITEMS.H3);
    case "M4":
      return widgetM4(state, oid);
    case "triage-medium":
      return widgetTriage(state, false);
    case "triage-hard":
      return widgetTriage(state, true);
    case "seq":
      return widgetSeq(state, oid);
    case "H2":
      return widgetH2(state, oid);
    case "H5":
      return widgetH5(state, oid);
    case "H7":
      return widgetH7(state, oid);
    case "H8":
      return widgetH8(state, oid);
    case "H9":
      return widgetH9(state, oid);
    case "legacy":
    case "siem-hard":
      return ""; /* answered on the Cutaway (legacy card / SIEM feed) */
    default:
      return "";
  }
}
