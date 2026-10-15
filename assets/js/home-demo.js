/* Home-page exercise previews.
 *
 * Three small, real interactions in place of the old filmed demo: a log viewer whose
 * filter works, a shell that answers a fixed set of commands, and an ordering exercise
 * that marks itself. Nothing here touches the network, the store or the statistics
 * provider, and every control is a real button or input so the keyboard works without
 * extra code.
 *
 * Two deliberate choices:
 *   - The controller class is added only after this file has wired the tab strip, which
 *     is what turns three stacked panels into tabs. Without JavaScript a visitor sees all
 *     three exercises rather than one empty box.
 *   - Each of the four sections checks its own markup and returns quietly if it is not
 *     there, so removing one panel later cannot take the other two down with it.
 */
(function () {
  'use strict';

  var root = document.getElementById('cm-demo');
  if (!root) {
    return;
  }

  /* ---------------------------------------------------------------- tabs */
  var tabStrip = root.querySelector('.cm-demo__tabs');
  var tabs = Array.prototype.slice.call(root.querySelectorAll('.cm-demo__tab'));
  var panels = tabs.map(function (tab) {
    return document.getElementById(tab.getAttribute('aria-controls'));
  });

  function selectTab(index, moveFocus) {
    tabs.forEach(function (tab, i) {
      var on = i === index;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      if (panels[i]) {
        panels[i].setAttribute('data-active', on ? 'true' : 'false');
        panels[i].hidden = !on;
      }
    });
    if (moveFocus && tabs[index]) {
      tabs[index].focus();
    }
  }

  if (tabStrip && tabs.length && panels.every(Boolean)) {
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { selectTab(i, false); });
    });

    tabStrip.addEventListener('keydown', function (event) {
      var current = tabs.indexOf(document.activeElement);
      if (current === -1) {
        return;
      }
      var next = -1;
      if (event.key === 'ArrowRight') { next = (current + 1) % tabs.length; }
      else if (event.key === 'ArrowLeft') { next = (current - 1 + tabs.length) % tabs.length; }
      else if (event.key === 'Home') { next = 0; }
      else if (event.key === 'End') { next = tabs.length - 1; }
      if (next !== -1) {
        event.preventDefault();
        selectTab(next, true);
      }
    });

    selectTab(0, false);
    root.classList.add('cm-demo--tabbed');
  }

  /* ------------------------------------------------------- log viewer */
  var logInput = document.getElementById('cm-log-filter');
  var logBody = document.getElementById('cm-log-body');
  var logCount = document.getElementById('cm-log-count');
  var logNote = document.getElementById('cm-log-note');

  if (logInput && logBody && logCount && logNote) {
    var logRows = Array.prototype.slice.call(logBody.rows);
    var LOG_NOTE = 'That is the exercise: filter until the signal is the only thing left. '
      + 'Twelve failed logons, a success from the same address, a service installed as SYSTEM, '
      + 'then the data leaves — four lines that only tell the story in that order.';

    var applyLogFilter = function () {
      var query = (logInput.value || '').trim().toLowerCase();
      var shown = 0;
      var signals = 0;
      logRows.forEach(function (row) {
        var hit = !query || row.textContent.toLowerCase().indexOf(query) !== -1;
        row.hidden = !hit;
        row.setAttribute('data-hit', hit && query ? '1' : '0');
        if (hit) {
          shown += 1;
          if (row.hasAttribute('data-signal')) {
            signals += 1;
          }
        }
      });
      logCount.textContent = shown + ' of ' + logRows.length + ' lines';
      var isolated = shown > 0 && shown === signals;
      logNote.hidden = !isolated;
      logNote.textContent = isolated ? LOG_NOTE : '';
    };

    logInput.addEventListener('input', applyLogFilter);
    logInput.addEventListener('search', applyLogFilter);
    applyLogFilter();
  }

  /* ---------------------------------------------------------- terminal */
  var termOut = document.getElementById('cm-term-out');
  var termForm = document.getElementById('cm-term-form');
  var termInput = document.getElementById('cm-term-input');
  var termChips = document.getElementById('cm-term-chips');

  if (termOut && termForm && termInput) {
    var COMMANDS = {
      'help': [
        'Commands this preview answers:',
        '  whoami            who the session is',
        '  id                user, groups and sudo membership',
        '  hostname          the machine you are on',
        '  ps aux            running processes, briefly',
        '  netstat -tunp     established connections',
        '  ls -la /tmp       what is sitting in /tmp',
        '  clear             wipe this screen',
        'Anything else answers "command not found". The real exercises ship the full output.'
      ].join('\n'),
      'whoami': 'j.wilson',
      'id': 'uid=1002(j.wilson) gid=1002(j.wilson) groups=1002(j.wilson),27(sudo)',
      'hostname': 'NYC-WS-114',
      'ps aux': [
        'USER       PID %CPU %MEM COMMAND',
        'root         1  0.0  0.1 /sbin/init',
        'j.wilson  2210  0.2  1.1 /usr/bin/firefox',
        'j.wilson  4188  0.1  0.3 /tmp/.sysupdate',
        'root      5120  0.0  0.1 /usr/local/bin/.nsync -c hxxp://198[.]51[.]100[.]63/k'
      ].join('\n'),
      'netstat -tunp': [
        'Proto Recv-Q Send-Q Local Address          Foreign Address        State       PID/Program',
        'tcp        0      0 10[.]20[.]4[.]31:51244  198[.]51[.]100[.]63:443 ESTABLISHED 5120/.nsync',
        'tcp        0      0 10[.]20[.]4[.]31:22     10[.]20[.]9[.]7:51422    ESTABLISHED 880/sshd'
      ].join('\n'),
      'ls -la /tmp': [
        'total 28',
        'drwxrwxrwt  9 root     root      4096 Oct 15 09:31 .',
        '-rwxr-xr-x  1 j.wilson j.wilson 14213 Oct 15 09:18 .sysupdate',
        '-rw-r--r--  1 j.wilson j.wilson   220 Oct 15 09:22 notes.txt'
      ].join('\n'),
      'clear': ''
    };

    var writeLine = function (text, kind) {
      var line = document.createElement('div');
      if (kind === 'cmd') {
        var prompt = document.createElement('b');
        prompt.textContent = 'analyst@soc:~$ ';
        line.appendChild(prompt);
        line.appendChild(document.createTextNode(text));
      } else if (kind === 'hint') {
        var hint = document.createElement('i');
        hint.textContent = text;
        line.appendChild(hint);
      } else {
        line.textContent = text;
      }
      termOut.appendChild(line);
    };

    var runCommand = function (raw) {
      var cmd = (raw || '').trim();
      if (!cmd) {
        return;
      }
      writeLine(cmd, 'cmd');
      var key = cmd.toLowerCase().replace(/\s+/g, ' ');
      if (key === 'clear') {
        termOut.innerHTML = '';
        return;
      }
      if (Object.prototype.hasOwnProperty.call(COMMANDS, key)) {
        COMMANDS[key].split('\n').forEach(function (line) { writeLine(line, 'out'); });
      } else {
        writeLine('bash: ' + cmd.replace(/[<>]/g, '') + ': command not found', 'out');
        writeLine('type help for the commands this preview answers', 'hint');
      }
      termOut.scrollTop = termOut.scrollHeight;
    };

    termForm.addEventListener('submit', function (event) {
      event.preventDefault();
      runCommand(termInput.value);
      termInput.value = '';
    });

    if (termChips) {
      termChips.addEventListener('click', function (event) {
        var button = event.target.closest ? event.target.closest('.cm-chip') : null;
        if (!button) {
          return;
        }
        runCommand(button.getAttribute('data-cmd'));
        termInput.focus();
      });
    }

    writeLine('CyberPulseAcademy preview shell — a few commands answer, nothing runs.', 'hint');
    writeLine('Type help, or tap a command below.', 'hint');
    runCommand('whoami');
  }

  /* ----------------------------------------------------- ordering drill */
  var rankList = document.getElementById('cm-rank');
  var rankCheck = document.getElementById('cm-rank-check');
  var rankReset = document.getElementById('cm-rank-reset');
  var rankResult = document.getElementById('cm-rank-result');
  var rankNote = document.getElementById('cm-rank-note');

  if (rankList && rankCheck && rankReset && rankResult && rankNote) {
    var RANK_NOTE = 'Failed logons, then a success from the same address, then persistence as a '
      + 'service, then the data leaves. The order is the finding: it separates "somebody guessed '
      + 'a password" from "somebody was already inside".';
    var originalOrder = Array.prototype.slice.call(rankList.children);

    var rankRows = function () {
      return Array.prototype.slice.call(rankList.children);
    };

    var paintRank = function (marks) {
      var rows = rankRows();
      rows.forEach(function (row, i) {
        row.setAttribute('data-first', i === 0 ? '1' : '0');
        row.setAttribute('data-last', i === rows.length - 1 ? '1' : '0');
        if (marks) {
          row.setAttribute('data-mark', Number(row.getAttribute('data-key')) === i + 1 ? 'ok' : 'bad');
        } else {
          row.removeAttribute('data-mark');
        }
      });
    };

    var moveRow = function (row, direction) {
      if (!row) {
        return;
      }
      var sibling = direction === 'up' ? row.previousElementSibling : row.nextElementSibling;
      if (!sibling) {
        return;
      }
      if (direction === 'up') {
        rankList.insertBefore(row, sibling);
      } else {
        rankList.insertBefore(sibling, row);
      }
      rankResult.textContent = '';
      rankNote.hidden = true;
      paintRank(false);
      var button = row.querySelector('.cm-rank__move[data-dir="' + direction + '"]');
      if (button) {
        button.focus();
      }
    };

    rankList.addEventListener('click', function (event) {
      var button = event.target.closest ? event.target.closest('.cm-rank__move') : null;
      if (button) {
        moveRow(button.closest('.cm-rank__row'), button.getAttribute('data-dir'));
      }
    });

    rankCheck.addEventListener('click', function () {
      var rows = rankRows();
      var right = rows.filter(function (row, i) {
        return Number(row.getAttribute('data-key')) === i + 1;
      }).length;
      paintRank(true);
      rankResult.textContent = right + ' of ' + rows.length + ' in the right place.';
      var solved = right === rows.length;
      rankNote.hidden = !solved;
      rankNote.textContent = solved ? RANK_NOTE : '';
    });

    rankReset.addEventListener('click', function () {
      originalOrder.forEach(function (row) { rankList.appendChild(row); });
      rankResult.textContent = '';
      rankNote.hidden = true;
      paintRank(false);
    });

    paintRank(false);
  }
})();
