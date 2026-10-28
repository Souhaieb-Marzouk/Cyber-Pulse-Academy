/**
 * Icon registry — exact Lucide SVG node data (lucide-react v0.525.0, ISC license).
 * Path data extracted verbatim from the original lab's lucide-react package so the static
 * port renders pixel-identical inline SVG icons with no CDN and no icon font.
 */

const LAB_ICONS = {
  Archive:
    '    <rect width="20" height="5" x="2" y="3" rx="1"></rect>    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path>    <path d="M10 12h4"></path>',
  ClipboardCheck:
    '    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path>    <rect x="2" y="6" width="8" height="12" rx="2"></rect>',
  Crosshair:
    '    <circle cx="12" cy="12" r="10"></circle>    <line x1="22" x2="18" y1="12" y2="12"></line>    <line x1="6" x2="2" y1="12" y2="12"></line>    <line x1="12" x2="12" y1="6" y2="2"></line>    <line x1="12" x2="12" y1="22" y2="18"></line>',
  Dumbbell:
    '    <path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"></path>    <path d="m2.5 21.5 1.4-1.4"></path>    <path d="m20.1 3.9 1.4-1.4"></path>    <path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"></path>    <path d="m9.6 14.4 4.8-4.8"></path>',
  Eye:
    '    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>    <circle cx="12" cy="12" r="3"></circle>',
  FileSearch:
    '    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>    <path d="M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"></path>    <path d="m9 18-1.5-1.5"></path>    <circle cx="5" cy="14" r="3"></circle>',
  GitCommitHorizontal:
    '    <circle cx="12" cy="12" r="3"></circle>    <line x1="3" x2="9" y1="12" y2="12"></line>    <line x1="15" x2="21" y1="12" y2="12"></line>',
  Lightbulb:
    '    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>    <path d="M9 18h6"></path>    <path d="M10 22h4"></path>',
  LibraryBig:
    '    <rect width="8" height="18" x="3" y="3" rx="1"></rect>    <path d="M7 3v18"></path>    <path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z"></path>',
  NotebookTabs:
    '    <path d="M2 6h4"></path>    <path d="M2 10h4"></path>    <path d="M2 14h4"></path>    <path d="M2 18h4"></path>    <rect width="16" height="20" x="4" y="2" rx="2"></rect>    <path d="M15 2v20"></path>    <path d="M15 7h5"></path>    <path d="M15 12h5"></path>    <path d="M15 17h5"></path>',
  Radar:
    '    <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"></path>    <path d="M4 6h.01"></path>    <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"></path>    <path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"></path>    <path d="M12 18h.01"></path>    <path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"></path>    <circle cx="12" cy="12" r="2"></circle>    <path d="m13.41 10.59 5.66-5.66"></path>',
  RadioTower:
    '    <path d="M4.9 16.1C1 12.2 1 5.8 4.9 1.9"></path>    <path d="M7.8 4.7a6.14 6.14 0 0 0-.8 7.5"></path>    <circle cx="12" cy="9" r="2"></circle>    <path d="M16.2 4.8c2 2 2.26 5.11.8 7.47"></path>    <path d="M19.1 1.9a9.96 9.96 0 0 1 0 14.1"></path>    <path d="M9.5 18h5"></path>    <path d="m8 22 4-11 4 11"></path>',
  ShieldCheck:
    '    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>    <path d="m9 12 2 2 4-4"></path>',
  Siren:
    '    <path d="M7 18v-6a5 5 0 1 1 10 0v6"></path>    <path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"></path>    <path d="M21 12h1"></path>    <path d="M18.5 4.5 18 5"></path>    <path d="M2 12h1"></path>    <path d="M12 2v1"></path>    <path d="m4.929 4.929.707.707"></path>    <path d="M12 12v6"></path>',
  Tent:
    '    <path d="M3.5 21 14 3"></path>    <path d="M20.5 21 10 3"></path>    <path d="M15.5 21 12 15l-3.5 6"></path>    <path d="M2 21h20"></path>',
  Users:
    '    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>    <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>    <circle cx="9" cy="7" r="4"></circle>',
  Stamp:
    '    <path d="M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-6 0c0 2 1 2 1 3.5V13"></path>    <path d="M20 15.5a2.5 2.5 0 0 0-2.5-2.5h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1z"></path>    <path d="M5 22h14"></path>',
  GraduationCap:
    '    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>    <path d="M22 10v6"></path>    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>',
  FileBadge2:
    '    <path d="m13.69 12.479 1.29 4.88a.5.5 0 0 1-.697.591l-1.844-.849a1 1 0 0 0-.88.001l-1.846.85a.5.5 0 0 1-.693-.593l1.29-4.88"></path>    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"></path>    <circle cx="12" cy="10" r="3"></circle>',
  BookMarked:
    '    <path d="M10 2v8l3-3 3 3V2"></path>    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"></path>',
  HelpCircle:
    '    <circle cx="12" cy="12" r="10"></circle>    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>    <path d="M12 17h.01"></path>',
  RotateCcw:
    '    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>    <path d="M3 3v5h5"></path>',
  ClipboardList:
    '    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>    <path d="M12 11h4"></path>    <path d="M12 16h4"></path>    <path d="M8 11h.01"></path>    <path d="M8 16h.01"></path>',
  BookOpen:
    '    <path d="M12 7v14"></path>    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>',
  FileText:
    '    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>    <path d="M10 9H8"></path>    <path d="M16 13H8"></path>    <path d="M16 17H8"></path>',
  AlertTriangle:
    '    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>    <path d="M12 9v4"></path>    <path d="M12 17h.01"></path>',
  Info:
    '    <circle cx="12" cy="12" r="10"></circle>    <path d="M12 16v-4"></path>    <path d="M12 8h.01"></path>',
  Pin:
    '    <path d="M12 17v5"></path>    <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"></path>',
  ShieldAlert:
    '    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>    <path d="M12 8v4"></path>    <path d="M12 16h.01"></path>',
  CheckCircle2:
    '    <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>    <path d="m9 11 3 3L22 4"></path>',
  XCircle:
    '    <circle cx="12" cy="12" r="10"></circle>    <path d="m15 9-6 6"></path>    <path d="m9 9 6 6"></path>',
  ChevronDown:
    '    <path d="m6 9 6 6 6-6"></path>',
  ArrowUp:
    '    <path d="m5 12 7-7 7 7"></path>    <path d="M12 19V5"></path>',
  ArrowDown:
    '    <path d="M12 5v14"></path>    <path d="m19 12-7 7-7-7"></path>',
  Search:
    '    <path d="m21 21-4.34-4.34"></path>    <circle cx="11" cy="11" r="8"></circle>',
  ChevronRight:
    '    <path d="m9 18 6-6-6-6"></path>',
  Mail:
    '    <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path>    <rect x="2" y="4" width="20" height="16" rx="2"></rect>',
  FileBadge:
    '    <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3.072"></path>    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>    <path d="m6.69 16.479 1.29 4.88a.5.5 0 0 1-.698.591l-1.843-.849a1 1 0 0 0-.88.001l-1.846.85a.5.5 0 0 1-.693-.593l1.29-4.88"></path>    <circle cx="5" cy="14" r="3"></circle>',
  BadgeCheck:
    '    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path>    <path d="m9 12 2 2 4-4"></path>',
  Star:
    '    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>',
  ArrowRight:
    '    <path d="M5 12h14"></path>    <path d="m12 5 7 7-7 7"></path>',
  ExternalLink:
    '    <path d="M15 3h6v6"></path>    <path d="M10 14 21 3"></path>    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>',
  Swords:
    '    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline>    <line x1="13" x2="19" y1="19" y2="13"></line>    <line x1="16" x2="20" y1="16" y2="20"></line>    <line x1="19" x2="21" y1="21" y2="19"></line>    <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"></polyline>    <line x1="5" x2="9" y1="14" y2="18"></line>    <line x1="7" x2="4" y1="17" y2="20"></line>    <line x1="3" x2="5" y1="19" y2="21"></line>',
};

/**
 * Render a lab icon as inline SVG (Lucide geometry: 24×24 viewBox, stroke = currentColor,
 * stroke-width 2, round caps/joins — identical to how lucide-react renders it).
 */
function labIcon(name, cls) {
  const body = LAB_ICONS[name] || LAB_ICONS.FileText;
  const c = cls ? ' class="' + cls + '"' : '';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"' + c + '>' + body + '</svg>';
}
