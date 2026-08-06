/* ==========================================================================
   SVPMS - Smart Visitor & Security Management System
   Application Logic & State Management Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Global State Storage
  const state = {
    currentView: 'landing',
    currentRole: 'super-admin',
    currentRoleName: 'Super Admin',
    selectedOrg: 'acme',
    theme: localStorage.getItem('svpms-theme') || 'dark',
    lang: localStorage.getItem('svpms-lang') || 'en',
    otpTimerCount: 60,
    otpTimerInterval: null
  };

  // Translations Dictionary (EN, ES, FR, DE)
  const translations = {
    en: {
      heroTitle: 'Smart Visitor & Security Management Simplified.',
      heroSub: 'Elevate your corporate security with contactless QR passes, instant host notifications, AI facial verification, and real-time occupancy analytics.',
      signIn: 'Sign In',
      bookDemo: 'Book Demo'
    },
    es: {
      heroTitle: 'Gestión Inteligente de Visitantes y Seguridad Simplificada.',
      heroSub: 'Eleve la seguridad corporativa con pases QR sin contacto, notificaciones instantáneas y análisis en tiempo real.',
      signIn: 'Iniciar Sesión',
      bookDemo: 'Solicitar Demo'
    },
    fr: {
      heroTitle: 'Gestion Intelligente des Visiteurs et de la Sécurité.',
      heroSub: 'Optimisez votre sécurité entreprise avec des passes QR sans contact et des notifications en temps réel.',
      signIn: 'Se Connecter',
      bookDemo: 'Réserver Démo'
    },
    de: {
      heroTitle: 'Intelligentes Besucher- und Sicherheitsmanagement.',
      heroSub: 'Erhöhen Sie Ihre Unternehmenssicherheit mit kontaktlosen QR-Pässen und Echtzeit-Analysen.',
      signIn: 'Anmelden',
      bookDemo: 'Demo Buchen'
    }
  };

  /* ==========================================================================
     1. Navigation Router & Page Views Switching
     ========================================================================== */
  function navigateTo(viewId) {
    state.currentView = viewId;

    // Hide all page sections
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));

    // Update Nav links active state
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.view === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Show target section
    const targetSec = document.getElementById(`${viewId}-view`);
    if (targetSec) {
      targetSec.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Attach nav link click handlers
  document.querySelectorAll('[data-view]').forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = elem.dataset.view;
      if (targetView) {
        navigateTo(targetView);
      }
    });
  });

  /* ==========================================================================
     2. Dark / Light Theme Engine
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');

  function applyTheme(theme) {
    state.theme = theme;
    localStorage.setItem('svpms-theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      if (themeIcon) themeIcon.textContent = '☀️';
    } else {
      document.body.classList.remove('light-theme');
      if (themeIcon) themeIcon.textContent = '🌙';
    }
  }

  applyTheme(state.theme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      showToast(`Switched to ${nextTheme.toUpperCase()} theme`, 'info');
    });
  }

  /* ==========================================================================
     3. Language Switcher
     ========================================================================== */
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.value = state.lang;
    langSelect.addEventListener('change', (e) => {
      const selectedLang = e.target.value;
      state.lang = selectedLang;
      localStorage.setItem('svpms-lang', selectedLang);

      const dict = translations[selectedLang] || translations.en;
      showToast(`Language set to ${selectedLang.toUpperCase()}`, 'info');
    });
  }

  /* ==========================================================================
     4. Authentication Modal & State Machine (Screens 15 to 25)
     ========================================================================== */
  const authModal = document.getElementById('auth-modal');
  const authModalClose = document.getElementById('auth-modal-close');
  const authScreens = document.querySelectorAll('.auth-screen');
  const authScreenSelect = document.getElementById('auth-screen-select');

  function showAuthModal() {
    if (authModal) authModal.classList.add('active');
  }

  function hideAuthModal() {
    if (authModal) authModal.classList.remove('active');
    if (state.otpTimerInterval) clearInterval(state.otpTimerInterval);
  }

  if (authModalClose) {
    authModalClose.addEventListener('click', hideAuthModal);
  }

  function switchAuthScreen(screenId) {
    showAuthModal();
    authScreens.forEach(sc => sc.style.display = 'none');

    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) {
      targetScreen.style.display = 'block';
    }

    // Handle special screen initialization
    if (screenId === 'auth-verify-otp') {
      startOtpTimer();
    } else if (screenId === 'auth-welcome-redirect') {
      startWelcomeRedirect();
    }
  }

  // Nav Login & Get Started Buttons
  const btnNavLogin = document.getElementById('btn-nav-login');
  const btnNavGetStarted = document.getElementById('btn-nav-getstarted');
  const btnHeroStart = document.getElementById('btn-hero-start');
  const btnHeroDemo = document.getElementById('btn-hero-demo');

  if (btnNavLogin) {
    btnNavLogin.addEventListener('click', () => switchAuthScreen('auth-role-select'));
  }
  if (btnNavGetStarted) {
    btnNavGetStarted.addEventListener('click', () => switchAuthScreen('auth-role-select'));
  }
  if (btnHeroStart) {
    btnHeroStart.addEventListener('click', () => switchAuthScreen('auth-role-select'));
  }
  if (btnHeroDemo) {
    btnHeroDemo.addEventListener('click', () => {
      showToast('Launching Interactive Visitor Kiosk Demo...', 'info');
      switchAuthScreen('auth-role-select');
    });
  }

  // Developer Quick Auth Screen Dropdown Selector
  if (authScreenSelect) {
    authScreenSelect.addEventListener('change', (e) => {
      const selectedVal = e.target.value;
      if (!selectedVal) return;

      if (selectedVal === 'role-dashboard') {
        hideAuthModal();
        navigateTo('role-dashboard');
      } else {
        switchAuthScreen(selectedVal);
      }
      authScreenSelect.value = ''; // Reset select
    });
  }

  /* --- 24. Role Selector Click Handlers --- */
  const roleCards = document.querySelectorAll('.role-card[data-role]');
  const loginRoleName = document.getElementById('login-role-name');

  roleCards.forEach(card => {
    card.addEventListener('click', () => {
      roleCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const roleKey = card.dataset.role;
      const roleName = card.querySelector('h4').textContent;
      state.currentRole = roleKey;
      state.currentRoleName = roleName;

      if (loginRoleName) loginRoleName.textContent = roleName;
      switchAuthScreen('auth-login');
      showToast(`Role selected: ${roleName}`, 'info');
    });
  });

  /* --- 15. Login Form & Password Toggle --- */
  const loginForm = document.getElementById('login-form');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const loginPasswordInput = document.getElementById('login-password');

  if (togglePasswordBtn && loginPasswordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPass = loginPasswordInput.type === 'password';
      loginPasswordInput.type = isPass ? 'text' : 'password';
      togglePasswordBtn.textContent = isPass ? '🙈' : '👁️';
    });
  }

  if (loginForm) {
    loginForm.addEventListener('click', (e) => {
      if (e.target.id === 'link-forgot-pass') {
        e.preventDefault();
        switchAuthScreen('auth-forgot-password');
      }
    });

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Credentials verified. Selecting Organization...', 'success');
      switchAuthScreen('auth-select-org');
    });
  }

  // Social SSO and Quick Auth Links
  const btnSsoMs = document.getElementById('btn-sso-ms');
  const btnSsoGoogle = document.getElementById('btn-sso-google');
  const linkOtpLogin = document.getElementById('link-otp-login');
  const linkQrLogin = document.getElementById('link-qr-login');

  if (btnSsoMs) {
    btnSsoMs.addEventListener('click', () => {
      showToast('Authenticating via Microsoft SSO...', 'info');
      setTimeout(() => switchAuthScreen('auth-select-org'), 800);
    });
  }
  if (btnSsoGoogle) {
    btnSsoGoogle.addEventListener('click', () => {
      showToast('Authenticating via Google Workspace...', 'info');
      setTimeout(() => switchAuthScreen('auth-select-org'), 800);
    });
  }
  if (linkOtpLogin) {
    linkOtpLogin.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthScreen('auth-verify-otp');
    });
  }
  if (linkQrLogin) {
    linkQrLogin.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Scan your SVPMS Mobile App QR Code on Screen', 'info');
    });
  }

  /* --- 16. Forgot Password Form --- */
  const forgotForm = document.getElementById('forgot-form');
  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value;
      const otpEmailSpan = document.getElementById('otp-sent-email');
      if (otpEmailSpan) otpEmailSpan.textContent = email;
      showToast(`Verification code dispatched to ${email}`, 'success');
      switchAuthScreen('auth-verify-otp');
    });
  }

  document.querySelectorAll('.link-back-login').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthScreen('auth-login');
    });
  });

  /* --- 17. OTP Input Auto-Advance & Countdown Timer --- */
  const otpDigits = document.querySelectorAll('.otp-digit');
  const otpTimerSpan = document.getElementById('otp-timer');
  const btnResendOtp = document.getElementById('btn-resend-otp');
  const otpForm = document.getElementById('otp-form');

  otpDigits.forEach((digit, index) => {
    digit.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && index < otpDigits.length - 1) {
        otpDigits[index + 1].focus();
      }
    });

    digit.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        otpDigits[index - 1].focus();
      }
    });
  });

  function startOtpTimer() {
    state.otpTimerCount = 60;
    if (otpTimerSpan) otpTimerSpan.textContent = '60';
    if (btnResendOtp) btnResendOtp.style.display = 'none';

    if (state.otpTimerInterval) clearInterval(state.otpTimerInterval);

    state.otpTimerInterval = setInterval(() => {
      state.otpTimerCount--;
      if (otpTimerSpan) otpTimerSpan.textContent = state.otpTimerCount;

      if (state.otpTimerCount <= 0) {
        clearInterval(state.otpTimerInterval);
        if (btnResendOtp) btnResendOtp.style.display = 'inline-block';
      }
    }, 1000);
  }

  if (btnResendOtp) {
    btnResendOtp.addEventListener('click', () => {
      showToast('A fresh 6-digit OTP code has been sent!', 'success');
      startOtpTimer();
    });
  }

  if (otpForm) {
    otpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('OTP verified successfully!', 'success');
      switchAuthScreen('auth-reset-password');
    });
  }

  /* --- 18. Reset Password & Strength Evaluator --- */
  const newPasswordInput = document.getElementById('new-password');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');
  const resetPasswordForm = document.getElementById('reset-password-form');

  if (newPasswordInput) {
    newPasswordInput.addEventListener('input', (e) => {
      const val = e.target.value;
      let score = 0;

      if (val.length >= 8) score += 25;
      if (/[A-Z]/.test(val)) score += 25;
      if (/[0-9]/.test(val)) score += 25;
      if (/[^A-Za-z0-9]/.test(val)) score += 25;

      if (strengthBar) strengthBar.style.width = `${score}%`;

      if (score <= 25) {
        if (strengthBar) strengthBar.style.backgroundColor = 'var(--danger)';
        if (strengthText) strengthText.textContent = 'Strength: Weak';
      } else if (score <= 75) {
        if (strengthBar) strengthBar.style.backgroundColor = 'var(--warning)';
        if (strengthText) strengthText.textContent = 'Strength: Moderate';
      } else {
        if (strengthBar) strengthBar.style.backgroundColor = 'var(--success)';
        if (strengthText) strengthText.textContent = 'Strength: Strong';
      }
    });
  }

  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      switchAuthScreen('auth-password-success');
    });
  }

  /* --- 23. Organization Multi-Tenant Selection --- */
  const orgCards = document.querySelectorAll('#org-list .role-card');
  const btnConfirmOrg = document.getElementById('btn-confirm-org');

  orgCards.forEach(card => {
    card.addEventListener('click', () => {
      orgCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.selectedOrg = card.dataset.org;
    });
  });

  if (btnConfirmOrg) {
    btnConfirmOrg.addEventListener('click', () => {
      showToast('Organization confirmed. Requiring 2FA check...', 'info');
      switchAuthScreen('auth-2fa');
    });
  }

  /* --- 20. 2FA Form --- */
  const twofaForm = document.getElementById('twofa-form');
  if (twofaForm) {
    twofaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      switchAuthScreen('auth-welcome-redirect');
    });
  }

  /* --- 21. Account Locked & Contact Admin --- */
  const btnContactAdmin = document.getElementById('btn-contact-admin');
  if (btnContactAdmin) {
    btnContactAdmin.addEventListener('click', () => {
      showToast('Support ticket #SUP-8894 opened with Security Admin.', 'info');
    });
  }

  /* --- 25. Welcome Dashboard Redirect Loader --- */
  function startWelcomeRedirect() {
    const welcomeUserName = document.getElementById('welcome-user-name');
    const welcomeRoleName = document.getElementById('welcome-role-name');
    const redirectProgress = document.getElementById('redirect-progress');
    const dashRoleBadge = document.getElementById('dash-role-badge');

    if (welcomeRoleName) welcomeRoleName.textContent = state.currentRoleName;
    if (dashRoleBadge) dashRoleBadge.textContent = state.currentRoleName;

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (redirectProgress) redirectProgress.style.width = `${progress}%`;

      if (progress >= 100) {
        clearInterval(interval);
        hideAuthModal();
        navigateTo('role-dashboard');
        showToast(`Authenticated as ${state.currentRoleName}`, 'success');
      }
    }, 250);
  }

  // Logout from Dashboard
  const btnDashLogout = document.getElementById('btn-dash-logout');
  if (btnDashLogout) {
    btnDashLogout.addEventListener('click', () => {
      navigateTo('landing');
      showToast('Logged out safely.', 'info');
    });
  }

  /* ==========================================================================
     5. Public Website Features & Interactivity
     ========================================================================== */

  // Pricing Toggle (Monthly / Annual calculation)
  const pricingToggle = document.getElementById('pricing-toggle');
  const priceStarter = document.getElementById('price-starter');
  const pricePro = document.getElementById('price-pro');

  if (pricingToggle) {
    pricingToggle.addEventListener('change', (e) => {
      const isAnnual = e.target.checked;
      if (priceStarter && pricePro) {
        if (isAnnual) {
          priceStarter.innerHTML = '$39<span style="font-size: 1rem; color: var(--text-muted);">/mo (billed annually)</span>';
          pricePro.innerHTML = '$119<span style="font-size: 1rem; color: var(--text-muted);">/mo (billed annually)</span>';
        } else {
          priceStarter.innerHTML = '$49<span style="font-size: 1rem; color: var(--text-muted);">/mo</span>';
          pricePro.innerHTML = '$149<span style="font-size: 1rem; color: var(--text-muted);">/mo</span>';
        }
      }
    });
  }

  // FAQ Accordions
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      item.classList.toggle('open');
    });
  });

  // Help Center Search Filter
  const helpSearchInput = document.getElementById('help-search-input');
  if (helpSearchInput) {
    helpSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      document.querySelectorAll('#help-articles-grid .help-article-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? 'block' : 'none';
      });
    });
  }

  // Contact Form Submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you! A Security Advisor will contact you within 2 hours.', 'success');
      contactForm.reset();
    });
  }

  /* ==========================================================================
     6. Command Center Dashboard Interactivity
     ========================================================================== */

  // Real-Time Live Clock
  const liveTimestamp = document.getElementById('live-timestamp');
  function updateLiveClock() {
    if (!liveTimestamp) return;
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    liveTimestamp.textContent = now.toLocaleDateString('en-US', options);
  }
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  // Live Table Search & Filter Engine
  const visitorSearchInput = document.getElementById('visitor-search-input');
  const visitorStatusSelect = document.getElementById('visitor-status-select');
  const visitorTableBody = document.getElementById('visitor-table-body');

  function filterVisitorTable() {
    if (!visitorTableBody) return;
    const query = (visitorSearchInput ? visitorSearchInput.value : '').toLowerCase();
    const selectedStatus = visitorStatusSelect ? visitorStatusSelect.value : 'all';

    const rows = visitorTableBody.querySelectorAll('.visitor-row');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const rowStatus = row.dataset.status || '';

      const matchesQuery = text.includes(query);
      const matchesStatus = (selectedStatus === 'all') || (rowStatus === selectedStatus);

      if (matchesQuery && matchesStatus) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  if (visitorSearchInput) visitorSearchInput.addEventListener('input', filterVisitorTable);
  if (visitorStatusSelect) visitorStatusSelect.addEventListener('change', filterVisitorTable);

  // Register Guest Modal Logic
  const registerModal = document.getElementById('register-guest-modal');
  const btnOpenRegisterModal = document.getElementById('btn-open-register-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const registerGuestForm = document.getElementById('register-guest-form');

  function openRegisterModal() {
    if (registerModal) registerModal.classList.add('active');
  }
  function closeRegisterModal() {
    if (registerModal) registerModal.classList.remove('active');
    if (registerGuestForm) registerGuestForm.reset();
  }

  if (btnOpenRegisterModal) btnOpenRegisterModal.addEventListener('click', openRegisterModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeRegisterModal);
  if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeRegisterModal);

  if (registerGuestForm) {
    registerGuestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-visitor-name').value.trim();
      const org = document.getElementById('reg-visitor-org').value.trim();
      const host = document.getElementById('reg-host-name').value.trim();
      const zone = document.getElementById('reg-gate-zone').value;
      const status = document.getElementById('reg-pass-type').value;

      const randomId = Math.floor(8949 + Math.random() * 50);
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'GV';

      let statusBadgeHtml = `<span class="badge badge-success">● On Site</span>`;
      let actionBtnHtml = `<button class="btn btn-outline btn-checkout" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">Check Out</button>`;

      if (status === 'Pre-Approved') {
        statusBadgeHtml = `<span class="badge badge-warning">⚡ Pre-Approved</span>`;
        actionBtnHtml = `<button class="btn btn-primary btn-checkin" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">Check In Now</button>`;
      } else if (status === 'Pending Host Approval') {
        statusBadgeHtml = `<span class="badge badge-danger">⏳ Pending Host Approval</span>`;
        actionBtnHtml = `<button class="btn btn-primary btn-approve" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;">Approve</button>`;
      }

      const newRow = document.createElement('tr');
      newRow.className = 'visitor-row';
      newRow.dataset.status = status;
      newRow.style.borderBottom = '1px solid var(--border-color)';
      newRow.style.transition = 'background var(--transition-fast)';

      newRow.innerHTML = `
        <td style="padding: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="user-avatar" style="width: 36px; height: 36px; background: var(--accent-gradient); font-weight: 700; font-size: 0.8rem;">${initials}</div>
            <div>
              <div class="visitor-name" style="font-weight: 700; color: var(--text-primary);">${name}</div>
              <div class="visitor-org" style="font-size: 0.78rem; color: var(--text-secondary);">${org}</div>
            </div>
          </div>
        </td>
        <td style="padding: 1rem;">
          <div class="host-name" style="font-weight: 600;">${host}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">Host Employee</div>
        </td>
        <td style="padding: 1rem;">
          <div style="font-weight: 600;">Just Now</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">Badge Activated</div>
        </td>
        <td style="padding: 1rem;">
          <div style="font-weight: 600;">${zone}</div>
          <span class="badge" style="background: var(--bg-tertiary); font-size: 0.75rem;">#V-${randomId}</span>
        </td>
        <td style="padding: 1rem;">${statusBadgeHtml}</td>
        <td style="padding: 1rem; text-align: right;">${actionBtnHtml}</td>
      `;

      if (visitorTableBody) {
        visitorTableBody.prepend(newRow);
      }

      closeRegisterModal();
      showToast(`Visitor ${name} registered. Pass #V-${randomId} issued!`, 'success');
      filterVisitorTable();
    });
  }

  // Interactive Action Handlers (Check Out, Check In, Approve, Deny)
  if (visitorTableBody) {
    visitorTableBody.addEventListener('click', (e) => {
      const target = e.target;
      const row = target.closest('tr');
      if (!row) return;

      const visitorName = row.querySelector('.visitor-name')?.textContent || 'Visitor';

      if (target.classList.contains('btn-checkout')) {
        row.dataset.status = 'Checked Out';
        const statusTd = row.children[4];
        const actionTd = row.children[5];
        if (statusTd) statusTd.innerHTML = `<span class="badge" style="background: rgba(255, 255, 255, 0.08); color: var(--text-muted);">Checked Out</span>`;
        if (actionTd) actionTd.innerHTML = `<span style="font-size: 0.78rem; color: var(--text-muted);">Pass Expired</span>`;
        showToast(`${visitorName} has been checked out successfully.`, 'info');
      }
      else if (target.classList.contains('btn-checkin')) {
        row.dataset.status = 'On Site';
        const statusTd = row.children[4];
        const actionTd = row.children[5];
        if (statusTd) statusTd.innerHTML = `<span class="badge badge-success">● On Site</span>`;
        if (actionTd) actionTd.innerHTML = `<button class="btn btn-outline btn-checkout" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">Check Out</button>`;
        showToast(`${visitorName} checked in. Gate turnstile unlocked.`, 'success');
      }
      else if (target.classList.contains('btn-approve')) {
        row.dataset.status = 'Pre-Approved';
        const statusTd = row.children[4];
        const actionTd = row.children[5];
        if (statusTd) statusTd.innerHTML = `<span class="badge badge-warning">⚡ Pre-Approved</span>`;
        if (actionTd) actionTd.innerHTML = `<button class="btn btn-primary btn-checkin" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">Check In Now</button>`;
        showToast(`Visitor pass for ${visitorName} approved by Security Officer.`, 'success');
      }
      else if (target.classList.contains('btn-deny')) {
        row.dataset.status = 'Denied';
        const statusTd = row.children[4];
        const actionTd = row.children[5];
        if (statusTd) statusTd.innerHTML = `<span class="badge badge-danger">🔴 Access Denied</span>`;
        if (actionTd) actionTd.innerHTML = `<span style="font-size: 0.78rem; color: var(--danger);">Rejected</span>`;
        showToast(`Pass request for ${visitorName} denied. Host notified.`, 'danger');
      }
    });
  }

  // Sidebar Tab Interactivity
  const sidebarNav = document.getElementById('sidebar-nav');
  if (sidebarNav) {
    sidebarNav.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        sidebarNav.querySelectorAll('.sidebar-item').forEach(i => {
          i.style.background = 'none';
          i.style.color = 'var(--text-secondary)';
          i.style.fontWeight = '500';
        });
        item.style.background = 'var(--accent-glow)';
        item.style.color = 'var(--accent-primary)';
        item.style.fontWeight = '700';

        const tabName = item.dataset.tab;
        showToast(`Navigated to ${item.innerText.trim()}`, 'info');
      });
    });
  }

  // Export Visitor Log CSV Logic
  const btnExportCsv = document.getElementById('btn-export-csv');
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      if (!visitorTableBody) return;
      const rows = Array.from(visitorTableBody.querySelectorAll('.visitor-row'));
      let csvContent = "data:text/csv;charset=utf-8,Visitor Name,Organization,Host,CheckIn Time,Badge ID,Status\n";

      rows.forEach(r => {
        const name = r.querySelector('.visitor-name')?.textContent || '';
        const org = r.querySelector('.visitor-org')?.textContent || '';
        const host = r.querySelector('.host-name')?.textContent || '';
        const checkin = r.children[2]?.querySelector('div')?.textContent || '';
        const badge = r.children[3]?.querySelector('.badge')?.textContent || '';
        const status = r.dataset.status || '';

        csvContent += `"${name}","${org}","${host}","${checkin}","${badge}","${status}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `SVPMS_Visitor_Audit_Log_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Exported official visitor audit log (CSV)', 'success');
    });
  }

  /* ==========================================================================
     8. Super Admin Control Center Telemetry & Interactivity Engine
     ========================================================================== */

  // 1. Sidebar Collapse / Expand Toggle
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-collapsed');
      showToast(document.body.classList.contains('sidebar-collapsed') ? 'Sidebar collapsed' : 'Sidebar expanded', 'info');
    });
  }

  // Keyboard Shortcuts (Ctrl+K for search, Ctrl+B for sidebar)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('global-search-input');
      if (searchInput) searchInput.focus();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      document.body.classList.toggle('sidebar-collapsed');
    }
  });

  // 2. Chart.js Visual Telemetry Initialization
  if (typeof Chart !== 'undefined') {
    // Chart 1: 12-Month Influx Trend Line Chart
    const visitorTrendCtx = document.getElementById('visitorTrendChart');
    if (visitorTrendCtx) {
      new Chart(visitorTrendCtx.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Visitor Arrivals',
            data: [1200, 1350, 1420, 1580, 1620, 1750, 1690, 1820, 1910, 1850, 1980, 2050],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#8b5cf6'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9ca3af' } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9ca3af' } }
          }
        }
      });
    }

    // Chart 2: Visitor Type Distribution Doughnut Chart
    const visitorTypeCtx = document.getElementById('visitorTypeChart');
    if (visitorTypeCtx) {
      new Chart(visitorTypeCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Clients & Partners', 'Vendors & Contractors', 'Candidates / Interviews', 'VIP Executive Guests'],
          datasets: [{
            data: [42, 31, 18, 9],
            backgroundColor: ['#6366f1', '#3b82f6', '#f59e0b', '#d946ef'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 11 } } } },
          cutout: '70%'
        }
      });
    }

    // Chart 3: Department Bar Chart
    const departmentCtx = document.getElementById('departmentChart');
    if (departmentCtx) {
      new Chart(departmentCtx.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Engineering', 'Finance', 'HR & Legal', 'Operations', 'Executive'],
          datasets: [{
            label: 'Visits Today',
            data: [85, 62, 44, 38, 22],
            backgroundColor: 'rgba(99, 102, 241, 0.85)',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9ca3af' } }
          }
        }
      });
    }

    // Chart 4: Weekly Area Chart
    const weeklyAreaCtx = document.getElementById('weeklyAreaChart');
    if (weeklyAreaCtx) {
      new Chart(weeklyAreaCtx.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Weekly Influx',
            data: [180, 240, 310, 265, 210, 95, 42],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.18)',
            fill: true,
            tension: 0.4,
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9ca3af' } }
          }
        }
      });
    }
  }

  // 3. Admin Sidebar Tab & Navigation Handler
  const adminSidebar = id('admin-sidebar');
  const breadcrumbSpan = id('current-tab-breadcrumb');

  function id(elemId) { return document.getElementById(elemId); }

  if (adminSidebar) {
    adminSidebar.querySelectorAll('.sidebar-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        adminSidebar.querySelectorAll('.sidebar-menu-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const labelText = item.querySelector('.sidebar-label')?.textContent || 'Overview Control Center';
        if (breadcrumbSpan) breadcrumbSpan.textContent = labelText;
        showToast(`Navigated to ${labelText}`, 'info');
      });
    });
  }

  // 4. Master Table Search & Status Filter
  const masterTableSearch = id('master-table-search');
  const masterTableStatus = id('master-table-status');
  const masterTbody = id('master-visitor-tbody');

  function filterMasterTable() {
    if (!masterTbody) return;
    const query = (masterTableSearch ? masterTableSearch.value : '').toLowerCase();
    const selectedStatus = masterTableStatus ? masterTableStatus.value : 'all';

    const rows = masterTbody.querySelectorAll('.master-row');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const rowStatus = row.dataset.status || '';

      const matchesQuery = text.includes(query);
      const matchesStatus = (selectedStatus === 'all') || (rowStatus === selectedStatus);

      if (matchesQuery && matchesStatus) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  if (masterTableSearch) masterTableSearch.addEventListener('input', filterMasterTable);
  if (masterTableStatus) masterTableStatus.addEventListener('change', filterMasterTable);

  // 5. Quick Actions Hub Buttons
  const qaRegister = id('qa-register');
  const btnRegisterHero = id('btn-register-guest-hero');
  const qaQr = id('qa-qr');
  const qaPrint = id('qa-print');
  const qaEmployee = id('qa-employee');
  const qaDepartment = id('qa-department');
  const qaExport = id('qa-export');
  const btnExportMaster = id('btn-export-master-report');
  const qaAnalytics = id('qa-analytics');
  const qaBlacklist = id('qa-blacklist');

  if (qaRegister) qaRegister.addEventListener('click', openRegisterModal);
  if (btnRegisterHero) btnRegisterHero.addEventListener('click', openRegisterModal);
  if (qaQr) qaQr.addEventListener('click', () => showToast('Opening Express QR Pass Studio...', 'info'));
  if (qaPrint) qaPrint.addEventListener('click', () => showToast('Triggering Brother/Zebra thermal badge printer...', 'success'));
  if (qaEmployee) qaEmployee.addEventListener('click', () => showToast('Opening Employee Directory HR Sync...', 'info'));
  if (qaDepartment) qaDepartment.addEventListener('click', () => showToast('Opening Workplace Gate & Zone Manager...', 'info'));
  if (qaAnalytics) qaAnalytics.addEventListener('click', () => showToast('Loading Telemetry & Peak Hours Analytics...', 'info'));
  if (qaBlacklist) qaBlacklist.addEventListener('click', () => showToast('Opening Watchlist & Security Ban List...', 'warning'));

  if (qaExport || btnExportMaster) {
    const triggerExport = () => {
      showToast('Exporting Executive Security & Visitor Audit Log (PDF/CSV)', 'success');
    };
    if (qaExport) qaExport.addEventListener('click', triggerExport);
    if (btnExportMaster) btnExportMaster.addEventListener('click', triggerExport);
  }

  // 6. Approval Queue Panel Cards Interactivity
  const approvalQueueList = id('approval-queue-list');
  if (approvalQueueList) {
    approvalQueueList.addEventListener('click', (e) => {
      const target = e.target;
      const card = target.closest('div[style*="background"]');
      if (!card) return;

      const visitorName = card.querySelector('div[style*="font-weight: 800"]')?.textContent || 'Visitor';

      if (target.classList.contains('btn-approve-card')) {
        card.remove();
        showToast(`Visitor pass for ${visitorName} approved!`, 'success');
      } else if (target.classList.contains('btn-reject-card')) {
        card.remove();
        showToast(`Visitor pass for ${visitorName} rejected. Host notified.`, 'danger');
      }
    });
  }

});


