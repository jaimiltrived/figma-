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
     6. Helper Utilities (Toast Notification System)
     ========================================================================== */
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'danger') icon = '🔴';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

});
