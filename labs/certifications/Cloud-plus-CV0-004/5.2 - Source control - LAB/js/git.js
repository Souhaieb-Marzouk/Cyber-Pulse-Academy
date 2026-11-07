// ─────────────────────────────────────────────────────────────────────────────
// THE SWITCH YARD — js/git.js
// Mini-Git engine: pure state transitions for the simulated repository.
// Ported 1:1 from the framework lab's git.ts — identical logic, ids, messages.
// All functions take a RepoState and return a NEW state (structuredClone).
// Trees are full snapshots (small repo) — simple, robust, deterministic.
// ─────────────────────────────────────────────────────────────────────────────
(function (LAB) {
  'use strict';

  LAB.AUTHOR_YOU = 'You (yardmaster)';

  LAB.makeCommitId = function (n) {
    // deterministic pseudo-hash, no Math.random → hydration-safe
    var h = (n * 2654435761) >>> 0;
    h ^= h >>> 13; h = (h * 1274126177) >>> 0; h ^= h >>> 16;
    return h.toString(16).padStart(7, '0').slice(0, 7);
  };

  LAB.headCommit = function (s) {
    var tip = s.branches[s.head];
    return s.commits[tip];
  };

  LAB.clockTime = function (n) {
    var m = 12 + n;
    return '08:' + String(m).padStart(2, '0');
  };

  // ── diff3 (LCS hunks) ────────────────────────────────────────────────────────
  function lcsHunks(base, side) {
    var n = base.length, m = side.length;
    var dp = [];
    for (var i0 = 0; i0 <= n; i0++) dp.push(new Array(m + 1).fill(0));
    for (var i = n - 1; i >= 0; i--)
      for (var j = m - 1; j >= 0; j--)
        dp[i][j] = base[i] === side[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    var hunks = [];
    var i2 = 0, j2 = 0;
    var cur = null;
    function flush() { if (cur) { hunks.push(cur); cur = null; } }
    while (i2 < n && j2 < m) {
      if (base[i2] === side[j2]) { flush(); i2++; j2++; }
      else if (dp[i2 + 1][j2] >= dp[i2][j2 + 1]) { cur = cur || { bStart: i2, bEnd: i2, lines: [] }; cur.bEnd = i2 + 1; i2++; }
      else { cur = cur || { bStart: i2, bEnd: i2, lines: [] }; cur.lines.push(side[j2]); j2++; }
    }
    while (i2 < n) { cur = cur || { bStart: i2, bEnd: i2, lines: [] }; cur.bEnd = i2 + 1; i2++; }
    while (j2 < m) { cur = cur || { bStart: i2, bEnd: i2, lines: [] }; cur.lines.push(side[j2]); j2++; }
    flush();
    return coalesce(hunks);
  }

  function coalesce(hunks) {
    var out = [];
    hunks.forEach(function (h) {
      var last = out[out.length - 1];
      if (last && h.bStart <= last.bEnd + 1) { // adjacent/overlapping → one region
        last.lines.push.apply(last.lines, h.lines);
        last.bEnd = Math.max(last.bEnd, h.bEnd);
      } else out.push({ bStart: h.bStart, bEnd: h.bEnd, lines: h.lines.slice() });
    });
    return out;
  }

  LAB.threeWay = function (baseStr, oursStr, theirsStr, sourceLabel) {
    var base = baseStr === '' ? [] : baseStr.split('\n');
    var ours = oursStr === '' ? [] : oursStr.split('\n');
    var theirs = theirsStr === '' ? [] : theirsStr.split('\n');
    if (oursStr === theirsStr) return { text: oursStr, conflict: false };
    var ho = coalesce(lcsHunks(base, ours));
    var ht = coalesce(lcsHunks(base, theirs));
    // detect overlaps
    var events = [];
    ho.forEach(function (h) { events.push({ start: h.bStart, end: h.bEnd, ours: h.lines, theirs: null }); });
    ht.forEach(function (h) { events.push({ start: h.bStart, end: h.bEnd, ours: null, theirs: h.lines }); });
    events.sort(function (a, b) { return a.start - b.start || a.end - b.end; });
    var merged = [];
    var conflict = false;
    var pos = 0;
    var k = 0;
    while (k < events.length) {
      var e = events[k];
      // group overlapping events
      var end = e.end;
      var group = [e];
      var kk = k + 1;
      while (kk < events.length && events[kk].start < end) { end = Math.max(end, events[kk].end); group.push(events[kk]); kk++; }
      // unchanged gap
      for (var x = pos; x < e.start; x++) merged.push(base[x]);
      var hasO = group.some(function (g) { return g.ours !== null; });
      var hasT = group.some(function (g) { return g.theirs !== null; });
      if (hasO && hasT) {
        // conflict unless identical replacement
        var oLines = [];
        var tLines = [];
        group.forEach(function (g) { if (g.ours) oLines.push.apply(oLines, g.ours); if (g.theirs) tLines.push.apply(tLines, g.theirs); });
        if (oLines.join('\n') === tLines.join('\n')) merged.push.apply(merged, oLines);
        else {
          conflict = true;
          merged.push('<<<<<<< HEAD');
          merged.push.apply(merged, oLines);
          merged.push('=======');
          merged.push.apply(merged, tLines);
          merged.push('>>>>>>> ' + sourceLabel);
        }
      } else if (hasO) {
        group.forEach(function (g) { if (g.ours) merged.push.apply(merged, g.ours); });
      } else if (hasT) {
        group.forEach(function (g) { if (g.theirs) merged.push.apply(merged, g.theirs); });
      }
      pos = end;
      k = kk;
    }
    for (var x2 = pos; x2 < base.length; x2++) merged.push(base[x2]);
    return { text: merged.join('\n'), conflict: conflict };
  };

  // ── helpers ──────────────────────────────────────────────────────────────────
  LAB.ancestors = function (s, id) {
    var out = new Set();
    var stack = [id];
    while (stack.length) {
      var c = stack.pop();
      if (!c || out.has(c)) continue;
      out.add(c);
      var cm = s.commits[c];
      if (cm) stack.push.apply(stack, cm.parents);
    }
    return out;
  };

  LAB.mergeBase = function (s, a, b) {
    var ancA = LAB.ancestors(s, s.branches[a]);
    var stack = [s.branches[b]];
    var seen = new Set();
    while (stack.length) {
      var c = stack.shift();
      if (!c || seen.has(c)) continue;
      seen.add(c);
      if (ancA.has(c)) return c;
      var cm = s.commits[c];
      if (cm) stack.push.apply(stack, cm.parents);
    }
    return null;
  };

  function affectedPaths(s, base, sourceTip) {
    var out = new Set();
    if (!base) return [];
    var all = new Set(Object.keys(base.tree).concat(Object.keys(sourceTip.tree)));
    all.forEach(function (p) {
      if ((base.tree[p] ?? null) !== (sourceTip.tree[p] ?? null)) out.add(p);
    });
    return Array.from(out);
  }

  LAB.gitignorePatterns = function (s) {
    var gi = s.files['.gitignore'] ?? '';
    return gi.split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l && !l.startsWith('#'); });
  };

  LAB.isIgnored = function (s, path) {
    var pats = LAB.gitignorePatterns(s);
    var base = path.split('/').pop() || path;
    return pats.some(function (pat) {
      if (pat === path) return true;
      if (pat.includes('/')) {
        var rx = new RegExp('^' + pat.split('*').map(escRx).join('[^/]*') + '$');
        return rx.test(path);
      }
      var rx2 = new RegExp('^' + pat.split('*').map(escRx).join('.*') + '$');
      return rx2.test(base);
    });
  };

  function escRx(x) { return x.replace(/[.+?^${}()|[\]\\]/g, '\\$&'); }

  LAB.gitStatus = function (s) {
    var tree = LAB.headCommit(s).tree;
    var tracked = new Set(Object.keys(tree));
    var stagedPaths = Object.keys(s.staged);
    var modified = [];
    tracked.forEach(function (p) {
      if (p in s.staged) return;
      if (!(p in s.files) || s.files[p] !== tree[p]) modified.push(p);
    });
    var untracked = [];
    var ignored = [];
    Object.keys(s.files).forEach(function (p) {
      if (tracked.has(p) || p in s.staged) return;
      if (LAB.isIgnored(s, p)) ignored.push(p);
      else untracked.push(p);
    });
    return {
      modified: modified.sort(),
      stagedPaths: stagedPaths.sort(),
      untracked: untracked.sort(),
      ignored: ignored.sort()
    };
  };

  LAB.hasMarkers = function (text) {
    return /^<{7} |^={7}$|^>{7} /m.test(text);
  };

  // ── actions (clone → mutate → return) ────────────────────────────────────────
  function lg(s, msg, kind) {
    s.log = s.log.slice(-120).concat([{ t: LAB.clockTime(s.nextCommitNum), msg: msg, kind: kind || 'info' }]);
  }

  LAB.stageFile = function (s0, path) {
    var s = structuredClone(s0);
    var tree = LAB.headCommit(s).tree;
    if (!(path in s.files) && !(path in tree)) { lg(s, 'Nothing known about ' + path + '.', 'err'); return s; }
    if (!(path in s.files)) s.staged[path] = null; // deleted in working tree
    else s.staged[path] = s.files[path];
    lg(s, 'staged → ' + path + ' (railcar on the siding)', 'ok');
    return s;
  };

  LAB.unstageFile = function (s0, path) {
    var s = structuredClone(s0);
    delete s.staged[path];
    lg(s, 'unstaged → ' + path + ' (railcar pulled off the siding)');
    return s;
  };

  LAB.untrackFile = function (s0, path) {
    var s = structuredClone(s0);
    s.staged[path] = null;
    lg(s, 'untracked ' + path + ' — file stays on disk, leaves the NEXT commit (history untouched!)', 'ok');
    return s;
  };

  LAB.saveFile = function (s0, path, content) {
    var s = structuredClone(s0);
    s.files[path] = content;
    lg(s, 'saved working-tree edit → ' + path);
    return s;
  };

  LAB.commit = function (s0, message, author) {
    var s = structuredClone(s0);
    author = author || LAB.AUTHOR_YOU;
    var stagedEntries = Object.entries(s.staged);
    if (stagedEntries.length === 0) { lg(s, 'Refusing to commit: the siding is empty. Stage changes first.', 'err'); return s; }
    if (s.merging) {
      var unresolved = s.merging.conflicts.filter(function (p) { return !(p in s.staged); });
      if (unresolved.length) { lg(s, 'Conflicts not resolved & staged: ' + unresolved.join(', '), 'err'); return s; }
    }
    var parent = LAB.headCommit(s);
    var tree = Object.assign({}, parent.tree);
    stagedEntries.forEach(function (entry) {
      var p = entry[0], v = entry[1];
      if (v === null) delete tree[p]; else tree[p] = v;
    });
    var id = LAB.makeCommitId(s.nextCommitNum++);
    var sourceTipId = s.merging && s.branches[s.merging.source] ? s.branches[s.merging.source] : undefined;
    var parents = s.merging && sourceTipId ? [s.branches[s.head], sourceTipId] : [parent.id];
    s.commits[id] = { id: id, message: message, author: author, time: LAB.clockTime(s.nextCommitNum), parents: parents, tree: tree };
    s.seq['commit:' + id] = s.nextCommitNum;
    s.branches[s.head] = id;
    lg(s, 'commit ' + id + ' on ' + s.head + ' — "' + message + '" (' + stagedEntries.length + ' file' + (stagedEntries.length > 1 ? 's' : '') + ')', 'ok');
    if (s.merging) { lg(s, 'Junction cleared: merge commit links both tracks.', 'ok'); s.merging = null; }
    s.staged = {};
    return s;
  };

  LAB.createBranch = function (s0, name, andSwitch) {
    var s = structuredClone(s0);
    var clean = name.trim();
    if (!clean || /\s/.test(clean)) { lg(s, 'Branch name cannot contain spaces.', 'err'); return s; }
    if (s.branches[clean]) { lg(s, 'Track "' + clean + '" already exists.', 'err'); return s; }
    s.branches[clean] = s.branches[s.head];
    lg(s, 'laid new track → ' + clean + ' @ ' + s.branches[clean], 'ok');
    if (andSwitch) return LAB.checkout(s, clean);
    return s;
  };

  LAB.checkout = function (s0, name) {
    var s = structuredClone(s0);
    if (!s.branches[name]) { lg(s, 'No such track: ' + name, 'err'); return s; }
    var status = LAB.gitStatus(s);
    if (status.stagedPaths.length) { lg(s, 'Siding must be clear before switching tracks: commit or unstage staged changes.', 'err'); return s; }
    var from = LAB.headCommit(s).tree;
    var to = s.commits[s.branches[name]].tree;
    var risky = status.modified.filter(function (p) { return (from[p] ?? null) !== (to[p] ?? null); });
    if (risky.length) { lg(s, 'Unsaved edits would be overwritten on ' + name + ': ' + risky.join(', ') + '. Commit or save them first.', 'err'); return s; }
    var keep = {};
    Object.keys(s.files).forEach(function (p) {
      var v = s.files[p];
      if (!(p in from) && !(p in to)) keep[p] = v; // untracked/ignored carried
      else if ((from[p] ?? null) === (to[p] ?? null)) keep[p] = v; // safe local edit carried
    });
    s.files = Object.assign({}, to, keep);
    s.head = name;
    lg(s, 'HEAD locomotive moved to ' + name, 'ok');
    return s;
  };

  LAB.mergeBranch = function (s0, branch) {
    var s = structuredClone(s0);
    if (!s.branches[branch]) { lg(s, 'No such track: ' + branch, 'err'); return s; }
    if (branch === s.head) { lg(s, 'Cannot merge a track into itself.', 'err'); return s; }
    if (s.merging) { lg(s, 'Finish the merge in progress first (resolve, stage, commit).', 'err'); return s; }
    var status = LAB.gitStatus(s);
    var baseId = LAB.mergeBase(s, s.head, branch);
    if (!baseId) { lg(s, 'No common ancestor — unrelated histories.', 'err'); return s; }
    var base = s.commits[baseId];
    var sourceTip = s.commits[s.branches[branch]];
    var affected = affectedPaths(s, base, sourceTip);
    var tree = LAB.headCommit(s).tree;
    var dirtyOverlap = status.stagedPaths.concat(status.modified).filter(function (p) { return affected.includes(p); });
    if (dirtyOverlap.length) { lg(s, 'Uncommitted changes touch files this merge also changes: ' + dirtyOverlap.join(', ') + '. Commit them first.', 'err'); return s; }
    // fast-forward?
    if (tree === sourceTip.tree && LAB.ancestors(s, s.branches[s.head]).has(baseId) && s.branches[s.head] === baseId) {
      s.branches[s.head] = sourceTip.id;
      s.files = Object.assign({}, sourceTip.tree);
      lg(s, 'Fast-forward: ' + s.head + ' advanced to ' + sourceTip.id, 'ok');
      return s;
    }
    var conflicts = [];
    var mergedFiles = Object.assign({}, s.files);
    affected.forEach(function (p) {
      var r = LAB.threeWay(base.tree[p] ?? '', tree[p] ?? '', sourceTip.tree[p] ?? '', branch);
      if (r.text === (tree[p] ?? '')) return; // ours already correct
      mergedFiles[p] = r.text;
      if (r.conflict) conflicts.push(p);
    });
    s.files = mergedFiles;
    if (conflicts.length) {
      s.merging = { source: branch, headBefore: s.branches[s.head], conflicts: conflicts };
      lg(s, 'JUNCTION CLASH on ' + conflicts.join(', ') + ' — resolve markers, stage, then commit the merge.', 'err');
    } else {
      var id = LAB.makeCommitId(s.nextCommitNum++);
      var mergeTreePatch = {};
      affected.forEach(function (p) { if (mergedFiles[p] !== undefined) mergeTreePatch[p] = mergedFiles[p]; });
      s.commits[id] = {
        id: id, message: "Merge branch '" + branch + "' into " + s.head, author: LAB.AUTHOR_YOU,
        time: LAB.clockTime(s.nextCommitNum), parents: [s.branches[s.head], sourceTip.id],
        tree: Object.assign({}, tree, mergeTreePatch)
      };
      s.branches[s.head] = id;
      lg(s, 'Auto-merge clean → merge commit ' + id + ' (both tracks coupled).', 'ok');
    }
    return s;
  };

  LAB.tagCommit = function (s0, name) {
    var s = structuredClone(s0);
    var clean = name.trim();
    if (!clean) return s;
    if (s.tags[clean]) { lg(s, 'Tag "' + clean + '" already stamped.', 'err'); return s; }
    s.tags[clean] = s.branches[s.head];
    lg(s, 'stamped tag ' + clean + ' → ' + s.branches[s.head], 'ok');
    return s;
  };

  LAB.pushBranch = function (s0, branch) {
    var s = structuredClone(s0);
    if (!s.branches[branch]) { lg(s, 'No such track: ' + branch, 'err'); return s; }
    if (branch === 'main' && s.protections.directPushBlocked) {
      lg(s, 'DISPATCH REFUSED: main is protected — direct pushes blocked. Use a pull request.', 'err');
      return s;
    }
    var local = s.branches[branch];
    if (s.remote[branch] === local) { lg(s, 'origin/' + branch + ' already up to date — nothing to dispatch.', 'info'); return s; }
    s.remote[branch] = local;
    if (!s.pushedBranches.includes(branch)) s.pushedBranches.push(branch);
    lg(s, 'dispatched ' + branch + ' → origin (' + local + ')', 'ok');
    return s;
  };

  LAB.forcePushMain = function (s0) {
    var s = structuredClone(s0);
    s.forcePushUsed = true;
    lg(s, 'FORCE-PUSH against main RECORDED — a shared-history rewrite that every crew would have to re-clone. The yard logs this as an incident.', 'err');
    return s;
  };

  LAB.openPR = function (s0, head, base, title) {
    var s = structuredClone(s0);
    if (!s.branches[head]) { lg(s, 'No such track: ' + head, 'err'); return s; }
    if (head === base) { lg(s, 'Cannot open a pull request from a track into itself — switch to the source branch first.', 'err'); return s; }
    if (s.prs.some(function (p) { return p.head === head && p.base === base && p.state === 'open'; })) { lg(s, 'An open pull request from ' + head + ' into ' + base + ' already exists.', 'err'); return s; }
    if (!s.pushedBranches.includes(head)) { lg(s, 'Dispatch ' + head + ' to origin before opening a pull request.', 'err'); return s; }
    var id = (s.prs.length ?? 0) + 101;
    s.prs = s.prs.concat([{ id: id, head: head, base: base, title: title, approvals: 0, state: 'open' }]);
    lg(s, 'PR #' + id + ' opened: ' + head + ' → ' + base + '. Awaiting review.', 'ok');
    return s;
  };

  LAB.approvePR = function (s0, prId) {
    var s = structuredClone(s0);
    var pr = s.prs.find(function (p) { return p.id === prId; });
    if (!pr) return s;
    pr.approvals += 1;
    lg(s, 'Review approval recorded on PR #' + prId + ' (' + pr.approvals + ' approval' + (pr.approvals === 1 ? '' : 's') + ').', 'ok');
    return s;
  };

  LAB.revertCommit = function (s0, id) {
    var s = structuredClone(s0);
    var target = s.commits[id];
    if (!target) return s;
    if (target.parents.length === 2) { lg(s, 'Reverting a merge commit is out of scope for this exercise.', 'err'); return s; }
    var parent = s.commits[target.parents[0]];
    if (!parent) return s;
    var status = LAB.gitStatus(s);
    if (status.stagedPaths.length) { lg(s, 'Clear the siding (commit/unstage) before a revert.', 'err'); return s; }
    var paths = new Set(Object.keys(parent.tree).concat(Object.keys(target.tree)));
    var newTree = Object.assign({}, LAB.headCommit(s).tree);
    var touched = false;
    var blocked = null;
    paths.forEach(function (p) {
      if (blocked) return;
      var before = parent.tree[p];
      var after = target.tree[p];
      if (before === after) return;
      if (newTree[p] === after) { if (before === undefined) delete newTree[p]; else newTree[p] = before; touched = true; }
      else if (newTree[p] === undefined && before === undefined) { /* already gone */ }
      else { blocked = p; }
    });
    if (blocked) { lg(s, 'Cannot revert ' + id + ' cleanly: ' + blocked + ' changed since. (Training scope: revert only applies to untouched files.)', 'err'); return s; }
    if (!touched) { lg(s, 'Nothing to revert — already reversed.', 'info'); return s; }
    var cid = LAB.makeCommitId(s.nextCommitNum++);
    s.commits[cid] = { id: cid, message: 'Revert "' + target.message + '"', author: LAB.AUTHOR_YOU, time: LAB.clockTime(s.nextCommitNum), parents: [s.branches[s.head]], tree: newTree };
    var kept = {};
    Object.keys(s.files).forEach(function (p) {
      if (!(p in newTree) && !(p in target.tree) && !(p in parent.tree)) kept[p] = s.files[p];
    });
    s.files = Object.assign({}, newTree, kept);
    s.branches[s.head] = cid;
    s.staged = {};
    lg(s, 'revert commit ' + cid + ' — undoes ' + id + ' WITHOUT rewriting history.', 'ok');
    return s;
  };

  LAB.runScanner = function (s0) {
    var s = structuredClone(s0);
    var pat = s.scannerPattern;
    if (!pat) return { state: s, findings: [], error: 'Set a detection pattern first.' };
    var rx;
    try { rx = new RegExp(pat, 'i'); } catch (e) { return { state: s, findings: [], error: 'Invalid regular expression.' }; }
    var findings = [];
    Object.keys(s.files).forEach(function (path) {
      var content = s.files[path];
      content.split('\n').forEach(function (line, idx) {
        if (rx.test(line)) findings.push({ key: path + ':' + (idx + 1), path: path, line: idx + 1, text: line.trim().slice(0, 90) });
      });
    });
    s.scannerRun = findings;
    lg(s, 'Secret sweep complete: ' + findings.length + ' finding' + (findings.length === 1 ? '' : 's') + ' for pattern /' + pat + '/', findings.length ? 'err' : 'ok');
    return { state: s, findings: findings };
  };
})(window.LAB = window.LAB || {});
