(() => {
  const root = document.documentElement;
  const body = document.body;
  const progress = document.querySelector('.reading-progress');
  const navButton = document.querySelector('[data-nav-toggle]');
  const navMenu = document.querySelector('[data-nav-menu]');
  const storage = {
    get(key) { try { return window.localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { window.localStorage.setItem(key, value); } catch (_) {} }
  };
  const savedTheme = storage.get('ms-article-theme');
  if (savedTheme === 'dark') body.classList.add('dark');

  document.querySelectorAll('[data-theme]').forEach((button) => {
    button.addEventListener('click', () => {
      body.classList.toggle('dark');
      storage.set('ms-article-theme', body.classList.contains('dark') ? 'dark' : 'light');
    });
  });

  const closeMenu = () => {
    if (!navButton || !navMenu) return;
    navButton.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('open');
  };
  if (navButton && navMenu) {
    navButton.addEventListener('click', () => {
      const open = navButton.getAttribute('aria-expanded') === 'true';
      navButton.setAttribute('aria-expanded', String(!open));
      navMenu.classList.toggle('open', !open);
    });
    navMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
    document.addEventListener('click', (event) => {
      if (!navMenu.contains(event.target) && !navButton.contains(event.target)) closeMenu();
    });
  }

  document.querySelectorAll('[data-print]').forEach((button) => {
    button.addEventListener('click', () => window.print());
  });

  const updateProgress = () => {
    if (!progress) return;
    const available = root.scrollHeight - window.innerHeight;
    progress.style.width = `${available > 0 ? Math.min(100, (window.scrollY / available) * 100) : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
})();
