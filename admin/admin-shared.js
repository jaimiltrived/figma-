/**
 * admin-shared.js
 * Single source of truth for the Admin Sidebar + Header.
 * Include this in every admin page and call initAdminShell(activePageKey)
 *
 * Usage:
 *   <script src="admin-shared.js"></script>
 *   <script>initAdminShell('dashboard');</script>
 *
 * Active page keys:
 *   dashboard | analytics | visitors | approvals | employees | departments
 *   passes | blacklist | logs | reports | masters | users | settings | profile
 */

function initAdminShell(activePage) {
  /* ---- Inject CSS variables & base styles if not already present ---- */
  if (!document.getElementById('admin-shell-styles')) {
    const style = document.createElement('style');
    style.id = 'admin-shell-styles';
    style.textContent = `
      :root {
        --admin-sidebar-width: 260px;
        --admin-sidebar-collapsed-width: 72px;
        --admin-header-height: 64px;
      }
      html, body { margin: 0; padding: 0; }
      body.admin-body {
        background-color: var(--bg-primary);
        font-family: 'Inter', 'Plus Jakarta Sans', sans-serif;
        overflow-x: hidden;
      }

      /* === HEADER === */
      .admin-header {
        position: fixed; top: 0; left: 0; right: 0;
        height: var(--admin-header-height);
        background: var(--bg-card);
        backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        border-bottom: 1px solid var(--border-color);
        z-index: 1000;
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 1.5rem; gap: 1rem;
      }
      .admin-logo-group { display: flex; align-items: center; gap: 0.85rem; flex-shrink: 0; }
      .sidebar-toggle-btn {
        width: 36px; height: 36px; border-radius: 8px;
        background: var(--bg-tertiary); border: 1px solid var(--border-color);
        color: var(--text-primary); display: flex; align-items: center; justify-content: center;
        cursor: pointer; font-size: 1.1rem; flex-shrink: 0;
        transition: background 0.15s, border-color 0.15s;
      }
      .sidebar-toggle-btn:hover { background: var(--accent-glow); border-color: var(--accent-primary); }
      .global-search-container { position: relative; flex: 1; max-width: 460px; }
      .global-search-container input {
        width: 100%; padding: 0.52rem 3rem 0.52rem 2.4rem;
        border-radius: 20px;
        background: var(--bg-tertiary); border: 1px solid var(--border-color);
        color: var(--text-primary); font-size: 0.875rem; outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
        box-sizing: border-box;
      }
      .global-search-container input:focus { border-color: var(--accent-primary); box-shadow: 0 0 0 3px var(--accent-glow); }
      .search-icon-left { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.9rem; pointer-events: none; }
      .search-shortcut-hint {
        position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
        background: var(--bg-card); border: 1px solid var(--border-color);
        font-size: 0.68rem; font-weight: 700; color: var(--text-muted);
        padding: 0.12rem 0.4rem; border-radius: 4px; pointer-events: none;
      }
      .header-actions-group { display: flex; align-items: center; gap: 0.65rem; flex-shrink: 0; }
      .icon-action-btn {
        width: 38px; height: 38px; border-radius: 50%;
        background: var(--bg-tertiary); border: 1px solid var(--border-color);
        color: var(--text-secondary); display: flex; align-items: center; justify-content: center;
        cursor: pointer; position: relative; transition: all 0.15s;
        font-size: 1rem;
      }
      .icon-action-btn:hover { background: var(--bg-card-hover); color: var(--text-primary); }
      .icon-badge {
        position: absolute; top: -3px; right: -3px;
        width: 18px; height: 18px; border-radius: 50%;
        background: var(--danger); color: #fff;
        font-size: 0.65rem; font-weight: 800;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid var(--bg-secondary);
      }

      /* === SIDEBAR === */
      .admin-sidebar {
        position: fixed; top: var(--admin-header-height); left: 0; bottom: 0;
        width: var(--admin-sidebar-width);
        background: var(--bg-secondary); border-right: 1px solid var(--border-color);
        z-index: 900; overflow-y: auto; overflow-x: hidden;
        padding: 0.75rem 0 2rem;
        transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
      }
      body.sidebar-collapsed .admin-sidebar { width: var(--admin-sidebar-collapsed-width); }
      body.sidebar-collapsed .sidebar-label,
      body.sidebar-collapsed .menu-section-header,
      body.sidebar-collapsed .sidebar-badge { display: none !important; }
      body.sidebar-collapsed .sidebar-menu-item { justify-content: center; padding: 0.7rem; }
      body.sidebar-collapsed .admin-sidebar .sidebar-icon { width: auto; }
      .menu-section-header {
        font-size: 0.68rem; font-weight: 800; text-transform: uppercase;
        letter-spacing: 0.09em; color: var(--text-muted);
        padding: 0.9rem 1.5rem 0.3rem;
      }
      .sidebar-menu-item {
        display: flex; align-items: center; justify-content: space-between;
        padding: 0.62rem 1.1rem; margin: 0.1rem 0.65rem; border-radius: 10px;
        color: var(--text-secondary); font-size: 0.865rem; font-weight: 600;
        cursor: pointer; text-decoration: none;
        transition: background 0.15s, color 0.15s;
      }
      .sidebar-menu-item:hover { background: var(--bg-tertiary); color: var(--text-primary); }
      .sidebar-menu-item.active {
        background: var(--accent-gradient); color: #ffffff;
        box-shadow: var(--shadow-glow);
      }
      .sidebar-icon { font-size: 1.05rem; width: 22px; text-align: center; flex-shrink: 0; }
      .sidebar-item-left { display: flex; align-items: center; gap: 0.7rem; }
      .sidebar-badge { font-size: 0.68rem !important; padding: 0.12rem 0.45rem !important; }

      /* === MAIN WRAPPER === */
      .admin-main-wrapper {
        margin-top: var(--admin-header-height);
        margin-left: var(--admin-sidebar-width);
        padding: 1.5rem 2rem 4rem;
        transition: margin-left 0.25s cubic-bezier(0.4,0,0.2,1);
        min-height: calc(100vh - var(--admin-header-height));
      }
      body.sidebar-collapsed .admin-main-wrapper { margin-left: var(--admin-sidebar-collapsed-width); }

      /* === SHARED CARD === */
      .admin-card {
        background: var(--bg-card); border: 1px solid var(--border-color);
        border-radius: 16px; padding: 1.5rem; box-shadow: var(--shadow-md);
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .admin-card:hover { border-color: var(--border-color-hover); box-shadow: var(--shadow-lg); }

      /* === TABLES === */
      .enterprise-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem; }
      .enterprise-table th {
        padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-color);
        background: var(--bg-tertiary); color: var(--text-secondary);
        font-size: 0.73rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      }
      .enterprise-table td { padding: 0.95rem 1rem; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
      .enterprise-table tr:hover td { background: var(--bg-card-hover); }

      /* === STATUS DOTS === */
      .status-dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
      .status-dot.green { background: var(--success); box-shadow: 0 0 6px var(--success); }
      .status-dot.yellow { background: var(--warning); box-shadow: 0 0 6px var(--warning); }
      .status-dot.red { background: var(--danger); box-shadow: 0 0 6px var(--danger); }
    `;
    document.head.appendChild(style);
  }

  /* ---- Build header HTML ---- */
  const headerHTML = `
    <div class="admin-logo-group">
      <button id="sidebar-toggle-btn" class="sidebar-toggle-btn" title="Toggle Sidebar (Ctrl+B)">☰</button>
      <a href="../index.html" class="brand-logo">
        <div class="brand-icon">🛡️</div>
        <span>SVPMS<span class="text-gradient">.io</span></span>
      </a>
      <span class="badge badge-primary" style="font-size:0.71rem;padding:0.18rem 0.55rem;">Super Admin</span>
    </div>
    <div class="global-search-container">
      <span class="search-icon-left">🔍</span>
      <input type="text" id="global-search-input" placeholder="Search visitors, employees, gates, logs, settings…">
      <span class="search-shortcut-hint">Ctrl+K</span>
    </div>
    <div class="header-actions-group">
      <button class="icon-action-btn" title="Notifications">
        🔔<span class="icon-badge">5</span>
      </button>
      <button class="icon-action-btn" title="Messages">
        💬<span class="icon-badge" style="background:var(--info);">2</span>
      </button>
      <button id="theme-toggle-btn" class="icon-action-btn" title="Toggle Theme">
        <span id="theme-icon">🌙</span>
      </button>
      <div style="display:flex;align-items:center;gap:0.55rem;padding-left:0.6rem;border-left:1px solid var(--border-color);">
        <div class="user-avatar" style="width:37px;height:37px;background:var(--accent-gradient);font-weight:800;font-size:0.82rem;">MV</div>
        <div style="line-height:1.25;" class="desktop-only">
          <div style="font-weight:800;font-size:0.83rem;">Marcus Vance</div>
          <div style="font-size:0.7rem;color:var(--text-secondary);">Chief Security Officer</div>
        </div>
      </div>
    </div>
  `;

  /* ---- Sidebar menu definition ---- */
  const menuItems = [
    { section: 'Core Command' },
    { key: 'dashboard',    icon: '📊', label: 'Dashboard',           href: 'dashboard.html' },
    { key: 'analytics',    icon: '📈', label: 'Analytics',           href: 'analytics.html' },

    { section: 'Visitor Operations' },
    { key: 'visitors',     icon: '👥', label: 'Visitors',            href: 'visitors.html',     badge: '265', badgeClass: 'badge-primary' },
    { key: 'approvals',    icon: '🎫', label: 'Approvals',           href: 'approvals.html',    badge: '17',  badgeClass: 'badge-warning' },

    { section: 'Workplace' },
    { key: 'employees',    icon: '💼', label: 'Employees',           href: 'employees.html' },
    { key: 'departments',  icon: '🏢', label: 'Departments & Gates', href: 'departments.html' },
    { key: 'passes',       icon: '🔳', label: 'Pass Studio',         href: 'passes.html' },

    { section: 'Security' },
    { key: 'blacklist',    icon: '🛡️', label: 'Watchlist',           href: 'blacklist.html',    badge: '9',   badgeClass: 'badge-danger' },
    { key: 'logs',         icon: '📜', label: 'Audit Logs',          href: 'activity-logs.html' },
    { key: 'reports',      icon: '📊', label: 'Reports',             href: 'reports.html' },

    { section: 'System' },
    { key: 'masters',      icon: '📑', label: 'Masters',             href: 'masters.html' },
    { key: 'users',        icon: '🔐', label: 'Users & Roles',       href: 'users-roles.html' },
    { key: 'settings',     icon: '⚙️', label: 'Settings',            href: 'settings.html' },
    { key: 'profile',      icon: '👤', label: 'Profile',             href: 'profile.html' },
  ];

  /* ---- Build sidebar HTML ---- */
  let sidebarHTML = '';
  menuItems.forEach(item => {
    if (item.section) {
      sidebarHTML += `<div class="menu-section-header">${item.section}</div>`;
    } else {
      const isActive = item.key === activePage ? ' active' : '';
      const badgeHTML = item.badge
        ? `<span class="badge ${item.badgeClass} sidebar-badge">${item.badge}</span>`
        : '';
      sidebarHTML += `
        <a href="${item.href}" class="sidebar-menu-item${isActive}">
          <span class="sidebar-item-left">
            <span class="sidebar-icon">${item.icon}</span>
            <span class="sidebar-label">${item.label}</span>
          </span>
          ${badgeHTML}
        </a>`;
    }
  });

  sidebarHTML += `
    <div style="margin-top:1.5rem;padding:0.75rem 1rem;border-top:1px solid var(--border-color);">
      <a href="../index.html" class="btn btn-outline btn-full"
         style="text-decoration:none;justify-content:center;font-size:0.83rem;">
        Log Out ➔
      </a>
    </div>`;

  /* ---- Inject header ---- */
  let header = document.querySelector('header.admin-header');
  if (!header) {
    header = document.createElement('header');
    header.className = 'admin-header';
    document.body.insertBefore(header, document.body.firstChild);
  }
  header.innerHTML = headerHTML;

  /* ---- Inject sidebar ---- */
  let sidebar = document.querySelector('aside.admin-sidebar');
  if (!sidebar) {
    sidebar = document.createElement('aside');
    sidebar.className = 'admin-sidebar';
    sidebar.id = 'admin-sidebar';
    header.insertAdjacentElement('afterend', sidebar);
  }
  sidebar.innerHTML = sidebarHTML;

  /* ---- Ensure main wrapper has correct class ---- */
  const main = document.querySelector('main');
  if (main && !main.classList.contains('admin-main-wrapper')) {
    main.classList.add('admin-main-wrapper');
  }

  /* ---- Sidebar toggle ---- */
  document.addEventListener('click', e => {
    if (e.target.closest('#sidebar-toggle-btn')) {
      document.body.classList.toggle('sidebar-collapsed');
    }
  });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      document.body.classList.toggle('sidebar-collapsed');
    }
  });

  /* ---- Theme toggle ---- */
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  document.addEventListener('click', e => {
    if (e.target.closest('#theme-toggle-btn')) {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      const icon = document.getElementById('theme-icon');
      if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
    }
  });

  /* ---- Global search Ctrl+K focus ---- */
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const inp = document.getElementById('global-search-input');
      if (inp) inp.focus();
    }
  });
}
