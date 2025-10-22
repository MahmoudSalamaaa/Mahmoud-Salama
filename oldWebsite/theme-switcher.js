
(function(){
  const THEME_KEY = "cto_theme";
  const themes = ["ocean","sunset","forest","midnight"];

  function applyTheme(theme) {
    const html = document.documentElement;
    if (!themes.includes(theme)) theme = themes[0];
    html.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch(e){}
    // update active UI state
    document.querySelectorAll('.theme-switcher .swatch').forEach(el => {
      el.classList.toggle('active', el.dataset.theme === theme);
    });
  }

  function currentTheme() {
    try { return localStorage.getItem(THEME_KEY) || "ocean"; } catch(e){ return "ocean"; }
  }

  function ensureUI() {
    if (document.querySelector('.theme-switcher')) return;
    const wrap = document.createElement('div');
    wrap.className = 'theme-switcher';
    wrap.innerHTML = `
      <span class="label">Theme</span>
      <button class="swatch" data-theme="ocean" aria-label="Ocean theme"><span class="sr">Ocean</span></button>
      <button class="swatch" data-theme="sunset" aria-label="Sunset theme"><span class="sr">Sunset</span></button>
      <button class="swatch" data-theme="forest" aria-label="Forest theme"><span class="sr">Forest</span></button>
      <button class="swatch" data-theme="midnight" aria-label="Midnight theme"><span class="sr">Midnight</span></button>
    `;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.swatch');
      if (!btn) return;
      applyTheme(btn.dataset.theme);
    });
  }

  // Init ASAP
  document.addEventListener('DOMContentLoaded', function(){
    ensureUI();
    applyTheme(currentTheme());
  });

  // In case script is injected late:
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    ensureUI();
    applyTheme(currentTheme());
  }
})();
