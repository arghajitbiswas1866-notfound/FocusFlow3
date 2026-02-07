// Shared theme switcher
(function(){
  const THEME_KEY = 'theme'; // 'dark' or 'light'

  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      btn.textContent = theme === 'light' ? '☀️' : '🌙';
    });
  }

  function init(){
    const saved = localStorage.getItem(THEME_KEY);
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    const initial = saved || (prefersLight ? 'light' : 'dark');
    applyTheme(initial);

    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('[data-theme-toggle]');
      if(!toggle) return;
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });

    // Update if system preference changes, but only when user hasn't explicitly saved a choice
    if(!saved && window.matchMedia){
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (ev) => {
        applyTheme(ev.matches ? 'light' : 'dark');
      });
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();