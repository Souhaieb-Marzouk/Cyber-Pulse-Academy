/* ═══════════════════════════════════════════════════════════════════════════
   CyberLab 101 — js/shell.js
   Simulated triage shell (labeled in `help` as simplified). Pure command
   processor: (input, host) → output lines. No side effects, no network.
   Fictional jump console: OS commands are answered per host context;
   file/evidence and network-lookup commands run console-side.
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* Build the in-console file table from the log streams (same fixed-width
   rendering as the original lab). */
function renderLogRows(rows, headers) {
  const widths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => (r.cols[i] ?? '').length)));
  const pad = (cells) => cells.map((c, i) => (c + ' '.repeat(widths[i] + 2)).slice(0, widths[i] + 2)).join('');
  const out = [pad(headers), pad(widths.map((w) => '─'.repeat(w)))];
  for (const r of rows) out.push(pad(r.cols) + '  ' + r.detail);
  return out;
}

const SHELL_FILES = {
  '/logs/dns.log': { kind: 'text', text: renderLogRows(DNS_LOG, ['Op', 'Query', 'Client']), label: 'DNS resolver log' },
  '/logs/auth.log': { kind: 'text', text: renderLogRows(AUTH_LOG, ['Result', 'User', 'Source']), label: 'Authentication log' },
  '/logs/firewall.log': { kind: 'text', text: renderLogRows(FIREWALL_LOG, ['Action', 'Flow', 'Proto']), label: 'Firewall log' },
  '/logs/edr.log': { kind: 'text', text: renderLogRows(EDR_LOG, ['Alert', 'Type', 'Host']), label: 'EDR detection log' },
  '/evidence/harbor.pcap': { kind: 'pcap', label: 'Packet capture (harborwatch)' },
  '/evidence/svch0st.exe': { kind: 'binary', label: 'Quarantine candidate — Windows PE (synthetic)' },
  '/evidence/wakeup.bat': { kind: 'binary', label: 'IT maintenance script (synthetic)' },
  '/evidence/phishing.eml': { kind: 'text', text: PHISHING_EML, label: 'Phishing email artifact' },
};

function resolveFile(arg) {
  const a = (arg ?? '').trim();
  if (SHELL_FILES[a]) return a;
  for (const key of Object.keys(SHELL_FILES)) {
    if (key.endsWith('/' + a.replace(/^\//, ''))) return key;
  }
  return null;
}

function knownResolution(domain) {
  const d = (domain ?? '').toLowerCase();
  if (d === 'alderwoodportal-secure[.]com') return { ip: '45.62.198.140', ttl: 300 };
  if (d === 'portal-freight-ops.com') return { ip: '104.21.6.77', ttl: 3600 };
  if (d === 'portal[.]alderwoodfreight.com') return { ip: '23.61.4.19', ttl: 3600 };
  if (d === 'mail.alderwoodfreight.com') return { ip: '10.4.1.11', ttl: 600 };
  if (d === 'updates.alderwoodfreight.com') return { ip: '10.4.1.30', ttl: 600 };
  return null;
}

function execute(rawInput, host) {
  const input = String(rawInput ?? '').trim().replace(/\s+/g, ' ');
  if (!input) return { lines: [] };
  const parts = input.split(' ');
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  const arg0 = args[0] ?? '';
  const rest = args.slice(1).join(' ');

  switch (cmd) {
    case 'help':
    case '?':
      return { lines: SHELL_HELP };

    case 'clear':
      return { lines: [], clear: true };

    case 'use': {
      if (!arg0) {
        return {
          lines: [
            'Attached hosts:',
            ...Object.entries(HOSTS).map(([name, h]) => `  ${name.padEnd(12)} ${h.os.padEnd(20)} ${h.ip}  — ${h.role}`),
            'Switch with: use <HOSTNAME>',
          ],
        };
      }
      const target = arg0.toUpperCase();
      if (target === 'WS-ENG-014' || target === 'WEB-LNX-02') {
        return { lines: [`Context switched to ${target} (${HOSTS[target].os}).`], hostSwitch: target };
      }
      return { lines: [`use: unknown host "${arg0}". Attached: WS-ENG-014, WEB-LNX-02.`] };
    }

    /* ----------------------------- Windows host ---------------------------- */
    case 'netstat': {
      if (host !== 'WS-ENG-014')
        return {
          lines: [
            `netstat: not available on ${host} (Linux host).`,
            'The Linux equivalent is:  ss -tunlp',
            '(Switch with: use WS-ENG-014)',
          ],
        };
      return {
        lines: [
          'Active Connections  (WS-ENG-014 · 10.4.12.14)',
          '',
          '  Proto  Local Address        Foreign Address        State           PID',
          '  TCP    10.4.12.14:49152     10.4.1.20:445          ESTABLISHED     872',
          '  TCP    10.4.12.14:49881     10.4.1.10:53           ESTABLISHED     1044',
          '  TCP    10.4.12.14:50117     10.4.9.5:135           TIME_WAIT       —',
          '  TCP    10.4.12.14:52311     45.62.198.140:443      TIME_WAIT       5180',
          '  TCP    10.4.12.14:52390     185.199.72.44:443      ESTABLISHED     8212',
          '  UDP    10.4.12.14:137       *:*                    —               —',
          '  UDP    10.4.12.14:5353      *:*                    —               —',
          '',
          '(-a all sockets · -n numeric · -o owning PID)',
        ],
      };
    }
    case 'tasklist': {
      if (host !== 'WS-ENG-014')
        return {
          lines: [
            `tasklist: not available on ${host} (Linux host).`,
            'The Linux equivalent is:  ps aux',
            '(Switch with: use WS-ENG-014)',
          ],
        };
      return {
        lines: [
          'Image name           PID    Session   Mem     User        Path',
          '===================  =====  ========  ======  ==========  =============================================',
          'System                 4    Services  144 K   SYSTEM      N/A',
          'lsass.exe             648    Services   18 MB  SYSTEM      C:\\Windows\\System32\\lsass.exe',
          'explorer.exe         2312    Console    92 MB  J.RIVERA    C:\\Windows\\explorer.exe',
          'chrome.exe           5180    Console   402 MB  J.RIVERA    C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'Teams.exe            4404    Console   310 MB  J.RIVERA    C:\\Users\\j.rivera\\AppData\\Local\\Microsoft\\Teams\\Teams.exe',
          'onedrive.exe         3388    Console   148 MB  J.RIVERA    C:\\Users\\j.rivera\\AppData\\Local\\Microsoft\\OneDrive\\onedrive.exe',
          'svch0st.exe          8212    Console    61 MB  J.RIVERA    C:\\Users\\j.rivera\\AppData\\Local\\Temp\\svch0st.exe',
          '',
          '(/v verbose — name, PID, session, memory, user, path)',
        ],
      };
    }
    case 'ipconfig': {
      if (host !== 'WS-ENG-014')
        return { lines: [`ipconfig: not available on ${host} (Linux). The Linux equivalent is:  ifconfig`] };
      return {
        lines: [
          'Windows IP Configuration  —  WS-ENG-014',
          '',
          'Ethernet adapter Ethernet0:',
          '   IPv4 Address. . . . . . : 10.4.12.14',
          '   Subnet Mask . . . . . . : 255.255.255.0',
          '   Default Gateway . . . . : 10.4.12.1',
          '   DNS Servers . . . . . . : 10.4.1.10',
        ],
      };
    }

    /* ------------------------------ Linux host ----------------------------- */
    case 'ps': {
      if (host !== 'WEB-LNX-02')
        return {
          lines: [
            `ps: not available on ${host} (Windows host).`,
            'The Windows equivalent is:  tasklist /v',
            '(Switch with: use WEB-LNX-02)',
          ],
        };
      return {
        lines: [
          'USER       PID  %CPU  %MEM  COMMAND',
          'root         1   0.0   0.1  /sbin/init',
          'root       812   0.0   0.2  /usr/sbin/sshd -D',
          'root       934   0.0   0.4  /usr/sbin/nginx: master process',
          'www-data   936   0.1   0.5  nginx: worker process',
          'www-data   937   0.1   0.5  nginx: worker process',
          'root      1102   0.0   0.1  /usr/sbin/cron -f',
          'svc-ed    1287   0.3   1.1  node /srv/edi-gateway/server.js',
          '',
          '(WEB-LNX-02 — baseline: no anomalies. Clean baselines are how anomalies get noticed.)',
        ],
      };
    }
    case 'ss': {
      if (host !== 'WEB-LNX-02')
        return {
          lines: [
            `ss: not available on ${host} (Windows host).`,
            'The Windows equivalent is:  netstat -ano',
            '(Switch with: use WEB-LNX-02)',
          ],
        };
      return {
        lines: [
          'Netid  State   Local Address:Port     Process',
          'tcp    LISTEN  0.0.0.0:22             sshd',
          'tcp    LISTEN  0.0.0.0:80             nginx',
          'tcp    LISTEN  0.0.0.0:443            nginx',
          'tcp    ESTAB   10.4.6.30:44312  →  10.4.1.10:53      (DNS, expected)',
          '',
          '(-t tcp · -u udp · -n numeric · -l listening · -p owning process)',
        ],
      };
    }
    case 'ifconfig': {
      if (host !== 'WEB-LNX-02')
        return { lines: [`ifconfig: not available on ${host} (Windows). The Windows equivalent is:  ipconfig /all`] };
      return {
        lines: ['eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>', '        inet 10.4.6.30  netmask 255.255.255.0', '        ether 02:1a:4f:0c:83:e2'],
      };
    }

    /* --------------------------- Network lookups --------------------------- */
    case 'nslookup':
    case 'dig': {
      if (!arg0) return { lines: [`usage: ${cmd} <domain>`] };
      const domain = arg0.replace(/^https?:\/\//, '').split('/')[0];
      const r = knownResolution(domain);
      if (!r)
        return {
          lines: [`Server: dns01.alderwood.local (10.4.1.10)`, '', `** server can't find ${domain}: NXDOMAIN`],
        };
      if (cmd === 'dig') {
        return {
          lines: [
            `; <<>> dig ${domain} @dns01.alderwood.local`,
            `;; ANSWER SECTION:`,
            `${domain}.\t\t${r.ttl}\tIN\tA\t${r.ip}`,
            `;; Query time: 2 msec · SERVER: 10.4.1.10#53`,
          ],
        };
      }
      return {
        lines: [
          'Server:  dns01.alderwood.local',
          'Address:  10.4.1.10',
          '',
          'Non-authoritative answer:',
          `Name:    ${domain}`,
          `Address:  ${r.ip}`,
        ],
      };
    }
    case 'whois': {
      if (!arg0) return { lines: ['usage: whois <domain>'] };
      const rec = WHOIS_RECORDS[arg0.toLowerCase()];
      if (!rec) return { lines: [`No match for "${arg0}".`, ''] };
      return {
        lines: [
          `Domain Name: ${rec.domain}`,
          `Registrar: ${rec.registrar}`,
          `Creation Date: ${rec.created}`,
          `Registry Expiry Date: ${rec.expires}`,
          `Domain Status: ${rec.status}`,
          `Registrant Organization: ${rec.privacy ? 'REDACTED FOR PRIVACY' : rec.registrant}`,
          `Registrant Country: ${rec.country}`,
          `Name Server: ${rec.nameServers.join(' · ')}`,
          `DNSSEC: ${rec.dnssec}`,
        ],
      };
    }
    case 'curl': {
      const flagIdx = args.findIndex((a) => a.startsWith('-'));
      const target = args.filter((a) => !a.startsWith('-')).join('');
      if (!target || flagIdx === -1) return { lines: ['usage: curl -sI <domain|url>   (-s silent, -I headers only)'] };
      const domain = target.replace(/^https?:\/\//, '').split('/')[0];
      if (domain === 'alderwoodportal-secure[.]com')
        return {
          lines: [
            'HTTP/1.1 200 OK',
            'Server: nginx/1.19.3',
            'Content-Type: text/html; charset=UTF-8',
            'Set-Cookie: PHPSESSID=8f3ac91e...; HttpOnly',
            'X-Powered-By: PHP/7.2.34',
            '',
            '(note: EOL PHP runtime and generic hosting — throwaway infrastructure pattern)',
          ],
        };
      if (domain === 'portal[.]alderwoodfreight.com')
        return {
          lines: ['HTTP/1.1 301 Moved Permanently', 'Server: cloudflare', 'Location: https://portal[.]alderwoodfreight.com/login', 'Strict-Transport-Security: max-age=63072000'],
        };
      return { lines: [`curl: (7) Failed to connect to ${domain} — connection refused or filtered`] };
    }
    case 'traceroute': {
      if (!arg0) return { lines: ['usage: traceroute <ip>'] };
      if (arg0 === '185.199.72.44')
        return {
          lines: [
            'traceroute to 185.199.72.44, 30 hops max',
            ' 1  10.4.12.1          0.4 ms',
            ' 2  10.4.0.1          1.1 ms',
            ' 3  rt-gw.isp-edge.net   6.8 ms',
            ' 4  * * *',
            ' 5  * * *',
            ' 6  * * *',
            '',
            '(path goes dark after the ISP edge — C2 operators often filter traceroute traffic)',
          ],
        };
      if (arg0 === '45.62.198.140')
        return {
          lines: [
            'traceroute to 45.62.198.140, 30 hops max',
            ' 1  10.4.12.1   0.4 ms',
            ' 2  10.4.0.1    1.2 ms',
            ' 3  rt-gw.isp-edge.net   7.0 ms',
            ' 4  xe-3.phx.vpscheap.net   21.4 ms',
            ' 5  45.62.198.140   22.1 ms',
          ],
        };
      return { lines: [`traceroute to ${arg0}`, ' 1  10.4.12.1   0.4 ms', ` 2  ${arg0}  0.9 ms`] };
    }
    case 'ping': {
      if (!arg0) return { lines: ['usage: ping <host|ip>'] };
      const r = knownResolution(arg0);
      const ip = r ? r.ip : arg0;
      return {
        lines: [
          `PING ${arg0} (${ip}) 56(84) bytes of data.`,
          `64 bytes from ${ip}: icmp_seq=1 ttl=63 time=0.9 ms`,
          `64 bytes from ${ip}: icmp_seq=2 ttl=63 time=1.1 ms`,
          `64 bytes from ${ip}: icmp_seq=3 ttl=63 time=0.8 ms`,
          `--- ${arg0} ping statistics ---  3 packets transmitted, 3 received`,
        ],
      };
    }

    /* --------------------------- Files / evidence -------------------------- */
    case 'ls': {
      if (!arg0 || arg0 === '/') return { lines: ['/logs/', '/evidence/'] };
      if (arg0 === '/logs' || arg0 === '/logs/')
        return { lines: ['dns.log', 'auth.log', 'firewall.log', 'edr.log'] };
      if (arg0 === '/evidence' || arg0 === '/evidence/')
        return { lines: ['harbor.pcap   (packet capture)', 'svch0st.exe   (Windows PE — quarantine candidate)', 'wakeup.bat    (script)', 'phishing.eml  (email artifact)'] };
      return { lines: [`ls: cannot access '${arg0}': No such file or directory`] };
    }
    case 'head':
    case 'tail': {
      const key = resolveFile(rest || arg0);
      if (!key) return { lines: [`${cmd}: ${(rest || arg0) || ''}: No such file`] };
      const f = SHELL_FILES[key];
      if (f.kind === 'binary') return { lines: [`${cmd}: ${key}: binary file — try sha256sum`] };
      if (f.kind === 'pcap') return { lines: [`${cmd}: ${key}: binary capture — use  tcpdump -r ${key}`] };
      const text = f.text ?? [];
      return { lines: cmd === 'head' ? text.slice(0, 10) : text.slice(-10) };
    }
    case 'cat': {
      const key = resolveFile(arg0);
      if (!key) return { lines: [`cat: ${arg0}: No such file or directory`] };
      const f = SHELL_FILES[key];
      if (f.kind === 'binary') return { lines: [`cat: ${key}: binary file (useless noise) — fingerprint it instead: sha256sum ${key}`] };
      if (f.kind === 'pcap') return { lines: [`cat: ${key}: binary capture — use  tcpdump -r ${key}`] };
      return { lines: f.text ?? [] };
    }
    case 'grep': {
      if (args.length < 2) return { lines: ['usage: grep <pattern> <file>'] };
      const key = resolveFile(args[1]);
      if (!key) return { lines: [`grep: ${args[1]}: No such file or directory`] };
      const f = SHELL_FILES[key];
      if (f.kind !== 'text') return { lines: [`grep: ${key}: binary or unsupported file`] };
      const pat = args[0].toLowerCase();
      const hits = (f.text ?? []).filter((l) => l.toLowerCase().includes(pat));
      return { lines: hits.length ? hits : [`(no matches for "${args[0]}")`] };
    }
    case 'sha256sum': {
      const key = resolveFile(arg0);
      if (!key) return { lines: [`sha256sum: ${arg0}: No such file or directory`] };
      if (key === '/evidence/svch0st.exe') return { lines: [`${C2_HASH}  ${key}`] };
      if (key === '/evidence/wakeup.bat') return { lines: [`${WAKEUP_HASH}  ${key}`] };
      if (key === '/evidence/phishing.eml') return { lines: [`${EML_HASH}  ${key}`] };
      return { lines: [`sha256sum: ${key}: not hashable in this console (log files only)`] };
    }
    case 'tcpdump': {
      const fileArg = args.find((a) => resolveFile(a) === '/evidence/harbor.pcap');
      if (args[0] !== '-r' || !fileArg)
        return { lines: ['usage: tcpdump -r /evidence/harbor.pcap   (read a saved capture)'] };
      return { lines: PCAP_LINES };
    }

    default:
      return {
        lines: [
          `${cmd}: command not found`,
          `Type  help  for the simulated command set. (Hint: OS commands are host-specific —  use <HOSTNAME>  switches context.)`,
        ],
      };
  }
}
