/* ============================================================================
 * CyberLab — The Documentation Drafting Room (STATIC PORT)
 * js/sheets.js — the nine interactive station sheets.
 *   1:1 port of src/components/lab/sheets-a.tsx / sheets-b.tsx / sheets-c.tsx.
 * Interactions are wired via data-action / data-field attributes and handled
 * by the delegated event layer in js/app.js.
 * ========================================================================= */
(function () {
  "use strict";

  var D = window.LabData;
  var Store = window.LabStore;
  var U = window.LabUI;

  // Local escape aliases (ui.js loads before this file)
  var esc2 = window.LabUI.esc;
  var escAttr2 = window.LabUI.escAttr;

  /* ------------------------------------------------ shared small helpers - */

  function grid3(fields) {
    return '<div class="field-grid-3">' + fields.join("") + "</div>";
  }
  function grid2(fields) {
    return '<div class="field-grid-2">' + fields.join("") + "</div>";
  }

  /* ============================================== SHEET 01 — DIAGRAMS ==== */

  function miniPhysicalMap() {
    var floors = D.SCENARIO.building
      .slice()
      .reverse()
      .map(function (f) {
        return (
          '<div class="pm-floor"><p class="pm-floor-name">' + esc2(f.floor) + "</p>" +
          '<p class="pm-floor-rooms">' + esc2(f.rooms) + "</p></div>"
        );
      })
      .join("");
    return (
      '<div class="mini-map mini-map-physical" aria-label="Physical diagram of Harborline HQ">' +
      '<p class="mono-label mini-map-label-amber">PHYSICAL LENS — what you can touch</p>' +
      '<div class="pm-floors">' + floors + "</div>" +
      '<p class="pm-topology"><span class="pm-topo-label">Fiber plant:</span> ' + esc2(D.SCENARIO.topology) + "</p>" +
      '<p class="mini-caption">Rooms, racks, closets, cable types, connection points.</p></div>'
    );
  }

  function miniLogicalMap() {
    var chain =
      '<span class="logic-node">Internet</span><span aria-hidden="true">→</span>' +
      '<span class="logic-node">FW-CORE-1</span><span aria-hidden="true">→</span>' +
      '<span class="logic-node">SW-CORE-1</span>';
    var vlans = D.SCENARIO.vlans
      .map(function (v) {
        return (
          '<div class="logic-vlan"><p class="logic-vlan-name">VLAN ' + v.id + " " + esc2(v.name) + "</p>" +
          '<p class="logic-vlan-subnet">' + esc2(v.subnet) + "</p>" +
          '<p class="logic-vlan-gw">GW ' + esc2(v.gw) + "</p></div>"
        );
      })
      .join("");
    return (
      '<div class="mini-map mini-map-logical" aria-label="Logical diagram of Harborline network">' +
      '<p class="mono-label mini-map-label-teal">LOGICAL LENS — how traffic flows</p>' +
      '<div class="logic-chain">' + chain + "</div>" +
      '<div class="logic-grid">' + vlans + "</div>" +
      '<p class="mini-caption">VLANs, subnets, gateways, policy zones — no rooms, no cables.</p></div>'
    );
  }

  function binBox(s, bin) {
    var inBin = D.DIAGRAM_CHIPS.filter(function (c) { return s.diagrams.sort[c.id] === bin; });
    var right = inBin.filter(function (c) { return c.bin === bin; }).length;
    var items = inBin
      .map(function (c) {
        var ok = c.bin === bin;
        return (
          '<li class="bin-item"><span>' + esc2(c.label) + "</span>" +
          '<span class="bin-item-actions">' +
          (ok
            ? '<span class="bin-mark-ok" aria-label="correct">✓</span>'
            : '<span class="bin-mark-bad" aria-label="misfiled">✗</span>') +
          '<button type="button" class="focus-ink bin-undo" data-action="unfile-chip" data-id="' + c.id + '"' +
          ' aria-label="Move ' + escAttr2(c.label) + ' back to desk">undo</button>' +
          "</span></li>"
        );
      })
      .join("");
    if (inBin.length === 0) {
      items = '<li class="bin-empty">Empty — click chips below to file them here.</li>';
    }
    return (
      '<div class="bin-box bin-' + bin + '">' +
      '<p class="mono-label bin-label">' + (bin === "physical" ? "PHYSICAL SHEET" : "LOGICAL SHEET") +
      " · " + inBin.length + "/8 filed</p>" +
      '<ul class="bin-list">' + items + "</ul>" +
      '<p class="bin-count">' + right + " of these belong here.</p></div>"
    );
  }

  function diagramsSheet(s) {
    var mode = s.mode;
    var meta = D.SHEETS[0];
    var body = '<div class="grid-2-lg">' + miniPhysicalMap() + miniLogicalMap() + "</div>";

    if (mode === "medium") {
      var unfiled = D.DIAGRAM_CHIPS.filter(function (c) { return !s.diagrams.sort[c.id]; });
      var chipRows = unfiled
        .map(function (c) {
          return (
            '<div class="chip-row">' +
            '<span class="chip-piece chip-label">' + esc2(c.label) + "</span>" +
            '<span class="chip-btns">' +
            U.inkButton({
              variant: "accent", cls: "btn-xs", act: "file-chip",
              data: ' data-id="' + c.id + '" data-bin="physical"',
              ariaLabel: "File " + c.label + " as physical", html: "PHY",
            }) +
            U.inkButton({
              variant: "teal", cls: "btn-xs", act: "file-chip",
              data: ' data-id="' + c.id + '" data-bin="logical"',
              ariaLabel: "File " + c.label + " as logical", html: "LOG",
            }) +
            "</span></div>"
          );
        })
        .join("");
      if (unfiled.length === 0) {
        chipRows = '<p class="desk-cleared">Desk cleared — all 8 chips filed. Re-check when ready.</p>';
      }
      var m1 = U.workOrder("M1", {
        context:
          "<p>Click a chip, then file it with the PHY or LOG button. Eight details from the Harborline docs need sorting onto the right sheet.</p>",
        children:
          '<div class="chip-stack">' + chipRows + "</div>" +
          '<div class="grid-2-sm">' + binBox(s, "physical") + binBox(s, "logical") + "</div>",
      });
      var m2 = U.workOrder("M2", {
        context: "<p>Answer from the physical lens above — read it bottom-up, like walking the building.</p>",
        children: grid3([
          U.picker({
            label: D.MAP_QUESTIONS.room.q, value: s.diagrams.read.room, path: "diagrams.read.room",
            options: D.MAP_QUESTIONS.room.options.map(function (o) { return { value: o, label: o }; }),
          }),
          U.picker({
            label: D.MAP_QUESTIONS.idfs.q, value: s.diagrams.read.idfs, path: "diagrams.read.idfs",
            options: D.MAP_QUESTIONS.idfs.options.map(function (o) { return { value: o, label: o }; }),
          }),
          U.picker({
            label: D.MAP_QUESTIONS.uplink.q, value: s.diagrams.read.uplink, path: "diagrams.read.uplink",
            options: D.MAP_QUESTIONS.uplink.options.map(function (o) { return { value: o, label: o }; }),
          }),
        ]),
      });
      body += m1 + m2;
    }

    if (mode === "hard") {
      body +=
        '<div class="audit-note"><p class="serif-head">Audit Trial note</p>' +
        '<p class="audit-note-body">In the Audit Trial you will not be quizzed here — instead, <strong>study both lenses</strong>: the daisy-chain fiber plant and the VLAN map are exactly what the fiber-cut scenario on Sheet 04 will test under pressure. File this sheet in your head, then move on.</p></div>';
    }
    return U.sheetFrame("01", "The Diagram Pair", meta.purpose, meta.icon, body);
  }

  /* ================================================= SHEET 02 — RACK ===== */

  var SLOT_OPTIONS = (function () {
    var out = [];
    for (var i = 0; i < 12; i++) {
      var u = "U" + (12 - i);
      out.push({ value: u, label: u + " · " + (12 - i) * 1.75 - 1.75 + "–" + (12 - i) * 1.75 + " in from rack floor" });
    }
    return out;
  })();

  function rackSheet(s) {
    var mode = s.mode;
    var meta = D.SHEETS[1];

    var bySlot = {};
    D.RACK_DEVICES.forEach(function (d) {
      var sl = s.rack.slots[d.id];
      if (sl) bySlot[sl] = d.name;
    });
    if (bySlot["U1"]) {
      bySlot["U2"] = bySlot["U1"];
      bySlot["U3"] = bySlot["U1"];
    }
    var elevation = "";
    for (var i = 0; i < 12; i++) {
      var u = "U" + (12 - i);
      var dev = bySlot[u];
      elevation +=
        '<div class="rack-slot" data-filled="' + !!dev + '">' +
        '<span class="mono-label rack-u">' + u + "</span>" +
        '<span class="rack-dev' + (dev ? "" : " rack-dev-empty") + '">' + (dev ? esc2(dev) : "—") + "</span></div>";
    }

    var left =
      '<div><p class="mono-label rack-kicker">FRONT ELEVATION · 42U rack (working window U1–U12) · 1U = 1.75 in</p>' +
      '<div class="rack-frame"><div class="rack-rows">' + elevation + "</div></div>" +
      '<div class="rack-conventions"><p class="rack-conv-title">House conventions:</p>' +
      "<p>1 · Heaviest unit (the UPS) at the very bottom.</p>" +
      "<p>2 · Entry chain flows upward: router → firewall → core switch.</p>" +
      "<p>3 · Patch panels mount directly ABOVE the switch they patch into.</p>" +
      "<p>4 · Leave a gap above the UPS for airflow.</p></div></div>";

    var right = "<div>";
    if (mode === "medium") {
      right += U.workOrder("M3", {
        context:
          "<p>Assign each device its U position using the house conventions. The UPS occupies U1–U3; set its dropdown to the slot where it STARTS.</p>",
        children:
          '<div class="rack-pickers">' +
          D.RACK_DEVICES.map(function (d) {
            return U.picker({
              label: d.name, value: s.rack.slots[d.id] || null, path: "rack.slots." + d.id,
              options: SLOT_OPTIONS, hint: d.hint,
            });
          }).join("") +
          "</div>",
      });
    }
    if (mode === "hard") {
      var currentRows = D.RACK_B_CURRENT.map(function (r) {
        return (
          '<div class="rackb-row"><span class="mono-label">' + r.u + "</span><span>" + esc2(r.dev) + "</span></div>"
        );
      }).join("");
      right += U.workOrder("H1", {
        context:
          '<p class="rackb-intro">Rack B (IDF-2), <strong>as currently drawn</strong> — the discovery record disagrees with it. Fix all four discrepancies.</p>' +
          U.discoveryNote("DISCOVERY — IDF-2 CLOSET", D.RACK_B_DISCOVERY_LINES) +
          '<div class="rackb-list">' + currentRows + "</div>",
        children: grid2([
          U.picker({
            label: "1 · Where does the UPS actually sit?", value: s.rack.audit.upsSlot,
            path: "rack.audit.upsSlot",
            options: D.RACK_B_AUDIT.upsSlot.options.map(function (o) { return { value: o, label: o }; }),
          }),
          U.picker({
            label: "2 · Correct model of SW-IDF2-2?", value: s.rack.audit.swModel,
            path: "rack.audit.swModel",
            options: D.RACK_B_AUDIT.swModel.options.map(function (o) { return { value: o, label: o }; }),
          }),
          U.picker({
            label: "3 · Correct slot for PP-IDF2-2?", value: s.rack.audit.ppSlot,
            path: "rack.audit.ppSlot",
            options: D.RACK_B_AUDIT.ppSlot.options.map(function (o) { return { value: o, label: o }; }),
          }),
          U.picker({
            label: "4 · What is documented nowhere but exists?", value: s.rack.audit.missing,
            path: "rack.audit.missing",
            options: D.RACK_B_AUDIT.missing.options.map(function (o) { return { value: o, label: o }; }),
          }),
        ]),
      });
    }
    right += "</div>";
    return U.sheetFrame("02", "Rack A Elevation — MDF", meta.purpose, meta.icon, '<div class="grid-2-lg rack-grid">' + left + right + "</div>");
  }

  /* ============================================== SHEET 03 — CABLE ======= */

  function cableSheet(s) {
    var mode = s.mode;
    var meta = D.SHEETS[2];

    var pickCol = function (title, items, sel, col) {
      var btns = items
        .map(function (it) {
          return (
            '<button type="button" class="focus-ink cable-pick' + (sel === it.id ? " cable-pick-on" : "") + '"' +
            ' data-action="set-cable" data-col="' + col + '" data-id="' + escAttr2(it.id) + '"' +
            ' aria-pressed="' + (sel === it.id) + '">' +
            '<span class="cable-pick-label">' + esc2(it.label) + "</span>" +
            '<span class="cable-pick-detail">' + esc2(it.detail) + "</span></button>"
          );
        })
        .join("");
      return (
        "<div><p class=\"mono-label cable-col-label\">" + title + "</p>" +
        '<div class="cable-col" role="group" aria-label="' + escAttr2(title) + '">' + btns + "</div></div>"
      );
    };

    var body = "";
    if (mode === "medium") {
      var wall = null, panel = null, port = null;
      D.CABLE_WALLPORTS.forEach(function (w) { if (w.id === s.cable.wall) wall = w.label; });
      D.CABLE_PANELPORTS.forEach(function (p) { if (p.id === s.cable.panel) panel = p.label; });
      D.CABLE_SWITCHPORTS.forEach(function (p) { if (p.id === s.cable.port) port = p.label; });
      body += U.workOrder("M4", {
        context:
          "<p>WS-204 (Room 204) is dead. Click its DATA drop, then the panel port, then the switch port — follow one cable ID end-to-end. " +
          esc2(D.CABLE_CHAIN_WHY) + "</p>",
        children:
          grid3([
            pickCol("1 · WORK-AREA WALL PORT", D.CABLE_WALLPORTS, s.cable.wall, "wall"),
            pickCol("2 · PATCH PANEL PORT (IDF-2)", D.CABLE_PANELPORTS, s.cable.panel, "panel"),
            pickCol("3 · SWITCH PORT (SW-IDF2-1)", D.CABLE_SWITCHPORTS, s.cable.port, "port"),
          ]) +
          '<div class="cable-chain-row">' +
          U.inkButton({
            act: "clear-chain",
            html: '<span class="btn-inner">' + U.icon("RotateCcw", { cls: "icon-16" }) + " clear chain</span>",
          }) +
          '<p class="mono-label cable-chain">CHAIN: ' + esc2(wall || "—") + " → " + esc2(panel || "—") +
          " → " + esc2(port || "—") + "</p></div>",
      });
    }
    if (mode === "hard") {
      var runs = D.CABLE_RUNS.map(function (r) {
        return (
          '<div class="cable-run"><p class="cable-run-label">' + esc2(r.label) + "</p>" +
          '<p class="cable-run-line">MAP SAYS: ' + esc2(r.map) + "</p>" +
          '<p class="cable-run-line">TEST SAYS: ' + esc2(r.discovery) + "</p></div>"
        );
      }).join("");
      body += U.workOrder("H5", {
        context:
          '<p class="rackb-intro">Two runs are in the audit queue. One label drifted — the toner test is ground truth.</p>' +
          '<div class="cable-runs">' + runs + "</div>",
        children: grid2([
          U.picker({
            label: "Which run is mislabeled?", value: s.cable.audit.run, path: "cable.audit.run",
            options: D.CABLE_RUNS.map(function (r) { return { value: r.id, label: r.label }; }),
          }),
          U.picker({
            label: "Corrected switch-port label", value: s.cable.audit.fixedPort, path: "cable.audit.fixedPort",
            options: D.CABLE_FIXED_PORTS.map(function (o) { return { value: o, label: o }; }),
          }),
        ]),
      });
    }
    return U.sheetFrame("03", "Cable Map — Floor 2 Plant", meta.purpose, meta.icon, body);
  }

  /* ========================================= SHEET 04 — NET DIAGRAM ====== */

  function netEl(s, id) {
    var e = null;
    D.NET_ELEMENTS.forEach(function (x) { if (x.id === id) e = x; });
    var flagged = s.netdiagram.flagged === id;
    return (
      '<button type="button" class="focus-ink net-el' + (flagged ? " net-el-flagged" : "") + '"' +
      ' data-action="flag-element" data-id="' + id + '" aria-pressed="' + flagged + '">' +
      '<span class="net-el-label">' + esc2(e.label) + "</span>" +
      '<span class="net-el-sub">' + esc2(e.sub) + "</span></button>"
    );
  }

  function netdiagramSheet(s) {
    var mode = s.mode;
    var meta = D.SHEETS[3];
    var arrow = '<span aria-hidden="true" class="net-arrow">→</span>';

    var body =
      '<div class="net-canvas"><p class="mono-label net-canvas-label">LAYER-3 VIEW · every element is clickable for audit</p>' +
      '<div class="net-row">' + netEl(s, "wan") + arrow + netEl(s, "rtr") + arrow + netEl(s, "fw") + arrow + netEl(s, "core") + "</div>" +
      '<div class="net-row net-row-2"><span class="mono-label net-svi">SVIs ↓</span>' +
      netEl(s, "vlan10") + netEl(s, "vlan20") + netEl(s, "vlan30") + netEl(s, "vlan99") +
      '<span aria-hidden="true" class="net-arrow">→</span>' + netEl(s, "srv") + "</div></div>";

    var notes = U.discoveryNote("DISCOVERY — pulled this morning", D.DIAGRAM_DISCOVERY);
    if (mode === "hard") {
      notes +=
        U.discoveryNote("TOPOLOGY REMINDER — physical lens", [
          D.SCENARIO.topology,
          "MDF: Rack A (core, firewall, edge, servers VLAN 99).",
          "Red herrings exist in the noise. Audit what DISAGREES, not what annoys you.",
        ].concat(
          D.RED_HERRINGS.map(function (h) { return "· " + h; })
        ));
    }
    body += '<div class="grid-2-lg net-notes">' + notes + "</div>";

    if (mode === "medium") {
      body += U.workOrder("M5", {
        context: "<p>One element on this sheet disagrees with device reality. Click it to flag it red.</p>",
      });
    }

    if (mode === "hard") {
      var closetBtns = D.BLAST_CLOSET_OPTIONS.map(function (opt) {
        var on = s.netdiagram.blast.closets.indexOf(opt) >= 0;
        return (
          '<button type="button" class="focus-ink toggle-chip' + (on ? " toggle-chip-on" : "") + '"' +
          ' data-action="toggle-closet" data-opt="' + escAttr2(opt) + '" aria-pressed="' + on + '">' +
          esc2(opt) + "</button>"
        );
      }).join("");
      body += U.workOrder("H7", {
        context:
          '<p class="rackb-intro"><strong>INCIDENT 06:12 —</strong> the fiber span between the MDF and IDF-2 has been cut by a contractor. Answer the three parts in order.</p>',
        children:
          '<div><p class="mono-label part-label">PART 1 · Which closets lose connectivity? (select all that apply)</p>' +
          '<div class="chip-flex">' + closetBtns + "</div>" +
          grid2([
            U.picker({
              label: "PART 2 · First document you put on the desk?", value: s.netdiagram.blast.doc,
              path: "netdiagram.blast.doc",
              options: D.BLAST_DOC_OPTIONS.map(function (o) { return { value: o, label: o }; }),
            }),
            U.picker({
              label: "PART 3 · What stays up / who is affected?", value: s.netdiagram.blast.systems,
              path: "netdiagram.blast.systems",
              options: D.BLAST_SYSTEMS_OPTIONS.map(function (o) { return { value: o, label: o }; }),
            }),
          ]) + "</div>",
      });

      body += U.workOrder("H8", {
        context:
          '<p class="rackb-intro">Rebuild two drifted elements from <strong>interface facts only</strong> — the sheet must match the device.</p>' +
          U.discoveryNote("INTERFACE FACTS", D.REBUILD_FACTS),
        children: grid2([
          U.picker({
            label: "SW-IDF2-1 Gi1/0/24 carries which VLAN (access)?", value: s.netdiagram.rebuild.portVlan,
            path: "netdiagram.rebuild.portVlan",
            options: D.REBUILD_VLAN_OPTIONS.map(function (o) { return { value: o, label: o }; }),
          }),
          U.textInput({
            label: "VLAN 20 gateway address", value: s.netdiagram.rebuild.gwVlan,
            path: "netdiagram.rebuild.gwVlan", placeholder: "10.20.20.___",
          }),
        ]),
      });
    }
    return U.sheetFrame("04", "L3 Network Diagram — Core", meta.purpose, meta.icon, body);
  }

  /* =========================================== SHEET 05 — INVENTORY ====== */

  function inventorySheet(s) {
    var mode = s.mode;
    var meta = D.SHEETS[4];
    var rows = D.ASSETS.map(function (a) {
      var flagged = !!s.inventory.flags[a.id];
      return (
        '<tr class="inv-row' + (flagged ? " inv-row-flagged" : "") + '">' +
        '<td class="inv-cell"><input type="checkbox" class="focus-ink inv-check"' +
        (flagged ? " checked" : "") + ' data-action="toggle-asset" data-id="' + a.id + '"' +
        ' aria-label="Flag record ' + escAttr2(a.tag) + ' for review"></td>' +
        '<td class="inv-cell inv-tag">' + esc2(a.tag) + "</td>" +
        '<td class="inv-cell">' + esc2(a.type) + "</td>" +
        '<td class="inv-cell">' + esc2(a.model) + "</td>" +
        '<td class="inv-cell inv-serial">' + esc2(a.serial) + "</td>" +
        '<td class="inv-cell">' + esc2(a.location) + "</td>" +
        '<td class="inv-cell">' + esc2(a.assigned) + "</td>" +
        '<td class="inv-cell">' + esc2(a.warranty) + "</td></tr>"
      );
    }).join("");

    var body =
      '<div class="table-scroll"><table class="data-table inv-table">' +
      '<caption class="sr-only">Asset inventory records with audit flags</caption>' +
      "<thead><tr class=\"inv-headrow\">" +
      '<th class="inv-th"><span class="mono-label">Audit</span></th>' +
      '<th class="inv-th"><span class="mono-label">Tag</span></th>' +
      '<th class="inv-th"><span class="mono-label">Type</span></th>' +
      '<th class="inv-th"><span class="mono-label">Model</span></th>' +
      '<th class="inv-th"><span class="mono-label">Serial</span></th>' +
      '<th class="inv-th"><span class="mono-label">Location</span></th>' +
      '<th class="inv-th"><span class="mono-label">Assigned</span></th>' +
      '<th class="inv-th"><span class="mono-label">Warranty</span></th>' +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>";

    var notes = U.discoveryNote("DISCOVERY SCAN — last night", D.DISCOVERY_SCAN);
    if (mode === "hard") {
      notes += U.discoveryNote("DISCOVERY NOISE (audit discipline: ignore what matches)", D.RED_HERRINGS);
    }
    body += '<div class="grid-2-lg">' + notes + "</div>";

    if (mode === "medium") {
      body += U.workOrder("M6", {
        context: "<p>Tick the audit box on every record that discovery proves stale. Exactly two records are wrong.</p>",
      });
    }
    if (mode === "hard") {
      var tickets = D.LIFECYCLE_TICKETS.map(function (t) {
        return '<li class="ticket-item">' + esc2(t.text) + "</li>";
      }).join("");
      body += U.workOrder("H6", {
        context:
          '<p class="rackb-intro">Apply the three lifecycle tickets to the register. The serial must be exact — warranties are claimed with it.</p>' +
          '<ul class="ticket-list">' + tickets + "</ul>",
        children: grid3([
          U.textInput({
            label: "1 · SW-IDF3-2 chassis serial (add record)", value: s.inventory.newSwitchSerial,
            path: "inventory.newSwitchSerial", placeholder: "HL-SW-_____",
          }),
          U.picker({
            label: "2 · PRN-003 record status", value: s.inventory.prnStatus, path: "inventory.prnStatus",
            options: D.LIFECYCLE_PRN_OPTIONS.map(function (o) { return { value: o, label: o }; }),
          }),
          U.picker({
            label: "3 · LT-0388 new location", value: s.inventory.ltLocation, path: "inventory.ltLocation",
            options: D.LIFECYCLE_LT_OPTIONS.map(function (o) { return { value: o, label: o }; }),
          }),
        ]),
      });
    }
    return U.sheetFrame("05", "Asset Inventory — HQ Register", meta.purpose, meta.icon, body);
  }

  /* ================================================ SHEET 06 — IPAM ====== */

  function ipamSheet(s) {
    var mode = s.mode;
    var meta = D.SHEETS[5];

    var planRows = D.IPAM_PLAN.map(function (r) {
      return (
        '<tr class="ipam-row"><td class="ipam-range">' + esc2(r.range) + "</td>" +
        '<td class="ipam-use">' + esc2(r.use) + "</td></tr>"
      );
    }).join("");
    var recRows = D.IPAM_RECORDS.map(function (r) {
      return (
        '<tr class="ipam-row"><td class="ipam-device">' + esc2(r.device) + "</td>" +
        '<td class="ipam-ip">' + esc2(r.ip) + "</td>" +
        '<td class="ipam-kind">' + esc2(r.kind) + "</td>" +
        '<td class="ipam-note">' + esc2(r.note) + "</td></tr>"
      );
    }).join("");

    var body =
      '<div class="grid-2-lg"><div>' +
      '<p class="mono-label ipam-label">BLOCK PLAN — every range has exactly one job</p>' +
      '<table class="data-table ipam-table"><thead><tr class="ipam-headrow">' +
      '<th class="ipam-th"><span class="mono-label">Range</span></th>' +
      '<th class="ipam-th"><span class="mono-label">Use</span></th>' +
      "</tr></thead><tbody>" + planRows + "</tbody></table></div>" +
      "<div>" +
      '<p class="mono-label ipam-label">DEVICE RECORDS — as documented today</p>' +
      '<table class="data-table ipam-table"><thead><tr class="ipam-headrow">' +
      '<th class="ipam-th"><span class="mono-label">Device</span></th>' +
      '<th class="ipam-th"><span class="mono-label">IP</span></th>' +
      '<th class="ipam-th"><span class="mono-label">Kind</span></th>' +
      '<th class="ipam-th"><span class="mono-label">Note</span></th>' +
      "</tr></thead><tbody>" + recRows + "</tbody></table></div></div>";

    if (mode === "medium") {
      body += U.workOrder("M7", {
        context:
          '<p class="rackb-intro">Two tasks for the worksheet: record the conflict, then hand out the correct address.</p>' +
          '<p class="context-box">' + esc2(D.IPAM_PRN_CONTEXT) + "</p>",
        children: grid2([
          U.textInput({
            label: "1 · The duplicate IP conflict (full address)", value: s.ipam.dupIp,
            path: "ipam.dupIp", placeholder: "10.20.10.___",
          }),
          U.textInput({
            label: "2 · PRN-206 correct new address", value: s.ipam.prnIp,
            path: "ipam.prnIp", placeholder: "10.20.10.___",
          }),
        ]),
      });
    }
    if (mode === "hard") {
      var issueBtns = D.IPAM_ISSUES.map(function (i) {
        var on = s.ipam.issues.indexOf(i.id) >= 0;
        return (
          '<button type="button" class="focus-ink toggle-chip' + (on ? " toggle-chip-on" : "") + '"' +
          ' data-action="toggle-issue" data-id="' + i.id + '" aria-pressed="' + on + '">' +
          esc2(i.label) + "</button>"
        );
      }).join("");
      body += U.workOrder("H2", {
        context:
          '<p class="rackb-intro">Full reconciliation: find <strong>all three</strong> discrepancies, then commit corrective values. Device reality: <span class="mono-inline">' +
          esc2(D.IPAM_GW_REality) + "</span></p>" +
          '<p class="context-box">' + esc2(D.IPAM_H_CONTEXT_DUP) + "</p>" +
          '<p class="context-box">' + esc2(D.IPAM_PRN_CONTEXT) + "</p>",
        children:
          '<p class="mono-label ipam-label">IDENTIFIED DISCREPANCIES</p>' +
          '<div class="chip-flex">' + issueBtns + "</div>" +
          grid3([
            U.textInput({ label: "Fix · PC-OPS-3 moves to", value: s.ipam.fixes.dup, path: "ipam.fixes.dup", placeholder: "10.20.10.___" }),
            U.textInput({ label: "Fix · PRN-206 moves to", value: s.ipam.fixes.prn, path: "ipam.fixes.prn", placeholder: "10.20.10.___" }),
            U.textInput({ label: "Fix · Gateway cell corrected to", value: s.ipam.fixes.gw, path: "ipam.fixes.gw", placeholder: "10.20.10.___" }),
          ]),
      });
    }
    return U.sheetFrame("06", "IPAM Worksheet — 10.20.10.0/24 (VLAN 10 STAFF)", meta.purpose, meta.icon, body);
  }

  /* ================================================== SHEET 07 — SLA ===== */

  function slaSheet(s) {
    var mode = s.mode;
    var meta = D.SHEETS[6];
    var tierRows = D.SLA_TIERS.map(function (t) {
      return (
        '<tr class="sla-row"><td class="sla-tier">' + esc2(t.name) + "</td>" +
        '<td class="sla-mono">' + esc2(t.uptime) + "</td>" +
        '<td class="sla-cell">' + esc2(t.response) + "</td>" +
        '<td class="sla-maxdown">' + esc2(t.maxDown) + "</td></tr>"
      );
    }).join("");

    var body =
      '<div class="table-scroll"><table class="data-table sla-table">' +
      '<caption class="sr-only">SLA tiers under contract</caption>' +
      '<thead><tr class="sla-headrow">' +
      '<th class="sla-th"><span class="mono-label">Tier</span></th>' +
      '<th class="sla-th"><span class="mono-label">Uptime</span></th>' +
      '<th class="sla-th"><span class="mono-label">Response</span></th>' +
      '<th class="sla-th"><span class="mono-label">Max downtime / 30-day month</span></th>' +
      "</tr></thead><tbody>" + tierRows + "</tbody></table></div>";

    if (mode === "medium") {
      body += U.workOrder("M8", {
        context: "<p>" + esc2(D.SLA_MATH.question) + "</p>",
        children:
          '<div class="max-w-xs">' +
          U.textInput({ label: "Maximum downtime (minutes)", value: s.sla.downtimeMin, path: "sla.downtimeMin", placeholder: "e.g. 43.2" }) +
          "</div>",
      });
      body += U.workOrder("M9", {
        context: "<p>Right-size each service: read the needs line, then pick the cheapest tier that truly covers it.</p>",
        children:
          '<div class="svc-grid">' +
          D.SLA_SERVICES.map(function (svc) {
            return (
              '<div class="svc-card"><p class="svc-name">' + esc2(svc.name) + "</p>" +
              '<p class="svc-needs">' + esc2(svc.needs) + "</p>" +
              U.picker({
                label: "Tier", value: s.sla.tiers[svc.id] || null, path: "sla.tiers." + svc.id,
                options: D.SLA_TIERS.map(function (t) { return { value: t.id, label: t.name }; }),
                ariaLabel: "Tier for " + svc.name,
              }) +
              "</div>"
            );
          }).join("") +
          "</div>",
      });
    }
    if (mode === "hard") {
      var incidentRows = D.SLA_INCIDENTS.map(function (i) {
        return (
          '<tr class="inc-row"><td class="inc-date">' + esc2(i.date) + "</td>" +
          '<td class="inc-mins">' + i.mins + " min</td></tr>"
        );
      }).join("");
      body += U.workOrder("H3", {
        context:
          '<p class="rackb-intro">The Gold-tier checkout service had a rough September (30-day month). Verify the contract.</p>' +
          '<table class="data-table inc-table"><thead><tr class="inc-headrow">' +
          '<th class="inc-th"><span class="mono-label">Incident</span></th>' +
          '<th class="inc-th"><span class="mono-label">Duration</span></th>' +
          "</tr></thead><tbody>" + incidentRows + "</tbody></table>",
        children: grid3([
          U.textInput({ label: "Total outage minutes in September", value: s.sla.verify.total, path: "sla.verify.total", placeholder: "min" }),
          U.textInput({ label: "Achieved availability (%)", value: s.sla.verify.availability, path: "sla.verify.availability", placeholder: "99.__" }),
          U.picker({
            label: "Gold SLA breached?", value: s.sla.verify.breach, path: "sla.verify.breach",
            options: [
              { value: "yes", label: "Yes — credits owed" },
              { value: "no", label: "No — within SLA" },
            ],
          }),
        ]),
      });
    }
    return U.sheetFrame("07", "SLA Desk — Carrier Contracts", meta.purpose, meta.icon, body);
  }

  /* ============================================== SHEET 08 — WIRELESS ==== */

  function heatColor(dbm) {
    if (dbm >= -55) return "#4ade80"; // strong
    if (dbm >= -65) return "#d9f99d";
    if (dbm >= -75) return "#fde047";
    return "#f87171"; // weak
  }

  function wirelessSheet(s) {
    var mode = s.mode;
    var meta = D.SHEETS[7];

    var rows = "";
    for (var r = 0; r < D.HEATMAP_ROWS; r++) {
      var cells = "";
      for (var c = 0; c < D.HEATMAP_COLS; c++) {
        var id = "r" + (r + 1) + "c" + (c + 1);
        var v = D.HEATMAP[r][c];
        var ap = null;
        D.HEATMAP_APS.forEach(function (a) { if (a.cell === id) ap = a; });
        var selected = s.wireless.deadCell === id;
        var label =
          "Cell row " + (r + 1) + " column " + (c + 1) + ", " + v + " dBm" +
          (ap ? ", " + ap.id + " on channel " + ap.channel : "");
        cells +=
          '<button type="button" role="gridcell" class="heat-cell" data-dead="' + selected + '"' +
          ' data-action="set-dead-cell" data-id="' + id + '" aria-selected="' + selected + '"' +
          ' aria-label="' + escAttr2(label) + '" style="background-color:' + heatColor(v) + '">' +
          '<span class="heat-val">' + v + "</span>" +
          (ap
            ? '<span class="heat-ap">' + esc2(ap.id.slice(3)) + "·" + ap.channel + "</span>"
            : "") +
          "</button>";
      }
      rows += '<div class="heat-row" role="row">' + cells + "</div>";
    }

    var legend =
      '<div class="heat-legend">' +
      '<span class="heat-swatch" style="background-color:#4ade80" aria-hidden="true"></span> ≥ −55 strong ' +
      '<span class="heat-swatch" style="background-color:#d9f99d" aria-hidden="true"></span> −56…−65 good ' +
      '<span class="heat-swatch" style="background-color:#fde047" aria-hidden="true"></span> −66…−75 marginal ' +
      '<span class="heat-swatch" style="background-color:#f87171" aria-hidden="true"></span> ≤ −76 weak</div>';

    var notes =
      '<p class="heat-notes">Survey notes: AP-301 covers the west wing, AP-302 the east wing, AP-303 the north corridor (newly installed, ' +
      "currently channel " + D.HEATMAP_APS[2].channel + "). A <strong>new concrete break-room wall</strong> went up recently in the north-east corner.</p>";

    var right = "<div>";
    if (mode === "medium") {
      right += U.workOrder("M10", {
        context: "<p>Dead zones are where usability dies — find the weakest measured cell, name the physics, then free the airwaves.</p>",
        children:
          '<div class="wireless-fields">' +
          U.picker({
            label: "Cause of the dead zone", value: s.wireless.cause, path: "wireless.cause",
            options: D.WIRELESS_CAUSES.map(function (o) { return { value: o, label: o }; }),
          }) +
          U.picker({
            label: "AP-303 channel (1 / 6 / 11 only — non-overlapping)", value: s.wireless.ch303,
            path: "wireless.ch303",
            options: D.WIRELESS_CH_OPTIONS.map(function (o) { return { value: o, label: "Channel " + o }; }),
          }) +
          "</div>",
      });
    }
    if (mode === "hard") {
      right += U.workOrder("H4", {
        context: "<p>Commit the redesign for floor 3: airtime, hardware, and the material that caused it all.</p>",
        children:
          '<div class="wireless-fields">' +
          U.picker({
            label: "Channel plan for AP-301 / AP-302 / AP-303", value: s.wireless.redesign.channels,
            path: "wireless.redesign.channels",
            options: D.WIRELESS_REDESIGN.channels.options.map(function (o) { return { value: o, label: o }; }),
          }) +
          U.picker({
            label: "Minimum hardware change to cover the dead zone", value: s.wireless.redesign.apCount,
            path: "wireless.redesign.apCount",
            options: D.WIRELESS_REDESIGN.apCount.options.map(function (o) { return { value: o, label: o }; }),
          }) +
          U.picker({
            label: "Wall material recorded as the attenuation cause", value: s.wireless.redesign.wall,
            path: "wireless.redesign.wall",
            options: D.WIRELESS_REDESIGN.wall.options.map(function (o) { return { value: o, label: o }; }),
          }) +
          "</div>",
      });
    }
    right += "</div>";

    var body =
      '<div class="wireless-grid"><div>' +
      '<p class="mono-label heat-kicker">MEASURED SIGNAL (dBm) · 2.4 GHz · click the worst cell</p>' +
      '<div class="heat-frame" role="grid" aria-label="Floor 3 wireless heat map">' + rows + "</div>" +
      legend + notes + "</div>" + right + "</div>";

    return U.sheetFrame("08", "Wireless Survey — Floor 3 Heat Map", meta.purpose, meta.icon, body);
  }

  /* ================================================ SHEET 09 — INDEX ===== */

  function indexSheet(s) {
    var mode = s.mode;
    var meta = D.SHEETS[8];
    var body = "";

    if (mode === "medium") {
      body += U.workOrder("M11", {
        context: "<p>Six requests landed on your desk. For each, pull the ONE document that answers it.</p>",
        children: grid2(
          D.INDEX_SCENARIOS.map(function (sc) {
            return U.picker({
              label: sc.text, value: s.index.match[sc.id] || null, path: "index.match." + sc.id,
              options: D.INDEX_DOC_OPTIONS.map(function (o) { return { value: o.id, label: o.label }; }),
              ariaLabel: "Document for scenario " + sc.id,
            });
          })
        ),
      });
      body += U.workOrder("M12", {
        context: "<p>Vocabulary drill — match each term to its definition. (Open the Archive if one slips.)</p>",
        children: grid2(
          D.INDEX_TERMS.map(function (t) {
            return U.picker({
              label: t.term, value: s.index.terms[t.id] || null, path: "index.terms." + t.id,
              options: D.INDEX_DEFINITIONS.map(function (d) { return { value: d.id, label: d.text }; }),
              ariaLabel: "Definition for " + t.term,
            });
          })
        ),
      });
    }
    if (mode === "hard") {
      var subset = D.INDEX_DOC_OPTIONS.filter(function (o) {
        return ["inventory", "ipam", "cable", "rack", "sla"].indexOf(o.id) >= 0;
      }).map(function (o) { return { value: o.id, label: o.label }; });
      body += U.workOrder("H9", {
        context:
          "<p>AUDIT DAY: five changes are scheduled this week. For each, name the one sheet that becomes false if nobody updates it. (Doc options: " +
          esc2(D.INDEX_DOC_OPTIONS.map(function (o) { return o.label; }).join(" · ")) + ")</p>",
        children:
          '<div class="index-grid">' +
          window.LabObjectives.INDEX_CHANGES.map(function (ch) {
            return U.picker({
              label: ch.text, value: s.index.match[ch.id] || null, path: "index.match." + ch.id,
              options: subset, ariaLabel: "Stale sheet for change " + ch.id,
            });
          }).join("") +
          "</div>",
      });
    }
    return U.sheetFrame("09", "The Index — Pull the Right Sheet", meta.purpose, meta.icon, body);
  }

  /* ------------------------------------------------------- dispatcher ---- */

  function render(state) {
    switch (state.view) {
      case "diagrams": return diagramsSheet(state);
      case "rack": return rackSheet(state);
      case "cable": return cableSheet(state);
      case "netdiagram": return netdiagramSheet(state);
      case "inventory": return inventorySheet(state);
      case "ipam": return ipamSheet(state);
      case "sla": return slaSheet(state);
      case "wireless": return wirelessSheet(state);
      case "index": return indexSheet(state);
      case "archive": return U.renderArchive();
      case "quiz": return U.renderQuiz();
      case "notes": return U.renderNotes();
      default: return diagramsSheet(state);
    }
  }

  window.LabSheets = { render: render };
})();
