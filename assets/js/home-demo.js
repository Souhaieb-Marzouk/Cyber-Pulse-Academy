/* Home-page exercise previews.
 *
 * Three small, real interactions in place of the old filmed demo: a log viewer whose filter
 * works, a shell that answers a fixed set of commands, and an ordering exercise that marks
 * itself. Each one also plays on its own, the way the old animation did, and stops the
 * moment the visitor touches it so it becomes a real exercise they can drive.
 *
 * Deliberate choices:
 *   - The controller class is added only after this file has wired the tab strip, which is
 *     what turns three stacked panels into tabs. Without JavaScript a visitor sees all three
 *     exercises rather than one empty box.
 *   - Only the visible panel animates, and only while it is on screen. Off-screen timers
 *     are useless work, and three running cycles at once would fight for attention.
 *   - `prefers-reduced-motion: reduce` means no self-playing at all: the panels stay still
 *     and wait to be used.
 *   - While a panel animates, its live region is switched off, so a screen reader is not
 *     read every typed character and every printed line. Taking over turns it back on.
 *   - Each section checks its own markup and returns quietly if it is not there, so removing
 *     one panel later cannot take the other two down with it.
 */
(function () {
  'use strict';

  var root = document.getElementById('cm-demo');
  if (!root) {
    return;
  }

  var reduceMotion = !!(window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ------------------------------------------------------- cancellable timer ---------- */
  /* Each panel owns one player. Halting sets a flag as well as clearing the timer, so a
     callback already queued cannot restart the cycle it belonged to. */
  function Player() {
    this.stopped = false;
    this.timer = null;
  }

  Player.prototype.wait = function (ms, fn) {
    var self = this;
    this.timer = window.setTimeout(function () {
      if (!self.stopped) {
        fn();
      }
    }, ms);
  };

  Player.prototype.halt = function () {
    this.stopped = true;
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  };

  /* A panel that can play itself, be paused when it is off screen, and be taken over. */
  function Auto(panel, live, cycle, onTakeOver) {
    this.panel = panel;
    this.live = live || [];
    this.cycle = cycle;
    this.onTakeOver = onTakeOver;
    this.chip = panel ? panel.querySelector('.cm-demo__auto') : null;
    this.player = new Player();
    this.taken = false;
    this.playing = false;
  }

  Auto.prototype.play = function () {
    if (this.taken || reduceMotion || !this.cycle || this.playing) {
      return;
    }
    this.playing = true;
    this.live.forEach(function (el) { el.setAttribute('aria-live', 'off'); });
    if (this.chip) {
      this.chip.hidden = false;
    }
    this.cycle(this.player);
  };

  Auto.prototype.pause = function () {
    if (!this.playing) {
      return;
    }
    this.playing = false;
    this.player.halt();
    this.player = new Player();                 // a fresh token for the next run
    if (!this.taken) {
      this.live.forEach(function (el) { el.setAttribute('aria-live', 'polite'); });
    }
    if (this.chip) {
      this.chip.hidden = true;
    }
  };

  Auto.prototype.takeOver = function () {
    if (this.taken) {
      return;
    }
    this.taken = true;
    this.pause();
    this.live.forEach(function (el) { el.setAttribute('aria-live', 'polite'); });
    if (this.onTakeOver) {
      this.onTakeOver();
    }
  };

  /* ---------------------------------------------------------------------- tabs -------- */
  var tabStrip = root.querySelector('.cm-demo__tabs');
  var tabs = Array.prototype.slice.call(root.querySelectorAll('.cm-demo__tab'));
  var panels = tabs.map(function (tab) {
    return document.getElementById(tab.getAttribute('aria-controls'));
  });
  var activeIndex = 0;

  function selectTab(index, moveFocus) {
    activeIndex = index;
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
    sync();
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

    root.classList.add('cm-demo--tabbed');
  }

  /* ---------------------------------------------------------------- log viewer ------- */
  var logInput = document.getElementById('cm-log-filter');
  var logBody = document.getElementById('cm-log-body');
  var logCount = document.getElementById('cm-log-count');
  var logNote = document.getElementById('cm-log-note');
  var logAuto = null;

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

    /* Types a query a character at a time, the way someone narrows a log by hand. */
    var logCycle = function (player) {
      var queries = ['4625', '4[.]15'];
      var which = 0;

      var typeQuery = function (text, i, done) {
        logInput.value = text.slice(0, i);
        applyLogFilter();
        if (i < text.length) {
          player.wait(120, function () { typeQuery(text, i + 1, done); });
        } else {
          done();
        }
      };

      var step = function () {
        var query = queries[which % queries.length];
        which += 1;
        typeQuery(query, 0, function () {
          player.wait(2200, function () {
            logInput.value = '';
            applyLogFilter();
            player.wait(900, step);
          });
        });
      };

      step();
    };

    logAuto = new Auto(panels[0], [logCount], logCycle, null);
  }

  /* ----------------------------------------------------------------- terminal -------- */
  var termOut = document.getElementById('cm-term-out');
  var termForm = document.getElementById('cm-term-form');
  var termInput = document.getElementById('cm-term-input');
  var termChips = document.getElementById('cm-term-chips');
  var termAuto = null;

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

    var HINTS = [
      'Cyber Pulse Academy preview shell — a few commands answer, nothing runs.',
      'Type help, or tap a command below.'
    ];

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
      termOut.scrollTop = termOut.scrollHeight;
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

    HINTS.forEach(function (line) { writeLine(line, 'hint'); });
    runCommand('whoami');

    /* Types a command, then prints its output one line at a time. */
    var termCycle = function (player) {
      var script = ['whoami', 'ps aux', 'netstat -tunp'];
      var index = 0;

      var typeCommand = function (text, i, done) {
        termInput.value = text.slice(0, i);
        if (i < text.length) {
          player.wait(85, function () { typeCommand(text, i + 1, done); });
        } else {
          done();
        }
      };

      var printLines = function (lines, done) {
        var i = 0;
        var next = function () {
          if (i >= lines.length) {
            done();
            return;
          }
          writeLine(lines[i], 'out');
          i += 1;
          player.wait(135, next);
        };
        next();
      };

      var step = function () {
        if (index > 0 && index % script.length === 0) {
          termOut.innerHTML = '';
          HINTS.forEach(function (line) { writeLine(line, 'hint'); });
        }
        var cmd = script[index % script.length];
        index += 1;
        typeCommand(cmd, 0, function () {
          writeLine(cmd, 'cmd');
          termInput.value = '';
          printLines(COMMANDS[cmd.toLowerCase()].split('\n'), function () {
            player.wait(1600, step);
          });
        });
      };

      step();
    };

    termAuto = new Auto(panels[1], [termOut], termCycle, null);
  }

  /* ------------------------------------------------------- ordering and ranking ------ */
  var rankList = document.getElementById('cm-rank');
  var rankCheck = document.getElementById('cm-rank-check');
  var rankReset = document.getElementById('cm-rank-reset');
  var rankResult = document.getElementById('cm-rank-result');
  var rankNote = document.getElementById('cm-rank-note');
  var rankAuto = null;

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

    var moveRow = function (row, direction, moveFocus) {
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
      if (moveFocus) {
        var button = row.querySelector('.cm-rank__move[data-dir="' + direction + '"]');
        if (button) {
          button.focus();
        }
      }
    };

    var checkRank = function () {
      var rows = rankRows();
      var right = rows.filter(function (row, i) {
        return Number(row.getAttribute('data-key')) === i + 1;
      }).length;
      paintRank(true);
      rankResult.textContent = right + ' of ' + rows.length + ' in the right place.';
      var solved = right === rows.length;
      rankNote.hidden = !solved;
      rankNote.textContent = solved ? RANK_NOTE : '';
    };

    var resetRank = function () {
      originalOrder.forEach(function (row) { rankList.appendChild(row); });
      rankResult.textContent = '';
      rankNote.hidden = true;
      paintRank(false);
    };

    rankList.addEventListener('click', function (event) {
      var button = event.target.closest ? event.target.closest('.cm-rank__move') : null;
      if (button) {
        moveRow(button.closest('.cm-rank__row'), button.getAttribute('data-dir'), true);
      }
    });

    rankCheck.addEventListener('click', checkRank);
    rankReset.addEventListener('click', resetRank);

    paintRank(false);

    /* Solves the puzzle one swap at a time, then marks it, then shuffles it back. */
    var rankCycle = function (player) {
      var oneMove = function () {
        var rows = rankRows();
        for (var i = 0; i < rows.length; i++) {
          if (Number(rows[i].getAttribute('data-key')) !== i + 1) {
            for (var j = i + 1; j < rows.length; j++) {
              if (Number(rows[j].getAttribute('data-key')) === i + 1) {
                moveRow(rows[j], 'up', false);
                return true;
              }
            }
          }
        }
        return false;
      };

      var step = function () {
        if (oneMove()) {
          player.wait(560, step);
          return;
        }
        checkRank();
        player.wait(2300, function () {
          resetRank();
          player.wait(1000, step);
        });
      };

      step();
    };

    rankAuto = new Auto(panels[2], [rankResult], rankCycle, function () {
      /* Hand back a clean slate: the order stays where the animation left it, but the
         marks and the result line are cleared so the visitor starts their own attempt. */
      rankResult.textContent = '';
      rankNote.hidden = true;
      paintRank(false);
    });
  }

  /* ------------------------------------------------------------- play, pause, take over */
  var autos = [logAuto, termAuto, rankAuto];
  var onScreen = !('IntersectionObserver' in window);

  function sync() {
    autos.forEach(function (auto, i) {
      if (!auto) {
        return;
      }
      if (onScreen && i === activeIndex && !document.hidden) {
        auto.play();
      } else {
        auto.pause();
      }
    });
  }

  autos.forEach(function (auto) {
    if (!auto || !auto.panel) {
      return;
    }
    /* Capture phase, so the visitor's own click or keystroke stops the animation before it
       reaches the control they are using. */
    ['pointerdown', 'keydown'].forEach(function (type) {
      auto.panel.addEventListener(type, function () { auto.takeOver(); }, true);
    });
  });

  if (autos.some(Boolean)) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        sync();
      }, { threshold: 0.25 }).observe(root);
    }
    document.addEventListener('visibilitychange', sync);
    sync();
  }
})();
