/**
 * receptionist-shared.js
 * Single source of truth for the Receptionist role sidebar + header.
 * Usage: <script src="receptionist-shared.js"></script>
 *        <script>initReceptionistShell('dashboard');</script>
 *
 * Active page keys:
 *   dashboard | register | walkin | pre-registered | today | upcoming | visitor-list
 *   photo | upload-id | assign-host | generate-qr | print-badge
 *   pending | approved | rejected | reports | notifications | profile
 */

function initReceptionistShell(activePage) {
  /* ─── Inject shared styles ─────────────────────────────────────────────── */
  if (!document.getElementById('rec-shell-styles')) {
    const style = document.createElement('style');
    style.id = 'rec-shell-styles';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      :root {
        --primary:      #2563EB;
        --primary-light:#EFF6FF;
        --primary-glow: rgba(37,99,235,0.15);
        --secondary:    #4F46E5;
        --success:      #22C55E;
        --success-light:#F0FDF4;
        --warning:      #F59E0B;
        --warning-light:#FFFBEB;
        --danger:       #EF4444;
        --danger-light: #FEF2F2;
        --info:         #06B6D4;
        --info-light:   #ECFEFF;

        --bg:           #F8FAFC;
        --card:         #FFFFFF;
        --border:       #E2E8F0;
        --border-hover: #CBD5E1;
        --text-primary: #0F172A;
        --text-secondary:#475569;
        --text-muted:   #94A3B8;

        --sidebar-width: 260px;
        --sidebar-collapsed: 72px;
        --header-h: 64px;
        --radius-sm: 8px;
        --radius-md: 12px;
        --radius-lg: 16px;
        --radius-xl: 20px;

        --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
        --shadow-md: 0 4px 16px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.04);
        --shadow-lg: 0 8px 32px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06);
        --shadow-xl: 0 20px 60px rgba(0,0,0,0.12);

        --transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
        --transition-slow: all 0.35s cubic-bezier(0.4,0,0.2,1);
      }

      [data-theme="dark"] {
        --bg:           #0F172A;
        --card:         #1E293B;
        --border:       #334155;
        --border-hover: #475569;
        --text-primary: #F1F5F9;
        --text-secondary:#94A3B8;
        --text-muted:   #64748B;
        --primary-light:#1E3A5F;
        --success-light:#14532D;
        --warning-light:#451A03;
        --danger-light: #450A0A;
        --info-light:   #083344;
      }

      html, body { min-height: 100vh; }
      body.rec-body {
        background: var(--bg);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: var(--text-primary);
        overflow-x: hidden;
        transition: background 0.25s, color 0.25s;
      }

      /* ── HEADER ─────────────────────────────────────────────────────── */
      .rec-header {
        position: fixed; top: 0; left: 0; right: 0;
        height: var(--header-h);
        background: var(--card);
        border-bottom: 1px solid var(--border);
        z-index: 1000;
        display: flex; align-items: center;
        padding: 0 1.5rem; gap: 1rem;
        box-shadow: var(--shadow-sm);
        transition: var(--transition);
      }
      .rec-header-logo {
        display: flex; align-items: center; gap: 0.625rem;
        text-decoration: none; flex-shrink: 0;
        font-size: 1.1rem; font-weight: 800;
        color: var(--text-primary);
      }
      .rec-logo-icon {
        width: 36px; height: 36px; border-radius: 10px;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        display: flex; align-items: center; justify-content: center;
        font-size: 1.1rem; flex-shrink: 0;
        box-shadow: 0 4px 12px var(--primary-glow);
      }
      .rec-logo-text { color: var(--text-primary); }
      .rec-logo-text span { color: var(--primary); }

      .rec-sidebar-toggle {
        width: 36px; height: 36px; border-radius: var(--radius-sm);
        background: transparent; border: 1px solid var(--border);
        color: var(--text-secondary); display: flex; align-items: center;
        justify-content: center; cursor: pointer; font-size: 1rem;
        transition: var(--transition); flex-shrink: 0;
      }
      .rec-sidebar-toggle:hover { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }

      .rec-search-wrap {
        flex: 1; max-width: 440px; position: relative;
      }
      .rec-search-wrap input {
        width: 100%; padding: 0.5rem 2.8rem 0.5rem 2.4rem;
        border-radius: 50px; background: var(--bg);
        border: 1.5px solid var(--border); color: var(--text-primary);
        font-size: 0.875rem; font-family: inherit;
        outline: none; transition: var(--transition);
      }
      .rec-search-wrap input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); background: var(--card); }
      .rec-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.85rem; pointer-events: none; }
      .rec-search-kbd { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: var(--border); color: var(--text-muted); font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.35rem; border-radius: 4px; pointer-events: none; }

      .rec-header-right { display: flex; align-items: center; gap: 0.6rem; margin-left: auto; flex-shrink: 0; }
      .rec-date-time { text-align: right; display: none; }
      @media(min-width:1200px) { .rec-date-time { display: block; } }
      .rec-date-time .dt-date { font-size: 0.72rem; font-weight: 600; color: var(--text-muted); }
      .rec-date-time .dt-time { font-size: 0.95rem; font-weight: 800; color: var(--text-primary); line-height: 1; }

      .rec-icon-btn {
        width: 38px; height: 38px; border-radius: 50%;
        background: transparent; border: 1.5px solid var(--border);
        color: var(--text-secondary); display: flex; align-items: center;
        justify-content: center; cursor: pointer; position: relative;
        font-size: 1rem; transition: var(--transition);
      }
      .rec-icon-btn:hover { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }
      .rec-badge {
        position: absolute; top: -3px; right: -3px;
        min-width: 18px; height: 18px; padding: 0 3px;
        border-radius: 9px; background: var(--danger);
        color: #fff; font-size: 0.62rem; font-weight: 800;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid var(--card);
      }
      .rec-profile {
        display: flex; align-items: center; gap: 0.55rem;
        padding: 0.3rem 0.6rem 0.3rem 0.3rem;
        border: 1.5px solid var(--border); border-radius: 50px;
        cursor: pointer; transition: var(--transition); background: var(--card);
      }
      .rec-profile:hover { border-color: var(--primary); background: var(--primary-light); }
      .rec-avatar {
        width: 32px; height: 32px; border-radius: 50%;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        display: flex; align-items: center; justify-content: center;
        font-size: 0.78rem; font-weight: 800; color: #fff; flex-shrink: 0;
      }
      .rec-profile-info { line-height: 1.2; }
      .rec-profile-name { font-size: 0.8rem; font-weight: 700; color: var(--text-primary); }
      .rec-profile-role { font-size: 0.68rem; color: var(--text-muted); }

      /* ── SIDEBAR ─────────────────────────────────────────────────────── */
      .rec-sidebar {
        position: fixed; top: var(--header-h); left: 0; bottom: 0;
        width: var(--sidebar-width);
        background: var(--card); border-right: 1px solid var(--border);
        z-index: 900; overflow-y: auto; overflow-x: hidden;
        padding: 0.75rem 0 3rem;
        transition: width var(--transition-slow);
        scrollbar-width: thin; scrollbar-color: var(--border) transparent;
      }
      .rec-sidebar::-webkit-scrollbar { width: 4px; }
      .rec-sidebar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

      body.sidebar-collapsed .rec-sidebar { width: var(--sidebar-collapsed); }
      body.sidebar-collapsed .rec-sidebar .s-label,
      body.sidebar-collapsed .rec-sidebar .s-section,
      body.sidebar-collapsed .rec-sidebar .s-badge { display: none !important; }
      body.sidebar-collapsed .rec-sidebar .s-item { justify-content: center; padding: 0.7rem; }
      body.sidebar-collapsed .rec-main { margin-left: var(--sidebar-collapsed); }

      .s-section {
        font-size: 0.65rem; font-weight: 800; text-transform: uppercase;
        letter-spacing: 0.1em; color: var(--text-muted);
        padding: 1rem 1.25rem 0.3rem;
      }
      .s-item {
        display: flex; align-items: center; justify-content: space-between;
        padding: 0.58rem 1rem; margin: 0.1rem 0.6rem;
        border-radius: var(--radius-md); color: var(--text-secondary);
        font-size: 0.845rem; font-weight: 600; cursor: pointer;
        text-decoration: none; transition: var(--transition);
        gap: 0.65rem;
      }
      .s-item:hover { background: var(--primary-light); color: var(--primary); }
      .s-item.active {
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        color: #fff; box-shadow: 0 4px 16px var(--primary-glow);
      }
      .s-item-left { display: flex; align-items: center; gap: 0.65rem; }
      .s-icon { font-size: 1rem; width: 20px; text-align: center; flex-shrink: 0; }
      .s-badge {
        font-size: 0.62rem; font-weight: 800; padding: 0.12rem 0.4rem;
        border-radius: 20px; flex-shrink: 0;
      }
      .s-badge-blue { background: var(--primary-light); color: var(--primary); }
      .s-badge-orange { background: var(--warning-light); color: var(--warning); }
      .s-badge-red { background: var(--danger-light); color: var(--danger); }

      .s-divider { height: 1px; background: var(--border); margin: 0.75rem 1rem; }

      /* ── MAIN ────────────────────────────────────────────────────────── */
      .rec-main {
        margin-top: var(--header-h);
        margin-left: var(--sidebar-width);
        min-height: calc(100vh - var(--header-h));
        transition: margin-left var(--transition-slow);
        display: flex; flex-direction: column;
      }

      /* ── SHARED CARD ─────────────────────────────────────────────────── */
      .r-card {
        background: var(--card); border: 1.5px solid var(--border);
        border-radius: var(--radius-lg); padding: 1.5rem;
        box-shadow: var(--shadow-sm);
        transition: var(--transition);
      }
      .r-card:hover { border-color: var(--border-hover); box-shadow: var(--shadow-md); transform: translateY(-1px); }

      /* ── BADGES ──────────────────────────────────────────────────────── */
      .badge {
        display: inline-flex; align-items: center; gap: 0.25rem;
        font-size: 0.72rem; font-weight: 700; padding: 0.22rem 0.6rem;
        border-radius: 20px;
      }
      .badge-blue   { background: var(--primary-light); color: var(--primary); }
      .badge-green  { background: var(--success-light); color: #16A34A; }
      .badge-yellow { background: var(--warning-light); color: #D97706; }
      .badge-red    { background: var(--danger-light);  color: #DC2626; }
      .badge-cyan   { background: var(--info-light);    color: #0891B2; }
      .badge-gray   { background: #F1F5F9; color: var(--text-secondary); }

      /* ── BUTTONS ─────────────────────────────────────────────────────── */
      .btn {
        display: inline-flex; align-items: center; justify-content: center;
        gap: 0.4rem; padding: 0.5rem 1rem; border-radius: var(--radius-md);
        font-size: 0.875rem; font-weight: 600; font-family: inherit;
        cursor: pointer; transition: var(--transition); border: 1.5px solid transparent;
        text-decoration: none; white-space: nowrap;
      }
      .btn-primary { background: var(--primary); color: #fff; }
      .btn-primary:hover { background: #1D4ED8; box-shadow: 0 4px 16px var(--primary-glow); transform: translateY(-1px); }
      .btn-secondary { background: var(--secondary); color: #fff; }
      .btn-outline { background: transparent; border-color: var(--border); color: var(--text-secondary); }
      .btn-outline:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
      .btn-success { background: var(--success); color: #fff; }
      .btn-success:hover { background: #16A34A; }
      .btn-danger  { background: var(--danger); color: #fff; }
      .btn-danger:hover { background: #DC2626; }
      .btn-warning { background: var(--warning); color: #fff; }
      .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.78rem; }
      .btn-xs { padding: 0.25rem 0.55rem; font-size: 0.72rem; border-radius: 8px; }
      .btn-full { width: 100%; }
      .btn-icon { width: 36px; height: 36px; padding: 0; border-radius: var(--radius-md); }

      /* ── TABLE ───────────────────────────────────────────────────────── */
      .r-table { width: 100%; border-collapse: collapse; font-size: 0.845rem; }
      .r-table th {
        padding: 0.85rem 1rem; border-bottom: 1.5px solid var(--border);
        background: var(--bg); color: var(--text-muted);
        font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.06em; text-align: left; white-space: nowrap;
      }
      .r-table td { padding: 0.9rem 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
      .r-table tr:last-child td { border-bottom: none; }
      .r-table tbody tr { transition: var(--transition); }
      .r-table tbody tr:hover td { background: var(--primary-light); }

      /* ── FORM ────────────────────────────────────────────────────────── */
      .form-input {
        width: 100%; padding: 0.55rem 0.85rem;
        border: 1.5px solid var(--border); border-radius: var(--radius-md);
        background: var(--card); color: var(--text-primary);
        font-size: 0.875rem; font-family: inherit;
        outline: none; transition: var(--transition);
      }
      .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }

      /* ── AVATAR ──────────────────────────────────────────────────────── */
      .user-avatar {
        border-radius: 50%; display: flex; align-items: center;
        justify-content: center; font-weight: 800; font-size: 0.78rem;
        color: #fff; flex-shrink: 0; border: 2px solid var(--card);
        box-shadow: var(--shadow-sm);
      }

      /* ── FOOTER ──────────────────────────────────────────────────────── */
      .rec-footer {
        background: var(--card); border-top: 1px solid var(--border);
        padding: 1rem 2rem;
        display: flex; align-items: center; justify-content: space-between;
        font-size: 0.78rem; color: var(--text-muted);
        margin-top: auto;
      }
      .rec-footer a { color: var(--text-muted); text-decoration: none; transition: var(--transition); }
      .rec-footer a:hover { color: var(--primary); }

      /* ── TOOLTIP ─────────────────────────────────────────────────────── */
      [data-tooltip] { position: relative; }
      [data-tooltip]::after {
        content: attr(data-tooltip);
        position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
        background: var(--text-primary); color: #fff;
        font-size: 0.72rem; font-weight: 600; padding: 0.3rem 0.6rem;
        border-radius: 6px; white-space: nowrap; pointer-events: none;
        opacity: 0; transition: opacity 0.15s;
        z-index: 9999;
      }
      [data-tooltip]:hover::after { opacity: 1; }

      /* ── COUNTERS ────────────────────────────────────────────────────── */
      @keyframes countUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .count-anim { animation: countUp 0.6s ease forwards; }

      /* ── SKELETON ────────────────────────────────────────────────────── */
      @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      .skeleton {
        background: linear-gradient(90deg, var(--border) 25%, var(--bg) 50%, var(--border) 75%);
        background-size: 200% 100%; animation: shimmer 1.5s infinite;
        border-radius: var(--radius-sm);
      }

      /* ── SCROLLBAR ───────────────────────────────────────────────────── */
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 6px; }
      ::-webkit-scrollbar-thumb:hover { background: var(--border-hover); }
    `;
    document.head.appendChild(style);
  }

  /* ─── Sidebar menu definition ───────────────────────────────────────────── */
  const menu = [
    { key: 'dashboard', icon: '🏠', label: 'Dashboard', href: 'dashboard.html' },
    { section: 'Visitor Management' },
    { key: 'register',      icon: '➕', label: 'Register Visitor',      href: 'register.html',        badge: null },
    { key: 'walkin',        icon: '🚶', label: 'Walk-In Visitor',        href: 'walkin.html',           badge: null },
    { key: 'pre-registered',icon: '📋', label: 'Pre-Registered',         href: 'pre-registered.html',   badge: '12', badgeClass: 'badge-blue' },
    { key: 'today',         icon: '📅', label: "Today's Visitors",        href: 'today.html',            badge: '47', badgeClass: 'badge-blue' },
    { key: 'upcoming',      icon: '⏰', label: 'Upcoming Visitors',       href: 'upcoming.html',         badge: '8',  badgeClass: 'badge-orange' },
    { key: 'visitor-list',  icon: '📒', label: 'Visitor List',            href: 'visitor-list.html',     badge: null },
    { section: 'Registration' },
    { key: 'photo',         icon: '📷', label: 'Capture Photo',           href: 'photo.html' },
    { key: 'upload-id',     icon: '🪪', label: 'Upload ID Proof',         href: 'upload-id.html' },
    { key: 'assign-host',   icon: '🤝', label: 'Assign Host',             href: 'assign-host.html' },
    { key: 'generate-qr',   icon: '🔳', label: 'Generate QR Pass',        href: 'generate-qr.html' },
    { key: 'print-badge',   icon: '🖨️', label: 'Print Badge',             href: 'print-badge.html' },
    { section: 'Approvals' },
    { key: 'pending',       icon: '⏳', label: 'Pending Approvals',       href: 'pending.html',          badge: '5', badgeClass: 'badge-red' },
    { key: 'approved',      icon: '✅', label: 'Approved Visitors',       href: 'approved.html' },
    { key: 'rejected',      icon: '❌', label: 'Rejected Visitors',       href: 'rejected.html' },
    { divider: true },
    { key: 'reports',       icon: '📊', label: 'Reports',                 href: 'reports.html' },
    { key: 'notifications', icon: '🔔', label: 'Notifications',           href: 'notifications.html',    badge: '9', badgeClass: 'badge-red' },
    { key: 'profile',       icon: '👤', label: 'Profile',                 href: 'profile.html' },
  ];

  let sidebarHTML = '';
  menu.forEach(item => {
    if (item.section) {
      sidebarHTML += `<div class="s-section">${item.section}</div>`;
    } else if (item.divider) {
      sidebarHTML += `<div class="s-divider"></div>`;
    } else {
      const isActive = item.key === activePage ? ' active' : '';
      const badge = item.badge
        ? `<span class="s-badge ${item.badgeClass}">${item.badge}</span>` : '';
      sidebarHTML += `
        <a href="${item.href}" class="s-item${isActive}">
          <span class="s-item-left">
            <span class="s-icon">${item.icon}</span>
            <span class="s-label">${item.label}</span>
          </span>
          ${badge}
        </a>`;
    }
  });

  sidebarHTML += `
    <div class="s-divider"></div>
    <a href="../index.html" class="s-item" style="color: var(--danger);">
      <span class="s-item-left">
        <span class="s-icon">🚪</span>
        <span class="s-label">Logout</span>
      </span>
    </a>`;

  /* ─── Header HTML ────────────────────────────────────────────────────────── */
  const headerHTML = `
    <button id="rec-toggle" class="rec-sidebar-toggle" data-tooltip="Toggle Sidebar (Ctrl+B)">☰</button>
    <a href="dashboard.html" class="rec-header-logo">
      <div class="rec-logo-icon">🛡️</div>
      <span class="rec-logo-text">SVPMS<span>.io</span></span>
    </a>
    <div class="rec-search-wrap">
      <span class="rec-search-icon">🔍</span>
      <input type="text" id="rec-global-search" placeholder="Search visitors, hosts, pass IDs…">
      <span class="rec-search-kbd">Ctrl+K</span>
    </div>
    <div class="rec-header-right">
      <div class="rec-date-time">
        <div class="dt-date" id="hdr-date">—</div>
        <div class="dt-time" id="hdr-time">—</div>
      </div>
      <button class="rec-icon-btn" data-tooltip="Messages">💬<span class="rec-badge">3</span></button>
      <button class="rec-icon-btn" data-tooltip="Notifications">🔔<span class="rec-badge">9</span></button>
      <button class="rec-icon-btn" id="rec-theme-btn" data-tooltip="Toggle Theme">🌙</button>
      <div class="rec-profile">
        <div class="rec-avatar">SA</div>
        <div class="rec-profile-info">
          <div class="rec-profile-name">Sophia Adeyemi</div>
          <div class="rec-profile-role">Receptionist</div>
        </div>
      </div>
    </div>`;

  /* ─── Inject into DOM ────────────────────────────────────────────────────── */
  let hdr = document.querySelector('header.rec-header');
  if (!hdr) {
    hdr = document.createElement('header');
    hdr.className = 'rec-header';
    document.body.insertBefore(hdr, document.body.firstChild);
  }
  hdr.innerHTML = headerHTML;

  let sb = document.querySelector('aside.rec-sidebar');
  if (!sb) {
    sb = document.createElement('aside');
    sb.className = 'rec-sidebar';
    sb.id = 'rec-sidebar';
    hdr.insertAdjacentElement('afterend', sb);
  }
  sb.innerHTML = sidebarHTML;

  /* ─── Live clock ─────────────────────────────────────────────────────────── */
  function updateClock() {
    const now = new Date();
    const dateEl = document.getElementById('hdr-date');
    const timeEl = document.getElementById('hdr-time');
    if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  updateClock();
  setInterval(updateClock, 30000);

  /* ─── Sidebar toggle ─────────────────────────────────────────────────────── */
  document.addEventListener('click', e => {
    if (e.target.closest('#rec-toggle')) document.body.classList.toggle('sidebar-collapsed');
  });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); document.body.classList.toggle('sidebar-collapsed'); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); document.getElementById('rec-global-search')?.focus(); }
  });

  /* ─── Theme toggle ───────────────────────────────────────────────────────── */
  const saved = localStorage.getItem('rec-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  const updateThemeIcon = () => {
    const btn = document.getElementById('rec-theme-btn');
    if (btn) btn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  };
  updateThemeIcon();
  document.addEventListener('click', e => {
    if (e.target.closest('#rec-theme-btn')) {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('rec-theme', next);
      updateThemeIcon();
    }
  });
}
