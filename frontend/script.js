window.Careerly = (function () {
  // --- Configurations ---
  const config = {
    theme: window.CareerlyTheme.getTheme(),
    activePage: window.location.pathname.split('/').pop() || 'index.html'
  };

  const icons = {
    sun: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>`,
    moon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`
  };

  // --- Core Logic ---

  function applyTheme(theme) {
    config.theme = theme;
    
    // Centralized theme logic handles classes and CSS variables
    window.CareerlyTheme.applyVariables(theme);
    
    const colors = window.CareerlyTheme.themeColors[theme];
    const isDark = theme === 'dark';

    // 3. Update Body Directly (for non-CSS var fallbacks)
    document.body.style.backgroundColor = colors.background;
    document.body.style.color = colors.text;

    // 4. Update Toggle Buttons
    const toggles = [
      document.getElementById('dark-mode-toggle'),
      document.getElementById('dark-mode-toggle-mobile'),
      document.getElementById('dark-mode-toggle-mobile-menu')
    ];

    toggles.forEach(btn => {
      if (btn) {
        btn.innerHTML = isDark ? icons.sun : icons.moon;
        // Standardize toggle button appearance
        if (isDark) {
          btn.classList.add('bg-slate-700', 'text-slate-200');
          btn.classList.remove('bg-slate-200', 'text-slate-800', 'bg-[var(--color-surface)]', 'text-[var(--color-text)]');
        } else {
          btn.classList.add('bg-slate-200', 'text-slate-800');
          btn.classList.remove('bg-slate-700', 'text-slate-200', 'bg-[var(--color-surface)]', 'text-[var(--color-text)]');
        }
      }
    });

    // 5. Update Navbar Background specifically for mobile menu backdrop blur consistency
    const navbar = document.getElementById('navbar');
    if (navbar) {
      navbar.style.backgroundColor = isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(249, 250, 251, 0.8)';
    }

    localStorage.setItem('theme', theme);
  }

  function initHeader() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.onclick = () => mobileMenu.classList.toggle('hidden');
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.onclick = () => mobileMenu.classList.add('hidden');
      });
    }

    // Active Link Highlighting
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === config.activePage) {
        link.classList.add('active-link');
        link.classList.remove('text-slate-500', 'dark:text-slate-400', 'font-medium');
        link.classList.add('text-[var(--color-text)]', 'font-semibold');
      } else {
        link.classList.remove('active-link', 'font-semibold', 'text-[var(--color-text)]');
        link.classList.add('text-slate-500', 'dark:text-slate-400', 'font-medium');
      }
    });

    // Mobile Menu Active Link Highlighting
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu a');
    mobileMenuLinks.forEach(link => {
      const href = link.getAttribute('href');
      // Ensure we don't accidentally override the stylings for the CTA button elements inside the mobile nav
      if (href && !link.classList.contains('bg-[#2563eb]')) {
        // Remove strictly hardcoded green active styling that overrides our standard text variable
        link.classList.remove('text-[#10b981]');

        if (href === config.activePage) {
          link.classList.remove('text-slate-500', 'dark:text-slate-400', 'font-medium');
          link.classList.add('text-[var(--color-text)]', 'font-semibold', 'no-underline', 'outline-none');
        } else {
          link.classList.remove('text-[var(--color-text)]', 'font-semibold', 'no-underline', 'outline-none');
          link.classList.add('text-slate-500', 'dark:text-slate-400', 'font-medium');
        }
      }
    });

    // Toggle Buttons
    ['dark-mode-toggle', 'dark-mode-toggle-mobile', 'dark-mode-toggle-mobile-menu'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.onclick = () => applyTheme(config.theme === 'dark' ? 'light' : 'dark');
      }
    });
  }

  function initScrollIndicator() {
    const scrollIndicator = document.getElementById('scroll-indicator');
    if (!scrollIndicator) return;

    function updateScroll() {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollTotal <= 0) {
        scrollIndicator.style.width = '0%';
        return;
      }
      const scrolled = (window.scrollY / scrollTotal) * 100;
      scrollIndicator.style.width = `${Math.min(100, Math.max(0, scrolled))}%`;
    }

    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });
    updateScroll();
  }

  function initCounters() {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
          const el = entry.target;
          const target = parseInt(el.dataset.target || '0');
          const suffix = el.dataset.suffix || '';
          el.classList.add('animated');

          let current = 0;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          const interval = duration / steps;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              el.textContent = target.toLocaleString() + suffix;
              clearInterval(timer);
            } else {
              el.textContent = Math.floor(current).toLocaleString() + suffix;
            }
          }, interval);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.counter').forEach(c => counterObserver.observe(c));
  }

  function injectAuthModal() {
    if (document.getElementById('auth-modal')) return;

    const modalHTML = `
    <div id="auth-modal" class="fixed inset-0 z-[100] hidden items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      <div class="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-95 opacity-0" id="auth-modal-content">
        <div class="relative p-8">
          <button id="close-auth-modal" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div id="login-form-container">
            <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
            <p class="text-slate-500 dark:text-slate-400 mb-8">Login to access the AI Counselor</p>
            <form id="login-form" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input type="email" required class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input type="password" required class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all">
              </div>
              <button type="submit" class="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all">Login Now</button>
            </form>
            <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account? <button id="show-signup" class="text-primary font-semibold hover:underline">Sign up for free</button>
            </p>
          </div>

          <div id="signup-form-container" class="hidden">
            <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
            <p class="text-slate-500 dark:text-slate-400 mb-8">Join Careerly to start your journey</p>
            <form id="signup-form" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input type="text" required class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input type="email" required class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input type="password" required class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all">
              </div>
              <button type="submit" class="w-full py-4 bg-secondary text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all">Create Account</button>
            </form>
            <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account? <button id="show-login" class="text-primary font-semibold hover:underline">Login here</button>
            </p>
          </div>
        </div>
      </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Modal Event Listeners
    const modal = document.getElementById('auth-modal');
    const content = document.getElementById('auth-modal-content');
    const closeBtn = document.getElementById('close-auth-modal');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');

    const toggleForm = (toSignup) => {
      document.getElementById('login-form-container').classList.toggle('hidden', toSignup);
      document.getElementById('signup-form-container').classList.toggle('hidden', !toSignup);
    };

    const closeModal = () => {
      content.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }, 300);
    };

    window.showCareerlyAuthModal = (isSignup = false) => {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      toggleForm(isSignup);
      setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
      }, 10);
    };

    closeBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    showSignup.onclick = () => toggleForm(true);
    showLogin.onclick = () => toggleForm(false);

    loginForm.onsubmit = (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('input[type="email"]').value;
      const pass = loginForm.querySelector('input[type="password"]').value;
      if (window.CareerlyAuth.login(email, pass)) {
        window.location.reload();
      }
    };

    signupForm.onsubmit = (e) => {
      e.preventDefault();
      const name = signupForm.querySelector('input[type="text"]').value;
      const email = signupForm.querySelector('input[type="email"]').value;
      const pass = signupForm.querySelector('input[type="password"]').value;
      if (window.CareerlyAuth.signup(name, email, pass)) {
        window.location.reload();
      }
    };
  }

  function interceptProtectedRoutes() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      // Intercept any link pointing to ai-counselor.html
      if (href && (href.includes('ai-counselor.html') || link.textContent.includes('AI Counselor'))) {
        if (!window.CareerlyAuth.isLoggedIn()) {
          e.preventDefault();
          window.showCareerlyAuthModal(false);
        }
      }
    });
  }

  function updateAuthUI() {
    const isLoggedIn = window.CareerlyAuth.isLoggedIn();
    const navCta = document.getElementById('nav-cta');
    const user = window.CareerlyAuth.getUser();

    if (isLoggedIn && navCta) {
      navCta.innerHTML = 'Sign Out';
      navCta.href = '#';
      navCta.classList.remove('bg-primary', 'bg-[#2563eb]', 'hover:bg-gradient-to-r', 'shadow-[#2563eb]/25');
      navCta.classList.add('bg-blue-600', 'hover:bg-gradient-to-r', 'hover:from-blue-600', 'hover:to-[#10b981]', 'transition-all', 'duration-300');
      navCta.onclick = (e) => {
        e.preventDefault();
        window.CareerlyAuth.logout();
      };

      // Desktop Greeting Placement (Right Side)
      const actionContainer = document.querySelector('nav .hidden.lg\\:flex.items-center.gap-4');
      if (actionContainer && user && !document.getElementById('user-greeting-desktop')) {
        const greeting = document.createElement('div');
        greeting.id = 'user-greeting-desktop';
        greeting.className = 'mr-4 hidden xl:flex items-center gap-2 border-r pr-4 border-slate-200 dark:border-slate-700';
        greeting.innerHTML = `<span class="text-xs text-slate-500">Welcome,</span><span class="text-sm font-bold text-[var(--color-text)] truncate max-w-[120px]">${user.name}</span>`;
        actionContainer.prepend(greeting);
      }

      // Mobile Greeting Placement (Mobile Menu)
      const mobileMenuTop = document.querySelector('#mobile-menu .px-6.py-6');
      if (mobileMenuTop && user && !document.getElementById('user-greeting-mobile')) {
        const mobileGreeting = document.createElement('div');
        mobileGreeting.id = 'user-greeting-mobile';
        mobileGreeting.className = 'pb-4 mb-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3';
        mobileGreeting.innerHTML = `
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            ${user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p class="text-xs text-slate-500">Authenticated as</p>
            <p class="text-sm font-bold text-[var(--color-text)]">${user.name}</p>
          </div>
        `;
        mobileMenuTop.prepend(mobileGreeting);
      }
    }
  }

  function init() {
    // Ensure Auth is available
    if (!window.CareerlyAuth) {
      console.error('CareerlyAuth not found. Make sure auth.js is loaded.');
    }

    applyTheme(config.theme);
    initHeader();
    initScrollIndicator();
    initCounters();
    injectAuthModal();
    interceptProtectedRoutes();
    updateAuthUI();

    // Page specific logic
    if (config.activePage === 'index.html') {
    }
  }

  // Export public methods
  return {
    init: init,
    applyTheme: applyTheme,
    showAuthModal: (isSignup) => window.showCareerlyAuthModal(isSignup)
  };
})();


// Automatic Trigger
document.addEventListener('DOMContentLoaded', Careerly.init);